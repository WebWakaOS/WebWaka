-- Migration: 0378_invitations_soft_delete
-- Description: Add revoked_at column to invitations table for soft-delete audit trail (P20-A).
--
-- Previously, revocation deleted the row entirely, destroying the audit trail.
-- Now revocation sets revoked_at; the row is retained for audit/compliance purposes.
-- All queries that list "pending" invitations must filter WHERE revoked_at IS NULL.

ALTER TABLE invitations ADD COLUMN revoked_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_invitations_active
  ON invitations(workspace_id, tenant_id, accepted_at, revoked_at, expires_at);
