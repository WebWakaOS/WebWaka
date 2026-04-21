/**
 * @webwaka/hl-wallet — Funding tests
 * WF-031/032: Balance cap at creation + confirmation time
 * HITL threshold: NaN guard, default, KV override
 */

import { describe, it, expect } from 'vitest';
import { getHitlThresholdKobo } from '../funding.js';

function makeKv(store: Record<string, string> = {}) {
  return { async get(key: string) { return store[key] ?? null; } };
}

// ---------------------------------------------------------------------------
// getHitlThresholdKobo — NaN safety guards
// ---------------------------------------------------------------------------

describe('getHitlThresholdKobo', () => {
  it('returns default 10_000_000 (₦100k) when KV key is absent', async () => {
    expect(await getHitlThresholdKobo(makeKv())).toBe(10_000_000);
  });

  it('returns KV override when set to a valid positive integer', async () => {
    const kv = makeKv({ 'wallet:hitl_threshold_kobo': '5000000' });
    expect(await getHitlThresholdKobo(kv)).toBe(5_000_000);
  });

  it('falls back to default when KV value is NaN (invalid string)', async () => {
    const kv = makeKv({ 'wallet:hitl_threshold_kobo': 'abc' });
    expect(await getHitlThresholdKobo(kv)).toBe(10_000_000);
  });

  it('falls back to default when KV value is zero (security: HITL must always trigger at some point)', async () => {
    const kv = makeKv({ 'wallet:hitl_threshold_kobo': '0' });
    expect(await getHitlThresholdKobo(kv)).toBe(10_000_000);
  });

  it('falls back to default when KV value is negative', async () => {
    const kv = makeKv({ 'wallet:hitl_threshold_kobo': '-1' });
    expect(await getHitlThresholdKobo(kv)).toBe(10_000_000);
  });

  it('falls back to default when KV value is empty string (falsy)', async () => {
    const kv = makeKv({ 'wallet:hitl_threshold_kobo': '' });
    expect(await getHitlThresholdKobo(kv)).toBe(10_000_000);
  });

  it('correctly handles large valid thresholds', async () => {
    const kv = makeKv({ 'wallet:hitl_threshold_kobo': '50000000' });
    expect(await getHitlThresholdKobo(kv)).toBe(50_000_000);
  });
});
