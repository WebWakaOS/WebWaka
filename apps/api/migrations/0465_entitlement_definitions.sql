-- Migration 0465: Dynamic Entitlement Definitions (Layer 2)
-- Replaces hardcoded PlanConfig entitlement fields with runtime-managed definitions.

-- Entitlement definitions: the catalog of all available entitlements
CREATE TABLE IF NOT EXISTS entitlement_definitions (
  id              TEXT NOT NULL PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'feature'
                  CHECK (category IN ('feature','limit','quota','right','layer','flag')),
  value_type      TEXT NOT NULL DEFAULT 'boolean'
                  CHECK (value_type IN ('boolean','integer','float','string','json')),
  -- For limit/quota types: -1 = unlimited
  default_value   TEXT NOT NULL DEFAULT 'false',
  unit            TEXT,
  is_active       INTEGER NOT NULL DEFAULT 1,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  metadata        TEXT NOT NULL DEFAULT '{}',
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Package–entitlement bindings: what each package grants
CREATE TABLE IF NOT EXISTS package_entitlement_bindings (
  id             TEXT NOT NULL PRIMARY KEY,
  package_id     TEXT NOT NULL REFERENCES subscription_packages(id) ON DELETE CASCADE,
  entitlement_id TEXT NOT NULL REFERENCES entitlement_definitions(id) ON DELETE CASCADE,
  value          TEXT NOT NULL,
  -- Scope: global or per-billing-interval override
  billing_interval_id TEXT REFERENCES billing_intervals(id),
  notes          TEXT,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (package_id, entitlement_id, billing_interval_id)
);

-- Workspace-level entitlement overrides (per-workspace custom limits)
CREATE TABLE IF NOT EXISTS workspace_entitlement_overrides (
  id             TEXT NOT NULL PRIMARY KEY,
  workspace_id   TEXT NOT NULL,
  tenant_id      TEXT NOT NULL,
  entitlement_id TEXT NOT NULL REFERENCES entitlement_definitions(id) ON DELETE CASCADE,
  value          TEXT NOT NULL,
  reason         TEXT,
  granted_by     TEXT NOT NULL,
  expires_at     INTEGER,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (workspace_id, entitlement_id)
);

-- Seed core entitlement definitions (mapping from PLAN_CONFIGS shape)
INSERT OR IGNORE INTO entitlement_definitions (id, code, name, description, category, value_type, default_value, unit, sort_order) VALUES
  ('ent_max_users',            'max_users',              'Max Team Members',       'Maximum workspace members. -1 = unlimited',       'limit',   'integer', '3',     'users',    10),
  ('ent_max_places',           'max_places',             'Max Locations',          'Maximum managed Place nodes. -1 = unlimited',     'limit',   'integer', '1',     'places',   20),
  ('ent_max_offerings',        'max_offerings',          'Max Offerings',          'Maximum active offerings. -1 = unlimited',        'limit',   'integer', '5',     'offerings',30),
  ('ent_branding_rights',      'branding_rights',        'Custom Branding',        'Logo and colour customisation',                   'right',   'boolean', 'false', NULL,       40),
  ('ent_whitelabel_depth',     'whitelabel_depth',       'White-Label Depth',      '0=none,1=partner branding,2=full white-label',   'limit',   'integer', '0',     'level',    50),
  ('ent_delegation_rights',    'delegation_rights',      'Delegation Rights',      'Create partner sub-workspaces',                   'right',   'boolean', 'false', NULL,       60),
  ('ent_ai_rights',            'ai_rights',              'AI Features',            'Access to AI-powered features',                   'right',   'boolean', 'false', NULL,       70),
  ('ent_sensitive_sector',     'sensitive_sector_rights','Sensitive Sector Access','Political, medical regulated modules',            'right',   'boolean', 'false', NULL,       80),
  ('ent_wakapage_public',      'wakapage_public_page',   'WakaPage Public Profile','Public smart profile page',                       'feature', 'boolean', 'false', NULL,       90),
  ('ent_wakapage_analytics',   'wakapage_analytics',     'WakaPage Analytics',     'Analytics dashboard for WakaPage',                'feature', 'boolean', 'false', NULL,       100),
  ('ent_groups_enabled',       'groups_enabled',         'Groups Feature',         'Create and manage groups',                        'feature', 'boolean', 'false', NULL,       110),
  ('ent_value_movement',       'value_movement_enabled', 'Value Movement',         'Fundraising campaigns and value transfer',         'feature', 'boolean', 'false', NULL,       120),
  ('ent_layer_discovery',      'layer_discovery',        'Discovery Layer',        'Platform Discovery layer access',                 'layer',   'boolean', 'true',  NULL,       130),
  ('ent_layer_operational',    'layer_operational',      'Operational Layer',      'Platform Operational layer access',               'layer',   'boolean', 'false', NULL,       140),
  ('ent_layer_commerce',       'layer_commerce',         'Commerce Layer',         'Platform Commerce layer access',                  'layer',   'boolean', 'false', NULL,       150),
  ('ent_layer_civic',          'layer_civic',            'Civic Layer',            'Platform Civic layer access',                     'layer',   'boolean', 'false', NULL,       160),
  ('ent_layer_ai',             'layer_ai',               'AI Layer',               'Platform AI layer access',                        'layer',   'boolean', 'false', NULL,       170),
  ('ent_layer_transport',      'layer_transport',        'Transport Layer',        'Platform Transport layer access',                 'layer',   'boolean', 'false', NULL,       180),
  ('ent_layer_professional',   'layer_professional',     'Professional Layer',     'Platform Professional layer access',              'layer',   'boolean', 'false', NULL,       190),
  ('ent_layer_creator',        'layer_creator',          'Creator Layer',          'Platform Creator layer access',                   'layer',   'boolean', 'false', NULL,       200),
  ('ent_layer_political',      'layer_political',        'Political Layer',        'Platform Political layer access',                 'layer',   'boolean', 'false', NULL,       210),
  ('ent_layer_institutional',  'layer_institutional',    'Institutional Layer',    'Platform Institutional layer access',             'layer',   'boolean', 'false', NULL,       220),
  ('ent_layer_whitelabel',     'layer_whitelabel',       'White-Label Layer',      'Platform White-Label layer access',               'layer',   'boolean', 'false', NULL,       230),
  ('ent_ai_waku_cu_quota',     'ai_waku_cu_quota',       'AI Credit Quota',        'Monthly WakaCU AI credit allowance. 0=unlimited', 'quota',   'integer', '0',     'WakaCU',   240);

CREATE INDEX IF NOT EXISTS idx_entitlement_defs_code      ON entitlement_definitions(code);
CREATE INDEX IF NOT EXISTS idx_pkg_ent_bindings_package   ON package_entitlement_bindings(package_id);
CREATE INDEX IF NOT EXISTS idx_pkg_ent_bindings_ent       ON package_entitlement_bindings(entitlement_id);
CREATE INDEX IF NOT EXISTS idx_ws_ent_overrides_workspace ON workspace_entitlement_overrides(workspace_id);
