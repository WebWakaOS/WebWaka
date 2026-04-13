-- Rollback: 0225_support_tickets
DROP INDEX IF EXISTS idx_support_tickets_workspace;
DROP INDEX IF EXISTS idx_support_tickets_status;
DROP INDEX IF EXISTS idx_support_tickets_tenant;
DROP TABLE IF EXISTS support_tickets;
