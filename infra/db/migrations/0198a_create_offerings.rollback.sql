-- Rollback for 0198a: Drop offerings table and related indexes
DROP INDEX IF EXISTS idx_offerings_published;
DROP INDEX IF EXISTS idx_offerings_workspace;
DROP INDEX IF EXISTS idx_offerings_tenant;
DROP TABLE IF EXISTS offerings;
