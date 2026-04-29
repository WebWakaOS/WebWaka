# WebWaka OS — Universe Gap Analysis

**Status:** AUTHORITATIVE — Research Phase
**Date:** 2026-04-26
**Parent:** `docs/templates/expansion/00-expansion-master-blueprint.md`
**Scope:** Systematic analysis of what is missing from the current 157-niche universe

---

## Method

For each of the 14 existing industry categories, this document:
1. Lists every current niche in the category
2. Identifies major Nigerian business types NOT represented
3. Explains why the gap matters
4. Tags each gap as HIGH / MEDIUM / LOW urgency

Additional sections cover cross-cutting gaps (entity types, digital platform gaps, diaspora economy gaps).

---

## CATEGORY 1: COMMERCE (45 niches current)

### Current Commerce Niches
`pos-business`, `sole-trader`, `restaurant`, `food-vendor`, `catering`, `bakery`, `restaurant-chain`, `hotel`, `supermarket`, `bookshop`, `florist`, `beauty-salon`, `spa`, `hair-salon`, `tailor`, `tailoring-fashion`, `shoemaker`, `laundry`, `cleaning-service`, `laundry-service`, `cleaning-company`, `print-shop`, `printing-press`, `electronics-repair`, `phone-repair-shop`, `security-company`, `furniture-maker`, `welding-fabrication`, `event-hall`, `event-planner`, `wedding-planner`, `events-centre`, `construction`, `building-materials`, `iron-steel`, `real-estate-agency`, `property-developer`, `electrical-fittings`, `plumbing-supplies`, `paints-distributor`, `auto-mechanic`, `car-wash`, `tyre-shop`, `used-car-dealer`, `spare-parts`, `motorcycle-accessories`

### Commerce Gaps

#### HIGH URGENCY

**GAP-COM-001: Electronics / Mobile Phone Retail Store**
- Slug candidate: `electronics-store`
- Description: Shop selling new phones, tablets, laptops, TVs, home appliances
- Why missing: `electronics-repair` covers repair; `phone-repair-shop` covers repair + accessories. Neither covers a pure retail store selling new branded devices (Samsung, Tecno, iPhone). This is one of the most common shop types in Nigerian markets (Alaba International Market, Computer Village, Ikeja).
- NBS relevance: Electronics retail is one of the fastest-growing retail segments in Nigeria (>₦2 trillion annual turnover per NBS trade statistics)
- Template needs: Product catalog, brand partnerships, warranty registration, after-sales service, POS integration, price comparison

**GAP-COM-002: Jewellery Shop / Gold Dealer**
- Slug candidate: `jewellery-shop`
- Description: Jewellery retailer, goldsmith, bead maker, or precious metals dealer
- Why missing: Zero coverage of jewellery in the current universe
- Nigeria context: Jewellery is a significant gifting economy in Nigeria (weddings, engagements, naming ceremonies). Gold trading in markets like Wuse Market (Abuja) and Trade Fair (Lagos). CAC required; gold dealers may need CBN anti-money laundering registration.
- Template needs: Product catalog with high-res imagery, custom design requests, authentication certificates, layaway/payment plans

**GAP-COM-003: Baby Shop / Maternity Store**
- Slug candidate: `baby-shop`
- Description: Retailer specializing in baby products, maternity wear, prams, and infant care
- Why missing: None of the existing niches cover this segment
- Nigeria context: Nigeria has the highest birth rate in Africa (>6 million births/year). Baby product retail is a distinct, specialized business with specific inventory, brands (Pampers, SMA, Tomee Tippee), and customer journey
- Template needs: Age-based product catalog, wishlist/registry, delivery, subscription for diapers/formula

**GAP-COM-004: Secondhand / Thrift Store (Okrika)**
- Slug candidate: `thrift-store`
- Description: Used clothing, electronics, furniture, or goods retailer
- Why missing: Not represented despite being a massive informal economy segment
- Nigeria context: "Okrika" (secondhand clothing) markets are ubiquitous across Nigeria. Bale (bundle) trading is a distinct business model. Growing Instagram-based thrift shops are seeking digital presence.
- Template needs: Bundle/bale listings, Instagram integration, size charts, condition grading

