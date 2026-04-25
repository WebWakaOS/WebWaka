import { describe, it, expect, vi } from 'vitest';
import { createInvoiceTool } from './create-invoice.js';
import type { ToolExecutionContext } from '../tool-registry.js';

type MockDB = {
  prepare: ReturnType<typeof vi.fn>;
  batch: ReturnType<typeof vi.fn>;
};

function makeMockDB(contactRow: unknown = { id: 'contact-1' }): MockDB {
  return {
    prepare: vi.fn().mockImplementation(() => ({
      bind: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(contactRow),
        run: vi.fn().mockResolvedValue({ success: true }),
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
    vertical: 'retail',
    hitlService: { submit: vi.fn().mockResolvedValue({ queueItemId: 'hitl-inv-1' }) } as never,
    autonomyLevel,
  };
}

const VALID_ITEMS = [
  { description: 'Web Design', qty: 2, unit_price_kobo: 50000 },
  { description: 'Hosting', qty: 1, unit_price_kobo: 10000 },
];

describe('create_invoice', () => {
  describe('happy path (autonomyLevel=3)', () => {
    it('creates a draft invoice and returns invoice_id + total_kobo', async () => {
      const db = makeMockDB();
      const ctx = makeCtx(db, 3);
      const result = JSON.parse(
        await createInvoiceTool.handler(
          { contact_id: 'contact-1', line_items: VALID_ITEMS },
          ctx,
        ),
      );
      expect(result.status).toBe('ok');
      expect(result.invoice_id).toBeTruthy();
      expect(result.total_kobo).toBe(110000); // 2×50000 + 1×10000
      expect(result.line_item_count).toBe(2);
    });

    it('response message contains only kobo — no naira formatting', async () => {
      const db = makeMockDB();
      const result = JSON.parse(
        await createInvoiceTool.handler(
          { contact_id: 'contact-1', line_items: VALID_ITEMS },
          makeCtx(db, 3),
        ),
      );
      expect(result.message).not.toMatch(/₦/);
      expect(result.message).toMatch(/kobo/i);
    });
  });

  describe('P9 validation — integer kobo enforcement', () => {
    it('rejects float unit_price_kobo with P9_VIOLATION', async () => {
      const db = makeMockDB();
      const result = JSON.parse(
        await createInvoiceTool.handler(
          { contact_id: 'contact-1', line_items: [{ description: 'Item', qty: 1, unit_price_kobo: 500.50 }] },
          makeCtx(db, 3),
        ),
      );
      expect(result.error).toBe('P9_VIOLATION');
      expect(db.prepare).not.toHaveBeenCalledWith(expect.stringContaining('INSERT'));
    });

    it('rejects zero unit_price_kobo', async () => {
      const db = makeMockDB();
      const result = JSON.parse(
        await createInvoiceTool.handler(
          { contact_id: 'contact-1', line_items: [{ description: 'Item', qty: 1, unit_price_kobo: 0 }] },
          makeCtx(db, 3),
        ),
      );
      expect(result.error).toBe('P9_VIOLATION');
    });

    it('accepts integer kobo values', async () => {
      const db = makeMockDB();
      const result = JSON.parse(
        await createInvoiceTool.handler(
          { contact_id: 'contact-1', line_items: [{ description: 'Item', qty: 3, unit_price_kobo: 25000 }] },
          makeCtx(db, 3),
        ),
      );
      expect(result.status).toBe('ok');
      expect(result.total_kobo).toBe(75000);
    });
  });

  describe('HITL gating', () => {
    it('defers with { deferred: true } when autonomyLevel < 3', async () => {
      const db = makeMockDB();
      const ctx = makeCtx(db, 2);
      const result = JSON.parse(
        await createInvoiceTool.handler(
          { contact_id: 'contact-1', line_items: VALID_ITEMS },
          ctx,
        ),
      );
      expect(result.deferred).toBe(true);
      expect(result.queue_item_id).toBe('hitl-inv-1');
      expect(result.total_kobo).toBe(110000);
      expect(ctx.hitlService.submit).toHaveBeenCalledOnce();
    });
  });

  describe('T3 isolation', () => {
    it('returns CONTACT_NOT_FOUND when contact_id belongs to different tenant', async () => {
      const db = makeMockDB(null);
      const result = JSON.parse(
        await createInvoiceTool.handler(
          { contact_id: 'other-tenant-contact', line_items: VALID_ITEMS },
          makeCtx(db, 3),
        ),
      );
      expect(result.error).toBe('CONTACT_NOT_FOUND');
    });
  });

  describe('validation', () => {
    it('returns MISSING_CONTACT_ID when contact_id is absent', async () => {
      const db = makeMockDB();
      const result = JSON.parse(
        await createInvoiceTool.handler({ line_items: VALID_ITEMS }, makeCtx(db, 3)),
      );
      expect(result.error).toBe('MISSING_CONTACT_ID');
    });

    it('returns EMPTY_LINE_ITEMS when line_items array is empty', async () => {
      const db = makeMockDB();
      const result = JSON.parse(
        await createInvoiceTool.handler({ contact_id: 'contact-1', line_items: [] }, makeCtx(db, 3)),
      );
      expect(result.error).toBe('EMPTY_LINE_ITEMS');
    });
  });
});
