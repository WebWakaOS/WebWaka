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
  TermiiSmsChannel,
  MetaWhatsAppChannel,
  Dialog360WhatsAppChannel,
  TelegramChannel,
  FcmPushChannel,
  SlackWebhookChannel,
  TeamsWebhookChannel,
  TemplateRenderer,
} from '@webwaka/notifications';
import type { ProcessEventParams, SandboxConfig, D1LikeFull } from '@webwaka/notifications';
import { processDigestBatch as engineProcessDigestBatch } from '@webwaka/notifications';
import { PreferenceService } from '@webwaka/notifications';
import { DigestService } from '@webwaka/notifications';

// ---------------------------------------------------------------------------
// NotificationQueueMessage — full shape for both queue message types
//
// Compatible with NotificationOutboxMessage sent by publishEvent() (N-013).
// All optional fields match the outbox message so the consumer can write a
// complete notification_event row without an extra D1 read.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// WebhookRetryMessage — N-131 (Phase 4) webhook delivery retry from CF Queue
// ---------------------------------------------------------------------------

export interface WebhookRetryMessage {
  type: 'webhook_delivery';
  deliveryId: string;
  subscriptionId: string;
  tenantId: string;
  url: string;
  payloadStr: string;
  secret: string;
  attempt: number;
}

// ---------------------------------------------------------------------------
// NotificationQueueMessage — full shape for all queue message types
// ---------------------------------------------------------------------------

export interface NotificationQueueMessage {
  /** Discriminator — routes to the correct handler */
  type: 'notification_event' | 'digest_batch' | 'webhook_delivery';

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

  // --- webhook_delivery fields (N-131, Phase 4) ---
  /** notification_delivery.id for this webhook delivery attempt */
  deliveryId?: string;
  subscriptionId?: string;
  url?: string;
  payloadStr?: string;
  secret?: string;
  attempt?: number;
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

  // Phase 2-4: Build channels once per batch (G3: platform sender; G24: sandbox redirect)
  // Phase 4 (N-042–N-049): All external channel providers wired here.
  const db = env.DB as unknown as D1LikeFull;
  const kvLike = env.NOTIFICATION_KV as {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  };

  const masterKeySpread = env.NOTIFICATION_KV_MASTER_KEY !== undefined
    ? { masterKey: env.NOTIFICATION_KV_MASTER_KEY } as const
    : ({} as Record<string, never>);

