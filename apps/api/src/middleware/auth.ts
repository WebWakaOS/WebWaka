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

/**
 * BUG-006 fix: Hash a string to a short hex for IP/UA pseudonymisation in audit logs.
 * Uses SubtleCrypto SHA-256 (available in Cloudflare Workers).
 * Returns first 16 hex chars — sufficient for correlation without storing full value.
 */
async function hashStringShort(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

/**
 * SEC-003: Full-length SHA-256 hex for KV blacklist keys.
 * Avoids the 512-byte KV key limit that long JWT strings could approach.
 */
async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const authMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const authHeader = c.req.header('Authorization') ?? null;
  const result = await resolveAuthContext(authHeader, c.env.JWT_SECRET);

  if (!result.success) {
    // BUG-006 fix: Route auth failures to audit log for IDS/SIEM integration.
    // Previously, failed auth returned 401 silently — no record of brute force or
    // token replay attacks existed in audit_logs. This fires-and-forgets a D1 write
    // so the middleware response time is unaffected.
    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? '';
    void (async () => {
      try {
        const [ipHash, uaHash] = await Promise.all([
          hashStringShort(ip),
          hashStringShort(c.req.header('User-Agent') ?? ''),
        ]);
        console.log(JSON.stringify({
          level: 'warn',
          event: 'AUTH_FAILURE_VERIFY',
          reason: result.message,
          path: c.req.path,
          method: c.req.method,
          ip_hash: ipHash,
          ua_hash: uaHash,
          ts: new Date().toISOString(),
        }));
        if (c.env?.DB) {
          const ipMasked = ip ? ip.split('.').slice(0, 3).join('.') + '.***' : '?.?.?.?';
          await c.env.DB.prepare(
            `INSERT OR IGNORE INTO audit_logs
               (id, tenant_id, user_id, action, method, path, resource_type, resource_id, ip_masked, status_code, duration_ms)
             VALUES (?, NULL, NULL, 'AUTH_FAILURE_VERIFY', ?, ?, 'auth', NULL, ?, ?, 0)`,
          ).bind(
            crypto.randomUUID(),
            c.req.method,
            c.req.path,
            ipMasked,
            result.status ?? 401,
          ).run();
        }
      } catch {
        // Non-blocking — auth failure logging must never impact the 401 response.
      }
    })();
    return c.json(errorResponse(ErrorCode.Unauthorized, result.message), result.status);
  }

  // SEC-10: Check if token has been blacklisted (e.g. after refresh rotation or logout)
  // ARC-17: kvGetText never throws — fails open if KV is unavailable
  const rawToken = authHeader?.replace(/^Bearer\s+/i, '');
  let sessionHashHex: string | null = null;

  if (rawToken) {
    // SEC-003: Use hashed key (sha256hex) to avoid 512-byte KV key limit for long JWTs.
    // Key format: blacklist:token:<64-char-hex>
    const tokenHash = await sha256hex(rawToken);
    const blacklisted = await kvGetText(c.env.RATE_LIMIT_KV, `blacklist:token:${tokenHash}`, null);
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
    } catch (hashErr: unknown) {
      // BUG-051/SEC-009: Log hash failure at error level so production monitoring can detect
      // degraded session revocation (e.g. subtle API unavailable). Fails open per ARC-17.
      console.error(JSON.stringify({
        level: 'error',
        event: 'session_hash_failure',
        error: hashErr instanceof Error ? hashErr.message : String(hashErr),
      }));
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
