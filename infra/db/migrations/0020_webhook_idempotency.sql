-- Migration: 0020_webhook_idempotency
-- Description: Webhook idempotency log for duplicate protection.
-- (M7a: docs/governance/security-baseline.md R6)
-- Prevents double-processing of Paystack / OTP provider / identity provider webhooks.
-- Rows expire after 7 days (cleanup via scheduled Cloudflare Worker).

CREATE TABLE IF NOT EXISTS webhook_idempotency_log (
  idempotency_key TEXT NOT NULL PRIMARY KEY,  -- provider:event_id
  endpoint        TEXT NOT NULL,
  request_hash    TEXT NOT NULL,              -- SHA-256 of request body
  response_code   INTEGER,
  processed_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at      INTEGER NOT NULL DEFAULT (unixepoch() + 604800)  -- +7 days
);

CREATE INDEX IF NOT EXISTS idx_webhook_expires
  ON webhook_idempotency_log(expires_at);
