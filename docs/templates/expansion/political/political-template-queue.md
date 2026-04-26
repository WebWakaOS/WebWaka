# Political Role-Specific Template Queue

**Document type:** Agent work queue — single source of truth for what political template to build next  
**Status:** ACTIVE — updated by agents after every completed political niche  
**Date last updated:** 2026-04-26  
**Authority:** `docs/templates/expansion/political/00-Political-Master-Blueprint.md`

> **One agent, one niche at a time.**  
> Before claiming a political niche, read this queue. Take the CURRENT niche at the top.  
> After completing a niche, advance CURRENT to the next niche in the list.  
> Never skip ahead — the queue order is the build priority order.  
> **Family rule:** A variant niche may only be claimed after its family anchor is `IMPLEMENTED`.  
> Governor must be built before senator or deputy-governor.  
> State-commissioner must be built before federal-minister or supervisory-councillor.  
> Party-chapter-officer must be built before party-state-officer.

---

## ⟶ CURRENT (Build This Next)

```
Niche ID:       POL-governor-official-site
Vertical:       governor
Vertical Name:  State Governor
Niche Name:     State Governor Official Site
VN-ID:          VN-POL-013 (proposed — confirm in canonical-niche-registry.md before claiming)
Status:         READY_FOR_RESEARCH
Owner:          —
Sprint:         Sprint 1
Template Slug:  governor-official-site
Family:         NF-POL-ELC (ANCHOR — build first; senator and house-of-reps-member are variants)
Source File:    apps/brand-runtime/src/templates/niches/governor/official-site.ts (to create)
Score:          42/50 (P1)

Rationale for priority:
  - Highest-scoring political niche (42/50) — highest commercial value in Nigerian politics
  - 36 governors + ~200–300 active campaign accounts across election cycles
  - Evergreen demand — Nigerian gubernatorial campaigns are year-round (staggered INEC calendar)
  - NF-POL-ELC FAMILY ANCHOR — governor establishes the page structure, mode-switch logic,
    INEC trust signal pattern, and geographic widget that all ELC variants inherit
  - Must be IMPLEMENTED before senator, house-of-reps-member, lga-chairman,
    house-of-assembly-member, deputy-governor, ward-councillor can be claimed

Pre-work checklist (mandatory before claiming):
  [ ] Read political-generic-implementation-prompt.md (mandatory)
  [ ] Confirm collision audit: DIFFERENTIATE verdict in 07-Political-Collision-Analysis.md
  [ ] Confirm CSV row exists in infra/db/seeds/0004_verticals-master.csv (verticalSlug: governor)
  [ ] Confirm VN-POL-013 is in docs/governance/canonical-niche-registry.md
  [ ] Confirm NF-POL-ELC family is in docs/governance/niche-family-variant-register.md
  [ ] Confirm status is READY_FOR_RESEARCH in political-niche-registry.json
  [ ] Claim niche (set status to RESEARCH_IN_PROGRESS + set owner)
  [ ] Begin 5-thread parallel research (Threads A–E — political compliance is mandatory)

Mode split reminder:
  - campaign: state-wide manifesto, running-mate profile, 6-zone rally schedule, endorsements
  - incumbent: RMAFC allocation dashboard, cabinet grid, state project map, press briefing archive
  - post_office: legacy archive, foundation launch, next office platform
```

---

## Queue (Ordered Build Sequence)

### Sprint 1 — P1 Candidates: NF-POL-ELC Anchor + Federal Legislative
Priority order: governor FIRST (family anchor), then senator and house-of-reps-member (variants).  
All three score ≥40. All must reach IMPLEMENTED before Sprint 2 LGA/state variants are released.

| Priority | Niche ID | VN-ID | Status | Score | Family Role | Notes |
|----------|----------|-------|--------|-------|-------------|-------|
| 1 | `POL-governor-official-site` | VN-POL-013 | READY_FOR_RESEARCH | 42 | NF-POL-ELC **anchor** | Build first — establishes family pattern |
| 2 | `POL-senator-official-site` | VN-POL-016 | READY_FOR_RESEARCH | 40 | NF-POL-ELC variant | Blocked until governor IMPLEMENTED |
| 3 | `POL-house-of-reps-member-official-site` | VN-POL-015 | READY_FOR_RESEARCH | 40 | NF-POL-ELC variant | Blocked until governor IMPLEMENTED |

