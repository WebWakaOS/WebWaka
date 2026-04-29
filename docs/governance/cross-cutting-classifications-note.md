# Cross-Cutting Classifications — Clarification Note

**Date:** 2026-04-25
**Status:** Authoritative
**Authority:** Produced as output of the STOP-AND-RECONCILE vertical taxonomy audit
**Companion:** `docs/reports/vertical-taxonomy-reconciliation-report-2026-04-25.md`

---

## Purpose

This document definitively settles the question of whether "cross-cutting verticals" or "cross-cutting categories" exist in WebWaka OS, and establishes what "cross-cutting" does and does not mean in this codebase.

---

## 1. Finding: "Cross-Cutting Verticals" Does Not Exist

**The taxonomy classification "cross-cutting vertical" does not exist anywhere in the WebWaka OS repository.**

Audit scope checked:
- All migration files referencing "vertical" (130+ files)
- All governance docs in `docs/governance/` (30+ files)
- All planning docs in `docs/planning/`
- All reports in `docs/reports/`
- All TypeScript files in `packages/verticals*/`
- The `vertical-ai-config.ts` configuration
- The canonical CSV (`0004_verticals-master.csv`)

**No file uses "cross-cutting vertical", "crosscutting vertical", "cross_cutting_vertical", or "transversal vertical" as a classification concept.**

---

## 2. What "Cross-Cutting" Actually Means in This Codebase

The phrase "cross-cutting" appears in exactly one classification context in this repository:

### Source: `docs/governance/3in1-platform-architecture.md`

> **SuperAgent** — AI intelligence layer — cross-cutting, NOT a 4th pillar

### Source: `docs/governance/verticals-master-plan.md`

> **[AI]** = SuperAgent AI features relevant to this vertical (cross-cutting, NOT a 4th pillar)

> SuperAgent AI capabilities are not represented in `primary_pillars` — they are entitlement-gated and apply across all combinations.

**Conclusion:** "Cross-cutting" in WebWaka OS refers exclusively to the **SuperAgent AI intelligence layer**. The AI layer crosses all three pillars, all verticals, and all niche types — it is not pillar-specific and it is not vertical-specific. It is provided as an entitlement-gated capability on top of any active vertical.

---

## 3. What Was Probably Meant by "Cross-Cutting Verticals"

Based on the repo evidence, the concept of "cross-cutting verticals" — if it was ever used informally — was likely referring to one of these things:

### 3a. Multi-Pillar Verticals

Some verticals have `primary_pillars = ["ops","marketplace","branding"]` — meaning they serve all three platform pillars. These are sometimes colloquially described as "serving all three pillars" or having broad platform participation.

**Correct terminology:** "multi-pillar vertical" or "all-three-pillar vertical"
**Not:** "cross-cutting vertical"

Examples of multi-pillar verticals: `politician`, `political-party`, `rideshare`, `haulage`, `church`, `ngo`, `professional`, `school`, `clinic`, `creator`, `tech-hub`, `restaurant`, `supermarket`, `fashion-brand`, `pharmacy`, `beauty-salon`, `bakery`, `catering`, `spa`, `photography`, `music-studio`, `real-estate-agency`, `hotel`, `event-hall`, `travel-agent`, `law-firm`, `it-support`, `handyman`, `tax-consultant`, `gym`

### 3b. Category-Level Groupings

The `category` column in the CSV groups verticals into 14 broad sectors (`politics`, `transport`, `civic`, `commerce`, etc.). A "commerce" category contains 54 verticals — it is sometimes described as a "cluster" that cuts across many niche types.

**Correct terminology:** "category" or "sector" or "vertical category"
**Not:** "cross-cutting category"

### 3c. SuperAgent AI Capabilities That Apply to Many Verticals

The AI config (`vertical-ai-config.ts`) defines shared capabilities like `bio_generator`, `translation`, and `sentiment_analysis` that appear across many vertical configs. These are not "cross-cutting verticals" — they are shared AI capabilities.

**Correct terminology:** "shared AI capability" or "default AI capability"
**Not:** "cross-cutting vertical"

---

## 4. Governance Ruling

> **The term "cross-cutting verticals" is INVALID and must not appear in any future governance document, prompt, architecture reference, or implementation plan.**

Specific rules:

| Old Term | Correct Replacement |
|---|---|
| "cross-cutting verticals" | Not applicable — concept does not exist |
| "cross-cutting categories" | "vertical categories" or "category groupings" |
| "cross-cutting AI" | "SuperAgent AI layer" or "AI intelligence layer" |
| "cross-cutting capability" | "shared AI capability" or "entitlement-gated AI capability" |
| Describing a vertical as "cross-cutting" | "multi-pillar vertical" (if it serves all 3 pillars) |

---

## 5. The Three-Pillar Model Is Not "Cross-Cutting"

The three pillars (Ops, Branding, Marketplace) are the three product surfaces of WebWaka OS. A vertical participates in one, two, or all three pillars. This participation is recorded in the `primary_pillars` column of the `verticals` table.

The fact that a vertical participates in multiple pillars does not make it "cross-cutting" — it makes it a **multi-pillar vertical**. The pillar model is a coverage model, not a cross-cutting model.

The only thing that is genuinely cross-cutting is the AI layer — because it applies to ALL verticals equally, regardless of which pillars they participate in, and it is governed by entitlement (not by pillar assignment).

---

## 6. Summary

| Concept | Exists? | Correct Term |
|---|---|---|
| Cross-cutting verticals | NO | N/A |
| Cross-cutting AI (SuperAgent) | YES | SuperAgent AI intelligence layer |
| Multi-pillar verticals | YES | Multi-pillar vertical |
| Vertical category groupings | YES | Vertical category / sector |
| Shared AI capabilities | YES | Default AI capability / shared AI capability |

---

*Last updated: 2026-04-25*
*Source: STOP-AND-RECONCILE vertical taxonomy audit*
