-- Rollback for 0434: Drop policy_rules table and remove compliance_regime column
-- Phase 0 rollback — reverses 0434_policy_engine_skeleton.sql
--
-- WARNING: Drops all policy rules including the 6 seed rules. Execute only on
--          QA gate rejection before any tenant has activated policy enforcement.

DROP TABLE IF EXISTS policy_rules;

-- Remove compliance_regime column from fundraising_campaigns
-- (SQLite does not support DROP COLUMN before version 3.35; use table recreation)
CREATE TABLE fundraising_campaigns_tmp AS
  SELECT
    id, workspace_id, tenant_id, campaign_type, title, slug, description,
    goal_kobo, raised_kobo, currency, status, visibility, fundraiser_type,
    fundraiser_id, start_date, end_date, political_party, election_type,
    election_date, state_code, office_type, donor_wall_enabled,
    rewards_enabled, created_by, created_at, updated_at
  FROM fundraising_campaigns;

DROP TABLE fundraising_campaigns;
ALTER TABLE fundraising_campaigns_tmp RENAME TO fundraising_campaigns;
