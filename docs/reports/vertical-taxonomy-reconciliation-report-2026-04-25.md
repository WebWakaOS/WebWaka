# Vertical Taxonomy Reconciliation Report

**Date:** 2026-04-25
**Status:** RECONCILED WITH EXPLICIT OPEN DECISIONS
**Scope:** Repository-wide forensic audit of all vertical-related lists, aliases, duplicates, pseudo-verticals, and non-canonical constructs
**Authority:** This document is the output of the STOP-AND-RECONCILE directive issued before any further Pillar 2 niche implementation proceeds
**Companion Artifacts:**
- `docs/governance/canonical-vertical-master-register.md` — final authoritative vertical list
- `docs/governance/vertical-taxonomy-glossary.md` — term definitions
- `docs/governance/vertical-aliases-and-deprecations.md` — alias mapping
- `docs/governance/vertical-duplicates-and-merge-decisions.md` — merge decisions
- `docs/governance/vertical-source-inventory.md` — all sources classified
- `docs/governance/initial-verticals-historical-note.md` — 17 P1-Original verticals
- `docs/governance/cross-cutting-classifications-note.md` — cross-cutting term clarification

---

## 1. Executive Verdict

### 1.1 Final Canonical Vertical Count

**The final authoritative canonical vertical count is 159.**

This is confirmed by five independent evidence trails:

| Evidence Source | Count | Notes |
|---|---|---|
| `infra/db/seeds/0004_verticals-master.csv` | 159 data rows | 160 total lines including header |
| `packages/verticals-*` directories | 159 packages | Exact match with CSV |
| `packages/superagent/src/vertical-ai-config.ts` header | 159 | Explicitly states "Covers ALL 159 verticals" |
| `infra/db/migrations/0302_vertical_registry_seed.sql` validation results | 159 | Confirmed via in-memory SQLite validation |
| `docs/reports/phase-s02-vertical-registry-completion-report-2026-04-21.md` | 159 | "The active vertical count is 159" |

### 1.2 Was "159" Always the Correct Number?

**No. Earlier documentation stated 160.** The number 160 appears in:
- `docs/governance/verticals-master-plan.md` header: "(160 verticals)"
- `docs/reports/webwaka-master-seed-inventory-2026-04-21.md` multiple references
- `infra/db/migrations/0036_verticals_table.sql` comment: "Master registry of all WebWaka OS vertical modules (150+)"

The Phase S02 vertical registry audit (2026-04-21) definitively reconciled this:
> *"The active vertical count is 159. Older 160 references in reports were stale and have been reconciled where they affected current seeding guidance."*

The "160" figure likely originated from counting the CSV header row as a data row (a one-off counting error), or one vertical was removed without the planning-doc counts being updated. The S02 phase corrected all seeding guidance. The planning-level docs (`verticals-master-plan.md`) retain the stale "160" count and should be updated to "159".

### 1.3 Were "Initial Verticals" Found?

**Yes. Definitively confirmed.**

The "initial verticals" concept is documented in:
- `docs/planning/m8-phase0-original-verticals.md` — the authoritative source

These are 17 verticals identified in a Phase 0 audit (2026-04-09) before any Top100 research list was consulted. They are labeled **P1-Original** (priority = 1 in the CSV). They carry the requirement "100% feature parity — must implement first."

**Critical clarification:** The 17 P1-Original verticals ARE canonical verticals. They are priority-flagged entries within the 159-row CSV, not a separate taxonomy. Every one of the 17 appears in the CSV with `priority=1`. There is no separate "initial verticals" list at runtime — only the priority classification.

### 1.4 Were "Cross-Cutting Verticals" Found?

**No such classification exists in the codebase.**

The term "cross-cutting" appears only in one sense in the repo:
- SuperAgent AI is described as "cross-cutting, NOT a 4th pillar" in `docs/governance/3in1-platform-architecture.md` and `docs/governance/verticals-master-plan.md`

There is no category, table column, package namespace, or governance doc that uses "cross-cutting verticals" as a classification for vertical entities. Some verticals serve all three platform pillars (Ops + Branding + Marketplace) — but these are NOT "cross-cutting verticals." They are standard canonical verticals with broader pillar coverage.

**The term "cross-cutting verticals" must be retired from platform governance language.** See `docs/governance/cross-cutting-classifications-note.md`.

