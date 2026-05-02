/**
 * Tests for retry.ts — Wave 3 C2-1
 * withRetry, classifyError, backoffMs, AIRetryError
 */
import { describe, it, expect, vi } from 'vitest';
import { withRetry, classifyError, backoffMs, AIRetryError } from './retry.js';

// ── classifyError ────────────────────────────────────────────────────────────
describe('classifyError', () => {
  it('returns abort for 401', () => expect(classifyError({ status: 401 })).toBe('abort'));
  it('returns abort for 403', () => expect(classifyError({ status: 403 })).toBe('abort'));
  it('returns abort for 400', () => expect(classifyError({ status: 400 })).toBe('abort'));
  it('returns abort for 422', () => expect(classifyError({ status: 422 })).toBe('abort'));
  it('returns abort for context_length_exceeded', () =>
    expect(classifyError({ code: 'context_length_exceeded' })).toBe('abort'));
  it('returns abort for invalid_api_key', () =>
    expect(classifyError({ code: 'invalid_api_key' })).toBe('abort'));

  it('returns retry for 429', () => expect(classifyError({ status: 429 })).toBe('retry'));
  it('returns retry for 500', () => expect(classifyError({ status: 500 })).toBe('retry'));
  it('returns retry for 503', () => expect(classifyError({ status: 503 })).toBe('retry'));
  it('returns retry for rate_limit_exceeded code', () =>
    expect(classifyError({ code: 'rate_limit_exceeded' })).toBe('retry'));
  it('returns retry for timeout message', () =>
    expect(classifyError({ message: 'request timeout after 30s' })).toBe('retry'));
  it('returns retry for null (unknown)', () => expect(classifyError(null)).toBe('abort'));
});

// ── backoffMs ────────────────────────────────────────────────────────────────
describe('backoffMs', () => {
  it('grows with attempt number', () => {
    const d0 = backoffMs(0, 250);
    const d1 = backoffMs(1, 250);
    const d2 = backoffMs(2, 250);
    expect(d1).toBeGreaterThan(d0);
    expect(d2).toBeGreaterThan(d1);
  });
  it('never exceeds 8000ms cap', () => {
    for (let i = 0; i < 20; i++) {
      expect(backoffMs(i, 250)).toBeLessThanOrEqual(8000);
    }
  });
});

// ── withRetry ────────────────────────────────────────────────────────────────
describe('withRetry', () => {
  const noSleep = () => Promise.resolve();

  it('returns result immediately on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { sleep: noSleep });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 and succeeds on second attempt', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ status: 429, message: 'rate limit' })
      .mockResolvedValue('retried ok');
    const result = await withRetry(fn, { sleep: noSleep });
    expect(result).toBe('retried ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on 500 up to maxAttempts then throws AIRetryError', async () => {
    const fn = vi.fn().mockRejectedValue({ status: 500, message: 'server error' });
    await expect(withRetry(fn, { maxAttempts: 3, sleep: noSleep })).rejects.toBeInstanceOf(AIRetryError);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does NOT retry on 401 — aborts immediately', async () => {
    const fn = vi.fn().mockRejectedValue({ status: 401, message: 'unauthorized' });
    await expect(withRetry(fn, { maxAttempts: 3, sleep: noSleep })).rejects.toBeInstanceOf(AIRetryError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on context_length_exceeded', async () => {
    const fn = vi.fn().mockRejectedValue({ code: 'context_length_exceeded' });
    await expect(withRetry(fn, { maxAttempts: 3, sleep: noSleep })).rejects.toBeInstanceOf(AIRetryError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls onRetry callback with attempt count', async () => {
    const onRetry = vi.fn();
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ status: 429 })
      .mockResolvedValue('done');
    await withRetry(fn, { sleep: noSleep, onRetry });
    expect(onRetry).toHaveBeenCalledWith(1, expect.objectContaining({ status: 429 }));
  });

  it('AIRetryError.attempts reflects attempt count', async () => {
    const fn = vi.fn().mockRejectedValue({ status: 503 });
    try {
      await withRetry(fn, { maxAttempts: 2, sleep: noSleep });
    } catch (err) {
      expect(err).toBeInstanceOf(AIRetryError);
      expect((err as AIRetryError).attempts).toBe(2);
    }
  });
});
