/**
 * Billing & Subscription Management Route Tests — Phase 17 / MON-05
 *
 * Covers:
 *   - GET /billing/status (existing + no subscription fallback)
 *   - POST /billing/enforce (admin-only gate, transitions)
 *   - POST /billing/reactivate (payment gate, period renewal)
 *   - POST /billing/change-plan (upgrade immediate, downgrade immediate, same-plan 409)
 *   - POST /billing/cancel (cancel_at_period_end, free-plan guard, already-cancelled 409)
 *   - POST /billing/revert-cancel (undo scheduled cancel)
 *   - GET  /billing/history (T3 scoped, pagination)
 *   - Auth enforcement (401 on all routes without JWT)
 *   - T3 tenant isolation
 *
 * Pattern: Uses app.fetch(req, env) with the production Workers app, exactly
 * as payment tests do — this exercises the full auth middleware stack.
 */

import { describe, it, expect, vi } from 'vitest';
import app from '../index.js';
import type { Env } from '../env.js';

const JWT_SECRET = 'test-jwt-secret-minimum-32-characters!';
const BASE = 'http://localhost';

// ---------------------------------------------------------------------------
// JWT factory
// ---------------------------------------------------------------------------

async function makeJwt(
  workspaceId: string,
  tenantId = 'tnt_001',
  role = 'owner',
  userId = 'usr_001',
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payload = btoa(JSON.stringify({
    sub: userId,
    workspace_id: workspaceId,
    tenant_id: tenantId,
    role,
    iat: now - 10,
    exp: now + 3600,
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
// Request factory helpers
// ---------------------------------------------------------------------------

function get(path: string, jwt?: string): Request {
  return new Request(`${BASE}${path}`, {
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
  });
}

function post(path: string, jwt?: string, body?: unknown): Request {
  const bodyStr = body !== undefined ? JSON.stringify(body) : '{}';
  // BUG-003 fix: test requests are M2M callers — send X-CSRF-Intent: m2m
  return new Request(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Intent': 'm2m',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: bodyStr,
  });
}

// ---------------------------------------------------------------------------
// Env/DB mock factories
// ---------------------------------------------------------------------------

const NOW = Math.floor(Date.now() / 1000);
const PERIOD_END = NOW + 30 * 24 * 60 * 60;

function makeActiveSub(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'sub_001', workspace_id: 'ws_001', tenant_id: 'tnt_001',
    plan: 'starter', status: 'active',
    current_period_start: NOW - 86400, current_period_end: PERIOD_END,
    grace_period_end: null, enforcement_status: 'none',
    cancel_at_period_end: 0, updated_at: NOW - 86400,
    ...overrides,
  };
}

type MockFirst = ReturnType<typeof vi.fn>;

function makeDB(opts: {
  firstValues?: unknown[];
  allResults?: unknown[];
} = {}) {
  const firstValues = opts.firstValues ?? [makeActiveSub()];
  const allResults = opts.allResults ?? [];
  let firstCallIdx = 0;

  const firstFn: MockFirst = vi.fn().mockImplementation(() => {
    const val = firstValues[firstCallIdx] ?? null;
    firstCallIdx = Math.min(firstCallIdx + 1, firstValues.length - 1);
    return Promise.resolve(val);
  });

  return {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue({
        first: firstFn,
        all: vi.fn().mockResolvedValue({ results: allResults }),
        run: vi.fn().mockResolvedValue({ success: true }),
      }),
      first: firstFn,
      all: vi.fn().mockResolvedValue({ results: allResults }),
      run: vi.fn().mockResolvedValue({ success: true }),
    }),
    batch: vi.fn().mockResolvedValue([{ results: [] }]),
  };
}

