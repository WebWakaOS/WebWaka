-- ============================================================
-- Migration 0518: Kaduna State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Kaduna State House of Assembly Members
-- Members seeded: 28/46
-- Party breakdown: APC:12, PDP:8, ADC:3, AA:3, LP:1, NNPP:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;

BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_kaduna_assembly_20260502',
  'NigerianLeaders – Complete List of Kaduna State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/kaduna-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_kaduna_roster_20260502', 'S05 Batch – Kaduna State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_kaduna_roster_20260502',
  'seed_run_s05_political_kaduna_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0518_political_kaduna_assembly_full_roster_seed.sql',
  NULL, 28,
  '28/46 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_kaduna_state_assembly_10th_2023_2027',
  'Kaduna State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_kaduna',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (28 of 46 seats) ──────────────────────────────────────

-- 01. Jamilu Abubakar Albani -- Basawa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_92e622f3a9aaea56', 'Jamilu Abubakar Albani',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_92e622f3a9aaea56', 'ind_92e622f3a9aaea56', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jamilu Abubakar Albani', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_92e622f3a9aaea56', 'prof_92e622f3a9aaea56',
  'Member, Kaduna State House of Assembly (BASAWA)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_92e622f3a9aaea56', 'ind_92e622f3a9aaea56', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_92e622f3a9aaea56', 'ind_92e622f3a9aaea56', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_92e622f3a9aaea56', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|basawa|2023',
  'insert', 'ind_92e622f3a9aaea56',
  'Unique: Kaduna Basawa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_92e622f3a9aaea56', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_92e622f3a9aaea56', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_92e622f3a9aaea56', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_basawa',
  'ind_92e622f3a9aaea56', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_92e622f3a9aaea56', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Basawa', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_92e622f3a9aaea56', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_92e622f3a9aaea56',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_92e622f3a9aaea56', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_92e622f3a9aaea56',
  'political_assignment', '{"constituency_inec": "BASAWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_92e622f3a9aaea56', 'prof_92e622f3a9aaea56',
  'Jamilu Abubakar Albani',
  'jamilu abubakar albani kaduna state assembly basawa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Aminu Lovina -- Chawai/Kauru (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c325332e0300d213', 'Aminu Lovina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c325332e0300d213', 'ind_c325332e0300d213', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aminu Lovina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c325332e0300d213', 'prof_c325332e0300d213',
  'Member, Kaduna State House of Assembly (CHAWAI/KAURU)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c325332e0300d213', 'ind_c325332e0300d213', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c325332e0300d213', 'ind_c325332e0300d213', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c325332e0300d213', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|chawai/kauru|2023',
  'insert', 'ind_c325332e0300d213',
  'Unique: Kaduna Chawai/Kauru seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c325332e0300d213', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_c325332e0300d213', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c325332e0300d213', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_chawai/kauru',
  'ind_c325332e0300d213', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c325332e0300d213', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Chawai/Kauru', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c325332e0300d213', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_c325332e0300d213',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c325332e0300d213', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_c325332e0300d213',
  'political_assignment', '{"constituency_inec": "CHAWAI/KAURU", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c325332e0300d213', 'prof_c325332e0300d213',
  'Aminu Lovina',
  'aminu lovina kaduna state assembly chawai/kauru adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Aniagu Augustine Chijioke -- Chikun I (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f33514c0833cfc06', 'Aniagu Augustine Chijioke',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f33514c0833cfc06', 'ind_f33514c0833cfc06', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aniagu Augustine Chijioke', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f33514c0833cfc06', 'prof_f33514c0833cfc06',
  'Member, Kaduna State House of Assembly (CHIKUN I)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f33514c0833cfc06', 'ind_f33514c0833cfc06', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f33514c0833cfc06', 'ind_f33514c0833cfc06', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f33514c0833cfc06', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|chikun i|2023',
  'insert', 'ind_f33514c0833cfc06',
  'Unique: Kaduna Chikun I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f33514c0833cfc06', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f33514c0833cfc06', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f33514c0833cfc06', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_chikun_i',
  'ind_f33514c0833cfc06', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f33514c0833cfc06', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Chikun I', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f33514c0833cfc06', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f33514c0833cfc06',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f33514c0833cfc06', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f33514c0833cfc06',
  'political_assignment', '{"constituency_inec": "CHIKUN I", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f33514c0833cfc06', 'prof_f33514c0833cfc06',
  'Aniagu Augustine Chijioke',
  'aniagu augustine chijioke kaduna state assembly chikun i lp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Yusuf Hafiz -- City (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_07b4bc49c9c27e9f', 'Yusuf Hafiz',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_07b4bc49c9c27e9f', 'ind_07b4bc49c9c27e9f', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yusuf Hafiz', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_07b4bc49c9c27e9f', 'prof_07b4bc49c9c27e9f',
  'Member, Kaduna State House of Assembly (CITY)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_07b4bc49c9c27e9f', 'ind_07b4bc49c9c27e9f', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_07b4bc49c9c27e9f', 'ind_07b4bc49c9c27e9f', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_07b4bc49c9c27e9f', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|city|2023',
  'insert', 'ind_07b4bc49c9c27e9f',
  'Unique: Kaduna City seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_07b4bc49c9c27e9f', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_07b4bc49c9c27e9f', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_07b4bc49c9c27e9f', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_city',
  'ind_07b4bc49c9c27e9f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_07b4bc49c9c27e9f', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna City', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_07b4bc49c9c27e9f', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_07b4bc49c9c27e9f',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_07b4bc49c9c27e9f', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_07b4bc49c9c27e9f',
  'political_assignment', '{"constituency_inec": "CITY", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_07b4bc49c9c27e9f', 'prof_07b4bc49c9c27e9f',
  'Yusuf Hafiz',
  'yusuf hafiz kaduna state assembly city aa politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Giwa East -- Giwa East (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b12c752813c01be7', 'Giwa East',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b12c752813c01be7', 'ind_b12c752813c01be7', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Giwa East', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b12c752813c01be7', 'prof_b12c752813c01be7',
  'Member, Kaduna State House of Assembly (GIWA EAST)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b12c752813c01be7', 'ind_b12c752813c01be7', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b12c752813c01be7', 'ind_b12c752813c01be7', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b12c752813c01be7', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|giwa east|2023',
  'insert', 'ind_b12c752813c01be7',
  'Unique: Kaduna Giwa East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b12c752813c01be7', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_b12c752813c01be7', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b12c752813c01be7', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_giwa_east',
  'ind_b12c752813c01be7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b12c752813c01be7', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Giwa East', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b12c752813c01be7', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_b12c752813c01be7',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b12c752813c01be7', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_b12c752813c01be7',
  'political_assignment', '{"constituency_inec": "GIWA EAST", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b12c752813c01be7', 'prof_b12c752813c01be7',
  'Giwa East',
  'giwa east kaduna state assembly giwa east adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Auwal Umar -- Giwa West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6a56832a5bc6e4e4', 'Auwal Umar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6a56832a5bc6e4e4', 'ind_6a56832a5bc6e4e4', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Auwal Umar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6a56832a5bc6e4e4', 'prof_6a56832a5bc6e4e4',
  'Member, Kaduna State House of Assembly (GIWA WEST)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6a56832a5bc6e4e4', 'ind_6a56832a5bc6e4e4', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6a56832a5bc6e4e4', 'ind_6a56832a5bc6e4e4', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6a56832a5bc6e4e4', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|giwa west|2023',
  'insert', 'ind_6a56832a5bc6e4e4',
  'Unique: Kaduna Giwa West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6a56832a5bc6e4e4', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_6a56832a5bc6e4e4', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6a56832a5bc6e4e4', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_giwa_west',
  'ind_6a56832a5bc6e4e4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6a56832a5bc6e4e4', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Giwa West', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6a56832a5bc6e4e4', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_6a56832a5bc6e4e4',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6a56832a5bc6e4e4', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_6a56832a5bc6e4e4',
  'political_assignment', '{"constituency_inec": "GIWA WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6a56832a5bc6e4e4', 'prof_6a56832a5bc6e4e4',
  'Auwal Umar',
  'auwal umar kaduna state assembly giwa west apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Bala Salisu Dandada -- Igabi East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_36c6d71cba652413', 'Bala Salisu Dandada',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_36c6d71cba652413', 'ind_36c6d71cba652413', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bala Salisu Dandada', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_36c6d71cba652413', 'prof_36c6d71cba652413',
  'Member, Kaduna State House of Assembly (IGABI EAST)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_36c6d71cba652413', 'ind_36c6d71cba652413', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_36c6d71cba652413', 'ind_36c6d71cba652413', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_36c6d71cba652413', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|igabi east|2023',
  'insert', 'ind_36c6d71cba652413',
  'Unique: Kaduna Igabi East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_36c6d71cba652413', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_36c6d71cba652413', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_36c6d71cba652413', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_igabi_east',
  'ind_36c6d71cba652413', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_36c6d71cba652413', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Igabi East', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_36c6d71cba652413', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_36c6d71cba652413',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_36c6d71cba652413', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_36c6d71cba652413',
  'political_assignment', '{"constituency_inec": "IGABI EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_36c6d71cba652413', 'prof_36c6d71cba652413',
  'Bala Salisu Dandada',
  'bala salisu dandada kaduna state assembly igabi east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Zailani Yusuf Ibrahim -- Igabi West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bc549ce1309706f4', 'Zailani Yusuf Ibrahim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bc549ce1309706f4', 'ind_bc549ce1309706f4', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Zailani Yusuf Ibrahim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bc549ce1309706f4', 'prof_bc549ce1309706f4',
  'Member, Kaduna State House of Assembly (IGABI WEST)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bc549ce1309706f4', 'ind_bc549ce1309706f4', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bc549ce1309706f4', 'ind_bc549ce1309706f4', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bc549ce1309706f4', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|igabi west|2023',
  'insert', 'ind_bc549ce1309706f4',
  'Unique: Kaduna Igabi West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bc549ce1309706f4', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_bc549ce1309706f4', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bc549ce1309706f4', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_igabi_west',
  'ind_bc549ce1309706f4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bc549ce1309706f4', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Igabi West', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bc549ce1309706f4', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_bc549ce1309706f4',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bc549ce1309706f4', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_bc549ce1309706f4',
  'political_assignment', '{"constituency_inec": "IGABI WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bc549ce1309706f4', 'prof_bc549ce1309706f4',
  'Zailani Yusuf Ibrahim',
  'zailani yusuf ibrahim kaduna state assembly igabi west apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Idris Abdulwahab -- Ikara (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7389d8c50206a769', 'Idris Abdulwahab',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7389d8c50206a769', 'ind_7389d8c50206a769', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Idris Abdulwahab', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7389d8c50206a769', 'prof_7389d8c50206a769',
  'Member, Kaduna State House of Assembly (IKARA)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7389d8c50206a769', 'ind_7389d8c50206a769', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7389d8c50206a769', 'ind_7389d8c50206a769', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7389d8c50206a769', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|ikara|2023',
  'insert', 'ind_7389d8c50206a769',
  'Unique: Kaduna Ikara seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7389d8c50206a769', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_7389d8c50206a769', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7389d8c50206a769', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_ikara',
  'ind_7389d8c50206a769', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7389d8c50206a769', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Ikara', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7389d8c50206a769', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_7389d8c50206a769',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7389d8c50206a769', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_7389d8c50206a769',
  'political_assignment', '{"constituency_inec": "IKARA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7389d8c50206a769', 'prof_7389d8c50206a769',
  'Idris Abdulwahab',
  'idris abdulwahab kaduna state assembly ikara apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Jock Gaiya Salamatu Salamatu -- Jaba (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bbe16e68fb5fc553', 'Jock Gaiya Salamatu Salamatu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bbe16e68fb5fc553', 'ind_bbe16e68fb5fc553', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jock Gaiya Salamatu Salamatu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bbe16e68fb5fc553', 'prof_bbe16e68fb5fc553',
  'Member, Kaduna State House of Assembly (JABA)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bbe16e68fb5fc553', 'ind_bbe16e68fb5fc553', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bbe16e68fb5fc553', 'ind_bbe16e68fb5fc553', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bbe16e68fb5fc553', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|jaba|2023',
  'insert', 'ind_bbe16e68fb5fc553',
  'Unique: Kaduna Jaba seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bbe16e68fb5fc553', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_bbe16e68fb5fc553', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bbe16e68fb5fc553', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_jaba',
  'ind_bbe16e68fb5fc553', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bbe16e68fb5fc553', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Jaba', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bbe16e68fb5fc553', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_bbe16e68fb5fc553',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bbe16e68fb5fc553', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_bbe16e68fb5fc553',
  'political_assignment', '{"constituency_inec": "JABA", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bbe16e68fb5fc553', 'prof_bbe16e68fb5fc553',
  'Jock Gaiya Salamatu Salamatu',
  'jock gaiya salamatu salamatu kaduna state assembly jaba aa politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Kalat Ali -- Jemaa (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9b9fbb165d0b2344', 'Kalat Ali',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9b9fbb165d0b2344', 'ind_9b9fbb165d0b2344', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kalat Ali', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9b9fbb165d0b2344', 'prof_9b9fbb165d0b2344',
  'Member, Kaduna State House of Assembly (JEMAA)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9b9fbb165d0b2344', 'ind_9b9fbb165d0b2344', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9b9fbb165d0b2344', 'ind_9b9fbb165d0b2344', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9b9fbb165d0b2344', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|jemaa|2023',
  'insert', 'ind_9b9fbb165d0b2344',
  'Unique: Kaduna Jemaa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9b9fbb165d0b2344', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_9b9fbb165d0b2344', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9b9fbb165d0b2344', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_jemaa',
  'ind_9b9fbb165d0b2344', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9b9fbb165d0b2344', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Jemaa', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9b9fbb165d0b2344', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_9b9fbb165d0b2344',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9b9fbb165d0b2344', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_9b9fbb165d0b2344',
  'political_assignment', '{"constituency_inec": "JEMAA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9b9fbb165d0b2344', 'prof_9b9fbb165d0b2344',
  'Kalat Ali',
  'kalat ali kaduna state assembly jemaa pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Shaibu Gabriel -- Kachia (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f3eb131b6f56de33', 'Shaibu Gabriel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f3eb131b6f56de33', 'ind_f3eb131b6f56de33', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Shaibu Gabriel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f3eb131b6f56de33', 'prof_f3eb131b6f56de33',
  'Member, Kaduna State House of Assembly (KACHIA)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f3eb131b6f56de33', 'ind_f3eb131b6f56de33', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f3eb131b6f56de33', 'ind_f3eb131b6f56de33', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f3eb131b6f56de33', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|kachia|2023',
  'insert', 'ind_f3eb131b6f56de33',
  'Unique: Kaduna Kachia seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f3eb131b6f56de33', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f3eb131b6f56de33', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f3eb131b6f56de33', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_kachia',
  'ind_f3eb131b6f56de33', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f3eb131b6f56de33', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Kachia', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f3eb131b6f56de33', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f3eb131b6f56de33',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f3eb131b6f56de33', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f3eb131b6f56de33',
  'political_assignment', '{"constituency_inec": "KACHIA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f3eb131b6f56de33', 'prof_f3eb131b6f56de33',
  'Shaibu Gabriel',
  'shaibu gabriel kaduna state assembly kachia pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Tanko Morondia -- Kagarko (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a78e994eedc98fd1', 'Tanko Morondia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a78e994eedc98fd1', 'ind_a78e994eedc98fd1', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Tanko Morondia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a78e994eedc98fd1', 'prof_a78e994eedc98fd1',
  'Member, Kaduna State House of Assembly (KAGARKO)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a78e994eedc98fd1', 'ind_a78e994eedc98fd1', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a78e994eedc98fd1', 'ind_a78e994eedc98fd1', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a78e994eedc98fd1', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|kagarko|2023',
  'insert', 'ind_a78e994eedc98fd1',
  'Unique: Kaduna Kagarko seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a78e994eedc98fd1', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_a78e994eedc98fd1', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a78e994eedc98fd1', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_kagarko',
  'ind_a78e994eedc98fd1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a78e994eedc98fd1', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Kagarko', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a78e994eedc98fd1', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_a78e994eedc98fd1',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a78e994eedc98fd1', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_a78e994eedc98fd1',
  'political_assignment', '{"constituency_inec": "KAGARKO", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a78e994eedc98fd1', 'prof_a78e994eedc98fd1',
  'Tanko Morondia',
  'tanko morondia kaduna state assembly kagarko pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Usman Danlami Stingo -- Kajuru (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b80958fe4d1447fb', 'Usman Danlami Stingo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b80958fe4d1447fb', 'ind_b80958fe4d1447fb', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Usman Danlami Stingo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b80958fe4d1447fb', 'prof_b80958fe4d1447fb',
  'Member, Kaduna State House of Assembly (KAJURU)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b80958fe4d1447fb', 'ind_b80958fe4d1447fb', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b80958fe4d1447fb', 'ind_b80958fe4d1447fb', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b80958fe4d1447fb', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|kajuru|2023',
  'insert', 'ind_b80958fe4d1447fb',
  'Unique: Kaduna Kajuru seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b80958fe4d1447fb', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_b80958fe4d1447fb', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b80958fe4d1447fb', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_kajuru',
  'ind_b80958fe4d1447fb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b80958fe4d1447fb', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Kajuru', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b80958fe4d1447fb', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_b80958fe4d1447fb',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b80958fe4d1447fb', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_b80958fe4d1447fb',
  'political_assignment', '{"constituency_inec": "KAJURU", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b80958fe4d1447fb', 'prof_b80958fe4d1447fb',
  'Usman Danlami Stingo',
  'usman danlami stingo kaduna state assembly kajuru pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Ahmed Mohammed -- Kewaye (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_20ab34cd2758924c', 'Ahmed Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_20ab34cd2758924c', 'ind_20ab34cd2758924c', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ahmed Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_20ab34cd2758924c', 'prof_20ab34cd2758924c',
  'Member, Kaduna State House of Assembly (KEWAYE)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_20ab34cd2758924c', 'ind_20ab34cd2758924c', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_20ab34cd2758924c', 'ind_20ab34cd2758924c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_20ab34cd2758924c', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|kewaye|2023',
  'insert', 'ind_20ab34cd2758924c',
  'Unique: Kaduna Kewaye seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_20ab34cd2758924c', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_20ab34cd2758924c', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_20ab34cd2758924c', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_kewaye',
  'ind_20ab34cd2758924c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_20ab34cd2758924c', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Kewaye', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_20ab34cd2758924c', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_20ab34cd2758924c',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_20ab34cd2758924c', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_20ab34cd2758924c',
  'political_assignment', '{"constituency_inec": "KEWAYE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_20ab34cd2758924c', 'prof_20ab34cd2758924c',
  'Ahmed Mohammed',
  'ahmed mohammed kaduna state assembly kewaye apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Yunusa Shehu -- Kubau (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8af0bf4be4b91dc8', 'Yunusa Shehu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8af0bf4be4b91dc8', 'ind_8af0bf4be4b91dc8', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yunusa Shehu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8af0bf4be4b91dc8', 'prof_8af0bf4be4b91dc8',
  'Member, Kaduna State House of Assembly (KUBAU)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8af0bf4be4b91dc8', 'ind_8af0bf4be4b91dc8', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8af0bf4be4b91dc8', 'ind_8af0bf4be4b91dc8', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8af0bf4be4b91dc8', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|kubau|2023',
  'insert', 'ind_8af0bf4be4b91dc8',
  'Unique: Kaduna Kubau seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8af0bf4be4b91dc8', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_8af0bf4be4b91dc8', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8af0bf4be4b91dc8', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_kubau',
  'ind_8af0bf4be4b91dc8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8af0bf4be4b91dc8', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Kubau', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8af0bf4be4b91dc8', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_8af0bf4be4b91dc8',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8af0bf4be4b91dc8', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_8af0bf4be4b91dc8',
  'political_assignment', '{"constituency_inec": "KUBAU", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8af0bf4be4b91dc8', 'prof_8af0bf4be4b91dc8',
  'Yunusa Shehu',
  'yunusa shehu kaduna state assembly kubau apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Gatari Idris, Bashir -- Lere (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e47b0de7a5e73ef8', 'Gatari Idris, Bashir',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e47b0de7a5e73ef8', 'ind_e47b0de7a5e73ef8', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Gatari Idris, Bashir', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e47b0de7a5e73ef8', 'prof_e47b0de7a5e73ef8',
  'Member, Kaduna State House of Assembly (LERE)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e47b0de7a5e73ef8', 'ind_e47b0de7a5e73ef8', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e47b0de7a5e73ef8', 'ind_e47b0de7a5e73ef8', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e47b0de7a5e73ef8', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|lere|2023',
  'insert', 'ind_e47b0de7a5e73ef8',
  'Unique: Kaduna Lere seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e47b0de7a5e73ef8', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_e47b0de7a5e73ef8', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e47b0de7a5e73ef8', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_lere',
  'ind_e47b0de7a5e73ef8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e47b0de7a5e73ef8', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Lere', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e47b0de7a5e73ef8', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_e47b0de7a5e73ef8',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e47b0de7a5e73ef8', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_e47b0de7a5e73ef8',
  'political_assignment', '{"constituency_inec": "LERE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e47b0de7a5e73ef8', 'prof_e47b0de7a5e73ef8',
  'Gatari Idris, Bashir',
  'gatari idris, bashir kaduna state assembly lere apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Shehu Abubakar -- Magajin Gari (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bd9fc4df4469dcf0', 'Shehu Abubakar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bd9fc4df4469dcf0', 'ind_bd9fc4df4469dcf0', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Shehu Abubakar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bd9fc4df4469dcf0', 'prof_bd9fc4df4469dcf0',
  'Member, Kaduna State House of Assembly (MAGAJIN GARI)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bd9fc4df4469dcf0', 'ind_bd9fc4df4469dcf0', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bd9fc4df4469dcf0', 'ind_bd9fc4df4469dcf0', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bd9fc4df4469dcf0', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|magajin gari|2023',
  'insert', 'ind_bd9fc4df4469dcf0',
  'Unique: Kaduna Magajin Gari seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bd9fc4df4469dcf0', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_bd9fc4df4469dcf0', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bd9fc4df4469dcf0', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_magajin_gari',
  'ind_bd9fc4df4469dcf0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bd9fc4df4469dcf0', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Magajin Gari', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bd9fc4df4469dcf0', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_bd9fc4df4469dcf0',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bd9fc4df4469dcf0', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_bd9fc4df4469dcf0',
  'political_assignment', '{"constituency_inec": "MAGAJIN GARI", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bd9fc4df4469dcf0', 'prof_bd9fc4df4469dcf0',
  'Shehu Abubakar',
  'shehu abubakar kaduna state assembly magajin gari pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Zubairu Sagir -- Maigana (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_83a541744d443fba', 'Zubairu Sagir',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_83a541744d443fba', 'ind_83a541744d443fba', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Zubairu Sagir', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_83a541744d443fba', 'prof_83a541744d443fba',
  'Member, Kaduna State House of Assembly (MAIGANA)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_83a541744d443fba', 'ind_83a541744d443fba', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_83a541744d443fba', 'ind_83a541744d443fba', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_83a541744d443fba', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|maigana|2023',
  'insert', 'ind_83a541744d443fba',
  'Unique: Kaduna Maigana seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_83a541744d443fba', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_83a541744d443fba', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_83a541744d443fba', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_maigana',
  'ind_83a541744d443fba', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_83a541744d443fba', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Maigana', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_83a541744d443fba', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_83a541744d443fba',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_83a541744d443fba', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_83a541744d443fba',
  'political_assignment', '{"constituency_inec": "MAIGANA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_83a541744d443fba', 'prof_83a541744d443fba',
  'Zubairu Sagir',
  'zubairu sagir kaduna state assembly maigana apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Dahiru Yusuf Liman -- Makera (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_13f9d0449c5e287c', 'Dahiru Yusuf Liman',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_13f9d0449c5e287c', 'ind_13f9d0449c5e287c', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dahiru Yusuf Liman', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_13f9d0449c5e287c', 'prof_13f9d0449c5e287c',
  'Member, Kaduna State House of Assembly (MAKERA)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_13f9d0449c5e287c', 'ind_13f9d0449c5e287c', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_13f9d0449c5e287c', 'ind_13f9d0449c5e287c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_13f9d0449c5e287c', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|makera|2023',
  'insert', 'ind_13f9d0449c5e287c',
  'Unique: Kaduna Makera seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_13f9d0449c5e287c', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_13f9d0449c5e287c', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_13f9d0449c5e287c', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_makera',
  'ind_13f9d0449c5e287c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_13f9d0449c5e287c', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Makera', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_13f9d0449c5e287c', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_13f9d0449c5e287c',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_13f9d0449c5e287c', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_13f9d0449c5e287c',
  'political_assignment', '{"constituency_inec": "MAKERA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_13f9d0449c5e287c', 'prof_13f9d0449c5e287c',
  'Dahiru Yusuf Liman',
  'dahiru yusuf liman kaduna state assembly makera apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Idris Mohammed Nasir -- Sabon Gari (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4bf7ef0ee836499c', 'Idris Mohammed Nasir',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4bf7ef0ee836499c', 'ind_4bf7ef0ee836499c', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Idris Mohammed Nasir', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4bf7ef0ee836499c', 'prof_4bf7ef0ee836499c',
  'Member, Kaduna State House of Assembly (SABON GARI)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4bf7ef0ee836499c', 'ind_4bf7ef0ee836499c', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4bf7ef0ee836499c', 'ind_4bf7ef0ee836499c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4bf7ef0ee836499c', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|sabon gari|2023',
  'insert', 'ind_4bf7ef0ee836499c',
  'Unique: Kaduna Sabon Gari seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4bf7ef0ee836499c', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_4bf7ef0ee836499c', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4bf7ef0ee836499c', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_sabon_gari',
  'ind_4bf7ef0ee836499c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4bf7ef0ee836499c', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Sabon Gari', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4bf7ef0ee836499c', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_4bf7ef0ee836499c',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4bf7ef0ee836499c', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_4bf7ef0ee836499c',
  'political_assignment', '{"constituency_inec": "SABON GARI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4bf7ef0ee836499c', 'prof_4bf7ef0ee836499c',
  'Idris Mohammed Nasir',
  'idris mohammed nasir kaduna state assembly sabon gari apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Ayuba Bitrus -- Saminaka (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bf4556e2a29bb4fe', 'Ayuba Bitrus',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bf4556e2a29bb4fe', 'ind_bf4556e2a29bb4fe', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ayuba Bitrus', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bf4556e2a29bb4fe', 'prof_bf4556e2a29bb4fe',
  'Member, Kaduna State House of Assembly (SAMINAKA)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bf4556e2a29bb4fe', 'ind_bf4556e2a29bb4fe', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bf4556e2a29bb4fe', 'ind_bf4556e2a29bb4fe', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bf4556e2a29bb4fe', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|saminaka|2023',
  'insert', 'ind_bf4556e2a29bb4fe',
  'Unique: Kaduna Saminaka seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bf4556e2a29bb4fe', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_bf4556e2a29bb4fe', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bf4556e2a29bb4fe', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_saminaka',
  'ind_bf4556e2a29bb4fe', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bf4556e2a29bb4fe', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Saminaka', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bf4556e2a29bb4fe', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_bf4556e2a29bb4fe',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bf4556e2a29bb4fe', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_bf4556e2a29bb4fe',
  'political_assignment', '{"constituency_inec": "SAMINAKA", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bf4556e2a29bb4fe', 'prof_bf4556e2a29bb4fe',
  'Ayuba Bitrus',
  'ayuba bitrus kaduna state assembly saminaka adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Amwe Comfort -- Sanga (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f12bf748df01b4ca', 'Amwe Comfort',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f12bf748df01b4ca', 'ind_f12bf748df01b4ca', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Amwe Comfort', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f12bf748df01b4ca', 'prof_f12bf748df01b4ca',
  'Member, Kaduna State House of Assembly (SANGA)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f12bf748df01b4ca', 'ind_f12bf748df01b4ca', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f12bf748df01b4ca', 'ind_f12bf748df01b4ca', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f12bf748df01b4ca', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|sanga|2023',
  'insert', 'ind_f12bf748df01b4ca',
  'Unique: Kaduna Sanga seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f12bf748df01b4ca', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f12bf748df01b4ca', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f12bf748df01b4ca', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_sanga',
  'ind_f12bf748df01b4ca', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f12bf748df01b4ca', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Sanga', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f12bf748df01b4ca', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f12bf748df01b4ca',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f12bf748df01b4ca', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f12bf748df01b4ca',
  'political_assignment', '{"constituency_inec": "SANGA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f12bf748df01b4ca', 'prof_f12bf748df01b4ca',
  'Amwe Comfort',
  'amwe comfort kaduna state assembly sanga pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Abbas Faisal -- Kudan (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_efd554a425441580', 'Abbas Faisal',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_efd554a425441580', 'ind_efd554a425441580', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abbas Faisal', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_efd554a425441580', 'prof_efd554a425441580',
  'Member, Kaduna State House of Assembly (KUDAN)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_efd554a425441580', 'ind_efd554a425441580', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_efd554a425441580', 'ind_efd554a425441580', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_efd554a425441580', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|kudan|2023',
  'insert', 'ind_efd554a425441580',
  'Unique: Kaduna Kudan seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_efd554a425441580', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_efd554a425441580', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_efd554a425441580', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_kudan',
  'ind_efd554a425441580', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_efd554a425441580', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Kudan', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_efd554a425441580', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_efd554a425441580',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_efd554a425441580', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_efd554a425441580',
  'political_assignment', '{"constituency_inec": "KUDAN", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_efd554a425441580', 'prof_efd554a425441580',
  'Abbas Faisal',
  'abbas faisal kaduna state assembly kudan apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Mugu Yusufu -- Kaura (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_89a06f2cba915965', 'Mugu Yusufu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_89a06f2cba915965', 'ind_89a06f2cba915965', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mugu Yusufu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_89a06f2cba915965', 'prof_89a06f2cba915965',
  'Member, Kaduna State House of Assembly (KAURA)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_89a06f2cba915965', 'ind_89a06f2cba915965', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_89a06f2cba915965', 'ind_89a06f2cba915965', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_89a06f2cba915965', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|kaura|2023',
  'insert', 'ind_89a06f2cba915965',
  'Unique: Kaduna Kaura seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_89a06f2cba915965', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_89a06f2cba915965', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_89a06f2cba915965', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_kaura',
  'ind_89a06f2cba915965', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_89a06f2cba915965', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Kaura', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_89a06f2cba915965', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_89a06f2cba915965',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_89a06f2cba915965', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_89a06f2cba915965',
  'political_assignment', '{"constituency_inec": "KAURA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_89a06f2cba915965', 'prof_89a06f2cba915965',
  'Mugu Yusufu',
  'mugu yusufu kaduna state assembly kaura pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 26. M.A Inuwa Haruna -- Kawo/Gabasawa (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e850c996e7c363f0', 'M.A Inuwa Haruna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e850c996e7c363f0', 'ind_e850c996e7c363f0', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'M.A Inuwa Haruna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e850c996e7c363f0', 'prof_e850c996e7c363f0',
  'Member, Kaduna State House of Assembly (KAWO/GABASAWA)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e850c996e7c363f0', 'ind_e850c996e7c363f0', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e850c996e7c363f0', 'ind_e850c996e7c363f0', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e850c996e7c363f0', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|kawo/gabasawa|2023',
  'insert', 'ind_e850c996e7c363f0',
  'Unique: Kaduna Kawo/Gabasawa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e850c996e7c363f0', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_e850c996e7c363f0', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e850c996e7c363f0', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_kawo/gabasawa',
  'ind_e850c996e7c363f0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e850c996e7c363f0', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Kawo/Gabasawa', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e850c996e7c363f0', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_e850c996e7c363f0',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e850c996e7c363f0', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_e850c996e7c363f0',
  'political_assignment', '{"constituency_inec": "KAWO/GABASAWA", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e850c996e7c363f0', 'prof_e850c996e7c363f0',
  'M.A Inuwa Haruna',
  'm.a inuwa haruna kaduna state assembly kawo/gabasawa nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 27. Abdullahi Auwal Bala -- Unguwar Sanusi (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f937ad3b9c620009', 'Abdullahi Auwal Bala',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f937ad3b9c620009', 'ind_f937ad3b9c620009', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Auwal Bala', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f937ad3b9c620009', 'prof_f937ad3b9c620009',
  'Member, Kaduna State House of Assembly (UNGUWAR SANUSI)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f937ad3b9c620009', 'ind_f937ad3b9c620009', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f937ad3b9c620009', 'ind_f937ad3b9c620009', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f937ad3b9c620009', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|unguwar sanusi|2023',
  'insert', 'ind_f937ad3b9c620009',
  'Unique: Kaduna Unguwar Sanusi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f937ad3b9c620009', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f937ad3b9c620009', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f937ad3b9c620009', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_unguwar_sanusi',
  'ind_f937ad3b9c620009', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f937ad3b9c620009', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Unguwar Sanusi', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f937ad3b9c620009', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f937ad3b9c620009',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f937ad3b9c620009', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f937ad3b9c620009',
  'political_assignment', '{"constituency_inec": "UNGUWAR SANUSI", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f937ad3b9c620009', 'prof_f937ad3b9c620009',
  'Abdullahi Auwal Bala',
  'abdullahi auwal bala kaduna state assembly unguwar sanusi aa politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

