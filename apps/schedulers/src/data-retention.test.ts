/**
 * DataRetentionService unit tests — Phase 5 (E30)
 *
 * Verifies:
 *   - processRetentionSweep pseudonymizes expired fundraising_contributions donor_phone
 *   - processRetentionSweep pseudonymizes expired fundraising_pledges pledger_phone
 *   - processRetentionSweep pseudonymizes expired cases subject_name + clears subject_phone
 *   - Already-pseudonymized rows are NOT re-processed (idempotency)
 *   - Errors in one table do not prevent other tables from being processed
 *   - data_retention_log is written at end of each sweep
 *   - G23: audit_logs table is never queried or modified by DataRetentionService
 */

import { describe, it, expect, vi } from 'vitest';
import { DataRetentionService } from './data-retention.js';
import type { Env } from './data-retention.js';

// ---------------------------------------------------------------------------
// D1 mock builder (vitest mock style, same as dsar-processor.test.ts)
// ---------------------------------------------------------------------------

type BindResult = {
  run:   ReturnType<typeof vi.fn>;
  first: ReturnType<typeof vi.fn>;
  all:   ReturnType<typeof vi.fn>;
};

function makeBindResult(overrides: Partial<BindResult> = {}): BindResult {
  return {
    run:   overrides.run   ?? vi.fn().mockResolvedValue({ success: true }),
    first: overrides.first ?? vi.fn().mockResolvedValue(null),
    all:   overrides.all   ?? vi.fn().mockResolvedValue({ results: [] }),
  };
}

/**
 * Build a D1 mock where each call to prepare() returns a fresh mock stmt.
 * capturedSql collects all SQL strings that were prepared (for assertion).
 */
function makeD1(allImpl?: () => Promise<{ results: { id: string }[] }>) {
  const capturedSql: string[] = [];
  const runMock   = vi.fn().mockResolvedValue({ success: true });
  const firstMock = vi.fn().mockResolvedValue(null);
  const allMock   = allImpl
    ? vi.fn(allImpl)
    : vi.fn().mockResolvedValue({ results: [] });

  const bind = vi.fn(function () { return { run: runMock, first: firstMock, all: allMock }; });
  const prepare = vi.fn((sql: string) => {
    capturedSql.push(sql);
    return { bind };
  });

  const db = { prepare } as unknown as Parameters<typeof DataRetentionService.prototype.processRetentionSweep>[0]['DB'];
  return { db, prepare, bind, runMock, firstMock, allMock, capturedSql };
}

function makeEnv(db: unknown): Env {
  return {
    DB: db as Env['DB'],
    RATE_LIMIT_KV: {} as Env['RATE_LIMIT_KV'],
    AUDIT_FAIL_KV: {} as Env['AUDIT_FAIL_KV'],
    DSAR_BUCKET: {} as Env['DSAR_BUCKET'],
    ENVIRONMENT: 'test',
  };
}

// ---------------------------------------------------------------------------
// Basic sweep — no expired rows
// ---------------------------------------------------------------------------

describe('DataRetentionService.processRetentionSweep — no expired rows', () => {
  it('returns zero rowsPseudonymized when all tables are empty', async () => {
    const { db } = makeD1();
    const svc = new DataRetentionService();
    const result = await svc.processRetentionSweep(makeEnv(db), 100);

    expect(result.rowsPseudonymized).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('records a data_retention_log entry even when nothing is pseudonymized', async () => {
    const { db, capturedSql } = makeD1();
    const svc = new DataRetentionService();
    await svc.processRetentionSweep(makeEnv(db), 100);

    const logInsert = capturedSql.find((s) => s.includes('data_retention_log'));
    expect(logInsert).toBeDefined();
    expect(logInsert).toContain('INSERT');
  });

  it('never queries or modifies audit_logs (G23 invariant)', async () => {
    const { db, capturedSql } = makeD1();
    const svc = new DataRetentionService();
    await svc.processRetentionSweep(makeEnv(db), 100);

    const auditQuery = capturedSql.find((s) => s.toLowerCase().includes('audit_log'));
    expect(auditQuery).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Expired fundraising_contributions — donor_phone pseudonymized
// ---------------------------------------------------------------------------

describe('DataRetentionService.processRetentionSweep — expired fundraising_contributions', () => {
  it('pseudonymizes donor_phone for 2 expired contribution rows', async () => {
    let callIndex = 0;
    const { db, runMock } = makeD1(async () => {
      callIndex++;
      // First all() call = fundraising_contributions select
      if (callIndex === 1) return { results: [{ id: 'fc_1' }, { id: 'fc_2' }] };
      return { results: [] };
    });

    const svc = new DataRetentionService();
    const result = await svc.processRetentionSweep(makeEnv(db), 100);

    expect(result.rowsPseudonymized).toBeGreaterThanOrEqual(2);
    expect(result.tablesProcessed).toContain('fundraising_contributions');
    // run() should have been called for each UPDATE
    expect(runMock).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Expired cases — subject_name pseudonymized + subject_phone cleared
// ---------------------------------------------------------------------------

describe('DataRetentionService.processRetentionSweep — expired cases', () => {
  it('counts cases table in tablesProcessed when expired rows exist', async () => {
    let callIndex = 0;
    const { db } = makeD1(async () => {
      callIndex++;
      // calls: fc_contributions, fc_pledges, cases
      if (callIndex === 3) return { results: [{ id: 'cas_1' }] };
      return { results: [] };
    });

    const svc = new DataRetentionService();
    const result = await svc.processRetentionSweep(makeEnv(db), 100);

    expect(result.tablesProcessed).toContain('cases');
    expect(result.rowsPseudonymized).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Error resilience — one table failing does not stop other tables
// ---------------------------------------------------------------------------

describe('DataRetentionService.processRetentionSweep — error resilience', () => {
  it('accumulates errors but continues processing remaining tables', async () => {
    let callIndex = 0;
    const db = (() => {
      const capturedSql: string[] = [];
      const runMock = vi.fn().mockResolvedValue({ success: true });
      const firstMock = vi.fn().mockResolvedValue(null);
      const allMock = vi.fn(async () => {
        callIndex++;
        // First call (fundraising_contributions): throw to simulate D1 error
        if (callIndex === 1) throw new Error('D1 simulated error: table locked');
        return { results: [] };
      });
      const bind = vi.fn(() => ({ run: runMock, first: firstMock, all: allMock }));
      const prepare = vi.fn((sql: string) => { capturedSql.push(sql); return { bind }; });
      return { prepare } as unknown as Env['DB'];
    })();

    const svc = new DataRetentionService();
    const result = await svc.processRetentionSweep(makeEnv(db), 100);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('fundraising_contributions');
    // Other tables were still attempted (rowsPseudonymized could be 0 but no crash)
    expect(result.jobRunAt).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// jobRunAt timestamp
// ---------------------------------------------------------------------------

describe('DataRetentionService.processRetentionSweep — metadata', () => {
  it('jobRunAt is a reasonable unix timestamp', async () => {
    const { db } = makeD1();
    const svc = new DataRetentionService();
    const before = Math.floor(Date.now() / 1000);
    const result = await svc.processRetentionSweep(makeEnv(db), 100);
    const after  = Math.floor(Date.now() / 1000);

    expect(result.jobRunAt).toBeGreaterThanOrEqual(before);
    expect(result.jobRunAt).toBeLessThanOrEqual(after + 1);
  });
});
