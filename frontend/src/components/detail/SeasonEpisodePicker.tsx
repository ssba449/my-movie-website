"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Loader2, Film, Tv, ChevronRight } from "lucide-react";

// STREAM_SERVER constant removed for unified /api standardisation

interface Season {
    fid: number;
    name: string;
    seasonNumber: number;
    _directFiles?: boolean;
}

interface Episode {
    fid: number | string;
    name: string;
    episodeNumber: number;
    fileSize: string;
    fileSizeBytes: number;
    streamUrl?: string;
}

interface SeasonEpisodePickerProps {
    showboxId: string;
    onEpisodePlay: (streamUrl: string, episodeName: string, episodeId?: string) => void;
}

export default function SeasonEpisodePicker({ showboxId, onEpisodePlay }: SeasonEpisodePickerProps) {
    const [shareKey, setShareKey] = useState<string | null>(null);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [activeSeason, setActiveSeason] = useState<number>(0);
    const [loadingSeasons, setLoadingSeasons] = useState(true);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);
    const [playingFid, setPlayingFid] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasDirectFiles, setHasDirectFiles] = useState(false);

    // Restore last played episode from localStorage
    const getLastPlayed = useCallback(() => {
        try {
            const saved = localStorage.getItem(`lastEpisode_${showboxId}`);
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    }, [showboxId]);

    const saveLastPlayed = useCallback((seasonIndex: number, fid: number) => {
        try {
            localStorage.setItem(`lastEpisode_${showboxId}`, JSON.stringify({ seasonIndex, fid }));
        } catch { }
    }, [showboxId]);

    // Load seasons on mount
    useEffect(() => {
        async function loadSeasons() {
            setLoadingSeasons(true);
            setError(null);
            try {
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(showboxId);
                const url = isUUID ? `/api/content/seasons?showId=${showboxId}` : `/api/series/seasons?id=${showboxId}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error("Failed to load seasons");
                const data = await res.json();
                setShareKey(data.shareKey);
                setSeasons(data.seasons || []);
                setHasDirectFiles(data.hasDirectFiles || false);

                // Auto-select season (prefer last played, or first)
                const last = getLastPlayed();
                const startIdx = last?.seasonIndex && last.seasonIndex < (data.seasons || []).length
                    ? last.seasonIndex : 0;
                setActiveSeason(startIdx);
            } catch (e: any) {
                setError(e.message || "Could not load series data");
            } finally {
                setLoadingSeasons(false);
            }
        }
        if (showboxId) loadSeasons();
    }, [showboxId, getLastPlayed]);

    // Load episodes when season changes
    useEffect(() => {
        if (!shareKey || seasons.length === 0) return;
        const season = seasons[activeSeason];
        if (!season) return;

        async function loadEpisodes() {
            setLoadingEpisodes(true);
            setEpisodes([]);
            try {
                const seasonFid = season.fid || 0;
                const isDB = shareKey === "db";
                const url = isDB
                    ? `/api/content/episodes?seasonFid=${seasonFid}`
                    : `/api/series/episodes?shareKey=${shareKey}&seasonFid=${seasonFid}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error("Failed to load episodes");
                const data = await res.json();
                setEpisodes(data.episodes || []);
            } catch (e: any) {
                setError(e.message || "Could not load episodes");
            } finally {
                setLoadingEpisodes(false);
            }
        }
        loadEpisodes();
    }, [shareKey, activeSeason, seasons]);

    // Play an episode
    const handlePlay = async (ep: Episode) => {
        if (!shareKey) return;
        setPlayingFid(ep.fid as number);
        setError(null);
        try {
            let streamUrl = "";
            let finalName = `S${seasons[activeSeason]?.seasonNumber || 1}E${ep.episodeNumber} · ${cleanEpisodeName(ep.name)}`;

            if (shareKey === "db" && ep.streamUrl) {
                if (ep.streamUrl.startsWith("febbox://")) {
                    const [sk, fileFid] = ep.streamUrl.replace("febbox://", "").split("/");
                    const res = await fetch(`/api/play/episode?shareKey=${sk}&fid=${fileFid}`);
                    const data = await res.json();
                    if (!res.ok || data.hint === "use_embed_fallback") {
                        throw new Error(data.error || "Episode stream unavailable. CDN link could not be extracted.");
                    }
                    if (data.type === 'stream' && data.stream) {
                        streamUrl = `/api${data.stream}`;
                    } else {
                        throw new Error("No stream token received for db-linked episode");
                    }
                } else {
                    streamUrl = ep.streamUrl;
                }
            } else {
                const res = await fetch(`/api/play/episode?shareKey=${shareKey}&fid=${ep.fid}`);
                const data = await res.json();
                // Handle embed fallback hint (CDN extraction failed server-side)
                if (data.hint === "use_embed_fallback") {
                    throw new Error("Episode stream unavailable — CDN link could not be extracted. Try again later.");
                }
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || `Server error ${res.status}`);
                }
                if (data.type === 'stream' && data.stream) {
                    streamUrl = `/api${data.stream}`;
                } else {
                    throw new Error("No stream token received for episode");
                }
            }

            saveLastPlayed(activeSeason, ep.fid as number);
            onEpisodePlay(streamUrl, finalName, shareKey === "db" ? (ep.fid as string) : undefined);
        } catch (e: any) {
            setError(e.message || "Could not play episode");
        } finally {
            setPlayingFid(null);
        }
    };

    function cleanEpisodeName(name: string): string {
        // Remove file extension and clean up
        return name
            .replace(/\.(mp4|mkv|avi|m3u8|webm|ts)$/i, "")
            .replace(/\./g, " ")
            .replace(/_/g, " ")
            .trim();
    }

    function formatFileSize(size: string): string {
        if (!size) return "";
        return size;
    }

    // ── Loading state ──
    if (loadingSeasons) {
        return (
            <div className="w-full py-16 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-3 border-white/10 border-t-[#8C3FE8] animate-spin" />
                <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Loading Seasons</p>
            </div>
        );
    }

    // ── Error state ──
    if (error && seasons.length === 0) {
        return (
            <div className="w-full py-16 flex flex-col items-center gap-4">
                <Tv className="w-12 h-12 text-white/20" />
                <p className="text-white/50 text-sm">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2 rounded-full bg-[#8C3FE8]/30 hover:bg-[#8C3FE8]/50 text-white text-sm transition-colors border border-[#8C3FE8]/40"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // ── No seasons found ──
    if (seasons.length === 0) {
        return (
            <div className="w-full py-16 flex flex-col items-center gap-4">
                <Film className="w-12 h-12 text-white/20" />
                <p className="text-white/50 text-sm">No seasons available for this series.</p>
            </div>
        );
    }

    const lastPlayed = getLastPlayed();

    return (
        <div className="w-full">
            {/* ── Season Tabs ── */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 mb-8">
                {seasons.map((season, idx) => (
                    <button
                        key={season.fid}
                        onClick={() => setActiveSeason(idx)}
                        className={`relative px-5 py-2.5 rounded-full text-[14px] font-semibold tracking-wide whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] focus:outline-none focus:ring-2 focus:ring-white/40 ${activeSeason === idx
                            ? "bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.25)]"
                            : "bg-white/[0.06] text-white/50 hover:bg-white/[0.12] hover:text-white/80"
                            }`}
                    >
                        {hasDirectFiles ? "Episodes" : `Season ${season.seasonNumber}`}
                    </button>
                ))}
            </div>

            {/* ── Episodes Grid ── */}
            {loadingEpisodes ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[88px] rounded-[20px] bg-white/[0.04] animate-pulse border border-white/[0.06]" />
                    ))}
                </div>
            ) : episodes.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-white/40 text-sm">No episodes found in this season.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {episodes.map((ep) => {
                        const isPlaying = playingFid === ep.fid;
                        const isLastPlayed = lastPlayed?.fid === ep.fid;
                        return (
                            <button
                                key={ep.fid}
                                tabIndex={0}
                                onClick={() => handlePlay(ep)}
                                disabled={isPlaying}
                                className={`group relative flex items-center backdrop-blur-xl border rounded-[20px] p-4 text-left transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#0B0B0F] ${isPlaying
                                    ? "bg-[#8C3FE8]/20 border-[#8C3FE8]/40 shadow-[0_0_30px_rgba(140,63,232,0.15)]"
                                    : isLastPlayed
                                        ? "bg-white/[0.12] border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                        : "bg-[rgba(28,28,30,0.5)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.1)] hover:border-white/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                                    } ${isPlaying ? "cursor-wait" : "cursor-pointer"}`}
                            >
                                {/* Episode number / play icon */}
                                <div className="relative w-10 h-10 shrink-0 mr-4">
                                    <span className={`absolute inset-0 flex items-center justify-center font-mono text-lg transition-all duration-300 ${isPlaying ? "opacity-0" : "text-white/30 group-hover:opacity-0"
                                        }`}>
                                        {ep.episodeNumber}
                                    </span>
                                    <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isPlaying
                                        ? "opacity-100 scale-100 bg-[#8C3FE8]"
                                        : "opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 bg-white"
                                        }`}>
                                        {isPlaying ? (
                                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                                        ) : (
                                            <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                                        )}
                                    </div>
                                </div>

                                {/* Episode info */}
                                <div className="flex-1 min-w-0 mr-3">
                                    <h4 className={`text-[15px] font-medium mb-0.5 transition-colors line-clamp-1 ${isPlaying ? "text-[#C26BF0]" : isLastPlayed ? "text-white" : "text-white/90 group-hover:text-white"
                                        }`}>
                                        {cleanEpisodeName(ep.name)}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        {ep.fileSize && (
                                            <span className="text-[12px] text-white/30 font-medium">{formatFileSize(ep.fileSize)}</span>
                                        )}
                                        {isLastPlayed && (
                                            <span className="text-[11px] text-[#8C3FE8] font-semibold tracking-wider uppercase">Last Played</span>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <ChevronRight className={`w-4 h-4 shrink-0 transition-all duration-300 ${isPlaying ? "text-[#8C3FE8]" : "text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5"
                                    }`} />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
