# WebWaka OS — Next-Generation Template Universe Expansion Blueprint

**Status:** AUTHORITATIVE DESIGN DOCUMENT — Research Phase
**Date:** 2026-04-26
**Scope:** Deep research and expansion design for the next 50–100 niches beyond the current 157-niche universe
**Author:** System Research (Automated deep-audit synthesis)
**Governance basis:** `docs/governance/canonical-niche-registry.md`, `docs/governance/vertical-niche-master-map.md`, `docs/governance/niche-family-variant-register.md`
**Do NOT implement from this document** — implementation requires separate Pillar 2 / Pillar 3 sprint activation

---

## Executive Summary

WebWaka OS has successfully launched **157 active canonical niches** spanning 14 industry categories and 39 niche families. All Pillar 2 (branding/website) and Pillar 3 (marketplace/listing) templates across these niches have been implemented and shipped to production as of 2026-04-26.

This blueprint documents the **next generation of expansion** — the set of new niches, new niche families, and new strategic verticals that should be researched, governed, and eventually implemented beyond the current 157-niche universe. It is the result of a systematic gap analysis of the Nigerian SME economy against the current template universe.

**Key findings:**

1. **53 high-confidence new niche candidates** identified across 10 expansion areas
2. **12 proposed new niche families** (NF-XXX codes) requiring formal governance registration
3. **7 strategic "Pillar 4" concepts** — new platform capability layers not yet architected
4. **5 underserved high-priority segments** that have the strongest urgency for immediate addition to the niche universe
5. **Nigeria-specific market dynamics** create several unique niches with no global SaaS analogue

---

## Structure of This Blueprint

| Document | File | Contents |
|---|---|---|
| **Master Blueprint** (this file) | `00-expansion-master-blueprint.md` | Executive summary, methodology, strategic decisions |
| **Gap Analysis** | `01-universe-gap-analysis.md` | Systematic identification of what the 157-niche universe is missing |
| **Candidate Niche Registry** | `02-candidate-niche-registry.md` | Full proposed new niches with scoring and governance metadata |
| **Niche Family Expansion** | `03-niche-family-expansion.md` | New NF-XXX family structures for proposed niches |
| **Nigeria Market Intelligence** | `04-nigeria-market-intelligence.md` | Nigeria-specific market research, sizing, digital readiness |
| **Regulatory Landscape** | `05-regulatory-landscape-new.md` | Regulatory gates for proposed new niches |
| **Expansion Priority Queue** | `06-expansion-priority-queue.md` | Ordered queue for next sprint activation |
| **Overlap & Collision Analysis** | `07-overlap-collision-analysis.md` | QA gate: every candidate cleared against existing 160-row CSV; internal duplicates flagged |

---

## Current Universe Baseline (as of 2026-04-26)

| Metric | Value |
|---|---|
| Active canonical niches | **157** |
| P1 (Original) niches | **17** |
| P2 (High-Fit) niches | **63** |
| P3 (Medium-Fit) niches | **77** |
| Deprecated niches | **3** (gym-fitness, petrol-station, nurtw) |
| Niche families | **39** |
| Standalone niches (no family) | **44** |
| Templates shipped: Pillar 2 | **154** (all) |
| Templates shipped: Pillar 3 | **77** (all) |
| Industry categories | **14** |

### Coverage by Category (Current)

| Category | Current Count | Universe Gap (estimated) |
|---|---|---|
| Commerce | 45 | High — missing retail sub-sectors, luxury, digital commerce |
| Transport | 12 | Low — well-covered; boats/aviation specialty missing |
| Civic | 13 | Medium — diaspora, student housing, green groups missing |
| Politics | 7 | Low — all office types covered |
| Health | 9 | High — hospital, lab, physio, mental health, maternity missing |
| Education | 8 | High — tertiary, online learning, exam prep missing |
| Agricultural | 12 | Medium — aquaculture, cattle, rice mill, apiary missing |
| Professional | 8 | High — HR, consulting, software agency, architecture missing |
| Creator | 8 | Medium — video production, news platform, magazine missing |
| Financial | 6 | High — MFB, pension, securities, fintech platform missing |
| Place | 6 | Medium — co-working, public library, stadium missing |
| Media | 4 | Medium — online news, billboard, social media agency missing |
| Institutional | 2 | Low — broadly covered |
| Social | 2 | Medium — hobby groups, alumni association missing |

---

## Methodology

### Phase 1 — Existing Universe Audit
- Read all governance documents (canonical-niche-registry, niche-family-variant-register, vertical-niche-master-map, verticals-master-plan)
- Enumerated all 157 active niches by category, family, entity type, priority, and regulatory gate
- Documented 44 standalone niches and 39 families in detail

