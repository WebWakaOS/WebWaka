# WebWaka OS — Vertical Niche Master Table

**Status:** AUTHORITATIVE
**Date:** 2026-04-25
**Source:** `infra/db/seeds/0004_verticals-master.csv` at commit `68eae9a3`
**Taxonomy closure:** `docs/reports/vertical-taxonomy-reconciliation-closure-addendum-2026-04-25.md`

---

## Column Key

| Column | Meaning |
|---|---|
| **Niche ID** | Stable identifier: `VN-[CATEGORY]-[3-digit]` |
| **P** | Priority tier: 1=Original, 2=High-Fit, 3=Medium-Fit |
| **Status** | `active` = planned in CSV; `deprecated` = merged/removed |
| **Slug** | Canonical CSV slug (primary key for all system references) |
| **Display Name** | Human-readable name |
| **CSV Category** | Category field from canonical CSV |
| **Niche Family** | `NF-[CODE]` if part of a shared niche family; `—` if standalone |
| **Niche Role** | `anchor` = primary variant in family; `variant` = secondary; `standalone` = no family |
| **Entity Type** | `organization` / `individual` / `place` |

---

## Section 1 — Politics (POL)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-POL-001 | 1 | active | `politician` | Individual Politician | politics | NF-POL-IND | anchor | individual |
| VN-POL-002 | 1 | active | `political-party` | Political Party | politics | NF-POL-ORG | anchor | organization |
| VN-POL-003 | 3 | active | `campaign-office` | Political Campaign Office | politics | NF-POL-ORG | variant | organization |
| VN-POL-004 | 3 | active | `lga-office` | Local Government Council / Ward Office | politics | NF-POL-ORG | variant | place |
| VN-POL-005 | 3 | active | `polling-unit-rep` | Polling Unit Representative | politics | NF-POL-IND | variant | individual |
| VN-POL-006 | 3 | active | `constituency-office` | Constituency Development Office | politics | NF-POL-ORG | variant | place |
| VN-POL-007 | 2 | active | `ward-rep` | Ward Representative | politics | NF-POL-IND | variant | individual |

**Section total: 7 active**

---

## Section 2 — Transport (TRP)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-TRP-001 | 1 | active | `motor-park` | Motor Park / Bus Terminal | transport | NF-TRP-PAS | anchor | place |
| VN-TRP-002 | 1 | active | `mass-transit` | City Bus / Mass Transit Operator | transport | NF-TRP-PAS | variant | organization |
| VN-TRP-003 | 1 | active | `rideshare` | Carpooling / Ride-Hailing | transport | NF-TRP-PAS | variant | organization |
| VN-TRP-004 | 1 | active | `haulage` | Haulage / Logistics Operator | transport | NF-TRP-FRT | anchor | organization |
| VN-TRP-005 | 2 | active | `road-transport-union` | Road Transport Workers Union (NURTW) | transport | — | standalone | organization |
| VN-TRP-006 | 3 | active | `okada-keke` | Okada / Keke Rider Co-op | transport | NF-TRP-PAS | variant | organization |
| VN-TRP-007 | 3 | active | `ferry` | Ferry / Water Transport Operator | transport | NF-TRP-PAS | variant | organization |
| VN-TRP-008 | 3 | active | `airport-shuttle` | Airport Shuttle Service | transport | NF-TRP-PAS | variant | organization |
| VN-TRP-009 | 3 | active | `container-depot` | Container Depot / Logistics Hub | transport | NF-STO | variant | place |
| VN-TRP-010 | 2 | active | `logistics-delivery` | Logistics & Delivery (Last-Mile) | transport | NF-TRP-FRT | variant | organization |
| VN-TRP-011 | 2 | active | `dispatch-rider` | Dispatch Rider Network | transport | NF-TRP-FRT | variant | organization |
| VN-TRP-012 | 2 | active | `courier` | Courier Service | transport | NF-TRP-FRT | variant | organization |
| VN-TRP-013 | 3 | active | `cargo-truck` | Cargo Truck Owner / Fleet Operator | transport | NF-TRP-FRT | variant | individual |
| VN-TRP-014 | 2 | active | `clearing-agent` | Clearing & Forwarding Agent | transport | NF-TRP-FRT | variant | organization |

