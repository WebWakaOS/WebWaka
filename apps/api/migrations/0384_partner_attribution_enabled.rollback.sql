-- Rollback 0384: Remove attribution_enabled column from partners table
-- SQLite does not support DROP COLUMN before 3.35.0.
-- Cloudflare D1 uses SQLite 3.44+, so DROP COLUMN is supported.

ALTER TABLE partners DROP COLUMN attribution_enabled;
