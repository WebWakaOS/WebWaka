import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { superagentRoutes } from './superagent.js';

interface MockQueryResult {
  first: unknown;
  all: unknown[];
  run: { success: boolean; meta?: { changes?: number } };
}

function makeMockDB(queryResults: Record<string, MockQueryResult> = {}) {
  const defaultResult: MockQueryResult = {
    first: null,
    all: [],
    run: { success: true },
  };

  return {
    prepare: vi.fn().mockImplementation((sql: string) => {
      const result = Object.entries(queryResults).find(([key]) => sql.includes(key));
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
    batch: vi.fn().mockResolvedValue([{ success: true }, { success: true }]),
  };
}

function makeApp(opts: { userId?: string; tenantId?: string; role?: string; dbOverride?: object } = {}) {
  const app = new Hono();

  app.use('*', async (c, next) => {
    c.set('auth', {
      userId: opts.userId ?? 'usr_test',
      tenantId: opts.tenantId ?? 'tenant-test',
      role: opts.role ?? 'admin',
    } as never);

    c.env = {
      DB: opts.dbOverride ?? makeMockDB(),
      AI_ROUTER_KV: {},
    } as never;

    await next();
  });

  app.route('/superagent', superagentRoutes);
  return app;
}

describe('SuperAgent Routes — M12 Integration', () => {
  describe('POST /superagent/consent', () => {
    it('grants consent with valid body', async () => {
      const db = makeMockDB({
        'INSERT INTO superagent_consents': { first: null, all: [], run: { success: true } },
        'SELECT id FROM superagent_consents': { first: null, all: [], run: { success: true } },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'ai_chat', consent_text_hash: 'abc123', ip_hash: 'hash456' }),
      });
      expect(res.status).toBeLessThanOrEqual(201);
    });

    it('rejects consent without purpose', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /superagent/consent', () => {
    it('returns consent status', async () => {
      const db = makeMockDB({
        'SELECT': { first: null, all: [{ purpose: 'ai_chat', status: 'active', granted_at: '2026-04-01' }], run: { success: true } },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/consent');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /superagent/hitl/submit', () => {
    it('returns 201 for valid HITL submission', async () => {
      const db = makeMockDB();
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/hitl/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: 'w1',
          vertical: 'hospital',
          capability: 'bio_generator',
          hitl_level: 2,
          ai_request_payload: '{"prompt":"test"}',
        }),
      });
      expect(res.status).toBe(201);
      const json = await res.json() as { queue_item_id: string };
      expect(json.queue_item_id).toBeTruthy();
    });

    it('returns 400 without workspace_id', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/hitl/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vertical: 'hospital', capability: 'bio_generator', ai_request_payload: '{}' }),
      });
      expect(res.status).toBe(400);
      const json = await res.json() as { error: string };
      expect(json.error).toContain('workspace_id');
    });

    it('returns 400 without ai_request_payload', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/hitl/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: 'w1', vertical: 'hospital', capability: 'bio_generator' }),
      });
      expect(res.status).toBe(400);
      const json = await res.json() as { error: string };
      expect(json.error).toContain('ai_request_payload');
    });

    it('returns 400 for invalid JSON body', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/hitl/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      });
      expect(res.status).toBe(400);
    });

    it('defaults hitl_level to 1', async () => {
      const db = makeMockDB();
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/hitl/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: 'w1',
          vertical: 'clinic',
          capability: 'superagent_chat',
          ai_request_payload: '{}',
        }),
      });
      expect(res.status).toBe(201);
    });

    it('includes optional response payload', async () => {
      const db = makeMockDB();
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/hitl/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: 'w1',
          vertical: 'hospital',
          capability: 'bio_generator',
          ai_request_payload: '{}',
          ai_response_payload: '{"text":"result"}',
        }),
      });
      expect(res.status).toBe(201);
    });
  });

  describe('GET /superagent/hitl/queue', () => {
    it('returns 403 for non-admin role', async () => {
      const app = makeApp({ role: 'member' });
      const res = await app.request('/superagent/hitl/queue');
      expect(res.status).toBe(403);
    });

    it('returns items for tenant', async () => {
      const db = makeMockDB({
        'SELECT id, tenant_id': {
          first: null,
          all: [{
            id: 'q1', tenant_id: 'tenant-test', workspace_id: 'w1', user_id: 'u1',
            vertical: 'hospital', capability: 'bio_generator', hitl_level: 1,
            status: 'pending', ai_request_payload: '{}', ai_response_payload: null,
            reviewer_id: null, reviewed_at: null, review_note: null,
            expires_at: '2026-05-01T00:00:00Z', created_at: '2026-04-11T00:00:00Z',
          }],
          run: { success: true },
        },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/hitl/queue');
      expect(res.status).toBe(200);
      const json = await res.json() as { items: unknown[]; count: number };
      expect(json.count).toBe(1);
    });

    it('passes status filter as query param', async () => {
      const db = makeMockDB({
        'SELECT id, tenant_id': { first: null, all: [], run: { success: true } },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/hitl/queue?status=pending');
      expect(res.status).toBe(200);
    });

    it('passes vertical filter', async () => {
      const db = makeMockDB({
        'SELECT id, tenant_id': { first: null, all: [], run: { success: true } },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/hitl/queue?vertical=hospital');
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /superagent/hitl/:id/review', () => {
    it('returns 403 for non-admin role', async () => {
      const app = makeApp({ role: 'member' });
      const res = await app.request('/superagent/hitl/q1/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approved' }),
      });
      expect(res.status).toBe(403);
    });

    it('approves a pending item', async () => {
      const db = makeMockDB({
        'SELECT id, status, hitl_level': {
          first: { id: 'q1', status: 'pending', hitl_level: 1, expires_at: new Date(Date.now() + 86400000).toISOString(), tenant_id: 'tenant-test' },
          all: [],
          run: { success: true },
        },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/hitl/q1/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approved', note: 'LGTM' }),
      });
      expect(res.status).toBe(200);
      const json = await res.json() as { reviewed: boolean; decision: string };
      expect(json.reviewed).toBe(true);
      expect(json.decision).toBe('approved');
    });

    it('rejects with valid decision', async () => {
      const db = makeMockDB({
        'SELECT id, status, hitl_level': {
          first: { id: 'q1', status: 'pending', hitl_level: 1, expires_at: new Date(Date.now() + 86400000).toISOString(), tenant_id: 'tenant-test' },
          all: [],
          run: { success: true },
        },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/hitl/q1/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'rejected' }),
      });
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid decision', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/hitl/q1/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'maybe' }),
      });
      expect(res.status).toBe(400);
    });

    it('returns 400 for missing decision', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/hitl/q1/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    it('returns 409 for already-reviewed item', async () => {
      const db = makeMockDB({
        'SELECT id, status, hitl_level': {
          first: { id: 'q1', status: 'approved', hitl_level: 1, expires_at: new Date(Date.now() + 86400000).toISOString(), tenant_id: 'tenant-test' },
          all: [],
          run: { success: true },
        },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/hitl/q1/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approved' }),
      });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /superagent/budgets', () => {
    it('returns budgets for tenant', async () => {
      const db = makeMockDB({
        'SELECT id, tenant_id': {
          first: null,
          all: [{
            id: 'b1', tenant_id: 'tenant-test', scope: 'user', scope_id: 'u1',
            monthly_limit_wc: 500, current_month_spent_wc: 100,
            reset_at: '2026-05-01', is_active: 1,
            created_at: '2026-04-01', updated_at: '2026-04-11',
          }],
          run: { success: true },
        },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/budgets');
      expect(res.status).toBe(200);
      const json = await res.json() as { budgets: unknown[]; count: number };
      expect(json.count).toBe(1);
    });

    it('filters by scope query param', async () => {
      const db = makeMockDB({
        'SELECT id, tenant_id': { first: null, all: [], run: { success: true } },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/budgets?scope=user');
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /superagent/budgets', () => {
    it('creates a budget with valid params', async () => {
      const db = makeMockDB();
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'user', scope_id: 'u1', monthly_limit_waku_cu: 500 }),
      });
      expect(res.status).toBe(201);
      const json = await res.json() as { budget: { scope: string } };
      expect(json.budget.scope).toBe('user');
    });

    it('returns 400 for missing scope', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope_id: 'u1', monthly_limit_waku_cu: 500 }),
      });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid scope', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'invalid', scope_id: 'u1', monthly_limit_waku_cu: 500 }),
      });
      expect(res.status).toBe(400);
    });

    it('returns 400 for non-integer budget', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'user', scope_id: 'u1', monthly_limit_waku_cu: 1.5 }),
      });
      expect(res.status).toBe(400);
    });

    it('returns 400 for negative budget', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'user', scope_id: 'u1', monthly_limit_waku_cu: -10 }),
      });
      expect(res.status).toBe(400);
    });

    it('accepts zero budget', async () => {
      const db = makeMockDB();
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'workspace', scope_id: 'ws1', monthly_limit_waku_cu: 0 }),
      });
      expect(res.status).toBe(201);
    });
  });

  describe('DELETE /superagent/budgets/:id', () => {
    it('deletes existing budget', async () => {
      const db = makeMockDB({
        'UPDATE ai_spend_budgets': { first: null, all: [], run: { success: true, meta: { changes: 1 } } },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/budgets/b1', { method: 'DELETE' });
      expect(res.status).toBe(200);
      const json = await res.json() as { deleted: boolean };
      expect(json.deleted).toBe(true);
    });

    it('returns 404 for missing budget', async () => {
      const db = makeMockDB({
        'UPDATE ai_spend_budgets': { first: null, all: [], run: { success: true, meta: { changes: 0 } } },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/budgets/missing', { method: 'DELETE' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /superagent/audit/export', () => {
    it('returns anonymized export with defaults', async () => {
      const db = makeMockDB({
        'SELECT id, pillar': {
          first: null,
          all: [{
            id: 'ev1', pillar: 1, capability: 'bio_generator', provider: 'openai',
            model: 'gpt-4o-mini', input_tokens: 100, output_tokens: 50, total_tokens: 150,
            wc_charged: 10, routing_level: 1, duration_ms: 500, finish_reason: 'stop',
            created_at: '2026-04-11T10:00:00Z',
          }],
          run: { success: true },
        },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/audit/export');
      expect(res.status).toBe(200);
      const json = await res.json() as {
        export_type: string; total_events: number;
        events: { event_id: string; waku_cu_charged: number }[];
        period: { from: string; to: string };
      };
      expect(json.export_type).toBe('ai_audit');
      expect(json.total_events).toBe(1);
      expect(json.events[0]!.event_id).toBe('ev1');
      expect(json.events[0]!.waku_cu_charged).toBe(10);
    });

    it('respects date range filters', async () => {
      const db = makeMockDB({
        'SELECT id, pillar': { first: null, all: [], run: { success: true } },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/audit/export?from=2026-04-01&to=2026-04-11');
      expect(res.status).toBe(200);
      const json = await res.json() as { period: { from: string; to: string } };
      expect(json.period.from).toBe('2026-04-01');
      expect(json.period.to).toBe('2026-04-11');
    });

    it('caps limit at 5000', async () => {
      const db = makeMockDB({
        'SELECT id, pillar': { first: null, all: [], run: { success: true } },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/audit/export?limit=10000');
      expect(res.status).toBe(200);
    });

    it('does not include user_id in export (anonymized)', async () => {
      const db = makeMockDB({
        'SELECT id, pillar': {
          first: null,
          all: [{
            id: 'ev1', pillar: 1, capability: 'chat', provider: 'openai',
            model: 'gpt-4o-mini', input_tokens: 10, output_tokens: 5, total_tokens: 15,
            wc_charged: 2, routing_level: 1, duration_ms: 100, finish_reason: 'stop',
            created_at: '2026-04-11T10:00:00Z',
          }],
          run: { success: true },
        },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/audit/export');
      const json = await res.json() as { events: Record<string, unknown>[] };
      expect(json.events[0]!['user_id']).toBeUndefined();
      expect(json.events[0]!['tenant_id']).toBeUndefined();
    });
  });

  describe('GET /superagent/ndpr/register', () => {
    it('returns register export', async () => {
      const db = makeMockDB({
        'SELECT id, tenant_id': {
          first: null,
          all: [{
            id: 'a1', tenant_id: 'tenant-test', activity_name: 'Bio Gen',
            purpose: 'Generate', legal_basis: 'Consent',
            data_categories: 'Profile', data_subjects: 'Users',
            recipients: 'AI', retention_period: '12m',
            security_measures: 'AES', vertical: 'hospital', capability: 'bio_generator',
            is_active: 1, last_reviewed_at: null,
            created_at: '2026-04-01', updated_at: '2026-04-11',
          }],
          run: { success: true },
        },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/ndpr/register');
      expect(res.status).toBe(200);
      const json = await res.json() as { totalActivities: number };
      expect(json.totalActivities).toBe(1);
    });
  });

  describe('POST /superagent/ndpr/register/seed', () => {
    it('seeds register and returns count', async () => {
      const db = makeMockDB();
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/ndpr/register/seed', { method: 'POST' });
      expect(res.status).toBe(201);
      const json = await res.json() as { seeded: number; message: string };
      expect(typeof json.seeded).toBe('number');
      expect(json.message).toContain('registered');
    });
  });

  describe('PATCH /superagent/ndpr/register/:id/review', () => {
    it('marks entry as reviewed', async () => {
      const db = makeMockDB({
        'UPDATE ai_processing_register': { first: null, all: [], run: { success: true, meta: { changes: 1 } } },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/ndpr/register/a1/review', { method: 'PATCH' });
      expect(res.status).toBe(200);
      const json = await res.json() as { reviewed: boolean };
      expect(json.reviewed).toBe(true);
    });

    it('returns 404 for missing entry', async () => {
      const db = makeMockDB({
        'UPDATE ai_processing_register': { first: null, all: [], run: { success: true, meta: { changes: 0 } } },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/ndpr/register/missing/review', { method: 'PATCH' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /superagent/compliance/check', () => {
    it('returns sensitive status for hospital', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/compliance/check?vertical=hospital');
      expect(res.status).toBe(200);
      const json = await res.json() as { vertical: string; is_sensitive: boolean; sector: string; requires_hitl: boolean };
      expect(json.is_sensitive).toBe(true);
      expect(json.sector).toBe('medical');
      expect(json.requires_hitl).toBe(true);
    });

    it('returns non-sensitive for church', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/compliance/check?vertical=church');
      expect(res.status).toBe(200);
      const json = await res.json() as { is_sensitive: boolean; requires_hitl: boolean };
      expect(json.is_sensitive).toBe(false);
      expect(json.requires_hitl).toBe(false);
    });

    it('returns 400 without vertical param', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/compliance/check');
      expect(res.status).toBe(400);
    });

    it('returns HITL level for legal vertical', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/compliance/check?vertical=legal');
      expect(res.status).toBe(200);
      const json = await res.json() as { hitl_level: number; requires_hitl: boolean; disclaimers: string[] };
      expect(json.requires_hitl).toBe(true);
      expect(json.hitl_level).toBeGreaterThanOrEqual(1);
      expect(json.disclaimers.length).toBeGreaterThan(0);
    });

    it('returns HITL level for political vertical', async () => {
      const app = makeApp();
      const res = await app.request('/superagent/compliance/check?vertical=politician');
      expect(res.status).toBe(200);
      const json = await res.json() as { hitl_level: number; requires_hitl: boolean };
      expect(json.requires_hitl).toBe(true);
      expect(json.hitl_level).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /superagent/usage', () => {
    it('returns usage events for user', async () => {
      const db = makeMockDB({
        'SELECT id, pillar': {
          first: null,
          all: [{
            id: 'ev1', pillar: 1, capability: 'bio_generator', provider: 'openai',
            model: 'gpt-4o-mini', input_tokens: 100, output_tokens: 50,
            cost_waku_cu: 10, routing_level: 1, finish_reason: 'stop',
            created_at: '2026-04-11T10:00:00Z',
          }],
          run: { success: true },
        },
      });
      const app = makeApp({ dbOverride: db });
      const res = await app.request('/superagent/usage');
      expect(res.status).toBe(200);
      const json = await res.json() as { usage: unknown[]; count: number };
      expect(json.count).toBe(1);
    });
  });
});
