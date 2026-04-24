-- SEC-001: Track PBKDF2 iteration version per user for live rehash upgrade.
-- Version 1 = 100,000 iterations (legacy). Version 2 = 600,000 iterations (OWASP 2024).
-- Users on version 1 are silently upgraded to version 2 on their next successful login.
ALTER TABLE users ADD COLUMN password_hash_version INTEGER NOT NULL DEFAULT 1;
