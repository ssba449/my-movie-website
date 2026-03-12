"use client";

import { useState } from "react";
import { FolderSync, Server, Database, Save, Link2 } from "lucide-react";

export default function FebboxClient({ shows }: { shows: any[] }) {
    const [shareKey, setShareKey] = useState("");
    const [folderId, setFolderId] = useState("");
    const [seasonId, setSeasonId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const handleSync = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!shareKey || !folderId || !seasonId) {
            setMessage({ text: "Please fill all fields.", type: "error" });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/admin/febbox-sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ seasonId, shareKey, folderId }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Sync failed.");
            }

            const data = await res.json();
            setMessage({ text: `Sync complete! Synced ${data.count} episodes.`, type: "success" });
            setShareKey("");
            setFolderId("");
            setSeasonId("");
        } catch (error: any) {
            setMessage({ text: error.message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Manual Link Tool */}
            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100" />

                <h3 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center">
                    <Link2 className="w-5 h-5 text-blue-400 mr-3" />
                    Link Folder to Season
                </h3>

                <form onSubmit={handleSync} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Febbox Share Key</label>
                        <input
                            type="text"
                            placeholder="e.g. 1uKmVcZ..."
                            value={shareKey}
                            onChange={(e) => setShareKey(e.target.value)}
                            required
                            disabled={isLoading}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Febbox Folder File ID (fid)</label>
                        <input
                            type="text"
                            placeholder="e.g. 1928374"
                            value={folderId}
                            onChange={(e) => setFolderId(e.target.value)}
                            required
                            disabled={isLoading}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Select Target Database Season</label>
                        <select
                            value={seasonId}
                            onChange={(e) => setSeasonId(e.target.value)}
                            required
                            disabled={isLoading}
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-colors"
                        >
                            <option value="">Select a TV show season...</option>
                            {shows.map((show) => (
                                <optgroup key={show.id} label={show.title}>
                                    {show.seasons.map((season: any) => (
                                        <option key={season.id} value={season.id}>
                                            {show.title} - Season {season.seasonNumber}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-white text-black text-center py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <FolderSync className="w-4 h-4" />
                            {isLoading ? "Syncing..." : "Start Sync Task"}
                        </button>
                    </div>

                    {message && (
                        <p className={`text-sm p-3 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                            {message.text}
                        </p>
                    )}
                </form>
            </div>

            {/* Status and Logs */}
            <div className="space-y-8">
                <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-8">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <Server className="w-5 h-5 text-purple-400 mr-3" />
                        System Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                                <span className="text-white text-sm font-medium">Core Database Connection</span>
                            </div>
                            <span className="text-gray-500 text-xs">Online</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                                <span className="text-white text-sm font-medium">Febbox Sync Server</span>
                            </div>
                            <span className="text-gray-500 text-xs">Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
