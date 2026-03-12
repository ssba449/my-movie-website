import express from "express";
import axios from "axios";
import crypto from "crypto";
import { readFileSync, createReadStream } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { extractCdnLinks, bypassUrl, getCookieStatus, setCookiesManually } from "./febbox-extractor.js";

// ── Load .env manually ──
const __dir = dirname(fileURLToPath(import.meta.url));
try {
  const envFile = readFileSync(join(__dir, ".env"), "utf-8");
  for (const line of envFile.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const [key, ...rest] = t.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
} catch { }

const app = express();
app.use((req, res, next) => { res.setHeader("Access-Control-Allow-Origin", "*"); next(); });
app.use(express.json());

// Serve cookie-grabber.html at /grab-cookies
app.get("/grab-cookies", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  createReadStream(join(__dir, "cookie-grabber.html")).pipe(res);
});

const PORT = process.env.PORT || 4000;
const FLARE = process.env.FLARESOLVERR || "http://localhost:8191/v1";
const COOKIE = process.env.FEBBOX_COOKIE || process.env.FEBBOX_UI_COOKIE || "";
const API_URL = process.env.API_URL || "http://localhost:3001";
const FEBBOX = "https://www.febbox.com";

// Active stream tokens: token → { url, expire, showboxId, type, ... }
const activeStreams = new Map();
// Extraction cache: contentKey (id + type or shareKey + fid) → { token, expire }
const extractionCache = new Map();
// CF cookie cache: shareKey → string
const cfCache = new Map();

// ── Auto-cleanup expired tokens ──
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of activeStreams) if (s.expire < now) activeStreams.delete(id);
  for (const [key, c] of extractionCache) if (c.expire < now) extractionCache.delete(key);
}, 60_000);

// ── FlareSolverr bypass ──
async function bypass(url, shareKey = null) {
  if (shareKey && cfCache.has(shareKey)) return { cookies: cfCache.get(shareKey), html: null };
  const resp = await axios.post(FLARE, { cmd: "request.get", url, maxTimeout: 60000 }, {
    headers: { "Content-Type": "application/json" }
  });
  const sol = resp.data?.solution;
  if (!sol) throw new Error("FlareSolverr returned no solution");
  const cookies = (sol.cookies || []).map(c => `${c.name}=${c.value}`).join("; ");
  if (shareKey) {
    cfCache.set(shareKey, cookies);
    setTimeout(() => cfCache.delete(shareKey), 30 * 60 * 1000);
  }
  return { html: sol.response, cookies };
}

