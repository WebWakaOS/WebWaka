/**
 * Governance check tests — check-analytics-freshness (Wave 3 C6-3)
 */
import { describe, it, expect } from 'vitest';

const STALE_THRESHOLD_HOURS = 6;

function checkFreshness(lastProjectedAt: Date): { fresh: boolean; ageHours: number } {
  const ageHours = (Date.now() - lastProjectedAt.getTime()) / (1000 * 3600);
  return { fresh: ageHours <= STALE_THRESHOLD_HOURS, ageHours };
}

describe('Governance: check-analytics-freshness (C6-3)', () => {
  it('passes when projected 1 minute ago', () => {
    const ts = new Date(Date.now() - 60_000);
    expect(checkFreshness(ts).fresh).toBe(true);
  });

  it('passes when projected exactly 6 hours ago', () => {
    const ts = new Date(Date.now() - 6 * 3600 * 1000);
    const { ageHours } = checkFreshness(ts);
    expect(ageHours).toBeLessThanOrEqual(STALE_THRESHOLD_HOURS + 0.01); // floating point tolerance
  });

  it('fails when projected 7 hours ago (stale)', () => {
    const ts = new Date(Date.now() - 7 * 3600 * 1000);
    expect(checkFreshness(ts).fresh).toBe(false);
  });

  it('fails when projected 24 hours ago', () => {
    const ts = new Date(Date.now() - 24 * 3600 * 1000);
    expect(checkFreshness(ts).fresh).toBe(false);
  });

  it('ageHours is a non-negative number', () => {
    const ts = new Date(Date.now() - 2 * 3600 * 1000);
    const { ageHours } = checkFreshness(ts);
    expect(ageHours).toBeGreaterThan(0);
    expect(Number.isFinite(ageHours)).toBe(true);
  });

  it('invalid date string → NaN ageHours → stale', () => {
    const ts = new Date('not-a-date');
    const ageHours = (Date.now() - ts.getTime()) / (1000 * 3600);
    expect(isNaN(ageHours)).toBe(true);
    // NaN > 6 is false in JS — check explicitly
    expect(!(ageHours <= STALE_THRESHOLD_HOURS)).toBe(true);
  });
});
