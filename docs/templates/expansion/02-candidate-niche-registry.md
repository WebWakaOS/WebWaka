# WebWaka OS — Candidate Niche Registry (Expansion Universe)

**Status:** RESEARCH — Not yet canonical
**Date:** 2026-04-26
**Parent:** `docs/templates/expansion/00-expansion-master-blueprint.md`
**Scope:** Full proposed new niches with scoring, proposed VN-IDs, and governance metadata

> **IMPORTANT:** Entries in this document are CANDIDATES — not yet canonical. A niche becomes canonical when it is:
> 1. Added to `infra/db/seeds/0004_verticals-master.csv` (status=planned)
> 2. Assigned a confirmed VN-ID
> 3. Added to `docs/governance/canonical-niche-registry.md`
> No template implementation may begin until those three steps are complete.

---

## Scoring Rubric

| Dimension | Description | Score |
|---|---|---|
| **Nigeria Market Density (NMD)** | Volume of this business type in Nigeria | 0–10 |
| **Digital Readiness (DR)** | Readiness of operators to adopt SaaS | 0–10 |
| **Template Differentiation (TD)** | How distinct the template needs are from existing ones | 0–10 |
| **Regulatory Simplicity (RS)** | Inverse of regulatory complexity (10=easy, 0=very complex) | 0–10 |
| **Revenue Potential (RP)** | Estimated SaaS revenue per tenant × market density | 0–10 |
| **TOTAL** | Sum of above | 0–50 |

**Priority tiers:**
- ≥ 40: P1 — Add to next canonical expansion sprint
- 30–39: P2 — Add to following sprint
- 20–29: P3 — Medium backlog
- < 20: Defer

---

## PROPOSED CATEGORY: HEALTH EXPANSION

### VN-HLT-012 (proposed) | `hospital` | Hospital / Secondary Healthcare Facility

| Dimension | Score | Notes |
|---|---|---|
| NMD | 10 | >20,000 private hospitals in Nigeria (MDCN) |
| DR | 7 | Hospital owners increasingly seeking digital management |
| TD | 10 | Completely different from `clinic` — inpatient, wards, surgery |
| RS | 4 | MDCN + Ministry of Health + NHIA = complex |
| RP | 10 | High-ticket niche; ₦50K–200K/month subscriptions realistic |
| **TOTAL** | **41** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-HLT-HOS (new — Hospital Care)
- **Regulatory gate:** MDCN hospital license; State Ministry of Health; NHIA accreditation (for HMO billing)
- **Core template needs:** Ward management, patient admission/discharge, OPD appointments, surgical scheduling, lab/pharmacy integration, NHIA billing, daily census reports
- **Discovery tags:** hospital, inpatient, ward, surgery, private hospital, referral, specialist, casualty, operating theatre
- **Nigeria context:** Private hospitals are the primary healthcare pathway for Nigeria's middle class. Federal and teaching hospitals are overwhelmed; private hospitals fill the gap at every income level. Average Lagos private hospital has 20–200 beds.
- **Pillar classification:** ops + branding + marketplace

---

### VN-HLT-013 (proposed) | `diagnostic-lab` | Medical / Diagnostic Laboratory

| Dimension | Score | Notes |
|---|---|---|
| NMD | 9 | Tens of thousands of MLSCN-licensed labs nationwide |
| DR | 8 | Labs are already digital (equipment generates electronic results) |
| TD | 10 | Distinct from all existing niches — test catalog, sample tracking |
| RS | 5 | MLSCN + NAFDAC (reagents) |
| RP | 8 | ₦30K–100K/month range; high volume customers |
| **TOTAL** | **40** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-HLT-HOS (same family as hospital — lab often co-located or hospital-affiliated)
- **Regulatory gate:** MLSCN license; NAFDAC (reagents and equipment); accreditation optional (NIPRD, ISO 15189)
- **Core template needs:** Test catalog with turnaround times, sample collection booking, result delivery portal (PDF/link), referring doctor network, home collection scheduling, QA log
- **Discovery tags:** lab, laboratory, blood test, diagnostic, pathology, MLSCN, X-ray, scan, urinalysis, haematology, culture, biopsy, test result

---

### VN-HLT-014 (proposed) | `physiotherapy` | Physiotherapy / Occupational Therapy Clinic

| Dimension | Score | Notes |
|---|---|---|
| NMD | 7 | Significant but smaller than labs |
| DR | 8 | Professional practitioners — already use computers |
| TD | 9 | Session-based, exercise plans, progress tracking |
| RS | 6 | PCN-PT registration; straightforward |
| RP | 7 | Premium per-session billing |
| **TOTAL** | **37** | **P2** |

- **Entity type:** organization (can be individual or clinic)
- **Proposed family:** NF-HLT-THR (new — Therapy Services)
- **Regulatory gate:** Physiotherapy Council of Nigeria (PCN-PT); MDCN (if also medical)
- **Core template needs:** Session booking, treatment plan builder, exercise/home program PDF, progress notes, home visit scheduling, insurance/HMO billing
- **Discovery tags:** physiotherapy, physio, occupational therapy, sports injury, rehabilitation, exercise, stroke recovery, PCN, mobility

---

### VN-HLT-015 (proposed) | `mental-health` | Mental Health / Counselling Practice

