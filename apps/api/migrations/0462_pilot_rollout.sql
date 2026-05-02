-- Migration: 0462_pilot_rollout
-- Wave 4 / Milestone 11: Pilot Rollout infrastructure
-- Creates pilot_operators and pilot_feature_flags tables for
-- controlled operator onboarding and scoped feature rollouts.

-- pilot_operators: tracks each operator enrolled in the pilot programme
CREATE TABLE IF NOT EXISTS pilot_operators (
  id                TEXT    NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tenant_id         TEXT    NOT NULL,
  workspace_id      TEXT    NOT NULL,
  vertical_slug     TEXT    NOT NULL,
  operator_name     TEXT    NOT NULL,
  contact_phone     TEXT,
  contact_email     TEXT,
  lga               TEXT,
  state             TEXT    NOT NULL DEFAULT 'Lagos',
  cohort            TEXT    NOT NULL DEFAULT 'cohort_1',  -- 'cohort_1' | 'cohort_2' | ...
  status            TEXT    NOT NULL DEFAULT 'invited',   -- 'invited' | 'onboarding' | 'active' | 'churned' | 'graduated'
  onboarded_at      TEXT,
  first_txn_at      TEXT,
  graduated_at      TEXT,
  notes             TEXT,
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now')),

  UNIQUE (tenant_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_pilot_operators_tenant
  ON pilot_operators (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_pilot_operators_cohort
  ON pilot_operators (cohort, status);

CREATE INDEX IF NOT EXISTS idx_pilot_operators_vertical
  ON pilot_operators (vertical_slug, status);

-- pilot_feature_flags: per-operator feature gate overrides
-- Complements the global KV-backed flags (wallet:flag:*) with per-tenant pilot flags.
-- e.g. tenant X gets AI chat beta; tenant Y gets new POS receipt flow.
CREATE TABLE IF NOT EXISTS pilot_feature_flags (
  id          TEXT    NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tenant_id   TEXT    NOT NULL,
  flag_name   TEXT    NOT NULL,   -- e.g. 'ai_chat_beta', 'new_pos_receipt', 'superagent_proactive'
  enabled     INTEGER NOT NULL DEFAULT 1,  -- 1 = on, 0 = off
  expires_at  TEXT,               -- NULL = permanent until explicitly removed
  reason      TEXT,               -- e.g. 'Pilot cohort 1 — restaurant vertical'
  granted_by  TEXT,               -- admin user_id who granted this flag
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),

  UNIQUE (tenant_id, flag_name)
);

CREATE INDEX IF NOT EXISTS idx_pilot_feature_flags_tenant
  ON pilot_feature_flags (tenant_id);

CREATE INDEX IF NOT EXISTS idx_pilot_feature_flags_flag
  ON pilot_feature_flags (flag_name, enabled);

-- pilot_feedback: lightweight in-app NPS / qualitative feedback from pilot operators
CREATE TABLE IF NOT EXISTS pilot_feedback (
  id            TEXT    NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tenant_id     TEXT    NOT NULL,
  workspace_id  TEXT    NOT NULL,
  user_id       TEXT    NOT NULL,
  feedback_type TEXT    NOT NULL DEFAULT 'nps',  -- 'nps' | 'bug' | 'feature_request' | 'general'
  nps_score     INTEGER CHECK (nps_score IS NULL OR (nps_score >= 0 AND nps_score <= 10)),
  message       TEXT,
  context_route TEXT,   -- which page/route they were on when submitting
  submitted_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pilot_feedback_tenant
  ON pilot_feedback (tenant_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_pilot_feedback_type
  ON pilot_feedback (feedback_type, submitted_at DESC);
