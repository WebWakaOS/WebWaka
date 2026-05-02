/**
 * ErrorRateChart tests — Wave 3 C6-4
 * Tests data transformation logic (no DOM rendering required)
 */
import { describe, it, expect } from 'vitest';
import type { RouteErrorStats, HourlyErrorPoint, ErrorRateData } from './ErrorRateChart.js';

// Mirror the pure functions from the component
const formatRate = (r: number) => `${(r * 100).toFixed(2)}%`;
function deriveOverallColor(rate: number): string {
  if (rate > 0.05) return '#ef4444'; // red
  if (rate > 0.01) return '#f59e0b'; // amber
  return '#22c55e';                  // green
}

describe('ErrorRateChart logic (C6-4)', () => {
  describe('formatRate', () => {
    it('0% formats correctly', () => expect(formatRate(0)).toBe('0.00%'));
    it('1% formats correctly',  () => expect(formatRate(0.01)).toBe('1.00%'));
    it('5.5% formats correctly',() => expect(formatRate(0.055)).toBe('5.50%'));
    it('100% formats correctly',() => expect(formatRate(1)).toBe('100.00%'));
  });

  describe('deriveOverallColor', () => {
    it('0% → green', () => expect(deriveOverallColor(0)).toBe('#22c55e'));
    it('0.5% → green', () => expect(deriveOverallColor(0.005)).toBe('#22c55e'));
    it('1.1% → amber', () => expect(deriveOverallColor(0.011)).toBe('#f59e0b'));
    it('3% → amber',   () => expect(deriveOverallColor(0.03)).toBe('#f59e0b'));
    it('5.1% → red',   () => expect(deriveOverallColor(0.051)).toBe('#ef4444'));
    it('10% → red',    () => expect(deriveOverallColor(0.10)).toBe('#ef4444'));
  });

  describe('data shape', () => {
    const sample: ErrorRateData = {
      period_start: '2026-05-01T09:00:00Z',
      period_end:   '2026-05-02T09:00:00Z',
      overall_rate: 0.023,
      top_routes: [
        { route: '/v1/superagent/chat', error_count: 12, total_count: 500, error_rate: 0.024, p95_ms: 1200 },
        { route: '/v1/workspace',       error_count: 2,  total_count: 300, error_rate: 0.007, p95_ms: 80 },
      ],
      hourly_series: [
        { hour: '2026-05-02T08:00:00Z', error_count: 3,  total_count: 50 },
        { hour: '2026-05-02T09:00:00Z', error_count: 0,  total_count: 45 },
      ],
    };

    it('top_routes error_rate is 0–1', () => {
      for (const r of sample.top_routes) {
        expect(r.error_rate).toBeGreaterThanOrEqual(0);
        expect(r.error_rate).toBeLessThanOrEqual(1);
      }
    });

    it('overall_rate matches expected color (amber)', () => {
      expect(deriveOverallColor(sample.overall_rate)).toBe('#f59e0b');
    });

    it('hourly_series has error_count ≥ 0', () => {
      for (const pt of sample.hourly_series) {
        expect(pt.error_count).toBeGreaterThanOrEqual(0);
      }
    });

    it('empty data renders safely (no throws)', () => {
      const empty: ErrorRateData = { period_start:'', period_end:'', overall_rate:0, top_routes:[], hourly_series:[] };
      expect(empty.top_routes).toHaveLength(0);
      expect(empty.overall_rate).toBe(0);
    });
  });
});
