# Vertical Aliases and Deprecations

**Date:** 2026-04-25
**Status:** Authoritative
**Authority:** Produced as output of the STOP-AND-RECONCILE vertical taxonomy audit
**Companion:** `docs/reports/vertical-taxonomy-reconciliation-report-2026-04-25.md`

This document is the complete alias registry for the WebWaka OS vertical universe. Every known alias, synonym, package naming divergence, deprecated slug, and external regulatory alias is recorded here.

The runtime source of truth for aliases is the `vertical_synonyms` table (migration 0302). This document is the governance-layer registry that must be kept in sync with that table.

---

## Alias Type Legend

| Type | Meaning |
|---|---|
| `package_alias` | Package directory name diverges from canonical CSV slug |
| `external_alias` | A regulatory, colloquial, or source-data name for the same entity |
| `overlap` | Two separate canonical verticals with significant overlap; not merged by design |
| `specialization` | One vertical is a sub-type of another; both remain canonical |
| `deprecated_slug` | A slug that was previously used and is now retired; maps to canonical |
| `contested` | Alias relationship is disputed; requires architectural decision |

---

## Section 1: Package Name Aliases (5 Known)

These are cases where the package directory name uses a different slug than the canonical CSV slug. Both the CSV slug and the package name are used in different parts of the codebase. The CSV slug is always authoritative.

| Canonical CSV Slug | Package Name Used | Alias Type | Synonym Map Entry | Resolution |
|---|---|---|---|---|
| `mass-transit` | `verticals-transit` (uses slug `transit`) | `package_alias` | `vsyn_mass_transit_transit` | CSV slug `mass-transit` is canonical. AI config incorrectly treats `transit` as canonical — see contested entry A1. |
| `photography` | `verticals-photography-studio` (uses slug `photography-studio`) | `package_alias` | `vsyn_photography_photography_studio` | CSV slug `photography` is canonical. Profile table is `photography_studio_profiles`. |
| `newspaper-distribution` | `verticals-newspaper-dist` (uses slug `newspaper-dist`) | `package_alias` | Not yet in synonym map | CSV slug `newspaper-distribution` is canonical. Should be added to synonym map. |
| `palm-oil-trader` | `verticals-palm-oil` (uses slug `palm-oil`) | `package_alias` | Not yet in synonym map | CSV slug `palm-oil-trader` is canonical. Should be added to synonym map. |
| `polling-unit-rep` | `verticals-polling-unit` (uses slug `polling-unit`) | `package_alias` | Not yet in synonym map | CSV slug `polling-unit-rep` is canonical. Should be added to synonym map. |

**Action required:** Add the 3 missing synonym map entries (`newspaper-distribution`/`newspaper-dist`, `palm-oil-trader`/`palm-oil`, `polling-unit-rep`/`polling-unit`) to the `vertical_synonyms` table via a new migration.

---

## Section 2: External Regulatory Aliases (from `vertical_synonyms` table)

These aliases exist because government databases, seeding sources, or regulatory registries use different names for the same entity.

| Canonical Slug | Alias Slug | Alias Type | Source/Reason |
|---|---|---|---|
| `fuel-station` | `filling-station` | `external_alias` | Common Nigerian spelling for fuel station |
| `fuel-station` | `dpra-station` | `external_alias` | Regulatory/source alias for NMDPRA/DPR retail outlet extracts |
| `road-transport-union` | `national-union-road-transport-workers` | `external_alias` | Expanded NURTW source spelling from transport union databases |

---

## Section 3: Documented Overlaps (from `vertical_synonyms` table)

These pairs were investigated and deliberately kept as separate canonical verticals because they serve distinct but related market segments.

| Primary Canonical Slug | Related Canonical Slug | Alias Type | Resolution Notes |
|---|---|---|---|
| `event-hall` | `events-centre` | `overlap` | Use event-hall for generic venue seeding; events-centre is a related hall-rental variant |
| `beauty-salon` | `hair-salon` | `overlap` | Use beauty-salon for generic personal-care venues; hair-salon is specialized hair/barbing |

---

## Section 4: Documented Specializations (from `vertical_synonyms` table)

These pairs are deliberately kept as separate canonical verticals because one is a sub-type of the other.

| General Canonical Slug | Specialized Canonical Slug | Alias Type | Resolution Notes |
|---|---|---|---|
| `pharmacy` | `pharmacy-chain` | `specialization` | pharmacy for individual outlets; pharmacy-chain for multi-outlet operators |

