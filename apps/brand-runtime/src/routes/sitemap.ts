/**
 * Sitemap and PWA manifest routes — Pillar 2 (P4-A HIGH-007)
 *
 * GET /sitemap.xml         → XML sitemap for this tenant's branded site
 * GET /manifest.webmanifest → Dynamic PWA manifest with tenant name/colours
 *
 * No auth required — public assets.
 * T3: tenant isolation via tenantResolve middleware.
 */

import { Hono } from 'hono';
import type { Env, Variables } from '../env.js';

export const sitemapRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------------------------------------------------------------------------
// GET /sitemap.xml — tenant-scoped sitemap
// ---------------------------------------------------------------------------

sitemapRouter.get('/sitemap.xml', async (c) => {
  const tenantId = c.get('tenantId');

  const host = c.req.header('Host') ?? 'localhost';
  const origin = `https://${host}`;
  const now = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/services', priority: '0.8', changefreq: 'weekly' },
    { url: '/shop', priority: '0.9', changefreq: 'daily' },
    { url: '/blog', priority: '0.7', changefreq: 'daily' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
  ];

  const staticEntries = staticPages.map((p) =>
    `  <url><loc>${origin}${p.url}</loc><lastmod>${now}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
  );

  const dynamicEntries: string[] = [];
  if (tenantId) {
    try {
      const offerings = await c.env.DB
        .prepare(`SELECT id, updated_at FROM offerings WHERE tenant_id = ? AND is_published = 1 ORDER BY updated_at DESC LIMIT 200`)
        .bind(tenantId)
        .all<{ id: string; updated_at: number }>();
      dynamicEntries.push(...(offerings.results ?? []).map((o) => {
        const lastmod = o.updated_at ? new Date(o.updated_at * 1000).toISOString().split('T')[0] : now;
        return `  <url><loc>${origin}/shop/${o.id}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
      }));
    } catch { /* graceful */ }

    try {
      const posts = await c.env.DB
        .prepare(`SELECT slug, published_at FROM blog_posts WHERE tenant_id = ? AND status = 'published' ORDER BY published_at DESC LIMIT 500`)
        .bind(tenantId)
        .all<{ slug: string; published_at: number }>();
      dynamicEntries.push(...(posts.results ?? []).map((p) => {
        const lastmod = p.published_at ? new Date(p.published_at * 1000).toISOString().split('T')[0] : now;
        return `  <url><loc>${origin}/blog/${p.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`;
      }));
    } catch { /* graceful */ }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...dynamicEntries].join('\n')}
</urlset>`;

  return c.text(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
  });
});

// ---------------------------------------------------------------------------
// GET /manifest.webmanifest — dynamic PWA manifest with tenant branding
// ---------------------------------------------------------------------------

sitemapRouter.get('/manifest.webmanifest', async (c) => {
  const tenantId = c.get('tenantId');

  let name = 'WebWaka Business';
  let shortName = 'WebWaka';
  let themeColor = '#1a6b3a';
  let logoUrl: string | null = null;

  if (tenantId) {
    try {
      const row = await c.env.DB
        .prepare(
          `SELECT o.name AS business_name, tb.primary_color, tb.logo_url
           FROM organizations o
           LEFT JOIN tenant_branding tb ON tb.tenant_id = o.id
           WHERE o.id = ?
           LIMIT 1`,
        )
        .bind(tenantId)
        .first<{ business_name: string; primary_color: string | null; logo_url: string | null }>();

      if (row) {
        name = row.business_name ?? name;
        shortName = name.split(' ').slice(0, 2).join(' ');
        themeColor = row.primary_color ?? themeColor;
        logoUrl = row.logo_url ?? null;
      }
    } catch { /* graceful */ }
  }

  const manifest = {
    name,
    short_name: shortName,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: themeColor,
    orientation: 'portrait',
    icons: logoUrl
      ? [{ src: logoUrl, sizes: '192x192 512x512', type: 'image/png', purpose: 'any maskable' }]
      : [{ src: '/favicon.ico', sizes: '64x64', type: 'image/x-icon' }],
    categories: ['business', 'productivity'],
  };

  return c.json(manifest, 200, {
    'Content-Type': 'application/manifest+json',
    'Cache-Control': 'public, max-age=3600',
  });
});
