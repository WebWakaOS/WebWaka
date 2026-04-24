/**
 * apps/tenant-public — Cloudflare Workers entry point for public tenant sites.
 *
 * Each tenant (identified by Host header → tenantSlug) gets a white-label
 * discovery page rendered server-side via the @webwaka/frontend package.
 *
 * Routes:
 *   GET /            — discovery page (public profiles)
 *   GET /profiles/:id — single profile view
 *   GET /health      — liveness probe
 *
 * Milestone 6 — Frontend Composition Layer
 * CODE-6 — Wire @webwaka/white-label-theming so every tenant page renders
 *           with tenant-specific brand tokens (primary color, display name,
 *           CSS variables). getBrandTokens called without KV cache — tenant-
 *           public does not provision THEME_CACHE; D1 fallback is used directly.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { createCorsConfig } from '@webwaka/shared-config';
import { getTenantManifestBySlug, renderProfileList } from '@webwaka/frontend';
import type { TenantManifest } from '@webwaka/frontend';
import { getBrandTokens } from '@webwaka/white-label-theming';
import type { TenantTheme } from '@webwaka/white-label-theming';

interface Env {
  DB: D1Database;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  ALLOWED_ORIGINS?: string;
  /** HMAC secret for unsubscribe token signing (shared with apps/api) */
  UNSUBSCRIBE_HMAC_SECRET?: string;
  /**
   * BUG-P3-013 fix: KV namespace for caching brand tokens (theme, display name).
   * Declared optional so the worker runs without it (falls back to D1 on every request).
   * Provision via: wrangler kv namespace create THEME_CACHE --env <env>
   * and update wrangler.toml with the real KV namespace ID.
   */
  THEME_CACHE?: KVNamespace;
}

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean }>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

