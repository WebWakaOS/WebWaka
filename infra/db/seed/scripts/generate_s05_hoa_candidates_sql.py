#!/usr/bin/env python3
"""
generate_s05_hoa_candidates_sql.py
Generates migration 0314_political_inec_hoa_candidates_seed.sql.

Source: infra/db/seed/sources/s05_inec_2023_hoa_candidates_extracted.json
        (SHA-256 7d355c400be369d07548691778f6c5295b00e1c7b1b2c8ca5706f9790d0fca27)
"""

import json, re, hashlib, sys
from pathlib import Path

# ─── paths ────────────────────────────────────────────────────────────────────
ROOT     = Path(__file__).resolve().parents[4]
JSON_IN  = ROOT / 'infra/db/seed/sources/s05_inec_2023_hoa_candidates_extracted.json'
JUR_SQL  = ROOT / 'infra/db/migrations/0303_jurisdiction_seed.sql'
OUT_A    = ROOT / 'infra/db/migrations/0314_political_inec_hoa_candidates_seed.sql'
OUT_B    = ROOT / 'apps/api/migrations/0314_political_inec_hoa_candidates_seed.sql'
OUT_C    = ROOT / 'infra/db/seed/0015_political_inec_hoa_candidates.sql'

# ─── constants ─────────────────────────────────────────────────────────────────
TENANT   = 'tenant_platform_seed'
WS       = 'workspace_platform_seed_discovery'
PDF_HASH = '2450eb0df41d1b923ca296f4aa78c2adbaccf41e87f0f88277313504beccd8ca'
JSON_HASH= '7d355c400be369d07548691778f6c5295b00e1c7b1b2c8ca5706f9790d0fca27'
ELECTION_DATE = '2023-03-18'
SEED_RUN_ID   = 'seed_run_s05_inec_hoa_candidates_20260422'
SEED_SOURCE_ID= 'seed_source_inec_hoa_candidates_pdf_2023'

PARTY_ORG = {
    'A':    'org_political_party_a',
    'AA':   'org_political_party_aa',
    'AAC':  'org_political_party_aac',
    'ADC':  'org_political_party_adc',
    'ADP':  'org_political_party_adp',
    'AGAP': 'org_political_party_agap',
    'APM':  'org_political_party_apm',
    'APP':  'org_political_party_app',
    'APC':  'org_political_party_apc',
    'APGA': 'org_political_party_apga',
    'BP':   'org_political_party_bp',
    'LP':   'org_political_party_lp',
    'NNPP': 'org_political_party_nnpp',
    'NRM':  'org_political_party_nrm',
    'PDP':  'org_political_party_pdp',
    'PRP':  'org_political_party_prp',
    'SDP':  'org_political_party_sdp',
    'YPP':  'org_political_party_ypp',
    'ZLP':  'org_political_party_zlp',
}

STATE_PLACE = {
    'ABIA':'place_state_abia','ADAMAWA':'place_state_adamawa',
    'AKWA IBOM':'place_state_akwaibom','ANAMBRA':'place_state_anambra',
    'BAUCHI':'place_state_bauchi','BAYELSA':'place_state_bayelsa',
    'BENUE':'place_state_benue','BORNO':'place_state_borno',
    'CROSS RIVER':'place_state_crossriver','DELTA':'place_state_delta',
    'EBONYI':'place_state_ebonyi','EDO':'place_state_edo',
    'EKITI':'place_state_ekiti','ENUGU':'place_state_enugu',
    'GOMBE':'place_state_gombe','IMO':'place_state_imo',
    'JIGAWA':'place_state_jigawa','KADUNA':'place_state_kaduna',
    'KANO':'place_state_kano','KATSINA':'place_state_katsina',
    'KEBBI':'place_state_kebbi','KOGI':'place_state_kogi',
    'KWARA':'place_state_kwara','LAGOS':'place_state_lagos',
    'NASARAWA':'place_state_nasarawa','NIGER':'place_state_niger',
    'OGUN':'place_state_ogun','ONDO':'place_state_ondo',
    'OSUN':'place_state_osun','OYO':'place_state_oyo',
    'PLATEAU':'place_state_plateau','RIVERS':'place_state_rivers',
    'SOKOTO':'place_state_sokoto','TARABA':'place_state_taraba',
    'YOBE':'place_state_yobe','ZAMFARA':'place_state_zamfara',
    'FCT':'place_state_fct',
}