  const channels = [
    new InAppChannel(db),

    // N-042: Per-tenant FROM address + credentials from KV (G3, G16 ADL-002)
    new ResendEmailChannel({
      ...(env.RESEND_API_KEY !== undefined ? { platformApiKey: env.RESEND_API_KEY } : {}),
      db,
      kv: kvLike,
      ...masterKeySpread,
    }),

    // N-043: Termii SMS (Nigerian networks, CBN R8 OTP)
    new TermiiSmsChannel({
      ...(env.TERMII_API_KEY !== undefined ? { platformApiKey: env.TERMII_API_KEY } : {}),
      ...(env.TERMII_SENDER_ID !== undefined ? { platformSenderId: env.TERMII_SENDER_ID } : {}),
      db,
      kv: kvLike,
      ...masterKeySpread,
    }),

    // N-044: Meta WhatsApp (G17: meta_approved gate)
    new MetaWhatsAppChannel({
      ...(env.META_WA_ACCESS_TOKEN !== undefined ? { platformApiKey: env.META_WA_ACCESS_TOKEN } : {}),
      ...(env.META_WA_PHONE_NUMBER_ID !== undefined ? { platformPhoneNumberId: env.META_WA_PHONE_NUMBER_ID } : {}),
      db,
      kv: kvLike,
      ...masterKeySpread,
    }),

    // N-045: 360dialog WhatsApp (G17: meta_approved gate)
    new Dialog360WhatsAppChannel({
      ...(env.DIALOG360_API_KEY !== undefined ? { platformApiKey: env.DIALOG360_API_KEY } : {}),
      db,
      kv: kvLike,
      ...masterKeySpread,
    }),

    // N-046: Telegram messaging
    new TelegramChannel({
      ...(env.TELEGRAM_BOT_TOKEN !== undefined ? { platformBotToken: env.TELEGRAM_BOT_TOKEN } : {}),
      db,
      kv: kvLike,
      ...masterKeySpread,
    }),

    // N-047: FCM v1 push notifications (G22: Phase 5 wires low_data_mode)
    new FcmPushChannel({
      ...(env.FCM_ACCESS_TOKEN !== undefined ? { platformAccessToken: env.FCM_ACCESS_TOKEN } : {}),
      ...(env.FCM_PROJECT_ID !== undefined ? { platformProjectId: env.FCM_PROJECT_ID } : {}),
      db,
      kv: kvLike,
      ...masterKeySpread,
    }),

    // N-048: Slack webhook (system alerts; N-055 replaces ALERT_WEBHOOK_URL)
    new SlackWebhookChannel({
      ...(env.SLACK_ALERT_WEBHOOK_URL !== undefined ? { platformWebhookUrl: env.SLACK_ALERT_WEBHOOK_URL } : {}),
      db,
      kv: kvLike,
      ...masterKeySpread,
    }),

    // N-049: Teams webhook (system alerts)
    new TeamsWebhookChannel({
      ...(env.TEAMS_ALERT_WEBHOOK_URL !== undefined ? { platformWebhookUrl: env.TEAMS_ALERT_WEBHOOK_URL } : {}),
      db,
      kv: kvLike,
      ...masterKeySpread,
    }),
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

  // Phase 2: Build sandbox config for G24 redirect (N-111).
  // Passes all three channel addresses so resolveSandboxRecipient() can redirect
  // email → NOTIFICATION_SANDBOX_EMAIL, sms → NOTIFICATION_SANDBOX_PHONE,
  // push → NOTIFICATION_SANDBOX_PUSH_TOKEN.
  const sandboxRecipient = sandboxConfig.enabled
    ? {
        ...(env.NOTIFICATION_SANDBOX_EMAIL !== undefined ? { email: env.NOTIFICATION_SANDBOX_EMAIL } : {}),
        ...(env.NOTIFICATION_SANDBOX_PHONE !== undefined ? { phone: env.NOTIFICATION_SANDBOX_PHONE } : {}),
        ...(env.NOTIFICATION_SANDBOX_PUSH_TOKEN !== undefined ? { pushToken: env.NOTIFICATION_SANDBOX_PUSH_TOKEN } : {}),
      }
    : undefined;
  const notifSandbox: SandboxConfig = {
    enabled: sandboxConfig.enabled,
    ...(sandboxRecipient !== undefined ? { sandboxRecipient } : {}),
  };

  // Phase 5 (N-060, N-063): Build preference + digest services once per batch.
  // Shared KV supports preference caching (N-061) and unread-count cache (N-067).
  const kvForPref = env.NOTIFICATION_KV as {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
    delete(key: string): Promise<void>;
  };
  const preferenceService = new PreferenceService(db, kvForPref);
  const digestService = new DigestService(db);

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
        // Phase 5 (N-060, N-062, N-063): pass preference + digest services.
        await processEvent(phase2Params, db, channels, notifSandbox, templateRenderer, {
          preferenceService,
          digestService,
        });

        console.log(
          `${logPrefix} eventKey=${body.eventKey ?? 'unknown'} ` +
          `eventId=${body.eventId ?? 'unknown'} — pipeline complete`,
        );
      } else if (body.type === 'digest_batch') {
        // Phase 5 (N-064): real DigestEngine.processDigestBatch() now wired.
        await processDigestBatch(body, db, channels, notifSandbox);
        console.log(
          `${logPrefix} batchId=${body.batchId ?? 'unknown'} ` +
          `— digest_batch processed`,
        );
      } else if (body.type === 'webhook_delivery') {
        // N-131 (Phase 4): Process webhook delivery retry from CF Queue.
        // On failure, throws to let CF Queue retry (max_retries=5).
        await processWebhookDeliveryRetry(body as WebhookRetryMessage, db);
        console.log(
          `${logPrefix} deliveryId=${body.deliveryId ?? 'unknown'} ` +
          `url=${body.url ?? 'unknown'} — webhook_delivery attempt=${body.attempt ?? 1} complete`,
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
      // After max_retries, CF Queue drops the message.
      // M-8: Log dead-letter-candidate events for messages approaching max retries.
      const attempts = (msg as unknown as { attempts?: number }).attempts || 0;
      if (attempts >= 4) {
        // This is likely the final retry (max_retries=5). Log as DLQ candidate.
        console.error(JSON.stringify({
          event: 'notification_dead_letter_candidate',
          message_id: body.eventId || 'unknown',
          tenant_id: body.tenantId || 'unknown',
          event_key: body.eventKey || body.type || 'unknown',
          error: errorMessage,
          attempts: attempts + 1,
          timestamp: new Date().toISOString(),
        }));
      }
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
  channels: import('@webwaka/notifications').INotificationChannel[] = [],
  sandbox: SandboxConfig = { enabled: false },
): Promise<void> {
  // G1/G12: tenant_id always required on digest batch messages.
  if (!msg.tenantId) {
    throw new Error('processDigestBatch: tenantId is required (G1 / G12 violation)');
  }
  if (!msg.batchId) {
    throw new Error('processDigestBatch: batchId is required for digest_batch messages');
  }

  // Phase 5 (N-064): call the real DigestEngine
  await engineProcessDigestBatch(db, msg.batchId, {
    tenantId: msg.tenantId,
    channels,
    sandbox: {
      enabled: sandbox.enabled,
      ...(sandbox.sandboxRecipient !== undefined ? { sandboxRecipient: sandbox.sandboxRecipient } : {}),
    },
  });
}

// ---------------------------------------------------------------------------
// processWebhookDeliveryRetry — N-131 (Phase 4)
// ---------------------------------------------------------------------------

/**
 * Process a webhook_delivery retry message from the CF Queue (N-131).
 *
 * Called when the primary WebhookDispatcher dispatch attempt failed.
 * Makes one delivery attempt; on failure throws to let CF Queue retry.
 * CF Queue handles exponential backoff (max_retries=5 in wrangler.toml).
 *
 * This function is inlined here (rather than importing from apps/api) because
 * CF Workers are isolated — cross-app imports are not possible at runtime.
 * apps/api/src/lib/webhook-dispatcher.ts has the identical implementation
 * used for standalone testing; they must be kept in sync.
 *
 * @param message - WebhookRetryMessage from CF Queue
 * @param db      - D1 database binding (G1: tenant_id in all queries)
 */
export async function processWebhookDeliveryRetry(
  message: WebhookRetryMessage,
  db: D1LikeFull,
): Promise<void> {
  const { deliveryId, url, payloadStr, secret, attempt, tenantId } = message;

  const signature = await signWebhookPayload(secret, payloadStr);
  const result = await attemptWebhookDelivery(url, payloadStr, signature, deliveryId);

  const now = Math.floor(Date.now() / 1000);

  if (result.ok) {
    await db
      .prepare(
        `UPDATE webhook_deliveries
            SET status = 'delivered', attempts = ?, delivered_at = ?, updated_at = ?
          WHERE id = ? AND tenant_id = ?`,
      )
      .bind(attempt + 1, now, now, deliveryId, tenantId)
      .run();
    return;
  }

  // Update attempt count on failure — CF Queue retries the message
  await db
    .prepare(
      `UPDATE webhook_deliveries
          SET attempts = ?, last_error = ?, updated_at = ?
        WHERE id = ? AND tenant_id = ?`,
    )
    .bind(attempt + 1, result.error, now, deliveryId, tenantId)
    .run();

  // Throw to signal CF Queue to retry
  throw new Error(
    `[webhook-delivery] attempt failed — ` +
    `deliveryId=${deliveryId} attempt=${attempt + 1} error=${result.error ?? 'unknown'}`,
  );
}

async function signWebhookPayload(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256=${hex}`;
}

async function attemptWebhookDelivery(
  url: string,
  payloadStr: string,
  signature: string,
  deliveryId: string,
): Promise<{ ok: boolean; error: string | null }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WebWaka-Signature': signature,
        'X-WebWaka-Delivery-Id': deliveryId,
        'X-WebWaka-Timestamp': String(Date.now()),
        'User-Agent': 'WebWaka-Webhooks/1.0',
      },
      body: payloadStr,
    });
    if (res.ok) return { ok: true, error: null };
    return { ok: false, error: `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network error' };
  }
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
