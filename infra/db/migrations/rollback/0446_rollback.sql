-- Rollback 0446 — Content Flags
DROP INDEX IF EXISTS idx_content_flags_content;
DROP INDEX IF EXISTS idx_content_flags_tenant_status;
DROP TABLE IF EXISTS content_flags;