**GAP-COM-005: Perfume & Cosmetics Shop**
- Slug candidate: `cosmetics-shop`
- Description: Retailer of perfumes, cosmetics, skincare, and beauty products
- Why missing: `beauty-salon` covers services; `spa` covers treatments. No niche covers retail of beauty products.
- Nigeria context: Nigeria is the largest cosmetics market in sub-Saharan Africa. Per NBS, cosmetics/personal care retail accounts for >₦500 billion annually. NAFDAC registration required for imported cosmetics.
- Template needs: Product catalog, NAFDAC compliance tags, skin-tone advisors, bundle deals, fragrance descriptions

#### MEDIUM URGENCY

**GAP-COM-006: Toy & Children's Store**
- Slug candidate: `toy-store`
- Description: Retailer of children's toys, games, and educational materials
- Why missing: No children's retail coverage except baby-shop (proposed above)
- Template needs: Age-group catalog, birthday party packages, gift wrapping, safety certifications

**GAP-COM-007: Sports Goods & Equipment Shop**
- Slug candidate: `sports-shop`
- Description: Retailer of sporting goods, jerseys, equipment, and activewear
- Why missing: `sports-academy` and `gym` cover services; no niche covers sports retail
- Template needs: Team ordering, jersey customization, equipment rental, event-ready stocks

**GAP-COM-008: Home Appliances & Furniture Store**
- Slug candidate: `home-store`
- Description: Retailer of home appliances (fridges, washing machines, cookers) and furniture showroom
- Why missing: `supermarket` covers groceries; `furniture-maker` covers bespoke production. No niche covers appliance retail.
- Template needs: Product catalog with specs, installment payment, delivery + installation, warranty tracking

**GAP-COM-009: Stationery & Office Supplies Wholesaler**
- Slug candidate: `office-supplies`
- Description: B2B supplier of office consumables, stationery, and equipment
- Why missing: `bookshop` covers retail books/stationery but is consumer-focused. Office supplies wholesale is a distinct B2B niche.
- Template needs: Bulk pricing, purchase orders, recurring subscriptions, corporate accounts

**GAP-COM-010: Gift Shop / Souvenir Store**
- Slug candidate: `gift-shop`
- Description: Curated gifts, souvenirs, Ankara gifts, custom printing on gifts
- Why missing: Not covered
- Template needs: Occasion-based catalog, custom engraving, delivery scheduling, corporate gifting

---

## CATEGORY 2: HEALTH (9 niches current)

### Current Health Niches
`clinic`, `pharmacy`, `pharmacy-chain`, `sports-academy`, `gym`, `optician`, `dental-clinic`, `vet-clinic`, `rehab-centre`, `elderly-care`, `community-health`

### Health Gaps

#### HIGH URGENCY

**GAP-HLT-001: Hospital / Secondary Healthcare Facility**
- Slug candidate: `hospital`
- Description: Private hospital with inpatient wards, surgery, multiple departments
- Why missing: `clinic` covers primary/outpatient care only. Inpatient hospitals are a categorically different business.
- Nigeria context: Over 20,000 private hospitals registered with MDCN. Average Lagos private hospital turns over ₦50–500M/year. Massive SaaS gap — most run on paper or basic Excel.
- Regulatory: MDCN, Ministry of Health state license, NHIA accreditation
- Template needs: Ward management, admission/discharge, surgery scheduling, lab integration, NHIA billing, nurse station

**GAP-HLT-002: Medical / Diagnostic Laboratory**
- Slug candidate: `diagnostic-lab`
- Description: Medical laboratory for blood tests, imaging, X-ray, pathology
- Why missing: Zero coverage. Labs are distinct businesses from clinics — they serve walk-in patients AND fulfill clinic referrals.
- Nigeria context: MLSCN (Medical Laboratory Science Council of Nigeria) licenses labs. Every community has at least one lab. Digital gap is extreme — most labs send results by WhatsApp PDF.
- Regulatory: MLSCN license, NAFDAC (reagents)
- Template needs: Test catalog, sample tracking, result delivery portal, doctor referral network, QA logs

