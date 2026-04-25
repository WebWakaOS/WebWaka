# WebWaka OS — Niche Family & Variant Register

**Status:** AUTHORITATIVE
**Date:** 2026-04-25
**Source:** `docs/governance/niche-master-table.md`

This register defines the 39 niche families. A niche family is a group of verticals that serve the same core market but differ by scale, formality, specialisation, or business model. Family membership drives:
- Shared AI use-case template (with per-variant overrides)
- Shared discovery tag pool (with per-variant additions)
- Shared feature scaffolding priority
- Shared branding theme (with variant-specific customisation)

Each family has one **anchor** (the most general or highest-priority member) and one or more **variants**.

---

## Family Entry Format

```
### NF-[CODE]: [Family Name]
Anchor: [slug] (VN-ID, priority)
Variants: [slug list with VN-IDs]
Total members: [N]
Shared core capability: [what all members have in common]
Differentiators: [what makes each variant distinct]
Implementation order: [which to build first]
```

---

## POLITICS FAMILIES

### NF-POL-IND: Politics — Individual Representative
**Anchor:** `politician` (VN-POL-001, P1)
**Variants:** `ward-rep` (VN-POL-007, P2), `polling-unit-rep` (VN-POL-005, P3)
**Total members:** 3

**Shared core capability:** Individual political profile with office history, constituency mapping, public engagement tools, and constituent communication.

**Differentiators:**
- `politician` — multi-level offices (Councillor → President); full campaign and governance lifecycle; 7 FSM office states
- `ward-rep` — ward-level only; inherits politician pattern; simplified office scope
- `polling-unit-rep` — lowest electoral unit; voter mobilization focus; no elected office FSM

**Implementation order:** politician (P1, M8b) → ward-rep (P2, M8b) → polling-unit-rep (P3, M8b)

---

### NF-POL-ORG: Politics — Organization
**Anchor:** `political-party` (VN-POL-002, P1)
**Variants:** `campaign-office` (VN-POL-003, P3), `lga-office` (VN-POL-004, P3), `constituency-office` (VN-POL-006, P3)
**Total members:** 4

**Shared core capability:** Organizational political profile with member management, event coordination, public-facing digital presence, and community integration.

**Differentiators:**
- `political-party` — national/state party registration; affiliation relationships; party as Organization subtype
- `campaign-office` — time-bounded per-election; volunteer + donor management; ward coverage tracking
- `lga-office` — official government place profile; service directory; ward notice board
- `constituency-office` — projects tracking; constituent services log; office contacts

**Implementation order:** political-party (P1, M8b) → lga-office (P3, M8b) → campaign-office (P3, M8b) → constituency-office (P3, M8b)

---

## TRANSPORT FAMILIES

### NF-TRP-PAS: Transport — Passenger
**Anchor:** `motor-park` (VN-TRP-001, P1)
**Variants:** `mass-transit` (VN-TRP-002, P1), `rideshare` (VN-TRP-003, P1), `okada-keke` (VN-TRP-006, P3), `ferry` (VN-TRP-007, P3), `airport-shuttle` (VN-TRP-008, P3)
**Total members:** 6

**Shared core capability:** Passenger movement — route management, vehicle fleet tracking, fare/seat offerings, FRSC compliance.

**Differentiators:**
- `motor-park` — physical place (terminal/garage); multi-operator hub; NURTW affiliation
- `mass-transit` — organization operating BRT/city bus fleet; route licensing; scheduled services
- `rideshare` — demand-based seat offerings; driver KYC; app-dispatched
- `okada-keke` — motorcycle/tricycle co-operative; rider registration; safety compliance
- `ferry` — water route; NIMASA license; manifest; ticketing
- `airport-shuttle` — flight-tracking integration; pre-booked transfers; fleet dispatch

**Implementation order:** motor-park → mass-transit → rideshare (all P1, M8c) → okada-keke → ferry → airport-shuttle (P3, later milestones)

**Blocker note:** Route licensing fields are deferred from M6c — required for mass-transit full activation.

---

