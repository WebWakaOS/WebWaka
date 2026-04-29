# Pillar 3 Template Agent Handoff Protocol

**Document type:** Mandatory agent workflow — Pillar 3 template creation  
**Status:** ACTIVE  
**Date:** 2026-04-26  
**Authority:** `docs/reports/pillar3-niche-identity-system-2026-04-26.md`

> **READ THIS BEFORE ANY TEMPLATE WORK.**  
> This document defines the mandatory, non-negotiable workflow every AI agent must follow  
> to research and implement a Pillar 3 niche website template for WebWaka OS.  
> Skipping any step is a protocol violation.
>
> This document is structurally identical to `pillar2-template-agent-handoff.md` with  
> all P2 references replaced by their P3 equivalents. The 9-step workflow, standards,  
> checklists, and recovery procedures are unchanged.

---

## Section 1 — Pre-Work: Required Reading

Before doing anything else, every agent must read and absorb these documents:

**Architecture (mandatory):**
- `docs/governance/3in1-platform-architecture.md` — canonical pillar definitions
- `docs/reports/pillar3-niche-identity-system-2026-04-26.md` — this P3 system's full design report
- `docs/reports/pillar2-forensics-report-2026-04-24.md` — current Pillar 2 runtime reality (applies to P3)

**Template system (mandatory):**
- `docs/templates/pillar3-niche-registry.schema.md` — registry field definitions
- `docs/templates/pillar3-template-status-codes.md` — status transition rules
- `docs/templates/template-spec.md` — template manifest specification

**Implementation files (mandatory — read the actual code):**
- `apps/brand-runtime/src/lib/template-resolver.ts` — where to register new templates
- `apps/brand-runtime/src/templates/branded-home.ts` — example of an existing template function
- `apps/brand-runtime/src/templates/base.ts` — the HTML shell all templates use

**Registry (mandatory):**
- `docs/templates/pillar3-niche-registry.json` — the canonical P3 niche list and statuses
- `docs/templates/pillar3-template-queue.md` — the next prioritised niche

**Governance (mandatory):**
- `docs/governance/white-label-policy.md` — white-label constraints
- `docs/governance/platform-invariants.md` (if it exists) — T3, T4, T5, P7, P10 invariants

---

## Section 2 — The 9-Step Mandatory Workflow

### STEP 1: Read the Registry and Identify Target Niche

```
ACTION: Read docs/templates/pillar3-niche-registry.json
ACTION: Read docs/templates/pillar3-template-queue.md

CONFIRM:
  - The target niche's templateStatus is READY_FOR_RESEARCH
  - The target niche's owner is null (not claimed by another agent)
  - No other niche with the same nicheId exists (duplicate check)
  - verticalSlug matches an active row in infra/db/seeds/0004_verticals-master.csv
    with priority=3 and status=planned (NOT deprecated)

NOTE: If you find a niche already at READY_FOR_IMPLEMENTATION (research was done
in a prior session and brief exists), skip to STEP 6. But confirm researchBriefPath
is populated and researchStatus = SYNTHESIZED before doing so.

IF any condition fails: HALT. Do not proceed. Report the issue.
```

### STEP 2: Claim the Niche for Research (Status Update)

```
ACTION: Update docs/templates/pillar3-niche-registry.json
  - Set templateStatus = "RESEARCH_IN_PROGRESS"
  - Set researchStatus = "IN_PROGRESS"
  - Set owner = "{agent-session-identifier}"

ACTION: Update docs/templates/pillar3-template-execution-board.md
  - Mark the niche as RESEARCH_IN_PROGRESS with timestamp

COMMIT: Write the registry update before beginning any other work.
DO NOT proceed to research without claiming the niche first.

NOTE: After completing Steps 3–5 (research + synthesis), you must advance the status:
  - Set templateStatus = "RESEARCH_SYNTHESIZED"
  - Set researchStatus = "SYNTHESIZED"
  - Set researchBriefPath = path to the brief you created
  Then (with agent authority) advance to:
  - Set templateStatus = "READY_FOR_IMPLEMENTATION"
  Only then proceed to STEP 6 (design) and STEP 7 (implementation).
```

### STEP 3: Read All Required Repository Context

