import { db } from "@/lib/db";
import { ListVideo, TrendingUp, Users, Clock, Flame, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminWatchlistsPage() {
    // Analytics on top saved content
    const trendingItems = await db.watchlist.groupBy({
        by: ['movieId', 'showId'],
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 5
    });

    // Populate titles for trending (in real app, join or multi-step)
    const hotContent = await Promise.all(trendingItems.map(async (item) => {
        if (item.movieId) {
            const movie = await db.movie.findUnique({ where: { id: item.movieId } });
            return { title: movie?.title, count: item._count.userId, type: 'Movie' };
        } else {
            const show = await db.show.findUnique({ where: { id: item.showId! } });
            return { title: show?.title, count: item._count.userId, type: 'Series' };
        }
    }));

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 tracking-wide">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                        <ListVideo className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Watchlist Discovery</h1>
                </div>
                <p className="text-gray-400 text-lg">Monitor trending content and user engagement metrics.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Trending Snapshot */}
                <section className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[32px] p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <h2 className="text-xl font-bold text-white">Hot This Week</h2>
                        </div>
                        <TrendingUp className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="space-y-4">
                        {hotContent.map((content, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-black text-white/10 w-6">0{idx + 1}</span>
                                    <div>
                                        <h3 className="text-white font-bold">{content.title}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{content.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-white">{content.count}</span>
                                    <p className="text-[10px] text-gray-500 uppercase">Saves</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Engagement Stats */}
                <section className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[32px] p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <Users className="w-5 h-5 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">Engagement Analytics</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <Clock className="w-5 h-5 text-blue-400 mb-3" />
                            <div className="text-2xl font-bold text-white">12.4m</div>
                            <div className="text-xs text-gray-500 font-medium">Avg. Watchtime</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <ListVideo className="w-5 h-5 text-pink-400 mb-3" />
                            <div className="text-2xl font-bold text-white">842</div>
                            <div className="text-xs text-gray-500 font-medium">New Watchlists</div>
                        </div>
                    </div>

                    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[#E94560]/20 to-transparent border border-[#E94560]/10">
                        <h3 className="text-[#E94560] font-bold mb-1">Retention Alert</h3>
                        <p className="text-sm text-gray-400">Users who add 3+ items to their list are 45% more likely to renew their premium subscription.</p>
                    </div>
                </section>
            </div>

            <section className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Active Watchlists</h2>
                    <Button variant="ghost" className="text-sm text-gray-400 hover:text-white">Export CSV</Button>
                </div>
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                    <MinusCircle className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-lg font-bold text-white">No custom reports active</h3>
                    <p className="text-sm text-gray-400 max-w-xs">User-specific watchlist tracking is enabled but no data is currently flagged for review.</p>
                </div>
            </section>
        </div>
    );
}
