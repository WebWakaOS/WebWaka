-- Migration 0472: Billing Runtime Configuration Flags
-- Seeds billing-specific behaviour flags into configuration_flags so they can
-- be tuned at runtime via the control-plane dashboard without a redeploy.

INSERT OR IGNORE INTO configuration_flags
  (id, code, name, description, category, value_type, default_value,
   min_scope, inheritable, is_kill_switch, rollout_pct, is_active, created_by)
VALUES
  ('flag_billing_grace_days',
   'billing_grace_period_days',
   'Billing Grace Period (days)',
   'Number of days a subscription remains in grace before being suspended. '
   || 'Applied by POST /billing/enforce. Default: 7.',
   'behavior', 'integer', '7',
   'platform', 0, 0, 100, 1, 'system'),

  ('flag_billing_default_interval',
   'billing_default_interval_code',
   'Default Billing Interval Code',
   'The billing_intervals.code used when renewing or reactivating a subscription '
   || 'and no interval is explicitly stored on the subscription row. Default: monthly.',
   'behavior', 'string', 'monthly',
   'platform', 0, 0, 100, 1, 'system');
