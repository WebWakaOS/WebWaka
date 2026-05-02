# Artifact 05 — Vertical and Niche Universe Map
## WebWaka OS: Complete State of All 159 Verticals + 53 Expansion Candidates

**Status:** AUTHORITATIVE — Phase 0 Deep Discovery output  
**Date:** 2026-05-02  
**Sources:** `infra/db/seeds/0004_verticals-master.csv`, `docs/governance/canonical-niche-registry.md`, `docs/governance/niche-master-table.md`, `docs/templates/expansion/`, `docs/reports/pillar2-niche-identity-system-2026-04-25.md`, `docs/reports/pillar3-niche-identity-system-2026-04-26.md`

---

## 1. Universe Summary

| Metric | Value |
|---|---|
| Active canonical niches | **159** |
| P1 (Original, full parity required) | **17** |
| P2 (High-Fit, ≥30/30 Nigeria score) | **63 active** |
| P3 (Medium-Fit, 20–29 score) | **77 active** |
| Deprecated | **3** (gym-fitness, petrol-station, nurtw) |
| Total CSV rows | **162** (159 active + 3 deprecated) |
| Niche families | **39** |
| Standalone niches (no family) | **44** |
| Industry categories | **14** |
| Vertical engine registry entries | **166** (includes some alias/variant entries) |
| Vertical packages | **159** (`packages/verticals-*`) |

---

## 2. Pillar 2 (Branding Template) Status

| Status | Count | Description |
|---|---|---|
| SHIPPED | **154** | All P1 + P2 + 7 P3 niches have brand-runtime templates |
| P3 SHIPPED via P2 sprint | 7 | tax-consultant, tutoring, creche, mobile-money-agent, bureau-de-change, hire-purchase, community-hall |
| CURRENT (next P3 to build) | **1** | `mosque` (VN-CIV-004) |
| READY_FOR_RESEARCH | **70** | Remaining P3 niches |

**Template system:** `apps/brand-runtime/src/lib/template-resolver.ts` → `BUILT_IN_TEMPLATES` Map → 207 niche directories in `apps/brand-runtime/src/templates/niches/`

---

## 3. Pillar 3 (Discovery/Marketplace Template) Status

| Status | Count | Description |
|---|---|---|
| SHIPPED (via P2 sprint) | **7** | Same 7 P3 niches above |
| READY_FOR_RESEARCH | **70** | Remaining P3 niches awaiting Pillar 3 template |

---

## 4. P1 — Original Verticals (17, Full Parity Required Before M10)

| # | Slug | Display Name | Entity | Pillars | Target M | Key Dependency |
|---|---|---|---|---|---|---|
| 1 | `politician` | Individual Politician | individual | 1,2,3 | M8b | politics tables, community |
| 2 | `political-party` | Political Party | organization | 1,2,3 | M8b | politics tables, CAC |
| 3 | `motor-park` | Motor Park / Bus Terminal | place | 1,3 | M8c | FRSC, geography |
| 4 | `mass-transit` | City Bus / Mass Transit | organization | 1,3 | M8c | FRSC, route licensing |
| 5 | `rideshare` | Carpooling / Ride-Hailing | organization | 1,2,3 | M8c | FRSC, offerings.route |
| 6 | `haulage` | Haulage / Logistics | organization | 1,2,3 | M8c | FRSC, CAC |
| 7 | `church` | Church / Faith Community | organization | 1,2,3 | M8d | IT-reg, community_spaces |
| 8 | `ngo` | NGO / Non-Profit | organization | 1,2,3 | M8d | IT-reg, community_spaces |
| 9 | `cooperative` | Cooperative Society | organization | 1,3 | M8d | CAC, membership_tiers |
| 10 | `pos-business` | POS Business Management System | organization | 1,2 | M8b | CAC, inventory schema |
| 11 | `market` | Market / Trading Hub | place | 1,3 | M8e | geography, multi-vendor |
| 12 | `professional` | Professional (Lawyer/Doctor) | individual | 1,2,3 | M8e | license bodies, social |
| 13 | `school` | School / Educational Inst. | organization | 1,2,3 | M8e | CAC, community_courses |
| 14 | `clinic` | Clinic / Healthcare Facility | organization | 1,2,3 | M8e | CAC, license verification |
| 15 | `farm` | Farm / Agricultural Operation | organization | 1,3 | M8e | geography, produce |
| 16 | `creator` | Creator / Influencer | individual | 1,2,3 | M9 | social, community |
| 17 | `savings-group` | Savings Group / Ajo/Esusu | organization | 1,3 | M9 | hl-wallet, membership |