**Section total: 14 active**

---

## Section 3 — Civic (CIV)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-CIV-001 | 1 | active | `church` | Church / Faith Community | civic | NF-CIV-REL | anchor | organization |
| VN-CIV-002 | 1 | active | `ngo` | NGO / Non-Profit Organization | civic | NF-CIV-WEL | anchor | organization |
| VN-CIV-003 | 1 | active | `cooperative` | Cooperative Society | civic | NF-CIV-COM | anchor | organization |
| VN-CIV-004 | 3 | active | `mosque` | Mosque / Islamic Centre | civic | NF-CIV-REL | variant | organization |
| VN-CIV-005 | 3 | active | `youth-organization` | Youth Organization / Student Union | civic | NF-CIV-COM | variant | organization |
| VN-CIV-006 | 3 | active | `womens-association` | Women's Association / Forum | civic | NF-CIV-COM | variant | organization |
| VN-CIV-007 | 3 | active | `professional-association` | Professional Association (NBA/NMA/ICAN) | civic | — | standalone | organization |
| VN-CIV-008 | 3 | active | `sports-club` | Sports Club / Amateur League | civic | — | standalone | organization |
| VN-CIV-009 | 3 | active | `book-club` | Book Club / Reading Circle | civic | — | standalone | organization |
| VN-CIV-010 | 3 | active | `orphanage` | Orphanage / Child Care NGO | civic | NF-CIV-WEL | variant | organization |
| VN-CIV-011 | 3 | active | `community-hall` | Community Hall / Town Hall | civic | — | standalone | place |
| VN-CIV-012 | 3 | active | `market-association` | Market Leaders / Traders Association | civic | NF-CIV-COM | variant | organization |
| VN-CIV-013 | 2 | active | `waste-management` | Waste Management / Recycler | civic | — | standalone | organization |
| VN-CIV-014 | 3 | active | `ministry-mission` | Ministry / Apostolic Mission / Outreach | civic | NF-CIV-REL | variant | organization |

**Section total: 14 active**

---

## Section 4 — Food Service (FDS)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-FDS-001 | 2 | active | `restaurant` | Restaurant / Eatery / Buka | commerce | NF-FDS | anchor | organization |
| VN-FDS-002 | 2 | active | `food-vendor` | Food Vendor / Street Food | commerce | NF-FDS | variant | individual |
| VN-FDS-003 | 2 | active | `catering` | Catering Service | commerce | NF-FDS | variant | organization |
| VN-FDS-004 | 2 | active | `bakery` | Bakery / Confectionery | commerce | NF-FDS | variant | organization |
| VN-FDS-005 | 2 | active | `restaurant-chain` | Restaurant / Food Chain Outlet | commerce | NF-FDS | variant | organization |

**Section total: 5 active**

---

## Section 5 — Accommodation (ACM)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-ACM-001 | 2 | active | `hotel` | Hotel / Guesthouse / Shortlet | commerce | — | standalone | organization |

**Section total: 1 active**

---

## Section 6 — General Retail (RET)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-RET-001 | 2 | active | `supermarket` | Supermarket / Grocery Store | commerce | — | standalone | organization |
| VN-RET-002 | 2 | active | `bookshop` | Bookshop / Stationery Store | commerce | — | standalone | organization |
| VN-RET-003 | 2 | active | `florist` | Florist / Garden Centre | commerce | — | standalone | organization |

**Section total: 3 active**

---

## Section 7 — Beauty & Personal Care (BEA)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-BEA-001 | 2 | active | `beauty-salon` | Beauty Salon / Barber Shop | commerce | NF-BEA | anchor | organization |
| VN-BEA-002 | 2 | active | `spa` | Spa / Massage Parlour | commerce | NF-BEA | variant | organization |
| VN-BEA-003 | 3 | active | `hair-salon` | Hair Salon / Barbing Salon | commerce | NF-BEA | variant | individual |

