-- Rollback for 0435: Remove Phase 0 seed data and policy-engine skeleton data
-- (If 0435 contained additional seed data beyond 0434 scope, list drops here.)
--
-- Currently 0435 is covered by 0434_rollback.sql (policy_rules seed rows are
-- dropped with the policy_rules table in 0434_rollback.sql).
-- This file is a placeholder for any additional 0435-specific data drops.

SELECT 'rollback 0435: no additional objects to drop beyond 0434_rollback.sql' AS status;
