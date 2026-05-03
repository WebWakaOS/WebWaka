-- ============================================================
-- Migration 0516: Imo State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Imo State House of Assembly Members
-- Members seeded: 19/27
-- Party breakdown: APC:19
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_imo_assembly_20260502',
  'NigerianLeaders – Complete List of Imo State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/imo-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_imo_roster_20260502', 'S05 Batch – Imo State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_imo_roster_20260502',
  'seed_run_s05_political_imo_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0516_political_imo_assembly_full_roster_seed.sql',
  NULL, 19,
  '19/27 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_imo_state_assembly_10th_2023_2027',
  'Imo State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_imo',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (19 of 27 seats) ──────────────────────────────────────

-- 01. Obinna Edward Iheukwumere -- Aboh Mbaise (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2a13c1c99f3bd3bb', 'Obinna Edward Iheukwumere',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2a13c1c99f3bd3bb', 'ind_2a13c1c99f3bd3bb', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Obinna Edward Iheukwumere', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2a13c1c99f3bd3bb', 'prof_2a13c1c99f3bd3bb',
  'Member, Imo State House of Assembly (ABOH MBAISE)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2a13c1c99f3bd3bb', 'ind_2a13c1c99f3bd3bb', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2a13c1c99f3bd3bb', 'ind_2a13c1c99f3bd3bb', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2a13c1c99f3bd3bb', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|aboh mbaise|2023',
  'insert', 'ind_2a13c1c99f3bd3bb',
  'Unique: Imo Aboh Mbaise seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2a13c1c99f3bd3bb', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_2a13c1c99f3bd3bb', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2a13c1c99f3bd3bb', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_aboh_mbaise',
  'ind_2a13c1c99f3bd3bb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2a13c1c99f3bd3bb', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Aboh Mbaise', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2a13c1c99f3bd3bb', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_2a13c1c99f3bd3bb',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2a13c1c99f3bd3bb', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_2a13c1c99f3bd3bb',
  'political_assignment', '{"constituency_inec": "ABOH MBAISE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2a13c1c99f3bd3bb', 'prof_2a13c1c99f3bd3bb',
  'Obinna Edward Iheukwumere',
  'obinna edward iheukwumere imo state assembly aboh mbaise apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Otuibe Samuel Nkem -- Ahiazu Mbaise (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_24ca4561acfe45cd', 'Otuibe Samuel Nkem',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_24ca4561acfe45cd', 'ind_24ca4561acfe45cd', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Otuibe Samuel Nkem', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_24ca4561acfe45cd', 'prof_24ca4561acfe45cd',
  'Member, Imo State House of Assembly (AHIAZU MBAISE)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_24ca4561acfe45cd', 'ind_24ca4561acfe45cd', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_24ca4561acfe45cd', 'ind_24ca4561acfe45cd', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_24ca4561acfe45cd', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|ahiazu mbaise|2023',
  'insert', 'ind_24ca4561acfe45cd',
  'Unique: Imo Ahiazu Mbaise seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_24ca4561acfe45cd', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_24ca4561acfe45cd', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_24ca4561acfe45cd', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_ahiazu_mbaise',
  'ind_24ca4561acfe45cd', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_24ca4561acfe45cd', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Ahiazu Mbaise', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_24ca4561acfe45cd', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_24ca4561acfe45cd',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_24ca4561acfe45cd', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_24ca4561acfe45cd',
  'political_assignment', '{"constituency_inec": "AHIAZU MBAISE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_24ca4561acfe45cd', 'prof_24ca4561acfe45cd',
  'Otuibe Samuel Nkem',
  'otuibe samuel nkem imo state assembly ahiazu mbaise apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Ozoemelam Bernard Ndubuisi -- Ehime Mbano (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4051d2c630644553', 'Ozoemelam Bernard Ndubuisi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4051d2c630644553', 'ind_4051d2c630644553', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ozoemelam Bernard Ndubuisi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4051d2c630644553', 'prof_4051d2c630644553',
  'Member, Imo State House of Assembly (EHIME MBANO)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4051d2c630644553', 'ind_4051d2c630644553', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4051d2c630644553', 'ind_4051d2c630644553', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4051d2c630644553', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|ehime mbano|2023',
  'insert', 'ind_4051d2c630644553',
  'Unique: Imo Ehime Mbano seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4051d2c630644553', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_4051d2c630644553', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4051d2c630644553', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_ehime_mbano',
  'ind_4051d2c630644553', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4051d2c630644553', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Ehime Mbano', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4051d2c630644553', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_4051d2c630644553',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4051d2c630644553', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_4051d2c630644553',
  'political_assignment', '{"constituency_inec": "EHIME MBANO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4051d2c630644553', 'prof_4051d2c630644553',
  'Ozoemelam Bernard Ndubuisi',
  'ozoemelam bernard ndubuisi imo state assembly ehime mbano apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Udeze Ernest Okechukwu -- Ideato North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_de164ebeaac4d38c', 'Udeze Ernest Okechukwu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_de164ebeaac4d38c', 'ind_de164ebeaac4d38c', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Udeze Ernest Okechukwu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_de164ebeaac4d38c', 'prof_de164ebeaac4d38c',
  'Member, Imo State House of Assembly (IDEATO NORTH)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_de164ebeaac4d38c', 'ind_de164ebeaac4d38c', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_de164ebeaac4d38c', 'ind_de164ebeaac4d38c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_de164ebeaac4d38c', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|ideato north|2023',
  'insert', 'ind_de164ebeaac4d38c',
  'Unique: Imo Ideato North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_de164ebeaac4d38c', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_de164ebeaac4d38c', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_de164ebeaac4d38c', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_ideato_north',
  'ind_de164ebeaac4d38c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_de164ebeaac4d38c', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Ideato North', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_de164ebeaac4d38c', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_de164ebeaac4d38c',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_de164ebeaac4d38c', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_de164ebeaac4d38c',
  'political_assignment', '{"constituency_inec": "IDEATO NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_de164ebeaac4d38c', 'prof_de164ebeaac4d38c',
  'Udeze Ernest Okechukwu',
  'udeze ernest okechukwu imo state assembly ideato north apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Duru Iheonukara Johnson -- Ideato South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1da49d9ce945e445', 'Duru Iheonukara Johnson',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1da49d9ce945e445', 'ind_1da49d9ce945e445', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Duru Iheonukara Johnson', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1da49d9ce945e445', 'prof_1da49d9ce945e445',
  'Member, Imo State House of Assembly (IDEATO SOUTH)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1da49d9ce945e445', 'ind_1da49d9ce945e445', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1da49d9ce945e445', 'ind_1da49d9ce945e445', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1da49d9ce945e445', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|ideato south|2023',
  'insert', 'ind_1da49d9ce945e445',
  'Unique: Imo Ideato South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1da49d9ce945e445', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_1da49d9ce945e445', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1da49d9ce945e445', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_ideato_south',
  'ind_1da49d9ce945e445', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1da49d9ce945e445', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Ideato South', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1da49d9ce945e445', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_1da49d9ce945e445',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1da49d9ce945e445', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_1da49d9ce945e445',
  'political_assignment', '{"constituency_inec": "IDEATO SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1da49d9ce945e445', 'prof_1da49d9ce945e445',
  'Duru Iheonukara Johnson',
  'duru iheonukara johnson imo state assembly ideato south apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Olemgbe Chike -- Ihitte/Uboma (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_50d61b1af69db581', 'Olemgbe Chike',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_50d61b1af69db581', 'ind_50d61b1af69db581', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Olemgbe Chike', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_50d61b1af69db581', 'prof_50d61b1af69db581',
  'Member, Imo State House of Assembly (IHITTE/UBOMA)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_50d61b1af69db581', 'ind_50d61b1af69db581', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_50d61b1af69db581', 'ind_50d61b1af69db581', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_50d61b1af69db581', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|ihitte/uboma|2023',
  'insert', 'ind_50d61b1af69db581',
  'Unique: Imo Ihitte/Uboma seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_50d61b1af69db581', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_50d61b1af69db581', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_50d61b1af69db581', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_ihitte/uboma',
  'ind_50d61b1af69db581', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_50d61b1af69db581', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Ihitte/Uboma', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_50d61b1af69db581', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_50d61b1af69db581',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_50d61b1af69db581', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_50d61b1af69db581',
  'political_assignment', '{"constituency_inec": "IHITTE/UBOMA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_50d61b1af69db581', 'prof_50d61b1af69db581',
  'Olemgbe Chike',
  'olemgbe chike imo state assembly ihitte/uboma apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Egu Obinna Ambrose -- Ngor Okpala (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_554e6c267518694e', 'Egu Obinna Ambrose',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_554e6c267518694e', 'ind_554e6c267518694e', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Egu Obinna Ambrose', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_554e6c267518694e', 'prof_554e6c267518694e',
  'Member, Imo State House of Assembly (NGOR OKPALA)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_554e6c267518694e', 'ind_554e6c267518694e', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_554e6c267518694e', 'ind_554e6c267518694e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_554e6c267518694e', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|ngor okpala|2023',
  'insert', 'ind_554e6c267518694e',
  'Unique: Imo Ngor Okpala seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_554e6c267518694e', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_554e6c267518694e', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_554e6c267518694e', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_ngor_okpala',
  'ind_554e6c267518694e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_554e6c267518694e', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Ngor Okpala', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_554e6c267518694e', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_554e6c267518694e',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_554e6c267518694e', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_554e6c267518694e',
  'political_assignment', '{"constituency_inec": "NGOR OKPALA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_554e6c267518694e', 'prof_554e6c267518694e',
  'Egu Obinna Ambrose',
  'egu obinna ambrose imo state assembly ngor okpala apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Iwuanyanwu Amarachi Chyna -- Nkwerre (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7a0d3356f7198c16', 'Iwuanyanwu Amarachi Chyna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7a0d3356f7198c16', 'ind_7a0d3356f7198c16', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Iwuanyanwu Amarachi Chyna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7a0d3356f7198c16', 'prof_7a0d3356f7198c16',
  'Member, Imo State House of Assembly (NKWERRE)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7a0d3356f7198c16', 'ind_7a0d3356f7198c16', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7a0d3356f7198c16', 'ind_7a0d3356f7198c16', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7a0d3356f7198c16', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|nkwerre|2023',
  'insert', 'ind_7a0d3356f7198c16',
  'Unique: Imo Nkwerre seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7a0d3356f7198c16', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_7a0d3356f7198c16', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7a0d3356f7198c16', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_nkwerre',
  'ind_7a0d3356f7198c16', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7a0d3356f7198c16', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Nkwerre', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7a0d3356f7198c16', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_7a0d3356f7198c16',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7a0d3356f7198c16', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_7a0d3356f7198c16',
  'political_assignment', '{"constituency_inec": "NKWERRE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7a0d3356f7198c16', 'prof_7a0d3356f7198c16',
  'Iwuanyanwu Amarachi Chyna',
  'iwuanyanwu amarachi chyna imo state assembly nkwerre apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Nwosu Gilbert Chiedozie -- Nwangele (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_62c94cbe5b823fe5', 'Nwosu Gilbert Chiedozie',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_62c94cbe5b823fe5', 'ind_62c94cbe5b823fe5', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwosu Gilbert Chiedozie', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_62c94cbe5b823fe5', 'prof_62c94cbe5b823fe5',
  'Member, Imo State House of Assembly (NWANGELE)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_62c94cbe5b823fe5', 'ind_62c94cbe5b823fe5', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_62c94cbe5b823fe5', 'ind_62c94cbe5b823fe5', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_62c94cbe5b823fe5', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|nwangele|2023',
  'insert', 'ind_62c94cbe5b823fe5',
  'Unique: Imo Nwangele seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_62c94cbe5b823fe5', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_62c94cbe5b823fe5', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_62c94cbe5b823fe5', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_nwangele',
  'ind_62c94cbe5b823fe5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_62c94cbe5b823fe5', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Nwangele', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_62c94cbe5b823fe5', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_62c94cbe5b823fe5',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_62c94cbe5b823fe5', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_62c94cbe5b823fe5',
  'political_assignment', '{"constituency_inec": "NWANGELE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_62c94cbe5b823fe5', 'prof_62c94cbe5b823fe5',
  'Nwosu Gilbert Chiedozie',
  'nwosu gilbert chiedozie imo state assembly nwangele apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Osuoha Uzoma Francis -- Obowo (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ce7a125bc3ac585b', 'Osuoha Uzoma Francis',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ce7a125bc3ac585b', 'ind_ce7a125bc3ac585b', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Osuoha Uzoma Francis', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ce7a125bc3ac585b', 'prof_ce7a125bc3ac585b',
  'Member, Imo State House of Assembly (OBOWO)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ce7a125bc3ac585b', 'ind_ce7a125bc3ac585b', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ce7a125bc3ac585b', 'ind_ce7a125bc3ac585b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ce7a125bc3ac585b', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|obowo|2023',
  'insert', 'ind_ce7a125bc3ac585b',
  'Unique: Imo Obowo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ce7a125bc3ac585b', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_ce7a125bc3ac585b', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ce7a125bc3ac585b', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_obowo',
  'ind_ce7a125bc3ac585b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ce7a125bc3ac585b', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Obowo', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ce7a125bc3ac585b', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_ce7a125bc3ac585b',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ce7a125bc3ac585b', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_ce7a125bc3ac585b',
  'political_assignment', '{"constituency_inec": "OBOWO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ce7a125bc3ac585b', 'prof_ce7a125bc3ac585b',
  'Osuoha Uzoma Francis',
  'osuoha uzoma francis imo state assembly obowo apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Ibeh Kennedy Chidozie -- Oguta (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_853ce83338e7a5d3', 'Ibeh Kennedy Chidozie',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_853ce83338e7a5d3', 'ind_853ce83338e7a5d3', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibeh Kennedy Chidozie', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_853ce83338e7a5d3', 'prof_853ce83338e7a5d3',
  'Member, Imo State House of Assembly (OGUTA)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_853ce83338e7a5d3', 'ind_853ce83338e7a5d3', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_853ce83338e7a5d3', 'ind_853ce83338e7a5d3', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_853ce83338e7a5d3', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|oguta|2023',
  'insert', 'ind_853ce83338e7a5d3',
  'Unique: Imo Oguta seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_853ce83338e7a5d3', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_853ce83338e7a5d3', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_853ce83338e7a5d3', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_oguta',
  'ind_853ce83338e7a5d3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_853ce83338e7a5d3', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Oguta', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_853ce83338e7a5d3', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_853ce83338e7a5d3',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_853ce83338e7a5d3', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_853ce83338e7a5d3',
  'political_assignment', '{"constituency_inec": "OGUTA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_853ce83338e7a5d3', 'prof_853ce83338e7a5d3',
  'Ibeh Kennedy Chidozie',
  'ibeh kennedy chidozie imo state assembly oguta apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Okorie Ozioma Worship -- Ohaji/Egbema (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4287f9163a9238f8', 'Okorie Ozioma Worship',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4287f9163a9238f8', 'ind_4287f9163a9238f8', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okorie Ozioma Worship', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4287f9163a9238f8', 'prof_4287f9163a9238f8',
  'Member, Imo State House of Assembly (OHAJI/EGBEMA)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4287f9163a9238f8', 'ind_4287f9163a9238f8', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4287f9163a9238f8', 'ind_4287f9163a9238f8', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4287f9163a9238f8', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|ohaji/egbema|2023',
  'insert', 'ind_4287f9163a9238f8',
  'Unique: Imo Ohaji/Egbema seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4287f9163a9238f8', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_4287f9163a9238f8', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4287f9163a9238f8', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_ohaji/egbema',
  'ind_4287f9163a9238f8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4287f9163a9238f8', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Ohaji/Egbema', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4287f9163a9238f8', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_4287f9163a9238f8',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4287f9163a9238f8', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_4287f9163a9238f8',
  'political_assignment', '{"constituency_inec": "OHAJI/EGBEMA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4287f9163a9238f8', 'prof_4287f9163a9238f8',
  'Okorie Ozioma Worship',
  'okorie ozioma worship imo state assembly ohaji/egbema apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Ogbunikpa Chidi Samuel -- Orlu (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4c5235626a22bcd4', 'Ogbunikpa Chidi Samuel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4c5235626a22bcd4', 'ind_4c5235626a22bcd4', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogbunikpa Chidi Samuel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4c5235626a22bcd4', 'prof_4c5235626a22bcd4',
  'Member, Imo State House of Assembly (ORLU)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4c5235626a22bcd4', 'ind_4c5235626a22bcd4', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4c5235626a22bcd4', 'ind_4c5235626a22bcd4', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4c5235626a22bcd4', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|orlu|2023',
  'insert', 'ind_4c5235626a22bcd4',
  'Unique: Imo Orlu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4c5235626a22bcd4', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_4c5235626a22bcd4', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4c5235626a22bcd4', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_orlu',
  'ind_4c5235626a22bcd4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4c5235626a22bcd4', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Orlu', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4c5235626a22bcd4', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_4c5235626a22bcd4',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4c5235626a22bcd4', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_4c5235626a22bcd4',
  'political_assignment', '{"constituency_inec": "ORLU", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4c5235626a22bcd4', 'prof_4c5235626a22bcd4',
  'Ogbunikpa Chidi Samuel',
  'ogbunikpa chidi samuel imo state assembly orlu apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Nwosu Gilbert Chiedozie -- Orsu (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_82faf5712713d4d2', 'Nwosu Gilbert Chiedozie',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_82faf5712713d4d2', 'ind_82faf5712713d4d2', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwosu Gilbert Chiedozie', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_82faf5712713d4d2', 'prof_82faf5712713d4d2',
  'Member, Imo State House of Assembly (ORSU)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_82faf5712713d4d2', 'ind_82faf5712713d4d2', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_82faf5712713d4d2', 'ind_82faf5712713d4d2', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_82faf5712713d4d2', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|orsu|2023',
  'insert', 'ind_82faf5712713d4d2',
  'Unique: Imo Orsu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_82faf5712713d4d2', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_82faf5712713d4d2', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_82faf5712713d4d2', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_orsu',
  'ind_82faf5712713d4d2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_82faf5712713d4d2', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Orsu', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_82faf5712713d4d2', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_82faf5712713d4d2',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_82faf5712713d4d2', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_82faf5712713d4d2',
  'political_assignment', '{"constituency_inec": "ORSU", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_82faf5712713d4d2', 'prof_82faf5712713d4d2',
  'Nwosu Gilbert Chiedozie',
  'nwosu gilbert chiedozie imo state assembly orsu apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Nwaneri Chigozie Reginald -- Oru East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_37d46eaaa6aad5bd', 'Nwaneri Chigozie Reginald',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_37d46eaaa6aad5bd', 'ind_37d46eaaa6aad5bd', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwaneri Chigozie Reginald', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_37d46eaaa6aad5bd', 'prof_37d46eaaa6aad5bd',
  'Member, Imo State House of Assembly (ORU EAST)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_37d46eaaa6aad5bd', 'ind_37d46eaaa6aad5bd', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_37d46eaaa6aad5bd', 'ind_37d46eaaa6aad5bd', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_37d46eaaa6aad5bd', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|oru east|2023',
  'insert', 'ind_37d46eaaa6aad5bd',
  'Unique: Imo Oru East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_37d46eaaa6aad5bd', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_37d46eaaa6aad5bd', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_37d46eaaa6aad5bd', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_oru_east',
  'ind_37d46eaaa6aad5bd', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_37d46eaaa6aad5bd', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Oru East', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_37d46eaaa6aad5bd', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_37d46eaaa6aad5bd',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_37d46eaaa6aad5bd', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_37d46eaaa6aad5bd',
  'political_assignment', '{"constituency_inec": "ORU EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_37d46eaaa6aad5bd', 'prof_37d46eaaa6aad5bd',
  'Nwaneri Chigozie Reginald',
  'nwaneri chigozie reginald imo state assembly oru east apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Ezerioha Dominic Ugochukwu -- Oru West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_507a4d46882ca1fb', 'Ezerioha Dominic Ugochukwu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_507a4d46882ca1fb', 'ind_507a4d46882ca1fb', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ezerioha Dominic Ugochukwu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_507a4d46882ca1fb', 'prof_507a4d46882ca1fb',
  'Member, Imo State House of Assembly (ORU WEST)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_507a4d46882ca1fb', 'ind_507a4d46882ca1fb', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_507a4d46882ca1fb', 'ind_507a4d46882ca1fb', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_507a4d46882ca1fb', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|oru west|2023',
  'insert', 'ind_507a4d46882ca1fb',
  'Unique: Imo Oru West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_507a4d46882ca1fb', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_507a4d46882ca1fb', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_507a4d46882ca1fb', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_oru_west',
  'ind_507a4d46882ca1fb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_507a4d46882ca1fb', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Oru West', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_507a4d46882ca1fb', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_507a4d46882ca1fb',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_507a4d46882ca1fb', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_507a4d46882ca1fb',
  'political_assignment', '{"constituency_inec": "ORU WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_507a4d46882ca1fb', 'prof_507a4d46882ca1fb',
  'Ezerioha Dominic Ugochukwu',
  'ezerioha dominic ugochukwu imo state assembly oru west apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Obodo Ugochukwu Augustine -- Owerri Municipal (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5b8c6213b8968c6c', 'Obodo Ugochukwu Augustine',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5b8c6213b8968c6c', 'ind_5b8c6213b8968c6c', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Obodo Ugochukwu Augustine', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5b8c6213b8968c6c', 'prof_5b8c6213b8968c6c',
  'Member, Imo State House of Assembly (OWERRI MUNICIPAL)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5b8c6213b8968c6c', 'ind_5b8c6213b8968c6c', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5b8c6213b8968c6c', 'ind_5b8c6213b8968c6c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5b8c6213b8968c6c', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|owerri municipal|2023',
  'insert', 'ind_5b8c6213b8968c6c',
  'Unique: Imo Owerri Municipal seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5b8c6213b8968c6c', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_5b8c6213b8968c6c', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5b8c6213b8968c6c', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_owerri_municipal',
  'ind_5b8c6213b8968c6c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5b8c6213b8968c6c', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Owerri Municipal', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5b8c6213b8968c6c', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_5b8c6213b8968c6c',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5b8c6213b8968c6c', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_5b8c6213b8968c6c',
  'political_assignment', '{"constituency_inec": "OWERRI MUNICIPAL", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5b8c6213b8968c6c', 'prof_5b8c6213b8968c6c',
  'Obodo Ugochukwu Augustine',
  'obodo ugochukwu augustine imo state assembly owerri municipal apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Onyemachi Kanayo -- Owerri North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ea76d301b47240cc', 'Onyemachi Kanayo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ea76d301b47240cc', 'ind_ea76d301b47240cc', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Onyemachi Kanayo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ea76d301b47240cc', 'prof_ea76d301b47240cc',
  'Member, Imo State House of Assembly (OWERRI NORTH)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ea76d301b47240cc', 'ind_ea76d301b47240cc', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ea76d301b47240cc', 'ind_ea76d301b47240cc', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ea76d301b47240cc', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|owerri north|2023',
  'insert', 'ind_ea76d301b47240cc',
  'Unique: Imo Owerri North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ea76d301b47240cc', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_ea76d301b47240cc', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ea76d301b47240cc', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_owerri_north',
  'ind_ea76d301b47240cc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ea76d301b47240cc', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Owerri North', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ea76d301b47240cc', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_ea76d301b47240cc',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ea76d301b47240cc', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_ea76d301b47240cc',
  'political_assignment', '{"constituency_inec": "OWERRI NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ea76d301b47240cc', 'prof_ea76d301b47240cc',
  'Onyemachi Kanayo',
  'onyemachi kanayo imo state assembly owerri north apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Onumajuru Williams Bethel -- Owerri West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1c5ae994bd418e76', 'Onumajuru Williams Bethel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1c5ae994bd418e76', 'ind_1c5ae994bd418e76', 'individual', 'place_state_imo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Onumajuru Williams Bethel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1c5ae994bd418e76', 'prof_1c5ae994bd418e76',
  'Member, Imo State House of Assembly (OWERRI WEST)',
  'place_state_imo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1c5ae994bd418e76', 'ind_1c5ae994bd418e76', 'term_ng_imo_state_assembly_10th_2023_2027',
  'place_state_imo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1c5ae994bd418e76', 'ind_1c5ae994bd418e76', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1c5ae994bd418e76', 'seed_run_s05_political_imo_roster_20260502', 'individual',
  'ng_state_assembly_member|imo|owerri west|2023',
  'insert', 'ind_1c5ae994bd418e76',
  'Unique: Imo Owerri West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1c5ae994bd418e76', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_1c5ae994bd418e76', 'seed_source_nigerianleaders_imo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1c5ae994bd418e76', 'seed_run_s05_political_imo_roster_20260502', 'seed_source_nigerianleaders_imo_assembly_20260502',
  'nl_imo_assembly_2023_owerri_west',
  'ind_1c5ae994bd418e76', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1c5ae994bd418e76', 'seed_run_s05_political_imo_roster_20260502',
  'Imo Owerri West', 'place_state_imo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1c5ae994bd418e76', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_1c5ae994bd418e76',
  'seed_source_nigerianleaders_imo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1c5ae994bd418e76', 'seed_run_s05_political_imo_roster_20260502', 'individual', 'ind_1c5ae994bd418e76',
  'political_assignment', '{"constituency_inec": "OWERRI WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/imo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1c5ae994bd418e76', 'prof_1c5ae994bd418e76',
  'Onumajuru Williams Bethel',
  'onumajuru williams bethel imo state assembly owerri west apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_imo',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
