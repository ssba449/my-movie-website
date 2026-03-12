"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2, Database, Film, Tv, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function AdminImportPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [importingId, setImportingId] = useState<number | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data.results) {
                setResults(data.results);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleImport = async (item: any) => {
        setImportingId(item.id);
        try {
            const res = await fetch("/api/admin/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tmdbId: item.id,
                    type: item.media_type,
                }),
            });

            if (res.ok) {
                alert(`Successfully imported: ${item.title || item.name}`);
            } else {
                const err = await res.text();
                alert(`Import failed: ${err}`);
            }
        } catch (error) {
            console.error("Import failed:", error);
            alert("An error occurred during import.");
        } finally {
            setImportingId(null);
        }
    };

    const handleBulkImport = async (type: "movie" | "tv") => {
        setImportingId(type === 'movie' ? -1 : -2);
        setIsSearching(true);

        try {
            const res = await fetch("/api/admin/import/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type }),
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Successfully imported ${data.count} trending ${type === 'movie' ? 'movies' : 'series'}!`);
            } else {
                const err = await res.text();
                alert(`Bulk import failed: ${err}`);
            }
        } catch (error) {
            console.error("Bulk import failed:", error);
            alert("An error occurred during bulk import.");
        } finally {
            setImportingId(null);
            setIsSearching(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 tracking-wide pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                            <Download className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Import Content</h1>
                    </div>
                    <p className="text-gray-400 text-lg">Fetch high-quality metadata and assets from TMDB.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => handleBulkImport('movie')}
                        disabled={isSearching}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-12 px-6 rounded-2xl"
                    >
                        {isSearching && importingId === -1 ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Film className="w-5 h-5 mr-2" />}
                        Bulk Add Movies
                    </Button>
                    <Button
                        onClick={() => handleBulkImport('tv')}
                        disabled={isSearching}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-12 px-6 rounded-2xl"
                    >
                        {isSearching && importingId === -2 ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Tv className="w-5 h-5 mr-2" />}
                        Bulk Add Series
                    </Button>
                </div>
            </header>

            <section className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[32px] p-8 md:p-12 shadow-2xl">
                <form onSubmit={handleSearch} className="relative group max-w-4xl mx-auto">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="w-6 h-6 text-white/30 group-focus-within:text-white/70 transition-colors" />
                    </div>
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for movies or TV series to import..."
                        className="h-16 w-full bg-white/5 border-white/10 text-white pl-16 pr-8 rounded-full text-xl focus:ring-0 focus:border-white/30 placeholder:text-white/20 transition-all shadow-inner"
                    />
                    <div className="absolute inset-y-2 right-2 flex items-center">
                        <Button
                            type="submit"
                            disabled={isSearching}
                            className="h-12 bg-white text-black hover:bg-gray-200 rounded-full px-8 font-bold text-base transition-transform active:scale-95"
                        >
                            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search Discovery"}
                        </Button>
                    </div>
                </form>

                <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400 font-medium">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5">Auto Post-processing</span>
                    <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5">High-Res Backdrops</span>
                    <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5">TMDB Integration</span>
                </div>
            </section>

            {/* Results Grid */}
            {results.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Discovery Results</h2>
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">{results.length} Titles Found</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {results.map((item) => (
                            <div
                                key={item.id}
                                className="group relative bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5"
                            >
                                <div className="aspect-[16/9] relative bg-white/5 overflow-hidden">
                                    {item.backdrop_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`}
                                            alt={item.title || item.name}
                                            fill
                                            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-white/10 uppercase font-black text-4xl opacity-50 rotate-3 tracking-tighter">
                                            {item.media_type}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                                    <div className="absolute top-4 left-4">
                                        <span className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white/80 border border-white/10 uppercase tracking-widest">
                                            {item.media_type}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className="text-xl font-bold text-white leading-tight line-clamp-2">
                                            {item.title || item.name}
                                        </h3>
                                        <span className="text-lg font-bold text-white/40">
                                            {(item.release_date || item.first_air_date)?.substring(0, 4) || "????"}
                                        </span>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed font-normal opacity-70">
                                        {item.overview || "No plot description available for this title."}
                                    </p>

                                    <Button
                                        onClick={() => handleImport(item)}
                                        disabled={importingId === item.id}
                                        className="w-full h-12 bg-white/10 hover:bg-white text-white hover:text-black rounded-2xl font-bold transition-all border border-white/10 text-sm"
                                    >
                                        {importingId === item.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Import to Database"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {results.length === 0 && !isSearching && searchQuery && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6">
                        <Search className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No direct matches</h3>
                    <p className="text-gray-500 max-w-sm">We couldn't locate "{searchQuery}" on TMDB. Try refining your keywords or check for spelling errors.</p>
                </div>
            )}
        </div>
    );
}
