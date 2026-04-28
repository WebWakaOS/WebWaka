-- Migration 0442 — Workflow Engine MVP
-- Phase 2: @webwaka/workflows — WorkflowDefinition, WorkflowStep,
--          WorkflowInstance, WorkflowInstanceStep
--
-- Platform Invariants:
--   T3  — tenant_id on all instance records
--   Workflow definitions are platform-level (no tenant_id on definitions/steps)
--   P4  — no vertical-specific columns in core workflow tables

CREATE TABLE IF NOT EXISTS workflow_definitions (
  id            TEXT PRIMARY KEY,
  key           TEXT NOT NULL UNIQUE,    -- e.g. 'payout-approval', 'case-resolution'
  name          TEXT NOT NULL,
  description   TEXT,
  version       INTEGER NOT NULL DEFAULT 1,
  is_active     INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS workflow_steps (
  id                  TEXT PRIMARY KEY,
  workflow_id         TEXT NOT NULL REFERENCES workflow_definitions(id),
  step_key            TEXT NOT NULL,
  name                TEXT NOT NULL,
  step_order          INTEGER NOT NULL,
  step_type           TEXT NOT NULL CHECK (
                        step_type IN ('human_review','automated','notification','condition')
                      ),
  required_role       TEXT,              -- role required to complete this step
  on_approve_next     TEXT,             -- step_key to advance to on approval
  on_reject_next      TEXT,             -- step_key to advance to on rejection (NULL = terminal)
  is_terminal         INTEGER NOT NULL DEFAULT 0 CHECK (is_terminal IN (0,1)),
  config_json         TEXT,             -- JSON config for automated steps
  created_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_steps_order
  ON workflow_steps (workflow_id, step_order);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow
  ON workflow_steps (workflow_id);

-- ---------------------------------------------------------------------------
-- Workflow instances — one per initiated workflow run, scoped to a tenant
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS workflow_instances (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL,
  workspace_id     TEXT NOT NULL,
  workflow_id      TEXT NOT NULL REFERENCES workflow_definitions(id),
  workflow_key     TEXT NOT NULL,
  entity_type      TEXT NOT NULL,        -- e.g. 'payout_request', 'case'
  entity_id        TEXT NOT NULL,
  current_step_key TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (
                     status IN ('active','completed','rejected','cancelled')
                   ),
  initiated_by     TEXT NOT NULL,
  payload_json     TEXT,                 -- initial context payload (no PII)
  completed_at     INTEGER,
  rejected_at      INTEGER,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_workflow_instances_tenant
  ON workflow_instances (tenant_id, workflow_key);

CREATE INDEX IF NOT EXISTS idx_workflow_instances_entity
  ON workflow_instances (tenant_id, entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Workflow instance steps — audit trail of each step transition
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS workflow_instance_steps (
  id           TEXT PRIMARY KEY,
  instance_id  TEXT NOT NULL REFERENCES workflow_instances(id),
  tenant_id    TEXT NOT NULL,
  step_key     TEXT NOT NULL,
  step_name    TEXT NOT NULL,
  actor_id     TEXT,
  decision     TEXT CHECK (decision IN ('approve','reject','complete','skip',NULL)),
  note         TEXT,
  completed_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_workflow_instance_steps_instance
  ON workflow_instance_steps (instance_id);

-- ---------------------------------------------------------------------------
-- Seed: payout-approval workflow definition
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO workflow_definitions (id, key, name, description, version, is_active, created_at, updated_at)
VALUES (
  'wfd_payout_approval_v1',
  'payout-approval',
  'Payout Approval',
  'Two-step HITL payout approval: submit → review → execute/reject',
  1, 1, unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO workflow_steps (id, workflow_id, step_key, name, step_order, step_type, required_role, on_approve_next, on_reject_next, is_terminal, created_at)
VALUES
  ('wfs_pa_submit',  'wfd_payout_approval_v1', 'submit',  'Submit Request',   1, 'automated',    NULL,       'review',   NULL,      0, unixepoch()),
  ('wfs_pa_review',  'wfd_payout_approval_v1', 'review',  'HITL Review',      2, 'human_review', 'admin',    'execute',  'rejected', 0, unixepoch()),
  ('wfs_pa_execute', 'wfd_payout_approval_v1', 'execute', 'Execute Transfer',  3, 'automated',    NULL,       NULL,       NULL,      1, unixepoch()),
  ('wfs_pa_rejected','wfd_payout_approval_v1', 'rejected','Rejected',          4, 'notification', NULL,       NULL,       NULL,      1, unixepoch());

-- ---------------------------------------------------------------------------
-- Seed: case-resolution workflow definition
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO workflow_definitions (id, key, name, description, version, is_active, created_at, updated_at)
VALUES (
  'wfd_case_resolution_v1',
  'case-resolution',
  'Case Resolution',
  'Case lifecycle: assign → investigate → resolve/close',
  1, 1, unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO workflow_steps (id, workflow_id, step_key, name, step_order, step_type, required_role, on_approve_next, on_reject_next, is_terminal, created_at)
VALUES
  ('wfs_cr_assign',      'wfd_case_resolution_v1', 'assign',      'Assign Case',    1, 'human_review', 'coordinator', 'investigate', NULL,    0, unixepoch()),
  ('wfs_cr_investigate', 'wfd_case_resolution_v1', 'investigate', 'Investigate',    2, 'human_review', 'coordinator', 'resolve',     NULL,    0, unixepoch()),
  ('wfs_cr_resolve',     'wfd_case_resolution_v1', 'resolve',     'Resolve & Close', 3, 'human_review', 'coordinator', NULL,          NULL,    1, unixepoch());
