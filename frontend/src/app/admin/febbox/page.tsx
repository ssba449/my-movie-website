import { db } from "@/lib/db";
import FebboxClient from "./FebboxClient";

export default async function AdminFebboxPage() {
    // Fetch all shows that have seasons, include their seasons
    const shows = await db.show.findMany({
        where: {
            seasons: {
                some: {} // Only fetch shows that have at least one season
            }
        },
        include: {
            seasons: {
                orderBy: { seasonNumber: "asc" }
            }
        },
        orderBy: { title: "asc" }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 tracking-wide">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">Febbox Sync Manager</h1>
                <p className="text-gray-400">Link your Febbox cloud folders directly to TV Show Seasons.</p>
            </header>

            <FebboxClient shows={shows} />
        </div>
    );
}
