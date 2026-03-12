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

const streamProxyOpts = { target: `http://127.0.0.1:${STREAM_PORT}`, changeOrigin: true, pathRewrite: { '^/stream-server': '' } };
const showboxProxyOpts = { target: `http://127.0.0.1:${API_PORT}`, changeOrigin: true };

// Proxy rules
app.use('/stream-server', createProxyMiddleware(streamProxyOpts));
app.use('/stream', createProxyMiddleware(streamProxyOpts));

// Stream server aliases
app.use('/api/play', createProxyMiddleware(streamProxyOpts));
app.use('/api/stream', createProxyMiddleware(streamProxyOpts));

// Showbox API aliases
app.get('/api/movies', (req, res, next) => {
    req.url = '/api/list';
    req.query.type = 'movie';
    next();
});

app.get('/api/tv', (req, res, next) => {
    req.url = '/api/list';
    req.query.type = 'tv';
    next();
});

app.use('/api', createProxyMiddleware(showboxProxyOpts));

// Root health check
app.get('/', (req, res) => {
    res.json({ status: 'Backend Gateway Running', services: ['showbox-api', 'stream-server'] });
});

app.listen(PORT, () => {
    console.log(`Gateway server listening on port ${PORT}`);
    console.log(`Proxying /api to port ${API_PORT}`);
    console.log(`Proxying /stream to port ${STREAM_PORT}`);
});

process.on('SIGINT', () => {
    apiProcess.kill();
    streamProcess.kill();
    process.exit();
});
