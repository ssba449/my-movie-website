import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const shareKey = searchParams.get("shareKey");
    const fid = searchParams.get("fid");

    if (!shareKey || !fid) {
        return NextResponse.json({ error: "Missing shareKey or fid" }, { status: 400 });
    }

    try {
        const backendUrl = `http://127.0.0.1:4000/api/play/episode?shareKey=${shareKey}&fid=${fid}`;

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
                {
                    error: data.error || `Backend error: ${backendResponse.status}`,
                    hint: data.hint
                },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json(data);

    } catch (e: any) {
        console.error("Episode Play Proxy Error:", e);
        return NextResponse.json({ error: "Failed to fetch episode stream token" }, { status: 500 });
    }
}
