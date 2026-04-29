# WebWaka OS — Generic Political Role Template Implementation Prompt

**Document type:** Reusable agent execution prompt — political role-specific niche template creation  
**Status:** AUTHORITATIVE — copy-paste ready for any capable AI agent  
**Governance base date:** 2026-04-26  
**Extends:** `docs/templates/pillar2-generic-implementation-prompt.md` — all base rules inherited; political rules are additive and override on conflict  
**Do not modify without human authorisation.**

---

> ## HOW TO USE THIS PROMPT
>
> This is a self-contained, reusable instruction document. Hand it to any capable AI agent as the  
> opening context for a political role niche template implementation session. The agent receiving  
> it must treat every instruction herein as mandatory unless explicitly marked `[OPTIONAL]`.
>
> One agent. One political niche. One session. Follow the steps in sequence.
>
> Political templates are more complex than standard Pillar 2 templates because they:
> 1. Support 3 operating modes (campaign / incumbent / post_office) in a single template
> 2. Require INEC/SIEC compliance verification gates
> 3. Have family anchor/variant dependencies that gate claiming order
> 4. Must handle campaign finance compliance (particularly presidential template)
> 5. Must navigate party colour injection alongside the standard brand token system

---

## Section 1 — Objective

You are a political role niche template implementation agent for WebWaka OS, a governance-driven  
Nigeria-first multi-tenant SaaS platform.

Your job in this session is to implement **one political role-specific website template** end-to-end:

1. Re-anchor yourself to the current authoritative political system state.
2. Identify the correct next niche from the political template queue.
3. Verify all three gates (collision gate, canonical activation gate, family anchor gate).
4. Conduct deep, multi-threaded Nigeria-first political role research (5 threads minimum).
5. Synthesise your findings into a structured political role implementation brief.
6. Build a high-quality, Nigeria-first, standards-compliant TypeScript template with mode-switch.
7. Register the template in the runtime and create the marketplace manifest.
8. Verify everything is correct — all 3 modes, INEC compliance, party colour injection, KYC gate.
9. Update the political tracking system to record completion and identify the next niche.

**You must complete all 9 phases before reporting done.** Thoroughness is far more important than speed.

---

## Section 2 — Non-Negotiable Truths

Internalise these before touching any file.

### 2.1 — Authoritative Political Governance State (2026-04-26)

| Fact | Value |
|---|---|
| Total political role niches in expansion registry | **16** |
| Niches at READY_FOR_RESEARCH | **16** (all of them — none yet started) |
| Sprint 1 (P1, score ≥40) | `governor` (42), `senator` (40), `house-of-reps-member` (40) |
| Sprint 2 (P2 high, score 37–39) | `state-commissioner` (37), `federal-minister` (39), `lga-chairman` (39), `house-of-assembly-member` (39) |
| Sprint 3 (P2 mid) | `presidential-candidate` (37), `political-appointee` (37), `ward-councillor` (37), `party-chapter-officer` (35), `party-state-officer` (36), `deputy-governor` (36) |
| Sprint 4 (P2 trailing) | `assembly-speaker` (34), `lga-vice-chairman` (33), `supervisory-councillor` (31) |
| NF-POL families | **3**: NF-POL-ELC (anchor: governor), NF-POL-APT (anchor: state-commissioner), NF-POL-PTY (anchor: party-chapter-officer) |
| Collision gate results | 2 CLEAR, 14 DIFFERENTIATE, 0 MERGE, 0 REJECT |
| Current CURRENT niche | `POL-governor-official-site` |
| Template modes | `campaign`, `incumbent`, `post_office` |
| Mode switch driver | `ctx.data.mode` |
| Regulatory authority | INEC (federal), SIEC (state/LGA/ward), executive (appointed roles), party (party roles) |
| Campaign finance gate | Required for presidential campaign mode (Electoral Act 2022) |
| nicheId format | `POL-{vertical-slug}-official-site` |
| templateSlug format | `{vertical-slug}-official-site` |
| Research brief path | `docs/templates/research/political/{vertical-slug}-official-site-brief.md` |
| Template file path | `apps/brand-runtime/src/templates/niches/{vertical-slug}/official-site.ts` |
| SQL seed path | `infra/db/seeds/templates/{vertical-slug}-official-site.sql` |

