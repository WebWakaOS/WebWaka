# WebWaka — Nationwide Entity Seeding Inventory
**Date:** 2026-04-21  
**Scope:** All entity types — Individuals, Organizations, Places, Groups — across all 774 LGAs, 37 States, 6 Zones  
**Status:** Deep research review completed 2026-04-21. Official-registry counts were corrected where authoritative sources were available; market-estimate counts remain sizing assumptions and are marked for later verification.

---

## 0. Deep Research Review Addendum — 2026-04-21

This review cross-checked the inventory against current public sources from INEC, Federal Ministry of Health/Nigeria HFR, UBEC, CBN/SANEF, NMDPRA, CAC, NUC, and sector registries. The inventory remains directionally useful, but the following corrections are now canonical for seed planning:

| Area | Prior assumption | Corrected / reviewed position | Operational impact |
|---|---:|---:|---|
| INEC wards / registration areas | 8,814 | **8,809 official INEC registration areas/wards for 2023**; local `infra/db/seed/0003_wards.sql` currently states **8,810** and must be reconciled before production load | Use 8,809 for political counts; audit the extra local ward row |
| Geography seed files | `nigeria_wards.sql` missing | Country, zones, states, LGAs, and `0003_wards.sql` all exist locally | Gap is no longer file creation; it is ward-count reconciliation and DB application |
| Political parties | 91 parties | **21 current INEC-registered parties** as of 2026; **18 parties** contested the 2023 general election | Seed 21 party HQs now; use 18 only when modeling 2023 candidates/results |
| Polling units | sometimes referenced as 19,000+ | **176,846 INEC polling units** | Master inventory and political seeding must use 176,846 |
| Clinics / hospitals | ~57,000 | Nigeria HFR hospitals/clinics live registry shows about **38,815** entries; PHC/CHW networks should stay separate | Reduce clinic seed target and avoid double-counting PHC networks |
| Basic education schools | ~96,023 govt/private split; ~111,000 general | UBEC 2022 UBE data: **171,027 schools** = 79,775 public + 91,252 private | Increase school seed targets where source lists are available |
| Retail petroleum outlets | ~15,000 | NMDPRA-reported downstream retail outlets are about **22,681** | Update fuel/petrol-station target; treat fuel_station and petrol_station as duplicate/synonym verticals unless product requires both |
| Bureaux de Change | 5,686 | Current CBN post-relicensing list is much smaller; use **82 fully licensed BDCs** until CBN updates the official list | Reduce BDC seed target to licensed entities only |
| POS / mobile money agents | ~800,000 | SANEF/CBN ecosystem now reports **2,000,000+ active POS terminals**; terminals are not the same as unique human agents | Keep conservative named-agent seed target, but track terminal vs agent separately |
| CAC registrations | ~3.2M formal/informal | CAC public statistics are stale; reported all-time registered entities are about **3.1M+**, with new annual registrations continuing | Mark CAC-derived organization counts as request/verification-needed, not fully verified |

**Implementation rule after this review:** counts labeled “official” must come from regulator/bulk-register data; counts labeled “market estimate” are only sizing assumptions for discovery density and must not be presented as verified registries.

---

## 1. Total Entity Universe

| Super-type | Nationwide Estimated Count | Profile Tables |
|---|---|---|
| **Places** (geography + facilities) | 9,627 official geography nodes (or 9,628 local pending ward reconciliation) + ~252,000 facility places | 16 vertical profile tables |
| **Organizations** (businesses, institutions, parties, associations) | ~3,100,000+ CAC-registered formal entities + informal/sector estimates | 114 vertical profile tables |
| **Individuals** (politicians, professionals, traders, agents, creators) | ~12,000,000 economically active seedable | 29 vertical profile tables |
| **Groups** (civic, religious, cooperative, community) | ~380,000 registered | Covered under organization verticals |
| **TOTAL SEEDABLE UNIVERSE** | **~15,000,000+ market universe; official first-pass seed targets corrected below** | **143 profile tables** |

> **Seeding philosophy:** The platform uses a claim-first model. Every entity is seeded at `claim_state = 'seeded'` with minimal verified data. Operators claim their profile and upgrade it. The goal of seeding is **discovery density** — every LGA must return results for every major vertical category.

---

## 2. Seeding Dependency Chain

Seed in this exact order. Each layer depends on the one above it.

```
Layer 0:  places (geography)          ← country → zones → states → LGAs → wards
Layer 1:  verticals                   ← 160 definitions from CSV
Layer 2:  individuals / organizations ← root entity records (no vertical data yet)
Layer 3:  profiles                    ← discovery index (subject_type + subject_id + primary_place_id)
Layer 4:  jurisdictions               ← political territory instances (linked to places)
Layer 5:  *_profiles                  ← 143 vertical-specific profile tables
Layer 6:  search_index / search_fts   ← discovery full-text index rebuilt after layers 3-5
```

**Critical rule:** A `profile` row cannot exist without its `individual`, `organization`, or `place` root. A `*_profile` row cannot exist without a `profile`. The `primary_place_id` on every `profile` must reference a seeded LGA, ward, or facility place.

---

## 3. Layer 0 — Geography (Places Table)

All geography is tenant_id = NULL (shared platform infrastructure).

### 3.1 Already Scripted (files exist in `infra/db/seed/`)

| File | Records | Status |
|---|---|---|
| `nigeria_country.sql` | 1 | Scripted |
| `nigeria_zones.sql` | 6 | Scripted |
| `nigeria_states.sql` | 37 | Scripted |
| `0002_lgas.sql` | 774 | Reconciled |
| `0003_wards.sql` | 8,809 INEC-aligned wards/RAs | Reconciled and validated |

**Sub-total geography nodes: 9,627 official target (1 country + 6 zones + 37 states/FCT + 774 LGAs + 8,809 wards), now matched by local scripted seed files.**  
All have pre-computed `ancestry_path` arrays. Apply via `wrangler d1 execute --file`.

### 3.2 The 37 States and Their LGA Counts

| Zone | States | LGAs |
|---|---|---|
| North Central | Benue, Kogi, Kwara, Nasarawa, Niger, Plateau, FCT | 147 |
| North East | Adamawa, Bauchi, Borno, Gombe, Taraba, Yobe | 112 |
| North West | Jigawa, Kaduna, Kano, Katsina, Kebbi, Sokoto, Zamfara | 186 |
| South East | Abia, Anambra, Ebonyi, Enugu, Imo | 95 |
| South South | Akwa Ibom, Bayelsa, Cross River, Delta, Edo, Rivers | 123 |
| South West | Ekiti, Lagos, Ogun, Ondo, Osun, Oyo | 111 |
| **Total** | **37** | **774** |

### 3.3 Ward Seeds (reconciled)

**8,809 official INEC registration areas/wards** — the local generated file `infra/db/seed/0003_wards.sql` has been reconciled to the official target and validates with all 774 LGAs represented as ward parents. Each ward is a `place` record with:
- `geography_type = 'ward'`
- `level = 5`
- `parent_id` → LGA place ID
- `ancestry_path` → `["place_nigeria_001", "<zone>", "<state>", "<lga>"]`

Source: INEC 2023 delimitation data and polling-unit locator. INEC published 8,809 registration areas/wards and 176,846 polling units for the 2023 cycle.

---

## 4. Layer 1 — Verticals Registry

**159 rows** — seeded from `infra/db/seeds/0004_verticals-master.csv` into the `verticals` table.  
Table: `verticals`  
Current live count: **0** (not yet applied).

The CSV is ready. Apply with:
```bash
# Convert CSV to INSERT statements, then apply to both DBs
```

Breakdown by entity type:

| Entity Type | Count | Examples |
|---|---|---|
| organization | 114 | church, school, clinic, cooperative, hotel, court |
| individual | 29 | politician, professional, creator, sole trader, agent |
| place | 16 | motor park, market, fuel station, tech hub, event hall |
| **Total** | **159** | |

Breakdown by category:

| Category | Verticals |
|---|---|
| commerce | 54 |
| transport | 15 |
| professional | 13 |
| civic | 13 |
| agricultural | 12 |
| health | 11 |
| place | 8 |
| education | 8 |
| creator | 8 |
| politics | 7 |
| financial | 6 |
| media | 3 |
| institutional | 1 |

---

## 5. Layer 5 — Entity Data by Category

### 5A. POLITICS

---

#### 5A-1. Politicians — `politician_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_politician`  
**Profile table:** `politician_profiles`  
**National count:** ~11,891 elected officials (current cycle using 8,809 wards and ~991 state assembly seats) + historical

| Office | Count | Territory Scope |
|---|---|---|
| President | 1 | Country |
| Vice President | 1 | Country |
| Governors | 36 | State |
| Deputy Governors | 36 | State |
| Senators | 109 | Senatorial District (3 per state) |
| House of Representatives Members | 360 | Federal Constituency |
| State House of Assembly Members | ~991 | State Constituency (24–40 per state) |
| Local Government Chairmen | 774 | LGA |
| Vice Chairmen / Deputies | 774 | LGA |
| Councillors / Ward Reps | ~8,809 | Ward / Registration Area |
| **Elected officials total** | **~11,891** | |

**Additional political individuals to seed:**
- Candidate records (2023 general election): 15,331 INEC-listed contestants/candidates
- Former governors (1999–2023): 144
- Former presidents (post-independence): 15
- Former senators / HoR (1999–2023 cycles): ~3,000

**Data source:** INEC official results/delimitation data, National Assembly member directory, state assembly websites, SIEC/LGA records for councillors.

**Key fields per row:**
```
individual_id, workspace_id, tenant_id,
office_type (councilor|lga_chairman|state_assembly|hor|senator|governor|president),
jurisdiction_id → places FK,
party_id → organizations FK (political party),
nin_verified (0 initially),
inec_filing_ref (INEC candidate number),
term_start, term_end,
status ('seeded')
```

---

