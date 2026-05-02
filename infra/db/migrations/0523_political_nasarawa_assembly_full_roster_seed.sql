-- ============================================================
-- Migration 0523: Nasarawa State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Nasarawa State House of Assembly Members
-- Members seeded: 24/24
-- Party breakdown: APC:11, PDP:8, SDP:3, NNPP:2
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;

BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'NigerianLeaders – Complete List of Nasarawa State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_nasarawa_roster_20260502', 'S05 Batch – Nasarawa State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_nasarawa_roster_20260502',
  'seed_run_s05_political_nasarawa_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0523_political_nasarawa_assembly_full_roster_seed.sql',
  NULL, 24,
  '24/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'Nasarawa State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_nasarawa',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (24 of 24 seats) ──────────────────────────────────────

-- 01. Ibrahim Abdullahi -- Umaisha/Ugya (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_513e96bfc251ef31', 'Ibrahim Abdullahi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_513e96bfc251ef31', 'ind_513e96bfc251ef31', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Abdullahi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_513e96bfc251ef31', 'prof_513e96bfc251ef31',
  'Member, Nasarawa State House of Assembly (UMAISHA/UGYA)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_513e96bfc251ef31', 'ind_513e96bfc251ef31', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_513e96bfc251ef31', 'ind_513e96bfc251ef31', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_513e96bfc251ef31', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|umaisha/ugya|2023',
  'insert', 'ind_513e96bfc251ef31',
  'Unique: Nasarawa Umaisha/Ugya seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_513e96bfc251ef31', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_513e96bfc251ef31', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_513e96bfc251ef31', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_umaisha/ugya',
  'ind_513e96bfc251ef31', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_513e96bfc251ef31', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Umaisha/Ugya', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_513e96bfc251ef31', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_513e96bfc251ef31',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_513e96bfc251ef31', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_513e96bfc251ef31',
  'political_assignment', '{"constituency_inec": "UMAISHA/UGYA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_513e96bfc251ef31', 'prof_513e96bfc251ef31',
  'Ibrahim Abdullahi',
  'ibrahim abdullahi nasarawa state assembly umaisha/ugya apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Hajara Danyaro -- Nasarawa Central (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_32de652810a18800', 'Hajara Danyaro',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_32de652810a18800', 'ind_32de652810a18800', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Hajara Danyaro', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_32de652810a18800', 'prof_32de652810a18800',
  'Member, Nasarawa State House of Assembly (NASARAWA CENTRAL)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_32de652810a18800', 'ind_32de652810a18800', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_32de652810a18800', 'ind_32de652810a18800', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_32de652810a18800', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|nasarawa central|2023',
  'insert', 'ind_32de652810a18800',
  'Unique: Nasarawa Nasarawa Central seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_32de652810a18800', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_32de652810a18800', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_32de652810a18800', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_nasarawa_central',
  'ind_32de652810a18800', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_32de652810a18800', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Nasarawa Central', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_32de652810a18800', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_32de652810a18800',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_32de652810a18800', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_32de652810a18800',
  'political_assignment', '{"constituency_inec": "NASARAWA CENTRAL", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_32de652810a18800', 'prof_32de652810a18800',
  'Hajara Danyaro',
  'hajara danyaro nasarawa state assembly nasarawa central apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Hudu A. Hudu -- Awe North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_19cc8095249a8e0d', 'Hudu A. Hudu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_19cc8095249a8e0d', 'ind_19cc8095249a8e0d', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Hudu A. Hudu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_19cc8095249a8e0d', 'prof_19cc8095249a8e0d',
  'Member, Nasarawa State House of Assembly (AWE NORTH)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_19cc8095249a8e0d', 'ind_19cc8095249a8e0d', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_19cc8095249a8e0d', 'ind_19cc8095249a8e0d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_19cc8095249a8e0d', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|awe north|2023',
  'insert', 'ind_19cc8095249a8e0d',
  'Unique: Nasarawa Awe North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_19cc8095249a8e0d', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_19cc8095249a8e0d', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_19cc8095249a8e0d', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_awe_north',
  'ind_19cc8095249a8e0d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_19cc8095249a8e0d', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Awe North', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_19cc8095249a8e0d', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_19cc8095249a8e0d',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_19cc8095249a8e0d', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_19cc8095249a8e0d',
  'political_assignment', '{"constituency_inec": "AWE NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_19cc8095249a8e0d', 'prof_19cc8095249a8e0d',
  'Hudu A. Hudu',
  'hudu a. hudu nasarawa state assembly awe north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Suleiman Yakubu -- Awe South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e397344463a1b456', 'Suleiman Yakubu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e397344463a1b456', 'ind_e397344463a1b456', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Suleiman Yakubu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e397344463a1b456', 'prof_e397344463a1b456',
  'Member, Nasarawa State House of Assembly (AWE SOUTH)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e397344463a1b456', 'ind_e397344463a1b456', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e397344463a1b456', 'ind_e397344463a1b456', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e397344463a1b456', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|awe south|2023',
  'insert', 'ind_e397344463a1b456',
  'Unique: Nasarawa Awe South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e397344463a1b456', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_e397344463a1b456', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e397344463a1b456', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_awe_south',
  'ind_e397344463a1b456', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e397344463a1b456', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Awe South', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e397344463a1b456', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_e397344463a1b456',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e397344463a1b456', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_e397344463a1b456',
  'political_assignment', '{"constituency_inec": "AWE SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e397344463a1b456', 'prof_e397344463a1b456',
  'Suleiman Yakubu',
  'suleiman yakubu nasarawa state assembly awe south apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Muhammed Onyanki -- Doma North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_04bb29ed0ef7ebb4', 'Muhammed Onyanki',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_04bb29ed0ef7ebb4', 'ind_04bb29ed0ef7ebb4', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammed Onyanki', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_04bb29ed0ef7ebb4', 'prof_04bb29ed0ef7ebb4',
  'Member, Nasarawa State House of Assembly (DOMA NORTH)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_04bb29ed0ef7ebb4', 'ind_04bb29ed0ef7ebb4', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_04bb29ed0ef7ebb4', 'ind_04bb29ed0ef7ebb4', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_04bb29ed0ef7ebb4', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|doma north|2023',
  'insert', 'ind_04bb29ed0ef7ebb4',
  'Unique: Nasarawa Doma North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_04bb29ed0ef7ebb4', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_04bb29ed0ef7ebb4', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_04bb29ed0ef7ebb4', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_doma_north',
  'ind_04bb29ed0ef7ebb4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_04bb29ed0ef7ebb4', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Doma North', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_04bb29ed0ef7ebb4', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_04bb29ed0ef7ebb4',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_04bb29ed0ef7ebb4', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_04bb29ed0ef7ebb4',
  'political_assignment', '{"constituency_inec": "DOMA NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_04bb29ed0ef7ebb4', 'prof_04bb29ed0ef7ebb4',
  'Muhammed Onyanki',
  'muhammed onyanki nasarawa state assembly doma north pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Musa Ibrahim -- Akwanga South (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b54325c7f5f9239a', 'Musa Ibrahim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b54325c7f5f9239a', 'ind_b54325c7f5f9239a', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Musa Ibrahim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b54325c7f5f9239a', 'prof_b54325c7f5f9239a',
  'Member, Nasarawa State House of Assembly (AKWANGA SOUTH)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b54325c7f5f9239a', 'ind_b54325c7f5f9239a', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b54325c7f5f9239a', 'ind_b54325c7f5f9239a', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b54325c7f5f9239a', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|akwanga south|2023',
  'insert', 'ind_b54325c7f5f9239a',
  'Unique: Nasarawa Akwanga South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b54325c7f5f9239a', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_b54325c7f5f9239a', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b54325c7f5f9239a', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_akwanga_south',
  'ind_b54325c7f5f9239a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b54325c7f5f9239a', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Akwanga South', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b54325c7f5f9239a', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_b54325c7f5f9239a',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b54325c7f5f9239a', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_b54325c7f5f9239a',
  'political_assignment', '{"constituency_inec": "AKWANGA SOUTH", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b54325c7f5f9239a', 'prof_b54325c7f5f9239a',
  'Musa Ibrahim',
  'musa ibrahim nasarawa state assembly akwanga south nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 07. John Dizaho -- Karu/Gitata (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_20bfe347184223c1', 'John Dizaho',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_20bfe347184223c1', 'ind_20bfe347184223c1', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'John Dizaho', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_20bfe347184223c1', 'prof_20bfe347184223c1',
  'Member, Nasarawa State House of Assembly (KARU/GITATA)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_20bfe347184223c1', 'ind_20bfe347184223c1', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_20bfe347184223c1', 'ind_20bfe347184223c1', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_20bfe347184223c1', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|karu/gitata|2023',
  'insert', 'ind_20bfe347184223c1',
  'Unique: Nasarawa Karu/Gitata seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_20bfe347184223c1', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_20bfe347184223c1', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_20bfe347184223c1', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_karu/gitata',
  'ind_20bfe347184223c1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_20bfe347184223c1', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Karu/Gitata', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_20bfe347184223c1', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_20bfe347184223c1',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_20bfe347184223c1', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_20bfe347184223c1',
  'political_assignment', '{"constituency_inec": "KARU/GITATA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_20bfe347184223c1', 'prof_20bfe347184223c1',
  'John Dizaho',
  'john dizaho nasarawa state assembly karu/gitata pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Musa Saidu Gude -- Uke/Karshi (SDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9bc649ed271f7d37', 'Musa Saidu Gude',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9bc649ed271f7d37', 'ind_9bc649ed271f7d37', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Musa Saidu Gude', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9bc649ed271f7d37', 'prof_9bc649ed271f7d37',
  'Member, Nasarawa State House of Assembly (UKE/KARSHI)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9bc649ed271f7d37', 'ind_9bc649ed271f7d37', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9bc649ed271f7d37', 'ind_9bc649ed271f7d37', 'org_political_party_sdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9bc649ed271f7d37', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|uke/karshi|2023',
  'insert', 'ind_9bc649ed271f7d37',
  'Unique: Nasarawa Uke/Karshi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9bc649ed271f7d37', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_9bc649ed271f7d37', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9bc649ed271f7d37', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_uke/karshi',
  'ind_9bc649ed271f7d37', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9bc649ed271f7d37', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Uke/Karshi', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9bc649ed271f7d37', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_9bc649ed271f7d37',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9bc649ed271f7d37', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_9bc649ed271f7d37',
  'political_assignment', '{"constituency_inec": "UKE/KARSHI", "party_abbrev": "SDP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9bc649ed271f7d37', 'prof_9bc649ed271f7d37',
  'Musa Saidu Gude',
  'musa saidu gude nasarawa state assembly uke/karshi sdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Muhammed Omadefu -- Keana (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ff1637893d66fff6', 'Muhammed Omadefu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ff1637893d66fff6', 'ind_ff1637893d66fff6', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammed Omadefu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ff1637893d66fff6', 'prof_ff1637893d66fff6',
  'Member, Nasarawa State House of Assembly (KEANA)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ff1637893d66fff6', 'ind_ff1637893d66fff6', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ff1637893d66fff6', 'ind_ff1637893d66fff6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ff1637893d66fff6', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|keana|2023',
  'insert', 'ind_ff1637893d66fff6',
  'Unique: Nasarawa Keana seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ff1637893d66fff6', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_ff1637893d66fff6', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ff1637893d66fff6', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_keana',
  'ind_ff1637893d66fff6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ff1637893d66fff6', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Keana', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ff1637893d66fff6', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_ff1637893d66fff6',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ff1637893d66fff6', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_ff1637893d66fff6',
  'political_assignment', '{"constituency_inec": "KEANA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ff1637893d66fff6', 'prof_ff1637893d66fff6',
  'Muhammed Omadefu',
  'muhammed omadefu nasarawa state assembly keana apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 10. John Ovey -- Keffi East (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_053472af3ede7194', 'John Ovey',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_053472af3ede7194', 'ind_053472af3ede7194', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'John Ovey', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_053472af3ede7194', 'prof_053472af3ede7194',
  'Member, Nasarawa State House of Assembly (KEFFI EAST)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_053472af3ede7194', 'ind_053472af3ede7194', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_053472af3ede7194', 'ind_053472af3ede7194', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_053472af3ede7194', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|keffi east|2023',
  'insert', 'ind_053472af3ede7194',
  'Unique: Nasarawa Keffi East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_053472af3ede7194', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_053472af3ede7194', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_053472af3ede7194', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_keffi_east',
  'ind_053472af3ede7194', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_053472af3ede7194', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Keffi East', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_053472af3ede7194', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_053472af3ede7194',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_053472af3ede7194', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_053472af3ede7194',
  'political_assignment', '{"constituency_inec": "KEFFI EAST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_053472af3ede7194', 'prof_053472af3ede7194',
  'John Ovey',
  'john ovey nasarawa state assembly keffi east pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Ibrahim Nana -- Keffi West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a37b31e83a93a282', 'Ibrahim Nana',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a37b31e83a93a282', 'ind_a37b31e83a93a282', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Nana', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a37b31e83a93a282', 'prof_a37b31e83a93a282',
  'Member, Nasarawa State House of Assembly (KEFFI WEST)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a37b31e83a93a282', 'ind_a37b31e83a93a282', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a37b31e83a93a282', 'ind_a37b31e83a93a282', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a37b31e83a93a282', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|keffi west|2023',
  'insert', 'ind_a37b31e83a93a282',
  'Unique: Nasarawa Keffi West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a37b31e83a93a282', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_a37b31e83a93a282', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a37b31e83a93a282', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_keffi_west',
  'ind_a37b31e83a93a282', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a37b31e83a93a282', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Keffi West', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a37b31e83a93a282', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_a37b31e83a93a282',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a37b31e83a93a282', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_a37b31e83a93a282',
  'political_assignment', '{"constituency_inec": "KEFFI WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a37b31e83a93a282', 'prof_a37b31e83a93a282',
  'Ibrahim Nana',
  'ibrahim nana nasarawa state assembly keffi west apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Daniel Ogazi -- Kokona East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8ec28065888ac161', 'Daniel Ogazi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8ec28065888ac161', 'ind_8ec28065888ac161', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Daniel Ogazi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8ec28065888ac161', 'prof_8ec28065888ac161',
  'Member, Nasarawa State House of Assembly (KOKONA EAST)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8ec28065888ac161', 'ind_8ec28065888ac161', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8ec28065888ac161', 'ind_8ec28065888ac161', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8ec28065888ac161', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|kokona east|2023',
  'insert', 'ind_8ec28065888ac161',
  'Unique: Nasarawa Kokona East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8ec28065888ac161', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_8ec28065888ac161', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8ec28065888ac161', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_kokona_east',
  'ind_8ec28065888ac161', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8ec28065888ac161', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Kokona East', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8ec28065888ac161', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_8ec28065888ac161',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8ec28065888ac161', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_8ec28065888ac161',
  'political_assignment', '{"constituency_inec": "KOKONA EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8ec28065888ac161', 'prof_8ec28065888ac161',
  'Daniel Ogazi',
  'daniel ogazi nasarawa state assembly kokona east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Danladi Jatau -- Kokona West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a7030a536b962dd3', 'Danladi Jatau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a7030a536b962dd3', 'ind_a7030a536b962dd3', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Danladi Jatau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a7030a536b962dd3', 'prof_a7030a536b962dd3',
  'Member, Nasarawa State House of Assembly (KOKONA WEST)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a7030a536b962dd3', 'ind_a7030a536b962dd3', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a7030a536b962dd3', 'ind_a7030a536b962dd3', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a7030a536b962dd3', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|kokona west|2023',
  'insert', 'ind_a7030a536b962dd3',
  'Unique: Nasarawa Kokona West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a7030a536b962dd3', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_a7030a536b962dd3', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a7030a536b962dd3', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_kokona_west',
  'ind_a7030a536b962dd3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a7030a536b962dd3', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Kokona West', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a7030a536b962dd3', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_a7030a536b962dd3',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a7030a536b962dd3', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_a7030a536b962dd3',
  'political_assignment', '{"constituency_inec": "KOKONA WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a7030a536b962dd3', 'prof_a7030a536b962dd3',
  'Danladi Jatau',
  'danladi jatau nasarawa state assembly kokona west apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Esson Mairiga -- Lafia North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5031aa8d0b9321f3', 'Esson Mairiga',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5031aa8d0b9321f3', 'ind_5031aa8d0b9321f3', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Esson Mairiga', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5031aa8d0b9321f3', 'prof_5031aa8d0b9321f3',
  'Member, Nasarawa State House of Assembly (LAFIA NORTH)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5031aa8d0b9321f3', 'ind_5031aa8d0b9321f3', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5031aa8d0b9321f3', 'ind_5031aa8d0b9321f3', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5031aa8d0b9321f3', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|lafia north|2023',
  'insert', 'ind_5031aa8d0b9321f3',
  'Unique: Nasarawa Lafia North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5031aa8d0b9321f3', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_5031aa8d0b9321f3', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5031aa8d0b9321f3', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_lafia_north',
  'ind_5031aa8d0b9321f3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5031aa8d0b9321f3', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Lafia North', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5031aa8d0b9321f3', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_5031aa8d0b9321f3',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5031aa8d0b9321f3', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_5031aa8d0b9321f3',
  'political_assignment', '{"constituency_inec": "LAFIA NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5031aa8d0b9321f3', 'prof_5031aa8d0b9321f3',
  'Esson Mairiga',
  'esson mairiga nasarawa state assembly lafia north pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Solomon Akwashiki -- Lafia Central (SDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a1c75a209796ae1f', 'Solomon Akwashiki',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a1c75a209796ae1f', 'ind_a1c75a209796ae1f', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Solomon Akwashiki', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a1c75a209796ae1f', 'prof_a1c75a209796ae1f',
  'Member, Nasarawa State House of Assembly (LAFIA CENTRAL)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a1c75a209796ae1f', 'ind_a1c75a209796ae1f', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a1c75a209796ae1f', 'ind_a1c75a209796ae1f', 'org_political_party_sdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a1c75a209796ae1f', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|lafia central|2023',
  'insert', 'ind_a1c75a209796ae1f',
  'Unique: Nasarawa Lafia Central seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a1c75a209796ae1f', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_a1c75a209796ae1f', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a1c75a209796ae1f', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_lafia_central',
  'ind_a1c75a209796ae1f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a1c75a209796ae1f', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Lafia Central', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a1c75a209796ae1f', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_a1c75a209796ae1f',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a1c75a209796ae1f', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_a1c75a209796ae1f',
  'political_assignment', '{"constituency_inec": "LAFIA CENTRAL", "party_abbrev": "SDP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a1c75a209796ae1f', 'prof_a1c75a209796ae1f',
  'Solomon Akwashiki',
  'solomon akwashiki nasarawa state assembly lafia central sdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Aliyu Y. Chunbaya -- Akwanga South (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8c240260fe77b658', 'Aliyu Y. Chunbaya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8c240260fe77b658', 'ind_8c240260fe77b658', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aliyu Y. Chunbaya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8c240260fe77b658', 'prof_8c240260fe77b658',
  'Member, Nasarawa State House of Assembly (AKWANGA SOUTH)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8c240260fe77b658', 'ind_8c240260fe77b658', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8c240260fe77b658', 'ind_8c240260fe77b658', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8c240260fe77b658', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|akwanga south|2023',
  'insert', 'ind_8c240260fe77b658',
  'Unique: Nasarawa Akwanga South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8c240260fe77b658', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_8c240260fe77b658', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8c240260fe77b658', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_akwanga_south',
  'ind_8c240260fe77b658', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8c240260fe77b658', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Akwanga South', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8c240260fe77b658', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_8c240260fe77b658',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8c240260fe77b658', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_8c240260fe77b658',
  'political_assignment', '{"constituency_inec": "AKWANGA SOUTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8c240260fe77b658', 'prof_8c240260fe77b658',
  'Aliyu Y. Chunbaya',
  'aliyu y. chunbaya nasarawa state assembly akwanga south pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Adamu Kaika -- Udege/Loko (SDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c7d474590748939b', 'Adamu Kaika',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c7d474590748939b', 'ind_c7d474590748939b', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adamu Kaika', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c7d474590748939b', 'prof_c7d474590748939b',
  'Member, Nasarawa State House of Assembly (UDEGE/LOKO)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c7d474590748939b', 'ind_c7d474590748939b', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c7d474590748939b', 'ind_c7d474590748939b', 'org_political_party_sdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c7d474590748939b', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|udege/loko|2023',
  'insert', 'ind_c7d474590748939b',
  'Unique: Nasarawa Udege/Loko seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c7d474590748939b', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_c7d474590748939b', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c7d474590748939b', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_udege/loko',
  'ind_c7d474590748939b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c7d474590748939b', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Udege/Loko', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c7d474590748939b', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_c7d474590748939b',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c7d474590748939b', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_c7d474590748939b',
  'political_assignment', '{"constituency_inec": "UDEGE/LOKO", "party_abbrev": "SDP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c7d474590748939b', 'prof_c7d474590748939b',
  'Adamu Kaika',
  'adamu kaika nasarawa state assembly udege/loko sdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Abel Bala -- Nasarawa Eggon West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cbb9d3e90e51f162', 'Abel Bala',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cbb9d3e90e51f162', 'ind_cbb9d3e90e51f162', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abel Bala', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cbb9d3e90e51f162', 'prof_cbb9d3e90e51f162',
  'Member, Nasarawa State House of Assembly (NASARAWA EGGON WEST)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cbb9d3e90e51f162', 'ind_cbb9d3e90e51f162', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cbb9d3e90e51f162', 'ind_cbb9d3e90e51f162', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cbb9d3e90e51f162', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|nasarawa eggon west|2023',
  'insert', 'ind_cbb9d3e90e51f162',
  'Unique: Nasarawa Nasarawa Eggon West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cbb9d3e90e51f162', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_cbb9d3e90e51f162', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cbb9d3e90e51f162', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_nasarawa_eggon_west',
  'ind_cbb9d3e90e51f162', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cbb9d3e90e51f162', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Nasarawa Eggon West', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cbb9d3e90e51f162', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_cbb9d3e90e51f162',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cbb9d3e90e51f162', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_cbb9d3e90e51f162',
  'political_assignment', '{"constituency_inec": "NASARAWA EGGON WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cbb9d3e90e51f162', 'prof_cbb9d3e90e51f162',
  'Abel Bala',
  'abel bala nasarawa state assembly nasarawa eggon west pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Jacob Ajegena Kudu -- Nasarawa Eggon East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e58df0a7235f17c2', 'Jacob Ajegena Kudu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e58df0a7235f17c2', 'ind_e58df0a7235f17c2', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jacob Ajegena Kudu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e58df0a7235f17c2', 'prof_e58df0a7235f17c2',
  'Member, Nasarawa State House of Assembly (NASARAWA EGGON EAST)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e58df0a7235f17c2', 'ind_e58df0a7235f17c2', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e58df0a7235f17c2', 'ind_e58df0a7235f17c2', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e58df0a7235f17c2', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|nasarawa eggon east|2023',
  'insert', 'ind_e58df0a7235f17c2',
  'Unique: Nasarawa Nasarawa Eggon East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e58df0a7235f17c2', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_e58df0a7235f17c2', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e58df0a7235f17c2', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_nasarawa_eggon_east',
  'ind_e58df0a7235f17c2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e58df0a7235f17c2', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Nasarawa Eggon East', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e58df0a7235f17c2', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_e58df0a7235f17c2',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e58df0a7235f17c2', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_e58df0a7235f17c2',
  'political_assignment', '{"constituency_inec": "NASARAWA EGGON EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e58df0a7235f17c2', 'prof_e58df0a7235f17c2',
  'Jacob Ajegena Kudu',
  'jacob ajegena kudu nasarawa state assembly nasarawa eggon east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Ibrahim P. Akwe -- Obi I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4ac1f57dd552f368', 'Ibrahim P. Akwe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4ac1f57dd552f368', 'ind_4ac1f57dd552f368', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim P. Akwe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4ac1f57dd552f368', 'prof_4ac1f57dd552f368',
  'Member, Nasarawa State House of Assembly (OBI I)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4ac1f57dd552f368', 'ind_4ac1f57dd552f368', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4ac1f57dd552f368', 'ind_4ac1f57dd552f368', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4ac1f57dd552f368', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|obi i|2023',
  'insert', 'ind_4ac1f57dd552f368',
  'Unique: Nasarawa Obi I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4ac1f57dd552f368', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_4ac1f57dd552f368', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4ac1f57dd552f368', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_obi_i',
  'ind_4ac1f57dd552f368', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4ac1f57dd552f368', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Obi I', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4ac1f57dd552f368', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_4ac1f57dd552f368',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4ac1f57dd552f368', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_4ac1f57dd552f368',
  'political_assignment', '{"constituency_inec": "OBI I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4ac1f57dd552f368', 'prof_4ac1f57dd552f368',
  'Ibrahim P. Akwe',
  'ibrahim p. akwe nasarawa state assembly obi i pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Luka Zhekaba -- Obi II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_790b8a9dc41836b9', 'Luka Zhekaba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_790b8a9dc41836b9', 'ind_790b8a9dc41836b9', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Luka Zhekaba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_790b8a9dc41836b9', 'prof_790b8a9dc41836b9',
  'Member, Nasarawa State House of Assembly (OBI II)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_790b8a9dc41836b9', 'ind_790b8a9dc41836b9', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_790b8a9dc41836b9', 'ind_790b8a9dc41836b9', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_790b8a9dc41836b9', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|obi ii|2023',
  'insert', 'ind_790b8a9dc41836b9',
  'Unique: Nasarawa Obi II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_790b8a9dc41836b9', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_790b8a9dc41836b9', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_790b8a9dc41836b9', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_obi_ii',
  'ind_790b8a9dc41836b9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_790b8a9dc41836b9', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Obi II', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_790b8a9dc41836b9', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_790b8a9dc41836b9',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_790b8a9dc41836b9', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_790b8a9dc41836b9',
  'political_assignment', '{"constituency_inec": "OBI II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_790b8a9dc41836b9', 'prof_790b8a9dc41836b9',
  'Luka Zhekaba',
  'luka zhekaba nasarawa state assembly obi ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Larry Ven Bawa -- Akwanga North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a9cafc56c6e75d88', 'Larry Ven Bawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a9cafc56c6e75d88', 'ind_a9cafc56c6e75d88', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Larry Ven Bawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a9cafc56c6e75d88', 'prof_a9cafc56c6e75d88',
  'Member, Nasarawa State House of Assembly (AKWANGA NORTH)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a9cafc56c6e75d88', 'ind_a9cafc56c6e75d88', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a9cafc56c6e75d88', 'ind_a9cafc56c6e75d88', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a9cafc56c6e75d88', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|akwanga north|2023',
  'insert', 'ind_a9cafc56c6e75d88',
  'Unique: Nasarawa Akwanga North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a9cafc56c6e75d88', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_a9cafc56c6e75d88', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a9cafc56c6e75d88', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_akwanga_north',
  'ind_a9cafc56c6e75d88', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a9cafc56c6e75d88', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Akwanga North', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a9cafc56c6e75d88', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_a9cafc56c6e75d88',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a9cafc56c6e75d88', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_a9cafc56c6e75d88',
  'political_assignment', '{"constituency_inec": "AKWANGA NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a9cafc56c6e75d88', 'prof_a9cafc56c6e75d88',
  'Larry Ven Bawa',
  'larry ven bawa nasarawa state assembly akwanga north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Muhammed Tsimbabi -- Toto/ Gadabuke (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c10d13161f42e4a1', 'Muhammed Tsimbabi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c10d13161f42e4a1', 'ind_c10d13161f42e4a1', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammed Tsimbabi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c10d13161f42e4a1', 'prof_c10d13161f42e4a1',
  'Member, Nasarawa State House of Assembly (TOTO/ GADABUKE)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c10d13161f42e4a1', 'ind_c10d13161f42e4a1', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c10d13161f42e4a1', 'ind_c10d13161f42e4a1', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c10d13161f42e4a1', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|toto/ gadabuke|2023',
  'insert', 'ind_c10d13161f42e4a1',
  'Unique: Nasarawa Toto/ Gadabuke seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c10d13161f42e4a1', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_c10d13161f42e4a1', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c10d13161f42e4a1', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_toto/_gadabuke',
  'ind_c10d13161f42e4a1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c10d13161f42e4a1', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Toto/ Gadabuke', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c10d13161f42e4a1', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_c10d13161f42e4a1',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c10d13161f42e4a1', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_c10d13161f42e4a1',
  'political_assignment', '{"constituency_inec": "TOTO/ GADABUKE", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c10d13161f42e4a1', 'prof_c10d13161f42e4a1',
  'Muhammed Tsimbabi',
  'muhammed tsimbabi nasarawa state assembly toto/ gadabuke nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Emmanuel Manding -- Wamba (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4e09a3c00a7ab5ce', 'Emmanuel Manding',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4e09a3c00a7ab5ce', 'ind_4e09a3c00a7ab5ce', 'individual', 'place_state_nasarawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Emmanuel Manding', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4e09a3c00a7ab5ce', 'prof_4e09a3c00a7ab5ce',
  'Member, Nasarawa State House of Assembly (WAMBA)',
  'place_state_nasarawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4e09a3c00a7ab5ce', 'ind_4e09a3c00a7ab5ce', 'term_ng_nasarawa_state_assembly_10th_2023_2027',
  'place_state_nasarawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4e09a3c00a7ab5ce', 'ind_4e09a3c00a7ab5ce', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4e09a3c00a7ab5ce', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual',
  'ng_state_assembly_member|nasarawa|wamba|2023',
  'insert', 'ind_4e09a3c00a7ab5ce',
  'Unique: Nasarawa Wamba seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4e09a3c00a7ab5ce', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_4e09a3c00a7ab5ce', 'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4e09a3c00a7ab5ce', 'seed_run_s05_political_nasarawa_roster_20260502', 'seed_source_nigerianleaders_nasarawa_assembly_20260502',
  'nl_nasarawa_assembly_2023_wamba',
  'ind_4e09a3c00a7ab5ce', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4e09a3c00a7ab5ce', 'seed_run_s05_political_nasarawa_roster_20260502',
  'Nasarawa Wamba', 'place_state_nasarawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4e09a3c00a7ab5ce', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_4e09a3c00a7ab5ce',
  'seed_source_nigerianleaders_nasarawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4e09a3c00a7ab5ce', 'seed_run_s05_political_nasarawa_roster_20260502', 'individual', 'ind_4e09a3c00a7ab5ce',
  'political_assignment', '{"constituency_inec": "WAMBA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/nasarawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4e09a3c00a7ab5ce', 'prof_4e09a3c00a7ab5ce',
  'Emmanuel Manding',
  'emmanuel manding nasarawa state assembly wamba apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_nasarawa',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
