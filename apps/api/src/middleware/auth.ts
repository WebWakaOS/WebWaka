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
import { errorResponse, ErrorCode } from '@webwaka/shared-config';
import { kvGetText } from '@webwaka/core';
import type { Env } from '../env.js';

// Hono context variable key for auth context
declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
    requestId: string;
  }
}

export const authMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const authHeader = c.req.header('Authorization') ?? null;
  const result = await resolveAuthContext(authHeader, c.env.JWT_SECRET);

  if (!result.success) {
    return c.json(errorResponse(ErrorCode.Unauthorized, result.message), result.status);
  }

  // SEC-10: Check if token has been blacklisted (e.g. after refresh rotation or logout)
  // ARC-17: kvGetText never throws — fails open if KV is unavailable
  const rawToken = authHeader?.replace(/^Bearer\s+/i, '');
  if (rawToken) {
    // Full-token blacklist (logout, refresh rotation)
    const blacklisted = await kvGetText(c.env.RATE_LIMIT_KV, `blacklist:${rawToken}`, null);
    if (blacklisted) {
      return c.json(errorResponse(ErrorCode.Unauthorized, 'Token has been revoked.'), 401);
    }
    // P20-B: Per-session revocation — check by SHA-256 hash of token (session management)
    try {
      const encoder = new TextEncoder();
      const hashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(rawToken));
      const hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
      const sessionRevoked = await kvGetText(c.env.RATE_LIMIT_KV, `blacklist:jti:${hashHex}`, null);
      if (sessionRevoked) {
        return c.json(errorResponse(ErrorCode.Unauthorized, 'Session has been revoked.'), 401);
      }
    } catch {
      // Hash computation failure is non-blocking — fail open
    }
  }

  c.set('auth', result.context);
  await next();
};
