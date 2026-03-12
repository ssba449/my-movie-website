export const dynamic = 'force-dynamic';

import HeroBanner from "@/components/shared/HeroBanner";
import FeaturesStrip from "@/components/home/FeaturesStrip";
import ContentRow from "@/components/home/ContentRow";
import RecommendationsRow from "@/components/home/RecommendationsRow";
import PricingSection from "@/components/home/PricingSection";
import {
  getShowboxTrending,
  getShowboxTrendingMovies,
  getShowboxTrendingTVShows,
  getShowboxHotTVThisWeek,
  getShowboxLatestTV,
  getShowboxIMDBTopMovies,
  searchShowbox,
} from "@/lib/services/showbox";
import { mapShowboxToContent } from "@/lib/utils/showbox-mapper";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const isKidsMode = cookieStore.get("kids_mode")?.value === "true";
  let continueWatching: any[] = [];

  // Fetch all categorized data in parallel for maximum speed
  const [
    rawTrendingAll,
    rawTrendingMovies,
    rawTrendingTVShows,
    rawHotTVThisWeek,
    rawLatestTV,
    rawIMDBMovies,
  ] = await Promise.all([
    getShowboxTrending("all", 40),
    getShowboxTrendingMovies(40),
    getShowboxTrendingTVShows(40),
    getShowboxHotTVThisWeek(40),
    getShowboxLatestTV(40),
    getShowboxIMDBTopMovies(40),
  ]);

  // Map everything to our standardized UI object format
  const trendingAll = mapShowboxToContent(rawTrendingAll?.list || rawTrendingAll);
  const trendingMovies = mapShowboxToContent(rawTrendingMovies?.list || rawTrendingMovies, "movie");
  const trendingTVShows = mapShowboxToContent(rawTrendingTVShows?.list || rawTrendingTVShows, "series");
  const hotTVThisWeek = mapShowboxToContent(rawHotTVThisWeek?.list || rawHotTVThisWeek, "series");
  const latestTV = mapShowboxToContent(rawLatestTV?.list || rawLatestTV, "series");
  const topMovies = mapShowboxToContent(rawIMDBMovies?.list || rawIMDBMovies, "movie");

  // Kids Mode Filter
  const kidsSafeGenres = ["Animation", "Family", "Kids", "Comedy", "Fantasy", "Adventure"];
  const filterKids = (items: any[]) => {
    if (!isKidsMode) return items;
    return items.filter(item => {
      if (!item.genre) return true; // Keep if no genre info, or be strict? Let's be semi-strict.
      const itemGenres = item.genre.split(",").map((g: string) => g.trim().toLowerCase());
      return itemGenres.some((g: string) => kidsSafeGenres.map(ks => ks.toLowerCase()).includes(g));
    });
  };

  const filteredTrending = filterKids(trendingAll);
  const filteredLatestTV = filterKids(latestTV);
  const filteredHotTV = filterKids(hotTVThisWeek);
  const filteredTopMovies = filterKids(topMovies);

  // Sort IMDB movies by rating descending for proper "IMDB Rating" section
  // This is now applied to the filteredTopMovies if kids mode is off, or just topMovies if kids mode is on
  const imdbSorted = [...filteredTopMovies].sort((a, b) => {
    const rA = parseFloat(a.imdbRating) || 0;
    const rB = parseFloat(b.imdbRating) || 0;
    return rB - rA;
  });

  // Filter out default placeholder images and map to HeroSlide format for the banner
  const heroSlides = trendingAll
    .filter((item: any) => item.backdropUrl && !item.backdropUrl.includes("poster_default2.png"))
    .slice(0, 10)
    .map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      backdropUrl: item.backdropUrl,
    }));

  return (
    <main className="min-h-screen bg-[#0B0B0F] pb-32">
      <HeroBanner slides={heroSlides} />

      <div className="relative w-full max-w-[1440px] mx-auto z-10 pt-16">

        {/* ── SECTION 0: Continue Watching ── */}
        {continueWatching.length > 0 && (
          <ContentRow title="🕒 Continue Watching" items={continueWatching} />
        )}

        {/* ── SECTION 1: Trending ── */}
        <ContentRow
          title={isKidsMode ? "👶 Kids Trending" : "🔥 Trending"}
          items={filteredTrending}
          seeAllHref="/movies"
        />

        {/* ── SECTION 2: Recommendations (Dynamic) ── */}
        {!isKidsMode && <RecommendationsRow />}

        {/* ── SECTION 3: This Week's Hot TVs ── */}
        {filteredHotTV.length > 0 && (
          <ContentRow title={isKidsMode ? "📺 Kids Favourites" : "📺 This Week's Hot TVs"} items={filteredHotTV} seeAllHref="/series" />
        )}

        {/* ── SECTION 4: Latest TV ── */}
        {filteredLatestTV.length > 0 && (
          <ContentRow title={isKidsMode ? "✨ New for Kids" : "✨ Latest TV"} items={filteredLatestTV} seeAllHref="/series" />
        )}

        {/* ── SECTION 5: Top Movies ── */}
        {imdbSorted.length > 0 && (
          <ContentRow title={isKidsMode ? "🎬 Family Movies" : "🎬 Top Movies"} items={imdbSorted} seeAllHref="/movies" />
        )}

      </div>

      <PricingSection />
    </main>
  );
}
