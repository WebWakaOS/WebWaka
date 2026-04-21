/**
 * Local development shim for the WebWaka OS Platform Admin.
 *
 * Production target: Cloudflare Workers (TDR-0002).
 * This file is a LOCAL DEV ONLY static file server using Node.js built-ins.
 * No third-party server framework — Platform Invariant T1 compliance.
 *
 * NOT deployed to production. Replaced by Cloudflare Pages in staging/production.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = Number.parseInt(process.env.PORT ?? '5000', 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'",
};

function resolvePublicPath(url) {
  const rawPath = new URL(url ?? '/', `http://127.0.0.1:${PORT}`).pathname;
  const requestPath = rawPath === '/' ? '/index.html' : rawPath;
  const normalizedPath = path.normalize(decodeURIComponent(requestPath)).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.resolve(PUBLIC_DIR, `.${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`);

  if (!filePath.startsWith(`${PUBLIC_DIR}${path.sep}`) && filePath !== PUBLIC_DIR) {
    return null;
  }

  return filePath;
}

const server = http.createServer((req, res) => {
  const requestPath = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`).pathname;

  if (requestPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
    res.end(JSON.stringify({ status: 'ok', app: 'WebWaka OS Platform Admin', milestone: 2 }));
    return;
  }

  const filePath = resolvePublicPath(req.url);

  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType, ...SECURITY_HEADERS });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`WebWaka OS Platform Admin (local dev shim) running on http://0.0.0.0:${PORT}`);
  console.log(`Serving static files from: ${PUBLIC_DIR}`);
});
