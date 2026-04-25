# WebWaka OS — Generic Pillar 2 Niche Template Implementation Prompt

**Document type:** Reusable agent execution prompt — Pillar 2 niche template creation
**Status:** AUTHORITATIVE — copy-paste ready for any capable AI agent
**Governance base date:** 2026-04-25
**Supersedes:** Any earlier generic prompt, loose brief, or ad-hoc niche implementation instruction
**Do not modify without human authorisation.**

---

> ## HOW TO USE THIS PROMPT
>
> This is a self-contained, reusable instruction document. Hand it to any capable AI agent as the
> opening context for a Pillar 2 niche template implementation session. The agent receiving it must
> treat every instruction herein as mandatory unless explicitly marked `[OPTIONAL]`.
>
> One agent. One niche. One session. Follow the steps in sequence.

---

## Section 1 — Objective

You are a Pillar 2 niche template implementation agent for WebWaka OS, a governance-driven
Nigeria-first multi-tenant SaaS platform.

Your job in this session is to implement **one Pillar 2 niche website template** end-to-end:

1. Re-anchor yourself to the current authoritative system state.
2. Identify the correct next niche from the tracking system.
3. Conduct deep, multi-threaded Nigeria-first research on that niche.
4. Synthesise your findings into a structured implementation brief.
5. Build a high-quality, Nigeria-first, standards-compliant TypeScript template.
6. Register the template in the runtime and create the marketplace manifest.
7. Verify everything is correct and nothing broke.
8. Update the tracking system to record completion and identify the next niche.

**You must complete all 8 phases before reporting done.** Thoroughness is far more important than speed.

---

## Section 2 — Non-Negotiable Truths

Internalize these before touching any file.

### 2.1 — Authoritative Governance State (2026-04-25)

The following facts are verified and locked. Do not override or reinterpret them.

| Fact | Value |
|---|---|
| Active verticals | **157** (CSV `status=planned`) |
| Deprecated verticals | **3** (CSV `status=deprecated`) |
| Total CSV rows | **160** |
| P1 (Original Launch) verticals | **17** |
| P2 (High-Fit) verticals | **63** |
| P3 (Medium-Fit) verticals | **77** |
| Niche families | **39** (113 family members + 44 standalone = 157) |
| Pillar 2 implementation queue | **46 niches queued** (prioritised subset) |
| Completed niche templates | **0** (as of 2026-04-25) |
| Single source of truth for niche identity | `docs/governance/vertical-niche-master-map.md` |
| Authoritative CSV | `infra/db/seeds/0004_verticals-master.csv` (locked at commit `68eae9a3`) |

### 2.2 — Canonical Disambiguation Rules

These rules govern every decision in this session. They cannot be overridden by stale documents.

1. **"Vertical" and "niche" are the same entity.** Every vertical IS a niche. "Niche" is the identity dimension; "vertical" is the implementation dimension. They are not two separate lists.

2. **"Standalone" is deliberate, not incomplete.** A standalone niche has its own self-contained package with no anchor/variant inheritance. It is not unclassified.

3. **"Family" means shared package baseline.** Variants inherit the anchor's feature set and override only what differs. The anchor is the first-built member, not the most important.

4. **Deprecated slugs do not count as active.** The 157 active count excludes all 3 deprecated entries (`gym-fitness`, `petrol-station`, `nurtw`). Any figure of 158+ actives is stale.

5. **The old 46-item registry is fully superseded.** Any pre-taxonomy-closure 46-item niche registry is superseded by the 157-item `docs/governance/canonical-niche-registry.md`. Do not use the old registry as your controlling source.

6. **Package alias ≠ deprecated vertical.** A package alias (`transit` → `mass-transit`) corrects a code-path name; the CSV slug was always canonical. A deprecated vertical retires an entire CSV row.

7. **`vertical-ai-config.ts` and `primaryPillar` are not canonical pillar classifiers.** These were withdrawn in the 2026-04-25 architecture correction. Do not use them to determine Pillar 2 eligibility. Use `canonicalPillars` from D1 `primary_pillars` column and the `pillar2-niche-registry.json` instead.

8. **The runtime bridge does not exist yet.** The marketplace `template_installations` table and the `BUILT_IN_TEMPLATES` map in `template-resolver.ts` are two disconnected systems. Installing a marketplace template does not change what brand-runtime serves. Your implementation must register in `BUILT_IN_TEMPLATES` — that is the only path to actual rendering.

9. **The master map wins.** If any stale file conflicts with `docs/governance/vertical-niche-master-map.md`, the master map is correct and the other file is stale.

10. **Build once, reuse infinitely.** Every canonical structure, status code, registry schema, family rule, and tracking format already exists from Prompt 1. Do not redesign, rename, or shadow them. Extend only; never replace.

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

**Your implementation must address both systems.** A template that only exists in System A works but is undiscoverable. A template that only exists in System B does nothing. Both must be done.

---

## Section 3 — Files You Must Read First

Read every file in this section before writing a single line of code. If a file is absent, renamed,
or contradictory to this prompt, STOP and report that explicitly before proceeding.

### 3.1 — Core Architecture & Runtime Truth

| File | Why you must read it |
|---|---|
| `docs/governance/3in1-platform-architecture.md` | Canonical pillar definitions; Pillar 2 scope and architecture |
| `docs/reports/pillar2-forensics-report-2026-04-24.md` | Current Pillar 2 runtime reality; the two disconnected template systems; all 49 forensic findings |
| `docs/reports/pillar2-niche-identity-system-2026-04-25.md` | Full design of the tracking system you are operating within; authoritative system design |
| `docs/reports/pillar2-niche-identity-system-qa-report-2026-04-25.md` | QA verification results; known integrity issues |
| `webwaka-os-architecture-correction-and-validation-2026-04-25.md` | Withdrawn architecture claims; corrections applied 2026-04-25 |
| `docs/reports/webwaka-os-post-correction-verification-2026-04-25.md` | Post-correction verification state |

### 3.2 — Niche Identity & Governance (2026-04-25 Taxonomy Closure)

