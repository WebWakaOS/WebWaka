# Phase S06 Education Batch Report — NEMIS Schools Directory

## Objective

Begin Phase S06 with official education registry seeding using source-backed row-level data only. UBEC aggregate figures are retained as variance benchmarks, but no aggregate-only counts are converted into fabricated school records.

## Result

The S06 education batch seeds 174,268 official NEMIS school records as platform-seed organizations, discovery profiles, school profiles, private-school profiles where applicable, search entries, and S00/S04 provenance sidecars.

This report does not mark full S06 complete. Health facility, pharmacy, and professional registry batches remain pending and require row-level official sources before seeding.

## Implemented Changes

| File | Change |
|---|---|
| `infra/db/seed/scripts/extract_s06_nemis_schools.py` | Official NEMIS CSV extractor with concurrent LGA-partitioned Primary-school extraction, caching, retry behavior, and resume support. |
| `infra/db/seed/scripts/generate_s06_nemis_schools_sql_stream.py` | Streaming SQL generator for deduped NEMIS schools, LGA reconciliation, provenance sidecars, and migration mirrors. |
| `infra/db/seed/sources/s06_nemis_schools_extraction_report_20260421.json` | Extraction summary and source handling report. |
| `infra/db/seed/sources/s06_nemis_schools_normalized_20260421.json` | Normalized official NEMIS school extract. |
| `infra/db/seed/sources/s06_nemis_schools_reconciliation_20260421.json` | Canonical dedupe and place reconciliation report. |
| `infra/db/migrations/0307_education_nemis_schools_seed.sql` | Main S06 education seed migration. |
| `apps/api/migrations/0307_education_nemis_schools_seed.sql` | API migration mirror. |
| `infra/db/seed/0008_nemis_schools.sql` | Standalone S06 education seed equivalent to the migration. |
| `docs/reports/phase-s06-education-health-source-manifest-2026-04-21.md` | Source manifest for S06 education and pending health sources. |

## Source Extraction Counts

| Source category | Extracted rows |
|---|---:|
| Pre-primary | 1,426 |
| Primary | 129,614 |
| Junior Secondary | 38,217 |
| Senior Secondary | 5,144 |
| Total NEMIS CSV source rows | 174,401 |
| Rejected non-data/error rows | 3 |
| Canonical schools after official-code dedupe | 174,398 |
| Canonical schools resolved and seeded | 174,268 |
| Canonical schools not seeded due unresolved LGA | 130 |

## Seeded Counts

| Category | Count |
|---|---:|
| School organizations | 174,268 |
| Discovery `profiles` | 174,268 |
| `school_profiles` rows | 174,268 |
| `private_school_profiles` rows | 92,589 |
| School search entries | 174,268 |
| Ingestion sidecar rows | 174,268 |
| Source identity-map rows | 174,268 |
| Place-resolution rows | 174,268 |
| Dedupe-decision rows | 174,268 |
| Provenance/source-link rows | 174,268 |

## Seeded School Type Counts

| School type | Count |
|---|---:|
| Nursery / pre-primary | 1,426 |
| Primary | 129,522 |
| Secondary | 43,320 |

## Seeded Ownership Counts

| Ownership | Count |
|---|---:|
| Public | 81,679 |
| Private | 92,589 |

## UBEC Benchmark Variance

| UBEC 2022 NPA aggregate | Count |
|---|---:|
| Public UBE schools | 79,775 |
| Private UBE schools | 91,252 |
| Total UBE schools | 171,027 |

NEMIS seeded rows are not expected to equal UBEC UBE aggregates exactly because the NEMIS extract contains official row-level school directory data across school levels and includes source-level duplicates removed by NEMIS school code. UBEC is recorded only as an official benchmark because the public UBEC source available during this batch did not expose row-level school records.

## Place Reconciliation

| Resolution method | Count |
|---|---:|
| Exact state/LGA match | 162,836 |
| Explicit alias match | 8,957 |
| Conservative fuzzy match (`>=0.88`) | 2,475 |
| Unresolved | 130 |

Remaining unresolved source LGA labels are not seeded because they cannot be mapped to one canonical LGA without unsafe inference:

| Source state | Source LGA label | Rows | Reason |
|---|---|---:|---|
| Osun | Ilesha | 69 | Ambiguous against canonical Ilesa East / Ilesa West split. |
| Imo | Onuimo | 60 | Source label not resolved against current canonical LGA seed during this batch. |
| Jigawa | Basirka | 1 | Source label not resolved against current canonical LGA seed during this batch. |

## Validation

SQLite validation was run on a minimal dependency schema using the generated `0307` SQL. To stay within command limits for the 631 MB migration, bulky sidecar JSON insert statements were parsed for row counts while core entity/search/profile SQL was executed. A full dependency-schema run was also attempted and applied cleanly until command timeout; the completed validation below covers the generated core SQL and sidecar counts.

| Check | Expected | Result |
|---|---:|---:|
| School organizations | 174,268 | 174,268 |
| Discovery profiles | 174,268 | 174,268 |
| School profiles | 174,268 | 174,268 |
| Private-school profiles | 92,589 | 92,589 |
| Search entries | 174,268 | 174,268 |
| Search FTS rebuild rows | 174,268 | 174,268 |
| Parsed ingestion sidecar rows | 174,268 | 174,268 |
| Parsed identity-map rows | 174,268 | 174,268 |
| Parsed place-resolution rows | 174,268 | 174,268 |
| Parsed dedupe-decision rows | 174,268 | 174,268 |
| Parsed provenance/source-link rows | 174,268 | 174,268 |
| Invalid profile place references | 0 | 0 |
| Invalid search place references | 0 | 0 |
| Profiles missing search entries | 0 | 0 |
| Duplicate profile subjects | 0 | 0 |

## Acceptance Status for S06 Education Batch

| S06 education acceptance check | Current status |
|---|---|
| Education counts match source extracts and every variance is documented | Complete for NEMIS batch; UBEC aggregate variance documented. |
| Every seeded school resolves to state and LGA | Complete for the 174,268 seeded schools; 130 unresolved source rows are held back rather than guessed. |
| Ward resolution is required where possible | Not available from the NEMIS CSV export used in this batch; state/LGA is the reliable official place level. |
| No school is seeded from market estimate alone | Complete; all seeded schools come from official NEMIS row-level exports. |

## Next S06 Batch

Proceed to health source research and extraction. Do not seed health entities until an official or regulator-published row-level source can be obtained for HFR/NHIA/NPHCDA/PCN/MDCN/NMCN data. Direct HFR access from the Replit network timed out or failed endpoint/SSL checks in this session, so the next step is locating a reliable official mirror, archived export, or alternative regulator endpoint.
