-- Migration 0443 — Analytics Events (Unified)
-- Phase 2: FR-AN-01..FR-AN-04 — unified analytics_events table for
-- trackEvent() calls from all modules.
--
-- Platform Invariants:
--   T3  — tenant_id on every row
--   P13 — no PII (donor_phone, bank_account_number etc.) in properties_json
--          enforced at application layer by assertNoPii() in tracker.ts

CREATE TABLE IF NOT EXISTS analytics_events (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL,
  workspace_id     TEXT NOT NULL,
  event_key        TEXT NOT NULL,        -- e.g. 'group.member_joined', 'campaign.contribution_confirmed'
  entity_type      TEXT NOT NULL,        -- e.g. 'group', 'campaign', 'case'
  entity_id        TEXT NOT NULL,
  actor_id         TEXT,
  properties_json  TEXT,                 -- JSON blob — MUST NOT contain PII (P13)
  occurred_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant_workspace
  ON analytics_events (tenant_id, workspace_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_entity
  ON analytics_events (tenant_id, entity_type, entity_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_key
  ON analytics_events (tenant_id, event_key, occurred_at DESC);
