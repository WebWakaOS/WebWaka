# Vertical Source Inventory

**Date:** 2026-04-25
**Status:** Authoritative
**Authority:** Produced as output of the STOP-AND-RECONCILE vertical taxonomy audit
**Companion:** `docs/reports/vertical-taxonomy-reconciliation-report-2026-04-25.md`

This document inventories every vertical-related source file identified in the repository during the taxonomy reconciliation audit. For each source, it records the path, type, item count, and canonical classification role.

---

## Classification Legend

| Role Code | Meaning |
|---|---|
| `PRIMARY_CANONICAL` | Single source of truth — governs the canonical vertical list |
| `SCHEMA_CANONICAL` | Defines the database schema for verticals |
| `DERIVED_SEED` | Seeded from the canonical CSV; consistent with it |
| `SYNONYM_MAP` | Documents alias and overlap relationships |
| `RUNTIME_IMPL` | Implementation code — must follow canonical slugs |
| `AI_BILLING_CONFIG` | AI billing and capability config — NOT canonical classification |
| `PLANNING_DOC` | Planning/governance doc — may contain stale data |
| `HISTORICAL_BASELINE` | Historical priority reference — not a separate taxonomy |
| `DERIVED_REPORT` | Report generated from other sources — may be stale |
| `EXTENSION_MIGRATION` | Adds columns or data to the verticals table after creation |
| `POST_CSV_ADDITION` | Vertical added to DB after CSV was last updated |
| `DEFECTIVE` | Contains known errors; requires corrective action |
| `INVALID_CANONICAL` | Must NOT be used as canonical source despite vertical references |

---

## A. Seed and Data Sources

### A1. `infra/db/seeds/0004_verticals-master.csv`

| Attribute | Value |
|---|---|
| Type | CSV seed file |
| Lines | 160 (1 header + 159 data rows) |
| Item count | **159 canonical verticals** |
| Role | **PRIMARY_CANONICAL** |
| Status | Authoritative |

**What it defines:**
- `id` — unique vertical ID (e.g. `vtx_restaurant`)
- `slug` — canonical runtime slug (e.g. `restaurant`)
- `display_name` — human-readable name
- `category` — one of 14 categories
- `subcategory` — finer classification within category
- `priority` — 1/2/3 (P1-Original, P2 High-Fit, P3 Medium)
- `status` — `planned` | `active` | `deprecated`
- `entity_type` — `individual` | `organization` | `place` | `offering`
- `fsm_states` — JSON array of FSM lifecycle states
- `required_kyc_tier` — 0/1/2/3
- `requires_frsc`, `requires_cac`, `requires_it`, `requires_community`, `requires_social` — boolean flags
- `package_name` — target package path (e.g. `packages/verticals-restaurant`)
- `milestone_target` — implementation milestone (e.g. `M9`)
- `notes` — free-text notes

**Known issues:**
- 5 rows have `package_name` fields that use package alias names (e.g. `packages/verticals-newspaper-dist`) instead of slug-matching names (see synonym map)
- Does not yet contain `bank-branch` (added to DB via migration 0339)
- `social` category is defined in TypeScript types but no CSV rows use it
- Count discrepancy vs. some planning docs (which say 160) — the "160" references are stale errors

---

### A2. `infra/db/seed/0004_verticals.sql`

| Attribute | Value |
|---|---|
| Type | Generated SQL seed file |
| Item count | 159 idempotent INSERT OR IGNORE statements |
| Role | DERIVED_SEED |
| Status | Consistent with CSV |

Generated during Phase S02. Idempotent (`INSERT OR IGNORE`) SQL version of the CSV for direct DB loading.

---

## B. Migration Sources

### B1. `infra/db/migrations/0036_verticals_table.sql`

| Attribute | Value |
|---|---|
| Type | SQL migration |
| Role | SCHEMA_CANONICAL |
| Status | Authoritative schema definition |

Creates the `verticals` table with all columns and constraints. The category `CHECK` constraint is the authoritative list of valid categories:
`'politics','transport','civic','commerce','health','education','professional','creator','place','financial','agricultural','media','institutional','social'`

---

### B2. `infra/db/migrations/0037_verticals_primary_pillars.sql`

