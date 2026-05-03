#!/usr/bin/env python3
"""
Master generator: migrations 0497-0503
Generates forward SQL + rollback MD for S12/S13/S14/S15 seed batches.
"""

import json
import csv
import hashlib
import os
import re
from datetime import date

SOURCE = "infra/db/seed/sources"
MIGS   = "infra/db/migrations"
TODAY  = "2026-05-02"

TENANT = "tenant_platform_seed"
WSPC   = "workspace_platform_seed_discovery"
PLACE  = "place_nigeria_001"

def sq(s):
    """Escape single quotes for SQL string literals."""
    if s is None:
        return "NULL"
    return str(s).replace("'", "''")

def kw(*parts):
    """Build lowercase keyword string."""
    return " ".join(p.lower() for p in parts if p)

def uid(prefix, name, suffix=""):
    h = hashlib.md5(f"{name}{suffix}".encode()).hexdigest()[:16]
    return f"{prefix}_{h}"

def org_block(org_id, name, org_type, vertical, keywords_str, seed_run_id, source_id, enrichment):
    """Return all 6 INSERT lines for one organization."""
    prof_id = "prof_" + org_id[4:]
    se_id   = "se_"   + org_id[4:]
    ir_id   = "ir_"   + org_id[4:]
    es_id   = "es_"   + org_id[4:]
    enr_id  = "enr_"  + org_id[4:]
    enr_json = json.dumps(enrichment, ensure_ascii=False).replace("'", "''")

    lines = []
    lines.append(
        f"INSERT OR IGNORE INTO organizations (id,tenant_id,organization_type,legal_name,display_name,"
        f"registration_number,status,verification_state,created_at,updated_at) VALUES "
        f"('{org_id}','{TENANT}','{org_type}','{sq(name)}','{sq(name)}',NULL,'active','seeded',unixepoch(),unixepoch());"
    )
    lines.append(
        f"INSERT OR IGNORE INTO profiles (id,subject_id,subject_type,primary_place_id,tenant_id,workspace_id,"
        f"display_name,created_at,updated_at) VALUES "
        f"('{prof_id}','{org_id}','organization','{PLACE}','{TENANT}','{WSPC}','{sq(name)}',unixepoch(),unixepoch());"
    )
    lines.append(
        f"INSERT OR IGNORE INTO search_entries (id,profile_id,display_name,keywords,ancestry_path,vertical,"
        f"created_at,updated_at) VALUES "
        f"('{se_id}','{prof_id}','{sq(name)}','{sq(keywords_str)}','{PLACE}','{vertical}',unixepoch(),unixepoch());"
    )
    lines.append(
        f"INSERT OR IGNORE INTO seed_ingestion_records (id,seed_run_id,entity_type,entity_id,source_id,status) VALUES "
        f"('{ir_id}','{seed_run_id}','organization','{org_id}','{source_id}','ingested');"
    )
    lines.append(
        f"INSERT OR IGNORE INTO seed_entity_sources (id,seed_run_id,entity_type,entity_id,source_id,confidence_tier) VALUES "
        f"('{es_id}','{seed_run_id}','organization','{org_id}','{source_id}','seeded');"
    )
    lines.append(
        f"INSERT OR IGNORE INTO seed_enrichment (id,seed_run_id,entity_type,entity_id,enrichment_type,enrichment_json) VALUES "
        f"('{enr_id}','{seed_run_id}','organization','{org_id}','licence_data','{enr_json}');"
    )
    return "\n".join(lines)

def header(num, label, record_count, source_label):
    return f"""-- ============================================================
-- Migration {num}: {label}
-- Generated: {TODAY} | Records: {record_count}
-- Source: {source_label}
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
BEGIN TRANSACTION;"""

def seed_meta(source_id, source_label, source_url, run_id, run_label, artifact_id, artifact_file, row_count):
    return f"""INSERT OR IGNORE INTO seed_sources (id,label,source_type,url,confidence_tier,notes) VALUES ('{source_id}','{source_label}','structured_extract','{source_url}','seeded','{source_label}');
INSERT OR IGNORE INTO seed_runs (id,label,phase,status,started_at,completed_at) VALUES ('{run_id}','{run_label}','S12','completed',unixepoch(),unixepoch());
INSERT OR IGNORE INTO seed_raw_artifacts (id,seed_run_id,artifact_type,file_path,content_hash,row_count,notes) VALUES ('{artifact_id}','{run_id}','normalized','{SOURCE}',NULL,{row_count},'Auto-generated from {source_label}');"""

