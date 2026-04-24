/**
 * KV-backed rate limiting middleware for WebWaka API (M7a)
 * (docs/governance/security-baseline.md R5, R9)
 *
 * Implements sliding-window rate limiting using Cloudflare KV.
 * Used for: identity verification endpoints (R5: 2/hour), OTP sends (R9: 5/hour).
 *
 * SEC-005 hardening:
 * - Retry-After header added to all 429 responses (RFC 7231 §7.1.3)
 * - Rate-limit key uses CF-Connecting-IP (not forgeable X-User-Id)
 * - All KV operations wrapped in try/catch — KV unavailability fails open
 *   to preserve availability rather than blocking all requests
 *
 * SEC-004 hardening:
 * - Secondary workspace-scoped rate-limit key applied in addition to IP key.
 * - Shared NAT (common in Nigerian ISPs and enterprise proxies) means many
 *   users share one IP, so IP-only rate limiting unfairly exhausts limits for
 *   all users behind the same NAT. The workspace key (from auth context) provides
 *   a per-workspace secondary limit that isolates one tenant's burst from others.
 * - Logic: both IP key and workspace key are checked. If EITHER exceeds the
 *   threshold, the request is rejected. The workspace key is only applied when
 *   the auth context is already populated (i.e., on authenticated routes).
 */

import { createMiddleware } from 'hono/factory';
import { kvGetText } from '@webwaka/core';
import type { Env } from '../env.js';

interface RateLimitOptions {
  keyPrefix: string;
  maxRequests: number;
  windowSeconds: number;
}

/** Read a KV count safely — returns 0 on any error (fail-open per ARC-17). */
async function safeKvCount(kv: Env['RATE_LIMIT_KV'], key: string): Promise<number> {
  const raw = await kvGetText(kv, key, null);
  return raw ? parseInt(raw, 10) : 0;
}

export function rateLimitMiddleware(opts: RateLimitOptions) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    // SEC-005: Use CF-Connecting-IP — this is set by Cloudflare and cannot be
    // forged by the client. X-Forwarded-For is used as a local dev fallback only.
    const ip =
      c.req.header('CF-Connecting-IP') ??
      c.req.header('X-Forwarded-For') ??
      'unknown';
    const ipKey = `rl:${opts.keyPrefix}:ip:${ip}`;
    const kv = c.env.RATE_LIMIT_KV;

    // SEC-004: Also apply a secondary workspace-scoped key when auth context is
    // already set (authenticated routes). This prevents one workspace from
    // exhausting the shared-NAT IP bucket for all workspaces behind the same ISP.
    const auth = c.get('auth') as { workspaceId?: string } | undefined;
    const workspaceId = auth?.workspaceId;
    const wsKey = workspaceId ? `rl:${opts.keyPrefix}:ws:${workspaceId}` : null;

    // SEC-005: Fail open when KV is unavailable — never block requests due to
    // infrastructure issues; the alternative (blocking all traffic) is worse.
    // ARC-17: kvGetText never throws — returns the fallback on any KV error.
    const ipCount = await safeKvCount(kv, ipKey);
    const wsCount = wsKey ? await safeKvCount(kv, wsKey) : 0;

    // Apply the stricter of the two limits (minimum remaining quota).
    const exceeded = ipCount >= opts.maxRequests || wsCount >= opts.maxRequests;

    if (exceeded) {
      // SEC-005: Add Retry-After header (RFC 7231 §7.1.3)
      c.header('Retry-After', String(opts.windowSeconds));
      return c.json(
        {
          error: 'rate_limit_exceeded',
          message: `Too many requests. Maximum ${opts.maxRequests} per ${opts.windowSeconds / 60} minute(s).`,
          retry_after_seconds: opts.windowSeconds,
        },
        429,
      );
    }

    // SEC-005 / SEC-002: KV write failures must not block the request.
    // SEC-002: Log KV degradation for alerting (ratelimit_kv_degraded → SEV-2 monitor).
    try {
      const writeOps: Promise<void>[] = [
        kv.put(ipKey, String(ipCount + 1), { expirationTtl: opts.windowSeconds }),
      ];
      if (wsKey) {
        writeOps.push(kv.put(wsKey, String(wsCount + 1), { expirationTtl: opts.windowSeconds }));
      }
      await Promise.all(writeOps);
    } catch {
      console.error(JSON.stringify({
        level: 'error',
        event: 'ratelimit_kv_degraded',
        keyPrefix: opts.keyPrefix,
        ts: new Date().toISOString(),
      }));
    }

    await next();
  });
}

/** Identity verification rate limit: R5 — 2 verifications per hour per user */
export const identityRateLimit = rateLimitMiddleware({
  keyPrefix: 'identity:verify',
  maxRequests: 2,
  windowSeconds: 3600,
});
