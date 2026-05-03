-- ============================================================
-- Migration 0530: Yobe State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Yobe State House of Assembly Members
-- Members seeded: 24/24
-- Party breakdown: APC:19, ADC:4, ADP:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_yobe_assembly_20260502',
  'NigerianLeaders – Complete List of Yobe State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/yobe-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_yobe_roster_20260502', 'S05 Batch – Yobe State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_yobe_roster_20260502',
  'seed_run_s05_political_yobe_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0530_political_yobe_assembly_full_roster_seed.sql',
  NULL, 24,
  '24/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_yobe_state_assembly_10th_2023_2027',
  'Yobe State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_yobe',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (24 of 24 seats) ──────────────────────────────────────

-- 01. Kabir Mohammed Maimota -- Bade East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6c1d21c30ce04586', 'Kabir Mohammed Maimota',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6c1d21c30ce04586', 'ind_6c1d21c30ce04586', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kabir Mohammed Maimota', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6c1d21c30ce04586', 'prof_6c1d21c30ce04586',
  'Member, Yobe State House of Assembly (BADE EAST)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6c1d21c30ce04586', 'ind_6c1d21c30ce04586', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6c1d21c30ce04586', 'ind_6c1d21c30ce04586', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6c1d21c30ce04586', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|bade east|2023',
  'insert', 'ind_6c1d21c30ce04586',
  'Unique: Yobe Bade East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6c1d21c30ce04586', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_6c1d21c30ce04586', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6c1d21c30ce04586', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_bade_east',
  'ind_6c1d21c30ce04586', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6c1d21c30ce04586', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Bade East', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6c1d21c30ce04586', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_6c1d21c30ce04586',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6c1d21c30ce04586', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_6c1d21c30ce04586',
  'political_assignment', '{"constituency_inec": "BADE EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6c1d21c30ce04586', 'prof_6c1d21c30ce04586',
  'Kabir Mohammed Maimota',
  'kabir mohammed maimota yobe state assembly bade east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Abubakar Tarbutu Umar -- Bade West (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_41337f8bd4d3585c', 'Abubakar Tarbutu Umar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_41337f8bd4d3585c', 'ind_41337f8bd4d3585c', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Tarbutu Umar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_41337f8bd4d3585c', 'prof_41337f8bd4d3585c',
  'Member, Yobe State House of Assembly (BADE WEST)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_41337f8bd4d3585c', 'ind_41337f8bd4d3585c', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_41337f8bd4d3585c', 'ind_41337f8bd4d3585c', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_41337f8bd4d3585c', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|bade west|2023',
  'insert', 'ind_41337f8bd4d3585c',
  'Unique: Yobe Bade West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_41337f8bd4d3585c', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_41337f8bd4d3585c', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_41337f8bd4d3585c', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_bade_west',
  'ind_41337f8bd4d3585c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_41337f8bd4d3585c', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Bade West', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_41337f8bd4d3585c', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_41337f8bd4d3585c',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_41337f8bd4d3585c', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_41337f8bd4d3585c',
  'political_assignment', '{"constituency_inec": "BADE WEST", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_41337f8bd4d3585c', 'prof_41337f8bd4d3585c',
  'Abubakar Tarbutu Umar',
  'abubakar tarbutu umar yobe state assembly bade west adc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Haruna Ali Nasir -- Bursari (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c5bd45b6c65667c1', 'Haruna Ali Nasir',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c5bd45b6c65667c1', 'ind_c5bd45b6c65667c1', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Haruna Ali Nasir', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c5bd45b6c65667c1', 'prof_c5bd45b6c65667c1',
  'Member, Yobe State House of Assembly (BURSARI)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c5bd45b6c65667c1', 'ind_c5bd45b6c65667c1', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c5bd45b6c65667c1', 'ind_c5bd45b6c65667c1', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c5bd45b6c65667c1', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|bursari|2023',
  'insert', 'ind_c5bd45b6c65667c1',
  'Unique: Yobe Bursari seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c5bd45b6c65667c1', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_c5bd45b6c65667c1', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c5bd45b6c65667c1', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_bursari',
  'ind_c5bd45b6c65667c1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c5bd45b6c65667c1', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Bursari', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c5bd45b6c65667c1', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_c5bd45b6c65667c1',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c5bd45b6c65667c1', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_c5bd45b6c65667c1',
  'political_assignment', '{"constituency_inec": "BURSARI", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c5bd45b6c65667c1', 'prof_c5bd45b6c65667c1',
  'Haruna Ali Nasir',
  'haruna ali nasir yobe state assembly bursari adc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Aliyu Zakariya -- Damaturu I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1bdc7b7fa8430136', 'Aliyu Zakariya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1bdc7b7fa8430136', 'ind_1bdc7b7fa8430136', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aliyu Zakariya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1bdc7b7fa8430136', 'prof_1bdc7b7fa8430136',
  'Member, Yobe State House of Assembly (DAMATURU I)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1bdc7b7fa8430136', 'ind_1bdc7b7fa8430136', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1bdc7b7fa8430136', 'ind_1bdc7b7fa8430136', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1bdc7b7fa8430136', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|damaturu i|2023',
  'insert', 'ind_1bdc7b7fa8430136',
  'Unique: Yobe Damaturu I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1bdc7b7fa8430136', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_1bdc7b7fa8430136', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1bdc7b7fa8430136', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_damaturu_i',
  'ind_1bdc7b7fa8430136', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1bdc7b7fa8430136', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Damaturu I', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1bdc7b7fa8430136', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_1bdc7b7fa8430136',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1bdc7b7fa8430136', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_1bdc7b7fa8430136',
  'political_assignment', '{"constituency_inec": "DAMATURU I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1bdc7b7fa8430136', 'prof_1bdc7b7fa8430136',
  'Aliyu Zakariya',
  'aliyu zakariya yobe state assembly damaturu i apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Suleiman Yakubu Maluri -- Fika/Ngalda (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5727747060a54e50', 'Suleiman Yakubu Maluri',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5727747060a54e50', 'ind_5727747060a54e50', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Suleiman Yakubu Maluri', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5727747060a54e50', 'prof_5727747060a54e50',
  'Member, Yobe State House of Assembly (FIKA/NGALDA)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5727747060a54e50', 'ind_5727747060a54e50', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5727747060a54e50', 'ind_5727747060a54e50', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5727747060a54e50', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|fika/ngalda|2023',
  'insert', 'ind_5727747060a54e50',
  'Unique: Yobe Fika/Ngalda seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5727747060a54e50', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_5727747060a54e50', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5727747060a54e50', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_fika/ngalda',
  'ind_5727747060a54e50', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5727747060a54e50', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Fika/Ngalda', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5727747060a54e50', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_5727747060a54e50',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5727747060a54e50', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_5727747060a54e50',
  'political_assignment', '{"constituency_inec": "FIKA/NGALDA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5727747060a54e50', 'prof_5727747060a54e50',
  'Suleiman Yakubu Maluri',
  'suleiman yakubu maluri yobe state assembly fika/ngalda apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Sani Ishaka Audu -- Goya/Ngeji (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c7740fb0302426e9', 'Sani Ishaka Audu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c7740fb0302426e9', 'ind_c7740fb0302426e9', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sani Ishaka Audu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c7740fb0302426e9', 'prof_c7740fb0302426e9',
  'Member, Yobe State House of Assembly (GOYA/NGEJI)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c7740fb0302426e9', 'ind_c7740fb0302426e9', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c7740fb0302426e9', 'ind_c7740fb0302426e9', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c7740fb0302426e9', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|goya/ngeji|2023',
  'insert', 'ind_c7740fb0302426e9',
  'Unique: Yobe Goya/Ngeji seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c7740fb0302426e9', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_c7740fb0302426e9', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c7740fb0302426e9', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_goya/ngeji',
  'ind_c7740fb0302426e9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c7740fb0302426e9', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Goya/Ngeji', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c7740fb0302426e9', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_c7740fb0302426e9',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c7740fb0302426e9', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_c7740fb0302426e9',
  'political_assignment', '{"constituency_inec": "GOYA/NGEJI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c7740fb0302426e9', 'prof_c7740fb0302426e9',
  'Sani Ishaka Audu',
  'sani ishaka audu yobe state assembly goya/ngeji apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Digma Gana Maina -- Damagum (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7b87b9691086a994', 'Digma Gana Maina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7b87b9691086a994', 'ind_7b87b9691086a994', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Digma Gana Maina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7b87b9691086a994', 'prof_7b87b9691086a994',
  'Member, Yobe State House of Assembly (DAMAGUM)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7b87b9691086a994', 'ind_7b87b9691086a994', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7b87b9691086a994', 'ind_7b87b9691086a994', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7b87b9691086a994', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|damagum|2023',
  'insert', 'ind_7b87b9691086a994',
  'Unique: Yobe Damagum seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7b87b9691086a994', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_7b87b9691086a994', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7b87b9691086a994', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_damagum',
  'ind_7b87b9691086a994', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7b87b9691086a994', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Damagum', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7b87b9691086a994', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_7b87b9691086a994',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7b87b9691086a994', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_7b87b9691086a994',
  'political_assignment', '{"constituency_inec": "DAMAGUM", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7b87b9691086a994', 'prof_7b87b9691086a994',
  'Digma Gana Maina',
  'digma gana maina yobe state assembly damagum apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Buba Chiroma A. -- Jajere (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_378a16a54a4a31fd', 'Buba Chiroma A.',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_378a16a54a4a31fd', 'ind_378a16a54a4a31fd', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Buba Chiroma A.', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_378a16a54a4a31fd', 'prof_378a16a54a4a31fd',
  'Member, Yobe State House of Assembly (JAJERE)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_378a16a54a4a31fd', 'ind_378a16a54a4a31fd', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_378a16a54a4a31fd', 'ind_378a16a54a4a31fd', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_378a16a54a4a31fd', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|jajere|2023',
  'insert', 'ind_378a16a54a4a31fd',
  'Unique: Yobe Jajere seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_378a16a54a4a31fd', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_378a16a54a4a31fd', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_378a16a54a4a31fd', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_jajere',
  'ind_378a16a54a4a31fd', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_378a16a54a4a31fd', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Jajere', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_378a16a54a4a31fd', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_378a16a54a4a31fd',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_378a16a54a4a31fd', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_378a16a54a4a31fd',
  'political_assignment', '{"constituency_inec": "JAJERE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_378a16a54a4a31fd', 'prof_378a16a54a4a31fd',
  'Buba Chiroma A.',
  'buba chiroma a. yobe state assembly jajere apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Ali Mohammed -- Geidam South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9c23bc95b27017e0', 'Ali Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9c23bc95b27017e0', 'ind_9c23bc95b27017e0', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ali Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9c23bc95b27017e0', 'prof_9c23bc95b27017e0',
  'Member, Yobe State House of Assembly (GEIDAM SOUTH)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9c23bc95b27017e0', 'ind_9c23bc95b27017e0', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9c23bc95b27017e0', 'ind_9c23bc95b27017e0', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9c23bc95b27017e0', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|geidam south|2023',
  'insert', 'ind_9c23bc95b27017e0',
  'Unique: Yobe Geidam South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9c23bc95b27017e0', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_9c23bc95b27017e0', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9c23bc95b27017e0', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_geidam_south',
  'ind_9c23bc95b27017e0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9c23bc95b27017e0', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Geidam South', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9c23bc95b27017e0', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_9c23bc95b27017e0',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9c23bc95b27017e0', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_9c23bc95b27017e0',
  'political_assignment', '{"constituency_inec": "GEIDAM SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9c23bc95b27017e0', 'prof_9c23bc95b27017e0',
  'Ali Mohammed',
  'ali mohammed yobe state assembly geidam south apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Mustapha Alhaji Bukar -- Geidam North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9ba7aa464616094e', 'Mustapha Alhaji Bukar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9ba7aa464616094e', 'ind_9ba7aa464616094e', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mustapha Alhaji Bukar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9ba7aa464616094e', 'prof_9ba7aa464616094e',
  'Member, Yobe State House of Assembly (GEIDAM NORTH)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9ba7aa464616094e', 'ind_9ba7aa464616094e', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9ba7aa464616094e', 'ind_9ba7aa464616094e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9ba7aa464616094e', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|geidam north|2023',
  'insert', 'ind_9ba7aa464616094e',
  'Unique: Yobe Geidam North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9ba7aa464616094e', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_9ba7aa464616094e', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9ba7aa464616094e', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_geidam_north',
  'ind_9ba7aa464616094e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9ba7aa464616094e', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Geidam North', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9ba7aa464616094e', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_9ba7aa464616094e',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9ba7aa464616094e', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_9ba7aa464616094e',
  'political_assignment', '{"constituency_inec": "GEIDAM NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9ba7aa464616094e', 'prof_9ba7aa464616094e',
  'Mustapha Alhaji Bukar',
  'mustapha alhaji bukar yobe state assembly geidam north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Zannani Bularaba Bunu -- Gulani (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cb5068a551602e25', 'Zannani Bularaba Bunu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cb5068a551602e25', 'ind_cb5068a551602e25', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Zannani Bularaba Bunu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cb5068a551602e25', 'prof_cb5068a551602e25',
  'Member, Yobe State House of Assembly (GULANI)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cb5068a551602e25', 'ind_cb5068a551602e25', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cb5068a551602e25', 'ind_cb5068a551602e25', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cb5068a551602e25', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|gulani|2023',
  'insert', 'ind_cb5068a551602e25',
  'Unique: Yobe Gulani seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cb5068a551602e25', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_cb5068a551602e25', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cb5068a551602e25', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_gulani',
  'ind_cb5068a551602e25', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cb5068a551602e25', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Gulani', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cb5068a551602e25', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_cb5068a551602e25',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cb5068a551602e25', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_cb5068a551602e25',
  'political_assignment', '{"constituency_inec": "GULANI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cb5068a551602e25', 'prof_cb5068a551602e25',
  'Zannani Bularaba Bunu',
  'zannani bularaba bunu yobe state assembly gulani apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Shuaibu Lawan -- Jakusko (ADP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5763d44d0b875cdb', 'Shuaibu Lawan',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5763d44d0b875cdb', 'ind_5763d44d0b875cdb', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Shuaibu Lawan', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5763d44d0b875cdb', 'prof_5763d44d0b875cdb',
  'Member, Yobe State House of Assembly (JAKUSKO)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5763d44d0b875cdb', 'ind_5763d44d0b875cdb', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5763d44d0b875cdb', 'ind_5763d44d0b875cdb', 'org_political_party_adp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5763d44d0b875cdb', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|jakusko|2023',
  'insert', 'ind_5763d44d0b875cdb',
  'Unique: Yobe Jakusko seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5763d44d0b875cdb', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_5763d44d0b875cdb', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5763d44d0b875cdb', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_jakusko',
  'ind_5763d44d0b875cdb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5763d44d0b875cdb', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Jakusko', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5763d44d0b875cdb', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_5763d44d0b875cdb',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5763d44d0b875cdb', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_5763d44d0b875cdb',
  'political_assignment', '{"constituency_inec": "JAKUSKO", "party_abbrev": "ADP", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5763d44d0b875cdb', 'prof_5763d44d0b875cdb',
  'Shuaibu Lawan',
  'shuaibu lawan yobe state assembly jakusko adp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Dala Dogo Adamu -- Karasuwa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3ccfa877f84a94ff', 'Dala Dogo Adamu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3ccfa877f84a94ff', 'ind_3ccfa877f84a94ff', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dala Dogo Adamu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3ccfa877f84a94ff', 'prof_3ccfa877f84a94ff',
  'Member, Yobe State House of Assembly (KARASUWA)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3ccfa877f84a94ff', 'ind_3ccfa877f84a94ff', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3ccfa877f84a94ff', 'ind_3ccfa877f84a94ff', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3ccfa877f84a94ff', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|karasuwa|2023',
  'insert', 'ind_3ccfa877f84a94ff',
  'Unique: Yobe Karasuwa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3ccfa877f84a94ff', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_3ccfa877f84a94ff', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3ccfa877f84a94ff', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_karasuwa',
  'ind_3ccfa877f84a94ff', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3ccfa877f84a94ff', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Karasuwa', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3ccfa877f84a94ff', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_3ccfa877f84a94ff',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3ccfa877f84a94ff', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_3ccfa877f84a94ff',
  'political_assignment', '{"constituency_inec": "KARASUWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3ccfa877f84a94ff', 'prof_3ccfa877f84a94ff',
  'Dala Dogo Adamu',
  'dala dogo adamu yobe state assembly karasuwa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Maina Kachallah Ajiya -- Machina (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f5c865420006a4bc', 'Maina Kachallah Ajiya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f5c865420006a4bc', 'ind_f5c865420006a4bc', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Maina Kachallah Ajiya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f5c865420006a4bc', 'prof_f5c865420006a4bc',
  'Member, Yobe State House of Assembly (MACHINA)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f5c865420006a4bc', 'ind_f5c865420006a4bc', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f5c865420006a4bc', 'ind_f5c865420006a4bc', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f5c865420006a4bc', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|machina|2023',
  'insert', 'ind_f5c865420006a4bc',
  'Unique: Yobe Machina seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f5c865420006a4bc', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_f5c865420006a4bc', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f5c865420006a4bc', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_machina',
  'ind_f5c865420006a4bc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f5c865420006a4bc', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Machina', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f5c865420006a4bc', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_f5c865420006a4bc',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f5c865420006a4bc', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_f5c865420006a4bc',
  'political_assignment', '{"constituency_inec": "MACHINA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f5c865420006a4bc', 'prof_f5c865420006a4bc',
  'Maina Kachallah Ajiya',
  'maina kachallah ajiya yobe state assembly machina apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Lawan Musa Saminu -- Nangere (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_35dc7127515e0338', 'Lawan Musa Saminu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_35dc7127515e0338', 'ind_35dc7127515e0338', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lawan Musa Saminu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_35dc7127515e0338', 'prof_35dc7127515e0338',
  'Member, Yobe State House of Assembly (NANGERE)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_35dc7127515e0338', 'ind_35dc7127515e0338', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_35dc7127515e0338', 'ind_35dc7127515e0338', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_35dc7127515e0338', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|nangere|2023',
  'insert', 'ind_35dc7127515e0338',
  'Unique: Yobe Nangere seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_35dc7127515e0338', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_35dc7127515e0338', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_35dc7127515e0338', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_nangere',
  'ind_35dc7127515e0338', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_35dc7127515e0338', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Nangere', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_35dc7127515e0338', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_35dc7127515e0338',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_35dc7127515e0338', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_35dc7127515e0338',
  'political_assignment', '{"constituency_inec": "NANGERE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_35dc7127515e0338', 'prof_35dc7127515e0338',
  'Lawan Musa Saminu',
  'lawan musa saminu yobe state assembly nangere apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Inuwa Lawan Sani -- Nguru I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_72fd2213412725dd', 'Inuwa Lawan Sani',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_72fd2213412725dd', 'ind_72fd2213412725dd', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Inuwa Lawan Sani', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_72fd2213412725dd', 'prof_72fd2213412725dd',
  'Member, Yobe State House of Assembly (NGURU I)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_72fd2213412725dd', 'ind_72fd2213412725dd', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_72fd2213412725dd', 'ind_72fd2213412725dd', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_72fd2213412725dd', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|nguru i|2023',
  'insert', 'ind_72fd2213412725dd',
  'Unique: Yobe Nguru I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_72fd2213412725dd', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_72fd2213412725dd', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_72fd2213412725dd', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_nguru_i',
  'ind_72fd2213412725dd', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_72fd2213412725dd', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Nguru I', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_72fd2213412725dd', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_72fd2213412725dd',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_72fd2213412725dd', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_72fd2213412725dd',
  'political_assignment', '{"constituency_inec": "NGURU I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_72fd2213412725dd', 'prof_72fd2213412725dd',
  'Inuwa Lawan Sani',
  'inuwa lawan sani yobe state assembly nguru i apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Ibrahim Buba -- Damaturu II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d521e4f2b598ee3d', 'Ibrahim Buba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d521e4f2b598ee3d', 'ind_d521e4f2b598ee3d', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Buba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d521e4f2b598ee3d', 'prof_d521e4f2b598ee3d',
  'Member, Yobe State House of Assembly (DAMATURU II)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d521e4f2b598ee3d', 'ind_d521e4f2b598ee3d', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d521e4f2b598ee3d', 'ind_d521e4f2b598ee3d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d521e4f2b598ee3d', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|damaturu ii|2023',
  'insert', 'ind_d521e4f2b598ee3d',
  'Unique: Yobe Damaturu II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d521e4f2b598ee3d', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_d521e4f2b598ee3d', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d521e4f2b598ee3d', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_damaturu_ii',
  'ind_d521e4f2b598ee3d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d521e4f2b598ee3d', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Damaturu II', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d521e4f2b598ee3d', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_d521e4f2b598ee3d',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d521e4f2b598ee3d', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_d521e4f2b598ee3d',
  'political_assignment', '{"constituency_inec": "DAMATURU II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d521e4f2b598ee3d', 'prof_d521e4f2b598ee3d',
  'Ibrahim Buba',
  'ibrahim buba yobe state assembly damaturu ii apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Lawan Mirwa Ahmed -- Nguru II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0510cdb024501584', 'Lawan Mirwa Ahmed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0510cdb024501584', 'ind_0510cdb024501584', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lawan Mirwa Ahmed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0510cdb024501584', 'prof_0510cdb024501584',
  'Member, Yobe State House of Assembly (NGURU II)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0510cdb024501584', 'ind_0510cdb024501584', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0510cdb024501584', 'ind_0510cdb024501584', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0510cdb024501584', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|nguru ii|2023',
  'insert', 'ind_0510cdb024501584',
  'Unique: Yobe Nguru II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0510cdb024501584', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_0510cdb024501584', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0510cdb024501584', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_nguru_ii',
  'ind_0510cdb024501584', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0510cdb024501584', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Nguru II', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0510cdb024501584', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_0510cdb024501584',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0510cdb024501584', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_0510cdb024501584',
  'political_assignment', '{"constituency_inec": "NGURU II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0510cdb024501584', 'prof_0510cdb024501584',
  'Lawan Mirwa Ahmed',
  'lawan mirwa ahmed yobe state assembly nguru ii apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Ahmed Saleh Jejeh -- Potiskum Town (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c2fb5140d652a707', 'Ahmed Saleh Jejeh',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c2fb5140d652a707', 'ind_c2fb5140d652a707', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ahmed Saleh Jejeh', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c2fb5140d652a707', 'prof_c2fb5140d652a707',
  'Member, Yobe State House of Assembly (POTISKUM TOWN)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c2fb5140d652a707', 'ind_c2fb5140d652a707', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c2fb5140d652a707', 'ind_c2fb5140d652a707', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c2fb5140d652a707', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|potiskum town|2023',
  'insert', 'ind_c2fb5140d652a707',
  'Unique: Yobe Potiskum Town seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c2fb5140d652a707', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_c2fb5140d652a707', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c2fb5140d652a707', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_potiskum_town',
  'ind_c2fb5140d652a707', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c2fb5140d652a707', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Potiskum Town', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c2fb5140d652a707', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_c2fb5140d652a707',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c2fb5140d652a707', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_c2fb5140d652a707',
  'political_assignment', '{"constituency_inec": "POTISKUM TOWN", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c2fb5140d652a707', 'prof_c2fb5140d652a707',
  'Ahmed Saleh Jejeh',
  'ahmed saleh jejeh yobe state assembly potiskum town apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Isah Muhammad Bello -- Mamudo (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_02500d8471b5f8a6', 'Isah Muhammad Bello',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_02500d8471b5f8a6', 'ind_02500d8471b5f8a6', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Isah Muhammad Bello', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_02500d8471b5f8a6', 'prof_02500d8471b5f8a6',
  'Member, Yobe State House of Assembly (MAMUDO)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_02500d8471b5f8a6', 'ind_02500d8471b5f8a6', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_02500d8471b5f8a6', 'ind_02500d8471b5f8a6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_02500d8471b5f8a6', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|mamudo|2023',
  'insert', 'ind_02500d8471b5f8a6',
  'Unique: Yobe Mamudo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_02500d8471b5f8a6', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_02500d8471b5f8a6', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_02500d8471b5f8a6', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_mamudo',
  'ind_02500d8471b5f8a6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_02500d8471b5f8a6', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Mamudo', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_02500d8471b5f8a6', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_02500d8471b5f8a6',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_02500d8471b5f8a6', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_02500d8471b5f8a6',
  'political_assignment', '{"constituency_inec": "MAMUDO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_02500d8471b5f8a6', 'prof_02500d8471b5f8a6',
  'Isah Muhammad Bello',
  'isah muhammad bello yobe state assembly mamudo apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Maina Buba Saleh -- Tarmuwa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_84566d012d515fe4', 'Maina Buba Saleh',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_84566d012d515fe4', 'ind_84566d012d515fe4', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Maina Buba Saleh', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_84566d012d515fe4', 'prof_84566d012d515fe4',
  'Member, Yobe State House of Assembly (TARMUWA)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_84566d012d515fe4', 'ind_84566d012d515fe4', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_84566d012d515fe4', 'ind_84566d012d515fe4', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_84566d012d515fe4', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|tarmuwa|2023',
  'insert', 'ind_84566d012d515fe4',
  'Unique: Yobe Tarmuwa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_84566d012d515fe4', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_84566d012d515fe4', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_84566d012d515fe4', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_tarmuwa',
  'ind_84566d012d515fe4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_84566d012d515fe4', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Tarmuwa', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_84566d012d515fe4', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_84566d012d515fe4',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_84566d012d515fe4', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_84566d012d515fe4',
  'political_assignment', '{"constituency_inec": "TARMUWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_84566d012d515fe4', 'prof_84566d012d515fe4',
  'Maina Buba Saleh',
  'maina buba saleh yobe state assembly tarmuwa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Musa Ahmed Dumbol -- Yunufari (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_499613a8cc377dff', 'Musa Ahmed Dumbol',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_499613a8cc377dff', 'ind_499613a8cc377dff', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Musa Ahmed Dumbol', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_499613a8cc377dff', 'prof_499613a8cc377dff',
  'Member, Yobe State House of Assembly (YUNUFARI)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_499613a8cc377dff', 'ind_499613a8cc377dff', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_499613a8cc377dff', 'ind_499613a8cc377dff', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_499613a8cc377dff', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|yunufari|2023',
  'insert', 'ind_499613a8cc377dff',
  'Unique: Yobe Yunufari seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_499613a8cc377dff', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_499613a8cc377dff', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_499613a8cc377dff', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_yunufari',
  'ind_499613a8cc377dff', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_499613a8cc377dff', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Yunufari', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_499613a8cc377dff', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_499613a8cc377dff',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_499613a8cc377dff', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_499613a8cc377dff',
  'political_assignment', '{"constituency_inec": "YUNUFARI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_499613a8cc377dff', 'prof_499613a8cc377dff',
  'Musa Ahmed Dumbol',
  'musa ahmed dumbol yobe state assembly yunufari apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Abdullahi Abakar Aisha -- Karasuwa (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e9c9992bbe48da51', 'Abdullahi Abakar Aisha',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e9c9992bbe48da51', 'ind_e9c9992bbe48da51', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Abakar Aisha', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e9c9992bbe48da51', 'prof_e9c9992bbe48da51',
  'Member, Yobe State House of Assembly (KARASUWA)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e9c9992bbe48da51', 'ind_e9c9992bbe48da51', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e9c9992bbe48da51', 'ind_e9c9992bbe48da51', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e9c9992bbe48da51', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|karasuwa|2023',
  'insert', 'ind_e9c9992bbe48da51',
  'Unique: Yobe Karasuwa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e9c9992bbe48da51', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_e9c9992bbe48da51', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e9c9992bbe48da51', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_karasuwa',
  'ind_e9c9992bbe48da51', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e9c9992bbe48da51', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Karasuwa', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e9c9992bbe48da51', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_e9c9992bbe48da51',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e9c9992bbe48da51', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_e9c9992bbe48da51',
  'political_assignment', '{"constituency_inec": "KARASUWA", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e9c9992bbe48da51', 'prof_e9c9992bbe48da51',
  'Abdullahi Abakar Aisha',
  'abdullahi abakar aisha yobe state assembly karasuwa adc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Mohammed Shuaibu -- Machina (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_55f3c5ba61c1fed2', 'Mohammed Shuaibu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_55f3c5ba61c1fed2', 'ind_55f3c5ba61c1fed2', 'individual', 'place_state_yobe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Shuaibu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_55f3c5ba61c1fed2', 'prof_55f3c5ba61c1fed2',
  'Member, Yobe State House of Assembly (MACHINA)',
  'place_state_yobe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_55f3c5ba61c1fed2', 'ind_55f3c5ba61c1fed2', 'term_ng_yobe_state_assembly_10th_2023_2027',
  'place_state_yobe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_55f3c5ba61c1fed2', 'ind_55f3c5ba61c1fed2', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_55f3c5ba61c1fed2', 'seed_run_s05_political_yobe_roster_20260502', 'individual',
  'ng_state_assembly_member|yobe|machina|2023',
  'insert', 'ind_55f3c5ba61c1fed2',
  'Unique: Yobe Machina seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_55f3c5ba61c1fed2', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_55f3c5ba61c1fed2', 'seed_source_nigerianleaders_yobe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_55f3c5ba61c1fed2', 'seed_run_s05_political_yobe_roster_20260502', 'seed_source_nigerianleaders_yobe_assembly_20260502',
  'nl_yobe_assembly_2023_machina',
  'ind_55f3c5ba61c1fed2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_55f3c5ba61c1fed2', 'seed_run_s05_political_yobe_roster_20260502',
  'Yobe Machina', 'place_state_yobe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_55f3c5ba61c1fed2', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_55f3c5ba61c1fed2',
  'seed_source_nigerianleaders_yobe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_55f3c5ba61c1fed2', 'seed_run_s05_political_yobe_roster_20260502', 'individual', 'ind_55f3c5ba61c1fed2',
  'political_assignment', '{"constituency_inec": "MACHINA", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/yobe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_55f3c5ba61c1fed2', 'prof_55f3c5ba61c1fed2',
  'Mohammed Shuaibu',
  'mohammed shuaibu yobe state assembly machina adc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_yobe',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
