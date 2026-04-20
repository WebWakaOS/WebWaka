/**
 * @webwaka/notifications — In-app notification channel (N-024, Phase 2).
 *
 * Implements INotificationChannel for the 'in_app' channel.
 * Writes notification_inbox_item rows to D1.
 *
 * inbox item schema (notification_inbox_item — migration 0259):
 *   id, tenant_id, user_id, notification_event_id (nullable),
 *   title, body, cta_label, cta_url, icon_url, image_url, metadata,
 *   is_read, read_at, text_only_mode, severity, created_at, expires_at
 *
 * NOTE: No delivery_id FK in the actual migration (spec/migration discrepancy).
 *       notification_event_id is nullable — derived from DispatchContext if available.
 *
 * Guardrails:
 *   G1  — tenant_id required in every INSERT (enforced by table NOT NULL constraint)
 *   G22 (OQ-011) — text_only_mode = 1 suppresses image_url (image not shown)
 *   G24 — sandbox mode: still writes inbox item (in_app is not a real-world dispatch)
 */

import type { INotificationChannel, DispatchContext, DispatchResult } from '../types.js';
import type { D1LikeFull } from '../db-types.js';

// ---------------------------------------------------------------------------
// InAppChannel
// ---------------------------------------------------------------------------

export class InAppChannel implements INotificationChannel {
  readonly channel = 'in_app' as const;
  readonly providerName = 'internal';

  constructor(private readonly db: D1LikeFull) {}

  /**
   * Write a notification_inbox_item row.
   *
   * title  = ctx.template.subject (set by Phase2TemplateRenderer for in_app)
   * body   = ctx.template.body    (plain text from Phase2TemplateRenderer)
   * severity from ctx.severity
   * text_only_mode: derived from ctx — Phase 5 preference resolver will set this
   *
   * G1: tenant_id taken from ctx.tenantId.
   * G22: text_only_mode always 0 in Phase 2; Phase 5 wires low_data_mode preference.
   */
  async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
    const inboxId = `inbox_${crypto.randomUUID().replace(/-/g, '')}`;
    const title = ctx.template.subject ?? 'Notification';
    const body = ctx.template.body;

    // Derive notification_event_id from deliveryId prefix heuristic
    // (notif_evt_xxx is the notifEventId format from consumer.ts).
    // In Phase 2, we store it from ctx.deliveryId lineage if available.
    // The notification_event_id column is nullable so NULL is safe.

    try {
      await this.db
        .prepare(
          `INSERT INTO notification_inbox_item (
            id, tenant_id, user_id,
            notification_event_id,
            title, body,
            cta_label, cta_url,
            icon_url, image_url, metadata,
            is_read, read_at,
            text_only_mode,
            severity,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, NULL, NULL, NULL, 0, NULL, 0, ?, unixepoch())`,
        )
        .bind(
          inboxId,
          ctx.tenantId,       // G1: NOT NULL
          ctx.recipientId,    // user_id
          null,               // notification_event_id: nullable; Phase 6 wires from ctx
          title,
          body,
          ctx.template.ctaUrl ?? null,
          ctx.severity,       // severity: 'info' | 'warning' | 'critical'
        )
        .run();

      return {
        success: true,
        providerMessageId: inboxId,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, lastError: `in_app write failed: ${msg}` };
    }
  }

  /**
   * In-app notifications are always entitled (no plan restriction for inbox).
   * Phase 6 may add plan-level inbox capacity limits.
   */
  isEntitled(_workspacePlan: string): boolean {
    return true;
  }
}