| Attribute | Value |
|---|---|
| Type | SQL migration (ALTER + UPDATE) |
| Role | EXTENSION_MIGRATION + **DEFECTIVE** |
| Status | Contains 6 slug mismatches (silent failures) |

Adds `primary_pillars` column and sets it per vertical. **6 UPDATE statements reference non-canonical slugs and silently fail:**

| Wrong Slug in Migration | Correct CSV Slug | Impact |
|---|---|---|
| `photography-studio` | `photography` | `photography` keeps default `["ops","marketplace"]` |
| `dental` | `dental-clinic` | `dental-clinic` keeps default |
| `vet` | `vet-clinic` | `vet-clinic` keeps default |
| `vocational` | `training-institute` | `training-institute` keeps default (no `vocational` slug exists) |
| `mobile-money` | `mobile-money-agent` | `mobile-money-agent` keeps default |
| `bdc` | `bureau-de-change` | `bureau-de-change` keeps default |

**Required action:** Create corrective migration to apply correct `primary_pillars` for these 6 verticals using canonical slugs.

---

### B3. `infra/db/migrations/0047_workspace_verticals.sql`

| Attribute | Value |
|---|---|
| Type | SQL migration |
| Role | RUNTIME_IMPL |
| Status | Correct — not a vertical classification source |

Creates the `workspace_verticals` table: the FSM activation record for each (workspace, vertical) pair. Uses `vertical_slug TEXT NOT NULL REFERENCES verticals(slug)` — references canonical slugs correctly.

---

### B4. `infra/db/migrations/0055_commerce_verticals.sql`

| Attribute | Value |
|---|---|
| Type | SQL migration |
| Role | RUNTIME_IMPL |
| Status | Commerce-specific extension — not a classification source |

Adds commerce-specific columns or tables for the commerce vertical subset. Not a vertical list.

---

### B5. `infra/db/migrations/0056_missing_vertical_tables.sql`

| Attribute | Value |
|---|---|
| Type | SQL migration |
| Role | DERIVED_SEED |
| Status | Remediation migration for profile tables |

Creates profile tables for verticals that were missing them. Not a classification source.

---

### B6. `infra/db/migrations/0057–0180_vertical_*.sql` (individual vertical migrations)

| Attribute | Value |
|---|---|
| Type | SQL migrations (individual vertical profile tables) |
| Count | 124 migration pairs (248 files including rollbacks) |
| Role | RUNTIME_IMPL |
| Status | Each creates one vertical profile table; not classification sources |

Each migration creates a dedicated profile table for one vertical (e.g. `auto_mechanic_profiles`, `bakery_profiles`, etc.). The migration name slug does not always match the canonical CSV slug:
- `0138_vertical_photography_studio.sql` creates `photography_studio_profiles` for canonical slug `photography`
- `0128_vertical_palm_oil.sql` creates `palm_oil_profiles` for canonical slug `palm-oil-trader`
- `0150_vertical_newspaper_dist.sql` creates `newspaper_dist_profiles` for canonical slug `newspaper-distribution`
- `0153_vertical_polling_unit.sql` creates for canonical slug `polling-unit-rep`
- See synonym map for the full alias mapping

---

### B7. `infra/db/migrations/0195_ai002_vertical_configs.sql`

| Attribute | Value |
|---|---|
| Type | SQL migration |
| Role | AI_BILLING_CONFIG |
| Status | AI configuration seeding — not canonical classification |

Seeds AI capability configurations for verticals into the database. Derived from `vertical-ai-config.ts`.

---

### B8. `infra/db/migrations/0302_vertical_registry_seed.sql`

| Attribute | Value |
|---|---|
| Type | SQL migration |
| Role | DERIVED_SEED + SYNONYM_MAP |
| Status | Authoritative synonym map; consistent with CSV |

Creates and seeds:
- Idempotent vertical registry INSERT statements (159 rows)
- `vertical_synonyms` table — documents alias and overlap relationships (14 rows at creation)
- `vertical_seedability_matrix` table — marks profile table readiness per vertical (159 rows)

The `vertical_synonyms` table is the authoritative alias registry. All future aliases must be added here.

---

### B9. `infra/db/migrations/0322_vertical_marketplace.sql`

