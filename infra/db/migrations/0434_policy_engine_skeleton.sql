-- Migration 0434: Policy Engine schema + seed rules
-- Phase 0 per PRD: Establish policy_rules table.
-- Full rule evaluation is Phase 5. Phase 0 establishes the schema and seeds
-- platform-level rules that the Phase 5 engine will resolve.
--
-- Tenant invariant (T3): tenant_id nullable for platform-scoped rules.
-- Rollback: 0434_rollback.sql

CREATE TABLE IF NOT EXISTS policy_rules (
  id              TEXT    NOT NULL,
  tenant_id       TEXT,               -- NULL = platform scope
  workspace_id    TEXT,               -- NULL = tenant or platform scope
  rule_key        TEXT    NOT NULL,   -- namespaced: 'inec.contribution_cap.v1'
  version         INTEGER NOT NULL DEFAULT 1,
  category        TEXT    NOT NULL,
  scope           TEXT    NOT NULL DEFAULT 'platform',
  status          TEXT    NOT NULL DEFAULT 'published',
  title           TEXT    NOT NULL,
  description     TEXT,
  condition_json  TEXT    NOT NULL DEFAULT '{}',  -- JSON rule conditions
  decision        TEXT    NOT NULL DEFAULT 'ALLOW',
  hitl_level      INTEGER,             -- NULL | 1 | 2 | 3
  effective_from  INTEGER NOT NULL,
  effective_to    INTEGER,             -- NULL = no expiry
  created_by      TEXT    NOT NULL DEFAULT 'system',
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  PRIMARY KEY (id),
  CHECK (category  IN ('contribution_cap','content_moderation','pii_access',
                        'broadcast_gate','gotv_access','ai_gate','payout_gate','compliance')),
  CHECK (scope     IN ('platform','tenant','workspace')),
  CHECK (status    IN ('draft','published','superseded','archived')),
  CHECK (decision  IN ('ALLOW','DENY','REQUIRE_HITL')),
  CHECK (hitl_level IN (1, 2, 3) OR hitl_level IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_policy_rules_key      ON policy_rules(rule_key, status);
CREATE INDEX IF NOT EXISTS idx_policy_rules_tenant   ON policy_rules(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_policy_rules_category ON policy_rules(category, scope, status);

-- ============================================================
-- Seed: Platform-level rules
-- These are global rules enforced across all tenants.
-- Phase 5 evaluation engine resolves them against PolicyContext.
-- ============================================================

-- 1. INEC contribution cap: ₦50,000,000 (5,000,000,000 kobo)
INSERT OR IGNORE INTO policy_rules
  (id, tenant_id, workspace_id, rule_key, version, category, scope, status,
   title, description, condition_json, decision, hitl_level,
   effective_from, effective_to, created_by, created_at, updated_at)
VALUES
  ('polr_inec_cap_v1', NULL, NULL,
   'inec.contribution_cap.v1', 1, 'contribution_cap', 'platform', 'published',
   'INEC Political Campaign Contribution Cap (₦50m)',
   'Per INEC regulations, cumulative contributions to a single political campaign may not exceed ₦50,000,000. Applies to campaigns with campaign_type IN (''political'',''election'').',
   '{"campaignTypes":["political","election"],"maxKobo":5000000000,"cumulativePerCampaign":true}',
   'DENY', NULL,
   unixepoch('now'), NULL,
   'system', unixepoch('now'), unixepoch('now')
  );

-- 2. GOTV data access gate
INSERT OR IGNORE INTO policy_rules
  (id, tenant_id, workspace_id, rule_key, version, category, scope, status,
   title, description, condition_json, decision, hitl_level,
   effective_from, effective_to, created_by, created_at, updated_at)
VALUES
  ('polr_gotv_access_v1', NULL, NULL,
   'gotv.data_access.v1', 1, 'gotv_access', 'platform', 'published',
   'GOTV Data Access Gate',
   'GOTV voter_ref data is accessible only to authenticated coordinators with sensitiveSectorRights. voter_ref must never be passed to AI or logged.',
   '{"requiredRoles":["coordinator","manager","admin","super_admin"],"requiresSensitiveSectorRights":true,"stripFields":["voter_ref"]}',
   'ALLOW', NULL,
   unixepoch('now'), NULL,
   'system', unixepoch('now'), unixepoch('now')
  );

-- 3. AI gate: USSD channel exclusion (P12)
INSERT OR IGNORE INTO policy_rules
  (id, tenant_id, workspace_id, rule_key, version, category, scope, status,
   title, description, condition_json, decision, hitl_level,
   effective_from, effective_to, created_by, created_at, updated_at)
VALUES
  ('polr_ai_ussd_exclude_v1', NULL, NULL,
   'ai.ussd_channel.exclusion.v1', 1, 'ai_gate', 'platform', 'published',
   'AI Exclusion: USSD Channel (P12)',
   'AI capabilities (superagent, sentiment, translation) must not be invoked for requests from the USSD channel. USSD sessions are synchronous, bandwidth-constrained, and cannot wait for async AI inference.',
   '{"denyChannels":["ussd"],"denyCapabilities":["superagent_chat","sentiment_analysis","translation","content_moderation"]}',
   'DENY', NULL,
   unixepoch('now'), NULL,
   'system', unixepoch('now'), unixepoch('now')
  );

-- 4. AI gate: fetch-only, no write-back (P7)
INSERT OR IGNORE INTO policy_rules
  (id, tenant_id, workspace_id, rule_key, version, category, scope, status,
   title, description, condition_json, decision, hitl_level,
   effective_from, effective_to, created_by, created_at, updated_at)
VALUES
  ('polr_ai_fetch_only_v1', NULL, NULL,
   'ai.fetch_only.v1', 1, 'ai_gate', 'platform', 'published',
   'AI Fetch-Only Constraint (P7)',
   'AI agents must only READ data. Any AI action that would WRITE, UPDATE, or DELETE a record requires HITL approval. This prevents AI hallucination from corrupting live data.',
   '{"aiWriteActions":"REQUIRE_HITL","hitlLevelForAiWrite":2}',
   'REQUIRE_HITL', 2,
   unixepoch('now'), NULL,
   'system', unixepoch('now'), unixepoch('now')
  );

-- 5. Payout gate: HITL required for all fundraising payouts
INSERT OR IGNORE INTO policy_rules
  (id, tenant_id, workspace_id, rule_key, version, category, scope, status,
   title, description, condition_json, decision, hitl_level,
   effective_from, effective_to, created_by, created_at, updated_at)
VALUES
  ('polr_payout_hitl_v1', NULL, NULL,
   'fundraising.payout.hitl.v1', 1, 'payout_gate', 'platform', 'published',
   'Fundraising Payout HITL Gate',
   'All fundraising payout requests require HITL review before transfer. Level 2 for standard campaigns; level 3 for political campaign payouts.',
   '{"defaultHitlLevel":2,"politicalCampaignHitlLevel":3,"campaignTypes":{"political":3,"election":3}}',
   'REQUIRE_HITL', 2,
   unixepoch('now'), NULL,
   'system', unixepoch('now'), unixepoch('now')
  );

-- 6. NDPR content gate: consent required before PII capture
INSERT OR IGNORE INTO policy_rules
  (id, tenant_id, workspace_id, rule_key, version, category, scope, status,
   title, description, condition_json, decision, hitl_level,
   effective_from, effective_to, created_by, created_at, updated_at)
VALUES
  ('polr_ndpr_consent_v1', NULL, NULL,
   'ndpr.consent_required.v1', 1, 'pii_access', 'platform', 'published',
   'NDPR Consent Required Before PII Capture (P10)',
   'ndprConsented must be TRUE before any personal data (phone, email, voter_ref, financial) is written. Routes must reject requests where ndprConsented=false.',
   '{"requiresConsent":true,"piiFields":["phone","email","voter_ref","bvn","nin","bank_account_number","donor_phone"]}',
   'DENY', NULL,
   unixepoch('now'), NULL,
   'system', unixepoch('now'), unixepoch('now')
  );
