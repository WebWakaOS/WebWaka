# WebWaka OS — Pillar 3 Niche Identity System

**Document type:** Authoritative system design report  
**Status:** ACTIVE — governs all Pillar 3 governance, tracking, and execution  
**Date:** 2026-04-26  
**Pillar scope:** Pillar 3 — Medium-Fit Verticals (77 niches, verticalPriority=3)  
**Supersedes:** Any prior informal Pillar 3 notes, loose drafts, or partial P3 references  
**Do not modify this report without human authorisation.**

---

## 1. Purpose and Authority

This document is the authoritative design specification for the Pillar 3 niche identity,
tracking, and execution system. It governs:

- The 77 active verticals classified as `priority=3` in the verticals master CSV
- The niche registry schema, status model, queue ordering, and agent handoff protocol
- The generic implementation prompt used for infinite-reuse template creation

This report was created on 2026-04-26 as part of the Pillar 2 → Pillar 3 governance
extension. The Pillar 2 system (46 niches, all SHIPPED as of 2026-04-26) is the
structural reference for every design decision made here.

---

## 2. Disambiguation Rules (Authoritative)

These rules govern every Pillar 3 decision. They cannot be overridden by stale documents.

1. **"Vertical" and "niche" are the same entity.** Every vertical IS a niche. "Niche" is
   the identity dimension; "vertical" is the implementation dimension.

2. **"Vertical" and "niche" are the same entity.** The 77 P3 active count comes from
   `infra/db/seeds/0004_verticals-master.csv` rows where `priority=3` AND `status=planned`.
   Two `priority=3` rows are `status=deprecated` (gym-fitness, petrol-station) and are
   excluded. Excluded count: 79 CSV rows − 2 deprecated = 77 active P3 niches.

3. **The old 46-item registry is superseded.** Any pre-taxonomy 46-item list is superseded
   by the 157-item canonical niche registry. Do not use it as a controlling source.

4. **The master map wins.** If any stale file conflicts with
   `docs/governance/vertical-niche-master-map.md`, the master map is correct.

5. **Build once, reuse infinitely.** Every canonical structure, status code, registry schema,
   family rule, and tracking format created here must not be redesigned or renamed in any
   subsequent session. Extend only; never replace.

6. **7 P3 niches are already SHIPPED via the Pillar 2 sprint.** The following P3-categorised
   verticals were included in the P2 implementation sprint and are LIVE in production:
   `tax-consultant`, `tutoring`, `creche`, `mobile-money-agent`, `bureau-de-change`,
   `hire-purchase`, `community-hall`. Their registry entries carry `templateStatus=SHIPPED`
   and `runtimeIntegrationStatus=LIVE_IN_PRODUCTION`.

7. **Deprecated slugs do not count.** `gym-fitness`, `petrol-station`, and `nurtw` are
   deprecated. Any figure of 78+ active P3 niches is stale.

8. **Canonical slugs only.** Use the slugs from the master CSV, not any alias or legacy
   package name. Package aliases (e.g., `packages/verticals-palm-oil` for `palm-oil-trader`)
   do not affect the canonical `verticalSlug`.

---

## 3. Authoritative Governance State (2026-04-26)

| Fact | Value |
|---|---|
| Active P3 verticals | **77** (CSV `priority=3`, `status=planned`) |
| Deprecated P3 verticals | **2** (`gym-fitness`, `petrol-station`) |
| Total P3 CSV rows | **79** |
| P3 niches already SHIPPED (via P2 sprint) | **7** |
| P3 niches READY_FOR_RESEARCH | **70** |
| P3 CURRENT niche (next to build) | **mosque** |
| Single source of truth | `docs/governance/vertical-niche-master-map.md` |
| Authoritative CSV | `infra/db/seeds/0004_verticals-master.csv` |
| P3 registry file | `docs/templates/pillar3-niche-registry.json` |
| Schema file | `docs/templates/pillar3-niche-registry.schema.md` |
| Queue file | `docs/templates/pillar3-template-queue.md` |
| Execution board | `docs/templates/pillar3-template-execution-board.md` |
| Status codes | `docs/templates/pillar3-template-status-codes.md` |
| Agent handoff | `docs/templates/pillar3-template-agent-handoff.md` |
| Generic prompt | `docs/templates/pillar3-generic-implementation-prompt.md` |

