"use client";

import { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";
import ContentRow from "@/components/home/ContentRow";
import EmbedPlayer from "@/components/shared/EmbedPlayer";

interface TitleTabsManagerProps {
    content: any;
    moreLikeThis: any[];
}

export default function TitleTabsManager({ content, moreLikeThis }: TitleTabsManagerProps) {
    const tabs = ["Overview", "Episodes", "More Like This"];

    // Only show Episodes tab if there are actually episodes
    const availableTabs = (content.type === "series" && content.episodes?.length > 0)
        ? tabs
        : tabs.filter(t => t !== "Episodes");

    const [activeTab, setActiveTab] = useState(availableTabs[0]);

    // Video Player State - Default to episode 1 if series
    const [selectedSeason, setSelectedSeason] = useState<number>(content.episodes?.[0]?.seasonNumber || 1);
    const [selectedEpisode, setSelectedEpisode] = useState<number>(content.episodes?.[0]?.episodeNumber || 1);

    const handlePlayEpisode = (episode: any) => {
        setSelectedSeason(episode.seasonNumber || 1);
        setSelectedEpisode(episode.episodeNumber || 1);

        // Scroll to player
        const playerSection = document.getElementById("video-player");
        if (playerSection) {
            playerSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="relative w-full max-w-[1200px] mx-auto mt-12 z-20 sm:px-8 flex flex-col gap-12">

            {/* Embed Video Player Section */}
            <div id="video-player" className="scroll-mt-24">
                <EmbedPlayer
                    tmdbId={content.tmdbId}
                    type={content.type}
                    seasonNumber={selectedSeason}
                    episodeNumber={selectedEpisode}
                />
            </div>

            <div className="flex flex-col">
                {/* Tabs Header */}
                <div className="flex items-center gap-8 border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
                    {availableTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-[16px] font-semibold tracking-wide whitespace-nowrap transition-colors relative ${activeTab === tab ? "text-white" : "text-white/40 hover:text-white/80"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-t-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content: OVERVIEW */}
                <div className={`transition-opacity duration-500 ${activeTab === "Overview" ? "opacity-100 block" : "opacity-0 hidden"}`}>
                    <div className="p-8 md:p-14 bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.12)] rounded-[32px] flex flex-col lg:flex-row gap-16 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                        {/* Left: Cast & Crew */}
                        <div className="flex-1">
                            <h3 className="text-[20px] font-semibold text-white tracking-wide mb-6">Cast & Crew</h3>
                            {(content.cast && content.cast.length > 0) ? (
                                <div className="flex flex-wrap gap-6 mb-8">
                                    {content.cast.split(',').slice(0, 6).map((actor: string, i: number) => (
                                        <div key={i} className="flex flex-col items-center gap-3 w-[72px] group">
                                            <div className="w-[72px] h-[72px] rounded-full bg-[#2C2C2E] overflow-hidden flex items-center justify-center text-white/50 text-xl font-medium ring-2 ring-transparent group-hover:ring-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:hover:-translate-y-2">
                                                {actor.charAt(0)}
                                            </div>
                                            <span className="text-[12px] text-center text-white/70 leading-tight font-medium group-hover:text-white transition-colors line-clamp-2">{actor}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-white/40 text-[14px]">Cast information not available.</p>
                            )}

                            {content.director && (
                                <div className="mt-8">
                                    <p className="text-[14px] text-white/50 font-medium">Director</p>
                                    <p className="text-[16px] text-white font-medium">{content.director}</p>
                                </div>
                            )}
                        </div>

                        {/* Right: Technical Specs */}
                        <div className="w-full lg:w-72 shrink-0">
                            <h3 className="text-[20px] font-semibold text-white tracking-wide mb-6">Information</h3>
                            <ul className="space-y-4">
                                <li className="flex justify-between border-b border-white/5 pb-3">
                                    <span className="text-[14px] text-white/50">Language</span>
                                    <span className="text-[14px] text-white font-medium capitalize">{content.language === 'en' ? 'English' : content.language || 'English'}</span>
                                </li>
                                <li className="flex justify-between border-b border-white/5 pb-3">
                                    <span className="text-[14px] text-white/50">Subtitles</span>
                                    <span className="text-[14px] text-white font-medium">English, Español, Français</span>
                                </li>
                                <li className="flex justify-between border-b border-white/5 pb-3">
                                    <span className="text-[14px] text-white/50">Resolution</span>
                                    <span className="text-[14px] text-white font-medium">4K Ultra HD</span>
                                </li>
                                <li className="flex justify-between border-b border-white/5 pb-3">
                                    <span className="text-[14px] text-white/50">Studio</span>
                                    <span className="text-[14px] text-white font-medium">StreamVault</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Tab Content: EPISODES */}
                {content.type === "series" && content.episodes && (
                    <div className={`transition-opacity duration-500 ${activeTab === "Episodes" ? "opacity-100 block" : "opacity-0 hidden"}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {content.episodes.map((ep: any) => {
                                const isSelected = selectedSeason === ep.seasonNumber && selectedEpisode === ep.episodeNumber;
                                return (
                                    <div
                                        key={ep.id}
                                        onClick={() => handlePlayEpisode(ep)}
                                        className={`group relative flex items-center backdrop-blur-xl border rounded-[20px] p-4 cursor-pointer transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isSelected
                                                ? "bg-white/20 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                                : "bg-[rgba(28,28,30,0.5)] border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.1)]"
                                            }`}
                                    >
                                        <span className={`absolute left-6 font-mono text-xl transition-opacity ${isSelected ? "text-white opacity-0 group-hover:opacity-0" : "text-white/40 group-hover:opacity-0"}`}>
                                            {ep.episodeNumber}
                                        </span>
                                        <div className={`absolute left-5 w-10 h-10 rounded-full bg-white flex items-center justify-center transition-opacity duration-500 transform ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isSelected ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100"}`}>
                                            <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                                        </div>
                                        <div className="ml-16 pr-4">
                                            <h4 className={`text-[16px] font-medium mb-1 transition-colors line-clamp-1 ${isSelected ? "text-white" : "text-white group-hover:text-white/80"}`}>{ep.title}</h4>
                                            <p className="text-[13px] text-white/50 line-clamp-2">{ep.description}</p>
                                        </div>
                                        {ep.duration && (
                                            <span className="ml-auto text-[13px] text-white/40 block w-12 text-right">{Math.floor(ep.duration / 60)}m</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tab Content: MORE LIKE THIS */}
                <div className={`transition-opacity duration-500 ${activeTab === "More Like This" ? "opacity-100 block" : "opacity-0 hidden"}`}>
                    <div className="mt-[-64px]">
                        <ContentRow title="" items={moreLikeThis.filter((m: any) => m.id !== content.id)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
