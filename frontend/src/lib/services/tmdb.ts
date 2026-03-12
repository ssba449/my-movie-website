const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const defaultHeaders = {
    accept: "application/json",
};

export async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
    if (!TMDB_API_KEY) {
        throw new Error("TMDB_API_KEY is missing in environment variables.");
    }

    // TMDB v3 uses api_key in query string, not Bearer tokens
    const mergedParams = {
        api_key: TMDB_API_KEY,
        ...params
    };

    const queryParams = new URLSearchParams(mergedParams).toString();
    const url = `${TMDB_BASE_URL}${endpoint}?${queryParams}`;

    const res = await fetch(url, { headers: defaultHeaders, next: { revalidate: 3600 } });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("TMDB Error:", errorText);
        throw new Error(`TMDB fetching failed: ${res.statusText}`);
    }

    return res.json();
}

export async function searchTMDB(query: string) {
    // Search across movies and tv shows
    const res = await fetchTMDB("/search/multi", { query, include_adult: "false" });
    return res.results.filter((item: any) => item.media_type === "movie" || item.media_type === "tv");
}

export async function getTrendingTMDB(type: "movie" | "tv" = "movie", timeWindow: "day" | "week" = "week") {
    const res = await fetchTMDB(`/trending/${type}/${timeWindow}`);
    return res.results;
}

export async function getTMDBDetails(id: number | string, type: "movie" | "tv") {
    // Append credits to get the cast in one request
    return await fetchTMDB(`/${type}/${id}`, { append_to_response: "credits" });
}

export async function getTMDBSeasonDetails(tvId: number | string, seasonNumber: number) {
    return await fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

// Helpers to format images
export const getTMDBImageUrl = (path: string | null, size: "original" | "w500" = "original") => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
};
