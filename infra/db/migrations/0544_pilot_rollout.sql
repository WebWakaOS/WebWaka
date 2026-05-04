-- Migration: 0544_pilot_rollout
-- Creates pilot rollout infrastructure tables for Wave 4 / Milestone 11.
-- Recreated as 0544 (originally 0462_pilot_rollout — file lost during repo cleanup).
-- Idempotent: all statements use IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.

-- ── Pilot Operators ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pilot_operators (
  id                TEXT PRIMARY KEY,
  tenant_id         TEXT NOT NULL,
  workspace_id      TEXT NOT NULL,
  vertical_slug     TEXT NOT NULL,
  operator_name     TEXT NOT NULL,
  contact_phone     TEXT,
  contact_email     TEXT,
  lga               TEXT,
  state             TEXT NOT NULL DEFAULT 'Lagos',
  cohort            TEXT NOT NULL DEFAULT 'cohort_1',
  status            TEXT NOT NULL DEFAULT 'invited'
                      CHECK(status IN ('invited','onboarding','active','churned','graduated')),
  onboarded_at      TEXT,
  first_txn_at      TEXT,
  graduated_at      TEXT,
  notes             TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

-- ── Pilot Feature Flags ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pilot_feature_flags (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  flag_name   TEXT NOT NULL,
  enabled     INTEGER NOT NULL DEFAULT 1,
  expires_at  TEXT,
  reason      TEXT,
  granted_by  TEXT,
  created_at  TEXT NOT NULL,
  UNIQUE(tenant_id, flag_name)
);

-- ── Pilot Feedback ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pilot_feedback (
  id             TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL,
  workspace_id   TEXT NOT NULL,
  user_id        TEXT NOT NULL,
  feedback_type  TEXT NOT NULL
                   CHECK(feedback_type IN ('nps','bug','feature_request','general')),
  nps_score      INTEGER,
  message        TEXT,
  context_route  TEXT,
  submitted_at   TEXT NOT NULL
);

-- ── Indexes ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pilot_operators_tenant
  ON pilot_operators(tenant_id);

CREATE INDEX IF NOT EXISTS idx_pilot_operators_cohort
  ON pilot_operators(cohort, status);

CREATE INDEX IF NOT EXISTS idx_pilot_feature_flags_tenant
  ON pilot_feature_flags(tenant_id);

CREATE INDEX IF NOT EXISTS idx_pilot_feature_flags_name
  ON pilot_feature_flags(tenant_id, flag_name);

CREATE INDEX IF NOT EXISTS idx_pilot_feedback_tenant
  ON pilot_feedback(tenant_id, submitted_at);
