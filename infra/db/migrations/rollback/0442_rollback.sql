-- Rollback 0442 — Workflow Engine MVP
DELETE FROM workflow_steps WHERE workflow_id IN ('wfd_payout_approval_v1','wfd_case_resolution_v1');
DELETE FROM workflow_definitions WHERE id IN ('wfd_payout_approval_v1','wfd_case_resolution_v1');
DROP INDEX IF EXISTS idx_workflow_instance_steps_instance;
DROP TABLE IF EXISTS workflow_instance_steps;
DROP INDEX IF EXISTS idx_workflow_instances_entity;
DROP INDEX IF EXISTS idx_workflow_instances_tenant;
DROP TABLE IF EXISTS workflow_instances;
DROP INDEX IF EXISTS idx_workflow_steps_workflow;
DROP INDEX IF EXISTS idx_workflow_steps_order;
DROP TABLE IF EXISTS workflow_steps;
DROP TABLE IF EXISTS workflow_definitions;
