# WebWaka OS — Expansion Priority Queue

**Status:** RESEARCH — Not yet active sprint
**Date:** 2026-04-26
**Parent:** `docs/templates/expansion/00-expansion-master-blueprint.md`
**Scope:** Ordered, prioritized queue for the next template expansion sprint beyond the current 157-niche universe

---

## Preamble

This document defines the activation order for the next expansion sprint. It combines:
- Candidate scores from `02-candidate-niche-registry.md`
- Regulatory complexity from `05-regulatory-landscape-new.md`
- Market intelligence from `04-nigeria-market-intelligence.md`
- Family dependencies from `03-niche-family-expansion.md`

**The queue is ordered by: Score × (10 - Regulatory Complexity) × Market Urgency**

A niche may only be formally activated (moved from Candidate to Planned status) after:
1. This queue is reviewed and approved by the founding team
2. The niche is added to `infra/db/seeds/0004_verticals-master.csv` with `status=planned`
3. A VN-ID is confirmed and added to `docs/governance/canonical-niche-registry.md`
4. The niche family is formally added or extended in `docs/governance/niche-family-variant-register.md`

---

## SPRINT 1 — Highest Impact, Lowest Friction (P1 Candidates, Low-Medium Regulatory Burden)

These are the 15 P1-scored candidates that do not require complex compliance infrastructure. They should be activated first.

### Priority Order

| Queue # | Slug | Display Name | Score | Reg. Tier | Proposed VN-ID | Family |
|---|---|---|---|---|---|---|
| 1 | `software-agency` | Software / App Dev Agency | 44 | Tier 1 | VN-PRO-009 | NF-TEC-AGY (anchor) |
| 2 | `elearning-platform` | E-Learning Platform | 43 | Tier 1 | VN-EDU-011 | NF-EDU-DIG (anchor) |
| 3 | `digital-marketing-agency` | Digital Marketing Agency | 43 | Tier 1–2 | VN-PRO-013 | NF-TEC-AGY (variant) |
| 4 | `electronics-store` | Electronics / Mobile Phone Store | 41 | Tier 2 | VN-COM-001 | NF-COM-RET (anchor) |
| 5 | `hospital` | Hospital / Secondary Healthcare | 41 | Tier 4 | VN-HLT-012 | NF-HLT-HOS (anchor) |
| 6 | `coworking-space` | Co-working Space / Business Hub | 41 | Tier 1 | VN-PRP-001 | NF-PRP-SVC (anchor) |
| 7 | `recruitment-agency` | HR / Recruitment Agency | 41 | Tier 1 | VN-PRO-011 | NF-PRO-HR (anchor) |
| 8 | `cybersecurity-firm` | Cybersecurity Company | 41 | Tier 1 | VN-TEC-001 | NF-TEC-SEC (anchor) |
| 9 | `exam-prep-centre` | Exam Preparation Centre | 40 | Tier 1 | VN-EDU-010 | NF-EDU-SCH (variant) |
| 10 | `university` | University / Polytechnic | 40 | Tier 4 | VN-EDU-009 | NF-EDU-TER (anchor) |
| 11 | `management-consulting` | Management Consulting Firm | 40 | Tier 1 | VN-PRO-012 | NF-PRO-ADV (anchor) |
| 12 | `data-analytics-firm` | Data Analytics / BI Firm | 40 | Tier 1–2 | VN-TEC-002 | NF-TEC-AGY (variant) |
| 13 | `tech-academy` | Technology / Coding Academy | 40 | Tier 1 | VN-EDU-013 | NF-EDU-DIG (variant) |
| 14 | `diagnostic-lab` | Medical / Diagnostic Laboratory | 40 | Tier 3 | VN-HLT-013 | NF-HLT-HOS (variant) |
| 15 | `hospital` → Reorder: see note | — | — | — | — | — |

> **Note on `hospital` and `university`:** Despite scoring P1, both require Tier 4 regulatory verification infrastructure. They appear in this sprint for **research and template design** but their activation gate is delayed until the compliance engineering for Tier 4 verification is built. Specifically:
> - `hospital` → blocked until MDCN API integration or manual verification workflow is implemented
> - `university` → blocked until NUC approval verification workflow is implemented