def footer():
    return "COMMIT;"

def rollback_md(num, fname, record_count, tables):
    tbl_list = "\n".join(f"- `{t}`" for t in tables)
    return f"""# Rollback: {num}_{fname}

## What was seeded
{record_count} records.

## Tables affected
{tbl_list}

## How to rollback
This migration is idempotent (INSERT OR IGNORE). Records seeded are platform reference data.
To fully undo, delete rows where `verification_state = 'seeded'` added by this migration's seed run IDs.

No schema changes were made — this migration is data-only.
"""

def write_migration(num, slug, sql_content, rollback_content):
    fwd  = f"{MIGS}/{num}_{slug}.sql"
    back = f"{MIGS}/{num}_{slug}.rollback.md"
    with open(fwd, "w") as f:
        f.write(sql_content)
    with open(back, "w") as f:
        f.write(rollback_content)
    print(f"  Written: {fwd}")
    return fwd

# ===========================================================
# MIGRATION 0497: NUC Universities (307 records)
# ===========================================================
def gen_0497():
    num   = "0497"
    slug  = "nuc_universities_seed"
    src_id   = "seed_source_nuc_universities_20260422"
    run_id   = "seed_run_s12_nuc_universities_20260502"
    art_id   = f"seed_artifact_{run_id}"
    src_lbl  = "National Universities Commission — Nigerian Universities Directory"
    src_url  = "https://www.nuc.edu.ng/nigerian-univerisities/"

    d = json.load(open(f"{SOURCE}/s12_nuc_universities_extracted_20260422.json"))
    unis_by_cat = d.get("universities", {})

    org_type_map = {
        "federal":          "federal_university",
        "state":            "state_university",
        "state_government": "state_university",
        "private":          "private_university",
    }

    records = []
    for cat, items in unis_by_cat.items():
        if not isinstance(items, list):
            continue
        ot = org_type_map.get(cat.lower(), "university")
        for item in items:
            name = item.get("name", "").strip()
            if not name:
                continue
            yr   = item.get("year_est", "")
            web  = item.get("website", "")
            records.append((name, ot, cat, yr, web))

    blocks = []
    for (name, ot, cat, yr, web) in records:
        oid  = uid(f"org_s12_nuc_{cat[:3]}", name)
        kws  = kw(name, "university", "education", "nigeria", cat, "nuc")
        enr  = {"category": cat, "year_est": yr, "website": web, "source": "nuc"}
        blocks.append(org_block(oid, name, ot, "education", kws, run_id, src_id, enr))

    n = len(blocks)
    sql = "\n".join([
        header(num, "NUC Universities — Nigeria University Directory", n, src_lbl),
        seed_meta(src_id, src_lbl, src_url, run_id, f"S12 NUC Universities 2026-04-22", art_id, f"{SOURCE}/s12_nuc_universities_extracted_20260422.json", n),
        "",
        "\n\n".join(blocks),
        "",
        footer()
    ])
    rb = rollback_md(num, slug, n, ["organizations","profiles","search_entries","seed_ingestion_records","seed_entity_sources","seed_enrichment"])
    write_migration(num, slug, sql, rb)
    print(f"  -> {n} NUC universities")
    return n

