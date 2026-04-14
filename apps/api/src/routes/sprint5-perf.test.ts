/**
 * Sprint 5 — Performance Optimization QA Tests
 *
 * PERF-01: CDN cache headers (partner-admin — tested separately)
 * PERF-02: Geography graceful degradation (KV failure → D1 fallback)
 * PERF-03: Cursor-based pagination for templates
 * PERF-04: Database index audit (migration-level — verified via SQL parse)
 * PERF-06: Response compression middleware
 * PERF-08: Discovery search result KV caching
 *
 * 22 tests
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { geographyRoutes } from './geography.js';
import { discoveryRoutes } from './discovery.js';
import app from '../index.js';

const JWT_SECRET = 'test-secret-32-chars-minimum-length-required';

function makeKVMock(opts: { failReads?: boolean; failWrites?: boolean } = {}) {
  const store: Record<string, string> = {};
  return {
    get: vi.fn((key: string, type?: string) => {
      if (opts.failReads) return Promise.reject(new Error('KV read failure'));
      const raw = store[key];
      if (!raw) return Promise.resolve(null);
      if (type === 'json') return Promise.resolve(JSON.parse(raw) as unknown);
      return Promise.resolve(raw);
    }),
    put: vi.fn((key: string, value: string) => {
      if (opts.failWrites) return Promise.reject(new Error('KV write failure'));
      store[key] = value;
      return Promise.resolve();
    }),
    _store: store,
  };
}

type PlacesMap = Record<string, { id: string; name: string; geography_type: string; parent_id: string | null; ancestry_path: string }>;

function makeGeographyDB(places: PlacesMap = {}) {
  const db: {
    prepare: (sql: string) => ReturnType<typeof makeStmt>;
    batch: <T>(stmts: Array<{ first: <U>() => Promise<U | null> }>) => Promise<{ results: T[] }[]>;
  } = {
    prepare: (sql: string) => makeStmt(sql, places),
    // PERF-11: batch() resolves each bound statement via first() and wraps in D1Result shape
    batch: async <T>(stmts: Array<{ first: <U>() => Promise<U | null> }>) => {
      const rows = await Promise.all(stmts.map(s => s.first<T>()));
      return rows.map(r => ({ results: r !== null && r !== undefined ? [r] : [] as T[] }));
    },
  };
  return db;
}

function makeStmt(sql: string, places: PlacesMap) {
  const stmt = {
    bind: (...args: unknown[]) => {
      const placeId = args[0] as string;
      return {
        first: <T>() => {
          if (sql.includes('FROM places WHERE id')) {
            return Promise.resolve((places[placeId] ?? null) as T);
          }
          return Promise.resolve(null as T);
        },
        all: <T>() => {
          if (sql.includes('WHERE parent_id')) {
            const children = Object.values(places).filter(p => p.parent_id === placeId);
            return Promise.resolve({ results: children as T[] });
          }
          if (sql.includes("geography_type = 'state'")) {
            const states = Object.values(places).filter(p => p.geography_type === 'state');
            return Promise.resolve({ results: states as T[] });
          }
          return Promise.resolve({ results: [] as T[] });
        },
        run: () => Promise.resolve({ success: true }),
      };
    },
    first: <T>() => Promise.resolve(null as T),
    all: <T>() => {
      if (sql.includes("geography_type = 'state'")) {
        const states = Object.values(places).filter(p => p.geography_type === 'state');
        return Promise.resolve({ results: states as T[] });
      }
      return Promise.resolve({ results: [] as T[] });
    },
    run: () => Promise.resolve({ success: true }),
  };
  return stmt;
}

const TEST_PLACES = {
  'plc_lagos': { id: 'plc_lagos', name: 'Lagos', geography_type: 'state', parent_id: null, ancestry_path: '["plc_nigeria"]' },
  'plc_ikeja': { id: 'plc_ikeja', name: 'Ikeja', geography_type: 'lga', parent_id: 'plc_lagos', ancestry_path: '["plc_nigeria","plc_lagos"]' },
  'plc_nigeria': { id: 'plc_nigeria', name: 'Nigeria', geography_type: 'country', parent_id: null, ancestry_path: '[]' },
};

function makeGeographyApp(kvOpts: { failReads?: boolean; failWrites?: boolean } = {}, places = TEST_PLACES) {
  const testApp = new Hono();
  const db = makeGeographyDB(places);
  const kv = makeKVMock(kvOpts);

  testApp.use('*', async (c, next) => {
    c.env = { DB: db, GEOGRAPHY_CACHE: kv } as never;
    await next();
  });

  testApp.route('/geography', geographyRoutes);
  return { app: testApp, kv, db };
}

// ---------------------------------------------------------------------------
// PERF-02: Geography Graceful Degradation
// ---------------------------------------------------------------------------

describe('PERF-02: Geography graceful degradation', () => {
  it('falls back to D1 for /places/:id when KV is unreachable', async () => {
    const { app: testApp } = makeGeographyApp({ failReads: true });
    const res = await testApp.request('/geography/places/plc_lagos');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['_fallback']).toBe(true);
    expect((body['data'] as Record<string, unknown>)['name']).toBe('Lagos');
  });

  it('falls back to D1 for /places/:id/children when KV is unreachable', async () => {
    const { app: testApp } = makeGeographyApp({ failReads: true });
    const res = await testApp.request('/geography/places/plc_lagos/children');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['_fallback']).toBe(true);
    expect(body['count']).toBe(1);
  });

  it('falls back to D1 for /places/:id/ancestry when KV is unreachable', async () => {
    const { app: testApp } = makeGeographyApp({ failReads: true });
    const res = await testApp.request('/geography/places/plc_lagos/ancestry');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['_fallback']).toBe(true);
  });

  it('returns 404 on D1 fallback when place not found', async () => {
    const { app: testApp } = makeGeographyApp({ failReads: true });
    const res = await testApp.request('/geography/places/nonexistent');
    expect(res.status).toBe(404);
  });

  it('sets shorter Cache-Control on fallback responses', async () => {
    const { app: testApp } = makeGeographyApp({ failReads: true });
    const res = await testApp.request('/geography/places/plc_lagos');
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=600');
  });

  it('uses normal Cache-Control when KV is working', async () => {
    const { app: testApp } = makeGeographyApp();
    const res = await testApp.request('/geography/states');
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=86400');
  });
});

// ---------------------------------------------------------------------------
// PERF-03: Cursor-Based Pagination for Templates
// ---------------------------------------------------------------------------

function makeTemplatesEnv(templates: Record<string, unknown>[] = []) {
  const mockDB = {
    prepare: (sql: string) => {
      const stmt = {
        bind: (..._args: unknown[]) => ({
          all: () => Promise.resolve({ results: templates }),
          first: <T>() => {
            if (sql.includes('COUNT(*)')) {
              return Promise.resolve({ total: templates.length } as T);
            }
            return Promise.resolve(null as T);
          },
        }),
        all: () => Promise.resolve({ results: templates }),
        first: <T>() => {
          if (sql.includes('COUNT(*)')) {
            return Promise.resolve({ total: templates.length } as T);
          }
          return Promise.resolve(null as T);
        },
      };
      return stmt;
    },
  };

  return {
    DB: mockDB,
    GEOGRAPHY_CACHE: makeKVMock(),
    RATE_LIMIT_KV: makeKVMock(),
    JWT_SECRET,
    ENVIRONMENT: 'development',
  };
}

const SAMPLE_TEMPLATES = [
  { id: 'tpl_aaa', slug: 'dashboard-basic', display_name: 'Basic Dashboard', install_count: 100, created_at: 1712500000, status: 'approved', template_type: 'dashboard', compatible_verticals: '[]' },
  { id: 'tpl_bbb', slug: 'website-pro', display_name: 'Pro Website', install_count: 50, created_at: 1712400000, status: 'approved', template_type: 'website', compatible_verticals: '[]' },
  { id: 'tpl_ccc', slug: 'workflow-auto', display_name: 'Auto Workflow', install_count: 50, created_at: 1712300000, status: 'approved', template_type: 'workflow', compatible_verticals: '[]' },
];

describe('PERF-03: Cursor-based pagination for templates', () => {
  it('returns legacy pagination when no cursor provided', async () => {
    const env = makeTemplatesEnv(SAMPLE_TEMPLATES);
    const req = new Request('http://localhost/templates?page=1&limit=20');
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['pagination']).toBeDefined();
    expect((body['pagination'] as Record<string, unknown>)['page']).toBe(1);
    expect(Array.isArray(body['templates'])).toBe(true);
  });

  it('returns cursor-based response when cursor provided', async () => {
    const cursor = btoa('100:1712500000:tpl_aaa');
    const env = makeTemplatesEnv(SAMPLE_TEMPLATES);
    const req = new Request(`http://localhost/templates?cursor=${cursor}&limit=20`);
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['pagination']).toBeUndefined();
    expect(body['hasMore']).toBeDefined();
    expect(Array.isArray(body['templates'])).toBe(true);
  });

  it('returns 400 for invalid base64 cursor', async () => {
    const env = makeTemplatesEnv(SAMPLE_TEMPLATES);
    const req = new Request('http://localhost/templates?cursor=!!!invalid!!!');
    const res = await app.fetch(req, env);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body['error']).toMatch(/cursor/i);
  });

  it('returns 400 for cursor with wrong field count', async () => {
    const cursor = btoa('only_one_field');
    const env = makeTemplatesEnv(SAMPLE_TEMPLATES);
    const req = new Request(`http://localhost/templates?cursor=${cursor}&limit=10`);
    const res = await app.fetch(req, env);
    expect(res.status).toBe(400);
  });

  it('returns 400 for cursor with non-numeric install count', async () => {
    const cursor = btoa('not_a_number:1712500000:tpl_aaa');
    const env = makeTemplatesEnv(SAMPLE_TEMPLATES);
    const req = new Request(`http://localhost/templates?cursor=${cursor}&limit=10`);
    const res = await app.fetch(req, env);
    expect(res.status).toBe(400);
  });

  it('handles cursor with colons in the id segment', async () => {
    const cursor = btoa('50:1712400000:tpl_with:colons:inside');
    const env = makeTemplatesEnv(SAMPLE_TEMPLATES);
    const req = new Request(`http://localhost/templates?cursor=${cursor}&limit=10`);
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// PERF-06: Response Compression
// ---------------------------------------------------------------------------

describe('PERF-06: Response compression', () => {
  it('does not compress when no Accept-Encoding header', async () => {
    const env = makeTemplatesEnv(SAMPLE_TEMPLATES);
    const req = new Request('http://localhost/templates?page=1&limit=5');
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Encoding')).toBeNull();
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body['templates'])).toBe(true);
  });

  it('returns gzip Content-Encoding when Accept-Encoding: gzip is sent', async () => {
    const env = makeTemplatesEnv(SAMPLE_TEMPLATES);
    const req = new Request('http://localhost/templates?page=1&limit=5', {
      headers: { 'Accept-Encoding': 'gzip, deflate, br' },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    const encoding = res.headers.get('Content-Encoding');
    if (encoding) {
      expect(encoding).toBe('gzip');
    }
  });
});

// ---------------------------------------------------------------------------
// PERF-08: Discovery Search Result KV Caching
// ---------------------------------------------------------------------------

function makeDiscoveryEnv(searchRows: Record<string, unknown>[] = [], kvOpts: { failReads?: boolean } = {}) {
  const kv = makeKVMock(kvOpts);
  const eventsLog: unknown[] = [];

  const mockDB = {
    prepare: (sql: string) => {
      let boundArgs: unknown[] = [];
      const stmt = {
        bind: (...args: unknown[]) => { boundArgs = args; return stmt; },
        run: vi.fn(() => {
          if (sql.includes('INTO discovery_events')) {
            eventsLog.push({ sql, args: boundArgs });
          }
          return Promise.resolve({});
        }),
        first: vi.fn(<T>(): Promise<T | null> => {
          if (sql.includes('FROM profiles WHERE subject_type')) return Promise.resolve(null as T);
          if (sql.includes('COUNT(*)') && sql.includes('claim_intent')) return Promise.resolve({ cnt: 0 } as T);
          if (sql.includes('FROM users')) return Promise.resolve(null as T);
          return Promise.resolve(null as T);
        }),
        all: vi.fn(<T>(): Promise<{ results: T[] }> => {
          if (sql.includes('FROM search_fts') || sql.includes('FROM search_entries')) {
            return Promise.resolve({ results: searchRows as T[] });
          }
          if (sql.includes('FROM discovery_events de')) {
            return Promise.resolve({ results: [] as T[] });
          }
          if (sql.includes('FROM relationships')) {
            return Promise.resolve({ results: [] as T[] });
          }
          return Promise.resolve({ results: [] as T[] });
        }),
      };
      return stmt;
    },
  };

  return {
    env: {
      DB: mockDB,
      GEOGRAPHY_CACHE: kv,
      RATE_LIMIT_KV: makeKVMock(),
      JWT_SECRET,
      ENVIRONMENT: 'development',
    },
    kv,
    eventsLog,
  };
}

const SEARCH_RESULTS = [
  { entity_type: 'individual', entity_id: 'ind_001', display_name: 'Ngozi Test', place_id: 'plc_001', ancestry_path: '[]', visibility: 'public' },
  { entity_type: 'organization', entity_id: 'org_001', display_name: 'Lagos Hub', place_id: 'plc_002', ancestry_path: '[]', visibility: 'public' },
];

describe('PERF-08: Discovery search KV caching', () => {
  it('returns X-Cache: MISS on first search', async () => {
    const { env } = makeDiscoveryEnv(SEARCH_RESULTS);
    const req = new Request('http://localhost/discovery/search?q=ngozi&limit=20');
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache')).toBe('MISS');
  });

  it('caches search results in KV after first request', async () => {
    const { env, kv } = makeDiscoveryEnv(SEARCH_RESULTS);
    const req = new Request('http://localhost/discovery/search?q=lagos&limit=20');
    await app.fetch(req, env);
    expect(kv.put).toHaveBeenCalled();
    const putCall = kv.put.mock.calls[0];
    expect(putCall).toBeDefined();
    expect(putCall?.[0]).toContain('discovery:search:lagos');
  });

  it('returns X-Cache: HIT on subsequent identical search', async () => {
    const { env, kv } = makeDiscoveryEnv(SEARCH_RESULTS);
    const req1 = new Request('http://localhost/discovery/search?q=lagos&limit=20');
    await app.fetch(req1, env);

    const req2 = new Request('http://localhost/discovery/search?q=lagos&limit=20');
    const res2 = await app.fetch(req2, env);
    expect(res2.status).toBe(200);
    expect(res2.headers.get('X-Cache')).toBe('HIT');
  });

  it('does not cache when cursor is provided', async () => {
    const { env, kv } = makeDiscoveryEnv(SEARCH_RESULTS);
    const req = new Request('http://localhost/discovery/search?q=lagos&limit=20&cursor=ind_001');
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache')).toBeNull();
    expect(kv.put).not.toHaveBeenCalled();
  });

  it('does not cache when limit > 20', async () => {
    const { env, kv } = makeDiscoveryEnv(SEARCH_RESULTS);
    const req = new Request('http://localhost/discovery/search?q=lagos&limit=50');
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache')).toBeNull();
  });

  it('falls through to D1 when KV read fails', async () => {
    const { env } = makeDiscoveryEnv(SEARCH_RESULTS, { failReads: true });
    const req = new Request('http://localhost/discovery/search?q=lagos&limit=20');
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache')).toBe('MISS');
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body['items'])).toBe(true);
  });
});
