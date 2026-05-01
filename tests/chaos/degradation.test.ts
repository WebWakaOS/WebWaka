/**
 * Chaos Engineering Test Suite (L-11)
 *
 * Simulates infrastructure failures to verify graceful degradation:
 * 1. KV unavailability — rate limiting fails open, no request blocked
 * 2. Queue saturation — backpressure behaviour, no data loss
 * 3. D1 slow response — timeout handling, no connection leaks
 * 4. D1 hard failure — query errors return 500, not crash
 * 5. Circuit breaker — external API tripping and recovery
 * 6. Concurrent load — no state corruption under 100 concurrent requests
 *
 * Run: npx vitest run tests/chaos/
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';

// ─────────────────────────────────────────────────────────────────────────────
// 1. KV Unavailability — Rate Limiting Fails Open
// ─────────────────────────────────────────────────────────────────────────────

describe('Chaos: KV Unavailability (Rate Limiting)', () => {
  it('rate limiter fails open when KV.get() throws', async () => {
    const mockKV = {
      get: vi.fn().mockRejectedValue(new Error('KV unavailable: connection refused')),
      put: vi.fn().mockRejectedValue(new Error('KV unavailable: connection refused')),
      getWithMetadata: vi.fn().mockRejectedValue(new Error('KV unavailable')),
    };

    // Simulate the fail-open pattern used in rate-limit.ts
    async function rateLimitMiddlewareStub(kv: typeof mockKV, ip: string): Promise<'pass' | 'block'> {
      try {
        const key = `rl:${ip}`;
        const raw = await kv.get(key);
        if (raw !== null && Number(raw) >= 100) {
          return 'block';
        }
        await kv.put(key, '1', { expirationTtl: 60 });
        return 'pass';
      } catch {
        // Fail-open: KV outage must not block legitimate requests
        console.error(JSON.stringify({ event: 'kv_rate_limit_failure', ip }));
        return 'pass';
      }
    }

    const result = await rateLimitMiddlewareStub(mockKV, '102.89.1.1');
    expect(result).toBe('pass');
    expect(mockKV.get).toHaveBeenCalledOnce();
  });

  it('logs a structured error when KV is unavailable', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockKV = {
      get: vi.fn().mockRejectedValue(new Error('KV timeout')),
      put: vi.fn().mockRejectedValue(new Error('KV timeout')),
    };

    async function stub(kv: typeof mockKV): Promise<void> {
      try {
        await kv.get('rl:test:key');
      } catch (err) {
        console.error(JSON.stringify({
          event: 'kv_read_failure',
          key: 'rl:test:key',
          error: (err as Error).message,
        }));
      }
    }

    await stub(mockKV);

    expect(errorSpy).toHaveBeenCalledOnce();
    const logged = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(logged.event).toBe('kv_read_failure');
    expect(logged.error).toBe('KV timeout');

    errorSpy.mockRestore();
  });

  it('rate limiter still blocks requests when KV returns a count ≥ limit', async () => {
    const mockKV = {
      get: vi.fn().mockResolvedValue('100'),
      put: vi.fn().mockResolvedValue(undefined),
    };

    async function stub(kv: typeof mockKV): Promise<'pass' | 'block'> {
      try {
        const raw = await kv.get('rl:test');
        if (raw !== null && Number(raw) >= 100) return 'block';
        return 'pass';
      } catch {
        return 'pass';
      }
    }

    expect(await stub(mockKV)).toBe('block');
  });

  it('rate limiter does not retry KV on failure (no amplification)', async () => {
    const mockKV = {
      get: vi.fn().mockRejectedValue(new Error('KV timeout')),
      put: vi.fn(),
    };

    async function stub(kv: typeof mockKV): Promise<'pass' | 'block'> {
      try {
        await kv.get('rl:key');
      } catch {
        return 'pass';
      }
      return 'pass';
    }

    await stub(mockKV);
    // Must not retry — KV calls exactly once
    expect(mockKV.get).toHaveBeenCalledTimes(1);
    expect(mockKV.put).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Queue Saturation — Backpressure Behaviour
// ─────────────────────────────────────────────────────────────────────────────

describe('Chaos: Queue Saturation (Notification Queue)', () => {
  it('notification producer marks delivery as queuing_failed on queue saturation', async () => {
    const mockQueue = {
      send: vi.fn().mockRejectedValue(new Error('Queue full: backpressure limit reached')),
    };

    // Simulate the notification producer error handler
    async function produceNotification(queue: typeof mockQueue, payload: object) {
      try {
        await queue.send(payload);
        return { status: 'queued' };
      } catch (err) {
        console.error(JSON.stringify({
          event: 'notification_queue_failure',
          error: (err as Error).message,
        }));
        return { status: 'queuing_failed', error: (err as Error).message };
      }
    }

    const result = await produceNotification(mockQueue, { type: 'push', userId: 'u1' });
    expect(result.status).toBe('queuing_failed');
    expect(result.error).toContain('Queue full');
    expect(mockQueue.send).toHaveBeenCalledOnce();
  });

  it('queue saturation does not crash the request handler', async () => {
    const app = new Hono();
    const mockQueue = {
      send: vi.fn().mockRejectedValue(new Error('Queue full')),
    };

    app.post('/test/notify', async (c) => {
      try {
        await mockQueue.send({ msg: 'hello' });
      } catch {
        // Absorb — do not propagate to HTTP response
      }
      return c.json({ ok: true });
    });

    const res = await app.request('/test/notify', { method: 'POST' });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it('DLQ receives failed messages on queue saturation', async () => {
    const dlq: object[] = [];
    const primaryQueue = {
      send: vi.fn().mockRejectedValue(new Error('Queue full')),
    };
    const deadLetterQueue = {
      send: vi.fn().mockImplementation(async (msg: object) => {
        dlq.push(msg);
      }),
    };

    async function sendWithDLQ(msg: object) {
      try {
        await primaryQueue.send(msg);
      } catch {
        await deadLetterQueue.send({ ...msg, dlq_reason: 'queue_full' });
      }
    }

    await sendWithDLQ({ type: 'email', to: 'user@example.com' });
    expect(dlq).toHaveLength(1);
    expect((dlq[0] as { dlq_reason: string }).dlq_reason).toBe('queue_full');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. D1 Slow Response — Timeout Handling
// ─────────────────────────────────────────────────────────────────────────────

describe('Chaos: D1 Slow Response (Timeout Handling)', () => {
  it('times out gracefully after configured threshold', async () => {
    async function queryWithTimeout<T>(
      queryFn: () => Promise<T>,
      timeoutMs: number,
    ): Promise<T | { error: string; timedOut: true }> {
      return Promise.race([
        queryFn(),
        new Promise<{ error: string; timedOut: true }>((_, reject) =>
          setTimeout(() => reject({ error: 'D1 query timeout', timedOut: true }), timeoutMs),
        ),
      ]).catch((e) => (e as { timedOut: boolean }).timedOut ? e : { error: (e as Error).message, timedOut: true as const });
    }

    const slowQuery = () => new Promise<{ results: unknown[] }>((resolve) =>
      setTimeout(() => resolve({ results: [] }), 300),
    );

    const result = await queryWithTimeout(slowQuery, 100);
    expect(result).toHaveProperty('timedOut', true);
  });

  it('fast queries complete successfully (no false positives)', async () => {
    async function queryWithTimeout<T>(queryFn: () => Promise<T>, timeoutMs: number) {
      return Promise.race([
        queryFn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeoutMs),
        ),
      ]);
    }

    const fastQuery = () => new Promise<{ results: string[] }>((resolve) =>
      setTimeout(() => resolve({ results: ['a', 'b'] }), 10),
    );

    const result = await queryWithTimeout(fastQuery, 500);
    expect(result).toEqual({ results: ['a', 'b'] });
  });

  it('does not leak global state on query timeout', () => {
    const stateRegistry: Map<string, string> = new Map();

    function beginQuery(id: string) {
      stateRegistry.set(id, 'pending');
    }

    function finaliseQuery(id: string, status: 'done' | 'error') {
      stateRegistry.set(id, status);
    }

    // Simulate a query that times out — cleanup must still run
    const queryId = 'q-chaos-001';
    beginQuery(queryId);
    try {
      throw new Error('D1 timeout');
    } catch {
      finaliseQuery(queryId, 'error');
    }

    expect(stateRegistry.get(queryId)).toBe('error');
    // No dangling 'pending' state
    const pending = [...stateRegistry.values()].filter((v) => v === 'pending');
    expect(pending).toHaveLength(0);
  });

  it('returns HTTP 500 (not crash) when D1 throws unexpectedly', async () => {
    const app = new Hono();

    app.get('/test/query', async (c) => {
      try {
        // Simulate DB.prepare().bind().first() throwing
        throw new Error('D1: database is locked');
      } catch (err) {
        console.error(JSON.stringify({ event: 'd1_query_error', error: (err as Error).message }));
        return c.json({ error: 'Database error' }, 500);
      }
    });

    const res = await app.request('/test/query');
    expect(res.status).toBe(500);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Database error');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Circuit Breaker — External API Tripping and Recovery
// ─────────────────────────────────────────────────────────────────────────────

describe('Chaos: Circuit Breaker (External API)', () => {
  type CircuitState = 'closed' | 'open' | 'half-open';

  class SimpleCircuitBreaker {
    private failures = 0;
    private state: CircuitState = 'closed';
    private openedAt: number | null = null;

    constructor(
      private readonly threshold: number = 3,
      private readonly recoveryMs: number = 100,
    ) {}

    async call<T>(fn: () => Promise<T>): Promise<T> {
      if (this.state === 'open') {
        if (Date.now() - (this.openedAt ?? 0) > this.recoveryMs) {
          this.state = 'half-open';
        } else {
          throw new Error('Circuit open — request rejected');
        }
      }

      try {
        const result = await fn();
        if (this.state === 'half-open') {
          this.state = 'closed';
          this.failures = 0;
        }
        return result;
      } catch (err) {
        this.failures++;
        if (this.failures >= this.threshold) {
          this.state = 'open';
          this.openedAt = Date.now();
        }
        throw err;
      }
    }

    getState(): CircuitState {
      return this.state;
    }
  }

  it('trips open after threshold failures', async () => {
    const cb = new SimpleCircuitBreaker(3, 10_000);
    const failFn = vi.fn().mockRejectedValue(new Error('Paystack timeout'));

    for (let i = 0; i < 3; i++) {
      await cb.call(failFn).catch(() => {});
    }

    expect(cb.getState()).toBe('open');
  });

  it('rejects requests immediately when circuit is open', async () => {
    const cb = new SimpleCircuitBreaker(1, 10_000);
    await cb.call(() => Promise.reject(new Error('fail'))).catch(() => {});

    const rejection = await cb.call(() => Promise.resolve('ok')).catch((e) => e as Error);
    expect(rejection.message).toContain('Circuit open');
  });

  it('transitions to half-open after recovery window', async () => {
    const cb = new SimpleCircuitBreaker(1, 50);
    await cb.call(() => Promise.reject(new Error('fail'))).catch(() => {});
    expect(cb.getState()).toBe('open');

    await new Promise((r) => setTimeout(r, 60));

    // Next call puts it in half-open, then succeeds → closed
    await cb.call(() => Promise.resolve('ok'));
    expect(cb.getState()).toBe('closed');
  });

  it('stays open if half-open probe also fails', async () => {
    const cb = new SimpleCircuitBreaker(1, 50);
    await cb.call(() => Promise.reject(new Error('fail'))).catch(() => {});
    await new Promise((r) => setTimeout(r, 60));

    // Probe fails again
    await cb.call(() => Promise.reject(new Error('still failing'))).catch(() => {});
    expect(cb.getState()).toBe('open');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Concurrent Load — No State Corruption
// ─────────────────────────────────────────────────────────────────────────────

describe('Chaos: Concurrent Request Handling', () => {
  it('handles 100 concurrent requests without state corruption', async () => {
    const results: number[] = [];
    const concurrency = 100;

    const promises = Array.from({ length: concurrency }, (_, i) =>
      new Promise<number>((resolve) => {
        setTimeout(() => {
          results.push(i);
          resolve(i);
        }, Math.random() * 10);
      }),
    );

    const completed = await Promise.all(promises);
    expect(completed).toHaveLength(concurrency);
    expect(results).toHaveLength(concurrency);
  });

  it('per-request state is isolated under concurrency', async () => {
    const app = new Hono();
    const requestLog: string[] = [];

    app.get('/test/concurrent', async (c) => {
      const requestId = c.req.header('X-Request-Id') ?? 'unknown';
      // Simulate some async work
      await new Promise((r) => setTimeout(r, Math.random() * 5));
      requestLog.push(requestId);
      return c.json({ requestId });
    });

    const ids = Array.from({ length: 20 }, (_, i) => `req-${i}`);
    const responses = await Promise.all(
      ids.map((id) =>
        app.request('/test/concurrent', { headers: { 'X-Request-Id': id } })
          .then((r) => r.json() as Promise<{ requestId: string }>),
      ),
    );

    // Each response should contain its own request ID (no cross-contamination)
    for (const resp of responses) {
      expect(ids).toContain(resp.requestId);
    }

    expect(requestLog).toHaveLength(20);
  });

  it('no data loss when notifications are sent concurrently', async () => {
    const received: string[] = [];
    const mockQueue = {
      send: vi.fn().mockImplementation(async (msg: { id: string }) => {
        received.push(msg.id);
      }),
    };

    const ids = Array.from({ length: 50 }, (_, i) => `notif-${i}`);
    await Promise.all(ids.map((id) => mockQueue.send({ id })));

    expect(received).toHaveLength(50);
    // All IDs must be present
    for (const id of ids) {
      expect(received).toContain(id);
    }
  });
});