# Known aliases (state_place, normalized_pdf_name) → jurisdiction display name
ALIASES = {
    ('place_state_abia','UGWUNAAGBO'):'UGWUNA AGBO L.G.A',
    ('place_state_benue','OJU I'):'OJU',('place_state_benue','OJU II'):'OJU',
    ('place_state_benue','MATA'):'USHONGO',('place_state_benue','MBAGWA'):'USHONGO',
    ('place_state_benue','AGASHA'):'GUMA',('place_state_benue','ADOKA/UGBOJU'):'OTUKPO',
    ('place_state_benue','OTUKPO/AKPA'):'OTUKPO NORTH EAST',
    ('place_state_bayelsa','KOLOKUMA/OPOKUMA I'):'KOLOKUMA/OPOKUMA I',
    ('place_state_bayelsa','KOLOKUMA/OPOKUMA II'):'KOLOKUMA/OPOKUMA II',
    ('place_state_ekiti','IREPODUN/IFELODUN I'):'IREPODUN/IFELODUN I',
    ('place_state_ekiti','IREPODUN/IFELODUN II'):'IREPODUN/IFELODUN II',
    ('place_state_edo','ESAN SOUTH EAST'):'ESSAN SOUTH EAST',
    ('place_state_jigawa','KAFIN HAUSA'):'K/HAUSA',
    ('place_state_jigawa','KIRI-KASAMMA'):'K/KASAMMA',
    ('place_state_jigawa','SULE-TANKARKAR'):'S/TANKARA',
    ('place_state_jigawa','RINGIM'):'RINGIN',
    ('place_state_jigawa','BALANGU'):'BULANGU',
    ('place_state_jigawa','MALLAM MADORI'):'M/MADORI',
    ('place_state_jigawa','MAIGATARI'):'MAIGATAR',
    ('place_state_kaduna','ZARIA CITY'):'CITY',
    ('place_state_kaduna','DOKA/GABASAWA'):'DOKA',
    ('place_state_kaduna','LERE WEST'):'LERE',
    ('place_state_kaduna','KAWO'):'KAWO/GABASAWA',
    ('place_state_kaduna','ZARIA KEWAYE'):'KEWAYE',
    ("place_state_kaduna","JEMA'A"):"JEMA'A",
    ('place_state_kano','KANO MUNICIPAL'):'MUNICIPAL',
    ('place_state_kano','MUNJIBIR'):'MINJIBIR',
    ('place_state_kano','TUDUN WADA'):'TUDUNWADA',
    ('place_state_kwara','SHARE/OKE-ODE'):'SHARE/OKE-ODE',
    ('place_state_kwara','OMUPO/IGBAJA'):'OMUPO',
    ('place_state_kwara','LAFIAGI/EDU'):'LAFIAGI',
    ('place_state_kwara','ODO-OGUN/OYUN'):'ODO-OGUN',
    ('place_state_kwara','ODO-OGUN'):'ODO-OGUN',
    ('place_state_kwara','OKUTA/AYASHKIRA'):'OKUTA/AYASHKIRA',
    ('place_state_kwara','ILESHA/GWANARA'):'ILESHA/GWANARA',
    ('place_state_kwara','GWANABE/ADENA/BANNI'):'GWANABE/ADENA/BANNI',
    ('place_state_kwara','ILORIN WEST'):'ILORIN SOUTH',
    ('place_state_lagos','AJEROMI/IFELODUN I'):'AJEROMI/IFELODUN I',
    ('place_state_lagos','AJEROMI/IFELODUN II'):'AJEROMI/IFELODUN II',
    ('place_state_lagos','IFAKO/IJAIYE I'):'IFAKO / IJAIYE I',
    ('place_state_lagos','IFAKO/IJAIYE II'):'IFAKO / IJAIYE II',
    ('place_state_plateau','LANGTANG SOUTH'):'LANGTANG SOUTH (MABUDI)',
    ("place_state_plateau","QUA'AN PAN NORTH"):"QUA'AN PAN NORTH",
    ("place_state_plateau","QUA'AN PAN SOUTH"):"QUA'AN PAN SOUTH",
    ('place_state_plateau','DENGI'):'WASE',
    ('place_state_rivers','OGBA/EGBEMA/NDONI'):'(OGBA/EGBEMA/NDONI) ONELGA I',
    ('place_state_sokoto','SABON BIRNI NORTH'):'SABON BIRIN NORTH',
    ('place_state_sokoto','SABON BIRNI SOUTH'):'SABON BIRIN SOUTH',
    ('place_state_zamfara','KAURA NAMODA NORTH'):'K/NAMODA NORTH',
    ('place_state_zamfara','KAURA NAMODA SOUTH'):'K/NAMODA SOUTH',
    ('place_state_zamfara','TALATA MAFARA NORTH'):'T/MAFARA NORTH',
    ('place_state_zamfara','TALATA MAFARA SOUTH'):'T/MAFARA SOUTH',
    ('place_state_delta','WARRI SOUTH- WEST'):'WARRI SOUTH-WEST',
    ('place_state_yobe','YUNUSARI I'):'YUNUSARI',
    ('place_state_yobe','YUNUSARI II'):'YUNUSARI',
    ("place_state_bauchi","JAMA'A/TORO"):"JAMA'A/TORO",
    ("place_state_bauchi","JAMA'ARE"):"JAMA'ARE",
    ('place_state_bauchi','SHIRA I'):'DISINA',
    ('place_state_bauchi','SHIRA II'):'GAMAWA',
    ('place_state_borno','BAMA I'):'BAMA',
    ('place_state_borno','BAMA II'):'GULUMBA',
    ('place_state_adamawa','NASSARAWO/BINYERI'):'NASSARAWO/BINYERI',
}

