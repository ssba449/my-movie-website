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

        // Common map between movie and tv types
        const mapData = {
            type: isMovie ? "movie" : "series",
            title: details.title || details.name,
            description: details.overview,
            posterUrl: getTMDBImageUrl(details.poster_path, "w500"),
            backdropUrl: getTMDBImageUrl(details.backdrop_path, "original"),
            imdbId: imdbId,
            tmdbId: parseInt(tmdbId.toString(), 10),
            imdbRating: details.vote_average ? parseFloat(details.vote_average.toFixed(1)) : null,
            genre: genres.join(','),
            language: details.original_language,
            releaseYear: (details.release_date || details.first_air_date || "").substring(0, 4),
            runtime: details.runtime || (details.episode_run_time ? details.episode_run_time[0] : null) || 0,
            director: director,
            cast: castList.join(','),
        };

        // 2. Save Content to Database
        let content;

        // Use ImdbID if it exists to prevent duplicates, otherwise fallback to creating it
        if (imdbId) {
            content = await db.content.upsert({
                where: { imdbId },
                update: mapData,
                create: { ...mapData, imdbId },
            });
        } else {
            // If no imdbId, just create it (edge case, usually they have one)
            content = await db.content.create({
                data: mapData
            });
        }

        // 3. For TV Series, import Episodes (Season 1 for demo purposes)
        if (!isMovie && details.seasons?.length > 0) {
            // Find season 1 (ignore season 0 which are usually specials)
            const season1 = details.seasons.find((s: any) => s.season_number === 1);

            if (season1) {
                const s1Details = await getTMDBSeasonDetails(tmdbId, 1);

                if (s1Details.episodes) {
                    for (const ep of s1Details.episodes) {
                        // In a real app we'd use upsert by unique criteria, but simple create works for demo if we wipe db
                        await db.episode.create({
                            data: {
                                contentId: content.id,
                                seasonNumber: ep.season_number,
                                episodeNumber: ep.episode_number,
                                title: ep.name,
                                description: ep.overview,
                                duration: ep.runtime * 60, // save in seconds
                                thumbnailUrl: getTMDBImageUrl(ep.still_path, "w500"),
                                videoUrl: "https://cdn.plyr.io/static/blank.mp4", // Dummy Video fallback
                            }
                        })
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
