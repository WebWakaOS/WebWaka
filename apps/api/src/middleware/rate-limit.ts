/**
 * KV-backed rate limiting middleware for WebWaka API (M7a)
 * (docs/governance/security-baseline.md R5, R9)
 *
 * Implements sliding-window rate limiting using Cloudflare KV.
 * Used for: identity verification endpoints (R5: 2/hour), OTP sends (R9: 5/hour).
 */

import { createMiddleware } from 'hono/factory';
import type { Env } from '../env.js';

interface RateLimitOptions {
  keyPrefix: string;
  maxRequests: number;
  windowSeconds: number;
}

export function rateLimitMiddleware(opts: RateLimitOptions) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const subject = c.req.header('X-User-Id') ?? c.req.header('CF-Connecting-IP') ?? 'unknown';
    const key = `rl:${opts.keyPrefix}:${subject}`;
    const kv = c.env.RATE_LIMIT_KV;

    const countStr = await kv.get(key);
    const count = countStr ? parseInt(countStr, 10) : 0;

    if (count >= opts.maxRequests) {
      return c.json(
        {
          error: 'rate_limit_exceeded',
          message: `Too many requests. Maximum ${opts.maxRequests} per ${opts.windowSeconds / 60} minute(s).`,
          retry_after_seconds: opts.windowSeconds,
        },
        429,
      );
    }

    await kv.put(key, String(count + 1), { expirationTtl: opts.windowSeconds });

    await next();
  });
}

/** Identity verification rate limit: R5 — 2 verifications per hour per user */
export const identityRateLimit = rateLimitMiddleware({
  keyPrefix: 'identity:verify',
  maxRequests: 2,
  windowSeconds: 3600,
});
