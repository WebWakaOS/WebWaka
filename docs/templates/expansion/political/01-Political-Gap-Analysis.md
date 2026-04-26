# WebWaka OS — Political Role-Specific Gap Analysis

**Status:** RESEARCH — Informing Expansion Decisions
**Date:** 2026-04-26
**Parent:** `docs/templates/expansion/political/00-Political-Master-Blueprint.md`
**Scope:** Systematic identification of gaps in the existing 7-niche politics template universe

---

## Method

The 7 existing political entries in `0004_verticals-master.csv` were each interrogated against three questions:

1. **Coverage question:** Which real-world Nigerian political roles does this entry actually serve?
2. **Template question:** Can the existing template (`politician-campaign-site`, `ward-rep-ward-rep-councillor-site`, etc.) render a meaningful page for that role without workarounds?
3. **Gap question:** What roles in the Nigeria Political Hierarchy fall entirely outside current coverage?

---

## Section 1 — Audit of Existing 7 Political Entries

### 1.1 `vtx_politician` / `politician` / `politician-campaign-site`
**Current claimed scope:** "7 offices Councilor→President"
**Actual template capability:** Campaign-focused site; WhatsApp CTA; manifesto section; volunteer form; generic rally schedule
**Roles it inadequately serves:**
- ❌ Governor (needs state budget transparency, cabinet announcements, state project tracker — none present)
- ❌ Senator (needs NASS committee list, bills sponsored, senate district map, UDSS allocations — none present)
- ❌ House of Reps Member (needs federal constituency map, NASS committee, CDF tracker — none present)
- ❌ LGA Chairman (needs LGA budget, council session minutes, project delivery tracker — none present)
- ❌ Appointed officials (commissioners, ministers — no appointment-based variant; no portfolio page)
- ⚠️ Presidential Candidate (partially served by campaign page; lacks national scope elements — running mate spotlight, rally map across 6 zones, INEC Form CF001 compliance)
- ⚠️ Ward Councillor (partially served; lacks ward boundary mapping and councillor legislative log)
**Verdict:** INADEQUATE for 5 of 7 claimed roles; PARTIAL for 2

---

### 1.2 `vtx_political_party` / `political-party` / `political-party-party-website`
**Current claimed scope:** National political party
**Actual template capability:** Party overview; membership; ideology; leadership; events
**Roles it inadequately serves:**
- ❌ Party Ward Chapter (ward-level structure, ward congress minutes, delegate list — not served)
- ❌ Party LGA Chapter (LGA council meeting coordination, local nominations — not served)
- ❌ Party State Chapter (state congress, state executive committee, governorship primaries — not served)
**Verdict:** ADEQUATE for national party; ABSENT for all sub-national party structures

---

### 1.3 `vtx_campaign_office` / `campaign-office` / `campaign-office-campaign-office-ops`
**Current claimed scope:** Political Campaign Office (generic)
**Actual template capability:** Office operations; volunteer coordination; ward coverage map; donor contact
**Roles it inadequately serves:**
- ❌ Role-specific campaign infrastructure (a governor's campaign office is categorically different from a ward councillor's in budget, team, and communications complexity)
- ❌ Post-campaign transition (winner → governance mode not handled)
**Verdict:** FUNCTIONAL as a generic office ops tool; LACKS role-specific depth; LACKS lifecycle transition

---

### 1.4 `vtx_lga_office` / `lga-office` / `lga-office-lga-council-portal`
**Current claimed scope:** "Local Government Council / Ward Office" — entity type: **place**
**Actual template capability:** Ward service directory; official contacts; public notices
**Critical issue:** This is a **place entity** (the council building/service point), NOT the individual LGA Chairman. An LGA Chairman who wants a personal political profile cannot use this template — it is designed for the institution, not the person.
**Roles it does not serve:**
- ❌ LGA Chairman (individual politician with campaign and governance needs)
- ❌ LGA Vice Chairman
- ❌ Supervisory Councillor
**Verdict:** CORRECT for its stated use case (place entity); ABSENT for individual LGA political roles

