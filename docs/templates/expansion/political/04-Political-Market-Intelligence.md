# WebWaka OS — Political Role-Specific Market Intelligence

**Status:** RESEARCH — Informing Expansion Decisions
**Date:** 2026-04-26
**Parent:** `docs/templates/expansion/political/00-Political-Master-Blueprint.md`
**Scope:** Nigeria political market research — seat counts, election cycles, digital readiness, revenue sizing, and strategic context per role

---

## 1. Market Overview

Nigeria operates a **three-tier federal system** with elected governance at ward, LGA, state, and federal levels. This creates one of Africa's largest political officeholder markets — estimated at **20,000+ concurrent active officeholders** at any given time, expanding to **200,000+** during election campaigns when all candidates are included.

The political SaaS market in Nigeria is almost entirely unaddressed. The closest analog — Nigerian political campaign websites — are typically one-off custom builds costing ₦150,000–₦2,000,000 per site with no ongoing management infrastructure. WebWaka can capture this market at a fraction of the cost with superior tooling.

### 1.1 Total Addressable Market (TAM) by Role

| Role | Active Officeholders | Active Candidates (election year) | Total TAM Accounts |
|---|---|---|---|
| Ward Councillor | ~8,809 | ~88,000 (avg 10 candidates/seat) | ~96,809 |
| LGA Chairman | 774 | ~7,740 (avg 10/LGA) | ~8,514 |
| LGA Vice Chairman | 774 | ~7,740 | ~8,514 |
| Supervisory Councillor | ~3,870 | N/A (appointed) | ~3,870 |
| House of Assembly Member | 993 | ~9,930 (avg 10/seat) | ~10,923 |
| Speaker of HOA | 36 (+ 36 deputies) | ~72 | ~144 |
| Governor | 36 | ~360 (avg 10 serious candidates) | ~396 |
| Deputy Governor | 36 | ~360 (running mates) | ~396 |
| House of Reps Member | 360 | ~3,600 (avg 10/seat) | ~3,960 |
| Senator | 109 | ~1,090 (avg 10/seat) | ~1,199 |
| Presidential Candidate | 1 (incumbent) | ~15 serious | ~16 |
| State Commissioner | ~720 | N/A (appointed) | ~720 |
| Federal Minister | ~48 | N/A (appointed) | ~48 |
| Political Appointee (gen.) | ~2,000 | N/A (appointed) | ~2,000 |
| Party Chapter Officer | ~158,562 | N/A (internal election) | ~158,562 |
| Party State Officer | ~9,720 | N/A (internal election) | ~9,720 |
| **TOTAL** | **~186,000** | **~118,907** | **~305,791** |

> **Note:** TAM figures cover all 18 INEC-registered political parties. Serviceable Addressable Market (SAM) is estimated at 10–15% of TAM in Year 1 — approximately 30,000–46,000 accounts — based on WebWaka's current market reach.

---

## 2. Election Cycle Calendar

Understanding the election cycle is critical for marketing timing and template feature prioritization. Nigerian elections run on staggered cycles:

### Federal / State Elections (INEC managed)
| Election Type | Typical Cycle | Last Major Election | Next Expected |
|---|---|---|---|
| Presidential + Governorship + Reps + Senate | Every 4 years | March 2023 | February 2027 |
| State supplementary / off-cycle | Ad hoc | Various 2023–2025 | Ongoing |
| Governorship (off-cycle states: Kogi, Bayelsa, Imo, Edo, Ondo) | 2023, 2024, 2028 | Nov 2024 | 2028 |
| Anambra (off-cycle) | Annually | Nov 2025 | Nov 2029 |

### LGA / Ward Elections (SIEC managed)
| State | Typical LGA Election Cycle | Notes |
|---|---|---|
| Lagos | Every 3 years | LASICOM-managed; often controversial |
| Rivers | Every 3 years | RSIEC |
| Kano | Every 3 years | KANSIEC |
| FCT | Every 4 years | AIEC |
| (All other states) | 3 years (typical) | 36 SIECs each with own calendar |

