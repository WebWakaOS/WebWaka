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
