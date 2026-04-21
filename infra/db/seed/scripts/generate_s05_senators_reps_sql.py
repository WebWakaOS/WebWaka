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
SEED_RUN_ID = "seed_run_s05_political_foundation_senators_reps_20260421"
SOURCE_ID = "seed_source_nass_legislators_20260421"
RAW_PATH = SOURCE_DIR / f"s05_nass_legislators_raw_{DATE}.json"
NORMALIZED_PATH = SOURCE_DIR / f"s05_nass_legislators_normalized_{DATE}.json"
REPORT_PATH = SOURCE_DIR / f"s05_nass_legislators_report_{DATE}.json"
MIGRATION_PATH = ROOT / "infra" / "db" / "migrations" / "0311_political_senators_reps_seed.sql"
API_MIGRATION_PATH = ROOT / "apps" / "api" / "migrations" / "0311_political_senators_reps_seed.sql"
SEED_MIRROR_PATH = ROOT / "infra" / "db" / "seed" / "0012_political_senators_reps.sql"
NASS_BASE = "https://nass.gov.ng/mps/get_legislators"
JUR_SQL = ROOT / "infra" / "db" / "migrations" / "0303_jurisdiction_seed.sql"
TERM_SENATORS = "term_ng_10th_national_assembly_2023_2027"

DISTRICT_ALIASES = {
    "fct": "federal capital territory",
    "abuja": "federal capital territory",
    "north west": None,  # require state-prefix join
    "north east": None,
    "north central": None,
    "south west": None,
    "south east": None,
    "south south": None,
    "central": None,
}

STATE_ALIASES = {
    "nassarawa": "nasarawa",
    "akwa-ibom": "akwa ibom",
    "akwa ibom": "akwa ibom",
    "cross-river": "cross river",
    "cross river": "cross river",
    "fct": "federal capital territory",
    "abuja": "federal capital territory",
}

