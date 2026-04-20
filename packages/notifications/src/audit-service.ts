/**
 * @webwaka/notifications — Audit service (N-027, Phase 2).
 *
 * Writes append-only entries to notification_audit_log.
 * Called for every send attempt — success, failure, suppression, dead-letter.
 *
 * G9 (OQ-003): All notification send attempts MUST produce an audit log entry.
 *              Silent discard is FORBIDDEN.
 * G23 (NDPR): actor_id and recipient_id are NEVER raw addresses. For NDPR
 *              erasure, these fields are zeroed to 'ERASED' (not deleted).
 *              This write path always stores userId (never email address).
 *
 * Retention: PERMANENT (7 years per CBN directive per spec Section 5.1).
 * The audit_log table has NO delete path (except NDPR field-zeroing).
 */

import type { D1LikeFull } from './db-types.js';
import type { AuditLogEntry } from './types.js';

// ---------------------------------------------------------------------------
// writeAuditLog
// ---------------------------------------------------------------------------

/**
 * Append a single entry to notification_audit_log.
 *
 * G1: entry.tenantId is written to the tenant_id column; required by caller.
 * G9: caller is responsible for calling this for every send attempt.
 * G23: actor_id and recipient_id must be userId (never email/phone).
 *
 * @throws if the D1 INSERT fails — caller should handle gracefully
 */
export async function writeAuditLog(
  db: D1LikeFull,
  entry: AuditLogEntry,
): Promise<void> {
  const auditId = `audit_notif_${crypto.randomUUID().replace(/-/g, '')}`;

  const metadataJson = entry.metadata != null
    ? JSON.stringify(entry.metadata)
    : null;

  await db
    .prepare(
      `INSERT INTO notification_audit_log (
        id, tenant_id, event_type,
        actor_id, recipient_id,
        channel,
        notification_event_id, delivery_id,
        metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      auditId,
      entry.tenantId,            // G1
      entry.eventType,
      entry.actorId ?? null,     // G23: userId only, never email
      entry.recipientId ?? null, // G23: userId only, never email
      entry.channel ?? null,
      entry.notificationEventId ?? null,
      entry.deliveryId ?? null,
      metadataJson,
    )
    .run();
}
