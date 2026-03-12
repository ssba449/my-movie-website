import { extractCdnLinks } from './febbox-extractor.js';

const shareKey = 'c3pwbv1f7n'; // from previous requests
const fid = '13028308';
const uiCookie = process.env.FEBBOX_UI_COOKIE || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NzI0MTgwOTEsIm5iZiI6MTc3MjQxODA5MSwiZXhwIjoxODAzNTIyMTExLCJkYXRhIjp7InVpZCI6MTQ3NjUyNSwidG9rZW4iOiI4ZTViZDJjNGIyYmYxODZiZmVhNTQwNjc3NjNhMzkxOCJ9fQ.gvrFvyvattvbyKn6vKNtxuHJwF6RXCL_-qVLU3ZS9Pg';

console.log('Testing extraction directly...');
extractCdnLinks(shareKey, fid, uiCookie)
    .then(links => {
        console.log('\nFINAL RESULT:', links);
        process.exit(0);
    })
    .catch(err => {
        console.error('\nFATAL ERROR:', err);
        process.exit(1);
    });
