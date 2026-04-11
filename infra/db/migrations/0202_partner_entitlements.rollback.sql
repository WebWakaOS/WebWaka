-- Rollback: 0202_partner_entitlements
-- Drops the partner_entitlements table and its indexes.

DROP INDEX IF EXISTS idx_partner_entitlements_dimension;
DROP INDEX IF EXISTS idx_partner_entitlements_partner_id;
DROP TABLE IF EXISTS partner_entitlements;
