-- ============================================================
-- Migration 0514: Enugu State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Enugu State House of Assembly Members
-- Members seeded: 24/24
-- Party breakdown: LP:14, PDP:10
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;

BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_enugu_assembly_20260502',
  'NigerianLeaders – Complete List of Enugu State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/enugu-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_enugu_roster_20260502', 'S05 Batch – Enugu State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_enugu_roster_20260502',
  'seed_run_s05_political_enugu_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0514_political_enugu_assembly_full_roster_seed.sql',
  NULL, 24,
  '24/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_enugu_state_assembly_10th_2023_2027',
  'Enugu State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_enugu',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (24 of 24 seats) ──────────────────────────────────────

-- 01. Aneke Okechukwu H -- Udi-South Constituency (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ce8f2bd396dc965d', 'Aneke Okechukwu H',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ce8f2bd396dc965d', 'ind_ce8f2bd396dc965d', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aneke Okechukwu H', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ce8f2bd396dc965d', 'prof_ce8f2bd396dc965d',
  'Member, Enugu State House of Assembly (UDI-SOUTH CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ce8f2bd396dc965d', 'ind_ce8f2bd396dc965d', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ce8f2bd396dc965d', 'ind_ce8f2bd396dc965d', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ce8f2bd396dc965d', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|udi-south constituency|2023',
  'insert', 'ind_ce8f2bd396dc965d',
  'Unique: Enugu Udi-South Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ce8f2bd396dc965d', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_ce8f2bd396dc965d', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ce8f2bd396dc965d', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_udi-south_constituency',
  'ind_ce8f2bd396dc965d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ce8f2bd396dc965d', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Udi-South Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ce8f2bd396dc965d', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_ce8f2bd396dc965d',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ce8f2bd396dc965d', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_ce8f2bd396dc965d',
  'political_assignment', '{"constituency_inec": "UDI-SOUTH CONSTITUENCY", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ce8f2bd396dc965d', 'prof_ce8f2bd396dc965d',
  'Aneke Okechukwu H',
  'aneke okechukwu h enugu state assembly udi-south constituency pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Ugwu Callitus Uche -- Udi-North Constituency (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_79a7cf4712b75cfb', 'Ugwu Callitus Uche',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_79a7cf4712b75cfb', 'ind_79a7cf4712b75cfb', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ugwu Callitus Uche', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_79a7cf4712b75cfb', 'prof_79a7cf4712b75cfb',
  'Member, Enugu State House of Assembly (UDI-NORTH CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_79a7cf4712b75cfb', 'ind_79a7cf4712b75cfb', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_79a7cf4712b75cfb', 'ind_79a7cf4712b75cfb', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_79a7cf4712b75cfb', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|udi-north constituency|2023',
  'insert', 'ind_79a7cf4712b75cfb',
  'Unique: Enugu Udi-North Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_79a7cf4712b75cfb', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_79a7cf4712b75cfb', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_79a7cf4712b75cfb', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_udi-north_constituency',
  'ind_79a7cf4712b75cfb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_79a7cf4712b75cfb', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Udi-North Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_79a7cf4712b75cfb', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_79a7cf4712b75cfb',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_79a7cf4712b75cfb', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_79a7cf4712b75cfb',
  'political_assignment', '{"constituency_inec": "UDI-NORTH CONSTITUENCY", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_79a7cf4712b75cfb', 'prof_79a7cf4712b75cfb',
  'Ugwu Callitus Uche',
  'ugwu callitus uche enugu state assembly udi-north constituency pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Udefuna Chukwudi -- Ezeagu Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_867099fa5fd77413', 'Udefuna Chukwudi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_867099fa5fd77413', 'ind_867099fa5fd77413', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Udefuna Chukwudi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_867099fa5fd77413', 'prof_867099fa5fd77413',
  'Member, Enugu State House of Assembly (EZEAGU CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_867099fa5fd77413', 'ind_867099fa5fd77413', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_867099fa5fd77413', 'ind_867099fa5fd77413', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_867099fa5fd77413', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|ezeagu constituency|2023',
  'insert', 'ind_867099fa5fd77413',
  'Unique: Enugu Ezeagu Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_867099fa5fd77413', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_867099fa5fd77413', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_867099fa5fd77413', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_ezeagu_constituency',
  'ind_867099fa5fd77413', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_867099fa5fd77413', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Ezeagu Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_867099fa5fd77413', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_867099fa5fd77413',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_867099fa5fd77413', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_867099fa5fd77413',
  'political_assignment', '{"constituency_inec": "EZEAGU CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_867099fa5fd77413', 'prof_867099fa5fd77413',
  'Udefuna Chukwudi',
  'udefuna chukwudi enugu state assembly ezeagu constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Ugwu Raymond -- Enugu East II Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_901726afd8459494', 'Ugwu Raymond',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_901726afd8459494', 'ind_901726afd8459494', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ugwu Raymond', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_901726afd8459494', 'prof_901726afd8459494',
  'Member, Enugu State House of Assembly (ENUGU EAST II CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_901726afd8459494', 'ind_901726afd8459494', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_901726afd8459494', 'ind_901726afd8459494', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_901726afd8459494', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|enugu east ii constituency|2023',
  'insert', 'ind_901726afd8459494',
  'Unique: Enugu Enugu East II Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_901726afd8459494', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_901726afd8459494', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_901726afd8459494', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_enugu_east_ii_constituency',
  'ind_901726afd8459494', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_901726afd8459494', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Enugu East II Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_901726afd8459494', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_901726afd8459494',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_901726afd8459494', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_901726afd8459494',
  'political_assignment', '{"constituency_inec": "ENUGU EAST II CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_901726afd8459494', 'prof_901726afd8459494',
  'Ugwu Raymond',
  'ugwu raymond enugu state assembly enugu east ii constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Ugwu Obiajulu P. -- Enugu South II Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c52af392693b66e9', 'Ugwu Obiajulu P.',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c52af392693b66e9', 'ind_c52af392693b66e9', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ugwu Obiajulu P.', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c52af392693b66e9', 'prof_c52af392693b66e9',
  'Member, Enugu State House of Assembly (ENUGU SOUTH II CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c52af392693b66e9', 'ind_c52af392693b66e9', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c52af392693b66e9', 'ind_c52af392693b66e9', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c52af392693b66e9', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|enugu south ii constituency|2023',
  'insert', 'ind_c52af392693b66e9',
  'Unique: Enugu Enugu South II Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c52af392693b66e9', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_c52af392693b66e9', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c52af392693b66e9', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_enugu_south_ii_constituency',
  'ind_c52af392693b66e9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c52af392693b66e9', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Enugu South II Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c52af392693b66e9', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_c52af392693b66e9',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c52af392693b66e9', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_c52af392693b66e9',
  'political_assignment', '{"constituency_inec": "ENUGU SOUTH II CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c52af392693b66e9', 'prof_c52af392693b66e9',
  'Ugwu Obiajulu P.',
  'ugwu obiajulu p. enugu state assembly enugu south ii constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Ngene Bright Emeka -- Enugu South I Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_496d9ccb75a350ad', 'Ngene Bright Emeka',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_496d9ccb75a350ad', 'ind_496d9ccb75a350ad', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ngene Bright Emeka', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_496d9ccb75a350ad', 'prof_496d9ccb75a350ad',
  'Member, Enugu State House of Assembly (ENUGU SOUTH I CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_496d9ccb75a350ad', 'ind_496d9ccb75a350ad', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_496d9ccb75a350ad', 'ind_496d9ccb75a350ad', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_496d9ccb75a350ad', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|enugu south i constituency|2023',
  'insert', 'ind_496d9ccb75a350ad',
  'Unique: Enugu Enugu South I Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_496d9ccb75a350ad', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_496d9ccb75a350ad', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_496d9ccb75a350ad', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_enugu_south_i_constituency',
  'ind_496d9ccb75a350ad', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_496d9ccb75a350ad', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Enugu South I Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_496d9ccb75a350ad', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_496d9ccb75a350ad',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_496d9ccb75a350ad', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_496d9ccb75a350ad',
  'political_assignment', '{"constituency_inec": "ENUGU SOUTH I CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_496d9ccb75a350ad', 'prof_496d9ccb75a350ad',
  'Ngene Bright Emeka',
  'ngene bright emeka enugu state assembly enugu south i constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Aniagu Iloabuchi -- Nkanu West Constituency (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_dc801afe567bb8d2', 'Aniagu Iloabuchi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_dc801afe567bb8d2', 'ind_dc801afe567bb8d2', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aniagu Iloabuchi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_dc801afe567bb8d2', 'prof_dc801afe567bb8d2',
  'Member, Enugu State House of Assembly (NKANU WEST CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_dc801afe567bb8d2', 'ind_dc801afe567bb8d2', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_dc801afe567bb8d2', 'ind_dc801afe567bb8d2', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_dc801afe567bb8d2', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|nkanu west constituency|2023',
  'insert', 'ind_dc801afe567bb8d2',
  'Unique: Enugu Nkanu West Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_dc801afe567bb8d2', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_dc801afe567bb8d2', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_dc801afe567bb8d2', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_nkanu_west_constituency',
  'ind_dc801afe567bb8d2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_dc801afe567bb8d2', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Nkanu West Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_dc801afe567bb8d2', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_dc801afe567bb8d2',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_dc801afe567bb8d2', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_dc801afe567bb8d2',
  'political_assignment', '{"constituency_inec": "NKANU WEST CONSTITUENCY", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_dc801afe567bb8d2', 'prof_dc801afe567bb8d2',
  'Aniagu Iloabuchi',
  'aniagu iloabuchi enugu state assembly nkanu west constituency pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Mba Okechukwu -- Nkanu East Constituency (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_84d10ffa1d7942e9', 'Mba Okechukwu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_84d10ffa1d7942e9', 'ind_84d10ffa1d7942e9', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mba Okechukwu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_84d10ffa1d7942e9', 'prof_84d10ffa1d7942e9',
  'Member, Enugu State House of Assembly (NKANU EAST CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_84d10ffa1d7942e9', 'ind_84d10ffa1d7942e9', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_84d10ffa1d7942e9', 'ind_84d10ffa1d7942e9', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_84d10ffa1d7942e9', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|nkanu east constituency|2023',
  'insert', 'ind_84d10ffa1d7942e9',
  'Unique: Enugu Nkanu East Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_84d10ffa1d7942e9', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_84d10ffa1d7942e9', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_84d10ffa1d7942e9', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_nkanu_east_constituency',
  'ind_84d10ffa1d7942e9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_84d10ffa1d7942e9', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Nkanu East Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_84d10ffa1d7942e9', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_84d10ffa1d7942e9',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_84d10ffa1d7942e9', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_84d10ffa1d7942e9',
  'political_assignment', '{"constituency_inec": "NKANU EAST CONSTITUENCY", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_84d10ffa1d7942e9', 'prof_84d10ffa1d7942e9',
  'Mba Okechukwu',
  'mba okechukwu enugu state assembly nkanu east constituency pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Ekwueme Chukwuma -- Uzo-Uwani Constituency (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_187788d64ebf280e', 'Ekwueme Chukwuma',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_187788d64ebf280e', 'ind_187788d64ebf280e', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ekwueme Chukwuma', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_187788d64ebf280e', 'prof_187788d64ebf280e',
  'Member, Enugu State House of Assembly (UZO-UWANI CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_187788d64ebf280e', 'ind_187788d64ebf280e', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_187788d64ebf280e', 'ind_187788d64ebf280e', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_187788d64ebf280e', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|uzo-uwani constituency|2023',
  'insert', 'ind_187788d64ebf280e',
  'Unique: Enugu Uzo-Uwani Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_187788d64ebf280e', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_187788d64ebf280e', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_187788d64ebf280e', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_uzo-uwani_constituency',
  'ind_187788d64ebf280e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_187788d64ebf280e', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Uzo-Uwani Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_187788d64ebf280e', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_187788d64ebf280e',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_187788d64ebf280e', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_187788d64ebf280e',
  'political_assignment', '{"constituency_inec": "UZO-UWANI CONSTITUENCY", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_187788d64ebf280e', 'prof_187788d64ebf280e',
  'Ekwueme Chukwuma',
  'ekwueme chukwuma enugu state assembly uzo-uwani constituency pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Ogara Harrison -- Igbo-Eze South Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e6fc36c4ad951870', 'Ogara Harrison',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e6fc36c4ad951870', 'ind_e6fc36c4ad951870', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogara Harrison', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e6fc36c4ad951870', 'prof_e6fc36c4ad951870',
  'Member, Enugu State House of Assembly (IGBO-EZE SOUTH CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e6fc36c4ad951870', 'ind_e6fc36c4ad951870', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e6fc36c4ad951870', 'ind_e6fc36c4ad951870', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e6fc36c4ad951870', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|igbo-eze south constituency|2023',
  'insert', 'ind_e6fc36c4ad951870',
  'Unique: Enugu Igbo-Eze South Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e6fc36c4ad951870', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_e6fc36c4ad951870', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e6fc36c4ad951870', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_igbo-eze_south_constituency',
  'ind_e6fc36c4ad951870', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e6fc36c4ad951870', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Igbo-Eze South Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e6fc36c4ad951870', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_e6fc36c4ad951870',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e6fc36c4ad951870', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_e6fc36c4ad951870',
  'political_assignment', '{"constituency_inec": "IGBO-EZE SOUTH CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e6fc36c4ad951870', 'prof_e6fc36c4ad951870',
  'Ogara Harrison',
  'ogara harrison enugu state assembly igbo-eze south constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Eze Ejikeme -- Igbo-Eze North I Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f6a2b74d33905f96', 'Eze Ejikeme',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f6a2b74d33905f96', 'ind_f6a2b74d33905f96', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Eze Ejikeme', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f6a2b74d33905f96', 'prof_f6a2b74d33905f96',
  'Member, Enugu State House of Assembly (IGBO-EZE NORTH I CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f6a2b74d33905f96', 'ind_f6a2b74d33905f96', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f6a2b74d33905f96', 'ind_f6a2b74d33905f96', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f6a2b74d33905f96', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|igbo-eze north i constituency|2023',
  'insert', 'ind_f6a2b74d33905f96',
  'Unique: Enugu Igbo-Eze North I Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f6a2b74d33905f96', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_f6a2b74d33905f96', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f6a2b74d33905f96', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_igbo-eze_north_i_constituency',
  'ind_f6a2b74d33905f96', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f6a2b74d33905f96', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Igbo-Eze North I Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f6a2b74d33905f96', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_f6a2b74d33905f96',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f6a2b74d33905f96', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_f6a2b74d33905f96',
  'political_assignment', '{"constituency_inec": "IGBO-EZE NORTH I CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f6a2b74d33905f96', 'prof_f6a2b74d33905f96',
  'Eze Ejikeme',
  'eze ejikeme enugu state assembly igbo-eze north i constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Okoh Osita -- Enugu East I Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_65701a3e624c9331', 'Okoh Osita',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_65701a3e624c9331', 'ind_65701a3e624c9331', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okoh Osita', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_65701a3e624c9331', 'prof_65701a3e624c9331',
  'Member, Enugu State House of Assembly (ENUGU EAST I CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_65701a3e624c9331', 'ind_65701a3e624c9331', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_65701a3e624c9331', 'ind_65701a3e624c9331', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_65701a3e624c9331', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|enugu east i constituency|2023',
  'insert', 'ind_65701a3e624c9331',
  'Unique: Enugu Enugu East I Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_65701a3e624c9331', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_65701a3e624c9331', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_65701a3e624c9331', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_enugu_east_i_constituency',
  'ind_65701a3e624c9331', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_65701a3e624c9331', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Enugu East I Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_65701a3e624c9331', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_65701a3e624c9331',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_65701a3e624c9331', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_65701a3e624c9331',
  'political_assignment', '{"constituency_inec": "ENUGU EAST I CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_65701a3e624c9331', 'prof_65701a3e624c9331',
  'Okoh Osita',
  'okoh osita enugu state assembly enugu east i constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Ezugwu Onyekachi -- Nsukka East Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_170765eb9cc775a0', 'Ezugwu Onyekachi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_170765eb9cc775a0', 'ind_170765eb9cc775a0', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ezugwu Onyekachi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_170765eb9cc775a0', 'prof_170765eb9cc775a0',
  'Member, Enugu State House of Assembly (NSUKKA EAST CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_170765eb9cc775a0', 'ind_170765eb9cc775a0', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_170765eb9cc775a0', 'ind_170765eb9cc775a0', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_170765eb9cc775a0', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|nsukka east constituency|2023',
  'insert', 'ind_170765eb9cc775a0',
  'Unique: Enugu Nsukka East Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_170765eb9cc775a0', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_170765eb9cc775a0', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_170765eb9cc775a0', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_nsukka_east_constituency',
  'ind_170765eb9cc775a0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_170765eb9cc775a0', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Nsukka East Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_170765eb9cc775a0', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_170765eb9cc775a0',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_170765eb9cc775a0', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_170765eb9cc775a0',
  'political_assignment', '{"constituency_inec": "NSUKKA EAST CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_170765eb9cc775a0', 'prof_170765eb9cc775a0',
  'Ezugwu Onyekachi',
  'ezugwu onyekachi enugu state assembly nsukka east constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Osita Eze -- Oji-River Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c2aae7b876f3409b', 'Osita Eze',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c2aae7b876f3409b', 'ind_c2aae7b876f3409b', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Osita Eze', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c2aae7b876f3409b', 'prof_c2aae7b876f3409b',
  'Member, Enugu State House of Assembly (OJI-RIVER CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c2aae7b876f3409b', 'ind_c2aae7b876f3409b', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c2aae7b876f3409b', 'ind_c2aae7b876f3409b', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c2aae7b876f3409b', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|oji-river constituency|2023',
  'insert', 'ind_c2aae7b876f3409b',
  'Unique: Enugu Oji-River Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c2aae7b876f3409b', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_c2aae7b876f3409b', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c2aae7b876f3409b', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_oji-river_constituency',
  'ind_c2aae7b876f3409b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c2aae7b876f3409b', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Oji-River Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c2aae7b876f3409b', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_c2aae7b876f3409b',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c2aae7b876f3409b', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_c2aae7b876f3409b',
  'political_assignment', '{"constituency_inec": "OJI-RIVER CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c2aae7b876f3409b', 'prof_c2aae7b876f3409b',
  'Osita Eze',
  'osita eze enugu state assembly oji-river constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Eneh Jane Chinwe -- Awgu North Constituency (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1a1a5d562b5a4b58', 'Eneh Jane Chinwe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1a1a5d562b5a4b58', 'ind_1a1a5d562b5a4b58', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Eneh Jane Chinwe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1a1a5d562b5a4b58', 'prof_1a1a5d562b5a4b58',
  'Member, Enugu State House of Assembly (AWGU NORTH CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1a1a5d562b5a4b58', 'ind_1a1a5d562b5a4b58', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1a1a5d562b5a4b58', 'ind_1a1a5d562b5a4b58', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1a1a5d562b5a4b58', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|awgu north constituency|2023',
  'insert', 'ind_1a1a5d562b5a4b58',
  'Unique: Enugu Awgu North Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1a1a5d562b5a4b58', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_1a1a5d562b5a4b58', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1a1a5d562b5a4b58', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_awgu_north_constituency',
  'ind_1a1a5d562b5a4b58', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1a1a5d562b5a4b58', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Awgu North Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1a1a5d562b5a4b58', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_1a1a5d562b5a4b58',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1a1a5d562b5a4b58', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_1a1a5d562b5a4b58',
  'political_assignment', '{"constituency_inec": "AWGU NORTH CONSTITUENCY", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1a1a5d562b5a4b58', 'prof_1a1a5d562b5a4b58',
  'Eneh Jane Chinwe',
  'eneh jane chinwe enugu state assembly awgu north constituency pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Ede Magnus -- Aninri Constituency (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a0d85fe50fa9588b', 'Ede Magnus',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a0d85fe50fa9588b', 'ind_a0d85fe50fa9588b', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ede Magnus', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a0d85fe50fa9588b', 'prof_a0d85fe50fa9588b',
  'Member, Enugu State House of Assembly (ANINRI CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a0d85fe50fa9588b', 'ind_a0d85fe50fa9588b', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a0d85fe50fa9588b', 'ind_a0d85fe50fa9588b', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a0d85fe50fa9588b', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|aninri constituency|2023',
  'insert', 'ind_a0d85fe50fa9588b',
  'Unique: Enugu Aninri Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a0d85fe50fa9588b', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_a0d85fe50fa9588b', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a0d85fe50fa9588b', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_aninri_constituency',
  'ind_a0d85fe50fa9588b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a0d85fe50fa9588b', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Aninri Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a0d85fe50fa9588b', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_a0d85fe50fa9588b',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a0d85fe50fa9588b', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_a0d85fe50fa9588b',
  'political_assignment', '{"constituency_inec": "ANINRI CONSTITUENCY", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a0d85fe50fa9588b', 'prof_a0d85fe50fa9588b',
  'Ede Magnus',
  'ede magnus enugu state assembly aninri constituency pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Nwankwo Anthony -- Awgu South Constituency (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d51a553054a76571', 'Nwankwo Anthony',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d51a553054a76571', 'ind_d51a553054a76571', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwankwo Anthony', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d51a553054a76571', 'prof_d51a553054a76571',
  'Member, Enugu State House of Assembly (AWGU SOUTH CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d51a553054a76571', 'ind_d51a553054a76571', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d51a553054a76571', 'ind_d51a553054a76571', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d51a553054a76571', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|awgu south constituency|2023',
  'insert', 'ind_d51a553054a76571',
  'Unique: Enugu Awgu South Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d51a553054a76571', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_d51a553054a76571', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d51a553054a76571', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_awgu_south_constituency',
  'ind_d51a553054a76571', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d51a553054a76571', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Awgu South Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d51a553054a76571', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_d51a553054a76571',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d51a553054a76571', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_d51a553054a76571',
  'political_assignment', '{"constituency_inec": "AWGU SOUTH CONSTITUENCY", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d51a553054a76571', 'prof_d51a553054a76571',
  'Nwankwo Anthony',
  'nwankwo anthony enugu state assembly awgu south constituency pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Ijere Obinna Anthony -- Udenu Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_763e04093ba803fa', 'Ijere Obinna Anthony',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_763e04093ba803fa', 'ind_763e04093ba803fa', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ijere Obinna Anthony', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_763e04093ba803fa', 'prof_763e04093ba803fa',
  'Member, Enugu State House of Assembly (UDENU CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_763e04093ba803fa', 'ind_763e04093ba803fa', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_763e04093ba803fa', 'ind_763e04093ba803fa', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_763e04093ba803fa', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|udenu constituency|2023',
  'insert', 'ind_763e04093ba803fa',
  'Unique: Enugu Udenu Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_763e04093ba803fa', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_763e04093ba803fa', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_763e04093ba803fa', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_udenu_constituency',
  'ind_763e04093ba803fa', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_763e04093ba803fa', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Udenu Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_763e04093ba803fa', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_763e04093ba803fa',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_763e04093ba803fa', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_763e04093ba803fa',
  'political_assignment', '{"constituency_inec": "UDENU CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_763e04093ba803fa', 'prof_763e04093ba803fa',
  'Ijere Obinna Anthony',
  'ijere obinna anthony enugu state assembly udenu constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Onyechi Malachi Okey -- Nsukka West Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_80fec50a404126c1', 'Onyechi Malachi Okey',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_80fec50a404126c1', 'ind_80fec50a404126c1', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Onyechi Malachi Okey', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_80fec50a404126c1', 'prof_80fec50a404126c1',
  'Member, Enugu State House of Assembly (NSUKKA WEST CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_80fec50a404126c1', 'ind_80fec50a404126c1', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_80fec50a404126c1', 'ind_80fec50a404126c1', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_80fec50a404126c1', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|nsukka west constituency|2023',
  'insert', 'ind_80fec50a404126c1',
  'Unique: Enugu Nsukka West Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_80fec50a404126c1', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_80fec50a404126c1', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_80fec50a404126c1', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_nsukka_west_constituency',
  'ind_80fec50a404126c1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_80fec50a404126c1', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Nsukka West Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_80fec50a404126c1', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_80fec50a404126c1',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_80fec50a404126c1', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_80fec50a404126c1',
  'political_assignment', '{"constituency_inec": "NSUKKA WEST CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_80fec50a404126c1', 'prof_80fec50a404126c1',
  'Onyechi Malachi Okey',
  'onyechi malachi okey enugu state assembly nsukka west constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Amuka Williams -- Igbo-Etiti West Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5b95e5d67f574fc9', 'Amuka Williams',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5b95e5d67f574fc9', 'ind_5b95e5d67f574fc9', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Amuka Williams', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5b95e5d67f574fc9', 'prof_5b95e5d67f574fc9',
  'Member, Enugu State House of Assembly (IGBO-ETITI WEST CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5b95e5d67f574fc9', 'ind_5b95e5d67f574fc9', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5b95e5d67f574fc9', 'ind_5b95e5d67f574fc9', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5b95e5d67f574fc9', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|igbo-etiti west constituency|2023',
  'insert', 'ind_5b95e5d67f574fc9',
  'Unique: Enugu Igbo-Etiti West Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5b95e5d67f574fc9', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_5b95e5d67f574fc9', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5b95e5d67f574fc9', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_igbo-etiti_west_constituency',
  'ind_5b95e5d67f574fc9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5b95e5d67f574fc9', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Igbo-Etiti West Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5b95e5d67f574fc9', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_5b95e5d67f574fc9',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5b95e5d67f574fc9', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_5b95e5d67f574fc9',
  'political_assignment', '{"constituency_inec": "IGBO-ETITI WEST CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5b95e5d67f574fc9', 'prof_5b95e5d67f574fc9',
  'Amuka Williams',
  'amuka williams enugu state assembly igbo-etiti west constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Ani Johnson Samuel -- Enugu North Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c4c3fdd236a8a384', 'Ani Johnson Samuel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c4c3fdd236a8a384', 'ind_c4c3fdd236a8a384', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ani Johnson Samuel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c4c3fdd236a8a384', 'prof_c4c3fdd236a8a384',
  'Member, Enugu State House of Assembly (ENUGU NORTH CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c4c3fdd236a8a384', 'ind_c4c3fdd236a8a384', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c4c3fdd236a8a384', 'ind_c4c3fdd236a8a384', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c4c3fdd236a8a384', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|enugu north constituency|2023',
  'insert', 'ind_c4c3fdd236a8a384',
  'Unique: Enugu Enugu North Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c4c3fdd236a8a384', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_c4c3fdd236a8a384', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c4c3fdd236a8a384', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_enugu_north_constituency',
  'ind_c4c3fdd236a8a384', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c4c3fdd236a8a384', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Enugu North Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c4c3fdd236a8a384', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_c4c3fdd236a8a384',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c4c3fdd236a8a384', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_c4c3fdd236a8a384',
  'political_assignment', '{"constituency_inec": "ENUGU NORTH CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c4c3fdd236a8a384', 'prof_c4c3fdd236a8a384',
  'Ani Johnson Samuel',
  'ani johnson samuel enugu state assembly enugu north constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Eze Gabriel Lebechi -- Isi-Uzo Constituency (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f016c47441b14dfa', 'Eze Gabriel Lebechi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f016c47441b14dfa', 'ind_f016c47441b14dfa', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Eze Gabriel Lebechi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f016c47441b14dfa', 'prof_f016c47441b14dfa',
  'Member, Enugu State House of Assembly (ISI-UZO CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f016c47441b14dfa', 'ind_f016c47441b14dfa', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f016c47441b14dfa', 'ind_f016c47441b14dfa', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f016c47441b14dfa', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|isi-uzo constituency|2023',
  'insert', 'ind_f016c47441b14dfa',
  'Unique: Enugu Isi-Uzo Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f016c47441b14dfa', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_f016c47441b14dfa', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f016c47441b14dfa', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_isi-uzo_constituency',
  'ind_f016c47441b14dfa', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f016c47441b14dfa', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Isi-Uzo Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f016c47441b14dfa', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_f016c47441b14dfa',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f016c47441b14dfa', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_f016c47441b14dfa',
  'political_assignment', '{"constituency_inec": "ISI-UZO CONSTITUENCY", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f016c47441b14dfa', 'prof_f016c47441b14dfa',
  'Eze Gabriel Lebechi',
  'eze gabriel lebechi enugu state assembly isi-uzo constituency lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Ezeani Ezenta -- Igbo-Etiti East Constituency (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1205e832dc59e212', 'Ezeani Ezenta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1205e832dc59e212', 'ind_1205e832dc59e212', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ezeani Ezenta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1205e832dc59e212', 'prof_1205e832dc59e212',
  'Member, Enugu State House of Assembly (IGBO-ETITI EAST CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1205e832dc59e212', 'ind_1205e832dc59e212', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1205e832dc59e212', 'ind_1205e832dc59e212', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1205e832dc59e212', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|igbo-etiti east constituency|2023',
  'insert', 'ind_1205e832dc59e212',
  'Unique: Enugu Igbo-Etiti East Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1205e832dc59e212', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_1205e832dc59e212', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1205e832dc59e212', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_igbo-etiti_east_constituency',
  'ind_1205e832dc59e212', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1205e832dc59e212', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Igbo-Etiti East Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1205e832dc59e212', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_1205e832dc59e212',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1205e832dc59e212', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_1205e832dc59e212',
  'political_assignment', '{"constituency_inec": "IGBO-ETITI EAST CONSTITUENCY", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1205e832dc59e212', 'prof_1205e832dc59e212',
  'Ezeani Ezenta',
  'ezeani ezenta enugu state assembly igbo-etiti east constituency pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Obe Clifford Nnaemeka -- Igbo-Eze North Constituency (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e69726ac02057c9f', 'Obe Clifford Nnaemeka',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e69726ac02057c9f', 'ind_e69726ac02057c9f', 'individual', 'place_state_enugu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Obe Clifford Nnaemeka', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e69726ac02057c9f', 'prof_e69726ac02057c9f',
  'Member, Enugu State House of Assembly (IGBO-EZE NORTH CONSTITUENCY)',
  'place_state_enugu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e69726ac02057c9f', 'ind_e69726ac02057c9f', 'term_ng_enugu_state_assembly_10th_2023_2027',
  'place_state_enugu', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e69726ac02057c9f', 'ind_e69726ac02057c9f', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e69726ac02057c9f', 'seed_run_s05_political_enugu_roster_20260502', 'individual',
  'ng_state_assembly_member|enugu|igbo-eze north constituency|2023',
  'insert', 'ind_e69726ac02057c9f',
  'Unique: Enugu Igbo-Eze North Constituency seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e69726ac02057c9f', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_e69726ac02057c9f', 'seed_source_nigerianleaders_enugu_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e69726ac02057c9f', 'seed_run_s05_political_enugu_roster_20260502', 'seed_source_nigerianleaders_enugu_assembly_20260502',
  'nl_enugu_assembly_2023_igbo-eze_north_constituency',
  'ind_e69726ac02057c9f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e69726ac02057c9f', 'seed_run_s05_political_enugu_roster_20260502',
  'Enugu Igbo-Eze North Constituency', 'place_state_enugu', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e69726ac02057c9f', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_e69726ac02057c9f',
  'seed_source_nigerianleaders_enugu_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e69726ac02057c9f', 'seed_run_s05_political_enugu_roster_20260502', 'individual', 'ind_e69726ac02057c9f',
  'political_assignment', '{"constituency_inec": "IGBO-EZE NORTH CONSTITUENCY", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/enugu-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e69726ac02057c9f', 'prof_e69726ac02057c9f',
  'Obe Clifford Nnaemeka',
  'obe clifford nnaemeka enugu state assembly igbo-eze north constituency pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_enugu',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
