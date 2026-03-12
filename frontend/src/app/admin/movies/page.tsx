import { db } from "@/lib/db";
import Link from "next/link";
import { Search, MoreVertical, Plus, Filter, PlayCircle, Clock, Calendar, Film } from "lucide-react";
import Image from "next/image";

export default async function AdminMoviesPage() {
    const movies = await db.movie.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 tracking-wide">
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Movie Library</h1>
                    <p className="text-gray-400">Manage your platform's cinematic content.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search titles, genres, or TMDB ID..."
                            className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all w-[320px]"
                        />
                    </div>

                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-full text-sm font-medium transition-colors border border-white/5">
                        <Filter className="w-4 h-4" />
                        Options
                    </button>

                    <Link href="/admin/import">
                        <button className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-4 py-2.5 rounded-full text-sm font-bold transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-transparent">
                            <Plus className="w-4 h-4" />
                            Import Content
                        </button>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {movies.map((m) => (
                    <div key={m.id} className="group relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
                        <div className="aspect-[2/3] relative w-full overflow-hidden bg-white/5">
                            {m.poster ? (
                                <Image
                                    src={m.poster}
                                    alt={m.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                    <Film className="w-12 h-12" />
                                </div>
                            )}

                            {/* Action Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                                    Edit Details
                                </button>
                                <button className="bg-white/20 text-white backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 border border-white/10 transition-colors">
                                    Manage Video
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="text-white font-medium text-sm line-clamp-1 mb-1" title={m.title}>{m.title}</h3>

                            <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {m.releaseYear || "Unknown"}
                                </span>
                                {(m.duration ?? 0) > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {Math.floor(m.duration! / 60)}m
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {movies.length === 0 && (
                <div className="w-full py-20 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Film className="w-8 h-8 text-white/30" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No movies found</h3>
                    <p className="text-gray-400 max-w-md">Your movie library is empty. Click the 'Import Content' button to fetch titles from TMDB.</p>
                </div>
            )}
        </div>
    );
}