| Dimension | Score | Notes |
|---|---|---|
| NMD | 6 | Growing rapidly; stigma reducing |
| DR | 8 | Young professionals; tech-savvy operators |
| TD | 9 | Confidentiality, teletherapy, session notes |
| RS | 6 | MDCN or professional body; relatively clear |
| RP | 8 | High value per session; subscription models |
| **TOTAL** | **37** | **P2** |

- **Entity type:** individual or organization
- **Proposed family:** NF-HLT-THR (same as physiotherapy)
- **Regulatory gate:** MDCN (psychiatrists); Nigerian Society of Clinical Psychologists; Nigerian Association of Clinical Psychologists; Counselling Association of Nigeria
- **Core template needs:** Private appointment booking (anonymised), therapist profiles and specialisations, session frequency management, teletherapy integration, crisis resource links, confidentiality statement, HMO/EAP integration
- **Discovery tags:** therapy, counselling, mental health, psychologist, psychiatrist, anxiety, depression, CBT, PTSD, mind health, emotional wellness

---

### VN-HLT-016 (proposed) | `maternity-clinic` | Maternity / Birthing Centre

| Dimension | Score | Notes |
|---|---|---|
| NMD | 9 | Hundreds of thousands of private maternity homes in Nigeria |
| DR | 6 | Mixed digital readiness |
| TD | 9 | Antenatal, scans, delivery, postnatal — unique journey |
| RS | 5 | MDCN + NMCN + state Ministry |
| RP | 8 | High revenue per patient (full antenatal journey) |
| **TOTAL** | **37** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-HLT-MAT (new — Maternity)
- **Regulatory gate:** MDCN; Nursing & Midwifery Council of Nigeria (NMCN); State Ministry of Health
- **Core template needs:** Antenatal registration, scan/appointment scheduling, EDD (expected delivery date) tracker, delivery room booking, postnatal follow-up, baby records (immunisation timeline), billing
- **Discovery tags:** maternity, antenatal, midwife, birthing, delivery, postnatal, baby, scan, ANC, NMCN, nursing home, labour ward

---

## PROPOSED CATEGORY: EDUCATION EXPANSION

### VN-EDU-009 (proposed) | `university` | University / Polytechnic / College

| Dimension | Score | Notes |
|---|---|---|
| NMD | 8 | 100+ private universities; 200+ polytechnics |
| DR | 9 | Tertiary institutions already heavily digitized |
| TD | 10 | Application portal, student management, faculty — very distinct |
| RS | 3 | NUC/NBTE/NCCE — strict and layered |
| RP | 10 | Largest possible revenue per tenant in education |
| **TOTAL** | **40** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-EDU-TER (new — Tertiary Education)
- **Regulatory gate:** NUC (National Universities Commission); NBTE (National Board for Technical Education); NCCE (National Commission for Colleges of Education)
- **Core template needs:** Programme catalog, undergraduate/postgraduate application, student portal (results, fee clearance), department directory, faculty/staff profiles, research publication showcase, alumni network, news & events
- **Discovery tags:** university, polytechnic, college, degree, HND, campus, lecturer, NUC, NBTE, JAMB, admission, student portal, faculty

---

### VN-EDU-010 (proposed) | `exam-prep-centre` | Exam Preparation Centre

| Dimension | Score | Notes |
|---|---|---|
| NMD | 10 | Enormous — every town has JAMB/WAEC prep centres |
| DR | 7 | Operators are education-sector professionals |
| TD | 8 | Mock exams, past questions, timetables |
| RS | 8 | No specific regulator — open market |
| RP | 7 | Mid-range ticket; high volume |
| **TOTAL** | **40** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-EDU-SCH (extend existing family — shares parent school template base)
- **Regulatory gate:** None specific; CAC business registration; NUC if offering tertiary prep
- **Core template needs:** Course enrollment (JAMB, WAEC, NECO, IELTS, TOEFL, GRE, GMAT), class timetable, past questions/resources, mock exam scheduling, student progress tracking, parent notifications, fee payment
- **Discovery tags:** JAMB, WAEC, NECO, exam prep, lesson centre, tutorial, CBT, post-UTME, A-levels, IELTS

---

### VN-EDU-011 (proposed) | `elearning-platform` | E-Learning Platform / Online Education Provider

| Dimension | Score | Notes |
|---|---|---|
| NMD | 7 | Growing rapidly post-COVID; 200+ Nigerian LMS operators |
| DR | 10 | These ARE tech companies — extremely digital-ready |
| TD | 10 | Course catalog, LMS integration, certificates — unique |
| RS | 7 | Minimal regulatory burden |
| RP | 9 | Strong recurring subscription + cohort revenue |
| **TOTAL** | **43** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-EDU-DIG (new — Digital Education)
- **Regulatory gate:** CAC; NUC approval required only if awarding NUC-recognised degrees; otherwise unregulated
- **Core template needs:** Course catalog, cohort management, student enrollment (with payment gating), LMS video links, live class scheduling (Zoom/Google Meet integration), certificate generation, instructor profiles, reviews
- **Discovery tags:** online learning, e-learning, digital school, LMS, bootcamp, course, cohort, certificate, online training, tech school

---

### VN-EDU-012 (proposed) | `tutorial-centre` | Tutorial / Group Lesson Centre

