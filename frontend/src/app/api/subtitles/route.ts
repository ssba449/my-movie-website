import { NextRequest, NextResponse } from "next/server";
import { getTMDBDetails } from "@/lib/services/tmdb";
import zlib from "zlib";

export const dynamic = 'force-dynamic';

/**
 * Helper to convert SRT string to WebVTT string
 */
function srtToVtt(srtStr: string): string {
    // 1. Convert timestamp commas to dots
    let vtt = srtStr.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');

    // 2. Remove any carriage returns
    vtt = vtt.replace(/\r/g, '');

    // 3. Add WEBVTT header
    return 'WEBVTT\n\n' + vtt;
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const downloadUrl = searchParams.get("downloadUrl");

    console.log("=== API /subtitles CALLED ===");
    console.log("Full URL:", req.url);
    console.log("downloadUrl param:", downloadUrl);

    // ==========================================
    // MODE 1: DOWNLOAD & CONVERT SPECIFIC SUBTITLE
    // ==========================================
    if (downloadUrl) {
        try {
            const dlRes = await fetch(downloadUrl);
            if (!dlRes.ok) {
                return new NextResponse("Failed to download subtitle file", { status: 502 });
            }

            const buffer = await dlRes.arrayBuffer();

            // Unzip the gzipped SRT
            const srtBuffer = zlib.gunzipSync(Buffer.from(buffer));
            const srtText = srtBuffer.toString('utf8');

            // Convert to WebVTT
            const vttText = srtToVtt(srtText);

            // Return WebVTT
            return new NextResponse(vttText, {
                status: 200,
                headers: {
                    "Content-Type": "text/vtt; charset=utf-8",
                    "Cache-Control": "public, max-age=86400", // Cache subtitles for 1 day
                    "Access-Control-Allow-Origin": "*"
                }
            });
        } catch (e: any) {
            console.error("Subtitle Download Error:", e);
            return new NextResponse(`Download/Convert Error: ${e.message}`, { status: 500 });
        }
    }

    // ==========================================
    // MODE 2: LIST AVAILABLE SUBTITLES
    // ==========================================
    const tmdbId = searchParams.get("tmdbId");
    const type = searchParams.get("type"); // "movie" or "series"
    const season = searchParams.get("season");
    const episode = searchParams.get("episode");

    if (!tmdbId || !type) {
        return NextResponse.json({ error: "Missing tmdbId or type" }, { status: 400 });
    }

    try {
        // 1. Get IMDB ID from TMDB
        const mediaType = type === "movie" ? "movie" : "tv";
        const details = await getTMDBDetails(tmdbId, mediaType);

        let imdbId = details?.imdb_id;

        if (!imdbId) {
            const extRes = await fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}/external_ids?api_key=${process.env.TMDB_API_KEY}`);
            if (extRes.ok) {
                const extData = await extRes.json();
                imdbId = extData.imdb_id;
            }
        }

        if (!imdbId) {
            return NextResponse.json({ error: "IMDB ID not found for this media" }, { status: 404 });
        }

        const cleanImdbId = imdbId.replace(/^tt/, '');

        // 2. Build OpenSubtitles Query
        let osUrl = `https://rest.opensubtitles.org/search/imdbid-${cleanImdbId}/sublanguageid-ara`;
        if (type === "series" && season && episode) {
            osUrl += `/season-${season}/episode-${episode}`;
        }

        // 3. Search OpenSubtitles
        const osRes = await fetch(osUrl, {
            headers: { 'User-Agent': 'TemporaryUserAgent' }
        });

        if (!osRes.ok) {
            return NextResponse.json({ error: `OpenSubtitles Search Failed: ${osRes.status}` }, { status: 502 });
        }

        const subs = await osRes.json();
        if (!Array.isArray(subs) || subs.length === 0) {
            return NextResponse.json([], { status: 200 }); // Return empty array if none found
        }

        // 4. Map to a clean frontend-friendly object array
        const availableSubtitles = subs.map((sub: any) => ({
            id: sub.IDSubtitleFile,
            filename: sub.SubFileName,
            rating: parseFloat(sub.SubRating || "0"),
            format: sub.SubFormat,
            downloadUrl: sub.SubDownloadLink
        })).sort((a, b) => b.rating - a.rating); // Highest rated first

        return NextResponse.json(availableSubtitles, { status: 200 });

    } catch (e: any) {
        console.error("Subtitle API Error:", e);
        return NextResponse.json({ error: `Internal Server Error: ${e.message}` }, { status: 500 });
    }
}
