-- Rollback: 0269_seed_notification_rules
-- Remove platform-scope default preferences
DELETE FROM notification_preference
  WHERE scope_type = 'platform' AND scope_id = 'platform' AND tenant_id = 'platform';

-- Remove platform notification rules
DELETE FROM notification_rule
  WHERE tenant_id IS NULL AND id IN (
    'rule_auth_registered',
    'rule_auth_pwreset',
    'rule_auth_locked',
    'rule_billing_pay_success',
    'rule_billing_pay_failed',
    'rule_billing_trial_ending',
    'rule_bank_transfer_complete',
    'rule_bank_transfer_failed',
    'rule_ai_budget_warn',
    'rule_system_provider_down'
  );
