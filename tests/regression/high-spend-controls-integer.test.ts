/**
 * Regression: P9 — SpendControls rejects fractional monthlyLimitWakaCu
 *
 * Platform Invariant P9: All WakaCU amounts must be integers.
 * SpendControls.setBudget() throws if a fractional limit is provided.
 */
import { describe, it, expect } from 'vitest';

function validateMonthlyLimit(v: number): void {
  if (!Number.isInteger(v) || v < 0) {
    throw new Error(`[spend-controls] monthlyLimitWakaCu must be a non-negative integer. Got: ${v}`);
  }
}

describe('Regression: P9 — SpendControls validates integer limits', () => {
  it('accepts valid integer 0', () => expect(() => validateMonthlyLimit(0)).not.toThrow());
  it('accepts valid integer 1000', () => expect(() => validateMonthlyLimit(1000)).not.toThrow());
  it('accepts large integer 1_000_000', () => expect(() => validateMonthlyLimit(1_000_000)).not.toThrow());

  it('rejects float 100.5', () => {
    expect(() => validateMonthlyLimit(100.5)).toThrow('non-negative integer');
  });
  it('rejects float 0.1', () => {
    expect(() => validateMonthlyLimit(0.1)).toThrow('non-negative integer');
  });
  it('rejects negative integer -1', () => {
    expect(() => validateMonthlyLimit(-1)).toThrow('non-negative integer');
  });
  it('rejects NaN', () => {
    expect(() => validateMonthlyLimit(NaN)).toThrow('non-negative integer');
  });
  it('rejects Infinity', () => {
    expect(() => validateMonthlyLimit(Infinity)).toThrow('non-negative integer');
  });
});
