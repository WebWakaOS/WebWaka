-- Migration: 0271_notification_wa_approval_log
-- Description: Create notification_wa_approval_log table — audit trail for
--   WhatsApp template Meta approval status transitions.
--   Required by OQ-003 compliance: every status change must be recorded.
--
-- Phase 4 (N-053): Resend domain verification + WA approval polling writes here.
-- G17 (OQ-003) — WhatsApp templates require Meta approval before dispatch.
--   Dispatch is BLOCKED for templates in 'pending_meta_approval' or 'meta_rejected' status.

CREATE TABLE IF NOT EXISTS notification_wa_approval_log (
  id                       TEXT PRIMARY KEY,  -- 'wa_approval_' + uuid
  template_id              TEXT NOT NULL,     -- FK to notification_template
  tenant_id                TEXT,              -- NULL = platform template
  meta_template_name       TEXT NOT NULL,
  previous_status          TEXT NOT NULL
    CHECK (previous_status IN (
      'not_required', 'pending_meta_approval', 'meta_approved', 'meta_rejected'
    )),
  new_status               TEXT NOT NULL
    CHECK (new_status IN (
      'not_required', 'pending_meta_approval', 'meta_approved', 'meta_rejected'
    )),
  rejection_reason         TEXT,              -- populated when new_status = 'meta_rejected'
  triggered_by             TEXT NOT NULL DEFAULT 'webhook'
    CHECK (triggered_by IN ('webhook', 'poll', 'manual', 'submission')),
  meta_request_id          TEXT,              -- Meta API request ID for tracing
  raw_webhook_payload      TEXT,             -- JSON: raw event from Meta (truncated >8kb)
  created_at               INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_notif_wa_approval_template
  ON notification_wa_approval_log(template_id, created_at);

CREATE INDEX IF NOT EXISTS idx_notif_wa_approval_status
  ON notification_wa_approval_log(new_status, created_at);

CREATE INDEX IF NOT EXISTS idx_notif_wa_approval_tenant
  ON notification_wa_approval_log(tenant_id, created_at)
  WHERE tenant_id IS NOT NULL;
