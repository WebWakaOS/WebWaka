# WebWaka OS — Niche Family Expansion Proposals

**Status:** RESEARCH — Not yet canonical
**Date:** 2026-04-26
**Parent:** `docs/templates/expansion/00-expansion-master-blueprint.md`
**Scope:** New NF-XXX family structures for proposed expansion niches

> **IMPORTANT:** These family proposals are CANDIDATES. They become canonical when the anchor niche is added to the canonical niche registry and CSV. Until then, treat as design intent only.

---

## Governance Rules (Inherited from Existing System)

All existing governance rules from `docs/governance/niche-family-variant-register.md` apply to new families:

1. Each family has exactly **one anchor** niche (first to be built; most general or highest priority)
2. All variants **inherit** the anchor's baseline template with niche-specific overrides
3. Family code format: `NF-[CATEGORY]-[SUFFIX]` where CATEGORY matches the VN-ID category code
4. Family membership drives: shared AI use-case template, shared discovery tag pool, shared feature scaffolding priority, shared branding theme
5. A niche qualifies as a **variant** if ≥70% of its feature set overlaps with the anchor
6. A niche is **standalone** if <70% overlap with any existing family

---

## NEW FAMILIES — HEALTH SECTOR

### NF-HLT-HOS: Hospital Care

**Anchor:** `hospital` (VN-HLT-012, proposed P1)
**Variants:** `diagnostic-lab` (VN-HLT-013, proposed P1), `maternity-clinic` (VN-HLT-016, proposed P2)
**Total members:** 3

**Shared core capability:** Inpatient or complex outpatient medical facility management — patient records, clinical scheduling, MDCN compliance, multi-department coordination, billing.

**Differentiators:**
- `hospital` — full secondary-care facility; wards, surgery, OPD, A&E; NHIA billing; inpatient management; multi-department
- `diagnostic-lab` — test-focused; no inpatient; sample lifecycle; result delivery portal; MLSCN license; doctor referral network
- `maternity-clinic` — women's reproductive health focus; antenatal calendar; EDD tracking; delivery room; NMCN compliance; baby records

**Implementation order:** hospital (anchor, P1) → diagnostic-lab (P1) → maternity-clinic (P2)

**Relationship to existing health families:**
- Distinct from NF-HLT-SPE (specialist outpatient clinics — optician, dental, vet)
- Distinct from NF-HLT-FIT (fitness — gym, sports academy)
- Distinct from NF-HLT-CAR (long-term care — rehab, elderly)
- Complements but does not overlap with `clinic` (standalone, primary care) — hospital is secondary care

---

### NF-HLT-THR: Therapy Services

**Anchor:** `physiotherapy` (VN-HLT-014, proposed P2)
**Variants:** `mental-health` (VN-HLT-015, proposed P2)
**Total members:** 2

**Shared core capability:** Therapeutic clinical services — session booking, treatment plan management, patient progress tracking, regulated professional credentials, recurring appointments.

**Differentiators:**
- `physiotherapy` — physical therapy; exercise programs; mobility assessment; PCN-PT license; home visit scheduling; equipment-based sessions
- `mental-health` — psychological/psychiatric services; confidential booking; session notes; teletherapy integration; MDCN or psychology body registration; crisis resource links

**Implementation order:** physiotherapy (anchor, P2) → mental-health (P2)

**Potential future variants:**
- `occupational-therapy` — workplace injury recovery; employer integration
- `speech-therapy` — children's speech, adult stroke recovery
- `nutritionist-dietitian` — clinical nutrition, meal planning, chronic disease management

---

### NF-HLT-MAT: Maternity & Reproductive Health

**Anchor:** `maternity-clinic` (VN-HLT-016, proposed P2)
**Variants:** *(none initially — potential future variants below)*
**Total members:** 1 (anchor-only family for now)

**Shared core capability:** Women's reproductive health management — antenatal registration, scan scheduling, delivery management, postnatal follow-up, baby records.

