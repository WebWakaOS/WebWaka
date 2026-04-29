-- Rollback 0440 — Dues Collection
DROP INDEX IF EXISTS idx_dues_payments_member;
DROP INDEX IF EXISTS idx_dues_payments_schedule;
DROP INDEX IF EXISTS idx_dues_payments_unique;
DROP TABLE IF EXISTS dues_payments;
DROP INDEX IF EXISTS idx_dues_schedules_workspace;
DROP INDEX IF EXISTS idx_dues_schedules_tenant_group;
DROP TABLE IF EXISTS dues_schedules;
