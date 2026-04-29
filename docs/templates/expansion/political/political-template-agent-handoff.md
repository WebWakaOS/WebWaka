# Political Role-Specific Template Agent Handoff Protocol

**Document type:** Mandatory agent workflow — political role template creation  
**Status:** ACTIVE  
**Date:** 2026-04-26  
**Authority:** `docs/templates/expansion/political/00-Political-Master-Blueprint.md`  
**Base protocol:** `docs/templates/pillar2-template-agent-handoff.md` — this document extends and specialises the 9-step Pillar 2 protocol for political role templates

> **READ THIS BEFORE ANY POLITICAL TEMPLATE WORK.**  
> This document defines the mandatory, non-negotiable workflow every AI agent must follow  
> to research and implement a political role-specific website template for WebWaka OS.  
> Skipping any step is a protocol violation.  
> **The political system adds 3 additional gates not present in the base Pillar 2 protocol.**  
> These gates are: (1) collision gate, (2) canonical activation gate, (3) family anchor gate.

---

## Section 1 — Pre-Work: Required Reading

Before doing anything else, every agent must read and absorb these documents:

**Political system (mandatory — read in this order):**
1. `docs/templates/expansion/political/00-Political-Master-Blueprint.md` — master strategy and scope
2. `docs/templates/expansion/political/02-Political-Candidate-Registry.md` — target niche scoring and design
3. `docs/templates/expansion/political/03-Political-Family-Structure.md` — NF-POL family rules
4. `docs/templates/expansion/political/05-Political-Regulatory.md` — INEC/SIEC compliance requirements
5. `docs/templates/expansion/political/07-Political-Collision-Analysis.md` — collision verdicts (CLEAR / DIFFERENTIATE)
6. `docs/templates/expansion/political/political-niche-registry.json` — current status of all 16 niches
7. `docs/templates/expansion/political/political-template-queue.md` — current niche and build order
8. `docs/templates/expansion/political/political-niche-registry.schema.md` — field definitions
9. `docs/templates/expansion/political/political-template-status-codes.md` — status transition rules

**Base architecture (mandatory):**
- `docs/governance/3in1-platform-architecture.md` — canonical pillar definitions
- `docs/templates/pillar2-template-agent-handoff.md` — base 9-step workflow (read Section 3–6)

**Implementation files (mandatory — read the actual code):**
- `apps/brand-runtime/src/lib/template-resolver.ts` — where to register new templates
- `apps/brand-runtime/src/templates/branded-home.ts` — example of an existing template function
- `apps/brand-runtime/src/templates/base.ts` — the HTML shell all templates use

**Registry (mandatory):**
- `infra/db/seeds/0004_verticals-master.csv` — confirm CSV row exists before claiming any niche
- `docs/governance/canonical-niche-registry.md` — confirm VN-ID is canonical before claiming

---

## Section 2 — The 9-Step Mandatory Workflow

### STEP 1: Read the Registry and Identify Target Niche

```
ACTION: Read docs/templates/expansion/political/political-niche-registry.json
ACTION: Read docs/templates/expansion/political/political-template-queue.md

CONFIRM:
  - The target niche's templateStatus is READY_FOR_RESEARCH
  - The target niche's owner is null (not claimed by another agent)
  - No other niche with the same nicheId exists (duplicate check)
  - If family variant: familyDependency niche's templateStatus is IMPLEMENTED or SHIPPED
    (If anchor is not IMPLEMENTED: HALT. Do not proceed with the variant.)

POLITICAL-SPECIFIC CHECKS (additional beyond base protocol):
  [ ] Collision verdict in 07-Political-Collision-Analysis.md is CLEAR or DIFFERENTIATE
      (NOT MERGE — if MERGE, niche must not be created; extend existing template instead)
      (NOT REJECT — if REJECT, niche is not viable; do not claim)
  [ ] verticalSlug exists as a row in infra/db/seeds/0004_verticals-master.csv
      with status=planned (NOT absent — the niche is not yet canonical if absent)
  [ ] proposedVnId is confirmed in docs/governance/canonical-niche-registry.md
  [ ] NF-POL family (NF-POL-ELC / NF-POL-APT / NF-POL-PTY) is registered in
      docs/governance/niche-family-variant-register.md

IF any condition fails: HALT. Report which condition failed and why.
IF the niche is a variant and the anchor is not IMPLEMENTED: HALT.
  Report: "Family anchor [anchor nicheId] must reach IMPLEMENTED before [variant nicheId] can be claimed."
```

