# Phase S06 Health Source Research Report

## Objective

Continue Phase S06 after the NEMIS education batch by locating row-level health registry sources for hospitals, clinics, PHCs, pharmacies, and licensed health professionals. The governing rule remains: do not seed health rows from estimates or non-row-level aggregates.

## Result

One official health seed batch was generated after additional regulator research found NHIA's public participating health-care-provider table. Migration `0308_health_nhia_hcp_seed.sql` seeds 6,539 official NHIA-accredited provider organizations/profiles from 6,540 source rows after merging one exact duplicate. Direct HFR/NCDC bulk access remains blocked, and the HDX/eHealth Africa health-facility dataset remains `candidate_not_seeded`.

## Official Endpoint Attempts

| Source | Attempted access | Result | Seeding decision |
|---|---|---|---|
| Nigeria HFR public portal | `https://www.hfr.health.gov.ng/download/facilities` | Timed out from this environment. | Not seeded. |
| Nigeria HFR alternate host | `https://hfr.health.gov.ng/download/facilities` | Hostname certificate mismatch; with certificate bypass the endpoint returned the current FMoH WordPress site 404, not HFR data. | Not seeded. |
| Nigeria HFR hospitals page | `https://www.hfr.health.gov.ng/facilities/hospitals-list?page=1` | Timed out from this environment. | Not seeded. |
| Nigeria HFR alternate hospitals page | `https://hfr.health.gov.ng/facilities/hospitals-list?page=1` | Hostname certificate mismatch; with certificate bypass returned FMoH WordPress 404. | Not seeded. |
| NCDC Data Portal | `https://dataportal.ncdc.gov.ng/dataset/national-health-facility-registry` and CKAN API variants | Timed out or 504 through available access paths. | Not seeded. |
| NHIA/NHIS accredited facilities | `https://www.nhia.gov.ng/hcps/` exposes an official public web table backed by a Ninja Tables AJAX JSON endpoint. | Seeded as scoped NHIA-accredited provider batch; state-only place resolution from NHIA provider-code prefix. |
| NHIA HMO list | `https://www.nhia.gov.ng/hmo/` exposes HMO rows, but this is insurer/administrator data, not facility seed data for the current batch. | Deferred to regulated financial/insurance or later health-administration batch. |
| NPHCDA PHC lists | Search found dashboard/interactive references, but `https://nphcda.gov.ng/facility-view/` returned a current site 404 from this environment. | Pending. |
| PCN premises/pharmacist registers | Public search found verification portals, not a public bulk premises CSV. | Pending. |
| MDCN/NMCN professional registers | Public search found official portals and MDCN housemanship-training hospital PDFs, but not a complete public bulk professional/facility register export suitable for nationwide health seeding. | Pending. |

## Official NHIA HCP Seed Batch

| Field | Value |
|---|---|
| Source | NHIA Participating Health Care Providers |
| URL | `https://www.nhia.gov.ng/hcps/` |
| Embedded table title | `ACTIVEACCREDITED NHIA HEALTHCARE PROVIDER.csv` |
| Raw rows extracted | 6,540 |
| Seeded provider organizations/profiles | 6,539 |
| Exact duplicate rows merged | 1 |
| Rejected rows | 0 |
| Raw artifact SHA-256 | `a110aade29c855e1d2dee4ed40200b500abd5a0df86044e3fc7fb622c272fdd2` |
| Normalized artifact SHA-256 | `4472d203eb850d78f7c975178fdb6a61837ee60408d40539390cac097617b1a7` |
| Report SHA-256 | `36ad980bc8bd74ecb069bac593f6740bc32fceec0d2177619f287a28efffa01e` |
| Migration SHA-256 | `08e08d0099e6168ab45750098ea32663685f746a3f7f717f35495ddd61cb0ad2` |

### NHIA Reconciliation and Dedupe