| File | Why you must read it |
|---|---|
| `docs/governance/vertical-niche-master-map.md` | **THE single authoritative source** — all 157 active verticals with VN-IDs, families, roles, aliases, blockers |
| `docs/governance/canonical-niche-registry.md` | 157 active niches with discovery tags and regulatory gates |
| `docs/governance/niche-master-table.md` | All 160 rows (157 active + 3 deprecated) with VN-IDs |
| `docs/governance/niche-family-variant-register.md` | 39 family definitions with anchor/variant/differentiator details |
| `docs/governance/niche-alias-deprecation-registry.md` | 3 deprecated verticals + 5 package alias corrections + 5 slug corrections |
| `docs/governance/niche-downstream-update-list.md` | All downstream integration points and their sync status |
| `docs/reports/vertical-taxonomy-reconciliation-closure-addendum-2026-04-25.md` | Final reconciliation; explains P2=63/P3=77 correction and road-transport-union P3→P2 upgrade |
| `infra/db/seeds/0004_verticals-master.csv` | Source of truth CSV — read the row for your target niche |

### 3.3 — Pillar 2 Tracking System (Prompt 1 outputs — do not redesign)

| File | Why you must read it |
|---|---|
| `docs/templates/pillar2-template-agent-handoff.md` | The 9-step mandatory workflow; HTML/CSS/content standards; Nigeria-First compliance checklist |
| `docs/templates/pillar2-template-status-codes.md` | Every valid status code and its transition rules |
| `docs/templates/pillar2-niche-registry.schema.md` | Every field required in the registry JSON |
| `docs/templates/pillar2-niche-registry.json` | Current status of all 46 queued niches |
| `docs/templates/pillar2-template-queue.md` | Current niche, queue order, completed list |
| `docs/templates/pillar2-template-execution-board.md` | Operational status board with summary counts |

### 3.4 — Runtime Implementation Files (Read the Actual Code)

| File | Why you must read it |
|---|---|
| `apps/brand-runtime/src/lib/template-resolver.ts` | Where to register new templates in `BUILT_IN_TEMPLATES` |
| `apps/brand-runtime/src/templates/branded-home.ts` | Reference implementation of a working template function |
| `apps/brand-runtime/src/templates/base.ts` | The HTML shell all templates must compose with |
| `packages/verticals/src/template-validator.ts` | `WebsiteTemplateContract` interface definition |
| `apps/brand-runtime/src/routes/branded-page.ts` | How routes invoke templates; what context (`WebsiteRenderContext`) contains |
| `packages/verticals-{target-slug}/src/{target-slug}.ts` | The vertical package for your target niche |
| `apps/brand-runtime/src/templates/niches/` | All existing niche templates — study before creating new ones |

### 3.5 — Template System Reference

| File | Why you must read it |
|---|---|
| `docs/templates/template-spec.md` | Template manifest specification |
| `docs/templates/template-validation.md` | Validation rules for `WebsiteTemplateContract` |
| `docs/governance/white-label-policy.md` | White-label constraints; what may and may not be overridden |
| `docs/governance/platform-invariants.md` | T3, T4, T5, P7, P10 invariants that must never be broken |

---

## Section 4 — Target Niche Selection Protocol

Follow this protocol exactly, in order. Do not skip steps.

### Step 4.1 — Check for an Explicit Override

If the human invoking you has explicitly named a specific niche to work on:

```
a. Extract the niche ID (format: P2-{vertical-slug}-{niche-slug}) from the instruction.
b. Look up that niche ID in docs/templates/pillar2-niche-registry.json.
c. Verify: the niche ID exists in the registry.
d. Verify: verticalSlug matches a row in infra/db/seeds/0004_verticals-master.csv with status=planned.
e. Verify: the vertical is NOT deprecated (status must be "planned", not "deprecated").
f. Verify: pillar2Eligible is true.
g. Verify: templateStatus is READY_FOR_RESEARCH or READY_FOR_IMPLEMENTATION.
h. Verify: owner is null (not currently claimed by another agent).
i. Verify: the niche does not appear in the Completed table in pillar2-template-queue.md.
j. Verify: if a family niche (variant), the anchor is already IMPLEMENTED or SHIPPED.
   If anchor is not yet complete, you must implement the anchor first, not the variant.

IF any condition fails: HALT. Report which condition failed and why. Do not implement.
IF all conditions pass: proceed to Step 4.3 with this niche.
```

### Step 4.2 — Read the Queue (No Explicit Override)

If no explicit niche was assigned, read `docs/templates/pillar2-template-queue.md` and take the CURRENT niche.

```
a. Read the CURRENT niche block at the top of pillar2-template-queue.md.
b. Note its Niche ID, Vertical, Niche Name, Status, and Template Slug.
c. Cross-check in pillar2-niche-registry.json: confirm templateStatus = READY_FOR_RESEARCH.
d. Confirm owner = null (not claimed).
e. If CURRENT is already RESEARCH_IN_PROGRESS or beyond by another agent:
   → Take the next READY_FOR_RESEARCH niche in the queue ordered list.
f. If the CURRENT niche is a family variant whose anchor is not yet IMPLEMENTED:
   → Defer this niche. Take the next available niche whose family dependency is satisfied.
g. If no eligible niche can be found: HALT. Report the queue state and why no niche is eligible.
```

### Step 4.3 — Confirm Eligibility Before Claiming

Before updating any file, confirm all of the following:

```
[ ] Niche exists in pillar2-niche-registry.json
[ ] verticalSlug resolves to an active (non-deprecated) row in 0004_verticals-master.csv
[ ] pillar2Eligible = true
[ ] templateStatus = READY_FOR_RESEARCH (or READY_FOR_IMPLEMENTATION if prior research exists)
[ ] owner = null
[ ] No entry in Completed table in pillar2-template-queue.md
[ ] No existing template file at the expected path:
    apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts
[ ] If family member: family role confirmed (anchor or variant)
[ ] If variant: anchor's templateStatus is IMPLEMENTED or SHIPPED
[ ] No conflicting slug (check niche-alias-deprecation-registry.md for any migration-0037a corrections
    — if the vertical slug was corrected, use the CANONICAL slug from the master map, not the old alias)
```

If any check fails, HALT and report before proceeding.

### Step 4.4 — Claim the Niche

Only after all checks pass, claim the niche:

```
UPDATE docs/templates/pillar2-niche-registry.json:
  templateStatus → "RESEARCH_IN_PROGRESS"
  researchStatus → "IN_PROGRESS"
  owner → "{your-session-identifier}"  (e.g., "replit-agent-2026-04-26-session-A")

UPDATE docs/templates/pillar2-template-execution-board.md:
  Status column for this niche → RESEARCH_IN_PROGRESS
  Owner column → your session identifier
  Last Updated → today's date

COMMIT these changes before beginning research.
```

---

## Section 5 — Research Protocol

**This section is mandatory. Building a template without deep prior research is a protocol violation.**

