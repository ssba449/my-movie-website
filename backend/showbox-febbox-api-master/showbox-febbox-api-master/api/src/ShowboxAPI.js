import CryptoJS from 'crypto-js';
import { customAlphabet } from 'nanoid';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const CONFIG = {
    BASE_URL: 'https://mbpapi.shegu.net/api/api_client/index/',
    APP_KEY: 'moviebox',
    APP_ID: 'com.tdo.showbox',
    IV: 'wEiphTn!',
    KEY: '123d6cedf626dy54233aa1w6',
    DEFAULTS: {
        CHILD_MODE: process.env.CHILD_MODE || '0',
        APP_VERSION: '11.5',
        LANG: 'en',
        PLATFORM: 'android',
        CHANNEL: 'Website',
        APPID: '27',
        VERSION: '129',
        MEDIUM: 'Website',
    },
};

const nanoid = customAlphabet('0123456789abcdef', 32);

async function fetchFromBypassServer(url) {
    console.log(`\n🔗 Attempting to fetch: ${url}`);

    // ── ATTEMPT 1: Direct Fetch with specialized headers ──
    try {
        console.log("➡️ Attempt 1: Direct Fetch...");
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            }
        });

        if (response.ok) {
            const text = await response.text();
            if (text.includes('share_key') || text.includes('fid') || text.includes('link')) {
                console.log("✅ Direct fetch successful!");
                return text;
            }
        }
        console.log(`⚠️ Direct fetch returned ${response.status} or invalid content.`);
    } catch (e) {
        console.log(`❌ Direct fetch failed: ${e.message}`);
    }

    // ── ATTEMPT 2: Stream Server Bypass (Port 4000) ──
    try {
        console.log("➡️ Attempt 2: Stream Server Bypass (Port 4000)...");
        const encodedUrl = encodeURIComponent(url);
        const response = await fetch(`http://localhost:4000/api/bypass?url=${encodedUrl}`);

        if (response.ok) {
            const rawText = await response.text();
            if (rawText && rawText.length > 100) {
                console.log("✅ Bypass server successful!");
                return rawText;
            }
        }
    } catch (e) {
        console.log(`❌ Bypass server failed: ${e.message}`);
    }

    // ── ATTEMPT 3: Public CORS Proxy as last resort ──
    const PROXIES = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`
    ];

    for (const proxyUrl of PROXIES) {
        try {
            console.log(`➡️ Attempt 3: Public Proxy (${proxyUrl.substring(0, 30)})...`);
            const response = await fetch(proxyUrl);
            if (response.ok) {
                const data = await response.json();
                const text = data.contents || data; // Handle allorigins wrap
                if (text && typeof text === 'string' && text.length > 100) {
                    console.log("✅ Public proxy successful!");
                    return text;
                }
            }
        } catch (e) {
            console.log(`❌ Public proxy failed: ${e.message}`);
        }
    }

    throw new Error('All bypass methods failed to retrieve the requested content.');
}

class ShowboxAPI {
    constructor() {
        this.baseUrl = CONFIG.BASE_URL;
    }

    encrypt(data) {
        return CryptoJS.TripleDES.encrypt(
            data,
            CryptoJS.enc.Utf8.parse(CONFIG.KEY),
            { iv: CryptoJS.enc.Utf8.parse(CONFIG.IV) }
        ).toString();
    }

    generateVerify(encryptedData) {
        return CryptoJS.MD5(
            CryptoJS.MD5(CONFIG.APP_KEY).toString() + CONFIG.KEY + encryptedData
        ).toString();
    }

    getExpiryTimestamp() {
        return Math.floor(Date.now() / 1000 + 60 * 60 * 12);
    }

    async request(module, params = {}) {
        const requestData = {
            ...CONFIG.DEFAULTS,
            expired_date: this.getExpiryTimestamp(),
            module,
            ...params,
        };

        const encryptedData = this.encrypt(JSON.stringify(requestData));
        const body = JSON.stringify({
            app_key: CryptoJS.MD5(CONFIG.APP_KEY).toString(),
            verify: this.generateVerify(encryptedData),
            encrypt_data: encryptedData,
        });

        const formData = new URLSearchParams({
            data: Buffer.from(body).toString('base64'),
            appid: CONFIG.DEFAULTS.APPID,
            platform: CONFIG.DEFAULTS.PLATFORM,
            version: CONFIG.DEFAULTS.VERSION,
            medium: CONFIG.DEFAULTS.MEDIUM,
        });

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Platform': CONFIG.DEFAULTS.PLATFORM,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'okhttp/3.2.0',
                },
                body: `${formData.toString()}&token${nanoid()}`,
            });

            const rawText = await response.text();
            console.log(`📦 Showbox Response [${module}]:`, rawText.substring(0, 500));

            // Handle common Showbox garbage (PHP debug paths, etc.)
            const jsonStart = rawText.indexOf('{');
            const jsonEnd = rawText.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1) {
                const cleanJsonStr = rawText.substring(jsonStart, jsonEnd + 1);
                return JSON.parse(cleanJsonStr);
            }

            return JSON.parse(rawText);
        } catch (e) {
            console.error(`Request to ${module} failed:`, e.message);
            return { data: null };
        }
    }

    async search(title, type = 'all', page = 1, pagelimit = 20) {
        // Normalize type for Search5: all, movie, tv
        const searchType = type === 'series' ? 'tv' : type;

        try {
            const response = await this.request('Search5', { page, type: searchType, keyword: title, pagelimit });
            console.log(`🔍 Search results for "${title}":`, JSON.stringify(response).substring(0, 500));
            let data = response?.data || [];

            // If Search5 returns no data, try Autocomplete as fallback
            if (!Array.isArray(data) || data.length === 0) {
                console.log(`🔍 Search5 returned no results for "${title}". Trying Autocomplete...`);
                const suggestions = await this.getAutocomplete(title, pagelimit);

                if (Array.isArray(suggestions)) {
                    data = suggestions.map(item => {
                        // If it's a string, wrap it. Usually it's an object with {id, title, ...}
                        if (typeof item === 'string') return { title: item, id: '0', box_type: 1 };
                        return item;
                    });
                }
            }

            // Final safety filter: ensure everything has at least a title and ID
            return (Array.isArray(data) ? data : []).filter(item => item && (item.title || item.display_title || item[1]));
        } catch (e) {
            console.error("Search failed:", e.message);
            return [];
        }
    }

    async getMovieDetails(movieId) {
        return this.request('Movie_detail', { mid: movieId }).then(data => {
            return data.data;
        });
    }

    async getShowDetails(showId) {
        return this.request('TV_detail_v2', { tid: showId }).then(data => {
            return data.data;
        });
    }

    async getFebBoxId(id, type) {
        const targetUrl = `https://www.showbox.media/index/share_link?id=${id}&type=${type}`;

        console.log(`\n🔄 Bypassing Cloudflare for: ${targetUrl}`);

        try {
            let rawText = await fetchFromBypassServer(targetUrl);

            import('fs').then(fs => fs.writeFileSync('debug-bypass.html', rawText));

            console.log("\n--- RAW BYPASS RESPONSE HEAD ---");
            console.log(rawText.substring(0, 500));
            console.log("--------------------------------\n");

            try {
                // The python server wraps the JSON in HTML <pre> tags. We need to parse it out.
                // We'll use a regex to extract everything between the first '{' and the last '}'
                const match = rawText.match(/\{[\s\S]*\}/);

                if (match) {
                    const cleanJson = match[0];
                    const data = JSON.parse(cleanJson);

                    if (data && data.data && data.data.link) {
                        const link = data.data.link;
                        console.log(`✅ Successfully retrieved link: ${link}`);
                        return link.split('/').pop();
                    } else {
                        console.error("Invalid data structure received:", data);
                        return null;
                    }
                } else {
                    console.error("No JSON braces found in response");
                    return null;
                }
            } catch (e) {
                console.error("Failed to parse response from bypass server: " + e.message);
                return null;
            }

        } catch (error) {
            console.error("Error during automated bypass:", error);
            return null;
        }
    }

    // Fetch trending / homepage feed
    async getHomeList() {
        return this.request('Home_list').then(data => {
            return data.data;
        });
    }

    // Fetch categorized lists: type=movie or tv, sort=imdb_rating, release_date, etc.
    async getList(type = 'movie', sort = 'release_date', page = 1, pagelimit = 20) {
        const moduleName = type === 'tv' ? 'TV_list' : 'Movie_list';
        return this.request(moduleName, {
            page,
            pagelimit,
            sort
        }).then(data => {
            return data.data;
        });
    }

    async getAutocomplete(keyword, pagelimit = 5) {
        return this.request('Autocomplate2', { keyword, pagelimit: pagelimit }).then(data => {
            return data.data;
        });
    }
}

export default ShowboxAPI;