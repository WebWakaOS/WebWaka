# WebWaka OS — Canonical Niche Registry

**Status:** AUTHORITATIVE
**Date:** 2026-04-25
**Source:** `docs/governance/niche-master-table.md`
**Taxonomy state:** 157 active niches, 3 deprecated, 39 niche families

This registry contains one entry per active canonical niche. Each entry defines the niche identity that the platform uses for discovery, seeding, content, and AI configuration. Deprecated entries appear in the Alias & Deprecation Registry, not here.

---

## Registry Entry Format

```
VN-[ID] | `[slug]` | [Display Name] | [Priority] | [Family] | [Role]
Discovery tags: [comma-separated tags for search/matching]
Entity: [individual / organization / place]
Regulatory gate: [key regulatory requirement, or None]
Notes: [any special routing, blocker, or implementation note]
```

---

## POLITICS

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-POL-001 | `politician` | Individual Politician | 1 | NF-POL-IND | anchor |
| VN-POL-002 | `political-party` | Political Party | 1 | NF-POL-ORG | anchor |
| VN-POL-003 | `campaign-office` | Political Campaign Office | 3 | NF-POL-ORG | variant |
| VN-POL-004 | `lga-office` | Local Government Council / Ward Office | 3 | NF-POL-ORG | variant |
| VN-POL-005 | `polling-unit-rep` | Polling Unit Representative | 3 | NF-POL-IND | variant |
| VN-POL-006 | `constituency-office` | Constituency Development Office | 3 | NF-POL-ORG | variant |
| VN-POL-007 | `ward-rep` | Ward Representative | 2 | NF-POL-IND | variant |

**Discovery tags (shared across NF-POL-IND):** politician, representative, ward, polling unit, constituency, elected office, candidate, councillor, senator, governor, president
**Discovery tags (shared across NF-POL-ORG):** political party, APC, PDP, Labour Party, campaign, LGA, local government, constituency office

---

## TRANSPORT — PASSENGER

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-TRP-001 | `motor-park` | Motor Park / Bus Terminal | 1 | NF-TRP-PAS | anchor |
| VN-TRP-002 | `mass-transit` | City Bus / Mass Transit Operator | 1 | NF-TRP-PAS | variant |
| VN-TRP-003 | `rideshare` | Carpooling / Ride-Hailing | 1 | NF-TRP-PAS | variant |
| VN-TRP-006 | `okada-keke` | Okada / Keke Rider Co-op | 3 | NF-TRP-PAS | variant |
| VN-TRP-007 | `ferry` | Ferry / Water Transport Operator | 3 | NF-TRP-PAS | variant |
| VN-TRP-008 | `airport-shuttle` | Airport Shuttle Service | 3 | NF-TRP-PAS | variant |

**Discovery tags:** bus, BRT, motor park, transport, ride, keke, okada, tricycle, ferry, water transport, shuttle, terminal, park

**Regulatory gates:**
- motor-park: FRSC operator verification; NURTW park affiliation
- mass-transit: FRSC fleet; route licensing (deferred M6c)
- rideshare: FRSC driver enrollment
- okada-keke: FRSC registration
- ferry: NIMASA license
- airport-shuttle: FRSC fleet

---

## TRANSPORT — FREIGHT & LAST-MILE

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-TRP-004 | `haulage` | Haulage / Logistics Operator | 1 | NF-TRP-FRT | anchor |
| VN-TRP-010 | `logistics-delivery` | Logistics & Delivery (Last-Mile) | 2 | NF-TRP-FRT | variant |
| VN-TRP-011 | `dispatch-rider` | Dispatch Rider Network | 2 | NF-TRP-FRT | variant |
| VN-TRP-012 | `courier` | Courier Service | 2 | NF-TRP-FRT | variant |
| VN-TRP-013 | `cargo-truck` | Cargo Truck Owner / Fleet Operator | 3 | NF-TRP-FRT | variant |
| VN-TRP-014 | `clearing-agent` | Clearing & Forwarding Agent | 2 | NF-TRP-FRT | variant |

**Discovery tags:** haulage, logistics, delivery, last-mile, courier, dispatch, cargo, truck, clearing, forwarding, customs, port, waybill, parcel
**Regulatory gates:** FRSC (haulage, logistics, dispatch, cargo-truck); CAC (haulage, courier); SON/NAFDAC/customs (clearing-agent)

---

## TRANSPORT — STANDALONE

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-TRP-005 | `road-transport-union` | Road Transport Workers Union (NURTW) | 2 | — | standalone |
| VN-TRP-009 | `container-depot` | Container Depot / Logistics Hub | 3 | NF-STO | variant |

