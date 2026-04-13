/**
 * Partner management routes — integration tests (M11).
 *
 * Tests actual Hono route handlers with mock D1 database, following the
 * established pattern from social.test.ts / community.test.ts.
 *
 * Invariants under test:
 *   T3 — partner_id scoping on all queries (super_admin cross-tenant)
 *   T5 — entitlement-gated delegation (delegation_rights, max_sub_partners)
 *   SEC — super_admin role guard on all routes
 *   FSM — partner status: pending → active → suspended → deactivated (terminal)
 *   FSM — sub-partner status: active → suspended → deactivated (terminal)
 *
 * Governance: partner-and-subpartner-model.md Phase 1+2
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { partnerRoutes } from './partners.js';

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
  };
}

function makeApp(opts: { role?: string; userId?: string; dbOverride?: object } = {}): Hono {
  const app = new Hono();

  app.use('*', async (c, next) => {
    c.set('auth', {
      userId: opts.userId ?? 'usr_admin',
      tenantId: 'tenant-root',
      workspaceId: 'wsp_root',
      role: opts.role ?? 'super_admin',
      permissions: [],
    } as never);
    c.env = {
      DB: opts.dbOverride ?? makeMockDB(),
    } as never;
    await next();
  });

  app.route('/partners', partnerRoutes);
  return app;
}

describe('Partner routes — Auth guards', () => {
  it('GET /partners returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'admin' });
    const res = await app.request('/partners');
    expect(res.status).toBe(403);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('super_admin');
  });

  it('POST /partners returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'member' });
    const res = await app.request('/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', workspaceId: 'w1', companyName: 'Test', contactEmail: 'a@b.com' }),
    });
    expect(res.status).toBe(403);
  });

  it('GET /partners/:id returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'admin' });
    const res = await app.request('/partners/prt_123');
    expect(res.status).toBe(403);
  });

  it('PATCH /partners/:id/status returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'member' });
    const res = await app.request('/partners/prt_123/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    });
    expect(res.status).toBe(403);
  });

  it('GET /partners/:id/sub-partners returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'admin' });
    const res = await app.request('/partners/prt_123/sub-partners');
    expect(res.status).toBe(403);
  });

  it('POST /partners/:id/sub-partners returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'member' });
    const res = await app.request('/partners/prt_123/sub-partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', workspaceId: 'w1' }),
    });
    expect(res.status).toBe(403);
  });

  it('PATCH /partners/:id/sub-partners/:subId/status returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'admin' });
    const res = await app.request('/partners/prt_123/sub-partners/sp_456/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(res.status).toBe(403);
  });

  it('GET /partners/:id/entitlements returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'member' });
    const res = await app.request('/partners/prt_123/entitlements');
    expect(res.status).toBe(403);
  });

  it('POST /partners/:id/entitlements returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'admin' });
    const res = await app.request('/partners/prt_123/entitlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dimension: 'ai_access', value: 'basic' }),
    });
    expect(res.status).toBe(403);
  });
});

describe('GET /partners — list all', () => {
  it('returns 200 with empty partners list', async () => {
    const app = makeApp();
    const res = await app.request('/partners');
    expect(res.status).toBe(200);
    const json = await res.json() as { partners: unknown[]; total: number };
    expect(json.partners).toEqual([]);
    expect(json.total).toBe(0);
  });

  it('returns 200 with partners when data exists', async () => {
    const db = makeMockDB({
      'SELECT id': {
        first: null,
        all: [
          { id: 'prt_1', company_name: 'Acme', status: 'active' },
          { id: 'prt_2', company_name: 'Beta', status: 'pending' },
        ],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners');
    expect(res.status).toBe(200);
    const json = await res.json() as { partners: unknown[]; total: number };
    expect(json.total).toBe(2);
  });
});

describe('POST /partners — register', () => {
  it('returns 400 for missing required fields', async () => {
    const app = makeApp();
    const res = await app.request('/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: 'Test' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('tenantId');
  });

  it('returns 400 for invalid email', async () => {
    const app = makeApp();
    const res = await app.request('/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 't1', workspaceId: 'w1',
        companyName: 'Test', contactEmail: 'not-an-email',
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('email');
  });

  it('returns 400 for fractional maxSubPartners', async () => {
    const app = makeApp();
    const res = await app.request('/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 't1', workspaceId: 'w1',
        companyName: 'Test', contactEmail: 'a@b.com',
        maxSubPartners: 1.5,
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('maxSubPartners');
  });

  it('returns 400 for negative maxSubPartners', async () => {
    const app = makeApp();
    const res = await app.request('/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 't1', workspaceId: 'w1',
        companyName: 'Test', contactEmail: 'a@b.com',
        maxSubPartners: -1,
      }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for maxSubPartners exceeding 1000', async () => {
    const app = makeApp();
    const res = await app.request('/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 't1', workspaceId: 'w1',
        companyName: 'Test', contactEmail: 'a@b.com',
        maxSubPartners: 1001,
      }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 404 when workspace does not belong to tenant', async () => {
    const app = makeApp();
    const res = await app.request('/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 't1', workspaceId: 'w1',
        companyName: 'Acme', contactEmail: 'admin@acme.com',
      }),
    });
    expect(res.status).toBe(404);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('Workspace');
  });

  it('returns 201 when workspace exists and all fields valid', async () => {
    const created = { id: 'prt_new', company_name: 'Acme', status: 'pending' };
    const db = makeMockDB({
      'SELECT id FROM workspaces': { first: { id: 'w1' }, all: [], run: { success: true } },
      'INSERT INTO partners': { first: null, all: [], run: { success: true } },
      'SELECT * FROM partners': { first: created, all: [], run: { success: true } },
      'INSERT INTO partner_audit_log': { first: null, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 't1', workspaceId: 'w1',
        companyName: 'Acme', contactEmail: 'admin@acme.com',
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { partner: typeof created };
    expect(json.partner.company_name).toBe('Acme');
  });

  it('returns 400 for invalid JSON body', async () => {
    const app = makeApp();
    const res = await app.request('/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /partners/:id — detail', () => {
  it('returns 404 when partner not found', async () => {
    const app = makeApp();
    const res = await app.request('/partners/prt_unknown');
    expect(res.status).toBe(404);
  });

  it('returns 200 with partner data', async () => {
    const partnerRow = { id: 'prt_1', company_name: 'Acme', status: 'active' };
    const db = makeMockDB({
      'SELECT * FROM partners': { first: partnerRow, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1');
    expect(res.status).toBe(200);
    const json = await res.json() as { partner: typeof partnerRow };
    expect(json.partner.id).toBe('prt_1');
  });
});

describe('PATCH /partners/:id/status — status FSM', () => {
  it('returns 404 when partner not found', async () => {
    const app = makeApp();
    const res = await app.request('/partners/prt_missing/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid status value', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': {
        first: { id: 'prt_1', status: 'pending' },
        all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'banned' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('pending, active, suspended, deactivated');
  });

  it('returns 409 when trying to reactivate a deactivated partner', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': {
        first: { id: 'prt_1', status: 'deactivated' },
        all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    });
    expect(res.status).toBe(409);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('reactivated');
  });

  it('returns 200 when transitioning pending → active', async () => {
    const updatedPartner = { id: 'prt_1', status: 'active', onboarded_at: '2026-04-11' };
    const db = makeMockDB({
      'SELECT id, status FROM partners': {
        first: { id: 'prt_1', status: 'pending' },
        all: [], run: { success: true },
      },
      'UPDATE partners': { first: null, all: [], run: { success: true } },
      'SELECT * FROM partners': { first: updatedPartner, all: [], run: { success: true } },
      'INSERT INTO partner_audit_log': { first: null, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { partner: typeof updatedPartner };
    expect(json.partner.status).toBe('active');
  });

  it('allows deactivated → deactivated (no-op)', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': {
        first: { id: 'prt_1', status: 'deactivated' },
        all: [], run: { success: true },
      },
      'UPDATE partners': { first: null, all: [], run: { success: true } },
      'SELECT * FROM partners': {
        first: { id: 'prt_1', status: 'deactivated' },
        all: [], run: { success: true },
      },
      'INSERT INTO partner_audit_log': { first: null, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'deactivated' }),
    });
    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid JSON body', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': {
        first: { id: 'prt_1', status: 'pending' },
        all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /partners/:id/sub-partners — list', () => {
  it('returns 404 when parent partner not found', async () => {
    const app = makeApp();
    const res = await app.request('/partners/prt_missing/sub-partners');
    expect(res.status).toBe(404);
  });

  it('returns 200 with empty sub-partners list', async () => {
    const db = makeMockDB({
      'SELECT id FROM partners': { first: { id: 'prt_1' }, all: [], run: { success: true } },
      'SELECT id, partner_id': { first: null, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/sub-partners');
    expect(res.status).toBe(200);
    const json = await res.json() as { subPartners: unknown[]; total: number };
    expect(json.subPartners).toEqual([]);
    expect(json.total).toBe(0);
  });
});

describe('POST /partners/:id/sub-partners — create', () => {
  it('returns 404 when parent partner not found', async () => {
    const app = makeApp();
    const res = await app.request('/partners/prt_missing/sub-partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', workspaceId: 'w1' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 409 when partner is not active', async () => {
    const db = makeMockDB({
      'SELECT id, status, max_sub_partners FROM partners': {
        first: { id: 'prt_1', status: 'pending', max_sub_partners: 10 },
        all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/sub-partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', workspaceId: 'w1' }),
    });
    expect(res.status).toBe(409);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('active');
  });

  it('returns 403 when partner lacks delegation_rights entitlement', async () => {
    const db = makeMockDB({
      'SELECT id, status, max_sub_partners FROM partners': {
        first: { id: 'prt_1', status: 'active', max_sub_partners: 10 },
        all: [], run: { success: true },
      },
      'delegation_rights': { first: null, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/sub-partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', workspaceId: 'w1' }),
    });
    expect(res.status).toBe(403);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('delegation_rights');
  });

  it('returns 409 when sub-partner limit reached', async () => {
    const db = makeMockDB({
      'SELECT id, status, max_sub_partners FROM partners': {
        first: { id: 'prt_1', status: 'active', max_sub_partners: 2 },
        all: [], run: { success: true },
      },
      'delegation_rights': { first: { value: '1' }, all: [], run: { success: true } },
      'max_sub_partners': { first: null, all: [], run: { success: true } },
      'COUNT': { first: { cnt: 2 }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/sub-partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', workspaceId: 'w1' }),
    });
    expect(res.status).toBe(409);
    const json = await res.json() as { error: string; limit: number };
    expect(json.error).toContain('limit');
    expect(json.limit).toBe(2);
  });

  it('returns 400 when tenantId or workspaceId missing', async () => {
    const db = makeMockDB({
      'SELECT id, status, max_sub_partners FROM partners': {
        first: { id: 'prt_1', status: 'active', max_sub_partners: 10 },
        all: [], run: { success: true },
      },
      'delegation_rights': { first: { value: '1' }, all: [], run: { success: true } },
      'max_sub_partners': { first: null, all: [], run: { success: true } },
      'COUNT': { first: { cnt: 0 }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/sub-partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 201 when all conditions met', async () => {
    const created = { id: 'sp_new', partner_id: 'prt_1', status: 'active' };
    const db = makeMockDB({
      'SELECT id, status, max_sub_partners FROM partners': {
        first: { id: 'prt_1', status: 'active', max_sub_partners: 10 },
        all: [], run: { success: true },
      },
      'delegation_rights': { first: { value: '1' }, all: [], run: { success: true } },
      'max_sub_partners': { first: null, all: [], run: { success: true } },
      'COUNT': { first: { cnt: 0 }, all: [], run: { success: true } },
      'SELECT id FROM workspaces': { first: { id: 'w1' }, all: [], run: { success: true } },
      'INSERT INTO sub_partners': { first: null, all: [], run: { success: true } },
      'SELECT * FROM sub_partners': { first: created, all: [], run: { success: true } },
      'INSERT INTO partner_audit_log': { first: null, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/sub-partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', workspaceId: 'w1' }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { subPartner: typeof created };
    expect(json.subPartner.partner_id).toBe('prt_1');
  });
});

describe('PATCH /partners/:id/sub-partners/:subId/status — sub-partner FSM', () => {
  it('returns 404 when sub-partner not found', async () => {
    const db = makeMockDB({
      'SELECT id, partner_id, status FROM sub_partners': {
        first: null, all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/sub-partners/sp_missing/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid sub-partner status', async () => {
    const db = makeMockDB({
      'SELECT id, partner_id, status FROM sub_partners': {
        first: { id: 'sp_1', partner_id: 'prt_1', status: 'active' },
        all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/sub-partners/sp_1/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pending' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('active, suspended, deactivated');
  });

  it('returns 409 when trying to reactivate deactivated sub-partner', async () => {
    const db = makeMockDB({
      'SELECT id, partner_id, status FROM sub_partners': {
        first: { id: 'sp_1', partner_id: 'prt_1', status: 'deactivated' },
        all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/sub-partners/sp_1/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    });
    expect(res.status).toBe(409);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('reactivated');
  });

  it('returns 200 when suspending an active sub-partner', async () => {
    const updated = { id: 'sp_1', partner_id: 'prt_1', status: 'suspended' };
    const db = makeMockDB({
      'SELECT id, partner_id, status FROM sub_partners': {
        first: { id: 'sp_1', partner_id: 'prt_1', status: 'active' },
        all: [], run: { success: true },
      },
      'UPDATE sub_partners': { first: null, all: [], run: { success: true } },
      'SELECT * FROM sub_partners': { first: updated, all: [], run: { success: true } },
      'INSERT INTO partner_audit_log': { first: null, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/sub-partners/sp_1/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { subPartner: typeof updated };
    expect(json.subPartner.status).toBe('suspended');
  });
});

describe('GET /partners/:id/entitlements — list', () => {
  it('returns 404 when partner not found', async () => {
    const app = makeApp();
    const res = await app.request('/partners/prt_missing/entitlements');
    expect(res.status).toBe(404);
  });

  it('returns 200 with entitlements list', async () => {
    const db = makeMockDB({
      'SELECT id FROM partners': { first: { id: 'prt_1' }, all: [], run: { success: true } },
      'SELECT id, partner_id': {
        first: null,
        all: [
          { id: 'pe_1', dimension: 'white_label_depth', value: '2' },
          { id: 'pe_2', dimension: 'delegation_rights', value: '1' },
        ],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/entitlements');
    expect(res.status).toBe(200);
    const json = await res.json() as { entitlements: unknown[] };
    expect(json.entitlements.length).toBe(2);
  });
});

describe('POST /partners/:id/entitlements — grant', () => {
  it('returns 404 when partner not found', async () => {
    const app = makeApp();
    const res = await app.request('/partners/prt_missing/entitlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dimension: 'ai_access', value: 'basic' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 for missing dimension or value', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': {
        first: { id: 'prt_1', status: 'active' },
        all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/entitlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dimension: 'ai_access' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('value');
  });

  it('returns 400 for unknown dimension', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': {
        first: { id: 'prt_1', status: 'active' },
        all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/entitlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dimension: 'super_powers', value: 'yes' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('dimension');
  });

  it('returns 400 for invalid white_label_depth value', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': {
        first: { id: 'prt_1', status: 'active' },
        all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/entitlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dimension: 'white_label_depth', value: '3' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('white_label_depth');
  });

  it('returns 400 for invalid delegation_rights value', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': {
        first: { id: 'prt_1', status: 'active' },
        all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/entitlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dimension: 'delegation_rights', value: '2' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('delegation_rights');
  });

  it('returns 400 for invalid ai_access value', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': {
        first: { id: 'prt_1', status: 'active' },
        all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/entitlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dimension: 'ai_access', value: 'unlimited' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('ai_access');
  });

  it('returns 201 when granting a valid entitlement', async () => {
    const entitlement = { id: 'pe_1', partner_id: 'prt_1', dimension: 'ai_access', value: 'byok' };
    const db = makeMockDB({
      'SELECT id, status FROM partners': {
        first: { id: 'prt_1', status: 'active' },
        all: [], run: { success: true },
      },
      'INSERT INTO partner_entitlements': { first: null, all: [], run: { success: true } },
      'SELECT * FROM partner_entitlements': { first: entitlement, all: [], run: { success: true } },
      'INSERT INTO partner_audit_log': { first: null, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/entitlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dimension: 'ai_access', value: 'byok' }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { entitlement: typeof entitlement };
    expect(json.entitlement.dimension).toBe('ai_access');
    expect(json.entitlement.value).toBe('byok');
  });

  it('accepts white_label_depth value of 0 (no white-label)', async () => {
    const entitlement = { id: 'pe_1', dimension: 'white_label_depth', value: '0' };
    const db = makeMockDB({
      'SELECT id, status FROM partners': {
        first: { id: 'prt_1', status: 'active' },
        all: [], run: { success: true },
      },
      'INSERT INTO partner_entitlements': { first: null, all: [], run: { success: true } },
      'SELECT * FROM partner_entitlements': { first: entitlement, all: [], run: { success: true } },
      'INSERT INTO partner_audit_log': { first: null, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/entitlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dimension: 'white_label_depth', value: '0' }),
    });
    expect(res.status).toBe(201);
  });
});

describe('POST /partners/:id/sub-partners — entitlement override precedence', () => {
  it('entitlement max_sub_partners overrides partners table default', async () => {
    const db = makeMockDB({
      'SELECT id, status, max_sub_partners FROM partners': {
        first: { id: 'prt_1', status: 'active', max_sub_partners: 10 },
        all: [], run: { success: true },
      },
      'delegation_rights': { first: { value: '1' }, all: [], run: { success: true } },
      'max_sub_partners': { first: { value: '2' }, all: [], run: { success: true } },
      'COUNT': { first: { cnt: 2 }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/sub-partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', workspaceId: 'w1' }),
    });
    expect(res.status).toBe(409);
    const json = await res.json() as { limit: number };
    expect(json.limit).toBe(2);
  });

  it('falls back to partners table default when entitlement value is malformed', async () => {
    const db = makeMockDB({
      'SELECT id, status, max_sub_partners FROM partners': {
        first: { id: 'prt_1', status: 'active', max_sub_partners: 5 },
        all: [], run: { success: true },
      },
      'delegation_rights': { first: { value: '1' }, all: [], run: { success: true } },
      'max_sub_partners': { first: { value: 'invalid' }, all: [], run: { success: true } },
      'COUNT': { first: { cnt: 5 }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/sub-partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', workspaceId: 'w1' }),
    });
    expect(res.status).toBe(409);
    const json = await res.json() as { limit: number };
    expect(json.limit).toBe(5);
  });
});

describe('PATCH /partners/:id/sub-partners/:subId/status — partner scoping (T3)', () => {
  it('sub-partner lookup is scoped to partner_id (not just subId)', async () => {
    const db = makeMockDB({
      'SELECT id, partner_id, status FROM sub_partners': {
        first: null, all: [], run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_WRONG/sub-partners/sp_1/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(res.status).toBe(404);

    const prepareCalls = (db.prepare as ReturnType<typeof vi.fn>).mock.calls as string[][];
    const selectCall = prepareCalls.find(
      (c) => c[0] !== undefined && c[0].includes('SELECT') && c[0].includes('sub_partners'),
    );
    expect(selectCall).toBeTruthy();
    expect(selectCall?.[0]).toContain('partner_id');
  });
});

describe('Partner ID generation patterns', () => {
  it('partner IDs start with prt_', () => {
    const id = `prt_${crypto.randomUUID().replace(/-/g, '')}`;
    expect(id.startsWith('prt_')).toBe(true);
    expect(id.length).toBeGreaterThan(10);
  });

  it('sub-partner IDs start with sp_', () => {
    const id = `sp_${crypto.randomUUID().replace(/-/g, '')}`;
    expect(id.startsWith('sp_')).toBe(true);
  });

  it('entitlement IDs start with pe_', () => {
    const id = `pe_${crypto.randomUUID().replace(/-/g, '')}`;
    expect(id.startsWith('pe_')).toBe(true);
  });

  it('audit log IDs start with pal_', () => {
    const id = `pal_${crypto.randomUUID().replace(/-/g, '')}`;
    expect(id.startsWith('pal_')).toBe(true);
  });

  it('generated IDs are unique', () => {
    const ids = new Set(
      Array.from({ length: 10 }, () => `prt_${crypto.randomUUID().replace(/-/g, '')}`),
    );
    expect(ids.size).toBe(10);
  });
});

describe('Email validation', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmails = ['admin@webwaka.ng', 'partner@company.com', 'test+tag@domain.co.ng'];
  const invalidEmails = ['notanemail', 'missing@', '@nodomain.com', ''];

  it.each(validEmails)('accepts valid email "%s"', (email) => {
    expect(emailRegex.test(email)).toBe(true);
  });

  it.each(invalidEmails)('rejects invalid email "%s"', (email) => {
    expect(emailRegex.test(email)).toBe(false);
  });
});

// ===========================================================================
// P5 — Partner Model Phase 3: Credits, Allocations, Settlements
// ===========================================================================

describe('P5 — GET /partners/:id/credits — WakaCU credit pool balance', () => {
  it('returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'admin' });
    const res = await app.request('/partners/prt_1/credits');
    expect(res.status).toBe(403);
  });

  it('returns 404 when partner not found', async () => {
    const app = makeApp();
    const res = await app.request('/partners/prt_missing/credits');
    expect(res.status).toBe(404);
  });

  it('returns 200 with wallet data and total allocated', async () => {
    const db = makeMockDB({
      'SELECT id, tenant_id FROM partners': {
        first: { id: 'prt_1', tenant_id: 'ten_partner_1' },
        all: [],
        run: { success: true },
      },
      'wc_wallets': {
        first: {
          balance_wc: 4500,
          lifetime_purchased_wc: 10000,
          lifetime_spent_wc: 5500,
          spend_cap_monthly_wc: 2000,
          current_month_spent_wc: 300,
        },
        all: [],
        run: { success: true },
      },
      'SUM(amount_wc)': {
        first: { total_allocated: 1200 },
        all: [],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/credits');
    expect(res.status).toBe(200);
    const json = await res.json() as {
      partnerId: string;
      tenantId: string;
      wallet: { balanceWc: number };
      totalAllocatedWc: number;
    };
    expect(json.partnerId).toBe('prt_1');
    expect(json.tenantId).toBe('ten_partner_1');
    expect(json.wallet?.balanceWc).toBe(4500);
    expect(json.totalAllocatedWc).toBe(1200);
  });

  it('returns null wallet when no wallet row exists', async () => {
    const db = makeMockDB({
      'SELECT id, tenant_id FROM partners': {
        first: { id: 'prt_2', tenant_id: 'ten_partner_2' },
        all: [],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_2/credits');
    expect(res.status).toBe(200);
    const json = await res.json() as { wallet: null; totalAllocatedWc: number };
    expect(json.wallet).toBeNull();
    expect(json.totalAllocatedWc).toBe(0);
  });
});

describe('P5 — POST /partners/:id/credits/allocate — credit allocation', () => {
  it('returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'member' });
    const res = await app.request('/partners/prt_1/credits/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientTenant: 'ten_sub', amountWc: 100 }),
    });
    expect(res.status).toBe(403);
  });

  it('returns 404 when partner not found', async () => {
    const app = makeApp();
    const res = await app.request('/partners/prt_missing/credits/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientTenant: 'ten_sub', amountWc: 100 }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 422 when partner is not active', async () => {
    const db = makeMockDB({
      'SELECT id, tenant_id, status FROM partners': {
        first: { id: 'prt_1', tenant_id: 'ten_1', status: 'suspended' },
        all: [],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/credits/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientTenant: 'ten_sub', amountWc: 100 }),
    });
    expect(res.status).toBe(422);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('active');
  });

  it('returns 400 when amountWc is not a positive integer (P9)', async () => {
    const db = makeMockDB({
      'SELECT id, tenant_id, status FROM partners': {
        first: { id: 'prt_1', tenant_id: 'ten_1', status: 'active' },
        all: [],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/credits/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientTenant: 'ten_sub', amountWc: 100.5 }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('positive integer');
  });

  it('returns 422 when recipient is not an active sub-tenant of this partner', async () => {
    const db = makeMockDB({
      'SELECT id, tenant_id, status FROM partners': {
        first: { id: 'prt_1', tenant_id: 'ten_1', status: 'active' },
        all: [],
        run: { success: true },
      },
      'sub_partners': {
        first: null,
        all: [],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/credits/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientTenant: 'ten_stranger', amountWc: 100 }),
    });
    expect(res.status).toBe(422);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('sub-tenant');
  });

  it('returns 422 when partner has insufficient WakaCU balance', async () => {
    const db = makeMockDB({
      'SELECT id, tenant_id, status FROM partners': {
        first: { id: 'prt_1', tenant_id: 'ten_1', status: 'active' },
        all: [],
        run: { success: true },
      },
      'sub_partners': {
        first: { id: 'sp_1' },
        all: [],
        run: { success: true },
      },
      'wc_wallets': {
        first: { balance_wc: 50 },
        all: [],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/credits/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientTenant: 'ten_sub_1', amountWc: 500 }),
    });
    expect(res.status).toBe(422);
    const json = await res.json() as { error: string; available: number; requested: number };
    expect(json.error).toContain('Insufficient');
    expect(json.available).toBe(50);
    expect(json.requested).toBe(500);
  });

  it('returns 201 and deducts balance when allocation succeeds', async () => {
    const db = makeMockDB({
      'SELECT id, tenant_id, status FROM partners': {
        first: { id: 'prt_1', tenant_id: 'ten_partner', status: 'active' },
        all: [],
        run: { success: true },
      },
      'sub_partners': {
        first: { id: 'sp_1' },
        all: [],
        run: { success: true },
      },
      'wc_wallets': {
        first: { balance_wc: 5000 },
        all: [],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/credits/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientTenant: 'ten_sub_1', amountWc: 500, note: 'Monthly allocation' }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as {
      amountWc: number;
      partnerBalanceAfter: number;
      recipientBalanceAfter: number;
      allocationId: string;
    };
    expect(json.amountWc).toBe(500);
    expect(json.partnerBalanceAfter).toBe(4500);
    expect(json.recipientBalanceAfter).toBe(5500);
    expect(json.allocationId.startsWith('pca_')).toBe(true);
  });

  it('amountWc is always a positive integer in the response (P9)', async () => {
    const db = makeMockDB({
      'SELECT id, tenant_id, status FROM partners': {
        first: { id: 'prt_1', tenant_id: 'ten_partner', status: 'active' },
        all: [],
        run: { success: true },
      },
      'sub_partners': {
        first: { id: 'sp_1' },
        all: [],
        run: { success: true },
      },
      'wc_wallets': {
        first: { balance_wc: 10000 },
        all: [],
        run: { success: true },
      },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/credits/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientTenant: 'ten_sub_1', amountWc: 1000 }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { amountWc: number; partnerBalanceAfter: number };
    expect(Number.isInteger(json.amountWc)).toBe(true);
    expect(Number.isInteger(json.partnerBalanceAfter)).toBe(true);
  });
});

describe('P5 — GET /partners/:id/credits/history — allocation history', () => {
  it('returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'viewer' });
    const res = await app.request('/partners/prt_1/credits/history');
    expect(res.status).toBe(403);
  });

  it('returns 404 when partner not found', async () => {
    const app = makeApp();
    const res = await app.request('/partners/prt_ghost/credits/history');
    expect(res.status).toBe(404);
  });

  it('returns paginated allocation history', async () => {
    const rows = [
      { id: 'pca_1', recipient_tenant: 'ten_a', amount_wc: 200, note: 'Q1', allocated_by: 'usr_admin', created_at: '2026-04-01' },
      { id: 'pca_2', recipient_tenant: 'ten_b', amount_wc: 500, note: null, allocated_by: 'usr_admin', created_at: '2026-04-02' },
    ];
    const db = makeMockDB({
      'SELECT id FROM partners': { first: { id: 'prt_1' }, all: [], run: { success: true } },
      'partner_credit_allocations': { first: null, all: rows, run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/credits/history');
    expect(res.status).toBe(200);
    const json = await res.json() as { allocations: typeof rows; page: number };
    expect(json.allocations).toHaveLength(2);
    expect(json.page).toBe(1);
  });
});

describe('P5 — POST /partners/:id/settlements/calculate — revenue share (P9)', () => {
  it('returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'admin' });
    const res = await app.request('/partners/prt_1/settlements/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodStart: '2026-03-01', periodEnd: '2026-03-31', grossGmvKobo: 1000000, shareBasisPoints: 500 }),
    });
    expect(res.status).toBe(403);
  });

  it('returns 404 when partner not found', async () => {
    const app = makeApp();
    const res = await app.request('/partners/prt_missing/settlements/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodStart: '2026-03-01', periodEnd: '2026-03-31', grossGmvKobo: 500000, shareBasisPoints: 300 }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 when grossGmvKobo is not an integer (P9 invariant)', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': { first: { id: 'prt_1', status: 'active' }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/settlements/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodStart: '2026-03-01', periodEnd: '2026-03-31', grossGmvKobo: 100000.50, shareBasisPoints: 500 }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('P9');
  });

  it('returns 400 when shareBasisPoints is not an integer (P9 invariant)', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': { first: { id: 'prt_1', status: 'active' }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/settlements/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodStart: '2026-03-01', periodEnd: '2026-03-31', grossGmvKobo: 100000, shareBasisPoints: 5.5 }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('P9');
  });

  it('returns 400 when shareBasisPoints exceeds 10000', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': { first: { id: 'prt_1', status: 'active' }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/settlements/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodStart: '2026-03-01', periodEnd: '2026-03-31', grossGmvKobo: 100000, shareBasisPoints: 15000 }),
    });
    expect(res.status).toBe(400);
  });

  it('calculates integer revenue share correctly (P9 — no floats)', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': { first: { id: 'prt_1', status: 'active' }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/settlements/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        periodStart: '2026-03-01',
        periodEnd: '2026-03-31',
        grossGmvKobo: 1000000,
        shareBasisPoints: 500,
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as {
      grossGmvKobo: number;
      platformFeeKobo: number;
      partnerShareKobo: number;
      shareBasisPoints: number;
      status: string;
    };
    // 500 bps = 5% partner share
    expect(json.grossGmvKobo).toBe(1000000);
    expect(json.partnerShareKobo).toBe(50000);
    expect(json.platformFeeKobo).toBe(950000);
    expect(json.shareBasisPoints).toBe(500);
    expect(json.status).toBe('pending');
    // P9: all amounts must be integers (never floats)
    expect(Number.isInteger(json.partnerShareKobo)).toBe(true);
    expect(Number.isInteger(json.platformFeeKobo)).toBe(true);
  });

  it('partnerShareKobo + platformFeeKobo always equals grossGmvKobo (P9 conservation)', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': { first: { id: 'prt_1', status: 'active' }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    // Use 333 bps (non-round number) to stress-test integer arithmetic
    const res = await app.request('/partners/prt_1/settlements/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        periodStart: '2026-04-01',
        periodEnd: '2026-04-30',
        grossGmvKobo: 750000,
        shareBasisPoints: 333,
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as {
      grossGmvKobo: number;
      platformFeeKobo: number;
      partnerShareKobo: number;
    };
    expect(json.partnerShareKobo + json.platformFeeKobo).toBe(json.grossGmvKobo);
  });

  it('settlement ID starts with ps_', async () => {
    const db = makeMockDB({
      'SELECT id, status FROM partners': { first: { id: 'prt_1', status: 'active' }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/settlements/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodStart: '2026-03-01', periodEnd: '2026-03-31', grossGmvKobo: 200000, shareBasisPoints: 750 }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { settlementId: string };
    expect(json.settlementId.startsWith('ps_')).toBe(true);
  });
});

describe('P5 — GET /partners/:id/settlements — list settlements', () => {
  it('returns 403 for non-super_admin', async () => {
    const app = makeApp({ role: 'admin' });
    const res = await app.request('/partners/prt_1/settlements');
    expect(res.status).toBe(403);
  });

  it('returns 404 when partner not found', async () => {
    const app = makeApp();
    const res = await app.request('/partners/prt_ghost/settlements');
    expect(res.status).toBe(404);
  });

  it('returns empty list when no settlements', async () => {
    const db = makeMockDB({
      'SELECT id FROM partners': { first: { id: 'prt_1' }, all: [], run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/settlements');
    expect(res.status).toBe(200);
    const json = await res.json() as { settlements: unknown[] };
    expect(json.settlements).toHaveLength(0);
  });

  it('returns paginated settlement list', async () => {
    const rows = [
      {
        id: 'ps_1',
        period_start: '2026-03-01',
        period_end: '2026-03-31',
        gross_gmv_kobo: 1000000,
        platform_fee_kobo: 950000,
        partner_share_kobo: 50000,
        share_basis_points: 500,
        status: 'pending',
        calculated_by: 'usr_admin',
        calculated_at: '2026-04-01',
        approved_by: null,
        approved_at: null,
        paid_at: null,
        notes: null,
      },
    ];
    const db = makeMockDB({
      'SELECT id FROM partners': { first: { id: 'prt_1' }, all: [], run: { success: true } },
      'partner_settlements': { first: null, all: rows, run: { success: true } },
    });
    const app = makeApp({ dbOverride: db });
    const res = await app.request('/partners/prt_1/settlements');
    expect(res.status).toBe(200);
    const json = await res.json() as { settlements: typeof rows; page: number };
    expect(json.settlements).toHaveLength(1);
    expect(json.settlements[0]!.partner_share_kobo).toBe(50000);
    expect(json.page).toBe(1);
  });
});
