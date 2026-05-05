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
 *
 * M-7: Structured rate-limit logging for OTP monitoring/alerting.
 * Each 429 emits a JSON log with: event, rule_id, key_prefix, user_id,
 * workspace_id, ip, path, method, window_seconds, max_requests, timestamp.
 * These are queryable via Cloudflare Logpush / Workers Trace Events.
 * See docs/runbooks/otp-rate-limit-monitoring.md for alerting queries.
 */

import { createMiddleware } from 'hono/factory';
import { kvGetText } from '@webwaka/core';
import type { Env } from '../env.js';

interface RateLimitOptions {
  keyPrefix: string;
  maxRequests: number;
  windowSeconds: number;
  /**
   * M-7: Human-readable rule identifier (e.g. 'R5', 'R9', 'R9_sms').
   * Included in the structured log for per-rule alerting.
   */
  ruleId?: string;
}

/** Read a KV count safely — returns 0 on any error (fail-open per ARC-17). */
async function safeKvCount(kv: Env['RATE_LIMIT_KV'], key: string): Promise<number> {
  const raw = await kvGetText(kv, key, null);
  return raw ? parseInt(raw, 10) : 0;
}

export function rateLimitMiddleware(opts: RateLimitOptions) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    // BUG-FIX: Bypass global rate limiting for trusted M2M/CI callers that present
    // a valid INTER_SERVICE_SECRET. This mirrors the CSRF middleware bypass (BUG-003)
    // and prevents CI smoke tests (k6) from exhausting the 100 req/60s IP bucket
    // when all VUs share a single GitHub Actions runner IP.
    const interServiceHeader = c.req.header('X-Inter-Service-Secret');
    const expectedSecret = c.env?.INTER_SERVICE_SECRET;
    if (expectedSecret && interServiceHeader === expectedSecret) {
      return next();
    }

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
    const auth = c.get('auth') as { workspaceId?: string; userId?: string; tenantId?: string } | undefined;
    const workspaceId = auth?.workspaceId;
    const userId = auth?.userId;
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

      // M-7: Full structured log for rate-limit monitoring/alerting.
      // Fields are chosen to support Cloudflare Logpush queries:
      //   - Filter by event='rate_limit_exceeded' + rule_id='R5' → identity abuse
      //   - Filter by key_prefix='otp:*' → OTP channel abuse monitoring
      //   - Aggregate by workspace_id → per-tenant spike detection
      console.log(JSON.stringify({
        level: 'warn',
        event: 'rate_limit_exceeded',
        rule_id: opts.ruleId ?? opts.keyPrefix,
        key_prefix: opts.keyPrefix,
        user_id: userId ?? null,
        workspace_id: workspaceId ?? null,
        ip: ip,
        path: c.req.path,
        method: c.req.method,
        window_seconds: opts.windowSeconds,
        max_requests: opts.maxRequests,
        ip_count: ipCount,
        ws_count: wsCount,
        exceeded_by: Math.max(ipCount, wsCount) - opts.maxRequests + 1,
        timestamp: new Date().toISOString(),
      }));

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
  ruleId: 'R5',
});

// ---------------------------------------------------------------------------
// L-2: Tier-Based Rate Limiting
//
// Enforces per-subscription-plan request limits that align with billing tiers:
//   free: 30 req/min  |  starter: 60 req/min  |  growth: 120 req/min
//   pro: 200 req/min  |  enterprise: 1000 req/min
//
// Reads subscription_plan from D1 (workspace row) using the auth context
// already set by authMiddleware. The X-RateLimit-Warning header is added at
// 80-95% consumption (configurable per tier) to let clients back off gracefully.
//
// Response headers set on every request:
//   X-RateLimit-Tier      — plan name (e.g. "pro")
//   X-RateLimit-Limit     — requests per minute for this tier
//   X-RateLimit-Remaining — requests left in current window
//   X-RateLimit-Reset     — Unix timestamp when window resets
//   X-RateLimit-Warning   — "true" when >= warningThreshold of limit consumed
// ---------------------------------------------------------------------------
import { getTierRateLimit, isApproachingLimit } from './rate-limit-tiers.js';

