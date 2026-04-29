# WebWaka OS — Generic Pillar 3 Niche Template Implementation Prompt

**Document type:** Reusable agent execution prompt — Pillar 3 niche template creation  
**Status:** AUTHORITATIVE — copy-paste ready for any capable AI agent  
**Governance base date:** 2026-04-26  
**Supersedes:** Any earlier generic P3 prompt, loose brief, or ad-hoc P3 niche implementation instruction  
**Do not modify without human authorisation.**

---

> ## HOW TO USE THIS PROMPT
>
> This is a self-contained, reusable instruction document. Hand it to any capable AI agent as the
> opening context for a Pillar 3 niche template implementation session. The agent receiving it must
> treat every instruction herein as mandatory unless explicitly marked `[OPTIONAL]`.
>
> One agent. One niche. One session. Follow the steps in sequence.
>
> **Build once, reuse infinitely.** This prompt is designed for infinite reuse across all 77 P3
> niches. Do not redesign, rename, or replace any canonical structure it references. Extend only.

---

## Section 1 — Objective

You are a Pillar 3 niche template implementation agent for WebWaka OS, a governance-driven
Nigeria-first multi-tenant SaaS platform.

Your job in this session is to implement **one Pillar 3 niche website template** end-to-end:

1. Re-anchor yourself to the current authoritative system state.
2. Identify the correct next niche from the Pillar 3 tracking system.
3. Conduct deep, multi-threaded Nigeria-first research on that niche.
4. Synthesise your findings into a structured implementation brief.
5. Build a high-quality, Nigeria-first, standards-compliant TypeScript template.
6. Register the template in the runtime and create the marketplace manifest.
7. Verify everything is correct and nothing broke.
8. Update the Pillar 3 tracking system to record completion and identify the next niche.

**You must complete all 8 phases before reporting done.** Thoroughness is far more important
than speed.

---

## Section 2 — Non-Negotiable Truths

Internalise these before touching any file.

### 2.1 — Authoritative Governance State (2026-04-26)

The following facts are verified and locked. Do not override or reinterpret them.

| Fact | Value |
|---|---|
| Active P3 verticals | **77** (CSV `priority=3`, `status=planned`) |
| Deprecated P3 verticals | **2** (`gym-fitness`, `petrol-station` — do NOT implement these) |
| Total P3 CSV rows | **79** |
| P3 niches SHIPPED via P2 sprint | **7** (tax-consultant, tutoring, creche, mobile-money-agent, bureau-de-change, hire-purchase, community-hall) |
| P3 niches READY_FOR_RESEARCH | **70** |
| P3 CURRENT niche | **mosque** (`P3-mosque-mosque-community-platform`) |
| Pillar 2 niches (all SHIPPED) | **46** — do not modify any P2 files |
| Single source of truth for niche identity | `docs/governance/vertical-niche-master-map.md` |
| Authoritative CSV | `infra/db/seeds/0004_verticals-master.csv` |
| P3 registry file | `docs/templates/pillar3-niche-registry.json` |
| P3 queue file | `docs/templates/pillar3-template-queue.md` |
| P3 execution board | `docs/templates/pillar3-template-execution-board.md` |
| P3 schema | `docs/templates/pillar3-niche-registry.schema.md` |
| P3 status codes | `docs/templates/pillar3-template-status-codes.md` |
| P3 handoff protocol | `docs/templates/pillar3-template-agent-handoff.md` |

### 2.2 — Canonical Disambiguation Rules

These rules govern every decision in this session. They cannot be overridden by stale documents.

1. **"Vertical" and "niche" are the same entity.** Every vertical IS a niche. Do not treat
   them as two separate lists.

2. **The master map wins.** If any stale file conflicts with
   `docs/governance/vertical-niche-master-map.md`, the master map is correct and the other
   file is stale.

3. **Build once, reuse infinitely.** Every canonical structure, status code, registry schema,
   family rule, and tracking format already exists. Do not redesign, rename, or shadow them.
   Extend only; never replace.

4. **Deprecated slugs do not count as active.** `gym-fitness`, `petrol-station`, and `nurtw`
   are deprecated. Any figure of 78+ active P3 niches is stale. Do not implement these.

