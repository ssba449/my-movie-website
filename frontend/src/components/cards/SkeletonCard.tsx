"use client";

import { motion } from "framer-motion";

export function SkeletonCard() {
    return (
        <div className="relative shrink-0 w-[140px] h-[210px] md:w-[180px] md:h-[270px] lg:w-[220px] lg:h-[330px] rounded-[20px] md:rounded-[24px] lg:rounded-[28px] overflow-hidden bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
            {/* Shimmer Effect */}
            <motion.div
                className="absolute inset-0 -translate-x-full"
                animate={{
                    translateX: ["-100%", "100%"]
                }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear"
                }}
                style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)"
                }}
            />
        </div>
    );
}

export function SkeletonRow() {
    return (
        <div className="flex gap-6 overflow-hidden pl-4 md:pl-10 xl:pl-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
