import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Selected Content";
    const lang = searchParams.get("lang") || "en";

    // WebVTT requires this exact header
    let vtt = "WEBVTT\n\n";

    // Generate language-specific subtitles that announce the title
    if (lang === "es") {
        vtt += `1\n00:00:01.000 --> 00:00:05.000\n¡Bienvenido a StreamVault!\n\n`;
        vtt += `2\n00:00:05.500 --> 00:00:10.000\nEstás viendo la película exacta que seleccionaste:\n ${title}\n\n`;
        vtt += `3\n00:00:10.500 --> 00:00:15.000\nDisfruta de esta experiencia cinematográfica inmersiva.\n`;
    } else if (lang === "fr") {
        vtt += `1\n00:00:01.000 --> 00:00:05.000\nBienvenue sur StreamVault!\n\n`;
        vtt += `2\n00:00:05.500 --> 00:00:10.000\nVous regardez le film exact que vous avez sélectionné:\n ${title}\n\n`;
        vtt += `3\n00:00:10.500 --> 00:00:15.000\nProfitez de cette expérience cinématographique immersive.\n`;
    } else {
        // Default English
        vtt += `1\n00:00:01.000 --> 00:00:05.000\nWelcome to StreamVault!\n\n`;
        vtt += `2\n00:00:05.500 --> 00:00:10.000\nYou are watching the exact movie you selected:\n ${title}\n\n`;
        vtt += `3\n00:00:10.500 --> 00:00:15.000\nEnjoy this immersive cinematic experience.\n`;
    }

    return new NextResponse(vtt, {
        headers: {
            "Content-Type": "text/vtt; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
        },
    });
}
