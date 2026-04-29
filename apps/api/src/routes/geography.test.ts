/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/**
 * Geography route tests (M7e)
 * Tests: /geography/states, /geography/lgas, /geography/wards (new M7e routes)
 * Minimum: 5 tests
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { geographyRoutes } from './geography.js';

// ---------------------------------------------------------------------------
// Test app factory
// ---------------------------------------------------------------------------

function makeApp(dbRows?: { states?: object[]; lgas?: object[]; wards?: object[] }): Hono {
  const app = new Hono();

  const stateRows = dbRows?.states ?? [
    { id: 'place_lagos_001', name: 'Lagos', geography_type: 'state', parent_id: null },
    { id: 'place_abuja_001', name: 'Abuja', geography_type: 'state', parent_id: null },
  ];
  const lgaRows = dbRows?.lgas ?? [
    { id: 'place_ikeja_001', name: 'Ikeja', geography_type: 'local_government_area', parent_id: 'place_lagos_001' },
    { id: 'place_eti_001', name: 'Eti-Osa', geography_type: 'local_government_area', parent_id: 'place_lagos_001' },
  ];
  const wardRows = dbRows?.wards ?? [
    { id: 'place_ward_001', name: 'Ikeja Ward 1', geography_type: 'ward', parent_id: 'place_ikeja_001' },
  ];

  const mockDB = {
    prepare: vi.fn().mockImplementation((sql: string) => ({
      bind: (..._args: unknown[]) => ({
        all: <T>() => {
          if (sql.includes("geography_type = 'state'")) return Promise.resolve({ results: stateRows as T[] });
          if (sql.includes("geography_type = 'local_government_area'")) return Promise.resolve({ results: lgaRows as T[] });
          if (sql.includes("geography_type = 'ward'")) return Promise.resolve({ results: wardRows as T[] });
          return Promise.resolve({ results: [] as T[] });
        },
      }),
      all: <T>() => {
        if (sql.includes("geography_type = 'state'")) return Promise.resolve({ results: stateRows as T[] });
        return Promise.resolve({ results: [] as T[] });
      },
    })),
  };

  const mockKVCache = {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
  };

  app.use('*', async (c, next) => {
    c.env = { DB: mockDB, GEOGRAPHY_CACHE: mockKVCache } as never;
    await next();
  });

  app.route('/geography', geographyRoutes);
  return app;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /geography/states', () => {
  it('returns 200 with array of states', async () => {
    const app = makeApp();
    const res = await app.request('/geography/states');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body['data'])).toBe(true);
    expect((body['data'] as unknown[]).length).toBeGreaterThan(0);
    expect(body['count']).toBe(2);
  });
});

describe('GET /geography/lgas', () => {
  it('returns 200 with LGAs for a given stateId', async () => {
    const app = makeApp();
    const res = await app.request('/geography/lgas?stateId=place_lagos_001');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body['data'])).toBe(true);
    expect((body['data'] as unknown[]).length).toBeGreaterThan(0);
  });

  it('returns 400 when stateId is missing', async () => {
    const app = makeApp();
    const res = await app.request('/geography/lgas');
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body['error']).toMatch(/stateId/);
  });
});

describe('GET /geography/wards', () => {
  it('returns 200 with wards for a given lgaId', async () => {
    const app = makeApp();
    const res = await app.request('/geography/wards?lgaId=place_ikeja_001');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body['data'])).toBe(true);
  });

  it('returns 400 when lgaId is missing', async () => {
    const app = makeApp();
    const res = await app.request('/geography/wards');
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body['error']).toMatch(/lgaId/);
  });
});

// ---------------------------------------------------------------------------
// Phase 6 (E35): Multi-Country Geography Tests
// ---------------------------------------------------------------------------

function makeMultiCountryApp(overrides: {
  countries?: object[];
  regions?: object[];
} = {}): Hono {
  const app = new Hono();

  const countryRows = overrides.countries ?? [
    { id: 'place_ng_country', name: 'Nigeria', country_code: 'NG' },
    { id: 'place_gh_country', name: 'Ghana', country_code: 'GH' },
    { id: 'place_ke_country', name: 'Kenya', country_code: 'KE' },
  ];

  const regionRows = overrides.regions ?? [
    { id: 'place_gh_region_greater_accra', name: 'Greater Accra', geography_type: 'region', parent_id: 'place_gh_country', country_code: 'GH' },
    { id: 'place_gh_region_ashanti', name: 'Ashanti', geography_type: 'region', parent_id: 'place_gh_country', country_code: 'GH' },
  ];

  const allFn = <T>(sql: string) => {
    if (sql.includes("geography_type = 'country'")) return Promise.resolve({ results: countryRows as T[] });
    if (sql.includes('geography_type = ?') && sql.includes('country_code = ?')) return Promise.resolve({ results: regionRows as T[] });
    return Promise.resolve({ results: [] as T[] });
  };

  const mockDB = {
    prepare: vi.fn().mockImplementation((sql: string) => ({
      bind: (..._args: unknown[]) => ({
        all: <T>() => allFn<T>(sql),
      }),
      all: <T>() => allFn<T>(sql),
    })),
  };

  const mockKVCache = {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
  };

  app.use('*', async (c, next) => {
    c.env = { DB: mockDB, GEOGRAPHY_CACHE: mockKVCache } as never;
    await next();
  });

  app.route('/geography', geographyRoutes);
  return app;
}

describe('Phase 6 (E35) — GET /geography/countries', () => {
  it('returns 200 with list of countries', async () => {
    const app = makeMultiCountryApp();
    const res = await app.request('/geography/countries');
    expect(res.status).toBe(200);
    const body = await res.json() as { data: Array<{ country_code: string }>; count: number };
    expect(body.count).toBe(3);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('returns NG, GH, KE country codes', async () => {
    const app = makeMultiCountryApp();
    const res = await app.request('/geography/countries');
    const body = await res.json() as { data: Array<{ country_code: string }> };
    const codes = body.data.map((c) => c.country_code);
    expect(codes).toContain('NG');
    expect(codes).toContain('GH');
    expect(codes).toContain('KE');
  });

  it('returns Cache-Control public header', async () => {
    const app = makeMultiCountryApp();
    const res = await app.request('/geography/countries');
    expect(res.headers.get('cache-control')).toMatch(/public/);
  });
});

describe('Phase 6 (E35) — GET /geography/countries/:countryCode/regions', () => {
  it('returns 200 with Ghana regions', async () => {
    const app = makeMultiCountryApp();
    const res = await app.request('/geography/countries/GH/regions');
    expect(res.status).toBe(200);
    const body = await res.json() as {
      country_code: string;
      geography_type: string;
      data: unknown[];
      count: number;
    };
    expect(body.country_code).toBe('GH');
    expect(body.geography_type).toBe('region');
    expect(body.count).toBe(2);
  });

  it('maps KE to county geography_type', async () => {
    const app = makeMultiCountryApp({
      regions: [{ id: 'place_ke_county_nairobi', name: 'Nairobi', geography_type: 'county', parent_id: 'place_ke_country', country_code: 'KE' }],
    });
    const res = await app.request('/geography/countries/KE/regions');
    expect(res.status).toBe(200);
    const body = await res.json() as { geography_type: string };
    expect(body.geography_type).toBe('county');
  });

  it('maps NG to state geography_type', async () => {
    const app = makeMultiCountryApp({ regions: [] });
    const res = await app.request('/geography/countries/NG/regions');
    expect(res.status).toBe(200);
    const body = await res.json() as { geography_type: string };
    expect(body.geography_type).toBe('state');
  });

  it('returns 400 for unsupported country code', async () => {
    const app = makeMultiCountryApp();
    const res = await app.request('/geography/countries/US/regions');
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/not supported/);
  });

  it('is case-insensitive on country code parameter', async () => {
    const app = makeMultiCountryApp();
    const res = await app.request('/geography/countries/gh/regions');
    expect(res.status).toBe(200);
    const body = await res.json() as { country_code: string };
    expect(body.country_code).toBe('GH');
  });
});
