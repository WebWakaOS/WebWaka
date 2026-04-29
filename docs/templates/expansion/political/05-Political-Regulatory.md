# WebWaka OS — Political Role-Specific Regulatory Landscape

**Status:** RESEARCH — Informing Expansion Decisions
**Date:** 2026-04-26
**Parent:** `docs/templates/expansion/political/00-Political-Master-Blueprint.md`
**Scope:** INEC, SIEC, and all compliance gates per political role

---

## Regulatory Framework Overview

Nigeria's political regulatory landscape spans:
- **INEC** (Independent National Electoral Commission) — federal and state elections
- **36 SIECs** (State Independent Electoral Commissions) — LGA and ward elections
- **Constitutional provisions** (CFRN 1999 as amended) — qualification, tenure, recall
- **Electoral Act 2022** — campaign financing, candidate requirements, election procedures
- **Political Parties' constitutions** — internal party rules and congress procedures
- **Freedom of Information Act 2011** — public disclosure requirements for officeholders

Unlike most professional niches, political roles do **not** have sector-specific operating licenses. The primary credential is the **Certificate of Return** (elected) or **Letter of Appointment** (appointed), both of which are public documents. This makes the regulatory gate simpler than healthcare or financial services — but it creates its own challenges around claim verification.

---

## KYC Tier Reference (Political Adaptation)

| Tier | Political Meaning | Verification Method |
|---|---|---|
| **Tier 1** | Identity verified; political affiliation self-declared | BVN + NIN + party card number |
| **Tier 2** | Self-declared political status; certificate of return or appointment letter uploaded (unverified) | Document upload + OCR |
| **Tier 3** | Certificate of return or appointment letter verified against INEC/SIEC public records | INEC database cross-check |
| **Tier 4** | Full institutional standing — gazette reference verified; NASS membership confirmed | NASS/SGF database integration |

---

## SECTION 1 — ELECTED OFFICIALS: WARD / LGA LEVEL (SIEC)

### `ward-councillor` — Ward Councillor

| Requirement | Body | KYC Tier |
|---|---|---|
| Certificate of Return (ward council) | State Independent Electoral Commission (SIEC) | Tier 2 (upload) / Tier 3 (verified) |
| Ward code (INEC ward boundary register) | INEC | Tier 1 (self-declared) |
| Party affiliation card | Registered political party | Tier 1 |

**Compliance display requirements on template:**
- SIEC certificate of return number (optional at Tier 2; required at Tier 3)
- Ward name and ward code (INEC format: State-LGA-Ward)
- LGA parent name
- Party affiliation badge

**Feature gates:**
- Constituent petition form → requires Tier 2 minimum
- Council session schedule → Tier 1 sufficient
- Ward project tracker → Tier 1 sufficient (self-reported)

**Campaign-phase compliance notes:**
- Electoral Act 2022 Section 88: campaign materials must carry candidate name and address
- During campaign phase, INEC-issued voter card (candidate) is sufficient proof
- "Candidate" mode requires no certificate of return (not yet issued)

---

### `lga-chairman` — LGA Chairman

| Requirement | Body | KYC Tier |
|---|---|---|
| Certificate of Return (LGA chairmanship) | SIEC (state-specific) | Tier 2 (upload) / Tier 3 (verified) |
| LGA administrative code | Federal Ministry of Finance (JAAC reference) | Tier 1 |
| Ministry of Local Government endorsement | State Ministry of Local Government | Tier 2 |
| JAAC membership confirmation | Joint Account Allocation Committee | Tier 3 (for JAAC display feature) |

**Compliance display requirements on template:**
- SIEC certificate of return number
- Full LGA name (from official 774 LGA list)
- LGA code (9-digit UBEC/LGEA standard)
- State parent
- Ministry of Local Government gazette reference (if available)

**Feature gates:**
- JAAC monthly allocation display → requires Tier 3 (JAAC public data + LGA chairman verification)
- Supervisory councillor cabinet listing → Tier 2 minimum
- LGA budget dashboard → Tier 3 (verified LGA chairman status)
- Constituent complaint form → Tier 1

