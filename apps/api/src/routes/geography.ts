/**
 * Geography routes.
 * (Platform Invariant T6 — geography-driven discovery)
 *
 * GET /geography/places/:id           — fetch a single place node
 * GET /geography/places/:id/children  — fetch immediate children
 * GET /geography/places/:id/ancestry  — full ancestry breadcrumb path
 *
 * Geography data is public — no auth required.
 * Results are cached in KV to avoid repeated D1 reads.
 *
 * PERF-02: Graceful degradation — on KV failure, each endpoint falls back
 *          to a targeted D1 query instead of a full table-scan rebuild.
 *          Full index rebuild only happens on a normal cache miss (KV reachable
 *          but key expired). Individual place nodes are cached independently
 *          for incremental warming.
 *
 * PERF-11: D1 batch() used in the KV-fallback ancestry path to resolve all
 *          ancestor nodes in a single HTTP roundtrip to D1 instead of N
 *          sequential queries. See getAncestryFromD1().
 */

import { Hono } from 'hono';
import { buildIndexFromD1 } from '@webwaka/geography';
import type { PlaceId } from '@webwaka/types';
import { asId } from '@webwaka/types';
import type { Env } from '../env.js';

const CACHE_TTL_SECONDS = 3600; // 1 hour
const CACHE_KEY = 'geography:index:v1';

type PlaceRow = { id: string; name: string; geography_type: string; parent_id: string | null; ancestry_path: string };

const geographyRoutes = new Hono<{ Bindings: Env }>();

async function getGeographyIndex(env: Env): Promise<Awaited<ReturnType<typeof buildIndexFromD1>> | null> {
  let kvReachable = true;
  try {
    const cached: null | Record<string, unknown> = await env.GEOGRAPHY_CACHE.get(CACHE_KEY, 'json');
    if (cached) {
      return new Map(Object.entries(cached)) as unknown as Awaited<ReturnType<typeof buildIndexFromD1>>;
    }
  } catch (err) {
    console.error('[geography] KV read failed:', err);
    kvReachable = false;
  }

  if (!kvReachable) {
    return null;
  }

  const index = await buildIndexFromD1(env.DB);

  try {
    const serialized = Object.fromEntries(index);
    await env.GEOGRAPHY_CACHE.put(CACHE_KEY, JSON.stringify(serialized), {
      expirationTtl: CACHE_TTL_SECONDS,
    });
  } catch (err) {
    console.error('[geography] KV write failed (serving from D1):', err);
  }

  return index;
}

async function getPlaceFromD1(env: Env, placeId: string): Promise<PlaceRow | null> {
  return env.DB.prepare(
    `SELECT id, name, geography_type, parent_id, ancestry_path FROM places WHERE id = ? LIMIT 1`,
  ).bind(placeId).first<PlaceRow>();
}

async function getChildrenFromD1(env: Env, parentId: string): Promise<PlaceRow[]> {
  const { results } = await env.DB.prepare(
    `SELECT id, name, geography_type, parent_id, ancestry_path FROM places WHERE parent_id = ? ORDER BY name ASC LIMIT 500`,
  ).bind(parentId).all<PlaceRow>();
  return results;
}

/**
 * PERF-11: Fetch all ancestry nodes in a single D1 batch() roundtrip.
 * Replaces the N sequential queries pattern in the KV-fallback ancestry path.
 * Empty ancestryIds returns [] immediately without hitting D1.
 */
async function getAncestryFromD1(env: Env, ancestryIds: string[]): Promise<PlaceRow[]> {
  if (ancestryIds.length === 0) return [];

  const stmts = ancestryIds.map((id) =>
    env.DB.prepare(
      `SELECT id, name, geography_type, parent_id, ancestry_path FROM places WHERE id = ? LIMIT 1`,
    ).bind(id),
  );

  const batchResults = await env.DB.batch<PlaceRow>(stmts);
  return batchResults.flatMap((r) => r.results).filter(Boolean);
}