---

### 1.5 `vtx_polling_unit_rep` / `polling-unit-rep` / `polling-unit-rep-polling-unit-rep-site`
**Current claimed scope:** Polling Unit Representative — voter mobilizer, ward-level organizing
**Actual template capability:** Voter mobilization page; party loyalty signals; ward contact
**Assessment:** Narrow but correct for its function. This is the lowest tier of political engagement — a party agent at a specific polling unit. This is NOT a substitute for Ward Councillor (who holds office) or Ward Party Chairman (who holds party office).
**Verdict:** ADEQUATE for its specific narrow role; should NOT be promoted to cover other ward roles

---

### 1.6 `vtx_constituency_office` / `constituency-office` / `constituency-office-constituency-dev-portal`
**Current claimed scope:** "Constituency Development Office" — entity type: **place**
**Actual template capability:** Project tracking; constituent services; office contacts; development fund display
**Critical issue:** Again a **place entity**. An elected representative (HASM, Reps Member, Senator) who wants a personal political profile cannot use this template — it is the office building page.
**Verdict:** CORRECT for its stated use case (place entity); ABSENT for individual elected-representative profiles

---

### 1.7 `vtx_ward_rep` / `ward-rep` / `ward-rep-ward-rep-councillor-site`
**Current claimed scope:** "Ward Representative" — individual
**Actual template capability:** Ward-level political representative; councillor-style; inherits from politician pattern
**Assessment:** This is the closest thing to a role-specific political template in the current universe. However:
- The slug `ward-rep` is ambiguous — it covers both the elected Ward Councillor and an informal community representative
- Template lacks: ward boundary visualization, council legislative log, LGA parent council context
- No Candidate vs. Incumbent mode distinction

**Verdict:** BEST EXISTING template for ward politics; NEEDS differentiation from formal Ward Councillor role; CANDIDATE for DIFFERENTIATE verdict in collision analysis

---

## Section 2 — Gap Matrix

For each tier of the Nigeria Political Hierarchy, this table identifies what is covered, what is partially covered, and what is entirely absent.

### Tier 1: Ward Level

| Role | Existing Coverage | Gap Level |
|---|---|---|
| Ward Councillor (elected) | `ward-rep` (partial) | HIGH — no Candidate/Incumbent split; no ward boundary; no council legislative log |
| Polling Unit Agent | `polling-unit-rep` ✓ | LOW — adequately served |
| Ward Party Chairman | None | HIGH — no template exists for sub-national party officer |

### Tier 2: LGA Level

| Role | Existing Coverage | Gap Level |
|---|---|---|
| LGA Chairman (elected) | `politician` (generic, inadequate) / `lga-office` (place, wrong entity type) | CRITICAL — no template for the most powerful local elected official in Nigeria |
| LGA Vice Chairman | None | HIGH |
| Supervisory Councillor (appointed) | None | MEDIUM — LGA cabinet role; no template anywhere |
| LGA Party Chairman | None | HIGH |

### Tier 3: State Level

| Role | Existing Coverage | Gap Level |
|---|---|---|
| House of Assembly Member | `politician` (generic, inadequate) | HIGH — 993 seats; zero role-specific template features |
| Speaker of State HOA | None | MEDIUM — institutional presiding role |
| Governor | `politician` (generic, grossly inadequate) | CRITICAL — Nigeria's state executive head has no dedicated template |
| Deputy Governor | None | HIGH — running mate and succession role |
| State Commissioner | None | HIGH — 720+ appointed portfolio officials |
| Special Adviser to Governor | None | MEDIUM — advisory appointment role |
| State Party Chairman | None | HIGH |

### Tier 4: Federal Level

| Role | Existing Coverage | Gap Level |
|---|---|---|
| House of Reps Member | `politician` (generic, inadequate) / `constituency-office` (place, wrong entity type) | CRITICAL — 360 seats; federal constituency role unserved |
| Senator | `politician` (generic, inadequate) | CRITICAL — 109 seats; NASS upper chamber unserved |
| Speaker of House of Reps | None | LOW — single seat; institutional role |
| Senate President | None | LOW — single seat; institutional role |
| Federal Minister | None | HIGH — 48+ portfolio appointments; no template |
| Presidential Candidate / President | `politician` (partial — campaign only) | HIGH — national scope; running mate; 6-zone presence |

