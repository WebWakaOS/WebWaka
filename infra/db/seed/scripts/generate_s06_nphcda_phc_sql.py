from __future__ import annotations

import hashlib
import importlib.util
import json
import re
import shutil
import sqlite3
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
DATE = "20260421"
SOURCE_DIR = ROOT / "infra" / "db" / "seed" / "sources"
RAW_PATH = SOURCE_DIR / f"s06_nphcda_phc_raw_{DATE}.json"
NORMALIZED_PATH = SOURCE_DIR / f"s06_nphcda_phc_normalized_{DATE}.json"
REPORT_PATH = SOURCE_DIR / f"s06_nphcda_phc_report_{DATE}.json"
MIGRATION_PATH = ROOT / "infra" / "db" / "migrations" / "0309_health_nphcda_phc_seed.sql"
API_MIGRATION_PATH = ROOT / "apps" / "api" / "migrations" / "0309_health_nphcda_phc_seed.sql"
SEED_MIRROR_PATH = ROOT / "infra" / "db" / "seed" / "0010_nphcda_phc.sql"
TENANT_ID = "tenant_platform_seed"
WORKSPACE_ID = "workspace_platform_seed_discovery"
SEED_RUN_ID = "seed_run_s06_nphcda_phc_20260421"
SOURCE_ID = "seed_source_nphcda_phc_20260421"
SOURCE_KEY = "nphcda:primary-health-care-facility-dashboard:2026-04-21"
DASHBOARD_URL = "https://phc.nphcda.gov.ng/"
API_BASE = "https://api.nphcda.gov.ng/"
COUNTRY_ID = "09a25923-91c2-4412-87a1-310edfd878b9"
PHC_INDICATOR_ID = "e70967b3-10d8-416e-9c21-7f7278375ce9"
FACILITY_QUERY = f"indicators/{PHC_INDICATOR_ID}/?geo_json=false&country={COUNTRY_ID}"
LAST_UPDATED_QUERY = "boundary/last_updated/"
EXTRACTION_SCRIPT = "python3 infra/db/seed/scripts/generate_s06_nphcda_phc_sql.py"
PLACES_HELPER_PATH = ROOT / "infra" / "db" / "seed" / "scripts" / "generate_s05_polling_units_sql.py"
BASE_SQL = [
    ROOT / "infra" / "db" / "migrations" / "0001_init_places.sql",
    ROOT / "infra" / "db" / "seed" / "nigeria_country.sql",
    ROOT / "infra" / "db" / "seed" / "nigeria_zones.sql",
    ROOT / "infra" / "db" / "seed" / "nigeria_states.sql",
    ROOT / "infra" / "db" / "seed" / "0002_lgas.sql",
    ROOT / "infra" / "db" / "seed" / "0003_wards.sql",
]

spec = importlib.util.spec_from_file_location("polling_places", PLACES_HELPER_PATH)
places_helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(places_helper)
norm = places_helper.norm
norm_base = places_helper.norm_base
LGA_ALIAS = places_helper.LGA_ALIAS

STATE_ALIASES = {
    "fct": "place_state_fct",
    "abuja": "place_state_fct",
    "federal capital territory": "place_state_fct",
}

NPHCDA_LGA_ALIASES = {
    ("place_state_fct", "amac"): "place_lga_fct_amac",
    ("place_state_crossriver", "akamkpa urban"): "place_lga_crossriver_akamkpa",
    ("place_state_gombe", "shomgom"): "place_lga_gombe_shongom",
    ("place_state_katsina", "maiadua"): "place_lga_katsina_maiadua",
    ("place_state_katsina", "danmusa"): "place_lga_katsina_dan_musa",
    ("place_state_abia", "umunneochi"): "place_lga_abia_umu_nneochi",
    ("place_state_bayelsa", "yenegoa"): "place_lga_bayelsa_yenagoa",
    ("place_state_kano", "danbatta"): "place_lga_kano_dambatta",
    ("place_state_ogun", "ijebu northeast"): "place_lga_ogun_ijebu_north_east",
    ("place_state_jigawa", "kiri kasamma"): "place_lga_jigawa_kiri_kasama",
    ("place_state_borno", "mmc"): "place_lga_borno_maiduguri",
    ("place_state_oyo", "afijo"): "place_lga_oyo_afijio",
    ("place_state_ekiti", "aiyekire gbonyin"): "place_lga_ekiti_gbonyin",
    ("place_state_kano", "kano minicipal council"): "place_lga_kano_kano_municipal",
    ("place_state_kano", "nassarawa"): "place_lga_kano_nasarawa",
    ("place_state_lagos", "oshodi"): "place_lga_lagos_oshodi_isolo",
    ("place_state_akwaibom", "urueoffong oruko"): "place_lga_akwaibom_urue_offong",
    ("place_state_akwaibom", "ndung uko"): "place_lga_akwaibom_udung_uko",
}


