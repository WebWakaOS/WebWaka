/**
 * Sprint 7 — Product Foundation Tests
 *
 * PROD-01: Tenant onboarding checklist (8 tests)
 * PROD-07: Template version upgrade path (7 tests)
 * PROD-09: Billing enforcement engine (10 tests)
 *
 * 25 tests total
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { onboardingRoutes } from './onboarding.js';
import { templateRoutes } from './templates.js';
import { billingRoutes } from './billing.js';

const JWT_SECRET = 'test-secret-32-chars-minimum-length-required';

interface D1MockRow {
  [key: string]: unknown;
}

function makeDB(tables: Record<string, D1MockRow[]> = {}) {
  return {
    prepare: (sql: string) => {
      const sqlLower = sql.toLowerCase();

      const matchTable = (name: string) => sqlLower.includes(name.toLowerCase());

      const makeBindable = (boundArgs: unknown[]) => ({
        run: () => Promise.resolve({ success: true }),
        first: <T>() => {
          if (sqlLower.includes('count(*)')) {
            for (const [tbl, rows] of Object.entries(tables)) {
              if (matchTable(tbl)) {
                const filtered = rows.filter((r) => {
                  if (boundArgs.length >= 1 && r.workspace_id) return r.workspace_id === boundArgs[0];
                  if (boundArgs.length >= 1 && r.tenant_id) return r.tenant_id === boundArgs[0];
                  return true;
                });
                return Promise.resolve({ cnt: filtered.length } as T);
              }
            }
            return Promise.resolve({ cnt: 0 } as T);
          }

          for (const [tbl, rows] of Object.entries(tables)) {
            if (!matchTable(tbl)) continue;
            if (rows.length === 0) return Promise.resolve(null as T);

            for (const row of rows) {
              for (const arg of boundArgs) {
                if (Object.values(row).includes(arg)) return Promise.resolve(row as T);
              }
            }
            return Promise.resolve(rows[0] as T);
          }
          return Promise.resolve(null as T);
        },
        all: <T>() => {
          for (const [tbl, rows] of Object.entries(tables)) {
            if (matchTable(tbl)) {
              return Promise.resolve({ results: rows as T[] });
            }
          }
          return Promise.resolve({ results: [] as T[] });
        },
      });

      return {
        bind: (...args: unknown[]) => makeBindable(args),
        run: () => Promise.resolve({ success: true }),
        first: <T>() => Promise.resolve(null as T),
        all: <T>() => Promise.resolve({ results: [] as T[] }),
      };
    },
    batch: (stmts: unknown[]) => Promise.resolve(stmts.map(() => ({ success: true }))),
  };
}

function makeAuth(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'usr_001',
    tenantId: 'tnt_001',
    workspaceId: 'wsp_001',
    role: 'admin',
    ...overrides,
  };
}

type HonoEnv = { Bindings: { DB: ReturnType<typeof makeDB>; JWT_SECRET: string; ENVIRONMENT: string; [k: string]: unknown }; Variables: { [key: string]: unknown } };

function createOnboardingApp(db: ReturnType<typeof makeDB>, authOverrides?: Record<string, unknown>) {
  const app = new Hono<HonoEnv>();
  app.use('*', async (c, next) => {
    c.set('auth', makeAuth(authOverrides));
    await next();
  });
  app.route('/onboarding', onboardingRoutes);
  return { app, env: { DB: db, JWT_SECRET, ENVIRONMENT: 'development' } };
}

function createBillingApp(db: ReturnType<typeof makeDB>, authOverrides?: Record<string, unknown>) {
  const app = new Hono<HonoEnv>();
  app.use('*', async (c, next) => {
    c.set('auth', makeAuth(authOverrides));
    await next();
  });
  app.route('/billing', billingRoutes);
  return { app, env: { DB: db, JWT_SECRET, ENVIRONMENT: 'development' } };
}

function createTemplateApp(db: ReturnType<typeof makeDB>, authOverrides?: Record<string, unknown>) {
  const app = new Hono<HonoEnv>();
  app.use('*', async (c, next) => {
    c.set('auth', makeAuth(authOverrides));
    await next();
  });
  app.route('/templates', templateRoutes);
  return { app, env: { DB: db, JWT_SECRET, ENVIRONMENT: 'development' } };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROD-01: Tenant Onboarding Checklist
// ═══════════════════════════════════════════════════════════════════════════

describe('PROD-01: Tenant onboarding checklist', () => {
  it('GET /onboarding/:workspaceId returns full checklist with 6 steps', async () => {
    const db = makeDB({
      workspaces: [{ id: 'wsp_001', tenant_id: 'tnt_001' }],
      onboarding_progress: [],
    });
    const { app, env } = createOnboardingApp(db);

    const res = await app.request('/onboarding/wsp_001', {}, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { steps: unknown[]; progress: { total: number; completed: number; percentage: number; isComplete: boolean } };
    expect(body.steps).toHaveLength(6);
    expect(body.progress.total).toBe(6);
    expect(body.progress.completed).toBe(0);
    expect(body.progress.percentage).toBe(0);
    expect(body.progress.isComplete).toBe(false);
  });

  it('returns 404 for non-existent workspace', async () => {
    const db = makeDB({ workspaces: [] });
    const { app, env } = createOnboardingApp(db);

    const res = await app.request('/onboarding/wsp_missing', {}, env);
    expect(res.status).toBe(404);
  });

  it('PUT marks step complete', async () => {
    const db = makeDB({
      workspaces: [{ id: 'wsp_001', tenant_id: 'tnt_001' }],
      onboarding_progress: [],
    });
    const { app, env } = createOnboardingApp(db);

    const res = await app.request('/onboarding/wsp_001/profile_setup', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: { business_name: 'Test Corp' } }),
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { step: string; completed: boolean };
    expect(body.step).toBe('profile_setup');
    expect(body.completed).toBe(true);
  });

  it('rejects invalid step name', async () => {
    const db = makeDB({
      workspaces: [{ id: 'wsp_001', tenant_id: 'tnt_001' }],
    });
    const { app, env } = createOnboardingApp(db);

    const res = await app.request('/onboarding/wsp_001/invalid_step', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Invalid step');
  });

  it('returns alreadyCompleted when step is re-completed', async () => {
    const db = makeDB({
      workspaces: [{ id: 'wsp_001', tenant_id: 'tnt_001' }],
      onboarding_progress: [
        { id: 'obp_001', workspace_id: 'wsp_001', step_key: 'profile_setup', completed: 1, tenant_id: 'tnt_001' },
      ],
    });
    const { app, env } = createOnboardingApp(db);

    const res = await app.request('/onboarding/wsp_001/profile_setup', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { alreadyCompleted: boolean };
    expect(body.alreadyCompleted).toBe(true);
  });

  it('GET /onboarding/:workspaceId/summary returns progress summary', async () => {
    const db = makeDB({
      workspaces: [{ id: 'wsp_001', tenant_id: 'tnt_001' }],
      onboarding_progress: [
        { id: 'obp_001', completed: 1, tenant_id: 'tnt_001', workspace_id: 'wsp_001' },
        { id: 'obp_002', completed: 1, tenant_id: 'tnt_001', workspace_id: 'wsp_001' },
      ],
    });
    const { app, env } = createOnboardingApp(db);

    const res = await app.request('/onboarding/wsp_001/summary', {}, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { completed: number; total: number; isComplete: boolean };
    expect(body.completed).toBe(2);
    expect(body.total).toBe(6);
    expect(body.isComplete).toBe(false);
  });

  it('step descriptions include sequential order numbers', async () => {
    const db = makeDB({
      workspaces: [{ id: 'wsp_001', tenant_id: 'tnt_001' }],
      onboarding_progress: [],
    });
    const { app, env } = createOnboardingApp(db);

    const res = await app.request('/onboarding/wsp_001', {}, env);
    const body = await res.json() as { steps: { order: number; title: string }[] };
    const orders = body.steps.map((s) => s.order);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6]);
    expect(body.steps[0]?.title).toBe('Set Up Your Profile');
  });

  it('PUT with metadata stores custom context', async () => {
    const db = makeDB({
      workspaces: [{ id: 'wsp_001', tenant_id: 'tnt_001' }],
      onboarding_progress: [],
    });
    const { app, env } = createOnboardingApp(db);

    const res = await app.request('/onboarding/wsp_001/vertical_activation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: { vertical: 'bakery', activated_at: '2026-04-12' } }),
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { step: string; completed: boolean; progress: { completed: number } };
    expect(body.step).toBe('vertical_activation');
    expect(body.completed).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PROD-07: Template Version Upgrade Path
// ═══════════════════════════════════════════════════════════════════════════

describe('PROD-07: Template version upgrade', () => {
  function makeTemplateDB(opts: {
    registryVersion?: string;
    installedVersion?: string;
    hasInstallation?: boolean;
    templateExists?: boolean;
  } = {}) {
    const tables: Record<string, D1MockRow[]> = {};

    if (opts.templateExists !== false) {
      tables.template_registry = [{
        id: 'tpl_001',
        slug: 'test-dashboard',
        version: opts.registryVersion ?? '2.0.0',
        platform_compat: '^1.0.0',
        manifest_json: '{"name":"test","version":"2.0.0","type":"dashboard"}',
        status: 'approved',
      }];
    } else {
      tables.template_registry = [];
    }

    if (opts.hasInstallation !== false) {
      tables.template_installations = [{
        id: 'inst_001',
        tenant_id: 'tnt_001',
        template_id: 'tpl_001',
        template_version: opts.installedVersion ?? '1.0.0',
        config_json: '{"theme":"dark"}',
        status: 'active',
      }];
    } else {
      tables.template_installations = [];
    }

    tables.template_upgrade_log = [];
    return makeDB(tables);
  }

  it('upgrades template from 1.0.0 to 2.0.0', async () => {
    const db = makeTemplateDB({ registryVersion: '2.0.0', installedVersion: '1.0.0' });
    const { app, env } = createTemplateApp(db);

    const res = await app.request('/templates/test-dashboard/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { upgraded: boolean; from_version: string; to_version: string; config_preserved: boolean };
    expect(body.upgraded).toBe(true);
    expect(body.from_version).toBe('1.0.0');
    expect(body.to_version).toBe('2.0.0');
    expect(body.config_preserved).toBe(true);
  });

  it('returns upgraded=false when already on latest', async () => {
    const db = makeTemplateDB({ registryVersion: '1.0.0', installedVersion: '1.0.0' });
    const { app, env } = createTemplateApp(db);

    const res = await app.request('/templates/test-dashboard/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { upgraded: boolean; message: string };
    expect(body.upgraded).toBe(false);
    expect(body.message).toContain('Already on the latest');
  });

  it('returns 404 when template not found', async () => {
    const db = makeTemplateDB({ templateExists: false });
    const { app, env } = createTemplateApp(db);

    const res = await app.request('/templates/nonexistent/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(404);
  });

  it('returns 404 when template not installed', async () => {
    const db = makeTemplateDB({ hasInstallation: false });
    const { app, env } = createTemplateApp(db);

    const res = await app.request('/templates/test-dashboard/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(404);
  });

  it('rejects upgrade when installed version is newer', async () => {
    const db = makeTemplateDB({ registryVersion: '1.0.0', installedVersion: '2.0.0' });
    const { app, env } = createTemplateApp(db);

    const res = await app.request('/templates/test-dashboard/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { upgraded: boolean };
    expect(body.upgraded).toBe(false);
  });

  it('handles minor version upgrade (1.0.0 -> 1.1.0)', async () => {
    const db = makeTemplateDB({ registryVersion: '1.1.0', installedVersion: '1.0.0' });
    const { app, env } = createTemplateApp(db);

    const res = await app.request('/templates/test-dashboard/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { upgraded: boolean; from_version: string; to_version: string };
    expect(body.upgraded).toBe(true);
    expect(body.from_version).toBe('1.0.0');
    expect(body.to_version).toBe('1.1.0');
  });

  it('handles patch version upgrade (1.0.0 -> 1.0.1)', async () => {
    const db = makeTemplateDB({ registryVersion: '1.0.1', installedVersion: '1.0.0' });
    const { app, env } = createTemplateApp(db);

    const res = await app.request('/templates/test-dashboard/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { upgraded: boolean; to_version: string };
    expect(body.upgraded).toBe(true);
    expect(body.to_version).toBe('1.0.1');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PROD-09: Billing Enforcement Engine
// ═══════════════════════════════════════════════════════════════════════════

describe('PROD-09: Billing enforcement', () => {
  it('GET /billing/status returns subscription details', async () => {
    const db = makeDB({
      subscriptions: [{
        id: 'sub_001',
        workspace_id: 'wsp_001',
        tenant_id: 'tnt_001',
        plan: 'starter',
        status: 'active',
        current_period_start: 1700000000,
        current_period_end: 1702592000,
        grace_period_end: null,
        enforcement_status: 'none',
        cancel_at_period_end: 0,
        updated_at: 1700000000,
      }],
    });
    const { app, env } = createBillingApp(db);

    const res = await app.request('/billing/status', {}, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { plan: string; status: string; enforcement_status: string };
    expect(body.plan).toBe('starter');
    expect(body.status).toBe('active');
    expect(body.enforcement_status).toBe('none');
  });

  it('returns free plan when no subscription exists', async () => {
    const db = makeDB({});
    const { app, env } = createBillingApp(db);

    const res = await app.request('/billing/status', {}, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { plan: string };
    expect(body.plan).toBe('free');
  });

  it('POST /billing/enforce requires admin role', async () => {
    const db = makeDB({});
    const { app, env } = createBillingApp(db, { role: 'member' });

    const res = await app.request('/billing/enforce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(403);
  });

  it('POST /billing/enforce processes expired subscriptions', async () => {
    const now = Math.floor(Date.now() / 1000);
    const db = makeDB({
      subscriptions: [{
        id: 'sub_001',
        workspace_id: 'wsp_001',
        tenant_id: 'tnt_001',
        plan: 'starter',
        status: 'active',
        current_period_end: now - 86400,
        grace_period_end: null,
        enforcement_status: 'none',
      }],
    });
    const { app, env } = createBillingApp(db, { role: 'admin' });

    const res = await app.request('/billing/enforce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { transitions: { active_to_grace: number; grace_to_suspended: number }; total_processed: number };
    expect(body.transitions).toBeDefined();
    expect(typeof body.transitions.active_to_grace).toBe('number');
    expect(typeof body.transitions.grace_to_suspended).toBe('number');
    expect(typeof body.total_processed).toBe('number');
  });

  it('POST /billing/reactivate requires recent payment', async () => {
    const db = makeDB({
      subscriptions: [{
        id: 'sub_001',
        workspace_id: 'wsp_001',
        tenant_id: 'tnt_001',
        status: 'suspended',
        enforcement_status: 'suspended',
      }],
      billing_history: [],
    });
    const { app, env } = createBillingApp(db);

    const res = await app.request('/billing/reactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(402);
    const body = await res.json() as { code: string };
    expect(body.code).toBe('PAYMENT_REQUIRED');
  });

  it('POST /billing/reactivate succeeds with valid payment', async () => {
    const db = makeDB({
      subscriptions: [{
        id: 'sub_001',
        workspace_id: 'wsp_001',
        tenant_id: 'tnt_001',
        status: 'suspended',
        enforcement_status: 'suspended',
      }],
      billing_history: [{
        id: 'bil_001',
        workspace_id: 'wsp_001',
        status: 'success',
      }],
    });
    const { app, env } = createBillingApp(db);

    const res = await app.request('/billing/reactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { reactivated: boolean; status: string };
    expect(body.reactivated).toBe(true);
    expect(body.status).toBe('active');
  });

  it('POST /billing/reactivate returns 404 when no subscription', async () => {
    const db = makeDB({});
    const { app, env } = createBillingApp(db);

    const res = await app.request('/billing/reactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(404);
  });

  it('GET /billing/status includes days_until_expiry', async () => {
    const now = Math.floor(Date.now() / 1000);
    const db = makeDB({
      subscriptions: [{
        id: 'sub_001',
        workspace_id: 'wsp_001',
        tenant_id: 'tnt_001',
        plan: 'growth',
        status: 'active',
        current_period_start: now - 86400,
        current_period_end: now + (15 * 86400),
        grace_period_end: null,
        enforcement_status: 'none',
        cancel_at_period_end: 0,
        updated_at: now,
      }],
    });
    const { app, env } = createBillingApp(db);

    const res = await app.request('/billing/status', {}, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { days_until_expiry: number };
    expect(body.days_until_expiry).toBeGreaterThan(0);
  });

  it('POST /billing/reactivate returns already active for active sub', async () => {
    const db = makeDB({
      subscriptions: [{
        id: 'sub_001',
        workspace_id: 'wsp_001',
        tenant_id: 'tnt_001',
        status: 'active',
        enforcement_status: 'none',
      }],
    });
    const { app, env } = createBillingApp(db);

    const res = await app.request('/billing/reactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { message: string; status: string };
    expect(body.message).toContain('already active');
  });

  it('POST /billing/enforce admin can trigger enforcement check', async () => {
    const db = makeDB({ subscriptions: [] });
    const { app, env } = createBillingApp(db, { role: 'super_admin' });

    const res = await app.request('/billing/enforce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json() as { enforced_at: string; total_processed: number };
    expect(body.enforced_at).toBeDefined();
    expect(body.total_processed).toBe(0);
  });
});
