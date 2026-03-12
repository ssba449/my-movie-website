import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoadMoreGrid from "@/components/shared/LoadMoreGrid";
import { getShowboxTrending } from "@/lib/services/showbox";

export default async function SeriesPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
        redirect("/sign-in");
    }

    const rawSeries = await getShowboxTrending("tv", 60);
    const series = rawSeries?.list || rawSeries || [];

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-32">
            <div className="max-w-[1440px] mx-auto px-10 xl:px-16">
                <div className="flex flex-col gap-2 mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">TV Shows</h1>
                    <p className="text-white/50 text-[15px] font-medium tracking-wide">Explore our complete collection of premium series.</p>
                </div>

                <LoadMoreGrid initialData={series} type="tv" />
            </div>
        </div>
    );
}
