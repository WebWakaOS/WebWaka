/**
 * Shared resolveActor() utility for all Control Plane route handlers.
 *
 * Maps the authenticated user's role to the correct AdminLevel for the
 * ActorContext passed to every CP service call. This ensures:
 *   1. The governance audit log records the true actor level.
 *   2. DelegationGuard.assertCanPerform() receives a real level so the
 *      privilege-escalation check is not permanently bypassed.
 *
 * NOTE: All CP routes are already gated by requireRole('super_admin') in
 * register-admin-routes.ts, so in practice only super_admins reach these
 * handlers today. This function is written for correctness and future-proofing
 * (e.g. if platform_admin access is granted to a subset of CP routes later).
 */

import type { ActorContext, AdminLevel } from '@webwaka/control-plane';

const VALID_ADMIN_LEVELS = new Set<string>([
  'super_admin',
  'platform_admin',
  'partner_admin',
  'tenant_admin',
  'workspace_admin',
  'system',
]);

function roleToAdminLevel(role: string | undefined): AdminLevel {
  if (role && VALID_ADMIN_LEVELS.has(role)) return role as AdminLevel;
  return 'tenant_admin';
}

interface ReqLike {
  get(k: string): unknown;
  env?: { ENVIRONMENT?: string };
  req?: { header(k: string): string | undefined };
}

export function resolveActor(c: ReqLike): ActorContext {
  const auth = c.get('auth') as
    | { userId?: string; tenantId?: string; role?: string; workspaceId?: string; partnerId?: string }
    | undefined;

  return {
    actorId:    auth?.userId    ?? 'system',
    actorRole:  auth?.role      ?? 'super_admin',
    actorLevel: roleToAdminLevel(auth?.role),
    tenantId:   auth?.tenantId,
    workspaceId: auth?.workspaceId,
    partnerId:  auth?.partnerId,
    requestId:  crypto.randomUUID(),
  };
}
