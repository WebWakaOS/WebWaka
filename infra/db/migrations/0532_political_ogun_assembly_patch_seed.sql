-- ============================================================
-- Migration 0532: Ogun State House of Assembly — 3-Seat Patch
-- 10th Assembly 2023-2027 — Partial Roster Patch
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: Wikipedia (2019 Ogun HOSA election cross-reference) +
--         NigerianLeaders.com (2023 table, row 20 cross-validated)
-- Seats patched: 1 of 3 missing (Ado-Odo/Ota I confirmed)
-- Remaining missing: IJEBU NORTH II (ADC, name unavailable),
--                    IJEBU EAST (party/name unavailable)
-- Original migration: 0469 (23 members seeded)
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;

BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_wikipedia_ogun_assembly_patch_20260502',
  'Wikipedia + NigerianLeaders – Ogun State HOSA 3-Seat Patch (Ado-Odo/Ota I)',
  'wiki_scraped',
  'https://en.wikipedia.org/wiki/2019_Ogun_State_House_of_Assembly_election',
  'editorial_verified',
  'Ado-Odo/Ota I: Yusuf Sherif Abiodun confirmed via 2019 Wikipedia result and 2023 NigerianLeaders cross-ref. Ijebu North II (ADC) and Ijebu East names not found in accessible sources.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_ogun_roster_patch_20260502', 'S05 Batch – Ogun State Assembly 2023-2027 3-Seat Patch (Ado-Odo/Ota I)',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_ogun_patch_20260502',
  'seed_run_s05_political_ogun_roster_patch_20260502', 'normalized_roster',
  'infra/db/migrations/0532_political_ogun_assembly_patch_seed.sql',
  NULL, 1,
  '1/3 missing seats patched; IJEBU NORTH II (ADC) and IJEBU EAST remain unresolved pending official OGHA or INEC data');

-- Term already seeded in 0469 — no re-insert needed
-- term_ng_ogun_state_assembly_10th_2023_2027

-- ── Patched Members ──────────────────────────────────────────────

-- 01. Yusuf Sherif Abiodun -- ADO-ODO/OTA I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_676ab14982a56ff0', 'Yusuf Sherif Abiodun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_676ab14982a56ff0', 'ind_676ab14982a56ff0', 'individual', 'place_state_ogun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yusuf Sherif Abiodun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_676ab14982a56ff0', 'prof_676ab14982a56ff0',
  'Member, Ogun State House of Assembly (ADO-ODO/OTA I)',
  'place_state_ogun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_676ab14982a56ff0', 'ind_676ab14982a56ff0', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_ogun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_676ab14982a56ff0', 'ind_676ab14982a56ff0', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_676ab14982a56ff0', 'seed_run_s05_political_ogun_roster_patch_20260502', 'individual',
  'ng_state_assembly_member|ogun|ado-odo/ota i|2023',
  'insert', 'ind_676ab14982a56ff0',
  'Unique: Ogun ADO-ODO/OTA I seat 2023-2027 (patch)'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_676ab14982a56ff0', 'seed_run_s05_political_ogun_roster_patch_20260502', 'individual', 'ind_676ab14982a56ff0', 'seed_source_wikipedia_ogun_assembly_patch_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_676ab14982a56ff0', 'seed_run_s05_political_ogun_roster_patch_20260502', 'seed_source_wikipedia_ogun_assembly_patch_20260502',
  'ogun_assembly_patch_2023_ado-odo_ota_i',
  'ind_676ab14982a56ff0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_676ab14982a56ff0', 'seed_run_s05_political_ogun_roster_patch_20260502',
  'Ogun ADO-ODO/OTA I', 'place_state_ogun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_676ab14982a56ff0', 'seed_run_s05_political_ogun_roster_patch_20260502', 'individual', 'ind_676ab14982a56ff0',
  'seed_source_wikipedia_ogun_assembly_patch_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_676ab14982a56ff0', 'seed_run_s05_political_ogun_roster_patch_20260502', 'individual', 'ind_676ab14982a56ff0',
  'political_assignment', '{"constituency_inec": "ADO-ODO/OTA I", "party_abbrev": "APC", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2019_Ogun_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_676ab14982a56ff0', 'prof_676ab14982a56ff0',
  'Yusuf Sherif Abiodun',
  'yusuf sherif abiodun ogun state assembly ado-odo/ota i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun',
  'political',
  unixepoch(), unixepoch()
);


COMMIT;