# ===========================================================
# MIGRATION 0498: S12 OSM Bank Branches (1,153 + 8 = ~1,161)
# ===========================================================
def gen_0498():
    num  = "0498"
    slug = "osm_s12_bank_branches_seed"
    src_id  = "seed_source_osm_bank_branches_ng_20260422"
    run_id  = "seed_run_s12_osm_bank_branches_20260502"
    art_id  = f"seed_artifact_{run_id}"
    src_lbl = "OpenStreetMap Nigeria — Bank Branches & Financial Offices"
    src_url = "https://www.openstreetmap.org"

    def load_osm(fname, filter_tags=None):
        with open(f"{SOURCE}/{fname}") as f:
            d = json.load(f)
        items = d if isinstance(d, list) else d.get("elements", [])
        named = [x for x in items if x.get("tags", {}).get("name")]
        return named

    banks  = load_osm("s12_osm_bank_branches_ng_20260422.json")

    # compiled entities (8 misc: legal, court, radio, club)
    compiled_d = json.load(open(f"{SOURCE}/s12_osm_compiled_20260422.json"))
    compiled   = compiled_d.get("entities", [])

    blocks = []
    seen   = set()

    for item in banks:
        tags  = item.get("tags", {})
        name  = tags.get("name", "").strip()
        if not name or name in seen:
            continue
        seen.add(name)
        osm_id = str(item.get("id", ""))
        oid    = uid("org_s12_bank", name, osm_id)
        bank   = tags.get("bank", tags.get("brand", tags.get("operator", "")))
        amenity = tags.get("amenity", "bank")
        kws    = kw(name, "bank", "banking", "financial", "nigeria")
        enr    = {"osm_id": osm_id, "amenity": amenity, "brand": bank or "", "addr_state": tags.get("addr:state", "")}
        blocks.append(org_block(oid, name, "bank_branch", "banking", kws, run_id, src_id, enr))

    for item in compiled:
        name = item.get("name", "").strip()
        if not name or name in seen:
            continue
        seen.add(name)
        oid  = uid("org_s12_misc", name)
        # classify by keywords
        nl = name.lower()
        if any(k in nl for k in ("law", "legal", "advocate", "chambers", "solicitor")):
            ot, vert = "law_firm", "professional"
        elif "court" in nl or "efcc" in nl:
            ot, vert = "government_office", "civic"
        elif "radio" in nl:
            ot, vert = "media_broadcaster", "media"
        else:
            ot, vert = "business", "professional"
        kws = kw(name, ot.replace("_", " "), "nigeria")
        enr = {"source": "osm_compiled", "type": ot}
        blocks.append(org_block(oid, name, ot, vert, kws, run_id, src_id, enr))

    n = len(blocks)
    sql = "\n".join([
        header(num, "OSM S12 Bank Branches & Financial Offices", n, src_lbl),
        seed_meta(src_id, src_lbl, src_url, run_id, "S12 OSM Bank Branches 2026-04-22", art_id, f"{SOURCE}/s12_osm_bank_branches_ng_20260422.json", n),
        "",
        "\n\n".join(blocks),
        "",
        footer()
    ])
    rb = rollback_md(num, slug, n, ["organizations","profiles","search_entries","seed_ingestion_records","seed_entity_sources","seed_enrichment"])
    write_migration(num, slug, sql, rb)
    print(f"  -> {n} bank branches + misc entities")
    return n

# ===========================================================
# MIGRATION 0499: S13 OSM Hospitals & Medical
# ===========================================================
def gen_0499():
    num  = "0499"
    slug = "osm_s13_hospitals_medical_seed"
    src_id  = "seed_source_osm_s13_medical_ng_20260422"
    run_id  = "seed_run_s13_osm_medical_20260502"
    art_id  = f"seed_artifact_{run_id}"
    src_lbl = "OpenStreetMap Nigeria — Hospitals, Clinics & Medical Services"
    src_url = "https://www.openstreetmap.org"

    def load_named(fname):
        with open(f"{SOURCE}/{fname}") as f:
            d = json.load(f)
        items = d if isinstance(d, list) else d.get("elements", [])
        return [x for x in items if x.get("tags", {}).get("name")]

    type_map = {
        "s13_osm_hospital_ng_20260422.json":  ("hospital",  "health"),
        "s13_osm_clinic_ng_20260422.json":    ("clinic",    "health"),
        "s13_osm_doctors_ng_20260422.json":   ("medical_practice", "health"),
        "s13_osm_dentist_ng_20260422.json":   ("dental_clinic",    "health"),
        "s13_osm_optician_ng_20260422.json":  ("optical_clinic",   "health"),
    }

    blocks = []
    seen   = set()

    for fname, (ot, vert) in type_map.items():
        items = load_named(fname)
        prefix = f"org_s13_{ot.replace('_','')}"
        for item in items:
            tags  = item.get("tags", {})
            name  = tags.get("name", "").strip()
            if not name or name in seen:
                continue
            seen.add(name)
            osm_id = str(item.get("id", ""))
            oid    = uid(prefix, name, osm_id)
            kws    = kw(name, ot.replace("_", " "), "health", "medical", "hospital", "clinic", "nigeria")
            enr    = {"osm_id": osm_id, "amenity": tags.get("amenity", ot), "addr_state": tags.get("addr:state", ""), "operator": tags.get("operator", "")}
            blocks.append(org_block(oid, name, ot, vert, kws, run_id, src_id, enr))

    n = len(blocks)
    sql = "\n".join([
        header(num, "OSM S13 Hospitals, Clinics & Medical Services", n, src_lbl),
        seed_meta(src_id, src_lbl, src_url, run_id, "S13 OSM Medical 2026-04-22", art_id, f"{SOURCE}/s13_osm_hospital_ng_20260422.json", n),
        "",
        "\n\n".join(blocks),
        "",
        footer()
    ])
    rb = rollback_md(num, slug, n, ["organizations","profiles","search_entries","seed_ingestion_records","seed_entity_sources","seed_enrichment"])
    write_migration(num, slug, sql, rb)
    print(f"  -> {n} medical facilities")
    return n

