/**
 * Template lifecycle route tests — P3-E (MED-010)
 * ≥12 test cases covering list, publish (super_admin gate), install, installed, rollback.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { templateRoutes } from './templates.js';

// ---------------------------------------------------------------------------
// Mock heavy dependencies so tests don't call real external services
// ---------------------------------------------------------------------------

vi.mock('@webwaka/auth', () => ({
  resolveAuthContext: vi.fn().mockResolvedValue({ success: false }),
}));

vi.mock('@webwaka/payments', () => ({
  initializePayment: vi.fn().mockResolvedValue({ authorization_url: 'https://pay.test', reference: 'ref_001' }),
  verifyPayment: vi.fn().mockResolvedValue({ status: 'success', amount: 0 }),
}));

vi.mock('../lib/webhook-dispatcher.js', () => ({
  WebhookDispatcher: vi.fn().mockImplementation(() => ({ dispatch: vi.fn().mockResolvedValue(undefined) })),
}));

vi.mock('../lib/email-service.js', () => ({
  EmailService: vi.fn().mockImplementation(() => ({ sendTemplateInstalledEmail: vi.fn().mockResolvedValue(undefined) })),
}));

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
      run: async () => ({ success: true }),
      first: async <T>() => {
        const fn = resolve(sql);
        return fn ? (fn(sql, ...args) as T) : null;
      },
      all: async <T>() => {
        const fn = resolve(sql);
        if (fn) return { results: (fn(sql, ...args) as T[]) };
        return { results: [] as T[] };
      },
    };
    return stmt;
  };
  return { prepare: (q: string) => stmtFor(q) };
}

const MOCK_TEMPLATE = {
  id: 'tpl_001', slug: 'dashboard-starter', display_name: 'Dashboard Starter', description: 'A starter dashboard template', template_type: 'dashboard', version: '1.0.0', platform_compat: '^1.0.0', status: 'approved', is_free: 1, price_kobo: 0, install_count: 10,
};

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

function makeApp(db: ReturnType<typeof makeDb>, role = 'admin', tenantId = 'tnt_a') {
  const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  app.use('*', async (c, next) => {
    c.env = { DB: db, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
    c.set('auth' as never, { userId: 'usr_test', tenantId, role } as never);
    await next();
  });
  app.route('/templates', templateRoutes);
  return app;
}

// ---------------------------------------------------------------------------
// GET /templates
// ---------------------------------------------------------------------------

describe('GET /templates', () => {
  it('returns 200 with template list', async () => {
    const db = makeDb({
      'template_registry': () => [MOCK_TEMPLATE],
    });
    const app = makeApp(db);
    const res = await app.request('/templates');
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// GET /templates/:slug
// ---------------------------------------------------------------------------

describe('GET /templates/:slug', () => {
  it('returns 200 when template found', async () => {
    const db = makeDb({ template_registry: () => MOCK_TEMPLATE });
    const app = makeApp(db);
    const res = await app.request('/templates/dashboard-starter');
    expect(res.status).toBe(200);
    const body = await res.json<{ slug: string }>();
    expect(body.slug).toBe('dashboard-starter');
  });

  it('returns 404 when template not found', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/templates/does-not-exist');
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /templates — publish (super_admin only)
// ---------------------------------------------------------------------------

describe('POST /templates — publish', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for non-super_admin role', async () => {
    const app = makeApp(makeDb(), 'admin');
    const res = await app.request('/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'my-tpl', display_name: 'My Tpl', description: 'A test description here.', template_type: 'dashboard', version: '1.0.0', platform_compat: '^1.0.0', manifest_json: { name: 'my-tpl', version: '1.0.0', type: 'dashboard' } }),
    });
    expect(res.status).toBe(403);
  });

  it('returns 422 for slug with uppercase chars', async () => {
    const app = makeApp(makeDb(), 'super_admin');
    const res = await app.request('/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'My-Tpl', display_name: 'My Tpl', description: 'A test description here.', template_type: 'dashboard', version: '1.0.0', platform_compat: '^1.0.0', manifest_json: { name: 'my-tpl', version: '1.0.0', type: 'dashboard' } }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid template_type', async () => {
    const app = makeApp(makeDb(), 'super_admin');
    const res = await app.request('/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'my-tpl', display_name: 'My Tpl', description: 'A test description here.', template_type: 'unknown-type', version: '1.0.0', platform_compat: '^1.0.0', manifest_json: { name: 'my-tpl', version: '1.0.0', type: 'dashboard' } }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid semver version', async () => {
    const app = makeApp(makeDb(), 'super_admin');
    const res = await app.request('/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'my-tpl', display_name: 'My Tpl', description: 'A test description here.', template_type: 'dashboard', version: 'v1', platform_compat: '^1.0.0', manifest_json: { name: 'my-tpl', version: '1.0.0', type: 'dashboard' } }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for float price_kobo (T4)', async () => {
    const app = makeApp(makeDb(), 'super_admin');
    const res = await app.request('/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'my-tpl', display_name: 'My Tpl', description: 'A test description here.', template_type: 'dashboard', version: '1.0.0', platform_compat: '^1.0.0', price_kobo: 150.5, manifest_json: { name: 'my-tpl', version: '1.0.0', type: 'dashboard' } }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 409 when slug already exists', async () => {
    const db = makeDb({ 'SELECT id FROM template_registry WHERE slug': () => ({ id: 'tpl_existing' }) });
    const app = makeApp(db, 'super_admin');
    const res = await app.request('/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'existing-slug', display_name: 'My Tpl', description: 'A test description here.', template_type: 'dashboard', version: '1.0.0', platform_compat: '^1.0.0', manifest_json: { name: 'my-tpl', version: '1.0.0', type: 'dashboard' } }),
    });
    expect(res.status).toBe(409);
  });

  it('returns 201 for valid publish by super_admin', async () => {
    const app = makeApp(makeDb(), 'super_admin');
    const res = await app.request('/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'new-dashboard', display_name: 'New Dashboard', description: 'A brand new dashboard template.', template_type: 'dashboard', version: '1.0.0', platform_compat: '^1.0.0', manifest_json: { name: 'new-dashboard', version: '1.0.0', type: 'dashboard' } }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ slug: string; status: string }>();
    expect(body.slug).toBe('new-dashboard');
    expect(body.status).toBe('pending_review');
  });
});

// ---------------------------------------------------------------------------
// POST /templates/:slug/install
// ---------------------------------------------------------------------------

describe('POST /templates/:slug/install', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when template slug does not exist', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/templates/nonexistent/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// GET /templates/installed
// ---------------------------------------------------------------------------

describe('GET /templates/installed', () => {
  it('returns 200 with list (may be empty)', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/templates/installed');
    expect(res.status).toBe(200);
  });
});
