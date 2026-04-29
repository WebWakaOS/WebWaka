/**
 * Template lifecycle route tests — P3-E (MED-010)
 * ≥12 test cases covering list, publish (super_admin gate), install, installed, rollback.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { templateRoutes } from './templates.js';

vi.mock('@webwaka/verticals', async () => {
  const actual = await vi.importActual<typeof import('@webwaka/verticals')>('@webwaka/verticals');
  return {
    ...actual,
    validateTemplateManifest: vi.fn().mockReturnValue({ valid: true, errors: [], warnings: [] }),
  };
});

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
  beforeEach(() => { vi.clearAllMocks(); });

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
  beforeEach(() => { vi.clearAllMocks(); });

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

// ---------------------------------------------------------------------------
// POST /templates/:slug/rate  (P6-B)
// ---------------------------------------------------------------------------

function makeRatingApp(db: ReturnType<typeof makeDb>, opts: { workspaceId?: string | null; role?: string } = {}) {
  const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  app.use('*', async (c, next) => {
    c.env = { DB: db, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
    // Use 'in' check so explicit undefined/null is preserved (tests the missing-workspaceId guard)
    const workspaceId = 'workspaceId' in opts ? opts.workspaceId : 'wsp_001';
    c.set('auth' as never, {
      userId: 'usr_test',
      tenantId: 'tnt_a',
      ...(workspaceId != null ? { workspaceId } : {}),
      role: opts.role ?? 'admin',
    } as never);
    await next();
  });
  app.route('/templates', templateRoutes);
  return app;
}

describe('POST /templates/:slug/rate', () => {
  const makeRatingDb = (templateFound = true) =>
    makeDb({
      template_registry: () => (templateFound ? MOCK_TEMPLATE : null),
      template_ratings: () => ({ avg_rating: 4.5, rating_count: 3 }),
    });

  it('returns 201 with avgRating for valid integer rating', async () => {
    const app = makeRatingApp(makeRatingDb());
    const res = await app.request('/templates/dashboard-starter/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 4 }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { templateSlug: string; yourRating: number; avgRating: number; ratingCount: number };
    expect(json.templateSlug).toBe('dashboard-starter');
    expect(json.yourRating).toBe(4);
    expect(typeof json.avgRating).toBe('number');
    expect(typeof json.ratingCount).toBe('number');
  });

  it('returns 404 when template does not exist', async () => {
    const app = makeRatingApp(makeRatingDb(false));
    const res = await app.request('/templates/no-such-template/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 3 }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 401 when unauthenticated', async () => {
    const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
    app.use('*', async (c, next) => {
      c.env = { DB: makeRatingDb(), JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
      await next();
    });
    app.route('/templates', templateRoutes);
    const res = await app.request('/templates/dashboard-starter/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 4 }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 422 when workspaceId is missing from auth context (Bug #4 fix)', async () => {
    const app = makeRatingApp(makeRatingDb(), { workspaceId: undefined });
    const res = await app.request('/templates/dashboard-starter/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 4 }),
    });
    expect(res.status).toBe(422);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('workspaceId');
  });

  it('returns 400 when rating is 0 (out of range — T4 invariant)', async () => {
    const app = makeRatingApp(makeRatingDb());
    const res = await app.request('/templates/dashboard-starter/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 0 }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('integer');
  });

  it('returns 400 when rating is 6 (out of range — T4 invariant)', async () => {
    const app = makeRatingApp(makeRatingDb());
    const res = await app.request('/templates/dashboard-starter/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 6 }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is a float (T4 integer invariant)', async () => {
    const app = makeRatingApp(makeRatingDb());
    const res = await app.request('/templates/dashboard-starter/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 3.5 }),
    });
    expect(res.status).toBe(400);
  });

  it('accepts optional review_text field', async () => {
    const app = makeRatingApp(makeRatingDb());
    const res = await app.request('/templates/dashboard-starter/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5, review_text: 'Excellent template' }),
    });
    expect(res.status).toBe(201);
  });
});

// ---------------------------------------------------------------------------
// GET /templates/:slug/ratings  (P6-B)
// ---------------------------------------------------------------------------

describe('GET /templates/:slug/ratings', () => {
  const RATING_FIXTURE = {
    id: 'tr_001', workspace_id: 'wsp_001', rating: 5,
    review_text: 'Great!', created_at: 1700000000, updated_at: 1700000000,
  };

  const makeRatingsListDb = (templateFound = true) =>
    makeDb({
      template_registry: () => (templateFound ? MOCK_TEMPLATE : null),
      template_ratings: (sql: string) => {
        if (sql.includes('AVG')) return { avg_rating: 4.8, rating_count: 10 };
        return [RATING_FIXTURE];
      },
    });

  it('returns 200 with ratings list and aggregate stats', async () => {
    const app = makeRatingApp(makeRatingsListDb());
    const res = await app.request('/templates/dashboard-starter/ratings');
    expect(res.status).toBe(200);
    const json = await res.json() as {
      templateSlug: string;
      avgRating: number | null;
      ratingCount: number;
      ratings: unknown[];
      page: number;
      perPage: number;
    };
    expect(json.templateSlug).toBe('dashboard-starter');
    expect(typeof json.avgRating).toBe('number');
    expect(typeof json.ratingCount).toBe('number');
    expect(Array.isArray(json.ratings)).toBe(true);
    expect(json.page).toBe(1);
    expect(json.perPage).toBe(50);
  });

  it('returns 404 when template not found', async () => {
    const app = makeRatingApp(makeRatingsListDb(false));
    const res = await app.request('/templates/no-such-slug/ratings');
    expect(res.status).toBe(404);
  });

  it('does NOT expose tenant_id in ratings response (Bug #5 T3 fix)', async () => {
    const app = makeRatingApp(makeRatingsListDb());
    const res = await app.request('/templates/dashboard-starter/ratings');
    const json = await res.json() as { ratings: Record<string, unknown>[] };
    for (const r of json.ratings) {
      expect(r).not.toHaveProperty('tenant_id');
    }
  });

  it('respects page query param', async () => {
    const app = makeRatingApp(makeRatingsListDb());
    const res = await app.request('/templates/dashboard-starter/ratings?page=2');
    expect(res.status).toBe(200);
    const json = await res.json() as { page: number };
    expect(json.page).toBe(2);
  });
});

// ===========================================================================
// P0 AUDIT FIX TESTS (Emergent Pillar-2 audit 2026-04-25)
// Approval Workflow: /pending, /approve, /reject, /deprecate, /audit
// Render Overrides:  /render-overrides + /:pageType
// ===========================================================================

describe('Pillar-2 audit fixes — Approval Workflow', () => {
  it('GET /templates/pending returns 403 for non-super_admin', async () => {
    const app = makeApp(makeDb(), 'admin');
    const res = await app.request('/templates/pending');
    expect(res.status).toBe(403);
  });

  it('GET /templates/pending returns 200 with pending list for super_admin', async () => {
    const db = makeDb({
      'WHERE status = \'pending_review\'': () => [
        { id: 'tpl_pp1', slug: 'pending-one', display_name: 'Pending One', status: 'pending_review' },
      ],
    });
    const app = makeApp(db, 'super_admin');
    const res = await app.request('/templates/pending');
    expect(res.status).toBe(200);
    const body = await res.json<{ pending: unknown[] }>();
    expect(body.pending.length).toBe(1);
  });

  it('POST /templates/:slug/approve returns 403 for non-super_admin', async () => {
    const app = makeApp(makeDb(), 'admin');
    const res = await app.request('/templates/dashboard-starter/approve', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(403);
  });

  it('POST /templates/:slug/approve returns 404 when template missing', async () => {
    const app = makeApp(makeDb(), 'super_admin');
    const res = await app.request('/templates/nope/approve', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(404);
  });

  it('POST /templates/:slug/approve transitions pending_review → approved', async () => {
    const db = makeDb({
      'FROM template_registry WHERE slug': () => ({ id: 'tpl_pa1', status: 'pending_review' }),
    });
    const app = makeApp(db, 'super_admin');
    const res = await app.request('/templates/x/approve', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'looks good' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ approved: boolean; to_status: string }>();
    expect(body.approved).toBe(true);
    expect(body.to_status).toBe('approved');
  });

  it('POST /templates/:slug/approve refuses transition when status != pending_review', async () => {
    const db = makeDb({
      'FROM template_registry WHERE slug': () => ({ id: 'tpl_aa1', status: 'approved' }),
    });
    const app = makeApp(db, 'super_admin');
    const res = await app.request('/templates/x/approve', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(409);
  });

  it('POST /templates/:slug/reject requires a reason ≥5 chars', async () => {
    const db = makeDb({
      'FROM template_registry WHERE slug': () => ({ id: 'tpl_rr1', status: 'pending_review' }),
    });
    const app = makeApp(db, 'super_admin');
    const res = await app.request('/templates/x/reject', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'nope' }),
    });
    expect(res.status).toBe(400);
  });

  it('POST /templates/:slug/reject succeeds with valid reason', async () => {
    const db = makeDb({
      'FROM template_registry WHERE slug': () => ({ id: 'tpl_rr2', status: 'pending_review' }),
    });
    const app = makeApp(db, 'super_admin');
    const res = await app.request('/templates/x/reject', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'manifest fails canonical schema' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ rejected: boolean; to_status: string }>();
    expect(body.rejected).toBe(true);
    expect(body.to_status).toBe('rejected');
  });

  it('POST /templates/:slug/deprecate transitions approved → deprecated', async () => {
    const db = makeDb({
      'FROM template_registry WHERE slug': () => ({ id: 'tpl_dd1', status: 'approved' }),
    });
    const app = makeApp(db, 'super_admin');
    const res = await app.request('/templates/x/deprecate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ deprecated: boolean }>();
    expect(body.deprecated).toBe(true);
  });

  it('GET /templates/:slug/audit returns 403 for non-super_admin', async () => {
    const app = makeApp(makeDb(), 'admin');
    const res = await app.request('/templates/x/audit');
    expect(res.status).toBe(403);
  });
});

describe('Pillar-2 audit fixes — Template Render Overrides', () => {
  it('PUT /render-overrides/:pageType requires authentication', async () => {
    // No tenant in auth context → simulated by clearing the auth set
    const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
    app.use('*', async (c, next) => {
      c.env = { DB: makeDb(), JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
      // Intentionally do NOT set 'auth' on the context
      await next();
    });
    app.route('/templates', templateRoutes);
    const res = await app.request('/templates/render-overrides/home', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ override_template_slug: 'platform-default' }),
    });
    expect(res.status).toBe(401);
  });

  it('PUT /render-overrides/:pageType rejects invalid pageType', async () => {
    const app = makeApp(makeDb(), 'admin');
    const res = await app.request('/templates/render-overrides/totally-not-a-page', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ override_template_slug: 'platform-default' }),
    });
    expect(res.status).toBe(422);
  });

  it('PUT /render-overrides/:pageType rejects missing override_template_slug', async () => {
    const app = makeApp(makeDb(), 'admin');
    const res = await app.request('/templates/render-overrides/home', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(422);
  });

  it('PUT /render-overrides/:pageType returns 422 if override slug is not approved (and != platform-default)', async () => {
    const db = makeDb({
      'WHERE slug = ? AND status = \'approved\'': () => null,
    });
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/render-overrides/home', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ override_template_slug: 'nonexistent' }),
    });
    expect(res.status).toBe(422);
  });

  it('PUT /render-overrides/:pageType returns 409 if no active install exists', async () => {
    const db = makeDb({
      'FROM template_installations': () => null,
    });
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/render-overrides/home', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ override_template_slug: 'platform-default' }),
    });
    expect(res.status).toBe(409);
  });

  it('PUT /render-overrides/:pageType returns 200 when override is set successfully', async () => {
    const db = makeDb({
      'FROM template_installations': () => ({ id: 'inst_a' }),
    });
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/render-overrides/home', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ override_template_slug: 'platform-default' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ set: boolean; page_type: string }>();
    expect(body.set).toBe(true);
    expect(body.page_type).toBe('home');
  });

  it('DELETE /render-overrides/:pageType returns 200 cleared', async () => {
    const app = makeApp(makeDb(), 'admin');
    const res = await app.request('/templates/render-overrides/home', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = await res.json<{ cleared: boolean }>();
    expect(body.cleared).toBe(true);
  });

  it('GET /render-overrides returns 200 with overrides list', async () => {
    const db = makeDb({
      'FROM template_render_overrides': () => [
        { id: 'tro_1', page_type: 'home', override_template_slug: 'platform-default' },
      ],
    });
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/render-overrides');
    expect(res.status).toBe(200);
    const body = await res.json<{ overrides: unknown[] }>();
    expect(body.overrides.length).toBe(1);
  });
});

describe('Pillar-2 audit fixes — Vertical compatibility (P1: forbid forged body.vertical)', () => {
  it('POST /templates/:slug/install — rejects body.vertical mismatch with tenant\'s registered vertical', async () => {
    const db = makeDb({
      'FROM template_registry WHERE slug = ? AND status = \'approved\'': () => ({
        id: 'tpl_vc', slug: 'restaurant-pro', version: '1.0.0', platform_compat: '^1.0.0',
        compatible_verticals: '["restaurant"]', manifest_json: '{}', is_free: 1, price_kobo: 0,
        author_tenant_id: 'tnt_author',
      }),
      'FROM profiles': () => ({ vertical_slug: 'church' }), // tenant is canonically a church
    });
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/restaurant-pro/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vertical: 'restaurant' }), // attempt to forge
    });
    expect(res.status).toBe(422);
    const body = await res.json<{ error: string }>();
    expect(body.error).toContain('vertical mismatch');
  });

  it('POST /templates/:slug/install — accepts when tenant has canonical vertical and template restricts to it (validation passes; install side-effect not tested here)', async () => {
    // This test only verifies that the vertical-compat *validation* gate
    // allows the request through when tenant.vertical_slug matches the
    // template's compatible_verticals. The actual install path uses db.batch()
    // which is intentionally not modelled by the lightweight test mock —
    // testing that path requires the real D1 in integration tests.
    const db = makeDb({
      'FROM template_registry WHERE slug = ? AND status = \'approved\'': () => ({
        id: 'tpl_vc2', slug: 'restaurant-pro', version: '1.0.0', platform_compat: '^1.0.0',
        compatible_verticals: '["restaurant"]', manifest_json: '{}', is_free: 1, price_kobo: 0,
        author_tenant_id: 'tnt_author',
      }),
      'FROM profiles': () => ({ vertical_slug: 'restaurant' }),
      'FROM template_installations WHERE tenant_id = ? AND template_id = ?': () => null,
    });
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/restaurant-pro/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
    });
    // Validation passed (no 422) — the 5xx is from the unmocked db.batch and
    // is not a test of vertical-compat behaviour itself.
    expect(res.status).not.toBe(422);
  });

  it('POST /templates/:slug/install — rejects when template restricts verticals and tenant has none', async () => {
    const db = makeDb({
      'FROM template_registry WHERE slug = ? AND status = \'approved\'': () => ({
        id: 'tpl_vc3', slug: 'restaurant-pro', version: '1.0.0', platform_compat: '^1.0.0',
        compatible_verticals: '["restaurant"]', manifest_json: '{}', is_free: 1, price_kobo: 0,
        author_tenant_id: 'tnt_author',
      }),
      'FROM profiles': () => null, // tenant has no canonical vertical
    });
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/restaurant-pro/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(422);
    const body = await res.json<{ error: string }>();
    expect(body.error).toContain('no registered vertical');
  });
});

// ---------------------------------------------------------------------------
// Phase 4 (E25/E26/E27) — Template Registry Extension, Starter Templates,
// Onboarding Template Selection. M14 gate tests.
// ---------------------------------------------------------------------------

/** makeDb variant with batch support for install-route Phase 4 tests */
function makeDbWithBatch(handlers: Record<string, (sql: string, ...args: unknown[]) => unknown> = {}) {
  const resolve = (sql: string) => {
    for (const [key, fn] of Object.entries(handlers)) {
      if (sql.includes(key)) return fn;
    }
    return null;
  };
  const stmtFor = (sql: string) => {
    const args: unknown[] = [];
    const stmt = {
      bind: (...a: unknown[]) => { args.push(...a); return stmt; },
      run: async () => ({ success: true }),
      first: async <T>() => {
        const fn = resolve(sql);
        return fn ? (fn(sql, ...args) as T) : null;
      },
      all: async <T>() => {
        const fn = resolve(sql);
        return { results: fn ? (fn(sql, ...args) as T[]) : ([] as T[]) };
      },
    };
    return stmt;
  };
  return {
    prepare: (q: string) => stmtFor(q),
    batch: async (stmts: unknown[]) => stmts.map(() => ({ success: true })),
  };
}

