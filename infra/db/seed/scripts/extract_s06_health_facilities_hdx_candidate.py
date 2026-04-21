import csv
import hashlib
import io
import json
import re
import urllib.request
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
SOURCE_DIR = ROOT / "infra" / "db" / "seed" / "sources"
DATE = "20260421"
CSV_URL = "https://data.humdata.org/dataset/3b4a119a-309c-4d3f-900f-18a1f6ca2dfa/resource/4658aa59-0554-4fac-8473-377da4b7a0e9/download/nigeriahealthfacilities.csv"
METADATA_URL = "https://data.humdata.org/api/3/action/package_show?id=nigeria-health-facilities"
RAW_CSV_PATH = SOURCE_DIR / f"s06_health_facilities_hdx_ehealth_candidate_{DATE}.csv"
NORMALIZED_PATH = SOURCE_DIR / f"s06_health_facilities_hdx_ehealth_candidate_normalized_{DATE}.json"
REPORT_PATH = SOURCE_DIR / f"s06_health_facilities_hdx_ehealth_candidate_report_{DATE}.json"

STATE_ALIASES = {
    "FCT": "FEDERAL CAPITAL TERRITORY",
    "ABUJA": "FEDERAL CAPITAL TERRITORY",
    "NASSARAWA": "NASARAWA",
    "AKWA-IBOM": "AKWA IBOM",
    "CROSS-RIVER": "CROSS RIVER",
}

