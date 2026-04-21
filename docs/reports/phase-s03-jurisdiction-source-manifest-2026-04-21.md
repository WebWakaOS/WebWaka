# Phase S03 Source Manifest — Jurisdictions and Administrative Boundaries

## Source Inventory

| Source | Owner | Type | Confidence | URL / Path | Hash | Rows used | Notes |
|---|---|---|---|---|---|---:|---|
| WebWaka Canonical Nigeria Geography Seed | WebWaka OS | Internal reconciled seed | official_verified | `infra/db/seed/0002_lgas.sql`; `infra/db/seed/0003_wards.sql` | n/a | 9,621 jurisdictions | One jurisdiction per country, state/FCT, LGA, and ward from S01 canonical place hierarchy. |
| Name of Senatorial Districts, Federal and State Constituencies Nationwide | Independent National Electoral Commission (INEC) | Official government workbook | official_stale | https://www.inecnigeria.org/wp-content/uploads/2019/02/Name-of-Senatorial-DistrictsFederal-and-State-Constituencies-Nationwide-1.xls | `a094e8cadd3f7a47986ed546a1a6d9fb3707feaa879492f43f33fa9c116d751b` | 1,459 electoral constituency rows | Official XLS retrieved 2026-04-21. Workbook publication path is dated 2019-02 and is treated as stale but authoritative row-level boundary data until a newer row-level INEC boundary file is found. |

## Extracted INEC Counts

| Sheet | Territory type | Extracted rows |
|---|---|---:|
| `SEN. DIST.` | Senatorial district | 109 |
| `FED. CONST.` | Federal constituency | 360 |
| `STATE CONST.` | State constituency | 990 |

## State-Constituency Count Variance

The S03 research target expected the current state-constituency count to align with public 2023 references to 993 State Houses of Assembly seats/constituencies. The official INEC workbook available at the row level contains 990 `SC/` code rows. S03 therefore seeds 990 source-backed state constituency boundaries and records this as a variance. No extra state constituency rows were fabricated.

## Extraction Method

- Downloaded the official INEC XLS from the public INEC URL.
- Parsed the workbook with `xlrd`.
- Selected rows containing `SD/`, `FC/`, or `SC/` constituency codes.
- Mapped constituency rows to canonical state/FCT place IDs using INEC code suffixes.
- Created constituency `places` with parent set to the state/FCT and ancestry path extended from the canonical state ancestry.
- Created one `jurisdictions` row per country/state/FCT/LGA/ward/constituency place.

## Output Files

- `infra/db/migrations/0303_jurisdiction_seed.sql`
- `apps/api/migrations/0303_jurisdiction_seed.sql`
- `infra/db/seed/0005_jurisdictions.sql`
