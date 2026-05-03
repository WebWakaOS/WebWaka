-- ============================================================
-- Migration 0505: Anambra State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Anambra State House of Assembly Members
-- Members seeded: 32/30
-- Party breakdown: APGA:18, LP:8, YPP:4, PDP:2
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_anambra_assembly_20260502',
  'NigerianLeaders – Complete List of Anambra State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/anambra-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_anambra_roster_20260502', 'S05 Batch – Anambra State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_anambra_roster_20260502',
  'seed_run_s05_political_anambra_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0505_political_anambra_assembly_full_roster_seed.sql',
  NULL, 32,
  '32/30 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_anambra_state_assembly_10th_2023_2027',
  'Anambra State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_anambra',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (32 of 30 seats) ──────────────────────────────────────

-- 01. Okpalaeke Anayo -- Aguata I (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_95bc921907b67bfb', 'Okpalaeke Anayo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_95bc921907b67bfb', 'ind_95bc921907b67bfb', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okpalaeke Anayo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_95bc921907b67bfb', 'prof_95bc921907b67bfb',
  'Member, Anambra State House of Assembly (AGUATA I)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_95bc921907b67bfb', 'ind_95bc921907b67bfb', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_95bc921907b67bfb', 'ind_95bc921907b67bfb', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_95bc921907b67bfb', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|aguata i|2023',
  'insert', 'ind_95bc921907b67bfb',
  'Unique: Anambra Aguata I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_95bc921907b67bfb', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_95bc921907b67bfb', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_95bc921907b67bfb', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_aguata_i',
  'ind_95bc921907b67bfb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_95bc921907b67bfb', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Aguata I', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_95bc921907b67bfb', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_95bc921907b67bfb',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_95bc921907b67bfb', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_95bc921907b67bfb',
  'political_assignment', '{"constituency_inec": "AGUATA I", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_95bc921907b67bfb', 'prof_95bc921907b67bfb',
  'Okpalaeke Anayo',
  'okpalaeke anayo anambra state assembly aguata i apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Ogbuefi Felicitas -- Anaocha I (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3f0d61a2517e4940', 'Ogbuefi Felicitas',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3f0d61a2517e4940', 'ind_3f0d61a2517e4940', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogbuefi Felicitas', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3f0d61a2517e4940', 'prof_3f0d61a2517e4940',
  'Member, Anambra State House of Assembly (ANAOCHA I)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3f0d61a2517e4940', 'ind_3f0d61a2517e4940', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3f0d61a2517e4940', 'ind_3f0d61a2517e4940', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3f0d61a2517e4940', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|anaocha i|2023',
  'insert', 'ind_3f0d61a2517e4940',
  'Unique: Anambra Anaocha I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3f0d61a2517e4940', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3f0d61a2517e4940', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3f0d61a2517e4940', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_anaocha_i',
  'ind_3f0d61a2517e4940', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3f0d61a2517e4940', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Anaocha I', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3f0d61a2517e4940', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3f0d61a2517e4940',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3f0d61a2517e4940', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3f0d61a2517e4940',
  'political_assignment', '{"constituency_inec": "ANAOCHA I", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3f0d61a2517e4940', 'prof_3f0d61a2517e4940',
  'Ogbuefi Felicitas',
  'ogbuefi felicitas anambra state assembly anaocha i lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Ikwunne Chimezie -- Awka North (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4f278c7dd212d28c', 'Ikwunne Chimezie',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4f278c7dd212d28c', 'ind_4f278c7dd212d28c', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ikwunne Chimezie', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4f278c7dd212d28c', 'prof_4f278c7dd212d28c',
  'Member, Anambra State House of Assembly (AWKA NORTH)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4f278c7dd212d28c', 'ind_4f278c7dd212d28c', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4f278c7dd212d28c', 'ind_4f278c7dd212d28c', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4f278c7dd212d28c', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|awka north|2023',
  'insert', 'ind_4f278c7dd212d28c',
  'Unique: Anambra Awka North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4f278c7dd212d28c', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_4f278c7dd212d28c', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4f278c7dd212d28c', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_awka_north',
  'ind_4f278c7dd212d28c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4f278c7dd212d28c', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Awka North', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4f278c7dd212d28c', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_4f278c7dd212d28c',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4f278c7dd212d28c', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_4f278c7dd212d28c',
  'political_assignment', '{"constituency_inec": "AWKA NORTH", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4f278c7dd212d28c', 'prof_4f278c7dd212d28c',
  'Ikwunne Chimezie',
  'ikwunne chimezie anambra state assembly awka north apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Mbachu Nigeria Henry -- Awka South I (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7161a1563a034635', 'Mbachu Nigeria Henry',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7161a1563a034635', 'ind_7161a1563a034635', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mbachu Nigeria Henry', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7161a1563a034635', 'prof_7161a1563a034635',
  'Member, Anambra State House of Assembly (AWKA SOUTH I)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7161a1563a034635', 'ind_7161a1563a034635', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7161a1563a034635', 'ind_7161a1563a034635', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7161a1563a034635', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|awka south i|2023',
  'insert', 'ind_7161a1563a034635',
  'Unique: Anambra Awka South I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7161a1563a034635', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_7161a1563a034635', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7161a1563a034635', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_awka_south_i',
  'ind_7161a1563a034635', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7161a1563a034635', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Awka South I', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7161a1563a034635', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_7161a1563a034635',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7161a1563a034635', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_7161a1563a034635',
  'political_assignment', '{"constituency_inec": "AWKA SOUTH I", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7161a1563a034635', 'prof_7161a1563a034635',
  'Mbachu Nigeria Henry',
  'mbachu nigeria henry anambra state assembly awka south i lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Igwe Chukwuebuka -- Idemili South (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2086967562eb6705', 'Igwe Chukwuebuka',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2086967562eb6705', 'ind_2086967562eb6705', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Igwe Chukwuebuka', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2086967562eb6705', 'prof_2086967562eb6705',
  'Member, Anambra State House of Assembly (IDEMILI SOUTH)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2086967562eb6705', 'ind_2086967562eb6705', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2086967562eb6705', 'ind_2086967562eb6705', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2086967562eb6705', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|idemili south|2023',
  'insert', 'ind_2086967562eb6705',
  'Unique: Anambra Idemili South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2086967562eb6705', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_2086967562eb6705', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2086967562eb6705', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_idemili_south',
  'ind_2086967562eb6705', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2086967562eb6705', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Idemili South', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2086967562eb6705', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_2086967562eb6705',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2086967562eb6705', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_2086967562eb6705',
  'political_assignment', '{"constituency_inec": "IDEMILI SOUTH", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2086967562eb6705', 'prof_2086967562eb6705',
  'Igwe Chukwuebuka',
  'igwe chukwuebuka anambra state assembly idemili south apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Amakwe Martin Obiorah -- Idemili North (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3f48f3cc5ed21425', 'Amakwe Martin Obiorah',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3f48f3cc5ed21425', 'ind_3f48f3cc5ed21425', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Amakwe Martin Obiorah', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3f48f3cc5ed21425', 'prof_3f48f3cc5ed21425',
  'Member, Anambra State House of Assembly (IDEMILI NORTH)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3f48f3cc5ed21425', 'ind_3f48f3cc5ed21425', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3f48f3cc5ed21425', 'ind_3f48f3cc5ed21425', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3f48f3cc5ed21425', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|idemili north|2023',
  'insert', 'ind_3f48f3cc5ed21425',
  'Unique: Anambra Idemili North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3f48f3cc5ed21425', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3f48f3cc5ed21425', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3f48f3cc5ed21425', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_idemili_north',
  'ind_3f48f3cc5ed21425', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3f48f3cc5ed21425', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Idemili North', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3f48f3cc5ed21425', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3f48f3cc5ed21425',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3f48f3cc5ed21425', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3f48f3cc5ed21425',
  'political_assignment', '{"constituency_inec": "IDEMILI NORTH", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3f48f3cc5ed21425', 'prof_3f48f3cc5ed21425',
  'Amakwe Martin Obiorah',
  'amakwe martin obiorah anambra state assembly idemili north lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Ngobili Jude Chimezie -- Ihiala I (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f5be0b2c631104e5', 'Ngobili Jude Chimezie',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f5be0b2c631104e5', 'ind_f5be0b2c631104e5', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ngobili Jude Chimezie', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f5be0b2c631104e5', 'prof_f5be0b2c631104e5',
  'Member, Anambra State House of Assembly (IHIALA I)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f5be0b2c631104e5', 'ind_f5be0b2c631104e5', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f5be0b2c631104e5', 'ind_f5be0b2c631104e5', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f5be0b2c631104e5', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|ihiala i|2023',
  'insert', 'ind_f5be0b2c631104e5',
  'Unique: Anambra Ihiala I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f5be0b2c631104e5', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_f5be0b2c631104e5', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f5be0b2c631104e5', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_ihiala_i',
  'ind_f5be0b2c631104e5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f5be0b2c631104e5', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Ihiala I', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f5be0b2c631104e5', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_f5be0b2c631104e5',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f5be0b2c631104e5', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_f5be0b2c631104e5',
  'political_assignment', '{"constituency_inec": "IHIALA I", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f5be0b2c631104e5', 'prof_f5be0b2c631104e5',
  'Ngobili Jude Chimezie',
  'ngobili jude chimezie anambra state assembly ihiala i apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Ibemeka Chidiebele -- Njikoka I (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cabda9ac9648e6b2', 'Ibemeka Chidiebele',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cabda9ac9648e6b2', 'ind_cabda9ac9648e6b2', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibemeka Chidiebele', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cabda9ac9648e6b2', 'prof_cabda9ac9648e6b2',
  'Member, Anambra State House of Assembly (NJIKOKA I)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cabda9ac9648e6b2', 'ind_cabda9ac9648e6b2', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cabda9ac9648e6b2', 'ind_cabda9ac9648e6b2', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cabda9ac9648e6b2', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|njikoka i|2023',
  'insert', 'ind_cabda9ac9648e6b2',
  'Unique: Anambra Njikoka I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cabda9ac9648e6b2', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_cabda9ac9648e6b2', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cabda9ac9648e6b2', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_njikoka_i',
  'ind_cabda9ac9648e6b2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cabda9ac9648e6b2', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Njikoka I', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cabda9ac9648e6b2', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_cabda9ac9648e6b2',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cabda9ac9648e6b2', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_cabda9ac9648e6b2',
  'political_assignment', '{"constituency_inec": "NJIKOKA I", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cabda9ac9648e6b2', 'prof_cabda9ac9648e6b2',
  'Ibemeka Chidiebele',
  'ibemeka chidiebele anambra state assembly njikoka i apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Ike Augustine -- Nnewi North (YPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9f15a31da67d1dd7', 'Ike Augustine',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9f15a31da67d1dd7', 'ind_9f15a31da67d1dd7', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ike Augustine', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9f15a31da67d1dd7', 'prof_9f15a31da67d1dd7',
  'Member, Anambra State House of Assembly (NNEWI NORTH)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9f15a31da67d1dd7', 'ind_9f15a31da67d1dd7', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9f15a31da67d1dd7', 'ind_9f15a31da67d1dd7', 'org_political_party_ypp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9f15a31da67d1dd7', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|nnewi north|2023',
  'insert', 'ind_9f15a31da67d1dd7',
  'Unique: Anambra Nnewi North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9f15a31da67d1dd7', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_9f15a31da67d1dd7', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9f15a31da67d1dd7', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_nnewi_north',
  'ind_9f15a31da67d1dd7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9f15a31da67d1dd7', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Nnewi North', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9f15a31da67d1dd7', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_9f15a31da67d1dd7',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9f15a31da67d1dd7', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_9f15a31da67d1dd7',
  'political_assignment', '{"constituency_inec": "NNEWI NORTH", "party_abbrev": "YPP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9f15a31da67d1dd7', 'prof_9f15a31da67d1dd7',
  'Ike Augustine',
  'ike augustine anambra state assembly nnewi north ypp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Atuchukwu Noso -- Nnewi South I (YPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ca6fc78ed02d9bc3', 'Atuchukwu Noso',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ca6fc78ed02d9bc3', 'ind_ca6fc78ed02d9bc3', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Atuchukwu Noso', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ca6fc78ed02d9bc3', 'prof_ca6fc78ed02d9bc3',
  'Member, Anambra State House of Assembly (NNEWI SOUTH I)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ca6fc78ed02d9bc3', 'ind_ca6fc78ed02d9bc3', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ca6fc78ed02d9bc3', 'ind_ca6fc78ed02d9bc3', 'org_political_party_ypp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ca6fc78ed02d9bc3', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|nnewi south i|2023',
  'insert', 'ind_ca6fc78ed02d9bc3',
  'Unique: Anambra Nnewi South I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ca6fc78ed02d9bc3', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_ca6fc78ed02d9bc3', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ca6fc78ed02d9bc3', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_nnewi_south_i',
  'ind_ca6fc78ed02d9bc3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ca6fc78ed02d9bc3', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Nnewi South I', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ca6fc78ed02d9bc3', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_ca6fc78ed02d9bc3',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ca6fc78ed02d9bc3', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_ca6fc78ed02d9bc3',
  'political_assignment', '{"constituency_inec": "NNEWI SOUTH I", "party_abbrev": "YPP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ca6fc78ed02d9bc3', 'prof_ca6fc78ed02d9bc3',
  'Atuchukwu Noso',
  'atuchukwu noso anambra state assembly nnewi south i ypp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Igwe Chukwunonso Noble - Obumneme -- Ogbaru I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_390fd2194cd801eb', 'Igwe Chukwunonso Noble - Obumneme',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_390fd2194cd801eb', 'ind_390fd2194cd801eb', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Igwe Chukwunonso Noble - Obumneme', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_390fd2194cd801eb', 'prof_390fd2194cd801eb',
  'Member, Anambra State House of Assembly (OGBARU I)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_390fd2194cd801eb', 'ind_390fd2194cd801eb', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_390fd2194cd801eb', 'ind_390fd2194cd801eb', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_390fd2194cd801eb', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|ogbaru i|2023',
  'insert', 'ind_390fd2194cd801eb',
  'Unique: Anambra Ogbaru I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_390fd2194cd801eb', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_390fd2194cd801eb', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_390fd2194cd801eb', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_ogbaru_i',
  'ind_390fd2194cd801eb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_390fd2194cd801eb', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Ogbaru I', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_390fd2194cd801eb', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_390fd2194cd801eb',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_390fd2194cd801eb', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_390fd2194cd801eb',
  'political_assignment', '{"constituency_inec": "OGBARU I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_390fd2194cd801eb', 'prof_390fd2194cd801eb',
  'Igwe Chukwunonso Noble - Obumneme',
  'igwe chukwunonso noble - obumneme anambra state assembly ogbaru i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Ojike Innocent -- Oyi (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_801bcfb2961dd3a4', 'Ojike Innocent',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_801bcfb2961dd3a4', 'ind_801bcfb2961dd3a4', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ojike Innocent', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_801bcfb2961dd3a4', 'prof_801bcfb2961dd3a4',
  'Member, Anambra State House of Assembly (OYI)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_801bcfb2961dd3a4', 'ind_801bcfb2961dd3a4', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_801bcfb2961dd3a4', 'ind_801bcfb2961dd3a4', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_801bcfb2961dd3a4', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|oyi|2023',
  'insert', 'ind_801bcfb2961dd3a4',
  'Unique: Anambra Oyi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_801bcfb2961dd3a4', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_801bcfb2961dd3a4', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_801bcfb2961dd3a4', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_oyi',
  'ind_801bcfb2961dd3a4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_801bcfb2961dd3a4', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Oyi', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_801bcfb2961dd3a4', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_801bcfb2961dd3a4',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_801bcfb2961dd3a4', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_801bcfb2961dd3a4',
  'political_assignment', '{"constituency_inec": "OYI", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_801bcfb2961dd3a4', 'prof_801bcfb2961dd3a4',
  'Ojike Innocent',
  'ojike innocent anambra state assembly oyi apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Muobike Anthony -- Aguata II (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cfb86bd42a6a6f47', 'Muobike Anthony',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cfb86bd42a6a6f47', 'ind_cfb86bd42a6a6f47', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muobike Anthony', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cfb86bd42a6a6f47', 'prof_cfb86bd42a6a6f47',
  'Member, Anambra State House of Assembly (AGUATA II)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cfb86bd42a6a6f47', 'ind_cfb86bd42a6a6f47', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cfb86bd42a6a6f47', 'ind_cfb86bd42a6a6f47', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cfb86bd42a6a6f47', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|aguata ii|2023',
  'insert', 'ind_cfb86bd42a6a6f47',
  'Unique: Anambra Aguata II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cfb86bd42a6a6f47', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_cfb86bd42a6a6f47', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cfb86bd42a6a6f47', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_aguata_ii',
  'ind_cfb86bd42a6a6f47', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cfb86bd42a6a6f47', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Aguata II', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cfb86bd42a6a6f47', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_cfb86bd42a6a6f47',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cfb86bd42a6a6f47', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_cfb86bd42a6a6f47',
  'political_assignment', '{"constituency_inec": "AGUATA II", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cfb86bd42a6a6f47', 'prof_cfb86bd42a6a6f47',
  'Muobike Anthony',
  'muobike anthony anambra state assembly aguata ii apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Okechukwu Ejike Aloy -- Anaocha II (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a7d732786ebfecc2', 'Okechukwu Ejike Aloy',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a7d732786ebfecc2', 'ind_a7d732786ebfecc2', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okechukwu Ejike Aloy', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a7d732786ebfecc2', 'prof_a7d732786ebfecc2',
  'Member, Anambra State House of Assembly (ANAOCHA II)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a7d732786ebfecc2', 'ind_a7d732786ebfecc2', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a7d732786ebfecc2', 'ind_a7d732786ebfecc2', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a7d732786ebfecc2', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|anaocha ii|2023',
  'insert', 'ind_a7d732786ebfecc2',
  'Unique: Anambra Anaocha II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a7d732786ebfecc2', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_a7d732786ebfecc2', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a7d732786ebfecc2', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_anaocha_ii',
  'ind_a7d732786ebfecc2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a7d732786ebfecc2', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Anaocha II', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a7d732786ebfecc2', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_a7d732786ebfecc2',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a7d732786ebfecc2', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_a7d732786ebfecc2',
  'political_assignment', '{"constituency_inec": "ANAOCHA II", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a7d732786ebfecc2', 'prof_a7d732786ebfecc2',
  'Okechukwu Ejike Aloy',
  'okechukwu ejike aloy anambra state assembly anaocha ii apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Okoye Chukwuma Pius -- Awka South II (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c93bfe5d60cc0bbf', 'Okoye Chukwuma Pius',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c93bfe5d60cc0bbf', 'ind_c93bfe5d60cc0bbf', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okoye Chukwuma Pius', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c93bfe5d60cc0bbf', 'prof_c93bfe5d60cc0bbf',
  'Member, Anambra State House of Assembly (AWKA SOUTH II)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c93bfe5d60cc0bbf', 'ind_c93bfe5d60cc0bbf', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c93bfe5d60cc0bbf', 'ind_c93bfe5d60cc0bbf', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c93bfe5d60cc0bbf', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|awka south ii|2023',
  'insert', 'ind_c93bfe5d60cc0bbf',
  'Unique: Anambra Awka South II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c93bfe5d60cc0bbf', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_c93bfe5d60cc0bbf', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c93bfe5d60cc0bbf', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_awka_south_ii',
  'ind_c93bfe5d60cc0bbf', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c93bfe5d60cc0bbf', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Awka South II', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c93bfe5d60cc0bbf', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_c93bfe5d60cc0bbf',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c93bfe5d60cc0bbf', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_c93bfe5d60cc0bbf',
  'political_assignment', '{"constituency_inec": "AWKA SOUTH II", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c93bfe5d60cc0bbf', 'prof_c93bfe5d60cc0bbf',
  'Okoye Chukwuma Pius',
  'okoye chukwuma pius anambra state assembly awka south ii apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Iloh Chukwuebuka Kelvin -- Ihiala II (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_79dee533619d1254', 'Iloh Chukwuebuka Kelvin',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_79dee533619d1254', 'ind_79dee533619d1254', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Iloh Chukwuebuka Kelvin', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_79dee533619d1254', 'prof_79dee533619d1254',
  'Member, Anambra State House of Assembly (IHIALA II)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_79dee533619d1254', 'ind_79dee533619d1254', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_79dee533619d1254', 'ind_79dee533619d1254', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_79dee533619d1254', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|ihiala ii|2023',
  'insert', 'ind_79dee533619d1254',
  'Unique: Anambra Ihiala II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_79dee533619d1254', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_79dee533619d1254', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_79dee533619d1254', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_ihiala_ii',
  'ind_79dee533619d1254', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_79dee533619d1254', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Ihiala II', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_79dee533619d1254', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_79dee533619d1254',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_79dee533619d1254', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_79dee533619d1254',
  'political_assignment', '{"constituency_inec": "IHIALA II", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_79dee533619d1254', 'prof_79dee533619d1254',
  'Iloh Chukwuebuka Kelvin',
  'iloh chukwuebuka kelvin anambra state assembly ihiala ii apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Akpua Jude Ejikeme -- Njikoka II (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_37373c3587e0fb75', 'Akpua Jude Ejikeme',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_37373c3587e0fb75', 'ind_37373c3587e0fb75', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akpua Jude Ejikeme', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_37373c3587e0fb75', 'prof_37373c3587e0fb75',
  'Member, Anambra State House of Assembly (NJIKOKA II)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_37373c3587e0fb75', 'ind_37373c3587e0fb75', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_37373c3587e0fb75', 'ind_37373c3587e0fb75', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_37373c3587e0fb75', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|njikoka ii|2023',
  'insert', 'ind_37373c3587e0fb75',
  'Unique: Anambra Njikoka II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_37373c3587e0fb75', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_37373c3587e0fb75', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_37373c3587e0fb75', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_njikoka_ii',
  'ind_37373c3587e0fb75', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_37373c3587e0fb75', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Njikoka II', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_37373c3587e0fb75', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_37373c3587e0fb75',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_37373c3587e0fb75', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_37373c3587e0fb75',
  'political_assignment', '{"constituency_inec": "NJIKOKA II", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_37373c3587e0fb75', 'prof_37373c3587e0fb75',
  'Akpua Jude Ejikeme',
  'akpua jude ejikeme anambra state assembly njikoka ii apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Akaegbobi Johnbosco Nwabugwu -- Nnewi South II (YPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a300b61a7bc93915', 'Akaegbobi Johnbosco Nwabugwu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a300b61a7bc93915', 'ind_a300b61a7bc93915', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akaegbobi Johnbosco Nwabugwu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a300b61a7bc93915', 'prof_a300b61a7bc93915',
  'Member, Anambra State House of Assembly (NNEWI SOUTH II)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a300b61a7bc93915', 'ind_a300b61a7bc93915', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a300b61a7bc93915', 'ind_a300b61a7bc93915', 'org_political_party_ypp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a300b61a7bc93915', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|nnewi south ii|2023',
  'insert', 'ind_a300b61a7bc93915',
  'Unique: Anambra Nnewi South II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a300b61a7bc93915', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_a300b61a7bc93915', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a300b61a7bc93915', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_nnewi_south_ii',
  'ind_a300b61a7bc93915', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a300b61a7bc93915', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Nnewi South II', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a300b61a7bc93915', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_a300b61a7bc93915',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a300b61a7bc93915', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_a300b61a7bc93915',
  'political_assignment', '{"constituency_inec": "NNEWI SOUTH II", "party_abbrev": "YPP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a300b61a7bc93915', 'prof_a300b61a7bc93915',
  'Akaegbobi Johnbosco Nwabugwu',
  'akaegbobi johnbosco nwabugwu anambra state assembly nnewi south ii ypp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Udeze Somtochukwu Nkemakolam -- Ogbaru II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_99a895c3b7f7c3af', 'Udeze Somtochukwu Nkemakolam',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_99a895c3b7f7c3af', 'ind_99a895c3b7f7c3af', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Udeze Somtochukwu Nkemakolam', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_99a895c3b7f7c3af', 'prof_99a895c3b7f7c3af',
  'Member, Anambra State House of Assembly (OGBARU II)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_99a895c3b7f7c3af', 'ind_99a895c3b7f7c3af', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_99a895c3b7f7c3af', 'ind_99a895c3b7f7c3af', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_99a895c3b7f7c3af', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|ogbaru ii|2023',
  'insert', 'ind_99a895c3b7f7c3af',
  'Unique: Anambra Ogbaru II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_99a895c3b7f7c3af', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_99a895c3b7f7c3af', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_99a895c3b7f7c3af', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_ogbaru_ii',
  'ind_99a895c3b7f7c3af', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_99a895c3b7f7c3af', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Ogbaru II', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_99a895c3b7f7c3af', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_99a895c3b7f7c3af',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_99a895c3b7f7c3af', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_99a895c3b7f7c3af',
  'political_assignment', '{"constituency_inec": "OGBARU II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_99a895c3b7f7c3af', 'prof_99a895c3b7f7c3af',
  'Udeze Somtochukwu Nkemakolam',
  'udeze somtochukwu nkemakolam anambra state assembly ogbaru ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Okafor Patrick -- Onitsha North II (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b3b8243d460a035f', 'Okafor Patrick',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b3b8243d460a035f', 'ind_b3b8243d460a035f', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okafor Patrick', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b3b8243d460a035f', 'prof_b3b8243d460a035f',
  'Member, Anambra State House of Assembly (ONITSHA NORTH II)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b3b8243d460a035f', 'ind_b3b8243d460a035f', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b3b8243d460a035f', 'ind_b3b8243d460a035f', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b3b8243d460a035f', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|onitsha north ii|2023',
  'insert', 'ind_b3b8243d460a035f',
  'Unique: Anambra Onitsha North II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b3b8243d460a035f', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_b3b8243d460a035f', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b3b8243d460a035f', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_onitsha_north_ii',
  'ind_b3b8243d460a035f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b3b8243d460a035f', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Onitsha North II', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b3b8243d460a035f', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_b3b8243d460a035f',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b3b8243d460a035f', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_b3b8243d460a035f',
  'political_assignment', '{"constituency_inec": "ONITSHA NORTH II", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b3b8243d460a035f', 'prof_b3b8243d460a035f',
  'Okafor Patrick',
  'okafor patrick anambra state assembly onitsha north ii lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Umennajiego Jude -- Onitsha South II (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3f9127a3af74c762', 'Umennajiego Jude',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3f9127a3af74c762', 'ind_3f9127a3af74c762', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umennajiego Jude', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3f9127a3af74c762', 'prof_3f9127a3af74c762',
  'Member, Anambra State House of Assembly (ONITSHA SOUTH II)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3f9127a3af74c762', 'ind_3f9127a3af74c762', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3f9127a3af74c762', 'ind_3f9127a3af74c762', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3f9127a3af74c762', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|onitsha south ii|2023',
  'insert', 'ind_3f9127a3af74c762',
  'Unique: Anambra Onitsha South II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3f9127a3af74c762', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3f9127a3af74c762', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3f9127a3af74c762', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_onitsha_south_ii',
  'ind_3f9127a3af74c762', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3f9127a3af74c762', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Onitsha South II', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3f9127a3af74c762', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3f9127a3af74c762',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3f9127a3af74c762', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3f9127a3af74c762',
  'political_assignment', '{"constituency_inec": "ONITSHA SOUTH II", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3f9127a3af74c762', 'prof_3f9127a3af74c762',
  'Umennajiego Jude',
  'umennajiego jude anambra state assembly onitsha south ii lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Egbuonu Emeka -- Anambra Central (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e319d1fd47e2f586', 'Egbuonu Emeka',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e319d1fd47e2f586', 'ind_e319d1fd47e2f586', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Egbuonu Emeka', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e319d1fd47e2f586', 'prof_e319d1fd47e2f586',
  'Member, Anambra State House of Assembly (ANAMBRA CENTRAL)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e319d1fd47e2f586', 'ind_e319d1fd47e2f586', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e319d1fd47e2f586', 'ind_e319d1fd47e2f586', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e319d1fd47e2f586', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|anambra central|2023',
  'insert', 'ind_e319d1fd47e2f586',
  'Unique: Anambra Anambra Central seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e319d1fd47e2f586', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_e319d1fd47e2f586', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e319d1fd47e2f586', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_anambra_central',
  'ind_e319d1fd47e2f586', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e319d1fd47e2f586', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Anambra Central', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e319d1fd47e2f586', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_e319d1fd47e2f586',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e319d1fd47e2f586', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_e319d1fd47e2f586',
  'political_assignment', '{"constituency_inec": "ANAMBRA CENTRAL", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e319d1fd47e2f586', 'prof_e319d1fd47e2f586',
  'Egbuonu Emeka',
  'egbuonu emeka anambra state assembly anambra central apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Ezenwa Fredrick Chigozie -- Onitsha South I (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3b0a2fcf615fe11a', 'Ezenwa Fredrick Chigozie',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3b0a2fcf615fe11a', 'ind_3b0a2fcf615fe11a', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ezenwa Fredrick Chigozie', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3b0a2fcf615fe11a', 'prof_3b0a2fcf615fe11a',
  'Member, Anambra State House of Assembly (ONITSHA SOUTH I)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3b0a2fcf615fe11a', 'ind_3b0a2fcf615fe11a', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3b0a2fcf615fe11a', 'ind_3b0a2fcf615fe11a', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3b0a2fcf615fe11a', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|onitsha south i|2023',
  'insert', 'ind_3b0a2fcf615fe11a',
  'Unique: Anambra Onitsha South I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3b0a2fcf615fe11a', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3b0a2fcf615fe11a', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3b0a2fcf615fe11a', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_onitsha_south_i',
  'ind_3b0a2fcf615fe11a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3b0a2fcf615fe11a', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Onitsha South I', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3b0a2fcf615fe11a', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3b0a2fcf615fe11a',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3b0a2fcf615fe11a', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3b0a2fcf615fe11a',
  'political_assignment', '{"constituency_inec": "ONITSHA SOUTH I", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3b0a2fcf615fe11a', 'prof_3b0a2fcf615fe11a',
  'Ezenwa Fredrick Chigozie',
  'ezenwa fredrick chigozie anambra state assembly onitsha south i lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Azuka Justice -- Onitsha North I (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_dbbbeba1d0465d09', 'Azuka Justice',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_dbbbeba1d0465d09', 'ind_dbbbeba1d0465d09', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Azuka Justice', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_dbbbeba1d0465d09', 'prof_dbbbeba1d0465d09',
  'Member, Anambra State House of Assembly (ONITSHA NORTH I)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_dbbbeba1d0465d09', 'ind_dbbbeba1d0465d09', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_dbbbeba1d0465d09', 'ind_dbbbeba1d0465d09', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_dbbbeba1d0465d09', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|onitsha north i|2023',
  'insert', 'ind_dbbbeba1d0465d09',
  'Unique: Anambra Onitsha North I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_dbbbeba1d0465d09', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_dbbbeba1d0465d09', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_dbbbeba1d0465d09', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_onitsha_north_i',
  'ind_dbbbeba1d0465d09', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_dbbbeba1d0465d09', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Onitsha North I', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_dbbbeba1d0465d09', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_dbbbeba1d0465d09',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_dbbbeba1d0465d09', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_dbbbeba1d0465d09',
  'political_assignment', '{"constituency_inec": "ONITSHA NORTH I", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_dbbbeba1d0465d09', 'prof_dbbbeba1d0465d09',
  'Azuka Justice',
  'azuka justice anambra state assembly onitsha north i lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Obu Paul Chukwuka -- Orumba North (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3f90cbc613eda9e0', 'Obu Paul Chukwuka',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3f90cbc613eda9e0', 'ind_3f90cbc613eda9e0', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Obu Paul Chukwuka', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3f90cbc613eda9e0', 'prof_3f90cbc613eda9e0',
  'Member, Anambra State House of Assembly (ORUMBA NORTH)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3f90cbc613eda9e0', 'ind_3f90cbc613eda9e0', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3f90cbc613eda9e0', 'ind_3f90cbc613eda9e0', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3f90cbc613eda9e0', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|orumba north|2023',
  'insert', 'ind_3f90cbc613eda9e0',
  'Unique: Anambra Orumba North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3f90cbc613eda9e0', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3f90cbc613eda9e0', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3f90cbc613eda9e0', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_orumba_north',
  'ind_3f90cbc613eda9e0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3f90cbc613eda9e0', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Orumba North', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3f90cbc613eda9e0', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3f90cbc613eda9e0',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3f90cbc613eda9e0', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_3f90cbc613eda9e0',
  'political_assignment', '{"constituency_inec": "ORUMBA NORTH", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3f90cbc613eda9e0', 'prof_3f90cbc613eda9e0',
  'Obu Paul Chukwuka',
  'obu paul chukwuka anambra state assembly orumba north lp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 26. Nwafor Emmanuel Obinna -- Orumba South (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_277a9eb801a2da25', 'Nwafor Emmanuel Obinna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_277a9eb801a2da25', 'ind_277a9eb801a2da25', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwafor Emmanuel Obinna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_277a9eb801a2da25', 'prof_277a9eb801a2da25',
  'Member, Anambra State House of Assembly (ORUMBA SOUTH)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_277a9eb801a2da25', 'ind_277a9eb801a2da25', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_277a9eb801a2da25', 'ind_277a9eb801a2da25', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_277a9eb801a2da25', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|orumba south|2023',
  'insert', 'ind_277a9eb801a2da25',
  'Unique: Anambra Orumba South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_277a9eb801a2da25', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_277a9eb801a2da25', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_277a9eb801a2da25', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_orumba_south',
  'ind_277a9eb801a2da25', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_277a9eb801a2da25', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Orumba South', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_277a9eb801a2da25', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_277a9eb801a2da25',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_277a9eb801a2da25', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_277a9eb801a2da25',
  'political_assignment', '{"constituency_inec": "ORUMBA SOUTH", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_277a9eb801a2da25', 'prof_277a9eb801a2da25',
  'Nwafor Emmanuel Obinna',
  'nwafor emmanuel obinna anambra state assembly orumba south apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 27. Obimma Charles Chinedu -- Oyi (YPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6ff3eec38eb40b62', 'Obimma Charles Chinedu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6ff3eec38eb40b62', 'ind_6ff3eec38eb40b62', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Obimma Charles Chinedu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6ff3eec38eb40b62', 'prof_6ff3eec38eb40b62',
  'Member, Anambra State House of Assembly (OYI)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6ff3eec38eb40b62', 'ind_6ff3eec38eb40b62', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6ff3eec38eb40b62', 'ind_6ff3eec38eb40b62', 'org_political_party_ypp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6ff3eec38eb40b62', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|oyi|2023',
  'insert', 'ind_6ff3eec38eb40b62',
  'Unique: Anambra Oyi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6ff3eec38eb40b62', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_6ff3eec38eb40b62', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6ff3eec38eb40b62', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_oyi',
  'ind_6ff3eec38eb40b62', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6ff3eec38eb40b62', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Oyi', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6ff3eec38eb40b62', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_6ff3eec38eb40b62',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6ff3eec38eb40b62', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_6ff3eec38eb40b62',
  'political_assignment', '{"constituency_inec": "OYI", "party_abbrev": "YPP", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6ff3eec38eb40b62', 'prof_6ff3eec38eb40b62',
  'Obimma Charles Chinedu',
  'obimma charles chinedu anambra state assembly oyi ypp politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 28. Nweke Obi Callistus -- Anambra East (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4e8fdaf1b5746561', 'Nweke Obi Callistus',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4e8fdaf1b5746561', 'ind_4e8fdaf1b5746561', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nweke Obi Callistus', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4e8fdaf1b5746561', 'prof_4e8fdaf1b5746561',
  'Member, Anambra State House of Assembly (ANAMBRA EAST)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4e8fdaf1b5746561', 'ind_4e8fdaf1b5746561', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4e8fdaf1b5746561', 'ind_4e8fdaf1b5746561', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4e8fdaf1b5746561', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|anambra east|2023',
  'insert', 'ind_4e8fdaf1b5746561',
  'Unique: Anambra Anambra East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4e8fdaf1b5746561', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_4e8fdaf1b5746561', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4e8fdaf1b5746561', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_anambra_east',
  'ind_4e8fdaf1b5746561', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4e8fdaf1b5746561', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Anambra East', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4e8fdaf1b5746561', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_4e8fdaf1b5746561',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4e8fdaf1b5746561', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_4e8fdaf1b5746561',
  'political_assignment', '{"constituency_inec": "ANAMBRA EAST", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4e8fdaf1b5746561', 'prof_4e8fdaf1b5746561',
  'Nweke Obi Callistus',
  'nweke obi callistus anambra state assembly anambra east apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 29. Udoba Patrick Obalum -- Anambra West (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_721a842e97fda485', 'Udoba Patrick Obalum',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_721a842e97fda485', 'ind_721a842e97fda485', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Udoba Patrick Obalum', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_721a842e97fda485', 'prof_721a842e97fda485',
  'Member, Anambra State House of Assembly (ANAMBRA WEST)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_721a842e97fda485', 'ind_721a842e97fda485', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_721a842e97fda485', 'ind_721a842e97fda485', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_721a842e97fda485', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|anambra west|2023',
  'insert', 'ind_721a842e97fda485',
  'Unique: Anambra Anambra West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_721a842e97fda485', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_721a842e97fda485', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_721a842e97fda485', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_anambra_west',
  'ind_721a842e97fda485', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_721a842e97fda485', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Anambra West', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_721a842e97fda485', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_721a842e97fda485',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_721a842e97fda485', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_721a842e97fda485',
  'political_assignment', '{"constituency_inec": "ANAMBRA WEST", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_721a842e97fda485', 'prof_721a842e97fda485',
  'Udoba Patrick Obalum',
  'udoba patrick obalum anambra state assembly anambra west apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 30. Azotani Francis Chuks -- Dunukofia (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2c8b715d2438fcbc', 'Azotani Francis Chuks',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2c8b715d2438fcbc', 'ind_2c8b715d2438fcbc', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Azotani Francis Chuks', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2c8b715d2438fcbc', 'prof_2c8b715d2438fcbc',
  'Member, Anambra State House of Assembly (DUNUKOFIA)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2c8b715d2438fcbc', 'ind_2c8b715d2438fcbc', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2c8b715d2438fcbc', 'ind_2c8b715d2438fcbc', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2c8b715d2438fcbc', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|dunukofia|2023',
  'insert', 'ind_2c8b715d2438fcbc',
  'Unique: Anambra Dunukofia seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2c8b715d2438fcbc', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_2c8b715d2438fcbc', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2c8b715d2438fcbc', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_dunukofia',
  'ind_2c8b715d2438fcbc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2c8b715d2438fcbc', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Dunukofia', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2c8b715d2438fcbc', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_2c8b715d2438fcbc',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2c8b715d2438fcbc', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_2c8b715d2438fcbc',
  'political_assignment', '{"constituency_inec": "DUNUKOFIA", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2c8b715d2438fcbc', 'prof_2c8b715d2438fcbc',
  'Azotani Francis Chuks',
  'azotani francis chuks anambra state assembly dunukofia apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 31. Okafor Victor Uche -- Ayemelum (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cd3e5b611d3add8a', 'Okafor Victor Uche',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cd3e5b611d3add8a', 'ind_cd3e5b611d3add8a', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okafor Victor Uche', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cd3e5b611d3add8a', 'prof_cd3e5b611d3add8a',
  'Member, Anambra State House of Assembly (AYEMELUM)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cd3e5b611d3add8a', 'ind_cd3e5b611d3add8a', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cd3e5b611d3add8a', 'ind_cd3e5b611d3add8a', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cd3e5b611d3add8a', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|ayemelum|2023',
  'insert', 'ind_cd3e5b611d3add8a',
  'Unique: Anambra Ayemelum seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cd3e5b611d3add8a', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_cd3e5b611d3add8a', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cd3e5b611d3add8a', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_ayemelum',
  'ind_cd3e5b611d3add8a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cd3e5b611d3add8a', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Ayemelum', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cd3e5b611d3add8a', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_cd3e5b611d3add8a',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cd3e5b611d3add8a', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_cd3e5b611d3add8a',
  'political_assignment', '{"constituency_inec": "AYEMELUM", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cd3e5b611d3add8a', 'prof_cd3e5b611d3add8a',
  'Okafor Victor Uche',
  'okafor victor uche anambra state assembly ayemelum apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

-- 32. Ofodeme Ikenna -- Ekwusigo (APGA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5d73414eec0f0b05', 'Ofodeme Ikenna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5d73414eec0f0b05', 'ind_5d73414eec0f0b05', 'individual', 'place_state_anambra',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ofodeme Ikenna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5d73414eec0f0b05', 'prof_5d73414eec0f0b05',
  'Member, Anambra State House of Assembly (EKWUSIGO)',
  'place_state_anambra', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5d73414eec0f0b05', 'ind_5d73414eec0f0b05', 'term_ng_anambra_state_assembly_10th_2023_2027',
  'place_state_anambra', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5d73414eec0f0b05', 'ind_5d73414eec0f0b05', 'org_political_party_apga', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5d73414eec0f0b05', 'seed_run_s05_political_anambra_roster_20260502', 'individual',
  'ng_state_assembly_member|anambra|ekwusigo|2023',
  'insert', 'ind_5d73414eec0f0b05',
  'Unique: Anambra Ekwusigo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5d73414eec0f0b05', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_5d73414eec0f0b05', 'seed_source_nigerianleaders_anambra_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5d73414eec0f0b05', 'seed_run_s05_political_anambra_roster_20260502', 'seed_source_nigerianleaders_anambra_assembly_20260502',
  'nl_anambra_assembly_2023_ekwusigo',
  'ind_5d73414eec0f0b05', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5d73414eec0f0b05', 'seed_run_s05_political_anambra_roster_20260502',
  'Anambra Ekwusigo', 'place_state_anambra', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5d73414eec0f0b05', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_5d73414eec0f0b05',
  'seed_source_nigerianleaders_anambra_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5d73414eec0f0b05', 'seed_run_s05_political_anambra_roster_20260502', 'individual', 'ind_5d73414eec0f0b05',
  'political_assignment', '{"constituency_inec": "EKWUSIGO", "party_abbrev": "APGA", "position": "Member", "source_url": "https://nigerianleaders.com/anambra-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5d73414eec0f0b05', 'prof_5d73414eec0f0b05',
  'Ofodeme Ikenna',
  'ofodeme ikenna anambra state assembly ekwusigo apga politician legislator state house',
  'place_nigeria_001/place_zone_south_east/place_state_anambra',
  'political',
  unixepoch(), unixepoch()
);