# ===========================================================
# MIGRATION 0500: S13 OSM Civic & Public Institutions
# ===========================================================
def gen_0500():
    num  = "0500"
    slug = "osm_s13_civic_public_seed"
    src_id  = "seed_source_osm_s13_civic_ng_20260422"
    run_id  = "seed_run_s13_osm_civic_20260502"
    art_id  = f"seed_artifact_{run_id}"
    src_lbl = "OpenStreetMap Nigeria — Civic, Public & Educational Institutions"
    src_url = "https://www.openstreetmap.org"

    type_map = {
        "s13_osm_college_ng_20260422.json":           ("college",          "education"),
        "s13_osm_university_ng_20260422.json":        ("university",       "education"),
        "s13_osm_community_centre_ng_20260422.json":  ("community_centre", "civic"),
        "s13_osm_library_ng_20260422.json":           ("library",          "civic"),
        "s13_osm_courthouse_ng_20260422.json":        ("courthouse",       "justice"),
        "s13_osm_police_ng_20260422.json":            ("police_station",   "civic"),
        "s13_osm_post_office_ng_20260422.json":       ("post_office",      "civic"),
        "s13_osm_government_office_ng_20260422.json": ("government_office","civic"),
        "s13_osm_social_facility_ng_20260422.json":   ("social_facility",  "civic"),
    }

    blocks = []
    seen   = set()

    for fname, (ot, vert) in type_map.items():
        with open(f"{SOURCE}/{fname}") as f:
            d = json.load(f)
        items = d if isinstance(d, list) else d.get("elements", [])
        named = [x for x in items if x.get("tags", {}).get("name")]
        prefix = f"org_s13_{ot.replace('_','')[:8]}"
        for item in named:
            tags  = item.get("tags", {})
            name  = tags.get("name", "").strip()
            if not name or name in seen:
                continue
            seen.add(name)
            osm_id = str(item.get("id", ""))
            oid    = uid(prefix, name, osm_id)
            kws    = kw(name, ot.replace("_", " "), vert, "nigeria")
            enr    = {"osm_id": osm_id, "amenity": tags.get("amenity", ot), "addr_state": tags.get("addr:state", ""), "operator": tags.get("operator", "")}
            blocks.append(org_block(oid, name, ot, vert, kws, run_id, src_id, enr))

    n = len(blocks)
    sql = "\n".join([
        header(num, "OSM S13 Civic, Public & Educational Institutions", n, src_lbl),
        seed_meta(src_id, src_lbl, src_url, run_id, "S13 OSM Civic 2026-04-22", art_id, f"{SOURCE}/s13_osm_college_ng_20260422.json", n),
        "",
        "\n\n".join(blocks),
        "",
        footer()
    ])
    rb = rollback_md(num, slug, n, ["organizations","profiles","search_entries","seed_ingestion_records","seed_entity_sources","seed_enrichment"])
    write_migration(num, slug, sql, rb)
    print(f"  -> {n} civic/public institutions")
    return n