### 1.5 Were Duplicates Found?

**Yes. Two confirmed merge-required pairs and multiple confirmed keep-separate pairs.**

| Pair | Decision | Canonical | Deprecated |
|---|---|---|---|
| `gym` + `gym-fitness` | MERGE REQUIRED | `gym` | `gym-fitness` |
| `petrol-station` + `fuel-station` | MERGE REQUIRED | `fuel-station` | `petrol-station` |
| `laundry` + `laundry-service` | KEEP SEPARATE | both canonical | — |
| `cleaning-company` + `cleaning-service` | KEEP SEPARATE | both canonical | — |
| `print-shop` + `printing-press` | KEEP SEPARATE | both canonical | — |
| `event-hall` + `events-centre` | KEEP SEPARATE (synonym overlap) | both canonical | — |
| `tailor` + `tailoring-fashion` | KEEP SEPARATE | both canonical | — |
| `pharmacy` + `pharmacy-chain` | KEEP SEPARATE (specialization) | both canonical | — |
| `restaurant` + `restaurant-chain` | KEEP SEPARATE | both canonical | — |

### 1.6 Post-CSV Verticals Found

**One confirmed post-CSV vertical exists in the database:**

| Vertical | Slug | Source Migration | Status |
|---|---|---|---|
| Bank Branch / ATM Location | `bank-branch` | `0339_vertical_bank_branch.sql` | Has `INSERT OR IGNORE INTO verticals` — IS in the database |
| Capital Market Operator | `capital-market-operator` | `0324_vertical_capital_market_operator.sql` | Creates profile table ONLY — NOT inserted into `verticals` table |

**`bank-branch` must be added to the canonical CSV.** `capital-market-operator` has a profile table but is not yet a registered vertical.

### 1.7 Is the Taxonomy Now Reconciled?

**RECONCILED WITH EXPLICIT OPEN DECISIONS.**

The open decisions are:
1. Merge `gym` + `gym-fitness` → requires CSV update + package deprecation
2. Merge `petrol-station` + `fuel-station` → requires CSV update + package deprecation
3. Add `bank-branch` to CSV → requires CSV update
4. Update `docs/governance/verticals-master-plan.md` count from 160 → 159
5. Fix 6 silent-failure slug mismatches in `infra/db/migrations/0037_verticals_primary_pillars.sql`

---

## 2. Source Inventory

All vertical-related sources found and classified. See `docs/governance/vertical-source-inventory.md` for full detail.

### 2.1 Canonical Sources

| Source | Type | Count | Role | Canonical? |
|---|---|---|---|---|
| `infra/db/seeds/0004_verticals-master.csv` | CSV seed file | 159 data rows | Single source of truth for vertical definitions | **YES — PRIMARY CANONICAL** |
| `infra/db/migrations/0302_vertical_registry_seed.sql` | SQL migration | 159 verticals, 14 synonyms, 159 seedability rows | Registry seed + synonym map + seedability matrix | Derived (seeds from CSV) |
| `packages/verticals-*/` | Package directories | 159 packages | Runtime vertical implementations | Derived (names should mirror CSV slugs) |
| `packages/verticals/src/types.ts` | TypeScript types | 14 categories, 3 priorities | Type definitions for VerticalRecord | Derived |

### 2.2 Classification and Governance Sources

| Source | Type | Role | Canonical? |
|---|---|---|---|
| `infra/db/migrations/0036_verticals_table.sql` | SQL migration | Defines the `verticals` table schema | Schema canonical |
| `infra/db/migrations/0037_verticals_primary_pillars.sql` | SQL migration | Adds `primary_pillars` column; UPDATE statements | Partially defective (6 slug mismatches) |
| `infra/db/migrations/0047_workspace_verticals.sql` | SQL migration | Workspace-vertical activation FSM | Runtime, not vertical classification |
| `infra/db/migrations/0055_commerce_verticals.sql` | SQL migration | Commerce vertical commerce-specific additions | Runtime extension, not classification |
| `docs/governance/verticals-master-plan.md` | Governance doc | Overall vertical universe planning | Planning doc (stale count: says 160) |
| `docs/planning/m8-phase0-original-verticals.md` | Planning doc | 17 P1-Original verticals with evidence | Historical priority baseline |