**GAP-HLT-003: Physiotherapy / Occupational Therapy Clinic**
- Slug candidate: `physiotherapy`
- Description: Physiotherapy, occupational therapy, sports medicine
- Why missing: `gym` and `sports-academy` cover fitness; `clinic` covers primary care; physiotherapy is a distinct licensed profession
- Regulatory: Physiotherapy Council of Nigeria (PCN-PT) license
- Template needs: Session booking, exercise plan management, patient progress tracking, home visit scheduling

**GAP-HLT-004: Mental Health / Counselling Practice**
- Slug candidate: `mental-health`
- Description: Psychiatric clinic, psychologist practice, counselling centre
- Why missing: `rehab-centre` covers addiction recovery; pure mental health/counselling is uncovered
- Nigeria context: Mental health awareness is growing rapidly in Nigeria. Growing number of registered psychologists, counsellors, and psychiatrists seeking professional digital presence.
- Regulatory: MDCN (for psychiatrists), Nigerian Society of Clinical Psychologists registration
- Template needs: Appointment booking (private/confidential), therapist profiles, session notes, crisis referral links, teletherapy integration

**GAP-HLT-005: Maternity / Mother & Baby Clinic**
- Slug candidate: `maternity-clinic`
- Description: Antenatal/postnatal clinic, midwifery, birthing centre
- Why missing: `clinic` is generic; maternity is a highly specialized, high-volume Nigerian healthcare segment
- Nigeria context: Nigeria's maternal health is a national priority. Private maternity homes and midwifery centres are the primary birthing option for millions of Nigerians.
- Regulatory: MDCN, Nursing & Midwifery Council of Nigeria (NMCN), state Ministry of Health
- Template needs: Antenatal appointment tracking, scan booking, delivery room booking, postnatal visits, baby growth charts

#### MEDIUM URGENCY

**GAP-HLT-006: Ambulance / Emergency Medical Services**
- Slug candidate: `ambulance-service`
- Description: Private ambulance operator, emergency response company
- Why missing: No transport or health niche covers this
- Template needs: Emergency dispatch, subscription plans, corporate contracts, route-to-hospital directory

**GAP-HLT-007: Nursing Agency / Home Care**
- Slug candidate: `nursing-agency`
- Description: Agency supplying nurses, caregivers, and home health aides
- Why missing: `elderly-care` covers the facility; this covers the staff supply agency
- Template needs: Nurse profiles, placement management, shift scheduling, background verification

**GAP-HLT-008: Fertility Clinic / IVF Centre**
- Slug candidate: `fertility-clinic`
- Description: Assisted reproductive technology, IVF, fertility consultation
- Why missing: High-value, emerging segment in Nigeria
- Template needs: Treatment cycle tracking, patient confidentiality, multi-cycle billing, medication schedules

---

## CATEGORY 3: EDUCATION (8 niches current)

### Current Education Niches
`school`, `private-school`, `govt-school`, `training-institute`, `driving-school`, `tutoring`, `creche`, `nursery-school`

### Education Gaps

#### HIGH URGENCY

**GAP-EDU-001: Tertiary Institution (University / Polytechnic)**
- Slug candidate: `university`
- Description: Private university, polytechnic, or college of education
- Why missing: All current edu niches cover K-12 or vocational; no tertiary coverage
- Nigeria context: NUC (National Universities Commission) has licensed over 100 private universities. Federal Polytechnics and private polytechnics are equally significant.
- Regulatory: NUC (universities), NBTE (polytechnics), NCCE (colleges of education)
- Template needs: Programme catalog, application portal, student portal, faculty directory, alumni network, fee payment

**GAP-EDU-002: Exam Preparation Centre**
- Slug candidate: `exam-prep-centre`
- Description: Dedicated JAMB, WAEC, NECO, SAT, IELTS, GRE preparation facility
- Why missing: `tutoring` covers individual tutors; exam prep centres are organizations with classroom infrastructure
- Nigeria context: JAMB exam prep is an enormous industry — >1.8 million students sit JAMB each year. Prep centres in Ojodu, Abule-Egba, and similar areas are major businesses.
- Template needs: Course enrollment, past questions database, mock exam scheduling, progress tracking, JAMB CBT simulator