### Sprint 2 — P2 High Priority: NF-POL-APT Anchor + State/LGA Elected
Priority order: state-commissioner FIRST (NF-POL-APT anchor), then federal-minister, lga-chairman, house-of-assembly-member.

| Priority | Niche ID | VN-ID | Status | Score | Family Role | Notes |
|----------|----------|-------|--------|-------|-------------|-------|
| 4 | `POL-state-commissioner-official-site` | VN-POL-018 | READY_FOR_RESEARCH | 37 | NF-POL-APT **anchor** | Build before federal-minister + supervisory-councillor |
| 5 | `POL-federal-minister-official-site` | VN-POL-019 | READY_FOR_RESEARCH | 39 | NF-POL-APT variant | Blocked until state-commissioner IMPLEMENTED |
| 6 | `POL-lga-chairman-official-site` | VN-POL-009 | READY_FOR_RESEARCH | 39 | NF-POL-ELC variant | Blocked until governor IMPLEMENTED; evergreen demand |
| 7 | `POL-house-of-assembly-member-official-site` | VN-POL-011 | READY_FOR_RESEARCH | 39 | NF-POL-ELC variant | Blocked until governor IMPLEMENTED |

### Sprint 3 — P2 Remaining: Presidential + Party Anchor + Further Variants
Priority order: presidential-candidate first (standalone — no anchor dependency), then political-appointee, ward-councillor, party-chapter-officer (NF-POL-PTY anchor), party-state-officer, deputy-governor.

| Priority | Niche ID | VN-ID | Status | Score | Family Role | Notes |
|----------|----------|-------|--------|-------|-------------|-------|
| 8 | `POL-presidential-candidate-official-site` | VN-POL-017 | READY_FOR_RESEARCH | 37 | NF-POL-ELC standalone | Campaign finance gate applies (Electoral Act 2022) |
| 9 | `POL-political-appointee-official-site` | VN-POL-020 | READY_FOR_RESEARCH | 37 | NF-POL-APT variant | Blocked until state-commissioner IMPLEMENTED |
| 10 | `POL-ward-councillor-official-site` | VN-POL-008 | READY_FOR_RESEARCH | 37 | NF-POL-ELC variant | Blocked until governor IMPLEMENTED; SIEC-regulated |
| 11 | `POL-party-chapter-officer-official-site` | VN-POL-022 | READY_FOR_RESEARCH | 35 | NF-POL-PTY **anchor** | Build before party-state-officer |
| 12 | `POL-party-state-officer-official-site` | VN-POL-023 | READY_FOR_RESEARCH | 36 | NF-POL-PTY variant | Blocked until party-chapter-officer IMPLEMENTED |
| 13 | `POL-deputy-governor-official-site` | VN-POL-014 | READY_FOR_RESEARCH | 36 | NF-POL-ELC variant | Blocked until governor IMPLEMENTED |

### Sprint 4 — P2 Trailing: Lower Volume Variants
All three are variants or standalones with lower market density. Build after all Sprint 1–3 anchors are IMPLEMENTED.

| Priority | Niche ID | VN-ID | Status | Score | Family Role | Notes |
|----------|----------|-------|--------|-------|-------------|-------|
| 14 | `POL-assembly-speaker-official-site` | VN-POL-012 | READY_FOR_RESEARCH | 34 | NF-POL-ELC standalone | Presiding officer mode required |
| 15 | `POL-lga-vice-chairman-official-site` | VN-POL-010 | READY_FOR_RESEARCH | 33 | NF-POL-ELC variant | Blocked until lga-chairman IMPLEMENTED |
| 16 | `POL-supervisory-councillor-official-site` | VN-POL-021 | READY_FOR_RESEARCH | 31 | NF-POL-APT variant | Blocked until state-commissioner IMPLEMENTED |

---

## Completed Niches

| Completed Date | Niche ID | Niche Name | SHIPPED |
|----------------|----------|------------|---------|
| — | — | — | — |

*No political role niches have been implemented yet. This table will be updated as niches complete.*

---

## Family Dependency Map

This map is mandatory reading before claiming any variant niche.

