# Vertical Taxonomy Reconciliation Closure Addendum

**Date:** 2026-04-25
**Status:** FINAL
**Produced by:** STOP-AND-RECONCILE implementation pass (follows initial audit report)
**Preceding document:** `docs/reports/vertical-taxonomy-reconciliation-report-2026-04-25.md`

---

## 1. Open Decisions Eliminated

All seven open issues from the initial audit report have been resolved. No open taxonomy decisions remain.

### OD-1: `gym` + `gym-fitness` merge decision
**Former status:** MERGE_REQUIRED — OPEN
**Resolution:** IMPLEMENTED
- Canonical slug: `gym` (priority 2, category `health`)
- Deprecated slug: `gym-fitness` (priority 3, was category `commerce` — category classification error)
- Evidence: Both entries describe a physical fitness centre. `gym` carries the primary ID and higher priority. The `gym_fitness_profiles` table serves both slugs via synonym routing (already documented in the synonym map).
- **Actions taken:**
  - CSV row `vtx_gym_fitness`: `status` changed from `planned` → `deprecated`
  - DB migration 0340: `UPDATE verticals SET status = 'deprecated'` for `gym-fitness`
  - Synonym map (migration 0340): `vsyn_gym_fitness_gym` — `gym-fitness` recorded as `external_alias` for `gym`
  - `vertical_seedability_matrix` (migration 0340): `gym-fitness` marked `deprecated`

---

### OD-2: `petrol-station` + `fuel-station` merge decision
**Former status:** MERGE_REQUIRED — OPEN
**Resolution:** IMPLEMENTED
- Canonical slug: `fuel-station` (priority 2, regulatory term)
- Deprecated slug: `petrol-station` (priority 3, colloquial term)
- Evidence: Same real-world entity (filling station). `fuel-station` is the NMDPRA/DPR regulatory term. `fuel-station` has higher priority. The synonym map already contained `filling-station` and `dpra-station` as external aliases for `fuel-station`, confirming it as the regulatory canonical form.
- **Actions taken:**
  - CSV row `vtx_petrol_station`: `status` changed from `planned` → `deprecated`
  - DB migration 0340: `UPDATE verticals SET status = 'deprecated'` for `petrol-station`
  - Synonym map (migration 0340): `vsyn_petrol_station_fuel_station` — `petrol-station` recorded as `external_alias` for `fuel-station`
  - `vertical_seedability_matrix` (migration 0340): `petrol-station` marked `deprecated`

---

### OD-3: `road-transport-union` + `nurtw` merge decision
**Former status:** MERGE_REQUIRED — OPEN
**Resolution:** IMPLEMENTED
- Canonical slug: `road-transport-union` (holds primary ID `vtx_nurtw`)
- Deprecated slug: `nurtw` (ID `vtx_nurtw_specialized`)
- Priority resolution: `road-transport-union` priority upgraded from 3 → 2 (inheriting from `nurtw` which was priority 2)
- Evidence: Same real-world organization (NURTW) entered twice with name/acronym reversed. The `vtx_nurtw` ID assigned to `road-transport-union` confirms it is the primary entry.
- **Actions taken:**
  - CSV row `vtx_nurtw` (`road-transport-union`): priority changed from `3` → `2`
  - CSV row `vtx_nurtw_specialized` (`nurtw`): `status` changed from `planned` → `deprecated`
  - DB migration 0340: `UPDATE verticals SET status = 'deprecated'` for `nurtw`; `UPDATE verticals SET priority = 2` for `road-transport-union`
  - Synonym map (migration 0340): `vsyn_nurtw_road_transport_union` — `nurtw` recorded as `external_alias` for `road-transport-union`
  - `vertical_seedability_matrix` (migration 0340): `nurtw` marked `deprecated`

---

### OD-4: `bank-branch` CSV alignment
**Former status:** CSV-DB DIVERGENCE — bank-branch in DB (migration 0339) but missing from CSV
**Resolution:** RESOLVED
- Decision: `bank-branch` IS a canonical vertical. Migration 0339 inserted it with a complete, valid record (CBN-linked branch locator). It is not a duplicate or erroneous entry.
- **Actions taken:**
  - CSV: New row added — `vtx_bank_branch,bank-branch,Bank Branch / ATM Location,financial,banking,2,planned,organization,...`
  - DB: Already present via migration 0339; migration 0340 adds `INSERT OR IGNORE` for idempotency
  - `vertical_seedability_matrix` (migration 0340): `bank-branch` entry added
  - Category: `financial`, Priority: 2, Milestone: M9
  - `primary_pillars`: `["ops","marketplace"]` (branch locator — no branded portal needed)
- **Effect on counts:** CSV data rows: 159 → 160; active verticals: 156 → 157 (before accounting for deprecated rows); net active = 157

---

