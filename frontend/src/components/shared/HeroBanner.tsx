"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import gsap from "gsap";

interface HeroSlide {
    id: string;
    title: string;
    description?: string | null;
    backdropUrl?: string | null;
}

export default function HeroBanner({ slides }: { slides?: HeroSlide[] }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const displaySlides = slides?.length ? slides : [
        {
            id: "1",
            title: "Watch Anything. Anywhere. Anytime.",
            description: "Movies, Series & Documentaries — All in One Place.",
            backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop",
        },
        {
            id: "2",
            title: "Exclusive Original Series",
            description: "Dive into a world of endless entertainment.",
            backdropUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
        }
    ];

    // GSAP 6-Second Auto-Advance & Progress Bar
    useEffect(() => {
        if (!displaySlides.length) return;

        // Reset all progress bars instantly
        gsap.set(".hero-progress-bar", { width: "0%" });

        // Kill existing timer if it exists to prevent overlap
        const existingTl = gsap.getById("heroTimer");
        if (existingTl) existingTl.kill();

        // Create the 6s timeline
        const tl = gsap.timeline({
            id: "heroTimer",
            onComplete: () => {
                setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
            }
        });

        // Animate ONLY the active slide's progress bar (linear so it fills smoothly over exactly 6s)
        tl.to(`.hero-progress-bar`, {
            width: "100%",
            duration: 6,
            ease: "none"
        });

        return () => {
            tl.kill();
        };
    }, [currentSlide, displaySlides.length]);

    // GSAP Parallax Hover Effect
    useEffect(() => {
        const container = containerRef.current;
        const card = cardRef.current;
        if (!container || !card) return;

        // Ensure GSAP respects the duration & easing from Apple specs
        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotateX = -(y / rect.height) * 8; // Max 8 degrees
            const rotateY = (x / rect.width) * 8;

            gsap.to(card, {
                rotationX: rotateX,
                rotationY: rotateY,
                transformPerspective: 1200,
                ease: "power3.out",
                duration: 0.6
            });
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                rotationX: 0,
                rotationY: 0,
                ease: "power3.out",
                duration: 0.8
            });
        };

        // Only add events on desktop
        if (window.innerWidth > 1024) {
            container.addEventListener("mousemove", handleMouseMove);
            container.addEventListener("mouseleave", handleMouseLeave);
        }

        return () => {
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    const slide = displaySlides[currentSlide];

    return (
        <div ref={containerRef} className="relative w-full h-[460px] md:h-[520px] xl:h-[620px] pt-16 flex flex-col items-center justify-center overflow-hidden group">
            {/* Full-bleed blurred artwork background */}
            {displaySlides.map((s, index) => (
                <div
                    key={s.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                >
                    <Image
                        src={s.backdropUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"}
                        alt={s.title || "Banner Image"}
                        fill
                        className="object-cover object-center blur-3xl scale-125 saturate-150 opacity-40 mix-blend-screen"
                        priority={index === 0}
                    />
                </div>
            ))}

            {/* Ambient Gradient Overlay */}
            <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-[#0B0B0F]/40 to-[#0B0B0F] pointer-events-none" />

            {/* Center Hero Card (Apple TV Panel) */}
            <div
                ref={cardRef}
                className="relative z-30 w-full max-w-[980px] h-full sm:h-auto sm:aspect-[21/9] mx-4 rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/10"
                style={{ transformStyle: "preserve-3d" }}
                onMouseEnter={() => {
                    // SOP: Pause timer when mouse enters hero panel
                    const tl = gsap.getById("heroTimer");
                    if (tl) tl.pause();
                }}
                onMouseLeave={() => {
                    const tl = gsap.getById("heroTimer");
                    if (tl) tl.play();
                }}
            >
                {/* Panel Image */}
                {displaySlides.map((s, index) => (
                    <Image
                        key={s.id}
                        src={s.backdropUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"}
                        alt={s.title}
                        fill
                        className={`object-cover object-center transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
                        priority={index === 0}
                    />
                ))}

                {/* Panel Gradient to make text readable */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0F]/90 via-[#0B0B0F]/40 to-transparent" style={{ transform: "translateZ(20px)" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F]/90 via-transparent to-transparent" style={{ transform: "translateZ(20px)" }} />

                {/* Content Layout inside Panel */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 mb-6" style={{ transform: "translateZ(40px)" }}>
                    <div className="max-w-xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-2 uppercase tracking-wide line-clamp-2">
                            {slide.title}
                        </h1>
                        <p className="text-[16px] text-white/80 mb-6 font-medium line-clamp-2">
                            {slide.description}
                        </p>
                        <div className="flex flex-row gap-4 items-center">
                            <Link href={`/title/${slide.id}`}>
                                <Button className="h-[52px] px-8 rounded-[16px] text-[16px] font-semibold bg-[rgba(255,255,255,0.15)] backdrop-blur-md border border-[rgba(255,255,255,0.25)] text-white hover:bg-[rgba(255,255,255,0.22)] shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-transform hover:scale-102 active:scale-95">
                                    <Play className="w-4 h-4 mr-2 fill-white" />
                                    Play
                                </Button>
                            </Link>
                            <Button variant="ghost" className="h-[52px] px-6 rounded-[16px] text-[16px] font-semibold bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.70)] hover:bg-[rgba(255,255,255,0.10)] transition-transform active:scale-95">
                                <Plus className="w-5 h-5 mr-2" />
                                Up Next
                            </Button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Progress Dots (Layer 4) */}
            <div className="relative z-40 mt-8 flex flex-row items-center gap-3">
                {displaySlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className="group relative h-1.5 w-12 rounded-full bg-white/20 overflow-hidden"
                    >
                        {index === currentSlide && (
                            <div className="absolute top-0 left-0 h-full bg-white hero-progress-bar" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
