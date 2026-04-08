-- Migration: 0019_missing_indexes
-- Description: Missing indexes on individuals, organizations, and profiles.
-- (M7a: docs/research/pre-vertical-enhancements-replit.md — gap analysis item #11)
-- These enable efficient phone-first OTP lookup and email-based auth.

-- Individuals: phone and email lookups
CREATE INDEX IF NOT EXISTS idx_individuals_phone
  ON individuals(phone) WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_individuals_email
  ON individuals(email) WHERE email IS NOT NULL;

-- Organizations: email and CAC registration number lookups
CREATE INDEX IF NOT EXISTS idx_organizations_email
  ON organizations(email) WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_registration_number
  ON organizations(registration_number) WHERE registration_number IS NOT NULL;

-- Data residency tagging on core tables
ALTER TABLE individuals   ADD COLUMN data_residency TEXT NOT NULL DEFAULT 'NG';
ALTER TABLE organizations ADD COLUMN data_residency TEXT NOT NULL DEFAULT 'NG';
ALTER TABLE workspaces    ADD COLUMN data_residency TEXT NOT NULL DEFAULT 'NG';
