-- Migration 0547: Add missing political party organizations
-- The org_political_party_accord (Accord Party) was referenced in state assembly
-- roster seeds (0520, 0522, 0524, 0526, 0529, 0531) but was never created.
-- This migration ensures it exists so those seeds can apply cleanly.
-- Idempotent: uses INSERT OR IGNORE.

INSERT OR IGNORE INTO organizations (id, tenant_id, organization_type, status, verification_state, created_at, updated_at)
VALUES ('org_political_party_accord', 'tenant_platform_seed', 'unclassified', 'active', 'seeded', unixepoch(), unixepoch());
