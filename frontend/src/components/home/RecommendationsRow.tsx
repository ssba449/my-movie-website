"use client";

import { useEffect, useState } from "react";
import ContentRow from "@/components/home/ContentRow";

export default function RecommendationsRow() {
    const [data, setData] = useState<{ title: string; items: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "https://my-movie-website.onrender.com").replace(/\/$/, "");
                // Use Trending as a fallback since specific recommendations require user history
                const res = await fetch(`${apiBase}/api/search?type=all&page=1&pagelimit=15&title=2024`);
                if (res.ok) {
                    const json = await res.json();
                    const items = (json.list || json).map((m: any) => ({
                        id: m.id,
                        title: m.title || m.display_title,
                        posterUrl: m.poster || m.poster_min,
                        type: m.box_type === 1 ? "movie" : "series"
                    }));
                    setData({ title: "Recommended for You", items });
                }
            } catch (e) {
                console.error("Failed to fetch recommendations", e);
            } finally {
                setLoading(false);
            }
        };

        fetchRecs();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center animate-pulse">
                <div className="w-full h-full bg-white/5 rounded-2xl mx-10" />
            </div>
        );
    }

    if (!data || data.items.length === 0) return null;

    return (
        <ContentRow
            title={data.title}
            items={data.items}
            seeAllHref="/movies"
        />
    );
}
