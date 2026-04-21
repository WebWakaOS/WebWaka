-- Migration: 0262_notification_audit_log
-- Description: Create notification_audit_log table — immutable append-only audit trail
--   for all notification pipeline events. Written by the notificator Worker and
--   preference changes from the API.
--
-- Guardrails:
--   G9  — preference changes must be audited
--   G23 — NDPR erasure: actor_id and recipient_id zeroed to 'ERASED' (never deleted)
--   G1  — tenant_id NOT NULL
--
-- The audit log is APPEND-ONLY. No UPDATE or DELETE operations are permitted
-- except the G23 NDPR erasure path which zeros PII fields in-place.
--
-- Retention: Permanent (regulatory; 7 years per CBN directive)

CREATE TABLE IF NOT EXISTS notification_audit_log (
  id                      TEXT PRIMARY KEY,  -- 'audit_notif_' + uuid
  tenant_id               TEXT NOT NULL,     -- G1
  event_type              TEXT NOT NULL
    CHECK (event_type IN (
      'notification.sent',
      'notification.failed',
      'notification.suppressed',
      'notification.dead_lettered',
      'preference.changed',
      'unsubscribe'
    )),
  actor_id                TEXT,              -- G23: zeroed to 'ERASED' on NDPR erasure
  recipient_id            TEXT,              -- G23: zeroed to 'ERASED' on NDPR erasure
  channel                 TEXT
    CHECK (channel IS NULL OR channel IN (
      'email', 'sms', 'whatsapp', 'push', 'in_app', 'telegram', 'slack', 'webhook'
    )),
  notification_event_id   TEXT,              -- FK to notification_event (nullable for pref changes)
  delivery_id             TEXT,              -- FK to notification_delivery (nullable)
  metadata                TEXT,             -- JSON: event-specific context
  created_at              INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_notif_audit_tenant_created
  ON notification_audit_log(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_notif_audit_recipient
  ON notification_audit_log(tenant_id, recipient_id, created_at)
  WHERE recipient_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notif_audit_event_type
  ON notification_audit_log(event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_notif_audit_delivery
  ON notification_audit_log(delivery_id)
  WHERE delivery_id IS NOT NULL;