**GAP-EDU-003: E-Learning Platform / Online Education Provider**
- Slug candidate: `elearning-platform`
- Description: Online course platform, digital school, LMS operator
- Why missing: All current edu niches are physical facilities; no purely digital education niche exists
- Nigeria context: Post-COVID, numerous Nigerian online schools and LMS operators emerged (Kodecamp, Decagon, AltSchool, Ingressive for Good). A WebWaka template for this segment is a major opportunity.
- Template needs: Course catalog, video hosting links, student enrollment, payment + access control, certificate generation, cohort management

**GAP-EDU-004: Tutorial Centre / Group Lesson Centre**
- Slug candidate: `tutorial-centre`
- Description: Group academic lessons, extracurricular classes, after-school centre
- Why missing: `tutoring` = individual teacher; `school` = formal school. Tutorial centres (like those in Lagos suburbs) are a distinct hybrid — multiple teachers, multiple subjects, classroom facility.
- Template needs: Class timetable, subject enrollment, attendance tracking, fee collection, parent portal

#### MEDIUM URGENCY

**GAP-EDU-005: Tech / Coding Academy**
- Slug candidate: `tech-academy`
- Description: Coding bootcamp, digital skills academy, cybersecurity training
- Why missing: `training-institute` is generic; tech academies need portfolio showcase, job placement tracking, employer partnerships
- Template needs: Cohort enrollment, curriculum showcase, alumni job board, employer partner directory

**GAP-EDU-006: Language School / Translation Centre**
- Slug candidate: `language-school`
- Description: Language training (French, English, Chinese, Yoruba, Arabic), translation services
- Why missing: Not covered at all
- Template needs: Course levels, certified instructors, proficiency certificates, booking

---

## CATEGORY 4: FINANCIAL SERVICES (6 niches current)

### Current Finance Niches
`savings-group`, `insurance-agent`, `airtime-reseller`, `mobile-money-agent`, `bureau-de-change`, `hire-purchase`, `bank-branch`

### Finance Gaps

#### HIGH URGENCY

**GAP-FIN-001: Microfinance Bank (MFB)**
- Slug candidate: `microfinance-bank`
- Description: CBN-licensed microfinance bank operating in a state or national territory
- Why missing: The most gaping financial sector gap. MFBs are formal regulated institutions — categorically distinct from `savings-group` (informal), `mobile-money-agent` (individual), or `bank-branch` (large bank outlet).
- Nigeria context: CBN licenses ~900 MFBs in Nigeria. These institutions serve millions of underbanked Nigerians. Most run on legacy software or basic spreadsheets.
- Regulatory: CBN MFB license (unit/state/national tier)
- Template needs: Loan application portal, passbook/account management, CBN reporting, KYC tiers, savings products, group lending

**GAP-FIN-002: Insurance Company / Underwriter**
- Slug candidate: `insurance-company`
- Description: Licensed insurance underwriter or insurance company (distinct from individual agent)
- Why missing: `insurance-agent` covers individual brokers/agents; no niche for the insurance company itself
- Regulatory: NAICOM license
- Template needs: Policy catalog, claims management, agent network, risk profiles, premium calculator

**GAP-FIN-003: Pension / Retirement Planning**
- Slug candidate: `pension-fund`
- Description: Pension Fund Administrator (PFA) or retirement savings agent
- Why missing: Pension is a significant regulated sector in Nigeria (PenCom-licensed PFAs manage >₦20 trillion AUM)
- Regulatory: PenCom license
- Template needs: RSA (Retirement Savings Account) management, contribution tracking, fund performance, employer integration

**GAP-FIN-004: Cooperative Credit Union (SACCO)**
- Slug candidate: `credit-union`
- Description: Credit union / SACCO offering savings, credit, and member financial services
- Why missing: `cooperative` covers general cooperatives; `savings-group` covers informal thrift. Credit unions are formal regulated entities distinct from both.
- Regulatory: CAC cooperative registration; state cooperative federation oversight
- Template needs: Share capital management, loan processing, dividend computation, member accounts

#### MEDIUM URGENCY

