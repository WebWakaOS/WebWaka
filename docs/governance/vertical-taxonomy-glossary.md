# Vertical Taxonomy Glossary

**Date:** 2026-04-25
**Status:** Authoritative
**Authority:** Produced as output of the STOP-AND-RECONCILE vertical taxonomy audit
**Companion:** `docs/reports/vertical-taxonomy-reconciliation-report-2026-04-25.md`

This glossary defines every vertical-related term used in the WebWaka OS codebase. For each term it provides: the definition, the repo evidence, and whether it contributes to the canonical vertical count.

---

## 1. Canonical Vertical

**Definition:** A distinct real-world business type, professional role, facility, or civic entity that has been formally registered in the WebWaka OS vertical universe. A canonical vertical has:
- A unique `id` (e.g. `vtx_restaurant`)
- A unique `slug` (e.g. `restaurant`) — the runtime identifier
- A `display_name`, `category`, `subcategory`, `priority`, and `status`
- A row in `infra/db/seeds/0004_verticals-master.csv`
- A corresponding `packages/verticals-<slug>/` directory (some use a package alias)

**Repo Evidence:** `infra/db/seeds/0004_verticals-master.csv` — 159 rows; `infra/db/migrations/0036_verticals_table.sql` — schema

**Counts in canonical total?** YES — every active (non-deprecated) row in the CSV is exactly one canonical vertical.

**Do not confuse with:** niche (a Pillar 2 sub-specialisation), template family (a group of niches sharing a design), sector cluster (informal grouping).

---

## 2. Deprecated Alias

**Definition:** A slug that once was used — or was intended to be used — in place of a canonical slug, but has been superseded, corrected, or replaced. A deprecated alias:
- Does NOT have a row in the canonical CSV with `status='active'` or `status='planned'`
- MAY appear in the `vertical_synonyms` table (migration 0302) as a `package_alias` or `external_alias`
- MAY appear in legacy code, older migrations, or older reports
- MUST map to exactly one canonical slug

**Repo Evidence:** `infra/db/migrations/0302_vertical_registry_seed.sql` — `vertical_synonyms` table; `packages/superagent/src/vertical-ai-config.ts` — deprecated aliases section (slugs: `hospital`, `artisan`, `mass-transit` — though this last is contested)

**Counts in canonical total?** NO.

**Known deprecated aliases at audit date:**
- `transit` → canonical `mass-transit` (CSV authority; contested by AI config — see open decisions)
- `hospital` → canonical `clinic` (plus `dental-clinic`, `community-health`, etc.)
- `artisan` → canonical `sole-trader` or specific artisanal slugs
- `filling-station` → canonical `fuel-station` (in synonym map)
- `dpra-station` → canonical `fuel-station` (in synonym map)
- `national-union-road-transport-workers` → canonical `road-transport-union` (in synonym map)
- `photography-studio` → canonical `photography` (in synonym map as package_alias)
- `gym-fitness` → canonical `gym` (MERGE REQUIRED — pending)
- `petrol-station` → canonical `fuel-station` (MERGE REQUIRED — pending)

---

## 3. Initial Vertical (P1-Original Vertical)

**Definition:** One of 17 verticals identified in the Phase 0 repository audit (`docs/planning/m8-phase0-original-verticals.md`) before any external Top100 research was consulted. These verticals were found to be explicitly designed into the platform architecture in migrations, governance docs, and packages at the time of the M8 kickoff audit (2026-04-09). They carry `priority=1` in the CSV.

**Repo Evidence:** `docs/planning/m8-phase0-original-verticals.md`; `infra/db/seeds/0004_verticals-master.csv` column 6 (`priority=1` — 17 rows)

**Counts in canonical total?** YES — all 17 are canonical verticals within the 159.

**Governance note:** The phrase "initial verticals" is ambiguous and should be retired. Use "P1-Original verticals" or "Priority 1 verticals" instead. See `docs/governance/initial-verticals-historical-note.md`.

---

## 4. Cross-Cutting Non-Vertical

**Definition:** A platform capability that spans all verticals and pillars without being a vertical itself. In WebWaka OS, the only cross-cutting element is the SuperAgent AI intelligence layer.

**Repo Evidence:** `docs/governance/3in1-platform-architecture.md` — "SuperAgent: AI intelligence layer — cross-cutting, NOT a 4th pillar"; `docs/governance/verticals-master-plan.md` — "SuperAgent AI capabilities are not represented in primary_pillars — they are entitlement-gated and apply across all combinations."

**Counts in canonical total?** NO — not a vertical.

**Critical note:** The phrase "cross-cutting verticals" does NOT exist and must not be used. "Cross-cutting" describes the AI layer only. Multi-pillar verticals (those serving all 3 pillars) are not "cross-cutting" — they are canonical verticals with broad pillar coverage.

---

## 5. Vertical Package

**Definition:** A `packages/verticals-<name>/` directory in the monorepo that implements the runtime logic for one canonical vertical. Each package typically contains: `src/index.ts`, `src/types.ts`, domain-specific schemas, FSM extension, and tests.

**Repo Evidence:** `packages/verticals-*/` — 159 directories at audit date

**Counts in canonical total?** NO — the package is an implementation artifact. The CSV slug, not the package directory name, is the canonical identifier.

**Known package name divergences from CSV slugs (5 pairs):**

| CSV Canonical Slug | Package Directory Name |
|---|---|
| `mass-transit` | `verticals-transit` |
| `photography` | `verticals-photography-studio` |
| `newspaper-distribution` | `verticals-newspaper-dist` |
| `palm-oil-trader` | `verticals-palm-oil` |
| `polling-unit-rep` | `verticals-polling-unit` |

