# Data Seed Backlog — WebWaka OS
**Created:** 2026-05-02  
**Scope:** All source data files in `infra/db/seed/sources/` that have not yet been converted to numbered migrations.  
**Convention:** Next available migration number after 0466 is **0467**.

---

## Already Seeded (Reference)

| Migration | Seed file | Source batch | Records | Content |
|---|---|---|---|---|
| 0301 | — | — | — | Control-plane tenants/workspaces |
| 0302 | — | S04 | 156 | Vertical registry |
| 0303 | 0005_jurisdictions.sql | S03 | ~1,100 | States, LGAs, wards, constituencies as jurisdictions |
| 0304 | — | S03 | — | Ingestion tooling (seed_sources, seed_runs metadata) |
| 0305 | 0006_political_parties.sql | S05 | 18 | INEC-registered political parties |
| 0306 | 0007_polling_units.sql | S05 | ~176,846 | All Nigeria polling units |
| 0307 | 0008_nemis_schools.sql | S06 | ~70,000 | NEMIS pre-primary/primary/secondary schools |
| 0308–0310 | 0009–0011 | S06 | ~5,000 | NHIA HCP, NPHCDA PHC, MLSCN training institutions |
| 0311 | 0012_political_senators_reps.sql | S05 | 318 | NASS senators (109) + reps (209) |
| 0312 | 0013_political_governors.sql | S05 | 36 | All 36 state governors (+ deputies) |
| 0313 | 0014_political_lagos_assembly.sql | S05 | 40 | Lagos State Assembly 40 members |
| 0314+0314b | 0015_political_inec_hoa_candidates.sql | S05 | 8,826 | INEC 2023 HoA election candidates |
| 0315–0316 | 0015/0016_cbn_bdc/mfb.sql | S07 | 82+457 | CBN BDCs + Microfinance Banks |
| 0317 | 0017_cbn_financial_institutions.sql | S07 | 199 | CBN DMB(28)+NIB(6)+PMI(33)+DFI(8)+FC(124) |
| 0318 | 0018_ncc_telecom_licensees.sql | S07 | ~2,800 | NCC telecom licensees |
| 0460–0464 | — | P3 | — | P3 template registrations |
| 0465 | — | S05 | 4 | Kano/Rivers/Ogun/Oyo assembly Speakers (partial) |
| 0466 | — | S05 | 20 | Lagos 20 LGA chairpersons (2021–2024) |

---

## Seed Backlog — Not Yet Migrated

### Priority 1 — Phase 2 Gate Remainder (DEBT-012)

#### SEED-P2-A · Full State Assembly Rosters
**Migration targets:** 0467–0470  
**Blocked by:** Editorial extraction from Wikipedia per state  
**Total missing members:** 126 (Kano 39 + Rivers 31 + Ogun 25 + Oyo 31)

| Migration | State | Seats | Outstanding | Source |
|---|---|---|---|---|
| 0467 | Kano | 40 | 39 | Wikipedia: List of Kano HoA 2023-27 |
| 0468 | Rivers | 32 | 31 | Wikipedia: List of Rivers HoA 2023-27 |
| 0469 | Ogun | 26 | 25 | Wikipedia: List of Ogun HoA 2023-27 |
| 0470 | Oyo | 32 | 31 | Wikipedia: List of Oyo HoA 2023-27 |

#### SEED-P2-B · Kano + Rivers LGA Chairpersons
**Migration targets:** 0471–0472  
**Blocked by:** LASIEC/KANSIEC/RSIEC election results extraction

| Migration | State | LGAs | Source |
|---|---|---|---|
| 0471 | Kano | 44 | KANSIEC 2020 LGA elections results |
| 0472 | Rivers | 23 | RSIEC 2021 LGA elections results |

---

### Priority 2 — S07 Financial Regulation (Ready to Seed)

All sources fully extracted and normalized. No editorial blockers.

#### SEED-S07-A · NAICOM Insurance Register
**Migration target:** 0473  
**Source file:** `s07_naicom_all_consolidated_20260422.json`  
**Records:** 836 across 9 categories

| Category | Count |
|---|---|
| Insurance brokers | 706 |
| Life insurers | 14 |
| General insurers | 29 |
| Composite insurers | 12 |
| Takaful operators | 5 |
| Reinsurers | 3 |
| Microinsurance | 17 |
| Loss adjusters | 47 |
| Aggregators | 3 |
| **Total** | **836** |

