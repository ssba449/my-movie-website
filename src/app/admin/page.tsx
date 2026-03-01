"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2, Database, Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [importingId, setImportingId] = useState<number | null>(null);

    // Simplistic auth check (Ideally you have a role='ADMIN' check)
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/sign-in");
        }
    }, [status, router]);

    if (status === "unauthenticated" || status === "loading") {
        return (
            <div className="min-h-screen bg-transparent pt-24 pb-32 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/80 animate-spin" />
            </div>
        );
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            // Using a new API route specifically to proxy search requests safely
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
                    type: item.media_type, // 'movie' or 'tv'
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
        // -1 for movie bulk load indicator, -2 for tv bulk load indicator
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
        <div className="min-h-screen bg-transparent pt-24 pb-32">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                    <Database className="w-8 h-8 text-white" />
                    <h1 className="text-3xl font-bold text-white tracking-wide">Content Admin Dashboard</h1>
                </div>

                <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)] rounded-xl border border-white/10 p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Import from TMDB</h2>
                    <p className="text-gray-400 mb-6 text-sm">
                        Search for a movie or TV show to automatically download its metadata (posters, cast, descriptions) into your StreamVault database.
                    </p>

                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search 'Inception', 'Breaking Bad'..."
                                className="w-full bg-black/30 border-white/20 text-white pl-10 h-12 text-lg focus:border-primary"
                            />
                        </div>
                        <Button type="submit" disabled={isSearching} className="h-12 w-full md:w-auto px-8 bg-primary hover:bg-primary/90 text-white font-bold text-lg">
                            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
                        </Button>
                    </form>

                    <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-white/10">
                        <Button
                            onClick={() => handleBulkImport('movie')}
                            disabled={isSearching}
                            variant="secondary"
                            className="bg-[#2D2D44] hover:bg-[#3D3D5A] text-white"
                        >
                            {isSearching && importingId === -1 ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Film className="w-4 h-4 mr-2" />}
                            Bulk Add Top 20 Movies
                        </Button>
                        <Button
                            onClick={() => handleBulkImport('tv')}
                            disabled={isSearching}
                            variant="secondary"
                            className="bg-[#2D2D44] hover:bg-[#3D3D5A] text-white"
                        >
                            {isSearching && importingId === -2 ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Tv className="w-4 h-4 mr-2" />}
                            Bulk Add Top 20 Series
                        </Button>
                    </div>
                </div>

                {/* Results List */}
                {results.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white/80 mb-4 border-b border-white/10 pb-2">Search Results</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.map((item) => (
                                <div key={item.id} className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)]/50 border border-white/5 rounded-lg p-4 flex gap-4 hover:border-white/20 transition-colors">
                                    <div className="w-20 h-30 bg-transparent rounded overflow-hidden shrink-0 relative aspect-[2/3] border border-white/10">
                                        {item.poster_path ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                                alt={item.title || item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                {item.media_type === "movie" ? <Film /> : <Tv />}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="text-white font-bold text-lg leading-tight line-clamp-2">
                                                {item.title || item.name}
                                            </h4>
                                            <span className="text-xs font-mono text-gray-500 bg-black/50 px-2 py-1 rounded">
                                                {item.media_type === "movie" ? "MOVIE" : "SERIES"}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-1 mb-3 line-clamp-2">
                                            {item.overview || "No description available."}
                                        </p>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-sm text-gray-500">
                                                {(item.release_date || item.first_air_date)?.substring(0, 4) || "N/A"}
                                            </span>
                                            <Button
                                                size="sm"
                                                onClick={() => handleImport(item)}
                                                disabled={importingId === item.id}
                                                className="bg-white/10 hover:bg-white/20 text-white"
                                            >
                                                {importingId === item.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Plus className="w-4 h-4 mr-1" /> Import
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
