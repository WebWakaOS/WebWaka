-- Migration 0468: Delegated Admin Governance (Layer 4)
-- Defines what configuration powers can be delegated downward through the admin hierarchy.

-- Admin delegation policies: what a higher-level admin allows lower admins to configure
CREATE TABLE IF NOT EXISTS admin_delegation_policies (
  id               TEXT NOT NULL PRIMARY KEY,
  -- Who grants this delegation
  grantor_level    TEXT NOT NULL CHECK (grantor_level IN ('super_admin','platform_admin','partner_admin','tenant_admin')),
  grantor_id       TEXT,
  -- Who receives it
  grantee_level    TEXT NOT NULL CHECK (grantee_level IN ('platform_admin','partner_admin','tenant_admin','workspace_admin')),
  grantee_id       TEXT,
  -- What they can do
  capability       TEXT NOT NULL,
  -- Ceiling constraints (JSON: limits grantor imposes on grantee's sub-delegations)
  ceiling_json     TEXT NOT NULL DEFAULT '{}',
  -- Is this an explicit allow or deny?
  effect           TEXT NOT NULL DEFAULT 'allow' CHECK (effect IN ('allow','deny')),
  -- Approval requirement before change takes effect
  requires_approval INTEGER NOT NULL DEFAULT 0,
  approver_level    TEXT,
  is_active         INTEGER NOT NULL DEFAULT 1,
  notes             TEXT,
  created_by        TEXT NOT NULL,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Delegation capability catalog: named things that can be delegated
CREATE TABLE IF NOT EXISTS delegation_capabilities (
  id          TEXT NOT NULL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'config'
              CHECK (category IN ('config','billing','members','plans','flags','audit','roles','entitlements')),
  -- Minimum grantor level needed to delegate this capability
  min_grantor_level TEXT NOT NULL DEFAULT 'super_admin'
              CHECK (min_grantor_level IN ('super_admin','platform_admin','partner_admin','tenant_admin')),
  is_sensitive INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Approval queue: pending sensitive changes awaiting approval
CREATE TABLE IF NOT EXISTS delegation_approval_queue (
  id             TEXT NOT NULL PRIMARY KEY,
  policy_id      TEXT REFERENCES admin_delegation_policies(id),
  requested_by   TEXT NOT NULL,
  requester_level TEXT NOT NULL,
  action_type    TEXT NOT NULL,
  action_payload TEXT NOT NULL DEFAULT '{}',
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected','expired')),
  reviewed_by    TEXT,
  reviewed_at    INTEGER,
  review_note    TEXT,
  expires_at     INTEGER,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Seed delegation capabilities
INSERT OR IGNORE INTO delegation_capabilities (id, code, name, description, category, min_grantor_level, is_sensitive) VALUES
  ('dc_manage_plans',         'manage_plans',          'Manage Plans',          'Create/edit subscription packages',         'plans',         'super_admin',    1),
  ('dc_manage_pricing',       'manage_pricing',        'Manage Pricing',        'Set/edit package pricing',                  'billing',       'super_admin',    1),
  ('dc_manage_entitlements',  'manage_entitlements',   'Manage Entitlements',   'Create/edit entitlement definitions',       'entitlements',  'super_admin',    1),
  ('dc_manage_roles',         'manage_roles',          'Manage Custom Roles',   'Create/edit custom roles',                  'roles',         'platform_admin', 0),
  ('dc_manage_groups',        'manage_groups',         'Manage User Groups',    'Create/edit user groups',                   'members',       'tenant_admin',   0),
  ('dc_manage_flags',         'manage_flags',          'Manage Feature Flags',  'Toggle runtime configuration flags',        'flags',         'platform_admin', 1),
  ('dc_assign_roles',         'assign_roles',          'Assign Roles',          'Assign roles to users',                     'members',       'tenant_admin',   0),
  ('dc_assign_overrides',     'assign_overrides',      'Assign Overrides',      'Grant/deny per-user permissions',           'members',       'tenant_admin',   1),
  ('dc_view_audit',           'view_audit',            'View Audit Log',        'Access governance audit trail',             'audit',         'tenant_admin',   0),
  ('dc_manage_delegation',    'manage_delegation',     'Manage Delegation',     'Configure admin delegation policies',       'config',        'super_admin',    1),
  ('dc_manage_tenants',       'manage_tenants',        'Manage Tenants',        'Create/configure tenants',                  'config',        'platform_admin', 1),
  ('dc_manage_partners',      'manage_partners',       'Manage Partners',       'Create/configure partners',                 'config',        'super_admin',    1);

CREATE INDEX IF NOT EXISTS idx_delegation_policies_grantor  ON admin_delegation_policies(grantor_level, grantor_id);
CREATE INDEX IF NOT EXISTS idx_delegation_policies_grantee  ON admin_delegation_policies(grantee_level, grantee_id);
CREATE INDEX IF NOT EXISTS idx_delegation_approval_status   ON delegation_approval_queue(status);
