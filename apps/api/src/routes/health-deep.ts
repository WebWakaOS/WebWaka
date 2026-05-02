/**
 * Deep Health Check — Wave 3 C4-2
 * GET /health/deep
 *
 * Checks D1 connectivity, KV read, and AI provider reachability.
 * Results are cached for TTL_SECONDS to avoid hammering dependencies.
 *
 * Response shape:
 * {
 *   "status": "ok" | "degraded" | "down",
 *   "checks": {
 *     "d1":          { "ok": true,  "latency_ms": 12 },
 *     "kv":          { "ok": true,  "latency_ms": 5 },
 *     "ai_provider": { "ok": false, "latency_ms": 3001, "error": "timeout" }
 *   },
 *   "cached_at": "2026-05-02T09:00:00.000Z",
 *   "cache_ttl_s": 30
 * }
 *
 * HTTP status codes:
 *   200 — all checks pass
 *   200 — degraded (some non-critical checks fail) — callers must inspect `status`
 *   503 — D1 (primary datastore) is down
 */

import type { Context } from 'hono';

const TTL_SECONDS = 30;

interface CheckResult { ok: boolean; latency_ms: number; error?: string }
interface DeepHealthResult {
  status: 'ok' | 'degraded' | 'down';
  checks: { d1: CheckResult; kv: CheckResult; ai_provider: CheckResult };
  cached_at: string;
  cache_ttl_s: number;
}

// Module-level cache (per Worker isolate — resets on deploy)
let cached: DeepHealthResult | null = null;
let cachedAt = 0;

async function checkD1(db: D1Database): Promise<CheckResult> {
  const start = Date.now();
  try {
    await db.prepare('SELECT 1').run();
    return { ok: true, latency_ms: Date.now() - start };
  } catch (e) {
    return { ok: false, latency_ms: Date.now() - start, error: String(e) };
  }
}

async function checkKV(kv: KVNamespace): Promise<CheckResult> {
  const start = Date.now();
  try {
    await kv.get('__health_probe__');
    return { ok: true, latency_ms: Date.now() - start };
  } catch (e) {
    return { ok: false, latency_ms: Date.now() - start, error: String(e) };
  }
}

async function checkAIProvider(): Promise<CheckResult> {
  const start = Date.now();
  // Lightweight HEAD request to OpenRouter status endpoint
  const AI_PROBE_URL = 'https://openrouter.ai/api/v1/models';
  try {
    const resp = await fetch(AI_PROBE_URL, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3_000),
    });
    return { ok: resp.ok || resp.status === 401, latency_ms: Date.now() - start };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, latency_ms: Date.now() - start, error: msg };
  }
}

export async function healthDeepHandler(ctx: Context): Promise<Response> {
  const now = Date.now();

  // Return cached result if still fresh
  if (cached && now - cachedAt < TTL_SECONDS * 1000) {
    return ctx.json(cached, cached.status === 'down' ? 503 : 200);
  }

  const env = ctx.env as { DB?: D1Database; KV?: KVNamespace };

  const [d1, kv, ai] = await Promise.all([
    env.DB ? checkD1(env.DB) : Promise.resolve({ ok: false, latency_ms: 0, error: 'DB binding missing' }),
    env.KV ? checkKV(env.KV) : Promise.resolve({ ok: false, latency_ms: 0, error: 'KV binding missing' }),
    checkAIProvider(),
  ]);

  const allOk = d1.ok && kv.ok && ai.ok;
  const coreOk = d1.ok; // D1 is critical; KV + AI degraded is tolerable

  const result: DeepHealthResult = {
    status: allOk ? 'ok' : coreOk ? 'degraded' : 'down',
    checks: { d1, kv, ai_provider: ai },
    cached_at: new Date().toISOString(),
    cache_ttl_s: TTL_SECONDS,
  };

  cached = result;
  cachedAt = now;

  return ctx.json(result, result.status === 'down' ? 503 : 200);
}
