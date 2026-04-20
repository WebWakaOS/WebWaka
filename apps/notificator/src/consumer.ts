/**
 * apps/notificator — CF Queue consumer (N-012, Phase 1).
 *
 * Processes two message types from NOTIFICATION_QUEUE:
 *   notification_event — written by publishEvent() outbox (N-013)
 *                        or NotificationService.raise() (Phase 2+)
 *   digest_batch       — enqueued by runDigestSweep() CRON (N-012a)
 *
 * Phase 1 pipeline for notification_event messages:
 *   1. Validate required fields (G1: tenant_id, eventId, eventKey)
 *   2. Write notification_event row to D1 (idempotent: INSERT OR IGNORE)
 *   3. Ack message on success
 *   4. On failure: write to notification_audit_log (G9 — never silently discard)
 *   5. Call retry() — CF Queue handles backoff up to max_retries=5
 *
 * Phase 2+: NotificationService.raise() wired to rule eval + channel dispatch.
 * Phase 5 (N-063, N-064): DigestEngine.processDigestBatch() wired.
 *
 * Guardrails enforced:
 *   G1  — all D1 queries include tenant_id (T3 isolation)
 *   G9  — failures written to notification_audit_log before retry
 *   G10 — silent discard FORBIDDEN; retry() on every unhandled error
 *   G24 — sandbox config logged per batch; Phase 7 wires delivery redirect
 */

import type { Env } from './env.js';
import { getSandboxConfig } from './sandbox.js';
import {
  processEvent,
  InAppChannel,
  ResendEmailChannel,
  TemplateRenderer,
} from '@webwaka/notifications';
import type { ProcessEventParams, SandboxConfig, D1LikeFull } from '@webwaka/notifications';

// ---------------------------------------------------------------------------
// NotificationQueueMessage — full shape for both queue message types
//
// Compatible with NotificationOutboxMessage sent by publishEvent() (N-013).
// All optional fields match the outbox message so the consumer can write a
// complete notification_event row without an extra D1 read.
// ---------------------------------------------------------------------------

export interface NotificationQueueMessage {
  /** Discriminator — routes to the correct handler */
  type: 'notification_event' | 'digest_batch';

  // --- notification_event fields ---
  /** event_log.id — used as idempotency key for notification_event row */
  eventId?: string;
  /** e.g. 'auth.user.registered' */
  eventKey?: string;
  /** eventKey.split('.')[0] e.g. 'auth' — derived if absent */
  domain?: string;
  /** e.g. 'user', 'workspace' */
  aggregateType?: string;
  aggregateId?: string;
  /** G1: always required; present in every queue message */
  tenantId: string;
  actorType?: 'user' | 'system' | 'admin' | 'unknown';
  /** G23: anonymized to 'ERASED' on NDPR erasure */
  actorId?: string;
  subjectType?: string;
  subjectId?: string;
  /** Workspace context — used for workspace_admins audience type resolution */
  workspaceId?: string;
  payload?: Record<string, unknown>;
  /** N-011: cross-service distributed tracing */
  correlationId?: string;
  /** NotificationEventSource — origin tag for USSD bypass (G21) */
  source?: string;
  /** 'info' | 'warning' | 'critical' — used for quiet-hours bypass (G12) */
  severity?: string;

  // --- digest_batch fields ---
  /** notification_digest_batch.id */
  batchId?: string;
}

// D1LikeFull is imported from @webwaka/notifications (duck-typed D1Database).
// It extends the Phase 1 D1Like with first<T>() and all<T>() for Phase 2 queries.

// ---------------------------------------------------------------------------
// processQueueBatch — main entry point
// Called by the Worker queue() handler in src/index.ts
// ---------------------------------------------------------------------------

