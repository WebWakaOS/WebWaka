# WebWaka OS — Political Role-Specific Candidate Collision Analysis

**Political Blueprint | Document 7 of 7**
*Produced: 2026-04-26 — QA Gate: Pre-Promotion Collision Audit*

---

## Purpose

Before any candidate from `02-Political-Candidate-Registry.md` is promoted to canonical status (CSV row + governance doc update), every proposed VN-ID must be cleared against:

1. **The existing 192-template universe** (192 entries in `BUILT_IN_TEMPLATES` map)
2. **The 198-row `0004_verticals-master.csv`** (all existing vertical entries)
3. **Internal political entries** (the 7 existing political rows audited against each other and against new candidates)

This document records:
1. The **collision verdict** for each of the 16 candidates (CLEAR / DIFFERENTIATE / MERGE / REJECT)
2. The **rationale** behind each verdict
3. **Required pre-actions** for DIFFERENTIATE verdicts before CSV promotion
4. A **pre-promotion checklist** for the governance gate

---

## Audit Methodology

Full text of `0004_verticals-master.csv` and the `BUILT_IN_TEMPLATES` map in `template-resolver.ts` were compared against all 16 proposed slugs, display names, categories, and subcategories.

**Collision criteria applied:**

| Level | Meaning | Verdict |
|---|---|---|
| **Same slug** | Exact ID conflict | REJECT (hard block) |
| **Same subcategory + same business function** | Functional duplicate | MERGE |
| **Adjacent function, distinguishable template** | Overlap exists but viable | DIFFERENTIATE |
| **No meaningful overlap** | Clean field | CLEAR |

---

## Section A — Internal CSV Duplicates in Existing Political Rows

### A1. `vtx_politician` (slug: `politician`) vs `vtx_ward_rep` (slug: `ward-rep`)

| Field | vtx_politician | vtx_ward_rep |
|---|---|---|
| slug | `politician` | `ward-rep` |
| display | Individual Politician | Ward Representative |
| category | politics | politics |
| subcategory | elected-office | local-government |
| entity_type | individual | individual |
| notes | "7 offices Councilor→President" | "Ward-level political representative; inherits from politician pattern" |

**Finding:** `ward-rep` was added as a more granular entry but explicitly notes it "inherits from politician pattern." These two rows serve partially overlapping purposes. However, they are **not** full functional duplicates:
- `politician` is a generic multi-office bundle
- `ward-rep` is specifically ward-level

**Recommendation:** Do **not** merge. Instead:
1. Add a scope note to `vtx_politician`: "Generic fallback only; role-specific niches (governor, senator, etc.) are preferred for new signups"
2. Retain `vtx_ward_rep` as the existing ward-level entry
3. The new `ward-councillor` candidate will DIFFERENTIATE from `ward-rep` (see Section B below)

**Action required before promoting new political niches:** Add scope notes to both existing rows clarifying their legacy/fallback status. Do NOT deprecate until role-specific niches are active.

---

### A2. `vtx_lga_office` vs `vtx_constituency_office` — Scope Clarification

| Field | vtx_lga_office | vtx_constituency_office |
|---|---|---|
| slug | `lga-office` | `constituency-office` |
| entity_type | **place** | **place** |
| subcategory | local-govt | elected-office |

**Finding:** Both are **place entities** — they represent buildings/service points, not individuals. No collision with any proposed individual-entity candidate. These entries should be retained as-is; they serve a fundamentally different purpose from the individual officeholder templates proposed here.

**Action required:** None. These place entities are orthogonal to all 16 proposed candidates.

---

## Section B — Collision Verdicts for 16 Proposed Candidates

---

### B1. `ward-councillor` (VN-POL-008)

**Collisions checked against:**
- `ward-rep` (vtx_ward_rep) — most likely collision

| Comparison | `ward-rep` | `ward-councillor` |
|---|---|---|
| Entity type | individual | individual |
| Subcategory | local-government | local-government |
| Role basis | "Ward Representative" (ambiguous — informal or elected) | Specifically the SIEC-elected legislative councillor with certificate of return |
| Template distinction | Generic ward-level; no Candidate/Incumbent split; no council legislative log | Candidate/Incumbent/Post-Office mode; council chamber context; ward boundary display; legislative log |