### STEP 2: Claim the Niche for Research (Status Update)

```
ACTION: Update docs/templates/expansion/political/political-niche-registry.json
  - Set templateStatus = "RESEARCH_IN_PROGRESS"
  - Set researchStatus = "IN_PROGRESS"
  - Set owner = "{agent-session-identifier}"

ACTION: Update docs/templates/expansion/political/political-template-execution-board.md
  - Mark the niche as RESEARCH_IN_PROGRESS with timestamp

ACTION: Update docs/templates/expansion/political/political-template-queue.md
  - If this niche is the CURRENT niche: update the Owner field in the CURRENT block

COMMIT: Write the registry update before beginning any other work.
DO NOT proceed to research without claiming the niche first.

NOTE: After completing Steps 3–5 (research + synthesis):
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
  - infra/db/seeds/0004_verticals-master.csv — confirm the vertical's canonical row
  - packages/verticals-{vertical-slug}/src/{vertical-slug}.ts (if the package exists)
  - Any existing political templates for reference:
    apps/brand-runtime/src/templates/niches/politician/campaign-site.ts
    apps/brand-runtime/src/templates/niches/political-party/party-website.ts

Also read:
  - docs/templates/expansion/political/02-Political-Candidate-Registry.md — the full entry for this niche
  - docs/templates/expansion/political/05-Political-Regulatory.md — KYC tier and INEC/SIEC requirements
  - docs/templates/expansion/political/03-Political-Family-Structure.md — family inheritance rules
  - The niche's entry in political-niche-registry.json — audienceSummary, businessContextSummary, regulatoryOrTrustNotes
  - If family variant: the anchor's research brief (researchBriefPath) — to understand what to inherit
```

### STEP 4: Launch Research Sub-Agents (Minimum 5 Parallel Threads)

**This step is MANDATORY. Political template implementation without research is a protocol violation.**

Political role templates require a minimum of 5 threads (base 4 + mandatory political compliance thread).

**Thread A — Nigerian Political Role Landscape:**
```
Research: How does this specific political role operate in Nigeria's constitutional framework?
Find: Constitutional / legal basis for this role (CFRN sections, electoral acts, local government laws)
Find: Number of officeholders (exact seat count — see 04-Political-Market-Intelligence.md for reference)
Find: Typical career path — how do Nigerians get to this role? What comes before and after?
Find: How current officeholders present themselves online (existing websites, social media)
Find: Top 5–10 examples of this role in Nigerian political life — look at their digital presence
Sources: INEC.gov.ng, NASS.gov.ng, state government websites, Nigerian political news
```

**Thread B — Website Design & Content Patterns:**
```
Research: What sections does a {political role} website/page need?
Find: Mode-specific content (campaign vs. incumbent vs. post_office — what changes?)
Find: What trust signals matter for this specific role (INEC certificate? Manifesto? Project tracker?)
Find: What do Nigerians expect when visiting this type of political role page?
Find: What makes constituents / voters / stakeholders convert (WhatsApp? Hotline? Email?)
Research: Existing Nigerian politician website design patterns and what works vs. fails
```

**Thread C — Nigeria-First Localization:**
```
Research: What are the trust signals for this specific political role in Nigeria?
Find: INEC/SIEC regulatory language and how it appears on official communications
Find: Nigerian political terminology for this role (official titles, abbreviations, honorifics)
Find: What geographic framing is required? (ward, LGA, senatorial district, state-wide, federal)
Find: How do Nigerians contact/engage with this specific type of official? (WhatsApp, constituency office, council chamber)
Find: Nigerian political cultural norms specific to this role and tier of government
```