# Manual federal constituency aliases for reps districts where the NASS short
# label does not literally match the official INEC constituency string.
# Each value is a normalized INEC name (lowercase, alnum, single spaces) that
# uniquely identifies a federal_constituency jurisdiction within the same state.
REP_CONSTITUENCY_ALIASES = {
    # state: { normalized NASS district : normalized INEC fed-constituency name }
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
    s = (value or "").strip().lower()
    s = s.replace("&", " and ").replace("/", " ").replace("-", " ").replace(",", " ")
    s = s.replace(".", " ")
    s = re.sub(r"\bfederal constituency\b", " ", s)
    s = re.sub(r"\bconstituency\b", " ", s)
    s = re.sub(r"\blocal govt\b", " ", s)
    s = re.sub(r"\blocal government\b", " ", s)
    s = re.sub(r"\b(lga|lgas|l g a|l g as)\b", " ", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    # spelling normalizations across NASS/INEC variants
    s = re.sub(r"\bnassarawa\b", "nasarawa", s)
    s = re.sub(r"\bahaoda\b", "ahoada", s)
    s = re.sub(r"\baleiro\b", "aliero", s)
    s = re.sub(r"\bobokon\b", "obokun", s)
    s = re.sub(r"\bopkokwu\b", "okpokwu", s)
    s = re.sub(r"\bsomolu\b", "shomolu", s)
    s = re.sub(r"\bopke\b", "okpe", s)
    s = re.sub(r"\bisuikwato\b", "isuikwuato", s)
    s = re.sub(r"\bumunneochi\b", "umu nneochi", s)
    s = re.sub(r"\bkirikasamma\b", "kiri kasamma", s)
    s = re.sub(r"\bkiri kasamma\b", "kirikasama", s)
    s = re.sub(r"\borhionmwon\b", "orhionwon", s)
    s = re.sub(r"\borelope\b", "oorelope", s)
    s = re.sub(r"\bolurunsogo\b", "olorunsogo", s)
    s = re.sub(r"\bquan pan\b", "qua an pan", s)
    s = re.sub(r"\bndokwa\b", "ndokwa east ndokwa west", s)
    s = re.sub(r"\bethiope\b", "ethiope east ethiope west", s)
    s = re.sub(r"\bika\b", "ika north east ika south", s)
    return s


def fetch_json(url):
    ctx = ssl._create_unverified_context()
    request = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=90, context=ctx) as response:
        return json.loads(response.read().decode("utf-8"))


def parse_jurisdictions():
    text = JUR_SQL.read_text(encoding="utf-8")
    sen = {}
    fed = {}
    place_state = {}
    for m in re.finditer(r"\('(place_(?:senatorial_district|federal_constituency)_[a-z0-9_]+)',\s*'((?:''|[^'])*)',\s*'(senatorial_district|federal_constituency)',\s*\d+,\s*'(place_state_[a-z]+)'", text):
        place_id, _name, _ttype, parent = m.group(1), m.group(2), m.group(3), m.group(4)
        place_state[place_id] = parent
    for m in re.finditer(r"\('(jur_(?:senatorial_district|federal_constituency)_[a-z0-9_]+)',\s*'(place_(?:senatorial_district|federal_constituency)_[a-z0-9_]+)',\s*'(senatorial_district|federal_constituency)',\s*'((?:''|[^'])+)'", text):
        jur_id, place_id, ttype, name = m.group(1), m.group(2), m.group(3), m.group(4).replace("''", "'")
        state_place = place_state.get(place_id)
        record = {"jur_id": jur_id, "place_id": place_id, "name": name, "state_place_id": state_place}
        bucket = sen if ttype == "senatorial_district" else fed
        bucket.setdefault(state_place or "_unknown", []).append(record)
    return sen, fed


def parse_states():
    text = (ROOT / "infra" / "db" / "seed" / "nigeria_states.sql").read_text(encoding="utf-8")
    by_norm = {}
    pattern = re.compile(r"\('(place_state_[a-z]+)',\s*'((?:''|[^'])+)',\s*'state',\s*3,\s*'[^']+',\s*'([^']+)'", re.M)
    for place_id, name, ancestry_path in pattern.findall(text):
        clean = name.replace("''", "'")
        by_norm[norm(clean)] = {"id": place_id, "name": clean, "ancestry_path": ancestry_path}
    # FCT lives in nigeria_states.sql under "Federal Capital Territory"; ensure alias.
    return by_norm


def resolve_state(state_text, states_by_norm):
    key = STATE_ALIASES.get(norm(state_text), norm(state_text))
    return states_by_norm.get(key)


def resolve_senate_jur(state_record, district_text, sen_juris):
    if not state_record:
        return None, "unresolved_state"
    pool = sen_juris.get(state_record["id"]) or []
    if not pool:
        return None, "no_senatorial_districts_for_state"
    raw_district = norm(district_text)
    state_norm = norm(state_record["name"])
    aliased = STATE_ALIASES.get(norm(district_text), None)
    candidate_norm = raw_district
    # If district lacks state-prefix (e.g. "FCT", "North West"), prepend state name.
    state_prefixed = candidate_norm
    if not candidate_norm.startswith(state_norm.split()[0]):
        state_prefixed = (state_norm + " " + candidate_norm).strip()
    target_options = {candidate_norm, state_prefixed}
    if aliased:
        target_options.add(norm(aliased))
    if candidate_norm == "fct":
        target_options.add("federal capital territory")
    for jur in pool:
        if norm(jur["name"]) in target_options:
            return jur, "exact"
    # last resort: token jaccard within state
    best, best_score = None, 0.0
    cand_tokens = set(state_prefixed.split())
    for jur in pool:
        jt = set(norm(jur["name"]).split())
        if not jt:
            continue
        score = len(cand_tokens & jt) / max(1, len(cand_tokens | jt))
        if score > best_score:
            best, best_score = jur, score
    if best and best_score >= 0.6:
        return best, f"fuzzy_{best_score:.2f}"
    return None, "no_match"


def resolve_fed_jur(state_record, district_text, fed_juris):
    if not state_record:
        return None, "unresolved_state"
    pool = fed_juris.get(state_record["id"]) or []
    if not pool:
        return None, "no_federal_constituencies_for_state"
    target = norm(district_text)
    target_tokens = set(target.split())
    # exact normalized name
    for jur in pool:
        if norm(jur["name"]) == target:
            return jur, "exact"
    # alias
    aliases = REP_CONSTITUENCY_ALIASES.get(state_record["id"], {})
    if target in aliases:
        for jur in pool:
            if norm(jur["name"]) == aliases[target]:
                return jur, "alias"
    # token jaccard within state pool with uniqueness gate
    scored = []
    for jur in pool:
        jt = set(norm(jur["name"]).split())
        if not jt:
            continue
        inter = len(target_tokens & jt)
        union = len(target_tokens | jt)
        jaccard = inter / union if union else 0
        # containment of target tokens by INEC name (handles abbreviated NASS labels)
        containment = inter / max(1, len(target_tokens))
        score = max(jaccard, containment * 0.9)
        scored.append((score, jaccard, containment, jur))
    scored.sort(key=lambda x: x[0], reverse=True)
    if not scored:
        return None, "no_candidates"
    best_score, best_jaccard, best_containment, best = scored[0]
    second_score = scored[1][0] if len(scored) > 1 else 0
    if best_score >= 0.5 and (best_score - second_score) >= 0.1:
        return best, f"fuzzy_{best_score:.2f}"
    if best_score >= 0.7:
        return best, f"fuzzy_{best_score:.2f}"
    # uniquely best (no other candidate has any token overlap) and at least one token shared
    if best_score >= 0.30 and second_score == 0 and best_containment >= 0.4:
        return best, f"fuzzy_unique_{best_score:.2f}"
    return None, f"no_match_best_{best_score:.2f}_second_{second_score:.2f}"


def split_name(full_name):
    parts = [p for p in re.split(r"\s+", full_name.strip()) if p]
    if not parts:
        return "Unknown", "Unknown", None
    if len(parts) == 1:
        return parts[0], parts[0], None
    if len(parts) == 2:
        return parts[0], parts[1], None
    return parts[0], parts[-1], " ".join(parts[1:-1])


def keywords(parts):
    seen = set()
    out = []
    for part in parts:
        for token in re.split(r"[^A-Za-z0-9]+", str(part or "").lower()):
            if token and token not in seen:
                seen.add(token)
                out.append(token)
    return " ".join(out)


def write_values(handle, table, columns, rows, size=400):
    if not rows:
        return
    for start in range(0, len(rows), size):
        batch = rows[start:start + size]
        handle.write(f"INSERT OR IGNORE INTO {table} ({', '.join(columns)}) VALUES\n")
        handle.write(",\n".join("  (" + ", ".join(sql(row.get(column)) for column in columns) + ")" for row in batch))
        handle.write(";\n")


def normalize_chamber(raw_rows, chamber, states_by_norm, sen_juris, fed_juris):
    seeded = []
    deferred = []
    for index, r in enumerate(raw_rows, start=1):
        if not isinstance(r, list) or len(r) < 5:
            deferred.append({"chamber": chamber, "row_number": index, "row": r, "reason": "malformed_row"})
            continue
        full_name, state_text, district_text, party_acronym, mp_id = r[0], r[1], r[2], r[3], r[4]
        state_rec = resolve_state(state_text, states_by_norm)
        if chamber == "senate":
            jur, decision = resolve_senate_jur(state_rec, district_text, sen_juris)
            office = "senator"
            term_id = TERM_SENATORS
        else:
            jur, decision = resolve_fed_jur(state_rec, district_text, fed_juris)
            office = "hor"
            term_id = TERM_SENATORS
        if not jur:
            deferred.append({"chamber": chamber, "row_number": index, "row": r, "reason": decision, "state": state_text, "district": district_text})
            continue
        first, last, middle = split_name(full_name)
        stable = f"nass:{chamber}:{mp_id}"
        ind_id = stable_id("indiv_s05_nass_", stable)
        prof_id = stable_id("prof_s05_nass_", stable)
        polit_id = stable_id("polit_prof_s05_nass_", stable)
        assign_id = stable_id("polit_assign_s05_nass_", stable)
        party_aff_id = stable_id("party_aff_s05_nass_", stable)
        search_id = stable_id("srch_s05_nass_", stable)
        dedupe_id = stable_id("seed_dedupe_s05_nass_", stable)
        identity_id = stable_id("seed_identity_s05_nass_", stable)
        ingestion_id = stable_id("seed_ingest_s05_nass_", stable)
        place_resolution_id = stable_id("seed_place_s05_nass_", stable)
        entity_source_id = stable_id("seed_entity_source_s05_nass_", stable)
        enrichment_id = stable_id("seed_enrichment_s05_nass_", stable)
        party_org_id = f"org_political_party_{party_acronym.lower().strip()}" if party_acronym else None
        rec = {
            "chamber": chamber,
            "office_type": office,
            "term_id": term_id,
            "source_record_id": stable,
            "source_record_hash": hashlib.sha256(json.dumps(r, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest(),
            "mp_id": mp_id,
            "full_name": full_name.strip(),
            "first_name": first,
            "last_name": last,
            "middle_name": middle,
            "display_name": ("Sen. " if chamber == "senate" else "Hon. ") + full_name.strip(),
            "state_text": state_text,
            "district_text": district_text,
            "party_acronym": party_acronym,
            "party_org_id": party_org_id,
            "state_place_id": state_rec["id"],
            "state_place_name": state_rec["name"],
            "ancestry_path": state_rec["ancestry_path"],
            "jurisdiction_id": jur["jur_id"],
            "jurisdiction_name": jur["name"],
            "jurisdiction_place_id": jur["place_id"],
            "place_decision": decision,
            "stable_key": stable,
            "ind_id": ind_id, "prof_id": prof_id, "polit_id": polit_id, "assign_id": assign_id,
            "party_aff_id": party_aff_id, "search_id": search_id, "dedupe_id": dedupe_id,
            "identity_id": identity_id, "ingestion_id": ingestion_id,
            "place_resolution_id": place_resolution_id,
            "entity_source_id": entity_source_id, "enrichment_id": enrichment_id,
            "raw_json": json.dumps(r, ensure_ascii=False, sort_keys=True),
        }
        rec["normalized_json"] = json.dumps({k: rec[k] for k in ["source_record_id", "full_name", "office_type", "state_place_id", "jurisdiction_id", "party_acronym", "mp_id"]}, ensure_ascii=False, sort_keys=True)
        rec["keywords"] = keywords([rec["display_name"], rec["state_place_name"], rec["jurisdiction_name"], rec["party_acronym"], "national assembly", "nigeria", office])
        seeded.append(rec)
    return seeded, deferred


def main():
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    raw = {"retrieved_at": "2026-04-21", "api_base": NASS_BASE, "endpoints": {}}
    sen_url = f"{NASS_BASE}/?chamber=1&start=0&length=500&draw=1"
    rep_url = f"{NASS_BASE}/?chamber=2&start=0&length=1000&draw=1"
    sen_data = fetch_json(sen_url)
    rep_data = fetch_json(rep_url)
    raw["endpoints"]["senate"] = {"url": sen_url, "records_total_reported": sen_data.get("recordsTotal"), "data": sen_data.get("data", [])}
    raw["endpoints"]["reps"] = {"url": rep_url, "records_total_reported": rep_data.get("recordsTotal"), "data": rep_data.get("data", [])}
    RAW_PATH.write_text(json.dumps(raw, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")

    states = parse_states()
    sen_juris, fed_juris = parse_jurisdictions()

    sen_seeded, sen_deferred = normalize_chamber(raw["endpoints"]["senate"]["data"], "senate", states, sen_juris, fed_juris)
    rep_seeded, rep_deferred = normalize_chamber(raw["endpoints"]["reps"]["data"], "reps", states, sen_juris, fed_juris)
    seeded = sen_seeded + rep_seeded
    deferred = [{**d} for d in sen_deferred + rep_deferred]

    normalized = {
        "retrieved_at": "2026-04-21",
        "seeded_legislators": seeded,
        "deferred_rows": deferred,
    }
    NORMALIZED_PATH.write_text(json.dumps(normalized, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")

    expected = {"senate": 109, "reps": 360}
    actual_raw = {"senate": len(raw["endpoints"]["senate"]["data"]), "reps": len(raw["endpoints"]["reps"]["data"])}
    actual_seeded = {"senate": len(sen_seeded), "reps": len(rep_seeded)}
    report = {
        "retrieved_at": "2026-04-21",
        "api_base": NASS_BASE,
        "expected_total_per_chamber": expected,
        "raw_row_count_per_chamber": actual_raw,
        "seeded_row_count_per_chamber": actual_seeded,
        "deferred_row_count_per_chamber": {"senate": len(sen_deferred), "reps": len(rep_deferred)},
        "official_source_gap_per_chamber": {k: expected[k] - actual_raw[k] for k in expected},
        "deferred_reason_counts": dict(Counter(d["reason"] for d in deferred)),
        "place_decision_counts": dict(Counter(row["place_decision"] for row in seeded)),
        "party_counts": dict(Counter(row["party_acronym"] for row in seeded)),
        "decision": "Seed legislator individuals, politician_profiles, political_assignments, and party_affiliations from the official NASS legislators API. Where the NASS public dataset itself is incomplete, those missing legislators remain unseed pending publication of an additional official source; no individuals are fabricated. Deferred rows are recorded with explicit reasons for follow-up.",
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")

    artifact_specs = [
        (RAW_PATH, "raw", actual_raw["senate"] + actual_raw["reps"], {"endpoints": list(raw["endpoints"].keys())}),
        (NORMALIZED_PATH, "normalized", len(seeded), {"seeded_fields": sorted(seeded[0].keys()) if seeded else []}),
        (REPORT_PATH, "report", len(seeded), {}),
    ]
    artifacts = []
    for path, artifact_type, row_count, schema in artifact_specs:
        rel = str(path.relative_to(ROOT))
        artifacts.append({
            "id": stable_id("seed_artifact_s05_nass_", rel),
            "seed_run_id": SEED_RUN_ID,
            "source_id": SOURCE_ID,
            "artifact_type": artifact_type,
            "file_path": rel,
            "content_hash": hashlib.sha256(path.read_bytes()).hexdigest(),
            "row_count": row_count,
            "schema_json": json.dumps(schema, ensure_ascii=False, sort_keys=True),
            "extraction_script": "python3 infra/db/seed/scripts/generate_s05_senators_reps_sql.py",
            "status": "parsed",
        })

    with MIGRATION_PATH.open("w", encoding="utf-8") as handle:
        handle.write("BEGIN TRANSACTION;\n")
        handle.write(f"INSERT OR IGNORE INTO seed_runs (id, phase_id, phase_name, batch_name, environment, status, actor, source_manifest_uri, started_at, completed_at, rows_extracted, rows_inserted, rows_updated, rows_rejected, notes, created_at, updated_at) VALUES ({sql(SEED_RUN_ID)}, 'S05', 'Political and Electoral Foundation', 'national-assembly-senators-and-reps', 'production', 'completed', 'replit-agent', 'docs/reports/phase-s05-political-foundation-source-manifest-2026-04-21.md', unixepoch(), unixepoch(), {actual_raw['senate'] + actual_raw['reps']}, {len(seeded)}, 0, {len(deferred)}, 'Seeded NASS senators and House of Representatives members from the official National Assembly legislators API. NASS source itself reported {actual_raw['senate']} senators and {actual_raw['reps']} representatives as of retrieval; the {expected['senate'] - actual_raw['senate']} and {expected['reps'] - actual_raw['reps']} additional officeholders required to reach 109 and 360 respectively remain unseed pending publication of additional official source rows. No individuals are fabricated.', unixepoch(), unixepoch());\n")
        handle.write(f"INSERT OR IGNORE INTO seed_sources (id, source_key, name, owner, source_type, confidence, url, access_method, license, publication_date, retrieved_at, source_hash, freshness_status, notes, created_at, updated_at) VALUES ({sql(SOURCE_ID)}, 'nass:legislators-api:2026-04-21', 'National Assembly of Nigeria Legislators API', 'National Assembly of the Federal Republic of Nigeria', 'official_government', 'official_verified', 'https://nass.gov.ng/mps/get_legislators', 'public_json_api', 'public official government', '2026-04-21', unixepoch(), {sql(hashlib.sha256(RAW_PATH.read_bytes()).hexdigest())}, 'current', 'Official NASS public DataTables endpoint backing the senators and members listings. Reported recordsTotal={actual_raw['senate']} for chamber=1 (senate) and recordsTotal={actual_raw['reps']} for chamber=2 (reps).', unixepoch(), unixepoch());\n")
        write_values(handle, "seed_raw_artifacts", ["id", "seed_run_id", "source_id", "artifact_type", "file_path", "content_hash", "row_count", "schema_json", "extraction_script", "status"], artifacts)
        # individuals
        write_values(handle, "individuals", ["id", "tenant_id", "first_name", "last_name", "middle_name", "display_name", "verification_state"],
                     [{"id": r["ind_id"], "tenant_id": TENANT_ID, "first_name": r["first_name"], "last_name": r["last_name"], "middle_name": r["middle_name"], "display_name": r["display_name"], "verification_state": "source_verified"} for r in seeded])
        # profiles (subject_type=individual)
        write_values(handle, "profiles", ["id", "subject_type", "subject_id", "claim_state", "verification_state", "publication_state", "primary_place_id"],
                     [{"id": r["prof_id"], "subject_type": "individual", "subject_id": r["ind_id"], "claim_state": "seeded", "verification_state": "source_verified", "publication_state": "published", "primary_place_id": r["jurisdiction_place_id"]} for r in seeded])
        # politician_profiles
        write_values(handle, "politician_profiles", ["id", "individual_id", "workspace_id", "tenant_id", "office_type", "jurisdiction_id", "party_id", "nin_verified", "inec_filing_ref", "term_start", "term_end", "status"],
                     [{"id": r["polit_id"], "individual_id": r["ind_id"], "workspace_id": WORKSPACE_ID, "tenant_id": TENANT_ID, "office_type": r["office_type"], "jurisdiction_id": r["jurisdiction_id"], "party_id": r["party_org_id"], "nin_verified": 0, "inec_filing_ref": None, "term_start": None, "term_end": None, "status": "seeded"} for r in seeded])
        # political_assignments
        write_values(handle, "political_assignments", ["id", "individual_id", "office_type", "jurisdiction_id", "term_id", "verification_state", "tenant_id"],
                     [{"id": r["assign_id"], "individual_id": r["ind_id"], "office_type": r["office_type"], "jurisdiction_id": r["jurisdiction_id"], "term_id": r["term_id"], "verification_state": "source_verified", "tenant_id": TENANT_ID} for r in seeded])
        # party_affiliations (only when party org id resolvable)
        party_rows = [r for r in seeded if r["party_org_id"]]
        write_values(handle, "party_affiliations", ["id", "individual_id", "party_id", "membership_number", "joined_at", "left_at", "is_primary"],
                     [{"id": r["party_aff_id"], "individual_id": r["ind_id"], "party_id": r["party_org_id"], "membership_number": None, "joined_at": None, "left_at": None, "is_primary": 1} for r in party_rows])
        # seed_dedupe_decisions
        write_values(handle, "seed_dedupe_decisions", ["id", "seed_run_id", "entity_type", "canonical_key", "candidate_keys", "decision", "confidence", "reason", "decided_by"],
                     [{"id": r["dedupe_id"], "seed_run_id": SEED_RUN_ID, "entity_type": "individual", "canonical_key": r["stable_key"], "candidate_keys": json.dumps([r["source_record_id"]]), "decision": "canonical", "confidence": "official_verified", "reason": "NASS internal mp_id within chamber used as source-backed dedupe key.", "decided_by": "replit-agent"} for r in seeded])
        # seed_ingestion_records
        write_values(handle, "seed_ingestion_records", ["id", "seed_run_id", "source_id", "artifact_id", "row_number", "source_record_id", "source_record_hash", "target_entity_type", "target_entity_id", "target_profile_id", "vertical_slug", "primary_place_id", "raw_json", "normalized_json", "record_status", "error_json"],
                     [{"id": r["ingestion_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_id": artifacts[1]["id"], "row_number": None, "source_record_id": r["source_record_id"], "source_record_hash": r["source_record_hash"], "target_entity_type": "individual", "target_entity_id": r["ind_id"], "target_profile_id": r["prof_id"], "vertical_slug": "politician", "primary_place_id": r["jurisdiction_place_id"], "raw_json": r["raw_json"], "normalized_json": r["normalized_json"], "record_status": "inserted", "error_json": "{}"} for r in seeded])
        # seed_identity_map
        write_values(handle, "seed_identity_map", ["id", "seed_run_id", "source_id", "source_record_id", "source_record_hash", "entity_type", "entity_id", "profile_id", "vertical_slug", "stable_key", "generation_method"],
                     [{"id": r["identity_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "source_record_id": r["source_record_id"], "source_record_hash": r["source_record_hash"], "entity_type": "individual", "entity_id": r["ind_id"], "profile_id": r["prof_id"], "vertical_slug": "politician", "stable_key": r["stable_key"], "generation_method": "sha256_v1"} for r in seeded])
        # seed_place_resolutions
        write_values(handle, "seed_place_resolutions", ["id", "seed_run_id", "source_id", "source_record_id", "input_state", "input_lga", "input_ward", "explicit_place_id", "resolved_place_id", "resolution_level", "confidence", "status", "candidate_place_ids", "notes"],
                     [{"id": r["place_resolution_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "source_record_id": r["source_record_id"], "input_state": r["state_text"], "input_lga": None, "input_ward": None, "explicit_place_id": None, "resolved_place_id": r["jurisdiction_place_id"], "resolution_level": "senatorial_district" if r["chamber"] == "senate" else "federal_constituency", "confidence": "official_verified", "status": "resolved", "candidate_place_ids": json.dumps([r["jurisdiction_place_id"]]), "notes": f"Resolved via NASS state+district label match against INEC senatorial-district / federal-constituency jurisdiction registry ({r['place_decision']})."} for r in seeded])
        # seed_entity_sources
        write_values(handle, "seed_entity_sources", ["id", "seed_run_id", "source_id", "artifact_id", "dedupe_decision_id", "entity_type", "entity_id", "profile_id", "vertical_slug", "source_record_id", "source_record_hash", "confidence", "source_url", "extracted_at", "last_verified_at", "verification_state", "notes"],
                     [{"id": r["entity_source_id"], "seed_run_id": SEED_RUN_ID, "source_id": SOURCE_ID, "artifact_id": artifacts[1]["id"], "dedupe_decision_id": r["dedupe_id"], "entity_type": "individual", "entity_id": r["ind_id"], "profile_id": r["prof_id"], "vertical_slug": "politician", "source_record_id": r["source_record_id"], "source_record_hash": r["source_record_hash"], "confidence": "official_verified", "source_url": f"https://nass.gov.ng/mps/single/{r['mp_id']}", "extracted_at": "unixepoch()", "last_verified_at": "unixepoch()", "verification_state": "source_verified", "notes": f"Official NASS legislators API row ({r['chamber']}) seeded as individual with politician_profile, political_assignment, and party_affiliation."} for r in seeded])
        # seed_enrichment
        write_values(handle, "seed_enrichment", ["id", "seed_run_id", "entity_type", "entity_id", "profile_id", "vertical_slug", "source_id", "enrichment_json", "pii_classification", "lawful_basis", "last_reviewed_at"],
                     [{"id": r["enrichment_id"], "seed_run_id": SEED_RUN_ID, "entity_type": "individual", "entity_id": r["ind_id"], "profile_id": r["prof_id"], "vertical_slug": "politician", "source_id": SOURCE_ID, "enrichment_json": json.dumps({"chamber": r["chamber"], "office_type": r["office_type"], "state_text": r["state_text"], "district_text": r["district_text"], "party_acronym": r["party_acronym"], "mp_id": r["mp_id"], "jurisdiction_name": r["jurisdiction_name"]}, ensure_ascii=False, sort_keys=True), "pii_classification": "public", "lawful_basis": "public_official_government_directory", "last_reviewed_at": "unixepoch()"} for r in seeded])
        # search_entries
        write_values(handle, "search_entries", ["id", "entity_type", "entity_id", "tenant_id", "display_name", "keywords", "place_id", "ancestry_path", "visibility"],
                     [{"id": r["search_id"], "entity_type": "individual", "entity_id": r["ind_id"], "tenant_id": TENANT_ID, "display_name": r["display_name"], "keywords": r["keywords"], "place_id": r["jurisdiction_place_id"], "ancestry_path": r["ancestry_path"], "visibility": "public"} for r in seeded])
        handle.write(f"INSERT OR IGNORE INTO seed_search_rebuild_jobs (id, seed_run_id, batch_name, status, entity_type, entity_count, search_entries_count, queued_at, started_at, completed_at, fts_rebuilt_at, notes, created_at, updated_at) VALUES ('seed_search_rebuild_s05_nass_legislators_20260421', {sql(SEED_RUN_ID)}, 'nass-legislators-search-rebuild', 'completed', 'individual', {len(seeded)}, {len(seeded)}, unixepoch(), unixepoch(), unixepoch(), unixepoch(), 'NASS senators and reps search entries inserted; search_fts rebuilt at end of migration.', unixepoch(), unixepoch());\n")
        handle.write("INSERT INTO search_fts(search_fts) VALUES('rebuild');\n")
        handle.write("COMMIT;\n")
    shutil.copyfile(MIGRATION_PATH, API_MIGRATION_PATH)
    shutil.copyfile(MIGRATION_PATH, SEED_MIRROR_PATH)
    print(json.dumps(report, indent=2, sort_keys=True))
    print(f"wrote {MIGRATION_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