| Dimension | Score | Notes |
|---|---|---|
| NMD | 10 | Every Nigerian suburb has at least one |
| DR | 7 | Growing digital adoption |
| TD | 7 | Class timetables, multi-subject, multi-teacher |
| RS | 8 | No regulator; CAC registration |
| RP | 6 | Lower ticket but very high volume |
| **TOTAL** | **38** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-EDU-SCH (extend existing)
- **Regulatory gate:** None specific; CAC
- **Core template needs:** Subject timetable, teacher/subject directory, enrollment + fee collection, attendance tracking, parent portal, holiday schedule, result upload

---

### VN-EDU-013 (proposed) | `tech-academy` | Technology / Coding Academy

| Dimension | Score | Notes |
|---|---|---|
| NMD | 6 | High-growth; concentrated in major cities |
| DR | 10 | Target audience is tech-savvy by definition |
| TD | 8 | Portfolio showcase, cohort, job placement |
| RS | 7 | CAC only; no sector regulator |
| RP | 9 | High ticket; employer-sponsored |
| **TOTAL** | **40** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-EDU-DIG (same as elearning)
- **Regulatory gate:** CAC; optional NITDA accreditation
- **Core template needs:** Programme catalog (frontend, backend, data, cybersecurity), alumni portfolio showcase, cohort enrollment + payment, employer partner directory, job board, instructor profiles, graduation showcase
- **Discovery tags:** coding, bootcamp, tech training, programming, data science, cybersecurity, developer, software, IT training, Andela, Decagon

---

## PROPOSED CATEGORY: FINANCIAL EXPANSION

### VN-FIN-008 (proposed) | `microfinance-bank` | Microfinance Bank

| Dimension | Score | Notes |
|---|---|---|
| NMD | 9 | ~900 CBN-licensed MFBs in Nigeria |
| DR | 7 | Urban MFBs digitizing; rural lag |
| TD | 10 | Loan management, CBN reporting, passbooks — very distinct |
| RS | 2 | CBN MFB licensing is very complex and tiered |
| RP | 10 | High-value institutional customers |
| **TOTAL** | **38** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-FIN-REG (new — Regulated Finance Institutions)
- **Regulatory gate:** CBN MFB license (unit/state/national tier); NDIC membership; FIRS registration
- **Core template needs:** Loan product catalog, loan application and approval workflow, account/passbook management, CBN prudential return format, KYC tier compliance, savings products, group lending (solidarity group), branch/agent management
- **Discovery tags:** microfinance, MFB, loan, savings, credit, CBN, NDIC, micro credit, community bank, cooperative bank

---

### VN-FIN-009 (proposed) | `insurance-company` | Insurance Underwriter / Insurance Company

| Dimension | Score | Notes |
|---|---|---|
| NMD | 6 | 60+ NAICOM-licensed insurers; not a micro-business segment |
| DR | 8 | Insurance is document-heavy; strong digitization pull |
| TD | 10 | Policy catalog, claims, underwriting — completely distinct |
| RS | 2 | NAICOM oversight; very regulated |
| RP | 10 | Highest possible revenue potential |
| **TOTAL** | **36** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-FIN-REG (same as MFB)
- **Regulatory gate:** NAICOM license; SEC registration (for investment products); NAICOM minimum capital requirements
- **Core template needs:** Insurance product catalog (life, health, auto, property, marine), online quote generator, policy portal, claims submission and tracking, agent network management, reinsurance documentation

---

### VN-FIN-010 (proposed) | `credit-union` | Credit Union / SACCO

| Dimension | Score | Notes |
|---|---|---|
| NMD | 8 | Nigeria has thousands of SACCOs; growth segment |
| DR | 6 | Many are traditional; some are digitizing |
| TD | 8 | Share capital, dividends, credit scoring |
| RS | 5 | State cooperative federation; CAC |
| RP | 7 | Mid-range but recurring |
| **TOTAL** | **34** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-FIN-COP (new — Cooperative Finance)
- **Regulatory gate:** CAC cooperative registration; State Cooperative Development Department; Nigerian Association of Cooperative Societies
- **Core template needs:** Share capital management, member savings, loan processing (including emergency loans), dividend computation, annual general meeting management, membership applications

---

### VN-FIN-011 (proposed) | `pension-fund` | Pension Fund Administrator (PFA)

| Dimension | Score | Notes |
|---|---|---|
| NMD | 5 | ~20 licensed PFAs; institutional segment |
| DR | 9 | Heavily digital — RSA portal is standard |
| TD | 9 | RSA management, contribution tracking, fund options |
| RS | 2 | PenCom — very strict |
| RP | 10 | Institutional; extremely high revenue |
| **TOTAL** | **35** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-FIN-REG
- **Regulatory gate:** PenCom license; SEC (for fund management); FIRS
- **Core template needs:** RSA (Retirement Savings Account) portal, employer contribution tracking, fund performance dashboard, employer integration portal, retiree management, death/disability benefit processing

---

### VN-FIN-012 (proposed) | `stockbroker` | Stockbroker / Securities Dealer

| Dimension | Score | Notes |
|---|---|---|
| NMD | 4 | ~250 SEC-licensed broker-dealers |
| DR | 9 | Capital markets is document-intensive; high digital pull |
| TD | 10 | Portfolio, trade confirmations, NSE data — unique |
| RS | 3 | SEC + NSE membership — complex |
| RP | 10 | Very high revenue per client |
| **TOTAL** | **36** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-FIN-REG
- **Regulatory gate:** SEC license (broker-dealer); NSE/NASD membership; FIRA
- **Core template needs:** Client portfolio display, trade confirmation statements, market data integration, CSCS (Central Securities Clearing System) link, annual report filings, compliance disclosures

