-- Migration: 0015_otp_log
-- Description: OTP delivery log for replay-attack prevention.
-- (M7a: docs/governance/security-baseline.md R8/R9, docs/identity/otp-channels.md)
-- Append-only. OTP value NEVER stored — only SHA-256 hash.

CREATE TABLE IF NOT EXISTS otp_log (
  id         TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT,
  phone      TEXT NOT NULL,
  otp_hash   TEXT NOT NULL,  -- SHA-256(PLATFORM_SALT + otp_value)
  purpose    TEXT NOT NULL   CHECK (purpose IN ('login','kyc','payment_verify','verification','password_reset')),
  channel    TEXT NOT NULL   CHECK (channel IN ('sms','whatsapp','telegram','email')),
  status     TEXT NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','used','expired','failed')),
  expires_at INTEGER NOT NULL,
  used_at    INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Prevents replay: same phone+hash+purpose cannot be reused
CREATE UNIQUE INDEX IF NOT EXISTS idx_otp_phone_hash_purpose
  ON otp_log(phone, otp_hash, purpose);

-- Fast lookup of pending OTPs for a phone
CREATE INDEX IF NOT EXISTS idx_otp_phone_status
  ON otp_log(phone, status, expires_at);

CREATE INDEX IF NOT EXISTS idx_otp_user_id
  ON otp_log(user_id) WHERE user_id IS NOT NULL;