# ===========================================================
# MIGRATION 0501: S13 OSM Professional & Lifestyle Services
# ===========================================================
def gen_0501():
    num  = "0501"
    slug = "osm_s13_professional_lifestyle_seed"
    src_id  = "seed_source_osm_s13_professional_ng_20260422"
    run_id  = "seed_run_s13_osm_professional_20260502"
    art_id  = f"seed_artifact_{run_id}"
    src_lbl = "OpenStreetMap Nigeria — Professional & Lifestyle Services"
    src_url = "https://www.openstreetmap.org"

    type_map = {
        "s13_osm_car_repair_ng_20260422.json":      ("auto_repair",      "automotive"),
        "s13_osm_bakery_ng_20260422.json":           ("bakery",           "food"),
        "s13_osm_law_firm_ng_20260422.json":         ("law_firm",         "professional"),
        "s13_osm_accounting_firm_ng_20260422.json":  ("accounting_firm",  "professional"),
        "s13_osm_driving_school_ng_20260422.json":   ("driving_school",   "education"),
        "s13_osm_veterinary_ng_20260422.json":       ("veterinary_clinic","health"),
        "s13_osm_gym_ng_20260422.json":              ("gym",              "lifestyle"),
        "s13_osm_laundry_ng_20260422.json":          ("laundry",          "lifestyle"),
    }

    blocks = []
    seen   = set()

    for fname, (ot, vert) in type_map.items():
        with open(f"{SOURCE}/{fname}") as f:
            d = json.load(f)
        items = d if isinstance(d, list) else d.get("elements", [])
        named = [x for x in items if x.get("tags", {}).get("name")]
        prefix = f"org_s13_{ot.replace('_','')[:9]}"
        for item in named:
            tags  = item.get("tags", {})
            name  = tags.get("name", "").strip()
            if not name or name in seen:
                continue
            seen.add(name)
            osm_id = str(item.get("id", ""))
            oid    = uid(prefix, name, osm_id)
            kws    = kw(name, ot.replace("_", " "), vert, "nigeria")
            enr    = {"osm_id": osm_id, "amenity": tags.get("amenity", ot), "addr_state": tags.get("addr:state", ""), "shop": tags.get("shop", "")}
            blocks.append(org_block(oid, name, ot, vert, kws, run_id, src_id, enr))

    n = len(blocks)
    sql = "\n".join([
        header(num, "OSM S13 Professional & Lifestyle Services", n, src_lbl),
        seed_meta(src_id, src_lbl, src_url, run_id, "S13 OSM Professional 2026-04-22", art_id, f"{SOURCE}/s13_osm_car_repair_ng_20260422.json", n),
        "",
        "\n\n".join(blocks),
        "",
        footer()
    ])
    rb = rollback_md(num, slug, n, ["organizations","profiles","search_entries","seed_ingestion_records","seed_entity_sources","seed_enrichment"])
    write_migration(num, slug, sql, rb)
    print(f"  -> {n} professional/lifestyle services")
    return n

