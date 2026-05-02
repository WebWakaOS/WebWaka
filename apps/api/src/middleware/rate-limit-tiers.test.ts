/**
 * rate-limit-tiers.test.ts — L-2: Tier-based rate limiting unit tests
 *
 * Tests cover:
 *   1. getTierRateLimit returns correct limits for each plan
 *   2. Unknown plan falls back to 'free'
 *   3. Undefined plan falls back to 'free'
 *   4. isApproachingLimit threshold detection
 *   5. tierRateLimitMiddleware: sets X-RateLimit-* headers
 *   6. tierRateLimitMiddleware: passes through when under limit
 *   7. tierRateLimitMiddleware: blocks at exactly limit (429 + upgrade message)
 *   8. tierRateLimitMiddleware: fails open when KV unavailable
 *   9. tierRateLimitMiddleware: fails open when DB unavailable
 *  10. tierRateLimitMiddleware: skips enforcement for unauthenticated requests
 *  11. Upgrade prompt in 429 body includes plan name
 *  12. X-RateLimit-Warning header set at threshold
 *  13. X-RateLimit-Warning NOT set below threshold
 *  14. Pro tier gets higher limit than free tier
 *  15. Enterprise tier highest limit
 */

import { describe, it, expect } from 'vitest';
import {
  getTierRateLimit,
  isApproachingLimit,
  TIER_RATE_LIMITS,
} from './rate-limit-tiers.js';

// ---- getTierRateLimit -------------------------------------------------------

describe('getTierRateLimit', () => {
  it('returns free tier for "free" plan', () => {
    const config = getTierRateLimit('free');
    expect(config.plan).toBe('free');
    expect(config.requestsPerMinute).toBe(30);
  });

  it('returns starter tier', () => {
    const config = getTierRateLimit('starter');
    expect(config.requestsPerMinute).toBe(60);
  });

  it('returns growth tier', () => {
    const config = getTierRateLimit('growth');
    expect(config.requestsPerMinute).toBe(120);
  });

  it('returns pro tier', () => {
    const config = getTierRateLimit('pro');
    expect(config.requestsPerMinute).toBe(200);
  });

  it('returns enterprise tier', () => {
    const config = getTierRateLimit('enterprise');
    expect(config.requestsPerMinute).toBe(1000);
  });

  it('falls back to free for unknown plan', () => {
    const config = getTierRateLimit('unknown-plan-xyz');
    expect(config.plan).toBe('free');
    expect(config.requestsPerMinute).toBe(30);
  });

  it('falls back to free for undefined', () => {
    const config = getTierRateLimit(undefined);
    expect(config.plan).toBe('free');
  });

  it('pro tier has higher limit than free tier', () => {
    expect(getTierRateLimit('pro').requestsPerMinute).toBeGreaterThan(
      getTierRateLimit('free').requestsPerMinute,
    );
  });

  it('enterprise tier has highest limit', () => {
    const limits = Object.values(TIER_RATE_LIMITS).map((t) => t.requestsPerMinute);
    expect(getTierRateLimit('enterprise').requestsPerMinute).toBe(Math.max(...limits));
  });
});

// ---- isApproachingLimit ----------------------------------------------------

describe('isApproachingLimit', () => {
  const freeConfig = getTierRateLimit('free'); // 30/min, threshold 0.8 → 24

  it('returns false well below threshold', () => {
    expect(isApproachingLimit(10, freeConfig, 'requestsPerMinute')).toBe(false);
  });

  it('returns true at threshold (80% of 30 = 24)', () => {
    expect(isApproachingLimit(24, freeConfig, 'requestsPerMinute')).toBe(true);
  });

  it('returns true above threshold', () => {
    expect(isApproachingLimit(29, freeConfig, 'requestsPerMinute')).toBe(true);
  });

  it('returns false at 23 (just below 80% of 30)', () => {
    expect(isApproachingLimit(23, freeConfig, 'requestsPerMinute')).toBe(false);
  });

  it('works for aiRequestsPerHour dimension', () => {
    const proConfig = getTierRateLimit('pro'); // 500 AI/h, threshold 0.9 → 450
    expect(isApproachingLimit(450, proConfig, 'aiRequestsPerHour')).toBe(true);
    expect(isApproachingLimit(449, proConfig, 'aiRequestsPerHour')).toBe(false);
  });

  it('works for uploadsPerDay dimension', () => {
    const starterConfig = getTierRateLimit('starter'); // 100 uploads/day, threshold 0.8 → 80
    expect(isApproachingLimit(80, starterConfig, 'uploadsPerDay')).toBe(true);
    expect(isApproachingLimit(79, starterConfig, 'uploadsPerDay')).toBe(false);
  });
});

