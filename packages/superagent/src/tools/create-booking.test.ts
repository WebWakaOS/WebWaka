import { describe, it, expect, vi } from 'vitest';
import { createBookingTool } from './create-booking.js';
import type { ToolExecutionContext } from '../tool-registry.js';

type MockDB = {
  prepare: ReturnType<typeof vi.fn>;
  batch: ReturnType<typeof vi.fn>;
};

function makeMockDB(slotRow: unknown = null, contactRow: unknown = null): MockDB {
  const db: MockDB = {
    prepare: vi.fn().mockImplementation((sql: string) => {
      let first: unknown = null;
      if (sql.includes('ai_schedule_slots')) first = slotRow;
      else if (sql.includes('individuals') || sql.includes('organizations')) first = contactRow;
      return {
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(first),
          all: vi.fn().mockResolvedValue({ results: [] }),
          run: vi.fn().mockResolvedValue({ success: true, meta: { changes: 1 } }),
        }),
      };
    }),
    batch: vi.fn().mockResolvedValue([{ success: true }, { success: true }]),
  };
  return db;
}

function makeCtx(db: MockDB, autonomyLevel: 1 | 2 | 3 = 3): ToolExecutionContext {
  return {
    tenantId: 'tenant-1',
    workspaceId: 'ws-1',
    userId: 'user-1',
    db: db as unknown as D1Database,
    vertical: 'salon',
    hitlService: { submit: vi.fn().mockResolvedValue({ queueItemId: 'hitl-q-1' }) } as never,
    autonomyLevel,
  };
}

const VALID_SLOT = {
  id: 'slot-1',
  schedule_id: 'sched-1',
  slot_time: 1700001000,
  service_name: 'Haircut',
  status: 'available',
};

const VALID_CONTACT = { id: 'contact-1' };

