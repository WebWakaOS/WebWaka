/**
 * Control Plane — Integration Smoke Tests
 *
 * Spins up a minimal Hono router that wires the real production middleware
 * (requireRole, auditLogMiddleware) and all 6 CP route files against an
 * in-memory stub D1/KV binding.
 *
 * Each test suite covers two concerns:
 *   1. Auth enforcement  — 401 (no auth), 403 (admin role) before the handler runs
 *   2. Handler smoke     — super_admin gets correct HTTP status codes; stub DB
 *                          returns a MOCK_ROW for every `.first()` so services
 *                          that re-fetch after insert/update don't throw.
 *
 * The test middleware replaces authMiddleware to avoid JWT verification while
 * keeping the real requireRole('super_admin') enforcement fully exercised.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { requireRole } from '../../middleware/require-role.js';
import { auditLogMiddleware } from '../../middleware/audit-log.js';
import { planRoutes } from '../../routes/control-plane/plans.js';
import { entitlementRoutes } from '../../routes/control-plane/entitlements.js';
import { roleRoutes } from '../../routes/control-plane/roles.js';
import { groupRoutes } from '../../routes/control-plane/groups.js';
import { flagRoutes } from '../../routes/control-plane/flags.js';
import { auditRoutes } from '../../routes/control-plane/audit.js';

// ── Stub DB ──────────────────────────────────────────────────────────────────
//
// all()  → always returns empty array (list endpoints return [] results)
// run()  → always succeeds (INSERT / UPDATE / DELETE are no-ops)
// first() → returns MOCK_ROW so services that re-fetch after write don't throw

const MOCK_ROW = {
  id: 'mock-id',
  slug: 'mock',
  name: 'Mock',
  code: 'mock',
  description: null,
  status: 'active',
  is_active: 1,
  is_public: 1,
  sort_order: 0,
  value: 'false',
  default_value: 'false',
  value_type: 'boolean',
  granted: 1,
  created_at: 0,
  updated_at: 0,
  min_scope: 'global',
  grantor_level: 'super_admin',
  grantee_level: 'tenant_admin',
  capability: 'mock_capability',
  effect: 'allow',
  requires_approval: 0,
  target_audience: null,
  category: null,
  rollout_pct: 100,
  is_kill_switch: 0,
  tenant_id: null,
  workspace_id: null,
  partner_id: null,
  group_type: 'custom',
  base_role: null,
  max_grantable_role: null,
  billing_interval_id: 'mock-interval-id',
  price_kobo: 0,
  currency: 'NGN',
  effective_from: 0,
  trial_days_override: null,
  paystack_plan_code: null,
};

function makeStubD1(): D1Database {
  const stmt = {
    bind: (..._args: unknown[]) => stmt,
    all: <T>() => Promise.resolve({ results: [] as T[], success: true, meta: {} as D1Meta }),
    run: () => Promise.resolve({ success: true, results: [] as never[], meta: {} as D1Meta }),
    first: <T>(_col?: string) => Promise.resolve(MOCK_ROW as unknown as T),
    raw: <T>() => Promise.resolve([] as T[]),
  } as unknown as D1PreparedStatement;

  return {
    prepare: (_sql: string) => stmt,
    batch: <T>(_stmts: D1PreparedStatement[]) => Promise.resolve([] as D1Result<T>[]),
    exec: (_q: string) => Promise.resolve({ count: 0, duration: 0 }),
    dump: () => Promise.resolve(new ArrayBuffer(0)),
  } as unknown as D1Database;
}

// ── Stub KV ──────────────────────────────────────────────────────────────────

function makeStubKV(): KVNamespace {
  const store = new Map<string, string>();
  return {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => { store.set(key, value); },
    delete: async (key: string) => { store.delete(key); },
    list: async () => ({ keys: [], list_complete: true, cursor: '' }),
    getWithMetadata: async () => ({ value: null, metadata: null }),
  } as unknown as KVNamespace;
}

// ── Test Env ─────────────────────────────────────────────────────────────────

function makeTestEnv(): Env {
  return {
    DB: makeStubD1(),
    KV: makeStubKV(),
    RATE_LIMIT_KV: makeStubKV(),
    GEOGRAPHY_CACHE: makeStubKV(),
    ENVIRONMENT: 'development',
    JWT_SECRET: 'test-secret',
    PREMBLY_API_KEY: 'test',
    TERMII_API_KEY: 'test',
    WHATSAPP_ACCESS_TOKEN: 'test',
    WHATSAPP_PHONE_NUMBER_ID: 'test',
    TELEGRAM_BOT_TOKEN: 'test',
    LOG_PII_SALT: 'test-salt',
  } as unknown as Env;
}

// ── Minimal CP test app ──────────────────────────────────────────────────────
//
// Middleware chain mirrors production (register-admin-routes.ts):
//   testAuthMiddleware → requireRole('super_admin') → auditLogMiddleware → routes
//
// testAuthMiddleware reads X-Test-Role and injects auth context directly,
// bypassing JWT verification while keeping requireRole enforcement intact.
// Requests with no X-Test-Role header have no auth set → requireRole returns 401.

function makeTestApp() {
  const app = new Hono<{ Bindings: Env }>();

  app.use('/platform-admin/cp/*', async (c, next) => {
    const role = c.req.header('X-Test-Role');
    if (role) {
      c.set('auth', {
        userId: 'usr_smoke',
        workspaceId: 'ws_smoke',
        tenantId: 'tnt_smoke',
        role,
      } as never);
    }
    await next();
  });

  app.use('/platform-admin/cp/*', requireRole('super_admin'));
  app.use('/platform-admin/cp/*', auditLogMiddleware);

  app.route('/platform-admin/cp/plans', planRoutes);
  app.route('/platform-admin/cp/entitlements', entitlementRoutes);
  app.route('/platform-admin/cp/roles', roleRoutes);
  app.route('/platform-admin/cp/groups', groupRoutes);
  app.route('/platform-admin/cp/flags', flagRoutes);
  app.route('/platform-admin/cp/audit', auditRoutes);

  return app;
}

// ── Request helpers ───────────────────────────────────────────────────────────

type App = ReturnType<typeof makeTestApp>;

function req(
  app: App,
  method: string,
  path: string,
  body?: unknown,
  role?: string,
) {
  const env = makeTestEnv();
  const headers: Record<string, string> = {};
  if (role) headers['X-Test-Role'] = role;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  return app.request(
    path,
    {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    env as unknown as Env,
  );
}

const SA = 'super_admin';

// ─────────────────────────────────────────────────────────────────────────────
// Middleware enforcement — every CP sub-path must gate on requireRole
// ─────────────────────────────────────────────────────────────────────────────

describe('CP smoke — requireRole(super_admin) enforcement', () => {
  let app: App;
  beforeEach(() => { app = makeTestApp(); });

  const probes = [
    '/platform-admin/cp/plans',
    '/platform-admin/cp/entitlements',
    '/platform-admin/cp/roles',
    '/platform-admin/cp/groups',
    '/platform-admin/cp/flags',
    '/platform-admin/cp/audit',
  ];

  for (const path of probes) {
    it(`401 unauthenticated — GET ${path}`, async () => {
      const res = await req(app, 'GET', path);
      expect(res.status).toBe(401);
      const body = await res.json() as { error: string };
      expect(body.error).toMatch(/authentication required/i);
    });

    it(`403 role=admin — GET ${path}`, async () => {
      const res = await req(app, 'GET', path, undefined, 'admin');
      expect(res.status).toBe(403);
      const body = await res.json() as { code: string };
      expect(body.code).toBe('FORBIDDEN');
    });
  }

  it('403 role=user on POST /plans', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/plans', { slug: 'x', name: 'X' }, 'user');
    expect(res.status).toBe(403);
  });

  it('401 unauthenticated on POST /flags', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/flags', { code: 'f', name: 'F' });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Plans
// ─────────────────────────────────────────────────────────────────────────────

describe('CP smoke — plans routes', () => {
  let app: App;
  beforeEach(() => { app = makeTestApp(); });

  it('GET /plans → 200 with results array', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/plans', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[] };
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('GET /plans?status=active → 200', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/plans?status=active', undefined, SA);
    expect(res.status).toBe(200);
  });

  it('GET /plans/billing-intervals → 200 with results array', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/plans/billing-intervals', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[] };
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('GET /plans/:id → 200 (stub returns mock row)', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/plans/pkg_any', undefined, SA);
    expect(res.status).toBe(200);
  });

  it('POST /plans with valid body → 201', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/plans', { slug: 'starter', name: 'Starter Plan' }, SA);
    expect(res.status).toBe(201);
  });

  it('POST /plans missing slug → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/plans', { name: 'No Slug' }, SA);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/slug.*name|required/i);
  });

  it('POST /plans missing name → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/plans', { slug: 'no-name' }, SA);
    expect(res.status).toBe(400);
  });

  it('PATCH /plans/:id → 200', async () => {
    const res = await req(app, 'PATCH', '/platform-admin/cp/plans/pkg_x', { name: 'Updated' }, SA);
    expect(res.status).toBe(200);
  });

  it('POST /plans/:id/activate → 200', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/plans/pkg_x/activate', {}, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('POST /plans/:id/deactivate → 200', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/plans/pkg_x/deactivate', {}, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('POST /plans/:id/archive → 200', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/plans/pkg_x/archive', {}, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('GET /plans/:id/pricing → 200', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/plans/pkg_x/pricing', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[] };
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('PUT /plans/:id/pricing → 200', async () => {
    const res = await req(app, 'PUT', '/platform-admin/cp/plans/pkg_x/pricing', {
      billing_interval_id: 'bi_monthly',
      price_kobo: 500000,
    }, SA);
    expect(res.status).toBe(200);
  });

  it('PUT /plans/:id/pricing missing fields → 400', async () => {
    const res = await req(app, 'PUT', '/platform-admin/cp/plans/pkg_x/pricing', { price_kobo: 500000 }, SA);
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Entitlements
// ─────────────────────────────────────────────────────────────────────────────

describe('CP smoke — entitlements routes', () => {
  let app: App;
  beforeEach(() => { app = makeTestApp(); });

  it('GET /entitlements → 200 with results array', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/entitlements', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[] };
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('POST /entitlements with valid body → 201', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/entitlements', {
      code: 'max_users', name: 'Max Users',
    }, SA);
    expect(res.status).toBe(201);
  });

  it('POST /entitlements missing code → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/entitlements', { name: 'No Code' }, SA);
    expect(res.status).toBe(400);
  });

  it('POST /entitlements missing name → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/entitlements', { code: 'no_name' }, SA);
    expect(res.status).toBe(400);
  });

  it('PATCH /entitlements/:id → 200', async () => {
    const res = await req(app, 'PATCH', '/platform-admin/cp/entitlements/ent_x', {
      name: 'Updated Entitlement',
    }, SA);
    expect(res.status).toBe(200);
  });

  it('GET /entitlements/packages/:pkgId → 200', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/entitlements/packages/pkg_x', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[] };
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('PUT /entitlements/packages/:pkgId/:entId → 200', async () => {
    const res = await req(app, 'PUT', '/platform-admin/cp/entitlements/packages/pkg_x/ent_y', {
      value: '10',
    }, SA);
    expect(res.status).toBe(200);
  });

  it('PUT /entitlements/packages/:pkgId/:entId missing value → 400', async () => {
    const res = await req(app, 'PUT', '/platform-admin/cp/entitlements/packages/pkg_x/ent_y', {}, SA);
    expect(res.status).toBe(400);
  });

  it('DELETE /entitlements/packages/:pkgId/:entId → 200', async () => {
    const res = await req(app, 'DELETE', '/platform-admin/cp/entitlements/packages/pkg_x/ent_y', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('GET /entitlements/workspaces/:wId → 200', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/entitlements/workspaces/ws_x', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { workspace_id: string };
    expect(body.workspace_id).toBe('ws_x');
  });

  it('PUT /entitlements/workspaces/:wId/:entId → 200', async () => {
    const res = await req(app, 'PUT', '/platform-admin/cp/entitlements/workspaces/ws_x/ent_y', {
      value: '5',
    }, SA);
    expect(res.status).toBe(200);
  });

  it('PUT /entitlements/workspaces/:wId/:entId missing value → 400', async () => {
    const res = await req(app, 'PUT', '/platform-admin/cp/entitlements/workspaces/ws_x/ent_y', {}, SA);
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Roles & Permissions
// ─────────────────────────────────────────────────────────────────────────────

describe('CP smoke — roles routes', () => {
  let app: App;
  beforeEach(() => { app = makeTestApp(); });

  it('GET /roles → 200 with results array', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/roles', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[] };
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('GET /roles/permissions → 200 with results array', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/roles/permissions', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[] };
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('POST /roles with valid body → 201', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/roles', {
      code: 'tenant_owner', name: 'Tenant Owner',
    }, SA);
    expect(res.status).toBe(201);
  });

  it('POST /roles missing code → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/roles', { name: 'No Code' }, SA);
    expect(res.status).toBe(400);
  });

  it('POST /roles missing name → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/roles', { code: 'no_name' }, SA);
    expect(res.status).toBe(400);
  });

  it('GET /roles/:id → 200 (stub returns mock row)', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/roles/role_x', undefined, SA);
    expect(res.status).toBe(200);
  });

  it('POST /roles/:id/permissions with valid array → 200', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/roles/role_x/permissions', {
      permission_ids: ['perm_a', 'perm_b'],
    }, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('POST /roles/:id/permissions missing array → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/roles/role_x/permissions', {
      permission_ids: 'not-an-array',
    }, SA);
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Groups & Per-User Overrides
// ─────────────────────────────────────────────────────────────────────────────

describe('CP smoke — groups routes', () => {
  let app: App;
  beforeEach(() => { app = makeTestApp(); });

  it('GET /groups → 200 with results array', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/groups', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[] };
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('POST /groups with valid body → 201', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/groups', { name: 'Power Users' }, SA);
    expect(res.status).toBe(201);
  });

  it('POST /groups missing name → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/groups', {}, SA);
    expect(res.status).toBe(400);
  });

  it('POST /groups/:id/members → 200', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/groups/grp_x/members', {
      user_id: 'usr_y',
    }, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('POST /groups/:id/members missing user_id → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/groups/grp_x/members', {}, SA);
    expect(res.status).toBe(400);
  });

  it('DELETE /groups/:id/members/:uid → 200', async () => {
    const res = await req(app, 'DELETE', '/platform-admin/cp/groups/grp_x/members/usr_y', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('POST /groups/:id/roles → 200', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/groups/grp_x/roles', {
      role_id: 'role_z',
    }, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('POST /groups/:id/roles missing role_id → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/groups/grp_x/roles', {}, SA);
    expect(res.status).toBe(400);
  });

  it('GET /groups/users/:uid/permissions → 200', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/groups/users/usr_x/permissions', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { user_id: string; granted: unknown[]; denied: unknown[] };
    expect(body.user_id).toBe('usr_x');
    expect(Array.isArray(body.granted)).toBe(true);
    expect(Array.isArray(body.denied)).toBe(true);
  });

  it('POST /groups/users/:uid/overrides → 200', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/groups/users/usr_x/overrides', {
      permission_id: 'perm_a',
      granted: true,
    }, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('POST /groups/users/:uid/overrides missing granted → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/groups/users/usr_x/overrides', {
      permission_id: 'perm_a',
    }, SA);
    expect(res.status).toBe(400);
  });

  it('POST /groups/users/:uid/overrides missing permission_id → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/groups/users/usr_x/overrides', {
      granted: true,
    }, SA);
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Feature Flags & Delegation
// ─────────────────────────────────────────────────────────────────────────────

describe('CP smoke — flags routes', () => {
  let app: App;
  beforeEach(() => { app = makeTestApp(); });

  it('GET /flags → 200 with results array', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/flags', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[] };
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('GET /flags?category=billing → 200', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/flags?category=billing', undefined, SA);
    expect(res.status).toBe(200);
  });

  it('GET /flags/resolve → 200 with flags object', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/flags/resolve', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { flags: unknown };
    expect(body).toHaveProperty('flags');
  });

  it('GET /flags/:id → 200 (stub returns mock row)', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/flags/flag_x', undefined, SA);
    expect(res.status).toBe(200);
  });

  it('POST /flags with valid body → 201', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/flags', {
      code: 'feature_x', name: 'Feature X',
    }, SA);
    expect(res.status).toBe(201);
  });

  it('POST /flags missing code → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/flags', { name: 'No Code' }, SA);
    expect(res.status).toBe(400);
  });

  it('POST /flags missing name → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/flags', { code: 'no_name' }, SA);
    expect(res.status).toBe(400);
  });

  it('PATCH /flags/:id → 200', async () => {
    const res = await req(app, 'PATCH', '/platform-admin/cp/flags/flag_x', { name: 'Updated' }, SA);
    expect(res.status).toBe(200);
  });

  it('PUT /flags/:id/override with valid body → 200', async () => {
    const res = await req(app, 'PUT', '/platform-admin/cp/flags/flag_x/override', {
      scope: 'tenant', scope_id: 'tnt_x', value: 'true',
    }, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('PUT /flags/:id/override missing scope_id → 400', async () => {
    const res = await req(app, 'PUT', '/platform-admin/cp/flags/flag_x/override', {
      scope: 'tenant',
    }, SA);
    expect(res.status).toBe(400);
  });

  it('DELETE /flags/:id/override → 200', async () => {
    const res = await req(app, 'DELETE', '/platform-admin/cp/flags/flag_x/override', {
      scope: 'tenant', scope_id: 'tnt_x',
    }, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('GET /flags/delegation/capabilities → 200', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/flags/delegation/capabilities', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[] };
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('GET /flags/delegation/policies → 200', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/flags/delegation/policies', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[] };
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('POST /flags/delegation/policies with valid body → 201', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/flags/delegation/policies', {
      grantor_level: 'super_admin',
      grantee_level: 'tenant_admin',
      capability: 'manage_flags',
    }, SA);
    expect(res.status).toBe(201);
  });

  it('POST /flags/delegation/policies missing grantee_level → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/flags/delegation/policies', {
      grantor_level: 'super_admin',
      capability: 'manage_flags',
    }, SA);
    expect(res.status).toBe(400);
  });

  it('POST /flags/delegation/policies missing capability → 400', async () => {
    const res = await req(app, 'POST', '/platform-admin/cp/flags/delegation/policies', {
      grantor_level: 'super_admin',
      grantee_level: 'tenant_admin',
    }, SA);
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log (read-only)
// ─────────────────────────────────────────────────────────────────────────────

describe('CP smoke — audit routes', () => {
  let app: App;
  beforeEach(() => { app = makeTestApp(); });

  it('GET /audit → 200 with results array', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/audit', undefined, SA);
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[] };
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('GET /audit?resource_type=flag → 200', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/audit?resource_type=flag', undefined, SA);
    expect(res.status).toBe(200);
  });

  it('GET /audit?limit=10&offset=0 → 200', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/audit?limit=10&offset=0', undefined, SA);
    expect(res.status).toBe(200);
  });

  it('GET /audit unauthenticated → 401', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/audit');
    expect(res.status).toBe(401);
  });

  it('GET /audit role=admin → 403', async () => {
    const res = await req(app, 'GET', '/platform-admin/cp/audit', undefined, 'admin');
    expect(res.status).toBe(403);
  });
});
