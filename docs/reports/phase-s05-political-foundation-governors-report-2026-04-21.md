# Phase S05 — State Governors and Deputy Governors Seed Report
**Date:** 2026-04-21
**Batch:** `state-governors-and-deputies` (S05 batch 4)
**Migration:** `infra/db/migrations/0312_political_governors_seed.sql` (mirrored to `apps/api/migrations/0312_political_governors_seed.sql` and `infra/db/seed/0013_political_governors.sql`, byte-identical, SHA-256 `d807865d2298b1459a20bcbb4ee8f9102adeedb382ff6526f351d713ecffcca9`)
**Generator:** `infra/db/seed/scripts/generate_s05_governors_deputies_sql.py`

## Summary

| Office | Expected | Seeded | Deferred | Source confidence |
|--------|----------|--------|----------|-------------------|
| State Governors        | 36 | 36 | 0 | `official_verified` (NGF cross-confirmed) + `editorial_verified` (Wikipedia) |
| Deputy Governors       | 36 | 36 | 0 | `editorial_verified` (Wikipedia) |
| **Total individuals**  | 72 | **72** | **0** | — |

**Decision:** Seed all 36 governors and 36 deputy governors after cross-validating every governor name from the canonical Wikipedia state-governor table against the official Nigeria Governors' Forum (NGF) public listing. No row is fabricated. Where a state's term ends in a non-2027 year (off-cycle), an explicit `terms` row is created in this migration with start/end ISO dates derived from the Wikipedia table. The remaining 28 on-cycle states reuse `term_ng_state_executive_general_2023_2027` from S05 batch 1.

## Sources

| Role | Source | URL | Confidence | Why |
|------|--------|-----|------------|-----|
| Authority for governor names (cross-validation) | Nigeria Governors' Forum public governors page | https://nggovernorsforum.org/index.php/the-ngf/governors | `official_verified` | NGF is the constitutional, officially-recognised body of all 36 state governors and publishes their names directly. |
| Authority for deputy governor / party / term-year | Wikipedia: *List of current state governors in Nigeria* (English) | https://en.wikipedia.org/wiki/List_of_current_state_governors_in_Nigeria | `editorial_verified` | No consolidated official register publishes deputy-governor names, party affiliations, and term years in machine-readable form across all 36 states; each state portal is heterogeneous. The Wikipedia table is the only complete, citable, machine-parseable source. |

Both sources are recorded with their fetch hashes in `seed_sources` and the cached fixtures live under `infra/db/seed/sources/s05_batch4_research/`.

## What was seeded
For each (state × {governor, deputy_governor}), the migration inserts (with `INSERT OR IGNORE`):
- `individuals` — split first/middle/last; governors `verification_state = source_verified`, deputies `editorial_verified`.
- `profiles` — subject_type=`individual`, `claim_state=seeded`, `publication_state=published`, `primary_place_id` = the resolved `place_state_*`.
- `politician_profiles` — workspace=`workspace_platform_seed_discovery`, tenant=`tenant_platform_seed`, office=`governor|deputy_governor`, jurisdiction set, party FK to organizations seeded in S05 batch 1.
- `political_assignments` — bound to the term row (off-cycle term per state, or `term_ng_state_executive_general_2023_2027` for on-cycle).
- `party_affiliations` — `is_primary=1`, party FK to S05-batch-1 organization (`org_political_party_<acronym_lower>`).
- `search_entries` — public visibility, ancestry path inherited from the state place; `search_fts` rebuilt at the end of the migration.

Provenance tables populated: `seed_runs`, `seed_sources` (NGF + Wikipedia, two rows), `seed_raw_artifacts` (raw + normalized + report), `seed_dedupe_decisions` (canonical key = `wp:state-governors:<state>:<office>:<normalised-name>`), `seed_ingestion_records`, `seed_identity_map`, `seed_place_resolutions`, `seed_entity_sources` (governors get two rows — NGF + Wikipedia; deputies get one — Wikipedia), `seed_enrichment`, `seed_search_rebuild_jobs`.

## Source artifacts
- Raw: `infra/db/seed/sources/s05_state_governors_raw_20260421.json` — full Wikipedia parse-API JSON plus the NGF (state, name) pairs.
- Normalized: `infra/db/seed/sources/s05_state_governors_normalized_20260421.json` — 72 individual records plus the cross-validation result for each state.
- Report: `infra/db/seed/sources/s05_state_governors_report_20260421.json` — extractor counts, party distribution, off-cycle terms, decision rationale.