/**
 * Process a batch of queue messages from NOTIFICATION_QUEUE.
 *
 * N-012 (Phase 1): Full consumer implementation.
 *   - Kill-switch guard: acks all without processing when NOTIFICATION_PIPELINE_ENABLED='0'
 *   - Sandbox config logged per batch (G24)
 *   - Routes notification_event → processNotificationEvent()
 *   - Routes digest_batch → processDigestBatch()
 *   - Acks on success; writes audit log + retries on failure (G9, G10)
 */
export async function processQueueBatch(
  batch: MessageBatch<NotificationQueueMessage>,
  env: Env,
): Promise<void> {
  const sandboxConfig = getSandboxConfig(env);

  console.log(
    `[notificator:consumer] batch received — size=${batch.messages.length} ` +
    `sandbox=${sandboxConfig.enabled} pipeline=${env.NOTIFICATION_PIPELINE_ENABLED}`,
  );

  // N-009 kill-switch: pipeline disabled — ack without processing.
  // Prevents queue buildup when the pipeline is not yet ready for traffic.
  if (env.NOTIFICATION_PIPELINE_ENABLED !== '1') {
    console.log(
      '[notificator:consumer] NOTIFICATION_PIPELINE_ENABLED=0 — ' +
      'messages acknowledged without processing',
    );
    batch.ackAll();
    return;
  }

  // Phase 2: Build channels once per batch (G3: platform sender; G24: sandbox redirect)
  const db = env.DB as unknown as D1LikeFull;
  const channels = [
    new InAppChannel(db),
    new ResendEmailChannel(env.RESEND_API_KEY),
  ];

  // Phase 3: Build TemplateRenderer once per batch (N-030, N-039).
  // Uses DB-backed templates + brand context + signed unsubscribe tokens.
  // Falls back gracefully to Phase 2 renderPhase2() if renderer is not passed.
  const templateRenderer = new TemplateRenderer({
    db,
    ...(env.UNSUBSCRIBE_HMAC_SECRET !== undefined
      ? { unsubscribeSecret: env.UNSUBSCRIBE_HMAC_SECRET }
      : {}),
    ...(env.PLATFORM_BASE_URL !== undefined
      ? { platformBaseUrl: env.PLATFORM_BASE_URL }
      : {}),
    // NOTIFICATION_KV is used for brand context caching (G4).
    // KVNamespace is structurally compatible with the kv option type.
    kv: env.NOTIFICATION_KV as {
      get(key: string, format: 'json'): Promise<unknown>;
      put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
    },
    platformName: 'WebWaka',
  });

  // Phase 2: Build sandbox config for G24 redirect
  const notifSandbox: SandboxConfig = {
    enabled: sandboxConfig.enabled,
    ...(sandboxConfig.enabled && env.NOTIFICATION_SANDBOX_EMAIL
      ? { sandboxRecipient: { email: env.NOTIFICATION_SANDBOX_EMAIL } }
      : {}),
  };

  for (const msg of batch.messages) {
    const body = msg.body;
    const logPrefix =
      `[notificator:consumer] type=${body.type} tenant=${body.tenantId}`;

    try {
      if (body.type === 'notification_event') {
        // Phase 1: Write notification_event row (idempotent INSERT OR IGNORE)
        await processNotificationEvent(body, db);

        // Phase 2: Run full notification pipeline (rule eval → audience → dispatch)
        // The notif_event row is now written; processEvent marks processed_at on completion.
        const notifEventId = `notif_${body.eventId!}`;
        const phase2Params: ProcessEventParams = {
          notifEventId,
          eventKey: body.eventKey!,
          tenantId: body.tenantId,
          actorId: body.actorId ?? null,
          actorType: body.actorType ?? 'system',
          subjectId: body.subjectId ?? null,
          subjectType: body.subjectType ?? null,
          workspaceId: body.workspaceId ?? null,
          payload: body.payload ?? {},
          source: body.source ?? 'queue_consumer',
          severity: body.severity ?? 'info',
          correlationId: body.correlationId ?? null,
        };
        await processEvent(phase2Params, db, channels, notifSandbox, templateRenderer);

        console.log(
          `${logPrefix} eventKey=${body.eventKey ?? 'unknown'} ` +
          `eventId=${body.eventId ?? 'unknown'} — pipeline complete`,
        );
      } else if (body.type === 'digest_batch') {
        await processDigestBatch(body, db);
        console.log(
          `${logPrefix} batchId=${body.batchId ?? 'unknown'} ` +
          `— digest_batch logged (Phase 5 DigestEngine pending)`,
        );
      } else {
        // Unknown type: ack to prevent permanent DLQ buildup.
        // Logged as warning for ops visibility.
        console.warn(
          `${logPrefix} unknown message type — acknowledging to prevent DLQ buildup`,
        );
      }
      msg.ack();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`${logPrefix} processing failed — ${errorMessage}`);

      // G9: Never silently discard a failed message.
      // Write a failure record to the audit log before retrying.
      await writeFailureAuditLog(body, errorMessage, db).catch((auditErr) => {
        // Audit write failure is non-fatal — still retry the original message.
        // Ops can detect silent discard risk via absence of audit records.
        console.error(`${logPrefix} audit log write failed — ${String(auditErr)}`);
      });

      // G10: retry() — CF Queue handles exponential backoff up to max_retries=5.
      // After max_retries, CF Queue drops the message. Phase 7 adds DLQ inspector.
      msg.retry();
    }
  }
}

