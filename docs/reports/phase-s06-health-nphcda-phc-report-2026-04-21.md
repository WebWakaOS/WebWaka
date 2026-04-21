# Phase S06 Health Batch Report — NPHCDA Primary Health Care Facilities

## Objective

Seed official, source-backed primary-health-care facility rows from the National Primary Health Care Development Agency dashboard without fabricating missing geography or merging across weaker sources.

## Source

| Field | Value |
|---|---|
| Owner | National Primary Health Care Development Agency |
| Dashboard | `https://phc.nphcda.gov.ng/` |
| API base discovered in dashboard bundle | `https://api.nphcda.gov.ng/` |
| Country id | `09a25923-91c2-4412-87a1-310edfd878b9` |
| PHC indicator id | `e70967b3-10d8-416e-9c21-7f7278375ce9` |
| API endpoint | `https://api.nphcda.gov.ng/indicators/e70967b3-10d8-416e-9c21-7f7278375ce9/?geo_json=false&country=09a25923-91c2-4412-87a1-310edfd878b9` |
| Confidence | official_verified |

## Extraction Summary

| Metric | Count |
|---|---:|
| API `total_count` | 26,711 |
| API `total_facility_count` | 26,711 |
| Raw rows extracted | 26,711 |
| Normalized facilities | 26,711 |
| Seeded facilities | 26,711 |
| Rejected rows | 0 |
| States/FCT covered | 37 |
| Canonical LGAs covered | 773 |
| Ward-level place resolutions | 21,240 |
| LGA-level place resolutions | 5,471 |

## Reconciliation Rules

- Facility identity uses the NPHCDA source facility id and is stored as `NPHCDA-PHC-<facility_id>`.
- State and LGA labels are reconciled against the canonical S01/S03 geography seed.
- NPHCDA spelling variants are handled only where they map to one unambiguous canonical LGA, including examples such as `AMAC`, `MMC`, `Akamkpa Urban`, `Maiadua`, `Danmusa`, `Yenegoa`, `Kano Minicipal Council`, and `Urueoffong/Oruko`.
- Ward labels are resolved conservatively. If the ward label does not map to exactly one canonical ward, the facility is still seeded at canonical LGA level instead of guessing a ward.
- Coordinates, source ward id, photo URL, and rating fields are preserved in enrichment sidecars.

## Cross-Source Review

The generator compared NPHCDA rows to the already seeded NHIA HCP batch by exact normalized facility name and state. It found 44 exact name/state candidates, but none were auto-merged because NHIA rows do not provide LGA, ward, or coordinate precision. These candidates are retained in `infra/db/seed/sources/s06_nphcda_phc_report_20260421.json` for future HFR-backed reconciliation.

## Validation

SQLite validation against a minimal S00-S04/S06 schema confirmed:

| Check | Result |
|---|---:|
| Organizations inserted | 26,711 |
| Profiles inserted | 26,711 |
| Clinic profiles inserted | 26,711 |
| Search entries inserted | 26,711 |
| Entity-source provenance rows | 26,711 |
| Enrichment rows | 26,711 |
| Place-resolution rows | 26,711 |
| FTS rows rebuilt | 26,711 |
| Invalid profile/search place references | 0 |
| Duplicate profile subjects | 0 |
| Profiles missing search entry | 0 |
| Seed-run extracted rows | 26,711 |
| Seed-run inserted rows | 26,711 |
| Seed-run rejected rows | 0 |

## Output Files

| File | SHA-256 / Notes |
|---|---|
| `infra/db/seed/scripts/generate_s06_nphcda_phc_sql.py` | Extraction, normalization, reconciliation, SQL generation |
| `infra/db/seed/sources/s06_nphcda_phc_raw_20260421.json` | `dec4241bf205ba9759fd1933e18e1ffd782ce63cacf47428499b92254da9ddda` |
| `infra/db/seed/sources/s06_nphcda_phc_normalized_20260421.json` | `44c47a6761dd0a5e1beedcca69829c5bcb5b10b2f3c88e37edb9bd141689e58a` |
| `infra/db/seed/sources/s06_nphcda_phc_report_20260421.json` | `56ed02f62fc8a7fcbc8c699a3705f1effe2ec790aa7a8fb1522eefa19ef14f62` |
| `infra/db/migrations/0309_health_nphcda_phc_seed.sql` | `062d162154a276bcd8cce570f3aa985b4bdb0bfdefba54ca21ac09ff12f27f64` |
| `apps/api/migrations/0309_health_nphcda_phc_seed.sql` | Mirror of canonical migration |
| `infra/db/seed/0010_nphcda_phc.sql` | Standalone seed mirror |

## Decision

The NPHCDA PHC dashboard API is an official row-level source and has been seeded as a scoped PHC batch. It does not replace a future HFR master health-facility registry because it covers NPHCDA PHC dashboard facilities specifically.