---

## 5. Category Breakdown (All 159 Active)

### POLITICS (7 active)
| VN-ID | P | Slug | Display Name | Family | Entity |
|---|---|---|---|---|---|
| VN-POL-001 | 1 | `politician` | Individual Politician | NF-POL-IND | individual |
| VN-POL-002 | 1 | `political-party` | Political Party | NF-POL-ORG | organization |
| VN-POL-003 | 3 | `campaign-office` | Political Campaign Office | NF-POL-ORG | organization |
| VN-POL-004 | 3 | `lga-office` | Local Government Council / Ward Office | NF-POL-ORG | place |
| VN-POL-005 | 3 | `polling-unit-rep` | Polling Unit Representative | NF-POL-IND | individual |
| VN-POL-006 | 3 | `constituency-office` | Constituency Development Office | NF-POL-ORG | place |
| VN-POL-007 | 2 | `ward-rep` | Ward Representative | NF-POL-IND | individual |

### TRANSPORT (14 active)
| VN-ID | P | Slug | Display Name | Family | Entity |
|---|---|---|---|---|---|
| VN-TRP-001 | 1 | `motor-park` | Motor Park / Bus Terminal | NF-TRP-PAS | place |
| VN-TRP-002 | 1 | `mass-transit` | City Bus / Mass Transit | NF-TRP-PAS | organization |
| VN-TRP-003 | 1 | `rideshare` | Carpooling / Ride-Hailing | NF-TRP-PAS | organization |
| VN-TRP-004 | 1 | `haulage` | Haulage / Logistics Operator | NF-TRP-FRT | organization |
| VN-TRP-005 | 2 | `road-transport-union` | Road Transport Workers Union | standalone | organization |
| VN-TRP-006 | 3 | `okada-keke` | Okada / Keke Rider Co-op | NF-TRP-PAS | organization |
| VN-TRP-007 | 3 | `ferry` | Ferry / Water Transport | NF-TRP-PAS | organization |
| VN-TRP-008 | 3 | `airport-shuttle` | Airport Shuttle Service | NF-TRP-PAS | organization |
| VN-TRP-009 | 3 | `container-depot` | Container Depot / Logistics Hub | NF-STO | place |
| VN-TRP-010 | 2 | `logistics-delivery` | Logistics & Delivery (Last-Mile) | NF-TRP-FRT | organization |
| VN-TRP-011 | 2 | `dispatch-rider` | Dispatch Rider Network | NF-TRP-FRT | organization |
| VN-TRP-012 | 2 | `courier` | Courier Service | NF-TRP-FRT | organization |
| VN-TRP-013 | 3 | `cargo-truck` | Cargo Truck Owner / Fleet Operator | NF-TRP-FRT | individual |
| VN-TRP-014 | 2 | `clearing-agent` | Clearing & Forwarding Agent | NF-TRP-FRT | organization |

### CIVIC (13 active)
| VN-ID | P | Slug | Display Name | Family | Entity |
|---|---|---|---|---|---|
| VN-CIV-001 | 1 | `church` | Church / Faith Community | NF-CIV-REL | organization |
| VN-CIV-002 | 1 | `ngo` | NGO / Non-Profit Organization | NF-CIV-WEL | organization |
| VN-CIV-003 | 1 | `cooperative` | Cooperative Society | NF-CIV-COM | organization |
| **VN-CIV-004** | **3** | **`mosque`** | **Mosque / Islamic Centre** | **NF-CIV-REL** | **organization — CURRENT P3** |
| VN-CIV-005 | 3 | `youth-organization` | Youth Organization / Student Union | NF-CIV-COM | organization |
| VN-CIV-006 | 3 | `womens-association` | Women's Association / Forum | NF-CIV-COM | organization |
| VN-CIV-007 | 3 | `professional-association` | Professional Association (NBA/NMA/ICAN) | standalone | organization |
| VN-CIV-008 | 3 | `sports-club` | Sports Club / Amateur League | standalone | organization |
| VN-CIV-009 | 3 | `book-club` | Book Club / Reading Circle | standalone | organization |
| VN-CIV-010 | 3 | `orphanage` | Orphanage / Child Care NGO | NF-CIV-WEL | organization |
| VN-CIV-011 | 3 | `community-hall` | Community Hall / Town Hall | standalone | place — SHIPPED |
| VN-CIV-012 | 3 | `market-association` | Market Leaders / Traders Association | NF-CIV-COM | organization |
| VN-CIV-013 | 3 | `startup` | Startup / Early-Stage Company | standalone | organization |

