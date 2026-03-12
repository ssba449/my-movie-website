"use client";

import { Check, Lock, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingSectionProps {
    onSubscribe?: () => void;
    isLoading?: boolean;
}

export default function PricingSection({ onSubscribe, isLoading }: PricingSectionProps) {
    return (
        <div className="py-24 md:py-32 bg-transparent relative z-10 w-full flex justify-center">
            <div className="px-4 max-w-[1280px] w-full">

                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-tight mb-4">
                        Choose Your <span className="text-white/50">Experience</span>
                    </h2>
                    <p className="text-[18px] text-white/50 font-medium">Cancel anytime. No hidden fees.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center">

                    {/* Tier 1: StreamVault (Free) */}
                    <div className="flex-1 bg-[rgba(255,255,255,0.05)] backdrop-blur-[40px] rounded-[32px] p-10 md:p-14 border border-[rgba(255,255,255,0.1)] flex flex-col justify-between transition-transform duration-700 hover:scale-[1.02]">
                        <div>
                            <h3
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="text-3xl font-bold text-white tracking-wide mb-2 uppercase cursor-pointer hover:text-white/80 transition-colors"
                            >
                                StreamVault
                            </h3>
                            <p className="text-white/50 font-medium tracking-wide mb-8">Ad-Supported. 1080p HD.</p>

                            <div className="flex items-end gap-1 mb-8">
                                <span className="text-6xl font-bold text-white tracking-tighter">Free</span>
                            </div>

                            <div className="flex flex-col gap-4 text-white/70 text-[16px] font-medium tracking-wide mb-12">
                                <div className="flex items-center gap-4">
                                    <Check className="w-5 h-5 text-white/50 shrink-0" />
                                    <span>Watch with limited ads</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Check className="w-5 h-5 text-white/50 shrink-0" />
                                    <span>1080p HD Video Quality</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Check className="w-5 h-5 text-white/50 shrink-0" />
                                    <span>Unlimited Movies & Series</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="w-full h-14 text-[16px] font-bold rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.15)] text-white transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] active:scale-95"
                        >
                            Start Streaming
                        </Button>
                    </div>

                    {/* Tier 2: StreamVault+ ($3.99) */}
                    <div className="flex-1 bg-[rgba(255,255,255,0.12)] backdrop-blur-[40px] rounded-[32px] p-10 md:p-14 border border-[rgba(255,255,255,0.2)] shadow-[0_30px_80px_rgba(0,0,0,0.5)] flex flex-col justify-between relative transition-transform duration-700 md:hover:scale-[1.04] md:scale-[1.02] z-10 hover:z-20">
                        {/* Premium Badge */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black text-[12px] font-bold uppercase tracking-widest px-6 py-2 rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.3)]">
                            Most Popular
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold text-white tracking-wide mb-2 uppercase flex items-center gap-2">
                                StreamVault<span className="text-[#FF3B30]">+</span>
                            </h3>
                            <p className="text-white/60 font-medium tracking-wide mb-8">Ad-Free. 2K HDR. Spatial Audio.</p>

                            <div className="h-20" />

                            <div className="flex flex-col gap-4 text-white/80 text-[16px] font-medium tracking-wide mb-12">
                                <div className="flex items-center gap-4">
                                    <Check className="w-6 h-6 text-white shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.5)] rounded-full" />
                                    <span className="text-white font-semibold">Ad-Free Cinematic Experience</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Check className="w-5 h-5 text-white/80 shrink-0" />
                                    <span>Stunning 2K HDR & Dolby Vision</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Check className="w-5 h-5 text-white/80 shrink-0" />
                                    <span>Spatial Audio with Dolby Atmos</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Button
                                disabled={true}
                                className="w-full h-16 text-[18px] font-bold rounded-full bg-white/50 text-black mb-6 shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-transform hover:scale-[1.02] active:scale-95 duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] disabled:opacity-70 disabled:hover:scale-100"
                            >
                                Coming Soon
                            </Button>

                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="flex items-center gap-2 text-[12px] text-white/40 font-medium">
                                    <Lock className="w-3 h-3" />
                                    <span>Encrypted & secure checkout</span>
                                </div>
                                <div className="flex items-center gap-4 text-white/30">
                                    {/* Using simple text for logos to avoid needing specific SVG assets. Can be replaced with actual SVGs or Image components later if provided. */}
                                    <span className="font-bold text-[14px] italic">VISA</span>
                                    <div className="flex -space-x-1 items-center">
                                        <div className="w-5 h-5 rounded-full bg-red-500/50 mix-blend-screen mix-blend-color-dodge"></div>
                                        <div className="w-5 h-5 rounded-full bg-orange-500/50 mix-blend-screen mix-blend-color-dodge"></div>
                                    </div>
                                    <span className="font-semibold text-[13px] tracking-tight">Apple Pay</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
