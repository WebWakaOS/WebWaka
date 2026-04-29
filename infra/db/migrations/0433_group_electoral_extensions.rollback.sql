-- Rollback for 0433: Drop electoral extension tables
-- Phase 0 rollback — removes tables added in 0433_group_electoral_extensions.sql
--
-- WARNING: This destroys all data in politician_group_affiliations and
--          political_gotv_records tables. Execute only on QA gate rejection.

DROP TABLE IF EXISTS politician_group_affiliations;
DROP TABLE IF EXISTS political_gotv_records;

-- Restore gotv records if rollback 0432 was also applied:
-- political_gotv_records → support_group_gotv_records (handled in 0432_rollback.sql)
