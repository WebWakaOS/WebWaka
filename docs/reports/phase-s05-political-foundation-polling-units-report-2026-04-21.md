# Phase S05 Batch 2 Report — INEC Polling Units

## Objective

Complete the polling-unit batch in Phase S05 using official INEC source data only, reconcile every row to the most specific canonical S01 place available, seed polling-unit facility places and profiles, and document every ward/registration-area fallback.

## Result

Batch 2 seeds all 176,846 official INEC CVR polling units. No polling unit was dropped. Every row has a unique deterministic source record ID, unique official composite polling-unit code, source hash, canonical state/LGA resolution, polling-unit place/profile IDs, S04 ingestion sidecars, place-resolution rows, provenance links, and search-entry output.

Full S05 remains in progress. Officeholders, politician profiles, assignments, affiliations, 2023 candidates, ward reps, constituency offices, campaign offices, and the final political coverage report remain pending.

## Source and Extraction

| Source | Owner | Rows | Hash | Local artifact |
|---|---|---:|---|---|
| INEC CVR Polling Unit Locator Public API | Independent National Electoral Commission | 176,846 polling units | `aab26097e24a5a6b4ff8c26109979937fb381be3c11b8809390bea6c1454271c` | `infra/db/seed/sources/s05_inec_polling_units_cvr_20260421.json` |
| Polling-unit reconciliation report | WebWaka OS generated from INEC source + canonical S01 places | 176,846 polling units | `fca9da12a60145144f59ca2d67792686c9c34cdfea522c25a6da0d8f7ae0360f` | `infra/db/seed/sources/s05_inec_polling_units_reconciliation_20260421.json` |

Extraction covered 37 states/FCT, 774 LGAs, 8,810 INEC registration-area rows, 176,846 polling units, and 9,621 per-response SHA-256 hashes.

## Implemented Changes

| File | Change |
|---|---|
| `infra/db/migrations/0306_political_polling_units_seed.sql` | Adds `polling_units`, `polling_unit_profiles`, 176,846 source-backed polling-unit staging rows, derived `places`, `profiles`, search rows, S04 sidecars, provenance links, and search rebuild metadata. |
| `apps/api/migrations/0306_political_polling_units_seed.sql` | Mirrors the polling-unit migration for API migration parity. |
| `infra/db/seed/0007_polling_units.sql` | Standalone polling-unit seed equivalent to the migration. |
| `infra/db/seed/scripts/generate_s05_polling_units_sql.py` | Reproducible generator with canonical geography reconciliation aliases and deterministic ID generation. |
| `infra/db/seed/scripts/generate_s05_polling_units_sql_stream.py` | Streaming generator used to avoid holding the 168 MB SQL migration in memory. |
| `infra/db/seed/sources/s05_inec_polling_units_reconciliation_20260421.json` | Row-count, duplicate, LGA, ward, and fallback reconciliation report. |

## Seeded Counts

| Category | Count |
|---|---:|
| `polling_units` rows | 176,846 |
| Polling-unit `places` | 176,846 |
| Polling-unit discovery `profiles` | 176,846 |
| `polling_unit_profiles` rows | 176,846 |
| Polling-unit search entries | 176,846 |
| Polling-unit ingestion sidecars | 176,846 |
| Polling-unit identity-map rows | 176,846 |
| Polling-unit place-resolution rows | 176,846 |
| Polling-unit provenance links | 176,846 |

## Reconciliation Summary

| Check | Result |
|---|---:|
| Source polling-unit rows | 176,846 |
| Unique source record IDs | 176,846 |
| Unique official composite polling-unit codes | 176,846 |
| Duplicate official composite polling-unit codes | 0 |
| Canonical LGA resolutions | 774 / 774 |
| INEC registration-area rows | 8,810 |
| Registration areas matched directly to canonical S01 ward | 8,603 |
| Registration areas resolved by documented LGA fallback | 207 |
| Polling units under documented LGA fallback | 4,313 |
| Polling units resolved at state-only level | 0 |

The remaining 207 registration-area fallback rows are not omitted or guessed. Each is seeded at the canonical LGA level and documented in `s05_inec_polling_units_reconciliation_20260421.json` with the original INEC state/LGA/ward label, INEC API ID, polling-unit count, fallback place ID, and fallback level.

## Validation

SQLite validation was performed in controlled chunks because the generated migration is intentionally large: 168,058,862 bytes and 176,846 source rows. Validation applied the required S00–S05 dependency migrations, streamed all generated polling-unit `INSERT` chunks from `0306_political_polling_units_seed.sql`, and verified the core derived rows.

| Check | Expected | Result |
|---|---:|---:|
| `polling_units` | 176,846 | 176,846 |
| Polling-unit `places` | 176,846 | 176,846 |
| Polling-unit discovery `profiles` | 176,846 | 176,846 |
| `polling_unit_profiles` | 176,846 | 176,846 |
| Search entries | 176,846 | 176,846 |
| Ingestion sidecars | 176,846 | 176,846 |
| Identity-map rows | 176,846 | 176,846 |
| Place-resolution rows | 176,846 | 176,846 |
| Duplicate official polling-unit codes | 0 | 0 |
| Polling units with state-only resolution | 0 | 0 |

The final provenance/search statements were also syntax-validated during controlled execution; the temporary validation database was not retained.

## Acceptance Status for Full S05

| S05 acceptance check | Current status |
|---|---|
| 21 current parties are seeded with source links | Complete in batch 1. |
| 176,846 polling units are seeded or every missing unit is explained | Complete in batch 2; all 176,846 are seeded, with 207 ward-name fallback rows documented. |
| Every politician profile has a jurisdiction | Pending; politician profiles are not yet seeded. |
| Every political assignment has a term | Pending; term scaffolds exist, but assignments are not yet seeded. |
| No duplicate politician exists for the same person/office/jurisdiction/term | Pending; duplicate rules will be applied during officeholder extraction. |
| Every political profile is searchable by name, office, LGA/state, and party where applicable | Partially complete; parties and polling units are searchable. Politician and officeholder profiles remain pending. |

## Next S05 Batch

Proceed to current officeholder extraction in dependency order: senators, House of Representatives members, governors/deputies, and then LGA chairmen/deputies. Seed only named, source-backed people and assignments; do not infer ward reps or local officials from jurisdiction existence.