### HEALTH (9 active)
| VN-ID | P | Slug | Display Name | Family |
|---|---|---|---|---|
| VN-HLT-001 | 1 | `clinic` | Clinic / Healthcare Facility | NF-HLT-PRI |
| VN-HLT-002 | 2 | `pharmacy` | Pharmacy | NF-HLT-PRI |
| VN-HLT-003 | 3 | `dental-clinic` | Dental Clinic | NF-HLT-PRI |
| VN-HLT-004 | 3 | `veterinary-clinic` | Veterinary Clinic | standalone |
| VN-HLT-005 | 3 | `rehabilitation-centre` | Rehabilitation Centre | standalone |
| VN-HLT-006 | 3 | `chw-network` | Community Health Worker Network | NF-HLT-PRI |
| VN-HLT-007 | 2 | `gym` | Gym / Fitness Centre | standalone |
| VN-HLT-008 | 3 | `optical-clinic` | Optical / Eye Clinic | NF-HLT-PRI |
| VN-HLT-009 | 2 | `medical-lab` | Medical / Diagnostic Lab | NF-HLT-SEC |

### COMMERCE (45 active — largest category)
Commerce includes: pos-business (P1), restaurant, hotel, pharmacy, supermarket, beauty-salon, bakery, electronics-shop, hardware-store, fashion-boutique, used-car-dealer, event-hall, real-estate-agency, printing-press, fuel-station, internet-cafe, dry-cleaning, shoe-shop, phone-repair, auto-repair, barbershop, music-store, bookshop, toy-store, furniture-store, food-vendor, cold-room, caterer, waste-management, security-company, janitorial, generator-dealer, solar-energy, water-purification, photography-studio, video-production, music-studio, and more.

### EDUCATION (8 active)
school (P1), driving-school, vocational-training, tutoring (SHIPPED P3), creche (SHIPPED P3), elearning-platform (expansion candidate), exam-prep, training-institute

### AGRICULTURAL (12 active)
farm (P1), poultry-farm, cold-room-facility, agricultural-aggregator, palm-oil-trader, cocoa-trader, fishery, rice-mill, cassava-processor, vegetable-farmer, livestock-farmer, apiary

### FINANCIAL (6 active)
savings-group (P1), mobile-money-agent (SHIPPED P3), bureau-de-change (SHIPPED P3), hire-purchase (SHIPPED P3), insurance-agent, microfinance

### PROFESSIONAL / CREATOR (18 active)
professional (P1), creator (P1), lawyer, doctor, handyman, it-support, tax-consultant (SHIPPED P3), surveyor, architect, pr-firm, talent-agency, photography-studio, music-studio, video-production, podcast-studio, digital-creator, social-media-manager, brand-designer

### PLACE (8 active)
market (P1), wholesale-market, warehouse, community-hall (SHIPPED P3), tech-hub, event-hall, storage-facility, co-working-space

### MEDIA (4 active)
community-radio, newspaper-distributor, podcast-studio, pr-firm

### INSTITUTIONAL (3 active)
government-agency, sports-club, polling-unit

### SOCIAL (3 active)
book-club, startup, talent-agency

---

## 6. Deprecated Niches (Do Not Use)

| Slug | Reason | Replaced By |
|---|---|---|
| `gym-fitness` | Duplicate of `gym` | `gym` (VN-HLT-007) |
| `petrol-station` | Regulatory complexity deferred | `fuel-station` in Commerce |
| `nurtw` | Absorbed into `road-transport-union` | VN-TRP-005 |

---

## 7. P3 Niche Queue — Ordered by Priority

