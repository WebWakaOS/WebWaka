-- Rollback: 0267_push_tokens
DROP INDEX IF EXISTS idx_push_token_stale;
DROP INDEX IF EXISTS idx_push_token_user;
DROP INDEX IF EXISTS idx_push_token_unique;
DROP TABLE IF EXISTS push_token;
