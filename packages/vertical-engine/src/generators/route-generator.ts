/**
 * @webwaka/vertical-engine — Route Generator
 *
 * Given a VerticalConfig, generates standard Hono route handlers for:
 *   POST /           — Create profile
 *   GET  /:id        — Get profile by ID
 *   PATCH /:id       — Update profile
 *   POST /:id/advance — FSM state transition
 *   GET  /workspace/:workspaceId — Get by workspace
 *   + Sub-entity CRUD routes
 *
 * Platform Invariants:
 *   T3: tenant_id from auth context or header
 *   P9: Kobo validation on create/update
 *   P13: PII fields stripped from AI-related responses
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { VerticalConfig, SubEntityDef } from '../schema.js';
import { VerticalEngine } from '../engine.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEnv = any;

/**
 * Extract tenant ID from context (set by auth middleware or header).
 */
function getTenantId(c: Context): string | undefined {
  // Try Hono context variable first (set by authMiddleware)
  try {
    const fromCtx = c.get('tenantId' as never) as string | undefined;
    if (fromCtx) return fromCtx;
  } catch { /* not set */ }
  // Fallback: header (for testing)
  return c.req.header('X-Tenant-Id') ?? undefined;
}

function getWorkspaceId(c: Context): string | undefined {
  try {
    const fromCtx = c.get('workspaceId' as never) as string | undefined;
    if (fromCtx) return fromCtx;
  } catch { /* not set */ }
  return c.req.header('X-Workspace-Id') ?? undefined;
}

/**
 * Generate a Hono sub-router with standard CRUD + FSM routes for a vertical.
 */
export function generateRoutes(config: VerticalConfig): Hono<AnyEnv> {
  const router = new Hono<AnyEnv>();

  // -------------------------------------------------------------------------
  // POST / — Create profile
  // -------------------------------------------------------------------------
  router.post('/', async (c: Context) => {
    const db = (c.env as Record<string, unknown>)['DB'] as never;
    const engine = new VerticalEngine(config, db);
    const tenantId = getTenantId(c);
    const workspaceId = getWorkspaceId(c);

    if (!tenantId) return c.json({ error: 'tenant_id required (T3)' }, 400);
    if (!workspaceId) return c.json({ error: 'workspace_id required' }, 400);

    const body = await c.req.json<Record<string, unknown>>();
    try {
      const profile = await engine.createProfile(body, tenantId, workspaceId);
      return c.json(profile, 201);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Create failed';
      return c.json({ error: msg }, 400);
    }
  });

  // -------------------------------------------------------------------------
  // GET /:id — Get profile by ID
  // -------------------------------------------------------------------------
  router.get('/:id', async (c: Context) => {
    const db = (c.env as Record<string, unknown>)['DB'] as never;
    const engine = new VerticalEngine(config, db);
    const tenantId = getTenantId(c);
    const id = c.req.param('id') as string;

    if (!tenantId) return c.json({ error: 'tenant_id required (T3)' }, 400);

    const profile = await engine.findById(id, tenantId);
    if (!profile) return c.json({ error: 'Not found' }, 404);
    return c.json(profile);
  });

  // -------------------------------------------------------------------------
  // PATCH /:id — Update profile
  // -------------------------------------------------------------------------
  router.patch('/:id', async (c: Context) => {
    const db = (c.env as Record<string, unknown>)['DB'] as never;
    const engine = new VerticalEngine(config, db);
    const tenantId = getTenantId(c);
    const id = c.req.param('id') as string;

    if (!tenantId) return c.json({ error: 'tenant_id required (T3)' }, 400);

    const body = await c.req.json<Record<string, unknown>>();
    try {
      const updated = await engine.updateProfile(id, tenantId, body);
      if (!updated) return c.json({ error: 'Not found' }, 404);
      return c.json(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      return c.json({ error: msg }, 400);
    }
  });

  // -------------------------------------------------------------------------
  // POST /:id/advance — FSM state transition
  // -------------------------------------------------------------------------
  router.post('/:id/advance', async (c: Context) => {
    const db = (c.env as Record<string, unknown>)['DB'] as never;
    const engine = new VerticalEngine(config, db);
    const tenantId = getTenantId(c);
    const id = c.req.param('id') as string;

    if (!tenantId) return c.json({ error: 'tenant_id required (T3)' }, 400);

    const body = await c.req.json<{ target_state?: string }>();
    const targetState = body.target_state;
    if (!targetState) return c.json({ error: 'target_state required' }, 400);

    const result = await engine.advanceState(id, tenantId, targetState);
    if (!result.success) return c.json({ error: result.reason }, 409);
    return c.json(result.profile);
  });

  // -------------------------------------------------------------------------
  // GET /workspace/:workspaceId — Get by workspace
  // -------------------------------------------------------------------------
  router.get('/workspace/:workspaceId', async (c: Context) => {
    const db = (c.env as Record<string, unknown>)['DB'] as never;
    const engine = new VerticalEngine(config, db);
    const tenantId = getTenantId(c);
    const workspaceId = c.req.param('workspaceId') as string;

    if (!tenantId) return c.json({ error: 'tenant_id required (T3)' }, 400);

    const profile = await engine.findByWorkspace(workspaceId, tenantId);
    if (!profile) return c.json({ error: 'Not found' }, 404);
    return c.json(profile);
  });

  // -------------------------------------------------------------------------
  // Sub-entity routes
  // -------------------------------------------------------------------------
  if (config.subEntities) {
    for (const subEntity of config.subEntities) {
      registerSubEntityRoutes(router, config, subEntity);
    }
  }

  return router;
}

function registerSubEntityRoutes(
  router: Hono<AnyEnv>,
  config: VerticalConfig,
  subEntity: SubEntityDef,
): void {
  const subPath = `/:profileId/${subEntity.name}`;

  // POST /:profileId/<subEntity> — Create sub-entity
  router.post(subPath, async (c: Context) => {
    const db = (c.env as Record<string, unknown>)['DB'] as never;
    const engine = new VerticalEngine(config, db);
    const tenantId = getTenantId(c);
    const profileId = c.req.param('profileId') as string;

    if (!tenantId) return c.json({ error: 'tenant_id required (T3)' }, 400);

    const body = await c.req.json<Record<string, unknown>>();
    try {
      const entity = await engine.createSubEntity(subEntity.name, profileId, tenantId, body);
      return c.json(entity, 201);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Create failed';
      return c.json({ error: msg }, 400);
    }
  });

  // GET /:profileId/<subEntity> — List sub-entities
  router.get(subPath, async (c: Context) => {
    const db = (c.env as Record<string, unknown>)['DB'] as never;
    const engine = new VerticalEngine(config, db);
    const tenantId = getTenantId(c);
    const profileId = c.req.param('profileId') as string;

    if (!tenantId) return c.json({ error: 'tenant_id required (T3)' }, 400);

    const entities = await engine.listSubEntities(subEntity.name, profileId, tenantId);
    return c.json({ items: entities });
  });
}

export { generateRoutes as default };
