import hashlib
import json
import re
import shutil
import ssl
import urllib.request
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
SOURCE_DIR = ROOT / "infra" / "db" / "seed" / "sources"
DATE = "20260421"
TENANT_ID = "tenant_platform_seed"
WORKSPACE_ID = "workspace_platform_seed_discovery"
SEED_RUN_ID = "seed_run_s06_mlscn_training_institutions_20260421"
SOURCE_ID = "seed_source_mlscn_training_institutions_20260421"
RAW_PATH = SOURCE_DIR / f"s06_mlscn_training_institutions_raw_{DATE}.json"
NORMALIZED_PATH = SOURCE_DIR / f"s06_mlscn_training_institutions_normalized_{DATE}.json"
REPORT_PATH = SOURCE_DIR / f"s06_mlscn_training_institutions_report_{DATE}.json"
MIGRATION_PATH = ROOT / "infra" / "db" / "migrations" / "0310_education_mlscn_training_institutions_seed.sql"
API_MIGRATION_PATH = ROOT / "apps" / "api" / "migrations" / "0310_education_mlscn_training_institutions_seed.sql"
SEED_MIRROR_PATH = ROOT / "infra" / "db" / "seed" / "0011_mlscn_training_institutions.sql"
API_BASE = "https://admin.mlscn.gov.ng/api/v1"
ENDPOINTS = {
    "mls_training_universities": "approved-m-l-s-training-institution-universities",
    "mlat_training_institutions": "approved-m-l-a-t-training-institutions",
    "mls_internship_institutions": "approved-institution-for-m-l-s-internships",
}
STATE_ALIASES = {
    "fct": "federal capital territory",
    "abuja": "federal capital territory",
    "akwa-ibom": "akwa ibom",
    "cross-river": "cross river",
}


def sql(value):
    if value is None:
        return "NULL"
    if value == "unixepoch()":
        return "unixepoch()"
    return "'" + str(value).replace("'", "''") + "'"


def stable_id(prefix, value, length=24):
    return prefix + hashlib.sha256(value.encode("utf-8")).hexdigest()[:length]


def norm(value):
    value = (value or "").strip().lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"\s+state$", "", value).strip()
    return value


def parse_states():
    text = (ROOT / "infra" / "db" / "seed" / "nigeria_states.sql").read_text(encoding="utf-8")
    states = {}
    pattern = re.compile(r"\('([^']+)',\s*'((?:''|[^'])*)',\s*'state',\s*3,\s*'[^']+',\s*'([^']+)'", re.M)
    for place_id, name, ancestry_path in pattern.findall(text):
        clean = name.replace("''", "'")
        states[norm(clean)] = {"id": place_id, "name": clean, "ancestry_path": ancestry_path}
    return states


def fetch_json(url):
    ctx = ssl._create_unverified_context()
    request = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=60, context=ctx) as response:
        return json.loads(response.read().decode("utf-8"))