**GAP-FIN-005: Stockbroker / Securities Dealer**
- Slug candidate: `stockbroker`
- Description: SEC-licensed stockbroker or investment securities dealer
- Why missing: No capital markets coverage at all
- Regulatory: SEC license, NSE membership
- Template needs: Client portfolio display, trade reporting, market updates, statement generation

**GAP-FIN-006: Mortgage / Property Finance Company**
- Slug candidate: `mortgage-company`
- Description: Primary mortgage institution, mortgage bank, or property loan company
- Why missing: `real-estate-agency` covers brokerage; no financing niche
- Regulatory: CBN/FMB license
- Template needs: Loan eligibility calculator, property-linked loan applications, amortization schedules

---

## CATEGORY 5: PROFESSIONAL SERVICES (8 niches current)

### Current Professional Niches
`professional`, `law-firm`, `accounting-firm`, `handyman`, `generator-repair`, `tax-consultant`, `funeral-home`, `pr-firm`

### Professional Services Gaps

#### HIGH URGENCY

**GAP-PRO-001: Software / App Development Agency**
- Slug candidate: `software-agency`
- Description: Software development company, app development studio, web development agency
- Why missing: `it-support` covers repair/maintenance; `startup` covers product companies; neither covers the service agency model
- Nigeria context: Lagos Tech Ecosystem is one of Africa's largest. Hundreds of agencies in Yaba, Victoria Island, Abuja building software for clients. Most lack proper digital presence beyond LinkedIn.
- Template needs: Portfolio showcase, technology stack display, project case studies, team profiles, request for proposal (RFP) form, client testimonials

**GAP-PRO-002: Architecture / Interior Design Firm**
- Slug candidate: `architecture-firm`
- Description: Architectural practice, interior design studio, urban planning firm
- Why missing: `construction` covers the build; `real-estate-agency` covers the property. Architecture as a professional design discipline is uncovered.
- Regulatory: ARCON (Architects Registration Council of Nigeria)
- Template needs: Project portfolio with renders, team credentials, ARCON license display, client brief form, 3D model showcase

**GAP-PRO-003: HR / Recruitment Agency**
- Slug candidate: `recruitment-agency`
- Description: Human resources consulting, talent acquisition, job placement agency
- Why missing: No HR or staffing niche exists in the current universe
- Nigeria context: Nigeria's job market is enormous; recruitment agencies operate at every level from informal (NSCDC-area fixers) to formal (Robert Walters, Michael Stevens).
- Template needs: Job listings, candidate profiles, employer portal, placement tracker, CV upload

**GAP-PRO-004: Management Consulting Firm**
- Slug candidate: `consulting-firm`
- Description: Strategy consulting, business advisory, operations consulting
- Why missing: `accounting-firm` and `law-firm` cover licensed professions; general consulting is uncovered
- Template needs: Service areas, case studies, team credentials, engagement proposal form, client portal

#### MEDIUM URGENCY

**GAP-PRO-005: Digital Marketing Agency**
- Slug candidate: `digital-marketing-agency`
- Description: Social media management, SEO, paid ads, email marketing agency
- Why missing: `advertising-agency` is very broad (traditional + digital); a digital-first agency has distinct template needs
- Template needs: Service packages (social media, SEO, PPC), campaign portfolio, platform expertise badges, client onboarding form

**GAP-PRO-006: Patent / IP Agent**
- Slug candidate: `ip-agent`
- Description: Patent attorney, trademark agent, IP registration consultant
- Why missing: `law-firm` could cover this but IP agents in Nigeria are often non-lawyers (agents registered with FIPO)
- Regulatory: FIPO (Federal Institute of Patent Officers) registration
- Template needs: Trademark search tool, IP application forms, status tracking, client portfolio

**GAP-PRO-007: Business Registration Agent (CAC Agent)**
- Slug candidate: `cac-registration-agent`
- Description: CAC accredited agent providing business registration, compliance filing, annual returns
- Why missing: One of the most common professional services in Nigeria — agents helping individuals and businesses register with CAC
- Template needs: Service menu (business name, limited company, trust), document upload, status tracker, fee calculator

---

## CATEGORY 6: TECHNOLOGY SERVICES (2 niches current)

### Current Tech Niches
`it-support`, `internet-cafe`

