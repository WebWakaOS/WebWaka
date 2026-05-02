-- ============================================================
-- Migration 0508: Borno State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Borno State House of Assembly Members
-- Members seeded: 23/28
-- Party breakdown: APC:22, ADC:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;

BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_borno_assembly_20260502',
  'NigerianLeaders – Complete List of Borno State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/borno-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_borno_roster_20260502', 'S05 Batch – Borno State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_borno_roster_20260502',
  'seed_run_s05_political_borno_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0508_political_borno_assembly_full_roster_seed.sql',
  NULL, 23,
  '23/28 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_borno_state_assembly_10th_2023_2027',
  'Borno State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_borno',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (23 of 28 seats) ──────────────────────────────────────

-- 01. Chiroma Tijjani Modu -- Abadam (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fafd56687df90d61', 'Chiroma Tijjani Modu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fafd56687df90d61', 'ind_fafd56687df90d61', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Chiroma Tijjani Modu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fafd56687df90d61', 'prof_fafd56687df90d61',
  'Member, Borno State House of Assembly (ABADAM)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fafd56687df90d61', 'ind_fafd56687df90d61', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fafd56687df90d61', 'ind_fafd56687df90d61', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fafd56687df90d61', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|abadam|2023',
  'insert', 'ind_fafd56687df90d61',
  'Unique: Borno Abadam seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fafd56687df90d61', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_fafd56687df90d61', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fafd56687df90d61', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_abadam',
  'ind_fafd56687df90d61', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fafd56687df90d61', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Abadam', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fafd56687df90d61', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_fafd56687df90d61',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fafd56687df90d61', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_fafd56687df90d61',
  'political_assignment', '{"constituency_inec": "ABADAM", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fafd56687df90d61', 'prof_fafd56687df90d61',
  'Chiroma Tijjani Modu',
  'chiroma tijjani modu borno state assembly abadam adc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Abdullahi Musa Askira -- Askira (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_94f5d3040efcd40d', 'Abdullahi Musa Askira',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_94f5d3040efcd40d', 'ind_94f5d3040efcd40d', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Musa Askira', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_94f5d3040efcd40d', 'prof_94f5d3040efcd40d',
  'Member, Borno State House of Assembly (ASKIRA)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_94f5d3040efcd40d', 'ind_94f5d3040efcd40d', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_94f5d3040efcd40d', 'ind_94f5d3040efcd40d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_94f5d3040efcd40d', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|askira|2023',
  'insert', 'ind_94f5d3040efcd40d',
  'Unique: Borno Askira seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_94f5d3040efcd40d', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_94f5d3040efcd40d', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_94f5d3040efcd40d', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_askira',
  'ind_94f5d3040efcd40d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_94f5d3040efcd40d', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Askira', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_94f5d3040efcd40d', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_94f5d3040efcd40d',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_94f5d3040efcd40d', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_94f5d3040efcd40d',
  'political_assignment', '{"constituency_inec": "ASKIRA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_94f5d3040efcd40d', 'prof_94f5d3040efcd40d',
  'Abdullahi Musa Askira',
  'abdullahi musa askira borno state assembly askira apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Bukar Baba -- Bama (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_46e2f3a32287231f', 'Bukar Baba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_46e2f3a32287231f', 'ind_46e2f3a32287231f', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bukar Baba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_46e2f3a32287231f', 'prof_46e2f3a32287231f',
  'Member, Borno State House of Assembly (BAMA)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_46e2f3a32287231f', 'ind_46e2f3a32287231f', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_46e2f3a32287231f', 'ind_46e2f3a32287231f', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_46e2f3a32287231f', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|bama|2023',
  'insert', 'ind_46e2f3a32287231f',
  'Unique: Borno Bama seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_46e2f3a32287231f', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_46e2f3a32287231f', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_46e2f3a32287231f', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_bama',
  'ind_46e2f3a32287231f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_46e2f3a32287231f', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Bama', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_46e2f3a32287231f', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_46e2f3a32287231f',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_46e2f3a32287231f', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_46e2f3a32287231f',
  'political_assignment', '{"constituency_inec": "BAMA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_46e2f3a32287231f', 'prof_46e2f3a32287231f',
  'Bukar Baba',
  'bukar baba borno state assembly bama apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Maina Abare Maigari -- Bayo (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f7f00aeff6cd1fa6', 'Maina Abare Maigari',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f7f00aeff6cd1fa6', 'ind_f7f00aeff6cd1fa6', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Maina Abare Maigari', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f7f00aeff6cd1fa6', 'prof_f7f00aeff6cd1fa6',
  'Member, Borno State House of Assembly (BAYO)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f7f00aeff6cd1fa6', 'ind_f7f00aeff6cd1fa6', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f7f00aeff6cd1fa6', 'ind_f7f00aeff6cd1fa6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f7f00aeff6cd1fa6', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|bayo|2023',
  'insert', 'ind_f7f00aeff6cd1fa6',
  'Unique: Borno Bayo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f7f00aeff6cd1fa6', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_f7f00aeff6cd1fa6', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f7f00aeff6cd1fa6', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_bayo',
  'ind_f7f00aeff6cd1fa6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f7f00aeff6cd1fa6', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Bayo', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f7f00aeff6cd1fa6', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_f7f00aeff6cd1fa6',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f7f00aeff6cd1fa6', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_f7f00aeff6cd1fa6',
  'political_assignment', '{"constituency_inec": "BAYO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f7f00aeff6cd1fa6', 'prof_f7f00aeff6cd1fa6',
  'Maina Abare Maigari',
  'maina abare maigari borno state assembly bayo apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Gambo Kimba Yakubu -- Biu (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9314be3b0617e994', 'Gambo Kimba Yakubu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9314be3b0617e994', 'ind_9314be3b0617e994', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Gambo Kimba Yakubu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9314be3b0617e994', 'prof_9314be3b0617e994',
  'Member, Borno State House of Assembly (BIU)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9314be3b0617e994', 'ind_9314be3b0617e994', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9314be3b0617e994', 'ind_9314be3b0617e994', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9314be3b0617e994', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|biu|2023',
  'insert', 'ind_9314be3b0617e994',
  'Unique: Borno Biu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9314be3b0617e994', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_9314be3b0617e994', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9314be3b0617e994', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_biu',
  'ind_9314be3b0617e994', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9314be3b0617e994', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Biu', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9314be3b0617e994', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_9314be3b0617e994',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9314be3b0617e994', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_9314be3b0617e994',
  'political_assignment', '{"constituency_inec": "BIU", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9314be3b0617e994', 'prof_9314be3b0617e994',
  'Gambo Kimba Yakubu',
  'gambo kimba yakubu borno state assembly biu apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Zakariya Mohammed -- Damaboa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_703ecf899850ea9c', 'Zakariya Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_703ecf899850ea9c', 'ind_703ecf899850ea9c', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Zakariya Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_703ecf899850ea9c', 'prof_703ecf899850ea9c',
  'Member, Borno State House of Assembly (DAMABOA)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_703ecf899850ea9c', 'ind_703ecf899850ea9c', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_703ecf899850ea9c', 'ind_703ecf899850ea9c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_703ecf899850ea9c', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|damaboa|2023',
  'insert', 'ind_703ecf899850ea9c',
  'Unique: Borno Damaboa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_703ecf899850ea9c', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_703ecf899850ea9c', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_703ecf899850ea9c', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_damaboa',
  'ind_703ecf899850ea9c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_703ecf899850ea9c', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Damaboa', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_703ecf899850ea9c', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_703ecf899850ea9c',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_703ecf899850ea9c', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_703ecf899850ea9c',
  'political_assignment', '{"constituency_inec": "DAMABOA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_703ecf899850ea9c', 'prof_703ecf899850ea9c',
  'Zakariya Mohammed',
  'zakariya mohammed borno state assembly damaboa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Wakil Mallami -- Dikwa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f154e696f1d94ff2', 'Wakil Mallami',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f154e696f1d94ff2', 'ind_f154e696f1d94ff2', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Wakil Mallami', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f154e696f1d94ff2', 'prof_f154e696f1d94ff2',
  'Member, Borno State House of Assembly (DIKWA)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f154e696f1d94ff2', 'ind_f154e696f1d94ff2', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f154e696f1d94ff2', 'ind_f154e696f1d94ff2', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f154e696f1d94ff2', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|dikwa|2023',
  'insert', 'ind_f154e696f1d94ff2',
  'Unique: Borno Dikwa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f154e696f1d94ff2', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_f154e696f1d94ff2', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f154e696f1d94ff2', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_dikwa',
  'ind_f154e696f1d94ff2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f154e696f1d94ff2', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Dikwa', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f154e696f1d94ff2', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_f154e696f1d94ff2',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f154e696f1d94ff2', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_f154e696f1d94ff2',
  'political_assignment', '{"constituency_inec": "DIKWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f154e696f1d94ff2', 'prof_f154e696f1d94ff2',
  'Wakil Mallami',
  'wakil mallami borno state assembly dikwa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Moruma Gubo -- Gubio (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a0c80c0a186c0b14', 'Moruma Gubo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a0c80c0a186c0b14', 'ind_a0c80c0a186c0b14', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Moruma Gubo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a0c80c0a186c0b14', 'prof_a0c80c0a186c0b14',
  'Member, Borno State House of Assembly (GUBIO)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a0c80c0a186c0b14', 'ind_a0c80c0a186c0b14', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a0c80c0a186c0b14', 'ind_a0c80c0a186c0b14', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a0c80c0a186c0b14', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|gubio|2023',
  'insert', 'ind_a0c80c0a186c0b14',
  'Unique: Borno Gubio seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a0c80c0a186c0b14', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_a0c80c0a186c0b14', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a0c80c0a186c0b14', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_gubio',
  'ind_a0c80c0a186c0b14', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a0c80c0a186c0b14', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Gubio', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a0c80c0a186c0b14', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_a0c80c0a186c0b14',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a0c80c0a186c0b14', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_a0c80c0a186c0b14',
  'political_assignment', '{"constituency_inec": "GUBIO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a0c80c0a186c0b14', 'prof_a0c80c0a186c0b14',
  'Moruma Gubo',
  'moruma gubo borno state assembly gubio apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Mallam Baba Baba Shehu -- Gulumba (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_767276d58d98efb8', 'Mallam Baba Baba Shehu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_767276d58d98efb8', 'ind_767276d58d98efb8', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mallam Baba Baba Shehu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_767276d58d98efb8', 'prof_767276d58d98efb8',
  'Member, Borno State House of Assembly (GULUMBA)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_767276d58d98efb8', 'ind_767276d58d98efb8', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_767276d58d98efb8', 'ind_767276d58d98efb8', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_767276d58d98efb8', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|gulumba|2023',
  'insert', 'ind_767276d58d98efb8',
  'Unique: Borno Gulumba seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_767276d58d98efb8', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_767276d58d98efb8', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_767276d58d98efb8', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_gulumba',
  'ind_767276d58d98efb8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_767276d58d98efb8', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Gulumba', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_767276d58d98efb8', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_767276d58d98efb8',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_767276d58d98efb8', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_767276d58d98efb8',
  'political_assignment', '{"constituency_inec": "GULUMBA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_767276d58d98efb8', 'prof_767276d58d98efb8',
  'Mallam Baba Baba Shehu',
  'mallam baba baba shehu borno state assembly gulumba apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Lawan Abdulkarim -- Guzamala (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1788dcd93c9c8b3a', 'Lawan Abdulkarim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1788dcd93c9c8b3a', 'ind_1788dcd93c9c8b3a', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lawan Abdulkarim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1788dcd93c9c8b3a', 'prof_1788dcd93c9c8b3a',
  'Member, Borno State House of Assembly (GUZAMALA)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1788dcd93c9c8b3a', 'ind_1788dcd93c9c8b3a', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1788dcd93c9c8b3a', 'ind_1788dcd93c9c8b3a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1788dcd93c9c8b3a', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|guzamala|2023',
  'insert', 'ind_1788dcd93c9c8b3a',
  'Unique: Borno Guzamala seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1788dcd93c9c8b3a', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_1788dcd93c9c8b3a', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1788dcd93c9c8b3a', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_guzamala',
  'ind_1788dcd93c9c8b3a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1788dcd93c9c8b3a', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Guzamala', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1788dcd93c9c8b3a', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_1788dcd93c9c8b3a',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1788dcd93c9c8b3a', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_1788dcd93c9c8b3a',
  'political_assignment', '{"constituency_inec": "GUZAMALA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1788dcd93c9c8b3a', 'prof_1788dcd93c9c8b3a',
  'Lawan Abdulkarim',
  'lawan abdulkarim borno state assembly guzamala apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Buba Abdullahi Abatcha -- Gwoza (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7cc0aff9011b9561', 'Buba Abdullahi Abatcha',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7cc0aff9011b9561', 'ind_7cc0aff9011b9561', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Buba Abdullahi Abatcha', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7cc0aff9011b9561', 'prof_7cc0aff9011b9561',
  'Member, Borno State House of Assembly (GWOZA)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7cc0aff9011b9561', 'ind_7cc0aff9011b9561', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7cc0aff9011b9561', 'ind_7cc0aff9011b9561', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7cc0aff9011b9561', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|gwoza|2023',
  'insert', 'ind_7cc0aff9011b9561',
  'Unique: Borno Gwoza seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7cc0aff9011b9561', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_7cc0aff9011b9561', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7cc0aff9011b9561', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_gwoza',
  'ind_7cc0aff9011b9561', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7cc0aff9011b9561', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Gwoza', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7cc0aff9011b9561', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_7cc0aff9011b9561',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7cc0aff9011b9561', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_7cc0aff9011b9561',
  'political_assignment', '{"constituency_inec": "GWOZA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7cc0aff9011b9561', 'prof_7cc0aff9011b9561',
  'Buba Abdullahi Abatcha',
  'buba abdullahi abatcha borno state assembly gwoza apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Ibrahim Mohammed -- Hawul (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a061d47426c70317', 'Ibrahim Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a061d47426c70317', 'ind_a061d47426c70317', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a061d47426c70317', 'prof_a061d47426c70317',
  'Member, Borno State House of Assembly (HAWUL)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a061d47426c70317', 'ind_a061d47426c70317', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a061d47426c70317', 'ind_a061d47426c70317', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a061d47426c70317', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|hawul|2023',
  'insert', 'ind_a061d47426c70317',
  'Unique: Borno Hawul seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a061d47426c70317', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_a061d47426c70317', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a061d47426c70317', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_hawul',
  'ind_a061d47426c70317', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a061d47426c70317', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Hawul', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a061d47426c70317', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_a061d47426c70317',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a061d47426c70317', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_a061d47426c70317',
  'political_assignment', '{"constituency_inec": "HAWUL", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a061d47426c70317', 'prof_a061d47426c70317',
  'Ibrahim Mohammed',
  'ibrahim mohammed borno state assembly hawul apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Abba Kolo Abba Kyari -- Jere (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0db5662f4bbffaa1', 'Abba Kolo Abba Kyari',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0db5662f4bbffaa1', 'ind_0db5662f4bbffaa1', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abba Kolo Abba Kyari', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0db5662f4bbffaa1', 'prof_0db5662f4bbffaa1',
  'Member, Borno State House of Assembly (JERE)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0db5662f4bbffaa1', 'ind_0db5662f4bbffaa1', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0db5662f4bbffaa1', 'ind_0db5662f4bbffaa1', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0db5662f4bbffaa1', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|jere|2023',
  'insert', 'ind_0db5662f4bbffaa1',
  'Unique: Borno Jere seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0db5662f4bbffaa1', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_0db5662f4bbffaa1', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0db5662f4bbffaa1', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_jere',
  'ind_0db5662f4bbffaa1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0db5662f4bbffaa1', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Jere', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0db5662f4bbffaa1', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_0db5662f4bbffaa1',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0db5662f4bbffaa1', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_0db5662f4bbffaa1',
  'political_assignment', '{"constituency_inec": "JERE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0db5662f4bbffaa1', 'prof_0db5662f4bbffaa1',
  'Abba Kolo Abba Kyari',
  'abba kolo abba kyari borno state assembly jere apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Alibe Mustapha -- Kaga (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7d0a04d44e98dd02', 'Alibe Mustapha',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7d0a04d44e98dd02', 'ind_7d0a04d44e98dd02', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Alibe Mustapha', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7d0a04d44e98dd02', 'prof_7d0a04d44e98dd02',
  'Member, Borno State House of Assembly (KAGA)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7d0a04d44e98dd02', 'ind_7d0a04d44e98dd02', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7d0a04d44e98dd02', 'ind_7d0a04d44e98dd02', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7d0a04d44e98dd02', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|kaga|2023',
  'insert', 'ind_7d0a04d44e98dd02',
  'Unique: Borno Kaga seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7d0a04d44e98dd02', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_7d0a04d44e98dd02', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7d0a04d44e98dd02', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_kaga',
  'ind_7d0a04d44e98dd02', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7d0a04d44e98dd02', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Kaga', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7d0a04d44e98dd02', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_7d0a04d44e98dd02',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7d0a04d44e98dd02', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_7d0a04d44e98dd02',
  'political_assignment', '{"constituency_inec": "KAGA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7d0a04d44e98dd02', 'prof_7d0a04d44e98dd02',
  'Alibe Mustapha',
  'alibe mustapha borno state assembly kaga apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Modu Baba Ali -- Mafa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ab42691ed78acca1', 'Modu Baba Ali',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ab42691ed78acca1', 'ind_ab42691ed78acca1', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Modu Baba Ali', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ab42691ed78acca1', 'prof_ab42691ed78acca1',
  'Member, Borno State House of Assembly (MAFA)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ab42691ed78acca1', 'ind_ab42691ed78acca1', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ab42691ed78acca1', 'ind_ab42691ed78acca1', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ab42691ed78acca1', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|mafa|2023',
  'insert', 'ind_ab42691ed78acca1',
  'Unique: Borno Mafa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ab42691ed78acca1', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_ab42691ed78acca1', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ab42691ed78acca1', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_mafa',
  'ind_ab42691ed78acca1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ab42691ed78acca1', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Mafa', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ab42691ed78acca1', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_ab42691ed78acca1',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ab42691ed78acca1', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_ab42691ed78acca1',
  'political_assignment', '{"constituency_inec": "MAFA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ab42691ed78acca1', 'prof_ab42691ed78acca1',
  'Modu Baba Ali',
  'modu baba ali borno state assembly mafa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Mustapha Audu -- Magumeri (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c4cfde09bcd8ab96', 'Mustapha Audu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c4cfde09bcd8ab96', 'ind_c4cfde09bcd8ab96', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mustapha Audu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c4cfde09bcd8ab96', 'prof_c4cfde09bcd8ab96',
  'Member, Borno State House of Assembly (MAGUMERI)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c4cfde09bcd8ab96', 'ind_c4cfde09bcd8ab96', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c4cfde09bcd8ab96', 'ind_c4cfde09bcd8ab96', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c4cfde09bcd8ab96', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|magumeri|2023',
  'insert', 'ind_c4cfde09bcd8ab96',
  'Unique: Borno Magumeri seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c4cfde09bcd8ab96', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_c4cfde09bcd8ab96', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c4cfde09bcd8ab96', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_magumeri',
  'ind_c4cfde09bcd8ab96', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c4cfde09bcd8ab96', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Magumeri', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c4cfde09bcd8ab96', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_c4cfde09bcd8ab96',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c4cfde09bcd8ab96', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_c4cfde09bcd8ab96',
  'political_assignment', '{"constituency_inec": "MAGUMERI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c4cfde09bcd8ab96', 'prof_c4cfde09bcd8ab96',
  'Mustapha Audu',
  'mustapha audu borno state assembly magumeri apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Kotoko Alhaji Ali -- Maiduguri MC (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f8f398d04c4453a0', 'Kotoko Alhaji Ali',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f8f398d04c4453a0', 'ind_f8f398d04c4453a0', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kotoko Alhaji Ali', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f8f398d04c4453a0', 'prof_f8f398d04c4453a0',
  'Member, Borno State House of Assembly (MAIDUGURI MC)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f8f398d04c4453a0', 'ind_f8f398d04c4453a0', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f8f398d04c4453a0', 'ind_f8f398d04c4453a0', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f8f398d04c4453a0', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|maiduguri mc|2023',
  'insert', 'ind_f8f398d04c4453a0',
  'Unique: Borno Maiduguri MC seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f8f398d04c4453a0', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_f8f398d04c4453a0', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f8f398d04c4453a0', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_maiduguri_mc',
  'ind_f8f398d04c4453a0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f8f398d04c4453a0', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Maiduguri MC', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f8f398d04c4453a0', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_f8f398d04c4453a0',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f8f398d04c4453a0', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_f8f398d04c4453a0',
  'political_assignment', '{"constituency_inec": "MAIDUGURI MC", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f8f398d04c4453a0', 'prof_f8f398d04c4453a0',
  'Kotoko Alhaji Ali',
  'kotoko alhaji ali borno state assembly maiduguri mc apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Gambomi Mohammed Marte -- Marte (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_17ac8cb24cd88baf', 'Gambomi Mohammed Marte',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_17ac8cb24cd88baf', 'ind_17ac8cb24cd88baf', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Gambomi Mohammed Marte', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_17ac8cb24cd88baf', 'prof_17ac8cb24cd88baf',
  'Member, Borno State House of Assembly (MARTE)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_17ac8cb24cd88baf', 'ind_17ac8cb24cd88baf', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_17ac8cb24cd88baf', 'ind_17ac8cb24cd88baf', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_17ac8cb24cd88baf', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|marte|2023',
  'insert', 'ind_17ac8cb24cd88baf',
  'Unique: Borno Marte seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_17ac8cb24cd88baf', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_17ac8cb24cd88baf', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_17ac8cb24cd88baf', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_marte',
  'ind_17ac8cb24cd88baf', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_17ac8cb24cd88baf', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Marte', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_17ac8cb24cd88baf', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_17ac8cb24cd88baf',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_17ac8cb24cd88baf', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_17ac8cb24cd88baf',
  'political_assignment', '{"constituency_inec": "MARTE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_17ac8cb24cd88baf', 'prof_17ac8cb24cd88baf',
  'Gambomi Mohammed Marte',
  'gambomi mohammed marte borno state assembly marte apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Moruma Usman Lawan -- Mobbar (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c9f17babdf0038fa', 'Moruma Usman Lawan',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c9f17babdf0038fa', 'ind_c9f17babdf0038fa', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Moruma Usman Lawan', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c9f17babdf0038fa', 'prof_c9f17babdf0038fa',
  'Member, Borno State House of Assembly (MOBBAR)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c9f17babdf0038fa', 'ind_c9f17babdf0038fa', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c9f17babdf0038fa', 'ind_c9f17babdf0038fa', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c9f17babdf0038fa', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|mobbar|2023',
  'insert', 'ind_c9f17babdf0038fa',
  'Unique: Borno Mobbar seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c9f17babdf0038fa', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_c9f17babdf0038fa', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c9f17babdf0038fa', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_mobbar',
  'ind_c9f17babdf0038fa', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c9f17babdf0038fa', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Mobbar', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c9f17babdf0038fa', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_c9f17babdf0038fa',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c9f17babdf0038fa', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_c9f17babdf0038fa',
  'political_assignment', '{"constituency_inec": "MOBBAR", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c9f17babdf0038fa', 'prof_c9f17babdf0038fa',
  'Moruma Usman Lawan',
  'moruma usman lawan borno state assembly mobbar apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Abatcha Alhaji Bukar -- Ngala (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4dd30d2e07bd9944', 'Abatcha Alhaji Bukar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4dd30d2e07bd9944', 'ind_4dd30d2e07bd9944', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abatcha Alhaji Bukar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4dd30d2e07bd9944', 'prof_4dd30d2e07bd9944',
  'Member, Borno State House of Assembly (NGALA)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4dd30d2e07bd9944', 'ind_4dd30d2e07bd9944', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4dd30d2e07bd9944', 'ind_4dd30d2e07bd9944', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4dd30d2e07bd9944', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|ngala|2023',
  'insert', 'ind_4dd30d2e07bd9944',
  'Unique: Borno Ngala seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4dd30d2e07bd9944', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_4dd30d2e07bd9944', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4dd30d2e07bd9944', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_ngala',
  'ind_4dd30d2e07bd9944', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4dd30d2e07bd9944', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Ngala', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4dd30d2e07bd9944', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_4dd30d2e07bd9944',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4dd30d2e07bd9944', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_4dd30d2e07bd9944',
  'political_assignment', '{"constituency_inec": "NGALA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4dd30d2e07bd9944', 'prof_4dd30d2e07bd9944',
  'Abatcha Alhaji Bukar',
  'abatcha alhaji bukar borno state assembly ngala apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Ali Gajiram Mohammed -- Nganzai (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5da328f8f6d685f7', 'Ali Gajiram Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5da328f8f6d685f7', 'ind_5da328f8f6d685f7', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ali Gajiram Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5da328f8f6d685f7', 'prof_5da328f8f6d685f7',
  'Member, Borno State House of Assembly (NGANZAI)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5da328f8f6d685f7', 'ind_5da328f8f6d685f7', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5da328f8f6d685f7', 'ind_5da328f8f6d685f7', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5da328f8f6d685f7', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|nganzai|2023',
  'insert', 'ind_5da328f8f6d685f7',
  'Unique: Borno Nganzai seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5da328f8f6d685f7', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_5da328f8f6d685f7', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5da328f8f6d685f7', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_nganzai',
  'ind_5da328f8f6d685f7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5da328f8f6d685f7', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Nganzai', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5da328f8f6d685f7', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_5da328f8f6d685f7',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5da328f8f6d685f7', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_5da328f8f6d685f7',
  'political_assignment', '{"constituency_inec": "NGANZAI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5da328f8f6d685f7', 'prof_5da328f8f6d685f7',
  'Ali Gajiram Mohammed',
  'ali gajiram mohammed borno state assembly nganzai apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Inuwa Ibrahim Musa -- Shani (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_898d256f0dcc2f3a', 'Inuwa Ibrahim Musa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_898d256f0dcc2f3a', 'ind_898d256f0dcc2f3a', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Inuwa Ibrahim Musa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_898d256f0dcc2f3a', 'prof_898d256f0dcc2f3a',
  'Member, Borno State House of Assembly (SHANI)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_898d256f0dcc2f3a', 'ind_898d256f0dcc2f3a', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_898d256f0dcc2f3a', 'ind_898d256f0dcc2f3a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_898d256f0dcc2f3a', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|shani|2023',
  'insert', 'ind_898d256f0dcc2f3a',
  'Unique: Borno Shani seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_898d256f0dcc2f3a', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_898d256f0dcc2f3a', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_898d256f0dcc2f3a', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_shani',
  'ind_898d256f0dcc2f3a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_898d256f0dcc2f3a', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Shani', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_898d256f0dcc2f3a', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_898d256f0dcc2f3a',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_898d256f0dcc2f3a', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_898d256f0dcc2f3a',
  'political_assignment', '{"constituency_inec": "SHANI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_898d256f0dcc2f3a', 'prof_898d256f0dcc2f3a',
  'Inuwa Ibrahim Musa',
  'inuwa ibrahim musa borno state assembly shani apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Garbu Maina -- Monguno (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4c5e4cd6b4c75407', 'Garbu Maina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4c5e4cd6b4c75407', 'ind_4c5e4cd6b4c75407', 'individual', 'place_state_borno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Garbu Maina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4c5e4cd6b4c75407', 'prof_4c5e4cd6b4c75407',
  'Member, Borno State House of Assembly (MONGUNO)',
  'place_state_borno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4c5e4cd6b4c75407', 'ind_4c5e4cd6b4c75407', 'term_ng_borno_state_assembly_10th_2023_2027',
  'place_state_borno', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4c5e4cd6b4c75407', 'ind_4c5e4cd6b4c75407', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4c5e4cd6b4c75407', 'seed_run_s05_political_borno_roster_20260502', 'individual',
  'ng_state_assembly_member|borno|monguno|2023',
  'insert', 'ind_4c5e4cd6b4c75407',
  'Unique: Borno Monguno seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4c5e4cd6b4c75407', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_4c5e4cd6b4c75407', 'seed_source_nigerianleaders_borno_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4c5e4cd6b4c75407', 'seed_run_s05_political_borno_roster_20260502', 'seed_source_nigerianleaders_borno_assembly_20260502',
  'nl_borno_assembly_2023_monguno',
  'ind_4c5e4cd6b4c75407', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4c5e4cd6b4c75407', 'seed_run_s05_political_borno_roster_20260502',
  'Borno Monguno', 'place_state_borno', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4c5e4cd6b4c75407', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_4c5e4cd6b4c75407',
  'seed_source_nigerianleaders_borno_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4c5e4cd6b4c75407', 'seed_run_s05_political_borno_roster_20260502', 'individual', 'ind_4c5e4cd6b4c75407',
  'political_assignment', '{"constituency_inec": "MONGUNO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/borno-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4c5e4cd6b4c75407', 'prof_4c5e4cd6b4c75407',
  'Garbu Maina',
  'garbu maina borno state assembly monguno apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_borno',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