LGA_ALIASES = {
    ("FEDERAL CAPITAL TERRITORY", "ABUJA MUNICIPAL AREA COUNCIL"): "ABUJA MUNICIPAL",
    ("FEDERAL CAPITAL TERRITORY", "MUNICIPAL"): "ABUJA MUNICIPAL",
    ("FEDERAL CAPITAL TERRITORY", "AMAC"): "ABUJA MUNICIPAL",
    ("ABIA", "OBI NWGA"): "OBI NGWA",
    ("BAYELSA", "YENEGOA"): "YENAGOA",
    ("OSUN", "AYEDADE"): "AYEDADE",
    ("OSUN", "AYEDE ADE"): "EGBEDORE",
    ("KEBBI", "DANKO WASAGU"): "WASAGU/DANKO",
    ("KEBBI", "ALIERO"): "ALEIRO",
    ("KADUNA", "JEMAA"): "JEMA'A",
    ("PLATEAU", "QUAANPAN"): "QUA'AN PAN",
    ("ZAMFARA", "BIRNI MAGAJI"): "BIRNIN MAGAJI/KIYAW",
    ("OYO", "OGBOMOSO NORTH"): "OGBOMOSHO NORTH",
    ("OYO", "OGBOMOSO SOUTH"): "OGBOMOSHO SOUTH",
    ("KANO", "MINGIBIR"): "MINJIBIR",
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


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "WebWakaSeedBot/1.0"})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def row_hash(row):
    return hashlib.sha256(json.dumps(row, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()


def parse_states():
    text = (ROOT / "infra" / "db" / "seed" / "nigeria_states.sql").read_text(encoding="utf-8")
    states = {}
    for place_id, name in re.findall(r"\('([^']+)',\s*'((?:''|[^'])*)',\s*'state'", text):
        states[place_id.replace("place_state_", "")] = name.replace("''", "'")
    return states


def parse_lgas():
    states = parse_states()
    text = (ROOT / "infra" / "db" / "seed" / "0002_lgas.sql").read_text(encoding="utf-8")
    lgas_by_state = defaultdict(dict)
    pattern = re.compile(r"\('([^']+)',\s*'((?:''|[^'])*)',\s*'local_government_area',\s*4,\s*'place_state_([^']+)',\s*'([^']+)'", re.M)
    for place_id, name, state_slug, ancestry_path in pattern.findall(text):
        state_name = states[state_slug]
        clean_name = name.replace("''", "'")
        row = {"place_id": place_id, "name": clean_name, "state": state_name, "state_key": norm(state_name), "lga_key": norm(clean_name), "ancestry_path": ancestry_path}
        lgas_by_state[row["state_key"]][row["lga_key"]] = row
    return lgas_by_state


def resolve_lga(row, lgas_by_state):
    state_key = STATE_ALIASES.get(norm(row.get("state_name")), norm(row.get("state_name")))
    lga_key = norm(row.get("lga_name"))
    choices = lgas_by_state.get(state_key, {})
    if lga_key in choices:
        return choices[lga_key], "exact"
    alias = LGA_ALIASES.get((state_key, lga_key))
    if alias and norm(alias) in choices:
        return choices[norm(alias)], "alias"
    best = None
    best_score = 0
    for candidate_key, candidate in choices.items():
        score = SequenceMatcher(None, lga_key, candidate_key).ratio()
        if score > best_score:
            best = candidate
            best_score = score
    if best and best_score >= 0.88:
        return best, f"fuzzy:{best_score:.3f}"
    return None, "unresolved"


def facility_type(row):
    category = norm(row.get("category"))
    source_type = norm(row.get("type"))
    if "PHARMACY" in category:
        return "pharmacy"
    if "LAB" in category:
        return "laboratory"
    if "MATERNITY" in category:
        return "maternity"
    if "DENT" in category:
        return "dental"
    if "HOSPITAL" in category or source_type in {"SECONDARY", "TERTIARY"}:
        return "hospital"
    if "CLINIC" in category or "HEALTH CENTER" in category or "DISPENSARY" in category:
        return "clinic"
    return "others"


def main():
    metadata_bytes = fetch(METADATA_URL)
    metadata = json.loads(metadata_bytes.decode("utf-8"))
    csv_bytes = fetch(CSV_URL)
    RAW_CSV_PATH.write_bytes(csv_bytes)
    rows = list(csv.DictReader(io.StringIO(csv_bytes.decode("utf-8-sig", "replace"))))
    lgas_by_state = parse_lgas()
    normalized = []
    unresolved = []
    resolution_counts = Counter()
    duplicate_counter = Counter()
    for index, row in enumerate(rows, start=1):
        source_record_id = row.get("global_id") or row.get("FID") or row.get("id") or str(index)
        duplicate_counter[source_record_id] += 1
    seen = Counter()
    for index, row in enumerate(rows, start=1):
        source_record_id = row.get("global_id") or row.get("FID") or row.get("id") or str(index)
        seen[source_record_id] += 1
        place, method = resolve_lga(row, lgas_by_state)
        resolution_counts[method] += 1
        stable_key = f"hdx-ehealth-health-facility:{source_record_id}"
        if duplicate_counter[source_record_id] > 1:
            stable_key = f"{stable_key}:{seen[source_record_id]}"
        item = {
            "row_number": index,
            "source_record_id": source_record_id,
            "source_record_hash": row_hash(row),
            "stable_key": stable_key,
            "facility_name": (row.get("name") or "").strip(),
            "alternate_name": (row.get("alternate_name") or "").strip(),
            "global_id": (row.get("global_id") or "").strip(),
            "functional_status": (row.get("functional_status") or "").strip(),
            "source_type": (row.get("type") or "").strip(),
            "facility_type": facility_type(row),
            "ward_code": (row.get("ward_code") or "").strip(),
            "category": (row.get("category") or "").strip(),
            "timestamp": (row.get("timestamp") or "").strip(),
            "accessibility": (row.get("accessibility") or "").strip(),
            "lga_name": (row.get("lga_name") or "").strip(),
            "lga_code": (row.get("lga_code") or "").strip(),
            "state_code": (row.get("state_code") or "").strip(),
            "state_name": (row.get("state_name") or "").strip(),
            "fid": (row.get("FID") or "").strip(),
            "resolved_place_id": place["place_id"] if place else None,
            "resolved_place_name": place["name"] if place else None,
            "resolution_method": method,
            "seed_authorization_status": "candidate_not_seeded",
            "seed_authorization_reason": "HDX row-level mirror is extracted for reconciliation, but direct official HFR/NCDC bulk access was unavailable from this environment; do not seed until source authority is approved or official endpoint is accessible.",
        }
        normalized.append(item)
        if not place and len(unresolved) < 500:
            unresolved.append({"row_number": index, "facility_name": item["facility_name"], "state_name": item["state_name"], "lga_name": item["lga_name"], "source_record_id": source_record_id})
    report = {
        "retrieved_at": "2026-04-21",
        "source_url": CSV_URL,
        "metadata_url": METADATA_URL,
        "csv_path": str(RAW_CSV_PATH.relative_to(ROOT)),
        "normalized_path": str(NORMALIZED_PATH.relative_to(ROOT)),
        "csv_sha256": sha256_bytes(csv_bytes),
        "metadata_sha256": sha256_bytes(metadata_bytes),
        "row_count": len(rows),
        "column_names": rows[0].keys() if rows else [],
        "dataset_metadata": {
            "title": metadata.get("result", {}).get("title"),
            "dataset_source": metadata.get("result", {}).get("dataset_source"),
            "dataset_date": metadata.get("result", {}).get("dataset_date"),
            "license_title": metadata.get("result", {}).get("license_title"),
            "caveats": metadata.get("result", {}).get("caveats"),
            "maintainer": metadata.get("result", {}).get("maintainer"),
            "metadata_modified": metadata.get("result", {}).get("metadata_modified"),
        },
        "seed_authorization_status": "candidate_not_seeded",
        "source_authority_assessment": "NCDC/HFR direct public endpoints were unavailable from this environment. The accessible HDX resource is row-level and source-backed, with dataset_source=e-health Africa and caveats pointing to africaopendata.org, but it is not being treated as sufficient for automatic WebWaka health seeding without official approval or successful official endpoint access.",
        "resolution_counts": dict(resolution_counts),
        "resolved_rows": sum(count for method, count in resolution_counts.items() if method != "unresolved"),
        "unresolved_rows": resolution_counts.get("unresolved", 0),
        "facility_type_counts": dict(Counter(item["facility_type"] for item in normalized)),
        "source_type_counts": dict(Counter(item["source_type"] for item in normalized)),
        "category_counts_top_50": dict(Counter(item["category"] for item in normalized).most_common(50)),
        "state_counts": dict(Counter(item["state_name"] for item in normalized)),
        "duplicate_source_record_ids": sum(1 for _, count in duplicate_counter.items() if count > 1),
        "unresolved_samples": unresolved,
    }
    NORMALIZED_PATH.write_text(json.dumps({"facilities": normalized}, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True, default=list), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True, default=list))


if __name__ == "__main__":
    main()