### NF-TRP-FRT: Transport — Freight & Last-Mile
**Anchor:** `haulage` (VN-TRP-004, P1)
**Variants:** `logistics-delivery` (VN-TRP-010, P2), `dispatch-rider` (VN-TRP-011, P2), `courier` (VN-TRP-012, P2), `cargo-truck` (VN-TRP-013, P3), `clearing-agent` (VN-TRP-014, P2)
**Total members:** 6

**Shared core capability:** Cargo movement — load/parcel tracking, fleet/rider management, route-based earnings, waybill generation.

**Differentiators:**
- `haulage` — heavy freight/interstate; FRSC fleet + CAC; tonnage-based billing
- `logistics-delivery` — last-mile parcels; rider network; COD management
- `dispatch-rider` — bike-only dispatch; job assignment; per-delivery earnings
- `courier` — interstate parcel post; waybill management; branch network
- `cargo-truck` — individual truck owner/small fleet; load board; per-trip
- `clearing-agent` — customs documentation; SON/NAFDAC/port coordination; clearing fees

**Implementation order:** haulage (P1, M8c) → logistics-delivery → dispatch-rider → courier → clearing-agent (P2, M9) → cargo-truck (P3)

---

## CIVIC FAMILIES

### NF-CIV-REL: Civic — Religious
**Anchor:** `church` (VN-CIV-001, P1)
**Variants:** `mosque` (VN-CIV-004, P3), `ministry-mission` (VN-CIV-014, P3)
**Total members:** 3

**Shared core capability:** Faith community profile with congregation management, event scheduling, giving/donations, community spaces, IT-XXXXXXXX registration gate.

**Differentiators:**
- `church` — Christian; Sunday service scheduling; tithes/offerings; branches
- `mosque` — Islamic; Juma'ah scheduling; zakat management; prayer time alerts
- `ministry-mission` — apostolic/outreach focused; mission programs; itinerant schedule; donation management

**Implementation order:** church (P1, M8d) → mosque (P3, M8d) → ministry-mission (P3, M8d)

---

### NF-CIV-COM: Civic — Community Groups
**Anchor:** `cooperative` (VN-CIV-003, P1)
**Variants:** `youth-organization` (VN-CIV-005, P3), `womens-association` (VN-CIV-006, P3), `market-association` (VN-CIV-012, P3)
**Total members:** 4

**Shared core capability:** Member-based community group with enrollment, dues/levy collection, meeting scheduling, and community notices.

**Differentiators:**
- `cooperative` — formal CAC-registered; savings cycles; loan requests; member voting
- `youth-organization` — IT-registered; elections; event coordination; student union patterns
- `womens-association` — informal/formal; programs; empowerment; savings groups
- `market-association` — traders' levy collection; market rules; vendor mediation

**Implementation order:** cooperative (P1, M8d) → youth-organization → womens-association → market-association (P3, M9)

---

### NF-CIV-WEL: Civic — Welfare & NGO
**Anchor:** `ngo` (VN-CIV-002, P1)
**Variants:** `orphanage` (VN-CIV-010, P3)
**Total members:** 2

**Shared core capability:** Welfare-focused non-profit with IT-registration, donor management, program tracking, beneficiary records.

**Differentiators:**
- `ngo` — general NGO; programs; membership tiers; grant management
- `orphanage` — child welfare; resident records; guardian portal; welfare programs

---

## FOOD SERVICE FAMILY

### NF-FDS: Food Service
**Anchor:** `restaurant` (VN-FDS-001, P2)
**Variants:** `food-vendor` (VN-FDS-002, P2), `catering` (VN-FDS-003, P2), `bakery` (VN-FDS-004, P2), `restaurant-chain` (VN-FDS-005, P2)
**Total members:** 5

**Shared core capability:** Food offering management, pricing, order management, menu/catalog.

**Differentiators:**
- `restaurant` — dine-in + takeaway; table reservations; delivery integration; NAFDAC/CAC
- `food-vendor` — individual street/informal; location broadcast; WhatsApp orders; daily menu
- `catering` — event-based; quote builder; dietary requirements; logistics
- `bakery` — production-first; pre-orders; product catalog; delivery scheduling
- `restaurant-chain` — multi-outlet; standardized menu; centralized operations; NAFDAC compliance

