-- Rollback: 0421_wakapage_leads
-- Safe: wakapage_leads is a new table with no dependents in Phase 1.

DROP INDEX IF EXISTS idx_wakapage_leads_created_at;
DROP INDEX IF EXISTS idx_wakapage_leads_tenant_status;
DROP INDEX IF EXISTS idx_wakapage_leads_tenant_page;
DROP TABLE IF EXISTS wakapage_leads;
