-- Rollback: 0222_partner_revenue_share
DROP INDEX IF EXISTS idx_partner_settlements_status;
DROP INDEX IF EXISTS idx_partner_settlements_partner_id;
DROP TABLE IF EXISTS partner_settlements;
