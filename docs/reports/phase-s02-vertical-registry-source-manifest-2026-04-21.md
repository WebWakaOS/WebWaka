# Phase S02 Vertical Registry Source Manifest

## Source Identity

| Field | Value |
|---|---|
| Source ID | `seed_source_webwaka_verticals_master_csv_20260421` |
| Source name | WebWaka OS Verticals Master CSV |
| Owner / publisher | WebWaka OS |
| Source type | internal |
| Confidence | official_verified |
| Source path | `infra/db/seeds/0004_verticals-master.csv` |
| Retrieval / review date | 2026-04-21 |
| SHA-256 | `af01b743b3904221c3bbc45d3e7866569424b56e2a08109f380cc6c953d04661` |
| Rows | 159 |
| Unique IDs | 159 |
| Unique slugs | 159 |

## Reconciled Count

The active source of truth is 159 verticals, not 160. The 159 count is confirmed by both:

- `infra/db/seeds/0004_verticals-master.csv`: 159 data rows
- `packages/verticals-*`: 159 vertical package directories, all referenced by the CSV

The older 160 count in planning/inventory docs was a stale documentation reference. It appears to have counted the CSV line count including the header or retained an earlier planning target after the registry stabilized at 159 package-backed verticals.

## Source Fixes Applied

| Issue | Resolution |
|---|---|
| Duplicate ID `vtx_laundry` for `laundry` and `laundry-service` | `laundry-service` now uses `vtx_laundry_service` |
| Duplicate ID `vtx_nurtw` for `road-transport-union` and `nurtw` | `nurtw` now uses `vtx_nurtw_specialized` |
| Known overlapping vertical names | Captured in `vertical_synonyms` via migration `0302_vertical_registry_seed.sql` |
| Rich seed attributes not represented uniformly in profile tables | All 159 verticals require `seed_enrichment` sidecar support |

## Registry Breakdown

| Dimension | Counts |
|---|---|
| Entity types | individual: 29, organization: 114, place: 16 |
| Priorities | P1: 17, P2: 62, P3: 80 |
| Profile status | exists: 129, missing: 15, partial: 15 |

## Category Counts

| Category | Count |
|---|---:|
| agricultural | 12 |
| civic | 13 |
| commerce | 54 |
| creator | 8 |
| education | 8 |
| financial | 6 |
| health | 11 |
| institutional | 1 |
| media | 3 |
| place | 8 |
| politics | 7 |
| professional | 13 |
| transport | 15 |

## Generated Artifacts

| Artifact | Purpose |
|---|---|
| `infra/db/seed/0004_verticals.sql` | Idempotent SQL insert seed generated from the CSV |
| `infra/db/migrations/0302_vertical_registry_seed.sql` | Migration containing vertical inserts, synonym map, seedability matrix, source/run provenance |
| `apps/api/migrations/0302_vertical_registry_seed.sql` | API migration mirror |
