-- Migration: 0260_notification_digest_batches
-- Description: Create notification_digest_batch table — aggregate of deferred notifications
--   grouped into a single digest email/push/in_app delivery.
--
-- A batch is created when the first digestable event arrives within a window.
-- Items accumulate until window_end, at which point the CRON sweep (OQ-007)
-- enqueues a 'digest_batch' Queue message for the consumer.
--
-- Phase 5 (N-063, N-064): DigestEngine.processDigestBatch() reads from this table.
-- CRON schedule (apps/notificator): '0 23 * * *' (daily), '0 23 * * 0' (weekly), '0 * * * *' (hourly)
--
-- G1  — tenant_id NOT NULL
-- G12 — each Queue message contains tenant_id (T3 isolation)

CREATE TABLE IF NOT EXISTS notification_digest_batch (
  id             TEXT PRIMARY KEY,            -- 'digest_' + uuid
  tenant_id      TEXT NOT NULL,               -- G1: T3 required; G12: in every Queue message
  user_id        TEXT NOT NULL,
  channel        TEXT NOT NULL
    CHECK (channel IN ('email', 'push', 'in_app')),
  window_type    TEXT NOT NULL
    CHECK (window_type IN ('hourly', 'daily', 'weekly')),
  window_start   INTEGER NOT NULL,
  window_end     INTEGER NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'skipped')),
  item_count     INTEGER NOT NULL DEFAULT 0,
  sent_at        INTEGER,
  delivery_id    TEXT,                        -- FK to notification_delivery once sent
  last_error     TEXT,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_notif_digest_batch_pending
  ON notification_digest_batch(status, window_end)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_notif_digest_batch_user
  ON notification_digest_batch(tenant_id, user_id, window_type, status);

CREATE INDEX IF NOT EXISTS idx_notif_digest_batch_tenant_created
  ON notification_digest_batch(tenant_id, created_at);
