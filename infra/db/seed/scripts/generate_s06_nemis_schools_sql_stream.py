import hashlib
import json
import re
import shutil
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
SOURCE_DIR = ROOT / "infra" / "db" / "seed" / "sources"
MIGRATION_PATH = ROOT / "infra" / "db" / "migrations" / "0307_education_nemis_schools_seed.sql"
API_MIGRATION_PATH = ROOT / "apps" / "api" / "migrations" / "0307_education_nemis_schools_seed.sql"
SEED_MIRROR_PATH = ROOT / "infra" / "db" / "seed" / "0008_nemis_schools.sql"
DATE = "20260421"
TENANT_ID = "tenant_platform_seed"
WORKSPACE_ID = "workspace_platform_seed_discovery"
SEED_RUN_ID = "seed_run_s06_nemis_schools_20260421"
SOURCE_ID = "seed_source_nemis_school_directory_20260421"
UBEC_SOURCE_ID = "seed_source_ubec_2022_npa_aggregate_20260421"
NORMALIZED_PATH = SOURCE_DIR / f"s06_nemis_schools_normalized_{DATE}.json"
EXTRACTION_REPORT_PATH = SOURCE_DIR / f"s06_nemis_schools_extraction_report_{DATE}.json"
RECONCILIATION_PATH = SOURCE_DIR / f"s06_nemis_schools_reconciliation_{DATE}.json"

STATE_ALIASES = {
    "FCT": "FEDERAL CAPITAL TERRITORY",
    "ABUJA": "FEDERAL CAPITAL TERRITORY",
    "AKWA IBOM": "AKWA IBOM",
    "AKWA-IBOM": "AKWA IBOM",
    "CROSS RIVER": "CROSS RIVER",
    "CROSS-RIVER": "CROSS RIVER",
    "NASSARAWA": "NASARAWA",
}

LGA_ALIASES = {
    ("FEDERAL CAPITAL TERRITORY", "MUNICIPAL"): "ABUJA MUNICIPAL",
    ("FEDERAL CAPITAL TERRITORY", "AMAC"): "ABUJA MUNICIPAL",
    ("BAUCHI", "KATAGUN"): "KATAGUM",
    ("BAYELSA", "YENEGOA"): "YENAGOA",
    ("KEBBI", "DANKO WASAGU"): "WASAGU/DANKO",
    ("KEBBI", "ALIERO"): "ALEIRO",
    ("KEBBI", "AREWA"): "AREWA DANDI",
    ("ABIA", "OSISIOMA"): "OSISIOMA NGWA",
    ("ABIA", "OBIOMA NGWA"): "OBI NGWA",
    ("OYO", "OGBOMOSO NORTH"): "OGBOMOSHO NORTH",
    ("OYO", "OGBOMOSO SOUTH"): "OGBOMOSHO SOUTH",
    ("KANO", "MINGIBIR"): "MINJIBIR",
    ("KADUNA", "JEMAA"): "JEMA'A",
    ("PLATEAU", "QUAANPAN"): "QUA'AN PAN",
    ("ZAMFARA", "BIRNI MAGAJI"): "BIRNIN MAGAJI/KIYAW",
    ("DELTA", "IKA NORTH"): "IKA NORTH EAST",
    ("OSUN", "AYEDE ADE"): "EGBEDORE",
    ("ADAMAWA", "FUFORE"): "FUFURE",
    ("ADAMAWA", "GIREI"): "GRIE",
    ("ADAMAWA", "GUYUK"): "GAYUK",
    ("ADAMAWA", "TUONGO"): "TOUNGO",
    ("KWARA", "PATIGI"): "PATEGI",
    ("NIGER", "MUNYA"): "PAIKORO",
    ("JIGAWA", "KAUGAWA"): "KAUGAMA",
    ("RIVERS", "EMUOHA"): "EMOHUA",
    ("IMO", "AHIAZU"): "AHIAZU MBAISE",
    ("YOBE", "BOSARI"): "BURSARI",
    ("BORNO", "MONGUNU"): "MONGUNO",
    ("BORNO", "ABADAN"): "ABADAM",
    ("RIVERS", "PHALGA"): "PORT HARCOURT",
    ("LAGOS", "MAINLAND"): "LAGOS MAINLAND",
    ("LAGOS", "MAIN LAND"): "LAGOS MAINLAND",
    ("LAGOS", "LAGOS ISLAND EAST"): "LAGOS ISLAND",
}

