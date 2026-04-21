# Phase S04 Completion Report — Ingestion Tooling, Seed Tenant, and Search Rebuild Readiness

## Objective

Make the database ready for safe high-volume nationwide entity insertion and discovery publication before S05–S13 domain batches begin.

## Result

S04 is implemented as reusable deterministic ingestion infrastructure rather than a domain data batch. The platform seed tenant/workspace from S00 remains the canonical host for nationwide seed data, and S04 adds the staging, identity, place-resolution, search rebuild, and QA controls needed for all downstream batches.

## Implemented Changes

| File | Change |
|---|---|
| `infra/db/migrations/0304_ingestion_tooling_seed.sql` | Adds S04 ingestion staging tables, identity map, place-resolution table, search rebuild job tracker, QA query library, S04 seed run/source/artifact rows, and a provenance link for `org_platform_seed`. |
| `apps/api/migrations/0304_ingestion_tooling_seed.sql` | Mirrors the S04 migration for API migration parity. |
| `infra/db/seed/scripts/nationwide_ingestion_tooling.ts` | Adds deterministic source-to-WebWaka ID generation, source stable keys, place resolver, keyword builder, duplicate detector, search-entry builder, FTS rebuild SQL, and reusable S04 QA query constants. |
| `docs/reports/phase-s04-ingestion-tooling-source-manifest-2026-04-21.md` | Documents S04 source/tooling inventory, hashes, and validation method. |

## Added Tables

| Table | Purpose |
|---|---|
| `seed_ingestion_records` | Batch-row sidecar table for raw JSON, normalized JSON, target entity/profile IDs, place resolution, and row-level rejection/duplicate status. |
| `seed_identity_map` | Idempotent source-record to canonical WebWaka entity/profile mapping using stable source identities. |
| `seed_place_resolutions` | Auditable LGA/ward/state resolution cache for every source row before profile insertion. |
| `seed_search_rebuild_jobs` | Tracks approved search rebuild batches and FTS rebuild status. |
| `seed_qa_query_library` | Stores reusable named QA checks that downstream seed phases must run before approval/publication. |

## Tooling Capabilities

| Requirement | Implementation |
|---|---|
| Stable IDs from source identity | `stableWebwakaId()` uses normalized source identity parts and SHA-256, never random UUIDs. |
| Most-specific `primary_place_id` resolution | `resolveMostSpecificPlace()` resolves explicit place, ward, LGA, then state while detecting ambiguous/unresolved candidates. |
| Keywords from canonical discovery fields | `buildKeywords()` uses canonical name, aliases, vertical, LGA, state, safe registration numbers, and service categories. |
| Search entries and ancestry | `buildSearchEntry()` creates deterministic search IDs and ancestry paths from canonical place records. |
| FTS rebuild readiness | `SEARCH_FTS_REBUILD_SQL` provides the approved SQLite FTS5 rebuild statement after batch insertion. |
| Raw source metadata sidecars | `seed_ingestion_records.raw_json` and `normalized_json` store row-level source metadata by `seed_run_id`. |
| Duplicate detection | `duplicateKey()` and `findDuplicateCandidates()` group records by safe registration number or canonical name/place/vertical identity. |
| Batch QA library | 8 S04 QA checks are seeded into `seed_qa_query_library`. |

## QA Query Library

| Check | Expected |
|---|---:|
| Root platform-seed entities missing source links | 0 |
| Seeded/claimable profiles missing primary place | 0 |
| Profiles with invalid primary place | 0 |
| Published seeded profiles missing search entry | 0 |
| Unresolved or ambiguous place resolutions | 0 |
| Duplicate source identity maps | 0 |
| Search entries with invalid place | 0 |
| Public search entries with blank keywords | 0 |

## Validation

S04 was validated with a TypeScript tooling self-test and an in-memory SQLite migration/idempotency test.

| Check | Result |
|---|---|
| Tooling self-test generated repeatable stable ID for equivalent source identity | Passed |
| Tooling place resolver selected most-specific ward place | Passed |
| Tooling duplicate detector grouped equivalent records | Passed |
| Tooling search-entry builder emitted ancestry including the primary place | Passed |
| S04 migration created 5 support tables | Passed |
| S04 migration seeded 1 seed run, 1 source, 1 artifact, 1 entity-source link, and 8 QA queries | Passed |
| Rerunning S04 migration kept the same counts | Passed |
| Re-inserting the same identity-map row twice produced 1 canonical mapping | Passed |
| Test seeded organization/profile produced 1 search entry | Passed |
| FTS rebuild returned 1 match for the test seeded profile | Passed |
| Test seeded profile had 0 invalid primary-place references | Passed |

## Acceptance Status

| Acceptance check | Status |
|---|---|
| Running the same seed batch twice does not duplicate entities | Complete: unique source identity map plus idempotent `INSERT OR IGNORE`/`INSERT OR REPLACE` patterns validated. |
| A bad batch can be isolated by `seed_run_id` | Complete: ingestion records, identity maps, place resolutions, search jobs, raw artifacts, and QA checks are keyed by `seed_run_id`. |
| Search rows can be generated for seeded profiles | Complete: deterministic search-entry builder and SQLite FTS rebuild validated with a test seeded profile. |
| Every inserted root entity has a source link | Complete for S04 bootstrap: `org_platform_seed` now has a S04 provenance link; QA query is available for downstream batches. |
| Every inserted profile has a valid `primary_place_id` | Complete for S04 tooling: place resolver and QA query are available and validated with a test seeded profile. |

## Next Phase

Proceed to Phase S05: Political and Electoral Foundation. S05 must use the S04 stable ID generator, identity map, place-resolution table, raw source sidecars, duplicate detector, search-entry builder, FTS rebuild job tracking, and QA query library before approving each political/electoral batch.