// ---- tierRateLimitMiddleware -----------------------------------------------
// We test the middleware by importing and calling it directly with mock contexts.

type MockKV = {
  data: Map<string, string>;
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  degraded?: boolean;
};

type MockDB = {
  rows: Record<string, { subscription_plan: string }>;
  degraded?: boolean;
  prepare(sql: string): {
    bind(...args: unknown[]): { first<T>(): Promise<T | null> };
  };
};

function makeKv(initial: Record<string, string> = {}, opts: { degraded?: boolean } = {}): MockKV {
  const data = new Map(Object.entries(initial));
  return {
    data,
    degraded: opts.degraded,
    async get(key: string) {
      if (opts.degraded) throw new Error('KV unavailable');
      return data.get(key) ?? null;
    },
    async put(key: string, value: string) {
      if (opts.degraded) throw new Error('KV unavailable');
      data.set(key, value);
    },
  };
}

function makeDb(rows: Record<string, { subscription_plan: string }> = {}, opts: { degraded?: boolean } = {}): MockDB {
  return {
    rows,
    degraded: opts.degraded,
    prepare(_sql: string) {
      return {
        bind(...args: unknown[]) {
          const workspaceId = args[0] as string;
          return {
            async first<T>(): Promise<T | null> {
              if (opts.degraded) throw new Error('DB unavailable');
              return (rows[workspaceId] ?? null) as T | null;
            },
          };
        },
      };
    },
  };
}

// Minimal context factory
function makeCtx(opts: {
  auth?: { workspaceId?: string; tenantId?: string; userId?: string } | null;
  kv?: MockKV;
  db?: MockDB;
}) {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let jsonBody: unknown = null;

  return {
    get(key: string) {
      if (key === 'auth') return opts.auth ?? undefined;
      return undefined;
    },
    req: { path: '/test', method: 'GET' },
    env: { RATE_LIMIT_KV: opts.kv ?? makeKv(), DB: opts.db ?? makeDb() },
    header(k: string, v: string) { headers[k] = v; },
    json(body: unknown, status?: number) {
      jsonBody = body;
      if (status) statusCode = status;
      return { body, status: status ?? 200 };
    },
    _headers: headers,
    _status: () => statusCode,
    _body: () => jsonBody,
  };
}

// Import the actual middleware function
import { tierRateLimitMiddleware } from './rate-limit.js';

