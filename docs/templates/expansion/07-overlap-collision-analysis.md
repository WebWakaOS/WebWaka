# 07 — Candidate Overlap & Collision Analysis

**Expansion Blueprint | Document 7 of 7**
*Produced: 2026-04-26 — QA Gate: Pre-Promotion Collision Audit*

---

## Purpose

Before any candidate from `02-candidate-niche-registry.md` is promoted to canonical status (CSV row + governance doc update), every proposed VN-ID must be cleared against the existing 160-row `0004_verticals-master.csv`. This document records:

1. The **collision verdict** for each of the 38 candidates (CLEAR / DIFFERENTIATE / MERGE / REJECT)
2. The **rationale** behind each verdict
3. **Internal CSV duplicates** found during the audit that must be resolved before new rows are added
4. A **pre-promotion checklist** for the governance gate

---

## Audit Methodology

Full text of `0004_verticals-master.csv` was compared against all 38 proposed slugs, display names, categories, and subcategories. Collision criteria applied:

| Level | Meaning | Verdict |
|---|---|---|
| **Same slug** | Exact ID conflict | REJECT (hard block) |
| **Same subcategory + same business function** | Functional duplicate | MERGE |
| **Adjacent function, distinguishable template** | Overlap but viable | DIFFERENTIATE |
| **No meaningful overlap** | Clean field | CLEAR |

---

## Section A — Internal CSV Duplicates (Existing Data Quality Issues)

These must be resolved **before** any new rows are added to prevent the duplicate set growing.

### A1. `vtx_gym` vs `vtx_gym_fitness`

| Field | vtx_gym | vtx_gym_fitness |
|---|---|---|
| slug | `gym` | `gym-fitness` |
| display | Gym / Wellness Centre | Gym / Fitness Centre |
| category | health | commerce |
| subcategory | fitness | health-wellness |
| milestone | — | — |

**Finding:** These are functional duplicates. Both represent the same real-world business type. They differ only in the category column assignment (`health` vs `commerce`) and display name phrasing.

**Recommendation:** Merge into a single canonical row. Preferred canonical: **`vtx_gym`** (simpler slug; health category is correct). Deprecate `vtx_gym_fitness`. Before merging, check if any brand has claimed `gym-fitness` in the production database.

---

### A2. `vtx_event_hall` vs `vtx_events_centre`

| Field | vtx_event_hall | vtx_events_centre |
|---|---|---|
| slug | `event-hall` | `events-centre` |
| display | Event Hall / Venue | Events Centre / Hall Rental |
| category | place | place |
| subcategory | events | hospitality |

**Finding:** These describe the same real-world entity — a rentable venue for events. The subcategory (`events` vs `hospitality`) creates a false distinction.

**Recommendation:** Merge into **`vtx_event_hall`** as canonical (alphabetically earlier and more widely used terminology in Nigeria). Deprecate `vtx_events_centre`. Cross-reference with `niche-alias-deprecation-registry.md`.

---

### A3. `vtx_pharmacy` vs `vtx_pharmacy_chain`

| Field | vtx_pharmacy | vtx_pharmacy_chain |
|---|---|---|
| slug | `pharmacy` | `pharmacy-chain` |
| display | Pharmacy / Drug Store | Pharmacy Chain / Drugstore |
| category | health | health |
| subcategory | retail-pharmacy | pharmaceutical |

**Finding:** Intentional split (single outlet vs multi-branch chain). However the template needs are nearly identical; the distinction is handled better by a configuration flag (`is_chain: boolean`) rather than a separate vertical. Confirm intent with the product team before duplicating template work.

**Recommendation:** HOLD — do not merge until product decides if chain-vs-single warrants a separate FSM. If not, collapse and use a `chain_mode` feature flag within `vtx_pharmacy`.

---

## Section B — Collision Verdicts for All 38 Candidates

### HEALTH CATEGORY (VN-HLT-012 to VN-HLT-016)

---

#### VN-HLT-012 | `hospital` | Hospital / Secondary Healthcare

**Nearest existing:** `vtx_clinic` (Clinic / Healthcare Facility, health, primary-care)

**Analysis:** `vtx_clinic` is explicitly scoped to **primary care** (GP consultations, basic procedures). A hospital is secondary/tertiary care — it requires inpatient beds, theatre booking, department directory (A&E, Maternity, ICU), specialist consultant rosters, admission workflows, and NHIS/HMO billing. The template surface area is fundamentally different.

**Verdict: CLEAR** — Proceed. `hospital` is a distinct niche from `clinic`. The VN-HLT-012 ID is safe (no HLT series past VN-HLT-011 in the existing universe).

---

#### VN-HLT-013 | `diagnostic-lab` | Medical / Diagnostic Laboratory

**Nearest existing:** `vtx_clinic` (primary care)

**Analysis:** A diagnostic lab has no clinical consultation function. Its template centers on test catalog, sample collection scheduling, result delivery (online/WhatsApp), HMO panel membership, and accreditation display. This is architecturally distinct from a clinic.

