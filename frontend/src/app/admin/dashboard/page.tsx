import { db } from "@/lib/db";
import { Users, Film, Tv, PlayCircle, TrendingUp } from "lucide-react";
import { AdminCharts } from "./AdminCharts";

export default async function AdminDashboard() {
    // Analytics Queries
    const totalUsers = await db.user.count();
    const premiumUsers = await db.user.count({ where: { plan: "StreamVault+" } });
    const totalMovies = await db.movie.count();
    const totalShows = await db.show.count();
    const totalStreams = await db.watchHistory.count();

    const revenueEstimate = premiumUsers * 3.99;

    const stats = [
        { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users, color: "text-blue-400" },
        { label: "Premium Subs", value: premiumUsers.toLocaleString(), icon: TrendingUp, color: "text-green-400" },
        { label: "Est. Monthly Revenue", value: `$${revenueEstimate.toFixed(2)}`, icon: TrendingUp, color: "text-emerald-400" },
        { label: "Movies Library", value: totalMovies.toLocaleString(), icon: Film, color: "text-purple-400" },
        { label: "Series Library", value: totalShows.toLocaleString(), icon: Tv, color: "text-pink-400" },
        { label: "Total Streams", value: totalStreams.toLocaleString(), icon: PlayCircle, color: "text-yellow-400" },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 tracking-wide">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-gray-400">Welcome to the StreamVault command center.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex items-center gap-5 transition-transform hover:scale-[1.02] duration-300">
                            <div className={`w-14 h-14 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5 shadow-inner`}>
                                <Icon className={`w-7 h-7 ${stat.color}`} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Area */}
            <AdminCharts />
        </div>
    );
}
