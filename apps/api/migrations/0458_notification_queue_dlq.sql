-- Migration: 0458_notification_queue_dlq
-- Description: Dead-letter storage for permanently failed notification queue messages.
--
-- Context:
--   Cloudflare Queues silently drop messages after max_retries (=5) are exhausted.
--   The notificator consumer writes a row here on the final retry attempt before
--   the message is dropped, preserving full payload for manual triage / replay.
--
-- Guardrails:
--   G10 — never silently discard; DLQ entry = observable failure record
--   G1  — tenant_id required for T3 isolation
--   NDPR — raw_payload may contain PII; hard-delete on DSAR erasure (G23)
--
-- Retention: 90 days (same as notification_delivery, N-115)
-- See: PRODUCTION_READINESS_BACKLOG.md M-8

CREATE TABLE IF NOT EXISTS notification_queue_dlq (
  id              TEXT PRIMARY KEY,            -- 'ndlq_' + ulid
  tenant_id       TEXT NOT NULL,               -- G1: T3 required
  message_type    TEXT NOT NULL,               -- 'notification_event' | 'digest_batch' | 'webhook_delivery' | 'unknown'
  message_id      TEXT,                        -- eventId / deliveryId / batch job ref
  event_key       TEXT,                        -- e.g. 'auth.user.registered'
  raw_payload     TEXT NOT NULL,               -- JSON-stringified message body (may contain PII)
  last_error      TEXT NOT NULL,               -- final error string
  attempts        INTEGER NOT NULL DEFAULT 5,  -- always max_retries at time of DLQ write
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  replayed_at     INTEGER,                     -- set when ops manually replays via admin endpoint
  replayed_by     TEXT,                        -- user_id of operator who triggered replay
  resolved_at     INTEGER,                     -- set when ops marks as resolved
  resolved_by     TEXT,
  notes           TEXT                         -- operator triage notes
);

CREATE INDEX IF NOT EXISTS idx_ndlq_tenant_created
  ON notification_queue_dlq(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_ndlq_message_type
  ON notification_queue_dlq(message_type);

CREATE INDEX IF NOT EXISTS idx_ndlq_unresolved
  ON notification_queue_dlq(created_at)
  WHERE resolved_at IS NULL;
