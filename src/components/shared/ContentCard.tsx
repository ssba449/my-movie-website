"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Play, Heart, Info } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContentCardProps {
    id: string;
    title: string;
    posterUrl: string;
    imdbRating: number;
    genre: string;
    year?: string;
    runtime?: number;
    trailerUrl?: string;
}

export default function ContentCard({
    id,
    title,
    posterUrl,
    imdbRating,
    genre,
    year,
    runtime,
    trailerUrl
}: ContentCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    return (
        <Link
            href={`/title/${id}`}
            className="block relative focus:outline-none"
        >
            <div
                className="relative w-[140px] h-[210px] md:w-[180px] md:h-[270px] xl:w-[220px] xl:h-[330px] rounded-[28px] overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group shrink-0 bg-card shadow-[0_20px_60px_rgba(0,0,0,0.35)] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Base Poster View */}
                <Image
                    src={posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=220&auto=format&fit=crop"}
                    alt={title || "Content poster"}
                    fill
                    sizes="(max-width: 768px) 140px, (max-width: 1280px) 180px, 220px"
                    className="object-cover transition-opacity duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                />

                {/* Top Right Genre Badge (Default State) */}
                <div className="absolute top-3 right-3 transition-opacity duration-700 group-hover:opacity-0">
                    <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] text-white/90 border border-[rgba(255,255,255,0.12)] text-[10px] px-2.5 py-1 rounded-[8px] font-medium tracking-wide">
                        {genre.split(",")[0]}
                    </div>
                </div>

                {/* Bottom Left IMDB Badge (Default State) */}
                <div className="absolute bottom-3 left-3 flex items-center bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] text-white px-2 py-1 rounded-[8px] border border-[rgba(255,255,255,0.12)] text-[10px] font-bold transition-opacity duration-700 group-hover:opacity-0">
                    <Star className="w-3 h-3 mr-1 fill-white text-white" />
                    {imdbRating}
                </div>

                {/* Hover State Overlay */}
                <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 flex flex-col justify-end p-5 transition-opacity duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isHovered ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button
                            className="text-white hover:text-white/70 transition-colors bg-black/40 p-1.5 rounded-full"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Add to favorites logic here */ }}
                        >
                            <Heart className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-[rgba(255,255,255,0.2)] backdrop-blur-md flex items-center justify-center pl-1 shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-[rgba(255,255,255,0.12)]">
                            <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                    </div>

                    <div className="relative z-10 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
                        <h4 className="text-[16px] text-white font-semibold line-clamp-2 leading-tight mb-1.5 tracking-wide">{title}</h4>
                        <div className="flex items-center gap-2 text-[12px] text-white/50 mb-2 font-medium">
                            {year && <span>{year}</span>}
                            {runtime && <span>{runtime}m</span>}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-[6px] border border-white/10 text-white/70 inline-block font-medium tracking-wide">
                            {genre.split(",").slice(0, 2).join(", ")}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
