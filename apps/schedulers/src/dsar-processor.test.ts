/**
 * Unit tests — DsarProcessorService (COMP-002 / Task #5)
 *
 * Verifies:
 *  - compileDsarExport issues T3-scoped queries for all 8 data categories
 *  - storeExport writes to R2 and returns correct key + expiry
 *  - storeExport retries once on R2 failure
 *  - DsarProcessorService.processNextBatch increments retry_count on failure
 *  - Marks permanently_failed after 3rd failure (retry_count >= 3)
 *  - Happy path marks status = 'completed' with export_key
 */

import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { compileDsarExport, storeExport, DsarProcessorService } from './dsar-processor.js';
import type { DsarExportPayload, DsarEnv } from './dsar-processor.js';

// ---------------------------------------------------------------------------
// D1 mock builder
// ---------------------------------------------------------------------------

type BindResult = {
  run: MockedFunction<() => Promise<{ success: boolean }>>;
  first: MockedFunction<<T>() => Promise<T | null>>;
  all: MockedFunction<<T>() => Promise<{ results: T[] }>>;
};

function makeBindResult(overrides: Partial<BindResult> = {}): BindResult {
  return {
    run:   overrides.run   ?? vi.fn().mockResolvedValue({ success: true }),
    first: overrides.first ?? vi.fn().mockResolvedValue(null),
    all:   overrides.all   ?? vi.fn().mockResolvedValue({ results: [] }),
  };
}

function makeD1(bindResult?: Partial<BindResult>) {
  const br = makeBindResult(bindResult);
  const bind = vi.fn(() => br);
  const prepare = vi.fn(() => ({ bind }));
  return { db: { prepare } as unknown as Parameters<typeof compileDsarExport>[0], bind, prepare, br };
}

// ---------------------------------------------------------------------------
// R2 mock builder
// ---------------------------------------------------------------------------

function makeR2(putImpl?: () => Promise<void>) {
  const put  = vi.fn(putImpl ?? (() => Promise.resolve()));
  const get  = vi.fn().mockResolvedValue(null);
  return { bucket: { put, get }, put, get };
}

// ---------------------------------------------------------------------------
// compileDsarExport — T3 query verification
// ---------------------------------------------------------------------------

