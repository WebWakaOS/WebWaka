-- Rollback 0444 — Group Extension Tables
DROP INDEX IF EXISTS idx_group_cooperative_ext_tenant;
DROP TABLE IF EXISTS group_cooperative_extensions;
DROP INDEX IF EXISTS idx_group_faith_ext_tenant;
DROP TABLE IF EXISTS group_faith_extensions;
DROP INDEX IF EXISTS idx_group_civic_beneficiaries_group;
DROP TABLE IF EXISTS group_civic_beneficiaries;
DROP INDEX IF EXISTS idx_group_civic_ext_tenant;
DROP TABLE IF EXISTS group_civic_extensions;