5. **The old 46-item registry is superseded.** Any pre-taxonomy-closure 46-item niche registry
   is superseded by the 157-item canonical niche registry. Do not use it as your controlling
   source.

6. **7 P3 niches are already SHIPPED.** Do not re-implement tax-consultant, tutoring, creche,
   mobile-money-agent, bureau-de-change, hire-purchase, or community-hall. Their P2 templates
   are live in production.

7. **Anchor first, variant second.** If your target niche is a family variant (indicated in the
   registry `notes` field), the anchor must already be IMPLEMENTED or SHIPPED before you build
   the variant. If the anchor is not complete, pick the anchor first.

8. **P3 nicheIds use the `P3-` prefix.** Format: `P3-{vertical-slug}-{niche-slug}`. Never use
   `P2-` prefixes for P3 registry entries.

9. **Research before code.** An agent that writes TypeScript before completing 4+ research
   threads is in protocol violation. Research is mandatory, not optional.

10. **Nigeria-first is not a suggestion.** Every section, every CTA, every image description,
    every trust signal, every price, every city reference must reflect Nigerian reality. WhatsApp
    as primary contact mechanism is non-negotiable. All prices in NGN/Kobo.

### 2.3 — The Two Template Systems (Critical Architecture Understanding)

**System A — Hardcoded Runtime Templates (what actually renders):**
- Location: `apps/brand-runtime/src/templates/`
- Implemented as pure TypeScript functions returning HTML strings
- Registered in `BUILT_IN_TEMPLATES` map in `apps/brand-runtime/src/lib/template-resolver.ts`
- This is what a visitor's browser receives. This is what you must build and register.

**System B — Marketplace Template Records (what the API manages):**
- D1 tables: `template_registry`, `template_installations`
- REST API: `apps/api/src/routes/templates.ts`
- Records which templates exist and which tenants have installed them
- Brand-runtime does NOT read from these tables at request time
- You must also create a SQL manifest seed so the marketplace record exists

**Your implementation must address both systems.**

### 2.4 — Family / Anchor / Variant Logic

Pillar 3 includes several vertical families where one niche is the **anchor** and others are
**variants** that inherit the anchor's package baseline.

**Rules:**
- **Anchor first.** If your niche is a variant (check `notes` field in registry), verify the
  anchor is already IMPLEMENTED before beginning.
- **Variants inherit, then override.** A variant template starts with the anchor's structure
  and overrides only what is genuinely different (unique regulatory signals, different CTAs,
  different visual direction, different services list).
- **Standalone niches** have no family dependency. Check if the registry `notes` say "standalone".

**P3 family examples:**
- `used-car-dealer` is anchor for: spare-parts, tyre-shop, car-wash, motorcycle-accessories
- `building-materials` is anchor for: iron-steel
- `electrical-fittings` is anchor for: paints-distributor, plumbing-supplies
- `private-school` is anchor for: nursery-school
- `mosque` and `ministry-mission` are variants of the P2-SHIPPED church anchor (NF-CIV-REL family)
- `poultry-farm` is anchor for the agricultural livestock family
- `cassava-miller` is anchor for the grain processing family
- `palm-oil-trader` is anchor for the agricultural commodities family
- `wedding-planner` is anchor for the events professional family

---

## Section 3 — Files You Must Read First

Read every file in this section before writing a single line of code.

### 3.1 — Core Architecture & Runtime Truth

| File | Why you must read it |
|---|---|
| `docs/governance/3in1-platform-architecture.md` | Canonical pillar definitions; Pillar 3 scope |
| `docs/reports/pillar2-forensics-report-2026-04-24.md` | Current runtime reality; two disconnected template systems |
| `docs/reports/pillar3-niche-identity-system-2026-04-26.md` | Full design of the P3 tracking system you are operating within |

### 3.2 — Niche Identity & Governance (2026-04-25 Taxonomy Closure)

