-- Rollback: 0210_onboarding_progress
-- Drops the onboarding_progress table and its indexes.

DROP INDEX IF EXISTS idx_onboarding_workspace_completed;
DROP INDEX IF EXISTS idx_onboarding_workspace_id;
DROP INDEX IF EXISTS idx_onboarding_tenant_id;
DROP TABLE IF EXISTS onboarding_progress;