### Technology Gaps

#### HIGH URGENCY

**GAP-TEC-001: Software / App Development Agency** *(cross-listed from Professional)*
- See GAP-PRO-001 above

**GAP-TEC-002: Cybersecurity Firm**
- Slug candidate: `cybersecurity-firm`
- Description: Information security company, penetration testing, SOC services, CCTV/digital security
- Why missing: Nigeria's digital economy has produced a significant cybersecurity sector driven by banking, fintech, and government demand. Zero coverage currently.
- Regulatory: NCC registration for some services; NIS-ISO 27001 certification
- Template needs: Service catalog, certification badges, incident response portal, client assessment form

**GAP-TEC-003: Data Analytics / BI Consultancy**
- Slug candidate: `data-analytics-firm`
- Description: Business intelligence, data science, market research firm
- Why missing: Growing sector in Nigeria's enterprise and FMCG market
- Template needs: Service catalog, case studies, tool integrations (Power BI, Tableau), team profiles

---

## CATEGORY 7: HOSPITALITY (1 niche current — `hotel`)

### Hospitality Gaps

#### HIGH URGENCY

**GAP-HSP-001: Bar / Lounge / Nightclub**
- Slug candidate: `bar-lounge`
- Description: Bar, cocktail lounge, nightclub, sports bar
- Why missing: Massive gap. Bars and lounges are among the most common leisure businesses in Nigerian cities. `restaurant` covers food service; `hotel` includes bars as an ancillary. A standalone bar/lounge niche does not exist.
- Regulatory: State liquor licence, CAC, NAFDAC (for alcohol import/distribution)
- Template needs: Drinks menu, events calendar, DJ/artist bookings, table reservations, happy hour highlights, age verification notice

**GAP-HSP-002: Resort / Leisure Park**
- Slug candidate: `resort`
- Description: Beach resort, leisure park, water park, eco-resort
- Why missing: Nigeria has growing eco-tourism (Yankari, Obudu, etc.). Private resorts in Lagos (Elegushi, La Campagne) lack proper SaaS solutions.
- Regulatory: CAC, state tourism board license
- Template needs: Room/cabin booking, activity packages, day-use passes, event hosting, gallery

**GAP-HSP-003: Food Court / Canteen**
- Slug candidate: `food-court`
- Description: Multi-vendor food court, staff canteen, university food court
- Why missing: `restaurant` = single-brand; `wholesale-market` = goods. Multi-vendor food courts are a distinct model.
- Template needs: Vendor directory, unified ordering, table booking, loyalty

**GAP-HSP-004: Vacation Rental / Short-let Portfolio**
- Slug candidate: `vacation-rental`
- Description: Airbnb-style operator managing multiple short-let apartments
- Why missing: `hotel` is a single accommodation entity; short-let portfolio operators manage multiple properties for absentee landlords — distinct business model
- Template needs: Property listings, calendar availability, dynamic pricing, guest communication, housekeeping scheduling

---

## CATEGORY 8: AGRICULTURE (12 niches current)

### Agricultural Gaps

**GAP-AGR-001: Aquaculture / Fishery Farm**
- Slug candidate: `aquaculture-farm`
- Description: Fish farming, shrimp farming, catfish production
- Why missing: `poultry-farm` covers poultry/aquaculture generically but the aquaculture business model (ponds, fingerlings, feed management, harvest sales) is distinct enough to warrant its own niche
- Template needs: Pond management, fingerling inventory, feed schedule, harvest sale listing, price board

**GAP-AGR-002: Cattle Ranch / Livestock Farm**
- Slug candidate: `livestock-farm`
- Description: Cattle, goat, sheep farming; dairy production
- Why missing: Nigeria is a major livestock economy (Fulani herdsmen, Sokoto/Katsina livestock trading). No niche covers this.
- Template needs: Herd management, veterinary records, market listings, offtake agreements

**GAP-AGR-003: Rice Mill / Grain Processing**
- Slug candidate: `rice-mill`
- Description: Rice processing mill, grain milling, flour production (distinct from cassava)
- Why missing: `cassava-miller` covers cassava/maize/rice in one niche; rice is distinct enough (Kebbi rice, Ebonyi rice schemes) to justify its own niche
- Template needs: Paddy intake, milling schedule, output grading, buyer marketplace, anchor borrower scheme