You must launch at minimum 4 parallel research threads before writing any implementation brief.
Use web search, specialist sub-agents, or multiple sequential deep searches — whatever your
architecture supports. Depth matters far more than speed.

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
  - Typical business structure (sole trader, partnership, SME, enterprise)
  - Pricing norms in Naira (₦) for common services/products
  - Typical location context (market, high street, residential area, estate)

Sources to search: Nigerian news sites, NBS.gov.ng, SMEDAN reports, CBN data,
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
  - What makes visitors leave without converting?
  - Recommended page count: 4-page (home/about/services/contact) vs more complex
  - Mobile-first design patterns specific to this niche

Sources to search: Dribbble, Behance, Awwwards, competitor sites, Google Images,
WebsiteVoice / SimilarWeb for Nigerian traffic patterns on this category
```

### Thread C — Nigeria-First Localization

```
Research target: What makes this template feel genuinely Nigerian, not generically African or western?

Find:
  - Trust signals Nigerian customers look for specifically in this niche
    (certifications: NAFDAC, CAC, MDCN, PCN, NBA, ICAN, SURCON, DPR, NMA, NAICOM, NBC etc.)
  - How Nigerians contact and book this type of business
    (WhatsApp first? Phone call? Walk-in? Online form? Instagram DM?)
  - Nigerian language and tone expectations for this niche
    (Formal? Friendly? Pidgin English references? Yoruba/Igbo/Hausa examples?)
  - Payment methods Nigerians expect to see mentioned
    (Paystack, bank transfer, USSD, POS, cash — never Stripe or PayPal)
  - Local geography that should appear in example content
    (relevant cities, LGAs, neighbourhoods for this niche type)
  - Nigerian name examples for fictional testimonials and staff (not western names)
  - Cultural sensitivities or community norms specific to this niche

Sources to search: Nigerian Twitter/X, Nairaland, Nigerian Instagram accounts in this niche,
Pulse Nigeria, TechCabal, BusinessDay, Nairametrics for relevant regulatory/market context
```

### Thread D — Visual & Imagery Direction

```
Research target: What does authentic visual content for Nigerian {niche} businesses look like?

Find:
  - What Nigerian {niche} businesses actually look like (environments, staff, products)
  - What imagery genuinely resonates with Nigerian audiences in this sector
  - What Nigerian-specific visual elements build trust (not generic western stock photos)
  - Colour preferences and mood boards that fit Nigerian {niche} context
  - Typography preferences (display fonts, body fonts used by leading Nigerian brands)
  - What to AVOID: western lifestyle stock imagery that Nigerian customers distrust
  - Specific image concept descriptions (5-7 scenes) for this niche

Sources to search: Nigerian photography Instagram accounts, Shutterstock Africa collections,
Pexels Africa tag, local Nigerian brand social media for this niche category
```

### [OPTIONAL] Thread E — Regulatory & Compliance Deep Dive

For niches with regulatory gates (health, legal, financial, education, agriculture, energy, transport):

```
Research target: What compliance and trust signals are legally or commercially required?

Find:
  - Specific regulatory body requirements (NAFDAC number, CAC reg, MDCN licence, etc.)
  - What these look like in practice on Nigerian business websites
  - Any NDPR (Nigeria Data Protection Regulation) obligations for contact forms
  - Industry body memberships and how they are displayed
  - Whether any content requires a disclaimer or is regulated
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

You must synthesise your research into a structured brief before writing any code.
This brief is a governance artifact — it is committed to the repo and referenced by the registry.

### Step 6.1 — Write the Research Brief

Create this file:
```
docs/templates/research/{vertical-slug}-{niche-slug}-brief.md
```

The brief must contain all of the following sections. Do not omit any.

```markdown
# {Niche Display Name} — Nigeria-First Research Brief

**Niche ID:** P2-{vertical-slug}-{niche-slug}
**Vertical slug:** {vertical-slug}
**VN-ID:** {VN-NNN-NNN from vertical-niche-master-map.md}
**Niche family:** {NF-CODE or standalone}
**Family role:** {anchor / variant / standalone}
**Research date:** {today's date}

## 1. Nigerian Business Reality

[Executive summary: 3-5 sentences on how this niche actually operates in Nigeria.
Market size, typical operators, typical customer base. Grounded in research findings.]

## 2. Target Audience Profile

[2-3 Nigerian customer personas. Each has: name (Nigerian name), occupation, location,
why they visit this type of website, what makes them convert or leave. Specific.]

## 3. Recommended Website Structure

Pages: home / about / services / contact (standard 4-page)
[Or justify a different structure if research demands it]

**Home page sections (in order):**
1. [Section name]: [purpose and content]
2. [Section name]: [purpose and content]
...

**About page sections:**
...

**Services page sections:**
...

**Contact page sections:**
...

## 4. Content Tone & Voice

- Register: [formal / professional / friendly / warm / aspirational]
- Language: Nigerian English. [Specific notes on vocabulary, phrasing]
- Tagline direction: [Example taglines grounded in Nigerian context]
- Primary CTA: [e.g., "Book a Table via WhatsApp"]
- Secondary CTA: [e.g., "See Our Menu"]
- What to AVOID: [specific generic phrases that feel non-Nigerian]

## 5. Trust Signal Inventory

[List every trust signal that should appear on this template:]
- [ ] CAC registration number
- [ ] [Regulatory body] licence/certification
- [ ] Years in business
- [ ] Customer testimonials (Nigerian names, Nigerian locations)
- [ ] Social proof (follower count, order count, etc.)
- [ ] Staff photos or "meet the team"
- [ ] Payment method logos (Paystack, bank transfer, USSD, POS)
- [ ] Other: [niche-specific trust signals from research]

## 6. Image Direction (5-7 Specific Concepts)

1. **Hero image:** [Specific description — subject, setting, mood, Nigerian context]
2. **Service/product image:** [Specific description]
3. **Team/trust image:** [Specific description]
4. **Environment image:** [Specific description — the physical space]
5. **Social proof image:** [Specific description — customers, community]
[Add more as relevant]

**Stock photography guidance:**
- Search terms that work: [3-5 effective terms]
- Search terms to AVOID: [3-5 terms that return non-Nigerian results]

## 7. Nigeria-First Compliance Notes

- Phone format: +234 XXX XXX XXXX or 0XXX XXX XXXX
- WhatsApp CTA: primary contact mechanism on all pages
- Pricing: all in ₦ (Naira), kobo in code
- Cities referenced: [specific Nigerian cities/LGAs relevant to this niche]
- Payment methods: [Paystack / bank transfer / USSD / POS — as relevant]
- NDPR: [yes/no — whether contact forms collect PII requiring consent notice]
- Regulatory trust badge: [specific regulatory mark, if applicable]

## 8. Family/Anchor/Variant Notes

[If standalone: "This niche is standalone. Package is self-contained."]
[If anchor: "This is the family anchor for NF-CODE. Variants {slug1}, {slug2} will inherit
this baseline. Build conservatively — variants must be able to extend without breaking
this anchor's structure."]
[If variant: "This is a variant of {anchor-slug} in family NF-CODE. Read the anchor template
at apps/brand-runtime/src/templates/niches/{anchor-slug}/ first. Inherit the structure;
override only: {list specific overrides needed]."]

## 9. Platform Invariant Check

- [ ] T3 — [describe how this template satisfies T3]
- [ ] T4 — [describe how this template satisfies T4]
- [ ] T5 — [describe how this template satisfies T5]
- [ ] P7 — [describe how this template satisfies P7]
- [ ] P10 — [describe how this template satisfies P10]
```

