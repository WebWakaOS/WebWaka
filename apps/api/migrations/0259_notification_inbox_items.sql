-- Migration: 0259_notification_inbox_items
-- Description: Create notification_inbox_item table — in-app notification inbox.
--   Supports unread counts, mark-as-read, and pagination by created_at cursor.
--   Unread count cached in NOTIFICATION_KV: `{tenant_id}:inbox:unread:{user_id}` (N-067).
--
-- Guardrails:
--   G1  — tenant_id NOT NULL
--   G22 (OQ-011) — text_only_mode column for low_data_mode consumers
--
-- Retention: 365 days (N-115, Phase 8)
-- NDPR: hard-delete on user erasure (G23)

CREATE TABLE IF NOT EXISTS notification_inbox_item (
  id                     TEXT PRIMARY KEY,    -- 'inbox_' + uuid
  tenant_id              TEXT NOT NULL,       -- G1: T3 required
  user_id                TEXT NOT NULL,
  notification_event_id  TEXT,               -- FK to notification_event (nullable for system messages)
  title                  TEXT NOT NULL,
  body                   TEXT NOT NULL,
  cta_label              TEXT,
  cta_url                TEXT,
  icon_url               TEXT,
  image_url              TEXT,               -- suppressed when text_only_mode = 1 (G22)
  metadata               TEXT,              -- JSON: arbitrary KV pairs for deep links
  is_read                INTEGER NOT NULL DEFAULT 0
    CHECK (is_read IN (0, 1)),
  read_at                INTEGER,
  text_only_mode         INTEGER NOT NULL DEFAULT 0  -- G22 OQ-011: no image fetches
    CHECK (text_only_mode IN (0, 1)),
  severity               TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'critical')),
  created_at             INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at             INTEGER            -- NULL = non-expiring
);

CREATE INDEX IF NOT EXISTS idx_notif_inbox_user
  ON notification_inbox_item(tenant_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notif_inbox_unread
  ON notification_inbox_item(tenant_id, user_id, is_read)
  WHERE is_read = 0;

CREATE INDEX IF NOT EXISTS idx_notif_inbox_tenant_created
  ON notification_inbox_item(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_notif_inbox_expires
  ON notification_inbox_item(expires_at)
  WHERE expires_at IS NOT NULL;
