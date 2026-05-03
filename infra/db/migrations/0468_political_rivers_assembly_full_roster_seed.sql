-- ============================================================
-- Migration 0468: Rivers State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders – Complete List of Rivers State House of Assembly Members
-- Members seeded: 32/32
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_rivers_assembly_20260502',
  'NigerianLeaders – Complete List of Rivers State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/rivers-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_rivers_roster_20260502', 'S05 Batch 8b – Rivers State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_rivers_roster_20260502',
  'seed_run_s05_political_rivers_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0468_political_rivers_assembly_full_roster_seed.sql',
  NULL, 32,
  '32/32 members seeded; constituency place IDs resolved at state level pending full constituency seed');

-- Term already seeded in 0465 (INSERT OR IGNORE is safe)
INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_rivers_state_assembly_10th_2023_2027',
  'Rivers State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_rivers',
  '2023-06-05', '2027-06-04',
  unixepoch(), unixepoch()
);

-- ── Members (32 of 32 seats) ──────────────────────────────────────

-- 01. John Dominic Iderima -- Abua/Odual (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_dc3e5fd8da553043', 'John Dominic Iderima',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_dc3e5fd8da553043', 'ind_dc3e5fd8da553043', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'John Dominic Iderima', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_dc3e5fd8da553043', 'prof_dc3e5fd8da553043',
  'Member, Rivers State House of Assembly (ABUA/ODUAL)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_dc3e5fd8da553043', 'ind_dc3e5fd8da553043', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_dc3e5fd8da553043', 'ind_dc3e5fd8da553043', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_dc3e5fd8da553043', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|abua_odual|2023',
  'insert', 'ind_dc3e5fd8da553043',
  'Unique: Rivers Abua/Odual seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_dc3e5fd8da553043', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_dc3e5fd8da553043', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_dc3e5fd8da553043', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_abua_odual',
  'ind_dc3e5fd8da553043', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_dc3e5fd8da553043', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Abua/Odual', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_dc3e5fd8da553043', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_dc3e5fd8da553043',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_dc3e5fd8da553043', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_dc3e5fd8da553043',
  'political_assignment', '{"constituency_inec": "ABUA/ODUAL", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_dc3e5fd8da553043', 'prof_dc3e5fd8da553043',
  'John Dominic Iderima',
  'john dominic iderima rivers state assembly abua_odual pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Kpasa George -- Ahoada East I (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2e1bd9f1a4a1c1e8', 'Kpasa George',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2e1bd9f1a4a1c1e8', 'ind_2e1bd9f1a4a1c1e8', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kpasa George', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2e1bd9f1a4a1c1e8', 'prof_2e1bd9f1a4a1c1e8',
  'Member, Rivers State House of Assembly (AHOADA EAST I)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2e1bd9f1a4a1c1e8', 'ind_2e1bd9f1a4a1c1e8', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2e1bd9f1a4a1c1e8', 'ind_2e1bd9f1a4a1c1e8', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2e1bd9f1a4a1c1e8', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|ahoada_east_i|2023',
  'insert', 'ind_2e1bd9f1a4a1c1e8',
  'Unique: Rivers Ahoada East I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2e1bd9f1a4a1c1e8', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_2e1bd9f1a4a1c1e8', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2e1bd9f1a4a1c1e8', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_ahoada_east_i',
  'ind_2e1bd9f1a4a1c1e8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2e1bd9f1a4a1c1e8', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Ahoada East I', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2e1bd9f1a4a1c1e8', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_2e1bd9f1a4a1c1e8',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2e1bd9f1a4a1c1e8', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_2e1bd9f1a4a1c1e8',
  'political_assignment', '{"constituency_inec": "AHOADA EAST I", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2e1bd9f1a4a1c1e8', 'prof_2e1bd9f1a4a1c1e8',
  'Kpasa George',
  'kpasa george rivers state assembly ahoada_east_i a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Ehie Ogerenye Edison -- Ahoada East II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6a9b81bc79defead', 'Ehie Ogerenye Edison',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6a9b81bc79defead', 'ind_6a9b81bc79defead', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ehie Ogerenye Edison', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6a9b81bc79defead', 'prof_6a9b81bc79defead',
  'Member, Rivers State House of Assembly (AHOADA EAST II)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6a9b81bc79defead', 'ind_6a9b81bc79defead', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6a9b81bc79defead', 'ind_6a9b81bc79defead', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6a9b81bc79defead', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|ahoada_east_ii|2023',
  'insert', 'ind_6a9b81bc79defead',
  'Unique: Rivers Ahoada East II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6a9b81bc79defead', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_6a9b81bc79defead', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6a9b81bc79defead', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_ahoada_east_ii',
  'ind_6a9b81bc79defead', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6a9b81bc79defead', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Ahoada East II', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6a9b81bc79defead', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_6a9b81bc79defead',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6a9b81bc79defead', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_6a9b81bc79defead',
  'political_assignment', '{"constituency_inec": "AHOADA EAST II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6a9b81bc79defead', 'prof_6a9b81bc79defead',
  'Ehie Ogerenye Edison',
  'ehie ogerenye edison rivers state assembly ahoada_east_ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Iyalla Lemuel Ezekiel -- Ahoada West (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b17056e9cfb8729b', 'Iyalla Lemuel Ezekiel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b17056e9cfb8729b', 'ind_b17056e9cfb8729b', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Iyalla Lemuel Ezekiel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b17056e9cfb8729b', 'prof_b17056e9cfb8729b',
  'Member, Rivers State House of Assembly (AHOADA WEST)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b17056e9cfb8729b', 'ind_b17056e9cfb8729b', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b17056e9cfb8729b', 'ind_b17056e9cfb8729b', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b17056e9cfb8729b', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|ahoada_west|2023',
  'insert', 'ind_b17056e9cfb8729b',
  'Unique: Rivers Ahoada West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b17056e9cfb8729b', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_b17056e9cfb8729b', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b17056e9cfb8729b', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_ahoada_west',
  'ind_b17056e9cfb8729b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b17056e9cfb8729b', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Ahoada West', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b17056e9cfb8729b', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_b17056e9cfb8729b',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b17056e9cfb8729b', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_b17056e9cfb8729b',
  'political_assignment', '{"constituency_inec": "AHOADA WEST", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b17056e9cfb8729b', 'prof_b17056e9cfb8729b',
  'Iyalla Lemuel Ezekiel',
  'iyalla lemuel ezekiel rivers state assembly ahoada_west a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Jack Major M -- Andoni I (PDP) - Leader of the House
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0864f9c0206d624d', 'Jack Major M',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0864f9c0206d624d', 'ind_0864f9c0206d624d', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jack Major M', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0864f9c0206d624d', 'prof_0864f9c0206d624d',
  'Member (Leader of the House), Rivers State House of Assembly (ANDONI I)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0864f9c0206d624d', 'ind_0864f9c0206d624d', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0864f9c0206d624d', 'ind_0864f9c0206d624d', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0864f9c0206d624d', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|andoni_i|2023',
  'insert', 'ind_0864f9c0206d624d',
  'Unique: Rivers Andoni I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0864f9c0206d624d', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_0864f9c0206d624d', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0864f9c0206d624d', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_andoni_i',
  'ind_0864f9c0206d624d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0864f9c0206d624d', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Andoni I', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0864f9c0206d624d', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_0864f9c0206d624d',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0864f9c0206d624d', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_0864f9c0206d624d',
  'political_assignment', '{"constituency_inec": "ANDONI I", "party_abbrev": "PDP", "position": "Leader of the House", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0864f9c0206d624d', 'prof_0864f9c0206d624d',
  'Jack Major M',
  'jack major m rivers state assembly andoni_i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Amachree Jerry Thom -- Asari-Toru I (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_42f7557dd734dba4', 'Amachree Jerry Thom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_42f7557dd734dba4', 'ind_42f7557dd734dba4', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Amachree Jerry Thom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_42f7557dd734dba4', 'prof_42f7557dd734dba4',
  'Member, Rivers State House of Assembly (ASARI-TORU I)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_42f7557dd734dba4', 'ind_42f7557dd734dba4', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_42f7557dd734dba4', 'ind_42f7557dd734dba4', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_42f7557dd734dba4', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|asari_toru_i|2023',
  'insert', 'ind_42f7557dd734dba4',
  'Unique: Rivers Asari-Toru I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_42f7557dd734dba4', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_42f7557dd734dba4', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_42f7557dd734dba4', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_asari_toru_i',
  'ind_42f7557dd734dba4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_42f7557dd734dba4', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Asari-Toru I', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_42f7557dd734dba4', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_42f7557dd734dba4',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_42f7557dd734dba4', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_42f7557dd734dba4',
  'political_assignment', '{"constituency_inec": "ASARI-TORU I", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_42f7557dd734dba4', 'prof_42f7557dd734dba4',
  'Amachree Jerry Thom',
  'amachree jerry thom rivers state assembly asari_toru_i a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Opuende Lolo Isaiah -- Asari-Toru II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0a7cff65abc5c1a7', 'Opuende Lolo Isaiah',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0a7cff65abc5c1a7', 'ind_0a7cff65abc5c1a7', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Opuende Lolo Isaiah', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0a7cff65abc5c1a7', 'prof_0a7cff65abc5c1a7',
  'Member, Rivers State House of Assembly (ASARI-TORU II)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0a7cff65abc5c1a7', 'ind_0a7cff65abc5c1a7', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0a7cff65abc5c1a7', 'ind_0a7cff65abc5c1a7', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0a7cff65abc5c1a7', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|asari_toru_ii|2023',
  'insert', 'ind_0a7cff65abc5c1a7',
  'Unique: Rivers Asari-Toru II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0a7cff65abc5c1a7', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_0a7cff65abc5c1a7', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0a7cff65abc5c1a7', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_asari_toru_ii',
  'ind_0a7cff65abc5c1a7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0a7cff65abc5c1a7', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Asari-Toru II', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0a7cff65abc5c1a7', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_0a7cff65abc5c1a7',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0a7cff65abc5c1a7', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_0a7cff65abc5c1a7',
  'political_assignment', '{"constituency_inec": "ASARI-TORU II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0a7cff65abc5c1a7', 'prof_0a7cff65abc5c1a7',
  'Opuende Lolo Isaiah',
  'opuende lolo isaiah rivers state assembly asari_toru_ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Pepple Opuada Lionel -- Bonny (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ddb204f2fb8f9f17', 'Pepple Opuada Lionel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ddb204f2fb8f9f17', 'ind_ddb204f2fb8f9f17', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Pepple Opuada Lionel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ddb204f2fb8f9f17', 'prof_ddb204f2fb8f9f17',
  'Member, Rivers State House of Assembly (BONNY)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ddb204f2fb8f9f17', 'ind_ddb204f2fb8f9f17', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ddb204f2fb8f9f17', 'ind_ddb204f2fb8f9f17', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ddb204f2fb8f9f17', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|bonny|2023',
  'insert', 'ind_ddb204f2fb8f9f17',
  'Unique: Rivers Bonny seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ddb204f2fb8f9f17', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ddb204f2fb8f9f17', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ddb204f2fb8f9f17', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_bonny',
  'ind_ddb204f2fb8f9f17', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ddb204f2fb8f9f17', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Bonny', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ddb204f2fb8f9f17', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ddb204f2fb8f9f17',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ddb204f2fb8f9f17', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ddb204f2fb8f9f17',
  'political_assignment', '{"constituency_inec": "BONNY", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ddb204f2fb8f9f17', 'prof_ddb204f2fb8f9f17',
  'Pepple Opuada Lionel',
  'pepple opuada lionel rivers state assembly bonny a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 09. George Prayer Ibim -- Degema (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4011eb700d445302', 'George Prayer Ibim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4011eb700d445302', 'ind_4011eb700d445302', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'George Prayer Ibim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4011eb700d445302', 'prof_4011eb700d445302',
  'Member, Rivers State House of Assembly (DEGEMA)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4011eb700d445302', 'ind_4011eb700d445302', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4011eb700d445302', 'ind_4011eb700d445302', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4011eb700d445302', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|degema|2023',
  'insert', 'ind_4011eb700d445302',
  'Unique: Rivers Degema seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4011eb700d445302', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_4011eb700d445302', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4011eb700d445302', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_degema',
  'ind_4011eb700d445302', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4011eb700d445302', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Degema', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4011eb700d445302', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_4011eb700d445302',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4011eb700d445302', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_4011eb700d445302',
  'political_assignment', '{"constituency_inec": "DEGEMA", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4011eb700d445302', 'prof_4011eb700d445302',
  'George Prayer Ibim',
  'george prayer ibim rivers state assembly degema a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Igwe Obey Aforji -- Eleme (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7636b67b3294d4d9', 'Igwe Obey Aforji',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7636b67b3294d4d9', 'ind_7636b67b3294d4d9', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Igwe Obey Aforji', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7636b67b3294d4d9', 'prof_7636b67b3294d4d9',
  'Member, Rivers State House of Assembly (ELEME)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7636b67b3294d4d9', 'ind_7636b67b3294d4d9', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7636b67b3294d4d9', 'ind_7636b67b3294d4d9', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7636b67b3294d4d9', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|eleme|2023',
  'insert', 'ind_7636b67b3294d4d9',
  'Unique: Rivers Eleme seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7636b67b3294d4d9', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_7636b67b3294d4d9', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7636b67b3294d4d9', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_eleme',
  'ind_7636b67b3294d4d9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7636b67b3294d4d9', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Eleme', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7636b67b3294d4d9', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_7636b67b3294d4d9',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7636b67b3294d4d9', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_7636b67b3294d4d9',
  'political_assignment', '{"constituency_inec": "ELEME", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7636b67b3294d4d9', 'prof_7636b67b3294d4d9',
  'Igwe Obey Aforji',
  'igwe obey aforji rivers state assembly eleme pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Emeji Justina -- Emohua (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0e781559f6b5be15', 'Emeji Justina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0e781559f6b5be15', 'ind_0e781559f6b5be15', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Emeji Justina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0e781559f6b5be15', 'prof_0e781559f6b5be15',
  'Member, Rivers State House of Assembly (EMOHUA)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0e781559f6b5be15', 'ind_0e781559f6b5be15', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0e781559f6b5be15', 'ind_0e781559f6b5be15', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0e781559f6b5be15', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|emohua|2023',
  'insert', 'ind_0e781559f6b5be15',
  'Unique: Rivers Emohua seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0e781559f6b5be15', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_0e781559f6b5be15', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0e781559f6b5be15', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_emohua',
  'ind_0e781559f6b5be15', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0e781559f6b5be15', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Emohua', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0e781559f6b5be15', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_0e781559f6b5be15',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0e781559f6b5be15', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_0e781559f6b5be15',
  'political_assignment', '{"constituency_inec": "EMOHUA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0e781559f6b5be15', 'prof_0e781559f6b5be15',
  'Emeji Justina',
  'emeji justina rivers state assembly emohua pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Dike Chinaka Emmanuel -- Etche I (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d94773e59c541c7a', 'Dike Chinaka Emmanuel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d94773e59c541c7a', 'ind_d94773e59c541c7a', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dike Chinaka Emmanuel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d94773e59c541c7a', 'prof_d94773e59c541c7a',
  'Member, Rivers State House of Assembly (ETCHE I)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d94773e59c541c7a', 'ind_d94773e59c541c7a', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d94773e59c541c7a', 'ind_d94773e59c541c7a', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d94773e59c541c7a', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|etche_i|2023',
  'insert', 'ind_d94773e59c541c7a',
  'Unique: Rivers Etche I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d94773e59c541c7a', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_d94773e59c541c7a', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d94773e59c541c7a', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_etche_i',
  'ind_d94773e59c541c7a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d94773e59c541c7a', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Etche I', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d94773e59c541c7a', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_d94773e59c541c7a',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d94773e59c541c7a', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_d94773e59c541c7a',
  'political_assignment', '{"constituency_inec": "ETCHE I", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d94773e59c541c7a', 'prof_d94773e59c541c7a',
  'Dike Chinaka Emmanuel',
  'dike chinaka emmanuel rivers state assembly etche_i a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 13. George Enemi Alabo -- Etche II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ec90b5b29dbde727', 'George Enemi Alabo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ec90b5b29dbde727', 'ind_ec90b5b29dbde727', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'George Enemi Alabo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ec90b5b29dbde727', 'prof_ec90b5b29dbde727',
  'Member, Rivers State House of Assembly (ETCHE II)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ec90b5b29dbde727', 'ind_ec90b5b29dbde727', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ec90b5b29dbde727', 'ind_ec90b5b29dbde727', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ec90b5b29dbde727', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|etche_ii|2023',
  'insert', 'ind_ec90b5b29dbde727',
  'Unique: Rivers Etche II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ec90b5b29dbde727', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ec90b5b29dbde727', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ec90b5b29dbde727', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_etche_ii',
  'ind_ec90b5b29dbde727', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ec90b5b29dbde727', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Etche II', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ec90b5b29dbde727', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ec90b5b29dbde727',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ec90b5b29dbde727', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ec90b5b29dbde727',
  'political_assignment', '{"constituency_inec": "ETCHE II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ec90b5b29dbde727', 'prof_ec90b5b29dbde727',
  'George Enemi Alabo',
  'george enemi alabo rivers state assembly etche_ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Maol Dumle -- Gokana (PDP) - Deputy Speaker
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_20e9929ed38e289d', 'Maol Dumle',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_20e9929ed38e289d', 'ind_20e9929ed38e289d', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Maol Dumle', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_20e9929ed38e289d', 'prof_20e9929ed38e289d',
  'Member (Deputy Speaker), Rivers State House of Assembly (GOKANA)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_20e9929ed38e289d', 'ind_20e9929ed38e289d', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_20e9929ed38e289d', 'ind_20e9929ed38e289d', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_20e9929ed38e289d', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|gokana|2023',
  'insert', 'ind_20e9929ed38e289d',
  'Unique: Rivers Gokana seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_20e9929ed38e289d', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_20e9929ed38e289d', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_20e9929ed38e289d', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_gokana',
  'ind_20e9929ed38e289d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_20e9929ed38e289d', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Gokana', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_20e9929ed38e289d', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_20e9929ed38e289d',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_20e9929ed38e289d', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_20e9929ed38e289d',
  'political_assignment', '{"constituency_inec": "GOKANA", "party_abbrev": "PDP", "position": "Deputy Speaker", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_20e9929ed38e289d', 'prof_20e9929ed38e289d',
  'Maol Dumle',
  'maol dumle rivers state assembly gokana pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Nwonodi Maxwell Chukwudi -- Ikwere I (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ff9cdd4359cddabb', 'Nwonodi Maxwell Chukwudi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ff9cdd4359cddabb', 'ind_ff9cdd4359cddabb', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwonodi Maxwell Chukwudi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ff9cdd4359cddabb', 'prof_ff9cdd4359cddabb',
  'Member, Rivers State House of Assembly (IKWERE I)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ff9cdd4359cddabb', 'ind_ff9cdd4359cddabb', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ff9cdd4359cddabb', 'ind_ff9cdd4359cddabb', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ff9cdd4359cddabb', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|ikwere_i|2023',
  'insert', 'ind_ff9cdd4359cddabb',
  'Unique: Rivers Ikwere I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ff9cdd4359cddabb', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ff9cdd4359cddabb', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ff9cdd4359cddabb', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_ikwere_i',
  'ind_ff9cdd4359cddabb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ff9cdd4359cddabb', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Ikwere I', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ff9cdd4359cddabb', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ff9cdd4359cddabb',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ff9cdd4359cddabb', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ff9cdd4359cddabb',
  'political_assignment', '{"constituency_inec": "IKWERE I", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ff9cdd4359cddabb', 'prof_ff9cdd4359cddabb',
  'Nwonodi Maxwell Chukwudi',
  'nwonodi maxwell chukwudi rivers state assembly ikwere_i a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Choko Chioma -- Ikwere II (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_601ee45da90ed259', 'Choko Chioma',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_601ee45da90ed259', 'ind_601ee45da90ed259', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Choko Chioma', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_601ee45da90ed259', 'prof_601ee45da90ed259',
  'Member, Rivers State House of Assembly (IKWERE II)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_601ee45da90ed259', 'ind_601ee45da90ed259', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_601ee45da90ed259', 'ind_601ee45da90ed259', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_601ee45da90ed259', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|ikwere_ii|2023',
  'insert', 'ind_601ee45da90ed259',
  'Unique: Rivers Ikwere II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_601ee45da90ed259', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_601ee45da90ed259', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_601ee45da90ed259', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_ikwere_ii',
  'ind_601ee45da90ed259', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_601ee45da90ed259', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Ikwere II', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_601ee45da90ed259', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_601ee45da90ed259',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_601ee45da90ed259', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_601ee45da90ed259',
  'political_assignment', '{"constituency_inec": "IKWERE II", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_601ee45da90ed259', 'prof_601ee45da90ed259',
  'Choko Chioma',
  'choko chioma rivers state assembly ikwere_ii a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Emmanuel Nule Ben -- Khana I (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6cfa65c171b4ee83', 'Emmanuel Nule Ben',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6cfa65c171b4ee83', 'ind_6cfa65c171b4ee83', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Emmanuel Nule Ben', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6cfa65c171b4ee83', 'prof_6cfa65c171b4ee83',
  'Member, Rivers State House of Assembly (KHANA I)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6cfa65c171b4ee83', 'ind_6cfa65c171b4ee83', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6cfa65c171b4ee83', 'ind_6cfa65c171b4ee83', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6cfa65c171b4ee83', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|khana_i|2023',
  'insert', 'ind_6cfa65c171b4ee83',
  'Unique: Rivers Khana I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6cfa65c171b4ee83', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_6cfa65c171b4ee83', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6cfa65c171b4ee83', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_khana_i',
  'ind_6cfa65c171b4ee83', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6cfa65c171b4ee83', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Khana I', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6cfa65c171b4ee83', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_6cfa65c171b4ee83',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6cfa65c171b4ee83', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_6cfa65c171b4ee83',
  'political_assignment', '{"constituency_inec": "KHANA I", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6cfa65c171b4ee83', 'prof_6cfa65c171b4ee83',
  'Emmanuel Nule Ben',
  'emmanuel nule ben rivers state assembly khana_i a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Nwibakpo Rufus Leera -- Khana II (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3e9feb65f8f5057c', 'Nwibakpo Rufus Leera',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3e9feb65f8f5057c', 'ind_3e9feb65f8f5057c', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nwibakpo Rufus Leera', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3e9feb65f8f5057c', 'prof_3e9feb65f8f5057c',
  'Member, Rivers State House of Assembly (KHANA II)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3e9feb65f8f5057c', 'ind_3e9feb65f8f5057c', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3e9feb65f8f5057c', 'ind_3e9feb65f8f5057c', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3e9feb65f8f5057c', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|khana_ii|2023',
  'insert', 'ind_3e9feb65f8f5057c',
  'Unique: Rivers Khana II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3e9feb65f8f5057c', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_3e9feb65f8f5057c', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3e9feb65f8f5057c', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_khana_ii',
  'ind_3e9feb65f8f5057c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3e9feb65f8f5057c', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Khana II', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3e9feb65f8f5057c', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_3e9feb65f8f5057c',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3e9feb65f8f5057c', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_3e9feb65f8f5057c',
  'political_assignment', '{"constituency_inec": "KHANA II", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3e9feb65f8f5057c', 'prof_3e9feb65f8f5057c',
  'Nwibakpo Rufus Leera',
  'nwibakpo rufus leera rivers state assembly khana_ii a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Amaewhule Martin Chike -- Obio/Akpor I (PDP) - Speaker
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d679a26509581401', 'Amaewhule Martin Chike',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d679a26509581401', 'ind_d679a26509581401', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Amaewhule Martin Chike', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d679a26509581401', 'prof_d679a26509581401',
  'Member (Speaker), Rivers State House of Assembly (OBIO/AKPOR I)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d679a26509581401', 'ind_d679a26509581401', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d679a26509581401', 'ind_d679a26509581401', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d679a26509581401', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|obio_akpor_i|2023',
  'insert', 'ind_d679a26509581401',
  'Unique: Rivers Obio/Akpor I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d679a26509581401', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_d679a26509581401', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d679a26509581401', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_obio_akpor_i',
  'ind_d679a26509581401', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d679a26509581401', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Obio/Akpor I', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d679a26509581401', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_d679a26509581401',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d679a26509581401', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_d679a26509581401',
  'political_assignment', '{"constituency_inec": "OBIO/AKPOR I", "party_abbrev": "PDP", "position": "Speaker", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d679a26509581401', 'prof_d679a26509581401',
  'Amaewhule Martin Chike',
  'amaewhule martin chike rivers state assembly obio_akpor_i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Wali Linda Nyememe -- Obio/Akpor II (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8b2f07bca7e0a9f6', 'Wali Linda Nyememe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8b2f07bca7e0a9f6', 'ind_8b2f07bca7e0a9f6', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Wali Linda Nyememe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8b2f07bca7e0a9f6', 'prof_8b2f07bca7e0a9f6',
  'Member, Rivers State House of Assembly (OBIO/AKPOR II)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8b2f07bca7e0a9f6', 'ind_8b2f07bca7e0a9f6', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8b2f07bca7e0a9f6', 'ind_8b2f07bca7e0a9f6', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8b2f07bca7e0a9f6', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|obio_akpor_ii|2023',
  'insert', 'ind_8b2f07bca7e0a9f6',
  'Unique: Rivers Obio/Akpor II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8b2f07bca7e0a9f6', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_8b2f07bca7e0a9f6', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8b2f07bca7e0a9f6', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_obio_akpor_ii',
  'ind_8b2f07bca7e0a9f6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8b2f07bca7e0a9f6', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Obio/Akpor II', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8b2f07bca7e0a9f6', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_8b2f07bca7e0a9f6',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8b2f07bca7e0a9f6', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_8b2f07bca7e0a9f6',
  'political_assignment', '{"constituency_inec": "OBIO/AKPOR II", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8b2f07bca7e0a9f6', 'prof_8b2f07bca7e0a9f6',
  'Wali Linda Nyememe',
  'wali linda nyememe rivers state assembly obio_akpor_ii a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Ajie Henry Chinasa -- Ogba/Egbema/Ndoni I (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_324c398ed7e6e57f', 'Ajie Henry Chinasa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_324c398ed7e6e57f', 'ind_324c398ed7e6e57f', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ajie Henry Chinasa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_324c398ed7e6e57f', 'prof_324c398ed7e6e57f',
  'Member, Rivers State House of Assembly (OGBA/EGBEMA/NDONI I)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_324c398ed7e6e57f', 'ind_324c398ed7e6e57f', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_324c398ed7e6e57f', 'ind_324c398ed7e6e57f', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_324c398ed7e6e57f', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|ogba_egbema_ndoni_i|2023',
  'insert', 'ind_324c398ed7e6e57f',
  'Unique: Rivers Ogba/Egbema/Ndoni I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_324c398ed7e6e57f', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_324c398ed7e6e57f', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_324c398ed7e6e57f', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_ogba_egbema_ndoni_i',
  'ind_324c398ed7e6e57f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_324c398ed7e6e57f', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Ogba/Egbema/Ndoni I', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_324c398ed7e6e57f', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_324c398ed7e6e57f',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_324c398ed7e6e57f', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_324c398ed7e6e57f',
  'political_assignment', '{"constituency_inec": "OGBA/EGBEMA/NDONI I", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_324c398ed7e6e57f', 'prof_324c398ed7e6e57f',
  'Ajie Henry Chinasa',
  'ajie henry chinasa rivers state assembly ogba_egbema_ndoni_i a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Ogbonna Chukwudi -- Ogba/Egbema/Ndoni II (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c433ed9924f2ad36', 'Ogbonna Chukwudi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c433ed9924f2ad36', 'ind_c433ed9924f2ad36', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogbonna Chukwudi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c433ed9924f2ad36', 'prof_c433ed9924f2ad36',
  'Member, Rivers State House of Assembly (OGBA/EGBEMA/NDONI II)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c433ed9924f2ad36', 'ind_c433ed9924f2ad36', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c433ed9924f2ad36', 'ind_c433ed9924f2ad36', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c433ed9924f2ad36', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|ogba_egbema_ndoni_ii|2023',
  'insert', 'ind_c433ed9924f2ad36',
  'Unique: Rivers Ogba/Egbema/Ndoni II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c433ed9924f2ad36', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_c433ed9924f2ad36', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c433ed9924f2ad36', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_ogba_egbema_ndoni_ii',
  'ind_c433ed9924f2ad36', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c433ed9924f2ad36', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Ogba/Egbema/Ndoni II', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c433ed9924f2ad36', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_c433ed9924f2ad36',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c433ed9924f2ad36', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_c433ed9924f2ad36',
  'political_assignment', '{"constituency_inec": "OGBA/EGBEMA/NDONI II", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c433ed9924f2ad36', 'prof_c433ed9924f2ad36',
  'Ogbonna Chukwudi',
  'ogbonna chukwudi rivers state assembly ogba_egbema_ndoni_ii a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Davids Okobiriari Arnold -- Ogu/Bolo (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ecd4567d8e477235', 'Davids Okobiriari Arnold',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ecd4567d8e477235', 'ind_ecd4567d8e477235', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Davids Okobiriari Arnold', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ecd4567d8e477235', 'prof_ecd4567d8e477235',
  'Member, Rivers State House of Assembly (OGU/BOLO)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ecd4567d8e477235', 'ind_ecd4567d8e477235', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ecd4567d8e477235', 'ind_ecd4567d8e477235', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ecd4567d8e477235', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|ogu_bolo|2023',
  'insert', 'ind_ecd4567d8e477235',
  'Unique: Rivers Ogu/Bolo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ecd4567d8e477235', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ecd4567d8e477235', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ecd4567d8e477235', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_ogu_bolo',
  'ind_ecd4567d8e477235', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ecd4567d8e477235', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Ogu/Bolo', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ecd4567d8e477235', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ecd4567d8e477235',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ecd4567d8e477235', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ecd4567d8e477235',
  'political_assignment', '{"constituency_inec": "OGU/BOLO", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ecd4567d8e477235', 'prof_ecd4567d8e477235',
  'Davids Okobiriari Arnold',
  'davids okobiriari arnold rivers state assembly ogu_bolo pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Anele Christian Chinedu -- Omuma (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5e077c7357b672b2', 'Anele Christian Chinedu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5e077c7357b672b2', 'ind_5e077c7357b672b2', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Anele Christian Chinedu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5e077c7357b672b2', 'prof_5e077c7357b672b2',
  'Member, Rivers State House of Assembly (OMUMA)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5e077c7357b672b2', 'ind_5e077c7357b672b2', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5e077c7357b672b2', 'ind_5e077c7357b672b2', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5e077c7357b672b2', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|omuma|2023',
  'insert', 'ind_5e077c7357b672b2',
  'Unique: Rivers Omuma seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5e077c7357b672b2', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_5e077c7357b672b2', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5e077c7357b672b2', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_omuma',
  'ind_5e077c7357b672b2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5e077c7357b672b2', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Omuma', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5e077c7357b672b2', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_5e077c7357b672b2',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5e077c7357b672b2', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_5e077c7357b672b2',
  'political_assignment', '{"constituency_inec": "OMUMA", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5e077c7357b672b2', 'prof_5e077c7357b672b2',
  'Anele Christian Chinedu',
  'anele christian chinedu rivers state assembly omuma adc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Omubo-Pepple Edwell Jacob -- Opobo/Nkoro I (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5811104ba519d292', 'Omubo-Pepple Edwell Jacob',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5811104ba519d292', 'ind_5811104ba519d292', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Omubo-Pepple Edwell Jacob', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5811104ba519d292', 'prof_5811104ba519d292',
  'Member, Rivers State House of Assembly (OPOBO/NKORO I)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5811104ba519d292', 'ind_5811104ba519d292', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5811104ba519d292', 'ind_5811104ba519d292', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5811104ba519d292', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|opobo_nkoro_i|2023',
  'insert', 'ind_5811104ba519d292',
  'Unique: Rivers Opobo/Nkoro I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5811104ba519d292', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_5811104ba519d292', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5811104ba519d292', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_opobo_nkoro_i',
  'ind_5811104ba519d292', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5811104ba519d292', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Opobo/Nkoro I', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5811104ba519d292', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_5811104ba519d292',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5811104ba519d292', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_5811104ba519d292',
  'political_assignment', '{"constituency_inec": "OPOBO/NKORO I", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5811104ba519d292', 'prof_5811104ba519d292',
  'Omubo-Pepple Edwell Jacob',
  'omubo-pepple edwell jacob rivers state assembly opobo_nkoro_i aa politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 26. Ateke Ibimina -- Opobo/Nkoro II (AAC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7daf7111b5b4cc8b', 'Ateke Ibimina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7daf7111b5b4cc8b', 'ind_7daf7111b5b4cc8b', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ateke Ibimina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7daf7111b5b4cc8b', 'prof_7daf7111b5b4cc8b',
  'Member, Rivers State House of Assembly (OPOBO/NKORO II)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7daf7111b5b4cc8b', 'ind_7daf7111b5b4cc8b', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7daf7111b5b4cc8b', 'ind_7daf7111b5b4cc8b', 'org_political_party_aac', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7daf7111b5b4cc8b', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|opobo_nkoro_ii|2023',
  'insert', 'ind_7daf7111b5b4cc8b',
  'Unique: Rivers Opobo/Nkoro II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7daf7111b5b4cc8b', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_7daf7111b5b4cc8b', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7daf7111b5b4cc8b', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_opobo_nkoro_ii',
  'ind_7daf7111b5b4cc8b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7daf7111b5b4cc8b', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Opobo/Nkoro II', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7daf7111b5b4cc8b', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_7daf7111b5b4cc8b',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7daf7111b5b4cc8b', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_7daf7111b5b4cc8b',
  'political_assignment', '{"constituency_inec": "OPOBO/NKORO II", "party_abbrev": "AAC", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7daf7111b5b4cc8b', 'prof_7daf7111b5b4cc8b',
  'Ateke Ibimina',
  'ateke ibimina rivers state assembly opobo_nkoro_ii aac politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 27. Titus David Nnji -- Oyigbo (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_85878005c201ad56', 'Titus David Nnji',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_85878005c201ad56', 'ind_85878005c201ad56', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Titus David Nnji', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_85878005c201ad56', 'prof_85878005c201ad56',
  'Member, Rivers State House of Assembly (OYIGBO)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_85878005c201ad56', 'ind_85878005c201ad56', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_85878005c201ad56', 'ind_85878005c201ad56', 'org_political_party_a', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_85878005c201ad56', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|oyigbo|2023',
  'insert', 'ind_85878005c201ad56',
  'Unique: Rivers Oyigbo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_85878005c201ad56', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_85878005c201ad56', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_85878005c201ad56', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_oyigbo',
  'ind_85878005c201ad56', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_85878005c201ad56', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Oyigbo', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_85878005c201ad56', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_85878005c201ad56',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_85878005c201ad56', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_85878005c201ad56',
  'political_assignment', '{"constituency_inec": "OYIGBO", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_85878005c201ad56', 'prof_85878005c201ad56',
  'Titus David Nnji',
  'titus david nnji rivers state assembly oyigbo a politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 28. Nyeche Prince Lemchi -- Port-Harcourt I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2dd7310df07875a3', 'Nyeche Prince Lemchi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2dd7310df07875a3', 'ind_2dd7310df07875a3', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nyeche Prince Lemchi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2dd7310df07875a3', 'prof_2dd7310df07875a3',
  'Member, Rivers State House of Assembly (PORT-HARCOURT I)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2dd7310df07875a3', 'ind_2dd7310df07875a3', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2dd7310df07875a3', 'ind_2dd7310df07875a3', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2dd7310df07875a3', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|port_harcourt_i|2023',
  'insert', 'ind_2dd7310df07875a3',
  'Unique: Rivers Port-Harcourt I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2dd7310df07875a3', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_2dd7310df07875a3', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2dd7310df07875a3', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_port_harcourt_i',
  'ind_2dd7310df07875a3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2dd7310df07875a3', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Port-Harcourt I', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2dd7310df07875a3', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_2dd7310df07875a3',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2dd7310df07875a3', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_2dd7310df07875a3',
  'political_assignment', '{"constituency_inec": "PORT-HARCOURT I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2dd7310df07875a3', 'prof_2dd7310df07875a3',
  'Nyeche Prince Lemchi',
  'nyeche prince lemchi rivers state assembly port_harcourt_i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 29. Adoki Tonye Smart -- Port-Harcourt II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e702c91ae4e2a535', 'Adoki Tonye Smart',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e702c91ae4e2a535', 'ind_e702c91ae4e2a535', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adoki Tonye Smart', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e702c91ae4e2a535', 'prof_e702c91ae4e2a535',
  'Member, Rivers State House of Assembly (PORT-HARCOURT II)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e702c91ae4e2a535', 'ind_e702c91ae4e2a535', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e702c91ae4e2a535', 'ind_e702c91ae4e2a535', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e702c91ae4e2a535', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|port_harcourt_ii|2023',
  'insert', 'ind_e702c91ae4e2a535',
  'Unique: Rivers Port-Harcourt II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e702c91ae4e2a535', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_e702c91ae4e2a535', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e702c91ae4e2a535', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_port_harcourt_ii',
  'ind_e702c91ae4e2a535', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e702c91ae4e2a535', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Port-Harcourt II', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e702c91ae4e2a535', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_e702c91ae4e2a535',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e702c91ae4e2a535', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_e702c91ae4e2a535',
  'political_assignment', '{"constituency_inec": "PORT-HARCOURT II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e702c91ae4e2a535', 'prof_e702c91ae4e2a535',
  'Adoki Tonye Smart',
  'adoki tonye smart rivers state assembly port_harcourt_ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 30. Opara Azeru -- Port-Harcourt III (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ef08ae654ea508c4', 'Opara Azeru',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ef08ae654ea508c4', 'ind_ef08ae654ea508c4', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Opara Azeru', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ef08ae654ea508c4', 'prof_ef08ae654ea508c4',
  'Member, Rivers State House of Assembly (PORT-HARCOURT III)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ef08ae654ea508c4', 'ind_ef08ae654ea508c4', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ef08ae654ea508c4', 'ind_ef08ae654ea508c4', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ef08ae654ea508c4', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|port_harcourt_iii|2023',
  'insert', 'ind_ef08ae654ea508c4',
  'Unique: Rivers Port-Harcourt III seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ef08ae654ea508c4', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ef08ae654ea508c4', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ef08ae654ea508c4', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_port_harcourt_iii',
  'ind_ef08ae654ea508c4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ef08ae654ea508c4', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Port-Harcourt III', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ef08ae654ea508c4', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ef08ae654ea508c4',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ef08ae654ea508c4', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_ef08ae654ea508c4',
  'political_assignment', '{"constituency_inec": "PORT-HARCOURT III", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ef08ae654ea508c4', 'prof_ef08ae654ea508c4',
  'Opara Azeru',
  'opara azeru rivers state assembly port_harcourt_iii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 31. Wami Solomon -- Tai (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_75403523cef2e7d0', 'Wami Solomon',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_75403523cef2e7d0', 'ind_75403523cef2e7d0', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Wami Solomon', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_75403523cef2e7d0', 'prof_75403523cef2e7d0',
  'Member, Rivers State House of Assembly (TAI)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_75403523cef2e7d0', 'ind_75403523cef2e7d0', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_75403523cef2e7d0', 'ind_75403523cef2e7d0', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_75403523cef2e7d0', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|tai|2023',
  'insert', 'ind_75403523cef2e7d0',
  'Unique: Rivers Tai seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_75403523cef2e7d0', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_75403523cef2e7d0', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_75403523cef2e7d0', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_tai',
  'ind_75403523cef2e7d0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_75403523cef2e7d0', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Tai', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_75403523cef2e7d0', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_75403523cef2e7d0',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_75403523cef2e7d0', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_75403523cef2e7d0',
  'political_assignment', '{"constituency_inec": "TAI", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_75403523cef2e7d0', 'prof_75403523cef2e7d0',
  'Wami Solomon',
  'wami solomon rivers state assembly tai pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 32. Opuende Lolo Isaiah -- Akuku-Toru (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_32261913d0d31f3b', 'Opuende Lolo Isaiah',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_32261913d0d31f3b', 'ind_32261913d0d31f3b', 'individual', 'place_state_rivers',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Opuende Lolo Isaiah', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_32261913d0d31f3b', 'prof_32261913d0d31f3b',
  'Member, Rivers State House of Assembly (AKUKU-TORU)',
  'place_state_rivers', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_32261913d0d31f3b', 'ind_32261913d0d31f3b', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_rivers', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_32261913d0d31f3b', 'ind_32261913d0d31f3b', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_32261913d0d31f3b', 'seed_run_s05_political_rivers_roster_20260502', 'individual',
  'ng_state_assembly_member|rivers|akuku_toru|2023',
  'insert', 'ind_32261913d0d31f3b',
  'Unique: Rivers Akuku-Toru seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_32261913d0d31f3b', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_32261913d0d31f3b', 'seed_source_nigerianleaders_rivers_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_32261913d0d31f3b', 'seed_run_s05_political_rivers_roster_20260502', 'seed_source_nigerianleaders_rivers_assembly_20260502',
  'nl_rivers_assembly_2023_akuku_toru',
  'ind_32261913d0d31f3b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_32261913d0d31f3b', 'seed_run_s05_political_rivers_roster_20260502',
  'Rivers Akuku-Toru', 'place_state_rivers', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_32261913d0d31f3b', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_32261913d0d31f3b',
  'seed_source_nigerianleaders_rivers_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_32261913d0d31f3b', 'seed_run_s05_political_rivers_roster_20260502', 'individual', 'ind_32261913d0d31f3b',
  'political_assignment', '{"constituency_inec": "AKUKU-TORU", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/rivers-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_32261913d0d31f3b', 'prof_32261913d0d31f3b',
  'Opuende Lolo Isaiah',
  'opuende lolo isaiah rivers state assembly akuku_toru pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers',
  'political',
  unixepoch(), unixepoch()
);

-- 32 members inserted for Rivers State House of Assembly
-- Migration 0468 complete