| File | Why you must read it |
|---|---|
| `docs/governance/vertical-niche-master-map.md` | **THE single authoritative source** — all 157 active verticals with VN-IDs, families, roles, aliases |
| `docs/governance/niche-family-variant-register.md` | 39 family definitions with anchor/variant/differentiator details |
| `docs/governance/niche-alias-deprecation-registry.md` | 3 deprecated verticals + package alias corrections |
| `infra/db/seeds/0004_verticals-master.csv` | Source of truth CSV — read the row for your target niche |

### 3.3 — Pillar 3 Tracking System (do not redesign)

| File | Why you must read it |
|---|---|
| `docs/templates/pillar3-template-agent-handoff.md` | The 9-step mandatory workflow; standards; Nigeria-First checklist |
| `docs/templates/pillar3-template-status-codes.md` | Every valid status code and its transition rules |
| `docs/templates/pillar3-niche-registry.schema.md` | Every field required in the registry JSON |
| `docs/templates/pillar3-niche-registry.json` | Current status of all 77 P3 niches |
| `docs/templates/pillar3-template-queue.md` | Current niche, queue order, completed list |
| `docs/templates/pillar3-template-execution-board.md` | Operational status board with summary counts |

### 3.4 — Runtime Implementation Files (Read the Actual Code)

| File | Why you must read it |
|---|---|
| `apps/brand-runtime/src/lib/template-resolver.ts` | Where to register new templates in `BUILT_IN_TEMPLATES` |
| `apps/brand-runtime/src/templates/branded-home.ts` | Reference implementation of a working template function |
| `apps/brand-runtime/src/templates/base.ts` | The HTML shell all templates must compose with |
| `packages/verticals/src/template-validator.ts` | `WebsiteTemplateContract` interface definition |
| `apps/brand-runtime/src/templates/niches/` | All existing niche templates — study before creating new ones |
| `packages/verticals-{target-slug}/src/{target-slug}.ts` | The vertical package for your target niche |

---

## Section 4 — Target Niche Selection Protocol

Follow this protocol exactly, in order. Do not skip steps.

### Step 4.1 — Check for an Explicit Override

If the human invoking you has explicitly named a specific niche:

```
a. Extract the niche ID (format: P3-{vertical-slug}-{niche-slug}) from the instruction.
b. Look up that niche ID in docs/templates/pillar3-niche-registry.json.
c. Verify: the niche ID exists in the registry.
d. Verify: verticalSlug matches a row in infra/db/seeds/0004_verticals-master.csv
   with priority=3 and status=planned (NOT deprecated).
e. Verify: pillar3Eligible is true.
f. Verify: templateStatus is READY_FOR_RESEARCH or READY_FOR_IMPLEMENTATION.
g. Verify: owner is null (not currently claimed by another agent).
h. Verify: the niche does not appear in the Completed table in pillar3-template-queue.md.
i. Verify: if a family niche (variant), the anchor is already IMPLEMENTED or SHIPPED.
   If anchor is not yet complete, you must implement the anchor first, not the variant.

IF any condition fails: HALT. Report which condition failed and why. Do not implement.
IF all conditions pass: proceed to Step 4.3 with this niche.
```

### Step 4.2 — Read the Queue (No Explicit Override)

If no explicit niche was assigned, read `docs/templates/pillar3-template-queue.md` and
take the CURRENT niche.

```
a. Read the CURRENT niche block at the top of pillar3-template-queue.md.
b. Note its Niche ID, Vertical, Niche Name, Status.
c. Cross-check in pillar3-niche-registry.json: confirm templateStatus = READY_FOR_RESEARCH.
d. Confirm owner = null (not claimed).
e. If CURRENT is already RESEARCH_IN_PROGRESS or beyond by another agent:
   → Take the next READY_FOR_RESEARCH niche in the queue ordered list.
f. If the CURRENT niche is a family variant whose anchor is not yet IMPLEMENTED:
   → Defer this niche. Take the next available niche whose family dependency is satisfied.
g. If no eligible niche can be found: HALT. Report the queue state.
```

### Step 4.3 — Confirm Eligibility Before Claiming

Before updating any file, confirm all of the following:

