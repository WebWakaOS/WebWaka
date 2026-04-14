-- Migration: 0233_users_email_verified
-- Description: Add email_verified_at to users table (P20-C).
-- NULL = unverified; INTEGER unix epoch = time of verification.
-- Existing users are left NULL (unverified) and prompted via dashboard banner.

ALTER TABLE users ADD COLUMN email_verified_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_users_email_verified
  ON users(email_verified_at) WHERE email_verified_at IS NOT NULL;
