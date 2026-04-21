-- Migration: 0258_notification_deliveries
-- Description: Create notification_delivery table — full delivery lifecycle tracking.
--   One row per (notification_event × recipient × channel) dispatch attempt.
--
-- Guardrails:
--   G7  — idempotency_key UNIQUE constraint; duplicate events cannot produce duplicate deliveries
--   G10 — 'dead_lettered' status (never silent discard)
--   G3  — sender_fallback_used tracks G3/OQ-004 platform-sender fallback
--   G24 (OQ-012) — sandbox_redirect + sandbox_original_recipient_hash
--   G21 (OQ-009) — source mirrors notification_event.source
--
-- Retention: 90 days (N-115, Phase 8)
-- NDPR: hard-delete on user erasure (G23)

CREATE TABLE IF NOT EXISTS notification_delivery (
  id                               TEXT PRIMARY KEY,  -- 'delivery_' + uuid
  notification_event_id            TEXT NOT NULL,      -- FK to notification_event
  tenant_id                        TEXT NOT NULL,      -- G1: T3 required
  recipient_id                     TEXT NOT NULL,
  recipient_type                   TEXT NOT NULL
    CHECK (recipient_type IN ('user', 'admin', 'system')),
  channel                          TEXT NOT NULL
    CHECK (channel IN ('email', 'sms', 'whatsapp', 'push', 'in_app', 'telegram', 'slack', 'webhook')),
  provider                         TEXT NOT NULL,     -- e.g. 'resend', 'termii', 'meta_whatsapp'
  template_id                      TEXT NOT NULL,     -- FK to notification_template
  status                           TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN (
      'queued', 'rendering', 'dispatched', 'delivered',
      'opened', 'clicked', 'failed', 'suppressed', 'dead_lettered'
    )),
  provider_message_id              TEXT,
  attempts                         INTEGER NOT NULL DEFAULT 0,
  last_error                       TEXT,
  -- v2 fields (OQ-009, OQ-004, OQ-012)
  source                           TEXT NOT NULL DEFAULT 'api'
    CHECK (source IN ('api', 'ussd_gateway', 'cron', 'queue_consumer')),
  sender_fallback_used             INTEGER NOT NULL DEFAULT 0  -- G3 OQ-004
    CHECK (sender_fallback_used IN (0, 1)),
  sandbox_redirect                 INTEGER NOT NULL DEFAULT 0  -- G24 OQ-012
    CHECK (sandbox_redirect IN (0, 1)),
  sandbox_original_recipient_hash  TEXT,              -- SHA-256 of original address (audit only)
  -- Timestamps
  created_at                       INTEGER NOT NULL DEFAULT (unixepoch()),
  queued_at                        INTEGER NOT NULL DEFAULT (unixepoch()),
  dispatched_at                    INTEGER,
  delivered_at                     INTEGER,
  opened_at                        INTEGER,
  clicked_at                       INTEGER,
  failed_at                        INTEGER,
  -- G7: idempotency enforcement
  idempotency_key                  TEXT UNIQUE,
  correlation_id                   TEXT
);

CREATE INDEX IF NOT EXISTS idx_notif_delivery_event
  ON notification_delivery(notification_event_id);

CREATE INDEX IF NOT EXISTS idx_notif_delivery_tenant_status
  ON notification_delivery(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_notif_delivery_recipient
  ON notification_delivery(tenant_id, recipient_id, channel);

CREATE INDEX IF NOT EXISTS idx_notif_delivery_created_at
  ON notification_delivery(created_at);

CREATE INDEX IF NOT EXISTS idx_notif_delivery_dead_lettered
  ON notification_delivery(status)
  WHERE status = 'dead_lettered';

CREATE INDEX IF NOT EXISTS idx_notif_delivery_tenant_created
  ON notification_delivery(tenant_id, created_at);
