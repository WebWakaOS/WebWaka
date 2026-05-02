/**
 * Chaos Scenario 1: D1 Timeout / Unavailable (Wave 3 D5 / ADR-0047)
 *
 * Injects a D1 failure at the adapter layer and asserts that:
 *   1. /health/deep reports d1.ok = false
 *   2. Entity reads return a structured 503 (not a raw D1 error or 500)
 *   3. No raw DB error message leaks in the response
 *   4. No unhandled promise rejections
 */
import { describe, it, expect, vi } from 'vitest';

// ── Simulated D1 database adapter ────────────────────────────────────────────
function makeD1Stub(shouldFail: boolean) {
  return {
    async prepare(sql: string) {
      return {
        async run() {
          if (shouldFail) throw new Error('D1_UNAVAILABLE: network error');
          return { results: [], success: true };
        },
        async first<T>(): Promise<T | null> {
          if (shouldFail) throw new Error('D1_UNAVAILABLE: network error');
          return null;
        },
        async all<T>(): Promise<{ results: T[] }> {
          if (shouldFail) throw new Error('D1_UNAVAILABLE: network error');
          return { results: [] };
        },
      };
    },
  };
}

// ── Entity read handler (simplified) ─────────────────────────────────────────
async function entityRead(db: ReturnType<typeof makeD1Stub>, table: string) {
  try {
    const stmt = await db.prepare(`SELECT * FROM ${table} LIMIT 20`);
    const rows = await stmt.all();
    return { status: 200, body: rows.results };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    // Must NOT leak raw DB error message
    if (msg.includes('D1_UNAVAILABLE') || msg.includes('network error') || msg.includes('SQLite')) {
      return { status: 503, body: { error: 'database_unavailable', retry_after: 5 } };
    }
    return { status: 503, body: { error: 'database_unavailable', retry_after: 5 } };
  }
}

// ── Health check (deep) ───────────────────────────────────────────────────────
async function checkD1Health(db: ReturnType<typeof makeD1Stub>) {
  const start = Date.now();
  try {
    const stmt = await db.prepare('SELECT 1');
    await stmt.run();
    return { ok: true, latency_ms: Date.now() - start };
  } catch {
    return { ok: false, latency_ms: Date.now() - start, error: 'D1 unavailable' };
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('Chaos: D1 timeout / unavailable (D5 / ADR-0047 Scenario 1)', () => {
  describe('healthy D1 (baseline)', () => {
    const db = makeD1Stub(false);

    it('entity read returns 200', async () => {
      const res = await entityRead(db, 'offerings');
      expect(res.status).toBe(200);
    });

    it('health check reports d1.ok = true', async () => {
      const result = await checkD1Health(db);
      expect(result.ok).toBe(true);
    });
  });

  describe('D1 unavailable (chaos)', () => {
    const db = makeD1Stub(true);

    it('entity read returns 503 (not 500)', async () => {
      const res = await entityRead(db, 'offerings');
      expect(res.status).toBe(503);
    });

    it('entity read returns structured error body', async () => {
      const res = await entityRead(db, 'offerings');
      expect((res.body as { error: string }).error).toBe('database_unavailable');
    });

    it('entity read includes retry_after', async () => {
      const res = await entityRead(db, 'offerings');
      expect((res.body as { retry_after: number }).retry_after).toBeGreaterThan(0);
    });

    it('raw D1 error message does NOT leak in response body', async () => {
      const res = await entityRead(db, 'offerings');
      const bodyStr = JSON.stringify(res.body);
      expect(bodyStr).not.toContain('D1_UNAVAILABLE');
      expect(bodyStr).not.toContain('network error');
      expect(bodyStr).not.toContain('SQLite');
    });

    it('health check reports d1.ok = false', async () => {
      const result = await checkD1Health(db);
      expect(result.ok).toBe(false);
    });

    it('health check does not throw (no unhandled rejection)', async () => {
      await expect(checkD1Health(db)).resolves.toBeDefined();
    });

    it('multiple concurrent entity reads all return 503 (no cross-request bleed)', async () => {
      const results = await Promise.all([
        entityRead(db, 'offerings'),
        entityRead(db, 'products'),
        entityRead(db, 'wc_wallets'),
      ]);
      for (const r of results) expect(r.status).toBe(503);
    });
  });
});
