# Political Role-Specific Template Execution Board

**Document type:** Operational status board  
**Status:** ACTIVE — updated by agents after every status change  
**Date last updated:** 2026-04-26  
**Authority:** `docs/templates/expansion/political/00-Political-Master-Blueprint.md`

---

## Summary Counts

| Status | Count |
|--------|-------|
| UNASSIGNED | 0 |
| READY_FOR_RESEARCH | 16 |
| RESEARCH_IN_PROGRESS | 0 |
| RESEARCH_SYNTHESIZED | 0 |
| READY_FOR_IMPLEMENTATION | 0 |
| IMPLEMENTATION_IN_PROGRESS | 0 |
| IMPLEMENTED | 0 |
| VERIFIED | 0 |
| APPROVED | 0 |
| SHIPPED | 0 |
| BLOCKED | 0 |
| NEEDS_REVISION | 0 |
| VARIANTS_PENDING | 0 |
| ARCHIVED | 0 |
| **TOTAL POLITICAL NICHES** | **16** |

---

## Sprint 1 — P1 Candidates (M8c Target)

These three score ≥40. All must be IMPLEMENTED before Sprint 2 variants can be claimed.  
**Governor is the NF-POL-ELC family anchor — it must be completed first.**

| # | Niche ID | VN-ID | Vertical | Niche Name | Score | Family | Status | Owner | Last Updated |
|---|----------|-------|----------|-----------|-------|--------|--------|-------|-------------|
| 1 | `POL-governor-official-site` | VN-POL-013 | governor | State Governor Official Site | 42 | NF-POL-ELC **anchor** | READY_FOR_RESEARCH | — | 2026-04-26 |
| 2 | `POL-senator-official-site` | VN-POL-016 | senator | Senator Official Site | 40 | NF-POL-ELC variant | READY_FOR_RESEARCH | — | 2026-04-26 |
| 3 | `POL-house-of-reps-member-official-site` | VN-POL-015 | house-of-reps-member | House of Reps Member Official Site | 40 | NF-POL-ELC variant | READY_FOR_RESEARCH | — | 2026-04-26 |

> Variants #2 and #3 are **blocked** until `POL-governor-official-site` reaches IMPLEMENTED.

---

## Sprint 2 — P2 High Priority (M8d Target)

State-commissioner is the NF-POL-APT anchor — must be completed before federal-minister and supervisory-councillor.  
LGA chairman and HASM are NF-POL-ELC variants — blocked until governor IMPLEMENTED.

| # | Niche ID | VN-ID | Vertical | Niche Name | Score | Family | Status | Owner | Last Updated |
|---|----------|-------|----------|-----------|-------|--------|--------|-------|-------------|
| 4 | `POL-state-commissioner-official-site` | VN-POL-018 | state-commissioner | State Commissioner Official Site | 37 | NF-POL-APT **anchor** | READY_FOR_RESEARCH | — | 2026-04-26 |
| 5 | `POL-federal-minister-official-site` | VN-POL-019 | federal-minister | Federal Minister Official Site | 39 | NF-POL-APT variant | READY_FOR_RESEARCH | — | 2026-04-26 |
| 6 | `POL-lga-chairman-official-site` | VN-POL-009 | lga-chairman | LGA Chairman Official Site | 39 | NF-POL-ELC variant | READY_FOR_RESEARCH | — | 2026-04-26 |
| 7 | `POL-house-of-assembly-member-official-site` | VN-POL-011 | house-of-assembly-member | House of Assembly Member Official Site | 39 | NF-POL-ELC variant | READY_FOR_RESEARCH | — | 2026-04-26 |

> #5 blocked until `POL-state-commissioner-official-site` IMPLEMENTED.  
> #6 and #7 blocked until `POL-governor-official-site` IMPLEMENTED.

---

## Sprint 3 — P2 Remaining (M9 Target)

Party-chapter-officer is the NF-POL-PTY anchor. Presidential-candidate is standalone (no family dependency).

| # | Niche ID | VN-ID | Vertical | Niche Name | Score | Family | Status | Owner | Last Updated |
|---|----------|-------|----------|-----------|-------|--------|--------|-------|-------------|
| 8 | `POL-presidential-candidate-official-site` | VN-POL-017 | presidential-candidate | Presidential Candidate / President Official Site | 37 | NF-POL-ELC standalone | READY_FOR_RESEARCH | — | 2026-04-26 |
| 9 | `POL-political-appointee-official-site` | VN-POL-020 | political-appointee | Political Appointee (General) Official Site | 37 | NF-POL-APT variant | READY_FOR_RESEARCH | — | 2026-04-26 |
| 10 | `POL-ward-councillor-official-site` | VN-POL-008 | ward-councillor | Ward Councillor Official Site | 37 | NF-POL-ELC variant | READY_FOR_RESEARCH | — | 2026-04-26 |
| 11 | `POL-party-chapter-officer-official-site` | VN-POL-022 | party-chapter-officer | Party Chapter Officer Official Site | 35 | NF-POL-PTY **anchor** | READY_FOR_RESEARCH | — | 2026-04-26 |
| 12 | `POL-party-state-officer-official-site` | VN-POL-023 | party-state-officer | Party State Officer Official Site | 36 | NF-POL-PTY variant | READY_FOR_RESEARCH | — | 2026-04-26 |
| 13 | `POL-deputy-governor-official-site` | VN-POL-014 | deputy-governor | Deputy Governor Official Site | 36 | NF-POL-ELC variant | READY_FOR_RESEARCH | — | 2026-04-26 |

