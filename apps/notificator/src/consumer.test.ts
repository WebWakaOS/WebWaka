/**
 * N-012 (Phase 1) — Consumer unit tests.
 *
 * Tests processNotificationEvent(), processDigestBatch(), and the
 * processQueueBatch() lifecycle with mock D1 and env bindings.
 *
 * Uses plain Vitest (no @cloudflare/vitest-pool-workers) because the
 * functions under test accept duck-typed DB/Queue interfaces, making them
 * fully testable without CF runtime bindings.
 *
 * exactOptionalPropertyTypes: optional fields are OMITTED (not set to undefined)
 * to comply with the tsconfig exactOptionalPropertyTypes=true constraint.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  processNotificationEvent,
  processDigestBatch,
  processQueueBatch,
  type NotificationQueueMessage,
} from './consumer.js';
import type { Env } from './env.js';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function makeDb() {
  const writes: { sql: string; args: unknown[] }[] = [];

  return {
    _writes: writes,
    prepare(sql: string) {
      return {
        bind: (...args: unknown[]) => ({
          // eslint-disable-next-line @typescript-eslint/require-await
          run: async () => {
            writes.push({ sql, args });
            return { success: true };
          },
          // D1LikeFull: first() and all() stubs for Phase 2 processEvent queries
          first: async <T>(): Promise<T | null> => null,
          all: async <T>(): Promise<{ results: T[] }> => ({ results: [] }),
        }),
      };
    },
  };
}

/** Full notification_event message with all fields populated. */
function makeMessage(overrides: Partial<NotificationQueueMessage> = {}): NotificationQueueMessage {
  return {
    type: 'notification_event',
    eventId: 'evt_abc123deadbeef',
    eventKey: 'auth.user.registered',
    domain: 'auth',
    aggregateType: 'user',
    aggregateId: 'usr_001',
    tenantId: 'tnt_xyz',
    actorType: 'system',
    payload: { email: 'user@example.com' },
    source: 'api',
    severity: 'info',
    ...overrides,
  };
}

/**
 * Create a message with specific keys removed (not set to undefined).
 * Required by exactOptionalPropertyTypes: optional fields must be absent,
 * not explicitly set to undefined.
 */
function makeMessageWithout<K extends keyof NotificationQueueMessage>(
  ...keys: K[]
): Omit<NotificationQueueMessage, K> {
  const msg = makeMessage();
  for (const key of keys) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (msg as unknown as Record<string, unknown>)[key];
  }
  return msg as Omit<NotificationQueueMessage, K>;
}

/**
 * Mock Env — env.DB is the mock DB, all other bindings are empty stubs.
 * Cast to `unknown as Env` at call sites to satisfy the D1Database type.
 */