describe('create_booking', () => {
  describe('happy path (autonomyLevel=3)', () => {
    it('updates slot then inserts booking (sequential writes)', async () => {
      const db = makeMockDB(VALID_SLOT, VALID_CONTACT);
      const ctx = makeCtx(db, 3);
      const result = JSON.parse(
        await createBookingTool.handler(
          { schedule_id: 'sched-1', slot_id: 'slot-1', contact_id: 'contact-1' },
          ctx,
        ),
      );
      expect(result.status).toBe('ok');
      expect(result.booking_id).toBeTruthy();
      expect(result.schedule_id).toBe('sched-1');
      expect(result.slot_id).toBe('slot-1');
      // Uses sequential writes (not batch), so db.batch should NOT be called
      expect(db.batch).not.toHaveBeenCalled();
      // Both UPDATE slot and INSERT booking should be prepared
      const sqls = (db.prepare as ReturnType<typeof vi.fn>).mock.calls.map(
        (c: unknown[]) => c[0] as string,
      );
      expect(sqls.some((s) => s.includes('UPDATE ai_schedule_slots'))).toBe(true);
      expect(sqls.some((s) => s.includes('INSERT INTO ai_bookings'))).toBe(true);
    });

    it('returns SLOT_NO_LONGER_AVAILABLE when concurrent request reserved the slot first', async () => {
      // Simulate: slot was available at read time but UPDATE returns changes=0
      // (another request won the race and set status='reserved' between our read and write)
      const db: MockDB = {
        prepare: vi.fn().mockImplementation((sql: string) => {
          if (sql.includes('UPDATE ai_schedule_slots')) {
            return {
              bind: vi.fn().mockReturnValue({
                first: vi.fn().mockResolvedValue(null),
                run: vi.fn().mockResolvedValue({ success: true, meta: { changes: 0 } }), // lost the race
                all: vi.fn().mockResolvedValue({ results: [] }),
              }),
            };
          }
          // slot lookup: returns as available (stale read)
          let first: unknown = null;
          if (sql.includes('ai_schedule_slots')) first = VALID_SLOT;
          else if (sql.includes('individuals') || sql.includes('organizations')) first = VALID_CONTACT;
          return {
            bind: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue(first),
              run: vi.fn().mockResolvedValue({ success: true, meta: { changes: 0 } }),
              all: vi.fn().mockResolvedValue({ results: [] }),
            }),
          };
        }),
        batch: vi.fn().mockResolvedValue([{ success: true }]),
      };
      const result = JSON.parse(
        await createBookingTool.handler(
          { schedule_id: 'sched-1', slot_id: 'slot-1', contact_id: 'contact-1' },
          makeCtx(db, 3),
        ),
      );
      expect(result.error).toBe('SLOT_NO_LONGER_AVAILABLE');
      // Confirm booking INSERT was NOT issued
      const sqls = (db.prepare as ReturnType<typeof vi.fn>).mock.calls.map(
        (c: unknown[]) => c[0] as string,
      );
      expect(sqls.some((s) => s.includes('INSERT INTO ai_bookings'))).toBe(false);
    });
  });

  describe('HITL gating', () => {
    it('queues HITL item and returns { deferred: true } when autonomyLevel < 3', async () => {
      const db = makeMockDB(VALID_SLOT, VALID_CONTACT);
      const ctx = makeCtx(db, 2);
      const result = JSON.parse(
        await createBookingTool.handler(
          { schedule_id: 'sched-1', slot_id: 'slot-1', contact_id: 'contact-1' },
          ctx,
        ),
      );
      expect(result.deferred).toBe(true);
      expect(result.queue_item_id).toBe('hitl-q-1');
      expect(db.batch).not.toHaveBeenCalled();
      expect(ctx.hitlService.submit).toHaveBeenCalledOnce();
    });

    it('also defers at autonomyLevel=1', async () => {
      const db = makeMockDB(VALID_SLOT, VALID_CONTACT);
      const ctx = makeCtx(db, 1);
      const result = JSON.parse(
        await createBookingTool.handler(
          { schedule_id: 'sched-1', slot_id: 'slot-1', contact_id: 'contact-1' },
          ctx,
        ),
      );
      expect(result.deferred).toBe(true);
      expect(db.batch).not.toHaveBeenCalled();
    });
  });

  describe('T3 isolation', () => {
    it('returns SLOT_NOT_FOUND when slot does not belong to tenant', async () => {
      const db = makeMockDB(null, VALID_CONTACT);
      const result = JSON.parse(
        await createBookingTool.handler(
          { schedule_id: 'sched-1', slot_id: 'slot-other-tenant', contact_id: 'contact-1' },
          makeCtx(db, 3),
        ),
      );
      expect(result.error).toBe('SLOT_NOT_FOUND');
      expect(db.batch).not.toHaveBeenCalled();
    });

    it('returns CONTACT_NOT_FOUND when contact_id belongs to different tenant', async () => {
      const db = makeMockDB(VALID_SLOT, null);
      const result = JSON.parse(
        await createBookingTool.handler(
          { schedule_id: 'sched-1', slot_id: 'slot-1', contact_id: 'other-tenant-contact' },
          makeCtx(db, 3),
        ),
      );
      expect(result.error).toBe('CONTACT_NOT_FOUND');
      expect(db.batch).not.toHaveBeenCalled();
    });
  });

  describe('slot not available', () => {
    it('returns SLOT_NOT_AVAILABLE when slot is already reserved', async () => {
      const reservedSlot = { ...VALID_SLOT, status: 'reserved' };
      const db = makeMockDB(reservedSlot, VALID_CONTACT);
      const result = JSON.parse(
        await createBookingTool.handler(
          { schedule_id: 'sched-1', slot_id: 'slot-1', contact_id: 'contact-1' },
          makeCtx(db, 3),
        ),
      );
      expect(result.error).toBe('SLOT_NOT_AVAILABLE');
      expect(result.current_status).toBe('reserved');
      expect(db.batch).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('returns MISSING_REQUIRED_FIELDS when schedule_id is absent', async () => {
      const db = makeMockDB(VALID_SLOT, VALID_CONTACT);
      const result = JSON.parse(
        await createBookingTool.handler({ slot_id: 'slot-1', contact_id: 'contact-1' }, makeCtx(db, 3)),
      );
      expect(result.error).toBe('MISSING_REQUIRED_FIELDS');
    });
  });
});
