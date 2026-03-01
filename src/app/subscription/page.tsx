"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PricingSection from "@/components/home/PricingSection";

export default function SubscriptionPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (status === "unauthenticated") {
        // Redirect unauthenticated users to sign-in
        router.push("/sign-in");
        return null;
    }

    const handleSubscribe = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
            });

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error) {
            console.error("Subscription error:", error);
            alert("Something went wrong initializing the checkout.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent pt-16">
            <div className="text-center pt-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
                <p className="text-gray-400 max-w-lg mx-auto">Get unlimited access to thousands of movies and series.</p>
            </div>

            {/* 
        We reuse PricingSection and pass the callback to orchestrate Stripe checkout 
      */}
            <div className="-mt-12">
                <PricingSection onSubscribe={handleSubscribe} isLoading={isLoading} />
            </div>
        </div>
    );
}
