import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccess() {
    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)] p-8 rounded-3xl shadow-2xl border border-[#2D9E5F]/30 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#2D9E5F]/10 to-transparent pointer-events-none" />

                <div className="w-24 h-24 bg-[#2D9E5F]/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-[#2D9E5F]/10">
                    <CheckCircle className="w-12 h-12 text-[#2D9E5F]" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Welcome to StreamVault! 🎬</h1>
                <p className="text-muted-foreground mb-8 text-sm">
                    Your payment was successful. Your All-Access subscription is now active.
                </p>

                <div className="bg-transparent rounded-xl p-5 mb-8 text-left border border-white/5 shadow-inner">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-semibold">Receipt</p>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-white text-sm font-medium">StreamVault All-Access</span>
                        <span className="text-white font-bold">$3.99</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-white/10 pt-3">
                        <span>Next Billing Date</span>
                        <span>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                    </div>
                </div>

                <Link href="/browse">
                    <Button className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-white text-black/90 text-white rounded-full transition-transform hover:scale-105 shadow-lg shadow-primary/20">
                        Start Watching Now
                    </Button>
                </Link>
            </div>
        </div>
    );
}
