-- Migration: 0266_channel_providers
-- Description: Create channel_provider table — registry of provider configurations
--   per tenant per channel. Credentials stored in NOTIFICATION_KV (G16 ADL-002),
--   never in D1. Only the KV key reference is stored here.
--
-- Guardrails:
--   G13 — provider abstraction; no hardcoded provider logic in business layer
--   G16 (ADL-002) — credentials_kv_key references AES-256-GCM encrypted KV entry
--   G3  (OQ-004)  — platform_sender_fallback: "1" = use platform sender if tenant has none
--
-- Phase 1 (N-013): ChannelRouter reads from this table.
-- Phase 4 (N-053): Email domain verification uses custom_from_domain_verified.

CREATE TABLE IF NOT EXISTS channel_provider (
  id                          TEXT PRIMARY KEY,  -- 'ch_prov_' + uuid
  tenant_id                   TEXT,              -- NULL = platform default provider
  channel                     TEXT NOT NULL
    CHECK (channel IN ('email', 'sms', 'whatsapp', 'push', 'in_app', 'telegram', 'slack', 'webhook')),
  provider_name               TEXT NOT NULL,     -- e.g. 'resend', 'termii', 'meta_whatsapp', 'fcm'
  is_active                   INTEGER NOT NULL DEFAULT 1
    CHECK (is_active IN (0, 1)),
  is_platform_default         INTEGER NOT NULL DEFAULT 0  -- G3 OQ-004
    CHECK (is_platform_default IN (0, 1)),
  -- G16 ADL-002: credentials stored in KV, never in D1
  credentials_kv_key          TEXT,              -- NOTIFICATION_KV key for encrypted credentials
  -- Email-specific
  custom_from_email           TEXT,              -- e.g. 'hello@tenant.com' (G3 OQ-004)
  custom_from_name            TEXT,
  custom_from_domain          TEXT,              -- e.g. 'tenant.com'
  custom_from_domain_verified INTEGER NOT NULL DEFAULT 0  -- N-053b (Phase 4)
    CHECK (custom_from_domain_verified IN (0, 1)),
  domain_verification_token   TEXT,              -- DNS TXT record value
  domain_last_checked_at      INTEGER,           -- timestamp of last verification poll
  -- Platform sender fallback (G3 OQ-004)
  platform_sender_fallback    INTEGER NOT NULL DEFAULT 1
    CHECK (platform_sender_fallback IN (0, 1)),
  -- Provider-specific metadata
  metadata                    TEXT,              -- JSON: provider-specific config
  created_at                  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at                  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ch_prov_tenant_channel
  ON channel_provider(tenant_id, channel);

CREATE INDEX IF NOT EXISTS idx_ch_prov_platform_defaults
  ON channel_provider(channel, is_active)
  WHERE is_platform_default = 1;

CREATE INDEX IF NOT EXISTS idx_ch_prov_domain_unverified
  ON channel_provider(channel, custom_from_domain_verified, domain_last_checked_at)
  WHERE channel = 'email' AND custom_from_domain IS NOT NULL;
