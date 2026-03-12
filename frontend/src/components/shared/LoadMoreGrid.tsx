"use client";

import { useState } from "react";
import ContentCard from "./ContentCard";
import { Loader2 } from "lucide-react";
import { mapShowboxToContent } from "@/lib/utils/showbox-mapper";

interface LoadMoreGridProps {
    initialData: any[];
    type: "movie" | "tv" | "all";
    keyword?: string;
}

export default function LoadMoreGrid({ initialData, type, keyword }: LoadMoreGridProps) {
    const [items, setItems] = useState<any[]>(initialData);
    const [page, setPage] = useState(2); // Initial data is page 1, next is page 2
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);

        try {
            const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "https://my-movie-website.onrender.com").replace(/\/$/, "");
            const queryParam = keyword ? `&title=${encodeURIComponent(keyword)}` : "";
            // Use search endpoint which reliably returns the list format
            const rest = await fetch(`${apiBase}/api/search?type=${type}&page=${page}&pagelimit=60${queryParam}`);
            const json = await rest.json();

            // Showbox API returns either { list: [...] } or the list directly as an array
            const rawItems = json?.list || (Array.isArray(json) ? json : []);

            if (rawItems && rawItems.length > 0) {
                // Determine if we should stop
                if (rawItems.length < 60) setHasMore(false);

                const mappedNewItems = mapShowboxToContent(rawItems, type === "tv" ? "series" : "movie");

                // Append new unique items
                setItems(prevItems => {
                    const existingIds = new Set(prevItems.map(i => i.id?.toString()));
                    const uniqueNewItems = mappedNewItems.filter(i => !existingIds.has(i.id));
                    return [...prevItems, ...uniqueNewItems];
                });

                setPage(prev => prev + 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to load more content:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-y-12 gap-x-6 place-items-center">
                {items.map((item: any) => (
                    <ContentCard
                        key={`${item.id}-${Math.random()}`} // Fallback for duplicates
                        id={item.id?.toString()}
                        title={item.title || item.display_title || "Unknown Title"}
                        posterUrl={item.posterUrl || item.poster || item.poster_min || ""}
                        imdbRating={item.imdbRating || item.rating || (item.imdb_rating ? item.imdb_rating.toString() : 0)}
                        genre={item.genre}
                        year={item.year || (item.releaseYear ? item.releaseYear.toString() : undefined)}
                        runtime={item.runtime}
                        type={item.type || (item.box_type === 2 ? "tv" : item.box_type === 1 ? "movie" : type)}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold tracking-wide transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load More"
                        )}
                    </button>
                </div>
            )}

            {!hasMore && items.length > 60 && (
                <div className="text-center text-white/50 py-8">
                    <p>You&apos;ve reached the end of the catalogue.</p>
                </div>
            )}
        </div>
    );
}
