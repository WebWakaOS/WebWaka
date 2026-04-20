/**
 * Event publisher — appends domain events to the event_log D1 table.
 * Uses optimistic versioning: fetches current max version and increments.
 *
 * Milestone 6 — Event Bus Layer
 * Notification Engine v2 — N-011 (correlationId), N-060a (source), N-013 (outbox queue)
 */

import type { DomainEvent, EventType, NotificationEventSource } from './event-types.js';

// ---------------------------------------------------------------------------
// D1Like — duck-typed D1Database interface for testability
// ---------------------------------------------------------------------------

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean }>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

// ---------------------------------------------------------------------------
// N-013 (Phase 1): Outbox pattern — Queue integration types
//
// Duck-typed interfaces avoid importing @cloudflare/workers-types in this
// package. Any binding implementing these shapes (including CF Queue) is
// accepted transparently.
// ---------------------------------------------------------------------------

/**
 * Full message shape sent to NOTIFICATION_QUEUE when publishEvent() is called
 * with a notificationQueue binding. Contains all fields the consumer needs to
 * write a complete notification_event row without an extra D1 read.
 *
 * N-013: produced by publishEvent(); consumed by apps/notificator consumer.
 */
export interface NotificationOutboxMessage {
  type: 'notification_event';
  eventId: string;           // event_log.id — idempotency key for notification_event row
  eventKey: string;          // e.g. 'auth.user.registered'
  domain: string;            // eventKey.split('.')[0] e.g. 'auth'
  aggregateType: string;     // e.g. 'user', 'workspace'
  aggregateId: string;       // aggregate instance ID
  tenantId: string;          // G1: always required
  actorType: 'user' | 'system' | 'admin' | 'unknown';
  actorId?: string;          // G23: anonymized on NDPR erasure
  subjectType?: string;
  subjectId?: string;
  payload: Record<string, unknown>;
  correlationId?: string;    // N-011: distributed tracing
  source: string;            // NotificationEventSource
  severity: string;          // 'info' | 'warning' | 'critical'
}

/**
 * Duck-typed Cloudflare Queue binding interface.
 * Avoids importing @cloudflare/workers-types in this package.
 * CF Queue (Queue<unknown>) satisfies this interface structurally.
 */
export interface QueueLike {
  send(message: NotificationOutboxMessage): Promise<void>;
}

// ---------------------------------------------------------------------------
// PublishEventParams — expanded with actor context + outbox queue (N-013)
// ---------------------------------------------------------------------------

export interface PublishEventParams<TPayload = Record<string, unknown>> {
  aggregate: string;
  aggregateId: string;
  eventType: EventType;
  tenantId: string;
  payload: TPayload;
  correlationId?: string;           // N-011: cross-service distributed tracing
  source?: NotificationEventSource; // N-060a: origin tag for USSD quiet-hours bypass (G21)

  /**
   * N-013 (Phase 1): Optional Queue binding for outbox pattern.
   * When provided, publishEvent() sends a NotificationOutboxMessage to
   * NOTIFICATION_QUEUE alongside the event_log write, ensuring reliable
   * notification pipeline trigger without a separate queue.send() call at
   * each call site.
   *
   * Usage: pass env.NOTIFICATION_QUEUE from the route handler.
   */
  notificationQueue?: QueueLike;

  /**
   * Actor context — propagated to notification_event row for audience
   * resolution and NDPR audit (Phase 2). Defaults to 'system' when omitted.
   */
  actorType?: 'user' | 'system' | 'admin' | 'unknown';
  actorId?: string;    // G23: anonymized on NDPR erasure

  /** Subject context — optional; used for cross-entity notifications. */
  subjectType?: string;
  subjectId?: string;

  /**
   * Severity tag — propagated to notification_event for quiet-hours bypass
   * logic (G12: critical severity bypasses quiet hours).
   * Defaults to 'info' when omitted.
   */
  severity?: 'info' | 'warning' | 'critical';
}

/**
 * Publish a domain event to the event_log table.
 * Returns the saved event with its assigned version.
 *
 * N-013 (Phase 1): If notificationQueue is provided, also sends a
 * NotificationOutboxMessage to NOTIFICATION_QUEUE alongside the event_log
 * write (outbox pattern). The consumer (apps/notificator) receives this and
 * writes to notification_event, then runs the notification pipeline (Phase 2+).
 *
 * Idempotency: the consumer derives notification_event.id deterministically
 * from eventId, so Queue message retries do not create duplicate rows.
 */
