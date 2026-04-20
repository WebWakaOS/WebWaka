import { describe, it, expect } from 'vitest';
import { publishEvent, getAggregateEvents } from './publisher.js';
import { EventType } from './event-types.js';
import type { NotificationOutboxMessage } from './publisher.js';

function makeDb(queryResults: Record<string, unknown> = {}) {
  const log: { sql: string; args: unknown[] }[] = [];

  return {
    _log: log,
    prepare(sql: string) {
      return {
        bind: (...args: unknown[]) => ({
          // eslint-disable-next-line @typescript-eslint/require-await
          run: async () => {
            log.push({ sql, args });
            return { success: true };
          },
          // eslint-disable-next-line @typescript-eslint/require-await
          first: async <T>(): Promise<T | null> => {
            for (const [key, value] of Object.entries(queryResults)) {
              if (sql.includes(key)) return value as T;
            }
            return null;
          },
          // eslint-disable-next-line @typescript-eslint/require-await
          all: async <T>() => {
            for (const [key, value] of Object.entries(queryResults)) {
              if (sql.includes(key)) return { results: value as T[] };
            }
            return { results: [] as T[] };
          },
        }),
        // eslint-disable-next-line @typescript-eslint/require-await
        run: async () => ({ success: true }),
        // eslint-disable-next-line @typescript-eslint/require-await
        first: async <T>(): Promise<T | null> => null,
        // eslint-disable-next-line @typescript-eslint/require-await
        all: async <T>() => ({ results: [] as T[] }),
      };
    },
  };
}

function makeQueue() {
  const sent: NotificationOutboxMessage[] = [];
  return {
    sent,
    // eslint-disable-next-line @typescript-eslint/require-await
    send: async (msg: NotificationOutboxMessage) => {
      sent.push(msg);
    },
  };
}

// ---------------------------------------------------------------------------
// publishEvent — core functionality (existing tests preserved)
// ---------------------------------------------------------------------------

describe('publishEvent', () => {
  it('returns a domain event with an assigned version', async () => {
    const db = makeDb({ 'max_version': { max_version: 0 } });

    const event = await publishEvent(db, {
      aggregate: 'individual',
      aggregateId: 'ind_abc',
      eventType: EventType.EntityCreated,
      tenantId: 'tnt_xyz',
      payload: { entityType: 'individual', displayName: 'Emeka Obi' },
    });

    expect(event.id).toMatch(/^evt_/);
    expect(event.version).toBe(1);
    expect(event.aggregate).toBe('individual');
    expect(event.aggregateId).toBe('ind_abc');
    expect(event.eventType).toBe(EventType.EntityCreated);
    expect(event.tenantId).toBe('tnt_xyz');
  });

  it('increments version when aggregate has existing events', async () => {
    const db = makeDb({ 'max_version': { max_version: 3 } });

    const event = await publishEvent(db, {
      aggregate: 'individual',
      aggregateId: 'ind_abc',
      eventType: EventType.EntityUpdated,
      tenantId: 'tnt_xyz',
      payload: {},
    });

    expect(event.version).toBe(4);
  });

  it('sets version to 1 when no prior events exist (null max)', async () => {
    const db = makeDb({});

    const event = await publishEvent(db, {
      aggregate: 'workspace',
      aggregateId: 'wsp_new',
      eventType: EventType.WorkspaceActivated,
      tenantId: 'tnt_1',
      payload: {},
    });

    expect(event.version).toBe(1);
  });

  it('serialises payload correctly', async () => {
    const db = makeDb({ 'max_version': { max_version: 0 } });

    const payload = { workspaceId: 'wsp_1', amountKobo: 5000_00, plan: 'starter', paystackRef: 'ref_xyz' };
    const event = await publishEvent(db, {
      aggregate: 'payment',
      aggregateId: 'ref_xyz',
      eventType: EventType.PaymentSuccess,
      tenantId: 'tnt_pay',
      payload,
    });

    expect(event.payload).toEqual(payload);
  });
});

// ---------------------------------------------------------------------------
// publishEvent — N-013 outbox pattern (queue integration)
// ---------------------------------------------------------------------------