**Implementation order:** restaurant (P2, M9) → restaurant-chain (P2, M9) → food-vendor → catering → bakery (P2, M9)

---

## BEAUTY & PERSONAL CARE FAMILY

### NF-BEA: Beauty & Personal Care
**Anchor:** `beauty-salon` (VN-BEA-001, P2)
**Variants:** `spa` (VN-BEA-002, P2), `hair-salon` (VN-BEA-003, P3)
**Total members:** 3

**Shared core capability:** Appointment booking, service menu, stylist/therapist roster, loyalty programs.

**Differentiators:**
- `beauty-salon` — mixed (barbers + beauty): cuts, nails, makeup, skincare, lashes
- `spa` — relaxation/wellness: massages, facials, body treatments, gift vouchers
- `hair-salon` — hair-specialist: weave, relaxer, braiding, dreadlocks, barbing

**Template reuse:** 90% shared between beauty-salon and hair-salon; spa shares appointment and loyalty logic but diverges on treatment catalog.

---

## FASHION & APPAREL FAMILY

### NF-FSH: Fashion & Apparel
**Anchor:** `tailor` (VN-FSH-001, P2)
**Variants:** `tailoring-fashion` (VN-FSH-002, P3), `shoemaker` (VN-FSH-003, P3)
**Total members:** 3

**Shared core capability:** Order/measurement management, production tracking, delivery.

**Differentiators:**
- `tailor` — general bespoke tailoring; all fabrics; Ankara/aso-oke; measurement profiles
- `tailoring-fashion` — premium atelier/fashion-forward; collection showcase; designer brand positioning
- `shoemaker` — footwear only: custom shoes + repair; material catalog; size/fit records

**Note:** `fashion-brand` (VN-CRE-004) is a separate standalone niche — it's a brand/label identity (lookbook, wholesale ordering), not a production service.

---

## CLEANING SERVICES FAMILY

### NF-CLN: Cleaning Services
**Anchor:** `laundry` (VN-CLN-001, P2)
**Variants:** `cleaning-service` (VN-CLN-002, P2), `laundry-service` (VN-CLN-003, P3), `cleaning-company` (VN-CLN-004, P3)
**Total members:** 4

**Shared core capability:** Service booking, order/job tracking, pricing tiers, pickup/delivery or scheduling.

**Differentiators:**
- `laundry` — home pickup/dry-clean model; per-item pricing; turnaround tracking
- `laundry-service` — on-site laundromat; by-weight pricing; machine booking
- `cleaning-service` — domestic home cleaning; recurring bookings; area coverage
- `cleaning-company` — corporate FM contracts; crew scheduling; client invoicing; CAC required

---

## AUTOMOTIVE FAMILIES

### NF-AUT-SVC: Auto Services
**Anchor:** `auto-mechanic` (VN-AUT-001, P2)
**Variants:** `car-wash` (VN-AUT-002, P3), `tyre-shop` (VN-AUT-003, P3)
**Total members:** 3

**Shared core capability:** Job/service tracking, vehicle history, customer management.

**Differentiators:**
- `auto-mechanic` — engine/panel/electrical repairs; job cards; parts inventory; CAC recommended
- `car-wash` — queue management; membership/loyalty cards; mobile service option
- `tyre-shop` — tyre stock management; vulcanizing; wheel alignment; mobile service

---

### NF-AUT-TRD: Automotive Trade
**Anchor:** `used-car-dealer` (VN-AUT-004, P3)
**Variants:** `spare-parts` (VN-AUT-005, P3), `motorcycle-accessories` (VN-AUT-006, P3)
**Total members:** 3

**Shared core capability:** Vehicle/parts catalog, inventory, buyer negotiation or direct sale.

**Differentiators:**
- `used-car-dealer` — vehicle listings; FRSC/VIN check integration; negotiation chat
- `spare-parts` — parts catalog; compatibility search; bulk ordering (Ladipo/Nnewi model)
- `motorcycle-accessories` — bike parts + accessories; servicing; rider community