const MOCK_TEMPLATE_PHASE4 = {
  id: 'tpl_p4_01',
  slug: 'electoral-mobilization',
  display_name: 'Electoral Mobilization',
  description: 'Nigeria-first electoral mobilization template',
  template_type: 'civic',
  version: '1.0.0',
  platform_compat: '^1.0.0',
  compatible_verticals: '[]',
  manifest_json: '{}',
  is_free: 1,
  price_kobo: 0,
  author_tenant_id: null,
  install_count: 0,
  status: 'approved',
  module_config: '{"polling_units":true}',
  vocabulary: '{"Group":"Ward","Member":"Agent"}',
  default_policies: JSON.stringify([
    {
      rule_key: 'gotv.agent.daily_broadcast',
      category: 'gotv_access',
      scope: 'tenant',
      title: 'GOTV Agent Daily Broadcast Gate',
      description: 'Controls daily broadcast quota for GOTV agents',
      condition_json: '{"quota_per_day":3}',
      decision: 'ALLOW',
      hitl_level: null,
    },
    {
      rule_key: 'pii.agent.data_access',
      category: 'pii_access',
      scope: 'tenant',
      title: 'PII Data Access for Agents',
      description: 'Controls which agent tiers can view voter PII',
      condition_json: '{"min_tier":2}',
      decision: 'DENY',
      hitl_level: 1,
    },
  ]),
  default_workflows: '[]',
};

