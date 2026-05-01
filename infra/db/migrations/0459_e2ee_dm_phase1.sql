-- Migration 0459: E2EE DM Stage 0 — dual-mode columns (L-9 / ADR-0043)
--
-- Adds columns for Phase 1 E2EE alongside existing P14 server-side encryption.
-- encryption_version: 1 = P14 (server AES-GCM), 2 = E2EE ECDH/AES-GCM
-- Server remains able to handle both formats during migration window.

-- DM E2EE columns (expand-only — existing rows keep encryption_version = 1)
ALTER TABLE dms ADD COLUMN ciphertext_v2 TEXT;
ALTER TABLE dms ADD COLUMN iv_v2 TEXT;
ALTER TABLE dms ADD COLUMN sender_ephemeral_pubkey TEXT;
ALTER TABLE dms ADD COLUMN encryption_version INTEGER NOT NULL DEFAULT 1;

-- Profile E2EE public key (JWK JSON, stored per-user)
ALTER TABLE profiles ADD COLUMN e2e_public_key TEXT;
ALTER TABLE profiles ADD COLUMN e2e_pubkey_updated_at INTEGER;

-- Index for fast E2EE-enabled user lookup
CREATE INDEX IF NOT EXISTS idx_profiles_e2e_public_key
  ON profiles (id)
  WHERE e2e_public_key IS NOT NULL;
