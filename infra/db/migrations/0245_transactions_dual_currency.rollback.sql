-- SQLite does not support DROP COLUMN on older versions.
-- Columns remain but ignored on rollback. Safe no-op.
DROP INDEX IF EXISTS idx_transactions_currency;
SELECT 'rollback: original_currency_code, original_amount, fx_rate_used columns remain in transactions table';