```
For the target niche's vertical, read:
  - packages/verticals-{vertical-slug}/src/{vertical-slug}.ts (the vertical package)
  - packages/verticals-{vertical-slug}/src/types.ts (vertical-specific types)
  - Any migration SQL files specific to this vertical
  - The entry for this vertical in infra/db/seeds/0004_verticals-master.csv

Also read:
  - docs/governance/3in1-platform-architecture.md §5 (vertical pillar classification table)
  - The vertical's row in the Pillar 3 niche registry for audienceSummary,
    businessContextSummary, contentLocalizationNotes
```

### STEP 4: Launch Research Sub-Agents (Minimum 4 Parallel Threads)

**This step is MANDATORY. Template implementation without research is a protocol violation.**

Launch at least 4 parallel research threads covering:

**Thread A — Nigerian Business Landscape:**
```
Research: How do Nigerian {niche} businesses operate?
Find: Nigerian SME characteristics for this vertical
Find: What do their current websites look like (if any)?
Find: What are the top 5-10 Nigerian players/competitors in this niche?
Find: What do Nigerian customers of this business type expect from a website?
Sources: Nigerian news sites, NBS/SMEDAN reports, Nigerian business directories
```

**Thread B — Website Design & Content Patterns:**
```
Research: What sections do {niche} business websites typically have?
Find: What content is most important (above-the-fold, trust signals, CTAs)?
Find: What is the typical user journey on a {niche} business website?
Find: What makes visitors convert / take action?
Research: African and Nigerian design patterns for this niche
```

**Thread C — Nigeria-First Localization Research:**
```
Research: What are the trust signals Nigerian customers look for in a {niche} business?
Find: What regulatory certifications are relevant (NAFDAC, CAC, NBA, NMA, etc.)?
Find: What is the typical pricing range in NGN for this type of business?
Find: How do Nigerians contact/book/engage with this type of business?
Find: What language/tone do Nigerians use when engaging with this business type?
Find: What local references (neighbourhoods, landmarks, LGAs) make sense?
```

**Thread D — Visual & Imagery Direction:**
```
Research: What does authentic Nigerian {niche} imagery look like?
Find: What visual elements build trust for this type of business in Nigeria?
Find: What colours, styles, and imagery resonate with Nigerian audiences in this sector?
Find: What to AVOID — what generic western stock imagery patterns are irrelevant?
Research: Typography and design preferences in Nigerian digital products for this sector
```

### STEP 5: Synthesise Research Into a Niche Brief

```
ACTION: Create docs/templates/research/{vertical-slug}-{niche-slug}-brief.md

The brief must contain:
  - Executive summary of the Nigerian business reality for this niche
  - Target audience profile (Nigerian customer personas)
  - Recommended website sections (minimum 5, maximum 10)
  - Content tone and voice guidelines
  - CTA recommendations (primary CTA, secondary CTA)
  - Trust signal inventory (certifications, testimonials, partner logos, etc.)
  - Image direction (3-5 specific image concept descriptions)
  - Nigeria-first compliance checklist (see Section 4 of this doc)
  - Platform invariants confirmed applicable

ACTION: Update registry
  - Set researchStatus = "SYNTHESIZED"
  - Set researchBriefPath = "docs/templates/research/{vertical-slug}-{niche-slug}-brief.md"
```

### STEP 6: Design the Nigeria-First Template Structure

Before writing code, design the template on paper (as comments in the implementation file header):

```
Plan these elements:
  - Page structure: which sections appear on home / about / services / contact?
  - Home page hero: what is the headline, subheadline, and primary CTA?
  - Trust section: what proof elements appear? (testimonials, certifications, stats)
  - Services section: how are offerings displayed?
  - Contact section: WhatsApp link? Phone? Form? Map?
  - Visual tokens used: which --ww-* CSS custom properties drive the design?
  - Mobile-first layout decisions: what collapses or stacks on 375px?

APPLY Nigeria-First checklist (Section 4 below) to every design decision.
```

### STEP 7: Implement the WebsiteTemplateContract