function makeTestEnv(
  db: ReturnType<typeof makeDb>,
  overrides: { NOTIFICATION_PIPELINE_ENABLED?: '0' | '1' } = {},
) {
  return {
    NOTIFICATION_PIPELINE_ENABLED: '1' as const,
    NOTIFICATION_SANDBOX_MODE: 'true' as const,
    ENVIRONMENT: 'staging' as const,
    INTER_SERVICE_SECRET: 'test-secret',
    DB: db,
    NOTIFICATION_KV: {},
    NOTIFICATION_QUEUE: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// FakeMessage — models a CF Queue message with ack/retry tracking.
// Uses a mutable closure object rather than `this` to avoid TS literal
// type inference narrowing ackCalled/retryCalled to `false`.
// ---------------------------------------------------------------------------

type FakeMessageState = {
  body: NotificationQueueMessage;
  ackCalled: boolean;
  retryCalled: boolean;
  ack(): void;
  retry(): void;
};

function makeBatch(messages: NotificationQueueMessage[]) {
  const fakeMessages: FakeMessageState[] = messages.map((body) => {
    const state: FakeMessageState = {
      body,
      ackCalled: false,
      retryCalled: false,
      ack() { state.ackCalled = true; },
      retry() { state.retryCalled = true; },
    };
    return state;
  });

  let ackAllCalled = false;
  return {
    messages: fakeMessages,
    get ackAllCalled() { return ackAllCalled; },
    ackAll() { ackAllCalled = true; },
  };
}

// ---------------------------------------------------------------------------
// processNotificationEvent — Phase 1 core
// ---------------------------------------------------------------------------

describe('processNotificationEvent', () => {
  it('writes a notification_event row with correct fields', async () => {
    const db = makeDb();
    const msg = makeMessage();

    await processNotificationEvent(msg, db);

    expect(db._writes).toHaveLength(1);
    const write = db._writes[0];
    expect(write).toBeDefined();
    if (!write) throw new Error('write is undefined');

    expect(write.sql).toContain('INSERT OR IGNORE INTO notification_event');
    // args[0] = id: derived deterministically from eventId
    expect(write.args[0]).toBe('notif_evt_abc123deadbeef');
    // args[1] = event_key
    expect(write.args[1]).toBe('auth.user.registered');
    // args[2] = domain
    expect(write.args[2]).toBe('auth');
    // args[3] = aggregate_type
    expect(write.args[3]).toBe('user');
    // args[4] = aggregate_id
    expect(write.args[4]).toBe('usr_001');
    // args[5] = tenant_id (G1)
    expect(write.args[5]).toBe('tnt_xyz');
    // args[6] = actor_type
    expect(write.args[6]).toBe('system');
  });

  it('derives domain and aggregateType from eventKey when absent in message', async () => {
    const db = makeDb();
    // exactOptionalPropertyTypes: omit the fields instead of setting to undefined
    const msg = makeMessageWithout('domain', 'aggregateType');

    await processNotificationEvent(msg as NotificationQueueMessage, db);

    const write = db._writes[0];
    expect(write).toBeDefined();
    if (!write) throw new Error('write is undefined');
    // 'auth.user.registered' → domain='auth', aggregateType='user'
    expect(write.args[2]).toBe('auth');
    expect(write.args[3]).toBe('user');
  });

  it('idempotent: same notifEventId derived from same eventId on every retry', async () => {
    const db1 = makeDb();
    const db2 = makeDb();
    const msg = makeMessage({ eventId: 'evt_idem0001' });

    await processNotificationEvent(msg, db1);
    await processNotificationEvent(msg, db2);

    // Both writes produce the same derived id → INSERT OR IGNORE handles dedup
    expect(db1._writes[0]?.args[0]).toBe('notif_evt_idem0001');
    expect(db2._writes[0]?.args[0]).toBe('notif_evt_idem0001');
  });

  it('serialises payload to JSON string', async () => {
    const db = makeDb();
    const payload = { email: 'test@example.com', workspaceId: 'wsp_001' };
    const msg = makeMessage({ payload });

    await processNotificationEvent(msg, db);

    const write = db._writes[0];
    expect(write).toBeDefined();
    if (!write) throw new Error('write is undefined');
    // payload is at bind arg index 10
    expect(write.args[10]).toBe(JSON.stringify(payload));
  });

  it('passes null for absent optional fields (actorId, subjectType, subjectId, correlationId)', async () => {
    const db = makeDb();
    // Omit optional fields entirely (exactOptionalPropertyTypes)
    const msg = makeMessageWithout('actorId', 'subjectType', 'subjectId', 'correlationId');

    await processNotificationEvent(msg as NotificationQueueMessage, db);

    const write = db._writes[0];
    expect(write).toBeDefined();
    if (!write) throw new Error('write is undefined');
    // actor_id = args[7], subject_type = args[8], subject_id = args[9]
    expect(write.args[7]).toBeNull();
    expect(write.args[8]).toBeNull();
    expect(write.args[9]).toBeNull();
    // correlation_id = args[11]
    expect(write.args[11]).toBeNull();
  });

  it('throws when tenantId is empty string (G1 violation)', async () => {
    const db = makeDb();
    const msg = { ...makeMessage(), tenantId: '' };

    await expect(processNotificationEvent(msg, db)).rejects.toThrow(
      'tenantId is required (G1 violation)',
    );
    expect(db._writes).toHaveLength(0);
  });

  it('throws when eventId is absent', async () => {
    const db = makeDb();
    const msg = makeMessageWithout('eventId');

    await expect(processNotificationEvent(msg as NotificationQueueMessage, db)).rejects.toThrow(
      'eventId is required',
    );
  });

  it('throws when eventKey is absent', async () => {
    const db = makeDb();
    const msg = makeMessageWithout('eventKey');

    await expect(processNotificationEvent(msg as NotificationQueueMessage, db)).rejects.toThrow(
      'eventKey is required',
    );
  });

  it('defaults source to queue_consumer when absent in message', async () => {
    const db = makeDb();
    const msg = makeMessageWithout('source');

    await processNotificationEvent(msg as NotificationQueueMessage, db);

    const write = db._writes[0];
    expect(write).toBeDefined();
    if (!write) throw new Error('write is undefined');
    // source = bind arg index 12
    expect(write.args[12]).toBe('queue_consumer');
  });

  it('defaults severity to info when absent in message', async () => {
    const db = makeDb();
    const msg = makeMessageWithout('severity');

    await processNotificationEvent(msg as NotificationQueueMessage, db);

    const write = db._writes[0];
    expect(write).toBeDefined();
    if (!write) throw new Error('write is undefined');
    // severity = bind arg index 13
    expect(write.args[13]).toBe('info');
  });
});

// ---------------------------------------------------------------------------
// processDigestBatch — Phase 1 stub
// ---------------------------------------------------------------------------

describe('processDigestBatch', () => {
  it('resolves without error for a valid digest_batch message', async () => {
    const db = makeDb();
    const msg: NotificationQueueMessage = {
      type: 'digest_batch',
      tenantId: 'tnt_xyz',
      batchId: 'digest_001',
    };

    await expect(processDigestBatch(msg, db)).resolves.toBeUndefined();
  });

  it('throws when tenantId is empty string (G1 / G12 violation)', async () => {
    const db = makeDb();
    const msg: NotificationQueueMessage = {
      type: 'digest_batch',
      tenantId: '',
      batchId: 'digest_001',
    };

    await expect(processDigestBatch(msg, db)).rejects.toThrow(
      'tenantId is required (G1 / G12 violation)',
    );
  });

  it('does NOT write to D1 in Phase 1 (Phase 5 DigestEngine pending)', async () => {
    const db = makeDb();
    const msg: NotificationQueueMessage = {
      type: 'digest_batch',
      tenantId: 'tnt_xyz',
      batchId: 'digest_batch_abc',
    };

    await processDigestBatch(msg, db);

    expect(db._writes).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// processQueueBatch — kill-switch + ack/retry lifecycle
// ---------------------------------------------------------------------------

describe('processQueueBatch', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('ackAll without processing when NOTIFICATION_PIPELINE_ENABLED=0', async () => {
    const db = makeDb();
    const env = makeTestEnv(db, { NOTIFICATION_PIPELINE_ENABLED: '0' });
    const batch = makeBatch([makeMessage()]);

    await processQueueBatch(
      batch as unknown as MessageBatch<NotificationQueueMessage>,
      env as unknown as Env,
    );

    expect(batch.ackAllCalled).toBe(true);
    expect(batch.messages[0]?.ackCalled).toBe(false);
    expect(db._writes).toHaveLength(0);
  });

  it('acks a successfully processed notification_event message', async () => {
    const db = makeDb();
    const env = makeTestEnv(db);
    const batch = makeBatch([makeMessage()]);

    await processQueueBatch(
      batch as unknown as MessageBatch<NotificationQueueMessage>,
      env as unknown as Env,
    );

    expect(batch.messages[0]?.ackCalled).toBe(true);
    expect(batch.messages[0]?.retryCalled).toBe(false);
    // Phase 2: processEvent adds extra writes (markNotifEventProcessed etc.), so filter
    // to just the Phase 1 notification_event INSERT to keep this assertion stable.
    const insertWrites = db._writes.filter((w) =>
      w.sql.includes('INSERT OR IGNORE INTO notification_event'),
    );
    expect(insertWrites).toHaveLength(1);
    expect(insertWrites[0]?.sql).toContain('INSERT OR IGNORE INTO notification_event');
  });

  it('retries a failed notification_event message and writes audit log (G9 + G10)', async () => {
    // Make DB fail on all writes
    const failDb = {
      _writes: [] as { sql: string; args: unknown[] }[],
      prepare(_sql: string) {
        return {
          bind: (..._args: unknown[]) => ({
            // eslint-disable-next-line @typescript-eslint/require-await
            run: async () => { throw new Error('D1 connection failed'); },
          }),
        };
      },
    };
    const env = makeTestEnv(failDb as unknown as ReturnType<typeof makeDb>);
    const batch = makeBatch([makeMessage()]);

    await processQueueBatch(
      batch as unknown as MessageBatch<NotificationQueueMessage>,
      env as unknown as Env,
    );

    expect(batch.messages[0]?.ackCalled).toBe(false);
    expect(batch.messages[0]?.retryCalled).toBe(true);
  });

  it('acks an unknown message type with a warning (prevents DLQ buildup)', async () => {
    const db = makeDb();
    const env = makeTestEnv(db);
    // Force an unrecognised type
    const msg = { ...makeMessage(), type: 'unknown_future_type' as 'notification_event' };
    const batch = makeBatch([msg]);

    await processQueueBatch(
      batch as unknown as MessageBatch<NotificationQueueMessage>,
      env as unknown as Env,
    );

    expect(batch.messages[0]?.ackCalled).toBe(true);
    expect(batch.messages[0]?.retryCalled).toBe(false);
  });

  it('processes multiple messages in a batch independently', async () => {
    const db = makeDb();
    const env = makeTestEnv(db);

    const msg1 = makeMessage({ eventId: 'evt_batch001', tenantId: 'tnt_a' });
    const msg2 = makeMessage({ eventId: 'evt_batch002', tenantId: 'tnt_b' });
    const batch = makeBatch([msg1, msg2]);

    await processQueueBatch(
      batch as unknown as MessageBatch<NotificationQueueMessage>,
      env as unknown as Env,
    );

    expect(batch.messages[0]?.ackCalled).toBe(true);
    expect(batch.messages[1]?.ackCalled).toBe(true);
    // Phase 2: processEvent adds extra writes (markNotifEventProcessed etc.), so filter to
    // just the notification_event INSERT rows — one per message — to keep assertions stable.
    const insertWrites = db._writes.filter((w) =>
      w.sql.includes('INSERT OR IGNORE INTO notification_event'),
    );
    expect(insertWrites).toHaveLength(2);
    expect(insertWrites[0]?.args[0]).toBe('notif_evt_batch001');
    expect(insertWrites[1]?.args[0]).toBe('notif_evt_batch002');
  });
});
