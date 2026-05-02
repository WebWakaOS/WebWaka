-- ============================================================
-- Migration 0513: Ekiti State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Ekiti State House of Assembly Members
-- Members seeded: 26/26
-- Party breakdown: APC:24, SDP:2
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;

BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_ekiti_assembly_20260502',
  'NigerianLeaders – Complete List of Ekiti State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/ekiti-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_ekiti_roster_20260502', 'S05 Batch – Ekiti State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_ekiti_roster_20260502',
  'seed_run_s05_political_ekiti_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0513_political_ekiti_assembly_full_roster_seed.sql',
  NULL, 26,
  '26/26 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_ekiti_state_assembly_10th_2023_2027',
  'Ekiti State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_ekiti',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (26 of 26 seats) ──────────────────────────────────────

-- 01. Adegbite Ayodeji Adeyinka -- Ado I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4c81a20ae340688f', 'Adegbite Ayodeji Adeyinka',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4c81a20ae340688f', 'ind_4c81a20ae340688f', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adegbite Ayodeji Adeyinka', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4c81a20ae340688f', 'prof_4c81a20ae340688f',
  'Member, Ekiti State House of Assembly (ADO I)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4c81a20ae340688f', 'ind_4c81a20ae340688f', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4c81a20ae340688f', 'ind_4c81a20ae340688f', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4c81a20ae340688f', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ado i|2023',
  'insert', 'ind_4c81a20ae340688f',
  'Unique: Ekiti Ado I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4c81a20ae340688f', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_4c81a20ae340688f', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4c81a20ae340688f', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ado_i',
  'ind_4c81a20ae340688f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4c81a20ae340688f', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ado I', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4c81a20ae340688f', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_4c81a20ae340688f',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4c81a20ae340688f', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_4c81a20ae340688f',
  'political_assignment', '{"constituency_inec": "ADO I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4c81a20ae340688f', 'prof_4c81a20ae340688f',
  'Adegbite Ayodeji Adeyinka',
  'adegbite ayodeji adeyinka ekiti state assembly ado i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Okuyiga Eyitayo Adeteju -- Gbonyin (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b64eac05b20ffe35', 'Okuyiga Eyitayo Adeteju',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b64eac05b20ffe35', 'ind_b64eac05b20ffe35', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okuyiga Eyitayo Adeteju', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b64eac05b20ffe35', 'prof_b64eac05b20ffe35',
  'Member, Ekiti State House of Assembly (GBONYIN)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b64eac05b20ffe35', 'ind_b64eac05b20ffe35', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b64eac05b20ffe35', 'ind_b64eac05b20ffe35', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b64eac05b20ffe35', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|gbonyin|2023',
  'insert', 'ind_b64eac05b20ffe35',
  'Unique: Ekiti Gbonyin seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b64eac05b20ffe35', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_b64eac05b20ffe35', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b64eac05b20ffe35', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_gbonyin',
  'ind_b64eac05b20ffe35', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b64eac05b20ffe35', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Gbonyin', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b64eac05b20ffe35', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_b64eac05b20ffe35',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b64eac05b20ffe35', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_b64eac05b20ffe35',
  'political_assignment', '{"constituency_inec": "GBONYIN", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b64eac05b20ffe35', 'prof_b64eac05b20ffe35',
  'Okuyiga Eyitayo Adeteju',
  'okuyiga eyitayo adeteju ekiti state assembly gbonyin apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Olowookere Bosede Yinka -- Efon (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5691b89fa60743da', 'Olowookere Bosede Yinka',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5691b89fa60743da', 'ind_5691b89fa60743da', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Olowookere Bosede Yinka', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5691b89fa60743da', 'prof_5691b89fa60743da',
  'Member, Ekiti State House of Assembly (EFON)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5691b89fa60743da', 'ind_5691b89fa60743da', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5691b89fa60743da', 'ind_5691b89fa60743da', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5691b89fa60743da', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|efon|2023',
  'insert', 'ind_5691b89fa60743da',
  'Unique: Ekiti Efon seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5691b89fa60743da', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_5691b89fa60743da', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5691b89fa60743da', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_efon',
  'ind_5691b89fa60743da', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5691b89fa60743da', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Efon', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5691b89fa60743da', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_5691b89fa60743da',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5691b89fa60743da', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_5691b89fa60743da',
  'political_assignment', '{"constituency_inec": "EFON", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5691b89fa60743da', 'prof_5691b89fa60743da',
  'Olowookere Bosede Yinka',
  'olowookere bosede yinka ekiti state assembly efon apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Afolabi Adewale Joshua -- Ekiti East I (SDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6824b54ce6decc9f', 'Afolabi Adewale Joshua',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6824b54ce6decc9f', 'ind_6824b54ce6decc9f', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Afolabi Adewale Joshua', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6824b54ce6decc9f', 'prof_6824b54ce6decc9f',
  'Member, Ekiti State House of Assembly (EKITI EAST I)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6824b54ce6decc9f', 'ind_6824b54ce6decc9f', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6824b54ce6decc9f', 'ind_6824b54ce6decc9f', 'org_political_party_sdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6824b54ce6decc9f', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ekiti east i|2023',
  'insert', 'ind_6824b54ce6decc9f',
  'Unique: Ekiti Ekiti East I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6824b54ce6decc9f', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_6824b54ce6decc9f', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6824b54ce6decc9f', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ekiti_east_i',
  'ind_6824b54ce6decc9f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6824b54ce6decc9f', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ekiti East I', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6824b54ce6decc9f', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_6824b54ce6decc9f',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6824b54ce6decc9f', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_6824b54ce6decc9f',
  'political_assignment', '{"constituency_inec": "EKITI EAST I", "party_abbrev": "SDP", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6824b54ce6decc9f', 'prof_6824b54ce6decc9f',
  'Afolabi Adewale Joshua',
  'afolabi adewale joshua ekiti state assembly ekiti east i sdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Agunbiade Kareem -- Ekiti West I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a4b1adb6d2058d6b', 'Agunbiade Kareem',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a4b1adb6d2058d6b', 'ind_a4b1adb6d2058d6b', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Agunbiade Kareem', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a4b1adb6d2058d6b', 'prof_a4b1adb6d2058d6b',
  'Member, Ekiti State House of Assembly (EKITI WEST I)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a4b1adb6d2058d6b', 'ind_a4b1adb6d2058d6b', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a4b1adb6d2058d6b', 'ind_a4b1adb6d2058d6b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a4b1adb6d2058d6b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ekiti west i|2023',
  'insert', 'ind_a4b1adb6d2058d6b',
  'Unique: Ekiti Ekiti West I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a4b1adb6d2058d6b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_a4b1adb6d2058d6b', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a4b1adb6d2058d6b', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ekiti_west_i',
  'ind_a4b1adb6d2058d6b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a4b1adb6d2058d6b', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ekiti West I', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a4b1adb6d2058d6b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_a4b1adb6d2058d6b',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a4b1adb6d2058d6b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_a4b1adb6d2058d6b',
  'political_assignment', '{"constituency_inec": "EKITI WEST I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a4b1adb6d2058d6b', 'prof_a4b1adb6d2058d6b',
  'Agunbiade Kareem',
  'agunbiade kareem ekiti state assembly ekiti west i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Adaramodu Kehinde Anthony -- Ekiti South West I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_04fc2271c52a86d2', 'Adaramodu Kehinde Anthony',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_04fc2271c52a86d2', 'ind_04fc2271c52a86d2', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adaramodu Kehinde Anthony', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_04fc2271c52a86d2', 'prof_04fc2271c52a86d2',
  'Member, Ekiti State House of Assembly (EKITI SOUTH WEST I)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_04fc2271c52a86d2', 'ind_04fc2271c52a86d2', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_04fc2271c52a86d2', 'ind_04fc2271c52a86d2', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_04fc2271c52a86d2', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ekiti south west i|2023',
  'insert', 'ind_04fc2271c52a86d2',
  'Unique: Ekiti Ekiti South West I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_04fc2271c52a86d2', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_04fc2271c52a86d2', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_04fc2271c52a86d2', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ekiti_south_west_i',
  'ind_04fc2271c52a86d2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_04fc2271c52a86d2', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ekiti South West I', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_04fc2271c52a86d2', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_04fc2271c52a86d2',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_04fc2271c52a86d2', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_04fc2271c52a86d2',
  'political_assignment', '{"constituency_inec": "EKITI SOUTH WEST I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_04fc2271c52a86d2', 'prof_04fc2271c52a86d2',
  'Adaramodu Kehinde Anthony',
  'adaramodu kehinde anthony ekiti state assembly ekiti south west i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Ogunlade Maryam Bimbola Funmilola -- Emure (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_846343e2f2f2b679', 'Ogunlade Maryam Bimbola Funmilola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_846343e2f2f2b679', 'ind_846343e2f2f2b679', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogunlade Maryam Bimbola Funmilola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_846343e2f2f2b679', 'prof_846343e2f2f2b679',
  'Member, Ekiti State House of Assembly (EMURE)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_846343e2f2f2b679', 'ind_846343e2f2f2b679', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_846343e2f2f2b679', 'ind_846343e2f2f2b679', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_846343e2f2f2b679', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|emure|2023',
  'insert', 'ind_846343e2f2f2b679',
  'Unique: Ekiti Emure seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_846343e2f2f2b679', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_846343e2f2f2b679', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_846343e2f2f2b679', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_emure',
  'ind_846343e2f2f2b679', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_846343e2f2f2b679', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Emure', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_846343e2f2f2b679', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_846343e2f2f2b679',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_846343e2f2f2b679', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_846343e2f2f2b679',
  'political_assignment', '{"constituency_inec": "EMURE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_846343e2f2f2b679', 'prof_846343e2f2f2b679',
  'Ogunlade Maryam Bimbola Funmilola',
  'ogunlade maryam bimbola funmilola ekiti state assembly emure apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Fawekun Abiodun Babatunde -- Ido/Osi I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e2bea03047e9bffc', 'Fawekun Abiodun Babatunde',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e2bea03047e9bffc', 'ind_e2bea03047e9bffc', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Fawekun Abiodun Babatunde', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e2bea03047e9bffc', 'prof_e2bea03047e9bffc',
  'Member, Ekiti State House of Assembly (IDO/OSI I)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e2bea03047e9bffc', 'ind_e2bea03047e9bffc', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e2bea03047e9bffc', 'ind_e2bea03047e9bffc', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e2bea03047e9bffc', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ido/osi i|2023',
  'insert', 'ind_e2bea03047e9bffc',
  'Unique: Ekiti Ido/Osi I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e2bea03047e9bffc', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_e2bea03047e9bffc', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e2bea03047e9bffc', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ido/osi_i',
  'ind_e2bea03047e9bffc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e2bea03047e9bffc', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ido/Osi I', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e2bea03047e9bffc', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_e2bea03047e9bffc',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e2bea03047e9bffc', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_e2bea03047e9bffc',
  'political_assignment', '{"constituency_inec": "IDO/OSI I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e2bea03047e9bffc', 'prof_e2bea03047e9bffc',
  'Fawekun Abiodun Babatunde',
  'fawekun abiodun babatunde ekiti state assembly ido/osi i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Ojo Martins Ademola -- Ijero (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e29938ed88988974', 'Ojo Martins Ademola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e29938ed88988974', 'ind_e29938ed88988974', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ojo Martins Ademola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e29938ed88988974', 'prof_e29938ed88988974',
  'Member, Ekiti State House of Assembly (IJERO)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e29938ed88988974', 'ind_e29938ed88988974', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e29938ed88988974', 'ind_e29938ed88988974', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e29938ed88988974', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ijero|2023',
  'insert', 'ind_e29938ed88988974',
  'Unique: Ekiti Ijero seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e29938ed88988974', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_e29938ed88988974', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e29938ed88988974', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ijero',
  'ind_e29938ed88988974', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e29938ed88988974', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ijero', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e29938ed88988974', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_e29938ed88988974',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e29938ed88988974', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_e29938ed88988974',
  'political_assignment', '{"constituency_inec": "IJERO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e29938ed88988974', 'prof_e29938ed88988974',
  'Ojo Martins Ademola',
  'ojo martins ademola ekiti state assembly ijero apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Oke Babatunde -- Ikere I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7aeb3b662458221b', 'Oke Babatunde',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7aeb3b662458221b', 'ind_7aeb3b662458221b', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oke Babatunde', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7aeb3b662458221b', 'prof_7aeb3b662458221b',
  'Member, Ekiti State House of Assembly (IKERE I)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7aeb3b662458221b', 'ind_7aeb3b662458221b', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7aeb3b662458221b', 'ind_7aeb3b662458221b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7aeb3b662458221b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ikere i|2023',
  'insert', 'ind_7aeb3b662458221b',
  'Unique: Ekiti Ikere I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7aeb3b662458221b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_7aeb3b662458221b', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7aeb3b662458221b', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ikere_i',
  'ind_7aeb3b662458221b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7aeb3b662458221b', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ikere I', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7aeb3b662458221b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_7aeb3b662458221b',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7aeb3b662458221b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_7aeb3b662458221b',
  'political_assignment', '{"constituency_inec": "IKERE I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7aeb3b662458221b', 'prof_7aeb3b662458221b',
  'Oke Babatunde',
  'oke babatunde ekiti state assembly ikere i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Fatunla Babafemi Sunday -- Ikole I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_022786f70806cec3', 'Fatunla Babafemi Sunday',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_022786f70806cec3', 'ind_022786f70806cec3', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Fatunla Babafemi Sunday', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_022786f70806cec3', 'prof_022786f70806cec3',
  'Member, Ekiti State House of Assembly (IKOLE I)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_022786f70806cec3', 'ind_022786f70806cec3', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_022786f70806cec3', 'ind_022786f70806cec3', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_022786f70806cec3', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ikole i|2023',
  'insert', 'ind_022786f70806cec3',
  'Unique: Ekiti Ikole I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_022786f70806cec3', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_022786f70806cec3', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_022786f70806cec3', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ikole_i',
  'ind_022786f70806cec3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_022786f70806cec3', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ikole I', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_022786f70806cec3', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_022786f70806cec3',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_022786f70806cec3', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_022786f70806cec3',
  'political_assignment', '{"constituency_inec": "IKOLE I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_022786f70806cec3', 'prof_022786f70806cec3',
  'Fatunla Babafemi Sunday',
  'fatunla babafemi sunday ekiti state assembly ikole i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Okiemen Fakunle Iyabode Lydia -- Ilejemeje (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2df47416950a958b', 'Okiemen Fakunle Iyabode Lydia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2df47416950a958b', 'ind_2df47416950a958b', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okiemen Fakunle Iyabode Lydia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2df47416950a958b', 'prof_2df47416950a958b',
  'Member, Ekiti State House of Assembly (ILEJEMEJE)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2df47416950a958b', 'ind_2df47416950a958b', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2df47416950a958b', 'ind_2df47416950a958b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2df47416950a958b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ilejemeje|2023',
  'insert', 'ind_2df47416950a958b',
  'Unique: Ekiti Ilejemeje seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2df47416950a958b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_2df47416950a958b', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2df47416950a958b', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ilejemeje',
  'ind_2df47416950a958b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2df47416950a958b', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ilejemeje', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2df47416950a958b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_2df47416950a958b',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2df47416950a958b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_2df47416950a958b',
  'political_assignment', '{"constituency_inec": "ILEJEMEJE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2df47416950a958b', 'prof_2df47416950a958b',
  'Okiemen Fakunle Iyabode Lydia',
  'okiemen fakunle iyabode lydia ekiti state assembly ilejemeje apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Akindele Femi Olanrewaju -- Irepodun/Ifelodun I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3fe513a405fb62ce', 'Akindele Femi Olanrewaju',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3fe513a405fb62ce', 'ind_3fe513a405fb62ce', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akindele Femi Olanrewaju', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3fe513a405fb62ce', 'prof_3fe513a405fb62ce',
  'Member, Ekiti State House of Assembly (IREPODUN/IFELODUN I)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3fe513a405fb62ce', 'ind_3fe513a405fb62ce', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3fe513a405fb62ce', 'ind_3fe513a405fb62ce', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3fe513a405fb62ce', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|irepodun/ifelodun i|2023',
  'insert', 'ind_3fe513a405fb62ce',
  'Unique: Ekiti Irepodun/Ifelodun I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3fe513a405fb62ce', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_3fe513a405fb62ce', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3fe513a405fb62ce', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_irepodun/ifelodun_i',
  'ind_3fe513a405fb62ce', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3fe513a405fb62ce', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Irepodun/Ifelodun I', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3fe513a405fb62ce', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_3fe513a405fb62ce',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3fe513a405fb62ce', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_3fe513a405fb62ce',
  'political_assignment', '{"constituency_inec": "IREPODUN/IFELODUN I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3fe513a405fb62ce', 'prof_3fe513a405fb62ce',
  'Akindele Femi Olanrewaju',
  'akindele femi olanrewaju ekiti state assembly irepodun/ifelodun i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Omotayo Babatunde E. -- Ise/Orun (SDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8db0d08ae50a3291', 'Omotayo Babatunde E.',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8db0d08ae50a3291', 'ind_8db0d08ae50a3291', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Omotayo Babatunde E.', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8db0d08ae50a3291', 'prof_8db0d08ae50a3291',
  'Member, Ekiti State House of Assembly (ISE/ORUN)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8db0d08ae50a3291', 'ind_8db0d08ae50a3291', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8db0d08ae50a3291', 'ind_8db0d08ae50a3291', 'org_political_party_sdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8db0d08ae50a3291', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ise/orun|2023',
  'insert', 'ind_8db0d08ae50a3291',
  'Unique: Ekiti Ise/Orun seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8db0d08ae50a3291', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_8db0d08ae50a3291', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8db0d08ae50a3291', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ise/orun',
  'ind_8db0d08ae50a3291', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8db0d08ae50a3291', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ise/Orun', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8db0d08ae50a3291', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_8db0d08ae50a3291',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8db0d08ae50a3291', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_8db0d08ae50a3291',
  'political_assignment', '{"constituency_inec": "ISE/ORUN", "party_abbrev": "SDP", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8db0d08ae50a3291', 'prof_8db0d08ae50a3291',
  'Omotayo Babatunde E.',
  'omotayo babatunde e. ekiti state assembly ise/orun sdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Solanke Christiana Abinbola -- Moba I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a60c6d00a3446316', 'Solanke Christiana Abinbola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a60c6d00a3446316', 'ind_a60c6d00a3446316', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Solanke Christiana Abinbola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a60c6d00a3446316', 'prof_a60c6d00a3446316',
  'Member, Ekiti State House of Assembly (MOBA I)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a60c6d00a3446316', 'ind_a60c6d00a3446316', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a60c6d00a3446316', 'ind_a60c6d00a3446316', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a60c6d00a3446316', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|moba i|2023',
  'insert', 'ind_a60c6d00a3446316',
  'Unique: Ekiti Moba I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a60c6d00a3446316', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_a60c6d00a3446316', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a60c6d00a3446316', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_moba_i',
  'ind_a60c6d00a3446316', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a60c6d00a3446316', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Moba I', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a60c6d00a3446316', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_a60c6d00a3446316',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a60c6d00a3446316', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_a60c6d00a3446316',
  'political_assignment', '{"constituency_inec": "MOBA I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a60c6d00a3446316', 'prof_a60c6d00a3446316',
  'Solanke Christiana Abinbola',
  'solanke christiana abinbola ekiti state assembly moba i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Longe Temitope Ademola -- Oye I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b1749d6702ffdfb2', 'Longe Temitope Ademola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b1749d6702ffdfb2', 'ind_b1749d6702ffdfb2', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Longe Temitope Ademola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b1749d6702ffdfb2', 'prof_b1749d6702ffdfb2',
  'Member, Ekiti State House of Assembly (OYE I)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b1749d6702ffdfb2', 'ind_b1749d6702ffdfb2', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b1749d6702ffdfb2', 'ind_b1749d6702ffdfb2', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b1749d6702ffdfb2', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|oye i|2023',
  'insert', 'ind_b1749d6702ffdfb2',
  'Unique: Ekiti Oye I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b1749d6702ffdfb2', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_b1749d6702ffdfb2', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b1749d6702ffdfb2', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_oye_i',
  'ind_b1749d6702ffdfb2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b1749d6702ffdfb2', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Oye I', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b1749d6702ffdfb2', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_b1749d6702ffdfb2',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b1749d6702ffdfb2', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_b1749d6702ffdfb2',
  'political_assignment', '{"constituency_inec": "OYE I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b1749d6702ffdfb2', 'prof_b1749d6702ffdfb2',
  'Longe Temitope Ademola',
  'longe temitope ademola ekiti state assembly oye i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Olagbaju Bolaji -- Ado II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f3ea10e27044000a', 'Olagbaju Bolaji',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f3ea10e27044000a', 'ind_f3ea10e27044000a', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Olagbaju Bolaji', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f3ea10e27044000a', 'prof_f3ea10e27044000a',
  'Member, Ekiti State House of Assembly (ADO II)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f3ea10e27044000a', 'ind_f3ea10e27044000a', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f3ea10e27044000a', 'ind_f3ea10e27044000a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f3ea10e27044000a', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ado ii|2023',
  'insert', 'ind_f3ea10e27044000a',
  'Unique: Ekiti Ado II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f3ea10e27044000a', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_f3ea10e27044000a', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f3ea10e27044000a', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ado_ii',
  'ind_f3ea10e27044000a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f3ea10e27044000a', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ado II', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f3ea10e27044000a', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_f3ea10e27044000a',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f3ea10e27044000a', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_f3ea10e27044000a',
  'political_assignment', '{"constituency_inec": "ADO II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f3ea10e27044000a', 'prof_f3ea10e27044000a',
  'Olagbaju Bolaji',
  'olagbaju bolaji ekiti state assembly ado ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Akanle Lateef Oluwole -- Ekiti East II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_58f36f46832bbbca', 'Akanle Lateef Oluwole',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_58f36f46832bbbca', 'ind_58f36f46832bbbca', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akanle Lateef Oluwole', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_58f36f46832bbbca', 'prof_58f36f46832bbbca',
  'Member, Ekiti State House of Assembly (EKITI EAST II)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_58f36f46832bbbca', 'ind_58f36f46832bbbca', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_58f36f46832bbbca', 'ind_58f36f46832bbbca', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_58f36f46832bbbca', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ekiti east ii|2023',
  'insert', 'ind_58f36f46832bbbca',
  'Unique: Ekiti Ekiti East II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_58f36f46832bbbca', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_58f36f46832bbbca', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_58f36f46832bbbca', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ekiti_east_ii',
  'ind_58f36f46832bbbca', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_58f36f46832bbbca', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ekiti East II', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_58f36f46832bbbca', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_58f36f46832bbbca',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_58f36f46832bbbca', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_58f36f46832bbbca',
  'political_assignment', '{"constituency_inec": "EKITI EAST II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_58f36f46832bbbca', 'prof_58f36f46832bbbca',
  'Akanle Lateef Oluwole',
  'akanle lateef oluwole ekiti state assembly ekiti east ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Bode-Adeoye Oyekola Johnson -- Ekiti West II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1b4370ffd74d15ce', 'Bode-Adeoye Oyekola Johnson',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1b4370ffd74d15ce', 'ind_1b4370ffd74d15ce', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bode-Adeoye Oyekola Johnson', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1b4370ffd74d15ce', 'prof_1b4370ffd74d15ce',
  'Member, Ekiti State House of Assembly (EKITI WEST II)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1b4370ffd74d15ce', 'ind_1b4370ffd74d15ce', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1b4370ffd74d15ce', 'ind_1b4370ffd74d15ce', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1b4370ffd74d15ce', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ekiti west ii|2023',
  'insert', 'ind_1b4370ffd74d15ce',
  'Unique: Ekiti Ekiti West II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1b4370ffd74d15ce', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_1b4370ffd74d15ce', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1b4370ffd74d15ce', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ekiti_west_ii',
  'ind_1b4370ffd74d15ce', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1b4370ffd74d15ce', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ekiti West II', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1b4370ffd74d15ce', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_1b4370ffd74d15ce',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1b4370ffd74d15ce', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_1b4370ffd74d15ce',
  'political_assignment', '{"constituency_inec": "EKITI WEST II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1b4370ffd74d15ce', 'prof_1b4370ffd74d15ce',
  'Bode-Adeoye Oyekola Johnson',
  'bode-adeoye oyekola johnson ekiti state assembly ekiti west ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Ige Tolulope Michael -- Ekiti South West II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_58006e2e60cb9191', 'Ige Tolulope Michael',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_58006e2e60cb9191', 'ind_58006e2e60cb9191', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ige Tolulope Michael', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_58006e2e60cb9191', 'prof_58006e2e60cb9191',
  'Member, Ekiti State House of Assembly (EKITI SOUTH WEST II)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_58006e2e60cb9191', 'ind_58006e2e60cb9191', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_58006e2e60cb9191', 'ind_58006e2e60cb9191', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_58006e2e60cb9191', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ekiti south west ii|2023',
  'insert', 'ind_58006e2e60cb9191',
  'Unique: Ekiti Ekiti South West II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_58006e2e60cb9191', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_58006e2e60cb9191', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_58006e2e60cb9191', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ekiti_south_west_ii',
  'ind_58006e2e60cb9191', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_58006e2e60cb9191', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ekiti South West II', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_58006e2e60cb9191', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_58006e2e60cb9191',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_58006e2e60cb9191', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_58006e2e60cb9191',
  'political_assignment', '{"constituency_inec": "EKITI SOUTH WEST II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_58006e2e60cb9191', 'prof_58006e2e60cb9191',
  'Ige Tolulope Michael',
  'ige tolulope michael ekiti state assembly ekiti south west ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Ayorinde Ebenezer Oluwayomi -- Ido/Osi II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1013fd66ed830c9b', 'Ayorinde Ebenezer Oluwayomi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1013fd66ed830c9b', 'ind_1013fd66ed830c9b', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ayorinde Ebenezer Oluwayomi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1013fd66ed830c9b', 'prof_1013fd66ed830c9b',
  'Member, Ekiti State House of Assembly (IDO/OSI II)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1013fd66ed830c9b', 'ind_1013fd66ed830c9b', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1013fd66ed830c9b', 'ind_1013fd66ed830c9b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1013fd66ed830c9b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ido/osi ii|2023',
  'insert', 'ind_1013fd66ed830c9b',
  'Unique: Ekiti Ido/Osi II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1013fd66ed830c9b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_1013fd66ed830c9b', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1013fd66ed830c9b', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ido/osi_ii',
  'ind_1013fd66ed830c9b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1013fd66ed830c9b', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ido/Osi II', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1013fd66ed830c9b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_1013fd66ed830c9b',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1013fd66ed830c9b', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_1013fd66ed830c9b',
  'political_assignment', '{"constituency_inec": "IDO/OSI II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1013fd66ed830c9b', 'prof_1013fd66ed830c9b',
  'Ayorinde Ebenezer Oluwayomi',
  'ayorinde ebenezer oluwayomi ekiti state assembly ido/osi ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Idowu Lawrence Babatunde -- Ikere II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b4fff6626b6303cb', 'Idowu Lawrence Babatunde',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b4fff6626b6303cb', 'ind_b4fff6626b6303cb', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Idowu Lawrence Babatunde', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b4fff6626b6303cb', 'prof_b4fff6626b6303cb',
  'Member, Ekiti State House of Assembly (IKERE II)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b4fff6626b6303cb', 'ind_b4fff6626b6303cb', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b4fff6626b6303cb', 'ind_b4fff6626b6303cb', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b4fff6626b6303cb', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ikere ii|2023',
  'insert', 'ind_b4fff6626b6303cb',
  'Unique: Ekiti Ikere II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b4fff6626b6303cb', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_b4fff6626b6303cb', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b4fff6626b6303cb', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ikere_ii',
  'ind_b4fff6626b6303cb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b4fff6626b6303cb', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ikere II', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b4fff6626b6303cb', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_b4fff6626b6303cb',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b4fff6626b6303cb', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_b4fff6626b6303cb',
  'political_assignment', '{"constituency_inec": "IKERE II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b4fff6626b6303cb', 'prof_b4fff6626b6303cb',
  'Idowu Lawrence Babatunde',
  'idowu lawrence babatunde ekiti state assembly ikere ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Aribasoye Adeoye Stephen -- Ikole II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2b505ee25bd18253', 'Aribasoye Adeoye Stephen',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2b505ee25bd18253', 'ind_2b505ee25bd18253', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aribasoye Adeoye Stephen', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2b505ee25bd18253', 'prof_2b505ee25bd18253',
  'Member, Ekiti State House of Assembly (IKOLE II)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2b505ee25bd18253', 'ind_2b505ee25bd18253', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2b505ee25bd18253', 'ind_2b505ee25bd18253', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2b505ee25bd18253', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|ikole ii|2023',
  'insert', 'ind_2b505ee25bd18253',
  'Unique: Ekiti Ikole II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2b505ee25bd18253', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_2b505ee25bd18253', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2b505ee25bd18253', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_ikole_ii',
  'ind_2b505ee25bd18253', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2b505ee25bd18253', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Ikole II', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2b505ee25bd18253', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_2b505ee25bd18253',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2b505ee25bd18253', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_2b505ee25bd18253',
  'political_assignment', '{"constituency_inec": "IKOLE II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2b505ee25bd18253', 'prof_2b505ee25bd18253',
  'Aribasoye Adeoye Stephen',
  'aribasoye adeoye stephen ekiti state assembly ikole ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Jamiu Hakeem Ayodeji -- Irepodun/Ifelodun II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a99b60b3dc083f4e', 'Jamiu Hakeem Ayodeji',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a99b60b3dc083f4e', 'ind_a99b60b3dc083f4e', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jamiu Hakeem Ayodeji', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a99b60b3dc083f4e', 'prof_a99b60b3dc083f4e',
  'Member, Ekiti State House of Assembly (IREPODUN/IFELODUN II)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a99b60b3dc083f4e', 'ind_a99b60b3dc083f4e', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a99b60b3dc083f4e', 'ind_a99b60b3dc083f4e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a99b60b3dc083f4e', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|irepodun/ifelodun ii|2023',
  'insert', 'ind_a99b60b3dc083f4e',
  'Unique: Ekiti Irepodun/Ifelodun II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a99b60b3dc083f4e', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_a99b60b3dc083f4e', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a99b60b3dc083f4e', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_irepodun/ifelodun_ii',
  'ind_a99b60b3dc083f4e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a99b60b3dc083f4e', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Irepodun/Ifelodun II', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a99b60b3dc083f4e', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_a99b60b3dc083f4e',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a99b60b3dc083f4e', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_a99b60b3dc083f4e',
  'political_assignment', '{"constituency_inec": "IREPODUN/IFELODUN II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a99b60b3dc083f4e', 'prof_a99b60b3dc083f4e',
  'Jamiu Hakeem Ayodeji',
  'jamiu hakeem ayodeji ekiti state assembly irepodun/ifelodun ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Awoniyi Jacob Adeyemi -- Moba II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_47c252314afedb20', 'Awoniyi Jacob Adeyemi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_47c252314afedb20', 'ind_47c252314afedb20', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Awoniyi Jacob Adeyemi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_47c252314afedb20', 'prof_47c252314afedb20',
  'Member, Ekiti State House of Assembly (MOBA II)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_47c252314afedb20', 'ind_47c252314afedb20', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_47c252314afedb20', 'ind_47c252314afedb20', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_47c252314afedb20', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|moba ii|2023',
  'insert', 'ind_47c252314afedb20',
  'Unique: Ekiti Moba II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_47c252314afedb20', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_47c252314afedb20', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_47c252314afedb20', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_moba_ii',
  'ind_47c252314afedb20', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_47c252314afedb20', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Moba II', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_47c252314afedb20', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_47c252314afedb20',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_47c252314afedb20', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_47c252314afedb20',
  'political_assignment', '{"constituency_inec": "MOBA II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_47c252314afedb20', 'prof_47c252314afedb20',
  'Awoniyi Jacob Adeyemi',
  'awoniyi jacob adeyemi ekiti state assembly moba ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

