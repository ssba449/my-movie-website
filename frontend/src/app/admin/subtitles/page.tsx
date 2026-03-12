import { db } from "@/lib/db";
import { Subtitles as SubtitlesIcon, Trash2, Globe, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminSubtitlesPage() {
    // In a real app we'd fetch all subtitles with relations
    // For now we'll fetch a list of episodes that have subtitles
    const subtitles = await db.subtitle.findMany({
        include: {
            episode: {
                include: {
                    season: {
                        include: { show: true }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 50
    });

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 tracking-wide">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                            <SubtitlesIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Subtitle Assets</h1>
                    </div>
                    <p className="text-gray-400 text-lg">Manage linked .vtt and .srt files for episodic content.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-12 px-6 rounded-2xl">
                        Batch Validate
                    </Button>
                    <Button className="bg-white text-black hover:bg-gray-200 h-12 px-6 rounded-2xl font-bold">
                        Upload New Track
                    </Button>
                </div>
            </header>

            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Content Mapping</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Language</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Source URL</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {subtitles.map((sub: any) => (
                            <tr key={sub.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold">{sub.episode?.season?.show?.title || "Unknown Show"}</span>
                                        <span className="text-xs text-gray-500">S{sub.episode?.season?.seasonNumber} E{sub.episode?.episodeNumber} • {sub.episode?.title || "Untitled"}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm text-white/80">{sub.language || "English"}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 max-w-[200px]">
                                        <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                                        <span className="text-xs text-gray-400 font-mono truncate">{sub.src}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <span className="text-[11px] font-bold text-emerald-400 tracking-tighter uppercase">Verified</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {subtitles.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                        <AlertCircle className="w-12 h-12 text-white/20 mb-4" />
                        <h3 className="text-lg font-bold text-white">No active subtitle assets</h3>
                        <p className="text-sm text-gray-400 max-w-xs">Automated sync or manual uploads will populate this list.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