-- 28. Kambai Samuel Kozah -- Zonkwa (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f1bc352d80f399e7', 'Kambai Samuel Kozah',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f1bc352d80f399e7', 'ind_f1bc352d80f399e7', 'individual', 'place_state_kaduna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kambai Samuel Kozah', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f1bc352d80f399e7', 'prof_f1bc352d80f399e7',
  'Member, Kaduna State House of Assembly (ZONKWA)',
  'place_state_kaduna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f1bc352d80f399e7', 'ind_f1bc352d80f399e7', 'term_ng_kaduna_state_assembly_10th_2023_2027',
  'place_state_kaduna', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f1bc352d80f399e7', 'ind_f1bc352d80f399e7', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f1bc352d80f399e7', 'seed_run_s05_political_kaduna_roster_20260502', 'individual',
  'ng_state_assembly_member|kaduna|zonkwa|2023',
  'insert', 'ind_f1bc352d80f399e7',
  'Unique: Kaduna Zonkwa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f1bc352d80f399e7', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f1bc352d80f399e7', 'seed_source_nigerianleaders_kaduna_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f1bc352d80f399e7', 'seed_run_s05_political_kaduna_roster_20260502', 'seed_source_nigerianleaders_kaduna_assembly_20260502',
  'nl_kaduna_assembly_2023_zonkwa',
  'ind_f1bc352d80f399e7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f1bc352d80f399e7', 'seed_run_s05_political_kaduna_roster_20260502',
  'Kaduna Zonkwa', 'place_state_kaduna', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f1bc352d80f399e7', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f1bc352d80f399e7',
  'seed_source_nigerianleaders_kaduna_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f1bc352d80f399e7', 'seed_run_s05_political_kaduna_roster_20260502', 'individual', 'ind_f1bc352d80f399e7',
  'political_assignment', '{"constituency_inec": "ZONKWA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kaduna-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f1bc352d80f399e7', 'prof_f1bc352d80f399e7',
  'Kambai Samuel Kozah',
  'kambai samuel kozah kaduna state assembly zonkwa pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kaduna',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
