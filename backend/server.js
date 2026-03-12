// Unified Backend Gateway - Updated: 2026-03-12 04:58 AM
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;
const API_PORT = process.env.API_PORT || 3001;
const STREAM_PORT = process.env.STREAM_PORT || 4000;

// Start Showbox API
const apiProcess = spawn('node', ['src/server.js'], {
    cwd: path.join(__dirname, 'showbox-febbox-api-master/showbox-febbox-api-master/api'),
    stdio: 'inherit',
    env: { ...process.env, PORT: API_PORT }
});

// Start Stream Server
const streamProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'stream-server'),
    stdio: 'inherit',
    env: { ...process.env, PORT: STREAM_PORT }
});

const streamProxyOpts = { target: `http://127.0.0.1:${STREAM_PORT}`, changeOrigin: true };
const showboxProxyOpts = { target: `http://127.0.0.1:${API_PORT}`, changeOrigin: true };

// ── Proxy Rules ──

// Playback & Series Metadata (Redirect to Stream Server)
app.use('/api/play', createProxyMiddleware({ ...streamProxyOpts, pathRewrite: { '^/api/play': '/play' } }));
app.use('/api/series', createProxyMiddleware({ ...streamProxyOpts, pathRewrite: { '^/api/series': '/series' } }));
app.use('/api/shared', createProxyMiddleware({ ...streamProxyOpts, pathRewrite: { '^/api/shared': '/shared' } }));
app.use('/api/bypass', createProxyMiddleware({ ...streamProxyOpts, pathRewrite: { '^/api/bypass': '/bypass' } }));

// Video Bytes (Direct to Stream Server shared endpoint)
app.use('/stream', createProxyMiddleware({ ...streamProxyOpts, pathRewrite: { '^/stream': '/shared' } }));

// ── Optimization: Metadata Cache ──
const metadataCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minute cache for metadata

const KIDS_SAFE_GENRES = ["animation", "family", "kids", "comedy", "fantasy", "adventure"];
const filterForKids = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.filter(item => {
        if (!item.genre) return true;
        const genres = item.genre.toLowerCase().split(",").map(g => g.trim());
        return genres.some(g => KIDS_SAFE_GENRES.includes(g));
    });
};

const fetchAndCache = async (url, cacheKey) => {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        metadataCache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
        return data;
    } catch (e) {
        console.error(`Cache fetch failed for ${url}:`, e.message);
        return null;
    }
};

const getCachedOrFetch = async (url, cacheKey) => {
    const entry = metadataCache.get(cacheKey);
    if (entry && Date.now() < entry.expiry) return entry.data;
    return fetchAndCache(url, cacheKey);
};

// ── Missing Platform Functions ──

// Keep-alive / Ping
app.get('/api/ping', (req, res) => res.json({ status: 'pong', timestamp: new Date() }));

// Cached Content Endpoints (With Kids Mode support)
app.get('/api/home', async (req, res) => {
    const { kidsMode } = req.query;
    let data = await getCachedOrFetch(`http://127.0.0.1:${API_PORT}/home`, 'home_feed');
    if (kidsMode === 'true') data = filterForKids(data);
    res.json(data || []);
});

app.get('/api/movies', async (req, res) => {
    const { sort = 'release_date', page = 1, kidsMode } = req.query;
    const cacheKey = `movies_${sort}_${page}`;
    let data = await getCachedOrFetch(`http://127.0.0.1:${API_PORT}/movies?sort=${sort}&page=${page}`, cacheKey);
    if (kidsMode === 'true') data = filterForKids(data);
    res.json(data || []);
});

app.get('/api/tv', async (req, res) => {
    const { sort = 'release_date', page = 1, kidsMode } = req.query;
    const cacheKey = `tv_${sort}_${page}`;
    let data = await getCachedOrFetch(`http://127.0.0.1:${API_PORT}/tv?sort=${sort}&page=${page}`, cacheKey);
    if (kidsMode === 'true') data = filterForKids(data);
    res.json(data || []);
});

app.get('/api/search', async (req, res) => {
    const { title, type = 'all', page = 1, kidsMode } = req.query;
    const cacheKey = `search_${title}_${type}_${page}`;
    let data = await getCachedOrFetch(`http://127.0.0.1:${API_PORT}/search?title=${title}&type=${type}&page=${page}`, cacheKey);
    if (kidsMode === 'true') data = filterForKids(data);
    res.json(data || []);
});

// Subtitles (Previously in frontend API, now consolidated)
app.get('/api/subtitles', async (req, res) => {
    const { tmdbId, type, id } = req.query;
    const cacheKey = `subs_${tmdbId || id}_${type}`;
    const entry = metadataCache.get(cacheKey);
    if (entry && Date.now() < entry.expiry) return res.json(entry.data);

    console.log(`🔍 Subtitle request: tmdbId=${tmdbId} type=${type} id=${id}`);
    try {
        const data = { success: true, subtitles: [] };
        metadataCache.set(cacheKey, { data, expiry: Date.now() + (60 * 60 * 1000) }); // Cache subs for 1 hour
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Subtitle service error' });
    }
});

// User Progress / Continue Watching (Memory-based since Prisma removed)
const userProgress = new Map();
app.post('/api/user/progress', express.json(), (req, res) => {
    const { contentId, progress, type, title, posterUrl } = req.body;
    if (!contentId) return res.status(400).json({ error: 'Missing contentId' });

    userProgress.set(contentId, {
        contentId,
        progress,
        type,
        title,
        posterUrl,
        updatedAt: new Date()
    });
    res.json({ success: true });
});

app.get('/api/user/progress', (req, res) => {
    const list = Array.from(userProgress.values())
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 20);
    res.json(list);
});

// Content Metadata (Proxy for other /api routes)
app.use('/api', createProxyMiddleware({ ...showboxProxyOpts, pathRewrite: { '^/api': '' } }));

// Root health check
app.get('/', (req, res) => {
    res.json({ status: 'Backend Gateway Running', services: ['showbox-api', 'stream-server'] });
});

app.listen(PORT, () => {
    console.log(`Gateway server listening on port ${PORT}`);
    console.log(`- /api matches Showbox API (port ${API_PORT})`);
    console.log(`- /stream & /api/play match Stream Server (port ${STREAM_PORT})`);
});

process.on('SIGINT', () => {
    apiProcess.kill();
    streamProcess.kill();
    process.exit();
});
