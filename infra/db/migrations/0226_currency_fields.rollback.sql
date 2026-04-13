-- Rollback: 0226_currency_fields
-- SQLite does not support DROP COLUMN in older versions.
-- Manually recreate tables without currency_code if needed.
-- For Cloudflare D1 (SQLite 3.x): ALTER TABLE ... DROP COLUMN is available.
ALTER TABLE billing_history    DROP COLUMN currency_code;
ALTER TABLE transactions       DROP COLUMN currency_code;
ALTER TABLE subscriptions      DROP COLUMN currency_code;