# ===========================================================
# MIGRATION 0502: S14 OSM State-Specific POIs
# ===========================================================
def gen_0502():
    num  = "0502"
    slug = "osm_s14_state_pois_seed"
    src_id  = "seed_source_osm_s14_state_pois_ng_20260422"
    run_id  = "seed_run_s14_osm_state_pois_20260502"
    art_id  = f"seed_artifact_{run_id}"
    src_lbl = "OpenStreetMap Nigeria — State-Specific POIs (Benue/Jigawa/Sokoto/Taraba/Abia)"
    src_url = "https://www.openstreetmap.org"

    amenity_to_type = {
        "bank": ("bank_branch", "banking"),
        "fuel": ("fuel_station", "automotive"),
        "pharmacy": ("pharmacy", "health"),
        "hospital": ("hospital", "health"),
        "clinic": ("clinic", "health"),
        "school": ("school", "education"),
        "college": ("college", "education"),
        "university": ("university", "education"),
        "police": ("police_station", "civic"),
        "fire_station": ("fire_station", "civic"),
        "courthouse": ("courthouse", "justice"),
        "post_office": ("post_office", "civic"),
        "government_office": ("government_office", "civic"),
        "community_centre": ("community_centre", "civic"),
        "library": ("library", "civic"),
        "restaurant": ("restaurant", "food"),
        "fast_food": ("fast_food", "food"),
        "hotel": ("hotel", "hospitality"),
        "motel": ("motel", "hospitality"),
        "supermarket": ("supermarket", "retail"),
        "marketplace": ("market", "retail"),
        "market": ("market", "retail"),
        "mosque": ("mosque", "religious"),
        "church": ("church", "religious"),
        "place_of_worship": ("place_of_worship", "religious"),
        "bus_station": ("transport_hub", "transport"),
        "bus_stop": ("bus_stop", "transport"),
        "car_wash": ("car_wash", "automotive"),
        "atm": ("atm", "banking"),
        "bakery": ("bakery", "food"),
        "mall": ("shopping_mall", "retail"),
        "cinema": ("cinema", "entertainment"),
    }
    shop_to_type = {
        "supermarket":  ("supermarket", "retail"),
        "pharmacy":     ("pharmacy", "health"),
        "clothes":      ("clothing_store", "retail"),
        "electronics":  ("electronics_store", "retail"),
        "hardware":     ("hardware_store", "retail"),
        "bakery":       ("bakery", "food"),
        "butcher":      ("butcher", "food"),
        "mobile_phone": ("phone_shop", "retail"),
        "car_repair":   ("auto_repair", "automotive"),
    }

    s14_files = [f for f in os.listdir(SOURCE) if f.startswith("s14_") and f.endswith(".json")]

    blocks = []
    seen   = set()

    for fname in sorted(s14_files):
        # Extract state name from filename
        parts = fname.split("_")
        state = parts[2] if len(parts) > 2 else "unknown"
        state = state.title()

        with open(f"{SOURCE}/{fname}") as f:
            d = json.load(f)
        items = d if isinstance(d, list) else d.get("elements", [])

        for item in items:
            tags  = item.get("tags", {})
            name  = tags.get("name", "").strip()
            if not name or name in seen:
                continue
            osm_id = str(item.get("id", ""))
            amenity = tags.get("amenity", "")
            shop    = tags.get("shop", "")
            tourism = tags.get("tourism", "")
            office  = tags.get("office", "")

            if amenity in amenity_to_type:
                ot, vert = amenity_to_type[amenity]
            elif shop in shop_to_type:
                ot, vert = shop_to_type[shop]
            elif tourism in ("hotel","guest_house","motel"):
                ot, vert = "hotel", "hospitality"
            elif office:
                ot, vert = "government_office", "civic"
            else:
                ot, vert = "business", "retail"

            seen.add(name)
            prefix = f"org_s14_{state[:4].lower()}"
            oid    = uid(prefix, name, osm_id)
            kws    = kw(name, ot.replace("_"," "), state, "nigeria")
            enr    = {"osm_id": osm_id, "amenity": amenity, "shop": shop, "addr_state": tags.get("addr:state", state), "state_batch": state}
            blocks.append(org_block(oid, name, ot, vert, kws, run_id, src_id, enr))

    n = len(blocks)
    sql = "\n".join([
        header(num, "OSM S14 State-Specific POIs (Benue/Jigawa/Sokoto/Taraba/Abia)", n, src_lbl),
        seed_meta(src_id, src_lbl, src_url, run_id, "S14 OSM State POIs 2026-04-22", art_id, f"{SOURCE}/s14_osm_benue_bank_fuel_pharma_ng_20260422.json", n),
        "",
        "\n\n".join(blocks),
        "",
        footer()
    ])
    rb = rollback_md(num, slug, n, ["organizations","profiles","search_entries","seed_ingestion_records","seed_entity_sources","seed_enrichment"])
    write_migration(num, slug, sql, rb)
    print(f"  -> {n} S14 state POIs")
    return n

