-- Rollback: 0551_users_phone_identity
DROP INDEX IF EXISTS idx_phone_otps_expires;
DROP INDEX IF EXISTS idx_phone_otps_lookup;
DROP TABLE IF EXISTS phone_otps;
DROP INDEX IF EXISTS idx_users_phone_e164_tenant;
-- Note: ALTER TABLE DROP COLUMN not available in D1
-- Columns phone_verified_at, phone_e164, identity_providers remain as no-ops
