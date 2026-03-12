"use client";

import { useState } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface WatchlistButtonProps {
    contentId: string;
    type: "movie" | "series";
    initialIsFavorite: boolean;
    isLoggedIn: boolean;
}

export default function WatchlistButton({ contentId, type, initialIsFavorite, isLoggedIn }: WatchlistButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        if (!isLoggedIn) {
            router.push("/sign-in");
            return;
        }

        setIsLoading(true);
        try {
            const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "https://my-movie-website.onrender.com").replace(/\/$/, "");
            const res = await fetch(`${apiBase}/api/user/favorites`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contentId: contentId,
                    type: type,
                    isFavorite: isFavorite
                })
            });

            if (res.ok) {
                const data = await res.json();
                setIsFavorite(data.isFavorite);
            }
        } catch (error) {
            console.error("Watchlist error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            size="lg"
            variant="ghost"
            onClick={handleToggle}
            disabled={isLoading}
            className={`h-[52px] w-[52px] p-0 rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:scale-105 active:scale-95 border ${isFavorite
                ? "bg-white text-black border-white hover:bg-white/90"
                : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                }`}
            title={isFavorite ? "Remove from List" : "Add to List"}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : isFavorite ? (
                <Check className="w-5 h-5 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            ) : (
                <Plus className="w-5 h-5" />
            )}
        </Button>
    );
}
