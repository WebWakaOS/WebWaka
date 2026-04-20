-- Rollback: 0283_hl_mla_earnings
DROP INDEX IF EXISTS idx_hl_mla_period;
DROP INDEX IF EXISTS idx_hl_mla_pending;
DROP INDEX IF EXISTS idx_hl_mla_earner;
DROP INDEX IF EXISTS idx_hl_mla_tenant;
DROP INDEX IF EXISTS idx_hl_mla_wallet;
DROP TABLE IF EXISTS hl_mla_earnings;
