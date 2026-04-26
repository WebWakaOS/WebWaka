# Political Role-Specific Template Status Codes — Reference Card

**Document type:** Canonical status model reference  
**Status:** ACTIVE  
**Date:** 2026-04-26  
**Authority:** `docs/templates/expansion/political/00-Political-Master-Blueprint.md`  
**Extends:** `docs/templates/pillar2-template-status-codes.md` — inherits all base codes; political codes are additive  
**Do not modify status codes without human authorisation.**

---

## Status Code Definitions

These are the ONLY valid values for the `templateStatus` field in `political-niche-registry.json`.  
No other values are permitted. Any agent that encounters an unknown status must halt and flag it.  
Status codes are identical to the Pillar 2 model — the political system inherits them wholesale.

---

### `UNASSESSED`
**Meaning:** The niche exists in the registry as a candidate but has not yet been evaluated for template feasibility or canonical eligibility.  
**Who sets it:** System — initial state for all newly-added political niche records.  
**Transition to:** `READY_FOR_RESEARCH` (after human confirms the niche is canonical — i.e., added to CSV + VN-ID confirmed)  
**Blocked from:** Any implementation work. All 16 political niches start at `READY_FOR_RESEARCH` because the blueprint phase already cleared the UNASSESSED gate.  
**Political note:** A niche cannot leave UNASSESSED until its collision audit verdict is CLEAR or DIFFERENTIATE in `07-Political-Collision-Analysis.md`.

---

### `READY_FOR_RESEARCH`
**Meaning:** The niche has passed the blueprint/collision gate and is authorised for research. An agent may begin Nigeria-first political role research.  
**Who sets it:** Human (founding team) after approving the sprint plan. Current state for all 16 political niches.  
**Transition to:** `RESEARCH_IN_PROGRESS` (when an agent claims the niche and begins research)  
**Political note:** An agent must confirm the niche exists in `political-niche-registry.json` at this status before beginning any work. Family anchor niches (governor, state-commissioner, party-chapter-officer) must reach `IMPLEMENTED` before their variants may be claimed.

---

### `RESEARCH_IN_PROGRESS`
**Meaning:** An agent has claimed this niche and is actively conducting research — Nigerian political role landscape, INEC/SIEC regulatory requirements, mode-split design (campaign / incumbent / post_office).  
**Who sets it:** The agent beginning research — must also set `owner` field to its session identifier.  
**Transition to:** `RESEARCH_SYNTHESIZED` (when research is complete and brief is written)  
**Notes:** Only one agent may hold a niche in this state at a time. If `owner` is set, no other agent may claim this niche.

---

### `RESEARCH_SYNTHESIZED`
**Meaning:** Research is complete. A political role research brief has been written and committed. Implementation may now be approved.  
**Who sets it:** The agent that completed research.  
**Transition to:** `READY_FOR_IMPLEMENTATION` (after human review, or auto-advance with agent authority)  
**Notes:** The `researchBriefPath` field must be populated when this status is set.

---

### `READY_FOR_IMPLEMENTATION`
**Meaning:** Research brief is approved. An agent may begin template implementation.  
**Who sets it:** Human (after reviewing the research brief) or the implementing agent exercising explicit authority.  
**Transition to:** `IMPLEMENTATION_IN_PROGRESS` (when an agent begins coding)  
**Political note:** Family variants may only enter this state AFTER the family anchor is `IMPLEMENTED` or `SHIPPED`.

---

### `IMPLEMENTATION_IN_PROGRESS`
**Meaning:** An agent is actively building the template — writing TypeScript, implementing mode-switch logic (`ctx.data.mode`), and registering the template.  
**Who sets it:** The agent beginning implementation — must also set `owner` field.  
**Transition to:** `IMPLEMENTED` (when template code is complete and wired)  
**Notes:** Only one agent may hold a niche in this state at a time. Agents must check `owner` before claiming.

---

