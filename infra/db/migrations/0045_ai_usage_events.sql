-- Migration 0045: AI usage events (audit log + metering)
-- (SA-1.9 — TDR-0009, Platform Invariants P9, P10, P13)
--
-- Append-only audit trail for every AI call made through SuperAgent.
-- Used for: billing reconciliation, NDPR compliance, security/anomaly detection,
--           pillar attribution analytics.
--
-- P9:  input_tokens, output_tokens, total_tokens, wc_charged — all INTEGER.
-- P10: ndpr_consent_ref is the consent_records.id at time of call.
--      NULL is allowed only for free/BYOK calls (no platform credit consumed).
-- P13: Prompt and response content are NEVER stored in this table.
--      This table contains only metadata — no user-generated text.
--
-- pillar values:
--   1 = Pillar 1 (Ops — POS, inventory, shifts)
--   2 = Pillar 2 (Branding — bio, copy, SEO)
--   3 = Pillar 3 (Marketplace — listing, search, review)

CREATE TABLE IF NOT EXISTS ai_usage_events (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL,
  user_id          TEXT,                    -- NULL for workspace-level AI calls
  pillar           INTEGER NOT NULL CHECK (pillar IN (1, 2, 3)),
  capability       TEXT NOT NULL,           -- AICapabilityType value
  provider         TEXT NOT NULL,           -- AIProvider value
  model            TEXT NOT NULL,
  input_tokens     INTEGER NOT NULL DEFAULT 0,
  output_tokens    INTEGER NOT NULL DEFAULT 0,
  total_tokens     INTEGER NOT NULL DEFAULT 0,
  wc_charged       INTEGER NOT NULL DEFAULT 0,  -- P9: integer WakaCU
  routing_level    INTEGER NOT NULL CHECK (routing_level BETWEEN 1 AND 5),
  duration_ms      INTEGER NOT NULL DEFAULT 0,
  finish_reason    TEXT NOT NULL DEFAULT 'stop',
  ndpr_consent_ref TEXT,                   -- P10: consent_records.id at time of call
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Per-tenant event listing (dashboard + reconciliation)
CREATE INDEX IF NOT EXISTS idx_ai_usage_tenant
  ON ai_usage_events (tenant_id, created_at DESC);

-- Per-tenant pillar analytics
CREATE INDEX IF NOT EXISTS idx_ai_usage_tenant_pillar
  ON ai_usage_events (tenant_id, pillar, created_at DESC);

-- Per-user usage (NDPR audit trail — P10)
CREATE INDEX IF NOT EXISTS idx_ai_usage_user
  ON ai_usage_events (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Billing reconciliation: find unprocessed charges by wc_charged > 0
CREATE INDEX IF NOT EXISTS idx_ai_usage_wc_charged
  ON ai_usage_events (tenant_id, wc_charged, created_at DESC)
  WHERE wc_charged > 0;