**Section total: 3 active**

---

## Section 8 — Fashion & Apparel (FSH)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-FSH-001 | 2 | active | `tailor` | Tailoring / Fashion Designer | commerce | NF-FSH | anchor | individual |
| VN-FSH-002 | 3 | active | `tailoring-fashion` | Tailor / Fashion Designer Atelier | commerce | NF-FSH | variant | individual |
| VN-FSH-003 | 3 | active | `shoemaker` | Shoe Cobbler / Shoe Maker | commerce | NF-FSH | variant | individual |

**Section total: 3 active**

---

## Section 9 — Cleaning Services (CLN)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-CLN-001 | 2 | active | `laundry` | Laundry / Dry Cleaner | commerce | NF-CLN | anchor | organization |
| VN-CLN-002 | 2 | active | `cleaning-service` | Cleaning Service | commerce | NF-CLN | variant | organization |
| VN-CLN-003 | 3 | active | `laundry-service` | Laundromat / Laundry Service | commerce | NF-CLN | variant | organization |
| VN-CLN-004 | 3 | active | `cleaning-company` | Cleaning & Facility Management Company | commerce | NF-CLN | variant | organization |

**Section total: 4 active**

---

## Section 10 — Automotive (AUT)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-AUT-001 | 2 | active | `auto-mechanic` | Auto Mechanic / Garage | commerce | NF-AUT-SVC | anchor | organization |
| VN-AUT-002 | 3 | active | `car-wash` | Car Wash / Detailing | commerce | NF-AUT-SVC | variant | organization |
| VN-AUT-003 | 3 | active | `tyre-shop` | Tyre Shop / Vulcanizer | commerce | NF-AUT-SVC | variant | organization |
| VN-AUT-004 | 3 | active | `used-car-dealer` | Used Car Dealer / Auto Trader | commerce | NF-AUT-TRD | anchor | organization |
| VN-AUT-005 | 3 | active | `spare-parts` | Spare Parts Dealer (Ladipo/Nnewi) | commerce | NF-AUT-TRD | variant | organization |
| VN-AUT-006 | 3 | active | `motorcycle-accessories` | Motorcycle Accessories Shop | commerce | NF-AUT-TRD | variant | organization |

**Section total: 6 active**

---

## Section 11 — Energy (NRG)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-NRG-001 | 2 | active | `fuel-station` | Fuel Station / Filling Station | commerce | NF-NRG | anchor | place |
| VN-NRG-002 | 2 | active | `gas-distributor` | Gas / LPG Distributor | commerce | NF-NRG | variant | organization |
| VN-NRG-003 | 2 | active | `solar-installer` | Solar / Renewable Energy Installer | commerce | — | standalone | organization |
| VN-NRG-004 | 3 | active | `generator-dealer` | Generator Sales & Service Centre | commerce | — | standalone | organization |

**Section total: 4 active**

---

## Section 12 — Print & Design (PRT)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-PRT-001 | 2 | active | `print-shop` | Printing & Branding Shop | commerce | NF-PRT | anchor | organization |
| VN-PRT-002 | 3 | active | `printing-press` | Printing Press / Design Studio | commerce | NF-PRT | variant | organization |

**Section total: 2 active**

---

## Section 13 — Electronics Repair (ELX)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-ELX-001 | 2 | active | `electronics-repair` | Electronics Repair Shop | commerce | NF-ELX | anchor | organization |
| VN-ELX-002 | 3 | active | `phone-repair-shop` | Phone Repair & Accessories Shop | commerce | NF-ELX | variant | individual |

**Section total: 2 active**

---

## Section 14 — IT & Digital Services (ITC)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-ITC-001 | 2 | active | `it-support` | IT Support / Computer Repair | professional | — | standalone | individual |
| VN-ITC-002 | 3 | active | `internet-cafe` | Internet Café / Business Centre | commerce | — | standalone | organization |

