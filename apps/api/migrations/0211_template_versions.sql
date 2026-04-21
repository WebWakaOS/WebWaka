-- Migration: 0211_template_versions
-- Sprint 7 / PROD-07: Template version upgrade tracking
-- Records version history for template installations and supports upgrade path.

CREATE TABLE IF NOT EXISTS template_versions (
  id               TEXT NOT NULL PRIMARY KEY,
  template_id      TEXT NOT NULL REFERENCES template_registry(id) ON DELETE CASCADE,
  version          TEXT NOT NULL,
  changelog        TEXT NOT NULL DEFAULT '',
  manifest_json    TEXT NOT NULL DEFAULT '{}',
  published_by     TEXT,
  published_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (template_id, version)
);

CREATE INDEX IF NOT EXISTS idx_template_versions_template_id
  ON template_versions(template_id);

-- Track upgrade history per installation
CREATE TABLE IF NOT EXISTS template_upgrade_log (
  id                TEXT NOT NULL PRIMARY KEY,
  installation_id   TEXT NOT NULL REFERENCES template_installations(id) ON DELETE CASCADE,
  tenant_id         TEXT NOT NULL,
  template_id       TEXT NOT NULL,
  from_version      TEXT NOT NULL,
  to_version        TEXT NOT NULL,
  upgraded_by       TEXT NOT NULL,
  upgraded_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  config_snapshot   TEXT NOT NULL DEFAULT '{}'  -- config before upgrade
);

CREATE INDEX IF NOT EXISTS idx_upgrade_log_installation
  ON template_upgrade_log(installation_id);

CREATE INDEX IF NOT EXISTS idx_upgrade_log_tenant
  ON template_upgrade_log(tenant_id);
