/**
 * Public profile pages.
 * (Pillar 3 — PV-1.2)
 *
 * GET /discover/profile/:entityType/:id → rendered public business profile
 *
 * No auth required.
 * Fires a discovery_event for view tracking (async, non-blocking).
 * T3: no global tenant filter here — profiles are cross-tenant public pages.
 * P9: prices in integer kobo, formatted as ₦ on render.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { baseTemplate } from '../templates/base.js';

const router = new Hono<{ Bindings: Env }>();

router.get('/:entityType/:id', async (c) => {
  const { entityType, id } = c.req.param();
  const cacheKey = `disc:profile:${entityType}:${id}`;

  if (entityType !== 'organization' && entityType !== 'individual') {
    return c.text('Invalid entity type', 400);
  }

  type ProfileRow = {
    id: string;
    name: string;
    category: string | null;
    description: string | null;
    place_name: string | null;
    place_id: string | null;
    logo_url: string | null;
    phone: string | null;
    website: string | null;
  };

  const cached = await c.env.DISCOVERY_CACHE.get(cacheKey, 'json') as ProfileRow | null;
  let profile: ProfileRow | null = cached;

  if (!profile) {
    const table = entityType === 'organization' ? 'organizations' : 'individuals';
    profile = await c.env.DB
      .prepare(
        `SELECT e.id, e.name, e.category, e.description,
                gp.name AS place_name, gp.id AS place_id,
                ep.logo_url, ep.phone, ep.website
         FROM ${table} e
         LEFT JOIN geography_places gp ON gp.id = e.place_id
         LEFT JOIN entity_profiles ep ON ep.entity_id = e.id
         WHERE e.id = ? AND e.is_published = 1
         LIMIT 1`,
      )
      .bind(id)
      .first<ProfileRow>();

    if (profile) {
      await c.env.DISCOVERY_CACHE.put(cacheKey, JSON.stringify(profile), { expirationTtl: 60 });
    }
  }

  if (!profile) {
    return c.html(
      baseTemplate({
        title: 'Not found',
        body: '<p style="color:var(--ww-text-muted);margin-top:2rem">This profile could not be found.</p>',
      }),
      404,
    );
  }

  // Fetch top 6 offerings (non-blocking fallback)
  const offeringsResult = await c.env.DB
    .prepare(
      `SELECT name, description, price_kobo
       FROM offerings
       WHERE tenant_id = ? AND is_published = 1
       ORDER BY sort_order ASC, created_at DESC
       LIMIT 6`,
    )
    .bind(profile.id)
    .all<{ name: string; description: string | null; price_kobo: number | null }>()
    .catch(() => ({ results: [] as { name: string; description: string | null; price_kobo: number | null }[] }));

  const offerings = offeringsResult.results ?? [];

  const offeringsHtml =
    offerings.length === 0
      ? ''
      : `
  <section style="margin-top:2.5rem">
    <h2 style="font-size:1.125rem;font-weight:700;margin-bottom:1rem">Offerings</h2>
    <div class="ww-grid">
      ${offerings
        .map(
          (o) => `
      <div class="ww-card">
        <h3>${esc(o.name)}</h3>
        ${o.description ? `<p>${esc(o.description)}</p>` : ''}
        ${
          o.price_kobo !== null
            ? `<p style="margin-top:.5rem;font-weight:700;color:var(--ww-primary)">₦${(o.price_kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>`
            : ''
        }
      </div>`,
        )
        .join('')}
    </div>
  </section>`;

  const tenantSlug = await c.env.DB
    .prepare(`SELECT slug FROM organizations WHERE id = ? LIMIT 1`)
    .bind(profile.id)
    .first<{ slug: string | null }>()
    .catch(() => null);

  const brandSiteUrl = tenantSlug?.slug ? `https://brand-${tenantSlug.slug}.webwaka.ng` : null;

  const claimCta = entityType === 'organization' ? `
    <div class="ww-cta-banner" style="margin-top:2rem">
      <h3>Is this your business?</h3>
      <p>Claim this listing to update your info, add offerings, and build your brand.</p>
      <a class="ww-cta-btn" href="https://webwaka.ng/claim/${esc(id)}">Claim This Business</a>
    </div>` : '';

  const body = `
    <a href="/discover" style="font-size:.875rem;color:var(--ww-text-muted)">&larr; Discover</a>
    <div style="margin-top:1.5rem;display:flex;gap:1.25rem;align-items:flex-start;flex-wrap:wrap">
      ${profile.logo_url ? `<img src="${encodeURI(profile.logo_url)}" alt="${esc(profile.name)} logo" style="width:80px;height:80px;object-fit:cover;border-radius:var(--ww-radius);border:1px solid var(--ww-border)" />` : ''}
      <div>
        ${profile.category ? `<span class="ww-badge">${esc(profile.category)}</span>` : ''}
        <h1 style="font-size:1.75rem;font-weight:800;line-height:1.2">${esc(profile.name)}</h1>
        ${profile.place_name ? `<p style="color:var(--ww-text-muted);margin-top:.375rem">${esc(profile.place_name)}</p>` : ''}
        ${profile.phone ? `<p style="margin-top:.375rem"><a href="tel:${esc(profile.phone)}">${esc(profile.phone)}</a></p>` : ''}
        ${profile.website ? `<p style="margin-top:.375rem"><a href="${safeHref(profile.website)}" target="_blank" rel="noopener">${esc(profile.website)}</a></p>` : ''}
        ${brandSiteUrl ? `<p style="margin-top:.5rem"><a href="${brandSiteUrl}" class="ww-cta-btn" style="font-size:.8125rem;padding:.375rem .875rem;min-height:auto">Visit Website &rarr;</a></p>` : ''}
      </div>
    </div>
    ${profile.description ? `<p style="margin-top:1.5rem;color:var(--ww-text-muted);line-height:1.7;max-width:44rem">${esc(profile.description)}</p>` : ''}
    ${offeringsHtml}
    ${claimCta}`;

  const description = profile.description ?? `${profile.name} on WebWaka`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: profile.name,
    description: description,
    ...(profile.logo_url ? { image: profile.logo_url } : {}),
    ...(profile.phone ? { telephone: profile.phone } : {}),
    ...(profile.website ? { url: profile.website } : {}),
    ...(profile.place_name ? { address: { '@type': 'PostalAddress', addressLocality: profile.place_name, addressCountry: 'NG' } } : {}),
  };

  return c.html(
    baseTemplate({
      title: profile.name,
      body,
      headExtra: `
        <meta name="description" content="${esc(description.slice(0, 160))}" />
        <meta property="og:title" content="${esc(profile.name)}" />
        <meta property="og:description" content="${esc(description)}" />
        <meta property="og:type" content="business.business" />
        ${profile.logo_url ? `<meta property="og:image" content="${encodeURI(profile.logo_url)}" />` : ''}
        <link rel="canonical" href="/discover/profile/${entityType}/${esc(id)}" />`,
      structuredData,
    }),
  );
});

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function safeHref(url: string): string {
  try {
    const parsed = new URL(url, 'https://placeholder.invalid');
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return encodeURI(url);
    }
  } catch { /* invalid URL */ }
  return '#';
}

export { router as profilesRouter };