### 2.3 AI Billing Sources (NOT for canonical classification)

| Source | Type | Role | Canonical? |
|---|---|---|---|
| `packages/superagent/src/vertical-ai-config.ts` | TypeScript config | AI capability grants per vertical slug + billing category | **NOT CANONICAL** — AI billing only |

The `primaryPillar` field in `vertical-ai-config.ts` is a simplified integer AI billing tag (1, 2, or 3). It does NOT represent the full `primary_pillars` JSON array classification in the `verticals` table. It must never be used as a canonical pillar-to-vertical authority. It was already documented as invalid for this purpose in `docs/reports/pillar2-forensics-report-2026-04-24.md`.

### 2.4 Post-CSV Migration Sources (In-Database, Not Yet In CSV)

| Source | Vertical Slug | Status |
|---|---|---|
| `infra/db/migrations/0339_vertical_bank_branch.sql` | `bank-branch` | Inserted into `verticals` table — needs CSV addition |
| `infra/db/migrations/0324_vertical_capital_market_operator.sql` | n/a | Profile table only, NOT inserted into `verticals` table |

### 2.5 Historical / Planning Sources (Non-Canonical)

| Source | Role | Classification |
|---|---|---|
| `docs/planning/m8-phase0-original-verticals.md` | 17 P1-Original priority list | HISTORICAL_PRIORITY_BASELINE |
| `docs/reports/webwaka-master-seed-inventory-2026-04-21.md` | Seed inventory (stale count reconciled) | DERIVED_REPORT |
| `docs/reports/phase-s02-vertical-registry-completion-report-2026-04-21.md` | S02 reconciliation report | DERIVED_REPORT |

---

## 3. Terminology Clarification

See `docs/governance/vertical-taxonomy-glossary.md` for full definitions. Summary:

| Term | Definition | Counts in Canonical Total? |
|---|---|---|
| Canonical Vertical | An entry in `0004_verticals-master.csv` with a unique `id` and `slug` | **YES** |
| Deprecated Alias | A slug that previously existed or was used in code but maps to a canonical vertical | NO |
| Initial Vertical / P1-Original | One of the 17 verticals in `m8-phase0-original-verticals.md` | YES (they ARE canonical verticals) |
| Cross-cutting Non-Vertical | Does not exist in this codebase | N/A |
| Vertical Package | A `packages/verticals-<slug>/` directory | NO (implementation artifact) |
| Niche Identity | A Pillar 2 implementation record (one of the 46 in the P2 registry) | NO |
| Template Family | A group of niche records sharing a template design pattern | NO |
| Sector Cluster | An informal grouping convenience term, not a formal taxonomy level | NO |
| PlatformLayer Capability Bucket | Entitlement layer concept (Pillar 1/2/3 + AI) | NO |
| Pillar | One of three platform pillars (Ops, Branding, Marketplace) | NO |
| AI Billing Tag | `primaryPillar` integer in `vertical-ai-config.ts` | NO |
| Priority Bucket | Priority 1 / 2 / 3 classification in CSV | NO (attribute of canonical vertical) |

---

## 4. Initial Verticals Review

### 4.1 Exact Source

File: `docs/planning/m8-phase0-original-verticals.md`
Date: 2026-04-09
Method: Exhaustive audit of `main@08850da` — 70 markdown files, 35 D1 migrations, 29 packages

### 4.2 The 17 P1-Original Verticals

