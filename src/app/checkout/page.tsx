"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Check, Shield, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CheckoutPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (!session) {
        router.push("/sign-in?callbackUrl=/checkout");
        return null;
    }

    // Prevent double-subscribing
    if ((session?.user as any)?.subscriptionStatus === "StreamVault+") {
        router.push("/");
        return null;
    }

    const handleUpgrade = async () => {
        setIsLoading(true);

        try {
            const res = await fetch("/api/user/subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: "StreamVault+" }),
            });

            if (!res.ok) throw new Error("Upgrade failed");

            // Update NextAuth Session gracefully
            await update({
                ...session,
                user: {
                    ...session.user,
                    subscriptionStatus: "StreamVault+"
                }
            });

            toast.success("Welcome to StreamVault+", {
                description: "Your account is now upgraded to Premium.",
            });

            // Redirect user to homepage
            router.push("/");
            router.refresh();

        } catch (error) {
            toast.error("Upgrade error", {
                description: "Something went wrong while processing your request.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center relative p-6 pt-24 overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FF3B30] opacity-[0.05] blur-[150px] pointer-events-none rounded-full" />

            <div className="max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                {/* Left Side: Copy & Benefits */}
                <div className="flex flex-col justify-center">
                    <Link href="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium w-fit">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to browsing
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
                        Upgrade to <br />
                        StreamVault<span className="text-[#FF3B30]">+</span>
                    </h1>

                    <p className="text-[17px] text-white/60 font-medium leading-relaxed mb-10 max-w-md">
                        Unlock the ultimate cinematic experience. Watch thousands of movies and TV shows without interruptions.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-white/90 font-medium text-[16px]">
                            <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <span>Ad-Free Cinematic Experience</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/90 font-medium text-[16px]">
                            <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <span>Stunning 2K HDR Visuals</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/90 font-medium text-[16px]">
                            <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <span>Spatial Audio Support</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Checkout Panel */}
                <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.1)] rounded-[32px] p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.5)]">

                    <div className="bg-[rgba(0,0,0,0.3)] rounded-[20px] p-6 border border-white/5 mb-8">
                        <div className="flex justify-between items-center text-white mb-2">
                            <span className="font-semibold tracking-wide">StreamVault+</span>
                            <span className="font-bold text-2xl tracking-tighter">$3.99<span className="text-sm text-white/50 font-medium tracking-normal">/mo</span></span>
                        </div>
                        <p className="text-[13px] text-white/40 font-medium">Billed monthly.</p>
                    </div>

                    <div className="space-y-4 mb-10">
                        <div className="flex justify-between text-white/70 text-[14px] font-medium border-b border-white/10 pb-4">
                            <span>Subtotal</span>
                            <span>$3.99</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-[18px]">
                            <span>Total due today</span>
                            <span>$3.99</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleUpgrade}
                        disabled={isLoading}
                        className="w-full h-14 bg-white hover:bg-white/90 text-black text-[16px] font-bold rounded-full transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                        ) : (
                            "Confirm Upgrade"
                        )}
                    </Button>

                    <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-white/30 font-medium">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Mock transaction for Apple TV UI demonstration</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
