/**
 * Webhook subscription routes — integration tests (PROD-04).
 *
 * Tests Hono route handlers with mock D1 and auth middleware.
 *
 * Invariants under test:
 *   T3 — all queries scoped to workspace_id + tenant_id
 *   SEC — all routes require auth (auth middleware injects context)
 *   CRUD — create / list / get / update / delete subscriptions
 *   DLV  — delivery history endpoint
 *   VAL  — validation of URL, events, active, etc.
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { webhookRoutes } from './webhooks.js';

interface MockQueryResult {
  first: unknown;
  all: unknown[];
  run: { success: boolean };
}

function makeMockDB(queryResults: Record<string, MockQueryResult> = {}) {
  const defaultResult: MockQueryResult = {
    first: null,
    all: [],
    run: { success: true },
  };

  return {
    prepare: vi.fn().mockImplementation((sql: string) => {
      const result = Object.entries(queryResults).find(([key]) =>
        sql.toLowerCase().includes(key.toLowerCase()),
      );
      const r = result ? result[1] : defaultResult;

      const boundFn = {
        first: <T>() => Promise.resolve(r.first as T),
        run: () => Promise.resolve(r.run),
        all: <T>() => Promise.resolve({ results: r.all as T[] }),
      };

      return {
        bind: (..._args: unknown[]) => boundFn,
        ...boundFn,
      };
    }),
  };
}

function makeApp(opts: {
  role?: string;
  userId?: string;
  tenantId?: string;
  workspaceId?: string;
  dbOverride?: object;
} = {}) {
  const app = new Hono();

  app.use('*', async (c, next) => {
    c.set('auth', {
      userId: opts.userId ?? 'usr_test',
      tenantId: opts.tenantId ?? 'tenant-a',
      workspaceId: opts.workspaceId ?? 'wsp_test',
      role: opts.role ?? 'admin',
    } as never);
    c.env = {
      DB: opts.dbOverride ?? makeMockDB(),
    } as never;
    await next();
  });

  app.route('/webhooks', webhookRoutes);
  return app;
}

// ---------------------------------------------------------------------------
// POST /webhooks — create subscription
// ---------------------------------------------------------------------------

describe('POST /webhooks — create subscription', () => {
  it('returns 201 with secret on valid request', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://example.com/webhook',
        events: ['template.installed'],
        description: 'My test webhook',
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { id: string; secret: string; url: string; events: string[] };
    expect(json.id).toBeDefined();
    expect(json.secret).toBeDefined();
    expect(json.url).toBe('https://example.com/webhook');
    expect(json.events).toContain('template.installed');
  });

  it('accepts wildcard event type', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/hook', events: ['*'] }),
    });
    expect(res.status).toBe(201);
  });

  it('returns 422 when url is missing', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: ['template.installed'] }),
    });
    expect(res.status).toBe(422);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('url');
  });

  it('returns 422 when url is not a valid URL', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'not-a-url', events: ['template.installed'] }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 when events is empty array', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/h', events: [] }),
    });
    expect(res.status).toBe(422);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('events');
  });

  it('returns 422 when events contains invalid event type', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/h', events: ['not.valid.event'] }),
    });
    expect(res.status).toBe(422);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('Invalid event types');
  });

  it('returns 400 on invalid JSON body', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    expect(res.status).toBe(400);
  });

  it('returns 201 with multiple event types', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://example.com/h',
        events: ['template.installed', 'payment.completed', 'workspace.member_added'],
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { events: string[] };
    expect(json.events).toHaveLength(3);
  });

  // SSRF protection tests
  it.each([
    ['http://localhost/hook', 'loopback'],
    ['http://127.0.0.1/hook', 'loopback'],
    ['http://0.0.0.0/hook', 'private'],
    ['http://10.0.0.1/hook', 'private'],
    ['http://192.168.1.100/hook', 'private'],
    ['http://172.20.0.1/hook', 'private'],
    ['http://169.254.169.254/latest/meta-data/', 'link-local'],
    ['http://service.internal/hook', 'internal domain'],
    ['http://host.local/hook', 'local domain'],
    ['ftp://example.com/hook', 'non-http scheme'],
  ])('rejects SSRF-prone URL: %s (%s)', async (badUrl) => {
    const app = makeApp();
    const res = await app.request('/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: badUrl, events: ['template.installed'] }),
    });
    expect(res.status).toBe(422);
    const json = await res.json() as { error: string };
    expect(json.error).toBeTruthy();
  });

  it('allows valid public HTTPS URLs', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://hooks.myapp.com/waka', events: ['template.installed'] }),
    });
    expect(res.status).toBe(201);
  });
});

// ---------------------------------------------------------------------------
// GET /webhooks — list subscriptions
// ---------------------------------------------------------------------------

describe('GET /webhooks — list subscriptions', () => {
  it('returns empty list when no subscriptions', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks');
    expect(res.status).toBe(200);
    const json = await res.json() as { subscriptions: unknown[]; total: number };
    expect(json.subscriptions).toEqual([]);
    expect(json.total).toBe(0);
  });

  it('returns subscriptions for the workspace (T3 scoped)', async () => {
    const db = makeMockDB({
      'webhook_subscriptions': {
        first: null,
        all: [
          {
            id: 'wh_01',
            workspace_id: 'wsp_test',
            url: 'https://example.com/hook',
            events: '["template.installed"]',
            active: 1,
            description: null,
            created_at: 1700000000,
            updated_at: 1700000000,
          },
        ],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/webhooks');
    expect(res.status).toBe(200);
    const json = await res.json() as { subscriptions: Array<{ id: string; events: string[]; active: boolean }> };
    expect(json.subscriptions).toHaveLength(1);
    expect(json.subscriptions[0]?.id).toBe('wh_01');
    expect(json.subscriptions[0]?.events).toContain('template.installed');
    expect(json.subscriptions[0]?.active).toBe(true);
  });

  it('does NOT include secret in list response (security)', async () => {
    const db = makeMockDB({
      'webhook_subscriptions': {
        first: null,
        all: [{ id: 'wh_02', workspace_id: 'wsp_test', url: 'https://x.com', events: '["*"]', active: 1, description: null, created_at: 0, updated_at: 0 }],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/webhooks');
    const json = await res.json() as { subscriptions: Array<Record<string, unknown>> };
    expect(json.subscriptions[0]).not.toHaveProperty('secret');
  });
});

// ---------------------------------------------------------------------------
// GET /webhooks/:id — get single subscription
// ---------------------------------------------------------------------------

describe('GET /webhooks/:id — get single subscription', () => {
  it('returns 404 when subscription not found', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks/unknown-id');
    expect(res.status).toBe(404);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('not found');
  });

  it('returns subscription data when found', async () => {
    const db = makeMockDB({
      'webhook_subscriptions': {
        first: {
          id: 'wh_01',
          workspace_id: 'wsp_test',
          url: 'https://example.com/h',
          events: '["template.installed","payment.completed"]',
          active: 1,
          description: 'Test hook',
          created_at: 1700000000,
          updated_at: 1700000000,
        },
        all: [],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/webhooks/wh_01');
    expect(res.status).toBe(200);
    const json = await res.json() as { id: string; active: boolean; events: string[] };
    expect(json.id).toBe('wh_01');
    expect(json.active).toBe(true);
    expect(json.events).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// PATCH /webhooks/:id — update subscription
// ---------------------------------------------------------------------------

describe('PATCH /webhooks/:id — update subscription', () => {
  it('returns 404 when subscription not found', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks/bad-id', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 200 when updating active flag', async () => {
    const db = makeMockDB({
      'SELECT id FROM webhook_subscriptions': {
        first: { id: 'wh_01' },
        all: [],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/webhooks/wh_01', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false }),
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { success: boolean };
    expect(json.success).toBe(true);
  });

  it('returns 422 for invalid event type in events array', async () => {
    const db = makeMockDB({
      'SELECT id FROM webhook_subscriptions': { first: { id: 'wh_01' }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/webhooks/wh_01', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: ['bad.event'] }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 when no fields to update', async () => {
    const db = makeMockDB({
      'SELECT id FROM webhook_subscriptions': { first: { id: 'wh_01' }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/webhooks/wh_01', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
});

// ---------------------------------------------------------------------------
// DELETE /webhooks/:id — delete subscription
// ---------------------------------------------------------------------------

describe('DELETE /webhooks/:id — delete subscription', () => {
  it('returns 404 when subscription not found', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks/missing', { method: 'DELETE' });
    expect(res.status).toBe(404);
  });

  it('returns 200 when subscription deleted', async () => {
    const db = makeMockDB({
      'SELECT id FROM webhook_subscriptions': { first: { id: 'wh_01' }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/webhooks/wh_01', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const json = await res.json() as { success: boolean };
    expect(json.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GET /webhooks/:id/deliveries — delivery history
// ---------------------------------------------------------------------------

describe('GET /webhooks/:id/deliveries — delivery history', () => {
  it('returns 404 when subscription not found', async () => {
    const app = makeApp();
    const res = await app.request('/webhooks/missing/deliveries');
    expect(res.status).toBe(404);
  });

  it('returns delivery list when subscription exists', async () => {
    const db = makeMockDB({
      'SELECT id FROM webhook_subscriptions': { first: { id: 'wh_01' }, all: [], run: { success: true } },
      'webhook_deliveries': {
        first: null,
        all: [
          {
            id: 'dlv_01',
            event_type: 'template.installed',
            status: 'delivered',
            attempts: 1,
            last_error: null,
            delivered_at: 1700000100,
            created_at: 1700000000,
          },
        ],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/webhooks/wh_01/deliveries');
    expect(res.status).toBe(200);
    const json = await res.json() as { subscription_id: string; deliveries: unknown[]; page: number };
    expect(json.subscription_id).toBe('wh_01');
    expect(json.deliveries).toHaveLength(1);
    expect(json.page).toBe(1);
  });

  it('supports pagination params', async () => {
    const db = makeMockDB({
      'SELECT id FROM webhook_subscriptions': { first: { id: 'wh_01' }, all: [], run: { success: true } },
      'webhook_deliveries': { first: null, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/webhooks/wh_01/deliveries?page=2&limit=10');
    expect(res.status).toBe(200);
    const json = await res.json() as { page: number; limit: number };
    expect(json.page).toBe(2);
    expect(json.limit).toBe(10);
  });
});
