-- Migration: 0016_kyc_records
-- Description: Append-only KYC audit trail for all identity verification events.
-- (M7a: docs/governance/entitlement-model.md, docs/identity/bvn-nin-guide.md)
-- Invariant: NO UPDATE, NO DELETE on this table. Compliance audit trail.

CREATE TABLE IF NOT EXISTS kyc_records (
  id                TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id      TEXT NOT NULL,
  tenant_id         TEXT NOT NULL,
  user_id           TEXT NOT NULL,
  record_type       TEXT NOT NULL CHECK (record_type IN ('BVN','NIN','CAC','FRSC')),
  provider          TEXT NOT NULL CHECK (provider IN ('prembly','paystack','smile_id','youverify','nimc','manual')),
  reference_id      TEXT,           -- Provider's transaction reference
  status            TEXT NOT NULL CHECK (status IN ('verified','failed','pending')),
  verified_at       INTEGER,
  raw_response_hash TEXT,           -- SHA-256 of stripped response (no PII)
  created_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_kyc_user
  ON kyc_records(user_id, record_type);

CREATE INDEX IF NOT EXISTS idx_kyc_workspace
  ON kyc_records(workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_kyc_tenant_type
  ON kyc_records(tenant_id, record_type, status);
