import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const shareKey = req.nextUrl.searchParams.get("shareKey");
    const seasonFid = req.nextUrl.searchParams.get("seasonFid");
    if (!shareKey || !seasonFid) return NextResponse.json({ error: "Missing shareKey or seasonFid" }, { status: 400 });

    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE || "https://my-movie-website.onrender.com";
        const res = await fetch(`${backendUrl}/stream-server/api/series/episodes?shareKey=${shareKey}&seasonFid=${seasonFid}`, { cache: "no-store" });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