---

## PROPOSED CATEGORY: PROFESSIONAL SERVICES EXPANSION

### VN-PRO-009 (proposed) | `software-agency` | Software / App Development Agency

| Dimension | Score | Notes |
|---|---|---|
| NMD | 8 | Hundreds in Lagos/Abuja; growing nationwide |
| DR | 10 | These are technology companies |
| TD | 9 | Portfolio, case studies, RFP form — distinct |
| RS | 8 | CAC only; no sector regulator |
| RP | 9 | High-value B2B contracts |
| **TOTAL** | **44** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-TEC-AGY (new — Technology Agency Services)
- **Regulatory gate:** CAC; optional NITDA CPAN certification; optional ISO 9001
- **Core template needs:** Service catalog (web, mobile, cloud, data), technology stack showcase, project portfolio/case studies, team and expertise profiles, client logos/testimonials, RFP/brief submission form, career page
- **Discovery tags:** software development, app, mobile, web, Nigeria tech, agency, developer, Yaba, coding, API, SaaS, startup, IT company

---

### VN-PRO-010 (proposed) | `architecture-firm` | Architecture / Interior Design Firm

| Dimension | Score | Notes |
|---|---|---|
| NMD | 7 | Thousands of ARCON-registered practices |
| DR | 8 | Architects use computers extensively |
| TD | 9 | Project renders, ARCON license, building permits — distinct |
| RS | 5 | ARCON; state planning authority |
| RP | 8 | High-value professional fees |
| **TOTAL** | **37** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-PRO-DES (new — Design & Architecture Professionals)
- **Regulatory gate:** ARCON (Architects Registration Council of Nigeria); NIQS (quantity surveyors); TOPREC (town planners)
- **Core template needs:** Project portfolio with renders/photos, ARCON registration display, team credentials, design brief submission form, 3D model/video showcase, client testimonials, awards
- **Discovery tags:** architect, architecture, interior design, ARCON, building design, floor plan, rendering, construction drawing, Lagos architect, Abuja architect

---

### VN-PRO-011 (proposed) | `recruitment-agency` | HR / Recruitment Agency

| Dimension | Score | Notes |
|---|---|---|
| NMD | 8 | Major segment — every city has recruitment firms |
| DR | 9 | Recruitment is online-first |
| TD | 9 | Job listings, candidate portal, placement tracker |
| RS | 7 | CAC only; labour law compliance |
| RP | 8 | Placement fees are high-value |
| **TOTAL** | **41** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-PRO-HR (new — Human Capital Services)
- **Regulatory gate:** CAC; FME (Federal Ministry of Employment) registration for executive search; CIPM membership preferred
- **Core template needs:** Live job board, candidate registration, employer job posting, headhunting/executive search portfolio, sector specialisation display, placement success metrics, newsletter signup
- **Discovery tags:** recruitment, HR, jobs, hiring, talent, staffing, headhunter, Lagos jobs, vacancy, graduate trainee, CIPM

---

### VN-PRO-012 (proposed) | `management-consulting` | Management Consulting Firm

| Dimension | Score | Notes |
|---|---|---|
| NMD | 6 | Concentrated in Lagos/Abuja; growing |
| DR | 9 | Consulting firms are document-intensive |
| TD | 8 | Case studies, methodology showcase, thought leadership |
| RS | 8 | CAC only |
| RP | 9 | Very high value engagements |
| **TOTAL** | **40** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-PRO-ADV (new — Advisory & Consulting)
- **Regulatory gate:** CAC; CIPM/ACCA/ICAN (for HR/finance-focused practices)
- **Core template needs:** Service areas (strategy, ops, finance, people), case studies, team credentials, engagement models, blog/thought leadership, white paper downloads, contact form for engagements

---

### VN-PRO-013 (proposed) | `digital-marketing-agency` | Digital Marketing Agency

| Dimension | Score | Notes |
|---|---|---|
| NMD | 9 | Explosive growth post-social media boom |
| DR | 10 | These are the most digital-native operators |
| TD | 8 | Portfolio, social metrics, package pricing |
| RS | 8 | CAC only; NCC for telecoms-adjacent services |
| RP | 8 | Retainer + project mix |
| **TOTAL** | **43** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-TEC-AGY (same as software-agency)
- **Regulatory gate:** CAC; NCC for telecoms; APCON (Advertising Practitioners Council of Nigeria) for advertising claims
- **Core template needs:** Service packages (social media management, SEO, PPC/Google Ads, email marketing, content), portfolio/case studies, platform expertise logos (Meta, Google, TikTok), results metrics, client testimonials, pricing calculator

---

### VN-PRO-014 (proposed) | `cac-registration-agent` | CAC Registration Agent / Business Registration Consultant

| Dimension | Score | Notes |
|---|---|---|
| NMD | 9 | Ubiquitous — in every market, every street |
| DR | 7 | Many are informal; growing formalization |
| TD | 7 | Service menu, document upload, status tracking |
| RS | 6 | CAC agent accreditation |
| RP | 5 | Low ticket but very high volume |
| **TOTAL** | **34** | **P2** |

