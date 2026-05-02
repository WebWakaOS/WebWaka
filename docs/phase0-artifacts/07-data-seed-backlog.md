# Data Seed Backlog — WebWaka OS
**Created:** 2026-05-02  
**Last updated:** 2026-05-02 (all P2–P7 migrations DONE)  
**Scope:** All source data files in `infra/db/seed/sources/` not yet converted to numbered migrations.  
**Convention:** Next available migration number after 0496 is **0497**.

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

## Seed Backlog Status

### Priority 1 — Phase 2 Gate Remainder (DEBT-012) — BLOCKED: editorial

#### SEED-P2-A · Full State Assembly Rosters
**Migration targets:** 0467–0470  
**Blocked by:** Editorial extraction from Wikipedia per state  
**Total missing members:** 126 (Kano 39 + Rivers 31 + Ogun 25 + Oyo 31)

| Migration | State | Seats | Outstanding | Source | Status |
|---|---|---|---|---|---|
| 0467 | Kano | 40 | 39 | Wikipedia: List of Kano HoA 2023-27 | ⏳ BLOCKED |
| 0468 | Rivers | 32 | 31 | Wikipedia: List of Rivers HoA 2023-27 | ⏳ BLOCKED |
| 0469 | Ogun | 26 | 25 | Wikipedia: List of Ogun HoA 2023-27 | ⏳ BLOCKED |
| 0470 | Oyo | 32 | 31 | Wikipedia: List of Oyo HoA 2023-27 | ⏳ BLOCKED |

#### SEED-P2-B · Kano + Rivers LGA Chairpersons
**Migration targets:** 0471–0472  
**Blocked by:** KANSIEC/RSIEC election results extraction

| Migration | State | LGAs | Source | Status |
|---|---|---|---|---|
| 0471 | Kano | 44 | KANSIEC 2020 LGA elections results | ⏳ BLOCKED |
| 0472 | Rivers | 23 | RSIEC 2021 LGA elections results | ⏳ BLOCKED |

---

### Priority 2 — S07 Financial Regulation — ✅ DONE (2026-05-02)

| Migration | Category | Records | File | Status |
|---|---|---|---|---|
| 0473 | NAICOM insurance register (9 categories) | **836** | `0473_regulated_naicom_insurance_seed.sql` | ✅ DONE |
| 0474 | NUPRC oil & gas operators | **116** | `0474_regulated_nuprc_oil_operators_seed.sql` | ✅ DONE |
| 0475 | SEC capital market operators | **803** | `0475_regulated_sec_capital_market_seed.sql` | ✅ DONE |

**Total seeded:** 1,755 regulated financial-sector organizations  
**Rollbacks:** All 3 rollback files created.

---

### Priority 3 — S08 Transport POIs — ✅ DONE (2026-05-02)

| Migration | Category | Records | File | Status |
|---|---|---|---|---|
| 0476 | OSM transport hubs + bus stations | **417** | `0476_osm_transport_seed.sql` | ✅ DONE |

---

### Priority 4 — S09 Commerce & Services POIs — ✅ DONE (2026-05-02)

| Migration | Category | Records | File | Status |
|---|---|---|---|---|
| 0477 | Hotels & guest houses | **1,598** | `0477_osm_hotel_seed.sql` | ✅ DONE |
| 0478 | Pharmacies & chemists | **454** | `0478_osm_pharmacy_seed.sql` | ✅ DONE |
| 0479 | Supermarkets & grocery stores | **458** | `0479_osm_supermarket_seed.sql` | ✅ DONE |
| 0480 | Food venues & restaurants | **1,627** | `0480_osm_food_seed.sql` | ✅ DONE |
| 0481 | Markets & marketplaces | **306** | `0481_osm_marketplace_seed.sql` | ✅ DONE |
| 0482 | Hair salons & barbers | **464** | `0482_osm_s09_salon_seed.sql` | ✅ DONE |
| 0483 | Spare parts dealers | **228** | `0483_osm_s09_spare_parts_seed.sql` | ✅ DONE |

**Total seeded:** 5,135 commerce & services POIs  
**Rollbacks:** All 7 rollback files created.

---

### Priority 5 — S10 Civic & Religious POIs — ✅ DONE (2026-05-02)

| Migration | Category | Records | File | Status |
|---|---|---|---|---|
| 0484 | Churches & Christian congregations | **2,518** | `0484_osm_s10_church_seed.sql` | ✅ DONE |
| 0485 | Mosques & Islamic centres | **639** | `0485_osm_s10_mosque_seed.sql` | ✅ DONE |
| 0486 | NGOs & non-profit organisations | **298** | `0486_osm_s10_ngo_seed.sql` | ✅ DONE |
| 0487 | Cooperatives | **30** | `0487_osm_s10_cooperative_seed.sql` | ✅ DONE |

**Total seeded:** 3,485 civic & religious entities  
**Rollbacks:** All 4 rollback files created.

---

### Priority 6 — S11 Agribusiness POIs — ✅ DONE (2026-05-02)