#### 5A-2. Political Parties — `political_party_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_political_party`  
**Profile table:** `political_party_profiles`  
**National count:** 21 current INEC-registered parties (2026) + state/LGA/ward chapters; use 18 parties for 2023 election-cycle data

| Level | Count |
|---|---|
| National HQ (current INEC registered parties) | 21 |
| State chapters (21 × 37) | 777 |
| LGA chapters (top 6 parties × 774) | 4,644 |
| Ward chapters (top 3 parties × 8,809) | 26,427 |

**Seed priority:** Seed 21 national HQs first, then all 21 state chapters (777 rows), then LGA chapters for the top 6 parties (APC, PDP, LP, NNPP, APGA, SDP). Ward chapters should be a later expansion because public structured ward-office data is inconsistent.

**Data source:** INEC political party register (public), party official websites.

---

#### 5A-3. Campaign Offices — `campaign_office_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_campaign_office`  
**National count:** ~5,000 active during election cycles; ~1,000 permanent  
**Data source:** Party registration filings, state electoral commission records.

---

#### 5A-4. Ward Representatives — `ward_rep_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_ward_rep`  
**National count:** ~8,809 (one elected councillor per ward)  
**Data source:** State Independent Electoral Commissions (SIECs), LGA secretariat records.

---

#### 5A-5. Constituency Offices — `constituency_office_profiles`
**Entity type:** Place  
**Vertical:** `vtx_constituency_office`  
**National count:** 1,460 (360 HoR + 109 Senate + ~991 state assembly)  
**Data source:** National Assembly directory, state assembly directories.

---

#### 5A-6. Polling Units — `polling_unit_profiles`
**Entity type:** Individual (rep) / Place (unit)  
**Vertical:** `vtx_polling_unit_rep`  
**National count:** 176,846 polling units (INEC 2023 official)  
**Note:** Each polling unit is both a Place (location) and has a presiding officer (individual). Seed the places first via ward-level place records, then the profile rows.  
**Data source:** INEC 2023 polling unit register (available as bulk download at inec.gov.ng/irev).

---

#### 5A-7. LGA Offices — `government_agency_profiles` (local)
**Entity type:** Place  
**Vertical:** `vtx_lga_office`  
**National count:** 774 (one per LGA)  
**Data source:** ALGON (Association of Local Governments of Nigeria) directory.

---

### 5B. TRANSPORT

---

#### 5B-1. Motor Parks — `motor_park_profiles`
**Entity type:** Place  
**Vertical:** `vtx_motor_park`  
**Profile table:** `motor_park_profiles`  
**National count:** ~5,400 registered motor parks + informal terminals

| Tier | Count | Description |
|---|---|---|
| Major interstate terminals | ~250 | State-capital-level, FRSC-registered |
| LGA-level parks (1+ per LGA) | ~1,548 | At least 2 per LGA average |
| Community / neighbourhood parks | ~3,600 | Ward-level informal |
| **Total** | **~5,400** | |

**Key fields:** `park_name, lga, state, place_id (LGA FK), frsc_operator_ref, nurtw_ref, capacity, status='seeded'`  
**Data source:** NURTW national secretariat, FRSC state commands, OSM Overpass API (amenity=bus_station), Google Maps Nigeria motor park layer.

---

#### 5B-2. NURTW Chapters — `nurtw_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_nurtw`  
**National count:** ~774 LGA-level chapters + 37 state councils + 1 national HQ = ~812  
**Data source:** NURTW national secretariat member register.

---

#### 5B-3. NURTW Road Transport Unions — `road_transport_union_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_nurtw` (road-transport-union slug)  
**National count:** ~812 (same as NURTW chapters)  
**Note:** Overlapping with NURTW; covers RTEAN and other state-level unions in parallel.

---

#### 5B-4. Okada / Keke Co-ops — `okada_keke_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_okada_keke`  
**National count:** ~5,000 registered co-ops / unions  
**Note:** Every LGA has at minimum one Okada riders' association and one Keke NAPEP association.  
Minimum floor: 774 × 2 = 1,548 seed rows.  
**Data source:** State transport ministries, NURTW records, LGA secretariats.

---

#### 5B-5. Mass Transit Operators — `transit_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_transit`  
**National count:** ~200 registered operators (BRT, state bus schemes, private fleets)  
**Key examples:** BRT Lagos, LAGBUS, Abuja Metro, SUBEB school buses, state government fleets.  
**Data source:** State transport authorities, FRSC fleet registers.

---

#### 5B-6. Rideshare / Carpooling — `rideshare_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_rideshare`  
**National count:** ~500,000 active (Bolt, Uber, InDriver drivers + independent)  
**Seed target:** ~50,000 verified operator profiles (those with FRSC + CAC).  
**Data source:** FRSC private vehicle license database, driver app operator registers.

---

#### 5B-7. Haulage / Logistics Operators — `haulage_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_haulage`  
**National count:** ~3,000 CAC-registered haulage companies + ~200,000 individual truck owners  
**Seed target:** ~5,000 (registered operators with FRSC fleet refs).  
**Data source:** FRSC, CAC business name register, NARTO (Nigerian Association of Road Transport Owners).

---

#### 5B-8. Cargo Truck Owners — `cargo_truck_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_cargo_truck`  
**National count:** ~200,000 registered truck owners  
**Seed target:** ~20,000 (FRSC-registered, active long-haul routes).  
**Data source:** FRSC CMRIS (Centralised Motor Vehicle Administration System).

---

#### 5B-9. Dispatch Rider Networks — `dispatch_rider_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_dispatch_rider`  
**National count:** ~1,000 registered dispatch networks; ~500,000 individual riders  
**Seed target:** ~2,000 organizational profiles.  
**Data source:** State employment commission registers, Logistics Association of Nigeria.

---

#### 5B-10. Couriers — `courier_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_courier`  
**National count:** ~500 CAC-registered courier companies  
**Major operators to seed:** DHL, FedEx, UPS, Aramex, Kobo360, ACE, Skynet, Red Star Express, Efex, Sendbox.  
**Data source:** Nigerian Postal Service (NIPOST) courier license register.

---

#### 5B-11. Logistics & Last-Mile Delivery — `logistics_delivery_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_logistics_delivery`  
**National count:** ~2,000 registered last-mile operators.  
**Data source:** NIPOST, CAC, Logistics Association of Nigeria.

---

#### 5B-12. Airport Shuttle Services — `airport_shuttle_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_airport_shuttle`  
**National count:** ~150 (operators across 30 active airports)  
**Data source:** FAAN (Federal Airports Authority of Nigeria) concession records.

---

#### 5B-13. Ferry / Water Transport — `ferry_operator_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_ferry`  
**National count:** ~100 licensed operators (NIMASA-registered)  
**States:** Lagos, Rivers, Bayelsa, Delta, Cross River, Akwa Ibom  
**Data source:** NIMASA vessel registry.

---

#### 5B-14. Driving Schools — `driving_school_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_driving_school`  
**National count:** ~1,500 FRSC-accredited driving schools  
**Data source:** FRSC accredited driving school directory (frscnigeria.org).

---

#### 5B-15. Container Depots — `container_depot_profiles`
**Entity type:** Place  
**Vertical:** `vtx_container_depot`  
**National count:** ~50 major depots (Lagos Apapa, Tin Can, Port Harcourt, Onne, Calabar, Warri, Kano dry port)  
**Data source:** Nigerian Shippers Council, NPA (Nigerian Ports Authority).

---

### 5C. CIVIC

---

#### 5C-1. Churches — `church_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_church`  
**National count:** ~500,000+ (CAN estimate)  
**Seed target:** ~50,000 landmark and registered churches  
- All 37 state-capital cathedral/major churches: ~500
- LGA-level headquarters of top 50 denominations: ~37,000
- Notable megachurches: ~200

**Top denominations (national footprint):** RCCG (~14,000 parishes), Winners Chapel (~3,000), MFM (~4,000), Catholic (~1,500 parishes), Anglican (~2,000 parishes), Methodist (~800), Baptist (~1,500), Assemblies of God (~2,000), CAC (~1,000), CCC (~800).  
**Data source:** CAN (Christian Association of Nigeria) state secretariats, CAC (Corporate Affairs Commission) NGO register, denomination HQ directories.

---