// E25: publish route accepts Phase 4 extended fields
describe('Phase 4 — E25: Publish route extended fields', () => {
  it('POST /templates — super_admin can publish with module_config, vocabulary, default_policies, default_workflows', async () => {
    const db = makeDb();
    const app = makeApp(db, 'super_admin');
    const res = await app.request('/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'electoral-mobilization',
        display_name: 'Electoral Mobilization',
        description: 'Nigeria-first electoral mobilization template for civic engagement',
        template_type: 'module',
        version: '1.0.0',
        platform_compat: '^1.0.0',
        manifest_json: { modules: ['gotv', 'agents'] },
        is_free: true,
        module_config: { polling_units: true, ward_dashboard: true },
        vocabulary: { Group: 'Ward', Member: 'Agent', Event: 'Rally' },
        default_policies: [
          { rule_key: 'gotv.agent.daily_broadcast', category: 'gotv_access', title: 'GOTV Broadcast Gate', decision: 'ALLOW' },
        ],
        default_workflows: [{ id: 'wf_gotv_daily', name: 'GOTV Daily Check-in' }],
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ slug: string; status: string }>();
    expect(body.slug).toBe('electoral-mobilization');
    expect(body.status).toBe('pending_review');
  });

  it('POST /templates — rejects non-super_admin even with Phase 4 fields', async () => {
    const app = makeApp(makeDb(), 'admin');
    const res = await app.request('/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'civic-nonprofit', display_name: 'Civic Nonprofit', description: 'Civic nonprofit template for communities',
        template_type: 'module', version: '1.0.0', platform_compat: '^1.0.0',
        manifest_json: {}, module_config: {}, vocabulary: {}, default_policies: [],
      }),
    });
    expect(res.status).toBe(403);
  });

  it('POST /templates — phase 4 fields default gracefully when omitted (super_admin)', async () => {
    const app = makeApp(makeDb(), 'super_admin');
    const res = await app.request('/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'mutual-aid-network', display_name: 'Mutual Aid Network', description: 'Community mutual aid and solidarity network template',
        template_type: 'module', version: '1.0.0', platform_compat: '^1.0.0',
        manifest_json: {},
        // module_config / vocabulary / default_policies / default_workflows intentionally omitted
      }),
    });
    expect(res.status).toBe(201);
  });
});

