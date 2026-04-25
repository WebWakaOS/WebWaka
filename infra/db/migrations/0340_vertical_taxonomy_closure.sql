-- Migration 0340: Vertical taxonomy closure — merge decisions, new aliases, post-CSV alignment
-- Phase: Vertical Taxonomy Reconciliation Closure 2026-04-25
-- Authority: STOP-AND-RECONCILE audit — docs/reports/vertical-taxonomy-reconciliation-report-2026-04-25.md
-- Companion: docs/governance/vertical-duplicates-and-merge-decisions.md

-- ============================================================
-- PART 1: Mark 3 deprecated verticals in the DB
-- (CSV already updated to status='deprecated' in commit 2026-04-25)
-- ============================================================

UPDATE verticals SET status = 'deprecated', notes = notes || ' — DEPRECATED: merges into gym (2026-04-25 taxonomy closure)'
WHERE slug = 'gym-fitness';

UPDATE verticals SET status = 'deprecated', notes = notes || ' — DEPRECATED: merges into fuel-station (2026-04-25 taxonomy closure)'
WHERE slug = 'petrol-station';

UPDATE verticals SET status = 'deprecated', notes = notes || ' — DEPRECATED: merges into road-transport-union (2026-04-25 taxonomy closure)'
WHERE slug = 'nurtw';

-- ============================================================
-- PART 2: Update road-transport-union priority to 2
-- (CSV updated; now aligning DB)
-- ============================================================

UPDATE verticals SET priority = 2
WHERE slug = 'road-transport-union';

-- ============================================================
-- PART 3: Add bank-branch to verticals table
-- (already in DB via migration 0339; this is a no-op if 0339 ran first)
-- (CSV now also contains bank-branch — aligned)
-- ============================================================

INSERT OR IGNORE INTO verticals (
  id, slug, display_name, category, subcategory, priority, status,
  entity_type, fsm_states, required_kyc_tier, requires_frsc, requires_cac, requires_it,
  requires_community, requires_social, package_name, milestone_target, notes
) VALUES (
  'vtx_bank_branch', 'bank-branch', 'Bank Branch / ATM Location', 'financial', 'banking',
  2, 'planned', 'organization',
  '["seeded","claimed","active"]', 2, 0, 1, 0, 0, 0,
  'packages/verticals-bank-branch', 'M9',
  'Branch locator; hours; ATM availability; CBN parent institution link'
);

-- ============================================================
-- PART 4: Add merge-decision synonym entries
-- (gym-fitness → gym, petrol-station → fuel-station, nurtw → road-transport-union)
-- ============================================================

INSERT OR IGNORE INTO vertical_synonyms (
  id, canonical_slug, alias_slug, related_vertical_slug, relation_type, resolution_notes
) VALUES
  -- M1: gym-fitness → gym
  ('vsyn_gym_fitness_gym',
   'gym',
   'gym-fitness',
   NULL,
   'external_alias',
   'gym-fitness is deprecated alias for gym (taxonomy closure 2026-04-25). gym_fitness_profiles table serves both slugs via synonym routing. Category corrected: commerce → health.'),

  -- M2: petrol-station → fuel-station
  ('vsyn_petrol_station_fuel_station',
   'fuel-station',
   'petrol-station',
   NULL,
   'external_alias',
   'petrol-station is deprecated alias for fuel-station (taxonomy closure 2026-04-25). Colloquial Nigerian English for the same filling station. petrol_station_profiles table routes to fuel-station via synonym map.'),

  -- M3: nurtw → road-transport-union
  ('vsyn_nurtw_road_transport_union',
   'road-transport-union',
   'nurtw',
   NULL,
   'external_alias',
   'nurtw is deprecated alias for road-transport-union (taxonomy closure 2026-04-25). Same real-world organization (National Union of Road Transport Workers) entered twice. nurtw_profiles table routes to road-transport-union via synonym map. road-transport-union priority updated to 2.');

-- ============================================================
-- PART 5: Add missing package alias entries
-- (3 pairs identified in audit: newspaper-dist, palm-oil, polling-unit)
-- ============================================================

INSERT OR IGNORE INTO vertical_synonyms (
  id, canonical_slug, alias_slug, related_vertical_slug, relation_type, resolution_notes
) VALUES
  -- newspaper-distribution / newspaper-dist
  ('vsyn_newspaper_distribution_newspaper_dist',
   'newspaper-distribution',
   'newspaper-dist',
   NULL,
   'package_alias',
   'Package verticals-newspaper-dist uses slug newspaper-dist. CSV canonical slug is newspaper-distribution. Profile table is newspaper_dist_profiles.'),

  -- palm-oil-trader / palm-oil
  ('vsyn_palm_oil_trader_palm_oil',
   'palm-oil-trader',
   'palm-oil',
   NULL,
   'package_alias',
   'Package verticals-palm-oil uses slug palm-oil. CSV canonical slug is palm-oil-trader. Profile table is palm_oil_profiles.'),

  -- polling-unit-rep / polling-unit
  ('vsyn_polling_unit_rep_polling_unit',
   'polling-unit-rep',
   'polling-unit',
   NULL,
   'package_alias',
   'Package verticals-polling-unit uses slug polling-unit. CSV canonical slug is polling-unit-rep. Profile table is polling_unit_profiles.');

-- ============================================================
-- PART 6: transit / mass-transit final resolution
-- CSV canonical slug is mass-transit (vtx_transit ID confirms this).
-- AI config (vertical-ai-config.ts) has been corrected in this commit
-- to use mass-transit as the active key and transit as the deprecated alias.
-- This migration documents the resolution in the synonym map.
-- ============================================================

INSERT OR IGNORE INTO vertical_synonyms (
  id, canonical_slug, alias_slug, related_vertical_slug, relation_type, resolution_notes
) VALUES (
  'vsyn_mass_transit_transit_resolved',
  'mass-transit',
  'transit',
  NULL,
  'package_alias',
  'Canonical slug is mass-transit (CSV authority; vtx_transit ID). Package verticals-transit uses slug transit. AI config corrected 2026-04-25 to use mass-transit as active key. The vsyn_mass_transit_transit entry from 0302 is superseded by this resolved entry.'
);

-- ============================================================
-- PART 7: Update seedability matrix for deprecated slugs
-- Mark gym-fitness, petrol-station, nurtw as non-seedable
-- ============================================================

UPDATE vertical_seedability_matrix
SET seedability_status = 'deprecated',
    seedability_notes = seedability_notes || ' DEPRECATED 2026-04-25: use canonical slug for all new seeding.',
    updated_at = unixepoch()
WHERE vertical_slug IN ('gym-fitness', 'petrol-station', 'nurtw');

-- Add bank-branch to seedability matrix (0339 already added it, this is a no-op if 0339 ran)
INSERT OR IGNORE INTO vertical_seedability_matrix (
  vertical_slug, profile_status, profile_table, profile_migration, profile_column_count,
  requires_sidecar_enrichment, seedability_status, seedability_notes, created_at, updated_at
) VALUES (
  'bank-branch', 'exists', 'bank_branch_profiles',
  'apps/api/migrations/0339_vertical_bank_branch.sql',
  17, 1, 'seedable_with_sidecar',
  'bank_branch_profiles added (0339). OSM Nigeria amenity=bank seeded S12. CBN parent orgs in S07 (0315). cbn_institution_code links branches to parent bank entity.',
  unixepoch(), unixepoch()
);
