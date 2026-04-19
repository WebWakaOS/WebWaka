-- Rollback for 0225a: Drop transactions table and related indexes
DROP INDEX IF EXISTS idx_transactions_status;
DROP INDEX IF EXISTS idx_transactions_workspace;
DROP INDEX IF EXISTS idx_transactions_tenant;
DROP TABLE IF EXISTS transactions;
