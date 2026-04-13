-- Rollback for migration 0213: Shared delivery_orders table
DROP INDEX IF EXISTS idx_delivery_orders_vertical;
DROP INDEX IF EXISTS idx_delivery_orders_status;
DROP INDEX IF EXISTS idx_delivery_orders_workspace;
DROP INDEX IF EXISTS idx_delivery_orders_tenant;
DROP TABLE IF EXISTS delivery_orders;