**GAP-AGR-004: Beekeeping / Apiary**
- Slug candidate: `apiary`
- Description: Honey production, beeswax, pollination services
- Why missing: Niche but growing; strong export potential (European honey market)
- Template needs: Hive management, honey product catalog, export documentation (NAFDAC)

---

## CATEGORY 9: CIVIC / COMMUNITY (13 niches current)

### Civic Gaps

**GAP-CIV-001: Diaspora / Town Union Association**
- Slug candidate: `diaspora-association`
- Description: Nigerian diaspora association, hometown union, town development union
- Why missing: Nigerian town unions (Igbo, Yoruba, Hausa/Fulani associations) are some of the most organized community groups. They collect levies, fund development, manage reunion events.
- Template needs: Member directory (worldwide), levy collection (Stripe + Paystack), annual reunion events, project fundraising, remittance transparency

**GAP-CIV-002: Alumni Association**
- Slug candidate: `alumni-association`
- Description: University, secondary school, or professional alumni network
- Why missing: School alumni groups in Nigeria are enormously active (especially UNILAG, UI, ABU alumni associations)
- Template needs: Member registration, dues, reunion events, mentorship matching, job board

**GAP-CIV-003: Residents' Association / Estate Management**
- Slug candidate: `residents-association`
- Description: Gated estate management, residents' association, facilities management for housing estates
- Why missing: Growing segment as urban residential estates proliferate across Lagos, Abuja, and Enugu
- Template needs: Levy collection, maintenance request tracking, estate notices, visitor management, estate directory

---

## CATEGORY 10: MEDIA & CREATIVE (12 niches current — including creator-related)

### Media Gaps

**GAP-MED-001: Online News / Digital Media Platform**
- Slug candidate: `online-news`
- Description: Digital news publication, blog-based news outlet, citizen journalism platform
- Why missing: Community radio and newspaper distribution are covered; digital news is not
- Nigeria context: Nigeria has hundreds of online news platforms (Sahara Reporters, The Cable, Pulse NG, Legit NG). Many want a professional digital presence beyond WordPress.
- Template needs: Article catalog, breaking news banner, journalist profiles, subscriber paywall, ad slot management, social sharing

**GAP-MED-002: Video Production Company**
- Slug candidate: `video-production`
- Description: Video production studio, corporate video, Nollywood-adjacent production company
- Why missing: `photography` covers photo + video shoots; a dedicated video production company (equipment, crew, post-production) is a distinct entity
- Template needs: Portfolio reel, production package pricing, equipment list, crew profiles, storyboard client portal

**GAP-MED-003: Magazine / Print Publisher**
- Slug candidate: `magazine-publisher`
- Description: Print or digital magazine, book publisher, content house
- Why missing: `newspaper-distribution` covers distribution; `printing-press` covers physical printing. Publishing as a creative/content business is uncovered.
- Template needs: Publication catalog, digital subscription, advertiser media kit, editorial team, back-issue archive

---

## CATEGORY 11: PROPERTY MANAGEMENT (gap in real estate)

**GAP-PRP-001: Property Management Company**
- Slug candidate: `property-management`
- Description: Company managing residential or commercial properties on behalf of landlords (rent collection, maintenance, tenant management)
- Why missing: `real-estate-agency` focuses on sales/letting transactions; `property-developer` focuses on construction/development. Property management (ongoing facilities and rent operations) is a third distinct model.
- Template needs: Property portfolio, tenant management, rent collection, maintenance requests, statement reporting to landlords

**GAP-PRP-002: Co-working Space / Business Hub**
- Slug candidate: `coworking-space`
- Description: Shared workspace with hot desks, dedicated desks, private offices, meeting rooms
- Why missing: `tech-hub` = community/innovation hub; `event-hall` = event venue. Co-working spaces have a distinct membership model.
- Template needs: Seat/desk booking, hot-desk day pass, monthly membership, meeting room booking, community events, mail handling