// GET /geography/places/:placeId
geographyRoutes.get('/places/:placeId', async (c) => {
  const placeId = asId<PlaceId>(c.req.param('placeId'));

  try {
    const index = await getGeographyIndex(c.env);

    if (index) {
      const node = index.get(placeId);
      if (!node) {
        return c.json({ error: `Place '${placeId}' not found.` }, 404);
      }
      c.header('Cache-Control', 'public, max-age=3600');
      return c.json({ data: node });
    }

    const row = await getPlaceFromD1(c.env, placeId);
    if (!row) {
      return c.json({ error: `Place '${placeId}' not found.` }, 404);
    }
    c.header('Cache-Control', 'public, max-age=600');
    return c.json({ data: row, _fallback: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return c.json({ error: message }, 500);
  }
});

// GET /geography/places/:placeId/children — direct children only
geographyRoutes.get('/places/:placeId/children', async (c) => {
  const placeId = asId<PlaceId>(c.req.param('placeId'));

  try {
    const index = await getGeographyIndex(c.env);

    if (index) {
      const children = Array.from(index.values()).filter(
        (node) => node.parentId === placeId,
      );
      c.header('Cache-Control', 'public, max-age=3600');
      return c.json({ data: children, count: children.length });
    }

    const children = await getChildrenFromD1(c.env, placeId);
    c.header('Cache-Control', 'public, max-age=600');
    return c.json({ data: children, count: children.length, _fallback: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return c.json({ error: message }, 500);
  }
});

// GET /geography/places/:placeId/ancestry — full breadcrumb ancestry path
geographyRoutes.get('/places/:placeId/ancestry', async (c) => {
  const placeId = asId<PlaceId>(c.req.param('placeId'));

  try {
    const index = await getGeographyIndex(c.env);

    if (index) {
      const node = index.get(placeId);
      if (!node) {
        return c.json({ error: `Place '${placeId}' not found.` }, 404);
      }
      const ancestryNodes = (node.ancestryPath as PlaceId[])
        .map((id) => index.get(id))
        .filter((n): n is NonNullable<typeof n> => n !== undefined);
      c.header('Cache-Control', 'public, max-age=3600');
      return c.json({ data: ancestryNodes, placeId, count: ancestryNodes.length });
    }

    const row = await getPlaceFromD1(c.env, placeId);
    if (!row) {
      return c.json({ error: `Place '${placeId}' not found.` }, 404);
    }
    let ancestryIds: string[] = [];
    try { ancestryIds = JSON.parse(row.ancestry_path ?? '[]') as string[]; } catch { /* empty */ }
    // PERF-11: resolve all ancestor nodes in one D1 batch() roundtrip
    const ancestryNodes = await getAncestryFromD1(c.env, ancestryIds);
    c.header('Cache-Control', 'public, max-age=600');
    return c.json({ data: ancestryNodes, placeId, count: ancestryNodes.length, _fallback: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return c.json({ error: message }, 500);
  }
});

// ---------------------------------------------------------------------------
// M7e: States, LGAs, Wards — D1 direct queries (public, cacheable)
// ---------------------------------------------------------------------------

geographyRoutes.get('/states', async (c) => {
  interface StateRow {
    id: string;
    name: string;
    geography_type: string;
    parent_id: string | null;
  }

  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, name, geography_type, parent_id
       FROM places
       WHERE geography_type = 'state'
       ORDER BY name ASC
       LIMIT 500`,
    ).all<StateRow>();

    c.header('Cache-Control', 'public, max-age=86400');
    return c.json({ data: results, count: results.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return c.json({ error: message }, 500);
  }
});

geographyRoutes.get('/lgas', async (c) => {
  const stateId = c.req.query('stateId');
  if (!stateId || stateId.trim() === '') {
    return c.json({ error: 'stateId query parameter is required' }, 400);
  }

  interface LGARow {
    id: string;
    name: string;
    geography_type: string;
    parent_id: string | null;
  }

  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, name, geography_type, parent_id
       FROM places
       WHERE geography_type = 'local_government_area' AND parent_id = ?
       ORDER BY name ASC
       LIMIT 500`,
    ).bind(stateId).all<LGARow>();

    c.header('Cache-Control', 'public, max-age=86400');
    return c.json({ data: results, count: results.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return c.json({ error: message }, 500);
  }
});

geographyRoutes.get('/wards', async (c) => {
  const lgaId = c.req.query('lgaId');
  if (!lgaId || lgaId.trim() === '') {
    return c.json({ error: 'lgaId query parameter is required' }, 400);
  }

  interface WardRow {
    id: string;
    name: string;
    geography_type: string;
    parent_id: string | null;
  }

  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, name, geography_type, parent_id
       FROM places
       WHERE geography_type = 'ward' AND parent_id = ?
       ORDER BY name ASC
       LIMIT 500`,
    ).bind(lgaId).all<WardRow>();

    c.header('Cache-Control', 'public, max-age=86400');
    return c.json({ data: results, count: results.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return c.json({ error: message }, 500);
  }
});

export { geographyRoutes };
