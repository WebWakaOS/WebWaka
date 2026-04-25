import { describe, it, expect, vi } from 'vitest';
import { updateInventoryTool } from './update-inventory.js';
import type { ToolExecutionContext } from '../tool-registry.js';

type MockDB = {
  prepare: ReturnType<typeof vi.fn>;
  batch: ReturnType<typeof vi.fn>;
};

function makeMockDB(productRow: unknown = null, runResult = { success: true, meta: { changes: 1 } }): MockDB {
  return {
    prepare: vi.fn().mockImplementation(() => ({
      bind: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(productRow),
        run: vi.fn().mockResolvedValue(runResult),
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
    })),
    batch: vi.fn().mockResolvedValue([{ success: true }]),
  };
}

function makeCtx(db: MockDB, autonomyLevel: 1 | 2 | 3 = 3): ToolExecutionContext {
  return {
    tenantId: 'tenant-1',
    workspaceId: 'ws-1',
    userId: 'user-1',
    db: db as unknown as D1Database,
    vertical: 'pos',
    hitlService: { submit: vi.fn().mockResolvedValue({ queueItemId: 'hitl-inv-2' }) } as never,
    autonomyLevel,
  };
}

const VALID_PRODUCT = { id: 'prod-1', name: 'Bag of Rice', stock_qty: 10, active: 1 };

describe('update_inventory', () => {
  describe('happy path (autonomyLevel=3)', () => {
    it('increases stock by positive delta', async () => {
      const db = makeMockDB(VALID_PRODUCT);
      const ctx = makeCtx(db, 3);
      const result = JSON.parse(
        await updateInventoryTool.handler({ product_id: 'prod-1', delta: 5 }, ctx),
      );
      expect(result.status).toBe('ok');
      expect(result.old_stock).toBe(10);
      expect(result.new_stock).toBe(15);
      expect(result.delta).toBe(5);
      expect(result.product_id).toBe('prod-1');
    });

    it('decreases stock by negative delta', async () => {
      const db = makeMockDB(VALID_PRODUCT);
      const result = JSON.parse(
        await updateInventoryTool.handler({ product_id: 'prod-1', delta: -3 }, makeCtx(db, 3)),
      );
      expect(result.status).toBe('ok');
      expect(result.new_stock).toBe(7);
    });

    it('uses product_id (not product_name) as identifier', async () => {
      const db = makeMockDB(VALID_PRODUCT);
      await updateInventoryTool.handler({ product_id: 'prod-1', delta: 1 }, makeCtx(db, 3));
      const sql = ((db.prepare as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] ?? '') as string;
      expect(sql).toContain('id = ?');
      expect(sql).not.toContain('name = ?');
    });
  });

  describe('HITL gating', () => {
    it('defers with { deferred: true } when autonomyLevel < 3', async () => {
      const db = makeMockDB(VALID_PRODUCT);
      const ctx = makeCtx(db, 2);
      const result = JSON.parse(
        await updateInventoryTool.handler({ product_id: 'prod-1', delta: 5 }, ctx),
      );
      expect(result.deferred).toBe(true);
      expect(result.queue_item_id).toBe('hitl-inv-2');
      expect(result.proposed_new_stock).toBe(15);
      expect(ctx.hitlService.submit).toHaveBeenCalledOnce();
    });
  });

  describe('negative stock prevention', () => {
    it('returns WOULD_MAKE_STOCK_NEGATIVE when delta would go below zero', async () => {
      const db = makeMockDB(VALID_PRODUCT);
      const result = JSON.parse(
        await updateInventoryTool.handler({ product_id: 'prod-1', delta: -20 }, makeCtx(db, 3)),
      );
      expect(result.error).toBe('WOULD_MAKE_STOCK_NEGATIVE');
      expect(result.current_stock).toBe(10);
    });
  });

  describe('T3 isolation', () => {
    it('returns PRODUCT_NOT_FOUND when product_id belongs to a different tenant', async () => {
      const db = makeMockDB(null);
      const result = JSON.parse(
        await updateInventoryTool.handler({ product_id: 'other-tenant-prod', delta: 5 }, makeCtx(db, 3)),
      );
      expect(result.error).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('validation', () => {
    it('returns MISSING_PRODUCT_ID when product_id is absent', async () => {
      const db = makeMockDB(VALID_PRODUCT);
      const result = JSON.parse(
        await updateInventoryTool.handler({ delta: 5 }, makeCtx(db, 3)),
      );
      expect(result.error).toBe('MISSING_PRODUCT_ID');
    });

    it('rejects float delta with INVALID_DELTA', async () => {
      const db = makeMockDB(VALID_PRODUCT);
      const result = JSON.parse(
        await updateInventoryTool.handler({ product_id: 'prod-1', delta: 1.5 }, makeCtx(db, 3)),
      );
      expect(result.error).toBe('INVALID_DELTA');
    });

    it('rejects zero delta with INVALID_DELTA', async () => {
      const db = makeMockDB(VALID_PRODUCT);
      const result = JSON.parse(
        await updateInventoryTool.handler({ product_id: 'prod-1', delta: 0 }, makeCtx(db, 3)),
      );
      expect(result.error).toBe('INVALID_DELTA');
    });
  });
});
