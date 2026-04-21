# Phase S04 Source Manifest — Ingestion Tooling, Seed Tenant, and Search Rebuild Readiness

## Source Inventory

| Source | Owner | Type | Confidence | URL / Path | Hash | Rows used | Notes |
|---|---|---|---|---|---|---:|---|
| WebWaka Nationwide Seed Ingestion Tooling | WebWaka OS | Internal repository tooling | official_verified | `infra/db/seed/scripts/nationwide_ingestion_tooling.ts` | `844292b43e42a3d13fcac4c7bef6ce585f306d8424485d8a47bf89911d0ce8ac` | 0 | Deterministic source-to-ID, place resolution, duplicate detection, search-entry, FTS rebuild, and QA query tooling for S05–S13 batches. |
| S04 ingestion tooling migration | WebWaka OS | Internal database migration | official_verified | `infra/db/migrations/0304_ingestion_tooling_seed.sql`; `apps/api/migrations/0304_ingestion_tooling_seed.sql` | `33a97612a93485a601ab048654f72322287db32c8483f8d9bda58b80082098c2` | 14 bootstrap metadata/control rows | Creates ingestion support schema, S04 seed metadata, and 8 QA query-library rows. |
| S00 platform seed tenant/workspace | WebWaka OS | Internal seed-control foundation | official_verified | `infra/db/migrations/0301_seed_control_plane.sql` | n/a | 1 tenant, 1 organization, 1 workspace reused | S04 reuses `tenant_platform_seed` and `workspace_platform_seed_discovery` and adds a provenance link for `org_platform_seed`. |
| Existing discovery schema | WebWaka OS | Internal database schema | official_verified | `infra/db/migrations/0005_init_profiles.sql`; `infra/db/migrations/0008_init_search_index.sql`; `apps/api/src/lib/search-index.ts` | n/a | Schema dependency only | S04 aligns seeded profile requirements with `profiles.primary_place_id`, `search_entries.keywords`, `search_entries.ancestry_path`, and SQLite FTS5 rebuild behavior. |

## Validation Artifacts

| Artifact | Command / Method | Result |
|---|---|---|
| Tooling self-test | `npx tsx infra/db/seed/scripts/nationwide_ingestion_tooling.ts --self-test` | Passed; generated repeatable stable ID, resolved ward place, grouped duplicates, and built search entry. |
| SQLite migration/idempotency validation | In-memory SQLite applying `0001`, `0230`, `0002`, `0003`, `0005`, `0008`, `0301`, and `0304`, then rerunning `0304` | Passed; counts stayed stable after rerun. |
| Search rebuild validation | Inserted test seeded organization/profile/search row and ran `INSERT INTO search_fts(search_fts) VALUES('rebuild')` | Passed; FTS matched the test profile once. |

## Output Files

- `infra/db/migrations/0304_ingestion_tooling_seed.sql`
- `apps/api/migrations/0304_ingestion_tooling_seed.sql`
- `infra/db/seed/scripts/nationwide_ingestion_tooling.ts`
- `docs/reports/phase-s04-ingestion-tooling-completion-report-2026-04-21.md`
