import { createMiddleware } from 'hono/factory';
import type { Env } from '../env.js';
import { requireLayerAccess, EntitlementError } from '@webwaka/entitlements';
import type { PlatformLayer } from '@webwaka/types';
import { SubscriptionStatus } from '@webwaka/types';

interface WorkspaceRow {
  id: string;
  subscription_status: string;
  subscription_plan: string;
  active_layers: string;
}

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
      const query = auth.workspaceId
        ? `SELECT id, subscription_status, subscription_plan, active_layers
           FROM workspaces WHERE id = ? AND tenant_id = ? LIMIT 1`
        : `SELECT id, subscription_status, subscription_plan, active_layers
           FROM workspaces WHERE tenant_id = ? LIMIT 1`;

      const bindings = auth.workspaceId
        ? [auth.workspaceId, auth.tenantId]
        : [auth.tenantId];

      const ws = await c.env.DB.prepare(query)
        .bind(...bindings)
        .first<WorkspaceRow>();

      if (!ws) {
        return c.json({ error: 'Workspace not found' }, 404);
      }

      let activeLayers: PlatformLayer[];
      try {
        activeLayers = JSON.parse(ws.active_layers || '[]') as PlatformLayer[];
      } catch {
        activeLayers = [];
      }

      const ctx = {
        subscriptionStatus: (ws.subscription_status ?? 'inactive') as typeof SubscriptionStatus[keyof typeof SubscriptionStatus],
        subscriptionPlan: ws.subscription_plan as import('@webwaka/types').SubscriptionPlan,
        activeLayers: activeLayers as readonly PlatformLayer[],
      };

      requireLayerAccess(ctx as import('@webwaka/types').EntitlementContext, layer);
    } catch (err) {
      if (err instanceof EntitlementError) {
        return c.json({ error: err.message }, 403);
      }
      throw err;
    }

    await next();
  });
}
