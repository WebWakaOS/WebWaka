-- Migration: 0278_notification_inbox_item_phase5
-- Description: Extend notification_inbox_item with Phase 5 columns required by the
--   inbox API (N-065, N-067), digest engine (N-064), and partner-admin surface (OQ-008).
--
--   Phase 0 migration 0259 created the table without these Phase 5 columns.
--   All new columns are nullable (or have defaults) so existing rows are unaffected.
--
-- New columns:
--   delivery_id    — FK to notification_delivery (spec v2.1, Phase 5 required)
--   category       — OQ-008: 'billing'|'auth'|'workspace'|'partner'|'vertical'|etc.
--                    Enables ?category=partner filter for apps/partner-admin
--   icon_type      — spec: 'info'|'success'|'warning'|'error'; replaces raw icon_url
--   archived_at    — PATCH /notifications/inbox/:id { action: 'archive' }
--   pinned_at      — PATCH /notifications/inbox/:id { action: 'pin' }
--   dismissed_at   — PATCH /notifications/inbox/:id { action: 'dismiss' }
--   snoozed_until  — PATCH /notifications/inbox/:id { action: 'snooze', until: epoch }
--
-- Guardrails:
--   G1  — tenant_id already NOT NULL in 0259
--   G12 — category='partner' items queryable by partner-admin via shared inbox API
--   G22 — text_only_mode already in 0259; preserved here

ALTER TABLE notification_inbox_item ADD COLUMN delivery_id   TEXT;
ALTER TABLE notification_inbox_item ADD COLUMN category      TEXT;
ALTER TABLE notification_inbox_item ADD COLUMN icon_type     TEXT NOT NULL DEFAULT 'info';
ALTER TABLE notification_inbox_item ADD COLUMN archived_at   INTEGER;
ALTER TABLE notification_inbox_item ADD COLUMN pinned_at     INTEGER;
ALTER TABLE notification_inbox_item ADD COLUMN dismissed_at  INTEGER;
ALTER TABLE notification_inbox_item ADD COLUMN snoozed_until INTEGER;

-- Index for partner-admin category filter (OQ-008)
CREATE INDEX IF NOT EXISTS idx_notif_inbox_category
  ON notification_inbox_item(tenant_id, category, created_at DESC)
  WHERE category IS NOT NULL;

-- Index for snooze wake-up sweep (future Phase 8 CRON)
CREATE INDEX IF NOT EXISTS idx_notif_inbox_snoozed
  ON notification_inbox_item(snoozed_until)
  WHERE snoozed_until IS NOT NULL;

-- Index for delivery_id lookups (delivery FSM: mark inbox read when email opened)
CREATE INDEX IF NOT EXISTS idx_notif_inbox_delivery
  ON notification_inbox_item(delivery_id)
  WHERE delivery_id IS NOT NULL;
