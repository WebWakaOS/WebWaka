/**
 * @webwaka/notifications — Delivery service (N-023, Phase 2).
 *
 * Manages the notification_delivery lifecycle:
 *   - createDeliveryRow()  — inserts a new delivery in 'queued' status (G7: idempotency)
 *   - updateDeliveryStatus() — transitions delivery FSM (queued→dispatched→delivered/failed)
 *   - markDeadLettered()   — terminal failure after max retries (G10)
 *
 * Delivery lifecycle FSM:
 *   queued → rendering → dispatched → delivered
 *                                   ↘ failed → (retry) → dead_lettered
 *   queued → suppressed             (G20: suppression detected)
 *
 * Guardrails:
 *   G1  — tenant_id in every query
 *   G7  — idempotency_key UNIQUE; INSERT OR IGNORE prevents duplicates
 *   G10 — dead_lettered status for terminal failures
 *   G24 — sandbox_redirect tracked per delivery
 */

import type { D1LikeFull } from './db-types.js';
import type { NotificationChannel } from './types.js';

// ---------------------------------------------------------------------------
// CreateDeliveryParams
// ---------------------------------------------------------------------------

export interface CreateDeliveryParams {
  deliveryId: string;
  notifEventId: string;
  tenantId: string;
  recipientId: string;
  recipientType: 'user' | 'admin' | 'system';
  channel: NotificationChannel;
  provider: string;
  templateId: string;
  idempotencyKey: string;
  source: string;
  correlationId?: string;
  sandboxRedirect?: boolean;
  sandboxOriginalRecipientHash?: string;
}

// ---------------------------------------------------------------------------
// UpdateDeliveryParams
// ---------------------------------------------------------------------------

export interface UpdateDeliveryParams {
  deliveryId: string;
  status:
    | 'rendering'
    | 'dispatched'
    | 'delivered'
    | 'failed'
    | 'suppressed'
    | 'dead_lettered';
  providerMessageId?: string;
  lastError?: string;
  attempts?: number;
  senderFallbackUsed?: boolean;
}

// ---------------------------------------------------------------------------
// createDeliveryRow (G7: INSERT OR IGNORE for idempotency)
// ---------------------------------------------------------------------------

/**
 * Insert a notification_delivery row with status='queued'.
 *
 * Uses INSERT OR IGNORE: duplicate eventId+recipientId+channel combination
 * (same idempotency_key) is silently skipped. This is G7 enforcement —
 * duplicate events cannot produce duplicate deliveries.
 *
 * @returns deliveryId — the ID of the newly created (or existing) row
 */
export async function createDeliveryRow(
  db: D1LikeFull,
  params: CreateDeliveryParams,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT OR IGNORE INTO notification_delivery (
        id, notification_event_id, tenant_id,
        recipient_id, recipient_type,
        channel, provider, template_id,
        status, attempts,
        source, sender_fallback_used,
        sandbox_redirect, sandbox_original_recipient_hash,
        idempotency_key, correlation_id,
        created_at, queued_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'queued', 0, ?, 0, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      params.deliveryId,
      params.notifEventId,
      params.tenantId,           // G1
      params.recipientId,
      params.recipientType,
      params.channel,
      params.provider,
      params.templateId,
      params.source,
      params.sandboxRedirect ? 1 : 0,
      params.sandboxOriginalRecipientHash ?? null,
      params.idempotencyKey,
      params.correlationId ?? null,
      now,
      now,
    )
    .run();
}

// ---------------------------------------------------------------------------
// updateDeliveryStatus
// ---------------------------------------------------------------------------

/**
 * Transition a delivery row to a new status.
 * Sets the appropriate timestamp column based on the new status.
 *
 * G1: tenant_id is used as defense-in-depth in the WHERE clause.
 */
export async function updateDeliveryStatus(
  db: D1LikeFull,
  tenantId: string,
  params: UpdateDeliveryParams,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  // Determine which timestamp column to set based on the new status
  let timestampClause = '';
  if (params.status === 'dispatched') {
    timestampClause = ', dispatched_at = ?';
  } else if (params.status === 'delivered') {
    timestampClause = ', delivered_at = ?';
  } else if (params.status === 'failed' || params.status === 'dead_lettered') {
    timestampClause = ', failed_at = ?';
  }

  const sql = `
    UPDATE notification_delivery
    SET status = ?,
        provider_message_id = COALESCE(?, provider_message_id),
        last_error = ?,
        attempts = attempts + ?,
        sender_fallback_used = CASE WHEN ? = 1 THEN 1 ELSE sender_fallback_used END
        ${timestampClause}
    WHERE id = ? AND tenant_id = ?`;

  const bindings: unknown[] = [
    params.status,
    params.providerMessageId ?? null,
    params.lastError ?? null,
    params.attempts ?? 0,
    params.senderFallbackUsed ? 1 : 0,
  ];

  if (timestampClause) {
    bindings.push(now);
  }
  bindings.push(params.deliveryId, tenantId);

  await db.prepare(sql).bind(...bindings).run();
}

// ---------------------------------------------------------------------------
// markNotifEventProcessed
// ---------------------------------------------------------------------------

/**
 * Mark a notification_event row as fully processed.
 * Called after all rules × audiences × channels have been dispatched.
 *
 * G1: tenantId in WHERE clause.
 */
export async function markNotifEventProcessed(
  db: D1LikeFull,
  notifEventId: string,
  tenantId: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE notification_event
       SET processed_at = unixepoch()
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(notifEventId, tenantId)
    .run();
}
