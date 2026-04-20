-- Migration: 0261_notification_digest_batch_items
-- Description: Create notification_digest_batch_item table — individual events
--   accumulated within a digest batch window.
--
-- Phase 5 (N-063): When DigestEngine renders a batch, it queries all items
-- for a given digest_batch_id and renders a consolidated email/push/in_app.
--
-- G1  — tenant_id NOT NULL (T3 isolation in every queue message)
-- G12 — every digest queue message includes tenant_id

CREATE TABLE IF NOT EXISTS notification_digest_batch_item (
  id                       TEXT PRIMARY KEY,  -- 'ditem_' + uuid
  digest_batch_id          TEXT NOT NULL,     -- FK to notification_digest_batch
  notification_event_id    TEXT NOT NULL,     -- FK to notification_event
  tenant_id                TEXT NOT NULL,     -- G1: T3 required
  user_id                  TEXT NOT NULL,
  title                    TEXT NOT NULL,     -- pre-rendered from template at insert time
  body_summary             TEXT NOT NULL,     -- ≤140 chars for digest list rendering
  cta_url                  TEXT,
  event_key                TEXT NOT NULL,
  severity                 TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'critical')),
  created_at               INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_notif_ditem_batch
  ON notification_digest_batch_item(digest_batch_id, created_at);

CREATE INDEX IF NOT EXISTS idx_notif_ditem_tenant
  ON notification_digest_batch_item(tenant_id, user_id);