**Key insight:** LGA elections are staggered across 36 states — there are always some LGA elections happening. This means the `lga-chairman` and `ward-councillor` niches have **evergreen demand** unlike the 4-year federal cycle.

### Party Internal Elections
| Activity | Frequency | Notes |
|---|---|---|
| Ward congress | As needed (pre-primaries) | ~8,809 wards × 18 parties |
| LGA congress | Pre-primaries | ~774 LGAs |
| State congress | Pre-state elections | Major surge in years before state elections |
| National convention | Every 4 years (INEC compliance) | APC/PDP hold massive national conventions |

---

## 3. Digital Readiness by Role

Digital readiness measures the likelihood that a politician in this role will actively adopt and maintain a WebWaka site.

| Role | Digital Readiness Score | Evidence |
|---|---|---|
| Presidential Candidate | 9/10 | Full digital war rooms; ₦100M+ digital spend in 2023 elections |
| Governor (incumbent) | 9/10 | All 36 governors have active social media; state SIOC digital departments |
| Federal Minister | 8/10 | Active Twitter/X; official ministry website + personal profile |
| Senator | 8/10 | 109 senators; most have Twitter/X, Instagram, Facebook; legislative tracking platforms like NASS Tracker exist |
| House of Reps Member | 8/10 | 360 members; high social media activity; CDF accountability demand growing |
| Deputy Governor | 8/10 | State-wide visibility; staff support |
| Assembly Speaker | 7/10 | Institutional comms; HOA press unit |
| House of Assembly Member | 7/10 | Increasingly digital; constituency WhatsApp groups ubiquitous |
| State Commissioner | 7/10 | Ministry comms unit; press briefings |
| Party State Officer | 7/10 | State-level visibility; party secretariat support |
| LGA Chairman | 7/10 | Variable; urban LGAs (Lagos, Abuja, Port Harcourt) much higher |
| LGA Vice Chairman | 6/10 | Generally supported by chairman's infrastructure |
| Political Appointee (gen.) | 7/10 | Agency websites exist; personal profiles less common |
| Ward Councillor | 6/10 | WhatsApp-first; website adoption growing especially in urban wards |
| Party Chapter Officer | 5/10 | Mixed; party chapter social media groups common; website adoption lower |
| Supervisory Councillor | 5/10 | Lowest adoption; rural LGA challenge |

---

## 4. Revenue Sizing

### Pricing Model (Proposed)

| Role Tier | Monthly Price | Rationale |
|---|---|---|
| Presidential / Governor | ₦300,000–₦500,000 | Dedicated onboarding; state-grade features; custom domain |
| Senator / Federal Minister | ₦80,000–₦150,000 | Federal profile; committee tracking; full feature set |
| House of Reps / Senator (base) | ₦40,000–₦80,000 | Full template; NASS committee; CDF tracker |
| HASM / State Commissioner | ₦25,000–₦60,000 | State-level features |
| LGA Chairman | ₦20,000–₦40,000 | JAAC display; project tracker |
| Ward Councillor / Party State | ₦5,000–₦20,000 | Core template; WhatsApp CTA; basic project log |
| Party Chapter Officer | ₦3,000–₦10,000 | Chapter template; congress schedule |

### Revenue Scenario (Year 1 Conservative — 5% SAM penetration)

| Role | Accounts | Avg Monthly | Monthly ARR |
|---|---|---|---|
| Governor | 18 (50% of 36) | ₦400,000 | ₦7,200,000 |
| Senator | 22 (20% of 109) | ₦100,000 | ₦2,200,000 |
| House of Reps Member | 36 (10% of 360) | ₦60,000 | ₦2,160,000 |
| Federal Minister | 10 (20% of 48) | ₦120,000 | ₦1,200,000 |
| HASM | 100 (10% of 993) | ₦35,000 | ₦3,500,000 |
| State Commissioner | 72 (10% of 720) | ₦40,000 | ₦2,880,000 |
| LGA Chairman | 77 (10% of 774) | ₦25,000 | ₦1,925,000 |
| Other roles combined | ~500 | ₦15,000 avg | ₦7,500,000 |
| **TOTAL** | **~835 accounts** | — | **₦28,565,000/month** |

