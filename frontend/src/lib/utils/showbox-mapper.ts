export interface ContentItem {
    id: string;
    title: string;
    posterUrl: string | null;
    backdropUrl: string | null;
    imdbRating?: string;
    year?: string;
    genre: string | null;
    type: "movie" | "series";
    description: string;
    isPremium?: boolean;
    contentRating?: string | null;
}

const ensureAbsoluteUrl = (url: string | null | undefined): string | null => {
    if (!url || url.includes("poster_default2.png")) return null;
    if (url.startsWith("http://")) return url.replace("http://", "https://");
    if (url.startsWith("https://")) return url;
    if (url.startsWith("//")) return `https:${url}`;
    if (url.startsWith("/")) return `https://www.showbox.com${url}`; // Placeholder domain if relative
    return url;
};

export function mapShowboxToContent(items: any[], typeFallback: "movie" | "series" = "movie"): ContentItem[] {
    if (!items || !Array.isArray(items)) return [];

    // Default fallback image
    const PLACEHOLDER = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=220&auto=format&fit=crop";

    return items.map((item) => {
        const rawPoster = item.poster || item.poster_min || item.poster_org;
        const rawBanner = item.banner_mini || item.poster_org || item.poster || item.poster_min;

        const posterUrl = ensureAbsoluteUrl(rawPoster) || PLACEHOLDER;
        const backdropUrl = ensureAbsoluteUrl(rawBanner) || posterUrl;

        return {
            id: item.id?.toString(),
            title: item.title || item.display_title || "Unknown Title",
            posterUrl,
            backdropUrl,
            imdbRating: item.rating || (item.imdb_rating ? item.imdb_rating.toString() : undefined),
            year: item.year ? item.year.toString() : undefined,
            genre: item.genre,
            type: item.box_type === 1 ? "movie" : item.box_type === 2 ? "series" : typeFallback,
            description: item.description || item.content || "",
            isPremium: item.isPremium || false,
            contentRating: item.contentRating || null
        };
    });
}
