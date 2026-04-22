# Phase S05 Source Manifest — Political and Electoral Foundation, Batches 1–4

## Source Inventory

| Source | Owner | Type | Confidence | URL / Path | Hash | Rows used | Notes |
|---|---|---|---|---|---|---:|---|
| INEC Current Registered Political Parties | Independent National Electoral Commission | Official government register | official_verified | https://inecnigeria.org/political-parties/ plus paginated pages and per-party detail pages | `6598d0e33ec836b015aefbc86980bf66c40bd5ec4c7ce9ba8349d191d6cedb21` | 21 | Official INEC party register showed 21 results. Extract stored in `infra/db/seed/sources/s05_inec_political_parties_20260421.json` with per-party source hashes. |
| INEC S05 Electoral Source Locator | Independent National Electoral Commission | Official government source locator | official_verified | `infra/db/seed/sources/s05_official_electoral_source_locator_20260421.json` | `8c52448c9da4cf0b151f8db0e4c7b58a0b3c560ed4a3db4f9e5b8fe05f0899bd` | 4 source references | Captures official candidate-list page, 2023 timetable PDF, polling-units page, and CVR polling-unit locator for later S05 batches. |
| S05 political foundation migration | WebWaka OS | Internal database migration | official_verified | `infra/db/migrations/0305_political_foundation_seed.sql`; `apps/api/migrations/0305_political_foundation_seed.sql` | `7bf71c20fb7984858eee679d01686931bf3852cb66e4839be79130445635cafa` | 21 party records plus support rows | Idempotent migration for current-party profiles, election-cycle locator records, term scaffolds, S04 sidecars, source links, and search rebuild. |
| INEC CVR Polling Unit Locator Public API | Independent National Electoral Commission | Official government API | official_verified | https://cvr.inecnigeria.org/pu plus public API endpoints for state/LGA/ward/polling-unit traversal | `aab26097e24a5a6b4ff8c26109979937fb381be3c11b8809390bea6c1454271c` | 176,846 | Official CVR API extraction covering 37 states/FCT, 774 LGAs, 8,810 registration-area rows, 176,846 polling units, and 9,621 response hashes. |
| S05 polling-unit reconciliation report | WebWaka OS | Generated reconciliation artifact | official_verified | `infra/db/seed/sources/s05_inec_polling_units_reconciliation_20260421.json` | `fca9da12a60145144f59ca2d67792686c9c34cdfea522c25a6da0d8f7ae0360f` | 176,846 | Documents 774/774 LGA resolution, 8,603 direct ward matches, 207 registration-area fallback rows, 4,313 fallback polling units, and 0 duplicate official composite polling-unit codes. |
| S05 polling-unit migration | WebWaka OS | Internal database migration | official_verified | `infra/db/migrations/0306_political_polling_units_seed.sql`; `apps/api/migrations/0306_political_polling_units_seed.sql` | `ade9138fc0df3104696e643aeb70b666987ebe02807e0d9c5e9cf119bf86d4a1` | 176,846 | Idempotent polling-unit migration for polling-unit places, discovery profiles, vertical profiles, S04 sidecars, provenance links, and search rows. |

## Official Party Extraction Method

- Fetched the official INEC political party listing page and pagination pages:
  - `https://inecnigeria.org/political-parties/`
  - `https://inecnigeria.org/political-parties/page/2/`
  - `https://inecnigeria.org/political-parties/page/3/`
- Confirmed the listing reports 21 current results.
- Fetched each party detail page and stored its SHA-256 hash as `source_record_hash`.
- Normalized each party to acronym, canonical party name, official INEC URL, national chairperson text where available, national secretary text where available, and address text where available.
- Seeded parties at country-level `primary_place_id = place_nigeria_001` because INEC-registered parties are national entities.

## Official S05 Sources Located for Later Batches

| Dataset | Source located | Extraction status |
|---|---|---|
| 2023 national election candidates | INEC candidate-list page and national-election PDF link | Source located; row extraction pending. |
| 2023 governorship/state assembly candidates | INEC candidate-list page and state-election PDF link | Source located; row extraction pending. |
| Polling units | INEC polling-units page and CVR polling-unit locator | Extracted, reconciled, and seeded: 176,846 / 176,846. |
| 2023 election timetable | INEC timetable PDF | Source located; term/election-cycle scaffolds seeded; office-specific/off-cycle reconciliation pending. |

## Output Files

