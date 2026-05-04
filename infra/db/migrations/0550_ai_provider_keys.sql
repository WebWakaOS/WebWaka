-- Migration: 0550_ai_provider_keys
-- Purpose: Multi-key pool support for AI providers (especially OpenRouter)

CREATE TABLE IF NOT EXISTS ai_provider_keys (
  id                   TEXT    PRIMARY KEY,
  provider_id          TEXT    NOT NULL,
  key_label            TEXT    NOT NULL,
  key_encrypted        TEXT    NOT NULL,
  key_iv               TEXT    NOT NULL,
  status               TEXT    NOT NULL DEFAULT 'active',
  total_requests       INTEGER NOT NULL DEFAULT 0,
  successful_requests  INTEGER NOT NULL DEFAULT 0,
  failed_requests      INTEGER NOT NULL DEFAULT 0,
  last_used_at         INTEGER,
  rate_limited_until   INTEGER,
  created_at           INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ai_provider_keys_pool
  ON ai_provider_keys (provider_id, status, last_used_at ASC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_ai_provider_keys_rate_limit
  ON ai_provider_keys (rate_limited_until)
  WHERE rate_limited_until IS NOT NULL;
