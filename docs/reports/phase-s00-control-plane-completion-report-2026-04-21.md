# Phase S00 Completion Report — Seeding Control Plane and Provenance Foundation

## Objective

Create the auditable control-plane foundation required before any nationwide entity data is seeded.

## Implemented Outputs

| Output | Location | Status |
|---|---|---|
| Platform seed tenant strategy | `tenant_platform_seed` | Implemented in migration 0301 |
| Platform seed organization | `org_platform_seed` | Implemented in migration 0301 |
| Platform seed discovery workspace | `workspace_platform_seed_discovery` | Implemented in migration 0301 |
| Seed run tracking | `seed_runs` | Implemented in migration 0301 |
| Source registry | `seed_sources` | Implemented in migration 0301 |
| Raw/extracted artifact tracking | `seed_raw_artifacts` | Implemented in migration 0301 |
| Dedupe decision tracking | `seed_dedupe_decisions` | Implemented in migration 0301 |
| Entity-to-source provenance | `seed_entity_sources` | Implemented in migration 0301 |
| Rich sidecar enrichment | `seed_enrichment` | Implemented in migration 0301 |
| Coverage snapshots | `seed_coverage_snapshots` | Implemented in migration 0301 |
| Source manifest template | `docs/planning/nationwide-seeding-source-manifest-template-2026-04-21.md` | Implemented |
| Rollback/correction policy | This report | Implemented |

## Migration Files

| File | Purpose |
|---|---|
| `infra/db/migrations/0301_seed_control_plane.sql` | Primary S00 control-plane migration |
| `infra/db/migrations/0301_seed_control_plane.rollback.sql` | Rollback for S00 control-plane migration |
| `apps/api/migrations/0301_seed_control_plane.sql` | Mirrored API migration copy |
| `apps/api/migrations/0301_seed_control_plane.rollback.sql` | Mirrored API rollback copy |

## Control-Plane IDs

| Record | ID |
|---|---|
| Tenant | `tenant_platform_seed` |
| Organization | `org_platform_seed` |
| Workspace | `workspace_platform_seed_discovery` |
| Bootstrap seed run | `seed_run_s00_control_plane_20260421` |
| Bootstrap source | `seed_source_webwaka_s00_plan_20260421` |

## Source Confidence Taxonomy

| Confidence | Intended use |
|---|---|
| `official_verified` | Current regulator, government, commission, association, or internal canonical source |
| `official_stale` | Official source whose publication date may be old or superseded |
| `public_high_confidence` | Public directory, map source, official website, or reputable public listing |
| `field_partner_collected` | Field, partner, or direct-submission source requiring collector metadata |
| `market_estimate_placeholder` | Planning-only estimate; must not become a published real entity |

## Rollback and Correction Policy

1. For a failed S00 deployment, run `0301_seed_control_plane.rollback.sql` before retrying.
2. For later bad seed batches, do not delete unrelated provenance records. Mark the related `seed_runs.status` as `failed` or `rolled_back` and insert corrective dedupe/source records in a new run.
3. Published entity corrections must preserve original source provenance and record the superseding source or manual decision.
4. Any source later found stale or superseded must be updated in `seed_sources.freshness_status` and linked records must be reviewed before refresh.
5. Market-estimate sources must remain planning-only and must never create real profiles without a named source or field record.

## Acceptance Checks

| Check | Status |
|---|---|
| A seed tenant and seed workspace strategy is documented and implemented | Complete |
| Every future seed row can reference a source, run, confidence score, and dedupe decision | Complete |
| A standard source manifest template exists | Complete |
| A standard phase completion report template exists | Complete via the master plan and this report structure |
| A rollback/correction policy exists for bad seed batches | Complete |

## Next Phase

Proceed to Phase S01 only after migration 0301 is applied successfully in the target environment. S01 must reconcile `infra/db/seed/0003_wards.sql` against the INEC 8,809 ward/registration-area target before political, polling-unit, or profile seeding begins.
