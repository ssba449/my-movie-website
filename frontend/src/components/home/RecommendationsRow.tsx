"use client";

import { useEffect, useState } from "react";
import ContentRow from "@/components/home/ContentRow";

export default function RecommendationsRow() {
    const [data, setData] = useState<{ title: string; items: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const res = await fetch("/api/content/recommendations");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
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
