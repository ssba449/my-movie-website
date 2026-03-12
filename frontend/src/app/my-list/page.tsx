import ContentCard from "@/components/shared/ContentCard";
import { ListVideo } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function MyList() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
        redirect("/sign-in");
    }

    const userId = (session.user as any).id;
    const dbWatchlist = await db.watchlist.findMany({
        where: { userId },
        include: { movie: true, show: true },
        orderBy: { addedDate: "desc" }
    });

    const favoritesList = dbWatchlist.map((item: any) => {
        if (item.movie) return { ...item.movie, type: 'movie' };
        if (item.show) return { ...item.show, type: 'series' };
        return null;
    }).filter(Boolean);

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-32">
            <div className="max-w-[1440px] mx-auto px-10 xl:px-16">
                <div className="flex flex-col gap-2 mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Up Next</h1>
                    <p className="text-white/50 text-[15px] font-medium tracking-wide">Your saved movies and series.</p>
                </div>

                {favoritesList.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-y-12 gap-x-6 place-items-center">
                        {favoritesList.map((item: any) => (
                            <ContentCard
                                key={item.id}
                                id={item.id}
                                title={item.title}
                                posterUrl={item.poster || ""}
                                imdbRating={0}
                                genre={item.genre || ""}
                                year={item.releaseYear || undefined}
                                runtime={item.duration || undefined}
                                type={item.type}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 opacity-50 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] flex items-center justify-center mb-6">
                            <ListVideo className="w-8 h-8 text-white/50" />
                        </div>
                        <h2 className="text-[22px] font-semibold text-white mb-2">Your queue is empty</h2>
                        <p className="text-[15px] text-white/50 font-medium">Add shows and movies to your Up Next to watch them later.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
