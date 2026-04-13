/**
 * Platform Analytics route tests — P6-A
 *
 * Invariants under test:
 *   SEC — super_admin role guard on all three analytics endpoints
 *   P9  — revenue totals returned as integer kobo (no floats in response)
 *   T3  — routes are cross-tenant aggregates; no per-tenant filter (intentional)
 *
 * Phase 6 — Admin Platform Features
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { analyticsRoutes } from './analytics.js';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

type MockOverrides = {
  tenantCount?: unknown;
  workspaceCount?: unknown;
  txSummary?: unknown;
  verticals?: unknown[];
  tenants?: unknown[];
};

function makeMockDB(overrides: MockOverrides = {}) {
  const tenantCountVal = 'tenantCount' in overrides ? overrides.tenantCount : { cnt: 5 };
  const workspaceCountVal = 'workspaceCount' in overrides ? overrides.workspaceCount : { cnt: 12 };
  const txSummaryVal = 'txSummary' in overrides ? overrides.txSummary : { tx_count: 100, revenue_kobo: 500000 };
  const verticalsVal = 'verticals' in overrides ? overrides.verticals : [{ vertical_slug: 'church', workspace_count: 8 }];
  const tenantsVal = 'tenants' in overrides ? overrides.tenants : [{ tenant_id: 't1', tenant_name: 'Acme', workspace_count: 3 }];

  return {
    prepare: vi.fn().mockImplementation((sql: string) => {
      const makeFirst = <T>() => {
        if (sql.includes('COUNT(*)') && sql.includes('organizations')) return Promise.resolve(tenantCountVal as T);
        if (sql.includes('COUNT(*)') && sql.includes('workspaces')) return Promise.resolve(workspaceCountVal as T);
        if (sql.includes('transactions')) return Promise.resolve(txSummaryVal as T);
        return Promise.resolve(null as T);
      };
      const makeAll = <T>() => {
        if (sql.includes('workspace_verticals')) return Promise.resolve({ results: (verticalsVal ?? []) as T[] });
        if (sql.includes('organizations')) return Promise.resolve({ results: (tenantsVal ?? []) as T[] });
        return Promise.resolve({ results: [] as T[] });
      };

      const boundFn = {
        first: makeFirst,
        all: makeAll,
        run: () => Promise.resolve({ success: true }),
        bind: (..._args: unknown[]) => ({
          first: makeFirst,
          all: makeAll,
          run: () => Promise.resolve({ success: true }),
        }),
      };
      return boundFn;
    }),
  };
}

function makeApp(opts: {
  role?: string;
  userId?: string;
  dbOverride?: object;
} = {}): Hono {
  const app = new Hono();

  app.use('*', async (c, next) => {
    if (opts.role !== undefined) {
      c.set('auth', {
        userId: opts.userId ?? 'usr_ops',
        tenantId: 'tenant-root',
        workspaceId: 'wsp_root',
        role: opts.role,
        permissions: [],
      } as never);
    }
    c.env = { DB: opts.dbOverride ?? makeMockDB() } as never;
    await next();
  });

  app.route('/platform/analytics', analyticsRoutes);
  return app;
}

// ---------------------------------------------------------------------------
// Auth guard tests — all three endpoints
// ---------------------------------------------------------------------------

describe('Analytics — Auth guards (SEC invariant)', () => {
  const endpoints = [
    '/platform/analytics/summary',
    '/platform/analytics/tenants',
    '/platform/analytics/verticals',
  ];

  for (const endpoint of endpoints) {
    it(`${endpoint} returns 403 for admin role (not super_admin)`, async () => {
      const app = makeApp({ role: 'admin' });
      const res = await app.request(endpoint);
      expect(res.status).toBe(403);
      const json = await res.json() as { error: string };
      expect(json.error).toContain('super_admin');
    });

    it(`${endpoint} returns 403 for member role`, async () => {
      const app = makeApp({ role: 'member' });
      const res = await app.request(endpoint);
      expect(res.status).toBe(403);
    });

    it(`${endpoint} returns 403 with no auth context`, async () => {
      const app = makeApp();
      const res = await app.request(endpoint);
      expect(res.status).toBe(403);
    });
  }
});

// ---------------------------------------------------------------------------
// GET /platform/analytics/summary
// ---------------------------------------------------------------------------

describe('GET /platform/analytics/summary', () => {
  it('returns 200 with aggregate stats for super_admin', async () => {
    const app = makeApp({ role: 'super_admin' });
    const res = await app.request('/platform/analytics/summary');
    expect(res.status).toBe(200);

    const json = await res.json() as {
      totalTenants: number;
      activeWorkspaces: number;
      last30Days: { transactionCount: number; revenueKobo: number };
      topVerticals: { vertical_slug: string; workspace_count: number }[];
      generatedAt: string;
    };

    expect(typeof json.totalTenants).toBe('number');
    expect(typeof json.activeWorkspaces).toBe('number');
    expect(typeof json.last30Days.transactionCount).toBe('number');
    expect(typeof json.last30Days.revenueKobo).toBe('number');
    expect(Array.isArray(json.topVerticals)).toBe(true);
    expect(typeof json.generatedAt).toBe('string');
  });

  it('P9 invariant: revenueKobo is an integer', async () => {
    const app = makeApp({
      role: 'super_admin',
      dbOverride: makeMockDB({ txSummary: { tx_count: 42, revenue_kobo: 100050 } }),
    });
    const res = await app.request('/platform/analytics/summary');
    const json = await res.json() as { last30Days: { revenueKobo: number } };
    expect(Number.isInteger(json.last30Days.revenueKobo)).toBe(true);
    expect(json.last30Days.revenueKobo).toBe(100050);
  });

  it('returns zeros when no data exists', async () => {
    const app = makeApp({
      role: 'super_admin',
      dbOverride: makeMockDB({
        tenantCount: null,
        workspaceCount: null,
        txSummary: null,
        verticals: [],
      }),
    });
    const res = await app.request('/platform/analytics/summary');
    expect(res.status).toBe(200);
    const json = await res.json() as {
      totalTenants: number;
      activeWorkspaces: number;
      last30Days: { transactionCount: number; revenueKobo: number };
    };
    expect(json.totalTenants).toBe(0);
    expect(json.activeWorkspaces).toBe(0);
    expect(json.last30Days.transactionCount).toBe(0);
    expect(json.last30Days.revenueKobo).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// GET /platform/analytics/tenants
// ---------------------------------------------------------------------------

describe('GET /platform/analytics/tenants', () => {
  it('returns 200 with paginated tenant list for super_admin', async () => {
    const app = makeApp({ role: 'super_admin' });
    const res = await app.request('/platform/analytics/tenants');
    expect(res.status).toBe(200);

    const json = await res.json() as { tenants: unknown[]; page: number; perPage: number };
    expect(Array.isArray(json.tenants)).toBe(true);
    expect(json.page).toBe(1);
    expect(json.perPage).toBe(50);
  });

  it('respects ?page query parameter', async () => {
    const app = makeApp({ role: 'super_admin' });
    const res = await app.request('/platform/analytics/tenants?page=3');
    expect(res.status).toBe(200);
    const json = await res.json() as { page: number };
    expect(json.page).toBe(3);
  });

  it('defaults to page=1 for invalid page param', async () => {
    const app = makeApp({ role: 'super_admin' });
    const res = await app.request('/platform/analytics/tenants?page=foo');
    expect(res.status).toBe(200);
    const json = await res.json() as { page: number };
    expect(json.page).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// GET /platform/analytics/verticals
// ---------------------------------------------------------------------------

describe('GET /platform/analytics/verticals', () => {
  it('returns 200 with vertical heatmap for super_admin', async () => {
    const app = makeApp({ role: 'super_admin' });
    const res = await app.request('/platform/analytics/verticals');
    expect(res.status).toBe(200);

    const json = await res.json() as {
      verticals: { vertical_slug: string; workspace_count: number }[];
      total: number;
    };
    expect(Array.isArray(json.verticals)).toBe(true);
    expect(typeof json.total).toBe('number');
    expect(json.total).toBe(json.verticals.length);
  });

  it('returns verticals sorted by workspace_count desc', async () => {
    const sorted = [
      { vertical_slug: 'church', workspace_count: 20 },
      { vertical_slug: 'school', workspace_count: 15 },
      { vertical_slug: 'pos-business', workspace_count: 8 },
    ];
    const app = makeApp({ role: 'super_admin', dbOverride: makeMockDB({ verticals: sorted }) });
    const res = await app.request('/platform/analytics/verticals');
    const json = await res.json() as { verticals: typeof sorted };
    expect(json.verticals[0]?.vertical_slug).toBe('church');
    expect(json.verticals[1]?.vertical_slug).toBe('school');
  });
});
