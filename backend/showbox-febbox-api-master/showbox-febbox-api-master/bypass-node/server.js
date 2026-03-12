const express = require("express");
const cors = require("cors");
const cloudscraper = require("cloudscraper");

const app = express();
app.use(cors());

// Configure cloudscraper with cookie jar support
const scraper = cloudscraper.defaults({
    jar: true,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8"
    }
});

app.get("/html", async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: "Missing URL" });
    }

    console.log(`Bypassing Cloudflare for: ${url}`);

    try {
        const response = await scraper.get(url);
        res.send(response);
    } catch (err) {
        console.error(`Cloudflare bypass failed for ${url}:`, err.message);
        res.status(500).json({ error: "Cloudflare bypass failed", details: err.message });
    }
});

// Run on port 8000 to drop-in replace the Python server
app.listen(8000, () => {
    console.log("Node.js Cloudscraper Proxy running on port 8000");
});
