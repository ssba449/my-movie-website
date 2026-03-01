"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Search, Heart, User } from "lucide-react";

export default function BottomTabBar() {
    const pathname = usePathname();

    const tabs = [
        { name: "Home", href: "/", icon: Home },
        { name: "Movies", href: "/movies", icon: Film },
        { name: "Series", href: "/series", icon: Tv },
        { name: "Search", href: "/search", icon: Search },
        { name: "My List", href: "/my-list", icon: Heart },
        { name: "Profile", href: "/profile", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full h-[74px] z-50 md:hidden bg-[rgba(11,11,15,0.85)] backdrop-blur-[40px] border-t border-[rgba(255,255,255,0.08)] pb-safe">
            <div className="flex justify-around items-center h-full px-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors relative ${isActive ? "text-white" : "text-white/40 hover:text-white/80"
                                }`}
                        >
                            <tab.icon className={`w-6 h-6 ${isActive ? "fill-white/10" : "fill-transparent"}`} />

                            {/* SOP: Hover/Active 4px Dot Indicator */}
                            {isActive && (
                                <div className="absolute -bottom-1 w-[4px] h-[4px] bg-white rounded-full 
                                                shadow-[0_0_8px_rgba(255,255,255,0.8)] 
                                                border border-white/50" />
                            )}

                            <span className="text-[10px] font-medium tracking-wide">
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
