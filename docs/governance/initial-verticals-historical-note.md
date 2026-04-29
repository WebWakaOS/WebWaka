# Initial Verticals — Historical Note

**Date:** 2026-04-25
**Status:** Authoritative historical reference
**Authority:** Produced as output of the STOP-AND-RECONCILE vertical taxonomy audit
**Companion:** `docs/reports/vertical-taxonomy-reconciliation-report-2026-04-25.md`

---

## Purpose

This document records the exact nature, source, content, and current governance status of the concept historically referred to as "initial verticals" in WebWaka OS platform language.

---

## 1. Source

**Primary source file:** `docs/planning/m8-phase0-original-verticals.md`
**Date:** 2026-04-09
**Author:** Replit Agent (M8 Planning)
**Scope:** Exhaustive audit of `main@08850da` — 70 markdown files, 35 D1 migrations (0001–0035), 29 packages

---

## 2. What "Initial Verticals" Actually Were

These are 17 verticals that were explicitly present in WebWaka OS governance documents, architecture decisions, or package scaffolding before any external Top100 Nigeria SME research list was consulted. They were identified by searching the entire repository at M8 kickoff and finding verticals that:
1. Appeared in existing governance docs (`political-taxonomy.md`, `universal-entity-model.md`, `geography-taxonomy.md`, `vision-and-mission.md`, `milestone-tracker.md`)
2. OR had existing migration table support (politics tables in migrations 0001–0006)
3. OR had explicit package scaffolding (`.gitkeep` files, `packages/pos/`)

They were labeled **P1-Original** (Priority 1 — Original) to distinguish them from the later Top100 research list, which yielded P2 and P3 verticals.

---

## 3. The 17 P1-Original Verticals

| # | Canonical CSV Slug | Display Name | Evidence Basis |
|---|---|---|---|
| 1 | `politician` | Individual Politician | political-taxonomy.md (7-office model), migrations 0001–0006 |
| 2 | `political-party` | Political Party | political-taxonomy.md, universal-entity-model.md |
| 3 | `motor-park` | Motor Park / Bus Terminal | geography-taxonomy.md (Facility Place), frsc-cac-integration.md |
| 4 | `mass-transit` | City Bus / Mass Transit Operator | frsc-cac-integration.md, milestone-tracker.md (route licensing) |
| 5 | `rideshare` | Carpooling / Ride-Hailing | milestone-3 brief (listed as deferred future scope), offerings.route |
| 6 | `haulage` | Haulage / Logistics Operator | frsc-cac-integration.md (bus companies, haulage, ride-hailing) |
| 7 | `church` | Church / Faith Community | universal-entity-model.md (collective entities), IT-reg, M7c community_spaces |
| 8 | `ngo` | NGO / Non-Profit Organization | universal-entity-model.md (Organizations), IT-reg, membership_tiers |
| 9 | `cooperative` | Cooperative Society | universal-entity-model.md (collective entities), milestone-tracker.md |
| 10 | `pos-business` | POS Business Management System | packages/pos/src/terminal.ts (distinct from agent POS infrastructure) |
| 11 | `market` | Market / Trading Hub | geography-taxonomy.md (Market as Facility Place), vision-and-mission.md |
| 12 | `professional` | Professional (Lawyer/Doctor/Accountant) | universal-entity-model.md (professionals as Individual subtype) |
| 13 | `school` | School / Educational Institution | universal-entity-model.md (schools as Organization subtype), M7c courses |
| 14 | `clinic` | Clinic / Healthcare Facility | universal-entity-model.md (clinics as Organization subtype) |
| 15 | `creator` | Creator / Influencer | universal-entity-model.md (creators as Individual subtype), M7c+M7d social |
| 16 | `sole-trader` | Sole Trader / Artisan | universal-entity-model.md (sole traders as Individual subtype) |
| 17 | `tech-hub` | Tech Hub / Innovation Centre | geography-taxonomy.md (Hub as Facility Place) |

---

## 4. How the P1-Original Verticals Relate to the 159 Canonical Verticals

**All 17 P1-Original verticals ARE canonical verticals.** They are not a separate taxonomy or a separate list. They appear in `infra/db/seeds/0004_verticals-master.csv` with `priority=1`. The remaining 142 canonical verticals have `priority=2` (62 verticals) or `priority=3` (80 verticals) — sourced from Top100 Nigeria SME research.

The three-tier priority framework is:

| Priority | Label | Count | Source |
|---|---|---|---|
| 1 | P1-Original | 17 | Phase 0 repo audit — pre-Top100 |
| 2 | P2 High-Fit | 62 | Top100 research — score ≥ 30/30 |
| 3 | P3 Medium-Fit | 80 | Top100 research — score 20–29 |
| **Total** | | **159** | |

---

## 5. Target Package Names (Phase 0 Planned vs. Actual)

One important note: `m8-phase0-original-verticals.md` planned the mass-transit package as `packages/verticals-transit/` — but the canonical CSV slug is `mass-transit`. The package was created as `verticals-transit` and is recorded in the `vertical_synonyms` table as a `package_alias`. This is the source of the `transit` vs `mass-transit` conflict documented in the reconciliation report.

Similarly, `tech-hub` was planned as `packages/verticals-hub/` in the Phase 0 doc but the package was created as `verticals-tech-hub` (matching the canonical slug).

---

## 6. Governance Language Ruling

**The phrase "initial verticals" is ambiguous and must be retired from all future governance documents, prompts, and reports.**

Reasons:
1. It is unclear whether "initial" refers to platform launch sequence, development phase order, or historical pre-research status
2. It suggests a separate taxonomy that does not exist
3. It causes confusion when P2 and P3 verticals are added — "initial" vs "later" is a confusing frame

**Approved replacement terminology:**
- "P1-Original verticals" — when referring specifically to the 17 pre-Top100 verticals
- "Priority 1 verticals" — when referring to the priority level
- "canonical verticals" — when referring to the full 159-row universe
- Do NOT use: "initial verticals", "seed verticals", "founding verticals", "first-wave verticals"

---

## 7. Implementation Priority Status

The 17 P1-Original verticals carry the governance rule:
> **"P1 verticals cannot be skipped. They are the original product design — all must ship before M10."**
> — `docs/governance/verticals-master-plan.md`, Governance Rule #7

This means every P1-Original vertical must have a complete Pillar 1 implementation before M10. The Pillar 2 niche registry may define niches for P1-Original verticals, but Pillar 1 (Ops) is the mandatory first deliverable.

---

*Last updated: 2026-04-25*
*Source: STOP-AND-RECONCILE vertical taxonomy audit*