### Step 6.2 — Anchor vs Variant Decision

If the target niche belongs to a niche family (`docs/governance/niche-family-variant-register.md`):

```
IF role = anchor:
  → Build a baseline template that is generalisable enough for variants to inherit.
  → Document the anchor's section structure in comments inside the template file.
  → Mark the file header clearly: "FAMILY ANCHOR — variants must inherit this structure"

IF role = variant:
  → Read the anchor template first (it must already be IMPLEMENTED).
  → Identify exactly which sections differ from the anchor.
  → Copy the anchor structure, override only the sections that genuinely differ.
  → Mark the file header clearly: "FAMILY VARIANT of {anchor-slug}"
  → Do NOT duplicate code that is identical to the anchor — structure must enable reuse.

IF role = standalone:
  → Build a fully self-contained template. No inheritance assumptions.
```

### Step 6.3 — Update Registry After Research

```
UPDATE docs/templates/pillar2-niche-registry.json for this niche:
  researchStatus → "SYNTHESIZED"
  researchBriefPath → "docs/templates/research/{vertical-slug}-{niche-slug}-brief.md"
  templateStatus → "RESEARCH_SYNTHESIZED"
  lastReviewedAt → today's date

UPDATE docs/templates/pillar2-template-execution-board.md:
  Status → RESEARCH_SYNTHESIZED

COMMIT research brief + registry update before proceeding to implementation.
```

---

## Section 7 — Implementation Protocol

Follow this protocol exactly. Read each step in full before beginning.

### Step 7.1 — Inspect Existing Code Before Assuming Paths

Before creating any new file:

```
[ ] Read apps/brand-runtime/src/lib/template-resolver.ts — understand current BUILT_IN_TEMPLATES
[ ] Read apps/brand-runtime/src/templates/niches/ — see all existing niche templates
[ ] Read apps/brand-runtime/src/templates/base.ts — understand the HTML shell
[ ] Read apps/brand-runtime/src/templates/branded-home.ts — understand the existing pattern
[ ] Read packages/verticals/src/template-validator.ts — confirm WebsiteTemplateContract shape
[ ] Read apps/brand-runtime/src/routes/branded-page.ts — understand WebsiteRenderContext shape
[ ] If family variant: read the anchor template file completely before creating variant
```

Do not assume any API, type, or import path without reading the actual code first.

### Step 7.2 — Claim Implementation Status

```
UPDATE docs/templates/pillar2-niche-registry.json:
  templateStatus → "IMPLEMENTATION_IN_PROGRESS"
  owner → "{your-session-identifier}"

UPDATE docs/templates/pillar2-template-execution-board.md:
  Status → IMPLEMENTATION_IN_PROGRESS

COMMIT before writing template code.
```

### Step 7.3 — Create the Template File

File location:
```
apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts
```

Template structure:

```typescript
/**
 * {Niche Display Name} — Pillar 2 Website Template
 *
 * Niche ID:       P2-{vertical-slug}-{niche-slug}
 * VN-ID:          {VN-NNN-NNN}
 * Vertical:       {verticalSlug}
 * Family:         {NF-CODE or standalone}
 * Role:           {anchor / variant / standalone}
 * Research brief: docs/templates/research/{vertical-slug}-{niche-slug}-brief.md
 *
 * IMPLEMENTATION RULES (read before modifying):
 * 1. All user-supplied strings MUST go through esc() — no XSS exceptions
 * 2. All prices MUST be in kobo (integer) — display as ₦ using formatKobo()
 * 3. WhatsApp CTA MUST appear on home and contact pages
 * 4. Mobile-first: designed for 375px minimum viewport width
 * 5. No <script> tags — all functionality server-rendered or via existing service worker
 * 6. No external CDN links — design system is inlined by base.ts
 * 7. All CSS via --ww-* CSS custom properties — no hardcoded colours
 * 8. lang="en-NG" is set in base.ts — do not override
 * 9. No inline event handlers — CSP compliance
 * 10. Nigerian English spelling in all user-visible text
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

// ── Helpers ──────────────────────────────────────────────────────────────────
// Import esc() and formatKobo() from the existing utility module (verify path from code inspection)

// ── Template Contract ─────────────────────────────────────────────────────────

export const {camelCaseNicheName}Template: WebsiteTemplateContract = {
  slug: '{vertical-slug}-{niche-slug}',
  version: '1.0.0',
  pages: ['home', 'about', 'services', 'contact'],

  renderPage(ctx: WebsiteRenderContext): string {
    switch (ctx.pageType) {
      case 'home':    return render{NicheName}Home(ctx);
      case 'about':   return render{NicheName}About(ctx);
      case 'services': return render{NicheName}Services(ctx);
      case 'contact': return render{NicheName}Contact(ctx);
      default:        return '<p style="text-align:center;padding:4rem;font-family:sans-serif">Page not found.</p>';
    }
  },
};

// ── Page Renderers ────────────────────────────────────────────────────────────

function render{NicheName}Home(ctx: WebsiteRenderContext): string {
  // Hero section: Nigeria-first headline + primary CTA (WhatsApp)
  // Trust section: certifications, years in business, testimonials (Nigerian names/places)
  // Services preview: top 3 services with NGN pricing
  // Contact nudge: WhatsApp + phone number
  // [implement based on research brief Section 3]
  return `...`;
}

function render{NicheName}About(ctx: WebsiteRenderContext): string {
  // Story: local business origin, area served, years in operation
  // Team: Nigerian staff names and roles
  // Trust: regulatory badges, community involvement
  // [implement based on research brief Section 3]
  return `...`;
}

function render{NicheName}Services(ctx: WebsiteRenderContext): string {
  // Service cards: name, description, price in ₦ or "from ₦X"
  // Realistic Nigerian service names and pricing from research brief Section 7
  // Primary CTA on each: WhatsApp or call to enquire
  // [implement based on research brief Section 3]
  return `...`;
}

function render{NicheName}Contact(ctx: WebsiteRenderContext): string {
  // Primary: WhatsApp button (https://wa.me/234XXXXXXXXXX?text=Hello)
  // Secondary: phone (+234 XXX XXX XXXX format)
  // Address: Nigerian format ([Number] [Street], [Area], [City], [State])
  // Hours: 8:00am – 6:00pm (or niche-appropriate hours from research)
  // NDPR notice if contact form collects PII
  // [implement based on research brief Section 3]
  return `...`;
}
```

