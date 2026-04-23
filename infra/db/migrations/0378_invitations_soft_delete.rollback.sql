-- Rollback: 0378_invitations_soft_delete
DROP INDEX IF EXISTS idx_invitations_active;
ALTER TABLE invitations DROP COLUMN revoked_at;