function makeEnv(db: unknown): Env {
  return {
    DB: db,
    JWT_SECRET,
    ENVIRONMENT: 'test',
    KV: { get: vi.fn().mockResolvedValue(null), put: vi.fn(), delete: vi.fn() } as unknown as KVNamespace,
    RATE_LIMIT_KV: { get: vi.fn().mockResolvedValue(null), put: vi.fn(), delete: vi.fn() } as unknown as KVNamespace,
    ASSETS: undefined as unknown as R2Bucket,
  } as unknown as Env;
}

// ---------------------------------------------------------------------------
// Auth enforcement — all billing routes require a JWT
// ---------------------------------------------------------------------------

describe('Billing — auth enforcement', () => {
  it('GET /billing/status → 401 without JWT', async () => {
    const res = await app.fetch(get('/billing/status'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('POST /billing/change-plan → 401 without JWT', async () => {
    const res = await app.fetch(post('/billing/change-plan', undefined, { plan: 'growth' }), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('POST /billing/cancel → 401 without JWT', async () => {
    const res = await app.fetch(post('/billing/cancel'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('GET /billing/history → 401 without JWT', async () => {
    const res = await app.fetch(get('/billing/history'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('POST /billing/revert-cancel → 401 without JWT', async () => {
    const res = await app.fetch(post('/billing/revert-cancel'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /billing/status
// ---------------------------------------------------------------------------

describe('GET /billing/status', () => {
  it('returns subscription status for authenticated caller', async () => {
    const jwt = await makeJwt('ws_001');
    const res = await app.fetch(get('/billing/status', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.plan).toBe('starter');
    expect(body.status).toBe('active');
    expect(body.cancel_at_period_end).toBe(false);
  });

  it('returns free plan when no subscription found', async () => {
    const jwt = await makeJwt('ws_002', 'tnt_002');
    const db = makeDB({ firstValues: [null, null] });
    const res = await app.fetch(get('/billing/status', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.plan).toBe('free');
    expect(body.message).toMatch(/free plan/i);
  });

  it('returns days_until_expiry as a positive number', async () => {
    const jwt = await makeJwt('ws_001');
    const res = await app.fetch(get('/billing/status', jwt), makeEnv(makeDB()));
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body.days_until_expiry).toBe('number');
    expect(body.days_until_expiry as number).toBeGreaterThan(0);
  });

  it('shows cancel_at_period_end=true when scheduled for cancellation', async () => {
    const jwt = await makeJwt('ws_001');
    const db = makeDB({ firstValues: [makeActiveSub({ cancel_at_period_end: 1 })] });
    const res = await app.fetch(get('/billing/status', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.cancel_at_period_end).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST /billing/enforce  (admin-only)
// ---------------------------------------------------------------------------

describe('POST /billing/enforce', () => {
  it('403 for non-admin caller', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'member');
    const res = await app.fetch(post('/billing/enforce', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(403);
    const body = await res.json() as Record<string, unknown>;
    expect(body.code).toBe('FORBIDDEN');
  });

  it('200 for admin caller with zero transitions when no expired subs', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'admin');
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [] }),
          run: vi.fn().mockResolvedValue({ success: true }),
        }),
      }),
      batch: vi.fn().mockResolvedValue([{ results: [] }]),
    };
    const res = await app.fetch(post('/billing/enforce', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    const transitions = body.transitions as Record<string, unknown>;
    expect(transitions.active_to_grace).toBe(0);
    expect(transitions.grace_to_suspended).toBe(0);
  });

  it('200 for super_admin caller', async () => {
    const jwt = await makeJwt('ws_001', 'tnt_001', 'super_admin');
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [] }),
          run: vi.fn().mockResolvedValue({ success: true }),
        }),
      }),
      batch: vi.fn().mockResolvedValue([{ results: [] }]),
    };
    const res = await app.fetch(post('/billing/enforce', jwt), makeEnv(db));
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// POST /billing/change-plan
// ---------------------------------------------------------------------------

describe('POST /billing/change-plan', () => {
  it('upgrades from starter to growth — 200 with immediate effect', async () => {
    const jwt = await makeJwt('ws_001');
    const db = makeDB({ firstValues: [makeActiveSub({ plan: 'starter' })] });
    const res = await app.fetch(post('/billing/change-plan', jwt, { plan: 'growth' }), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.change_type).toBe('upgrade');
    expect(body.new_plan).toBe('growth');
    expect(body.effective).toBe('immediate');
  });

  it('upgrades from free to enterprise — 200', async () => {
    const jwt = await makeJwt('ws_001');
    const db = makeDB({ firstValues: [makeActiveSub({ plan: 'free' })] });
    const res = await app.fetch(post('/billing/change-plan', jwt, { plan: 'enterprise' }), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.change_type).toBe('upgrade');
  });

  it('downgrades from growth to starter — 200 with immediate effect', async () => {
    const jwt = await makeJwt('ws_001');
    const db = makeDB({ firstValues: [makeActiveSub({ plan: 'growth' })] });
    const res = await app.fetch(post('/billing/change-plan', jwt, { plan: 'starter' }), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.change_type).toBe('downgrade');
    expect(body.new_plan).toBe('starter');
  });

  it('409 when requesting same plan', async () => {
    const jwt = await makeJwt('ws_001');
    const db = makeDB({ firstValues: [makeActiveSub({ plan: 'starter' })] });
    const res = await app.fetch(post('/billing/change-plan', jwt, { plan: 'starter' }), makeEnv(db));
    expect(res.status).toBe(409);
    const body = await res.json() as Record<string, unknown>;
    expect(body.code).toBe('NO_CHANGE');
  });

  it('422 for invalid plan name', async () => {
    const jwt = await makeJwt('ws_001');
    const res = await app.fetch(post('/billing/change-plan', jwt, { plan: 'diamond' }), makeEnv(makeDB()));
    expect(res.status).toBe(422);
    const body = await res.json() as Record<string, unknown>;
    expect(body.code).toBe('INVALID_PLAN');
  });

  it('403 when subscription is suspended', async () => {
    const jwt = await makeJwt('ws_001');
    const db = makeDB({ firstValues: [makeActiveSub({ status: 'suspended' })] });
    const res = await app.fetch(post('/billing/change-plan', jwt, { plan: 'growth' }), makeEnv(db));
    expect(res.status).toBe(403);
    const body = await res.json() as Record<string, unknown>;
    expect(body.code).toBe('SUBSCRIPTION_SUSPENDED');
  });

  it('400 for invalid JSON body', async () => {
    const jwt = await makeJwt('ws_001');
    const req = new Request(`${BASE}/billing/change-plan`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json', 'X-CSRF-Intent': 'm2m' },
      body: 'not-json',
    });
    const res = await app.fetch(req, makeEnv(makeDB()));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.code).toBe('BAD_REQUEST');
  });

  it('404 when no subscription found', async () => {
    const jwt = await makeJwt('ws_002', 'tnt_002');
    const db = makeDB({ firstValues: [null, null] });
    const res = await app.fetch(post('/billing/change-plan', jwt, { plan: 'growth' }), makeEnv(db));
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /billing/cancel
// ---------------------------------------------------------------------------

describe('POST /billing/cancel', () => {
  it('schedules cancellation for paid plan — 200', async () => {
    const jwt = await makeJwt('ws_001');
    const db = makeDB({ firstValues: [makeActiveSub({ plan: 'growth', cancel_at_period_end: 0 })] });
    const res = await app.fetch(post('/billing/cancel', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.cancelled).toBe(true);
    expect(typeof body.cancels_at).toBe('string');
  });

  it('422 when trying to cancel a free plan', async () => {
    const jwt = await makeJwt('ws_001');
    const db = makeDB({ firstValues: [makeActiveSub({ plan: 'free' })] });
    const res = await app.fetch(post('/billing/cancel', jwt), makeEnv(db));
    expect(res.status).toBe(422);
    const body = await res.json() as Record<string, unknown>;
    expect(body.code).toBe('CANNOT_CANCEL_FREE');
  });

  it('409 when subscription is already scheduled for cancellation', async () => {
    const jwt = await makeJwt('ws_001');
    const db = makeDB({ firstValues: [makeActiveSub({ cancel_at_period_end: 1 })] });
    const res = await app.fetch(post('/billing/cancel', jwt), makeEnv(db));
    expect(res.status).toBe(409);
  });

  it('404 when no subscription found', async () => {
    const jwt = await makeJwt('ws_002', 'tnt_002');
    const db = makeDB({ firstValues: [null, null] });
    const res = await app.fetch(post('/billing/cancel', jwt), makeEnv(db));
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /billing/revert-cancel
// ---------------------------------------------------------------------------

describe('POST /billing/revert-cancel', () => {
  it('reverts a scheduled cancellation — 200', async () => {
    const jwt = await makeJwt('ws_001');
    const db = makeDB({ firstValues: [makeActiveSub({ cancel_at_period_end: 1 })] });
    const res = await app.fetch(post('/billing/revert-cancel', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.reverted).toBe(true);
  });

  it('409 when no pending cancellation exists', async () => {
    const jwt = await makeJwt('ws_001');
    const db = makeDB({ firstValues: [makeActiveSub({ cancel_at_period_end: 0 })] });
    const res = await app.fetch(post('/billing/revert-cancel', jwt), makeEnv(db));
    expect(res.status).toBe(409);
    const body = await res.json() as Record<string, unknown>;
    expect(body.code).toBe('NO_PENDING_CANCEL');
  });

  it('404 when no subscription found', async () => {
    const jwt = await makeJwt('ws_002', 'tnt_002');
    const db = makeDB({ firstValues: [null, null] });
    const res = await app.fetch(post('/billing/revert-cancel', jwt), makeEnv(db));
    expect(res.status).toBe(404);
  });

  it('records a revert_cancel history entry in subscription_plan_history', async () => {
    // Use a SQL-capturing mock to verify that recordPlanHistory is called
    // with changeType 'revert_cancel' after a successful revert.
    const capturedSQL: string[] = [];
    const capturedBinds: unknown[][] = [];
    const sub = makeActiveSub({ cancel_at_period_end: 1 });

    const db = {
      prepare: vi.fn().mockImplementation((sql: string) => {
        capturedSQL.push(sql);
        const binds: unknown[] = [];
        const stmt = {
          bind: vi.fn().mockImplementation((...args: unknown[]) => {
            binds.push(...args);
            capturedBinds.push(binds);
            return stmt;
          }),
          first: vi.fn().mockResolvedValue(sub),
          run: vi.fn().mockResolvedValue({ success: true }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        };
        return stmt;
      }),
      batch: vi.fn().mockResolvedValue([{ results: [] }]),
    };

    const jwt = await makeJwt('ws_001');
    const res = await app.fetch(post('/billing/revert-cancel', jwt), makeEnv(db));

    expect(res.status).toBe(200);

    // Verify the INSERT into subscription_plan_history was prepared
    const historyInsert = capturedSQL.find(
      (s) => s.includes('subscription_plan_history') && s.trim().toUpperCase().startsWith('INSERT'),
    );
    expect(historyInsert).toBeDefined();

    // Verify the change_type bound was 'revert_cancel'
    const revertCancelBound = capturedBinds.some((binds) =>
      binds.includes('revert_cancel'),
    );
    expect(revertCancelBound).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST /billing/reactivate
// ---------------------------------------------------------------------------

describe('POST /billing/reactivate', () => {
  it('200 with "already active" message when subscription is active', async () => {
    const jwt = await makeJwt('ws_001');
    const res = await app.fetch(post('/billing/reactivate', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.message).toMatch(/already active/i);
  });

  it('402 when suspended and no recent payment', async () => {
    const jwt = await makeJwt('ws_001');
    const db = makeDB({
      firstValues: [
        makeActiveSub({ status: 'suspended', enforcement_status: 'suspended' }),
        null, // billing_history query returns null
      ],
    });
    const res = await app.fetch(post('/billing/reactivate', jwt), makeEnv(db));
    expect(res.status).toBe(402);
    const body = await res.json() as Record<string, unknown>;
    expect(body.code).toBe('PAYMENT_REQUIRED');
  });

  it('404 when no subscription found', async () => {
    const jwt = await makeJwt('ws_002', 'tnt_002');
    const db = makeDB({ firstValues: [null, null] });
    const res = await app.fetch(post('/billing/reactivate', jwt), makeEnv(db));
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// GET /billing/history
// ---------------------------------------------------------------------------

describe('GET /billing/history', () => {
  it('returns paginated plan change history — T3 scoped', async () => {
    const jwt = await makeJwt('ws_001');
    const historyRows = [
      {
        id: 'sph_001', subscription_id: 'sub_001', changed_by: 'usr_001',
        previous_plan: 'starter', new_plan: 'growth', change_type: 'upgrade',
        effective_at: NOW - 3600, created_at: NOW - 3600, notes: null,
      },
    ];
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: historyRows }),
          run: vi.fn().mockResolvedValue({ success: true }),
        }),
      }),
      batch: vi.fn().mockResolvedValue([{ results: [] }]),
    };
    const res = await app.fetch(get('/billing/history', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body.data)).toBe(true);
    const rows = body.data as Array<Record<string, unknown>>;
    expect(rows.length).toBe(1);
    expect(rows[0]?.change_type).toBe('upgrade');
  });

  it('returns empty array when no history', async () => {
    const jwt = await makeJwt('ws_002', 'tnt_002');
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
      }),
      batch: vi.fn().mockResolvedValue([{ results: [] }]),
    };
    const res = await app.fetch(get('/billing/history', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect((body.data as unknown[]).length).toBe(0);
  });

  it('returns correct limit and offset in response', async () => {
    const jwt = await makeJwt('ws_001');
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
      }),
      batch: vi.fn().mockResolvedValue([{ results: [] }]),
    };
    const res = await app.fetch(get('/billing/history?limit=5&offset=10', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.limit).toBe(5);
    expect(body.offset).toBe(10);
  });

  it('caps limit at 100', async () => {
    const jwt = await makeJwt('ws_001');
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
      }),
      batch: vi.fn().mockResolvedValue([{ results: [] }]),
    };
    const res = await app.fetch(get('/billing/history?limit=500', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.limit).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// T3 tenant isolation
// ---------------------------------------------------------------------------

describe('Billing — T3 tenant isolation', () => {
  it('JWT tenant_id is reflected in billing status response', async () => {
    const jwtA = await makeJwt('ws_001', 'tnt_A', 'owner', 'usr_A');
    const db = makeDB({ firstValues: [makeActiveSub({ tenant_id: 'tnt_A', workspace_id: 'ws_001' })] });
    const res = await app.fetch(get('/billing/status', jwtA), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.tenantId).toBe('tnt_A');
  });

  it('401 when JWT is expired', async () => {
    const now = Math.floor(Date.now() / 1000);
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const payload = btoa(JSON.stringify({
      sub: 'usr_001',
      workspace_id: 'ws_001',
      tenant_id: 'tnt_001',
      role: 'owner',
      iat: now - 7200,
      exp: now - 3600, // expired 1 hour ago
    })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const input = `${header}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input));
    const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const expiredJwt = `${input}.${signature}`;
    const res = await app.fetch(get('/billing/status', expiredJwt), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('401 when JWT has invalid signature', async () => {
    const jwt = await makeJwt('ws_001');
    const tampered = jwt.slice(0, -5) + 'XXXXX';
    const res = await app.fetch(get('/billing/status', tampered), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });
});
