-- B2-3: FSM state transition history table
-- Stores last N transitions per profile for audit and compliance.
-- Retention: 90 days (cleaned by scheduler cron).
CREATE TABLE IF NOT EXISTS profile_state_history (
  id             TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  profile_id     TEXT    NOT NULL,
  slug           TEXT    NOT NULL,
  workspace_id   TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  from_state     TEXT    NOT NULL,
  to_state       TEXT    NOT NULL,
  triggered_by   TEXT    NOT NULL DEFAULT 'system',  -- userId or 'system'
  guard_name     TEXT,
  transitioned_at INTEGER NOT NULL DEFAULT (unixepoch()),
  metadata       TEXT                                -- JSON blob for extra context
);

CREATE INDEX IF NOT EXISTS idx_psh_profile   ON profile_state_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_psh_workspace ON profile_state_history(workspace_id);
CREATE INDEX IF NOT EXISTS idx_psh_tenant    ON profile_state_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_psh_slug      ON profile_state_history(slug);
CREATE INDEX IF NOT EXISTS idx_psh_ts        ON profile_state_history(transitioned_at);

-- Retention cleanup (called nightly by scheduler):
-- DELETE FROM profile_state_history WHERE transitioned_at < unixepoch() - 7776000; -- 90 days
