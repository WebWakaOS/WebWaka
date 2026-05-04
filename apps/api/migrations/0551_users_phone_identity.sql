-- Migration: 0551_users_phone_identity
-- Purpose: Extend users table for phone-as-identity + OTP storage
-- Nigeria-first: phone is a first-class identity option alongside email

ALTER TABLE users ADD COLUMN phone_verified_at INTEGER;
ALTER TABLE users ADD COLUMN phone_e164 TEXT;
ALTER TABLE users ADD COLUMN identity_providers TEXT NOT NULL DEFAULT '["email"]';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_e164_tenant
  ON users (phone_e164, tenant_id)
  WHERE phone_e164 IS NOT NULL;

CREATE TABLE IF NOT EXISTS phone_otps (
  id            TEXT    PRIMARY KEY,
  phone_e164    TEXT    NOT NULL,
  tenant_id     TEXT,
  user_id       TEXT,
  purpose       TEXT    NOT NULL,
  otp_hash      TEXT    NOT NULL,
  expires_at    INTEGER NOT NULL,
  verified_at   INTEGER,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_phone_otps_lookup
  ON phone_otps (phone_e164, purpose, expires_at DESC)
  WHERE verified_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_phone_otps_expires
  ON phone_otps (expires_at)
  WHERE verified_at IS NULL;
