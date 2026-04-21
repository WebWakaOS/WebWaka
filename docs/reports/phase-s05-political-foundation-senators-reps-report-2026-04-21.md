# Phase S05 — National Assembly Senators and Representatives Seed Report
**Date:** 2026-04-21
**Batch:** `national-assembly-senators-and-reps` (S05 batch 3)
**Migration:** `infra/db/migrations/0311_political_senators_reps_seed.sql`
**Generator:** `infra/db/seed/scripts/generate_s05_senators_reps_sql.py`
**Source:** National Assembly of Nigeria public legislators API (`https://nass.gov.ng/mps/get_legislators`)

## Summary

| Chamber | Expected (constitutional) | Reported by NASS API (`recordsTotal`) | Seeded | Deferred | Official source gap |
|---------|---------------------------|----------------------------------------|--------|----------|---------------------|
| Senate (chamber=1)            | 109 | 74  | 74  | 0 | 35 |
| House of Representatives (chamber=2) | 360 | 245 | 244 | 1 | 115 |
| **Total**                     | 469 | 319 | 318 | 1 | 150 |

**Decision:** Seed only the legislators that the official National Assembly public dataset actually publishes. The 35 senators and 115 representatives missing from the NASS portal are *not fabricated*; they remain `unseed` pending publication of an additional official source row. This satisfies the rule "Seed real source-backed entities; never fabricate."

## What was seeded
For each NASS-published legislator, the migration inserts (with `INSERT OR IGNORE`):
- `individuals` — split first/middle/last name from the NASS display name; `verification_state = source_verified`.
- `profiles` — subject_type=`individual`, `claim_state=seeded`, `publication_state=published`, `primary_place_id` = the resolved senatorial-district / federal-constituency place.
- `politician_profiles` — workspace=`workspace_platform_seed_discovery`, tenant=`tenant_platform_seed`, office=`senator|hor`, jurisdiction set, party FK to organizations seeded in S05 batch 1.
- `political_assignments` — bound to `term_ng_10th_national_assembly_2023_2027`; UNIQUE on (individual_id, jurisdiction_id, office_type) is honoured by deterministic SHA-256 stable IDs.
- `party_affiliations` — when the NASS row carries a known acronym; `is_primary=1`.
- `search_entries` — public visibility, ancestry path inherited from the resolved place; `search_fts` rebuilt at the end of the migration.

Provenance tables populated: `seed_runs`, `seed_sources`, `seed_raw_artifacts` (raw + normalized + report), `seed_dedupe_decisions` (canonical key = `nass:<chamber>:<mp_id>`), `seed_ingestion_records`, `seed_identity_map`, `seed_place_resolutions`, `seed_entity_sources`, `seed_enrichment`, `seed_search_rebuild_jobs`.

## Source artifacts
- Raw: `infra/db/seed/sources/s05_nass_legislators_raw_20260421.json`
- Normalized: `infra/db/seed/sources/s05_nass_legislators_normalized_20260421.json`
- Report: `infra/db/seed/sources/s05_nass_legislators_report_20260421.json`

Each artifact's SHA-256 content hash is recorded in `seed_raw_artifacts`. `seed_sources.source_hash` mirrors the raw artifact hash.

## Place resolution
Senatorial-district and federal-constituency rows from `infra/db/migrations/0303_jurisdiction_seed.sql` were grouped by their parent `place_state_*` and matched to NASS `(state, district)` labels in the following order:
1. Exact normalized-name match within state pool.
2. Manual alias map for known NASS↔INEC orthographic variants (e.g., `Nassarawa` → `Nasarawa`, `Opke` → `Okpe`).
3. Token Jaccard / containment scoring with a strict uniqueness gate (best ≥ 0.5 with ≥ 0.1 margin over second, or best ≥ 0.7 absolute, or unique-best with ≥ 0.4 containment when no other candidate has any token overlap).
4. Anything still ambiguous is `deferred` with the best/second scores recorded.

Place-decision distribution (rounded):
- exact: 229
- fuzzy ≥ 0.70: 62 (mostly orthographic variants and accent/whitespace differences)
- fuzzy ≥ 0.50 with margin: 12
- fuzzy unique-best: 8
- deferred: 1 (`reps Katsina | Katsina North Central` — appears to be a NASS data-entry error labelling a senate district as a federal constituency).

## Party resolution
NASS party acronyms map directly to the 21 INEC parties seeded in S05 batch 1 (e.g., `APC` → `org_political_party_apc`). Party counts in the seeded set:

```
APC=172, PDP=107, LP=19, NNPP=9, APGA=4, SDP=3, YPP=2, ADP=1, (blank)=1
```

Rows with a blank or unmapped party are still seeded as individuals/profiles/politician_profiles/political_assignments (party_id=NULL) but no `party_affiliations` row is created.

## Term
All seeded assignments use the existing term `term_ng_10th_national_assembly_2023_2027` (start `2023-06-13`, end `2027-06-12`) created in `infra/db/migrations/0305_political_foundation_seed.sql`.

## Outstanding gap (documented, not seeded)
The NASS legislators API itself omits 35 senators and 115 representatives. We deliberately do not invent these rows. Follow-on options for the full 109/360 roster:
- Re-fetch the NASS API on a future date once additional officeholders are published.
- Extract from the official `senate.gov.ng` "Distinguished Senators" page once it returns to HTTP 200 (currently 503).
- Cross-load the official 2023 INEC final-list-of-candidates PDF (`https://www.inecnigeria.org/wp-content/uploads/2024/04/Final-List-of-Candidates-for-National-Elections-1.pdf`) to seed *candidate_records* and reconcile winners.

Each option will become a new S05 batch with its own `seed_run`, `seed_source`, and dedupe reconciliation against this batch's `nass:<chamber>:<mp_id>` canonical keys.

## Idempotency and re-runs
- All IDs derive from `sha256("nass:<chamber>:<mp_id>")` truncated to 24 hex chars; re-running the script regenerates the same rows.
- `INSERT OR IGNORE` ensures repeated migration application is a no-op.
- The `political_assignments` UNIQUE (`individual_id`, `jurisdiction_id`, `office_type`) constraint added in `0007a_political_assignments_constraint.sql` is satisfied by the canonical mapping.