def request(url: str) -> urllib.request.Request:
    return urllib.request.Request(
        url,
        headers={
            "User-Agent": "WebWakaSeedBot/1.0",
            "Accept": "application/json",
            "Referer": DASHBOARD_URL,
        },
    )


def fetch_json(path: str) -> dict:
    with urllib.request.urlopen(request(urllib.parse.urljoin(API_BASE, path)), timeout=120) as response:
        return json.loads(response.read().decode("utf-8"))


def sql(value):
    if value is None:
        return "NULL"
    if value == "unixepoch()":
        return "unixepoch()"
    if isinstance(value, int):
        return str(value)
    if isinstance(value, float):
        return repr(value)
    return "'" + str(value).replace("'", "''") + "'"


def stable_id(prefix: str, value: str, length: int = 24) -> str:
    return prefix + hashlib.sha256(value.encode("utf-8")).hexdigest()[:length]


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def row_hash(row: dict) -> str:
    return hashlib.sha256(json.dumps(row, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()


def load_places() -> dict:
    conn = sqlite3.connect(":memory:")
    for item in BASE_SQL:
        conn.executescript(item.read_text(encoding="utf-8"))
    states = {}
    for place_id, name, ancestry_path in conn.execute("SELECT id, name, ancestry_path FROM places WHERE geography_type = 'state'"):
        states[norm(name)] = {"id": place_id, "name": name, "ancestry_path": ancestry_path}
    for alias, place_id in STATE_ALIASES.items():
        row = conn.execute("SELECT id, name, ancestry_path FROM places WHERE id = ?", (place_id,)).fetchone()
        if row:
            states[alias] = {"id": row[0], "name": row[1], "ancestry_path": row[2]}
    lgas = {}
    for state_id, lga_id, name, ancestry_path in conn.execute("SELECT s.id, l.id, l.name, l.ancestry_path FROM places l JOIN places s ON s.id = l.parent_id WHERE l.geography_type = 'local_government_area'"):
        lgas[(state_id, norm(name))] = {"id": lga_id, "name": name, "ancestry_path": ancestry_path}
        lgas[(state_id, norm_base(name))] = {"id": lga_id, "name": name, "ancestry_path": ancestry_path}
    wards = {}
    for lga_id, ward_id, name, ancestry_path in conn.execute("SELECT l.id, w.id, w.name, w.ancestry_path FROM places w JOIN places l ON l.id = w.parent_id WHERE w.geography_type = 'ward'"):
        wards[(lga_id, norm(name))] = {"id": ward_id, "name": name, "ancestry_path": ancestry_path}
        wards[(lga_id, norm_base(name))] = {"id": ward_id, "name": name, "ancestry_path": ancestry_path}
    return {"states": states, "lgas": lgas, "wards": wards}


def clean_text(value) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def facility_type(name: str) -> str:
    key = norm(name)
    if "HOSPITAL" in key:
        return "hospital"
    if "MATERN" in key or "MCH" in key or "MOTHER AND CHILD" in key:
        return "maternity"
    if "LAB" in key or "DIAGNOSTIC" in key:
        return "laboratory"
    if "DENT" in key:
        return "dental"
    if "PHARM" in key:
        return "pharmacy"
    if "EYE" in key or "OPTICAL" in key:
        return "optical"
    if any(token in key for token in ["PHC", "PRIMARY HEALTH", "HEALTH CENTRE", "HEALTH CENTER", "HEALTH POST", "CLINIC", "DISPENSARY", "BASIC HEALTH", "COMPREHENSIVE HEALTH"]):
        return "clinic"
    return "others"


def keywords(row: dict) -> str:
    parts = [
        row["facility_name"],
        row["source_record_id"],
        row["source_facility_id"],
        row["facility_type"],
        row["ward_name"],
        row["lga_name"],
        row["state_name"],
        "nphcda",
        "primary health care",
        "phc",
        "healthcare",
        "health",
    ]
    seen = set()
    tokens = []
    for part in parts:
        for token in re.split(r"[^A-Za-z0-9]+", str(part or "").lower()):
            if token and token not in seen:
                seen.add(token)
                tokens.append(token)
    return " ".join(tokens)


def resolve_place(row: dict, places: dict) -> dict | None:
    state_name = clean_text(row.get("state_name"))
    lga_name = clean_text(row.get("lga_name"))
    ward_name = clean_text(row.get("ward_name"))
    state = places["states"].get(norm(state_name)) or places["states"].get(norm_base(state_name))
    if not state:
        return None
    lga = places["lgas"].get((state["id"], norm(lga_name))) or places["lgas"].get((state["id"], norm_base(lga_name)))
    alias_id = (
        LGA_ALIAS.get((state["id"], norm_base(lga_name)))
        or LGA_ALIAS.get((state["id"], norm(lga_name)))
        or NPHCDA_LGA_ALIASES.get((state["id"], norm_base(lga_name)))
        or NPHCDA_LGA_ALIASES.get((state["id"], norm(lga_name)))
    )
    if not lga and alias_id:
        lga = next((value for value in places["lgas"].values() if value["id"] == alias_id), None)
    if not lga:
        return {"status": "unresolved_lga", "state": state, "lga": None, "ward": None, "resolved": state, "level": "state"}
    ward = places["wards"].get((lga["id"], norm(ward_name))) or places["wards"].get((lga["id"], norm_base(ward_name)))
    if ward:
        return {"status": "resolved", "state": state, "lga": lga, "ward": ward, "resolved": ward, "level": "ward"}
    return {"status": "resolved", "state": state, "lga": lga, "ward": None, "resolved": lga, "level": "local_government_area"}


def normalize_rows(raw_rows: list[dict], places: dict) -> tuple[list[dict], list[dict], dict]:
    prepared = []
    invalid = []
    duplicate_ids = Counter(str(row.get("id")) for row in raw_rows if row.get("id") is not None)
    for index, item in enumerate(raw_rows, start=1):
        source_facility_id = str(item.get("id") or "").strip()
        facility_name = clean_text(item.get("health_facility_full_name"))
        place_resolution = resolve_place(item, places)
        source_record_id = f"nphcda-phc:{source_facility_id}" if source_facility_id else f"nphcda-phc:row:{index}"
        base = {
            "row_number": index,
            "source_facility_id": source_facility_id,
            "source_record_id": source_record_id,
            "source_record_hash": row_hash(item),
            "facility_name": facility_name,
            "facility_type": facility_type(facility_name),
            "state_name": clean_text(item.get("state_name")),
            "lga_name": clean_text(item.get("lga_name")),
            "ward_name": clean_text(item.get("ward_name")),
            "ward_id": clean_text(item.get("ward_id")),
            "longitude": item.get("longitude"),
            "latitude": item.get("latitude"),
            "front_view_photo_url": item.get("front_view_photo_url"),
            "average_rating": item.get("average_rating"),
            "raw": item,
        }
        if not source_facility_id or not facility_name or not place_resolution or duplicate_ids[source_facility_id] > 1:
            invalid.append({**base, "rejection_reason": "missing_id_name_place_or_duplicate_source_id"})
            continue
        if place_resolution["status"] == "unresolved_lga":
            invalid.append({**base, "rejection_reason": "unresolved_lga", "state_place_id": place_resolution["state"]["id"]})
            continue
        stable_key = f"nphcda-phc:{source_facility_id}"
        prepared.append({
            **base,
            "stable_key": stable_key,
            "state_place_id": place_resolution["state"]["id"],
            "state_place_name": place_resolution["state"]["name"],
            "lga_place_id": place_resolution["lga"]["id"] if place_resolution["lga"] else None,
            "lga_place_name": place_resolution["lga"]["name"] if place_resolution["lga"] else None,
            "ward_place_id": place_resolution["ward"]["id"] if place_resolution["ward"] else None,
            "ward_place_name": place_resolution["ward"]["name"] if place_resolution["ward"] else None,
            "resolved_place_id": place_resolution["resolved"]["id"],
            "resolved_place_name": place_resolution["resolved"]["name"],
            "ancestry_path": place_resolution["resolved"]["ancestry_path"],
            "resolution_level": place_resolution["level"],
        })
    duplicate_name_place = Counter((norm(row["facility_name"]), row["resolved_place_id"]) for row in prepared)
    duplicate_groups = {f"{name}|{place_id}": count for (name, place_id), count in duplicate_name_place.items() if count > 1}
    reconciliation = {
        "duplicate_source_ids": {key: count for key, count in duplicate_ids.items() if count > 1},
        "duplicate_normalized_name_place_groups": duplicate_groups,
    }
    return prepared, invalid, reconciliation


def load_nhia_cross_source_candidates(rows: list[dict]) -> dict:
    path = SOURCE_DIR / f"s06_nhia_hcp_normalized_{DATE}.json"
    if not path.exists():
        return {"nhia_normalized_path": str(path.relative_to(ROOT)), "status": "not_available", "exact_name_state_candidates": 0, "examples": []}
    nhia = json.loads(path.read_text(encoding="utf-8"))
    nhia_map = defaultdict(list)
    for provider in nhia.get("providers", []):
        nhia_map[(norm(provider.get("provider_name")), norm(provider.get("state_name")))].append({
            "provider_code": provider.get("provider_code"),
            "provider_name": provider.get("provider_name"),
            "state_name": provider.get("state_name"),
        })
    matches = []
    for row in rows:
        candidates = nhia_map.get((norm(row["facility_name"]), norm(row["state_name"])), [])
        if candidates:
            matches.append({
                "nphcda_source_facility_id": row["source_facility_id"],
                "facility_name": row["facility_name"],
                "state_name": row["state_name"],
                "lga_name": row["lga_name"],
                "ward_name": row["ward_name"],
                "nhia_candidates": candidates,
                "auto_merge_decision": "not_merged_nhia_lacks_lga_ward_for_safe_cross_source_identity",
            })
    return {
        "nhia_normalized_path": str(path.relative_to(ROOT)),
        "status": "reviewed",
        "exact_name_state_candidates": len(matches),
        "examples": matches[:50],
    }


def batches(rows, size=400):
    for index in range(0, len(rows), size):
        yield rows[index:index + size]


def write_values(handle, table: str, columns: list[str], rows: list[dict], chunk_size: int = 400) -> None:
    if not rows:
        return
    for chunk in batches(rows, chunk_size):
        handle.write(f"INSERT OR IGNORE INTO {table} ({', '.join(columns)}) VALUES\n")
        rendered = []
        for row in chunk:
            rendered.append("  (" + ", ".join(sql(row.get(column)) for column in columns) + ")")
        handle.write(",\n".join(rendered))
        handle.write(";\n")


def prepare_ids(rows: list[dict]) -> None:
    for row in rows:
        row["org_id"] = stable_id("org_s06_nphcda_phc_", row["stable_key"])
        row["profile_id"] = stable_id("prof_s06_nphcda_phc_", row["stable_key"])
        row["clinic_profile_id"] = stable_id("clinic_prof_s06_nphcda_", row["stable_key"])
        row["search_id"] = stable_id("srch_s06_nphcda_phc_", row["stable_key"])
        row["dedupe_id"] = stable_id("seed_dedupe_s06_nphcda_", row["stable_key"])
        row["identity_id"] = stable_id("seed_identity_s06_nphcda_", row["stable_key"])
        row["source_link_id"] = stable_id("seed_entity_source_s06_nphcda_", row["stable_key"])
        row["ingestion_id"] = stable_id("seed_ingest_s06_nphcda_", row["stable_key"])
        row["place_resolution_id"] = stable_id("seed_place_s06_nphcda_", row["stable_key"])
        row["enrichment_id"] = stable_id("seed_enrich_s06_nphcda_", row["stable_key"])
        row["raw_json"] = json.dumps({
            "source_facility_id": row["source_facility_id"],
            "ward_id": row["ward_id"],
            "longitude": row["longitude"],
            "latitude": row["latitude"],
            "front_view_photo_url": row["front_view_photo_url"],
            "average_rating": row["average_rating"],
        }, ensure_ascii=False, sort_keys=True)
        row["normalized_json"] = json.dumps({
            "facility_name": row["facility_name"],
            "facility_type": row["facility_type"],
            "state_name": row["state_name"],
            "lga_name": row["lga_name"],
            "ward_name": row["ward_name"],
            "resolved_place_id": row["resolved_place_id"],
            "resolution_level": row["resolution_level"],
        }, ensure_ascii=False, sort_keys=True)
        row["enrichment_json"] = json.dumps({
            "source": "NPHCDA PHC dashboard API",
            "source_facility_id": row["source_facility_id"],
            "source_ward_id": row["ward_id"],
            "source_state_name": row["state_name"],
            "source_lga_name": row["lga_name"],
            "source_ward_name": row["ward_name"],
            "longitude": row["longitude"],
            "latitude": row["latitude"],
            "front_view_photo_url": row["front_view_photo_url"],
            "average_rating": row["average_rating"],
        }, ensure_ascii=False, sort_keys=True)
        row["keywords"] = keywords(row)


def write_sql(rows: list[dict], report: dict, raw_artifact_id: str, normalized_artifact_id: str, report_artifact_id: str) -> None:
    with MIGRATION_PATH.open("w", encoding="utf-8") as handle:
        handle.write("BEGIN TRANSACTION;\n")
        handle.write(f"INSERT OR IGNORE INTO seed_runs (id, phase_id, phase_name, batch_name, environment, status, actor, source_manifest_uri, started_at, completed_at, rows_extracted, rows_inserted, rows_updated, rows_rejected, notes, created_at, updated_at) VALUES ({sql(SEED_RUN_ID)}, 'S06', 'Education and Health Official Registries', 'nphcda-primary-health-care-facilities', 'production', 'completed', 'replit-agent', 'docs/reports/phase-s06-education-health-source-manifest-2026-04-21.md', unixepoch(), unixepoch(), {report['raw_row_count']}, {len(rows)}, 0, {report['rejected_row_count']}, 'Seeded official NPHCDA PHC dashboard row-level primary health care facilities as healthcare facility organizations, discovery profiles, clinic profiles, search entries, enrichment sidecars, and provenance records. State/LGA are resolved from source fields; wards are used only when they match canonical seeded ward places exactly, otherwise records fall back to canonical LGA.', unixepoch(), unixepoch());\n")
        handle.write(f"INSERT OR IGNORE INTO seed_sources (id, source_key, name, owner, source_type, confidence, url, access_method, license, publication_date, retrieved_at, source_hash, freshness_status, notes, created_at, updated_at) VALUES ({sql(SOURCE_ID)}, {sql(SOURCE_KEY)}, 'NPHCDA Primary Health Care Facility Dashboard API', 'National Primary Health Care Development Agency', 'official_government', 'official_verified', {sql(DASHBOARD_URL)}, 'public_nphcda_dashboard_api_indicator_geo_data', 'public official dashboard data', '2026-04-21', unixepoch(), {sql(report['raw_sha256'])}, 'current', 'Official NPHCDA PHC dashboard API endpoint for the PHC indicator, containing row-level health facility geo_data plus source state, LGA, ward, coordinates, and photo URL fields.', unixepoch(), unixepoch());\n")
        artifacts = [
            {"id": raw_artifact_id, "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_type": "raw", "file_path": str(RAW_PATH.relative_to(ROOT)), "content_hash": report["raw_sha256"], "row_count": report["raw_row_count"], "schema_json": json.dumps({"api_endpoint": urllib.parse.urljoin(API_BASE, FACILITY_QUERY), "row_collection": "data.geo_data"}, sort_keys=True), "extraction_script": EXTRACTION_SCRIPT, "status": "captured"},
            {"id": normalized_artifact_id, "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_type": "normalized", "file_path": str(NORMALIZED_PATH.relative_to(ROOT)), "content_hash": report["normalized_sha256"], "row_count": len(rows), "schema_json": json.dumps({"place_resolution": "state_lga_exact_or_alias_ward_exact_else_lga"}, sort_keys=True), "extraction_script": EXTRACTION_SCRIPT, "status": "parsed"},
            {"id": report_artifact_id, "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_type": "report", "file_path": str(REPORT_PATH.relative_to(ROOT)), "content_hash": sha256_file(REPORT_PATH), "row_count": len(rows), "schema_json": "{}", "extraction_script": EXTRACTION_SCRIPT, "status": "parsed"},
        ]
        write_values(handle, "seed_raw_artifacts", ["id", "seed_run_id", "source_id", "artifact_type", "file_path", "content_hash", "row_count", "schema_json", "extraction_script", "status"], artifacts)
        write_values(handle, "organizations", ["id", "tenant_id", "name", "registration_number", "verification_state"], [{"id": row["org_id"], "tenant_id": TENANT_ID, "name": row["facility_name"], "registration_number": f"NPHCDA-PHC-{row['source_facility_id']}", "verification_state": "unverified"} for row in rows])
        write_values(handle, "profiles", ["id", "subject_type", "subject_id", "claim_state", "verification_state", "publication_state", "primary_place_id"], [{"id": row["profile_id"], "subject_type": "organization", "subject_id": row["org_id"], "claim_state": "seeded", "verification_state": "unverified", "publication_state": "published", "primary_place_id": row["resolved_place_id"]} for row in rows])
        write_values(handle, "clinic_profiles", ["id", "organization_id", "workspace_id", "tenant_id", "facility_name", "facility_type", "mdcn_ref", "cac_reg_number", "bed_count", "status"], [{"id": row["clinic_profile_id"], "organization_id": row["org_id"], "workspace_id": WORKSPACE_ID, "tenant_id": TENANT_ID, "facility_name": row["facility_name"], "facility_type": row["facility_type"], "mdcn_ref": None, "cac_reg_number": f"NPHCDA-PHC-{row['source_facility_id']}", "bed_count": 0, "status": "seeded"} for row in rows])
        write_values(handle, "seed_dedupe_decisions", ["id", "seed_run_id", "entity_type", "canonical_key", "candidate_keys", "decision", "confidence", "reason", "decided_by"], [{"id": row["dedupe_id"], "seed_run_id": SEED_RUN_ID, "entity_type": "organization", "canonical_key": row["stable_key"], "candidate_keys": json.dumps([row["source_record_id"]], ensure_ascii=False, sort_keys=True), "decision": "canonical", "confidence": "official_verified", "reason": "NPHCDA source facility id retained as canonical identity key. Cross-source NHIA exact name/state candidates are reported but not auto-merged because NHIA rows do not provide LGA/ward coordinates for safe identity collapse.", "decided_by": "replit-agent"} for row in rows])
        write_values(handle, "seed_ingestion_records", ["id", "seed_run_id", "source_id", "artifact_id", "row_number", "source_record_id", "source_record_hash", "target_entity_type", "target_entity_id", "target_profile_id", "vertical_slug", "primary_place_id", "raw_json", "normalized_json", "record_status", "error_json"], [{"id": row["ingestion_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_id": normalized_artifact_id, "row_number": row["row_number"], "source_record_id": row["source_record_id"], "source_record_hash": row["source_record_hash"], "target_entity_type": "organization", "target_entity_id": row["org_id"], "target_profile_id": row["profile_id"], "vertical_slug": "clinic", "primary_place_id": row["resolved_place_id"], "raw_json": row["raw_json"], "normalized_json": row["normalized_json"], "record_status": "inserted", "error_json": "{}"} for row in rows])
        write_values(handle, "seed_identity_map", ["id", "seed_run_id", "source_id", "source_record_id", "source_record_hash", "entity_type", "entity_id", "profile_id", "vertical_slug", "stable_key", "generation_method"], [{"id": row["identity_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "source_record_id": row["source_record_id"], "source_record_hash": row["source_record_hash"], "entity_type": "organization", "entity_id": row["org_id"], "profile_id": row["profile_id"], "vertical_slug": "clinic", "stable_key": row["stable_key"], "generation_method": "sha256_v1"} for row in rows])
        write_values(handle, "seed_place_resolutions", ["id", "seed_run_id", "source_id", "source_record_id", "input_state", "input_lga", "input_ward", "explicit_place_id", "resolved_place_id", "resolution_level", "confidence", "status", "candidate_place_ids", "notes"], [{"id": row["place_resolution_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "source_record_id": row["source_record_id"], "input_state": row["state_name"], "input_lga": row["lga_name"], "input_ward": row["ward_name"], "explicit_place_id": None, "resolved_place_id": row["resolved_place_id"], "resolution_level": row["resolution_level"], "confidence": "official_verified", "status": "resolved", "candidate_place_ids": json.dumps([value for value in [row["state_place_id"], row["lga_place_id"], row["ward_place_id"]] if value], ensure_ascii=False), "notes": f"NPHCDA source state/LGA/ward resolved to canonical {row['resolution_level']}; ward used only on exact canonical match, otherwise LGA fallback."} for row in rows])
        write_values(handle, "seed_entity_sources", ["id", "seed_run_id", "source_id", "artifact_id", "dedupe_decision_id", "entity_type", "entity_id", "profile_id", "vertical_slug", "source_record_id", "source_record_hash", "confidence", "source_url", "extracted_at", "last_verified_at", "verification_state", "notes"], [{"id": row["source_link_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_id": normalized_artifact_id, "dedupe_decision_id": row["dedupe_id"], "entity_type": "organization", "entity_id": row["org_id"], "profile_id": row["profile_id"], "vertical_slug": "clinic", "source_record_id": row["source_record_id"], "source_record_hash": row["source_record_hash"], "confidence": "official_verified", "source_url": urllib.parse.urljoin(API_BASE, FACILITY_QUERY), "extracted_at": "unixepoch()", "last_verified_at": "unixepoch()", "verification_state": "source_verified", "notes": "Official NPHCDA PHC dashboard facility row seeded as healthcare facility organization/profile with source facility id, source geography, coordinates, and photo URL preserved in seed enrichment."} for row in rows])
        write_values(handle, "seed_enrichment", ["id", "seed_run_id", "entity_type", "entity_id", "profile_id", "vertical_slug", "source_id", "enrichment_json", "pii_classification", "lawful_basis", "last_reviewed_at"], [{"id": row["enrichment_id"], "seed_run_id": SEED_RUN_ID, "entity_type": "organization", "entity_id": row["org_id"], "profile_id": row["profile_id"], "vertical_slug": "clinic", "source_id": SOURCE_ID, "enrichment_json": row["enrichment_json"], "pii_classification": "public", "lawful_basis": "public official government dashboard", "last_reviewed_at": "unixepoch()"} for row in rows])
        write_values(handle, "search_entries", ["id", "entity_type", "entity_id", "tenant_id", "display_name", "keywords", "place_id", "ancestry_path", "visibility"], [{"id": row["search_id"], "entity_type": "organization", "entity_id": row["org_id"], "tenant_id": TENANT_ID, "display_name": row["facility_name"], "keywords": row["keywords"], "place_id": row["resolved_place_id"], "ancestry_path": row["ancestry_path"], "visibility": "public"} for row in rows])
        handle.write(f"INSERT OR IGNORE INTO seed_search_rebuild_jobs (id, seed_run_id, batch_name, status, entity_type, entity_count, search_entries_count, queued_at, started_at, completed_at, fts_rebuilt_at, notes, created_at, updated_at) VALUES ('seed_search_rebuild_s06_nphcda_phc_20260421', {sql(SEED_RUN_ID)}, 'nphcda-phc-search-rebuild', 'completed', 'organization', {len(rows)}, {len(rows)}, unixepoch(), unixepoch(), unixepoch(), unixepoch(), 'NPHCDA PHC search entries inserted; search_fts rebuilt at end of migration.', unixepoch(), unixepoch());\n")
        handle.write("INSERT INTO search_fts(search_fts) VALUES('rebuild');\n")
        handle.write("COMMIT;\n")


def main() -> None:
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    places = load_places()
    last_updated = fetch_json(LAST_UPDATED_QUERY)
    raw = fetch_json(FACILITY_QUERY)
    raw_rows = raw.get("data", {}).get("geo_data", [])
    RAW_PATH.write_text(json.dumps({"dashboard_url": DASHBOARD_URL, "api_endpoint": urllib.parse.urljoin(API_BASE, FACILITY_QUERY), "last_updated_endpoint": urllib.parse.urljoin(API_BASE, LAST_UPDATED_QUERY), "last_updated": last_updated, "response": raw}, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    normalized, invalid, reconciliation = normalize_rows(raw_rows, places)
    prepare_ids(normalized)
    cross_source = load_nhia_cross_source_candidates(normalized)
    NORMALIZED_PATH.write_text(json.dumps({"facilities": normalized, "rejected_rows": invalid}, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    state_counts = Counter(row["state_name"] for row in normalized)
    lga_counts = Counter(row["state_name"] for row in normalized)
    resolution_counts = Counter(row["resolution_level"] for row in normalized)
    facility_counts = Counter(row["facility_type"] for row in normalized)
    report = {
        "retrieved_at": "2026-04-21",
        "source_url": DASHBOARD_URL,
        "api_endpoint": urllib.parse.urljoin(API_BASE, FACILITY_QUERY),
        "source_key": SOURCE_KEY,
        "indicator_id": PHC_INDICATOR_ID,
        "raw_row_count": len(raw_rows),
        "api_total_count": raw.get("data", {}).get("total_count"),
        "api_total_facility_count": raw.get("total_facility_count"),
        "normalized_facility_count": len(normalized),
        "rejected_row_count": len(invalid),
        "state_counts": dict(state_counts),
        "state_count": len(state_counts),
        "lga_count": len({row["lga_place_id"] for row in normalized if row.get("lga_place_id")}),
        "resolution_counts": dict(resolution_counts),
        "facility_type_counts": dict(facility_counts),
        "duplicate_source_ids": reconciliation["duplicate_source_ids"],
        "duplicate_normalized_name_place_groups_count": len(reconciliation["duplicate_normalized_name_place_groups"]),
        "duplicate_normalized_name_place_group_samples": dict(list(reconciliation["duplicate_normalized_name_place_groups"].items())[:50]),
        "rejected_samples": invalid[:50],
        "last_updated": last_updated.get("data", {}),
        "cross_source_nhia_exact_name_state_review": cross_source,
        "raw_sha256": sha256_file(RAW_PATH),
        "normalized_sha256": sha256_file(NORMALIZED_PATH),
        "notes": "Official NPHCDA PHC dashboard API contains 26,711 row-level PHC facilities at retrieval. State/LGA names are source-provided and reconciled to canonical places. Wards are used only when exact canonical ward match succeeds; otherwise rows fall back to LGA. Exact NHIA name/state candidate overlaps are reported but not merged automatically because NHIA source lacks LGA/ward/coordinates.",
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    raw_artifact_id = stable_id("seed_artifact_s06_", str(RAW_PATH.relative_to(ROOT)))
    normalized_artifact_id = stable_id("seed_artifact_s06_", str(NORMALIZED_PATH.relative_to(ROOT)))
    report_artifact_id = stable_id("seed_artifact_s06_", str(REPORT_PATH.relative_to(ROOT)))
    write_sql(normalized, report, raw_artifact_id, normalized_artifact_id, report_artifact_id)
    shutil.copyfile(MIGRATION_PATH, API_MIGRATION_PATH)
    shutil.copyfile(MIGRATION_PATH, SEED_MIRROR_PATH)
    print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True)[:6000])
    print(f"wrote {MIGRATION_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