**Verdict: CLEAR** — Proceed.

---

#### VN-HLT-014 | `physiotherapy` | Physiotherapy / Occupational Therapy Clinic

**Nearest existing:** `vtx_clinic` (primary care), `vtx_gym` (fitness)

**Analysis:** Physiotherapy is a regulated health profession (MRPN — Medical Rehabilitation Therapists Registration Board of Nigeria). Its template needs (condition-based appointment booking, session packages, home visit scheduling, equipment rental) are distinct from both a general clinic and a gym.

**Verdict: CLEAR** — Proceed. Flag that MRPN verification must be part of FSM states.

---

#### VN-HLT-015 | `mental-health` | Mental Health / Counselling Centre

**Nearest existing:** `vtx_rehab_centre` (Rehabilitation / Recovery Centre, health, **mental-health**)

**Analysis:** ⚠️ HIGH COLLISION. The existing `vtx_rehab_centre` has subcategory literally set to `mental-health`. However, in clinical practice these are distinct:

- **Rehabilitation centre:** inpatient/residential facility primarily for substance abuse recovery, physical rehabilitation, or post-surgical recovery. Nigerian context: NDLEA-adjacent, Ministry of Health approval required.
- **Mental health / counselling centre:** outpatient therapy, psychiatry clinics, psychological counselling, CBT/DBT sessions, employee wellness programmes. Regulated by MDCN (medical) and TRCN-adjacent bodies.

**Verdict: DIFFERENTIATE** — Proceed, but **rename `vtx_rehab_centre` subcategory** from `mental-health` to `rehabilitation` to eliminate the false labelling. Document this correction in `niche-alias-deprecation-registry.md`. The proposed `mental-health` vertical is genuinely distinct.

**Action required:** Update `vtx_rehab_centre` subcategory in CSV from `mental-health` → `rehabilitation` before promoting VN-HLT-015.

---

#### VN-HLT-016 | `maternity-clinic` | Maternity / Birthing Centre

**Nearest existing:** `vtx_clinic` (primary care)

**Analysis:** Maternity centres in Nigeria are often standalone facilities separate from general clinics. Their template needs are unique: antenatal booking calendar, delivery package pricing (normal vs C-section), newborn screening checklist, postnatal care programmes, NHIS/HMO birth coverage. 

**Verdict: CLEAR** — Proceed.

---

### EDUCATION CATEGORY (VN-EDU-009 to VN-EDU-013)

---

#### VN-EDU-009 | `university` | University / Polytechnic

**Nearest existing:** `vtx_school` (School / Educational Institution, education, formal-school), `vtx_training_institute` (vocational)

**Analysis:** `vtx_school` covers primary and secondary education. A university/polytechnic operates at a fundamentally different level: faculty and department directory, course catalog with JAMB requirements, undergraduate/postgraduate admission cycle, hostel booking, NUC/NBTE accreditation display, alumni portal, research and grants. No collision at template level.

**Verdict: CLEAR** — Proceed.

---

#### VN-EDU-010 | `exam-prep-centre` | Exam Preparation Centre (JAMB/WAEC/IELTS)

**Nearest existing:** `vtx_school` (formal school), `vtx_training_institute` (vocational)

**Analysis:** Exam prep centres are a uniquely important Nigerian niche — the JAMB CBT ecosystem alone supports thousands of centres. Their template needs (past question library, JAMB mock test booking, per-subject tutors, score prediction, school recommendation by UTME score) have no overlap with a general school or vocational training institute.

**Verdict: CLEAR** — Proceed. High commercial priority.

---

#### VN-EDU-011 | `elearning-platform` | E-Learning / Online Education Platform

**Nearest existing:** `vtx_school`, `vtx_training_institute`, `vtx_creator` (Creator / Influencer)

**Analysis:** An e-learning platform is a digital-native business: course catalog, video lessons, quizzes, certificates, cohort management, subscription pricing, affiliate programme. None of the existing verticals have this template surface. `vtx_creator` is individual-facing; this is an organization operating a platform.

**Verdict: CLEAR** — Proceed.

---

#### VN-EDU-012 | `tutorial-centre` | Tutorial / Group Lesson Centre

**Nearest existing:** `vtx_school` (formal school), `vtx_training_institute` (vocational)

**Analysis:** Tutorial centres serve primary-to-SS3 students with supplementary lessons. They are distinct from formal schools (no WAEC/NECO registration authority; no uniform mandate) and from vocational training (no trades/skills focus). Template needs: subject+class level timetable, tutor profiles, past question bank, trial lesson booking.

**Verdict: CLEAR** — Proceed (note lower priority: P2 score 38).

---

#### VN-EDU-013 | `tech-academy` | Technology / Coding Academy

**Nearest existing:** `vtx_training_institute` (Training Institute / Vocational School, education, vocational)

