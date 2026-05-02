-- Migration 0466: Dynamic Roles & Permissions (Layer 3)
-- Adds custom roles, permission definitions, permission bundles, and role-permission bindings
-- alongside (not replacing) the existing hardcoded role hierarchy.

-- Permission definitions: granular named capabilities
CREATE TABLE IF NOT EXISTS permission_definitions (
  id          TEXT NOT NULL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'general',
  scope       TEXT NOT NULL DEFAULT 'workspace'
              CHECK (scope IN ('platform','partner','tenant','workspace','self')),
  is_sensitive INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Permission bundles (grouped permissions for easier assignment)
CREATE TABLE IF NOT EXISTS permission_bundles (
  id          TEXT NOT NULL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  scope       TEXT NOT NULL DEFAULT 'workspace',
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Bundle → permission bindings
CREATE TABLE IF NOT EXISTS bundle_permission_bindings (
  bundle_id     TEXT NOT NULL REFERENCES permission_bundles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permission_definitions(id) ON DELETE CASCADE,
  PRIMARY KEY (bundle_id, permission_id)
);

-- Custom role definitions (extend the base hardcoded roles)
CREATE TABLE IF NOT EXISTS custom_roles (
  id           TEXT NOT NULL PRIMARY KEY,
  tenant_id    TEXT,
  partner_id   TEXT,
  code         TEXT NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  -- base_role: the built-in role this custom role derives from (ceiling)
  base_role    TEXT NOT NULL DEFAULT 'member'
               CHECK (base_role IN ('super_admin','admin','manager','agent','cashier','member')),
  -- max_grantable_role: the highest role this role can assign to others
  max_grantable_role TEXT NOT NULL DEFAULT 'member'
               CHECK (max_grantable_role IN ('super_admin','admin','manager','agent','cashier','member')),
  is_active    INTEGER NOT NULL DEFAULT 1,
  is_system    INTEGER NOT NULL DEFAULT 0,
  metadata     TEXT NOT NULL DEFAULT '{}',
  created_by   TEXT NOT NULL,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (tenant_id, code),
  UNIQUE (partner_id, code)
);

-- Role → permission bindings (which permissions a custom role grants)
CREATE TABLE IF NOT EXISTS role_permission_bindings (
  role_id       TEXT NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permission_definitions(id) ON DELETE CASCADE,
  granted       INTEGER NOT NULL DEFAULT 1,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (role_id, permission_id)
);

-- Role → bundle bindings (assign entire permission bundles to a role)
CREATE TABLE IF NOT EXISTS role_bundle_bindings (
  role_id    TEXT NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  bundle_id  TEXT NOT NULL REFERENCES permission_bundles(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (role_id, bundle_id)
);

-- Seed core permission definitions
INSERT OR IGNORE INTO permission_definitions (id, code, name, description, category, scope, is_sensitive) VALUES
  ('perm_view_billing',        'billing.view',           'View Billing',           'View subscription and billing info',     'billing',     'workspace', 0),
  ('perm_manage_billing',      'billing.manage',         'Manage Billing',         'Change plans and payment methods',       'billing',     'workspace', 1),
  ('perm_view_members',        'members.view',           'View Members',           'View workspace member list',             'membership',  'workspace', 0),
  ('perm_invite_members',      'members.invite',         'Invite Members',         'Invite new members',                    'membership',  'workspace', 0),
  ('perm_remove_members',      'members.remove',         'Remove Members',         'Remove workspace members',              'membership',  'workspace', 1),
  ('perm_manage_roles',        'roles.manage',           'Manage Roles',           'Assign and revoke roles',               'membership',  'workspace', 1),
  ('perm_view_analytics',      'analytics.view',         'View Analytics',         'Access analytics dashboards',           'analytics',   'workspace', 0),
  ('perm_export_data',         'data.export',            'Export Data',            'Export workspace data',                 'data',        'workspace', 1),
  ('perm_manage_offerings',    'offerings.manage',       'Manage Offerings',       'Create/edit/delete offerings',          'catalog',     'workspace', 0),
  ('perm_manage_places',       'places.manage',          'Manage Locations',       'Create/edit/delete places',             'catalog',     'workspace', 0),
  ('perm_manage_branding',     'branding.manage',        'Manage Branding',        'Edit workspace branding',               'brand',       'workspace', 0),
  ('perm_manage_ai',           'ai.manage',              'Manage AI Features',     'Configure AI capabilities',             'ai',          'workspace', 0),
  ('perm_view_audit',          'audit.view',             'View Audit Log',         'Access governance audit trail',         'audit',       'tenant',    0),
  ('perm_manage_tenants',      'tenants.manage',         'Manage Tenants',         'Create and configure tenants',          'admin',       'platform',  1),
  ('perm_manage_partners',     'partners.manage',        'Manage Partners',        'Create and configure partners',         'admin',       'platform',  1),
  ('perm_manage_plans',        'plans.manage',           'Manage Plans',           'Create/edit subscription packages',     'admin',       'platform',  1),
  ('perm_manage_entitlements', 'entitlements.manage',    'Manage Entitlements',    'Edit entitlement definitions',          'admin',       'platform',  1),
  ('perm_manage_flags',        'flags.manage',           'Manage Feature Flags',   'Create/toggle runtime config flags',    'admin',       'platform',  1),
  ('perm_manage_delegation',   'delegation.manage',      'Manage Delegation',      'Configure admin delegation policies',   'admin',       'platform',  1),
  ('perm_view_platform_audit', 'platform.audit.view',    'View Platform Audit',    'Access platform-wide audit log',        'audit',       'platform',  0);

CREATE INDEX IF NOT EXISTS idx_permission_defs_code  ON permission_definitions(code);
CREATE INDEX IF NOT EXISTS idx_custom_roles_tenant   ON custom_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_roles_partner  ON custom_roles(partner_id);
CREATE INDEX IF NOT EXISTS idx_role_perm_bindings    ON role_permission_bindings(role_id);
