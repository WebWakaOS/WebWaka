-- Rollback: 0550_ai_provider_keys
DROP INDEX IF EXISTS idx_ai_provider_keys_rate_limit;
DROP INDEX IF EXISTS idx_ai_provider_keys_pool;
DROP TABLE IF EXISTS ai_provider_keys;
