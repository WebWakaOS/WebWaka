# Phase S06 Education Batch Report — MLSCN Approved Training Institutions

## Objective

Seed official, source-backed Medical Laboratory Science Council of Nigeria training institution rows as education organizations without inferring missing LGA/ward data or double-counting health-facility internship sites.

## Source

| Field | Value |
|---|---|
| Owner | Medical Laboratory Science Council of Nigeria |
| Public site | `https://mlscn.gov.ng/education` |
| API base | `https://admin.mlscn.gov.ng/api/v1` |
| MLS training endpoint | `https://admin.mlscn.gov.ng/api/v1/approved-m-l-s-training-institution-universities` |
| MLA/T training endpoint | `https://admin.mlscn.gov.ng/api/v1/approved-m-l-a-t-training-institutions` |
| Internship endpoint captured but deferred | `https://admin.mlscn.gov.ng/api/v1/approved-institution-for-m-l-s-internships` |
| Confidence | official_verified |

## Extraction Summary

| Metric | Count |
|---|---:|
| Raw endpoint rows captured | 45 |
| MLS training universities seeded | 15 |
| MLA/T training institutions seeded | 15 |
| Total seeded organizations/profiles | 30 |
| Internship facility rows deferred | 15 |
| Rejected due unresolved state | 0 |
| State-level place resolutions | 30 |

## Reconciliation Rules

- Source identity uses endpoint key plus MLSCN API UUID.
- MLS training universities are seeded with `school_type='tertiary'`.
- MLA/T training institutions are seeded with `school_type='vocational'`.
- Place resolution is state-only because the MLSCN API rows provide state but no LGA/ward fields.
- No LGA, ward, or address inference is performed from institution names.
- MLS internship rows are captured but not seeded because they are health-facility training sites without structured state/LGA fields and may overlap with future HFR/NHIA/NPHCDA health-facility reconciliation.

## Validation

SQLite validation against a minimal S00-S04/S06 schema confirmed:

| Check | Result |
|---|---:|
| Organizations inserted | 30 |
| Profiles inserted | 30 |
| School profiles inserted | 30 |
| Search entries inserted | 30 |
| Entity-source provenance rows | 30 |
| Enrichment rows | 30 |
| Place-resolution rows | 30 |
| FTS rows rebuilt | 30 |
| Invalid profile/search place references | 0 |
| Duplicate profile subjects | 0 |
| Profiles missing search entry | 0 |
| Seed-run extracted rows | 45 |
| Seed-run inserted rows | 30 |
| Seed-run deferred/rejected rows | 15 |

## Output Files

| File | SHA-256 / Notes |
|---|---|
| `infra/db/seed/scripts/generate_s06_mlscn_training_institutions_sql.py` | Extraction, normalization, reconciliation, SQL generation |
| `infra/db/seed/sources/s06_mlscn_training_institutions_raw_20260421.json` | `71f2e92eff871809d87a6dd9e4a5f901de76d27d3502450860971fbeb1bb68d3` |
| `infra/db/seed/sources/s06_mlscn_training_institutions_normalized_20260421.json` | `5ea239ccac566ca141fae17f652cb6e4ff0c540d13f869120a4cdf597b0c3e17` |
| `infra/db/seed/sources/s06_mlscn_training_institutions_report_20260421.json` | `e72ded80184c9b0fb88c17ec0f917d0f9940f608c2657377b96f697dd19e4b1d` |
| `infra/db/migrations/0310_education_mlscn_training_institutions_seed.sql` | `a444d2d6d0709f5330923da5ef8bef5d06149b5d8ddbd1fd8a23fd9a17bcce72` |
| `apps/api/migrations/0310_education_mlscn_training_institutions_seed.sql` | Mirror of canonical migration |
| `infra/db/seed/0011_mlscn_training_institutions.sql` | Standalone seed mirror |

## Decision

The MLSCN public API is an official row-level regulator source for approved MLS and MLA/T training institutions, so those 30 rows are seeded as scoped education/training records. The 15 MLS internship facility rows are retained for review but deferred until health-facility identity reconciliation can prevent duplicate facility profiles.