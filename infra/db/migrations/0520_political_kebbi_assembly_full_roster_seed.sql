-- ============================================================
-- Migration 0520: Kebbi State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Kebbi State House of Assembly Members
-- Members seeded: 24/24
-- Party breakdown: APC:16, PDP:4, A:2, ADC:2
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_kebbi_assembly_20260502',
  'NigerianLeaders – Complete List of Kebbi State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/kebbi-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_kebbi_roster_20260502', 'S05 Batch – Kebbi State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_kebbi_roster_20260502',
  'seed_run_s05_political_kebbi_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0520_political_kebbi_assembly_full_roster_seed.sql',
  NULL, 24,
  '24/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_kebbi_state_assembly_10th_2023_2027',
  'Kebbi State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_kebbi',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (24 of 24 seats) ──────────────────────────────────────

-- 01. Buhari Muhammad Aliero -- Aleiro (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_879f6ca0f76dc75d', 'Buhari Muhammad Aliero',
  'Buhari', 'Aliero', 'Buhari Muhammad Aliero',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_879f6ca0f76dc75d', 'ind_879f6ca0f76dc75d', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Buhari Muhammad Aliero', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_879f6ca0f76dc75d', 'prof_879f6ca0f76dc75d',
  'Member, Kebbi State House of Assembly (ALEIRO)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_879f6ca0f76dc75d', 'ind_879f6ca0f76dc75d', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_879f6ca0f76dc75d', 'ind_879f6ca0f76dc75d', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_879f6ca0f76dc75d', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|aleiro|2023',
  'insert', 'ind_879f6ca0f76dc75d',
  'Unique: Kebbi Aleiro seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_879f6ca0f76dc75d', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_879f6ca0f76dc75d', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_879f6ca0f76dc75d', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_aleiro',
  'ind_879f6ca0f76dc75d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_879f6ca0f76dc75d', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Aleiro', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_879f6ca0f76dc75d', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_879f6ca0f76dc75d',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_879f6ca0f76dc75d', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_879f6ca0f76dc75d',
  'political_assignment', '{"constituency_inec": "ALEIRO", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_879f6ca0f76dc75d', 'prof_879f6ca0f76dc75d',
  'Buhari Muhammad Aliero',
  'buhari muhammad aliero kebbi state assembly aleiro pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Usman Nura -- Arewa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fa7c3cfc39d11442', 'Usman Nura',
  'Usman', 'Nura', 'Usman Nura',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fa7c3cfc39d11442', 'ind_fa7c3cfc39d11442', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Usman Nura', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fa7c3cfc39d11442', 'prof_fa7c3cfc39d11442',
  'Member, Kebbi State House of Assembly (AREWA)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fa7c3cfc39d11442', 'ind_fa7c3cfc39d11442', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fa7c3cfc39d11442', 'ind_fa7c3cfc39d11442', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fa7c3cfc39d11442', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|arewa|2023',
  'insert', 'ind_fa7c3cfc39d11442',
  'Unique: Kebbi Arewa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fa7c3cfc39d11442', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_fa7c3cfc39d11442', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fa7c3cfc39d11442', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_arewa',
  'ind_fa7c3cfc39d11442', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fa7c3cfc39d11442', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Arewa', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fa7c3cfc39d11442', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_fa7c3cfc39d11442',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fa7c3cfc39d11442', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_fa7c3cfc39d11442',
  'political_assignment', '{"constituency_inec": "AREWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fa7c3cfc39d11442', 'prof_fa7c3cfc39d11442',
  'Usman Nura',
  'usman nura kebbi state assembly arewa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Na''Amore Umar Mohammed -- Argungu (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6d154c223f0fb59b', 'Na''Amore Umar Mohammed',
  'Na''Amore', 'Mohammed', 'Na''Amore Umar Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6d154c223f0fb59b', 'ind_6d154c223f0fb59b', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Na''Amore Umar Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6d154c223f0fb59b', 'prof_6d154c223f0fb59b',
  'Member, Kebbi State House of Assembly (ARGUNGU)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6d154c223f0fb59b', 'ind_6d154c223f0fb59b', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6d154c223f0fb59b', 'ind_6d154c223f0fb59b', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6d154c223f0fb59b', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|argungu|2023',
  'insert', 'ind_6d154c223f0fb59b',
  'Unique: Kebbi Argungu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6d154c223f0fb59b', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_6d154c223f0fb59b', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6d154c223f0fb59b', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_argungu',
  'ind_6d154c223f0fb59b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6d154c223f0fb59b', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Argungu', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6d154c223f0fb59b', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_6d154c223f0fb59b',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6d154c223f0fb59b', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_6d154c223f0fb59b',
  'political_assignment', '{"constituency_inec": "ARGUNGU", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6d154c223f0fb59b', 'prof_6d154c223f0fb59b',
  'Na''Amore Umar Mohammed',
  'na''amore umar mohammed kebbi state assembly argungu pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Garba Muhammad Sani Tiggi -- Augie (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7bd0ba45d41c64b7', 'Garba Muhammad Sani Tiggi',
  'Garba', 'Tiggi', 'Garba Muhammad Sani Tiggi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7bd0ba45d41c64b7', 'ind_7bd0ba45d41c64b7', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Garba Muhammad Sani Tiggi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7bd0ba45d41c64b7', 'prof_7bd0ba45d41c64b7',
  'Member, Kebbi State House of Assembly (AUGIE)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7bd0ba45d41c64b7', 'ind_7bd0ba45d41c64b7', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7bd0ba45d41c64b7', 'ind_7bd0ba45d41c64b7', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7bd0ba45d41c64b7', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|augie|2023',
  'insert', 'ind_7bd0ba45d41c64b7',
  'Unique: Kebbi Augie seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7bd0ba45d41c64b7', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_7bd0ba45d41c64b7', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7bd0ba45d41c64b7', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_augie',
  'ind_7bd0ba45d41c64b7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7bd0ba45d41c64b7', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Augie', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7bd0ba45d41c64b7', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_7bd0ba45d41c64b7',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7bd0ba45d41c64b7', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_7bd0ba45d41c64b7',
  'political_assignment', '{"constituency_inec": "AUGIE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7bd0ba45d41c64b7', 'prof_7bd0ba45d41c64b7',
  'Garba Muhammad Sani Tiggi',
  'garba muhammad sani tiggi kebbi state assembly augie apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Samaila Mohammed -- Bagudo East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7e8048ddb428067b', 'Samaila Mohammed',
  'Samaila', 'Mohammed', 'Samaila Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7e8048ddb428067b', 'ind_7e8048ddb428067b', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Samaila Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7e8048ddb428067b', 'prof_7e8048ddb428067b',
  'Member, Kebbi State House of Assembly (BAGUDO EAST)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7e8048ddb428067b', 'ind_7e8048ddb428067b', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7e8048ddb428067b', 'ind_7e8048ddb428067b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7e8048ddb428067b', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|bagudo east|2023',
  'insert', 'ind_7e8048ddb428067b',
  'Unique: Kebbi Bagudo East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7e8048ddb428067b', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_7e8048ddb428067b', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7e8048ddb428067b', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_bagudo_east',
  'ind_7e8048ddb428067b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7e8048ddb428067b', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Bagudo East', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7e8048ddb428067b', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_7e8048ddb428067b',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7e8048ddb428067b', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_7e8048ddb428067b',
  'political_assignment', '{"constituency_inec": "BAGUDO EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7e8048ddb428067b', 'prof_7e8048ddb428067b',
  'Samaila Mohammed',
  'samaila mohammed kebbi state assembly bagudo east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Abubakar Lolo Mohammed -- Bagudo West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f10ac39e983cce56', 'Abubakar Lolo Mohammed',
  'Abubakar', 'Mohammed', 'Abubakar Lolo Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f10ac39e983cce56', 'ind_f10ac39e983cce56', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Lolo Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f10ac39e983cce56', 'prof_f10ac39e983cce56',
  'Member, Kebbi State House of Assembly (BAGUDO WEST)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f10ac39e983cce56', 'ind_f10ac39e983cce56', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f10ac39e983cce56', 'ind_f10ac39e983cce56', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f10ac39e983cce56', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|bagudo west|2023',
  'insert', 'ind_f10ac39e983cce56',
  'Unique: Kebbi Bagudo West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f10ac39e983cce56', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_f10ac39e983cce56', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f10ac39e983cce56', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_bagudo_west',
  'ind_f10ac39e983cce56', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f10ac39e983cce56', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Bagudo West', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f10ac39e983cce56', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_f10ac39e983cce56',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f10ac39e983cce56', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_f10ac39e983cce56',
  'political_assignment', '{"constituency_inec": "BAGUDO WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f10ac39e983cce56', 'prof_f10ac39e983cce56',
  'Abubakar Lolo Mohammed',
  'abubakar lolo mohammed kebbi state assembly bagudo west apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Umar Hassan -- Birnin Kebbi North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_74245e34b6ffa586', 'Umar Hassan',
  'Umar', 'Hassan', 'Umar Hassan',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_74245e34b6ffa586', 'ind_74245e34b6ffa586', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umar Hassan', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_74245e34b6ffa586', 'prof_74245e34b6ffa586',
  'Member, Kebbi State House of Assembly (BIRNIN KEBBI NORTH)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_74245e34b6ffa586', 'ind_74245e34b6ffa586', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_74245e34b6ffa586', 'ind_74245e34b6ffa586', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_74245e34b6ffa586', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|birnin kebbi north|2023',
  'insert', 'ind_74245e34b6ffa586',
  'Unique: Kebbi Birnin Kebbi North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_74245e34b6ffa586', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_74245e34b6ffa586', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_74245e34b6ffa586', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_birnin_kebbi_north',
  'ind_74245e34b6ffa586', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_74245e34b6ffa586', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Birnin Kebbi North', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_74245e34b6ffa586', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_74245e34b6ffa586',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_74245e34b6ffa586', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_74245e34b6ffa586',
  'political_assignment', '{"constituency_inec": "BIRNIN KEBBI NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_74245e34b6ffa586', 'prof_74245e34b6ffa586',
  'Umar Hassan',
  'umar hassan kebbi state assembly birnin kebbi north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Shafaatu Muhammed -- Birnin Kebbi South (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ff5753b4ad00ab12', 'Shafaatu Muhammed',
  'Shafaatu', 'Muhammed', 'Shafaatu Muhammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ff5753b4ad00ab12', 'ind_ff5753b4ad00ab12', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Shafaatu Muhammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ff5753b4ad00ab12', 'prof_ff5753b4ad00ab12',
  'Member, Kebbi State House of Assembly (BIRNIN KEBBI SOUTH)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ff5753b4ad00ab12', 'ind_ff5753b4ad00ab12', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ff5753b4ad00ab12', 'ind_ff5753b4ad00ab12', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ff5753b4ad00ab12', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|birnin kebbi south|2023',
  'insert', 'ind_ff5753b4ad00ab12',
  'Unique: Kebbi Birnin Kebbi South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ff5753b4ad00ab12', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_ff5753b4ad00ab12', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ff5753b4ad00ab12', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_birnin_kebbi_south',
  'ind_ff5753b4ad00ab12', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ff5753b4ad00ab12', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Birnin Kebbi South', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ff5753b4ad00ab12', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_ff5753b4ad00ab12',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ff5753b4ad00ab12', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_ff5753b4ad00ab12',
  'political_assignment', '{"constituency_inec": "BIRNIN KEBBI SOUTH", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ff5753b4ad00ab12', 'prof_ff5753b4ad00ab12',
  'Shafaatu Muhammed',
  'shafaatu muhammed kebbi state assembly birnin kebbi south a politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Abubakar Yusuf Tilli -- Bunza (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_672f72f8772d87ad', 'Abubakar Yusuf Tilli',
  'Abubakar', 'Tilli', 'Abubakar Yusuf Tilli',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_672f72f8772d87ad', 'ind_672f72f8772d87ad', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Yusuf Tilli', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_672f72f8772d87ad', 'prof_672f72f8772d87ad',
  'Member, Kebbi State House of Assembly (BUNZA)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_672f72f8772d87ad', 'ind_672f72f8772d87ad', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_672f72f8772d87ad', 'ind_672f72f8772d87ad', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_672f72f8772d87ad', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|bunza|2023',
  'insert', 'ind_672f72f8772d87ad',
  'Unique: Kebbi Bunza seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_672f72f8772d87ad', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_672f72f8772d87ad', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_672f72f8772d87ad', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_bunza',
  'ind_672f72f8772d87ad', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_672f72f8772d87ad', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Bunza', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_672f72f8772d87ad', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_672f72f8772d87ad',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_672f72f8772d87ad', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_672f72f8772d87ad',
  'political_assignment', '{"constituency_inec": "BUNZA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_672f72f8772d87ad', 'prof_672f72f8772d87ad',
  'Abubakar Yusuf Tilli',
  'abubakar yusuf tilli kebbi state assembly bunza pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Aliyu Ma''Aruf -- Dandi (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ec670ef6c8a8de48', 'Aliyu Ma''Aruf',
  'Aliyu', 'Ma''Aruf', 'Aliyu Ma''Aruf',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ec670ef6c8a8de48', 'ind_ec670ef6c8a8de48', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aliyu Ma''Aruf', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ec670ef6c8a8de48', 'prof_ec670ef6c8a8de48',
  'Member, Kebbi State House of Assembly (DANDI)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ec670ef6c8a8de48', 'ind_ec670ef6c8a8de48', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ec670ef6c8a8de48', 'ind_ec670ef6c8a8de48', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ec670ef6c8a8de48', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|dandi|2023',
  'insert', 'ind_ec670ef6c8a8de48',
  'Unique: Kebbi Dandi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ec670ef6c8a8de48', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_ec670ef6c8a8de48', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ec670ef6c8a8de48', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_dandi',
  'ind_ec670ef6c8a8de48', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ec670ef6c8a8de48', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Dandi', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ec670ef6c8a8de48', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_ec670ef6c8a8de48',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ec670ef6c8a8de48', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_ec670ef6c8a8de48',
  'political_assignment', '{"constituency_inec": "DANDI", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ec670ef6c8a8de48', 'prof_ec670ef6c8a8de48',
  'Aliyu Ma''Aruf',
  'aliyu ma''aruf kebbi state assembly dandi adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Haruna Lawal Gele -- Fakai (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cc30c8b2dfe06762', 'Haruna Lawal Gele',
  'Haruna', 'Gele', 'Haruna Lawal Gele',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cc30c8b2dfe06762', 'ind_cc30c8b2dfe06762', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Haruna Lawal Gele', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cc30c8b2dfe06762', 'prof_cc30c8b2dfe06762',
  'Member, Kebbi State House of Assembly (FAKAI)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cc30c8b2dfe06762', 'ind_cc30c8b2dfe06762', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cc30c8b2dfe06762', 'ind_cc30c8b2dfe06762', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cc30c8b2dfe06762', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|fakai|2023',
  'insert', 'ind_cc30c8b2dfe06762',
  'Unique: Kebbi Fakai seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cc30c8b2dfe06762', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_cc30c8b2dfe06762', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cc30c8b2dfe06762', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_fakai',
  'ind_cc30c8b2dfe06762', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cc30c8b2dfe06762', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Fakai', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cc30c8b2dfe06762', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_cc30c8b2dfe06762',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cc30c8b2dfe06762', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_cc30c8b2dfe06762',
  'political_assignment', '{"constituency_inec": "FAKAI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cc30c8b2dfe06762', 'prof_cc30c8b2dfe06762',
  'Haruna Lawal Gele',
  'haruna lawal gele kebbi state assembly fakai apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Labbo Habibu -- Gwandu (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ec57040ea6425dda', 'Labbo Habibu',
  'Labbo', 'Habibu', 'Labbo Habibu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ec57040ea6425dda', 'ind_ec57040ea6425dda', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Labbo Habibu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ec57040ea6425dda', 'prof_ec57040ea6425dda',
  'Member, Kebbi State House of Assembly (GWANDU)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ec57040ea6425dda', 'ind_ec57040ea6425dda', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ec57040ea6425dda', 'ind_ec57040ea6425dda', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ec57040ea6425dda', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|gwandu|2023',
  'insert', 'ind_ec57040ea6425dda',
  'Unique: Kebbi Gwandu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ec57040ea6425dda', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_ec57040ea6425dda', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ec57040ea6425dda', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_gwandu',
  'ind_ec57040ea6425dda', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ec57040ea6425dda', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Gwandu', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ec57040ea6425dda', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_ec57040ea6425dda',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ec57040ea6425dda', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_ec57040ea6425dda',
  'political_assignment', '{"constituency_inec": "GWANDU", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ec57040ea6425dda', 'prof_ec57040ea6425dda',
  'Labbo Habibu',
  'labbo habibu kebbi state assembly gwandu pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Aliyu Faruku -- Jega (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_39137088001fe8a5', 'Aliyu Faruku',
  'Aliyu', 'Faruku', 'Aliyu Faruku',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_39137088001fe8a5', 'ind_39137088001fe8a5', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aliyu Faruku', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_39137088001fe8a5', 'prof_39137088001fe8a5',
  'Member, Kebbi State House of Assembly (JEGA)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_39137088001fe8a5', 'ind_39137088001fe8a5', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_39137088001fe8a5', 'ind_39137088001fe8a5', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_39137088001fe8a5', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|jega|2023',
  'insert', 'ind_39137088001fe8a5',
  'Unique: Kebbi Jega seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_39137088001fe8a5', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_39137088001fe8a5', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_39137088001fe8a5', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_jega',
  'ind_39137088001fe8a5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_39137088001fe8a5', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Jega', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_39137088001fe8a5', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_39137088001fe8a5',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_39137088001fe8a5', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_39137088001fe8a5',
  'political_assignment', '{"constituency_inec": "JEGA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_39137088001fe8a5', 'prof_39137088001fe8a5',
  'Aliyu Faruku',
  'aliyu faruku kebbi state assembly jega apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Abubakar Kamaludeen -- Kalgo (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6faf5d9aaca18cd2', 'Abubakar Kamaludeen',
  'Abubakar', 'Kamaludeen', 'Abubakar Kamaludeen',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6faf5d9aaca18cd2', 'ind_6faf5d9aaca18cd2', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Kamaludeen', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6faf5d9aaca18cd2', 'prof_6faf5d9aaca18cd2',
  'Member, Kebbi State House of Assembly (KALGO)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6faf5d9aaca18cd2', 'ind_6faf5d9aaca18cd2', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6faf5d9aaca18cd2', 'ind_6faf5d9aaca18cd2', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6faf5d9aaca18cd2', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|kalgo|2023',
  'insert', 'ind_6faf5d9aaca18cd2',
  'Unique: Kebbi Kalgo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6faf5d9aaca18cd2', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_6faf5d9aaca18cd2', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6faf5d9aaca18cd2', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_kalgo',
  'ind_6faf5d9aaca18cd2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6faf5d9aaca18cd2', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Kalgo', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6faf5d9aaca18cd2', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_6faf5d9aaca18cd2',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6faf5d9aaca18cd2', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_6faf5d9aaca18cd2',
  'political_assignment', '{"constituency_inec": "KALGO", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6faf5d9aaca18cd2', 'prof_6faf5d9aaca18cd2',
  'Abubakar Kamaludeen',
  'abubakar kamaludeen kebbi state assembly kalgo adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Abubakar Imam Besse -- Koko/Besse (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_74241c63a6682be2', 'Abubakar Imam Besse',
  'Abubakar', 'Besse', 'Abubakar Imam Besse',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_74241c63a6682be2', 'ind_74241c63a6682be2', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Imam Besse', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_74241c63a6682be2', 'prof_74241c63a6682be2',
  'Member, Kebbi State House of Assembly (KOKO/BESSE)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_74241c63a6682be2', 'ind_74241c63a6682be2', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_74241c63a6682be2', 'ind_74241c63a6682be2', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_74241c63a6682be2', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|koko/besse|2023',
  'insert', 'ind_74241c63a6682be2',
  'Unique: Kebbi Koko/Besse seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_74241c63a6682be2', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_74241c63a6682be2', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_74241c63a6682be2', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_koko/besse',
  'ind_74241c63a6682be2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_74241c63a6682be2', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Koko/Besse', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_74241c63a6682be2', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_74241c63a6682be2',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_74241c63a6682be2', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_74241c63a6682be2',
  'political_assignment', '{"constituency_inec": "KOKO/BESSE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_74241c63a6682be2', 'prof_74241c63a6682be2',
  'Abubakar Imam Besse',
  'abubakar imam besse kebbi state assembly koko/besse apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Umaru Salah Sambawa -- Maiyama (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d94ec3afcff0e41e', 'Umaru Salah Sambawa',
  'Umaru', 'Sambawa', 'Umaru Salah Sambawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d94ec3afcff0e41e', 'ind_d94ec3afcff0e41e', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umaru Salah Sambawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d94ec3afcff0e41e', 'prof_d94ec3afcff0e41e',
  'Member, Kebbi State House of Assembly (MAIYAMA)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d94ec3afcff0e41e', 'ind_d94ec3afcff0e41e', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d94ec3afcff0e41e', 'ind_d94ec3afcff0e41e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d94ec3afcff0e41e', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|maiyama|2023',
  'insert', 'ind_d94ec3afcff0e41e',
  'Unique: Kebbi Maiyama seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d94ec3afcff0e41e', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_d94ec3afcff0e41e', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d94ec3afcff0e41e', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_maiyama',
  'ind_d94ec3afcff0e41e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d94ec3afcff0e41e', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Maiyama', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d94ec3afcff0e41e', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_d94ec3afcff0e41e',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d94ec3afcff0e41e', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_d94ec3afcff0e41e',
  'political_assignment', '{"constituency_inec": "MAIYAMA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d94ec3afcff0e41e', 'prof_d94ec3afcff0e41e',
  'Umaru Salah Sambawa',
  'umaru salah sambawa kebbi state assembly maiyama apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Muhammad Adamu Birnin Yauri -- Ngaski (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9e66cf805911afc9', 'Muhammad Adamu Birnin Yauri',
  'Muhammad', 'Yauri', 'Muhammad Adamu Birnin Yauri',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9e66cf805911afc9', 'ind_9e66cf805911afc9', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammad Adamu Birnin Yauri', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9e66cf805911afc9', 'prof_9e66cf805911afc9',
  'Member, Kebbi State House of Assembly (NGASKI)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9e66cf805911afc9', 'ind_9e66cf805911afc9', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9e66cf805911afc9', 'ind_9e66cf805911afc9', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9e66cf805911afc9', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|ngaski|2023',
  'insert', 'ind_9e66cf805911afc9',
  'Unique: Kebbi Ngaski seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9e66cf805911afc9', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_9e66cf805911afc9', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9e66cf805911afc9', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_ngaski',
  'ind_9e66cf805911afc9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9e66cf805911afc9', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Ngaski', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9e66cf805911afc9', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_9e66cf805911afc9',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9e66cf805911afc9', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_9e66cf805911afc9',
  'political_assignment', '{"constituency_inec": "NGASKI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9e66cf805911afc9', 'prof_9e66cf805911afc9',
  'Muhammad Adamu Birnin Yauri',
  'muhammad adamu birnin yauri kebbi state assembly ngaski apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Dangoje Salihu M -- Sakaba (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1901fb026f5bf65a', 'Dangoje Salihu M',
  'Dangoje', 'M', 'Dangoje Salihu M',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1901fb026f5bf65a', 'ind_1901fb026f5bf65a', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dangoje Salihu M', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1901fb026f5bf65a', 'prof_1901fb026f5bf65a',
  'Member, Kebbi State House of Assembly (SAKABA)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1901fb026f5bf65a', 'ind_1901fb026f5bf65a', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1901fb026f5bf65a', 'ind_1901fb026f5bf65a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1901fb026f5bf65a', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|sakaba|2023',
  'insert', 'ind_1901fb026f5bf65a',
  'Unique: Kebbi Sakaba seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1901fb026f5bf65a', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_1901fb026f5bf65a', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1901fb026f5bf65a', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_sakaba',
  'ind_1901fb026f5bf65a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1901fb026f5bf65a', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Sakaba', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1901fb026f5bf65a', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_1901fb026f5bf65a',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1901fb026f5bf65a', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_1901fb026f5bf65a',
  'political_assignment', '{"constituency_inec": "SAKABA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1901fb026f5bf65a', 'prof_1901fb026f5bf65a',
  'Dangoje Salihu M',
  'dangoje salihu m kebbi state assembly sakaba apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Tukur Mohammed -- Shanga (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6044a7e6b5817570', 'Tukur Mohammed',
  'Tukur', 'Mohammed', 'Tukur Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6044a7e6b5817570', 'ind_6044a7e6b5817570', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Tukur Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6044a7e6b5817570', 'prof_6044a7e6b5817570',
  'Member, Kebbi State House of Assembly (SHANGA)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6044a7e6b5817570', 'ind_6044a7e6b5817570', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6044a7e6b5817570', 'ind_6044a7e6b5817570', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6044a7e6b5817570', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|shanga|2023',
  'insert', 'ind_6044a7e6b5817570',
  'Unique: Kebbi Shanga seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6044a7e6b5817570', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_6044a7e6b5817570', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6044a7e6b5817570', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_shanga',
  'ind_6044a7e6b5817570', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6044a7e6b5817570', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Shanga', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6044a7e6b5817570', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_6044a7e6b5817570',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6044a7e6b5817570', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_6044a7e6b5817570',
  'political_assignment', '{"constituency_inec": "SHANGA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6044a7e6b5817570', 'prof_6044a7e6b5817570',
  'Tukur Mohammed',
  'tukur mohammed kebbi state assembly shanga apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Abubakar Faruku -- Suru (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_62446140b124a393', 'Abubakar Faruku',
  'Abubakar', 'Faruku', 'Abubakar Faruku',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_62446140b124a393', 'ind_62446140b124a393', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Faruku', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_62446140b124a393', 'prof_62446140b124a393',
  'Member, Kebbi State House of Assembly (SURU)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_62446140b124a393', 'ind_62446140b124a393', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_62446140b124a393', 'ind_62446140b124a393', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_62446140b124a393', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|suru|2023',
  'insert', 'ind_62446140b124a393',
  'Unique: Kebbi Suru seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_62446140b124a393', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_62446140b124a393', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_62446140b124a393', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_suru',
  'ind_62446140b124a393', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_62446140b124a393', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Suru', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_62446140b124a393', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_62446140b124a393',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_62446140b124a393', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_62446140b124a393',
  'political_assignment', '{"constituency_inec": "SURU", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_62446140b124a393', 'prof_62446140b124a393',
  'Abubakar Faruku',
  'abubakar faruku kebbi state assembly suru apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Suleman Yahusa Kwaifa -- Wasagu/Danko East (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e11df435a41b5051', 'Suleman Yahusa Kwaifa',
  'Suleman', 'Kwaifa', 'Suleman Yahusa Kwaifa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e11df435a41b5051', 'ind_e11df435a41b5051', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Suleman Yahusa Kwaifa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e11df435a41b5051', 'prof_e11df435a41b5051',
  'Member, Kebbi State House of Assembly (WASAGU/DANKO EAST)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e11df435a41b5051', 'ind_e11df435a41b5051', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e11df435a41b5051', 'ind_e11df435a41b5051', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e11df435a41b5051', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|wasagu/danko east|2023',
  'insert', 'ind_e11df435a41b5051',
  'Unique: Kebbi Wasagu/Danko East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e11df435a41b5051', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_e11df435a41b5051', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e11df435a41b5051', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_wasagu/danko_east',
  'ind_e11df435a41b5051', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e11df435a41b5051', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Wasagu/Danko East', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e11df435a41b5051', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_e11df435a41b5051',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e11df435a41b5051', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_e11df435a41b5051',
  'political_assignment', '{"constituency_inec": "WASAGU/DANKO EAST", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e11df435a41b5051', 'prof_e11df435a41b5051',
  'Suleman Yahusa Kwaifa',
  'suleman yahusa kwaifa kebbi state assembly wasagu/danko east a politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Danjuma Abdullahi -- Wasagu/Danko West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_51ac29992eee64dd', 'Danjuma Abdullahi',
  'Danjuma', 'Abdullahi', 'Danjuma Abdullahi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_51ac29992eee64dd', 'ind_51ac29992eee64dd', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Danjuma Abdullahi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_51ac29992eee64dd', 'prof_51ac29992eee64dd',
  'Member, Kebbi State House of Assembly (WASAGU/DANKO WEST)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_51ac29992eee64dd', 'ind_51ac29992eee64dd', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_51ac29992eee64dd', 'ind_51ac29992eee64dd', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_51ac29992eee64dd', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|wasagu/danko west|2023',
  'insert', 'ind_51ac29992eee64dd',
  'Unique: Kebbi Wasagu/Danko West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_51ac29992eee64dd', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_51ac29992eee64dd', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_51ac29992eee64dd', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_wasagu/danko_west',
  'ind_51ac29992eee64dd', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_51ac29992eee64dd', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Wasagu/Danko West', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_51ac29992eee64dd', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_51ac29992eee64dd',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_51ac29992eee64dd', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_51ac29992eee64dd',
  'political_assignment', '{"constituency_inec": "WASAGU/DANKO WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_51ac29992eee64dd', 'prof_51ac29992eee64dd',
  'Danjuma Abdullahi',
  'danjuma abdullahi kebbi state assembly wasagu/danko west apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Yusuf Sani Rukubalo -- Yauri (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_18d89d3c6c10f0e6', 'Yusuf Sani Rukubalo',
  'Yusuf', 'Rukubalo', 'Yusuf Sani Rukubalo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_18d89d3c6c10f0e6', 'ind_18d89d3c6c10f0e6', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yusuf Sani Rukubalo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_18d89d3c6c10f0e6', 'prof_18d89d3c6c10f0e6',
  'Member, Kebbi State House of Assembly (YAURI)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_18d89d3c6c10f0e6', 'ind_18d89d3c6c10f0e6', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_18d89d3c6c10f0e6', 'ind_18d89d3c6c10f0e6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_18d89d3c6c10f0e6', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|yauri|2023',
  'insert', 'ind_18d89d3c6c10f0e6',
  'Unique: Kebbi Yauri seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_18d89d3c6c10f0e6', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_18d89d3c6c10f0e6', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_18d89d3c6c10f0e6', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_yauri',
  'ind_18d89d3c6c10f0e6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_18d89d3c6c10f0e6', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Yauri', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_18d89d3c6c10f0e6', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_18d89d3c6c10f0e6',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_18d89d3c6c10f0e6', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_18d89d3c6c10f0e6',
  'political_assignment', '{"constituency_inec": "YAURI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_18d89d3c6c10f0e6', 'prof_18d89d3c6c10f0e6',
  'Yusuf Sani Rukubalo',
  'yusuf sani rukubalo kebbi state assembly yauri apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Usman Mohammed -- Zuru (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b522c282b7f138ba', 'Usman Mohammed',
  'Usman', 'Mohammed', 'Usman Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b522c282b7f138ba', 'ind_b522c282b7f138ba', 'individual', 'place_state_kebbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Usman Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b522c282b7f138ba', 'prof_b522c282b7f138ba',
  'Member, Kebbi State House of Assembly (ZURU)',
  'place_state_kebbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b522c282b7f138ba', 'ind_b522c282b7f138ba', 'term_ng_kebbi_state_assembly_10th_2023_2027',
  'place_state_kebbi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b522c282b7f138ba', 'ind_b522c282b7f138ba', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b522c282b7f138ba', 'seed_run_s05_political_kebbi_roster_20260502', 'individual',
  'ng_state_assembly_member|kebbi|zuru|2023',
  'insert', 'ind_b522c282b7f138ba',
  'Unique: Kebbi Zuru seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b522c282b7f138ba', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_b522c282b7f138ba', 'seed_source_nigerianleaders_kebbi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b522c282b7f138ba', 'seed_run_s05_political_kebbi_roster_20260502', 'seed_source_nigerianleaders_kebbi_assembly_20260502',
  'nl_kebbi_assembly_2023_zuru',
  'ind_b522c282b7f138ba', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b522c282b7f138ba', 'seed_run_s05_political_kebbi_roster_20260502',
  'Kebbi Zuru', 'place_state_kebbi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b522c282b7f138ba', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_b522c282b7f138ba',
  'seed_source_nigerianleaders_kebbi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b522c282b7f138ba', 'seed_run_s05_political_kebbi_roster_20260502', 'individual', 'ind_b522c282b7f138ba',
  'political_assignment', '{"constituency_inec": "ZURU", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kebbi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b522c282b7f138ba', 'prof_b522c282b7f138ba',
  'Usman Mohammed',
  'usman mohammed kebbi state assembly zuru apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kebbi',
  'political',
  unixepoch(), unixepoch()
);

