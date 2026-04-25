# WebWaka OS — Niche Alias & Deprecation Registry

**Status:** AUTHORITATIVE
**Date:** 2026-04-25
**Source:** Migration `0340_vertical_taxonomy_closure.sql`; taxonomy closure addendum `2026-04-25`

This registry is the single source of truth for every non-canonical slug — whether deprecated verticals, merged duplicates, or package aliases. No slug here should ever receive new profile data. All traffic must be routed to the canonical replacement.

---

## Section 1 — Deprecated Verticals (Merged Duplicates)

These three CSV rows carry `status='deprecated'`. Their DB rows are also marked deprecated (migration 0340). They existed as real verticals before the 2026-04-25 taxonomy closure and were merged into their canonical equivalents.

| # | Deprecated Slug | Deprecated Niche ID | Status | Canonical Slug | Canonical Niche ID | Merge Date | Synonym Map Entry | Decision Reference |
|---|---|---|---|---|---|---|---|---|
| 1 | `gym-fitness` | VN-DEP-001 | deprecated | `gym` | VN-HLT-004 | 2026-04-25 | `vsyn_gym_fitness_gym` | OD-1 (taxonomy closure) |
| 2 | `petrol-station` | VN-DEP-002 | deprecated | `fuel-station` | VN-NRG-001 | 2026-04-25 | `vsyn_petrol_station_fuel_station` | OD-2 (taxonomy closure) |
| 3 | `nurtw` | VN-DEP-003 | deprecated | `road-transport-union` | VN-TRP-005 | 2026-04-25 | `vsyn_nurtw_road_transport_union` | OD-3 (taxonomy closure) |

### Merge Rationale

**`gym-fitness` → `gym`**
Both slugs described a physical fitness/gym centre. `gym` holds the primary ID (`vtx_gym`) and the higher priority (P2). `gym-fitness` was in the wrong CSV category (`commerce/health-wellness`) while `gym` correctly sits in `health/fitness`. Any `gym-fitness` query or profile must route to `gym`.

**`petrol-station` → `fuel-station`**
Both slugs described a filling station. `fuel-station` is the NMDPRA/DPR regulatory term and is the canonical form (DPR uses "fuel station" in all licence documentation). The existing synonym map for `fuel-station` already included `filling-station` and `dpra-station` as aliases before this closure, confirming `fuel-station` as the canonical choice. Any `petrol-station` query or profile routes to `fuel-station`.

