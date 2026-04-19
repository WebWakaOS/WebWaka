/**
 * Branded public pages — home, about, services, contact.
 * (Pillar 2 — PV-1.1, Phase 3 P3IN1-001)
 *
 * GET /            → branded home
 * GET /about       → about page
 * GET /services    → full offerings catalog
 * GET /contact     → contact form (offline-capable via PWA-002)
 * POST /contact    → contact form submission
 * GET /:slug       → branded home by slug (fallback path pattern)
 *
 * No auth required — public pages.
 * T3: tenant isolation via tenantResolve middleware.
 * P9: prices as integer kobo, formatted at template layer.
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env, Variables } from '../env.js';
import { generateCssTokens } from '../lib/theme.js';
import type { TenantTheme } from '../lib/theme.js';
import { baseTemplate } from '../templates/base.js';
import { brandedHomeBody } from '../templates/branded-home.js';
import { aboutPageBody } from '../templates/about.js';
import { servicesPageBody } from '../templates/services.js';
import { contactPageBody } from '../templates/contact.js';

const router = new Hono<{ Bindings: Env; Variables: Variables }>();

type Offering = { name: string; description: string | null; price_kobo: number | null };
type ProfileRow = { description: string | null; phone: string | null; email: string | null; website: string | null; place_name: string | null; category: string | null };

async function resolveTheme(
  c: Context<{ Bindings: Env; Variables: Variables }>,
): Promise<{ cssVars: string; theme: TenantTheme } | null> {
  try {
    const result = await generateCssTokens(c.get('tenantSlug'), c.env);
    return result;
  } catch {
    return null;
  }
}

async function fetchOfferings(env: Env, tenantId: string, limit = 6): Promise<Offering[]> {
  try {
    const result = await env.DB
      .prepare(
        `SELECT name, description, price_kobo
         FROM offerings
         WHERE tenant_id = ? AND is_published = 1
         ORDER BY sort_order ASC, created_at DESC
         LIMIT ?`,
      )
      .bind(tenantId, limit)
      .all<Offering>();
    return result.results ?? [];
  } catch {
    return [];
  }
}

async function fetchProfile(env: Env, tenantId: string): Promise<ProfileRow | null> {
  try {
    return await env.DB
      .prepare(
        `SELECT o.description, ep.phone, ep.email, ep.website,
                gp.name AS place_name, o.category
         FROM organizations o
         LEFT JOIN entity_profiles ep ON ep.entity_id = o.id
         LEFT JOIN geography_places gp ON gp.id = o.place_id
         WHERE o.id = ?
         LIMIT 1`,
      )
      .bind(tenantId)
      .first<ProfileRow>();
  } catch {
    return null;
  }
}

const DEFAULT_OG_IMAGE = 'https://webwaka.com/og-default.png';

function seoHead(opts: { title: string; description: string; url: string; image?: string | null; type?: string }): string {
  const desc = opts.description.slice(0, 160);
  const ogImage = opts.image ?? DEFAULT_OG_IMAGE;
  return `
    <meta name="description" content="${esc(desc)}" />
    <meta property="og:title" content="${esc(opts.title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:type" content="${opts.type ?? 'website'}" />
    <meta property="og:image" content="${encodeURI(ogImage)}" />
    <link rel="canonical" href="${esc(opts.url)}" />`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

router.get('/', async (c) => {
  const resolved = await resolveTheme(c);
  if (!resolved) return c.text('Tenant not found', 404);
  const { cssVars, theme } = resolved;

  const offerings = await fetchOfferings(c.env, theme.tenantId);
  const profile = await fetchProfile(c.env, theme.tenantId);

  const body = brandedHomeBody({
    displayName: theme.displayName,
    tagline: null,
    description: profile?.description ?? null,
    primaryColor: theme.primaryColor,
    logoUrl: theme.logoUrl,
    ctaLabel: 'View Our Services',
    ctaUrl: '/services',
    offerings: offerings.map((o) => ({
      name: o.name,
      description: o.description,
      priceKobo: o.price_kobo,
    })),
  });

  const headExtra = seoHead({
    title: theme.displayName,
    description: profile?.description ?? `${theme.displayName} — Powered by WebWaka`,
    url: '/',
    image: theme.logoUrl,
    type: 'business.business',
  });

  return c.html(baseTemplate({ title: 'Welcome', cssVars, logoUrl: theme.logoUrl, displayName: theme.displayName, faviconUrl: theme.faviconUrl, body, headExtra }));
});

router.get('/about', async (c) => {
  const resolved = await resolveTheme(c);
  if (!resolved) return c.text('Tenant not found', 404);
  const { cssVars, theme } = resolved;

  const profile = await fetchProfile(c.env, theme.tenantId);

  const body = aboutPageBody({
    displayName: theme.displayName,
    description: profile?.description ?? null,
    logoUrl: theme.logoUrl,
    primaryColor: theme.primaryColor,
    category: profile?.category ?? null,
    placeName: profile?.place_name ?? null,
    phone: profile?.phone ?? null,
    website: profile?.website ?? null,
  });

  const headExtra = seoHead({
    title: `About ${theme.displayName}`,
    description: profile?.description ?? `Learn more about ${theme.displayName}`,
    url: '/about',
    image: theme.logoUrl,
  });

  return c.html(baseTemplate({ title: 'About', cssVars, logoUrl: theme.logoUrl, displayName: theme.displayName, faviconUrl: theme.faviconUrl, body, headExtra }));
});

router.get('/services', async (c) => {
  const resolved = await resolveTheme(c);
  if (!resolved) return c.text('Tenant not found', 404);
  const { cssVars, theme } = resolved;

  const offerings = await fetchOfferings(c.env, theme.tenantId, 50);

  const body = servicesPageBody({
    displayName: theme.displayName,
    offerings: offerings.map((o) => ({
      name: o.name,
      description: o.description,
      priceKobo: o.price_kobo,
    })),
  });

  const headExtra = seoHead({
    title: `Services — ${theme.displayName}`,
    description: `Browse services and products from ${theme.displayName}`,
    url: '/services',
    image: theme.logoUrl,
  });

  return c.html(baseTemplate({ title: 'Services', cssVars, logoUrl: theme.logoUrl, displayName: theme.displayName, faviconUrl: theme.faviconUrl, body, headExtra }));
});

router.get('/contact', async (c) => {
  const resolved = await resolveTheme(c);
  if (!resolved) return c.text('Tenant not found', 404);
  const { cssVars, theme } = resolved;

  const profile = await fetchProfile(c.env, theme.tenantId);

  const body = contactPageBody({
    displayName: theme.displayName,
    phone: profile?.phone ?? null,
    email: profile?.email ?? null,
    placeName: profile?.place_name ?? null,
    tenantId: theme.tenantId,
  });

  const headExtra = seoHead({
    title: `Contact — ${theme.displayName}`,
    description: `Get in touch with ${theme.displayName}`,
    url: '/contact',
  });

  return c.html(baseTemplate({ title: 'Contact', cssVars, logoUrl: theme.logoUrl, displayName: theme.displayName, faviconUrl: theme.faviconUrl, body, headExtra }));
});

router.post('/contact', async (c) => {
  const tenantId = c.get('tenantId');

  if (!tenantId) return c.json({ error: 'Tenant not found' }, 404);

  const contentType = c.req.header('content-type') ?? '';
  let name = '';
  let phone = '';
  let email = '';
  let message = '';

  if (contentType.includes('application/json')) {
    const body = await c.req.json<{ name?: string; phone?: string; email?: string; message?: string }>();
    name = body.name ?? '';
    phone = body.phone ?? '';
    email = body.email ?? '';
    message = body.message ?? '';
  } else {
    const form = await c.req.formData();
    name = (form.get('name') as string) ?? '';
    phone = (form.get('phone') as string) ?? '';
    email = (form.get('email') as string) ?? '';
    message = (form.get('message') as string) ?? '';
  }

  if (!name || !phone || !message) {
    return c.json({ error: 'Name, phone, and message are required' }, 400);
  }

  try {
    await c.env.DB
      .prepare(
        `INSERT INTO contact_submissions (id, tenant_id, name, phone, email, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
      .bind(
        `cs_${crypto.randomUUID().replace(/-/g, '')}`,
        tenantId,
        name,
        phone,
        email || null,
        message,
      )
      .run();
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('no such table')) {
      console.warn('[contact] contact_submissions table not yet created — submission not persisted');
    } else {
      console.error('[contact] DB write error:', msg);
      if (contentType.includes('application/json')) {
        return c.json({ error: 'Failed to save message' }, 500);
      }
      return c.redirect('/contact?error=1');
    }
  }

  if (contentType.includes('application/json')) {
    return c.json({ ok: true });
  }
  return c.redirect('/contact?sent=1');
});

router.get('/:slug', async (c) => {
  const resolved = await resolveTheme(c);
  if (!resolved) return c.text('Tenant not found', 404);
  const { cssVars, theme } = resolved;

  const offerings = await fetchOfferings(c.env, theme.tenantId);

  const body = brandedHomeBody({
    displayName: theme.displayName,
    tagline: null,
    description: null,
    primaryColor: theme.primaryColor,
    logoUrl: theme.logoUrl,
    ctaLabel: 'View Our Services',
    ctaUrl: '/services',
    offerings: offerings.map((o) => ({
      name: o.name,
      description: o.description,
      priceKobo: o.price_kobo,
    })),
  });

  return c.html(baseTemplate({ title: 'Welcome', cssVars, logoUrl: theme.logoUrl, displayName: theme.displayName, faviconUrl: theme.faviconUrl, body }));
});

export { router as brandedPageRouter };