- **Entity type:** individual or organization
- **Proposed family:** NF-PRO-ADV (same as consulting)
- **Regulatory gate:** CAC accredited agent status
- **Core template needs:** Service menu (business name search/registration, limited company, incorporated trustee, annual returns, CAC document collection), document upload portal, application status tracker, fee schedule, FAQ

---

## PROPOSED CATEGORY: TECHNOLOGY SERVICES

### VN-TEC-001 (proposed) | `cybersecurity-firm` | Cybersecurity Company

| Dimension | Score | Notes |
|---|---|---|
| NMD | 5 | Niche but high-value |
| DR | 10 | Pure tech companies |
| TD | 9 | Certifications, pen testing, SOC — unique |
| RS | 7 | NCC; NIS ISO 27001 |
| RP | 10 | Very high-value contracts |
| **TOTAL** | **41** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-TEC-SEC (new — Technology Security)
- **Regulatory gate:** NCC (for telecoms-adjacent); NIS ISO 27001 certification (optional but differentiating); NITDA digital security accreditation
- **Core template needs:** Service catalog (penetration testing, SOC, SIEM, CCTV, awareness training), certifications display, client sectors, incident response hotline, compliance frameworks (ISO 27001, PCI-DSS, NDPR)

---

### VN-TEC-002 (proposed) | `data-analytics-firm` | Data Analytics / Business Intelligence Firm

| Dimension | Score | Notes |
|---|---|---|
| NMD | 5 | Growing; concentrated in Lagos/Abuja |
| DR | 10 | Pure data companies |
| TD | 8 | Dashboard demos, sector expertise, case studies |
| RS | 8 | CAC only |
| RP | 9 | High-value enterprise engagements |
| **TOTAL** | **40** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-TEC-AGY (same as software agency)
- **Regulatory gate:** CAC; NCC for data-related; NDPC (Nigerian Data Protection Commission) compliance for data businesses
- **Core template needs:** Service areas, tool stack display, case studies with metrics, dashboard screenshots, sector focus, client logos, data policy, inquiry form

---

## PROPOSED CATEGORY: HOSPITALITY EXPANSION

### VN-HSP-001 (proposed) | `bar-lounge` | Bar / Lounge / Nightclub

| Dimension | Score | Notes |
|---|---|---|
| NMD | 9 | Massive segment — every city; thousands of bars |
| DR | 7 | Growing Instagram/digital presence |
| TD | 8 | Drinks menu, events calendar, table bookings |
| RS | 5 | State liquor licence; NAFDAC (alcohol) |
| RP | 7 | Mid-range tickets; high volume |
| **TOTAL** | **36** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-HSP-ENT (new — Hospitality Entertainment)
- **Regulatory gate:** State liquor/entertainment license; LASAA (Lagos signage); CAC; NAFDAC (for bottled spirits retail); APCON for advertising; Local Government permit
- **Core template needs:** Drinks menu, daily specials, event/DJ calendar, table reservation, happy hour highlights, gallery (ambiance photos), Instagram feed integration, age restriction notice, opening hours

---

### VN-HSP-002 (proposed) | `resort` | Resort / Leisure Park

| Dimension | Score | Notes |
|---|---|---|
| NMD | 5 | Growing eco-tourism; niche but high-value |
| DR | 7 | Tourist-facing; digital booking is expected |
| TD | 9 | Room booking, activities, day-use, packages |
| RS | 5 | State tourism board; CAC; NAFDAC (food) |
| RP | 9 | Premium pricing; high average ticket |
| **TOTAL** | **35** | **P2** |

- **Entity type:** organization or place
- **Proposed family:** NF-HSP-ACM (new — Hospitality Accommodation)
- **Regulatory gate:** State Tourism Board registration; CAC; NTDC (Nigerian Tourism Development Corporation)
- **Core template needs:** Room/cabin catalog, activity packages (beach, nature, adventure), day-use passes, event hosting (for corporate retreats), gallery, restaurant menu, partner transfers, special offers

---

### VN-HSP-003 (proposed) | `vacation-rental` | Vacation Rental / Short-let Portfolio Operator

| Dimension | Score | Notes |
|---|---|---|
| NMD | 7 | Airbnb boom; Lagos short-let is a major market |
| DR | 8 | Operators already use online booking tools |
| TD | 8 | Multi-property, calendar, dynamic pricing |
| RS | 7 | No specific regulator; state zoning |
| RP | 8 | High average ticket; recurring revenue |
| **TOTAL** | **38** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-HSP-ACM (same as resort)
- **Regulatory gate:** CAC; LGA short-let permit (some states); state landlord-tenant law compliance
- **Core template needs:** Property listings (multiple apartments), availability calendar, per-night/per-week pricing, instant booking, property photo galleries, house rules, guest communication, cleaning schedule, Airbnb/Booking.com integration links

---

### VN-HSP-004 (proposed) | `food-court` | Food Court / Multi-Vendor Canteen

| Dimension | Score | Notes |
|---|---|---|
| NMD | 7 | Growing in corporate offices, malls, universities |
| DR | 6 | Management-level tech adoption |
| TD | 8 | Vendor directory, unified ordering, table booking |
| RS | 6 | NAFDAC (food); CAC; facility license |
| RP | 7 | Revenue from vendor commission + direct sales |
| **TOTAL** | **34** | **P2** |

