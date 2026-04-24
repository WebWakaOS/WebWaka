-- BUG-038 / ENH-034: TOTP 2FA columns for super_admin users.
-- totp_secret: base32-encoded TOTP seed (stored encrypted at rest).
-- totp_enabled: 1 = active, 0 = not enrolled.
-- totp_enrolled_at: unix timestamp of enrollment confirmation.
ALTER TABLE users ADD COLUMN totp_secret       TEXT;
ALTER TABLE users ADD COLUMN totp_enabled      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN totp_enrolled_at  INTEGER;