**Schema target:** `organizations` (type=`insurance_company`/`insurance_broker`/`loss_adjuster`) + `seed_*` sidecar tables.  
**Org ID pattern:** `org_s07_naicom_{category}_{md5[:12]}`

#### SEED-S07-B · NUPRC Oil & Gas Operators
**Migration target:** 0474  
**Source file:** `s07_nuprc_oil_operators_raw_20260422.json`  
**Records:** 116  
**Schema target:** `organizations` (type=`oil_gas_operator`) + licence fields in enrichment.  
**Org ID pattern:** `org_s07_nuprc_{md5[:12]}`

#### SEED-S07-C · SEC Capital Market Operators
**Migration target:** 0475  
**Source file:** `s07_sec_capital_market_operators_20260422.json`  
**Records:** 803 (fund managers, stockbrokers, issuing houses, registrars, etc.)  
**Schema target:** `organizations` (type=`capital_market_operator`) + `operator_type` in enrichment.  
**Org ID pattern:** `org_s07_sec_{md5[:12]}`

---

### Priority 3 — S08 Transport POIs (Ready to Seed)

#### SEED-S08-A · OSM Nigeria Transport Nodes + Bus Stations
**Migration target:** 0476  
**Source files:** `s08_osm_bus_stations_ng_20260422.json` (169), `s08_osm_transport_nodes_ng_20260422.json` (248)  
**Records:** 417 total  
**Schema target:** `organizations` (type=`transport_hub`/`bus_station`) + `place_id` resolved from OSM lat/lon → LGA via bounding-box lookup.  
**Notes:** Many nodes lack names — filter to named entities only (~60% usable).

---

### Priority 4 — S09 Commerce & Services POIs (Ready to Seed)

Single migration per category to stay within D1 statement limits. Each ~10 inserts/record × batch size.

| Migration | Category | Raw count | Est. named | Source file |
|---|---|---|---|---|
| 0477 | Hotels | 1,598 | ~1,200 | `s09_osm_hotels_ng_20260422.json` |
| 0478 | Pharmacies | 454 | ~380 | `s09_osm_pharmacies_ng_20260422.json` |
| 0479 | Supermarkets | 458 | ~400 | `s09_osm_supermarkets_ng_20260422.json` |
| 0480 | Food venues | 1,627 | ~1,100 | `s09_osm_food_venues_ng_20260422.json` |
| 0481 | Marketplace | 306 | ~250 | `s09_osm_marketplace_ng_20260422.json` |
| 0482 | Salons | 464 | ~300 | `s09_osm_salons_ng_20260422.json` |
| 0483 | Spare parts | 228 | ~180 | `s09_osm_spare_parts_ng_20260422.json` |

**Total S09:** ~5,135 raw / ~3,810 named

---

### Priority 5 — S10 Civic & Religious POIs (Ready to Seed)

| Migration | Category | Raw count | Source file |
|---|---|---|---|
| 0484 | Churches | 2,518 | `s10_osm_churches_ng_20260422.json` |
| 0485 | Mosques | 639 | `s10_osm_mosques_ng_20260422.json` |
| 0486 | NGOs | 298 | `s10_osm_ngos_ng_20260422.json` |
| 0487 | Cooperatives | 30 | `s10_osm_cooperatives_ng_20260422.json` |

**Total S10:** 3,485 records

---

### Priority 6 — S11 Agribusiness POIs (Ready to Seed)

| Migration | Category | Raw count | Source file |
|---|---|---|---|
| 0488 | Fuel stations | 1,128 | `s11_osm_fuel_stations_ng_20260422.json` |
| 0489 | Agribusiness compiled | 300 | `s11_osm_compiled_20260422.json` |
| 0490 | Farms (NE+SE+SW) | ~113 | `s11_osm_farm_*_ng_20260422.json` |
| 0491 | Water boreholes (SE+SW) | ~182 | `s11_osm_water_borehole_*_ng_20260422.json` |

**Total S11:** ~1,723 records  
**Note:** Fish/abattoir (S11) and agro-input files returned 0 records — skip.

---

### Priority 7 — S06 HDX eHealth Facilities (Large Batch)