### 2.2 — Canonical Disambiguation Rules (Political-Specific)

1. **Political templates are multi-mode, not single-purpose.** Every political role template must handle campaign, incumbent, and post_office modes. The mode is driven by `ctx.data.mode`. The template must not hardcode any single mode.

2. **Family anchors must be built before variants.** An agent MUST NOT claim a variant niche until the family anchor is `IMPLEMENTED`. Governor before senator. State-commissioner before federal-minister. Party-chapter-officer before party-state-officer.

3. **Canonical activation gates the claim.** A niche cannot be claimed for research until: (a) its CSV row exists in `0004_verticals-master.csv`, (b) its VN-ID is confirmed in `canonical-niche-registry.md`, (c) its NF-POL family is registered in `niche-family-variant-register.md`. If any gate is unmet: HALT and escalate to human.

4. **Collision DIFFERENTIATE verdicts are mandatory differentiators.** If the niche has a DIFFERENTIATE verdict in `07-Political-Collision-Analysis.md`, the template MUST implement the documented differentiator. The differentiator is what makes this template distinct from the existing colliding template. Failing to implement the differentiator means the template violates its own governance gate.

5. **Campaign finance is a hard gate.** The presidential template MUST NOT process donations or display a fundraising CTA in campaign mode without `ctx.data.inecCampaignAccount` being set. This is a non-negotiable Electoral Act 2022 compliance requirement.

6. **Party colours are a first-class feature.** Every political template must inject `ctx.data.partyColour` (hex) as `--ww-party-primary` CSS custom property. Nigerian political party colours are significant trust signals — not cosmetic customisation.

7. **INEC/SIEC credential display is mandatory in incumbent + post_office modes.** The certificate of return reference (or equivalent appointment document) must appear visibly in incumbent and post_office modes. This is the primary trust signal for political role templates.

8. **KYC tier gate is mandatory for incumbent mode.** Every template must implement a KYC gate: if `ctx.data.kycVerified` is falsy, the incumbent dashboard must not render. Show a KYC prompt instead. The specific tier is documented in `political-niche-registry.json`.

9. **Mobile-first for ward-level templates.** Ward councillor and LGA chairman templates must be tested at 375px and must be lightweight (no heavy data loads) for 2G/3G ward-level users.

10. **The political registry is authoritative.** `political-niche-registry.json` is the single source of truth for all 16 political niches. The base `pillar2-niche-registry.json` is NOT updated for political niches — political niches live only in the political registry until they are graduated into the main niche system.

### 2.3 — The Two Template Systems (Critical Architecture Understanding)

Identical to the base Pillar 2 prompt. Political templates register in the same two systems:

**System A — Hardcoded Runtime Templates (what actually renders):**
- Register in `BUILT_IN_TEMPLATES` map in `apps/brand-runtime/src/lib/template-resolver.ts`
- This is what a visitor's browser receives

**System B — Marketplace Template Records:**
- SQL seed: `infra/db/seeds/templates/{vertical-slug}-official-site.sql`
- Records that the template exists and which tenants have installed it

Both must be done. A template only in System A is undiscoverable. A template only in System B does nothing.

---

## Section 3 — Files You Must Read First

Read every file in this section before writing a single line of code.

### 3.1 — Political Governance (Read in This Order)

