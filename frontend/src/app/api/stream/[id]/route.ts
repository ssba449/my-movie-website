import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    if (!id) {
        return NextResponse.json({ error: "Missing stream token" }, { status: 400 });
    }

    try {
        const backendBase = process.env.BACKEND_URL || "http://localhost:3000";
        const backendUrl = `${backendBase}/stream/${id}`;

        // Pass Range headers if the client is seeking through the video
        const headers: Record<string, string> = {};
        const range = req.headers.get("range");
        if (range) {
            headers["Range"] = range;
        }

        const backendResponse = await fetch(backendUrl, {
            headers,
            // Don't interpret the body as JSON, just pipe the exact bytes
            cache: "no-store",
        });

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: `Backend streaming error: ${backendResponse.status}` },
                { status: backendResponse.status }
            );
        }

        // Forward all relevant streaming headers back to the frontend client
        const responseHeaders = new Headers();

        const contentType = backendResponse.headers.get("content-type");
        if (contentType) responseHeaders.set("Content-Type", contentType);

        const contentLength = backendResponse.headers.get("content-length");
        if (contentLength) responseHeaders.set("Content-Length", contentLength);

        const contentRange = backendResponse.headers.get("content-range");
        if (contentRange) responseHeaders.set("Content-Range", contentRange);

        const acceptRanges = backendResponse.headers.get("accept-ranges");
        if (acceptRanges) responseHeaders.set("Accept-Ranges", acceptRanges);

        // Security headers to allow the video player to access this via CORS if needed
        responseHeaders.set("Access-Control-Allow-Origin", "*");

        return new NextResponse(backendResponse.body as any, {
            status: backendResponse.status,
            headers: responseHeaders,
        });

    } catch (e: any) {
        console.error("Stream Proxy Error:", e);
        return NextResponse.json({ error: "Failed to proxy stream data" }, { status: 500 });
    }
}
