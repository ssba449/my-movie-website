import { db } from "../db";

export const SHOWBOX_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

export async function getStream(id: string, type: 1 | 2): Promise<{ fid: number; shareKey: string; fileName?: string; fileSize?: string } | null> {
    try {
        const res = await fetch(`${SHOWBOX_API_URL}/febbox/stream?id=${id}&type=${type}`, { cache: "no-store" });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}


async function safeFetchJson(url: string) {
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Fetch failed");
        const rawText = await res.text();

        // Showbox sometimes prepends/appends PHP debug paths to the JSON response
        const jsonStart = rawText.indexOf('{');
        const jsonStartArray = rawText.indexOf('[');
        const firstValidStart = jsonStart >= 0 && jsonStartArray >= 0
            ? Math.min(jsonStart, jsonStartArray)
            : Math.max(jsonStart, jsonStartArray);

        if (firstValidStart === -1) {
            console.error("No valid JSON found in response:", rawText.substring(0, 100));
            return null;
        }

        // Find the matching end
        const jsonEnd = rawText.lastIndexOf('}');
        const jsonEndArray = rawText.lastIndexOf(']');
        const lastValidEnd = Math.max(jsonEnd, jsonEndArray);

        const cleanJsonStr = rawText.substring(firstValidStart, lastValidEnd + 1);
        return JSON.parse(cleanJsonStr);
    } catch (e) {
        console.error("Showbox Fetch Error:", e);
        return null;
    }
}

export async function searchShowbox(query: string, type: "movie" | "tv" | "all" = "all", page: number = 1, limit: number = 20) {
    if (!query) return { list: [] };

    const queryParam = query ? `&title=${encodeURIComponent(query)}` : "";
    const lowerQuery = query.toLowerCase().trim();

    // 1. Fetch from Local Database
    let dbMovies: any[] = [];
    let dbShows: any[] = [];

    if (type === "movie" || type === "all") {
        dbMovies = await db.movie.findMany({
            where: { title: { contains: query } },
            take: limit,
        });
    }

    if (type === "tv" || type === "all") {
        dbShows = await db.show.findMany({
            where: { title: { contains: query } },
            take: limit,
        });
    }

    // Convert DB items to Showbox-like format for the mapper
    const localResults = [
        ...dbMovies.map(m => ({
            ...m,
            id: m.id,
            box_type: 1,
            poster: m.poster,
            banner_mini: m.backdrop, // Map backdrop to banner_mini for the mapper
            rating: m.imdbRating || "0",
            year: m.releaseYear,
        })),
        ...dbShows.map(s => ({
            ...s,
            id: s.id,
            box_type: 2,
            poster: s.poster,
            banner_mini: s.backdrop,
            rating: s.imdbRating || "0",
            year: s.releaseYear,
        }))
    ];

    // 2. Fetch from External API
    const data = await safeFetchJson(`${SHOWBOX_API_URL}/search?type=${type}&page=${page}&pagelimit=${limit}${queryParam}`);
    const apiResults = data?.list || (Array.isArray(data) ? data : []);

    // 3. Deduplicate by TMDB ID
    const localTmdbIds = new Set(
        [...dbMovies, ...dbShows]
            .map(item => item.tmdbId?.toString())
            .filter(Boolean)
    );

    const filteredApiResults = apiResults.filter((item: any) => {
        const tmdbId = (item.tmdb_id || item.mb_id)?.toString();
        return !tmdbId || !localTmdbIds.has(tmdbId);
    });

    // 4. Combine and Prioritize
    const combined = [...localResults, ...filteredApiResults];

    // Intelligent Sorting
    const sorted = combined.sort((a, b) => {
        const titleA = (a.title || a.display_title || "").toLowerCase().trim();
        const titleB = (b.title || b.display_title || "").toLowerCase().trim();

        // Priority 1: Exact matches
        const exactA = titleA === lowerQuery;
        const exactB = titleB === lowerQuery;
        if (exactA && !exactB) return -1;
        if (!exactA && exactB) return 1;

        // Priority 2: Local DB items
        const isLocalA = typeof a.id === "string" && a.id.length > 20; // UUID-like
        const isLocalB = typeof b.id === "string" && b.id.length > 20;
        if (isLocalA && !isLocalB) return -1;
        if (!isLocalA && isLocalB) return 1;

        // Priority 3: Starts with query
        const startsA = titleA.startsWith(lowerQuery);
        const startsB = titleB.startsWith(lowerQuery);
        if (startsA && !startsB) return -1;
        if (!startsA && startsB) return 1;

        return 0;
    });

    return {
        list: sorted.slice(0, limit)
    };
}

