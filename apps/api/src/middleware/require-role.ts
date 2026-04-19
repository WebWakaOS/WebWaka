/**
 * requireRole — Role-enforcement middleware factory
 *
 * Eliminates copy-paste role checks across route handlers.
 * Apply at the router level (app.use) or route level before handlers.
 *
 * Usage:
 *   app.use('/partners/*', authMiddleware);
 *   app.use('/partners/*', requireRole('super_admin'));
 *
 * Supported roles: 'user' | 'admin' | 'super_admin'
 *
 * GOV-01: Role definitions in docs/governance/rbac.md
 */

import { createMiddleware } from 'hono/factory';
import type { Env } from '../env.js';

type Role = 'user' | 'admin' | 'super_admin';

interface AuthShape {
  userId: string;
  tenantId: string;
  role?: Role;
}

/**
 * Enforce that the authenticated user has at least the required role.
 * Role hierarchy: super_admin > admin > user
 */
export function requireRole(required: Role) {
  const hierarchy: Role[] = ['user', 'admin', 'super_admin'];
  const minIndex = hierarchy.indexOf(required);

  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const auth = c.get('auth') as AuthShape | undefined;

    if (!auth?.userId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const userRole = auth.role ?? 'user';
    const userIndex = hierarchy.indexOf(userRole as Role);

    if (userIndex < minIndex) {
      return c.json(
        { error: `${required} role required`, code: 'FORBIDDEN' },
        403,
      );
    }

    await next();
  });
}
