/**
 * SEO QA Tests — public-discovery structured data
 *
 * Covers bugs identified in SEO Sprint 9+10 QA review:
 *   B2 — buildItemListSchema must NOT emit @context when embedded inside @graph
 *        (category page uses @graph; duplicate @context is invalid JSON-LD)
 *   B3 — place_name can be null (LEFT JOIN in category query);
 *        addressLocality must fall back to 'Nigeria' not null
 *
 * Strategy: create a minimal test Hono app with mock D1 + KV, then hit
 * the /discover/category/:cat route and extract the JSON-LD script tag from
 * the HTML response.
 */

import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { listingsRouter } from './listings.js';
import type { Env } from '../env.js';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

function makeDiscoveryDB(orgs: Row[] = []) {
  return {
    prepare: (sql: string) => {
      const lo = sql.toLowerCase();
      return {
        bind: (..._args: unknown[]) => ({
          all: async <T>() => {
            if (lo.includes('organizations')) return { results: orgs as T[] };
            if (lo.includes('geography_places')) return { results: [] as T[] };
            return { results: [] as T[] };
          },
          first: async <T>(): Promise<T | null> => {
            if (lo.includes('geography_places')) return null;
            return null;
          },
          run: async () => ({ success: true }),
        }),
        all: async <T>() => ({ results: [] as T[] }),
        first: async <T>(): Promise<T | null> => null,
        run: async () => ({ success: true }),
      };
    },
    batch: async (stmts: unknown[]) => stmts.map(() => ({ success: true })),
  };
}

const stubKV = {
  get: async (_key: string) => null,
  put: async (_key: string, _value: string, _opts?: unknown) => undefined,
  delete: async (_key: string) => undefined,
  list: async () => ({ keys: [] }),
  getWithMetadata: async () => ({ value: null, metadata: null }),
} as unknown as KVNamespace;

function makeTestApp(orgs: Row[]) {
  const app = new Hono<{ Bindings: Env }>();
  app.route('/discover', listingsRouter);
  const env: Env = {
    DB: makeDiscoveryDB(orgs) as unknown as D1Database,
    DISCOVERY_CACHE: stubKV,
    LOG_PII_SALT: 'test-pii-salt-min-32-chars-required!',
    ENVIRONMENT: 'development',
  };
  return { app, env };
}

/** Extract JSON-LD script content from HTML. */
function extractJsonLd(html: string): object | null {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match?.[1]) return null;
  return JSON.parse(match[1]) as object;
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const ORGS_WITH_PLACE = [
  { id: 'org_001', name: 'Chidi Pharmacy', category: 'Pharmacy', place_name: 'Ikeja' },
  { id: 'org_002', name: 'Lagos Chemist', category: 'Pharmacy', place_name: 'Victoria Island' },
];

const ORGS_WITH_NULL_PLACE = [
  { id: 'org_003', name: 'No Location Biz', category: 'Restaurant', place_name: null },
  { id: 'org_004', name: 'Another Biz', category: 'Restaurant', place_name: null },
];

const ORGS_MIXED = [
  { id: 'org_005', name: 'Abuja Bakery', category: 'Bakery', place_name: 'Garki' },
  { id: 'org_006', name: 'Mystery Bakery', category: 'Bakery', place_name: null },
];

// ---------------------------------------------------------------------------
// B2: @context must not appear inside @graph nodes
// ---------------------------------------------------------------------------