**Potential future variants:**
- `fertility-clinic` (IVF/assisted reproduction; GAP-HLT-008)
- `nursing-agency` (home nursing supply; GAP-HLT-007)

**Note:** Starts as a 1-member family (anchor only). Grows into a family once fertility-clinic and nursing-agency candidates are approved.

---

## NEW FAMILIES — EDUCATION SECTOR

### NF-EDU-TER: Tertiary Education

**Anchor:** `university` (VN-EDU-009, proposed P1)
**Variants:** *(none initially)*
**Total members:** 1

**Shared core capability:** Tertiary-level educational institution management — programme catalog, student application portal, result management, faculty directory, alumni.

**Potential future variants:**
- `professional-school` — law school, medical school, business school at graduate level
- `polytechnic` — HND-focused; NBTE regulated; vocational emphasis (may merge here or be a standalone)

**Note:** `university` is so distinct that it anchors its own family even as a single member. The family grows as tertiary variants are canonicalized.

---

### NF-EDU-DIG: Digital Education

**Anchor:** `elearning-platform` (VN-EDU-011, proposed P1)
**Variants:** `tech-academy` (VN-EDU-013, proposed P1)
**Total members:** 2

**Shared core capability:** Online or digitally-delivered education — course catalog, student enrollment with payment gating, instructor profiles, certificate generation, cohort or class management.

**Differentiators:**
- `elearning-platform` — asynchronous self-paced or cohort; video course library; LMS integration; subscription or one-time payment; diverse subject matter
- `tech-academy` — coding/tech-specific; structured bootcamp cohorts; portfolio showcase; employer job placement; alumni success metrics; in-person or hybrid delivery

**Implementation order:** elearning-platform (anchor, P1) → tech-academy (P1)

**Extends existing education families:**
- Distinct from NF-EDU-SCH (school — physical K-12 institution)
- Distinct from NF-EDU-EAR (early childhood)
- Complements `driving-school` and `training-institute` (standalones that serve a different model)

**NF-EDU-SCH extensions (no new family — variants added to existing family):**
- `exam-prep-centre` (VN-EDU-010) → add as a new variant to existing NF-EDU-SCH family
- `tutorial-centre` (VN-EDU-012) → add as a new variant to existing NF-EDU-SCH family

Updated NF-EDU-SCH family:
- **Anchor:** `school` (existing P1)
- **Variants:** `private-school`, `govt-school`, `exam-prep-centre` (new), `tutorial-centre` (new)
- **Total members:** 5 (up from 3)

---

## NEW FAMILIES — FINANCIAL SECTOR

### NF-FIN-REG: Regulated Financial Institutions

**Anchor:** `microfinance-bank` (VN-FIN-008, proposed P2)
**Variants:** `insurance-company` (VN-FIN-009, P2), `pension-fund` (VN-FIN-011, P2), `stockbroker` (VN-FIN-012, P2)
**Total members:** 4

**Shared core capability:** Regulated financial institution management — license compliance display, product/policy catalog, client account management, regulatory reporting framework, KYC compliance.

**Differentiators:**
- `microfinance-bank` — CBN MFB license; loan origination; passbook/account; group lending; CBN prudential returns
- `insurance-company` — NAICOM license; policy catalog; claims management; agent network; reinsurance
- `pension-fund` — PenCom license; RSA management; employer contribution processing; fund NAV display
- `stockbroker` — SEC license; NSE/NASD membership; client portfolio; CSCS integration; trade confirmation

**Implementation order:** microfinance-bank (anchor, most common) → insurance-company → pension-fund → stockbroker

**Note:** These four niches differ significantly in their specific features, but share a common governance template structure: regulated entity disclosure, product catalog, client account portal, and compliance documentation.

---

### NF-FIN-COP: Cooperative Finance

**Anchor:** `credit-union` (VN-FIN-010, proposed P2)
**Variants:** *(none initially)*
**Total members:** 1

**Shared core capability:** Member-based savings and credit cooperative — share capital, member savings, loan processing, dividend computation.