**Effective Sprint 1 first batch (no compliance blocker):**
1. `software-agency` (VN-PRO-009)
2. `elearning-platform` (VN-EDU-011)
3. `digital-marketing-agency` (VN-PRO-013)
4. `electronics-store` (VN-COM-001)
5. `coworking-space` (VN-PRP-001)
6. `recruitment-agency` (VN-PRO-011)
7. `cybersecurity-firm` (VN-TEC-001)
8. `exam-prep-centre` (VN-EDU-010)
9. `management-consulting` (VN-PRO-012)
10. `data-analytics-firm` (VN-TEC-002)
11. `tech-academy` (VN-EDU-013)

**Sprint 1 deferred (compliance engineering needed):**
- `hospital` (VN-HLT-012)
- `university` (VN-EDU-009)
- `diagnostic-lab` (VN-HLT-013)
- `microfinance-bank` (VN-FIN-008) — CBN compliance gate

---

## SPRINT 2 — P2 Candidates (Medium Score, Medium Regulatory Burden)

### Priority Order

| Queue # | Slug | Display Name | Score | Reg. Tier | Proposed VN-ID | Family |
|---|---|---|---|---|---|---|
| 1 | `cosmetics-shop` | Perfume & Cosmetics Shop | 38 | Tier 3 | VN-COM-004 | NF-COM-RET |
| 2 | `vacation-rental` | Vacation Rental Portfolio | 38 | Tier 1 | VN-HSP-003 | NF-HSP-ACM (anchor) |
| 3 | `tutorial-centre` | Tutorial / Group Lesson Centre | 38 | Tier 1 | VN-EDU-012 | NF-EDU-SCH |
| 4 | `thrift-store` | Secondhand / Thrift Store | 39 | Tier 1 | VN-COM-005 | NF-COM-RET |
| 5 | `architecture-firm` | Architecture / Interior Design Firm | 37 | Tier 3 | VN-PRO-010 | NF-PRO-DES (anchor) |
| 6 | `physiotherapy` | Physiotherapy / OT Clinic | 37 | Tier 3 | VN-HLT-014 | NF-HLT-THR (anchor) |
| 7 | `mental-health` | Mental Health / Counselling | 37 | Tier 2–3 | VN-HLT-015 | NF-HLT-THR |
| 8 | `maternity-clinic` | Maternity / Birthing Centre | 37 | Tier 3 | VN-HLT-016 | NF-HLT-MAT (anchor) |
| 9 | `yoga-studio` | Yoga / Pilates / Meditation Studio | 37 | Tier 1 | VN-WEL-001 | NF-WEL-STU (anchor) |
| 10 | `property-management` | Property Management Company | 37 | Tier 1–3 | VN-PRP-002 | NF-PRP-SVC |
| 11 | `jewellery-shop` | Jewellery Shop / Goldsmith | 37 | Tier 1–3 | VN-COM-002 | NF-COM-RET |
| 12 | `baby-shop` | Baby Shop / Maternity Store | 37 | Tier 2–3 | VN-COM-003 | NF-COM-RET |
| 13 | `bar-lounge` | Bar / Lounge / Nightclub | 36 | Tier 3 | VN-HSP-001 | NF-HSP-ENT (anchor) |
| 14 | `insurance-company` | Insurance Underwriter | 36 | Tier 4 | VN-FIN-009 | NF-FIN-REG |
| 15 | `stockbroker` | Stockbroker / Securities Dealer | 36 | Tier 4 | VN-FIN-012 | NF-FIN-REG |
| 16 | `pension-fund` | Pension Fund Administrator | 35 | Tier 4 | VN-FIN-011 | NF-FIN-REG |
| 17 | `resort` | Resort / Leisure Park | 35 | Tier 2 | VN-HSP-002 | NF-HSP-ACM |
| 18 | `student-hostel` | Student Hostel Operator | 35 | Tier 2 | VN-PRP-003 | NF-PRP-SVC |
| 19 | `cac-registration-agent` | CAC Registration Agent | 34 | Tier 2 | VN-PRO-014 | NF-PRO-ADV |
| 20 | `food-court` | Food Court / Multi-Vendor Canteen | 34 | Tier 2 | VN-HSP-004 | NF-FDS (extend) |
| 21 | `traditional-medicine` | Traditional Medicine Practitioner | 34 | Tier 2–3 | VN-WEL-002 | NF-WEL-ALT (anchor) |
| 22 | `credit-union` | Credit Union / SACCO | 34 | Tier 2 | VN-FIN-010 | NF-FIN-COP (anchor) |
| 23 | `microfinance-bank` | Microfinance Bank | 38 | Tier 4 | VN-FIN-008 | NF-FIN-REG (anchor) |
| 24 | `health-food-store` | Supplement / Health Food Store | 33 | Tier 3 | VN-WEL-003 | NF-WEL-ALT |

