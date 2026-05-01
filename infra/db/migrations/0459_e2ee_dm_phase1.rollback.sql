-- Rollback for 0459_e2ee_dm_phase1.sql
-- SQLite does not support DROP COLUMN prior to 3.35.0.
-- D1 (SQLite 3.45) does support it, but rolling back requires no data in the new columns.

ALTER TABLE dms DROP COLUMN ciphertext_v2;
ALTER TABLE dms DROP COLUMN iv_v2;
ALTER TABLE dms DROP COLUMN sender_ephemeral_pubkey;
ALTER TABLE dms DROP COLUMN encryption_version;

ALTER TABLE profiles DROP COLUMN e2e_public_key;
ALTER TABLE profiles DROP COLUMN e2e_pubkey_updated_at;

DROP INDEX IF EXISTS idx_profiles_e2e_public_key;
