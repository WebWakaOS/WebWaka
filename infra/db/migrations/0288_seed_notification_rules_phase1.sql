-- Migration: 0288_seed_notification_rules_phase1
-- Description: Seed notification_rules for all 22 existing template families
--   (seeded in 0268, 0276, 0286). These rules activate the notification pipeline
--   for the core auth, billing, bank-transfer, AI, system, and wallet events.
--
-- Rules use tenant_id IS NULL (platform defaults — inherited by all tenants).
-- Wallet rules are gated by feature_flag 'wallet_enabled' (KV key).
-- N-020: Rule engine reads this table in NotificationService.raise().
-- G25: NOTIFICATION_PIPELINE_ENABLED="0" — pipeline remains off until go-live.
--
-- Column ref (from 0255_notification_rules.sql):
--   audience_type: actor | subject | workspace_admins | tenant_admins |
--                  all_members | super_admins | partner_admins | custom
--   channels: JSON array of delivery channels
--   priority: low | normal | high | critical
--   min_severity: info | warning | critical

-- ──────────────────────────────────────────────────────────────────────────────
-- AUTH RULES
-- ──────────────────────────────────────────────────────────────────────────────

-- auth.user.registered → auth.welcome (email + in_app to the new user)
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_auth_registered_welcome_v1', NULL, 'auth.user.registered',
  'New user welcome (email + in-app)', 1, 'actor',
  '["email","in_app"]', 'auth.welcome', 'normal', 0, 'info', NULL,
  unixepoch(), unixepoch()
);

-- auth.user.password_reset_requested → auth.password_reset
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_auth_pwreset_v1', NULL, 'auth.user.password_reset_requested',
  'Password reset instructions', 1, 'actor',
  '["email","sms"]', 'auth.password_reset', 'high', 0, 'info', NULL,
  unixepoch(), unixepoch()
);

-- auth.user.account_locked → auth.account_locked (critical security alert)
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, channel_fallback, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_auth_locked_v1', NULL, 'auth.user.account_locked',
  'Account locked security alert', 1, 'actor',
  '["email","sms"]', '["sms","in_app"]', 'auth.account_locked', 'critical', 0, 'critical', NULL,
  unixepoch(), unixepoch()
);

-- auth.user.invited → auth.workspace_invite (notify the invited person)
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_auth_invited_wsinvite_v1', NULL, 'auth.user.invited',
  'Workspace invitation (to invitee)', 1, 'subject',
  '["email","in_app"]', 'auth.workspace_invite', 'normal', 0, 'info', NULL,
  unixepoch(), unixepoch()
);

-- workspace.invite_sent → auth.workspace_invite (same template, workspace-event trigger)
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_ws_invite_sent_v1', NULL, 'workspace.invite_sent',
  'Workspace invitation sent (to invitee)', 1, 'subject',
  '["email","in_app"]', 'auth.workspace_invite', 'normal', 0, 'info', NULL,
  unixepoch(), unixepoch()
);

-- auth.user.email_verification_sent → auth.email_verification
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_auth_emailverify_sent_v1', NULL, 'auth.user.email_verification_sent',
  'Email verification link delivery', 1, 'actor',
  '["email"]', 'auth.email_verification', 'high', 0, 'info', NULL,
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- BILLING RULES (core payment events)
-- ──────────────────────────────────────────────────────────────────────────────

-- billing.payment_succeeded → billing.payment_success
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_billing_pay_success_v1', NULL, 'billing.payment_succeeded',
  'Billing payment success receipt', 1, 'workspace_admins',
  '["email","in_app"]', 'billing.payment_success', 'normal', 0, 'info', NULL,
  unixepoch(), unixepoch()
);

-- billing.payment_failed → billing.payment_failed (high priority — churn risk)
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, channel_fallback, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_billing_pay_failed_v1', NULL, 'billing.payment_failed',
  'Billing payment failure alert', 1, 'workspace_admins',
  '["email","sms","in_app"]', '["sms","in_app"]', 'billing.payment_failed', 'high', 0, 'warning', NULL,
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- BANK TRANSFER RULE
-- ──────────────────────────────────────────────────────────────────────────────

-- bank_transfer.completed → bank_transfer.receipt
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_banktransfer_completed_v1', NULL, 'bank_transfer.completed',
  'Bank transfer completion receipt', 1, 'actor',
  '["email","sms","in_app"]', 'bank_transfer.receipt', 'normal', 0, 'info', NULL,
  unixepoch(), unixepoch()
);