export async function getShowboxTrending(type: "movie" | "tv" | "all" = "all", limit: number = 20) {
    // Showbox Search5 fails if keyword is empty. Search current year to simulate a trending list reliably.
    const year = new Date().getFullYear().toString();
    return await searchShowbox(year, type, 1, limit);
}

// ── Categorized content fetchers ──────────────────────────────────

export async function getShowboxHomeList() {
    const data = await safeFetchJson(`${SHOWBOX_API_URL}/home`);
    return data || { list: [] };
}

export async function getShowboxList(type: string = "movie", sort: string = "release_date", page: number = 1, limit: number = 20) {
    const data = await safeFetchJson(`${SHOWBOX_API_URL}/list?type=${type}&sort=${sort}&page=${page}&pagelimit=${limit}`);
    return data || { list: [] };
}

export async function getShowboxTrendingMovies(limit: number = 20) {
    // Trending movies — search current year for movies only
    const year = "2024"; // Use a slightly older year to ensure abundant data
    return await searchShowbox(year, "movie", 1, limit);
}

export async function getShowboxTrendingTVShows(limit: number = 20) {
    // Trending TV shows — search current year for TV only
    const year = "2024";
    return await searchShowbox(year, "tv", 1, limit);
}

export async function getShowboxHotTVThisWeek(limit: number = 20) {
    // Hot TV this week — popular TV keywords
    return await searchShowbox("the", "tv", 1, limit);
}

export async function getShowboxLatestTV(limit: number = 20) {
    // Latest TV updates — use recent year on page 1
    return await searchShowbox("2024", "tv", 1, limit);
}

export async function getShowboxIMDBTopMovies(limit: number = 20) {
    // IMDB top-rated movies — search popular critically-acclaimed keywords
    return await searchShowbox("the", "movie", 1, limit);
}

export async function getShowboxMovieDetails(id: string) {
    return await safeFetchJson(`${SHOWBOX_API_URL}/movie/${id}`);
}

export async function getShowboxShowDetails(id: string) {
    return await safeFetchJson(`${SHOWBOX_API_URL}/show/${id}`);
}