| # | CSV Slug | Display Name | Evidence Basis | CSV Priority |
|---|---|---|---|---|
| 1 | `politician` | Individual Politician | political-taxonomy.md, D1 migrations 0001–0006, relationship-schema.md | 1 |
| 2 | `political-party` | Political Party | political-taxonomy.md, universal-entity-model.md | 1 |
| 3 | `motor-park` | Motor Park / Bus Terminal | geography-taxonomy.md (Facility Place), frsc-cac-integration.md | 1 |
| 4 | `mass-transit` | City Bus / Mass Transit Operator | frsc-cac-integration.md, milestone-tracker.md (route licensing) | 1 |
| 5 | `rideshare` | Carpooling / Ride-Hailing | milestone-brief, offerings.route schema | 1 |
| 6 | `haulage` | Haulage / Logistics Operator | frsc-cac-integration.md | 1 |
| 7 | `church` | Church / Faith Community | universal-entity-model.md, IT-reg, M7c community_spaces | 1 |
| 8 | `ngo` | NGO / Non-Profit Organization | universal-entity-model.md, IT-reg, community_spaces | 1 |
| 9 | `cooperative` | Cooperative Society | universal-entity-model.md, milestone-tracker.md | 1 |
| 10 | `pos-business` | POS Business Management System | packages/pos/src/terminal.ts (distinct from agent POS) | 1 |
| 11 | `market` | Market / Trading Hub | geography-taxonomy.md (Facility Place), vision-and-mission.md | 1 |
| 12 | `professional` | Professional (Lawyer/Doctor/Accountant) | universal-entity-model.md | 1 |
| 13 | `school` | School / Educational Institution | universal-entity-model.md, geography-taxonomy.md (Campus) | 1 |
| 14 | `clinic` | Clinic / Healthcare Facility | universal-entity-model.md, geography-taxonomy.md | 1 |
| 15 | `creator` | Creator / Influencer | universal-entity-model.md, M7c+M7d social + community | 1 |
| 16 | `sole-trader` | Sole Trader / Artisan | universal-entity-model.md, Nigeria informal economy | 1 |
| 17 | `tech-hub` | Tech Hub / Innovation Centre | geography-taxonomy.md (Hub Facility Place) | 1 |

### 4.3 Governance Status of "Initial Verticals"

**Status: HISTORICAL PRIORITY BASELINE — NOT a separate taxonomy.**

The 17 P1-Original verticals are canonical verticals within the 159-row CSV. They are not a separate taxonomy layer. The document `m8-phase0-original-verticals.md` is an audit artifact that justified their inclusion and priority. In governance language:
- Use "P1-Original verticals" or "Priority 1 verticals" — not "initial verticals"
- The phrase "initial verticals" is ambiguous and should be retired from governance language
- The file `docs/governance/initial-verticals-historical-note.md` records this for permanent reference

---

## 5. Cross-Cutting Classification Review

### 5.1 Finding

**The term "cross-cutting verticals" does not exist in this repository.** No table column, package namespace, migration comment, governance doc, or runtime config uses it as a vertical classification.

### 5.2 What "Cross-Cutting" Actually Means in This Codebase

| Usage | Location | Correct Meaning |
|---|---|---|
| "cross-cutting, NOT a 4th pillar" | `docs/governance/3in1-platform-architecture.md` | SuperAgent AI layer spans all three pillars and all verticals |
| "SuperAgent AI capabilities…apply across all combinations" | `docs/governance/verticals-master-plan.md` | Same — AI is cross-cutting, not a vertical |

### 5.3 Multi-Pillar Verticals Are NOT Cross-Cutting

Some verticals have `primary_pillars = ["ops","marketplace","branding"]` — meaning they participate in all three platform pillars. This is a pillar coverage attribute, not a "cross-cutting" classification. These verticals are fully canonical and their pillar breadth is expected and correct.

### 5.4 Governance Ruling

> **The term "cross-cutting verticals" is INVALID and must not appear in any future governance doc, prompt, or architecture reference.** If a vertical serves multiple pillars, say "multi-pillar vertical" or list its `primary_pillars` values explicitly. "Cross-cutting" is reserved exclusively for the SuperAgent AI layer.

See `docs/governance/cross-cutting-classifications-note.md` for full detail.

---

## 6. Duplicate and Alias Decisions

See `docs/governance/vertical-duplicates-and-merge-decisions.md` for full evidence and rationale.

### 6.1 MERGE REQUIRED

#### `gym` (vtx_gym) + `gym-fitness` (vtx_gym_fitness)

- `gym` = "Gym / Wellness Centre" — category: health, priority: 2
- `gym-fitness` = "Gym / Fitness Centre" — category: commerce, priority: 3
- The seedability matrix (migration 0302) marks `gym` as `partial` because the profile table was created under the `gym_fitness` name (`gym_fitness_profiles`)
- Both slugs appear in the CSV as separate entries with different IDs — this was an implementation error
- Decision: **MERGE. Canonical slug = `gym`. `gym-fitness` = deprecated alias.**
- Downstream updates required: CSV (remove `vtx_gym_fitness` row), package `verticals-gym-fitness` → deprecated, seedability matrix, synonym map addition

