-- Migration: 0267_push_tokens
-- Description: Create push_token table — device push notification tokens per user.
--   Tokens are registered by workspace-apps when they receive FCM/APNs tokens.
--   Stale tokens (>30 days since last_seen_at) are pruned by Phase 8 retention CRON.
--
-- Guardrails:
--   G1  — tenant_id NOT NULL
--   G22 (OQ-011) — low_data_mode users have push suppressed at routing time (not stored here)
--   G23 — NDPR erasure: hard-delete on user erasure
--
-- Phase 7 (N-105): PushChannel.dispatch() reads from this table.

CREATE TABLE IF NOT EXISTS push_token (
  id              TEXT PRIMARY KEY,           -- 'push_tok_' + uuid
  tenant_id       TEXT NOT NULL,              -- G1
  user_id         TEXT NOT NULL,              -- G23: hard-delete on NDPR erasure
  device_id       TEXT NOT NULL,              -- client device fingerprint
  provider        TEXT NOT NULL DEFAULT 'fcm'
    CHECK (provider IN ('fcm', 'apns', 'web_push')),
  token           TEXT NOT NULL,
  app_id          TEXT,                       -- workspace-app identifier
  platform        TEXT                        -- 'android' | 'ios' | 'web'
    CHECK (platform IS NULL OR platform IN ('android', 'ios', 'web')),
  is_active       INTEGER NOT NULL DEFAULT 1
    CHECK (is_active IN (0, 1)),
  last_seen_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Unique: one row per (user, device, provider) per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_token_unique
  ON push_token(tenant_id, user_id, device_id, provider);

CREATE INDEX IF NOT EXISTS idx_push_token_user
  ON push_token(tenant_id, user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_push_token_stale
  ON push_token(last_seen_at, is_active)
  WHERE is_active = 1;
