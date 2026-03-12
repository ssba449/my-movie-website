"use client";

import { Crown, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PremiumAccessOverlayProps {
    posterUrl?: string;
}

export default function PremiumAccessOverlay({ posterUrl }: PremiumAccessOverlayProps) {
    return (
        <div className="relative w-full aspect-video sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] bg-black/40 overflow-hidden rounded-2xl border border-white/10 flex items-center justify-center group">
            {/* Background Backdrop */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm"
                style={{ backgroundImage: posterUrl ? `url(${posterUrl})` : undefined }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/80 to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6 px-10 text-center max-w-lg">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.4)] border border-white/20 animate-pulse">
                    <Crown className="w-10 h-10 text-black fill-black" />
                </div>

                <div className="space-y-3">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">StreamVault+ Exclusive</h2>
                    <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed">
                        This premium title is reserved for our elite members. Upgrade now to unlock instant access to our entire 4K library.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                    <Link href="/checkout">
                        <Button size="lg" className="bg-[#FF3B30] text-white hover:bg-[#D70015] rounded-full px-8 h-[52px] text-[15px] font-bold tracking-wide shadow-[0_10px_30px_rgba(255,59,48,0.3)] transition-all hover:scale-105 active:scale-95">
                            Get StreamVault+
                        </Button>
                    </Link>
                    <Link href="/pricing">
                        <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-8 h-[52px] text-[15px] font-semibold transition-colors">
                            View Plans
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-2 mt-8 py-2 px-4 rounded-full bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
                    <Lock className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/40">Secure Premium Content</span>
                </div>
            </div>
        </div>
    );
}
