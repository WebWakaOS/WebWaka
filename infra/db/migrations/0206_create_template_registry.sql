-- 0206: Template registry — stores all template manifests for the template marketplace
-- Part of WebWaka 1.0.1 Template Architecture (Sprint 1, Task 1.2)
-- T3: author_tenant_id scoped; T4: price_kobo INTEGER

CREATE TABLE IF NOT EXISTS template_registry (
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
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_template_registry_type ON template_registry(template_type);
CREATE INDEX idx_template_registry_status ON template_registry(status);
CREATE INDEX idx_template_registry_slug ON template_registry(slug);
CREATE INDEX idx_template_registry_author ON template_registry(author_tenant_id);
