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
  let sessionHashHex: string | null = null;

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
      sessionHashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
      const sessionRevoked = await kvGetText(c.env.RATE_LIMIT_KV, `blacklist:jti:${sessionHashHex}`, null);
      if (sessionRevoked) {
        return c.json(errorResponse(ErrorCode.Unauthorized, 'Session has been revoked.'), 401);
      }
    } catch {
      // Hash computation failure is non-blocking — fail open
      sessionHashHex = null;
    }
  }

  c.set('auth', result.context);

  // BUG-03 fix: Update last_seen_at for active session (fire-and-forget, throttled to 1/60s per session)
  // Only updates if last_seen_at is more than 60 seconds old to avoid excessive DB writes.
  // Wrapped in an async IIFE so any synchronous throw from the DB mock (in tests) is converted
  // to a rejected Promise that is absorbed by the outer .catch() — never blocks the response.
  if (sessionHashHex && c.env.DB) {
    // BUG-03 fix (continued): async IIFE correctly wraps any synchronous or async
    // error into a rejected Promise.  The .catch() absorbs it so last_seen_at
    // failures never propagate to the response.  We add structured logging here
    // so that persistent DB failures are observable in production.
    (async () => {
      await c.env.DB.prepare(
        `UPDATE sessions SET last_seen_at = unixepoch()
         WHERE jti = ? AND user_id = ? AND revoked_at IS NULL
           AND (last_seen_at IS NULL OR unixepoch() - last_seen_at > 60)`,
      ).bind(sessionHashHex, result.context.userId).run();
    })().catch((err: unknown) => {
      // Non-blocking — session activity update failure must never block the request.
      // Log so that persistent failures are observable (e.g. schema drift or DB issues).
      console.error(JSON.stringify({
        level: 'warn',
        event: 'session_last_seen_update_failed',
        error: err instanceof Error ? err.message : String(err),
      }));
    });
  }

  await next();
};
