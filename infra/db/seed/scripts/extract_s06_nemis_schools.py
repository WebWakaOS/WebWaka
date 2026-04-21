import csv
import hashlib
import json
import re
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
SOURCE_DIR = ROOT / "infra" / "db" / "seed" / "sources"
DATE = "20260421"
BASE = "https://nemis.education.gov.ng"
USER_AGENT = "Mozilla/5.0 WebWakaOS-S06-Seeding/1.0"
TYPE_LABELS = {
    "1": "Pre-Primary",
    "2": "Primary",
    "3": "Junior Secondary",
    "4": "Senior Secondary",
}
EXPECTED_COLUMNS = ["State", "LGA", "School Code", "School Name", "Level of Education", "Sector", "Level Offered"]
STATE_ALIASES = {
    "ABUJA": "FCT",
    "FEDERAL CAPITAL TERRITORY": "FCT",
    "AKWA IBOM": "AKWA-IBOM",
    "CROSS RIVER": "CROSS-RIVER",
    "NASSARAWA": "NASARAWA",
}

def fetch(url, timeout=60):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    context = ssl._create_unverified_context()
    with urllib.request.urlopen(request, timeout=timeout, context=context) as response:
        return response.read(), dict(response.headers), response.status

def text_fetch(url, timeout=60):
    data, headers, status = fetch(url, timeout)
    return data.decode("utf-8", "replace"), headers, status

def norm_space(value):
    return re.sub(r"\s+", " ", (value or "").replace("\ufeff", " ").replace("\xa0", " ")).strip()

