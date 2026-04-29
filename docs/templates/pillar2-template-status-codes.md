# Pillar 2 Template Status Codes — Reference Card

**Document type:** Canonical status model reference  
**Status:** ACTIVE  
**Date:** 2026-04-25  
**Authority:** `docs/reports/pillar2-niche-identity-system-2026-04-25.md`  
**Do not modify status codes without updating the identity system report.**

---

## Status Code Definitions

These are the ONLY valid values for the `templateStatus` field in `pillar2-niche-registry.json`.  
No other values are permitted. Any agent that encounters an unknown status must halt and flag it.

---

### `UNASSESSED`
**Meaning:** The niche exists in the registry but has not yet been evaluated for template feasibility.  
**Who sets it:** System — this is the initial state for all newly-added niche records.  
**Transition to:** `READY_FOR_RESEARCH` (after a human confirms the niche is viable and prioritised)  
**Blocked from:** Any implementation work.

---

### `READY_FOR_RESEARCH`
**Meaning:** The niche is confirmed Pillar 2-eligible and prioritised. An agent may begin niche research.  
**Who sets it:** Human (platform owner / operator) or agent with explicit authorisation.  
**Transition to:** `RESEARCH_IN_PROGRESS` (when an agent claims the niche and begins research)  
**Notes:** An agent must read this registry and confirm a niche is in this state before beginning any research.

---

### `RESEARCH_IN_PROGRESS`
**Meaning:** An agent has claimed this niche and is actively conducting online research and context synthesis.  
**Who sets it:** The agent beginning research — must also set `owner` field to identify itself.  
**Transition to:** `RESEARCH_SYNTHESIZED` (when research is complete and brief is written)  
**Notes:** Only one agent may hold a niche in this state at a time. If `owner` is set, no other agent may claim this niche.

---

### `RESEARCH_SYNTHESIZED`
**Meaning:** Research is complete. A research brief has been written and committed. Implementation may now be approved.  
**Who sets it:** The agent that completed research.  
**Transition to:** `READY_FOR_IMPLEMENTATION` (after human review and approval of the research brief)  
**Notes:** The `researchBriefPath` field must be populated when this status is set.

---

### `READY_FOR_IMPLEMENTATION`
**Meaning:** Research brief is approved. An agent may begin template implementation.  
**Who sets it:** Human (after reviewing the research brief) or auto-transition if research is self-approved.  
**Transition to:** `IMPLEMENTATION_IN_PROGRESS` (when an agent begins coding)  
**Notes:** The `researchStatus` field should be `SYNTHESIZED` when this status is set.

---

### `IMPLEMENTATION_IN_PROGRESS`
**Meaning:** An agent is actively building the template — writing TypeScript files and registering the template.  
**Who sets it:** The agent beginning implementation — must also set `owner` field.  
**Transition to:** `IMPLEMENTED` (when template code is complete and wired)  
**Notes:** Only one agent may hold a niche in this state at a time. Agents must check `owner` before claiming.

---

### `IMPLEMENTED`
**Meaning:** Template code is complete. The `WebsiteTemplateContract` exists, is registered in `BUILT_IN_TEMPLATES`, and the marketplace manifest SQL exists. The niche has NOT yet been verified or deployed.  
**Who sets it:** The agent that completed implementation.  
**Transition to:** `VERIFIED` (after testing confirms correct rendering)  
**Must do before setting:** Populate `primaryTemplatePath`, `templateSlug`, `implementedAt`, set `runtimeIntegrationStatus` to `REGISTERED_IN_BUILT_IN_TEMPLATES`.

---

### `VERIFIED`
**Meaning:** The template has been tested and confirmed to render correctly in brand-runtime across home, about, services, and contact pages. Nigeria-first principles have been verified applied.  
**Who sets it:** Human reviewer or a QA agent.  
**Transition to:** `APPROVED` (after final platform admin sign-off)  
**Notes:** Verification means: (a) template renders on a test tenant, (b) mobile layout correct on 375px, (c) Nigerian content and imagery confirmed, (d) all platform invariants verified.

---

