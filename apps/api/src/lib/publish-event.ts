/**
 * apps/api — publishEvent() helper (N-026, Phase 2).
 *
 * Enqueues a notification event to NOTIFICATION_QUEUE for processing by
 * apps/notificator consumer. Used by auth-routes.ts and other API routes
 * to fire-and-forget notification events instead of calling EmailService directly.
 *
 * Message shape: NotificationQueueMessage (compatible with consumer.ts)
 *
 * Kill-switch: callers check NOTIFICATION_PIPELINE_ENABLED before calling.
 *   "1" → publishEvent()
 *   "0" → legacy EmailService path
 *
 * G1: tenantId is mandatory in every published event.
 * N-011: correlationId propagated from request headers when available.
 */

import type { Env } from '../env.js';

// ---------------------------------------------------------------------------
// PublishEventParams
// ---------------------------------------------------------------------------

export interface PublishEventParams {
  /** event_log-style ID — consumer derives notif_event.id from this (G7 idempotency) */
  eventId: string;
  /** e.g. 'auth.user.password_reset_requested' */
  eventKey: string;
  /** G1: always required */
  tenantId: string;
  /** User who triggered the event (actor) */
  actorId?: string;
  actorType?: 'user' | 'system' | 'admin' | 'unknown';
  /** Subject entity (e.g. the invited user) */
  subjectId?: string;
  subjectType?: string;
  /** Workspace context (for workspace_admins audience types) */
  workspaceId?: string;
  /** Event payload — variables available to template renderer */
  payload?: Record<string, unknown>;
  /** Aggregate context (for domain events using cases / groups pattern) */
  aggregateId?: string;
  aggregateType?: string;
  /** N-011: distributed tracing */
  correlationId?: string;
  /** N-060a: origin tag (default: 'api') */
  source?: string;
  /** 'info' | 'warning' | 'critical' (default: 'info') */
  severity?: 'info' | 'warning' | 'critical';
}

// ---------------------------------------------------------------------------
// publishEvent
// ---------------------------------------------------------------------------

/**
 * Enqueue a notification event to NOTIFICATION_QUEUE.
 *
 * If NOTIFICATION_QUEUE is not bound (local dev, or env does not have the
 * producer binding), the call is a no-op with a console.warn — this prevents
 * hard crashes during development when the queue is not configured.
 *
 * @param env    - Hono env binding (needs NOTIFICATION_QUEUE)
 * @param params - Event parameters
 */
export async function publishEvent(env: Env, params: PublishEventParams): Promise<void> {
  if (!env.NOTIFICATION_QUEUE) {
    console.warn(
      `[publish-event] NOTIFICATION_QUEUE not bound — ` +
      `event ${params.eventKey} (id=${params.eventId}) not enqueued. ` +
      `Add the producer binding to wrangler.toml.`,
    );
    return;
  }

  const message = {
    type: 'notification_event' as const,
    eventId: params.eventId,
    eventKey: params.eventKey,
    tenantId: params.tenantId,           // G1: never omit
    actorId: params.actorId ?? undefined,
    actorType: params.actorType ?? 'user',
    subjectId: params.subjectId ?? undefined,
    subjectType: params.subjectType ?? undefined,
    workspaceId: params.workspaceId ?? undefined,
    payload: params.payload ?? {},
    correlationId: params.correlationId ?? undefined,
    source: params.source ?? 'api',
    severity: params.severity ?? 'info',
  };

  try {
    await env.NOTIFICATION_QUEUE.send(message);
  } catch (err) {
    console.error(
      `[publish-event] NOTIFICATION_QUEUE.send failed — ` +
      `event ${params.eventKey} (id=${params.eventId}): ` +
      `${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