- **Entity type:** organization (operator managing multiple vendors) or place
- **Proposed family:** NF-FDS (extend existing food service family)
- **Regulatory gate:** NAFDAC (food); CAC; fire safety certificate; LGA permit
- **Core template needs:** Vendor directory with menus, daily specials, unified order desk, capacity and table booking, vendor performance tracking, canteen contract management

---

## PROPOSED CATEGORY: PROPERTY MANAGEMENT

### VN-PRP-001 (proposed) | `coworking-space` | Co-working Space / Business Hub

| Dimension | Score | Notes |
|---|---|---|
| NMD | 7 | 100+ in Lagos/Abuja; growing across states |
| DR | 9 | Tech-forward segment |
| TD | 9 | Hot-desk booking, membership tiers, meeting rooms |
| RS | 8 | CAC only; no sector regulator |
| RP | 8 | Monthly subscriptions; corporate day passes |
| **TOTAL** | **41** | **P1** |

- **Entity type:** organization or place
- **Proposed family:** NF-PRP-SVC (new — Property Services)
- **Regulatory gate:** CAC; fire safety; state signage permit
- **Core template needs:** Seat/desk type listing (hot-desk, dedicated desk, private office, virtual office), day pass and monthly membership booking, meeting room calendar, member community events, amenities showcase (WiFi speed, power backup, coffee bar), virtual office mailbox service, pricing tiers
- **Discovery tags:** co-working, coworking, shared office, hot desk, business hub, flex office, virtual office, meeting room, startup space, innovation hub, Lagos workspace

---

### VN-PRP-002 (proposed) | `property-management` | Property Management Company

| Dimension | Score | Notes |
|---|---|---|
| NMD | 8 | Major Lagos/Abuja segment |
| DR | 7 | Growing; landlords want digital transparency |
| TD | 8 | Landlord portal, rent collection, maintenance |
| RS | 6 | Estate Surveyors and Valuers Board (ESVARBON) for licensed managers |
| RP | 8 | Recurring management fees (5–10% of rent) |
| **TOTAL** | **37** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-PRP-SVC
- **Regulatory gate:** ESVARBON (Estate Surveyors and Valuers Registration Board of Nigeria) for valuers; CAC
- **Core template needs:** Property portfolio, landlord dashboard, tenant management, rent collection and receipts, maintenance request tracking (with vendor dispatch), monthly statement to landlord, vacancy listings

---

### VN-PRP-003 (proposed) | `student-hostel` | Student Hostel / Dormitory Operator

| Dimension | Score | Notes |
|---|---|---|
| NMD | 8 | Massive market near universities (Ibadan, Nsukka, Zaria, Benin) |
| DR | 6 | Growing digital adoption |
| TD | 8 | Room type booking, academic term billing, caution deposit |
| RS | 7 | State Ministry of Education; fire safety |
| RP | 6 | Lower ticket but very high volume |
| **TOTAL** | **35** | **P2** |

- **Entity type:** organization or place
- **Proposed family:** NF-PRP-SVC
- **Regulatory gate:** State Ministry of Education / university proximity permit; fire safety; CAC
- **Core template needs:** Room inventory by type (single, double, room self-contain), academic calendar-based booking, room-search and availability, caution deposit management, house rules, utility billing, visitor management

---

## PROPOSED CATEGORY: WELLNESS

### VN-WEL-001 (proposed) | `yoga-studio` | Yoga / Pilates / Meditation Studio

| Dimension | Score | Notes |
|---|---|---|
| NMD | 5 | Growing rapidly in Lagos, Abuja, Port Harcourt |
| DR | 9 | Urban, educated demographic |
| TD | 8 | Class schedule, instructor profiles, live streaming |
| RS | 8 | No specific regulator |
| RP | 7 | Premium membership pricing |
| **TOTAL** | **37** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-WEL-STU (new — Wellness Studio)
- **Regulatory gate:** CAC; no sector regulator; fire safety for premises
- **Core template needs:** Class schedule (in-person + online), instructor profiles and certifications, membership tiers, drop-in class booking, series/retreat packages, online class links, student testimonials, wellness blog

---

### VN-WEL-002 (proposed) | `traditional-medicine` | Traditional Medicine Practitioner / Herbal Shop

| Dimension | Score | Notes |
|---|---|---|
| NMD | 10 | Enormous informal sector; formalizing rapidly |
| DR | 5 | Lower digital readiness; growing younger generation |
| TD | 9 | Remedy catalog, NAFDAC-registered products, condition search |
| RS | 4 | NAFDAC (herbal products); Traditional Medicine Board |
| RP | 6 | Low-to-mid ticket; very high volume |
| **TOTAL** | **34** | **P2** |

- **Entity type:** individual or organization
- **Proposed family:** NF-WEL-ALT (new — Alternative Health)
- **Regulatory gate:** NAFDAC (herbal product registration); State Traditional Medicine Board; CAC
- **Core template needs:** Remedy/herb catalog (with NAFDAC reg numbers), condition-based browsing, preparation instructions, consultation booking, wholesale enquiry, testimony/testimonials, safety and disclaimer notice

---

### VN-WEL-003 (proposed) | `health-food-store` | Supplement / Health Food Store

