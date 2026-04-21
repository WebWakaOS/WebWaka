# Phase S03 Completion Report — Jurisdictions and Administrative Boundaries

## Objective

Seed political and administrative jurisdiction records required by downstream politician, ward representative, constituency office, candidate, assignment, and party-affiliation data.

## Result

S03 is implemented with source-backed records. The migration seeds administrative jurisdictions for every canonical S01 geography node and electoral constituency places/jurisdictions extracted from the official INEC constituency workbook.

## Implemented Changes

| File | Change |
|---|---|
| `infra/db/migrations/0303_jurisdiction_seed.sql` | Adds S03 seed run/source provenance, constituency places, jurisdiction rows, entity-source links, and coverage snapshot. |
| `apps/api/migrations/0303_jurisdiction_seed.sql` | Mirrors the S03 migration for API migration parity. |
| `infra/db/seed/0005_jurisdictions.sql` | Adds standalone jurisdiction seed equivalent to the migration. |
| `docs/reports/phase-s03-jurisdiction-source-manifest-2026-04-21.md` | Documents source inventory, extraction method, and the 990-vs-993 state constituency variance. |

## Seeded Counts

| Category | Count |
|---|---:|
| Country jurisdictions | 1 |
| State/FCT jurisdictions | 37 |
| LGA jurisdictions | 774 |
| Ward jurisdictions | 8,809 |
| Senatorial district places and jurisdictions | 109 |
| Federal constituency places and jurisdictions | 360 |
| State constituency places and jurisdictions | 990 |
| Total jurisdiction rows after S03 | 11,080 |

## Source Variance

The official INEC workbook extracted during S03 contains 990 state constituency code rows. Public 2023 summaries may refer to 993 State Houses of Assembly seats/constituencies, but S03 did not locate a newer official row-level boundary file listing 993 state constituencies. To keep the seed auditable, the migration seeds the 990 official workbook rows and records the difference as a source variance rather than fabricating missing entries.

## Validation

SQLite validation applies the S00/S01/S02 prerequisites plus `0006_init_political.sql` and `0303_jurisdiction_seed.sql` in-memory and confirms:

| Check | Expected |
|---|---:|
| Country jurisdictions | 1 |
| State/FCT jurisdictions | 37 |
| LGA jurisdictions | 774 |
| Ward jurisdictions | 8,809 |
| Senatorial district jurisdictions | 109 |
| Federal constituency jurisdictions | 360 |
| Source-backed state constituency jurisdictions | 990 |
| Jurisdiction orphan place references | 0 |
| Duplicate jurisdiction `(place_id, territory_type)` pairs | 0 |
| Jurisdictions linked in `seed_entity_sources` | 11,080 |

## Acceptance Status

| Acceptance check | Status |
|---|---|
| Every ward has one jurisdiction | Complete |
| Every LGA has one jurisdiction | Complete |
| Every state/FCT has one jurisdiction | Complete |
| Country/Federal jurisdiction exists | Complete |
| 109 senatorial district jurisdictions exist | Complete |
| 360 federal constituency jurisdictions exist | Complete |
| State constituency count matches available official row-level source | Complete with documented variance: official INEC XLS has 990 rows; 993 public count awaits newer official row-level source |
| Jurisdictions linked to `seed_entity_sources` provenance | Complete |

## Next Phase

Proceed to Phase S04: ingestion tooling, seed tenant/workspace readiness, and search rebuild readiness.