**Thread D — Visual & Imagery Direction:**
```
Research: What authentic Nigerian imagery exists for this political role?
Find: Official settings (council chamber, government house, secretariat, ministry office, Abuja, state capital, LGA headquarters)
Find: Campaign imagery for this role (rally settings, party colour usage, candidate portraits)
Find: Constituent engagement imagery (town halls, constituency visits, project commissioning)
Find: What to AVOID — western legislative stock imagery, generic politics photos not set in Nigeria
Research: Party colour palettes for the major Nigerian parties and how they affect template theming
```

**Thread E — INEC/SIEC Compliance & Regulatory Deep Dive [MANDATORY for all political niches]:**
```
Research: What regulatory documentation is required to verify this political role?
Find: Exact INEC/SIEC document names (Certificate of Return, Form CF001, appointment letter)
Find: KYC tier requirements as documented in 05-Political-Regulatory.md
Find: Electoral Act 2022 provisions that apply to this role (campaign finance, candidacy rules)
Find: Campaign finance rules (if campaign mode has donation or fundraising CTA):
    - Does Electoral Act 2022 cap apply?
    - What INEC account reference is required?
    - What disclosure obligations apply?
Find: Mode-specific compliance: what must be different in campaign vs. incumbent vs. post_office?
Find: Any current INEC/SIEC calendar events that affect template timing (election year, off-year)
```

### STEP 5: Synthesise Research Into a Political Role Brief

```
ACTION: Create docs/templates/research/political/{vertical-slug}-official-site-brief.md

The brief must contain:
  - Executive summary of the Nigerian political reality for this specific role
  - Constitutional/legal basis (CFRN section, Electoral Act provision, or LGA law reference)
  - Target audience profile — who visits this specific political role site and why
  - Mode-by-mode content plan (campaign sections / incumbent sections / post_office sections)
  - Content tone and voice guidelines — official political language for this role and tier
  - CTA recommendations per mode (campaign: WhatsApp volunteer line / incumbent: constituency office / post_office: foundation)
  - Trust signal inventory per mode (INEC certificate / project tracker / committee assignments)
  - Image direction (5 specific image concept descriptions — Nigerian political context)
  - INEC/SIEC compliance checklist for this niche
  - Campaign finance gate (if applicable — document whether donation CTA is gated and how)
  - Family inheritance notes (if variant: what is inherited from anchor and what is unique)
  - Platform invariants confirmed applicable

ACTION: Update registry
  - Set researchStatus = "SYNTHESIZED"
  - Set researchBriefPath = "docs/templates/research/political/{vertical-slug}-official-site-brief.md"
```

### STEP 6: Design the Nigeria-First Political Template Structure

Before writing code, design the template structure (document as comments in the implementation file header):

```
Plan these elements per mode:

CAMPAIGN MODE (ctx.data.mode === 'campaign'):
  - Hero: candidate name, office sought, party logo/colour, primary CTA
  - Manifesto section: key platform points (4-year plan or equivalent)
  - Geographic coverage: constituency/ward/state/national map display
  - Running mate / ticket display (if applicable)
  - Campaign schedule: upcoming rallies / town halls
  - Party badge: party acronym + colours
  - INEC candidacy reference (candidacy declaration form number if available)
  - Contact: WhatsApp volunteer line, campaign HQ address

INCUMBENT MODE (ctx.data.mode === 'incumbent'):
  - Header: official title, state/government seal reference, term dates
  - Accountability section: role-specific tracker (RMAFC / JAAC / bills / projects / portfolio)
  - Cabinet/committee display (if applicable)
  - Press briefing archive
  - Constituency/official office address
  - INEC/SIEC credential display (certificate of return reference)
  - KYC tier gate: which features require Tier 3 verification?

POST_OFFICE MODE (ctx.data.mode === 'post_office'):
  - Legacy archive: key achievements, projects delivered, bills enacted
  - Next platform (next office, foundation, or retirement announcement)
  - Historical term dates and context

APPLY Nigeria-First Political Compliance Checklist (Section 4 below) to every design decision.
APPLY Family inheritance rules: if variant, identify what pages/sections are inherited from anchor.
```

### STEP 7: Implement the WebsiteTemplateContract

