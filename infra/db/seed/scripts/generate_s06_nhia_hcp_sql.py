import hashlib
import json
import re
import shutil
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
SOURCE_DIR = ROOT / "infra" / "db" / "seed" / "sources"
DATE = "20260421"
PAGE_URL = "https://www.nhia.gov.ng/hcps/"
SOURCE_KEY = "nhia:active-accredited-healthcare-providers:2026-04-21"
RAW_PATH = SOURCE_DIR / f"s06_nhia_hcp_raw_{DATE}.json"
NORMALIZED_PATH = SOURCE_DIR / f"s06_nhia_hcp_normalized_{DATE}.json"
REPORT_PATH = SOURCE_DIR / f"s06_nhia_hcp_report_{DATE}.json"
MIGRATION_PATH = ROOT / "infra" / "db" / "migrations" / "0308_health_nhia_hcp_seed.sql"
API_MIGRATION_PATH = ROOT / "apps" / "api" / "migrations" / "0308_health_nhia_hcp_seed.sql"
SEED_MIRROR_PATH = ROOT / "infra" / "db" / "seed" / "0009_nhia_hcp.sql"
TENANT_ID = "tenant_platform_seed"
WORKSPACE_ID = "workspace_platform_seed_discovery"
SEED_RUN_ID = "seed_run_s06_nhia_hcp_20260421"
SOURCE_ID = "seed_source_nhia_hcp_20260421"

STATE_PREFIXES = {
    "AB": "Abia",
    "AD": "Adamawa",
    "AK": "Akwa Ibom",
    "AN": "Anambra",
    "BA": "Bauchi",
    "BN": "Benue",
    "BO": "Borno",
    "BY": "Bayelsa",
    "CR": "Cross River",
    "DT": "Delta",
    "EB": "Ebonyi",
    "ED": "Edo",
    "EK": "Ekiti",
    "EN": "Enugu",
    "FCT": "Federal Capital Territory",
    "GM": "Gombe",
    "IM": "Imo",
    "JG": "Jigawa",
    "KB": "Kebbi",
    "KD": "Kaduna",
    "KG": "Kogi",
    "KN": "Kano",
    "KT": "Katsina",
    "KW": "Kwara",
    "LA": "Lagos",
    "NG": "Niger",
    "NW": "Nasarawa",
    "OD": "Ondo",
    "OG": "Ogun",
    "OS": "Osun",
    "OY": "Oyo",
    "PL": "Plateau",
    "RV": "Rivers",
    "SO": "Sokoto",
    "TR": "Taraba",
    "YB": "Yobe",
    "ZF": "Zamfara",
}


def request(url):
    return urllib.request.Request(url, headers={"User-Agent": "WebWakaSeedBot/1.0", "Referer": PAGE_URL})


def fetch_text(url):
    with urllib.request.urlopen(request(url), timeout=90) as response:
        return response.read().decode("utf-8", "replace")


def fetch_bytes(url):
    with urllib.request.urlopen(request(url), timeout=90) as response:
        return response.read()


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
    return prefix + hashlib.sha256(value.encode("utf-8")).hexdigest()[:length]


