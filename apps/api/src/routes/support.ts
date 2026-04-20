/**
 * Support Ticket System — MED-013 (PROD-10) — P6-C
 *
 * Tenant-scoped ticket creation and management with super_admin cross-tenant view.
 *
 * Route map:
 *   POST   /support/tickets            — create ticket (auth required, T3: tenant from JWT)
 *   GET    /support/tickets            — list caller's tickets (T3 scoped)
 *   GET    /support/tickets/:id        — single ticket (T3 guard)
 *   PATCH  /support/tickets/:id        — update status/assignee (admin or super_admin only)
 *   GET    /platform/support/tickets   — super_admin only: all tickets across tenants
 *
 * Platform Invariants:
 *   T3 — tenant_id always comes from JWT, never from user-supplied input
 *   SEC — status update requires admin or super_admin role
 *   FSM — tickets: open → in_progress → resolved → closed (closed is terminal)
 *
 * Milestone 6 — Admin Platform Features (Phase 6)
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { publishEvent } from '../lib/publish-event.js';
import { SupportEventType } from '@webwaka/events';

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean }>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

type Auth = { userId: string; tenantId: string; workspaceId?: string; role?: string };

export const supportRoutes = new Hono<{ Bindings: Env }>();

// Valid status transitions (FSM)
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  open: ['in_progress', 'resolved', 'closed'],
  in_progress: ['resolved', 'closed'],
  resolved: ['closed', 'open'],
  closed: [],
};

const VALID_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;

// ---------------------------------------------------------------------------
// POST /support/tickets — create ticket
// ---------------------------------------------------------------------------

supportRoutes.post('/tickets', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth?.userId || !auth.tenantId) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const db = c.env.DB as unknown as D1Like;

  let body: {
    subject?: string;
    body?: string;
    priority?: string;
    workspaceId?: string;
  };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.subject || !body.body) {
    return c.json({ error: 'subject and body are required' }, 400);
  }

  if (body.subject.length > 200) {
    return c.json({ error: 'subject must be 200 characters or fewer' }, 400);
  }

  const priority = body.priority ?? 'normal';
  if (!VALID_PRIORITIES.includes(priority as typeof VALID_PRIORITIES[number])) {
    return c.json({ error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` }, 400);
  }

  // T3: workspaceId is required; validated to belong to caller's tenant
  const workspaceId = body.workspaceId ?? auth.workspaceId ?? '';
  if (!workspaceId) {
    return c.json({ error: 'workspaceId is required' }, 400);
  }
  const ws = await db
    .prepare('SELECT id FROM workspaces WHERE id = ? AND tenant_id = ?')
    .bind(workspaceId, auth.tenantId)
    .first<{ id: string }>();
  if (!ws) {
    return c.json({ error: 'workspace not found or does not belong to your tenant' }, 422);
  }

  const id = `tkt_${crypto.randomUUID().replace(/-/g, '')}`;
  await db
    .prepare(
      `INSERT INTO support_tickets (id, workspace_id, tenant_id, subject, body, priority)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, workspaceId, auth.tenantId, body.subject, body.body, priority)
    .run();

  // T3: scope readback to tenant to maintain invariant
  const ticket = await db
    .prepare('SELECT * FROM support_tickets WHERE id = ? AND tenant_id = ?')
    .bind(id, auth.tenantId)
    .first<Record<string, unknown>>();

  // N-086: support.ticket_created event
  void publishEvent(c.env, {
    eventId: id,
    eventKey: SupportEventType.SupportTicketCreated,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId: auth.workspaceId ?? workspaceId,
    payload: { ticket_id: id, subject: body.subject, priority },
    source: 'api',
    severity: 'info',
  });

  return c.json({ ticket }, 201);
});

// ---------------------------------------------------------------------------
// GET /support/tickets — list caller's tickets (T3 scoped)
// ---------------------------------------------------------------------------

supportRoutes.get('/tickets', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth?.userId || !auth.tenantId) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const db = c.env.DB as unknown as D1Like;

  const statusFilter = c.req.query('status');
  const rawPage = parseInt(c.req.query('page') ?? '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const perPage = 50;
  const offset = (page - 1) * perPage;

  let sql = `SELECT id, workspace_id, subject, status, priority, assignee_id, created_at, updated_at
             FROM support_tickets
             WHERE tenant_id = ?`;
  const params: unknown[] = [auth.tenantId];

  if (statusFilter) {
    sql += ' AND status = ?';
    params.push(statusFilter);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(perPage, offset);

  const stmt = db.prepare(sql);
  const { results } = await stmt.bind(...params).all<Record<string, unknown>>();

  return c.json({ tickets: results ?? [], page, perPage });
});

// ---------------------------------------------------------------------------
// GET /support/tickets/:id — single ticket (T3 guard)
// ---------------------------------------------------------------------------

supportRoutes.get('/tickets/:id', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth?.userId || !auth.tenantId) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const db = c.env.DB as unknown as D1Like;
  const ticketId = c.req.param('id');

  // T3: enforce tenant_id scope
  const ticket = await db
    .prepare('SELECT * FROM support_tickets WHERE id = ? AND tenant_id = ?')
    .bind(ticketId, auth.tenantId)
    .first<Record<string, unknown>>();

  if (!ticket) {
    return c.json({ error: 'Ticket not found' }, 404);
  }

  return c.json({ ticket });
});

// ---------------------------------------------------------------------------
// PATCH /support/tickets/:id — update status/assignee (admin+ only)
// ---------------------------------------------------------------------------

supportRoutes.patch('/tickets/:id', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth?.userId || !auth.tenantId) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const role = auth.role ?? 'member';
  if (!['admin', 'super_admin'].includes(role)) {
    return c.json({ error: 'admin or super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const ticketId = c.req.param('id');

  // T3: super_admin can update any ticket; admin scoped to their tenant
  const tenantFilter = role === 'super_admin' ? null : auth.tenantId;
  const ticket = await db
    .prepare(
      tenantFilter
        ? 'SELECT * FROM support_tickets WHERE id = ? AND tenant_id = ?'
        : 'SELECT * FROM support_tickets WHERE id = ?',
    )
    .bind(...(tenantFilter ? [ticketId, tenantFilter] : [ticketId]))
    .first<{
      id: string;
      status: string;
      priority: string;
      assignee_id: string | null;
    }>();

  if (!ticket) {
    return c.json({ error: 'Ticket not found' }, 404);
  }

  let body: { status?: string; assigneeId?: string | null; priority?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // FSM: validate status transition
  if (body.status !== undefined) {
    if (body.status === ticket.status) {
      // No-op: same status
    } else {
      const allowed = VALID_STATUS_TRANSITIONS[ticket.status] ?? [];
      if (!allowed.includes(body.status)) {
        return c.json(
          {
            error: `Cannot transition from '${ticket.status}' to '${body.status}'`,
            allowedTransitions: allowed,
          },
          422,
        );
      }
    }
  }

  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority as typeof VALID_PRIORITIES[number])) {
    return c.json({ error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` }, 400);
  }

  const newStatus = body.status ?? ticket.status;
  const newPriority = body.priority ?? ticket.priority;
  const newAssignee = body.assigneeId !== undefined ? body.assigneeId : ticket.assignee_id;

  // T3: scope UPDATE to tenant — super_admin may update cross-tenant, admin is scoped.
  await db
    .prepare(
      tenantFilter
        ? `UPDATE support_tickets
           SET status = ?, priority = ?, assignee_id = ?, updated_at = unixepoch()
           WHERE id = ? AND tenant_id = ?`
        : `UPDATE support_tickets
           SET status = ?, priority = ?, assignee_id = ?, updated_at = unixepoch()
           WHERE id = ?`,
    )
    .bind(...(tenantFilter
      ? [newStatus, newPriority, newAssignee, ticketId, tenantFilter]
      : [newStatus, newPriority, newAssignee, ticketId]))
    .run();

  // T3: scope readback to tenant
  const updated = await db
    .prepare(
      tenantFilter
        ? 'SELECT * FROM support_tickets WHERE id = ? AND tenant_id = ?'
        : 'SELECT * FROM support_tickets WHERE id = ?',
    )
    .bind(...(tenantFilter ? [ticketId, tenantFilter] : [ticketId]))
    .first<Record<string, unknown>>();

  // N-086: fire status-change events for ticket FSM transitions
  if (body.status !== undefined && body.status !== ticket.status) {
    if (body.status === 'resolved') {
      void publishEvent(c.env, {
        eventId: crypto.randomUUID(),
        eventKey: SupportEventType.SupportTicketResolved,
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorType: 'user',
        payload: { ticket_id: ticketId, resolved_by: auth.userId },
        source: 'api',
        severity: 'info',
      });
    } else if (body.status === 'closed') {
      void publishEvent(c.env, {
        eventId: crypto.randomUUID(),
        eventKey: SupportEventType.SupportTicketClosed,
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorType: 'user',
        payload: { ticket_id: ticketId, closed_by: auth.userId },
        source: 'api',
        severity: 'info',
      });
    }
  }
  // N-086: fire assigned event when assignee changes
  if (body.assigneeId !== undefined && body.assigneeId !== ticket.assignee_id && body.assigneeId) {
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: SupportEventType.SupportTicketAssigned,
      tenantId: auth.tenantId,
      actorId: auth.userId,
      actorType: 'user',
      payload: { ticket_id: ticketId, assigned_to: body.assigneeId },
      source: 'api',
      severity: 'info',
    });
  }

  return c.json({ ticket: updated });
});

// ---------------------------------------------------------------------------
// GET /platform/support/tickets — super_admin cross-tenant view
// ---------------------------------------------------------------------------

supportRoutes.get('/platform/tickets', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (auth?.role !== 'super_admin') {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;

  const statusFilter = c.req.query('status');
  const priorityFilter = c.req.query('priority');
  const rawPage = parseInt(c.req.query('page') ?? '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const perPage = 50;
  const offset = (page - 1) * perPage;

  let sql = `SELECT id, workspace_id, tenant_id, subject, status, priority, assignee_id, created_at, updated_at
             FROM support_tickets WHERE 1=1`;
  const params: unknown[] = [];

  if (statusFilter) {
    sql += ' AND status = ?';
    params.push(statusFilter);
  }
  if (priorityFilter) {
    sql += ' AND priority = ?';
    params.push(priorityFilter);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(perPage, offset);

  const stmt = db.prepare(sql);
  const { results } = await stmt.bind(...params).all<Record<string, unknown>>();

  return c.json({ tickets: results ?? [], page, perPage });
});
