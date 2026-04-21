-- Migration: 0210_onboarding_progress
-- Sprint 7 / PROD-01: Tenant onboarding checklist tracking
-- Tracks completion of setup steps per workspace.
-- Platform Invariant T3: tenant_id on all rows.

CREATE TABLE IF NOT EXISTS onboarding_progress (
  id            TEXT NOT NULL PRIMARY KEY,
  tenant_id     TEXT NOT NULL,
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  step_key      TEXT NOT NULL
                CHECK (step_key IN (
                  'profile_setup',
                  'vertical_activation',
                  'template_installed',
                  'payment_configured',
                  'team_invited',
                  'branding_configured'
                )),
  completed     INTEGER NOT NULL DEFAULT 0,  -- SQLite boolean (0/1)
  completed_at  INTEGER,                     -- Unix timestamp, NULL if not completed
  completed_by  TEXT,                        -- user_id who completed the step
  metadata      TEXT NOT NULL DEFAULT '{}',  -- JSON: step-specific context
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (workspace_id, step_key)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_tenant_id
  ON onboarding_progress(tenant_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_workspace_id
  ON onboarding_progress(workspace_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_workspace_completed
  ON onboarding_progress(workspace_id, completed);
