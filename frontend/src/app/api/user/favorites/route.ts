import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getNormalizedShowboxContent } from "@/lib/services/showbox";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = (session.user as any).id;
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { contentId, type, isFavorite } = await req.json();

        if (!contentId || !type) {
            return new NextResponse("Missing contentId or type", { status: 400 });
        }

        const isMovie = type === "movie";
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(contentId);

        // If it's not a favorite yet (we are adding it), ensure the content exists in our DB
        let finalContentId = contentId;
        if (!isFavorite) {
            if (isMovie) {
                let movie = await db.movie.findUnique({ where: { id: contentId } });
                if (!movie && !isUUID) {
                    // Try to auto-import stub from Showbox
                    const metadata = await getNormalizedShowboxContent(contentId, "movie");
                    if (metadata) {
                        movie = await db.movie.create({
                            data: {
                                id: contentId,
                                title: metadata.title,
                                poster: metadata.posterUrl,
                                backdrop: metadata.backdropUrl || metadata.posterUrl,
                                releaseYear: metadata.releaseYear,
                                duration: metadata.runtime,
                                description: metadata.description || "",
                                genre: metadata.genre || ""
                            }
                        });
                    }
                }
                if (!movie) return new NextResponse("Could not resolve movie", { status: 404 });
            } else {
                let show = await db.show.findUnique({ where: { id: contentId } });
                if (!show && !isUUID) {
                    // Try to auto-import stub from Showbox
                    const metadata = await getNormalizedShowboxContent(contentId, "series");
                    if (metadata) {
                        show = await db.show.create({
                            data: {
                                id: contentId,
                                title: metadata.title,
                                poster: metadata.posterUrl,
                                backdrop: metadata.backdropUrl || metadata.posterUrl,
                                releaseYear: metadata.releaseYear,
                                description: metadata.description || "",
                                genre: metadata.genre || ""
                            }
                        });
                    }
                }
                if (!show) return new NextResponse("Could not resolve show", { status: 404 });
            }
        }

        if (isFavorite) {
            // Remove from watchlist
            await db.watchlist.deleteMany({
                where: {
                    userId: userId,
                    ...(isMovie ? { movieId: finalContentId } : { showId: finalContentId })
                }
            });
        } else {
            // Add to watchlist
            await db.watchlist.create({
                data: {
                    userId: userId,
                    ...(isMovie ? { movieId: finalContentId } : { showId: finalContentId })
                }
            });
        }

        return NextResponse.json({ success: true, isFavorite: !isFavorite });
    } catch (error) {
        console.error("[FAVORITES_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
