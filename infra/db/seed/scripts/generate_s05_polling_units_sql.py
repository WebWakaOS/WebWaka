from __future__ import annotations

import hashlib
import json
import re
import sqlite3
import unicodedata
from pathlib import Path

SOURCE_PATH = Path("infra/db/seed/sources/s05_inec_polling_units_cvr_20260421.json")
RECONCILIATION_PATH = Path("infra/db/seed/sources/s05_inec_polling_units_reconciliation_20260421.json")
MIGRATION_PATH = Path("infra/db/migrations/0306_political_polling_units_seed.sql")
API_MIRROR_PATH = Path("apps/api/migrations/0306_political_polling_units_seed.sql")
SEED_PATH = Path("infra/db/seed/0007_polling_units.sql")
BASE_SQL = [
    "infra/db/migrations/0001_init_places.sql",
    "infra/db/seed/nigeria_country.sql",
    "infra/db/seed/nigeria_zones.sql",
    "infra/db/seed/nigeria_states.sql",
    "infra/db/seed/0002_lgas.sql",
    "infra/db/seed/0003_wards.sql",
]
STATE_CODES = {
    "ABIA": "01",
    "ADAMAWA": "02",
    "AKWA IBOM": "03",
    "ANAMBRA": "04",
    "BAUCHI": "05",
    "BAYELSA": "06",
    "BENUE": "07",
    "BORNO": "08",
    "CROSS RIVER": "09",
    "DELTA": "10",
    "EBONYI": "11",
    "EDO": "12",
    "EKITI": "13",
    "ENUGU": "14",
    "GOMBE": "15",
    "IMO": "16",
    "JIGAWA": "17",
    "KADUNA": "18",
    "KANO": "19",
    "KATSINA": "20",
    "KEBBI": "21",
    "KOGI": "22",
    "KWARA": "23",
    "LAGOS": "24",
    "NASARAWA": "25",
    "NIGER": "26",
    "OGUN": "27",
    "ONDO": "28",
    "OSUN": "29",
    "OYO": "30",
    "PLATEAU": "31",
    "RIVERS": "32",
    "SOKOTO": "33",
    "TARABA": "34",
    "YOBE": "35",
    "ZAMFARA": "36",
    "FCT": "37",
}
TOKEN_ALIAS = {"11": "ii", "111": "iii", "1v": "iv", "v1": "vi", "v11": "vii", "v111": "viii", "x1": "xi", "x11": "xii", "x111": "xiii", "1": "i", "2": "ii", "3": "iii", "4": "iv", "5": "v", "6": "vi", "7": "vii", "8": "viii", "9": "ix", "10": "x"}
LGA_ALIAS = {
    ("place_state_abia", "obingwa"): "place_lga_abia_obi_ngwa",
    ("place_state_abia", "osisioma"): "place_lga_abia_osisioma_ngwa",
    ("place_state_adamawa", "fufore"): "place_lga_adamawa_fufure",
    ("place_state_adamawa", "girei"): "place_lga_adamawa_grie",
    ("place_state_adamawa", "guyuk"): "place_lga_adamawa_gayuk",
    ("place_state_akwaibom", "esit eket uquo"): "place_lga_akwaibom_esit_eket",
    ("place_state_bauchi", "dambam"): "place_lga_bauchi_damban",
    ("place_state_borno", "maiduguri m c"): "place_lga_borno_maiduguri",
    ("place_state_borno", "maiduguri municipal"): "place_lga_borno_maiduguri",
    ("place_state_crossriver", "calabar municipality"): "place_lga_crossriver_calabar_muni",
    ("place_state_edo", "uhunmwode"): "place_lga_edo_uhunmwonde",
    ("place_state_fct", "municipal"): "place_lga_fct_amac",
    ("place_state_gombe", "yalmaltu deba"): "place_lga_gombe_yamaltu_deba",
    ("place_state_imo", "ezinihitte mbaise"): "place_lga_imo_ezinihitte",
    ("place_state_imo", "onuimo"): "place_lga_imo_unuimo",
    ("place_state_jigawa", "birniwa"): "place_lga_jigawa_biriniwa",
    ("place_state_jigawa", "kirika samma"): "place_lga_jigawa_kiri_kasama",
    ("place_state_jigawa", "malam madori"): "place_lga_jigawa_malam_maduri",
    ("place_state_kano", "danbata"): "place_lga_kano_dambatta",
    ("place_state_kano", "dawaki kudu"): "place_lga_kano_dawakin_kudu",
    ("place_state_kano", "dawaki tofa"): "place_lga_kano_dawakin_tofa",
    ("place_state_kano", "garun malam"): "place_lga_kano_garun_mallam",
    ("place_state_katsina", "malufashi"): "place_lga_katsina_malumfashi",
    ("place_state_kebbi", "aliero"): "place_lga_kebbi_aleiro",
    ("place_state_kebbi", "arewa"): "place_lga_kebbi_arewa_dandi",
    ("place_state_kogi", "kogi k k"): "place_lga_kogi_kogi",
    ("place_state_kogi", "mopa moro"): "place_lga_kogi_mopa_muro",
    ("place_state_kogi", "ogori mangogo"): "place_lga_kogi_ogori_magongo",
    ("place_state_kwara", "patigi"): "place_lga_kwara_pategi",
    ("place_state_lagos", "ifako ijaye"): "place_lga_lagos_ifako_ijaiye",
    ("place_state_lagos", "somolu"): "place_lga_lagos_shomolu",
    ("place_state_nasarawa", "nasarawa eggon"): "place_lga_nasarawa_nasarawa_egon",
    ("place_state_niger", "edatti"): "place_lga_niger_edati",
    ("place_state_niger", "munya"): "place_lga_niger_moya",
    ("place_state_ogun", "egbado north"): "place_lga_ogun_yewa_north",
    ("place_state_ogun", "egbado south"): "place_lga_ogun_yewa_south",
    ("place_state_ogun", "ogun water side"): "place_lga_ogun_ogun_waterside",
    ("place_state_ondo", "ileoluji okeigbo"): "place_lga_ondo_ile_oluji",
    ("place_state_osun", "ayedaade"): "place_lga_osun_aiyedaade",
    ("place_state_osun", "ayedire"): "place_lga_osun_aiyedire",
    ("place_state_oyo", "ogbomoso north"): "place_lga_oyo_ogbomosho_north",
    ("place_state_oyo", "ogbomoso south"): "place_lga_oyo_ogbomosho_south",
    ("place_state_oyo", "oorelope"): "place_lga_oyo_orelope",
    ("place_state_plateau", "barikin ladi"): "place_lga_plateau_barkin_ladi",
    ("place_state_sokoto", "s birni"): "place_lga_sokoto_sabon_birni",
    ("place_state_sokoto", "wamakko"): "place_lga_sokoto_wamako",
    ("place_state_taraba", "kurmi"): "place_lga_taraba_kumi",
    ("place_state_yobe", "karasawa"): "place_lga_yobe_karasuwa",
    ("place_state_yobe", "tarmuwa"): "place_lga_yobe_tarmua",
    ("place_state_zamfara", "birnin magaji"): "place_lga_zamfara_birnin_magaji",
}