**Analysis:** `vtx_training_institute` is a broad vocational category (could be tailoring school, driving school, plumbing training, etc.). A tech academy is a distinct segment: cohort-based bootcamps, curriculum tracks (frontend, backend, data, product design), hiring partner network, job placement rate display, alumni outcomes, monthly instalment payments, scholarship portal. The Nigerian tech academy market (Decagon, AltSchool, Semicolon, etc.) has a very specific template language.

**Verdict: DIFFERENTIATE** — Proceed. When seeding, add a note to `vtx_training_institute` that it explicitly excludes digital/coding academies (those go to `tech-academy`). Update `vertical-niche-master-map.md` accordingly.

---

### FINANCIAL CATEGORY (VN-FIN-008 to VN-FIN-012)

---

#### VN-FIN-008 | `microfinance-bank` | Microfinance Bank

**Nearest existing:** `vtx_savings_group` (Thrift / Ajo / Esusu Group, financial, informal-finance)

**Analysis:** `vtx_savings_group` is informal finance — no CBN regulation, no NDIC coverage. A microfinance bank is CBN-licensed, NDIC-insured, with formal loan products, MSME credit, group lending, and KYC Tier 2+. The template needs are completely different (loan calculator, CBN licence display, NDIC membership badge, mobile banking, branch network).

**Verdict: CLEAR** — Proceed.

---

#### VN-FIN-009 | `insurance-company` | Insurance Underwriter

**Nearest existing:** `vtx_insurance_agent` (Insurance Agent / Broker, financial, insurance)

**Analysis:** This is an important distinction in Nigeria's financial sector. An **agent/broker** (existing) intermediates between clients and underwriters — template needs: policy comparison, provider logos, claim referral. An **underwriter** (proposed) is the actual insurance company holding risk — template needs: product catalog with policy wordings, NAICOM licence display, claims portal, actuarial rating tools, reinsurance information, bancassurance partnerships. Fundamentally different regulatory tier (NAICOM Class A licence vs agent registration).

**Verdict: CLEAR** — Proceed. Document the agent↔underwriter distinction in the vertical taxonomy glossary.

---

#### VN-FIN-010 | `credit-union` | Credit Union / SACCO / Cooperative Finance

**Nearest existing:** `vtx_cooperative` (Cooperative Society, civic, cooperative), `vtx_savings_group` (informal finance)

**Analysis:** `vtx_cooperative` is a general cooperative society (could be agricultural, consumer, producer). A credit union/SACCO is specifically a financial cooperative — member deposits, loans at below-market rates, share capital, CBN/NDIC-lite regulation (under Cooperative Societies Decree). Its template needs (member ledger, loan application, share account, AGM notices) overlap partially with `vtx_cooperative` but are financial-product-centric.

**Verdict: DIFFERENTIATE** — Proceed. Add a note to `vtx_cooperative` excluding financial cooperatives (credit unions/SACCOs go to `credit-union`). The distinction matters for the `required_kyc_tier` and FSM states.

---

#### VN-FIN-011 | `pension-fund` | Pension Fund Administrator (PFA)

**Nearest existing:** No direct match.

**Analysis:** PFAs are heavily regulated by PenCom. This is a niche but high-value vertical — Nigeria has 22 licensed PFAs managing ₦18+ trillion in RSA assets. Template needs: RSA balance lookup, contribution history, retirement benefit calculator, online complaints portal, PenCom compliance display. No existing vertical touches this space.

**Verdict: CLEAR** — Proceed.

---

#### VN-FIN-012 | `stockbroker` | Stockbroker / Securities Dealer

**Nearest existing:** No direct match.

**Analysis:** SEC-registered dealing members of the NGX. Template needs: equity research, stock quotes widget, trading account opening, SEC/NGX licence display, investor education content, market commentary. No existing vertical covers capital markets.

**Verdict: CLEAR** — Proceed.

---

### PROFESSIONAL SERVICES CATEGORY (VN-PRO-009 to VN-PRO-014)

---

#### VN-PRO-009 | `software-agency` | Software / App Development Agency

**Nearest existing:** `vtx_it_support` (IT Support / Computer Repair, professional, technology)

**Analysis:** `vtx_it_support` covers break-fix IT services and hardware repair — a service and maintenance play. A software agency is a project-and-product play: custom web/mobile application development, portfolio showcases, technology stack display, project scoping tools, developer team profiles, case studies with metrics. The distinction is fundamental (reactive maintenance vs proactive build). No overlap at the template level.

**Verdict: CLEAR** — Proceed.

---

#### VN-PRO-010 | `architecture-firm` | Architecture / Interior Design Firm

**Nearest existing:** `vtx_construction` (Construction Firm / Contractor, commerce, construction), `vtx_property_developer` (Property Developer)

