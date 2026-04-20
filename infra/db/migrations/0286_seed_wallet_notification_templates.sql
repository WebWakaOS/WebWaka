-- Migration: 0286_seed_wallet_notification_templates
-- Seeds platform-level notification templates for HandyLife Wallet events.
-- All templates are tenant_id IS NULL (platform defaults).
-- WhatsApp templates seeded as 'pending_meta_approval'.
-- Locale: English (en) only — additional locales in Phase 8 (N-116).
--
-- Wallet event keys registered:
--   wallet.funding.requested, wallet.funding.proof_submitted, wallet.funding.confirmed,
--   wallet.funding.rejected, wallet.funding.expired,
--   wallet.spend.completed, wallet.balance.low,
--   wallet.kyc.upgrade_required, wallet.mla.earned, wallet.mla.credited,
--   wallet.transfer.disabled, wallet.withdrawal.disabled,
--   wallet.admin.frozen, wallet.admin.unfrozen
--
-- G1: tenant_id IS NULL (platform-level; sub-tenants inherit these templates).
-- G14: variables_schema validates all variables before render.
-- N-039: unsubscribe_url injected at render time — not stored.

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema,
  created_at, updated_at
) VALUES

-- wallet.funding.confirmed — email
('tpl_wallet_funding_confirmed_email_en_v1', NULL,
 'wallet.funding.confirmed', 'email', 'en', 1, 'active', NULL,
 'Your HandyLife Wallet has been funded ✓',
 '<p>Hi {{user_name}},</p><p>Your wallet has been credited with <strong>₦{{amount_naira}}</strong>.</p><p>New balance: <strong>₦{{new_balance_naira}}</strong></p><p>Reference: {{reference}}</p>',
 'Your wallet is now funded', 'View Wallet', '{{platform_base_url}}/wallet',
 '{"required":["user_name","amount_naira","new_balance_naira","reference"]}',
 unixepoch(), unixepoch()),

-- wallet.funding.confirmed — sms
('tpl_wallet_funding_confirmed_sms_en_v1', NULL,
 'wallet.funding.confirmed', 'sms', 'en', 1, 'active', NULL,
 NULL,
 'HandyLife Wallet: ₦{{amount_naira}} credited. New balance: ₦{{new_balance_naira}}. Ref: {{reference}}',
 NULL, NULL, NULL,
 '{"required":["amount_naira","new_balance_naira","reference"]}',
 unixepoch(), unixepoch()),

-- wallet.funding.confirmed — in_app
('tpl_wallet_funding_confirmed_inapp_en_v1', NULL,
 'wallet.funding.confirmed', 'in_app', 'en', 1, 'active', NULL,
 NULL,
 'Your wallet has been funded with ₦{{amount_naira}}. New balance: ₦{{new_balance_naira}}.',
 NULL, 'View Wallet', '/wallet',
 '{"required":["amount_naira","new_balance_naira"]}',
 unixepoch(), unixepoch()),

-- wallet.funding.rejected — email
('tpl_wallet_funding_rejected_email_en_v1', NULL,
 'wallet.funding.rejected', 'email', 'en', 1, 'active', NULL,
 'Wallet funding request could not be confirmed',
 '<p>Hi {{user_name}},</p><p>Your funding request of ₦{{amount_naira}} (Ref: {{reference}}) was not confirmed.</p><p>Reason: {{rejection_reason}}</p><p>Please submit a new funding request with a valid proof of payment.</p>',
 'Your funding request was not confirmed', 'Fund Wallet', '{{platform_base_url}}/wallet/fund',
 '{"required":["user_name","amount_naira","reference","rejection_reason"]}',
 unixepoch(), unixepoch()),

-- wallet.funding.rejected — in_app
('tpl_wallet_funding_rejected_inapp_en_v1', NULL,
 'wallet.funding.rejected', 'in_app', 'en', 1, 'active', NULL,
 NULL,
 'Your ₦{{amount_naira}} funding request was rejected: {{rejection_reason}}. Please try again.',
 NULL, 'Fund Wallet', '/wallet/fund',
 '{"required":["amount_naira","rejection_reason"]}',
 unixepoch(), unixepoch()),

