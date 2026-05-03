-- ============================================================
-- Migration 0533: Abia State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: Wikipedia – Abia State House of Assembly (8th Assembly Members)
-- Members seeded: 24/24
-- Party breakdown: APC:1, APGA:1, LP:9, PDP:12, YPP:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_wikipedia_abia_assembly_20260502',
  'Wikipedia – Abia State House of Assembly (8th Assembly Members)',
  'wiki_scraped',
  'https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly',
  'editorial_verified',
  'Wikipedia data cross-referenced with INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_abia_roster_20260502', 'S05 Batch – Abia State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_abia_roster_20260502',
  'seed_run_s05_political_abia_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0533_political_abia_assembly_full_roster_seed.sql',
  NULL, 24,
  '24/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_abia_state_assembly_10th_2023_2027',
  'Abia State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_abia',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (24 of 24 seats) ──────────────────────────────────────

-- 01. Fyne Ahuama -- OSISIOMA SOUTH (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0c2a7bcb28306bfb', 'Fyne Ahuama',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0c2a7bcb28306bfb', 'ind_0c2a7bcb28306bfb', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Fyne Ahuama', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0c2a7bcb28306bfb', 'prof_0c2a7bcb28306bfb',
  'Member, Abia State House of Assembly (OSISIOMA SOUTH)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0c2a7bcb28306bfb', 'ind_0c2a7bcb28306bfb', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0c2a7bcb28306bfb', 'ind_0c2a7bcb28306bfb', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0c2a7bcb28306bfb', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|osisioma south|2023',
  'insert', 'ind_0c2a7bcb28306bfb',
  'Unique: Abia OSISIOMA SOUTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0c2a7bcb28306bfb', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_0c2a7bcb28306bfb', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0c2a7bcb28306bfb', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_osisioma_south',
  'ind_0c2a7bcb28306bfb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0c2a7bcb28306bfb', 'seed_run_s05_political_abia_roster_20260502',
  'Abia OSISIOMA SOUTH', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0c2a7bcb28306bfb', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_0c2a7bcb28306bfb',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0c2a7bcb28306bfb', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_0c2a7bcb28306bfb',
  'political_assignment', '{"constituency_inec": "OSISIOMA SOUTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0c2a7bcb28306bfb', 'prof_0c2a7bcb28306bfb',
  'Fyne Ahuama',
  'fyne ahuama abia state assembly osisioma south pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Barr Akaliro Anderson -- UMUAHIA NORTH (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6a50a6b79f3d8919', 'Barr Akaliro Anderson',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6a50a6b79f3d8919', 'ind_6a50a6b79f3d8919', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Barr Akaliro Anderson', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6a50a6b79f3d8919', 'prof_6a50a6b79f3d8919',
  'Member, Abia State House of Assembly (UMUAHIA NORTH)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6a50a6b79f3d8919', 'ind_6a50a6b79f3d8919', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6a50a6b79f3d8919', 'ind_6a50a6b79f3d8919', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6a50a6b79f3d8919', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|umuahia north|2023',
  'insert', 'ind_6a50a6b79f3d8919',
  'Unique: Abia UMUAHIA NORTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6a50a6b79f3d8919', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_6a50a6b79f3d8919', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6a50a6b79f3d8919', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_umuahia_north',
  'ind_6a50a6b79f3d8919', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6a50a6b79f3d8919', 'seed_run_s05_political_abia_roster_20260502',
  'Abia UMUAHIA NORTH', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6a50a6b79f3d8919', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_6a50a6b79f3d8919',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6a50a6b79f3d8919', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_6a50a6b79f3d8919',
  'political_assignment', '{"constituency_inec": "UMUAHIA NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6a50a6b79f3d8919', 'prof_6a50a6b79f3d8919',
  'Barr Akaliro Anderson',
  'barr akaliro anderson abia state assembly umuahia north apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Chinasa Anthony -- UMUAHIA CENTRAL (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fefd3604681caade', 'Chinasa Anthony',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fefd3604681caade', 'ind_fefd3604681caade', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Chinasa Anthony', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fefd3604681caade', 'prof_fefd3604681caade',
  'Member, Abia State House of Assembly (UMUAHIA CENTRAL)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fefd3604681caade', 'ind_fefd3604681caade', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fefd3604681caade', 'ind_fefd3604681caade', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fefd3604681caade', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|umuahia central|2023',
  'insert', 'ind_fefd3604681caade',
  'Unique: Abia UMUAHIA CENTRAL seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fefd3604681caade', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_fefd3604681caade', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fefd3604681caade', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_umuahia_central',
  'ind_fefd3604681caade', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fefd3604681caade', 'seed_run_s05_political_abia_roster_20260502',
  'Abia UMUAHIA CENTRAL', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fefd3604681caade', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_fefd3604681caade',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fefd3604681caade', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_fefd3604681caade',
  'political_assignment', '{"constituency_inec": "UMUAHIA CENTRAL", "party_abbrev": "LP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fefd3604681caade', 'prof_fefd3604681caade',
  'Chinasa Anthony',
  'chinasa anthony abia state assembly umuahia central lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Ugochukwu Iheonunekwu -- ISIALA NGWA NORTH (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6d568bcebcb38ce7', 'Ugochukwu Iheonunekwu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6d568bcebcb38ce7', 'ind_6d568bcebcb38ce7', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ugochukwu Iheonunekwu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6d568bcebcb38ce7', 'prof_6d568bcebcb38ce7',
  'Member, Abia State House of Assembly (ISIALA NGWA NORTH)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6d568bcebcb38ce7', 'ind_6d568bcebcb38ce7', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6d568bcebcb38ce7', 'ind_6d568bcebcb38ce7', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6d568bcebcb38ce7', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|isiala ngwa north|2023',
  'insert', 'ind_6d568bcebcb38ce7',
  'Unique: Abia ISIALA NGWA NORTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6d568bcebcb38ce7', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_6d568bcebcb38ce7', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6d568bcebcb38ce7', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_isiala_ngwa_north',
  'ind_6d568bcebcb38ce7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6d568bcebcb38ce7', 'seed_run_s05_political_abia_roster_20260502',
  'Abia ISIALA NGWA NORTH', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6d568bcebcb38ce7', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_6d568bcebcb38ce7',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6d568bcebcb38ce7', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_6d568bcebcb38ce7',
  'political_assignment', '{"constituency_inec": "ISIALA NGWA NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6d568bcebcb38ce7', 'prof_6d568bcebcb38ce7',
  'Ugochukwu Iheonunekwu',
  'ugochukwu iheonunekwu abia state assembly isiala ngwa north pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Rowland Ceaser -- ISIALA NGWA SOUTH (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2f05e1cf4cf91cee', 'Rowland Ceaser',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2f05e1cf4cf91cee', 'ind_2f05e1cf4cf91cee', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Rowland Ceaser', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2f05e1cf4cf91cee', 'prof_2f05e1cf4cf91cee',
  'Member, Abia State House of Assembly (ISIALA NGWA SOUTH)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2f05e1cf4cf91cee', 'ind_2f05e1cf4cf91cee', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2f05e1cf4cf91cee', 'ind_2f05e1cf4cf91cee', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2f05e1cf4cf91cee', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|isiala ngwa south|2023',
  'insert', 'ind_2f05e1cf4cf91cee',
  'Unique: Abia ISIALA NGWA SOUTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2f05e1cf4cf91cee', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_2f05e1cf4cf91cee', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2f05e1cf4cf91cee', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_isiala_ngwa_south',
  'ind_2f05e1cf4cf91cee', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2f05e1cf4cf91cee', 'seed_run_s05_political_abia_roster_20260502',
  'Abia ISIALA NGWA SOUTH', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2f05e1cf4cf91cee', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_2f05e1cf4cf91cee',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2f05e1cf4cf91cee', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_2f05e1cf4cf91cee',
  'political_assignment', '{"constituency_inec": "ISIALA NGWA SOUTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2f05e1cf4cf91cee', 'prof_2f05e1cf4cf91cee',
  'Rowland Ceaser',
  'rowland ceaser abia state assembly isiala ngwa south pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Lucky Johnson -- ISUIKWUATO (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_401baafa5541e7a6', 'Lucky Johnson',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_401baafa5541e7a6', 'ind_401baafa5541e7a6', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lucky Johnson', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_401baafa5541e7a6', 'prof_401baafa5541e7a6',
  'Member, Abia State House of Assembly (ISUIKWUATO)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_401baafa5541e7a6', 'ind_401baafa5541e7a6', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_401baafa5541e7a6', 'ind_401baafa5541e7a6', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_401baafa5541e7a6', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|isuikwuato|2023',
  'insert', 'ind_401baafa5541e7a6',
  'Unique: Abia ISUIKWUATO seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_401baafa5541e7a6', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_401baafa5541e7a6', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_401baafa5541e7a6', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_isuikwuato',
  'ind_401baafa5541e7a6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_401baafa5541e7a6', 'seed_run_s05_political_abia_roster_20260502',
  'Abia ISUIKWUATO', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_401baafa5541e7a6', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_401baafa5541e7a6',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_401baafa5541e7a6', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_401baafa5541e7a6',
  'political_assignment', '{"constituency_inec": "ISUIKWUATO", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_401baafa5541e7a6', 'prof_401baafa5541e7a6',
  'Lucky Johnson',
  'lucky johnson abia state assembly isuikwuato pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Lewis Obianyi -- UKWA EAST (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f1fe85fc6af89531', 'Lewis Obianyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f1fe85fc6af89531', 'ind_f1fe85fc6af89531', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lewis Obianyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f1fe85fc6af89531', 'prof_f1fe85fc6af89531',
  'Member, Abia State House of Assembly (UKWA EAST)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f1fe85fc6af89531', 'ind_f1fe85fc6af89531', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f1fe85fc6af89531', 'ind_f1fe85fc6af89531', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f1fe85fc6af89531', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|ukwa east|2023',
  'insert', 'ind_f1fe85fc6af89531',
  'Unique: Abia UKWA EAST seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f1fe85fc6af89531', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_f1fe85fc6af89531', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f1fe85fc6af89531', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_ukwa_east',
  'ind_f1fe85fc6af89531', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f1fe85fc6af89531', 'seed_run_s05_political_abia_roster_20260502',
  'Abia UKWA EAST', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f1fe85fc6af89531', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_f1fe85fc6af89531',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f1fe85fc6af89531', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_f1fe85fc6af89531',
  'political_assignment', '{"constituency_inec": "UKWA EAST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f1fe85fc6af89531', 'prof_f1fe85fc6af89531',
  'Lewis Obianyi',
  'lewis obianyi abia state assembly ukwa east pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Godwin Adiele -- UKWA WEST (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e17c73c6eb7ef43a', 'Godwin Adiele',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e17c73c6eb7ef43a', 'ind_e17c73c6eb7ef43a', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Godwin Adiele', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e17c73c6eb7ef43a', 'prof_e17c73c6eb7ef43a',
  'Member, Abia State House of Assembly (UKWA WEST)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e17c73c6eb7ef43a', 'ind_e17c73c6eb7ef43a', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e17c73c6eb7ef43a', 'ind_e17c73c6eb7ef43a', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e17c73c6eb7ef43a', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|ukwa west|2023',
  'insert', 'ind_e17c73c6eb7ef43a',
  'Unique: Abia UKWA WEST seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e17c73c6eb7ef43a', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_e17c73c6eb7ef43a', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e17c73c6eb7ef43a', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_ukwa_west',
  'ind_e17c73c6eb7ef43a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e17c73c6eb7ef43a', 'seed_run_s05_political_abia_roster_20260502',
  'Abia UKWA WEST', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e17c73c6eb7ef43a', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_e17c73c6eb7ef43a',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e17c73c6eb7ef43a', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_e17c73c6eb7ef43a',
  'political_assignment', '{"constituency_inec": "UKWA WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e17c73c6eb7ef43a', 'prof_e17c73c6eb7ef43a',
  'Godwin Adiele',
  'godwin adiele abia state assembly ukwa west pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Solomon Akpulonu -- OBINGWA EAST (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bb259d3ffeec0f3c', 'Solomon Akpulonu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bb259d3ffeec0f3c', 'ind_bb259d3ffeec0f3c', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Solomon Akpulonu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bb259d3ffeec0f3c', 'prof_bb259d3ffeec0f3c',
  'Member, Abia State House of Assembly (OBINGWA EAST)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bb259d3ffeec0f3c', 'ind_bb259d3ffeec0f3c', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bb259d3ffeec0f3c', 'ind_bb259d3ffeec0f3c', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bb259d3ffeec0f3c', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|obingwa east|2023',
  'insert', 'ind_bb259d3ffeec0f3c',
  'Unique: Abia OBINGWA EAST seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bb259d3ffeec0f3c', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_bb259d3ffeec0f3c', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bb259d3ffeec0f3c', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_obingwa_east',
  'ind_bb259d3ffeec0f3c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bb259d3ffeec0f3c', 'seed_run_s05_political_abia_roster_20260502',
  'Abia OBINGWA EAST', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bb259d3ffeec0f3c', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_bb259d3ffeec0f3c',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bb259d3ffeec0f3c', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_bb259d3ffeec0f3c',
  'political_assignment', '{"constituency_inec": "OBINGWA EAST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bb259d3ffeec0f3c', 'prof_bb259d3ffeec0f3c',
  'Solomon Akpulonu',
  'solomon akpulonu abia state assembly obingwa east pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Ume Mathias -- UMUNNEOCHI (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_01f79e727eadc662', 'Ume Mathias',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_01f79e727eadc662', 'ind_01f79e727eadc662', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ume Mathias', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_01f79e727eadc662', 'prof_01f79e727eadc662',
  'Member, Abia State House of Assembly (UMUNNEOCHI)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_01f79e727eadc662', 'ind_01f79e727eadc662', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_01f79e727eadc662', 'ind_01f79e727eadc662', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_01f79e727eadc662', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|umunneochi|2023',
  'insert', 'ind_01f79e727eadc662',
  'Unique: Abia UMUNNEOCHI seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_01f79e727eadc662', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_01f79e727eadc662', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_01f79e727eadc662', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_umunneochi',
  'ind_01f79e727eadc662', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_01f79e727eadc662', 'seed_run_s05_political_abia_roster_20260502',
  'Abia UMUNNEOCHI', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_01f79e727eadc662', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_01f79e727eadc662',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_01f79e727eadc662', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_01f79e727eadc662',
  'political_assignment', '{"constituency_inec": "UMUNNEOCHI", "party_abbrev": "LP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_01f79e727eadc662', 'prof_01f79e727eadc662',
  'Ume Mathias',
  'ume mathias abia state assembly umunneochi lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Austin Okezie Meregini -- UMUAHIA EAST (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fd78f90f587d594c', 'Austin Okezie Meregini',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fd78f90f587d594c', 'ind_fd78f90f587d594c', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Austin Okezie Meregini', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fd78f90f587d594c', 'prof_fd78f90f587d594c',
  'Member, Abia State House of Assembly (UMUAHIA EAST)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fd78f90f587d594c', 'ind_fd78f90f587d594c', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fd78f90f587d594c', 'ind_fd78f90f587d594c', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fd78f90f587d594c', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|umuahia east|2023',
  'insert', 'ind_fd78f90f587d594c',
  'Unique: Abia UMUAHIA EAST seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fd78f90f587d594c', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_fd78f90f587d594c', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fd78f90f587d594c', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_umuahia_east',
  'ind_fd78f90f587d594c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fd78f90f587d594c', 'seed_run_s05_political_abia_roster_20260502',
  'Abia UMUAHIA EAST', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fd78f90f587d594c', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_fd78f90f587d594c',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fd78f90f587d594c', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_fd78f90f587d594c',
  'political_assignment', '{"constituency_inec": "UMUAHIA EAST", "party_abbrev": "LP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fd78f90f587d594c', 'prof_fd78f90f587d594c',
  'Austin Okezie Meregini',
  'austin okezie meregini abia state assembly umuahia east lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Emeka Jacob Obioma -- UMUAHIA SOUTH (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_27671b10a77fbd11', 'Emeka Jacob Obioma',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_27671b10a77fbd11', 'ind_27671b10a77fbd11', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Emeka Jacob Obioma', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_27671b10a77fbd11', 'prof_27671b10a77fbd11',
  'Member, Abia State House of Assembly (UMUAHIA SOUTH)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_27671b10a77fbd11', 'ind_27671b10a77fbd11', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_27671b10a77fbd11', 'ind_27671b10a77fbd11', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_27671b10a77fbd11', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|umuahia south|2023',
  'insert', 'ind_27671b10a77fbd11',
  'Unique: Abia UMUAHIA SOUTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_27671b10a77fbd11', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_27671b10a77fbd11', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_27671b10a77fbd11', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_umuahia_south',
  'ind_27671b10a77fbd11', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_27671b10a77fbd11', 'seed_run_s05_political_abia_roster_20260502',
  'Abia UMUAHIA SOUTH', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_27671b10a77fbd11', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_27671b10a77fbd11',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_27671b10a77fbd11', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_27671b10a77fbd11',
  'political_assignment', '{"constituency_inec": "UMUAHIA SOUTH", "party_abbrev": "LP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_27671b10a77fbd11', 'prof_27671b10a77fbd11',
  'Emeka Jacob Obioma',
  'emeka jacob obioma abia state assembly umuahia south lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Boniface Isienyi -- IKWUANO (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_24c16f3440f1b4c6', 'Boniface Isienyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_24c16f3440f1b4c6', 'ind_24c16f3440f1b4c6', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Boniface Isienyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_24c16f3440f1b4c6', 'prof_24c16f3440f1b4c6',
  'Member, Abia State House of Assembly (IKWUANO)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_24c16f3440f1b4c6', 'ind_24c16f3440f1b4c6', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_24c16f3440f1b4c6', 'ind_24c16f3440f1b4c6', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_24c16f3440f1b4c6', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|ikwuano|2023',
  'insert', 'ind_24c16f3440f1b4c6',
  'Unique: Abia IKWUANO seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_24c16f3440f1b4c6', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_24c16f3440f1b4c6', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_24c16f3440f1b4c6', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_ikwuano',
  'ind_24c16f3440f1b4c6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_24c16f3440f1b4c6', 'seed_run_s05_political_abia_roster_20260502',
  'Abia IKWUANO', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_24c16f3440f1b4c6', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_24c16f3440f1b4c6',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_24c16f3440f1b4c6', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_24c16f3440f1b4c6',
  'political_assignment', '{"constituency_inec": "IKWUANO", "party_abbrev": "LP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_24c16f3440f1b4c6', 'prof_24c16f3440f1b4c6',
  'Boniface Isienyi',
  'boniface isienyi abia state assembly ikwuano lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Chijioke Uruakpa -- UGWUNAGBO (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0287acee623bcb2b', 'Chijioke Uruakpa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0287acee623bcb2b', 'ind_0287acee623bcb2b', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Chijioke Uruakpa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0287acee623bcb2b', 'prof_0287acee623bcb2b',
  'Member, Abia State House of Assembly (UGWUNAGBO)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0287acee623bcb2b', 'ind_0287acee623bcb2b', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0287acee623bcb2b', 'ind_0287acee623bcb2b', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0287acee623bcb2b', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|ugwunagbo|2023',
  'insert', 'ind_0287acee623bcb2b',
  'Unique: Abia UGWUNAGBO seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0287acee623bcb2b', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_0287acee623bcb2b', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0287acee623bcb2b', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_ugwunagbo',
  'ind_0287acee623bcb2b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0287acee623bcb2b', 'seed_run_s05_political_abia_roster_20260502',
  'Abia UGWUNAGBO', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0287acee623bcb2b', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_0287acee623bcb2b',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0287acee623bcb2b', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_0287acee623bcb2b',
  'political_assignment', '{"constituency_inec": "UGWUNAGBO", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0287acee623bcb2b', 'prof_0287acee623bcb2b',
  'Chijioke Uruakpa',
  'chijioke uruakpa abia state assembly ugwunagbo pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Erondu Uchenna Erondu -- OBINGWA WEST (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_febecef34a154e99', 'Erondu Uchenna Erondu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_febecef34a154e99', 'ind_febecef34a154e99', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Erondu Uchenna Erondu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_febecef34a154e99', 'prof_febecef34a154e99',
  'Member, Abia State House of Assembly (OBINGWA WEST)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_febecef34a154e99', 'ind_febecef34a154e99', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_febecef34a154e99', 'ind_febecef34a154e99', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_febecef34a154e99', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|obingwa west|2023',
  'insert', 'ind_febecef34a154e99',
  'Unique: Abia OBINGWA WEST seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_febecef34a154e99', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_febecef34a154e99', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_febecef34a154e99', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_obingwa_west',
  'ind_febecef34a154e99', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_febecef34a154e99', 'seed_run_s05_political_abia_roster_20260502',
  'Abia OBINGWA WEST', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_febecef34a154e99', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_febecef34a154e99',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_febecef34a154e99', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_febecef34a154e99',
  'political_assignment', '{"constituency_inec": "OBINGWA WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_febecef34a154e99', 'prof_febecef34a154e99',
  'Erondu Uchenna Erondu',
  'erondu uchenna erondu abia state assembly obingwa west pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Mandela Obasi -- OHAFIA NORTH (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_681255cbe6342594', 'Mandela Obasi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_681255cbe6342594', 'ind_681255cbe6342594', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mandela Obasi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_681255cbe6342594', 'prof_681255cbe6342594',
  'Member, Abia State House of Assembly (OHAFIA NORTH)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_681255cbe6342594', 'ind_681255cbe6342594', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_681255cbe6342594', 'ind_681255cbe6342594', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_681255cbe6342594', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|ohafia north|2023',
  'insert', 'ind_681255cbe6342594',
  'Unique: Abia OHAFIA NORTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_681255cbe6342594', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_681255cbe6342594', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_681255cbe6342594', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_ohafia_north',
  'ind_681255cbe6342594', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_681255cbe6342594', 'seed_run_s05_political_abia_roster_20260502',
  'Abia OHAFIA NORTH', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_681255cbe6342594', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_681255cbe6342594',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_681255cbe6342594', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_681255cbe6342594',
  'political_assignment', '{"constituency_inec": "OHAFIA NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_681255cbe6342594', 'prof_681255cbe6342594',
  'Mandela Obasi',
  'mandela obasi abia state assembly ohafia north pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Nwogu Iheanacho -- OSISIOMA NORTH (YPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c459c0f35f8785d8', 'Nwogu Iheanacho',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c459c0f35f8785d8', 'ind_c459c0f35f8785d8', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwogu Iheanacho', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c459c0f35f8785d8', 'prof_c459c0f35f8785d8',
  'Member, Abia State House of Assembly (OSISIOMA NORTH)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c459c0f35f8785d8', 'ind_c459c0f35f8785d8', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c459c0f35f8785d8', 'ind_c459c0f35f8785d8', 'org_political_party_ypp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c459c0f35f8785d8', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|osisioma north|2023',
  'insert', 'ind_c459c0f35f8785d8',
  'Unique: Abia OSISIOMA NORTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c459c0f35f8785d8', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_c459c0f35f8785d8', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c459c0f35f8785d8', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_osisioma_north',
  'ind_c459c0f35f8785d8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c459c0f35f8785d8', 'seed_run_s05_political_abia_roster_20260502',
  'Abia OSISIOMA NORTH', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c459c0f35f8785d8', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_c459c0f35f8785d8',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c459c0f35f8785d8', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_c459c0f35f8785d8',
  'political_assignment', '{"constituency_inec": "OSISIOMA NORTH", "party_abbrev": "YPP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c459c0f35f8785d8', 'prof_c459c0f35f8785d8',
  'Nwogu Iheanacho',
  'nwogu iheanacho abia state assembly osisioma north ypp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Ucheonye Stephen -- ABA CENTRAL (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_17c5a6a46f472edc', 'Ucheonye Stephen',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_17c5a6a46f472edc', 'ind_17c5a6a46f472edc', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ucheonye Stephen', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_17c5a6a46f472edc', 'prof_17c5a6a46f472edc',
  'Member, Abia State House of Assembly (ABA CENTRAL)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_17c5a6a46f472edc', 'ind_17c5a6a46f472edc', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_17c5a6a46f472edc', 'ind_17c5a6a46f472edc', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_17c5a6a46f472edc', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|aba central|2023',
  'insert', 'ind_17c5a6a46f472edc',
  'Unique: Abia ABA CENTRAL seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_17c5a6a46f472edc', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_17c5a6a46f472edc', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_17c5a6a46f472edc', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_aba_central',
  'ind_17c5a6a46f472edc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_17c5a6a46f472edc', 'seed_run_s05_political_abia_roster_20260502',
  'Abia ABA CENTRAL', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_17c5a6a46f472edc', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_17c5a6a46f472edc',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_17c5a6a46f472edc', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_17c5a6a46f472edc',
  'political_assignment', '{"constituency_inec": "ABA CENTRAL", "party_abbrev": "APGA", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_17c5a6a46f472edc', 'prof_17c5a6a46f472edc',
  'Ucheonye Stephen',
  'ucheonye stephen abia state assembly aba central apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Destiny Nwangwu -- ABA NORTH (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_97df9301d2a09b6e', 'Destiny Nwangwu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_97df9301d2a09b6e', 'ind_97df9301d2a09b6e', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Destiny Nwangwu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_97df9301d2a09b6e', 'prof_97df9301d2a09b6e',
  'Member, Abia State House of Assembly (ABA NORTH)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_97df9301d2a09b6e', 'ind_97df9301d2a09b6e', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_97df9301d2a09b6e', 'ind_97df9301d2a09b6e', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_97df9301d2a09b6e', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|aba north|2023',
  'insert', 'ind_97df9301d2a09b6e',
  'Unique: Abia ABA NORTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_97df9301d2a09b6e', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_97df9301d2a09b6e', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_97df9301d2a09b6e', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_aba_north',
  'ind_97df9301d2a09b6e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_97df9301d2a09b6e', 'seed_run_s05_political_abia_roster_20260502',
  'Abia ABA NORTH', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_97df9301d2a09b6e', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_97df9301d2a09b6e',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_97df9301d2a09b6e', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_97df9301d2a09b6e',
  'political_assignment', '{"constituency_inec": "ABA NORTH", "party_abbrev": "LP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_97df9301d2a09b6e', 'prof_97df9301d2a09b6e',
  'Destiny Nwangwu',
  'destiny nwangwu abia state assembly aba north lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Okoro Uchenna Kalu -- AROCHUKWU (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1caa2150cc96e09e', 'Okoro Uchenna Kalu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1caa2150cc96e09e', 'ind_1caa2150cc96e09e', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okoro Uchenna Kalu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1caa2150cc96e09e', 'prof_1caa2150cc96e09e',
  'Member, Abia State House of Assembly (AROCHUKWU)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1caa2150cc96e09e', 'ind_1caa2150cc96e09e', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1caa2150cc96e09e', 'ind_1caa2150cc96e09e', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1caa2150cc96e09e', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|arochukwu|2023',
  'insert', 'ind_1caa2150cc96e09e',
  'Unique: Abia AROCHUKWU seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1caa2150cc96e09e', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_1caa2150cc96e09e', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1caa2150cc96e09e', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_arochukwu',
  'ind_1caa2150cc96e09e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1caa2150cc96e09e', 'seed_run_s05_political_abia_roster_20260502',
  'Abia AROCHUKWU', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1caa2150cc96e09e', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_1caa2150cc96e09e',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1caa2150cc96e09e', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_1caa2150cc96e09e',
  'political_assignment', '{"constituency_inec": "AROCHUKWU", "party_abbrev": "LP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1caa2150cc96e09e', 'prof_1caa2150cc96e09e',
  'Okoro Uchenna Kalu',
  'okoro uchenna kalu abia state assembly arochukwu lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Nwoke Kalu Mba -- OHAFIA SOUTH (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7238dabbaf68cb32', 'Nwoke Kalu Mba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7238dabbaf68cb32', 'ind_7238dabbaf68cb32', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwoke Kalu Mba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7238dabbaf68cb32', 'prof_7238dabbaf68cb32',
  'Member, Abia State House of Assembly (OHAFIA SOUTH)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7238dabbaf68cb32', 'ind_7238dabbaf68cb32', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7238dabbaf68cb32', 'ind_7238dabbaf68cb32', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7238dabbaf68cb32', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|ohafia south|2023',
  'insert', 'ind_7238dabbaf68cb32',
  'Unique: Abia OHAFIA SOUTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7238dabbaf68cb32', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_7238dabbaf68cb32', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7238dabbaf68cb32', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_ohafia_south',
  'ind_7238dabbaf68cb32', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7238dabbaf68cb32', 'seed_run_s05_political_abia_roster_20260502',
  'Abia OHAFIA SOUTH', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7238dabbaf68cb32', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_7238dabbaf68cb32',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7238dabbaf68cb32', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_7238dabbaf68cb32',
  'political_assignment', '{"constituency_inec": "OHAFIA SOUTH", "party_abbrev": "LP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7238dabbaf68cb32', 'prof_7238dabbaf68cb32',
  'Nwoke Kalu Mba',
  'nwoke kalu mba abia state assembly ohafia south lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Emmanuel Ndubuisi -- BENDE SOUTH (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4aaef1c1b84804f5', 'Emmanuel Ndubuisi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4aaef1c1b84804f5', 'ind_4aaef1c1b84804f5', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Emmanuel Ndubuisi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4aaef1c1b84804f5', 'prof_4aaef1c1b84804f5',
  'Member, Abia State House of Assembly (BENDE SOUTH)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4aaef1c1b84804f5', 'ind_4aaef1c1b84804f5', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4aaef1c1b84804f5', 'ind_4aaef1c1b84804f5', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4aaef1c1b84804f5', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|bende south|2023',
  'insert', 'ind_4aaef1c1b84804f5',
  'Unique: Abia BENDE SOUTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4aaef1c1b84804f5', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_4aaef1c1b84804f5', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4aaef1c1b84804f5', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_bende_south',
  'ind_4aaef1c1b84804f5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4aaef1c1b84804f5', 'seed_run_s05_political_abia_roster_20260502',
  'Abia BENDE SOUTH', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4aaef1c1b84804f5', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_4aaef1c1b84804f5',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4aaef1c1b84804f5', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_4aaef1c1b84804f5',
  'political_assignment', '{"constituency_inec": "BENDE SOUTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4aaef1c1b84804f5', 'prof_4aaef1c1b84804f5',
  'Emmanuel Ndubuisi',
  'emmanuel ndubuisi abia state assembly bende south pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Nnamdi Ibekwe -- BENDE NORTH (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_33e363c2dd1ba56b', 'Nnamdi Ibekwe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_33e363c2dd1ba56b', 'ind_33e363c2dd1ba56b', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nnamdi Ibekwe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_33e363c2dd1ba56b', 'prof_33e363c2dd1ba56b',
  'Member, Abia State House of Assembly (BENDE NORTH)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_33e363c2dd1ba56b', 'ind_33e363c2dd1ba56b', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_33e363c2dd1ba56b', 'ind_33e363c2dd1ba56b', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_33e363c2dd1ba56b', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|bende north|2023',
  'insert', 'ind_33e363c2dd1ba56b',
  'Unique: Abia BENDE NORTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_33e363c2dd1ba56b', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_33e363c2dd1ba56b', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_33e363c2dd1ba56b', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_bende_north',
  'ind_33e363c2dd1ba56b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_33e363c2dd1ba56b', 'seed_run_s05_political_abia_roster_20260502',
  'Abia BENDE NORTH', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_33e363c2dd1ba56b', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_33e363c2dd1ba56b',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_33e363c2dd1ba56b', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_33e363c2dd1ba56b',
  'political_assignment', '{"constituency_inec": "BENDE NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_33e363c2dd1ba56b', 'prof_33e363c2dd1ba56b',
  'Nnamdi Ibekwe',
  'nnamdi ibekwe abia state assembly bende north pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Emeruwa Emmanuel -- ABA SOUTH (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8b28ede9150bedc5', 'Emeruwa Emmanuel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8b28ede9150bedc5', 'ind_8b28ede9150bedc5', 'individual', 'place_state_abia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Emeruwa Emmanuel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8b28ede9150bedc5', 'prof_8b28ede9150bedc5',
  'Member, Abia State House of Assembly (ABA SOUTH)',
  'place_state_abia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8b28ede9150bedc5', 'ind_8b28ede9150bedc5', 'term_ng_abia_state_assembly_10th_2023_2027',
  'place_state_abia', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8b28ede9150bedc5', 'ind_8b28ede9150bedc5', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8b28ede9150bedc5', 'seed_run_s05_political_abia_roster_20260502', 'individual',
  'ng_state_assembly_member|abia|aba south|2023',
  'insert', 'ind_8b28ede9150bedc5',
  'Unique: Abia ABA SOUTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8b28ede9150bedc5', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_8b28ede9150bedc5', 'seed_source_wikipedia_abia_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8b28ede9150bedc5', 'seed_run_s05_political_abia_roster_20260502', 'seed_source_wikipedia_abia_assembly_20260502',
  'abia_assembly_2023_aba_south',
  'ind_8b28ede9150bedc5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8b28ede9150bedc5', 'seed_run_s05_political_abia_roster_20260502',
  'Abia ABA SOUTH', 'place_state_abia', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8b28ede9150bedc5', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_8b28ede9150bedc5',
  'seed_source_wikipedia_abia_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8b28ede9150bedc5', 'seed_run_s05_political_abia_roster_20260502', 'individual', 'ind_8b28ede9150bedc5',
  'political_assignment', '{"constituency_inec": "ABA SOUTH", "party_abbrev": "LP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/Abia_State_House_of_Assembly"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8b28ede9150bedc5', 'prof_8b28ede9150bedc5',
  'Emeruwa Emmanuel',
  'emeruwa emmanuel abia state assembly aba south lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_abia',
  'political',
  unixepoch(), unixepoch()
);

