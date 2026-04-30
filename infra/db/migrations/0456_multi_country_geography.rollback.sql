-- Rollback 0456: Multi-Country Geography Expansion
-- Removes Ghana and Kenya places, drops country_code column and index.

-- Step 1: Remove Kenya constituencies
DELETE FROM places WHERE id IN (
  'place_ke_const_westlands',
  'place_ke_const_dagoretti_north',
  'place_ke_const_dagoretti_south',
  'place_ke_const_langata'
);

-- Step 2: Remove Kenya counties
DELETE FROM places WHERE id LIKE 'place_ke_county_%';

-- Step 3: Remove Kenya country root
DELETE FROM places WHERE id = 'place_ke_country';

-- Step 4: Remove Ghana districts
DELETE FROM places WHERE id LIKE 'place_gh_district_%';

-- Step 5: Remove Ghana regions
DELETE FROM places WHERE id LIKE 'place_gh_region_%';

-- Step 6: Remove Ghana country root
DELETE FROM places WHERE id = 'place_gh_country';

-- Step 7: Drop index
DROP INDEX IF EXISTS idx_places_country_code;

-- Step 8: Remove country_code column (SQLite 3.35+)
ALTER TABLE places DROP COLUMN country_code;
