const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');

// Try to use stealth if available, otherwise just puppeteer
try {
    puppeteer.use(StealthPlugin());
} catch (e) {
    console.log("Stealth plugin not found, using standard puppeteer");
}

const app = express();
app.use(cors());

let browser;

async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    return browser;
}

app.get('/html', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send("Missing URL");

    console.log(`Bypassing Cloudflare for: ${url}`);
    let page;
    try {
        const b = await getBrowser();
        page = await b.newPage();

        // Emulate a real user
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait a bit for potential challenge
        await new Promise(r => setTimeout(r, 5000));

        const content = await page.content();
        await page.close();
        res.send(content);
    } catch (error) {
        console.error("Bypass failed:", error.message);
        if (page) await page.close();
        res.status(500).json({ error: error.message });
    }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Puppeteer Bypass Server running on port ${PORT}`);
});