| File | Why you must read it |
|---|---|
| `docs/templates/expansion/political/00-Political-Master-Blueprint.md` | Master strategy — political hierarchy, scope decisions, mode-split rationale |
| `docs/templates/expansion/political/02-Political-Candidate-Registry.md` | Full entry for your target niche — scoring, mode split, core template needs, discovery tags |
| `docs/templates/expansion/political/03-Political-Family-Structure.md` | NF-POL family rules — what variants inherit from their anchor |
| `docs/templates/expansion/political/05-Political-Regulatory.md` | INEC/SIEC compliance gates, KYC tier by role, campaign finance rules |
| `docs/templates/expansion/political/07-Political-Collision-Analysis.md` | Collision verdict and mandatory differentiators for your target niche |
| `docs/templates/expansion/political/political-niche-registry.json` | Current status of all 16 niches — find your target niche's full record |
| `docs/templates/expansion/political/political-template-queue.md` | Queue order and family dependency map |
| `docs/templates/expansion/political/political-template-agent-handoff.md` | The 9-step workflow you are executing |
| `docs/templates/expansion/political/political-niche-registry.schema.md` | Field definitions — read before writing any registry update |
| `docs/templates/expansion/political/political-template-status-codes.md` | Status codes — read before any status transition |

### 3.2 — Canonical Niche Identity

| File | Why you must read it |
|---|---|
| `infra/db/seeds/0004_verticals-master.csv` | Find the row for your target vertical slug — confirm it exists and status=planned |
| `docs/governance/canonical-niche-registry.md` | Confirm the proposedVnId is canonical |
| `docs/governance/niche-family-variant-register.md` | Confirm the NF-POL family is registered |

### 3.3 — Runtime Implementation Files (Read the Actual Code)

| File | Why you must read it |
|---|---|
| `apps/brand-runtime/src/lib/template-resolver.ts` | Where to register new templates in `BUILT_IN_TEMPLATES` |
| `apps/brand-runtime/src/templates/niches/politician/campaign-site.ts` | Existing political template — study the pattern before creating |
| `apps/brand-runtime/src/templates/branded-home.ts` | Reference implementation of a working template function |
| `apps/brand-runtime/src/templates/base.ts` | The HTML shell all templates must compose with |
| `packages/verticals/src/template-validator.ts` | `WebsiteTemplateContract` interface definition |
| `apps/brand-runtime/src/routes/branded-page.ts` | How routes invoke templates; what context (`WebsiteRenderContext`) contains |
| If family variant: the anchor's template file | Study what the anchor implements — variant inherits the structure |

---

## Section 4 — Target Niche Selection Protocol

### Step 4.1 — Check for an Explicit Override

If the human invoking you has explicitly named a specific niche:

```
a. Extract the niche ID (format: POL-{vertical-slug}-official-site).
b. Look up that niche ID in political-niche-registry.json.
c. Verify: the niche ID exists in the registry.
d. Verify: templateStatus is READY_FOR_RESEARCH.
e. Verify: owner is null (not claimed by another agent).
f. Verify: the verticalSlug row exists in 0004_verticals-master.csv with status=planned.
g. Verify: the proposedVnId is confirmed in canonical-niche-registry.md.
h. Verify: the NF-POL family is registered in niche-family-variant-register.md.
i. Verify: collision verdict in 07-Political-Collision-Analysis.md is CLEAR or DIFFERENTIATE.
j. Verify: if familyRole is 'variant': familyDependency niche's templateStatus is IMPLEMENTED or SHIPPED.

IF any condition fails: HALT. Report which condition failed and why. Do not implement.
IF all conditions pass: proceed to Step 4.3.
```

### Step 4.2 — Read the Queue (No Explicit Override)

```
a. Read docs/templates/expansion/political/political-template-queue.md.
b. Take the CURRENT niche block at the top.
c. Cross-check in political-niche-registry.json: confirm templateStatus = READY_FOR_RESEARCH.
d. Confirm owner = null.
e. Apply all checks from Step 4.1.
f. If CURRENT fails any check: take the next available niche in the queue whose all checks pass.
g. If no eligible niche can be found: HALT. Report the queue state and why no niche is eligible.
```

### Step 4.3 — Confirm Eligibility Before Claiming

