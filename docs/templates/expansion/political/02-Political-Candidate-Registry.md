# WebWaka OS — Political Role-Specific Candidate Registry

**Status:** RESEARCH — Not yet canonical
**Date:** 2026-04-26
**Parent:** `docs/templates/expansion/political/00-Political-Master-Blueprint.md`
**Scope:** 16 proposed political role-specific niches with scoring, proposed VN-IDs, and governance metadata

> **IMPORTANT:** Entries in this document are CANDIDATES — not yet canonical. A niche becomes canonical when it is:
> 1. Added to `infra/db/seeds/0004_verticals-master.csv` (status=planned)
> 2. Assigned a confirmed VN-ID
> 3. Added to `docs/governance/canonical-niche-registry.md`
> No template implementation may begin until those three steps are complete.

---

## Scoring Rubric

| Dimension | Description | Score |
|---|---|---|
| **Nigeria Market Density (NMD)** | Volume of this officeholder type in Nigeria | 0–10 |
| **Digital Readiness (DR)** | Readiness of this class of politician to adopt SaaS | 0–10 |
| **Template Differentiation (TD)** | How distinct template needs are from existing `politician` / `ward-rep` | 0–10 |
| **Regulatory Simplicity (RS)** | Inverse of regulatory complexity — 10=simple, 0=very complex | 0–10 |
| **Revenue Potential (RP)** | Estimated SaaS revenue per tenant × market density | 0–10 |
| **TOTAL** | Sum of above | 0–50 |

**Priority tiers:**
- ≥ 40: P1 — Add to next canonical expansion sprint
- 30–39: P2 — Add to following sprint
- 20–29: P3 — Medium backlog
- < 20: Defer

---

## PROPOSED CATEGORY: POLITICS — ELECTED OFFICES (TIER 1–2: WARD / LGA)

---

### VN-POL-008 (proposed) | `ward-councillor` | Ward Councillor

| Dimension | Score | Notes |
|---|---|---|
| NMD | 9 | ~8,809 elected ward councillors per election cycle; multiplied by candidates contesting |
| DR | 6 | Ward-level politicians increasingly on WhatsApp/Facebook; limited website adoption but growing |
| TD | 8 | Distinct from `ward-rep` — this is specifically the legislative arm (council chamber) with: ward boundary, council session log, ward development project tracker, committee assignments |
| RS | 9 | SIEC election; no complex licensing; certificate of return is sufficient credential |
| RP | 5 | Lower income tier; ₦5,000–₦20,000/month realistic; large volume compensates |
| **TOTAL** | **37** | **P2** |

- **Entity type:** individual
- **Proposed family:** NF-POL-ELC (anchor at LGA level)
- **Regulatory gate:** SIEC Certificate of Return; ward code from INEC ward boundary register
- **Mode split:**
  - `campaign`: ward boundary map, manifesto bullet points, WhatsApp volunteer line, candidate bio, party flag
  - `incumbent`: ward council session dates, ward development projects (with status), constituency office address, constituent complaint form
  - `post_office`: ward legacy, community projects delivered, next candidacy announcement
- **Core template needs:** Ward boundary display, council committee membership, ward project tracker, constituent WhatsApp CTA, party affiliation badge, INEC ward code display
- **Discovery tags:** ward councillor, councillor, ward council, ward representative, ward committee, ward chairman, ward seat, local council, LGA councillor
- **Nigeria context:** Ward councillors are the most numerous elected officials in Nigeria. They are often the first point of political contact for ordinary Nigerians. The role is legislative — they sit in the ward/LGA council chamber, not the executive chair. Distinguishing this from the LGA Chairman (executive) is constitutionally important.
- **Differentiation from `ward-rep`:** `ward-rep` is a generic "ward representative" that could include informal community leaders; `ward-councillor` is specifically the SIEC-elected legislative representative with a certificate of return. The legislative/executive distinction is the key differentiator.
- **Pillar classification:** branding (Pillar 2) primary; ops (Pillar 1) secondary (constituent case management)

---