| Attribute | Value |
|---|---|
| Type | SQL migration |
| Role | RUNTIME_IMPL |
| Status | Marketplace extension — not a classification source |

---

### B10. `infra/db/migrations/0324_vertical_capital_market_operator.sql`

| Attribute | Value |
|---|---|
| Type | SQL migration |
| Role | RUNTIME_IMPL (profile table only) |
| Status | Creates `capital_market_operator_profiles` table — does NOT insert into `verticals` table |

`capital-market-operator` is NOT yet a registered canonical vertical. It has a profile table but no `verticals` table row and no CSV entry.

---

### B11. `infra/db/migrations/0326_vertical_restaurant.sql`

| Attribute | Value |
|---|---|
| Type | SQL migration |
| Role | RUNTIME_IMPL (update/extension) |
| Status | Updates restaurant vertical — not a classification source |

---

### B12. `infra/db/migrations/0331_vertical_pharmacy_supermarket_cooperative.sql`

| Attribute | Value |
|---|---|
| Type | SQL migration |
| Role | DERIVED_SEED (creates profile tables for pharmacy, supermarket, cooperative) |
| Status | Adds profile tables; canonical slugs already in CSV |

---

### B13. `infra/db/migrations/0339_vertical_bank_branch.sql`

| Attribute | Value |
|---|---|
| Type | SQL migration |
| Role | POST_CSV_ADDITION |
| Status | Inserts `bank-branch` into `verticals` table — this vertical IS in the database but NOT in the CSV |

`bank-branch` has `INSERT OR IGNORE INTO verticals` with a complete record. It must be added to `0004_verticals-master.csv`.

---

## C. Package Sources

### C1. `packages/verticals-*/` (159 directories)

| Attribute | Value |
|---|---|
| Type | TypeScript package directories |
| Count | 159 packages |
| Role | RUNTIME_IMPL |
| Status | Must reference canonical CSV slugs; 5 known name divergences |

Each package contains the runtime implementation for one canonical vertical. Package directory names must match canonical CSV slugs — 5 currently diverge (see synonym map).

---

### C2. `packages/verticals/src/types.ts`

| Attribute | Value |
|---|---|
| Type | TypeScript types |
| Role | SCHEMA_CANONICAL (TypeScript layer) |
| Status | Authoritative type definitions |

Defines: `VerticalCategory`, `VerticalPriority`, `VerticalEntityType`, `VerticalStatus`, `BaseVerticalState`, `VerticalRecord`, `VerticalFSMDefinition`, `VerticalFSMTransition`, `VerticalEntitlements`, `VerticalActivationContext`, `VerticalLookupResult`.

The `VerticalCategory` union type is the TypeScript equivalent of the SQL `CHECK` constraint.

---

### C3. `packages/superagent/src/vertical-ai-config.ts`

| Attribute | Value |
|---|---|
| Type | TypeScript configuration |
| Role | AI_BILLING_CONFIG — **INVALID_CANONICAL** |
| Status | Valid for AI billing; NOT valid for vertical classification |

**What it is:** Per-vertical AI capability grants and billing category tags. Each entry has a `primaryPillar: 1 | 2 | 3` (simplified integer billing tag) and `allowedCapabilities` / `prohibitedCapabilities` arrays.

**What it is NOT:** Canonical pillar classification, canonical vertical list, or canonical slug authority.

**Known issues:**
- Contains a deprecated aliases section at the bottom (slugs: `mass-transit`, `hospital`, `artisan`)
- Declares `transit` as the canonical slug for the mass-transit vertical — this CONTRADICTS the CSV which has `mass-transit` as canonical. This is an unresolved governance conflict.
- Item count: 159 active entries + 3 deprecated aliases = 162 total keys

---

### C4. `packages/vertical-events/`

| Attribute | Value |
|---|---|
| Type | Package |
| Role | RUNTIME_IMPL (shared event system) |
| Status | Cross-vertical event publishing — not a vertical itself |

Not a canonical vertical. Provides the shared event bus for all vertical implementations.

---

## D. Governance and Planning Documents

### D1. `docs/governance/3in1-platform-architecture.md`