**Relationship to existing families:**
- Distinct from NF-CIV-COM / cooperative (VN-CIV-003) — `cooperative` covers general multi-purpose cooperatives; `credit-union` is a pure financial SACCO focused exclusively on savings and credit
- Complements `savings-group` (VN-FIN-001 — informal thrift/ajo group)

**Potential future variants:**
- `agric-cooperative-union` — farmer financial cooperative with input loans
- `transport-cooperative` — okada/keke rider financial cooperative

---

## NEW FAMILIES — PROFESSIONAL SERVICES

### NF-TEC-AGY: Technology Agency Services

**Anchor:** `software-agency` (VN-PRO-009, proposed P1)
**Variants:** `digital-marketing-agency` (VN-PRO-013, P1), `data-analytics-firm` (VN-TEC-002, P1)
**Total members:** 3

**Shared core capability:** Professional services agency — portfolio showcase, client case studies, team profiles, service package catalog, project inquiry form, client testimonials.

**Differentiators:**
- `software-agency` — technical product delivery; code/app showcase; technology stack; RFP form; GitHub/Behance links; project types (web, mobile, cloud, embedded)
- `digital-marketing-agency` — marketing performance focus; platform expertise (Meta, Google, TikTok); campaign portfolio; social metrics; retainer packages
- `data-analytics-firm` — data/intelligence focus; tool stack (Python, Power BI, Tableau); dashboard demos; case studies with metrics; sector focus (FMCG, banking, government)

**Implementation order:** software-agency (anchor, P1) → digital-marketing-agency (P1) → data-analytics-firm (P1)

**Extends existing technology standalones:**
- `it-support` and `internet-cafe` remain standalone (they are not agency/professional services)
- `cybersecurity-firm` lives in its own family (NF-TEC-SEC) because of specialist regulatory/certification requirements

---

### NF-TEC-SEC: Technology Security

**Anchor:** `cybersecurity-firm` (VN-TEC-001, proposed P1)
**Variants:** *(none initially)*
**Total members:** 1

**Shared core capability:** Security services — certification display, service catalog, compliance framework expertise, incident response, client sectors.

**Potential future variants:**
- `cctv-security-company` — physical CCTV installation and monitoring (currently partially covered by `security-company`; a digital/tech split may be warranted)
- `data-protection-officer-service` — NDPC-compliant DPO-as-a-service

---

### NF-PRO-HR: Human Capital Services

**Anchor:** `recruitment-agency` (VN-PRO-011, proposed P1)
**Variants:** *(none initially)*
**Total members:** 1

**Shared core capability:** People services — job board or talent placement, candidate/employer management, sector specialisation, professional credentials.

**Potential future variants:**
- `hr-consulting` — HR policies, organizational development, training delivery (distinct from recruitment)
- `payroll-services` — outsourced payroll processing, PAYE filing (distinct from both)

---

### NF-PRO-ADV: Advisory & Consulting

**Anchor:** `management-consulting` (VN-PRO-012, proposed P1)
**Variants:** `cac-registration-agent` (VN-PRO-014, P2)
**Total members:** 2

**Shared core capability:** Business advisory services — service menu, credentials/certifications, methodology or process showcase, thought leadership, engagement inquiry.

**Differentiators:**
- `management-consulting` — strategy/ops/finance advisory; senior team credentials; case studies; industry focus; retainer/project billing
- `cac-registration-agent` — transactional compliance service; CAC service menu; document portal; status tracker; fee schedule

**Potential future variants:**
- `financial-advisory-firm` (for HNI/wealth management; distinct from accounting)
- `government-liaison-consultant` (public sector advisory, policy consulting)

---

### NF-PRO-DES: Design & Architecture Professionals

**Anchor:** `architecture-firm` (VN-PRO-010, proposed P2)
**Variants:** *(none initially)*
**Total members:** 1

**Shared core capability:** Design professional services — project portfolio with visuals, professional credentials, client brief submission, project phases.

**Potential future variants:**
- `interior-designer` — residential and commercial interior design (individual or firm)
- `landscape-architect` — outdoor design, parks, private gardens
- `industrial-designer` — product design, packaging design

