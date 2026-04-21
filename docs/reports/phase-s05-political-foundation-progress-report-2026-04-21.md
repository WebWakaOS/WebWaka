# Phase S05 Progress Report — Political Party and Election-Cycle Foundation

## Objective

Begin Phase S05 in the implementation order stated by the nationwide seeding plan: political party organizations and profiles first, followed by term/election-cycle scaffolding, before polling units, officeholders, assignments, affiliations, candidates, and constituency offices.

## Result

S05 is now in progress. The first S05 batch seeds the current official INEC political party register as source-backed platform-seed organizations, discovery profiles, political-party vertical profiles, search entries, S04 sidecar rows, source identity maps, place resolutions, and provenance links.

This report does not mark full S05 complete. Polling units, current officeholders, politician profiles, assignments, affiliations, 2023 candidate records, ward reps, constituency offices, and campaign offices remain pending S05 batches.

## Implemented Changes

| File | Change |
|---|---|
| `infra/db/migrations/0305_political_foundation_seed.sql` | Adds S05 election-cycle table, election-cycle source locators, current-party seed run/source/artifact rows, 21 party organizations/profiles/vertical profiles/search entries, term scaffolds, S04 ingestion sidecars, identity maps, place resolutions, enrichment, and provenance links. |
| `apps/api/migrations/0305_political_foundation_seed.sql` | Mirrors the S05 migration for API migration parity. |
| `infra/db/seed/0006_political_parties.sql` | Standalone S05 party seed equivalent to the migration. |
| `infra/db/seed/sources/s05_inec_political_parties_20260421.json` | Official INEC current-party extract with 21 party records and per-party source hashes. |
| `infra/db/seed/sources/s05_official_electoral_source_locator_20260421.json` | Official source locator for INEC candidate lists, timetable PDF, polling-unit page, and CVR polling-unit locator. |
| `docs/reports/phase-s05-political-foundation-source-manifest-2026-04-21.md` | Documents sources, hashes, extraction status, and pending S05 source work. |

## Seeded Counts in This Batch

| Category | Count |
|---|---:|
| Current INEC political party organizations | 21 |
| Discovery `profiles` for political parties | 21 |
| `political_party_profiles` rows | 21 |
| Party search entries | 21 |
| Party source identity-map rows | 21 |
| Party ingestion sidecar rows | 21 |
| Party place-resolution rows | 21 |
| Party organization provenance links | 21 |
| Party profile provenance links | 21 |
| Party vertical-profile provenance links | 21 |
| Party search-entry provenance links | 21 |
| Election-cycle source locator rows | 2 |
| Term scaffold rows | 4 |

## Current INEC Party Register Seeded

| Acronym | Party |
|---|---|
| A | Accord |
| AA | Action Alliance |
| AAC | African Action Congress |
| ADC | African Democratic Congress |
| ADP | Action Democratic Party |
| APC | All Progressives Congress |
| APGA | All Progressives Grand Alliance |
| APM | Allied Peoples Movement |
| APP | Action Peoples Party |
| BP | Boot Party |
| DLA | Democratic Leadership Alliance |
| LP | Labour Party |
| NDC | Nigeria Democratic Congress |
| NNPP | New Nigeria Peoples Party |
| NRM | National Rescue Movement |
| PDP | Peoples Democratic Party |
| PRP | Peoples Redemption Party |
| SDP | Social Democratic Party |
| YP | Youth Party |
| YPP | Young Progressive Party |
| ZLP | Zenith Labour Party |

## Validation

SQLite validation applied the required S05 dependencies in-memory, including S00, S04, the country place seed, the political-party vertical schema, and `0305_political_foundation_seed.sql`; then reran `0305` to verify idempotency.

| Check | Expected | Result |
|---|---:|---:|
| Party organizations | 21 | 21 |
| Party discovery profiles | 21 | 21 |
| Political-party vertical profiles | 21 | 21 |
| Party search entries | 21 | 21 |
| Party organization provenance links | 21 | 21 |
| Party ingestion sidecars | 21 | 21 |
| Party identity-map rows | 21 | 21 |
| Party place-resolution rows | 21 | 21 |
| Election-cycle source locator rows | 2 | 2 |
| Term scaffold rows | 4 | 4 |
| Search FTS match for `apc` | 1 | 1 |
| Invalid party profile `primary_place_id` references | 0 | 0 |
| Rerun duplicates | 0 new duplicates | Passed |

## Acceptance Status for Full S05

| S05 acceptance check | Current status |
|---|---|
| 21 current parties are seeded with source links | Complete in this batch. |
| 176,846 polling units are seeded or every missing unit is explained | Pending; official polling-unit sources have been located and hashed, but row extraction is not yet implemented. |
| Every politician profile has a jurisdiction | Pending; politician profiles are not yet seeded. |
| Every political assignment has a term | Pending; reusable term scaffolds exist, but assignments are not yet seeded. |
| No duplicate politician exists for the same person/office/jurisdiction/term | Pending; duplicate rules will be applied during officeholder extraction. |
| Every political profile is searchable by name, office, LGA/state, and party where applicable | Partially complete; party profiles are searchable by name/acronym/INEC/political-party/Nigeria. Politician and officeholder profiles remain pending. |

## Next S05 Batch

Proceed to polling-unit extraction using the official INEC polling-unit page and CVR polling-unit locator captured in the S05 source locator. Polling units must dedupe by official PU code first, resolve to the most specific ward/LGA place available, and record every unresolved/ambiguous row in `seed_place_resolutions` before insertion.
