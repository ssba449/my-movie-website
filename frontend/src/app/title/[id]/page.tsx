export const dynamic = 'force-dynamic';

import Image from "next/image";
import { Play, Plus, Star, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContentRow from "@/components/home/ContentRow";
import { getNormalizedShowboxContent, getShowboxTrending } from "@/lib/services/showbox";
import { notFound } from "next/navigation";
import WatchButton from "./WatchButton";
import Link from "next/link";
import TitleTabsManager from "@/components/detail/TitleTabsManager";
import TitleStickyHeader from "@/components/detail/TitleStickyHeader";
import ShowboxPlayer from "@/components/shared/ShowboxPlayer";

// Helper for mapping "more like this"
function mapShowboxToContent(items: any[], typeFallback: "movie" | "series" = "movie") {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => ({
        id: item.id?.toString(),
        title: item.title || item.display_title || "Unknown Title",
        posterUrl: item.poster || item.poster_min,
        imdbRating: item.rating || (item.imdb_rating ? item.imdb_rating.toString() : undefined),
        year: item.year ? item.year.toString() : undefined,
        genre: item.genre,
        type: item.box_type === 1 ? "movie" : item.box_type === 2 ? "series" : typeFallback,
    }));
}

export default async function TitleDetail({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const isLoggedIn = false;
    const userId = null;

    // Next.js versions can sometimes wrap params in a promise or pass directly.
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const typeHint = typeof resolvedSearchParams?.type === "string" ? resolvedSearchParams.type : undefined;

    if (!resolvedParams?.id) {
        notFound();
    }

    const content = await getNormalizedShowboxContent(resolvedParams.id, typeHint as "movie" | "series" | "tv" | undefined);

    if (!content) {
        notFound();
    }

    // Check if in watchlist
    let isFavorite = false;

    const rawMore = await getShowboxTrending("all", 10);
    const moreLikeThis = mapShowboxToContent(rawMore?.list || rawMore);

    const userPlan = "StreamVault+"; // Default to premium since auth is removed
    const isLocked = false;

    // Placeholder for series specific state, assuming these would be passed or derived
    const isSeries = content.type === "series";
    const activeEpisodeId = typeof resolvedSearchParams?.episodeId === "string" ? resolvedSearchParams.episodeId : undefined;
    const episodeTitle = typeof resolvedSearchParams?.episodeTitle === "string" ? resolvedSearchParams.episodeTitle : undefined;
    const episodeStream = typeof resolvedSearchParams?.episodeStream === "string" ? resolvedSearchParams.episodeStream : undefined;

    return (
        <div className="min-h-screen bg-[#0B0B0F] relative selection:bg-white selection:text-black">
            {/* Full Cinematic Backdrop */}
            <div className="fixed top-0 left-0 w-full h-[85vh] md:h-[720px] pointer-events-none z-0">
                <Image
                    src={content.backdropUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1"}
                    alt="Backdrop"
                    fill
                    className="object-cover opacity-[0.35] mix-blend-screen scale-105 blur-[20px] md:blur-[40px] saturate-150 transform-gpu"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0F]/80 via-transparent to-transparent h-48" />
            </div>

            {/* Sticky Header on Scroll */}
            <TitleStickyHeader content={content} />

            {/* Back Button */}
            <div className="relative z-20 pt-24 px-8 md:px-16 max-w-[1440px] mx-auto">
                <Link href="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors duration-500 text-[14px] font-medium tracking-wide">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Browse
                </Link>
            </div>

            {/* Floating Info Panel */}
            <div className="relative z-10 w-full max-w-[1200px] mx-auto mt-8 md:mt-16 sm:px-8">
                <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] md:rounded-[32px] sm:border border-[rgba(255,255,255,0.12)] shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-700">
                    <div className="flex flex-col md:flex-row p-8 md:p-14 gap-12">

                        {/* Poster */}
                        <div className="hidden md:block w-[280px] shrink-0">
                            <div className="w-full aspect-[2/3] relative rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
                                <Image
                                    src={content.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1"}
                                    alt={content.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Content Header & Metadata */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex flex-wrap items-center gap-4 text-[14px] text-white/60 font-medium tracking-wide mb-4">
                                {content.type === "series" ? (
                                    <span className="bg-white/10 px-2.5 py-1 rounded-[8px] text-white">Series</span>
                                ) : (
                                    <span className="bg-white/10 px-2.5 py-1 rounded-[8px] text-white">Movie</span>
                                )}
                                <span>{content.releaseYear}</span>
                                {content.runtime && <span>{Math.floor(content.runtime / 60)}h {content.runtime % 60}m</span>}
                                {content.imdbRating && (
                                    <span className="flex items-center text-white">
                                        <Star className="w-4 h-4 mr-1 text-white fill-white" />
                                        {content.imdbRating}
                                    </span>
                                )}
                                <span className="px-2 py-0.5 border border-white/20 rounded text-[12px] opacity-80">4K HDR</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-2 uppercase line-clamp-2 leading-[1.1]">
                                {content.title}
                            </h1>

                            <h2 className="text-[18px] text-white/50 mb-8 font-medium">
                                {content.genre?.split(',').join(' • ')}
                            </h2>

                            <div className="flex flex-wrap items-center gap-4 mb-10">
                                <WatchButton content={content} />

                                <Button size="lg" variant="ghost" className="h-[52px] w-[52px] p-0 rounded-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.12)] text-white hover:bg-[rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95 duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>

                            <p className="text-[16px] text-white/70 leading-[1.6] max-w-3xl font-medium">
                                {content.description || "No description available."}
                            </p>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            </div>


            <div className="mt-16 pb-32">
                <TitleTabsManager content={content} moreLikeThis={moreLikeThis} />
            </div>
        </div>
    );
}
