/**
 * Hono auth middleware.
 * Wires @webwaka/auth's resolveAuthContext into the Hono request pipeline.
 *
 * Usage (in route groups that require authentication):
 *   api.use('/*', authMiddleware)
 *
 * Injects `ctx.get('auth')` of type AuthContext for downstream handlers.
 */

import type { MiddlewareHandler } from 'hono';
import type { AuthContext } from '@webwaka/types';
import { resolveAuthContext } from '@webwaka/auth';
import type { Env } from '../env.js';

// Hono context variable key for auth context
declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

export const authMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const authHeader = c.req.header('Authorization') ?? null;
  const result = await resolveAuthContext(authHeader, c.env.JWT_SECRET);

  if (!result.success) {
    return c.json({ error: result.message }, result.status);
  }

  c.set('auth', result.context);
  await next();
};