> #9 blocked until `POL-state-commissioner-official-site` IMPLEMENTED.  
> #10, #13 blocked until `POL-governor-official-site` IMPLEMENTED.  
> #12 blocked until `POL-party-chapter-officer-official-site` IMPLEMENTED.

---

## Sprint 4 — P2 Trailing (M10 Target)

Lower volume / lower priority. All are variants of anchors from Sprints 1–3.

| # | Niche ID | VN-ID | Vertical | Niche Name | Score | Family | Status | Owner | Last Updated |
|---|----------|-------|----------|-----------|-------|--------|--------|-------|-------------|
| 14 | `POL-assembly-speaker-official-site` | VN-POL-012 | assembly-speaker | Speaker / Deputy Speaker Official Site | 34 | NF-POL-ELC standalone | READY_FOR_RESEARCH | — | 2026-04-26 |
| 15 | `POL-lga-vice-chairman-official-site` | VN-POL-010 | lga-vice-chairman | LGA Vice Chairman Official Site | 33 | NF-POL-ELC variant | READY_FOR_RESEARCH | — | 2026-04-26 |
| 16 | `POL-supervisory-councillor-official-site` | VN-POL-021 | supervisory-councillor | Supervisory Councillor Official Site | 31 | NF-POL-APT variant | READY_FOR_RESEARCH | — | 2026-04-26 |

> #15 blocked until `POL-lga-chairman-official-site` IMPLEMENTED.  
> #16 blocked until `POL-state-commissioner-official-site` IMPLEMENTED.

---

## Completed Niches

| Completed Date | Niche ID | Niche Name | Template Slug |
|----------------|----------|-----------|---------------|
| — | — | — | — |

*No political role niches completed yet. This table will be updated as niches reach IMPLEMENTED status.*

---

## Family Anchor Status (Critical Dependencies Tracker)

| Anchor | Family | Status | Variants Unblocked |
|--------|--------|--------|--------------------|
| `POL-governor-official-site` | NF-POL-ELC | READY_FOR_RESEARCH | 0 of 7 variants unblocked |
| `POL-state-commissioner-official-site` | NF-POL-APT | READY_FOR_RESEARCH | 0 of 3 variants unblocked |
| `POL-party-chapter-officer-official-site` | NF-POL-PTY | READY_FOR_RESEARCH | 0 of 1 variant unblocked |

**Update this table whenever an anchor's status changes.**  
When anchor reaches IMPLEMENTED: update "Variants Unblocked" count to show how many variants may now be claimed.

---

## Known Issues / Pre-Activation Flags

| Issue | Severity | Niche(s) Affected | Resolution Required |
|-------|----------|-------------------|---------------------|
| CSV rows not yet added (16 niches uncanonical) | HIGH | All 16 | Founding team approval → add all 16 rows to `0004_verticals-master.csv` |
| VN-IDs proposed only (VN-POL-008 to VN-POL-023) | HIGH | All 16 | Confirm in `canonical-niche-registry.md` before claiming |
| NF-POL families not yet in family-variant-register | HIGH | All 16 | Register NF-POL-ELC, NF-POL-APT, NF-POL-PTY in `niche-family-variant-register.md` |
| Presidential campaign finance gate required | HIGH | POL-presidential-candidate | Launch post_office mode only; campaign mode requires INEC Form CF001 reference gate |
| vtx_politician scope note needed (DIFFERENTIATE gate) | MEDIUM | POL-governor, POL-senator, POL-house-of-reps-member | Add scope note to vtx_politician CSV row: "Generic politician page — role-specific templates available for governor, senator, reps member" |
| vtx_ward_rep scope note needed | MEDIUM | POL-ward-councillor | Add scope note to vtx_ward_rep CSV row |
| vtx_constituency_office scope note needed | MEDIUM | Multiple | Add scope note distinguishing from role-specific templates |
| vtx_political_party scope note needed | MEDIUM | POL-party-chapter-officer, POL-party-state-officer | Add scope note |

---

## Instructions for Updating This Board

**After every status change:**
1. Update the status column for the affected niche in the relevant sprint table
2. Update the owner column (set to agent ID or `—` if unassigned)
3. Update the "Last Updated" date
4. Update the summary counts table at the top
5. If a niche moves to IMPLEMENTED: move it to the "Completed Niches" table
6. Update the "Family Anchor Status" tracker if an anchor niche changed status
7. Update "Variants Unblocked" count accordingly

---

*Last updated: 2026-04-26 — Execution board initialised. 16 political niches at READY_FOR_RESEARCH. No niches IMPLEMENTED. 3 family anchors not yet started. All 16 niches pending canonical activation (CSV + VN-ID + family registration).*
