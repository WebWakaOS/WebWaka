# Phase S06 Source Manifest — Education and Health Official Registries

## Source Inventory

| Source | Owner | Type | Confidence | URL / Path | Hash | Rows used | Notes |
|---|---|---|---|---|---:|---:|---|
| NEMIS Schools Directory CSV Exports | Federal Ministry of Education / Nigeria Education Management Information System | Official government directory | official_verified | `https://nemis.education.gov.ng/export-schools.php?lga=<LGA>&school_type={1,2,3,4}&search=` and `https://nemis.education.gov.ng/schools.php` | `a7f0c30223d56854b9d8baa4808c68d276c6cba74d7d67965176a05349f01423` | 174,401 extracted rows; 174,268 seeded canonical rows | Official NEMIS school directory exports. Pre-primary, JSS, and SSS were fetched by national level export; Primary national export returned HTTP 500, so Primary rows were extracted by LGA partition. |
| NEMIS extraction report | WebWaka OS | Generated extraction artifact | official_verified | `infra/db/seed/sources/s06_nemis_schools_extraction_report_20260421.json` | `6363eca81ff3ab32eefbac869c4e2357ab7c63c416fa2829e62cfb5e5c3f03f9` | 174,401 | Documents extraction method, response handling, accepted/rejected rows, and cached partitioned downloads. |
| NEMIS normalized source artifact | WebWaka OS | Generated normalized artifact | official_verified | `infra/db/seed/sources/s06_nemis_schools_normalized_20260421.json` | `a7f0c30223d56854b9d8baa4808c68d276c6cba74d7d67965176a05349f01423` | 174,401 | Normalized source rows and canonical school-code records produced from the official NEMIS CSV exports. |
| NEMIS reconciliation report | WebWaka OS | Generated reconciliation artifact | official_verified | `infra/db/seed/sources/s06_nemis_schools_reconciliation_20260421.json` | `8e1b22d9a5695a006590c69cd63e3e6844a8c306c1f3a9335f7b3d967831105e` | 174,398 canonical schools; 174,268 resolved | Documents exact, alias, fuzzy, and unresolved LGA reconciliation against the canonical 774-LGA geography seed. |
| S06 NEMIS education migration | WebWaka OS | Internal database migration | official_verified | `infra/db/migrations/0307_education_nemis_schools_seed.sql`; `apps/api/migrations/0307_education_nemis_schools_seed.sql`; `infra/db/seed/0008_nemis_schools.sql` | `64c3244d02f09bc338e5738d02bdd6f1427a8bbb164871f805cfb38d83f9e3ee` | 174,268 school organizations/profiles | Idempotent migration for school organizations, discovery profiles, school profiles, private-school profiles, search entries, S04 ingestion sidecars, identity maps, place resolutions, dedupe decisions, source links, and search rebuild metadata. |
| UBEC 2022 National Personnel Audit aggregate benchmark | Universal Basic Education Commission | Official government aggregate | official_verified | `https://ubec.gov.ng/` | Not row-level | Benchmark only | UBEC public pages exposed aggregate counts of 171,027 UBE schools, 79,775 public and 91,252 private. These aggregates are retained only for variance reporting and were not used to fabricate row-level schools. |
| NHIA Participating Health Care Providers | National Health Insurance Authority | Official government directory | official_verified | `https://www.nhia.gov.ng/hcps/` | `a110aade29c855e1d2dee4ed40200b500abd5a0df86044e3fc7fb622c272fdd2` | 6,540 extracted rows; 6,539 seeded provider organizations/profiles | Official NHIA public HCP table extracted from the embedded AJAX JSON endpoint. Rows provide provider code, provider name, address, and facility tier. Place resolution is state-only from NHIA provider-code prefix; no LGA/ward is inferred. |
| S06 NHIA HCP migration | WebWaka OS | Internal database migration | official_verified | `infra/db/migrations/0308_health_nhia_hcp_seed.sql`; `apps/api/migrations/0308_health_nhia_hcp_seed.sql`; `infra/db/seed/0009_nhia_hcp.sql` | `08e08d0099e6168ab45750098ea32663685f746a3f7f717f35495ddd61cb0ad2` | 6,539 health-care facility organizations/profiles | Idempotent migration for NHIA-accredited provider organizations, discovery profiles, clinic profiles, search entries, S04 ingestion sidecars, identity maps, state-level place resolutions, dedupe decisions, source links, and search rebuild metadata. |
| HDX/eHealth Africa Nigeria health facilities candidate | eHealth Africa via HDX | Third-party/open-data mirror | public_high_confidence_candidate | `https://data.humdata.org/dataset/nigeria-health-facilities` | `5d18a31c8a46053c5e7c5ed3d7138393b7ba6f9de9155bbf03c569f862659630` | 46,146 extracted for reconciliation only; 0 seeded | Row-level facility data with metadata source `e-health Africa`, dataset date 2020-10-06, and caveat pointing to Africa Open Data. Extracted as `candidate_not_seeded` because direct official HFR/NCDC access was unavailable from this environment. |

