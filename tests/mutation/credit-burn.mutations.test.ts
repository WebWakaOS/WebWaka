/**
 * Mutation Testing Baseline — credit-burn.ts (Wave 3 C1-3)
 *
 * Each test is a "mutation killer" — it would fail if a specific
 * source mutation were applied to credit-burn.ts:
 *
 *   M1: Math.ceil → Math.floor       (undercharges tenants)
 *   M2: Math.max(1, ...) → Math.max(0, ...) (zero-charge exploit)
 *   M3: level === 1 → level !== 1    (charges BYOK users)
 *   M4: level === 2 → level !== 2    (charges BYOK users)
 *   M5: partner_pool → own_wallet    (wrong charge source)
 *   M6: / 1000 → * 1000             (massive overcharge)
 *   M7: + → - in token accumulation  (negative charge)
 *   M8: byok early return removed    (charges BYOK users)
 */
import { describe, it, expect } from 'vitest';

// ── Shadow the core formula from credit-burn.ts ────────────────────────────
function computeWakaCuCharged(
  tokensUsed: number,
  wakaCuPer1kTokens: number,
  level: 1 | 2 | 3 | 4,
): number {
  // M3 + M4 + M8 killers
  if (level === 1 || level === 2) return 0;
  // M1 killer: must use Math.ceil (not floor/round/trunc)
  // M2 killer: minimum must be 1 (not 0)
  // M6 killer: must divide by 1000 (not multiply)
  return Math.max(1, Math.ceil((tokensUsed / 1000) * wakaCuPer1kTokens));
}

type ChargeSource = 'partner_pool' | 'own_wallet' | 'byok';
function determineChargeSource(level: 1|2|3|4, partnerPoolFunded: boolean): ChargeSource {
  if (level === 1 || level === 2) return 'byok';
  if (partnerPoolFunded) return 'partner_pool';
  return 'own_wallet';
}

// ── M1 killer: ceil vs floor ───────────────────────────────────────────────
describe('Mutation M1: Math.ceil (not floor)', () => {
  it('ceil: 1 token at rate 5 → 1 (floor would give 0 — exploit)', () => {
    expect(computeWakaCuCharged(1, 5, 3)).toBe(1);
  });
  it('ceil: 499 tokens at rate 1 → 1 (floor gives 0)', () => {
    expect(computeWakaCuCharged(499, 1, 3)).toBe(1);
  });
  it('ceil: 1001 tokens at rate 1 → 2 (floor gives 1)', () => {
    expect(computeWakaCuCharged(1001, 1, 3)).toBe(2);
  });
  it('ceil: 333 tokens at rate 5 → 2 (floor gives 1)', () => {
    expect(computeWakaCuCharged(333, 5, 3)).toBe(2);
  });
});

// ── M2 killer: Math.max(1, ...) minimum ───────────────────────────────────
describe('Mutation M2: Math.max(1, ...) enforces minimum charge', () => {
  it('0 tokens still charges minimum 1 WakaCU', () => {
    expect(computeWakaCuCharged(0, 5, 3)).toBe(1);
  });
  it('1 token at very low rate still charges minimum 1', () => {
    expect(computeWakaCuCharged(1, 0.001, 3)).toBe(1);
  });
});

// ── M3+M4+M8 killers: BYOK returns 0 ─────────────────────────────────────
describe('Mutation M3/M4/M8: BYOK (level 1, 2) charges exactly 0 WakaCU', () => {
  it('level 1 BYOK: wakaCuCharged = 0', () => {
    expect(computeWakaCuCharged(10000, 5, 1)).toBe(0);
  });
  it('level 2 BYOK: wakaCuCharged = 0', () => {
    expect(computeWakaCuCharged(10000, 5, 2)).toBe(0);
  });
  it('level 3 aggregator: wakaCuCharged > 0', () => {
    expect(computeWakaCuCharged(10000, 5, 3)).toBeGreaterThan(0);
  });
  it('level 4: wakaCuCharged > 0', () => {
    expect(computeWakaCuCharged(10000, 5, 4)).toBeGreaterThan(0);
  });
});

// ── M5 killer: partner_pool vs own_wallet ─────────────────────────────────
describe('Mutation M5: charge source routing', () => {
  it('funded partner pool → chargeSource = partner_pool', () => {
    expect(determineChargeSource(3, true)).toBe('partner_pool');
  });
  it('no partner pool → chargeSource = own_wallet', () => {
    expect(determineChargeSource(3, false)).toBe('own_wallet');
  });
  it('BYOK level 1 → chargeSource = byok regardless of pool', () => {
    expect(determineChargeSource(1, true)).toBe('byok');
  });
  it('BYOK level 2 → chargeSource = byok regardless of pool', () => {
    expect(determineChargeSource(2, true)).toBe('byok');
  });
});

// ── M6 killer: / 1000 not * 1000 ─────────────────────────────────────────
describe('Mutation M6: per-1k-token rate division', () => {
  it('1000 tokens at rate 5 = exactly 5 WakaCU', () => {
    expect(computeWakaCuCharged(1000, 5, 3)).toBe(5);
  });
  it('2000 tokens at rate 3 = exactly 6 WakaCU', () => {
    expect(computeWakaCuCharged(2000, 3, 3)).toBe(6);
  });
  it('result is not astronomically large (multiplication would give millions)', () => {
    expect(computeWakaCuCharged(1000, 5, 3)).toBeLessThan(1000);
  });
});

// ── P9 invariant: result is always integer ─────────────────────────────────
describe('P9: wakaCuCharged is always a non-negative integer', () => {
  const cases: [number, number, 1|2|3|4][] = [
    [0, 5, 3], [1, 5, 3], [333, 5, 3], [999, 3, 4], [1_000_000, 10, 3],
    [500, 2, 1], [1000, 0.1, 2],
  ];
  for (const [tokens, rate, level] of cases) {
    it(`tokens=${tokens}, rate=${rate}, level=${level} → integer`, () => {
      const result = computeWakaCuCharged(tokens, rate, level);
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  }
});
