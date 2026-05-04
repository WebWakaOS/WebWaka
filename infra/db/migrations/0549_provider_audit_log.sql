-- Migration: 0549_provider_audit_log
-- Purpose: Immutable audit trail for all provider management actions

CREATE TABLE IF NOT EXISTS provider_audit_log (
  id          TEXT    PRIMARY KEY,
  provider_id TEXT    NOT NULL,
  action      TEXT    NOT NULL,
  actor_id    TEXT,
  actor_role  TEXT,
  scope_id    TEXT,
  changes_json TEXT,
  ip_hash     TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_provider_audit_log_provider
  ON provider_audit_log (provider_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_provider_audit_log_actor
  ON provider_audit_log (actor_id, created_at DESC)
  WHERE actor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_provider_audit_log_time
  ON provider_audit_log (created_at DESC);
