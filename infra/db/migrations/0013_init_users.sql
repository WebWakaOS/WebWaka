-- Migration: 0013_init_users
-- Description: Platform-level user identity table.
-- (M7a: docs/governance/security-baseline.md, docs/identity/bvn-nin-guide.md)
-- Note: users.id is referenced by memberships.user_id — no FK enforced (D1 limitation).

CREATE TABLE IF NOT EXISTS users (
  id               TEXT NOT NULL PRIMARY KEY,
  email            TEXT UNIQUE,
  phone            TEXT,
  password_hash    TEXT,
  full_name        TEXT,
  -- JSON object: {sms:bool, whatsapp:bool, telegram:bool, email:bool}
  contact_channels TEXT NOT NULL DEFAULT '{}',
  kyc_status       TEXT NOT NULL DEFAULT 'unverified'
                   CHECK (kyc_status IN ('unverified','pending','verified','failed','suspended')),
  kyc_tier         TEXT NOT NULL DEFAULT 't0'
                   CHECK (kyc_tier IN ('t0','t1','t2','t3')),
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
  ON users(email) WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_phone
  ON users(phone) WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_kyc
  ON users(kyc_status, kyc_tier);
