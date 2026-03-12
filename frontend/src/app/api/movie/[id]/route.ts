import { NextRequest, NextResponse } from "next/server";
import { getNormalizedShowboxContent } from "@/lib/services/showbox";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    try {
        const data = await getNormalizedShowboxContent(id, "movie");
        if (!data) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }
        return NextResponse.json(data);
    } catch (e: any) {
        console.error("Movie API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