interface WorkspaceRow {
  subscription_plan: string | null;
}

/**
 * Tier-based global rate limiter.
 * Apply AFTER authMiddleware so c.get('auth') is populated.
 * Skips enforcement if auth context is absent (unauthenticated routes handled
 * by the IP-only rateLimitMiddleware above).
 */
export function tierRateLimitMiddleware() {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const auth = c.get('auth') as
      | { workspaceId?: string; tenantId?: string; userId?: string }
      | undefined;

    // Only enforce on authenticated requests — unauthenticated routes use IP limits
    if (!auth?.tenantId) {
      await next();
      return;
    }

    // Resolve plan: prefer workspaceId lookup, fall back to tenant-level, then 'free'
    let plan = 'free';
    try {
      if (auth.workspaceId) {
        const row = await c.env.DB.prepare(
          `SELECT subscription_plan FROM workspaces WHERE id = ? AND tenant_id = ? LIMIT 1`,
        )
          .bind(auth.workspaceId, auth.tenantId)
          .first<WorkspaceRow>();
        if (row?.subscription_plan) plan = row.subscription_plan;
      } else {
        const row = await c.env.DB.prepare(
          `SELECT subscription_plan FROM workspaces WHERE tenant_id = ? LIMIT 1`,
        )
          .bind(auth.tenantId)
          .first<WorkspaceRow>();
        if (row?.subscription_plan) plan = row.subscription_plan;
      }
    } catch {
      // DB lookup failure → fail open with 'free' tier limits
    }

    const tierConfig = getTierRateLimit(plan);
    const windowSeconds = 60; // 1-minute sliding window for general tier limit
    const rlKey = `rl:tier:ws:${auth.workspaceId ?? auth.tenantId}`;
    const kv = c.env.RATE_LIMIT_KV;

    let currentCount = 0;
    try {
      const raw = await kv.get(rlKey);
      currentCount = raw ? parseInt(raw, 10) : 0;
    } catch {
      // KV unavailable — fail open (ARC-17)
    }

    const remaining = Math.max(0, tierConfig.requestsPerMinute - currentCount);
    const resetAt = Math.floor(Date.now() / 1000) + windowSeconds;

    // Set informational headers on every response
    c.header('X-RateLimit-Tier', tierConfig.plan);
    c.header('X-RateLimit-Limit', String(tierConfig.requestsPerMinute));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(resetAt));

    if (isApproachingLimit(currentCount, tierConfig, 'requestsPerMinute')) {
      c.header('X-RateLimit-Warning', 'true');
    }

    if (currentCount >= tierConfig.requestsPerMinute) {
      c.header('Retry-After', String(windowSeconds));
      console.log(JSON.stringify({
        level: 'warn',
        event: 'tier_rate_limit_exceeded',
        rule_id: 'L-2',
        plan: tierConfig.plan,
        limit: tierConfig.requestsPerMinute,
        user_id: auth.userId ?? null,
        workspace_id: auth.workspaceId ?? null,
        tenant_id: auth.tenantId,
        path: c.req.path,
        method: c.req.method,
        timestamp: new Date().toISOString(),
      }));
      return c.json(
        {
          error: 'rate_limit_exceeded',
          message: `Your ${tierConfig.plan} plan allows ${tierConfig.requestsPerMinute} requests/minute. Upgrade for higher limits.`,
          plan: tierConfig.plan,
          limit: tierConfig.requestsPerMinute,
          retry_after_seconds: windowSeconds,
        },
        429,
      );
    }

    // Increment counter — failure is non-fatal (fail open)
    try {
      await kv.put(rlKey, String(currentCount + 1), { expirationTtl: windowSeconds });
    } catch {
      // KV write failure — log but do not block request
      console.error(JSON.stringify({ level: 'error', event: 'ratelimit_kv_degraded', key: rlKey }));
    }

    await next();
  });
}
