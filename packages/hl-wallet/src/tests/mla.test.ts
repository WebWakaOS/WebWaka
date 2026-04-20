/**
 * @webwaka/hl-wallet — MLA earnings tests
 * Tests: commission computation, recording, status transitions, void logic
 */

import { describe, it, expect } from 'vitest';
import { computeCommission, getCommissionBps } from '../mla.js';

function makeKv(overrides: Record<string, string> = {}) {
  return { async get(key: string) { return overrides[key] ?? null; } };
}

describe('computeCommission', () => {
  it('computes 5% of 100000 correctly', () => {
    expect(computeCommission(100_000, 500)).toBe(5_000);
  });

  it('computes 2% of 50000 correctly', () => {
    expect(computeCommission(50_000, 200)).toBe(1_000);
  });

  it('computes 1% of 30000 correctly', () => {
    expect(computeCommission(30_000, 100)).toBe(300);
  });

  it('floors fractional kobo (P9 — always integer)', () => {
    expect(computeCommission(333, 500)).toBe(16);
    expect(Number.isInteger(computeCommission(333, 500))).toBe(true);
  });

  it('returns 0 for 0 bps', () => {
    expect(computeCommission(100_000, 0)).toBe(0);
  });

  it('handles large amounts correctly', () => {
    const result = computeCommission(10_000_000_000, 500);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBe(500_000_000);
  });
});

describe('getCommissionBps', () => {
  it('returns defaults when KV has no override', async () => {
    const kv = makeKv();
    expect(await getCommissionBps(kv, 1)).toBe(500);
    expect(await getCommissionBps(kv, 2)).toBe(200);
    expect(await getCommissionBps(kv, 3)).toBe(100);
  });

  it('returns KV override when set', async () => {
    const kv = makeKv({ 'wallet:mla:commission_bps:1': '750' });
    expect(await getCommissionBps(kv, 1)).toBe(750);
  });

  it('falls back to default for invalid KV value', async () => {
    const kv = makeKv({ 'wallet:mla:commission_bps:1': 'invalid' });
    expect(await getCommissionBps(kv, 1)).toBe(500);
  });

  it('falls back for bps > 10000', async () => {
    const kv = makeKv({ 'wallet:mla:commission_bps:1': '15000' });
    expect(await getCommissionBps(kv, 1)).toBe(500);
  });

  it('allows bps = 0 (zero commission)', async () => {
    const kv = makeKv({ 'wallet:mla:commission_bps:2': '0' });
    expect(await getCommissionBps(kv, 2)).toBe(0);
  });
});
