"use client";

import { useState, useEffect } from "react";
import { Baby, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

export default function KidsModeToggle() {
    const [isKidsMode, setIsKidsMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Read cookie on load
        const cookies = document.cookie.split("; ");
        const kidsCookie = cookies.find(c => c.startsWith("kids_mode="));
        setIsKidsMode(kidsCookie?.split("=")[1] === "true");
        setIsLoading(false);
    }, []);

    const toggleKidsMode = (checked: boolean) => {
        setIsKidsMode(checked);
        document.cookie = `kids_mode=${checked}; path=/; max-age=31536000`; // 1 year

        // Refresh the page to apply filters server-side if needed, 
        // or just trigger re-render
        router.refresh();
    };

    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin opacity-50" />;

    return (
        <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg transition-colors ${isKidsMode ? "bg-yellow-400/20 text-yellow-400" : "bg-white/5 text-white/50"}`}>
                    <Baby className="w-4 h-4" />
                </div>
                <span className="text-[13px] font-medium">Kids Mode</span>
            </div>
            <Switch
                checked={isKidsMode}
                onCheckedChange={toggleKidsMode}
                className="data-[state=checked]:bg-yellow-400"
            />
        </div>
    );
}