**Year 1 annual revenue potential at 5% SAM penetration: ~₦343,000,000 (~$214,000 USD)**

At 15% SAM penetration (realistic by Year 3): **~₦1,030,000,000/month** (~$643,000 USD/month)

---

## 5. Political Trust Signal Requirements

Trust signals are the credentials and proof-of-authenticity signals that constituents and voters require to trust a political page. Each role has a distinct trust signal set.

| Role | Primary Trust Signal | Secondary Signals |
|---|---|---|
| Ward Councillor | INEC/SIEC ward code | Party logo; ward boundary map; known ward name |
| LGA Chairman | SIEC certificate of return | LGA seal; JAAC allocation public record |
| HASM | INEC certificate of return | State HOA membership list; constituency code |
| Governor | INEC certificate of return | State government gazette; Council of State membership |
| Deputy Governor | INEC joint-ticket return | Governor pairing |
| House of Reps Member | INEC certificate of return | NASS membership list; NASS committee assignment |
| Senator | INEC certificate of return | "Distinguished Senator" title; NASS Senate register |
| Presidential Candidate | INEC Form CF001 | Party nomination certificate; FEC (if incumbent) |
| State Commissioner | Gubernatorial appointment letter | State HOA screening confirmation; state gazette |
| Federal Minister | Presidential appointment letter | Senate screening vote; Federal Gazette |
| Political Appointee | Appointment letter | Agency official letterhead; CAC registration of agency |
| Party Chapter Officer | Party card number | Ward/LGA congress resolution; INEC party reg. number |
| Party State Officer | State congress resolution | State party secretariat contact |

---

## 6. Competitive Landscape

### Existing Digital Solutions for Nigerian Politicians

| Solution | Description | Gap |
|---|---|---|
| Custom campaign websites (₦150K–₦2M) | One-off builds by agencies | No ongoing management; no lifecycle mode; expires after election |
| Facebook Page | Free; widely used | No website; no project tracker; platform-dependent |
| Instagram Profile | Free; widely used | No website; no legislative record |
| Twitter / X Profile | Free; widely used | No website; no accountability tool |
| WordPress (generic) | ₦20K–₦80K setup | Generic; no Nigeria-specific political features; no mode split |
| Nigerian political news sites (Channels, Punch) | Media; not self-operated | Not a personal site |

**WebWaka's differentiation:** Niche-specific templates with Candidate/Incumbent/Post-Office mode switching; integrated WhatsApp CTA; Nigeria-first trust signals (INEC reference, Certificate of Return display); constituency project tracker; affordable monthly subscription vs. expensive custom builds.

---

## 7. Strategic Segments — Prioritized by Market Opportunity

### Segment A: High-Value, Manageable Scale (Best first targets)
- **Governor** — 36 tenants; high willingness to pay; state comms budgets; dedicated staff
- **Senator** — 109 tenants; federal visibility; legislative accountability demand growing
- **Federal Minister** — 48 tenants; high profile; ministry comms infrastructure

### Segment B: Volume Play (Largest addressable market)
- **House of Assembly Member** — 993 seats; growing demand for accountability tools; entry price point
- **House of Reps Member** — 360 seats; CDF accountability pressure increasing
- **LGA Chairman** — 774 seats; evergreen LGA election cycle

### Segment C: Future Growth (Party structure + ward level)
- **Party Chapter Officer** — 167,000+ positions; lowest ARPU but massive volume
- **Ward Councillor** — 8,809 seats; lowest individual value but broadest grassroots penetration

### Recommended Go-to-Market Sequence
1. Launch **Governor** template — use as flagship; government house launches drive credibility
2. Expand to **Senator + Reps Member** — NASS-level credibility expands B2B political market
3. Add **State Commissioner + Federal Minister** — appointed officials through governor relationships
4. Expand downward — **HASM → LGA Chairman → Ward Councillor** — using state-level credibility
5. Activate **Party structure** — APC/PDP state HQ partnership to bulk-onboard chapter officers

---

*End of Market Intelligence — Produced 2026-04-26*
