import { Suspense } from "react";
import { searchShowbox } from "@/lib/services/showbox";
import ContentCard from "@/components/shared/ContentCard";
import { Search } from "lucide-react";

import { cookies } from "next/headers";
import LoadMoreGrid from "@/components/shared/LoadMoreGrid";
import { mapShowboxToContent } from "@/lib/utils/showbox-mapper";

async function SearchResults({ query, isKidsMode }: { query: string, isKidsMode: boolean }) {
    if (!query) return null;

    const results = await searchShowbox(query, "all", 1, 50);
    let resultsArray = Array.isArray(results) ? results : (results?.list || []);

    if (isKidsMode) {
        const kidsSafeGenres = ["Animation", "Family", "Kids", "Comedy", "Fantasy", "Adventure"];
        resultsArray = resultsArray.filter((item: any) => {
            if (!item.genre) return true;
            const itemGenres = item.genre.split(",").map((g: string) => g.trim().toLowerCase());
            return itemGenres.some((g: string) => kidsSafeGenres.map(ks => ks.toLowerCase()).includes(g));
        });
    }

    const mappedResults = mapShowboxToContent(resultsArray);

    if (!resultsArray || resultsArray.length === 0) {
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

    // Use LoadMoreGrid for infinite scroll, passing the query as the keyword parameter to `/api/content` 
    return (
        <LoadMoreGrid initialData={mappedResults} type="all" keyword={query} />
    );
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ q: string }>
}) {
    const params = await searchParams;
    const query = params.q || "";
    const cookieStore = await cookies();
    const isKidsMode = cookieStore.get("kids_mode")?.value === "true";

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
                    <SearchResults query={query} isKidsMode={isKidsMode} />
                </Suspense>

            </div>
        </div>
    );
}
