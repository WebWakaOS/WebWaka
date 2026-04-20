-- Migration: 0270_seed_channel_providers
-- Description: Seed platform-level channel providers (tenant_id IS NULL, is_platform_default=1).
--   Credentials are stored in NOTIFICATION_KV (G16 ADL-002), not here.
--   This migration only registers the provider metadata; credentials_kv_key is set
--   at deploy time via the notificator's credential rotation script.
--
-- Platform providers:
--   Email:      Resend (N-020)
--   SMS:        Termii (primary, N-021), Africa's Talking (fallback, N-022)
--   WhatsApp:   Meta WABA (N-023, OQ-003)
--   Push:       Firebase FCM (N-024)
--   Telegram:   Bot API (N-025)

INSERT OR IGNORE INTO channel_provider (
  id, tenant_id, channel, provider_name,
  is_active, is_platform_default, platform_sender_fallback,
  credentials_kv_key,
  custom_from_email, custom_from_name,
  metadata,
  created_at, updated_at
) VALUES
  -- Resend — platform email provider
  ('ch_prov_resend_platform',
   NULL, 'email', 'resend',
   1, 1, 1,
   'platform:ch_creds:email:resend',
   'hello@webwaka.com', 'WebWaka',
   '{"webhook_secret_kv_key":"platform:ch_creds:email:resend_webhook","from_domain":"webwaka.com"}',
   unixepoch(), unixepoch()),

  -- Termii — platform SMS provider (primary)
  ('ch_prov_termii_platform',
   NULL, 'sms', 'termii',
   1, 1, 1,
   'platform:ch_creds:sms:termii',
   NULL, NULL,
   '{"sender_id":"WebWaka","route":"dnd","sms_type":"plain"}',
   unixepoch(), unixepoch()),

  -- Africa's Talking — platform SMS fallback
  ('ch_prov_africastalking_platform',
   NULL, 'sms', 'africas_talking',
   1, 0, 1,
   'platform:ch_creds:sms:africas_talking',
   NULL, NULL,
   '{"sender_id":"WebWaka","priority":"fallback"}',
   unixepoch(), unixepoch()),

  -- Meta WABA — platform WhatsApp provider (OQ-003)
  ('ch_prov_meta_waba_platform',
   NULL, 'whatsapp', 'meta_whatsapp',
   1, 1, 0,
   'platform:ch_creds:whatsapp:meta_waba',
   NULL, NULL,
   '{"waba_id":"","phone_number_id":"","api_version":"v19.0","webhook_verify_token_kv_key":"platform:ch_creds:whatsapp:waba_webhook_verify"}',
   unixepoch(), unixepoch()),

  -- Firebase FCM — platform push provider
  ('ch_prov_fcm_platform',
   NULL, 'push', 'fcm',
   1, 1, 0,
   'platform:ch_creds:push:fcm',
   NULL, NULL,
   '{"project_id":"","api_version":"v1"}',
   unixepoch(), unixepoch()),

  -- Telegram Bot API — platform Telegram provider
  ('ch_prov_telegram_platform',
   NULL, 'telegram', 'telegram_bot',
   1, 1, 0,
   'platform:ch_creds:telegram:bot',
   NULL, NULL,
   '{"bot_username":"webwaka_bot"}',
   unixepoch(), unixepoch());