describe('publishEvent — N-013 outbox queue', () => {
  it('does NOT send a Queue message when notificationQueue is omitted', async () => {
    const db = makeDb({ 'max_version': { max_version: 0 } });
    const queue = makeQueue();

    await publishEvent(db, {
      aggregate: 'user',
      aggregateId: 'usr_001',
      eventType: EventType.UserRegistered,
      tenantId: 'tnt_1',
      payload: { email: 'test@example.com' },
      // notificationQueue intentionally omitted
    });

    expect(queue.sent).toHaveLength(0);
  });

  it('sends a NotificationOutboxMessage when notificationQueue is provided', async () => {
    const db = makeDb({ 'max_version': { max_version: 0 } });
    const queue = makeQueue();

    const event = await publishEvent(db, {
      aggregate: 'user',
      aggregateId: 'usr_001',
      eventType: EventType.UserRegistered,
      tenantId: 'tnt_1',
      payload: { email: 'test@example.com' },
      notificationQueue: queue,
    });

    expect(queue.sent).toHaveLength(1);
    const msg = queue.sent[0];
    expect(msg).toBeDefined();
    if (!msg) throw new Error('msg is undefined');
    expect(msg.type).toBe('notification_event');
    expect(msg.eventId).toBe(event.id);
    expect(msg.eventKey).toBe('auth.user.registered');
    expect(msg.domain).toBe('auth');
    expect(msg.aggregateType).toBe('user');
    expect(msg.aggregateId).toBe('usr_001');
    expect(msg.tenantId).toBe('tnt_1');
    expect(msg.actorType).toBe('system');
    expect(msg.source).toBe('api');
    expect(msg.severity).toBe('info');
    expect(msg.payload).toEqual({ email: 'test@example.com' });
  });

  it('populates actor fields from params when provided', async () => {
    const db = makeDb({ 'max_version': { max_version: 0 } });
    const queue = makeQueue();

    await publishEvent(db, {
      aggregate: 'user',
      aggregateId: 'usr_002',
      eventType: EventType.UserInvited,
      tenantId: 'tnt_2',
      payload: { inviteEmail: 'new@example.com', invitedByUserId: 'usr_001', workspaceId: 'wsp_1', role: 'member' },
      notificationQueue: queue,
      actorType: 'user',
      actorId: 'usr_001',
      subjectType: 'workspace',
      subjectId: 'wsp_1',
    });

    const msg = queue.sent[0];
    expect(msg).toBeDefined();
    if (!msg) throw new Error('msg is undefined');
    expect(msg.actorType).toBe('user');
    expect(msg.actorId).toBe('usr_001');
    expect(msg.subjectType).toBe('workspace');
    expect(msg.subjectId).toBe('wsp_1');
  });

  it('propagates correlationId and source to the Queue message', async () => {
    const db = makeDb({ 'max_version': { max_version: 0 } });
    const queue = makeQueue();

    await publishEvent(db, {
      aggregate: 'transfer',
      aggregateId: 'txn_999',
      eventType: EventType.BankTransferCompleted,
      tenantId: 'tnt_bank',
      payload: { transferId: 'txn_999', workspaceId: 'wsp_1', amountKobo: 50000, status: 'completed' },
      correlationId: 'corr_abc123',
      source: 'ussd_gateway',
      severity: 'warning',
      notificationQueue: queue,
    });

    const msg = queue.sent[0];
    expect(msg).toBeDefined();
    if (!msg) throw new Error('msg is undefined');
    expect(msg.correlationId).toBe('corr_abc123');
    expect(msg.source).toBe('ussd_gateway');
    expect(msg.severity).toBe('warning');
  });

  it('omits undefined optional fields from the Queue message (exactOptionalPropertyTypes)', async () => {
    const db = makeDb({ 'max_version': { max_version: 0 } });
    const queue = makeQueue();

    await publishEvent(db, {
      aggregate: 'payment',
      aggregateId: 'pay_001',
      eventType: EventType.BillingPaymentSucceeded,
      tenantId: 'tnt_bill',
      payload: { workspaceId: 'wsp_1', amountKobo: 10000, currency: 'NGN' },
      notificationQueue: queue,
    });

    const msg = queue.sent[0];
    expect(msg).toBeDefined();
    if (!msg) throw new Error('msg is undefined');
    // Optional fields should NOT be present (not set to undefined) when omitted
    expect('actorId' in msg).toBe(false);
    expect('subjectType' in msg).toBe(false);
    expect('subjectId' in msg).toBe(false);
    expect('correlationId' in msg).toBe(false);
  });

  it('sends Queue message even when source is omitted (defaults to api)', async () => {
    const db = makeDb({ 'max_version': { max_version: 0 } });
    const queue = makeQueue();

    await publishEvent(db, {
      aggregate: 'user',
      aggregateId: 'usr_003',
      eventType: EventType.UserPasswordResetRequested,
      tenantId: 'tnt_3',
      payload: { email: 'user@example.com' },
      notificationQueue: queue,
    });

    const msg = queue.sent[0];
    expect(msg).toBeDefined();
    if (!msg) throw new Error('msg is undefined');
    expect(msg.source).toBe('api');
  });

  it('domain is derived correctly from multi-segment event keys', async () => {
    const db = makeDb({ 'max_version': { max_version: 0 } });
    const queue = makeQueue();

    await publishEvent(db, {
      aggregate: 'transfer',
      aggregateId: 'txn_001',
      eventType: EventType.BankTransferInitiated,
      tenantId: 'tnt_bank',
      payload: { transferId: 'txn_001', workspaceId: 'wsp_1', amountKobo: 5000, status: 'initiated' },
      notificationQueue: queue,
    });

    const msg = queue.sent[0];
    expect(msg).toBeDefined();
    if (!msg) throw new Error('msg is undefined');
    // 'bank_transfer.initiated' → domain = 'bank_transfer'
    expect(msg.domain).toBe('bank_transfer');
    expect(msg.eventKey).toBe('bank_transfer.initiated');
  });
});

// ---------------------------------------------------------------------------
// getAggregateEvents
// ---------------------------------------------------------------------------

describe('getAggregateEvents', () => {
  it('returns empty array when no events exist', async () => {
    const db = makeDb({});
    const events = await getAggregateEvents(db, 'individual', 'ind_missing');
    expect(events).toEqual([]);
  });

  it('maps rows to domain events correctly', async () => {
    const rows = [
      {
        id: 'evt_001',
        aggregate: 'individual',
        aggregate_id: 'ind_abc',
        event_type: EventType.EntityCreated,
        tenant_id: 'tnt_xyz',
        payload: JSON.stringify({ entityType: 'individual', displayName: 'Test' }),
        version: 1,
        created_at: '2026-01-01 00:00:00',
      },
    ];

    const db = makeDb({ 'ORDER BY version ASC': rows });
    const events = await getAggregateEvents(db, 'individual', 'ind_abc');

    expect(events).toHaveLength(1);
    expect(events[0]?.id).toBe('evt_001');
    expect(events[0]?.version).toBe(1);
    expect(events[0]?.payload).toEqual({ entityType: 'individual', displayName: 'Test' });
  });
});
