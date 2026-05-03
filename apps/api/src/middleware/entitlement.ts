/**
 * Entitlement middleware — requireEntitlement(layer)
 *
 * DB-first layer access guard with automatic PLAN_CONFIGS fallback.
 * Uses buildWorkspaceContext() to resolve entitlements via EntitlementEngine,
 * then passes the resolved config to requireLayerAccess().
 *
 * Resolution priority:
 *   workspace_entitlement_overrides > package_entitlement_bindings > PLAN_CONFIGS
 *
 * Graceful fallback: if control-plane tables don't exist yet (pre-migration),
 * the engine returns {} and PLAN_CONFIGS is used transparently.
 */

import { createMiddleware } from 'hono/factory';
import type { Env } from '../env.js';
import { requireLayerAccess, EntitlementError } from '@webwaka/entitlements';
import type { PlatformLayer } from '@webwaka/types';
import { buildWorkspaceContext } from './workspace-entitlement-context.js';

interface AuthShape {
  userId: string;
  tenantId: string;
  workspaceId?: string;
}

export function requireEntitlement(layer: PlatformLayer) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const auth = c.get('auth') as AuthShape | undefined;
    if (!auth?.tenantId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    try {
      const ctx = await buildWorkspaceContext(c, auth.workspaceId, auth.tenantId);

      if (!ctx) {
        return c.json({ error: 'Workspace not found' }, 404);
      }

      // requireLayerAccess reads ctx.activeLayers (DB-merged) and does not
      // need resolvedEntitlements (layer access is ctx-based, not config-based).
      // resolvedEntitlements is available on ctx for any downstream guard calls.
      requireLayerAccess(ctx.entitlementCtx, layer);
    } catch (err) {
      if (err instanceof EntitlementError) {
        return c.json({ error: err.message }, 403);
      }
      throw err;
    }

    await next();
  });
}
