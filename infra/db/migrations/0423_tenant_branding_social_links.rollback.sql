-- Rollback: 0423_tenant_branding_social_links
-- D1/SQLite: DROP COLUMN not supported in this context.
-- social_links_json is nullable and harmless if left in place.
-- To fully remove it, recreate tenant_branding from 0197 schema.

-- No-op (D1/SQLite DROP COLUMN not supported).
SELECT 1;
