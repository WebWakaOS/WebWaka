-- Rollback for 0415_template_registry_rejected_status
-- Recreates the original CHECK constraint without 'rejected'.
-- WARNING: rows with status='rejected' will fail INSERT into the new table; we
-- bulk-update them to 'draft' first so rollback never loses data.

UPDATE template_registry SET status = 'draft' WHERE status = 'rejected';

CREATE TABLE template_registry_old (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK(template_type IN ('dashboard','website','vertical-blueprint','workflow','email','module')),
  version TEXT NOT NULL,
  platform_compat TEXT NOT NULL,
  compatible_verticals TEXT NOT NULL DEFAULT '[]',
  manifest_json TEXT NOT NULL,
  author_tenant_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','pending_review','approved','deprecated')),
  is_free INTEGER NOT NULL DEFAULT 1,
  price_kobo INTEGER NOT NULL DEFAULT 0,
  install_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT INTO template_registry_old
  SELECT id, slug, display_name, description, template_type, version,
         platform_compat, compatible_verticals, manifest_json, author_tenant_id,
         status, is_free, price_kobo, install_count, tags, created_at, updated_at
  FROM template_registry;

DROP TABLE template_registry;
ALTER TABLE template_registry_old RENAME TO template_registry;

CREATE INDEX IF NOT EXISTS idx_template_registry_type ON template_registry(template_type);
CREATE INDEX IF NOT EXISTS idx_template_registry_status ON template_registry(status);
CREATE INDEX IF NOT EXISTS idx_template_registry_slug ON template_registry(slug);
CREATE INDEX IF NOT EXISTS idx_template_registry_author ON template_registry(author_tenant_id);
