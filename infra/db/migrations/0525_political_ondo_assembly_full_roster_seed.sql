-- ============================================================
-- Migration 0525: Ondo State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Ondo State House of Assembly Members
-- Members seeded: 21/26
-- Party breakdown: AA:10, ADC:5, APC:4, AAC:1, PDP:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_ondo_assembly_20260502',
  'NigerianLeaders – Complete List of Ondo State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/ondo-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_ondo_roster_20260502', 'S05 Batch – Ondo State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_ondo_roster_20260502',
  'seed_run_s05_political_ondo_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0525_political_ondo_assembly_full_roster_seed.sql',
  NULL, 21,
  '21/26 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_ondo_state_assembly_10th_2023_2027',
  'Ondo State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_ondo',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (21 of 26 seats) ──────────────────────────────────────

-- 01. Ogboye Olufunmilayo Helen -- Akoko North East (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bad298f95af65f0d', 'Ogboye Olufunmilayo Helen',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bad298f95af65f0d', 'ind_bad298f95af65f0d', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogboye Olufunmilayo Helen', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bad298f95af65f0d', 'prof_bad298f95af65f0d',
  'Member, Ondo State House of Assembly (AKOKO NORTH EAST)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bad298f95af65f0d', 'ind_bad298f95af65f0d', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bad298f95af65f0d', 'ind_bad298f95af65f0d', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bad298f95af65f0d', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|akoko north east|2023',
  'insert', 'ind_bad298f95af65f0d',
  'Unique: Ondo Akoko North East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bad298f95af65f0d', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_bad298f95af65f0d', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bad298f95af65f0d', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_akoko_north_east',
  'ind_bad298f95af65f0d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bad298f95af65f0d', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Akoko North East', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bad298f95af65f0d', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_bad298f95af65f0d',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bad298f95af65f0d', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_bad298f95af65f0d',
  'political_assignment', '{"constituency_inec": "AKOKO NORTH EAST", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bad298f95af65f0d', 'prof_bad298f95af65f0d',
  'Ogboye Olufunmilayo Helen',
  'ogboye olufunmilayo helen ondo state assembly akoko north east aa politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Abiola Timilehin Adeware -- Akoko North West I (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_14cea7360f9d10bf', 'Abiola Timilehin Adeware',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_14cea7360f9d10bf', 'ind_14cea7360f9d10bf', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abiola Timilehin Adeware', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_14cea7360f9d10bf', 'prof_14cea7360f9d10bf',
  'Member, Ondo State House of Assembly (AKOKO NORTH WEST I)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_14cea7360f9d10bf', 'ind_14cea7360f9d10bf', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_14cea7360f9d10bf', 'ind_14cea7360f9d10bf', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_14cea7360f9d10bf', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|akoko north west i|2023',
  'insert', 'ind_14cea7360f9d10bf',
  'Unique: Ondo Akoko North West I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_14cea7360f9d10bf', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_14cea7360f9d10bf', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_14cea7360f9d10bf', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_akoko_north_west_i',
  'ind_14cea7360f9d10bf', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_14cea7360f9d10bf', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Akoko North West I', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_14cea7360f9d10bf', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_14cea7360f9d10bf',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_14cea7360f9d10bf', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_14cea7360f9d10bf',
  'political_assignment', '{"constituency_inec": "AKOKO NORTH WEST I", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_14cea7360f9d10bf', 'prof_14cea7360f9d10bf',
  'Abiola Timilehin Adeware',
  'abiola timilehin adeware ondo state assembly akoko north west i aa politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Adurewa Vincent Kayode -- Akoko South East (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4cd9991ea20af03a', 'Adurewa Vincent Kayode',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4cd9991ea20af03a', 'ind_4cd9991ea20af03a', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adurewa Vincent Kayode', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4cd9991ea20af03a', 'prof_4cd9991ea20af03a',
  'Member, Ondo State House of Assembly (AKOKO SOUTH EAST)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4cd9991ea20af03a', 'ind_4cd9991ea20af03a', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4cd9991ea20af03a', 'ind_4cd9991ea20af03a', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4cd9991ea20af03a', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|akoko south east|2023',
  'insert', 'ind_4cd9991ea20af03a',
  'Unique: Ondo Akoko South East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4cd9991ea20af03a', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_4cd9991ea20af03a', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4cd9991ea20af03a', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_akoko_south_east',
  'ind_4cd9991ea20af03a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4cd9991ea20af03a', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Akoko South East', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4cd9991ea20af03a', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_4cd9991ea20af03a',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4cd9991ea20af03a', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_4cd9991ea20af03a',
  'political_assignment', '{"constituency_inec": "AKOKO SOUTH EAST", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4cd9991ea20af03a', 'prof_4cd9991ea20af03a',
  'Adurewa Vincent Kayode',
  'adurewa vincent kayode ondo state assembly akoko south east aa politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Jayeola Sunday Israel -- Akoko South West I (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a4fdd6939523ff64', 'Jayeola Sunday Israel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a4fdd6939523ff64', 'ind_a4fdd6939523ff64', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jayeola Sunday Israel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a4fdd6939523ff64', 'prof_a4fdd6939523ff64',
  'Member, Ondo State House of Assembly (AKOKO SOUTH WEST I)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a4fdd6939523ff64', 'ind_a4fdd6939523ff64', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a4fdd6939523ff64', 'ind_a4fdd6939523ff64', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a4fdd6939523ff64', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|akoko south west i|2023',
  'insert', 'ind_a4fdd6939523ff64',
  'Unique: Ondo Akoko South West I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a4fdd6939523ff64', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_a4fdd6939523ff64', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a4fdd6939523ff64', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_akoko_south_west_i',
  'ind_a4fdd6939523ff64', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a4fdd6939523ff64', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Akoko South West I', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a4fdd6939523ff64', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_a4fdd6939523ff64',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a4fdd6939523ff64', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_a4fdd6939523ff64',
  'political_assignment', '{"constituency_inec": "AKOKO SOUTH WEST I", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a4fdd6939523ff64', 'prof_a4fdd6939523ff64',
  'Jayeola Sunday Israel',
  'jayeola sunday israel ondo state assembly akoko south west i aa politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Oni Olusanya Matthew -- Akure North (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_be5254199035f568', 'Oni Olusanya Matthew',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_be5254199035f568', 'ind_be5254199035f568', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oni Olusanya Matthew', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_be5254199035f568', 'prof_be5254199035f568',
  'Member, Ondo State House of Assembly (AKURE NORTH)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_be5254199035f568', 'ind_be5254199035f568', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_be5254199035f568', 'ind_be5254199035f568', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_be5254199035f568', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|akure north|2023',
  'insert', 'ind_be5254199035f568',
  'Unique: Ondo Akure North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_be5254199035f568', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_be5254199035f568', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_be5254199035f568', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_akure_north',
  'ind_be5254199035f568', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_be5254199035f568', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Akure North', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_be5254199035f568', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_be5254199035f568',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_be5254199035f568', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_be5254199035f568',
  'political_assignment', '{"constituency_inec": "AKURE NORTH", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_be5254199035f568', 'prof_be5254199035f568',
  'Oni Olusanya Matthew',
  'oni olusanya matthew ondo state assembly akure north aa politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Borokini Toluwani Simeon -- Akure South I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ba9043ba068bc4e1', 'Borokini Toluwani Simeon',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ba9043ba068bc4e1', 'ind_ba9043ba068bc4e1', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Borokini Toluwani Simeon', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ba9043ba068bc4e1', 'prof_ba9043ba068bc4e1',
  'Member, Ondo State House of Assembly (AKURE SOUTH I)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ba9043ba068bc4e1', 'ind_ba9043ba068bc4e1', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ba9043ba068bc4e1', 'ind_ba9043ba068bc4e1', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ba9043ba068bc4e1', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|akure south i|2023',
  'insert', 'ind_ba9043ba068bc4e1',
  'Unique: Ondo Akure South I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ba9043ba068bc4e1', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_ba9043ba068bc4e1', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ba9043ba068bc4e1', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_akure_south_i',
  'ind_ba9043ba068bc4e1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ba9043ba068bc4e1', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Akure South I', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ba9043ba068bc4e1', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_ba9043ba068bc4e1',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ba9043ba068bc4e1', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_ba9043ba068bc4e1',
  'political_assignment', '{"constituency_inec": "AKURE SOUTH I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ba9043ba068bc4e1', 'prof_ba9043ba068bc4e1',
  'Borokini Toluwani Simeon',
  'borokini toluwani simeon ondo state assembly akure south i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Olagundoye Joseph -- Ese Odo (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_27b4498137c25fb4', 'Olagundoye Joseph',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_27b4498137c25fb4', 'ind_27b4498137c25fb4', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Olagundoye Joseph', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_27b4498137c25fb4', 'prof_27b4498137c25fb4',
  'Member, Ondo State House of Assembly (ESE ODO)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_27b4498137c25fb4', 'ind_27b4498137c25fb4', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_27b4498137c25fb4', 'ind_27b4498137c25fb4', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_27b4498137c25fb4', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|ese odo|2023',
  'insert', 'ind_27b4498137c25fb4',
  'Unique: Ondo Ese Odo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_27b4498137c25fb4', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_27b4498137c25fb4', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_27b4498137c25fb4', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_ese_odo',
  'ind_27b4498137c25fb4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_27b4498137c25fb4', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Ese Odo', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_27b4498137c25fb4', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_27b4498137c25fb4',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_27b4498137c25fb4', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_27b4498137c25fb4',
  'political_assignment', '{"constituency_inec": "ESE ODO", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_27b4498137c25fb4', 'prof_27b4498137c25fb4',
  'Olagundoye Joseph',
  'olagundoye joseph ondo state assembly ese odo aa politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Akomolafe Temitope -- Ifedore (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8f983bb981e2a636', 'Akomolafe Temitope',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8f983bb981e2a636', 'ind_8f983bb981e2a636', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akomolafe Temitope', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8f983bb981e2a636', 'prof_8f983bb981e2a636',
  'Member, Ondo State House of Assembly (IFEDORE)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8f983bb981e2a636', 'ind_8f983bb981e2a636', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8f983bb981e2a636', 'ind_8f983bb981e2a636', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8f983bb981e2a636', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|ifedore|2023',
  'insert', 'ind_8f983bb981e2a636',
  'Unique: Ondo Ifedore seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8f983bb981e2a636', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_8f983bb981e2a636', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8f983bb981e2a636', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_ifedore',
  'ind_8f983bb981e2a636', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8f983bb981e2a636', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Ifedore', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8f983bb981e2a636', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_8f983bb981e2a636',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8f983bb981e2a636', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_8f983bb981e2a636',
  'political_assignment', '{"constituency_inec": "IFEDORE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8f983bb981e2a636', 'prof_8f983bb981e2a636',
  'Akomolafe Temitope',
  'akomolafe temitope ondo state assembly ifedore apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Akinruntan Abayomi Babatunde -- Ilaje I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_989dfdbc6030b9a5', 'Akinruntan Abayomi Babatunde',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_989dfdbc6030b9a5', 'ind_989dfdbc6030b9a5', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akinruntan Abayomi Babatunde', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_989dfdbc6030b9a5', 'prof_989dfdbc6030b9a5',
  'Member, Ondo State House of Assembly (ILAJE I)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_989dfdbc6030b9a5', 'ind_989dfdbc6030b9a5', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_989dfdbc6030b9a5', 'ind_989dfdbc6030b9a5', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_989dfdbc6030b9a5', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|ilaje i|2023',
  'insert', 'ind_989dfdbc6030b9a5',
  'Unique: Ondo Ilaje I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_989dfdbc6030b9a5', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_989dfdbc6030b9a5', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_989dfdbc6030b9a5', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_ilaje_i',
  'ind_989dfdbc6030b9a5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_989dfdbc6030b9a5', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Ilaje I', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_989dfdbc6030b9a5', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_989dfdbc6030b9a5',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_989dfdbc6030b9a5', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_989dfdbc6030b9a5',
  'political_assignment', '{"constituency_inec": "ILAJE I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_989dfdbc6030b9a5', 'prof_989dfdbc6030b9a5',
  'Akinruntan Abayomi Babatunde',
  'akinruntan abayomi babatunde ondo state assembly ilaje i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Adebamigbe Adesogo Olorungba,Ila -- Ileoluji/Okeigbo (AAC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ecb63038e67f3311', 'Adebamigbe Adesogo Olorungba,Ila',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ecb63038e67f3311', 'ind_ecb63038e67f3311', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adebamigbe Adesogo Olorungba,Ila', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ecb63038e67f3311', 'prof_ecb63038e67f3311',
  'Member, Ondo State House of Assembly (ILEOLUJI/OKEIGBO)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ecb63038e67f3311', 'ind_ecb63038e67f3311', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ecb63038e67f3311', 'ind_ecb63038e67f3311', 'org_political_party_aac', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ecb63038e67f3311', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|ileoluji/okeigbo|2023',
  'insert', 'ind_ecb63038e67f3311',
  'Unique: Ondo Ileoluji/Okeigbo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ecb63038e67f3311', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_ecb63038e67f3311', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ecb63038e67f3311', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_ileoluji/okeigbo',
  'ind_ecb63038e67f3311', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ecb63038e67f3311', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Ileoluji/Okeigbo', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ecb63038e67f3311', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_ecb63038e67f3311',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ecb63038e67f3311', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_ecb63038e67f3311',
  'political_assignment', '{"constituency_inec": "ILEOLUJI/OKEIGBO", "party_abbrev": "AAC", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ecb63038e67f3311', 'prof_ecb63038e67f3311',
  'Adebamigbe Adesogo Olorungba,Ila',
  'adebamigbe adesogo olorungba,ila ondo state assembly ileoluji/okeigbo aac politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Akinuoye Gbenga Mercy -- Irele (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_692143201a6057eb', 'Akinuoye Gbenga Mercy',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_692143201a6057eb', 'ind_692143201a6057eb', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akinuoye Gbenga Mercy', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_692143201a6057eb', 'prof_692143201a6057eb',
  'Member, Ondo State House of Assembly (IRELE)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_692143201a6057eb', 'ind_692143201a6057eb', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_692143201a6057eb', 'ind_692143201a6057eb', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_692143201a6057eb', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|irele|2023',
  'insert', 'ind_692143201a6057eb',
  'Unique: Ondo Irele seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_692143201a6057eb', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_692143201a6057eb', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_692143201a6057eb', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_irele',
  'ind_692143201a6057eb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_692143201a6057eb', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Irele', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_692143201a6057eb', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_692143201a6057eb',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_692143201a6057eb', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_692143201a6057eb',
  'political_assignment', '{"constituency_inec": "IRELE", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_692143201a6057eb', 'prof_692143201a6057eb',
  'Akinuoye Gbenga Mercy',
  'akinuoye gbenga mercy ondo state assembly irele adc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Oluwole Segun -- Odigbo I (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_52a7e57ff7f84339', 'Oluwole Segun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_52a7e57ff7f84339', 'ind_52a7e57ff7f84339', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oluwole Segun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_52a7e57ff7f84339', 'prof_52a7e57ff7f84339',
  'Member, Ondo State House of Assembly (ODIGBO I)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_52a7e57ff7f84339', 'ind_52a7e57ff7f84339', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_52a7e57ff7f84339', 'ind_52a7e57ff7f84339', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_52a7e57ff7f84339', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|odigbo i|2023',
  'insert', 'ind_52a7e57ff7f84339',
  'Unique: Ondo Odigbo I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_52a7e57ff7f84339', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_52a7e57ff7f84339', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_52a7e57ff7f84339', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_odigbo_i',
  'ind_52a7e57ff7f84339', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_52a7e57ff7f84339', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Odigbo I', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_52a7e57ff7f84339', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_52a7e57ff7f84339',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_52a7e57ff7f84339', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_52a7e57ff7f84339',
  'political_assignment', '{"constituency_inec": "ODIGBO I", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_52a7e57ff7f84339', 'prof_52a7e57ff7f84339',
  'Oluwole Segun',
  'oluwole segun ondo state assembly odigbo i adc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Ogunbameru Oladele Olugbemi -- Okitipupa I (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f79f3130f1a8563a', 'Ogunbameru Oladele Olugbemi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f79f3130f1a8563a', 'ind_f79f3130f1a8563a', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogunbameru Oladele Olugbemi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f79f3130f1a8563a', 'prof_f79f3130f1a8563a',
  'Member, Ondo State House of Assembly (OKITIPUPA I)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f79f3130f1a8563a', 'ind_f79f3130f1a8563a', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f79f3130f1a8563a', 'ind_f79f3130f1a8563a', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f79f3130f1a8563a', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|okitipupa i|2023',
  'insert', 'ind_f79f3130f1a8563a',
  'Unique: Ondo Okitipupa I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f79f3130f1a8563a', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_f79f3130f1a8563a', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f79f3130f1a8563a', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_okitipupa_i',
  'ind_f79f3130f1a8563a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f79f3130f1a8563a', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Okitipupa I', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f79f3130f1a8563a', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_f79f3130f1a8563a',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f79f3130f1a8563a', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_f79f3130f1a8563a',
  'political_assignment', '{"constituency_inec": "OKITIPUPA I", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f79f3130f1a8563a', 'prof_f79f3130f1a8563a',
  'Ogunbameru Oladele Olugbemi',
  'ogunbameru oladele olugbemi ondo state assembly okitipupa i aa politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Oladiji Olamide Adesanmi -- Ondo East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_466cab7e7164b217', 'Oladiji Olamide Adesanmi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_466cab7e7164b217', 'ind_466cab7e7164b217', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oladiji Olamide Adesanmi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_466cab7e7164b217', 'prof_466cab7e7164b217',
  'Member, Ondo State House of Assembly (ONDO EAST)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_466cab7e7164b217', 'ind_466cab7e7164b217', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_466cab7e7164b217', 'ind_466cab7e7164b217', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_466cab7e7164b217', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|ondo east|2023',
  'insert', 'ind_466cab7e7164b217',
  'Unique: Ondo Ondo East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_466cab7e7164b217', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_466cab7e7164b217', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_466cab7e7164b217', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_ondo_east',
  'ind_466cab7e7164b217', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_466cab7e7164b217', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Ondo East', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_466cab7e7164b217', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_466cab7e7164b217',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_466cab7e7164b217', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_466cab7e7164b217',
  'political_assignment', '{"constituency_inec": "ONDO EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_466cab7e7164b217', 'prof_466cab7e7164b217',
  'Oladiji Olamide Adesanmi',
  'oladiji olamide adesanmi ondo state assembly ondo east apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Akinribido Tomide Leonard -- Akure South II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bc66c69ab9bbe458', 'Akinribido Tomide Leonard',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bc66c69ab9bbe458', 'ind_bc66c69ab9bbe458', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akinribido Tomide Leonard', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bc66c69ab9bbe458', 'prof_bc66c69ab9bbe458',
  'Member, Ondo State House of Assembly (AKURE SOUTH II)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bc66c69ab9bbe458', 'ind_bc66c69ab9bbe458', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bc66c69ab9bbe458', 'ind_bc66c69ab9bbe458', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bc66c69ab9bbe458', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|akure south ii|2023',
  'insert', 'ind_bc66c69ab9bbe458',
  'Unique: Ondo Akure South II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bc66c69ab9bbe458', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_bc66c69ab9bbe458', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bc66c69ab9bbe458', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_akure_south_ii',
  'ind_bc66c69ab9bbe458', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bc66c69ab9bbe458', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Akure South II', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bc66c69ab9bbe458', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_bc66c69ab9bbe458',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bc66c69ab9bbe458', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_bc66c69ab9bbe458',
  'political_assignment', '{"constituency_inec": "AKURE SOUTH II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bc66c69ab9bbe458', 'prof_bc66c69ab9bbe458',
  'Akinribido Tomide Leonard',
  'akinribido tomide leonard ondo state assembly akure south ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Tomomewo Favour Semilore -- Ilaje II (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5a90e413a2148005', 'Tomomewo Favour Semilore',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5a90e413a2148005', 'ind_5a90e413a2148005', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Tomomewo Favour Semilore', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5a90e413a2148005', 'prof_5a90e413a2148005',
  'Member, Ondo State House of Assembly (ILAJE II)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5a90e413a2148005', 'ind_5a90e413a2148005', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5a90e413a2148005', 'ind_5a90e413a2148005', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5a90e413a2148005', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|ilaje ii|2023',
  'insert', 'ind_5a90e413a2148005',
  'Unique: Ondo Ilaje II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5a90e413a2148005', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_5a90e413a2148005', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5a90e413a2148005', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_ilaje_ii',
  'ind_5a90e413a2148005', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5a90e413a2148005', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Ilaje II', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5a90e413a2148005', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_5a90e413a2148005',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5a90e413a2148005', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_5a90e413a2148005',
  'political_assignment', '{"constituency_inec": "ILAJE II", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5a90e413a2148005', 'prof_5a90e413a2148005',
  'Tomomewo Favour Semilore',
  'tomomewo favour semilore ondo state assembly ilaje ii adc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Akinkugbe Ayodele -- Odigbo II (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1e345fc84bd7fe9c', 'Akinkugbe Ayodele',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1e345fc84bd7fe9c', 'ind_1e345fc84bd7fe9c', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akinkugbe Ayodele', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1e345fc84bd7fe9c', 'prof_1e345fc84bd7fe9c',
  'Member, Ondo State House of Assembly (ODIGBO II)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1e345fc84bd7fe9c', 'ind_1e345fc84bd7fe9c', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1e345fc84bd7fe9c', 'ind_1e345fc84bd7fe9c', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1e345fc84bd7fe9c', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|odigbo ii|2023',
  'insert', 'ind_1e345fc84bd7fe9c',
  'Unique: Ondo Odigbo II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1e345fc84bd7fe9c', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_1e345fc84bd7fe9c', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1e345fc84bd7fe9c', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_odigbo_ii',
  'ind_1e345fc84bd7fe9c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1e345fc84bd7fe9c', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Odigbo II', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1e345fc84bd7fe9c', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_1e345fc84bd7fe9c',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1e345fc84bd7fe9c', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_1e345fc84bd7fe9c',
  'political_assignment', '{"constituency_inec": "ODIGBO II", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1e345fc84bd7fe9c', 'prof_1e345fc84bd7fe9c',
  'Akinkugbe Ayodele',
  'akinkugbe ayodele ondo state assembly odigbo ii aa politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Omopariola Bayo O. -- Okitipupa II (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3d1f85d7e67f06d6', 'Omopariola Bayo O.',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3d1f85d7e67f06d6', 'ind_3d1f85d7e67f06d6', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Omopariola Bayo O.', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3d1f85d7e67f06d6', 'prof_3d1f85d7e67f06d6',
  'Member, Ondo State House of Assembly (OKITIPUPA II)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3d1f85d7e67f06d6', 'ind_3d1f85d7e67f06d6', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3d1f85d7e67f06d6', 'ind_3d1f85d7e67f06d6', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3d1f85d7e67f06d6', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|okitipupa ii|2023',
  'insert', 'ind_3d1f85d7e67f06d6',
  'Unique: Ondo Okitipupa II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3d1f85d7e67f06d6', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_3d1f85d7e67f06d6', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3d1f85d7e67f06d6', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_okitipupa_ii',
  'ind_3d1f85d7e67f06d6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3d1f85d7e67f06d6', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Okitipupa II', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3d1f85d7e67f06d6', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_3d1f85d7e67f06d6',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3d1f85d7e67f06d6', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_3d1f85d7e67f06d6',
  'political_assignment', '{"constituency_inec": "OKITIPUPA II", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3d1f85d7e67f06d6', 'prof_3d1f85d7e67f06d6',
  'Omopariola Bayo O.',
  'omopariola bayo o. ondo state assembly okitipupa ii aa politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Ajebuli Bolanle -- Ondo West II (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_01124384ce64265d', 'Ajebuli Bolanle',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_01124384ce64265d', 'ind_01124384ce64265d', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ajebuli Bolanle', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_01124384ce64265d', 'prof_01124384ce64265d',
  'Member, Ondo State House of Assembly (ONDO WEST II)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_01124384ce64265d', 'ind_01124384ce64265d', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_01124384ce64265d', 'ind_01124384ce64265d', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_01124384ce64265d', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|ondo west ii|2023',
  'insert', 'ind_01124384ce64265d',
  'Unique: Ondo Ondo West II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_01124384ce64265d', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_01124384ce64265d', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_01124384ce64265d', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_ondo_west_ii',
  'ind_01124384ce64265d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_01124384ce64265d', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Ondo West II', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_01124384ce64265d', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_01124384ce64265d',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_01124384ce64265d', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_01124384ce64265d',
  'political_assignment', '{"constituency_inec": "ONDO WEST II", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_01124384ce64265d', 'prof_01124384ce64265d',
  'Ajebuli Bolanle',
  'ajebuli bolanle ondo state assembly ondo west ii adc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Adekanmi Kehinde Tinuke -- Owo II (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_88ebaf638b79d4f4', 'Adekanmi Kehinde Tinuke',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_88ebaf638b79d4f4', 'ind_88ebaf638b79d4f4', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adekanmi Kehinde Tinuke', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_88ebaf638b79d4f4', 'prof_88ebaf638b79d4f4',
  'Member, Ondo State House of Assembly (OWO II)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_88ebaf638b79d4f4', 'ind_88ebaf638b79d4f4', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_88ebaf638b79d4f4', 'ind_88ebaf638b79d4f4', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_88ebaf638b79d4f4', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|owo ii|2023',
  'insert', 'ind_88ebaf638b79d4f4',
  'Unique: Ondo Owo II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_88ebaf638b79d4f4', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_88ebaf638b79d4f4', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_88ebaf638b79d4f4', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_owo_ii',
  'ind_88ebaf638b79d4f4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_88ebaf638b79d4f4', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Owo II', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_88ebaf638b79d4f4', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_88ebaf638b79d4f4',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_88ebaf638b79d4f4', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_88ebaf638b79d4f4',
  'political_assignment', '{"constituency_inec": "OWO II", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_88ebaf638b79d4f4', 'prof_88ebaf638b79d4f4',
  'Adekanmi Kehinde Tinuke',
  'adekanmi kehinde tinuke ondo state assembly owo ii aa politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Adefuyi Adeola -- Ese (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_09c0bd9753fcb14b', 'Adefuyi Adeola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_09c0bd9753fcb14b', 'ind_09c0bd9753fcb14b', 'individual', 'place_state_ondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adefuyi Adeola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_09c0bd9753fcb14b', 'prof_09c0bd9753fcb14b',
  'Member, Ondo State House of Assembly (ESE)',
  'place_state_ondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_09c0bd9753fcb14b', 'ind_09c0bd9753fcb14b', 'term_ng_ondo_state_assembly_10th_2023_2027',
  'place_state_ondo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_09c0bd9753fcb14b', 'ind_09c0bd9753fcb14b', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_09c0bd9753fcb14b', 'seed_run_s05_political_ondo_roster_20260502', 'individual',
  'ng_state_assembly_member|ondo|ese|2023',
  'insert', 'ind_09c0bd9753fcb14b',
  'Unique: Ondo Ese seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_09c0bd9753fcb14b', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_09c0bd9753fcb14b', 'seed_source_nigerianleaders_ondo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_09c0bd9753fcb14b', 'seed_run_s05_political_ondo_roster_20260502', 'seed_source_nigerianleaders_ondo_assembly_20260502',
  'nl_ondo_assembly_2023_ese',
  'ind_09c0bd9753fcb14b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_09c0bd9753fcb14b', 'seed_run_s05_political_ondo_roster_20260502',
  'Ondo Ese', 'place_state_ondo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_09c0bd9753fcb14b', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_09c0bd9753fcb14b',
  'seed_source_nigerianleaders_ondo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_09c0bd9753fcb14b', 'seed_run_s05_political_ondo_roster_20260502', 'individual', 'ind_09c0bd9753fcb14b',
  'political_assignment', '{"constituency_inec": "ESE", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/ondo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_09c0bd9753fcb14b', 'prof_09c0bd9753fcb14b',
  'Adefuyi Adeola',
  'adefuyi adeola ondo state assembly ese adc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ondo',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