---

## ENERGY FAMILY

### NF-NRG: Energy Retail
**Anchor:** `fuel-station` (VN-NRG-001, P2)
**Variants:** `gas-distributor` (VN-NRG-002, P2)
**Total members:** 2

**Shared core capability:** Regulatory compliance (DPR), product inventory, delivery/queue management.

**Differentiators:**
- `fuel-station` — pump management; queue management; DPR NMDPRA license; price display
- `gas-distributor` — LPG cylinder tracking; delivery routes; dealer/sub-dealer network

**Deprecated alias:** `petrol-station` → `fuel-station` (do not use petrol-station for new profiles)

**Standalone in this section:** `solar-installer` (P2), `generator-dealer` (P3) — too distinct in business model to share the energy-retail family template.

---

## PRINT & DESIGN FAMILY

### NF-PRT: Print & Design
**Anchor:** `print-shop` (VN-PRT-001, P2)
**Variants:** `printing-press` (VN-PRT-002, P3)
**Total members:** 2

**Shared core capability:** Order management, artwork/file upload, delivery/pickup tracking.

**Differentiators:**
- `print-shop` — small neighbourhood shop; banners, flyers, business cards; walk-in
- `printing-press` — larger press or design studio; offset/digital; design-first identity; bulk contracts

---

## ELECTRONICS REPAIR FAMILY

### NF-ELX: Electronics Repair
**Anchor:** `electronics-repair` (VN-ELX-001, P2)
**Variants:** `phone-repair-shop` (VN-ELX-002, P3)
**Total members:** 2

**Shared core capability:** Job ticket tracking, parts inventory, warranty management, customer communication.

**Differentiators:**
- `electronics-repair` — general electronics: TV, fridges, washing machines, laptops
- `phone-repair-shop` — phone and accessories specialist: screen replacement, charging ports, accessories retail

---

## EVENTS & VENUES FAMILY

### NF-EVT: Events & Venues
**Anchor:** `event-hall` (VN-EVT-001, P2)
**Variants:** `event-planner` (VN-EVT-002, P2), `wedding-planner` (VN-EVT-003, P3), `events-centre` (VN-EVT-004, P3)
**Total members:** 4

**Shared core capability:** Booking calendar, capacity/schedule management, vendor coordination.

**Differentiators:**
- `event-hall` — mid-size venue; room/hall booking; catering coordination; capacity limits
- `events-centre` — larger multipurpose hall; hall rental model; vendor directory
- `event-planner` — service (not place); MC/planning; portfolio; vendor management; per-event booking
- `wedding-planner` — wedding specialist; vendor coordination; timeline management; client portal

---

## CONSTRUCTION, REAL ESTATE & HARDWARE FAMILIES

### NF-CST-CON: Construction & Building Materials
**Anchor:** `construction` (VN-CST-001, P2)
**Variants:** `building-materials` (VN-CST-004, P3), `iron-steel` (VN-CST-005, P3)
**Total members:** 3

**Shared core capability:** Project/order management, materials tracking, client contracts.

**Differentiators:**
- `construction` — contractor; project milestones; sub-contractor management; CAC required
- `building-materials` — supplier catalog; delivery; credit accounts; CAC required
- `iron-steel` — specialist: zinc, roofing sheets, rods; cut-to-size orders; price lists

---

### NF-CST-RE: Real Estate
**Anchor:** `real-estate-agency` (VN-CST-002, P2)
**Variants:** `property-developer` (VN-CST-003, P2)
**Total members:** 2

**Shared core capability:** Property listings, landlord/tenant management, CAC registration.

**Differentiators:**
- `real-estate-agency` — brokerage/agency; letting; buyer/seller matching; commissions
- `property-developer` — development projects; off-plan sales; subscriber management; construction progress

---

### NF-CST-HW: Hardware & Supplies
**Anchor:** `electrical-fittings` (VN-CST-006, P3)
**Variants:** `plumbing-supplies` (VN-CST-007, P3), `paints-distributor` (VN-CST-008, P3)
**Total members:** 3

