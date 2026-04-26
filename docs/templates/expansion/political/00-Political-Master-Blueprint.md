# WebWaka OS — Political Role-Specific Template Expansion Blueprint

**Status:** AUTHORITATIVE DESIGN DOCUMENT — Research Phase
**Date:** 2026-04-26
**Scope:** Deep research and expansion design for Nigeria's political hierarchy — role-specific template granularity beyond the existing 7-niche politics universe
**Author:** System Research (Automated deep-audit synthesis)
**Governance basis:** `docs/governance/canonical-niche-registry.md`, `docs/governance/vertical-niche-master-map.md`, `docs/governance/niche-family-variant-register.md`
**Precondition:** Template universe confirmed at 192 built-in templates (6 expansion groups shipped 2026-04-26)
**Do NOT implement from this document** — implementation requires separate sprint activation and collision audit clearance

---

## Executive Summary

The existing WebWaka OS politics category contains **7 niches** covering the political space at a generic level. The anchor entry `politician` (VN-POL-001) deliberately bundles seven distinct offices — from ward councillor to president — into a single template with a note: *"7 offices Councilor→President; politics tables ready."*

This was appropriate for Pillar 2 MVP but is now a **strategic gap**. Nigerian politicians operate under radically different mandates, constituency obligations, campaign profiles, and trust-signal requirements depending on their office. A senator's template should look nothing like a ward councillor's. A governor's incumbent page requires budget transparency tools a polling unit rep will never need. A presidential campaign demands a national rally-map and running-mate spotlight that would be absurd on a party chapter officer's page.

**This blueprint proposes 16 new role-specific political templates** organized into three families and four standalones, covering the full Nigerian political hierarchy from ward council to Aso Rock, including both elected offices and appointed positions, with first-class support for the **Candidate vs. Incumbent vs. Post-Office** lifecycle split that defines Nigerian political careers.

**Key findings:**

1. **16 distinct role-specific candidate niches** proposed (3 P1-scored, 13 P2-scored)
2. **3 new niche families** (NF-POL-ELC, NF-POL-APT, NF-POL-PTY) proposed for formal governance registration
3. **Candidate / Incumbent / Post-Office mode** must be a first-class template concept, not a workaround
4. **Geography tier** (Ward → LGA → State → Federal) is the single most important differentiator across all political roles
5. **0 REJECT verdicts** in collision analysis — all 16 candidates are viable despite the 7 existing political entries

---

## Structure of This Blueprint

| Document | File | Contents |
|---|---|---|
| **Master Blueprint** (this file) | `00-Political-Master-Blueprint.md` | Executive summary, methodology, strategic decisions |
| **Gap Analysis** | `01-Political-Gap-Analysis.md` | Systematic identification of what the 7-niche politics universe is missing |
| **Candidate Registry** | `02-Political-Candidate-Registry.md` | 16 proposed new political niches with scoring and governance metadata |
| **Family Structure** | `03-Political-Family-Structure.md` | 3 new NF-POL family structures with anchor/variant relationships |
| **Market Intelligence** | `04-Political-Market-Intelligence.md` | Nigeria political market research — seat counts, election cycles, digital readiness |
| **Regulatory Landscape** | `05-Political-Regulatory.md` | INEC, SIEC, and compliance gates per role |
| **Priority Queue** | `06-Political-Priority-Queue.md` | Ordered queue for political template activation |
| **Collision Analysis** | `07-Political-Collision-Analysis.md` | QA gate: all 16 candidates cleared against 192 templates + 198-row CSV |

---

## Current Politics Universe Baseline (as of 2026-04-26)

| VN-ID (est.) | Slug | Display Name | Entity Type | Notes |
|---|---|---|---|---|
| VN-POL-001 | `politician` | Individual Politician | individual | Generic; bundled 7 offices |
| VN-POL-002 | `political-party` | Political Party | organization | National party org |
| VN-POL-003 | `campaign-office` | Political Campaign Office | organization | Office ops; generic |
| VN-POL-004 | `lga-office` | LGA Council / Ward Office | place | Place entity; not individual |
| VN-POL-005 | `polling-unit-rep` | Polling Unit Representative | individual | Voter mobilizer; lowest tier |
| VN-POL-006 | `constituency-office` | Constituency Development Office | place | Place entity; not individual |
| VN-POL-007 | `ward-rep` | Ward Representative | individual | Partial overlap with councillor |

**Observed deficiencies:**
- Zero templates differentiate between the 7 tiers of elected office (ward → federal)
- Zero Candidate vs. Incumbent variant logic in any existing template
- No template for any appointed political office (commissioner, minister, special adviser)
- No template for party sub-national structure (ward/LGA/state chapter officers)
- `lga-office` and `constituency-office` are place entities — they do not serve the individual officeholder
- `politician` and `ward-rep` partially overlap (ward-rep was added as a standalone variant but describes the same base case)

