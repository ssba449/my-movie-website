"use client";

import { useState, useEffect } from "react";
import { Server, MonitorPlay, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmbedPlayerProps {
    tmdbId: number | null | undefined;
    type: "movie" | "series";
    seasonNumber?: number;
    episodeNumber?: number;
}

export default function EmbedPlayer({ tmdbId, type, seasonNumber, episodeNumber }: EmbedPlayerProps) {
    const [server, setServer] = useState<"vidlink" | "embedsu" | "vidsrc">("vidlink");
    const [isLoading, setIsLoading] = useState(true);

    // Trigger 3 second loader whenever tmdbId, season, episode, or server changes
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, [tmdbId, seasonNumber, episodeNumber, server]);

    if (!tmdbId) {
        return (
            <div className="w-full h-[500px] flex items-center justify-center bg-black/50 border border-white/10 rounded-2xl">
                <div className="text-center">
                    <MonitorPlay className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">Video not available for this title.</p>
                </div>
            </div>
        );
    }

    // 1. VidLink (Default)
    const vidlinkUrl = type === "movie"
        ? `https://vidlink.pro/movie/${tmdbId}`
        : `https://vidlink.pro/tv/${tmdbId}/${seasonNumber || 1}/${episodeNumber || 1}`;

    // 2. Embed.su
    const embedsuUrl = type === "movie"
        ? `https://embed.su/embed/movie/${tmdbId}`
        : `https://embed.su/embed/tv/${tmdbId}/${seasonNumber || 1}/${episodeNumber || 1}`;

    // 3. VidSrc.me
    const vidsrcUrl = type === "movie"
        ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
        : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${seasonNumber || 1}&episode=${episodeNumber || 1}`;

    let currentUrl = vidlinkUrl;
    if (server === "embedsu") currentUrl = embedsuUrl;
    else if (server === "vidsrc") currentUrl = vidsrcUrl;

    return (
        <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Server Selection Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-sm font-medium text-white/50 flex items-center gap-2 mr-2">
                    <Server className="w-4 h-4" />
                    Servers:
                </span>

                {[
                    { id: "vidlink", label: "Server 1 (VidLink)" },
                    { id: "embedsu", label: "Server 2 (Embed.su)" },
                    { id: "vidsrc", label: "Server 3 (VidSrc)" }
                ].map((s) => (
                    <Button
                        key={s.id}
                        variant="ghost"
                        onClick={() => setServer(s.id as "vidlink" | "embedsu" | "vidsrc")}
                        className={`h-9 px-4 rounded-full text-sm font-medium transition-all ${server === s.id
                                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                            }`}
                    >
                        {s.label}
                    </Button>
                ))}
            </div>

            {/* Video Player Frame with Loading Overlay */}
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] bg-black overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">

                {/* 3 Second Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0B0B0F]">
                        <Loader2 className="w-12 h-12 text-white/80 animate-spin mb-4" />
                        <p className="text-white/70 font-medium tracking-wide animate-pulse">
                            Looking for source...
                        </p>
                    </div>
                )}

                {/* Actual iframe (always rendered to start loading, but visually hidden under the overlay initially) */}
                <iframe
                    src={currentUrl}
                    className="absolute inset-0 w-full h-full border-none outline-none"
                    allowFullScreen
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
            </div>
        </div>
    );
}