---

## Section 3 — Quantified Gap Summary

| Gap Level | Count | Roles |
|---|---|---|
| **CRITICAL** | 4 | LGA Chairman, Governor, House of Reps Member, Senator |
| **HIGH** | 10 | Ward Councillor, LGA Vice Chairman, LGA Party Chair, HASM, Deputy Governor, Commissioner, State Party Chair, Federal Minister, Political Appointee, Party Chapter Officer |
| **MEDIUM** | 4 | Supervisory Councillor, Speaker HOA, Special Adviser, Senate President |
| **LOW** | 1 | Polling Unit Agent (already served) |

**Total critical + high gaps: 14 roles** — none of which have an adequate existing template.

---

## Section 4 — Root Cause Analysis

### Root Cause 1: The "bundle" anti-pattern
The `politician` niche was designed as a convenience bundle during MVP. Bundling 7 offices into one niche makes governance easy but makes templates useless — the lowest common denominator template satisfies no office well.

### Root Cause 2: Place vs. Person confusion
`lga-office` and `constituency-office` are modelled as **place entities** but the underlying need is for **individual officeholder profiles**. The place entities are correct and should be retained. But individual political roles need their own niche entries with `entity_type: individual`.

### Root Cause 3: No lifecycle model
No existing political template has Candidate / Incumbent / Post-Office mode awareness. A politician visits their website in all three phases of their career, with fundamentally different content needs each time.

### Root Cause 4: Appointed offices invisible
The entire class of appointed political office (commissioner, minister, special adviser, DG of parastatal) is invisible to the platform. These ~2,000+ active officeholders have legitimate public communication needs that no current template serves.

### Root Cause 5: Party sub-national structure absent
`political-party` covers the national organization but Nigeria's 18 registered parties each have ~8,809 ward chapters, 774 LGA chapters, and 36 state chapters. These sub-national structures need their own templates for member communication, congress organization, and delegate management.

---

## Section 5 — Candidate Niche Shortlist (Forward Reference to Doc 02)

Based on this gap analysis, the following 16 niches are proposed as candidates in `02-Political-Candidate-Registry.md`:

| Proposed VN-ID | Slug | Role | Gap Level |
|---|---|---|---|
| VN-POL-008 | `ward-councillor` | Ward Councillor | HIGH |
| VN-POL-009 | `lga-chairman` | LGA Chairman | CRITICAL |
| VN-POL-010 | `lga-vice-chairman` | LGA Vice Chairman | HIGH |
| VN-POL-011 | `house-of-assembly-member` | House of Assembly Member | HIGH |
| VN-POL-012 | `assembly-speaker` | Speaker of State House of Assembly | MEDIUM |
| VN-POL-013 | `governor` | Governor | CRITICAL |
| VN-POL-014 | `deputy-governor` | Deputy Governor | HIGH |
| VN-POL-015 | `house-of-reps-member` | House of Representatives Member | CRITICAL |
| VN-POL-016 | `senator` | Senator | CRITICAL |
| VN-POL-017 | `presidential-candidate` | Presidential Candidate / President | HIGH |
| VN-POL-018 | `state-commissioner` | State Commissioner | HIGH |
| VN-POL-019 | `federal-minister` | Federal Minister | HIGH |
| VN-POL-020 | `political-appointee` | Political Appointee (General) | HIGH |
| VN-POL-021 | `supervisory-councillor` | Supervisory Councillor | MEDIUM |
| VN-POL-022 | `party-chapter-officer` | Party Chapter Officer (Ward/LGA) | HIGH |
| VN-POL-023 | `party-state-officer` | Party State Officer | HIGH |

---

*End of Gap Analysis — Produced 2026-04-26*