- `infra/db/migrations/0305_political_foundation_seed.sql`
- `apps/api/migrations/0305_political_foundation_seed.sql`
- `infra/db/seed/0006_political_parties.sql`
- `infra/db/seed/sources/s05_inec_political_parties_20260421.json`
- `infra/db/seed/sources/s05_official_electoral_source_locator_20260421.json`
- `infra/db/seed/sources/s05_inec_polling_units_cvr_20260421.json`
- `infra/db/seed/sources/s05_inec_polling_units_reconciliation_20260421.json`
- `infra/db/migrations/0306_political_polling_units_seed.sql`
- `apps/api/migrations/0306_political_polling_units_seed.sql`
- `infra/db/seed/0007_polling_units.sql`
- `docs/reports/phase-s05-political-foundation-progress-report-2026-04-21.md`
- `docs/reports/phase-s05-political-foundation-polling-units-report-2026-04-21.md`

## S05 Batch 3 — National Assembly Senators and Representatives (2026-04-21)

| Source | Owner | Type | Confidence | Artifact path | SHA-256 | Records | Notes |
|---|---|---|---|---|---|---|---|
| NASS legislators API (chamber 1) | National Assembly of Nigeria | Official government API | official_verified | `infra/db/seed/sources/s05_nass_legislators_raw_20260421.json` | `b9c9ab4028de1c2ec1abd523598c7ad668cc49656c44476395e388e99972b379` | 74 senators (of 109 constitutional) | `https://nass.gov.ng/mps/get_legislators/?chamber=1`. NASS API itself omits 35 senators; documented gap, not fabricated. |
| NASS legislators API (chamber 2) | National Assembly of Nigeria | Official government API | official_verified | `infra/db/seed/sources/s05_nass_legislators_raw_20260421.json` | (same file) | 245 reps (of 360 constitutional) | `https://nass.gov.ng/mps/get_legislators/?chamber=2`. NASS API itself omits 115 reps; documented gap, not fabricated. |
| NASS legislators normalized | WebWaka OS | Generated normalization | official_verified | `infra/db/seed/sources/s05_nass_legislators_normalized_20260421.json` | `6e8121539d7d9cb70b82685f6d1837198a240073ab6eb53d69c34d801eb31ba6` | 319 normalized rows | Includes resolved place_id, party_id, dedupe canonical key, and place-decision provenance. |
| NASS legislators reconciliation report | WebWaka OS | Generated reconciliation artifact | official_verified | `infra/db/seed/sources/s05_nass_legislators_report_20260421.json` | `5454f28ee8a26d87367fc84ca46fa642021e586a37c32a56f204d9fe20413321` | Counts of place-decisions, party-counts, and 1 deferred row | Documents 229 exact, 82 fuzzy, 7 fuzzy-unique, 1 deferred place resolutions; party APC=172/PDP=107/LP=19/NNPP=9/APGA=4/SDP=3/YPP=2/ADP=1/blank=1. |
| S05 NASS legislators migration | WebWaka OS | Internal database migration | official_verified | `infra/db/migrations/0311_political_senators_reps_seed.sql`; `apps/api/migrations/0311_political_senators_reps_seed.sql`; `infra/db/seed/0012_political_senators_reps.sql` | `1203826126f6ed1f546ef8769bde53052d3bca328c827820bbba88a70e85738c` | 318 legislators | Idempotent migration for individuals, profiles, politician_profiles, political_assignments (term `term_ng_10th_national_assembly_2023_2027`), party_affiliations, S04 sidecars, search rows, and FTS rebuild. |

## S05 Batch 4 — State Governors and Deputy Governors (2026-04-21)

