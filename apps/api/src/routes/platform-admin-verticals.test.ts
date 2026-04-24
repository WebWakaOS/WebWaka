/**
 * Platform-admin vertical FSM routes — M8b test suite
 *
 * Covers:
 *   GET  /platform-admin/verticals                          (cross-workspace list)
 *   GET  /platform-admin/verticals/:workspaceId             (workspace detail, 404)
 *   POST /platform-admin/verticals/:workspaceId/:slug/claim       (insert claimed, idempotent)
 *   POST /platform-admin/verticals/:workspaceId/:slug/activate    (claimed→active, FSM, unmet)
 *   POST /platform-admin/verticals/:workspaceId/:slug/suspend     (active|claimed→suspended)
 *   POST /platform-admin/verticals/:workspaceId/:slug/reinstate   (suspended→active)
 *   POST /platform-admin/verticals/:workspaceId/:slug/deprecate   (any→deprecated, including claimed→deprecated)
 *   Auth enforcement (401) and role enforcement (403)
 *
 * Query call order per route (important for firstValues mock):
 *   claim:      ws → getVerticalBySlug (verticals table) → getVerticalRow
 *   activate:   ws → getVerticalBySlug (verticals table) → getVerticalRow
 *   suspend:    ws → getVerticalRow          (no getVerticalBySlug)
 *   reinstate:  ws → getVerticalBySlug (verticals table) → getVerticalRow
 *   deprecate:  ws → getVerticalRow          (no getVerticalBySlug)
 */

import { describe, it, expect, vi } from 'vitest';
import app from '../index.js';
import type { Env } from '../env.js';

const JWT_SECRET = 'test-jwt-secret-minimum-32-characters!';
const BASE       = 'http://localhost';

// ---------------------------------------------------------------------------
// JWT factory
// ---------------------------------------------------------------------------

