import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const showId = searchParams.get("showId");

        if (!showId) {
            return new NextResponse("Missing showId", { status: 400 });
        }

        const seasons = await db.season.findMany({
            where: { showId },
            orderBy: { seasonNumber: "asc" }
        });

        const mappedSeasons = seasons.map(s => ({
            fid: s.id, // we use DB UUID as the fid for the picker
            name: `Season ${s.seasonNumber}`,
            seasonNumber: s.seasonNumber,
            _directFiles: false
        }));

        return NextResponse.json({
            shareKey: "db", // special flag for db content
            hasDirectFiles: false,
            seasons: mappedSeasons
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