### VN-POL-009 (proposed) | `lga-chairman` | Local Government Area Chairman

| Dimension | Score | Notes |
|---|---|---|
| NMD | 8 | 774 LGA chairmen + multiple candidates per LGA per election = ~3,000–5,000 active accounts |
| DR | 7 | LGA chairmen are increasingly media-savvy; most have staff who can manage digital tools |
| TD | 9 | Distinct from all existing templates — executive authority; LGA budget disclosure; council appointment; project delivery; LGSC relations; statutory obligations |
| RS | 8 | SIEC election; INEC coordination; JAAC (Joint Account Allocation Committee) membership is public |
| RP | 7 | ₦20,000–₦50,000/month; significant local budget = higher willingness to pay |
| **TOTAL** | **39** | **P2** (borderline P1) |

- **Entity type:** individual
- **Proposed family:** NF-POL-ELC (variant)
- **Regulatory gate:** SIEC Certificate of Return; LGA Administrative code; Ministry of Local Government letter of approval
- **Mode split:**
  - `campaign`: LGA-wide manifesto, 11-point platform (matching 11 LGA functional areas), ward coverage tracker, running-mate profile, donation CTA
  - `incumbent`: LGA budget transparency, council session schedule, JAAC allocation display, project delivery by ward, cabinet (supervisory councillors) listing, statutory annual performance report link
  - `post_office`: legacy projects, chairmanship memoir, successor endorsement, foundation launch
- **Core template needs:** 774 LGA selector (verifiable LGA identity), ward-level project delivery matrix, JAAC allocation display, supervisory councillor cabinet listing, LGA functional area coverage (primary health care, markets, roads, sanitation, etc.)
- **Discovery tags:** LGA chairman, local government chairman, council chairman, chairman LCDA, local government area head, executive chairman, LGA boss, chairman elect
- **Nigeria context:** The LGA Chairman is Nigeria's most powerful local executive. Controls LGA budget (JAAC monthly allotments), appoints supervisory councillors, superintends primary healthcare, local roads, markets, and sanitation. 774 LGAs; some states have created additional LCDAs. The chairman's public presence is critical for accountability — monthly JAAC receipts and expenditure are constitutionally public.
- **Pillar classification:** branding (Pillar 2) + ops (Pillar 1) — project delivery management is a natural ops extension

---

### VN-POL-010 (proposed) | `lga-vice-chairman` | Local Government Area Vice Chairman

| Dimension | Score | Notes |
|---|---|---|
| NMD | 7 | 774 vice chairmen; elected on joint ticket with chairman |
| DR | 6 | Generally lower digital activity than chairman; often serves committee/portfolio roles |
| TD | 6 | Variant of `lga-chairman` — joint ticket origin, succession obligation, often holds portfolio (education, health, women affairs) at LGA level |
| RS | 9 | Same SIEC election as chairman; joint ticket certificate of return |
| RP | 5 | ₦10,000–₦30,000/month; lower than chairman |
| **TOTAL** | **33** | **P2** |

- **Entity type:** individual
- **Proposed family:** NF-POL-ELC (variant of lga-chairman)
- **Regulatory gate:** SIEC joint-ticket Certificate of Return
- **Mode split:** Same as chairman but with vice-chair-specific framing; campaign page profiles as running mate; incumbent page shows assigned committee/portfolio
- **Core template needs:** Joint ticket display (chairman + vice chairman pairing), assigned portfolio/committee, succession protocol note, LGA parent reference
- **Discovery tags:** vice chairman, LGA vice chairman, deputy chairman local government, running mate local, joint ticket

---

## PROPOSED CATEGORY: POLITICS — ELECTED OFFICES (TIER 3: STATE)

---

### VN-POL-011 (proposed) | `house-of-assembly-member` | House of Assembly Member (HASM)

