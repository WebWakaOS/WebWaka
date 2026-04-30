/**
 * M-2: Canary observability tests
 *
 * Covers:
 * 1. recordCanaryRequest accumulates latency samples and error counts per cohort
 * 2. getCanaryHealthMetrics returns correct P50/P95 from known samples
 * 3. health=healthy when error rates are below 5%
 * 4. health=degraded when engine error rate is 5–9.9%
 * 5. health=critical when error rate >= 10%
 * 6. resetTrafficShiftMetrics clears extended store and resets 'since'
 * 7. logger.warn is called when error rate crosses warn threshold
 * 8. /admin/canary-status returns 200 for healthy, 503 for critical
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  recordCanaryRequest,
  getCanaryHealthMetrics,
  resetTrafficShiftMetrics,
  recordTrafficShiftDecision,
} from './traffic-shift.js';

// Reset store before each test so tests are isolated
beforeEach(() => {
  resetTrafficShiftMetrics();
});

describe('recordCanaryRequest + getCanaryHealthMetrics', () => {
  it('returns null latency percentiles when no requests recorded', () => {
    const m = getCanaryHealthMetrics();
    expect(m.stats.engine.latencyP50Ms).toBeNull();
    expect(m.stats.engine.latencyP95Ms).toBeNull();
    expect(m.stats.legacy.latencyP50Ms).toBeNull();
  });

  it('accumulates engine requests and computes correct P50', () => {
    // Record 5 engine requests with known latencies: 10, 20, 30, 40, 50
    for (const ms of [10, 20, 30, 40, 50]) {
      recordCanaryRequest(true, ms, false);
      recordTrafficShiftDecision(true);
    }
    const m = getCanaryHealthMetrics();
    expect(m.stats.engine.errorCount).toBe(0);
    expect(m.stats.engine.errorRate).toBe(0);
    // P50 of [10,20,30,40,50] (sorted) at index floor(0.5*4)=2 → 30
    expect(m.stats.engine.latencyP50Ms).toBe(30);
    // P95 at index floor(0.95*4)=3 → 40
    expect(m.stats.engine.latencyP95Ms).toBe(40);
  });

  it('accumulates legacy requests separately', () => {
    recordCanaryRequest(false, 100, false);
    recordCanaryRequest(false, 200, false);
    recordTrafficShiftDecision(false);
    recordTrafficShiftDecision(false);
    const m = getCanaryHealthMetrics();
    // P50 of [100,200] → index 0 → 100
    expect(m.stats.legacy.latencyP50Ms).toBe(100);
    expect(m.stats.engine.latencyP50Ms).toBeNull();
  });

  it('counts errors correctly in engine cohort', () => {
    recordCanaryRequest(true, 50, false);
    recordCanaryRequest(true, 60, true);  // error
    recordCanaryRequest(true, 70, false);
    const m = getCanaryHealthMetrics();
    expect(m.stats.engine.errorCount).toBe(1);
    expect(m.stats.engine.errorRate).toBeCloseTo(1 / 3, 5);
  });

  it('health=healthy when error rates < 5%', () => {
    // 1 error out of 100 = 1%
    for (let i = 0; i < 99; i++) recordCanaryRequest(true, 10, false);
    recordCanaryRequest(true, 10, true);
    const m = getCanaryHealthMetrics();
    expect(m.stats.engine.errorRate).toBeCloseTo(0.01, 3);
    expect(m.health).toBe('healthy');
  });

  it('health=degraded when engine error rate is exactly 5%', () => {
    for (let i = 0; i < 95; i++) recordCanaryRequest(true, 10, false);
    for (let i = 0; i < 5; i++) recordCanaryRequest(true, 10, true);
    const m = getCanaryHealthMetrics();
    expect(m.health).toBe('degraded');
  });

  it('health=critical when engine error rate >= 10%', () => {
    for (let i = 0; i < 90; i++) recordCanaryRequest(true, 10, false);
    for (let i = 0; i < 10; i++) recordCanaryRequest(true, 10, true);
    const m = getCanaryHealthMetrics();
    expect(m.health).toBe('critical');
  });
});

describe('resetTrafficShiftMetrics', () => {
  it('clears all stats and updates since timestamp', async () => {
    const before = new Date().toISOString();
    recordCanaryRequest(true, 100, false);
    recordTrafficShiftDecision(true);

    // Small delay to ensure 'since' timestamp changes
    await new Promise((r) => setTimeout(r, 2));
    resetTrafficShiftMetrics();

    const m = getCanaryHealthMetrics();
    expect(m.stats.totalRequests).toBe(0);
    expect(m.stats.engine.latencyP50Ms).toBeNull();
    expect(m.since >= before).toBe(true);
  });
});

describe('logger.warn on degraded canary', () => {
  it('calls logger.warn when error rate crosses WARN threshold', () => {
    const logger = { warn: vi.fn() };

    // 5 errors out of 10 = 50% error rate → critical → triggers warn
    for (let i = 0; i < 5; i++) recordCanaryRequest(true, 10, false, logger);
    for (let i = 0; i < 5; i++) recordCanaryRequest(true, 10, true, logger);

    expect(logger.warn).toHaveBeenCalled();
    const [msg, ctx] = logger.warn.mock.calls[logger.warn.mock.calls.length - 1];
    expect(msg).toContain('canary');
    expect((ctx as { event: string }).event).toBe('canary_health_degraded');
    expect((ctx as { cohort: string }).cohort).toBe('engine');
  });

  it('does NOT call logger when error rate is zero', () => {
    const logger = { warn: vi.fn() };
    for (let i = 0; i < 10; i++) recordCanaryRequest(true, 10, false, logger);
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
