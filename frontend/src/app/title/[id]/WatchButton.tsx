"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WatchButton({ content }: { content: any }) {

    const handleWatchClick = () => {
        if (content.type === "series") {
            // For series: scroll to episodes tab and activate it
            // Find the Episodes tab button and click it
            const tabButtons = document.querySelectorAll("button");
            tabButtons.forEach((btn) => {
                if (btn.textContent?.trim() === "Episodes") {
                    btn.click();
                }
            });
            // Scroll to the tabs area
            setTimeout(() => {
                const episodesSection = document.querySelector(".season-tabs, .hide-scrollbar");
                if (episodesSection) {
                    episodesSection.scrollIntoView({ behavior: "smooth", block: "start" });
                } else {
                    const playerSection = document.getElementById("video-player");
                    if (playerSection) {
                        playerSection.scrollIntoView({ behavior: "smooth" });
                    }
                }
            }, 100);
        } else {
            // For movies: scroll to player (auto-plays)
            const playerSection = document.getElementById("video-player");
            if (playerSection) {
                playerSection.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <Button
            size="lg"
            onClick={handleWatchClick}
            className="h-[52px] px-8 rounded-[16px] text-[16px] font-semibold bg-white text-black hover:bg-white/90 shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95"
        >
            <Play className="w-5 h-5 mr-2 fill-black" />
            {content.type === "series" ? "Browse Episodes" : "Play"}
        </Button>
    );
}
