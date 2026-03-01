import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ContentCard from "@/components/shared/ContentCard";
import { getAllContentByCategory } from "@/lib/services/content";
import { Film } from "lucide-react";

export default async function MoviesPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
        redirect("/sign-in");
    }

    const movies = await getAllContentByCategory("movie");

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-32">
            <div className="max-w-[1440px] mx-auto px-10 xl:px-16">
                <div className="flex flex-col gap-2 mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Movies</h1>
                    <p className="text-white/50 text-[15px] font-medium tracking-wide">Explore our complete collection of {movies.length} cinematic titles.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-y-12 gap-x-6 place-items-center">
                    {movies.map((item: any) => (
                        <ContentCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            posterUrl={item.posterUrl || ""}
                            imdbRating={item.imdbRating || 0}
                            genre={item.genre || ""}
                            year={item.releaseYear || undefined}
                            runtime={item.runtime || undefined}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
