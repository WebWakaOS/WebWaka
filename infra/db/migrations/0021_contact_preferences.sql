-- Migration: 0021_contact_preferences
-- Description: Per-user OTP and notification channel preferences (M7a).
-- (docs/contact/multi-channel-model.md, docs/governance/otp-delivery-channels.md)
-- R8/R9: OTP preference drives channel waterfall order.

CREATE TABLE IF NOT EXISTS contact_preferences (
  user_id                 TEXT NOT NULL PRIMARY KEY,
  otp_preference          TEXT NOT NULL DEFAULT 'sms'
                          CHECK (otp_preference IN ('sms','whatsapp','telegram')),
  notification_preference TEXT NOT NULL DEFAULT 'sms'
                          CHECK (notification_preference IN ('sms','whatsapp','telegram','email')),
  updated_at              INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_contact_pref_user
  ON contact_preferences(user_id);