# ─── build jurisdiction lookup ─────────────────────────────────────────────────
def build_jur_lookup():
    text = JUR_SQL.read_text()
    jur_pat = re.compile(r"\('(jur_state_constituency_sc_\d+_\w+)',\s*'(place_state_constituency_sc_\d+_\w+)',\s*'state_constituency',\s*'([^']+)'")
    place_pat = re.compile(r"\('(place_state_constituency_sc_\d+_\w+)',\s*'[^']+',\s*'state_constituency',\s*4,\s*'(place_state_\w+)'")
    jurs = jur_pat.findall(text)
    places = dict(place_pat.findall(text))
    lookup = {}    # (state_place_id, name) → jur_id
    place_lookup = {}  # jur_id → constituency_place_id
    for jur_id, place_id, name in jurs:
        sp = places.get(place_id, '?')
        lookup[(sp, name)] = jur_id
        place_lookup[jur_id] = place_id
    return lookup, place_lookup

# ─── constituency resolution ───────────────────────────────────────────────────
def normalize(name):
    n = name
    n = re.sub(r'\s*\([^)]+\)\s*$', '', n).strip()      # strip (parenthetical)
    n = re.sub(r'\s+/\s+\S.*$', '', n).strip()           # strip " / DISAMBIGUATION"
    n = re.sub(r'\s+[A-Z][A-Z/]+\s+[IVX]+$', '', n).strip() if '/' in n else n  # strip trailing word+roman
    n = re.sub(r'/\s+', '/', n); n = re.sub(r'\s+/', '/', n)  # normalize slash spacing
    return n

