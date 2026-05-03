-- ============================================================
-- Migration 0509: Cross River State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Cross River State House of Assembly Members
-- Members seeded: 24/25
-- Party breakdown: APC:15, PDP:8, NNPP:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_crossriver_assembly_20260502',
  'NigerianLeaders – Complete List of Cross River State House of Assembly Members',
  'editorial_aggregator', 'https://nigerianleaders.com/cross-river-state-house-of-assembly-members/', 'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_crossriver_roster_20260502', 'S05 Batch – Cross River State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_crossriver_roster_20260502', 'seed_run_s05_political_crossriver_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0509_political_crossriver_assembly_full_roster_seed.sql', NULL, 24,
  '24/25 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_crossriver_state_assembly_10th_2023_2027',
  'Cross River State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023', 'state', 'state_assembly_member',
  'place_state_crossriver', '2023-06-13', '2027-06-12', unixepoch(), unixepoch()
);

-- ── Members (24 of 25 seats) ──────────────────────────────────────

-- 01. Enyiofem Davies, Etta -- Abi (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e0dc6593c74076f9', 'Enyiofem Davies, Etta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e0dc6593c74076f9', 'ind_e0dc6593c74076f9', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Enyiofem Davies, Etta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e0dc6593c74076f9', 'prof_e0dc6593c74076f9',
  'Member, Cross River State House of Assembly (ABI)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e0dc6593c74076f9', 'ind_e0dc6593c74076f9', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e0dc6593c74076f9', 'ind_e0dc6593c74076f9', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e0dc6593c74076f9', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|abi|2023',
  'insert', 'ind_e0dc6593c74076f9',
  'Unique: Cross River Abi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e0dc6593c74076f9', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_e0dc6593c74076f9', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e0dc6593c74076f9', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_abi',
  'ind_e0dc6593c74076f9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e0dc6593c74076f9', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Abi', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e0dc6593c74076f9', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_e0dc6593c74076f9',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e0dc6593c74076f9', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_e0dc6593c74076f9',
  'political_assignment', '{"constituency_inec":"ABI","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e0dc6593c74076f9', 'prof_e0dc6593c74076f9',
  'Enyiofem Davies, Etta',
  'enyiofem davies, etta cross river state assembly abi apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Adiegbe Collins Njok -- Akamkpa I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b03481e60b362cc4', 'Adiegbe Collins Njok',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b03481e60b362cc4', 'ind_b03481e60b362cc4', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adiegbe Collins Njok', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b03481e60b362cc4', 'prof_b03481e60b362cc4',
  'Member, Cross River State House of Assembly (AKAMKPA I)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b03481e60b362cc4', 'ind_b03481e60b362cc4', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b03481e60b362cc4', 'ind_b03481e60b362cc4', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b03481e60b362cc4', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|akamkpa i|2023',
  'insert', 'ind_b03481e60b362cc4',
  'Unique: Cross River Akamkpa I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b03481e60b362cc4', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_b03481e60b362cc4', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b03481e60b362cc4', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_akamkpa_i',
  'ind_b03481e60b362cc4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b03481e60b362cc4', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Akamkpa I', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b03481e60b362cc4', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_b03481e60b362cc4',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b03481e60b362cc4', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_b03481e60b362cc4',
  'political_assignment', '{"constituency_inec":"AKAMKPA I","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b03481e60b362cc4', 'prof_b03481e60b362cc4',
  'Adiegbe Collins Njok',
  'adiegbe collins njok cross river state assembly akamkpa i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Bassey Bassey, Effiong -- Akpabuyo (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_73874d902e96055e', 'Bassey Bassey, Effiong',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_73874d902e96055e', 'ind_73874d902e96055e', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bassey Bassey, Effiong', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_73874d902e96055e', 'prof_73874d902e96055e',
  'Member, Cross River State House of Assembly (AKPABUYO)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_73874d902e96055e', 'ind_73874d902e96055e', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_73874d902e96055e', 'ind_73874d902e96055e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_73874d902e96055e', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|akpabuyo|2023',
  'insert', 'ind_73874d902e96055e',
  'Unique: Cross River Akpabuyo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_73874d902e96055e', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_73874d902e96055e', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_73874d902e96055e', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_akpabuyo',
  'ind_73874d902e96055e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_73874d902e96055e', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Akpabuyo', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_73874d902e96055e', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_73874d902e96055e',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_73874d902e96055e', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_73874d902e96055e',
  'political_assignment', '{"constituency_inec":"AKPABUYO","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_73874d902e96055e', 'prof_73874d902e96055e',
  'Bassey Bassey, Effiong',
  'bassey bassey, effiong cross river state assembly akpabuyo apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Ekpenyong Richard Okon -- Bakassi (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3c55b8d7050abe4b', 'Ekpenyong Richard Okon',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3c55b8d7050abe4b', 'ind_3c55b8d7050abe4b', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ekpenyong Richard Okon', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3c55b8d7050abe4b', 'prof_3c55b8d7050abe4b',
  'Member, Cross River State House of Assembly (BAKASSI)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3c55b8d7050abe4b', 'ind_3c55b8d7050abe4b', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3c55b8d7050abe4b', 'ind_3c55b8d7050abe4b', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3c55b8d7050abe4b', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|bakassi|2023',
  'insert', 'ind_3c55b8d7050abe4b',
  'Unique: Cross River Bakassi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3c55b8d7050abe4b', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_3c55b8d7050abe4b', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3c55b8d7050abe4b', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_bakassi',
  'ind_3c55b8d7050abe4b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3c55b8d7050abe4b', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Bakassi', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3c55b8d7050abe4b', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_3c55b8d7050abe4b',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3c55b8d7050abe4b', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_3c55b8d7050abe4b',
  'political_assignment', '{"constituency_inec":"BAKASSI","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3c55b8d7050abe4b', 'prof_3c55b8d7050abe4b',
  'Ekpenyong Richard Okon',
  'ekpenyong richard okon cross river state assembly bakassi pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Omang Charles Omang -- Bekwarra (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_40b9562b5f52ec51', 'Omang Charles Omang',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_40b9562b5f52ec51', 'ind_40b9562b5f52ec51', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Omang Charles Omang', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_40b9562b5f52ec51', 'prof_40b9562b5f52ec51',
  'Member, Cross River State House of Assembly (BEKWARRA)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_40b9562b5f52ec51', 'ind_40b9562b5f52ec51', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_40b9562b5f52ec51', 'ind_40b9562b5f52ec51', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_40b9562b5f52ec51', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|bekwarra|2023',
  'insert', 'ind_40b9562b5f52ec51',
  'Unique: Cross River Bekwarra seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_40b9562b5f52ec51', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_40b9562b5f52ec51', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_40b9562b5f52ec51', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_bekwarra',
  'ind_40b9562b5f52ec51', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_40b9562b5f52ec51', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Bekwarra', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_40b9562b5f52ec51', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_40b9562b5f52ec51',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_40b9562b5f52ec51', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_40b9562b5f52ec51',
  'political_assignment', '{"constituency_inec":"BEKWARRA","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_40b9562b5f52ec51', 'prof_40b9562b5f52ec51',
  'Omang Charles Omang',
  'omang charles omang cross river state assembly bekwarra pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Ogban Francis, Onette -- Biase (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5812a6d4df738605', 'Ogban Francis, Onette',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5812a6d4df738605', 'ind_5812a6d4df738605', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogban Francis, Onette', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5812a6d4df738605', 'prof_5812a6d4df738605',
  'Member, Cross River State House of Assembly (BIASE)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5812a6d4df738605', 'ind_5812a6d4df738605', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5812a6d4df738605', 'ind_5812a6d4df738605', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5812a6d4df738605', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|biase|2023',
  'insert', 'ind_5812a6d4df738605',
  'Unique: Cross River Biase seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5812a6d4df738605', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_5812a6d4df738605', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5812a6d4df738605', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_biase',
  'ind_5812a6d4df738605', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5812a6d4df738605', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Biase', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5812a6d4df738605', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_5812a6d4df738605',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5812a6d4df738605', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_5812a6d4df738605',
  'political_assignment', '{"constituency_inec":"BIASE","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5812a6d4df738605', 'prof_5812a6d4df738605',
  'Ogban Francis, Onette',
  'ogban francis, onette cross river state assembly biase apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Ikobi Abiukwe Ikobi -- Boki I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8f3baaa2abf1d7f5', 'Ikobi Abiukwe Ikobi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8f3baaa2abf1d7f5', 'ind_8f3baaa2abf1d7f5', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ikobi Abiukwe Ikobi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8f3baaa2abf1d7f5', 'prof_8f3baaa2abf1d7f5',
  'Member, Cross River State House of Assembly (BOKI I)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8f3baaa2abf1d7f5', 'ind_8f3baaa2abf1d7f5', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8f3baaa2abf1d7f5', 'ind_8f3baaa2abf1d7f5', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8f3baaa2abf1d7f5', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|boki i|2023',
  'insert', 'ind_8f3baaa2abf1d7f5',
  'Unique: Cross River Boki I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8f3baaa2abf1d7f5', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_8f3baaa2abf1d7f5', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8f3baaa2abf1d7f5', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_boki_i',
  'ind_8f3baaa2abf1d7f5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8f3baaa2abf1d7f5', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Boki I', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8f3baaa2abf1d7f5', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_8f3baaa2abf1d7f5',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8f3baaa2abf1d7f5', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_8f3baaa2abf1d7f5',
  'political_assignment', '{"constituency_inec":"BOKI I","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8f3baaa2abf1d7f5', 'prof_8f3baaa2abf1d7f5',
  'Ikobi Abiukwe Ikobi',
  'ikobi abiukwe ikobi cross river state assembly boki i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Bisong Hilary, Ekpang -- Boki II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d4fb390c0580c3e6', 'Bisong Hilary, Ekpang',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d4fb390c0580c3e6', 'ind_d4fb390c0580c3e6', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bisong Hilary, Ekpang', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d4fb390c0580c3e6', 'prof_d4fb390c0580c3e6',
  'Member, Cross River State House of Assembly (BOKI II)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d4fb390c0580c3e6', 'ind_d4fb390c0580c3e6', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d4fb390c0580c3e6', 'ind_d4fb390c0580c3e6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d4fb390c0580c3e6', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|boki ii|2023',
  'insert', 'ind_d4fb390c0580c3e6',
  'Unique: Cross River Boki II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d4fb390c0580c3e6', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_d4fb390c0580c3e6', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d4fb390c0580c3e6', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_boki_ii',
  'ind_d4fb390c0580c3e6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d4fb390c0580c3e6', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Boki II', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d4fb390c0580c3e6', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_d4fb390c0580c3e6',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d4fb390c0580c3e6', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_d4fb390c0580c3e6',
  'political_assignment', '{"constituency_inec":"BOKI II","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d4fb390c0580c3e6', 'prof_d4fb390c0580c3e6',
  'Bisong Hilary, Ekpang',
  'bisong hilary, ekpang cross river state assembly boki ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Nsemo Okon, Bassey Stanley -- Calabar South I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b20fa3db06fd7c82', 'Nsemo Okon, Bassey Stanley',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b20fa3db06fd7c82', 'ind_b20fa3db06fd7c82', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nsemo Okon, Bassey Stanley', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b20fa3db06fd7c82', 'prof_b20fa3db06fd7c82',
  'Member, Cross River State House of Assembly (CALABAR SOUTH I)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b20fa3db06fd7c82', 'ind_b20fa3db06fd7c82', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b20fa3db06fd7c82', 'ind_b20fa3db06fd7c82', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b20fa3db06fd7c82', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|calabar south i|2023',
  'insert', 'ind_b20fa3db06fd7c82',
  'Unique: Cross River Calabar South I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b20fa3db06fd7c82', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_b20fa3db06fd7c82', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b20fa3db06fd7c82', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_calabar_south_i',
  'ind_b20fa3db06fd7c82', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b20fa3db06fd7c82', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Calabar South I', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b20fa3db06fd7c82', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_b20fa3db06fd7c82',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b20fa3db06fd7c82', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_b20fa3db06fd7c82',
  'political_assignment', '{"constituency_inec":"CALABAR SOUTH I","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b20fa3db06fd7c82', 'prof_b20fa3db06fd7c82',
  'Nsemo Okon, Bassey Stanley',
  'nsemo okon, bassey stanley cross river state assembly calabar south i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Archibong Patrick Etim -- Calabar South II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_52f2ba3f5ba8724e', 'Archibong Patrick Etim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_52f2ba3f5ba8724e', 'ind_52f2ba3f5ba8724e', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Archibong Patrick Etim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_52f2ba3f5ba8724e', 'prof_52f2ba3f5ba8724e',
  'Member, Cross River State House of Assembly (CALABAR SOUTH II)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_52f2ba3f5ba8724e', 'ind_52f2ba3f5ba8724e', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_52f2ba3f5ba8724e', 'ind_52f2ba3f5ba8724e', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_52f2ba3f5ba8724e', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|calabar south ii|2023',
  'insert', 'ind_52f2ba3f5ba8724e',
  'Unique: Cross River Calabar South II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_52f2ba3f5ba8724e', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_52f2ba3f5ba8724e', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_52f2ba3f5ba8724e', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_calabar_south_ii',
  'ind_52f2ba3f5ba8724e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_52f2ba3f5ba8724e', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Calabar South II', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_52f2ba3f5ba8724e', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_52f2ba3f5ba8724e',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_52f2ba3f5ba8724e', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_52f2ba3f5ba8724e',
  'political_assignment', '{"constituency_inec":"CALABAR SOUTH II","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_52f2ba3f5ba8724e', 'prof_52f2ba3f5ba8724e',
  'Archibong Patrick Etim',
  'archibong patrick etim cross river state assembly calabar south ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Isong Kingsley Ntui -- Etung (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_68f68f8999eb0188', 'Isong Kingsley Ntui',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_68f68f8999eb0188', 'ind_68f68f8999eb0188', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Isong Kingsley Ntui', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_68f68f8999eb0188', 'prof_68f68f8999eb0188',
  'Member, Cross River State House of Assembly (ETUNG)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_68f68f8999eb0188', 'ind_68f68f8999eb0188', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_68f68f8999eb0188', 'ind_68f68f8999eb0188', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_68f68f8999eb0188', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|etung|2023',
  'insert', 'ind_68f68f8999eb0188',
  'Unique: Cross River Etung seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_68f68f8999eb0188', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_68f68f8999eb0188', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_68f68f8999eb0188', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_etung',
  'ind_68f68f8999eb0188', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_68f68f8999eb0188', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Etung', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_68f68f8999eb0188', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_68f68f8999eb0188',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_68f68f8999eb0188', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_68f68f8999eb0188',
  'political_assignment', '{"constituency_inec":"ETUNG","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_68f68f8999eb0188', 'prof_68f68f8999eb0188',
  'Isong Kingsley Ntui',
  'isong kingsley ntui cross river state assembly etung apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Abang Samuel Neji -- Ikom I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1b75e64f2ef916ec', 'Abang Samuel Neji',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1b75e64f2ef916ec', 'ind_1b75e64f2ef916ec', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abang Samuel Neji', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1b75e64f2ef916ec', 'prof_1b75e64f2ef916ec',
  'Member, Cross River State House of Assembly (IKOM I)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1b75e64f2ef916ec', 'ind_1b75e64f2ef916ec', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1b75e64f2ef916ec', 'ind_1b75e64f2ef916ec', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1b75e64f2ef916ec', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|ikom i|2023',
  'insert', 'ind_1b75e64f2ef916ec',
  'Unique: Cross River Ikom I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1b75e64f2ef916ec', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_1b75e64f2ef916ec', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1b75e64f2ef916ec', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_ikom_i',
  'ind_1b75e64f2ef916ec', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1b75e64f2ef916ec', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Ikom I', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1b75e64f2ef916ec', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_1b75e64f2ef916ec',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1b75e64f2ef916ec', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_1b75e64f2ef916ec',
  'political_assignment', '{"constituency_inec":"IKOM I","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1b75e64f2ef916ec', 'prof_1b75e64f2ef916ec',
  'Abang Samuel Neji',
  'abang samuel neji cross river state assembly ikom i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Ayambem Elvert Ekom -- Ikom II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a724af875acba2ef', 'Ayambem Elvert Ekom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a724af875acba2ef', 'ind_a724af875acba2ef', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ayambem Elvert Ekom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a724af875acba2ef', 'prof_a724af875acba2ef',
  'Member, Cross River State House of Assembly (IKOM II)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a724af875acba2ef', 'ind_a724af875acba2ef', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a724af875acba2ef', 'ind_a724af875acba2ef', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a724af875acba2ef', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|ikom ii|2023',
  'insert', 'ind_a724af875acba2ef',
  'Unique: Cross River Ikom II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a724af875acba2ef', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_a724af875acba2ef', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a724af875acba2ef', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_ikom_ii',
  'ind_a724af875acba2ef', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a724af875acba2ef', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Ikom II', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a724af875acba2ef', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_a724af875acba2ef',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a724af875acba2ef', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_a724af875acba2ef',
  'political_assignment', '{"constituency_inec":"IKOM II","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a724af875acba2ef', 'prof_a724af875acba2ef',
  'Ayambem Elvert Ekom',
  'ayambem elvert ekom cross river state assembly ikom ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Achunekang Ikwen Sunday -- Obanleku (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5d3df20048b70a12', 'Achunekang Ikwen Sunday',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5d3df20048b70a12', 'ind_5d3df20048b70a12', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Achunekang Ikwen Sunday', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5d3df20048b70a12', 'prof_5d3df20048b70a12',
  'Member, Cross River State House of Assembly (OBANLEKU)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5d3df20048b70a12', 'ind_5d3df20048b70a12', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5d3df20048b70a12', 'ind_5d3df20048b70a12', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5d3df20048b70a12', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|obanleku|2023',
  'insert', 'ind_5d3df20048b70a12',
  'Unique: Cross River Obanleku seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5d3df20048b70a12', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_5d3df20048b70a12', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5d3df20048b70a12', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_obanleku',
  'ind_5d3df20048b70a12', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5d3df20048b70a12', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Obanleku', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5d3df20048b70a12', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_5d3df20048b70a12',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5d3df20048b70a12', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_5d3df20048b70a12',
  'political_assignment', '{"constituency_inec":"OBANLEKU","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5d3df20048b70a12', 'prof_5d3df20048b70a12',
  'Achunekang Ikwen Sunday',
  'achunekang ikwen sunday cross river state assembly obanleku apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Agbor Ovat -- Obubra I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c66b0035dd28ba91', 'Agbor Ovat',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c66b0035dd28ba91', 'ind_c66b0035dd28ba91', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Agbor Ovat', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c66b0035dd28ba91', 'prof_c66b0035dd28ba91',
  'Member, Cross River State House of Assembly (OBUBRA I)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c66b0035dd28ba91', 'ind_c66b0035dd28ba91', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c66b0035dd28ba91', 'ind_c66b0035dd28ba91', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c66b0035dd28ba91', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|obubra i|2023',
  'insert', 'ind_c66b0035dd28ba91',
  'Unique: Cross River Obubra I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c66b0035dd28ba91', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_c66b0035dd28ba91', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c66b0035dd28ba91', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_obubra_i',
  'ind_c66b0035dd28ba91', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c66b0035dd28ba91', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Obubra I', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c66b0035dd28ba91', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_c66b0035dd28ba91',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c66b0035dd28ba91', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_c66b0035dd28ba91',
  'political_assignment', '{"constituency_inec":"OBUBRA I","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c66b0035dd28ba91', 'prof_c66b0035dd28ba91',
  'Agbor Ovat',
  'agbor ovat cross river state assembly obubra i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Ovat Francis Sampson -- Obubra II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_107cdcc28fb0633b', 'Ovat Francis Sampson',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_107cdcc28fb0633b', 'ind_107cdcc28fb0633b', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ovat Francis Sampson', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_107cdcc28fb0633b', 'prof_107cdcc28fb0633b',
  'Member, Cross River State House of Assembly (OBUBRA II)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_107cdcc28fb0633b', 'ind_107cdcc28fb0633b', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_107cdcc28fb0633b', 'ind_107cdcc28fb0633b', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_107cdcc28fb0633b', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|obubra ii|2023',
  'insert', 'ind_107cdcc28fb0633b',
  'Unique: Cross River Obubra II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_107cdcc28fb0633b', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_107cdcc28fb0633b', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_107cdcc28fb0633b', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_obubra_ii',
  'ind_107cdcc28fb0633b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_107cdcc28fb0633b', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Obubra II', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_107cdcc28fb0633b', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_107cdcc28fb0633b',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_107cdcc28fb0633b', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_107cdcc28fb0633b',
  'political_assignment', '{"constituency_inec":"OBUBRA II","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_107cdcc28fb0633b', 'prof_107cdcc28fb0633b',
  'Ovat Francis Sampson',
  'ovat francis sampson cross river state assembly obubra ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Agabi Sylvester, Rihwo -- Obudu (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0646a22ec9198e38', 'Agabi Sylvester, Rihwo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0646a22ec9198e38', 'ind_0646a22ec9198e38', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Agabi Sylvester, Rihwo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0646a22ec9198e38', 'prof_0646a22ec9198e38',
  'Member, Cross River State House of Assembly (OBUDU)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0646a22ec9198e38', 'ind_0646a22ec9198e38', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0646a22ec9198e38', 'ind_0646a22ec9198e38', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0646a22ec9198e38', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|obudu|2023',
  'insert', 'ind_0646a22ec9198e38',
  'Unique: Cross River Obudu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0646a22ec9198e38', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_0646a22ec9198e38', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0646a22ec9198e38', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_obudu',
  'ind_0646a22ec9198e38', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0646a22ec9198e38', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Obudu', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0646a22ec9198e38', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_0646a22ec9198e38',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0646a22ec9198e38', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_0646a22ec9198e38',
  'political_assignment', '{"constituency_inec":"OBUDU","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0646a22ec9198e38', 'prof_0646a22ec9198e38',
  'Agabi Sylvester, Rihwo',
  'agabi sylvester, rihwo cross river state assembly obudu apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Asuquo Francis Ekpenyong Bassey -- Odukpani (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fdb0b998d2c9a90d', 'Asuquo Francis Ekpenyong Bassey',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fdb0b998d2c9a90d', 'ind_fdb0b998d2c9a90d', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Asuquo Francis Ekpenyong Bassey', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fdb0b998d2c9a90d', 'prof_fdb0b998d2c9a90d',
  'Member, Cross River State House of Assembly (ODUKPANI)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fdb0b998d2c9a90d', 'ind_fdb0b998d2c9a90d', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fdb0b998d2c9a90d', 'ind_fdb0b998d2c9a90d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fdb0b998d2c9a90d', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|odukpani|2023',
  'insert', 'ind_fdb0b998d2c9a90d',
  'Unique: Cross River Odukpani seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fdb0b998d2c9a90d', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_fdb0b998d2c9a90d', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fdb0b998d2c9a90d', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_odukpani',
  'ind_fdb0b998d2c9a90d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fdb0b998d2c9a90d', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Odukpani', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fdb0b998d2c9a90d', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_fdb0b998d2c9a90d',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fdb0b998d2c9a90d', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_fdb0b998d2c9a90d',
  'political_assignment', '{"constituency_inec":"ODUKPANI","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fdb0b998d2c9a90d', 'prof_fdb0b998d2c9a90d',
  'Asuquo Francis Ekpenyong Bassey',
  'asuquo francis ekpenyong bassey cross river state assembly odukpani apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Ayim Rita Agbo -- Ogoja (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d25edfefda52139a', 'Ayim Rita Agbo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d25edfefda52139a', 'ind_d25edfefda52139a', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ayim Rita Agbo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d25edfefda52139a', 'prof_d25edfefda52139a',
  'Member, Cross River State House of Assembly (OGOJA)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d25edfefda52139a', 'ind_d25edfefda52139a', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d25edfefda52139a', 'ind_d25edfefda52139a', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d25edfefda52139a', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|ogoja|2023',
  'insert', 'ind_d25edfefda52139a',
  'Unique: Cross River Ogoja seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d25edfefda52139a', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_d25edfefda52139a', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d25edfefda52139a', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_ogoja',
  'ind_d25edfefda52139a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d25edfefda52139a', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Ogoja', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d25edfefda52139a', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_d25edfefda52139a',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d25edfefda52139a', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_d25edfefda52139a',
  'political_assignment', '{"constituency_inec":"OGOJA","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d25edfefda52139a', 'prof_d25edfefda52139a',
  'Ayim Rita Agbo',
  'ayim rita agbo cross river state assembly ogoja pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Oshen Margaret -- Oshen (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_36d254fd8c69d560', 'Oshen Margaret',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_36d254fd8c69d560', 'ind_36d254fd8c69d560', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oshen Margaret', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_36d254fd8c69d560', 'prof_36d254fd8c69d560',
  'Member, Cross River State House of Assembly (OSHEN)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_36d254fd8c69d560', 'ind_36d254fd8c69d560', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_36d254fd8c69d560', 'ind_36d254fd8c69d560', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_36d254fd8c69d560', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|oshen|2023',
  'insert', 'ind_36d254fd8c69d560',
  'Unique: Cross River Oshen seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_36d254fd8c69d560', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_36d254fd8c69d560', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_36d254fd8c69d560', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_oshen',
  'ind_36d254fd8c69d560', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_36d254fd8c69d560', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Oshen', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_36d254fd8c69d560', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_36d254fd8c69d560',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_36d254fd8c69d560', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_36d254fd8c69d560',
  'political_assignment', '{"constituency_inec":"OSHEN","party_abbrev":"NNPP","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_36d254fd8c69d560', 'prof_36d254fd8c69d560',
  'Oshen Margaret',
  'oshen margaret cross river state assembly oshen nnpp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Omini Cyril James -- Yakurr I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bd2ddf7ecbb421ec', 'Omini Cyril James',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bd2ddf7ecbb421ec', 'ind_bd2ddf7ecbb421ec', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Omini Cyril James', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bd2ddf7ecbb421ec', 'prof_bd2ddf7ecbb421ec',
  'Member, Cross River State House of Assembly (YAKURR I)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bd2ddf7ecbb421ec', 'ind_bd2ddf7ecbb421ec', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bd2ddf7ecbb421ec', 'ind_bd2ddf7ecbb421ec', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bd2ddf7ecbb421ec', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|yakurr i|2023',
  'insert', 'ind_bd2ddf7ecbb421ec',
  'Unique: Cross River Yakurr I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bd2ddf7ecbb421ec', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_bd2ddf7ecbb421ec', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bd2ddf7ecbb421ec', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_yakurr_i',
  'ind_bd2ddf7ecbb421ec', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bd2ddf7ecbb421ec', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Yakurr I', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bd2ddf7ecbb421ec', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_bd2ddf7ecbb421ec',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bd2ddf7ecbb421ec', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_bd2ddf7ecbb421ec',
  'political_assignment', '{"constituency_inec":"YAKURR I","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bd2ddf7ecbb421ec', 'prof_bd2ddf7ecbb421ec',
  'Omini Cyril James',
  'omini cyril james cross river state assembly yakurr i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Akpama Mercy Mbang -- Yakurr II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bc4fa432a485e65b', 'Akpama Mercy Mbang',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bc4fa432a485e65b', 'ind_bc4fa432a485e65b', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akpama Mercy Mbang', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bc4fa432a485e65b', 'prof_bc4fa432a485e65b',
  'Member, Cross River State House of Assembly (YAKURR II)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bc4fa432a485e65b', 'ind_bc4fa432a485e65b', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bc4fa432a485e65b', 'ind_bc4fa432a485e65b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bc4fa432a485e65b', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|yakurr ii|2023',
  'insert', 'ind_bc4fa432a485e65b',
  'Unique: Cross River Yakurr II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bc4fa432a485e65b', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_bc4fa432a485e65b', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bc4fa432a485e65b', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_yakurr_ii',
  'ind_bc4fa432a485e65b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bc4fa432a485e65b', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Yakurr II', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bc4fa432a485e65b', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_bc4fa432a485e65b',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bc4fa432a485e65b', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_bc4fa432a485e65b',
  'political_assignment', '{"constituency_inec":"YAKURR II","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bc4fa432a485e65b', 'prof_bc4fa432a485e65b',
  'Akpama Mercy Mbang',
  'akpama mercy mbang cross river state assembly yakurr ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Anyogo Regina Leonard -- Yala I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d3fb5049f1a86c77', 'Anyogo Regina Leonard',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d3fb5049f1a86c77', 'ind_d3fb5049f1a86c77', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Anyogo Regina Leonard', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d3fb5049f1a86c77', 'prof_d3fb5049f1a86c77',
  'Member, Cross River State House of Assembly (YALA I)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d3fb5049f1a86c77', 'ind_d3fb5049f1a86c77', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d3fb5049f1a86c77', 'ind_d3fb5049f1a86c77', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d3fb5049f1a86c77', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|yala i|2023',
  'insert', 'ind_d3fb5049f1a86c77',
  'Unique: Cross River Yala I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d3fb5049f1a86c77', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_d3fb5049f1a86c77', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d3fb5049f1a86c77', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_yala_i',
  'ind_d3fb5049f1a86c77', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d3fb5049f1a86c77', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Yala I', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d3fb5049f1a86c77', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_d3fb5049f1a86c77',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d3fb5049f1a86c77', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_d3fb5049f1a86c77',
  'political_assignment', '{"constituency_inec":"YALA I","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d3fb5049f1a86c77', 'prof_d3fb5049f1a86c77',
  'Anyogo Regina Leonard',
  'anyogo regina leonard cross river state assembly yala i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Nkasi Cynthia Ekwok -- Yala II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cdff16a89a56dcb0', 'Nkasi Cynthia Ekwok',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cdff16a89a56dcb0', 'ind_cdff16a89a56dcb0', 'individual', 'place_state_crossriver',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nkasi Cynthia Ekwok', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cdff16a89a56dcb0', 'prof_cdff16a89a56dcb0',
  'Member, Cross River State House of Assembly (YALA II)',
  'place_state_crossriver', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cdff16a89a56dcb0', 'ind_cdff16a89a56dcb0', 'term_ng_crossriver_state_assembly_10th_2023_2027',
  'place_state_crossriver', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cdff16a89a56dcb0', 'ind_cdff16a89a56dcb0', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cdff16a89a56dcb0', 'seed_run_s05_political_crossriver_roster_20260502', 'individual',
  'ng_state_assembly_member|cross_river|yala ii|2023',
  'insert', 'ind_cdff16a89a56dcb0',
  'Unique: Cross River Yala II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cdff16a89a56dcb0', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_cdff16a89a56dcb0', 'seed_source_nigerianleaders_crossriver_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cdff16a89a56dcb0', 'seed_run_s05_political_crossriver_roster_20260502', 'seed_source_nigerianleaders_crossriver_assembly_20260502',
  'nl_cross_river_assembly_2023_yala_ii',
  'ind_cdff16a89a56dcb0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cdff16a89a56dcb0', 'seed_run_s05_political_crossriver_roster_20260502',
  'Cross River Yala II', 'place_state_crossriver', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cdff16a89a56dcb0', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_cdff16a89a56dcb0',
  'seed_source_nigerianleaders_crossriver_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cdff16a89a56dcb0', 'seed_run_s05_political_crossriver_roster_20260502', 'individual', 'ind_cdff16a89a56dcb0',
  'political_assignment', '{"constituency_inec":"YALA II","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/cross-river-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cdff16a89a56dcb0', 'prof_cdff16a89a56dcb0',
  'Nkasi Cynthia Ekwok',
  'nkasi cynthia ekwok cross river state assembly yala ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_crossriver',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
