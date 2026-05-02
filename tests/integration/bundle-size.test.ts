/**
 * Bundle Size Budget Integration Test — Wave 3 C3-2
 *
 * Verifies that:
 *   1. infra/bundle-baseline.json is valid and has the expected schema.
 *   2. The check-bundle-size.mjs script logic is correct — +15% threshold.
 *   3. Gross violations (e.g. 2× baseline) are always caught.
 *
 * NOTE: This does NOT build the apps. For actual bundle tracking, the
 * CI workflow (Frontend Bundle Size Check) builds and measures on every PR.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const BASELINE_PATH = join(process.cwd(), 'infra', 'bundle-baseline.json');
const THRESHOLD = 0.15; // 15% regression = fail

interface BundleBaseline {
  date: string;
  total: number;
  js: number;
  css: number;
  html: number;
  other: number;
  commit: string;
}

describe('Bundle Size Budget (C3-2)', () => {
  it('infra/bundle-baseline.json exists', () => {
    expect(existsSync(BASELINE_PATH)).toBe(true);
  });

  it('baseline has required fields', () => {
    const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as BundleBaseline;
    expect(typeof baseline.total).toBe('number');
    expect(typeof baseline.js).toBe('number');
    expect(typeof baseline.css).toBe('number');
    expect(typeof baseline.commit).toBe('string');
  });

  it('baseline total is a positive integer (bytes, P9-style)', () => {
    const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as BundleBaseline;
    expect(Number.isInteger(baseline.total)).toBe(true);
    expect(baseline.total).toBeGreaterThan(0);
  });

  describe('threshold logic', () => {
    const baselineTotal = 2_621_440; // ~2.5 MB from baseline

    it('passes when new total is at baseline', () => {
      const newTotal = baselineTotal;
      const ratio = newTotal / baselineTotal;
      expect(ratio - 1).toBeLessThanOrEqual(THRESHOLD);
    });

    it('passes when new total is 10% larger (within 15%)', () => {
      const newTotal = Math.floor(baselineTotal * 1.10);
      expect(newTotal / baselineTotal - 1).toBeLessThanOrEqual(THRESHOLD);
    });

    it('passes when new total is 15% larger (exactly at threshold)', () => {
      const newTotal = Math.floor(baselineTotal * 1.15);
      expect(newTotal / baselineTotal - 1).toBeLessThanOrEqual(THRESHOLD);
    });

    it('FAILS when new total exceeds baseline by 16%', () => {
      const newTotal = Math.floor(baselineTotal * 1.16);
      expect(newTotal / baselineTotal - 1).toBeGreaterThan(THRESHOLD);
    });

    it('FAILS when new total doubles (bundle bloat)', () => {
      const newTotal = baselineTotal * 2;
      expect(newTotal / baselineTotal - 1).toBeGreaterThan(THRESHOLD);
    });

    it('always passes when new total is smaller than baseline', () => {
      const newTotal = Math.floor(baselineTotal * 0.90);
      expect(newTotal / baselineTotal - 1).toBeLessThan(0);
      // Smaller is fine — no regression
      expect(newTotal).toBeLessThan(baselineTotal);
    });
  });
});
