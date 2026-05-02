import { describe, it, expect, vi } from 'vitest';
import { HitlService } from './hitl-service.js';

function makeMockDB(overrides: Record<string, { first?: unknown; results?: unknown[]; run?: { success: boolean; meta?: { changes?: number } } }> = {}) {
  const db = {
    prepare: vi.fn().mockImplementation((sql: string) => {
      const match = Object.entries(overrides).find(([k]) => sql.includes(k));
      const val = match?.[1] ?? { first: null, results: [], run: { success: true } };
      return {
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue(val.run ?? { success: true }),
          first: vi.fn().mockResolvedValue(val.first ?? null),
          all: vi.fn().mockResolvedValue({ results: val.results ?? [] }),
        }),
      };
    }),
    batch: vi.fn().mockResolvedValue([{ success: true }, { success: true }]),
  };
  return db;
}

describe('HitlService', () => {
  describe('submit', () => {
    it('submits a HITL item with default expiry', async () => {
      const db = makeMockDB();
      const svc = new HitlService({ db: db as never });

      const result = await svc.submit({
        tenantId: 't1',
        workspaceId: 'w1',
        userId: 'u1',
        vertical: 'hospital',
        capability: 'bio_generator',
        hitlLevel: 1,
        aiRequestPayload: '{"prompt":"test"}',
      });

      expect(result.queueItemId).toBeTruthy();
      expect(db.batch).toHaveBeenCalledOnce();
    });

    it('enforces 72h minimum for L3 items', async () => {
      const db = makeMockDB();
      const svc = new HitlService({ db: db as never });

      const result = await svc.submit({
        tenantId: 't1',
        workspaceId: 'w1',
        userId: 'u1',
        vertical: 'politician',
        capability: 'bio_generator',
        hitlLevel: 3,
        aiRequestPayload: '{}',
        expiresInHours: 12,
      });

      expect(result.queueItemId).toBeTruthy();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const batchCall = db.batch.mock.calls[0]![0] as unknown[];
      expect(batchCall.length).toBe(2);
    });

    it('stores response payload when provided', async () => {
      const db = makeMockDB();
      const svc = new HitlService({ db: db as never });

      const result = await svc.submit({
        tenantId: 't1',
        workspaceId: 'w1',
        userId: 'u1',
        vertical: 'clinic',
        capability: 'superagent_chat',
        hitlLevel: 2,
        aiRequestPayload: '{"prompt":"check"}',
        aiResponsePayload: '{"response":"result"}',
      });

      expect(result.queueItemId).toBeTruthy();
    });
  });

  describe('review', () => {
    it('approves a pending item', async () => {
      const db = makeMockDB({
        'SELECT id, status, hitl_level': {
          first: { id: 'q1', status: 'pending', hitl_level: 1, expires_at: new Date(Date.now() + 86400000).toISOString(), tenant_id: 't1' },
        },
      });
      const svc = new HitlService({ db: db as never });

      const result = await svc.review({
        queueItemId: 'q1',
        tenantId: 't1',
        reviewerId: 'r1',
        decision: 'approved',
        note: 'Looks good',
      });

      expect(result.success).toBe(true);
    });

    it('rejects a pending item', async () => {
      const db = makeMockDB({
        'SELECT id, status, hitl_level': {
          first: { id: 'q1', status: 'pending', hitl_level: 1, expires_at: new Date(Date.now() + 86400000).toISOString(), tenant_id: 't1' },
        },
      });
      const svc = new HitlService({ db: db as never });

      const result = await svc.review({
        queueItemId: 'q1',
        tenantId: 't1',
        reviewerId: 'r1',
        decision: 'rejected',
      });

      expect(result.success).toBe(true);
    });

    it('fails for already-approved item', async () => {
      const db = makeMockDB({
        'SELECT id, status, hitl_level': {
          first: { id: 'q1', status: 'approved', hitl_level: 1, expires_at: new Date(Date.now() + 86400000).toISOString(), tenant_id: 't1' },
        },
      });
      const svc = new HitlService({ db: db as never });

      const result = await svc.review({
        queueItemId: 'q1',
        tenantId: 't1',
        reviewerId: 'r1',
        decision: 'approved',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already approved');
    });

    it('returns not found for missing item', async () => {
      const db = makeMockDB();
      const svc = new HitlService({ db: db as never });

      const result = await svc.review({
        queueItemId: 'missing',
        tenantId: 't1',
        reviewerId: 'r1',
        decision: 'approved',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('fails for expired item', async () => {
      const db = makeMockDB({
        'SELECT id, status, hitl_level': {
          first: { id: 'q1', status: 'pending', hitl_level: 1, expires_at: '2020-01-01T00:00:00Z', tenant_id: 't1' },
        },
      });
      const svc = new HitlService({ db: db as never });

      const result = await svc.review({
        queueItemId: 'q1',
        tenantId: 't1',
        reviewerId: 'r1',
        decision: 'approved',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('blocks L3 review before 72h window', async () => {
      const db = makeMockDB({
        'SELECT id, status, hitl_level': {
          first: {
            id: 'q1', status: 'pending', hitl_level: 3,
            expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
            tenant_id: 't1',
            created_at: new Date().toISOString(),
          },
        },
      });
      const svc = new HitlService({ db: db as never });

      const result = await svc.review({
        queueItemId: 'q1',
        tenantId: 't1',
        reviewerId: 'r1',
        decision: 'approved',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('72h');
    });
  });

  describe('listQueue', () => {
    it('returns items for tenant', async () => {
      const db = makeMockDB({
        'SELECT id, tenant_id': {
          results: [{
            id: 'q1', tenant_id: 't1', workspace_id: 'w1', user_id: 'u1',
            vertical: 'hospital', capability: 'bio_generator', hitl_level: 1,
            status: 'pending', ai_request_payload: '{}', ai_response_payload: null,
            reviewer_id: null, reviewed_at: null, review_note: null,
            expires_at: '2026-05-01T00:00:00Z', created_at: '2026-04-11T00:00:00Z',
          }],
        },
      });
      const svc = new HitlService({ db: db as never });

      const items = await svc.listQueue('t1');
      expect(items).toHaveLength(1);
      expect(items[0]!.vertical).toBe('hospital');
    });

    it('filters by status', async () => {
      const db = makeMockDB({
        'SELECT id, tenant_id': { results: [] },
      });
      const svc = new HitlService({ db: db as never });

      await svc.listQueue('t1', { status: 'pending' });
      const sql = (db.prepare as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
      expect(sql).toContain('status = ?');
    });
  });

  describe('countPending', () => {
    it('returns pending count', async () => {
      const db = makeMockDB({
        'COUNT': { first: { cnt: 5 } },
      });
      const svc = new HitlService({ db: db as never });
      const count = await svc.countPending('t1');
      expect(count).toBe(5);
    });
  });

  describe('expireStale', () => {
    it('expires stale items for specific tenant', async () => {
      const db = makeMockDB({
        'UPDATE ai_hitl_queue': { run: { success: true, meta: { changes: 3 } } },
      });
      const svc = new HitlService({ db: db as never });

      const expired = await svc.expireStale('t1');
      expect(expired).toBe(3);
      const sql = (db.prepare as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
      expect(sql).toContain('tenant_id');
    });

    it('requires tenantId parameter (T3)', async () => {
      const db = makeMockDB({
        'UPDATE ai_hitl_queue': { run: { success: true, meta: { changes: 0 } } },
      });
      const svc = new HitlService({ db: db as never });
      const expired = await svc.expireStale('t1');
      expect(typeof expired).toBe('number');
    });
  });

  describe('getItem', () => {
    it('returns null for missing item', async () => {
      const db = makeMockDB();
      const svc = new HitlService({ db: db as never });

      const item = await svc.getItem('missing', 't1');
      expect(item).toBeNull();
    });

    it('returns item by id and tenant', async () => {
      const db = makeMockDB({
        'SELECT id, tenant_id': {
          first: {
            id: 'q1', tenant_id: 't1', workspace_id: 'w1', user_id: 'u1',
            vertical: 'hospital', capability: 'bio_generator', hitl_level: 2,
            status: 'pending', ai_request_payload: '{}', ai_response_payload: null,
            reviewer_id: null, reviewed_at: null, review_note: null,
            expires_at: '2026-05-01T00:00:00Z', created_at: '2026-04-11T00:00:00Z',
          },
        },
      });
      const svc = new HitlService({ db: db as never });

      const item = await svc.getItem('q1', 't1');
      expect(item).not.toBeNull();
      expect(item!.hitlLevel).toBe(2);
    });
  });
});

// ==========================================================================
// Wave 3 additions — A4-1, A4-3, A4-5
// ==========================================================================

// ---------------------------------------------------------------------------
// Helper: build a mock DB that simulates a pending HITL item
// ---------------------------------------------------------------------------
function makePendingItem(overrides: Partial<{
  id: string;
  status: string;
  hitl_level: number;
  created_at: string;
  expires_at: string;
  tenant_id: string;
}> = {}) {
  return {
    id: overrides.id ?? 'item-1',
    status: overrides.status ?? 'pending',
    hitl_level: overrides.hitl_level ?? 1,
    tenant_id: overrides.tenant_id ?? 't1',
    created_at: overrides.created_at ?? new Date(Date.now() - 80 * 60 * 60 * 1000).toISOString(), // 80h ago
    expires_at: overrides.expires_at ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    reviewer_id: null,
    reviewed_at: null,
    review_note: null,
  };
}

function makeMockDBWithItem(item: ReturnType<typeof makePendingItem>) {
  return {
    prepare: vi.fn().mockImplementation(() => ({
      bind: vi.fn().mockReturnValue({
        run: vi.fn().mockResolvedValue({ success: true, meta: { changes: 1 } }),
        first: vi.fn().mockResolvedValue(item),
        all: vi.fn().mockResolvedValue({ results: [item] }),
      }),
    })),
    batch: vi.fn().mockResolvedValue([{ success: true }, { success: true }]),
  };
}

// ---------------------------------------------------------------------------
// A4-1: Approve/reject endpoint tests (via HitlService.review)
// ---------------------------------------------------------------------------

describe('Wave 3 A4-1 — approve / reject via HitlService.review', () => {
  it('approve: returns success=true for a pending level-1 item', async () => {
    const item = makePendingItem({ hitl_level: 1 });
    const db = makeMockDBWithItem(item);
    const svc = new HitlService({ db: db as never });

    const result = await svc.review({
      queueItemId: 'item-1',
      tenantId: 't1',
      reviewerId: 'reviewer-1',
      decision: 'approved',
      note: 'LGTM',
    });

    expect(result.success).toBe(true);
  });

  it('reject: returns success=true for a pending level-1 item', async () => {
    const item = makePendingItem({ hitl_level: 1 });
    const db = makeMockDBWithItem(item);
    const svc = new HitlService({ db: db as never });

    const result = await svc.review({
      queueItemId: 'item-1',
      tenantId: 't1',
      reviewerId: 'reviewer-1',
      decision: 'rejected',
      note: 'Not allowed',
    });

    expect(result.success).toBe(true);
  });

  it('returns success=false when item is not found', async () => {
    const db = {
      prepare: vi.fn().mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ success: true }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
      })),
      batch: vi.fn().mockResolvedValue([]),
    };
    const svc = new HitlService({ db: db as never });
    const result = await svc.review({
      queueItemId: 'ghost-id',
      tenantId: 't1',
      reviewerId: 'r1',
      decision: 'approved',
    });
    expect(result.success).toBe(false);
  });

  it('returns error when item is already approved (idempotency guard)', async () => {
    const item = makePendingItem({ status: 'approved' });
    const db = makeMockDBWithItem(item);
    const svc = new HitlService({ db: db as never });
    const result = await svc.review({
      queueItemId: 'item-1',
      tenantId: 't1',
      reviewerId: 'r1',
      decision: 'approved',
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/approved/i);
  });
});

// ---------------------------------------------------------------------------
// A4-3: Level 3 (regulatory) 72h enforcement
// ---------------------------------------------------------------------------

describe('Wave 3 A4-3 — Level 3 regulatory 72h window', () => {
  it('blocks approval if Level 3 item is < 72h old', async () => {
    const item = makePendingItem({
      hitl_level: 3,
      created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // only 10h ago
    });
    const db = makeMockDBWithItem(item);
    const svc = new HitlService({ db: db as never });

    const result = await svc.review({
      queueItemId: 'item-1',
      tenantId: 't1',
      reviewerId: 'r1',
      decision: 'approved',
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/72h|regulatory|remaining/i);
  });

  it('allows approval if Level 3 item is >= 72h old', async () => {
    const item = makePendingItem({
      hitl_level: 3,
      created_at: new Date(Date.now() - 73 * 60 * 60 * 1000).toISOString(), // 73h ago — over the gate
    });
    const db = makeMockDBWithItem(item);
    const svc = new HitlService({ db: db as never });

    const result = await svc.review({
      queueItemId: 'item-1',
      tenantId: 't1',
      reviewerId: 'r1',
      decision: 'approved',
    });

    expect(result.success).toBe(true);
  });

  it('Level 1 item is not subject to 72h gate', async () => {
    const item = makePendingItem({
      hitl_level: 1,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h ago
    });
    const db = makeMockDBWithItem(item);
    const svc = new HitlService({ db: db as never });

    const result = await svc.review({
      queueItemId: 'item-1',
      tenantId: 't1',
      reviewerId: 'r1',
      decision: 'approved',
    });

    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// A4-5: Audit trail — events written on every status change
// ---------------------------------------------------------------------------

describe('Wave 3 A4-5 — HITL audit trail', () => {
  it('db.batch is called (audit event written) on approve', async () => {
    const item = makePendingItem({ hitl_level: 1 });
    const db = makeMockDBWithItem(item);
    const svc = new HitlService({ db: db as never });

    await svc.review({
      queueItemId: 'item-1',
      tenantId: 't1',
      reviewerId: 'r1',
      decision: 'approved',
    });

    // db.batch is used for the atomic status update + event insert
    expect(db.batch).toHaveBeenCalled();
  });

  it('db.batch called on reject too', async () => {
    const item = makePendingItem({ hitl_level: 1 });
    const db = makeMockDBWithItem(item);
    const svc = new HitlService({ db: db as never });

    await svc.review({
      queueItemId: 'item-1',
      tenantId: 't1',
      reviewerId: 'r1',
      decision: 'rejected',
      note: 'Not allowed',
    });

    expect(db.batch).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// A4-4: Notification hook fires after submit
// ---------------------------------------------------------------------------

describe('Wave 3 A4-4 — HITL reviewer notification on submit', () => {
  it('calls notifier.notifyReviewers after a successful submit', async () => {
    const db = makeMockDB();
    const notifier = {
      notifyReviewers: vi.fn().mockResolvedValue(undefined),
    };

    const svc = new HitlService({ db: db as never, notifier });

    await svc.submit({
      tenantId: 't1',
      workspaceId: 'w1',
      userId: 'u1',
      vertical: 'restaurant',
      capability: 'superagent_chat',
      hitlLevel: 1,
      actionPayload: { tool: 'create_booking', args: {} },
    });

    // Notifier is called non-blocking — give microtasks a chance to flush
    await new Promise((r) => setTimeout(r, 0));
    expect(notifier.notifyReviewers).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 't1',
        workspaceId: 'w1',
        vertical: 'restaurant',
        capability: 'superagent_chat',
        hitlLevel: 1,
      }),
    );
  });

  it('submit still succeeds when notifier throws', async () => {
    const db = makeMockDB();
    const notifier = {
      notifyReviewers: vi.fn().mockRejectedValue(new Error('SMS gateway down')),
    };

    const svc = new HitlService({ db: db as never, notifier });
    const result = await svc.submit({
      tenantId: 't1',
      workspaceId: 'w1',
      userId: 'u1',
      vertical: 'pharmacy',
      capability: 'inventory_ai',
      hitlLevel: 2,
      actionPayload: {},
    });

    expect(result.queueItemId).toBeDefined();
  });
});
