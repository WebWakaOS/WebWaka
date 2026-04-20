-- Rollback: 0275_tenant_branding_notification_columns
-- SQLite does not support DROP COLUMN in all versions.
-- Rollback recreates the table without the new columns.

CREATE TABLE IF NOT EXISTS tenant_branding_old AS SELECT
  id, tenant_id, primary_color, secondary_color, accent_color,
  font_family, logo_url, favicon_url, border_radius_px, custom_domain,
  display_name, created_at, updated_at
FROM tenant_branding;

DROP TABLE tenant_branding;

ALTER TABLE tenant_branding_old RENAME TO tenant_branding;

CREATE INDEX IF NOT EXISTS idx_tenant_branding_tenant_id ON tenant_branding(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_branding_custom_domain
  ON tenant_branding(custom_domain) WHERE custom_domain IS NOT NULL;
