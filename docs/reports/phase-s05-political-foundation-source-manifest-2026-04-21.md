# Phase S05 Source Manifest — Political and Electoral Foundation, Batches 1–2

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
