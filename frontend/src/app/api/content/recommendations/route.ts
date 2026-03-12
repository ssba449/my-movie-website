import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getShowboxTrending } from "@/lib/services/showbox";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        if (!userId) {
            // Unauthenticated: Fallback to global trending
            const trending = await getShowboxTrending("all", 10);
            return NextResponse.json({
                title: "Trending Now",
                items: (trending?.list || trending).map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    posterUrl: m.poster,
                    type: m.type === "movie" ? "movie" : "series"
                }))
            });
        }

        // 1. Get user watch history to find preferred genres
        const history = await db.watchHistory.findMany({
            where: { userId },
            include: {
                movie: true,
                episode: { include: { season: { include: { show: true } } } }
            },
            orderBy: { timestamp: "desc" },
            take: 20
        });

        if (history.length === 0) {
            const trending = await getShowboxTrending("all", 10);
            return NextResponse.json({
                title: "Recommended for You",
                items: (trending?.list || trending).map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    posterUrl: m.poster,
                    type: m.type === "movie" ? "movie" : "series"
                }))
            });
        }

        // 2. Count genres
        const genreCounts: { [key: string]: number } = {};
        const watchedIds = new Set<string>();

        history.forEach(h => {
            const item = h.movie || h.episode?.season.show;
            if (!item) return;
            watchedIds.add(item.id);

            if (item.genre) {
                const genres = item.genre.split(",").map(g => g.trim());
                genres.forEach(g => {
                    genreCounts[g] = (genreCounts[g] || 0) + 1;
                });
            }
        });

        // 3. Find top genre
        const topGenre = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0];

        if (!topGenre) {
            const trending = await getShowboxTrending("all", 10);
            return NextResponse.json({ title: "Recommended for You", items: trending });
        }

        // 4. Query DB for movies/shows in that genre that haven't been watched
        const recommendedMovies = await db.movie.findMany({
            where: {
                genre: { contains: topGenre },
                NOT: { id: { in: Array.from(watchedIds) } }
            },
            take: 5
        });

        const recommendedShows = await db.show.findMany({
            where: {
                genre: { contains: topGenre },
                NOT: { id: { in: Array.from(watchedIds) } }
            },
            take: 5
        });

        const results = [
            ...recommendedMovies.map(m => ({ ...m, type: "movie" })),
            ...recommendedShows.map(s => ({ ...s, type: "series" }))
        ].map(item => ({
            id: item.id,
            title: item.title,
            posterUrl: item.poster,
            type: item.type
        }));

        // 5. If DB results are low, fill with trending
        if (results.length < 6) {
            const trending = await getShowboxTrending("all", 10);
            const trendingItems = (trending?.list || trending).filter((t: any) => !watchedIds.has(t.id));
            results.push(...trendingItems.slice(0, 10 - results.length).map((m: any) => ({
                id: m.id,
                title: m.title,
                posterUrl: m.poster,
                type: m.type === "movie" ? "movie" : "series"
            })));
        }

        return NextResponse.json({
            title: `More like ${topGenre}`,
            items: results
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