-- bank_transfer.failed → bank_transfer.receipt (failure variant — same template family, different body)
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, channel_fallback, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_banktransfer_failed_v1', NULL, 'bank_transfer.failed',
  'Bank transfer failure alert', 1, 'actor',
  '["email","sms","in_app"]', '["sms","in_app"]', 'bank_transfer.receipt', 'high', 0, 'warning', NULL,
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- AI RULE
-- ──────────────────────────────────────────────────────────────────────────────

-- ai.budget_warning → ai.budget_warning
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_ai_budget_warn_v1', NULL, 'ai.budget_warning',
  'AI spend budget warning', 1, 'workspace_admins',
  '["email","in_app"]', 'ai.budget_warning', 'high', 0, 'warning', NULL,
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- SYSTEM RULE
-- ──────────────────────────────────────────────────────────────────────────────

-- system.provider_down → system.provider_down (super-admin ops alert)
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_system_provider_down_v1', NULL, 'system.provider_down',
  'Notification provider down (ops alert)', 1, 'super_admins',
  '["email"]', 'system.provider_down', 'critical', 0, 'critical', NULL,
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- WALLET RULES (all gated on wallet_enabled feature flag)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES
  ('rule_wallet_funding_confirmed_v1', NULL, 'wallet.funding.confirmed',
   'Wallet funded successfully', 1, 'actor',
   '["email","sms","in_app"]', 'wallet.funding.confirmed', 'high', 0, 'info', 'wallet_enabled',
   unixepoch(), unixepoch()),

  ('rule_wallet_funding_rejected_v1', NULL, 'wallet.funding.rejected',
   'Wallet funding request rejected', 1, 'actor',
   '["email","in_app"]', 'wallet.funding.rejected', 'high', 0, 'warning', 'wallet_enabled',
   unixepoch(), unixepoch()),

  ('rule_wallet_funding_expired_v1', NULL, 'wallet.funding.expired',
   'Wallet funding request expired', 1, 'actor',
   '["in_app"]', 'wallet.funding.expired', 'normal', 1, 'info', 'wallet_enabled',
   unixepoch(), unixepoch()),

  ('rule_wallet_balance_low_v1', NULL, 'wallet.balance.low',
   'Wallet balance below threshold', 1, 'actor',
   '["in_app"]', 'wallet.balance.low', 'normal', 1, 'info', 'wallet_enabled',
   unixepoch(), unixepoch()),

  ('rule_wallet_kyc_upgrade_v1', NULL, 'wallet.kyc.upgrade_required',
   'Wallet KYC tier upgrade required', 1, 'actor',
   '["email","in_app"]', 'wallet.kyc.upgrade_required', 'high', 0, 'warning', 'wallet_enabled',
   unixepoch(), unixepoch()),

  ('rule_wallet_admin_frozen_v1', NULL, 'wallet.admin.frozen',
   'Wallet frozen by platform admin', 1, 'actor',
   '["email"]', 'wallet.admin.frozen', 'critical', 0, 'critical', 'wallet_enabled',
   unixepoch(), unixepoch()),

  ('rule_wallet_admin_unfrozen_v1', NULL, 'wallet.admin.unfrozen',
   'Wallet unfrozen by platform admin', 1, 'actor',
   '["email"]', 'wallet.admin.unfrozen', 'high', 0, 'info', 'wallet_enabled',
   unixepoch(), unixepoch()),

  ('rule_wallet_mla_earned_v1', NULL, 'wallet.mla.earned',
   'MLA referral commission earned', 1, 'actor',
   '["email","in_app"]', 'wallet.mla.earned', 'normal', 1, 'info', 'wallet_enabled',
   unixepoch(), unixepoch()),

  ('rule_wallet_mla_credited_v1', NULL, 'wallet.mla.credited',
   'MLA referral commission credited to wallet', 1, 'actor',
   '["email","in_app"]', 'wallet.mla.credited', 'normal', 0, 'info', 'wallet_enabled',
   unixepoch(), unixepoch()),

  ('rule_wallet_transfer_disabled_v1', NULL, 'wallet.transfer.disabled',
   'Wallet transfer attempted while feature disabled', 1, 'actor',
   '["in_app"]', 'wallet.transfer.disabled', 'low', 1, 'info', 'wallet_enabled',
   unixepoch(), unixepoch()),

  ('rule_wallet_withdrawal_disabled_v1', NULL, 'wallet.withdrawal.disabled',
   'Wallet withdrawal attempted while feature disabled', 1, 'actor',
   '["in_app"]', 'wallet.withdrawal.disabled', 'low', 1, 'info', 'wallet_enabled',
   unixepoch(), unixepoch());