### `IMPLEMENTED`
**Meaning:** Template code is complete. The `WebsiteTemplateContract` exists, is registered in `BUILT_IN_TEMPLATES`, and the marketplace manifest SQL exists. The template handles all applicable modes (campaign / incumbent / post_office). Has NOT yet been verified or deployed.  
**Who sets it:** The agent that completed implementation.  
**Transition to:** `VERIFIED` (after testing confirms correct rendering across all modes)  
**Must do before setting:** Populate `primaryTemplatePath`, `templateSlug`, `implementedAt`, set `runtimeIntegrationStatus` to `REGISTERED_IN_BUILT_IN_TEMPLATES`. Confirm `tsc --noEmit` passes. Add template-specific tests to `brand-runtime.test.ts`.

---

### `VERIFIED`
**Meaning:** The template has been tested and confirmed to render correctly in brand-runtime across all pages (home, about, services, contact) and all modes (campaign, incumbent, post_office). Nigeria-first political compliance verified. INEC/SIEC trust signals confirmed present.  
**Who sets it:** Human reviewer or a QA agent.  
**Transition to:** `APPROVED` (after final platform admin sign-off)  
**Political verification means:** (a) all 3 mode renders work on a test tenant, (b) mobile layout correct on 375px, (c) Nigerian political content confirmed, (d) INEC/SIEC compliance badges present where required, (e) mode-switch driven by `ctx.data.mode`, (f) no campaign finance donation UI in `campaign` mode without INEC account reference.

---

### `APPROVED`
**Meaning:** Template is approved for production use. Marketplace `template_registry` entry is set to `approved` status.  
**Who sets it:** Platform admin (super_admin role required for registry approval).  
**Transition to:** `SHIPPED` (after Cloudflare Worker deployment completes)  
**Notes:** Approval requires the marketplace manifest to be in `approved` status in D1.

---

### `SHIPPED`
**Meaning:** Template is live in production. `runtimeIntegrationStatus` = `LIVE_IN_PRODUCTION`. Tenants can install and activate the template.  
**Who sets it:** System (or the agent that confirmed production deployment).  
**Transition to:** `VARIANTS_PENDING` if additional mode variants or premium layout variants are planned; otherwise terminal.  
**Political note:** A SHIPPED political template must be monitored against INEC regulatory changes each election cycle. Notify platform ops when a new electoral cycle begins.

---

### `BLOCKED`
**Meaning:** Work cannot proceed due to a dependency, technical blocker, regulatory gate, or collision audit flag.  
**Who sets it:** Any agent or human that identifies a blocker.  
**Transition to:** `READY_FOR_RESEARCH` or `READY_FOR_IMPLEMENTATION` (when blocker is resolved)  
**Must do when setting:** Populate the `blockers` field with specific blocker descriptions. Common political blockers: family anchor not yet IMPLEMENTED, INEC regulatory requirement unresolved, CSV row not yet added.

---

### `NEEDS_REVISION`
**Meaning:** The template was returned by a reviewer for changes. Does not meet quality, Nigeria-first, or platform invariant standards.  
**Who sets it:** Reviewer (human or QA agent).  
**Transition to:** `IMPLEMENTATION_IN_PROGRESS` (when the original implementer picks it up again)  
**Must do when setting:** Document the revision requirements in the `notes` field. Political revision triggers: incorrect INEC compliance language, missing mode-switch, incorrect KYC tier gate, wrong regulatory body referenced.

---

### `VARIANTS_PENDING`
**Meaning:** The primary template is SHIPPED. One or more additional layout variants (e.g., premium campaign dashboard, opposition mode) are queued for development.  
**Who sets it:** Platform admin or system.  
**Transition to:** Remains in this state while variants are in progress; terminal once all planned variants are shipped.

---

