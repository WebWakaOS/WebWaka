# Vertical Duplicates and Merge Decisions

**Date:** 2026-04-25
**Status:** Authoritative
**Authority:** Produced as output of the STOP-AND-RECONCILE vertical taxonomy audit
**Companion:** `docs/reports/vertical-taxonomy-reconciliation-report-2026-04-25.md`

This document records every near-duplicate analysis performed during the reconciliation audit and the formal governance decision for each pair or group.

---

## Decision Legend

| Decision | Meaning |
|---|---|
| `MERGE_REQUIRED` | The two entries represent the same real-world entity. One must be deprecated. Action required. |
| `ALIAS_ONLY` | One entry is already recorded as an alias in the synonym map. No CSV merge needed. |
| `KEEP_SEPARATE` | The entries are genuinely distinct despite surface similarity. No merge. |
| `NEEDS_ARCH_DECISION` | Insufficient evidence to decide; requires explicit architectural review. |

---

## Confirmed MERGE_REQUIRED Decisions

### M1. `gym` + `gym-fitness`

**Evidence:**

| Attribute | `gym` (vtx_gym) | `gym-fitness` (vtx_gym_fitness) |
|---|---|---|
| ID | `vtx_gym` | `vtx_gym_fitness` |
| Slug | `gym` | `gym-fitness` |
| Display Name | Gym / Wellness Centre | Gym / Fitness Centre |
| Category | **health** | **commerce** |
| Priority | 2 | 3 |
| Entity Type | organization | organization |

**Analysis:**
- Both describe the same real-world business: a physical fitness centre / gym
- The display names are essentially identical ("Wellness Centre" vs "Fitness Centre" — synonymous)
- The category difference (health vs commerce) was an inconsistency in the research phase, not an intentional distinction
- The `vertical_seedability_matrix` in migration 0302 marks `gym` as `partial` because its profile table was created under the `gym_fitness` name (`gym_fitness_profiles` via migration `0164_vertical_gym_fitness.sql`) — direct evidence that the system conflated them
- Package `verticals-gym-fitness` exists; no separate `gym`-specific profile table exists

**Decision: MERGE_REQUIRED**
- Canonical slug: `gym`
- Deprecated alias: `gym-fitness`
- Canonical priority: 2 (higher of the two)
- Canonical category: `health` (the more semantically correct classification for a gym)
- Canonical display name: `Gym / Wellness Centre`

**Downstream changes required:**
1. CSV: Mark `vtx_gym_fitness` row as `status='deprecated'`
2. `vertical_synonyms` table: Add `('vsyn_gym_fitness_gym', 'gym', 'gym-fitness', NULL, 'external_alias', 'gym-fitness is deprecated alias for gym; gym_fitness_profiles table serves both.')`
3. `vertical_seedability_matrix`: Update `gym` entry — profile table is `gym_fitness_profiles`
4. Package `packages/verticals-gym-fitness/`: Mark as deprecated; redirect to `verticals-gym/` (or create alias)
5. AI config: Move `gym-fitness` entry to deprecated aliases section; canonical entry uses slug `gym`
6. Migration 0037: `gym` UPDATE must use slug `gym` (it already does — no issue)

---

### M2. `petrol-station` + `fuel-station`

**Evidence:**

| Attribute | `fuel-station` (vtx_fuel_station) | `petrol-station` (vtx_petrol_station) |
|---|---|---|
| ID | `vtx_fuel_station` | `vtx_petrol_station` |
| Slug | `fuel-station` | `petrol-station` |
| Display Name | Fuel Station / Filling Station | Petrol Station / Filling Station |
| Category | commerce | commerce |
| Priority | **2** | 3 |
| Entity Type | place | place |

**Analysis:**
- Both display names say "Filling Station" — they describe the exact same real-world business
- "Fuel Station" is the broader, more regulatory-accurate term (includes diesel, CNG, petrol, LPG)
- "Petrol Station" is the colloquial Nigerian English term for the same establishment
- The `vertical_synonyms` table (migration 0302) already records `filling-station` as an external alias for `fuel-station` and `dpra-station` (NMDPRA regulatory name) as another external alias for `fuel-station` — confirming that `fuel-station` is the canonical term from a regulatory standpoint
- The `petrol-station` synonym relationship with `fuel-station` was NOT recorded in the synonym map — this was a gap
- `fuel-station` has higher priority (2 vs 3), consistent with it being the more important entry

