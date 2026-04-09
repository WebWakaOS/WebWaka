/**
 * Geography-first listing routes.
 * (Pillar 3 — PV-1.2)
 *
 * GET /discover              → homepage — search bar + trending listings
 * GET /discover/in/:placeId  → all entities in a geography subtree (state/LGA/ward)
 * GET /discover/search       → full-text + location search
 *
 * No auth required — public page.
 * T3: no tenant isolation here (marketplace is cross-tenant by design).
 * P9: prices always stored and returned as integer kobo.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { baseTemplate } from '../templates/base.js';

const router = new Hono<{ Bindings: Env }>();

// GET /discover — platform home
router.get('/', async (c) => {
  const body = `
    <h1 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;margin-bottom:1rem">
      Discover businesses near you
    </h1>
    <p style="color:var(--ww-text-muted);margin-bottom:1.5rem;max-width:38rem">
      Find verified businesses, services, and markets across Nigeria.
    </p>
    <form class="ww-search" method="GET" action="/discover/search">
      <input name="q" type="search" placeholder="Search businesses, services, products…" autocomplete="off" />
      <button type="submit">Search</button>
    </form>
    <section>
      <h2 style="font-size:1.125rem;font-weight:700;margin-bottom:1rem">Browse by state</h2>
      <div id="states-placeholder" style="color:var(--ww-text-muted);font-size:.875rem">
        Loading states…
      </div>
    </section>`;

  return c.html(baseTemplate({ title: 'Discover', body }));
});

// GET /discover/in/:placeId — entities in geography subtree
router.get('/in/:placeId', async (c) => {
  const placeId = c.req.param('placeId');
  const cacheKey = `disc:place:${placeId}`;

  const cached = await c.env.DISCOVERY_CACHE.get(cacheKey, 'json') as Array<{
    id: string; name: string; category: string; place_name: string;
  }> | null;

  let results: typeof cached;

  if (!cached) {
    const rows = await c.env.DB
      .prepare(
        `SELECT o.id, o.name, o.category, gp.name AS place_name
         FROM organizations o
         JOIN geography_places gp ON gp.id = o.place_id
         WHERE gp.path LIKE (
           SELECT path || '%' FROM geography_places WHERE id = ?
         )
         AND o.is_published = 1
         ORDER BY o.name ASC
         LIMIT 50`,
      )
      .bind(placeId)
      .all<{ id: string; name: string; category: string; place_name: string }>();
    results = rows.results ?? [];
    await c.env.DISCOVERY_CACHE.put(cacheKey, JSON.stringify(results), { expirationTtl: 60 });
  } else {
    results = cached;
  }

  const cards =
    results.length === 0
      ? '<p style="color:var(--ww-text-muted)">No listings found in this area yet.</p>'
      : `<div class="ww-grid">${results
          .map(
            (r) => `
          <a class="ww-card" href="/discover/profile/organization/${esc(r.id)}" style="display:block;text-decoration:none;color:inherit">
            <span class="ww-badge">${esc(r.category ?? 'Business')}</span>
            <h3>${esc(r.name)}</h3>
            <p>${esc(r.place_name)}</p>
          </a>`,
          )
          .join('')}</div>`;

  const body = `
    <a href="/discover" style="font-size:.875rem;color:var(--ww-text-muted)">&larr; All locations</a>
    <h1 style="font-size:1.5rem;font-weight:800;margin:1rem 0">Businesses in this area</h1>
    ${cards}`;

  return c.html(baseTemplate({ title: 'Listings', body }));
});

// GET /discover/search?q=…&place=…
router.get('/search', async (c) => {
  const q = (c.req.query('q') ?? '').trim();
  const placeId = c.req.query('place') ?? null;

  if (!q) return c.redirect('/discover');

  const results = await c.env.DB
    .prepare(
      `SELECT o.id, o.name, o.category, gp.name AS place_name
       FROM organizations o
       JOIN geography_places gp ON gp.id = o.place_id
       WHERE o.is_published = 1
         AND (o.name LIKE '%' || ? || '%' OR o.category LIKE '%' || ? || '%')
         ${placeId ? 'AND gp.path LIKE (SELECT path || \'%\' FROM geography_places WHERE id = ?)' : ''}
       ORDER BY o.name ASC
       LIMIT 30`,
    )
    .bind(...(placeId ? [q, q, placeId] : [q, q]))
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
            <p>${esc(r.place_name)}</p>
          </a>`,
          )
          .join('')}</div>`;

  const body = `
    <form class="ww-search" method="GET" action="/discover/search">
      <input name="q" type="search" value="${esc(q)}" autocomplete="off" />
      <button type="submit">Search</button>
    </form>
    <p style="margin-bottom:1rem;color:var(--ww-text-muted)">${rows.length} result${rows.length !== 1 ? 's' : ''} for "${esc(q)}"</p>
    ${cards}`;

  return c.html(baseTemplate({ title: `"${q}" — Search`, body }));
});

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export { router as listingsRouter };