def resolve_jur(state, constituency, lookup, place_lookup):
    sp = STATE_PLACE.get(state)
    if not sp:
        return None, None, 'no_state'
    # Skip garbled rows (contain digits in constituency = extraction artifact)
    if re.search(r'\d{3,}', constituency):
        return None, None, 'garbled'
    
    def _try(key):
        jid = lookup.get((sp, key))
        return (jid, place_lookup.get(jid), 'resolved') if jid else (None, None, None)
    
    for key in [constituency, normalize(constituency)]:
        jid, plid, s = _try(key)
        if jid: return jid, plid, s
        alias = ALIASES.get((sp, key))
        if alias:
            jid, plid, s = _try(alias)
            if jid: return jid, plid, 'alias'
    
    # trailing roman strip
    norm = normalize(constituency)
    stripped = re.sub(r'\s+[IVX]+$', '', norm).strip()
    jid, plid, s = _try(stripped)
    if jid: return jid, plid, 'trailing_roman'
    
    return None, sp, 'no_jur'

# ─── deterministic ID generation ───────────────────────────────────────────────
def sha8(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()[:16]

def ind_id(state, constituency, party, name):
    return 'ind_' + sha8(f's05b6:{state}:{constituency}:{party}:{name.upper()}')

def prof_id(ind): return 'prof_' + ind[4:]
def aff_id(ind):  return 'aff_'  + ind[4:]
def pp_id(ind):   return 'pp_'   + ind[4:]
def ir_id(ind):   return 'ir_'   + ind[4:]
def im_id(ind):   return 'im_'   + ind[4:]
def es_id(ind):   return 'es_'   + ind[4:]

# ─── SQL quoting helper ────────────────────────────────────────────────────────
def q(s):
    if s is None: return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

# ─── main ──────────────────────────────────────────────────────────────────────
def main():
    print("Loading lookup tables...", flush=True)
    lookup, place_lookup = build_jur_lookup()
    print(f"  {len(lookup)} constituency jurisdictions loaded", flush=True)

    print("Loading candidates JSON...", flush=True)
    data = json.loads(JSON_IN.read_text())
    cands_raw = data['candidates']
    print(f"  {len(cands_raw)} candidates loaded", flush=True)

    # Resolve jurisdictions
    resolved, skipped_garbled, no_jur = [], 0, 0
    for c in cands_raw:
        jid, plid, strategy = resolve_jur(c['state'], c['constituency'], lookup, place_lookup)
        if strategy == 'garbled':
            skipped_garbled += 1
            continue
        if strategy == 'no_state':
            skipped_garbled += 1
            continue
        # Still include individual/profile even without jur
        if jid is None:
            no_jur += 1
        resolved.append({**c, 'jur_id': jid, 'place_id': plid, 'jur_strategy': strategy})

    print(f"  Resolved: {len(resolved)} candidates ({skipped_garbled} garbled skipped)", flush=True)
    print(f"  With jurisdiction: {sum(1 for c in resolved if c['jur_id'])}", flush=True)
    print(f"  Without jurisdiction: {no_jur} (individual seeded, candidate_record skipped)", flush=True)

    # Split into two files to keep them manageable
    CHUNK = 4500
    chunks = [resolved[:CHUNK], resolved[CHUNK:]]

    for chunk_idx, chunk in enumerate(chunks):
        suffix = '' if chunk_idx == 0 else 'b'
        fname = f'0314{suffix}_political_inec_hoa_candidates_seed.sql'
        paths = [
            ROOT / f'infra/db/migrations/{fname}',
            ROOT / f'apps/api/migrations/{fname}',
        ]
        if chunk_idx == 0:
            paths.append(ROOT / 'infra/db/seed/0015_political_inec_hoa_candidates.sql')

        print(f"\nGenerating {fname} ({len(chunk)} candidates)...", flush=True)
        sql = build_sql(chunk, chunk_idx, len(resolved), skipped_garbled, no_jur)
        for p in paths:
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(sql)
            print(f"  Written {p} ({p.stat().st_size:,} bytes)", flush=True)

        h = hashlib.sha256(sql.encode()).hexdigest()
        # Verify all copies identical
        for p in paths[1:]:
            assert p.read_text() == sql, f"Copy mismatch: {p}"
        print(f"  SHA-256: {h}", flush=True)

    print("\nDone.", flush=True)


def build_sql(chunk, chunk_idx, total_valid, skipped_garbled, no_jur):
    lines = []
    add = lines.append

    is_first = chunk_idx == 0
    suffix   = '' if is_first else 'b'
    run_id   = SEED_RUN_ID + ('' if is_first else '_part2')

    add(f"""-- ============================================================
-- Migration 0314{suffix}: INEC 2023 State Houses of Assembly Candidates{"" if is_first else " (Part 2)"}
-- Phase S05 — Political and Electoral Foundation, Batch 6
-- Generated: 2026-04-22
-- Source: INEC Final List of Candidates for State Elections (2023)
-- Source PDF SHA-256: {PDF_HASH}
-- Extracted JSON SHA-256: {JSON_HASH}
-- Extraction accuracy: 98.5% (8,971 valid / 9,108 rows)
-- This chunk: {len(chunk)} candidates
-- Total valid candidates seeded: {total_valid}
-- Garbled rows skipped: {skipped_garbled}
-- No-jurisdiction (individual seeded, candidate_record skipped): {no_jur}
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
""")

    if is_first:
        # Seed run + source + artifact
        add(f"""-- ── Seed run + source ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO seed_runs
  (id, phase_id, phase_name, batch_name, environment, status, actor,
   source_manifest_uri, started_at, completed_at,
   rows_extracted, rows_inserted, rows_updated, rows_rejected, notes,
   created_at, updated_at)
VALUES (
  {q(SEED_RUN_ID)}, 'S05', 'Political and Electoral Foundation',
  'inec-2023-hoa-candidates', 'production', 'completed', 'replit-agent',
  'docs/reports/phase-s05-political-foundation-source-manifest-2026-04-21.md',
  unixepoch(), unixepoch(),
  8971, {total_valid}, 0, {skipped_garbled},
  {q(f'Seeded {total_valid} INEC 2023 State House of Assembly candidates from the official INEC Final List of Candidates PDF. {skipped_garbled} garbled rows skipped. {no_jur} candidates seeded without candidate_records (constituency not resolved to S03 jurisdiction). Source: https://inecnigeria.org/wp-content/uploads/2022/10/Final-List-of-Candidates-for-National-Elections_SHA-14.pdf')},
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO seed_sources
  (id, source_key, name, owner, source_type, confidence, url,
   access_method, license, publication_date, retrieved_at,
   source_hash, freshness_status, notes, created_at, updated_at)
VALUES (
  {q(SEED_SOURCE_ID)},
  'inec:final-list-candidates-state-2023:sha-14',
  'INEC Final List of Candidates for State Elections — Governorship & Houses of Assembly (2023)',
  'Independent National Electoral Commission',
  'official_government', 'official_verified',
  'https://inecnigeria.org/wp-content/uploads/2022/10/Final-List-of-Candidates-for-National-Elections_SHA-14.pdf',
  'public_pdf', 'public official', '2022-10-01', unixepoch(),
  {q(PDF_HASH)}, 'historical',
  'Official INEC pre-election publication listing all 2023 HoA and governorship candidates. Text-extractable PDF, 894 pages. HoA section: pages 98-893. Extraction method: pdfminer LTTextBox coordinate-based column reconstruction v5.',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO seed_raw_artifacts
  (id, seed_run_id, source_id, artifact_type, file_path, content_hash,
   row_count, metadata_json, extraction_script, status)
VALUES (
  'artifact_s05_b6_hoa_cands_json',
  {q(SEED_RUN_ID)}, {q(SEED_SOURCE_ID)},
  'json_normalized',
  'infra/db/seed/sources/s05_inec_2023_hoa_candidates_extracted.json',
  {q(JSON_HASH)}, 8971, '{{}}',
  'infra/db/seed/scripts/extract_s05_inec_hoa_candidates.py',
  'active'
);

""")

    add(f"-- ── Individuals + Profiles + Party affiliations + Candidate records ──────────")

    c_with_jur = 0
    c_without_jur = 0

    for c in chunk:
        name  = c['candidate_name']
        state = c['state']
        constituency = c['constituency']
        party = c['party']
        jid   = c.get('jur_id')
        plid  = c.get('place_id')
        age   = c.get('age')
        gender = c.get('gender')

        party_org = PARTY_ORG.get(party)
        if not party_org:
            continue  # Skip unknown party

        iid   = ind_id(state, constituency, party, name)
        pid   = prof_id(iid)
        afid  = aff_id(iid)
        ppid  = pp_id(iid)
        irid  = ir_id(iid)
        imid  = im_id(iid)
        esid  = es_id(iid)

        # Derive state place for profile primary_place if no constituency place
        place_for_profile = plid if plid else STATE_PLACE.get(state)

        # Split name into parts
        parts = name.split()
        first = parts[0] if parts else name
        last  = parts[-1] if len(parts) > 1 else ''
        middle = ' '.join(parts[1:-1]) if len(parts) > 2 else None

        stable_key = f"inec:hoa:2023:{state.lower()}:{constituency.lower()}:{party.lower()}:{name.upper()}"
        src_rec_hash = sha8(stable_key + ':src')

        add(f"""-- {state} / {constituency} / {party}: {name}
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  {q(iid)}, {q(name)},
  {q(TENANT)}, {q(WS)}, 'official_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  {q(pid)}, {q(iid)}, 'individual', {q(place_for_profile)},
  {q(TENANT)}, {q(WS)},
  {q(name)}, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  {q(ppid)}, {q(pid)},
  'State House of Assembly Candidate 2023',
  {q(plid) if plid else 'NULL'},
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  {q(afid)}, {q(iid)}, {q(party_org)}, 2023, 0, unixepoch(), unixepoch()
);""")

        if jid:
            c_with_jur += 1
            add(f"""INSERT OR IGNORE INTO candidate_records
  (individual_id, office_type, jurisdiction_id, party_affiliation_id,
   election_date, verification_state, created_at, updated_at)
VALUES (
  {q(iid)}, 'state_house_member', {q(jid)}, {q(afid)},
  {q(ELECTION_DATE)}, 'official_verified', unixepoch(), unixepoch()
);""")
        else:
            c_without_jur += 1

        # S04 provenance sidecars
        add(f"""INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, source_id, artifact_id, source_record_id, source_record_hash,
   target_entity_type, target_entity_id, target_profile_id,
   primary_place_id, raw_json, normalized_json, record_status,
   created_at, updated_at)
VALUES (
  {q(irid)}, {q(run_id)}, {q(SEED_SOURCE_ID)},
  'artifact_s05_b6_hoa_cands_json',
  {q(stable_key)}, {q(src_rec_hash)},
  'individual', {q(iid)}, {q(pid)},
  {q(place_for_profile)},
  {q(json.dumps({"state":state,"constituency":constituency,"party":party,"name":name}))},
  {q(json.dumps({"ind_id":iid,"jur_id":jid,"party_org":party_org}))},
  'inserted', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_record_id, source_record_hash,
   entity_type, entity_id, profile_id, stable_key, generation_method,
   created_at, updated_at)
VALUES (
  {q(imid)}, {q(run_id)}, {q(SEED_SOURCE_ID)},
  {q(stable_key)}, {q(src_rec_hash)},
  'individual', {q(iid)}, {q(pid)},
  {q(stable_key)}, 'sha256_v1', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, entity_type, entity_id, source_id, confidence_tier, attribution_notes,
   created_at, updated_at)
VALUES (
  {q(esid)}, 'individual', {q(iid)}, {q(SEED_SOURCE_ID)},
  'official_verified',
  {q(f'INEC official 2023 HoA candidate: {state} / {constituency} / {party}')},
  unixepoch(), unixepoch()
);
""")

    add(f"""
-- ── Search entries rebuild ──────────────────────────────────────────────────
INSERT OR IGNORE INTO seed_search_rebuild_jobs
  (id, seed_run_id, entity_type, scope, status, created_at, updated_at)
VALUES (
  {q(f'srj_s05b6_hoa_{chunk_idx}')}, {q(run_id)},
  'individual', 'all_hoa_candidates_2023', 'pending', unixepoch(), unixepoch()
);
""")

    return '\n'.join(lines)


if __name__ == '__main__':
    main()
