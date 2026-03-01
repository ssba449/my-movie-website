import { Suspense } from "react";
import { searchContent } from "@/lib/services/content";
import ContentCard from "@/components/shared/ContentCard";
import { Search } from "lucide-react";

async function SearchResults({ query }: { query: string }) {
    if (!query) return null;

    const results = await searchContent(query, 50);

    if (results.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                <div className="w-24 h-24 bg-[rgba(255,255,255,0.05)] rounded-full flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-white/20" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">No results found</h2>
                <p className="text-white/50 text-[15px] max-w-md">
                    We couldn't find any movies or TV shows matching "{query}". Try checking for spelling errors or using different keywords.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-12">
            {results.map((item: any) => (
                <div key={item.id} className="transition-transform duration-500 hover:scale-[1.04] hover:z-20">
                    <ContentCard
                        id={item.id}
                        title={item.title}
                        posterUrl={item.posterUrl}
                        imdbRating={item.imdbRating}
                        year={item.releaseYear ? item.releaseYear.substring(0, 4) : undefined}
                        runtime={item.runtime}
                        genre={item.genre}
                    />
                </div>
            ))}
        </div>
    );
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ q: string }>
}) {
    const params = await searchParams;
    const query = params.q || "";

    return (
        <div className="min-h-screen bg-[#0B0B0F] pt-[120px] pb-32">
            <div className="max-w-[1440px] mx-auto px-10 xl:px-16">

                {query ? (
                    <div className="mb-12">
                        <h1 className="text-3xl font-bold text-white mb-2">Search Results for "{query}"</h1>
                        <p className="text-white/50 font-medium">Explore titles matching your search criteria.</p>
                    </div>
                ) : (
                    <div className="mb-12">
                        <h1 className="text-3xl font-bold text-white mb-2">Search StreamVault</h1>
                        <p className="text-white/50 font-medium">Find your favorite movies, TV shows, genres, and more.</p>
                    </div>
                )}

                <Suspense fallback={
                    <div className="flex items-center justify-center py-32">
                        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    </div>
                }>
                    <SearchResults query={query} />
                </Suspense>

            </div>
        </div>
    );
}
