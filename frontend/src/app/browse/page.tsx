export const dynamic = 'force-dynamic';

import HeroBanner from "@/components/shared/HeroBanner";
import ContentRow from "@/components/home/ContentRow";
import {
    getShowboxTrending,
    getShowboxTrendingMovies,
    getShowboxTrendingTVShows,
    getShowboxHotTVThisWeek,
    getShowboxLatestTV,
    getShowboxIMDBTopMovies,
} from "@/lib/services/showbox";

// Helper to reliably map showbox raw objects to the standard ContentCard data shape
function mapShowboxToContent(items: any[], typeFallback: "movie" | "series" = "movie") {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => ({
        id: item.id?.toString(),
        title: item.title || item.display_title || "Unknown Title",
        posterUrl: item.poster || item.poster_min,
        backdropUrl: item.banner_mini || item.poster_min || item.poster,
        imdbRating: item.rating || (item.imdb_rating ? item.imdb_rating.toString() : undefined),
        year: item.year ? item.year.toString() : undefined,
        genre: item.genre,
        type: item.box_type === 1 ? "movie" : item.box_type === 2 ? "series" : typeFallback,
        description: item.description || item.content || ""
    }));
}

export default async function Browse() {

    const [
        rawTrendingAll,
        rawTrendingMovies,
        rawTrendingTVShows,
        rawHotTVThisWeek,
        rawLatestTV,
        rawIMDBMovies,
    ] = await Promise.all([
        getShowboxTrending("all", 20),
        getShowboxTrendingMovies(20),
        getShowboxTrendingTVShows(20),
        getShowboxHotTVThisWeek(20),
        getShowboxLatestTV(20),
        getShowboxIMDBTopMovies(20),
    ]);

    const trendingAll = mapShowboxToContent(rawTrendingAll?.list || rawTrendingAll);
    const trendingMovies = mapShowboxToContent(rawTrendingMovies?.list || rawTrendingMovies, "movie");
    const trendingTVShows = mapShowboxToContent(rawTrendingTVShows?.list || rawTrendingTVShows, "series");
    const hotTVThisWeek = mapShowboxToContent(rawHotTVThisWeek?.list || rawHotTVThisWeek, "series");
    const latestTV = mapShowboxToContent(rawLatestTV?.list || rawLatestTV, "series");
    const imdbMovies = mapShowboxToContent(rawIMDBMovies?.list || rawIMDBMovies, "movie");

    const imdbSorted = [...imdbMovies].sort((a, b) => {
        const rA = parseFloat(a.imdbRating) || 0;
        const rB = parseFloat(b.imdbRating) || 0;
        return rB - rA;
    });

    return (
        <div className="bg-transparent min-h-screen">
            {/* Featured Banner (Hero Carousel) */}
            <HeroBanner slides={trendingAll.slice(0, 5)} />

            <div className="pt-8 pb-32 space-y-4 relative z-20 -mt-24">
                {/* Trending with Movies / TV Shows toggle */}
                <ContentRow
                    title="🔥 Trending"
                    toggleOptions={[
                        { label: "Movies", items: trendingMovies, seeAllHref: "/movies" },
                        { label: "TV Shows", items: trendingTVShows, seeAllHref: "/series" },
                    ]}
                />

                {hotTVThisWeek.length > 0 && (
                    <ContentRow title="📺 This Week's Hot TVs" items={hotTVThisWeek} seeAllHref="/series" />
                )}

                {latestTV.length > 0 && (
                    <ContentRow title="🆕 Latest TV Updates" items={latestTV} seeAllHref="/series" />
                )}

                {imdbSorted.length > 0 && (
                    <ContentRow title="⭐ IMDB Rating Movies" items={imdbSorted} seeAllHref="/movies" />
                )}
            </div>
        </div>
    );
}
