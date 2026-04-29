-- Rollback 0447 — image_variants
-- AC-FUNC-03: every migration has a rollback.
DROP INDEX IF EXISTS idx_image_variants_tenant_status;
DROP INDEX IF EXISTS idx_image_variants_entity;
DROP TABLE IF EXISTS image_variants;