```typescript
// File: apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts

/**
 * {NicheName} — Pillar 3 Website Template
 * Niche ID: P3-{vertical-slug}-{niche-slug}
 * Vertical: {verticalSlug}
 * Research brief: docs/templates/research/{vertical-slug}-{niche-slug}-brief.md
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

export const {camelCaseNicheName}Template: WebsiteTemplateContract = {
  slug: '{vertical-slug}-{niche-slug}',  // matches template_registry.slug
  version: '1.0.0',
  pages: ['home', 'about', 'services', 'contact'],

  renderPage(ctx: WebsiteRenderContext): string {
    switch (ctx.pageType) {
      case 'home':    return render{NicheName}Home(ctx);
      case 'about':   return render{NicheName}About(ctx);
      case 'services': return render{NicheName}Services(ctx);
      case 'contact': return render{NicheName}Contact(ctx);
      default: return '<p style="text-align:center;padding:4rem">Page not found.</p>';
    }
  },
};

// IMPLEMENTATION RULES:
// 1. All user-supplied strings MUST go through esc() (XSS prevention)
// 2. All prices MUST be in kobo (integer) — display as NGN using formatKobo()
// 3. WhatsApp CTA MUST appear on home and contact pages
// 4. Mobile-first: test layout at 375px width
// 5. Nigerian business context: see research brief for content guidance
// 6. No inline event handlers (CSP compliance)
// 7. lang="en-NG" already set in base.ts — do not override
```

**After writing the template file:**

```typescript
// In apps/brand-runtime/src/lib/template-resolver.ts
// ADD to BUILT_IN_TEMPLATES:

import { {camelCaseNicheName}Template } from '../templates/niches/{vertical-slug}/{niche-slug}.js';

const BUILT_IN_TEMPLATES: Map<string, WebsiteTemplateContract> = new Map([
  ['default-website', defaultWebsiteTemplate],
  ['{vertical-slug}-{niche-slug}', {camelCaseNicheName}Template],  // ← ADD THIS
]);
```

**Create the marketplace manifest SQL seed:**

```sql
-- seeds/templates/{vertical-slug}-{niche-slug}.sql
INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  '{vertical-slug}-{niche-slug}',
  '{Niche Display Name}',
  '{Brief description — Nigerian business context}',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["{vertical-slug}"]',
  '{"name":"{vertical-slug}-{niche-slug}","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["{vertical-slug}"],"rollback_strategy":"soft_delete"}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
```

### STEP 8: Verify Implementation Correctness

```
CHECK (all must pass):
  [ ] Template file exists at correct path
  [ ] Template is registered in BUILT_IN_TEMPLATES
  [ ] Template slug matches: {vertical-slug}-{niche-slug}
  [ ] All 4 pages render (home, about, services, contact)
  [ ] esc() wraps all user-supplied strings
  [ ] WhatsApp CTA present on home and contact pages
  [ ] Mobile layout correct (375px minimum)
  [ ] No hardcoded USD / GBP / EUR prices
  [ ] No generic western city names in example content
  [ ] Nigerian regulatory trust signals included where relevant
  [ ] Marketplace SQL manifest created
  [ ] TypeScript compiles with 0 errors: pnpm --filter @webwaka/brand-runtime typecheck

IF any check fails: Fix before proceeding.
```

### STEP 9: Update Registry, Board, and Queue

```
ACTION: Update docs/templates/pillar3-niche-registry.json
  - Set templateStatus = "IMPLEMENTED"
  - Set primaryTemplatePath = "apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts"
  - Set runtimeIntegrationStatus = "REGISTERED_IN_BUILT_IN_TEMPLATES"
  - Set implementedAt = "{today's date ISO-8601}"
  - Set templateVariantCount = 1
  - Set marketplaceManifestSlug = "{vertical-slug}-{niche-slug}"
  - Set owner = null (release the claim)
  - Set nextAction = "Deploy to production and verify rendering on test tenant"

ACTION: Update docs/templates/pillar3-template-execution-board.md
  - Mark niche as IMPLEMENTED with timestamp
  - Update summary counts

ACTION: Update docs/templates/pillar3-template-queue.md
  - Move this niche from CURRENT to COMPLETED
  - Advance NEXT to the next READY_FOR_RESEARCH niche

COMMIT: Push all changes before reporting completion.
```

---

## Section 3 — Template Implementation Standards

### HTML / CSS Standards

1. **Use `esc()` for all user-supplied strings** — no XSS exceptions
2. **Inline styles only via CSS custom properties** — use `var(--ww-primary)`, `var(--ww-secondary)`, etc.
3. **No `<script>` tags** — all functionality must be server-rendered or use the existing service worker
4. **No `<link rel="stylesheet">` pointing to external CDNs** — design system is inlined by `base.ts`
5. **Class naming** — use `.ww-*` prefix for all design system classes
6. **Accessibility** — all interactive elements need `aria-label` where not self-describing
7. **Semantic HTML** — `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>` required structure

### Performance Standards

