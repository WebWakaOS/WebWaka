/**
 * kvGet / kvGetText unit tests — P7-E
 *
 * Verifies safe KV reads:
 * - Returns stored value when present
 * - Returns fallback when key is absent
 * - Returns fallback when KV throws
 */

import { describe, it, expect, vi } from 'vitest';
import { kvGet, kvGetText } from './kv-safe.js';

function makeMockKV(behaviour: 'value' | 'null' | 'throw', value?: unknown): KVNamespace {
  return {
    get: vi.fn(async () => {
      if (behaviour === 'throw') throw new Error('KV unavailable');
      if (behaviour === 'null') return null;
      return value;
    }),
    put: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
  } as unknown as KVNamespace;
}

describe('kvGet', () => {
  it('returns the stored JSON value when present', async () => {
    const kv = makeMockKV('value', { user: 'ada' });
    const result = await kvGet<{ user: string }>(kv, 'some-key', { user: 'fallback' });
    expect(result).toEqual({ user: 'ada' });
  });

  it('returns fallback when key is absent (null)', async () => {
    const kv = makeMockKV('null');
    const result = await kvGet<string>(kv, 'missing-key', 'default-value');
    expect(result).toBe('default-value');
  });

  it('returns fallback and logs error when KV throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const kv = makeMockKV('throw');
    const result = await kvGet<number>(kv, 'error-key', 99);
    expect(result).toBe(99);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[kvGet]'),
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it('never throws — always returns fallback on any KV error', async () => {
    const kv = makeMockKV('throw');
    await expect(kvGet(kv, 'key', null)).resolves.toBeNull();
  });
});

describe('kvGetText', () => {
  it('returns the stored text value when present', async () => {
    const kv = makeMockKV('value', 'hello world');
    const result = await kvGetText(kv, 'text-key');
    expect(result).toBe('hello world');
  });

  it('returns null fallback when key is absent', async () => {
    const kv = makeMockKV('null');
    const result = await kvGetText(kv, 'missing-key');
    expect(result).toBeNull();
  });

  it('returns custom fallback when key is absent', async () => {
    const kv = makeMockKV('null');
    const result = await kvGetText(kv, 'missing-key', 'my-default');
    expect(result).toBe('my-default');
  });

  it('returns fallback and logs error when KV throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const kv = makeMockKV('throw');
    const result = await kvGetText(kv, 'error-key', 'safe-fallback');
    expect(result).toBe('safe-fallback');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