**road-transport-union notes:** Canonical for NURTW chapter affiliates. `nurtw` is a deprecated alias (synonym map ID: `vsyn_nurtw_road_transport_union`). Package alias: `packages/verticals-road-transport-union`.
**container-depot notes:** Family cross-listed under NF-STO (storage infrastructure family, with warehouse as anchor).

---

## CIVIC — RELIGIOUS

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-CIV-001 | `church` | Church / Faith Community | 1 | NF-CIV-REL | anchor |
| VN-CIV-004 | `mosque` | Mosque / Islamic Centre | 3 | NF-CIV-REL | variant |
| VN-CIV-014 | `ministry-mission` | Ministry / Apostolic Mission / Outreach | 3 | NF-CIV-REL | variant |

**Discovery tags:** church, mosque, ministry, faith, religious, Christian, Islamic, Pentecostal, outreach, worship, congregation
**Regulatory gate:** IT-XXXXXXXX (Incorporated Trustee registration) for all three

---

## CIVIC — WELFARE & NGO

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-CIV-002 | `ngo` | NGO / Non-Profit Organization | 1 | NF-CIV-WEL | anchor |
| VN-CIV-010 | `orphanage` | Orphanage / Child Care NGO | 3 | NF-CIV-WEL | variant |

**Discovery tags:** NGO, nonprofit, charity, aid, welfare, orphanage, child care, social impact, grant
**Regulatory gate:** IT-XXXXXXXX for both

---

## CIVIC — COMMUNITY GROUPS

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-CIV-003 | `cooperative` | Cooperative Society | 1 | NF-CIV-COM | anchor |
| VN-CIV-005 | `youth-organization` | Youth Organization / Student Union | 3 | NF-CIV-COM | variant |
| VN-CIV-006 | `womens-association` | Women's Association / Forum | 3 | NF-CIV-COM | variant |
| VN-CIV-012 | `market-association` | Market Leaders / Traders Association | 3 | NF-CIV-COM | variant |

**Discovery tags:** cooperative, union, association, youth, women, traders, community group, members
**Regulatory gates:** CAC (cooperative); IT (youth-organization)

---

## CIVIC — STANDALONE

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-CIV-007 | `professional-association` | Professional Association (NBA/NMA/ICAN) | 3 | — | standalone |
| VN-CIV-008 | `sports-club` | Sports Club / Amateur League | 3 | — | standalone |
| VN-CIV-009 | `book-club` | Book Club / Reading Circle | 3 | — | standalone |
| VN-CIV-011 | `community-hall` | Community Hall / Town Hall | 3 | — | standalone |
| VN-CIV-013 | `waste-management` | Waste Management / Recycler | 2 | — | standalone |

---

## FOOD SERVICE (NF-FDS)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-FDS-001 | `restaurant` | Restaurant / Eatery / Buka | 2 | NF-FDS | anchor |
| VN-FDS-002 | `food-vendor` | Food Vendor / Street Food | 2 | NF-FDS | variant |
| VN-FDS-003 | `catering` | Catering Service | 2 | NF-FDS | variant |
| VN-FDS-004 | `bakery` | Bakery / Confectionery | 2 | NF-FDS | variant |
| VN-FDS-005 | `restaurant-chain` | Restaurant / Food Chain Outlet | 2 | NF-FDS | variant |

**Discovery tags:** restaurant, eatery, buka, food, canteen, catering, bakery, pastry, street food, suya, kitchen, cafeteria, fast food, buka, amala joint, noodles
**Regulatory gates:** CAC (restaurant, catering, bakery, restaurant-chain); NAFDAC (restaurant-chain)
**Note:** food-vendor is an individual entity; all others are organizations

---

## ACCOMMODATION

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-ACM-001 | `hotel` | Hotel / Guesthouse / Shortlet | 2 | — | standalone |

**Discovery tags:** hotel, guesthouse, lodge, shortlet, Airbnb, accommodation, motel, inn, room booking
**Regulatory gate:** CAC

---

## GENERAL RETAIL

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-RET-001 | `supermarket` | Supermarket / Grocery Store | 2 | — | standalone |
| VN-RET-002 | `bookshop` | Bookshop / Stationery Store | 2 | — | standalone |
| VN-RET-003 | `florist` | Florist / Garden Centre | 2 | — | standalone |

**Discovery tags — supermarket:** supermarket, grocery, shopping, provisions, FMCG, convenience store, mini-mart
**Discovery tags — bookshop:** books, stationery, textbooks, school supplies, library
**Discovery tags — florist:** flowers, bouquet, garden, horticulture, decoration, gifts