// E26: five starter templates present in mock catalogue
describe('Phase 4 — E26: Five starter templates in catalogue', () => {
  const STARTER_SLUGS = [
    'electoral-mobilization',
    'civic-nonprofit',
    'mutual-aid-network',
    'constituency-service',
    'faith-community',
  ];

  it('all 5 starter slugs are distinct and kebab-case', () => {
    const unique = new Set(STARTER_SLUGS);
    expect(unique.size).toBe(5);
    for (const slug of STARTER_SLUGS) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('GET /templates/:slug — returns 200 for electoral-mobilization', async () => {
    const db = makeDb({ template_registry: () => MOCK_TEMPLATE_PHASE4 });
    const app = makeApp(db);
    const res = await app.request('/templates/electoral-mobilization');
    expect(res.status).toBe(200);
    const body = await res.json<{ slug: string; display_name: string }>();
    expect(body.slug).toBe('electoral-mobilization');
  });

  it('GET /templates/:slug — returns 404 for unapproved starter slug stub', async () => {
    const app = makeApp(makeDb()); // no handler → null → 404
    const res = await app.request('/templates/faith-community');
    expect(res.status).toBe(404);
  });

  it('GET /templates — returns approved template list without 500', async () => {
    const db = makeDb({ template_registry: () => [MOCK_TEMPLATE_PHASE4] });
    const app = makeApp(db);
    const res = await app.request('/templates');
    expect(res.status).toBe(200);
  });
});

// E25: install route — Phase 4 policy seeding + KV vocab write
describe('Phase 4 — E25: Install route policy seeding + KV vocab', () => {
  it('POST /templates/:slug/install — 404 when approved template not found', async () => {
    const db = makeDbWithBatch();
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/electoral-mobilization/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(404);
    const body = await res.json<{ error: string }>();
    expect(body.error).toContain('not found');
  });

  it('POST /templates/:slug/install — succeeds and returns 200 when template has default_policies + vocabulary', async () => {
    const kvPuts: Array<{ key: string; value: string }> = [];
    const mockKv = {
      put: async (key: string, value: string) => { kvPuts.push({ key, value }); },
      get: async () => null,
    };

    const db = makeDbWithBatch({
      'FROM template_registry WHERE slug = ? AND status': () => MOCK_TEMPLATE_PHASE4,
      'FROM profiles': () => ({ vertical_slug: null }),
      'FROM template_installations WHERE tenant_id = ? AND template_id = ?': () => null,
      'FROM policy_rules WHERE tenant_id': () => null, // no existing policies
    });

    const app = new Hono<{ Bindings: unknown }>();
    app.use('*', async (c, next) => {
      c.env = { DB: db, JWT_SECRET: 'test', ENVIRONMENT: 'development', KV: mockKv } as never;
      c.set('auth' as never, { userId: 'usr_test', tenantId: 'tnt_a', role: 'admin' } as never);
      await next();
    });
    app.route('/templates', templateRoutes);

    const res = await app.request('/templates/electoral-mobilization/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ template_slug: string }>();
    expect(body.template_slug).toBe('electoral-mobilization');
    // KV vocab was stored for this tenant+template
    expect(kvPuts.some(p => p.key === 'vocab:tnt_a:electoral-mobilization')).toBe(true);
  });

  it('POST /templates/:slug/install — skips KV write when KV binding absent', async () => {
    const db = makeDbWithBatch({
      'FROM template_registry WHERE slug = ? AND status': () => MOCK_TEMPLATE_PHASE4,
      'FROM profiles': () => ({ vertical_slug: null }),
      'FROM template_installations WHERE tenant_id = ? AND template_id = ?': () => null,
      'FROM policy_rules WHERE tenant_id': () => null,
    });

    const app = new Hono<{ Bindings: unknown }>();
    app.use('*', async (c, next) => {
      c.env = { DB: db, JWT_SECRET: 'test', ENVIRONMENT: 'development' /* no KV */ } as never;
      c.set('auth' as never, { userId: 'usr_test', tenantId: 'tnt_a', role: 'admin' } as never);
      await next();
    });
    app.route('/templates', templateRoutes);

    const res = await app.request('/templates/electoral-mobilization/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    // Should still succeed — KV is non-fatal
    expect(res.status).toBe(201);
  });

  it('POST /templates/:slug/install — reinstall path seeds policies without duplicate (existing policy skipped)', async () => {
    const policyInserts: string[] = [];
    const db = makeDbWithBatch({
      'FROM template_registry WHERE slug = ? AND status': () => MOCK_TEMPLATE_PHASE4,
      'FROM profiles': () => ({ vertical_slug: null }),
      'FROM template_installations WHERE tenant_id = ? AND template_id = ?': () => ({ id: 'inst_001', status: 'inactive' }),
      'FROM policy_rules WHERE tenant_id': () => ({ id: 'polr_existing' }), // policy already exists
    });
    const originalPrepare = db.prepare.bind(db);
    (db as ReturnType<typeof makeDbWithBatch> & { prepare: typeof db.prepare }).prepare = (q: string) => {
      const stmt = originalPrepare(q);
      if (q.includes('INSERT INTO policy_rules')) {
        policyInserts.push(q);
      }
      return stmt;
    };

    const app = new Hono<{ Bindings: unknown }>();
    app.use('*', async (c, next) => {
      c.env = { DB: db, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
      c.set('auth' as never, { userId: 'usr_test', tenantId: 'tnt_a', role: 'admin' } as never);
      await next();
    });
    app.route('/templates', templateRoutes);

    const res = await app.request('/templates/electoral-mobilization/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(201);
    // policies exist already → INSERT should NOT have been called
    expect(policyInserts).toHaveLength(0);
  });
});

// E27: onboarding template selection — tested via templates route (install + step completion)
// Full POST /onboarding/:workspaceId/template tests live in onboarding.test.ts.
// Here we verify that the install route correctly wires the Phase 4 seeder when called
// as part of the onboarding flow (same invariants: T3 tenant scope).
describe('Phase 4 — E27: Onboarding template selection invariants', () => {
  it('install route enforces tenant isolation — different tenants get separate vocab keys', async () => {
    const kvPuts: Array<{ key: string; value: string }> = [];
    const mockKv = { put: async (key: string, value: string) => { kvPuts.push({ key, value }); }, get: async () => null };

    const makeIsolatedApp = (tenantId: string) => {
      const db = makeDbWithBatch({
        'FROM template_registry WHERE slug = ? AND status': () => MOCK_TEMPLATE_PHASE4,
        'FROM profiles': () => ({ vertical_slug: null }),
        'FROM template_installations WHERE tenant_id = ? AND template_id = ?': () => null,
        'FROM policy_rules WHERE tenant_id': () => null,
      });
      const app = new Hono<{ Bindings: unknown }>();
      app.use('*', async (c, next) => {
        c.env = { DB: db, JWT_SECRET: 'test', ENVIRONMENT: 'development', KV: mockKv } as never;
        c.set('auth' as never, { userId: 'usr_test', tenantId, role: 'admin' } as never);
        await next();
      });
      app.route('/templates', templateRoutes);
      return app;
    };

    await makeIsolatedApp('tnt_alpha').request('/templates/electoral-mobilization/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    await makeIsolatedApp('tnt_beta').request('/templates/electoral-mobilization/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });

    const alphaKey = kvPuts.find(p => p.key === 'vocab:tnt_alpha:electoral-mobilization');
    const betaKey = kvPuts.find(p => p.key === 'vocab:tnt_beta:electoral-mobilization');
    expect(alphaKey).toBeDefined();
    expect(betaKey).toBeDefined();
    expect(alphaKey?.key).not.toBe(betaKey?.key);
  });

  it('install route default_policies with malformed JSON does not throw (graceful skip)', async () => {
    const brokenTemplate = {
      ...MOCK_TEMPLATE_PHASE4,
      default_policies: '{not valid json}',
      vocabulary: '{}',
    };
    const db = makeDbWithBatch({
      'FROM template_registry WHERE slug = ? AND status': () => brokenTemplate,
      'FROM profiles': () => ({ vertical_slug: null }),
      'FROM template_installations WHERE tenant_id = ? AND template_id = ?': () => null,
    });
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/electoral-mobilization/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    // Malformed policies are skipped non-fatally — route should still succeed
    expect(res.status).toBe(201);
  });
});

// ── Phase 5 (E31) — Template T04/T07/T08/T09 installation tests ─────────────

const MOCK_TEMPLATE_T04 = {
  id: 'tpl_t04_advocacy_v100',
  slug: 'advocacy-petition',
  display_name: 'Advocacy / Petition Campaign',
  description: 'End-to-end petition and advocacy campaign platform',
  template_type: 'vertical-blueprint',
  version: '1.0.0',
  platform_compat: '^1.0.0',
  compatible_verticals: '[]',
  manifest_json: '{"name":"advocacy-petition","version":"1.0.0"}',
  is_free: 1, price_kobo: 0, author_tenant_id: null, install_count: 0, status: 'approved',
  module_config: '{"modules":["groups","petitions","value_movement","broadcasts"]}',
  vocabulary: '{"Group":"Coalition","Member":"Advocate","Petition":"Demand"}',
  default_policies: JSON.stringify([{
    rule_key: 'advocacy.petition_privacy.v1', category: 'pii_access', scope: 'tenant',
    title: 'Petition Signature Privacy', description: 'Advocacy petitions support anonymous signature option.',
    condition_json: '{"allowAnonymous":true,"requiresConsent":true}', decision: 'DENY', hitl_level: null,
  }]),
  default_workflows: '[]',
};

const MOCK_TEMPLATE_T07 = {
  id: 'tpl_t07_association_v100',
  slug: 'association-cooperative',
  display_name: 'Association / Cooperative',
  description: 'Full-lifecycle member management for associations and cooperatives',
  template_type: 'vertical-blueprint',
  version: '1.0.0',
  platform_compat: '^1.0.0',
  compatible_verticals: '[]',
  manifest_json: '{"name":"association-cooperative","version":"1.0.0"}',
  is_free: 1, price_kobo: 0, author_tenant_id: null, install_count: 0, status: 'approved',
  module_config: '{"modules":["groups","value_movement","events","cases"]}',
  vocabulary: '{"Group":"Association","Member":"Member","Dues":"Levy"}',
  default_policies: JSON.stringify([{
    rule_key: 'coop.loan_approval.hitl.v1', category: 'payout_gate', scope: 'tenant',
    title: 'Cooperative Loan Approval HITL Gate', description: 'All cooperative loan requests require HITL review.',
    condition_json: '{"defaultHitlLevel":2}', decision: 'REQUIRE_HITL', hitl_level: 2,
  }]),
  default_workflows: '[]',
};

const MOCK_TEMPLATE_T08 = {
  id: 'tpl_t08_personal_assist_v100',
  slug: 'personal-assistance',
  display_name: 'Personal / Community Assistance',
  description: 'Personal fundraising and community support campaigns',
  template_type: 'vertical-blueprint',
  version: '1.0.0',
  platform_compat: '^1.0.0',
  compatible_verticals: '[]',
  manifest_json: '{"name":"personal-assistance","version":"1.0.0"}',
  is_free: 1, price_kobo: 0, author_tenant_id: null, install_count: 0, status: 'approved',
  module_config: '{"modules":["cases","value_movement","groups"],"sensitivity":"HIGH"}',
  vocabulary: '{"Group":"Support Circle","Case":"Help Request","Contribution":"Support Gift"}',
  default_policies: JSON.stringify([{
    rule_key: 'personal.campaign_pii.v1', category: 'pii_access', scope: 'tenant',
    title: 'Personal Campaign PII — High Sensitivity', description: 'High-sensitivity PII protection.',
    condition_json: '{"sensitivity":"HIGH","requiresConsent":true}', decision: 'DENY', hitl_level: null,
  }]),
  default_workflows: '[]',
};

const MOCK_TEMPLATE_T09 = {
  id: 'tpl_t09_biz_community_v100',
  slug: 'business-community',
  display_name: 'Business / Member / Customer Community',
  description: 'Community platform for businesses and membership organizations',
  template_type: 'vertical-blueprint',
  version: '1.0.0',
  platform_compat: '^1.0.0',
  compatible_verticals: '[]',
  manifest_json: '{"name":"business-community","version":"1.0.0"}',
  is_free: 1, price_kobo: 0, author_tenant_id: null, install_count: 0, status: 'approved',
  module_config: '{"modules":["groups","events","knowledge","value_movement"],"requiresPlan":"growth"}',
  vocabulary: '{"Group":"Community","Member":"Member","Coordinator":"Community Manager"}',
  default_policies: JSON.stringify([{
    rule_key: 'biz_community.commerce_plan.v1', category: 'ai_gate', scope: 'tenant',
    title: 'Business Community — Commerce Layer Plan Gate', description: 'Commerce layer requires Growth plan.',
    condition_json: '{"min_plan":"growth"}', decision: 'DENY', hitl_level: null,
  }]),
  default_workflows: '[]',
};

describe('Phase 5 (E31) — Template T04/T07/T08/T09 installation', () => {
  it('T04: POST /templates/advocacy-petition/install — returns 201 on success', async () => {
    const db = makeDbWithBatch({
      'FROM template_registry WHERE slug = ? AND status': () => MOCK_TEMPLATE_T04,
      'FROM profiles': () => ({ vertical_slug: null }),
      'FROM template_installations WHERE tenant_id = ? AND template_id = ?': () => null,
    });
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/advocacy-petition/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { installed: boolean; template_id: string; template_slug: string };
    expect(json.installed).toBe(true);
    expect(json.template_id).toBe('tpl_t04_advocacy_v100');
    expect(json.template_slug).toBe('advocacy-petition');
  });

  it('T07: POST /templates/association-cooperative/install — returns 201 on success', async () => {
    const db = makeDbWithBatch({
      'FROM template_registry WHERE slug = ? AND status': () => MOCK_TEMPLATE_T07,
      'FROM profiles': () => ({ vertical_slug: null }),
      'FROM template_installations WHERE tenant_id = ? AND template_id = ?': () => null,
    });
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/association-cooperative/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { installed: boolean; template_id: string; template_slug: string };
    expect(json.installed).toBe(true);
    expect(json.template_id).toBe('tpl_t07_association_v100');
    expect(json.template_slug).toBe('association-cooperative');
  });

  it('T08: POST /templates/personal-assistance/install — returns 201 on success', async () => {
    const db = makeDbWithBatch({
      'FROM template_registry WHERE slug = ? AND status': () => MOCK_TEMPLATE_T08,
      'FROM profiles': () => ({ vertical_slug: null }),
      'FROM template_installations WHERE tenant_id = ? AND template_id = ?': () => null,
    });
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/personal-assistance/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { installed: boolean; template_id: string; template_slug: string };
    expect(json.installed).toBe(true);
    expect(json.template_id).toBe('tpl_t08_personal_assist_v100');
    expect(json.template_slug).toBe('personal-assistance');
  });

  it('T09: POST /templates/business-community/install — returns 201 on success', async () => {
    const db = makeDbWithBatch({
      'FROM template_registry WHERE slug = ? AND status': () => MOCK_TEMPLATE_T09,
      'FROM profiles': () => ({ vertical_slug: null }),
      'FROM template_installations WHERE tenant_id = ? AND template_id = ?': () => null,
    });
    const app = makeApp(db, 'admin');
    const res = await app.request('/templates/business-community/install', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { installed: boolean; template_id: string; template_slug: string };
    expect(json.installed).toBe(true);
    expect(json.template_id).toBe('tpl_t09_biz_community_v100');
    expect(json.template_slug).toBe('business-community');
  });
});
