import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const seasonFid = searchParams.get("seasonFid");

        if (!seasonFid) {
            return new NextResponse("Missing seasonFid", { status: 400 });
        }

        const episodes = await db.episode.findMany({
            where: { seasonId: seasonFid },
            orderBy: { episodeNumber: "asc" }
        });

        const mappedEpisodes = episodes.map(ep => ({
            fid: ep.id,
            name: ep.title || `Episode ${ep.episodeNumber}`,
            episodeNumber: ep.episodeNumber,
            fileSize: "",
            fileSizeBytes: 0,
            streamUrl: ep.streamUrl
        }));

        return NextResponse.json({ episodes: mappedEpisodes });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