**Verdict: DIFFERENTIATE**

**Rationale:** `ward-rep` and `ward-councillor` serve adjacent but distinguishable roles. `ward-rep` covers informal ward-level political representation; `ward-councillor` specifically covers the formally elected councillor with a SIEC certificate of return. The legislative-vs-informal distinction is clear enough to maintain both entries.

**Pre-action required before promoting `ward-councillor`:**
1. Update `vtx_ward_rep` notes column to: "Generic ward-level rep (informal or elected, no cert-of-return required); for SIEC-elected ward councillors see ward-councillor"
2. Add scope note to `ward-councillor` CSV row: "Formally elected ward councillor with SIEC certificate of return; distinguish from ward-rep (informal/generic)"

---

### B2. `lga-chairman` (VN-POL-009)

**Collisions checked against:**
- `lga-office` (vtx_lga_office) — most likely collision
- `politician` (vtx_politician) — secondary collision check

| Comparison | `lga-office` | `lga-chairman` |
|---|---|---|
| Entity type | **place** | **individual** |
| Function | Represents the LGA council building/service point | Represents the individual elected executive chairman |
| Template | Service directory; contacts; public notices | Campaign page; JAAC display; project delivery; cabinet listing |

**Verdict against `lga-office`: CLEAR** — entity types are fundamentally different (place vs. individual). No collision.

**Verdict against `politician`: DIFFERENTIATE** — `politician` is a generic bundle; `lga-chairman` is a specific LGA-tier executive role with distinct template needs (JAAC, supervisory councillors, 774 LGA reference).

**Pre-action required:**
1. Update `vtx_politician` notes: "Generic multi-office fallback; for LGA Chairman see lga-chairman; for Governor see governor; etc."
2. No action on `vtx_lga_office` — orthogonal.

---

### B3. `lga-vice-chairman` (VN-POL-010)

**Collisions checked against:**
- `lga-chairman` (proposed VN-POL-009) — same tier
- `politician` — generic bundle

**Verdict against proposed `lga-chairman`: DIFFERENTIATE** — joint-ticket relationship means vice chairman is a distinct entity but derives from the same tier. Template serves the vice chair specifically (running mate display; subordinate portfolio). The distinction is functional and constitutionally grounded.

**Verdict against `politician`: DIFFERENTIATE** — same rationale as all other role-specific candidates vs. the generic bundle.

**Pre-action required:** None beyond the `vtx_politician` scope note already noted in B2.

---

### B4. `house-of-assembly-member` (VN-POL-011)

**Collisions checked against:**
- `politician` (vtx_politician) — generic bundle
- `constituency-office` (vtx_constituency_office) — possible confusion

| Comparison | `constituency-office` | `house-of-assembly-member` |
|---|---|---|
| Entity type | **place** | **individual** |
| Function | Physical constituency office building | Individual state legislator's personal profile |

**Verdict against `constituency-office`: CLEAR** — entity types fundamentally different.
**Verdict against `politician`: DIFFERENTIATE** — 993 HASM seats; distinct state HOA committee system; CDF tracker; bills (HB prefix) — all absent from generic politician template.

**Pre-action required:** None beyond `vtx_politician` scope note.

---

### B5. `assembly-speaker` (VN-POL-012)

**Collisions checked against:**
- `house-of-assembly-member` (proposed VN-POL-011)
- `politician` (vtx_politician)