def row_hash(row):
    return hashlib.sha256(json.dumps(row, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()


def sha256_file(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse_states():
    text = (ROOT / "infra" / "db" / "seed" / "nigeria_states.sql").read_text(encoding="utf-8")
    states = {}
    pattern = re.compile(r"\('([^']+)',\s*'((?:''|[^'])*)',\s*'state',\s*3,\s*'([^']+)',\s*'([^']+)'", re.M)
    for place_id, name, parent_id, ancestry_path in pattern.findall(text):
        states[norm(name.replace("''", "'"))] = {
            "place_id": place_id,
            "name": name.replace("''", "'"),
            "ancestry_path": ancestry_path,
            "parent_id": parent_id,
        }
    return states


def data_url_from_page(page_html):
    match = re.search(r'"data_request_url":"([^"]+)"', page_html)
    if not match:
        raise RuntimeError("NHIA HCP Ninja Tables data URL not found")
    return json.loads('"' + match.group(1) + '"')


def fetch_rows():
    page_html = fetch_text(PAGE_URL)
    base_url = data_url_from_page(page_html)
    rows = []
    chunk_sizes = []
    for chunk_number in range(20):
        url = re.sub(r"chunk_number=\d+", f"chunk_number={chunk_number}", base_url)
        chunk_bytes = fetch_bytes(url)
        chunk = json.loads(chunk_bytes.decode("utf-8"))
        chunk_sizes.append(len(chunk))
        if not chunk:
            break
        rows.extend(chunk)
    return page_html, base_url, rows, chunk_sizes


def clean_code(value):
    value = re.sub(r"\s*/\s*", "/", (value or "").strip().upper())
    match = re.search(r"([A-Z]{2,3}/\d{4}/[A-Z])", value)
    return match.group(1) if match else value


def clean_name(value, code):
    name = re.sub(r"\s+", " ", (value or "").strip())
    if code:
        name = re.sub(r"\s*-\s*" + re.escape(code.replace("/", r"\s*/\s*")) + r"\s*$", "", name, flags=re.I)
    name = re.sub(r"\s*-\s*[A-Z]{2,3}\s*/\s*\d{4}\s*/\s*[A-Z]\s*$", "", name, flags=re.I)
    return re.sub(r"\s+", " ", name).strip(" -")


def facility_type(name):
    key = norm(name)
    if "PHARM" in key:
        return "pharmacy"
    if "LAB" in key or "DIAGNOSTIC" in key:
        return "laboratory"
    if "MATERN" in key:
        return "maternity"
    if "DENT" in key:
        return "dental"
    if "EYE" in key or "OPTIC" in key or "VISION" in key:
        return "optical"
    if "HOSPITAL" in key or "MEDICAL CENTRE" in key or "MEDICAL CENTER" in key or "SPECIALIST" in key or "INFIRMARY" in key:
        return "hospital"
    if "CLINIC" in key or "HEALTH CENTRE" in key or "HEALTH CENTER" in key:
        return "clinic"
    return "others"


def keywords(row):
    parts = [
        row["provider_name"],
        row["provider_code"],
        row["address"],
        row["source_facility_type"],
        row["facility_type"],
        row["state_name"],
        "nhia",
        "healthcare",
        "health",
    ]
    seen = set()
    words = []
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


def normalize_rows(raw_rows, states):
    prepared = []
    invalid = []
    for index, item in enumerate(raw_rows, start=1):
        value = item.get("value", {})
        original_code = (value.get("healthcareprovidercode") or "").strip()
        provider_code = clean_code(original_code)
        source_record_id = f"nhia-hcp:{value.get('___id___') or index}"
        prefix = provider_code.split("/")[0] if "/" in provider_code else None
        state_name = STATE_PREFIXES.get(prefix)
        place = states.get(norm(state_name)) if state_name else None
        provider_name = clean_name(value.get("healthcareprovidername"), provider_code)
        row = {
            "row_number": index,
            "source_record_id": source_record_id,
            "source_record_hash": row_hash(value),
            "source_table_row_id": value.get("___id___"),
            "source_sno": (value.get("sno") or "").strip(),
            "provider_code": provider_code,
            "provider_code_original": original_code,
            "provider_name": provider_name,
            "address": re.sub(r"\s+", " ", (value.get("address") or "").strip()),
            "source_facility_type": re.sub(r"\s+", " ", (value.get("facilitytype") or "").strip()),
            "facility_type": facility_type(provider_name),
            "state_prefix": prefix,
            "state_name": state_name,
            "resolved_place_id": place["place_id"] if place else None,
            "resolved_place_name": place["name"] if place else None,
            "ancestry_path": place["ancestry_path"] if place else "[]",
            "resolution_method": "nhia_provider_code_state_prefix" if place else "unresolved",
            "raw": value,
        }
        if not re.match(r"^[A-Z]{2,3}/\d{4}/[A-Z]$", provider_code or "") or not provider_name or not place:
            invalid.append(row)
            continue
        prepared.append(row)
    code_groups = defaultdict(list)
    for row in prepared:
        code_groups[row["provider_code"]].append(row)
    exact_groups = defaultdict(list)
    for row in prepared:
        key = (row["provider_code"], norm(row["provider_name"]), norm(row["address"]))
        exact_groups[key].append(row)
    normalized = []
    seen_exact = set()
    for row in prepared:
        exact_key = (row["provider_code"], norm(row["provider_name"]), norm(row["address"]))
        if exact_key in seen_exact:
            continue
        seen_exact.add(exact_key)
        merged_rows = exact_groups[exact_key]
        code_group = code_groups[row["provider_code"]]
        conflicting_code = len({(norm(item["provider_name"]), norm(item["address"])) for item in code_group}) > 1
        stable_key = f"nhia-hcp:{row['provider_code']}"
        if conflicting_code:
            stable_key = f"nhia-hcp:{row['provider_code']}:{row['source_record_id']}"
        source_record_ids = [item["source_record_id"] for item in merged_rows]
        source_record_hashes = [item["source_record_hash"] for item in merged_rows]
        facility_types = sorted({item["source_facility_type"] for item in merged_rows if item["source_facility_type"]})
        normalized.append({
            **row,
            "stable_key": stable_key,
            "source_record_ids": source_record_ids,
            "source_record_hashes": source_record_hashes,
            "merged_source_row_count": len(merged_rows),
            "source_facility_types": facility_types,
            "duplicate_code_strategy": "split_conflicting_provider_code_by_source_row" if conflicting_code else "provider_code_canonical",
        })
    return normalized, invalid


def main():
    states = parse_states()
    page_html, data_url, raw_rows, chunk_sizes = fetch_rows()
    data_url_template = re.sub(r"ninja_table_public_nonce=[^&]+", "ninja_table_public_nonce=<redacted-from-page>", data_url)
    RAW_PATH.write_text(json.dumps({"page_url": PAGE_URL, "data_url_template": data_url_template, "chunk_sizes": chunk_sizes, "rows": raw_rows}, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    normalized, invalid = normalize_rows(raw_rows, states)
    NORMALIZED_PATH.write_text(json.dumps({"providers": normalized, "rejected_rows": invalid}, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    state_counts = Counter(row["state_name"] for row in normalized)
    facility_counts = Counter(row["facility_type"] for row in normalized)
    source_facility_counts = Counter(row["source_facility_type"] for row in normalized)
    report = {
        "retrieved_at": "2026-04-21",
        "source_url": PAGE_URL,
        "source_key": SOURCE_KEY,
        "source_table_title": "ACTIVEACCREDITED NHIA HEALTHCARE PROVIDER.csv",
        "data_url_template": data_url_template,
        "chunk_sizes": chunk_sizes,
        "raw_row_count": len(raw_rows),
        "normalized_provider_count": len(normalized),
        "rejected_row_count": len(invalid),
        "merged_exact_duplicate_count": len(raw_rows) - len(invalid) - len(normalized),
        "state_counts": dict(state_counts),
        "facility_type_counts": dict(facility_counts),
        "source_facility_type_counts": dict(source_facility_counts),
        "raw_sha256": sha256_file(RAW_PATH),
        "normalized_sha256": sha256_file(NORMALIZED_PATH),
        "rejected_samples": invalid[:50],
        "notes": "Official NHIA public HCP table contains provider code, provider name, address, and source facility tier. Provider code prefixes are resolved conservatively to canonical Nigerian states only; no LGA or ward is inferred from addresses.",
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    raw_artifact_id = stable_id("seed_artifact_s06_", str(RAW_PATH.relative_to(ROOT)))
    normalized_artifact_id = stable_id("seed_artifact_s06_", str(NORMALIZED_PATH.relative_to(ROOT)))
    report_artifact_id = stable_id("seed_artifact_s06_", str(REPORT_PATH.relative_to(ROOT)))
    for row in normalized:
        first_source_record_id = row["source_record_ids"][0]
        first_source_hash = row["source_record_hashes"][0]
        row["org_id"] = stable_id("org_s06_nhia_hcp_", row["stable_key"])
        row["profile_id"] = stable_id("prof_s06_nhia_hcp_", row["stable_key"])
        row["clinic_profile_id"] = stable_id("clinic_prof_s06_nhia_", row["stable_key"])
        row["search_id"] = stable_id("srch_s06_nhia_hcp_", row["stable_key"])
        row["dedupe_id"] = stable_id("seed_dedupe_s06_nhia_", row["stable_key"])
        row["identity_id"] = stable_id("seed_identity_s06_nhia_", row["stable_key"])
        row["source_link_id"] = stable_id("seed_entity_source_s06_nhia_", row["stable_key"])
        row["ingestion_id"] = stable_id("seed_ingest_s06_nhia_", row["stable_key"])
        row["place_resolution_id"] = stable_id("seed_place_s06_nhia_", row["stable_key"])
        row["first_source_record_id"] = first_source_record_id
        row["first_source_record_hash"] = first_source_hash
        row["raw_json"] = json.dumps({"source_record_ids": row["source_record_ids"], "source_facility_types": row["source_facility_types"], "address": row["address"], "source_table_row_id": row["source_table_row_id"]}, ensure_ascii=False, sort_keys=True)
        row["normalized_json"] = json.dumps({"provider_code": row["provider_code"], "provider_name": row["provider_name"], "state_name": row["state_name"], "facility_type": row["facility_type"], "resolved_place_id": row["resolved_place_id"], "resolution_method": row["resolution_method"]}, ensure_ascii=False, sort_keys=True)
        row["keywords"] = keywords(row)
    with MIGRATION_PATH.open("w", encoding="utf-8") as handle:
        handle.write("BEGIN TRANSACTION;\n")
        handle.write(f"INSERT OR IGNORE INTO seed_runs (id, phase_id, phase_name, batch_name, environment, status, actor, source_manifest_uri, started_at, completed_at, rows_extracted, rows_inserted, rows_updated, rows_rejected, notes, created_at, updated_at) VALUES ({sql(SEED_RUN_ID)}, 'S06', 'Education and Health Official Registries', 'nhia-active-accredited-healthcare-providers', 'production', 'completed', 'replit-agent', 'docs/reports/phase-s06-education-health-source-manifest-2026-04-21.md', unixepoch(), unixepoch(), {len(raw_rows)}, {len(normalized)}, 0, {len(invalid)}, 'Seeded official NHIA public active accredited healthcare provider table as healthcare facility organizations, discovery profiles, clinic profiles, search entries, and provenance sidecars. Location is resolved only to state from NHIA provider-code prefix; no LGA/ward is inferred from address text.', unixepoch(), unixepoch());\n")
        handle.write(f"INSERT OR IGNORE INTO seed_sources (id, source_key, name, owner, source_type, confidence, url, access_method, license, publication_date, retrieved_at, source_hash, freshness_status, notes, created_at, updated_at) VALUES ({sql(SOURCE_ID)}, {sql(SOURCE_KEY)}, 'NHIA Active Accredited Healthcare Providers', 'National Health Insurance Authority', 'official_government', 'official_verified', {sql(PAGE_URL)}, 'public_nhia_web_table_ajax_json', 'public official directory', '2026-04-21', unixepoch(), {sql(report['raw_sha256'])}, 'current', 'Official NHIA Participating Health Care Providers web table. Extracted from the public Ninja Tables AJAX endpoint embedded in the NHIA HCP page.', unixepoch(), unixepoch());\n")
        artifacts = [
            {"id": raw_artifact_id, "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_type": "raw", "file_path": str(RAW_PATH.relative_to(ROOT)), "content_hash": report["raw_sha256"], "row_count": len(raw_rows), "schema_json": json.dumps({"columns": ["sno", "healthcareprovidercode", "healthcareprovidername", "address", "facilitytype", "___id___"]}, sort_keys=True), "extraction_script": "python3 infra/db/seed/scripts/generate_s06_nhia_hcp_sql.py", "status": "captured"},
            {"id": normalized_artifact_id, "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_type": "normalized", "file_path": str(NORMALIZED_PATH.relative_to(ROOT)), "content_hash": report["normalized_sha256"], "row_count": len(normalized), "schema_json": json.dumps({"place_resolution": "state_only_from_provider_code_prefix"}, sort_keys=True), "extraction_script": "python3 infra/db/seed/scripts/generate_s06_nhia_hcp_sql.py", "status": "parsed"},
            {"id": report_artifact_id, "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_type": "report", "file_path": str(REPORT_PATH.relative_to(ROOT)), "content_hash": sha256_file(REPORT_PATH), "row_count": len(normalized), "schema_json": "{}", "extraction_script": "python3 infra/db/seed/scripts/generate_s06_nhia_hcp_sql.py", "status": "parsed"},
        ]
        write_values(handle, "seed_raw_artifacts", ["id", "seed_run_id", "source_id", "artifact_type", "file_path", "content_hash", "row_count", "schema_json", "extraction_script", "status"], artifacts)
        write_values(handle, "organizations", ["id", "tenant_id", "name", "registration_number", "verification_state"], [{"id": row["org_id"], "tenant_id": TENANT_ID, "name": row["provider_name"], "registration_number": row["provider_code"], "verification_state": "unverified"} for row in normalized])
        write_values(handle, "profiles", ["id", "subject_type", "subject_id", "claim_state", "verification_state", "publication_state", "primary_place_id"], [{"id": row["profile_id"], "subject_type": "organization", "subject_id": row["org_id"], "claim_state": "seeded", "verification_state": "unverified", "publication_state": "published", "primary_place_id": row["resolved_place_id"]} for row in normalized])
        write_values(handle, "clinic_profiles", ["id", "organization_id", "workspace_id", "tenant_id", "facility_name", "facility_type", "mdcn_ref", "cac_reg_number", "bed_count", "status"], [{"id": row["clinic_profile_id"], "organization_id": row["org_id"], "workspace_id": WORKSPACE_ID, "tenant_id": TENANT_ID, "facility_name": row["provider_name"], "facility_type": row["facility_type"], "mdcn_ref": None, "cac_reg_number": row["provider_code"], "bed_count": 0, "status": "seeded"} for row in normalized])
        write_values(handle, "seed_dedupe_decisions", ["id", "seed_run_id", "entity_type", "canonical_key", "candidate_keys", "decision", "confidence", "reason", "decided_by"], [{"id": row["dedupe_id"], "seed_run_id": SEED_RUN_ID, "entity_type": "organization", "canonical_key": row["stable_key"], "candidate_keys": json.dumps(row["source_record_ids"], ensure_ascii=False, sort_keys=True), "decision": "canonical", "confidence": "official_verified", "reason": f"NHIA provider code retained as primary key. Exact same provider/code/address rows are merged; conflicting duplicate codes are split by source row. Strategy: {row['duplicate_code_strategy']}.", "decided_by": "replit-agent"} for row in normalized])
        write_values(handle, "seed_ingestion_records", ["id", "seed_run_id", "source_id", "artifact_id", "row_number", "source_record_id", "source_record_hash", "target_entity_type", "target_entity_id", "target_profile_id", "vertical_slug", "primary_place_id", "raw_json", "normalized_json", "record_status", "error_json"], [{"id": row["ingestion_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_id": normalized_artifact_id, "row_number": row["row_number"], "source_record_id": row["first_source_record_id"], "source_record_hash": row["first_source_record_hash"], "target_entity_type": "organization", "target_entity_id": row["org_id"], "target_profile_id": row["profile_id"], "vertical_slug": "clinic", "primary_place_id": row["resolved_place_id"], "raw_json": row["raw_json"], "normalized_json": row["normalized_json"], "record_status": "inserted", "error_json": "{}"} for row in normalized])
        write_values(handle, "seed_identity_map", ["id", "seed_run_id", "source_id", "source_record_id", "source_record_hash", "entity_type", "entity_id", "profile_id", "vertical_slug", "stable_key", "generation_method"], [{"id": row["identity_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "source_record_id": row["first_source_record_id"], "source_record_hash": row["first_source_record_hash"], "entity_type": "organization", "entity_id": row["org_id"], "profile_id": row["profile_id"], "vertical_slug": "clinic", "stable_key": row["stable_key"], "generation_method": "sha256_v1"} for row in normalized])
        write_values(handle, "seed_place_resolutions", ["id", "seed_run_id", "source_id", "source_record_id", "input_state", "input_lga", "input_ward", "explicit_place_id", "resolved_place_id", "resolution_level", "confidence", "status", "candidate_place_ids", "notes"], [{"id": row["place_resolution_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "source_record_id": row["first_source_record_id"], "input_state": row["state_prefix"], "input_lga": None, "input_ward": None, "explicit_place_id": None, "resolved_place_id": row["resolved_place_id"], "resolution_level": "state", "confidence": "official_verified", "status": "resolved", "candidate_place_ids": json.dumps([row["resolved_place_id"]]), "notes": f"NHIA provider code prefix {row['state_prefix']} resolved to canonical state {row['state_name']}; source table does not provide LGA or ward."} for row in normalized])
        write_values(handle, "seed_entity_sources", ["id", "seed_run_id", "source_id", "artifact_id", "dedupe_decision_id", "entity_type", "entity_id", "profile_id", "vertical_slug", "source_record_id", "source_record_hash", "confidence", "source_url", "extracted_at", "last_verified_at", "verification_state", "notes"], [{"id": row["source_link_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_id": normalized_artifact_id, "dedupe_decision_id": row["dedupe_id"], "entity_type": "organization", "entity_id": row["org_id"], "profile_id": row["profile_id"], "vertical_slug": "clinic", "source_record_id": row["first_source_record_id"], "source_record_hash": row["first_source_record_hash"], "confidence": "official_verified", "source_url": PAGE_URL, "extracted_at": "unixepoch()", "last_verified_at": "unixepoch()", "verification_state": "source_verified", "notes": "Official NHIA active accredited healthcare provider row seeded as healthcare facility organization/profile. Provider code retained as registration reference; location resolution is state-level only."} for row in normalized])
        write_values(handle, "search_entries", ["id", "entity_type", "entity_id", "tenant_id", "display_name", "keywords", "place_id", "ancestry_path", "visibility"], [{"id": row["search_id"], "entity_type": "organization", "entity_id": row["org_id"], "tenant_id": TENANT_ID, "display_name": row["provider_name"], "keywords": row["keywords"], "place_id": row["resolved_place_id"], "ancestry_path": row["ancestry_path"], "visibility": "public"} for row in normalized])
        handle.write(f"INSERT OR IGNORE INTO seed_search_rebuild_jobs (id, seed_run_id, batch_name, status, entity_type, entity_count, search_entries_count, queued_at, started_at, completed_at, fts_rebuilt_at, notes, created_at, updated_at) VALUES ('seed_search_rebuild_s06_nhia_hcp_20260421', {sql(SEED_RUN_ID)}, 'nhia-hcp-search-rebuild', 'completed', 'organization', {len(normalized)}, {len(normalized)}, unixepoch(), unixepoch(), unixepoch(), unixepoch(), 'NHIA HCP search entries inserted; search_fts rebuilt at end of migration.', unixepoch(), unixepoch());\n")
        handle.write("INSERT INTO search_fts(search_fts) VALUES('rebuild');\n")
        handle.write("COMMIT;\n")
    shutil.copyfile(MIGRATION_PATH, API_MIGRATION_PATH)
    shutil.copyfile(MIGRATION_PATH, SEED_MIRROR_PATH)
    print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True)[:6000])
    print(f"wrote {MIGRATION_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()