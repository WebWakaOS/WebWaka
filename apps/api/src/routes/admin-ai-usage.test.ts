/**
 * Tests for admin-ai-usage.ts — Wave 3 A6-1
 * GET /admin/ai/usage
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { adminAiUsageRoutes } from './admin-ai-usage.js';

// ── Mock DB factory ───────────────────────────────────────────────────────────

function makeUsageRow(overrides: Record<string, unknown> = {}) {
  return {
    total_requests: 10,
    total_wc_charged: 500,
    total_tokens_in: 2000,
    total_tokens_out: 1500,
    total_errors: 1,
    avg_duration_ms: 320,
    ...overrides,
  };
}

type MockDB = {
  _summaryRow: Record<string, unknown> | null;
  _byCapabilityRows: unknown[];
  _byProviderRows: unknown[];
  _byDayRows: unknown[];
  prepare(sql: string): {
    bind(...v: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      all<T = unknown>(): Promise<{ results: T[] }>;
    };
  };
};

function makeMockDB(): MockDB {
  const db: MockDB = {
    _summaryRow: makeUsageRow(),
    _byCapabilityRows: [{ capability: 'superagent_chat', requests: 8, wc_charged: 400, total_tokens: 3200 }],
    _byProviderRows:   [{ provider: 'openai', requests: 8, wc_charged: 400, avg_duration_ms: 310 }],
    _byDayRows:        [{ day: '2026-04-25', requests: 5, wc_charged: 250, errors: 0 }],
    prepare(sql: string) {
      const isSummary = sql.includes('COUNT(*) ') && sql.includes('SUM(wc_charged)') && !sql.includes('GROUP BY');
      const isCap     = sql.includes('GROUP BY capability');
      const isProv    = sql.includes('GROUP BY provider');
      const isDay     = sql.includes('GROUP BY date');
      return {
        bind: (..._v: unknown[]) => ({
          first: <T = unknown>() => Promise.resolve((isSummary ? db._summaryRow : null) as T | null),
          all: <T = unknown>() => {
            const rows = isCap ? db._byCapabilityRows
                       : isProv ? db._byProviderRows
                       : isDay  ? db._byDayRows
                       : [];
            return Promise.resolve({ results: rows as T[] });
          },
        }),
      };
    },
  };
  return db;
}

// ── Test app factory ─────────────────────────────────────────────────────────

function makeApp(auth: Record<string, unknown>, db: MockDB) {
  const app = new Hono<{ Bindings: { DB: unknown } }>();
  app.use('*', async (c, next) => {
    c.set('auth', auth);
    c.env = { DB: db } as never;
    await next();
  });
  app.route('/admin/ai', adminAiUsageRoutes);
  return app;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /admin/ai/usage — auth guards', () => {
  it('returns 401 when not authenticated', async () => {
    const db = makeMockDB();
    const app = makeApp({}, db);
    const res = await app.request('/admin/ai/usage');
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin role', async () => {
    const db = makeMockDB();
    const app = makeApp({ tenantId: 't1', role: 'member' }, db);
    const res = await app.request('/admin/ai/usage');
    expect(res.status).toBe(403);
  });
});

describe('GET /admin/ai/usage — admin access', () => {
  let db: MockDB;
  beforeEach(() => { db = makeMockDB(); });

  it('returns 200 with summary, byCapability, byProvider, byDay', async () => {
    const app = makeApp({ tenantId: 't1', role: 'admin' }, db);
    const res = await app.request('/admin/ai/usage');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body).toHaveProperty('summary');
    expect(body).toHaveProperty('byCapability');
    expect(body).toHaveProperty('byProvider');
    expect(body).toHaveProperty('byDay');
  });

  it('summary totals map correctly', async () => {
    const app = makeApp({ tenantId: 't1', role: 'admin' }, db);
    const res = await app.request('/admin/ai/usage');
    const body = await res.json() as { summary: Record<string, number> };
    expect(body.summary.totalRequests).toBe(10);
    expect(body.summary.totalWcCharged).toBe(500);
    expect(body.summary.totalErrors).toBe(1);
  });

  it('respects ?days= param (max 90)', async () => {
    const app = makeApp({ tenantId: 't1', role: 'admin' }, db);
    const res = await app.request('/admin/ai/usage?days=7');
    const body = await res.json() as { days: number };
    expect(body.days).toBe(7);
  });

  it('clamps days to 90 maximum', async () => {
    const app = makeApp({ tenantId: 't1', role: 'admin' }, db);
    const res = await app.request('/admin/ai/usage?days=200');
    const body = await res.json() as { days: number };
    expect(body.days).toBe(90);
  });

  it('super_admin can override tenantId via ?tenantId=', async () => {
    const app = makeApp({ tenantId: 'myTenant', role: 'super_admin' }, db);
    const res = await app.request('/admin/ai/usage?tenantId=otherTenant');
    const body = await res.json() as { tenantId: string };
    expect(body.tenantId).toBe('otherTenant');
  });

  it('regular admin cannot override tenantId', async () => {
    const app = makeApp({ tenantId: 'myTenant', role: 'admin' }, db);
    const res = await app.request('/admin/ai/usage?tenantId=otherTenant');
    const body = await res.json() as { tenantId: string };
    expect(body.tenantId).toBe('myTenant');
  });

  it('workspace_admin is permitted', async () => {
    const app = makeApp({ tenantId: 't1', role: 'workspace_admin' }, db);
    const res = await app.request('/admin/ai/usage');
    expect(res.status).toBe(200);
  });
});

describe('GET /admin/ai/usage — graceful null summary', () => {
  it('returns zeros when db has no usage rows', async () => {
    const db = makeMockDB();
    db._summaryRow = null;
    const app = makeApp({ tenantId: 't1', role: 'admin' }, db);
    const res = await app.request('/admin/ai/usage');
    const body = await res.json() as { summary: Record<string, number> };
    expect(body.summary.totalRequests).toBe(0);
    expect(body.summary.totalWcCharged).toBe(0);
  });
});