**Verdict against proposed `house-of-assembly-member`: DIFFERENTIATE** — speaker holds an underlying HASM seat (covered by HASM template in campaign/constituency mode) AND an institutional presiding role (speaker's rulings, order papers). The dual mandate creates sufficient distinctiveness. Neither template can serve both roles adequately.

**Verdict against `politician`: DIFFERENTIATE** — institutional presiding role.

**Pre-action required:** None.

---

### B6. `governor` (VN-POL-013)

**Collisions checked against:**
- `politician` (vtx_politician) — generic bundle
- `campaign-office` (vtx_campaign_office) — campaign function overlap

| Comparison | `campaign-office` | `governor` |
|---|---|---|
| Entity type | organization | individual |
| Function | Office operations (volunteer coordination, ward coverage) | Individual politician's personal profile |

**Verdict against `campaign-office`: CLEAR** — entity types different; `campaign-office` is the organization that runs the campaign; `governor` is the candidate/officeholder themselves.

**Verdict against `politician`: DIFFERENTIATE** — state executive head; RMAFC allocation; commissioner cabinet; state-wide mandate; budget dashboard. None of these exist in the generic politician template.

**Pre-action required:** Update `vtx_politician` notes to explicitly exclude governor.

---

### B7. `deputy-governor` (VN-POL-014)

**Collisions checked against:**
- `governor` (proposed VN-POL-013)
- `politician` (vtx_politician)

**Verdict against proposed `governor`: DIFFERENTIATE** — running-mate pairing; succession protocol; subordinate portfolio framing makes deputy governor distinct from governor while sharing family membership.

**Verdict against `politician`: DIFFERENTIATE** — role-specific.

**Pre-action required:** None.

---

### B8. `house-of-reps-member` (VN-POL-015)

**Collisions checked against:**
- `constituency-office` (vtx_constituency_office) — place entity same tier
- `politician` (vtx_politician)

**Verdict against `constituency-office`: CLEAR** — place entity vs. individual.
**Verdict against `politician`: DIFFERENTIATE** — 360 federal constituencies; NASS committee; CDF (UBEC/TETFUND/NDDC); federal mandate. All absent from generic politician.

**Pre-action required:** Update `vtx_constituency_office` notes: "Place entity — physical constituency office; for individual Reps member profile see house-of-reps-member"

---

### B9. `senator` (VN-POL-016)

**Collisions checked against:**
- `politician` (vtx_politician)
- `constituency-office` (vtx_constituency_office)

**Verdict against `constituency-office`: CLEAR** — place entity vs. individual.
**Verdict against `politician`: DIFFERENTIATE** — 109 senatorial districts; Distinguished Senator honorific; Senate committee chairmanship; UDSS zonal allocation; SB bill prefix; Senate screening record. None present in generic politician template.

**Pre-action required:** None beyond `vtx_politician` scope note.

---

### B10. `presidential-candidate` (VN-POL-017)

**Collisions checked against:**
- `politician` (vtx_politician) — most likely collision
- `campaign-office` (vtx_campaign_office)

**Verdict against `campaign-office`: CLEAR** — organization (campaign HQ) vs. individual candidate.

**Verdict against `politician`: DIFFERENTIATE** — national mandate; 6-geopolitical zones; running-mate (VP) spotlight; INEC Form CF001; campaign finance compliance (₦5B cap); diaspora outreach; FEC membership (if incumbent). The presidential template is so distinct it barely resembles the generic politician page.

**Pre-action required:**
1. Add to `vtx_politician` notes: "Generic fallback only; for Presidential candidate see presidential-candidate"
2. Establish campaign finance compliance review process before enabling donation CTA in presidential-candidate campaign mode (Electoral Act 2022 campaign finance provisions)

---

### B11. `state-commissioner` (VN-POL-018)

**Collisions checked against:**
- All 192 existing templates — specifically checking for any "commissioner" entry
- `politician` (vtx_politician)

**Full template universe search for "commissioner":** No existing template uses the commissioner role. The `accounting-firm-accounting-firm-audit` template is the closest non-political match but covers a private-sector accounting practice, not a political appointment.

**Verdict: CLEAR** — no collision with any existing template. No individual officeholder template exists for appointed state officials.

**Pre-action required:** None.

---

### B12. `federal-minister` (VN-POL-019)

**Collisions checked against:**
- All 192 existing templates — checking for "minister" or "ministry"
- `politician` (vtx_politician)

**Full template universe search for "minister":** Only `ministry-mission-ministry-mission-platform` exists — this covers religious ministries (church ministry outreach), not government ministers. No collision.

**Verdict: CLEAR** — no collision with any existing template.

**Pre-action required:** None. Note in template documentation that `federal-minister` refers to government minister, not religious minister (distinguish from `ministry-mission` niche).

---

### B13. `political-appointee` (VN-POL-020)

**Collisions checked against:**
- All 192 existing templates
- `politician` (vtx_politician)

**Full template universe search for "appointee" or "parastatal" or "DG" or "board chair":** No matches found.

**Verdict: CLEAR** — no collision with any existing template.

**Pre-action required:** None.

---

### B14. `supervisory-councillor` (VN-POL-021)

**Collisions checked against:**
- `ward-rep` (vtx_ward_rep)
- `lga-chairman` (proposed VN-POL-009)
- `politician` (vtx_politician)

**Verdict against `ward-rep`: CLEAR** — ward-rep is an elected ward-level role; supervisory councillor is an appointed LGA cabinet role. Different tier, different mandate, different appointment process.

**Verdict against proposed `lga-chairman`: DIFFERENTIATE** — supervisory councillor is appointed by (and subordinate to) the LGA chairman; distinct enough for its own template (portfolio focus; no electoral mandate; no JAAC display) but shares family membership with appointed officials.

**Verdict against `politician`: DIFFERENTIATE** — appointed, not elected; no campaign mode.

**Pre-action required:** None.

---

### B15. `party-chapter-officer` (VN-POL-022)

**Collisions checked against:**
- `political-party` (vtx_political_party) — most likely collision
- `politician` (vtx_politician)
- `polling-unit-rep` (vtx_polling_unit_rep)

| Comparison | `political-party` | `party-chapter-officer` |
|---|---|---|
| Entity type | **organization** | **individual** |
| Scope | National party organization | Individual officer in ward/LGA chapter |
| Template focus | Party ideology; leadership; events; national structure | Personal officer profile; chapter congress; ward delegate management |

**Verdict against `political-party`: DIFFERENTIATE** — entity types are fundamentally different (organization vs. individual). A national party and an individual ward chairman of a party chapter serve entirely different users with different templates.

**Verdict against `polling-unit-rep`: DIFFERENTIATE** — `polling-unit-rep` covers the specific role of a party agent at a polling unit during elections (voter mobilizer, results collator); `party-chapter-officer` covers the ongoing party chapter leadership role between elections. Different function, different mandate, different scope.

**Verdict against `politician`: DIFFERENTIATE** — internal party role; no electoral mandate; no candidate/incumbent split.

**Pre-action required:** Update `vtx_political_party` notes: "National party organization entity; for individual sub-national party officers see party-chapter-officer (ward/LGA) and party-state-officer (state)"

---

### B16. `party-state-officer` (VN-POL-023)

**Collisions checked against:**
- `political-party` (vtx_political_party)
- `party-chapter-officer` (proposed VN-POL-022)
- `politician` (vtx_politician)

**Verdict against `political-party`: DIFFERENTIATE** — same logic as B15; national organization vs. individual state officer.

**Verdict against proposed `party-chapter-officer`: DIFFERENTIATE** — different geography tier (state vs. ward/LGA); different congress machinery (state congress, delegate to national convention); different secretariat scale.

**Verdict against `politician`: DIFFERENTIATE** — party role vs. public office.

**Pre-action required:** Same `vtx_political_party` note update as in B15.

---

## Section C — Verdict Summary Table

| Queue # | Proposed Slug | VN-ID | Verdict | Pre-Action Required? |
|---|---|---|---|---|
| 1 | `governor` | VN-POL-013 | **DIFFERENTIATE** (vs. `politician`) | Yes — update `vtx_politician` notes |
| 2 | `senator` | VN-POL-016 | **DIFFERENTIATE** (vs. `politician`) | No (covered by governor pre-action) |
| 3 | `house-of-reps-member` | VN-POL-015 | **DIFFERENTIATE** (vs. `politician`, `constituency-office`) | Yes — update `vtx_constituency_office` notes |
| 4 | `state-commissioner` | VN-POL-018 | **CLEAR** | No |
| 5 | `federal-minister` | VN-POL-019 | **CLEAR** | No |
| 6 | `lga-chairman` | VN-POL-009 | **DIFFERENTIATE** (vs. `politician`, `lga-office`) | Yes — update `vtx_politician` notes |
| 7 | `house-of-assembly-member` | VN-POL-011 | **DIFFERENTIATE** (vs. `politician`, `constituency-office`) | No (covered by reps pre-action) |
| 8 | `presidential-candidate` | VN-POL-017 | **DIFFERENTIATE** (vs. `politician`, `campaign-office`) | Yes — campaign finance compliance process |
| 9 | `political-appointee` | VN-POL-020 | **CLEAR** | No |
| 10 | `ward-councillor` | VN-POL-008 | **DIFFERENTIATE** (vs. `ward-rep`) | Yes — update `vtx_ward_rep` notes |
| 11 | `party-chapter-officer` | VN-POL-022 | **DIFFERENTIATE** (vs. `political-party`, `polling-unit-rep`) | Yes — update `vtx_political_party` notes |
| 12 | `party-state-officer` | VN-POL-023 | **DIFFERENTIATE** (vs. `political-party`, `party-chapter-officer`) | No (covered by B15 pre-action) |
| 13 | `deputy-governor` | VN-POL-014 | **DIFFERENTIATE** (vs. `governor`, `politician`) | No |
| 14 | `assembly-speaker` | VN-POL-012 | **DIFFERENTIATE** (vs. `house-of-assembly-member`, `politician`) | No |
| 15 | `lga-vice-chairman` | VN-POL-010 | **DIFFERENTIATE** (vs. `lga-chairman`, `politician`) | No |
| 16 | `supervisory-councillor` | VN-POL-021 | **DIFFERENTIATE** (vs. `ward-rep`, `lga-chairman`) | No |

**CLEAR: 2** | **DIFFERENTIATE: 14** | **MERGE: 0** | **REJECT: 0**

> All 16 candidates survive the collision audit. Zero rejections.

---

## Section D — Required Pre-Actions (Consolidated)

Before promoting **any** of the 16 political candidates to canonical status, the following pre-actions must be completed:

### D1. Update `vtx_politician` notes (CSV)
**Action:** Change the `notes` column of `vtx_politician` from:
> `"7 offices Councilor→President; politics tables ready M2"`

To:
> `"Generic multi-office fallback for backward compatibility; for role-specific niches use: ward-councillor (ward), lga-chairman (LGA exec), house-of-assembly-member (state legislature), governor (state exec), house-of-reps-member (federal legislature), senator (federal senate), presidential-candidate (presidency); existing tenants to be migrated via M8c migration script"`

### D2. Update `vtx_ward_rep` notes (CSV)
**Action:** Add to notes:
> `"Generic/informal ward rep; for SIEC-elected ward councillors with certificate of return see ward-councillor"`

### D3. Update `vtx_constituency_office` notes (CSV)
**Action:** Add to notes:
> `"Place entity — physical constituency office building/service point; for individual Reps member or Senator profile see house-of-reps-member / senator"`

### D4. Update `vtx_political_party` notes (CSV)
**Action:** Add to notes:
> `"National party organization entity; for individual sub-national party officers see party-chapter-officer (ward/LGA) and party-state-officer (state chapter)"`

### D5. Campaign Finance Compliance Process (`presidential-candidate`)
**Action:** Before enabling donation/fundraising CTA in `presidential-candidate` campaign mode, establish:
1. INEC campaign account reference field in template (mandatory in campaign mode)
2. Electoral Act 2022 campaign finance disclaimer text on donation pages
3. Internal review process for presidential tenant activation (manual approval gate)

---

## Section E — Pre-Promotion Checklist (Per Niche)

For each niche being promoted from candidate to canonical status:

- [ ] Collision verdict confirmed (CLEAR or DIFFERENTIATE) in this document
- [ ] All DIFFERENTIATE pre-actions from Section D completed and verified
- [ ] CSV row written to `infra/db/seeds/0004_verticals-master.csv`
- [ ] VN-ID confirmed and registered in canonical niche registry
- [ ] Niche family entry created/updated in niche family variant register
- [ ] Regulatory gate documented and KYC tier assigned in `05-Political-Regulatory.md`
- [ ] Template TypeScript file written and exports named correctly
- [ ] Import + map entry added to `template-resolver.ts`
- [ ] `tsc --noEmit`: 0 errors
- [ ] `vitest run`: all tests pass

---

*End of Collision Analysis — Produced 2026-04-26*
*All 16 political role-specific candidates cleared: 2 CLEAR, 14 DIFFERENTIATE, 0 MERGE, 0 REJECT*