**Current position:** `mosque` (VN-CIV-004) — NEXT TO BUILD

**Next 15 in queue (after mosque):**
1. VN-CIV-005 — `youth-organization`
2. VN-CIV-006 — `womens-association`
3. VN-TRP-006 — `okada-keke`
4. VN-HLT-003 — `dental-clinic`
5. VN-HLT-006 — `chw-network`
6. VN-TRP-007 — `ferry`
7. VN-POL-003 — `campaign-office`
8. VN-POL-004 — `lga-office`
9. VN-POL-005 — `polling-unit-rep`
10. VN-CIV-007 — `professional-association`
11. VN-TRP-008 — `airport-shuttle`
12. VN-TRP-009 — `container-depot`
13. VN-HLT-004 — `veterinary-clinic`
14. VN-CIV-010 — `orphanage`
15. VN-CIV-013 — `startup`

**Registry files:**
- `docs/templates/pillar3-niche-registry.json` — authoritative P3 registry
- `docs/templates/pillar3-template-queue.md` — ordered implementation queue
- `docs/templates/pillar3-template-execution-board.md` — sprint execution tracking
- `docs/templates/pillar3-template-status-codes.md` — status code definitions

---

## 8. Expansion Candidates (53 New Niches — Research Phase)

**Source:** `docs/templates/expansion/00-expansion-master-blueprint.md`  
**Status:** Research phase — NOT YET ACTIVATED. Activation requires:
1. Founder approval of queue order
2. Add to `infra/db/seeds/0004_verticals-master.csv` with `status=planned`
3. Confirm VN-ID in canonical niche registry
4. Formally add/extend niche family in variant register

### Sprint 1 Priority (Highest Impact, Lowest Regulatory Friction)

| Queue | Slug | Display Name | Score | Reg Tier | Proposed VN-ID |
|---|---|---|---|---|---|
| 1 | `software-agency` | Software / App Dev Agency | 44 | Tier 1 | VN-PRO-009 |
| 2 | `elearning-platform` | E-Learning Platform | 43 | Tier 1 | VN-EDU-011 |
| 3 | `digital-marketing-agency` | Digital Marketing Agency | 43 | Tier 1–2 | VN-PRO-013 |
| 4 | `electronics-store` | Electronics / Mobile Phone Store | 41 | Tier 2 | VN-COM-001 |
| 5 | `coworking-space` | Co-working Space / Business Hub | 41 | Tier 1 | VN-PRP-001 |
| 6 | `recruitment-agency` | HR / Recruitment Agency | 41 | Tier 1 | VN-PRO-011 |
| 7 | `cybersecurity-firm` | Cybersecurity Company | 41 | Tier 1 | VN-TEC-001 |
| 8 | `exam-prep-centre` | Exam Preparation Centre | 40 | Tier 1 | VN-EDU-010 |
| 9 | `management-consulting` | Management Consulting Firm | 40 | Tier 1 | VN-PRO-012 |
| 10 | `data-analytics-firm` | Data Analytics / BI Firm | 40 | Tier 1–2 | VN-TEC-002 |
| 11 | `tech-academy` | Technology / Coding Academy | 40 | Tier 1 | VN-EDU-013 |

### Sprint 1 Deferred (Compliance Engineering Needed)

| Slug | Blocker |
|---|---|
| `hospital` | MDCN API or manual verification workflow needed |
| `university` | NUC approval verification workflow needed |
| `diagnostic-lab` | MLSCN licensing verification needed |
| `microfinance-bank` | CBN compliance gate |

### Sprint 2+ (P2 Candidates)
cybersecurity-firm, data-analytics-firm, management-consulting, coworking-space, online-news-platform, aluminum-fabricator, food-tech-startup, fintech-startup, agritech-startup, health-informatics-firm, corporate-training-firm, architectural-firm, quantity-surveyor, civil-engineering-firm, landscape-firm

### Sprint 3+ (P3 / Specialty)
diaspora-remittance-agent, secondhand-clothing-dealer, waste-recycler, event-decorator, canopy-furniture-hire, professional-caterer, music-event-promoter, film-house, document-services, business-center, wedding-planner, funeral-home, spiritual-healing-center, language-school, adult-literacy-center

---

