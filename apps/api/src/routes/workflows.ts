/**
 * Workflow Engine Routes — Phase 2 T003
 *
 * GET    /workflows                          — list workflow definitions
 * GET    /workflows/:key                     — get workflow definition + steps
 * POST   /workflows/:key/start               — start workflow instance
 * GET    /workflow-instances                 — list instances for tenant
 * GET    /workflow-instances/:id             — get instance
 * POST   /workflow-instances/:id/advance     — advance instance (HITL decision)
 *
 * Platform Invariants:
 *   T3 — tenantId from JWT on every instance query
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import {
  getWorkflowDefinition,
  listWorkflowDefinitions,
  getWorkflowSteps,
  startWorkflow,
  advanceWorkflow,
  getWorkflowInstance,
  listWorkflowInstances,
} from '@webwaka/workflows';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean }>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

export const workflowRoutes = new Hono<AppEnv>();

// ── Schemas ────────────────────────────────────────────────────────────────

const StartWorkflowSchema = z.object({
  entityType: z.string().min(1).max(80),
  entityId: z.string().min(1).max(100),
  payload: z.record(z.unknown()).optional(),
});

const AdvanceSchema = z.object({
  decision: z.enum(['approve', 'reject', 'complete']),
  note: z.string().max(1000).optional(),
});

// ── Routes ─────────────────────────────────────────────────────────────────

workflowRoutes.get('/definitions', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const db = c.env.DB as unknown as D1Like;
  const definitions = await listWorkflowDefinitions(db);
  return c.json({ definitions });
});

workflowRoutes.get('/definitions/:key', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const db = c.env.DB as unknown as D1Like;
  const defn = await getWorkflowDefinition(db, c.req.param('key'));
  if (!defn) return c.json({ error: 'not_found' }, 404);

  const steps = await getWorkflowSteps(db, defn.id);
  return c.json({ definition: defn, steps });
});

workflowRoutes.post('/definitions/:key/start', zValidator('json', StartWorkflowSchema), async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const body = c.req.valid('json');
  const db = c.env.DB as unknown as D1Like;

  try {
    const instance = await startWorkflow(db, {
      tenantId: auth.tenantId,
      workspaceId: auth.workspaceId ?? auth.tenantId,
      workflowKey: c.req.param('key'),
      entityType: body.entityType,
      entityId: body.entityId,
      initiatedBy: auth.userId,
      payload: body.payload,
    });
    return c.json({ instance }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('WORKFLOW_NOT_FOUND')) return c.json({ error: 'workflow_not_found' }, 404);
    throw err;
  }
});

workflowRoutes.get('/instances', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const workflowKey = c.req.query('workflowKey');
  const db = c.env.DB as unknown as D1Like;
  const instances = await listWorkflowInstances(db, auth.tenantId, workflowKey);
  return c.json({ instances });
});

workflowRoutes.get('/instances/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const db = c.env.DB as unknown as D1Like;
  const instance = await getWorkflowInstance(db, c.req.param('id'), auth.tenantId);
  if (!instance) return c.json({ error: 'not_found' }, 404);
  return c.json({ instance });
});

workflowRoutes.post('/instances/:id/advance', zValidator('json', AdvanceSchema), async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const body = c.req.valid('json');
  const db = c.env.DB as unknown as D1Like;

  try {
    const instance = await advanceWorkflow(db, {
      tenantId: auth.tenantId,
      instanceId: c.req.param('id'),
      actorId: auth.userId,
      decision: body.decision,
      note: body.note,
    });
    return c.json({ instance });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('NOT_FOUND')) return c.json({ error: 'not_found' }, 404);
    if (msg.includes('INVALID_STATE')) return c.json({ error: msg }, 409);
    throw err;
  }
});