**Shared core capability:** Product catalog, contractor pricing/accounts, bulk ordering, area coverage.

**Differentiators:**
- `electrical-fittings` — sockets, cables, panels, breakers; contractor accounts
- `plumbing-supplies` — PVC pipes, fittings, taps; bulk pricing
- `paints-distributor` — color catalog; brand (Dulux/Berger); contractor pricing

---

## PHARMACY FAMILY

### NF-PHA: Pharmacy
**Anchor:** `pharmacy` (VN-HLT-002, P2)
**Variants:** `pharmacy-chain` (VN-HLT-011, P2)
**Total members:** 2

**Shared core capability:** Drug inventory management, prescription records, NAFDAC compliance, patient lookup.

**Differentiators:**
- `pharmacy` — independent; NAFDAC + PCN; single-location stock management
- `pharmacy-chain` — multi-outlet; centralized inventory; PCN compliance across locations; NAFDAC chain license

---

## HEALTH FAMILIES

### NF-HLT-FIT: Health Fitness
**Anchor:** `sports-academy` (VN-HLT-003, P2)
**Variants:** `gym` (VN-HLT-004, P2)
**Total members:** 2

**Shared core capability:** Membership management, class/session scheduling, coach/trainer profiles.

**Differentiators:**
- `sports-academy` — structured sports training; coaching programs; competitions; team management
- `gym` — equipment-based fitness; membership plans; class booking; equipment tracking

**Deprecated alias:** `gym-fitness` → `gym` (do not use gym-fitness for new profiles)

---

### NF-HLT-SPE: Health Specialist Clinic
**Anchor:** `optician` (VN-HLT-005, P2)
**Variants:** `dental-clinic` (VN-HLT-006, P2), `vet-clinic` (VN-HLT-007, P2)
**Total members:** 3

**Shared core capability:** Appointment booking, patient/pet records, MDCN license verification, prescription/treatment management.

**Differentiators:**
- `optician` — eye testing; prescription management; frames catalog; MDCN
- `dental-clinic` — dental appointment; treatment plans; X-ray records; orthodontic tracking
- `vet-clinic` — pet records; vaccine reminders; appointment; pet shop inventory (dual profile)

**Migration note:** All three were silently wrong in migration 0037 (slugs `dental`, `vet` used instead of `dental-clinic`, `vet-clinic`). Fixed by 0037a.

---

### NF-HLT-CAR: Long-term Health Care
**Anchor:** `rehab-centre` (VN-HLT-009, P3)
**Variants:** `elderly-care` (VN-HLT-010, P3)
**Total members:** 2

**Shared core capability:** Resident/patient intake, care plan management, family communication portal.

**Differentiators:**
- `rehab-centre` — addiction/mental health/physical recovery; treatment programs; discharge tracking
- `elderly-care` — long-term residential; daily care routines; family portal; care plans

---

## EDUCATION FAMILIES

### NF-EDU-SCH: School Education
**Anchor:** `school` (VN-EDU-001, P1)
**Variants:** `private-school` (VN-EDU-006, P3), `govt-school` (VN-EDU-007, P3)
**Total members:** 3

**Shared core capability:** Student enrollment, fee collection/tracking, results management, parent communication.

**Differentiators:**
- `school` — generic all-levels profile; community_courses reuse; CAC
- `private-school` — state licensing; fee structures; owner/proprietor profile
- `govt-school` — government-managed; teacher management; performance reporting; no owner profile

---

### NF-EDU-EAR: Early Childhood Education
**Anchor:** `creche` (VN-EDU-005, P3)
**Variants:** `nursery-school` (VN-EDU-008, P3)
**Total members:** 2

**Shared core capability:** Child enrollment, parent communication, daily reports, regulatory compliance.

**Differentiators:**
- `creche` — care-focused; drop-off/pickup management; daily activity reports; state Ministry gate
- `nursery-school` — early education with curriculum; term-based; SUBEB compliance; fee collection

---

## AGRICULTURAL FAMILIES