```typescript
// File: apps/brand-runtime/src/templates/niches/{vertical-slug}/official-site.ts

/**
 * {NicheName} — Political Role-Specific Website Template
 * Niche ID: POL-{vertical-slug}-official-site
 * Vertical: {verticalSlug}
 * VN-ID: {proposedVnId}
 * Political Family: {politicalFamily} ({familyRole})
 * Sprint: {sprintAssignment}
 * Research brief: docs/templates/research/political/{vertical-slug}-official-site-brief.md
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

export const {CamelCaseNicheName}Template: WebsiteTemplateContract = {
  slug: '{vertical-slug}-official-site',  // matches template_registry.slug
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

// POLITICAL TEMPLATE IMPLEMENTATION RULES (in addition to base Pillar 2 rules):
// 1. All user-supplied strings MUST go through esc() (XSS prevention)
// 2. Mode switch MUST be driven by ctx.data.mode ('campaign' | 'incumbent' | 'post_office')
// 3. Default mode if ctx.data.mode is absent or unrecognised: 'campaign'
// 4. Campaign finance: NO donation button or payment CTA in campaign mode
//    without an INEC campaign account reference (ctx.data.inecCampaignAccount)
// 5. Incumbent mode content MUST be gated at the KYC tier defined in political-niche-registry.json
//    (implement as a conditional: if (!ctx.data.kycVerified) show KYC prompt instead of dashboard)
// 6. Party colours: use ctx.data.partyColour (hex) injected as --ww-party-primary CSS custom property
//    alongside the standard --ww-primary / --ww-secondary brand tokens
// 7. WhatsApp CTA MUST appear on home page (constituency office or campaign line)
// 8. Mobile-first: test layout at 375px (ward-level users on feature phones)
// 9. No inline event handlers (CSP compliance)
// 10. INEC/SIEC reference display: certificate of return reference number in incumbent + post_office modes
```

**After writing the template file:**

```typescript
// In apps/brand-runtime/src/lib/template-resolver.ts
// ADD to BUILT_IN_TEMPLATES:

import { {CamelCaseNicheName}Template } from '../templates/niches/{vertical-slug}/official-site.js';

const BUILT_IN_TEMPLATES: Map<string, WebsiteTemplateContract> = new Map([
  // ... existing entries ...
  ['{vertical-slug}-official-site', {CamelCaseNicheName}Template],  // ← ADD THIS
]);
```

**Create the marketplace manifest SQL seed:**

```sql
-- infra/db/seeds/templates/{vertical-slug}-official-site.sql
INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  '{vertical-slug}-official-site',
  '{Niche Display Name}',
  'Nigeria-first political role template for {role description}. Supports campaign, incumbent, and post-office modes with INEC/SIEC compliance.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["{vertical-slug}"]',
  '{"name":"{vertical-slug}-official-site","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["{vertical-slug}"],"political_family":"{NF-POL-FAMILY}","supported_modes":["campaign","incumbent","post_office"],"rollback_strategy":"soft_delete"}',
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
  [ ] Template slug matches: {vertical-slug}-official-site
  [ ] All 4 pages render without error (home, about, services, contact)
  [ ] All 3 modes render correctly:
      [ ] campaign mode renders (default when ctx.data.mode absent)
      [ ] incumbent mode renders (or shows KYC gate if ctx.data.kycVerified is falsy)
      [ ] post_office mode renders
  [ ] esc() wraps all user-supplied strings
  [ ] Mode switch is driven by ctx.data.mode
  [ ] Party colour is applied via ctx.data.partyColour → --ww-party-primary CSS custom property
  [ ] WhatsApp CTA present on home page (campaign: volunteer line / incumbent: constituency office)
  [ ] Mobile layout correct at 375px minimum
  [ ] No campaign finance donation CTA without INEC campaign account reference gate
  [ ] INEC/SIEC reference display present in incumbent and post_office modes
  [ ] No hardcoded USD / GBP / EUR prices
  [ ] No western city names in example content (Nigerian geography only)
  [ ] Marketplace SQL manifest created at correct path
  [ ] TypeScript compiles with 0 errors: pnpm --filter @webwaka/brand-runtime typecheck
  [ ] All existing tests still pass: pnpm --filter @webwaka/brand-runtime test
  [ ] New template-specific tests added to brand-runtime.test.ts

IF any check fails: Fix before proceeding. Do NOT set status to IMPLEMENTED.
```