---

## BEAUTY & PERSONAL CARE (NF-BEA)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-BEA-001 | `beauty-salon` | Beauty Salon / Barber Shop | 2 | NF-BEA | anchor |
| VN-BEA-002 | `spa` | Spa / Massage Parlour | 2 | NF-BEA | variant |
| VN-BEA-003 | `hair-salon` | Hair Salon / Barbing Salon | 3 | NF-BEA | variant |

**Discovery tags:** beauty, salon, barber, hair, spa, massage, nails, makeup, skincare, lashes, weave, dreadlocks, relaxer, barbershop
**Note:** beauty-salon covers mixed (barber + beauty); hair-salon is hair-specialist; spa is relaxation/wellness

---

## FASHION & APPAREL (NF-FSH)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-FSH-001 | `tailor` | Tailoring / Fashion Designer | 2 | NF-FSH | anchor |
| VN-FSH-002 | `tailoring-fashion` | Tailor / Fashion Designer Atelier | 3 | NF-FSH | variant |
| VN-FSH-003 | `shoemaker` | Shoe Cobbler / Shoe Maker | 3 | NF-FSH | variant |

**Discovery tags:** tailor, fashion, sewing, Ankara, aso-oke, atelier, seamstress, cobbler, shoe repair, bespoke, designer
**Note:** tailor = general bespoke; tailoring-fashion = premium atelier/fashion-forward; shoemaker = footwear specialist
**Separate niche:** fashion-brand (VN-CRE-004) — brand/label identity, distinct from production service

---

## CLEANING SERVICES (NF-CLN)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-CLN-001 | `laundry` | Laundry / Dry Cleaner | 2 | NF-CLN | anchor |
| VN-CLN-002 | `cleaning-service` | Cleaning Service | 2 | NF-CLN | variant |
| VN-CLN-003 | `laundry-service` | Laundromat / Laundry Service | 3 | NF-CLN | variant |
| VN-CLN-004 | `cleaning-company` | Cleaning & Facility Management Company | 3 | NF-CLN | variant |

**Differentiators:** laundry = home pickup/dry-clean; laundry-service = on-site laundromat/by-weight; cleaning-service = domestic home cleaning; cleaning-company = corporate FM contracts + crew
**Discovery tags:** laundry, dry clean, washing, cleaning, housekeeping, facility management, janitorial, steaming, ironing

---

## AUTOMOTIVE (AUT)

### Auto Services (NF-AUT-SVC)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-AUT-001 | `auto-mechanic` | Auto Mechanic / Garage | 2 | NF-AUT-SVC | anchor |
| VN-AUT-002 | `car-wash` | Car Wash / Detailing | 3 | NF-AUT-SVC | variant |
| VN-AUT-003 | `tyre-shop` | Tyre Shop / Vulcanizer | 3 | NF-AUT-SVC | variant |

**Discovery tags:** mechanic, garage, car repair, car wash, tyre, vulcanizer, panel beating, auto service, wheel alignment, engine

### Automotive Trade (NF-AUT-TRD)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-AUT-004 | `used-car-dealer` | Used Car Dealer / Auto Trader | 3 | NF-AUT-TRD | anchor |
| VN-AUT-005 | `spare-parts` | Spare Parts Dealer (Ladipo/Nnewi) | 3 | NF-AUT-TRD | variant |
| VN-AUT-006 | `motorcycle-accessories` | Motorcycle Accessories Shop | 3 | NF-AUT-TRD | variant |

**Discovery tags:** used car, tokunbo, spare parts, auto parts, Ladipo, Nnewi, motorcycle, bike parts, car dealer

---

## ENERGY (NRG)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-NRG-001 | `fuel-station` | Fuel Station / Filling Station | 2 | NF-NRG | anchor |
| VN-NRG-002 | `gas-distributor` | Gas / LPG Distributor | 2 | NF-NRG | variant |
| VN-NRG-003 | `solar-installer` | Solar / Renewable Energy Installer | 2 | — | standalone |
| VN-NRG-004 | `generator-dealer` | Generator Sales & Service Centre | 3 | — | standalone |

**NF-NRG discovery tags:** fuel, filling station, petrol, diesel, LPG, cooking gas, cylinder
**Deprecated alias:** `petrol-station` → canonical `fuel-station` (vsyn_petrol_station_fuel_station)
**Regulatory gates:** DPR/NMDPRA (fuel-station, gas-distributor)
**solar-installer discovery tags:** solar, renewable, inverter, panel, battery, off-grid
**generator-dealer discovery tags:** generator, Perkins, Mikano, service centre, diesel generator

