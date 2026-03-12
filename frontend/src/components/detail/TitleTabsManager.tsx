"use client";

import { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";
import ContentRow from "@/components/home/ContentRow";
import ShowboxPlayer from "@/components/shared/ShowboxPlayer";
import SeasonEpisodePicker from "@/components/detail/SeasonEpisodePicker";

interface TitleTabsManagerProps {
    content: any;
    moreLikeThis: any[];
}

export default function TitleTabsManager({ content, moreLikeThis }: TitleTabsManagerProps) {
    const isSeries = content.type === "series";

    const tabs = isSeries
        ? ["Episodes", "Overview", "More Like This"]
        : ["Overview", "More Like This"];

    const [activeTab, setActiveTab] = useState(tabs[0]);

    // For series: episode stream driven externally by SeasonEpisodePicker
    const [episodeStream, setEpisodeStream] = useState<string | null>(null);
    const [episodeTitle, setEpisodeTitle] = useState<string | null>(null);
    const [activeEpisodeId, setActiveEpisodeId] = useState<string | undefined>(undefined);
    const playerRef = useRef<HTMLDivElement>(null);

    const handleEpisodePlay = (streamUrl: string, epName: string, episodeId?: string) => {
        setEpisodeStream(streamUrl);
        setEpisodeTitle(epName);
        setActiveEpisodeId(episodeId);
        // Scroll to player
        setTimeout(() => {
            const playerSection = document.getElementById("video-player");
            if (playerSection) {
                playerSection.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    };

    return (
        <div className="relative w-full max-w-[1200px] mx-auto mt-12 z-20 sm:px-8 flex flex-col gap-12">

            {/* Video Player Section */}
            <div id="video-player" className="scroll-mt-24">
                {isSeries ? (
                    // Series: player only shows when an episode is selected
                    episodeStream ? (
                        <ShowboxPlayer
                            id={content.id}
                            title={episodeTitle || content.title}
                            type="series"
                            posterUrl={content.backdropUrl || content.posterUrl}
                            externalStreamUrl={episodeStream}
                            episodeId={activeEpisodeId}
                        />
                    ) : (
                        <div className="relative w-full aspect-video sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] bg-black/40 overflow-hidden rounded-2xl border border-white/10 flex items-center justify-center">
                            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: content.posterUrl ? `url(${content.posterUrl})` : undefined }} />
                            <div className="absolute inset-0 bg-black/60" />
                            <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-white/[0.08] flex items-center justify-center border border-white/10">
                                    <Play className="w-8 h-8 text-white/40 ml-1" />
                                </div>
                                <p className="text-white/50 text-[15px] font-medium max-w-xs">
                                    Select an episode below to start watching
                                </p>
                            </div>
                        </div>
                    )
                ) : (
                    // Movie: auto-play as before
                    <ShowboxPlayer
                        id={content.id}
                        title={content.title}
                        type="movie"
                        posterUrl={content.backdropUrl || content.posterUrl}
                        tmdbId={content.tmdbId}
                    />
                )}
            </div>

            <div className="flex flex-col">
                {/* Tabs Header */}
                <div className="flex items-center gap-8 border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
                    {tabs.map((tab) => (
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

                {/* Tab Content: EPISODES (series only) */}
                {isSeries && (
                    <div className={`transition-opacity duration-500 ${activeTab === "Episodes" ? "opacity-100 block" : "opacity-0 hidden"}`}>
                        <SeasonEpisodePicker
                            showboxId={content.id}
                            onEpisodePlay={handleEpisodePlay}
                        />
                    </div>
                )}

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
                                    <span className="text-[14px] text-white font-medium">Arabic</span>
                                </li>
                                <li className="flex justify-between border-b border-white/5 pb-3">
                                    <span className="text-[14px] text-white/50">Resolution</span>
                                    <span className="text-[14px] text-white font-medium">4K</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

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