def sql(value: object) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, int):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def norm_base(value: str | None) -> str:
    text = unicodedata.normalize("NFKD", value or "").encode("ascii", "ignore").decode("ascii").lower()
    text = text.replace("&", " and ")
    text = re.sub(r"\b(st)\b[ .]*", "saint ", text)
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def norm(value: str | None) -> str:
    return " ".join(TOKEN_ALIAS.get(token, token) for token in norm_base(value).split())


def stable_hash(value: str, length: int = 20) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:length]


def load_places() -> tuple[dict[str, str], dict[tuple[str, str], str], dict[tuple[str, str], str]]:
    conn = sqlite3.connect(":memory:")
    for item in BASE_SQL:
        conn.executescript(Path(item).read_text())
    states = {norm(name): place_id for name, place_id in conn.execute("SELECT name, id FROM places WHERE geography_type = 'state'")}
    states["fct"] = "place_state_fct"
    lgas = {(state_id, norm(name)): place_id for state_id, name, place_id in conn.execute("SELECT s.id, l.name, l.id FROM places l JOIN places s ON s.id = l.parent_id WHERE l.geography_type = 'local_government_area'")}
    wards = {(lga_id, norm(name)): place_id for lga_id, name, place_id in conn.execute("SELECT l.id, w.name, w.id FROM places w JOIN places l ON l.id = w.parent_id WHERE w.geography_type = 'ward'")}
    return states, lgas, wards


