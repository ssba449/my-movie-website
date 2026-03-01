import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import HeroBanner from "@/components/shared/HeroBanner";
import ContentRow from "@/components/home/ContentRow";
import { getTrendingContent, getNewReleases, getContentByCategory } from "@/lib/services/content";

export default async function Browse() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/sign-in");
    }

    const trendingContent = await getTrendingContent(10);
    const newReleases = await getNewReleases(10);
    const movies = await getContentByCategory("movie", 10);

    return (
        <div className="bg-transparent min-h-screen">
            {/* Featured Banner (Hero Carousel) */}
            <HeroBanner slides={newReleases.slice(0, 3)} />

            <div className="pt-8 pb-32 space-y-4 relative z-20 -mt-24">
                <ContentRow title="Continue Watching" items={trendingContent.slice(0, 3)} />
                <ContentRow title="Trending in Your Region" items={trendingContent} />
                <ContentRow title="Top Rated Movies" items={movies.filter((m: any) => (m.imdbRating || 0) >= 8.0)} />
                <ContentRow title="New Releases" items={newReleases} />

                <ContentRow title="Recommended for You" items={movies} />
            </div>
        </div>
    );
}

