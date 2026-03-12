import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import { Play, Plus, Check, Star, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/sign-in");
    }

    // Mock content details
    const content = {
        id: params.id,
        title: "The Silent Echo",
        description: "In a distant future where sound has been weaponized, a deaf mechanic discovers an ancient echo that could restore balance to a fractured world. She must navigate dangerous territories while being hunted by the silence enforcers.",
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop",
        backdropUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
        imdbRating: 8.4,
        genre: ["Sci-Fi", "Action", "Thriller"],
        year: "2024",
        runtime: 124,
        director: "Sarah Jenkins",
        cast: ["Emily Blunt", "Michael B. Jordan", "Cillian Murphy"],
    };

    return (
        <div className="min-h-screen bg-transparent pb-20">
            {/* Backdrop Hero */}
            <div className="relative w-full h-[60vh] min-h-[400px]">
                <Image
                    src={content.backdropUrl}
                    alt={content.title}
                    fill
                    className="object-cover object-top opacity-50"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D1A] via-[#0D0D1A]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D1A] via-[#0D0D1A]/50 to-transparent" />
            </div>

            {/* Content Details */}
            <div className="container mx-auto px-4 relative z-10 -mt-[30vh]">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                    {/* Poster */}
                    <div className="flex-shrink-0 w-48 md:w-72 shadow-2xl rounded-xl overflow-hidden self-center md:self-start ring-1 ring-white/10">
                        <div className="relative aspect-[2/3] w-full">
                            <Image
                                src={content.posterUrl}
                                alt={content.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-grow pt-4 md:pt-12 text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-bebas font-bold text-white tracking-wide mb-4">
                            {content.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm text-gray-300 font-semibold mb-8">
                            <div className="flex items-center gap-1 text-[#F5A623]">
                                <Star className="w-4 h-4 fill-current" />
                                <span>{content.imdbRating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{content.year}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{content.runtime} min</span>
                            </div>
                            <div className="flex bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)] px-2 py-1 rounded gap-2">
                                {content.genre.map((g, i) => (
                                    <span key={i} className="text-xs text-white/80">{g}{i < content.genre.length - 1 && " •"}</span>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center md:justify-start">
                            <Button size="lg" className="h-14 px-8 text-base font-bold bg-white text-black text-white hover:bg-white text-black/90 transition-transform hover:scale-105">
                                <Play className="w-5 h-5 mr-2 fill-current" />
                                Watch Now
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-transform hover:scale-105">
                                <Plus className="w-5 h-5 mr-2" />
                                Add to List
                            </Button>
                        </div>

                        <div className="space-y-6 max-w-3xl border-t border-white/10 pt-6 mx-auto md:mx-0 text-left">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Overview</h3>
                                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                                    {content.description}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 font-medium">Director:</span>
                                    <span className="text-gray-200 ml-2">{content.director}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 font-medium">Cast:</span>
                                    <span className="text-gray-200 ml-2">{content.cast.join(", ")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
