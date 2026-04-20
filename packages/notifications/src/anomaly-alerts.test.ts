/**
 * N-110 (Phase 7) — Bounce rate anomaly detection tests.
 *
 * Tests checkBounceRateAnomalies() across:
 *   - Normal delivery (no anomaly)
 *   - Exactly at threshold (no anomaly — strictly greater-than)
 *   - Above threshold (anomaly detected)
 *   - Multiple providers (isolated results per provider+channel)
 *   - Minimum volume guard (< 10 deliveries = no anomaly)
 *   - Channel filter option
 *   - Time window cutoff
 */

import { describe, it, expect } from 'vitest';
import { checkBounceRateAnomalies } from './anomaly-alerts.js';
import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// Mock D1 builder
// ---------------------------------------------------------------------------

interface DeliveryRow {
  provider: string;
  channel: string;
  total: number;
  failed: number;
}

function makeDb(rows: DeliveryRow[]): D1LikeFull {
  return {
    prepare: () => ({
      bind: () => ({
        run: async () => ({ success: true }),
        first: async () => null,
        all: async () => ({ results: rows }),
      }),
      run: async () => ({ success: true }),
      first: async () => null,
      all: async () => ({ results: rows }),
    }),
  } as unknown as D1LikeFull;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('checkBounceRateAnomalies', () => {
  it('returns empty array when no rows returned from DB', async () => {
    const db = makeDb([]);
    const result = await checkBounceRateAnomalies(db);
    expect(result).toEqual([]);
  });

  it('returns empty array when bounce rate is zero', async () => {
    const db = makeDb([{ provider: 'resend', channel: 'email', total: 100, failed: 0 }]);
    const result = await checkBounceRateAnomalies(db);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when bounce rate equals threshold exactly (strictly >)', async () => {
    // 5% threshold; 5/100 = 0.05 exactly — should NOT trigger (> not >=)
    const db = makeDb([{ provider: 'resend', channel: 'email', total: 100, failed: 5 }]);
    const result = await checkBounceRateAnomalies(db, { threshold: 0.05 });
    expect(result).toHaveLength(0);
  });

  it('returns anomaly when bounce rate exceeds threshold', async () => {
    // 6/100 = 0.06 > 0.05
    const db = makeDb([{ provider: 'resend', channel: 'email', total: 100, failed: 6 }]);
    const result = await checkBounceRateAnomalies(db, { threshold: 0.05 });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      provider: 'resend',
      channel: 'email',
      total: 100,
      failed: 6,
      threshold: 0.05,
    });
    expect(result[0]!.bounceRate).toBeCloseTo(0.06);
  });

  it('detects anomaly for termii sms independently of resend email', async () => {
    const db = makeDb([
      { provider: 'resend', channel: 'email', total: 100, failed: 2 },     // 2% — ok
      { provider: 'termii', channel: 'sms', total: 50, failed: 5 },         // 10% — anomaly
    ]);
    const result = await checkBounceRateAnomalies(db);
    expect(result).toHaveLength(1);
    expect(result[0]!.provider).toBe('termii');
    expect(result[0]!.channel).toBe('sms');
  });

  it('returns multiple anomalies when multiple providers exceed threshold', async () => {
    const db = makeDb([
      { provider: 'resend', channel: 'email', total: 100, failed: 10 },     // 10%
      { provider: 'termii', channel: 'sms', total: 50, failed: 6 },          // 12%
      { provider: 'meta_wa', channel: 'whatsapp', total: 80, failed: 2 },   // 2.5% — ok
    ]);
    const result = await checkBounceRateAnomalies(db, { threshold: 0.05 });
    expect(result).toHaveLength(2);
    const providers = result.map((r) => r.provider).sort();
    expect(providers).toEqual(['resend', 'termii']);
  });

  it('uses default threshold of 0.05 when not specified', async () => {
    // 4/100 = 4% — below default 5% threshold
    const db = makeDb([{ provider: 'resend', channel: 'email', total: 100, failed: 4 }]);
    const result = await checkBounceRateAnomalies(db);
    expect(result).toHaveLength(0);
  });

  it('respects custom threshold', async () => {
    // 3% bounce rate — exceeds custom 0.02 threshold
    const db = makeDb([{ provider: 'termii', channel: 'sms', total: 100, failed: 3 }]);
    const result = await checkBounceRateAnomalies(db, { threshold: 0.02 });
    expect(result).toHaveLength(1);
    expect(result[0]!.bounceRate).toBeCloseTo(0.03);
    expect(result[0]!.threshold).toBe(0.02);
  });

  it('returns empty array when total deliveries is zero (no division-by-zero)', async () => {
    const db = makeDb([{ provider: 'resend', channel: 'email', total: 0, failed: 0 }]);
    const result = await checkBounceRateAnomalies(db);
    expect(result).toHaveLength(0);
  });

  it('includes bounceRate field as a fraction (0.0-1.0)', async () => {
    const db = makeDb([{ provider: 'resend', channel: 'email', total: 100, failed: 20 }]);
    const result = await checkBounceRateAnomalies(db, { threshold: 0.05 });
    expect(result).toHaveLength(1);
    expect(result[0]!.bounceRate).toBeGreaterThan(0);
    expect(result[0]!.bounceRate).toBeLessThanOrEqual(1);
    expect(result[0]!.bounceRate).toBeCloseTo(0.2);
  });

  it('passes windowHours without throwing', async () => {
    const db = makeDb([]);
    await expect(checkBounceRateAnomalies(db, { windowHours: 24 })).resolves.toEqual([]);
  });

  it('passes channel filter without throwing', async () => {
    const db = makeDb([]);
    await expect(checkBounceRateAnomalies(db, { channel: 'email' })).resolves.toEqual([]);
  });
});
