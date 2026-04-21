-- Migration: 0018_contact_channels
-- Description: Normalized contact channel records per user (multi-channel OTP).
-- (M7a: docs/contact/multi-channel-model.md, docs/governance/otp-delivery-channels.md)
-- Each user can have multiple channels (SMS, WhatsApp, Telegram, email).
-- R10: Each channel is verified independently.

CREATE TABLE IF NOT EXISTS contact_channels (
  id           TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id      TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('sms','whatsapp','telegram','email')),
  -- value: phone number (E.164 for sms/whatsapp), Telegram handle, or email address
  value        TEXT NOT NULL,
  is_primary   INTEGER NOT NULL DEFAULT 0,  -- 1 = primary channel for this type
  verified     INTEGER NOT NULL DEFAULT 0,
  verified_at  INTEGER,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (user_id, channel_type, value)
);

CREATE INDEX IF NOT EXISTS idx_contact_user_type
  ON contact_channels(user_id, channel_type);

CREATE INDEX IF NOT EXISTS idx_contact_user_primary
  ON contact_channels(user_id, is_primary) WHERE is_primary = 1;

CREATE INDEX IF NOT EXISTS idx_contact_verified
  ON contact_channels(user_id, verified) WHERE verified = 1;