---

## Nigeria's Political Hierarchy — Full Reference Map

### Tier 1: Ward Level (most granular)
| Role | Appointing Authority | Seat Count (est.) | Term |
|---|---|---|---|
| Ward Councillor | SIEC direct election | ~8,809 | 3 years |
| Polling Unit Agent | Party / candidate | ~176,000 | Per election |
| Ward Party Chairman | Ward congress | ~158,562 (18 parties × 8,809) | 4 years |

### Tier 2: LGA Level
| Role | Appointing Authority | Seat Count (est.) | Term |
|---|---|---|---|
| LGA Chairman | SIEC direct election | 774 | 3 years |
| LGA Vice Chairman | SIEC direct election (joint ticket) | 774 | 3 years |
| Supervisory Councillor | LGA Chairman (appointed) | ~3,870 | At-will |
| LGA Party Chairman | LGA congress | ~13,932 (18 parties × 774) | 4 years |

### Tier 3: State Level
| Role | Appointing Authority | Seat Count (est.) | Term |
|---|---|---|---|
| House of Assembly Member (HASM) | INEC direct election | 993 (36 states) | 4 years |
| Speaker of State House of Assembly | HASM peers | 36 | HASM term |
| Governor | INEC direct election | 36 | 4 years (max 2 terms) |
| Deputy Governor | Running mate / INEC | 36 | 4 years |
| State Commissioner | Governor (appointed) | ~720 (avg 20/state) | At-will |
| Special Adviser to Governor | Governor (appointed) | ~1,080 (avg 30/state) | At-will |
| State Party Chairman | State congress | ~648 (18 parties × 36) | 4 years |

### Tier 4: Federal Level
| Role | Appointing Authority | Seat Count (est.) | Term |
|---|---|---|---|
| House of Representatives Member | INEC direct election | 360 | 4 years |
| Senator | INEC direct election | 109 (3/state + FCT) | 4 years |
| Speaker of House of Reps | Reps peers | 1 | Reps term |
| Senate President | Senate peers | 1 | Senate term |
| Federal Minister | President (appointed, Senate screened) | ~48 | At-will |
| Special Adviser to President | President (appointed) | ~150 | At-will |
| President / Vice President | INEC direct election | 1+1 | 4 years (max 2 terms) |

**Total active political officeholders in Nigeria at any given time: ~20,000+**
**Total during election season (candidates + officeholders): ~200,000+**

---

## Methodology

### Phase 1 — Existing Universe Audit
- Enumerated all 7 existing political niches against their CSV entries, template implementations, and entity type assignments
- Identified gaps by mapping the Nigeria Political Hierarchy against current template coverage
- Documented the `politician` bundled-office problem — one template trying to serve Councilor through President simultaneously

### Phase 2 — Role Decomposition Framework
Applied four lenses to identify necessary role splits:

1. **Mandate lens** — What is the officeholder legally and constitutionally mandated to do? (Legislative vs. Executive vs. Party)
2. **Constituency lens** — What geographic unit does the officeholder serve? (Ward → LGA → State → Federal → National)
3. **Lifecycle lens** — What phase are they in? (Campaign → Incumbent → Post-Office → Exile)
4. **Trust lens** — What proof-of-legitimacy signals does their audience (voters/constituents) require?

### Phase 3 — Candidate Scoring
Same 5-dimension scoring rubric as audited expansion blueprint:

| Dimension | Description |
|---|---|
| **Nigeria Market Density (NMD)** | Volume of this officeholder type in Nigeria |
| **Digital Readiness (DR)** | How ready this class of politician is to use digital tools |
| **Template Differentiation (TD)** | How distinct template needs are from existing `politician` / `ward-rep` |
| **Regulatory Simplicity (RS)** | Inverse of complexity — 10=simple, 0=very complex |
| **Revenue Potential (RP)** | Estimated SaaS subscription per tenant × seat count |

**Priority thresholds:** ≥40 → P1 | 30–39 → P2 | 20–29 → P3 | <20 → Defer

### Phase 4 — Candidate / Incumbent / Post-Office Split Design
Each elected-office template must render meaningfully in three modes, controlled by a `data.mode` field:
- `campaign` — public-facing campaign page; volunteer signup; donation; manifesto; rally calendar
- `incumbent` — constituency service; project tracker; legislative record; office contacts; budget disclosure
- `post_office` — legacy page; memoir pivot; consultancy/NGO; library/archive

### Phase 5 — Collision Audit
All 16 candidates cleared against 192-template universe + 198-row CSV. Results in `07-Political-Collision-Analysis.md`.

---

## Strategic Decisions