| Source | Owner | Type | Confidence | Artifact path | SHA-256 | Records | Notes |
|---|---|---|---|---|---|---|---|
| Nigeria Governors' Forum public governors page | Nigeria Governors' Forum | Official body public listing | official_verified | `infra/db/seed/sources/s05_batch4_research/nggovernorsforum.org_index.php_the-ngf_governors.html` | `381ad537d74c0c46d35af55ad3ca39f88364cc5e9a87ce6165389b0367bb8c0c` | 36 governor names | `https://nggovernorsforum.org/index.php/the-ngf/governors`. NGF is the constitutional body of all 36 state governors. Used as the cross-validation authority for governor names. |
| Wikipedia: List of current state governors in Nigeria | Wikipedia (English) | Editorial aggregator (CC BY-SA) | editorial_verified | `infra/db/seed/sources/s05_batch4_research/wp_current_state_governors.json` | `8e90a9f8a0c33b57953ca24792261b2d926bfb3b32fdc34113fe28956991ed81` | 36 state rows | `https://en.wikipedia.org/wiki/List_of_current_state_governors_in_Nigeria` (parse-API JSON). Sole consolidated, machine-parseable source for deputy-governor name, party, took-office year, and term-end year across all 36 states. |
| State governors raw artifact | WebWaka OS | Generated raw bundle | editorial_verified | `infra/db/seed/sources/s05_state_governors_raw_20260421.json` | `0d8a19e8cae8e3d1b806a7efe533fd553911f8af21737ab561c821644d2c7ed5` | 36 + 36 | Bundles the Wikipedia parse-API JSON and the NGF (state, name) pairs. |
| State governors normalized artifact | WebWaka OS | Generated normalization | editorial_verified | `infra/db/seed/sources/s05_state_governors_normalized_20260421.json` | `27ec5e2c8c1b59e19e887781425e182b591accf8bba30396b9110b203e8db84a` | 72 individuals | Includes resolved place_id, party_id, off-cycle term ID, dedupe canonical key, and per-state cross-validation outcome. |
| State governors reconciliation report | WebWaka OS | Generated reconciliation artifact | editorial_verified | `infra/db/seed/sources/s05_state_governors_report_20260421.json` | `95bd267acfa5472feb9e35360c8650ad2d30039c1ede76ca6fba9faf242880ca` | 36 states | Documents 23 exact + 13 overlap + 0 diverging cross-validations; 8 off-cycle terms; party APC=62 / PDP=4 / LP=2 / APGA=2 / Accord=2 (per individual). |
| S05 governors migration | WebWaka OS | Internal database migration | editorial_verified | `infra/db/migrations/0312_political_governors_seed.sql`; `apps/api/migrations/0312_political_governors_seed.sql`; `infra/db/seed/0013_political_governors.sql` | `d807865d2298b1459a20bcbb4ee8f9102adeedb382ff6526f351d713ecffcca9` | 72 individuals (36 governors + 36 deputies) | Idempotent migration for individuals, profiles, politician_profiles, political_assignments (8 off-cycle terms + reuse of `term_ng_state_executive_general_2023_2027` for 28 on-cycle states), party_affiliations, S04 sidecars (NGF + Wikipedia), search rows, and FTS rebuild. |

## S05 Batch 5 — Lagos State House of Assembly Members (2026-04-22)

| Source | Owner | Type | Confidence | Artifact path | SHA-256 | Records | Notes |
|---|---|---|---|---|---|---|---|
| Wikipedia: List of members of the Lagos State House of Assembly (2023–2027) | Wikipedia (English) | Editorial aggregator (CC BY-SA) | editorial_verified | `infra/db/seed/sources/s05_lagos_assembly_normalized_20260422.json` | `88c424ed10fdaf698154bfd5e60ff6afeb06eab06bc5fcaa2b83e062ad4956b0` | 40 members | `https://en.wikipedia.org/wiki/List_of_members_of_the_Lagos_State_House_of_Assembly_(2023%E2%80%932027)`. Page cites the official Lagos State House of Assembly website and Nigerian Tribune as primary sources. Only Wikipedia consolidated HoA member list found for any of the 36 states. |
| Lagos State House of Assembly official website | Lagos State House of Assembly | Government body official website | official_verified | (cross-validation only; page accessed 2026-04-22) | n/a | 40 | `https://www.lagoshouseofassembly.gov.ng/meet-our-members/`. Cross-validates Wikipedia list: all 40 names and constituencies confirmed. |
| S05 Lagos Assembly migration | WebWaka OS | Internal database migration | editorial_verified | `infra/db/migrations/0313_political_lagos_assembly_seed.sql`; `apps/api/migrations/0313_political_lagos_assembly_seed.sql`; `infra/db/seed/0014_political_lagos_assembly.sql` | `1737576853a246059eeddb63615c4e3642cf8062a05a90a6c4c810302eadaff3` | 40 members | Idempotent migration. Term `term_ng_lagos_state_assembly_10th_2023_2027`. Party APC=38/LP=2. All 40 constituencies resolved to S03 place IDs `sc_632_la`–`sc_671_la`. Validation: 17/17 stub-SQLite checks pass. |

## S05 Batch 6 — INEC 2023 State HoA Candidates — All 36 States (2026-04-22)