**Decision: MERGE_REQUIRED**
- Canonical slug: `fuel-station`
- Deprecated alias: `petrol-station`
- Canonical priority: 2
- Canonical category: `commerce`
- Canonical display name: `Fuel Station / Filling Station`

**Downstream changes required:**
1. CSV: Mark `vtx_petrol_station` row as `status='deprecated'`
2. `vertical_synonyms` table: Add `('vsyn_petrol_station_fuel_station', 'fuel-station', 'petrol-station', NULL, 'external_alias', 'petrol-station is deprecated alias for fuel-station; colloquial Nigerian English for the same filling station.')`
3. Package `packages/verticals-petrol-station/`: Mark as deprecated; redirect to `verticals-fuel-station/`
4. AI config: Merge `petrol-station` config into `fuel-station` entry or add to deprecated aliases
5. Seeding: Any entity seeded under `petrol-station` slug must be migrated to `fuel-station`

---

### M3. `road-transport-union` + `nurtw`

**Evidence:**

| Attribute | `road-transport-union` (vtx_nurtw) | `nurtw` (vtx_nurtw_specialized) |
|---|---|---|
| ID | `vtx_nurtw` | `vtx_nurtw_specialized` |
| Slug | `road-transport-union` | `nurtw` |
| Display Name | Road Transport Workers Union (NURTW) | NURTW (Road Transport Workers Union) |
| Category | transport | transport |
| Subcategory | union | union |
| Priority | 3 | **2** |
| Entity Type | organization | organization |

**Analysis:**
- Both entries refer to the exact same real-world organization: the National Union of Road Transport Workers (NURTW)
- The display names are identical concepts — just with the acronym and full name reversed
- Both have category `transport` and subcategory `union`
- The ID `vtx_nurtw` (assigned to `road-transport-union`) is the more "primary" ID
- The ID `vtx_nurtw_specialized` suggests the second entry was added as a specialization, but it represents the same organization
- The `vertical_synonyms` table records `national-union-road-transport-workers` as an external alias for `road-transport-union` with `related_vertical_slug = nurtw` — the S02 team was aware of the overlap but chose "related" rather than "duplicate"; this decision should be overridden by this audit
- `nurtw` has higher priority (2 vs 3) suggesting it was rated higher in the Top100 research; the canonical entry should inherit the higher priority

**Decision: MERGE_REQUIRED**
- Canonical slug: `road-transport-union` (descriptive full name; holds primary ID `vtx_nurtw`)
- Deprecated alias: `nurtw` (acronym-only form)
- Canonical priority: **2** (higher of the two — inherit from `nurtw`)
- Canonical category: `transport`
- Canonical display name: `Road Transport Workers Union (NURTW)` — or `NURTW / Road Transport Workers Union`

**Downstream changes required:**
1. CSV: Update `vtx_nurtw` row priority to 2 (from 3); mark `vtx_nurtw_specialized` row as `status='deprecated'`
2. `vertical_synonyms` table: Update `vsyn_road_transport_union_national_union_road_transport_workers` to also record `nurtw` as a `package_alias` or `external_alias` for `road-transport-union`; change `relation_type` from `external_alias` to `package_alias` where appropriate
3. Package `packages/verticals-nurtw/`: Mark as deprecated; redirect to `verticals-road-transport-union/`
4. AI config: Merge `nurtw` config into `road-transport-union` entry

---

## Confirmed KEEP_SEPARATE Decisions

### K1. `laundry` + `laundry-service`

| Attribute | `laundry` (vtx_laundry) | `laundry-service` (vtx_laundry_service) |
|---|---|---|
| Display Name | Laundry / Dry Cleaner | Laundromat / Laundry Service |
| Priority | 2 | 3 |
| Entity Type | organization | organization |

