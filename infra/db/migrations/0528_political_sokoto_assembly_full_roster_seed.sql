-- ============================================================
-- Migration 0528: Sokoto State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Sokoto State House of Assembly Members
-- Members seeded: 29/30
-- Party breakdown: APC:11, PDP:9, ADC:6, AA:3
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_sokoto_assembly_20260502',
  'NigerianLeaders – Complete List of Sokoto State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/sokoto-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_sokoto_roster_20260502', 'S05 Batch – Sokoto State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_sokoto_roster_20260502',
  'seed_run_s05_political_sokoto_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0528_political_sokoto_assembly_full_roster_seed.sql',
  NULL, 29,
  '29/30 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_sokoto_state_assembly_10th_2023_2027',
  'Sokoto State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_sokoto',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (29 of 30 seats) ──────────────────────────────────────

-- 01. Muhammad Shehu -- Binji (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a4fa10feec74aaf6', 'Muhammad Shehu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a4fa10feec74aaf6', 'ind_a4fa10feec74aaf6', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammad Shehu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a4fa10feec74aaf6', 'prof_a4fa10feec74aaf6',
  'Member, Sokoto State House of Assembly (BINJI)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a4fa10feec74aaf6', 'ind_a4fa10feec74aaf6', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a4fa10feec74aaf6', 'ind_a4fa10feec74aaf6', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a4fa10feec74aaf6', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|binji|2023',
  'insert', 'ind_a4fa10feec74aaf6',
  'Unique: Sokoto Binji seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a4fa10feec74aaf6', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_a4fa10feec74aaf6', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a4fa10feec74aaf6', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_binji',
  'ind_a4fa10feec74aaf6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a4fa10feec74aaf6', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Binji', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a4fa10feec74aaf6', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_a4fa10feec74aaf6',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a4fa10feec74aaf6', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_a4fa10feec74aaf6',
  'political_assignment', '{"constituency_inec": "BINJI", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a4fa10feec74aaf6', 'prof_a4fa10feec74aaf6',
  'Muhammad Shehu',
  'muhammad shehu sokoto state assembly binji adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Magaji Abubakar -- Bodinga North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b9f99f1c31021d83', 'Magaji Abubakar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b9f99f1c31021d83', 'ind_b9f99f1c31021d83', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Magaji Abubakar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b9f99f1c31021d83', 'prof_b9f99f1c31021d83',
  'Member, Sokoto State House of Assembly (BODINGA NORTH)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b9f99f1c31021d83', 'ind_b9f99f1c31021d83', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b9f99f1c31021d83', 'ind_b9f99f1c31021d83', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b9f99f1c31021d83', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|bodinga north|2023',
  'insert', 'ind_b9f99f1c31021d83',
  'Unique: Sokoto Bodinga North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b9f99f1c31021d83', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_b9f99f1c31021d83', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b9f99f1c31021d83', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_bodinga_north',
  'ind_b9f99f1c31021d83', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b9f99f1c31021d83', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Bodinga North', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b9f99f1c31021d83', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_b9f99f1c31021d83',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b9f99f1c31021d83', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_b9f99f1c31021d83',
  'political_assignment', '{"constituency_inec": "BODINGA NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b9f99f1c31021d83', 'prof_b9f99f1c31021d83',
  'Magaji Abubakar',
  'magaji abubakar sokoto state assembly bodinga north pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Bala Tukur -- Bodinga South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7dcfb8d3c607f6ef', 'Bala Tukur',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7dcfb8d3c607f6ef', 'ind_7dcfb8d3c607f6ef', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bala Tukur', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7dcfb8d3c607f6ef', 'prof_7dcfb8d3c607f6ef',
  'Member, Sokoto State House of Assembly (BODINGA SOUTH)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7dcfb8d3c607f6ef', 'ind_7dcfb8d3c607f6ef', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7dcfb8d3c607f6ef', 'ind_7dcfb8d3c607f6ef', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7dcfb8d3c607f6ef', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|bodinga south|2023',
  'insert', 'ind_7dcfb8d3c607f6ef',
  'Unique: Sokoto Bodinga South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7dcfb8d3c607f6ef', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_7dcfb8d3c607f6ef', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7dcfb8d3c607f6ef', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_bodinga_south',
  'ind_7dcfb8d3c607f6ef', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7dcfb8d3c607f6ef', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Bodinga South', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7dcfb8d3c607f6ef', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_7dcfb8d3c607f6ef',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7dcfb8d3c607f6ef', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_7dcfb8d3c607f6ef',
  'political_assignment', '{"constituency_inec": "BODINGA SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7dcfb8d3c607f6ef', 'prof_7dcfb8d3c607f6ef',
  'Bala Tukur',
  'bala tukur sokoto state assembly bodinga south apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Mohammed Ahmad -- Dange Shuni (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f15b1a5ed90dd785', 'Mohammed Ahmad',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f15b1a5ed90dd785', 'ind_f15b1a5ed90dd785', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Ahmad', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f15b1a5ed90dd785', 'prof_f15b1a5ed90dd785',
  'Member, Sokoto State House of Assembly (DANGE SHUNI)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f15b1a5ed90dd785', 'ind_f15b1a5ed90dd785', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f15b1a5ed90dd785', 'ind_f15b1a5ed90dd785', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f15b1a5ed90dd785', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|dange shuni|2023',
  'insert', 'ind_f15b1a5ed90dd785',
  'Unique: Sokoto Dange Shuni seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f15b1a5ed90dd785', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_f15b1a5ed90dd785', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f15b1a5ed90dd785', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_dange_shuni',
  'ind_f15b1a5ed90dd785', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f15b1a5ed90dd785', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Dange Shuni', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f15b1a5ed90dd785', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_f15b1a5ed90dd785',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f15b1a5ed90dd785', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_f15b1a5ed90dd785',
  'political_assignment', '{"constituency_inec": "DANGE SHUNI", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f15b1a5ed90dd785', 'prof_f15b1a5ed90dd785',
  'Mohammed Ahmad',
  'mohammed ahmad sokoto state assembly dange shuni aa politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Dauda Kabiru -- Gada East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_501ecfd7d44dfea7', 'Dauda Kabiru',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_501ecfd7d44dfea7', 'ind_501ecfd7d44dfea7', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dauda Kabiru', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_501ecfd7d44dfea7', 'prof_501ecfd7d44dfea7',
  'Member, Sokoto State House of Assembly (GADA EAST)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_501ecfd7d44dfea7', 'ind_501ecfd7d44dfea7', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_501ecfd7d44dfea7', 'ind_501ecfd7d44dfea7', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_501ecfd7d44dfea7', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|gada east|2023',
  'insert', 'ind_501ecfd7d44dfea7',
  'Unique: Sokoto Gada East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_501ecfd7d44dfea7', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_501ecfd7d44dfea7', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_501ecfd7d44dfea7', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_gada_east',
  'ind_501ecfd7d44dfea7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_501ecfd7d44dfea7', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Gada East', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_501ecfd7d44dfea7', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_501ecfd7d44dfea7',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_501ecfd7d44dfea7', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_501ecfd7d44dfea7',
  'political_assignment', '{"constituency_inec": "GADA EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_501ecfd7d44dfea7', 'prof_501ecfd7d44dfea7',
  'Dauda Kabiru',
  'dauda kabiru sokoto state assembly gada east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Altine Abubakar Kyadawa -- Gada West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3aa13ce06cbe187a', 'Altine Abubakar Kyadawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3aa13ce06cbe187a', 'ind_3aa13ce06cbe187a', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Altine Abubakar Kyadawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3aa13ce06cbe187a', 'prof_3aa13ce06cbe187a',
  'Member, Sokoto State House of Assembly (GADA WEST)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3aa13ce06cbe187a', 'ind_3aa13ce06cbe187a', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3aa13ce06cbe187a', 'ind_3aa13ce06cbe187a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3aa13ce06cbe187a', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|gada west|2023',
  'insert', 'ind_3aa13ce06cbe187a',
  'Unique: Sokoto Gada West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3aa13ce06cbe187a', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_3aa13ce06cbe187a', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3aa13ce06cbe187a', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_gada_west',
  'ind_3aa13ce06cbe187a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3aa13ce06cbe187a', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Gada West', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3aa13ce06cbe187a', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_3aa13ce06cbe187a',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3aa13ce06cbe187a', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_3aa13ce06cbe187a',
  'political_assignment', '{"constituency_inec": "GADA WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3aa13ce06cbe187a', 'prof_3aa13ce06cbe187a',
  'Altine Abubakar Kyadawa',
  'altine abubakar kyadawa sokoto state assembly gada west apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Faruku Amadu -- Goronyo (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bcbebe8ab48f5a55', 'Faruku Amadu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bcbebe8ab48f5a55', 'ind_bcbebe8ab48f5a55', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Faruku Amadu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bcbebe8ab48f5a55', 'prof_bcbebe8ab48f5a55',
  'Member, Sokoto State House of Assembly (GORONYO)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bcbebe8ab48f5a55', 'ind_bcbebe8ab48f5a55', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bcbebe8ab48f5a55', 'ind_bcbebe8ab48f5a55', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bcbebe8ab48f5a55', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|goronyo|2023',
  'insert', 'ind_bcbebe8ab48f5a55',
  'Unique: Sokoto Goronyo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bcbebe8ab48f5a55', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_bcbebe8ab48f5a55', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bcbebe8ab48f5a55', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_goronyo',
  'ind_bcbebe8ab48f5a55', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bcbebe8ab48f5a55', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Goronyo', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bcbebe8ab48f5a55', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_bcbebe8ab48f5a55',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bcbebe8ab48f5a55', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_bcbebe8ab48f5a55',
  'political_assignment', '{"constituency_inec": "GORONYO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bcbebe8ab48f5a55', 'prof_bcbebe8ab48f5a55',
  'Faruku Amadu',
  'faruku amadu sokoto state assembly goronyo apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Mustapha Faruk -- Gudu (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_eabeb1a5135ee434', 'Mustapha Faruk',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_eabeb1a5135ee434', 'ind_eabeb1a5135ee434', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mustapha Faruk', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_eabeb1a5135ee434', 'prof_eabeb1a5135ee434',
  'Member, Sokoto State House of Assembly (GUDU)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_eabeb1a5135ee434', 'ind_eabeb1a5135ee434', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_eabeb1a5135ee434', 'ind_eabeb1a5135ee434', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_eabeb1a5135ee434', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|gudu|2023',
  'insert', 'ind_eabeb1a5135ee434',
  'Unique: Sokoto Gudu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_eabeb1a5135ee434', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_eabeb1a5135ee434', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_eabeb1a5135ee434', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_gudu',
  'ind_eabeb1a5135ee434', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_eabeb1a5135ee434', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Gudu', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_eabeb1a5135ee434', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_eabeb1a5135ee434',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_eabeb1a5135ee434', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_eabeb1a5135ee434',
  'political_assignment', '{"constituency_inec": "GUDU", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_eabeb1a5135ee434', 'prof_eabeb1a5135ee434',
  'Mustapha Faruk',
  'mustapha faruk sokoto state assembly gudu pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Idris Bello -- Gwadabawa North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a2309837dcce64d3', 'Idris Bello',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a2309837dcce64d3', 'ind_a2309837dcce64d3', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Idris Bello', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a2309837dcce64d3', 'prof_a2309837dcce64d3',
  'Member, Sokoto State House of Assembly (GWADABAWA NORTH)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a2309837dcce64d3', 'ind_a2309837dcce64d3', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a2309837dcce64d3', 'ind_a2309837dcce64d3', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a2309837dcce64d3', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|gwadabawa north|2023',
  'insert', 'ind_a2309837dcce64d3',
  'Unique: Sokoto Gwadabawa North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a2309837dcce64d3', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_a2309837dcce64d3', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a2309837dcce64d3', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_gwadabawa_north',
  'ind_a2309837dcce64d3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a2309837dcce64d3', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Gwadabawa North', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a2309837dcce64d3', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_a2309837dcce64d3',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a2309837dcce64d3', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_a2309837dcce64d3',
  'political_assignment', '{"constituency_inec": "GWADABAWA NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a2309837dcce64d3', 'prof_a2309837dcce64d3',
  'Idris Bello',
  'idris bello sokoto state assembly gwadabawa north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Usman Abdulkadir -- Gwadabawa South (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fa5ddfc2598feedf', 'Usman Abdulkadir',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fa5ddfc2598feedf', 'ind_fa5ddfc2598feedf', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Usman Abdulkadir', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fa5ddfc2598feedf', 'prof_fa5ddfc2598feedf',
  'Member, Sokoto State House of Assembly (GWADABAWA SOUTH)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fa5ddfc2598feedf', 'ind_fa5ddfc2598feedf', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fa5ddfc2598feedf', 'ind_fa5ddfc2598feedf', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fa5ddfc2598feedf', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|gwadabawa south|2023',
  'insert', 'ind_fa5ddfc2598feedf',
  'Unique: Sokoto Gwadabawa South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fa5ddfc2598feedf', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_fa5ddfc2598feedf', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fa5ddfc2598feedf', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_gwadabawa_south',
  'ind_fa5ddfc2598feedf', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fa5ddfc2598feedf', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Gwadabawa South', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fa5ddfc2598feedf', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_fa5ddfc2598feedf',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fa5ddfc2598feedf', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_fa5ddfc2598feedf',
  'political_assignment', '{"constituency_inec": "GWADABAWA SOUTH", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fa5ddfc2598feedf', 'prof_fa5ddfc2598feedf',
  'Usman Abdulkadir',
  'usman abdulkadir sokoto state assembly gwadabawa south adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Muhammed Aminu -- Illela (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fa9ad93ead51407c', 'Muhammed Aminu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fa9ad93ead51407c', 'ind_fa9ad93ead51407c', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammed Aminu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fa9ad93ead51407c', 'prof_fa9ad93ead51407c',
  'Member, Sokoto State House of Assembly (ILLELA)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fa9ad93ead51407c', 'ind_fa9ad93ead51407c', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fa9ad93ead51407c', 'ind_fa9ad93ead51407c', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fa9ad93ead51407c', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|illela|2023',
  'insert', 'ind_fa9ad93ead51407c',
  'Unique: Sokoto Illela seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fa9ad93ead51407c', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_fa9ad93ead51407c', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fa9ad93ead51407c', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_illela',
  'ind_fa9ad93ead51407c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fa9ad93ead51407c', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Illela', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fa9ad93ead51407c', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_fa9ad93ead51407c',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fa9ad93ead51407c', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_fa9ad93ead51407c',
  'political_assignment', '{"constituency_inec": "ILLELA", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fa9ad93ead51407c', 'prof_fa9ad93ead51407c',
  'Muhammed Aminu',
  'muhammed aminu sokoto state assembly illela adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Halilu Habibu Modachi -- Isa (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9270c4b2fdffe095', 'Halilu Habibu Modachi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9270c4b2fdffe095', 'ind_9270c4b2fdffe095', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Halilu Habibu Modachi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9270c4b2fdffe095', 'prof_9270c4b2fdffe095',
  'Member, Sokoto State House of Assembly (ISA)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9270c4b2fdffe095', 'ind_9270c4b2fdffe095', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9270c4b2fdffe095', 'ind_9270c4b2fdffe095', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9270c4b2fdffe095', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|isa|2023',
  'insert', 'ind_9270c4b2fdffe095',
  'Unique: Sokoto Isa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9270c4b2fdffe095', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_9270c4b2fdffe095', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9270c4b2fdffe095', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_isa',
  'ind_9270c4b2fdffe095', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9270c4b2fdffe095', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Isa', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9270c4b2fdffe095', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_9270c4b2fdffe095',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9270c4b2fdffe095', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_9270c4b2fdffe095',
  'political_assignment', '{"constituency_inec": "ISA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9270c4b2fdffe095', 'prof_9270c4b2fdffe095',
  'Halilu Habibu Modachi',
  'halilu habibu modachi sokoto state assembly isa pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Muhammad Usman, Abdullaahi -- Kebbe (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_855b0cc90df158bd', 'Muhammad Usman, Abdullaahi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_855b0cc90df158bd', 'ind_855b0cc90df158bd', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammad Usman, Abdullaahi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_855b0cc90df158bd', 'prof_855b0cc90df158bd',
  'Member, Sokoto State House of Assembly (KEBBE)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_855b0cc90df158bd', 'ind_855b0cc90df158bd', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_855b0cc90df158bd', 'ind_855b0cc90df158bd', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_855b0cc90df158bd', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|kebbe|2023',
  'insert', 'ind_855b0cc90df158bd',
  'Unique: Sokoto Kebbe seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_855b0cc90df158bd', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_855b0cc90df158bd', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_855b0cc90df158bd', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_kebbe',
  'ind_855b0cc90df158bd', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_855b0cc90df158bd', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Kebbe', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_855b0cc90df158bd', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_855b0cc90df158bd',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_855b0cc90df158bd', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_855b0cc90df158bd',
  'political_assignment', '{"constituency_inec": "KEBBE", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_855b0cc90df158bd', 'prof_855b0cc90df158bd',
  'Muhammad Usman, Abdullaahi',
  'muhammad usman, abdullaahi sokoto state assembly kebbe adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Abdullahi Alhaji Zakari -- Rabah (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_06e9ed6d7ef2d3de', 'Abdullahi Alhaji Zakari',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_06e9ed6d7ef2d3de', 'ind_06e9ed6d7ef2d3de', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Alhaji Zakari', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_06e9ed6d7ef2d3de', 'prof_06e9ed6d7ef2d3de',
  'Member, Sokoto State House of Assembly (RABAH)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_06e9ed6d7ef2d3de', 'ind_06e9ed6d7ef2d3de', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_06e9ed6d7ef2d3de', 'ind_06e9ed6d7ef2d3de', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_06e9ed6d7ef2d3de', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|rabah|2023',
  'insert', 'ind_06e9ed6d7ef2d3de',
  'Unique: Sokoto Rabah seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_06e9ed6d7ef2d3de', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_06e9ed6d7ef2d3de', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_06e9ed6d7ef2d3de', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_rabah',
  'ind_06e9ed6d7ef2d3de', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_06e9ed6d7ef2d3de', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Rabah', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_06e9ed6d7ef2d3de', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_06e9ed6d7ef2d3de',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_06e9ed6d7ef2d3de', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_06e9ed6d7ef2d3de',
  'political_assignment', '{"constituency_inec": "RABAH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_06e9ed6d7ef2d3de', 'prof_06e9ed6d7ef2d3de',
  'Abdullahi Alhaji Zakari',
  'abdullahi alhaji zakari sokoto state assembly rabah apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Almustapha Aminu Gobir -- Sabon Birin North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d4bf81e77d05ed5a', 'Almustapha Aminu Gobir',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d4bf81e77d05ed5a', 'ind_d4bf81e77d05ed5a', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Almustapha Aminu Gobir', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d4bf81e77d05ed5a', 'prof_d4bf81e77d05ed5a',
  'Member, Sokoto State House of Assembly (SABON BIRIN NORTH)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d4bf81e77d05ed5a', 'ind_d4bf81e77d05ed5a', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d4bf81e77d05ed5a', 'ind_d4bf81e77d05ed5a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d4bf81e77d05ed5a', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|sabon birin north|2023',
  'insert', 'ind_d4bf81e77d05ed5a',
  'Unique: Sokoto Sabon Birin North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d4bf81e77d05ed5a', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_d4bf81e77d05ed5a', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d4bf81e77d05ed5a', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_sabon_birin_north',
  'ind_d4bf81e77d05ed5a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d4bf81e77d05ed5a', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Sabon Birin North', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d4bf81e77d05ed5a', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_d4bf81e77d05ed5a',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d4bf81e77d05ed5a', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_d4bf81e77d05ed5a',
  'political_assignment', '{"constituency_inec": "SABON BIRIN NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d4bf81e77d05ed5a', 'prof_d4bf81e77d05ed5a',
  'Almustapha Aminu Gobir',
  'almustapha aminu gobir sokoto state assembly sabon birin north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Ibrahim Saidu Naino -- Sabon Birin South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f510675397da5443', 'Ibrahim Saidu Naino',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f510675397da5443', 'ind_f510675397da5443', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Saidu Naino', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f510675397da5443', 'prof_f510675397da5443',
  'Member, Sokoto State House of Assembly (SABON BIRIN SOUTH)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f510675397da5443', 'ind_f510675397da5443', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f510675397da5443', 'ind_f510675397da5443', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f510675397da5443', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|sabon birin south|2023',
  'insert', 'ind_f510675397da5443',
  'Unique: Sokoto Sabon Birin South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f510675397da5443', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_f510675397da5443', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f510675397da5443', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_sabon_birin_south',
  'ind_f510675397da5443', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f510675397da5443', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Sabon Birin South', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f510675397da5443', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_f510675397da5443',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f510675397da5443', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_f510675397da5443',
  'political_assignment', '{"constituency_inec": "SABON BIRIN SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f510675397da5443', 'prof_f510675397da5443',
  'Ibrahim Saidu Naino',
  'ibrahim saidu naino sokoto state assembly sabon birin south apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Maidawa Alhaji -- Shagari (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_72a2ff695eca2de4', 'Maidawa Alhaji',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_72a2ff695eca2de4', 'ind_72a2ff695eca2de4', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Maidawa Alhaji', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_72a2ff695eca2de4', 'prof_72a2ff695eca2de4',
  'Member, Sokoto State House of Assembly (SHAGARI)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_72a2ff695eca2de4', 'ind_72a2ff695eca2de4', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_72a2ff695eca2de4', 'ind_72a2ff695eca2de4', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_72a2ff695eca2de4', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|shagari|2023',
  'insert', 'ind_72a2ff695eca2de4',
  'Unique: Sokoto Shagari seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_72a2ff695eca2de4', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_72a2ff695eca2de4', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_72a2ff695eca2de4', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_shagari',
  'ind_72a2ff695eca2de4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_72a2ff695eca2de4', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Shagari', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_72a2ff695eca2de4', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_72a2ff695eca2de4',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_72a2ff695eca2de4', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_72a2ff695eca2de4',
  'political_assignment', '{"constituency_inec": "SHAGARI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_72a2ff695eca2de4', 'prof_72a2ff695eca2de4',
  'Maidawa Alhaji',
  'maidawa alhaji sokoto state assembly shagari apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Liman Atiku -- Silame (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_954c8d46b9e86eb9', 'Liman Atiku',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_954c8d46b9e86eb9', 'ind_954c8d46b9e86eb9', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Liman Atiku', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_954c8d46b9e86eb9', 'prof_954c8d46b9e86eb9',
  'Member, Sokoto State House of Assembly (SILAME)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_954c8d46b9e86eb9', 'ind_954c8d46b9e86eb9', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_954c8d46b9e86eb9', 'ind_954c8d46b9e86eb9', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_954c8d46b9e86eb9', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|silame|2023',
  'insert', 'ind_954c8d46b9e86eb9',
  'Unique: Sokoto Silame seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_954c8d46b9e86eb9', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_954c8d46b9e86eb9', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_954c8d46b9e86eb9', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_silame',
  'ind_954c8d46b9e86eb9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_954c8d46b9e86eb9', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Silame', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_954c8d46b9e86eb9', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_954c8d46b9e86eb9',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_954c8d46b9e86eb9', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_954c8d46b9e86eb9',
  'political_assignment', '{"constituency_inec": "SILAME", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_954c8d46b9e86eb9', 'prof_954c8d46b9e86eb9',
  'Liman Atiku',
  'liman atiku sokoto state assembly silame pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Sokoto South I -- Sokoto North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_09a1db664d8b02d2', 'Sokoto South I',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_09a1db664d8b02d2', 'ind_09a1db664d8b02d2', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sokoto South I', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_09a1db664d8b02d2', 'prof_09a1db664d8b02d2',
  'Member, Sokoto State House of Assembly (SOKOTO NORTH)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_09a1db664d8b02d2', 'ind_09a1db664d8b02d2', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_09a1db664d8b02d2', 'ind_09a1db664d8b02d2', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_09a1db664d8b02d2', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|sokoto north|2023',
  'insert', 'ind_09a1db664d8b02d2',
  'Unique: Sokoto Sokoto North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_09a1db664d8b02d2', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_09a1db664d8b02d2', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_09a1db664d8b02d2', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_sokoto_north',
  'ind_09a1db664d8b02d2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_09a1db664d8b02d2', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Sokoto North', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_09a1db664d8b02d2', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_09a1db664d8b02d2',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_09a1db664d8b02d2', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_09a1db664d8b02d2',
  'political_assignment', '{"constituency_inec": "SOKOTO NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_09a1db664d8b02d2', 'prof_09a1db664d8b02d2',
  'Sokoto South I',
  'sokoto south i sokoto state assembly sokoto north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Hantsi Sule Romo -- Tambuwal West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6a5dd3fc9df6fa87', 'Hantsi Sule Romo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6a5dd3fc9df6fa87', 'ind_6a5dd3fc9df6fa87', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Hantsi Sule Romo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6a5dd3fc9df6fa87', 'prof_6a5dd3fc9df6fa87',
  'Member, Sokoto State House of Assembly (TAMBUWAL WEST)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6a5dd3fc9df6fa87', 'ind_6a5dd3fc9df6fa87', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6a5dd3fc9df6fa87', 'ind_6a5dd3fc9df6fa87', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6a5dd3fc9df6fa87', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|tambuwal west|2023',
  'insert', 'ind_6a5dd3fc9df6fa87',
  'Unique: Sokoto Tambuwal West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6a5dd3fc9df6fa87', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_6a5dd3fc9df6fa87', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6a5dd3fc9df6fa87', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_tambuwal_west',
  'ind_6a5dd3fc9df6fa87', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6a5dd3fc9df6fa87', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Tambuwal West', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6a5dd3fc9df6fa87', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_6a5dd3fc9df6fa87',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6a5dd3fc9df6fa87', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_6a5dd3fc9df6fa87',
  'political_assignment', '{"constituency_inec": "TAMBUWAL WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6a5dd3fc9df6fa87', 'prof_6a5dd3fc9df6fa87',
  'Hantsi Sule Romo',
  'hantsi sule romo sokoto state assembly tambuwal west pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Akilu Mohammed -- Tambuwal East (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_970832bb1223d863', 'Akilu Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_970832bb1223d863', 'ind_970832bb1223d863', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akilu Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_970832bb1223d863', 'prof_970832bb1223d863',
  'Member, Sokoto State House of Assembly (TAMBUWAL EAST)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_970832bb1223d863', 'ind_970832bb1223d863', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_970832bb1223d863', 'ind_970832bb1223d863', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_970832bb1223d863', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|tambuwal east|2023',
  'insert', 'ind_970832bb1223d863',
  'Unique: Sokoto Tambuwal East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_970832bb1223d863', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_970832bb1223d863', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_970832bb1223d863', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_tambuwal_east',
  'ind_970832bb1223d863', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_970832bb1223d863', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Tambuwal East', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_970832bb1223d863', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_970832bb1223d863',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_970832bb1223d863', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_970832bb1223d863',
  'political_assignment', '{"constituency_inec": "TAMBUWAL EAST", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_970832bb1223d863', 'prof_970832bb1223d863',
  'Akilu Mohammed',
  'akilu mohammed sokoto state assembly tambuwal east aa politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Miko Musa -- Tangaza (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_aa52f458a7c9ef70', 'Miko Musa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_aa52f458a7c9ef70', 'ind_aa52f458a7c9ef70', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Miko Musa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_aa52f458a7c9ef70', 'prof_aa52f458a7c9ef70',
  'Member, Sokoto State House of Assembly (TANGAZA)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_aa52f458a7c9ef70', 'ind_aa52f458a7c9ef70', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_aa52f458a7c9ef70', 'ind_aa52f458a7c9ef70', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_aa52f458a7c9ef70', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|tangaza|2023',
  'insert', 'ind_aa52f458a7c9ef70',
  'Unique: Sokoto Tangaza seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_aa52f458a7c9ef70', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_aa52f458a7c9ef70', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_aa52f458a7c9ef70', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_tangaza',
  'ind_aa52f458a7c9ef70', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_aa52f458a7c9ef70', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Tangaza', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_aa52f458a7c9ef70', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_aa52f458a7c9ef70',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_aa52f458a7c9ef70', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_aa52f458a7c9ef70',
  'political_assignment', '{"constituency_inec": "TANGAZA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_aa52f458a7c9ef70', 'prof_aa52f458a7c9ef70',
  'Miko Musa',
  'miko musa sokoto state assembly tangaza pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Muhammed Randa Abdullahi -- Tureta (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5b8f009828575550', 'Muhammed Randa Abdullahi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5b8f009828575550', 'ind_5b8f009828575550', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammed Randa Abdullahi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5b8f009828575550', 'prof_5b8f009828575550',
  'Member, Sokoto State House of Assembly (TURETA)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5b8f009828575550', 'ind_5b8f009828575550', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5b8f009828575550', 'ind_5b8f009828575550', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5b8f009828575550', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|tureta|2023',
  'insert', 'ind_5b8f009828575550',
  'Unique: Sokoto Tureta seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5b8f009828575550', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_5b8f009828575550', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5b8f009828575550', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_tureta',
  'ind_5b8f009828575550', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5b8f009828575550', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Tureta', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5b8f009828575550', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_5b8f009828575550',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5b8f009828575550', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_5b8f009828575550',
  'political_assignment', '{"constituency_inec": "TURETA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5b8f009828575550', 'prof_5b8f009828575550',
  'Muhammed Randa Abdullahi',
  'muhammed randa abdullahi sokoto state assembly tureta pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Umar Abubakar -- Wamakko (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7f789e589696f400', 'Umar Abubakar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7f789e589696f400', 'ind_7f789e589696f400', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umar Abubakar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7f789e589696f400', 'prof_7f789e589696f400',
  'Member, Sokoto State House of Assembly (WAMAKKO)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7f789e589696f400', 'ind_7f789e589696f400', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7f789e589696f400', 'ind_7f789e589696f400', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7f789e589696f400', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|wamakko|2023',
  'insert', 'ind_7f789e589696f400',
  'Unique: Sokoto Wamakko seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7f789e589696f400', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_7f789e589696f400', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7f789e589696f400', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_wamakko',
  'ind_7f789e589696f400', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7f789e589696f400', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Wamakko', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7f789e589696f400', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_7f789e589696f400',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7f789e589696f400', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_7f789e589696f400',
  'political_assignment', '{"constituency_inec": "WAMAKKO", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7f789e589696f400', 'prof_7f789e589696f400',
  'Umar Abubakar',
  'umar abubakar sokoto state assembly wamakko aa politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Muhammad Bashir -- Wurno (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_710fd0fa6b03ccc1', 'Muhammad Bashir',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_710fd0fa6b03ccc1', 'ind_710fd0fa6b03ccc1', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammad Bashir', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_710fd0fa6b03ccc1', 'prof_710fd0fa6b03ccc1',
  'Member, Sokoto State House of Assembly (WURNO)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_710fd0fa6b03ccc1', 'ind_710fd0fa6b03ccc1', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_710fd0fa6b03ccc1', 'ind_710fd0fa6b03ccc1', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_710fd0fa6b03ccc1', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|wurno|2023',
  'insert', 'ind_710fd0fa6b03ccc1',
  'Unique: Sokoto Wurno seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_710fd0fa6b03ccc1', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_710fd0fa6b03ccc1', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_710fd0fa6b03ccc1', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_wurno',
  'ind_710fd0fa6b03ccc1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_710fd0fa6b03ccc1', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Wurno', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_710fd0fa6b03ccc1', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_710fd0fa6b03ccc1',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_710fd0fa6b03ccc1', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_710fd0fa6b03ccc1',
  'political_assignment', '{"constituency_inec": "WURNO", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_710fd0fa6b03ccc1', 'prof_710fd0fa6b03ccc1',
  'Muhammad Bashir',
  'muhammad bashir sokoto state assembly wurno adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 26. Shehu Yabo Abubakar -- Yabo (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ba981ff8d9e302c4', 'Shehu Yabo Abubakar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ba981ff8d9e302c4', 'ind_ba981ff8d9e302c4', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Shehu Yabo Abubakar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ba981ff8d9e302c4', 'prof_ba981ff8d9e302c4',
  'Member, Sokoto State House of Assembly (YABO)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ba981ff8d9e302c4', 'ind_ba981ff8d9e302c4', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ba981ff8d9e302c4', 'ind_ba981ff8d9e302c4', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ba981ff8d9e302c4', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|yabo|2023',
  'insert', 'ind_ba981ff8d9e302c4',
  'Unique: Sokoto Yabo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ba981ff8d9e302c4', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_ba981ff8d9e302c4', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ba981ff8d9e302c4', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_yabo',
  'ind_ba981ff8d9e302c4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ba981ff8d9e302c4', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Yabo', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ba981ff8d9e302c4', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_ba981ff8d9e302c4',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ba981ff8d9e302c4', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_ba981ff8d9e302c4',
  'political_assignment', '{"constituency_inec": "YABO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ba981ff8d9e302c4', 'prof_ba981ff8d9e302c4',
  'Shehu Yabo Abubakar',
  'shehu yabo abubakar sokoto state assembly yabo apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 27. Haliru Buhari -- Sokoto North II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_91132b3897453704', 'Haliru Buhari',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_91132b3897453704', 'ind_91132b3897453704', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Haliru Buhari', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_91132b3897453704', 'prof_91132b3897453704',
  'Member, Sokoto State House of Assembly (SOKOTO NORTH II)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_91132b3897453704', 'ind_91132b3897453704', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_91132b3897453704', 'ind_91132b3897453704', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_91132b3897453704', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|sokoto north ii|2023',
  'insert', 'ind_91132b3897453704',
  'Unique: Sokoto Sokoto North II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_91132b3897453704', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_91132b3897453704', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_91132b3897453704', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_sokoto_north_ii',
  'ind_91132b3897453704', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_91132b3897453704', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Sokoto North II', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_91132b3897453704', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_91132b3897453704',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_91132b3897453704', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_91132b3897453704',
  'political_assignment', '{"constituency_inec": "SOKOTO NORTH II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_91132b3897453704', 'prof_91132b3897453704',
  'Haliru Buhari',
  'haliru buhari sokoto state assembly sokoto north ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 28. Ahmed Mohammed Malami -- Sokoto South II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_67a91b284289abae', 'Ahmed Mohammed Malami',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_67a91b284289abae', 'ind_67a91b284289abae', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ahmed Mohammed Malami', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_67a91b284289abae', 'prof_67a91b284289abae',
  'Member, Sokoto State House of Assembly (SOKOTO SOUTH II)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_67a91b284289abae', 'ind_67a91b284289abae', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_67a91b284289abae', 'ind_67a91b284289abae', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_67a91b284289abae', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|sokoto south ii|2023',
  'insert', 'ind_67a91b284289abae',
  'Unique: Sokoto Sokoto South II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_67a91b284289abae', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_67a91b284289abae', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_67a91b284289abae', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_sokoto_south_ii',
  'ind_67a91b284289abae', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_67a91b284289abae', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Sokoto South II', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_67a91b284289abae', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_67a91b284289abae',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_67a91b284289abae', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_67a91b284289abae',
  'political_assignment', '{"constituency_inec": "SOKOTO SOUTH II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_67a91b284289abae', 'prof_67a91b284289abae',
  'Ahmed Mohammed Malami',
  'ahmed mohammed malami sokoto state assembly sokoto south ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

-- 29. Aminu Suleiman -- Tambuwal South (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_06a1e81d57facb84', 'Aminu Suleiman',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_06a1e81d57facb84', 'ind_06a1e81d57facb84', 'individual', 'place_state_sokoto',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aminu Suleiman', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_06a1e81d57facb84', 'prof_06a1e81d57facb84',
  'Member, Sokoto State House of Assembly (TAMBUWAL SOUTH)',
  'place_state_sokoto', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_06a1e81d57facb84', 'ind_06a1e81d57facb84', 'term_ng_sokoto_state_assembly_10th_2023_2027',
  'place_state_sokoto', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_06a1e81d57facb84', 'ind_06a1e81d57facb84', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_06a1e81d57facb84', 'seed_run_s05_political_sokoto_roster_20260502', 'individual',
  'ng_state_assembly_member|sokoto|tambuwal south|2023',
  'insert', 'ind_06a1e81d57facb84',
  'Unique: Sokoto Tambuwal South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_06a1e81d57facb84', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_06a1e81d57facb84', 'seed_source_nigerianleaders_sokoto_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_06a1e81d57facb84', 'seed_run_s05_political_sokoto_roster_20260502', 'seed_source_nigerianleaders_sokoto_assembly_20260502',
  'nl_sokoto_assembly_2023_tambuwal_south',
  'ind_06a1e81d57facb84', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_06a1e81d57facb84', 'seed_run_s05_political_sokoto_roster_20260502',
  'Sokoto Tambuwal South', 'place_state_sokoto', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_06a1e81d57facb84', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_06a1e81d57facb84',
  'seed_source_nigerianleaders_sokoto_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_06a1e81d57facb84', 'seed_run_s05_political_sokoto_roster_20260502', 'individual', 'ind_06a1e81d57facb84',
  'political_assignment', '{"constituency_inec": "TAMBUWAL SOUTH", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/sokoto-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_06a1e81d57facb84', 'prof_06a1e81d57facb84',
  'Aminu Suleiman',
  'aminu suleiman sokoto state assembly tambuwal south adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_sokoto',
  'political',
  unixepoch(), unixepoch()
);

