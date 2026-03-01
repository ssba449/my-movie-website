import { db } from "@/lib/db";

export async function getTrendingContent(limit = 10) {
    return await db.content.findMany({
        where: { status: "available" },
        orderBy: { imdbRating: "desc" }, // TMDB rating maps here
        take: limit,
    });
}

export async function getPopularContent(type: "movie" | "series", limit = 15) {
    return await db.content.findMany({
        where: { status: "available", type },
        orderBy: { createdAt: "desc" }, // Just a different sort for popular
        take: limit,
    });
}

export async function getTopRatedContent(limit = 15) {
    return await db.content.findMany({
        where: { status: "available" },
        orderBy: { imdbRating: "desc" },
        take: limit,
    });
}

export async function getNewReleases(limit = 15) {
    return await db.content.findMany({
        where: { status: "available" },
        orderBy: { releaseYear: "desc" },
        take: limit,
    });
}

export async function getContentByCategory(type: "movie" | "series", limit = 10) {
    return await db.content.findMany({
        where: { status: "available", type },
        orderBy: { imdbRating: "desc" },
        take: limit,
    });
}

export async function getAllContentByCategory(type: "movie" | "series", limit = 200) {
    return await db.content.findMany({
        where: { status: "available", type },
        orderBy: { imdbRating: "desc" },
        take: limit,
    });
}

export async function getContentById(id: string) {
    return await db.content.findUnique({
        where: { id },
        include: {
            episodes: {
                orderBy: [
                    { seasonNumber: "asc" },
                    { episodeNumber: "asc" },
                ]
            }
        }
    });
}

export async function searchContent(query: string, limit = 20) {
    return await db.content.findMany({
        where: {
            status: "available",
            OR: [
                { title: { contains: query } },
                { titleAr: { contains: query } },
                { description: { contains: query } },
                { cast: { contains: query } },
                { genre: { contains: query } }
            ]
        },
        take: limit,
    });
}