```
[ ] Niche exists in pillar3-niche-registry.json
[ ] verticalSlug resolves to an active (non-deprecated) row in 0004_verticals-master.csv
    with priority=3 — NOT gym-fitness, NOT petrol-station, NOT nurtw
[ ] pillar3Eligible = true
[ ] templateStatus = READY_FOR_RESEARCH (or READY_FOR_IMPLEMENTATION if prior research exists)
[ ] owner = null
[ ] No entry in Completed table in pillar3-template-queue.md
[ ] No existing template file at the expected path:
    apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts
[ ] blockers[] array is empty
[ ] dependencies[] packages exist in the repo
[ ] If family member: family role confirmed (anchor or variant)
[ ] If variant: anchor's templateStatus is IMPLEMENTED or SHIPPED
```

If any check fails, HALT and report before proceeding.

### Step 4.4 — Claim the Niche

Only after all checks pass, claim the niche:

```
UPDATE docs/templates/pillar3-niche-registry.json:
  templateStatus → "RESEARCH_IN_PROGRESS"
  researchStatus → "IN_PROGRESS"
  owner → "{your-session-identifier}"  (e.g., "replit-agent-2026-04-26-session-A")

UPDATE docs/templates/pillar3-template-execution-board.md:
  Status column for this niche → RESEARCH_IN_PROGRESS
  Owner column → your session identifier
  Last Updated → today's date

UPDATE docs/templates/pillar3-template-queue.md:
  IF this niche is the CURRENT niche: update the Owner field in the CURRENT block header
    Owner → "{your-session-identifier}"

COMMIT all three files atomically before beginning research.
```

---

## Section 5 — Research Protocol

**This section is mandatory. Building a template without deep prior research is a protocol violation.**

You must launch at minimum 4 parallel research threads before writing any implementation brief.

### Thread A — Nigerian Business Landscape

```
Research target: How does a Nigerian {niche} business actually operate?

Find:
  - Market size, growth, and SME penetration for this niche in Nigeria
  - How many such businesses operate (NBS/SMEDAN data if available)
  - How Nigerian {niche} businesses currently present themselves online (or offline)
  - Top 5-10 Nigerian examples — look at their actual websites if any exist
  - What Nigerian customers expect when they encounter this business type
  - Common customer pain points and service gaps
  - Typical business structure (sole trader, cooperative, SME, enterprise)
  - Pricing norms in Naira (₦) for common services/products
  - Typical location context (market, high street, residential area, estate)

Sources: Nigerian news sites, NBS.gov.ng, SMEDAN reports, CBN data,
Nigerian business directories (VConnect, Businesslist.ng), Google Maps Nigeria reviews
```

### Thread B — Website Design & Content Patterns

```
Research target: What does a best-in-class {niche} business website look like?

Find:
  - What sections do top {niche} websites globally have?
  - What appears above the fold (hero, headline, primary CTA)?
  - What is the typical user journey on this type of site?
  - What content drives conversion (book, enquire, call, WhatsApp)?
  - What trust signals matter most (reviews, certifications, years in business)?
  - What Nigerian or African {niche} websites do well vs poorly?
  - Mobile-first design patterns specific to this niche

Sources: Dribbble, Behance, Awwwards, competitor sites,
WebsiteVoice / SimilarWeb for Nigerian traffic patterns on this category
```

### Thread C — Nigeria-First Localization

```
Research target: What makes this template feel genuinely Nigerian?

Find:
  - Trust signals Nigerian customers look for in this niche
    (certifications: NAFDAC, CAC, MDCN, PCN, NBA, ICAN, SURCON, DPR, NMA, NAICOM, NBC,
    NUPRC, FRSC, NIWA, FMARD, NDLEA, SURCON, etc.)
  - How Nigerians contact and book this type of business
    (WhatsApp first? Phone call? Walk-in? Online form? Instagram DM?)
  - Nigerian language and tone expectations for this niche
    (Formal? Friendly? Pidgin English references? Yoruba/Igbo/Hausa examples?)
  - Payment methods Nigerians expect
    (Paystack, bank transfer, USSD, POS, cash — never Stripe or PayPal)
  - Local geography relevant to this niche
    (cities, LGAs, neighbourhoods, markets for this niche type)
  - Nigerian name examples for fictional testimonials and staff (not western names)
  - Cultural sensitivities or community norms specific to this niche

Sources: Nigerian Twitter/X, Nairaland, Pulse Nigeria, TechCabal, BusinessDay, Nairametrics
```

