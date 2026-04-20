-- Rollback: 0270_seed_channel_providers
DELETE FROM channel_provider WHERE tenant_id IS NULL AND id IN (
  'ch_prov_resend_platform',
  'ch_prov_termii_platform',
  'ch_prov_africastalking_platform',
  'ch_prov_meta_waba_platform',
  'ch_prov_fcm_platform',
  'ch_prov_telegram_platform'
);