---

## PRINT & DESIGN (NF-PRT)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-PRT-001 | `print-shop` | Printing & Branding Shop | 2 | NF-PRT | anchor |
| VN-PRT-002 | `printing-press` | Printing Press / Design Studio | 3 | NF-PRT | variant |

**Discovery tags:** printing, banner, flyer, branding, design, signage, flex, vinyl, business card, letterhead, press, offset, digital print
**Differentiator:** print-shop = small neighbourhood shop; printing-press = larger press or studio with design-first identity

---

## ELECTRONICS REPAIR (NF-ELX)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-ELX-001 | `electronics-repair` | Electronics Repair Shop | 2 | NF-ELX | anchor |
| VN-ELX-002 | `phone-repair-shop` | Phone Repair & Accessories Shop | 3 | NF-ELX | variant |

**Discovery tags:** electronics repair, TV repair, fridge, washing machine, phone repair, screen replacement, accessories, phone shop
**Differentiator:** electronics-repair = general electronics (TV, appliances); phone-repair-shop = phone/accessories specialist

---

## IT & DIGITAL SERVICES (STANDALONE)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-ITC-001 | `it-support` | IT Support / Computer Repair | 2 | — | standalone |
| VN-ITC-002 | `internet-cafe` | Internet Café / Business Centre | 3 | — | standalone |

**it-support discovery tags:** IT support, computer repair, network, SLA, remote support, troubleshooting, tech support
**internet-cafe discovery tags:** internet café, business centre, cybercafe, printing, photocopy, scanning

---

## EVENTS & VENUES (NF-EVT)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-EVT-001 | `event-hall` | Event Hall / Venue | 2 | NF-EVT | anchor |
| VN-EVT-002 | `event-planner` | Event Planner / MC | 2 | NF-EVT | variant |
| VN-EVT-003 | `wedding-planner` | Wedding Planner / Celebrant | 3 | NF-EVT | variant |
| VN-EVT-004 | `events-centre` | Events Centre / Hall Rental | 3 | NF-EVT | variant |

**Discovery tags:** event hall, venue, party hall, wedding, event planner, MC, décor, celebration, birthday, naming ceremony, owambe, events centre, hall rental
**Differentiators:** event-hall = mid-size dedicated event venue; events-centre = larger/multipurpose hall; event-planner = coordination/MC service (person or firm); wedding-planner = wedding specialist

---

## SECURITY

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-SEC-001 | `security-company` | Security Company / Guard Service | 2 | — | standalone |

**Discovery tags:** security, guard, surveillance, CCTV, patrol, escort, protection, access control
**Regulatory gate:** CAC

---

## MANUFACTURING (NF-MFG)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-MFG-001 | `furniture-maker` | Furniture Maker / Wood Workshop | 2 | NF-MFG | anchor |
| VN-MFG-002 | `welding-fabrication` | Welding / Fabrication Shop | 2 | NF-MFG | variant |

**Discovery tags:** furniture, woodwork, carpenter, welder, fabrication, gate, railing, metal work, bespoke furniture, workshop

---

## GENERAL SERVICES (STANDALONE)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-SVC-001 | `pos-business` | POS Business Management System | 1 | — | standalone |
| VN-SVC-002 | `sole-trader` | Sole Trader / Artisan | 1 | — | standalone |
| VN-SVC-003 | `travel-agent` | Travel Agent / Tour Operator | 2 | — | standalone |
| VN-SVC-004 | `advertising-agency` | Advertising Agency | 2 | — | standalone |
| VN-SVC-005 | `startup` | Startup / Early-Stage Company | 3 | — | standalone |

**pos-business notes:** NOT agent POS infrastructure. Inventory + CRM + scheduling for retail businesses.
**sole-trader notes:** Nigeria informal economy core — WhatsApp catalogue; artisans, petty traders.
**travel-agent discovery tags:** travel, flights, hotel booking, tour, visa, holiday, travel package
**advertising-agency discovery tags:** advertising, marketing, media, campaign, brand, PR, digital marketing
**startup discovery tags:** startup, tech company, innovation, founder, early-stage, venture

---

## CONSTRUCTION, REAL ESTATE & HARDWARE (CST)

### Construction & Materials (NF-CST-CON)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-CST-001 | `construction` | Construction Firm / Contractor | 2 | NF-CST-CON | anchor |
| VN-CST-004 | `building-materials` | Building Materials Supplier | 3 | NF-CST-CON | variant |
| VN-CST-005 | `iron-steel` | Iron & Steel / Roofing Merchant | 3 | NF-CST-CON | variant |

