-- Migration: 0553_control_plane_schema
-- Creates all tables for the @webwaka/control-plane package (Layers 1-5).
-- These tables were missing from production, causing 500 errors on all platform-admin menus.

-- ─── Layer 1: Subscription Packages ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscription_packages (
  id                TEXT PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  description       TEXT,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active','inactive','archived','draft')),
  is_public         INTEGER NOT NULL DEFAULT 1,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  partner_id        TEXT,
  target_audience   TEXT NOT NULL DEFAULT 'tenant' CHECK (target_audience IN ('tenant','partner','sub_partner','all')),
  superseded_by     TEXT,
  version           INTEGER NOT NULL DEFAULT 1,
  is_default        INTEGER NOT NULL DEFAULT 0,
  metadata          TEXT NOT NULL DEFAULT '{}',
  created_by        TEXT NOT NULL,
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_subscription_packages_status ON subscription_packages(status);
CREATE INDEX IF NOT EXISTS idx_subscription_packages_slug ON subscription_packages(slug);

CREATE TABLE IF NOT EXISTS package_version_history (
  id             TEXT PRIMARY KEY,
  package_id     TEXT NOT NULL REFERENCES subscription_packages(id) ON DELETE CASCADE,
  version        INTEGER NOT NULL,
  snapshot_json  TEXT NOT NULL,
  changed_by     TEXT NOT NULL,
  created_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pvh_package_id ON package_version_history(package_id);

CREATE TABLE IF NOT EXISTS billing_intervals (
  id          TEXT PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  months      INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO billing_intervals (id, code, label, months, sort_order) VALUES
  ('bi_monthly',   'monthly',   'Monthly',   1,  0),
  ('bi_quarterly', 'quarterly', 'Quarterly', 3,  1),
  ('bi_biannual',  'biannual',  'Bi-Annual', 6,  2),
  ('bi_annual',    'annual',    'Annual',    12, 3);

CREATE TABLE IF NOT EXISTS package_pricing (
  id                   TEXT PRIMARY KEY,
  package_id           TEXT NOT NULL REFERENCES subscription_packages(id) ON DELETE CASCADE,
  billing_interval_id  TEXT NOT NULL REFERENCES billing_intervals(id),
  price_kobo           INTEGER NOT NULL,
  currency             TEXT NOT NULL DEFAULT 'NGN',
  effective_from       INTEGER NOT NULL,
  effective_until      INTEGER,
  trial_days_override  INTEGER,
  is_active            INTEGER NOT NULL DEFAULT 1,
  paystack_plan_code   TEXT,
  metadata             TEXT NOT NULL DEFAULT '{}',
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL,
  UNIQUE (package_id, billing_interval_id, effective_from)
);
CREATE INDEX IF NOT EXISTS idx_package_pricing_pkg ON package_pricing(package_id);

-- ─── Layer 2: Entitlement Definitions ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS entitlement_definitions (
  id             TEXT PRIMARY KEY,
  code           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  description    TEXT,
  category       TEXT NOT NULL DEFAULT 'feature',
  value_type     TEXT NOT NULL DEFAULT 'boolean' CHECK (value_type IN ('boolean','integer','float','string')),
  default_value  TEXT NOT NULL DEFAULT 'false',
  unit           TEXT,
  is_active      INTEGER NOT NULL DEFAULT 1,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  metadata       TEXT NOT NULL DEFAULT '{}',
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_entitlement_defs_code ON entitlement_definitions(code);

CREATE TABLE IF NOT EXISTS package_entitlement_bindings (
  id                   TEXT PRIMARY KEY,
  package_id           TEXT NOT NULL REFERENCES subscription_packages(id) ON DELETE CASCADE,
  entitlement_id       TEXT NOT NULL REFERENCES entitlement_definitions(id),
  billing_interval_id  TEXT REFERENCES billing_intervals(id),
  value                TEXT NOT NULL,
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL,
  UNIQUE (package_id, entitlement_id, billing_interval_id)
);
CREATE INDEX IF NOT EXISTS idx_peb_package ON package_entitlement_bindings(package_id);

CREATE TABLE IF NOT EXISTS workspace_entitlement_overrides (
  id                TEXT PRIMARY KEY,
  workspace_id      TEXT NOT NULL,
  entitlement_id    TEXT NOT NULL REFERENCES entitlement_definitions(id),
  value             TEXT NOT NULL,
  reason            TEXT,
  granted_by        TEXT NOT NULL,
  expires_at        INTEGER,
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL,
  UNIQUE (workspace_id, entitlement_id)
);
CREATE INDEX IF NOT EXISTS idx_weo_workspace ON workspace_entitlement_overrides(workspace_id);

-- ─── Layer 3: RBAC ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS permission_definitions (
  id           TEXT PRIMARY KEY,
  code         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT,
  category     TEXT NOT NULL DEFAULT 'general',
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS custom_roles (
  id           TEXT PRIMARY KEY,
  tenant_id    TEXT,
  name         TEXT NOT NULL,
  description  TEXT,
  is_system    INTEGER NOT NULL DEFAULT 0,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_by   TEXT NOT NULL,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_custom_roles_tenant ON custom_roles(tenant_id);

CREATE TABLE IF NOT EXISTS role_permission_bindings (
  id               TEXT PRIMARY KEY,
  role_id          TEXT NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  permission_id    TEXT NOT NULL REFERENCES permission_definitions(id),
  created_at       INTEGER NOT NULL,
  UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_role_assignments (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL,
  role_id        TEXT NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  tenant_id      TEXT,
  workspace_id   TEXT,
  assigned_by    TEXT NOT NULL,
  expires_at     INTEGER,
  created_at     INTEGER NOT NULL,
  UNIQUE (user_id, role_id, workspace_id)
);
CREATE INDEX IF NOT EXISTS idx_ura_user ON user_role_assignments(user_id);

CREATE TABLE IF NOT EXISTS user_permission_overrides (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL,
  permission_id    TEXT NOT NULL REFERENCES permission_definitions(id),
  tenant_id        TEXT,
  workspace_id     TEXT,
  is_grant         INTEGER NOT NULL DEFAULT 1,
  reason           TEXT,
  granted_by       TEXT NOT NULL,
  expires_at       INTEGER,
  created_at       INTEGER NOT NULL,
  UNIQUE (user_id, permission_id, workspace_id)
);
CREATE INDEX IF NOT EXISTS idx_upo_user ON user_permission_overrides(user_id);

CREATE TABLE IF NOT EXISTS user_groups (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_by  TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS group_memberships (
  id           TEXT PRIMARY KEY,
  group_id     TEXT NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL,
  added_by     TEXT NOT NULL,
  created_at   INTEGER NOT NULL,
  UNIQUE (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_role_bindings (
  id          TEXT PRIMARY KEY,
  group_id    TEXT NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
  role_id     TEXT NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  UNIQUE (group_id, role_id)
);

CREATE TABLE IF NOT EXISTS group_permission_bindings (
  id             TEXT PRIMARY KEY,
  group_id       TEXT NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
  permission_id  TEXT NOT NULL REFERENCES permission_definitions(id) ON DELETE CASCADE,
  created_at     INTEGER NOT NULL,
  UNIQUE (group_id, permission_id)
);

-- ─── Layer 4: Delegation ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS delegation_capabilities (
  id           TEXT PRIMARY KEY,
  code         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_delegation_policies (
  id               TEXT PRIMARY KEY,
  grantor_id       TEXT NOT NULL,
  grantee_id       TEXT NOT NULL,
  capability_id    TEXT NOT NULL REFERENCES delegation_capabilities(id),
  tenant_id        TEXT,
  workspace_id     TEXT,
  expires_at       INTEGER,
  granted_by       TEXT NOT NULL,
  created_at       INTEGER NOT NULL,
  UNIQUE (grantor_id, grantee_id, capability_id, workspace_id)
);
CREATE INDEX IF NOT EXISTS idx_adp_grantee ON admin_delegation_policies(grantee_id);

-- ─── Layer 5: Configuration flags ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS configuration_flags (
  id              TEXT PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'feature',
  value_type      TEXT NOT NULL DEFAULT 'boolean',
  default_value   TEXT NOT NULL DEFAULT 'false',
  min_scope       TEXT NOT NULL DEFAULT 'platform',
  inheritable     INTEGER NOT NULL DEFAULT 1,
  is_kill_switch  INTEGER NOT NULL DEFAULT 0,
  rollout_pct     INTEGER NOT NULL DEFAULT 100,
  is_active       INTEGER NOT NULL DEFAULT 1,
  notes           TEXT,
  created_by      TEXT NOT NULL DEFAULT 'system',
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS configuration_overrides (
  id          TEXT PRIMARY KEY,
  flag_id     TEXT NOT NULL REFERENCES configuration_flags(id) ON DELETE CASCADE,
  scope       TEXT NOT NULL,
  scope_id    TEXT NOT NULL,
  value       TEXT NOT NULL,
  reason      TEXT,
  set_by      TEXT NOT NULL,
  expires_at  INTEGER,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  UNIQUE (flag_id, scope, scope_id)
);
CREATE INDEX IF NOT EXISTS idx_config_overrides_flag ON configuration_overrides(flag_id);
CREATE INDEX IF NOT EXISTS idx_config_overrides_scope ON configuration_overrides(scope, scope_id);

-- ─── Governance audit log ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS governance_audit_log (
  id             TEXT PRIMARY KEY,
  actor_id       TEXT NOT NULL,
  actor_role     TEXT NOT NULL,
  actor_level    TEXT NOT NULL,
  tenant_id      TEXT,
  partner_id     TEXT,
  workspace_id   TEXT,
  action         TEXT NOT NULL,
  resource_type  TEXT NOT NULL,
  resource_id    TEXT,
  before_json    TEXT,
  after_json     TEXT,
  request_id     TEXT,
  ip_address     TEXT,
  created_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gal_actor ON governance_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_gal_action ON governance_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_gal_resource ON governance_audit_log(resource_type, resource_id);
