-- Migration: 0017_consent_records
-- Description: NDPR-compliant consent audit log.
-- (M7a: docs/governance/data-residency-ndpr.md, Platform Invariant P10)
-- Required before ANY BVN/NIN/CAC lookup or personal data processing.
-- Append-only — consent can be revoked (revoked_at set) but not deleted.

CREATE TABLE IF NOT EXISTS consent_records (
  id                TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id           TEXT NOT NULL,
  tenant_id         TEXT NOT NULL,
  data_type         TEXT NOT NULL CHECK (data_type IN (
                      'BVN','NIN','CAC','FRSC','phone','email',
                      'community_membership','payment_data','location'
                    )),
  purpose           TEXT NOT NULL,  -- Human-readable consent purpose string
  consent_text_hash TEXT NOT NULL,  -- SHA-256 of exact consent text shown to user
  consented_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  ip_hash           TEXT NOT NULL,  -- SHA-256(LOG_PII_SALT + ip) — R7 compliant
  revoked_at        INTEGER         -- NULL unless user revoked this consent
);

CREATE INDEX IF NOT EXISTS idx_consent_user_type
  ON consent_records(user_id, data_type, revoked_at);

CREATE INDEX IF NOT EXISTS idx_consent_tenant
  ON consent_records(tenant_id, consented_at DESC);

CREATE INDEX IF NOT EXISTS idx_consent_active
  ON consent_records(user_id, data_type) WHERE revoked_at IS NULL;
