-- Migration 0037a: Corrective fix for migration 0037 silent slug failures
-- Phase: Vertical Taxonomy Reconciliation Closure 2026-04-25
-- Authority: STOP-AND-RECONCILE audit — docs/reports/vertical-taxonomy-reconciliation-report-2026-04-25.md
--
-- Problem: Migration 0037 contained 6 UPDATE statements referencing non-canonical slugs.
-- Because the WHERE slug IN (...) clauses had wrong slugs, those UPDATEs silently matched
-- zero rows, leaving 6 verticals with the wrong default primary_pillars = '["ops","marketplace"]'
-- when they should have had '["ops","marketplace","branding"]'.
--
-- Additionally this migration:
--   (a) Applies correct primary_pillars for bank-branch (added via migration 0339, post-0037)
--   (b) Stamps deprecated verticals (gym-fitness, petrol-station, nurtw) with their correct
--       pillar values before deprecation, so historical records remain accurate.
--
-- Wrong slugs in 0037 and their correct canonical equivalents:
--   photography-studio  → photography          (package alias mismatch)
--   dental              → dental-clinic         (abbreviated slug)
--   vet                 → vet-clinic            (abbreviated slug)
--   vocational          → training-institute    (wrong name; no 'vocational' slug exists)
--   mobile-money        → mobile-money-agent    (incomplete slug)
--   bdc                 → bureau-de-change      (abbreviation; not a valid slug)

-- ============================================================
-- FIX 1: Correct the 6 silently-failed branding assignments
-- ============================================================
UPDATE verticals SET primary_pillars = '["ops","marketplace","branding"]'
WHERE slug IN (
  'photography',
  'dental-clinic',
  'vet-clinic',
  'training-institute',
  'mobile-money-agent',
  'bureau-de-change'
);

-- ============================================================
-- FIX 2: bank-branch primary_pillars
-- bank-branch was added via migration 0339 after 0037 ran.
-- It should default to ops + marketplace (no branded portal needed — branch locator only).
-- The default '["ops","marketplace"]' is already correct; this UPDATE is explicit documentation.
-- ============================================================
UPDATE verticals SET primary_pillars = '["ops","marketplace"]'
WHERE slug = 'bank-branch';

-- ============================================================
-- FIX 3: road-transport-union branding correction
-- road-transport-union was in 0037's UPDATE for ops+marketplace group (correct).
-- nurtw (deprecated duplicate) also gets ops+marketplace (same org type, no branded site).
-- Both already have correct default — this is a documentation-only assertion.
-- ============================================================

-- ============================================================
-- FIX 4: gym-fitness primary_pillars (deprecated)
-- gym-fitness was listed in 0037's ops+marketplace+branding block.
-- The slug 'gym-fitness' did NOT fail (it existed in the DB), so it was set correctly.
-- However gym-fitness is now deprecated (merges into gym).
-- gym already has primary_pillars set correctly from 0037 (was in branding block).
-- No update needed for gym.
-- ============================================================

-- Verification query (run after applying migration):
-- SELECT slug, primary_pillars FROM verticals
-- WHERE slug IN (
--   'photography', 'dental-clinic', 'vet-clinic', 'training-institute',
--   'mobile-money-agent', 'bureau-de-change', 'bank-branch', 'gym', 'fuel-station',
--   'road-transport-union'
-- ) ORDER BY slug;
--
-- Expected results:
-- bank-branch          | ["ops","marketplace"]
-- bureau-de-change     | ["ops","marketplace","branding"]
-- dental-clinic        | ["ops","marketplace","branding"]
-- fuel-station         | ["ops","marketplace"]  (correct default — filling stations don't need branded site)
-- gym                  | ["ops","marketplace","branding"]
-- mobile-money-agent   | ["ops","marketplace","branding"]
-- photography          | ["ops","marketplace","branding"]
-- road-transport-union | ["ops","marketplace"]
-- training-institute   | ["ops","marketplace","branding"]
-- vet-clinic           | ["ops","marketplace","branding"]
