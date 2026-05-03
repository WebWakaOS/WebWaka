-- ============================================================
-- Migration 0469: Ogun State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: OGHA Official – Members of the Ogun State House of Assembly (10th Legislature)
-- Members seeded: 23/26
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_ogha_ogun_assembly_20260502',
  'OGHA Official – Members of the Ogun State House of Assembly (10th Legislature)',
  'editorial_aggregator',
  'https://www.ogha.og.gov.ng/members',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_ogun_roster_20260502', 'S05 Batch 8c – Ogun State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_ogun_roster_20260502',
  'seed_run_s05_political_ogun_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0469_political_ogun_assembly_full_roster_seed.sql',
  NULL, 23,
  '23/26 members seeded; constituency place IDs resolved at state level pending full constituency seed');

-- Term already seeded in 0465 (INSERT OR IGNORE is safe)
INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_ogun_state_assembly_10th_2023_2027',
  'Ogun State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_ogun',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (23 of 26 seats) ──────────────────────────────────────

-- 01. Oludaisi Olusegun Elemide -- Odeda (APC) - Speaker
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_97d27a1264e968d9', 'Oludaisi Olusegun Elemide',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_97d27a1264e968d9', 'ind_97d27a1264e968d9', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oludaisi Olusegun Elemide', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_97d27a1264e968d9', 'prof_97d27a1264e968d9',
  'Member (Speaker), Ogun State House of Assembly (ODEDA)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_97d27a1264e968d9', 'ind_97d27a1264e968d9', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_97d27a1264e968d9', 'ind_97d27a1264e968d9', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_97d27a1264e968d9', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|odeda|2023',
  'insert', 'ind_97d27a1264e968d9',
  'Unique: Ogun Odeda seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_97d27a1264e968d9', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_97d27a1264e968d9', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_97d27a1264e968d9', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_odeda',
  'ind_97d27a1264e968d9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_97d27a1264e968d9', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Odeda', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_97d27a1264e968d9', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_97d27a1264e968d9',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_97d27a1264e968d9', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_97d27a1264e968d9',
  'political_assignment', '{"constituency_inec": "ODEDA", "party_abbrev": "APC", "position": "Speaker", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_97d27a1264e968d9', 'prof_97d27a1264e968d9',
  'Oludaisi Olusegun Elemide',
  'oludaisi olusegun elemide ogun state assembly odeda apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Lateefat Bolanle Ajayi -- Egbado North I (APC) - Deputy Speaker
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6affea5fa517c51d', 'Lateefat Bolanle Ajayi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6affea5fa517c51d', 'ind_6affea5fa517c51d', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lateefat Bolanle Ajayi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6affea5fa517c51d', 'prof_6affea5fa517c51d',
  'Member (Deputy Speaker), Ogun State House of Assembly (EGBADO NORTH I)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6affea5fa517c51d', 'ind_6affea5fa517c51d', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6affea5fa517c51d', 'ind_6affea5fa517c51d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6affea5fa517c51d', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|egbado_north_i|2023',
  'insert', 'ind_6affea5fa517c51d',
  'Unique: Ogun Egbado North I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6affea5fa517c51d', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_6affea5fa517c51d', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6affea5fa517c51d', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_egbado_north_i',
  'ind_6affea5fa517c51d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6affea5fa517c51d', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Egbado North I', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6affea5fa517c51d', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_6affea5fa517c51d',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6affea5fa517c51d', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_6affea5fa517c51d',
  'political_assignment', '{"constituency_inec": "EGBADO NORTH I", "party_abbrev": "APC", "position": "Deputy Speaker", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6affea5fa517c51d', 'prof_6affea5fa517c51d',
  'Lateefat Bolanle Ajayi',
  'lateefat bolanle ajayi ogun state assembly egbado_north_i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Yusuf Sherif Abiodun -- Egbado South (APC) - Majority Leader
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7b03062cf6e2bb6c', 'Yusuf Sherif Abiodun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7b03062cf6e2bb6c', 'ind_7b03062cf6e2bb6c', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yusuf Sherif Abiodun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7b03062cf6e2bb6c', 'prof_7b03062cf6e2bb6c',
  'Member (Majority Leader), Ogun State House of Assembly (EGBADO SOUTH)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7b03062cf6e2bb6c', 'ind_7b03062cf6e2bb6c', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7b03062cf6e2bb6c', 'ind_7b03062cf6e2bb6c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7b03062cf6e2bb6c', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|egbado_south|2023',
  'insert', 'ind_7b03062cf6e2bb6c',
  'Unique: Ogun Egbado South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7b03062cf6e2bb6c', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_7b03062cf6e2bb6c', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7b03062cf6e2bb6c', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_egbado_south',
  'ind_7b03062cf6e2bb6c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7b03062cf6e2bb6c', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Egbado South', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7b03062cf6e2bb6c', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_7b03062cf6e2bb6c',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7b03062cf6e2bb6c', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_7b03062cf6e2bb6c',
  'political_assignment', '{"constituency_inec": "EGBADO SOUTH", "party_abbrev": "APC", "position": "Majority Leader", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7b03062cf6e2bb6c', 'prof_7b03062cf6e2bb6c',
  'Yusuf Sherif Abiodun',
  'yusuf sherif abiodun ogun state assembly egbado_south apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Adeleye Lukman Olalekan -- Odogbolu (PDP) - Minority Leader
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a7ce5ca9749d0bd2', 'Adeleye Lukman Olalekan',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a7ce5ca9749d0bd2', 'ind_a7ce5ca9749d0bd2', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adeleye Lukman Olalekan', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a7ce5ca9749d0bd2', 'prof_a7ce5ca9749d0bd2',
  'Member (Minority Leader), Ogun State House of Assembly (ODOGBOLU)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a7ce5ca9749d0bd2', 'ind_a7ce5ca9749d0bd2', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a7ce5ca9749d0bd2', 'ind_a7ce5ca9749d0bd2', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a7ce5ca9749d0bd2', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|odogbolu|2023',
  'insert', 'ind_a7ce5ca9749d0bd2',
  'Unique: Ogun Odogbolu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a7ce5ca9749d0bd2', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_a7ce5ca9749d0bd2', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a7ce5ca9749d0bd2', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_odogbolu',
  'ind_a7ce5ca9749d0bd2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a7ce5ca9749d0bd2', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Odogbolu', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a7ce5ca9749d0bd2', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_a7ce5ca9749d0bd2',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a7ce5ca9749d0bd2', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_a7ce5ca9749d0bd2',
  'political_assignment', '{"constituency_inec": "ODOGBOLU", "party_abbrev": "PDP", "position": "Minority Leader", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a7ce5ca9749d0bd2', 'prof_a7ce5ca9749d0bd2',
  'Adeleye Lukman Olalekan',
  'adeleye lukman olalekan ogun state assembly odogbolu pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Adeniran Ademola Adeyinka -- Sagamu II (APC) - Deputy Majority Leader
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a3b7116f6caf75e3', 'Adeniran Ademola Adeyinka',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a3b7116f6caf75e3', 'ind_a3b7116f6caf75e3', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adeniran Ademola Adeyinka', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a3b7116f6caf75e3', 'prof_a3b7116f6caf75e3',
  'Member (Deputy Majority Leader), Ogun State House of Assembly (SAGAMU II)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a3b7116f6caf75e3', 'ind_a3b7116f6caf75e3', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a3b7116f6caf75e3', 'ind_a3b7116f6caf75e3', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a3b7116f6caf75e3', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|sagamu_ii|2023',
  'insert', 'ind_a3b7116f6caf75e3',
  'Unique: Ogun Sagamu II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a3b7116f6caf75e3', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_a3b7116f6caf75e3', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a3b7116f6caf75e3', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_sagamu_ii',
  'ind_a3b7116f6caf75e3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a3b7116f6caf75e3', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Sagamu II', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a3b7116f6caf75e3', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_a3b7116f6caf75e3',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a3b7116f6caf75e3', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_a3b7116f6caf75e3',
  'political_assignment', '{"constituency_inec": "SAGAMU II", "party_abbrev": "APC", "position": "Deputy Majority Leader", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a3b7116f6caf75e3', 'prof_a3b7116f6caf75e3',
  'Adeniran Ademola Adeyinka',
  'adeniran ademola adeyinka ogun state assembly sagamu_ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Tella Opeolu Babatunde -- Abeokuta North (APC) - Deputy Chief Whip
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_04bbb98999974883', 'Tella Opeolu Babatunde',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_04bbb98999974883', 'ind_04bbb98999974883', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Tella Opeolu Babatunde', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_04bbb98999974883', 'prof_04bbb98999974883',
  'Member (Deputy Chief Whip), Ogun State House of Assembly (ABEOKUTA NORTH)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_04bbb98999974883', 'ind_04bbb98999974883', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_04bbb98999974883', 'ind_04bbb98999974883', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_04bbb98999974883', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|abeokuta_north|2023',
  'insert', 'ind_04bbb98999974883',
  'Unique: Ogun Abeokuta North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_04bbb98999974883', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_04bbb98999974883', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_04bbb98999974883', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_abeokuta_north',
  'ind_04bbb98999974883', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_04bbb98999974883', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Abeokuta North', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_04bbb98999974883', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_04bbb98999974883',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_04bbb98999974883', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_04bbb98999974883',
  'political_assignment', '{"constituency_inec": "ABEOKUTA NORTH", "party_abbrev": "APC", "position": "Deputy Chief Whip", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_04bbb98999974883', 'prof_04bbb98999974883',
  'Tella Opeolu Babatunde',
  'tella opeolu babatunde ogun state assembly abeokuta_north apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Lukmon Olajide Atobatele -- Abeokuta South I (PDP) - Deputy Minority Leader
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ee4c43f6ef632ca7', 'Lukmon Olajide Atobatele',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ee4c43f6ef632ca7', 'ind_ee4c43f6ef632ca7', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lukmon Olajide Atobatele', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ee4c43f6ef632ca7', 'prof_ee4c43f6ef632ca7',
  'Member (Deputy Minority Leader), Ogun State House of Assembly (ABEOKUTA SOUTH I)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ee4c43f6ef632ca7', 'ind_ee4c43f6ef632ca7', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ee4c43f6ef632ca7', 'ind_ee4c43f6ef632ca7', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ee4c43f6ef632ca7', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|abeokuta_south_i|2023',
  'insert', 'ind_ee4c43f6ef632ca7',
  'Unique: Ogun Abeokuta South I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ee4c43f6ef632ca7', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_ee4c43f6ef632ca7', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ee4c43f6ef632ca7', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_abeokuta_south_i',
  'ind_ee4c43f6ef632ca7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ee4c43f6ef632ca7', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Abeokuta South I', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ee4c43f6ef632ca7', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_ee4c43f6ef632ca7',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ee4c43f6ef632ca7', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_ee4c43f6ef632ca7',
  'political_assignment', '{"constituency_inec": "ABEOKUTA SOUTH I", "party_abbrev": "PDP", "position": "Deputy Minority Leader", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ee4c43f6ef632ca7', 'prof_ee4c43f6ef632ca7',
  'Lukmon Olajide Atobatele',
  'lukmon olajide atobatele ogun state assembly abeokuta_south_i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Bakare Omolola Olanrewaju -- Ijebu-Ode (APC) - Chief Whip
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9fdd75a2805a3a86', 'Bakare Omolola Olanrewaju',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9fdd75a2805a3a86', 'ind_9fdd75a2805a3a86', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bakare Omolola Olanrewaju', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9fdd75a2805a3a86', 'prof_9fdd75a2805a3a86',
  'Member (Chief Whip), Ogun State House of Assembly (IJEBU-ODE)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9fdd75a2805a3a86', 'ind_9fdd75a2805a3a86', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9fdd75a2805a3a86', 'ind_9fdd75a2805a3a86', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9fdd75a2805a3a86', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|ijebu_ode|2023',
  'insert', 'ind_9fdd75a2805a3a86',
  'Unique: Ogun Ijebu-Ode seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9fdd75a2805a3a86', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_9fdd75a2805a3a86', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9fdd75a2805a3a86', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_ijebu_ode',
  'ind_9fdd75a2805a3a86', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9fdd75a2805a3a86', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Ijebu-Ode', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9fdd75a2805a3a86', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_9fdd75a2805a3a86',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9fdd75a2805a3a86', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_9fdd75a2805a3a86',
  'political_assignment', '{"constituency_inec": "IJEBU-ODE", "party_abbrev": "APC", "position": "Chief Whip", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9fdd75a2805a3a86', 'prof_9fdd75a2805a3a86',
  'Bakare Omolola Olanrewaju',
  'bakare omolola olanrewaju ogun state assembly ijebu_ode apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Kashamu AbdulRasheed -- Ijebu North I (PDP) - Minority Whip
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_dc92e7d8e82c11f3', 'Kashamu AbdulRasheed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_dc92e7d8e82c11f3', 'ind_dc92e7d8e82c11f3', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kashamu AbdulRasheed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_dc92e7d8e82c11f3', 'prof_dc92e7d8e82c11f3',
  'Member (Minority Whip), Ogun State House of Assembly (IJEBU NORTH I)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_dc92e7d8e82c11f3', 'ind_dc92e7d8e82c11f3', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_dc92e7d8e82c11f3', 'ind_dc92e7d8e82c11f3', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_dc92e7d8e82c11f3', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|ijebu_north_i|2023',
  'insert', 'ind_dc92e7d8e82c11f3',
  'Unique: Ogun Ijebu North I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_dc92e7d8e82c11f3', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_dc92e7d8e82c11f3', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_dc92e7d8e82c11f3', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_ijebu_north_i',
  'ind_dc92e7d8e82c11f3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_dc92e7d8e82c11f3', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Ijebu North I', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_dc92e7d8e82c11f3', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_dc92e7d8e82c11f3',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_dc92e7d8e82c11f3', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_dc92e7d8e82c11f3',
  'political_assignment', '{"constituency_inec": "IJEBU NORTH I", "party_abbrev": "PDP", "position": "Minority Whip", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_dc92e7d8e82c11f3', 'prof_dc92e7d8e82c11f3',
  'Kashamu AbdulRasheed',
  'kashamu abdulrasheed ogun state assembly ijebu_north_i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Dickson Kolawole Awolaja -- Remo North (PDP) - Deputy Minority Whip
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e571a3bf5103e8c9', 'Dickson Kolawole Awolaja',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e571a3bf5103e8c9', 'ind_e571a3bf5103e8c9', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dickson Kolawole Awolaja', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e571a3bf5103e8c9', 'prof_e571a3bf5103e8c9',
  'Member (Deputy Minority Whip), Ogun State House of Assembly (REMO NORTH)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e571a3bf5103e8c9', 'ind_e571a3bf5103e8c9', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e571a3bf5103e8c9', 'ind_e571a3bf5103e8c9', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e571a3bf5103e8c9', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|remo_north|2023',
  'insert', 'ind_e571a3bf5103e8c9',
  'Unique: Ogun Remo North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e571a3bf5103e8c9', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_e571a3bf5103e8c9', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e571a3bf5103e8c9', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_remo_north',
  'ind_e571a3bf5103e8c9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e571a3bf5103e8c9', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Remo North', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e571a3bf5103e8c9', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_e571a3bf5103e8c9',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e571a3bf5103e8c9', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_e571a3bf5103e8c9',
  'political_assignment', '{"constituency_inec": "REMO NORTH", "party_abbrev": "PDP", "position": "Deputy Minority Whip", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e571a3bf5103e8c9', 'prof_e571a3bf5103e8c9',
  'Dickson Kolawole Awolaja',
  'dickson kolawole awolaja ogun state assembly remo_north pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Sobukanla Olakunle -- Ikenne (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4e8066df4e9ac6f0', 'Sobukanla Olakunle',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4e8066df4e9ac6f0', 'ind_4e8066df4e9ac6f0', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sobukanla Olakunle', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4e8066df4e9ac6f0', 'prof_4e8066df4e9ac6f0',
  'Member, Ogun State House of Assembly (IKENNE)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4e8066df4e9ac6f0', 'ind_4e8066df4e9ac6f0', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4e8066df4e9ac6f0', 'ind_4e8066df4e9ac6f0', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4e8066df4e9ac6f0', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|ikenne|2023',
  'insert', 'ind_4e8066df4e9ac6f0',
  'Unique: Ogun Ikenne seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4e8066df4e9ac6f0', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_4e8066df4e9ac6f0', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4e8066df4e9ac6f0', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_ikenne',
  'ind_4e8066df4e9ac6f0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4e8066df4e9ac6f0', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Ikenne', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4e8066df4e9ac6f0', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_4e8066df4e9ac6f0',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4e8066df4e9ac6f0', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_4e8066df4e9ac6f0',
  'political_assignment', '{"constituency_inec": "IKENNE", "party_abbrev": "APC", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4e8066df4e9ac6f0', 'prof_4e8066df4e9ac6f0',
  'Sobukanla Olakunle',
  'sobukanla olakunle ogun state assembly ikenne apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Wahab Haruna Abiodun -- Egbado North II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3ac7ec72e816c854', 'Wahab Haruna Abiodun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3ac7ec72e816c854', 'ind_3ac7ec72e816c854', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Wahab Haruna Abiodun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3ac7ec72e816c854', 'prof_3ac7ec72e816c854',
  'Member, Ogun State House of Assembly (EGBADO NORTH II)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3ac7ec72e816c854', 'ind_3ac7ec72e816c854', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3ac7ec72e816c854', 'ind_3ac7ec72e816c854', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3ac7ec72e816c854', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|egbado_north_ii|2023',
  'insert', 'ind_3ac7ec72e816c854',
  'Unique: Ogun Egbado North II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3ac7ec72e816c854', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_3ac7ec72e816c854', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3ac7ec72e816c854', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_egbado_north_ii',
  'ind_3ac7ec72e816c854', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3ac7ec72e816c854', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Egbado North II', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3ac7ec72e816c854', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_3ac7ec72e816c854',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3ac7ec72e816c854', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_3ac7ec72e816c854',
  'political_assignment', '{"constituency_inec": "EGBADO NORTH II", "party_abbrev": "APC", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3ac7ec72e816c854', 'prof_3ac7ec72e816c854',
  'Wahab Haruna Abiodun',
  'wahab haruna abiodun ogun state assembly egbado_north_ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Lawal Samusideen -- Ogun Waterside (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_486b26540aedabab', 'Lawal Samusideen',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_486b26540aedabab', 'ind_486b26540aedabab', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lawal Samusideen', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_486b26540aedabab', 'prof_486b26540aedabab',
  'Member, Ogun State House of Assembly (OGUN WATERSIDE)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_486b26540aedabab', 'ind_486b26540aedabab', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_486b26540aedabab', 'ind_486b26540aedabab', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_486b26540aedabab', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|ogun_waterside|2023',
  'insert', 'ind_486b26540aedabab',
  'Unique: Ogun Ogun Waterside seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_486b26540aedabab', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_486b26540aedabab', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_486b26540aedabab', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_ogun_waterside',
  'ind_486b26540aedabab', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_486b26540aedabab', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Ogun Waterside', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_486b26540aedabab', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_486b26540aedabab',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_486b26540aedabab', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_486b26540aedabab',
  'political_assignment', '{"constituency_inec": "OGUN WATERSIDE", "party_abbrev": "APC", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_486b26540aedabab', 'prof_486b26540aedabab',
  'Lawal Samusideen',
  'lawal samusideen ogun state assembly ogun_waterside apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Oyedele Adebisi Jacob -- Ipokia/Idiroko (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_68d8f5ba0fd4df49', 'Oyedele Adebisi Jacob',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_68d8f5ba0fd4df49', 'ind_68d8f5ba0fd4df49', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oyedele Adebisi Jacob', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_68d8f5ba0fd4df49', 'prof_68d8f5ba0fd4df49',
  'Member, Ogun State House of Assembly (IPOKIA/IDIROKO)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_68d8f5ba0fd4df49', 'ind_68d8f5ba0fd4df49', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_68d8f5ba0fd4df49', 'ind_68d8f5ba0fd4df49', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_68d8f5ba0fd4df49', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|ipokia_idiroko|2023',
  'insert', 'ind_68d8f5ba0fd4df49',
  'Unique: Ogun Ipokia/Idiroko seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_68d8f5ba0fd4df49', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_68d8f5ba0fd4df49', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_68d8f5ba0fd4df49', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_ipokia_idiroko',
  'ind_68d8f5ba0fd4df49', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_68d8f5ba0fd4df49', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Ipokia/Idiroko', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_68d8f5ba0fd4df49', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_68d8f5ba0fd4df49',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_68d8f5ba0fd4df49', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_68d8f5ba0fd4df49',
  'political_assignment', '{"constituency_inec": "IPOKIA/IDIROKO", "party_abbrev": "APC", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_68d8f5ba0fd4df49', 'prof_68d8f5ba0fd4df49',
  'Oyedele Adebisi Jacob',
  'oyedele adebisi jacob ogun state assembly ipokia_idiroko apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Ayodele Wasiu Sunday -- Abeokuta South II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8b471d52b80ed45d', 'Ayodele Wasiu Sunday',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8b471d52b80ed45d', 'ind_8b471d52b80ed45d', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ayodele Wasiu Sunday', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8b471d52b80ed45d', 'prof_8b471d52b80ed45d',
  'Member, Ogun State House of Assembly (ABEOKUTA SOUTH II)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8b471d52b80ed45d', 'ind_8b471d52b80ed45d', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8b471d52b80ed45d', 'ind_8b471d52b80ed45d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8b471d52b80ed45d', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|abeokuta_south_ii|2023',
  'insert', 'ind_8b471d52b80ed45d',
  'Unique: Ogun Abeokuta South II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8b471d52b80ed45d', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_8b471d52b80ed45d', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8b471d52b80ed45d', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_abeokuta_south_ii',
  'ind_8b471d52b80ed45d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8b471d52b80ed45d', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Abeokuta South II', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8b471d52b80ed45d', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_8b471d52b80ed45d',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8b471d52b80ed45d', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_8b471d52b80ed45d',
  'political_assignment', '{"constituency_inec": "ABEOKUTA SOUTH II", "party_abbrev": "APC", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8b471d52b80ed45d', 'prof_8b471d52b80ed45d',
  'Ayodele Wasiu Sunday',
  'ayodele wasiu sunday ogun state assembly abeokuta_south_ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Adesanya Oluseun Samuel -- Ijebu North East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_90e3c5a532f89802', 'Adesanya Oluseun Samuel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_90e3c5a532f89802', 'ind_90e3c5a532f89802', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adesanya Oluseun Samuel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_90e3c5a532f89802', 'prof_90e3c5a532f89802',
  'Member, Ogun State House of Assembly (IJEBU NORTH EAST)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_90e3c5a532f89802', 'ind_90e3c5a532f89802', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_90e3c5a532f89802', 'ind_90e3c5a532f89802', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_90e3c5a532f89802', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|ijebu_north_east|2023',
  'insert', 'ind_90e3c5a532f89802',
  'Unique: Ogun Ijebu North East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_90e3c5a532f89802', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_90e3c5a532f89802', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_90e3c5a532f89802', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_ijebu_north_east',
  'ind_90e3c5a532f89802', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_90e3c5a532f89802', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Ijebu North East', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_90e3c5a532f89802', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_90e3c5a532f89802',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_90e3c5a532f89802', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_90e3c5a532f89802',
  'political_assignment', '{"constituency_inec": "IJEBU NORTH EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_90e3c5a532f89802', 'prof_90e3c5a532f89802',
  'Adesanya Oluseun Samuel',
  'adesanya oluseun samuel ogun state assembly ijebu_north_east apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Lamidi Musefiu Olatunji -- Ado-Odo/Ota II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c6793ce04d331817', 'Lamidi Musefiu Olatunji',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c6793ce04d331817', 'ind_c6793ce04d331817', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lamidi Musefiu Olatunji', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c6793ce04d331817', 'prof_c6793ce04d331817',
  'Member, Ogun State House of Assembly (ADO-ODO/OTA II)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c6793ce04d331817', 'ind_c6793ce04d331817', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c6793ce04d331817', 'ind_c6793ce04d331817', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c6793ce04d331817', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|ado_odo_ota_ii|2023',
  'insert', 'ind_c6793ce04d331817',
  'Unique: Ogun Ado-Odo/Ota II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c6793ce04d331817', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_c6793ce04d331817', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c6793ce04d331817', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_ado_odo_ota_ii',
  'ind_c6793ce04d331817', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c6793ce04d331817', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Ado-Odo/Ota II', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c6793ce04d331817', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_c6793ce04d331817',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c6793ce04d331817', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_c6793ce04d331817',
  'political_assignment', '{"constituency_inec": "ADO-ODO/OTA II", "party_abbrev": "APC", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c6793ce04d331817', 'prof_c6793ce04d331817',
  'Lamidi Musefiu Olatunji',
  'lamidi musefiu olatunji ogun state assembly ado_odo_ota_ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Bello Mohammed Oluwadamilare -- Sagamu I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_071ecea7fa306bbb', 'Bello Mohammed Oluwadamilare',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_071ecea7fa306bbb', 'ind_071ecea7fa306bbb', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bello Mohammed Oluwadamilare', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_071ecea7fa306bbb', 'prof_071ecea7fa306bbb',
  'Member, Ogun State House of Assembly (SAGAMU I)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_071ecea7fa306bbb', 'ind_071ecea7fa306bbb', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_071ecea7fa306bbb', 'ind_071ecea7fa306bbb', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_071ecea7fa306bbb', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|sagamu_i|2023',
  'insert', 'ind_071ecea7fa306bbb',
  'Unique: Ogun Sagamu I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_071ecea7fa306bbb', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_071ecea7fa306bbb', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_071ecea7fa306bbb', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_sagamu_i',
  'ind_071ecea7fa306bbb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_071ecea7fa306bbb', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Sagamu I', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_071ecea7fa306bbb', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_071ecea7fa306bbb',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_071ecea7fa306bbb', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_071ecea7fa306bbb',
  'political_assignment', '{"constituency_inec": "SAGAMU I", "party_abbrev": "APC", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_071ecea7fa306bbb', 'prof_071ecea7fa306bbb',
  'Bello Mohammed Oluwadamilare',
  'bello mohammed oluwadamilare ogun state assembly sagamu_i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Soneye Damilola Kayode -- Obafemi/Owode (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9486edec74546970', 'Soneye Damilola Kayode',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9486edec74546970', 'ind_9486edec74546970', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Soneye Damilola Kayode', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9486edec74546970', 'prof_9486edec74546970',
  'Member, Ogun State House of Assembly (OBAFEMI/OWODE)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9486edec74546970', 'ind_9486edec74546970', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9486edec74546970', 'ind_9486edec74546970', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9486edec74546970', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|obafemi_owode|2023',
  'insert', 'ind_9486edec74546970',
  'Unique: Ogun Obafemi/Owode seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9486edec74546970', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_9486edec74546970', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9486edec74546970', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_obafemi_owode',
  'ind_9486edec74546970', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9486edec74546970', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Obafemi/Owode', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9486edec74546970', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_9486edec74546970',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9486edec74546970', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_9486edec74546970',
  'political_assignment', '{"constituency_inec": "OBAFEMI/OWODE", "party_abbrev": "APC", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9486edec74546970', 'prof_9486edec74546970',
  'Soneye Damilola Kayode',
  'soneye damilola kayode ogun state assembly obafemi_owode apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Amosun Yusuf Olawale -- Ewekoro (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4d29ab5770b616a6', 'Amosun Yusuf Olawale',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4d29ab5770b616a6', 'ind_4d29ab5770b616a6', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Amosun Yusuf Olawale', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4d29ab5770b616a6', 'prof_4d29ab5770b616a6',
  'Member, Ogun State House of Assembly (EWEKORO)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4d29ab5770b616a6', 'ind_4d29ab5770b616a6', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4d29ab5770b616a6', 'ind_4d29ab5770b616a6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4d29ab5770b616a6', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|ewekoro|2023',
  'insert', 'ind_4d29ab5770b616a6',
  'Unique: Ogun Ewekoro seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4d29ab5770b616a6', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_4d29ab5770b616a6', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4d29ab5770b616a6', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_ewekoro',
  'ind_4d29ab5770b616a6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4d29ab5770b616a6', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Ewekoro', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4d29ab5770b616a6', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_4d29ab5770b616a6',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4d29ab5770b616a6', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_4d29ab5770b616a6',
  'political_assignment', '{"constituency_inec": "EWEKORO", "party_abbrev": "APC", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4d29ab5770b616a6', 'prof_4d29ab5770b616a6',
  'Amosun Yusuf Olawale',
  'amosun yusuf olawale ogun state assembly ewekoro apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Oluomo Olakunle Taiwo -- Ifo I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_828ec70166d7ddff', 'Oluomo Olakunle Taiwo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_828ec70166d7ddff', 'ind_828ec70166d7ddff', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oluomo Olakunle Taiwo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_828ec70166d7ddff', 'prof_828ec70166d7ddff',
  'Member, Ogun State House of Assembly (IFO I)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_828ec70166d7ddff', 'ind_828ec70166d7ddff', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_828ec70166d7ddff', 'ind_828ec70166d7ddff', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_828ec70166d7ddff', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|ifo_i|2023',
  'insert', 'ind_828ec70166d7ddff',
  'Unique: Ogun Ifo I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_828ec70166d7ddff', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_828ec70166d7ddff', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_828ec70166d7ddff', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_ifo_i',
  'ind_828ec70166d7ddff', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_828ec70166d7ddff', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Ifo I', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_828ec70166d7ddff', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_828ec70166d7ddff',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_828ec70166d7ddff', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_828ec70166d7ddff',
  'political_assignment', '{"constituency_inec": "IFO I", "party_abbrev": "APC", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_828ec70166d7ddff', 'prof_828ec70166d7ddff',
  'Oluomo Olakunle Taiwo',
  'oluomo olakunle taiwo ogun state assembly ifo_i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Akingbade Jemili Adigun -- Imeko-Afon (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e0309c8ca8207980', 'Akingbade Jemili Adigun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e0309c8ca8207980', 'ind_e0309c8ca8207980', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akingbade Jemili Adigun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e0309c8ca8207980', 'prof_e0309c8ca8207980',
  'Member, Ogun State House of Assembly (IMEKO-AFON)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e0309c8ca8207980', 'ind_e0309c8ca8207980', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e0309c8ca8207980', 'ind_e0309c8ca8207980', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e0309c8ca8207980', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|imeko_afon|2023',
  'insert', 'ind_e0309c8ca8207980',
  'Unique: Ogun Imeko-Afon seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e0309c8ca8207980', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_e0309c8ca8207980', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e0309c8ca8207980', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_imeko_afon',
  'ind_e0309c8ca8207980', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e0309c8ca8207980', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Imeko-Afon', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e0309c8ca8207980', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_e0309c8ca8207980',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e0309c8ca8207980', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_e0309c8ca8207980',
  'political_assignment', '{"constituency_inec": "IMEKO-AFON", "party_abbrev": "APC", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e0309c8ca8207980', 'prof_e0309c8ca8207980',
  'Akingbade Jemili Adigun',
  'akingbade jemili adigun ogun state assembly imeko_afon apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Taiwo Adeyinka Mathew -- Ifo II (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3000a91d896551ae', 'Taiwo Adeyinka Mathew',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3000a91d896551ae', 'ind_3000a91d896551ae', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Taiwo Adeyinka Mathew', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3000a91d896551ae', 'prof_3000a91d896551ae',
  'Member, Ogun State House of Assembly (IFO II)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3000a91d896551ae', 'ind_3000a91d896551ae', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3000a91d896551ae', 'ind_3000a91d896551ae', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3000a91d896551ae', 'seed_run_s05_political_ogun_roster_20260502', 'individual',
  'ng_state_assembly_member|ogun|ifo_ii|2023',
  'insert', 'ind_3000a91d896551ae',
  'Unique: Ogun Ifo II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3000a91d896551ae', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_3000a91d896551ae', 'seed_source_ogha_ogun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3000a91d896551ae', 'seed_run_s05_political_ogun_roster_20260502', 'seed_source_ogha_ogun_assembly_20260502',
  'nl_ogun_assembly_2023_ifo_ii',
  'ind_3000a91d896551ae', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3000a91d896551ae', 'seed_run_s05_political_ogun_roster_20260502',
  'Ogun Ifo II', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3000a91d896551ae', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_3000a91d896551ae',
  'seed_source_ogha_ogun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3000a91d896551ae', 'seed_run_s05_political_ogun_roster_20260502', 'individual', 'ind_3000a91d896551ae',
  'political_assignment', '{"constituency_inec": "IFO II", "party_abbrev": "AA", "position": "Member", "source_url": "https://www.ogha.og.gov.ng/members"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3000a91d896551ae', 'prof_3000a91d896551ae',
  'Taiwo Adeyinka Mathew',
  'taiwo adeyinka mathew ogun state assembly ifo_ii aa politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;

-- 23 members inserted for Ogun State House of Assembly
-- Migration 0469 complete
