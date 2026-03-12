import { db } from "@/lib/db";
import Link from "next/link";
import { Search, Plus, Filter, Tv, Layers } from "lucide-react";
import Image from "next/image";

export default async function AdminShowsPage() {
    const shows = await db.show.findMany({
        orderBy: { createdAt: "desc" },
        include: { seasons: true }, // Include seasons to show count
        take: 50,
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 tracking-wide">
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">TV Series Library</h1>
                    <p className="text-gray-400">Manage episodic content, seasons, and stream mapping.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search series or genres..."
                            className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all w-[320px]"
                        />
                    </div>

                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-full text-sm font-medium transition-colors border border-white/5">
                        <Filter className="w-4 h-4" />
                        Filter
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
                {shows.map((s) => (
                    <div key={s.id} className="group relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
                        <div className="aspect-[2/3] relative w-full overflow-hidden bg-white/5 items-center justify-center flex">
                            {s.poster ? (
                                <Image
                                    src={s.poster}
                                    alt={s.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                                />
                            ) : (
                                <Tv className="w-12 h-12 text-white/20" />
                            )}

                            {/* Action Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                                    Manage Seasons
                                </button>
                                <button className="bg-white/20 text-white backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 border border-white/10 transition-colors">
                                    Edit Details
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="text-white font-medium text-sm line-clamp-1 mb-1" title={s.title}>{s.title}</h3>

                            <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                                <span className="bg-white/5 px-2 py-0.5 rounded text-white/70 flex items-center gap-1 border border-white/5">
                                    <Layers className="w-3 h-3" />
                                    {s.seasons?.length || 0} Seasons
                                </span>
                                <span>{s.releaseYear || "Unknown"}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {shows.length === 0 && (
                <div className="w-full py-20 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Tv className="w-8 h-8 text-white/30" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No series found</h3>
                    <p className="text-gray-400 max-w-md">Your TV series library is empty. Click the 'Import Content' button to fetch titles from TMDB.</p>
                </div>
            )}
        </div>
    );
}