### Decision 1: Break the `politician` bundle
The `politician` (VN-POL-001) entry must be preserved as-is for backward compatibility but demoted to **legacy/fallback** status. All new political signers should be onboarded to their role-specific niche. The `politician` template should display a migration prompt guiding existing tenants to the appropriate role-specific niche.

### Decision 2: Geography tier is primary navigation axis
Every political template must include the geography tier as a first-class structural element:
- **Ward** templates: ward name, ward code, LGA parent, state parent
- **LGA** templates: LGA name, LGEA code, state parent, 774 LGA reference
- **State** templates: state name, INEC state code, zonal reference
- **Federal** templates: federal constituency / senatorial district, geopolitical zone, national

### Decision 3: Candidate vs. Incumbent is a mode switch, not a new slug
Rather than creating `governor-candidate` and `governor-incumbent` as separate niches, the mode split is handled within each template via `ctx.data.mode`. This keeps the niche universe clean while enabling radically different page content. Templates detect `mode` and branch accordingly.

### Decision 4: Party sub-national structure
The `political-party` niche (VN-POL-002) covers national party organizations. Sub-national party structures (ward, LGA, state chapters) are under-served. Two new niches proposed:
- `party-chapter-officer` — covers ward and LGA level individual party officers
- `party-state-officer` — covers state-level party executive committee members

### Decision 5: Appointed offices are a distinct template family
Commissioner, minister, special adviser, and general political appointee share a common pattern (portfolio-based; accountability without electoral mandate; appointment-at-will; ministerial brief) but are fundamentally different from elected officials. They form a separate family `NF-POL-APT`.

### Decision 6: VN-ID numbering
New political niches will use VN-POL-008 through VN-POL-023:
- VN-POL-008 through VN-POL-014: Elected office roles (ward → president)
- VN-POL-015 through VN-POL-018: Legislative leadership and upper chamber
- VN-POL-019 through VN-POL-021: Appointed offices
- VN-POL-022 through VN-POL-023: Party sub-national structure

---

## Top 3 Priority Roles for Immediate Activation

### 1. Governor (`governor` — VN-POL-013) — Score: 42/50 — P1
**Why urgent:** Nigeria's 36 governors are among the most digitally active politicians on the continent. They have dedicated communications teams, state media offices, and active social media presences. Yet no single SaaS platform provides a governance + campaign unified presence. The template must serve both the campaign trail (rallies, manifesto, running mate) and the State House (project tracker, state budget, press briefings). Revenue ceiling is the highest in the political vertical at ₦200K–₦500K/month per tenant.

### 2. Senator (`senator` — VN-POL-016) — Score: 40/50 — P1
**Why urgent:** Nigeria's 109 senators are highly visible at federal level. They are individually responsible for constituency development projects (UBEC, TETFUND, NDDC, etc.), legislative sponsorships, and public accountability reporting. No template currently distinguishes a senator from a ward rep. A senator's page must showcase committee assignments, bills sponsored, constituency project tracker, and national profile — features that are structurally absent from the generic `politician` template.

### 3. House of Representatives Member (`house-of-reps-member` — VN-POL-015) — Score: 40/50 — P1
**Why urgent:** 360 Reps members with federal constituency mandates, each managing constituency intervention projects, NASS committee work, and constituent petitions. This is the single largest population of high-profile federal politicians. Template needs (constituency map, bills co-sponsored, CDF tracker, town hall schedule) are completely distinct from any existing template.

---

## Connections to Existing Platform Capabilities

| Platform Capability | Political Roles That Benefit |
|---|---|
| `geography` table + ward boundaries | All roles — ward/LGA/state/federal constituency mapping |
| `community_spaces` | Governor, LGA Chairman, HASM — public engagement events |
| `community_courses` | Party Chapter Officer — voter education, party training |
| FSM states (campaign→elected→in_office→post_office) | All elected roles |
| `requires_social: 1` | All elected and appointed roles |
| `requires_community: 1` | Ward Councillor, LGA Chairman, HASM, Governor |
| Compliance document display | All roles — INEC certificate of return / letter of appointment |
| WhatsApp CTA | All roles — constituency WhatsApp line |
| Multi-page `mkPage` (4 pages) | All roles — Home/About/Projects/Contact per existing pattern |

---

## What This Document Does NOT Do

- Does not implement any template (zero code changes)
- Does not modify `template-resolver.ts`
- Does not modify the canonical niche registry
- Does not add rows to `infra/db/seeds/0004_verticals-master.csv`
- Does not change any migrations or seed SQL
- Does not deploy anything

---

*Produced: 2026-04-26 — Political Role-Specific Template Expansion Blueprint*
*Next action: Graduate top 3 candidates (governor, senator, house-of-reps-member) to canonical niche registry via CSV update + governance docs after founding team review*
