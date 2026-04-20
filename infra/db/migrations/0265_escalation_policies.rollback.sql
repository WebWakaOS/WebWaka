-- Rollback: 0265_escalation_policies
DROP INDEX IF EXISTS idx_esc_policy_tenant;
DROP INDEX IF EXISTS idx_esc_policy_trigger;
DROP TABLE IF EXISTS escalation_policy;