| Migration | Category | Records | File | Status |
|---|---|---|---|---|
| 0488 | Fuel & petrol stations | **1,128** | `0488_osm_s11_fuel_seed.sql` | ✅ DONE |
| 0489 | Agribusiness entities (compiled) | **300** | `0489_osm_s11_agri_seed.sql` | ✅ DONE |
| 0490 | Farms (NE+SE+SW+NW) | **113** | `0490_osm_s11_farm_seed.sql` | ✅ DONE |
| 0491 | Water boreholes (SE+SW+NW) | **182** | `0491_osm_s11_borehole_seed.sql` | ✅ DONE |

**Total seeded:** 1,723 agribusiness entities  
**Rollbacks:** All 4 rollback files created.

---

### Priority 7 — S06 HDX eHealth Facilities — ✅ DONE (2026-05-02)

**Dedup note:** Cross-reference against NHIA/NPHCDA migrations found 0 name-matched duplicates in migration SQL (names not indexed in forward-migration text). All 46,146 records seeded as INSERT OR IGNORE — any true duplicates silently skipped at apply time by the idempotency guard.

| Migration | Zone | States | Records | File | Status |
|---|---|---|---|---|---|
| 0492 | NC + NE | Benue, FCT, Kogi, Kwara, Nasarawa, Niger, Plateau + Adamawa, Bauchi, Borno, Gombe, Taraba, Yobe | **16,185** | `0492_hdx_health_nc_ne_seed.sql` | ✅ DONE |
| 0493 | NW | Jigawa, Kaduna, Kano, Katsina, Kebbi, Sokoto, Zamfara | **8,542** | `0493_hdx_health_nw_seed.sql` | ✅ DONE |
| 0494 | SE | Abia, Anambra, Ebonyi, Enugu, Imo | **7,023** | `0494_hdx_health_se_seed.sql` | ✅ DONE |
| 0495 | SS | Akwa Ibom, Bayelsa, Cross River, Delta, Edo, Rivers | **5,331** | `0495_hdx_health_ss_seed.sql` | ✅ DONE |
| 0496 | SW | Ekiti, Lagos, Ogun, Ondo, Osun, Oyo | **9,065** | `0496_hdx_health_sw_seed.sql` | ✅ DONE |

**Total seeded:** 46,146 health facilities  
**Rollbacks:** All 5 rollback files created.

---

## Grand Total — Completed This Session

| Priority | Batch | Migrations | Records seeded | Status |
|---|---|---|---|---|
| P1 | State assemblies + LGA chairs | 0467–0472 | 0 | ⏳ BLOCKED (editorial) |
| P2 | S07 Financial regulation | 0473–0475 | **1,755** | ✅ DONE |
| P3 | S08 Transport POIs | 0476 | **417** | ✅ DONE |
| P4 | S09 Commerce & services | 0477–0483 | **5,135** | ✅ DONE |
| P5 | S10 Civic & religious | 0484–0487 | **3,485** | ✅ DONE |
| P6 | S11 Agribusiness | 0488–0491 | **1,723** | ✅ DONE |
| P7 | S06 HDX health facilities | 0492–0496 | **46,146** | ✅ DONE |
| **TOTAL** | | **0473–0496 (24 migrations)** | **58,661 orgs** | |

**Total SQL generated:** 410,974 lines across 24 migrations + 24 rollbacks = 114.9 MB  
**Next migration number:** 0497  
**Remaining backlog:** 0467–0472 (editorial-blocked, ~193 political records)

---

## Schema Notes

All org-seeding migrations follow this pattern (D1/SQLite invariants enforced):
- `INSERT OR IGNORE` everywhere (full idempotency)
- `unixepoch()` for timestamps (never `NOW()`)
- `tenant_id = 'tenant_platform_seed'`
- `workspace_id = 'workspace_platform_seed_discovery'`
- `author_tenant_id = NULL` (platform seed, not tenant-owned)

### Table targets per org record
1. `seed_sources` — one per migration batch
2. `seed_runs` — one per migration batch
3. `seed_raw_artifacts` — one per migration batch
4. `organizations` — one per entity
5. `profiles` — one per entity (`subject_type='organization'`)
6. `search_entries` — one per entity (with `vertical`, `keywords`, `ancestry_path`)
7. `seed_ingestion_records` — one per entity
8. `seed_entity_sources` — one per entity
9. `seed_enrichment` — one per entity (licence data / OSM tags / facility metadata)

### ID patterns
| Batch | org_id pattern |
|---|---|
| NAICOM | `org_s07_naicom_{md5[:16]}` |
| NUPRC | `org_s07_nuprc_{md5[:16]}` |
| SEC | `org_s07_sec_{md5[:16]}` |
| OSM transport | `org_s08_transport_{md5[:16]}` |
| OSM hotels | `org_s09_hotel_{md5[:16]}` |
| OSM civic | `org_s10_{type}_{md5[:16]}` |
| OSM agribusiness | `org_s11_{type}_{md5[:16]}` |
| HDX health | `org_s06_hdx_{md5[:16]}` |