-- 26. Odebunmi Idowu Sunday -- Oye II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_59df8c4210e7e4a7', 'Odebunmi Idowu Sunday',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_59df8c4210e7e4a7', 'ind_59df8c4210e7e4a7', 'individual', 'place_state_ekiti',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Odebunmi Idowu Sunday', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_59df8c4210e7e4a7', 'prof_59df8c4210e7e4a7',
  'Member, Ekiti State House of Assembly (OYE II)',
  'place_state_ekiti', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_59df8c4210e7e4a7', 'ind_59df8c4210e7e4a7', 'term_ng_ekiti_state_assembly_10th_2023_2027',
  'place_state_ekiti', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_59df8c4210e7e4a7', 'ind_59df8c4210e7e4a7', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_59df8c4210e7e4a7', 'seed_run_s05_political_ekiti_roster_20260502', 'individual',
  'ng_state_assembly_member|ekiti|oye ii|2023',
  'insert', 'ind_59df8c4210e7e4a7',
  'Unique: Ekiti Oye II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_59df8c4210e7e4a7', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_59df8c4210e7e4a7', 'seed_source_nigerianleaders_ekiti_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_59df8c4210e7e4a7', 'seed_run_s05_political_ekiti_roster_20260502', 'seed_source_nigerianleaders_ekiti_assembly_20260502',
  'nl_ekiti_assembly_2023_oye_ii',
  'ind_59df8c4210e7e4a7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_59df8c4210e7e4a7', 'seed_run_s05_political_ekiti_roster_20260502',
  'Ekiti Oye II', 'place_state_ekiti', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_59df8c4210e7e4a7', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_59df8c4210e7e4a7',
  'seed_source_nigerianleaders_ekiti_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_59df8c4210e7e4a7', 'seed_run_s05_political_ekiti_roster_20260502', 'individual', 'ind_59df8c4210e7e4a7',
  'political_assignment', '{"constituency_inec": "OYE II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ekiti-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_59df8c4210e7e4a7', 'prof_59df8c4210e7e4a7',
  'Odebunmi Idowu Sunday',
  'odebunmi idowu sunday ekiti state assembly oye ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ekiti',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