**Analysis:** Architecture firms are design-led (ARCON-registered), not construction contractors. Their template needs (project portfolio with renders, ARCON licence display, design typology, concept presentation, client briefing forms) differ completely from a construction firm (which needs BOQ, materials sourcing, project timeline management). No meaningful overlap.

**Verdict: CLEAR** — Proceed.

---

#### VN-PRO-011 | `recruitment-agency` | HR / Recruitment Agency

**Nearest existing:** `vtx_professional` (Professional — Lawyer/Doctor/Accountant)

**Analysis:** `vtx_professional` covers licensed individual professionals, not recruitment organizations. A recruitment agency is a B2B service: job listings, candidate database, employer onboarding, placement fee structure, sector specialization display, psychometric testing partnership. No overlap.

**Verdict: CLEAR** — Proceed.

---

#### VN-PRO-012 | `management-consulting` | Management Consulting Firm

**Nearest existing:** `vtx_professional` (licensed professional individual), `vtx_advertising_agency` (media/marketing)

**Analysis:** Management consulting has no direct match. Its template needs (service line display, methodology showcase, client sectors, thought leadership/white papers, RFP response portal, associate network) are distinct. `vtx_professional` covers solo practitioners; this is a firm.

**Verdict: CLEAR** — Proceed.

---

#### VN-PRO-013 | `digital-marketing-agency` | Digital Marketing Agency

**Nearest existing:** `vtx_advertising_agency` (Advertising Agency, media, marketing)

**Analysis:** ⚠️ MODERATE COLLISION. Both are marketing service firms. However the distinction in Nigeria is commercially significant:

- **Advertising agency** (existing): ATL/BTL — TV/radio spots, outdoor/billboard (LASAA), print, event activation, media buying. Regulated by APCON. Template: campaign portfolio, media reach stats, awards.
- **Digital marketing agency** (proposed): Social media management, SEO, SEM/PPC, email marketing, influencer coordination, performance metrics dashboards, content calendars. Clients: SMEs and corporates wanting online presence. Template: platform expertise logos (Meta, Google, TikTok), analytics dashboard screenshots, retainer pricing, case studies with ROI metrics.

In practice, Nigeria's advertising agencies are increasingly doing both. However the template surfaces remain meaningfully different (ATL vs digital KPIs, APCON compliance vs NCC/platform ToS).

**Verdict: DIFFERENTIATE** — Proceed. Add `digital-marketing-agency` as a distinct vertical. Update `vtx_advertising_agency` notes to explicitly scope it as "ATL/BTL/OOH advertising" to prevent ambiguity. Both will share NF-TEC-AGY family.

---

#### VN-PRO-014 | `cac-registration-agent` | CAC Registration Agent / Business Registration Consultant

**Nearest existing:** `vtx_professional` (licensed professional), `vtx_legal` (if it exists — check)

**Analysis:** CAC registration agents are a unique Nigeria-specific category — accredited CAC intermediaries who handle business name and company registrations on behalf of clients. No existing vertical covers this. Note: score is P2 (34), not P1.

**Verdict: CLEAR** — Proceed (P2 queue).

---

### TECHNOLOGY CATEGORY (VN-TEC-001 to VN-TEC-002)

---

#### VN-TEC-001 | `cybersecurity-firm` | Cybersecurity Company

**Nearest existing:** `vtx_it_support` (IT Support / Computer Repair), `vtx_security_co` (Security Company / Guard Service, commerce, security)

**Analysis:** `vtx_security_co` is **physical security** — guards, surveillance cameras, access control. `vtx_it_support` is break-fix IT. A cybersecurity firm is entirely distinct: penetration testing, SOC services, SIEM management, NDPR compliance audits, ISO 27001 gap analysis, threat intelligence. Different regulatory references (NITDA, NCC, not state security licences).

**Verdict: CLEAR** — Proceed.

---

#### VN-TEC-002 | `data-analytics-firm` | Data Analytics / Business Intelligence Firm

**Nearest existing:** `vtx_it_support`, `vtx_advertising_agency` (for market research overlap)

**Analysis:** Data analytics firms in Nigeria serve enterprise clients with BI dashboards, predictive modelling, market research, and data strategy. No existing vertical covers this. The NDPC (Nigerian Data Protection Commission) regulatory angle is unique to this niche.

**Verdict: CLEAR** — Proceed.

---

### HOSPITALITY CATEGORY (VN-HSP-001 to VN-HSP-004)

---

#### VN-HSP-001 | `bar-lounge` | Bar / Lounge / Nightclub

**Nearest existing:** `vtx_restaurant` (Restaurant / Eatery / Buka, commerce, food-service)

**Analysis:** Restaurants and bars share the NAFDAC/food-service regulatory universe but their template languages diverge significantly. A bar/lounge template centers on drinks menus (cocktails, spirits, draft beer), events and DJ nights calendar, table reservation for social occasions, age restriction notices, state liquor licence display — none of which appear in a restaurant template. The FSM states also differ (liquor licence verification required).

**Verdict: CLEAR** — Proceed.

