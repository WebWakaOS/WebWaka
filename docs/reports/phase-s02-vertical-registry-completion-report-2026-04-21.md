# Phase S02 Completion Report — Vertical Registry, Synonym Map, and Seedability Matrix

## Objective

Load and reconcile the vertical registry before any vertical-specific profile data is seeded.

## Result

S02 is complete. The platform now has an idempotent 159-row vertical registry seed, a persisted synonym/overlap map, and a 159-row seedability matrix that marks profile-table readiness and sidecar enrichment requirements for every vertical.

## Implemented Changes

| File | Change |
|---|---|
| `infra/db/seeds/0004_verticals-master.csv` | Corrected two duplicate primary keys while preserving all 159 vertical rows |
| `infra/db/seed/0004_verticals.sql` | Added generated idempotent SQL inserts for the `verticals` table |
| `infra/db/migrations/0302_vertical_registry_seed.sql` | Added vertical registry seed, `vertical_synonyms`, `vertical_seedability_matrix`, and S02 provenance rows |
| `apps/api/migrations/0302_vertical_registry_seed.sql` | Mirrored the S02 migration for API migration parity |
| `docs/reports/phase-s02-vertical-registry-source-manifest-2026-04-21.md` | Added S02 source manifest |
| `docs/reports/webwaka-entity-seeding-nationwide-inventory-2026-04-21.md` | Reconciled stale 160 vertical count to 159 and updated ward reconciliation status |
| `docs/reports/webwaka-master-seed-inventory-2026-04-21.md` | Reconciled stale 160 vertical count to 159 and updated S01/S02 seed status |

## Reconciliation Findings

| Check | Result |
|---|---:|
| CSV data rows | 159 |
| Vertical package directories | 159 |
| CSV rows with matching package directories | 159 |
| Package directories not referenced by CSV | 0 |
| Duplicate slugs after fix | 0 |
| Duplicate IDs after fix | 0 |
| Idempotent vertical insert rows | 159 |
| Synonym/overlap rows | 14 |
| Seedability rows | 159 |

The active vertical count is 159. Older 160 references in reports were stale and have been reconciled where they affected current seeding guidance.

## Seedability Matrix Summary

| Profile status | Count | Meaning |
|---|---:|---|
| exists | 129 | Dedicated `nurtw_profiles` table exists and can receive profile seeds with source sidecar enrichment |
| partial | 15 | A shared/alias profile table or child domain table exists; manual mapping/dedupe required before profile seeding |
| missing | 15 | No vertical-specific profile table found; seed only generic entity/profile rows plus sidecar enrichment until schema is added |

All 159 rows are marked `requires_sidecar_enrichment = 1` because national source data will include registry-specific identifiers, aliases, licensing metadata, refresh state, dedupe decisions, and confidence details that are not uniformly represented in vertical profile schemas.

## Partial Profile Rows

| Slug | Existing table / basis | Note |
|---|---|---|
| `mass-transit` | `transit_profiles` | profile table exists under alias/shared implementation name |
| `cooperative` | `child/shared tables only` | child/shared domain tables exist, but no canonical profile table |
| `market` | `child/shared tables only` | child/shared domain tables exist, but no canonical profile table |
| `restaurant` | `child/shared tables only` | child/shared domain tables exist, but no canonical profile table |
| `pharmacy` | `child/shared tables only` | child/shared domain tables exist, but no canonical profile table |
| `photography` | `photography_studio_profiles` | profile table exists under alias/shared implementation name |
| `gym` | `gym_fitness_profiles` | profile table exists under alias/shared implementation name |
| `professional-association` | `professional_assoc_profiles` | profile table exists under alias/shared implementation name |
| `ferry` | `ferry_operator_profiles` | profile table exists under alias/shared implementation name |
| `bureau-de-change` | `bdc_profiles` | profile table exists under alias/shared implementation name |
| `newspaper-distribution` | `newspaper_dist_profiles` | profile table exists under alias/shared implementation name |
| `palm-oil-trader` | `palm_oil_profiles` | profile table exists under alias/shared implementation name |
| `polling-unit-rep` | `polling_unit_profiles` | profile table exists under alias/shared implementation name |
| `tailoring-fashion` | `tailor_profiles` | profile table exists under alias/shared implementation name |
| `phone-repair-shop` | `phone_repair_profiles` | profile table exists under alias/shared implementation name |

## Missing Profile Rows

`pos-business`, `supermarket`, `savings-group`, `insurance-agent`, `fashion-brand`, `welding-fabrication`, `wholesale-market`, `waste-management`, `youth-organization`, `womens-association`, `lga-office`, `community-radio`, `tutoring`, `produce-aggregator`, `startup`

## Synonym / Overlap Map

The migration seeds overlaps for the known high-risk duplicate families: `fuel-station`/`petrol-station`, `road-transport-union`/`nurtw`, `laundry`/`laundry-service`, `gym`/`gym-fitness`, and `tailor`/`tailoring-fashion`, plus implementation aliases such as `mass-transit`/`transit` and `photography`/`photography-studio`.

## Validation

SQLite validation applied the vertical table migration, S00 control plane migration, and S02 migration in-memory and confirmed:

| Check | Result |
|---|---:|
| `verticals` rows | 159 |
| Unique vertical IDs | 159 |
| Unique vertical slugs | 159 |
| `vertical_synonyms` rows | 14 |
| `vertical_seedability_matrix` rows | 159 |
| Profile `exists` rows | 129 |
| Profile `partial` rows | 15 |
| Profile `missing` rows | 15 |
| Sidecar-required rows | 159 |
| S02 seed run provenance rows | 1 |
| S02 source provenance rows | 1 |

## Acceptance Status

| Acceptance check | Status |
|---|---|
| Reconcile 160 documentation references against current 159-row CSV | Complete |
| Convert CSV to idempotent SQL inserts | Complete |
| Load `verticals` | Complete via migration `0302_vertical_registry_seed.sql` |
| Create synonym map before overlapping vertical seeding | Complete |
| Mark profile table exists/partial/missing | Complete |
| Mark sidecar enrichment requirement | Complete |

## Next Phase

Proceed to Phase S03: jurisdictions and administrative boundaries. S03 can now depend on canonical geography plus the reconciled 159-vertical registry and seedability matrix.
