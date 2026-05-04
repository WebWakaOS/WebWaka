-- Migration: 0545_pilot_cohort1_seed
-- Seeds Pilot Cohort 1: 5 operators across key verticals,
-- 10 feature flags (ai_superagent + pro_features per operator),
-- and 2 scheduled maintenance jobs.
-- Recreated as 0545 (originally 0463_pilot_cohort1_seed — file lost during repo cleanup).
-- Safe to run on staging and production (INSERT OR IGNORE).

-- ── Cohort 1 Pilot Operators ────────────────────────────────────────────────────
INSERT OR IGNORE INTO pilot_operators (
  id, tenant_id, workspace_id, vertical_slug, operator_name,
  contact_email, lga, state, cohort, status, created_at, updated_at
) VALUES
  ('pop_c1_001',
   '10000000-0000-4000-b000-000000000001',
   '20000000-0000-4000-c000-000000000001',
   'pos_retail', 'Chukwudi Okafor — Lagos POS Pilot',
   'chukwudi@tenant-a.test', 'Ikeja', 'Lagos',
   'cohort_1', 'active',
   datetime('now'), datetime('now')),

  ('pop_c1_002',
   '10000000-0000-4000-b000-000000000002',
   '20000000-0000-4000-c000-000000000002',
   'restaurant', 'Fatima Bello — Abuja Food Court Pilot',
   'fatima@tenant-b.test', 'Garki', 'FCT',
   'cohort_1', 'active',
   datetime('now'), datetime('now')),

  ('pop_c1_003',
   '10000000-0000-4000-b000-000000000003',
   '20000000-0000-4000-c000-000000000003',
   'pharmacy', 'Ngozi Eze — Enugu Pharmacy Pilot',
   'ngozi@tenant-c.test', 'Enugu North', 'Enugu',
   'cohort_1', 'onboarding',
   datetime('now'), datetime('now')),

  ('pop_c1_004',
   '10000000-0000-4000-b000-000000000004',
   '20000000-0000-4000-c000-000000000004',
   'legal', 'Emeka Obi — Port Harcourt Law Pilot',
   'emeka@tenant-d.test', 'Port Harcourt', 'Rivers',
   'cohort_1', 'invited',
   datetime('now'), datetime('now')),

  ('pop_c1_005',
   '10000000-0000-4000-b000-000000000005',
   '20000000-0000-4000-c000-000000000005',
   'cooperative', 'Adaeze Nwosu — Kano Cooperative Pilot',
   'adaeze@tenant-e.test', 'Kano Municipal', 'Kano',
   'cohort_1', 'invited',
   datetime('now'), datetime('now'));

-- ── Cohort 1 Feature Flags ──────────────────────────────────────────────────────
-- Two flags per operator: ai_superagent (advanced AI access) and pro_features (pro tier)

INSERT OR IGNORE INTO pilot_feature_flags (
  id, tenant_id, flag_name, enabled,
  reason, granted_by, created_at
) VALUES
  ('pff_c1_001_ai', '10000000-0000-4000-b000-000000000001',
   'ai_superagent', 1, 'Cohort 1 pilot — AI access enabled', 'platform_admin', datetime('now')),
  ('pff_c1_001_pro', '10000000-0000-4000-b000-000000000001',
   'pro_features', 1, 'Cohort 1 pilot — Pro tier enabled', 'platform_admin', datetime('now')),

  ('pff_c1_002_ai', '10000000-0000-4000-b000-000000000002',
   'ai_superagent', 1, 'Cohort 1 pilot — AI access enabled', 'platform_admin', datetime('now')),
  ('pff_c1_002_pro', '10000000-0000-4000-b000-000000000002',
   'pro_features', 1, 'Cohort 1 pilot — Pro tier enabled', 'platform_admin', datetime('now')),

  ('pff_c1_003_ai', '10000000-0000-4000-b000-000000000003',
   'ai_superagent', 1, 'Cohort 1 pilot — AI access enabled', 'platform_admin', datetime('now')),
  ('pff_c1_003_pro', '10000000-0000-4000-b000-000000000003',
   'pro_features', 1, 'Cohort 1 pilot — Pro tier enabled', 'platform_admin', datetime('now')),

  ('pff_c1_004_ai', '10000000-0000-4000-b000-000000000004',
   'ai_superagent', 1, 'Cohort 1 pilot — AI access enabled', 'platform_admin', datetime('now')),
  ('pff_c1_004_pro', '10000000-0000-4000-b000-000000000004',
   'pro_features', 1, 'Cohort 1 pilot — Pro tier enabled', 'platform_admin', datetime('now')),

  ('pff_c1_005_ai', '10000000-0000-4000-b000-000000000005',
   'ai_superagent', 1, 'Cohort 1 pilot — AI access enabled', 'platform_admin', datetime('now')),
  ('pff_c1_005_pro', '10000000-0000-4000-b000-000000000005',
   'pro_features', 1, 'Cohort 1 pilot — Pro tier enabled', 'platform_admin', datetime('now'));

-- ── Scheduled Maintenance Jobs ───────────────────────────────────────────────────
INSERT OR IGNORE INTO scheduled_jobs (
  name, enabled, priority, run_interval_seconds, next_run_at
) VALUES
  ('pilot-prune-expired-flags', 1, 5, 86400, 0),
  ('pilot-health-log',          1, 5, 86400, 0);