---

## 4. The 77 Active Pillar 3 Niches

### 4.1 — By Category

| Category | Count | Niches |
|----------|-------|--------|
| commerce | 22 | used-car-dealer, spare-parts, tyre-shop, car-wash, motorcycle-accessories, building-materials, iron-steel, electrical-fittings, paints-distributor, plumbing-supplies, generator-dealer, internet-cafe, printing-press, laundry-service, hair-salon, cleaning-company, shoemaker, tailoring-fashion, phone-repair-shop, water-vendor, oil-gas-services, artisanal-mining, borehole-driller |
| agricultural | 10 | poultry-farm, cassava-miller, fish-market, abattoir, produce-aggregator, vegetable-garden, palm-oil-trader, cocoa-exporter, food-processing |
| civic | 9 | mosque, youth-organization, womens-association, professional-association, orphanage, sports-club, book-club, market-association, ministry-mission |
| transport | 5 | okada-keke, ferry, airport-shuttle, container-depot, cargo-truck |
| financial | 4 | airtime-reseller, mobile-money-agent*, bureau-de-change*, hire-purchase* |
| education | 5 | private-school, tutoring*, creche*, govt-school, nursery-school |
| politics | 4 | campaign-office, lga-office, polling-unit-rep, constituency-office |
| professional | 6 | tax-consultant*, land-surveyor, wedding-planner, funeral-home, startup, pr-firm |
| health | 3 | community-health, rehab-centre, elderly-care |
| creator | 4 | talent-agency, recording-label, podcast-studio, motivational-speaker |
| media | 2 | community-radio, newspaper-distribution |
| place | 2 | community-hall*, events-centre |
| institutional | 1 | government-agency |

*Asterisk = SHIPPED via P2 sprint (7 total)*

### 4.2 — Status Distribution

| Status | Count |
|--------|-------|
| SHIPPED (via P2 sprint) | 7 |
| READY_FOR_RESEARCH | 70 |
| **TOTAL** | **77** |

---

## 5. Niche ID Format

**Format:** `P3-{vertical-slug}-{niche-slug}`

**Example:** `P3-mosque-mosque-community-platform`

Rules:
- `vertical-slug` = exact slug from `0004_verticals-master.csv`
- `niche-slug` = descriptive kebab-case identifier for this specific niche implementation
- Immutable once assigned — never change a niche ID after creation
- Must be globally unique within the Pillar 3 registry
- Validation regex: `^P3-[a-z0-9-]+-[a-z0-9-]+$`

---

## 6. Registry Schema Overview

The Pillar 3 registry schema extends the Pillar 2 schema with one key change:
all `pillar2Eligible` and `pillar2EligibilitySource` fields are replaced with their
`pillar3` equivalents. All other field definitions are identical. See
`docs/templates/pillar3-niche-registry.schema.md` for the complete field specification.

**Required fields (all 26 must be present in every record):**

Identity: `nicheId`, `verticalSlug`, `verticalName`, `nicheSlug`, `nicheName`,
`verticalCategory`, `verticalPriority`

Classification: `canonicalPillars`, `pillar3Eligible`, `pillar3EligibilitySource`

Nigeria-First: `nigeriaFirstPriority`, `africaFirstNotes`, `audienceSummary`,
`businessContextSummary`, `contentLocalizationNotes`, `imageArtDirectionNotes`,
`regulatoryOrTrustNotes`

Template Status: `templateStatus`, `templateVariantCount`, `primaryTemplatePath`,
`templateSlug`, `marketplaceManifestSlug`, `runtimeIntegrationStatus`

Process Tracking: `researchStatus`, `researchBriefPath`, `lastReviewedAt`,
`implementedAt`, `dependencies`, `blockers`, `nextAction`, `owner`, `notes`

---

## 7. Status Model

The Pillar 3 status model is structurally identical to the Pillar 2 model. All status
codes, transitions, and rules defined in `docs/templates/pillar2-template-status-codes.md`
apply, adapted for P3 context. See `docs/templates/pillar3-template-status-codes.md`.