def source_hash(row):
    return hashlib.sha256(json.dumps(row, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()


def keywords(row):
    parts = [row["name"], "MLSCN", "medical laboratory", row["program"], row["state"], row.get("accreditation_status"), row.get("capacity_text")]
    seen = set()
    words = []
    for part in parts:
        for token in re.split(r"[^A-Za-z0-9]+", str(part or "").lower()):
            if token and token not in seen:
                seen.add(token)
                words.append(token)
    return " ".join(words)


def write_values(handle, table, columns, rows, size=400):
    if not rows:
        return
    for start in range(0, len(rows), size):
        batch = rows[start:start + size]
        handle.write(f"INSERT OR IGNORE INTO {table} ({', '.join(columns)}) VALUES\n")
        handle.write(",\n".join("  (" + ", ".join(sql(row.get(column)) for column in columns) + ")" for row in batch))
        handle.write(";\n")


def normalize(raw, states):
    seeded = []
    deferred = []
    for endpoint_key in ["mls_training_universities", "mlat_training_institutions"]:
        for index, row in enumerate(raw["endpoints"][endpoint_key]["data"], start=1):
            state_key = STATE_ALIASES.get(norm(row.get("state")), norm(row.get("state")))
            state = states.get(state_key)
            if not state:
                deferred.append({"endpoint_key": endpoint_key, "row_number": index, "row": row, "reason": "unresolved_state"})
                continue
            program = "MLS training university" if endpoint_key == "mls_training_universities" else "MLA/T training institution"
            school_type = "tertiary" if endpoint_key == "mls_training_universities" else "vocational"
            capacity_text = str(row.get("approved_quota") if endpoint_key == "mls_training_universities" else row.get("number_of_students_approved") or "")
            source_record_id = f"{endpoint_key}:{row['id']}"
            stable = f"mlscn:{endpoint_key}:{row['id']}"
            org_id = stable_id("org_s06_mlscn_train_", stable)
            profile_id = stable_id("prof_s06_mlscn_train_", stable)
            school_profile_id = stable_id("school_prof_s06_mlscn_", stable)
            search_id = stable_id("srch_s06_mlscn_train_", stable)
            dedupe_id = stable_id("seed_dedupe_s06_mlscn_", stable)
            identity_id = stable_id("seed_identity_s06_mlscn_", stable)
            ingestion_id = stable_id("seed_ingest_s06_mlscn_", stable)
            place_resolution_id = stable_id("seed_place_s06_mlscn_", stable)
            entity_source_id = stable_id("seed_entity_source_s06_mlscn_", stable)
            enrichment_id = stable_id("seed_enrichment_s06_mlscn_", stable)
            normalized = {
                "source_record_id": source_record_id,
                "source_record_hash": source_hash(row),
                "endpoint_key": endpoint_key,
                "source_api_id": row["id"],
                "name": row["name"].strip(),
                "state": row["state"],
                "program": program,
                "school_type": school_type,
                "accreditation_status": row.get("accreditation_status"),
                "capacity_text": capacity_text,
                "next_accreditation_date": row.get("next_accreditation_date"),
                "state_place_id": state["id"],
                "state_place_name": state["name"],
                "ancestry_path": state["ancestry_path"],
                "stable_key": stable,
                "org_id": org_id,
                "profile_id": profile_id,
                "school_profile_id": school_profile_id,
                "search_id": search_id,
                "dedupe_id": dedupe_id,
                "identity_id": identity_id,
                "ingestion_id": ingestion_id,
                "place_resolution_id": place_resolution_id,
                "entity_source_id": entity_source_id,
                "enrichment_id": enrichment_id,
                "keywords": None,
                "raw_json": json.dumps(row, ensure_ascii=False, sort_keys=True),
            }
            normalized["normalized_json"] = json.dumps({k: normalized[k] for k in ["source_record_id", "name", "state", "program", "school_type", "accreditation_status", "capacity_text", "next_accreditation_date", "state_place_id"]}, ensure_ascii=False, sort_keys=True)
            normalized["keywords"] = keywords(normalized)
            seeded.append(normalized)
    for index, row in enumerate(raw["endpoints"]["mls_internship_institutions"]["data"], start=1):
        deferred.append({"endpoint_key": "mls_internship_institutions", "row_number": index, "row": row, "reason": "deferred_facility_training_sites_lack_explicit_state_lga_and_may_duplicate_health_facility_sources"})
    return seeded, deferred


def main():
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    raw = {"retrieved_at": "2026-04-21", "api_base": API_BASE, "endpoints": {}}
    for key, endpoint in ENDPOINTS.items():
        data = fetch_json(f"{API_BASE}/{endpoint}")
        raw["endpoints"][key] = {"url": f"{API_BASE}/{endpoint}", "data": data.get("data", data)}
    RAW_PATH.write_text(json.dumps(raw, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    states = parse_states()
    seeded, deferred = normalize(raw, states)
    normalized = {"retrieved_at": "2026-04-21", "seeded_training_institutions": seeded, "deferred_rows": deferred}
    NORMALIZED_PATH.write_text(json.dumps(normalized, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    report = {
        "retrieved_at": "2026-04-21",
        "api_base": API_BASE,
        "raw_row_count": sum(len(v["data"]) for v in raw["endpoints"].values()),
        "seeded_row_count": len(seeded),
        "deferred_row_count": len(deferred),
        "seeded_endpoint_counts": dict(Counter(row["endpoint_key"] for row in seeded)),
        "seeded_state_counts": dict(Counter(row["state_place_name"] for row in seeded)),
        "deferred_reason_counts": dict(Counter(row["reason"] for row in deferred)),
        "decision": "Seed MLS and MLA/T training institutions as school organizations/profiles with state-level place resolution. Defer MLS internship institutions because they are health-facility training sites without explicit structured state/LGA fields and may overlap with HFR/NHIA/NPHCDA facility sources.",
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    artifact_specs = [
        (RAW_PATH, "raw", report["raw_row_count"], {"endpoints": list(ENDPOINTS.values())}),
        (NORMALIZED_PATH, "normalized", len(seeded), {"seeded_fields": sorted(seeded[0].keys()) if seeded else []}),
        (REPORT_PATH, "report", len(seeded), {}),
    ]
    artifacts = []
    for path, artifact_type, row_count, schema in artifact_specs:
        rel = str(path.relative_to(ROOT))
        artifacts.append({"id": stable_id("seed_artifact_s06_mlscn_", rel), "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_type": artifact_type, "file_path": rel, "content_hash": hashlib.sha256(path.read_bytes()).hexdigest(), "row_count": row_count, "schema_json": json.dumps(schema, ensure_ascii=False, sort_keys=True), "extraction_script": "python3 infra/db/seed/scripts/generate_s06_mlscn_training_institutions_sql.py", "status": "parsed"})
    with MIGRATION_PATH.open("w", encoding="utf-8") as handle:
        handle.write("BEGIN TRANSACTION;\n")
        handle.write(f"INSERT OR IGNORE INTO seed_runs (id, phase_id, phase_name, batch_name, environment, status, actor, source_manifest_uri, started_at, completed_at, rows_extracted, rows_inserted, rows_updated, rows_rejected, notes, created_at, updated_at) VALUES ({sql(SEED_RUN_ID)}, 'S06', 'Education and Health Official Registries', 'mlscn-training-institutions', 'production', 'completed', 'replit-agent', 'docs/reports/phase-s06-education-health-source-manifest-2026-04-21.md', unixepoch(), unixepoch(), {report['raw_row_count']}, {len(seeded)}, 0, {len(deferred)}, 'Seeded official MLSCN MLS and MLA/T training institution records as education organizations, discovery profiles, school profiles, search entries, and provenance sidecars. MLS internship facility training sites were deferred to avoid unsafe overlap with health-facility registries.', unixepoch(), unixepoch());\n")
        handle.write(f"INSERT OR IGNORE INTO seed_sources (id, source_key, name, owner, source_type, confidence, url, access_method, license, publication_date, retrieved_at, source_hash, freshness_status, notes, created_at, updated_at) VALUES ({sql(SOURCE_ID)}, 'mlscn:training-institutions-api:2026-04-21', 'MLSCN Approved Training Institutions API', 'Medical Laboratory Science Council of Nigeria', 'official_regulator', 'official_verified', 'https://mlscn.gov.ng/education', 'public_json_api', 'public official regulator website', '2026-04-21', unixepoch(), {sql(hashlib.sha256(RAW_PATH.read_bytes()).hexdigest())}, 'current', 'Official MLSCN public website API rows for approved MLS training universities and MLA/T training institutions. Internship facility rows are captured but deferred from seeding pending health-facility reconciliation.', unixepoch(), unixepoch());\n")
        write_values(handle, "seed_raw_artifacts", ["id", "seed_run_id", "source_id", "artifact_type", "file_path", "content_hash", "row_count", "schema_json", "extraction_script", "status"], artifacts)
        write_values(handle, "organizations", ["id", "tenant_id", "name", "registration_number", "verification_state"], [{"id": row["org_id"], "tenant_id": TENANT_ID, "name": row["name"], "registration_number": f"MLSCN:{row['source_api_id']}", "verification_state": "unverified"} for row in seeded])
        write_values(handle, "profiles", ["id", "subject_type", "subject_id", "claim_state", "verification_state", "publication_state", "primary_place_id"], [{"id": row["profile_id"], "subject_type": "organization", "subject_id": row["org_id"], "claim_state": "seeded", "verification_state": "unverified", "publication_state": "published", "primary_place_id": row["state_place_id"]} for row in seeded])
        write_values(handle, "school_profiles", ["id", "organization_id", "workspace_id", "tenant_id", "school_name", "school_type", "cac_reg_number", "state_reg_ref", "student_count", "status"], [{"id": row["school_profile_id"], "organization_id": row["org_id"], "workspace_id": WORKSPACE_ID, "tenant_id": TENANT_ID, "school_name": row["name"], "school_type": row["school_type"], "cac_reg_number": None, "state_reg_ref": f"MLSCN:{row['source_api_id']}", "student_count": 0, "status": "reg_verified"} for row in seeded])
        write_values(handle, "seed_dedupe_decisions", ["id", "seed_run_id", "entity_type", "canonical_key", "candidate_keys", "decision", "confidence", "reason", "decided_by"], [{"id": row["dedupe_id"], "seed_run_id": SEED_RUN_ID, "entity_type": "organization", "canonical_key": row["stable_key"], "candidate_keys": json.dumps([row["source_record_id"]]), "decision": "canonical", "confidence": "official_verified", "reason": "MLSCN API UUID plus endpoint key used as source-backed dedupe key for scoped training-institution seed.", "decided_by": "replit-agent"} for row in seeded])
        write_values(handle, "seed_ingestion_records", ["id", "seed_run_id", "source_id", "artifact_id", "row_number", "source_record_id", "source_record_hash", "target_entity_type", "target_entity_id", "target_profile_id", "vertical_slug", "primary_place_id", "raw_json", "normalized_json", "record_status", "error_json"], [{"id": row["ingestion_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_id": artifacts[1]["id"], "row_number": None, "source_record_id": row["source_record_id"], "source_record_hash": row["source_record_hash"], "target_entity_type": "organization", "target_entity_id": row["org_id"], "target_profile_id": row["profile_id"], "vertical_slug": "school", "primary_place_id": row["state_place_id"], "raw_json": row["raw_json"], "normalized_json": row["normalized_json"], "record_status": "inserted", "error_json": "{}"} for row in seeded])
        write_values(handle, "seed_identity_map", ["id", "seed_run_id", "source_id", "source_record_id", "source_record_hash", "entity_type", "entity_id", "profile_id", "vertical_slug", "stable_key", "generation_method"], [{"id": row["identity_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "source_record_id": row["source_record_id"], "source_record_hash": row["source_record_hash"], "entity_type": "organization", "entity_id": row["org_id"], "profile_id": row["profile_id"], "vertical_slug": "school", "stable_key": row["stable_key"], "generation_method": "sha256_v1"} for row in seeded])
        write_values(handle, "seed_place_resolutions", ["id", "seed_run_id", "source_id", "source_record_id", "input_state", "input_lga", "input_ward", "explicit_place_id", "resolved_place_id", "resolution_level", "confidence", "status", "candidate_place_ids", "notes"], [{"id": row["place_resolution_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "source_record_id": row["source_record_id"], "input_state": row["state"], "input_lga": None, "input_ward": None, "explicit_place_id": None, "resolved_place_id": row["state_place_id"], "resolution_level": "state", "confidence": "official_verified", "status": "resolved", "candidate_place_ids": json.dumps([row["state_place_id"]]), "notes": "MLSCN training institution API provides state but no LGA/ward field; no lower-level place was inferred."} for row in seeded])
        write_values(handle, "seed_entity_sources", ["id", "seed_run_id", "source_id", "artifact_id", "dedupe_decision_id", "entity_type", "entity_id", "profile_id", "vertical_slug", "source_record_id", "source_record_hash", "confidence", "source_url", "extracted_at", "last_verified_at", "verification_state", "notes"], [{"id": row["entity_source_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_id": artifacts[1]["id"], "dedupe_decision_id": row["dedupe_id"], "entity_type": "organization", "entity_id": row["org_id"], "profile_id": row["profile_id"], "vertical_slug": "school", "source_record_id": row["source_record_id"], "source_record_hash": row["source_record_hash"], "confidence": "official_verified", "source_url": f"{API_BASE}/{ENDPOINTS[row['endpoint_key']]}", "extracted_at": "unixepoch()", "last_verified_at": "unixepoch()", "verification_state": "source_verified", "notes": "Official MLSCN public API training-institution record seeded as school organization/profile with state-level place resolution."} for row in seeded])
        write_values(handle, "seed_enrichment", ["id", "seed_run_id", "entity_type", "entity_id", "profile_id", "vertical_slug", "source_id", "enrichment_json", "pii_classification", "lawful_basis", "last_reviewed_at"], [{"id": row["enrichment_id"], "seed_run_id": SEED_RUN_ID, "entity_type": "organization", "entity_id": row["org_id"], "profile_id": row["profile_id"], "vertical_slug": "school", "source_id": SOURCE_ID, "enrichment_json": json.dumps({"program": row["program"], "accreditation_status": row["accreditation_status"], "capacity_text": row["capacity_text"], "next_accreditation_date": row["next_accreditation_date"], "source_api_id": row["source_api_id"], "endpoint_key": row["endpoint_key"]}, ensure_ascii=False, sort_keys=True), "pii_classification": "public", "lawful_basis": "public_official_regulator_directory", "last_reviewed_at": "unixepoch()"} for row in seeded])
        write_values(handle, "search_entries", ["id", "entity_type", "entity_id", "tenant_id", "display_name", "keywords", "place_id", "ancestry_path", "visibility"], [{"id": row["search_id"], "entity_type": "organization", "entity_id": row["org_id"], "tenant_id": TENANT_ID, "display_name": row["name"], "keywords": row["keywords"], "place_id": row["state_place_id"], "ancestry_path": row["ancestry_path"], "visibility": "public"} for row in seeded])
        handle.write(f"INSERT OR IGNORE INTO seed_search_rebuild_jobs (id, seed_run_id, batch_name, status, entity_type, entity_count, search_entries_count, queued_at, started_at, completed_at, fts_rebuilt_at, notes, created_at, updated_at) VALUES ('seed_search_rebuild_s06_mlscn_training_20260421', {sql(SEED_RUN_ID)}, 'mlscn-training-search-rebuild', 'completed', 'organization', {len(seeded)}, {len(seeded)}, unixepoch(), unixepoch(), unixepoch(), unixepoch(), 'MLSCN training institution search entries inserted; search_fts rebuilt at end of migration.', unixepoch(), unixepoch());\n")
        handle.write("INSERT INTO search_fts(search_fts) VALUES('rebuild');\n")
        handle.write("COMMIT;\n")
    shutil.copyfile(MIGRATION_PATH, API_MIGRATION_PATH)
    shutil.copyfile(MIGRATION_PATH, SEED_MIRROR_PATH)
    print(json.dumps(report, indent=2, sort_keys=True))
    print(f"wrote {MIGRATION_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