**Rationale:** `laundry` is a physical drop-off laundry shop or dry cleaner (a place). `laundry-service` is a home-pickup / delivery laundry service operator (a service provider). Different business models, different regulatory profiles, different operational workflows. In Nigerian context: the local mama-put laundry shop (laundry) vs. the app-based pick-up-and-deliver laundry service (laundry-service).

**Decision: KEEP_SEPARATE**

---

### K2. `cleaning-company` + `cleaning-service`

| Attribute | `cleaning-company` | `cleaning-service` |
|---|---|---|
| Display Name | Cleaning & Facility Management Company | Cleaning Service |
| Priority | 3 | 2 |

**Rationale:** `cleaning-service` = small-scale individual/micro-team home cleaning provider (higher priority — more common). `cleaning-company` = larger B2B facility management and commercial cleaning firm with staff, contracts, and CAC registration. Different scale, regulatory requirements, and market segments.

**Decision: KEEP_SEPARATE**

---

### K3. `print-shop` + `printing-press`

| Attribute | `print-shop` | `printing-press` |
|---|---|---|
| Display Name | Printing & Branding Shop | Printing Press / Design Studio |
| Priority | 2 | 3 |

**Rationale:** `print-shop` = consumer-facing quick-print for small jobs (business cards, flyers, banners). `printing-press` = industrial-scale printing operation (newspapers, books, packaging). Vastly different capital requirements, equipment, client base. A roadside print shop and a Sylva print press are not the same business.

**Decision: KEEP_SEPARATE**

---

### K4. `event-hall` + `events-centre`

| Attribute | `event-hall` | `events-centre` |
|---|---|---|
| Display Name | Event Hall / Venue | Events Centre / Hall Rental |
| Priority | 2 | 3 |
| Entity Type | place | place |

**Rationale:** Already formally documented in the `vertical_synonyms` table (migration 0302) as an `overlap` relationship with resolution: "Use event-hall for generic venue seeding; events-centre is a related hall-rental variant." `event-hall` = broader (any venue for events); `events-centre` = dedicated hall-rental business (purpose-built, marketed specifically as a rental venue).

**Decision: KEEP_SEPARATE (per S02 synonym map decision)**
Note: The synonym map should be consulted for seeding — generic venue entities seed to `event-hall`; dedicated rental businesses seed to `events-centre`.

---

### K5. `tailor` + `tailoring-fashion`

| Attribute | `tailor` | `tailoring-fashion` |
|---|---|---|
| Display Name | Tailoring / Fashion Designer | Tailor / Fashion Designer Atelier |
| Priority | 2 | 3 |
| Entity Type | individual | individual |

**Rationale:** `tailor` = individual sole-trader tailor (roadside, bespoke alterations, individual). `tailoring-fashion` = fashion-brand atelier with multiple staff, a brand identity, and potential for Pillar 2 branded portal. The distinction is the formalization level — a roadside tailor vs. a fashion house. Both are intentionally kept separate in the Nigerian SME context where there is a meaningful gap between "uncle tailor" and "Demola Designs".

**Decision: KEEP_SEPARATE**

---

### K6. `pharmacy` + `pharmacy-chain`

Already formally documented in `vertical_synonyms` as `specialization` with resolution: "Use pharmacy for individual pharmacy outlets; pharmacy-chain represents multi-outlet operators."

**Decision: KEEP_SEPARATE (per S02 synonym map decision)**

---

### K7. `restaurant` + `restaurant-chain`

**Rationale:** Intentional design distinction. `restaurant` = single-location food business. `restaurant-chain` = multi-location food brand requiring franchise/chain management features (centralized menu, supply chain, outlet-level reporting). Different product requirements, different regulatory (NAFDAC for chains), different entitlements.

**Decision: KEEP_SEPARATE**

---

### K8. `beauty-salon` + `hair-salon`

Already formally documented in `vertical_synonyms` as `overlap` with resolution: "Use beauty-salon for generic personal-care venues; hair-salon is a specialized hair/barbing variant."

**Decision: KEEP_SEPARATE (per S02 synonym map decision)**

---

