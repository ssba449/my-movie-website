"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import ContentCard from "@/components/shared/ContentCard";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { mapShowboxToContent } from "@/lib/utils/showbox-mapper";

interface ContentRowProps {
    title: string;
    items?: any[];
    fetchPath?: string;
    typeFallback?: "movie" | "series";
    seeAllHref?: string;
    toggleOptions?: { label: string; items?: any[]; fetchPath?: string; seeAllHref?: string }[];
}

export default function ContentRow({
    title,
    items: initialItems,
    fetchPath: initialFetchPath,
    typeFallback = "movie",
    seeAllHref,
    toggleOptions
}: ContentRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [fetchedData, setFetchedData] = useState<{ [key: string]: any[] }>({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(
        toggleOptions && toggleOptions.length > 0 ? toggleOptions[0].label : "default"
    );

    const activeOption = toggleOptions?.find(t => t.label === activeTab);
    const currentFetchPath = activeOption?.fetchPath || initialFetchPath;
    const currentItems = activeOption
        ? (activeOption.items || fetchedData[activeTab] || [])
        : (initialItems || fetchedData["default"] || []);
    const currentHref = activeOption?.seeAllHref || seeAllHref;

    // Intersection Observer to detect when row is visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { rootMargin: "200px" }
        );
        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, []);

    // Fetch data when visible and fetchPath available
    useEffect(() => {
        if (!isVisible || !currentFetchPath || fetchedData[activeTab]) return;

        async function loadData() {
            setLoading(true);
            try {
                const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "https://my-movie-website.onrender.com").replace(/\/$/, "");
                const res = await fetch(`${apiBase}${currentFetchPath}`);
                if (res.ok) {
                    const raw = await res.json();
                    const mapped = mapShowboxToContent(raw?.list || raw, typeFallback);
                    setFetchedData(prev => ({ ...prev, [activeTab]: mapped }));
                }
            } catch (e) {
                console.error("Failed to fetch row data", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [isVisible, currentFetchPath, activeTab, typeFallback, fetchedData]);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.75;
            scrollRef.current.scrollTo({
                left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: "smooth"
            });
        }
    };

    if (!loading && (!currentItems || currentItems.length === 0) && !currentFetchPath) return null;

    return (
        <div ref={observerRef} className="py-8 mt-[32px] md:mt-[64px] relative group/row overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-10 xl:px-16 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-6">
                    <h2 className="text-[22px] font-semibold text-white tracking-wide">{title}</h2>

                    {/* Segmented Toggle Control */}
                    {toggleOptions && toggleOptions.length > 1 && (
                        <div className="flex bg-[rgba(255,255,255,0.08)] backdrop-blur-md p-1 rounded-full border border-[rgba(255,255,255,0.12)]">
                            {toggleOptions.map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => setActiveTab(opt.label)}
                                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 ${activeTab === opt.label
                                        ? "bg-white text-black shadow-md"
                                        : "text-white/60 hover:text-white"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {currentHref && (
                    <Link href={currentHref} className="text-[14px] font-semibold text-white/50 hover:text-white transition-colors flex items-center gap-1 group/btn self-start md:self-end">
                        See all
                        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                )}
            </div>

            <div className="max-w-[1440px] mx-auto relative xl:mx-auto">
                {/* Horizontal Scroll Arrows */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-2 xl:-left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 hidden md:flex items-center justify-center bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.15)] backdrop-blur-xl text-white rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                    onClick={() => scroll("right")}
                    className="absolute right-2 xl:-right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 hidden md:flex items-center justify-center bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.15)] backdrop-blur-xl text-white rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-12 pt-6 px-10 xl:px-16 hide-scrollbar snap-x scroll-smooth will-change-transform md:has-[:hover]:[&>div]:opacity-60 md:has-[:hover]:[&>div]:scale-[0.98]"
                >
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="snap-start shrink-0">
                                <ContentCard loading={true} />
                            </div>
                        ))
                    ) : (
                        currentItems.map((item, i) => (
                            <div
                                key={item.id || i}
                                className="snap-start shrink-0 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:hover:!opacity-100 md:hover:!scale-[1.06] md:hover:-translate-y-[10px] md:hover:z-20 rounded-[28px]"
                            >
                                <ContentCard
                                    id={item.id}
                                    title={item.title}
                                    posterUrl={item.posterUrl}
                                    imdbRating={item.imdbRating}
                                    genre={item.genre}
                                    year={item.year}
                                    runtime={item.runtime}
                                    type={item.type}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