**`nurtw` → `road-transport-union`**
Both slugs described NURTW local chapter affiliates. The primary ID (`vtx_nurtw`) was assigned to `road-transport-union`, confirming it as the canonical slug. `road-transport-union` priority was upgraded from P3→P2 (inheriting `nurtw`'s P2 weight). Any `nurtw` query or profile routes to `road-transport-union`.

### Routing Rule for All Three Deprecated Verticals

```
IF slug IN ('gym-fitness', 'petrol-station', 'nurtw') THEN
  → REDIRECT to canonical via vertical_synonyms.canonical_slug
  → DO NOT create new profiles under deprecated slugs
  → DO NOT expose deprecated slugs in public APIs (except admin read-only audit)
```

---

## Section 2 — Package Aliases

These are verticals where the package directory name differs from the canonical CSV slug. The synonym map entry type is `package_alias`. These verticals are **active and canonical** — only the package directory name diverges, not the slug itself.

| # | Canonical Slug | Package Directory | Package Alias Slug | Synonym Map Entry | Notes |
|---|---|---|---|---|---|
| 1 | `photography` | `packages/verticals-photography-studio` | `photography-studio` | `vsyn_photography_studio` (pre-0340) | Migration 0037a corrects `primary_pillars` (was silently failing on wrong slug `photography-studio`) |
| 2 | `mass-transit` | `packages/verticals-transit` | `transit` | `vsyn_mass_transit_transit_resolved` (0340) | AI config corrected: `transit` was incorrectly declared active key; `mass-transit` is canonical |
| 3 | `newspaper-distribution` | `packages/verticals-newspaper-dist` | `newspaper-dist` | `vsyn_newspaper_distribution_newspaper_dist` (0340) | Package dir uses short alias; canonical slug is `newspaper-distribution` |
| 4 | `palm-oil-trader` | `packages/verticals-palm-oil` | `palm-oil` | `vsyn_palm_oil_trader_palm_oil` (0340) | Package dir uses commodity-only name; canonical slug includes trader identity |
| 5 | `polling-unit-rep` | `packages/verticals-polling-unit` | `polling-unit` | `vsyn_polling_unit_rep_polling_unit` (0340) | Package dir omits `-rep`; canonical slug includes representative role |

### Additional Package Aliases (Pre-Closure, from migration 0037 slug fix)

Migration 0037 attempted to set `primary_pillars` for 6 verticals using wrong slugs. Migration 0037a (2026-04-25) corrected these. The package directories for these 6 use alias slugs:

| # | Canonical Slug | Package Directory (Wrong Slug in 0037) | Corrected By |
|---|---|---|---|
| 6 | `photography` | `packages/verticals-photography-studio` (slug `photography-studio`) | 0037a |
| 7 | `dental-clinic` | `packages/verticals-dental-clinic` (slug `dental` in 0037) | 0037a |
| 8 | `vet-clinic` | `packages/verticals-vet-clinic` (slug `vet` in 0037) | 0037a |
| 9 | `training-institute` | `packages/verticals-training-institute` (slug `vocational` in 0037) | 0037a |
| 10 | `mobile-money-agent` | `packages/verticals-mobile-money-agent` (slug `mobile-money` in 0037) | 0037a |
| 11 | `bureau-de-change` | `packages/verticals-bureau-de-change` (slug `bdc` in 0037) | 0037a |

**Status:** All 6 corrected in DB by migration 0037a. Primary pillars are now correctly assigned to the canonical slugs.

---

## Section 3 — Transit / Mass-Transit Resolution

This was a special-case contested alias (OD-5 in the taxonomy closure).

| Layer | Slug | Status | Resolution |
|---|---|---|---|
| CSV (canonical source) | `mass-transit` | **CANONICAL** | `vtx_transit` ID assigned to slug `mass-transit` |
| Package directory | `packages/verticals-transit` | package alias | Uses shortened alias `transit`; does NOT override CSV canonical slug |
| AI config (before fix) | `'transit'` was active key | **INCORRECT** | Inverted the canonical/alias relationship |
| AI config (after fix) | `'mass-transit'` is active key | **CORRECT** | Aligns with CSV authority |
| Synonym map | `vsyn_mass_transit_transit_resolved` | **IMPLEMENTED** | `transit` recorded as `package_alias` for `mass-transit`; supersedes ambiguous entry from migration 0302 |

**Ruling:** The CSV slug is always authoritative. `mass-transit` is canonical. `transit` is a package-directory alias only.

---

## Section 4 — Routing Matrix (All Aliases)

All system components must consult `vertical_synonyms` for slug resolution. This table shows the complete non-canonical slug → canonical slug routing.

| Non-Canonical Slug | Type | Canonical Slug | Synonym Map ID | Active? |
|---|---|---|---|---|
| `gym-fitness` | merge (deprecated) | `gym` | `vsyn_gym_fitness_gym` | No — deprecated |
| `petrol-station` | merge (deprecated) | `fuel-station` | `vsyn_petrol_station_fuel_station` | No — deprecated |
| `nurtw` | merge (deprecated) | `road-transport-union` | `vsyn_nurtw_road_transport_union` | No — deprecated |
| `transit` | package_alias | `mass-transit` | `vsyn_mass_transit_transit_resolved` | Yes — canonical is `mass-transit` |
| `photography-studio` | package_alias | `photography` | `vsyn_photography_studio` | Yes — canonical is `photography` |
| `newspaper-dist` | package_alias | `newspaper-distribution` | `vsyn_newspaper_distribution_newspaper_dist` | Yes — canonical is `newspaper-distribution` |
| `palm-oil` | package_alias | `palm-oil-trader` | `vsyn_palm_oil_trader_palm_oil` | Yes — canonical is `palm-oil-trader` |
| `polling-unit` | package_alias | `polling-unit-rep` | `vsyn_polling_unit_rep_polling_unit` | Yes — canonical is `polling-unit-rep` |
| `dental` | migration-alias (0037 wrong slug) | `dental-clinic` | (0037a corrected directly in DB) | Yes — canonical is `dental-clinic` |
| `vet` | migration-alias (0037 wrong slug) | `vet-clinic` | (0037a corrected directly in DB) | Yes — canonical is `vet-clinic` |
| `vocational` | migration-alias (0037 wrong slug) | `training-institute` | (0037a corrected directly in DB) | Yes — canonical is `training-institute` |
| `mobile-money` | migration-alias (0037 wrong slug) | `mobile-money-agent` | (0037a corrected directly in DB) | Yes — canonical is `mobile-money-agent` |
| `bdc` | migration-alias (0037 wrong slug) | `bureau-de-change` | (0037a corrected directly in DB) | Yes — canonical is `bureau-de-change` |

---

## Section 5 — Special Case Blockers & Notes

### bank-branch (VN-FIN-007)
- **Status:** Active canonical vertical (added to CSV 2026-04-25)
- **Former status:** Present in DB (migration 0339) but missing from CSV — divergence
- **Resolution:** Added to CSV; migration 0340 adds `INSERT OR IGNORE` for idempotency
- **Primary pillars:** `["ops","marketplace"]` — branch locator pattern (no branded portal)
- **No alias or deprecation** — this is a clean new entry

### road-transport-union (VN-TRP-005)
- **Status:** Active canonical vertical; `nurtw` is deprecated alias
- **Priority:** Upgraded from P3 → P2 (2026-04-25, OD-3)
- **Alias:** `nurtw` → `road-transport-union` (vsyn_nurtw_road_transport_union)

### mass-transit (VN-TRP-002)
- **Status:** Active canonical vertical; `transit` is package alias
- **Package alias:** `packages/verticals-transit` uses slug `transit`
- **AI config:** Active key corrected to `'mass-transit'` on 2026-04-25 (OD-5)

---

*Produced: 2026-04-25 — STOP-AND-RECONCILE taxonomy closure*
*Migration evidence: `infra/db/migrations/0340_vertical_taxonomy_closure.sql`*
