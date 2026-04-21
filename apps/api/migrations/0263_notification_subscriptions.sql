-- Migration: 0263_notification_subscriptions
-- Description: Create notification_subscription table — explicit opt-in/opt-out records
--   per user per channel per template_family. Complementary to notification_preference
--   (which stores configuration); subscriptions store consent status.
--
--   One-click unsubscribe links (N-039) write to this table.
--   Suppression list check (G20) reads from notification_suppression_list (0264).
--   This table tracks user consent, not bounce/complaint suppression.
--
-- G9  — all changes written to notification_audit_log
-- G23 — NDPR erasure: hard-delete on user erasure request
-- G1  — tenant_id NOT NULL

CREATE TABLE IF NOT EXISTS notification_subscription (
  id               TEXT PRIMARY KEY,          -- 'sub_notif_' + uuid
  tenant_id        TEXT NOT NULL,             -- G1
  user_id          TEXT NOT NULL,             -- G23: hard-delete on NDPR erasure
  channel          TEXT NOT NULL
    CHECK (channel IN ('email', 'sms', 'whatsapp', 'push', 'in_app', 'telegram', 'slack', 'webhook')),
  template_family  TEXT NOT NULL,             -- '*' = all-families wildcard
  subscribed       INTEGER NOT NULL DEFAULT 1
    CHECK (subscribed IN (0, 1)),
  method           TEXT NOT NULL DEFAULT 'user_pref'
    CHECK (method IN (
      'user_pref',        -- changed via preference UI
      'one_click_link',   -- N-039: one-click unsubscribe URL
      'api',              -- programmatic change
      'admin',            -- admin override
      'complaint'         -- bounce/complaint from provider webhook
    )),
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Unique: one row per (user, channel, template_family) per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_notif_sub_unique
  ON notification_subscription(tenant_id, user_id, channel, template_family);

CREATE INDEX IF NOT EXISTS idx_notif_sub_user
  ON notification_subscription(tenant_id, user_id, subscribed);

CREATE INDEX IF NOT EXISTS idx_notif_sub_unsubscribed
  ON notification_subscription(tenant_id, channel, subscribed)
  WHERE subscribed = 0;
