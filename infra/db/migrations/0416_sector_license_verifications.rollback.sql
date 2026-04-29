-- Rollback 0416: Drop sector_license_verifications table and indexes.
DROP INDEX IF EXISTS idx_slv_reviewed_at;
DROP INDEX IF EXISTS idx_slv_vertical;
DROP INDEX IF EXISTS idx_slv_status;
DROP INDEX IF EXISTS idx_slv_workspace;
DROP TABLE IF EXISTS sector_license_verifications;
