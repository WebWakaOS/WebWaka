/**
 * QuietHoursService test suite — N-062 (Phase 5).
 *
 * Covers:
 *   - isInQuietHours: non-wrapping window, wrapping window, edge cases
 *   - G12: severity='critical' always bypasses quiet hours
 *   - computeQueueDelayMs: returns positive ms when in quiet hours
 *   - QuietHoursService class wrapper with injected `now`
 */

import { describe, it, expect } from 'vitest';
import {
  isInQuietHours,
  computeQueueDelayMs,
  currentHourInTZ,
  QuietHoursService,
  type QuietHoursConfig,
} from './quiet-hours.js';

// ---------------------------------------------------------------------------
// currentHourInTZ
// ---------------------------------------------------------------------------

describe('currentHourInTZ', () => {
  it('extracts hour 0-23 for Africa/Lagos (UTC+1)', () => {
    // UTC midnight = 01:00 WAT
    const midnightUTC = new Date('2025-01-15T00:00:00Z');
    const hour = currentHourInTZ('Africa/Lagos', midnightUTC);
    expect(hour).toBe(1);
  });

  it('handles UTC timezone', () => {
    const date = new Date('2025-01-15T14:30:00Z');
    expect(currentHourInTZ('UTC', date)).toBe(14);
  });

  it('falls back to UTC hour for unknown timezone', () => {
    const date = new Date('2025-01-15T10:00:00Z');
    const hour = currentHourInTZ('Invalid/TZ', date);
    expect(hour).toBe(10); // UTC fallback
  });
});

// ---------------------------------------------------------------------------
// isInQuietHours
// ---------------------------------------------------------------------------

describe('isInQuietHours', () => {
  it('returns false when no quiet hours configured', () => {
    const config: QuietHoursConfig = { timezone: 'UTC' };
    const now = new Date('2025-01-15T23:00:00Z');
    expect(isInQuietHours(config, 'info', now)).toBe(false);
  });

  it('non-wrapping window: returns true when inside [start, end)', () => {
    const config: QuietHoursConfig = { quietHoursStart: 22, quietHoursEnd: 23, timezone: 'UTC' };
    const inside = new Date('2025-01-15T22:30:00Z'); // hour=22
    expect(isInQuietHours(config, 'info', inside)).toBe(true);
  });

  it('non-wrapping window: returns false when outside', () => {
    const config: QuietHoursConfig = { quietHoursStart: 22, quietHoursEnd: 23, timezone: 'UTC' };
    const outside = new Date('2025-01-15T21:00:00Z'); // hour=21
    expect(isInQuietHours(config, 'info', outside)).toBe(false);
  });

  it('wrapping window: in early morning (start=22, end=6)', () => {
    const config: QuietHoursConfig = { quietHoursStart: 22, quietHoursEnd: 6, timezone: 'UTC' };
    const earlyMorn = new Date('2025-01-15T03:00:00Z'); // hour=3
    expect(isInQuietHours(config, 'info', earlyMorn)).toBe(true);
  });

  it('wrapping window: in late evening (start=22, end=6)', () => {
    const config: QuietHoursConfig = { quietHoursStart: 22, quietHoursEnd: 6, timezone: 'UTC' };
    const lateEvening = new Date('2025-01-15T22:00:00Z'); // hour=22
    expect(isInQuietHours(config, 'info', lateEvening)).toBe(true);
  });

  it('wrapping window: just outside (hour=6 is excluded)', () => {
    const config: QuietHoursConfig = { quietHoursStart: 22, quietHoursEnd: 6, timezone: 'UTC' };
    const justAfter = new Date('2025-01-15T06:00:00Z'); // hour=6 → NOT in [22..24 OR 0..6)
    expect(isInQuietHours(config, 'info', justAfter)).toBe(false);
  });

  it('G12: severity=critical bypasses quiet hours (always returns false)', () => {
    const config: QuietHoursConfig = { quietHoursStart: 0, quietHoursEnd: 23, timezone: 'UTC' };
    const inside = new Date('2025-01-15T12:00:00Z');
    expect(isInQuietHours(config, 'critical', inside)).toBe(false);
  });

  it('G12: severity=warning is NOT bypassed (still subject to quiet hours)', () => {
    const config: QuietHoursConfig = { quietHoursStart: 8, quietHoursEnd: 18, timezone: 'UTC' };
    const inside = new Date('2025-01-15T12:00:00Z'); // hour=12, inside [8,18)
    expect(isInQuietHours(config, 'warning', inside)).toBe(true);
  });

  it('Africa/Lagos: UTC midnight is hour 1 WAT — not in [22,6) window', () => {
    const config: QuietHoursConfig = { quietHoursStart: 22, quietHoursEnd: 6, timezone: 'Africa/Lagos' };
    const utcMidnight = new Date('2025-01-15T00:00:00Z'); // 01:00 WAT
    expect(isInQuietHours(config, 'info', utcMidnight)).toBe(true); // 01 is inside [22,6) wrapping
  });
});

// ---------------------------------------------------------------------------
// computeQueueDelayMs
// ---------------------------------------------------------------------------

describe('computeQueueDelayMs', () => {
  it('returns 0 when no quietHoursEnd configured', () => {
    const config: QuietHoursConfig = { timezone: 'UTC' };
    expect(computeQueueDelayMs(config, new Date())).toBe(0);
  });

  it('returns positive ms when called at 23:00 with quietHoursEnd=6', () => {
    const config: QuietHoursConfig = { quietHoursStart: 22, quietHoursEnd: 6, timezone: 'UTC' };
    const at23 = new Date('2025-01-15T23:00:00Z');
    const delayMs = computeQueueDelayMs(config, at23);
    // 7 hours until 06:00 UTC next day
    expect(delayMs).toBeGreaterThan(0);
    expect(delayMs).toBeLessThanOrEqual(8 * 3_600_000);
  });

  it('delay is approximately correct (within 1 minute tolerance)', () => {
    const config: QuietHoursConfig = { quietHoursStart: 22, quietHoursEnd: 6, timezone: 'UTC' };
    const at23 = new Date('2025-01-15T23:00:00Z');
    const delayMs = computeQueueDelayMs(config, at23);
    // Expected: 7 hours = 25,200,000 ms
    const expected = 7 * 3_600_000;
    expect(Math.abs(delayMs - expected)).toBeLessThan(60_000); // ±1 min tolerance
  });
});

// ---------------------------------------------------------------------------
// QuietHoursService (class wrapper)
// ---------------------------------------------------------------------------

describe('QuietHoursService', () => {
  it('isInQuietHours delegates to pure function with injected now', () => {
    const fixedNow = new Date('2025-01-15T10:00:00Z'); // hour=10
    const svc = new QuietHoursService(() => fixedNow);
    const config: QuietHoursConfig = { quietHoursStart: 8, quietHoursEnd: 12, timezone: 'UTC' };
    expect(svc.isInQuietHours(config, 'info')).toBe(true);
  });

  it('computeQueueDelayMs uses injected now', () => {
    const fixedNow = new Date('2025-01-15T22:00:00Z');
    const svc = new QuietHoursService(() => fixedNow);
    const config: QuietHoursConfig = { quietHoursStart: 22, quietHoursEnd: 6, timezone: 'UTC' };
    const delay = svc.computeQueueDelayMs(config);
    expect(delay).toBeGreaterThan(0);
  });
});
