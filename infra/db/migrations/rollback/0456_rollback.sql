-- Rollback: 0456_multi_country_geography
-- Phase 6 / E35: Remove Ghana and Kenya geography and country_code column
--
-- WARNING: SQLite does not support DROP COLUMN on older versions.
-- This rollback removes the data seeded and drops the index.
-- The country_code column cannot be dropped in SQLite without recreating the table;
-- it will remain but all GH/KE rows will be deleted.

-- Remove Kenya constituencies
DELETE FROM places WHERE id LIKE 'place_ke_const_%';

-- Remove Kenya counties
DELETE FROM places WHERE id LIKE 'place_ke_county_%';

-- Remove Kenya country
DELETE FROM places WHERE id = 'place_ke_country';

-- Remove Ghana districts
DELETE FROM places WHERE id LIKE 'place_gh_district_%';

-- Remove Ghana regions
DELETE FROM places WHERE id LIKE 'place_gh_region_%';

-- Remove Ghana country
DELETE FROM places WHERE id = 'place_gh_country';

-- Drop the index
DROP INDEX IF EXISTS idx_places_country_code;

-- Note: country_code column remains in schema (SQLite limitation).
-- Existing NG rows retain their country_code = 'NG' value, which is harmless.