## 9. Niche Family Registry (39 Families)

| Family Code | Name | Anchor Slug | Variants |
|---|---|---|---|
| NF-POL-IND | Individual Politicians | `politician` | ward-rep, polling-unit-rep |
| NF-POL-ORG | Political Organizations | `political-party` | campaign-office, lga-office, constituency-office |
| NF-TRP-PAS | Passenger Transport | `motor-park` | mass-transit, rideshare, okada-keke, ferry, airport-shuttle |
| NF-TRP-FRT | Freight Transport | `haulage` | logistics-delivery, dispatch-rider, courier, cargo-truck, clearing-agent |
| NF-CIV-REL | Religious/Faith | `church` | mosque |
| NF-CIV-WEL | Welfare/Community Aid | `ngo` | orphanage |
| NF-CIV-COM | Community Organizations | `cooperative` | youth-organization, womens-association, market-association |
| NF-HLT-PRI | Primary Healthcare | `clinic` | pharmacy, dental-clinic, optical-clinic, chw-network |
| NF-HLT-SEC | Secondary Healthcare | — | medical-lab |
| NF-STO | Storage | — | container-depot, warehouse |
| NF-EDU-SCH | Schools | `school` | driving-school, vocational-training, exam-prep |
| NF-EDU-DIG | Digital Education | — | elearning-platform, tech-academy |
| NF-AGR-CRP | Crop Agriculture | `farm` | vegetable-farmer, cassava-processor |
| NF-AGR-LIV | Livestock | — | poultry-farm, livestock-farmer |
| NF-AGR-PRO | Agricultural Processing | — | rice-mill, palm-oil-trader, cocoa-trader, cold-room-facility |
| NF-COM-RET | Retail Commerce | `pos-business` | electronics-store, hardware-store, fashion-boutique |
| NF-COM-FSV | Food Service | — | restaurant, bakery, food-vendor, caterer |
| NF-COM-HOT | Hospitality | — | hotel, event-hall |
| NF-FIN-SAV | Savings/Credit | `savings-group` | hire-purchase |
| NF-FIN-AGT | Financial Agents | — | mobile-money-agent, bureau-de-change, insurance-agent |
| NF-PRO-ADV | Advisory/Consulting | `professional` | lawyer, doctor, tax-consultant, management-consulting |
| NF-PRO-HR | Human Resources | — | recruitment-agency |
| NF-TEC-AGY | Technology Agency | — | software-agency, digital-marketing-agency, data-analytics-firm |
| NF-TEC-SEC | Cybersecurity | — | cybersecurity-firm |
| NF-PRP-SVC | Property Services | — | coworking-space, real-estate-agency |
| NF-CRE-MED | Creative Media | `creator` | photographer, music-studio, podcast-studio |
| … | 14+ more families | … | … |

---

## 10. Implementation Protocol for New Niche Templates

**To add a new niche template (Pillar 2 — brand-runtime):**

1. Create `WebsiteTemplateContract` implementation: `apps/brand-runtime/src/templates/niches/{slug}/index.ts`
2. Register in `BUILT_IN_TEMPLATES` Map: `apps/brand-runtime/src/lib/template-resolver.ts`
3. Add marketplace seed SQL to `infra/db/migrations/` (template_registry row)
4. Update P3 registry: `docs/templates/pillar3-niche-registry.json` → status `SHIPPED`
5. Update execution board: `docs/templates/pillar3-template-execution-board.md`

**To add a new canonical niche:**

1. Add row to `infra/db/seeds/0004_verticals-master.csv` (`status=planned`)
2. Assign VN-ID in `docs/governance/canonical-niche-registry.md`
3. Add to `docs/governance/niche-master-table.md`
4. Add or extend niche family in `docs/governance/niche-family-variant-register.md`
5. Create vertical package: `packages/verticals-{slug}/`
6. Register in vertical-engine: `packages/vertical-engine/src/registry.ts`
7. Register AI config: `packages/superagent/src/vertical-ai-config.ts`
8. Create vertical-specific migration if needed
9. Wire API routes (either legacy route file or engine-generated)

**Canonical slug source of truth:** `infra/db/seeds/0004_verticals-master.csv`  
**Do not create package alias slugs that differ from canonical CSV slug.**
