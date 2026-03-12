"use client";

import { useState, useEffect, useRef } from "react";
import { MonitorPlay, Play, Pause, Volume2, VolumeX, Maximize, X, RotateCcw, Captions } from "lucide-react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const STREAM_SERVER = ""; // Now purely relative via /api proxy

interface ShowboxPlayerProps {
    id: string;
    title: string;
    type: "movie" | "series";
    seasonNumber?: number;
    episodeNumber?: number;
    posterUrl?: string;
    tmdbId?: number | string | null;
    externalStreamUrl?: string;
    episodeId?: string; // Optional database episode ID
}

export default function ShowboxPlayer({
    id,
    title,
    type,
    seasonNumber = 1,
    episodeNumber = 1,
    posterUrl,
    externalStreamUrl,
    episodeId,
    tmdbId,
}: ShowboxPlayerProps) {
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [progressMsg, setProgressMsg] = useState("Preparing Stream");
    const [closed, setClosed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffering, setBuffering] = useState(false);
    const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
    const [availableSubtitles, setAvailableSubtitles] = useState<any[]>([]);
    const [isSubtitleMenuOpen, setIsSubtitleMenuOpen] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRefVideoJs = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<NodeJS.Timeout | null>(null);
    const hideRef = useRef<NodeJS.Timeout | null>(null);
    const savedUrl = useRef<string | null>(null);

    // ── Smooth progress bar ──
    const startProgress = (msg = "Preparing Stream") => {
        setProgressMsg(msg);
        setProgress(0);
        let cur = 0;
        progressRef.current = setInterval(() => {
            cur += cur < 40 ? 2.5 : cur < 72 ? 1.0 : cur < 88 ? 0.3 : 0;
            setProgress(Math.min(cur, 92));
        }, 200);
    };

    const finishProgress = () => {
        if (progressRef.current) clearInterval(progressRef.current);
        setProgress(100);
    };

    // ── Fetch /stream/:id from stream-server ──
    const load = (showboxId: string, showboxType: number) => {
        setStreamUrl(null);
        setEmbedUrl(null);
        setSubtitleUrl(null);
        setError(null);
        setClosed(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        startProgress("Extracting Stream");

        // After 6 seconds update message
        const msgTimer = setTimeout(() => setProgressMsg("Loading Video"), 6000);

        const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "https://my-movie-website.onrender.com").replace(/\/$/, "");
        // Change fetch from stream server directly to NextJS proxy API
        fetch(`${apiBase}/api/play?id=${showboxId}&type=${showboxType}`)
            .then(r => {
                if (!r.ok) throw new Error(`Server error ${r.status}`);
                return r.json();
            })
            .then(data => {
                clearTimeout(msgTimer);
                if (data?.type === 'embed' && data.embedUrl) {
                    finishProgress();
                    setEmbedUrl(data.embedUrl);
                    return;
                }

                if (!data?.stream) throw new Error("No stream token received");
                finishProgress();
                const url = data.stream;
                savedUrl.current = url;
                setTimeout(() => setStreamUrl(url), 300);
            })
            .catch(err => {
                clearTimeout(msgTimer);
                if (progressRef.current) clearInterval(progressRef.current);
                setProgress(0);
                setError(err.message || "Could not load stream.");
            });
    };

    // Handle external stream URL (from SeasonEpisodePicker for episodes)
    useEffect(() => {
        if (!externalStreamUrl) return;
        setStreamUrl(null);
        setError(null);
        setClosed(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setSubtitleUrl(null);
        setProgress(100);
        setEmbedUrl(null);
        savedUrl.current = externalStreamUrl;
        setTimeout(() => setStreamUrl(externalStreamUrl), 100);
    }, [externalStreamUrl]);

    useEffect(() => {
        if (externalStreamUrl) return; // Skip auto-load when using external URL
        if (!id) return;
        const playType = type === "movie" ? 1 : 2;
        load(id, playType);
        return () => { if (progressRef.current) clearInterval(progressRef.current); };
    }, [id, type, seasonNumber, episodeNumber, externalStreamUrl]);

    // ── Fetch Available Arabic Subtitles ──
    useEffect(() => {
        if (!tmdbId) {
            setAvailableSubtitles([]);
            return;
        }

        async function fetchSubtitles() {
            try {
                // We add a cache-busting timestamp to prevent the browser from returning
                // the old VTT response that might be aggressively cached
                const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "https://my-movie-website.onrender.com").replace(/\/$/, "");
                let subApi = `${apiBase}/api/subtitles?tmdbId=${tmdbId}&type=${type}&t=${Date.now()}`;
                if (type === "series" && seasonNumber && episodeNumber) {
                    subApi += `&season=${seasonNumber}&episode=${episodeNumber}`;
                }
                const res = await fetch(subApi, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setAvailableSubtitles(data);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch subtitle list:", err);
            }
        }

        fetchSubtitles();
    }, [tmdbId, type, seasonNumber, episodeNumber]);

    // ── Video.js Lifecycle ──
    useEffect(() => {
        if (!videoRef.current) return;

        // Initialize Video.js
        const player = videojs(videoRef.current, {
            autoplay: false,
            controls: false,
            responsive: true,
            fluid: true,
            preload: "auto",
            html5: {
                vhs: {
                    withCredentials: false
                }
            }
        });

        playerRefVideoJs.current = player;

        // Sync state from Video.js to React
        player.on("play", () => setIsPlaying(true));
        player.on("pause", () => setIsPlaying(false));
        player.on("timeupdate", () => setCurrentTime(player.currentTime() || 0));
        player.on("durationchange", () => setDuration(player.duration() || 0));
        player.on("waiting", () => setBuffering(true));
        player.on("playing", () => setBuffering(false));
        player.on("error", () => {
            const error = player.error();
            setError(`Playback Error: ${error ? error.message : "Unknown"}. Click Try Again.`);
        });

        return () => {
            if (player) {
                player.dispose();
            }
        };
    }, []);

    // ── Auto-play when stream URL is ready ──
    useEffect(() => {
        const player = playerRefVideoJs.current;
        if (!streamUrl || !player) return;

        setBuffering(true);
        player.src({
            src: streamUrl,
            type: streamUrl.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4"
        });

        player.play()
            .then(() => { setIsPlaying(true); setBuffering(false); })
            .catch(() => setBuffering(false));
    }, [streamUrl]);

    // ── Progress Reporting ──
    const lastReportedTime = useRef(0);
    useEffect(() => {
        if (!isPlaying || !id) return;

        const interval = setInterval(async () => {
            const player = playerRefVideoJs.current;
            if (!player || player.paused()) return;

            const curr = Math.floor(player.currentTime());
            const dur = Math.floor(player.duration());

            // Only report if time has changed significantly (30s) or near end
            if (Math.abs(curr - lastReportedTime.current) >= 30 || (dur > 0 && curr >= dur * 0.95)) {
                lastReportedTime.current = curr;
                try {
                    const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "https://my-movie-website.onrender.com").replace(/\/$/, "");
                    await fetch(`${apiBase}/api/user/progress`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contentId: id,
                            episodeId: episodeId,
                            positionSeconds: curr,
                            durationSeconds: dur
                        })
                    });
                } catch (e) {
                    console.error("Failed to report watch progress", e);
                }
            }
        }, 10000); // Check every 10s if we should report

        return () => clearInterval(interval);
    }, [isPlaying, id, episodeId]);

    // ── Controls auto-hide ──
    const resetHide = () => {
        setShowControls(true);
        if (hideRef.current) clearTimeout(hideRef.current);
        if (isPlaying) {
            hideRef.current = setTimeout(() => setShowControls(false), 3000);
        }
    };

    const togglePlay = () => {
        const player = playerRefVideoJs.current;
        if (!player) return;
        if (player.paused()) { player.play(); }
        else { player.pause(); }
        resetHide();
    };

    const toggleMute = () => {
        const player = playerRefVideoJs.current;
        if (!player) return;
        const newMute = !player.muted();
        player.muted(newMute);
        setIsMuted(newMute);
    };

    const toggleFullscreen = () => {
        const el = containerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) el.requestFullscreen();
        else document.exitFullscreen();
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const player = playerRefVideoJs.current;
        if (!player || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        player.currentTime(pct * duration);
    };

    const formatTime = (s: number) => {
        if (!s || isNaN(s)) return "0:00";
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        return h > 0
            ? `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
            : `${m}:${sec.toString().padStart(2, "0")}`;
    };

    // ── Closed state ──
    if (closed) {
        return (
            <div
                className="relative w-full aspect-video sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] bg-black/40 overflow-hidden rounded-2xl border border-white/10 flex items-center justify-center cursor-pointer group"
                onClick={() => {
                    setClosed(false);
                    if (savedUrl.current) setStreamUrl(savedUrl.current);
                }}
            >
                <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: posterUrl ? `url(${posterUrl})` : undefined }} />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group-hover:scale-110 backdrop-blur-sm border border-white/20">
                        <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
                    </div>
                    <p className="text-white/60 text-sm font-medium">Click to resume</p>
                </div>
            </div>
        );
    }

    // ── Error state ──
    if (error) {
        return (
            <div className="w-full h-[500px] flex items-center justify-center bg-black/50 border border-red-500/20 rounded-2xl">
                <div className="text-center px-4">
                    <MonitorPlay className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
                    <p className="text-white/70 font-semibold mb-2">Stream Unavailable</p>
                    <p className="text-white/40 text-sm max-w-xs mx-auto mb-4">{error}</p>
                    <button
                        onClick={() => {
                            const playType = type === "movie" ? 1 : 2;
                            load(id, playType);
                        }}
                        className="px-5 py-2 rounded-full bg-[#8C3FE8]/30 hover:bg-[#8C3FE8]/50 text-white text-sm flex items-center gap-2 mx-auto transition-colors border border-[#8C3FE8]/40"
                    >
                        <RotateCcw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div
                ref={containerRef}
                className="relative w-full aspect-video sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] bg-black overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-2xl border border-white/10"
                onMouseMove={resetHide}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
            >
                {/* ── Loading State ── */}
                {(!streamUrl && !embedUrl) && (
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: posterUrl ? `url(${posterUrl})` : undefined, backgroundColor: "#0B0B0F" }}
                    >
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                            <div className="relative w-20 h-20 mb-2">
                                <div className="absolute inset-0 rounded-full bg-white/5 animate-ping" />
                                <div className="absolute inset-2 rounded-full bg-white/10 animate-pulse" />
                                <div className="absolute inset-4 rounded-full bg-[#8C3FE8]/30 flex items-center justify-center">
                                    <Play className="w-6 h-6 text-white/80 ml-1" fill="currentColor" />
                                </div>
                            </div>
                            <p className="text-white/60 text-sm font-medium tracking-widest uppercase">{progressMsg}</p>
                            <div className="w-48 h-[3px] bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#8C3FE8] to-[#C26BF0] rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Embed Player (Fallback) ── */}
                {embedUrl && (
                    <iframe
                        src={embedUrl}
                        className="w-full h-full border-0"
                        allowFullScreen
                        allow="autoplay; encrypted-media"
                    />
                )}

                {/* ── Native Video Player ── */}
                {streamUrl && (
                    <>
                        <div data-vjs-player>
                            <video
                                ref={videoRef}
                                className="video-js vjs-big-play-centered w-full h-full object-contain animate-in fade-in duration-500"
                                playsInline
                                webkit-playsinline="true"
                                crossOrigin="anonymous"
                                onClick={togglePlay}
                            >
                                {subtitleUrl && (
                                    <track
                                        kind="subtitles"
                                        src={subtitleUrl}
                                        srcLang="ar"
                                        label="Arabic"
                                        default
                                    />
                                )}
                            </video>
                        </div>

                        {/* Buffering spinner */}
                        {buffering && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-[#8C3FE8] animate-spin" />
                            </div>
                        )}

                        {/* Controls overlay */}
                        <div className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                            <div className="relative px-5 pb-5 space-y-3">
                                {/* Seek bar */}
                                <div
                                    className="w-full h-[5px] bg-white/20 rounded-full cursor-pointer group/seek hover:h-2 transition-all"
                                    onClick={handleSeek}
                                >
                                    <div
                                        className="h-full bg-gradient-to-r from-[#8C3FE8] to-[#C26BF0] rounded-full relative"
                                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center gap-3">
                                    <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm">
                                        {isPlaying
                                            ? <Pause className="w-4 h-4 text-white" fill="currentColor" />
                                            : <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />}
                                    </button>
                                    <span className="text-white/60 text-xs font-mono tabular-nums">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                    <span className="flex-1 text-white/80 text-sm font-semibold truncate text-center px-2">{title}</span>

                                    {/* Online Subtitles Button */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsSubtitleMenuOpen(!isSubtitleMenuOpen)}
                                            className={`h-9 px-3 rounded-full flex items-center gap-1.5 justify-center transition-colors backdrop-blur-sm text-xs font-medium border ${subtitleUrl ? 'bg-[#8C3FE8]/80 text-white border-[#8C3FE8]' : 'bg-white/10 text-white hover:bg-white/20 border-white/10'}`}
                                            title="Online Subtitles"
                                        >
                                            <Captions className="w-4 h-4" />
                                            <span className="hidden sm:inline">Subtitles</span>
                                            {availableSubtitles.length > 0 && (
                                                <span className="bg-[#8C3FE8] text-white text-[10px] px-1.5 rounded-full ml-1">
                                                    {availableSubtitles.length}
                                                </span>
                                            )}
                                        </button>

                                        {/* Subtitles Dropdown Menu */}
                                        {isSubtitleMenuOpen && (
                                            <div className="absolute bottom-full right-0 mb-3 w-72 max-h-80 overflow-y-auto bg-black/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col hide-scrollbar origin-bottom animate-in fade-in slide-in-from-bottom-4 duration-200">
                                                <div className="p-3 border-b border-white/10 flex justify-between items-center sticky top-0 bg-black/90 backdrop-blur-md z-10">
                                                    <span className="text-white text-sm font-medium">Arabic Subtitles</span>
                                                    <span className="text-white/50 text-xs">{availableSubtitles.length} found</span>
                                                </div>

                                                {availableSubtitles.length === 0 ? (
                                                    <div className="p-6 text-center text-white/50 text-sm">
                                                        No Arabic subtitles found for this title.
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col p-1.5">
                                                        {availableSubtitles.map((sub) => (
                                                            <button
                                                                key={sub.id}
                                                                onClick={() => {
                                                                    setSubtitleUrl(`/api/subtitles?downloadUrl=${encodeURIComponent(sub.downloadUrl)}`);
                                                                    setIsSubtitleMenuOpen(false);

                                                                    // Auto-enable track in the video element
                                                                    setTimeout(() => {
                                                                        const video = videoRef.current;
                                                                        if (video && video.textTracks && video.textTracks.length > 0) {
                                                                            video.textTracks[0].mode = 'showing';
                                                                        }
                                                                    }, 100);
                                                                }}
                                                                className={`flex flex-col text-left p-2.5 rounded-lg hover:bg-white/10 transition-colors group ${subtitleUrl?.includes(encodeURIComponent(sub.downloadUrl)) ? 'bg-[#8C3FE8]/20 border border-[#8C3FE8]/30' : 'border border-transparent'
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between items-start w-full gap-2">
                                                                    <span className="text-white/90 text-xs font-medium leading-tight line-clamp-2 break-all group-hover:text-white transition-colors">
                                                                        {sub.filename}
                                                                    </span>
                                                                    <div className="flex items-center gap-1 shrink-0 bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                                        ★ {sub.rating.toFixed(1)}
                                                                    </div>
                                                                </div>
                                                                <span className="text-white/40 text-[10px] mt-1.5 uppercase tracking-wider font-semibold">
                                                                    {sub.format} format
                                                                </span>
                                                            </button>
                                                        ))}

                                                        {subtitleUrl && (
                                                            <button
                                                                onClick={() => {
                                                                    setSubtitleUrl(null);
                                                                    setIsSubtitleMenuOpen(false);
                                                                }}
                                                                className="mt-2 text-center py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg text-xs font-medium transition-colors"
                                                            >
                                                                Turn Off Subtitles
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={toggleMute} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm">
                                        {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                                    </button>
                                    <button onClick={toggleFullscreen} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm">
                                        <Maximize className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                        onClick={() => setClosed(true)}
                                        className="w-9 h-9 rounded-full bg-black/60 hover:bg-red-500/80 flex items-center justify-center transition-colors backdrop-blur-sm border border-white/20"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