| Dimension | Score | Notes |
|---|---|---|
| NMD | 6 | Growing middle-class wellness market |
| DR | 8 | Instagram-savvy operators |
| TD | 7 | Product catalog, NAFDAC tags, subscription boxes |
| RS | 5 | NAFDAC for all supplements |
| RP | 7 | Online + physical retail hybrid |
| **TOTAL** | **33** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-WEL-ALT
- **Regulatory gate:** NAFDAC (for all supplement and functional food products)
- **Core template needs:** Product catalog with NAFDAC numbers, health benefit descriptions, ingredient transparency, subscription box builder, subscription management, nutritionist Q&A, loyalty points

---

## PROPOSED CATEGORY: COMMERCE EXPANSION

### VN-COM-001 (proposed) | `electronics-store` | Electronics / Mobile Phone Retail Store

| Dimension | Score | Notes |
|---|---|---|
| NMD | 10 | Massive — Alaba, Computer Village, every market |
| DR | 8 | Large retailers already use ERP; small ones lag |
| TD | 8 | Product catalog with specs, warranty, brand |
| RS | 7 | CAC; SON (for standards) |
| RP | 8 | High average transaction value |
| **TOTAL** | **41** | **P1** |

- **Entity type:** organization
- **Proposed family:** NF-COM-RET (new — General Retail)
- **Regulatory gate:** CAC; SON (Standards Organisation of Nigeria) for electrical goods; NAFDAC (for accessories with chemical components)
- **Core template needs:** Product catalog by brand and category (phones, laptops, TVs, appliances), price list, warranty terms per product, trade-in calculator, after-sales service booking, payment plans, compare tool, brand partner pages

---

### VN-COM-002 (proposed) | `jewellery-shop` | Jewellery Shop / Goldsmith

| Dimension | Score | Notes |
|---|---|---|
| NMD | 8 | Significant gifting + social economy |
| DR | 7 | Instagram-led; growing e-commerce |
| TD | 8 | Product gallery, custom design, authenticity |
| RS | 6 | CAC; CBN (gold dealers) |
| RP | 8 | High average ticket |
| **TOTAL** | **37** | **P2** |

- **Entity type:** organization or individual (goldsmith)
- **Proposed family:** NF-COM-RET
- **Regulatory gate:** CAC; CBN (gold dealers); SON for hallmarked gold
- **Core template needs:** High-res product gallery by type (bridal, casual, custom), material and stone filters, custom design request form, authenticity certificate, wedding set packages, layaway/installment payment, gift wrapping option

---

### VN-COM-003 (proposed) | `baby-shop` | Baby Shop / Maternity Store

| Dimension | Score | Notes |
|---|---|---|
| NMD | 9 | Nigeria highest birth rate in Africa |
| DR | 7 | Young parent demographic — highly digital |
| TD | 8 | Age-based catalog, registry, subscription |
| RS | 6 | NAFDAC (baby food, formula) |
| RP | 7 | Regular repeat purchases |
| **TOTAL** | **37** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-COM-RET
- **Regulatory gate:** NAFDAC (baby food, formula, feeding equipment); CAC; SON (safety standards for baby products)
- **Core template needs:** Age-stage product catalog (0–3m, 3–6m, etc.), baby gift registry, brand showcase (Pampers, Enfamil, Graco), subscription for consumables (diapers, formula), maternity wear section, new parent blog

---

### VN-COM-004 (proposed) | `cosmetics-shop` | Perfume & Cosmetics Shop

| Dimension | Score | Notes |
|---|---|---|
| NMD | 9 | Largest cosmetics market in sub-Saharan Africa |
| DR | 8 | Beauty retail is heavily Instagram/TikTok driven |
| TD | 8 | NAFDAC tags, shade matching, fragrance notes |
| RS | 5 | NAFDAC (all cosmetics); SON; import licensing |
| RP | 8 | High turnover; repeat purchases |
| **TOTAL** | **38** | **P2** |

- **Entity type:** organization
- **Proposed family:** NF-COM-RET
- **Regulatory gate:** NAFDAC (mandatory for all cosmetics sold in Nigeria); SON; import permit for imported products
- **Core template needs:** Product catalog by category (skin, hair, fragrance, makeup), NAFDAC registration number per product, skin-tone-based filter (for foundation, concealer), fragrance wheel, bundle deals, loyalty program, brand partnerships

---

### VN-COM-005 (proposed) | `thrift-store` | Secondhand / Thrift Store

| Dimension | Score | Notes |
|---|---|---|
| NMD | 9 | Okrika market is enormous; Instagram thrift booming |
| DR | 8 | Younger demographic — extremely digital |
| TD | 8 | Condition grading, size charts, drop notifications |
| RS | 8 | CAC; no specific regulator |
| RP | 6 | Lower ticket but fast-moving |
| **TOTAL** | **39** | **P2** |

- **Entity type:** organization or individual
- **Proposed family:** NF-COM-RET
- **Regulatory gate:** CAC; State Environmental Health (for textile imports)
- **Core template needs:** Product listing with condition grading (A-grade, B-grade, Okrika), size guide, brand/type filter, drop date announcements, Instagram integration, bundle pricing, pre-order waiting list

---

## Candidate Registry Summary Table