---

## NEW FAMILIES — HOSPITALITY

### NF-HSP-ACM: Hospitality Accommodation

**Anchor:** `vacation-rental` (VN-HSP-003, proposed P2)
**Variants:** `resort` (VN-HSP-002, P2), `student-hostel` (VN-PRP-003, P2)
**Total members:** 3

**Shared core capability:** Accommodation facility management — property listings, availability calendar, booking management, guest/resident management, pricing tiers.

**Differentiators:**
- `vacation-rental` — short-let portfolio; multi-property; dynamic pricing; Airbnb-adjacent; guest communication; housekeeping schedule
- `resort` — premium leisure destination; activity packages; day-use; event hosting; restaurant; higher price point; eco-tourism
- `student-hostel` — academic-term accommodation; student verification; caution deposit; LGA/university proximity; house rules

**Note:** `hotel` (VN-ACM-001, existing standalone) should be evaluated for migration into this family as anchor in a future governance revision. For now it remains standalone to avoid disrupting existing implementation.

---

### NF-HSP-ENT: Hospitality Entertainment

**Anchor:** `bar-lounge` (VN-HSP-001, proposed P2)
**Variants:** *(none initially)*
**Total members:** 1

**Shared core capability:** Licensed entertainment venue — drinks/entertainment menu, event calendar, reservation, ambiance showcase.

**Potential future variants:**
- `nightclub` — if bar-lounge anchor is insufficient for nightclub-specific needs (DJ calendar, entry fees, age verification enforcement)
- `cinema` — film screening schedules, seat booking, concessions
- `amusement-park` — ride/attraction booking, group packages, safety compliance

---

## NEW FAMILIES — PROPERTY MANAGEMENT

### NF-PRP-SVC: Property Services

**Anchor:** `coworking-space` (VN-PRP-001, proposed P1)
**Variants:** `property-management` (VN-PRP-002, P2), `student-hostel` (VN-PRP-003, P2)
**Total members:** 3

**Shared core capability:** Space operations — space/unit catalog, occupancy management, client/tenant management, payment/billing, maintenance.

**Differentiators:**
- `coworking-space` — shared workspace; hot-desk + office booking; daily/monthly billing; member community; meeting rooms; amenity display
- `property-management` — landlord-tenant operations; rent collection; maintenance requests; property portfolio; landlord statements; ESVARBON
- `student-hostel` — academic-term occupancy; student verification; caution deposit; house rules; utility billing; school-calendar alignment

**Note:** `student-hostel` cross-listed in both NF-HSP-ACM (as accommodation variant) and NF-PRP-SVC (as property service). Final family assignment is determined by the dominant business model of the canonical anchor when formally registered. In most cases, student hostels function as property operations (NF-PRP-SVC) more than tourism accommodation.

---

## NEW FAMILIES — WELLNESS

### NF-WEL-STU: Wellness Studio

**Anchor:** `yoga-studio` (VN-WEL-001, proposed P2)
**Variants:** *(none initially)*
**Total members:** 1

**Shared core capability:** Group wellness practice — class schedule, instructor profiles, membership/drop-in, online integration, community.

**Potential future variants:**
- `dance-studio` — dance classes, performance booking, recitals
- `meditation-centre` — mindfulness programs, retreats, individual sessions
- `swimming-pool` — lane booking, swimming lessons, membership

---

### NF-WEL-ALT: Alternative & Traditional Health

**Anchor:** `traditional-medicine` (VN-WEL-002, proposed P2)
**Variants:** `health-food-store` (VN-WEL-003, P2)
**Total members:** 2

**Shared core capability:** Non-MDCN health and wellness products/services — NAFDAC compliance, product catalog, condition-based browsing, consultation booking.

**Differentiators:**
- `traditional-medicine` — practitioner-led; remedy catalog; consultation; NAFDAC-registered herbal products; Traditional Medicine Board; holistic approach
- `health-food-store` — retail-focused; supplement catalog; NAFDAC numbers per product; subscription boxes; nutritional advice

