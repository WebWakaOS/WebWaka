-- Migration: 0548_provider_registry
-- Purpose: Platform-managed provider control plane
-- Covers: provider_registry table for all infrastructure provider categories

CREATE TABLE IF NOT EXISTS provider_registry (
  id                   TEXT    PRIMARY KEY,
  category             TEXT    NOT NULL,
  provider_name        TEXT    NOT NULL,
  display_name         TEXT    NOT NULL,
  status               TEXT    NOT NULL DEFAULT 'inactive',
  scope                TEXT    NOT NULL DEFAULT 'platform',
  scope_id             TEXT,
  priority             INTEGER NOT NULL DEFAULT 100,
  routing_policy       TEXT    NOT NULL DEFAULT 'primary',
  capabilities         TEXT,
  config_json          TEXT,
  credentials_encrypted TEXT,
  credentials_iv       TEXT,
  health_status        TEXT    DEFAULT 'unknown',
  last_health_check_at INTEGER,
  created_by           TEXT,
  created_at           INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_provider_registry_category_scope
  ON provider_registry (category, scope, scope_id, status, priority);

CREATE INDEX IF NOT EXISTS idx_provider_registry_scope_id
  ON provider_registry (scope_id)
  WHERE scope_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_provider_registry_status
  ON provider_registry (status, category);