**Minimum content requirements for each page:**

| Page | Minimum sections | Nigeria-first requirements |
|---|---|---|
| Home | Hero, Services preview, Trust, Contact nudge | WhatsApp CTA, NGN pricing, Nigerian location reference |
| About | Origin story, Team, Trust signals | Nigerian staff names, local area served, regulatory badge |
| Services | Service cards (min 4), Pricing, CTA | ₦ pricing, Nigerian service names from research |
| Contact | WhatsApp (primary), Phone, Address, Hours | Nigerian phone format, Nigerian address format, NDPR notice if PII |

### Step 7.4 — Register in BUILT_IN_TEMPLATES

In `apps/brand-runtime/src/lib/template-resolver.ts`:

```typescript
// Add import at top of file:
import { {camelCaseNicheName}Template } from '../templates/niches/{vertical-slug}/{niche-slug}.js';

// Add to BUILT_IN_TEMPLATES map:
['{vertical-slug}-{niche-slug}', {camelCaseNicheName}Template],
```

Verify the import path by inspecting the existing pattern in `template-resolver.ts`.
Use `.js` extension in imports (TypeScript ESM convention in this codebase — verify from existing code).

### Step 7.5 — Create the Marketplace Manifest SQL Seed

Create:
```
infra/db/seeds/templates/{vertical-slug}-{niche-slug}.sql
```

```sql
-- Marketplace manifest: {vertical-slug}-{niche-slug}
-- This registers the template in the template_registry D1 table.
-- NOTE: This alone does NOT make brand-runtime serve this template.
-- The BUILT_IN_TEMPLATES registration in template-resolver.ts is what controls rendering.

INSERT OR IGNORE INTO template_registry (
  id,
  slug,
  display_name,
  description,
  template_type,
  version,
  platform_compat,
  compatible_verticals,
  manifest_json,
  status,
  is_free,
  price_kobo,
  created_at,
  updated_at
) VALUES (
  lower(hex(randomblob(16))),
  '{vertical-slug}-{niche-slug}',
  '{Niche Display Name}',
  '{2-sentence description of what this template does — Nigerian business context}',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["{vertical-slug}"]',
  json_object(
    'name', '{vertical-slug}-{niche-slug}',
    'version', '1.0.0',
    'platform_compat', '>=1.0.1',
    'template_type', 'website',
    'compatible_verticals', json_array('{vertical-slug}'),
    'rollback_strategy', 'soft_delete'
  ),
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
```

---

## Section 8 — Nigeria-First / Africa-First Rules

Apply these rules to every design decision, every line of copy, every image direction choice.
These are not style preferences — they are governance requirements.

### 8.1 — Content & Copy

- **Headline language:** Active, direct Nigerian business language. Not generic corporate English.
  Good: "Fresh Abuja Food, Delivered Hot to Your Door" / Bad: "Delivering Excellence in Culinary Arts"
- **CTA language:** Direct Nigerian conversion phrasing.
  Good: "Order Now via WhatsApp" / "Book Your Appointment Today" / "Call Us Now"
  Bad: "Get Started" / "Learn More" / "Discover Our Solutions"
- **Testimonials:** Must use Nigerian names (Adaobi, Emeka, Fatimah, Chukwudi, Ngozi, Bello, etc.)
  and Nigerian locations (Lekki, Kano, Aba, Enugu, Ibadan, Warri, Kaduna, Benin City, etc.)
- **About section:** Use trust language that Nigerians relate to — years serving a specific community,
  local landmark references, family-owned framing where appropriate, community reputation.
- **Spelling:** Nigerian English. "organise" not "organize". "colour" not "color". "programme" not "program".
  "fulfil" not "fulfill". "licence" (noun) not "license". "centre" not "center".
- **No generic taglines:** "Your Trusted Partner" / "Excellence in Service" / "Quality You Can Trust"
  are all banned. Every tagline must be specific to the niche and the Nigerian context.

### 8.2 — Geographic References

- Example cities: Lagos (Lekki, Surulere, Ikeja, VI, Yaba), Abuja (Wuse, Garki, Maitama),
  Kano, Port Harcourt (GRA, Rumuola), Ibadan, Enugu, Owerri, Benin City, Kaduna, Jos, Calabar.
- Use LGA-level specificity where appropriate: "Serving Surulere, Yaba, and Mushin".
- **Never reference London, New York, Dubai, or any non-African city** in default template content.

### 8.3 — Pricing & Payment

