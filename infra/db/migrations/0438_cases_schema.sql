-- Migration 0438: Cases + Case Notes schema
-- Phase 1 — UMP Cases module (create→assign→note→resolve lifecycle)
--
-- T3:  tenant_id on every row
-- P10: case data may contain PII; NDPR consent tracked via cases.ndpr_consented
-- P4:  no vertical-specific columns in core cases table
--
-- Rollback: see end of file

-- ────────────────────────────────────────────────────────────────
-- cases table
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id                TEXT        NOT NULL PRIMARY KEY,
  tenant_id         TEXT        NOT NULL,
  workspace_id      TEXT        NOT NULL,
  title             TEXT        NOT NULL,
  description       TEXT,
  status            TEXT        NOT NULL DEFAULT 'open',
    -- open | assigned | in_progress | pending_review | resolved | closed | reopened
  priority          TEXT        NOT NULL DEFAULT 'normal',
    -- low | normal | high | urgent
  category          TEXT        NOT NULL DEFAULT 'general',
    -- general | complaint | inquiry | support | compliance | electoral | welfare
  source_channel    TEXT        NOT NULL DEFAULT 'web',
    -- web | ussd | whatsapp | sms | voice | in_person | api
  group_id          TEXT,
  reported_by_user_id TEXT,
  assigned_to_user_id TEXT,
  assigned_at       INTEGER,
  resolved_at       INTEGER,
  closed_at         INTEGER,
  sla_due_at        INTEGER,
  ndpr_consented    INTEGER     NOT NULL DEFAULT 0, -- 0=no, 1=yes (P10)
  tags              TEXT        NOT NULL DEFAULT '[]', -- JSON array
  metadata_json     TEXT        NOT NULL DEFAULT '{}',
  created_at        INTEGER     NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER     NOT NULL DEFAULT (unixepoch()),

  -- Status constraint
  CHECK (status IN ('open','assigned','in_progress','pending_review','resolved','closed','reopened')),
  CHECK (priority IN ('low','normal','high','urgent')),
  CHECK (category IN ('general','complaint','inquiry','support','compliance','electoral','welfare')),
  CHECK (ndpr_consented IN (0,1))
);

CREATE INDEX IF NOT EXISTS idx_cases_tenant_id        ON cases (tenant_id);
CREATE INDEX IF NOT EXISTS idx_cases_workspace_id     ON cases (workspace_id);
CREATE INDEX IF NOT EXISTS idx_cases_status           ON cases (status);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to      ON cases (assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_cases_group_id         ON cases (group_id);
CREATE INDEX IF NOT EXISTS idx_cases_sla              ON cases (sla_due_at) WHERE sla_due_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cases_created_at       ON cases (created_at);

-- ────────────────────────────────────────────────────────────────
-- case_notes table (append-only)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_notes (
  id          TEXT    NOT NULL PRIMARY KEY,
  case_id     TEXT    NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  tenant_id   TEXT    NOT NULL,
  author_id   TEXT    NOT NULL,
  note_type   TEXT    NOT NULL DEFAULT 'comment',
    -- comment | status_change | assignment | system | resolution
  body        TEXT    NOT NULL,
  is_internal INTEGER NOT NULL DEFAULT 0, -- internal notes not visible to reporter
  metadata_json TEXT  NOT NULL DEFAULT '{}',
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),

  CHECK (note_type IN ('comment','status_change','assignment','system','resolution')),
  CHECK (is_internal IN (0,1))
);

CREATE INDEX IF NOT EXISTS idx_case_notes_case_id    ON case_notes (case_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_tenant_id  ON case_notes (tenant_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_created_at ON case_notes (created_at);

-- ────────────────────────────────────────────────────────────────
-- Rollback SQL
-- DROP INDEX IF EXISTS idx_case_notes_created_at;
-- DROP INDEX IF EXISTS idx_case_notes_tenant_id;
-- DROP INDEX IF EXISTS idx_case_notes_case_id;
-- DROP TABLE IF EXISTS case_notes;
-- DROP INDEX IF EXISTS idx_cases_created_at;
-- DROP INDEX IF EXISTS idx_cases_sla;
-- DROP INDEX IF EXISTS idx_cases_group_id;
-- DROP INDEX IF EXISTS idx_cases_assigned_to;
-- DROP INDEX IF EXISTS idx_cases_status;
-- DROP INDEX IF EXISTS idx_cases_workspace_id;
-- DROP INDEX IF EXISTS idx_cases_tenant_id;
-- DROP TABLE IF EXISTS cases;
-- ────────────────────────────────────────────────────────────────