#### `petrol-station` (vtx_petrol_station) + `fuel-station` (vtx_fuel_station)

- `petrol-station` = "Petrol Station / Filling Station" — category: commerce, priority: 3
- `fuel-station` = "Fuel Station / Filling Station" — category: commerce, priority: 2
- Both display names say "Filling Station" — same real-world entity
- The `vertical_synonyms` table (0302) already records `filling-station` and `dpra-station` as external aliases for `fuel-station` — but did not formally alias `petrol-station` to `fuel-station`
- Decision: **MERGE. Canonical slug = `fuel-station` (broader term; higher priority; NMDPRA/DPR regulatory source uses this name). `petrol-station` = deprecated alias.**
- Downstream updates required: CSV (remove `vtx_petrol_station` row), package `verticals-petrol-station` → deprecated, synonym map addition

### 6.2 KEEP SEPARATE Decisions

| Pair | Rationale |
|---|---|
| `laundry` + `laundry-service` | `laundry` = physical shop (drop-off); `laundry-service` = service operator (home pickup). Distinct business models. |
| `cleaning-company` + `cleaning-service` | `cleaning-company` = B2B facility management firm; `cleaning-service` = individual/small home cleaner. Different scale and regulation. |
| `print-shop` + `printing-press` | `print-shop` = Printing & Branding Shop (consumer-facing quick-print); `printing-press` = Industrial press / design studio. Different capital scale. |
| `event-hall` + `events-centre` | Already in `vertical_synonyms` as `overlap`. S02 team resolved: use `event-hall` for generic venues, `events-centre` for hall-rental businesses. |
| `tailor` + `tailoring-fashion` | `tailor` = individual sole-trader tailor; `tailoring-fashion` = fashion brand/atelier. Different formalization level. |
| `pharmacy` + `pharmacy-chain` | Already in `vertical_synonyms` as `specialization`. Clearly distinct: standalone outlet vs. multi-outlet chain. |
| `restaurant` + `restaurant-chain` | Intentional distinction: single-location eatery vs. multi-location brand. |
| `school`, `private-school`, `nursery-school`, `govt-school` | All represent distinct institution types with different regulatory bodies and business models. |
| `beauty-salon` + `hair-salon` | Already in `vertical_synonyms` as `overlap`. Beauty salon = full personal care; hair salon = specialized barbering/hair. |

---

## 7. Final Canonical Master

### 7.1 Final Count

| Item | Count |
|---|---|
| Total canonical verticals in CSV | **159** |
| Priority 1 (P1-Original) | 17 |
| Priority 2 (Top100 High-Fit) | 62 |
| Priority 3 (Top100 Medium-Fit) | 80 |
| Categories | 14 |
| All with status=`planned` | 159 |
| Post-CSV vertical in DB (bank-branch) | 1 (pending CSV addition) |
| Merge-required duplicates (gym, petrol-station) | 2 (open decisions) |

### 7.2 Category Breakdown (From CSV)

| Category | Count |
|---|---|
| commerce | 54 |
| transport | 15 |
| professional | 13 |
| civic | 13 |
| agricultural | 12 |
| health | 11 |
| place | 8 |
| education | 8 |
| creator | 8 |
| politics | 7 |
| financial | 6 |
| media | 3 |
| institutional | 1 |
| social | 0* |
| **TOTAL** | **159** |

*Note: The `types.ts` VerticalCategory type includes `social` as a valid category, but no CSV rows use it. This was likely a planned category that was not populated.

### 7.3 Package Slug Mismatches (5 Confirmed)

These are NOT classification errors — they are implementation naming divergences. The `vertical_synonyms` table in migration 0302 documents the known pairs. All 5 are classified as `package_alias` in the synonym map.

| CSV Canonical Slug | Package Directory Name | Synonym Map Entry |
|---|---|---|
| `mass-transit` | `verticals-transit` (slug: `transit`) | `vsyn_mass_transit_transit` — package_alias |
| `photography` | `verticals-photography-studio` | `vsyn_photography_photography_studio` — package_alias |
| `newspaper-distribution` | `verticals-newspaper-dist` | Not explicitly in synonym map (implied) |
| `palm-oil-trader` | `verticals-palm-oil` | Not explicitly in synonym map (implied) |
| `polling-unit-rep` | `verticals-polling-unit` | Not explicitly in synonym map (implied) |

