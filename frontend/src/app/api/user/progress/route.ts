import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

        const { contentId, episodeId, positionSeconds, durationSeconds } = await req.json();

        if (!contentId || positionSeconds === undefined) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

        // We only track progress for content that exists in our database (it has a UUID)
        if (!isUUID(contentId)) {
            // For now, skip tracking for external Showbox content that isn't imported
            return NextResponse.json({ success: true, ignored: true, reason: "external_content" });
        }

        const isEpisode = !!episodeId && isUUID(episodeId);

        if (isEpisode) {
            // Verify episode exists
            const ep = await db.episode.findUnique({ where: { id: episodeId } });
            if (!ep) return new NextResponse("Episode not found", { status: 404 });

            await db.watchHistory.upsert({
                where: {
                    userId_episodeId: {
                        userId: userId,
                        episodeId: episodeId,
                    }
                },
                update: {
                    progress: positionSeconds,
                    timestamp: new Date(),
                },
                create: {
                    userId: userId,
                    episodeId: episodeId,
                    progress: positionSeconds,
                    timestamp: new Date(),
                }
            });
        } else {
            // Verify movie exists
            const movie = await db.movie.findUnique({ where: { id: contentId } });
            if (!movie) {
                // Could be a Show ID if they watched via "Series" title page - track it as a placeholder or ignore?
                // For now, if we can't find it as a movie, it's not trackable in this schema.
                return NextResponse.json({ success: true, ignored: true, reason: "content_not_in_db" });
            }

            await db.watchHistory.upsert({
                where: {
                    userId_movieId: {
                        userId: userId,
                        movieId: contentId,
                    }
                },
                update: {
                    progress: positionSeconds,
                    timestamp: new Date(),
                },
                create: {
                    userId: userId,
                    movieId: contentId,
                    progress: positionSeconds,
                    timestamp: new Date(),
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PROGRESS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