---

#### VN-HSP-002 | `resort` | Resort / Leisure Park

**Nearest existing:** `vtx_hotel` (Hotel / Guesthouse / Shortlet, commerce, hospitality)

**Analysis:** Hotels provide room-night accommodation. Resorts package accommodation with curated leisure experiences (beach access, pool, spa, nature trails, guided activities, day-use passes, retreat packages, event hosting in natural settings). In the Nigerian context (Calabar, Lakowe, Epe, Badagry), resorts are clearly distinguishable from hotels on both the operator's template needs and the guest journey. State Tourism Board and NTDC registration adds unique regulatory texture.

**Verdict: DIFFERENTIATE** — Proceed. When seeding, add to `vtx_hotel` notes: "Excludes resorts and leisure parks — see `resort` vertical." Template differentiation is valid.

---

#### VN-HSP-003 | `vacation-rental` | Vacation Rental / Short-let Portfolio Operator

**Nearest existing:** `vtx_hotel` — display name is "Hotel / Guesthouse / **Shortlet**"

**Analysis:** ⚠️ HIGH COLLISION. The word "Shortlet" is already embedded in `vtx_hotel`'s display name. This is a significant overlap. However:

- `vtx_hotel` was designed for a single-property hospitality operator (one physical building, multiple room types). Its FSM and template assume unified front-desk management.
- `vacation-rental` (proposed) targets **portfolio operators** who manage multiple independent apartments/houses across different locations — the Airbnb landlord model. Their template needs are fundamentally multi-property: per-unit availability calendars, dynamic per-unit pricing, property-specific photo galleries, cross-property guest communication, channel manager integration (Airbnb/Booking.com/Jumia Travel API links), cleaning schedule coordination.

**Verdict: DIFFERENTIATE** — Proceed, with a mandatory scope clarification:
- `vtx_hotel` = single hospitality property (hotel, guesthouse, single shortlet apartment)
- `vacation-rental` = multi-property portfolio operator (3+ units across locations)

**Action required:** Update `vtx_hotel` display name to "Hotel / Guesthouse" (remove "Shortlet" from display name to avoid confusion) AND add a `min_units: 3` differentiator note in the vertical taxonomy glossary. This display name update must be reflected in `niche-alias-deprecation-registry.md`.

---

#### VN-HSP-004 | `food-court` | Food Court / Multi-Vendor Canteen

**Nearest existing:** `vtx_restaurant` (food-service), `vtx_market` (Market / Trading Hub, place, marketplace)

**Analysis:** A food court is an operator managing multiple food vendors under one roof — a B2B2C model. Its template needs (vendor directory management, unified ordering interface, canteen contract management, vendor performance dashboards) are distinct from both a single restaurant and a general market/trading hub.

**Verdict: CLEAR** — Proceed.

---

### PROPERTY MANAGEMENT CATEGORY (VN-PRP-001 to VN-PRP-003)

---

#### VN-PRP-001 | `coworking-space` | Co-working Space / Business Hub

**Nearest existing:** `vtx_hub` (Tech Hub / Innovation Centre, place, hub)

**Analysis:** ⚠️ MODERATE COLLISION. Both are shared working environments for businesses and startups. However:

- `vtx_hub` = **incubator/accelerator model** — equity or grant-based residence, mentorship programmes, demo days, investor access. The business relationship is ecosystem-driven (e.g., CcHUB, Tony Elumelu Foundation Hub, Ventures Platform).
- `coworking-space` = **commercial real estate model** — pay-per-seat, day passes, monthly desk subscriptions, meeting room rentals. The business relationship is landlord-tenant. Template: seat inventory booking, membership tier pricing, amenities showcase (WiFi, power backup), virtual office mailbox.

**Verdict: DIFFERENTIATE** — Proceed. Add notes to `vtx_hub`: "Tech Hub / Innovation Centre (incubator/accelerator model). Excludes commercial coworking spaces — see `coworking-space` vertical." Both can share NF-PRP-SVC family but have different FSM states and KYC requirements.

---

#### VN-PRP-002 | `property-management` | Property Management Company

**Nearest existing:** `vtx_real_estate_agency` (Real Estate Agency, commerce, real-estate), `vtx_property_developer` (Property Developer, commerce, real-estate)

**Analysis:** Clear three-way distinction in Nigerian property sector:
- **Real estate agency** (existing): buy/sell/let transactions — fee on deal closure.
- **Property developer** (existing): land acquisition, construction, estate development — capital-intensive.
- **Property management** (proposed): ongoing management of completed properties on behalf of landlords — recurring fee (5–10% of rent). Template needs: landlord dashboard, rent collection and remittance, maintenance request workflow, vacancy marketing, monthly landlord statements, ESVARBON licence display.

**Verdict: CLEAR** — Proceed.

---

#### VN-PRP-003 | `student-hostel` | Student Hostel / Dormitory Operator

