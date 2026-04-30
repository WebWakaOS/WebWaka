-- Migration: 0392_support_groups_fundraising_ai_configs
-- Adds SQL ai_vertical_configs rows for support-group and fundraising verticals.
--
-- IMPORTANT: This SQL table is a governance/audit record.
-- The RUNTIME AI config is the TypeScript VERTICAL_AI_CONFIGS object in
-- packages/superagent/src/vertical-ai-config.ts — that file is also updated
-- in this implementation stream.
--
-- Capability names in this table MUST match the AICapabilityType values in
-- packages/superagent/src/capability-metadata.ts (verified before insertion).
--
-- Assumption [A5]: political support groups are sensitive-sector (hitl_required=1,
-- sensitive_sector=1, max_autonomy_level=2). General support groups use the
-- same profile for safety; operators can override via admin panel.
--
-- FIX (2026-04-27): Add excluded_data_fields column to ai_vertical_configs before
-- inserting rows that reference it. Column was omitted from the original schema
-- in migration 0195_ai002_vertical_configs.sql.

ALTER TABLE ai_vertical_configs ADD COLUMN excluded_data_fields TEXT NOT NULL DEFAULT '[]';

INSERT OR IGNORE INTO ai_vertical_configs
  (id, vertical_slug, capability_set, hitl_required, sensitive_sector, max_autonomy_level, excluded_data_fields)
VALUES
  (
    'aivc-sg-001',
    'support-group',
    '["bio_generator","brand_copywriter","content_moderation","sentiment_analysis","scheduling_assistant","translation"]',
    1,
    1,
    2,
    '["voter_ref","donor_phone","pledger_phone","member_phone","bank_account_number"]'
  ),
  (
    'aivc-fr-001',
    'fundraising',
    '["bio_generator","brand_copywriter","content_moderation","sentiment_analysis","translation"]',
    1,
    0,
    2,
    '["donor_phone","pledger_phone","bank_account_number","donor_display_name"]'
  );