### `ARCHIVED`
**Meaning:** The template has been permanently removed from active development or production. No new installations allowed. Typically triggered by a constitutional/structural change to the office type (e.g., if LGA elections are suspended nationally).  
**Who sets it:** Platform admin only.  
**Transition to:** Terminal — no further transitions.  
**Notes:** Existing installations continue to function but are not upgradeable.

---

## Status Transition Diagram

```
UNASSESSED
    ↓ (blueprint approval + CSV add + VN-ID confirm)
READY_FOR_RESEARCH  ← all 16 political niches start here
    ↓ (agent claims niche — family anchor only, or anchor already IMPLEMENTED)
RESEARCH_IN_PROGRESS
    ↓ (research complete — political brief written)
RESEARCH_SYNTHESIZED
    ↓ (human or agent auto-advances)
READY_FOR_IMPLEMENTATION
    ↓ (agent claims niche)
IMPLEMENTATION_IN_PROGRESS
    ↓ (code complete — all modes, tsc passes)
IMPLEMENTED
    ↓ (QA passes all modes + INEC compliance)
VERIFIED
    ↓ (admin approves)
APPROVED
    ↓ (deployed to production)
SHIPPED ──→ VARIANTS_PENDING (if variants planned)

At any point:
    → BLOCKED (when blocker found — common: anchor not yet IMPLEMENTED)
    BLOCKED → READY_FOR_RESEARCH or READY_FOR_IMPLEMENTATION (when resolved)

Post-IMPLEMENTED:
    → NEEDS_REVISION (reviewer returns — common: INEC compliance gap)
    NEEDS_REVISION → IMPLEMENTATION_IN_PROGRESS

SHIPPED → ARCHIVED (admin permanent removal)
```

---

## Political-Specific Additional Status: `COLLISION_GATE`

This is a PRE-REGISTRY status used during blueprint phase only. It does not appear in `political-niche-registry.json` — it is documented here for completeness.

| Value | Meaning |
|-------|---------|
| `CLEAR` | No collision with any of 192 existing templates; may proceed directly to CSV add |
| `DIFFERENTIATE` | Collision risk with existing template; proceed only with documented differentiator in `07-Political-Collision-Analysis.md` |
| `MERGE` | Niche is identical to an existing template; do not create new record — extend existing |
| `REJECT` | Niche is not viable; do not add to registry |

**Current political expansion results:** 2 CLEAR, 14 DIFFERENTIATE, 0 MERGE, 0 REJECT (all 16 proceed).

---

## Research Status Codes

The `researchStatus` field uses:

| Value | Meaning |
|-------|---------|
| `NOT_STARTED` | No research has been done for this niche |
| `IN_PROGRESS` | An agent is actively researching the political role |
| `SYNTHESIZED` | Research is complete and political role brief is written |

---

## Runtime Integration Status Codes

The `runtimeIntegrationStatus` field uses:

| Value | Meaning |
|-------|---------|
| `NOT_REGISTERED` | Template slug is not in `BUILT_IN_TEMPLATES` in `template-resolver.ts` |
| `REGISTERED_IN_BUILT_IN_TEMPLATES` | Slug is in `BUILT_IN_TEMPLATES` but not yet deployed to production |
| `LIVE_IN_PRODUCTION` | Template is live in the production Cloudflare Worker deployment |

---

## KYC Tier Reference (Political-Specific)

Political templates gate content by KYC tier based on the `ctx.data.mode` field.

| KYC Tier | Description | Political Mode Access |
|----------|-------------|----------------------|
| Tier 1 | Email verified | `campaign` mode (unverified candidate page) |
| Tier 2 | Document upload (party card / candidacy form) | `campaign` mode + `post_office` mode |
| Tier 3 | INEC/SIEC reference cross-check | `incumbent` mode (full official dashboard) |
| Tier 4 | Presidential compliance gate (INEC Form CF001) | `campaign` presidential mode with donation CTA |

---

*Last updated: 2026-04-26*  
*This document is read-only for agents — do not modify without human authorisation.*