Each artifact's SHA-256 content hash is recorded in `seed_raw_artifacts`. `seed_sources.source_hash` mirrors the upstream document hash for both sources.

## Cross-validation
Every governor name from the Wikipedia table was compared to the NGF listing for the same state:

| Status | Count | Meaning |
|--------|------:|---------|
| `matched_exact` | 23 | Identical after honorific stripping and lowercase normalisation. |
| `matched_overlap` | 13 | Differ only in honorifics or middle-name presence (e.g. NGF "Pastor Umo Eno" vs WP "Umo Eno"; NGF "Engr. Prof. Babagana Umara Zulum" vs WP "Babagana Umara Zulum"). Token Jaccard ≥ 0.5. |
| `name_diverges` | 0 | None. |

Every cross-validation outcome is preserved verbatim in `seed_enrichment.enrichment_json` for downstream audit.

## Place resolution
State names from the Wikipedia table resolve directly to the 37 state-level places (36 states + FCT) in `0303_jurisdiction_seed.sql` via an exact lower-cased lookup. All 72 individuals have a `seed_place_resolutions` row at `resolution_level = 'state'`, `confidence = 'official_verified'`, `status = 'resolved'`.

## Party resolution
Wikipedia `{{party name with colour|...}}` template names map to the 21 INEC parties seeded in S05 batch 1. Party-affiliation distribution (per individual; 2 individuals per state):

```
APC=62, PDP=4, LP=2, APGA=2, A (Accord)=2     (total = 72)
```

## Term resolution
Eight states are off-cycle (governor's term does not coincide with the 2023→2027 federal cycle). Each has its own term row inserted by this migration:

| State | Term ID | Start | End |
|-------|---------|-------|-----|
| Anambra | `term_ng_state_executive_anambra_2022_2026` | 2022-05-29 | 2026-05-28 |
| Bayelsa | `term_ng_state_executive_bayelsa_2020_2028` | 2020-05-29 | 2028-05-28 |
| Edo     | `term_ng_state_executive_edo_2024_2028`     | 2024-05-29 | 2028-05-28 |
| Ekiti   | `term_ng_state_executive_ekiti_2022_2026`   | 2022-05-29 | 2026-05-28 |
| Imo     | `term_ng_state_executive_imo_2020_2028`     | 2020-05-29 | 2028-05-28 |
| Kogi    | `term_ng_state_executive_kogi_2024_2028`    | 2024-05-29 | 2028-05-28 |
| Ondo    | `term_ng_state_executive_ondo_2023_2029`    | 2023-05-29 | 2029-05-28 |
| Osun    | `term_ng_state_executive_osun_2022_2026`    | 2022-05-29 | 2026-05-28 |

Term start/end years are taken verbatim from the Wikipedia "Took office" / "Term End" columns; ISO dates use the Nigerian inauguration convention (`MM-DD = 05-29` for start, `05-28` for end). The remaining 28 states reuse `term_ng_state_executive_general_2023_2027` (start `2023-05-29`, end `2027-05-28`) created in S05 batch 1.

## Idempotency and re-runs
- All IDs derive from `sha256("wp:state-governors:<state>:<office_type>:<normalised-name>")` truncated to 24 hex chars; re-running the generator regenerates the same SQL byte-for-byte.
- `INSERT OR IGNORE` ensures repeated migration application is a no-op (validated in a stub-schema sqlite3 harness: second apply produces identical row counts).
- Off-cycle term rows are emitted with `INSERT OR IGNORE INTO terms`, so they do not conflict with the existing batch-1 general term.

## Validation
The migration was syntactically validated against a stub schema in an in-memory sqlite3:
```
seed_run rows_extracted=36 rows_inserted=72 rows_rejected=0
individuals=72   profiles=72   politician_profiles=72
political_assignments=72   party_affiliations=72
terms (off-cycle)=8        search_entries=72
seed_entity_sources: 36 official_verified (NGF, governors only) + 72 editorial_verified (WP, both offices) = 108
seed_place_resolutions=72  seed_enrichment=72  seed_ingestion_records=72  seed_identity_map=72  seed_dedupe_decisions=72  seed_search_rebuild_jobs=1
2nd-apply (idempotency): individuals=72  search_entries=72
```

## Outstanding work (documented, not seeded)
- LGA chairs (774 across all 36 states) remain `unseed`. There is no consolidated national source. Each state's State Independent Electoral Commission (SIEC) publishes results separately and at different times. This will become a per-state batch (S05 batch 5+).
- State assembly members (~990 nationwide) remain `unseed`; same reason — no single national source. This will become a separate set of batches once sources are identified.