export async function publishEvent<TPayload = Record<string, unknown>>(
  db: D1Like,
  params: PublishEventParams<TPayload>,
): Promise<DomainEvent<TPayload>> {
  const id = `evt_${crypto.randomUUID().replace(/-/g, '')}`;

  // Optimistic versioning: fetch current max version and increment.
  const current = await db
    .prepare(
      `SELECT COALESCE(MAX(version), 0) AS max_version
       FROM event_log
       WHERE aggregate = ? AND aggregate_id = ?`,
    )
    .bind(params.aggregate, params.aggregateId)
    .first<{ max_version: number }>();

  const version = (current?.max_version ?? 0) + 1;
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO event_log (id, aggregate, aggregate_id, event_type, tenant_id, payload, version, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      id,
      params.aggregate,
      params.aggregateId,
      params.eventType,
      params.tenantId,
      JSON.stringify(params.payload),
      version,
    )
    .run();

  // ---------------------------------------------------------------------------
  // N-013 (Phase 1): Outbox pattern — send to NOTIFICATION_QUEUE alongside
  // the event_log write. Both happen in the same request, ensuring the
  // notification pipeline is triggered for every business event without
  // requiring each call site to invoke queue.send() separately.
  //
  // The consumer (apps/notificator) writes the notification_event row and
  // subsequently (Phase 2+) runs rule evaluation + channel dispatch.
  // ---------------------------------------------------------------------------
  if (params.notificationQueue !== undefined) {
    const eventKey = params.eventType as string;
    const domain = eventKey.split('.')[0] ?? eventKey;

    const outboxMsg: NotificationOutboxMessage = {
      type: 'notification_event',
      eventId: id,
      eventKey,
      domain,
      aggregateType: params.aggregate,
      aggregateId: params.aggregateId,
      tenantId: params.tenantId,
      actorType: params.actorType ?? 'system',
      payload: params.payload as Record<string, unknown>,
      source: params.source ?? 'api',
      severity: params.severity ?? 'info',
      // exactOptionalPropertyTypes: only include optional fields when defined
      ...(params.actorId !== undefined ? { actorId: params.actorId } : {}),
      ...(params.subjectType !== undefined ? { subjectType: params.subjectType } : {}),
      ...(params.subjectId !== undefined ? { subjectId: params.subjectId } : {}),
      ...(params.correlationId !== undefined ? { correlationId: params.correlationId } : {}),
    };

    await params.notificationQueue.send(outboxMsg);
  }

  return {
    id,
    aggregate: params.aggregate,
    aggregateId: params.aggregateId,
    eventType: params.eventType,
    tenantId: params.tenantId,
    payload: params.payload,
    version,
    createdAt: now,
    // exactOptionalPropertyTypes: only include optional fields when defined
    ...(params.correlationId !== undefined ? { correlationId: params.correlationId } : {}),
    ...(params.source !== undefined ? { source: params.source } : {}),
  };
}

/**
 * Fetch events for an aggregate (ordered by version).
 */
export async function getAggregateEvents<TPayload = Record<string, unknown>>(
  db: D1Like,
  aggregate: string,
  aggregateId: string,
): Promise<DomainEvent<TPayload>[]> {
  const rows = await db
    .prepare(
      `SELECT id, aggregate, aggregate_id, event_type, tenant_id, payload, version,
              datetime(created_at,'unixepoch') AS created_at
       FROM event_log
       WHERE aggregate = ? AND aggregate_id = ?
       ORDER BY version ASC`,
    )
    .bind(aggregate, aggregateId)
    .all<{
      id: string;
      aggregate: string;
      aggregate_id: string;
      event_type: string;
      tenant_id: string;
      payload: string;
      version: number;
      created_at: string;
    }>();

  return rows.results.map((r) => ({
    id: r.id,
    aggregate: r.aggregate,
    aggregateId: r.aggregate_id,
    eventType: r.event_type as EventType,
    tenantId: r.tenant_id,
    payload: JSON.parse(r.payload) as TPayload,
    version: r.version,
    createdAt: r.created_at,
  }));
}
