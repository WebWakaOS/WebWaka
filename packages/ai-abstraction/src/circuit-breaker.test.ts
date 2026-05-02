/**
 * Tests for circuit-breaker.ts — Wave 3 C2-2
 */
import { describe, it, expect } from 'vitest';
import {
  CircuitBreaker,
  CircuitOpenError,
  getCircuitBreaker,
  resetAllCircuitBreakers,
  isProviderOpen,
} from './circuit-breaker.js';

// Deterministic clock helper
function makeClock(startMs = 0) {
  let t = startMs;
  return {
    now: () => t,
    advance: (ms: number) => { t += ms; },
  };
}

describe('CircuitBreaker — state machine', () => {
  it('starts CLOSED and passes calls through', async () => {
    const cb = new CircuitBreaker({ provider: 'openai' });
    const result = await cb.execute(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
    expect(cb.currentState).toBe('CLOSED');
  });

  it('stays CLOSED under threshold', async () => {
    const cb = new CircuitBreaker({ provider: 'openai', failureThreshold: 3 });
    for (let i = 0; i < 2; i++) {
      await cb.execute(() => Promise.reject(new Error('err'))).catch(() => {});
    }
    expect(cb.currentState).toBe('CLOSED');
  });

  it('transitions to OPEN after failureThreshold consecutive failures', async () => {
    const cb = new CircuitBreaker({ provider: 'openai', failureThreshold: 3 });
    for (let i = 0; i < 3; i++) {
      await cb.execute(() => Promise.reject(new Error('err'))).catch(() => {});
    }
    expect(cb.currentState).toBe('OPEN');
  });

  it('throws CircuitOpenError when OPEN', async () => {
    const cb = new CircuitBreaker({ provider: 'openai', failureThreshold: 1 });
    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    await expect(cb.execute(() => Promise.resolve('x'))).rejects.toBeInstanceOf(CircuitOpenError);
  });

  it('transitions to HALF_OPEN after openTtlMs', async () => {
    const clock = makeClock();
    const cb = new CircuitBreaker({ provider: 'openai', failureThreshold: 1, openTtlMs: 1000, now: clock.now });
    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    expect(cb.currentState).toBe('OPEN');
    clock.advance(1001);
    expect(cb.currentState).toBe('HALF_OPEN');
  });

  it('HALF_OPEN: success → CLOSED', async () => {
    const clock = makeClock();
    const cb = new CircuitBreaker({ provider: 'openai', failureThreshold: 1, openTtlMs: 1000, now: clock.now });
    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    clock.advance(1001);
    await cb.execute(() => Promise.resolve('ok'));
    expect(cb.currentState).toBe('CLOSED');
  });

  it('HALF_OPEN: failure → OPEN again', async () => {
    const clock = makeClock();
    const cb = new CircuitBreaker({ provider: 'openai', failureThreshold: 1, openTtlMs: 1000, now: clock.now });
    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    clock.advance(1001);
    await cb.execute(() => Promise.reject(new Error('probe fail'))).catch(() => {});
    expect(cb.currentState).toBe('OPEN');
  });

  it('reset() returns to CLOSED', async () => {
    const cb = new CircuitBreaker({ provider: 'openai', failureThreshold: 1 });
    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    cb.reset();
    expect(cb.currentState).toBe('CLOSED');
  });

  it('success resets consecutive failure count', async () => {
    const cb = new CircuitBreaker({ provider: 'openai', failureThreshold: 3 });
    for (let i = 0; i < 2; i++) {
      await cb.execute(() => Promise.reject(new Error('err'))).catch(() => {});
    }
    await cb.execute(() => Promise.resolve('ok'));
    // Should NOT be open — failures were reset
    expect(cb.currentState).toBe('CLOSED');
  });
});

describe('CircuitBreaker — global registry', () => {
  it('getCircuitBreaker returns same instance for same provider', () => {
    resetAllCircuitBreakers();
    const a = getCircuitBreaker('anthropic');
    const b = getCircuitBreaker('anthropic');
    expect(a).toBe(b);
  });

  it('isProviderOpen returns false for unknown provider', () => {
    resetAllCircuitBreakers();
    expect(isProviderOpen('unknown-provider')).toBe(false);
  });

  it('isProviderOpen returns true after failureThreshold', async () => {
    resetAllCircuitBreakers();
    const cb = getCircuitBreaker('groq', { failureThreshold: 1 });
    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    expect(isProviderOpen('groq')).toBe(true);
  });

  it('resetAllCircuitBreakers clears OPEN state', async () => {
    resetAllCircuitBreakers();
    const cb = getCircuitBreaker('cohere', { failureThreshold: 1 });
    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    resetAllCircuitBreakers();
    expect(isProviderOpen('cohere')).toBe(false);
  });
});
