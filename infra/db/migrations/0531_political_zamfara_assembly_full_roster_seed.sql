-- ============================================================
-- Migration 0531: Zamfara State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Zamfara State House of Assembly Members
-- Members seeded: 24/24
-- Party breakdown: APC:12, A:6, PDP:5, AA:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_zamfara_assembly_20260502',
  'NigerianLeaders – Complete List of Zamfara State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/zamfara-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_zamfara_roster_20260502', 'S05 Batch – Zamfara State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_zamfara_roster_20260502',
  'seed_run_s05_political_zamfara_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0531_political_zamfara_assembly_full_roster_seed.sql',
  NULL, 24,
  '24/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_zamfara_state_assembly_10th_2023_2027',
  'Zamfara State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_zamfara',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (24 of 24 seats) ──────────────────────────────────────

-- 01. Bawa Musa Musa -- Tsafe East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_770d4eaf295ac77c', 'Bawa Musa Musa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_770d4eaf295ac77c', 'ind_770d4eaf295ac77c', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bawa Musa Musa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_770d4eaf295ac77c', 'prof_770d4eaf295ac77c',
  'Member, Zamfara State House of Assembly (TSAFE EAST)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_770d4eaf295ac77c', 'ind_770d4eaf295ac77c', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_770d4eaf295ac77c', 'ind_770d4eaf295ac77c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_770d4eaf295ac77c', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|tsafe east|2023',
  'insert', 'ind_770d4eaf295ac77c',
  'Unique: Zamfara Tsafe East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_770d4eaf295ac77c', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_770d4eaf295ac77c', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_770d4eaf295ac77c', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_tsafe_east',
  'ind_770d4eaf295ac77c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_770d4eaf295ac77c', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Tsafe East', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_770d4eaf295ac77c', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_770d4eaf295ac77c',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_770d4eaf295ac77c', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_770d4eaf295ac77c',
  'political_assignment', '{"constituency_inec": "TSAFE EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_770d4eaf295ac77c', 'prof_770d4eaf295ac77c',
  'Bawa Musa Musa',
  'bawa musa musa zamfara state assembly tsafe east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Ahmed Amiru -- Tsafe West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_54153121984d2be0', 'Ahmed Amiru',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_54153121984d2be0', 'ind_54153121984d2be0', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ahmed Amiru', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_54153121984d2be0', 'prof_54153121984d2be0',
  'Member, Zamfara State House of Assembly (TSAFE WEST)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_54153121984d2be0', 'ind_54153121984d2be0', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_54153121984d2be0', 'ind_54153121984d2be0', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_54153121984d2be0', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|tsafe west|2023',
  'insert', 'ind_54153121984d2be0',
  'Unique: Zamfara Tsafe West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_54153121984d2be0', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_54153121984d2be0', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_54153121984d2be0', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_tsafe_west',
  'ind_54153121984d2be0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_54153121984d2be0', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Tsafe West', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_54153121984d2be0', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_54153121984d2be0',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_54153121984d2be0', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_54153121984d2be0',
  'political_assignment', '{"constituency_inec": "TSAFE WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_54153121984d2be0', 'prof_54153121984d2be0',
  'Ahmed Amiru',
  'ahmed amiru zamfara state assembly tsafe west pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Yusuf Buhari -- Gusau I (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_326e0f4fd8ab1aaa', 'Yusuf Buhari',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_326e0f4fd8ab1aaa', 'ind_326e0f4fd8ab1aaa', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yusuf Buhari', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_326e0f4fd8ab1aaa', 'prof_326e0f4fd8ab1aaa',
  'Member, Zamfara State House of Assembly (GUSAU I)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_326e0f4fd8ab1aaa', 'ind_326e0f4fd8ab1aaa', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_326e0f4fd8ab1aaa', 'ind_326e0f4fd8ab1aaa', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_326e0f4fd8ab1aaa', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|gusau i|2023',
  'insert', 'ind_326e0f4fd8ab1aaa',
  'Unique: Zamfara Gusau I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_326e0f4fd8ab1aaa', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_326e0f4fd8ab1aaa', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_326e0f4fd8ab1aaa', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_gusau_i',
  'ind_326e0f4fd8ab1aaa', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_326e0f4fd8ab1aaa', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Gusau I', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_326e0f4fd8ab1aaa', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_326e0f4fd8ab1aaa',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_326e0f4fd8ab1aaa', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_326e0f4fd8ab1aaa',
  'political_assignment', '{"constituency_inec": "GUSAU I", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_326e0f4fd8ab1aaa', 'prof_326e0f4fd8ab1aaa',
  'Yusuf Buhari',
  'yusuf buhari zamfara state assembly gusau i a politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Yakubu Almajir -- Bungudu East (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8c43d70a4de3a8d4', 'Yakubu Almajir',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8c43d70a4de3a8d4', 'ind_8c43d70a4de3a8d4', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yakubu Almajir', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8c43d70a4de3a8d4', 'prof_8c43d70a4de3a8d4',
  'Member, Zamfara State House of Assembly (BUNGUDU EAST)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8c43d70a4de3a8d4', 'ind_8c43d70a4de3a8d4', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8c43d70a4de3a8d4', 'ind_8c43d70a4de3a8d4', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8c43d70a4de3a8d4', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|bungudu east|2023',
  'insert', 'ind_8c43d70a4de3a8d4',
  'Unique: Zamfara Bungudu East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8c43d70a4de3a8d4', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_8c43d70a4de3a8d4', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8c43d70a4de3a8d4', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_bungudu_east',
  'ind_8c43d70a4de3a8d4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8c43d70a4de3a8d4', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Bungudu East', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8c43d70a4de3a8d4', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_8c43d70a4de3a8d4',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8c43d70a4de3a8d4', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_8c43d70a4de3a8d4',
  'political_assignment', '{"constituency_inec": "BUNGUDU EAST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8c43d70a4de3a8d4', 'prof_8c43d70a4de3a8d4',
  'Yakubu Almajir',
  'yakubu almajir zamfara state assembly bungudu east pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Bello Basiru -- Bungudu West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0fa04bd94f2548f4', 'Bello Basiru',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0fa04bd94f2548f4', 'ind_0fa04bd94f2548f4', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bello Basiru', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0fa04bd94f2548f4', 'prof_0fa04bd94f2548f4',
  'Member, Zamfara State House of Assembly (BUNGUDU WEST)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0fa04bd94f2548f4', 'ind_0fa04bd94f2548f4', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0fa04bd94f2548f4', 'ind_0fa04bd94f2548f4', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0fa04bd94f2548f4', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|bungudu west|2023',
  'insert', 'ind_0fa04bd94f2548f4',
  'Unique: Zamfara Bungudu West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0fa04bd94f2548f4', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_0fa04bd94f2548f4', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0fa04bd94f2548f4', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_bungudu_west',
  'ind_0fa04bd94f2548f4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0fa04bd94f2548f4', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Bungudu West', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0fa04bd94f2548f4', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_0fa04bd94f2548f4',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0fa04bd94f2548f4', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_0fa04bd94f2548f4',
  'political_assignment', '{"constituency_inec": "BUNGUDU WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0fa04bd94f2548f4', 'prof_0fa04bd94f2548f4',
  'Bello Basiru',
  'bello basiru zamfara state assembly bungudu west pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Mainasara Uwaisu -- Anka (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_94170ca120bfa067', 'Mainasara Uwaisu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_94170ca120bfa067', 'ind_94170ca120bfa067', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mainasara Uwaisu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_94170ca120bfa067', 'prof_94170ca120bfa067',
  'Member, Zamfara State House of Assembly (ANKA)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_94170ca120bfa067', 'ind_94170ca120bfa067', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_94170ca120bfa067', 'ind_94170ca120bfa067', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_94170ca120bfa067', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|anka|2023',
  'insert', 'ind_94170ca120bfa067',
  'Unique: Zamfara Anka seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_94170ca120bfa067', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_94170ca120bfa067', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_94170ca120bfa067', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_anka',
  'ind_94170ca120bfa067', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_94170ca120bfa067', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Anka', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_94170ca120bfa067', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_94170ca120bfa067',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_94170ca120bfa067', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_94170ca120bfa067',
  'political_assignment', '{"constituency_inec": "ANKA", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_94170ca120bfa067', 'prof_94170ca120bfa067',
  'Mainasara Uwaisu',
  'mainasara uwaisu zamfara state assembly anka a politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Hassan Shamsudeen -- T/Mafara North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_46979ada8e4b664b', 'Hassan Shamsudeen',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_46979ada8e4b664b', 'ind_46979ada8e4b664b', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Hassan Shamsudeen', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_46979ada8e4b664b', 'prof_46979ada8e4b664b',
  'Member, Zamfara State House of Assembly (T/MAFARA NORTH)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_46979ada8e4b664b', 'ind_46979ada8e4b664b', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_46979ada8e4b664b', 'ind_46979ada8e4b664b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_46979ada8e4b664b', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|t/mafara north|2023',
  'insert', 'ind_46979ada8e4b664b',
  'Unique: Zamfara T/Mafara North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_46979ada8e4b664b', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_46979ada8e4b664b', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_46979ada8e4b664b', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_t/mafara_north',
  'ind_46979ada8e4b664b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_46979ada8e4b664b', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara T/Mafara North', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_46979ada8e4b664b', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_46979ada8e4b664b',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_46979ada8e4b664b', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_46979ada8e4b664b',
  'political_assignment', '{"constituency_inec": "T/MAFARA NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_46979ada8e4b664b', 'prof_46979ada8e4b664b',
  'Hassan Shamsudeen',
  'hassan shamsudeen zamfara state assembly t/mafara north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Yusuf Aminu -- T/Mafara South (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_beb9938a3634c845', 'Yusuf Aminu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_beb9938a3634c845', 'ind_beb9938a3634c845', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yusuf Aminu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_beb9938a3634c845', 'prof_beb9938a3634c845',
  'Member, Zamfara State House of Assembly (T/MAFARA SOUTH)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_beb9938a3634c845', 'ind_beb9938a3634c845', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_beb9938a3634c845', 'ind_beb9938a3634c845', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_beb9938a3634c845', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|t/mafara south|2023',
  'insert', 'ind_beb9938a3634c845',
  'Unique: Zamfara T/Mafara South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_beb9938a3634c845', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_beb9938a3634c845', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_beb9938a3634c845', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_t/mafara_south',
  'ind_beb9938a3634c845', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_beb9938a3634c845', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara T/Mafara South', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_beb9938a3634c845', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_beb9938a3634c845',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_beb9938a3634c845', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_beb9938a3634c845',
  'political_assignment', '{"constituency_inec": "T/MAFARA SOUTH", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_beb9938a3634c845', 'prof_beb9938a3634c845',
  'Yusuf Aminu',
  'yusuf aminu zamfara state assembly t/mafara south a politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Sani Bashiru -- Bakura (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_02fe1ed23044d19a', 'Sani Bashiru',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_02fe1ed23044d19a', 'ind_02fe1ed23044d19a', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sani Bashiru', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_02fe1ed23044d19a', 'prof_02fe1ed23044d19a',
  'Member, Zamfara State House of Assembly (BAKURA)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_02fe1ed23044d19a', 'ind_02fe1ed23044d19a', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_02fe1ed23044d19a', 'ind_02fe1ed23044d19a', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_02fe1ed23044d19a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|bakura|2023',
  'insert', 'ind_02fe1ed23044d19a',
  'Unique: Zamfara Bakura seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_02fe1ed23044d19a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_02fe1ed23044d19a', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_02fe1ed23044d19a', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_bakura',
  'ind_02fe1ed23044d19a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_02fe1ed23044d19a', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Bakura', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_02fe1ed23044d19a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_02fe1ed23044d19a',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_02fe1ed23044d19a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_02fe1ed23044d19a',
  'political_assignment', '{"constituency_inec": "BAKURA", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_02fe1ed23044d19a', 'prof_02fe1ed23044d19a',
  'Sani Bashiru',
  'sani bashiru zamfara state assembly bakura a politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Samaila Lukman -- Gummi I (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cd03296cdd96fe4e', 'Samaila Lukman',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cd03296cdd96fe4e', 'ind_cd03296cdd96fe4e', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Samaila Lukman', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cd03296cdd96fe4e', 'prof_cd03296cdd96fe4e',
  'Member, Zamfara State House of Assembly (GUMMI I)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cd03296cdd96fe4e', 'ind_cd03296cdd96fe4e', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cd03296cdd96fe4e', 'ind_cd03296cdd96fe4e', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cd03296cdd96fe4e', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|gummi i|2023',
  'insert', 'ind_cd03296cdd96fe4e',
  'Unique: Zamfara Gummi I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cd03296cdd96fe4e', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_cd03296cdd96fe4e', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cd03296cdd96fe4e', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_gummi_i',
  'ind_cd03296cdd96fe4e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cd03296cdd96fe4e', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Gummi I', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cd03296cdd96fe4e', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_cd03296cdd96fe4e',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cd03296cdd96fe4e', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_cd03296cdd96fe4e',
  'political_assignment', '{"constituency_inec": "GUMMI I", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cd03296cdd96fe4e', 'prof_cd03296cdd96fe4e',
  'Samaila Lukman',
  'samaila lukman zamfara state assembly gummi i a politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Muhammed Ibrahim -- Bukkuyum North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_388786d0c9996f1a', 'Muhammed Ibrahim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_388786d0c9996f1a', 'ind_388786d0c9996f1a', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammed Ibrahim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_388786d0c9996f1a', 'prof_388786d0c9996f1a',
  'Member, Zamfara State House of Assembly (BUKKUYUM NORTH)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_388786d0c9996f1a', 'ind_388786d0c9996f1a', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_388786d0c9996f1a', 'ind_388786d0c9996f1a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_388786d0c9996f1a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|bukkuyum north|2023',
  'insert', 'ind_388786d0c9996f1a',
  'Unique: Zamfara Bukkuyum North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_388786d0c9996f1a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_388786d0c9996f1a', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_388786d0c9996f1a', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_bukkuyum_north',
  'ind_388786d0c9996f1a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_388786d0c9996f1a', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Bukkuyum North', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_388786d0c9996f1a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_388786d0c9996f1a',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_388786d0c9996f1a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_388786d0c9996f1a',
  'political_assignment', '{"constituency_inec": "BUKKUYUM NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_388786d0c9996f1a', 'prof_388786d0c9996f1a',
  'Muhammed Ibrahim',
  'muhammed ibrahim zamfara state assembly bukkuyum north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Dahiru Sani -- Bukkuyum South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_078bbbdb38268c46', 'Dahiru Sani',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_078bbbdb38268c46', 'ind_078bbbdb38268c46', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dahiru Sani', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_078bbbdb38268c46', 'prof_078bbbdb38268c46',
  'Member, Zamfara State House of Assembly (BUKKUYUM SOUTH)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_078bbbdb38268c46', 'ind_078bbbdb38268c46', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_078bbbdb38268c46', 'ind_078bbbdb38268c46', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_078bbbdb38268c46', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|bukkuyum south|2023',
  'insert', 'ind_078bbbdb38268c46',
  'Unique: Zamfara Bukkuyum South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_078bbbdb38268c46', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_078bbbdb38268c46', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_078bbbdb38268c46', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_bukkuyum_south',
  'ind_078bbbdb38268c46', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_078bbbdb38268c46', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Bukkuyum South', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_078bbbdb38268c46', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_078bbbdb38268c46',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_078bbbdb38268c46', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_078bbbdb38268c46',
  'political_assignment', '{"constituency_inec": "BUKKUYUM SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_078bbbdb38268c46', 'prof_078bbbdb38268c46',
  'Dahiru Sani',
  'dahiru sani zamfara state assembly bukkuyum south apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Alhassan Yusuf Muhammed -- Maru North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_871699d05da6c016', 'Alhassan Yusuf Muhammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_871699d05da6c016', 'ind_871699d05da6c016', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Alhassan Yusuf Muhammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_871699d05da6c016', 'prof_871699d05da6c016',
  'Member, Zamfara State House of Assembly (MARU NORTH)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_871699d05da6c016', 'ind_871699d05da6c016', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_871699d05da6c016', 'ind_871699d05da6c016', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_871699d05da6c016', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|maru north|2023',
  'insert', 'ind_871699d05da6c016',
  'Unique: Zamfara Maru North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_871699d05da6c016', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_871699d05da6c016', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_871699d05da6c016', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_maru_north',
  'ind_871699d05da6c016', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_871699d05da6c016', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Maru North', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_871699d05da6c016', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_871699d05da6c016',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_871699d05da6c016', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_871699d05da6c016',
  'political_assignment', '{"constituency_inec": "MARU NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_871699d05da6c016', 'prof_871699d05da6c016',
  'Alhassan Yusuf Muhammed',
  'alhassan yusuf muhammed zamfara state assembly maru north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Hashimu Kabiru -- Maru South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9a2ef35da3f7e478', 'Hashimu Kabiru',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9a2ef35da3f7e478', 'ind_9a2ef35da3f7e478', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Hashimu Kabiru', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9a2ef35da3f7e478', 'prof_9a2ef35da3f7e478',
  'Member, Zamfara State House of Assembly (MARU SOUTH)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9a2ef35da3f7e478', 'ind_9a2ef35da3f7e478', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9a2ef35da3f7e478', 'ind_9a2ef35da3f7e478', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9a2ef35da3f7e478', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|maru south|2023',
  'insert', 'ind_9a2ef35da3f7e478',
  'Unique: Zamfara Maru South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9a2ef35da3f7e478', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_9a2ef35da3f7e478', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9a2ef35da3f7e478', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_maru_south',
  'ind_9a2ef35da3f7e478', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9a2ef35da3f7e478', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Maru South', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9a2ef35da3f7e478', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_9a2ef35da3f7e478',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9a2ef35da3f7e478', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_9a2ef35da3f7e478',
  'political_assignment', '{"constituency_inec": "MARU SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9a2ef35da3f7e478', 'prof_9a2ef35da3f7e478',
  'Hashimu Kabiru',
  'hashimu kabiru zamfara state assembly maru south apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Sani Habibu -- Gummi II (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a42643d26fc66e0e', 'Sani Habibu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a42643d26fc66e0e', 'ind_a42643d26fc66e0e', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sani Habibu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a42643d26fc66e0e', 'prof_a42643d26fc66e0e',
  'Member, Zamfara State House of Assembly (GUMMI II)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a42643d26fc66e0e', 'ind_a42643d26fc66e0e', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a42643d26fc66e0e', 'ind_a42643d26fc66e0e', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a42643d26fc66e0e', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|gummi ii|2023',
  'insert', 'ind_a42643d26fc66e0e',
  'Unique: Zamfara Gummi II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a42643d26fc66e0e', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_a42643d26fc66e0e', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a42643d26fc66e0e', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_gummi_ii',
  'ind_a42643d26fc66e0e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a42643d26fc66e0e', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Gummi II', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a42643d26fc66e0e', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_a42643d26fc66e0e',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a42643d26fc66e0e', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_a42643d26fc66e0e',
  'political_assignment', '{"constituency_inec": "GUMMI II", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a42643d26fc66e0e', 'prof_a42643d26fc66e0e',
  'Sani Habibu',
  'sani habibu zamfara state assembly gummi ii a politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Musa Faruk -- Maradun I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0a82e2584155549a', 'Musa Faruk',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0a82e2584155549a', 'ind_0a82e2584155549a', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Musa Faruk', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0a82e2584155549a', 'prof_0a82e2584155549a',
  'Member, Zamfara State House of Assembly (MARADUN I)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0a82e2584155549a', 'ind_0a82e2584155549a', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0a82e2584155549a', 'ind_0a82e2584155549a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0a82e2584155549a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|maradun i|2023',
  'insert', 'ind_0a82e2584155549a',
  'Unique: Zamfara Maradun I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0a82e2584155549a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_0a82e2584155549a', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0a82e2584155549a', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_maradun_i',
  'ind_0a82e2584155549a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0a82e2584155549a', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Maradun I', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0a82e2584155549a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_0a82e2584155549a',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0a82e2584155549a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_0a82e2584155549a',
  'political_assignment', '{"constituency_inec": "MARADUN I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0a82e2584155549a', 'prof_0a82e2584155549a',
  'Musa Faruk',
  'musa faruk zamfara state assembly maradun i apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Atiku Nasiru -- Maradun II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ae5ffe5ef4b9df9d', 'Atiku Nasiru',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ae5ffe5ef4b9df9d', 'ind_ae5ffe5ef4b9df9d', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Atiku Nasiru', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ae5ffe5ef4b9df9d', 'prof_ae5ffe5ef4b9df9d',
  'Member, Zamfara State House of Assembly (MARADUN II)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ae5ffe5ef4b9df9d', 'ind_ae5ffe5ef4b9df9d', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ae5ffe5ef4b9df9d', 'ind_ae5ffe5ef4b9df9d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ae5ffe5ef4b9df9d', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|maradun ii|2023',
  'insert', 'ind_ae5ffe5ef4b9df9d',
  'Unique: Zamfara Maradun II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ae5ffe5ef4b9df9d', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_ae5ffe5ef4b9df9d', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ae5ffe5ef4b9df9d', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_maradun_ii',
  'ind_ae5ffe5ef4b9df9d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ae5ffe5ef4b9df9d', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Maradun II', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ae5ffe5ef4b9df9d', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_ae5ffe5ef4b9df9d',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ae5ffe5ef4b9df9d', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_ae5ffe5ef4b9df9d',
  'political_assignment', '{"constituency_inec": "MARADUN II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ae5ffe5ef4b9df9d', 'prof_ae5ffe5ef4b9df9d',
  'Atiku Nasiru',
  'atiku nasiru zamfara state assembly maradun ii apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Nasir Mukhtar -- K/Namoda North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cb8a91e33861fc4d', 'Nasir Mukhtar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cb8a91e33861fc4d', 'ind_cb8a91e33861fc4d', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nasir Mukhtar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cb8a91e33861fc4d', 'prof_cb8a91e33861fc4d',
  'Member, Zamfara State House of Assembly (K/NAMODA NORTH)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cb8a91e33861fc4d', 'ind_cb8a91e33861fc4d', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cb8a91e33861fc4d', 'ind_cb8a91e33861fc4d', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cb8a91e33861fc4d', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|k/namoda north|2023',
  'insert', 'ind_cb8a91e33861fc4d',
  'Unique: Zamfara K/Namoda North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cb8a91e33861fc4d', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_cb8a91e33861fc4d', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cb8a91e33861fc4d', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_k/namoda_north',
  'ind_cb8a91e33861fc4d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cb8a91e33861fc4d', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara K/Namoda North', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cb8a91e33861fc4d', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_cb8a91e33861fc4d',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cb8a91e33861fc4d', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_cb8a91e33861fc4d',
  'political_assignment', '{"constituency_inec": "K/NAMODA NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cb8a91e33861fc4d', 'prof_cb8a91e33861fc4d',
  'Nasir Mukhtar',
  'nasir mukhtar zamfara state assembly k/namoda north pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Almajir Yahuza -- K/Namoda South (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c37ee25bcf919bcd', 'Almajir Yahuza',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c37ee25bcf919bcd', 'ind_c37ee25bcf919bcd', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Almajir Yahuza', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c37ee25bcf919bcd', 'prof_c37ee25bcf919bcd',
  'Member, Zamfara State House of Assembly (K/NAMODA SOUTH)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c37ee25bcf919bcd', 'ind_c37ee25bcf919bcd', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c37ee25bcf919bcd', 'ind_c37ee25bcf919bcd', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c37ee25bcf919bcd', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|k/namoda south|2023',
  'insert', 'ind_c37ee25bcf919bcd',
  'Unique: Zamfara K/Namoda South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c37ee25bcf919bcd', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_c37ee25bcf919bcd', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c37ee25bcf919bcd', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_k/namoda_south',
  'ind_c37ee25bcf919bcd', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c37ee25bcf919bcd', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara K/Namoda South', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c37ee25bcf919bcd', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_c37ee25bcf919bcd',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c37ee25bcf919bcd', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_c37ee25bcf919bcd',
  'political_assignment', '{"constituency_inec": "K/NAMODA SOUTH", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c37ee25bcf919bcd', 'prof_c37ee25bcf919bcd',
  'Almajir Yahuza',
  'almajir yahuza zamfara state assembly k/namoda south aa politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Dahiru Nura -- Birnin Magaji (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a05706cecf58fb0e', 'Dahiru Nura',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a05706cecf58fb0e', 'ind_a05706cecf58fb0e', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dahiru Nura', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a05706cecf58fb0e', 'prof_a05706cecf58fb0e',
  'Member, Zamfara State House of Assembly (BIRNIN MAGAJI)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a05706cecf58fb0e', 'ind_a05706cecf58fb0e', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a05706cecf58fb0e', 'ind_a05706cecf58fb0e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a05706cecf58fb0e', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|birnin magaji|2023',
  'insert', 'ind_a05706cecf58fb0e',
  'Unique: Zamfara Birnin Magaji seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a05706cecf58fb0e', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_a05706cecf58fb0e', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a05706cecf58fb0e', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_birnin_magaji',
  'ind_a05706cecf58fb0e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a05706cecf58fb0e', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Birnin Magaji', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a05706cecf58fb0e', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_a05706cecf58fb0e',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a05706cecf58fb0e', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_a05706cecf58fb0e',
  'political_assignment', '{"constituency_inec": "BIRNIN MAGAJI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a05706cecf58fb0e', 'prof_a05706cecf58fb0e',
  'Dahiru Nura',
  'dahiru nura zamfara state assembly birnin magaji apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Aliyu Manir -- Zurmi East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_15bd204b5b23a07d', 'Aliyu Manir',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_15bd204b5b23a07d', 'ind_15bd204b5b23a07d', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aliyu Manir', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_15bd204b5b23a07d', 'prof_15bd204b5b23a07d',
  'Member, Zamfara State House of Assembly (ZURMI EAST)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_15bd204b5b23a07d', 'ind_15bd204b5b23a07d', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_15bd204b5b23a07d', 'ind_15bd204b5b23a07d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_15bd204b5b23a07d', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|zurmi east|2023',
  'insert', 'ind_15bd204b5b23a07d',
  'Unique: Zamfara Zurmi East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_15bd204b5b23a07d', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_15bd204b5b23a07d', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_15bd204b5b23a07d', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_zurmi_east',
  'ind_15bd204b5b23a07d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_15bd204b5b23a07d', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Zurmi East', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_15bd204b5b23a07d', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_15bd204b5b23a07d',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_15bd204b5b23a07d', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_15bd204b5b23a07d',
  'political_assignment', '{"constituency_inec": "ZURMI EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_15bd204b5b23a07d', 'prof_15bd204b5b23a07d',
  'Aliyu Manir',
  'aliyu manir zamfara state assembly zurmi east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Ismail Bilyaminu -- Zurmi West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_dcf5d078f98387a9', 'Ismail Bilyaminu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_dcf5d078f98387a9', 'ind_dcf5d078f98387a9', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ismail Bilyaminu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_dcf5d078f98387a9', 'prof_dcf5d078f98387a9',
  'Member, Zamfara State House of Assembly (ZURMI WEST)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_dcf5d078f98387a9', 'ind_dcf5d078f98387a9', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_dcf5d078f98387a9', 'ind_dcf5d078f98387a9', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_dcf5d078f98387a9', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|zurmi west|2023',
  'insert', 'ind_dcf5d078f98387a9',
  'Unique: Zamfara Zurmi West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_dcf5d078f98387a9', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_dcf5d078f98387a9', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_dcf5d078f98387a9', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_zurmi_west',
  'ind_dcf5d078f98387a9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_dcf5d078f98387a9', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Zurmi West', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_dcf5d078f98387a9', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_dcf5d078f98387a9',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_dcf5d078f98387a9', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_dcf5d078f98387a9',
  'political_assignment', '{"constituency_inec": "ZURMI WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_dcf5d078f98387a9', 'prof_dcf5d078f98387a9',
  'Ismail Bilyaminu',
  'ismail bilyaminu zamfara state assembly zurmi west pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Abubakar Aminu -- Gusau II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_60beb17ee366202a', 'Abubakar Aminu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_60beb17ee366202a', 'ind_60beb17ee366202a', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Aminu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_60beb17ee366202a', 'prof_60beb17ee366202a',
  'Member, Zamfara State House of Assembly (GUSAU II)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_60beb17ee366202a', 'ind_60beb17ee366202a', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_60beb17ee366202a', 'ind_60beb17ee366202a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_60beb17ee366202a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|gusau ii|2023',
  'insert', 'ind_60beb17ee366202a',
  'Unique: Zamfara Gusau II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_60beb17ee366202a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_60beb17ee366202a', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_60beb17ee366202a', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_gusau_ii',
  'ind_60beb17ee366202a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_60beb17ee366202a', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Gusau II', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_60beb17ee366202a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_60beb17ee366202a',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_60beb17ee366202a', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_60beb17ee366202a',
  'political_assignment', '{"constituency_inec": "GUSAU II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_60beb17ee366202a', 'prof_60beb17ee366202a',
  'Abubakar Aminu',
  'abubakar aminu zamfara state assembly gusau ii apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Dahiru Sani -- Shinkafi (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4add7a50ca69b712', 'Dahiru Sani',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4add7a50ca69b712', 'ind_4add7a50ca69b712', 'individual', 'place_state_zamfara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dahiru Sani', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4add7a50ca69b712', 'prof_4add7a50ca69b712',
  'Member, Zamfara State House of Assembly (SHINKAFI)',
  'place_state_zamfara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4add7a50ca69b712', 'ind_4add7a50ca69b712', 'term_ng_zamfara_state_assembly_10th_2023_2027',
  'place_state_zamfara', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4add7a50ca69b712', 'ind_4add7a50ca69b712', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4add7a50ca69b712', 'seed_run_s05_political_zamfara_roster_20260502', 'individual',
  'ng_state_assembly_member|zamfara|shinkafi|2023',
  'insert', 'ind_4add7a50ca69b712',
  'Unique: Zamfara Shinkafi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4add7a50ca69b712', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_4add7a50ca69b712', 'seed_source_nigerianleaders_zamfara_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4add7a50ca69b712', 'seed_run_s05_political_zamfara_roster_20260502', 'seed_source_nigerianleaders_zamfara_assembly_20260502',
  'nl_zamfara_assembly_2023_shinkafi',
  'ind_4add7a50ca69b712', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4add7a50ca69b712', 'seed_run_s05_political_zamfara_roster_20260502',
  'Zamfara Shinkafi', 'place_state_zamfara', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4add7a50ca69b712', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_4add7a50ca69b712',
  'seed_source_nigerianleaders_zamfara_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4add7a50ca69b712', 'seed_run_s05_political_zamfara_roster_20260502', 'individual', 'ind_4add7a50ca69b712',
  'political_assignment', '{"constituency_inec": "SHINKAFI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/zamfara-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4add7a50ca69b712', 'prof_4add7a50ca69b712',
  'Dahiru Sani',
  'dahiru sani zamfara state assembly shinkafi apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_zamfara',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
