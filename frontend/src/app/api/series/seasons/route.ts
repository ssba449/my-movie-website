import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing series id" }, { status: 400 });

    try {
        const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:3000";
        const res = await fetch(`${backendUrl}/stream-server/api/series/seasons?id=${id}`, { cache: "no-store" });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
