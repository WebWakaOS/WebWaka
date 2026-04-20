/**
 * @webwaka/notifications — NDPR Erasure Propagation Service (N-116, Phase 8).
 *
 * G23: NDPR erasure requests must propagate to all notification tables within 24 hours.
 *
 * Erasure actions per table (per spec Section 7 / OQ-006):
 *   notification_audit_log        → Zero actor_id and recipient_id to 'ERASED' — NEVER delete rows
 *   notification_delivery         → Hard-delete rows where recipient_id = userId
 *   notification_inbox_item       → Hard-delete rows where user_id = userId
 *   notification_event            → Hard-delete rows where actor_id = userId
 *   notification_preference       → Hard-delete rows where scope_type='user' AND scope_id = userId
 *   notification_subscription     → Hard-delete rows where user_id = userId
 *   notification_suppression_list → DO NOT touch (G23: suppression must persist past account deletion)
 *   notification_wa_approval_log  → Platform record; no PII to erase
 *
 * G1:  All queries include AND tenant_id = :tenantId (T3 isolation).
 * G23: Audit log rows ZEROED only — never deleted. All other tables HARD-DELETE.
 *
 * Called by DELETE /auth/me after the core user record is anonymized.
 * This function is intentionally fire-and-forget-safe: the caller should not block
 * the HTTP response on this. However, failures MUST be logged.
 */

import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// ErasureResult — counts of affected rows per table for observability
// ---------------------------------------------------------------------------

export interface ErasureResult {
  /** notification_audit_log rows with PII zeroed (not deleted) */
  auditLogRowsZeroed: number;
  /** notification_delivery rows hard-deleted */
  deliveriesDeleted: number;
  /** notification_inbox_item rows hard-deleted */
  inboxItemsDeleted: number;
  /** notification_event rows hard-deleted */
  eventsDeleted: number;
  /** notification_preference rows hard-deleted (user-scope only) */
  preferencesDeleted: number;
  /** notification_subscription rows hard-deleted */
  subscriptionsDeleted: number;
}

// ---------------------------------------------------------------------------
// propagateErasure — N-116 core function (testable, accepts D1LikeFull)
// ---------------------------------------------------------------------------

/**
 * Propagate an NDPR erasure request across all notification tables.
 *
 * This is the single authoritative erasure path for the notification engine.
 * All operations are scoped to the (userId, tenantId) pair (G1).
 *
 * @param db       - D1 database binding (from env.DB)
 * @param userId   - The platform user ID being erased (from JWT auth.userId)
 * @param tenantId - The tenant scope (from JWT auth.tenantId, enforces G1)
 * @returns ErasureResult with row counts for audit logging
 *
 * @throws if any D1 statement fails — caller should catch and log
 */
export async function propagateErasure(
  db: D1LikeFull,
  userId: string,
  tenantId: string,
): Promise<ErasureResult> {
  // ---------------------------------------------------------------------------
  // Step 1: Zero-out PII fields in notification_audit_log — NEVER delete rows.
  // G23: actor_id and recipient_id zeroed to 'ERASED'; row preserved for accountability.
  // ---------------------------------------------------------------------------
  const auditUpdateResult = await db
    .prepare(
      `UPDATE notification_audit_log
       SET actor_id     = CASE WHEN actor_id     = ? THEN 'ERASED' ELSE actor_id     END,
           recipient_id = CASE WHEN recipient_id = ? THEN 'ERASED' ELSE recipient_id END
       WHERE tenant_id = ?
         AND (actor_id = ? OR recipient_id = ?)`,
    )
    .bind(userId, userId, tenantId, userId, userId)
    .run();

  const auditLogRowsZeroed = auditUpdateResult.meta?.changes ?? 0;

  // ---------------------------------------------------------------------------
  // Step 2: Hard-delete notification_delivery rows for this user.
  // The recipient_id in notification_delivery is the userId (not email/phone — G23).
  // ---------------------------------------------------------------------------
  const deliveryResult = await db
    .prepare(
      `DELETE FROM notification_delivery
       WHERE tenant_id    = ?
         AND recipient_id = ?`,
    )
    .bind(tenantId, userId)
    .run();

  const deliveriesDeleted = deliveryResult.meta?.changes ?? 0;

  // ---------------------------------------------------------------------------
  // Step 3: Hard-delete notification_inbox_item rows for this user.
  // ---------------------------------------------------------------------------
  const inboxResult = await db
    .prepare(
      `DELETE FROM notification_inbox_item
       WHERE tenant_id = ?
         AND user_id   = ?`,
    )
    .bind(tenantId, userId)
    .run();

  const inboxItemsDeleted = inboxResult.meta?.changes ?? 0;

  // ---------------------------------------------------------------------------
  // Step 4: Hard-delete notification_event rows where actor_id = userId.
  // Spec says "Anonymize actor_id on user erasure" — interpreted as hard-delete
  // of all events originated by this user within this tenant. The event record
  // itself carries no delivery state; audit_log rows capture the compliance trail.
  // ---------------------------------------------------------------------------
  const eventResult = await db
    .prepare(
      `DELETE FROM notification_event
       WHERE tenant_id = ?
         AND actor_id  = ?`,
    )
    .bind(tenantId, userId)
    .run();

  const eventsDeleted = eventResult.meta?.changes ?? 0;

  // ---------------------------------------------------------------------------
  // Step 5: Hard-delete notification_preference rows for this user (user-scope only).
  // G1: tenantId scoping. scope_type='user' AND scope_id=userId targets only
  // user-level preferences; platform/tenant/role-scope preferences are not deleted.
  // ---------------------------------------------------------------------------
  const prefResult = await db
    .prepare(
      `DELETE FROM notification_preference
       WHERE tenant_id  = ?
         AND scope_type = 'user'
         AND scope_id   = ?`,
    )
    .bind(tenantId, userId)
    .run();

  const preferencesDeleted = prefResult.meta?.changes ?? 0;

  // ---------------------------------------------------------------------------
  // Step 6: Hard-delete notification_subscription rows for this user.
  // G23: unsubscribed state for the user's address hash is preserved in
  // notification_suppression_list (not touched here).
  // ---------------------------------------------------------------------------
  const subResult = await db
    .prepare(
      `DELETE FROM notification_subscription
       WHERE tenant_id = ?
         AND user_id   = ?`,
    )
    .bind(tenantId, userId)
    .run();

  const subscriptionsDeleted = subResult.meta?.changes ?? 0;

  // ---------------------------------------------------------------------------
  // Step 7: notification_suppression_list — NOT touched.
  // G23: "Suppression list entries must not be deleted (suppression must persist
  // past account deletion)." Address hashes are anonymous; no PII to erase.
  // ---------------------------------------------------------------------------

  return {
    auditLogRowsZeroed,
    deliveriesDeleted,
    inboxItemsDeleted,
    eventsDeleted,
    preferencesDeleted,
    subscriptionsDeleted,
  };
}
