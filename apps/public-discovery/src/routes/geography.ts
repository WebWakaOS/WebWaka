/**
 * Geography-aware SEO URLs — Pillar 3 (P4-B HIGH-008)
 *
 * Human-readable, SEO-optimised URL patterns for discovery:
 *
 *   GET /discover/:stateSlug                      → all businesses in a state
 *   GET /discover/:stateSlug/:sectorSlug          → businesses in state + sector
 *   GET /discover/:stateSlug/:lgaSlug/:sectorSlug → businesses in state + LGA + sector
 *
 * Examples:
 *   /discover/lagos                 → all Lagos businesses
 *   /discover/lagos/restaurant      → Lagos restaurants
 *   /discover/lagos/ikeja/salon     → Ikeja salons in Lagos
 *
 * Slug resolution:
 *   Slugs are lowercased + hyphenated versions of place/sector names.
 *   We LOWER(REPLACE(name,' ','-')) to compare — no separate slug column required.
 *
 * SEO output:
 *   - Schema.org ItemList JSON-LD on every page
 *   - Canonical URLs point to the slug form (not placeId)
 *   - Breadcrumb JSON-LD with path context
 *
 * No auth required — public.
 * T3: no tenant isolation — cross-tenant marketplace.
 * P9: prices in integer kobo, formatted at render time.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { baseTemplate } from '../templates/base.js';
import { detectLocale, createI18n } from '@webwaka/i18n';

export const geographyRouter = new Hono<{ Bindings: Env }>();

const DISCOVER_BASE = 'https://discover.webwaka.ng';

type OrgRow = { id: string; name: string; category: string | null; place_name: string | null };
type PlaceRow = { id: string; name: string; geography_type: string };

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Convert a display name to a URL slug */
function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** Build a breadcrumb Schema.org node */
function breadcrumb(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${DISCOVER_BASE}${item.url}`,
    })),
  };
}

/** Resolve a place by slug and optional parent (for LGA under a state) */
async function resolvePlaceBySlug(
  env: Env,
  slug: string,
  geoType?: 'state' | 'lga' | 'ward',
): Promise<PlaceRow | null> {
  try {
    const typeClause = geoType ? `AND geography_type = '${geoType}'` : '';
    return await env.DB
      .prepare(
        `SELECT id, name, geography_type
         FROM geography_places
         WHERE LOWER(REPLACE(name,' ','-')) = ? ${typeClause}
         LIMIT 1`,
      )
      .bind(slug)
      .first<PlaceRow>();
  } catch {
    return null;
  }
}

/** Fetch organisations filtered by geography path and optional category */
async function fetchOrgs(
  env: Env,
  placeId: string,
  sector?: string,
  limit = 50,
): Promise<OrgRow[]> {
  try {
    const sectorClause = sector ? `AND LOWER(o.category) = LOWER(?)` : '';
    const bindings: unknown[] = [placeId];
    if (sector) bindings.push(sector);
    bindings.push(limit);

    const result = await env.DB
      .prepare(
        `SELECT o.id, o.name, o.category, gp.name AS place_name
         FROM organizations o
         LEFT JOIN geography_places gp ON gp.id = o.place_id
         WHERE gp.path LIKE (
           SELECT path || '%' FROM geography_places WHERE id = ?
         )
         AND o.is_published = 1
         ${sectorClause}
         ORDER BY o.name ASC
         LIMIT ?`,
      )
      .bind(...bindings)
      .all<OrgRow>();
    return result.results ?? [];
  } catch {
    return [];
  }
}

/** Render listing cards */
function renderCards(orgs: OrgRow[]): string {
  if (orgs.length === 0) {
    return '<p style="color:var(--ww-text-muted)">No businesses found. <a href="/discover">Browse all</a></p>';
  }
  return `<div class="ww-grid">${orgs.map((r) => `
    <a class="ww-card" href="/discover/profile/organization/${esc(r.id)}" style="display:block;text-decoration:none;color:inherit">
      <span class="ww-badge">${esc(r.category ?? 'Business')}</span>
      <h3>${esc(r.name)}</h3>
      <p>${esc(r.place_name ?? 'Nigeria')}</p>
    </a>`).join('')}</div>`;
}

// ---------------------------------------------------------------------------
// GET /discover/:stateSlug — all businesses in a state
// ---------------------------------------------------------------------------

geographyRouter.get('/:stateSlug', async (c) => {
  const locale = detectLocale(c.req.raw);
  const t = createI18n(locale);
  const { stateSlug } = c.req.param();

  const place = await resolvePlaceBySlug(c.env, stateSlug, 'state');
  if (!place) {
    return c.html(
      baseTemplate({
        title: 'Location Not Found',
        body: `<p style="color:var(--ww-text-muted)">Location "${esc(stateSlug)}" not found. <a href="/discover">Browse all</a></p>`,
        locale,
        searchLabel: t('action_search'),
        footerTagline: t('footer_tagline'),
      }),
      404,
    );
  }

  const orgs = await fetchOrgs(c.env, place.id);
  const placeName = place.name;
  const canonicalUrl = `${DISCOVER_BASE}/discover/${stateSlug}`;

  const headExtra = `
    <meta name="description" content="Discover businesses in ${esc(placeName)}, Nigeria. Browse verified listings on WebWaka." />
    <meta property="og:title" content="Businesses in ${esc(placeName)} — WebWaka Discover" />
    <meta property="og:description" content="Find verified businesses in ${esc(placeName)}, Nigeria" />
    <link rel="canonical" href="${canonicalUrl}" />`;

  const body = `
    <a href="/discover" style="font-size:.875rem;color:var(--ww-text-muted)">&larr; All locations</a>
    <h1 style="font-size:1.5rem;font-weight:800;margin:1rem 0">Businesses in ${esc(placeName)}</h1>
    <p style="color:var(--ww-text-muted);margin-bottom:1.5rem">${orgs.length} listing${orgs.length !== 1 ? 's' : ''}</p>
    ${renderCards(orgs)}`;

  const structuredData: object = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        { name: 'Discover', url: '/discover' },
        { name: placeName, url: `/discover/${stateSlug}` },
      ]),
      {
        '@type': 'ItemList',
        name: `Businesses in ${placeName}`,
        description: `Verified businesses in ${placeName}, Nigeria`,
        url: canonicalUrl,
        numberOfItems: orgs.length,
        itemListElement: orgs.map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'LocalBusiness',
            name: r.name,
            '@id': `${DISCOVER_BASE}/discover/profile/organization/${r.id}`,
            url: `${DISCOVER_BASE}/discover/profile/organization/${r.id}`,
            address: { '@type': 'PostalAddress', addressLocality: r.place_name ?? placeName, addressCountry: 'NG' },
          },
        })),
      },
    ],
  };

  return c.html(baseTemplate({
    title: `Businesses in ${placeName}`,
    body,
    headExtra,
    structuredData,
    locale,
    searchLabel: t('action_search'),
    footerTagline: t('footer_tagline'),
  }));
});

// ---------------------------------------------------------------------------
// GET /discover/:stateSlug/:sectorOrLgaSlug — state+sector OR state+LGA
// (disambiguate: if second segment is a known place → LGA directory;
//  otherwise treat as sector/category)
// ---------------------------------------------------------------------------

geographyRouter.get('/:stateSlug/:sectorOrLgaSlug', async (c) => {
  const locale = detectLocale(c.req.raw);
  const t = createI18n(locale);
  const { stateSlug, sectorOrLgaSlug } = c.req.param();

  const statPlace = await resolvePlaceBySlug(c.env, stateSlug, 'state');
  if (!statPlace) {
    return c.redirect('/discover', 302);
  }

  const lgaPlace = await resolvePlaceBySlug(c.env, sectorOrLgaSlug, 'lga');
  const isLga = lgaPlace !== null;

  let orgs: OrgRow[];
  let title: string;
  let description: string;
  let canonicalUrl: string;
  let breadcrumbItems: Array<{ name: string; url: string }>;

  if (isLga) {
    orgs = await fetchOrgs(c.env, lgaPlace.id);
    title = `Businesses in ${lgaPlace.name}, ${statPlace.name}`;
    description = `Verified businesses in ${lgaPlace.name}, ${statPlace.name}, Nigeria`;
    canonicalUrl = `${DISCOVER_BASE}/discover/${stateSlug}/${sectorOrLgaSlug}`;
    breadcrumbItems = [
      { name: 'Discover', url: '/discover' },
      { name: statPlace.name, url: `/discover/${stateSlug}` },
      { name: lgaPlace.name, url: `/discover/${stateSlug}/${sectorOrLgaSlug}` },
    ];
  } else {
    const sectorDisplay = sectorOrLgaSlug.replace(/-/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
    orgs = await fetchOrgs(c.env, statPlace.id, sectorOrLgaSlug);
    title = `${sectorDisplay} in ${statPlace.name}`;
    description = `Find verified ${sectorDisplay} businesses in ${statPlace.name}, Nigeria`;
    canonicalUrl = `${DISCOVER_BASE}/discover/${stateSlug}/${sectorOrLgaSlug}`;
    breadcrumbItems = [
      { name: 'Discover', url: '/discover' },
      { name: statPlace.name, url: `/discover/${stateSlug}` },
      { name: sectorDisplay, url: `/discover/${stateSlug}/${sectorOrLgaSlug}` },
    ];
  }

  const headExtra = `
    <meta name="description" content="${esc(description)}" />
    <meta property="og:title" content="${esc(title)} — WebWaka Discover" />
    <meta property="og:description" content="${esc(description)}" />
    <link rel="canonical" href="${canonicalUrl}" />`;

  const parentSlug = isLga ? stateSlug : `../discover`;
  const backHref = isLga ? `/discover/${stateSlug}` : `/discover/${stateSlug}`;

  const body = `
    <a href="${backHref}" style="font-size:.875rem;color:var(--ww-text-muted)">&larr; ${esc(statPlace.name)}</a>
    <h1 style="font-size:1.5rem;font-weight:800;margin:1rem 0">${esc(title)}</h1>
    <p style="color:var(--ww-text-muted);margin-bottom:1.5rem">${orgs.length} listing${orgs.length !== 1 ? 's' : ''}</p>
    ${renderCards(orgs)}`;

  const structuredData: object = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb(breadcrumbItems),
      {
        '@type': 'ItemList',
        name: title,
        description,
        url: canonicalUrl,
        numberOfItems: orgs.length,
        itemListElement: orgs.map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'LocalBusiness',
            name: r.name,
            '@id': `${DISCOVER_BASE}/discover/profile/organization/${r.id}`,
            url: `${DISCOVER_BASE}/discover/profile/organization/${r.id}`,
            address: { '@type': 'PostalAddress', addressLocality: r.place_name ?? 'Nigeria', addressCountry: 'NG' },
          },
        })),
      },
    ],
  };

  return c.html(baseTemplate({
    title,
    body,
    headExtra,
    structuredData,
    locale,
    searchLabel: t('action_search'),
    footerTagline: t('footer_tagline'),
  }));

  void parentSlug;
});

// ---------------------------------------------------------------------------
// GET /discover/:stateSlug/:lgaSlug/:sectorSlug — state + LGA + sector
// ---------------------------------------------------------------------------

geographyRouter.get('/:stateSlug/:lgaSlug/:sectorSlug', async (c) => {
  const locale = detectLocale(c.req.raw);
  const t = createI18n(locale);
  const { stateSlug, lgaSlug, sectorSlug } = c.req.param();

  const statPlace = await resolvePlaceBySlug(c.env, stateSlug, 'state');
  const lgaPlace = await resolvePlaceBySlug(c.env, lgaSlug, 'lga');

  if (!statPlace || !lgaPlace) {
    return c.redirect('/discover', 302);
  }

  const sectorDisplay = sectorSlug.replace(/-/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
  const orgs = await fetchOrgs(c.env, lgaPlace.id, sectorSlug);
  const title = `${sectorDisplay} in ${lgaPlace.name}, ${statPlace.name}`;
  const description = `Find verified ${sectorDisplay} businesses in ${lgaPlace.name}, ${statPlace.name}, Nigeria`;
  const canonicalUrl = `${DISCOVER_BASE}/discover/${stateSlug}/${lgaSlug}/${sectorSlug}`;

  const headExtra = `
    <meta name="description" content="${esc(description)}" />
    <meta property="og:title" content="${esc(title)} — WebWaka Discover" />
    <meta property="og:description" content="${esc(description)}" />
    <link rel="canonical" href="${canonicalUrl}" />`;

  const body = `
    <a href="/discover/${stateSlug}/${lgaSlug}" style="font-size:.875rem;color:var(--ww-text-muted)">&larr; ${esc(lgaPlace.name)}</a>
    <h1 style="font-size:1.5rem;font-weight:800;margin:1rem 0">${esc(title)}</h1>
    <p style="color:var(--ww-text-muted);margin-bottom:1.5rem">${orgs.length} listing${orgs.length !== 1 ? 's' : ''}</p>
    ${renderCards(orgs)}`;

  const structuredData: object = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        { name: 'Discover', url: '/discover' },
        { name: statPlace.name, url: `/discover/${stateSlug}` },
        { name: lgaPlace.name, url: `/discover/${stateSlug}/${lgaSlug}` },
        { name: sectorDisplay, url: `/discover/${stateSlug}/${lgaSlug}/${sectorSlug}` },
      ]),
      {
        '@type': 'ItemList',
        name: title,
        description,
        url: canonicalUrl,
        numberOfItems: orgs.length,
        itemListElement: orgs.map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'LocalBusiness',
            name: r.name,
            '@id': `${DISCOVER_BASE}/discover/profile/organization/${r.id}`,
            url: `${DISCOVER_BASE}/discover/profile/organization/${r.id}`,
            address: { '@type': 'PostalAddress', addressLocality: r.place_name ?? lgaPlace.name, addressCountry: 'NG' },
          },
        })),
      },
    ],
  };

  return c.html(baseTemplate({
    title,
    body,
    headExtra,
    structuredData,
    locale,
    searchLabel: t('action_search'),
    footerTagline: t('footer_tagline'),
  }));
});