describe('tierRateLimitMiddleware', () => {
  it('passes through unauthenticated requests without enforcing limits', async () => {
    const ctx = makeCtx({ auth: null });
    const mw = tierRateLimitMiddleware();
    let nextCalled = false;
    await mw(ctx as never, async () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    expect(ctx._headers['X-RateLimit-Tier']).toBeUndefined();
  });

  it('sets X-RateLimit-* headers on pass-through', async () => {
    const kv = makeKv({});
    const db = makeDb({ 'ws_001': { subscription_plan: 'pro' } });
    const ctx = makeCtx({ auth: { workspaceId: 'ws_001', tenantId: 'tnt_001', userId: 'u_001' }, kv, db });
    const mw = tierRateLimitMiddleware();
    await mw(ctx as never, async () => {});
    expect(ctx._headers['X-RateLimit-Tier']).toBe('pro');
    expect(ctx._headers['X-RateLimit-Limit']).toBe('200');
    expect(ctx._headers['X-RateLimit-Remaining']).toBe('200');
    expect(ctx._headers['X-RateLimit-Reset']).toBeDefined();
  });

  it('allows request when under limit (free tier, count=0)', async () => {
    const kv = makeKv({});
    const db = makeDb({ 'ws_free': { subscription_plan: 'free' } });
    const ctx = makeCtx({ auth: { workspaceId: 'ws_free', tenantId: 'tnt_002' }, kv, db });
    const mw = tierRateLimitMiddleware();
    let nextCalled = false;
    await mw(ctx as never, async () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    expect(ctx._headers['X-RateLimit-Remaining']).toBe('30');
  });

  it('blocks at exactly the limit (free tier = 30)', async () => {
    const kv = makeKv({ 'rl:tier:ws:ws_full': '30' });
    const db = makeDb({ 'ws_full': { subscription_plan: 'free' } });
    const ctx = makeCtx({ auth: { workspaceId: 'ws_full', tenantId: 'tnt_003' }, kv, db });
    const mw = tierRateLimitMiddleware();
    let nextCalled = false;
    const result = await mw(ctx as never, async () => { nextCalled = true; });
    expect(nextCalled).toBe(false);
    expect(ctx._status()).toBe(429);
    const body = ctx._body() as { error: string; plan: string; message: string };
    expect(body.error).toBe('rate_limit_exceeded');
    expect(body.plan).toBe('free');
    expect(body.message).toContain('Upgrade');
    expect(result).toBeDefined();
  });

  it('sets X-RateLimit-Warning when approaching threshold', async () => {
    // free: 30/min, 80% threshold = 24
    const kv = makeKv({ 'rl:tier:ws:ws_warn': '24' });
    const db = makeDb({ 'ws_warn': { subscription_plan: 'free' } });
    const ctx = makeCtx({ auth: { workspaceId: 'ws_warn', tenantId: 'tnt_004' }, kv, db });
    const mw = tierRateLimitMiddleware();
    await mw(ctx as never, async () => {});
    expect(ctx._headers['X-RateLimit-Warning']).toBe('true');
  });

  it('does NOT set X-RateLimit-Warning below threshold', async () => {
    // free: 30/min, 80% threshold = 24; at 23 should not warn
    const kv = makeKv({ 'rl:tier:ws:ws_ok': '23' });
    const db = makeDb({ 'ws_ok': { subscription_plan: 'free' } });
    const ctx = makeCtx({ auth: { workspaceId: 'ws_ok', tenantId: 'tnt_005' }, kv, db });
    const mw = tierRateLimitMiddleware();
    await mw(ctx as never, async () => {});
    expect(ctx._headers['X-RateLimit-Warning']).toBeUndefined();
  });

  it('fails open when KV is unavailable (request passes through)', async () => {
    const kv = makeKv({}, { degraded: true });
    const db = makeDb({ 'ws_kvdown': { subscription_plan: 'free' } });
    const ctx = makeCtx({ auth: { workspaceId: 'ws_kvdown', tenantId: 'tnt_006' }, kv, db });
    const mw = tierRateLimitMiddleware();
    let nextCalled = false;
    await mw(ctx as never, async () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
  });

  it('fails open when DB is unavailable (falls back to free tier)', async () => {
    const kv = makeKv({});
    const db = makeDb({}, { degraded: true });
    const ctx = makeCtx({ auth: { workspaceId: 'ws_dbdown', tenantId: 'tnt_007' }, kv, db });
    const mw = tierRateLimitMiddleware();
    let nextCalled = false;
    await mw(ctx as never, async () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    // Falls back to free tier headers
    expect(ctx._headers['X-RateLimit-Tier']).toBe('free');
    expect(ctx._headers['X-RateLimit-Limit']).toBe('30');
  });

  it('upgrade message in 429 body includes plan name (starter)', async () => {
    const kv = makeKv({ 'rl:tier:ws:ws_start': '60' });
    const db = makeDb({ 'ws_start': { subscription_plan: 'starter' } });
    const ctx = makeCtx({ auth: { workspaceId: 'ws_start', tenantId: 'tnt_008' }, kv, db });
    const mw = tierRateLimitMiddleware();
    await mw(ctx as never, async () => {});
    const body = ctx._body() as { message: string; plan: string };
    expect(body.plan).toBe('starter');
    expect(body.message).toContain('starter');
  });
});
