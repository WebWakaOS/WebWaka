-- Migration: 0456_multi_country_geography
-- Phase 6 / E35: Multi-Country Geography Expansion
--
-- Adds Ghana (GH) and Kenya (KE) to the places hierarchy alongside Nigeria (NG).
-- Adds a country_code column to places for efficient multi-country filtering.
--
-- Ghana hierarchy: country → region (16 regions) → district (4 sample districts)
-- Kenya hierarchy: country → county (47 counties) → constituency (4 sample constituencies)
--
-- Governance:
--   AC-FUNC-03: rollback file at 0456_rollback.sql
--   T3: shared geography rows have tenant_id = NULL
--   geography_type values added: 'country' (already exists for NG), 'region', 'district',
--                                 'county', 'constituency'

-- ---------------------------------------------------------------------------
-- Step 1: Add country_code column (nullable; NULL for places not yet backfilled)
-- ---------------------------------------------------------------------------

ALTER TABLE places ADD COLUMN country_code TEXT DEFAULT NULL;

-- ---------------------------------------------------------------------------
-- Step 2: Backfill all existing Nigeria places with country_code = 'NG'
-- ---------------------------------------------------------------------------

UPDATE places SET country_code = 'NG' WHERE country_code IS NULL;

-- ---------------------------------------------------------------------------
-- Step 3: Index for country_code filtering
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_places_country_code ON places(country_code);

-- ---------------------------------------------------------------------------
-- Step 4: Ghana — country root
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO places (id, name, geography_type, level, parent_id, ancestry_path, country_code, tenant_id, created_at, updated_at)
VALUES ('place_gh_country', 'Ghana', 'country', 0, NULL, '[]', 'GH', NULL, unixepoch(), unixepoch());

-- ---------------------------------------------------------------------------
-- Step 5: Ghana — 16 Regions (official as of 2019 reorganisation)
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO places (id, name, geography_type, level, parent_id, ancestry_path, country_code, tenant_id, created_at, updated_at) VALUES
('place_gh_region_greater_accra',     'Greater Accra',     'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_ashanti',           'Ashanti',           'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_western',           'Western',           'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_western_north',     'Western North',     'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_central',           'Central',           'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_eastern',           'Eastern',           'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_northern',          'Northern',          'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_north_east',        'North East',        'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_savannah',          'Savannah',          'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_upper_east',        'Upper East',        'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_upper_west',        'Upper West',        'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_volta',             'Volta',             'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_oti',               'Oti',               'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_bono',              'Bono',              'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_bono_east',         'Bono East',         'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_region_ahafo',             'Ahafo',             'region', 1, 'place_gh_country', '["place_gh_country"]', 'GH', NULL, unixepoch(), unixepoch());

-- ---------------------------------------------------------------------------
-- Step 6: Ghana — 4 representative districts (Greater Accra region)
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO places (id, name, geography_type, level, parent_id, ancestry_path, country_code, tenant_id, created_at, updated_at) VALUES
('place_gh_district_accra_metro',      'Accra Metropolitan',       'district', 2, 'place_gh_region_greater_accra', '["place_gh_country","place_gh_region_greater_accra"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_district_ga_east',          'Ga East Municipal',        'district', 2, 'place_gh_region_greater_accra', '["place_gh_country","place_gh_region_greater_accra"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_district_ga_west',          'Ga West Municipal',        'district', 2, 'place_gh_region_greater_accra', '["place_gh_country","place_gh_region_greater_accra"]', 'GH', NULL, unixepoch(), unixepoch()),
('place_gh_district_tema_metro',       'Tema Metropolitan',        'district', 2, 'place_gh_region_greater_accra', '["place_gh_country","place_gh_region_greater_accra"]', 'GH', NULL, unixepoch(), unixepoch());

-- ---------------------------------------------------------------------------
-- Step 7: Kenya — country root
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO places (id, name, geography_type, level, parent_id, ancestry_path, country_code, tenant_id, created_at, updated_at)
VALUES ('place_ke_country', 'Kenya', 'country', 0, NULL, '[]', 'KE', NULL, unixepoch(), unixepoch());

-- ---------------------------------------------------------------------------
-- Step 8: Kenya — 47 Counties
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO places (id, name, geography_type, level, parent_id, ancestry_path, country_code, tenant_id, created_at, updated_at) VALUES
('place_ke_county_nairobi',         'Nairobi',           'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_mombasa',         'Mombasa',           'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_kwale',           'Kwale',             'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_kilifi',          'Kilifi',            'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_tana_river',      'Tana River',        'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_lamu',            'Lamu',              'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_taita_taveta',    'Taita-Taveta',      'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_garissa',         'Garissa',           'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_wajir',           'Wajir',             'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_mandera',         'Mandera',           'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_marsabit',        'Marsabit',          'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_isiolo',          'Isiolo',            'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_meru',            'Meru',              'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_tharaka_nithi',   'Tharaka-Nithi',     'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_embu',            'Embu',              'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_kitui',           'Kitui',             'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_machakos',        'Machakos',          'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_makueni',         'Makueni',           'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_nyandarua',       'Nyandarua',         'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_nyeri',           'Nyeri',             'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_kirinyaga',       'Kirinyaga',         'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_muranga',         'Murang\'a',         'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_kiambu',          'Kiambu',            'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_turkana',         'Turkana',           'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_west_pokot',      'West Pokot',        'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_samburu',         'Samburu',           'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_trans_nzoia',     'Trans-Nzoia',       'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_uasin_gishu',     'Uasin Gishu',       'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_elgeyo_marakwet', 'Elgeyo-Marakwet',   'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_nandi',           'Nandi',             'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_baringo',         'Baringo',           'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_laikipia',        'Laikipia',          'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_nakuru',          'Nakuru',            'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_narok',           'Narok',             'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_kajiado',         'Kajiado',           'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_kericho',         'Kericho',           'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_bomet',           'Bomet',             'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_kakamega',        'Kakamega',          'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_vihiga',          'Vihiga',            'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_bungoma',         'Bungoma',           'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_busia',           'Busia',             'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_siaya',           'Siaya',             'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_kisumu',          'Kisumu',            'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_homa_bay',        'Homa Bay',          'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_migori',          'Migori',            'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_kisii',           'Kisii',             'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_county_nyamira',         'Nyamira',           'county', 1, 'place_ke_country', '["place_ke_country"]', 'KE', NULL, unixepoch(), unixepoch());

-- ---------------------------------------------------------------------------
-- Step 9: Kenya — 4 representative constituencies (Nairobi county)
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO places (id, name, geography_type, level, parent_id, ancestry_path, country_code, tenant_id, created_at, updated_at) VALUES
('place_ke_const_westlands',       'Westlands',           'constituency', 2, 'place_ke_county_nairobi', '["place_ke_country","place_ke_county_nairobi"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_const_dagoretti_north', 'Dagoretti North',     'constituency', 2, 'place_ke_county_nairobi', '["place_ke_country","place_ke_county_nairobi"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_const_dagoretti_south', 'Dagoretti South',     'constituency', 2, 'place_ke_county_nairobi', '["place_ke_country","place_ke_county_nairobi"]', 'KE', NULL, unixepoch(), unixepoch()),
('place_ke_const_langata',         'Lang\'ata',           'constituency', 2, 'place_ke_county_nairobi', '["place_ke_country","place_ke_county_nairobi"]', 'KE', NULL, unixepoch(), unixepoch());
