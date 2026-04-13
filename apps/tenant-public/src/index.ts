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

  let sql = `SELECT p.id, p.entity_id, p.entity_type, p.display_name, p.headline,
                    p.avatar_url, p.place_id, p.visibility, p.claim_status, p.content,
                    datetime(p.created_at,'unixepoch') AS created_at
             FROM profiles p
             WHERE p.workspace_id = ? AND p.visibility IN ('public','semi')`;
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

  const row = await db
    .prepare(
      `SELECT p.id, p.entity_id, p.entity_type, p.display_name, p.headline,
              p.avatar_url, p.place_id, p.visibility, p.claim_status, p.content,
              datetime(p.created_at,'unixepoch') AS created_at
       FROM profiles p
       WHERE p.id = ? AND p.workspace_id = ? AND p.visibility != 'private'`,
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

export default app;