```
NF-POL-ELC (Elected Officials)
  ANCHOR: POL-governor-official-site [VN-POL-013]
    ├── variant: POL-senator-official-site [VN-POL-016]
    ├── variant: POL-house-of-reps-member-official-site [VN-POL-015]
    ├── variant: POL-lga-chairman-official-site [VN-POL-009]
    ├── variant: POL-house-of-assembly-member-official-site [VN-POL-011]
    ├── variant: POL-deputy-governor-official-site [VN-POL-014]
    ├── variant: POL-ward-councillor-official-site [VN-POL-008]
    │     └── variant: POL-lga-vice-chairman-official-site [VN-POL-010]
    ├── standalone: POL-presidential-candidate-official-site [VN-POL-017]
    └── standalone: POL-assembly-speaker-official-site [VN-POL-012]

NF-POL-APT (Appointed Officials)
  ANCHOR: POL-state-commissioner-official-site [VN-POL-018]
    ├── variant: POL-federal-minister-official-site [VN-POL-019]
    ├── variant: POL-political-appointee-official-site [VN-POL-020]
    └── variant: POL-supervisory-councillor-official-site [VN-POL-021]

NF-POL-PTY (Party Structure)
  ANCHOR: POL-party-chapter-officer-official-site [VN-POL-022]
    └── variant: POL-party-state-officer-official-site [VN-POL-023]
```

**Rule:** An agent MUST NOT claim a variant niche until the anchor's `templateStatus` = `IMPLEMENTED` or `SHIPPED`.  
Claiming a variant before its anchor is IMPLEMENTED is a protocol violation.

---

## Pre-Activation Checklist (Apply Per Niche Before Claiming)

Before transitioning any niche from `READY_FOR_RESEARCH` to `RESEARCH_IN_PROGRESS`:

- [ ] Collision audit verdict confirmed CLEAR or DIFFERENTIATE in `07-Political-Collision-Analysis.md`
- [ ] CSV row exists in `infra/db/seeds/0004_verticals-master.csv` with `status=planned`
- [ ] VN-ID confirmed in `docs/governance/canonical-niche-registry.md`
- [ ] NF-POL family confirmed in `docs/governance/niche-family-variant-register.md`
- [ ] If family variant: family anchor `templateStatus` is `IMPLEMENTED` or `SHIPPED`
- [ ] KYC tier gate documented in `05-Political-Regulatory.md` for this niche

---

## Queue Rules

1. **Always work from the CURRENT niche first.** Never self-select a different niche without a documented reason.
2. **Only one niche may be IMPLEMENTATION_IN_PROGRESS at a time** (per agent session).
3. **After completing a niche:** move it to the Completed table, advance CURRENT to the next unclaimed READY_FOR_RESEARCH niche whose family dependency is satisfied.
4. **Variant niches** may not be claimed until their family anchor is `IMPLEMENTED`. Check `familyDependency` in `political-niche-registry.json`.
5. **Queue order may be changed by a human platform owner only.** Agents do not reorder the queue.
6. **If the CURRENT niche is already IMPLEMENTATION_IN_PROGRESS by another agent:** take the next available niche whose family dependency is satisfied.
7. **Presidential candidate special rule:** Launch `post_office` mode first. Only enable `campaign` mode with INEC Form CF001 reference gate and no donation processing without an INEC campaign account reference.

---

## Milestone Tracking

| Milestone | Sprint | Templates Added | Cumulative Universe |
|-----------|--------|-----------------|---------------------|
| M8b (baseline) | Pre-sprint | 0 | 192 total |
| M8c | Sprint 1 | +3 (governor, senator, reps) | 195 total |
| M8d | Sprint 2 | +4 (commissioner, minister, LGA chair, HASM) | 199 total |
| M9 | Sprint 3 | +6 (presidential, appointee, ward councillor, party chapter, party state, deputy gov) | 205 total |
| M10 | Sprint 4 | +3 (assembly speaker, LGA vice chair, supervisory councillor) | 208 total |

---

*Last updated: 2026-04-26 — Queue initialised. 16 political niches at READY_FOR_RESEARCH. CURRENT = POL-governor-official-site (Sprint 1, family anchor). No niches yet IMPLEMENTED.*