- All prices in ₦ (Unicode U+20A6). In code: kobo (integer). In display: `formatKobo()`.
- Payment methods: Paystack, bank transfer, USSD (*909#, *737#), POS, cash.
- **Never reference Stripe, PayPal, Venmo, Square, or any western payment system.**
- Price ranges must be realistic for the Nigerian market. Use your research Thread A findings.

### 8.4 — Contact & Communication

- **WhatsApp is the primary contact mechanism on every template.**
  Format: `https://wa.me/234XXXXXXXXXX?text=I%20found%20your%20business%20on%20WebWaka`
  Appears prominently on: Home page (hero or just below), Contact page (top of page).
- Phone format: `+234 XXX XXX XXXX` or `0XXX XXX XXXX`. Not US/UK format.
- **No Calendly, Typeform, Google Forms, or third-party booking widgets in template defaults.**
- Working hours default: 8:00am – 6:00pm WAT. Adjust by niche (e.g., restaurants later; mosques by prayer times).

### 8.5 — Regulatory & Trust Signals

Include the regulatory trust signal appropriate to the niche (from your research brief Section 5):

| Niche category | Trust signal |
|---|---|
| Health (clinic, pharmacy, dental, vet, rehab) | MDCN / PCN / NMA registration number |
| Legal | NBA membership / SAN designation |
| Accounting | ICAN registration |
| Financial (BDC, insurance) | CBN/NAICOM licence number |
| Food (restaurant, bakery, catering) | NAFDAC registration if applicable |
| Education | State Ministry of Education certification |
| Energy (fuel, gas) | DPR/NMDPRA licence |
| Construction | CORBON / relevant professional body |
| All businesses | CAC registration number (RC XXXXXX) |
| All businesses | "Established [Year]" / "Serving [Area] since [Year]" |

### 8.6 — Visual Direction

- **All image direction must specify Nigerian/African subjects.** "A smiling Nigerian pharmacist in a
  white coat, pharmacy shelves behind her" — not "pharmacist". Context specificity is mandatory.
- **No western lifestyle stock imagery.** No white hands holding products. No New York skylines.
  No generic "business meeting" photos from western stock libraries.
- Use your research Thread D findings for every image description.
- Hero images: CSS `background-image` with `background-size: cover`, not `<img>` tags.
- Colour: Always use `var(--ww-primary)`, `var(--ww-secondary)`, `var(--ww-accent)` CSS custom
  properties. Never hardcode brand colours — tenants override these at brand configuration time.

### 8.7 — Mobile & Performance

- Minimum layout width: **375px** (iPhone SE / budget Android). Design for this first.
- All interactive elements: minimum **44px touch target size**.
- No large inline media. Hero images via CSS background, not base64 `<img>` data URIs.
- No external font CDN requests. Design system fonts are bundled.
- No external script requests. Zero `<script src="...">` tags.

### 8.8 — Language Awareness

- Nigerian English is default. But content must be adaptable by the tenant to Yoruba, Igbo, or Hausa.
- Do not assume an English-first audience. Use name examples from all three major groups.
- Pidgin English awareness: for food, transport, and informal commerce niches, brief Pidgin-inflected
  copy notes in your research brief are valuable guidance for the tenant.

---

## Section 9 — Safety / Anti-Breakage Rules

These rules protect the runtime and governance system from regressions.

### 9.1 — Runtime Safety

```
[ ] NEVER remove existing entries from BUILT_IN_TEMPLATES — only add
[ ] NEVER modify base.ts without reading it fully first and confirming the change is safe
[ ] NEVER add <script> tags to template output — CSP violation
[ ] NEVER add external CDN links (<link> or <script> pointing to external URLs)
[ ] NEVER hardcode a tenant's real domain, subdomain, or branding — all via ctx.*
[ ] NEVER hardcode brand colours — all via var(--ww-*) custom properties
[ ] NEVER produce template output that contains unsanitised user-supplied strings without esc()
[ ] NEVER create a new template slug that conflicts with an existing slug in template-resolver.ts
[ ] NEVER assume the runtime bridge exists — marketplace install ≠ template rendering
[ ] NEVER use deprecated slugs (gym-fitness, petrol-station, nurtw) in any template slug or reference
```

### 9.2 — Governance Safety

```
[ ] NEVER create a new tracking format, status vocabulary, or registry structure —
    reuse existing ones from pillar2-template-status-codes.md and pillar2-niche-registry.schema.md
[ ] NEVER create a shadow registry, parallel queue, or alternative niche ID scheme
[ ] NEVER use the old 46-item pre-taxonomy-closure registry as a data source
[ ] NEVER reference vertical-ai-config.ts or primaryPillar as pillar classification authority
[ ] NEVER build a variant before its anchor is IMPLEMENTED
[ ] NEVER claim a niche that already has owner ≠ null without a documented 24h+ inactivity resolution
[ ] NEVER set templateStatus to IMPLEMENTED if TypeScript compilation fails
[ ] NEVER skip the registry, board, and queue update after completion
[ ] NEVER set owner = null without first updating templateStatus to a terminal or handoff state
```

### 9.3 — Content Safety

```
[ ] NEVER include hardcoded real Nigerian phone numbers, email addresses, or physical addresses
    that could be attributed to a real person or business
[ ] NEVER include content that could be defamatory, politically partisan (for politician templates,
    keep content structurally neutral — the tenant provides their content)
[ ] NEVER include payment amounts that could be misread as platform pricing
[ ] NEVER include testimonials that could be mistaken for real verified endorsements —
    clearly fictional names and clearly fictional scenarios
```

### 9.4 — Family Order Safety

```
IF your target niche is a family variant:
  → Confirm anchor is IMPLEMENTED before proceeding
  → Read anchor template fully before writing variant
  → Do not change any structural element that variants in the same family already depend on
  → Document in the variant file header which elements were overridden vs inherited

IF your target niche is a family anchor:
  → Write conservatively — future variants must be able to extend without breaking this structure
  → Document the extensible section structure in the file header
  → Avoid tight coupling between sections that variants may need to replace independently
```

---

## Section 10 — Verification and QA

Run every check in this section before setting `templateStatus` to `IMPLEMENTED`.
All checks must pass. Do not declare victory until the entire checklist is green.

### 10.1 — File Existence Checks

```
[ ] apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts — EXISTS
[ ] apps/brand-runtime/src/lib/template-resolver.ts — UPDATED (new import + new BUILT_IN_TEMPLATES entry)
[ ] docs/templates/research/{vertical-slug}-{niche-slug}-brief.md — EXISTS
[ ] infra/db/seeds/templates/{vertical-slug}-{niche-slug}.sql — EXISTS
[ ] docs/templates/pillar2-niche-registry.json — UPDATED (status + paths populated)
[ ] docs/templates/pillar2-template-execution-board.md — UPDATED (status + counts)
[ ] docs/templates/pillar2-template-queue.md — UPDATED (this niche moved to COMPLETED, NEXT advanced)
```

### 10.2 — TypeScript Correctness

```
Run: pnpm --filter @webwaka/brand-runtime typecheck

REQUIRED: 0 errors
IF errors: Fix all TypeScript errors before setting IMPLEMENTED status.
DO NOT skip this check. A template that does not compile is not implemented.

Also check:
[ ] No TypeScript `any` types introduced (unless inherited from existing code pattern)
[ ] Import paths use .js extension (ESM convention — verify from existing code)
[ ] WebsiteTemplateContract interface is correctly satisfied
[ ] All page renderers return string (not void, not Promise<string>)
```

### 10.3 — Template Content Checks

```
[ ] Template slug matches: {vertical-slug}-{niche-slug} (exact, no deviation)
[ ] All 4 page renderers implemented: home, about, services, contact
[ ] Default case in renderPage returns a valid HTML string (not throws)
[ ] esc() wraps every user-supplied string from ctx.*
[ ] WhatsApp CTA present on home page
[ ] WhatsApp CTA present on contact page
[ ] No hardcoded brand colours (no #XXXXXX or rgb() in CSS — all via var(--ww-*))
[ ] No hardcoded USD, GBP, EUR prices anywhere
[ ] At least one ₦ price reference on home and services pages
[ ] No western city names in default content
[ ] No generic western names in testimonials (must be Nigerian names)
[ ] No external CDN links or script sources
[ ] No <script> tags in template output
[ ] No unsanitised user input
[ ] Nigerian English spelling (colour, organise, centre, programme, licence, fulfil)
```

### 10.4 — Nigeria-First Compliance Checklist

Run the full Nigeria-First compliance checklist from `docs/templates/pillar2-template-agent-handoff.md`
Section 4. Every item must be checked and passing.

```
[ ] All Content & Tone items
[ ] All Geographic References items
[ ] All Payment & Pricing items
[ ] All Contact & Booking items
[ ] All Trust & Regulatory items
[ ] All Visual Direction items
[ ] All Mobile & Performance items
[ ] All Language items
```

### 10.5 — Family/Anchor Checks (if applicable)

```
IF anchor:
[ ] Section structure is documented in file header comments
[ ] Template marked as "FAMILY ANCHOR — variants must inherit this structure"
[ ] No tight coupling that prevents variant extension

IF variant:
[ ] Anchor template was read before writing this variant
[ ] Anchor is IMPLEMENTED or SHIPPED
[ ] Variant file header names the anchor and lists overridden elements
[ ] No sections duplicated from anchor that should be inherited
[ ] Template marked as "FAMILY VARIANT of {anchor-slug}"
```

### 10.6 — Governance Consistency Checks

```
[ ] VN-ID in template file header matches docs/governance/vertical-niche-master-map.md
[ ] Niche family and role in template file header match the master map
[ ] verticalSlug in registry matches the canonical slug in 0004_verticals-master.csv
[ ] No deprecated slug used anywhere in template, registry, or manifest
[ ] No reference to old 46-item registry
[ ] No reference to vertical-ai-config.ts or primaryPillar
[ ] Registry schema fully populated (all required fields non-null where required)
```

---

## Section 11 — Tracking Update Requirements

After all verification checks pass, update the tracking system completely.
No partial updates. All three files must be updated atomically in the same commit.

### 11.1 — Registry Update (`pillar2-niche-registry.json`)

```json
{
  "templateStatus": "IMPLEMENTED",
  "templateVariantCount": 1,
  "primaryTemplatePath": "apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts",
  "templateSlug": "{vertical-slug}-{niche-slug}",
  "marketplaceManifestSlug": "{vertical-slug}-{niche-slug}",
  "runtimeIntegrationStatus": "REGISTERED_IN_BUILT_IN_TEMPLATES",
  "researchStatus": "SYNTHESIZED",
  "researchBriefPath": "docs/templates/research/{vertical-slug}-{niche-slug}-brief.md",
  "implementedAt": "{today's date ISO-8601}",
  "lastReviewedAt": "{today's date ISO-8601}",
  "nextAction": "Deploy to production and verify rendering on test tenant",
  "owner": null,
  "notes": "{Brief implementation notes — any decisions made, any known follow-ups}"
}
```

Also update any blocker fields if a previously listed blocker was resolved.
If new blockers were discovered during implementation (but did not prevent completion), log them in `blockers[]` and set `nextAction` to address them.

### 11.2 — Execution Board Update (`pillar2-template-execution-board.md`)

```
UPDATE the niche's row:
  Status → IMPLEMENTED
  Owner → — (unassigned)
  Last Updated → today's date

MOVE the niche row from its Priority section to the "Completed Niches" table.

UPDATE summary counts:
  IMPLEMENTATION_IN_PROGRESS: decrease by 1
  IMPLEMENTED: increase by 1
  TOTAL: unchanged

UPDATE the "Known Issues / Flags" table:
  If any slug mismatch for this niche was noted and is now confirmed resolved, mark it resolved.
  If any new flag was discovered, add it.
```

### 11.3 — Queue Update (`pillar2-template-queue.md`)

```
MOVE this niche from CURRENT (or its queue position) to the COMPLETED table:
  | {today's date} | {niche ID} | {Niche Name} | IMPLEMENTED (not yet SHIPPED) |

ADVANCE the CURRENT block:
  Replace the CURRENT block with the next unclaimed READY_FOR_RESEARCH niche in the queue.
  If that niche is a family variant whose anchor is not yet IMPLEMENTED, skip it and take the next.
  Update the Status, Owner, and pre-work checklist in the CURRENT block.

UPDATE "Date last updated" in the document header.
```

### 11.4 — Commit Message Format

```
feat(templates): implement {niche display name} Pillar 2 template

Niche ID: P2-{vertical-slug}-{niche-slug}
VN-ID: {VN-NNN-NNN}
Family: {NF-CODE or standalone}
Role: {anchor / variant / standalone}

Files added:
  apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts
  infra/db/seeds/templates/{vertical-slug}-{niche-slug}.sql
  docs/templates/research/{vertical-slug}-{niche-slug}-brief.md

Files updated:
  apps/brand-runtime/src/lib/template-resolver.ts (BUILT_IN_TEMPLATES)
  docs/templates/pillar2-niche-registry.json
  docs/templates/pillar2-template-execution-board.md
  docs/templates/pillar2-template-queue.md

TypeScript: 0 errors
Nigeria-First compliance: all checks passed
Next niche: {next niche ID}
```

---

## Section 12 — Final Output / Reporting Format

After completing the session and updating all tracking files, produce a session report in this format:

```markdown
## Pillar 2 Session Report — {Today's Date}

**Session agent:** {your session identifier}
**Niche completed:** {Niche Display Name} (P2-{vertical-slug}-{niche-slug})
**VN-ID:** {VN-NNN-NNN}
**Family:** {NF-CODE or standalone}
**Role:** {anchor / variant / standalone}

### Files Created
- `apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts` — {size}
- `infra/db/seeds/templates/{vertical-slug}-{niche-slug}.sql`
- `docs/templates/research/{vertical-slug}-{niche-slug}-brief.md`

### Files Updated
- `apps/brand-runtime/src/lib/template-resolver.ts` — BUILT_IN_TEMPLATES now has {N} entries
- `docs/templates/pillar2-niche-registry.json` — status: IMPLEMENTED
- `docs/templates/pillar2-template-execution-board.md` — {N} niches IMPLEMENTED
- `docs/templates/pillar2-template-queue.md` — CURRENT advanced to {next niche ID}

### Verification Results
- TypeScript: {0 errors / N errors FIXED before completion}
- Nigeria-First compliance: {ALL PASSED / list exceptions}
- Family/anchor checks: {N/A / PASSED}
- Governance consistency: {ALL PASSED}

### Research Summary
- Thread A (Nigerian business landscape): {2-sentence summary of key findings}
- Thread B (website design patterns): {2-sentence summary}
- Thread C (Nigeria-first localization): {2-sentence summary}
- Thread D (visual direction): {2-sentence summary}
- Thread E (regulatory): {N/A or 2-sentence summary}

### Implementation Notes
{Any decisions made during implementation, trade-offs, deviations from standard pattern, and why}

### Blockers Discovered
{Any blockers found that do not prevent this niche's completion but affect future work}
{Format: blocker description | severity (HIGH/MEDIUM/LOW) | recommended resolution}

### Next Niche Recommendation
**Next in queue:** {Niche ID} — {Niche Name}
**Niche family:** {NF-CODE or standalone}
**Family prerequisite check:** {anchor is IMPLEMENTED / N/A for standalone}
**Estimated complexity:** {low / medium / high} — {brief reason}
**Known flags:** {any slug mismatch or governance flags for the next niche}
**Recommended preparation:** {1-2 sentences on what to read/check before starting}
```

---

## Section 13 — Success Condition

This session is complete when ALL of the following are true:

```
[ ] A valid, named target niche was selected using the protocol in Section 4
[ ] The niche was claimed correctly (status and owner updated before research began)
[ ] All required reading files (Section 3) were read before implementation
[ ] Research was conducted across minimum 4 threads (Section 5)
[ ] A research brief was written at the correct path (Section 6.1)
[ ] The research brief was committed to the repo before implementation began
[ ] The template TypeScript file exists at the correct path (Section 7.3)
[ ] The template is registered in BUILT_IN_TEMPLATES (Section 7.4)
[ ] The marketplace SQL manifest exists (Section 7.5)
[ ] TypeScript compilation passes with 0 errors (Section 10.2)
[ ] All template content checks pass (Section 10.3)
[ ] Full Nigeria-First compliance checklist passes (Section 10.4)
[ ] All governance consistency checks pass (Section 10.6)
[ ] pillar2-niche-registry.json updated to IMPLEMENTED with all fields populated (Section 11.1)
[ ] pillar2-template-execution-board.md updated with correct status and counts (Section 11.2)
[ ] pillar2-template-queue.md updated — this niche moved to COMPLETED, CURRENT advanced (Section 11.3)
[ ] All changes committed with the prescribed commit message format (Section 11.4)
[ ] Session report produced (Section 12)
[ ] Next niche recommendation made with family-dependency check confirmed
```

**If any item above is not checked, the session is not complete.**

---

## Appendix A — Quick Reference: Key File Locations

| What | Where |
|---|---|
| Single source of niche truth | `docs/governance/vertical-niche-master-map.md` |
| Canonical CSV | `infra/db/seeds/0004_verticals-master.csv` |
| Pillar 2 queue (what to build next) | `docs/templates/pillar2-template-queue.md` |
| Registry of all 46 queued niches | `docs/templates/pillar2-niche-registry.json` |
| Registry field schema | `docs/templates/pillar2-niche-registry.schema.md` |
| Status code definitions | `docs/templates/pillar2-template-status-codes.md` |
| 9-step handoff protocol | `docs/templates/pillar2-template-agent-handoff.md` |
| Operational status board | `docs/templates/pillar2-template-execution-board.md` |
| Research briefs (create here) | `docs/templates/research/{vertical-slug}-{niche-slug}-brief.md` |
| Template runtime (where to register) | `apps/brand-runtime/src/lib/template-resolver.ts` |
| Template files (create here) | `apps/brand-runtime/src/templates/niches/{slug}/{slug}.ts` |
| SQL manifests (create here) | `infra/db/seeds/templates/{vertical-slug}-{niche-slug}.sql` |
| 39 niche family definitions | `docs/governance/niche-family-variant-register.md` |
| Alias/deprecation corrections | `docs/governance/niche-alias-deprecation-registry.md` |
| Platform architecture | `docs/governance/3in1-platform-architecture.md` |
| Runtime forensics (critical read) | `docs/reports/pillar2-forensics-report-2026-04-24.md` |
| White-label constraints | `docs/governance/white-label-policy.md` |
| Platform invariants | `docs/governance/platform-invariants.md` |

## Appendix B — Quick Reference: Valid Status Values

| Field | Valid values |
|---|---|
| `templateStatus` | `UNASSESSED` `READY_FOR_RESEARCH` `RESEARCH_IN_PROGRESS` `RESEARCH_SYNTHESIZED` `READY_FOR_IMPLEMENTATION` `IMPLEMENTATION_IN_PROGRESS` `IMPLEMENTED` `VERIFIED` `APPROVED` `SHIPPED` `BLOCKED` `NEEDS_REVISION` `VARIANTS_PENDING` `ARCHIVED` |
| `researchStatus` | `NOT_STARTED` `IN_PROGRESS` `SYNTHESIZED` |
| `runtimeIntegrationStatus` | `NOT_REGISTERED` `REGISTERED_IN_BUILT_IN_TEMPLATES` `LIVE_IN_PRODUCTION` |
| `nigeriaFirstPriority` | `critical` `high` `medium` `low` |

## Appendix C — Slug Mismatch Warning (Migration 0037a)

Before implementing any of these niches, verify the canonical slug in the CSV and master map.
The queue flags these niches as requiring slug verification before SHIPPED status:

| Queue Niche ID | Old alias (incorrect) | Canonical slug (use this) |
|---|---|---|
| `P2-dental-clinic-specialist-care` | `dental` | `dental-clinic` |
| `P2-vet-clinic-veterinary-care` | `vet` | `vet-clinic` |
| `P2-mobile-money-agent-fintech` | `mobile-money` | `mobile-money-agent` |
| `P2-bureau-de-change-fx-dealer` | `bdc` | `bureau-de-change` |
| `P2-training-institute-vocational` | `vocational` | `training-institute` |
| `P2-photography-visual-portfolio` | `photography-studio` | `photography` |

**Always use the canonical slug from `0004_verticals-master.csv` and the master map. Never the alias.**

---

*This document is read-only for agents — do not modify the prompt itself during a session.*
*Update tracking files only (registry, board, queue, research brief).*
*Prompt version: 1.0.0 — 2026-04-25. Authority: Prompt 1 system + 2026-04-25 taxonomy closure.*