| Dimension | Score | Notes |
|---|---|---|
| NMD | 8 | 993 seats across 36 state houses of assembly; plus candidates contesting each seat |
| DR | 7 | HASMs are increasingly active on social media; many have comms aides |
| TD | 9 | Fully distinct — state constituency map, House of Assembly committee assignments, bills sponsored/co-sponsored, constituency development fund (CDF) tracker, state legislative session schedule |
| RS | 8 | INEC Certificate of Return (state governorship election cycle); no additional licensing |
| RP | 7 | ₦25,000–₦60,000/month; state-level salary + allowances = higher willingness to pay |
| **TOTAL** | **39** | **P2** (borderline P1) |

- **Entity type:** individual
- **Proposed family:** NF-POL-ELC (variant)
- **Regulatory gate:** INEC Certificate of Return (state constituency); state house of assembly registration
- **Mode split:**
  - `campaign`: state constituency map, manifesto, party flag, campaign schedule, endorsements
  - `incumbent`: constituency map, committee assignment(s), bills sponsored (title + status), CDF projects by LGA/ward, constituency service days, house of assembly voting record summary
  - `post_office`: legislative legacy, bills enacted, next election announcement or career pivot
- **Core template needs:** State constituency boundary display, INEC state code reference, HOA committee listing, bill tracker (title, date sponsored, current reading, status), CDF project tracker with ward allocation, house plenary session schedule
- **Discovery tags:** house of assembly, HASM, state assembly member, state representative, constituency rep, state legislature, state lawmaker, honourable member, state HOA
- **Nigeria context:** Each of Nigeria's 36 states has its own House of Assembly with between 24 (Bayelsa) and 40 (Kogi) seats. HASMs are critical for state legislation, state budget approval, and constituency intervention. The CDF (Constituency Development Fund) — distributed to each HASM — is a major accountability touchpoint. Many HASMs have graduated to governorship or Reps membership.
- **Pillar classification:** branding (Pillar 2) primary; ops future — bill tracking, CDF project management

---

### VN-POL-012 (proposed) | `assembly-speaker` | Speaker / Deputy Speaker, State House of Assembly

| Dimension | Score | Notes |
|---|---|---|
| NMD | 4 | 36 speakers + 36 deputy speakers = 72 seats; small market |
| DR | 7 | Speakers have full institutional comms apparatus |
| TD | 7 | Institutional presiding role — distinct from ordinary HASM; needs: legislative session schedule, speaker's rulings log, committee of whole house, institutional press briefings |
| RS | 8 | Elected by HASM peers; INEC Certificate of Return covers the underlying constituency seat |
| RP | 8 | ₦40,000–₦100,000/month; institutional budget + personal comms |
| **TOTAL** | **34** | **P2** |

- **Entity type:** individual
- **Proposed family:** NF-POL-ELC (standalone — institutional presiding role)
- **Mode split:** campaign (for underlying constituency seat) / presiding-officer (institutional speaker role — separate mode from incumbent)
- **Core template needs:** Speaker's gavel emblem, House session calendar, speaker's communiqués, legislative agenda, order papers, Rules of the House reference

---

### VN-POL-013 (proposed) | `governor` | State Governor

| Dimension | Score | Notes |
|---|---|---|
| NMD | 6 | 36 governors + multiple serious candidates per state per election = ~200–300 active accounts |
| DR | 9 | Governors are among Nigeria's most digitally active political actors; dedicated digital comms teams |
| TD | 10 | Completely distinct from any existing template — state executive authority; state budget; council of state; security council; state wide mandate across all 3 tiers (state / LGA / ward); ministerial cabinet (commissioners) |
| RS | 7 | INEC gubernatorial Certificate of Return; Constitutional oath of office; RMAFC state allocation display; state audit report |
| RP | 10 | ₦200,000–₦500,000/month; state communications budgets are substantial |
| **TOTAL** | **42** | **P1** |

- **Entity type:** individual
- **Proposed family:** NF-POL-ELC (anchor — highest state elected office)
- **Regulatory gate:** INEC Certificate of Return (gubernatorial); Governor's gazette of assumption; state Ministry of Justice oath of office record
- **Mode split:**
  - `campaign`: state-wide manifesto (4-year plan by sector); running-mate profile; 6-geopolitical-zone campaign schedule; fundraising/donor CTA; endorsements; APC/PDP flag prominent
  - `incumbent`: state budget dashboard (monthly RMAFC allocation; capital vs. recurrent; sector breakdown); cabinet (commissioners + SAs) listing; ongoing state projects by LGA; press briefing archive; security situation map; council of state next meeting; state development plan progress
  - `post_office`: administration legacy, implemented projects archive, post-governorship foundation or next-office platform
