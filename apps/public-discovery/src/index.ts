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
