/**
 * apps/public-discovery — Pillar 3: Listing / Multi-Vendor Marketplace Worker
 * Framework: Hono (T1 — Cloudflare-first)
 *
 * Route map:
 *   GET  /health                              → liveness probe (no auth)
 *   GET  /discover                            → platform home — search + trending
 *   GET  /discover/in/:placeId                → geography-filtered entity listings
 *   GET  /discover/search?q=…&place=…         → full-text + location search
 *   GET  /discover/profile/:entityType/:id    → public entity profile page
 *
 * No authentication required — all routes are public.
 * T3: no tenant isolation — marketplace pages are cross-tenant by design.
 * P9: all prices are integer kobo; formatted at the template layer.
 *
 * PV-1.2 (scaffold)
 */

import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import type { Env } from './env.js';
import { listingsRouter } from './routes/listings.js';
import { profilesRouter } from './routes/profiles.js';

const app = new Hono<{ Bindings: Env }>();

app.use('*', secureHeaders());

// ─── Liveness probe ────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ ok: true, worker: 'public-discovery' }));

// ─── PWA assets (served from Worker) ──────────────────────────────────────
app.get('/manifest.json', (c) => {
  const manifest = {
    name: 'WebWaka Discover',
    short_name: 'Discover',
    description: "Nigeria's multi-vertical business directory and marketplace",
    start_url: '/discover',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a6b3a',
    lang: 'en-NG',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
  return c.json(manifest, 200, { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=3600' });
});

app.get('/sw.js', (c) => {
  const sw = `const CACHE='webwaka-discover-v1';const SHELL=['/discover','/manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(clients.claim());});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});`;
  return c.text(sw, 200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=3600' });
});

// ─── Discovery routes ──────────────────────────────────────────────────────
app.route('/discover', listingsRouter);
app.route('/discover/profile', profilesRouter);

// ─── Root redirect ──────────────────────────────────────────────────────────
app.get('/', (c) => c.redirect('/discover'));

// ─── Fallback ──────────────────────────────────────────────────────────────
app.notFound((c) => c.text('Not found', 404));

app.onError((err, c) => {
  console.error('[public-discovery] unhandled error', err);
  return c.text('Internal server error', 500);
});

export default app;