**Regulatory complexity note:** SIECs vary considerably in documentation quality across 36 states. Lagos (LASICOM), Rivers (RSIEC), and FCT (AIEC) have the most digitized records. Several northern states issue paper certificates only. WebWaka should maintain a SIEC-by-state database for verification routing.

---

### `lga-vice-chairman` — LGA Vice Chairman

| Requirement | Body | KYC Tier |
|---|---|---|
| Joint Certificate of Return (with chairman) | SIEC | Tier 2 |
| Chairman pairing reference | Self-declared (verifiable against chairman's record) | Tier 1 |

**Notes:** Vice chairman's certificate of return is typically on the same instrument as the chairman's. Verification follows the same chain. The joint-ticket pairing display requires both parties to have active WebWaka accounts for full feature access.

---

## SECTION 2 — ELECTED OFFICIALS: STATE LEVEL (INEC)

### `house-of-assembly-member` — State House of Assembly Member

| Requirement | Body | KYC Tier |
|---|---|---|
| INEC Certificate of Return (State HOA) | INEC | Tier 2 (upload) / Tier 3 (INEC database) |
| State constituency code | INEC | Tier 1 |
| State HOA membership register | Clerk of the House | Tier 3 (for committee display feature) |

**Compliance display requirements:**
- INEC certificate of return reference
- State HOA constituency name and code
- State name and HOA seat count reference
- Party badge (APC / PDP / LP / etc.)

**Feature gates:**
- HOA committee assignment → Tier 3 (HOA register verification)
- Bill tracker → Tier 2 (self-reported bill titles); Tier 3 for verified bill status from Hansard
- CDF project tracker → Tier 2 (self-reported)
- Constituency petition form → Tier 1

**Electoral Act 2022 compliance:**
- Section 115: HASM candidates must be INEC-registered
- Disqualification grounds (Section 109 CFRN): criminal conviction, bankruptcy, foreign citizenship — WebWaka template should not display any content implying legal standing without verified certificate of return

---

### `assembly-speaker` — Speaker of State House of Assembly

| Requirement | Body | KYC Tier |
|---|---|---|
| INEC Certificate of Return (underlying HOA seat) | INEC | Tier 2 |
| HOA resolution electing Speaker | HOA clerk | Tier 3 |
| Instrument of office | State Chief Judge (for oath) | Tier 3 |

**Notes:** Speaker status is dual-verified — first the underlying HASM certificate, then the HOA resolution. The speakership can be removed by a simple majority of HASM members; template should reflect current status with appropriate update mechanism.

---

### `governor` — State Governor

| Requirement | Body | KYC Tier |
|---|---|---|
| INEC Certificate of Return (governorship) | INEC | Tier 3 (INEC database) |
| Gazette of assumption of office | State government gazette | Tier 3 |
| Council of State membership | Constitution (automatic on assumption) | Tier 3 |
| RMAFC state allocation public data | Revenue Mobilisation Allocation & Fiscal Commission | Tier 3 (public data — no extra verification) |

**Compliance display requirements:**
- INEC certificate of return reference
- State name and seal
- Official gubernatorial portrait (official photo)
- RMAFC allocation (public data — can be displayed without additional verification)
- Deputy governor pairing
- Oath of office date and Chief Justice who administered

**Feature gates:**
- State budget dashboard → Tier 3 (verified governor status; state budget is a public document)
- Cabinet (commissioner) listing → Tier 2 minimum (self-reported); Tier 3 for verified gazette reference
- Security situation map → Tier 4 (sensitive; requires verified incumbent status + security clearance review by platform — likely excluded)
- Press briefing archive → Tier 2
- RMAFC allocation display → Tier 3 (public data; no extra gate beyond governor verification)

**Constitutional compliance notes:**
- Section 188 CFRN: Impeachment procedure — template must not display governance features for an impeached governor without updated status
- Section 191 CFRN: Deputy governor succession — template should reflect automatic succession if governor is removed/dies/incapacitated
- Maximum 2 terms (Section 182 CFRN) — tenure counter relevant

---

### `deputy-governor` — Deputy Governor

| Requirement | Body | KYC Tier |
|---|---|---|
| INEC Joint Certificate of Return | INEC | Tier 3 |
| Governor pairing | Reference to governor's verified account | Tier 3 |
| Portfolio assignment (if any) | Gubernatorial gazette | Tier 2 (self-declared) |

---

## SECTION 3 — ELECTED OFFICIALS: FEDERAL LEVEL (INEC)

### `house-of-reps-member` — House of Representatives Member

| Requirement | Body | KYC Tier |
|---|---|---|
| INEC Certificate of Return (Reps) | INEC | Tier 3 (INEC database) |
| Federal constituency code | INEC | Tier 1 |
| NASS Reps membership register | Clerk of the House | Tier 3 |
| Committee assignment | NASS Speaker's office | Tier 3 |

**Compliance display requirements:**
- INEC certificate of return reference
- Federal constituency name and INEC code
- NASS membership confirmation
- Party badge

**Feature gates:**
- NASS committee assignment → Tier 3 (NASS register)
- Bill tracker (HB prefix) → Tier 2 (self-reported); Tier 4 for NASS Bills database integration
- CDF project tracker (UBEC/TETFUND/NDDC allocations) → Tier 2 (self-reported); Tier 3 for verified allocation
- Constituent petition form → Tier 1
- NASS plenary schedule → Tier 2 (NASS public calendar)

---

### `senator` — Senator

| Requirement | Body | KYC Tier |
|---|---|---|
| INEC Certificate of Return (Senate) | INEC | Tier 3 (INEC database) |
| Senatorial district code | INEC | Tier 1 |
| Senate membership register | Clerk of the Senate | Tier 3 |
| Senate committee assignment | Senate President's office | Tier 3 |

**Compliance display requirements:**
- INEC certificate of return reference
- Senatorial district name (State + "X" Senatorial District: North/Central/South)
- "Distinguished Senator" honorific (earned on assumption of office)
- Senate membership confirmation
- Party badge

**Feature gates:**
- Senate committee chair/membership → Tier 3 (Senate register)
- Bill tracker (SB prefix) → Tier 2 (self-reported); Tier 4 for Senate Bills database integration
- UDSS/senatorial zone development allocation → Tier 2 (self-reported); Tier 3 for verified zonal allocation
- Ministerial screening record → Tier 3 (public Senate voting record)
- Senate plenary schedule → Tier 2 (NASS public calendar)

---

### `presidential-candidate` — Presidential Candidate / President

| Requirement | Body | KYC Tier |
|---|---|---|
| INEC Form CF001 (presidential candidacy) | INEC | Tier 3 |
| Party nomination certificate | INEC-registered party national HQ | Tier 3 |
| INEC Certificate of Return (if elected) | INEC | Tier 4 |
| FEC membership confirmation (if minister) | SGF Office | Tier 4 |
| Constitution Section 131 compliance | Self-declaration (age ≥35, degree, NYSC/exemption) | Tier 2 |

**Feature gates:**
- Campaign donation CTA → Tier 2 minimum (must comply with Electoral Act 2022 campaign finance provisions — donation cap ₦500M for presidential)
- FEC decision display (if incumbent) → Tier 4
- Aso Rock official presence → Tier 4 (presidential identity must be verified at highest level)

**Campaign Finance Compliance (Electoral Act 2022 Section 88):**
- Presidential campaign spending cap: ₦5,000,000,000 (₦5B)
- Individual donation cap: ₦500,000,000 (₦500M)
- Corporate donation cap: ₦1,000,000,000 (₦1B)
- Any donation CTA on the template must carry the INEC campaign account reference number
- WebWaka should not serve as a donation processing platform for presidential campaigns without specific INEC compliance review

---

## SECTION 4 — APPOINTED OFFICIALS

### `state-commissioner` — State Commissioner

| Requirement | Body | KYC Tier |
|---|---|---|
| Gubernatorial appointment letter | Office of the Governor | Tier 2 (upload) |
| State HOA screening confirmation | Clerk of state HOA | Tier 2 |
| Oath of office | Ministry of Justice (state) | Tier 2 |
| State gazette | State Government Printer | Tier 3 (gazette reference) |

**Notes:** Commissioners do not hold electoral mandates. Their credential is the appointment letter + HOA screening. Campaign Finance Act does not apply. The chief compliance consideration is that a deposed commissioner must be able to update their status easily — WebWaka should implement appointment-withdrawal status updates without requiring full re-verification.

---

### `federal-minister` — Federal Minister

| Requirement | Body | KYC Tier |
|---|---|---|
| Presidential appointment letter | State House (Presidency) | Tier 3 |
| Senate screening vote record | NASS Senate | Tier 3 (public record) |
| Oath of office (SGF-administered) | Secretary to Government of Federation | Tier 3 |
| Federal gazette publication | Federal Government Printer | Tier 3 |

**Feature gates:**
- FEC communiqué reference → Tier 4 (must be verified federal minister with active appointment)
- Budget defence (MTEF) display → Tier 3
- Parastatal/agency oversight list → Tier 2 (self-reported ministry structure)

---

### `political-appointee` — General Political Appointee

| Requirement | Body | KYC Tier |
|---|---|---|
| Appointment letter | Appointing authority (President / Governor) | Tier 2 (upload) |
| Agency/board CAC registration | Corporate Affairs Commission | Tier 1 |
| Instrument of appointment | Appointing authority gazette | Tier 2 |

**Notes:** The catch-all `political-appointee` niche (DGs, board chairs, SSAs) has the lowest compliance burden. The appointment letter is the sole credential. No Senate screening is required for most appointments below ministerial level (except for certain constitutional offices like CBN Governor, INEC Chairman, etc. — these specific offices would require Tier 4 and may not be appropriate for WebWaka templates).

---

## SECTION 5 — PARTY STRUCTURE OFFICERS

### `party-chapter-officer` and `party-state-officer`

| Requirement | Body | KYC Tier |
|---|---|---|
| Party card (current membership) | INEC-registered political party | Tier 1 |
| Ward/LGA/state congress resolution | Party internal | Tier 1 (self-declared) |
| INEC party registration number | INEC (for the party) | Tier 1 |

**Notes:** Internal party officers are not subject to electoral law in the same way as candidates. Their credentials are entirely internal party documents. The primary compliance gate is confirming that the party itself is INEC-registered. WebWaka can display the party's INEC registration number as a trust signal without needing to verify individual officer status.

**Electoral Act 2022 (party congress provisions):**
- Section 84: INEC is empowered to monitor party primaries (governorship, presidential). Ward/LGA congresses that elect chapter officers are party-internal and not directly monitored by INEC.
- Section 85: INEC must be given 21 days' notice of party congresses — this is a party obligation, not an individual officer obligation.

---

## Summary: KYC Tier Requirements

| Role | Minimum KYC Tier | Verified KYC Tier | Notes |
|---|---|---|---|
| Ward Councillor | Tier 1 (campaign) / Tier 2 (incumbent) | Tier 3 | SIEC cert of return |
| LGA Chairman | Tier 2 | Tier 3 | SIEC cert + JAAC gate |
| LGA Vice Chairman | Tier 2 | Tier 3 | Joint with chairman |
| Supervisory Councillor | Tier 1 | Tier 2 | LGA appointment letter |
| House of Assembly Member | Tier 1 (campaign) / Tier 2 (incumbent) | Tier 3 | INEC cert + HOA register |
| Assembly Speaker | Tier 2 | Tier 3 | HOA resolution |
| Governor | Tier 2 | Tier 3 | INEC cert + state gazette |
| Deputy Governor | Tier 2 | Tier 3 | Joint with governor |
| House of Reps Member | Tier 2 | Tier 3 | INEC cert + NASS register |
| Senator | Tier 2 | Tier 3 | INEC cert + Senate register |
| Presidential Candidate | Tier 2 (campaign) | Tier 4 (incumbent) | INEC CF001 → President |
| State Commissioner | Tier 2 | Tier 3 | Gubernatorial appt letter + gazette |
| Federal Minister | Tier 3 | Tier 4 | Senate screening + gazette |
| Political Appointee | Tier 1 | Tier 2 | Appointment letter |
| Party Chapter Officer | Tier 1 | Tier 1 | Party card |
| Party State Officer | Tier 1 | Tier 1 | Congress resolution |

---

*End of Regulatory Landscape — Produced 2026-04-26*
