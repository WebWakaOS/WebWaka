/**
 * Tests for db-perf.ts (L-8) — Database Query Performance Wrapper
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { instrumentedQuery, instrumentedBatch } from './db-perf.js';

// ── Mock D1Database ───────────────────────────────────────────────────────────

function makeD1Mock(results: unknown[], delayMs = 0) {
  const stmt = {
    bind: vi.fn().mockReturnThis(),
    all: vi.fn().mockImplementation(async () => {
      if (delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
      return { results };
    }),
  };
  return {
    prepare: vi.fn().mockReturnValue(stmt),
    batch: vi.fn().mockImplementation(async () => {
      if (delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
      return [];
    }),
  } as unknown as D1Database;
}

// ── instrumentedQuery ─────────────────────────────────────────────────────────

describe('instrumentedQuery', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns results and metrics for a fast query', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    const db = makeD1Mock(rows, 0);

    const { results, metrics } = await instrumentedQuery<{ id: number }>(
      db,
      'SELECT id FROM tenants WHERE status = ?',
      ['active'],
    );

    expect(results).toEqual(rows);
    expect(metrics.rowCount).toBe(2);
    expect(metrics.slow).toBe(false);
    expect(metrics.query).toContain('SELECT id FROM tenants');
    expect(metrics.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('marks query as slow when duration exceeds 100ms', async () => {
    const db = makeD1Mock([{ id: 1 }], 110);

    const { metrics } = await instrumentedQuery(db, 'SELECT * FROM wards', []);

    expect(metrics.slow).toBe(true);
    expect(metrics.durationMs).toBeGreaterThanOrEqual(100);
  });

  it('logs a structured warning for slow queries', async () => {
    const db = makeD1Mock([{ id: 1 }], 110);
    const warnSpy = vi.spyOn(console, 'warn');

    await instrumentedQuery(db, 'SELECT * FROM wards', [], {
      requestId: 'req-abc',
      tenantId: 'tenant-xyz',
    });

    expect(warnSpy).toHaveBeenCalledOnce();
    const logged = JSON.parse((warnSpy.mock.calls[0]![0] as string));
    expect(logged.event).toBe('slow_query');
    expect(logged.request_id).toBe('req-abc');
    expect(logged.tenant_id).toBe('tenant-xyz');
    expect(logged.param_count).toBe(0);
  });

  it('does NOT log for fast queries', async () => {
    const db = makeD1Mock([{ id: 1 }], 0);
    const warnSpy = vi.spyOn(console, 'warn');

    await instrumentedQuery(db, 'SELECT id FROM workspaces WHERE id = ?', ['w-1']);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('truncates queries longer than 200 chars', async () => {
    const longQuery = 'SELECT ' + 'col, '.repeat(60) + 'id FROM t';
    const db = makeD1Mock([], 0);

    const { metrics } = await instrumentedQuery(db, longQuery, []);

    expect(metrics.query.length).toBeLessThanOrEqual(200);
    expect(metrics.query).toMatch(/\.\.\.$/);
  });

  it('handles queries with no params', async () => {
    const db = makeD1Mock([{ count: 5 }], 0);
    const _stmt = (db as unknown as { prepare: { mock: { results: Array<{ value: unknown }> } } }).prepare.mock.results[0]?.value;

    const { results } = await instrumentedQuery(db, 'SELECT count(*) as count FROM places', []);

    expect(results).toHaveLength(1);
    expect((results[0] as Record<string, number>).count).toBe(5);
  });

  it('records correct rowCount for empty results', async () => {
    const db = makeD1Mock([], 0);

    const { metrics } = await instrumentedQuery(db, 'SELECT * FROM tokens WHERE id = ?', ['x']);

    expect(metrics.rowCount).toBe(0);
    expect(metrics.slow).toBe(false);
  });
});

// ── instrumentedBatch ─────────────────────────────────────────────────────────

describe('instrumentedBatch', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns durationMs for a fast batch', async () => {
    const db = makeD1Mock([], 0);
    const stmts = [{} as D1PreparedStatement, {} as D1PreparedStatement];

    const { durationMs } = await instrumentedBatch(db, stmts);

    expect(durationMs).toBeGreaterThanOrEqual(0);
  });

  it('logs slow_batch warning when batch takes >200ms', async () => {
    const db = makeD1Mock([], 210);
    const warnSpy = vi.spyOn(console, 'warn');

    await instrumentedBatch(db, [{} as D1PreparedStatement], {
      requestId: 'req-batch',
      tenantId: 'tenant-b',
    });

    expect(warnSpy).toHaveBeenCalledOnce();
    const logged = JSON.parse((warnSpy.mock.calls[0]![0] as string));
    expect(logged.event).toBe('slow_batch');
    expect(logged.statementCount).toBe(1);
    expect(logged.request_id).toBe('req-batch');
  });

  it('does NOT warn for fast batches', async () => {
    const db = makeD1Mock([], 0);
    const warnSpy = vi.spyOn(console, 'warn');

    await instrumentedBatch(db, [{} as D1PreparedStatement]);

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