### Thread D — Visual & Imagery Direction

```
Research target: What does authentic visual content for Nigerian {niche} businesses look like?

Find:
  - What Nigerian {niche} businesses actually look like (environments, staff, products)
  - What imagery genuinely resonates with Nigerian audiences in this sector
  - Nigerian-specific visual elements that build trust
  - What to AVOID: western lifestyle stock imagery that Nigerian customers distrust
  - Specific image concept descriptions (5-7 scenes) for this niche
  - Colour preferences for Nigerian {niche} context

Sources: Nigerian photography Instagram accounts, Shutterstock Africa, Pexels Africa tag
```

### Thread E — Regulatory & Compliance Deep Dive

**[REQUIRED for: health, legal, financial, education, agriculture, energy, transport, civic, institutional]**  
**[SKIP only for niches confirmed to have no regulatory gate]**

```
Research target: What compliance and trust signals are legally or commercially required?

Find:
  - Specific regulatory body requirements (NAFDAC number, CAC reg, MDCN licence, etc.)
  - What these look like in practice on Nigerian business websites
  - Any NDPR obligations for contact forms
  - Industry body memberships and how they are displayed
```

### Research Completion Requirement

Before proceeding to Section 6, you must have:

```
[ ] Thread A findings documented (Nigerian business landscape)
[ ] Thread B findings documented (website design patterns)
[ ] Thread C findings documented (Nigeria-first localization)
[ ] Thread D findings documented (visual/imagery direction)
[ ] Thread E findings documented (if regulatory niche)
[ ] At minimum 10 specific, actionable findings per thread
[ ] At minimum 3 real Nigerian competitor or analogue examples examined
[ ] At least 5 concrete image concept descriptions written out
[ ] Pricing ranges in NGN documented for the most common services/products
```

---

## Section 6 — Research Synthesis Protocol

Synthesise your research into a structured brief before writing any code.

### Step 6.1 — Write the Research Brief

Create this file:
```
docs/templates/research/{vertical-slug}-{niche-slug}-brief.md
```

The brief must contain all of the following sections:

```markdown
# {Niche Display Name} — Nigeria-First Research Brief

**Niche ID:** P3-{vertical-slug}-{niche-slug}
**Vertical slug:** {vertical-slug}
**VN-ID:** {VN-NNN-NNN from vertical-niche-master-map.md}
**Niche family:** {NF-CODE or standalone}
**Family role:** {anchor / variant / standalone}
**Research date:** {today's date}

## 1. Nigerian Business Reality
[3-5 sentences — market size, typical operators, customer base. Grounded in research.]

## 2. Target Audience Profile
[2-3 Nigerian customer personas. Name, occupation, location, why they visit, what converts.]

## 3. Recommended Website Structure
[Pages: home / about / services / contact. Sections per page in order.]

## 4. Content Tone & Voice
[Register, language notes, tagline examples, primary CTA, secondary CTA, what to AVOID.]

## 5. Trust Signal Inventory
[Every trust signal that should appear: CAC, regulatory body certs, testimonials, payment.]

## 6. Image Direction (5-7 Specific Concepts)
[Specific Nigerian scenes — subject, setting, mood. Not generic descriptions.]

## 7. Regulatory Compliance Checklist
[For this niche specifically — what must appear on the site.]

## 8. Nigeria-First Compliance Checklist
[Map the standard checklist from Section 4 of pillar3-template-agent-handoff.md to this niche.]
```

### Step 6.2 — Update Registry After Research

```
UPDATE docs/templates/pillar3-niche-registry.json for this niche:
  researchStatus → "SYNTHESIZED"
  researchBriefPath → "docs/templates/research/{vertical-slug}-{niche-slug}-brief.md"
  templateStatus → "RESEARCH_SYNTHESIZED"
  (then immediately advance to:)
  templateStatus → "READY_FOR_IMPLEMENTATION"
```

---

## Section 7 — Implementation Protocol

