-- Rollback: P14-C FTS5 template search
DROP TRIGGER IF EXISTS template_registry_ad;
DROP TRIGGER IF EXISTS template_registry_au;
DROP TRIGGER IF EXISTS template_registry_ai;
DROP TABLE IF EXISTS template_fts;
