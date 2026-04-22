-- 0375_s14_refresh_cadence.sql
-- Phase S14: Record per-source refresh cadence for all seeded seed_sources.
-- Cadence logic:
--   INEC political sources       90 days  (office changes quarterly)
--   NASS legislators              90 days  (office changes quarterly)
--   State governors               180 days
--   INEC polling units            365 days (election-cycle)
--   INEC candidates               365 days (election-cycle)
--   NEMIS schools                 365 days
--   NHIA HCP registry             180 days
--   NPHCDA PHC registry           180 days
--   MLSCN training institutions   365 days
--   CBN financial institutions    90 days
--   NCC licensees                 90 days
--   NAICOM insurers               90 days
--   NUPRC/SEC registries          180 days
--   OSM-derived entities          90 days
--   NUC universities              365 days
--   HDX health candidate          not_scheduled (candidate_not_seeded)

UPDATE seed_sources
SET refresh_interval_days = 90,
    next_refresh_due = '2026-07-22',
    updated_at = strftime('%s', 'now')
WHERE source_key IN (
  'inec:current-political-parties:2026-04-21',
  'nass:legislators-api:2026-04-21',
  'seed_source_cbn_bdc_register_20260422',
  'seed_source_cbn_dfi_register_20260422',
  'seed_source_cbn_dmb_register_20260422',
  'seed_source_cbn_fc_register_20260422',
  'seed_source_cbn_mfb_register_20260422',
  'seed_source_cbn_nib_register_20260422',
  'seed_source_cbn_pmi_register_20260422',
  'seed_source_ncc_licensees_20260422',
  'seed_source_naicom_adjuster_register_20260422',
  'seed_source_naicom_aggregator_register_20260422',
  'seed_source_naicom_broker_register_20260422',
  'seed_source_naicom_composite_register_20260422',
  'seed_source_naicom_general_register_20260422',
  'seed_source_naicom_life_register_20260422',
  'seed_source_naicom_micro_register_20260422',
  'seed_source_naicom_reinsurance_register_20260422',
  'seed_source_naicom_takaful_register_20260422'
);

UPDATE seed_sources
SET refresh_interval_days = 180,
    next_refresh_due = '2026-10-22',
    updated_at = strftime('%s', 'now')
WHERE source_key IN (
  'ngf:governors-page:2026-04-21',
  'nhia:active-accredited-healthcare-providers:2026-04-21',
  'nphcda:primary-health-care-facility-dashboard:2026-04-21',
  'seed_source_grid3_ng_health_20260422'
);

UPDATE seed_sources
SET refresh_interval_days = 365,
    next_refresh_due = '2027-04-22',
    updated_at = strftime('%s', 'now')
WHERE source_key IN (
  'inec:cvr-polling-units-public-api:retrieved-2026-04-21',
  'inec:final-list-candidates-state-2023:sha-14',
  'nemis:schools-directory:2026-04-21',
  'mlscn:training-institutions-api:2026-04-21',
  'inec:constituency-delimitation-xls:2019-02:retrieved-2026-04-21',
  'inec:s05-electoral-source-locator:2026-04-21'
);

UPDATE seed_sources
SET refresh_interval_days = 90,
    next_refresh_due = '2026-07-22',
    updated_at = strftime('%s', 'now')
WHERE source_key LIKE 'seed_source_osm_%';

UPDATE seed_sources
SET refresh_interval_days = 365,
    next_refresh_due = '2027-04-22',
    updated_at = strftime('%s', 'now')
WHERE source_key LIKE 'seed_source_nuc_%';

UPDATE seed_sources
SET refresh_interval_days = 180,
    next_refresh_due = '2026-10-22',
    updated_at = strftime('%s', 'now')
WHERE source_key LIKE 'seed_source_nuprc_%'
   OR source_key LIKE 'seed_source_sec_%';

UPDATE seed_sources
SET refresh_interval_days = 365,
    next_refresh_due = '2027-04-22',
    updated_at = strftime('%s', 'now')
WHERE source_key IN (
  'webwaka:nationwide-seeding-plan:2026-04-21',
  'webwaka:verticals-master-csv:2026-04-21',
  'webwaka:canonical-geography-s01:2026-04-21',
  'webwaka:s04-ingestion-tooling:2026-04-21',
  'wikipedia:list-of-current-state-governors-in-nigeria:2026-04-21',
  'seed_source_wikipedia_lagos_assembly_2023_20260422',
  'ubec:2022-npa-aggregate:2026-04-21'
);