Follow the implementation steps exactly as defined in
`docs/templates/pillar3-template-agent-handoff.md` Sections 2–3 (Steps 6–9):

```
STEP 6: Design the Nigeria-First Template Structure (on paper first)
STEP 7: Implement the WebsiteTemplateContract
STEP 8: Verify Implementation Correctness (all checklist items)
STEP 9: Update Registry, Board, and Queue
```

### File Naming Convention

```
Template file:  apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts
Research brief: docs/templates/research/{vertical-slug}-{niche-slug}-brief.md
SQL manifest:   infra/db/seeds/templates/{vertical-slug}-{niche-slug}.sql
```

### TypeScript Template Header (Required)

```typescript
/**
 * {NicheName} — Pillar 3 Website Template
 * Niche ID: P3-{vertical-slug}-{niche-slug}
 * Vertical: {verticalSlug} (priority=3, medium-fit)
 * Category: {category}
 * Family: {NF-CODE or standalone}
 * Research brief: docs/templates/research/{vertical-slug}-{niche-slug}-brief.md
 * Nigeria-First Priority: {critical/high/medium/low}
 * Regulatory signals: {key Nigerian certs required}
 */
```

---

## Section 8 — Nigeria-First Absolute Requirements

Every P3 template, regardless of category, must satisfy ALL of the following:

### Non-Negotiable Requirements

| Requirement | Rule |
|-------------|------|
| WhatsApp CTA | Present on home page AND contact page. Format: `https://wa.me/234XXXXXXXXXX?text=Hello` |
| NGN pricing | All prices in ₦ (Naira). Never USD, GBP, or EUR in user-visible price display. |
| Nigerian cities | Example locations must be Nigerian cities/LGAs. Never London, New York, etc. |
| Nigerian names | Testimonial/staff example names must be Nigerian (Chinyere, Ade, Musa, Ngozi, etc.) |
| Regulatory trust | Nigerian certifications shown where applicable (NAFDAC, CAC, NBA, NMA, SURCON, etc.) |
| Payment methods | Mention Paystack, bank transfer, USSD, POS — never Stripe, PayPal, Venmo |
| Mobile layout | Must work at 375px viewport minimum |
| esc() function | All user-supplied strings must go through esc() — no exceptions |
| No NDPR violations | Contact forms must include NDPR consent notice if collecting PII |

### Category-Specific Requirements

| Category | Additional Requirement |
|----------|----------------------|
| health | MDCN/NAFDAC/NMA licence numbers displayed where applicable |
| financial | CBN licence or FIRS TIN displayed; AML notice if applicable |
| education | SUBEB/WAEC/NERDC framework compliance noted |
| legal/professional | NBA/CITN/ICAN/SURCON/COREN membership displayed |
| agricultural | NAFDAC/FMARD registration where applicable |
| civic (religious) | Respectful tone; appropriate faith-specific trust signals |
| transport | FRSC/NIWA/NUPRC/VIO licence displayed |

---

## Section 9 — Tracking Update Protocol

After successfully implementing and verifying a niche template, update all three tracking files:

### 9.1 — Update Registry

```json
{
  "templateStatus": "IMPLEMENTED",
  "primaryTemplatePath": "apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts",
  "runtimeIntegrationStatus": "REGISTERED_IN_BUILT_IN_TEMPLATES",
  "implementedAt": "{today-ISO-8601}",
  "templateVariantCount": 1,
  "marketplaceManifestSlug": "{vertical-slug}-{niche-slug}",
  "owner": null,
  "nextAction": "Deploy to production and verify rendering on test tenant"
}
```

### 9.2 — Update Execution Board

```
- Update status column: IMPLEMENTED
- Update owner column: — (released)
- Update "Last Updated": today's date
- Update summary counts table
- Add row to Completed Niches section
```

### 9.3 — Update Queue

```
- Move this niche from CURRENT to COMPLETED section
- Advance CURRENT pointer to next READY_FOR_RESEARCH niche in ordered list
- Verify next niche is not a variant whose anchor is not yet IMPLEMENTED
```

### 9.4 — Commit Message Format