describe('compileDsarExport', () => {
  it('issues queries for all 8 data categories', async () => {
    const { db, bind } = makeD1();
    await compileDsarExport(db, 'user-1', 'tenant-1', 'req-1');

    // 8 parallel queries → prepare called 8 times, bind called with user_id+tenant_id each time
    expect(bind.mock.calls.length).toBeGreaterThanOrEqual(8);
  });

  it('always binds user_id and tenant_id (T3)', async () => {
    const { db, bind } = makeD1();
    await compileDsarExport(db, 'u-42', 't-99', 'r-1');

    for (const call of bind.mock.calls) {
      const args = call as unknown[];
      // Every bind call must include the user_id 'u-42' AND tenant_id 't-99'
      expect(args).toContain('u-42');
      expect(args).toContain('t-99');
    }
  });

  it('excludes current request from dsar_history query', async () => {
    const { db, bind } = makeD1();
    await compileDsarExport(db, 'u-1', 't-1', 'current-req-id');

    const allArgs = bind.mock.calls.flat();
    const historyCallHasRequestId = bind.mock.calls.some(
      call => (call as unknown[]).includes('current-req-id'),
    );
    expect(historyCallHasRequestId).toBe(true);
    void allArgs;
  });

  it('returns a DsarExportPayload with correct shape', async () => {
    const identityRow = { id: 'u-1', email: 'test@test.com', full_name: 'Amara' };
    const { db } = makeD1({
      first: vi.fn().mockResolvedValue(identityRow),
      all:   vi.fn().mockResolvedValue({ results: [{ id: 'c-1' }] }),
    });

    const payload = await compileDsarExport(db, 'u-1', 't-1', 'r-1');

    expect(payload.user_id).toBe('u-1');
    expect(payload.tenant_id).toBe('t-1');
    expect(payload.request_id).toBe('r-1');
    expect(payload.exported_at).toBeTruthy();
    expect(Array.isArray(payload.consent)).toBe(true);
    expect(Array.isArray(payload.ai_usage)).toBe(true);
    expect(Array.isArray(payload.ai_spend)).toBe(true);
    expect(Array.isArray(payload.wallet)).toBe(true);
    expect(Array.isArray(payload.notifications)).toBe(true);
    expect(Array.isArray(payload.sessions)).toBe(true);
    expect(Array.isArray(payload.dsar_history)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// storeExport
// ---------------------------------------------------------------------------

describe('storeExport', () => {
  const samplePayload: DsarExportPayload = {
    exported_at: new Date().toISOString(),
    request_id: 'req-1',
    user_id: 'u-1',
    tenant_id: 't-abc',
    identity: null,
    consent: [],
    ai_usage: [],
    ai_spend: [],
    wallet: [],
    notifications: [],
    sessions: [],
    dsar_history: [],
  };

  it('writes to R2 under dsar/{tenant_id}/{request_id}.json', async () => {
    const { bucket, put } = makeR2();
    await storeExport(bucket, 't-abc', 'req-1', samplePayload);

    expect(put).toHaveBeenCalledOnce();
    const [key, body] = put.mock.calls[0] as unknown as [string, string, unknown];
    expect(key).toBe('dsar/t-abc/req-1.json');
    expect(typeof body).toBe('string');
    expect(JSON.parse(body).request_id).toBe('req-1');
  });

  it('returns correct exportKey and 7-day expiresAt', async () => {
    const { bucket } = makeR2();
    const before = Math.floor(Date.now() / 1000);
    const { exportKey, expiresAt } = await storeExport(bucket, 't-abc', 'req-1', samplePayload);
    const after = Math.floor(Date.now() / 1000);

    expect(exportKey).toBe('dsar/t-abc/req-1.json');
    expect(expiresAt).toBeGreaterThanOrEqual(before + 7 * 24 * 3600);
    expect(expiresAt).toBeLessThanOrEqual(after  + 7 * 24 * 3600);
  });

  it('retries once on R2 PUT error then succeeds', async () => {
    let calls = 0;
    const { bucket, put } = makeR2(async () => {
      calls++;
      if (calls === 1) throw new Error('R2 transient error');
    });
    await storeExport(bucket, 't-1', 'req-2', samplePayload);
    expect(put).toHaveBeenCalledTimes(2);
  });

  it('throws after both R2 PUT attempts fail', async () => {
    const { bucket } = makeR2(() => { throw new Error('R2 down'); });
    await expect(storeExport(bucket, 't-1', 'req-3', samplePayload)).rejects.toThrow('R2 down');
  });
});

// ---------------------------------------------------------------------------
// DsarProcessorService — retry logic
// ---------------------------------------------------------------------------

describe('DsarProcessorService', () => {
  let svc: DsarProcessorService;

  beforeEach(() => { svc = new DsarProcessorService(); });

  function makePendingEnv(rows: Array<{ id: string; user_id: string; tenant_id: string; retry_count: number }>) {
    const updateBind = vi.fn(() => ({ run: vi.fn().mockResolvedValue({ success: true }) }));
    const firstBind  = vi.fn(() => ({ first: vi.fn().mockResolvedValue(null), run: vi.fn().mockResolvedValue({ success: true }), all: vi.fn().mockResolvedValue({ results: [] }) }));
    const allBind    = vi.fn(() => ({ all: vi.fn().mockResolvedValue({ results: rows }), run: vi.fn().mockResolvedValue({ success: true }), first: vi.fn().mockResolvedValue(null) }));

    let callCount = 0;
    const prepare = vi.fn((_sql: string) => ({
      bind: (..._args: unknown[]) => {
        callCount++;
        if (callCount === 1) return allBind();
        if ((_sql as string).includes('UPDATE')) return updateBind();
        return firstBind();
      },
    }));

    const bucket = makeR2().bucket;
    const env: DsarEnv = { DB: { prepare } as unknown as DsarEnv['DB'], DSAR_BUCKET: bucket };
    return { env, prepare, updateBind, bucket };
  }

  it('processes no rows when queue is empty', async () => {
    const { env, prepare } = makePendingEnv([]);
    await svc.processNextBatch(env, 10);
    expect(prepare).toHaveBeenCalledTimes(1); // Only the SELECT query
  });

  it('happy path: marks completed and stores export_key', async () => {
    const row = { id: 'r-1', user_id: 'u-1', tenant_id: 't-1', retry_count: 0 };
    const updates: string[] = [];

    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: (..._args: unknown[]) => ({
          run:   vi.fn().mockImplementation(() => { updates.push(sql); return Promise.resolve({ success: true }); }),
          first: vi.fn().mockResolvedValue(null),
          all:   vi.fn().mockResolvedValue({ results: sql.includes('status') && sql.includes('pending') ? [row] : [] }),
        }),
      })),
    };

    const bucket = makeR2().bucket;
    await svc.processNextBatch({ DB: db as unknown as DsarEnv['DB'], DSAR_BUCKET: bucket }, 10);

    const completedUpdate = updates.find(s => s.includes("'completed'"));
    expect(completedUpdate).toBeTruthy();
    expect(bucket.put).toHaveBeenCalled();
  });

  it('increments retry_count on failure and keeps status pending', async () => {
    const row = { id: 'r-fail', user_id: 'u-1', tenant_id: 't-1', retry_count: 0 };
    const updatedStatuses: string[] = [];
    const updatedRetryCounts: number[] = [];

    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: (...args: unknown[]) => ({
          run: vi.fn().mockImplementation(() => {
            if (sql.includes('retry_count')) {
              updatedStatuses.push(args[0] as string);
              updatedRetryCounts.push(args[1] as number);
            }
            return Promise.resolve({ success: true });
          }),
          first: vi.fn().mockResolvedValue(null),
          all: vi.fn().mockResolvedValue({
            results: sql.includes('retry_count < 3') ? [row] : [],
          }),
        }),
      })),
    };

    const bucket = { put: vi.fn().mockRejectedValue(new Error('R2 fail')), get: vi.fn() };
    await svc.processNextBatch({ DB: db as unknown as DsarEnv['DB'], DSAR_BUCKET: bucket }, 10);

    expect(updatedRetryCounts).toContain(1);
    expect(updatedStatuses).toContain('pending');
  });

  it('marks permanently_failed after retry_count reaches 3', async () => {
    const row = { id: 'r-perm', user_id: 'u-1', tenant_id: 't-1', retry_count: 2 };
    const updatedStatuses: string[] = [];

    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: (...args: unknown[]) => ({
          run: vi.fn().mockImplementation(() => {
            if (sql.includes('retry_count')) {
              updatedStatuses.push(args[0] as string);
            }
            return Promise.resolve({ success: true });
          }),
          first: vi.fn().mockResolvedValue(null),
          all: vi.fn().mockResolvedValue({
            results: sql.includes('retry_count < 3') ? [row] : [],
          }),
        }),
      })),
    };

    const bucket = { put: vi.fn().mockRejectedValue(new Error('R2 permanently down')), get: vi.fn() };
    await svc.processNextBatch({ DB: db as unknown as DsarEnv['DB'], DSAR_BUCKET: bucket }, 10);

    expect(updatedStatuses).toContain('permanently_failed');
    expect(updatedStatuses).not.toContain('pending');
  });
});