def norm(value):
    value = (value or "").replace("&", " AND ").upper()
    value = re.sub(r"[^A-Z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()

def sql(value):
    if value is None:
        return "NULL"
    if value == "unixepoch()":
        return "unixepoch()"
    return "'" + str(value).replace("'", "''") + "'"

def stable_id(prefix, value, length=24):
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()[:length]
    return f"{prefix}{digest}"

def parse_states():
    text = (ROOT / "infra" / "db" / "seed" / "nigeria_states.sql").read_text(encoding="utf-8")
    states = {}
    for place_id, name in re.findall(r"\('([^']+)',\s*'((?:''|[^'])*)',\s*'state'", text):
        slug = place_id.replace("place_state_", "")
        states[slug] = name.replace("''", "'")
    return states

def parse_lgas():
    state_names = parse_states()
    text = (ROOT / "infra" / "db" / "seed" / "0002_lgas.sql").read_text(encoding="utf-8")
    lgas_by_state = defaultdict(dict)
    lga_rows = []
    pattern = re.compile(r"\('([^']+)',\s*'((?:''|[^'])*)',\s*'local_government_area',\s*4,\s*'place_state_([^']+)',\s*'([^']+)'", re.M)
    for place_id, name, state_slug, ancestry_path in pattern.findall(text):
        state_name = state_names[state_slug]
        clean_name = name.replace("''", "'")
        row = {"place_id": place_id, "name": clean_name, "state": state_name, "state_key": norm(state_name), "lga_key": norm(clean_name), "ancestry_path": ancestry_path}
        lgas_by_state[row["state_key"]][row["lga_key"]] = row
        lga_rows.append(row)
    return lgas_by_state, lga_rows

def state_key(value):
    key = norm(value)
    return STATE_ALIASES.get(key, key)

def resolve_lga(school, lgas_by_state):
    skey = state_key(school["state"])
    lkey = norm(school["lga"])
    choices = lgas_by_state.get(skey, {})
    if lkey in choices:
        return choices[lkey], "exact"
    alias = LGA_ALIASES.get((skey, lkey))
    if alias and norm(alias) in choices:
        return choices[norm(alias)], "alias"
    best = None
    best_score = 0
    for candidate_key, candidate in choices.items():
        score = SequenceMatcher(None, lkey, candidate_key).ratio()
        if score > best_score:
            best = candidate
            best_score = score
    if best and best_score >= 0.88:
        return best, f"fuzzy:{best_score:.3f}"
    return None, "unresolved"

def keywords(school, place):
    parts = [school["school_name"], school["school_code"], "school", school["school_type"], school["sector"], school["state"], school["lga"], place["name"]]
    for value in school.get("levels", []) + school.get("level_offered_values", []):
        parts.append(value)
    words = []
    seen = set()
    for part in parts:
        for token in re.split(r"[^A-Za-z0-9]+", str(part or "").lower()):
            if token and token not in seen:
                seen.add(token)
                words.append(token)
    return " ".join(words)

def batches(rows, size=400):
    for index in range(0, len(rows), size):
        yield rows[index:index + size]

def write_values(handle, table, columns, rows):
    if not rows:
        return
    for batch in batches(rows):
        handle.write(f"INSERT OR IGNORE INTO {table} ({', '.join(columns)}) VALUES\n")
        rendered = []
        for row in batch:
            rendered.append("  (" + ", ".join(sql(row.get(column)) for column in columns) + ")")
        handle.write(",\n".join(rendered))
        handle.write(";\n")

def main():
    data = json.loads(NORMALIZED_PATH.read_text(encoding="utf-8"))
    extraction_report = json.loads(EXTRACTION_REPORT_PATH.read_text(encoding="utf-8"))
    lgas_by_state, lga_rows = parse_lgas()
    schools = []
    unresolved = []
    resolution_counts = Counter()
    for school in data["schools"]:
        place, method = resolve_lga(school, lgas_by_state)
        if not place:
            unresolved.append({"school_code": school["school_code"], "school_name": school["school_name"], "state": school["state"], "lga": school["lga"], "reason": method})
            resolution_counts[method] += 1
            continue
        stable = school["stable_key"]
        org_id = stable_id("org_s06_school_", stable)
        profile_id = stable_id("prof_s06_school_", stable)
        school_profile_id = stable_id("school_prof_s06_", stable)
        private_profile_id = stable_id("priv_school_s06_", stable) if school["sector"] == "PRIVATE" else None
        search_id = stable_id("srch_s06_school_", stable)
        dedupe_id = stable_id("seed_dedupe_s06_school_", stable)
        identity_id = stable_id("seed_identity_s06_school_", stable)
        source_link_id = stable_id("seed_entity_source_s06_school_", stable)
        ingestion_id = stable_id("seed_ingest_s06_school_", stable)
        place_resolution_id = stable_id("seed_place_s06_school_", stable)
        first_source_id = school["source_record_ids"][0]
        first_source_hash = school["source_record_hashes"][0]
        levels_json = json.dumps(school["levels"], ensure_ascii=False, sort_keys=True)
        offered_json = json.dumps(school["level_offered_values"], ensure_ascii=False, sort_keys=True)
        raw_json = json.dumps({"source_record_ids": school["source_record_ids"], "levels": school["levels"], "level_offered_values": school["level_offered_values"]}, ensure_ascii=False, sort_keys=True)
        normalized_json = json.dumps({"school_code": school["school_code"], "school_name": school["school_name"], "state": school["state"], "lga": school["lga"], "sector": school["sector"], "school_type": school["school_type"], "resolved_place_id": place["place_id"], "resolution_method": method}, ensure_ascii=False, sort_keys=True)
        schools.append({**school, "org_id": org_id, "profile_id": profile_id, "school_profile_id": school_profile_id, "private_profile_id": private_profile_id, "search_id": search_id, "dedupe_id": dedupe_id, "identity_id": identity_id, "source_link_id": source_link_id, "ingestion_id": ingestion_id, "place_resolution_id": place_resolution_id, "place_id": place["place_id"], "place_name": place["name"], "ancestry_path": place["ancestry_path"], "resolution_method": method, "first_source_record_id": first_source_id, "first_source_record_hash": first_source_hash, "levels_json": levels_json, "offered_json": offered_json, "raw_json": raw_json, "normalized_json": normalized_json, "keywords": keywords(school, place)})
        resolution_counts[method] += 1
    report = {
        "retrieved_at": "2026-04-21",
        "source_rows": extraction_report["raw_row_count"],
        "valid_canonical_schools": len(data["schools"]),
        "resolved_canonical_schools": len(schools),
        "unresolved_canonical_schools": len(unresolved),
        "resolution_counts": dict(resolution_counts),
        "inserted_sector_counts": dict(Counter(school["sector"] for school in schools)),
        "inserted_school_type_counts": dict(Counter(school["school_type"] for school in schools)),
        "inserted_state_counts": dict(Counter(school["state"] for school in schools)),
        "unresolved_samples": unresolved[:200],
        "ubec_2022_npa_benchmark": {"ube_schools_total": 171027, "public": 79775, "private": 91252, "note": "UBEC aggregate benchmark is recorded for variance reporting only; row-level seeded entities come from NEMIS Schools Directory CSV exports."},
    }
    RECONCILIATION_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    with MIGRATION_PATH.open("w", encoding="utf-8") as handle:
        handle.write("BEGIN TRANSACTION;\n")
        handle.write(f"INSERT OR IGNORE INTO seed_runs (id, phase_id, phase_name, batch_name, environment, status, actor, source_manifest_uri, started_at, completed_at, rows_extracted, rows_inserted, rows_updated, rows_rejected, notes, created_at, updated_at) VALUES ({sql(SEED_RUN_ID)}, 'S06', 'Education and Health Official Registries', 'nemis-schools-directory', 'production', 'completed', 'replit-agent', 'docs/reports/phase-s06-education-health-source-manifest-2026-04-21.md', unixepoch(), unixepoch(), {extraction_report['raw_row_count']}, {len(schools)}, 0, {extraction_report.get('rejected_source_row_count', 0) + len(unresolved)}, 'Seeded official NEMIS row-level school directory records as school organizations, discovery profiles, school profiles, private-school profiles where applicable, search entries, and provenance sidecars. UBEC 2022 NPA aggregate counts are retained as benchmark only and not used to fabricate row-level records.', unixepoch(), unixepoch());\n")
        handle.write(f"INSERT OR IGNORE INTO seed_sources (id, source_key, name, owner, source_type, confidence, url, access_method, license, publication_date, retrieved_at, source_hash, freshness_status, notes, created_at, updated_at) VALUES ({sql(SOURCE_ID)}, 'nemis:schools-directory:2026-04-21', 'NEMIS Schools Directory CSV Exports', 'Federal Ministry of Education / Nigeria Education Management Information System', 'official_government', 'official_verified', 'https://nemis.education.gov.ng/schools.php', 'public_csv_export', 'public official directory', '2026-04-21', unixepoch(), NULL, 'current', 'Official NEMIS school directory exports by education level. Primary national export returned HTTP 500, so Primary rows were extracted using the public LGA-filtered CSV endpoint and reconciled into one artifact.', unixepoch(), unixepoch());\n")
        handle.write(f"INSERT OR IGNORE INTO seed_sources (id, source_key, name, owner, source_type, confidence, url, access_method, license, publication_date, retrieved_at, source_hash, freshness_status, notes, created_at, updated_at) VALUES ({sql(UBEC_SOURCE_ID)}, 'ubec:2022-npa-aggregate:2026-04-21', 'UBEC 2022 National Personnel Audit Aggregate Basic Education Statistics', 'Universal Basic Education Commission', 'official_government', 'official_verified', 'https://ubec.gov.ng/', 'public_web_page', 'public official aggregate statistics', '2022', unixepoch(), NULL, 'current', 'Aggregate benchmark: 171,027 UBE schools; 79,775 public and 91,252 private. Used for variance reporting only because the fetched UBEC public data page did not expose row-level school records.', unixepoch(), unixepoch());\n")
        artifacts = []
        for path in extraction_report["raw_csv_paths"]:
            full_path = ROOT / path
            artifacts.append({"id": stable_id("seed_artifact_s06_", path), "source_id": SOURCE_ID, "artifact_type": "raw", "file_path": path, "content_hash": hashlib.sha256(full_path.read_bytes()).hexdigest(), "row_count": None, "schema_json": json.dumps({"columns": ["State", "LGA", "School Code", "School Name", "Level of Education", "Sector", "Level Offered"]}, sort_keys=True), "extraction_script": "python3 infra/db/seed/scripts/extract_s06_nemis_schools.py", "status": "captured"})
        for path, artifact_type, row_count in [(str(NORMALIZED_PATH.relative_to(ROOT)), "normalized", len(data["schools"])), (str(EXTRACTION_REPORT_PATH.relative_to(ROOT)), "report", extraction_report["raw_row_count"]), (str(RECONCILIATION_PATH.relative_to(ROOT)), "report", len(schools))]:
            full_path = ROOT / path
            artifacts.append({"id": stable_id("seed_artifact_s06_", path), "source_id": SOURCE_ID, "artifact_type": artifact_type, "file_path": path, "content_hash": hashlib.sha256(full_path.read_bytes()).hexdigest(), "row_count": row_count, "schema_json": "{}", "extraction_script": "python3 infra/db/seed/scripts/extract_s06_nemis_schools.py && python3 infra/db/seed/scripts/generate_s06_nemis_schools_sql_stream.py", "status": "parsed"})
        write_values(handle, "seed_raw_artifacts", ["id", "seed_run_id", "source_id", "artifact_type", "file_path", "content_hash", "row_count", "schema_json", "extraction_script", "status"], artifacts)
        write_values(handle, "organizations", ["id", "tenant_id", "name", "registration_number", "verification_state"], [{"id": s["org_id"], "tenant_id": TENANT_ID, "name": s["school_name"], "registration_number": s["school_code"] or None, "verification_state": "unverified"} for s in schools])
        write_values(handle, "profiles", ["id", "subject_type", "subject_id", "claim_state", "verification_state", "publication_state", "primary_place_id"], [{"id": s["profile_id"], "subject_type": "organization", "subject_id": s["org_id"], "claim_state": "seeded", "verification_state": "unverified", "publication_state": "published", "primary_place_id": s["place_id"]} for s in schools])
        write_values(handle, "school_profiles", ["id", "organization_id", "workspace_id", "tenant_id", "school_name", "school_type", "cac_reg_number", "state_reg_ref", "student_count", "status"], [{"id": s["school_profile_id"], "organization_id": s["org_id"], "workspace_id": WORKSPACE_ID, "tenant_id": TENANT_ID, "school_name": s["school_name"], "school_type": s["school_type"], "cac_reg_number": None, "state_reg_ref": s["school_code"] or None, "student_count": 0, "status": "reg_verified"} for s in schools])
        private_rows = [s for s in schools if s["sector"] == "PRIVATE"]
        write_values(handle, "private_school_profiles", ["id", "workspace_id", "tenant_id", "school_name", "subeb_approval", "waec_centre_number", "neco_centre_number", "cac_rc", "school_type", "status", "created_at", "updated_at"], [{"id": s["private_profile_id"], "workspace_id": WORKSPACE_ID, "tenant_id": TENANT_ID, "school_name": s["school_name"], "subeb_approval": s["school_code"] or None, "waec_centre_number": None, "neco_centre_number": None, "cac_rc": None, "school_type": s["school_type"], "status": "seeded", "created_at": "unixepoch()", "updated_at": "unixepoch()"} for s in private_rows])
        write_values(handle, "seed_dedupe_decisions", ["id", "seed_run_id", "entity_type", "canonical_key", "candidate_keys", "decision", "confidence", "reason", "decided_by"], [{"id": s["dedupe_id"], "seed_run_id": SEED_RUN_ID, "entity_type": "organization", "canonical_key": s["stable_key"], "candidate_keys": json.dumps(s["source_record_ids"], ensure_ascii=False, sort_keys=True), "decision": "canonical", "confidence": "official_verified", "reason": "Official NEMIS School Code used as primary dedupe key; one unresolved no-code source row was rejected before canonical insertion.", "decided_by": "replit-agent"} for s in schools])
        write_values(handle, "seed_ingestion_records", ["id", "seed_run_id", "source_id", "artifact_id", "row_number", "source_record_id", "source_record_hash", "target_entity_type", "target_entity_id", "target_profile_id", "vertical_slug", "primary_place_id", "raw_json", "normalized_json", "record_status", "error_json"], [{"id": s["ingestion_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_id": stable_id("seed_artifact_s06_", str(NORMALIZED_PATH.relative_to(ROOT))), "row_number": None, "source_record_id": s["first_source_record_id"], "source_record_hash": s["first_source_record_hash"], "target_entity_type": "organization", "target_entity_id": s["org_id"], "target_profile_id": s["profile_id"], "vertical_slug": "school", "primary_place_id": s["place_id"], "raw_json": s["raw_json"], "normalized_json": s["normalized_json"], "record_status": "inserted", "error_json": "{}"} for s in schools])
        write_values(handle, "seed_identity_map", ["id", "seed_run_id", "source_id", "source_record_id", "source_record_hash", "entity_type", "entity_id", "profile_id", "vertical_slug", "stable_key", "generation_method"], [{"id": s["identity_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "source_record_id": s["first_source_record_id"], "source_record_hash": s["first_source_record_hash"], "entity_type": "organization", "entity_id": s["org_id"], "profile_id": s["profile_id"], "vertical_slug": "school", "stable_key": s["stable_key"], "generation_method": "sha256_v1"} for s in schools])
        write_values(handle, "seed_place_resolutions", ["id", "seed_run_id", "source_id", "source_record_id", "input_state", "input_lga", "input_ward", "explicit_place_id", "resolved_place_id", "resolution_level", "confidence", "status", "candidate_place_ids", "notes"], [{"id": s["place_resolution_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "source_record_id": s["first_source_record_id"], "input_state": s["state"], "input_lga": s["lga"], "input_ward": None, "explicit_place_id": None, "resolved_place_id": s["place_id"], "resolution_level": "local_government_area", "confidence": "official_verified", "status": "resolved", "candidate_place_ids": json.dumps([s["place_id"]]), "notes": f"NEMIS school directory row resolved to canonical LGA by {s['resolution_method']}; source export does not provide ward."} for s in schools])
        write_values(handle, "seed_entity_sources", ["id", "seed_run_id", "source_id", "artifact_id", "dedupe_decision_id", "entity_type", "entity_id", "profile_id", "vertical_slug", "source_record_id", "source_record_hash", "confidence", "source_url", "extracted_at", "last_verified_at", "verification_state", "notes"], [{"id": s["source_link_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_id": stable_id("seed_artifact_s06_", str(NORMALIZED_PATH.relative_to(ROOT))), "dedupe_decision_id": s["dedupe_id"], "entity_type": "organization", "entity_id": s["org_id"], "profile_id": s["profile_id"], "vertical_slug": "school", "source_record_id": s["first_source_record_id"], "source_record_hash": s["first_source_record_hash"], "confidence": "official_verified", "source_url": "https://nemis.education.gov.ng/schools.php", "extracted_at": "unixepoch()", "last_verified_at": "unixepoch()", "verification_state": "source_verified", "notes": "Official NEMIS school directory row seeded as school organization/profile with NEMIS School Code retained as registration reference."} for s in schools])
        write_values(handle, "search_entries", ["id", "entity_type", "entity_id", "tenant_id", "display_name", "keywords", "place_id", "ancestry_path", "visibility"], [{"id": s["search_id"], "entity_type": "organization", "entity_id": s["org_id"], "tenant_id": TENANT_ID, "display_name": s["school_name"], "keywords": s["keywords"], "place_id": s["place_id"], "ancestry_path": s["ancestry_path"], "visibility": "public"} for s in schools])
        handle.write(f"INSERT OR IGNORE INTO seed_search_rebuild_jobs (id, seed_run_id, batch_name, status, entity_type, entity_count, search_entries_count, queued_at, started_at, completed_at, fts_rebuilt_at, notes, created_at, updated_at) VALUES ('seed_search_rebuild_s06_nemis_schools_20260421', {sql(SEED_RUN_ID)}, 'nemis-school-search-rebuild', 'completed', 'organization', {len(schools)}, {len(schools)}, unixepoch(), unixepoch(), unixepoch(), unixepoch(), 'NEMIS school search entries inserted; search_fts rebuilt at end of migration.', unixepoch(), unixepoch());\n")
        handle.write("DELETE FROM search_fts;\n")
        handle.write("INSERT INTO search_fts(rowid, entity_id, display_name, keywords) SELECT rowid, entity_id, display_name, keywords FROM search_entries;\n")
        handle.write("COMMIT;\n")
    shutil.copyfile(MIGRATION_PATH, API_MIGRATION_PATH)
    shutil.copyfile(MIGRATION_PATH, SEED_MIRROR_PATH)
    print(json.dumps(report, indent=2, sort_keys=True)[:6000])
    print(f"wrote {MIGRATION_PATH.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