**Discovery tags:** construction, contractor, building, blocks, cement, iron, steel, roofing, zinc, materials

### Real Estate (NF-CST-RE)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-CST-002 | `real-estate-agency` | Real Estate Agency | 2 | NF-CST-RE | anchor |
| VN-CST-003 | `property-developer` | Property Developer | 2 | NF-CST-RE | variant |

**Discovery tags:** real estate, property, land, house, apartment, letting, estate agent, developer, off-plan

### Hardware & Supplies (NF-CST-HW)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-CST-006 | `electrical-fittings` | Electrical Fittings Dealer | 3 | NF-CST-HW | anchor |
| VN-CST-007 | `plumbing-supplies` | Plumbing Supplies Dealer | 3 | NF-CST-HW | variant |
| VN-CST-008 | `paints-distributor` | Paints & Coatings Distributor | 3 | NF-CST-HW | variant |

**Discovery tags:** electrical, fittings, sockets, cables, plumbing, pipes, PVC, paints, Dulux, Berger, hardware

### Standalone — Land Surveyor

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-CST-009 | `land-surveyor` | Land Surveyor / Registry Agent | 3 | — | standalone |

**Discovery tags:** land survey, SURCON, cadastral, boundary, land registry, documentation, CAD
**Regulatory gate:** SURCON license

---

## HEALTH (HLT)

### Primary Care (Standalone)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-HLT-001 | `clinic` | Clinic / Healthcare Facility | 1 | — | standalone |
| VN-HLT-008 | `community-health` | Community Health Worker (CHW) Network | 3 | — | standalone |

**clinic discovery tags:** clinic, hospital, healthcare, primary care, doctor, medical centre, maternity, MDCN
**community-health discovery tags:** CHW, primary healthcare, PHC, immunization, referral, community health

### Pharmacy (NF-PHA)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-HLT-002 | `pharmacy` | Pharmacy / Drug Store | 2 | NF-PHA | anchor |
| VN-HLT-011 | `pharmacy-chain` | Pharmacy Chain / Drugstore | 2 | NF-PHA | variant |

**Discovery tags:** pharmacy, drugs, medication, prescription, chemist, NAFDAC, PCN, drugstore
**Regulatory gates:** NAFDAC + PCN (pharmacy); PCN (pharmacy-chain)

### Fitness (NF-HLT-FIT)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-HLT-003 | `sports-academy` | Sports Academy / Fitness Centre | 2 | NF-HLT-FIT | anchor |
| VN-HLT-004 | `gym` | Gym / Wellness Centre | 2 | NF-HLT-FIT | variant |

**Discovery tags:** gym, fitness, sports academy, workout, exercise, coach, training, membership, aerobics, CrossFit
**Deprecated alias:** `gym-fitness` → canonical `gym` (vsyn_gym_fitness_gym)
**Differentiator:** sports-academy = structured sports training with coaching programs; gym = equipment-based fitness centre with membership

### Specialist Clinics (NF-HLT-SPE)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-HLT-005 | `optician` | Optician / Eye Clinic | 2 | NF-HLT-SPE | anchor |
| VN-HLT-006 | `dental-clinic` | Dental Clinic / Orthodontist | 2 | NF-HLT-SPE | variant |
| VN-HLT-007 | `vet-clinic` | Veterinary Clinic / Pet Shop | 2 | NF-HLT-SPE | variant |

**Discovery tags:** optician, eye test, glasses, dental, dentist, orthodontist, vet, veterinary, pet clinic, CFPC, MDCN
**Regulatory gate:** MDCN license (all three)

### Long-term Care (NF-HLT-CAR)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-HLT-009 | `rehab-centre` | Rehabilitation / Recovery Centre | 3 | NF-HLT-CAR | anchor |
| VN-HLT-010 | `elderly-care` | Elderly Care Facility | 3 | NF-HLT-CAR | variant |

**Discovery tags:** rehab, recovery, rehabilitation, elderly care, old people's home, long-term care, mental health
**Regulatory gate:** Health license (health_license FSM state)

---

## EDUCATION (EDU)

### School Education (NF-EDU-SCH)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-EDU-001 | `school` | School / Educational Institution | 1 | NF-EDU-SCH | anchor |
| VN-EDU-006 | `private-school` | Private School Operator | 3 | NF-EDU-SCH | variant |
| VN-EDU-007 | `govt-school` | Government School Management | 3 | NF-EDU-SCH | variant |

