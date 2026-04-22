-- 0340b_stub_seed_runs_for_coverage.sql
-- 0341_s13_coverage_snapshots.sql references 36 seed_run_id values.
-- Some exist with different names (missing osm_ prefix or different suffix),
-- some (s13 series) don't exist yet (created by 0342-0349).
-- Approach: INSERT OR IGNORE stub seed_run rows for every referenced ID so
-- the FK constraint in seed_coverage_snapshots.seed_run_id is satisfied.
-- source_id is nullable — stubs use NULL.  All defaults fill remaining NOT NULL cols.
-- ============================================================

INSERT OR IGNORE INTO seed_runs
  (id, source_id, run_label, run_state, total_input_rows, total_inserted_rows, total_rejected_rows)
VALUES
  -- S05 shorthands (real runs have longer names)
  ('seed_run_s05_parties',         NULL, 'S05 Political Parties (coverage alias)',       'completed', 0, 0, 0),
  ('seed_run_s05_politicians',     NULL, 'S05 Politicians (coverage alias)',              'completed', 0, 0, 0),
  -- S06 shorthands
  ('seed_run_s06_nemis',           NULL, 'S06 NEMIS Schools (coverage alias)',            'completed', 0, 0, 0),
  ('seed_run_s06_nhia',            NULL, 'S06 NHIA HCP (coverage alias)',                 'completed', 0, 0, 0),
  ('seed_run_s06_nphcda',          NULL, 'S06 NPHCDA PHC (coverage alias)',               'completed', 0, 0, 0),
  -- S07 shorthands
  ('seed_run_s07_cbn',             NULL, 'S07 CBN (coverage alias)',                      'completed', 0, 0, 0),
  ('seed_run_s07_naicom',          NULL, 'S07 NAICOM (coverage alias)',                   'completed', 0, 0, 0),
  ('seed_run_s07_ncc',             NULL, 'S07 NCC Licensees (coverage alias)',             'completed', 0, 0, 0),
  ('seed_run_s07_nuprc',           NULL, 'S07 NUPRC Oil (coverage alias)',                'completed', 0, 0, 0),
  -- S08 (different naming: missing osm_ prefix)
  ('seed_run_s08_transport_20260422',    NULL, 'S08 OSM Transport (coverage alias)',      'completed', 0, 0, 0),
  -- S09 (different naming: missing osm_ prefix)
  ('seed_run_s09_food_20260422',         NULL, 'S09 OSM Food (coverage alias)',           'completed', 0, 0, 0),
  ('seed_run_s09_hotel_20260422',        NULL, 'S09 OSM Hotels (coverage alias)',         'completed', 0, 0, 0),
  ('seed_run_s09_market_20260422',       NULL, 'S09 OSM Marketplace (coverage alias)',    'completed', 0, 0, 0),
  ('seed_run_s09_pharmacy_20260422',     NULL, 'S09 OSM Pharmacy (coverage alias)',       'completed', 0, 0, 0),
  ('seed_run_s09_salon_20260422',        NULL, 'S09 OSM Salon (coverage alias)',          'completed', 0, 0, 0),
  ('seed_run_s09_spare_20260422',        NULL, 'S09 OSM Spare Parts (coverage alias)',    'completed', 0, 0, 0),
  ('seed_run_s09_supermarket_20260422',  NULL, 'S09 OSM Supermarket (coverage alias)',    'completed', 0, 0, 0),
  -- S10 (different naming: missing osm_ prefix)
  ('seed_run_s10_church_20260422',       NULL, 'S10 OSM Churches (coverage alias)',       'completed', 0, 0, 0),
  ('seed_run_s10_coop_20260422',         NULL, 'S10 OSM Cooperatives (coverage alias)',   'completed', 0, 0, 0),
  ('seed_run_s10_mosque_20260422',       NULL, 'S10 OSM Mosques (coverage alias)',        'completed', 0, 0, 0),
  ('seed_run_s10_ngo_20260422',          NULL, 'S10 OSM NGOs (coverage alias)',           'completed', 0, 0, 0),
  -- S11 (different naming: missing osm_ prefix)
  ('seed_run_s11_fuel_20260422',         NULL, 'S11 OSM Fuel Stations (coverage alias)',  'completed', 0, 0, 0),
  -- S12 (different naming: missing osm_ prefix)
  ('seed_run_s12_bank_20260422',         NULL, 'S12 OSM Bank Branches (coverage alias)',  'completed', 0, 0, 0),
  -- S13 stubs (real runs inserted by 0342-0349 with osm_ prefix variants)
  ('seed_run_s13_clinic_20260422',       NULL, 'S13 OSM Clinic/Hospital (coverage stub)', 'completed', 0, 0, 0),
  ('seed_run_s13_dentist_20260422',      NULL, 'S13 OSM Dentist (coverage stub)',          'completed', 0, 0, 0),
  ('seed_run_s13_optician_20260422',     NULL, 'S13 OSM Optician (coverage stub)',         'completed', 0, 0, 0),
  ('seed_run_s13_vet_20260422',          NULL, 'S13 OSM Veterinary (coverage stub)',       'completed', 0, 0, 0),
  ('seed_run_s13_gov_20260422',          NULL, 'S13 OSM Government/Police (coverage stub)','completed', 0, 0, 0),
  ('seed_run_s13_civic_20260422',        NULL, 'S13 OSM Community Centre (coverage stub)', 'completed', 0, 0, 0),
  ('seed_run_s13_community_20260422',    NULL, 'S13 OSM Community (coverage stub)',        'completed', 0, 0, 0),
  ('seed_run_s13_car_repair_20260422',   NULL, 'S13 OSM Car Repair (coverage stub)',       'completed', 0, 0, 0),
  ('seed_run_s13_driving_20260422',      NULL, 'S13 OSM Driving School (coverage stub)',   'completed', 0, 0, 0),
  ('seed_run_s13_bakery_20260422',       NULL, 'S13 OSM Bakery (coverage stub)',            'completed', 0, 0, 0),
  ('seed_run_s13_laundry_20260422',      NULL, 'S13 OSM Laundry (coverage stub)',           'completed', 0, 0, 0),
  ('seed_run_s13_law_20260422',          NULL, 'S13 OSM Law Firm (coverage stub)',          'completed', 0, 0, 0),
  ('seed_run_s13_university_20260422',   NULL, 'S13 OSM University/College (coverage stub)','completed', 0, 0, 0);