> **Note:** Items 14–16, 23 (Tier 4 financial regulated institutions) are deferred to a dedicated "regulated finance" sprint requiring CBN/NAICOM/PenCom/SEC verification engineering.

---

## SPRINT 3 — Compliance-Heavy Niches (Blocked on Verification Infrastructure)

These niches have high scores but require significant compliance engineering:

| Queue # | Slug | Display Name | Score | Blocker |
|---|---|---|---|---|
| 1 | `hospital` | Hospital / Secondary Healthcare | 41 | MDCN verification workflow |
| 2 | `university` | University / Polytechnic | 40 | NUC approval verification |
| 3 | `diagnostic-lab` | Medical / Diagnostic Laboratory | 40 | MLSCN license verification |
| 4 | `microfinance-bank` | Microfinance Bank | 38 | CBN MFB verification |
| 5 | `insurance-company` | Insurance Underwriter | 36 | NAICOM verification |
| 6 | `pension-fund` | Pension Fund Administrator | 35 | PenCom verification |
| 7 | `stockbroker` | Stockbroker / Securities Dealer | 36 | SEC/NSE verification |

**Required compliance engineering work (before Sprint 3):**
1. **Health verification module** — MDCN / MLSCN / NMCN lookup or manual document review workflow
2. **Education verification module** — NUC approval number validation
3. **Financial institution verification** — CBN institution code lookup, NAICOM license lookup, PenCom PFA list lookup

These verification modules should be built as shared infrastructure (not per-niche) since they will serve multiple niches.

---

## Milestone Mapping

| Sprint | Niches | Target Milestone | Prerequisite |
|---|---|---|---|
| **Sprint 1** | 11 niches (Group A) | M11 | None — can start now |
| **Sprint 1 deferred** | 4 niches (Group B compliance) | M12 | Health/edu verification module |
| **Sprint 2** | 20 niches (Group B) | M12–M13 | Parallel with deferred Sprint 1 |
| **Sprint 3** | 7 niches (Group C) | M13–M14 | Financial/health verification modules |

---

## Canonical Universe Size Projections

| Milestone | Target Active Niches |
|---|---|
| Current (M10 post-P3) | **157** |
| After Sprint 1 | **168** (+ 11) |
| After Sprint 1 deferred | **172** (+ 4) |
| After Sprint 2 | **192** (+ 20) |
| After Sprint 3 | **199** (+ 7) |
| Post-Gap-Fill research pass | **~230** (additional from gap analysis) |
| **Long-term target** | **250** |

---

## New Category Codes — CSV Update Required

Before the first Sprint 1 niche can be added to `infra/db/seeds/0004_verticals-master.csv`, the following new category codes must be ratified:

| New Category Code | Name | First Niche Using It |
|---|---|---|
| `technology` | Technology Services (distinct from ITC/IT) | `software-agency`, `cybersecurity-firm`, `data-analytics-firm` |
| `wellness` | Wellness & Alternative Health | `yoga-studio`, `traditional-medicine`, `health-food-store` |
| `hospitality` | Hospitality (extended from accommodation) | `bar-lounge`, `resort`, `vacation-rental`, `food-court` |
| `property` | Property Management | `coworking-space`, `property-management`, `student-hostel` |

> **Action required:** Update the category enum in the CSV schema and in the verticals DB table definition before adding these niches.

---

## Template Reuse Analysis

Understanding which new templates can share code from existing templates:

| New Niche | Best Existing Template Base | Reuse % | Delta |
|---|---|---|---|
| `software-agency` | `professional` or `advertising-agency` | ~40% | Portfolio, case studies, tech stack |
| `digital-marketing-agency` | `advertising-agency` | ~60% | Social metrics, platform expertise badges |
| `elearning-platform` | `training-institute` | ~30% | Course catalog, LMS links, cohort mgmt |
| `tech-academy` | `training-institute` | ~55% | Cohort, portfolio, job placement |
| `exam-prep-centre` | `school` (base) | ~50% | Class timetable, enrollment, fees |
| `tutorial-centre` | `school` (base) | ~60% | Timetable, teacher list, enrollment |
| `coworking-space` | `tech-hub` | ~35% | Amenities, membership, events |
| `electronics-store` | `supermarket` (base) | ~45% | Product catalog, pricing, brands |
| `cosmetics-shop` | `beauty-salon` + `supermarket` | ~40% | NAFDAC tags, product grid, loyalty |
| `baby-shop` | `supermarket` (base) | ~50% | Age-stage catalog, NAFDAC, subscriptions |
| `thrift-store` | `fashion-brand` | ~35% | Product listing, condition grade, drops |
| `yoga-studio` | `gym` | ~55% | Class schedule, membership, instructor |
| `vacation-rental` | `hotel` | ~45% | Room catalog, calendar, booking |
| `bar-lounge` | `restaurant` | ~40% | Menu, opening hours, events, reservations |
| `property-management` | `real-estate-agency` | ~45% | Property listings, tenant, rent tracking |
| `student-hostel` | `hotel` | ~35% | Room inventory, calendar, caution deposit |
| `recruitment-agency` | `professional` | ~30% | Job board, candidate portal, placements |
| `management-consulting` | `professional` + `law-firm` | ~45% | Services, credentials, case studies |
| `architecture-firm` | `professional` + `construction` | ~40% | Portfolio renders, ARCON, brief form |
| `cybersecurity-firm` | `it-support` | ~25% | Service catalog, certs, compliance frameworks |
| `data-analytics-firm` | `advertising-agency` | ~30% | Case studies, tool stack, dashboard demos |
| `physiotherapy` | `clinic` | ~40% | Appointment, treatment plan, patient records |
| `mental-health` | `clinic` | ~35% | Private booking, therapist profiles, teletherapy |
| `maternity-clinic` | `clinic` | ~40% | Appointment, patient records, scan booking |
| `hospital` | `clinic` | ~25% | Wards, surgical, inpatient — very distinct |
| `diagnostic-lab` | `clinic` | ~20% | Test catalog, sample tracking — very distinct |
| `microfinance-bank` | `savings-group` | ~30% | Loan products, CBN compliance, passbooks |

---

## Governance Checklist — Per Niche (Before Activation)

Each new niche must complete this checklist before it can be moved from "candidate" to "planned":

- [ ] Canonical slug confirmed (kebab-case, unique, not an existing slug or alias)
- [ ] VN-ID assigned (sequential within category code)
- [ ] Entity type confirmed (individual / organization / place)
- [ ] Priority tier confirmed (P1 / P2 / P3)
- [ ] Niche family assignment confirmed (or standalone designation)
- [ ] Regulatory gate documented in `05-regulatory-landscape-new.md`
- [ ] KYC tier documented
- [ ] Template reuse % documented (and base template identified)
- [ ] Added to `infra/db/seeds/0004_verticals-master.csv` with `status=planned`
- [ ] Entry added to `docs/governance/canonical-niche-registry.md`
- [ ] Family entry updated in `docs/governance/niche-family-variant-register.md`
- [ ] Entry added to `docs/governance/vertical-niche-master-map.md`
- [ ] Discovery tags defined
- [ ] Nigeria-first content notes written
- [ ] Implementation prompt created in `docs/templates/research/`

---

## Recommended Immediate Next Actions

1. **Ratify the 4 new category codes** (technology, wellness, hospitality, property) — update CSV schema
2. **Approve Sprint 1 first batch** (11 niches) — submit to founder review
3. **Add Sprint 1 niches to CSV** with `status=planned` and confirmed VN-IDs
4. **Update canonical governance docs** (canonical-niche-registry.md, niche-family-variant-register.md, vertical-niche-master-map.md) for all Sprint 1 niches
5. **Create implementation briefs** in `docs/templates/research/` for each Sprint 1 niche (following the existing brief format from the P2/P3 implementation sprint)
6. **Begin compliance engineering scoping** for MDCN / NUC / CBN verification modules (Sprint 3 enabler)
7. **Define Milestone M11** to encompass Sprint 1 template implementation

---

*Produced: 2026-04-26 — Deep Research & Expansion Design Phase*
*This queue becomes active only upon founder review and approval of Sprint 1 niche candidates.*
