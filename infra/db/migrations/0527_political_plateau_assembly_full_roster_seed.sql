-- ============================================================
-- Migration 0527: Plateau State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Plateau State House of Assembly Members
-- Members seeded: 21/24
-- Party breakdown: ADC:7, AA:6, PDP:5, LP:2, APC:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_plateau_assembly_20260502',
  'NigerianLeaders – Complete List of Plateau State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/plateau-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_plateau_roster_20260502', 'S05 Batch – Plateau State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_plateau_roster_20260502',
  'seed_run_s05_political_plateau_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0527_political_plateau_assembly_full_roster_seed.sql',
  NULL, 21,
  '21/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_plateau_state_assembly_10th_2023_2027',
  'Plateau State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_plateau',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (21 of 24 seats) ──────────────────────────────────────

-- 01. Jamo Luka Pam -- Barkin Ladi (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_85e204bea88abce6', 'Jamo Luka Pam',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_85e204bea88abce6', 'ind_85e204bea88abce6', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jamo Luka Pam', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_85e204bea88abce6', 'prof_85e204bea88abce6',
  'Member, Plateau State House of Assembly (BARKIN LADI)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_85e204bea88abce6', 'ind_85e204bea88abce6', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_85e204bea88abce6', 'ind_85e204bea88abce6', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_85e204bea88abce6', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|barkin ladi|2023',
  'insert', 'ind_85e204bea88abce6',
  'Unique: Plateau Barkin Ladi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_85e204bea88abce6', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_85e204bea88abce6', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_85e204bea88abce6', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_barkin_ladi',
  'ind_85e204bea88abce6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_85e204bea88abce6', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Barkin Ladi', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_85e204bea88abce6', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_85e204bea88abce6',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_85e204bea88abce6', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_85e204bea88abce6',
  'political_assignment', '{"constituency_inec": "BARKIN LADI", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_85e204bea88abce6', 'prof_85e204bea88abce6',
  'Jamo Luka Pam',
  'jamo luka pam plateau state assembly barkin ladi adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Akawu Mathew Yarda David -- Pengana (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_92186fc57e500ecf', 'Akawu Mathew Yarda David',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_92186fc57e500ecf', 'ind_92186fc57e500ecf', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akawu Mathew Yarda David', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_92186fc57e500ecf', 'prof_92186fc57e500ecf',
  'Member, Plateau State House of Assembly (PENGANA)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_92186fc57e500ecf', 'ind_92186fc57e500ecf', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_92186fc57e500ecf', 'ind_92186fc57e500ecf', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_92186fc57e500ecf', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|pengana|2023',
  'insert', 'ind_92186fc57e500ecf',
  'Unique: Plateau Pengana seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_92186fc57e500ecf', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_92186fc57e500ecf', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_92186fc57e500ecf', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_pengana',
  'ind_92186fc57e500ecf', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_92186fc57e500ecf', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Pengana', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_92186fc57e500ecf', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_92186fc57e500ecf',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_92186fc57e500ecf', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_92186fc57e500ecf',
  'political_assignment', '{"constituency_inec": "PENGANA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_92186fc57e500ecf', 'prof_92186fc57e500ecf',
  'Akawu Mathew Yarda David',
  'akawu mathew yarda david plateau state assembly pengana pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Akuja Hosea Imbutuk -- Rukuba/Irigwe (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5534637ece42fdb4', 'Akuja Hosea Imbutuk',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5534637ece42fdb4', 'ind_5534637ece42fdb4', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akuja Hosea Imbutuk', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5534637ece42fdb4', 'prof_5534637ece42fdb4',
  'Member, Plateau State House of Assembly (RUKUBA/IRIGWE)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5534637ece42fdb4', 'ind_5534637ece42fdb4', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5534637ece42fdb4', 'ind_5534637ece42fdb4', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5534637ece42fdb4', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|rukuba/irigwe|2023',
  'insert', 'ind_5534637ece42fdb4',
  'Unique: Plateau Rukuba/Irigwe seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5534637ece42fdb4', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_5534637ece42fdb4', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5534637ece42fdb4', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_rukuba/irigwe',
  'ind_5534637ece42fdb4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5534637ece42fdb4', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Rukuba/Irigwe', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5534637ece42fdb4', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_5534637ece42fdb4',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5534637ece42fdb4', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_5534637ece42fdb4',
  'political_assignment', '{"constituency_inec": "RUKUBA/IRIGWE", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5534637ece42fdb4', 'prof_5534637ece42fdb4',
  'Akuja Hosea Imbutuk',
  'akuja hosea imbutuk plateau state assembly rukuba/irigwe adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Mandash Luka Maram -- Bokkos (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_48c5ef931fbf21a5', 'Mandash Luka Maram',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_48c5ef931fbf21a5', 'ind_48c5ef931fbf21a5', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mandash Luka Maram', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_48c5ef931fbf21a5', 'prof_48c5ef931fbf21a5',
  'Member, Plateau State House of Assembly (BOKKOS)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_48c5ef931fbf21a5', 'ind_48c5ef931fbf21a5', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_48c5ef931fbf21a5', 'ind_48c5ef931fbf21a5', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_48c5ef931fbf21a5', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|bokkos|2023',
  'insert', 'ind_48c5ef931fbf21a5',
  'Unique: Plateau Bokkos seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_48c5ef931fbf21a5', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_48c5ef931fbf21a5', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_48c5ef931fbf21a5', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_bokkos',
  'ind_48c5ef931fbf21a5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_48c5ef931fbf21a5', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Bokkos', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_48c5ef931fbf21a5', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_48c5ef931fbf21a5',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_48c5ef931fbf21a5', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_48c5ef931fbf21a5',
  'political_assignment', '{"constituency_inec": "BOKKOS", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_48c5ef931fbf21a5', 'prof_48c5ef931fbf21a5',
  'Mandash Luka Maram',
  'mandash luka maram plateau state assembly bokkos adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Silas Nyam Adams -- Jos East (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c70433ddb4ec7f12', 'Silas Nyam Adams',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c70433ddb4ec7f12', 'ind_c70433ddb4ec7f12', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Silas Nyam Adams', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c70433ddb4ec7f12', 'prof_c70433ddb4ec7f12',
  'Member, Plateau State House of Assembly (JOS EAST)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c70433ddb4ec7f12', 'ind_c70433ddb4ec7f12', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c70433ddb4ec7f12', 'ind_c70433ddb4ec7f12', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c70433ddb4ec7f12', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|jos east|2023',
  'insert', 'ind_c70433ddb4ec7f12',
  'Unique: Plateau Jos East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c70433ddb4ec7f12', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_c70433ddb4ec7f12', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c70433ddb4ec7f12', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_jos_east',
  'ind_c70433ddb4ec7f12', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c70433ddb4ec7f12', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Jos East', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c70433ddb4ec7f12', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_c70433ddb4ec7f12',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c70433ddb4ec7f12', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_c70433ddb4ec7f12',
  'political_assignment', '{"constituency_inec": "JOS EAST", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c70433ddb4ec7f12', 'prof_c70433ddb4ec7f12',
  'Silas Nyam Adams',
  'silas nyam adams plateau state assembly jos east adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Usman Anas Isah -- Jos North (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9a36107281630bd6', 'Usman Anas Isah',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9a36107281630bd6', 'ind_9a36107281630bd6', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Usman Anas Isah', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9a36107281630bd6', 'prof_9a36107281630bd6',
  'Member, Plateau State House of Assembly (JOS NORTH)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9a36107281630bd6', 'ind_9a36107281630bd6', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9a36107281630bd6', 'ind_9a36107281630bd6', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9a36107281630bd6', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|jos north|2023',
  'insert', 'ind_9a36107281630bd6',
  'Unique: Plateau Jos North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9a36107281630bd6', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_9a36107281630bd6', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9a36107281630bd6', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_jos_north',
  'ind_9a36107281630bd6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9a36107281630bd6', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Jos North', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9a36107281630bd6', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_9a36107281630bd6',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9a36107281630bd6', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_9a36107281630bd6',
  'political_assignment', '{"constituency_inec": "JOS NORTH", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9a36107281630bd6', 'prof_9a36107281630bd6',
  'Usman Anas Isah',
  'usman anas isah plateau state assembly jos north aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Daniel Nanbol Listick -- Jos West (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_63e8cecc63c68172', 'Daniel Nanbol Listick',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_63e8cecc63c68172', 'ind_63e8cecc63c68172', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Daniel Nanbol Listick', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_63e8cecc63c68172', 'prof_63e8cecc63c68172',
  'Member, Plateau State House of Assembly (JOS WEST)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_63e8cecc63c68172', 'ind_63e8cecc63c68172', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_63e8cecc63c68172', 'ind_63e8cecc63c68172', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_63e8cecc63c68172', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|jos west|2023',
  'insert', 'ind_63e8cecc63c68172',
  'Unique: Plateau Jos West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_63e8cecc63c68172', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_63e8cecc63c68172', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_63e8cecc63c68172', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_jos_west',
  'ind_63e8cecc63c68172', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_63e8cecc63c68172', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Jos West', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_63e8cecc63c68172', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_63e8cecc63c68172',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_63e8cecc63c68172', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_63e8cecc63c68172',
  'political_assignment', '{"constituency_inec": "JOS WEST", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_63e8cecc63c68172', 'prof_63e8cecc63c68172',
  'Daniel Nanbol Listick',
  'daniel nanbol listick plateau state assembly jos west lp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Gwottson Dalyop Fom -- Jos South (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_18b6b4e3db528661', 'Gwottson Dalyop Fom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_18b6b4e3db528661', 'ind_18b6b4e3db528661', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Gwottson Dalyop Fom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_18b6b4e3db528661', 'prof_18b6b4e3db528661',
  'Member, Plateau State House of Assembly (JOS SOUTH)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_18b6b4e3db528661', 'ind_18b6b4e3db528661', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_18b6b4e3db528661', 'ind_18b6b4e3db528661', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_18b6b4e3db528661', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|jos south|2023',
  'insert', 'ind_18b6b4e3db528661',
  'Unique: Plateau Jos South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_18b6b4e3db528661', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_18b6b4e3db528661', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_18b6b4e3db528661', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_jos_south',
  'ind_18b6b4e3db528661', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_18b6b4e3db528661', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Jos South', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_18b6b4e3db528661', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_18b6b4e3db528661',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_18b6b4e3db528661', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_18b6b4e3db528661',
  'political_assignment', '{"constituency_inec": "JOS SOUTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_18b6b4e3db528661', 'prof_18b6b4e3db528661',
  'Gwottson Dalyop Fom',
  'gwottson dalyop fom plateau state assembly jos south pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Paradang Alphonsus -- Pankshin North (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8ff5b716c9d31a96', 'Paradang Alphonsus',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8ff5b716c9d31a96', 'ind_8ff5b716c9d31a96', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Paradang Alphonsus', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8ff5b716c9d31a96', 'prof_8ff5b716c9d31a96',
  'Member, Plateau State House of Assembly (PANKSHIN NORTH)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8ff5b716c9d31a96', 'ind_8ff5b716c9d31a96', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8ff5b716c9d31a96', 'ind_8ff5b716c9d31a96', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8ff5b716c9d31a96', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|pankshin north|2023',
  'insert', 'ind_8ff5b716c9d31a96',
  'Unique: Plateau Pankshin North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8ff5b716c9d31a96', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_8ff5b716c9d31a96', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8ff5b716c9d31a96', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_pankshin_north',
  'ind_8ff5b716c9d31a96', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8ff5b716c9d31a96', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Pankshin North', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8ff5b716c9d31a96', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_8ff5b716c9d31a96',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8ff5b716c9d31a96', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_8ff5b716c9d31a96',
  'political_assignment', '{"constituency_inec": "PANKSHIN NORTH", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8ff5b716c9d31a96', 'prof_8ff5b716c9d31a96',
  'Paradang Alphonsus',
  'paradang alphonsus plateau state assembly pankshin north aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Dahip Abednego Luka -- Pankshin South (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3b013cb2d610526e', 'Dahip Abednego Luka',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3b013cb2d610526e', 'ind_3b013cb2d610526e', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dahip Abednego Luka', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3b013cb2d610526e', 'prof_3b013cb2d610526e',
  'Member, Plateau State House of Assembly (PANKSHIN SOUTH)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3b013cb2d610526e', 'ind_3b013cb2d610526e', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3b013cb2d610526e', 'ind_3b013cb2d610526e', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3b013cb2d610526e', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|pankshin south|2023',
  'insert', 'ind_3b013cb2d610526e',
  'Unique: Plateau Pankshin South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3b013cb2d610526e', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_3b013cb2d610526e', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3b013cb2d610526e', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_pankshin_south',
  'ind_3b013cb2d610526e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3b013cb2d610526e', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Pankshin South', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3b013cb2d610526e', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_3b013cb2d610526e',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3b013cb2d610526e', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_3b013cb2d610526e',
  'political_assignment', '{"constituency_inec": "PANKSHIN SOUTH", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3b013cb2d610526e', 'prof_3b013cb2d610526e',
  'Dahip Abednego Luka',
  'dahip abednego luka plateau state assembly pankshin south aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Isa Shuibu Idris -- Kanam (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_76e5332d1e539d7b', 'Isa Shuibu Idris',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_76e5332d1e539d7b', 'ind_76e5332d1e539d7b', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Isa Shuibu Idris', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_76e5332d1e539d7b', 'prof_76e5332d1e539d7b',
  'Member, Plateau State House of Assembly (KANAM)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_76e5332d1e539d7b', 'ind_76e5332d1e539d7b', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_76e5332d1e539d7b', 'ind_76e5332d1e539d7b', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_76e5332d1e539d7b', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|kanam|2023',
  'insert', 'ind_76e5332d1e539d7b',
  'Unique: Plateau Kanam seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_76e5332d1e539d7b', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_76e5332d1e539d7b', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_76e5332d1e539d7b', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_kanam',
  'ind_76e5332d1e539d7b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_76e5332d1e539d7b', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Kanam', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_76e5332d1e539d7b', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_76e5332d1e539d7b',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_76e5332d1e539d7b', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_76e5332d1e539d7b',
  'political_assignment', '{"constituency_inec": "KANAM", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_76e5332d1e539d7b', 'prof_76e5332d1e539d7b',
  'Isa Shuibu Idris',
  'isa shuibu idris plateau state assembly kanam adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Lar Ramnan Daniel -- Langtang North (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cfce6afd3a9241f5', 'Lar Ramnan Daniel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cfce6afd3a9241f5', 'ind_cfce6afd3a9241f5', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lar Ramnan Daniel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cfce6afd3a9241f5', 'prof_cfce6afd3a9241f5',
  'Member, Plateau State House of Assembly (LANGTANG NORTH)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cfce6afd3a9241f5', 'ind_cfce6afd3a9241f5', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cfce6afd3a9241f5', 'ind_cfce6afd3a9241f5', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cfce6afd3a9241f5', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|langtang north|2023',
  'insert', 'ind_cfce6afd3a9241f5',
  'Unique: Plateau Langtang North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cfce6afd3a9241f5', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_cfce6afd3a9241f5', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cfce6afd3a9241f5', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_langtang_north',
  'ind_cfce6afd3a9241f5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cfce6afd3a9241f5', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Langtang North', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cfce6afd3a9241f5', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_cfce6afd3a9241f5',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cfce6afd3a9241f5', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_cfce6afd3a9241f5',
  'political_assignment', '{"constituency_inec": "LANGTANG NORTH", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cfce6afd3a9241f5', 'prof_cfce6afd3a9241f5',
  'Lar Ramnan Daniel',
  'lar ramnan daniel plateau state assembly langtang north aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Daniel Nanbol Listick -- Langtang Central (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f4bb4a3524fc2636', 'Daniel Nanbol Listick',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f4bb4a3524fc2636', 'ind_f4bb4a3524fc2636', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Daniel Nanbol Listick', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f4bb4a3524fc2636', 'prof_f4bb4a3524fc2636',
  'Member, Plateau State House of Assembly (LANGTANG CENTRAL)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f4bb4a3524fc2636', 'ind_f4bb4a3524fc2636', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f4bb4a3524fc2636', 'ind_f4bb4a3524fc2636', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f4bb4a3524fc2636', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|langtang central|2023',
  'insert', 'ind_f4bb4a3524fc2636',
  'Unique: Plateau Langtang Central seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f4bb4a3524fc2636', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_f4bb4a3524fc2636', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f4bb4a3524fc2636', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_langtang_central',
  'ind_f4bb4a3524fc2636', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f4bb4a3524fc2636', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Langtang Central', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f4bb4a3524fc2636', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_f4bb4a3524fc2636',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f4bb4a3524fc2636', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_f4bb4a3524fc2636',
  'political_assignment', '{"constituency_inec": "LANGTANG CENTRAL", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f4bb4a3524fc2636', 'prof_f4bb4a3524fc2636',
  'Daniel Nanbol Listick',
  'daniel nanbol listick plateau state assembly langtang central lp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Fwangje Bala Ndat -- Mangu South (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1d78bd296eef1b3e', 'Fwangje Bala Ndat',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1d78bd296eef1b3e', 'ind_1d78bd296eef1b3e', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Fwangje Bala Ndat', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1d78bd296eef1b3e', 'prof_1d78bd296eef1b3e',
  'Member, Plateau State House of Assembly (MANGU SOUTH)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1d78bd296eef1b3e', 'ind_1d78bd296eef1b3e', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1d78bd296eef1b3e', 'ind_1d78bd296eef1b3e', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1d78bd296eef1b3e', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|mangu south|2023',
  'insert', 'ind_1d78bd296eef1b3e',
  'Unique: Plateau Mangu South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1d78bd296eef1b3e', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_1d78bd296eef1b3e', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1d78bd296eef1b3e', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_mangu_south',
  'ind_1d78bd296eef1b3e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1d78bd296eef1b3e', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Mangu South', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1d78bd296eef1b3e', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_1d78bd296eef1b3e',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1d78bd296eef1b3e', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_1d78bd296eef1b3e',
  'political_assignment', '{"constituency_inec": "MANGU SOUTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1d78bd296eef1b3e', 'prof_1d78bd296eef1b3e',
  'Fwangje Bala Ndat',
  'fwangje bala ndat plateau state assembly mangu south pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Adamu Abdul, Yanga -- Mangu North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9ada1d3810ec06eb', 'Adamu Abdul, Yanga',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9ada1d3810ec06eb', 'ind_9ada1d3810ec06eb', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adamu Abdul, Yanga', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9ada1d3810ec06eb', 'prof_9ada1d3810ec06eb',
  'Member, Plateau State House of Assembly (MANGU NORTH)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9ada1d3810ec06eb', 'ind_9ada1d3810ec06eb', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9ada1d3810ec06eb', 'ind_9ada1d3810ec06eb', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9ada1d3810ec06eb', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|mangu north|2023',
  'insert', 'ind_9ada1d3810ec06eb',
  'Unique: Plateau Mangu North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9ada1d3810ec06eb', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_9ada1d3810ec06eb', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9ada1d3810ec06eb', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_mangu_north',
  'ind_9ada1d3810ec06eb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9ada1d3810ec06eb', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Mangu North', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9ada1d3810ec06eb', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_9ada1d3810ec06eb',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9ada1d3810ec06eb', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_9ada1d3810ec06eb',
  'political_assignment', '{"constituency_inec": "MANGU NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9ada1d3810ec06eb', 'prof_9ada1d3810ec06eb',
  'Adamu Abdul, Yanga',
  'adamu abdul, yanga plateau state assembly mangu north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Sule Moses Thomas -- Mikang (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_92cca98608ac9d91', 'Sule Moses Thomas',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_92cca98608ac9d91', 'ind_92cca98608ac9d91', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sule Moses Thomas', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_92cca98608ac9d91', 'prof_92cca98608ac9d91',
  'Member, Plateau State House of Assembly (MIKANG)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_92cca98608ac9d91', 'ind_92cca98608ac9d91', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_92cca98608ac9d91', 'ind_92cca98608ac9d91', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_92cca98608ac9d91', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|mikang|2023',
  'insert', 'ind_92cca98608ac9d91',
  'Unique: Plateau Mikang seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_92cca98608ac9d91', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_92cca98608ac9d91', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_92cca98608ac9d91', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_mikang',
  'ind_92cca98608ac9d91', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_92cca98608ac9d91', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Mikang', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_92cca98608ac9d91', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_92cca98608ac9d91',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_92cca98608ac9d91', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_92cca98608ac9d91',
  'political_assignment', '{"constituency_inec": "MIKANG", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_92cca98608ac9d91', 'prof_92cca98608ac9d91',
  'Sule Moses Thomas',
  'sule moses thomas plateau state assembly mikang pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Dashe Charity -- Quaan Pan North (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8b23b79f86206e71', 'Dashe Charity',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8b23b79f86206e71', 'ind_8b23b79f86206e71', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dashe Charity', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8b23b79f86206e71', 'prof_8b23b79f86206e71',
  'Member, Plateau State House of Assembly (QUAAN PAN NORTH)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8b23b79f86206e71', 'ind_8b23b79f86206e71', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8b23b79f86206e71', 'ind_8b23b79f86206e71', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8b23b79f86206e71', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|quaan pan north|2023',
  'insert', 'ind_8b23b79f86206e71',
  'Unique: Plateau Quaan Pan North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8b23b79f86206e71', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_8b23b79f86206e71', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8b23b79f86206e71', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_quaan_pan_north',
  'ind_8b23b79f86206e71', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8b23b79f86206e71', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Quaan Pan North', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8b23b79f86206e71', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_8b23b79f86206e71',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8b23b79f86206e71', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_8b23b79f86206e71',
  'political_assignment', '{"constituency_inec": "QUAAN PAN NORTH", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8b23b79f86206e71', 'prof_8b23b79f86206e71',
  'Dashe Charity',
  'dashe charity plateau state assembly quaan pan north adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Kesun Jeremiah Ndela -- Quaan Pan South (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c1628e0fd3ce047c', 'Kesun Jeremiah Ndela',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c1628e0fd3ce047c', 'ind_c1628e0fd3ce047c', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kesun Jeremiah Ndela', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c1628e0fd3ce047c', 'prof_c1628e0fd3ce047c',
  'Member, Plateau State House of Assembly (QUAAN PAN SOUTH)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c1628e0fd3ce047c', 'ind_c1628e0fd3ce047c', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c1628e0fd3ce047c', 'ind_c1628e0fd3ce047c', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c1628e0fd3ce047c', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|quaan pan south|2023',
  'insert', 'ind_c1628e0fd3ce047c',
  'Unique: Plateau Quaan Pan South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c1628e0fd3ce047c', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_c1628e0fd3ce047c', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c1628e0fd3ce047c', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_quaan_pan_south',
  'ind_c1628e0fd3ce047c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c1628e0fd3ce047c', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Quaan Pan South', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c1628e0fd3ce047c', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_c1628e0fd3ce047c',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c1628e0fd3ce047c', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_c1628e0fd3ce047c',
  'political_assignment', '{"constituency_inec": "QUAAN PAN SOUTH", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c1628e0fd3ce047c', 'prof_c1628e0fd3ce047c',
  'Kesun Jeremiah Ndela',
  'kesun jeremiah ndela plateau state assembly quaan pan south aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Dantong Timothy Dalyop -- Riyom (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e746df5ed2aafa77', 'Dantong Timothy Dalyop',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e746df5ed2aafa77', 'ind_e746df5ed2aafa77', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dantong Timothy Dalyop', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e746df5ed2aafa77', 'prof_e746df5ed2aafa77',
  'Member, Plateau State House of Assembly (RIYOM)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e746df5ed2aafa77', 'ind_e746df5ed2aafa77', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e746df5ed2aafa77', 'ind_e746df5ed2aafa77', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e746df5ed2aafa77', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|riyom|2023',
  'insert', 'ind_e746df5ed2aafa77',
  'Unique: Plateau Riyom seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e746df5ed2aafa77', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_e746df5ed2aafa77', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e746df5ed2aafa77', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_riyom',
  'ind_e746df5ed2aafa77', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e746df5ed2aafa77', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Riyom', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e746df5ed2aafa77', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_e746df5ed2aafa77',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e746df5ed2aafa77', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_e746df5ed2aafa77',
  'political_assignment', '{"constituency_inec": "RIYOM", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e746df5ed2aafa77', 'prof_e746df5ed2aafa77',
  'Dantong Timothy Dalyop',
  'dantong timothy dalyop plateau state assembly riyom pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Muhammed Usman Shamsuddin -- Shendam (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f2fd4358ea524239', 'Muhammed Usman Shamsuddin',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f2fd4358ea524239', 'ind_f2fd4358ea524239', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammed Usman Shamsuddin', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f2fd4358ea524239', 'prof_f2fd4358ea524239',
  'Member, Plateau State House of Assembly (SHENDAM)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f2fd4358ea524239', 'ind_f2fd4358ea524239', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f2fd4358ea524239', 'ind_f2fd4358ea524239', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f2fd4358ea524239', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|shendam|2023',
  'insert', 'ind_f2fd4358ea524239',
  'Unique: Plateau Shendam seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f2fd4358ea524239', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_f2fd4358ea524239', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f2fd4358ea524239', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_shendam',
  'ind_f2fd4358ea524239', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f2fd4358ea524239', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Shendam', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f2fd4358ea524239', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_f2fd4358ea524239',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f2fd4358ea524239', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_f2fd4358ea524239',
  'political_assignment', '{"constituency_inec": "SHENDAM", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f2fd4358ea524239', 'prof_f2fd4358ea524239',
  'Muhammed Usman Shamsuddin',
  'muhammed usman shamsuddin plateau state assembly shendam aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Usman Yahaya Haruna -- Wase (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_85c4c9c957ca0320', 'Usman Yahaya Haruna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_85c4c9c957ca0320', 'ind_85c4c9c957ca0320', 'individual', 'place_state_plateau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Usman Yahaya Haruna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_85c4c9c957ca0320', 'prof_85c4c9c957ca0320',
  'Member, Plateau State House of Assembly (WASE)',
  'place_state_plateau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_85c4c9c957ca0320', 'ind_85c4c9c957ca0320', 'term_ng_plateau_state_assembly_10th_2023_2027',
  'place_state_plateau', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_85c4c9c957ca0320', 'ind_85c4c9c957ca0320', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_85c4c9c957ca0320', 'seed_run_s05_political_plateau_roster_20260502', 'individual',
  'ng_state_assembly_member|plateau|wase|2023',
  'insert', 'ind_85c4c9c957ca0320',
  'Unique: Plateau Wase seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_85c4c9c957ca0320', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_85c4c9c957ca0320', 'seed_source_nigerianleaders_plateau_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_85c4c9c957ca0320', 'seed_run_s05_political_plateau_roster_20260502', 'seed_source_nigerianleaders_plateau_assembly_20260502',
  'nl_plateau_assembly_2023_wase',
  'ind_85c4c9c957ca0320', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_85c4c9c957ca0320', 'seed_run_s05_political_plateau_roster_20260502',
  'Plateau Wase', 'place_state_plateau', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_85c4c9c957ca0320', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_85c4c9c957ca0320',
  'seed_source_nigerianleaders_plateau_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_85c4c9c957ca0320', 'seed_run_s05_political_plateau_roster_20260502', 'individual', 'ind_85c4c9c957ca0320',
  'political_assignment', '{"constituency_inec": "WASE", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/plateau-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_85c4c9c957ca0320', 'prof_85c4c9c957ca0320',
  'Usman Yahaya Haruna',
  'usman yahaya haruna plateau state assembly wase adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_plateau',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
