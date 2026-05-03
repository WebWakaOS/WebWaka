/**
 * AI entitlement middleware — aiEntitlementMiddleware
 *
 * DB-first AI rights guard with automatic PLAN_CONFIGS fallback.
 * Uses buildWorkspaceContext() to resolve entitlements via EntitlementEngine,
 * then passes the resolved config to requireAIAccess().
 *
 * Resolution priority:
 *   workspace_entitlement_overrides > package_entitlement_bindings > PLAN_CONFIGS
 *
 * Graceful fallback: if control-plane tables don't exist yet (pre-migration),
 * the engine returns {} and PLAN_CONFIGS is used transparently.
 */

import { createMiddleware } from 'hono/factory';
import type { Env } from '../env.js';
import { requireAIAccess, EntitlementError } from '@webwaka/entitlements';
import { buildWorkspaceContext } from './workspace-entitlement-context.js';

interface AuthShape {
  userId: string;
  tenantId: string;
  workspaceId?: string;
}

export const aiEntitlementMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const auth = c.get('auth') as AuthShape | undefined;
  if (!auth?.tenantId) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    const ctx = await buildWorkspaceContext(c, auth.workspaceId, auth.tenantId);

    if (!ctx) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    // Pass resolvedEntitlements so DB-managed ai_rights overrides PLAN_CONFIGS.
    // e.g. if a workspace has an override granting AI on a Starter plan, it works.
    requireAIAccess(ctx.entitlementCtx, ctx.resolvedEntitlements);
  } catch (err) {
    if (err instanceof EntitlementError) {
      return c.json({ error: err.message }, 403);
    }
    throw err;
  }

  await next();
});
