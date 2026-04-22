-- Migration: 0379_tenant_branding_domain_verify
-- Description: Add custom domain verification fields to tenant_branding.
--
-- custom_domain_verified: 1 when DNS TXT/CNAME check passes (checked by platform).
-- custom_domain_verification_token: random token placed in DNS TXT record for proof-of-ownership.
-- custom_domain_verified_at: unix timestamp of last successful verification.
-- payment_bank_account_json: tenant-level receiving bank account (overrides workspace-level for
--   multi-workspace tenants). Same shape as workspaces.payment_bank_account_json.
--
-- The brand-runtime middleware already reads tenant_branding.custom_domain; this adds
-- the verification lifecycle columns without breaking existing resolution.

ALTER TABLE tenant_branding ADD COLUMN custom_domain_verified          INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tenant_branding ADD COLUMN custom_domain_verification_token TEXT;
ALTER TABLE tenant_branding ADD COLUMN custom_domain_verified_at        INTEGER;
ALTER TABLE tenant_branding ADD COLUMN payment_bank_account_json        TEXT;
