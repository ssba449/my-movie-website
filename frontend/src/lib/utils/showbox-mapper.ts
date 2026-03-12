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

export function mapShowboxToContent(items: any[], typeFallback: "movie" | "series" = "movie"): ContentItem[] {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => {
        // Treat generic default banners as nonexistent so we can reliably fall back to high quality posters
        const hasValidBanner = item.banner_mini && !item.banner_mini.includes("poster_default2.png");

        return {
            id: item.id?.toString(),
            title: item.title || item.display_title || "Unknown Title",
            posterUrl: item.poster || item.poster_min || item.poster_org,
            backdropUrl: (hasValidBanner ? item.banner_mini : null) || item.poster_org || item.poster || item.poster_min,
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
