-- Migration: 0264_notification_suppression_list
-- Description: Create notification_suppression_list table — hard suppression records
--   for bounced, complained, or admin-blocked addresses. Checked before every dispatch (G20).
--
--   Suppressed addresses MUST NEVER receive notifications regardless of user preference.
--   Soft unsubscribe (user_pref) is in notification_subscription (0263).
--   This table handles hard suppressions from provider webhooks (bounces, complaints).
--
-- G20 — Suppression List Must Be Checked Before Every Dispatch
-- G1  — tenant_id NOT NULL (NULL = platform-wide suppression)
-- G23 — NDPR erasure: hash stored (not raw address), no PII to erase

CREATE TABLE IF NOT EXISTS notification_suppression_list (
  id              TEXT PRIMARY KEY,           -- 'suppress_' + uuid
  tenant_id       TEXT,                       -- NULL = platform-wide suppression
  channel         TEXT NOT NULL
    CHECK (channel IN ('email', 'sms', 'whatsapp', 'push')),
  -- Address stored as SHA-256 hash for GDPR/NDPR compliance (G23)
  -- Raw address NEVER stored. Hash computed at write time.
  address_hash    TEXT NOT NULL,              -- SHA-256(lower(address) + ':' + tenant_id + ':' + channel)
  reason          TEXT NOT NULL
    CHECK (reason IN ('bounced', 'unsubscribed', 'complaint', 'admin_block')),
  provider        TEXT,                       -- which provider webhook reported this
  metadata        TEXT,                      -- JSON: provider-specific event details
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at      INTEGER                    -- NULL = permanent suppression
);

-- Unique per (tenant, channel, address_hash)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notif_suppress_unique
  ON notification_suppression_list(tenant_id, channel, address_hash);

CREATE INDEX IF NOT EXISTS idx_notif_suppress_lookup
  ON notification_suppression_list(channel, address_hash);

CREATE INDEX IF NOT EXISTS idx_notif_suppress_tenant
  ON notification_suppression_list(tenant_id)
  WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notif_suppress_expires
  ON notification_suppression_list(expires_at)
  WHERE expires_at IS NOT NULL;