1. **No inline images** — reference image URLs from `ctx.logoUrl` or external CDN
2. **Minimal DOM depth** — keep nesting under 6 levels
3. **CSS custom properties** — theme variables from `buildCssVars()` must be the source of all brand colours
4. **Hero images** — use CSS background-image with `background-size: cover`

### Content Standards

1. **Nigerian English** — use "organisation" not "organization"; "colour" not "color"
2. **Naira symbol** — always use ₦ (Unicode U+20A6) for prices, not "NGN" in display text
3. **WhatsApp CTA** — format: `https://wa.me/234XXXXXXXXXX?text=Hello` — always present on home + contact
4. **Phone format** — Nigerian: `+234 XXX XXX XXXX` or `0XXX XXX XXXX`
5. **Default working hours** — 8:00am – 6:00pm (Nigeria standard business hours)
6. **Address format** — `[Number] [Street], [Area], [City], [State]` (Nigerian format)

---

## Section 4 — Nigeria-First / Africa-First Compliance Checklist

Run this checklist against EVERY template before setting status to `IMPLEMENTED`.

### Content & Tone
- [ ] Headline uses active Nigerian business language (not generic corporate western English)
- [ ] CTA uses direct Nigerian conversion language (e.g., "Book Now", "Order Today via WhatsApp")
- [ ] Testimonials reference Nigerian context (names, locations, scenarios)
- [ ] "About" section uses trust language relevant to Nigeria
- [ ] No American spelling defaults
- [ ] No generic taglines detached from Nigerian reality

### Geographic References
- [ ] Example city/neighbourhood references are Nigerian
- [ ] No London, New York, or other western city references
- [ ] LGA-level specificity used where appropriate

### Payment & Pricing
- [ ] All example prices in NGN / Kobo (₦5,000 not $5)
- [ ] Payment methods mentioned are Nigerian (Paystack, bank transfer, USSD, POS)
- [ ] No Stripe, PayPal, Venmo references

### Contact & Booking
- [ ] WhatsApp CTA is the PRIMARY contact mechanism
- [ ] Nigerian phone number format used in examples
- [ ] Contact form includes NDPR consent notice if collecting PII

### Trust & Regulatory
- [ ] Applicable Nigerian certifications noted
- [ ] Nigerian professional body affiliations shown where relevant

### Visual Direction
- [ ] Image descriptions specify Nigerian/African subjects
- [ ] Colour choices respect brand tokens
- [ ] No generic western lifestyle imagery direction

### Mobile & Performance
- [ ] Template tested (or designed) for 375px viewport
- [ ] No large inline media that would fail on 2G/3G connections

---

## Section 5 — Error & Recovery Procedures

### If Research Reveals the Niche is Not Viable
```
Set templateStatus = BLOCKED
Populate blockers[] with specific reasons
Set nextAction = "Review niche viability — may need to archive or merge with adjacent niche"
Set owner = null
Document in notes field
```

### If a Blocker is Encountered During Implementation
```
Set templateStatus = BLOCKED
Populate blockers[] with specific descriptions
Set owner = null (release the claim)
Document in notes field
```

### If Another Agent Has Already Claimed the Niche
```
DO NOT proceed with the same niche.
Read docs/templates/pillar3-template-queue.md for the next available niche.
If the claiming agent has been inactive for >24 hours, a human may reset owner to null.
```

### If TypeScript Compilation Fails
```
Do NOT set status to IMPLEMENTED.
Fix all TypeScript errors before proceeding.
Run: pnpm --filter @webwaka/brand-runtime typecheck
```

---

## Section 6 — File Creation Checklist

After completing a niche, confirm these files exist:

```
apps/brand-runtime/src/templates/niches/{vertical-slug}/{niche-slug}.ts   ← template implementation
apps/brand-runtime/src/lib/template-resolver.ts                           ← updated BUILT_IN_TEMPLATES
docs/templates/research/{vertical-slug}-{niche-slug}-brief.md             ← research brief
docs/templates/pillar3-niche-registry.json                                ← updated status
docs/templates/pillar3-template-execution-board.md                        ← updated board
docs/templates/pillar3-template-queue.md                                  ← advanced queue
```

SQL manifest (add to appropriate migration or seed file):
```
infra/db/seeds/templates/{vertical-slug}-{niche-slug}.sql                 ← marketplace manifest
```

---

*Last updated: 2026-04-26*  
*This document is read-only for agents — do not modify without human authorisation.*
