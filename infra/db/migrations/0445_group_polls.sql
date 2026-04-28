-- Migration 0445 — Group Polls / Surveys
-- Phase 2: Simple group-internal polls (question + options + votes)
-- Used for mutual aid voting and general group decision-making.
--
-- Platform Invariants:
--   T3 — tenant_id on all records
--   P4 — poll tables separate from core groups table

CREATE TABLE IF NOT EXISTS group_polls (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL,
  workspace_id        TEXT NOT NULL,
  group_id            TEXT NOT NULL,
  question            TEXT NOT NULL,
  description         TEXT,
  is_multiple_choice  INTEGER NOT NULL DEFAULT 0 CHECK (is_multiple_choice IN (0,1)),
  closes_at           INTEGER,           -- NULL = never closes automatically
  status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_by          TEXT NOT NULL,
  linked_entity_type  TEXT,             -- optional link e.g. 'mutual_aid_request'
  linked_entity_id    TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_group_polls_tenant_group
  ON group_polls (tenant_id, group_id);

CREATE TABLE IF NOT EXISTS group_poll_options (
  id        TEXT PRIMARY KEY,
  poll_id   TEXT NOT NULL REFERENCES group_polls(id),
  tenant_id TEXT NOT NULL,
  label     TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_group_poll_options_poll
  ON group_poll_options (poll_id);

CREATE TABLE IF NOT EXISTS group_poll_votes (
  id         TEXT PRIMARY KEY,
  poll_id    TEXT NOT NULL REFERENCES group_polls(id),
  option_id  TEXT NOT NULL REFERENCES group_poll_options(id),
  voter_id   TEXT NOT NULL,
  tenant_id  TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- One vote per voter per option (single-choice: one vote per voter per poll,
-- enforced at application layer; unique index per option covers multiple-choice)
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_poll_votes_unique
  ON group_poll_votes (tenant_id, poll_id, voter_id, option_id);

CREATE INDEX IF NOT EXISTS idx_group_poll_votes_poll
  ON group_poll_votes (tenant_id, poll_id);
