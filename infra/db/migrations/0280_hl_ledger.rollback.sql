-- Rollback: 0280_hl_ledger
DROP INDEX IF EXISTS idx_hl_ledger_related;
DROP INDEX IF EXISTS idx_hl_ledger_reference;
DROP INDEX IF EXISTS idx_hl_ledger_user;
DROP INDEX IF EXISTS idx_hl_ledger_tenant;
DROP INDEX IF EXISTS idx_hl_ledger_wallet;
DROP TABLE IF EXISTS hl_ledger;
