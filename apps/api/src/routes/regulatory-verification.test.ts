/**
 * Regulatory Verification route tests
 *
 * Covers:
 *   POST /regulatory-verification/submit           — submit licence (happy + validation)
 *   GET  /regulatory-verification/status           — workspace status view
 *   GET  /platform-admin/sector-licenses           — admin list
 *   GET  /platform-admin/sector-licenses/:id       — admin detail
 *   POST /platform-admin/sector-licenses/:id/verify  — approve
 *   POST /platform-admin/sector-licenses/:id/reject  — reject
 *   POST /platform-admin/sector-licenses/:id/expire  — expire
 *   T3 isolation, FSM guards, 404, validation errors
 *
 * Uses direct Hono app.request() with mocked D1 — zero live DB calls.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import {
  regulatoryVerificationRoutes,
  platformAdminSectorLicensesRoutes,
} from './regulatory-verification.js';

// ---------------------------------------------------------------------------
// D1 mock
// ---------------------------------------------------------------------------

interface D1Stmt {
  bind(...args: unknown[]): D1Stmt;
  run(): Promise<{ success: boolean }>;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
}

type SqlHandler = (sql: string, ...args: unknown[]) => unknown;

function makeDb(handlers: Record<string, SqlHandler> = {}) {
  const resolve = (sql: string): SqlHandler | null => {
    for (const [key, fn] of Object.entries(handlers)) {
      if (sql.includes(key)) return fn;
    }
    return null;
  };
  const stmtFor = (sql: string): D1Stmt => {
    const args: unknown[] = [];
    const stmt: D1Stmt = {
      bind: (...a) => { args.push(...a); return stmt; },
      run:  async () => ({ success: true }),
      first: async <T>() => {
        const fn = resolve(sql);
        return fn ? (fn(sql, ...args) as T) : null;
      },
      all: async <T>() => {
        const fn = resolve(sql);
        const result = fn ? fn(sql, ...args) : null;
        return Array.isArray(result) ? { results: result as T[] } : { results: [] as T[] };
      },
    };
    return stmt;
  };
  return { prepare: (q: string) => stmtFor(q) };
}

// ---------------------------------------------------------------------------
// App factories
// ---------------------------------------------------------------------------

function makeWorkspaceApp(
  db: ReturnType<typeof makeDb>,
  opts: { workspaceId?: string; tenantId?: string; userId?: string } = {},
) {
  const { workspaceId = 'ws_hosp_01', tenantId = 'tnt_test', userId = 'usr_owner_01' } = opts;
  const app = new Hono<{
    Bindings: { DB: unknown };
    Variables: { auth: unknown };
  }>();
  app.use('*', async (c, next) => {
    c.env = { DB: db } as never;
    c.set('auth' as never, { userId, tenantId, workspaceId, role: 'admin' } as never);
    await next();
  });
  app.route('/regulatory-verification', regulatoryVerificationRoutes);
  return app;
}

function makeAdminApp(
  db: ReturnType<typeof makeDb>,
  opts: { userId?: string } = {},
) {
  const { userId = 'usr_admin_01' } = opts;
  const app = new Hono<{
    Bindings: { DB: unknown };
    Variables: { auth: unknown };
  }>();
  app.use('*', async (c, next) => {
    c.env = { DB: db } as never;
    c.set('auth' as never, { userId, tenantId: 'tnt_platform', workspaceId: 'ws_platform', role: 'super_admin' } as never);
    await next();
  });
  app.route('/platform-admin/sector-licenses', platformAdminSectorLicensesRoutes);
  return app;
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_RECORD = {
  id: 'abc123',
  workspace_id: 'ws_hosp_01',
  vertical_slug: 'hospital',
  regulatory_body: 'MDCN',
  license_number: 'MDCN/FAC/2024/001',
  license_class: null,
  status: 'pending_review',
  rejection_reason: null,
  submitted_at: 1700000000,
  reviewed_at: null,
  reviewed_by: null,
  expires_at: null,
  created_at: 1700000000,
  updated_at: 1700000000,
};

// ---------------------------------------------------------------------------
// POST /regulatory-verification/submit
// ---------------------------------------------------------------------------

describe('POST /regulatory-verification/submit', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 when a valid hospital/MDCN licence is submitted', async () => {
    const db = makeDb({
      'SELECT id, workspace_id': () => SAMPLE_RECORD,
    });
    const app = makeWorkspaceApp(db);
    const res = await app.request('/regulatory-verification/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vertical_slug: 'hospital',
        regulatory_body: 'MDCN',
        license_number: 'MDCN/FAC/2024/001',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ message: string; verification: typeof SAMPLE_RECORD }>();
    expect(body.message).toMatch(/received/i);
    expect(body.verification.vertical_slug).toBe('hospital');
  });

  it('returns 201 for microfinance-bank / CBN submission', async () => {
    const mfbRecord = { ...SAMPLE_RECORD, vertical_slug: 'microfinance-bank', regulatory_body: 'CBN', license_number: 'CBN/MFB/SU/2023/007' };
    const db = makeDb({ 'SELECT id, workspace_id': () => mfbRecord });
    const app = makeWorkspaceApp(db);
    const res = await app.request('/regulatory-verification/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vertical_slug: 'microfinance-bank', regulatory_body: 'CBN', license_number: 'CBN/MFB/SU/2023/007', license_class: 'Unit MFB' }),
    });
    expect(res.status).toBe(201);
  });

  it('returns 201 for stockbroker / SEC submission', async () => {
    const sbRecord = { ...SAMPLE_RECORD, vertical_slug: 'stockbroker', regulatory_body: 'SEC', license_number: 'SEC/1933' };
    const db = makeDb({ 'SELECT id, workspace_id': () => sbRecord });
    const app = makeWorkspaceApp(db);
    const res = await app.request('/regulatory-verification/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vertical_slug: 'stockbroker', regulatory_body: 'SEC', license_number: 'SEC/1933' }),
    });
    expect(res.status).toBe(201);
  });

  it('returns 400 when vertical_slug is missing', async () => {
    const app = makeWorkspaceApp(makeDb());
    const res = await app.request('/regulatory-verification/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regulatory_body: 'MDCN', license_number: 'MDCN/001' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('missing_fields');
  });

  it('returns 400 when license_number is missing', async () => {
    const app = makeWorkspaceApp(makeDb());
    const res = await app.request('/regulatory-verification/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vertical_slug: 'hospital', regulatory_body: 'MDCN' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('missing_fields');
  });

  it('returns 400 for non-JSON body', async () => {
    const app = makeWorkspaceApp(makeDb());
    const res = await app.request('/regulatory-verification/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    expect(res.status).toBe(400);
  });

  it('returns 422 when vertical_slug is not a gated vertical', async () => {
    const app = makeWorkspaceApp(makeDb());
    const res = await app.request('/regulatory-verification/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vertical_slug: 'restaurant', regulatory_body: 'NAFDAC', license_number: 'X123' }),
    });
    expect(res.status).toBe(422);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('invalid_vertical');
  });

  it('returns 422 when regulatory_body does not match the vertical', async () => {
    const app = makeWorkspaceApp(makeDb());
    const res = await app.request('/regulatory-verification/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vertical_slug: 'hospital', regulatory_body: 'SEC', license_number: 'SEC/001' }),
    });
    expect(res.status).toBe(422);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('invalid_regulatory_body');
  });

  it('returns 422 when license_number is too short', async () => {
    const app = makeWorkspaceApp(makeDb());
    const res = await app.request('/regulatory-verification/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vertical_slug: 'hospital', regulatory_body: 'MDCN', license_number: 'AB' }),
    });
    expect(res.status).toBe(422);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('invalid_license_number');
  });
});

// ---------------------------------------------------------------------------
// GET /regulatory-verification/status
// ---------------------------------------------------------------------------

describe('GET /regulatory-verification/status', () => {
  it('returns submitted records and not_submitted entries for remaining bodies', async () => {
    const db = makeDb({
      'FROM sector_license_verifications': () => [SAMPLE_RECORD],
    });
    const app = makeWorkspaceApp(db);
    const res = await app.request('/regulatory-verification/status');
    expect(res.status).toBe(200);
    const body = await res.json<{ submitted: typeof SAMPLE_RECORD[]; not_submitted: unknown[] }>();
    expect(body.submitted).toHaveLength(1);
    expect(body.submitted[0]!.vertical_slug).toBe('hospital');
    expect(body.not_submitted.length).toBeGreaterThan(0);
    const notSubState = body.not_submitted.find(
      (r: unknown) => (r as { vertical_slug: string; regulatory_body: string }).vertical_slug === 'hospital' &&
                       (r as { regulatory_body: string }).regulatory_body === 'State-MoH',
    );
    expect(notSubState).toBeDefined();
  });

  it('returns all not_submitted when workspace has no records', async () => {
    const db = makeDb({ 'FROM sector_license_verifications': () => [] });
    const app = makeWorkspaceApp(db);
    const res = await app.request('/regulatory-verification/status');
    expect(res.status).toBe(200);
    const body = await res.json<{ submitted: unknown[]; not_submitted: unknown[] }>();
    expect(body.submitted).toHaveLength(0);
    expect(body.not_submitted.length).toBeGreaterThan(7);
  });

  it('includes workspaceId (= tenantId) in the response', async () => {
    const db = makeDb({ 'FROM sector_license_verifications': () => [] });
    const app = makeWorkspaceApp(db, { tenantId: 'tnt_hosp_01' });
    const res = await app.request('/regulatory-verification/status');
    const body = await res.json<{ workspaceId: string }>();
    expect(body.workspaceId).toBe('tnt_hosp_01');
  });
});

// ---------------------------------------------------------------------------
// GET /platform-admin/sector-licenses
// ---------------------------------------------------------------------------

describe('GET /platform-admin/sector-licenses', () => {
  it('returns a list of verifications with pagination', async () => {
    const db = makeDb({
      'FROM sector_license_verifications': (sql) => {
        if (sql.includes('COUNT(*)')) return { total: 1 };
        return [SAMPLE_RECORD];
      },
    });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses');
    expect(res.status).toBe(200);
    const body = await res.json<{ data: unknown[]; pagination: { total: number } }>();
    expect(body.data).toHaveLength(1);
    expect(body.pagination.total).toBe(1);
  });

  it('returns 422 for invalid status filter', async () => {
    const app = makeAdminApp(makeDb());
    const res = await app.request('/platform-admin/sector-licenses?status=unknown');
    expect(res.status).toBe(422);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('invalid_status');
  });

  it('returns 422 for invalid vertical_slug filter', async () => {
    const app = makeAdminApp(makeDb());
    const res = await app.request('/platform-admin/sector-licenses?vertical_slug=foo');
    expect(res.status).toBe(422);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('invalid_vertical');
  });

  it('filters by status=pending_review without error', async () => {
    const db = makeDb({
      'FROM sector_license_verifications': () => [SAMPLE_RECORD],
    });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses?status=pending_review');
    expect(res.status).toBe(200);
  });

  it('filters by vertical_slug=hospital without error', async () => {
    const db = makeDb({
      'FROM sector_license_verifications': () => [SAMPLE_RECORD],
    });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses?vertical_slug=hospital');
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// GET /platform-admin/sector-licenses/:id
// ---------------------------------------------------------------------------

describe('GET /platform-admin/sector-licenses/:id', () => {
  it('returns the record when found', async () => {
    const db = makeDb({
      'WHERE id = ?': () => SAMPLE_RECORD,
    });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/abc123');
    expect(res.status).toBe(200);
    const body = await res.json<{ id: string; vertical_slug: string }>();
    expect(body.id).toBe('abc123');
    expect(body.vertical_slug).toBe('hospital');
  });

  it('returns 404 when record is not found', async () => {
    const db = makeDb({ 'WHERE id = ?': () => null });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/no_such_id');
    expect(res.status).toBe(404);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('not_found');
  });
});

// ---------------------------------------------------------------------------
// POST /platform-admin/sector-licenses/:id/verify
// ---------------------------------------------------------------------------

describe('POST /platform-admin/sector-licenses/:id/verify', () => {
  it('returns 200 and approves a pending_review record', async () => {
    const db = makeDb({ 'WHERE id = ?': () => SAMPLE_RECORD });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/abc123/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ status: string }>();
    expect(body.status).toBe('verified');
  });

  it('returns 200 (idempotent) when record is already verified', async () => {
    const verifiedRecord = { ...SAMPLE_RECORD, status: 'verified' };
    const db = makeDb({ 'WHERE id = ?': () => verifiedRecord });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/abc123/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ message: string }>();
    expect(body.message).toMatch(/already verified/i);
  });

  it('returns 404 when record does not exist', async () => {
    const db = makeDb({ 'WHERE id = ?': () => null });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/missing/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(404);
  });

  it('accepts optional expires_at in ISO format', async () => {
    const db = makeDb({ 'WHERE id = ?': () => SAMPLE_RECORD });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/abc123/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expires_at: '2027-04-27T00:00:00.000Z' }),
    });
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// POST /platform-admin/sector-licenses/:id/reject
// ---------------------------------------------------------------------------

describe('POST /platform-admin/sector-licenses/:id/reject', () => {
  it('returns 200 and rejects with a reason', async () => {
    const db = makeDb({ 'WHERE id = ?': () => SAMPLE_RECORD });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/abc123/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejection_reason: 'MDCN number not found in MDCN public register.' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ status: string }>();
    expect(body.status).toBe('rejected');
  });

  it('returns 400 when rejection_reason is missing', async () => {
    const db = makeDb({ 'WHERE id = ?': () => SAMPLE_RECORD });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/abc123/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('missing_reason');
  });

  it('returns 400 when rejection_reason is empty string', async () => {
    const db = makeDb({ 'WHERE id = ?': () => SAMPLE_RECORD });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/abc123/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejection_reason: '   ' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 200 (idempotent) when already rejected', async () => {
    const rejectedRecord = { ...SAMPLE_RECORD, status: 'rejected' };
    const db = makeDb({ 'WHERE id = ?': () => rejectedRecord });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/abc123/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejection_reason: 'Duplicate submission.' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ message: string }>();
    expect(body.message).toMatch(/already rejected/i);
  });

  it('returns 404 when record does not exist', async () => {
    const db = makeDb({ 'WHERE id = ?': () => null });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/missing/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejection_reason: 'Not found.' }),
    });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /platform-admin/sector-licenses/:id/expire
// ---------------------------------------------------------------------------

describe('POST /platform-admin/sector-licenses/:id/expire', () => {
  it('returns 200 and expires a verified record', async () => {
    const verifiedRecord = { ...SAMPLE_RECORD, status: 'verified' };
    const db = makeDb({ 'WHERE id = ?': () => verifiedRecord });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/abc123/expire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ status: string }>();
    expect(body.status).toBe('expired');
  });

  it('returns 422 when trying to expire a pending_review record (FSM guard)', async () => {
    const db = makeDb({ 'WHERE id = ?': () => SAMPLE_RECORD });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/abc123/expire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('invalid_transition');
  });

  it('returns 404 when record does not exist', async () => {
    const db = makeDb({ 'WHERE id = ?': () => null });
    const app = makeAdminApp(db);
    const res = await app.request('/platform-admin/sector-licenses/missing/expire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(404);
  });
});
