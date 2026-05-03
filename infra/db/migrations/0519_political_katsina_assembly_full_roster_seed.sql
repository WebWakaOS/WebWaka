-- ============================================================
-- Migration 0519: Katsina State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Katsina State House of Assembly Members
-- Members seeded: 34/34
-- Party breakdown: APC:34
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_katsina_assembly_20260502',
  'NigerianLeaders – Complete List of Katsina State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/katsina-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_katsina_roster_20260502', 'S05 Batch – Katsina State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_katsina_roster_20260502',
  'seed_run_s05_political_katsina_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0519_political_katsina_assembly_full_roster_seed.sql',
  NULL, 34,
  '34/34 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_katsina_state_assembly_10th_2023_2027',
  'Katsina State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_katsina',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (34 of 34 seats) ──────────────────────────────────────

-- 01. Aminu Ibrahim Kurami -- Bakori (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bd6fd8ac511ffc09', 'Aminu Ibrahim Kurami',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bd6fd8ac511ffc09', 'ind_bd6fd8ac511ffc09', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aminu Ibrahim Kurami', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bd6fd8ac511ffc09', 'prof_bd6fd8ac511ffc09',
  'Member, Katsina State House of Assembly (BAKORI)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bd6fd8ac511ffc09', 'ind_bd6fd8ac511ffc09', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bd6fd8ac511ffc09', 'ind_bd6fd8ac511ffc09', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bd6fd8ac511ffc09', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|bakori|2023',
  'insert', 'ind_bd6fd8ac511ffc09',
  'Unique: Katsina Bakori seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bd6fd8ac511ffc09', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_bd6fd8ac511ffc09', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bd6fd8ac511ffc09', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_bakori',
  'ind_bd6fd8ac511ffc09', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bd6fd8ac511ffc09', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Bakori', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bd6fd8ac511ffc09', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_bd6fd8ac511ffc09',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bd6fd8ac511ffc09', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_bd6fd8ac511ffc09',
  'political_assignment', '{"constituency_inec": "BAKORI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bd6fd8ac511ffc09', 'prof_bd6fd8ac511ffc09',
  'Aminu Ibrahim Kurami',
  'aminu ibrahim kurami katsina state assembly bakori apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Shagumba Tukur Iliyasu -- Bakori II Tsiga (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_867cae16a2a402c6', 'Shagumba Tukur Iliyasu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_867cae16a2a402c6', 'ind_867cae16a2a402c6', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Shagumba Tukur Iliyasu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_867cae16a2a402c6', 'prof_867cae16a2a402c6',
  'Member, Katsina State House of Assembly (BAKORI II TSIGA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_867cae16a2a402c6', 'ind_867cae16a2a402c6', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_867cae16a2a402c6', 'ind_867cae16a2a402c6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_867cae16a2a402c6', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|bakori ii tsiga|2023',
  'insert', 'ind_867cae16a2a402c6',
  'Unique: Katsina Bakori II Tsiga seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_867cae16a2a402c6', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_867cae16a2a402c6', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_867cae16a2a402c6', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_bakori_ii_tsiga',
  'ind_867cae16a2a402c6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_867cae16a2a402c6', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Bakori II Tsiga', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_867cae16a2a402c6', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_867cae16a2a402c6',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_867cae16a2a402c6', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_867cae16a2a402c6',
  'political_assignment', '{"constituency_inec": "BAKORI II TSIGA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_867cae16a2a402c6', 'prof_867cae16a2a402c6',
  'Shagumba Tukur Iliyasu',
  'shagumba tukur iliyasu katsina state assembly bakori ii tsiga apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Tukur Mustapha -- Batsari (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_22f746c4ac332950', 'Tukur Mustapha',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_22f746c4ac332950', 'ind_22f746c4ac332950', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Tukur Mustapha', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_22f746c4ac332950', 'prof_22f746c4ac332950',
  'Member, Katsina State House of Assembly (BATSARI)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_22f746c4ac332950', 'ind_22f746c4ac332950', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_22f746c4ac332950', 'ind_22f746c4ac332950', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_22f746c4ac332950', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|batsari|2023',
  'insert', 'ind_22f746c4ac332950',
  'Unique: Katsina Batsari seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_22f746c4ac332950', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_22f746c4ac332950', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_22f746c4ac332950', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_batsari',
  'ind_22f746c4ac332950', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_22f746c4ac332950', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Batsari', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_22f746c4ac332950', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_22f746c4ac332950',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_22f746c4ac332950', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_22f746c4ac332950',
  'political_assignment', '{"constituency_inec": "BATSARI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_22f746c4ac332950', 'prof_22f746c4ac332950',
  'Tukur Mustapha',
  'tukur mustapha katsina state assembly batsari apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Umar Surajo -- Baure (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c2c88d4675e90674', 'Umar Surajo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c2c88d4675e90674', 'ind_c2c88d4675e90674', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umar Surajo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c2c88d4675e90674', 'prof_c2c88d4675e90674',
  'Member, Katsina State House of Assembly (BAURE)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c2c88d4675e90674', 'ind_c2c88d4675e90674', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c2c88d4675e90674', 'ind_c2c88d4675e90674', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c2c88d4675e90674', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|baure|2023',
  'insert', 'ind_c2c88d4675e90674',
  'Unique: Katsina Baure seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c2c88d4675e90674', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_c2c88d4675e90674', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c2c88d4675e90674', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_baure',
  'ind_c2c88d4675e90674', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c2c88d4675e90674', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Baure', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c2c88d4675e90674', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_c2c88d4675e90674',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c2c88d4675e90674', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_c2c88d4675e90674',
  'political_assignment', '{"constituency_inec": "BAURE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c2c88d4675e90674', 'prof_c2c88d4675e90674',
  'Umar Surajo',
  'umar surajo katsina state assembly baure apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Ali Umar Bindawa -- Bindawa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5cd524df8e3be59c', 'Ali Umar Bindawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5cd524df8e3be59c', 'ind_5cd524df8e3be59c', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ali Umar Bindawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5cd524df8e3be59c', 'prof_5cd524df8e3be59c',
  'Member, Katsina State House of Assembly (BINDAWA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5cd524df8e3be59c', 'ind_5cd524df8e3be59c', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5cd524df8e3be59c', 'ind_5cd524df8e3be59c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5cd524df8e3be59c', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|bindawa|2023',
  'insert', 'ind_5cd524df8e3be59c',
  'Unique: Katsina Bindawa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5cd524df8e3be59c', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_5cd524df8e3be59c', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5cd524df8e3be59c', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_bindawa',
  'ind_5cd524df8e3be59c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5cd524df8e3be59c', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Bindawa', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5cd524df8e3be59c', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_5cd524df8e3be59c',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5cd524df8e3be59c', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_5cd524df8e3be59c',
  'political_assignment', '{"constituency_inec": "BINDAWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5cd524df8e3be59c', 'prof_5cd524df8e3be59c',
  'Ali Umar Bindawa',
  'ali umar bindawa katsina state assembly bindawa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Isah Lawal Kuraye -- Charanchi (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_443bc704f10ec017', 'Isah Lawal Kuraye',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_443bc704f10ec017', 'ind_443bc704f10ec017', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Isah Lawal Kuraye', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_443bc704f10ec017', 'prof_443bc704f10ec017',
  'Member, Katsina State House of Assembly (CHARANCHI)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_443bc704f10ec017', 'ind_443bc704f10ec017', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_443bc704f10ec017', 'ind_443bc704f10ec017', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_443bc704f10ec017', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|charanchi|2023',
  'insert', 'ind_443bc704f10ec017',
  'Unique: Katsina Charanchi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_443bc704f10ec017', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_443bc704f10ec017', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_443bc704f10ec017', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_charanchi',
  'ind_443bc704f10ec017', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_443bc704f10ec017', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Charanchi', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_443bc704f10ec017', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_443bc704f10ec017',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_443bc704f10ec017', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_443bc704f10ec017',
  'political_assignment', '{"constituency_inec": "CHARANCHI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_443bc704f10ec017', 'prof_443bc704f10ec017',
  'Isah Lawal Kuraye',
  'isah lawal kuraye katsina state assembly charanchi apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Nuhu Yahaya Mahuta -- Dandume (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_31225a4ba37a1b96', 'Nuhu Yahaya Mahuta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_31225a4ba37a1b96', 'ind_31225a4ba37a1b96', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nuhu Yahaya Mahuta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_31225a4ba37a1b96', 'prof_31225a4ba37a1b96',
  'Member, Katsina State House of Assembly (DANDUME)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_31225a4ba37a1b96', 'ind_31225a4ba37a1b96', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_31225a4ba37a1b96', 'ind_31225a4ba37a1b96', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_31225a4ba37a1b96', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|dandume|2023',
  'insert', 'ind_31225a4ba37a1b96',
  'Unique: Katsina Dandume seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_31225a4ba37a1b96', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_31225a4ba37a1b96', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_31225a4ba37a1b96', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_dandume',
  'ind_31225a4ba37a1b96', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_31225a4ba37a1b96', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Dandume', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_31225a4ba37a1b96', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_31225a4ba37a1b96',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_31225a4ba37a1b96', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_31225a4ba37a1b96',
  'political_assignment', '{"constituency_inec": "DANDUME", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_31225a4ba37a1b96', 'prof_31225a4ba37a1b96',
  'Nuhu Yahaya Mahuta',
  'nuhu yahaya mahuta katsina state assembly dandume apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Abubakar Dabai Shamsudeen -- Danja (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_09b454ad114688db', 'Abubakar Dabai Shamsudeen',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_09b454ad114688db', 'ind_09b454ad114688db', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Dabai Shamsudeen', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_09b454ad114688db', 'prof_09b454ad114688db',
  'Member, Katsina State House of Assembly (DANJA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_09b454ad114688db', 'ind_09b454ad114688db', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_09b454ad114688db', 'ind_09b454ad114688db', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_09b454ad114688db', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|danja|2023',
  'insert', 'ind_09b454ad114688db',
  'Unique: Katsina Danja seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_09b454ad114688db', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_09b454ad114688db', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_09b454ad114688db', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_danja',
  'ind_09b454ad114688db', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_09b454ad114688db', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Danja', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_09b454ad114688db', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_09b454ad114688db',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_09b454ad114688db', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_09b454ad114688db',
  'political_assignment', '{"constituency_inec": "DANJA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_09b454ad114688db', 'prof_09b454ad114688db',
  'Abubakar Dabai Shamsudeen',
  'abubakar dabai shamsudeen katsina state assembly danja apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Garba Aminu A. -- Danmusa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b1836635e1382580', 'Garba Aminu A.',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b1836635e1382580', 'ind_b1836635e1382580', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Garba Aminu A.', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b1836635e1382580', 'prof_b1836635e1382580',
  'Member, Katsina State House of Assembly (DANMUSA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b1836635e1382580', 'ind_b1836635e1382580', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b1836635e1382580', 'ind_b1836635e1382580', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b1836635e1382580', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|danmusa|2023',
  'insert', 'ind_b1836635e1382580',
  'Unique: Katsina Danmusa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b1836635e1382580', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_b1836635e1382580', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b1836635e1382580', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_danmusa',
  'ind_b1836635e1382580', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b1836635e1382580', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Danmusa', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b1836635e1382580', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_b1836635e1382580',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b1836635e1382580', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_b1836635e1382580',
  'political_assignment', '{"constituency_inec": "DANMUSA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b1836635e1382580', 'prof_b1836635e1382580',
  'Garba Aminu A.',
  'garba aminu a. katsina state assembly danmusa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Yhaya Nasir -- Daura (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4988371ec4098f08', 'Yhaya Nasir',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4988371ec4098f08', 'ind_4988371ec4098f08', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yhaya Nasir', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4988371ec4098f08', 'prof_4988371ec4098f08',
  'Member, Katsina State House of Assembly (DAURA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4988371ec4098f08', 'ind_4988371ec4098f08', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4988371ec4098f08', 'ind_4988371ec4098f08', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4988371ec4098f08', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|daura|2023',
  'insert', 'ind_4988371ec4098f08',
  'Unique: Katsina Daura seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4988371ec4098f08', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_4988371ec4098f08', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4988371ec4098f08', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_daura',
  'ind_4988371ec4098f08', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4988371ec4098f08', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Daura', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4988371ec4098f08', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_4988371ec4098f08',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4988371ec4098f08', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_4988371ec4098f08',
  'political_assignment', '{"constituency_inec": "DAURA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4988371ec4098f08', 'prof_4988371ec4098f08',
  'Yhaya Nasir',
  'yhaya nasir katsina state assembly daura apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Samaila Abduljalal -- Dutsi (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_85ca2f37d17e0d8e', 'Samaila Abduljalal',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_85ca2f37d17e0d8e', 'ind_85ca2f37d17e0d8e', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Samaila Abduljalal', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_85ca2f37d17e0d8e', 'prof_85ca2f37d17e0d8e',
  'Member, Katsina State House of Assembly (DUTSI)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_85ca2f37d17e0d8e', 'ind_85ca2f37d17e0d8e', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_85ca2f37d17e0d8e', 'ind_85ca2f37d17e0d8e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_85ca2f37d17e0d8e', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|dutsi|2023',
  'insert', 'ind_85ca2f37d17e0d8e',
  'Unique: Katsina Dutsi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_85ca2f37d17e0d8e', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_85ca2f37d17e0d8e', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_85ca2f37d17e0d8e', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_dutsi',
  'ind_85ca2f37d17e0d8e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_85ca2f37d17e0d8e', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Dutsi', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_85ca2f37d17e0d8e', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_85ca2f37d17e0d8e',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_85ca2f37d17e0d8e', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_85ca2f37d17e0d8e',
  'political_assignment', '{"constituency_inec": "DUTSI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_85ca2f37d17e0d8e', 'prof_85ca2f37d17e0d8e',
  'Samaila Abduljalal',
  'samaila abduljalal katsina state assembly dutsi apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Abubakar Muhammad Hamisu -- Dutsin-Ma (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bb0baa7c11b88ee7', 'Abubakar Muhammad Hamisu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bb0baa7c11b88ee7', 'ind_bb0baa7c11b88ee7', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Muhammad Hamisu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bb0baa7c11b88ee7', 'prof_bb0baa7c11b88ee7',
  'Member, Katsina State House of Assembly (DUTSIN-MA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bb0baa7c11b88ee7', 'ind_bb0baa7c11b88ee7', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bb0baa7c11b88ee7', 'ind_bb0baa7c11b88ee7', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bb0baa7c11b88ee7', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|dutsin-ma|2023',
  'insert', 'ind_bb0baa7c11b88ee7',
  'Unique: Katsina Dutsin-Ma seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bb0baa7c11b88ee7', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_bb0baa7c11b88ee7', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bb0baa7c11b88ee7', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_dutsin-ma',
  'ind_bb0baa7c11b88ee7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bb0baa7c11b88ee7', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Dutsin-Ma', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bb0baa7c11b88ee7', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_bb0baa7c11b88ee7',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bb0baa7c11b88ee7', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_bb0baa7c11b88ee7',
  'political_assignment', '{"constituency_inec": "DUTSIN-MA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bb0baa7c11b88ee7', 'prof_bb0baa7c11b88ee7',
  'Abubakar Muhammad Hamisu',
  'abubakar muhammad hamisu katsina state assembly dutsin-ma apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Muazu Samaila Bawa -- Faskari (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e3013143d8c11f39', 'Muazu Samaila Bawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e3013143d8c11f39', 'ind_e3013143d8c11f39', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muazu Samaila Bawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e3013143d8c11f39', 'prof_e3013143d8c11f39',
  'Member, Katsina State House of Assembly (FASKARI)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e3013143d8c11f39', 'ind_e3013143d8c11f39', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e3013143d8c11f39', 'ind_e3013143d8c11f39', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e3013143d8c11f39', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|faskari|2023',
  'insert', 'ind_e3013143d8c11f39',
  'Unique: Katsina Faskari seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e3013143d8c11f39', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_e3013143d8c11f39', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e3013143d8c11f39', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_faskari',
  'ind_e3013143d8c11f39', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e3013143d8c11f39', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Faskari', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e3013143d8c11f39', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_e3013143d8c11f39',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e3013143d8c11f39', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_e3013143d8c11f39',
  'political_assignment', '{"constituency_inec": "FASKARI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e3013143d8c11f39', 'prof_e3013143d8c11f39',
  'Muazu Samaila Bawa',
  'muazu samaila bawa katsina state assembly faskari apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Mohammed Abubakar Total -- Funtua (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_aec5623a62648346', 'Mohammed Abubakar Total',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_aec5623a62648346', 'ind_aec5623a62648346', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Abubakar Total', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_aec5623a62648346', 'prof_aec5623a62648346',
  'Member, Katsina State House of Assembly (FUNTUA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_aec5623a62648346', 'ind_aec5623a62648346', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_aec5623a62648346', 'ind_aec5623a62648346', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_aec5623a62648346', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|funtua|2023',
  'insert', 'ind_aec5623a62648346',
  'Unique: Katsina Funtua seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_aec5623a62648346', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_aec5623a62648346', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_aec5623a62648346', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_funtua',
  'ind_aec5623a62648346', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_aec5623a62648346', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Funtua', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_aec5623a62648346', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_aec5623a62648346',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_aec5623a62648346', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_aec5623a62648346',
  'political_assignment', '{"constituency_inec": "FUNTUA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_aec5623a62648346', 'prof_aec5623a62648346',
  'Mohammed Abubakar Total',
  'mohammed abubakar total katsina state assembly funtua apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Suleman Abubakar Tunas -- Ingawa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d0d03162d0417895', 'Suleman Abubakar Tunas',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d0d03162d0417895', 'ind_d0d03162d0417895', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Suleman Abubakar Tunas', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d0d03162d0417895', 'prof_d0d03162d0417895',
  'Member, Katsina State House of Assembly (INGAWA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d0d03162d0417895', 'ind_d0d03162d0417895', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d0d03162d0417895', 'ind_d0d03162d0417895', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d0d03162d0417895', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|ingawa|2023',
  'insert', 'ind_d0d03162d0417895',
  'Unique: Katsina Ingawa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d0d03162d0417895', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_d0d03162d0417895', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d0d03162d0417895', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_ingawa',
  'ind_d0d03162d0417895', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d0d03162d0417895', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Ingawa', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d0d03162d0417895', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_d0d03162d0417895',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d0d03162d0417895', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_d0d03162d0417895',
  'political_assignment', '{"constituency_inec": "INGAWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d0d03162d0417895', 'prof_d0d03162d0417895',
  'Suleman Abubakar Tunas',
  'suleman abubakar tunas katsina state assembly ingawa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Yusuf Mustapha -- Jibia (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4f6323ae1a385f2a', 'Yusuf Mustapha',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4f6323ae1a385f2a', 'ind_4f6323ae1a385f2a', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yusuf Mustapha', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4f6323ae1a385f2a', 'prof_4f6323ae1a385f2a',
  'Member, Katsina State House of Assembly (JIBIA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4f6323ae1a385f2a', 'ind_4f6323ae1a385f2a', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4f6323ae1a385f2a', 'ind_4f6323ae1a385f2a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4f6323ae1a385f2a', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|jibia|2023',
  'insert', 'ind_4f6323ae1a385f2a',
  'Unique: Katsina Jibia seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4f6323ae1a385f2a', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_4f6323ae1a385f2a', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4f6323ae1a385f2a', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_jibia',
  'ind_4f6323ae1a385f2a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4f6323ae1a385f2a', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Jibia', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4f6323ae1a385f2a', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_4f6323ae1a385f2a',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4f6323ae1a385f2a', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_4f6323ae1a385f2a',
  'political_assignment', '{"constituency_inec": "JIBIA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4f6323ae1a385f2a', 'prof_4f6323ae1a385f2a',
  'Yusuf Mustapha',
  'yusuf mustapha katsina state assembly jibia apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Wakili Shuaibu -- Kafur (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6d874c57139f1022', 'Wakili Shuaibu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6d874c57139f1022', 'ind_6d874c57139f1022', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Wakili Shuaibu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6d874c57139f1022', 'prof_6d874c57139f1022',
  'Member, Katsina State House of Assembly (KAFUR)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6d874c57139f1022', 'ind_6d874c57139f1022', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6d874c57139f1022', 'ind_6d874c57139f1022', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6d874c57139f1022', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|kafur|2023',
  'insert', 'ind_6d874c57139f1022',
  'Unique: Katsina Kafur seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6d874c57139f1022', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_6d874c57139f1022', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6d874c57139f1022', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_kafur',
  'ind_6d874c57139f1022', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6d874c57139f1022', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Kafur', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6d874c57139f1022', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_6d874c57139f1022',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6d874c57139f1022', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_6d874c57139f1022',
  'political_assignment', '{"constituency_inec": "KAFUR", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6d874c57139f1022', 'prof_6d874c57139f1022',
  'Wakili Shuaibu',
  'wakili shuaibu katsina state assembly kafur apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Abdu Sirajo -- Kaita (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_92f1a882638f4744', 'Abdu Sirajo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_92f1a882638f4744', 'ind_92f1a882638f4744', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdu Sirajo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_92f1a882638f4744', 'prof_92f1a882638f4744',
  'Member, Katsina State House of Assembly (KAITA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_92f1a882638f4744', 'ind_92f1a882638f4744', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_92f1a882638f4744', 'ind_92f1a882638f4744', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_92f1a882638f4744', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|kaita|2023',
  'insert', 'ind_92f1a882638f4744',
  'Unique: Katsina Kaita seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_92f1a882638f4744', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_92f1a882638f4744', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_92f1a882638f4744', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_kaita',
  'ind_92f1a882638f4744', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_92f1a882638f4744', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Kaita', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_92f1a882638f4744', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_92f1a882638f4744',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_92f1a882638f4744', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_92f1a882638f4744',
  'political_assignment', '{"constituency_inec": "KAITA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_92f1a882638f4744', 'prof_92f1a882638f4744',
  'Abdu Sirajo',
  'abdu sirajo katsina state assembly kaita apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Mohammed Murtala Kankara -- Kankara (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fd21ef0753f408c8', 'Mohammed Murtala Kankara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fd21ef0753f408c8', 'ind_fd21ef0753f408c8', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Murtala Kankara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fd21ef0753f408c8', 'prof_fd21ef0753f408c8',
  'Member, Katsina State House of Assembly (KANKARA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fd21ef0753f408c8', 'ind_fd21ef0753f408c8', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fd21ef0753f408c8', 'ind_fd21ef0753f408c8', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fd21ef0753f408c8', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|kankara|2023',
  'insert', 'ind_fd21ef0753f408c8',
  'Unique: Katsina Kankara seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fd21ef0753f408c8', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_fd21ef0753f408c8', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fd21ef0753f408c8', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_kankara',
  'ind_fd21ef0753f408c8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fd21ef0753f408c8', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Kankara', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fd21ef0753f408c8', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_fd21ef0753f408c8',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fd21ef0753f408c8', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_fd21ef0753f408c8',
  'political_assignment', '{"constituency_inec": "KANKARA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fd21ef0753f408c8', 'prof_fd21ef0753f408c8',
  'Mohammed Murtala Kankara',
  'mohammed murtala kankara katsina state assembly kankara apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Hamza Salisu Rimaye -- Kankia (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f75937646026edc9', 'Hamza Salisu Rimaye',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f75937646026edc9', 'ind_f75937646026edc9', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Hamza Salisu Rimaye', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f75937646026edc9', 'prof_f75937646026edc9',
  'Member, Katsina State House of Assembly (KANKIA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f75937646026edc9', 'ind_f75937646026edc9', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f75937646026edc9', 'ind_f75937646026edc9', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f75937646026edc9', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|kankia|2023',
  'insert', 'ind_f75937646026edc9',
  'Unique: Katsina Kankia seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f75937646026edc9', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_f75937646026edc9', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f75937646026edc9', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_kankia',
  'ind_f75937646026edc9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f75937646026edc9', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Kankia', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f75937646026edc9', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_f75937646026edc9',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f75937646026edc9', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_f75937646026edc9',
  'political_assignment', '{"constituency_inec": "KANKIA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f75937646026edc9', 'prof_f75937646026edc9',
  'Hamza Salisu Rimaye',
  'hamza salisu rimaye katsina state assembly kankia apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Abubakar Albaba Aliyu -- Katsina (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8ce151b019cb9970', 'Abubakar Albaba Aliyu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8ce151b019cb9970', 'ind_8ce151b019cb9970', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Albaba Aliyu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8ce151b019cb9970', 'prof_8ce151b019cb9970',
  'Member, Katsina State House of Assembly (KATSINA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8ce151b019cb9970', 'ind_8ce151b019cb9970', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8ce151b019cb9970', 'ind_8ce151b019cb9970', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8ce151b019cb9970', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|katsina|2023',
  'insert', 'ind_8ce151b019cb9970',
  'Unique: Katsina Katsina seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8ce151b019cb9970', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_8ce151b019cb9970', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8ce151b019cb9970', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_katsina',
  'ind_8ce151b019cb9970', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8ce151b019cb9970', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Katsina', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8ce151b019cb9970', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_8ce151b019cb9970',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8ce151b019cb9970', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_8ce151b019cb9970',
  'political_assignment', '{"constituency_inec": "KATSINA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8ce151b019cb9970', 'prof_8ce151b019cb9970',
  'Abubakar Albaba Aliyu',
  'abubakar albaba aliyu katsina state assembly katsina apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Ibrahim Aminu -- Kurfi (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4bb10c8cba66dd71', 'Ibrahim Aminu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4bb10c8cba66dd71', 'ind_4bb10c8cba66dd71', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Aminu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4bb10c8cba66dd71', 'prof_4bb10c8cba66dd71',
  'Member, Katsina State House of Assembly (KURFI)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4bb10c8cba66dd71', 'ind_4bb10c8cba66dd71', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4bb10c8cba66dd71', 'ind_4bb10c8cba66dd71', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4bb10c8cba66dd71', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|kurfi|2023',
  'insert', 'ind_4bb10c8cba66dd71',
  'Unique: Katsina Kurfi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4bb10c8cba66dd71', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_4bb10c8cba66dd71', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4bb10c8cba66dd71', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_kurfi',
  'ind_4bb10c8cba66dd71', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4bb10c8cba66dd71', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Kurfi', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4bb10c8cba66dd71', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_4bb10c8cba66dd71',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4bb10c8cba66dd71', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_4bb10c8cba66dd71',
  'political_assignment', '{"constituency_inec": "KURFI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4bb10c8cba66dd71', 'prof_4bb10c8cba66dd71',
  'Ibrahim Aminu',
  'ibrahim aminu katsina state assembly kurfi apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Garba Ghali -- Kusada (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fc9a172aca444cac', 'Garba Ghali',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fc9a172aca444cac', 'ind_fc9a172aca444cac', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Garba Ghali', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fc9a172aca444cac', 'prof_fc9a172aca444cac',
  'Member, Katsina State House of Assembly (KUSADA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fc9a172aca444cac', 'ind_fc9a172aca444cac', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fc9a172aca444cac', 'ind_fc9a172aca444cac', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fc9a172aca444cac', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|kusada|2023',
  'insert', 'ind_fc9a172aca444cac',
  'Unique: Katsina Kusada seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fc9a172aca444cac', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_fc9a172aca444cac', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fc9a172aca444cac', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_kusada',
  'ind_fc9a172aca444cac', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fc9a172aca444cac', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Kusada', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fc9a172aca444cac', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_fc9a172aca444cac',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fc9a172aca444cac', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_fc9a172aca444cac',
  'political_assignment', '{"constituency_inec": "KUSADA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fc9a172aca444cac', 'prof_fc9a172aca444cac',
  'Garba Ghali',
  'garba ghali katsina state assembly kusada apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Rabe Mustapha Musa -- Maiadua (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f05aea10c74baf62', 'Rabe Mustapha Musa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f05aea10c74baf62', 'ind_f05aea10c74baf62', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Rabe Mustapha Musa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f05aea10c74baf62', 'prof_f05aea10c74baf62',
  'Member, Katsina State House of Assembly (MAIADUA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f05aea10c74baf62', 'ind_f05aea10c74baf62', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f05aea10c74baf62', 'ind_f05aea10c74baf62', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f05aea10c74baf62', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|maiadua|2023',
  'insert', 'ind_f05aea10c74baf62',
  'Unique: Katsina Maiadua seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f05aea10c74baf62', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_f05aea10c74baf62', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f05aea10c74baf62', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_maiadua',
  'ind_f05aea10c74baf62', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f05aea10c74baf62', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Maiadua', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f05aea10c74baf62', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_f05aea10c74baf62',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f05aea10c74baf62', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_f05aea10c74baf62',
  'political_assignment', '{"constituency_inec": "MAIADUA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f05aea10c74baf62', 'prof_f05aea10c74baf62',
  'Rabe Mustapha Musa',
  'rabe mustapha musa katsina state assembly maiadua apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Ibrahim Aminu -- Malumfashi East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6f7c5781fa5e50d5', 'Ibrahim Aminu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6f7c5781fa5e50d5', 'ind_6f7c5781fa5e50d5', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Aminu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6f7c5781fa5e50d5', 'prof_6f7c5781fa5e50d5',
  'Member, Katsina State House of Assembly (MALUMFASHI EAST)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6f7c5781fa5e50d5', 'ind_6f7c5781fa5e50d5', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6f7c5781fa5e50d5', 'ind_6f7c5781fa5e50d5', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6f7c5781fa5e50d5', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|malumfashi east|2023',
  'insert', 'ind_6f7c5781fa5e50d5',
  'Unique: Katsina Malumfashi East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6f7c5781fa5e50d5', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_6f7c5781fa5e50d5', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6f7c5781fa5e50d5', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_malumfashi_east',
  'ind_6f7c5781fa5e50d5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6f7c5781fa5e50d5', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Malumfashi East', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6f7c5781fa5e50d5', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_6f7c5781fa5e50d5',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6f7c5781fa5e50d5', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_6f7c5781fa5e50d5',
  'political_assignment', '{"constituency_inec": "MALUMFASHI EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6f7c5781fa5e50d5', 'prof_6f7c5781fa5e50d5',
  'Ibrahim Aminu',
  'ibrahim aminu katsina state assembly malumfashi east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 26. Zayyana Shuaibu Bujawa -- Mani (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2ec18a999f06b0e1', 'Zayyana Shuaibu Bujawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2ec18a999f06b0e1', 'ind_2ec18a999f06b0e1', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Zayyana Shuaibu Bujawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2ec18a999f06b0e1', 'prof_2ec18a999f06b0e1',
  'Member, Katsina State House of Assembly (MANI)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2ec18a999f06b0e1', 'ind_2ec18a999f06b0e1', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2ec18a999f06b0e1', 'ind_2ec18a999f06b0e1', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2ec18a999f06b0e1', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|mani|2023',
  'insert', 'ind_2ec18a999f06b0e1',
  'Unique: Katsina Mani seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2ec18a999f06b0e1', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_2ec18a999f06b0e1', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2ec18a999f06b0e1', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_mani',
  'ind_2ec18a999f06b0e1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2ec18a999f06b0e1', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Mani', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2ec18a999f06b0e1', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_2ec18a999f06b0e1',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2ec18a999f06b0e1', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_2ec18a999f06b0e1',
  'political_assignment', '{"constituency_inec": "MANI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2ec18a999f06b0e1', 'prof_2ec18a999f06b0e1',
  'Zayyana Shuaibu Bujawa',
  'zayyana shuaibu bujawa katsina state assembly mani apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 27. Sani Bello Mustapha -- Mashi (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c6b3281f6e2424ae', 'Sani Bello Mustapha',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c6b3281f6e2424ae', 'ind_c6b3281f6e2424ae', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sani Bello Mustapha', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c6b3281f6e2424ae', 'prof_c6b3281f6e2424ae',
  'Member, Katsina State House of Assembly (MASHI)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c6b3281f6e2424ae', 'ind_c6b3281f6e2424ae', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c6b3281f6e2424ae', 'ind_c6b3281f6e2424ae', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c6b3281f6e2424ae', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|mashi|2023',
  'insert', 'ind_c6b3281f6e2424ae',
  'Unique: Katsina Mashi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c6b3281f6e2424ae', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_c6b3281f6e2424ae', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c6b3281f6e2424ae', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_mashi',
  'ind_c6b3281f6e2424ae', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c6b3281f6e2424ae', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Mashi', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c6b3281f6e2424ae', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_c6b3281f6e2424ae',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c6b3281f6e2424ae', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_c6b3281f6e2424ae',
  'political_assignment', '{"constituency_inec": "MASHI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c6b3281f6e2424ae', 'prof_c6b3281f6e2424ae',
  'Sani Bello Mustapha',
  'sani bello mustapha katsina state assembly mashi apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 28. Dikko Ibrahim Umar -- Matazu (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c8549ad847ada249', 'Dikko Ibrahim Umar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c8549ad847ada249', 'ind_c8549ad847ada249', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dikko Ibrahim Umar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c8549ad847ada249', 'prof_c8549ad847ada249',
  'Member, Katsina State House of Assembly (MATAZU)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c8549ad847ada249', 'ind_c8549ad847ada249', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c8549ad847ada249', 'ind_c8549ad847ada249', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c8549ad847ada249', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|matazu|2023',
  'insert', 'ind_c8549ad847ada249',
  'Unique: Katsina Matazu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c8549ad847ada249', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_c8549ad847ada249', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c8549ad847ada249', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_matazu',
  'ind_c8549ad847ada249', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c8549ad847ada249', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Matazu', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c8549ad847ada249', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_c8549ad847ada249',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c8549ad847ada249', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_c8549ad847ada249',
  'political_assignment', '{"constituency_inec": "MATAZU", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c8549ad847ada249', 'prof_c8549ad847ada249',
  'Dikko Ibrahim Umar',
  'dikko ibrahim umar katsina state assembly matazu apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 29. Yaro .H. Lawal -- Musawa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_21651ebac0a17002', 'Yaro .H. Lawal',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_21651ebac0a17002', 'ind_21651ebac0a17002', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yaro .H. Lawal', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_21651ebac0a17002', 'prof_21651ebac0a17002',
  'Member, Katsina State House of Assembly (MUSAWA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_21651ebac0a17002', 'ind_21651ebac0a17002', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_21651ebac0a17002', 'ind_21651ebac0a17002', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_21651ebac0a17002', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|musawa|2023',
  'insert', 'ind_21651ebac0a17002',
  'Unique: Katsina Musawa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_21651ebac0a17002', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_21651ebac0a17002', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_21651ebac0a17002', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_musawa',
  'ind_21651ebac0a17002', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_21651ebac0a17002', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Musawa', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_21651ebac0a17002', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_21651ebac0a17002',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_21651ebac0a17002', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_21651ebac0a17002',
  'political_assignment', '{"constituency_inec": "MUSAWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_21651ebac0a17002', 'prof_21651ebac0a17002',
  'Yaro .H. Lawal',
  'yaro .h. lawal katsina state assembly musawa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 30. Kurabau Abdulrahman Saleh -- Rimi (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_114675beecebb8ae', 'Kurabau Abdulrahman Saleh',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_114675beecebb8ae', 'ind_114675beecebb8ae', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kurabau Abdulrahman Saleh', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_114675beecebb8ae', 'prof_114675beecebb8ae',
  'Member, Katsina State House of Assembly (RIMI)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_114675beecebb8ae', 'ind_114675beecebb8ae', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_114675beecebb8ae', 'ind_114675beecebb8ae', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_114675beecebb8ae', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|rimi|2023',
  'insert', 'ind_114675beecebb8ae',
  'Unique: Katsina Rimi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_114675beecebb8ae', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_114675beecebb8ae', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_114675beecebb8ae', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_rimi',
  'ind_114675beecebb8ae', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_114675beecebb8ae', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Rimi', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_114675beecebb8ae', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_114675beecebb8ae',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_114675beecebb8ae', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_114675beecebb8ae',
  'political_assignment', '{"constituency_inec": "RIMI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_114675beecebb8ae', 'prof_114675beecebb8ae',
  'Kurabau Abdulrahman Saleh',
  'kurabau abdulrahman saleh katsina state assembly rimi apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 31. Danjuma Ibrahim -- Sabuwa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6be47d60c7327070', 'Danjuma Ibrahim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6be47d60c7327070', 'ind_6be47d60c7327070', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Danjuma Ibrahim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6be47d60c7327070', 'prof_6be47d60c7327070',
  'Member, Katsina State House of Assembly (SABUWA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6be47d60c7327070', 'ind_6be47d60c7327070', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6be47d60c7327070', 'ind_6be47d60c7327070', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6be47d60c7327070', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|sabuwa|2023',
  'insert', 'ind_6be47d60c7327070',
  'Unique: Katsina Sabuwa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6be47d60c7327070', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_6be47d60c7327070', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6be47d60c7327070', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_sabuwa',
  'ind_6be47d60c7327070', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6be47d60c7327070', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Sabuwa', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6be47d60c7327070', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_6be47d60c7327070',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6be47d60c7327070', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_6be47d60c7327070',
  'political_assignment', '{"constituency_inec": "SABUWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6be47d60c7327070', 'prof_6be47d60c7327070',
  'Danjuma Ibrahim',
  'danjuma ibrahim katsina state assembly sabuwa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 32. Haruna Runka Abduljalal -- Safana (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e4dcffe424960568', 'Haruna Runka Abduljalal',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e4dcffe424960568', 'ind_e4dcffe424960568', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Haruna Runka Abduljalal', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e4dcffe424960568', 'prof_e4dcffe424960568',
  'Member, Katsina State House of Assembly (SAFANA)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e4dcffe424960568', 'ind_e4dcffe424960568', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e4dcffe424960568', 'ind_e4dcffe424960568', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e4dcffe424960568', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|safana|2023',
  'insert', 'ind_e4dcffe424960568',
  'Unique: Katsina Safana seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e4dcffe424960568', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_e4dcffe424960568', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e4dcffe424960568', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_safana',
  'ind_e4dcffe424960568', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e4dcffe424960568', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Safana', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e4dcffe424960568', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_e4dcffe424960568',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e4dcffe424960568', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_e4dcffe424960568',
  'political_assignment', '{"constituency_inec": "SAFANA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e4dcffe424960568', 'prof_e4dcffe424960568',
  'Haruna Runka Abduljalal',
  'haruna runka abduljalal katsina state assembly safana apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 33. Magaji Ruma Sale -- Sandamu (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_64481da3cb06ad7d', 'Magaji Ruma Sale',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_64481da3cb06ad7d', 'ind_64481da3cb06ad7d', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Magaji Ruma Sale', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_64481da3cb06ad7d', 'prof_64481da3cb06ad7d',
  'Member, Katsina State House of Assembly (SANDAMU)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_64481da3cb06ad7d', 'ind_64481da3cb06ad7d', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_64481da3cb06ad7d', 'ind_64481da3cb06ad7d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_64481da3cb06ad7d', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|sandamu|2023',
  'insert', 'ind_64481da3cb06ad7d',
  'Unique: Katsina Sandamu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_64481da3cb06ad7d', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_64481da3cb06ad7d', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_64481da3cb06ad7d', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_sandamu',
  'ind_64481da3cb06ad7d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_64481da3cb06ad7d', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Sandamu', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_64481da3cb06ad7d', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_64481da3cb06ad7d',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_64481da3cb06ad7d', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_64481da3cb06ad7d',
  'political_assignment', '{"constituency_inec": "SANDAMU", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_64481da3cb06ad7d', 'prof_64481da3cb06ad7d',
  'Magaji Ruma Sale',
  'magaji ruma sale katsina state assembly sandamu apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

-- 34. Musa Maigari Tasiu -- Zango (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_47d326a291cb4595', 'Musa Maigari Tasiu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_47d326a291cb4595', 'ind_47d326a291cb4595', 'individual', 'place_state_katsina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Musa Maigari Tasiu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_47d326a291cb4595', 'prof_47d326a291cb4595',
  'Member, Katsina State House of Assembly (ZANGO)',
  'place_state_katsina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_47d326a291cb4595', 'ind_47d326a291cb4595', 'term_ng_katsina_state_assembly_10th_2023_2027',
  'place_state_katsina', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_47d326a291cb4595', 'ind_47d326a291cb4595', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_47d326a291cb4595', 'seed_run_s05_political_katsina_roster_20260502', 'individual',
  'ng_state_assembly_member|katsina|zango|2023',
  'insert', 'ind_47d326a291cb4595',
  'Unique: Katsina Zango seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_47d326a291cb4595', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_47d326a291cb4595', 'seed_source_nigerianleaders_katsina_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_47d326a291cb4595', 'seed_run_s05_political_katsina_roster_20260502', 'seed_source_nigerianleaders_katsina_assembly_20260502',
  'nl_katsina_assembly_2023_zango',
  'ind_47d326a291cb4595', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_47d326a291cb4595', 'seed_run_s05_political_katsina_roster_20260502',
  'Katsina Zango', 'place_state_katsina', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_47d326a291cb4595', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_47d326a291cb4595',
  'seed_source_nigerianleaders_katsina_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_47d326a291cb4595', 'seed_run_s05_political_katsina_roster_20260502', 'individual', 'ind_47d326a291cb4595',
  'political_assignment', '{"constituency_inec": "ZANGO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/katsina-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_47d326a291cb4595', 'prof_47d326a291cb4595',
  'Musa Maigari Tasiu',
  'musa maigari tasiu katsina state assembly zango apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_katsina',
  'political',
  unixepoch(), unixepoch()
);

