import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(join(__dir, '.env'), 'utf-8');
let uiCookie = '';
for (const line of envFile.split('\n')) {
    const t = line.trim();
    if (t.startsWith('FEBBOX_COOKIE=')) uiCookie = t.split('=').slice(1).join('=');
}

const shareKey = 'gepn9bF5';
const fid = 26130036;

// FlareSolverr to get CF cookies AND full share page HTML
const warm = await fetch('http://localhost:8191/v1', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: 'request.get', url: `https://www.febbox.com/share/${shareKey}`, maxTimeout: 60000 })
}).then(r => r.json());

const cfCookies = (warm.solution?.cookies || []).map(c => c.name + '=' + c.value).join('; ');
const allCookies = uiCookie + '; ' + cfCookies;
const shareHtml = warm.solution?.response || '';

// Find all URLs containing the fid
const fidUrls = shareHtml.match(new RegExp(`[^"'<>\\s]*${fid}[^"'<>\\s]*`, 'g')) || [];
console.log('FID URLs in share page:', fidUrls.slice(0, 5));

// Find download-related AJAX endpoints
const dlEndpoints = shareHtml.match(/\/(?:file|console)\/[^\s"'<>?]+/g) || [];
const unique = [...new Set(dlEndpoints)];
console.log('\nEndpoints found:', unique.slice(0, 20).join('\n'));

// Try the file_share_list endpoint to get proper fid
const listResp = await fetch(`https://www.febbox.com/file/file_share_list?share_key=${shareKey}&pwd=&parent_id=0&is_html=0`, {
    headers: {
        Cookie: allCookies,
        'X-Requested-With': 'XMLHttpRequest',
        Referer: `https://www.febbox.com/share/${shareKey}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    }
});
const listData = await listResp.json().catch(async () => {
    const t = await listResp.text(); return { error: t.substring(0, 200) };
});
console.log('\nFile list status:', listResp.status);
const files = listData?.data?.file_list || [];
console.log('Files:', files.length > 0 ? files.map(f => `${f.fid} ${f.file_name} ${f.file_size}`).join('\n') : JSON.stringify(listData).substring(0, 300));
