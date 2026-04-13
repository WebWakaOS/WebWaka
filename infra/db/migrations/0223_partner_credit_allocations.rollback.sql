-- Rollback: 0223_partner_credit_allocations
DROP INDEX IF EXISTS idx_pca_recipient;
DROP INDEX IF EXISTS idx_pca_partner_id;
DROP TABLE IF EXISTS partner_credit_allocations;
