/**
 * @webwaka/vertical-engine — Route Generator
 * Wave 3: sub-entity DELETE+PATCH, generateAllRoutes(), FSM config assertion at startup
 *
 * Given a VerticalConfig, generates standard Hono route handlers for:
 *   POST   /                          — Create profile
 *   GET    /:id                       — Get profile by ID
 *   PATCH  /:id                       — Update profile
 *   DELETE /:id                       — Soft-delete profile (sets status=deleted)
 *   POST   /:id/advance               — FSM state transition
 *   GET    /workspace/:workspaceId    — Get by workspace
 *   POST   /:profileId/<sub>          — Create sub-entity
 *   GET    /:profileId/<sub>          — List sub-entities
 *   PATCH  /:profileId/<sub>/:subId   — Update sub-entity (Wave 3)
 *   DELETE /:profileId/<sub>/:subId   — Delete sub-entity (Wave 3)
 *
 * generateAllRoutes(registry) — mounts every vertical under its basePath (Wave 3)
 *
 * Platform Invariants:
 *   T3: tenant_id from auth context or header
 *   P9: Kobo validation on create/update
 *   P13: PII fields stripped from AI-related responses
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { VerticalConfig, VerticalRegistry, SubEntityDef } from '../schema.js';
import { VerticalEngine } from '../engine.js';
import { FSMEngine } from '../fsm.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEnv = any;

function getTenantId(c: Context): string | undefined {
  try {
    const fromCtx = c.get('tenantId' as never) as string | undefined;
    if (fromCtx) return fromCtx;
  } catch { /* not set */ }
  return c.req.header('X-Tenant-Id') ?? undefined;
}

function getWorkspaceId(c: Context): string | undefined {
  try {
    const fromCtx = c.get('workspaceId' as never) as string | undefined;
    if (fromCtx) return fromCtx;
  } catch { /* not set */ }
  return c.req.header('X-Workspace-Id') ?? undefined;
}

// ---------------------------------------------------------------------------
// Single-vertical router
// ---------------------------------------------------------------------------

export function generateRoutes(config: VerticalConfig): Hono<AnyEnv> {
  // Wave 3 (B2-4): assert FSM config is valid at route-generation time
  FSMEngine.assertValidConfig(config.fsm, config.slug);

  const router = new Hono<AnyEnv>();

  // POST / — Create profile
  router.post('/', async (c: Context) => {
    const db = (c.env as Record<string, unknown>)['DB'] as never;
    const engine = new VerticalEngine(config, db);
    const tenantId = getTenantId(c);
    const workspaceId = getWorkspaceId(c);
    if (!tenantId) return c.json({ error: 'tenant_id required (T3)' }, 400);
    if (!workspaceId) return c.json({ error: 'workspace_id required' }, 400);
    const body = await c.req.json<Record<string, unknown>>();
    try {
      const profile = await engine.createProfile(tenantId, workspaceId, body);
      return c.json(profile, 201);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Create failed';
      return c.json({ error: msg }, 400);
    }
  });

  // GET /:id — Get profile by ID
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

  // PATCH /:id — Update profile
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

  // DELETE /:id — Soft-delete profile (Wave 3 B3-1)
  router.delete('/:id', async (c: Context) => {
    const db = (c.env as Record<string, unknown>)['DB'] as never;
    const tenantId = getTenantId(c);
    const id = c.req.param('id') as string;
    if (!tenantId) return c.json({ error: 'tenant_id required (T3)' }, 400);
    // Advance FSM to 'deleted' state — soft delete via status column
    const engine = new VerticalEngine(config, db);
    const profile = await engine.findById(id, tenantId);
    if (!profile) return c.json({ error: 'Not found' }, 404);
    const updated = await engine.updateProfile(id, tenantId, { status: 'deleted' });
    return c.json({ deleted: true, id, previous_status: (profile as Record<string, unknown>)['status'] ?? null });
  });

  // POST /:id/advance — FSM state transition
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

  // GET /workspace/:workspaceId — Get by workspace
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

  // Sub-entity routes
  if (config.subEntities) {
    for (const subEntity of config.subEntities) {
      registerSubEntityRoutes(router, config, subEntity);
    }
  }

  return router;
}

// ---------------------------------------------------------------------------
// Sub-entity routes (full CRUD — Wave 3 adds PATCH + DELETE)
// ---------------------------------------------------------------------------