## Education Extraction Method

- Used the official NEMIS public CSV export endpoint by education level.
- Fetched Pre-primary (`school_type=1`), Junior Secondary (`school_type=3`), and Senior Secondary (`school_type=4`) through national exports.
- The Primary national export (`school_type=2`) returned HTTP 500; Primary schools were therefore extracted through the same official endpoint with LGA filters and cached responses.
- Extraction was implemented in `infra/db/seed/scripts/extract_s06_nemis_schools.py` with 16-thread LGA partitioning, retry/caching behavior, and resume support.
- Three HTML-error/no-state rows were rejected before canonicalization.

## Education Reconciliation Method

- Canonical dedupe key: official NEMIS `school_code`.
- Place reconciliation source: canonical S01/S03 `places` state and LGA seeds parsed from `nigeria_states.sql` and `0002_lgas.sql`.
- Resolution order: exact state/LGA match, explicit alias map, then conservative fuzzy LGA match at threshold >= 0.88.
- Remaining unresolved records are not seeded when the source LGA cannot be mapped to one canonical LGA without guessing.

## Health Source Status

| Dataset | Current status | Notes |
|---|---|---|
| Nigeria Health Facility Registry | Blocked for seeding | Direct HFR download/API access from the Replit network timed out; alternate `hfr.health.gov.ng` paths have a hostname certificate mismatch and return current FMoH WordPress 404 pages when bypassed. Alternative official exports, authenticated/manual files, or owner approval of a mirror are required before seeding. |
| NHIA/NHIS accredited facilities | Seeded as scoped official batch | Official NHIA HCP table produced 6,539 provider organizations/profiles. Coverage is NHIA-accredited participating providers only and state-level location only. |
| NPHCDA PHC lists | Pending | Must be reconciled carefully with HFR to avoid double-counting PHCs. |
| PCN/MDCN/NMCN/MLSCN registers | Pending | Professional/facility seeding requires row-level official or regulator-published identifiers. |
| HDX/eHealth Africa health facilities mirror | Candidate extracted, not seeded | 46,146 rows extracted; 45,652 resolved to canonical LGAs; 494 unresolved. Useful for reconciliation and fallback analysis, but not seed-authoritative without official confirmation or owner approval. |

## Output Files

- `infra/db/seed/scripts/extract_s06_nemis_schools.py`
- `infra/db/seed/scripts/generate_s06_nemis_schools_sql_stream.py`
- `infra/db/seed/sources/s06_nemis_schools_extraction_report_20260421.json`
- `infra/db/seed/sources/s06_nemis_schools_normalized_20260421.json`
- `infra/db/seed/sources/s06_nemis_schools_reconciliation_20260421.json`
- `infra/db/migrations/0307_education_nemis_schools_seed.sql`
- `apps/api/migrations/0307_education_nemis_schools_seed.sql`
- `infra/db/seed/0008_nemis_schools.sql`
- `docs/reports/phase-s06-education-nemis-schools-report-2026-04-21.md`
- `infra/db/seed/scripts/extract_s06_health_facilities_hdx_candidate.py`
- `infra/db/seed/scripts/generate_s06_nhia_hcp_sql.py`
- `infra/db/seed/sources/s06_health_facilities_hdx_ehealth_candidate_20260421.csv`
- `infra/db/seed/sources/s06_health_facilities_hdx_ehealth_candidate_normalized_20260421.json`
- `infra/db/seed/sources/s06_health_facilities_hdx_ehealth_candidate_report_20260421.json`
- `infra/db/seed/sources/s06_nhia_hcp_raw_20260421.json`
- `infra/db/seed/sources/s06_nhia_hcp_normalized_20260421.json`
- `infra/db/seed/sources/s06_nhia_hcp_report_20260421.json`
- `infra/db/migrations/0308_health_nhia_hcp_seed.sql`
- `apps/api/migrations/0308_health_nhia_hcp_seed.sql`
- `infra/db/seed/0009_nhia_hcp.sql`
- `docs/reports/phase-s06-health-source-research-report-2026-04-21.md`
