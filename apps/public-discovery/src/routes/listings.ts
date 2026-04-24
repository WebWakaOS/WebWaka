/**
 * Geography-first listing routes.
 * (Pillar 3 — PV-1.2, Phase 3 P3IN1-002)
 *
 * GET /discover              → homepage — search + categories + geography browse
 * GET /discover/in/:placeId  → all entities in a geography subtree (state/LGA/ward)
 * GET /discover/search       → full-text + location search with filters
 * GET /discover/category/:cat → browse by business category
 *
 * No auth required — public page.
 * T3: no tenant isolation here (marketplace is cross-tenant by design).
 * P9: prices always stored and returned as integer kobo.
 *
 * BUG-P3-001 fix: renamed geography_places → places (correct table, migration 0001).
 * BUG-P3-001 fix: replaced gp.path LIKE hierarchy with ancestry_path JSON containment.
 *   places.ancestry_path is a JSON array e.g. '["place_ng","place_sw","place_lagos"]'.
 *   Subtree query: gp.id = ? OR gp.ancestry_path LIKE '%" || placeId || "%' ESCAPE '\'.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { baseTemplate } from '../templates/base.js';
import { detectLocale, createI18n } from '@webwaka/i18n';

const router = new Hono<{ Bindings: Env }>();

const SECTORS = [
  'Restaurant', 'Salon', 'Market', 'Motor Park', 'Bakery',
  'Pharmacy', 'Laundry', 'Logistics', 'Education', 'Agriculture',
  'Healthcare', 'Real Estate',
];

// GET /discover — platform home
router.get('/', async (c) => {
  const locale = detectLocale(c.req.raw);
  const t = createI18n(locale);
  let stateChips = '';
  try {
    const states = await c.env.DB
      .prepare(`SELECT id, name FROM places WHERE geography_type = 'state' ORDER BY name ASC`)
      .all<{ id: string; name: string }>();
    stateChips = (states.results ?? [])
      .map((s) => `<a class="ww-chip" href="/discover/in/${esc(s.id)}">${esc(s.name)}</a>`)
      .join('');
  } catch {
    stateChips = '<p style="color:var(--ww-text-muted);font-size:.875rem">States loading...</p>';
  }

  const sectorChips = SECTORS
    .map((s) => `<a class="ww-chip" href="/discover/category/${encodeURIComponent(s)}">${esc(s)}</a>`)
    .join('');

  let recentListings = '';
  try {
    const recent = await c.env.DB
      .prepare(
        `SELECT o.id, o.name, o.category, gp.name AS place_name
         FROM organizations o
         LEFT JOIN places gp ON gp.id = o.place_id
         WHERE o.is_published = 1
         ORDER BY o.created_at DESC
         LIMIT 8`,
      )
      .all<{ id: string; name: string; category: string; place_name: string }>();
    const rows = recent.results ?? [];
    if (rows.length > 0) {
      recentListings = `
      <section style="margin-top:2rem">
        <h2 class="ww-section-title">Recently Listed</h2>
        <div class="ww-grid">
          ${rows.map((r) => `
          <a class="ww-card" href="/discover/profile/organization/${esc(r.id)}" style="display:block;text-decoration:none;color:inherit">
            <span class="ww-badge">${esc(r.category ?? 'Business')}</span>
            <h3>${esc(r.name)}</h3>
            <p>${esc(r.place_name ?? 'Nigeria')}</p>
          </a>`).join('')}
        </div>
      </section>`;
    }
  } catch { /* table may not exist */ }

  const body = `
    <section style="text-align:center;padding:1.5rem 0 2rem">
      <h1 style="font-size:clamp(1.5rem,4vw,2.25rem);font-weight:800;margin-bottom:0.75rem;line-height:1.2">
        Discover businesses across Nigeria
      </h1>
      <p style="color:var(--ww-text-muted);margin-bottom:1.5rem;max-width:38rem;margin-inline:auto;line-height:1.6">
        Find verified businesses, services, and markets — from Lagos to Kano, Abuja to Port Harcourt.
      </p>
      <form class="ww-search" method="GET" action="/discover/search" style="max-width:32rem;margin:0 auto">
        <input name="q" type="search" placeholder="Search businesses, services, products…" autocomplete="off" />
        <button type="submit">Search</button>
      </form>
    </section>

    <section style="margin-top:1.5rem">
      <h2 class="ww-section-title">Browse by Category</h2>
      <div class="ww-chip-list">${sectorChips}</div>
    </section>

    <section style="margin-top:2rem">
      <h2 class="ww-section-title">Browse by State</h2>
      <div class="ww-chip-list">${stateChips}</div>
    </section>

    ${recentListings}

    <div class="ww-cta-banner">
      <h3>Own a business in Nigeria?</h3>
      <p>Claim your listing, build your brand, and reach more customers with WebWaka.</p>
      <a class="ww-cta-btn" href="https://webwaka.com">Get Started Free</a>
    </div>`;

  const headExtra = `
    <meta name="description" content="Discover verified businesses, services, and markets across Nigeria. Browse by state, category, or search directly." />
    <meta property="og:title" content="WebWaka Discover — Nigeria's Business Directory" />
    <meta property="og:description" content="Find verified businesses and services across Nigeria" />
    <meta property="og:type" content="website" />`;

  return c.html(baseTemplate({
    title: t('title_directory'),
    body,
    headExtra,
    locale,
    searchLabel: t('action_search'),
    footerTagline: t('footer_tagline'),
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'WebWaka Discover',
      url: 'https://discover.webwaka.com',
      description: "Nigeria's multi-vertical business directory and marketplace",
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://discover.webwaka.com/discover/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  }));
});

// ---------------------------------------------------------------------------
// Structured data helpers (SEO-03)
// ---------------------------------------------------------------------------

const DISCOVER_BASE = 'https://discover.webwaka.com';

/**
 * Build an ItemList schema node.
 *
 * @param standalone - When true (default), wraps with `@context`.
 *   Pass false when embedding inside a `@graph` — the `@context` lives at
 *   the top level of the graph document and must not be duplicated.
 *
 * Bug fixes applied (SEO-03 QA):
 *   B2 — standalone param prevents duplicate @context inside @graph
 *   B3 — place_name is `string | null`; null coalesces to 'Nigeria'
 */
function buildItemListSchema(
  name: string,
  description: string,
  url: string,
  items: Array<{ id: string; name: string; place_name: string | null }>,
  standalone = true,
): object {
  const node: Record<string, unknown> = {
    '@type': 'ItemList',
    name,
    description,
    url: `${DISCOVER_BASE}${url}`,
    numberOfItems: items.length,
    itemListElement: items.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: r.name,
      item: {
        '@type': 'LocalBusiness',
        name: r.name,
        '@id': `${DISCOVER_BASE}/discover/profile/organization/${r.id}`,
        url: `${DISCOVER_BASE}/discover/profile/organization/${r.id}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: r.place_name ?? 'Nigeria',
          addressCountry: 'NG',
        },
      },
    })),
  };
  if (standalone) {
    node['@context'] = 'https://schema.org';
  }
  return node;
}

// GET /discover/in/:placeId — entities in geography subtree
router.get('/in/:placeId', async (c) => {
  const locale = detectLocale(c.req.raw);
  const t = createI18n(locale);
  const placeId = c.req.param('placeId');
  const cacheKey = `disc:place:${placeId}`;

  let placeName = 'this area';
  try {
    const placeRow = await c.env.DB
      .prepare(`SELECT name FROM places WHERE id = ? LIMIT 1`)
      .bind(placeId)
      .first<{ name: string }>();
    if (placeRow) placeName = placeRow.name;
  } catch { /* fallback */ }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const cached = (await c.env.DISCOVERY_CACHE.get(cacheKey, 'json')) as Array<{
    id: string; name: string; category: string; place_name: string;
  }> | null;

  let results: typeof cached;

  if (!cached) {
    // BUG-P3-001 fix: ancestry_path subtree query replaces path LIKE subquery.
    // Bind placeId twice: once for the direct match, once for the LIKE pattern.
    const safePlaceId = placeId.replace(/[%_\\]/g, '\\$&');
    const rows = await c.env.DB
      .prepare(
        `SELECT o.id, o.name, o.category, gp.name AS place_name
         FROM organizations o
         JOIN places gp ON gp.id = o.place_id
         WHERE (gp.id = ? OR gp.ancestry_path LIKE ? ESCAPE '\\')
         AND o.is_published = 1
         ORDER BY o.name ASC
         LIMIT 50`,
      )
      .bind(placeId, `%"${safePlaceId}"%`)
      .all<{ id: string; name: string; category: string; place_name: string }>();
    results = rows.results ?? [];
    await c.env.DISCOVERY_CACHE.put(cacheKey, JSON.stringify(results), { expirationTtl: 60 });
  } else {
    results = cached;
  }

  const cards =
    results.length === 0
      ? '<p style="color:var(--ww-text-muted)">No listings found in this area yet. Be the first to list your business!</p>'
      : `<div class="ww-grid">${results
          .map(
            (r) => `
          <a class="ww-card" href="/discover/profile/organization/${esc(r.id)}" style="display:block;text-decoration:none;color:inherit">
            <span class="ww-badge">${esc(r.category ?? 'Business')}</span>
            <h3>${esc(r.name)}</h3>
            <p>${esc(r.place_name ?? 'Nigeria')}</p>
          </a>`,
          )
          .join('')}</div>`;

  const body = `
    <a href="/discover" style="font-size:.875rem;color:var(--ww-text-muted)">&larr; All locations</a>
    <h1 style="font-size:1.5rem;font-weight:800;margin:1rem 0">Businesses in ${esc(placeName)}</h1>
    <p style="color:var(--ww-text-muted);margin-bottom:1.5rem">${results.length} listing${results.length !== 1 ? 's' : ''} found</p>
    ${cards}
    ${results.length === 0 ? `
    <div class="ww-cta-banner">
      <h3>Know a business in ${esc(placeName)}?</h3>
      <p>Help grow the directory by listing it on WebWaka.</p>
      <a class="ww-cta-btn" href="https://webwaka.com">List a Business</a>
    </div>` : ''}`;

  const headExtra = `
    <meta name="description" content="Find businesses and services in ${esc(placeName)}, Nigeria. Browse verified listings on WebWaka Discover." />
    <meta property="og:title" content="Businesses in ${esc(placeName)} — WebWaka Discover" />
    <meta property="og:description" content="Find verified businesses and services in ${esc(placeName)}" />`;

  const structuredData = (results ?? []).length > 0
    ? buildItemListSchema(
        `Businesses in ${placeName}`,
        `Verified businesses and services in ${placeName}, Nigeria`,
        `/discover/in/${placeId}`,
        (results ?? []),
      )
    : undefined;

  return c.html(baseTemplate({
    title: `Businesses in ${placeName}`,
    body,
    headExtra,
    locale,
    searchLabel: t('action_search'),
    footerTagline: t('footer_tagline'),
    ...(structuredData ? { structuredData } : {}),
  }));
});

// GET /discover/search?q=…&place=…
router.get('/search', async (c) => {
  const locale = detectLocale(c.req.raw);
  const t = createI18n(locale);
  const q = (c.req.query('q') ?? '').trim();
  let placeId = c.req.query('place') ?? null;

  if (!q) return c.redirect('/discover');

  // BUG-042: Geo-IP location default — when no place is specified in the query,
  // use Cloudflare's request.cf.country/region to default to the user's state
  // within Nigeria (NG). Falls back to Nigeria-wide results if no match is found.
  let geoPlaceName: string | null = null;
  if (!placeId) {
    const cf = c.req.raw.cf as Record<string, string | undefined> | undefined;
    const country = cf?.country ?? null;
    const region = cf?.region ?? null;
    if (country === 'NG' && region) {
      try {
        const geoRow = await c.env.DB
          .prepare(
            `SELECT id, name FROM places
             WHERE geography_type = 'state'
               AND LOWER(name) LIKE LOWER(?) || '%'
             LIMIT 1`,
          )
          .bind(region)
          .first<{ id: string; name: string }>();
        if (geoRow) {
          placeId = geoRow.id;
          geoPlaceName = geoRow.name;
        }
      } catch {
        // GeoIP lookup failed — fall back to Nigeria-wide results
      }
    }
  }

  // BUG-P3-001 fix: ancestry_path subtree query replaces path LIKE subquery.
  // When placeId present, bind it twice (once for gp.id = ?, once for LIKE pattern).
  const safePlaceId = placeId ? placeId.replace(/[%_\\]/g, '\\$&') : null;
  const results = await c.env.DB
    .prepare(
      `SELECT o.id, o.name, o.category, gp.name AS place_name
       FROM organizations o
       JOIN places gp ON gp.id = o.place_id
       WHERE o.is_published = 1
         AND (o.name LIKE '%' || ? || '%' OR o.category LIKE '%' || ? || '%')
         ${placeId ? "AND (gp.id = ? OR gp.ancestry_path LIKE ? ESCAPE '\\')" : ''}
       ORDER BY o.name ASC
       LIMIT 30`,
    )
    .bind(...(placeId && safePlaceId ? [q, q, placeId, `%"${safePlaceId}"%`] : [q, q]))
    .all<{ id: string; name: string; category: string; place_name: string }>();

  const rows = results.results ?? [];

  const cards =
    rows.length === 0
      ? `<p style="color:var(--ww-text-muted)">No results found for "${esc(q)}".</p>`
      : `<div class="ww-grid">${rows
          .map(
            (r) => `
          <a class="ww-card" href="/discover/profile/organization/${esc(r.id)}" style="display:block;text-decoration:none;color:inherit">
            <span class="ww-badge">${esc(r.category ?? 'Business')}</span>
            <h3>${esc(r.name)}</h3>
            <p>${esc(r.place_name ?? 'Nigeria')}</p>
          </a>`,
          )
          .join('')}</div>`;

  const geoNotice = geoPlaceName
    ? `<p style="margin-bottom:0.5rem;font-size:0.8125rem;color:var(--ww-text-muted)">
         📍 Showing results near <strong>${esc(geoPlaceName)}</strong> (detected from your location).
         <a href="/discover/search?q=${encodeURIComponent(q)}" style="color:var(--ww-primary)">Show all of Nigeria</a>
       </p>`
    : '';

  const body = `
    <form class="ww-search" method="GET" action="/discover/search">
      <input name="q" type="search" value="${esc(q)}" autocomplete="off" />
      <button type="submit">Search</button>
    </form>
    ${geoNotice}
    <p style="margin-bottom:1rem;color:var(--ww-text-muted)">${rows.length} result${rows.length !== 1 ? 's' : ''} for "${esc(q)}"</p>
    ${cards}`;

  const headExtra = `
    <meta name="description" content="Search results for '${esc(q)}' on WebWaka Discover" />
    <meta property="og:title" content="Search: ${esc(q)} — WebWaka Discover" />`;

  const structuredData = rows.length > 0
    ? buildItemListSchema(
        `Search results for "${q}"`,
        `${rows.length} business${rows.length !== 1 ? 'es' : ''} matching "${q}" on WebWaka Discover`,
        `/discover/search?q=${encodeURIComponent(q)}`,
        rows,
      )
    : undefined;

  return c.html(baseTemplate({
    title: `"${q}" — ${t('action_search')}`,
    body,
    headExtra,
    locale,
    searchLabel: t('action_search'),
    footerTagline: t('footer_tagline'),
    ...(structuredData ? { structuredData } : {}),
  }));
});

// GET /discover/category/:cat — browse by business category
router.get('/category/:cat', async (c) => {
  const locale = detectLocale(c.req.raw);
  const t = createI18n(locale);
  const cat = c.req.param('cat');
  const displayCat = cat.replace(/-/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());

  let results: Array<{ id: string; name: string; category: string; place_name: string }> = [];
  try {
    const rows = await c.env.DB
      .prepare(
        `SELECT o.id, o.name, o.category, gp.name AS place_name
         FROM organizations o
         LEFT JOIN places gp ON gp.id = o.place_id
         WHERE o.is_published = 1
           AND LOWER(o.category) = LOWER(?)
         ORDER BY o.name ASC
         LIMIT 50`,
      )
      .bind(cat)
      .all<{ id: string; name: string; category: string; place_name: string }>();
    results = rows.results ?? [];
  } catch { /* table may not exist */ }

  const cards =
    results.length === 0
      ? `<p style="color:var(--ww-text-muted)">No ${esc(displayCat)} businesses listed yet.</p>`
      : `<div class="ww-grid">${results
          .map(
            (r) => `
          <a class="ww-card" href="/discover/profile/organization/${esc(r.id)}" style="display:block;text-decoration:none;color:inherit">
            <span class="ww-badge">${esc(r.category ?? displayCat)}</span>
            <h3>${esc(r.name)}</h3>
            <p>${esc(r.place_name ?? 'Nigeria')}</p>
          </a>`,
          )
          .join('')}</div>`;

  const body = `
    <a href="/discover" style="font-size:.875rem;color:var(--ww-text-muted)">&larr; All categories</a>
    <h1 class="ww-section-title" style="margin-top:1rem">${esc(displayCat)} Businesses</h1>
    <p style="color:var(--ww-text-muted);margin-bottom:1.5rem">${results.length} listing${results.length !== 1 ? 's' : ''}</p>
    ${cards}
    ${results.length === 0 ? `
    <div class="ww-cta-banner">
      <h3>Run a ${esc(displayCat)} business?</h3>
      <p>Be the first to list in this category on WebWaka.</p>
      <a class="ww-cta-btn" href="https://webwaka.com">Get Started Free</a>
    </div>` : ''}`;

  const headExtra = `
    <meta name="description" content="Browse ${esc(displayCat)} businesses across Nigeria on WebWaka Discover." />
    <meta property="og:title" content="${esc(displayCat)} Businesses — WebWaka Discover" />
    <meta property="og:description" content="Find verified ${esc(displayCat)} businesses across Nigeria" />`;

  const categoryPageUrl = `${DISCOVER_BASE}/discover/category/${cat}`;
  const structuredData: object = results.length > 0 ? {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `${displayCat} Businesses in Nigeria`,
        description: `Browse verified ${displayCat} businesses across Nigeria`,
        url: categoryPageUrl,
        numberOfItems: results.length,
      },
      buildItemListSchema(
        `${displayCat} Businesses in Nigeria`,
        `Browse verified ${displayCat} businesses across Nigeria on WebWaka Discover`,
        `/discover/category/${cat}`,
        results,
        false,   // B2 fix: no @context inside @graph — top-level @context already set
      ),
    ],
  } : {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${displayCat} Businesses in Nigeria`,
    description: `Browse verified ${displayCat} businesses across Nigeria`,
    url: categoryPageUrl,
  };

  return c.html(baseTemplate({
    title: `${displayCat} Businesses`,
    body,
    headExtra,
    locale,
    searchLabel: t('action_search'),
    footerTagline: t('footer_tagline'),
    structuredData,
  }));
});

// BUG-055: "Report this listing" — POST /discover/:id/report
// Accepts abuse / inaccuracy reports for public listings.
// T3 note: public-discovery is cross-tenant by design; reporter_ip stored for moderation.
// Inserts into listing_reports (migration 0382). Rate-limited at network layer via Cloudflare WAF.
const VALID_REASONS = ['inaccurate', 'spam', 'offensive', 'duplicate', 'other'] as const;
type ReportReason = typeof VALID_REASONS[number];

router.post('/discover/:id/report', async (c) => {
  const entityId = c.req.param('id');
  if (!entityId) return c.json({ error: 'Entity ID is required.' }, 400);

  let body: { reason?: string; details?: string } = {};
  try {
    body = await c.req.json<{ reason?: string; details?: string }>();
  } catch {
    return c.json({ error: 'Invalid JSON body.' }, 400);
  }

  const reason = body.reason as ReportReason | undefined;
  if (!reason || !VALID_REASONS.includes(reason)) {
    return c.json({
      error: `reason is required. Must be one of: ${VALID_REASONS.join(', ')}`,
      valid_reasons: VALID_REASONS,
    }, 422);
  }

  const details = typeof body.details === 'string' ? body.details.slice(0, 500) : null;
  const reporterIp = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? null;
  const id = crypto.randomUUID();

  try {
    await c.env.DB.prepare(
      `INSERT INTO listing_reports (id, entity_id, tenant_id, reporter_ip, reason, details, status, created_at)
       VALUES (?, ?, 'public', ?, ?, ?, 'pending', unixepoch())`,
    ).bind(id, entityId, reporterIp, reason, details).run();
  } catch {
    // If listing_reports table doesn't exist yet (migration pending), fail gracefully
    return c.json({ error: 'Report service temporarily unavailable. Please try again later.' }, 503);
  }

  return c.json({ success: true, message: 'Report submitted. Thank you for helping keep the platform accurate.' }, 201);
});

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export { router as listingsRouter };