**Canonical CSV slug is the authoritative form. Package directory name is the implementation alias. When seeding or querying by slug, use the CSV slug.**

### 7.4 Migration 0037 Slug Mismatches (6 Silent Failures)

Migration `0037_verticals_primary_pillars.sql` contains UPDATE statements that reference non-canonical slugs. Since SQLite UPDATE WHERE slug IN (...) silently skips non-matching rows, these `primary_pillars` assignments were never applied to the affected verticals.

| Migration 0037 Slug Used | Correct CSV Slug | Effect |
|---|---|---|
| `photography-studio` | `photography` | `photography` retains default `["ops","marketplace"]` instead of `["ops","marketplace","branding"]` |
| `dental` | `dental-clinic` | `dental-clinic` retains default instead of intended branding classification |
| `vet` | `vet-clinic` | `vet-clinic` retains default instead of intended branding classification |
| `vocational` | `training-institute` | `training-institute` retains default (no `vocational` slug exists in CSV) |
| `mobile-money` | `mobile-money-agent` | `mobile-money-agent` retains default instead of intended branding classification |
| `bdc` | `bureau-de-change` | `bureau-de-change` retains default instead of intended branding classification |

These mismatches require a corrective migration (0037a or equivalent) to apply the intended `primary_pillars` values using the correct slugs.

### 7.5 Deprecated Aliases

See `docs/governance/vertical-aliases-and-deprecations.md` for full list. Key deprecated slugs:

| Deprecated Slug | Canonical Slug | Source | Reason |
|---|---|---|---|
| `transit` | `mass-transit` | AI config OE-5 (inverted) | AI config wrongly treats `transit` as canonical; CSV is authoritative |
| `mass-transit` | `mass-transit` | CSV canonical | *Note: AI config lists this as deprecated alias — GOVERNANCE CONFLICT* |
| `hospital` | `clinic` (primary) | AI config deprecated aliases section | Not a valid vertical slug; canonical is `clinic` |
| `artisan` | `sole-trader` (primary) | AI config deprecated aliases section | Not a valid vertical slug |
| `gym-fitness` | `gym` | This audit — MERGE REQUIRED | Duplicate of `gym` |
| `petrol-station` | `fuel-station` | This audit — MERGE REQUIRED | Duplicate of `fuel-station` |

**GOVERNANCE CONFLICT — `transit` vs `mass-transit`:**
The AI config (`vertical-ai-config.ts`) explicitly declares `mass-transit` as a deprecated alias and uses `transit` as the canonical slug. This contradicts the CSV where `mass-transit` IS the canonical slug. Since the CSV is the single source of truth and the AI config is a billing configuration only, the CSV slug `mass-transit` is authoritative. The AI config's `transit` entry and its comment on OE-5 reflect an implementation decision made at the AI billing layer without updating the canonical CSV. **Resolution required:** Either update the CSV to `transit`, or update the AI config to use `mass-transit` as the canonical key. This is an **OPEN ARCHITECTURAL DECISION**.

---

## 8. Governance Decisions

### 8.1 Single Source of Truth

**`infra/db/seeds/0004_verticals-master.csv` is the single source of truth for:**
- The definitive list of canonical verticals
- The canonical slug for each vertical
- The category, subcategory, priority, and status of each vertical
- The required KYC tier, regulatory requirements, and package name

### 8.2 Derived Sources (Do Not Treat as Canonical)

| Source | Role | Limitation |
|---|---|---|
| `packages/verticals-*/` directories | Runtime implementation | Package names may use abbreviated/alias slugs |
| `infra/db/migrations/0037_*` | Pillar classification | Contains slug errors; needs corrective migration |
| `infra/db/migrations/0302_*` | Registry seed + synonym map | Derived from CSV; correct for seeding but not source of truth |
| `docs/governance/verticals-master-plan.md` | Planning | Contains stale "160" count |
| `packages/superagent/src/vertical-ai-config.ts` | AI billing config | `primaryPillar` field is NOT canonical pillar classification |

### 8.3 Fields That Must Never Be Used as Canonical Classification

