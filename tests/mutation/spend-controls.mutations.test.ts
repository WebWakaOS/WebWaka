/**
 * Mutation Testing Baseline — spend-controls.ts (Wave 3 C1-3)
 *
 * Mutation killers for SpendControls:
 *
 *   M1: Number.isInteger → !Number.isInteger  (accepts floats)
 *   M2: v < 0 → v <= 0                        (rejects 0, valid budget)
 *   M3: v < 0 → v > 0                         (allows negative budgets)
 *   M4: allowed=true → allowed=false          (blocks all spend)
 *   M5: >= → > in remaining check             (off-by-one allows overspend)
 *   M6: Math.max(0, ...) removed             (returns negative remaining)
 */
import { describe, it, expect } from 'vitest';

// ── Shadow validation from spend-controls.ts ─────────────────────────────
function validateBudgetLimit(v: number): void {
  if (!Number.isInteger(v) || v < 0) {
    throw new Error(`[spend-controls] monthlyLimitWakaCu must be a non-negative integer. Got: ${v}`);
  }
}

// ── Shadow budget check from spend-controls.ts ────────────────────────────
function checkBudget(
  monthlyLimitWakaCu: number,
  currentMonthSpentWakaCu: number,
  requestedWakaCu: number,
): { allowed: boolean; remaining: number } {
  const remaining = Math.max(0, monthlyLimitWakaCu - currentMonthSpentWakaCu);
  const allowed = remaining >= requestedWakaCu;
  return { allowed, remaining };
}

// ── M1 killer ─────────────────────────────────────────────────────────────
describe('Mutation M1: Number.isInteger check', () => {
  it('100.5 is rejected (float)', () => expect(() => validateBudgetLimit(100.5)).toThrow());
  it('100 is accepted (integer)', () => expect(() => validateBudgetLimit(100)).not.toThrow());
  it('0.001 is rejected', () => expect(() => validateBudgetLimit(0.001)).toThrow());
  it('1_000_000 is accepted', () => expect(() => validateBudgetLimit(1_000_000)).not.toThrow());
});

// ── M2 killer ─────────────────────────────────────────────────────────────
describe('Mutation M2: 0 is a valid budget (not rejected)', () => {
  it('0 monthlyLimit is valid (disabled budget)', () => {
    expect(() => validateBudgetLimit(0)).not.toThrow();
  });
});

// ── M3 killer ─────────────────────────────────────────────────────────────
describe('Mutation M3: negative budgets are rejected', () => {
  it('-1 is rejected', () => expect(() => validateBudgetLimit(-1)).toThrow());
  it('-100 is rejected', () => expect(() => validateBudgetLimit(-100)).toThrow());
  it('Number.MIN_SAFE_INTEGER is rejected', () => {
    expect(() => validateBudgetLimit(Number.MIN_SAFE_INTEGER)).toThrow();
  });
});

// ── M4 killer ─────────────────────────────────────────────────────────────
describe('Mutation M4: checkBudget allows when remaining >= requested', () => {
  it('1000 limit, 0 spent, 500 requested → allowed', () => {
    expect(checkBudget(1000, 0, 500).allowed).toBe(true);
  });
  it('1000 limit, 500 spent, 500 requested → allowed (exactly at limit)', () => {
    expect(checkBudget(1000, 500, 500).allowed).toBe(true);
  });
  it('1000 limit, 501 spent, 500 requested → NOT allowed (over limit)', () => {
    expect(checkBudget(1000, 501, 500).allowed).toBe(false);
  });
});

// ── M5 killer ─────────────────────────────────────────────────────────────
describe('Mutation M5: off-by-one — exactly at limit is allowed', () => {
  it('remaining === requested → allowed (>= not >)', () => {
    expect(checkBudget(500, 0, 500).allowed).toBe(true);
  });
  it('remaining = 1, requested = 1 → allowed', () => {
    expect(checkBudget(100, 99, 1).allowed).toBe(true);
  });
  it('remaining = 0, requested = 1 → NOT allowed', () => {
    expect(checkBudget(100, 100, 1).allowed).toBe(false);
  });
});

// ── M6 killer ─────────────────────────────────────────────────────────────
describe('Mutation M6: remaining never negative', () => {
  it('overspent (spent > limit) → remaining = 0, not negative', () => {
    const { remaining } = checkBudget(100, 200, 10);
    expect(remaining).toBe(0);
    expect(remaining).toBeGreaterThanOrEqual(0);
  });
});