// ---------------------------------------------------------------------------
// processNotificationEvent — write notification_event row (Phase 1)
// ---------------------------------------------------------------------------

/**
 * Write a notification_event row to D1 from a Queue message.
 *
 * Idempotent: notification_event.id is derived deterministically from eventId
 * (`notif_` + eventId → `notif_evt_xxxx`). INSERT OR IGNORE ensures retries
 * do not create duplicate rows. The first successful write wins.
 *
 * Phase 1: Writes the event record only (processed_at = NULL).
 * Phase 2+: Rule evaluation, audience resolution, channel dispatch wired here.
 *           processed_at is set after full pipeline completes.
 *
 * @param msg - Queue message body (type = 'notification_event')
 * @param db  - D1 database binding (G1: tenant_id in every query)
 * @throws    If required fields are missing (tenant_id, eventId, eventKey)
 */
export async function processNotificationEvent(
  msg: NotificationQueueMessage,
  db: D1LikeFull,
): Promise<void> {
  // G1: tenant_id always required. Hard reject to surface misconfiguration fast.
  if (!msg.tenantId) {
    throw new Error('processNotificationEvent: tenantId is required (G1 violation)');
  }
  if (!msg.eventId) {
    throw new Error('processNotificationEvent: eventId is required');
  }
  if (!msg.eventKey) {
    throw new Error('processNotificationEvent: eventKey is required');
  }

  // Derive notification_event.id deterministically from eventId for idempotency.
  // Pattern: 'evt_abc123' → 'notif_evt_abc123'
  // Matches the migration id prefix convention ('notif_evt_' + uuid).
  const notifEventId = `notif_${msg.eventId}`;

  // Derive domain and aggregateType from eventKey if not provided in message.
  // e.g. 'auth.user.registered' → domain='auth', aggregateType='user'
  const parts = msg.eventKey.split('.');
  const domain = msg.domain ?? parts[0] ?? msg.eventKey;
  const aggregateType = msg.aggregateType ?? parts[1] ?? 'unknown';
  const aggregateId = msg.aggregateId ?? 'unknown';
  const actorType = msg.actorType ?? 'system';
  const source = msg.source ?? 'queue_consumer';
  const severity = msg.severity ?? 'info';
  const payloadJson = JSON.stringify(msg.payload ?? {});

  // INSERT OR IGNORE: idempotent on retries — same notifEventId skips duplicate.
  // G1: tenant_id is explicitly included in the row (enforced by table CHECK).
  await db
    .prepare(
      `INSERT OR IGNORE INTO notification_event (
        id, event_key, domain, aggregate_type, aggregate_id,
        tenant_id, actor_type, actor_id, subject_type, subject_id,
        payload, correlation_id, source, severity, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      notifEventId,
      msg.eventKey,
      domain,
      aggregateType,
      aggregateId,
      msg.tenantId,      // G1
      actorType,
      msg.actorId ?? null,
      msg.subjectType ?? null,
      msg.subjectId ?? null,
      payloadJson,
      msg.correlationId ?? null,
      source,
      severity,
    )
    .run();
}

// ---------------------------------------------------------------------------
// processDigestBatch — Phase 5 stub (N-063, N-064)
// ---------------------------------------------------------------------------

/**
 * Handle a digest_batch queue message.
 *
 * Phase 1: Logs the batch receipt and validates tenant_id (G1). No-op.
 * Phase 5 (N-063): DigestEngine.processDigestBatch() wired here to read
 *   notification_digest_batch_item rows and build the digest payload.
 *
 * @param msg - Queue message body (type = 'digest_batch')
 * @param db  - D1 database binding (G1: tenant_id in every query)
 */
export async function processDigestBatch(
  msg: NotificationQueueMessage,
  db: D1LikeFull,
): Promise<void> {
  void db; // Phase 5 will query notification_digest_batch_item rows here

  // G1: tenant_id always required on digest batch messages (G12).
  if (!msg.tenantId) {
    throw new Error('processDigestBatch: tenantId is required (G1 / G12 violation)');
  }

  console.log(
    `[notificator:consumer] digest_batch queued for processing — ` +
    `batchId=${msg.batchId ?? 'unknown'} tenant=${msg.tenantId} ` +
    `(Phase 5 DigestEngine pending)`,
  );
}

// ---------------------------------------------------------------------------
// writeFailureAuditLog — G9 compliance: never silently discard failures
// ---------------------------------------------------------------------------

/**
 * Write a failure entry to notification_audit_log.
 * Called before retrying a failed message (G9 — never silently discard).
 *
 * Uses event_type='notification.failed' — valid per audit_log CHECK constraint.
 * notification_event_id is populated when eventId is available in the message,
 * allowing cross-reference from audit to notification_event row.
 *
 * @param msg          - The failed queue message
 * @param errorMessage - The error that caused the failure (truncated to 2000 chars)
 * @param db           - D1 database binding
 */
async function writeFailureAuditLog(
  msg: NotificationQueueMessage,
  errorMessage: string,
  db: D1LikeFull,
): Promise<void> {
  const auditId = `audit_notif_${crypto.randomUUID().replace(/-/g, '')}`;

  // Derive notification_event_id if available (same derivation as processNotificationEvent)
  const notifEventId = msg.eventId !== undefined ? `notif_${msg.eventId}` : null;

  // Include error message inside metadata JSON — the audit_log table has no
  // dedicated error_message column; metadata (TEXT) holds structured context.
  const metadata = JSON.stringify({
    messageType: msg.type,
    eventId: msg.eventId ?? null,
    eventKey: msg.eventKey ?? null,
    batchId: msg.batchId ?? null,
    source: msg.source ?? null,
    errorMessage: errorMessage.slice(0, 2000), // Guard: truncate long stack traces
  });

  // Positional binds (4 × ?):
  //   1 → id, 2 → tenant_id, 3 → notification_event_id, 4 → metadata
  await db
    .prepare(
      `INSERT INTO notification_audit_log (
        id, tenant_id, event_type, channel,
        notification_event_id, delivery_id,
        metadata, created_at
      ) VALUES (?, ?, 'notification.failed', NULL, ?, NULL, ?, unixepoch())`,
    )
    .bind(
      auditId,
      msg.tenantId,
      notifEventId,
      metadata,
    )
    .run();
}
