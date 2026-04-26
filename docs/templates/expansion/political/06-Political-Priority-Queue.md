# WebWaka OS — Political Role-Specific Expansion Priority Queue

**Status:** RESEARCH — Not yet active sprint
**Date:** 2026-04-26
**Parent:** `docs/templates/expansion/political/00-Political-Master-Blueprint.md`
**Scope:** Ordered, prioritized activation queue for political role-specific templates

---

## Preamble

This document defines the activation order for the political template expansion sprint. It combines:
- Candidate scores from `02-Political-Candidate-Registry.md`
- Regulatory complexity from `05-Political-Regulatory.md`
- Market intelligence from `04-Political-Market-Intelligence.md`
- Family dependencies from `03-Political-Family-Structure.md`

**Ordering formula: Score × (10 − Regulatory Complexity) × Evergreen Factor**

Where:
- **Regulatory Complexity** = 0 (Tier 1) to 4 (Tier 4) — mapped linearly onto 0–4 scale
- **Evergreen Factor** = 1.0 (election-cycle-dependent) to 1.5 (evergreen demand regardless of cycle)

A niche may only be formally activated (moved from Candidate to Planned status) after:
1. This queue is reviewed and approved by the founding team
2. The niche is added to `infra/db/seeds/0004_verticals-master.csv` with `status=planned`
3. A VN-ID is confirmed and added to `docs/governance/canonical-niche-registry.md`
4. The niche family is formally registered in `docs/governance/niche-family-variant-register.md`
5. Collision audit verdict is CLEAR or DIFFERENTIATE (see `07-Political-Collision-Analysis.md`)

---

## SPRINT 1 — P1 Candidates: Governor, Senator, House of Reps Member

These three candidates score ≥40 and have the highest commercial value. All require Tier 3 KYC for incumbent mode but are accessible at Tier 2 (document upload) for initial launch.

**Critical build note:** `governor` is the **NF-POL-ELC family anchor**. It must be built first. `senator` and `house-of-reps-member` are variants that inherit from the governor template pattern. Attempting to build variants before the anchor creates structural debt.

### Sprint 1 Priority Order

| Queue # | Slug | Display Name | Score | Reg. Tier | VN-ID | Family Role | Evergreen? |
|---|---|---|---|---|---|---|---|
| **1** | `governor` | State Governor | 42 | Tier 3 | VN-POL-013 | NF-POL-ELC **anchor** | Moderate (4-year cycle + off-cycle) |
| **2** | `senator` | Senator | 40 | Tier 3 | VN-POL-016 | NF-POL-ELC variant | Moderate |
| **3** | `house-of-reps-member` | House of Reps Member | 40 | Tier 3 | VN-POL-015 | NF-POL-ELC variant | Moderate |

**Sprint 1 total: 3 templates**

> **Compliance note:** All three Sprint 1 templates can launch in Tier 2 mode (self-declared certificate of return upload) for incumbent page access. Full Tier 3 verification (INEC database cross-check) can be gated behind a premium tier or added in a subsequent engineering sprint. This allows rapid launch without full regulatory infrastructure.

### Sprint 1 Build Sequence

```
[1] Build governor template (NF-POL-ELC anchor)
      ↓ Establish: 4-page mkPage / mode-switch / INEC trust-signals / geography / party badge
[2] Derive senator template from governor base
      → Replace: state budget → Senate committee/UDSS; state map → senatorial district; commissioner cabinet → NASS committee
[3] Derive house-of-reps-member template from governor base
      → Replace: state mandate → federal constituency; Senate → Reps chamber; UDSS → CDF tracker
```

### Sprint 1 Acceptance Criteria
- `governor` renders correctly in all 3 modes: `campaign`, `incumbent`, `post_office`
- Mode switch is driven by `ctx.data.mode` field
- INEC certificate of return reference displayed in incumbent + post_office modes
- State-wide project map renders with ward-level delivery rows
- RMAFC allocation display renders with current month's data (static fallback acceptable for v1)
- All 3 templates: `tsc --noEmit` passes; 75/75 existing tests still pass; new template tests added

---

## SPRINT 2 — High-Priority P2 Candidates (Appointed Offices + State Level)

Sprint 2 activates the NF-POL-APT family anchor (`state-commissioner`) and the two highest-scoring P2 elected office variants (`lga-chairman`, `house-of-assembly-member`), plus the federal minister.

### Sprint 2 Priority Order

| Queue # | Slug | Display Name | Score | Reg. Tier | VN-ID | Family Role |
|---|---|---|---|---|---|---|
| **4** | `state-commissioner` | State Commissioner | 37 | Tier 2 | VN-POL-018 | NF-POL-APT **anchor** |
| **5** | `federal-minister` | Federal Minister | 39 | Tier 3 | VN-POL-019 | NF-POL-APT variant |
| **6** | `lga-chairman` | LGA Chairman | 39 | Tier 2–3 | VN-POL-009 | NF-POL-ELC variant |
| **7** | `house-of-assembly-member` | House of Assembly Member | 39 | Tier 2–3 | VN-POL-011 | NF-POL-ELC variant |

**Sprint 2 total: 4 templates**

> **NF-POL-APT note:** `state-commissioner` is built first as the appointed-officials family anchor. `federal-minister` inherits from it — federal scale-up of the same portfolio pattern. `political-appointee` (general) follows in Sprint 3 as a further simplification variant.

> **Evergreen advantage of `lga-chairman`:** Unlike the 4-year federal election cycle, LGA elections occur continuously across Nigeria's 36 states (each SIEC runs its own calendar). This means the `lga-chairman` template has evergreen demand — not tied to a single electoral moment.

---