**Section total: 2 active**

---

## Section 15 — Events & Venues (EVT)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-EVT-001 | 2 | active | `event-hall` | Event Hall / Venue | place | NF-EVT | anchor | place |
| VN-EVT-002 | 2 | active | `event-planner` | Event Planner / MC | professional | NF-EVT | variant | individual |
| VN-EVT-003 | 3 | active | `wedding-planner` | Wedding Planner / Celebrant | professional | NF-EVT | variant | individual |
| VN-EVT-004 | 3 | active | `events-centre` | Events Centre / Hall Rental | place | NF-EVT | variant | place |

**Section total: 4 active**

---

## Section 16 — Security (SEC)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-SEC-001 | 2 | active | `security-company` | Security Company / Guard Service | commerce | — | standalone | organization |

**Section total: 1 active**

---

## Section 17 — Manufacturing (MFG)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-MFG-001 | 2 | active | `furniture-maker` | Furniture Maker / Wood Workshop | commerce | NF-MFG | anchor | organization |
| VN-MFG-002 | 2 | active | `welding-fabrication` | Welding / Fabrication Shop | commerce | NF-MFG | variant | individual |

**Section total: 2 active**

---

## Section 18 — General Services (SVC)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-SVC-001 | 1 | active | `pos-business` | POS Business Management System | commerce | — | standalone | organization |
| VN-SVC-002 | 1 | active | `sole-trader` | Sole Trader / Artisan | commerce | — | standalone | individual |
| VN-SVC-003 | 2 | active | `travel-agent` | Travel Agent / Tour Operator | commerce | — | standalone | organization |
| VN-SVC-004 | 2 | active | `advertising-agency` | Advertising Agency | media | — | standalone | organization |
| VN-SVC-005 | 3 | active | `startup` | Startup / Early-Stage Company | professional | — | standalone | organization |

**Section total: 5 active**

---

## Section 19 — Construction, Real Estate & Hardware (CST)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-CST-001 | 2 | active | `construction` | Construction Firm / Contractor | commerce | NF-CST-CON | anchor | organization |
| VN-CST-002 | 2 | active | `real-estate-agency` | Real Estate Agency | commerce | NF-CST-RE | anchor | organization |
| VN-CST-003 | 2 | active | `property-developer` | Property Developer | commerce | NF-CST-RE | variant | organization |
| VN-CST-004 | 3 | active | `building-materials` | Building Materials Supplier | commerce | NF-CST-CON | variant | organization |
| VN-CST-005 | 3 | active | `iron-steel` | Iron & Steel / Roofing Merchant | commerce | NF-CST-CON | variant | organization |
| VN-CST-006 | 3 | active | `electrical-fittings` | Electrical Fittings Dealer | commerce | NF-CST-HW | anchor | organization |
| VN-CST-007 | 3 | active | `plumbing-supplies` | Plumbing Supplies Dealer | commerce | NF-CST-HW | variant | organization |
| VN-CST-008 | 3 | active | `paints-distributor` | Paints & Coatings Distributor | commerce | NF-CST-HW | variant | organization |
| VN-CST-009 | 3 | active | `land-surveyor` | Land Surveyor / Registry Agent | professional | — | standalone | individual |

**Section total: 9 active**

---

