import { NextRequest, NextResponse } from "next/server";
import { getNormalizedShowboxContent, getSeriesSeasons } from "@/lib/services/showbox";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    if (!id) {
        return NextResponse.json({ error: "Missing series ID" }, { status: 400 });
    }

    try {
        const rawContent = await getNormalizedShowboxContent(id, "series");

        if (!rawContent || rawContent.type !== "series") {
            return NextResponse.json({ error: "Series not found" }, { status: 404 });
        }

        // Fetch Season/Episode metadata from stream-server
        const seasonData = await getSeriesSeasons(id);

        const response = {
            ...rawContent,
            seasons: seasonData?.seasons || [],
            febboxShareKey: seasonData?.shareKey || null
        };

        return NextResponse.json(response);

    } catch (e: any) {
        console.error("Series API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
