/**
 * CircuitBreaker unit tests — P7-D
 *
 * Verifies state machine transitions:
 *   CLOSED → OPEN (after N failures)
 *   OPEN → HALF_OPEN (after recovery timeout)
 *   HALF_OPEN → CLOSED (on success)
 *   HALF_OPEN → OPEN (on failure)
 *
 * Platform Invariant: ARC-15 — After 5 consecutive Paystack failures,
 * subsequent calls must throw immediately without hitting the API.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker } from './circuit-breaker.js';

// ---------------------------------------------------------------------------
// Mock KV namespace
// ---------------------------------------------------------------------------

function makeMockKV(initialData: Record<string, string> = {}): KVNamespace {
  const store = new Map<string, string>(Object.entries(initialData));

  return {
    get: vi.fn(async (key: string, opts?: unknown) => {
      const val = store.get(key) ?? null;
      if (!val) return null;
      const optsObj = opts as { type?: string } | undefined;
      if (optsObj?.type === 'json') {
        try { return JSON.parse(val); } catch { return null; }
      }
      return val;
    }),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: vi.fn(async (key: string) => { store.delete(key); }),
    list: vi.fn(async () => ({ keys: [], list_complete: true, cursor: '' })),
    getWithMetadata: vi.fn(async () => ({ value: null, metadata: null })),
  } as unknown as KVNamespace;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CircuitBreaker — initial state', () => {
  it('starts in CLOSED state', async () => {
    const kv = makeMockKV();
    const cb = new CircuitBreaker(kv, 'paystack', { failureThreshold: 3, recoveryTimeoutMs: 5000 });
    expect(await cb.getState()).toBe('CLOSED');
  });

  it('passes through to fn in CLOSED state', async () => {
    const kv = makeMockKV();
    const cb = new CircuitBreaker(kv, 'paystack', { failureThreshold: 3, recoveryTimeoutMs: 5000 });
    const result = await cb.call(async () => 'ok');
    expect(result).toBe('ok');
  });
});

describe('CircuitBreaker — failure threshold (CLOSED → OPEN)', () => {
  it('trips OPEN after failureThreshold consecutive failures', async () => {
    const kv = makeMockKV();
    const cb = new CircuitBreaker(kv, 'paystack', { failureThreshold: 3, recoveryTimeoutMs: 5000 });

    const fail = async () => { throw new Error('API error'); };

    await expect(cb.call(fail)).rejects.toThrow('API error');
    await expect(cb.call(fail)).rejects.toThrow('API error');
    await expect(cb.call(fail)).rejects.toThrow('API error');

    // Now breaker should be OPEN
    expect(await cb.getState()).toBe('OPEN');
  });

  it('does NOT trip before reaching the threshold', async () => {
    const kv = makeMockKV();
    const cb = new CircuitBreaker(kv, 'termii', { failureThreshold: 5, recoveryTimeoutMs: 5000 });

    const fail = async () => { throw new Error('network error'); };

    // 4 failures — one less than threshold
    for (let i = 0; i < 4; i++) {
      await expect(cb.call(fail)).rejects.toThrow('network error');
    }

    // Still CLOSED
    expect(await cb.getState()).toBe('CLOSED');
  });

  it('throws circuit breaker error (not underlying error) when OPEN', async () => {
    const kv = makeMockKV();
    const cb = new CircuitBreaker(kv, 'paystack', { failureThreshold: 2, recoveryTimeoutMs: 30000 });

    const fail = async () => { throw new Error('504 Gateway Timeout'); };
    await expect(cb.call(fail)).rejects.toThrow('504 Gateway Timeout');
    await expect(cb.call(fail)).rejects.toThrow('504 Gateway Timeout');

    // Now OPEN — next call should immediately throw the circuit breaker error
    await expect(cb.call(async () => 'should not run')).rejects.toThrow('circuit OPEN');
  });

  it('subsequent calls after 5 Paystack failures immediately throw without calling fn (ARC-15)', async () => {
    const kv = makeMockKV();
    const cb = new CircuitBreaker(kv, 'paystack', { failureThreshold: 5, recoveryTimeoutMs: 60000 });

    const apiSpy = vi.fn(async () => { throw new Error('Paystack 503'); });

    // Trip the breaker
    for (let i = 0; i < 5; i++) {
      await expect(cb.call(apiSpy)).rejects.toThrow();
    }

    const callCountAtOpen = apiSpy.mock.calls.length;
    expect(callCountAtOpen).toBe(5);

    // These calls should NOT reach the API (no new spy calls)
    await expect(cb.call(apiSpy)).rejects.toThrow('circuit OPEN');
    await expect(cb.call(apiSpy)).rejects.toThrow('circuit OPEN');
    await expect(cb.call(apiSpy)).rejects.toThrow('circuit OPEN');

    // apiSpy should still have been called only 5 times (not 6, 7, or 8)
    expect(apiSpy.mock.calls.length).toBe(5);
  });
});

describe('CircuitBreaker — recovery (OPEN → HALF_OPEN → CLOSED)', () => {
  it('transitions to HALF_OPEN after recovery timeout elapses', async () => {
    const kv = makeMockKV();
    const cb = new CircuitBreaker(kv, 'prembly', { failureThreshold: 2, recoveryTimeoutMs: 1 });

    const fail = async () => { throw new Error('err'); };
    await expect(cb.call(fail)).rejects.toThrow();
    await expect(cb.call(fail)).rejects.toThrow();

    expect(await cb.getState()).toBe('OPEN');

    // Wait for recovery timeout (1ms)
    await new Promise((r) => setTimeout(r, 10));

    // Next call should go through (HALF_OPEN probe)
    await expect(cb.call(async () => 'recovered')).resolves.toBe('recovered');
    expect(await cb.getState()).toBe('CLOSED');
  });

  it('returns to OPEN on HALF_OPEN probe failure', async () => {
    const kv = makeMockKV();
    const cb = new CircuitBreaker(kv, 'prembly', { failureThreshold: 2, recoveryTimeoutMs: 1 });

    const fail = async () => { throw new Error('still down'); };
    await expect(cb.call(fail)).rejects.toThrow();
    await expect(cb.call(fail)).rejects.toThrow();

    await new Promise((r) => setTimeout(r, 10));

    // Probe fails
    await expect(cb.call(fail)).rejects.toThrow('still down');
    expect(await cb.getState()).toBe('OPEN');
  });
});

describe('CircuitBreaker — manual reset', () => {
  it('can be manually reset to CLOSED from OPEN', async () => {
    const kv = makeMockKV();
    const cb = new CircuitBreaker(kv, 'openai', { failureThreshold: 1, recoveryTimeoutMs: 99999 });

    await expect(cb.call(async () => { throw new Error('err'); })).rejects.toThrow();
    expect(await cb.getState()).toBe('OPEN');

    await cb.reset();
    expect(await cb.getState()).toBe('CLOSED');
  });
});

describe('CircuitBreaker — KV failure resilience', () => {
  it('treats KV read errors as CLOSED (fail-open)', async () => {
    const kv = {
      get: vi.fn(async () => { throw new Error('KV unavailable'); }),
      put: vi.fn(async () => {}),
    } as unknown as KVNamespace;

    const cb = new CircuitBreaker(kv, 'paystack', { failureThreshold: 5, recoveryTimeoutMs: 5000 });
    // Should not throw from the circuit breaker itself
    const result = await cb.call(async () => 42);
    expect(result).toBe(42);
  });
});
