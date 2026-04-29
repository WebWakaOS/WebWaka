-- Rollback: 0340_vertical_taxonomy_closure
-- Reverts all changes made by 0340_vertical_taxonomy_closure.sql

-- ============================================================
-- PART 7 ROLLBACK: Revert seedability matrix for deprecated slugs
-- ============================================================

UPDATE vertical_seedability_matrix
SET seedability_status = 'seedable',
    seedability_notes = REPLACE(seedability_notes, ' DEPRECATED 2026-04-25: use canonical slug for all new seeding.', ''),
    updated_at = unixepoch()
WHERE vertical_slug IN ('gym-fitness', 'petrol-station', 'nurtw');

-- Remove bank-branch seedability row if added by this migration
-- (safe to delete — 0339 does not add it to seedability matrix; only 0340 does)
DELETE FROM vertical_seedability_matrix WHERE vertical_slug = 'bank-branch';

-- ============================================================
-- PART 6 ROLLBACK: Remove transit/mass-transit resolved synonym
-- ============================================================

DELETE FROM vertical_synonyms WHERE id = 'vsyn_mass_transit_transit_resolved';

-- ============================================================
-- PART 5 ROLLBACK: Remove package alias synonym entries
-- ============================================================

DELETE FROM vertical_synonyms WHERE id IN (
  'vsyn_newspaper_distribution_newspaper_dist',
  'vsyn_palm_oil_trader_palm_oil',
  'vsyn_polling_unit_rep_polling_unit'
);

-- ============================================================
-- PART 4 ROLLBACK: Remove merge-decision synonym entries
-- ============================================================

DELETE FROM vertical_synonyms WHERE id IN (
  'vsyn_gym_fitness_gym',
  'vsyn_petrol_station_fuel_station',
  'vsyn_nurtw_road_transport_union'
);

-- ============================================================
-- PART 3 ROLLBACK: Remove bank-branch from verticals table
-- (Only removes the row added by 0340; 0339 is rolled back separately)
-- Note: This is safe because 0340 uses INSERT OR IGNORE, so this row
-- belongs to 0340 only if 0339 did not already insert it. If 0339 ran
-- first, bank-branch persists (correct — 0339 owns it).
-- To roll back both: apply 0340 rollback first, then 0339 rollback.
-- ============================================================

-- Do not delete bank-branch here — 0339 owns that row.
-- 0340 only inserted it as a no-op guard (INSERT OR IGNORE).

-- ============================================================
-- PART 2 ROLLBACK: Revert road-transport-union priority to 1
-- ============================================================

UPDATE verticals SET priority = 1
WHERE slug = 'road-transport-union';

-- ============================================================
-- PART 1 ROLLBACK: Un-deprecate the 3 deprecated verticals
-- ============================================================

UPDATE verticals SET status = 'active',
  notes = REPLACE(notes, ' — DEPRECATED: merges into gym (2026-04-25 taxonomy closure)', '')
WHERE slug = 'gym-fitness';

UPDATE verticals SET status = 'active',
  notes = REPLACE(notes, ' — DEPRECATED: merges into fuel-station (2026-04-25 taxonomy closure)', '')
WHERE slug = 'petrol-station';

UPDATE verticals SET status = 'active',
  notes = REPLACE(notes, ' — DEPRECATED: merges into road-transport-union (2026-04-25 taxonomy closure)', '')
WHERE slug = 'nurtw';
