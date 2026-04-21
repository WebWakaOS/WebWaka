-- Rollback: 0286_seed_wallet_notification_templates
-- Removes all HandyLife Wallet notification templates seeded by this migration.
-- Safe to run repeatedly — DELETE WHERE id IN (...) is idempotent.

DELETE FROM notification_template
WHERE id IN (
  'tpl_wallet_funding_confirmed_email_en_v1',
  'tpl_wallet_funding_confirmed_sms_en_v1',
  'tpl_wallet_funding_confirmed_inapp_en_v1',
  'tpl_wallet_funding_rejected_email_en_v1',
  'tpl_wallet_funding_rejected_inapp_en_v1',
  'tpl_wallet_admin_frozen_email_en_v1',
  'tpl_wallet_admin_unfrozen_email_en_v1',
  'tpl_wallet_balance_low_inapp_en_v1',
  'tpl_wallet_funding_expired_inapp_en_v1',
  'tpl_wallet_kyc_upgrade_inapp_en_v1',
  'tpl_wallet_mla_credited_email_en_v1',
  'tpl_wallet_mla_earned_inapp_en_v1',
  'tpl_wallet_transfer_disabled_inapp_en_v1',
  'tpl_wallet_withdrawal_disabled_inapp_en_v1'
);
