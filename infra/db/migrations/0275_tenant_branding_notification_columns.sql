-- Migration: 0275_tenant_branding_notification_columns
-- Description: Add notification-specific columns to tenant_branding table.
--   These support the Phase 3 template engine brand context (N-033):
--     support_email       — tenant support email injected into email footers
--     mailing_address     — tenant physical address (NDPR-required for marketing email)
--     requires_attribution— whether to show "Powered by WebWaka" attribution
--                           (G17 OQ-003: free-plan tenants always show attribution)
--
-- Phase 3 defaults: requires_attribution = 1 (attribution shown) for all tenants.
-- Phase 4 (N-053b): billing module sets requires_attribution = 0 for paid plans.
--
-- Non-destructive ADD COLUMN — existing rows default to NULL / 1.

ALTER TABLE tenant_branding ADD COLUMN support_email      TEXT;
ALTER TABLE tenant_branding ADD COLUMN mailing_address    TEXT;
ALTER TABLE tenant_branding ADD COLUMN requires_attribution INTEGER NOT NULL DEFAULT 1
  CHECK (requires_attribution IN (0, 1));