**Nearest existing:** `vtx_hotel` (Hotel / Guesthouse, commerce, hospitality)

**Analysis:** Student hostels operate on academic-calendar billing (per-semester, not per-night), require room-type allocation by gender and study level, manage caution deposits with specific refund rules, and deal with State Ministry of Education permit requirements. The guest profile, billing model, and regulatory environment are entirely different from a hotel.

**Verdict: CLEAR** — Proceed.

---

### WELLNESS CATEGORY (VN-WEL-001 to VN-WEL-003)

---

#### VN-WEL-001 | `yoga-studio` | Yoga / Pilates / Meditation Studio

**Nearest existing:** `vtx_gym` (Gym / Wellness Centre, health, fitness), `vtx_spa` (Spa / Massage Parlour, commerce, personal-care)

**Analysis:** While all three operate in the wellness space, the template surfaces diverge:
- **Gym** (existing): equipment access, personal trainer booking, membership tiers, BMI/fitness assessment. Equipment-centric.
- **Spa** (existing): treatment menu (massage, facials, body wraps), therapist booking, product retail. Treatment-centric.
- **Yoga studio** (proposed): class schedule (multiple styles — Hatha, Vinyasa, Yin, Pilates), instructor certifications, in-person + livestream class booking, retreat packages, wellness blog, meditation sessions. Schedule-and-practice-centric.

**Verdict: CLEAR** — Proceed.

---

#### VN-WEL-002 | `traditional-medicine` | Traditional Medicine Practitioner / Herbal Shop

**Nearest existing:** `vtx_pharmacy` (Pharmacy / Drug Store, health, retail-pharmacy)

**Analysis:** Traditional medicine is a NAFDAC-regulated but fundamentally distinct category. Pharmacies dispense allopathic medicines under the Pharmacists Council of Nigeria. Traditional medicine practitioners sell NAFDAC-registered herbal products under the Traditional Medicine Board. Different regulatory bodies, product types, and template needs (condition-based herb catalog, NAFDAC herbal registration numbers, preparation instructions, safety disclaimers per Nigerian Consumer Protection Council guidelines).

**Verdict: CLEAR** — Proceed.

---

#### VN-WEL-003 | `health-food-store` | Supplement / Health Food Store

**Nearest existing:** `vtx_pharmacy` (retail pharmacy), `vtx_supermarket` (Supermarket / Grocery Store, commerce, retail)

**Analysis:** Supplement and health food stores occupy a distinct retail niche — NAFDAC-registered supplements, nutraceuticals, organic produce, functional foods. Their template needs (NAFDAC number display per product, health benefit descriptions, nutritionist Q&A, subscription boxes) are not covered by either a pharmacy (medicine-focused) or a supermarket (general grocery).

**Verdict: CLEAR** — Proceed (note P2, score 33 — lowest in the candidate set).

---

### COMMERCE EXPANSION CATEGORY (VN-COM-001 to VN-COM-005)

---

#### VN-COM-001 | `electronics-store` | Electronics / Mobile Phone Retail Store

**Nearest existing:** `vtx_electronics_repair` (Electronics Repair Shop, commerce, repair-services)

**Analysis:** Repair vs retail — completely different business models, template needs, and regulatory posture. SON certification for new electrical goods retail has no parallel in repair shops.

**Verdict: CLEAR** — Proceed.

---

#### VN-COM-002 | `jewellery-shop` | Jewellery Shop / Goldsmith

**Nearest existing:** `vtx_fashion_brand` (Fashion Brand / Clothing Label, creator, fashion)

**Analysis:** Jewellery retail in Nigeria involves CBN gold dealer notification, SON hallmarking, and high-value item authenticity concerns that do not apply to fashion brands. Template needs (high-res product gallery, custom goldsmith commission workflow, authenticity certificate, installment payment for bridal sets) are distinct.

**Verdict: CLEAR** — Proceed.

---

#### VN-COM-003 | `baby-shop` | Baby Shop / Maternity Store

**Nearest existing:** `vtx_supermarket` (general retail), `vtx_pharmacy` (health retail)

**Analysis:** Baby shops are a specialist retail category in Nigeria with unique NAFDAC compliance requirements for formula and feeding equipment, SON safety standards for baby products, and a highly emotional purchase journey (baby gift registry, new parent content, age-stage product filtering). No existing vertical covers this.

**Verdict: CLEAR** — Proceed.

---

#### VN-COM-004 | `cosmetics-shop` | Perfume & Cosmetics Shop

**Nearest existing:** `vtx_beauty_salon` (Beauty Salon / Barber Shop, commerce, personal-care), `vtx_spa` (personal-care)

**Analysis:** `vtx_beauty_salon` is a **service** business (haircuts, blow-drys, manicures). `vtx_spa` is a **treatment** business. `cosmetics-shop` is a **product retail** business. Different business models, different regulatory requirements (NAFDAC product registration is mandatory for all cosmetics sold in Nigeria), and different template surfaces (product catalog with shade matching tools, NAFDAC numbers, fragrance notes wheel — none of which apply to a salon).

