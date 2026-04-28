-- Rollback 0448 — whatsapp_templates
-- AC-FUNC-03: every migration has a rollback.
DROP INDEX IF EXISTS idx_whatsapp_templates_defaults;
DROP INDEX IF EXISTS idx_whatsapp_templates_tenant;
DROP TABLE IF EXISTS whatsapp_templates;