interface ProfileRow {
  id: string;
  entity_id: string;
  entity_type: string;
  display_name: string;
  headline: string | null;
  avatar_url: string | null;
  place_id: string | null;
  visibility: string;
  claim_status: string | null;
  content: string | null;
  created_at: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', secureHeaders());
// SEC-06 + SEC-08 + ARC-05: Use shared CORS config with environment-aware localhost gating
app.use('*', async (c, next) => {
  const config = createCorsConfig({
    environment: c.env.ENVIRONMENT,
    ...(c.env.ALLOWED_ORIGINS !== undefined ? { allowedOriginsEnv: c.env.ALLOWED_ORIGINS } : {}),
    allowHeaders: ['Content-Type'],
    allowMethods: ['GET', 'OPTIONS'],
  });
  return cors(config)(c, next);
});

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

app.get('/health', (c) => c.json({ status: 'ok', app: 'tenant-public' }));

// ---------------------------------------------------------------------------
// Extract tenant slug from request (x-tenant-slug header or Host subdomain)
// ---------------------------------------------------------------------------

function extractTenantSlug(req: Request): string | null {
  const headerSlug = req.headers.get('x-tenant-slug');
  if (headerSlug) return headerSlug;

  const host = req.headers.get('host') ?? '';
  const subdomain = host.split('.')[0] ?? '';
  return subdomain || null;
}

// ---------------------------------------------------------------------------
// Resolve brand tokens (CODE-6) — fails open: returns null if tenant not found
// ---------------------------------------------------------------------------

async function resolveBrandTheme(slug: string, db: D1Like): Promise<TenantTheme | null> {
  try {
    const tokens = await getBrandTokens(slug, db as Parameters<typeof getBrandTokens>[1]);
    return tokens.theme;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// PWA assets (served from Worker)
// ---------------------------------------------------------------------------

/**
 * CODE-6: manifest.json is now tenant-aware.
 * Resolves tenant slug → getBrandTokens → uses tenant primaryColor and displayName.
 * Falls back to WebWaka defaults if tenant cannot be resolved.
 */
app.get('/manifest.json', async (c) => {
  const slug = extractTenantSlug(c.req.raw);
  const db = c.env.DB as unknown as D1Like;

  let themeColor = '#1a6b3a';
  let appName = 'WebWaka';
  let appDescription = "Nigeria's multi-vertical business platform";

  if (slug) {
    const theme = await resolveBrandTheme(slug, db);
    if (theme) {
      themeColor = theme.primaryColor;
      appName = theme.displayName;
      appDescription = `${theme.displayName} — powered by WebWaka`;
    }
  }

  const manifest = {
    name: appName,
    short_name: appName.length > 12 ? appName.slice(0, 12) : appName,
    description: appDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: themeColor,
    lang: 'en-NG',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
  return c.json(manifest, 200, { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=3600' });
});

app.get('/sw.js', (c) => {
  const sw = `const CACHE='webwaka-tenant-v1';const SHELL=['/','/manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(clients.claim());});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});`;
  return c.text(sw, 200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=3600' });
});

// ---------------------------------------------------------------------------
// Resolve tenant from Host header or x-tenant-slug
// ---------------------------------------------------------------------------

async function resolveTenant(c: { req: Request; env: Env }): Promise<TenantManifest | null> {
  const db = c.env.DB as unknown as D1Like;

  const headerSlug = c.req.headers.get('x-tenant-slug');
  if (headerSlug) return getTenantManifestBySlug(db, headerSlug);

  const host = c.req.headers.get('host') ?? '';
  const slug = host.split('.')[0] ?? '';
  if (!slug) return null;

  return getTenantManifestBySlug(db, slug);
}

// ---------------------------------------------------------------------------
// Discovery page — GET /
// ---------------------------------------------------------------------------

app.get('/', async (c) => {
  const manifest = await resolveTenant({ req: c.req.raw, env: c.env });
  if (!manifest) return c.json({ error: 'Tenant not found' }, 404);
  if (!manifest.features.discoveryEnabled) return c.json({ error: 'Discovery disabled' }, 403);

  const db = c.env.DB as unknown as D1Like;
  const q = c.req.query('q');
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(c.req.query('perPage') ?? '20', 10)));
  const offset = (page - 1) * perPage;

  // BUG-P3-005 fix: profiles are scoped by tenant_id, not workspace_id.
  // manifest.tenantId is the correct predicate; workspace_id is only set
  // after a claim is approved and must not be used for tenant scoping.
  let sql = `SELECT p.id, p.entity_id, p.entity_type, p.display_name, p.headline,
                    p.avatar_url, p.place_id, p.visibility, p.claim_status, p.content,
                    datetime(p.created_at,'unixepoch') AS created_at
             FROM profiles p
             WHERE p.tenant_id = ? AND p.visibility IN ('public','semi')`;
  const binds: unknown[] = [manifest.tenantId];

  if (q) {
    sql += ' AND p.display_name LIKE ?';
    binds.push(`%${q}%`);
  }

  sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  binds.push(perPage, offset);

  const rows = await db.prepare(sql).bind(...binds).all<ProfileRow>();
  const profiles = renderProfileList(rows.results, manifest);

  // CODE-6: Resolve brand tokens and include in response for frontend CSS variable injection
  const slug = extractTenantSlug(c.req.raw);
  const brand = slug ? await resolveBrandTheme(slug, db) : null;

  return c.json({ manifest, profiles, page, perPage, brand });
});

// ---------------------------------------------------------------------------
// Single profile — GET /profiles/:id
// ---------------------------------------------------------------------------

app.get('/profiles/:id', async (c) => {
  const manifest = await resolveTenant({ req: c.req.raw, env: c.env });
  if (!manifest) return c.json({ error: 'Tenant not found' }, 404);

  const profileId = c.req.param('id');
  const db = c.env.DB as unknown as D1Like;

  // BUG-P3-005 fix: scope by tenant_id, not workspace_id.
  const row = await db
    .prepare(
      `SELECT p.id, p.entity_id, p.entity_type, p.display_name, p.headline,
              p.avatar_url, p.place_id, p.visibility, p.claim_status, p.content,
              datetime(p.created_at,'unixepoch') AS created_at
       FROM profiles p
       WHERE p.id = ? AND p.tenant_id = ? AND p.visibility != 'private'`,
    )
    .bind(profileId, manifest.tenantId)
    .first<ProfileRow>();

  if (!row) return c.json({ error: 'Profile not found' }, 404);

  const [profile] = renderProfileList([row], manifest);

  // CODE-6: Resolve brand tokens and include in response for frontend CSS variable injection
  const slug = extractTenantSlug(c.req.raw);
  const brand = slug ? await resolveBrandTheme(slug, db) : null;

  return c.json({ manifest, profile, brand });
});

// ---------------------------------------------------------------------------
// N-071 — Unsubscribe landing page: GET /unsubscribe?token=...
//
// Validates HMAC-SHA256 token generated by generateUnsubscribeUrl().
// On success: calls addSuppression() + renders success HTML page.
// On failure: renders error HTML page (invalid/expired token).
//
// Security: token is time-limited (default 7 days in unsubscribe.ts).
// GDPR/NDPR: raw email is never stored; only SHA-256 hash (G23).
// ---------------------------------------------------------------------------

app.get('/unsubscribe', async (c) => {
  const token = c.req.query('token') ?? '';
  const secret = c.env.UNSUBSCRIBE_HMAC_SECRET;

  if (!secret) {
    return c.html(unsubscribePage({
      state: 'error',
      message: 'Unsubscribe service temporarily unavailable.',
    }), 503);
  }

  if (!token) {
    return c.html(unsubscribePage({
      state: 'error',
      message: 'Missing unsubscribe token. Please use the link from your notification email.',
    }), 400);
  }

  // Inline HMAC-SHA256 token verification (mirrors @webwaka/notifications/unsubscribe.ts)
  // Token format: base64url(JSON payload) + '.' + base64url(HMAC signature)
  let payload: { uid: string; tid: string; ch: string; iat: number } | null = null;
  let expiredToken = false;

  try {
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) throw new Error('malformed token');

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
    );

    function decodeBase64url(b64: string): Uint8Array {
      const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
      const pad = (4 - (padded.length % 4)) % 4;
      const raw = atob(padded + '='.repeat(pad));
      return new Uint8Array(Array.from(raw, (ch) => ch.charCodeAt(0)));
    }

    const sigBytes = decodeBase64url(sigB64);
    const valid = await crypto.subtle.verify('HMAC', keyMaterial, sigBytes, enc.encode(payloadB64));
    if (!valid) throw new Error('invalid signature');

    const jsonStr = new TextDecoder().decode(decodeBase64url(payloadB64));
    const parsed = JSON.parse(jsonStr) as { uid: string; tid: string; ch: string; iat: number };

    // Check 7-day expiry (matching signUnsubscribeToken default TTL)
    const MAX_AGE_SECONDS = 7 * 24 * 3600;
    if (Date.now() / 1000 - parsed.iat > MAX_AGE_SECONDS) {
      expiredToken = true;
    } else {
      payload = parsed;
    }
  } catch {
    // fall through — payload remains null
  }

  if (!payload) {
    return c.html(unsubscribePage({
      state: 'error',
      message: expiredToken
        ? 'This unsubscribe link has expired. Please request a new one from your notification settings.'
        : 'Invalid unsubscribe link. Please check the link in your notification email or visit your notification settings.',
    }), 400);
  }

  const { uid: userId, tid: tenantId, ch: channel } = payload;
  const db = c.env.DB as unknown as {
    prepare(q: string): { bind(...a: unknown[]): { first<T>(): Promise<T | null>; run(): Promise<{ success: boolean }> } };
  };

  // Look up the address for the channel from the users table
  let address: string | null = null;
  try {
    const userRow = await db
      .prepare(`SELECT email, phone FROM users WHERE id = ? AND tenant_id = ? LIMIT 1`)
      .bind(userId, tenantId)
      .first<{ email: string | null; phone: string | null }>();

    if (channel === 'email') address = userRow?.email ?? null;
    else if (channel === 'sms' || channel === 'whatsapp') address = userRow?.phone ?? null;
  } catch (err) {
    console.error(`[tenant-public] unsubscribe address lookup error: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (address) {
    try {
      // Inline suppression write: SHA-256 hash of address (G23: raw address never stored)
      const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(address.toLowerCase().trim()));
      const hashHex = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
      const suppressId = `suppress_${crypto.randomUUID().replace(/-/g, '')}`;
      const now = Math.floor(Date.now() / 1000);
      await db
        .prepare(
          `INSERT OR IGNORE INTO notification_suppression
           (id, tenant_id, channel, address_hash, reason, created_at)
           VALUES (?, ?, ?, ?, 'unsubscribed', ?)`,
        )
        .bind(suppressId, tenantId, channel, hashHex, now)
        .run();
    } catch (err) {
      console.error(`[tenant-public] unsubscribe suppression error: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    console.warn(`[tenant-public] unsubscribe: no address found for userId=${userId} channel=${channel} — suppression skipped`);
  }

  const channelLabel = channel === 'email' ? 'email' : channel === 'sms' ? 'SMS' : channel;
  return c.html(unsubscribePage({
    state: 'success',
    message: `You've been successfully unsubscribed from ${channelLabel} notifications.`,
    userId,
    channel,
  }), 200);
});

// ---------------------------------------------------------------------------
// Helper: render unsubscribe HTML page (tenant-branded HTML, no JS framework)
// ---------------------------------------------------------------------------

interface UnsubscribePageOpts {
  state: 'success' | 'error';
  message: string;
  userId?: string;
  channel?: string;
}

function unsubscribePage(opts: UnsubscribePageOpts): string {
  const { state, message } = opts;

  const icon = state === 'success' ? '✓' : '✕';
  const iconColor = state === 'success' ? '#16a34a' : '#dc2626';
  const iconBg = state === 'success' ? '#f0fdf4' : '#fef2f2';
  const title = state === 'success' ? 'Unsubscribed successfully' : 'Unable to unsubscribe';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — WebWaka</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f9fafb;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: #111827;
    }
    .card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      padding: 40px 36px;
      max-width: 440px;
      width: 100%;
      text-align: center;
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: ${iconBg};
      color: ${iconColor};
      font-size: 28px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    h1 { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #111827; }
    p { font-size: 15px; color: #6b7280; line-height: 1.6; }
    .footer {
      margin-top: 28px;
      font-size: 12px;
      color: #9ca3af;
    }
    a { color: #0F4C81; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${state === 'success' ? `
    <p style="margin-top:12px;font-size:13px;color:#6b7280;">
      You can manage all your notification preferences in your
      <a href="/settings">account settings</a>.
    </p>` : ''}
    <div class="footer">
      Powered by <a href="https://webwaka.com">WebWaka</a> &middot;
      <a href="https://webwaka.com/privacy">Privacy policy</a>
    </div>
  </div>
</body>
</html>`;
}

export default app;
