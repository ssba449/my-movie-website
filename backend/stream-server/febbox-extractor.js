/**
 * febbox-extractor.js
 * 
 * FINAL SOLUTION: Automated Persistent Browser Extraction
 * 
 * Cloudflare blocks Node.js because of its TLS fingerprint, even with valid cookies.
 * The only 100% reliable bypass is fetching the CDN URLs exactly where the user is:
 * inside a real Chrome browser. 
 * 
 * We keep a SINGLE invisible (off-screen) real Chrome window open in the background.
 * When a stream is requested, we use page.evaluate() to run the fetch INSIDE the browser,
 * which naturally uses Chrome's TLS fingerprint and Cloudflare clearance. No manual cookie grabbing needed!
 */

import puppeteer from 'puppeteer-core';
import { JSDOM } from 'jsdom';
import path from 'path';
import os from 'os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FEBBOX = 'https://www.febbox.com';

// Cache: shareKey+fid → { links, expire }
const extractCache = new Map();

// Persistent browser state
let browserInstance = null;
let browserPage = null;
let isBrowserReady = false;
let browserLock = false; // Prevent concurrent initializations

/**
 * Inject stealth scripts to prevent Cloudflare from detecting Puppeteer,
 * even when running in non-headless mode.
 */
async function applyStealthMode(page) {
    await page.evaluateOnNewDocument(() => {
        // Remove webdriver
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

        // Hide Puppeteer cdc_ variables from window
        let cdcVars = Object.keys(window).filter(key => key.includes('cdc_'));
        cdcVars.forEach(key => delete window[key]);

        // Mock permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );
    });
}

/**
 * Initializes and returns a persistent visible (but off-screen) Chrome page.
 * Keeps the browser open indefinitely and handles Cloudflare challenges.
 */
async function getReadyPage(shareKey, uiCookie) {
    if (isBrowserReady && browserPage) {
        return browserPage;
    }

    // Wait if another request is currently initializing the browser
    while (browserLock) {
        await sleep(500);
        if (isBrowserReady && browserPage) return browserPage;
    }

    browserLock = true;
    console.log('\n🌐 [Puppeteer] Launching persistent background browser for CDN extraction...');

    try {
        const userDataDir = path.join(os.tmpdir(), 'streamvault-chrome-profile');

        browserInstance = await puppeteer.launch({
            executablePath: CHROME_PATH,
            headless: false, // MUST be false to pass CF bot detection naturally
            userDataDir: userDataDir, // Give it a real persistent profile folder
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--window-size=1024,768',
                '--window-position=10000,10000', // Move off-screen so it doesn't bother the user
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--no-first-run',
                '--no-default-browser-check'
            ],
            ignoreDefaultArgs: ['--enable-automation']
        });

        browserPage = await browserInstance.newPage();

        // Apply stealth evasions (just webdriver/cdc removal)
        await applyStealthMode(browserPage);

        if (shareKey && uiCookie) {
            // Inject Febbox login cookie
            await browserPage.setCookie({
                name: 'ui', value: uiCookie, domain: 'www.febbox.com', path: '/', httpOnly: false, secure: true,
            });

            console.log(`🔗 [Puppeteer] Pre-loading Febbox to acquire Cloudflare clearance...`);
            await browserPage.goto(`${FEBBOX}/share/${shareKey}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
            await sleep(4000);
        } else {
            await browserPage.goto('about:blank');
        }

        console.log(`✅ [Puppeteer] Browser is ready and standing by!`);
        isBrowserReady = true;
        return browserPage;

    } catch (e) {
        console.error(`❌ [Puppeteer] Failed to init persistent browser: ${e.message}`);
        if (browserInstance) await browserInstance.close().catch(() => { });
        browserInstance = null;
        browserPage = null;
        isBrowserReady = false;
        throw e;
    } finally {
        browserLock = false;
    }
}

/**
 * The main extractor function called by the stream server.
 * Returns array of { url, quality, name } objects.
 */
export async function extractCdnLinks(shareKey, fid, uiCookie) {
    const cacheKey = `${shareKey}-${fid}`;
    const cached = extractCache.get(cacheKey);
    if (cached && cached.expire > Date.now()) {
        console.log(`⚡ [Cache] Hit for fid=${fid}`);
        return cached.links;
    }

    console.log(`\n🎯 [Extractor] Requesting CDN links for fid=${fid}`);

    try {
        const page = await getReadyPage(shareKey, uiCookie);
        const qualityUrl = `${FEBBOX}/console/video_quality_list?fid=${fid}`;

        console.log(`📡 [Browser-Fetch] Navigating directly to video_quality_list...`);

        // Navigate directly to the JSON endpoint (main frame navigation bypasses XHR blocks)
        const response = await page.goto(qualityUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const text = await response.text();
        const status = response.status();

        console.log(`📥 [Browser-Fetch] Got response: status=${status} length=${text?.length || 0}`);

        if (status === 403 || text?.includes('cf-browser-verification')) {
            console.log(`⚠️ [Browser-Fetch] Cloudflare challenge detected on navigation! Attempting to clear via share page...`);
            await page.goto(`${FEBBOX}/share/${shareKey}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await sleep(4000);
            return [];
        }

        let html = null;
        try {
            const json = JSON.parse(text);
            html = json.html;
        } catch (_) {
            if (text?.includes('file_quality')) html = text;
        }

        if (!html) {
            console.log(`⚠️ [Extractor] No quality HTML in response.`);
            console.log(`--- RESPONSE START ---`);
            console.log(text?.substring(0, 2000));
            console.log(`--- RESPONSE END ---`);
            return [];
        }

        const links = parseQualityHtml(html);
        const validLinks = links.filter(l => isRealCdnUrl(l.url));

        if (validLinks.length > 0) {
            extractCache.set(cacheKey, { links: validLinks, expire: Date.now() + 20 * 60 * 1000 });
            console.log(`🎉 [Extractor] Success! Extracted ${validLinks.length} CDN links`);
            return validLinks;
        }

        console.log(`❌ [Extractor] No valid CDN links parsing HTML`);
        return [];

    } catch (err) {
        console.error(`❌ [Extractor] Critical Error: ${err.message}`);
        // If it was a browser crash, reset state
        if (err.message.includes('Session closed') || err.message.includes('Target closed')) {
            isBrowserReady = false;
            browserPage = null;
        }
        return [];
    }
}

