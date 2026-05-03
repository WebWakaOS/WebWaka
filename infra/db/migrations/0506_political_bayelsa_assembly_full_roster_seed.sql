-- ============================================================
-- Migration 0506: Bayelsa State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Bayelsa State House of Assembly Members
-- Members seeded: 24/24
-- Party breakdown: PDP:18, APC:4, APGA:2
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'NigerianLeaders – Complete List of Bayelsa State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_bayelsa_roster_20260502', 'S05 Batch – Bayelsa State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_bayelsa_roster_20260502',
  'seed_run_s05_political_bayelsa_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0506_political_bayelsa_assembly_full_roster_seed.sql',
  NULL, 24,
  '24/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'Bayelsa State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_bayelsa',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (24 of 24 seats) ──────────────────────────────────────

-- 01. Felix Bonny-Ayah -- Southern Ijaw I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c7ab515f8bf7b9e7', 'Felix Bonny-Ayah',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c7ab515f8bf7b9e7', 'ind_c7ab515f8bf7b9e7', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Felix Bonny-Ayah', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c7ab515f8bf7b9e7', 'prof_c7ab515f8bf7b9e7',
  'Member, Bayelsa State House of Assembly (SOUTHERN IJAW I)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c7ab515f8bf7b9e7', 'ind_c7ab515f8bf7b9e7', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c7ab515f8bf7b9e7', 'ind_c7ab515f8bf7b9e7', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c7ab515f8bf7b9e7', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|southern ijaw i|2023',
  'insert', 'ind_c7ab515f8bf7b9e7',
  'Unique: Bayelsa Southern Ijaw I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c7ab515f8bf7b9e7', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_c7ab515f8bf7b9e7', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c7ab515f8bf7b9e7', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_southern_ijaw_i',
  'ind_c7ab515f8bf7b9e7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c7ab515f8bf7b9e7', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Southern Ijaw I', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c7ab515f8bf7b9e7', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_c7ab515f8bf7b9e7',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c7ab515f8bf7b9e7', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_c7ab515f8bf7b9e7',
  'political_assignment', '{"constituency_inec": "SOUTHERN IJAW I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c7ab515f8bf7b9e7', 'prof_c7ab515f8bf7b9e7',
  'Felix Bonny-Ayah',
  'felix bonny-ayah bayelsa state assembly southern ijaw i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Bubou-Monday Obolo -- Southern Ijaw II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_994e42f653609d20', 'Bubou-Monday Obolo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_994e42f653609d20', 'ind_994e42f653609d20', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bubou-Monday Obolo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_994e42f653609d20', 'prof_994e42f653609d20',
  'Member, Bayelsa State House of Assembly (SOUTHERN IJAW II)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_994e42f653609d20', 'ind_994e42f653609d20', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_994e42f653609d20', 'ind_994e42f653609d20', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_994e42f653609d20', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|southern ijaw ii|2023',
  'insert', 'ind_994e42f653609d20',
  'Unique: Bayelsa Southern Ijaw II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_994e42f653609d20', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_994e42f653609d20', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_994e42f653609d20', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_southern_ijaw_ii',
  'ind_994e42f653609d20', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_994e42f653609d20', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Southern Ijaw II', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_994e42f653609d20', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_994e42f653609d20',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_994e42f653609d20', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_994e42f653609d20',
  'political_assignment', '{"constituency_inec": "SOUTHERN IJAW II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_994e42f653609d20', 'prof_994e42f653609d20',
  'Bubou-Monday Obolo',
  'bubou-monday obolo bayelsa state assembly southern ijaw ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Malon Moses -- Southern Ijaw III (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a2d8412dde5ec851', 'Malon Moses',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a2d8412dde5ec851', 'ind_a2d8412dde5ec851', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Malon Moses', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a2d8412dde5ec851', 'prof_a2d8412dde5ec851',
  'Member, Bayelsa State House of Assembly (SOUTHERN IJAW III)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a2d8412dde5ec851', 'ind_a2d8412dde5ec851', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a2d8412dde5ec851', 'ind_a2d8412dde5ec851', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a2d8412dde5ec851', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|southern ijaw iii|2023',
  'insert', 'ind_a2d8412dde5ec851',
  'Unique: Bayelsa Southern Ijaw III seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a2d8412dde5ec851', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_a2d8412dde5ec851', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a2d8412dde5ec851', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_southern_ijaw_iii',
  'ind_a2d8412dde5ec851', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a2d8412dde5ec851', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Southern Ijaw III', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a2d8412dde5ec851', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_a2d8412dde5ec851',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a2d8412dde5ec851', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_a2d8412dde5ec851',
  'political_assignment', '{"constituency_inec": "SOUTHERN IJAW III", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a2d8412dde5ec851', 'prof_a2d8412dde5ec851',
  'Malon Moses',
  'malon moses bayelsa state assembly southern ijaw iii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Victor-Ben Selekaye -- Southern Ijaw IV (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_89c54af80ab80f90', 'Victor-Ben Selekaye',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_89c54af80ab80f90', 'ind_89c54af80ab80f90', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Victor-Ben Selekaye', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_89c54af80ab80f90', 'prof_89c54af80ab80f90',
  'Member, Bayelsa State House of Assembly (SOUTHERN IJAW IV)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_89c54af80ab80f90', 'ind_89c54af80ab80f90', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_89c54af80ab80f90', 'ind_89c54af80ab80f90', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_89c54af80ab80f90', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|southern ijaw iv|2023',
  'insert', 'ind_89c54af80ab80f90',
  'Unique: Bayelsa Southern Ijaw IV seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_89c54af80ab80f90', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_89c54af80ab80f90', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_89c54af80ab80f90', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_southern_ijaw_iv',
  'ind_89c54af80ab80f90', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_89c54af80ab80f90', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Southern Ijaw IV', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_89c54af80ab80f90', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_89c54af80ab80f90',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_89c54af80ab80f90', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_89c54af80ab80f90',
  'political_assignment', '{"constituency_inec": "SOUTHERN IJAW IV", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_89c54af80ab80f90', 'prof_89c54af80ab80f90',
  'Victor-Ben Selekaye',
  'victor-ben selekaye bayelsa state assembly southern ijaw iv apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Charles Daniel -- Brass I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_11fa39b448a26873', 'Charles Daniel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_11fa39b448a26873', 'ind_11fa39b448a26873', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Charles Daniel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_11fa39b448a26873', 'prof_11fa39b448a26873',
  'Member, Bayelsa State House of Assembly (BRASS I)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_11fa39b448a26873', 'ind_11fa39b448a26873', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_11fa39b448a26873', 'ind_11fa39b448a26873', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_11fa39b448a26873', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|brass i|2023',
  'insert', 'ind_11fa39b448a26873',
  'Unique: Bayelsa Brass I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_11fa39b448a26873', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_11fa39b448a26873', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_11fa39b448a26873', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_brass_i',
  'ind_11fa39b448a26873', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_11fa39b448a26873', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Brass I', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_11fa39b448a26873', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_11fa39b448a26873',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_11fa39b448a26873', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_11fa39b448a26873',
  'political_assignment', '{"constituency_inec": "BRASS I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_11fa39b448a26873', 'prof_11fa39b448a26873',
  'Charles Daniel',
  'charles daniel bayelsa state assembly brass i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Omubo Timinyo -- Brass II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_24190521d6064904', 'Omubo Timinyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_24190521d6064904', 'ind_24190521d6064904', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Omubo Timinyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_24190521d6064904', 'prof_24190521d6064904',
  'Member, Bayelsa State House of Assembly (BRASS II)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_24190521d6064904', 'ind_24190521d6064904', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_24190521d6064904', 'ind_24190521d6064904', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_24190521d6064904', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|brass ii|2023',
  'insert', 'ind_24190521d6064904',
  'Unique: Bayelsa Brass II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_24190521d6064904', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_24190521d6064904', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_24190521d6064904', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_brass_ii',
  'ind_24190521d6064904', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_24190521d6064904', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Brass II', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_24190521d6064904', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_24190521d6064904',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_24190521d6064904', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_24190521d6064904',
  'political_assignment', '{"constituency_inec": "BRASS II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_24190521d6064904', 'prof_24190521d6064904',
  'Omubo Timinyo',
  'omubo timinyo bayelsa state assembly brass ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Abraham Ingobere -- Brass III (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5a5c35085479ea6e', 'Abraham Ingobere',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5a5c35085479ea6e', 'ind_5a5c35085479ea6e', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abraham Ingobere', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5a5c35085479ea6e', 'prof_5a5c35085479ea6e',
  'Member, Bayelsa State House of Assembly (BRASS III)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5a5c35085479ea6e', 'ind_5a5c35085479ea6e', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5a5c35085479ea6e', 'ind_5a5c35085479ea6e', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5a5c35085479ea6e', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|brass iii|2023',
  'insert', 'ind_5a5c35085479ea6e',
  'Unique: Bayelsa Brass III seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5a5c35085479ea6e', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_5a5c35085479ea6e', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5a5c35085479ea6e', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_brass_iii',
  'ind_5a5c35085479ea6e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5a5c35085479ea6e', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Brass III', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5a5c35085479ea6e', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_5a5c35085479ea6e',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5a5c35085479ea6e', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_5a5c35085479ea6e',
  'political_assignment', '{"constituency_inec": "BRASS III", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5a5c35085479ea6e', 'prof_5a5c35085479ea6e',
  'Abraham Ingobere',
  'abraham ingobere bayelsa state assembly brass iii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Onyinke Godbless -- Sagbama I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_495fea3e3e5431d3', 'Onyinke Godbless',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_495fea3e3e5431d3', 'ind_495fea3e3e5431d3', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Onyinke Godbless', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_495fea3e3e5431d3', 'prof_495fea3e3e5431d3',
  'Member, Bayelsa State House of Assembly (SAGBAMA I)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_495fea3e3e5431d3', 'ind_495fea3e3e5431d3', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_495fea3e3e5431d3', 'ind_495fea3e3e5431d3', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_495fea3e3e5431d3', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|sagbama i|2023',
  'insert', 'ind_495fea3e3e5431d3',
  'Unique: Bayelsa Sagbama I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_495fea3e3e5431d3', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_495fea3e3e5431d3', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_495fea3e3e5431d3', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_sagbama_i',
  'ind_495fea3e3e5431d3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_495fea3e3e5431d3', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Sagbama I', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_495fea3e3e5431d3', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_495fea3e3e5431d3',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_495fea3e3e5431d3', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_495fea3e3e5431d3',
  'political_assignment', '{"constituency_inec": "SAGBAMA I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_495fea3e3e5431d3', 'prof_495fea3e3e5431d3',
  'Onyinke Godbless',
  'onyinke godbless bayelsa state assembly sagbama i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Bernard Kenebai -- Sagbama II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b3ab4d96e0baa8b6', 'Bernard Kenebai',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b3ab4d96e0baa8b6', 'ind_b3ab4d96e0baa8b6', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bernard Kenebai', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b3ab4d96e0baa8b6', 'prof_b3ab4d96e0baa8b6',
  'Member, Bayelsa State House of Assembly (SAGBAMA II)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b3ab4d96e0baa8b6', 'ind_b3ab4d96e0baa8b6', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b3ab4d96e0baa8b6', 'ind_b3ab4d96e0baa8b6', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b3ab4d96e0baa8b6', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|sagbama ii|2023',
  'insert', 'ind_b3ab4d96e0baa8b6',
  'Unique: Bayelsa Sagbama II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b3ab4d96e0baa8b6', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_b3ab4d96e0baa8b6', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b3ab4d96e0baa8b6', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_sagbama_ii',
  'ind_b3ab4d96e0baa8b6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b3ab4d96e0baa8b6', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Sagbama II', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b3ab4d96e0baa8b6', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_b3ab4d96e0baa8b6',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b3ab4d96e0baa8b6', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_b3ab4d96e0baa8b6',
  'political_assignment', '{"constituency_inec": "SAGBAMA II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b3ab4d96e0baa8b6', 'prof_b3ab4d96e0baa8b6',
  'Bernard Kenebai',
  'bernard kenebai bayelsa state assembly sagbama ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Ebizi Brown -- Sagbama III (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_30fdbd54799c9fdc', 'Ebizi Brown',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_30fdbd54799c9fdc', 'ind_30fdbd54799c9fdc', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ebizi Brown', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_30fdbd54799c9fdc', 'prof_30fdbd54799c9fdc',
  'Member, Bayelsa State House of Assembly (SAGBAMA III)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_30fdbd54799c9fdc', 'ind_30fdbd54799c9fdc', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_30fdbd54799c9fdc', 'ind_30fdbd54799c9fdc', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_30fdbd54799c9fdc', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|sagbama iii|2023',
  'insert', 'ind_30fdbd54799c9fdc',
  'Unique: Bayelsa Sagbama III seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_30fdbd54799c9fdc', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_30fdbd54799c9fdc', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_30fdbd54799c9fdc', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_sagbama_iii',
  'ind_30fdbd54799c9fdc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_30fdbd54799c9fdc', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Sagbama III', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_30fdbd54799c9fdc', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_30fdbd54799c9fdc',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_30fdbd54799c9fdc', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_30fdbd54799c9fdc',
  'political_assignment', '{"constituency_inec": "SAGBAMA III", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_30fdbd54799c9fdc', 'prof_30fdbd54799c9fdc',
  'Ebizi Brown',
  'ebizi brown bayelsa state assembly sagbama iii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Werinipre Pamoh -- Kolokuma/Opokuma I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1dcd11ba1aac8f8d', 'Werinipre Pamoh',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1dcd11ba1aac8f8d', 'ind_1dcd11ba1aac8f8d', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Werinipre Pamoh', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1dcd11ba1aac8f8d', 'prof_1dcd11ba1aac8f8d',
  'Member, Bayelsa State House of Assembly (KOLOKUMA/OPOKUMA I)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1dcd11ba1aac8f8d', 'ind_1dcd11ba1aac8f8d', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1dcd11ba1aac8f8d', 'ind_1dcd11ba1aac8f8d', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1dcd11ba1aac8f8d', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|kolokuma/opokuma i|2023',
  'insert', 'ind_1dcd11ba1aac8f8d',
  'Unique: Bayelsa Kolokuma/Opokuma I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1dcd11ba1aac8f8d', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_1dcd11ba1aac8f8d', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1dcd11ba1aac8f8d', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_kolokuma/opokuma_i',
  'ind_1dcd11ba1aac8f8d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1dcd11ba1aac8f8d', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Kolokuma/Opokuma I', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1dcd11ba1aac8f8d', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_1dcd11ba1aac8f8d',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1dcd11ba1aac8f8d', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_1dcd11ba1aac8f8d',
  'political_assignment', '{"constituency_inec": "KOLOKUMA/OPOKUMA I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1dcd11ba1aac8f8d', 'prof_1dcd11ba1aac8f8d',
  'Werinipre Pamoh',
  'werinipre pamoh bayelsa state assembly kolokuma/opokuma i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Fafi Wisdom -- Kolokuma/Opokuma II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3ec7a244d00a4bcc', 'Fafi Wisdom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3ec7a244d00a4bcc', 'ind_3ec7a244d00a4bcc', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Fafi Wisdom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3ec7a244d00a4bcc', 'prof_3ec7a244d00a4bcc',
  'Member, Bayelsa State House of Assembly (KOLOKUMA/OPOKUMA II)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3ec7a244d00a4bcc', 'ind_3ec7a244d00a4bcc', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3ec7a244d00a4bcc', 'ind_3ec7a244d00a4bcc', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3ec7a244d00a4bcc', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|kolokuma/opokuma ii|2023',
  'insert', 'ind_3ec7a244d00a4bcc',
  'Unique: Bayelsa Kolokuma/Opokuma II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3ec7a244d00a4bcc', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_3ec7a244d00a4bcc', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3ec7a244d00a4bcc', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_kolokuma/opokuma_ii',
  'ind_3ec7a244d00a4bcc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3ec7a244d00a4bcc', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Kolokuma/Opokuma II', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3ec7a244d00a4bcc', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_3ec7a244d00a4bcc',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3ec7a244d00a4bcc', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_3ec7a244d00a4bcc',
  'political_assignment', '{"constituency_inec": "KOLOKUMA/OPOKUMA II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3ec7a244d00a4bcc', 'prof_3ec7a244d00a4bcc',
  'Fafi Wisdom',
  'fafi wisdom bayelsa state assembly kolokuma/opokuma ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Tare Porri -- Ekeremor I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_198a8379b5625269', 'Tare Porri',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_198a8379b5625269', 'ind_198a8379b5625269', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Tare Porri', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_198a8379b5625269', 'prof_198a8379b5625269',
  'Member, Bayelsa State House of Assembly (EKEREMOR I)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_198a8379b5625269', 'ind_198a8379b5625269', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_198a8379b5625269', 'ind_198a8379b5625269', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_198a8379b5625269', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|ekeremor i|2023',
  'insert', 'ind_198a8379b5625269',
  'Unique: Bayelsa Ekeremor I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_198a8379b5625269', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_198a8379b5625269', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_198a8379b5625269', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_ekeremor_i',
  'ind_198a8379b5625269', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_198a8379b5625269', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Ekeremor I', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_198a8379b5625269', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_198a8379b5625269',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_198a8379b5625269', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_198a8379b5625269',
  'political_assignment', '{"constituency_inec": "EKEREMOR I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_198a8379b5625269', 'prof_198a8379b5625269',
  'Tare Porri',
  'tare porri bayelsa state assembly ekeremor i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Mitin Living -- Ekeremor II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_38dea321f6c62987', 'Mitin Living',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_38dea321f6c62987', 'ind_38dea321f6c62987', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mitin Living', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_38dea321f6c62987', 'prof_38dea321f6c62987',
  'Member, Bayelsa State House of Assembly (EKEREMOR II)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_38dea321f6c62987', 'ind_38dea321f6c62987', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_38dea321f6c62987', 'ind_38dea321f6c62987', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_38dea321f6c62987', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|ekeremor ii|2023',
  'insert', 'ind_38dea321f6c62987',
  'Unique: Bayelsa Ekeremor II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_38dea321f6c62987', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_38dea321f6c62987', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_38dea321f6c62987', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_ekeremor_ii',
  'ind_38dea321f6c62987', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_38dea321f6c62987', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Ekeremor II', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_38dea321f6c62987', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_38dea321f6c62987',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_38dea321f6c62987', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_38dea321f6c62987',
  'political_assignment', '{"constituency_inec": "EKEREMOR II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_38dea321f6c62987', 'prof_38dea321f6c62987',
  'Mitin Living',
  'mitin living bayelsa state assembly ekeremor ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Michael Ogbere -- Ekeremor III (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3dd2b2d411e1319f', 'Michael Ogbere',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3dd2b2d411e1319f', 'ind_3dd2b2d411e1319f', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Michael Ogbere', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3dd2b2d411e1319f', 'prof_3dd2b2d411e1319f',
  'Member, Bayelsa State House of Assembly (EKEREMOR III)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3dd2b2d411e1319f', 'ind_3dd2b2d411e1319f', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3dd2b2d411e1319f', 'ind_3dd2b2d411e1319f', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3dd2b2d411e1319f', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|ekeremor iii|2023',
  'insert', 'ind_3dd2b2d411e1319f',
  'Unique: Bayelsa Ekeremor III seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3dd2b2d411e1319f', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_3dd2b2d411e1319f', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3dd2b2d411e1319f', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_ekeremor_iii',
  'ind_3dd2b2d411e1319f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3dd2b2d411e1319f', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Ekeremor III', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3dd2b2d411e1319f', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_3dd2b2d411e1319f',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3dd2b2d411e1319f', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_3dd2b2d411e1319f',
  'political_assignment', '{"constituency_inec": "EKEREMOR III", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3dd2b2d411e1319f', 'prof_3dd2b2d411e1319f',
  'Michael Ogbere',
  'michael ogbere bayelsa state assembly ekeremor iii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Obodor Mitema -- Ogbia I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8ef7806c7fac7dd3', 'Obodor Mitema',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8ef7806c7fac7dd3', 'ind_8ef7806c7fac7dd3', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Obodor Mitema', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8ef7806c7fac7dd3', 'prof_8ef7806c7fac7dd3',
  'Member, Bayelsa State House of Assembly (OGBIA I)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8ef7806c7fac7dd3', 'ind_8ef7806c7fac7dd3', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8ef7806c7fac7dd3', 'ind_8ef7806c7fac7dd3', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8ef7806c7fac7dd3', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|ogbia i|2023',
  'insert', 'ind_8ef7806c7fac7dd3',
  'Unique: Bayelsa Ogbia I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8ef7806c7fac7dd3', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_8ef7806c7fac7dd3', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8ef7806c7fac7dd3', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_ogbia_i',
  'ind_8ef7806c7fac7dd3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8ef7806c7fac7dd3', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Ogbia I', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8ef7806c7fac7dd3', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_8ef7806c7fac7dd3',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8ef7806c7fac7dd3', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_8ef7806c7fac7dd3',
  'political_assignment', '{"constituency_inec": "OGBIA I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8ef7806c7fac7dd3', 'prof_8ef7806c7fac7dd3',
  'Obodor Mitema',
  'obodor mitema bayelsa state assembly ogbia i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Gibson Munalayefa -- Ogbia II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_359714d6bffbc1be', 'Gibson Munalayefa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_359714d6bffbc1be', 'ind_359714d6bffbc1be', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Gibson Munalayefa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_359714d6bffbc1be', 'prof_359714d6bffbc1be',
  'Member, Bayelsa State House of Assembly (OGBIA II)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_359714d6bffbc1be', 'ind_359714d6bffbc1be', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_359714d6bffbc1be', 'ind_359714d6bffbc1be', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_359714d6bffbc1be', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|ogbia ii|2023',
  'insert', 'ind_359714d6bffbc1be',
  'Unique: Bayelsa Ogbia II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_359714d6bffbc1be', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_359714d6bffbc1be', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_359714d6bffbc1be', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_ogbia_ii',
  'ind_359714d6bffbc1be', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_359714d6bffbc1be', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Ogbia II', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_359714d6bffbc1be', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_359714d6bffbc1be',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_359714d6bffbc1be', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_359714d6bffbc1be',
  'political_assignment', '{"constituency_inec": "OGBIA II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_359714d6bffbc1be', 'prof_359714d6bffbc1be',
  'Gibson Munalayefa',
  'gibson munalayefa bayelsa state assembly ogbia ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Ogoli Naomi -- Ogbia III (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_893301f9196b1798', 'Ogoli Naomi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_893301f9196b1798', 'ind_893301f9196b1798', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogoli Naomi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_893301f9196b1798', 'prof_893301f9196b1798',
  'Member, Bayelsa State House of Assembly (OGBIA III)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_893301f9196b1798', 'ind_893301f9196b1798', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_893301f9196b1798', 'ind_893301f9196b1798', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_893301f9196b1798', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|ogbia iii|2023',
  'insert', 'ind_893301f9196b1798',
  'Unique: Bayelsa Ogbia III seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_893301f9196b1798', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_893301f9196b1798', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_893301f9196b1798', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_ogbia_iii',
  'ind_893301f9196b1798', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_893301f9196b1798', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Ogbia III', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_893301f9196b1798', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_893301f9196b1798',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_893301f9196b1798', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_893301f9196b1798',
  'political_assignment', '{"constituency_inec": "OGBIA III", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_893301f9196b1798', 'prof_893301f9196b1798',
  'Ogoli Naomi',
  'ogoli naomi bayelsa state assembly ogbia iii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Egba Ayibanengiyefa -- Yenagoa I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ed9b3a1d04e1dd4d', 'Egba Ayibanengiyefa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ed9b3a1d04e1dd4d', 'ind_ed9b3a1d04e1dd4d', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Egba Ayibanengiyefa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ed9b3a1d04e1dd4d', 'prof_ed9b3a1d04e1dd4d',
  'Member, Bayelsa State House of Assembly (YENAGOA I)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ed9b3a1d04e1dd4d', 'ind_ed9b3a1d04e1dd4d', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ed9b3a1d04e1dd4d', 'ind_ed9b3a1d04e1dd4d', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ed9b3a1d04e1dd4d', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|yenagoa i|2023',
  'insert', 'ind_ed9b3a1d04e1dd4d',
  'Unique: Bayelsa Yenagoa I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ed9b3a1d04e1dd4d', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_ed9b3a1d04e1dd4d', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ed9b3a1d04e1dd4d', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_yenagoa_i',
  'ind_ed9b3a1d04e1dd4d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ed9b3a1d04e1dd4d', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Yenagoa I', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ed9b3a1d04e1dd4d', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_ed9b3a1d04e1dd4d',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ed9b3a1d04e1dd4d', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_ed9b3a1d04e1dd4d',
  'political_assignment', '{"constituency_inec": "YENAGOA I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ed9b3a1d04e1dd4d', 'prof_ed9b3a1d04e1dd4d',
  'Egba Ayibanengiyefa',
  'egba ayibanengiyefa bayelsa state assembly yenagoa i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Waikumo Amakoromo -- Yenagoa II (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_eedc71926ca155f9', 'Waikumo Amakoromo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_eedc71926ca155f9', 'ind_eedc71926ca155f9', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Waikumo Amakoromo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_eedc71926ca155f9', 'prof_eedc71926ca155f9',
  'Member, Bayelsa State House of Assembly (YENAGOA II)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_eedc71926ca155f9', 'ind_eedc71926ca155f9', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_eedc71926ca155f9', 'ind_eedc71926ca155f9', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_eedc71926ca155f9', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|yenagoa ii|2023',
  'insert', 'ind_eedc71926ca155f9',
  'Unique: Bayelsa Yenagoa II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_eedc71926ca155f9', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_eedc71926ca155f9', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_eedc71926ca155f9', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_yenagoa_ii',
  'ind_eedc71926ca155f9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_eedc71926ca155f9', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Yenagoa II', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_eedc71926ca155f9', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_eedc71926ca155f9',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_eedc71926ca155f9', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_eedc71926ca155f9',
  'political_assignment', '{"constituency_inec": "YENAGOA II", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_eedc71926ca155f9', 'prof_eedc71926ca155f9',
  'Waikumo Amakoromo',
  'waikumo amakoromo bayelsa state assembly yenagoa ii apga politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Teddy Tombara -- Yenagoa III (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c746886c7fc5b825', 'Teddy Tombara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c746886c7fc5b825', 'ind_c746886c7fc5b825', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Teddy Tombara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c746886c7fc5b825', 'prof_c746886c7fc5b825',
  'Member, Bayelsa State House of Assembly (YENAGOA III)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c746886c7fc5b825', 'ind_c746886c7fc5b825', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c746886c7fc5b825', 'ind_c746886c7fc5b825', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c746886c7fc5b825', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|yenagoa iii|2023',
  'insert', 'ind_c746886c7fc5b825',
  'Unique: Bayelsa Yenagoa III seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c746886c7fc5b825', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_c746886c7fc5b825', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c746886c7fc5b825', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_yenagoa_iii',
  'ind_c746886c7fc5b825', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c746886c7fc5b825', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Yenagoa III', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c746886c7fc5b825', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_c746886c7fc5b825',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c746886c7fc5b825', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_c746886c7fc5b825',
  'political_assignment', '{"constituency_inec": "YENAGOA III", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c746886c7fc5b825', 'prof_c746886c7fc5b825',
  'Teddy Tombara',
  'teddy tombara bayelsa state assembly yenagoa iii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 22. George Braah-Okigbanyo -- Nembe I (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8b4e41569957ce19', 'George Braah-Okigbanyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8b4e41569957ce19', 'ind_8b4e41569957ce19', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'George Braah-Okigbanyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8b4e41569957ce19', 'prof_8b4e41569957ce19',
  'Member, Bayelsa State House of Assembly (NEMBE I)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8b4e41569957ce19', 'ind_8b4e41569957ce19', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8b4e41569957ce19', 'ind_8b4e41569957ce19', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8b4e41569957ce19', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|nembe i|2023',
  'insert', 'ind_8b4e41569957ce19',
  'Unique: Bayelsa Nembe I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8b4e41569957ce19', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_8b4e41569957ce19', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8b4e41569957ce19', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_nembe_i',
  'ind_8b4e41569957ce19', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8b4e41569957ce19', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Nembe I', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8b4e41569957ce19', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_8b4e41569957ce19',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8b4e41569957ce19', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_8b4e41569957ce19',
  'political_assignment', '{"constituency_inec": "NEMBE I", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8b4e41569957ce19', 'prof_8b4e41569957ce19',
  'George Braah-Okigbanyo',
  'george braah-okigbanyo bayelsa state assembly nembe i apga politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Edward Brigidi -- Nembe II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2ba625b73569e510', 'Edward Brigidi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2ba625b73569e510', 'ind_2ba625b73569e510', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Edward Brigidi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2ba625b73569e510', 'prof_2ba625b73569e510',
  'Member, Bayelsa State House of Assembly (NEMBE II)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2ba625b73569e510', 'ind_2ba625b73569e510', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2ba625b73569e510', 'ind_2ba625b73569e510', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2ba625b73569e510', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|nembe ii|2023',
  'insert', 'ind_2ba625b73569e510',
  'Unique: Bayelsa Nembe II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2ba625b73569e510', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_2ba625b73569e510', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2ba625b73569e510', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_nembe_ii',
  'ind_2ba625b73569e510', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2ba625b73569e510', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Nembe II', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2ba625b73569e510', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_2ba625b73569e510',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2ba625b73569e510', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_2ba625b73569e510',
  'political_assignment', '{"constituency_inec": "NEMBE II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2ba625b73569e510', 'prof_2ba625b73569e510',
  'Edward Brigidi',
  'edward brigidi bayelsa state assembly nembe ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Douglas Samson -- Nembe III (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a58bb61ee8d86a8e', 'Douglas Samson',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a58bb61ee8d86a8e', 'ind_a58bb61ee8d86a8e', 'individual', 'place_state_bayelsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Douglas Samson', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a58bb61ee8d86a8e', 'prof_a58bb61ee8d86a8e',
  'Member, Bayelsa State House of Assembly (NEMBE III)',
  'place_state_bayelsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a58bb61ee8d86a8e', 'ind_a58bb61ee8d86a8e', 'term_ng_bayelsa_state_assembly_10th_2023_2027',
  'place_state_bayelsa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a58bb61ee8d86a8e', 'ind_a58bb61ee8d86a8e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a58bb61ee8d86a8e', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual',
  'ng_state_assembly_member|bayelsa|nembe iii|2023',
  'insert', 'ind_a58bb61ee8d86a8e',
  'Unique: Bayelsa Nembe III seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a58bb61ee8d86a8e', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_a58bb61ee8d86a8e', 'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a58bb61ee8d86a8e', 'seed_run_s05_political_bayelsa_roster_20260502', 'seed_source_nigerianleaders_bayelsa_assembly_20260502',
  'nl_bayelsa_assembly_2023_nembe_iii',
  'ind_a58bb61ee8d86a8e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a58bb61ee8d86a8e', 'seed_run_s05_political_bayelsa_roster_20260502',
  'Bayelsa Nembe III', 'place_state_bayelsa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a58bb61ee8d86a8e', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_a58bb61ee8d86a8e',
  'seed_source_nigerianleaders_bayelsa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a58bb61ee8d86a8e', 'seed_run_s05_political_bayelsa_roster_20260502', 'individual', 'ind_a58bb61ee8d86a8e',
  'political_assignment', '{"constituency_inec": "NEMBE III", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/bayelsa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a58bb61ee8d86a8e', 'prof_a58bb61ee8d86a8e',
  'Douglas Samson',
  'douglas samson bayelsa state assembly nembe iii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_bayelsa',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
