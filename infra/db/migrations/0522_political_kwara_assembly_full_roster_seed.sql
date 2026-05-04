-- ============================================================
-- Migration 0522: Kwara State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Kwara State House of Assembly Members
-- Members seeded: 23/24
-- Party breakdown: APC:10, AA:8, A:4, ADP:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_kwara_assembly_20260502',
  'NigerianLeaders – Complete List of Kwara State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/kwara-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_kwara_roster_20260502', 'S05 Batch – Kwara State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_kwara_roster_20260502',
  'seed_run_s05_political_kwara_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0522_political_kwara_assembly_full_roster_seed.sql',
  NULL, 23,
  '23/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_kwara_state_assembly_10th_2023_2027',
  'Kwara State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_kwara',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (23 of 24 seats) ──────────────────────────────────────

-- 01. Bello Yinusa, Oniboki -- Afon (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2886458eaed8e994', 'Bello Yinusa, Oniboki',
  'Bello', 'Oniboki', 'Bello Yinusa, Oniboki',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2886458eaed8e994', 'ind_2886458eaed8e994', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bello Yinusa, Oniboki', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2886458eaed8e994', 'prof_2886458eaed8e994',
  'Member, Kwara State House of Assembly (AFON)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2886458eaed8e994', 'ind_2886458eaed8e994', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2886458eaed8e994', 'ind_2886458eaed8e994', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2886458eaed8e994', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|afon|2023',
  'insert', 'ind_2886458eaed8e994',
  'Unique: Kwara Afon seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2886458eaed8e994', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_2886458eaed8e994', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2886458eaed8e994', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_afon',
  'ind_2886458eaed8e994', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2886458eaed8e994', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Afon', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2886458eaed8e994', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_2886458eaed8e994',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2886458eaed8e994', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_2886458eaed8e994',
  'political_assignment', '{"constituency_inec": "AFON", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2886458eaed8e994', 'prof_2886458eaed8e994',
  'Bello Yinusa, Oniboki',
  'bello yinusa, oniboki kwara state assembly afon apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Muritala Sherifatu Titi -- Onire/Owode (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c737965d61844123', 'Muritala Sherifatu Titi',
  'Muritala', 'Titi', 'Muritala Sherifatu Titi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c737965d61844123', 'ind_c737965d61844123', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muritala Sherifatu Titi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c737965d61844123', 'prof_c737965d61844123',
  'Member, Kwara State House of Assembly (ONIRE/OWODE)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c737965d61844123', 'ind_c737965d61844123', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c737965d61844123', 'ind_c737965d61844123', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c737965d61844123', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|onire/owode|2023',
  'insert', 'ind_c737965d61844123',
  'Unique: Kwara Onire/Owode seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c737965d61844123', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_c737965d61844123', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c737965d61844123', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_onire/owode',
  'ind_c737965d61844123', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c737965d61844123', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Onire/Owode', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c737965d61844123', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_c737965d61844123',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c737965d61844123', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_c737965d61844123',
  'political_assignment', '{"constituency_inec": "ONIRE/OWODE", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c737965d61844123', 'prof_c737965d61844123',
  'Muritala Sherifatu Titi',
  'muritala sherifatu titi kwara state assembly onire/owode aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Mohammed Mustapha -- Ilesha/Gwanara (ADP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1f87e6e002c4a90e', 'Mohammed Mustapha',
  'Mohammed', 'Mustapha', 'Mohammed Mustapha',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1f87e6e002c4a90e', 'ind_1f87e6e002c4a90e', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Mustapha', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1f87e6e002c4a90e', 'prof_1f87e6e002c4a90e',
  'Member, Kwara State House of Assembly (ILESHA/GWANARA)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1f87e6e002c4a90e', 'ind_1f87e6e002c4a90e', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1f87e6e002c4a90e', 'ind_1f87e6e002c4a90e', 'org_political_party_adp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1f87e6e002c4a90e', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|ilesha/gwanara|2023',
  'insert', 'ind_1f87e6e002c4a90e',
  'Unique: Kwara Ilesha/Gwanara seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1f87e6e002c4a90e', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_1f87e6e002c4a90e', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1f87e6e002c4a90e', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_ilesha/gwanara',
  'ind_1f87e6e002c4a90e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1f87e6e002c4a90e', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Ilesha/Gwanara', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1f87e6e002c4a90e', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_1f87e6e002c4a90e',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1f87e6e002c4a90e', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_1f87e6e002c4a90e',
  'political_assignment', '{"constituency_inec": "ILESHA/GWANARA", "party_abbrev": "ADP", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1f87e6e002c4a90e', 'prof_1f87e6e002c4a90e',
  'Mohammed Mustapha',
  'mohammed mustapha kwara state assembly ilesha/gwanara adp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Mohammed Idris Nda -- Lafiagi (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7f66544c63d4ec7d', 'Mohammed Idris Nda',
  'Mohammed', 'Nda', 'Mohammed Idris Nda',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7f66544c63d4ec7d', 'ind_7f66544c63d4ec7d', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Idris Nda', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7f66544c63d4ec7d', 'prof_7f66544c63d4ec7d',
  'Member, Kwara State House of Assembly (LAFIAGI)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7f66544c63d4ec7d', 'ind_7f66544c63d4ec7d', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7f66544c63d4ec7d', 'ind_7f66544c63d4ec7d', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7f66544c63d4ec7d', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|lafiagi|2023',
  'insert', 'ind_7f66544c63d4ec7d',
  'Unique: Kwara Lafiagi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7f66544c63d4ec7d', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_7f66544c63d4ec7d', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7f66544c63d4ec7d', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_lafiagi',
  'ind_7f66544c63d4ec7d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7f66544c63d4ec7d', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Lafiagi', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7f66544c63d4ec7d', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_7f66544c63d4ec7d',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7f66544c63d4ec7d', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_7f66544c63d4ec7d',
  'political_assignment', '{"constituency_inec": "LAFIAGI", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7f66544c63d4ec7d', 'prof_7f66544c63d4ec7d',
  'Mohammed Idris Nda',
  'mohammed idris nda kwara state assembly lafiagi aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Abdulrahman Mohammed -- Patigi (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0b56ab306e551ee8', 'Abdulrahman Mohammed',
  'Abdulrahman', 'Mohammed', 'Abdulrahman Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0b56ab306e551ee8', 'ind_0b56ab306e551ee8', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdulrahman Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0b56ab306e551ee8', 'prof_0b56ab306e551ee8',
  'Member, Kwara State House of Assembly (PATIGI)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0b56ab306e551ee8', 'ind_0b56ab306e551ee8', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0b56ab306e551ee8', 'ind_0b56ab306e551ee8', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0b56ab306e551ee8', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|patigi|2023',
  'insert', 'ind_0b56ab306e551ee8',
  'Unique: Kwara Patigi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0b56ab306e551ee8', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_0b56ab306e551ee8', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0b56ab306e551ee8', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_patigi',
  'ind_0b56ab306e551ee8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0b56ab306e551ee8', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Patigi', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0b56ab306e551ee8', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_0b56ab306e551ee8',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0b56ab306e551ee8', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_0b56ab306e551ee8',
  'political_assignment', '{"constituency_inec": "PATIGI", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0b56ab306e551ee8', 'prof_0b56ab306e551ee8',
  'Abdulrahman Mohammed',
  'abdulrahman mohammed kwara state assembly patigi aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Abolarin Ganiyu Gabriel -- Ekiti (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4eefc9088774dbbe', 'Abolarin Ganiyu Gabriel',
  'Abolarin', 'Gabriel', 'Abolarin Ganiyu Gabriel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4eefc9088774dbbe', 'ind_4eefc9088774dbbe', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abolarin Ganiyu Gabriel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4eefc9088774dbbe', 'prof_4eefc9088774dbbe',
  'Member, Kwara State House of Assembly (EKITI)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4eefc9088774dbbe', 'ind_4eefc9088774dbbe', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4eefc9088774dbbe', 'ind_4eefc9088774dbbe', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4eefc9088774dbbe', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|ekiti|2023',
  'insert', 'ind_4eefc9088774dbbe',
  'Unique: Kwara Ekiti seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4eefc9088774dbbe', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_4eefc9088774dbbe', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4eefc9088774dbbe', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_ekiti',
  'ind_4eefc9088774dbbe', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4eefc9088774dbbe', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Ekiti', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4eefc9088774dbbe', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_4eefc9088774dbbe',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4eefc9088774dbbe', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_4eefc9088774dbbe',
  'political_assignment', '{"constituency_inec": "EKITI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4eefc9088774dbbe', 'prof_4eefc9088774dbbe',
  'Abolarin Ganiyu Gabriel',
  'abolarin ganiyu gabriel kwara state assembly ekiti apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Adedeji Michael Ariyo -- Oke-Ero (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a3a7e93bbe3e75b2', 'Adedeji Michael Ariyo',
  'Adedeji', 'Ariyo', 'Adedeji Michael Ariyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a3a7e93bbe3e75b2', 'ind_a3a7e93bbe3e75b2', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adedeji Michael Ariyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a3a7e93bbe3e75b2', 'prof_a3a7e93bbe3e75b2',
  'Member, Kwara State House of Assembly (OKE-ERO)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a3a7e93bbe3e75b2', 'ind_a3a7e93bbe3e75b2', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a3a7e93bbe3e75b2', 'ind_a3a7e93bbe3e75b2', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a3a7e93bbe3e75b2', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|oke-ero|2023',
  'insert', 'ind_a3a7e93bbe3e75b2',
  'Unique: Kwara Oke-Ero seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a3a7e93bbe3e75b2', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_a3a7e93bbe3e75b2', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a3a7e93bbe3e75b2', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_oke-ero',
  'ind_a3a7e93bbe3e75b2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a3a7e93bbe3e75b2', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Oke-Ero', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a3a7e93bbe3e75b2', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_a3a7e93bbe3e75b2',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a3a7e93bbe3e75b2', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_a3a7e93bbe3e75b2',
  'political_assignment', '{"constituency_inec": "OKE-ERO", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a3a7e93bbe3e75b2', 'prof_a3a7e93bbe3e75b2',
  'Adedeji Michael Ariyo',
  'adedeji michael ariyo kwara state assembly oke-ero a politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Salahu Folabi Ganiyu -- Omupo (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fb119d18f3d56a4a', 'Salahu Folabi Ganiyu',
  'Salahu', 'Ganiyu', 'Salahu Folabi Ganiyu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fb119d18f3d56a4a', 'ind_fb119d18f3d56a4a', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Salahu Folabi Ganiyu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fb119d18f3d56a4a', 'prof_fb119d18f3d56a4a',
  'Member, Kwara State House of Assembly (OMUPO)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fb119d18f3d56a4a', 'ind_fb119d18f3d56a4a', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fb119d18f3d56a4a', 'ind_fb119d18f3d56a4a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fb119d18f3d56a4a', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|omupo|2023',
  'insert', 'ind_fb119d18f3d56a4a',
  'Unique: Kwara Omupo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fb119d18f3d56a4a', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_fb119d18f3d56a4a', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fb119d18f3d56a4a', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_omupo',
  'ind_fb119d18f3d56a4a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fb119d18f3d56a4a', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Omupo', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fb119d18f3d56a4a', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_fb119d18f3d56a4a',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fb119d18f3d56a4a', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_fb119d18f3d56a4a',
  'political_assignment', '{"constituency_inec": "OMUPO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fb119d18f3d56a4a', 'prof_fb119d18f3d56a4a',
  'Salahu Folabi Ganiyu',
  'salahu folabi ganiyu kwara state assembly omupo apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Owolabi Olatunde Rasaq -- Share/Oke-Ode (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_18fbee4a71a55651', 'Owolabi Olatunde Rasaq',
  'Owolabi', 'Rasaq', 'Owolabi Olatunde Rasaq',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_18fbee4a71a55651', 'ind_18fbee4a71a55651', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Owolabi Olatunde Rasaq', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_18fbee4a71a55651', 'prof_18fbee4a71a55651',
  'Member, Kwara State House of Assembly (SHARE/OKE-ODE)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_18fbee4a71a55651', 'ind_18fbee4a71a55651', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_18fbee4a71a55651', 'ind_18fbee4a71a55651', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_18fbee4a71a55651', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|share/oke-ode|2023',
  'insert', 'ind_18fbee4a71a55651',
  'Unique: Kwara Share/Oke-Ode seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_18fbee4a71a55651', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_18fbee4a71a55651', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_18fbee4a71a55651', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_share/oke-ode',
  'ind_18fbee4a71a55651', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_18fbee4a71a55651', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Share/Oke-Ode', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_18fbee4a71a55651', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_18fbee4a71a55651',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_18fbee4a71a55651', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_18fbee4a71a55651',
  'political_assignment', '{"constituency_inec": "SHARE/OKE-ODE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_18fbee4a71a55651', 'prof_18fbee4a71a55651',
  'Owolabi Olatunde Rasaq',
  'owolabi olatunde rasaq kwara state assembly share/oke-ode apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Jimoh Yusuf Taiye -- Ilorin East (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_48c91320144b112e', 'Jimoh Yusuf Taiye',
  'Jimoh', 'Taiye', 'Jimoh Yusuf Taiye',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_48c91320144b112e', 'ind_48c91320144b112e', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jimoh Yusuf Taiye', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_48c91320144b112e', 'prof_48c91320144b112e',
  'Member, Kwara State House of Assembly (ILORIN EAST)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_48c91320144b112e', 'ind_48c91320144b112e', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_48c91320144b112e', 'ind_48c91320144b112e', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_48c91320144b112e', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|ilorin east|2023',
  'insert', 'ind_48c91320144b112e',
  'Unique: Kwara Ilorin East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_48c91320144b112e', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_48c91320144b112e', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_48c91320144b112e', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_ilorin_east',
  'ind_48c91320144b112e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_48c91320144b112e', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Ilorin East', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_48c91320144b112e', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_48c91320144b112e',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_48c91320144b112e', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_48c91320144b112e',
  'political_assignment', '{"constituency_inec": "ILORIN EAST", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_48c91320144b112e', 'prof_48c91320144b112e',
  'Jimoh Yusuf Taiye',
  'jimoh yusuf taiye kwara state assembly ilorin east aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Ayinde Taiye -- Ilorin South (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_82e5dbeb4be56bec', 'Ayinde Taiye',
  'Ayinde', 'Taiye', 'Ayinde Taiye',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_82e5dbeb4be56bec', 'ind_82e5dbeb4be56bec', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ayinde Taiye', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_82e5dbeb4be56bec', 'prof_82e5dbeb4be56bec',
  'Member, Kwara State House of Assembly (ILORIN SOUTH)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_82e5dbeb4be56bec', 'ind_82e5dbeb4be56bec', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_82e5dbeb4be56bec', 'ind_82e5dbeb4be56bec', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_82e5dbeb4be56bec', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|ilorin south|2023',
  'insert', 'ind_82e5dbeb4be56bec',
  'Unique: Kwara Ilorin South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_82e5dbeb4be56bec', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_82e5dbeb4be56bec', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_82e5dbeb4be56bec', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_ilorin_south',
  'ind_82e5dbeb4be56bec', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_82e5dbeb4be56bec', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Ilorin South', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_82e5dbeb4be56bec', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_82e5dbeb4be56bec',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_82e5dbeb4be56bec', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_82e5dbeb4be56bec',
  'political_assignment', '{"constituency_inec": "ILORIN SOUTH", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_82e5dbeb4be56bec', 'prof_82e5dbeb4be56bec',
  'Ayinde Taiye',
  'ayinde taiye kwara state assembly ilorin south aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Magaji Abubakar, Olawoyin -- Ilorin Central (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_79ea74b915eb921b', 'Magaji Abubakar, Olawoyin',
  'Magaji', 'Olawoyin', 'Magaji Abubakar, Olawoyin',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_79ea74b915eb921b', 'ind_79ea74b915eb921b', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Magaji Abubakar, Olawoyin', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_79ea74b915eb921b', 'prof_79ea74b915eb921b',
  'Member, Kwara State House of Assembly (ILORIN CENTRAL)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_79ea74b915eb921b', 'ind_79ea74b915eb921b', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_79ea74b915eb921b', 'ind_79ea74b915eb921b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_79ea74b915eb921b', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|ilorin central|2023',
  'insert', 'ind_79ea74b915eb921b',
  'Unique: Kwara Ilorin Central seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_79ea74b915eb921b', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_79ea74b915eb921b', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_79ea74b915eb921b', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_ilorin_central',
  'ind_79ea74b915eb921b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_79ea74b915eb921b', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Ilorin Central', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_79ea74b915eb921b', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_79ea74b915eb921b',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_79ea74b915eb921b', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_79ea74b915eb921b',
  'political_assignment', '{"constituency_inec": "ILORIN CENTRAL", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_79ea74b915eb921b', 'prof_79ea74b915eb921b',
  'Magaji Abubakar, Olawoyin',
  'magaji abubakar, olawoyin kwara state assembly ilorin central apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Suleiman Kabir Ajetunmobi -- Ilorin North West (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ea0d55896974b972', 'Suleiman Kabir Ajetunmobi',
  'Suleiman', 'Ajetunmobi', 'Suleiman Kabir Ajetunmobi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ea0d55896974b972', 'ind_ea0d55896974b972', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Suleiman Kabir Ajetunmobi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ea0d55896974b972', 'prof_ea0d55896974b972',
  'Member, Kwara State House of Assembly (ILORIN NORTH WEST)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ea0d55896974b972', 'ind_ea0d55896974b972', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ea0d55896974b972', 'ind_ea0d55896974b972', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ea0d55896974b972', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|ilorin north west|2023',
  'insert', 'ind_ea0d55896974b972',
  'Unique: Kwara Ilorin North West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ea0d55896974b972', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_ea0d55896974b972', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ea0d55896974b972', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_ilorin_north_west',
  'ind_ea0d55896974b972', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ea0d55896974b972', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Ilorin North West', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ea0d55896974b972', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_ea0d55896974b972',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ea0d55896974b972', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_ea0d55896974b972',
  'political_assignment', '{"constituency_inec": "ILORIN NORTH WEST", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ea0d55896974b972', 'prof_ea0d55896974b972',
  'Suleiman Kabir Ajetunmobi',
  'suleiman kabir ajetunmobi kwara state assembly ilorin north west aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Oyinloye Risikat -- Irepodun (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9889af0aa945ea61', 'Oyinloye Risikat',
  'Oyinloye', 'Risikat', 'Oyinloye Risikat',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9889af0aa945ea61', 'ind_9889af0aa945ea61', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oyinloye Risikat', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9889af0aa945ea61', 'prof_9889af0aa945ea61',
  'Member, Kwara State House of Assembly (IREPODUN)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9889af0aa945ea61', 'ind_9889af0aa945ea61', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9889af0aa945ea61', 'ind_9889af0aa945ea61', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9889af0aa945ea61', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|irepodun|2023',
  'insert', 'ind_9889af0aa945ea61',
  'Unique: Kwara Irepodun seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9889af0aa945ea61', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_9889af0aa945ea61', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9889af0aa945ea61', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_irepodun',
  'ind_9889af0aa945ea61', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9889af0aa945ea61', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Irepodun', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9889af0aa945ea61', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_9889af0aa945ea61',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9889af0aa945ea61', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_9889af0aa945ea61',
  'political_assignment', '{"constituency_inec": "IREPODUN", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9889af0aa945ea61', 'prof_9889af0aa945ea61',
  'Oyinloye Risikat',
  'oyinloye risikat kwara state assembly irepodun a politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Atoyebi Kunle Raphael -- Isin (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7f6738914e93ced2', 'Atoyebi Kunle Raphael',
  'Atoyebi', 'Raphael', 'Atoyebi Kunle Raphael',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7f6738914e93ced2', 'ind_7f6738914e93ced2', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Atoyebi Kunle Raphael', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7f6738914e93ced2', 'prof_7f6738914e93ced2',
  'Member, Kwara State House of Assembly (ISIN)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7f6738914e93ced2', 'ind_7f6738914e93ced2', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7f6738914e93ced2', 'ind_7f6738914e93ced2', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7f6738914e93ced2', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|isin|2023',
  'insert', 'ind_7f6738914e93ced2',
  'Unique: Kwara Isin seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7f6738914e93ced2', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_7f6738914e93ced2', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7f6738914e93ced2', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_isin',
  'ind_7f6738914e93ced2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7f6738914e93ced2', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Isin', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7f6738914e93ced2', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_7f6738914e93ced2',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7f6738914e93ced2', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_7f6738914e93ced2',
  'political_assignment', '{"constituency_inec": "ISIN", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7f6738914e93ced2', 'prof_7f6738914e93ced2',
  'Atoyebi Kunle Raphael',
  'atoyebi kunle raphael kwara state assembly isin a politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Ahmed Saidu Baba -- Gwanabe/Adena/Banni (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_43910b3c76b22cfc', 'Ahmed Saidu Baba',
  'Ahmed', 'Baba', 'Ahmed Saidu Baba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_43910b3c76b22cfc', 'ind_43910b3c76b22cfc', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ahmed Saidu Baba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_43910b3c76b22cfc', 'prof_43910b3c76b22cfc',
  'Member, Kwara State House of Assembly (GWANABE/ADENA/BANNI)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_43910b3c76b22cfc', 'ind_43910b3c76b22cfc', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_43910b3c76b22cfc', 'ind_43910b3c76b22cfc', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_43910b3c76b22cfc', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|gwanabe/adena/banni|2023',
  'insert', 'ind_43910b3c76b22cfc',
  'Unique: Kwara Gwanabe/Adena/Banni seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_43910b3c76b22cfc', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_43910b3c76b22cfc', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_43910b3c76b22cfc', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_gwanabe/adena/banni',
  'ind_43910b3c76b22cfc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_43910b3c76b22cfc', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Gwanabe/Adena/Banni', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_43910b3c76b22cfc', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_43910b3c76b22cfc',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_43910b3c76b22cfc', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_43910b3c76b22cfc',
  'political_assignment', '{"constituency_inec": "GWANABE/ADENA/BANNI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_43910b3c76b22cfc', 'prof_43910b3c76b22cfc',
  'Ahmed Saidu Baba',
  'ahmed saidu baba kwara state assembly gwanabe/adena/banni apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Abdullahi Halidu Danbaba -- Kaiama/Wajibe/Kemanji (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8919f00e58d68744', 'Abdullahi Halidu Danbaba',
  'Abdullahi', 'Danbaba', 'Abdullahi Halidu Danbaba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8919f00e58d68744', 'ind_8919f00e58d68744', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Halidu Danbaba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8919f00e58d68744', 'prof_8919f00e58d68744',
  'Member, Kwara State House of Assembly (KAIAMA/WAJIBE/KEMANJI)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8919f00e58d68744', 'ind_8919f00e58d68744', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8919f00e58d68744', 'ind_8919f00e58d68744', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8919f00e58d68744', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|kaiama/wajibe/kemanji|2023',
  'insert', 'ind_8919f00e58d68744',
  'Unique: Kwara Kaiama/Wajibe/Kemanji seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8919f00e58d68744', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_8919f00e58d68744', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8919f00e58d68744', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_kaiama/wajibe/kemanji',
  'ind_8919f00e58d68744', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8919f00e58d68744', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Kaiama/Wajibe/Kemanji', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8919f00e58d68744', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_8919f00e58d68744',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8919f00e58d68744', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_8919f00e58d68744',
  'political_assignment', '{"constituency_inec": "KAIAMA/WAJIBE/KEMANJI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8919f00e58d68744', 'prof_8919f00e58d68744',
  'Abdullahi Halidu Danbaba',
  'abdullahi halidu danbaba kwara state assembly kaiama/wajibe/kemanji apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Oni Toyin Oluwafunmike -- Lanwa/Ejidongari (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e75e877091adae4c', 'Oni Toyin Oluwafunmike',
  'Oni', 'Oluwafunmike', 'Oni Toyin Oluwafunmike',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e75e877091adae4c', 'ind_e75e877091adae4c', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oni Toyin Oluwafunmike', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e75e877091adae4c', 'prof_e75e877091adae4c',
  'Member, Kwara State House of Assembly (LANWA/EJIDONGARI)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e75e877091adae4c', 'ind_e75e877091adae4c', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e75e877091adae4c', 'ind_e75e877091adae4c', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e75e877091adae4c', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|lanwa/ejidongari|2023',
  'insert', 'ind_e75e877091adae4c',
  'Unique: Kwara Lanwa/Ejidongari seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e75e877091adae4c', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_e75e877091adae4c', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e75e877091adae4c', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_lanwa/ejidongari',
  'ind_e75e877091adae4c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e75e877091adae4c', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Lanwa/Ejidongari', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e75e877091adae4c', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_e75e877091adae4c',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e75e877091adae4c', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_e75e877091adae4c',
  'political_assignment', '{"constituency_inec": "LANWA/EJIDONGARI", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e75e877091adae4c', 'prof_e75e877091adae4c',
  'Oni Toyin Oluwafunmike',
  'oni toyin oluwafunmike kwara state assembly lanwa/ejidongari aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Buhari Shakirat -- Oloru/Malete/Ipaiye (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bca9d2a437bd24ff', 'Buhari Shakirat',
  'Buhari', 'Shakirat', 'Buhari Shakirat',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bca9d2a437bd24ff', 'ind_bca9d2a437bd24ff', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Buhari Shakirat', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bca9d2a437bd24ff', 'prof_bca9d2a437bd24ff',
  'Member, Kwara State House of Assembly (OLORU/MALETE/IPAIYE)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bca9d2a437bd24ff', 'ind_bca9d2a437bd24ff', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bca9d2a437bd24ff', 'ind_bca9d2a437bd24ff', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bca9d2a437bd24ff', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|oloru/malete/ipaiye|2023',
  'insert', 'ind_bca9d2a437bd24ff',
  'Unique: Kwara Oloru/Malete/Ipaiye seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bca9d2a437bd24ff', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_bca9d2a437bd24ff', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bca9d2a437bd24ff', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_oloru/malete/ipaiye',
  'ind_bca9d2a437bd24ff', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bca9d2a437bd24ff', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Oloru/Malete/Ipaiye', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bca9d2a437bd24ff', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_bca9d2a437bd24ff',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bca9d2a437bd24ff', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_bca9d2a437bd24ff',
  'political_assignment', '{"constituency_inec": "OLORU/MALETE/IPAIYE", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bca9d2a437bd24ff', 'prof_bca9d2a437bd24ff',
  'Buhari Shakirat',
  'buhari shakirat kwara state assembly oloru/malete/ipaiye aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Hammed Wasiu Ajibola -- Balogun/Ojumu (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_069f701b2fa70632', 'Hammed Wasiu Ajibola',
  'Hammed', 'Ajibola', 'Hammed Wasiu Ajibola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_069f701b2fa70632', 'ind_069f701b2fa70632', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Hammed Wasiu Ajibola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_069f701b2fa70632', 'prof_069f701b2fa70632',
  'Member, Kwara State House of Assembly (BALOGUN/OJUMU)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_069f701b2fa70632', 'ind_069f701b2fa70632', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_069f701b2fa70632', 'ind_069f701b2fa70632', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_069f701b2fa70632', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|balogun/ojumu|2023',
  'insert', 'ind_069f701b2fa70632',
  'Unique: Kwara Balogun/Ojumu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_069f701b2fa70632', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_069f701b2fa70632', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_069f701b2fa70632', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_balogun/ojumu',
  'ind_069f701b2fa70632', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_069f701b2fa70632', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Balogun/Ojumu', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_069f701b2fa70632', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_069f701b2fa70632',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_069f701b2fa70632', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_069f701b2fa70632',
  'political_assignment', '{"constituency_inec": "BALOGUN/OJUMU", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_069f701b2fa70632', 'prof_069f701b2fa70632',
  'Hammed Wasiu Ajibola',
  'hammed wasiu ajibola kwara state assembly balogun/ojumu a politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Yussuf Abdulwaheed Gbenga -- Shawo/Essa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_25566b4f48b49752', 'Yussuf Abdulwaheed Gbenga',
  'Yussuf', 'Gbenga', 'Yussuf Abdulwaheed Gbenga',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_25566b4f48b49752', 'ind_25566b4f48b49752', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yussuf Abdulwaheed Gbenga', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_25566b4f48b49752', 'prof_25566b4f48b49752',
  'Member, Kwara State House of Assembly (SHAWO/ESSA)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_25566b4f48b49752', 'ind_25566b4f48b49752', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_25566b4f48b49752', 'ind_25566b4f48b49752', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_25566b4f48b49752', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|shawo/essa|2023',
  'insert', 'ind_25566b4f48b49752',
  'Unique: Kwara Shawo/Essa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_25566b4f48b49752', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_25566b4f48b49752', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_25566b4f48b49752', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_shawo/essa',
  'ind_25566b4f48b49752', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_25566b4f48b49752', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Shawo/Essa', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_25566b4f48b49752', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_25566b4f48b49752',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_25566b4f48b49752', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_25566b4f48b49752',
  'political_assignment', '{"constituency_inec": "SHAWO/ESSA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_25566b4f48b49752', 'prof_25566b4f48b49752',
  'Yussuf Abdulwaheed Gbenga',
  'yussuf abdulwaheed gbenga kwara state assembly shawo/essa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Yussuf Atoyesi Musa -- Odo-Ogun (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_41bee0989496b47b', 'Yussuf Atoyesi Musa',
  'Yussuf', 'Musa', 'Yussuf Atoyesi Musa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_41bee0989496b47b', 'ind_41bee0989496b47b', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yussuf Atoyesi Musa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_41bee0989496b47b', 'prof_41bee0989496b47b',
  'Member, Kwara State House of Assembly (ODO-OGUN)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_41bee0989496b47b', 'ind_41bee0989496b47b', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_41bee0989496b47b', 'ind_41bee0989496b47b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_41bee0989496b47b', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|odo-ogun|2023',
  'insert', 'ind_41bee0989496b47b',
  'Unique: Kwara Odo-Ogun seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_41bee0989496b47b', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_41bee0989496b47b', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_41bee0989496b47b', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_odo-ogun',
  'ind_41bee0989496b47b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_41bee0989496b47b', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Odo-Ogun', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_41bee0989496b47b', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_41bee0989496b47b',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_41bee0989496b47b', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_41bee0989496b47b',
  'political_assignment', '{"constituency_inec": "ODO-OGUN", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_41bee0989496b47b', 'prof_41bee0989496b47b',
  'Yussuf Atoyesi Musa',
  'yussuf atoyesi musa kwara state assembly odo-ogun apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Ojo Olayinwola Oyebode -- Oke-Ogun (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4cf3dc9aed28be89', 'Ojo Olayinwola Oyebode',
  'Ojo', 'Oyebode', 'Ojo Olayinwola Oyebode',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4cf3dc9aed28be89', 'ind_4cf3dc9aed28be89', 'individual', 'place_state_kwara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ojo Olayinwola Oyebode', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4cf3dc9aed28be89', 'prof_4cf3dc9aed28be89',
  'Member, Kwara State House of Assembly (OKE-OGUN)',
  'place_state_kwara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4cf3dc9aed28be89', 'ind_4cf3dc9aed28be89', 'term_ng_kwara_state_assembly_10th_2023_2027',
  'place_state_kwara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4cf3dc9aed28be89', 'ind_4cf3dc9aed28be89', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4cf3dc9aed28be89', 'seed_run_s05_political_kwara_roster_20260502', 'individual',
  'ng_state_assembly_member|kwara|oke-ogun|2023',
  'insert', 'ind_4cf3dc9aed28be89',
  'Unique: Kwara Oke-Ogun seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4cf3dc9aed28be89', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_4cf3dc9aed28be89', 'seed_source_nigerianleaders_kwara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4cf3dc9aed28be89', 'seed_run_s05_political_kwara_roster_20260502', 'seed_source_nigerianleaders_kwara_assembly_20260502',
  'nl_kwara_assembly_2023_oke-ogun',
  'ind_4cf3dc9aed28be89', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4cf3dc9aed28be89', 'seed_run_s05_political_kwara_roster_20260502',
  'Kwara Oke-Ogun', 'place_state_kwara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4cf3dc9aed28be89', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_4cf3dc9aed28be89',
  'seed_source_nigerianleaders_kwara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4cf3dc9aed28be89', 'seed_run_s05_political_kwara_roster_20260502', 'individual', 'ind_4cf3dc9aed28be89',
  'political_assignment', '{"constituency_inec": "OKE-OGUN", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kwara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4cf3dc9aed28be89', 'prof_4cf3dc9aed28be89',
  'Ojo Olayinwola Oyebode',
  'ojo olayinwola oyebode kwara state assembly oke-ogun apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kwara',
  'political',
  unixepoch(), unixepoch()
);