### NF-AGR-PRD: Agricultural Production
**Anchor:** `farm` (VN-AGR-001, P2)
**Variants:** `poultry-farm` (VN-AGR-004, P3), `vegetable-garden` (VN-AGR-011, P3)
**Total members:** 3

**Shared core capability:** Harvest/production calendar, buyer marketplace integration, input management.

**Differentiators:**
- `farm` — general arable; crop management; farmer credit; input sourcing
- `poultry-farm` — flock management; feed tracking; egg/bird market sales; aquaculture variant
- `vegetable-garden` — urban/peri-urban; subscription boxes; direct-to-consumer; individual entity

---

### NF-AGR-PRC: Agricultural Processing
**Anchor:** `cassava-miller` (VN-AGR-005, P3)
**Variants:** `produce-aggregator` (VN-AGR-008, P3), `food-processing` (VN-AGR-012, P3)
**Total members:** 3

**Shared core capability:** Farmer supply chain management, production scheduling, output marketplace, buyer connections.

**Differentiators:**
- `cassava-miller` — milling focus; farmer supply intake; garri/flour output; price setting
- `produce-aggregator` — aggregator/storage; farmer onboarding; grading; buyer marketplace
- `food-processing` — factory scale; NAFDAC compliance; distribution network; production planning

---

### NF-AGR-COM: Agricultural Commodities
**Anchor:** `palm-oil-trader` (VN-AGR-009, P3)
**Variants:** `cocoa-exporter` (VN-AGR-010, P3)
**Total members:** 2

**Shared core capability:** Commodity pricing, buyer connections, production tracking.

**Differentiators:**
- `palm-oil-trader` — domestic commodity; palm oil grade pricing; farm network; community trading
- `cocoa-exporter` — export-focused; quality grading; CAC/NXP; forex settlement; export documentation

**Package alias note:** `palm-oil-trader` package directory is `packages/verticals-palm-oil` (alias: `palm-oil`).

---

### NF-AGR-MKT: Food Markets
**Anchor:** `fish-market` (VN-AGR-006, P3)
**Variants:** `abattoir` (VN-AGR-007, P3)
**Total members:** 2

**Shared core capability:** Daily produce pricing, hygiene compliance documentation, cold storage integration.

**Differentiators:**
- `fish-market` — fresh fish; daily catch pricing; pre-orders; fishmonger directory
- `abattoir` — slaughter scheduling; NAFDAC hygiene certification; meat distribution; place entity

---

## PROFESSIONAL SERVICES FAMILIES

### NF-PRO-LIC: Licensed Professional Services
**Anchor:** `professional` (VN-PRO-001, P1)
**Variants:** `law-firm` (VN-PRO-006, P2), `accounting-firm` (VN-PRO-007, P2)
**Total members:** 3

**Shared core capability:** License body verification, client management, appointment booking, professional ratings.

**Differentiators:**
- `professional` — multi-discipline individual (lawyer/doctor/accountant); generic licensed profile; license body verification
- `law-firm` — legal practice organization; matter management; billing; court calendar; NBA verification
- `accounting-firm` — audit/accounting firm; client engagements; tax filing calendar; ICAN compliance

---

### NF-PRO-TRD: Trades & Technical
**Anchor:** `handyman` (VN-PRO-002, P2)
**Variants:** `generator-repair` (VN-PRO-003, P2)
**Total members:** 2

**Shared core capability:** Job request management, area coverage, service ratings, payment.

**Differentiators:**
- `handyman` — multi-trade: plumber, electrician, painter, general repair; job requests; area map
- `generator-repair` — specialist: generator/HVAC/AC; service visits; parts; maintenance contracts

---

## CREATOR & ENTERTAINMENT FAMILIES

### NF-CRE-DIG: Digital Creator
**Anchor:** `creator` (VN-CRE-001, P1)
**Variants:** `photography` (VN-CRE-002, P2), `podcast-studio` (VN-CRE-007, P3), `motivational-speaker` (VN-CRE-008, P3)
**Total members:** 4

**Shared core capability:** Social network integration, community, paid tiers/monetization, digital portfolio.

