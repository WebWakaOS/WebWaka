-- Migration 0226a: tags column for template_registry
-- The tags column is now part of the base schema in 0206_create_template_registry.sql.
-- This migration is a no-op for installations where the column already exists
-- (production) or where it was created by 0206 (fresh installs).
-- Staging had this migration applied as ALTER TABLE; no re-run needed.
SELECT 1;
