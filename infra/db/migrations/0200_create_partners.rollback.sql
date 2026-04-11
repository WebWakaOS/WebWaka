-- Rollback: 0200_create_partners
DROP INDEX IF EXISTS idx_partners_status;
DROP INDEX IF EXISTS idx_partners_workspace_id;
DROP INDEX IF EXISTS idx_partners_tenant_id;
DROP TABLE IF EXISTS partners;