**Verdict: CLEAR** — Proceed.

---

#### VN-COM-005 | `thrift-store` | Secondhand / Thrift Store

**Nearest existing:** No meaningful overlap. `vtx_fashion_brand` is new-product fashion.

**Analysis:** The Nigerian thrift/Okrika market is a massive and unique retail category with specific template needs: condition grading (A-grade, B-grade, Okrika), drop date announcement mechanics, WhatsApp-first customer communication, size availability filter, Instagram Live sales integration. No existing vertical addresses this.

**Verdict: CLEAR** — Proceed.

---

## Section C — Collision Verdict Summary

| Proposed VN-ID | Slug | Verdict | Action Required |
|---|---|---|---|
| VN-HLT-012 | `hospital` | ✅ CLEAR | None |
| VN-HLT-013 | `diagnostic-lab` | ✅ CLEAR | None |
| VN-HLT-014 | `physiotherapy` | ✅ CLEAR | Add MRPN FSM state |
| VN-HLT-015 | `mental-health` | ⚠️ DIFFERENTIATE | Fix `vtx_rehab_centre` subcategory: `mental-health` → `rehabilitation` |
| VN-HLT-016 | `maternity-clinic` | ✅ CLEAR | None |
| VN-EDU-009 | `university` | ✅ CLEAR | None |
| VN-EDU-010 | `exam-prep-centre` | ✅ CLEAR | None |
| VN-EDU-011 | `elearning-platform` | ✅ CLEAR | None |
| VN-EDU-012 | `tutorial-centre` | ✅ CLEAR | None |
| VN-EDU-013 | `tech-academy` | ⚠️ DIFFERENTIATE | Add exclusion note to `vtx_training_institute` |
| VN-FIN-008 | `microfinance-bank` | ✅ CLEAR | None |
| VN-FIN-009 | `insurance-company` | ✅ CLEAR | Document underwriter↔agent distinction in taxonomy glossary |
| VN-FIN-010 | `credit-union` | ⚠️ DIFFERENTIATE | Add exclusion note to `vtx_cooperative` |
| VN-FIN-011 | `pension-fund` | ✅ CLEAR | None |
| VN-FIN-012 | `stockbroker` | ✅ CLEAR | None |
| VN-PRO-009 | `software-agency` | ✅ CLEAR | None |
| VN-PRO-010 | `architecture-firm` | ✅ CLEAR | None |
| VN-PRO-011 | `recruitment-agency` | ✅ CLEAR | None |
| VN-PRO-012 | `management-consulting` | ✅ CLEAR | None |
| VN-PRO-013 | `digital-marketing-agency` | ⚠️ DIFFERENTIATE | Update `vtx_advertising_agency` notes to scope as ATL/BTL/OOH only |
| VN-PRO-014 | `cac-registration-agent` | ✅ CLEAR | None |
| VN-TEC-001 | `cybersecurity-firm` | ✅ CLEAR | None |
| VN-TEC-002 | `data-analytics-firm` | ✅ CLEAR | None |
| VN-HSP-001 | `bar-lounge` | ✅ CLEAR | None |
| VN-HSP-002 | `resort` | ⚠️ DIFFERENTIATE | Add exclusion note to `vtx_hotel` |
| VN-HSP-003 | `vacation-rental` | ⚠️ DIFFERENTIATE | Remove "Shortlet" from `vtx_hotel` display name; add min-units differentiator |
| VN-HSP-004 | `food-court` | ✅ CLEAR | None |
| VN-PRP-001 | `coworking-space` | ⚠️ DIFFERENTIATE | Add exclusion note to `vtx_hub` |
| VN-PRP-002 | `property-management` | ✅ CLEAR | None |
| VN-PRP-003 | `student-hostel` | ✅ CLEAR | None |
| VN-WEL-001 | `yoga-studio` | ✅ CLEAR | None |
| VN-WEL-002 | `traditional-medicine` | ✅ CLEAR | None |
| VN-WEL-003 | `health-food-store` | ✅ CLEAR | None |
| VN-COM-001 | `electronics-store` | ✅ CLEAR | None |
| VN-COM-002 | `jewellery-shop` | ✅ CLEAR | None |
| VN-COM-003 | `baby-shop` | ✅ CLEAR | None |
| VN-COM-004 | `cosmetics-shop` | ✅ CLEAR | None |
| VN-COM-005 | `thrift-store` | ✅ CLEAR | None |

**Final tally:**
- ✅ CLEAR (no action): 29 candidates
- ⚠️ DIFFERENTIATE (action required before promotion): 9 candidates
- ❌ MERGE / REJECT: 0 candidates

**All 38 candidates survive collision audit.** Zero rejections.

---

## Section D — Pre-Promotion Governance Checklist