```
[ ] Niche exists in political-niche-registry.json
[ ] verticalSlug resolves to a planned row in 0004_verticals-master.csv
[ ] proposedVnId is confirmed in canonical-niche-registry.md
[ ] NF-POL family is registered in niche-family-variant-register.md
[ ] Collision verdict is CLEAR or DIFFERENTIATE (not MERGE or REJECT)
[ ] templateStatus = READY_FOR_RESEARCH
[ ] owner = null
[ ] If familyRole = 'variant': familyDependency niche's templateStatus = IMPLEMENTED or SHIPPED
[ ] blockers[] is empty (or contains only pre-activation notes — check each blocker's severity)
[ ] No existing template file at: apps/brand-runtime/src/templates/niches/{slug}/official-site.ts
    IF a file already exists: read it. Assess completeness. Report before overwriting.
```

### Step 4.4 — Claim the Niche

```
UPDATE political-niche-registry.json:
  templateStatus → "RESEARCH_IN_PROGRESS"
  researchStatus → "IN_PROGRESS"
  owner → "{your-session-identifier}"  (e.g., "replit-agent-2026-04-26-session-A")

UPDATE political-template-execution-board.md:
  Status column for this niche → RESEARCH_IN_PROGRESS
  Owner column → your session identifier
  Last Updated → today's date

UPDATE political-template-queue.md:
  IF this niche is the CURRENT niche: update the Owner field in the CURRENT block

COMMIT all three files before beginning research.
```

---

## Section 5 — Research Protocol

**This section is mandatory. Building a political template without deep prior research is a protocol violation.**

Launch at minimum 5 parallel research threads.

### Thread A — Nigerian Political Role Landscape

```
Research: How does this specific Nigerian political role work in constitutional reality?
Find: The CFRN (Constitutional basis) or enabling law for this role
Find: Exact number of officeholders nationally (seat count × candidates)
Find: Typical profile of occupants (education, career path, party affiliation)
Find: How do current Nigerian officeholders in this role present themselves online?
Find: Top 5–10 examples — look at their actual websites and social media presence
Find: What do constituents / stakeholders expect from a digital presence for this role?
Sources: INEC.gov.ng, NASS.gov.ng, state government portals, Nigerian political news sites
```

### Thread B — Website Design & Mode-Specific Content

```
Research: What does an effective {political role} website need in each mode?
Find: Campaign mode — what sections, what content, what CTA?
Find: Incumbent mode — what accountability features matter most for this role?
Find: Post_office mode — what does a political legacy archive look like for this role?
Find: What trust signals are specific to this role (not generic politician trust signals)?
Find: What makes constituents contact or engage (WhatsApp number? Constituency office? Petition form?)
Research: Best-in-class political role websites globally — adapt for Nigerian context
```

### Thread C — Nigeria-First Political Localization

```
Research: What makes this template feel authentically Nigerian for this specific role?
Find: Official title and honorific (His Excellency / Honourable / Distinguished Senator / Rt. Honourable)
Find: Correct Nigerian geographic framing for this role (ward / LGA / senatorial district / state / federal)
Find: Nigerian political language for this role (manifesto language, accountability language, constituent language)
Find: How do Nigerians contact this specific type of official? (WhatsApp, constituency office, council chamber, ministry)
Find: Cultural context — how do Nigerians perceive and evaluate this role?
Find: Nigerian political calendar context — is this role currently in an election cycle? (check INEC calendar)
Sources: Nigerian political Twitter/X, Nairaland political boards, Pulse Nigeria, TheCable, BusinessDay politics
```

### Thread D — Visual & Imagery Direction

```
Research: What authentic Nigerian imagery exists for this specific political role?
Find: Official settings (appropriate: ward office, LGA secretariat, state government house, ministry Abuja, Aso Rock)
Find: Campaign imagery (rally settings, party colour usage, candidate portraits at the right tier)
Find: Constituent engagement imagery (town halls, commissioning projects, constituency visits)
Find: Party colour palettes for major Nigerian parties (APC, PDP, LP, NNPP, others) — see Section 2.2 note 6
Find: What imagery to AVOID — generic western legislative stock photos, non-Nigerian settings
Produce: 5 specific image concept descriptions grounded in Nigerian political reality for this role
```