export async function getNormalizedShowboxContent(id: string, typeHint?: "movie" | "series" | "tv") {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
        // Try fetching from database
        const dbMovie = await db.movie.findUnique({ where: { id } }) as any;
        if (dbMovie) {
            return {
                id: dbMovie.id,
                type: "movie",
                title: dbMovie.title,
                description: dbMovie.description || "No description available.",
                posterUrl: dbMovie.poster,
                backdropUrl: dbMovie.backdrop || dbMovie.poster,
                releaseYear: dbMovie.releaseYear || "",
                runtime: dbMovie.duration || 0,
                imdbRating: 0,
                genre: dbMovie.genre || "Entertainment",
                episodes: undefined,
                cast: "",
                status: "available",
                trailerUrl: dbMovie.trailerUrl || "",
                tmdbId: dbMovie.tmdbId,
                isPremium: dbMovie.isPremium,
                contentRating: dbMovie.contentRating,
                createdAt: dbMovie.createdAt,
                updatedAt: dbMovie.updatedAt
            };
        }

        const dbShow = await db.show.findUnique({ where: { id } }) as any;
        if (dbShow) {
            return {
                id: dbShow.id,
                type: "series",
                title: dbShow.title,
                description: dbShow.description || "No description available.",
                posterUrl: dbShow.poster,
                backdropUrl: dbShow.backdrop || dbShow.poster,
                releaseYear: dbShow.releaseYear || "",
                runtime: 0,
                imdbRating: 0,
                genre: dbShow.genre || "Entertainment",
                episodes: [],
                cast: "",
                status: "available",
                trailerUrl: "",
                tmdbId: dbShow.tmdbId,
                isPremium: dbShow.isPremium,
                contentRating: dbShow.contentRating,
                createdAt: dbShow.createdAt,
                updatedAt: dbShow.updatedAt
            };
        }
    }

    let raw;
    let type: "movie" | "series" = "movie";

    const isTvHint = typeHint === "series" || typeHint === "tv";

    if (isTvHint) {
        // Safe to assume it's a series because of the hint, avoiding the movie overlap
        raw = await getShowboxShowDetails(id);
        type = "series";

        // Fallback just in case
        if (!raw || !raw.id) {
            raw = await getShowboxMovieDetails(id);
            type = "movie";
        }
    } else {
        // 1. Try movie first (default or explicit movie hint)
        raw = await getShowboxMovieDetails(id);
        type = "movie";

        // Movie check failed if id is missing, OR if the API explicitly tells us it's a TV series (box_type === 2)
        if (!raw || !raw.id || raw.box_type === 2) {
            raw = await getShowboxShowDetails(id);
            type = "series";
        }
    }

    if (!raw || !raw.id) return null;

    return {
        id: raw.id.toString(),
        type,
        title: raw.title || raw.display_title || "Unknown Title",
        description: raw.description || raw.plot || raw.content || "No description available.",
        posterUrl: raw.poster || raw.poster_min,
        backdropUrl: raw.banner_mini || raw.poster_min || raw.poster,
        releaseYear: (raw.year || raw.released || "").toString().substring(0, 4),
        runtime: raw.runtime || 0,
        imdbRating: raw.rating || (raw.imdb_rating ? raw.imdb_rating.toString() : 0),
        genre: raw.genre || "Entertainment",
        episodes: type === "series" ? [] : undefined,
        cast: raw.cast || raw.actors || "",
        status: "available",
        trailerUrl: raw.trailer_url || "",
        tmdbId: raw.tmdb_id || raw.mb_id || null,
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

export async function getFebboxId(id: string, type: 1 | 2) {
    try {
        const res = await fetch(`${SHOWBOX_API_URL}/febbox/id?id=${id}&type=${type}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Get Febbox ID failed");
        return await res.json();
    } catch (e) {
        return { febBoxId: null };
    }
}

export async function getFebboxFiles(shareKey: string, parentId: string = "0") {
    try {
        const res = await fetch(`${SHOWBOX_API_URL}/febbox/files?shareKey=${shareKey}&parent_id=${parentId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Get Febbox Files failed");
        return await res.json();
    } catch (e) {
        return null;
    }
}

export async function getFebboxLinks(shareKey: string, fid: string) {
    try {
        const res = await fetch(`${SHOWBOX_API_URL}/febbox/links?shareKey=${shareKey}&fid=${fid}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Get Febbox Links failed");
        return await res.json();
    } catch (e) {
        return null;
    }
}

// Stream-server series endpoints
const STREAM_SERVER = process.env.NEXT_PUBLIC_STREAM_URL || "http://127.0.0.1:4000";

export async function getSeriesSeasons(showboxId: string): Promise<{ shareKey: string; seasons: any[]; hasDirectFiles: boolean } | null> {
    try {
        const res = await fetch(`${STREAM_SERVER}/api/series/seasons?id=${showboxId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Get series seasons failed");
        return await res.json();
    } catch (e) {
        console.error("getSeriesSeasons error:", e);
        return null;
    }
}

export async function getSeasonEpisodes(shareKey: string, seasonFid: string): Promise<{ episodes: any[] } | null> {
    try {
        const res = await fetch(`${STREAM_SERVER}/api/series/episodes?shareKey=${shareKey}&seasonFid=${seasonFid}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Get season episodes failed");
        return await res.json();
    } catch (e) {
        console.error("getSeasonEpisodes error:", e);
        return null;
    }
}

export async function playEpisode(shareKey: string, fid: string): Promise<{ stream: string; size?: string; fileName?: string } | null> {
    try {
        const res = await fetch(`${STREAM_SERVER}/api/play/episode?shareKey=${shareKey}&fid=${fid}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Play episode failed");
        return await res.json();
    } catch (e) {
        console.error("playEpisode error:", e);
        return null;
    }
}
