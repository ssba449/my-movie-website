import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
        return NextResponse.json({ error: "Missing id or type" }, { status: 400 });
    }

    try {
        const backendUrl = `http://127.0.0.1:4000/api/play?id=${id}&type=${type}`;

        const backendResponse = await fetch(backendUrl, {
            cache: "no-store",
            // Pass standard headers assuming internal request
            headers: {
                "Accept": "application/json"
            }
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: data.error || `Backend error: ${backendResponse.status}` },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json(data);

    } catch (e: any) {
        console.error("Play Proxy Error:", e);
        return NextResponse.json({ error: "Failed to fetch stream token" }, { status: 500 });
    }
}
