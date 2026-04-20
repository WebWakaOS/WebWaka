-- Rollback: 0282_hl_spend_events
DROP INDEX IF EXISTS idx_hl_se_vertical;
DROP INDEX IF EXISTS idx_hl_se_order;
DROP INDEX IF EXISTS idx_hl_se_tenant;
DROP INDEX IF EXISTS idx_hl_se_wallet;
DROP TABLE IF EXISTS hl_spend_events;