### `APPROVED`
**Meaning:** Template is approved for production use. The marketplace `template_registry` entry has been set to `approved` status.  
**Who sets it:** Platform admin (super_admin role required for registry approval).  
**Transition to:** `SHIPPED` (after Cloudflare Worker deployment completes)  
**Notes:** Approval requires the marketplace manifest to be in `approved` status in D1.

---

### `SHIPPED`
**Meaning:** Template is live in production. `runtimeIntegrationStatus` = `LIVE_IN_PRODUCTION`. Tenants can install and activate the template.  
**Who sets it:** System (or the agent that confirmed production deployment).  
**Transition to:** `VARIANTS_PENDING` if additional variants are planned; otherwise terminal.  
**Notes:** A shipped template should not be modified without creating a new version/variant.

---

### `BLOCKED`
**Meaning:** Work cannot proceed due to a dependency, technical blocker, or governance issue.  
**Who sets it:** Any agent or human that identifies a blocker.  
**Transition to:** `READY_FOR_RESEARCH` or `READY_FOR_IMPLEMENTATION` (when blocker is resolved)  
**Must do when setting:** Populate the `blockers` field with specific blocker descriptions.

---

### `NEEDS_REVISION`
**Meaning:** The template was returned by a reviewer for changes. It does not meet quality, Nigeria-first, or platform invariant standards.  
**Who sets it:** Reviewer (human or QA agent).  
**Transition to:** `IMPLEMENTATION_IN_PROGRESS` (when the original implementer picks it up again)  
**Must do when setting:** Document the revision requirements in the `notes` field.

---

### `VARIANTS_PENDING`
**Meaning:** The primary template is SHIPPED. One or more additional variants (e.g., premium layout, seasonal variant) are queued for development.  
**Who sets it:** Platform admin or system.  
**Transition to:** Remains in this state while variants are in progress; terminal once all planned variants are shipped.  
**Notes:** Variant work follows the same research → implementation → verify → ship cycle for each variant.

---

### `ARCHIVED`
**Meaning:** The template has been permanently removed from active development or production. No new installations allowed.  
**Who sets it:** Platform admin only.  
**Transition to:** Terminal — no further transitions.  
**Notes:** Existing installations of an archived template continue to function but are not upgradeable.

---

## Status Transition Diagram

```
UNASSESSED
    ↓ (human approval)
READY_FOR_RESEARCH
    ↓ (agent claims niche)
RESEARCH_IN_PROGRESS
    ↓ (research complete)
RESEARCH_SYNTHESIZED
    ↓ (human approves brief)
READY_FOR_IMPLEMENTATION
    ↓ (agent claims niche)
IMPLEMENTATION_IN_PROGRESS
    ↓ (code complete)
IMPLEMENTED
    ↓ (testing passes)
VERIFIED
    ↓ (admin approves)
APPROVED
    ↓ (deployed to production)
SHIPPED ──→ VARIANTS_PENDING (if variants planned)

At any point:
    → BLOCKED (when blocker found)
    BLOCKED → READY_FOR_RESEARCH or READY_FOR_IMPLEMENTATION (when resolved)

Post-IMPLEMENTED:
    → NEEDS_REVISION (reviewer returns)
    NEEDS_REVISION → IMPLEMENTATION_IN_PROGRESS
    
SHIPPED → ARCHIVED (admin permanent removal)
```

---

## Research Status Codes

The `researchStatus` field uses a separate, simpler set:

| Value | Meaning |
|-------|---------|
| `NOT_STARTED` | No research has been done for this niche |
| `IN_PROGRESS` | An agent is actively researching |
| `SYNTHESIZED` | Research is complete and brief is written |

---

## Runtime Integration Status Codes

The `runtimeIntegrationStatus` field uses:

| Value | Meaning |
|-------|---------|
| `NOT_REGISTERED` | Template slug is not in `BUILT_IN_TEMPLATES` in `template-resolver.ts` |
| `REGISTERED_IN_BUILT_IN_TEMPLATES` | Slug is in `BUILT_IN_TEMPLATES` but not yet deployed to production |
| `LIVE_IN_PRODUCTION` | Template is live in the production Cloudflare Worker deployment |

---

*Last updated: 2026-04-25*  
*This document is read-only for agents — do not modify without human authorisation.*