### Phase 2 — Gap Identification Framework
Applied five lenses to identify gaps:

1. **NBS / SMEDAN sector lens** — Nigeria Bureau of Statistics and SMEDAN sector classifications vs. current niche coverage
2. **NAFDAC / CAC / CBN regulatory lens** — every licensed business category that issues registrations in Nigeria
3. **WhatsApp Business / Google My Business lens** — what Nigerian businesses actually create pages for
4. **Digital readiness lens** — segments with existing digital presence but no specialized SaaS solution
5. **Diaspora / remittance lens** — business types driven by Nigeria's diaspora economy

### Phase 3 — Candidate Scoring
Each candidate niche scored on 5 dimensions (0–10 each, max 50):

| Dimension | Description |
|---|---|
| **Nigeria Market Density** | Number of businesses in Nigeria in this category |
| **Digital Readiness** | How ready operators are to use digital tools |
| **Template Differentiation** | How distinct the niche template needs are from existing templates |
| **Regulatory Complexity** | Inverse score — simpler = higher (easier to build) |
| **Revenue Potential** | Estimated SaaS subscription + transaction yield |

**Priority thresholds:**
- Score ≥ 40 → P1 (add to next sprint)
- Score 30–39 → P2 (add to following sprint)
- Score 20–29 → P3 (Medium-fit backlog)
- Score < 20 → Defer / monitor

### Phase 4 — Family Architecture
Proposed new niches grouped into candidate niche families where ≥2 niches share core capabilities. New NF-XXX codes proposed following existing governance conventions.

### Phase 5 — Collision Audit (2026-04-26)
All 38 candidates cleared against the live 160-row `0004_verticals-master.csv`. Results in `07-overlap-collision-analysis.md`:
- **29 CLEAR** — no collision with any existing vertical
- **9 DIFFERENTIATE** — overlap exists but candidate is viable; existing row requires a scope note update before promotion
- **0 REJECT** — zero candidates rejected; all 38 survive the audit
- **2 internal CSV duplicates** identified and flagged for deduplication (`vtx_gym`/`vtx_gym_fitness`; `vtx_event_hall`/`vtx_events_centre`)

---

## Strategic Decisions

### Decision 1: Extend to 250 niches (P4 Universe)
The current 157-niche universe covers the most obvious Nigerian SME categories but misses several high-density sectors. The recommended next expansion target is **250 total active niches**, adding approximately 93 new niches. This document proposes 53 high-confidence candidates; the remaining 40 would be added in a subsequent research pass.

### Decision 2: New category codes needed
The current 14 categories should be extended with:
- `fintech` (distinct from `financial` — platform/product companies)
- `wellness` (distinct from `health` — non-medical wellness and alternative medicine)
- `hospitality` (distinct from `accommodation` — expands hotel to full hospitality sector)
- `property` (distinct from `construction` — pure property operations without building)

### Decision 3: VN-ID Numbering
New niches will use the next available ID within each category code:
- `VN-HLT-012` through `VN-HLT-020` for health expansion
- `VN-EDU-009` through `VN-EDU-016` for education expansion
- `VN-FIN-008` through `VN-FIN-015` for financial expansion
- New categories (`VN-WEL-xxx`, `VN-FTK-xxx`, `VN-HSP-xxx`, `VN-PRP-xxx`) for new category codes

### Decision 4: Governance gate before implementation
No new niche may be implemented without:
1. Entry in `docs/templates/expansion/02-candidate-niche-registry.md` with score ≥ 20
2. Canonical slug confirmed and VN-ID assigned
3. Niche family membership (or standalone designation) confirmed
4. Regulatory gate documented in `docs/templates/expansion/05-regulatory-landscape-new.md`
5. **Collision audit cleared** in `docs/templates/expansion/07-overlap-collision-analysis.md` — CLEAR or DIFFERENTIATE verdict required; all DIFFERENTIATE pre-actions completed before CSV write
6. Internal CSV deduplication resolved (vtx_gym/vtx_gym_fitness, vtx_event_hall/vtx_events_centre) before any new rows are appended
7. Entry added to `infra/db/seeds/0004_verticals-master.csv` (status=planned)

### Decision 5: Pillar architecture remains unchanged
The 3-in-1 platform architecture (Pillar 1=Ops, Pillar 2=Branding, Pillar 3=Marketplace) is not changed by this expansion. The "Pillar 4" concepts documented in this blueprint refer to new **feature capability layers** that sit on top of the existing three pillars — not new foundational pillars.