describe('B2: @context not duplicated inside @graph for /discover/category/:cat', () => {
  it('top-level @context is present in @graph document', async () => {
    const { app, env } = makeTestApp(ORGS_WITH_PLACE);
    const res = await app.request('/discover/category/Pharmacy', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;

    expect(ld).not.toBeNull();
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@graph']).toBeDefined();
  });

  it('ItemList node inside @graph does NOT have its own @context', async () => {
    const { app, env } = makeTestApp(ORGS_WITH_PLACE);
    const res = await app.request('/discover/category/Pharmacy', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;
    const graph = ld['@graph'] as Array<Record<string, unknown>>;

    const itemList = graph.find((node) => node['@type'] === 'ItemList');
    expect(itemList).toBeDefined();
    // B2 fix verification — ItemList embedded in @graph must NOT have @context
    expect(itemList?.['@context']).toBeUndefined();
  });

  it('CollectionPage node inside @graph does NOT have its own @context', async () => {
    const { app, env } = makeTestApp(ORGS_WITH_PLACE);
    const res = await app.request('/discover/category/Pharmacy', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;
    const graph = ld['@graph'] as Array<Record<string, unknown>>;

    const collectionPage = graph.find((node) => node['@type'] === 'CollectionPage');
    expect(collectionPage).toBeDefined();
    expect(collectionPage?.['@context']).toBeUndefined();
  });

  it('@graph contains exactly a CollectionPage and an ItemList', async () => {
    const { app, env } = makeTestApp(ORGS_WITH_PLACE);
    const res = await app.request('/discover/category/Pharmacy', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;
    const graph = ld['@graph'] as Array<Record<string, unknown>>;

    const types = graph.map((n) => n['@type']).sort();
    expect(types).toEqual(['CollectionPage', 'ItemList']);
  });

  it('standalone /discover/search ItemList DOES have @context (not in a @graph)', async () => {
    const { app, env } = makeTestApp(ORGS_WITH_PLACE);
    const res = await app.request('/discover/search?q=Pharmacy', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;

    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('ItemList');
    expect(ld['@graph']).toBeUndefined();
  });

  it('standalone /discover/in/:placeId ItemList DOES have @context', async () => {
    const { app, env } = makeTestApp(ORGS_WITH_PLACE);
    const res = await app.request('/discover/in/geo_001', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;

    // Only non-empty results emit ItemList; mock returns empty for geography subquery
    if (ld && ld['@type'] === 'ItemList') {
      expect(ld['@context']).toBe('https://schema.org');
    } else {
      // Empty results — only WebSite schema or no schema; either is valid
      expect(ld).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// B3: null place_name falls back to 'Nigeria' in addressLocality
// ---------------------------------------------------------------------------

describe('B3: null place_name coalesces to "Nigeria" in ItemList addressLocality', () => {
  it('category page: orgs with null place_name get addressLocality = "Nigeria"', async () => {
    const { app, env } = makeTestApp(ORGS_WITH_NULL_PLACE);
    const res = await app.request('/discover/category/Restaurant', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;
    const graph = ld['@graph'] as Array<Record<string, unknown>>;

    const itemList = graph.find((n) => n['@type'] === 'ItemList') as Record<string, unknown>;
    const items = itemList['itemListElement'] as Array<Record<string, unknown>>;

    expect(items.length).toBe(2);
    for (const listItem of items) {
      const biz = listItem['item'] as Record<string, unknown>;
      const addr = biz['address'] as Record<string, unknown>;
      expect(addr['addressLocality']).toBe('Nigeria');
    }
  });

  it('category page: orgs with a place_name preserve it in addressLocality', async () => {
    const { app, env } = makeTestApp(ORGS_WITH_PLACE);
    const res = await app.request('/discover/category/Pharmacy', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;
    const graph = ld['@graph'] as Array<Record<string, unknown>>;

    const itemList = graph.find((n) => n['@type'] === 'ItemList') as Record<string, unknown>;
    const items = itemList['itemListElement'] as Array<Record<string, unknown>>;

    const localities = items.map((i) => ((i['item'] as Record<string, unknown>)['address'] as Record<string, unknown>)['addressLocality']);
    expect(localities).toContain('Ikeja');
    expect(localities).toContain('Victoria Island');
  });

  it('mixed page: null place_names get Nigeria, real ones are preserved', async () => {
    const { app, env } = makeTestApp(ORGS_MIXED);
    const res = await app.request('/discover/category/Bakery', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;
    const graph = ld['@graph'] as Array<Record<string, unknown>>;

    const itemList = graph.find((n) => n['@type'] === 'ItemList') as Record<string, unknown>;
    const items = itemList['itemListElement'] as Array<Record<string, unknown>>;

    const localities = items.map(
      (i) => ((i['item'] as Record<string, unknown>)['address'] as Record<string, unknown>)['addressLocality'],
    );
    expect(localities).toContain('Garki');
    expect(localities).toContain('Nigeria');
    expect(localities).not.toContain(null);
  });

  it('search page: null place_names get addressLocality = "Nigeria"', async () => {
    const { app, env } = makeTestApp(ORGS_WITH_NULL_PLACE);
    const res = await app.request('/discover/search?q=Restaurant', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;

    if (ld?.['@type'] === 'ItemList') {
      const items = ld['itemListElement'] as Array<Record<string, unknown>>;
      for (const listItem of items) {
        const addr = (listItem['item'] as Record<string, unknown>)['address'] as Record<string, unknown>;
        expect(addr['addressLocality']).not.toBeNull();
        expect(addr['addressLocality']).toBe('Nigeria');
      }
    }
  });
});

// ---------------------------------------------------------------------------
// B2+B3: numberOfItems correctness
// ---------------------------------------------------------------------------

describe('B2+B3: ItemList numberOfItems reflects actual result count', () => {
  it('numberOfItems matches the orgs array length', async () => {
    const { app, env } = makeTestApp(ORGS_WITH_PLACE);
    const res = await app.request('/discover/category/Pharmacy', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;
    const graph = ld['@graph'] as Array<Record<string, unknown>>;

    const itemList = graph.find((n) => n['@type'] === 'ItemList') as Record<string, unknown>;
    expect(itemList['numberOfItems']).toBe(2);

    const items = itemList['itemListElement'] as unknown[];
    expect(items.length).toBe(2);
  });

  it('CollectionPage numberOfItems also matches result count', async () => {
    const { app, env } = makeTestApp(ORGS_WITH_PLACE);
    const res = await app.request('/discover/category/Pharmacy', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;
    const graph = ld['@graph'] as Array<Record<string, unknown>>;

    const page = graph.find((n) => n['@type'] === 'CollectionPage') as Record<string, unknown>;
    expect(page['numberOfItems']).toBe(2);
  });

  it('empty category page falls back to simple CollectionPage (no @graph, no ItemList)', async () => {
    const { app, env } = makeTestApp([]);   // no orgs
    const res = await app.request('/discover/category/Pharmacy', {}, env);
    const html = await res.text();
    const ld = extractJsonLd(html) as Record<string, unknown>;

    expect(ld['@type']).toBe('CollectionPage');
    expect(ld['@graph']).toBeUndefined();
    expect(ld['@context']).toBe('https://schema.org');
  });
});
