-- Migration: 0254_notification_events
-- Description: Create notification_event table — the normalized trigger record for the
--   WebWaka Notification Engine v2. Every business action that may generate a notification
--   first writes a row here before enqueueing to CF Queue.
--
-- Guardrails enforced:
--   G1  — tenant_id NOT NULL (T3 tenant isolation)
--   N-060a (OQ-009) — source column for USSD-origin bypass (G21)
--   N-011 — correlation_id for distributed tracing
--
-- Retention: 90 days (enforced by apps/notificator CRON — N-115, Phase 8)
-- NDPR: actor_id anonymized on user erasure (G23)

CREATE TABLE IF NOT EXISTS notification_event (
  id                TEXT PRIMARY KEY,         -- 'notif_evt_' + uuid (no dashes)
  event_key         TEXT NOT NULL,            -- e.g. 'auth.user.registered'
  domain            TEXT NOT NULL,            -- e.g. 'auth', 'billing', 'bank_transfer'
  aggregate_type    TEXT NOT NULL,            -- e.g. 'user', 'workspace', 'transfer'
  aggregate_id      TEXT NOT NULL,
  tenant_id         TEXT NOT NULL,            -- G1: T3 required; always non-null
  actor_type        TEXT NOT NULL             -- 'user'|'system'|'admin'|'unknown'
    CHECK (actor_type IN ('user', 'system', 'admin', 'unknown')),
  actor_id          TEXT,                     -- G23 NDPR: anonymized on erasure
  subject_type      TEXT,
  subject_id        TEXT,
  payload           TEXT NOT NULL,            -- JSON: event-specific context variables
  correlation_id    TEXT,                     -- N-011: cross-service distributed tracing
  source            TEXT NOT NULL DEFAULT 'api'  -- N-060a OQ-009: origin tagging
    CHECK (source IN ('api', 'ussd_gateway', 'cron', 'queue_consumer')),
  severity          TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'critical')),
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  processed_at      INTEGER
);

-- Indexes per spec Section 7
CREATE INDEX IF NOT EXISTS idx_notif_event_tenant_key
  ON notification_event(tenant_id, event_key);

CREATE INDEX IF NOT EXISTS idx_notif_event_aggregate
  ON notification_event(aggregate_type, aggregate_id);

CREATE INDEX IF NOT EXISTS idx_notif_event_created_at
  ON notification_event(created_at);

CREATE INDEX IF NOT EXISTS idx_notif_event_source
  ON notification_event(source);

CREATE INDEX IF NOT EXISTS idx_notif_event_tenant_created
  ON notification_event(tenant_id, created_at);