---

## Top 5 Underserved High-Priority Segments

These five segments have the strongest case for immediate addition to the canonical niche universe:

### 1. Diagnostic / Medical Laboratory (`diagnostic-lab`)
**Why urgent:** Every clinic, hospital, and pharmacy refers patients to labs. Nigeria has tens of thousands of MLSCN-licensed labs. No specialized SaaS for lab result management, patient communication, or sample tracking exists at the Nigerian SME level. Template requirements are highly distinct from `clinic`. Estimated score: **44/50**.

### 2. Hospital / Secondary Healthcare (`hospital`)
**Why urgent:** The `clinic` niche covers primary care but explicitly excludes inpatient facilities. Nigerian private hospitals are a massive segment — MDCN estimates over 20,000 registered private hospitals. Inpatient management (ward beds, admission records, discharge summaries) requires a completely different template profile. Estimated score: **42/50**.

### 3. Microfinance Bank (`microfinance-bank`)
**Why urgent:** CBN licensed over 900 microfinance banks in Nigeria as of 2025. These institutions are organizationally distinct from POS businesses, savings groups, and mobile money agents. They require loan management, CBN reporting, KYC tiers, and customer passbooks. No current niche covers this. Estimated score: **41/50**.

### 4. Software / App Development Agency (`software-agency`)
**Why urgent:** Nigeria's tech ecosystem is one of Africa's largest. Lagos alone has hundreds of software agencies and app development studios. The `it-support` niche covers hardware/repair; the `startup` niche covers product companies. A dedicated `software-agency` niche serves the service/agency model. Estimated score: **40/50**.

### 5. Co-working Space / Business Hub (`coworking-space`)
**Why urgent:** Post-COVID, co-working spaces proliferated across Lagos, Abuja, Port Harcourt, and Ibadan. These are distinct from `tech-hub` (which is community/innovation focused) and from `event-hall` (which is venue-rental). Co-working spaces have seat/desk booking, hot-desking, monthly memberships, and meeting room rental. Estimated score: **39/50**.

---

## New Category Codes Proposed

### `WEL` — Wellness & Alternative Health
Captures non-MDCN health and wellness operators that are legally distinct from licensed healthcare facilities. Examples: yoga studio, traditional medicine practitioner, supplement shop, wellness retreat.

### `HSP` — Hospitality (extended)
Elevates `hotel` from a standalone niche to an anchor of a proper Hospitality family. Adds bar/lounge, resort, vacation rental, hostel, food court.

### `FTK` — Fintech & Digital Finance
Distinct from existing `financial` (FIN) category. FTK covers platform companies and regulated fintech operators: MFB, SACCO, payment gateway reseller, fintech startup.

### `PRP` — Property Management
Distinct from `CST` (construction/real estate). PRP covers pure property operations without construction: property management company, facilities management firm, student hostel operator, short-let portfolio operator.

### `TEC` — Technology Services
Distinct from `ITC` (IT Support). TEC covers professional technology services firms: software agency, cybersecurity firm, data analytics, IT consulting.

---

## Connections to Existing Platform Capabilities

The expansion niches described in this blueprint leverage these existing WebWaka OS capabilities without modification:

| Platform Capability | New Niches That Benefit |
|---|---|
| `community_spaces` | Yoga studio, co-working space, business hub, alumni association |
| `membership_tiers` | Gym chain, swimming pool, professional association, co-working |
| `offerings.appointments` | Diagnostic lab, physiotherapy, mental health clinic, midwife |
| `offerings.products` | Electronics store, baby shop, jewellery shop, home appliances |
| `offerings.routes` | Boat charter, airport transfer, ambulance service |
| `geography` table | All new niches — location-based discovery |
| `compliance_documents` | MFB (CBN), hospital (MDCN), lab (MLSCN), architecture (ARCON) |
| CAC / IT / FRSC gates | Software agency, architecture firm, logistics company |
| `payments` + split | Co-working, hostel, vacation rental, food court |
| `community_courses` | IT academy, exam prep centre, e-learning platform |

---

## What This Document Does NOT Do

- Does not implement any template (zero code changes)
- Does not modify the canonical niche registry (that happens when niches graduate from candidate to planned status via CSV update)
- Does not change template-resolver.ts
- Does not change any seed SQL or migrations
- Does not deploy anything

---

*Produced: 2026-04-26 — Deep Research & Expansion Design Phase*
*Next action: Graduate top candidates to canonical niche registry via CSV update + governance docs*
