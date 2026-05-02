-- Migration 0467: User Groups, Membership, and Per-User Overrides (Layer 3 cont.)
-- Implements dynamic group hierarchy, group-role assignments, and user-level overrides.

-- User groups: logical groupings of users within a tenant/workspace
CREATE TABLE IF NOT EXISTS user_groups (
  id           TEXT NOT NULL PRIMARY KEY,
  tenant_id    TEXT NOT NULL,
  workspace_id TEXT,
  name         TEXT NOT NULL,
  description  TEXT,
  parent_id    TEXT REFERENCES user_groups(id),
  -- Group type controls what it can be used for
  group_type   TEXT NOT NULL DEFAULT 'general'
               CHECK (group_type IN ('general','department','team','access_group','admin_group')),
  is_active    INTEGER NOT NULL DEFAULT 1,
  metadata     TEXT NOT NULL DEFAULT '{}',
  created_by   TEXT NOT NULL,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Group memberships
CREATE TABLE IF NOT EXISTS group_memberships (
  id           TEXT NOT NULL PRIMARY KEY,
  group_id     TEXT NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL,
  tenant_id    TEXT NOT NULL,
  is_group_admin INTEGER NOT NULL DEFAULT 0,
  added_by     TEXT NOT NULL,
  added_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at   INTEGER,
  UNIQUE (group_id, user_id)
);

-- Group → custom role bindings (all group members inherit these roles)
CREATE TABLE IF NOT EXISTS group_role_bindings (
  group_id    TEXT NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
  role_id     TEXT NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  workspace_id TEXT,
  granted_by  TEXT NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (group_id, role_id)
);

-- Group → permission bindings (direct permission grants to groups)
CREATE TABLE IF NOT EXISTS group_permission_bindings (
  group_id      TEXT NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permission_definitions(id) ON DELETE CASCADE,
  granted       INTEGER NOT NULL DEFAULT 1,
  workspace_id  TEXT,
  granted_by    TEXT NOT NULL,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (group_id, permission_id)
);

-- Per-user permission overrides (grants or denials that override group/role defaults)
CREATE TABLE IF NOT EXISTS user_permission_overrides (
  id            TEXT NOT NULL PRIMARY KEY,
  user_id       TEXT NOT NULL,
  tenant_id     TEXT NOT NULL,
  workspace_id  TEXT,
  permission_id TEXT NOT NULL REFERENCES permission_definitions(id) ON DELETE CASCADE,
  granted       INTEGER NOT NULL DEFAULT 1,
  reason        TEXT,
  granted_by    TEXT NOT NULL,
  expires_at    INTEGER,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (user_id, workspace_id, permission_id)
);

-- Per-user custom role assignments (beyond the base membership role)
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id           TEXT NOT NULL PRIMARY KEY,
  user_id      TEXT NOT NULL,
  tenant_id    TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  role_id      TEXT NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  granted_by   TEXT NOT NULL,
  expires_at   INTEGER,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (user_id, workspace_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_groups_tenant      ON user_groups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_workspace   ON user_groups(workspace_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user  ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_user_perm_overrides     ON user_permission_overrides(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments   ON user_role_assignments(user_id, workspace_id);