### Thread E — INEC/SIEC Regulatory Compliance [MANDATORY]

```
Research: Full compliance profile for this political role.
Find: Exact document required to verify this role:
  - Certificate of Return (INEC gubernatorial / senatorial / reps / HOA constituency — exact form name)
  - SIEC Certificate of Return (for LGA/ward roles — state-specific form)
  - Appointment letter (for appointed roles — gubernatorial or presidential)
  - Party card (for party roles — national and state level)
Find: KYC tier as documented in 05-Political-Regulatory.md — confirm for your niche
Find: What campaign finance rules apply if campaign mode has donation/fundraising?
  - Does Electoral Act 2022 spending cap apply to this role?
  - What INEC form/reference is required to enable a donation CTA?
Find: What changes between election years and off-years for this role's template relevance?
Find: Any INEC/SIEC operational update in 2025–2026 that affects this role
Sources: INEC.gov.ng/resources, Electoral Act 2022 (Nigerian Senate NASS website), state SIEC portals
```

### Research Completion Requirement

Before proceeding to Section 6:

```
[ ] Thread A findings: Nigerian political role landscape documented
[ ] Thread B findings: mode-specific content plan documented (campaign / incumbent / post_office)
[ ] Thread C findings: Nigeria-first political localization documented
[ ] Thread D findings: 5 specific image concept descriptions produced
[ ] Thread E findings: INEC/SIEC compliance profile documented; KYC tier confirmed; campaign finance status confirmed
[ ] At minimum 10 specific, actionable findings per thread
[ ] At minimum 3 real Nigerian political figure examples examined for this role
[ ] Family inheritance plan documented (if variant): what is inherited from anchor vs. unique to this role
```

---

## Section 6 — Research Synthesis Protocol

Synthesise your research into a structured political role brief before writing any code.

### Step 6.1 — Write the Research Brief

Create this file:
```
docs/templates/research/political/{vertical-slug}-official-site-brief.md
```

The brief must contain all of the following sections:

```markdown
# {Niche Display Name} — Nigeria-First Political Role Research Brief

**Niche ID:** POL-{vertical-slug}-official-site
**Vertical slug:** {vertical-slug}
**VN-ID:** {proposedVnId}
**Political family:** {politicalFamily}
**Family role:** {familyRole}
**Government tier:** {governmentTier}
**Regulatory body:** {regulatoryBody}
**KYC tier required:** {kycTierRequired}
**Supported modes:** {supportedModes}
**Sprint:** {sprintAssignment}
**Research date:** {today's date}

## 1. Nigerian Political Role Reality

[Executive summary: how does this specific role work in Nigeria's constitutional framework?
CFRN or enabling law reference. Seat count. Typical career profile. Current digital presence landscape.]

## 2. Mode-By-Mode Content Plan

### Campaign Mode (ctx.data.mode === 'campaign')
[What sections, what content, what CTAs appear in campaign mode for this specific role?]

### Incumbent Mode (ctx.data.mode === 'incumbent')
[What accountability features, what dashboards, what official content appears in incumbent mode?
What is gated behind KYC verification?]

### Post_Office Mode (ctx.data.mode === 'post_office')
[What legacy content, historical records, and future platform content appears in post_office mode?]

## 3. Trust Signal Inventory (By Mode)

Campaign:
- [ ] Party membership card / nomination certificate
- [ ] INEC candidacy reference (form number)
- [ ] [Role-specific trust signals]

Incumbent:
- [ ] INEC/SIEC Certificate of Return reference number
- [ ] [Accountability tracker: budget / bills / projects / portfolio — role-specific]
- [ ] [Other role-specific trust signals]

Post_Office:
- [ ] Historical term dates
- [ ] Key achievements archive
- [ ] [Legacy-specific trust signals]

## 4. INEC/SIEC Compliance Profile

- Primary document: [Certificate of Return form name / appointment letter / party card]
- KYC tier: [Tier N — description]
- Campaign finance gate: [applicable YES/NO — detail if YES]
- Electoral Act 2022 provisions applicable: [list if any]
- Mode-specific compliance differences: [document per mode]

## 5. Content Tone & Voice

- Honorific: [His Excellency / Honourable / Distinguished Senator / Rt. Honourable]
- Register: [formal / professional — political tier appropriate]
- Nigerian political language: [specific vocabulary for this role and tier]
- Geographic framing: [ward / LGA / senatorial district / state / federal / national]
- Primary CTA per mode: [campaign: X / incumbent: Y / post_office: Z]
- What to AVOID: [specific generic phrases that feel non-Nigerian or non-political]

## 6. Image Direction (5 Specific Concepts)

1. **Campaign hero image:** [Specific description — Nigerian political rally/portrait setting]
2. **Incumbent official image:** [Specific description — Nigerian official government setting]
3. **Constituent engagement image:** [Town hall, constituency visit, project commissioning]
4. **Party/symbol image:** [Party colours, flags, emblems in Nigerian context]
5. **Post_office legacy image:** [Archive or foundation launch setting]

## 7. Family Inheritance Notes

[If variant: what does this niche inherit from the anchor template?]
[What is unique to this specific role vs. the anchor?]
[List the specific differentiators that must be implemented — from 07-Political-Collision-Analysis.md]

## 8. Platform Invariants Confirmed

- [ ] T3 (multi-tenant isolation) — confirmed applicable
- [ ] T4 (Nigeria-first defaults) — confirmed applicable
- [ ] P7 (WhatsApp CTA presence) — confirmed applicable
- [ ] P10 (KYC tier gate) — confirmed applicable
```

