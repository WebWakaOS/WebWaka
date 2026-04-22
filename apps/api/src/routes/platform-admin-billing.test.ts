/**
 * Platform-admin billing routes — M8a test suite
 *
 * Covers:
 *   GET  /platform-admin/billing/upgrade-requests             (list, filters)
 *   GET  /platform-admin/billing/upgrade-requests/:id         (detail, 404, is_expired)
 *   POST /platform-admin/billing/upgrade-requests/:id/confirm (confirm, force, expiry, idempotency)
 *   POST /platform-admin/billing/upgrade-requests/:id/reject  (reject, guard, 400)
 *   Auth enforcement (401) and role enforcement (403)
 *
 * Uses the production Workers app.fetch() with mocked D1 — same pattern as billing.test.ts.
 */

import { describe, it, expect, vi } from 'vitest';
import app from '../index.js';
import type { Env } from '../env.js';

const JWT_SECRET = 'test-jwt-secret-minimum-32-characters!';
const BASE       = 'http://localhost';

// ---------------------------------------------------------------------------
// JWT factory (mirrors billing.test.ts)
// ---------------------------------------------------------------------------

async function makeJwt(
  workspaceId: string,
  tenantId  = 'tnt_001',
  role      = 'super_admin',
  userId    = 'usr_admin_001',
): Promise<string> {
  const now    = Math.floor(Date.now() / 1000);
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payload = btoa(JSON.stringify({
    sub: userId, workspace_id: workspaceId, tenant_id: tenantId, role,
    iat: now - 10, exp: now + 3600,
  })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const input = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${input}.${signature}`;
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

function get(path: string, jwt?: string): Request {
  return new Request(`${BASE}${path}`, {
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
  });
}

function post(path: string, jwt?: string, body?: unknown): Request {
  return new Request(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : '{}',
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = Math.floor(Date.now() / 1000);
const FUTURE = NOW + 7 * 24 * 60 * 60;
const PAST   = NOW - 7 * 24 * 60 * 60 - 1;

function makeRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: 'req_001',
    workspace_id: 'ws_001',
    tenant_id: 'tnt_001',
    plan: 'growth',
    amount_kobo: 50_000_00,  // ₦50,000 in kobo
    reference: 'WKUP-TESTREF-001',
    requester_email: 'owner@example.com',
    status: 'pending',
    confirmed_by: null, rejected_by: null,
    rejection_reason: null, notes: null,
    confirmed_at: null, rejected_at: null,
    expires_at: FUTURE,
    created_at: NOW - 3600,
    updated_at: NOW - 3600,
    ...overrides,
  };
}

function makeSub(plan = 'starter') {
  return { plan, status: 'active' };
}

function makeWorkspace() {
  return { active_layers: JSON.stringify(['discovery']) };
}

// ---------------------------------------------------------------------------
// DB mock (sequential firstValues, static allResults)
// ---------------------------------------------------------------------------

function makeDB(opts: { firstValues?: unknown[]; allResults?: unknown[] } = {}) {
  const firstValues = opts.firstValues ?? [];
  const allResults  = opts.allResults ?? [];
  let idx = 0;

  const firstFn = vi.fn().mockImplementation(() => {
    const val = firstValues[idx] ?? null;
    idx = Math.min(idx + 1, Math.max(0, firstValues.length - 1));
    return Promise.resolve(val);
  });

  return {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue({
        first: firstFn,
        all:  vi.fn().mockResolvedValue({ results: allResults }),
        run:  vi.fn().mockResolvedValue({ success: true }),
      }),
      first: firstFn,
      all: vi.fn().mockResolvedValue({ results: allResults }),
      run: vi.fn().mockResolvedValue({ success: true }),
    }),
  };
}

function makeEnv(db: unknown): Env {
  return {
    DB: db,
    JWT_SECRET,
    ENVIRONMENT: 'test',
    KV:           { get: vi.fn().mockResolvedValue(null), put: vi.fn(), delete: vi.fn() } as unknown as KVNamespace,
    RATE_LIMIT_KV: { get: vi.fn().mockResolvedValue(null), put: vi.fn(), delete: vi.fn() } as unknown as KVNamespace,
    ASSETS: undefined as unknown as R2Bucket,
  } as unknown as Env;
}

// ---------------------------------------------------------------------------
// Auth enforcement
// ---------------------------------------------------------------------------

describe('Platform-admin billing — auth enforcement', () => {
  it('GET /platform-admin/billing/upgrade-requests → 401 without JWT', async () => {
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('GET /platform-admin/billing/upgrade-requests/:id → 401 without JWT', async () => {
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests/req_001'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('POST .../confirm → 401 without JWT', async () => {
    const res = await app.fetch(post('/platform-admin/billing/upgrade-requests/req_001/confirm'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('POST .../reject → 401 without JWT', async () => {
    const res = await app.fetch(post('/platform-admin/billing/upgrade-requests/req_001/reject'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Role enforcement — non-super_admin must get 403
// ---------------------------------------------------------------------------

describe('Platform-admin billing — role enforcement', () => {
  it('GET list → 403 for owner role', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'owner');
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(403);
  });

  it('GET list → 403 for admin role', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'admin');
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(403);
  });

  it('POST confirm → 403 for member role', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'member');
    const res = await app.fetch(post('/platform-admin/billing/upgrade-requests/req_001/confirm', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// GET /platform-admin/billing/upgrade-requests
// ---------------------------------------------------------------------------

describe('GET /platform-admin/billing/upgrade-requests', () => {
  it('returns request list with count and filter metadata', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ allResults: [makeRequest(), makeRequest({ id: 'req_002', reference: 'WKUP-REF-002' })] });
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.count).toBe(2);
    expect(Array.isArray(body.requests)).toBe(true);
    expect(body.filter).toBeDefined();
    expect((body.filter as Record<string, unknown>).status).toBe('pending');
  });

  it('defaults to status=pending filter', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ allResults: [] });
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests', jwt), makeEnv(db));
    const body = await res.json() as Record<string, unknown>;
    expect((body.filter as Record<string, unknown>).status).toBe('pending');
  });

  it('accepts status=all query parameter', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ allResults: [makeRequest({ status: 'confirmed' })] });
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests?status=all', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect((body.filter as Record<string, unknown>).status).toBe('all');
  });

  it('accepts status=confirmed query parameter', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ allResults: [] });
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests?status=confirmed', jwt), makeEnv(db));
    const body = await res.json() as Record<string, unknown>;
    expect((body.filter as Record<string, unknown>).status).toBe('confirmed');
  });

  it('returns empty list when no requests exist', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ allResults: [] });
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.count).toBe(0);
    expect(body.requests).toHaveLength(0);
    expect(body.next_cursor).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// GET /platform-admin/billing/upgrade-requests/:id
// ---------------------------------------------------------------------------

describe('GET /platform-admin/billing/upgrade-requests/:id', () => {
  it('returns request detail with subscription context', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest(), makeSub('starter')] });
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests/req_001', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.request).toBeDefined();
    expect(body.current_plan).toBe('starter');
    expect(body.is_expired).toBe(false);
    expect(typeof body.upgrade_delta).toBe('string');
  });

  it('returns 404 for unknown request id', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [null] });
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests/nonexistent', jwt), makeEnv(db));
    expect(res.status).toBe(404);
  });

  it('marks is_expired=true for pending request past expires_at', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest({ expires_at: PAST }), makeSub()] });
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests/req_001', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.is_expired).toBe(true);
  });

  it('returns unknown for current_plan when no subscription row exists', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest(), null] });
    const res = await app.fetch(get('/platform-admin/billing/upgrade-requests/req_001', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.current_plan).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// POST /platform-admin/billing/upgrade-requests/:id/confirm
// ---------------------------------------------------------------------------

describe('POST /platform-admin/billing/upgrade-requests/:id/confirm', () => {
  it('returns 404 for unknown request id', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [null] });
    const res = await app.fetch(post('/platform-admin/billing/upgrade-requests/bad_id/confirm', jwt), makeEnv(db));
    expect(res.status).toBe(404);
  });

  it('returns 409 if request is already rejected', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest({ status: 'rejected' })] });
    const res = await app.fetch(post('/platform-admin/billing/upgrade-requests/req_001/confirm', jwt), makeEnv(db));
    expect(res.status).toBe(409);
    const body = await res.json() as Record<string, unknown>;
    expect(String(body.error)).toMatch(/rejected/i);
  });

  it('returns 410 for expired request without force flag', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest({ expires_at: PAST }), makeSub(), makeWorkspace()] });
    const res = await app.fetch(
      post('/platform-admin/billing/upgrade-requests/req_001/confirm', jwt, {}),
      makeEnv(db),
    );
    expect(res.status).toBe(410);
    const body = await res.json() as Record<string, unknown>;
    expect(String(body.error)).toMatch(/expired/i);
    expect(String(body.hint)).toMatch(/force.*true/i);
  });

  it('confirms an expired request when force=true is sent', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest({ expires_at: PAST }), makeSub('starter'), makeWorkspace()] });
    const res = await app.fetch(
      post('/platform-admin/billing/upgrade-requests/req_001/confirm', jwt, { force: true }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.plan).toBeDefined();
    expect(body.billing_id).toBeDefined();
  });

  it('returns 409 for already-expired status record without force flag', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest({ status: 'expired' })] });
    const res = await app.fetch(
      post('/platform-admin/billing/upgrade-requests/req_001/confirm', jwt, {}),
      makeEnv(db),
    );
    expect(res.status).toBe(409);
    const body = await res.json() as Record<string, unknown>;
    expect(String(body.hint)).toMatch(/force.*true/i);
  });

  it('confirms a pending request successfully', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest(), makeSub('starter'), makeWorkspace()] });
    const res = await app.fetch(
      post('/platform-admin/billing/upgrade-requests/req_001/confirm', jwt, { notes: 'Payment confirmed' }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.message).toMatch(/confirmed/i);
    expect(body.workspace_id).toBe('ws_001');
    expect(body.reference).toBe('WKUP-TESTREF-001');
    expect(typeof body.amount_naira).toBe('string');
    expect(body.billing_id).toBeDefined();
    expect(Array.isArray(body.events_fired)).toBe(true);
  });

  it('re-confirming an already-confirmed request returns 200 (idempotent)', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest({ status: 'confirmed' }), makeSub('growth'), makeWorkspace()] });
    const res = await app.fetch(
      post('/platform-admin/billing/upgrade-requests/req_001/confirm', jwt),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
  });

  it('never downgrades the subscription plan', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({
      firstValues: [
        makeRequest({ plan: 'starter' }),
        makeSub('enterprise'),
        makeWorkspace(),
      ],
    });
    const res = await app.fetch(
      post('/platform-admin/billing/upgrade-requests/req_001/confirm', jwt),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.plan).toBe('enterprise');
  });
});

// ---------------------------------------------------------------------------
// POST /platform-admin/billing/upgrade-requests/:id/reject
// ---------------------------------------------------------------------------

describe('POST /platform-admin/billing/upgrade-requests/:id/reject', () => {
  it('returns 400 when reason is missing', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest()] });
    const res = await app.fetch(post('/platform-admin/billing/upgrade-requests/req_001/reject', jwt, {}), makeEnv(db));
    expect(res.status).toBe(400);
  });

  it('returns 400 when reason is too short (< 5 chars)', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest()] });
    const res = await app.fetch(
      post('/platform-admin/billing/upgrade-requests/req_001/reject', jwt, { reason: 'no' }),
      makeEnv(db),
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown request id', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [null] });
    const res = await app.fetch(
      post('/platform-admin/billing/upgrade-requests/bad_id/reject', jwt, { reason: 'Payment not received' }),
      makeEnv(db),
    );
    expect(res.status).toBe(404);
  });

  it('returns 409 when request is already confirmed', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest({ status: 'confirmed' })] });
    const res = await app.fetch(
      post('/platform-admin/billing/upgrade-requests/req_001/reject', jwt, { reason: 'Payment not received' }),
      makeEnv(db),
    );
    expect(res.status).toBe(409);
  });

  it('returns 409 when request is already rejected', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest({ status: 'rejected' })] });
    const res = await app.fetch(
      post('/platform-admin/billing/upgrade-requests/req_001/reject', jwt, { reason: 'Duplicate payment' }),
      makeEnv(db),
    );
    expect(res.status).toBe(409);
  });

  it('successfully rejects a pending request with reason', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest()] });
    const res = await app.fetch(
      post('/platform-admin/billing/upgrade-requests/req_001/reject', jwt, { reason: 'Payment not verified' }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.message).toMatch(/rejected/i);
    expect(body.rejection_reason).toBe('Payment not verified');
    expect(body.workspace_id).toBe('ws_001');
    expect(body.reference).toBe('WKUP-TESTREF-001');
  });

  it('includes a note about billing.payment_failed event in the response', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeRequest()] });
    const res = await app.fetch(
      post('/platform-admin/billing/upgrade-requests/req_001/reject', jwt, { reason: 'Reference not in bank statement' }),
      makeEnv(db),
    );
    const body = await res.json() as Record<string, unknown>;
    expect(String(body.note ?? '')).toMatch(/billing\.payment_failed/i);
  });
});
