import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { searchTMDB } from "@/lib/services/tmdb";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query) {
            return new NextResponse("Query parameter 'q' is required", { status: 400 });
        }

        const results = await searchTMDB(query);

        return NextResponse.json({ results });
    } catch (error) {
        console.error("[TMDB_SEARCH_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
