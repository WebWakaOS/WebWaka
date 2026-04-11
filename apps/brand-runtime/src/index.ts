/**
 * apps/brand-runtime — Pillar 2: Branding / Website / Portal Worker
 * Framework: Hono (T1 — Cloudflare-first)
 *
 * Route map:
 *   GET  /                   → tenant-branded public home page
 *   GET  /:slug              → branded home by slug (path-based fallback)
 *   GET  /portal/login       → tenant-branded login page
 *   POST /portal/login       → credential submission → API Worker → JWT cookie
 *   GET  /portal/            → portal dashboard redirect
 *   GET  /health             → liveness probe (no auth)
 *
 * Tenant resolution priority (tenantResolve middleware):
 *   1. Custom domain match (custom_domain in tenant_branding)
 *   2. brand-{slug}.webwaka.ng subdomain
 *   3. /:slug route parameter
 *
 * PV-1.1 (scaffold) + PV-1.3 (white-label-theming wired)
 * Platform Invariants: P2 (Nigeria First), T3 (tenant isolation)
 */

import { Hono } from 'hono';
import type { Env } from './env.js';
import { brandedPageRouter } from './routes/branded-page.js';
import { portalRouter } from './routes/portal.js';

const app = new Hono<{ Bindings: Env }>();

// ─── Liveness probe (no auth, no tenant resolution) ───────────────────────
app.get('/health', (c) => c.json({ ok: true, worker: 'brand-runtime' }));

// ─── Portal routes (branded auth shell) ───────────────────────────────────
app.route('/portal', portalRouter);

// ─── Branded public home ───────────────────────────────────────────────────
app.route('/', brandedPageRouter);

// ─── Unmatched ─────────────────────────────────────────────────────────────
app.notFound((c) => c.text('Not found', 404));

app.onError((err, c) => {
  console.error('[brand-runtime] unhandled error', err);
  return c.text('Internal server error', 500);
});

export default app;
