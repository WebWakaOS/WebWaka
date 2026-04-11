-- Rollback migration 0198
DROP INDEX IF EXISTS idx_contact_submissions_tenant;
DROP TABLE IF EXISTS contact_submissions;