---

## Section 7 — Implementation Standards Reference

### Mode-Switch Code Template

```typescript
type PoliticalMode = 'campaign' | 'incumbent' | 'post_office';

function getPoliticalMode(ctx: WebsiteRenderContext): PoliticalMode {
  const mode = ctx.data?.mode as string;
  if (mode === 'incumbent' || mode === 'post_office') return mode;
  return 'campaign'; // safe default
}

function renderKycGate(ctx: WebsiteRenderContext): string {
  return `
    <section class="ww-kyc-gate ww-container">
      <h2>Verification Required</h2>
      <p>To view the official ${esc(ctx.data?.roleTitle ?? 'official')} dashboard, 
         please complete identity verification through your WebWaka account settings.</p>
      <a href="/account/verify" class="ww-btn ww-btn-primary">Verify My Identity</a>
    </section>
  `;
}
```

### Party Colour Injection Template

```typescript
function buildPartyCssVars(ctx: WebsiteRenderContext): string {
  const partyColour = /^#[0-9a-f]{3,6}$/i.test(ctx.data?.partyColour ?? '')
    ? ctx.data.partyColour
    : '#2c5f2e'; // neutral political green fallback
  return `--ww-party-primary: ${partyColour};`;
}
```

### Accountability Tracker Template (Incumbent Mode)

```typescript
function renderAccountabilityRow(
  label: string,
  value: string,
  unit: string
): string {
  return `
    <div class="ww-tracker-row">
      <span class="ww-tracker-label">${esc(label)}</span>
      <span class="ww-tracker-value">${esc(value)}</span>
      <span class="ww-tracker-unit">${esc(unit)}</span>
    </div>
  `;
}
```

### INEC Credential Display Template

```typescript
function renderInecCredential(ctx: WebsiteRenderContext, mode: PoliticalMode): string {
  if (mode === 'campaign') return '';
  const certRef = esc(ctx.data?.inecCertificateRef ?? '');
  if (!certRef) return '';
  return `
    <div class="ww-credential-badge">
      <span class="ww-credential-label">INEC Certificate of Return</span>
      <span class="ww-credential-ref">Ref: ${certRef}</span>
    </div>
  `;
}
```

---

## Section 8 — Verification Checklist (Run Before Setting IMPLEMENTED)

