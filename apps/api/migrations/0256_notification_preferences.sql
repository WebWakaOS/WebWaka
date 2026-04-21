-- Migration: 0256_notification_preferences
-- Description: Create notification_preference table — 4-level scoped preference system.
--   Inheritance: platform → tenant → role → user (most specific wins).
--   KV-cached with tenant-prefixed keys (G1, N-061).
--
-- Guardrails:
--   G22 (OQ-011) — low_data_mode column for user-controlled data-saving mode
--   G11 — quiet hours store timezone; deferred delivery via Queue delay
--   G21 (OQ-009) — USSD-origin bypass handled at runtime (not stored here)
--
-- See: docs/notification-preference-inheritance.md (N-006)

CREATE TABLE IF NOT EXISTS notification_preference (
  id                TEXT PRIMARY KEY,         -- 'pref_' + uuid
  scope_type        TEXT NOT NULL             -- inheritance level
    CHECK (scope_type IN ('platform', 'tenant', 'role', 'user')),
  scope_id          TEXT NOT NULL,            -- 'platform' | tenant_id | role_name | user_id
  tenant_id         TEXT NOT NULL,            -- G1: always required
  event_key         TEXT NOT NULL,            -- '*' for all-events catch-all
  channel           TEXT NOT NULL
    CHECK (channel IN ('email', 'sms', 'whatsapp', 'push', 'in_app', 'telegram', 'slack', 'webhook')),
  enabled           INTEGER NOT NULL DEFAULT 1
    CHECK (enabled IN (0, 1)),
  quiet_hours_start INTEGER                   -- hour 0-23 in timezone
    CHECK (quiet_hours_start IS NULL OR (quiet_hours_start >= 0 AND quiet_hours_start <= 23)),
  quiet_hours_end   INTEGER                   -- hour 0-23 in timezone
    CHECK (quiet_hours_end IS NULL OR (quiet_hours_end >= 0 AND quiet_hours_end <= 23)),
  timezone          TEXT DEFAULT 'Africa/Lagos',  -- G11: WAT default
  digest_window     TEXT DEFAULT 'none'
    CHECK (digest_window IN ('none', 'hourly', 'daily', 'weekly')),
  low_data_mode     INTEGER NOT NULL DEFAULT 0  -- G22 OQ-011: user-controlled data-saving
    CHECK (low_data_mode IN (0, 1)),
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_notif_pref_scope
  ON notification_preference(scope_type, scope_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_notif_pref_tenant_channel
  ON notification_preference(tenant_id, channel);

CREATE INDEX IF NOT EXISTS idx_notif_pref_user
  ON notification_preference(scope_id, tenant_id)
  WHERE scope_type = 'user';