| Role | PLANNING_DOC — canonical pillar definitions |
| Vertical count stated | Not specified; references "verticals" generically |
| Canonical for? | Pillar definitions — NOT vertical list |

---

### D2. `docs/governance/verticals-master-plan.md`

| Role | PLANNING_DOC — stale count |
| Vertical count stated | 160 (STALE — should be 159) |
| Priority breakdown | P1=17, P2=~80, P3=~63 (planning estimates, not exact) |
| Canonical for? | Nothing — planning artifact only |

**Required update:** Change "160" to "159" throughout.

---

### D3. `docs/planning/m8-phase0-original-verticals.md`

| Role | HISTORICAL_BASELINE |
| Vertical count stated | 17 P1-Original verticals |
| Date | 2026-04-09 |
| Canonical for? | Priority baseline only; the 17 are canonical verticals within the 159 |

---

### D4. `docs/reports/phase-s02-vertical-registry-completion-report-2026-04-21.md`

| Role | DERIVED_REPORT |
| Vertical count stated | 159 (correctly reconciled) |
| Canonical for? | S02 completion record only |

---

### D5. `docs/reports/webwaka-master-seed-inventory-2026-04-21.md`

| Role | DERIVED_REPORT |
| Vertical count stated | 159 (reconciled from original 160) |
| Canonical for? | Seed inventory only |

---

### D6. `docs/planning/nationwide-entity-seeding-implementation-plan-2026-04-21.md`

| Role | PLANNING_DOC |
| Vertical references | References the 159-vertical registry as the seeding scope |
| Canonical for? | Seeding plan only |

---

### D7. `docs/templates/pillar2-niche-registry.json`

| Role | RUNTIME_IMPL (P2 niche registry) |
| Item count | 46 niche records |
| Canonical for? | Pillar 2 niche identities — NOT canonical verticals |

Each niche has a `verticalSlug` that must reference a canonical CSV slug.

---

## E. Apps API Vertical Routes

### E1. `apps/api/src/routes/verticals/` (directory)

| Attribute | Value |
|---|---|
| Type | TypeScript API route files |
| Count | ~159 route files (one per vertical) |
| Role | RUNTIME_IMPL |

API route handlers for each vertical. Follow the canonical slugs as route names. Not a classification source.

---

## Summary Table

| Source | Type | Item Count | Role | Canonical? |
|---|---|---|---|---|
| `0004_verticals-master.csv` | CSV | **159** | PRIMARY_CANONICAL | **YES** |
| `0004_verticals.sql` | SQL seed | 159 | DERIVED_SEED | Derived |
| `0036_verticals_table.sql` | Migration | schema | SCHEMA_CANONICAL | YES (schema) |
| `0037_verticals_primary_pillars.sql` | Migration | 6 slug errors | EXTENSION_MIGRATION + DEFECTIVE | Partially |
| `0047_workspace_verticals.sql` | Migration | — | RUNTIME_IMPL | No |
| `0302_vertical_registry_seed.sql` | Migration | 159 + 14 synonyms | DERIVED_SEED + SYNONYM_MAP | Derived |
| `0324_vertical_capital_market_operator.sql` | Migration | 0 (no verticals INSERT) | RUNTIME_IMPL | No |
| `0339_vertical_bank_branch.sql` | Migration | 1 (bank-branch) | POST_CSV_ADDITION | Needs CSV update |
| `packages/verticals-*/` | Packages | 159 | RUNTIME_IMPL | No |
| `packages/verticals/src/types.ts` | TypeScript | 14 categories | SCHEMA_CANONICAL (TS) | YES (types) |
| `packages/superagent/src/vertical-ai-config.ts` | TypeScript | 159 + 3 deprecated | AI_BILLING_CONFIG | **NO** |
| `docs/governance/verticals-master-plan.md` | Doc | 160 (stale) | PLANNING_DOC | No |
| `docs/planning/m8-phase0-original-verticals.md` | Doc | 17 | HISTORICAL_BASELINE | No |
| `docs/templates/pillar2-niche-registry.json` | JSON | 46 niches | RUNTIME_IMPL | No |

---

*Last updated: 2026-04-25*
*Source: STOP-AND-RECONCILE vertical taxonomy audit*