```
POLITICAL TEMPLATE VERIFICATION CHECKLIST

Template structure:
[ ] Template file at correct path: apps/brand-runtime/src/templates/niches/{slug}/official-site.ts
[ ] Registered in BUILT_IN_TEMPLATES in template-resolver.ts
[ ] Slug matches: {vertical-slug}-official-site
[ ] All 4 pages render without error (home, about, services, contact)

Mode-switch:
[ ] Campaign mode renders correctly (default when ctx.data.mode absent or unrecognised)
[ ] Incumbent mode: renders full dashboard if ctx.data.kycVerified is truthy
[ ] Incumbent mode: renders KYC gate if ctx.data.kycVerified is falsy
[ ] Post_office mode renders correctly (historical content, no dashboards)
[ ] Mode indicator badge appears in header

Political compliance:
[ ] INEC/SIEC credential display in incumbent + post_office modes (renders when ref provided)
[ ] Party colour applied via --ww-party-primary (from ctx.data.partyColour)
[ ] Campaign finance gate: no donation CTA without INEC campaign account reference (if applicable)
[ ] Electoral Act 2022 compliance note visible if presidential template campaign mode

Nigerian standards:
[ ] esc() wraps ALL user-supplied strings
[ ] Correct honorific title for this role
[ ] Nigerian geographic framing correct for this tier
[ ] Nigerian party names/acronyms used correctly
[ ] WhatsApp CTA on home page (correct per-mode contact: campaign volunteer line vs. constituency office)
[ ] Nigerian phone format in example content
[ ] Nigerian city/LGA/ward references only (no western cities)
[ ] All example prices in NGN/Kobo

Mobile:
[ ] Layout correct at 375px (feature phone viewport)
[ ] Accountability trackers readable on mobile (card layout)
[ ] All touch targets minimum 44px
[ ] No heavy inline media

TypeScript + tests:
[ ] pnpm --filter @webwaka/brand-runtime typecheck → 0 errors
[ ] pnpm --filter @webwaka/brand-runtime test → all existing tests pass
[ ] New template-specific tests added to brand-runtime.test.ts (test all 3 modes)

Files:
[ ] Research brief at: docs/templates/research/political/{slug}-official-site-brief.md
[ ] SQL seed at: infra/db/seeds/templates/{slug}-official-site.sql
[ ] political-niche-registry.json updated to IMPLEMENTED
[ ] political-template-execution-board.md updated
[ ] political-template-queue.md advanced
[ ] If DIFFERENTIATE niche: scope note added to colliding template's pillar2-niche-registry.json notes field
```

---

## Section 9 — Completion Reporting Template

After completing a political niche, report using this format:

```
POLITICAL NICHE IMPLEMENTATION COMPLETE

Niche ID:         POL-{vertical-slug}-official-site
VN-ID:            {proposedVnId}
Niche Name:       {nicheName}
Sprint:           {sprintAssignment}
Family:           {politicalFamily} ({familyRole})
Template slug:    {vertical-slug}-official-site
Template file:    apps/brand-runtime/src/templates/niches/{slug}/official-site.ts
Research brief:   docs/templates/research/political/{slug}-official-site-brief.md
SQL seed:         infra/db/seeds/templates/{slug}-official-site.sql

Modes implemented: campaign ✓ | incumbent ✓ | post_office ✓
KYC gate:          Tier {N} — implemented ✓
Party colour:      --ww-party-primary from ctx.data.partyColour ✓
INEC credential:   Displayed in incumbent + post_office modes ✓
Campaign finance:  {N/A | Gate implemented}

TypeScript:        0 errors ✓
Tests:             All {N} existing tests passing + {M} new tests added ✓

Registry status:   IMPLEMENTED (set {date})

NEXT NICHE IN QUEUE:
  Niche ID:   {next niche ID}
  Blocked:    {YES (anchor not yet IMPLEMENTED) | NO}
  Status:     READY_FOR_RESEARCH
```

---

*Last updated: 2026-04-26*  
*This document is read-only for agents — do not modify without human authorisation.*
