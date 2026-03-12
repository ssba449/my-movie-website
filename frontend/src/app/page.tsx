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

  // Fetch ONLY hero data on server for instant first paint
  const rawTrendingAll = await getShowboxTrending("all", 20);
  const trendingAll = mapShowboxToContent(rawTrendingAll?.list || rawTrendingAll);

  // Filter hero slides for posters (remove defaults)
  const heroSlides = trendingAll
    .filter((item: any) => item.backdropUrl && !item.backdropUrl.includes("poster_default2.png") && !item.backdropUrl.includes("unsplash"))
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

        {/* ── All rows now use lazy client-side fetching via fetchPath ── */}

        {/* ── SECTION 0: Continue Watching (Placeholder for future implementation) ── */}
        {/* {continueWatching.length > 0 && (
          <ContentRow title="🕒 Continue Watching" items={continueWatching} />
        )} */}

        {/* ── SECTION 1: Trending ── */}
        <ContentRow
          title={isKidsMode ? "👶 Kids Trending" : "🔥 Trending"}
          fetchPath={`/api/home?type=trending&kidsMode=${isKidsMode}`}
          seeAllHref="/movies"
        />

        {/* ── SECTION 2: Recommendations (Dynamic) ── */}
        {!isKidsMode && <RecommendationsRow />}

        {/* ── SECTION 3: This Week's Hot TVs ── */}
        <ContentRow
          title={isKidsMode ? "📺 Kids Favourites" : "📺 This Week's Hot TVs"}
          fetchPath={`/api/tv?sort=hot&kidsMode=${isKidsMode}`}
          typeFallback="series"
          seeAllHref="/series"
        />

        {/* ── SECTION 4: Latest TV ── */}
        <ContentRow
          title={isKidsMode ? "✨ New for Kids" : "✨ Latest TV"}
          fetchPath={`/api/tv?sort=release_date&kidsMode=${isKidsMode}`}
          typeFallback="series"
          seeAllHref="/series"
        />

        {/* ── SECTION 5: Top Movies ── */}
        <ContentRow
          title={isKidsMode ? "🎬 Family Movies" : "🎬 Top Movies"}
          fetchPath={`/api/movies?sort=rating&kidsMode=${isKidsMode}`}
          typeFallback="movie"
          seeAllHref="/movies"
        />

      </div>

      <PricingSection />
    </main>
  );
}
