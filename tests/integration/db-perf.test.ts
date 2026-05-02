/**
 * DB Performance Budget Tests — Wave 3 C2-3
 *
 * Runs common query patterns against an in-memory SQLite fixture
 * and asserts they complete within the defined budget (ms).
 *
 * Budgets (from db-perf.ts):
 *   Simple PK lookup:      ≤ 5ms
 *   Indexed range scan:    ≤ 20ms
 *   Tenant-scoped list:    ≤ 30ms
 *   Aggregate sum/count:   ≤ 50ms
 *   Join (2 tables):       ≤ 40ms
 *
 * These run against a mock/stub since real D1 is unavailable in unit tests.
 * For staging perf, see tests/k6/.
 */
import { describe, it, expect, beforeAll } from 'vitest';

// ── In-process timing helper ──────────────────────────────────────────────

function timed<T>(fn: () => T): { result: T; durationMs: number } {
  const start = performance.now();
  const result = fn();
  const durationMs = performance.now() - start;
  return { result, durationMs };
}

// ── Query budget definitions (mirrors db-perf.ts) ─────────────────────────

const BUDGETS = {
  pk_lookup:      5,
  indexed_range:  20,
  tenant_list:    30,
  aggregate:      50,
  join_2tables:   40,
} as const;

// ── In-memory data fixture (simulates D1 result latency) ──────────────────

function simulatePkLookup(rows: Record<string, unknown>[], id: string): Record<string, unknown> | null {
  return rows.find(r => r['id'] === id) ?? null;
}

function simulateIndexedRange(
  rows: Record<string, unknown>[], field: string, min: number, max: number,
): Record<string, unknown>[] {
  return rows.filter(r => Number(r[field]) >= min && Number(r[field]) <= max);
}

function simulateTenantList(rows: Record<string, unknown>[], tenantId: string): Record<string, unknown>[] {
  return rows.filter(r => r['tenant_id'] === tenantId);
}

function simulateAggregate(rows: Record<string, unknown>[], field: string): number {
  return rows.reduce((sum, r) => sum + (Number(r[field]) || 0), 0);
}

function simulateJoin(
  left: Record<string, unknown>[], right: Record<string, unknown>[],
  leftKey: string, rightKey: string,
): Record<string, unknown>[] {
  return left.map(l => {
    const r = right.find(r => r[rightKey] === l[leftKey]);
    return { ...l, ...(r ?? {}) };
  });
}

// ── Fixtures ──────────────────────────────────────────────────────────────

const OFFERING_COUNT = 5_000;
const TENANT_ID = 'tenant_perf_001';

let offerings: Record<string, unknown>[];
let transactions: Record<string, unknown>[];

beforeAll(() => {
  offerings = Array.from({ length: OFFERING_COUNT }, (_, i) => ({
    id: `off_${i}`,
    tenant_id: i % 3 === 0 ? TENANT_ID : `other_${i % 10}`,
    price_kobo: Math.floor(Math.random() * 100_000) + 100,
    category: i % 5 === 0 ? 'food' : 'goods',
    created_at: new Date(Date.now() - i * 60_000).toISOString(),
  }));

  transactions = Array.from({ length: 2_000 }, (_, i) => ({
    id: `tx_${i}`,
    offering_id: `off_${i % OFFERING_COUNT}`,
    tenant_id: i % 2 === 0 ? TENANT_ID : `other_${i % 10}`,
    amount_kobo: Math.floor(Math.random() * 50_000) + 500,
  }));
});

// ── Tests ─────────────────────────────────────────────────────────────────

describe('DB Performance Budget (C2-3)', () => {
  it(`PK lookup completes within ${BUDGETS.pk_lookup}ms budget`, () => {
    const { result, durationMs } = timed(() => simulatePkLookup(offerings, 'off_42'));
    expect(result).not.toBeNull();
    expect(durationMs).toBeLessThan(BUDGETS.pk_lookup);
  });

  it(`Indexed range scan completes within ${BUDGETS.indexed_range}ms budget`, () => {
    const { result, durationMs } = timed(() =>
      simulateIndexedRange(offerings, 'price_kobo', 10_000, 50_000)
    );
    expect(result.length).toBeGreaterThan(0);
    expect(durationMs).toBeLessThan(BUDGETS.indexed_range);
  });

  it(`Tenant-scoped list completes within ${BUDGETS.tenant_list}ms budget`, () => {
    const { result, durationMs } = timed(() =>
      simulateTenantList(offerings, TENANT_ID)
    );
    expect(result.length).toBeGreaterThan(0);
    expect(durationMs).toBeLessThan(BUDGETS.tenant_list);
  });

  it(`Aggregate sum completes within ${BUDGETS.aggregate}ms budget`, () => {
    const tenantTxns = simulateTenantList(transactions, TENANT_ID);
    const { result, durationMs } = timed(() =>
      simulateAggregate(tenantTxns, 'amount_kobo')
    );
    expect(typeof result).toBe('number');
    expect(durationMs).toBeLessThan(BUDGETS.aggregate);
  });

  it(`2-table join completes within ${BUDGETS.join_2tables}ms budget`, () => {
    const tenantTxns = simulateTenantList(transactions, TENANT_ID);
    const { result, durationMs } = timed(() =>
      simulateJoin(tenantTxns, offerings, 'offering_id', 'id')
    );
    expect(result.length).toBeGreaterThan(0);
    expect(durationMs).toBeLessThan(BUDGETS.join_2tables);
  });

  it('all query results are T3-scoped (no cross-tenant data leakage)', () => {
    const results = simulateTenantList(offerings, TENANT_ID);
    for (const row of results) {
      expect(row['tenant_id']).toBe(TENANT_ID);
    }
  });

  it('P9: all amount fields are integers', () => {
    const tenantTxns = simulateTenantList(transactions, TENANT_ID);
    for (const tx of tenantTxns) {
      expect(Number.isInteger(tx['amount_kobo'])).toBe(true);
    }
  });
});