## Section 20 — Health (HLT)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-HLT-001 | 1 | active | `clinic` | Clinic / Healthcare Facility | health | — | standalone | organization |
| VN-HLT-002 | 2 | active | `pharmacy` | Pharmacy / Drug Store | health | NF-PHA | anchor | organization |
| VN-HLT-003 | 2 | active | `sports-academy` | Sports Academy / Fitness Centre | health | NF-HLT-FIT | anchor | organization |
| VN-HLT-004 | 2 | active | `gym` | Gym / Wellness Centre | health | NF-HLT-FIT | variant | organization |
| VN-HLT-005 | 2 | active | `optician` | Optician / Eye Clinic | health | NF-HLT-SPE | anchor | organization |
| VN-HLT-006 | 2 | active | `dental-clinic` | Dental Clinic / Orthodontist | health | NF-HLT-SPE | variant | organization |
| VN-HLT-007 | 2 | active | `vet-clinic` | Veterinary Clinic / Pet Shop | health | NF-HLT-SPE | variant | organization |
| VN-HLT-008 | 3 | active | `community-health` | Community Health Worker (CHW) Network | health | — | standalone | organization |
| VN-HLT-009 | 3 | active | `rehab-centre` | Rehabilitation / Recovery Centre | health | NF-HLT-CAR | anchor | organization |
| VN-HLT-010 | 3 | active | `elderly-care` | Elderly Care Facility | health | NF-HLT-CAR | variant | organization |
| VN-HLT-011 | 2 | active | `pharmacy-chain` | Pharmacy Chain / Drugstore | health | NF-PHA | variant | organization |

**Section total: 11 active**

---

## Section 21 — Education (EDU)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-EDU-001 | 1 | active | `school` | School / Educational Institution | education | NF-EDU-SCH | anchor | organization |
| VN-EDU-002 | 2 | active | `training-institute` | Training Institute / Vocational School | education | — | standalone | organization |
| VN-EDU-003 | 2 | active | `driving-school` | Driving School | education | — | standalone | organization |
| VN-EDU-004 | 3 | active | `tutoring` | Tutoring / Lesson Teacher | education | — | standalone | individual |
| VN-EDU-005 | 3 | active | `creche` | Crèche / Day Care Centre | education | NF-EDU-EAR | anchor | organization |
| VN-EDU-006 | 3 | active | `private-school` | Private School Operator | education | NF-EDU-SCH | variant | organization |
| VN-EDU-007 | 3 | active | `govt-school` | Government School Management | education | NF-EDU-SCH | variant | organization |
| VN-EDU-008 | 3 | active | `nursery-school` | Nursery / Crèche / Early Childhood Centre | education | NF-EDU-EAR | variant | organization |

**Section total: 8 active**

---

## Section 22 — Agricultural (AGR)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-AGR-001 | 2 | active | `farm` | Farm / Agricultural Producer | agricultural | NF-AGR-PRD | anchor | organization |
| VN-AGR-002 | 2 | active | `agro-input` | Agro-Input Dealer | agricultural | — | standalone | organization |
| VN-AGR-003 | 2 | active | `cold-room` | Cold Room / Storage Facility | agricultural | — | standalone | place |
| VN-AGR-004 | 3 | active | `poultry-farm` | Poultry Farm / Aquaculture | agricultural | NF-AGR-PRD | variant | organization |
| VN-AGR-005 | 3 | active | `cassava-miller` | Cassava / Maize / Rice Miller | agricultural | NF-AGR-PRC | anchor | organization |
| VN-AGR-006 | 3 | active | `fish-market` | Fish Market / Fishmonger | agricultural | NF-AGR-MKT | anchor | place |
| VN-AGR-007 | 3 | active | `abattoir` | Abattoir / Meat Processing | agricultural | NF-AGR-MKT | variant | place |
| VN-AGR-008 | 3 | active | `produce-aggregator` | Produce Storage / Market Aggregator | agricultural | NF-AGR-PRC | variant | organization |
| VN-AGR-009 | 3 | active | `palm-oil-trader` | Palm Oil Producer / Trader | agricultural | NF-AGR-COM | anchor | organization |
| VN-AGR-010 | 3 | active | `cocoa-exporter` | Cocoa / Export Commodities Trader | agricultural | NF-AGR-COM | variant | organization |
| VN-AGR-011 | 3 | active | `vegetable-garden` | Vegetable Garden / Horticulture | agricultural | NF-AGR-PRD | variant | individual |
| VN-AGR-012 | 3 | active | `food-processing` | Food Processing Factory | agricultural | NF-AGR-PRC | variant | organization |