---

## Section 5: Deprecated Slugs — MERGE_REQUIRED (3 Open Decisions)

These slugs exist in the CSV but have been found to be genuine duplicates of other canonical verticals. They must be deprecated via the merge process described in `docs/governance/vertical-duplicates-and-merge-decisions.md`.

| Deprecated Slug | Maps To Canonical Slug | Merge Status | Evidence |
|---|---|---|---|
| `gym-fitness` | `gym` | MERGE_REQUIRED — OPEN | Same real-world entity; profile table created under gym-fitness name; different category (health vs commerce) was classification error |
| `petrol-station` | `fuel-station` | MERGE_REQUIRED — OPEN | Same real-world entity (Filling Station); colloquial vs regulatory name |
| `nurtw` | `road-transport-union` | MERGE_REQUIRED — OPEN | Same real-world organization (NURTW); entered twice with acronym vs. full name |

---

## Section 6: Deprecated Slugs — Already Retired (from AI Config)

These slugs appear in the deprecated aliases section of `packages/superagent/src/vertical-ai-config.ts`. They were used historically or in early development but are NOT valid canonical slugs.

| Deprecated Slug | Canonical Equivalent | Source | Notes |
|---|---|---|---|
| `hospital` | `clinic` (primary); also `dental-clinic`, `community-health` | AI config deprecated aliases section | Never a valid vertical slug; canonical health facilities use specific slugs |
| `artisan` | `sole-trader` (primary); also `artisanal-mining`, `shoemaker`, `welding-fabrication` | AI config deprecated aliases section | Too generic; canonical slugs are specific business types |

---

## Section 7: Contested Aliases (Requires Architectural Decision)

| Slug Pair | Contested Relationship | Status |
|---|---|---|
| `transit` vs `mass-transit` | AI config treats `transit` as canonical (with `mass-transit` as deprecated); CSV treats `mass-transit` as canonical (with `transit` as package_alias). | NEEDS_ARCH_DECISION — see `vertical-duplicates-and-merge-decisions.md` §A1 |

**Interim ruling:** Until resolved, `mass-transit` is canonical (CSV authority). `transit` is a package alias. AI config's inversion of this is a non-blocking implementation artifact.

---

## Section 8: Migration 0037 Non-Canonical Slugs (Silent Failures)

These slugs appear in `UPDATE WHERE slug IN (...)` statements in migration `0037_verticals_primary_pillars.sql` but do NOT exist in the `verticals` table. The UPDATEs silently fail. They are NOT aliases of anything — they are simply wrong slug references.

| Wrong Slug in Migration | Correct Canonical Slug | Impact |
|---|---|---|
| `photography-studio` | `photography` | `photography` keeps wrong default `primary_pillars` |
| `dental` | `dental-clinic` | `dental-clinic` keeps wrong default `primary_pillars` |
| `vet` | `vet-clinic` | `vet-clinic` keeps wrong default `primary_pillars` |
| `vocational` | `training-institute` | `training-institute` keeps wrong default `primary_pillars` (no `vocational` slug exists) |
| `mobile-money` | `mobile-money-agent` | `mobile-money-agent` keeps wrong default `primary_pillars` |
| `bdc` | `bureau-de-change` | `bureau-de-change` keeps wrong default `primary_pillars` |

**Required action:** Create a corrective migration (e.g. `0037a_verticals_primary_pillars_fix.sql`) that applies the intended `primary_pillars` values using the correct canonical slugs.

---

## Section 9: Post-CSV Additions Requiring CSV Update

These are verticals that exist in the database (inserted via migration) but are not yet in `0004_verticals-master.csv`.

| Slug | Source Migration | Status |
|---|---|---|
| `bank-branch` | `0339_vertical_bank_branch.sql` — has `INSERT OR IGNORE INTO verticals` | Must be added to CSV |
| (none for `capital-market-operator`) | `0324_vertical_capital_market_operator.sql` — creates profile table only, NO verticals INSERT | Capital-market-operator is NOT a registered vertical; it only has a profile table |

---

## Alias Addition Process

To add a new alias:
1. Add a row to the `vertical_synonyms` table via a new migration (0302 pattern)
2. Add the alias to this document (Section 1–4 as appropriate)
3. Update `docs/governance/vertical-source-inventory.md` if relevant
4. Never change the canonical CSV slug when adding an alias

---

*Last updated: 2026-04-25*
*Source: STOP-AND-RECONCILE vertical taxonomy audit*
