import { NextRequest, NextResponse } from "next/server";
import { searchShowbox } from "@/lib/services/showbox";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");
    const type = searchParams.get("type") as "movie" | "tv" | "all" | null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!query) {
        return NextResponse.json({ list: [] });
    }

    try {
        const results = await searchShowbox(query, type || "all", page, limit);
        return NextResponse.json(results);
    } catch (e: any) {
        console.error("Search API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