These divergences are recorded in the `vertical_synonyms` table as `package_alias` relationships.

---

## 6. Niche Identity

**Definition:** A Pillar 2 sub-specialisation of a canonical vertical. A niche is a more specific real-world business type within a vertical's broad category. Niches have their own identity records in the P2 niche registry (`docs/templates/pillar2-niche-registry.json`).

**Repo Evidence:** `docs/templates/pillar2-niche-registry.json` — 46 niche records; `docs/reports/pillar2-niche-identity-system-2026-04-25.md` — governing design report

**Counts in canonical total?** NO — niches are Pillar 2 implementation artifacts, not canonical verticals.

**Mapping rule:** Every niche record has a `verticalSlug` field that MUST reference a canonical CSV slug.

**Example:** The niche `P2-restaurant-general-eatery` has `verticalSlug: "restaurant"` — it is a specialisation of the canonical `restaurant` vertical.

---

## 7. Template Family

**Definition:** A grouping of niche identity records that share a common website/portal template design pattern in Pillar 2 (Brand Runtime). Template families are not vertical classifications — they are design/UX groupings that determine which branded site template is rendered.

**Repo Evidence:** `docs/reports/pillar2-niche-identity-system-2026-04-25.md` — "template families" section; `docs/templates/pillar2-niche-registry.json` — `templateSlug` field per niche

**Counts in canonical total?** NO.

---

## 8. Sector Cluster

**Definition:** An informal convenience grouping of canonical verticals that share a broad industry sector. Sector clusters are used in planning documents and milestone trackers to batch similar verticals. They are not a formal taxonomy level and have no database representation.

**Repo Evidence:** `docs/governance/verticals-master-plan.md` — Category Breakdown table; milestone allocation groupings ("Transport Verticals", "Civic Verticals", "Commerce Verticals")

**Counts in canonical total?** NO.

**Note:** The 14 `category` values in the CSV (`politics`, `transport`, `civic`, `commerce`, etc.) are the closest formal equivalent to sector clusters — but even these are attributes of canonical verticals, not a separate taxonomy.

---

## 9. PlatformLayer / Capability Bucket

**Definition:** One of three platform pillars (Ops/POS, Branding/Portal, Marketplace) that a vertical can participate in. Represented as the `primary_pillars` JSON array column in the `verticals` table. Not to be confused with the simplified integer `primaryPillar` field in the AI config.

**Repo Evidence:** `infra/db/migrations/0037_verticals_primary_pillars.sql` — adds `primary_pillars` column; `docs/governance/3in1-platform-architecture.md` — pillar definitions; `packages/verticals/src/types.ts` — `VerticalRecord` interface

**Counts in canonical total?** NO — `primary_pillars` is an attribute of a canonical vertical, not a separate count.

**Three valid pillar combinations:**
- `["ops","marketplace"]` — Operations + Marketplace (default)
- `["ops","branding"]` — Operations + Branding (e.g. POS Business, Sole Trader)
- `["ops","marketplace","branding"]` — All three (e.g. Politician, Restaurant, Hotel)

---

## 10. Pillar

**Definition:** One of three foundational product surfaces of WebWaka OS:
- **Pillar 1 (Ops/POS):** Operational management and workflows — `apps/api/` back-office
- **Pillar 2 (Branding/Portal):** Branded website and portal — `apps/brand-runtime/`
- **Pillar 3 (Marketplace/Directory):** Public discovery and listings — `apps/public-discovery/`

SuperAgent AI is not a pillar — it is a cross-cutting intelligence layer.

**Repo Evidence:** `docs/governance/3in1-platform-architecture.md` — canonical pillar definitions

**Counts in canonical total?** NO — pillars are platform surfaces, not verticals.

---

## 11. AI Billing Tag / AI Classification Tag

**Definition:** The `primaryPillar` integer field in `packages/superagent/src/vertical-ai-config.ts`. This is a simplified billing category tag (values: 1, 2, or 3) used to route AI usage billing to the correct platform pillar cost center. It does NOT represent the full `primary_pillars` JSON array from the `verticals` table.

**Repo Evidence:** `packages/superagent/src/vertical-ai-config.ts` — `primaryPillar: 1 | 2 | 3` field on `VerticalAiConfig` interface

**Counts in canonical total?** NO.

**CRITICAL GOVERNANCE RULE:** This field must NEVER be used as the canonical authority for which pillars a vertical serves. Use the `primary_pillars` column in the `verticals` table for that purpose.

---

## 12. Priority Bucket

**Definition:** A priority classification applied to canonical verticals in the CSV (`priority` column). Three levels exist:

| Priority | Label | Count | Description |
|---|---|---|---|
| 1 | P1-Original | 17 | Identified in Phase 0 repo audit before Top100 research; must ship first |
| 2 | P2 High-Fit | 62 | From Top100 research; score ≥ 30/30 on Nigeria market fit |
| 3 | P3 Medium-Fit | 80 | From Top100 research; score 20–29 on Nigeria market fit |

**IMPORTANT DISAMBIGUATION:** "P1/P2/P3 vertical priority" is NOT the same as "Pillar 1/2/3". Priority uses the same numeric values but refers to implementation sequence, not platform surfaces.

**Repo Evidence:** `infra/db/seeds/0004_verticals-master.csv` column 6 (`priority`); `docs/governance/verticals-master-plan.md` — Priority Framework table

**Counts in canonical total?** NO — priority is an attribute of a canonical vertical.

---

*Last updated: 2026-04-25*
*Source: STOP-AND-RECONCILE vertical taxonomy audit*
