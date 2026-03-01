export async function getOmdbData(imdbId: string | null, title?: string) {
    if (!process.env.OMDB_API_KEY) return null;
    const baseUrl = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}`;
    const query = imdbId ? `&i=${imdbId}` : `&t=${encodeURIComponent(title || "")}`;
    try {
        const res = await fetch(baseUrl + query);
        const data = await res.json();
        return data.Response === "True" ? data : null;
    } catch (err) {
        console.error("OMDB API Error:", err);
        return null;
    }
}