```
feat(p3-templates): implement {niche-slug} template

Niche ID: P3-{vertical-slug}-{niche-slug}
Niche: {Niche Display Name}
Category: {category}
Nigeria-First Priority: {critical/high/medium/low}
Research brief: docs/templates/research/{vertical-slug}-{niche-slug}-brief.md

- WebsiteTemplateContract implemented (home/about/services/contact)
- Registered in BUILT_IN_TEMPLATES
- Marketplace SQL manifest created
- P3 registry status: IMPLEMENTED
- TypeScript: 0 errors
- Nigeria-First compliance: VERIFIED
```

---

## Section 10 — Error Handling

### If Queue is Empty

```
All 77 P3 niches are SHIPPED or IMPLEMENTED.
Report: "All Pillar 3 niches are complete."
No further template work required.
```

### If a Niche is Found Abandoned (owner set, >24h inactive)

```
Do NOT proceed.
Report the abandoned niche, the owner ID, and the last updated timestamp.
A human must reset owner to null before you can claim.
```

### If TypeScript Compilation Fails

```
Do NOT set status to IMPLEMENTED.
Fix all TypeScript errors before proceeding.
Run: pnpm --filter @webwaka/brand-runtime typecheck
```

### If Research Reveals the Niche is Not Viable

```
Set templateStatus = BLOCKED
Populate blockers[] with specific reasons
Set nextAction = "Review niche viability"
Set owner = null
Pick the next available niche from the queue.
```

---

## Section 11 — Reference: The 77 P3 Niches Quick Reference

### SHIPPED (7) — Do Not Re-Implement

`tax-consultant` · `tutoring` · `creche` · `mobile-money-agent` · `bureau-de-change` · `hire-purchase` · `community-hall`

### CURRENT (1)

`mosque` → READY_FOR_RESEARCH — niche ID: `P3-mosque-mosque-community-platform`

### READY_FOR_RESEARCH — Batch 1 (Critical, Unblocked)

`hair-salon` · `poultry-farm` · `market-association` · `water-vendor` · `phone-repair-shop` · `palm-oil-trader` · `okada-keke` · `tailoring-fashion` · `used-car-dealer`

### READY_FOR_RESEARCH — Batch 2 (High, Unblocked)

`building-materials` · `electrical-fittings` · `cassava-miller` · `generator-dealer` · `fish-market` · `wedding-planner` · `private-school` · `community-health` · `professional-association` · `campaign-office`

### READY_FOR_RESEARCH — Batch 3

`lga-office` · `community-radio` · `airtime-reseller` · `land-surveyor` · `womens-association` · `youth-organization` · `ministry-mission` · `abattoir` · `ferry` · `borehole-driller`

### READY_FOR_RESEARCH — Batch 4

`printing-press` · `startup` · `recording-label` · `talent-agency` · `podcast-studio` · `motivational-speaker` · `govt-school` · `rehab-centre` · `elderly-care`

### READY_FOR_RESEARCH — Batch 5 (Variants — Anchor First)

`spare-parts` (anchor: used-car-dealer) · `tyre-shop` (anchor: used-car-dealer) · `car-wash` (anchor: used-car-dealer) · `motorcycle-accessories` (anchor: used-car-dealer) · `iron-steel` (anchor: building-materials) · `paints-distributor` (anchor: electrical-fittings) · `plumbing-supplies` (anchor: electrical-fittings)

### READY_FOR_RESEARCH — Batch 6

`food-processing` · `produce-aggregator` · `cocoa-exporter` · `vegetable-garden` · `oil-gas-services` · `artisanal-mining` · `airport-shuttle` · `container-depot` · `cargo-truck` · `funeral-home`

### READY_FOR_RESEARCH — Batch 7

`pr-firm` · `shoemaker` · `newspaper-distribution` · `laundry-service` · `cleaning-company` · `internet-cafe` · `orphanage` · `sports-club` · `book-club` · `polling-unit-rep` · `constituency-office` · `government-agency` · `events-centre` · `nursery-school` (anchor: private-school)

---

*Last updated: 2026-04-26*  
*This document is read-only for agents — do not modify without human authorisation.*  
*Designed for build-once, reuse-infinitely execution across all 77 Pillar 3 niches.*
