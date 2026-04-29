/**
 * Onboarding route tests — Phase 4 E27
 * POST /onboarding/:workspaceId/template
 * M14 gate: workspace onboarding includes template selection
 *
 * Platform Invariants:
 *   T3 — tenant_id on all DB queries
 *   TR-T-05 — default_policies seeded into policy_rules on install
 *   TR-T-02 — vocabulary stored in KV for fast resolution
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { onboardingRoutes } from './onboarding.js';

vi.mock('../lib/publish-event.js', () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

// ---------------------------------------------------------------------------
// D1 mock with batch support
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
      run: async () => ({ success: true }),
      first: async <T>() => {
        const fn = resolve(sql);
        return fn ? (fn(sql, ...args) as T) : null;
      },
      all: async <T>() => {
        const fn = resolve(sql);
        if (fn) return { results: fn(sql, ...args) as T[] };
        return { results: [] as T[] };
      },
    };
    return stmt;
  };
  return {
    prepare: (q: string) => stmtFor(q),
    batch: async (stmts: unknown[]) => stmts.map(() => ({ success: true })),
  };
}

const MOCK_KV = {
  put: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue(null),
};

const APPROVED_TEMPLATE = {
  id: 'tpl_em01',
  slug: 'electoral-mobilization',
  display_name: 'Electoral Mobilization',
  description: 'Nigeria-first electoral mobilization template',
  version: '1.0.0',
  default_policies: JSON.stringify([
    {
      rule_key: 'gotv.agent.daily_broadcast',
      category: 'gotv_access',
      scope: 'tenant',
      title: 'GOTV Agent Daily Broadcast Gate',
      decision: 'ALLOW',
      hitl_level: null,
    },
  ]),
  vocabulary: '{"Group":"Ward","Member":"Agent"}',
};

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

function makeApp(db: ReturnType<typeof makeDb>, role = 'admin', tenantId = 'tnt_a', kv?: typeof MOCK_KV) {
  const app = new Hono<{ Bindings: unknown }>();
  app.use('*', async (c, next) => {
    c.env = {
      DB: db,
      JWT_SECRET: 'test',
      ENVIRONMENT: 'development',
      ...(kv ? { KV: kv } : {}),
    } as never;
    c.set('auth' as never, { userId: 'usr_test', tenantId, role } as never);
    await next();
  });
  app.route('/onboarding', onboardingRoutes);
  return app;
}

// ---------------------------------------------------------------------------
// POST /onboarding/:workspaceId/template — E27
// ---------------------------------------------------------------------------

describe('POST /onboarding/:workspaceId/template — E27: Template selection during onboarding', () => {
  it('returns 404 when workspace does not exist for this tenant', async () => {
    const db = makeDb(); // no workspace handler → null
    const app = makeApp(db);
    const res = await app.request('/onboarding/ws_notfound/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'electoral-mobilization' }),
    });
    expect(res.status).toBe(404);
    const body = await res.json<{ error: string }>();
    expect(body.error).toContain('Workspace not found');
  });

  it('returns 422 when template_slug is missing', async () => {
    const db = makeDb({ 'FROM workspaces WHERE id': () => ({ id: 'ws_001' }) });
    const app = makeApp(db);
    const res = await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
    const body = await res.json<{ error: string }>();
    expect(body.error).toContain('template_slug is required');
  });

  it('returns 422 when template_slug contains invalid characters', async () => {
    const db = makeDb({ 'FROM workspaces WHERE id': () => ({ id: 'ws_001' }) });
    const app = makeApp(db);
    const res = await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'INVALID_SLUG!!!' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 404 when template_slug is not approved', async () => {
    const db = makeDb({
      'FROM workspaces WHERE id': () => ({ id: 'ws_001' }),
      'FROM template_registry WHERE slug': () => null, // not found / not approved
    });
    const app = makeApp(db);
    const res = await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'nonexistent-template' }),
    });
    expect(res.status).toBe(404);
    const body = await res.json<{ error: string }>();
    expect(body.error).toContain("not found or not approved");
  });

  it('returns 201 with template_installed=true for new install', async () => {
    const db = makeDb({
      'FROM workspaces WHERE id': () => ({ id: 'ws_001' }),
      'FROM template_registry WHERE slug': () => APPROVED_TEMPLATE,
      'FROM template_installations WHERE tenant_id': () => null, // new install
      'FROM policy_rules WHERE tenant_id': () => null, // no existing policy
      'FROM onboarding_progress WHERE workspace_id': () => null, // no existing step
    });
    const app = makeApp(db, 'admin', 'tnt_a', MOCK_KV);
    const res = await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'electoral-mobilization' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{
      template_installed: boolean;
      reinstalled: boolean;
      template_slug: string;
      template_name: string;
      onboarding_step: string;
      onboarding_step_completed: boolean;
    }>();
    expect(body.template_installed).toBe(true);
    expect(body.reinstalled).toBe(false);
    expect(body.template_slug).toBe('electoral-mobilization');
    expect(body.template_name).toBe('Electoral Mobilization');
    expect(body.onboarding_step).toBe('template_installed');
    expect(body.onboarding_step_completed).toBe(true);
  });

  it('returns 201 with reinstalled=true when template is already installed (active)', async () => {
    const db = makeDb({
      'FROM workspaces WHERE id': () => ({ id: 'ws_001' }),
      'FROM template_registry WHERE slug': () => APPROVED_TEMPLATE,
      'FROM template_installations WHERE tenant_id': () => ({ id: 'inst_existing', status: 'active' }),
      'FROM policy_rules WHERE tenant_id': () => null,
      'FROM onboarding_progress WHERE workspace_id': () => null,
    });
    const app = makeApp(db);
    const res = await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'electoral-mobilization' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ reinstalled: boolean; installation_id: string }>();
    expect(body.reinstalled).toBe(true);
    expect(body.installation_id).toBe('inst_existing');
  });

  it('marks template_installed onboarding step as completed', async () => {
    const runCalls: string[] = [];
    const db = makeDb({
      'FROM workspaces WHERE id': () => ({ id: 'ws_001' }),
      'FROM template_registry WHERE slug': () => APPROVED_TEMPLATE,
      'FROM template_installations WHERE tenant_id': () => null,
      'FROM policy_rules WHERE tenant_id': () => null,
      'FROM onboarding_progress WHERE workspace_id': () => null,
    });

    const originalPrepare = db.prepare.bind(db);
    db.prepare = (q: string) => {
      const stmt = originalPrepare(q);
      const originalRun = stmt.run.bind(stmt);
      stmt.run = async () => {
        runCalls.push(q);
        return originalRun();
      };
      return stmt;
    };

    const app = makeApp(db);
    const res = await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'electoral-mobilization' }),
    });
    expect(res.status).toBe(201);
    // onboarding_progress INSERT should have been executed
    const onboardingInsert = runCalls.some(q => q.includes('onboarding_progress') && q.includes('INSERT'));
    expect(onboardingInsert).toBe(true);
  });

  it('enforces tenant isolation — T3: workspace belonging to different tenant returns 404', async () => {
    const db = makeDb({
      // workspaces query with tenant_id = 'tnt_b' (different tenant) returns null
      'FROM workspaces WHERE id': () => null,
    });
    const app = makeApp(db, 'admin', 'tnt_b');
    const res = await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'electoral-mobilization' }),
    });
    expect(res.status).toBe(404);
  });

  it('TR-T-05: seeds default_policies into policy_rules on template install', async () => {
    const policyRunCalls: string[] = [];
    const db = makeDb({
      'FROM workspaces WHERE id': () => ({ id: 'ws_001' }),
      'FROM template_registry WHERE slug': () => APPROVED_TEMPLATE,
      'FROM template_installations WHERE tenant_id': () => null,
      'FROM policy_rules WHERE tenant_id': () => null, // no existing policy
      'FROM onboarding_progress WHERE workspace_id': () => null,
    });

    const originalPrepare = db.prepare.bind(db);
    db.prepare = (q: string) => {
      const stmt = originalPrepare(q);
      const originalRun = stmt.run.bind(stmt);
      stmt.run = async () => {
        if (q.includes('INSERT INTO policy_rules')) policyRunCalls.push(q);
        return originalRun();
      };
      return stmt;
    };

    const app = makeApp(db);
    const res = await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'electoral-mobilization' }),
    });
    expect(res.status).toBe(201);
    // default_policies seeded → policy_rules INSERT executed
    expect(policyRunCalls.length).toBeGreaterThan(0);
  });

  it('TR-T-05: skips policy INSERT when policy already exists (idempotent)', async () => {
    const policyInserts: string[] = [];
    const db = makeDb({
      'FROM workspaces WHERE id': () => ({ id: 'ws_001' }),
      'FROM template_registry WHERE slug': () => APPROVED_TEMPLATE,
      'FROM template_installations WHERE tenant_id': () => null,
      'FROM policy_rules WHERE tenant_id': () => ({ id: 'polr_existing' }), // policy exists
      'FROM onboarding_progress WHERE workspace_id': () => null,
    });

    const originalPrepare = db.prepare.bind(db);
    db.prepare = (q: string) => {
      const stmt = originalPrepare(q);
      const originalRun = stmt.run.bind(stmt);
      stmt.run = async () => {
        if (q.includes('INSERT INTO policy_rules')) policyInserts.push(q);
        return originalRun();
      };
      return stmt;
    };

    const app = makeApp(db);
    await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'electoral-mobilization' }),
    });
    // Policy already exists → INSERT should NOT be called
    expect(policyInserts).toHaveLength(0);
  });

  it('TR-T-02: stores vocabulary in KV on template install', async () => {
    const kvPuts: Array<{ key: string; value: string }> = [];
    const kv = {
      put: vi.fn().mockImplementation(async (key: string, value: string) => { kvPuts.push({ key, value }); }),
      get: vi.fn().mockResolvedValue(null),
    };

    const db = makeDb({
      'FROM workspaces WHERE id': () => ({ id: 'ws_001' }),
      'FROM template_registry WHERE slug': () => APPROVED_TEMPLATE,
      'FROM template_installations WHERE tenant_id': () => null,
      'FROM policy_rules WHERE tenant_id': () => null,
      'FROM onboarding_progress WHERE workspace_id': () => null,
    });
    const app = makeApp(db, 'admin', 'tnt_a', kv);

    await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'electoral-mobilization' }),
    });

    // vocabulary written to KV with tenant-scoped key (TR-T-02)
    expect(kvPuts.some(p => p.key === 'vocab:tnt_a:electoral-mobilization')).toBe(true);
    expect(kvPuts[0].value).toBe(APPROVED_TEMPLATE.vocabulary);
  });

  it('succeeds even when KV binding is absent (non-fatal)', async () => {
    const db = makeDb({
      'FROM workspaces WHERE id': () => ({ id: 'ws_001' }),
      'FROM template_registry WHERE slug': () => ({ ...APPROVED_TEMPLATE, vocabulary: '{"Group":"Chapter"}' }),
      'FROM template_installations WHERE tenant_id': () => null,
      'FROM policy_rules WHERE tenant_id': () => null,
      'FROM onboarding_progress WHERE workspace_id': () => null,
    });
    // No KV in env
    const app = makeApp(db, 'admin', 'tnt_a', undefined);
    const res = await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'electoral-mobilization' }),
    });
    expect(res.status).toBe(201);
  });

  it('handles malformed default_policies JSON gracefully (non-fatal, skips seeding)', async () => {
    const db = makeDb({
      'FROM workspaces WHERE id': () => ({ id: 'ws_001' }),
      'FROM template_registry WHERE slug': () => ({
        ...APPROVED_TEMPLATE,
        default_policies: '{not valid json}',
      }),
      'FROM template_installations WHERE tenant_id': () => null,
      'FROM onboarding_progress WHERE workspace_id': () => null,
    });
    const app = makeApp(db);
    const res = await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'electoral-mobilization' }),
    });
    expect(res.status).toBe(201);
  });

  it('does not complete template_installed step when it is already completed', async () => {
    const updateCalls: string[] = [];
    const db = makeDb({
      'FROM workspaces WHERE id': () => ({ id: 'ws_001' }),
      'FROM template_registry WHERE slug': () => APPROVED_TEMPLATE,
      'FROM template_installations WHERE tenant_id': () => ({ id: 'inst_existing', status: 'active' }),
      'FROM policy_rules WHERE tenant_id': () => null,
      'FROM onboarding_progress WHERE workspace_id': () => ({ id: 'prog_001', completed: 1 }), // already completed
    });

    const originalPrepare = db.prepare.bind(db);
    db.prepare = (q: string) => {
      const stmt = originalPrepare(q);
      const originalRun = stmt.run.bind(stmt);
      stmt.run = async () => {
        if (q.includes('UPDATE onboarding_progress')) updateCalls.push(q);
        return originalRun();
      };
      return stmt;
    };

    const app = makeApp(db);
    const res = await app.request('/onboarding/ws_001/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_slug: 'electoral-mobilization' }),
    });
    expect(res.status).toBe(201);
    // Step already completed → UPDATE should NOT be called
    expect(updateCalls).toHaveLength(0);
  });
});