def norm_key(value):
    value = norm_space(value).upper().replace("&", " AND ")
    value = re.sub(r"[^A-Z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()

def slug(value):
    value = norm_key(value).lower()
    value = re.sub(r"[^a-z0-9]+", "_", value).strip("_")
    return value or "unknown"

def sha(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()

def csv_url(school_type, lga=""):
    return f"{BASE}/export-schools.php?lga={urllib.parse.quote(lga)}&school_type={school_type}&search="

def parse_csv(data):
    text = data.decode("utf-8-sig", "replace")
    reader = csv.DictReader(text.splitlines())
    rows = []
    for row in reader:
        if not row or all(not norm_space(v) for v in row.values()):
            continue
        rows.append({k: norm_space(row.get(k, "")) for k in EXPECTED_COLUMNS})
    return rows

def get_lgas():
    html, _, _ = text_fetch(f"{BASE}/schools.php", 60)
    match = re.search(r'<select[^>]*name="lga"[\s\S]*?</select>', html, re.I)
    values = []
    if match:
        for value in re.findall(r'<option\s+value="([^"]*)"', match.group(0), re.I):
            value = norm_space(value)
            if value:
                values.append(value)
    return sorted(set(values))

def direct_export(school_type):
    data, headers, status = fetch(csv_url(school_type), 90)
    return parse_csv(data), data, headers, status

def partitioned_export(school_type, lgas):
    all_rows = []
    raw_parts = []
    failures = []
    def fetch_lga(lga):
        url = csv_url(school_type, lga)
        try:
            data, headers, status = fetch(url, 45)
            rows = parse_csv(data)
            return rows, {"lga": lga, "row_count": len(rows), "status": status, "content_hash": sha(data.decode("utf-8", "replace")), "url": url}, None
        except Exception as exc:
            return [], None, {"lga": lga, "error": str(exc), "url": url}
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(fetch_lga, lga): lga for lga in lgas}
        for index, future in enumerate(as_completed(futures), 1):
            rows, part, failure = future.result()
            all_rows.extend(rows)
            if part:
                raw_parts.append(part)
            if failure:
                failures.append(failure)
            if index % 100 == 0:
                print(f"partitioned {school_type}: {index}/{len(lgas)}", flush=True)
    return all_rows, raw_parts, failures

def normalize_row(row, source_level):
    state = norm_key(row["State"])
    state = STATE_ALIASES.get(state, state)
    lga = norm_key(row["LGA"])
    school_code = norm_space(row["School Code"])
    school_name = norm_space(row["School Name"])
    level = norm_space(row["Level of Education"]) or source_level
    sector = norm_key(row["Sector"])
    if sector not in {"PUBLIC", "PRIVATE"}:
        sector = norm_space(row["Sector"]).upper() or "UNKNOWN"
    level_offered = norm_space(row["Level Offered"])
    source_record_id = f"nemis:{school_code}:{norm_key(level)}:{state}:{lga}"
    raw_json = json.dumps(row, ensure_ascii=False, sort_keys=True)
    return {
        "source_record_id": source_record_id,
        "source_record_hash": sha(raw_json),
        "school_code": school_code,
        "school_name": school_name,
        "state": state,
        "lga": lga,
        "level_of_education": level,
        "sector": sector,
        "level_offered": level_offered,
        "raw": row,
    }

def school_type_for(levels):
    joined = " ".join(norm_key(v) for v in levels)
    if "JUNIOR SECONDARY" in joined or "SENIOR SECONDARY" in joined:
        return "secondary"
    primary_without_preprimary = re.sub(r"\bPRE PRIMARY\b", " ", joined)
    if "PRIMARY" in primary_without_preprimary:
        return "primary"
    if "PRE PRIMARY" in joined or "ECCDE" in joined:
        return "nursery"
    return "others"

def cached_rows(path):
    if not path.exists():
        return None
    return parse_csv(path.read_bytes()), path.read_bytes()

def valid_for_canonical(row):
    if not row["state"] or not row["lga"]:
        return False, "missing_state_or_lga"
    if "<" in row["school_code"] or "NOTICE" in norm_key(row["school_code"]):
        return False, "html_error_row"
    if not row["school_name"]:
        return False, "missing_school_name"
    return True, None

def main():
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    lgas = get_lgas()
    print(f"discovered {len(lgas)} NEMIS LGA filter values", flush=True)
    extraction = {
        "source": "NEMIS Schools Directory CSV exports",
        "base_url": BASE,
        "retrieved_at": "2026-04-21",
        "school_type_exports": {},
        "lga_partition_count": len(lgas),
    }
    raw_rows = []
    raw_csv_paths = []
    for school_type, label in TYPE_LABELS.items():
        print(f"extracting NEMIS school_type={school_type} {label}", flush=True)
        direct_path = SOURCE_DIR / f"s06_nemis_schools_type_{school_type}_{slug(label)}_{DATE}.csv"
        partition_path = SOURCE_DIR / f"s06_nemis_schools_type_{school_type}_{slug(label)}_partitioned_{DATE}.csv"
        cached = cached_rows(direct_path) or cached_rows(partition_path)
        if cached:
            rows, data = cached
            path = direct_path if direct_path.exists() else partition_path
            raw_csv_paths.append(str(path.relative_to(ROOT)))
            extraction["school_type_exports"][school_type] = {
                "label": label,
                "mode": "cached_file",
                "row_count": len(rows),
                "file_path": str(path.relative_to(ROOT)),
                "content_hash": sha(data.decode("utf-8", "replace")),
                "url": csv_url(school_type),
            }
            for row in rows:
                raw_rows.append(normalize_row(row, label))
            continue
        try:
            rows, data, headers, status = direct_export(school_type)
            path = direct_path
            path.write_bytes(data)
            raw_csv_paths.append(str(path.relative_to(ROOT)))
            extraction["school_type_exports"][school_type] = {
                "label": label,
                "mode": "direct",
                "status": status,
                "row_count": len(rows),
                "file_path": str(path.relative_to(ROOT)),
                "content_hash": sha(data.decode("utf-8", "replace")),
                "url": csv_url(school_type),
            }
        except urllib.error.HTTPError as exc:
            rows, raw_parts, failures = partitioned_export(school_type, lgas)
            path = partition_path
            with path.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(handle, fieldnames=EXPECTED_COLUMNS)
                writer.writeheader()
                writer.writerows(rows)
            raw_csv_paths.append(str(path.relative_to(ROOT)))
            extraction["school_type_exports"][school_type] = {
                "label": label,
                "mode": "lga_partitioned_after_direct_http_error",
                "direct_error": str(exc),
                "row_count": len(rows),
                "file_path": str(path.relative_to(ROOT)),
                "content_hash": sha(path.read_text(encoding="utf-8")),
                "partition_count": len(raw_parts),
                "partition_failures": failures,
                "partition_manifest": raw_parts,
            }
        for row in rows:
            raw_rows.append(normalize_row(row, label))
    source_ids = Counter(row["source_record_id"] for row in raw_rows)
    duplicate_source_records = [key for key, count in source_ids.items() if count > 1]
    unique_source_rows = []
    seen_source = set()
    for row in raw_rows:
        if row["source_record_id"] in seen_source:
            continue
        seen_source.add(row["source_record_id"])
        unique_source_rows.append(row)
    groups = defaultdict(list)
    fallback_groups = defaultdict(list)
    rejected_rows = []
    for row in unique_source_rows:
        valid, reason = valid_for_canonical(row)
        if not valid:
            rejected_rows.append({**row, "rejection_reason": reason})
            continue
        code_key = norm_key(row["school_code"])
        if code_key:
            groups[f"code:{code_key}"].append(row)
        else:
            fallback = f"name_lga_sector:{norm_key(row['school_name'])}:{row['state']}:{row['lga']}:{row['sector']}"
            fallback_groups[fallback].append(row)
    schools = []
    for key, rows in groups.items():
        rows_sorted = sorted(rows, key=lambda item: (item["state"], item["lga"], item["school_name"], item["level_of_education"]))
        names = Counter(row["school_name"] for row in rows_sorted if row["school_name"])
        states = Counter(row["state"] for row in rows_sorted if row["state"])
        lgas_counter = Counter(row["lga"] for row in rows_sorted if row["lga"])
        sectors = Counter(row["sector"] for row in rows_sorted if row["sector"])
        school_code = rows_sorted[0]["school_code"]
        levels = sorted(set(row["level_of_education"] for row in rows_sorted if row["level_of_education"]))
        level_offered = sorted(set(row["level_offered"] for row in rows_sorted if row["level_offered"]))
        schools.append({
            "stable_key": key,
            "school_code": school_code,
            "school_name": names.most_common(1)[0][0] if names else f"NEMIS school {school_code}",
            "state": states.most_common(1)[0][0] if states else "",
            "lga": lgas_counter.most_common(1)[0][0] if lgas_counter else "",
            "sector": sectors.most_common(1)[0][0] if sectors else "UNKNOWN",
            "school_type": school_type_for(levels + level_offered),
            "levels": levels,
            "level_offered_values": level_offered,
            "source_record_ids": [row["source_record_id"] for row in rows_sorted],
            "source_record_hashes": [row["source_record_hash"] for row in rows_sorted],
            "row_count": len(rows_sorted),
            "dedupe_method": "official_school_code",
        })
    missing_code_rows = [row for row in unique_source_rows if not norm_key(row["school_code"])]
    for key, rows in fallback_groups.items():
        rows_sorted = sorted(rows, key=lambda item: item["source_record_id"])
        names = Counter(row["school_name"] for row in rows_sorted if row["school_name"])
        states = Counter(row["state"] for row in rows_sorted if row["state"])
        lgas_counter = Counter(row["lga"] for row in rows_sorted if row["lga"])
        sectors = Counter(row["sector"] for row in rows_sorted if row["sector"])
        levels = sorted(set(row["level_of_education"] for row in rows_sorted if row["level_of_education"]))
        level_offered = sorted(set(row["level_offered"] for row in rows_sorted if row["level_offered"]))
        schools.append({
            "stable_key": key,
            "school_code": "",
            "school_name": names.most_common(1)[0][0] if names else "Unnamed NEMIS school",
            "state": states.most_common(1)[0][0] if states else "",
            "lga": lgas_counter.most_common(1)[0][0] if lgas_counter else "",
            "sector": sectors.most_common(1)[0][0] if sectors else "UNKNOWN",
            "school_type": school_type_for(levels + level_offered),
            "levels": levels,
            "level_offered_values": level_offered,
            "source_record_ids": [row["source_record_id"] for row in rows_sorted],
            "source_record_hashes": [row["source_record_hash"] for row in rows_sorted],
            "row_count": len(rows_sorted),
            "dedupe_method": "name_state_lga_sector_missing_code",
        })
    normalized_path = SOURCE_DIR / f"s06_nemis_schools_normalized_{DATE}.json"
    normalized_path.write_text(json.dumps({"rows": unique_source_rows, "schools": schools}, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    report = {
        "retrieved_at": "2026-04-21",
        "source": extraction,
        "raw_row_count": len(raw_rows),
        "unique_source_row_count": len(unique_source_rows),
        "duplicate_source_record_count": len(duplicate_source_records),
        "canonical_school_count": len(schools),
        "missing_school_code_row_count": len(missing_code_rows),
        "rejected_source_row_count": len(rejected_rows),
        "rejection_reason_counts": dict(Counter(row["rejection_reason"] for row in rejected_rows)),
        "sector_counts": dict(Counter(school["sector"] for school in schools)),
        "school_type_counts": dict(Counter(school["school_type"] for school in schools)),
        "state_counts": dict(Counter(school["state"] for school in schools)),
        "dedupe_method_counts": dict(Counter(school["dedupe_method"] for school in schools)),
        "raw_csv_paths": raw_csv_paths,
        "normalized_path": str(normalized_path.relative_to(ROOT)),
    }
    report_path = SOURCE_DIR / f"s06_nemis_schools_extraction_report_{DATE}.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    print(json.dumps(report, indent=2, sort_keys=True)[:6000])

if __name__ == "__main__":
    main()