// ── Extract mp4/m3u8 URL from HTML ──
function extractVideoUrl(html) {
  const patterns = [
    /(https:\/\/[^"'\s]+\.(?:mp4|m3u8|mkv|webm)[^"'\s]*)/i,
    /['"](https:\/\/[^'"]+\.(mp4|m3u8)[^'"]*)['"]/i,
  ];
  for (const p of patterns) {
    const m = (html || "").match(p);
    if (m && m[1] && !m[1].includes("febbox") && !m[1].includes("cloudflare")) return m[1];
  }
  return null;
}

// ── Vidsrc has been removed — Febbox-only mode ──

// ── Quality priority order ──
const QUALITY_ORDER = ['4k', '2k', '1080p', '720p', '480p', '360p', 'original'];
function pickBestLink(links) {
  return links.sort((a, b) => {
    const ai = QUALITY_ORDER.indexOf((a.quality || '').toLowerCase());
    const bi = QUALITY_ORDER.indexOf((b.quality || '').toLowerCase());
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  })[0];
}

// ── Is this a real CDN URL (not a Febbox login redirect)? ──
function isRealCdnUrl(url) {
  if (!url) return false;
  if (url.includes('febbox.com/file/down')) return false;
  if (url.includes('febbox.com/share')) return false;
  return url.startsWith('http');
}

// ════════════════════════════════════════════════════════
// GET /play?id=SHOWBOX_ID&type=1|2
// 1. Calls /febbox/id on existing API
// ...
app.get("/play", async (req, res) => {
  const { id, type = "1" } = req.query;
  if (!id) return res.status(400).json({ error: "Missing id" });

  const cacheKey = `movie_${id}_${type}`;
  const cached = extractionCache.get(cacheKey);
  if (cached && activeStreams.has(cached.token) && cached.expire > Date.now()) {
    const s = activeStreams.get(cached.token);
    console.log(`⚡ Extraction Cache Hit for movie id=${id}`);
    return res.json({ type: 'stream', stream: `/stream/${cached.token}`, size: s.fileSize, fileName: s.fileName });
  }

  try {
    console.log(`\n🎬 /api/play id=${id} type=${type}`);

    let cdnUrl = null, fileSize = null, fileName = null, shareKey = null;

    // ── Step 1: Get Febbox share key ──
    try {
      const idRes = await axios.get(`${API_URL}/febbox/id`, {
        params: { id, type }, timeout: 60_000
      });
      shareKey = idRes.data?.febBoxId;
      if (!shareKey) throw new Error('No share key returned');
      console.log(`✅ Share key: ${shareKey}`);
    } catch (e) {
      console.log(`⚠️ Could not get share key: ${e.message}`);
    }

    // ── Step 2: Get file list, pick largest file (= highest quality) ──
    let fid = null;
    if (shareKey) {
      try {
        const filesRes = await axios.get(`${API_URL}/febbox/files`, {
          params: { shareKey, parent_id: 0 }, timeout: 30_000
        });
        const files = (filesRes.data || []).filter(f => !f.is_dir && f.fid);
        if (files.length > 0) {
          const best = files.sort((a, b) => (b.file_size_bytes || 0) - (a.file_size_bytes || 0))[0];
          fid = best.fid;
          fileName = best.file_name;
          fileSize = best.file_size;
          console.log(`📁 Best file: fid=${fid} name=${fileName}`);
        }
      } catch (e) {
        console.log(`⚠️ File list failed: ${e.message}`);
      }
    }

    // ── Step 3: Extract CDN URL via Puppeteer (real Chrome, bypasses CF) ──
    if (shareKey && fid) {
      console.log(`🚀 Using Puppeteer real-browser extractor...`);
      try {
        const links = await extractCdnLinks(shareKey, fid, COOKIE);
        if (links && links.length > 0) {
          const best = pickBestLink(links);
          cdnUrl = best.url;
          console.log(`✅ Puppeteer CDN URL: ${cdnUrl.substring(0, 80)}... quality=${best.quality}`);
        }
      } catch (e) {
        console.log(`⚠️ Puppeteer extractor failed: ${e.message}`);
      }
    }

    // ── Step 4: Fallback — old cdn-url endpoint (FlareSolverr) ──
    if (!cdnUrl) {
      console.log(`🔄 Puppeteer failed, trying FlareSolverr cdn-url endpoint...`);
      try {
        const r = await axios.get(`${API_URL}/febbox/cdn-url`, {
          params: { id, type }, timeout: 90_000
        });
        const candidate = r.data.cdnUrl;
        if (isRealCdnUrl(candidate)) {
          cdnUrl = candidate;
          fileSize = r.data.fileSize;
          fileName = r.data.fileName;
          shareKey = shareKey || r.data.shareKey;
          console.log(`✅ FlareSolverr CDN URL: ${cdnUrl.substring(0, 80)}...`);
        } else {
          console.log(`⚠️ cdn-url endpoint returned invalid URL: ${candidate}`);
        }
      } catch (e) {
        console.log(`⚠️ cdn-url failed: ${e.message}`);
      }
    }

    if (!cdnUrl) {
      return res.status(503).json({
        error: "Stream unavailable. Cloudflare is blocking CDN extraction. Try again in a few minutes.",
      });
    }

    const token = crypto.randomBytes(16).toString("hex");
    activeStreams.set(token, {
      showboxId: id, type, url: cdnUrl,
      shareKey, fileName, fileSize,
      expire: Date.now() + 30 * 60 * 1000,
    });

    // Cache the extraction result for 10 minutes
    extractionCache.set(cacheKey, { token, expire: Date.now() + 10 * 60 * 1000 });

    console.log(`🔐 Token created → /stream/${token}`);
    res.json({ type: 'stream', stream: `/stream/${token}`, size: fileSize, fileName });

  } catch (e) {
    console.error(`❌ /api/play: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════
// GET /:token (or /stream-shared/:token)
// Proxies video bytes through this server.
// ════════════════════════════════════════════════════════
app.get("/shared/:token", async (req, res) => {
  const data = activeStreams.get(req.params.token);
  if (!data) return res.status(404).json({ error: "Stream not found or expired" });
  if (data.expire < Date.now()) {
    activeStreams.delete(req.params.token);
    return res.status(410).json({ error: "Stream expired — play again" });
  }

  try {
    const headers = {
      "Cookie": COOKIE,
      "Referer": FEBBOX,
      "Origin": FEBBOX,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    };
    if (req.headers.range) headers["Range"] = req.headers.range;

    console.log(`📡 Streaming /stream/${req.params.token} range=${req.headers.range || "none"}`);

    const upstream = await axios({
      method: "GET",
      url: data.url,
      responseType: "stream",
      headers,
      timeout: 30_000,
      validateStatus: s => s < 500,
    });

    const ct = upstream.headers["content-type"] || "video/mp4";
    res.setHeader("Content-Type", ct);
    res.setHeader("Accept-Ranges", upstream.headers["accept-ranges"] || "bytes");
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (upstream.headers["content-length"]) res.setHeader("Content-Length", upstream.headers["content-length"]);
    if (upstream.headers["content-range"]) res.setHeader("Content-Range", upstream.headers["content-range"]);

    res.status(upstream.status);
    upstream.data.pipe(res);
    req.on("close", () => upstream.data.destroy());

  } catch (e) {
    console.error(`❌ /stream: ${e.message}`);
    if (!res.headersSent) res.status(500).json({ error: "Stream proxy error" });
  }
});

// ════════════════════════════════════════════════════════
// GET /series/seasons?id=SHOWBOX_ID
// 1. Gets Febbox share key for the series
// 2. Lists root-level items (season folders)
// ════════════════════════════════════════════════════════
app.get("/series/seasons", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing id" });

  try {
    console.log(`\n📺 /api/series/seasons id=${id}`);

    // Get Febbox share key for series (type=2)
    const idRes = await axios.get(`${API_URL}/febbox/id`, {
      params: { id, type: 2 }, timeout: 120_000
    });
    const shareKey = idRes.data?.febBoxId;
    if (!shareKey) throw new Error("Could not get share key for series");
    console.log(`✅ Share key: ${shareKey}`);

    // List root items (season folders)
    const filesRes = await axios.get(`${API_URL}/febbox/files`, {
      params: { shareKey, parent_id: 0 }, timeout: 60_000
    });
    const items = filesRes.data || [];

    // Extract season folders (is_dir=1) and video files
    const folders = items.filter(f => f.is_dir === 1 || f.is_dir === true);
    const files = items.filter(f => !f.is_dir && f.fid);

    let seasons = [];

    if (folders.length > 0) {
      // Has season folders — extract season numbers from names
      seasons = folders.map((f, i) => {
        const numMatch = f.file_name?.match(/(\d+)/);
        return {
          fid: f.fid,
          name: f.file_name || `Season ${i + 1}`,
          seasonNumber: numMatch ? parseInt(numMatch[1]) : i + 1,
        };
      }).sort((a, b) => a.seasonNumber - b.seasonNumber);
    } else if (files.length > 0) {
      // No folders — single "season" with all files as episodes
      seasons = [{ fid: 0, name: "Season 1", seasonNumber: 1, _directFiles: true }];
    }

    console.log(`📁 Found ${seasons.length} seasons`);
    res.json({ shareKey, seasons, hasDirectFiles: files.length > 0 && folders.length === 0 });

  } catch (e) {
    console.error(`❌ /api/series/seasons: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════
// GET /series/episodes?shareKey=X&seasonFid=Y
// Lists files inside a season folder (or root if seasonFid=0)
// ════════════════════════════════════════════════════════
app.get("/series/episodes", async (req, res) => {
  const { shareKey, seasonFid = "0" } = req.query;
  if (!shareKey) return res.status(400).json({ error: "Missing shareKey" });

  try {
    console.log(`\n📺 /series/episodes shareKey=${shareKey} seasonFid=${seasonFid}`);

    const filesRes = await axios.get(`${API_URL}/febbox/files`, {
      params: { shareKey, parent_id: seasonFid }, timeout: 60_000
    });
    const items = filesRes.data || [];

    // Filter to video files only (exclude folders, subtitles, etc.)
    const videoExts = [".mp4", ".mkv", ".avi", ".m3u8", ".webm", ".ts"];
    const videoFiles = items.filter(f => {
      if (f.is_dir) return false;
      const name = (f.file_name || "").toLowerCase();
      return videoExts.some(ext => name.endsWith(ext)) || f.file_size_bytes > 50_000_000;
    });

    // Sort episodes naturally (Episode 1, 2, ... 10, not 1, 10, 2)
    const episodes = videoFiles.map((f, i) => {
      const epMatch = f.file_name?.match(/[Ee](?:pisode\s*)?(\d+)/);
      const numMatch = f.file_name?.match(/(\d+)/);
      return {
        fid: f.fid,
        name: f.file_name || `Episode ${i + 1}`,
        episodeNumber: epMatch ? parseInt(epMatch[1]) : (numMatch ? parseInt(numMatch[1]) : i + 1),
        fileSize: f.file_size || "",
        fileSizeBytes: f.file_size_bytes || 0,
      };
    }).sort((a, b) => a.episodeNumber - b.episodeNumber);

    console.log(`🎞 Found ${episodes.length} episodes`);
    res.json({ episodes });

  } catch (e) {
    console.error(`❌ /api/series/episodes: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════
// GET /play/episode?shareKey=X&fid=Y
// Plays a specific episode file by its fid and shareKey
// ════════════════════════════════════════════════════════
app.get("/play/episode", async (req, res) => {
  const { shareKey, fid } = req.query;
  if (!shareKey || !fid) return res.status(400).json({ error: "Missing shareKey or fid" });

  const cacheKey = `ep_${shareKey}_${fid}`;
  const cached = extractionCache.get(cacheKey);
  if (cached && activeStreams.has(cached.token) && cached.expire > Date.now()) {
    const s = activeStreams.get(cached.token);
    console.log(`⚡ Extraction Cache Hit for episode fid=${fid}`);
    return res.json({ stream: `/stream/${cached.token}`, size: s.fileSize, fileName: s.fileName });
  }

  try {
    console.log(`\n🎬 /api/play/episode shareKey=${shareKey} fid=${fid}`);

    let cdnUrl = null, quality = null, fileName = null, fileSize = null;

    // ── Strategy 1: Puppeteer real-browser extraction ──
    console.log(`🚀 Using Puppeteer real-browser extractor for episode...`);
    try {
      const links = await extractCdnLinks(shareKey, fid, COOKIE);
      if (links && links.length > 0) {
        const qualityOrder = ["4k", "2k", "1080p", "720p", "480p", "360p", "original"];
        const sorted = links.sort((a, b) => {
          const ai = qualityOrder.indexOf((a.quality || "").toLowerCase());
          const bi = qualityOrder.indexOf((b.quality || "").toLowerCase());
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
        const best = sorted[0];
        cdnUrl = best.url;
        quality = best.quality;
        fileName = best.name;
        console.log(`✅ Puppeteer CDN URL for episode: quality=${quality}`);
      }
    } catch (e) {
      console.log(`⚠️ Puppeteer extractor failed for episode: ${e.message}`);
    }

    // ── Strategy 2: Fallback to FlareSolverr links endpoint ──
    if (!cdnUrl) {
      console.log(`🔄 Trying FlareSolverr /febbox/links fallback...`);
      try {
        const r = await axios.get(`${API_URL}/febbox/links`, {
          params: { shareKey, fid }, timeout: 150_000
        });
        const links = (r.data || []).filter(l => isRealCdnUrl(l.url));
        if (links.length > 0) {
          const qualityOrder = ["4k", "2k", "1080p", "720p", "480p", "360p", "original"];
          const sorted = links.sort((a, b) => {
            const ai = qualityOrder.indexOf((a.quality || "").toLowerCase());
            const bi = qualityOrder.indexOf((b.quality || "").toLowerCase());
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
          });
          const best = sorted[0];
          cdnUrl = best.url;
          quality = best.quality;
          fileName = best.name;
          fileSize = best.size;
          console.log(`✅ FlareSolverr links CDN URL: quality=${quality}`);
        }
      } catch (e) {
        console.log(`⚠️ Links fallback failed: ${e.message}`);
      }
    }

    if (!cdnUrl) {
      console.log(`❌ No CDN URL found for episode fid=${fid}`);
      return res.status(503).json({
        error: "Episode stream unavailable — CDN link could not be extracted.",
        hint: "use_embed_fallback",
      });
    }

    const token = crypto.randomBytes(16).toString("hex");
    activeStreams.set(token, {
      fid, shareKey, url: cdnUrl,
      fileName, fileSize, quality,
      expire: Date.now() + 30 * 60 * 1000,
    });

    // Cache extraction result for 10 minutes
    extractionCache.set(cacheKey, { token, expire: Date.now() + 10 * 60 * 1000 });

    console.log(`🔐 Token created → /stream/${token}`);
    res.json({ type: 'stream', stream: `/stream/${token}`, size: fileSize, fileName });

  } catch (e) {
    console.error(`❌ /api/play/episode: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ── Cookie status endpoint ──
// GET /cookies/status
app.get("/cookies/status", (req, res) => {
  res.json(getCookieStatus());
});

// ── Manual cookie injection endpoint ──
// POST /cookies/set  { cookieString: "ui=...; cf_clearance=..." }
app.post("/cookies/set", express.json(), (req, res) => {
  const { cookieString } = req.body || {};
  if (!cookieString) return res.status(400).json({ error: "Missing cookieString" });
  setCookiesManually(cookieString);
  res.json({ ok: true, message: "Cookies stored. Stream server will use them for next extraction." });
});

// ── Universal Cloudflare Bypass API for API Server ──
app.get("/bypass", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url" });
  try {
    const text = await bypassUrl(url);
    if (!text) return res.status(500).json({ error: "Extraction failed" });
    res.send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get("/", (req, res) => res.json({
  status: "Stream server running",
  port: PORT,
  cookie: COOKIE ? "✅ FEBBOX_COOKIE set" : "❌ FEBBOX_COOKIE missing",
}));

app.listen(PORT, () => {
  console.log(`\n🚀 Stream server on port ${PORT}`);
  console.log(`   FEBBOX_COOKIE: ${COOKIE ? "✅ SET" : "❌ NOT SET"}`);
  console.log(`   FlareSolverr:  ${FLARE}`);
  console.log(`   API:           ${API_URL}`);
  console.log(`   /api/play?id=X&type=1  →  { stream: "/stream/{token}" }`);
  console.log(`   /stream/{token}        →  video bytes`);
});