**Discovery tags:** school, education, primary, secondary, JSS, SSS, nursery, primary school, WAEC, NECO, JAMB
**Differentiator:** school = generic (all levels); private-school = private operator profile; govt-school = government-managed school digital services

### Early Childhood (NF-EDU-EAR)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-EDU-005 | `creche` | Crèche / Day Care Centre | 3 | NF-EDU-EAR | anchor |
| VN-EDU-008 | `nursery-school` | Nursery / Crèche / Early Childhood Centre | 3 | NF-EDU-EAR | variant |

**Discovery tags:** crèche, nursery, daycare, early childhood, toddler, childcare, playgroup
**Regulatory gates:** State SUBEB (nursery-school); State Ministry (creche)
**Differentiator:** creche = care-focused (drop-off/pickup, daily reports); nursery-school = formal early education with curriculum

### Standalone Education

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-EDU-002 | `training-institute` | Training Institute / Vocational School | 2 | — | standalone |
| VN-EDU-003 | `driving-school` | Driving School | 2 | — | standalone |
| VN-EDU-004 | `tutoring` | Tutoring / Lesson Teacher | 3 | — | standalone |

**training-institute discovery tags:** vocational, skills training, certificate, CAC, institute, NABTEB
**driving-school discovery tags:** driving school, FRSC, driver's licence, defensive driving
**tutoring discovery tags:** tutoring, lesson, home teacher, private lessons, JAMB prep, WAEC, subject

---

## AGRICULTURAL (AGR)

### Agricultural Production (NF-AGR-PRD)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-AGR-001 | `farm` | Farm / Agricultural Producer | 2 | NF-AGR-PRD | anchor |
| VN-AGR-004 | `poultry-farm` | Poultry Farm / Aquaculture | 3 | NF-AGR-PRD | variant |
| VN-AGR-011 | `vegetable-garden` | Vegetable Garden / Horticulture | 3 | NF-AGR-PRD | variant |

**Discovery tags:** farm, agriculture, farmer, crops, harvest, poultry, fish, catfish, chicken, vegetable, urban farm, horticulture

### Agricultural Processing (NF-AGR-PRC)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-AGR-005 | `cassava-miller` | Cassava / Maize / Rice Miller | 3 | NF-AGR-PRC | anchor |
| VN-AGR-008 | `produce-aggregator` | Produce Storage / Market Aggregator | 3 | NF-AGR-PRC | variant |
| VN-AGR-012 | `food-processing` | Food Processing Factory | 3 | NF-AGR-PRC | variant |

**Discovery tags:** miller, cassava, garri, flour, processing, aggregator, warehouse, supply chain, NAFDAC, factory

### Agricultural Commodities (NF-AGR-COM)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-AGR-009 | `palm-oil-trader` | Palm Oil Producer / Trader | 3 | NF-AGR-COM | anchor |
| VN-AGR-010 | `cocoa-exporter` | Cocoa / Export Commodities Trader | 3 | NF-AGR-COM | variant |

**Discovery tags:** palm oil, cocoa, export, commodities, trader, buyer, NXP, forex, CAC

### Food Markets (NF-AGR-MKT)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-AGR-006 | `fish-market` | Fish Market / Fishmonger | 3 | NF-AGR-MKT | anchor |
| VN-AGR-007 | `abattoir` | Abattoir / Meat Processing | 3 | NF-AGR-MKT | variant |

**Discovery tags:** fish market, fishmonger, fresh fish, abattoir, slaughterhouse, meat, beef, NAFDAC

### Standalone Agricultural

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-AGR-002 | `agro-input` | Agro-Input Dealer | 2 | — | standalone |
| VN-AGR-003 | `cold-room` | Cold Room / Storage Facility | 2 | — | standalone |

**agro-input discovery tags:** fertilizer, seeds, agro-chemicals, pesticide, herbicide, crop inputs, farm store
**cold-room discovery tags:** cold room, storage, temperature control, produce storage, cold chain

---

## PROFESSIONAL SERVICES (PRO)

### Licensed Professionals (NF-PRO-LIC)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-PRO-001 | `professional` | Professional (Lawyer/Doctor/Accountant) | 1 | NF-PRO-LIC | anchor |
| VN-PRO-006 | `law-firm` | Law Firm / Legal Practice | 2 | NF-PRO-LIC | variant |
| VN-PRO-007 | `accounting-firm` | Accounting Firm / Audit Practice | 2 | NF-PRO-LIC | variant |

**Discovery tags:** lawyer, doctor, accountant, professional, consultant, licensed, NBA, ICAN, NMA, MDCN, law firm, audit

