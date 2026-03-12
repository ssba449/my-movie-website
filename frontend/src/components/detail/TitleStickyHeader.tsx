"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TitleStickyHeaderProps {
    content: any;
}

export default function TitleStickyHeader({ content }: TitleStickyHeaderProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show header when user scrolls past the main hero panel
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isVisible
                    ? "opacity-100 translate-y-0 backdrop-blur-[40px] bg-[rgba(11,11,15,0.85)] border-b border-[rgba(255,255,255,0.08)] shadow-[0_20px_60px_rgba(0,0,0,0.5)] h-[80px]"
                    : "opacity-0 -translate-y-[20px] pointer-events-none h-[60px]"
                }`}
        >
            <div className="max-w-[1440px] mx-auto h-full px-6 md:px-16 flex items-center justify-between">
                <div>
                    <h2 className="text-[18px] md:text-[22px] font-bold text-white uppercase tracking-tight">{content.title}</h2>
                    <p className="text-[12px] text-white/50 tracking-wide">{content.releaseYear} • {content.type === 'movie' ? 'Movie' : 'Series'}</p>
                </div>

                <Button className="h-[44px] px-6 rounded-[12px] text-[14px] font-semibold bg-white text-black hover:bg-white/90 shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95">
                    <Play className="w-4 h-4 mr-2 fill-black" />
                    Play Now
                </Button>
            </div>
        </div>
    );
}
