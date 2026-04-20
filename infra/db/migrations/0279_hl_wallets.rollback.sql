-- Rollback: 0279_hl_wallets
DROP INDEX IF EXISTS idx_hl_wallets_status;
DROP INDEX IF EXISTS idx_hl_wallets_workspace;
DROP INDEX IF EXISTS idx_hl_wallets_tenant;
DROP INDEX IF EXISTS idx_hl_wallets_user_tenant;
DROP TABLE IF EXISTS hl_wallets;
