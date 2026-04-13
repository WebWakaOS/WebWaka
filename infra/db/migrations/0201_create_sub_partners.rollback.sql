-- Rollback: 0201_create_sub_partners
DROP INDEX IF EXISTS idx_sub_partners_status;
DROP INDEX IF EXISTS idx_sub_partners_workspace_id;
DROP INDEX IF EXISTS idx_sub_partners_tenant_id;
DROP INDEX IF EXISTS idx_sub_partners_partner_id;
DROP TABLE IF EXISTS sub_partners;