**Differentiators:**
- `creator` — influencer/digital creator; social platform; paid community; brand deals
- `photography` — photo/video studio; portfolio booking; digital product delivery
- `podcast-studio` — episode management; listener analytics; audio monetization
- `motivational-speaker` — speaking engagements; course catalog; event booking

**Package alias note:** `photography` canonical; package dir `packages/verticals-photography-studio` uses alias `photography-studio`. Migration 0037a corrects primary_pillars.

---

### NF-CRE-MUS: Music Industry
**Anchor:** `music-studio` (VN-CRE-003, P2)
**Variants:** `recording-label` (VN-CRE-006, P3)
**Total members:** 2

**Shared core capability:** Music production, artist profiles, release management, royalty tracking.

**Differentiators:**
- `music-studio` — individual artist/studio; studio booking; recording; artist profile; release
- `recording-label` — multi-artist organization; artist roster; royalty splits; CAC required; publishing

---

## MANUFACTURING FAMILY

### NF-MFG: Manufacturing
**Anchor:** `furniture-maker` (VN-MFG-001, P2)
**Variants:** `welding-fabrication` (VN-MFG-002, P2)
**Total members:** 2

**Shared core capability:** Order management, custom quotes, material sourcing, client management, delivery tracking.

**Differentiators:**
- `furniture-maker` — wood workshop; bespoke furniture; design portfolio; custom orders; delivery
- `welding-fabrication` — metal fabrication; gates, railings, burglary proofs; job-based; material sourcing

---

## WATER & UTILITIES FAMILY

### NF-UTL: Water & Utilities
**Anchor:** `water-treatment` (VN-UTL-001, P2)
**Variants:** `water-vendor` (VN-UTL-002, P3), `borehole-driller` (VN-UTL-003, P3)
**Total members:** 3

**Shared core capability:** Water supply operations, zone/route management, quality/compliance documentation.

**Differentiators:**
- `water-treatment` — borehole plant operator; supply zones; billing; quality certificates
- `water-vendor` — tanker delivery + sachet water producer; NAFDAC (sachet); delivery scheduling; route management
- `borehole-driller` — drilling services; project proposals; drilling logs; maintenance contracts

---

## STORAGE INFRASTRUCTURE FAMILY

### NF-STO: Storage Infrastructure
**Anchor:** `warehouse` (VN-PLC-004, P2)
**Variants:** `container-depot` (VN-TRP-009, P3)
**Total members:** 2

**Shared core capability:** Inventory slots/storage units, client billing, receiving/dispatch logs.

**Differentiators:**
- `warehouse` — general-purpose storage; inventory management; third-party logistics
- `container-depot` — port-adjacent; container tracking; haulier assignment; storage billing

---

## EXTRACTIVES FAMILY

### NF-EXT: Extractives
**Anchor:** `artisanal-mining` (VN-EXT-001, P3)
**Variants:** `oil-gas-services` (VN-EXT-002, P3)
**Total members:** 2

**Shared core capability:** Regulatory license management, production/activity tracking, buyer connections.

**Differentiators:**
- `artisanal-mining` — solid minerals; Mines license; production tracking; community-linked
- `oil-gas-services` — O&G service provider (not upstream); DPR license; contract/crew management

---

## MEDIA & BROADCAST FAMILY

### NF-MED: Media & Broadcast
**Anchor:** `community-radio` (VN-MED-001, P3)
**Variants:** `newspaper-distribution` (VN-MED-002, P3)
**Total members:** 2

**Shared core capability:** Content schedule management, community notices, advertising management.

**Differentiators:**
- `community-radio` — NBC-licensed broadcast; programming schedule; ad slots; listener community
- `newspaper-distribution` — route management; returns tracking; agent network; distribution

**Package alias note:** `newspaper-distribution` canonical; package dir `packages/verticals-newspaper-dist` (alias `newspaper-dist`).

---

## Summary Table

