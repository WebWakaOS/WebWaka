-- Rollback 0445 — Group Polls
DROP INDEX IF EXISTS idx_group_poll_votes_poll;
DROP INDEX IF EXISTS idx_group_poll_votes_unique;
DROP TABLE IF EXISTS group_poll_votes;
DROP INDEX IF EXISTS idx_group_poll_options_poll;
DROP TABLE IF EXISTS group_poll_options;
DROP INDEX IF EXISTS idx_group_polls_tenant_group;
DROP TABLE IF EXISTS group_polls;
