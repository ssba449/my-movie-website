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

        const { contentId, isFavorite } = await req.json();

        if (!contentId) {
            return new NextResponse("Missing contentId", { status: 400 });
        }

        if (isFavorite) {
            // Remove from favorites
            await db.favorites.deleteMany({
                where: {
                    userId: userId,
                    contentId: contentId,
                }
            });
        } else {
            // Add to favorites
            await db.favorites.create({
                data: {
                    userId: userId,
                    contentId: contentId,
                }
            });
        }

        return NextResponse.json({ success: true, isFavorite: !isFavorite });
    } catch (error) {
        console.error("[FAVORITES_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
