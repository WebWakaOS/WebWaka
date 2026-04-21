-- Migration: 0231_invitations
-- Description: Token-based workspace member invitation table (P20-A).
-- Supports invite-by-email flow: token stored in KV (24h TTL), row tracks state.
-- Accepted invites are consumed once; expired rows pruned via cron or on-demand.

CREATE TABLE IF NOT EXISTS invitations (
  id              TEXT NOT NULL PRIMARY KEY,
  workspace_id    TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  email           TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'member'
                  CHECK (role IN ('super_admin', 'admin', 'manager', 'agent', 'cashier', 'member')),
  -- SHA-256 hex of the raw token (token itself stored only in KV, never in DB)
  token_hash      TEXT NOT NULL UNIQUE,
  invited_by      TEXT NOT NULL,
  expires_at      INTEGER NOT NULL,
  accepted_at     INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_invitations_workspace ON invitations(workspace_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email    ON invitations(email, workspace_id);
CREATE INDEX IF NOT EXISTS idx_invitations_expires  ON invitations(expires_at);
