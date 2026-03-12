import { db } from "@/lib/db";
import { Search, MoreVertical, Shield, User, Crown } from "lucide-react";
import Image from "next/image";

export default async function AdminUsersPage() {
    const users = await db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 tracking-wide">
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-gray-400">Manage user roles, subscriptions, and accounts.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all w-[300px]"
                    />
                </div>
            </header>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-400 font-semibold">
                            <th className="px-6 py-5">User</th>
                            <th className="px-6 py-5">Plan</th>
                            <th className="px-6 py-5">Role</th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5">Joined</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                                            {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{u.name || "Unknown"}</p>
                                            <p className="text-gray-400 text-xs">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {u.plan === "StreamVault+" ? (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full w-max border border-emerald-400/20">
                                            <Crown className="w-3.5 h-3.5" />
                                            StreamVault+
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 px-2.5 py-1 text-xs">Free Plan</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        {u.role === "ADMIN" ? (
                                            <Shield className="w-4 h-4 text-blue-400" />
                                        ) : (
                                            <User className="w-4 h-4 text-gray-500" />
                                        )}
                                        {u.role}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${u.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-400">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
