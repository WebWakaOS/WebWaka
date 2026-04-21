-- 0207: Template installations — tracks which templates are installed per tenant
-- Part of WebWaka 1.0.1 Template Architecture (Sprint 1, Task 1.2)
-- T3: tenant_id required on every record; T4: no monetary fields here

CREATE TABLE IF NOT EXISTS template_installations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  template_id TEXT NOT NULL REFERENCES template_registry(id),
  template_version TEXT NOT NULL,
  installed_at INTEGER NOT NULL,
  installed_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','rolled_back','failed')),
  config_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE(tenant_id, template_id)
);

CREATE INDEX idx_template_installations_tenant ON template_installations(tenant_id);
CREATE INDEX idx_template_installations_template ON template_installations(template_id);
CREATE INDEX idx_template_installations_status ON template_installations(status);
