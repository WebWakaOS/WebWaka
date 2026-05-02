-- Migration: 0463_pilot_cohort1_seed
-- Wave 4 (M11) — Pilot Cohort 1 seed data
--
-- Seeds 5 pilot operators across key verticals for the initial controlled rollout.
-- All tenants are fictional test fixtures; replace tenant_id / workspace_id values
-- before applying to production (or use the platform-admin API to enrol real operators).
--
-- Feature flags granted:
--   ai_chat_beta          — Superagent AI chat access (all cohort_1 tenants)
--   superagent_proactive  — Proactive insights & nudges (all cohort_1 tenants)
--
-- Scheduled job seed:
--   pilot-prune-expired-flags — daily at 02:00 UTC
--
-- Rollback: 0463_pilot_cohort1_seed.rollback.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- Pilot Operators — Cohort 1
-- ─────────────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO pilot_operators
  (id, tenant_id, workspace_id, vertical_slug, operator_name,
   contact_phone, contact_email, lga, state, cohort, status,
   notes, created_at, updated_at)
VALUES
  (
    'pop_c1_001',
    'tenant_pilot_c1_001', 'ws_pilot_c1_001',
    'restaurant', 'Iya Basira Kitchen',
    '+2348100000001', 'iyabasira@example.ng',
    'Surulere', 'Lagos', 'cohort_1', 'invited',
    'Referred by field agent — high-volume lunch trade',
    datetime('now'), datetime('now')
  ),
  (
    'pop_c1_002',
    'tenant_pilot_c1_002', 'ws_pilot_c1_002',
    'restaurant', 'Chef Kunle Bites',
    '+2348100000002', 'chefkunle@example.ng',
    'Yaba', 'Lagos', 'cohort_1', 'invited',
    'Popular with office workers; accepts transfers already',
    datetime('now'), datetime('now')
  ),
  (
    'pop_c1_003',
    'tenant_pilot_c1_003', 'ws_pilot_c1_003',
    'pharmacy', 'Healing Hands Pharmacy',
    '+2348100000003', 'healinghands@example.ng',
    'Ikeja', 'Lagos', 'cohort_1', 'invited',
    'Independent pharmacy; owner is tech-comfortable',
    datetime('now'), datetime('now')
  ),
  (
    'pop_c1_004',
    'tenant_pilot_c1_004', 'ws_pilot_c1_004',
    'logistics-delivery', 'SwiftMove Logistics',
    '+2348100000004', 'swiftmove@example.ng',
    'Apapa', 'Lagos', 'cohort_1', 'invited',
    'Last-mile delivery; needs route management + wallet payout',
    datetime('now'), datetime('now')
  ),
  (
    'pop_c1_005',
    'tenant_pilot_c1_005', 'ws_pilot_c1_005',
    'motor-park', 'Oshodi Express Motor Park',
    '+2348100000005', 'oshodiexpress@example.ng',
    'Oshodi-Isale', 'Lagos', 'cohort_1', 'invited',
    'High-traffic park; chairman is interested in digital ticketing',
    datetime('now'), datetime('now')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Feature Flags — grant ai_chat_beta + superagent_proactive to all cohort_1
-- ─────────────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO pilot_feature_flags
  (id, tenant_id, flag_name, enabled, expires_at, reason, granted_by, created_at)
VALUES
  -- Cohort 1 — Iya Basira Kitchen
  ('pff_c1_001_ai',    'tenant_pilot_c1_001', 'ai_chat_beta',         1, NULL, 'Cohort 1 pilot access', 'system_seed', datetime('now')),
  ('pff_c1_001_pro',   'tenant_pilot_c1_001', 'superagent_proactive', 1, NULL, 'Cohort 1 pilot access', 'system_seed', datetime('now')),
  -- Cohort 1 — Chef Kunle Bites
  ('pff_c1_002_ai',    'tenant_pilot_c1_002', 'ai_chat_beta',         1, NULL, 'Cohort 1 pilot access', 'system_seed', datetime('now')),
  ('pff_c1_002_pro',   'tenant_pilot_c1_002', 'superagent_proactive', 1, NULL, 'Cohort 1 pilot access', 'system_seed', datetime('now')),
  -- Cohort 1 — Healing Hands Pharmacy
  ('pff_c1_003_ai',    'tenant_pilot_c1_003', 'ai_chat_beta',         1, NULL, 'Cohort 1 pilot access', 'system_seed', datetime('now')),
  ('pff_c1_003_pro',   'tenant_pilot_c1_003', 'superagent_proactive', 1, NULL, 'Cohort 1 pilot access', 'system_seed', datetime('now')),
  -- Cohort 1 — SwiftMove Logistics
  ('pff_c1_004_ai',    'tenant_pilot_c1_004', 'ai_chat_beta',         1, NULL, 'Cohort 1 pilot access', 'system_seed', datetime('now')),
  ('pff_c1_004_pro',   'tenant_pilot_c1_004', 'superagent_proactive', 1, NULL, 'Cohort 1 pilot access', 'system_seed', datetime('now')),
  -- Cohort 1 — Oshodi Express Motor Park
  ('pff_c1_005_ai',    'tenant_pilot_c1_005', 'ai_chat_beta',         1, NULL, 'Cohort 1 pilot access', 'system_seed', datetime('now')),
  ('pff_c1_005_pro',   'tenant_pilot_c1_005', 'superagent_proactive', 1, NULL, 'Cohort 1 pilot access', 'system_seed', datetime('now'));

-- ─────────────────────────────────────────────────────────────────────────────
-- Scheduler job registration — pilot-prune-expired-flags
-- ─────────────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO scheduled_jobs
  (name, description, enabled, run_interval_seconds, next_run_at, priority)
VALUES
  (
    'pilot-prune-expired-flags',
    'Wave 4 (M11): Delete expired per-tenant pilot feature flags from pilot_feature_flags.',
    1,
    86400,           -- run daily
    unixepoch(),     -- eligible immediately on first deploy
    30               -- normal priority
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Scheduler job registration — pilot-health-log
-- ─────────────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO scheduled_jobs
  (name, description, enabled, run_interval_seconds, next_run_at, priority)
VALUES
  (
    'pilot-health-log',
    'Wave 4 (M11): Daily cohort health summary — logs operator status counts + 7-day NPS snapshot.',
    1,
    86400,           -- run daily
    unixepoch(),     -- eligible immediately on first deploy
    25               -- slightly lower priority than prune job
  );
