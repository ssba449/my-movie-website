"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import KidsModeToggle from "./KidsModeToggle";

export default function NavBar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={cn(
            "fixed top-0 w-full z-50 transition-all duration-700 ease-in-out hidden md:block",
            isScrolled
                ? "bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] border-b border-[rgba(255,255,255,0.12)]"
                : "bg-gradient-to-b from-[#0B0B0F]/80 to-transparent"
        )}>
            <div className="max-w-[1440px] mx-auto px-10 xl:px-16 h-[72px] flex items-center justify-between">

                {/* Left: Search (Expanding Input) */}
                <div className="flex items-center pointer-events-auto">
                    <form
                        onSubmit={handleSearch}
                        className={cn(
                            "flex items-center bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] rounded-full transition-all duration-500 overflow-hidden border border-[rgba(255,255,255,0.05)] focus-within:border-[rgba(255,255,255,0.3)] focus-within:bg-[rgba(255,255,255,0.2)]",
                            isSearchOpen ? "w-[240px] px-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]" : "w-10 h-10 px-0 justify-center cursor-pointer"
                        )}
                        onClick={() => !isSearchOpen && setIsSearchOpen(true)}
                    >
                        <Search className={cn("w-5 h-5 text-white/70 shrink-0", isSearchOpen && "mr-2")} />

                        <input
                            type="text"
                            placeholder="Movies, shows, and more"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "bg-transparent text-[14px] text-white placeholder-white/40 outline-none w-full transition-opacity duration-300",
                                isSearchOpen ? "opacity-100" : "opacity-0 w-0"
                            )}
                            autoFocus={isSearchOpen}
                        />

                        {isSearchOpen && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsSearchOpen(false);
                                    setSearchQuery("");
                                }}
                                className="text-white/50 hover:text-white p-1 ml-1 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </form>
                </div>

                {/* Center: LOGO & Navigation Links */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-10 justify-center pointer-events-none">
                    <Link href="/" className="text-2xl font-bold tracking-widest text-white flex items-center gap-2 pointer-events-auto">
                        <span className="bg-white text-black px-2 py-0.5 rounded-[6px] tracking-tight">SV</span>
                        <span className="font-medium tracking-[0.2em] text-[15px] text-white/90">STREAMVAULT</span>
                    </Link>

                    {/* Main Nav Links */}
                    <div className="hidden lg:flex items-center gap-6 pointer-events-auto">
                        <Link href="/movies" className="text-[14px] font-medium text-white/70 hover:text-white transition-colors duration-300">
                            Movies
                        </Link>
                        <Link href="/series" className="text-[14px] font-medium text-white/70 hover:text-white transition-colors duration-300">
                            TV Shows
                        </Link>

                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <Link href="/sign-in">
                            <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full px-6 text-[14px] font-semibold tracking-wide">Sign In</Button>
                        </Link>
                        <Link href="/checkout">
                            <Button className="bg-[#FF3B30] text-white hover:bg-[#D70015] rounded-full px-6 h-[40px] text-[14px] font-bold tracking-wide shadow-[0_4px_14px_rgba(255,59,48,0.4)] transition-transform hover:scale-105 active:scale-95">Get StreamVault+</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