| Source | Owner | Type | Confidence | Artifact path | SHA-256 | Records | Notes |
|---|---|---|---|---|---|---|---|
| INEC Final List of Candidates for State Elections (Governorship & HoA) | Independent National Electoral Commission | Official government register | official_verified | `infra/db/seed/sources/s05_inec_2023_candidates_final_list.pdf` | `2450eb0df41d1b923ca296f4aa78c2adbaccf41e87f0f88277313504beccd8ca` | 8,971 HoA candidates + governorship (separate extraction) | `https://inecnigeria.org/wp-content/uploads/2022/10/Final-List-of-Candidates-for-National-Elections_SHA-14.pdf`. 894 pages; text-extractable (not scanned). HoA section: pages 98–893 (0-indexed). All 36 states; 18 parties; 0 missing states. Extraction accuracy: 98.5%. |
| S05 HoA candidates extracted JSON | WebWaka OS | Generated extraction artifact | official_verified | `infra/db/seed/sources/s05_inec_2023_hoa_candidates_extracted.json` | `7d355c400be369d07548691778f6c5295b00e1c7b1b2c8ca5706f9790d0fca27` | 8,971 | pdfminer LTTextBox coordinate-based column reconstruction (v5). Party coverage: APC=876, PDP=874, NNPP=866, ADC=800, SDP=771, ADP=751, LP=696, AA=595, NRM=446, PRP=413, APGA=316, YPP=281, APM=274, APP=259, ZLP=259, A=222, BP=137, AAC=135. |
| S05 HoA candidates extraction report | WebWaka OS | Generated report artifact | official_verified | `infra/db/seed/sources/s05_inec_2023_hoa_candidates_report.json` | (on disk) | Summary stats | Documents state counts, party counts, error breakdown, accuracy %. |
| S05 HoA candidates extractor script | WebWaka OS | Tool | n/a | `infra/db/seed/scripts/extract_s05_inec_hoa_candidates.py` | n/a | Tool | pdfminer v5 extractor with full column-boundary logic, AKWA IBOM/CROSS RIVER two-word state handling, APGA/NNPP/NRM merged party+position detection, PRP party code, header stripping. Re-runnable from PDF. |

**SQL migration for batch 6 (0314_political_inec_hoa_candidates.sql): NOT YET GENERATED.** Generation requires schema review for candidate vs. officeholder records and bulk INSERT optimisation. Extraction JSON is ready and repeatable.


## S05 Batch 6 SQL — INEC 2023 HoA Candidates Migration (2026-04-22 — COMPLETE)

| File | SHA-256 | Records seeded | Notes |
|---|---|---|---|
| `infra/db/migrations/0314_political_inec_hoa_candidates_seed.sql` | `0b57bb9c4f3f13b69e21d1dcd892785ed3b48b386183a7e7c95871b16ce5cea7` | 4,499 individuals / 4,414 candidate_records | Part 1 of 2; includes seed_run + seed_source + artifact rows |
| `apps/api/migrations/0314_political_inec_hoa_candidates_seed.sql` | `0b57bb9c4f3f13b69e21d1dcd892785ed3b48b386183a7e7c95871b16ce5cea7` | byte-identical to infra copy | Cloudflare D1 target |
| `infra/db/seed/0015_political_inec_hoa_candidates.sql` | `0b57bb9c4f3f13b69e21d1dcd892785ed3b48b386183a7e7c95871b16ce5cea7` | byte-identical | Standalone seed |
| `infra/db/migrations/0314b_political_inec_hoa_candidates_seed.sql` | `cd5afe68731135cf5002d4326a2943c566ede2405099af66ae504ae261dfc074` | 4,326 individuals / 4,075 candidate_records | Part 2 of 2 |
| `apps/api/migrations/0314b_political_inec_hoa_candidates_seed.sql` | `cd5afe68731135cf5002d4326a2943c566ede2405099af66ae504ae261dfc074` | byte-identical to infra copy | Cloudflare D1 target |

**Combined totals across 0314 + 0314b:**
- individuals: 8,825
- profiles: 8,825
- politician_profiles: 8,825
- party_affiliations: 8,825
- candidate_records: 8,489 (337 candidates without resolved jurisdiction — individual still seeded)
- seed_ingestion_records: 8,825
- seed_identity_map: 8,825
- seed_entity_sources: 8,825

**Validation:** Both files pass stub-SQLite validation (20/20 table checks pass, idempotent double-apply stable).

**145 garbled extraction rows skipped** (they contained PDF S/N digits merged into constituency column — not fabricated, not inserted).

**Generator script:** `infra/db/seed/scripts/generate_s05_hoa_candidates_sql.py` (483 lines, fully re-runnable from source JSON).