/**
 * Universal Cloudflare bypasser using the persistent browser.
 * Navigates to any URL and returns the raw HTML body.
 */
export async function bypassUrl(url) {
    try {
        const page = await getReadyPage(null, null);
        console.log(`\n🕵️‍♂️ [Bypass] Proxying request to: ${url}`);
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        return await response.text();
    } catch (e) {
        console.error(`❌ [Bypass] Failed: ${e.message}`);
        return null;
    }
}

// Keep these dummy exports so server.js doesn't crash from the previous imports
export function getCookieStatus() { return { hasCookies: true, message: 'Managed automatically by background browser' }; }
export function setCookiesManually() { }

// ── Parse .file_quality HTML fragments ─────────────────────────────────────
function parseQualityHtml(html) {
    if (!html || typeof html !== 'string') return [];
    const links = [];

    try {
        const dom = new JSDOM(html);
        const elements = dom.window.document.querySelectorAll('.file_quality');
        for (const el of elements) {
            const url = el.getAttribute('data-url');
            const quality = el.getAttribute('data-quality');
            if (url) links.push({ url, quality: quality || 'original', name: quality || 'original' });
        }
        if (links.length > 0) return links;
    } catch (_) { }

    const patterns = [
        /data-url="(https?:\/\/[^"]+)"[^>]*data-quality="([^"]*)"/g,
        /data-quality="([^"]*)"[^>]*data-url="(https?:\/\/[^"]+)"/g,
    ];
    for (const regex of patterns) {
        let match;
        while ((match = regex.exec(html)) !== null) {
            const [, a, b] = match;
            const url = a.startsWith('http') ? a : b;
            const quality = a.startsWith('http') ? b : a;
            if (url && !links.find(l => l.url === url)) {
                links.push({ url, quality: quality || 'original', name: quality || 'original' });
            }
        }
    }
    return links;
}

function isRealCdnUrl(url) {
    if (!url) return false;
    if (url.includes('febbox.com/file/down')) return false;
    if (url.includes('febbox.com/share')) return false;
    return url.startsWith('http');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
