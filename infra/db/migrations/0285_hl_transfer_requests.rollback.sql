-- Rollback: 0285_hl_transfer_requests
DROP INDEX IF EXISTS idx_hl_tr_tenant;
DROP INDEX IF EXISTS idx_hl_tr_to;
DROP INDEX IF EXISTS idx_hl_tr_from;
DROP TABLE IF EXISTS hl_transfer_requests;