| Family Code | Family Name | Members | Anchor Vertical | Priority Range |
|---|---|---|---|---|
| NF-POL-IND | Politics Individual | 3 | politician | P1–P3 |
| NF-POL-ORG | Politics Organization | 4 | political-party | P1–P3 |
| NF-TRP-PAS | Transport Passenger | 6 | motor-park | P1–P3 |
| NF-TRP-FRT | Transport Freight | 6 | haulage | P1–P3 |
| NF-CIV-REL | Civic Religious | 3 | church | P1–P3 |
| NF-CIV-COM | Civic Community | 4 | cooperative | P1–P3 |
| NF-CIV-WEL | Civic Welfare | 2 | ngo | P1, P3 |
| NF-FDS | Food Service | 5 | restaurant | P2 |
| NF-BEA | Beauty & Personal Care | 3 | beauty-salon | P2–P3 |
| NF-FSH | Fashion & Apparel | 3 | tailor | P2–P3 |
| NF-CLN | Cleaning Services | 4 | laundry | P2–P3 |
| NF-AUT-SVC | Auto Services | 3 | auto-mechanic | P2–P3 |
| NF-AUT-TRD | Automotive Trade | 3 | used-car-dealer | P3 |
| NF-NRG | Energy Retail | 2 | fuel-station | P2 |
| NF-PRT | Print & Design | 2 | print-shop | P2–P3 |
| NF-ELX | Electronics Repair | 2 | electronics-repair | P2–P3 |
| NF-EVT | Events & Venues | 4 | event-hall | P2–P3 |
| NF-CST-CON | Construction & Materials | 3 | construction | P2–P3 |
| NF-CST-RE | Real Estate | 2 | real-estate-agency | P2 |
| NF-CST-HW | Hardware & Supplies | 3 | electrical-fittings | P3 |
| NF-PHA | Pharmacy | 2 | pharmacy | P2 |
| NF-HLT-FIT | Health Fitness | 2 | sports-academy | P2 |
| NF-HLT-SPE | Health Specialist | 3 | optician | P2 |
| NF-HLT-CAR | Long-term Health Care | 2 | rehab-centre | P3 |
| NF-EDU-SCH | School Education | 3 | school | P1–P3 |
| NF-EDU-EAR | Early Childhood | 2 | creche | P3 |
| NF-AGR-PRD | Agricultural Production | 3 | farm | P2–P3 |
| NF-AGR-PRC | Agricultural Processing | 3 | cassava-miller | P3 |
| NF-AGR-COM | Agricultural Commodities | 2 | palm-oil-trader | P3 |
| NF-AGR-MKT | Food Markets | 2 | fish-market | P3 |
| NF-PRO-LIC | Licensed Professionals | 3 | professional | P1–P2 |
| NF-PRO-TRD | Trades & Technical | 2 | handyman | P2 |
| NF-CRE-DIG | Digital Creator | 4 | creator | P1–P3 |
| NF-CRE-MUS | Music Industry | 2 | music-studio | P2–P3 |
| NF-MFG | Manufacturing | 2 | furniture-maker | P2 |
| NF-UTL | Water & Utilities | 3 | water-treatment | P2–P3 |
| NF-STO | Storage Infrastructure | 2 | warehouse | P2–P3 |
| NF-EXT | Extractives | 2 | artisanal-mining | P3 |
| NF-MED | Media & Broadcast | 2 | community-radio | P3 |
| **TOTAL** | | **113** | | |

**Standalone niches (no family): 44 verticals**
road-transport-union, hotel, supermarket, bookshop, florist, security-company, it-support, internet-cafe, solar-installer, generator-dealer, pos-business, sole-trader, travel-agent, advertising-agency, startup, land-surveyor, clinic, community-health, driving-school, training-institute, tutoring, agro-input, cold-room, tax-consultant, funeral-home, pr-firm, fashion-brand, talent-agency, savings-group, insurance-agent, airtime-reseller, mobile-money-agent, bureau-de-change, hire-purchase, bank-branch, market, tech-hub, wholesale-market, waste-management, community-hall, sports-club, book-club, professional-association, government-agency

**Total: 113 (family) + 44 (standalone) = 157 active ✓**

---

*Produced: 2026-04-25 — STOP-AND-RECONCILE taxonomy closure*
*Source: `infra/db/seeds/0004_verticals-master.csv` at commit `68eae9a3`*