function registerSubEntityRoutes(
  router: Hono<AnyEnv>,
  config: VerticalConfig,
  subEntity: SubEntityDef,
): void {
  const listPath   = `/:profileId/${subEntity.name}`;
  const singlePath = `/:profileId/${subEntity.name}/:subId`;

  // POST /:profileId/<sub> — Create
  router.post(listPath, async (c: Context) => {
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

  // GET /:profileId/<sub> — List
  router.get(listPath, async (c: Context) => {
    const db = (c.env as Record<string, unknown>)['DB'] as never;
    const engine = new VerticalEngine(config, db);
    const tenantId = getTenantId(c);
    const profileId = c.req.param('profileId') as string;
    if (!tenantId) return c.json({ error: 'tenant_id required (T3)' }, 400);
    const entities = await engine.listSubEntities(subEntity.name, profileId, tenantId);
    return c.json({ items: entities });
  });

  // PATCH /:profileId/<sub>/:subId — Update (Wave 3 B3-2)
  router.patch(singlePath, async (c: Context) => {
    const db = (c.env as Record<string, unknown>)['DB'] as never;
    const engine = new VerticalEngine(config, db);
    const tenantId = getTenantId(c);
    const profileId = c.req.param('profileId') as string;
    const subId = c.req.param('subId') as string;
    if (!tenantId) return c.json({ error: 'tenant_id required (T3)' }, 400);
    const body = await c.req.json<Record<string, unknown>>();
    try {
      const updated = await engine.updateSubEntity(subEntity.name, subId, profileId, tenantId, body);
      if (!updated) return c.json({ error: 'Not found' }, 404);
      return c.json(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      return c.json({ error: msg }, 400);
    }
  });

  // DELETE /:profileId/<sub>/:subId — Delete (Wave 3 B3-2)
  router.delete(singlePath, async (c: Context) => {
    const db = (c.env as Record<string, unknown>)['DB'] as never;
    const engine = new VerticalEngine(config, db);
    const tenantId = getTenantId(c);
    const profileId = c.req.param('profileId') as string;
    const subId = c.req.param('subId') as string;
    if (!tenantId) return c.json({ error: 'tenant_id required (T3)' }, 400);
    const deleted = await engine.deleteSubEntity(subEntity.name, subId, profileId, tenantId);
    if (!deleted) return c.json({ error: 'Not found' }, 404);
    return c.json({ deleted: true, id: subId });
  });
}

// ---------------------------------------------------------------------------
// generateAllRoutes — mounts all registry verticals (Wave 3 B3-3)
// ---------------------------------------------------------------------------

/**
 * Mount all verticals from a registry onto a single Hono app.
 * Each vertical is mounted at its config.route.basePath.
 *
 * Usage:
 *   const app = new Hono();
 *   generateAllRoutes(getRegistry(), app);
 */
export function generateAllRoutes(
  registry: VerticalRegistry,
  app: Hono<AnyEnv>,
): { mounted: string[]; errors: Array<{ slug: string; error: string }> } {
  const mounted: string[] = [];
  const errors: Array<{ slug: string; error: string }> = [];

  for (const [slug, config] of Object.entries(registry)) {
    try {
      const router = generateRoutes(config);
      const basePath = config.route?.basePath ?? `/${slug}`;

      // B5-3: Entitlement layer enforcement — guard every mounted vertical
      // with a middleware that checks VerticalConfig.route.entitlementLayer.
      // The entitlement layer is stored on the request context by the platform
      // auth middleware (key: 'entitlements' — a Set<string>).
      // If the context has no entitlement info we allow through (open verticals).
      const entitlementLayer = config.route?.entitlementLayer;
      if (entitlementLayer) {
        app.use(`${basePath}/*`, async (c: Context, next) => {
          try {
            const entitlements = c.get('entitlements' as never) as Set<string> | undefined;
            // If entitlements context is not set (no auth middleware) — allow through
            if (entitlements && !entitlements.has(entitlementLayer)) {
              return c.json(
                {
                  error: 'entitlement_required',
                  message: `This feature requires the '${entitlementLayer}' entitlement.`,
                  requiredEntitlement: entitlementLayer,
                },
                403,
              );
            }
          } catch { /* entitlement context not available — allow through */ }
          await next();
        });
      }

      app.route(basePath, router);
      mounted.push(slug);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ slug, error: msg });
      console.error(JSON.stringify({ level: 'error', event: 'vertical_mount_failed', slug, error: msg }));
    }
  }

  return { mounted, errors };
}

export { generateRoutes as default };
