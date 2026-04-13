-- Rollback for migration 0214: Shared reservations table
DROP INDEX IF EXISTS idx_reservations_status;
DROP INDEX IF EXISTS idx_reservations_resource;
DROP INDEX IF EXISTS idx_reservations_vertical;
DROP INDEX IF EXISTS idx_reservations_workspace;
DROP INDEX IF EXISTS idx_reservations_tenant;
DROP TABLE IF EXISTS reservations;
