"use client";

import { useEffect, useRef } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

interface VideoPlayerProps {
    src: string;
    poster?: string;
    type?: "video" | "youtube";
}

export default function VideoPlayer({ src, poster, type = "video" }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<Plyr | null>(null);

    useEffect(() => {
        if (!videoRef.current) return;

        playerRef.current = new Plyr(videoRef.current, {
            controls: [
                "play-large", "play", "progress", "current-time", "duration",
                "mute", "volume", "captions", "settings", "fullscreen"
            ],
            settings: ["quality", "speed"],
        });

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, []);

    return (
        <div className="w-full h-full rounded-xl overflow-hidden aspect-video bg-black/50 group relative shadow-2xl shadow-primary/10">
            {type === "youtube" ? (
                <div className="plyr__video-embed w-full h-full" ref={videoRef as any}>
                    <iframe
                        src={src}
                        allowFullScreen
                        allow="autoplay"
                    ></iframe>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    playsInline
                    controls
                    data-poster={poster}
                    className="w-full h-full"
                >
                    <source src={src} type="video/mp4" />
                </video>
            )}
        </div>
    );
}
