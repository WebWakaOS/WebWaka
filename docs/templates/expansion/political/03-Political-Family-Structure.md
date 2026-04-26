# WebWaka OS — Political Role-Specific Niche Family Structures

**Status:** RESEARCH — Not yet canonical
**Date:** 2026-04-26
**Parent:** `docs/templates/expansion/political/00-Political-Master-Blueprint.md`
**Scope:** 3 new NF-POL family structures for proposed political role-specific niches

> **IMPORTANT:** These family proposals are CANDIDATES. They become canonical when the anchor niche is added to the canonical niche registry and CSV. Until then, treat as design intent only.

---

## Governance Rules (Inherited from Existing System)

All existing governance rules from `docs/governance/niche-family-variant-register.md` apply:

1. Each family has exactly **one anchor** niche (first to be built; most general or highest priority)
2. All variants **inherit** the anchor's baseline template with niche-specific overrides
3. Family code format: `NF-[CATEGORY]-[SUFFIX]` where CATEGORY matches the VN-ID category code
4. Family membership drives: shared AI use-case template, shared discovery tag pool, shared feature scaffolding priority, shared branding theme
5. A niche qualifies as a **variant** if ≥70% of its feature set overlaps with the anchor
6. A niche is **standalone** if <70% overlap with any existing family

---

## FAMILY 1: NF-POL-ELC — Elected Office

**Anchor:** `governor` (VN-POL-013, P1)
**Rationale for anchor choice:** Governor is the highest-scoring P1 candidate; covers the state executive tier which is the most commercially valuable single class of elected official; the governor template's 4-page structure (Campaign/About/Projects/Contact) forms the clearest foundation for all other elected-role variants.

**Family members:**

