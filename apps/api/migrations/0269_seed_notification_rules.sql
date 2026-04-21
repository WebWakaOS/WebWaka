-- Migration: 0269_seed_notification_rules
-- Description: Seed platform-level notification rules (tenant_id IS NULL).
--   These are the canonical event-to-channel routing rules for Phase 1 launch.
--   Tenant-specific rules in notification_rule (tenant_id IS NOT NULL) override these.
--
-- Platform-level preferences (scope_type='platform') also seeded here.
-- Default timezone: Africa/Lagos (WAT, UTC+1)

-- ──────────────────────────────────────────────────────────────────────────────
-- Notification Rules
-- ──────────────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled,
  audience_type, channels, channel_fallback,
  template_family, priority, digest_eligible, min_severity,
  created_at, updated_at
) VALUES
  -- auth.user.registered → welcome email + in_app
  ('rule_auth_registered', NULL, 'auth.user.registered', 'Welcome notification', 1,
   'actor', '["email","in_app"]', '["in_app"]',
   'auth.welcome', 'normal', 0, 'info',
   unixepoch(), unixepoch()),

  -- auth.user.password_reset_requested → email + sms
  ('rule_auth_pwreset', NULL, 'auth.user.password_reset_requested', 'Password reset', 1,
   'actor', '["email","sms"]', '["sms"]',
   'auth.password_reset', 'high', 0, 'info',
   unixepoch(), unixepoch()),

  -- auth.user.account_locked → email + sms (severity=critical; bypasses quiet hours G12)
  ('rule_auth_locked', NULL, 'auth.user.account_locked', 'Account locked security alert', 1,
   'actor', '["email","sms"]', '["sms"]',
   'auth.account_locked', 'critical', 0, 'critical',
   unixepoch(), unixepoch()),

  -- billing.payment_succeeded → email + in_app
  ('rule_billing_pay_success', NULL, 'billing.payment_succeeded', 'Payment success receipt', 1,
   'actor', '["email","in_app"]', '["in_app"]',
   'billing.payment_success', 'normal', 0, 'info',
   unixepoch(), unixepoch()),

  -- billing.payment_failed → email + sms + in_app (severity=warning)
  ('rule_billing_pay_failed', NULL, 'billing.payment_failed', 'Payment failure alert', 1,
   'actor', '["email","sms","in_app"]', '["sms","in_app"]',
   'billing.payment_failed', 'high', 0, 'warning',
   unixepoch(), unixepoch()),

  -- billing.trial_ending → email + in_app (digest eligible)
  ('rule_billing_trial_ending', NULL, 'billing.trial_ending', 'Trial ending reminder', 1,
   'workspace_admins', '["email","in_app"]', '["in_app"]',
   'billing.trial_ending', 'normal', 1, 'info',
   unixepoch(), unixepoch()),

  -- bank_transfer.completed → email + sms + in_app (USSD bypass G21 applied at runtime)
  ('rule_bank_transfer_complete', NULL, 'bank_transfer.completed', 'Bank transfer receipt', 1,
   'actor', '["email","sms","in_app"]', '["sms","in_app"]',
   'bank_transfer.receipt', 'high', 0, 'info',
   unixepoch(), unixepoch()),

  -- bank_transfer.failed → email + sms (severity=warning)
  ('rule_bank_transfer_failed', NULL, 'bank_transfer.failed', 'Bank transfer failure', 1,
   'actor', '["email","sms"]', '["sms"]',
   'bank_transfer.failed', 'high', 0, 'warning',
   unixepoch(), unixepoch()),

  -- ai.budget_warning → email + in_app (digest eligible)
  ('rule_ai_budget_warn', NULL, 'ai.budget_warning', 'AI budget warning', 1,
   'workspace_admins', '["email","in_app"]', '["in_app"]',
   'ai.budget_warning', 'normal', 1, 'warning',
   unixepoch(), unixepoch()),

  -- system.provider_down → email + slack (super_admin only; severity=critical)
  ('rule_system_provider_down', NULL, 'system.provider_down', 'Provider down alert', 1,
   'super_admins', '["email","slack"]', '["email"]',
   'system.provider_down', 'critical', 0, 'critical',
   unixepoch(), unixepoch());

-- ──────────────────────────────────────────────────────────────────────────────
-- Platform-scope default preferences (scope_type='platform', scope_id='platform')
-- Default timezone: Africa/Lagos; quiet hours: 22:00-07:00 WAT
-- ──────────────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO notification_preference (
  id, scope_type, scope_id, tenant_id, event_key, channel,
  enabled, quiet_hours_start, quiet_hours_end, timezone,
  digest_window, low_data_mode, created_at, updated_at
) VALUES
  ('pref_plat_email',     'platform', 'platform', 'platform', '*', 'email',     1, 22, 7, 'Africa/Lagos', 'none', 0, unixepoch(), unixepoch()),
  ('pref_plat_sms',       'platform', 'platform', 'platform', '*', 'sms',       1, 22, 7, 'Africa/Lagos', 'none', 0, unixepoch(), unixepoch()),
  ('pref_plat_push',      'platform', 'platform', 'platform', '*', 'push',      1, 22, 7, 'Africa/Lagos', 'none', 0, unixepoch(), unixepoch()),
  ('pref_plat_inapp',     'platform', 'platform', 'platform', '*', 'in_app',    1, NULL, NULL, 'Africa/Lagos', 'none', 0, unixepoch(), unixepoch()),
  ('pref_plat_whatsapp',  'platform', 'platform', 'platform', '*', 'whatsapp',  1, 22, 7, 'Africa/Lagos', 'none', 0, unixepoch(), unixepoch()),
  ('pref_plat_telegram',  'platform', 'platform', 'platform', '*', 'telegram',  1, 22, 7, 'Africa/Lagos', 'none', 0, unixepoch(), unixepoch()),
  ('pref_plat_slack',     'platform', 'platform', 'platform', '*', 'slack',     1, NULL, NULL, 'Africa/Lagos', 'none', 0, unixepoch(), unixepoch()),
  ('pref_plat_webhook',   'platform', 'platform', 'platform', '*', 'webhook',   1, NULL, NULL, 'Africa/Lagos', 'none', 0, unixepoch(), unixepoch());