### STEP 9: Update Registry, Board, and Queue

```
ACTION: Update docs/templates/expansion/political/political-niche-registry.json
  - Set templateStatus = "IMPLEMENTED"
  - Set primaryTemplatePath = "apps/brand-runtime/src/templates/niches/{vertical-slug}/official-site.ts"
  - Set runtimeIntegrationStatus = "REGISTERED_IN_BUILT_IN_TEMPLATES"
  - Set implementedAt = "{today's date ISO-8601}"
  - Set templateVariantCount = 1
  - Set marketplaceManifestSlug = "{vertical-slug}-official-site"
  - Set owner = null (release the claim)
  - Set nextAction = "Deploy to production and verify rendering on test tenant (all 3 modes)"

ACTION: Update docs/templates/expansion/political/political-template-execution-board.md
  - Mark niche as IMPLEMENTED with timestamp in the correct sprint table
  - Move niche to the Completed Niches table
  - Update summary counts table at top
  - If this was a family anchor: update "Family Anchor Status" tracker and
    increment "Variants Unblocked" count for any variants that can now be claimed

ACTION: Update docs/templates/expansion/political/political-template-queue.md
  - Move this niche from CURRENT to the Completed table
  - Advance NEXT to the next READY_FOR_RESEARCH niche whose family dependency is satisfied

ACTION: Update docs/templates/pillar2-niche-registry.json (Pillar 2 collision gate enforcement)
  - If this niche has a DIFFERENTIATE verdict: add or confirm scope note on the colliding
    existing template's `notes` field, clarifying the differentiation
    (e.g., for vtx_politician: add note "Generic politician page — role-specific templates
    available for governor, senator, reps member, etc.")

COMMIT: Push all changes before reporting completion.
```

---

## Section 3 — Political Template Implementation Standards

### Mode-Switch Architecture

Every political template MUST implement a clean mode-switch driven by `ctx.data.mode`:

```typescript
type PoliticalMode = 'campaign' | 'incumbent' | 'post_office';

function getPoliticalMode(ctx: WebsiteRenderContext): PoliticalMode {
  const mode = ctx.data?.mode as string;
  if (mode === 'incumbent' || mode === 'post_office') return mode;
  return 'campaign'; // default — anyone can have a campaign page
}
```

**Mode content switching rules:**
- `campaign` — available at Tier 1 KYC (self-declared candidate). No donation processing without INEC account gate.
- `incumbent` — gated at the KYC tier defined for the niche in `political-niche-registry.json`.
- `post_office` — available at Tier 2 (historical record — lighter verification requirement).

### Party Colour Injection

Nigerian political party colours are critical visual trust signals:

```typescript
// In the renderPage function, inject party colour as CSS custom property
const partyColour = esc(ctx.data?.partyColour ?? '#28a745'); // default: green (APC primary)

// Add to the style block in the HTML:
// :root { --ww-party-primary: ${partyColour}; }
// Use var(--ww-party-primary) for party badge backgrounds, campaign CTAs, and accent elements
```

**Known Nigerian party primary colours (for default fallbacks):**
- APC: `#28a745` (green)
- PDP: `#d40000` (red)
- LP: `#008000` (green, different shade)
- NNPP: `#1a0dab` (blue)
- Other parties: default to `#2c5f2e` (neutral political green)

### HTML / CSS Standards (inherits from Pillar 2 base protocol)

All Pillar 2 HTML/CSS standards apply. Political-specific additions:

1. **Party badge component** — display party acronym + colour in a consistent badge element across all modes
2. **INEC/SIEC credential display** — use a distinct `.ww-credential-badge` styled element for certificate references
3. **Mode indicator** — display current mode clearly in the header (small badge: "Campaign Page" / "Official Site" / "Legacy Archive")
4. **Accountability trackers** — project trackers, bill trackers, allocation displays must use `.ww-tracker` class with tabular layout on desktop and card layout on mobile
5. **Geographic display** — constituency maps and ward references use `.ww-geo-zone` wrapper for consistent styling

### Content Standards (inherits from Pillar 2 + political-specific)