#### 5C-2. Mosques — `mosque_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_mosque`  
**National count:** ~100,000+ (JNI estimate)  
**Seed target:** ~20,000 (Juma'ah mosques — Friday prayer mosques are the public-facing ones)  
- State central mosques: 37
- LGA Juma'ah mosques (avg 5 per LGA): 3,870
- University/federal institution mosques: ~200

**Data source:** JNI (Jama'atu Nasril Islam) state chapters, NSCIA (Nigerian Supreme Council for Islamic Affairs), Wikipedia mosque lists.

---

#### 5C-3. Ministry / Apostolic Missions — `ministry_mission_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_ministry_mission`  
**National count:** ~100,000+ (overlaps with churches; independent apostolic missions)  
**Seed target:** ~10,000 major missions with IT registration.  
**Data source:** CAC NGO register.

---

#### 5C-4. NGOs — `ngo_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_ngo`  
**National count:** ~100,000 CAC-registered NGOs  
**Seed target:** ~20,000 (active, IT-registered, with programmes)  
**Data source:** CAC Incorporated Trustees register, SCUML (Special Control Unit against Money Laundering) NGO directory.

---

#### 5C-5. Cooperatives — (covered under `cooperative_members`)
**Entity type:** Organization  
**Vertical:** `vtx_cooperative`  
**National count:** ~200,000 registered cooperative societies  
**Data source:** Federal Ministry of Agriculture cooperative department, state cooperative registries.

---

#### 5C-6. Youth Organizations — `youth_org_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_youth_org`  
**National count:** ~50,000 (NYSC alumni associations, NUS, student unions, youth wings of political parties)  
**Data source:** National Youth Council of Nigeria, NUC student union register.

---

#### 5C-7. Women's Associations — `womens_assoc_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_womens_assoc`  
**National count:** ~30,000 (market women associations, NWLG, NGO women groups, traders unions)  
**Data source:** National Council of Women's Societies (NCWS), market association records.

---

#### 5C-8. Market Associations — `market_association_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_market_association`  
**National count:** ~8,000+ (one per market; every market has a traders association)  
**Data source:** State ministries of trade and commerce, LGA market department records.

---

#### 5C-9. Professional Associations — `professional_assoc_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_professional_assoc`  
**National count:** ~500 national associations + ~18,500 state/LGA chapters  
**Key bodies:** NBA (lawyers), NMA (doctors), ICAN (accountants), COREN (engineers), ARCON (architects), IPAN (pharmacists), NAS (nurses), NIQS (quantity surveyors), NSE (engineers), NIMN (marketers), CIBN (bankers), CIMAN, ICAN, ANAN, NIM  
**Data source:** Federal Ministry of Finance professional regulation records, individual body directories.

---

#### 5C-10. Sports Clubs — `sports_club_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_sports_club`  
**National count:** ~20,000 (LFF state associations, community leagues, schools teams)  
- NPFL clubs: 20 (top flight football)
- NNL clubs: 48 (second tier)
- State FA-registered clubs: ~2,000
- Amateur leagues: ~18,000

**Data source:** NFF (Nigeria Football Federation), state football associations, LFF.

---

#### 5C-11. Book Clubs — `book_club_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_book_club`  
**National count:** ~2,000 (university-based, community-based)  
**Data source:** Reading Nigeria coalition, Goodreads Nigeria groups.

---

#### 5C-12. Orphanages — `orphanage_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_orphanage`  
**National count:** ~1,200 (Ministry of Women Affairs registered)  
**Data source:** Federal Ministry of Women Affairs, state social welfare departments.

---

#### 5C-13. Waste Management — `waste_mgmt_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_waste_management`  
**National count:** ~500 registered operators + 37 state agencies  
- State waste management authorities: 37 (LAWMA, WAMCO, etc.)
- Private waste collectors: ~500

**Data source:** NESREA, state environment ministries.

---

### 5D. COMMERCE

---

#### 5D-1. Markets / Trading Hubs — `market_stalls` (parent: `market_association_profiles`)
**Entity type:** Place  
**Vertical:** `vtx_market`  
**National count:** ~8,000+ open/periodic/permanent markets  

| Market type | Count |
|---|---|
| Permanent daily markets (state capital) | ~185 (5 per state) |
| LGA-level permanent markets | ~1,548 (2 per LGA) |
| Periodic/weekly markets | ~4,000 |
| Night markets | ~500 |
| Specialist markets (spare parts, electronics, fabric) | ~800 |
| **Total** | **~7,000–9,000** |

**Data source:** Federal Ministry of Industry Trade and Investment (FMITI) market census, NBS market survey 2019, state commerce ministries, OSM Overpass (marketplace tag).

---

#### 5D-2. Wholesale Markets — (subset of market, `vtx_wholesale_market`)
**Entity type:** Place  
**National count:** ~100 major wholesale markets  
**Key landmarks:** Onitsha Main Market, Alaba International (Lagos), Ladipo Auto Market (Lagos), Nnewi spare parts, Kano central market, Balogun Market (Lagos), Ariaria (Aba), Mile 12 (Lagos), New Benin Market, Wuse Market (Abuja), Gbagi Market (Ibadan), Aba International Market.  
**Data source:** FMITI wholesale market directory.

---

#### 5D-3. Fuel Stations — `fuel_station_profiles` / `petrol_station_profiles`
**Entity type:** Place  
**Vertical:** `vtx_fuel_station` / `vtx_petrol_station`  
**National count:** ~15,000 operational stations (NMDPRA data)  

| Category | Count |
|---|---|
| Major oil company branded (NNPC, Total, Mobil, Oando, Conoil) | ~5,000 |
| Independent operators | ~10,000 |
| **Total** | **~15,000** |

**Data source:** NMDPRA (Nigerian Midstream and Downstream Petroleum Regulatory Authority) station register, IPMAN (Independent Petroleum Marketers Association of Nigeria) member directory, DPR legacy data.

---

#### 5D-4. Hotels / Guesthouses / Shortlets — `hotel_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_hotel`  
**National count:** ~10,000 (NBS tourism survey; NHC registered)  

| Category | Count |
|---|---|
| 5-star hotels | ~50 |
| 4-star hotels | ~150 |
| 3-star hotels | ~500 |
| 2-star / budget hotels | ~2,000 |
| Guesthouses / motels | ~4,000 |
| Shortlet apartments (Airbnb-style) | ~3,000+ |
| **Total** | **~9,700** |

**Data source:** Nigeria Hotel Owners and Managers Association (NHOMA), NHC (Nigerian Hotels Classification), Booking.com Nigeria listings, Airbnb Nigeria listings.

---

#### 5D-5. Restaurants / Eateries / Bukas — `restaurant_chain_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_restaurant` / `vtx_restaurant_chain`  
**National count:** ~500,000+ (NBS MSME census includes food service)  
**Seed target:** ~50,000 (named, located restaurants with a permanent address)  

| Category | Count |
|---|---|
| International fast food chains (KFC, Dominos, Chicken Republic) | ~1,000 outlets |
| Nigerian chains (Tastee Fried Chicken, Tantalizers, Mr Biggs) | ~500 outlets |
| Hotel restaurants | ~2,000 |
| Named standalone restaurants | ~20,000 |
| Local bukas with permanent location | ~25,000 |

**Data source:** Google Maps Nigeria restaurants, Zomato/Tripadvisor Nigeria, NAFDAC food premise registrations.

---

#### 5D-6. Food Vendors / Street Food — `food_vendor_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_food_vendor`  
**National count:** ~5,000,000+ (informal)  
**Seed target:** ~100,000 (those with a fixed/semi-fixed location per ward/LGA)  
**Note:** These are individual operators (mama puts, suya spots, etc.) — seeded per ward with approximated names initially.  
**Data source:** NBS MSME survey, Google Maps food vendor pins.

---

#### 5D-7. Supermarkets / Grocery Stores — (`vtx_supermarket`, no dedicated profile table — uses `pos_products` + `organizations`)
**Entity type:** Organization  
**Vertical:** `vtx_supermarket`  
**National count:** ~5,000 named supermarkets  

| Category | Count |
|---|---|
| International (Shoprite, SPAR) | ~50 |
| Nigerian chains (Jendol, Ebeano, Hubmart, Prince Ebeano) | ~300 |
| Independent supermarkets | ~4,000 |

**Data source:** Retail Association of Nigeria, Google Maps supermarket pins.

---

#### 5D-8. Auto Mechanics / Garages — `auto_mechanic_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_auto_mechanic`  
**National count:** ~500,000+ informal; ~10,000 registered workshops  
**Seed target:** ~15,000 (those with permanent premises per LGA)  
**Data source:** Motor mechanics apprenticeship board, FRSC workshops list.

---

#### 5D-9. Beauty Salons / Barber Shops — `beauty_salon_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_beauty_salon`  
**National count:** ~1,000,000+ (NBS MSME census)  
**Seed target:** ~50,000 (branded/named salons with permanent premises)  
**Data source:** Beauty industry association records, Google Maps Nigeria salon pins.

---

#### 5D-10. Hair Salons (individual operators) — `hair_salon_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_hair_salon`  
**National count:** ~800,000 (individual stylists/barbers)  
**Seed target:** ~30,000 (those with identifiable locations per ward)  

---

#### 5D-11. Laundry / Dry Cleaners — `laundry_profiles` / `laundry_service_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_laundry`  
**National count:** ~50,000  
**Seed target:** ~10,000  
**Data source:** Laundry Association of Nigeria, Google Maps.

---

#### 5D-12. Tailors / Fashion Designers — `tailor_profiles` / `tailor_clients`
**Entity type:** Individual  
**Vertical:** `vtx_tailor` / `vtx_tailoring`  
**National count:** ~2,000,000 (NBS artisan census)  
**Seed target:** ~100,000 (named tailors with permanent shops)  
**Data source:** Fashion Designers Association of Nigeria (FADAN), market association records.

---

#### 5D-13. Construction Firms — `construction_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_construction`  
**National count:** ~5,000 CAC-registered construction companies + ~50,000 informal contractors  
**Seed target:** ~8,000  
**Data source:** CORBON (Construction Regulatory and Monitoring Board of Nigeria), CAC business register.

---

#### 5D-14. Real Estate Agencies — `real_estate_agency_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_real_estate_agency`  
**National count:** ~10,000 registered agents  
**Data source:** ESVARBON (Estate Surveyors and Valuers Registration Board), NIOB (Nigerian Institution of Estate Surveyors and Valuers), PropertyPro.ng and NigeriaPropertyCentre listings.

---

#### 5D-15. Property Developers — `property_developer_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_property_developer`  
**National count:** ~2,000 registered developers  
**Data source:** REDAN (Real Estate Developers Association of Nigeria), CAC.

---

#### 5D-16. Printing Shops — `print_shop_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_print_shop`  
**National count:** ~100,000 informal; ~10,000 with permanent premises  
**Seed target:** ~15,000  

---

#### 5D-17. Electronics Repair — `electronics_repair_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_electronics_repair`  
**National count:** ~200,000 informal; ~20,000 with shops  
**Seed target:** ~25,000  

---

#### 5D-18. Phone Repair Shops — `phone_repair_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_phone_repair`  
**National count:** ~500,000 (ubiquitous — every LGA has dozens)  
**Seed target:** ~50,000  

---

#### 5D-19. Bakeries / Confectioneries — `bakery_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_bakery`  
**National count:** ~200,000 informal; ~10,000 registered  
**Seed target:** ~15,000  
**Data source:** Bread Bakers Association of Nigeria, NAFDAC food premise register.

---

#### 5D-20. Catering Services — `catering_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_catering`  
**National count:** ~100,000 informal; ~5,000 registered  
**Seed target:** ~8,000  

---

#### 5D-21. Cleaning Services — `cleaning_service_profiles` / `cleaning_company_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_cleaning_service` / `vtx_cleaning_company`  
**National count:** ~3,000 registered companies  
**Seed target:** ~5,000  

---

#### 5D-22. Security Companies — `security_company_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_security_co`  
**National count:** ~2,000 licensed (Private Guard Companies Act, Nigeria Security and Civil Defence Corps)  
**Data source:** NSCDC private guard company register.

---

#### 5D-23. Solar Installers — `solar_installer_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_solar_installer`  
**National count:** ~1,500 CAC-registered  
**Data source:** NABSE (Nigerian Association of Battery and Solar Experts), REES (Rural Electrification Agency) installer register.

---

#### 5D-24. Used Car Dealers — `used_car_dealer_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_used_car_dealer`  
**National count:** ~10,000 (Lagos Ijora, Abuja Trade More, Port Harcourt, Kano)  
**Data source:** MVAA (Motor Vehicle Administration Authority), Association of Motor Dealers Nigeria.

---

#### 5D-25. Spare Parts Dealers — `spare_parts_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_spare_parts`  
**National count:** ~50,000 (Ladipo, Nnewi, Trade Fair, Kasuwan Lari)  
**Seed target:** ~20,000  
**Data source:** OSM Overpass, market association records.

---

#### 5D-26. Tyre Shops / Vulcanizers — `tyre_shop_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_tyre_shop`  
**National count:** ~200,000 (ubiquitous — every 500m on major roads)  
**Seed target:** ~30,000 (named shops with addresses)  

---

#### 5D-27. Car Wash / Detailing — `car_wash_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_car_wash`  
**National count:** ~50,000  
**Seed target:** ~10,000  

---

#### 5D-28. Bookshops / Stationery — `bookshop_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_bookshop`  
**National count:** ~5,000 named bookshops  
**Data source:** Book Booksellers Association of Nigeria, university/school supply chains.

---

#### 5D-29. Generator Dealers — `generator_dealer_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_generator_dealer`  
**National count:** ~5,000  

---

#### 5D-30. Generator Repair / HVAC — `generator_repair_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_generator_repair`  
**National count:** ~100,000 technicians  
**Seed target:** ~20,000  

---

#### 5D-31. Building Materials — `building_materials_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_building_materials`  
**National count:** ~100,000 dealers; ~10,000 named shops  
**Seed target:** ~15,000  

---

#### 5D-32. Iron & Steel / Roofing — `iron_steel_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_iron_steel`  
**National count:** ~5,000 distributors  

---

#### 5D-33. Electrical Fittings — `electrical_fittings_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_electrical_fittings`  
**National count:** ~20,000 dealers  

---

#### 5D-34. Paints Distributors — `paints_distributor_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_paints_distributor`  
**National count:** ~10,000  

---

#### 5D-35. Furniture Makers — `furniture_maker_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_furniture_maker`  
**National count:** ~200,000 workshops; ~20,000 named shops  
**Seed target:** ~25,000  

---

#### 5D-36. Welding / Fabrication — `welding_shop_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_welding_fab`  
**National count:** ~300,000 welders; ~50,000 shops  
**Seed target:** ~30,000  

---

#### 5D-37. Plumbing Supplies — `plumbing_supplies_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_plumbing_supplies`  
**National count:** ~10,000  

---

#### 5D-38. Florists / Garden Centres — `florist_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_florist`  
**National count:** ~2,000  

---

#### 5D-39. Internet Cafés / Business Centres — `internet_cafe_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_internet_cafe`  
**National count:** ~50,000 (declining but still active in secondary towns)  
**Seed target:** ~10,000  

---

#### 5D-40. Motorcycle Accessories Shops — `motorcycle_accessories_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_motorcycle_shop`  
**National count:** ~20,000  

---

#### 5D-41. Printing Presses — `printing_press_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_printing_press`  
**National count:** ~3,000 registered printing presses  
**Data source:** NPC (Nigerian Publishers Association), state printing associations.

---

#### 5D-42. Gas / LPG Distributors — `gas_distributor_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_gas_distributor`  
**National count:** ~5,000 licensed dealers (NMDPRA)  
**Data source:** NMDPRA LPG dealer register, NLPGA (Nigerian LPG Association).

---

#### 5D-43. Travel Agents / Tour Operators — `travel_agent_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_travel_agent`  
**National count:** ~3,000 IATA-accredited + NANTA members  
**Data source:** NANTA (National Association of Nigeria Travel Agencies), IATA Nigeria list.

---

#### 5D-44. Spas / Massage Parlours — `spa_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_spa`  
**National count:** ~3,000  

---

#### 5D-45. POS Business Management — (uses `organizations` + pos tables)
**Entity type:** Organization  
**Vertical:** `vtx_pos_business`  
**National count:** ~500,000 POS merchants  
**Seed target:** ~50,000 (named registered merchants)  
**Data source:** CBN POS terminal deployment data, Interswitch, PTSP records.

---

#### 5D-46. Hire Purchase / Asset Finance — `hire_purchase_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_hire_purchase`  
**National count:** ~1,000 registered finance houses + informal dealers  
**Data source:** CBN microfinance/finance company register.

---

### 5E. PROFESSIONAL SERVICES

---

#### 5E-1. Professionals (Lawyers, Doctors, etc.) — `professional_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_professional`  
**Profile table:** `professional_profiles`  
**National count by profession:**

| Profession | Regulator | Registered Count |
|---|---|---|
| Lawyers | NBA | ~80,000 |
| Medical doctors | MDCN | ~60,000 |
| Pharmacists | PCN | ~25,000 |
| Dentists | MDCN | ~5,000 |
| Nurses / midwives | NMCN | ~300,000 |
| Accountants | ICAN | ~45,000 |
| Accountants (ANAN) | ANAN | ~20,000 |
| Engineers | COREN | ~55,000 |
| Architects | ARCON | ~10,000 |
| Quantity Surveyors | NIQS | ~8,000 |
| Land Surveyors | SURCON | ~10,000 |
| Town Planners | TOPREC | ~5,000 |
| Opticians | OOBN | ~3,000 |
| Veterinarians | VCNB | ~4,000 |
| **Total** | | **~630,000** |

**Data source:** Each regulatory body's member directory (most are publicly available online).

---

#### 5E-2. Law Firms — `law_firm_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_law_firm`  
**National count:** ~15,000 registered law firms (NBA firm register)  
**Data source:** NBA (Nigerian Bar Association) law firm directory.

---

#### 5E-3. Accounting Firms — `accounting_firm_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_accounting_firm`  
**National count:** ~8,000 ICAN-registered audit/accounting firms  
**Data source:** ICAN firm practice certificate register.

---

#### 5E-4. Tax Consultants — `tax_consultant_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_tax_consultant`  
**National count:** ~15,000 CITN (Chartered Institute of Taxation) members  
**Data source:** CITN member directory.

---

#### 5E-5. Land Surveyors — `land_surveyor_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_land_surveyor`  
**National count:** ~10,000 (SURCON register)  
**Data source:** SURCON member register.

---

#### 5E-6. IT Support / Computer Repair — `it_support_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_it_support`  
**National count:** ~200,000 technicians; ~20,000 registered firms  
**Seed target:** ~30,000  

---

#### 5E-7. Handymen (Plumbers, Electricians) — `handyman_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_handyman`  
**National count:** ~2,000,000 (NBS artisan survey)  
**Seed target:** ~100,000 (registered through LGA artisan associations)  
**Data source:** State artisan guilds, LGA trade unions.

---

#### 5E-8. PR Firms — `pr_firm_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_pr_firm`  
**National count:** ~500 NIPR-registered firms  
**Data source:** NIPR (Nigerian Institute of Public Relations) member directory.

---

#### 5E-9. Motivational Speakers / Training Firms — `motivational_speaker_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_motivational_speaker`  
**National count:** ~5,000  

---

#### 5E-10. Wedding Planners — `wedding_planner_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_wedding_planner`  
**National count:** ~20,000 active planners  

---

#### 5E-11. Event Planners / MCs — `event_planner_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_event_planner`  
**National count:** ~100,000  
**Seed target:** ~20,000  

---

#### 5E-12. Funeral Homes — `funeral_home_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_funeral_home`  
**National count:** ~1,500 registered  
**Data source:** State burial ground authorities, NAHCON-adjacent bodies.

---

### 5F. HEALTH

---

#### 5F-1. Clinics / Hospitals — `clinic_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_clinic`  
**National count:** ~38,815 hospitals/clinics in Nigeria HFR live registry; PHC and CHW networks counted separately

| Facility type | Count |
|---|---|
| Federal tertiary hospitals | 23 |
| State general hospitals (1+ per LGA) | ~900 |
| State specialist hospitals | ~250 |
| Private hospitals | ~8,000 |
| Private clinics / maternity homes | ~15,000 |
| Primary Health Care centres (PHC) | Count separately under community_health / PHC network seeds |
| **Total** | **~38,815 HFR hospital/clinic entries** |

**Data source:** Nigeria Health Facility Registry (Federal Ministry of Health), NHIA/NHIS accredited facilities list, state Ministry of Health facility registers. NPHCDA PHC data should be reconciled under community_health rather than double-counted here.

---

#### 5F-2. Pharmacies — `pharmacy_chain_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_pharmacy` / `vtx_pharmacy_chain`  
**National count:** ~15,000 (PCN registered)  
**Data source:** PCN (Pharmacy Council of Nigeria) premise registration list.

---

#### 5F-3. Dental Clinics — `dental_clinic_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_dental_clinic`  
**National count:** ~2,000  
**Data source:** MDCN dental specialty register.

---

#### 5F-4. Opticians / Eye Clinics — `optician_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_optician`  
**National count:** ~3,000  
**Data source:** OOBN (Optometrists and Dispensing Opticians Registration Board) list.

---

#### 5F-5. Vet Clinics / Pet Shops — `vet_clinic_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_vet_clinic`  
**National count:** ~500 vet clinics + ~1,500 vet shops  
**Data source:** VCNB (Veterinary Council of Nigeria) practice register.

---

#### 5F-6. Rehab Centres — `rehab_centre_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_rehab_centre`  
**National count:** ~300 (NDLEA-licensed + private)  
**Data source:** NDLEA (National Drug Law Enforcement Agency) treatment centre register.

---

#### 5F-7. Community Health (CHW Networks) — `community_health_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_community_health`  
**National count:** ~774 CHW networks (one per LGA)  
**Data source:** NPHCDA community health extension worker programme.

---

#### 5F-8. Elderly Care Facilities — `elderly_care_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_elderly_care`  
**National count:** ~200 registered facilities  

---

#### 5F-9. Sports Academies / Fitness Centres — `sports_academy_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_sports_academy`  
**National count:** ~2,000  

---

#### 5F-10. Gyms / Wellness Centres — `gym_fitness_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_gym` / `vtx_gym_fitness`  
**National count:** ~5,000  

---

#### 5F-11. Spas — (covered under 5D-44)

---

### 5G. EDUCATION

---

#### 5G-1. Government Schools — `govt_school_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_govt_school`  
**National count:** 79,775 public UBE schools (UBEC 2022 National Personnel Audit)

| Level | Count |
|---|---|
| Public ECCDE / primary / junior secondary UBE schools | 79,775 |
| Federal/state senior secondary schools | Add from FME/NEMIS when a current public extract is available |
| **Total** | **79,775 public UBE schools, plus senior-secondary delta pending NEMIS** |

**Data source:** UBEC (Universal Basic Education Commission) school census, FME (Federal Ministry of Education) school register, state SUBEB records.

---

#### 5G-2. Private Schools — `private_school_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_private_school`  
**National count:** 91,252 private UBE schools (UBEC 2022 National Personnel Audit), plus tertiary institutions tracked separately

| Level | Count |
|---|---|
| Private ECCDE / primary / junior secondary UBE schools | 91,252 |
| Private universities, polytechnics, monotechnics, colleges of education | Track via NUC/NBTE/NCCE as separate tertiary institution seeds |
| Senior secondary / model / international schools | Add from FME/NEMIS or state education board extracts |
| **Total** | **91,252 private UBE schools, plus tertiary/senior-secondary delta pending regulator extracts** |

**Data source:** NUC (National Universities Commission) approved universities list, NBTE (National Board for Technical Education) polytechnic list, state education boards.

---

#### 5G-3. General Schools — `school_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_school`  
**National count:** Combines public + private UBE schools; total **171,027** in UBEC 2022 NPA before senior-secondary/tertiary additions  

---

#### 5G-4. Nursery Schools / Crèches — `nursery_school_profiles` / `creche_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_nursery_school` / `vtx_creche`  
**National count:** ~40,000 (state SUBEB nursery school register)  

---

#### 5G-5. Training Institutes / Vocational Schools — `training_institute_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_training_institute`  
**National count:** ~5,000 NBTE-accredited + ~20,000 informal  
**Seed target:** ~10,000  
**Data source:** NBTE (National Board for Technical Education) vocational school list.

---

#### 5G-6. Tutors / Lesson Teachers — (individual, no dedicated profile table — uses `sole_trader_profiles` + social)
**Entity type:** Individual  
**Vertical:** `vtx_tutoring`  
**National count:** ~1,000,000 (informal tutors)  
**Seed target:** ~50,000 (registered with education associations)  

---

#### 5G-7. Driving Schools — (covered under 5B-14)

---

### 5H. AGRICULTURAL

---

#### 5H-1. Farms — `farm_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_farm`  
**National count:** ~36,000,000 farm households (NBS agricultural census)  
**Seed target:** ~500,000 (named, geo-located farms registered with ADP or cooperatives)  
**Data source:** NBS agricultural survey, FADAMA project data, ADP (Agricultural Development Programme) state records, NIRSAL farmer database.

---

#### 5H-2. Poultry Farms — `poultry_farm_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_poultry_farm`  
**National count:** ~165,000 (FAO / PPPAN data)  
**Seed target:** ~30,000 (commercially registered)  
**Data source:** PPPAN (Poultry Association of Nigeria), NAFDAC poultry farm register.

---

#### 5H-3. Agro-Input Dealers — `agro_input_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_agro_input`  
**National count:** ~50,000  
**Data source:** FMARD (Federal Ministry of Agriculture and Rural Development) input dealer register, NASC (National Agricultural Seeds Council).

---

#### 5H-4. Cold Room / Storage Facilities — `cold_room_profiles`
**Entity type:** Place  
**Vertical:** `vtx_cold_room`  
**National count:** ~1,000 commercial cold rooms  
**Data source:** NIFST (Nigerian Institute of Food Science and Technology), state agriculture ministries.

---

#### 5H-5. Cassava / Maize / Rice Millers — `cassava_miller_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_cassava_miller`  
**National count:** ~5,000 registered mills  
**Data source:** RMRDC (Raw Materials Research and Development Council), FMARD processing units register.

---

#### 5H-6. Fish Markets / Fishmongers — `fish_market_profiles`
**Entity type:** Place  
**Vertical:** `vtx_fish_market`  
**National count:** ~500+ dedicated fish markets  
**Data source:** FISON (Fisheries Society of Nigeria), state fishery departments.

---

#### 5H-7. Abattoirs / Meat Processing — `abattoir_profiles`
**Entity type:** Place  
**Vertical:** `vtx_abattoir`  
**National count:** ~500 government-approved abattoirs  
**Data source:** NAFDAC, state ministries of agriculture, NVMA (Nigerian Veterinary Medical Association).

---

#### 5H-8. Palm Oil Producers / Traders — `palm_oil_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_palm_oil`  
**National count:** ~2,000 commercial producers; ~100,000 smallholders  
**Seed target:** ~5,000  
**Data source:** NIFOR (Nigerian Institute for Oil Palm Research), FOPCORN (Federation of Palm Produce Associations).

---

#### 5H-9. Cocoa / Export Commodities — `cocoa_exporter_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_cocoa_export`  
**National count:** ~1,500 licensed exporters  
**Data source:** CBCF (Cocoa Beans and Coffee Federation), NAFDAC export certification records.

---

#### 5H-10. Produce Aggregators — (organization, uses `organizations` + produce tables)
**Entity type:** Organization  
**Vertical:** `vtx_produce_aggregator`  
**National count:** ~2,000  

---

#### 5H-11. Vegetable Gardens / Horticulture — `vegetable_garden_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_vegetable_garden`  
**National count:** ~500,000 urban and peri-urban farmers  
**Seed target:** ~20,000  

---

#### 5H-12. Food Processing Factories — `food_processing_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_food_processing`  
**National count:** ~2,000 NAFDAC-licensed factories  
**Data source:** NAFDAC product and facility register.

---

### 5I. FINANCIAL

---

#### 5I-1. Mobile Money / POS Agents — `mobile_money_agent_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_mobile_money_agent`  
**National count:** ~1,500,000 active POS terminals (CBN 2023); ~800,000 unique agents  
**Seed target:** ~100,000 (named, geo-located agents per LGA)  
**Data source:** CBN agent banking quarterly reports, OPay/PalmPay/Moniepoint agent directories.

---

#### 5I-2. Airtime / VTU Resellers — `airtime_reseller_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_airtime_reseller`  
**National count:** ~500,000 informal resellers  
**Seed target:** ~50,000  

---

#### 5I-3. Bureau de Change — `bdc_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_bureau_de_change`  
**National count:** 82 CBN fully licensed BDC operators after the 2024/2025 re-licensing cycle; older 5,686 legacy count is no longer safe for seeded verification  
**Data source:** CBN licensed BDC directory / current re-licensing notices; refresh directly before production seed.

---

#### 5I-4. Savings / Thrift Groups (Ajo/Esusu) — (organization, uses `cooperative_members` tables)
**Entity type:** Organization  
**Vertical:** `vtx_savings_group`  
**National count:** ~1,000,000+ informal rotating savings groups  
**Seed target:** ~20,000 (formally registered)  

---

#### 5I-5. Insurance Agents / Brokers — (individual, no dedicated profile table currently)
**Entity type:** Individual  
**Vertical:** `vtx_insurance_agent`  
**National count:** ~50,000 NAICOM-licensed agents  
**Data source:** NAICOM (National Insurance Commission) agent register.

---

#### 5I-6. Hire Purchase / Asset Finance — (covered under 5D-46)

---

### 5J. CREATOR / MEDIA

---

#### 5J-1. Creators / Influencers — `creator_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_creator`  
**National count:** ~500,000 active (Instagram/TikTok/YouTube creators with Nigerian audience)  
**Seed target:** ~50,000 (identifiable with social handle + content type)  
**Data source:** Social blade Nigeria list, Instagram/TikTok Nigeria creator economy reports.

---

#### 5J-2. Photography / Videography Studios — `photography_studio_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_photography`  
**National count:** ~100,000 active photographers  
**Seed target:** ~20,000 (studio-based)  

---

#### 5J-3. Music Studios / Recording Artists — `music_studio_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_music_studio`  
**National count:** ~5,000 recording studios; ~200,000 artists  
**Seed target:** ~8,000 (studios + top-tier artists)  
**Data source:** COSON (Copyright Society of Nigeria) member register, PMAN (Performing Musicians Association of Nigeria).

---

#### 5J-4. Recording Labels — `recording_label_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_recording_label`  
**National count:** ~2,000 registered labels  
**Data source:** COSON, CAC business register.

---

#### 5J-5. Podcast Studios — `podcast_studio_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_podcast_studio`  
**National count:** ~500 studios + ~10,000 active podcasters  

---

#### 5J-6. Advertising Agencies — `advertising_agency_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_advertising_agency`  
**National count:** ~1,000 APCON-registered + ~5,000 digital agencies  
**Data source:** APCON (Advertising Practitioners Council of Nigeria) register.

---

#### 5J-7. Talent Agencies — `talent_agency_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_talent_agency`  
**National count:** ~500  

---

#### 5J-8. Sole Traders / Artisans — `sole_trader_profiles`
**Entity type:** Individual  
**Vertical:** `vtx_sole_trader`  
**National count:** ~40,000,000 (NBS informal economy)  
**Seed target:** ~200,000 (registered with LGA or trade association, named, geo-located)  
**Data source:** NBS MSME census, artisan guild records.

---

#### 5J-9. Community Radio / TV Stations — (organization)
**Entity type:** Organization  
**Vertical:** `vtx_community_radio`  
**National count:** ~173 licensed community radio stations (NBC)  
**Data source:** NBC (National Broadcasting Commission) license register.

---

#### 5J-10. Newspaper Distribution Agencies — `newspaper_dist_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_newspaper_dist`  
**National count:** ~500 distribution agencies  
**Data source:** NAN (News Agency of Nigeria), Audit Bureau of Circulations.

---

### 5K. INSTITUTIONAL

---

#### 5K-1. Government Agencies / Parastatals — `government_agency_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_govt_agency`  
**National count:** ~900 federal agencies + ~2,000 state agencies + ~5,000 LGA departments

| Level | Count |
|---|---|
| Federal MDAs (ministries, departments, agencies) | ~900 |
| State government agencies | ~37 × 50 avg = ~1,850 |
| LGA departments | ~774 × 8 avg = ~6,192 |
| **Total** | **~8,942** |

**Data source:** Federal Ministry of Finance MDAs list, OAGF (Office of the Accountant General of the Federation), state government websites.

---

### 5L. PLACE-TYPE VERTICALS (physical venues and facilities)

---

#### 5L-1. Warehouses — `warehouse_profiles`
**Entity type:** Place  
**Vertical:** `vtx_warehouse`  
**National count:** ~1,000 commercial warehouses  
**Data source:** Logistics Association of Nigeria, C&F agents directory.

---

#### 5L-2. Event Halls / Venues — `event_hall_profiles`
**Entity type:** Place  
**Vertical:** `vtx_event_hall`  
**National count:** ~5,000 named event halls  

---

#### 5L-3. Events Centres — `events_centre_profiles`
**Entity type:** Place  
**Vertical:** `vtx_events_centre`  
**National count:** ~500 large events centres  

---

#### 5L-4. Community Halls / Town Halls — `community_hall_profiles`
**Entity type:** Place  
**Vertical:** `vtx_community_hall`  
**National count:** ~8,809 (one per official INEC ward / registration area minimum)  

---

#### 5L-5. Tech Hubs / Innovation Centres — `tech_hub_profiles`
**Entity type:** Place  
**Vertical:** `vtx_hub`  
**National count:** ~120 (GIZ AfriLabs map, CcHUB, Co-Creation Hub networks)  
**Data source:** AfriLabs hub directory, NITDA innovation hub register.

---

#### 5L-6. Water Treatment / Borehole Operators — `water_treatment_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_water_treatment`  
**National count:** ~2,000 registered operators  

---

#### 5L-7. Water Vendors (Tanker / Sachet) — `water_vendor_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_water_vendor`  
**National count:** ~50,000 informal; ~5,000 NAFDAC-registered  
**Data source:** NAFDAC packaged water facility list.

---

#### 5L-8. Artisanal Mining Operators — `artisanal_mining_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_mining_operator`  
**National count:** ~5,000 licensed (Ministry of Mines)  
**Data source:** Ministry of Mines and Steel Development small-scale mining permit register.

---

#### 5L-9. Borehole Drillers — `borehole_driller_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_borehole_driller`  
**National count:** ~2,000 registered contractors  

---

#### 5L-10. Oil & Gas Service Providers — `oil_gas_services_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_oil_gas_service`  
**National count:** ~3,000 DPR-licensed service companies  
**Data source:** NCDMB (Nigerian Content Development and Monitoring Board) vendor list.

---

#### 5L-11. Clearing & Forwarding Agents — `clearing_agent_profiles`
**Entity type:** Organization  
**Vertical:** `vtx_clearing_agent`  
**National count:** ~3,000 licensed (NCS/SON registered)  
**Data source:** Nigeria Customs Service freight forwarding agent list.

---

---

## 6. Summary Table — All 160 Verticals with Nationwide Entity Count

| # | Vertical | Entity Type | Profile Table | Nat. Count | Seed Target | Priority |
|---|---|---|---|---|---|---|
| 1 | politician | individual | politician_profiles | 11,891 | 11,891 | P1 |
| 2 | political_party | organization | political_party_profiles | 21 HQ + 777 state + 4,644 top-party LGA chapters | 5,442 | P1 |
| 3 | motor_park | place | motor_park_profiles | 5,400 | 5,400 | P1 |
| 4 | transit | organization | transit_profiles | 200 | 200 | P1 |
| 5 | rideshare | individual | rideshare_profiles | 500,000 | 50,000 | P2 |
| 6 | haulage | organization | haulage_profiles | 203,000 | 5,000 | P2 |
| 7 | church | organization | church_profiles | 500,000+ | 50,000 | P1 |
| 8 | ngo | organization | ngo_profiles | 100,000 | 20,000 | P2 |
| 9 | cooperative | organization | cooperative_members | 200,000 | 30,000 | P2 |
| 10 | pos_business | organization | pos_products / organizations | 500,000 | 50,000 | P2 |
| 11 | market | place | market_stalls | 8,000 | 8,000 | P1 |
| 12 | professional | individual | professional_profiles | 630,000 | 100,000 | P2 |
| 13 | school | organization | school_profiles | 171,027 UBE schools | 171,027 | P1 |
| 14 | clinic | organization | clinic_profiles | 38,815 HFR hospitals/clinics | 38,815 | P1 |
| 15 | creator | individual | creator_profiles | 500,000 | 50,000 | P3 |
| 16 | sole_trader | individual | sole_trader_profiles | 40,000,000 | 200,000 | P2 |
| 17 | tech_hub | place | tech_hub_profiles | 120 | 120 | P1 |
| 18 | restaurant | organization | restaurant_chain_profiles | 500,000 | 50,000 | P2 |
| 19 | hotel | organization | hotel_profiles | 10,000 | 10,000 | P1 |
| 20 | supermarket | organization | organizations | 5,000 | 5,000 | P2 |
| 21 | pharmacy | organization | pharmacy_chain_profiles | 15,000 | 15,000 | P1 |
| 22 | beauty_salon | organization | beauty_salon_profiles | 1,000,000 | 50,000 | P2 |
| 23 | laundry | organization | laundry_profiles | 50,000 | 10,000 | P3 |
| 24 | auto_mechanic | organization | auto_mechanic_profiles | 500,000 | 15,000 | P2 |
| 25 | fuel_station | place | fuel_station_profiles | 22,681 | 22,681 | P1 |
| 26 | tailor | individual | tailor_profiles | 2,000,000 | 100,000 | P2 |
| 27 | event_hall | place | event_hall_profiles | 5,000 | 5,000 | P2 |
| 28 | event_planner | individual | event_planner_profiles | 100,000 | 20,000 | P3 |
| 29 | security_company | organization | security_company_profiles | 2,000 | 2,000 | P2 |
| 30 | construction | organization | construction_profiles | 55,000 | 8,000 | P2 |
| 31 | real_estate_agency | organization | real_estate_agency_profiles | 10,000 | 10,000 | P2 |
| 32 | property_developer | organization | property_developer_profiles | 2,000 | 2,000 | P3 |
| 33 | cleaning_service | organization | cleaning_service_profiles | 3,000 | 3,000 | P3 |
| 34 | print_shop | organization | print_shop_profiles | 100,000 | 15,000 | P2 |
| 35 | electronics_repair | organization | electronics_repair_profiles | 200,000 | 25,000 | P2 |
| 36 | food_vendor | individual | food_vendor_profiles | 5,000,000 | 100,000 | P1 |
| 37 | catering | organization | catering_profiles | 100,000 | 8,000 | P3 |
| 38 | bakery | organization | bakery_profiles | 200,000 | 15,000 | P2 |
| 39 | farm | organization | farm_profiles | 36,000,000 | 500,000 | P2 |
| 40 | agro_input | organization | agro_input_profiles | 50,000 | 10,000 | P2 |
| 41 | cold_room | place | cold_room_profiles | 1,000 | 1,000 | P3 |
| 42 | logistics_delivery | organization | logistics_delivery_profiles | 2,000 | 2,000 | P2 |
| 43 | dispatch_rider | organization | dispatch_rider_profiles | 1,000 | 2,000 | P2 |
| 44 | courier | organization | courier_profiles | 500 | 500 | P2 |
| 45 | warehouse | place | warehouse_profiles | 1,000 | 1,000 | P2 |
| 46 | clearing_agent | organization | clearing_agent_profiles | 3,000 | 3,000 | P3 |
| 47 | savings_group | organization | cooperative_members | 1,000,000 | 20,000 | P3 |
| 48 | insurance_agent | individual | professional_profiles | 50,000 | 10,000 | P3 |
| 49 | travel_agent | organization | travel_agent_profiles | 3,000 | 3,000 | P3 |
| 50 | photography | individual | photography_studio_profiles | 100,000 | 20,000 | P3 |
| 51 | music_studio | individual | music_studio_profiles | 205,000 | 8,000 | P3 |
| 52 | fashion_brand | organization | organizations | 10,000 | 5,000 | P3 |
| 53 | furniture_maker | organization | furniture_maker_profiles | 200,000 | 25,000 | P2 |
| 54 | welding_fab | individual | welding_shop_profiles | 300,000 | 30,000 | P2 |
| 55 | handyman | individual | handyman_profiles | 2,000,000 | 100,000 | P2 |
| 56 | generator_repair | individual | generator_repair_profiles | 100,000 | 20,000 | P2 |
| 57 | it_support | individual | it_support_profiles | 200,000 | 30,000 | P2 |
| 58 | bookshop | organization | bookshop_profiles | 5,000 | 5,000 | P3 |
| 59 | training_institute | organization | training_institute_profiles | 25,000 | 10,000 | P2 |
| 60 | driving_school | organization | driving_school_profiles | 1,500 | 1,500 | P2 |
| 61 | sports_academy | organization | sports_academy_profiles | 2,000 | 2,000 | P3 |
| 62 | gym | organization | gym_fitness_profiles | 5,000 | 5,000 | P3 |
| 63 | spa | organization | spa_profiles | 3,000 | 3,000 | P3 |
| 64 | optician | organization | optician_profiles | 3,000 | 3,000 | P2 |
| 65 | dental_clinic | organization | dental_clinic_profiles | 2,000 | 2,000 | P2 |
| 66 | vet_clinic | organization | vet_clinic_profiles | 2,000 | 2,000 | P3 |
| 67 | florist | organization | florist_profiles | 2,000 | 2,000 | P3 |
| 68 | wholesale_market | place | market_association_profiles | 100 | 100 | P1 |
| 69 | gas_distributor | organization | gas_distributor_profiles | 5,000 | 5,000 | P2 |
| 70 | water_treatment | organization | water_treatment_profiles | 2,000 | 2,000 | P3 |
| 71 | waste_management | organization | waste_mgmt_profiles | 537 | 537 | P2 |
| 72 | solar_installer | organization | solar_installer_profiles | 1,500 | 1,500 | P3 |
| 73 | advertising_agency | organization | advertising_agency_profiles | 6,000 | 2,000 | P3 |
| 74 | mosque | organization | mosque_profiles | 100,000+ | 20,000 | P1 |
| 75 | youth_org | organization | youth_org_profiles | 50,000 | 10,000 | P3 |
| 76 | womens_assoc | organization | womens_assoc_profiles | 30,000 | 10,000 | P3 |
| 77 | professional_assoc | organization | professional_assoc_profiles | 19,000 | 5,000 | P2 |
| 78 | campaign_office | organization | campaign_office_profiles | 5,000 | 1,000 | P3 |
| 79 | govt_agency | organization | government_agency_profiles | 8,942 | 8,942 | P2 |
| 80 | lga_office | place | government_agency_profiles | 774 | 774 | P1 |
| 81 | nurtw | organization | nurtw_profiles | 812 | 812 | P1 |
| 82 | okada_keke | organization | okada_keke_profiles | 5,000 | 5,000 | P1 |
| 83 | ferry | organization | ferry_operator_profiles | 100 | 100 | P2 |
| 84 | airport_shuttle | organization | airport_shuttle_profiles | 150 | 150 | P2 |
| 85 | container_depot | place | container_depot_profiles | 50 | 50 | P2 |
| 86 | airtime_reseller | individual | airtime_reseller_profiles | 500,000 | 50,000 | P2 |
| 87 | mobile_money_agent | individual | mobile_money_agent_profiles | 2,000,000+ active POS terminals / agent endpoints | 100,000 named agents | P1 |
| 88 | bureau_de_change | organization | bdc_profiles | 82 current fully licensed | 82 | P2 |
| 89 | used_car_dealer | organization | used_car_dealer_profiles | 10,000 | 10,000 | P2 |
| 90 | spare_parts | organization | spare_parts_profiles | 50,000 | 20,000 | P2 |
| 91 | tyre_shop | organization | tyre_shop_profiles | 200,000 | 30,000 | P2 |
| 92 | car_wash | organization | car_wash_profiles | 50,000 | 10,000 | P3 |
| 93 | building_materials | organization | building_materials_profiles | 100,000 | 15,000 | P2 |
| 94 | iron_steel | organization | iron_steel_profiles | 5,000 | 5,000 | P2 |
| 95 | electrical_fittings | organization | electrical_fittings_profiles | 20,000 | 10,000 | P2 |
| 96 | poultry_farm | organization | poultry_farm_profiles | 165,000 | 30,000 | P2 |
| 97 | cassava_miller | organization | cassava_miller_profiles | 5,000 | 5,000 | P2 |
| 98 | fish_market | place | fish_market_profiles | 500 | 500 | P2 |
| 99 | abattoir | place | abattoir_profiles | 500 | 500 | P2 |
| 100 | community_radio | organization | organizations | 173 | 173 | P3 |
| 101 | newspaper_dist | organization | newspaper_dist_profiles | 500 | 500 | P3 |
| 102 | tax_consultant | individual | tax_consultant_profiles | 15,000 | 15,000 | P2 |
| 103 | land_surveyor | individual | land_surveyor_profiles | 10,000 | 10,000 | P2 |
| 104 | private_school | organization | private_school_profiles | 91,252 private UBE schools | 91,252 | P1 |
| 105 | tutoring | individual | sole_trader_profiles | 1,000,000 | 50,000 | P3 |
| 106 | creche | organization | creche_profiles | 40,000 | 10,000 | P2 |
| 107 | wedding_planner | individual | wedding_planner_profiles | 20,000 | 20,000 | P3 |
| 108 | funeral_home | organization | funeral_home_profiles | 1,500 | 1,500 | P3 |
| 109 | community_hall | place | community_hall_profiles | 8,809 | 8,809 | P2 |
| 110 | produce_aggregator | organization | organizations | 2,000 | 2,000 | P3 |
| 111 | hire_purchase | organization | hire_purchase_profiles | 1,000 | 1,000 | P3 |
| 112 | govt_school | organization | govt_school_profiles | 79,775 public UBE schools | 79,775 | P1 |
| 113 | community_health | organization | community_health_profiles | 18,774 | 18,774 | P1 |
| 114 | sports_club | organization | sports_club_profiles | 20,000 | 5,000 | P3 |
| 115 | book_club | organization | book_club_profiles | 2,000 | 500 | P3 |
| 116 | talent_agency | organization | talent_agency_profiles | 500 | 500 | P3 |
| 117 | recording_label | organization | recording_label_profiles | 2,000 | 2,000 | P3 |
| 118 | podcast_studio | organization | podcast_studio_profiles | 10,500 | 1,000 | P3 |
| 119 | rehab_centre | organization | rehab_centre_profiles | 300 | 300 | P3 |
| 120 | orphanage | organization | orphanage_profiles | 1,200 | 1,200 | P3 |
| 121 | elderly_care | organization | elderly_care_profiles | 200 | 200 | P3 |
| 122 | motivational_speaker | individual | motivational_speaker_profiles | 5,000 | 5,000 | P3 |
| 123 | startup | organization | organizations | 5,000 | 2,000 | P3 |
| 124 | artisanal_mining | organization | artisanal_mining_profiles | 5,000 | 5,000 | P3 |
| 125 | oil_gas_service | organization | oil_gas_services_profiles | 3,000 | 3,000 | P3 |
| 126 | borehole_driller | organization | borehole_driller_profiles | 2,000 | 2,000 | P3 |
| 127 | paints_distributor | organization | paints_distributor_profiles | 10,000 | 5,000 | P3 |
| 128 | vegetable_garden | individual | vegetable_garden_profiles | 500,000 | 20,000 | P3 |
| 129 | shoemaker | individual | shoemaker_profiles | 300,000 | 30,000 | P3 |
| 130 | palm_oil | organization | palm_oil_profiles | 102,000 | 5,000 | P3 |
| 131 | cocoa_export | organization | cocoa_exporter_profiles | 1,500 | 1,500 | P3 |
| 132 | polling_unit_rep | individual | polling_unit_profiles | 176,846 | 176,846 | P1 |
| 133 | constituency_office | place | constituency_office_profiles | 1,462 | 1,462 | P1 |
| 134 | market_association | organization | market_association_profiles | 8,000 | 8,000 | P1 |
| 135 | cargo_truck | individual | cargo_truck_profiles | 200,000 | 20,000 | P2 |
| 136 | motorcycle_shop | organization | motorcycle_accessories_profiles | 20,000 | 10,000 | P3 |
| 137 | food_processing | organization | food_processing_profiles | 2,000 | 2,000 | P3 |
| 138 | pr_firm | organization | pr_firm_profiles | 5,500 | 1,000 | P3 |
| 139 | internet_cafe | organization | internet_cafe_profiles | 50,000 | 10,000 | P3 |
| 140 | plumbing_supplies | organization | plumbing_supplies_profiles | 10,000 | 5,000 | P3 |
| 141 | ministry_mission | organization | ministry_mission_profiles | 100,000 | 10,000 | P2 |
| 142 | laundry_service | organization | laundry_service_profiles | 50,000 | 10,000 | P3 |
| 143 | gym_fitness | organization | gym_fitness_profiles | 5,000 | 5,000 | P3 |
| 144 | hair_salon | individual | hair_salon_profiles | 800,000 | 30,000 | P2 |
| 145 | printing_press | organization | printing_press_profiles | 3,000 | 3,000 | P3 |
| 146 | cleaning_company | organization | cleaning_company_profiles | 3,000 | 3,000 | P3 |
| 147 | events_centre | place | events_centre_profiles | 500 | 500 | P2 |
| 148 | nursery_school | organization | nursery_school_profiles | 40,000 | 40,000 | P2 |
| 149 | petrol_station | place | petrol_station_profiles | 22,681 | 22,681 | P1 |
| 150 | generator_dealer | organization | generator_dealer_profiles | 5,000 | 5,000 | P2 |
| 151 | water_vendor | organization | water_vendor_profiles | 55,000 | 5,000 | P2 |
| 152 | tailoring_fashion | individual | tailor_profiles | 2,000,000 | 100,000 | P2 |
| 153 | phone_repair | individual | phone_repair_profiles | 500,000 | 50,000 | P2 |
| 154 | pharmacy_chain | organization | pharmacy_chain_profiles | 15,000 | 15,000 | P1 |
| 155 | restaurant_chain | organization | restaurant_chain_profiles | 500,000 | 50,000 | P2 |
| 156 | law_firm | organization | law_firm_profiles | 15,000 | 15,000 | P2 |
| 157 | accounting_firm | organization | accounting_firm_profiles | 8,000 | 8,000 | P2 |
| 158 | ward_rep | individual | ward_rep_profiles | 8,809 | 8,809 | P1 |
| 159 | nurtw (variant) | organization | nurtw_profiles | 812 | 812 | P1 |
| 160 | polling_unit | place | polling_unit_profiles | 176,846 | 176,846 | P1 |

---

## 7. Seeding Tiers — Ordered Execution Plan

### TIER 0 — Geography Foundation
**Target: 9,627 official records / 9,628 local pending reconciliation | Tables: places**

| Step | File | Records |
|---|---|---|
| 0.1 | `infra/db/seed/nigeria_country.sql` | 1 |
| 0.2 | `infra/db/seed/nigeria_zones.sql` | 6 |
| 0.3 | `infra/db/seed/nigeria_states.sql` | 37 |
| 0.4 | `infra/db/seed/0002_lgas.sql` | 774 |
| 0.5 | `infra/db/seed/0003_wards.sql` | 8,809 |

**Blocking dependency:** Nothing in Layers 1–5 can be seeded until Tier 0 is complete. Every `primary_place_id` FK on `profiles` references a place from this tier.

---

### TIER 1 — Vertical Registry
**Target: 159 records | Table: verticals**

| Step | Action |
|---|---|
| 1.1 | Convert `infra/db/seeds/0004_verticals-master.csv` → SQL INSERTs |
| 1.2 | Apply to staging and production |

---

### TIER 2 — P1 High-Density Discovery (1.2M records)
**Unblocked after Tiers 0–1. Delivers the most discoverable entities per LGA.**

| Vertical | Seed Target | Root Table | Profile Table |
|---|---|---|---|
| government schools | 79,775 | organizations | govt_school_profiles |
| private schools | 91,252 | organizations | private_school_profiles |
| clinics / hospitals | 38,815 | organizations | clinic_profiles |
| pharmacies | 15,000 | organizations | pharmacy_chain_profiles |
| fuel stations | 22,681 | places | fuel_station_profiles |
| petrol stations | 22,681 | places | petrol_station_profiles |
| motor parks | 5,400 | places | motor_park_profiles |
| markets | 8,000 | places | market_association_profiles |
| market associations | 8,000 | organizations | market_association_profiles |
| wholesale markets | 100 | places | market_association_profiles |
| hotels | 10,000 | organizations | hotel_profiles |
| churches | 50,000 | organizations | church_profiles |
| mosques | 20,000 | organizations | mosque_profiles |
| food vendors | 100,000 | individuals | food_vendor_profiles |
| mobile money agents | 100,000 | individuals | mobile_money_agent_profiles |
| polling units | 176,846 | places | polling_unit_profiles |
| politicians | 11,891 | individuals | politician_profiles |
| ward reps | 8,809 | individuals | ward_rep_profiles |
| constituency offices | 1,462 | places | constituency_office_profiles |
| LGA offices | 774 | places | government_agency_profiles |
| NURTW chapters | 812 | organizations | nurtw_profiles |
| okada/keke co-ops | 5,000 | organizations | okada_keke_profiles |
| community health networks | 18,774 | organizations | community_health_profiles |
| tech hubs | 120 | places | tech_hub_profiles |

**Tier 2 total: ~819,000 gross seed rows before fuel/petrol de-duplication; ~796,500 if fuel_station and petrol_station are treated as the same NMDPRA retail-outlet universe.**

---

### TIER 3 — P2 Economic Backbone (2.5M records)
**Fills economic density — one of every major commerce, professional, and services vertical in every LGA.**

Covers: all P2-marked verticals in the summary table — auto mechanics, pharmacies, law firms, accounting firms, construction, real estate, all agricultural, all transport sub-verticals, spare parts, building materials, nursery schools, etc.

**Tier 3 total: ~2,500,000 seed rows** (approximate — varies by source data quality)

---

### TIER 4 — P3 Long-Tail Completeness
**Fills remaining verticals — creator economy, specialist services, niche civic bodies.**

Covers: all P3-marked verticals — recording labels, podcast studios, book clubs, orphanages, elderly care, etc.

**Tier 4 total: ~500,000 seed rows**

---

## 8. Data Sources by Category

| Source | What it covers | Access |
|---|---|---|
| INEC (inec.gov.ng) | Polling units (176,846), 2023 contestants (15,331), current parties (21), 2023 parties (18), wards/RAs (8,809) | Public portal + bulk download |
| UBEC 2022 NPA / school directory | UBE schools: 171,027 total; 79,775 public; 91,252 private | UBEC public downloads |
| NUC list | Universities / tertiary institutions; use current NUC list separately from UBEC basic-school counts | nuc.edu.ng public list |
| NBTE list | Polytechnics, vocational schools | nbte.edu.ng |
| MDCN register | Doctors, hospitals, clinics | mdcn.gov.ng |
| PCN register | Pharmacies, pharmacists | pcn.gov.ng |
| NBA directory | Lawyers, law firms | nigerianbar.org.ng |
| ICAN register | Accountants, accounting firms | ican.org.ng |
| NMDPRA / DPR | Retail petroleum outlets (~22,681), gas distributors, oil & gas service companies | nmdpra.gov.ng / licensing portals |
| CBN / SANEF data | Current licensed BDCs (82 after relicensing), POS/mobile-money agents and terminals (2,000,000+ active terminals) | cbn.gov.ng |
| CAC register | Registered businesses, NGOs, associations | search.cac.gov.ng |
| NURTW secretariat | Motor parks, transport unions | Direct outreach |
| NBS MSME census | Sole traders, food vendors, artisans | nigerianstat.gov.ng |
| OSM Overpass API | Motor parks, markets, fuel stations, schools, clinics (geo-coordinates) | overpass-api.de |
| Google Maps Nigeria | Hotels, restaurants, salons, clinics, fuel stations (named + coordinates) | Places API |
| FRSC CMRIS | Vehicles, driving schools, fleet operators | frscnigeria.org |
| NIRSAL / FMARD | Registered farms, agro-input dealers, cooperatives | nirsal.com, fmard.gov.ng |
| Nigeria HFR / NPHCDA | HFR hospitals/clinics (~38,815); PHC/community-health networks to be reconciled separately | hfr.health.gov.ng, nphcda.gov.ng |
| FISON | Fish markets, fisheries | fison.org.ng |
| NAFDAC | Food factories, pharmacies, water producers, abattoirs | nafdac.gov.ng |
| AfriLabs | Tech hubs (120) | afrihubs.com directory |
| NSCDC | Licensed security companies (2,000) | nscdc.gov.ng |
| NIPOST | Courier operators | nipost.gov.ng |
| NBC | Community radio stations (173) | nbc.gov.ng |
| ALGON | LGA offices (774) | algon.gov.ng |

---

## 9. Minimum Viable Seed — What Every LGA Must Have

For discovery to be meaningful, every one of the **774 LGAs** must have at minimum:

| Category | Min per LGA | Total min rows |
|---|---|---|
| Motor park | 2 | 1,548 |
| Market | 3 | 2,322 |
| Fuel station | 5 | 3,870 |
| School (govt) | 10 | 7,740 |
| Clinic / PHC | 5 | 3,870 |
| Church | 10 | 7,740 |
| Mosque | 5 | 3,870 |
| Food vendor | 20 | 15,480 |
| POS / mobile money agent | 10 | 7,740 |
| Politician (LGA chairman + councillors) | 12 | 9,288 |
| NURTW chapter | 1 | 774 |
| Hotel / guesthouse | 2 | 1,548 |
| Pharmacy | 3 | 2,322 |
| Auto mechanic | 5 | 3,870 |
| **Minimum LGA floor total** | **93 entities** | **~72,000 rows** |

This 72,000-row floor guarantees that no LGA returns an empty discovery page for any of the 14 most-searched categories.

---

## 10. What Does Not Exist Yet

| Gap | Impact | Action needed |
|---|---|---|
| Ward reconciliation | Completed: `infra/db/seed/0003_wards.sql` now has 8,809 INEC-aligned wards/RAs and all 774 LGAs represented | Keep S01 source manifest and completion report with seed runbook |
| Geography seed naming drift in README/report (`nigeria_lgas.sql`, `nigeria_wards.sql`) vs actual files (`0002_lgas.sql`, `0003_wards.sql`) | Operators may run wrong files or think seeds are missing | Update runbook references to actual filenames |
| `verticals` table seed | Completed: migration `0302_vertical_registry_seed.sql` now loads 159 vertical definitions plus synonym and seedability metadata | Apply S02 migration before vertical profile seeding |
| All `*_profiles` tables — 0 rows in both staging and production | Discovery pages return nothing | Execute Tiers 2–4 above |
| `search_index` / `search_fts` — empty | Full-text search returns nothing | Rebuild after profile seeding |
| `jurisdictions` table — 0 rows | Political assignment FK cannot resolve | Seed 1 jurisdiction per ward, LGA, state, federal constituency, senatorial district |
| Ward-level `places` — not confirmed applied to live DB | Polling unit and ward rep profiles cannot resolve `primary_place_id` until loaded | Apply reconciled `0003_wards.sql` and verify count equals accepted canonical value |

---

*Document generated 2026-04-21 and deep-reviewed the same day. Corrected counts reference INEC, Nigeria HFR/FMoH, UBEC, CBN/SANEF, NMDPRA, CAC, NUC, and sector registries where public data is available. Official counts should be refreshed immediately before production seed execution; market-estimate counts are discovery-density planning assumptions, not verified registry totals.*