# ===========================================================
# MIGRATION 0503: S15 GRID3 Health Facilities (46,146 rows)
# ===========================================================
def gen_0503():
    num  = "0503"
    slug = "grid3_health_facilities_seed"
    src_id  = "seed_source_grid3_health_facilities_ng_20260422"
    run_id  = "seed_run_s15_grid3_health_20260502"
    art_id  = f"seed_artifact_{run_id}"
    src_lbl = "GRID3 Nigeria — Health Facilities National Dataset"
    src_url = "https://grid3.gov.ng"

    with open(f"{SOURCE}/s15_grid3_health_facilities_ng_20260422.csv", newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # facility type → (org_type, vertical)
    cat_map = {
        "primary health center":   ("primary_health_centre", "health"),
        "health centre":           ("health_centre",         "health"),
        "dispensary":              ("dispensary",            "health"),
        "hospital":                ("hospital",              "health"),
        "general hospital":        ("general_hospital",      "health"),
        "maternity":               ("maternity_clinic",      "health"),
        "clinic":                  ("clinic",                "health"),
        "pharmacy":                ("pharmacy",              "health"),
        "laboratory":              ("medical_laboratory",    "health"),
        "dental":                  ("dental_clinic",         "health"),
        "eye":                     ("eye_clinic",            "health"),
        "veterinary":              ("veterinary_clinic",     "health"),
        "nursing home":            ("nursing_home",          "health"),
        "rehabilitation":          ("rehabilitation_centre", "health"),
        "specialist":              ("specialist_hospital",   "health"),
        "teaching hospital":       ("teaching_hospital",     "health"),
        "federal medical centre":  ("federal_medical_centre","health"),
        "cottage hospital":        ("cottage_hospital",      "health"),
        "model primary":           ("primary_health_centre", "health"),
    }

    def classify(category_str):
        cl = (category_str or "").lower()
        for key, val in cat_map.items():
            if key in cl:
                return val
        return ("health_facility", "health")

    blocks = []
    seen   = set()

    for row in rows:
        name = (row.get("prmry_name") or row.get("alt_name") or "").strip()
        if not name or name in seen:
            continue
        seen.add(name)

        cat   = row.get("category", "")
        ot, vert = classify(cat)
        state = row.get("statename", "")
        lga   = row.get("lganame", "")
        ward  = row.get("wardname", "")
        uniq  = row.get("uniq_id", "")
        lat   = row.get("latitude", "")
        lon   = row.get("longitude", "")
        owner = row.get("ownership", "")
        gid   = row.get("globalid", "")

        prefix = f"org_s15_grid3"
        oid    = uid(prefix, name, gid or uniq)
        kws    = kw(name, ot.replace("_"," "), "health", "medical", state, lga, "nigeria")
        enr    = {
            "grid3_id": uniq, "globalid": gid,
            "category": cat, "type": row.get("type",""),
            "ownership": owner, "state": state, "lga": lga, "ward": ward,
            "lat": lat, "lon": lon, "func_status": row.get("func_stats","")
        }
        blocks.append(org_block(oid, name, ot, vert, kws, run_id, src_id, enr))

    n = len(blocks)
    print(f"  GRID3: {len(rows)} rows -> {n} named unique facilities")

    # Write in one file (large but idempotent)
    sql = "\n".join([
        header(num, "GRID3 Nigeria Health Facilities National Dataset", n, src_lbl),
        seed_meta(src_id, src_lbl, src_url, run_id, "S15 GRID3 Health Facilities 2026-04-22", art_id, f"{SOURCE}/s15_grid3_health_facilities_ng_20260422.csv", n),
        "",
        "\n\n".join(blocks),
        "",
        footer()
    ])
    rb = rollback_md(num, slug, n, ["organizations","profiles","search_entries","seed_ingestion_records","seed_entity_sources","seed_enrichment"])
    write_migration(num, slug, sql, rb)
    print(f"  -> {n} GRID3 health facilities")
    return n

# ===========================================================
# MAIN
# ===========================================================
if __name__ == "__main__":
    print("Generating migrations 0497–0503...\n")
    totals = {}

    print("0497: NUC Universities")
    totals["0497"] = gen_0497()

    print("\n0498: S12 OSM Bank Branches")
    totals["0498"] = gen_0498()

    print("\n0499: S13 OSM Hospitals & Medical")
    totals["0499"] = gen_0499()

    print("\n0500: S13 OSM Civic & Public")
    totals["0500"] = gen_0500()

    print("\n0501: S13 OSM Professional & Lifestyle")
    totals["0501"] = gen_0501()

    print("\n0502: S14 OSM State POIs")
    totals["0502"] = gen_0502()

    print("\n0503: S15 GRID3 Health Facilities")
    totals["0503"] = gen_0503()

    grand_total = sum(totals.values())
    print(f"\n{'='*50}")
    print(f"Done. Migrations generated:")
    for num, n in totals.items():
        print(f"  {num}: {n:,} records")
    print(f"  TOTAL NEW RECORDS: {grand_total:,}")
    print(f"  Previous total: 58,787")
    print(f"  New grand total: {58787 + grand_total:,}")