1. All Pillar 2 content standards apply (Nigerian English, Naira symbol, WhatsApp CTA, phone format)
2. **Political honorifics** — always render: "His Excellency" / "Honourable" / "Distinguished Senator" / "Rt. Honourable" as appropriate per role. Use `esc()`.
3. **Party reference** — always use party acronym (APC, PDP, LP) not full party name in headers and badges. Full name in About sections only.
4. **INEC language** — use exact INEC terminology: "Certificate of Return", "Returning Officer", "Gubernatorial", "Senatorial District". Not informal equivalents.
5. **Geographic precision** — use exact LGA names, not abbreviated or informal names. Abuja = "FCT, Abuja". Not "Federal Capital".
6. **Campaign finance** — NEVER display a donation button or fundraising CTA without the `ctx.data.inecCampaignAccount` gate check. If the account reference is absent, show: "To make a campaign contribution, contact the campaign office directly."

---

## Section 4 — Nigeria-First Political Compliance Checklist

Run this checklist against EVERY political template before setting status to `IMPLEMENTED`.

### Constitutional & Regulatory
- [ ] Political role's constitutional basis is correctly cited in About section (CFRN section or relevant law)
- [ ] INEC or SIEC is correctly identified as the relevant regulatory body for this role
- [ ] Certificate of Return reference displayed correctly in incumbent + post_office modes
- [ ] KYC tier gate is implemented for incumbent mode (no full dashboard without verification)
- [ ] Campaign finance gate is implemented if campaign mode has any donation/fundraising CTA
- [ ] Electoral Act 2022 campaign spending cap disclosure is present if presidential template

### Political Terminology
- [ ] Correct honorific title used for this role ("His Excellency", "Honourable", "Distinguished Senator", etc.)
- [ ] Correct chamber reference ("Red Chamber" for Senate, "Green Chamber" for Reps, "HOA" for state assembly)
- [ ] Correct bill prefix used (SB for Senate, HB for Reps, state-specific for HOA)
- [ ] Correct geographic unit used (senatorial district / federal constituency / state constituency / LGA / ward)
- [ ] Party acronym used consistently (not full party name in headers)

### Mode-Switch
- [ ] `ctx.data.mode` drives all mode content switching
- [ ] Campaign mode is the default (renders when mode is absent or unrecognised)
- [ ] Incumbent mode is gated at the correct KYC tier
- [ ] Post_office mode renders historical content without accountability dashboards
- [ ] Mode indicator badge appears in header

### Geographic References
- [ ] All example city/LGA/ward references are Nigerian (not western cities)
- [ ] Geographic scope is correct for this tier (ward, LGA, senatorial district, state, federal, national)
- [ ] No London, New York, or other western geographic references

### Contact & Engagement
- [ ] WhatsApp CTA present on home page (campaign: volunteer line / incumbent: constituency office)
- [ ] Nigerian phone number format used in examples
- [ ] Constituency office address uses Nigerian address format
- [ ] No Calendly / Typeform / western booking tool references

### Visual Direction
- [ ] Party colour applied via `--ww-party-primary` CSS custom property (not hardcoded)
- [ ] Image descriptions specify Nigerian political settings (not western legislative stock)
- [ ] Campaign imagery: party colours prominent, Nigerian rally settings
- [ ] Incumbent imagery: official Nigerian government settings (secretariat, government house, council chamber)
- [ ] No generic western stock government imagery

### Mobile & Performance
- [ ] Template tested at 375px viewport (ward-level feature phone users)
- [ ] Accountability trackers (project, bill, allocation) are readable on mobile
- [ ] All interactive elements have minimum 44px touch target size
- [ ] No large inline media that would fail on 2G/3G connections

---

## Section 5 — Error & Recovery Procedures

### If the Family Anchor is Not Yet IMPLEMENTED

```
DO NOT claim the variant niche.
Report: "Family anchor [anchor nicheId] must reach IMPLEMENTED before [variant nicheId] can be claimed."
Take the next available niche from political-template-queue.md whose dependency is satisfied.
```

### If the CSV Row is Absent (Niche Not Yet Canonical)