- Source-backed identity: NHIA health-care-provider code where unique.
- Exact duplicate handling: one duplicate with the same provider code, normalized name, and normalized address was merged.
- Conflicting duplicate-code handling: duplicate codes with different names/addresses are split by source table row ID and documented in `seed_dedupe_decisions`.
- Place resolution: state only, using official NHIA provider-code prefixes such as `LA`, `FCT`, `KN`, etc. No LGA, ward, or coordinates were inferred from free-text addresses.
- Vertical mapping: rows are inserted as health-care facility organizations with `clinic_profiles`; facility subtype is conservatively classified from provider names (`hospital`, `clinic`, `maternity`, `laboratory`, `pharmacy`, `dental`, `optical`, or `others`).

### NHIA Seed Validation

SQLite validation against a minimal S00-S04/S06 schema confirmed:

| Check | Result |
|---|---:|
| Organizations inserted | 6,539 |
| Profiles inserted | 6,539 |
| Clinic profiles inserted | 6,539 |
| Search entries inserted | 6,539 |
| FTS rows rebuilt | 6,539 |
| Invalid search place references | 0 |
| Duplicate profile subjects | 0 |
| Profiles missing search entry | 0 |

## Candidate Dataset Extracted for Reconciliation Only

| Field | Value |
|---|---|
| Dataset | Nigeria: Health facilities |
| Accessible URL | `https://data.humdata.org/dataset/3b4a119a-309c-4d3f-900f-18a1f6ca2dfa/resource/4658aa59-0554-4fac-8473-377da4b7a0e9/download/nigeriahealthfacilities.csv` |
| Metadata API | `https://data.humdata.org/api/3/action/package_show?id=nigeria-health-facilities` |
| Metadata title | Nigeria: Health facilities |
| Metadata source | e-health Africa |
| Dataset date | 2020-10-06 |
| License | Creative Commons Attribution International (CC BY) |
| Caveat | Dataset extracted from `https://africaopendata.org/dataset/nigeria-health-care-facilities-primary-secondary-and-tertiary` |
| Rows extracted | 46,146 |
| CSV SHA-256 | `5d18a31c8a46053c5e7c5ed3d7138393b7ba6f9de9155bbf03c569f862659630` |
| Normalized JSON SHA-256 | `fe67ce7330e7f9573d822692c0f8ba389d0587a8f0cfdf99f20fc884493896f6` |
| Report SHA-256 | `9ee841107b9bb94008a70eba350a917a680c94057dceeea71547c1d34bde9f79` |
| Seed authorization | `candidate_not_seeded` |

## Candidate Reconciliation Summary

| Check | Count |
|---|---:|
| Candidate source rows | 46,146 |
| Rows resolved to canonical state/LGA | 45,652 |
| Rows unresolved | 494 |
| Duplicate source record IDs | 0 |

## Candidate Facility-Type Classification

| Facility type | Count |
|---|---:|
| Clinic | 37,372 |
| Maternity | 4,423 |
| Other / unclassified | 2,071 |
| Hospital | 2,025 |
| Laboratory | 234 |
| Pharmacy | 21 |

## Output Files

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

## Decision

This dataset is useful as a reconciliation candidate and fallback research artifact, but it should not be used to create WebWaka health seed rows unless one of the following happens:

1. Direct official HFR/NCDC access becomes available and confirms the same records or provides a current official export.
2. The project owner explicitly approves the HDX/eHealth Africa mirror as seed-authoritative despite it not being direct HFR/FMoH publication.
3. A regulator-published alternative row-level source is obtained for the specific health vertical being seeded.

The NHIA HCP dataset is an official regulator-published row-level source and has therefore been seeded as its own scoped batch. It does not replace HFR because it covers NHIA-accredited participating providers only and does not provide LGA/ward/coordinate precision.

## Next Step

Continue source acquisition in this priority order:

1. Obtain an official HFR/NCDC row-level export through an accessible endpoint or manually supplied file.
2. If HFR remains inaccessible, continue regulator-scoped batches only where official row-level sources are available, starting with NPHCDA PHCs, PCN premises, MLSCN laboratories, MDCN facilities/professionals, and NMCN professionals.
3. Keep PCN/MDCN/NMCN professional and pharmacy records pending until official bulk or verifiable registry extracts are available.