### OD-5: `transit` vs `mass-transit` canonical slug conflict
**Former status:** NEEDS_ARCH_DECISION
**Resolution:** RESOLVED — `mass-transit` is canonical
- **Ruling:** The CSV (primary canonical source) has ID `vtx_transit` with slug `mass-transit`. The CSV slug is always authoritative. The package directory `verticals-transit` uses an alias slug — this is a `package_alias` relationship, the same pattern as `photography`/`photography-studio` and others.
- **Root cause:** Migration OE-5 in `vertical-ai-config.ts` incorrectly inverted the canonical/alias relationship, declaring `transit` as the active key and `mass-transit` as a deprecated alias. This contradicted the CSV.
- **Actions taken:**
  - `packages/superagent/src/vertical-ai-config.ts`: Active key renamed from `'transit'` to `'mass-transit'`; `slug` field updated from `'transit'` to `'mass-transit'`; `aiUseCases` updated to reflect canonical slug
  - `packages/superagent/src/vertical-ai-config.ts`: Deprecated aliases section entry for `'mass-transit'` replaced with a `'transit'` entry (documenting that `transit` is the package alias, not the canonical slug)
  - Synonym map (migration 0340): `vsyn_mass_transit_transit_resolved` — `transit` recorded as `package_alias` for `mass-transit`, superseding the ambiguous entry from migration 0302

---

### OD-6: Migration 0037 silent failures (6 wrong slugs)
**Former status:** DEFECTIVE — 6 UPDATE statements silently matched 0 rows
**Resolution:** CORRECTED via migration 0037a
- **Corrective migration:** `infra/db/migrations/0037a_verticals_primary_pillars_fix.sql`
- **Wrong slugs in 0037 and their correct replacements:**

| Wrong Slug (in 0037) | Correct Canonical Slug | Effect of Fix |
|---|---|---|
| `photography-studio` | `photography` | `photography` now gets `["ops","marketplace","branding"]` |
| `dental` | `dental-clinic` | `dental-clinic` now gets `["ops","marketplace","branding"]` |
| `vet` | `vet-clinic` | `vet-clinic` now gets `["ops","marketplace","branding"]` |
| `vocational` | `training-institute` | `training-institute` now gets `["ops","marketplace","branding"]` |
| `mobile-money` | `mobile-money-agent` | `mobile-money-agent` now gets `["ops","marketplace","branding"]` |
| `bdc` | `bureau-de-change` | `bureau-de-change` now gets `["ops","marketplace","branding"]` |

- Migration 0037a also explicitly sets `["ops","marketplace"]` for `bank-branch` (a post-0037 addition)

---

### OD-7: Stale count references in `verticals-master-plan.md`
**Former status:** STALE — "160 verticals" in 4 locations
**Resolution:** UPDATED
- **Actions taken:**
  - Header seed reference: `(160 verticals)` → `(160 rows: 157 active + 3 deprecated)`
  - Priority framework table: TOTAL row corrected from `160` → `157 active; 160 rows total`
  - Section heading: `3-in-1 Pillar Classification for All 160 Verticals` → `All Active Verticals`
  - Implementation philosophy: `160 seeds` → `160 CSV rows (157 active)`
  - Footer: `160 verticals seeded` → `160 rows (157 active, 3 deprecated — reconciled 2026-04-25)`

---

## 2. Merge Decisions Implemented

| # | Deprecated Slug | Canonical Slug | CSV Status | DB Status | Synonym Entry | Seedability |
|---|---|---|---|---|---|---|
| M1 | `gym-fitness` | `gym` | `deprecated` | `deprecated` | `vsyn_gym_fitness_gym` | `deprecated` |
| M2 | `petrol-station` | `fuel-station` | `deprecated` | `deprecated` | `vsyn_petrol_station_fuel_station` | `deprecated` |
| M3 | `nurtw` | `road-transport-union` | `deprecated` | `deprecated` | `vsyn_nurtw_road_transport_union` | `deprecated` |

---

## 3. Canonical Source Alignment

### CSV status
- File: `infra/db/seeds/0004_verticals-master.csv`
- Header row: 1
- Data rows: **160** (was 159 before bank-branch addition)
- Active (planned) rows: **157**
- Deprecated rows: **3** (`gym-fitness`, `petrol-station`, `nurtw`)
- Pending DB inserts: **0** (all CSV rows are now in the DB)

### Database status
- Source migrations: 0036 (schema), 0302 (seed), 0339 (bank-branch), 0340 (closure)
- Active verticals: **157** (after migration 0340 runs)
- Deprecated verticals: **3** (after migration 0340 runs)
- `road-transport-union` priority: **2** (corrected from 3)
- `bank-branch` primary_pillars: `["ops","marketplace"]`

### Migration status
| Migration | Purpose | Status |
|---|---|---|
| 0036 | Schema | Clean |
| 0037 | Primary pillars (initial) | Defective — 6 silent failures |
| 0037a | Primary pillars corrective fix | **NEW — corrects 6 silent failures** |
| 0302 | Registry seed + synonym map | Clean (pre-closure) |
| 0339 | bank-branch profile table + vertical INSERT | Clean |
| 0340 | Taxonomy closure — merges, aliases, priority fix, bank-branch idempotency | **NEW** |

### Synonym map status
New entries added in migration 0340:

| Entry ID | Canonical | Alias | Type |
|---|---|---|---|
| `vsyn_gym_fitness_gym` | `gym` | `gym-fitness` | `external_alias` (merge) |
| `vsyn_petrol_station_fuel_station` | `fuel-station` | `petrol-station` | `external_alias` (merge) |
| `vsyn_nurtw_road_transport_union` | `road-transport-union` | `nurtw` | `external_alias` (merge) |
| `vsyn_newspaper_distribution_newspaper_dist` | `newspaper-distribution` | `newspaper-dist` | `package_alias` |
| `vsyn_palm_oil_trader_palm_oil` | `palm-oil-trader` | `palm-oil` | `package_alias` |
| `vsyn_polling_unit_rep_polling_unit` | `polling-unit-rep` | `polling-unit` | `package_alias` |
| `vsyn_mass_transit_transit_resolved` | `mass-transit` | `transit` | `package_alias` (resolved) |

---

## 4. Downstream Artifact Update Log

| File | Change Made | Reason |
|---|---|---|
| `infra/db/seeds/0004_verticals-master.csv` | 4 edits (3 deprecated, 1 priority upgrade) + 1 row added (bank-branch) | Primary canonical source — must be authoritative |
| `infra/db/migrations/0037a_verticals_primary_pillars_fix.sql` | NEW — corrects 6 silently-wrong primary_pillars assignments | Migration 0037 silent failures |
| `infra/db/migrations/0037a_verticals_primary_pillars_fix.rollback.sql` | NEW — rollback for 0037a | Standard migration discipline |
| `infra/db/migrations/0340_vertical_taxonomy_closure.sql` | NEW — implements all merge decisions + bank-branch + aliases + priority | Full implementation of taxonomy closure |
| `packages/superagent/src/vertical-ai-config.ts` | Active key `transit` renamed to `mass-transit`; deprecated section entry swapped | Align AI config with CSV canonical slug authority |
| `docs/governance/verticals-master-plan.md` | 5 stale "160" references corrected | Eliminates stale count that caused confusion |
| `docs/governance/canonical-vertical-master-register.md` | Metadata updated; 3 rows marked DEPRECATED; bank-branch added; merge flags → IMPLEMENTED; count table updated | Primary governance register must reflect implemented state |
| `docs/reports/vertical-taxonomy-reconciliation-closure-addendum-2026-04-25.md` | NEW — this document | Governance closure record |

**Documents unchanged (remain valid):**
- `docs/reports/vertical-taxonomy-reconciliation-report-2026-04-25.md` — forensic audit report; remains accurate (open decisions were documented correctly; this addendum records their resolution)
- `docs/governance/vertical-taxonomy-glossary.md` — accurate; no changes needed
- `docs/governance/vertical-source-inventory.md` — accurate; referenced migration 0037 as DEFECTIVE; 0037a now corrects it
- `docs/governance/vertical-aliases-and-deprecations.md` — listed all merges as MERGE_REQUIRED OPEN; now superseded by this closure addendum for status
- `docs/governance/vertical-duplicates-and-merge-decisions.md` — listed all merges as MERGE_REQUIRED; now superseded by closure addendum for status
- `docs/governance/initial-verticals-historical-note.md` — accurate; no changes needed
- `docs/governance/cross-cutting-classifications-note.md` — accurate; no changes needed

---

## 5. Final Counts

| Count | Value |
|---|---|
| CSV data rows (total) | **160** |
| Active (planned) canonical verticals | **157** |
| Deprecated canonical verticals | **3** |
| P1-Original verticals (active) | **17** |
| P2 High-Fit (active, including bank-branch) | **63** |
| P3 Medium-Fit (active, excluding gym-fitness + petrol-station + road-transport-union promoted to P2) | **77** |
| Merged duplicates (deprecated this session) | **3** |
| New verticals added to CSV this session | **1** (bank-branch) |
| Package alias mismatches (now in synonym map) | **5** (all documented) |
| Migration 0037 silent failures corrected | **6** |
| `transit`/`mass-transit` conflict resolved | **1** |
| Open taxonomy decisions remaining | **0** |

**Count reconciliation check:**
- 17 (P1) + 63 (P2) + 77 (P3) = **157 active** ✓
- 157 active + 3 deprecated = **160 CSV data rows** ✓
- 3 deprecated = 3 merges implemented ✓
- 0 open decisions ✓

---

## 6. Final Verdict

**FULLY RECONCILED AND SAFE AS SOURCE OF TRUTH**

The WebWaka OS vertical taxonomy is now fully closed. The canonical CSV (`infra/db/seeds/0004_verticals-master.csv`) is the single authoritative source with 157 active verticals across 160 data rows (3 deprecated). Every open decision from the initial audit has been implemented — no MERGE_REQUIRED, no NEEDS_ARCH_DECISION, no CSV-DB divergence, no migration defect, no stale count reference, and no contested alias conflict remains. Any downstream system that requires the canonical slug list may use the CSV directly or the `verticals` table after migration 0340 has run.

---

*Signed off: Replit Agent — 2026-04-25*
*Authorised by: STOP-AND-RECONCILE directive*
