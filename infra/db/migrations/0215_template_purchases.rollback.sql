-- Rollback 0215: Template purchases + revenue splits
DROP INDEX IF EXISTS idx_revenue_splits_template;
DROP INDEX IF EXISTS idx_revenue_splits_purchase;
DROP INDEX IF EXISTS idx_revenue_splits_author;
DROP TABLE IF EXISTS revenue_splits;
DROP INDEX IF EXISTS idx_template_purchases_ref;
DROP INDEX IF EXISTS idx_template_purchases_tenant;
DROP TABLE IF EXISTS template_purchases;
