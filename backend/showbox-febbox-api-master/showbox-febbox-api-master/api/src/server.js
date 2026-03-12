import express from 'express';
import cors from 'cors';
import ShowboxAPI from './ShowboxAPI.js';
import FebboxAPI from './FebBoxApi.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

const showboxAPI = new ShowboxAPI();
const febboxAPI = new FebboxAPI();

// ── FlareSolverr helpers ──────────────────────────────────────────
const FS_URL = 'http://localhost:8191/v1';

async function fsPost(body) {
    const res = await fetch(FS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return res.json();
}

async function fsGet(url, sessionId = null, cookies = []) {
    const body = { cmd: 'request.get', url, maxTimeout: 60000 };
    if (sessionId) body.session = sessionId;
    if (cookies.length) body.cookies = cookies;
    const data = await fsPost(body);
    return data.solution || null;
}

async function createFSSession(id) {
    await fsPost({ cmd: 'sessions.create', session: id });
}

async function destroyFSSession(id) {
    await fsPost({ cmd: 'sessions.destroy', session: id }).catch(() => { });
}

// Quality priority order
const QUALITY_ORDER = ['4k', '2k', '1080p', '720p', '480p', '360p', 'original'];

function bestQuality(links) {
    return links.sort((a, b) => {
        const ai = QUALITY_ORDER.indexOf((a.quality || '').toLowerCase());
        const bi = QUALITY_ORDER.indexOf((b.quality || '').toLowerCase());
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })[0];
}

// ── Stream endpoint — picks best file, returns fid + shareKey ─────
// GET /febbox/stream?id=SHOWBOX_ID&type=1|2
const streamCache = new Map();

app.get('/febbox/stream', async (req, res) => {
    const { id, type = '1' } = req.query;
    const cacheKey = `${id}-${type}`;

    if (streamCache.has(cacheKey)) {
        return res.json(streamCache.get(cacheKey));
    }

    try {
        console.log(`\n🎬 Stream request: id=${id} type=${type}`);

        // 1. Get Febbox share key via FlareSolverr
        const shareKey = await showboxAPI.getFebBoxId(id, type);
        if (!shareKey) throw new Error('Could not get Febbox share key');
        console.log(`✅ Share key: ${shareKey}`);

        // 2. Get file list — pick LARGEST file (= highest quality)
        const files = await febboxAPI.getFileList(shareKey);
        if (!files || files.length === 0) throw new Error('No files in share');

        const videoFiles = files.filter(f => !f.is_dir);
        if (videoFiles.length === 0) throw new Error('No video files found');

        // Sort by file size descending — largest = best quality (4K > 1080p > 720p)
        const bestFile = videoFiles.sort((a, b) => (b.file_size_bytes || 0) - (a.file_size_bytes || 0))[0];
        const fid = bestFile.fid;
        console.log(`📁 Best file: fid=${fid} size=${bestFile.file_size} name=${bestFile.file_name}`);

        // 3. Get IMDB ID for fallback
        let imdbId = null;
        try {
            const details = await showboxAPI.getMovieDetails(id);
            imdbId = details?.imdb_id;
        } catch (e) { console.log("Failed to fetch IMDB ID for cache"); }

        const result = {
            fid,
            shareKey,
            fileName: bestFile.file_name,
            fileSize: bestFile.file_size,
            imdbId,
        };

        streamCache.set(cacheKey, result);
        setTimeout(() => streamCache.delete(cacheKey), 10 * 60 * 1000);
        res.json(result);

    } catch (error) {
        console.error('❌ Stream failed:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ── CDN URL endpoint — extracts direct video CDN URL via FlareSolverr ─
// GET /febbox/cdn-url?id=SHOWBOX_ID&type=1|2
// Returns: { cdnUrl, quality, fileName, fileSize }
const cdnCache = new Map();

app.get('/febbox/cdn-url', async (req, res) => {
    const { id, type = '1' } = req.query;
    const cacheKey = `cdn-${id}-${type}`;

    if (cdnCache.has(cacheKey)) {
        console.log(`⚡ CDN cache hit for id=${id}`);
        return res.json(cdnCache.get(cacheKey));
    }

    try {
        console.log(`\n🎬 CDN URL request: id=${id} type=${type}`);

        // 1. Get share key
        const shareKey = await showboxAPI.getFebBoxId(id, type);
        if (!shareKey) throw new Error('Could not get share key');
        console.log(`✅ Share key: ${shareKey}`);

        // 2. Get file list, pick largest
        const files = await febboxAPI.getFileList(shareKey);
        const videos = (files || []).filter(f => !f.is_dir);
        if (videos.length === 0) throw new Error('No video files');

        const bestFile = videos.sort((a, b) => (b.file_size_bytes || 0) - (a.file_size_bytes || 0))[0];
        console.log(`📁 Best: fid=${bestFile.fid} size=${bestFile.file_size} name=${bestFile.file_name}`);

        // 3. Get CDN URLs from quality list (uses FlareSolverr session internally)
        const links = await febboxAPI.getLinks(shareKey, bestFile.fid);
        if (!links || links.length === 0) {
            console.log("⚠️ API extraction failed. Returning shareKey and fid to client.");
            return res.json({ cdnUrl: null, shareKey, fid: bestFile.fid, fileName: bestFile.file_name, fileSize: bestFile.file_size });
        }

        // 4. Pick best quality link
        const best = bestQuality(links);
        if (!best || !best.url) {
            console.log("⚠️ No valid CDN URL. Returning shareKey and fid to client.");
            return res.json({ cdnUrl: null, shareKey, fid: bestFile.fid, fileName: bestFile.file_name, fileSize: bestFile.file_size });
        }
        console.log(`🎥 CDN URL: ${best.url} quality=${best.quality}`);

        // 5. Get IMDB ID for fallback
        let imdbId = null;
        try {
            const details = await showboxAPI.getMovieDetails(id);
            imdbId = details?.imdb_id;
        } catch (e) { console.log("Failed to fetch IMDB ID for cache"); }

        const result = {
            cdnUrl: best.url,
            quality: best.quality,
            fileName: bestFile.file_name,
            fileSize: bestFile.file_size,
            shareKey,
            fid: bestFile.fid,
            imdbId,
        };

        cdnCache.set(cacheKey, result);
        setTimeout(() => cdnCache.delete(cacheKey), 10 * 60 * 1000);
        res.json(result);

    } catch (error) {
        console.error('❌ CDN URL failed:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// ── Proxy stream endpoint — pipes Febbox video through our server ─
// GET /febbox/proxy-stream?fid=X&shareKey=Y
// Allows <video> to play Febbox content without needing auth cookies
const cookieCache = new Map();

app.get('/febbox/proxy-stream', async (req, res) => {
    const { fid, shareKey } = req.query;
    if (!fid || !shareKey) return res.status(400).send('Missing fid or shareKey');

    const FEBBOX = 'https://www.febbox.com';

    // Get fresh FlareSolverr cookies for this share
    let cookieStr = cookieCache.get(shareKey) || '';
    if (!cookieStr) {
        try {
            const sessionId = `proxy-${shareKey}-${Date.now()}`;
            await createFSSession(sessionId);
            const shareSolution = await fsGet(`${FEBBOX}/share/${shareKey}`, sessionId);
            await destroyFSSession(sessionId);
            const cookies = shareSolution?.cookies || [];
            cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
            cookieCache.set(shareKey, cookieStr);
            setTimeout(() => cookieCache.delete(shareKey), 30 * 60 * 1000);
        } catch (e) {
            console.error('Cookie fetch failed:', e.message);
        }
    }

    const downUrl = `${FEBBOX}/file/down?fid=${fid}&share_key=${shareKey}`;

    try {
        const upstream = await fetch(downUrl, {
            headers: {
                'Cookie': cookieStr,
                'Referer': `${FEBBOX}/share/${shareKey}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Range': req.headers['range'] || '',
            },
            redirect: 'follow'
        });

        if (!upstream.ok && upstream.status !== 206) {
            return res.status(upstream.status).send('Upstream error');
        }

        // Forward content headers
        const contentType = upstream.headers.get('content-type') || 'video/mp4';
        const contentLength = upstream.headers.get('content-length');
        const contentRange = upstream.headers.get('content-range');
        const acceptRanges = upstream.headers.get('accept-ranges');

        res.setHeader('Content-Type', contentType);
        if (contentLength) res.setHeader('Content-Length', contentLength);
        if (contentRange) res.setHeader('Content-Range', contentRange);
        if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);
        res.setHeader('Cache-Control', 'no-cache');

        res.status(upstream.status);
        upstream.body.pipe(res);

    } catch (err) {
        console.error('Proxy stream error:', err.message);
        res.status(500).send('Stream proxy failed');
    }
});

// ── Existing endpoints ────────────────────────────────────────────

// Homepage feed (ShowBox Home_list)
app.get('/home', async (req, res) => {
    try {
        const data = await showboxAPI.getHomeList();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Standardized Movies/TV aliases
app.get('/movies', async (req, res) => {
    const { sort = 'release_date', page = 1, pagelimit = 20 } = req.query;
    try {
        res.json(await showboxAPI.getList('movie', sort, page, pagelimit));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/tv', async (req, res) => {
    const { sort = 'release_date', page = 1, pagelimit = 20 } = req.query;
    try {
        res.json(await showboxAPI.getList('tv', sort, page, pagelimit));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Categorized list endpoint alias
app.get('/categories', async (req, res) => {
    const { type = 'movie', sort = 'release_date', page = 1, pagelimit = 20 } = req.query;
    try {
        const data = await showboxAPI.getList(type, sort, page, pagelimit);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Categorized list endpoint
app.get('/list', async (req, res) => {
    const { type = 'movie', sort = 'release_date', page = 1, pagelimit = 20 } = req.query;
    try {
        const data = await showboxAPI.getList(type, sort, page, pagelimit);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => res.send('Showbox and Febbox API is working!'));

app.get('/autocomplete', async (req, res) => {
    const { keyword, pagelimit } = req.query;
    try {
        res.json(await showboxAPI.getAutocomplete(keyword, pagelimit));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/search', async (req, res) => {
    const { type = 'all', title, page = 1, pagelimit = 20 } = req.query;
    try {
        res.json(await showboxAPI.search(title, type, page, pagelimit));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/movie/:id', async (req, res) => {
    try {
        res.json(await showboxAPI.getMovieDetails(req.params.id));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/show/:id', async (req, res) => {
    try {
        res.json(await showboxAPI.getShowDetails(req.params.id));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/febbox/id', async (req, res) => {
    const { id, type } = req.query;
    try {
        res.json({ febBoxId: await showboxAPI.getFebBoxId(id, type) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/febbox/files', async (req, res) => {
    const { shareKey, parent_id = 0 } = req.query;
    const cookie = req.headers['x-auth-cookie'] || null;
    try {
        res.json(await febboxAPI.getFileList(shareKey, parent_id, cookie));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/febbox/links', async (req, res) => {
    const { shareKey, fid } = req.query;
    const cookie = req.headers['x-auth-cookie'] || null;
    try {
        res.json(await febboxAPI.getLinks(shareKey, fid, cookie));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
