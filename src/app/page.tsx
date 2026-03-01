import HeroBanner from "@/components/shared/HeroBanner";
import FeaturesStrip from "@/components/home/FeaturesStrip";
import ContentRow from "@/components/home/ContentRow";
import PricingSection from "@/components/home/PricingSection";
import { getTrendingContent, getPopularContent, getTopRatedContent, getNewReleases } from "@/lib/services/content";

export default async function Home() {
  // Fetch real data from the DB populated by mass-import script
  const trending = await getTrendingContent(20);
  const popularMovies = await getPopularContent("movie", 20);
  const popularShows = await getPopularContent("series", 20);
  const topRated = await getTopRatedContent(20);
  const newReleases = await getNewReleases(20);

  // Map to HeroSlide format for the banner (using top 5 trending)
  const heroSlides = trending.slice(0, 5).map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    backdropUrl: item.backdropUrl,
  }));

  return (
    <div className="bg-[#0B0B0F] min-h-screen pb-32">
      <HeroBanner slides={heroSlides} />

      <div className="relative w-full max-w-[1440px] mx-auto z-10 pt-16">

        {/* ROW 1: Trending Now */}
        {trending.length > 0 && (
          <ContentRow title="Trending Now" items={trending} seeAllHref="/browse" />
        )}

        {/* ROW 2: Popular Movies */}
        {popularMovies.length > 0 && (
          <ContentRow title="Popular Movies" items={popularMovies} seeAllHref="/movies" />
        )}

        {/* ROW 3: Popular TV Shows */}
        {popularShows.length > 0 && (
          <ContentRow title="Popular TV Shows" items={popularShows} seeAllHref="/series" />
        )}

        {/* ROW 4: Top Rated */}
        {topRated.length > 0 && (
          <ContentRow title="Top Rated" items={topRated} seeAllHref="/browse" />
        )}

        {/* ROW 5: New Releases */}
        {newReleases.length > 0 && (
          <ContentRow title="New Releases" items={newReleases} seeAllHref="/browse" />
        )}

      </div>

      <PricingSection />
    </div>
  );
}