### K9. `school`, `private-school`, `nursery-school`, `govt-school`

**Rationale:** All are distinct institution types with different regulatory bodies:
- `school` = generic school/educational institution (catch-all for early seeding)
- `private-school` = privately owned and operated school (WAEC/NECO registered)
- `nursery-school` = early childhood education centre / crèche (SUBEB regulated)
- `govt-school` = government-owned primary or secondary school (UBEC/state-funded)

Each has different KYC requirements, regulatory bodies, and operational profiles. Merging any of these would destroy important regulatory distinctions.

**Decision: KEEP_SEPARATE** (all four remain canonical)

---

## NEEDS_ARCH_DECISION Items

### A1. The `transit` / `mass-transit` Slug Conflict

This is not a near-duplicate — it is an unresolved slug naming conflict between two governance layers:

| Source | Slug Used | Justification |
|---|---|---|
| `0004_verticals-master.csv` (canonical) | `mass-transit` | CSV is the primary source of truth |
| `0302_vertical_registry_seed.sql` | `mass-transit` (canonical) | Consistent with CSV |
| `0037_verticals_primary_pillars.sql` | `mass-transit` | Consistent with CSV |
| `packages/verticals-transit/` | `transit` | Package uses abbreviated slug |
| `packages/superagent/src/vertical-ai-config.ts` | `transit` (canonical), `mass-transit` (deprecated) | AI config inverted the canonical/alias relationship |
| `docs/planning/m8-phase0-original-verticals.md` | planned as `packages/verticals-transit/` | Phase 0 used `transit` package name but `mass-transit` concept |

**The conflict:** The AI config (OE-5 fix) declared `transit` as the canonical slug and `mass-transit` as a deprecated alias. The CSV — which is the authoritative governance source — has `mass-transit` as the canonical slug.

**Options:**
1. Update the CSV to `transit` (aligning with AI config and package name)
2. Update the AI config to use `mass-transit` as the active key (aligning with CSV)
3. Create a new migration to rename the verticals row slug from `mass-transit` to `transit`

**Decision: NEEDS_ARCH_DECISION**
The CTO or principal architect must decide which slug is canonical. Until decided, `mass-transit` is treated as canonical per CSV authority. The AI config entry under `transit` is a non-blocking implementation detail.

---

## Summary Table

| # | Pair | Decision | Canonical | Deprecated |
|---|---|---|---|---|
| M1 | `gym` + `gym-fitness` | MERGE_REQUIRED | `gym` | `gym-fitness` |
| M2 | `petrol-station` + `fuel-station` | MERGE_REQUIRED | `fuel-station` | `petrol-station` |
| M3 | `road-transport-union` + `nurtw` | MERGE_REQUIRED | `road-transport-union` | `nurtw` |
| K1 | `laundry` + `laundry-service` | KEEP_SEPARATE | both | — |
| K2 | `cleaning-company` + `cleaning-service` | KEEP_SEPARATE | both | — |
| K3 | `print-shop` + `printing-press` | KEEP_SEPARATE | both | — |
| K4 | `event-hall` + `events-centre` | KEEP_SEPARATE (synonym) | both | — |
| K5 | `tailor` + `tailoring-fashion` | KEEP_SEPARATE | both | — |
| K6 | `pharmacy` + `pharmacy-chain` | KEEP_SEPARATE (specialization) | both | — |
| K7 | `restaurant` + `restaurant-chain` | KEEP_SEPARATE | both | — |
| K8 | `beauty-salon` + `hair-salon` | KEEP_SEPARATE (overlap) | both | — |
| K9 | `school`, `private-school`, `nursery-school`, `govt-school` | KEEP_SEPARATE | all four | — |
| A1 | `transit` vs `mass-transit` | NEEDS_ARCH_DECISION | `mass-transit` (interim) | `transit` (interim alias) |

**Post-merge canonical count:** If all three MERGE_REQUIRED decisions are executed: 159 − 3 = **156 canonical verticals** (+ 3 deprecated aliases)

---

*Last updated: 2026-04-25*
*Source: STOP-AND-RECONCILE vertical taxonomy audit*
