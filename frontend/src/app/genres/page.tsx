export const dynamic = 'force-dynamic';

import Image from "next/image";
import Link from "next/link";
import { searchShowbox } from "@/lib/services/showbox";
import { mapShowboxToContent } from "@/lib/utils/showbox-mapper";
import { Star } from "lucide-react";

export default async function GenresPage({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
    const params = await searchParams;
    const selectedGenre = params.genre || "Action";

    // All available genres we extracted
    const allGenres = [
        "Action", "Drama", "Comedy", "Horror", "Sci-Fi", "Animation",
        "Romance", "Thriller", "Documentary", "Fantasy", "Crime", "Adventure"
    ];

    const rawData = await searchShowbox(selectedGenre, "all", 1, 40);
    const content = mapShowboxToContent(rawData?.list || rawData);

    return (
        <div className="bg-[#0B0B0F] min-h-screen pt-24 pb-32">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                <h1 className="text-3xl font-bold text-white mb-8 tracking-wide">Browse by Genre</h1>

                <div className="flex flex-wrap gap-3 mb-12">
                    {allGenres.map((genre) => (
                        <Link
                            key={genre}
                            href={`/genres?genre=${genre}`}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedGenre === genre
                                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                                }`}
                        >
                            {genre}
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {content.map((item) => (
                        <Link href={`/title/${item.id}`} key={item.id} className="group relative block rounded-2xl overflow-hidden aspect-[2/3] bg-white/5 border border-white/10 transition-transform duration-500 hover:scale-105 hover:z-10 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                            <Image
                                src={item.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1"}
                                alt={item.title}
                                fill
                                className="object-cover transition-opacity duration-500 group-hover:opacity-75"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                                <h3 className="text-white font-medium line-clamp-2 text-sm drop-shadow-md">{item.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>

                {content.length === 0 && (
                    <div className="text-center py-20 text-white/50">
                        No content found for this genre yet! Wait for the mass import script to finish gathering more data.
                    </div>
                )}
            </div>
        </div>
    );
}
