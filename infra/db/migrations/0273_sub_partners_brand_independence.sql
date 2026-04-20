-- Migration: 0273_sub_partners_brand_independence
-- Description: Add brand_independence_mode column to sub_partners table.
--   Required by v2.1 spec Section 13 resolution (OQ-008, N-080):
--   When brand_independence_mode = 1, sub-partners use their own brand identity
--   for notifications and the platform resolveBrandContext() chain must skip the
--   parent partner's brand and resolve directly: sub_partner → platform.
--
-- The sub_partners table was created in migration 0201.
-- This is a non-destructive ADD COLUMN migration.
--
-- Phase 4 (N-054): resolveBrandContext() reads this flag.
-- Phase 0 (N-014): Column added now so all subsequent code can rely on it.

ALTER TABLE sub_partners ADD COLUMN brand_independence_mode INTEGER NOT NULL DEFAULT 0
  CHECK (brand_independence_mode IN (0, 1));

-- Partial index to quickly find sub-partners with brand independence enabled
CREATE INDEX IF NOT EXISTS idx_sub_partners_brand_independence
  ON sub_partners(brand_independence_mode)
  WHERE brand_independence_mode = 1;