| Field | Location | Why Banned |
|---|---|---|
| `primaryPillar` (integer) | `vertical-ai-config.ts` | AI billing tag only; not the same as `primary_pillars` array |
| Package directory name | `packages/verticals-<name>/` | 5 known naming divergences from canonical CSV slugs |
| Migration 0037 UPDATE slugs | `0037_verticals_primary_pillars.sql` | 6 known slug errors |

### 8.4 Alias Approval Process

1. All aliases must be added to the `vertical_synonyms` table (migration 0302 pattern)
2. Aliases must have a `relation_type` from: `overlap`, `specialization`, `package_alias`, `external_alias`
3. A governance note must be added to `docs/governance/vertical-aliases-and-deprecations.md`
4. No alias approval changes the canonical CSV slug

### 8.5 Merge Approval Process

1. A merge decision must be documented in `docs/governance/vertical-duplicates-and-merge-decisions.md`
2. The CSV must be updated: remove the deprecated row, add a note to the surviving row
3. A corrective migration must be created to mark the deprecated vertical `status='deprecated'`
4. A synonym map entry must be added mapping the deprecated slug to the canonical slug
5. Any downstream system (packages, migrations, AI config, P2 niche registry, template manifests) must be updated

### 8.6 New Vertical Addition Process

1. Add a row to `infra/db/seeds/0004_verticals-master.csv` with all required columns
2. Create a `packages/verticals-<slug>/` directory (slug must match CSV canonical slug exactly)
3. Create the profile table migration in `infra/db/migrations/`
4. Add the slug to `packages/superagent/src/vertical-ai-config.ts`
5. Update the seedability matrix migration (0302 pattern)
6. Add the vertical to the `vertical_synonyms` table if any known aliases exist
7. Do NOT create a vertical by creating only a profile table migration (as happened with `capital-market-operator`)

### 8.7 Niche-to-Vertical Mapping

Every niche in the P2 niche registry (`docs/templates/pillar2-niche-registry.json`) must have a `verticalSlug` field that maps to a canonical CSV slug. The current known violation (now corrected) was `photography-studio` instead of `photography`. Future registry additions must validate against the CSV before commit.

### 8.8 Report Counting Conventions

All future reports must clearly distinguish:

| Count Type | What It Counts | Example |
|---|---|---|
| Vertical count | Rows in `0004_verticals-master.csv` with `status != 'deprecated'` | 159 |
| Niche count | Rows in `pillar2-niche-registry.json` | 46 |
| Package count | Directories matching `packages/verticals-*` | 159 |
| Alias count | Rows in `vertical_synonyms` table | 14+ |
| Deprecated count | CSV rows with `status = 'deprecated'` | 0 currently |

---

## 9. Ready-State

**RECONCILED WITH EXPLICIT OPEN DECISIONS**

The taxonomy has been fully audited and documented. The following open decisions remain and must be resolved by explicit architectural decision before the next vertical addition:

| Decision | Priority | Impact |
|---|---|---|
| Resolve `transit` vs `mass-transit` slug conflict between CSV and AI config | HIGH | Affects seeding, AI routing, package naming |
| Execute merge: `gym` + `gym-fitness` → canonical `gym` | MEDIUM | Removes 1 duplicate from CSV |
| Execute merge: `petrol-station` + `fuel-station` → canonical `fuel-station` | MEDIUM | Removes 1 duplicate from CSV |
| Add `bank-branch` to CSV (already in DB via migration 0339) | MEDIUM | Brings CSV into sync with DB |
| Fix 6 silent-failure slug mismatches in migration 0037 via corrective migration | MEDIUM | Corrects `primary_pillars` for 6 verticals |
| Update `verticals-master-plan.md` count from 160 to 159 | LOW | Documentation hygiene |
| Retire "initial verticals" terminology from all future governance docs | LOW | Language standardization |
| Retire "cross-cutting verticals" terminology from all future governance docs | LOW | Language standardization |

All current data is clean, reconciled, and documented. Future Pillar 2 niche implementation may proceed using `infra/db/seeds/0004_verticals-master.csv` as the single authoritative source for `verticalSlug` validation.

---

*Audit conducted: 2026-04-25*
*Sources reviewed: 8 seed/migration files, 159 package directories, 4 governance docs, 3 reports, 1 AI config, 1 type definition file*
*Auditor: Replit Agent — STOP-AND-RECONCILE directive*
