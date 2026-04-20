-- Rollback: 0284_hl_withdrawal_requests
DROP INDEX IF EXISTS idx_hl_wr_pending;
DROP INDEX IF EXISTS idx_hl_wr_tenant;
DROP INDEX IF EXISTS idx_hl_wr_wallet;
DROP TABLE IF EXISTS hl_withdrawal_requests;
