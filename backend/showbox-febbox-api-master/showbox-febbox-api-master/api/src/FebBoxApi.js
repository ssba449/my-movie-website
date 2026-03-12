import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';

dotenv.config();

const FLARESOLVERR_URL = "http://localhost:8191/v1";
const FEBBOX_UI_COOKIE = process.env.FEBBOX_UI_COOKIE;

// ─────────────────────────────────────────────
// FlareSolverr helpers
// ─────────────────────────────────────────────

async function flareSolverrRequest(body) {
    const res = await fetch(FLARESOLVERR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!data.solution) {
        console.error("FlareSolverr error:", JSON.stringify(data));
        throw new Error("FlareSolverr failed: " + (data.message || JSON.stringify(data)));
    }
    return data.solution;
}

async function fsGet(url, sessionId = null, extraCookies = []) {
    const body = { cmd: "request.get", url, maxTimeout: 60000 };
    if (sessionId) body.session = sessionId;
    if (extraCookies.length > 0) body.cookies = extraCookies;
    return await flareSolverrRequest(body);
}

async function createSession(sessionId) {
    await fetch(FLARESOLVERR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd: "sessions.create", session: sessionId })
    });
}

async function destroySession(sessionId) {
    await fetch(FLARESOLVERR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd: "sessions.destroy", session: sessionId })
    });
}

// ─────────────────────────────────────────────
// Helper: is this a real CDN URL (not a login redirect)?
// ─────────────────────────────────────────────
function isRealCdnUrl(url) {
    if (!url) return false;
    // Reject febbox redirect URLs — they require auth and redirect to login
    if (url.includes('febbox.com/file/down')) return false;
    if (url.includes('febbox.com/share')) return false;
    // Must look like a real video resource
    return url.startsWith('http') && (
        url.includes('.mp4') ||
        url.includes('.m3u8') ||
        url.includes('.mkv') ||
        url.includes('.webm') ||
        url.includes('cdn') ||
        url.includes('storage') ||
        url.includes('stream') ||
        url.includes('video')
    );
}

// ─────────────────────────────────────────────
// FebboxAPI class
// ─────────────────────────────────────────────

class FebboxAPI {
    constructor() {
        this.baseUrl = 'https://www.febbox.com';
        this.headers = this._getDefaultHeaders();
        this._setAuthCookie(FEBBOX_UI_COOKIE);
    }

    _setAuthCookie(cookie) {
        if (!cookie) return this;
        this.headers.cookie = `ui=${cookie}`;
        return this;
    }

    _getDefaultHeaders() {
        return {
            'x-requested-with': 'XMLHttpRequest',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        };
    }

    _setReferer(shareKey) {
        this.headers.referer = `${this.baseUrl}/share/${shareKey}`;
    }