#### SEED-S06-B · HDX eHealth Health Facilities Candidate Dataset
**Migration targets:** 0492–0496 (5 batches of ~9,229 each)  
**Source file:** `s06_health_facilities_hdx_ehealth_candidate_normalized_20260421.json`  
**Records:** 46,146 facilities  
**Schema target:** `organizations` (type=`health_facility`) + `place_id` geocoded from LGA name.  
**Notes:**
- Already partially covered by NHIA (0308) and NPHCDA (0309) — deduplication required before seeding.
- Run cross-reference against `org_s06_nhia_*` and `org_s06_nphcda_*` IDs before generating inserts.
- Split into 5 geographic batches (by zone) to stay within D1 50MB statement limits.
- Estimated net new after dedup: ~35,000 facilities.

---

## Grand Total Unseeded Records

| Batch | Category | Raw count | Priority |
|---|---|---|---|
| SEED-P2-A | State assembly rosters (4 states) | 126 members | P1 |
| SEED-P2-B | LGA chairpersons (Kano + Rivers) | 67 chairs | P1 |
| SEED-S07-A | NAICOM insurance register | 836 orgs | P2 |
| SEED-S07-B | NUPRC oil operators | 116 orgs | P2 |
| SEED-S07-C | SEC capital market operators | 803 orgs | P2 |
| SEED-S08-A | OSM transport nodes + bus stations | 417 POIs | P3 |
| SEED-S09-A–G | OSM commerce & services (7 categories) | 5,135 POIs | P4 |
| SEED-S10-A–D | OSM civic & religious (4 categories) | 3,485 POIs | P5 |
| SEED-S11-A–D | OSM agribusiness (4 categories) | 1,723 POIs | P6 |
| SEED-S06-B | HDX eHealth health facilities | 46,146 facilities | P7 |
| **TOTAL** | | **~58,858 records** | |

**Migrations required:** 0467–0496 = **30 migrations**

---

## Execution Order

```
Phase A (P1 — Phase 2 gates):
  0467 Kano HoA full roster (needs Wikipedia extraction)
  0468 Rivers HoA full roster (needs Wikipedia extraction)
  0469 Ogun HoA full roster (needs Wikipedia extraction)
  0470 Oyo HoA full roster (needs Wikipedia extraction)
  0471 Kano LGA chairs (needs KANSIEC extraction)
  0472 Rivers LGA chairs (needs RSIEC extraction)

Phase B (P2 — financial regulation, no blockers):
  0473 NAICOM insurance (836 orgs)
  0474 NUPRC oil operators (116 orgs)
  0475 SEC capital market operators (803 orgs)

Phase C (P3 — transport, no blockers):
  0476 OSM transport nodes + bus stations (417 POIs)

Phase D (P4 — commerce, no blockers):
  0477–0483 OSM S09 commerce (7 migrations)

Phase E (P5 — civic, no blockers):
  0484–0487 OSM S10 civic & religious (4 migrations)

Phase F (P6 — agribusiness, no blockers):
  0488–0491 OSM S11 agribusiness (4 migrations)

Phase G (P7 — health, needs dedup pre-work):
  0492–0496 HDX eHealth facilities (5 geographic batches)
```

---

## Schema Notes

All OSM POI migrations follow the same pattern as existing org seeds:
- `organizations` table: `id`, `legal_name`, `display_name`, `organization_type`, `tenant_id='tenant_platform_seed'`
- `profiles` table: `subject_id=org_id`, `subject_type='organization'`, `primary_place_id` resolved from OSM `addr:state` + `addr:city` to nearest LGA place_id
- `search_entries` table: keywords from name + category + state
- `seed_*` sidecar: seed_sources, seed_runs, seed_raw_artifacts, seed_ingestion_records, seed_entity_sources, seed_enrichment

For regulated financial entities (NAICOM, NUPRC, SEC), add:
- `seed_enrichment.enrichment_json`: licence number, category, registration date, status

**LGA place_id resolution for OSM data:**
OSM nodes carry `addr:state` and sometimes `addr:city`. Resolution order:
1. Exact match on `place_lga_{state_slug}_{lga_slug}` from `0002_lgas.sql`
2. Fuzzy match via place name normalisation
3. Fallback to state-level `place_state_{state_slug}` with `confidence=0.7`
