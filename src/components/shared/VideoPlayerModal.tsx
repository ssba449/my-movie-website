"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import Hls from "hls.js";

interface VideoPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
    title: string;
}

export default function VideoPlayerModal({ isOpen, onClose, videoUrl, title }: VideoPlayerModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showTitleOverlay, setShowTitleOverlay] = useState(true);

    useEffect(() => {
        if (!isOpen || !videoRef.current) return;

        const video = videoRef.current;
        setIsLoading(true);
        setShowTitleOverlay(true);

        const initPlayer = () => {
            // Basic HLS.js Setup as requested
            if (Hls.isSupported() && videoUrl.includes(".m3u8")) {
                const hls = new Hls({
                    maxBufferLength: 30,
                    enableWorker: true,
                });

                hls.loadSource(videoUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setIsLoading(false);
                    video.play().catch((e) => console.error("Autoplay blocked:", e));
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error("HLS Error:", data);
                    setIsLoading(false);
                });

                hlsRef.current = hls;
            } else if (video.canPlayType("application/vnd.apple.mpegurl") || !videoUrl.includes(".m3u8")) {
                // Native HLS (Safari) or standard MP4 fallback
                video.src = videoUrl;
                video.addEventListener("loadedmetadata", () => {
                    setIsLoading(false);
                    video.play().catch((e) => console.error("Autoplay blocked:", e));
                });
            }
        };

        // Small delay to ensure the modal animation completes before heavy video loading
        const timer = setTimeout(initPlayer, 400);

        // Hide title overlay after 5 seconds
        const overlayTimer = setTimeout(() => {
            setShowTitleOverlay(false);
        }, 5000);

        return () => {
            clearTimeout(timer);
            clearTimeout(overlayTimer);
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            video.src = ""; // Clean up
        };
    }, [isOpen, videoUrl]);

    // Handle Escape Key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const encodedTitle = encodeURIComponent(title || "Selected Content");

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
                    onClick={onClose}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 z-[110] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <motion.div
                        initial={{ scale: 0.96, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.96, y: 20, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
                        className="relative w-full max-w-[1600px] aspect-video bg-black shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden rounded-[24px] mx-4 md:mx-12 ring-1 ring-white/10 group"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks on video from closing modal
                    >
                        {isLoading && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
                                <Loader2 className="w-12 h-12 text-white animate-spin opacity-50" />
                            </div>
                        )}

                        <AnimatePresence>
                            {showTitleOverlay && !isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.8 }}
                                    className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40"
                                >
                                    <div className="text-center">
                                        <p className="text-white/70 text-lg md:text-2xl mb-2 font-medium tracking-widest uppercase">Now Playing</p>
                                        <h2 className="text-white text-4xl md:text-7xl font-bold tracking-tight drop-shadow-2xl">{title}</h2>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <video
                            ref={videoRef}
                            className="w-full h-full object-contain"
                            controls
                            autoPlay
                            playsInline
                            crossOrigin="anonymous"
                        >
                            <track
                                kind="subtitles"
                                src={`/api/subtitles?title=${encodedTitle}&lang=en`}
                                srcLang="en"
                                label="English"
                                default
                            />
                            <track
                                kind="subtitles"
                                src={`/api/subtitles?title=${encodedTitle}&lang=es`}
                                srcLang="es"
                                label="Español"
                            />
                            <track
                                kind="subtitles"
                                src={`/api/subtitles?title=${encodedTitle}&lang=fr`}
                                srcLang="fr"
                                label="Français"
                            />
                        </video>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
