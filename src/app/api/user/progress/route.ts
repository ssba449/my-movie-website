import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = (session.user as any).id;
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { contentId, episodeId, positionSeconds, durationSeconds } = await req.json();

        if (!contentId || positionSeconds === undefined) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const isCompleted = durationSeconds > 0 && positionSeconds >= durationSeconds * 0.9;

        await db.watchProgress.upsert({
            where: {
                userId_contentId_episodeId: {
                    userId: userId,
                    contentId: contentId,
                    episodeId: episodeId || "null_episode",
                }
            },
            update: {
                positionSeconds,
                durationSeconds,
                completedAt: isCompleted ? new Date() : null,
            },
            create: {
                userId: userId,
                contentId,
                episodeId: episodeId || null,
                positionSeconds,
                durationSeconds,
                completedAt: isCompleted ? new Date() : null,
            }
        });

        return NextResponse.json({ success: true, isCompleted });
    } catch (error) {
        console.error("[PROGRESS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
