-- Migration: 0241_ai_notification_queue
-- Description: Notification delivery queue for AI/HITL system events (P22).
-- Used to deliver email and in-app notifications for: HITL Level 3 escalations,
-- budget depletion alerts, partner pool warnings.
-- The projections CRON drains this queue (send + mark sent).
-- T3: tenant-scoped.

CREATE TABLE IF NOT EXISTS ai_notification_queue (
  id              TEXT NOT NULL PRIMARY KEY,
  tenant_id       TEXT NOT NULL,
  user_id         TEXT NOT NULL,              -- recipient
  notification_type TEXT NOT NULL
                  CHECK (notification_type IN (
                    'hitl_l3_expired', 'budget_depleted', 'budget_warning_80pct',
                    'partner_pool_low', 'verification_reminder'
                  )),
  payload         TEXT NOT NULL DEFAULT '{}', -- JSON with notification-specific data
  channel         TEXT NOT NULL DEFAULT 'email'
                  CHECK (channel IN ('email', 'in_app', 'both')),
  sent_at         TEXT,                        -- ISO-8601 when sent; NULL if unsent
  failed_at       TEXT,
  retry_count     INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_notif_unsent
  ON ai_notification_queue(tenant_id, created_at) WHERE sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_ai_notif_user
  ON ai_notification_queue(user_id, created_at);