| Role | VN-ID | Tier | Status | Relationship to Anchor |
|---|---|---|---|---|
| `governor` | VN-POL-013 | State Exec | **Anchor** | — |
| `deputy-governor` | VN-POL-014 | State Exec (2) | Variant | ≥80% overlap; adds running-mate pairing, subordinate portfolio framing |
| `senator` | VN-POL-016 | Federal Legislative | Variant | ≥75% overlap; replaces state budget → Senate committee; adds senatorial district |
| `house-of-reps-member` | VN-POL-015 | Federal Legislative | Variant | ≥75% overlap; replaces Senate chamber → Reps chamber; adds CDF tracker |
| `house-of-assembly-member` | VN-POL-011 | State Legislative | Variant | ≥70% overlap; state-level version of federal legislative template |
| `lga-chairman` | VN-POL-009 | LGA Exec | Variant | ≥70% overlap; reduces state mandate → LGA mandate; adds JAAC, supervisory councillors |
| `lga-vice-chairman` | VN-POL-010 | LGA Exec (2) | Variant | ≥80% overlap with lga-chairman; adds joint-ticket pairing |
| `ward-councillor` | VN-POL-008 | Ward Legislative | Variant | ≥70% overlap; smallest geography; reduces budget tools to ward-scale |
| `presidential-candidate` | VN-POL-017 | Federal Exec | Standalone | <70% overlap with governor — national scope, 6-zone map, running-mate pair, diaspora outreach make this structurally distinct enough to classify as standalone within the family |
| `assembly-speaker` | VN-POL-012 | State Legislative (presiding) | Standalone | <70% overlap — institutional role (speaker's rulings, order papers) vs. constituency role |

**Shared core capability (all NF-POL-ELC members):**
- 4-page mkPage structure: Home (profile + CTA) / Campaign-or-Projects / About (mandate + bio) / Contact (constituency + WhatsApp)
- Mode switch: `campaign` / `incumbent` / `post_office`
- INEC Certificate of Return display (or SIEC for LGA/ward)
- Geography tier badge (Ward / LGA / State / Federal / National)
- Party affiliation badge (APC / PDP / LP / NNPP / etc.)
- WhatsApp constituency hotline CTA
- Constituency map display (ward boundary / LGA boundary / state boundary / federal constituency)
- FSM states: `seeded` → `claimed` → `candidate` → `elected` → `in_office` → `post_office`
- Trust signals: official portrait, certificate of return reference, gazette number, oath of office date

**Differentiators by variant:**

| Feature | Ward Councillor | LGA Chairman | HASM | Governor | Deputy Gov | Reps Member | Senator | Presidential |
|---|---|---|---|---|---|---|---|---|
| Geography scope | 1 ward | 1 LGA (11 areas) | 1 state constituency | Full state | Full state | 1 federal constituency | 1 senatorial district (3 LGAs) | National (6 zones) |
| Budget display | Ward allocation | JAAC monthly | CDF tracker | State budget dashboard | Deputy portfolio budget | CDF tracker | UDSS allocations | Federal budget overview |
| Committee/Cabinet | Ward council session | Supervisory councillors | HOA committee | Cabinet (commissioners) | Assigned portfolio | NASS Reps committee | Senate committee (chair?) | FEC (if incumbent) |
| Bill/Legislative | Council motions | Council resolutions | State bills (HB prefix) | Assents to state bills | N/A | Federal bills (HB prefix) | Senate bills (SB prefix) | Federal legislative agenda |
| Running mate | No | Yes (Vice Chair) | No | Yes (Deputy Gov) | Paired display | No | No | Yes (VP) |
| Zone coverage | Single ward | LGA (774 count) | State (993 seats) | State (36 govs) | State | Federal constituency (360) | Senatorial district (109) | 6-zone national |

---

## FAMILY 2: NF-POL-APT — Appointed Political Officials

**Anchor:** `state-commissioner` (VN-POL-018, P2)
**Rationale for anchor choice:** State commissioners are the most numerous class of appointed officials with a clear public communication mandate; the commissioner portfolio template establishes the pattern that federal minister and general appointee inherit from.

**Family members:**

| Role | VN-ID | Scope | Status | Relationship to Anchor |
|---|---|---|---|---|
| `state-commissioner` | VN-POL-018 | State | **Anchor** | — |
| `federal-minister` | VN-POL-019 | Federal | Variant | ≥80% overlap; scales portfolio from state → federal; adds Senate screening reference; FEC memos |
| `political-appointee` | VN-POL-020 | State or Federal | Variant | ≥75% overlap; generalizes portfolio to parastatal/board/advisory; removes ministerial cabinet framing |
| `supervisory-councillor` | VN-POL-021 | LGA | Variant | ≥75% overlap; LGA-scale version of commissioner; same portfolio-based structure at smallest tier |

**Shared core capability (all NF-POL-APT members):**
- 4-page mkPage structure: Home (profile + portfolio) / Portfolio (sector news + projects) / About (mandate + CV) / Contact (ministry/agency + WhatsApp)
- **No campaign mode** — appointed, not elected; lifecycle is `appointment` → `in_office` → `redeployment` → `exit`
- Appointing authority display (President / Governor / LGA Chairman)
- Portfolio sector badge (Education / Health / Finance / Works / Agriculture / etc.)
- Ministry/Agency name and acronym
- Press briefing archive
- Policy announcements
- No electoral mandate trust signals (no certificate of return; appointment letter reference instead)
- **Distinction from NF-POL-ELC:** No constituency, no campaign mode, no INEC reference; accountability is to the appointing authority, not voters

**Differentiators by variant:**

| Feature | Supervisory Councillor | State Commissioner | Federal Minister | Political Appointee |
|---|---|---|---|---|
| Appointing authority | LGA Chairman | Governor | President (+ Senate screening) | President / Governor |
| Screening body | None | State HOA | Senate (Section 147) | None typically |
| Portfolio scope | LGA department | State ministry | Federal ministry | Parastatal / board / advisory |
| Budget reference | LGA departmental vote | State ministry budget | MTEF allocation | Agency budget |
| Performance target | Ward service delivery | State MDG/SDG sector targets | National sector targets | Agency mandate KPIs |
| Gazette reference | LGA gazette | State gazette | Federal gazette | Instrument of appointment |

---

## FAMILY 3: NF-POL-PTY — Party Sub-National Structure

**Anchor:** `party-chapter-officer` (VN-POL-022, P2)
**Rationale for anchor choice:** Ward and LGA level party officers represent the largest volume (167,000+ positions across 18 parties × 8,809 wards + 774 LGAs); establishing the chapter-level template first creates the pattern that state officers inherit.

**Family members:**

| Role | VN-ID | Level | Status | Relationship to Anchor |
|---|---|---|---|---|
| `party-chapter-officer` | VN-POL-022 | Ward / LGA | **Anchor** | — |
| `party-state-officer` | VN-POL-023 | State | Variant | ≥80% overlap; scales party structure from ward/LGA → state chapter; adds state congress machinery |

**Relationship to existing `political-party` (VN-POL-002):**
- `political-party` = the national party organization (entity type: organization)
- `party-chapter-officer` = the individual holding a position in a ward/LGA chapter (entity type: individual)
- `party-state-officer` = the individual holding a position in a state chapter (entity type: individual)

These three entries form a **cross-family hierarchy** (national org → state individual → ward/LGA individual) but `political-party` is **not** in the NF-POL-PTY family because it predates this structure and is an organization entity, not an individual. The PTY family covers only individual officers.

**Shared core capability (all NF-POL-PTY members):**
- 4-page mkPage structure: Home (officer profile + chapter) / Chapter (membership, congress schedule) / Activities (ward/LGA events, delegate management) / Contact (WhatsApp chapter line)
- Party identity (logo, colors, acronym — APC / PDP / LP / NNPP / APGA / etc.)
- Chapter geography (ward code / LGA code / state)
- Congress schedule (next ward/LGA/state congress date)
- Delegate count (for primaries and national conventions)
- Member mobilization CTA
- Party card display
- INEC party registration number reference (for the party, linked through party affiliation)
- No electoral mandate — internal party role

**Differentiators:**

| Feature | Party Chapter Officer (Ward/LGA) | Party State Officer |
|---|---|---|
| Geography | Ward boundary or LGA | Full state |
| Congress | Ward congress / LGA congress | State congress |
| Primary management | Local ward primaries | Governorship + state HOA primaries |
| Delegate allocation | Ward/LGA delegate to state | State delegates to national convention |
| Secretariat | Ward contact / LGA secretariat | State party secretariat address |
| National linkage | Reports to LGA → state structure | Reports to national HQ |

---

## Standalone Niches Within Politics Category

Two proposed niches do not fit cleanly into any of the three families:

### `presidential-candidate` (VN-POL-017) — Standalone within NF-POL-ELC
Classified as NF-POL-ELC family member (all elected-office shared capability applies) but designated **standalone** within the family because:
- National mandate scope diverges from all other members (6-geopolitical-zone reach vs. state/LGA/ward)
- Running-mate structure (VP prominence) has no parallel in other templates
- INEC presidential compliance (Form CF001) is categorically different from state/LGA SIEC compliance
- Revenue tier is an order of magnitude above all other political roles

### `assembly-speaker` (VN-POL-012) — Standalone within NF-POL-ELC
Classified as NF-POL-ELC family member (holds an underlying elected constituency seat) but designated **standalone** because:
- Institutional presiding-officer role (speaker's rulings, order papers, committee of whole house) diverges from constituency-focused template
- Represents an institution (the House) as much as an individual constituency
- Campaign mode covers the underlying HOA constituency seat (same as HASM); incumbent mode covers the speakership — this dual-mandate makes it structurally different enough to need its own template specialization

---

## Implementation Order

Based on family anchors and priority scores:

| Priority | Niche | Family Role | Score |
|---|---|---|---|
| 1 | `governor` | NF-POL-ELC anchor | 42 — P1 |
| 2 | `senator` | NF-POL-ELC variant | 40 — P1 |
| 3 | `house-of-reps-member` | NF-POL-ELC variant | 40 — P1 |
| 4 | `state-commissioner` | NF-POL-APT anchor | 37 — P2 |
| 5 | `lga-chairman` | NF-POL-ELC variant | 39 — P2 |
| 6 | `house-of-assembly-member` | NF-POL-ELC variant | 39 — P2 |
| 7 | `federal-minister` | NF-POL-APT variant | 39 — P2 |
| 8 | `party-chapter-officer` | NF-POL-PTY anchor | 35 — P2 |
| 9+ | All remaining variants | Various | 31–37 — P2 |

> **Family build rule:** Anchors must be implemented before variants. The three P1 niches are all NF-POL-ELC variants of `governor`. Therefore `governor` (the anchor) must be built first, even though senator and house-of-reps-member also score P1. Once the governor template is established, senator and house-of-reps-member can be derived rapidly.

---

*End of Family Structure — Produced 2026-04-26*