```
DO NOT claim the niche for research.
The niche is not yet canonical — it is a candidate only.
Report: "verticalSlug [{slug}] is not yet in 0004_verticals-master.csv with status=planned.
 This niche requires founding team approval before it can be implemented."
Escalate to human for activation decision.
```

### If Research Reveals the Niche is Not Viable

```
Set templateStatus = BLOCKED
Populate blockers[] with specific reasons
Set nextAction = "Review niche viability — may need to archive or merge with adjacent niche"
Set owner = null
Document in notes field
Report to human before any further action
```

### If Campaign Finance Compliance is Unclear

```
DO NOT implement campaign mode with donation CTA until campaign finance gate is designed.
Set templateStatus = BLOCKED
Populate blockers: ["Campaign finance gate process not yet designed — required before campaign mode with donation CTA"]
Implement post_office mode only. Mark as partial IMPLEMENTED with note.
```

### If TypeScript Compilation Fails

```
Do NOT set status to IMPLEMENTED.
Fix all TypeScript errors before proceeding.
Run: pnpm --filter @webwaka/brand-runtime typecheck
```

---

## Section 6 — File Creation Checklist

After completing a political niche, confirm these files exist:

```
apps/brand-runtime/src/templates/niches/{vertical-slug}/official-site.ts   ← template implementation
apps/brand-runtime/src/lib/template-resolver.ts                            ← updated BUILT_IN_TEMPLATES
docs/templates/research/political/{vertical-slug}-official-site-brief.md   ← research brief
docs/templates/expansion/political/political-niche-registry.json            ← updated status
docs/templates/expansion/political/political-template-execution-board.md    ← updated board
docs/templates/expansion/political/political-template-queue.md              ← advanced queue
```

SQL manifest:
```
infra/db/seeds/templates/{vertical-slug}-official-site.sql                 ← marketplace manifest
```

If this was a family anchor — also confirm these scope note updates:
```
docs/templates/pillar2-niche-registry.json                                  ← scope note on colliding existing template(s)
infra/db/seeds/0004_verticals-master.csv                                   ← scope note in existing colliding rows (if applicable)
```

---

## Section 7 — Family Build Sequence Reference

```
MANDATORY BUILD ORDER — NEVER VIOLATE:

Phase 1 (Sprint 1):
  [1] POL-governor-official-site      ← NF-POL-ELC anchor — BUILD FIRST
  [2] POL-senator-official-site       ← ELC variant (requires governor IMPLEMENTED)
  [3] POL-house-of-reps-member-official-site  ← ELC variant (requires governor IMPLEMENTED)

Phase 2 (Sprint 2):
  [4] POL-state-commissioner-official-site    ← NF-POL-APT anchor — BUILD BEFORE APT VARIANTS
  [5] POL-federal-minister-official-site      ← APT variant (requires commissioner IMPLEMENTED)
  [6] POL-lga-chairman-official-site          ← ELC variant (requires governor IMPLEMENTED)
  [7] POL-house-of-assembly-member-official-site  ← ELC variant (requires governor IMPLEMENTED)

Phase 3 (Sprint 3):
  [8]  POL-presidential-candidate-official-site   ← standalone (no dependency)
  [9]  POL-political-appointee-official-site       ← APT variant (requires commissioner IMPLEMENTED)
  [10] POL-ward-councillor-official-site           ← ELC variant (requires governor IMPLEMENTED)
  [11] POL-party-chapter-officer-official-site     ← NF-POL-PTY anchor — BUILD BEFORE PTY VARIANTS
  [12] POL-party-state-officer-official-site       ← PTY variant (requires chapter-officer IMPLEMENTED)
  [13] POL-deputy-governor-official-site           ← ELC variant (requires governor IMPLEMENTED)

Phase 4 (Sprint 4):
  [14] POL-assembly-speaker-official-site          ← standalone (no dependency)
  [15] POL-lga-vice-chairman-official-site         ← ELC variant (requires lga-chairman IMPLEMENTED)
  [16] POL-supervisory-councillor-official-site    ← APT variant (requires commissioner IMPLEMENTED)
```

---

*Last updated: 2026-04-26*  
*This document is read-only for agents — do not modify without human authorisation.*