async function makeJwt(
  workspaceId: string,
  tenantId  = 'tnt_001',
  role      = 'super_admin',
  userId    = 'usr_admin_001',
): Promise<string> {
  const now     = Math.floor(Date.now() / 1000);
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
  // BUG-003 fix: test requests are M2M callers — send X-CSRF-Intent: m2m
  return new Request(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Intent': 'm2m',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : '{}',
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = Math.floor(Date.now() / 1000);

function makeWorkspace(overrides: Record<string, unknown> = {}) {
  return {
    id:            'ws_001',
    tenant_id:     'tnt_001',
    owner_id:      'usr_001',
    kyc_tier:      2,
    frsc_verified: 0,
    cac_verified:  1,
    it_verified:   0,
    name:          'Test Workspace',
    ...overrides,
  };
}

function makeVerticalRecord(overrides: Record<string, unknown> = {}) {
  return {
    slug:              'barbershop',
    display_name:      'Barbershop',
    category:          'commerce',
    priority:          1,
    status:            'active',
    required_kyc_tier: 1,
    requires_frsc:     0,
    requires_cac:      0,
    requires_it:       0,
    requires_community: 0,
    requires_social:   0,
    ...overrides,
  };
}

function makeWorkspaceVertical(overrides: Record<string, unknown> = {}) {
  return {
    id:            'wv_001',
    workspace_id:  'ws_001',
    tenant_id:     'tnt_001',
    vertical_slug: 'barbershop',
    state:         'claimed',
    activated_at:  null,
    suspended_at:  null,
    created_at:    NOW - 3600,
    updated_at:    NOW - 3600,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// DB mock (sequential firstValues + shared allResults)
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
    KV:            { get: vi.fn().mockResolvedValue(null), put: vi.fn(), delete: vi.fn() } as unknown as KVNamespace,
    RATE_LIMIT_KV: { get: vi.fn().mockResolvedValue(null), put: vi.fn(), delete: vi.fn() } as unknown as KVNamespace,
    ASSETS: undefined as unknown as R2Bucket,
  } as unknown as Env;
}

const BASE_PATH = '/platform-admin/verticals';
const WS_ID     = 'ws_001';
const SLUG      = 'barbershop';

// ---------------------------------------------------------------------------
// Auth enforcement
// ---------------------------------------------------------------------------

describe('Platform-admin verticals — auth enforcement', () => {
  it('GET /platform-admin/verticals → 401 without JWT', async () => {
    const res = await app.fetch(get(BASE_PATH), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('GET /platform-admin/verticals/:workspaceId → 401 without JWT', async () => {
    const res = await app.fetch(get(`${BASE_PATH}/${WS_ID}`), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('POST claim → 401 without JWT', async () => {
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/claim`), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('POST activate → 401 without JWT', async () => {
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/activate`), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('POST deprecate → 401 without JWT', async () => {
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/deprecate`), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Role enforcement — non-super_admin must get 403
// ---------------------------------------------------------------------------

describe('Platform-admin verticals — role enforcement', () => {
  it('GET list → 403 for owner role', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'owner');
    const res = await app.fetch(get(BASE_PATH, jwt), makeEnv(makeDB()));
    expect(res.status).toBe(403);
  });

  it('POST claim → 403 for admin role', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'admin');
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/claim`, jwt), makeEnv(makeDB()));
    expect(res.status).toBe(403);
  });

  it('POST deprecate → 403 for member role', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'member');
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/deprecate`, jwt, { reason: 'Test reason here' }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// GET /platform-admin/verticals
// ---------------------------------------------------------------------------

describe('GET /platform-admin/verticals', () => {
  it('returns cross-workspace vertical list', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ allResults: [{ ...makeWorkspaceVertical(), display_name: 'Barbershop', category: 'commerce', priority: 1 }] });
    const res = await app.fetch(get(BASE_PATH, jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.count).toBe(1);
    expect(Array.isArray(body.verticals)).toBe(true);
    expect(body.filter).toBeDefined();
  });

  it('returns empty list when no verticals exist', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ allResults: [] });
    const res = await app.fetch(get(BASE_PATH, jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.count).toBe(0);
    expect(body.next_cursor).toBeNull();
  });

  it('filters by state query parameter', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ allResults: [] });
    const res = await app.fetch(get(`${BASE_PATH}?state=claimed`, jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect((body.filter as Record<string, unknown>).state).toBe('claimed');
  });

  it('ignores invalid state filter values (no DB filter applied, but echoes raw value in response)', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ allResults: [] });
    const res = await app.fetch(get(`${BASE_PATH}?state=flying`, jwt), makeEnv(db));
    expect(res.status).toBe(200);
    // Route does NOT apply the invalid state to the WHERE clause; it echoes the raw input
    const body = await res.json() as Record<string, unknown>;
    expect((body.filter as Record<string, unknown>).state).toBe('flying');
  });
});

// ---------------------------------------------------------------------------
// GET /platform-admin/verticals/:workspaceId
// ---------------------------------------------------------------------------

describe('GET /platform-admin/verticals/:workspaceId', () => {
  it('returns workspace verticals with verification context', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({
      firstValues: [makeWorkspace()],
      allResults:  [{ ...makeWorkspaceVertical(), display_name: 'Barbershop', category: 'commerce', priority: 1, required_kyc_tier: 1, requires_frsc: 0, requires_cac: 0, requires_it: 0 }],
    });
    const res = await app.fetch(get(`${BASE_PATH}/${WS_ID}`, jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.workspace).toBeDefined();
    expect(body.count).toBe(1);
    expect(Array.isArray(body.verticals)).toBe(true);
  });

  it('returns 404 for unknown workspace', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [null] });
    const res = await app.fetch(get(`${BASE_PATH}/nonexistent`, jwt), makeEnv(db));
    expect(res.status).toBe(404);
  });

  it('returns workspace verification flags in response', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace({ kyc_tier: 2, cac_verified: 1 })], allResults: [] });
    const res = await app.fetch(get(`${BASE_PATH}/${WS_ID}`, jwt), makeEnv(db));
    const body = await res.json() as Record<string, unknown>;
    const ws = body.workspace as Record<string, unknown>;
    expect(ws.kyc_tier).toBe(2);
    expect(ws.cac_verified).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST .../claim
// ---------------------------------------------------------------------------

describe('POST /platform-admin/verticals/:workspaceId/:slug/claim', () => {
  it('returns 404 for unknown workspace', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [null] });
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/claim`, jwt), makeEnv(db));
    expect(res.status).toBe(404);
    const body = await res.json() as Record<string, unknown>;
    expect(String(body.error)).toMatch(/workspace.*not found/i);
  });

  it('returns 404 for unknown vertical slug', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), null] });
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/unknown_slug/claim`, jwt), makeEnv(db));
    expect(res.status).toBe(404);
    const body = await res.json() as Record<string, unknown>;
    expect(String(body.error)).toMatch(/not found/i);
  });

  it('returns 200 idempotent when vertical already claimed', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeVerticalRecord(), makeWorkspaceVertical({ state: 'claimed' })] });
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/claim`, jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.current_state).toBe('claimed');
    expect(String(body.message)).toMatch(/already/i);
  });

  it('creates a new claimed vertical row (201) when not yet registered', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeVerticalRecord(), null] });
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/claim`, jwt), makeEnv(db));
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.state).toBe('claimed');
    expect(body.workspace_id).toBe(WS_ID);
    expect(body.vertical).toBe(SLUG);
    expect(body.id).toBeDefined();
  });

  it('returns 200 idempotent when vertical already active', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeVerticalRecord(), makeWorkspaceVertical({ state: 'active' })] });
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/claim`, jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.current_state).toBe('active');
  });
});

