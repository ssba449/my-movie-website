import { db } from "@/lib/db";
import { Search, CreditCard, Activity, Clock } from "lucide-react";

export default async function AdminSubscriptionsPage() {
    const subscriptions = await db.subscription.findMany({
        include: { user: true },
        orderBy: { startDate: "desc" },
        take: 50,
    });

    const activeCount = subscriptions.filter(s => s.status === "ACTIVE").length;

    return (
        <div className="max-w-7xl mx-auto space-y-8 tracking-wide">
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Subscription Logs</h1>
                    <p className="text-gray-400">Monitor active premium plans, renewals, and revenue traces.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search invoices or emails..."
                        className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all w-[320px]"
                    />
                </div>
            </header>

            {/* Subscriptions Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Activity className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-emerald-300 mb-1">Active Subscriptions</p>
                        <p className="text-3xl font-bold text-emerald-100 tracking-tight">{activeCount}</p>
                    </div>
                </div>
                <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <CreditCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-400 mb-1">Estimated MRR</p>
                        <p className="text-3xl font-bold text-white tracking-tight">${(activeCount * 3.99).toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md mt-6">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-400 font-semibold">
                            <th className="px-6 py-5">Customer</th>
                            <th className="px-6 py-5">Stripe Session ID</th>
                            <th className="px-6 py-5">Plan</th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5">Start Date</th>
                            <th className="px-6 py-5">End Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {subscriptions.slice(0, 10).map((sub) => (
                            <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                            {sub.user?.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{sub.user?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                    {sub.stripeSessionId || "N/A (Manual Upgrade)"}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-white font-medium">{sub.plan}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sub.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'ACTIVE' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-400">
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(sub.startDate).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-400">
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(sub.endDate).toLocaleDateString()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {subscriptions.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No subscription records found.
                    </div>
                )}
            </div>
        </div>
    );
}