def flatten() -> tuple[list[tuple], dict]:
    source = json.loads(SOURCE_PATH.read_text())
    states, lgas, wards = load_places()
    rows = []
    duplicate_codes = {}
    unmatched_lgas = []
    unmatched_wards = []
    ward_matched = 0
    ward_lga_fallback = 0
    source_records = set()
    official_codes = set()
    for state in source["states"]:
        state_name = state["state_name"]
        state_code = STATE_CODES[state_name]
        state_place_id = states[norm(state_name)] if state_name != "FCT" else "place_state_fct"
        for lga in state["lgas"]:
            lga_key = (state_place_id, norm(lga["lga_name"]))
            lga_place_id = lgas.get(lga_key) or LGA_ALIAS.get((state_place_id, norm_base(lga["lga_name"]))) or LGA_ALIAS.get((state_place_id, norm(lga["lga_name"])))
            if not lga_place_id:
                unmatched_lgas.append({"state_name": state_name, "lga_name": lga["lga_name"], "lga_api_id": lga["lga_api_id"], "polling_units": sum(len(ward["polling_units"]) for ward in lga["wards"])})
                lga_place_id = state_place_id
            for ward in lga["wards"]:
                ward_place_id = wards.get((lga_place_id, norm(ward["ward_name"]))) or wards.get((lga_place_id, norm_base(ward["ward_name"])))
                if ward_place_id:
                    resolution_level = "ward"
                    resolved_place_id = ward_place_id
                    ward_matched += 1
                else:
                    resolution_level = "local_government_area" if lga_place_id != state_place_id else "state"
                    resolved_place_id = lga_place_id
                    ward_lga_fallback += 1
                    unmatched_wards.append({"state_name": state_name, "lga_name": lga["lga_name"], "ward_name": ward["ward_name"], "ward_api_id": ward["ward_api_id"], "polling_units": len(ward["polling_units"]), "fallback_place_id": resolved_place_id, "fallback_level": resolution_level})
                for polling_unit in ward["polling_units"]:
                    official_code = "-".join([state_code, lga.get("lga_code") or lga["lga_api_id"], ward.get("ward_code") or ward["ward_api_id"], polling_unit.get("polling_unit_code") or polling_unit["polling_unit_api_id"]])
                    source_record_id = f"inec-cvr-pu:{state['state_api_id']}:{lga['lga_api_id']}:{ward['ward_api_id']}:{polling_unit['polling_unit_api_id']}"
                    if source_record_id in source_records:
                        raise RuntimeError(f"duplicate source record {source_record_id}")
                    source_records.add(source_record_id)
                    duplicate_codes[official_code] = duplicate_codes.get(official_code, 0) + 1
                    source_record_hash = hashlib.sha256(json.dumps({"state": state_name, "lga": lga, "ward": ward["raw_label"], "polling_unit": polling_unit}, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()
                    short = stable_hash(source_record_id)
                    place_id = f"place_polling_unit_{short}"
                    profile_id = f"profile_polling_unit_{short}"
                    polling_unit_profile_id = f"polling_unit_profile_{short}"
                    display_name = f"{polling_unit['polling_unit_name']} Polling Unit"
                    keywords = " ".join(dict.fromkeys(norm(f"{display_name} {official_code} {ward['ward_name']} {lga['lga_name']} {state_name} INEC polling unit voting registration area").split()))
                    raw = json.dumps({"state_api_id": state["state_api_id"], "state_name": state_name, "lga_api_id": lga["lga_api_id"], "lga_raw_label": lga["raw_label"], "ward_api_id": ward["ward_api_id"], "ward_raw_label": ward["raw_label"], "polling_unit_api_id": polling_unit["polling_unit_api_id"], "polling_unit_raw_label": polling_unit["raw_label"]}, ensure_ascii=False, sort_keys=True)
                    rows.append((
                        f"polling_unit_{short}", place_id, profile_id, polling_unit_profile_id, official_code, state_code, lga.get("lga_code"), ward.get("ward_code"), polling_unit.get("polling_unit_code"),
                        state["state_api_id"], lga["lga_api_id"], ward["ward_api_id"], polling_unit["polling_unit_api_id"], state_name, lga["lga_name"], ward["ward_name"], polling_unit["polling_unit_name"], display_name,
                        state_place_id, lga_place_id, ward_place_id, resolved_place_id, resolution_level, source_record_id, source_record_hash, raw, keywords,
                    ))
                    official_codes.add(official_code)
    duplicate_official_codes = {key: value for key, value in duplicate_codes.items() if value > 1}
    reconciliation = {
        "source_path": str(SOURCE_PATH),
        "source_hash": hashlib.sha256(SOURCE_PATH.read_bytes()).hexdigest(),
        "rows": len(rows),
        "unique_source_records": len(source_records),
        "unique_official_polling_unit_codes": len(official_codes),
        "duplicate_official_polling_unit_codes": duplicate_official_codes,
        "unmatched_lgas": unmatched_lgas,
        "ward_resolution": {"source_registration_areas": ward_matched + ward_lga_fallback, "ward_matched": ward_matched, "fallback_to_lga_or_state": ward_lga_fallback, "unmatched_ward_rows": unmatched_wards[:1000], "unmatched_ward_rows_total": len(unmatched_wards), "unmatched_ward_polling_units": sum(item["polling_units"] for item in unmatched_wards)},
    }
    return rows, reconciliation


def write_values(handle, table: str, columns: list[str], rows: list[tuple], chunk_size: int = 500) -> None:
    for index in range(0, len(rows), chunk_size):
        chunk = rows[index:index + chunk_size]
        handle.write(f"INSERT OR IGNORE INTO {table} ({', '.join(columns)}) VALUES\n")
        handle.write(",\n".join("(" + ", ".join(sql(value) for value in row) + ")" for row in chunk))
        handle.write(";\n")


def main() -> None:
    rows, reconciliation = flatten()
    if reconciliation["rows"] != 176846:
        raise RuntimeError(f"expected 176846 polling units, got {reconciliation['rows']}")
    if reconciliation["duplicate_official_polling_unit_codes"]:
        raise RuntimeError("duplicate official polling unit codes found")
    RECONCILIATION_PATH.write_text(json.dumps(reconciliation, ensure_ascii=False, indent=2, sort_keys=True))
    source_hash = reconciliation["source_hash"]
    reconciliation_hash = hashlib.sha256(RECONCILIATION_PATH.read_bytes()).hexdigest()
    columns = ["id", "place_id", "profile_id", "polling_unit_profile_id", "official_polling_unit_code", "state_code", "lga_code", "ward_code", "polling_unit_code", "state_api_id", "lga_api_id", "ward_api_id", "polling_unit_api_id", "state_name", "lga_name", "ward_name", "polling_unit_name", "display_name", "state_place_id", "lga_place_id", "ward_place_id", "resolved_place_id", "resolution_level", "source_record_id", "source_record_hash", "raw_json", "keywords"]
    with MIGRATION_PATH.open("w") as handle:
        handle.write("CREATE TABLE IF NOT EXISTS polling_units (id TEXT PRIMARY KEY, place_id TEXT NOT NULL UNIQUE REFERENCES places(id), profile_id TEXT NOT NULL UNIQUE REFERENCES profiles(id), polling_unit_profile_id TEXT NOT NULL UNIQUE, official_polling_unit_code TEXT NOT NULL UNIQUE, state_code TEXT NOT NULL, lga_code TEXT, ward_code TEXT, polling_unit_code TEXT, state_api_id TEXT NOT NULL, lga_api_id TEXT NOT NULL, ward_api_id TEXT NOT NULL, polling_unit_api_id TEXT NOT NULL, state_name TEXT NOT NULL, lga_name TEXT NOT NULL, ward_name TEXT NOT NULL, polling_unit_name TEXT NOT NULL, display_name TEXT NOT NULL, state_place_id TEXT NOT NULL REFERENCES places(id), lga_place_id TEXT NOT NULL REFERENCES places(id), ward_place_id TEXT REFERENCES places(id), resolved_place_id TEXT NOT NULL REFERENCES places(id), resolution_level TEXT NOT NULL CHECK (resolution_level IN ('ward','local_government_area','state')), source_record_id TEXT NOT NULL UNIQUE, source_record_hash TEXT NOT NULL, raw_json TEXT NOT NULL, keywords TEXT NOT NULL, verification_state TEXT NOT NULL DEFAULT 'source_verified', created_at INTEGER NOT NULL DEFAULT (unixepoch()), updated_at INTEGER NOT NULL DEFAULT (unixepoch()));\n")
        handle.write("CREATE TABLE IF NOT EXISTS polling_unit_profiles (id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, place_id TEXT NOT NULL, polling_unit_id TEXT NOT NULL, official_polling_unit_code TEXT NOT NULL, state_place_id TEXT NOT NULL, lga_place_id TEXT NOT NULL, ward_place_id TEXT, source_id TEXT, verification_state TEXT NOT NULL DEFAULT 'source_verified', created_at INTEGER NOT NULL DEFAULT (unixepoch()), updated_at INTEGER NOT NULL DEFAULT (unixepoch()));\n")
        handle.write("CREATE INDEX IF NOT EXISTS idx_polling_units_state ON polling_units(state_place_id);\nCREATE INDEX IF NOT EXISTS idx_polling_units_lga ON polling_units(lga_place_id);\nCREATE INDEX IF NOT EXISTS idx_polling_units_ward ON polling_units(ward_place_id);\nCREATE INDEX IF NOT EXISTS idx_polling_units_code ON polling_units(official_polling_unit_code);\nCREATE INDEX IF NOT EXISTS idx_polling_unit_profiles_place ON polling_unit_profiles(place_id);\n")
        handle.write("INSERT OR IGNORE INTO seed_runs (id, phase_id, phase_name, batch_name, environment, status, actor, source_manifest_uri, started_at, completed_at, rows_extracted, rows_inserted, rows_updated, rows_rejected, notes, created_at, updated_at) VALUES ('seed_run_s05_polling_units_20260421', 'S05', 'Political and Electoral Foundation', 'inec-cvr-polling-units', 'production', 'completed', 'replit-agent', 'docs/reports/phase-s05-political-foundation-source-manifest-2026-04-21.md', unixepoch(), unixepoch(), 176846, 176846, 0, 0, 'Seeded 176,846 official INEC CVR polling units as polling-unit facility places, discovery profiles, vertical profiles, provenance sidecars, and search entries. Registration areas matched to canonical wards where possible and otherwise resolved to official canonical LGA/state with documented reconciliation.', unixepoch(), unixepoch());\n")
        handle.write(f"INSERT OR IGNORE INTO seed_sources (id, source_key, name, owner, source_type, confidence, url, access_method, license, publication_date, retrieved_at, source_hash, freshness_status, notes, created_at, updated_at) VALUES ('seed_source_inec_cvr_polling_units_20260421', 'inec:cvr-polling-units-public-api:retrieved-2026-04-21', 'INEC CVR Polling Unit Locator Public API', 'Independent National Electoral Commission', 'official_government', 'official_verified', 'https://cvr.inecnigeria.org/pu', 'public_api_extraction', 'public official electoral locator; no explicit open-data license found', '2026-04-21', unixepoch(), '{source_hash}', 'current', 'Official CVR public API extraction with 9,621 response hashes covering state-to-LGA, LGA-to-registration-area, and registration-area-to-polling-unit endpoints.', unixepoch(), unixepoch());\n")
        handle.write(f"INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, source_id, artifact_type, file_path, content_hash, row_count, schema_json, extraction_script, status, created_at, updated_at) VALUES ('seed_artifact_s05_inec_cvr_polling_units_json_20260421', 'seed_run_s05_polling_units_20260421', 'seed_source_inec_cvr_polling_units_20260421', 'raw', 'infra/db/seed/sources/s05_inec_polling_units_cvr_20260421.json', '{source_hash}', 176846, '{{\"states\":37,\"lgas\":774,\"registration_areas\":8810,\"polling_units\":176846,\"fetch_hashes\":9621}}', 'infra/db/seed/scripts/extract_inec_polling_units.py and concurrent API extraction notebook', 'parsed', unixepoch(), unixepoch());\n")
        handle.write(f"INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, source_id, artifact_type, file_path, content_hash, row_count, schema_json, extraction_script, status, created_at, updated_at) VALUES ('seed_artifact_s05_inec_cvr_polling_units_reconciliation_20260421', 'seed_run_s05_polling_units_20260421', 'seed_source_inec_cvr_polling_units_20260421', 'report', 'infra/db/seed/sources/s05_inec_polling_units_reconciliation_20260421.json', '{reconciliation_hash}', 176846, '{{\"ward_matched\":{reconciliation['ward_resolution']['ward_matched']},\"fallback_to_lga_or_state\":{reconciliation['ward_resolution']['fallback_to_lga_or_state']},\"unmatched_ward_polling_units\":{reconciliation['ward_resolution']['unmatched_ward_polling_units']}}}', 'infra/db/seed/scripts/generate_s05_polling_units_sql.py', 'parsed', unixepoch(), unixepoch());\n")
        write_values(handle, "polling_units", columns, rows)
        handle.write("INSERT OR IGNORE INTO places (id, name, geography_type, level, parent_id, ancestry_path, tenant_id, created_at, updated_at) SELECT pu.place_id, pu.display_name, 'polling_unit', 6, pu.resolved_place_id, CASE WHEN p.ancestry_path = '[]' THEN '[' || json_quote(p.id) || ']' ELSE substr(p.ancestry_path, 1, length(p.ancestry_path) - 1) || ',' || json_quote(p.id) || ']' END, NULL, unixepoch(), unixepoch() FROM polling_units pu JOIN places p ON p.id = pu.resolved_place_id;\n")
        handle.write("INSERT OR IGNORE INTO profiles (id, subject_type, subject_id, claim_state, verification_state, publication_state, primary_place_id, created_at, updated_at) SELECT profile_id, 'place', place_id, 'claimable', 'source_verified', 'published', resolved_place_id, unixepoch(), unixepoch() FROM polling_units;\n")
        handle.write("INSERT OR IGNORE INTO polling_unit_profiles (id, profile_id, place_id, polling_unit_id, official_polling_unit_code, state_place_id, lga_place_id, ward_place_id, source_id, verification_state, created_at, updated_at) SELECT polling_unit_profile_id, profile_id, place_id, id, official_polling_unit_code, state_place_id, lga_place_id, ward_place_id, 'seed_source_inec_cvr_polling_units_20260421', 'source_verified', unixepoch(), unixepoch() FROM polling_units;\n")
        handle.write("INSERT OR IGNORE INTO search_entries (id, entity_type, entity_id, tenant_id, display_name, keywords, place_id, ancestry_path, visibility, created_at, updated_at) SELECT 'srch_' || place_id, 'place', place_id, 'tenant_platform_seed', display_name, keywords, resolved_place_id, p.ancestry_path, 'public', unixepoch(), unixepoch() FROM polling_units pu JOIN places p ON p.id = pu.resolved_place_id;\n")
        handle.write("INSERT OR IGNORE INTO seed_ingestion_records (id, seed_run_id, source_id, artifact_id, row_number, source_record_id, source_record_hash, target_entity_type, target_entity_id, target_profile_id, vertical_slug, primary_place_id, raw_json, normalized_json, record_status, error_json, created_at, updated_at) SELECT 'seed_ingestion_s05_pu_' || substr(id, 14), 'seed_run_s05_polling_units_20260421', 'seed_source_inec_cvr_polling_units_20260421', 'seed_artifact_s05_inec_cvr_polling_units_json_20260421', row_number() OVER (ORDER BY official_polling_unit_code), source_record_id, source_record_hash, 'place', place_id, profile_id, 'polling-unit', resolved_place_id, raw_json, json_object('place_id', place_id, 'profile_id', profile_id, 'polling_unit_profile_id', polling_unit_profile_id, 'official_polling_unit_code', official_polling_unit_code, 'resolution_level', resolution_level), 'inserted', '{}', unixepoch(), unixepoch() FROM polling_units;\n")
        handle.write("INSERT OR IGNORE INTO seed_identity_map (id, seed_run_id, source_id, source_record_id, source_record_hash, entity_type, entity_id, profile_id, vertical_slug, stable_key, generation_method, created_at, updated_at) SELECT 'seed_identity_s05_pu_' || substr(id, 14), 'seed_run_s05_polling_units_20260421', 'seed_source_inec_cvr_polling_units_20260421', source_record_id, source_record_hash, 'place', place_id, profile_id, 'polling-unit', official_polling_unit_code, 'official_polling_unit_composite_code_v1', unixepoch(), unixepoch() FROM polling_units;\n")
        handle.write("INSERT OR IGNORE INTO seed_place_resolutions (id, seed_run_id, source_id, source_record_id, input_state, input_lga, input_ward, explicit_place_id, resolved_place_id, resolution_level, confidence, status, candidate_place_ids, notes, created_at, updated_at) SELECT 'seed_place_resolution_s05_pu_' || substr(id, 14), 'seed_run_s05_polling_units_20260421', 'seed_source_inec_cvr_polling_units_20260421', source_record_id, state_name, lga_name, ward_name, NULL, resolved_place_id, resolution_level, 'official_verified', 'resolved', json_array(state_place_id, lga_place_id, COALESCE(ward_place_id, '')), CASE WHEN resolution_level = 'ward' THEN 'INEC registration area reconciled to canonical ward.' ELSE 'INEC registration area did not exactly reconcile to canonical S01 ward; polling unit resolved to official canonical LGA/state and listed in reconciliation artifact.' END, unixepoch(), unixepoch() FROM polling_units;\n")
        handle.write("INSERT OR IGNORE INTO seed_entity_sources (id, seed_run_id, source_id, artifact_id, entity_type, entity_id, profile_id, vertical_slug, source_record_id, source_record_hash, confidence, source_url, extracted_at, last_verified_at, verification_state, notes, created_at, updated_at) SELECT 'seed_entity_source_s05_pu_' || substr(id, 14), 'seed_run_s05_polling_units_20260421', 'seed_source_inec_cvr_polling_units_20260421', 'seed_artifact_s05_inec_cvr_polling_units_json_20260421', 'place', place_id, profile_id, 'polling-unit', source_record_id, source_record_hash, 'official_verified', 'https://cvr.inecnigeria.org/pu', unixepoch(), unixepoch(), 'source_verified', 'Official INEC CVR polling-unit locator row seeded as polling-unit facility place and profile.', unixepoch(), unixepoch() FROM polling_units;\n")
        handle.write("INSERT OR IGNORE INTO seed_search_rebuild_jobs (id, seed_run_id, batch_name, status, entity_type, entity_count, search_entries_count, queued_at, started_at, completed_at, fts_rebuilt_at, notes, created_at, updated_at) VALUES ('seed_search_rebuild_s05_polling_units_20260421', 'seed_run_s05_polling_units_20260421', 'polling-unit-search-rebuild', 'completed', 'place', 176846, 176846, unixepoch(), unixepoch(), unixepoch(), unixepoch(), 'Polling-unit search entries inserted; search_fts rebuilt at end of migration.', unixepoch(), unixepoch());\n")
        handle.write("DELETE FROM search_fts;\nINSERT INTO search_fts(rowid, entity_id, display_name, keywords) SELECT rowid, entity_id, display_name, keywords FROM search_entries;\n")
    content = MIGRATION_PATH.read_text()
    API_MIRROR_PATH.write_text(content)
    SEED_PATH.write_text(content)
    print(json.dumps({"migration": str(MIGRATION_PATH), "rows": len(rows), "source_hash": source_hash, "reconciliation_hash": reconciliation_hash, "migration_hash": hashlib.sha256(MIGRATION_PATH.read_bytes()).hexdigest(), "ward_resolution": reconciliation["ward_resolution"]}, indent=2))


if __name__ == "__main__":
    main()
