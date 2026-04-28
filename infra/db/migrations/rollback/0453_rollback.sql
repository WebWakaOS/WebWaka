-- Rollback 0453: Policy Engine Phase 5 — Full 7-Domain Coverage
--
-- Removes the Phase 5 seeded rules and restores the original policy_rules
-- table schema with only the original 8 categories.
--
-- WARNING: This rollback drops the policy_rules table entirely and recreates
-- it with the original CHECK constraint. Any tenant-specific rules added
-- after migration 0453 that use 'access_control' or 'compliance_regime'
-- categories will be LOST. Backup first.

-- Remove Phase 5 seeded rules
DELETE FROM policy_rules
  WHERE id IN ('polr_inec_regime_v1','polr_group_member_list_v1','polr_broadcast_channel_v1');

-- Recreate table with original CHECK constraint (removing access_control + compliance_regime)
CREATE TABLE policy_rules_rollback (
  id              TEXT    NOT NULL,
  tenant_id       TEXT,
  workspace_id    TEXT,
  rule_key        TEXT    NOT NULL,
  version         INTEGER NOT NULL DEFAULT 1,
  category        TEXT    NOT NULL,
  scope           TEXT    NOT NULL DEFAULT 'platform',
  status          TEXT    NOT NULL DEFAULT 'published',
  title           TEXT    NOT NULL,
  description     TEXT,
  condition_json  TEXT    NOT NULL DEFAULT '{}',
  decision        TEXT    NOT NULL DEFAULT 'ALLOW',
  hitl_level      INTEGER,
  effective_from  INTEGER NOT NULL,
  effective_to    INTEGER,
  created_by      TEXT    NOT NULL DEFAULT 'system',
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  PRIMARY KEY (id),
  CHECK (category IN ('contribution_cap','content_moderation','pii_access',
                      'broadcast_gate','gotv_access','ai_gate','payout_gate','compliance')),
  CHECK (scope     IN ('platform','tenant','workspace')),
  CHECK (status    IN ('draft','published','superseded','archived')),
  CHECK (decision  IN ('ALLOW','DENY','REQUIRE_HITL')),
  CHECK (hitl_level IN (1, 2, 3) OR hitl_level IS NULL)
);

INSERT INTO policy_rules_rollback
  SELECT id, tenant_id, workspace_id, rule_key, version, category, scope, status,
         title, description, condition_json, decision, hitl_level,
         effective_from, effective_to, created_by, created_at, updated_at
  FROM policy_rules
  WHERE category NOT IN ('access_control', 'compliance_regime');

DROP TABLE policy_rules;
ALTER TABLE policy_rules_rollback RENAME TO policy_rules;

CREATE INDEX IF NOT EXISTS idx_policy_rules_key      ON policy_rules(rule_key, status);
CREATE INDEX IF NOT EXISTS idx_policy_rules_tenant   ON policy_rules(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_policy_rules_category ON policy_rules(category, scope, status);
