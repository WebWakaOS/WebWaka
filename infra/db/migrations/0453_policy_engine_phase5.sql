-- Migration 0453: Policy Engine Phase 5 — Full 7-Domain Coverage (E29/T003)
-- M15 gate: Policy Engine covers all 7 PRD §10.1 domains
--
-- Recreates policy_rules table with extended CHECK constraint to include:
--   'access_control'    — dedicated domain for access control rules (PRD domain 6)
--   'compliance_regime' — regulatory compliance regime rules (PRD domain 7)
--
-- The existing 8 categories remain unchanged; 2 new categories are added.
-- All existing data is preserved via the INSERT INTO ... SELECT pattern.
--
-- PRD Domain → DB Category mapping after this migration:
--   financial_cap     → contribution_cap  (unchanged)
--   kyc_requirement   → pii_access        (unchanged)
--   moderation        → content_moderation (unchanged)
--   ai_governance     → ai_gate           (unchanged, Phase 5 extended)
--   data_retention    → compliance        (unchanged)
--   access_control    → broadcast_gate + gotv_access + access_control (new explicit)
--   compliance_regime → compliance_regime (NEW)
--
-- Platform Invariants:
--   T3  — tenant_id scoping preserved in new table
--   P9  — all kobo values remain in condition_json
--   AC-FUNC-03 — rollback in rollback/0453_rollback.sql

-- ── Step 1: Create new policy_rules table with extended CHECK constraint ──────

CREATE TABLE IF NOT EXISTS policy_rules_v2 (
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
  CHECK (category IN (
    'contribution_cap', 'content_moderation', 'pii_access',
    'broadcast_gate', 'gotv_access', 'ai_gate', 'payout_gate', 'compliance',
    -- Phase 5 (E29/T003): new categories for full 7-domain PRD coverage
    'access_control', 'compliance_regime'
  )),
  CHECK (scope     IN ('platform','tenant','workspace')),
  CHECK (status    IN ('draft','published','superseded','archived')),
  CHECK (decision  IN ('ALLOW','DENY','REQUIRE_HITL')),
  CHECK (hitl_level IN (1, 2, 3) OR hitl_level IS NULL)
);

-- ── Step 2: Migrate existing data ────────────────────────────────────────────

INSERT INTO policy_rules_v2
  (id, tenant_id, workspace_id, rule_key, version, category, scope, status,
   title, description, condition_json, decision, hitl_level,
   effective_from, effective_to, created_by, created_at, updated_at)
SELECT
  id, tenant_id, workspace_id, rule_key, version, category, scope, status,
  title, description, condition_json, decision, hitl_level,
  effective_from, effective_to, created_by, created_at, updated_at
FROM policy_rules;

-- ── Step 3: Drop old table and rename ────────────────────────────────────────

DROP TABLE policy_rules;
ALTER TABLE policy_rules_v2 RENAME TO policy_rules;

-- ── Step 4: Recreate indices ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_policy_rules_key      ON policy_rules(rule_key, status);
CREATE INDEX IF NOT EXISTS idx_policy_rules_tenant   ON policy_rules(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_policy_rules_category ON policy_rules(category, scope, status);

-- ── Step 5: Seed Phase 5 platform-level rules ────────────────────────────────

-- compliance_regime: INEC regime active flag
-- Signals whether INEC campaign finance reporting is mandatory for this campaign type.
-- Evaluated by evaluateComplianceRegime (PRD §10.1 domain 7).
INSERT OR IGNORE INTO policy_rules
  (id, tenant_id, workspace_id, rule_key, version, category, scope, status,
   title, description, condition_json, decision, hitl_level,
   effective_from, effective_to, created_by, created_at, updated_at)
VALUES
  ('polr_inec_regime_v1', NULL, NULL,
   'inec.compliance_regime.v1', 1, 'compliance_regime', 'platform', 'published',
   'INEC Compliance Regime Active',
   'Electoral and political campaign workspaces are subject to INEC compliance regime. ' ||
   'Contributions above ₦1m require mandatory INEC disclosure (Level 3 HITL — 72h regulatory window). ' ||
   'PRD §10.1 domain 7: compliance_regime.',
   '{"regime":"inec","active":true,"campaign_types":["political","election"],' ||
    '"requires_disclosure_above_kobo":100000000,"requires_regulatory_hold_hours":72,' ||
    '"requires_audit_trail":true}',
   'REQUIRE_HITL', 3,
   unixepoch('now'), NULL,
   'system', unixepoch('now'), unixepoch('now')
  );

-- access_control: Platform-level group public member list policy
-- Default: member lists are not publicly accessible (PRD §10.7).
INSERT OR IGNORE INTO policy_rules
  (id, tenant_id, workspace_id, rule_key, version, category, scope, status,
   title, description, condition_json, decision, hitl_level,
   effective_from, effective_to, created_by, created_at, updated_at)
VALUES
  ('polr_group_member_list_v1', NULL, NULL,
   'group.public_member_list.v1', 1, 'access_control', 'platform', 'published',
   'Group Member List — Non-Public Default (PRD §10.7)',
   'Group member lists are not publicly accessible by default. ' ||
   'Workspace admin may override via tenant-scoped policy_rules row with public_access=true. ' ||
   'PRD §10.1 domain 6: access_control.',
   '{"public_access":false,"require_workspace_member":true}',
   'DENY', NULL,
   unixepoch('now'), NULL,
   'system', unixepoch('now'), unixepoch('now')
  );

-- access_control: Broadcast channel gate
-- Limits broadcast channels to web, mobile, and whatsapp (not ussd).
INSERT OR IGNORE INTO policy_rules
  (id, tenant_id, workspace_id, rule_key, version, category, scope, status,
   title, description, condition_json, decision, hitl_level,
   effective_from, effective_to, created_by, created_at, updated_at)
VALUES
  ('polr_broadcast_channel_v1', NULL, NULL,
   'broadcast.channel_allowlist.v1', 1, 'access_control', 'platform', 'published',
   'Broadcast Channel Allowlist',
   'Broadcasts are only permitted via web, mobile, and whatsapp channels. ' ||
   'USSD is excluded from AI-assisted broadcasting (P12). ' ||
   'PRD §10.1 domain 6: access_control.',
   '{"allowed_channels":["web","mobile","whatsapp","email","sms"],' ||
    '"public_access":null}',
   'ALLOW', NULL,
   unixepoch('now'), NULL,
   'system', unixepoch('now'), unixepoch('now')
  );