| Proposed VN-ID | Slug | Display Name | Category | Score | Priority | Family |
|---|---|---|---|---|---|---|
| VN-HLT-012 | `hospital` | Hospital / Secondary Healthcare | Health | 41 | **P1** | NF-HLT-HOS |
| VN-HLT-013 | `diagnostic-lab` | Medical / Diagnostic Laboratory | Health | 40 | **P1** | NF-HLT-HOS |
| VN-HLT-014 | `physiotherapy` | Physiotherapy / OT Clinic | Health | 37 | P2 | NF-HLT-THR |
| VN-HLT-015 | `mental-health` | Mental Health / Counselling | Health | 37 | P2 | NF-HLT-THR |
| VN-HLT-016 | `maternity-clinic` | Maternity / Birthing Centre | Health | 37 | P2 | NF-HLT-MAT |
| VN-EDU-009 | `university` | University / Polytechnic | Education | 40 | **P1** | NF-EDU-TER |
| VN-EDU-010 | `exam-prep-centre` | Exam Preparation Centre | Education | 40 | **P1** | NF-EDU-SCH |
| VN-EDU-011 | `elearning-platform` | E-Learning Platform | Education | 43 | **P1** | NF-EDU-DIG |
| VN-EDU-012 | `tutorial-centre` | Tutorial / Group Lesson Centre | Education | 38 | P2 | NF-EDU-SCH |
| VN-EDU-013 | `tech-academy` | Technology / Coding Academy | Education | 40 | **P1** | NF-EDU-DIG |
| VN-FIN-008 | `microfinance-bank` | Microfinance Bank | Financial | 38 | P2 | NF-FIN-REG |
| VN-FIN-009 | `insurance-company` | Insurance Underwriter | Financial | 36 | P2 | NF-FIN-REG |
| VN-FIN-010 | `credit-union` | Credit Union / SACCO | Financial | 34 | P2 | NF-FIN-COP |
| VN-FIN-011 | `pension-fund` | Pension Fund Administrator | Financial | 35 | P2 | NF-FIN-REG |
| VN-FIN-012 | `stockbroker` | Stockbroker / Securities Dealer | Financial | 36 | P2 | NF-FIN-REG |
| VN-PRO-009 | `software-agency` | Software / App Development Agency | Professional | 44 | **P1** | NF-TEC-AGY |
| VN-PRO-010 | `architecture-firm` | Architecture / Interior Design Firm | Professional | 37 | P2 | NF-PRO-DES |
| VN-PRO-011 | `recruitment-agency` | HR / Recruitment Agency | Professional | 41 | **P1** | NF-PRO-HR |
| VN-PRO-012 | `management-consulting` | Management Consulting Firm | Professional | 40 | **P1** | NF-PRO-ADV |
| VN-PRO-013 | `digital-marketing-agency` | Digital Marketing Agency | Professional | 43 | **P1** | NF-TEC-AGY |
| VN-PRO-014 | `cac-registration-agent` | CAC Registration Agent | Professional | 34 | P2 | NF-PRO-ADV |
| VN-TEC-001 | `cybersecurity-firm` | Cybersecurity Company | Technology | 41 | **P1** | NF-TEC-SEC |
| VN-TEC-002 | `data-analytics-firm` | Data Analytics / BI Firm | Technology | 40 | **P1** | NF-TEC-AGY |
| VN-HSP-001 | `bar-lounge` | Bar / Lounge / Nightclub | Hospitality | 36 | P2 | NF-HSP-ENT |
| VN-HSP-002 | `resort` | Resort / Leisure Park | Hospitality | 35 | P2 | NF-HSP-ACM |
| VN-HSP-003 | `vacation-rental` | Vacation Rental Portfolio | Hospitality | 38 | P2 | NF-HSP-ACM |
| VN-HSP-004 | `food-court` | Food Court / Multi-Vendor Canteen | Hospitality | 34 | P2 | NF-FDS |
| VN-PRP-001 | `coworking-space` | Co-working Space / Business Hub | Property | 41 | **P1** | NF-PRP-SVC |
| VN-PRP-002 | `property-management` | Property Management Company | Property | 37 | P2 | NF-PRP-SVC |
| VN-PRP-003 | `student-hostel` | Student Hostel Operator | Property | 35 | P2 | NF-PRP-SVC |
| VN-WEL-001 | `yoga-studio` | Yoga / Pilates / Meditation Studio | Wellness | 37 | P2 | NF-WEL-STU |
| VN-WEL-002 | `traditional-medicine` | Traditional Medicine Practitioner | Wellness | 34 | P2 | NF-WEL-ALT |
| VN-WEL-003 | `health-food-store` | Supplement / Health Food Store | Wellness | 33 | P2 | NF-WEL-ALT |
| VN-COM-001 | `electronics-store` | Electronics / Mobile Phone Store | Commerce | 41 | **P1** | NF-COM-RET |
| VN-COM-002 | `jewellery-shop` | Jewellery Shop / Goldsmith | Commerce | 37 | P2 | NF-COM-RET |
| VN-COM-003 | `baby-shop` | Baby Shop / Maternity Store | Commerce | 37 | P2 | NF-COM-RET |
| VN-COM-004 | `cosmetics-shop` | Perfume & Cosmetics Shop | Commerce | 38 | P2 | NF-COM-RET |
| VN-COM-005 | `thrift-store` | Secondhand / Thrift Store | Commerce | 39 | P2 | NF-COM-RET |

**P1 candidates total: 15** (scores ≥ 40)
**P2 candidates total: 23** (scores 30–39)

---

*Produced: 2026-04-26 — Deep Research & Expansion Design Phase*
*All entries are CANDIDATES. No canonical promotion without CSV update + governance doc update.*
