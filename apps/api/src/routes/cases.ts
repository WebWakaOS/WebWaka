/**
 * @webwaka/api — Cases routes (Phase 1)
 *
 * POST   /cases                      — open a new case (ndprConsented required)
 * GET    /cases                      — list workspace cases (filterable)
 * GET    /cases/summary              — dashboard summary stats
 * GET    /cases/:id                  — get case
 * POST   /cases/:id/assign           — assign to agent
 * POST   /cases/:id/notes            — add note
 * GET    /cases/:id/notes            — list notes
 * POST   /cases/:id/resolve          — resolve case
 * POST   /cases/:id/close            — close resolved case
 * POST   /cases/:id/reopen           — reopen closed/resolved case
 *
 * Entitlement: starter+ plan required (assertCasesEnabled).
 * T3: tenantId from JWT on every query.
 * P10: ndprConsented required on create.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import {
  createCase, getCase, listCases, assignCase, addNote,
  listNotes, resolveCase, closeCase, reopenCase, getCaseSummary,
  assertCasesEnabled,
} from '@webwaka/cases';
import { CaseEventType } from '@webwaka/events';
import { publishEvent } from '../lib/publish-event.js';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

export const casesRoutes = new Hono<AppEnv>();

// ── Validation schemas ────────────────────────────────────────────────────

const CreateCaseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  category: z.enum(['general', 'complaint', 'inquiry', 'support', 'compliance', 'electoral', 'welfare']).optional(),
  sourceChannel: z.enum(['web', 'ussd', 'whatsapp', 'sms', 'voice', 'in_person', 'api']).optional(),
  groupId: z.string().uuid().optional(),
  slaDueAt: z.number().int().optional(),
  ndprConsented: z.literal(true),  // P10: must be explicit true
  tags: z.array(z.string().max(50)).max(10).optional(),
});

const AssignSchema = z.object({
  assignedToUserId: z.string().min(1),
});

const AddNoteSchema = z.object({
  body: z.string().min(1).max(5000),
  noteType: z.enum(['comment', 'status_change', 'assignment', 'system', 'resolution']).optional(),
  isInternal: z.boolean().optional(),
});

const ResolveSchema = z.object({
  resolutionNote: z.string().min(1).max(2000),
});

const ReopenSchema = z.object({
  reason: z.string().min(1).max(500),
});

const ListQuerySchema = z.object({
  status: z.enum(['open', 'assigned', 'in_progress', 'pending_review', 'resolved', 'closed', 'reopened']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  assignedTo: z.string().optional(),
  groupId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// ── POST /cases ────────────────────────────────────────────────────────────

casesRoutes.post('/', zValidator('json', CreateCaseSchema), async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, plan } = auth;

  try {
    assertCasesEnabled(plan);
  } catch (err) {
    return c.json({ error: 'ENTITLEMENT_DENIED', message: (err as Error).message }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const parsed = c.req.valid('json');

  const newCase = await createCase(db as never, {
    tenantId, workspaceId,
    title: parsed.title,
    description: parsed.description,
    priority: parsed.priority,
    category: parsed.category,
    sourceChannel: parsed.sourceChannel,
    groupId: parsed.groupId,
    slaDueAt: parsed.slaDueAt,
    ndprConsented: parsed.ndprConsented,
    tags: parsed.tags,
    reportedByUserId: auth.userId,
  });

  await publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: CaseEventType.CaseOpened,
    tenantId, workspaceId,
    aggregateId: newCase.id,
    aggregateType: 'case',
    actorId: auth.userId,
    payload: { caseId: newCase.id, title: newCase.title, priority: newCase.priority },
  });

  return c.json({ case: newCase }, 201);
});

// ── GET /cases ─────────────────────────────────────────────────────────────

casesRoutes.get('/', zValidator('query', ListQuerySchema), async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, plan } = auth;

  try { assertCasesEnabled(plan); } catch (err) {
    return c.json({ error: 'ENTITLEMENT_DENIED', message: (err as Error).message }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const q = c.req.valid('query');

  const cases = await listCases(db as never, {
    tenantId, workspaceId,
    status: q.status,
    priority: q.priority,
    assignedToUserId: q.assignedTo,
    groupId: q.groupId,
    limit: q.limit,
    offset: q.offset,
  });

  return c.json({ cases, total: cases.length });
});

// ── GET /cases/summary ─────────────────────────────────────────────────────

casesRoutes.get('/summary', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, plan } = auth;

  try { assertCasesEnabled(plan); } catch (err) {
    return c.json({ error: 'ENTITLEMENT_DENIED', message: (err as Error).message }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const summary = await getCaseSummary(db as never, tenantId, workspaceId);
  return c.json({ summary });
});

// ── GET /cases/:id ────────────────────────────────────────────────────────

casesRoutes.get('/:id', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;

  const found = await getCase(db as never, c.req.param('id'), auth.tenantId);
  if (!found) return c.json({ error: 'NOT_FOUND' }, 404);

  return c.json({ case: found });
});

// ── POST /cases/:id/assign ─────────────────────────────────────────────────

casesRoutes.post('/:id/assign', zValidator('json', AssignSchema), async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;
  const { assignedToUserId } = c.req.valid('json');

  try {
    const updated = await assignCase(db as never, {
      caseId: c.req.param('id'), tenantId: auth.tenantId,
      assignedToUserId, assignedByUserId: auth.userId!,
    });

    await publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: CaseEventType.CaseAssigned,
      tenantId: auth.tenantId, workspaceId: auth.workspaceId,
      aggregateId: updated.id, aggregateType: 'case',
      actorId: auth.userId,
      payload: { caseId: updated.id, assignedToUserId },
    });

    return c.json({ case: updated });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('CASE_NOT_FOUND')) return c.json({ error: 'NOT_FOUND' }, 404);
    throw err;
  }
});

// ── POST /cases/:id/notes ──────────────────────────────────────────────────

casesRoutes.post('/:id/notes', zValidator('json', AddNoteSchema), async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;
  const parsed = c.req.valid('json');

  const note = await addNote(db as never, {
    caseId: c.req.param('id'), tenantId: auth.tenantId,
    authorId: auth.userId!, body: parsed.body,
    noteType: parsed.noteType, isInternal: parsed.isInternal,
  });

  await publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: CaseEventType.CaseNoteAdded,
    tenantId: auth.tenantId, workspaceId: auth.workspaceId,
    aggregateId: c.req.param('id'), aggregateType: 'case',
    actorId: auth.userId,
    payload: { noteId: note.id, isInternal: note.isInternal },
  });

  return c.json({ note }, 201);
});

// ── GET /cases/:id/notes ───────────────────────────────────────────────────

casesRoutes.get('/:id/notes', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;
  const includeInternal = c.req.query('internal') === 'true';

  const notes = await listNotes(db as never, c.req.param('id'), auth.tenantId, includeInternal);
  return c.json({ notes });
});

// ── POST /cases/:id/resolve ────────────────────────────────────────────────

casesRoutes.post('/:id/resolve', zValidator('json', ResolveSchema), async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;

  try {
    const resolved = await resolveCase(db as never, {
      caseId: c.req.param('id'), tenantId: auth.tenantId,
      resolvedByUserId: auth.userId!, resolutionNote: c.req.valid('json').resolutionNote,
    });

    await publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: CaseEventType.CaseResolved,
      tenantId: auth.tenantId, workspaceId: auth.workspaceId,
      aggregateId: resolved.id, aggregateType: 'case',
      actorId: auth.userId,
      payload: { caseId: resolved.id },
    });

    return c.json({ case: resolved });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('CASE_NOT_FOUND')) return c.json({ error: 'NOT_FOUND' }, 404);
    throw err;
  }
});

// ── POST /cases/:id/close ──────────────────────────────────────────────────

casesRoutes.post('/:id/close', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;

  const closed = await closeCase(db as never, {
    caseId: c.req.param('id'), tenantId: auth.tenantId,
    closedByUserId: auth.userId!,
  });

  await publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: CaseEventType.CaseClosed,
    tenantId: auth.tenantId, workspaceId: auth.workspaceId,
    aggregateId: closed.id, aggregateType: 'case',
    actorId: auth.userId,
    payload: { caseId: closed.id },
  });

  return c.json({ case: closed });
});

// ── POST /cases/:id/reopen ─────────────────────────────────────────────────

casesRoutes.post('/:id/reopen', zValidator('json', ReopenSchema), async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;

  const reopened = await reopenCase(db as never, {
    caseId: c.req.param('id'), tenantId: auth.tenantId,
    reopenedByUserId: auth.userId!, reason: c.req.valid('json').reason,
  });

  await publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: CaseEventType.CaseReopened,
    tenantId: auth.tenantId, workspaceId: auth.workspaceId,
    aggregateId: reopened.id, aggregateType: 'case',
    actorId: auth.userId,
    payload: { caseId: reopened.id },
  });

  return c.json({ case: reopened });
});
