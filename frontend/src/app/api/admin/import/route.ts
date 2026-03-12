export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTMDBDetails, getTMDBSeasonDetails, getTMDBImageUrl } from "@/lib/services/tmdb";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Ideally, we would also verify if the user has an 'ADMIN' role here

        const body = await req.json();
        const { tmdbId, type } = body;

        if (!tmdbId || !type) {
            return new NextResponse("Missing tmdbId or type", { status: 400 });
        }

        // 1. Fetch from TMDB
        const details = await getTMDBDetails(tmdbId, type as "movie" | "tv");

        if (!details || details.success === false) {
            return new NextResponse("TMDB lookup failed", { status: 404 });
        }

        const isMovie = type === "movie";

        // Extract Top 5 Cast Members
        const castList = details.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [];

        // Extract Director
        const director = details.credits?.crew?.find((c: any) => c.job === "Director")?.name || null;

        // Extract Genres
        const genres = details.genres?.map((g: any) => g.name) || [];

        // Determine IDs avoiding duplicates
        const imdbId = details.imdb_id || null;

        const commonData = {
            title: details.title || details.name,
            description: details.overview,
            poster: getTMDBImageUrl(details.poster_path, "w500"),
            backdrop: getTMDBImageUrl(details.backdrop_path, "original"),
            tmdbId: parseInt(tmdbId.toString(), 10),
            genre: genres.join(','),
            releaseYear: (details.release_date || details.first_air_date || "").substring(0, 4),
        };

        // 2. Save Content to Database
        let content;

        if (isMovie) {
            const movieData = {
                ...commonData,
                duration: details.runtime || 0,
            };
            content = await db.movie.upsert({
                where: { tmdbId: commonData.tmdbId },
                update: movieData,
                create: movieData,
            });
        } else {
            content = await db.show.upsert({
                where: { tmdbId: commonData.tmdbId },
                update: commonData,
                create: commonData,
            });

            // 3. For TV Series, import Episodes (Season 1 for demo purposes)
            if (details.seasons?.length > 0) {
                // Find season 1 (ignore season 0 which are usually specials)
                const season1 = details.seasons.find((s: any) => s.season_number === 1);

                if (season1) {
                    const dbSeason = await db.season.create({
                        data: {
                            showId: content.id,
                            seasonNumber: 1,
                        }
                    });

                    const s1Details = await getTMDBSeasonDetails(tmdbId, 1);

                    if (s1Details.episodes) {
                        for (const ep of s1Details.episodes) {
                            await db.episode.create({
                                data: {
                                    seasonId: dbSeason.id,
                                    episodeNumber: ep.episode_number,
                                    title: ep.name,
                                    description: ep.overview,
                                    duration: ep.runtime * 60, // save in seconds
                                    thumbnail: getTMDBImageUrl(ep.still_path, "w500"),
                                    streamUrl: "https://cdn.plyr.io/static/blank.mp4", // Dummy Video fallback
                                }
                            })
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true, content });

    } catch (error) {
        console.error("[IMPORT_ERROR]", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