- **Core template needs:** State-wide project map (ward-level delivery), RMAFC state allotment display, commissioner cabinet grid, security advisory panel reference, state budget transparency dashboard, official state government gazette link, INEC gubernatorial reference number
- **Discovery tags:** governor, state governor, executive governor, his excellency, government house, state house, governorship, chief executive state, Nigerian governor
- **Nigeria context:** Nigeria's 36 governors control state budgets averaging ₦100B–₦2T annually. They command state executive power across all sectors — education, health, infrastructure, security, judiciary. The governor template is the highest-value single-tenant political niche. Unlike the presidency, there are enough governors to constitute a viable market segment.
- **Pillar classification:** branding (Pillar 2) + ops (Pillar 1) — cabinet management, project pipeline, press briefing system

---

### VN-POL-014 (proposed) | `deputy-governor` | Deputy Governor

| Dimension | Score | Notes |
|---|---|---|
| NMD | 5 | 36 deputy governors + running mates during campaigns |
| DR | 8 | Deputy governors are increasingly digital; often handle specific sectoral portfolios |
| TD | 7 | Running-mate dynamics during campaign; succession protocol; often given a portfolio (education, SDGs, women's development) in incumbent phase; distinct from governor but shares state context |
| RS | 8 | INEC joint-ticket Certificate of Return |
| RP | 8 | ₦80,000–₦200,000/month; joint communications team with governor |
| **TOTAL** | **36** | **P2** |

- **Entity type:** individual
- **Proposed family:** NF-POL-ELC (variant of governor)
- **Mode split:**
  - `campaign`: running-mate profile page; "The Team" duo display with governor; portfolio pitch
  - `incumbent`: assigned portfolio activities, SDG / women's development / education tracker, deputy state house schedule, succession protocol display
- **Core template needs:** Governor / Deputy Governor joint display, assigned portfolio (sector) indicator, succession note (Section 191 CFRN reference)

---

## PROPOSED CATEGORY: POLITICS — ELECTED OFFICES (TIER 4: FEDERAL)

---

### VN-POL-015 (proposed) | `house-of-reps-member` | House of Representatives Member

| Dimension | Score | Notes |
|---|---|---|
| NMD | 7 | 360 Reps seats; 3–10+ candidates per seat; ~2,000–4,000 active accounts |
| DR | 8 | Federal legislators are highly digital; professional comms infrastructure |
| TD | 9 | Federal constituency map (geographically defined by INEC); NASS committee assignments; bills; CDF (Constituency Development Fund from UBEC/TETFUND/NDDC by zone); federal mandate |
| RS | 8 | INEC Certificate of Return (Reps); NASS registration |
| RP | 8 | ₦40,000–₦100,000/month; federal legislative salary + allowances |
| **TOTAL** | **40** | **P1** |

- **Entity type:** individual
- **Proposed family:** NF-POL-ELC (variant — federal legislative)
- **Regulatory gate:** INEC Certificate of Return (House of Representatives constituency); NASS principal officers' register
- **Mode split:**
  - `campaign`: federal constituency map, manifesto, INEC candidacy details, party flag, endorsements, campaign schedule (town halls by LGA)
  - `incumbent`: NASS committee membership, bills sponsored + status (1st/2nd/3rd reading, enacted), CDF projects by LGA, constituency town hall schedule, federal constituency constituent petition form, NASS session calendar, oversight visits log
  - `post_office`: legislative legacy, bills enacted, next office announcement
- **Core template needs:** Federal constituency boundary display, INEC Reps constituency code, NASS committee list, bill tracker (title / reading stage / date), CDF allocation tracker (UBEC / TETFUND / NDDC / other), petitions log, NASS session calendar
- **Discovery tags:** house of representatives member, reps member, house reps, federal representative, honourable member reps, NASS member, NASS Reps, federal legislator, Abuja representative
- **Nigeria context:** Nigeria's 360-seat House of Reps is elected on federal constituency basis. Each member represents a defined federal constituency (typically matching 1–3 LGAs). Members sit on NASS joint committees, receive constituency allocations through multiple intervention agencies (UBEC, TETFUND, NDDC where applicable, NCDMB), and are individually accountable for CDF projects. The gap between public expectation and actual project delivery is a major trust issue — a structured project tracker is a powerful accountability tool.

---

### VN-POL-016 (proposed) | `senator` | Senator

| Dimension | Score | Notes |
|---|---|---|
| NMD | 6 | 109 senators (3/state + FCT senator) + candidates; high-profile, small count |
| DR | 8 | Senators are highly digital; dedicated media aides and digital communications teams |
| TD | 9 | Senate-specific: senatorial district (1–3 LGAs each depending on state), Senate committee chairmanships, screening of ministers/ambassadors, constitutional oversight, NDDC/UBEC/TETFUND by senatorial district, Distinguished Senator title |
| RS | 8 | INEC Certificate of Return (Senate); Senate principal officers registration |
| RP | 9 | ₦60,000–₦150,000/month; highest federal legislative salary + allowances |
| **TOTAL** | **40** | **P1** |

- **Entity type:** individual
- **Proposed family:** NF-POL-ELC (variant — federal upper chamber)
- **Regulatory gate:** INEC Certificate of Return (senatorial district); Senate registration
- **Mode split:**
  - `campaign`: senatorial district map (3 LGAs typical), manifesto, campaign schedule, endorsements, Distinguished Senator pledge
  - `incumbent`: Senate committee chair/membership, bills sponsored (Senate bills — prefix SB), motions moved, UDSS (senatorial zone development project tracker), ministerial screening record, oversight committee findings, senate session schedule
  - `post_office`: legislative legacy, SBs enacted into law, next office
- **Core template needs:** Senatorial district map (showing all 3 constituent LGAs), INEC senatorial code, Senate committee chair badge (if applicable), bill tracker (SB prefix, reading stage, committee referral), UDSS project tracker, motion/resolution log
- **Discovery tags:** senator, Nigerian senator, distinguished senator, senate, senatorial district, upper chamber NASS, red chamber, federal senator
- **Nigeria context:** Senators occupy the upper chamber of NASS. They represent senatorial districts (3 per state), making them more regionally prominent than Reps members. Senate committee chairmanships are powerful — finance, appropriations, petroleum, and judiciary committees set national policy. Senators also screen ministerial and ambassador nominees. The UDSS (senatorial zone development allocation) is a major constituency accountability touchpoint.

---

### VN-POL-017 (proposed) | `presidential-candidate` | Presidential Candidate / President of Nigeria

| Dimension | Score | Notes |
|---|---|---|
| NMD | 3 | 5–15 serious presidential candidates per election cycle; incumbent president = 1 |
| DR | 9 | Presidential campaigns are Nigeria's most digitally intensive political events; full-scale digital war rooms |
| TD | 10 | Completely unique — national mandate; all 6 geopolitical zones; running-mate profile; INEC Form CF001; national policy manifesto by sector; presidential debate schedule; diaspora outreach; APC/PDP national HQ coordination |
| RS | 5 | INEC presidential regulations (CFR Section 131, CFRN); campaign finance disclosures; INEC Form CF001 compliance; party nomination primary compliance |
| RP | 10 | ₦500,000–₦2,000,000/month per serious campaign; highest single-ticket political revenue in Nigeria |
| **TOTAL** | **37** | **P2** |

- **Entity type:** individual
- **Proposed family:** NF-POL-ELC (standalone — presidential tier; no family member shares its scope)
- **Regulatory gate:** INEC Form CF001 (presidential candidacy declaration); party nomination certificate; INEC Certificate of Return (if elected)
- **Mode split:**
  - `campaign`: 6-zone rally schedule; running-mate duo profile ("the ticket"); sector manifesto (economy/security/education/health/energy/agriculture); diaspora outreach CTA; party presidential primary results; endorsements from state governors; polling data (if party-approved); INEC candidacy declaration reference
  - `incumbent`: Aso Rock official presence; cabinet (FEC) composition; FEC decisions digest; RMAFC federal allocation display; state of the nation address archive; security briefing communiqués; ECOWAS/AU engagements; presidential directives log
  - `post_office`: presidential library, administration legacy, post-presidency foundation
- **Core template needs:** 6-geopolitical-zone map with rally count, INEC Form CF001 reference number, running-mate profile card, sector manifesto with progress indicators, presidential polling widget, diaspora outreach map (UK/US/Canada/UAE coverage), presidential media archive
- **Discovery tags:** presidential candidate, President of Nigeria, Aso Rock, Nigeria president, presidential campaign, PDP presidential, APC presidential, Nigerian presidency, presidential ticket

---

## PROPOSED CATEGORY: POLITICS — APPOINTED OFFICES

---

### VN-POL-018 (proposed) | `state-commissioner` | State Commissioner

| Dimension | Score | Notes |
|---|---|---|
| NMD | 7 | ~720 state commissioners (avg 20/state × 36 states) + senior special assistants |
| DR | 7 | Commissioners increasingly have dedicated press/comms aides; social media active |
| TD | 8 | Portfolio-specific content (sector news, ministry projects, press briefings, MDAs under portfolio); ministerial accountability without electoral mandate; distinct from elected officials |
| RS | 9 | Gubernatorial appointment letter; no separate licensing; state assembly screening required |
| RP | 6 | ₦20,000–₦60,000/month; government salary + comms budget |
| **TOTAL** | **37** | **P2** |

- **Entity type:** individual
- **Proposed family:** NF-POL-APT (appointed officials family — anchor)
- **Regulatory gate:** Gubernatorial appointment letter; state house of assembly screening confirmation; oath of office (Ministry of Justice, state)
- **Core template needs:** Portfolio sector badge (Education / Health / Works / Agriculture / etc.); ministry name and acronym; MDAs under portfolio; press briefing archive; policy announcements; ministry budget (if disclosed); sector performance indicators; state government logo/seal; governor's name reference
- **Mode concept:** Appointment-phase vs. In-office (no campaign mode — appointed, not elected); portfolio changes on reassignment
- **Discovery tags:** state commissioner, commissioner for education, commissioner for health, commissioner for works, state government appointee, honourable commissioner, ministry commissioner, state minister Nigeria
- **Nigeria context:** Each of Nigeria's 36 state governors appoints a cabinet of commissioners (equivalent to federal ministers). Each commissioner heads one or more state ministries and is screened by the state House of Assembly. Commissioners often transition to governorship or Reps campaigns. Their public presence needs are distinct from elected officials — they speak for their ministry, not for a constituency.

---

### VN-POL-019 (proposed) | `federal-minister` | Federal Minister / Minister of State

| Dimension | Score | Notes |
|---|---|---|
| NMD | 6 | ~48 full ministers + ~20 ministers of state; high-profile; small count |
| DR | 8 | Federal ministers are highly digital; full media and comms infrastructure |
| TD | 9 | Federal portfolio-specific content (national policy; FEC memos; bilateral meetings; agency oversight; budget defence at NASS); distinct from state commissioner in scope and protocol |
| RS | 7 | Presidential appointment letter; Senate screening (Section 147 CFRN); oath of office (SGF); NASS screening record is public |
| RP | 9 | ₦100,000–₦400,000/month; federal salary scale + comms budget |
| **TOTAL** | **39** | **P2** |

- **Entity type:** individual
- **Proposed family:** NF-POL-APT (variant of state-commissioner at federal level)
- **Regulatory gate:** Presidential appointment letter; Senate screening vote; oath of office (Secretary to Government of Federation); NASS public record of screening
- **Core template needs:** Federal portfolio badge; ministry full name + abbreviation; parastatals/agencies under portfolio; policy white papers; FEC communiqué references; bilateral meetings log; budget defence (annual MTEF) tracker; NASS committee oversight interface; national performance targets by sector
- **Discovery tags:** federal minister, minister Nigeria, minister of state, FMITI, FMOH, FME, minister petroleum, minister finance, federal executive council, FEC member, Aso Rock minister, presidential appointee

---

### VN-POL-020 (proposed) | `political-appointee` | Political Appointee (General — DG/CEO/Board Chair)

| Dimension | Score | Notes |
|---|---|---|
| NMD | 9 | Thousands of board positions, agency DG/CEOs, SA/SSA to president and governors; largest class of appointed officials |
| DR | 7 | Variable; agency DGs typically have institutional comms; board chairs less so |
| TD | 7 | Portfolio-based; institutional authority without direct electoral accountability; agenda-setting for parastatal; different from commissioner (no ministerial cabinet role) |
| RS | 9 | Appointment letter is the primary credential; no licensing beyond CAC (for agency registration) |
| RP | 5 | ₦15,000–₦50,000/month; lower visibility but large volume |
| **TOTAL** | **37** | **P2** |

- **Entity type:** individual
- **Proposed family:** NF-POL-APT (general variant — catch-all for board chairs, DGs, SSAs)
- **Regulatory gate:** Presidential or gubernatorial appointment letter; agency CAC registration (for institutional verification)
- **Core template needs:** Appointing authority (President / Governor of X State) display; institution name and acronym; mandate statement; board/management team (for DG/CEO variant); agenda priorities; institutional achievements; press releases
- **Variants within this niche (mode-driven not slug-driven):**
  - `board-chair` — focuses on board governance, committee structure
  - `dg-ceo` — focuses on agency management, strategic plan, annual report
  - `ssa-sa` — focuses on advisory role, policy memos, outreach
- **Discovery tags:** DG, director general, CEO parastatal, board chairman, board member, presidential appointee, gubernatorial appointee, SSA to president, SA to governor, agency head Nigeria

---

### VN-POL-021 (proposed) | `supervisory-councillor` | Supervisory Councillor

| Dimension | Score | Notes |
|---|---|---|
| NMD | 7 | ~3,870 (774 LGAs × avg 5 supervisory councillors per LGA) |
| DR | 5 | Lower tech adoption; LGA cabinet members often operate informally |
| TD | 6 | LGA executive portfolio holder (education, health, works, market, women affairs at LGA level); similar to state commissioner but at LGA level; no electoral mandate |
| RS | 9 | LGA Chairman appointment letter; no formal screening required at LGA level |
| RP | 4 | ₦5,000–₦20,000/month; lowest in political appointee class |
| **TOTAL** | **31** | **P2** |

- **Entity type:** individual
- **Proposed family:** NF-POL-APT (variant — LGA-level appointed official)
- **Regulatory gate:** LGA Chairman appointment letter
- **Core template needs:** LGA parent reference, assigned portfolio (LGA department), LGA development projects in portfolio, ward-level community events, LGA council meeting participation

---

## PROPOSED CATEGORY: POLITICS — PARTY STRUCTURE

---

### VN-POL-022 (proposed) | `party-chapter-officer` | Party Chapter Officer (Ward / LGA Level)

| Dimension | Score | Notes |
|---|---|---|
| NMD | 10 | 18 registered parties × 8,809 wards + 774 LGAs = ~167,000+ ward and LGA chapter officer positions |
| DR | 5 | Mixed; urban ward chapter officers increasingly digital; rural less so |
| TD | 7 | Party-internal focus distinct from public elected office — member register, ward congress minutes, delegate election management, party subscription dues, event mobilization |
| RS | 9 | INEC party registration (for the party, not individual officers); internal party rules |
| RP | 4 | ₦3,000–₦15,000/month; volume makes this viable; low per-unit price |
| **TOTAL** | **35** | **P2** |

- **Entity type:** individual
- **Proposed family:** NF-POL-PTY (party structure family — anchor at sub-national level)
- **Regulatory gate:** Internal party appointment/congress resolution; INEC party card
- **Core template needs:** Party logo/colors, ward/LGA chapter name and code, party card number display, chapter membership count, ward congress schedule, upcoming elections in ward/LGA, delegate allocation for party primaries, chapter executive committee listing, party subscription status
- **Differentiation from `political-party`:** `political-party` is the national party organization; `party-chapter-officer` is the individual holding a specific position within a ward or LGA chapter of that party — a fundamentally different entity type (individual vs. organization)
- **Discovery tags:** ward party chairman, LGA party chairman, ward party secretary, ward zonal coordinator, party chapter, ward exco, ward executive, party mobilizer, zonal coordinator

---

### VN-POL-023 (proposed) | `party-state-officer` | Party State Officer

| Dimension | Score | Notes |
|---|---|---|
| NMD | 8 | 18 parties × 36 states × ~15 executive committee positions = ~9,720 state party executive slots |
| DR | 7 | State party officers are generally more digitally active than ward-level |
| TD | 7 | State congress; state primary elections management; governorship candidate emergence; delegate management for national convention; state party secretariat |
| RS | 8 | INEC party state structure registration; internal party constitution |
| RP | 6 | ₦15,000–₦40,000/month; state visibility = higher willingness to pay |
| **TOTAL** | **36** | **P2** |

- **Entity type:** individual
- **Proposed family:** NF-POL-PTY (variant of party-chapter-officer at state level)
- **Regulatory gate:** INEC state party structure filing; internal party state congress resolution
- **Core template needs:** State party executive committee roster, state congress calendar, state primary election schedule, delegate list for national convention, governorship candidates emergence timeline, state secretariat address and contacts
- **Differentiation from `political-party`:** `political-party` is the national HQ; `party-state-officer` is the individual officer within a specific state chapter — different geography tier and entity type (individual vs. organization)
- **Discovery tags:** state party chairman, state party secretary, state APC chairman, state PDP chairman, state LP chairman, party state exco, state party chairman Nigeria

---

## Summary Scorecard

| VN-ID | Slug | Score | Priority | Family |
|---|---|---|---|---|
| VN-POL-013 | `governor` | **42** | **P1** | NF-POL-ELC (anchor) |
| VN-POL-015 | `house-of-reps-member` | **40** | **P1** | NF-POL-ELC (variant) |
| VN-POL-016 | `senator` | **40** | **P1** | NF-POL-ELC (variant) |
| VN-POL-009 | `lga-chairman` | 39 | P2 | NF-POL-ELC (variant) |
| VN-POL-011 | `house-of-assembly-member` | 39 | P2 | NF-POL-ELC (variant) |
| VN-POL-019 | `federal-minister` | 39 | P2 | NF-POL-APT (variant) |
| VN-POL-017 | `presidential-candidate` | 37 | P2 | NF-POL-ELC (standalone) |
| VN-POL-018 | `state-commissioner` | 37 | P2 | NF-POL-APT (anchor) |
| VN-POL-020 | `political-appointee` | 37 | P2 | NF-POL-APT (variant) |
| VN-POL-008 | `ward-councillor` | 37 | P2 | NF-POL-ELC (variant) |
| VN-POL-023 | `party-state-officer` | 36 | P2 | NF-POL-PTY (variant) |
| VN-POL-014 | `deputy-governor` | 36 | P2 | NF-POL-ELC (variant) |
| VN-POL-022 | `party-chapter-officer` | 35 | P2 | NF-POL-PTY (anchor) |
| VN-POL-012 | `assembly-speaker` | 34 | P2 | NF-POL-ELC (standalone) |
| VN-POL-010 | `lga-vice-chairman` | 33 | P2 | NF-POL-ELC (variant) |
| VN-POL-021 | `supervisory-councillor` | 31 | P2 | NF-POL-APT (variant) |

**P1 total: 3 candidates** | **P2 total: 13 candidates** | **P3 total: 0** | **Deferred: 0**

---

*End of Candidate Registry — Produced 2026-04-26*
