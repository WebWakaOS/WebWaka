-- ============================================================
-- Migration 0511: Ebonyi State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Ebonyi State House of Assembly Members
-- Members seeded: 24/24
-- Party breakdown: PDP:12, APC:11, LP:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'NigerianLeaders – Complete List of Ebonyi State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_ebonyi_roster_20260502', 'S05 Batch – Ebonyi State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_ebonyi_roster_20260502',
  'seed_run_s05_political_ebonyi_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0511_political_ebonyi_assembly_full_roster_seed.sql',
  NULL, 24,
  '24/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'Ebonyi State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_ebonyi',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (24 of 24 seats) ──────────────────────────────────────

-- 01. Nwoke Victor Chidi -- Abakaliki North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9e5b884d9da306c2', 'Nwoke Victor Chidi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9e5b884d9da306c2', 'ind_9e5b884d9da306c2', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwoke Victor Chidi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9e5b884d9da306c2', 'prof_9e5b884d9da306c2',
  'Member, Ebonyi State House of Assembly (ABAKALIKI NORTH)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9e5b884d9da306c2', 'ind_9e5b884d9da306c2', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9e5b884d9da306c2', 'ind_9e5b884d9da306c2', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9e5b884d9da306c2', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|abakaliki north|2023',
  'insert', 'ind_9e5b884d9da306c2',
  'Unique: Ebonyi Abakaliki North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9e5b884d9da306c2', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9e5b884d9da306c2', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9e5b884d9da306c2', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_abakaliki_north',
  'ind_9e5b884d9da306c2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9e5b884d9da306c2', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Abakaliki North', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9e5b884d9da306c2', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9e5b884d9da306c2',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9e5b884d9da306c2', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9e5b884d9da306c2',
  'political_assignment', '{"constituency_inec": "ABAKALIKI NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9e5b884d9da306c2', 'prof_9e5b884d9da306c2',
  'Nwoke Victor Chidi',
  'nwoke victor chidi ebonyi state assembly abakaliki north pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Ununu Joseph Ogodo -- Abakaliki South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_61a02c8610e0dbaf', 'Ununu Joseph Ogodo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_61a02c8610e0dbaf', 'ind_61a02c8610e0dbaf', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ununu Joseph Ogodo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_61a02c8610e0dbaf', 'prof_61a02c8610e0dbaf',
  'Member, Ebonyi State House of Assembly (ABAKALIKI SOUTH)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_61a02c8610e0dbaf', 'ind_61a02c8610e0dbaf', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_61a02c8610e0dbaf', 'ind_61a02c8610e0dbaf', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_61a02c8610e0dbaf', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|abakaliki south|2023',
  'insert', 'ind_61a02c8610e0dbaf',
  'Unique: Ebonyi Abakaliki South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_61a02c8610e0dbaf', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_61a02c8610e0dbaf', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_61a02c8610e0dbaf', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_abakaliki_south',
  'ind_61a02c8610e0dbaf', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_61a02c8610e0dbaf', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Abakaliki South', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_61a02c8610e0dbaf', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_61a02c8610e0dbaf',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_61a02c8610e0dbaf', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_61a02c8610e0dbaf',
  'political_assignment', '{"constituency_inec": "ABAKALIKI SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_61a02c8610e0dbaf', 'prof_61a02c8610e0dbaf',
  'Ununu Joseph Ogodo',
  'ununu joseph ogodo ebonyi state assembly abakaliki south apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Eziuloh Lilian Ngozi -- Afikpo North East (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9fcfb0448bddb371', 'Eziuloh Lilian Ngozi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9fcfb0448bddb371', 'ind_9fcfb0448bddb371', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Eziuloh Lilian Ngozi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9fcfb0448bddb371', 'prof_9fcfb0448bddb371',
  'Member, Ebonyi State House of Assembly (AFIKPO NORTH EAST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9fcfb0448bddb371', 'ind_9fcfb0448bddb371', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9fcfb0448bddb371', 'ind_9fcfb0448bddb371', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9fcfb0448bddb371', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|afikpo north east|2023',
  'insert', 'ind_9fcfb0448bddb371',
  'Unique: Ebonyi Afikpo North East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9fcfb0448bddb371', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9fcfb0448bddb371', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9fcfb0448bddb371', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_afikpo_north_east',
  'ind_9fcfb0448bddb371', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9fcfb0448bddb371', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Afikpo North East', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9fcfb0448bddb371', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9fcfb0448bddb371',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9fcfb0448bddb371', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9fcfb0448bddb371',
  'political_assignment', '{"constituency_inec": "AFIKPO NORTH EAST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9fcfb0448bddb371', 'prof_9fcfb0448bddb371',
  'Eziuloh Lilian Ngozi',
  'eziuloh lilian ngozi ebonyi state assembly afikpo north east pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Ikoro Kingsley Ogbonna -- Afikpo North West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_45db11ccb5da69ba', 'Ikoro Kingsley Ogbonna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_45db11ccb5da69ba', 'ind_45db11ccb5da69ba', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ikoro Kingsley Ogbonna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_45db11ccb5da69ba', 'prof_45db11ccb5da69ba',
  'Member, Ebonyi State House of Assembly (AFIKPO NORTH WEST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_45db11ccb5da69ba', 'ind_45db11ccb5da69ba', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_45db11ccb5da69ba', 'ind_45db11ccb5da69ba', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_45db11ccb5da69ba', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|afikpo north west|2023',
  'insert', 'ind_45db11ccb5da69ba',
  'Unique: Ebonyi Afikpo North West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_45db11ccb5da69ba', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_45db11ccb5da69ba', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_45db11ccb5da69ba', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_afikpo_north_west',
  'ind_45db11ccb5da69ba', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_45db11ccb5da69ba', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Afikpo North West', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_45db11ccb5da69ba', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_45db11ccb5da69ba',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_45db11ccb5da69ba', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_45db11ccb5da69ba',
  'political_assignment', '{"constituency_inec": "AFIKPO NORTH WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_45db11ccb5da69ba', 'prof_45db11ccb5da69ba',
  'Ikoro Kingsley Ogbonna',
  'ikoro kingsley ogbonna ebonyi state assembly afikpo north west apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Ejem Chidi Emerole -- Afikpo South East (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a293e6578a88a918', 'Ejem Chidi Emerole',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a293e6578a88a918', 'ind_a293e6578a88a918', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ejem Chidi Emerole', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a293e6578a88a918', 'prof_a293e6578a88a918',
  'Member, Ebonyi State House of Assembly (AFIKPO SOUTH EAST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a293e6578a88a918', 'ind_a293e6578a88a918', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a293e6578a88a918', 'ind_a293e6578a88a918', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a293e6578a88a918', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|afikpo south east|2023',
  'insert', 'ind_a293e6578a88a918',
  'Unique: Ebonyi Afikpo South East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a293e6578a88a918', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_a293e6578a88a918', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a293e6578a88a918', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_afikpo_south_east',
  'ind_a293e6578a88a918', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a293e6578a88a918', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Afikpo South East', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a293e6578a88a918', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_a293e6578a88a918',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a293e6578a88a918', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_a293e6578a88a918',
  'political_assignment', '{"constituency_inec": "AFIKPO SOUTH EAST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a293e6578a88a918', 'prof_a293e6578a88a918',
  'Ejem Chidi Emerole',
  'ejem chidi emerole ebonyi state assembly afikpo south east pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Onuma Okoro Nkemka -- Afikpo South West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a0e31aa5637cfd89', 'Onuma Okoro Nkemka',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a0e31aa5637cfd89', 'ind_a0e31aa5637cfd89', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Onuma Okoro Nkemka', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a0e31aa5637cfd89', 'prof_a0e31aa5637cfd89',
  'Member, Ebonyi State House of Assembly (AFIKPO SOUTH WEST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a0e31aa5637cfd89', 'ind_a0e31aa5637cfd89', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a0e31aa5637cfd89', 'ind_a0e31aa5637cfd89', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a0e31aa5637cfd89', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|afikpo south west|2023',
  'insert', 'ind_a0e31aa5637cfd89',
  'Unique: Ebonyi Afikpo South West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a0e31aa5637cfd89', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_a0e31aa5637cfd89', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a0e31aa5637cfd89', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_afikpo_south_west',
  'ind_a0e31aa5637cfd89', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a0e31aa5637cfd89', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Afikpo South West', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a0e31aa5637cfd89', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_a0e31aa5637cfd89',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a0e31aa5637cfd89', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_a0e31aa5637cfd89',
  'political_assignment', '{"constituency_inec": "AFIKPO SOUTH WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a0e31aa5637cfd89', 'prof_a0e31aa5637cfd89',
  'Onuma Okoro Nkemka',
  'onuma okoro nkemka ebonyi state assembly afikpo south west apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Akam-Alo Maduabuchi Nwogbaga -- Ebonyi North East (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e3c8ce1f57bc457c', 'Akam-Alo Maduabuchi Nwogbaga',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e3c8ce1f57bc457c', 'ind_e3c8ce1f57bc457c', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akam-Alo Maduabuchi Nwogbaga', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e3c8ce1f57bc457c', 'prof_e3c8ce1f57bc457c',
  'Member, Ebonyi State House of Assembly (EBONYI NORTH EAST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e3c8ce1f57bc457c', 'ind_e3c8ce1f57bc457c', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e3c8ce1f57bc457c', 'ind_e3c8ce1f57bc457c', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e3c8ce1f57bc457c', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ebonyi north east|2023',
  'insert', 'ind_e3c8ce1f57bc457c',
  'Unique: Ebonyi Ebonyi North East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e3c8ce1f57bc457c', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_e3c8ce1f57bc457c', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e3c8ce1f57bc457c', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ebonyi_north_east',
  'ind_e3c8ce1f57bc457c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e3c8ce1f57bc457c', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ebonyi North East', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e3c8ce1f57bc457c', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_e3c8ce1f57bc457c',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e3c8ce1f57bc457c', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_e3c8ce1f57bc457c',
  'political_assignment', '{"constituency_inec": "EBONYI NORTH EAST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e3c8ce1f57bc457c', 'prof_e3c8ce1f57bc457c',
  'Akam-Alo Maduabuchi Nwogbaga',
  'akam-alo maduabuchi nwogbaga ebonyi state assembly ebonyi north east pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Iteshi Obinna Nwenu -- Ebonyi North West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e4ee04cf178fc895', 'Iteshi Obinna Nwenu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e4ee04cf178fc895', 'ind_e4ee04cf178fc895', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Iteshi Obinna Nwenu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e4ee04cf178fc895', 'prof_e4ee04cf178fc895',
  'Member, Ebonyi State House of Assembly (EBONYI NORTH WEST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e4ee04cf178fc895', 'ind_e4ee04cf178fc895', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e4ee04cf178fc895', 'ind_e4ee04cf178fc895', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e4ee04cf178fc895', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ebonyi north west|2023',
  'insert', 'ind_e4ee04cf178fc895',
  'Unique: Ebonyi Ebonyi North West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e4ee04cf178fc895', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_e4ee04cf178fc895', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e4ee04cf178fc895', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ebonyi_north_west',
  'ind_e4ee04cf178fc895', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e4ee04cf178fc895', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ebonyi North West', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e4ee04cf178fc895', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_e4ee04cf178fc895',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e4ee04cf178fc895', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_e4ee04cf178fc895',
  'political_assignment', '{"constituency_inec": "EBONYI NORTH WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e4ee04cf178fc895', 'prof_e4ee04cf178fc895',
  'Iteshi Obinna Nwenu',
  'iteshi obinna nwenu ebonyi state assembly ebonyi north west pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Nwuhuo Linus Friday -- Ezza North East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_656e925bd8e956da', 'Nwuhuo Linus Friday',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_656e925bd8e956da', 'ind_656e925bd8e956da', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwuhuo Linus Friday', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_656e925bd8e956da', 'prof_656e925bd8e956da',
  'Member, Ebonyi State House of Assembly (EZZA NORTH EAST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_656e925bd8e956da', 'ind_656e925bd8e956da', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_656e925bd8e956da', 'ind_656e925bd8e956da', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_656e925bd8e956da', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ezza north east|2023',
  'insert', 'ind_656e925bd8e956da',
  'Unique: Ebonyi Ezza North East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_656e925bd8e956da', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_656e925bd8e956da', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_656e925bd8e956da', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ezza_north_east',
  'ind_656e925bd8e956da', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_656e925bd8e956da', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ezza North East', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_656e925bd8e956da', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_656e925bd8e956da',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_656e925bd8e956da', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_656e925bd8e956da',
  'political_assignment', '{"constituency_inec": "EZZA NORTH EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_656e925bd8e956da', 'prof_656e925bd8e956da',
  'Nwuhuo Linus Friday',
  'nwuhuo linus friday ebonyi state assembly ezza north east apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Chukwu Victor Uzoma -- Ezza North West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_070688fdab036688', 'Chukwu Victor Uzoma',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_070688fdab036688', 'ind_070688fdab036688', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Chukwu Victor Uzoma', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_070688fdab036688', 'prof_070688fdab036688',
  'Member, Ebonyi State House of Assembly (EZZA NORTH WEST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_070688fdab036688', 'ind_070688fdab036688', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_070688fdab036688', 'ind_070688fdab036688', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_070688fdab036688', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ezza north west|2023',
  'insert', 'ind_070688fdab036688',
  'Unique: Ebonyi Ezza North West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_070688fdab036688', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_070688fdab036688', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_070688fdab036688', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ezza_north_west',
  'ind_070688fdab036688', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_070688fdab036688', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ezza North West', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_070688fdab036688', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_070688fdab036688',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_070688fdab036688', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_070688fdab036688',
  'political_assignment', '{"constituency_inec": "EZZA NORTH WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_070688fdab036688', 'prof_070688fdab036688',
  'Chukwu Victor Uzoma',
  'chukwu victor uzoma ebonyi state assembly ezza north west apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Ogbuewu Friday -- Ezza South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b6870e3795138bc1', 'Ogbuewu Friday',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b6870e3795138bc1', 'ind_b6870e3795138bc1', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogbuewu Friday', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b6870e3795138bc1', 'prof_b6870e3795138bc1',
  'Member, Ebonyi State House of Assembly (EZZA SOUTH)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b6870e3795138bc1', 'ind_b6870e3795138bc1', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b6870e3795138bc1', 'ind_b6870e3795138bc1', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b6870e3795138bc1', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ezza south|2023',
  'insert', 'ind_b6870e3795138bc1',
  'Unique: Ebonyi Ezza South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b6870e3795138bc1', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_b6870e3795138bc1', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b6870e3795138bc1', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ezza_south',
  'ind_b6870e3795138bc1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b6870e3795138bc1', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ezza South', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b6870e3795138bc1', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_b6870e3795138bc1',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b6870e3795138bc1', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_b6870e3795138bc1',
  'political_assignment', '{"constituency_inec": "EZZA SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b6870e3795138bc1', 'prof_b6870e3795138bc1',
  'Ogbuewu Friday',
  'ogbuewu friday ebonyi state assembly ezza south apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Nwuruku Humphrey Alieze Onwukwe -- Ikwo North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f1b1d956d7d2314f', 'Nwuruku Humphrey Alieze Onwukwe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f1b1d956d7d2314f', 'ind_f1b1d956d7d2314f', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwuruku Humphrey Alieze Onwukwe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f1b1d956d7d2314f', 'prof_f1b1d956d7d2314f',
  'Member, Ebonyi State House of Assembly (IKWO NORTH)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f1b1d956d7d2314f', 'ind_f1b1d956d7d2314f', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f1b1d956d7d2314f', 'ind_f1b1d956d7d2314f', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f1b1d956d7d2314f', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ikwo north|2023',
  'insert', 'ind_f1b1d956d7d2314f',
  'Unique: Ebonyi Ikwo North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f1b1d956d7d2314f', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_f1b1d956d7d2314f', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f1b1d956d7d2314f', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ikwo_north',
  'ind_f1b1d956d7d2314f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f1b1d956d7d2314f', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ikwo North', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f1b1d956d7d2314f', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_f1b1d956d7d2314f',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f1b1d956d7d2314f', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_f1b1d956d7d2314f',
  'political_assignment', '{"constituency_inec": "IKWO NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f1b1d956d7d2314f', 'prof_f1b1d956d7d2314f',
  'Nwuruku Humphrey Alieze Onwukwe',
  'nwuruku humphrey alieze onwukwe ebonyi state assembly ikwo north pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Odunwa Moses Ije -- Ikwo South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9df3af2d11bf1fec', 'Odunwa Moses Ije',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9df3af2d11bf1fec', 'ind_9df3af2d11bf1fec', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Odunwa Moses Ije', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9df3af2d11bf1fec', 'prof_9df3af2d11bf1fec',
  'Member, Ebonyi State House of Assembly (IKWO SOUTH)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9df3af2d11bf1fec', 'ind_9df3af2d11bf1fec', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9df3af2d11bf1fec', 'ind_9df3af2d11bf1fec', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9df3af2d11bf1fec', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ikwo south|2023',
  'insert', 'ind_9df3af2d11bf1fec',
  'Unique: Ebonyi Ikwo South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9df3af2d11bf1fec', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9df3af2d11bf1fec', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9df3af2d11bf1fec', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ikwo_south',
  'ind_9df3af2d11bf1fec', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9df3af2d11bf1fec', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ikwo South', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9df3af2d11bf1fec', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9df3af2d11bf1fec',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9df3af2d11bf1fec', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9df3af2d11bf1fec',
  'political_assignment', '{"constituency_inec": "IKWO SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9df3af2d11bf1fec', 'prof_9df3af2d11bf1fec',
  'Odunwa Moses Ije',
  'odunwa moses ije ebonyi state assembly ikwo south apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Odanwu Edward Ifeanyi -- Ishielu North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_02fc19cd37ab8c52', 'Odanwu Edward Ifeanyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_02fc19cd37ab8c52', 'ind_02fc19cd37ab8c52', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Odanwu Edward Ifeanyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_02fc19cd37ab8c52', 'prof_02fc19cd37ab8c52',
  'Member, Ebonyi State House of Assembly (ISHIELU NORTH)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_02fc19cd37ab8c52', 'ind_02fc19cd37ab8c52', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_02fc19cd37ab8c52', 'ind_02fc19cd37ab8c52', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_02fc19cd37ab8c52', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ishielu north|2023',
  'insert', 'ind_02fc19cd37ab8c52',
  'Unique: Ebonyi Ishielu North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_02fc19cd37ab8c52', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_02fc19cd37ab8c52', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_02fc19cd37ab8c52', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ishielu_north',
  'ind_02fc19cd37ab8c52', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_02fc19cd37ab8c52', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ishielu North', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_02fc19cd37ab8c52', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_02fc19cd37ab8c52',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_02fc19cd37ab8c52', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_02fc19cd37ab8c52',
  'political_assignment', '{"constituency_inec": "ISHIELU NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_02fc19cd37ab8c52', 'prof_02fc19cd37ab8c52',
  'Odanwu Edward Ifeanyi',
  'odanwu edward ifeanyi ebonyi state assembly ishielu north pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Chukwu Arinze Lucas -- Ishielu South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8311183a7a035e4f', 'Chukwu Arinze Lucas',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8311183a7a035e4f', 'ind_8311183a7a035e4f', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Chukwu Arinze Lucas', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8311183a7a035e4f', 'prof_8311183a7a035e4f',
  'Member, Ebonyi State House of Assembly (ISHIELU SOUTH)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8311183a7a035e4f', 'ind_8311183a7a035e4f', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8311183a7a035e4f', 'ind_8311183a7a035e4f', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8311183a7a035e4f', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ishielu south|2023',
  'insert', 'ind_8311183a7a035e4f',
  'Unique: Ebonyi Ishielu South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8311183a7a035e4f', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_8311183a7a035e4f', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8311183a7a035e4f', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ishielu_south',
  'ind_8311183a7a035e4f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8311183a7a035e4f', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ishielu South', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8311183a7a035e4f', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_8311183a7a035e4f',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8311183a7a035e4f', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_8311183a7a035e4f',
  'political_assignment', '{"constituency_inec": "ISHIELU SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8311183a7a035e4f', 'prof_8311183a7a035e4f',
  'Chukwu Arinze Lucas',
  'chukwu arinze lucas ebonyi state assembly ishielu south apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Okor Monday Chukwu -- Ivo (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_04eb90dd5a0682fd', 'Okor Monday Chukwu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_04eb90dd5a0682fd', 'ind_04eb90dd5a0682fd', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okor Monday Chukwu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_04eb90dd5a0682fd', 'prof_04eb90dd5a0682fd',
  'Member, Ebonyi State House of Assembly (IVO)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_04eb90dd5a0682fd', 'ind_04eb90dd5a0682fd', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_04eb90dd5a0682fd', 'ind_04eb90dd5a0682fd', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_04eb90dd5a0682fd', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ivo|2023',
  'insert', 'ind_04eb90dd5a0682fd',
  'Unique: Ebonyi Ivo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_04eb90dd5a0682fd', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_04eb90dd5a0682fd', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_04eb90dd5a0682fd', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ivo',
  'ind_04eb90dd5a0682fd', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_04eb90dd5a0682fd', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ivo', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_04eb90dd5a0682fd', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_04eb90dd5a0682fd',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_04eb90dd5a0682fd', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_04eb90dd5a0682fd',
  'political_assignment', '{"constituency_inec": "IVO", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_04eb90dd5a0682fd', 'prof_04eb90dd5a0682fd',
  'Okor Monday Chukwu',
  'okor monday chukwu ebonyi state assembly ivo pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Nwuhuo Linus Friday -- Izzi East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_407f7004b83277ce', 'Nwuhuo Linus Friday',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_407f7004b83277ce', 'ind_407f7004b83277ce', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwuhuo Linus Friday', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_407f7004b83277ce', 'prof_407f7004b83277ce',
  'Member, Ebonyi State House of Assembly (IZZI EAST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_407f7004b83277ce', 'ind_407f7004b83277ce', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_407f7004b83277ce', 'ind_407f7004b83277ce', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_407f7004b83277ce', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|izzi east|2023',
  'insert', 'ind_407f7004b83277ce',
  'Unique: Ebonyi Izzi East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_407f7004b83277ce', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_407f7004b83277ce', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_407f7004b83277ce', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_izzi_east',
  'ind_407f7004b83277ce', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_407f7004b83277ce', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Izzi East', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_407f7004b83277ce', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_407f7004b83277ce',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_407f7004b83277ce', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_407f7004b83277ce',
  'political_assignment', '{"constituency_inec": "IZZI EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_407f7004b83277ce', 'prof_407f7004b83277ce',
  'Nwuhuo Linus Friday',
  'nwuhuo linus friday ebonyi state assembly izzi east apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Iziogo Samuel Awam -- Izzi West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9979c95aca0364e2', 'Iziogo Samuel Awam',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9979c95aca0364e2', 'ind_9979c95aca0364e2', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Iziogo Samuel Awam', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9979c95aca0364e2', 'prof_9979c95aca0364e2',
  'Member, Ebonyi State House of Assembly (IZZI WEST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9979c95aca0364e2', 'ind_9979c95aca0364e2', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9979c95aca0364e2', 'ind_9979c95aca0364e2', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9979c95aca0364e2', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|izzi west|2023',
  'insert', 'ind_9979c95aca0364e2',
  'Unique: Ebonyi Izzi West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9979c95aca0364e2', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9979c95aca0364e2', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9979c95aca0364e2', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_izzi_west',
  'ind_9979c95aca0364e2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9979c95aca0364e2', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Izzi West', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9979c95aca0364e2', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9979c95aca0364e2',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9979c95aca0364e2', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9979c95aca0364e2',
  'political_assignment', '{"constituency_inec": "IZZI WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9979c95aca0364e2', 'prof_9979c95aca0364e2',
  'Iziogo Samuel Awam',
  'iziogo samuel awam ebonyi state assembly izzi west pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Nwankwo Martha Ebere -- Ohaozara East (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2869105d9f2a2e36', 'Nwankwo Martha Ebere',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2869105d9f2a2e36', 'ind_2869105d9f2a2e36', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwankwo Martha Ebere', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2869105d9f2a2e36', 'prof_2869105d9f2a2e36',
  'Member, Ebonyi State House of Assembly (OHAOZARA EAST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2869105d9f2a2e36', 'ind_2869105d9f2a2e36', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2869105d9f2a2e36', 'ind_2869105d9f2a2e36', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2869105d9f2a2e36', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ohaozara east|2023',
  'insert', 'ind_2869105d9f2a2e36',
  'Unique: Ebonyi Ohaozara East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2869105d9f2a2e36', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_2869105d9f2a2e36', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2869105d9f2a2e36', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ohaozara_east',
  'ind_2869105d9f2a2e36', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2869105d9f2a2e36', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ohaozara East', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2869105d9f2a2e36', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_2869105d9f2a2e36',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2869105d9f2a2e36', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_2869105d9f2a2e36',
  'political_assignment', '{"constituency_inec": "OHAOZARA EAST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2869105d9f2a2e36', 'prof_2869105d9f2a2e36',
  'Nwankwo Martha Ebere',
  'nwankwo martha ebere ebonyi state assembly ohaozara east pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Obasi Ugochukwu Aja -- Ohaozara West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9ce5a9afd8806f0a', 'Obasi Ugochukwu Aja',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9ce5a9afd8806f0a', 'ind_9ce5a9afd8806f0a', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Obasi Ugochukwu Aja', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9ce5a9afd8806f0a', 'prof_9ce5a9afd8806f0a',
  'Member, Ebonyi State House of Assembly (OHAOZARA WEST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9ce5a9afd8806f0a', 'ind_9ce5a9afd8806f0a', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9ce5a9afd8806f0a', 'ind_9ce5a9afd8806f0a', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9ce5a9afd8806f0a', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ohaozara west|2023',
  'insert', 'ind_9ce5a9afd8806f0a',
  'Unique: Ebonyi Ohaozara West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9ce5a9afd8806f0a', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9ce5a9afd8806f0a', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9ce5a9afd8806f0a', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ohaozara_west',
  'ind_9ce5a9afd8806f0a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9ce5a9afd8806f0a', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ohaozara West', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9ce5a9afd8806f0a', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9ce5a9afd8806f0a',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9ce5a9afd8806f0a', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_9ce5a9afd8806f0a',
  'political_assignment', '{"constituency_inec": "OHAOZARA WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9ce5a9afd8806f0a', 'prof_9ce5a9afd8806f0a',
  'Obasi Ugochukwu Aja',
  'obasi ugochukwu aja ebonyi state assembly ohaozara west pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Agwu Esther Chidiebere -- Ohaukwu North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_af35fca48c235393', 'Agwu Esther Chidiebere',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_af35fca48c235393', 'ind_af35fca48c235393', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Agwu Esther Chidiebere', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_af35fca48c235393', 'prof_af35fca48c235393',
  'Member, Ebonyi State House of Assembly (OHAUKWU NORTH)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_af35fca48c235393', 'ind_af35fca48c235393', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_af35fca48c235393', 'ind_af35fca48c235393', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_af35fca48c235393', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ohaukwu north|2023',
  'insert', 'ind_af35fca48c235393',
  'Unique: Ebonyi Ohaukwu North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_af35fca48c235393', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_af35fca48c235393', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_af35fca48c235393', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ohaukwu_north',
  'ind_af35fca48c235393', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_af35fca48c235393', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ohaukwu North', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_af35fca48c235393', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_af35fca48c235393',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_af35fca48c235393', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_af35fca48c235393',
  'political_assignment', '{"constituency_inec": "OHAUKWU NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_af35fca48c235393', 'prof_af35fca48c235393',
  'Agwu Esther Chidiebere',
  'agwu esther chidiebere ebonyi state assembly ohaukwu north apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Onah Chinedu Ogba -- Ohaukwu South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5f25a4a38fdbe347', 'Onah Chinedu Ogba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5f25a4a38fdbe347', 'ind_5f25a4a38fdbe347', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Onah Chinedu Ogba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5f25a4a38fdbe347', 'prof_5f25a4a38fdbe347',
  'Member, Ebonyi State House of Assembly (OHAUKWU SOUTH)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5f25a4a38fdbe347', 'ind_5f25a4a38fdbe347', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5f25a4a38fdbe347', 'ind_5f25a4a38fdbe347', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5f25a4a38fdbe347', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|ohaukwu south|2023',
  'insert', 'ind_5f25a4a38fdbe347',
  'Unique: Ebonyi Ohaukwu South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5f25a4a38fdbe347', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_5f25a4a38fdbe347', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5f25a4a38fdbe347', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_ohaukwu_south',
  'ind_5f25a4a38fdbe347', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5f25a4a38fdbe347', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Ohaukwu South', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5f25a4a38fdbe347', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_5f25a4a38fdbe347',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5f25a4a38fdbe347', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_5f25a4a38fdbe347',
  'political_assignment', '{"constituency_inec": "OHAUKWU SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5f25a4a38fdbe347', 'prof_5f25a4a38fdbe347',
  'Onah Chinedu Ogba',
  'onah chinedu ogba ebonyi state assembly ohaukwu south apc politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Ogba Celestine Ifeanyi -- Onicha East (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e0415f0989b21206', 'Ogba Celestine Ifeanyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e0415f0989b21206', 'ind_e0415f0989b21206', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogba Celestine Ifeanyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e0415f0989b21206', 'prof_e0415f0989b21206',
  'Member, Ebonyi State House of Assembly (ONICHA EAST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e0415f0989b21206', 'ind_e0415f0989b21206', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e0415f0989b21206', 'ind_e0415f0989b21206', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e0415f0989b21206', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|onicha east|2023',
  'insert', 'ind_e0415f0989b21206',
  'Unique: Ebonyi Onicha East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e0415f0989b21206', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_e0415f0989b21206', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e0415f0989b21206', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_onicha_east',
  'ind_e0415f0989b21206', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e0415f0989b21206', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Onicha East', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e0415f0989b21206', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_e0415f0989b21206',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e0415f0989b21206', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_e0415f0989b21206',
  'political_assignment', '{"constituency_inec": "ONICHA EAST", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e0415f0989b21206', 'prof_e0415f0989b21206',
  'Ogba Celestine Ifeanyi',
  'ogba celestine ifeanyi ebonyi state assembly onicha east lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Onu Charles Nkwoemezie -- Onicha West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_288238cfd8264dfb', 'Onu Charles Nkwoemezie',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_288238cfd8264dfb', 'ind_288238cfd8264dfb', 'individual', 'place_state_ebonyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Onu Charles Nkwoemezie', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_288238cfd8264dfb', 'prof_288238cfd8264dfb',
  'Member, Ebonyi State House of Assembly (ONICHA WEST)',
  'place_state_ebonyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_288238cfd8264dfb', 'ind_288238cfd8264dfb', 'term_ng_ebonyi_state_assembly_10th_2023_2027',
  'place_state_ebonyi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_288238cfd8264dfb', 'ind_288238cfd8264dfb', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_288238cfd8264dfb', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual',
  'ng_state_assembly_member|ebonyi|onicha west|2023',
  'insert', 'ind_288238cfd8264dfb',
  'Unique: Ebonyi Onicha West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_288238cfd8264dfb', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_288238cfd8264dfb', 'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_288238cfd8264dfb', 'seed_run_s05_political_ebonyi_roster_20260502', 'seed_source_nigerianleaders_ebonyi_assembly_20260502',
  'nl_ebonyi_assembly_2023_onicha_west',
  'ind_288238cfd8264dfb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_288238cfd8264dfb', 'seed_run_s05_political_ebonyi_roster_20260502',
  'Ebonyi Onicha West', 'place_state_ebonyi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_288238cfd8264dfb', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_288238cfd8264dfb',
  'seed_source_nigerianleaders_ebonyi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_288238cfd8264dfb', 'seed_run_s05_political_ebonyi_roster_20260502', 'individual', 'ind_288238cfd8264dfb',
  'political_assignment', '{"constituency_inec": "ONICHA WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/ebonyi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_288238cfd8264dfb', 'prof_288238cfd8264dfb',
  'Onu Charles Nkwoemezie',
  'onu charles nkwoemezie ebonyi state assembly onicha west pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_ebonyi',
  'political',
  unixepoch(), unixepoch()
);

