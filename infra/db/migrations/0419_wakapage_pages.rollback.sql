-- Rollback: 0419_wakapage_pages
-- Safe: wakapage_pages is a new table with no dependents in Phase 1.
-- wakapage_blocks (0420) depends on this table; apply 0420 rollback first.

DROP INDEX IF EXISTS idx_wakapage_pages_publication_state;
DROP INDEX IF EXISTS idx_wakapage_pages_profile_id;
DROP INDEX IF EXISTS idx_wakapage_pages_tenant_slug;
DROP INDEX IF EXISTS idx_wakapage_pages_tenant_workspace;
DROP TABLE IF EXISTS wakapage_pages;
