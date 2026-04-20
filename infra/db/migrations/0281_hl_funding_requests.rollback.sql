-- Rollback: 0281_hl_funding_requests
DROP INDEX IF EXISTS idx_hl_fr_pending;
DROP INDEX IF EXISTS idx_hl_fr_tenant;
DROP INDEX IF EXISTS idx_hl_fr_wallet;
DROP TABLE IF EXISTS hl_funding_requests;