### Trades & Technical (NF-PRO-TRD)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-PRO-002 | `handyman` | Plumber / Electrician / Handyman | 2 | NF-PRO-TRD | anchor |
| VN-PRO-003 | `generator-repair` | Generator Repair / HVAC Technician | 2 | NF-PRO-TRD | variant |

**Discovery tags:** plumber, electrician, handyman, repair, technician, HVAC, AC repair, generator technician, maintenance

### Standalone Professional

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-PRO-004 | `tax-consultant` | Tax Consultant / Revenue Agent | 3 | — | standalone |
| VN-PRO-005 | `funeral-home` | Burial / Funeral Home | 3 | — | standalone |
| VN-PRO-008 | `pr-firm` | Public Relations Firm | 3 | — | standalone |

---

## CREATOR & ENTERTAINMENT (CRE)

### Digital Creator (NF-CRE-DIG)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-CRE-001 | `creator` | Creator / Influencer | 1 | NF-CRE-DIG | anchor |
| VN-CRE-002 | `photography` | Photography / Videography Studio | 2 | NF-CRE-DIG | variant |
| VN-CRE-007 | `podcast-studio` | Podcast Studio / Audio Platform | 3 | NF-CRE-DIG | variant |
| VN-CRE-008 | `motivational-speaker` | Motivational Speaker / Training Firm | 3 | NF-CRE-DIG | variant |

**Discovery tags:** creator, influencer, content, social media, Instagram, TikTok, photographer, videographer, podcast, speaker, trainer

**Photography package note:** package directory is `packages/verticals-photography-studio` (package alias). Canonical slug is `photography`.

### Music Industry (NF-CRE-MUS)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-CRE-003 | `music-studio` | Music Studio / Recording Artist | 2 | NF-CRE-MUS | anchor |
| VN-CRE-006 | `recording-label` | Record Label / Music Publisher | 3 | NF-CRE-MUS | variant |

**Discovery tags:** music studio, recording, artist, producer, label, music publisher, Afrobeats, beats, release, ISRC

### Standalone Creator

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-CRE-004 | `fashion-brand` | Fashion Brand / Clothing Label | 2 | — | standalone |
| VN-CRE-005 | `talent-agency` | Talent Agency / Model Agency | 3 | — | standalone |

**fashion-brand notes:** Creator-category brand identity (lookbook, wholesale). Distinct from `tailor`/`tailoring-fashion` (production service). Distinct from `tech-hub` type of branding vertical.
**talent-agency discovery tags:** talent agency, modelling, casting, booking, representation

---

## FINANCIAL (FIN)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-FIN-001 | `savings-group` | Thrift / Ajo / Esusu Group | 2 | — | standalone |
| VN-FIN-002 | `insurance-agent` | Insurance Agent / Broker | 2 | — | standalone |
| VN-FIN-003 | `airtime-reseller` | Airtime / VTU Reseller | 3 | — | standalone |
| VN-FIN-004 | `mobile-money-agent` | Mobile Money / POS Agent | 3 | — | standalone |
| VN-FIN-005 | `bureau-de-change` | Bureau de Change / FX Dealer | 3 | — | standalone |
| VN-FIN-006 | `hire-purchase` | Hire Purchase / Asset Finance | 3 | — | standalone |
| VN-FIN-007 | `bank-branch` | Bank Branch / ATM Location | 2 | — | standalone |

**savings-group discovery tags:** ajo, esusu, thrift, contributions, ROSCAs, cooperative savings
**insurance-agent discovery tags:** insurance, policy, NAICOM, underwriting, claims, broker
**airtime-reseller discovery tags:** airtime, VTU, data, MTN, Airtel, Glo, 9mobile, recharge
**mobile-money-agent discovery tags:** POS, mobile money, transfer, agent banking, CBN
**mobile-money-agent note:** Canonical for `mobile-money-agent`; package alias `packages/verticals-mobile-money-agent` (OD-6 fixed).
**bureau-de-change discovery tags:** BDC, forex, FX, exchange rate, dollar, naira, CBN
**bureau-de-change note:** Canonical for `bureau-de-change`; package alias `packages/verticals-bureau-de-change` (OD-6 fixed).
**hire-purchase discovery tags:** hire purchase, asset finance, instalment, leasing
**bank-branch discovery tags:** bank, ATM, branch, CBN, banking hall, deposit, withdrawal

---

