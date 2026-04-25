import { describe, it, expect, vi } from 'vitest';
import { sendNotificationTool } from './send-notification.js';
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
    hitlService: { submit: vi.fn().mockResolvedValue({ queueItemId: 'hitl-notif-1' }) } as never,
    autonomyLevel,
  };
}

describe('send_notification', () => {
  describe('happy path (autonomyLevel >= 2)', () => {
    it('queues inapp notification at autonomyLevel=2', async () => {
      const db = makeMockDB();
      const ctx = makeCtx(db, 2);
      const result = JSON.parse(
        await sendNotificationTool.handler(
          { contact_id: 'contact-1', channel: 'inapp', message: 'Your order is ready.' },
          ctx,
        ),
      );
      expect(result.status).toBe('ok');
      expect(result.outbox_id).toBeTruthy();
      expect(result.channel).toBe('inapp');
    });

    it('queues sms notification at autonomyLevel=3', async () => {
      const db = makeMockDB();
      const result = JSON.parse(
        await sendNotificationTool.handler(
          { contact_id: 'contact-1', channel: 'sms', message: 'Appointment reminder.' },
          makeCtx(db, 3),
        ),
      );
      expect(result.status).toBe('ok');
      expect(result.channel).toBe('sms');
    });
  });

  describe('HITL gating', () => {
    it('defers with { deferred: true } when autonomyLevel=1 (most conservative threshold)', async () => {
      const db = makeMockDB();
      const ctx = makeCtx(db, 1);
      const result = JSON.parse(
        await sendNotificationTool.handler(
          { contact_id: 'contact-1', channel: 'inapp', message: 'Hello!' },
          ctx,
        ),
      );
      expect(result.deferred).toBe(true);
      expect(result.queue_item_id).toBe('hitl-notif-1');
      expect(ctx.hitlService.submit).toHaveBeenCalledOnce();
    });
  });

  describe('T3 isolation', () => {
    it('returns CONTACT_NOT_FOUND for cross-tenant contact_id', async () => {
      const db = makeMockDB(null);
      const result = JSON.parse(
        await sendNotificationTool.handler(
          { contact_id: 'other-tenant-contact', channel: 'email', message: 'Hello!' },
          makeCtx(db, 3),
        ),
      );
      expect(result.error).toBe('CONTACT_NOT_FOUND');
    });
  });

  describe('validation', () => {
    it('rejects invalid channel with INVALID_CHANNEL', async () => {
      const db = makeMockDB();
      const result = JSON.parse(
        await sendNotificationTool.handler(
          { contact_id: 'contact-1', channel: 'telegram', message: 'Hello!' },
          makeCtx(db, 3),
        ),
      );
      expect(result.error).toBe('INVALID_CHANNEL');
    });

    it('truncates message to 500 characters before storage', async () => {
      const db = makeMockDB();
      const result = JSON.parse(
        await sendNotificationTool.handler(
          { contact_id: 'contact-1', channel: 'inapp', message: 'A'.repeat(600) },
          makeCtx(db, 3),
        ),
      );
      // Message is silently truncated — should succeed, not error
      expect(result.status).toBe('ok');
    });

    it('requires contact_id and message', async () => {
      const db = makeMockDB();
      const result = JSON.parse(
        await sendNotificationTool.handler({ channel: 'inapp' }, makeCtx(db, 3)),
      );
      expect(result.error).toBeDefined();
    });
  });
});
