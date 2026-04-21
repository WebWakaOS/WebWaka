# Phase S01 Completion Report — Geography Foundation and Ward Reconciliation

## Objective

Establish canonical Nigerian geography as the immutable discovery hierarchy before any profile, jurisdiction, political, electoral, or vertical seeding depends on it.

## Result

S01 is complete. The geography seed set now validates to the accepted canonical targets: 1 Nigeria root, 6 geopolitical zones, 37 states/FCT, 774 LGAs, and 8,809 wards/registration areas.

## Implemented Changes

| File | Change |
|---|---|
| `infra/db/seed/0002_lgas.sql` | Removed duplicate Ogun LGA row `place_lga_ogun_shagamu`; retained stable existing `place_lga_ogun_sagamu` with Shagamu/Sagamu handled as an alias in the generator |
| `infra/db/seed/0003_wards.sql` | Regenerated from a complete 8,809-row public ward reference matched to WebWaka stable LGA IDs |
| `infra/db/seed/scripts/generate_wards_sql.ts` | Updated target count, restored missing Ogun `Imeko-Afon`, removed duplicate Shagamu raw LGA row, added source spelling aliases, fixed matched-row accounting, and removed stale `unmatched_lgas.txt` on successful generation |
| `docs/reports/phase-s01-geography-source-manifest-2026-04-21.md` | Added S01 source manifest and confidence notes |

## Reconciliation Findings

| Finding | Before | After |
|---|---:|---:|
| LGA seed rows | 775 | 774 |
| Ward seed rows | 8,810 | 8,809 |
| Distinct LGA parents represented by wards | 767 | 774 |
| LGAs without ward children | 8 | 0 |
| Orphan ward parent references | Not formally validated | 0 |
| Invalid ancestry references | Not formally validated | 0 |

The local 8,810 ward count was not a safe accepted variance. It came with structural problems: one duplicate/alternate Ogun LGA row and wards attached to only 767 distinct LGA parents. The accepted correction is therefore 8,809 wards, aligned to INEC's official registration-area/ward count.

## Important Alias Decisions

| Source spelling | Stable WebWaka target |
|---|---|
| Shagamu | `place_lga_ogun_sagamu` |
| Egbado North | `place_lga_ogun_yewa_north` |
| Egbado South | `place_lga_ogun_yewa_south` |
| Nassarawa | `nasarawa` state key |
| Municipal | `place_lga_fct_amac` |
| Koton-Karfe | `place_lga_kogi_kogi` |
| Muya | `place_lga_niger_moya` |

Additional spelling aliases are captured in `infra/db/seed/scripts/generate_wards_sql.ts` so the ward file can be regenerated reproducibly.

## Validation

Executed a SQLite in-memory validation applying:

1. `infra/db/migrations/0001_init_places.sql`
2. `infra/db/seed/nigeria_country.sql`
3. `infra/db/seed/nigeria_zones.sql`
4. `infra/db/seed/nigeria_states.sql`
5. `infra/db/seed/0002_lgas.sql`
6. `infra/db/seed/0003_wards.sql`

Validated results:

| Check | Result |
|---|---:|
| Country count | 1 |
| Geopolitical zone count | 6 |
| State/FCT count | 37 |
| LGA count | 774 |
| Ward count | 8,809 |
| Distinct ward parent LGAs | 774 |
| Orphan parent references | 0 |
| Invalid ancestry references | 0 |
| Duplicate ward IDs | 0 |

## Acceptance Status

| Acceptance check | Status |
|---|---|
| Country count = 1 | Complete |
| Zone count = 6 | Complete |
| State/FCT count = 37 | Complete |
| LGA count = 774 | Complete |
| Ward count equals accepted canonical number | Complete: 8,809 |
| No orphan `places.parent_id` | Complete |
| No invalid `ancestry_path` | Complete |

## Next Phase

Proceed to Phase S02: vertical registry, synonym map, and seedability matrix. S02 can now rely on a validated geography hierarchy for state/LGA/ward coverage calculations.