**Section total: 12 active**

---

## Section 23 — Professional Services (PRO)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-PRO-001 | 1 | active | `professional` | Professional (Lawyer/Doctor/Accountant) | professional | NF-PRO-LIC | anchor | individual |
| VN-PRO-002 | 2 | active | `handyman` | Plumber / Electrician / Handyman | professional | NF-PRO-TRD | anchor | individual |
| VN-PRO-003 | 2 | active | `generator-repair` | Generator Repair / HVAC Technician | professional | NF-PRO-TRD | variant | individual |
| VN-PRO-004 | 3 | active | `tax-consultant` | Tax Consultant / Revenue Agent | professional | — | standalone | individual |
| VN-PRO-005 | 3 | active | `funeral-home` | Burial / Funeral Home | professional | — | standalone | organization |
| VN-PRO-006 | 2 | active | `law-firm` | Law Firm / Legal Practice | professional | NF-PRO-LIC | variant | organization |
| VN-PRO-007 | 2 | active | `accounting-firm` | Accounting Firm / Audit Practice | professional | NF-PRO-LIC | variant | organization |
| VN-PRO-008 | 3 | active | `pr-firm` | Public Relations Firm | professional | — | standalone | organization |

**Section total: 8 active**

---

## Section 24 — Creator & Entertainment (CRE)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-CRE-001 | 1 | active | `creator` | Creator / Influencer | creator | NF-CRE-DIG | anchor | individual |
| VN-CRE-002 | 2 | active | `photography` | Photography / Videography Studio | creator | NF-CRE-DIG | variant | individual |
| VN-CRE-003 | 2 | active | `music-studio` | Music Studio / Recording Artist | creator | NF-CRE-MUS | anchor | individual |
| VN-CRE-004 | 2 | active | `fashion-brand` | Fashion Brand / Clothing Label | creator | — | standalone | organization |
| VN-CRE-005 | 3 | active | `talent-agency` | Talent Agency / Model Agency | creator | — | standalone | organization |
| VN-CRE-006 | 3 | active | `recording-label` | Record Label / Music Publisher | creator | NF-CRE-MUS | variant | organization |
| VN-CRE-007 | 3 | active | `podcast-studio` | Podcast Studio / Audio Platform | creator | NF-CRE-DIG | variant | organization |
| VN-CRE-008 | 3 | active | `motivational-speaker` | Motivational Speaker / Training Firm | creator | NF-CRE-DIG | variant | individual |

**Section total: 8 active**

---

## Section 25 — Financial (FIN)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-FIN-001 | 2 | active | `savings-group` | Thrift / Ajo / Esusu Group | financial | — | standalone | organization |
| VN-FIN-002 | 2 | active | `insurance-agent` | Insurance Agent / Broker | financial | — | standalone | individual |
| VN-FIN-003 | 3 | active | `airtime-reseller` | Airtime / VTU Reseller | financial | — | standalone | individual |
| VN-FIN-004 | 3 | active | `mobile-money-agent` | Mobile Money / POS Agent | financial | — | standalone | individual |
| VN-FIN-005 | 3 | active | `bureau-de-change` | Bureau de Change / FX Dealer | financial | — | standalone | organization |
| VN-FIN-006 | 3 | active | `hire-purchase` | Hire Purchase / Asset Finance | financial | — | standalone | organization |
| VN-FIN-007 | 2 | active | `bank-branch` | Bank Branch / ATM Location | financial | — | standalone | organization |

**Section total: 7 active**

---

## Section 26 — Place & Infrastructure (PLC)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-PLC-001 | 1 | active | `market` | Market / Trading Hub | place | — | standalone | place |
| VN-PLC-002 | 1 | active | `tech-hub` | Tech Hub / Innovation Centre | place | — | standalone | place |
| VN-PLC-003 | 2 | active | `wholesale-market` | Wholesale Market (Onitsha/Alaba/Ladipo) | place | — | standalone | place |
| VN-PLC-004 | 2 | active | `warehouse` | Warehouse Operator | place | NF-STO | anchor | place |