Before any candidate VN-ID is written to `0004_verticals-master.csv`, the following gates must be cleared:

### Gate 1 — Internal CSV Deduplication (must complete before new rows added)

- [ ] Resolve `vtx_gym` vs `vtx_gym_fitness` — merge to `vtx_gym`; check for any brand claims on `gym-fitness` in prod DB
- [ ] Resolve `vtx_event_hall` vs `vtx_events_centre` — merge to `vtx_event_hall`; deprecate `events-centre` slug
- [ ] Decide on `vtx_pharmacy` vs `vtx_pharmacy_chain` — hold or merge pending product decision on `chain_mode` flag

### Gate 2 — DIFFERENTIATE Actions (for the 9 flagged candidates)

| Candidate | Required Action Before Promotion |
|---|---|
| `mental-health` | Update `vtx_rehab_centre` subcategory: `mental-health` → `rehabilitation` in CSV |
| `tech-academy` | Add exclusion note to `vtx_training_institute` in `vertical-niche-master-map.md` |
| `credit-union` | Add exclusion note to `vtx_cooperative` in `vertical-niche-master-map.md` |
| `digital-marketing-agency` | Update `vtx_advertising_agency` notes column: scope to ATL/BTL/OOH |
| `resort` | Add exclusion note to `vtx_hotel` in `vertical-niche-master-map.md` |
| `vacation-rental` | Remove "Shortlet" from `vtx_hotel` display name; document `min_units ≥ 3` rule in taxonomy glossary |
| `coworking-space` | Add exclusion note to `vtx_hub` in `vertical-niche-master-map.md` |

### Gate 3 — New Category Code Ratification

The following new category codes proposed in `03-niche-family-expansion.md` must be ratified and added to the CSV schema's allowed `category` enum before any rows using them are inserted:

| Code | Full Name | Proposed for |
|---|---|---|
| `technology` | Technology Services | VN-TEC-001, VN-TEC-002 |
| `wellness` | Wellness / Alternative Health | VN-WEL-001, VN-WEL-002, VN-WEL-003 |
| `hospitality` | Hospitality & Leisure | VN-HSP-001, VN-HSP-002, VN-HSP-003, VN-HSP-004 |
| `property` | Property & Space Management | VN-PRP-001, VN-PRP-002, VN-PRP-003 |

Note: existing candidates in `health`, `education`, `financial`, `professional`, and `commerce` categories use **existing** category codes and do not require ratification.

### Gate 4 — VN-ID Sequential Integrity Check

Verify that proposed VN-IDs do not conflict with any IDs already assigned in the canonical registry before insertion:

- VN-HLT-012 through VN-HLT-016: confirm last canonical HLT ID
- VN-EDU-009 through VN-EDU-013: confirm last canonical EDU ID
- VN-FIN-008 through VN-FIN-012: confirm last canonical FIN ID
- VN-PRO-009 through VN-PRO-014: confirm last canonical PRO ID
- VN-TEC, VN-HSP, VN-PRP, VN-WEL, VN-COM: all new series — safe on new category codes after ratification

### Gate 5 — Governance Document Updates

For every promoted candidate, update all four canonical sources:

1. `infra/db/seeds/0004_verticals-master.csv` — add row
2. `docs/canonical-niche-registry.md` — add entry
3. `docs/niche-family-variant-register.md` — update relevant NF-XXX family
4. `docs/vertical-niche-master-map.md` — add mapping entry

---

## Section E — CSV Note Amendments for DIFFERENTIATE Cases

The following amendments to the `notes` column of existing CSV rows should be applied in the same PR as the new row additions for their corresponding DIFFERENTIATE candidates:

```
vtx_hotel       → notes: "...Excludes shortlet portfolio operators (≥3 units across locations) → see vacation-rental; excludes resorts and leisure parks → see resort"
vtx_hub         → notes: "...Excludes commercial coworking/hot-desk operators → see coworking-space"
vtx_rehab_centre → subcategory: "rehabilitation" (was: "mental-health"); notes: "Substance abuse, physical rehab, post-surgical recovery. Excludes outpatient mental health/counselling → see mental-health"
vtx_advertising_agency → notes: "ATL/BTL/OOH advertising: TV, radio, outdoor, print, events activation. Excludes digital-only agencies → see digital-marketing-agency"
vtx_cooperative → notes: "...Excludes financial cooperatives (credit unions/SACCOs with formal loan products) → see credit-union"
vtx_training_institute → notes: "...Excludes digital/coding academies → see tech-academy"
```

---

*Produced: 2026-04-26 — Collision Audit Gate*
*All 38 candidates cleared. 0 rejections. 9 require DIFFERENTIATE actions prior to CSV promotion.*
*Internal CSV: 2 confirmed duplicate pairs flagged (vtx_gym/vtx_gym_fitness, vtx_event_hall/vtx_events_centre); 1 held (vtx_pharmacy/vtx_pharmacy_chain).*
