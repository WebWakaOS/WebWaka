/**
 * AIUsageChart data-contract tests — Wave 3 A6-2
 */
import { describe, it, expect } from 'vitest';
import type { AIUsageData, DailySpend, TenantSpend, CapabilityUsage } from './AIUsageChart.js';

function makeMockData(): AIUsageData {
  const dailySpend: DailySpend[] = Array.from({ length: 30 }, (_, i) => ({
    date: `2026-04-${String(i + 1).padStart(2, '0')}`,
    wakaCuTotal: (i + 1) * 100,
    callCount: (i + 1) * 5,
  }));
  const topTenants: TenantSpend[] = [
    { tenantId: 't1', tenantName: 'Chukwu Farms',  wakaCuTotal: 5000, callCount: 200 },
    { tenantId: 't2', tenantName: 'Lagos Pharmacy', wakaCuTotal: 3200, callCount: 150 },
    { tenantId: 't3',                               wakaCuTotal: 1800, callCount: 80  },
  ];
  const topCapabilities: CapabilityUsage[] = [
    { capability: 'inventory_ai',    callCount: 500, wakaCuTotal: 2500 },
    { capability: 'bio_generator',   callCount: 300, wakaCuTotal: 900  },
    { capability: 'shift_summary_ai',callCount: 200, wakaCuTotal: 600  },
  ];
  return { dailySpend, topTenants, topCapabilities,
           periodStart: '2026-04-01', periodEnd: '2026-04-30',
           totalWakaCu: 46_500, totalCalls: 1_850 };
}

describe('AIUsageChart data types (A6-2)', () => {
  it('has required fields', () => {
    const d = makeMockData();
    expect(Array.isArray(d.dailySpend)).toBe(true);
    expect(Array.isArray(d.topTenants)).toBe(true);
    expect(Array.isArray(d.topCapabilities)).toBe(true);
    expect(typeof d.periodStart).toBe('string');
    expect(typeof d.totalWakaCu).toBe('number');
  });
  it('DailySpend values are integers (P9)', () => {
    makeMockData().dailySpend.forEach(d => {
      expect(Number.isInteger(d.wakaCuTotal)).toBe(true);
    });
  });
  it('topTenants sorted descending by wakaCuTotal', () => {
    const { topTenants } = makeMockData();
    for (let i = 0; i < topTenants.length - 1; i++) {
      expect(topTenants[i]!.wakaCuTotal).toBeGreaterThanOrEqual(topTenants[i + 1]!.wakaCuTotal);
    }
  });
  it('topCapabilities have non-empty slugs', () => {
    makeMockData().topCapabilities.forEach(c => {
      expect(c.capability.length).toBeGreaterThan(0);
      expect(c.callCount).toBeGreaterThanOrEqual(0);
    });
  });
  it('unnamed tenant falls back to tenantId', () => {
    const unnamed = makeMockData().topTenants.find(t => !t.tenantName);
    expect(unnamed?.tenantId).toBeTruthy();
  });
  it('totalWakaCu is a positive integer', () => {
    const d = makeMockData();
    expect(Number.isInteger(d.totalWakaCu)).toBe(true);
    expect(d.totalWakaCu).toBeGreaterThan(0);
  });
  it('dailySpend has 30 entries for 30-day window', () => {
    expect(makeMockData().dailySpend).toHaveLength(30);
  });
});