**Potential future variants:**
- `chiropractor` — spine/joint specialist (imported specialty growing in Nigeria)
- `aromatherapy` — essential oils retail + therapy

---

## NEW FAMILIES — COMMERCE

### NF-COM-RET: General Retail

**Anchor:** `electronics-store` (VN-COM-001, proposed P1)
**Variants:** `jewellery-shop` (VN-COM-002, P2), `baby-shop` (VN-COM-003, P2), `cosmetics-shop` (VN-COM-004, P2), `thrift-store` (VN-COM-005, P2)
**Total members:** 5

**Shared core capability:** Retail store — product catalog, pricing, payment, customer management, brand partnerships, online/physical integration.

**Differentiators:**
- `electronics-store` — tech products; brand partnerships; warranty; trade-in; after-sales; specs comparison
- `jewellery-shop` — high-value items; custom design; authenticity; layaway; wedding sets; goldsmith showcase
- `baby-shop` — age-stage catalog; baby registry; NAFDAC compliance; subscription consumables
- `cosmetics-shop` — NAFDAC per product; shade/skin-tone matching; fragrance notes; beauty category navigation
- `thrift-store` — condition grading; Instagram integration; bale/bundle sales; drop dates; size guide

**Implementation order:** electronics-store (anchor, P1) → cosmetics-shop (P2) → baby-shop (P2) → jewellery-shop (P2) → thrift-store (P2)

---

## Updated Existing Family Extensions

### Extend NF-EDU-SCH (existing family)

**Current members:** `school` (anchor), `private-school`, `govt-school`
**Proposed additions:** `exam-prep-centre`, `tutorial-centre`
**New total members:** 5

### Extend NF-FDS (existing family — Food Service)

**Current members:** `restaurant` (anchor), `food-vendor`, `catering`, `bakery`, `restaurant-chain`
**Proposed addition:** `food-court`
**New total members:** 6

---

## New Family Summary Table

| Family Code | Family Name | Anchor | Members | Status |
|---|---|---|---|---|
| NF-HLT-HOS | Hospital Care | `hospital` | 3 | Candidate |
| NF-HLT-THR | Therapy Services | `physiotherapy` | 2 | Candidate |
| NF-HLT-MAT | Maternity | `maternity-clinic` | 1 | Candidate |
| NF-EDU-TER | Tertiary Education | `university` | 1 | Candidate |
| NF-EDU-DIG | Digital Education | `elearning-platform` | 2 | Candidate |
| NF-FIN-REG | Regulated Finance | `microfinance-bank` | 4 | Candidate |
| NF-FIN-COP | Cooperative Finance | `credit-union` | 1 | Candidate |
| NF-TEC-AGY | Technology Agency | `software-agency` | 3 | Candidate |
| NF-TEC-SEC | Technology Security | `cybersecurity-firm` | 1 | Candidate |
| NF-PRO-HR | Human Capital | `recruitment-agency` | 1 | Candidate |
| NF-PRO-ADV | Advisory & Consulting | `management-consulting` | 2 | Candidate |
| NF-PRO-DES | Design Professionals | `architecture-firm` | 1 | Candidate |
| NF-HSP-ACM | Hospitality Accommodation | `vacation-rental` | 3 | Candidate |
| NF-HSP-ENT | Hospitality Entertainment | `bar-lounge` | 1 | Candidate |
| NF-PRP-SVC | Property Services | `coworking-space` | 3 | Candidate |
| NF-WEL-STU | Wellness Studio | `yoga-studio` | 1 | Candidate |
| NF-WEL-ALT | Alternative Health | `traditional-medicine` | 2 | Candidate |
| NF-COM-RET | General Retail | `electronics-store` | 5 | Candidate |

**Total new candidate families: 18**
**Total existing families extended: 2** (NF-EDU-SCH, NF-FDS)

---

*Produced: 2026-04-26 — Deep Research & Expansion Design Phase*
*Families become canonical when anchor niche is formally added to CSV + governance registry.*