**GAP-PRP-003: Student Hostel / Dormitory Operator**
- Slug candidate: `student-hostel`
- Description: Private student accommodation operator near universities
- Why missing: `hotel` is commercial; this is specifically student housing with term-based occupancy, caution deposits, and school-calendar billing
- Template needs: Room inventory, term-based booking, student verification, caution deposit management, house rules

---

## CATEGORY 12: WELLNESS & ALTERNATIVE HEALTH (no current coverage)

**GAP-WEL-001: Yoga / Pilates / Meditation Studio**
- Slug candidate: `yoga-studio`
- Description: Yoga, pilates, meditation, mindfulness studio
- Why missing: `gym` covers equipment-based fitness; yoga/pilates are instructor-led wellness practices distinct enough to need their own template
- Template needs: Class schedule, instructor profiles, membership packages, online class links, pose library

**GAP-WEL-002: Traditional Medicine Practitioner**
- Slug candidate: `traditional-medicine`
- Description: Traditional medicine practitioner, herbal shop, naturopath, cupping therapist
- Why missing: Nigeria has a massive traditional medicine sector. NAFDAC regulates herbal medicine. Many practitioners want digital legitimacy.
- Regulatory: NAFDAC herbal product registration; Traditional Medicine Board (state-level)
- Template needs: Remedy catalog, condition-based search, herbal product listings, NAFDAC numbers, consultation booking

**GAP-WEL-003: Supplement / Health Food Store**
- Slug candidate: `health-food-store`
- Description: Health supplements, vitamins, organic foods, nutrition store
- Why missing: `pharmacy` covers drugs; supplement retail is distinct and not MDCN-gated
- Regulatory: NAFDAC for supplements
- Template needs: Product catalog with ingredient lists, NAFDAC numbers, wellness goals filter, subscription boxes

---

## Cross-Cutting Gaps

### Gap Type A: Individual Entity Gaps
Current universe has very few **individual** entity types compared to organizations. Underserved individual niches:
- Freelance writer / content creator (distinct from `creator`)
- Event DJ / Entertainment DJ
- Personal chef / private cook
- Personal trainer (individual, distinct from `gym`)
- Makeup artist (individual, distinct from `beauty-salon`)

### Gap Type B: Place Entity Gaps
Current place niches: `market`, `tech-hub`, `wholesale-market`, `motor-park`, `event-hall`, `events-centre`, `warehouse`, `fuel-station`, `hotel`, `fish-market`, `abattoir`, `cold-room`, `container-depot`, `community-hall`, `lga-office`, `constituency-office`.

Missing place types:
- Public library / reading room
- Stadium / sports arena (for venue management)
- Amusement park / children's play centre
- Swimming pool / aquatic centre

### Gap Type C: Offering-Only Entities (no physical location)
The platform currently models all niches as having physical locations. Some new candidates are:
- Remote freelance (no location)
- Online tutoring (no location)
- Subscription box service (warehoused/shipped)

### Gap Type D: Platform/Marketplace Business Models
Current niches represent single operators. No current niche represents a marketplace-operator:
- Job board / recruitment platform (distinct from recruitment agency)
- Classifieds / secondhand marketplace
- Peer-to-peer lending platform (distinct from MFB)

---

## Summary Count

| Category | Gaps Found | HIGH | MEDIUM | LOW |
|---|---|---|---|---|
| Commerce | 10 | 5 | 5 | 0 |
| Health | 8 | 5 | 3 | 0 |
| Education | 6 | 4 | 2 | 0 |
| Financial | 6 | 4 | 2 | 0 |
| Professional | 7 | 4 | 3 | 0 |
| Technology | 3 | 2 | 1 | 0 |
| Hospitality | 4 | 2 | 2 | 0 |
| Agriculture | 4 | 2 | 2 | 0 |
| Civic | 3 | 1 | 2 | 0 |
| Media | 3 | 2 | 1 | 0 |
| Property | 3 | 2 | 1 | 0 |
| Wellness | 3 | 2 | 1 | 0 |
| Cross-cutting | 10+ | — | — | — |
| **TOTAL** | **~70+** | **35** | **25** | — |

---

*Produced: 2026-04-26 — Deep Research & Expansion Design Phase*
