-- Rollback: 0228_template_render_overrides
-- Removes the per-page template override table and its indexes.
-- Safe to run multiple times (IF EXISTS guards).

DROP INDEX IF EXISTS idx_tro_installation;
DROP INDEX IF EXISTS idx_tro_tenant_page;
DROP TABLE IF EXISTS template_render_overrides;