**Initial state for all 70 non-shipped P3 niches:** `READY_FOR_RESEARCH`

This is a deliberate governance decision — all P3 niches are pre-confirmed viable by the
taxonomy closure audit (2026-04-25). No `UNASSESSED` state is needed for P3.

---

## 8. Queue Design and Ordering Logic

The P3 queue orders niches for maximum build efficiency and family coherence.

**Queue batch structure:**
1. **SHIPPED** (7) — Already live, shown first for completeness
2. **Self-anchors** — P3 standalone niches with no P2 anchor dependency
3. **High-Nigeria-First-priority** — `nigeriaFirstPriority=critical` unblocked niches
4. **Medium-priority** — `nigeriaFirstPriority=high` niches
5. **Family variants** — Niches whose anchor must be built first

**CURRENT niche:** `mosque` (VN-CIV-004 family variant of church; `nigeriaFirstPriority=critical`)

See `docs/templates/pillar3-template-queue.md` for the full ordered queue.

---

## 9. Agent Workflow Summary

Every P3 template implementation session follows the 9-step workflow defined in
`docs/templates/pillar3-template-agent-handoff.md`. The workflow is structurally identical
to the Pillar 2 workflow with P3 file references substituted throughout.

**Critical rule:** Research before code. An agent must complete 4+ research threads and
write a research brief before writing a single line of TypeScript.

---

## 10. Generic Prompt Design

The `docs/templates/pillar3-generic-implementation-prompt.md` is a self-contained,
copy-paste-ready instruction document for any capable AI agent. It:

- Encodes all non-negotiable truths for P3 (77 niches, 7 SHIPPED, CURRENT=mosque)
- References all P3-specific file paths (never P2 paths)
- Mandates 4+ parallel research threads before any implementation
- Enforces Nigeria-first content, imagery, and regulatory compliance
- Includes the complete family/anchor/variant logic
- Is designed for **build-once, reuse-infinitely** execution across all 77 niches

---

## 11. Relation to Pillar 2

| Aspect | Pillar 2 | Pillar 3 |
|--------|----------|----------|
| Niche count | 46 | 77 |
| CSV priority | 1 or 2 | 3 |
| All shipped? | YES (2026-04-26) | 7 of 77 (2026-04-26) |
| CURRENT status | All SHIPPED ✅ | mosque (READY_FOR_RESEARCH) |
| nicheId prefix | `P2-` | `P3-` |
| Registry file | `pillar2-niche-registry.json` | `pillar3-niche-registry.json` |
| Schema file | `pillar2-niche-registry.schema.md` | `pillar3-niche-registry.schema.md` |
| Queue file | `pillar2-template-queue.md` | `pillar3-template-queue.md` |
| Board file | `pillar2-template-execution-board.md` | `pillar3-template-execution-board.md` |
| Status codes | `pillar2-template-status-codes.md` | `pillar3-template-status-codes.md` |
| Handoff | `pillar2-template-agent-handoff.md` | `pillar3-template-agent-handoff.md` |
| Generic prompt | `pillar2-generic-implementation-prompt.md` | `pillar3-generic-implementation-prompt.md` |

---

## 12. File Inventory

All 8 Pillar 3 deliverable files:

| File | Location | Status |
|------|----------|--------|
| `pillar3-niche-identity-system-2026-04-26.md` | `docs/reports/` | ACTIVE (this file) |
| `pillar3-niche-registry.json` | `docs/templates/` | ACTIVE — 77 records |
| `pillar3-niche-registry.schema.md` | `docs/templates/` | ACTIVE |
| `pillar3-template-execution-board.md` | `docs/templates/` | ACTIVE |
| `pillar3-template-queue.md` | `docs/templates/` | ACTIVE |
| `pillar3-template-status-codes.md` | `docs/templates/` | ACTIVE |
| `pillar3-template-agent-handoff.md` | `docs/templates/` | ACTIVE |
| `pillar3-generic-implementation-prompt.md` | `docs/templates/` | ACTIVE |

---

*System created: 2026-04-26*  
*Created by: Replit forensic QA + build agent session 2026-04-26*  
*This document is read-only for agents — do not modify without human authorisation.*
