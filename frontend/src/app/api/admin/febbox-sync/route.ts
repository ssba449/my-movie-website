import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFebboxFiles } from "@/lib/services/showbox";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { seasonId, shareKey, folderId } = body;

        if (!seasonId || !shareKey || !folderId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify season exists
        const season = await db.season.findUnique({
            where: { id: seasonId },
        });

        if (!season) {
            return new NextResponse("Season not found", { status: 404 });
        }

        // Fetch files from Febbox
        const data = await getFebboxFiles(shareKey, folderId);
        if (!data || !Array.isArray(data)) {
            return new NextResponse("Failed to fetch Febbox files from API", { status: 500 });
        }

        const videoExts = [".mp4", ".mkv", ".avi", ".m3u8", ".webm", ".ts"];
        const videoFiles = data.filter((f: any) => {
            if (f.is_dir) return false;
            const name = (f.file_name || "").toLowerCase();
            return videoExts.some((ext) => name.endsWith(ext)) || f.file_size_bytes > 50_000_000;
        });

        if (videoFiles.length === 0) {
            return new NextResponse("No video files found in folder", { status: 404 });
        }

        let syncedCount = 0;

        for (let i = 0; i < videoFiles.length; i++) {
            const f = videoFiles[i];
            const name = f.file_name || `Episode ${i + 1}`;

            // Extract episode number from name, e.g. "Episode 1", "E01"
            let epNum = i + 1;
            const epMatch = name.match(/[Ee](?:pisode\s*)?(\d+)/);
            if (epMatch) {
                epNum = parseInt(epMatch[1], 10);
            } else {
                const numMatch = name.match(/(\d+)/);
                if (numMatch) {
                    epNum = parseInt(numMatch[1], 10);
                }
            }

            const streamUrl = `febbox://${shareKey}/${f.fid}`;

            // Check if episode with this number already exists for this season
            const existingEp = await db.episode.findFirst({
                where: { seasonId, episodeNumber: epNum }
            });

            if (existingEp) {
                await db.episode.update({
                    where: { id: existingEp.id },
                    data: {
                        title: name,
                        streamUrl,
                    }
                });
            } else {
                await db.episode.create({
                    data: {
                        seasonId,
                        episodeNumber: epNum,
                        title: name,
                        streamUrl,
                    }
                });
            }
            syncedCount++;
        }

        // Update season's febboxFolderId
        await db.season.update({
            where: { id: seasonId },
            data: {
                febboxFolderId: `${shareKey}|${folderId}`,
            }
        });

        return NextResponse.json({ success: true, count: syncedCount });

    } catch (error) {
        console.error("[FEBBOX_SYNC_ERROR]", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
