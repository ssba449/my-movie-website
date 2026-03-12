export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTrendingTMDB, getTMDBDetails, getTMDBImageUrl } from "@/lib/services/tmdb";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { type } = body;

        if (!type || (type !== 'movie' && type !== 'tv')) {
            return new NextResponse("Missing or invalid type", { status: 400 });
        }

        // 1. Fetch Top 20 Trending from TMDB
        const trendingList = await getTrendingTMDB(type, "week");

        if (!trendingList || trendingList.length === 0) {
            return new NextResponse("Trending lookup failed", { status: 404 });
        }

        const isMovie = type === "movie";
        let successCount = 0;

        // 2. Iterate through each trending item
        for (const item of trendingList) {
            try {
                // Fetch full details to get cast/genre strings properly formatted for SQLite
                const details = await getTMDBDetails(item.id, type);
                if (!details || details.success === false) continue;

                const imdbId = details.imdb_id || null;
                const genres = details.genres?.map((g: any) => g.name) || [];
                const castList = details.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [];
                const director = details.credits?.crew?.find((c: any) => c.job === "Director")?.name || null;

                const commonData = {
                    title: details.title || details.name,
                    description: details.overview,
                    poster: getTMDBImageUrl(details.poster_path, "w500"),
                    backdrop: getTMDBImageUrl(details.backdrop_path, "original"),
                    tmdbId: parseInt(item.id.toString(), 10),
                    genre: genres.join(','),
                    releaseYear: (details.release_date || details.first_air_date || "").substring(0, 4),
                };

                if (isMovie) {
                    const movieData = {
                        ...commonData,
                        duration: details.runtime || 0,
                    };
                    await db.movie.upsert({
                        where: { tmdbId: commonData.tmdbId },
                        update: movieData,
                        create: movieData,
                    });
                } else {
                    await db.show.upsert({
                        where: { tmdbId: commonData.tmdbId },
                        update: commonData,
                        create: commonData,
                    });
                }

                successCount++;
            } catch (err) {
                console.error(`[BULK_ITEM_IMPORT_ERROR] TMDB ID ${item.id}:`, err);
                // Continue to next item even if one fails
            }
        }

        return NextResponse.json({ success: true, count: successCount });

    } catch (error) {
        console.error("[BULK_IMPORT_ERROR]", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
