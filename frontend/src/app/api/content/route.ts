import { NextRequest, NextResponse } from "next/server";
import { searchShowbox } from "@/lib/services/showbox";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "movie";
    const keyword = searchParams.get("keyword") || "the"; // Use custom keyword or fallback
    const pageStr = searchParams.get("page") || "1";
    const limitStr = searchParams.get("limit") || "60";

    const page = parseInt(pageStr, 10);
    const limit = parseInt(limitStr, 10);

    try {
        // Search using the requested keyword and parameters to retrieve deep pagination
        const rawData = await searchShowbox(keyword, type as "movie" | "tv" | "all", page, limit);
        const data = rawData?.list || rawData || [];

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Pagination API Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch content" },
            { status: 500 }
        );
    }
}