// ---------------------------------------------------------------------------
// POST .../activate
// ---------------------------------------------------------------------------

describe('POST /platform-admin/verticals/:workspaceId/:slug/activate', () => {
  it('returns 404 for unknown workspace', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [null] });
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/activate`, jwt), makeEnv(db));
    expect(res.status).toBe(404);
  });

  it('returns 200 when vertical is already active (idempotent)', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeVerticalRecord(), makeWorkspaceVertical({ state: 'active' })] });
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/activate`, jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(String(body.message ?? body.state)).toMatch(/already|active/i);
  });

  it('activates a claimed vertical when requirements are met', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const ws  = makeWorkspace({ kyc_tier: 2, cac_verified: 0, frsc_verified: 0, it_verified: 0 });
    const vert = makeVerticalRecord({ required_kyc_tier: 1, requires_frsc: 0, requires_cac: 0, requires_it: 0 });
    const row  = makeWorkspaceVertical({ state: 'claimed' });
    const db   = makeDB({ firstValues: [ws, vert, row] });
    const res  = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/activate`, jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.state).toBe('active');
    expect(body.workspace_id).toBe(WS_ID);
  });

  it('returns 422 when unmet requirements and no force flag', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const ws  = makeWorkspace({ kyc_tier: 0 });  // KYC tier too low
    const vert = makeVerticalRecord({ required_kyc_tier: 2 });
    const row  = makeWorkspaceVertical({ state: 'claimed' });
    const db   = makeDB({ firstValues: [ws, vert, row] });
    const res  = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/activate`, jwt), makeEnv(db));
    expect(res.status).toBe(422);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe('ENTITLEMENT_REQUIREMENTS_UNMET');
    expect(Array.isArray(body.unmet_requirements)).toBe(true);
    expect((body.unmet_requirements as string[]).length).toBeGreaterThan(0);
    expect(String(body.hint)).toMatch(/force.*true/i);
  });

  it('activates with force=true even when requirements are unmet', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const ws  = makeWorkspace({ kyc_tier: 0 });
    const vert = makeVerticalRecord({ required_kyc_tier: 2, requires_frsc: 1 });
    const row  = makeWorkspaceVertical({ state: 'claimed' });
    const db   = makeDB({ firstValues: [ws, vert, row] });
    const res  = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/activate`, jwt, { force: true }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.state).toBe('active');
    expect(body.forced).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST .../suspend
// ---------------------------------------------------------------------------

describe('POST /platform-admin/verticals/:workspaceId/:slug/suspend', () => {
  it('returns 400 when reason is missing', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeWorkspaceVertical({ state: 'active' })] });
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/suspend`, jwt, {}), makeEnv(db));
    expect(res.status).toBe(400);
  });

  it('returns 400 when reason is too short', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeWorkspaceVertical({ state: 'active' })] });
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/suspend`, jwt, { reason: 'ok' }), makeEnv(db));
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown workspace', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [null] });
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/suspend`, jwt, { reason: 'Compliance violation' }),
      makeEnv(db),
    );
    expect(res.status).toBe(404);
  });

  it('returns 404 for unregistered vertical', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), null] });
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/suspend`, jwt, { reason: 'Compliance issue found' }),
      makeEnv(db),
    );
    expect(res.status).toBe(404);
  });

  it('returns 200 idempotent when vertical is already suspended', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeWorkspaceVertical({ state: 'suspended' })] });
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/suspend`, jwt, { reason: 'Compliance violation found' }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.state).toBe('suspended');
  });

  it('returns 409 when trying to suspend a deprecated vertical', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeWorkspaceVertical({ state: 'deprecated' })] });
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/suspend`, jwt, { reason: 'Compliance violation found' }),
      makeEnv(db),
    );
    expect(res.status).toBe(409);
  });

  it('successfully suspends an active vertical', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeWorkspaceVertical({ state: 'active' })] });
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/suspend`, jwt, { reason: 'Compliance violation found' }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.state).toBe('suspended');
    expect(body.workspace_id).toBe(WS_ID);
    expect(body.reason).toBe('Compliance violation found');
  });

  it('successfully suspends a claimed vertical (pre-activation hold)', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeWorkspaceVertical({ state: 'claimed' })] });
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/suspend`, jwt, { reason: 'Fraudulent documents submitted' }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.state).toBe('suspended');
  });
});

// ---------------------------------------------------------------------------
// POST .../reinstate
// ---------------------------------------------------------------------------

describe('POST /platform-admin/verticals/:workspaceId/:slug/reinstate', () => {
  it('returns 404 for unknown workspace', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [null] });
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/reinstate`, jwt), makeEnv(db));
    expect(res.status).toBe(404);
  });

  it('returns 409 when vertical is not suspended (e.g. active)', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeVerticalRecord(), makeWorkspaceVertical({ state: 'active' })] });
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/reinstate`, jwt), makeEnv(db));
    expect(res.status).toBe(409);
    const body = await res.json() as Record<string, unknown>;
    expect(String(body.error)).toMatch(/suspended/i);
  });

  it('reinstates a suspended vertical when requirements are met', async () => {
    const jwt  = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const ws   = makeWorkspace({ kyc_tier: 2, cac_verified: 0, frsc_verified: 0, it_verified: 0 });
    const vert = makeVerticalRecord({ required_kyc_tier: 1, requires_frsc: 0, requires_cac: 0, requires_it: 0 });
    const row  = makeWorkspaceVertical({ state: 'suspended' });
    const db   = makeDB({ firstValues: [ws, vert, row] });
    const res  = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/reinstate`, jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.state).toBe('active');
    expect(body.workspace_id).toBe(WS_ID);
  });

  it('reinstates with force=true even when requirements are unmet', async () => {
    const jwt  = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const ws   = makeWorkspace({ kyc_tier: 0 });
    const vert = makeVerticalRecord({ required_kyc_tier: 2, requires_frsc: 1 });
    const row  = makeWorkspaceVertical({ state: 'suspended' });
    const db   = makeDB({ firstValues: [ws, vert, row] });
    const res  = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/reinstate`, jwt, { force: true }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.state).toBe('active');
  });
});

// ---------------------------------------------------------------------------
// POST .../deprecate
// ---------------------------------------------------------------------------

describe('POST /platform-admin/verticals/:workspaceId/:slug/deprecate', () => {
  it('returns 400 when reason is missing', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeWorkspaceVertical({ state: 'active' })] });
    const res = await app.fetch(post(`${BASE_PATH}/${WS_ID}/${SLUG}/deprecate`, jwt, {}), makeEnv(db));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(String(body.error)).toMatch(/reason/i);
  });

  it('returns 404 for unknown workspace', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [null] });
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/deprecate`, jwt, { reason: 'Workspace decommissioned' }),
      makeEnv(db),
    );
    expect(res.status).toBe(404);
  });

  it('returns 404 for unregistered vertical', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), null] });
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/deprecate`, jwt, { reason: 'Workspace decommissioned' }),
      makeEnv(db),
    );
    expect(res.status).toBe(404);
  });

  it('returns 200 idempotent when already deprecated', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeWorkspaceVertical({ state: 'deprecated' })] });
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/deprecate`, jwt, { reason: 'Workspace decommissioned' }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.state).toBe('deprecated');
  });

  it('deprecates an active vertical (active → deprecated)', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeWorkspaceVertical({ state: 'active' })] });
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/deprecate`, jwt, { reason: 'Business permanently closed' }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.state).toBe('deprecated');
    expect(body.reason).toBe('Business permanently closed');
    expect(String(body.message)).toMatch(/irreversible|cannot be reversed/i);
  });

  it('deprecates a suspended vertical (suspended → deprecated)', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeWorkspaceVertical({ state: 'suspended' })] });
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/deprecate`, jwt, { reason: 'Fraud confirmed, permanent ban' }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.state).toBe('deprecated');
  });

  it('deprecates a claimed vertical (claimed → deprecated — NEW FSM TRANSITION)', async () => {
    const jwt = await makeJwt(WS_ID, 'tnt_001', 'super_admin');
    const db  = makeDB({ firstValues: [makeWorkspace(), makeWorkspaceVertical({ state: 'claimed' })] });
    const res = await app.fetch(
      post(`${BASE_PATH}/${WS_ID}/${SLUG}/deprecate`, jwt, { reason: 'KYC documents rejected permanently' }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.state).toBe('deprecated');
    expect(body.vertical).toBe(SLUG);
  });
});