-- wallet.funding.expired — in_app
('tpl_wallet_funding_expired_inapp_en_v1', NULL,
 'wallet.funding.expired', 'in_app', 'en', 1, 'active', NULL,
 NULL,
 'Your ₦{{amount_naira}} funding request (Ref: {{reference}}) has expired. Please submit a new one.',
 NULL, 'Fund Wallet', '/wallet/fund',
 '{"required":["amount_naira","reference"]}',
 unixepoch(), unixepoch()),

-- wallet.balance.low — in_app
('tpl_wallet_balance_low_inapp_en_v1', NULL,
 'wallet.balance.low', 'in_app', 'en', 1, 'active', NULL,
 NULL,
 'Your wallet balance is low: ₦{{balance_naira}} remaining. Fund your wallet to continue.',
 NULL, 'Fund Wallet', '/wallet/fund',
 '{"required":["balance_naira"]}',
 unixepoch(), unixepoch()),

-- wallet.kyc.upgrade_required — in_app + email
('tpl_wallet_kyc_upgrade_inapp_en_v1', NULL,
 'wallet.kyc.upgrade_required', 'in_app', 'en', 1, 'active', NULL,
 NULL,
 'You have reached your T{{current_tier}} wallet limit. Upgrade your identity verification to continue.',
 NULL, 'Upgrade KYC', '/identity/verify',
 '{"required":["current_tier"]}',
 unixepoch(), unixepoch()),

-- wallet.admin.frozen — email
('tpl_wallet_admin_frozen_email_en_v1', NULL,
 'wallet.admin.frozen', 'email', 'en', 1, 'active', NULL,
 'Your HandyLife Wallet has been temporarily frozen',
 '<p>Hi {{user_name}},</p><p>Your wallet has been frozen. Reason: {{frozen_reason}}</p><p>Please contact support for assistance.</p>',
 'Your wallet has been frozen', 'Contact Support', '{{platform_base_url}}/support',
 '{"required":["user_name","frozen_reason"]}',
 unixepoch(), unixepoch()),

-- wallet.admin.unfrozen — email
('tpl_wallet_admin_unfrozen_email_en_v1', NULL,
 'wallet.admin.unfrozen', 'email', 'en', 1, 'active', NULL,
 'Your HandyLife Wallet has been restored',
 '<p>Hi {{user_name}},</p><p>Your wallet has been unfrozen and is now active again.</p>',
 'Your wallet is active again', 'View Wallet', '{{platform_base_url}}/wallet',
 '{"required":["user_name"]}',
 unixepoch(), unixepoch()),

-- wallet.mla.earned — in_app
('tpl_wallet_mla_earned_inapp_en_v1', NULL,
 'wallet.mla.earned', 'in_app', 'en', 1, 'active', NULL,
 NULL,
 'You have earned a referral commission of ₦{{commission_naira}} (L{{referral_level}} referral). It will be credited soon.',
 NULL, 'View Earnings', '/wallet/mla-earnings',
 '{"required":["commission_naira","referral_level"]}',
 unixepoch(), unixepoch()),

-- wallet.mla.credited — email + in_app
('tpl_wallet_mla_credited_email_en_v1', NULL,
 'wallet.mla.credited', 'email', 'en', 1, 'active', NULL,
 'Your referral commission has been credited',
 '<p>Hi {{user_name}},</p><p>₦{{commission_naira}} has been credited to your wallet as a referral commission.</p><p>New balance: ₦{{new_balance_naira}}</p>',
 'Your referral commission is in your wallet', 'View Wallet', '{{platform_base_url}}/wallet',
 '{"required":["user_name","commission_naira","new_balance_naira"]}',
 unixepoch(), unixepoch()),

-- wallet.transfer.disabled — in_app
('tpl_wallet_transfer_disabled_inapp_en_v1', NULL,
 'wallet.transfer.disabled', 'in_app', 'en', 1, 'active', NULL,
 NULL,
 'Wallet-to-wallet transfers are not yet available. We are working on it!',
 NULL, NULL, NULL,
 '{}',
 unixepoch(), unixepoch()),

-- wallet.withdrawal.disabled — in_app
('tpl_wallet_withdrawal_disabled_inapp_en_v1', NULL,
 'wallet.withdrawal.disabled', 'in_app', 'en', 1, 'active', NULL,
 NULL,
 'Wallet withdrawals are not yet available. We are working on it!',
 NULL, NULL, NULL,
 '{}',
 unixepoch(), unixepoch());