## PLACE & INFRASTRUCTURE (PLC)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-PLC-001 | `market` | Market / Trading Hub | 1 | — | standalone |
| VN-PLC-002 | `tech-hub` | Tech Hub / Innovation Centre | 1 | — | standalone |
| VN-PLC-003 | `wholesale-market` | Wholesale Market (Onitsha/Alaba/Ladipo) | 2 | — | standalone |
| VN-PLC-004 | `warehouse` | Warehouse Operator | 2 | NF-STO | anchor |

**market discovery tags:** market, trading, market stalls, vendors, market association
**tech-hub discovery tags:** hub, innovation, coworking, startup, incubator, accelerator
**wholesale-market discovery tags:** Onitsha market, Alaba, Ladipo, wholesale, bulk, traders, Nnewi
**warehouse discovery tags:** warehouse, storage, inventory, logistics, fulfilment, cold chain

### Storage Infrastructure (NF-STO)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-PLC-004 | `warehouse` | Warehouse Operator | 2 | NF-STO | anchor |
| VN-TRP-009 | `container-depot` | Container Depot / Logistics Hub | 3 | NF-STO | variant |

---

## MEDIA & BROADCAST (MED)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-MED-001 | `community-radio` | Community Radio / TV Station | 3 | NF-MED | anchor |
| VN-MED-002 | `newspaper-distribution` | Newspaper Distribution Agency | 3 | NF-MED | variant |

**Discovery tags:** community radio, NBC, broadcast, TV station, newspaper, distribution, print media
**newspaper-distribution note:** Package alias is `packages/verticals-newspaper-dist` (alias: `newspaper-dist`; canonical slug: `newspaper-distribution`).

---

## INSTITUTIONAL (INS)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-INS-001 | `government-agency` | Government Agency / Parastatal | 3 | — | standalone |

**Discovery tags:** government, ministry, parastatal, federal agency, state agency, regulatory body

---

## WATER & UTILITIES (UTL)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-UTL-001 | `water-treatment` | Water Treatment / Borehole Operator | 2 | NF-UTL | anchor |
| VN-UTL-002 | `water-vendor` | Water Tanker / Sachet Water Producer | 3 | NF-UTL | variant |
| VN-UTL-003 | `borehole-driller` | Borehole Drilling Company | 3 | NF-UTL | variant |

**Discovery tags:** borehole, water treatment, pure water, sachet water, tanker, drilling, water supply, NAFDAC (sachet)

---

## EXTRACTIVES (EXT)

| VN-ID | Slug | Display Name | P | Family | Role |
|---|---|---|---|---|---|
| VN-EXT-001 | `artisanal-mining` | Artisanal Mining Operator | 3 | NF-EXT | anchor |
| VN-EXT-002 | `oil-gas-services` | Oil & Gas Service Provider | 3 | NF-EXT | variant |

**Discovery tags:** mining, minerals, artisanal mining, solid minerals, oil, gas, DPR, petroleum services, contractor
**Regulatory gates:** Mines license (artisanal-mining); DPR license (oil-gas-services)

---

## Registry Summary

| Category | Active Niches |
|---|---|
| Politics (POL) | 7 |
| Transport (TRP) | 14 |
| Civic (CIV) | 14 |
| Food Service (FDS) | 5 |
| Accommodation (ACM) | 1 |
| General Retail (RET) | 3 |
| Beauty & Personal Care (BEA) | 3 |
| Fashion & Apparel (FSH) | 3 |
| Cleaning Services (CLN) | 4 |
| Automotive (AUT) | 6 |
| Energy (NRG) | 4 |
| Print & Design (PRT) | 2 |
| Electronics Repair (ELX) | 2 |
| IT & Digital Services (ITC) | 2 |
| Events & Venues (EVT) | 4 |
| Security (SEC) | 1 |
| Manufacturing (MFG) | 2 |
| General Services (SVC) | 5 |
| Construction, RE & Hardware (CST) | 9 |
| Health (HLT) | 11 |
| Education (EDU) | 8 |
| Agricultural (AGR) | 12 |
| Professional Services (PRO) | 8 |
| Creator & Entertainment (CRE) | 8 |
| Financial (FIN) | 7 |
| Place & Infrastructure (PLC) | 4 |
| Media & Broadcast (MED) | 2 |
| Institutional (INS) | 1 |
| Water & Utilities (UTL) | 3 |
| Extractives (EXT) | 2 |
| **TOTAL** | **157** |

*Note: NF-STO (warehouse + container-depot) cross-listed under PLC and TRP respectively; not double-counted in totals.*

---

*Produced: 2026-04-25 — STOP-AND-RECONCILE taxonomy closure*
*Source CSV: `infra/db/seeds/0004_verticals-master.csv` at commit `68eae9a3`*