## SPRINT 3 — P2 Remaining (Party Structure + Lower Elected Tiers)

Sprint 3 activates the NF-POL-PTY family anchor (`party-chapter-officer`), remaining elected variants, and the general political appointee template.

### Sprint 3 Priority Order

| Queue # | Slug | Display Name | Score | Reg. Tier | VN-ID | Family Role |
|---|---|---|---|---|---|---|
| **8** | `presidential-candidate` | Presidential Candidate / President | 37 | Tier 2–4 | VN-POL-017 | NF-POL-ELC standalone |
| **9** | `political-appointee` | Political Appointee (General) | 37 | Tier 2 | VN-POL-020 | NF-POL-APT variant |
| **10** | `ward-councillor` | Ward Councillor | 37 | Tier 1–2 | VN-POL-008 | NF-POL-ELC variant |
| **11** | `party-chapter-officer` | Party Chapter Officer (Ward/LGA) | 35 | Tier 1 | VN-POL-022 | NF-POL-PTY **anchor** |
| **12** | `party-state-officer` | Party State Officer | 36 | Tier 1 | VN-POL-023 | NF-POL-PTY variant |
| **13** | `deputy-governor` | Deputy Governor | 36 | Tier 3 | VN-POL-014 | NF-POL-ELC variant |

**Sprint 3 total: 6 templates**

> **Presidential candidate special handling:** The `presidential-candidate` template must be graduated through a stricter review process due to campaign finance compliance (Electoral Act 2022 campaign finance caps apply). The template in campaign mode must not display or process donations without an explicit INEC campaign account reference. Launch in `post_office` mode first (presidential legacy page); then `campaign` mode with INEC reference gate.

---

## SPRINT 4 — P2 Trailing (Lower Priority / Lower Volume)

Sprint 4 activates the remaining four P2 candidates — all variants of existing Sprint 1–3 anchors.

### Sprint 4 Priority Order

| Queue # | Slug | Display Name | Score | VN-ID | Family Role |
|---|---|---|---|---|---|
| **14** | `assembly-speaker` | Speaker of State House of Assembly | 34 | VN-POL-012 | NF-POL-ELC standalone |
| **15** | `lga-vice-chairman` | LGA Vice Chairman | 33 | VN-POL-010 | NF-POL-ELC variant |
| **16** | `supervisory-councillor` | Supervisory Councillor | 31 | VN-POL-021 | NF-POL-APT variant |

**Sprint 4 total: 3 templates**

---

## Full Queue Summary

| Queue # | Slug | Score | Priority | Sprint |
|---|---|---|---|---|
| 1 | `governor` | 42 | P1 | Sprint 1 |
| 2 | `senator` | 40 | P1 | Sprint 1 |
| 3 | `house-of-reps-member` | 40 | P1 | Sprint 1 |
| 4 | `state-commissioner` | 37 | P2 | Sprint 2 |
| 5 | `federal-minister` | 39 | P2 | Sprint 2 |
| 6 | `lga-chairman` | 39 | P2 | Sprint 2 |
| 7 | `house-of-assembly-member` | 39 | P2 | Sprint 2 |
| 8 | `presidential-candidate` | 37 | P2 | Sprint 3 |
| 9 | `political-appointee` | 37 | P2 | Sprint 3 |
| 10 | `ward-councillor` | 37 | P2 | Sprint 3 |
| 11 | `party-chapter-officer` | 35 | P2 | Sprint 3 |
| 12 | `party-state-officer` | 36 | P2 | Sprint 3 |
| 13 | `deputy-governor` | 36 | P2 | Sprint 3 |
| 14 | `assembly-speaker` | 34 | P2 | Sprint 4 |
| 15 | `lga-vice-chairman` | 33 | P2 | Sprint 4 |
| 16 | `supervisory-councillor` | 31 | P2 | Sprint 4 |

**Total new political templates across 4 sprints: 16**

---

## Milestone Mapping

| Milestone | Sprint | Templates | Platform Universe Size After |
|---|---|---|---|
| M8b (current) | Pre-sprint | 7 existing political | 192 total |
| M8c | Sprint 1 | +3 (governor, senator, reps) | 195 total |
| M8d | Sprint 2 | +4 (commissioner, minister, LGA chairman, HASM) | 199 total |
| M9 | Sprint 3 | +6 (presidential, appointee, ward councillor, party chapter, party state, deputy gov) | 205 total |
| M10 | Sprint 4 | +3 (assembly speaker, LGA vice chair, supervisory councillor) | 208 total |

**Post-Sprint 4 universe: 208 active templates** (up from 192 current)

---

## Pre-Activation Checklist (Each Niche)

Before any niche from this queue may be activated:

- [ ] Collision audit verdict confirmed as CLEAR or DIFFERENTIATE in `07-Political-Collision-Analysis.md`
- [ ] CSV row added to `infra/db/seeds/0004_verticals-master.csv` with `status=planned`
- [ ] VN-ID confirmed and added to `docs/governance/canonical-niche-registry.md`
- [ ] Niche family confirmed and registered in `docs/governance/niche-family-variant-register.md`
- [ ] Regulatory gate documented and KYC tier assigned (see `05-Political-Regulatory.md`)
- [ ] Template file written to `apps/brand-runtime/src/templates/niches/<niche>/<file>.ts`
- [ ] Import and map entry added to `apps/brand-runtime/src/lib/template-resolver.ts`
- [ ] `tsc --noEmit` passes with 0 errors
- [ ] `vitest run` passes all existing tests
- [ ] New template-specific tests added to `apps/brand-runtime/src/brand-runtime.test.ts`

---

*End of Priority Queue — Produced 2026-04-26*