**Section total: 4 active**

---

## Section 27 — Media & Broadcast (MED)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-MED-001 | 3 | active | `community-radio` | Community Radio / TV Station | media | NF-MED | anchor | organization |
| VN-MED-002 | 3 | active | `newspaper-distribution` | Newspaper Distribution Agency | media | NF-MED | variant | organization |

**Section total: 2 active**

---

## Section 28 — Institutional (INS)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-INS-001 | 3 | active | `government-agency` | Government Agency / Parastatal | institutional | — | standalone | organization |

**Section total: 1 active**

---

## Section 29 — Water & Utilities (UTL)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-UTL-001 | 2 | active | `water-treatment` | Water Treatment / Borehole Operator | place | NF-UTL | anchor | organization |
| VN-UTL-002 | 3 | active | `water-vendor` | Water Tanker / Sachet Water Producer | commerce | NF-UTL | variant | organization |
| VN-UTL-003 | 3 | active | `borehole-driller` | Borehole Drilling Company | commerce | NF-UTL | variant | organization |

**Section total: 3 active**

---

## Section 30 — Storage Infrastructure (STO)

*(Container depot and warehouse — placed here for cross-category clarity)*

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-PLC-004 | 2 | active | `warehouse` | Warehouse Operator | place | NF-STO | anchor | place |
| VN-TRP-009 | 3 | active | `container-depot` | Container Depot / Logistics Hub | transport | NF-STO | variant | place |

*Note: These rows already appear in their primary sections (PLC and TRP). This section shows them together for family reference only.*

---

## Section 31 — Extractives (EXT)

| Niche ID | P | Status | Slug | Display Name | CSV Category | Niche Family | Role | Entity Type |
|---|---|---|---|---|---|---|---|---|
| VN-EXT-001 | 3 | active | `artisanal-mining` | Artisanal Mining Operator | commerce | NF-EXT | anchor | organization |
| VN-EXT-002 | 3 | active | `oil-gas-services` | Oil & Gas Service Provider | commerce | NF-EXT | variant | organization |

**Section total: 2 active**

---

## Section 32 — Deprecated Entries

These 3 entries are in the CSV with `status='deprecated'`. They are routed to their canonical replacements via the synonym map. No new profile should be created under these slugs.

| Niche ID | P | Status | Slug | Display Name | Canonical Replacement | Synonym Map ID | Deprecated |
|---|---|---|---|---|---|---|---|
| VN-DEP-001 | 3 | deprecated | `gym-fitness` | Gym / Fitness Centre | `gym` (VN-HLT-004) | `vsyn_gym_fitness_gym` | 2026-04-25 |
| VN-DEP-002 | 3 | deprecated | `petrol-station` | Petrol Station / Filling Station | `fuel-station` (VN-NRG-001) | `vsyn_petrol_station_fuel_station` | 2026-04-25 |
| VN-DEP-003 | 2 | deprecated | `nurtw` | NURTW (Road Transport Workers Union) | `road-transport-union` (VN-TRP-005) | `vsyn_nurtw_road_transport_union` | 2026-04-25 |

---

## Summary Count

| Priority / Status | Count | Verified |
|---|---|---|
| P1 Active | 17 | ✓ |
| P2 Active | 63 | ✓ |
| P3 Active | 77 | ✓ |
| **Total Active** | **157** | ✓ |
| Deprecated | 3 | ✓ |
| **Total CSV rows** | **160** | ✓ |
| Niche families | 39 | ✓ |
| Verticals in families | 113 | ✓ |
| Standalone niches | 44 | ✓ |
| 113 + 44 | 157 | ✓ |

---

*Source: `infra/db/seeds/0004_verticals-master.csv` at commit `68eae9a3`*
*Produced: 2026-04-25 as part of STOP-AND-RECONCILE closure*
