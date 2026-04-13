/**
 * Support Ticket System route tests — P6-C
 *
 * Invariants under test:
 *   T3  — tenant_id always sourced from JWT; tenants cannot read each other's tickets
 *   SEC — status updates require admin or super_admin role
 *   FSM — valid status transitions only (closed is terminal)
 *   P6-C — all CRUD operations, plus super_admin cross-tenant view
 *
 * Phase 6 — Admin Platform Features
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { supportRoutes } from './support.js';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

const TICKET_FIXTURE = {
  id: 'tkt_abc123',
  workspace_id: 'wsp_tenant1',
  tenant_id: 'tenant-1',
  subject: 'Cannot log in',
  body: 'I receive a 401 every time I try to log in.',
  priority: 'high',
  status: 'open',
  assignee_id: null,
  created_at: 1700000000,
  updated_at: 1700000000,
};

function makeMockDB(opts: {
  findTicket?: object | null;
  findWorkspace?: object | null;
} = {}) {
  const ticket = opts.findTicket !== undefined ? opts.findTicket : TICKET_FIXTURE;
  const workspace = opts.findWorkspace !== undefined ? opts.findWorkspace : { id: 'wsp_tenant1' };

  return {
    prepare: vi.fn().mockImplementation((_sql: string) => {
      const bound = {
        first: <T>() => {
          if (_sql.includes('support_tickets')) return Promise.resolve(ticket as T);
          if (_sql.includes('workspaces')) return Promise.resolve(workspace as T);
          return Promise.resolve(null as T);
        },
        all: <T>() => Promise.resolve({ results: (ticket ? [ticket] : []) as T[] }),
        run: () => Promise.resolve({ success: true }),
      };
      return { bind: (..._: unknown[]) => bound, ...bound };
    }),
  };
}

function makeApp(opts: {
  role?: string;
  tenantId?: string;
  userId?: string;
  dbOverride?: object;
  noAuth?: boolean;
} = {}): Hono {
  const app = new Hono();

  app.use('*', async (c, next) => {
    if (!opts.noAuth) {
      c.set('auth', {
        userId: opts.userId ?? 'usr_123',
        tenantId: opts.tenantId ?? 'tenant-1',
        workspaceId: 'wsp_tenant1',
        role: opts.role ?? 'member',
        permissions: [],
      } as never);
    }
    c.env = { DB: opts.dbOverride ?? makeMockDB() } as never;
    await next();
  });

  app.route('/support', supportRoutes);
  return app;
}

// ---------------------------------------------------------------------------
// POST /support/tickets — create ticket
// ---------------------------------------------------------------------------

describe('POST /support/tickets', () => {
  it('creates a ticket and returns 201 with ticket object', async () => {
    const app = makeApp();
    const res = await app.request('/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Cannot log in',
        body: 'I get a 401 on every attempt.',
        priority: 'high',
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { ticket: unknown };
    expect(json.ticket).toBeDefined();
  });

  it('returns 401 with no auth', async () => {
    const app = makeApp({ noAuth: true });
    const res = await app.request('/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'Test', body: 'Body' }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 when subject is missing', async () => {
    const app = makeApp();
    const res = await app.request('/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: 'No subject provided' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is missing', async () => {
    const app = makeApp();
    const res = await app.request('/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'My ticket' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when subject exceeds 200 characters', async () => {
    const app = makeApp();
    const res = await app.request('/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'x'.repeat(201), body: 'Some content' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid priority value', async () => {
    const app = makeApp();
    const res = await app.request('/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'Test', body: 'Body', priority: 'critical' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('priority');
  });

  it('returns 400 for invalid JSON body', async () => {
    const app = makeApp();
    const res = await app.request('/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    expect(res.status).toBe(400);
  });

  it('T3: accepts all valid priority values', async () => {
    const priorities = ['low', 'normal', 'high', 'urgent'];
    const app = makeApp();
    for (const priority of priorities) {
      const res = await app.request('/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'Priority test', body: 'Content', priority }),
      });
      expect(res.status).toBe(201);
    }
  });
});

// ---------------------------------------------------------------------------
// GET /support/tickets — list tenant's tickets
// ---------------------------------------------------------------------------

describe('GET /support/tickets', () => {
  it('returns 200 with paginated ticket list', async () => {
    const app = makeApp();
    const res = await app.request('/support/tickets');
    expect(res.status).toBe(200);
    const json = await res.json() as { tickets: unknown[]; page: number; perPage: number };
    expect(Array.isArray(json.tickets)).toBe(true);
    expect(json.page).toBe(1);
    expect(json.perPage).toBe(50);
  });

  it('returns 401 with no auth', async () => {
    const app = makeApp({ noAuth: true });
    const res = await app.request('/support/tickets');
    expect(res.status).toBe(401);
  });

  it('passes ?status filter', async () => {
    const app = makeApp();
    const res = await app.request('/support/tickets?status=open');
    expect(res.status).toBe(200);
  });

  it('respects ?page parameter', async () => {
    const app = makeApp();
    const res = await app.request('/support/tickets?page=2');
    expect(res.status).toBe(200);
    const json = await res.json() as { page: number };
    expect(json.page).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// GET /support/tickets/:id — single ticket (T3 guard)
// ---------------------------------------------------------------------------

describe('GET /support/tickets/:id', () => {
  it('returns 200 with ticket when found', async () => {
    const app = makeApp();
    const res = await app.request('/support/tickets/tkt_abc123');
    expect(res.status).toBe(200);
    const json = await res.json() as { ticket: { id: string } };
    expect(json.ticket).toBeDefined();
    expect(json.ticket.id).toBe('tkt_abc123');
  });

  it('returns 404 when ticket not found or T3 mismatch', async () => {
    const app = makeApp({ dbOverride: makeMockDB({ findTicket: null }) });
    const res = await app.request('/support/tickets/nonexistent');
    expect(res.status).toBe(404);
  });

  it('returns 401 with no auth', async () => {
    const app = makeApp({ noAuth: true });
    const res = await app.request('/support/tickets/tkt_abc123');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// PATCH /support/tickets/:id — status/assignee update (admin+ only)
// ---------------------------------------------------------------------------

describe('PATCH /support/tickets/:id — Auth & Role guards', () => {
  it('returns 403 for member role', async () => {
    const app = makeApp({ role: 'member' });
    const res = await app.request('/support/tickets/tkt_abc123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    expect(res.status).toBe(403);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('admin');
  });

  it('returns 401 with no auth', async () => {
    const app = makeApp({ noAuth: true });
    const res = await app.request('/support/tickets/tkt_abc123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    expect(res.status).toBe(401);
  });
});

describe('PATCH /support/tickets/:id — FSM transitions', () => {
  it('admin can update ticket status to in_progress (valid transition from open)', async () => {
    const openTicket = { ...TICKET_FIXTURE, status: 'open' };
    const app = makeApp({ role: 'admin', dbOverride: makeMockDB({ findTicket: openTicket }) });
    const res = await app.request('/support/tickets/tkt_abc123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    expect(res.status).toBe(200);
  });

  it('returns 422 for invalid FSM transition (open → pending is not a valid status)', async () => {
    const openTicket = { ...TICKET_FIXTURE, status: 'open' };
    const app = makeApp({ role: 'admin', dbOverride: makeMockDB({ findTicket: openTicket }) });
    const res = await app.request('/support/tickets/tkt_abc123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pending' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 when trying to transition from closed (terminal state)', async () => {
    const closedTicket = { ...TICKET_FIXTURE, status: 'closed' };
    const app = makeApp({ role: 'admin', dbOverride: makeMockDB({ findTicket: closedTicket }) });
    const res = await app.request('/support/tickets/tkt_abc123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'open' }),
    });
    expect(res.status).toBe(422);
    const json = await res.json() as { error: string };
    expect(json.error).toMatch(/closed|terminal|transition/i);
  });

  it('returns 404 when ticket not found', async () => {
    const app = makeApp({ role: 'admin', dbOverride: makeMockDB({ findTicket: null }) });
    const res = await app.request('/support/tickets/no-such-ticket', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid JSON body', async () => {
    const app = makeApp({ role: 'admin' });
    const res = await app.request('/support/tickets/tkt_abc123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /platform/support/tickets — super_admin cross-tenant view
// ---------------------------------------------------------------------------

describe('GET /platform/support/tickets — super_admin cross-tenant view', () => {
  it('returns 200 with all tickets for super_admin', async () => {
    const app = new Hono();
    app.use('*', async (c, next) => {
      c.set('auth', {
        userId: 'usr_ops',
        tenantId: 'tenant-root',
        workspaceId: 'wsp_root',
        role: 'super_admin',
        permissions: [],
      } as never);
      c.env = { DB: makeMockDB() } as never;
      await next();
    });
    app.route('/platform/support', supportRoutes);

    const res = await app.request('/platform/support/platform/tickets');
    expect(res.status).toBe(200);
    const json = await res.json() as { tickets: unknown[]; page: number; perPage: number };
    expect(Array.isArray(json.tickets)).toBe(true);
    expect(typeof json.page).toBe('number');
    expect(typeof json.perPage).toBe('number');
  });

  it('returns 403 for admin role on cross-tenant view', async () => {
    const app = new Hono();
    app.use('*', async (c, next) => {
      c.set('auth', {
        userId: 'usr_admin',
        tenantId: 'tenant-1',
        workspaceId: 'wsp_1',
        role: 'admin',
        permissions: [],
      } as never);
      c.env = { DB: makeMockDB() } as never;
      await next();
    });
    app.route('/platform/support', supportRoutes);

    const res = await app.request('/platform/support/platform/tickets');
    expect(res.status).toBe(403);
  });
});