    async _fetchJson(url, cookie = null) {
        const headers = {
            ...this.headers,
            ...(cookie ? { cookie: `ui=${cookie}` } : {}),
            'Accept': 'application/json, text/javascript, */*; q=0.01',
        };
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Error fetching data from ${url}: ${response.statusText}`);
        return response.json();
    }

    async getFileList(shareKey, parentId = 0, cookie = null) {
        const url = `${this.baseUrl}/file/file_share_list?share_key=${shareKey}&pwd=&parent_id=${parentId}&is_html=0`;
        this._setReferer(shareKey);
        const data = await this._fetchJson(url, cookie);
        return data.data.file_list;
    }

    // ─────────────────────────────────────────────
    // getLinks: attempts multiple strategies to get real CDN URLs
    // ─────────────────────────────────────────────
    async getLinks(shareKey, fid, cookie = null) {
        const qualityUrl = `${this.baseUrl}/console/video_quality_list?fid=${fid}`;
        this._setReferer(shareKey);

        const activeCookie = cookie || FEBBOX_UI_COOKIE;

        // ── ATTEMPT 1: Direct fetch with cookie auth ──────────────────────────
        if (activeCookie) {
            try {
                console.log("🔑 Attempt 1: Direct auth fetch for video_quality_list...");
                const data = await this._fetchJson(qualityUrl, activeCookie);
                if (data && data.html && typeof data.html === 'string') {
                    const htmlContent = data.html.trim();
                    // Make sure it's not a full HTML error page
                    if (!htmlContent.startsWith('<html') && !htmlContent.startsWith('<!DOCTYPE')) {
                        const dom = new JSDOM(htmlContent);
                        const links = this._extractFileQualities(dom.window.document);
                        const validLinks = links.filter(l => isRealCdnUrl(l.url));
                        if (validLinks.length > 0) {
                            console.log(`✅ Direct fetch succeeded: ${validLinks.length} quality links found.`);
                            return validLinks;
                        }
                    }
                }
                console.log("⚠️ Direct fetch returned no valid links.");
            } catch (e) {
                console.log(`⚠️ Direct fetch failed: ${e.message}`);
            }
        }

        // ── ATTEMPT 2: FlareSolverr session with cookie ───────────────────────
        console.log("🔄 Attempt 2: FlareSolverr session for video_quality_list...");
        const sessionId = `febbox-session-${fid}-${Date.now()}`;
        try {
            await createSession(sessionId);

            const shareCookies = activeCookie
                ? [{ name: 'ui', value: activeCookie, domain: 'www.febbox.com', path: '/' }]
                : [];

            // Warm up session on the share page first (gets CF clearance cookies)
            await fsGet(`${this.baseUrl}/share/${shareKey}`, sessionId, shareCookies);

            // Now request the quality list
            const solution = await fsGet(qualityUrl, sessionId, shareCookies);
            await destroySession(sessionId).catch(() => { });

            const rawResponse = solution.response || '';

            // Case A: Response is a JSON string (API responded correctly through FlareSolverr)
            try {
                const parsed = JSON.parse(rawResponse);
                if (parsed && parsed.html && typeof parsed.html === 'string') {
                    const htmlContent = parsed.html.trim();
                    if (!htmlContent.startsWith('<html') && !htmlContent.startsWith('<!DOCTYPE')) {
                        const dom = new JSDOM(htmlContent);
                        const links = this._extractFileQualities(dom.window.document);
                        const validLinks = links.filter(l => isRealCdnUrl(l.url));
                        if (validLinks.length > 0) {
                            console.log(`✅ FlareSolverr JSON approach: ${validLinks.length} links found.`);
                            return validLinks;
                        }
                    }
                }
            } catch (_) {
                // Not JSON — will try raw HTML below
            }

            // Case B: Response is raw HTML containing .file_quality elements
            if (rawResponse && rawResponse.includes('file_quality')) {
                const dom = new JSDOM(rawResponse);
                const links = this._extractFileQualities(dom.window.document);
                const validLinks = links.filter(l => isRealCdnUrl(l.url));
                if (validLinks.length > 0) {
                    console.log(`✅ FlareSolverr HTML approach: ${validLinks.length} links found.`);
                    return validLinks;
                }
            }

            // Case C: FlareSolverr gave us a ui cookie — retry direct fetch with it
            const uiFromSession = solution.cookies?.find(c => c.name === 'ui');
            if (uiFromSession) {
                console.log("🔄 Got ui cookie from FlareSolverr session, retrying direct fetch...");
                try {
                    const data = await this._fetchJson(qualityUrl, uiFromSession.value);
                    if (data && data.html && typeof data.html === 'string') {
                        const dom = new JSDOM(data.html);
                        const links = this._extractFileQualities(dom.window.document);
                        const validLinks = links.filter(l => isRealCdnUrl(l.url));
                        if (validLinks.length > 0) {
                            console.log(`✅ Session cookie retry: ${validLinks.length} links found.`);
                            return validLinks;
                        }
                    }
                } catch (e) {
                    console.log(`Session cookie retry failed: ${e.message}`);
                }
            }

        } catch (e) {
            console.error(`❌ FlareSolverr session failed: ${e.message}`);
            await destroySession(sessionId).catch(() => { });
        }

        // ── ATTEMPT 3: Port 8000 local bypass server ──────────────────────────
        console.log("🔄 Attempt 3: Local port 8000 bypass server...");
        try {
            const bypassUrl = `http://localhost:8000/html?url=${encodeURIComponent(qualityUrl)}`;
            const res = await fetch(bypassUrl);
            if (res.ok) {
                const html = await res.text();
                if (html && html.includes('file_quality')) {
                    const dom = new JSDOM(html);
                    const links = this._extractFileQualities(dom.window.document);
                    const validLinks = links.filter(l => isRealCdnUrl(l.url));
                    if (validLinks.length > 0) {
                        console.log(`✅ Port 8000 bypass: ${validLinks.length} links found.`);
                        return validLinks;
                    }
                }
            }
        } catch (e) {
            console.log(`Port 8000 fallback failed: ${e.message}`);
        }

        // ── ALL ATTEMPTS FAILED ───────────────────────────────────────────────
        // Return empty array so callers can trigger their own fallback (e.g. Vidsrc)
        console.log("❌ All getLinks attempts failed. Returning [] so caller can use Vidsrc fallback.");
        return [];
    }

    _extractFileQualities(doc) {
        return Array.from(doc.querySelectorAll('.file_quality')).map(fileDiv => {
            const url = fileDiv.getAttribute('data-url');
            const quality = fileDiv.getAttribute('data-quality');
            const name = fileDiv.querySelector('.name')?.textContent.trim();
            const speed = fileDiv.querySelector('.speed span')?.textContent.trim();
            const size = fileDiv.querySelector('.size')?.textContent.trim();

            return { url, quality, name, speed, size };
        });
    }
}

export default FebboxAPI;
