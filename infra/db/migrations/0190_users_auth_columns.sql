-- Migration 0190 — Add auth columns to users table
-- The login endpoint (POST /auth/login) issues a JWT containing workspace_id,
-- tenant_id, and role — these must be columns on the users table to avoid
-- a JOIN on every authentication request.
--
-- These columns are nullable to support INSERT OR IGNORE patterns during seeding.
-- Production users must always have non-null values (enforced at application layer).

ALTER TABLE users ADD COLUMN workspace_id TEXT;
ALTER TABLE users ADD COLUMN tenant_id TEXT;
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'member';

CREATE INDEX IF NOT EXISTS idx_users_tenant_id
  ON users(tenant_id) WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_workspace_id
  ON users(workspace_id) WHERE workspace_id IS NOT NULL;
