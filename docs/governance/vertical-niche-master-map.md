# WebWaka OS — Canonical Vertical-to-Niche Master Map

  **Status:** AUTHORITATIVE — Single Source of Truth
  **Date:** 2026-04-25
  **CSV base:** `infra/db/seeds/0004_verticals-master.csv` locked at commit `68eae9a3`
  **Governance docs commit:** `8a559505` on `staging`

  > This document is the complete, unambiguous mapping of every active vertical to its niche identity.
  > It supersedes all partial tables, old 46-item registry assumptions, and any vertical/niche count confusion.
  > Every active vertical appears exactly once. Every deprecated vertical appears in Section D.

  ---

  ## Count Verification

  | Item | Count | Source |
  |---|---|---|
  | Active (planned) verticals | **157** | CSV `status=planned` |
  | Deprecated verticals | **3** | CSV `status=deprecated` |
  | Total CSV rows | **160** | 157 + 3 |
  | P1 (Original Launch) | **17** | CSV `priority=1` |
  | P2 (High-Fit) | **63** | CSV `priority=2` |
  | P3 (Medium-Fit) | **77** | CSV `priority=3` |
  | P1 + P2 + P3 | **157** | 17 + 63 + 77 ✓ |
  | Niche families | **39** | Section B |
  | Verticals in a family | **113** | Section B members |
  | Standalone niches | **44** | Section C |
  | 113 + 44 | **157** | ✓ |

  ---

  ## Section A — Complete Vertical-to-Niche Master Table (157 rows)

  Sorted by: Priority tier → CSV category → slug.

  **Column key:**
  - **VN-ID** — stable niche identifier (`VN-[CATEGORY]-[NNN]`)
  - **P** — priority tier (1 / 2 / 3)
  - **Milestone** — implementation milestone target
  - **Entity** — organization / individual / place
  - **Niche Family** — `NF-[CODE]` or `standalone`
  - **Role** — anchor (first-built baseline) / variant (inherits anchor) / standalone (self-contained)
  - **Alias / Deprecated** — non-canonical slugs routing here, if any
  - **Blockers / Notes** — regulatory gates or special handling

  | VN-ID | Slug | Name | P | Milestone | Entity | Niche Family | Role | Alias / Deprecated | Blockers / Notes |
  |---|---|---|---|---|---|---|---|---|---|
  | VN-CIV-001 | `church` | Church / Faith Community | 1 | M8d | organization | `NF-CIV-REL` | anchor | — | IT registration gate |
| VN-CIV-003 | `cooperative` | Cooperative Society | 1 | M8d | organization | `NF-CIV-COM` | anchor | — | — |
| VN-CIV-002 | `ngo` | NGO / Non-Profit Organization | 1 | M8d | organization | `NF-CIV-WEL` | anchor | — | IT registration gate |
| VN-SVC-001 | `pos-business` | POS Business Management System | 1 | M8b | organization | **standalone** | standalone | — | — |
| VN-SVC-002 | `sole-trader` | Sole Trader / Artisan | 1 | M8e | individual | **standalone** | standalone | — | — |
| VN-CRE-001 | `creator` | Creator / Influencer | 1 | M8e | individual | `NF-CRE-DIG` | anchor | — | P1 anchor |
| VN-EDU-001 | `school` | School / Educational Institution | 1 | M8e | organization | `NF-EDU-SCH` | anchor | — | P1 anchor |
| VN-HLT-001 | `clinic` | Clinic / Healthcare Facility | 1 | M8e | organization | **standalone** | standalone | — | MDCN license; P1 anchor |
| VN-PLC-001 | `market` | Market / Trading Hub | 1 | M8e | place | **standalone** | standalone | — | P1 anchor |
| VN-PLC-002 | `tech-hub` | Tech Hub / Innovation Centre | 1 | M8e | place | **standalone** | standalone | — | P1 anchor |
| VN-POL-002 | `political-party` | Political Party | 1 | M8b | organization | `NF-POL-ORG` | anchor | — | — |
| VN-POL-001 | `politician` | Individual Politician | 1 | M8b | individual | `NF-POL-IND` | anchor | — | — |
| VN-PRO-001 | `professional` | Professional (Lawyer/Doctor/Accountant) | 1 | M8e | individual | `NF-PRO-LIC` | anchor | — | P1 anchor; multi-license gate |
| VN-TRP-004 | `haulage` | Haulage / Logistics Operator | 1 | M8c | organization | `NF-TRP-FRT` | anchor | — | — |
| VN-TRP-002 | `mass-transit` | City Bus / Mass Transit Operator | 1 | M8c | organization | `NF-TRP-PAS` | variant | transit (pkg alias — AI config corrected OD-5) | Route licensing deferred M6c |
| VN-TRP-001 | `motor-park` | Motor Park / Bus Terminal | 1 | M8c | place | `NF-TRP-PAS` | anchor | — | — |
| VN-TRP-003 | `rideshare` | Carpooling / Ride-Hailing | 1 | M8c | organization | `NF-TRP-PAS` | variant | — | — |
| VN-AGR-002 | `agro-input` | Agro-Input Dealer | 2 | M10 | organization | **standalone** | standalone | — | — |
| VN-AGR-003 | `cold-room` | Cold Room / Storage Facility | 2 | M10 | place | **standalone** | standalone | — | — |
| VN-AGR-001 | `farm` | Farm / Agricultural Producer | 2 | M10 | organization | `NF-AGR-PRD` | anchor | — | — |
| VN-CIV-013 | `waste-management` | Waste Management / Recycler | 2 | M10 | organization | **standalone** | standalone | — | — |
| VN-AUT-001 | `auto-mechanic` | Auto Mechanic / Garage | 2 | M9 | organization | `NF-AUT-SVC` | anchor | — | — |
| VN-FDS-004 | `bakery` | Bakery / Confectionery | 2 | M9 | organization | `NF-FDS` | variant | — | — |
| VN-BEA-001 | `beauty-salon` | Beauty Salon / Barber Shop | 2 | M9 | organization | `NF-BEA` | anchor | — | — |
| VN-RET-002 | `bookshop` | Bookshop / Stationery Store | 2 | M10 | organization | **standalone** | standalone | — | — |
| VN-FDS-003 | `catering` | Catering Service | 2 | M9 | organization | `NF-FDS` | variant | — | — |
| VN-CLN-002 | `cleaning-service` | Cleaning Service | 2 | M9 | organization | `NF-CLN` | variant | — | — |
| VN-CST-001 | `construction` | Construction Firm / Contractor | 2 | M9 | organization | `NF-CST-CON` | anchor | — | CAC required; KYC tier 3 |
| VN-ELX-001 | `electronics-repair` | Electronics Repair Shop | 2 | M9 | organization | `NF-ELX` | anchor | — | — |
| VN-RET-003 | `florist` | Florist / Garden Centre | 2 | M10 | organization | **standalone** | standalone | — | — |
| VN-FDS-002 | `food-vendor` | Food Vendor / Street Food | 2 | M9 | individual | `NF-FDS` | variant | — | — |
| VN-NRG-001 | `fuel-station` | Fuel Station / Filling Station | 2 | M9 | place | `NF-NRG` | anchor | ← petrol-station (deprecated, canonical replacement) | DPR/NMDPRA license |
| VN-MFG-001 | `furniture-maker` | Furniture Maker / Wood Workshop | 2 | M10 | organization | `NF-MFG` | anchor | — | — |
| VN-NRG-002 | `gas-distributor` | Gas / LPG Distributor | 2 | M9 | organization | `NF-NRG` | variant | — | DPR license |
| VN-ACM-001 | `hotel` | Hotel / Guesthouse / Shortlet | 2 | M9 | organization | **standalone** | standalone | — | — |
| VN-CLN-001 | `laundry` | Laundry / Dry Cleaner | 2 | M9 | organization | `NF-CLN` | anchor | — | — |
| VN-PRT-001 | `print-shop` | Printing & Branding Shop | 2 | M9 | organization | `NF-PRT` | anchor | — | — |
| VN-CST-003 | `property-developer` | Property Developer | 2 | M9 | organization | `NF-CST-RE` | variant | — | CAC required; KYC tier 3 |
| VN-CST-002 | `real-estate-agency` | Real Estate Agency | 2 | M9 | organization | `NF-CST-RE` | anchor | — | — |
| VN-FDS-001 | `restaurant` | Restaurant / Eatery / Buka | 2 | M9 | organization | `NF-FDS` | anchor | — | PILLAR 2 ANCHOR — build first in family |
| VN-FDS-005 | `restaurant-chain` | Restaurant / Food Chain Outlet | 2 | M9 | organization | `NF-FDS` | variant | — | NAFDAC chain license; build after restaurant |
| VN-SEC-001 | `security-company` | Security Company / Guard Service | 2 | M9 | organization | **standalone** | standalone | — | — |
| VN-NRG-003 | `solar-installer` | Solar / Renewable Energy Installer | 2 | M10 | organization | **standalone** | standalone | — | — |
| VN-BEA-002 | `spa` | Spa / Massage Parlour | 2 | M10 | organization | `NF-BEA` | variant | — | — |
| VN-RET-001 | `supermarket` | Supermarket / Grocery Store | 2 | M9 | organization | **standalone** | standalone | — | — |
| VN-FSH-001 | `tailor` | Tailoring / Fashion Designer | 2 | M9 | individual | `NF-FSH` | anchor | — | — |
| VN-SVC-003 | `travel-agent` | Travel Agent / Tour Operator | 2 | M10 | organization | **standalone** | standalone | — | — |
| VN-MFG-002 | `welding-fabrication` | Welding / Fabrication Shop | 2 | M10 | individual | `NF-MFG` | variant | — | — |
| VN-CRE-004 | `fashion-brand` | Fashion Brand / Clothing Label | 2 | M9 | organization | **standalone** | standalone | — | — |
| VN-CRE-003 | `music-studio` | Music Studio / Recording Artist | 2 | M9 | individual | `NF-CRE-MUS` | anchor | — | — |
| VN-CRE-002 | `photography` | Photography / Videography Studio | 2 | M9 | individual | `NF-CRE-DIG` | variant | photography-studio (pkg dir alias — 0037a corrected) | — |
| VN-EDU-003 | `driving-school` | Driving School | 2 | M9 | organization | **standalone** | standalone | — | FRSC license |
| VN-EDU-002 | `training-institute` | Training Institute / Vocational School | 2 | M9 | organization | **standalone** | standalone | slug 'vocational' corrected→'training-institute' (0037a) | — |
| VN-FIN-007 | `bank-branch` | Bank Branch / ATM Location | 2 | M9 | organization | **standalone** | standalone | — | Added to CSV 2026-04-25; CBN parent institution link |
| VN-FIN-002 | `insurance-agent` | Insurance Agent / Broker | 2 | M10 | individual | **standalone** | standalone | — | NAICOM license |
| VN-FIN-001 | `savings-group` | Thrift / Ajo / Esusu Group | 2 | M9 | organization | **standalone** | standalone | — | — |
| VN-HLT-006 | `dental-clinic` | Dental Clinic / Orthodontist | 2 | M10 | organization | `NF-HLT-SPE` | variant | slug 'dental' corrected→'dental-clinic' (0037a) | MDCN |
| VN-HLT-004 | `gym` | Gym / Wellness Centre | 2 | M10 | organization | `NF-HLT-FIT` | variant | ← gym-fitness (deprecated, canonical replacement) | — |
| VN-HLT-005 | `optician` | Optician / Eye Clinic | 2 | M10 | organization | `NF-HLT-SPE` | anchor | — | MDCN; 0037a corrected slug |
| VN-HLT-002 | `pharmacy` | Pharmacy / Drug Store | 2 | M9 | organization | `NF-PHA` | anchor | — | NAFDAC + PCN |
| VN-HLT-011 | `pharmacy-chain` | Pharmacy Chain / Drugstore | 2 | M9 | organization | `NF-PHA` | variant | — | PCN chain license |
| VN-HLT-003 | `sports-academy` | Sports Academy / Fitness Centre | 2 | M10 | organization | `NF-HLT-FIT` | anchor | — | — |
| VN-HLT-007 | `vet-clinic` | Veterinary Clinic / Pet Shop | 2 | M10 | organization | `NF-HLT-SPE` | variant | slug 'vet' corrected→'vet-clinic' (0037a) | MDCN |
| VN-SVC-004 | `advertising-agency` | Advertising Agency | 2 | M10 | organization | **standalone** | standalone | — | — |
| VN-EVT-001 | `event-hall` | Event Hall / Venue | 2 | M9 | place | `NF-EVT` | anchor | — | — |
| VN-PLC-004 | `warehouse` | Warehouse Operator | 2 | M10 | place | `NF-STO` | anchor | — | — |
| VN-UTL-001 | `water-treatment` | Water Treatment / Borehole Operator | 2 | M10 | organization | `NF-UTL` | anchor | — | — |
| VN-PLC-003 | `wholesale-market` | Wholesale Market (Onitsha/Alaba/Ladipo) | 2 | M9 | place | **standalone** | standalone | — | — |
| VN-POL-007 | `ward-rep` | Ward Representative | 2 | M8b | individual | `NF-POL-IND` | variant | — | — |
| VN-PRO-007 | `accounting-firm` | Accounting Firm / Audit Practice | 2 | M9 | organization | `NF-PRO-LIC` | variant | — | ICAN verification |
| VN-EVT-002 | `event-planner` | Event Planner / MC | 2 | M9 | individual | `NF-EVT` | variant | — | — |
| VN-PRO-003 | `generator-repair` | Generator Repair / HVAC Technician | 2 | M10 | individual | `NF-PRO-TRD` | variant | — | — |
| VN-PRO-002 | `handyman` | Plumber / Electrician / Handyman | 2 | M9 | individual | `NF-PRO-TRD` | anchor | — | — |
| VN-ITC-001 | `it-support` | IT Support / Computer Repair | 2 | M9 | individual | **standalone** | standalone | — | 0037a: primary_pillars corrected |
| VN-PRO-006 | `law-firm` | Law Firm / Legal Practice | 2 | M9 | organization | `NF-PRO-LIC` | variant | — | NBA verification |
| VN-TRP-014 | `clearing-agent` | Clearing & Forwarding Agent | 2 | M10 | organization | `NF-TRP-FRT` | variant | — | KYC tier 3 required |
| VN-TRP-012 | `courier` | Courier Service | 2 | M9 | organization | `NF-TRP-FRT` | variant | — | — |
| VN-TRP-011 | `dispatch-rider` | Dispatch Rider Network | 2 | M9 | organization | `NF-TRP-FRT` | variant | — | — |
| VN-TRP-010 | `logistics-delivery` | Logistics & Delivery (Last-Mile) | 2 | M9 | organization | `NF-TRP-FRT` | variant | — | — |
| VN-TRP-005 | `road-transport-union` | Road Transport Workers Union (NURTW) | 2 | M8c | organization | **standalone** | standalone | ← nurtw (deprecated, canonical replacement) | Priority upgraded P3→P2 (OD-3) |
| VN-AGR-007 | `abattoir` | Abattoir / Meat Processing | 3 | M10 | place | `NF-AGR-MKT` | variant | — | NAFDAC hygiene cert |
| VN-AGR-005 | `cassava-miller` | Cassava / Maize / Rice Miller | 3 | M10 | organization | `NF-AGR-PRC` | anchor | — | — |
| VN-AGR-010 | `cocoa-exporter` | Cocoa / Export Commodities Trader | 3 | M11 | organization | `NF-AGR-COM` | variant | — | CAC; export license (NXP) |
| VN-AGR-006 | `fish-market` | Fish Market / Fishmonger | 3 | M10 | place | `NF-AGR-MKT` | anchor | — | — |
| VN-AGR-012 | `food-processing` | Food Processing Factory | 3 | M11 | organization | `NF-AGR-PRC` | variant | — | NAFDAC license |
| VN-AGR-009 | `palm-oil-trader` | Palm Oil Producer / Trader | 3 | M11 | organization | `NF-AGR-COM` | anchor | palm-oil (pkg dir alias) | — |
| VN-AGR-004 | `poultry-farm` | Poultry Farm / Aquaculture | 3 | M10 | organization | `NF-AGR-PRD` | variant | — | — |
| VN-AGR-008 | `produce-aggregator` | Produce Storage / Market Aggregator | 3 | M10 | organization | `NF-AGR-PRC` | variant | — | — |
| VN-AGR-011 | `vegetable-garden` | Vegetable Garden / Horticulture | 3 | M11 | individual | `NF-AGR-PRD` | variant | — | — |
| VN-CIV-009 | `book-club` | Book Club / Reading Circle | 3 | M11 | organization | **standalone** | standalone | — | — |
| VN-CIV-012 | `market-association` | Market Leaders / Traders Association | 3 | M9 | organization | `NF-CIV-COM` | variant | — | — |
| VN-CIV-014 | `ministry-mission` | Ministry / Apostolic Mission / Outreach | 3 | M8d | organization | `NF-CIV-REL` | variant | — | IT registration gate |
| VN-CIV-004 | `mosque` | Mosque / Islamic Centre | 3 | M8d | organization | `NF-CIV-REL` | variant | — | IT registration gate |
| VN-CIV-010 | `orphanage` | Orphanage / Child Care NGO | 3 | M11 | organization | `NF-CIV-WEL` | variant | — | IT registration gate |
| VN-CIV-007 | `professional-association` | Professional Association (NBA/NMA/ICAN) | 3 | M9 | organization | **standalone** | standalone | — | — |
| VN-CIV-008 | `sports-club` | Sports Club / Amateur League | 3 | M10 | organization | **standalone** | standalone | — | — |
| VN-CIV-006 | `womens-association` | Women's Association / Forum | 3 | M8d | organization | `NF-CIV-COM` | variant | — | — |
| VN-CIV-005 | `youth-organization` | Youth Organization / Student Union | 3 | M8d | organization | `NF-CIV-COM` | variant | — | — |
| VN-EXT-001 | `artisanal-mining` | Artisanal Mining Operator | 3 | M11 | organization | `NF-EXT` | anchor | — | Mines license |
| VN-UTL-003 | `borehole-driller` | Borehole Drilling Company | 3 | M11 | organization | `NF-UTL` | variant | — | — |
| VN-CST-004 | `building-materials` | Building Materials Supplier | 3 | M10 | organization | `NF-CST-CON` | variant | — | — |
| VN-AUT-002 | `car-wash` | Car Wash / Detailing | 3 | M10 | organization | `NF-AUT-SVC` | variant | — | — |
| VN-CLN-004 | `cleaning-company` | Cleaning & Facility Management Company | 3 | M11 | organization | `NF-CLN` | variant | — | CAC required |
| VN-CST-006 | `electrical-fittings` | Electrical Fittings Dealer | 3 | M10 | organization | `NF-CST-HW` | anchor | — | — |
| VN-NRG-004 | `generator-dealer` | Generator Sales & Service Centre | 3 | M11 | organization | **standalone** | standalone | — | — |
| VN-BEA-003 | `hair-salon` | Hair Salon / Barbing Salon | 3 | M10 | individual | `NF-BEA` | variant | — | — |
| VN-ITC-002 | `internet-cafe` | Internet Café / Business Centre | 3 | M10 | organization | **standalone** | standalone | — | — |
| VN-CST-005 | `iron-steel` | Iron & Steel / Roofing Merchant | 3 | M10 | organization | `NF-CST-CON` | variant | — | — |
| VN-CLN-003 | `laundry-service` | Laundromat / Laundry Service | 3 | M10 | organization | `NF-CLN` | variant | — | — |
| VN-AUT-006 | `motorcycle-accessories` | Motorcycle Accessories Shop | 3 | M10 | organization | `NF-AUT-TRD` | variant | — | — |
| VN-EXT-002 | `oil-gas-services` | Oil & Gas Service Provider | 3 | M11 | organization | `NF-EXT` | variant | — | DPR license |
| VN-CST-008 | `paints-distributor` | Paints & Coatings Distributor | 3 | M11 | organization | `NF-CST-HW` | variant | — | — |
| VN-ELX-002 | `phone-repair-shop` | Phone Repair & Accessories Shop | 3 | M10 | individual | `NF-ELX` | variant | — | — |
| VN-CST-007 | `plumbing-supplies` | Plumbing Supplies Dealer | 3 | M11 | organization | `NF-CST-HW` | variant | — | — |
| VN-PRT-002 | `printing-press` | Printing Press / Design Studio | 3 | M10 | organization | `NF-PRT` | variant | — | — |
| VN-FSH-003 | `shoemaker` | Shoe Cobbler / Shoe Maker | 3 | M10 | individual | `NF-FSH` | variant | — | — |
| VN-AUT-005 | `spare-parts` | Spare Parts Dealer (Ladipo/Nnewi) | 3 | M10 | organization | `NF-AUT-TRD` | variant | — | — |
| VN-FSH-002 | `tailoring-fashion` | Tailor / Fashion Designer Atelier | 3 | M10 | individual | `NF-FSH` | variant | — | — |
| VN-AUT-003 | `tyre-shop` | Tyre Shop / Vulcanizer | 3 | M10 | organization | `NF-AUT-SVC` | variant | — | — |
| VN-AUT-004 | `used-car-dealer` | Used Car Dealer / Auto Trader | 3 | M10 | organization | `NF-AUT-TRD` | anchor | — | — |
| VN-UTL-002 | `water-vendor` | Water Tanker / Sachet Water Producer | 3 | M11 | organization | `NF-UTL` | variant | — | NAFDAC (sachet) |
| VN-CRE-008 | `motivational-speaker` | Motivational Speaker / Training Firm | 3 | M10 | individual | `NF-CRE-DIG` | variant | — | — |
| VN-CRE-007 | `podcast-studio` | Podcast Studio / Audio Platform | 3 | M10 | organization | `NF-CRE-DIG` | variant | — | — |
| VN-CRE-006 | `recording-label` | Record Label / Music Publisher | 3 | M10 | organization | `NF-CRE-MUS` | variant | — | CAC required |
| VN-CRE-005 | `talent-agency` | Talent Agency / Model Agency | 3 | M10 | organization | **standalone** | standalone | — | CAC required |
| VN-EDU-005 | `creche` | Crèche / Day Care Centre | 3 | M10 | organization | `NF-EDU-EAR` | anchor | — | State Ministry gate |
| VN-EDU-007 | `govt-school` | Government School Management | 3 | M11 | organization | `NF-EDU-SCH` | variant | — | State agency; no owner profile |
| VN-EDU-008 | `nursery-school` | Nursery / Crèche / Early Childhood Centre | 3 | M9 | organization | `NF-EDU-EAR` | variant | — | SUBEB compliance |
| VN-EDU-006 | `private-school` | Private School Operator | 3 | M9 | organization | `NF-EDU-SCH` | variant | — | State Ministry license |
| VN-EDU-004 | `tutoring` | Tutoring / Lesson Teacher | 3 | M9 | individual | **standalone** | standalone | — | — |
| VN-FIN-003 | `airtime-reseller` | Airtime / VTU Reseller | 3 | M9 | individual | **standalone** | standalone | — | — |
| VN-FIN-005 | `bureau-de-change` | Bureau de Change / FX Dealer | 3 | M10 | organization | **standalone** | standalone | slug 'bdc' corrected→'bureau-de-change' (0037a) | CBN BDC license |
| VN-FIN-006 | `hire-purchase` | Hire Purchase / Asset Finance | 3 | M11 | organization | **standalone** | standalone | — | KYC tier 3 |
| VN-FIN-004 | `mobile-money-agent` | Mobile Money / POS Agent | 3 | M9 | individual | **standalone** | standalone | slug 'mobile-money' corrected→'mobile-money-agent' (0037a) | CBN agent banking |
| VN-HLT-008 | `community-health` | Community Health Worker (CHW) Network | 3 | M11 | organization | **standalone** | standalone | — | — |
| VN-HLT-010 | `elderly-care` | Elderly Care Facility | 3 | M11 | organization | `NF-HLT-CAR` | variant | — | health_license FSM state required |
| VN-HLT-009 | `rehab-centre` | Rehabilitation / Recovery Centre | 3 | M11 | organization | `NF-HLT-CAR` | anchor | — | health_license FSM state required |
| VN-INS-001 | `government-agency` | Government Agency / Parastatal | 3 | M11 | organization | **standalone** | standalone | — | — |
| VN-MED-001 | `community-radio` | Community Radio / TV Station | 3 | M11 | organization | `NF-MED` | anchor | — | NBC license |
| VN-MED-002 | `newspaper-distribution` | Newspaper Distribution Agency | 3 | M11 | organization | `NF-MED` | variant | newspaper-dist (pkg dir alias) | — |
| VN-CIV-011 | `community-hall` | Community Hall / Town Hall | 3 | M11 | place | **standalone** | standalone | — | — |
| VN-EVT-004 | `events-centre` | Events Centre / Hall Rental | 3 | M10 | place | `NF-EVT` | variant | — | — |
| VN-POL-003 | `campaign-office` | Political Campaign Office | 3 | M8b | organization | `NF-POL-ORG` | variant | — | — |
| VN-POL-006 | `constituency-office` | Constituency Development Office | 3 | M8b | place | `NF-POL-ORG` | variant | — | — |
| VN-POL-004 | `lga-office` | Local Government Council / Ward Office | 3 | M8b | place | `NF-POL-ORG` | variant | — | — |
| VN-POL-005 | `polling-unit-rep` | Polling Unit Representative | 3 | M8b | individual | `NF-POL-IND` | variant | polling-unit (pkg alias) | — |
| VN-PRO-005 | `funeral-home` | Burial / Funeral Home | 3 | M11 | organization | **standalone** | standalone | — | — |
| VN-CST-009 | `land-surveyor` | Land Surveyor / Registry Agent | 3 | M10 | individual | **standalone** | standalone | — | SURCON license required |
| VN-PRO-008 | `pr-firm` | Public Relations Firm | 3 | M11 | organization | **standalone** | standalone | — | CAC required |
| VN-SVC-005 | `startup` | Startup / Early-Stage Company | 3 | M9 | organization | **standalone** | standalone | — | — |
| VN-PRO-004 | `tax-consultant` | Tax Consultant / Revenue Agent | 3 | M10 | individual | **standalone** | standalone | — | — |
| VN-EVT-003 | `wedding-planner` | Wedding Planner / Celebrant | 3 | M10 | individual | `NF-EVT` | variant | — | — |
| VN-TRP-008 | `airport-shuttle` | Airport Shuttle Service | 3 | M9 | organization | `NF-TRP-PAS` | variant | — | — |
| VN-TRP-013 | `cargo-truck` | Cargo Truck Owner / Fleet Operator | 3 | M9 | individual | `NF-TRP-FRT` | variant | — | — |
| VN-TRP-009 | `container-depot` | Container Depot / Logistics Hub | 3 | M10 | place | `NF-STO` | variant | — | — |
| VN-TRP-007 | `ferry` | Ferry / Water Transport Operator | 3 | M9 | organization | `NF-TRP-PAS` | variant | — | NIMASA license required |
| VN-TRP-006 | `okada-keke` | Okada / Keke Rider Co-op | 3 | M8c | organization | `NF-TRP-PAS` | variant | — | — |

  ---

  ## Section B — Niche Family Index (39 Families, 113 Members)

  Families share a package structure. Variants inherit the anchor's baseline feature set with niche-specific overrides.
  The **anchor** is the first-built member — not necessarily the largest or most important vertical.

  ### `NF-POL-IND` — Politics — Individual

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-POL-001 | `politician` | Individual Politician | 1 | M8b | — |
| variant | VN-POL-007 | `ward-rep` | Ward Representative | 2 | M8b | — |
| variant | VN-POL-005 | `polling-unit-rep` | Polling Unit Representative | 3 | M8b | — |

**3 members** (1 anchor + 2 variants)

### `NF-POL-ORG` — Politics — Organization

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-POL-002 | `political-party` | Political Party | 1 | M8b | — |
| variant | VN-POL-003 | `campaign-office` | Political Campaign Office | 3 | M8b | — |
| variant | VN-POL-004 | `lga-office` | Local Government Council / Ward Office | 3 | M8b | — |
| variant | VN-POL-006 | `constituency-office` | Constituency Development Office | 3 | M8b | — |

**4 members** (1 anchor + 3 variants)

### `NF-TRP-PAS` — Transport — Passenger

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-TRP-001 | `motor-park` | Motor Park / Bus Terminal | 1 | M8c | — |
| variant | VN-TRP-002 | `mass-transit` | City Bus / Mass Transit Operator | 1 | M8c | Route licensing deferred M6c |
| variant | VN-TRP-003 | `rideshare` | Carpooling / Ride-Hailing | 1 | M8c | — |
| variant | VN-TRP-006 | `okada-keke` | Okada / Keke Rider Co-op | 3 | M8c | — |
| variant | VN-TRP-007 | `ferry` | Ferry / Water Transport Operator | 3 | M9 | NIMASA license required |
| variant | VN-TRP-008 | `airport-shuttle` | Airport Shuttle Service | 3 | M9 | — |

**6 members** (1 anchor + 5 variants)

### `NF-TRP-FRT` — Transport — Freight

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-TRP-004 | `haulage` | Haulage / Logistics Operator | 1 | M8c | — |
| variant | VN-TRP-010 | `logistics-delivery` | Logistics & Delivery (Last-Mile) | 2 | M9 | — |
| variant | VN-TRP-011 | `dispatch-rider` | Dispatch Rider Network | 2 | M9 | — |
| variant | VN-TRP-012 | `courier` | Courier Service | 2 | M9 | — |
| variant | VN-TRP-013 | `cargo-truck` | Cargo Truck Owner / Fleet Operator | 3 | M9 | — |
| variant | VN-TRP-014 | `clearing-agent` | Clearing & Forwarding Agent | 2 | M10 | KYC tier 3 required |

**6 members** (1 anchor + 5 variants)

### `NF-CIV-REL` — Civic — Religious

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-CIV-001 | `church` | Church / Faith Community | 1 | M8d | IT registration gate |
| variant | VN-CIV-004 | `mosque` | Mosque / Islamic Centre | 3 | M8d | IT registration gate |
| variant | VN-CIV-014 | `ministry-mission` | Ministry / Apostolic Mission / Outreach | 3 | M8d | IT registration gate |

**3 members** (1 anchor + 2 variants)

### `NF-CIV-COM` — Civic — Community

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-CIV-003 | `cooperative` | Cooperative Society | 1 | M8d | — |
| variant | VN-CIV-005 | `youth-organization` | Youth Organization / Student Union | 3 | M8d | — |
| variant | VN-CIV-006 | `womens-association` | Women's Association / Forum | 3 | M8d | — |
| variant | VN-CIV-012 | `market-association` | Market Leaders / Traders Association | 3 | M9 | — |

**4 members** (1 anchor + 3 variants)

### `NF-CIV-WEL` — Civic — Welfare

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-CIV-002 | `ngo` | NGO / Non-Profit Organization | 1 | M8d | IT registration gate |
| variant | VN-CIV-010 | `orphanage` | Orphanage / Child Care NGO | 3 | M11 | IT registration gate |

**2 members** (1 anchor + 1 variant)

### `NF-FDS` — Food Service

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-FDS-001 | `restaurant` | Restaurant / Eatery / Buka | 2 | M9 | PILLAR 2 ANCHOR — build first in family |
| variant | VN-FDS-002 | `food-vendor` | Food Vendor / Street Food | 2 | M9 | — |
| variant | VN-FDS-003 | `catering` | Catering Service | 2 | M9 | — |
| variant | VN-FDS-004 | `bakery` | Bakery / Confectionery | 2 | M9 | — |
| variant | VN-FDS-005 | `restaurant-chain` | Restaurant / Food Chain Outlet | 2 | M9 | NAFDAC chain license; build after restaurant |

**5 members** (1 anchor + 4 variants)

### `NF-BEA` — Beauty & Personal Care

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-BEA-001 | `beauty-salon` | Beauty Salon / Barber Shop | 2 | M9 | — |
| variant | VN-BEA-002 | `spa` | Spa / Massage Parlour | 2 | M10 | — |
| variant | VN-BEA-003 | `hair-salon` | Hair Salon / Barbing Salon | 3 | M10 | — |

**3 members** (1 anchor + 2 variants)

### `NF-FSH` — Fashion & Apparel

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-FSH-001 | `tailor` | Tailoring / Fashion Designer | 2 | M9 | — |
| variant | VN-FSH-002 | `tailoring-fashion` | Tailor / Fashion Designer Atelier | 3 | M10 | — |
| variant | VN-FSH-003 | `shoemaker` | Shoe Cobbler / Shoe Maker | 3 | M10 | — |

**3 members** (1 anchor + 2 variants)

### `NF-CLN` — Cleaning Services

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-CLN-001 | `laundry` | Laundry / Dry Cleaner | 2 | M9 | — |
| variant | VN-CLN-002 | `cleaning-service` | Cleaning Service | 2 | M9 | — |
| variant | VN-CLN-003 | `laundry-service` | Laundromat / Laundry Service | 3 | M10 | — |
| variant | VN-CLN-004 | `cleaning-company` | Cleaning & Facility Management Company | 3 | M11 | CAC required |

**4 members** (1 anchor + 3 variants)

### `NF-AUT-SVC` — Auto Services

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-AUT-001 | `auto-mechanic` | Auto Mechanic / Garage | 2 | M9 | — |
| variant | VN-AUT-002 | `car-wash` | Car Wash / Detailing | 3 | M10 | — |
| variant | VN-AUT-003 | `tyre-shop` | Tyre Shop / Vulcanizer | 3 | M10 | — |

**3 members** (1 anchor + 2 variants)

### `NF-AUT-TRD` — Automotive Trade

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-AUT-004 | `used-car-dealer` | Used Car Dealer / Auto Trader | 3 | M10 | — |
| variant | VN-AUT-005 | `spare-parts` | Spare Parts Dealer (Ladipo/Nnewi) | 3 | M10 | — |
| variant | VN-AUT-006 | `motorcycle-accessories` | Motorcycle Accessories Shop | 3 | M10 | — |

**3 members** (1 anchor + 2 variants)

### `NF-NRG` — Energy Retail

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-NRG-001 | `fuel-station` | Fuel Station / Filling Station | 2 | M9 | DPR/NMDPRA license |
| variant | VN-NRG-002 | `gas-distributor` | Gas / LPG Distributor | 2 | M9 | DPR license |

**2 members** (1 anchor + 1 variant)

### `NF-PRT` — Print & Design

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-PRT-001 | `print-shop` | Printing & Branding Shop | 2 | M9 | — |
| variant | VN-PRT-002 | `printing-press` | Printing Press / Design Studio | 3 | M10 | — |

**2 members** (1 anchor + 1 variant)

### `NF-ELX` — Electronics Repair

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-ELX-001 | `electronics-repair` | Electronics Repair Shop | 2 | M9 | — |
| variant | VN-ELX-002 | `phone-repair-shop` | Phone Repair & Accessories Shop | 3 | M10 | — |

**2 members** (1 anchor + 1 variant)

### `NF-EVT` — Events & Venues

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-EVT-001 | `event-hall` | Event Hall / Venue | 2 | M9 | — |
| variant | VN-EVT-002 | `event-planner` | Event Planner / MC | 2 | M9 | — |
| variant | VN-EVT-003 | `wedding-planner` | Wedding Planner / Celebrant | 3 | M10 | — |
| variant | VN-EVT-004 | `events-centre` | Events Centre / Hall Rental | 3 | M10 | — |

**4 members** (1 anchor + 3 variants)

### `NF-CST-CON` — Construction & Materials

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-CST-001 | `construction` | Construction Firm / Contractor | 2 | M9 | CAC required; KYC tier 3 |
| variant | VN-CST-004 | `building-materials` | Building Materials Supplier | 3 | M10 | — |
| variant | VN-CST-005 | `iron-steel` | Iron & Steel / Roofing Merchant | 3 | M10 | — |

**3 members** (1 anchor + 2 variants)

### `NF-CST-RE` — Real Estate

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-CST-002 | `real-estate-agency` | Real Estate Agency | 2 | M9 | — |
| variant | VN-CST-003 | `property-developer` | Property Developer | 2 | M9 | CAC required; KYC tier 3 |

**2 members** (1 anchor + 1 variant)

### `NF-CST-HW` — Hardware & Supplies

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-CST-006 | `electrical-fittings` | Electrical Fittings Dealer | 3 | M10 | — |
| variant | VN-CST-007 | `plumbing-supplies` | Plumbing Supplies Dealer | 3 | M11 | — |
| variant | VN-CST-008 | `paints-distributor` | Paints & Coatings Distributor | 3 | M11 | — |

**3 members** (1 anchor + 2 variants)

### `NF-PHA` — Pharmacy

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-HLT-002 | `pharmacy` | Pharmacy / Drug Store | 2 | M9 | NAFDAC + PCN |
| variant | VN-HLT-011 | `pharmacy-chain` | Pharmacy Chain / Drugstore | 2 | M9 | PCN chain license |

**2 members** (1 anchor + 1 variant)

### `NF-HLT-FIT` — Health Fitness

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-HLT-003 | `sports-academy` | Sports Academy / Fitness Centre | 2 | M10 | — |
| variant | VN-HLT-004 | `gym` | Gym / Wellness Centre | 2 | M10 | — |

**2 members** (1 anchor + 1 variant)

### `NF-HLT-SPE` — Health Specialist

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-HLT-005 | `optician` | Optician / Eye Clinic | 2 | M10 | MDCN; 0037a corrected slug |
| variant | VN-HLT-006 | `dental-clinic` | Dental Clinic / Orthodontist | 2 | M10 | MDCN |
| variant | VN-HLT-007 | `vet-clinic` | Veterinary Clinic / Pet Shop | 2 | M10 | MDCN |

**3 members** (1 anchor + 2 variants)

### `NF-HLT-CAR` — Long-term Health Care

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-HLT-009 | `rehab-centre` | Rehabilitation / Recovery Centre | 3 | M11 | health_license FSM state required |
| variant | VN-HLT-010 | `elderly-care` | Elderly Care Facility | 3 | M11 | health_license FSM state required |

**2 members** (1 anchor + 1 variant)

### `NF-EDU-SCH` — School Education

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-EDU-001 | `school` | School / Educational Institution | 1 | M8e | P1 anchor |
| variant | VN-EDU-006 | `private-school` | Private School Operator | 3 | M9 | State Ministry license |
| variant | VN-EDU-007 | `govt-school` | Government School Management | 3 | M11 | State agency; no owner profile |

**3 members** (1 anchor + 2 variants)

### `NF-EDU-EAR` — Early Childhood

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-EDU-005 | `creche` | Crèche / Day Care Centre | 3 | M10 | State Ministry gate |
| variant | VN-EDU-008 | `nursery-school` | Nursery / Crèche / Early Childhood Centre | 3 | M9 | SUBEB compliance |

**2 members** (1 anchor + 1 variant)

### `NF-AGR-PRD` — Agricultural Production

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-AGR-001 | `farm` | Farm / Agricultural Producer | 2 | M10 | — |
| variant | VN-AGR-004 | `poultry-farm` | Poultry Farm / Aquaculture | 3 | M10 | — |
| variant | VN-AGR-011 | `vegetable-garden` | Vegetable Garden / Horticulture | 3 | M11 | — |

**3 members** (1 anchor + 2 variants)

### `NF-AGR-PRC` — Agricultural Processing

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-AGR-005 | `cassava-miller` | Cassava / Maize / Rice Miller | 3 | M10 | — |
| variant | VN-AGR-008 | `produce-aggregator` | Produce Storage / Market Aggregator | 3 | M10 | — |
| variant | VN-AGR-012 | `food-processing` | Food Processing Factory | 3 | M11 | NAFDAC license |

**3 members** (1 anchor + 2 variants)

### `NF-AGR-COM` — Agricultural Commodities

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-AGR-009 | `palm-oil-trader` | Palm Oil Producer / Trader | 3 | M11 | — |
| variant | VN-AGR-010 | `cocoa-exporter` | Cocoa / Export Commodities Trader | 3 | M11 | CAC; export license (NXP) |

**2 members** (1 anchor + 1 variant)

### `NF-AGR-MKT` — Food Markets

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-AGR-006 | `fish-market` | Fish Market / Fishmonger | 3 | M10 | — |
| variant | VN-AGR-007 | `abattoir` | Abattoir / Meat Processing | 3 | M10 | NAFDAC hygiene cert |

**2 members** (1 anchor + 1 variant)

### `NF-PRO-LIC` — Licensed Professionals

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-PRO-001 | `professional` | Professional (Lawyer/Doctor/Accountant) | 1 | M8e | P1 anchor; multi-license gate |
| variant | VN-PRO-006 | `law-firm` | Law Firm / Legal Practice | 2 | M9 | NBA verification |
| variant | VN-PRO-007 | `accounting-firm` | Accounting Firm / Audit Practice | 2 | M9 | ICAN verification |

**3 members** (1 anchor + 2 variants)

### `NF-PRO-TRD` — Trades & Technical

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-PRO-002 | `handyman` | Plumber / Electrician / Handyman | 2 | M9 | — |
| variant | VN-PRO-003 | `generator-repair` | Generator Repair / HVAC Technician | 2 | M10 | — |

**2 members** (1 anchor + 1 variant)

### `NF-CRE-DIG` — Digital Creator

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-CRE-001 | `creator` | Creator / Influencer | 1 | M8e | P1 anchor |
| variant | VN-CRE-002 | `photography` | Photography / Videography Studio | 2 | M9 | — |
| variant | VN-CRE-007 | `podcast-studio` | Podcast Studio / Audio Platform | 3 | M10 | — |
| variant | VN-CRE-008 | `motivational-speaker` | Motivational Speaker / Training Firm | 3 | M10 | — |

**4 members** (1 anchor + 3 variants)

### `NF-CRE-MUS` — Music Industry

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-CRE-003 | `music-studio` | Music Studio / Recording Artist | 2 | M9 | — |
| variant | VN-CRE-006 | `recording-label` | Record Label / Music Publisher | 3 | M10 | CAC required |

**2 members** (1 anchor + 1 variant)

### `NF-MFG` — Manufacturing

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-MFG-001 | `furniture-maker` | Furniture Maker / Wood Workshop | 2 | M10 | — |
| variant | VN-MFG-002 | `welding-fabrication` | Welding / Fabrication Shop | 2 | M10 | — |

**2 members** (1 anchor + 1 variant)

### `NF-UTL` — Water & Utilities

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-UTL-001 | `water-treatment` | Water Treatment / Borehole Operator | 2 | M10 | — |
| variant | VN-UTL-002 | `water-vendor` | Water Tanker / Sachet Water Producer | 3 | M11 | NAFDAC (sachet) |
| variant | VN-UTL-003 | `borehole-driller` | Borehole Drilling Company | 3 | M11 | — |

**3 members** (1 anchor + 2 variants)

### `NF-STO` — Storage Infrastructure

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-PLC-004 | `warehouse` | Warehouse Operator | 2 | M10 | — |
| variant | VN-TRP-009 | `container-depot` | Container Depot / Logistics Hub | 3 | M10 | — |

**2 members** (1 anchor + 1 variant)

### `NF-EXT` — Extractives

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-EXT-001 | `artisanal-mining` | Artisanal Mining Operator | 3 | M11 | Mines license |
| variant | VN-EXT-002 | `oil-gas-services` | Oil & Gas Service Provider | 3 | M11 | DPR license |

**2 members** (1 anchor + 1 variant)

### `NF-MED` — Media & Broadcast

| Role | VN-ID | Slug | Name | P | Milestone | Blockers |
|---|---|---|---|---|---|---|
| **anchor** | VN-MED-001 | `community-radio` | Community Radio / TV Station | 3 | M11 | NBC license |
| variant | VN-MED-002 | `newspaper-distribution` | Newspaper Distribution Agency | 3 | M11 | — |

**2 members** (1 anchor + 1 variant)

---

  ## Section C — Standalone Niche Index (44 Verticals)

  These verticals are self-contained niches with no family membership. Each has its own package.
  "Standalone" is not a gap or placeholder — it means the niche has no natural variant siblings.

  | VN-ID | Slug | Name | P | Milestone | Entity | Alias / Deprecated | Blockers / Notes |
  |---|---|---|---|---|---|---|---|
  | VN-HLT-001 | `clinic` | Clinic / Healthcare Facility | 1 | M8e | organization | — | MDCN license; P1 anchor |
| VN-PLC-001 | `market` | Market / Trading Hub | 1 | M8e | place | — | P1 anchor |
| VN-SVC-001 | `pos-business` | POS Business Management System | 1 | M8b | organization | — | — |
| VN-SVC-002 | `sole-trader` | Sole Trader / Artisan | 1 | M8e | individual | — | — |
| VN-PLC-002 | `tech-hub` | Tech Hub / Innovation Centre | 1 | M8e | place | — | P1 anchor |
| VN-SVC-004 | `advertising-agency` | Advertising Agency | 2 | M10 | organization | — | — |
| VN-AGR-002 | `agro-input` | Agro-Input Dealer | 2 | M10 | organization | — | — |
| VN-FIN-007 | `bank-branch` | Bank Branch / ATM Location | 2 | M9 | organization | — | Added to CSV 2026-04-25; CBN parent institution link |
| VN-RET-002 | `bookshop` | Bookshop / Stationery Store | 2 | M10 | organization | — | — |
| VN-AGR-003 | `cold-room` | Cold Room / Storage Facility | 2 | M10 | place | — | — |
| VN-EDU-003 | `driving-school` | Driving School | 2 | M9 | organization | — | FRSC license |
| VN-CRE-004 | `fashion-brand` | Fashion Brand / Clothing Label | 2 | M9 | organization | — | — |
| VN-RET-003 | `florist` | Florist / Garden Centre | 2 | M10 | organization | — | — |
| VN-ACM-001 | `hotel` | Hotel / Guesthouse / Shortlet | 2 | M9 | organization | — | — |
| VN-FIN-002 | `insurance-agent` | Insurance Agent / Broker | 2 | M10 | individual | — | NAICOM license |
| VN-ITC-001 | `it-support` | IT Support / Computer Repair | 2 | M9 | individual | — | 0037a: primary_pillars corrected |
| VN-TRP-005 | `road-transport-union` | Road Transport Workers Union (NURTW) | 2 | M8c | organization | ← nurtw (deprecated, canonical replacement) | Priority upgraded P3→P2 (OD-3) |
| VN-FIN-001 | `savings-group` | Thrift / Ajo / Esusu Group | 2 | M9 | organization | — | — |
| VN-SEC-001 | `security-company` | Security Company / Guard Service | 2 | M9 | organization | — | — |
| VN-NRG-003 | `solar-installer` | Solar / Renewable Energy Installer | 2 | M10 | organization | — | — |
| VN-RET-001 | `supermarket` | Supermarket / Grocery Store | 2 | M9 | organization | — | — |
| VN-EDU-002 | `training-institute` | Training Institute / Vocational School | 2 | M9 | organization | slug 'vocational' corrected→'training-institute' (0037a) | — |
| VN-SVC-003 | `travel-agent` | Travel Agent / Tour Operator | 2 | M10 | organization | — | — |
| VN-CIV-013 | `waste-management` | Waste Management / Recycler | 2 | M10 | organization | — | — |
| VN-PLC-003 | `wholesale-market` | Wholesale Market (Onitsha/Alaba/Ladipo) | 2 | M9 | place | — | — |
| VN-FIN-003 | `airtime-reseller` | Airtime / VTU Reseller | 3 | M9 | individual | — | — |
| VN-CIV-009 | `book-club` | Book Club / Reading Circle | 3 | M11 | organization | — | — |
| VN-FIN-005 | `bureau-de-change` | Bureau de Change / FX Dealer | 3 | M10 | organization | slug 'bdc' corrected→'bureau-de-change' (0037a) | CBN BDC license |
| VN-CIV-011 | `community-hall` | Community Hall / Town Hall | 3 | M11 | place | — | — |
| VN-HLT-008 | `community-health` | Community Health Worker (CHW) Network | 3 | M11 | organization | — | — |
| VN-PRO-005 | `funeral-home` | Burial / Funeral Home | 3 | M11 | organization | — | — |
| VN-NRG-004 | `generator-dealer` | Generator Sales & Service Centre | 3 | M11 | organization | — | — |
| VN-INS-001 | `government-agency` | Government Agency / Parastatal | 3 | M11 | organization | — | — |
| VN-FIN-006 | `hire-purchase` | Hire Purchase / Asset Finance | 3 | M11 | organization | — | KYC tier 3 |
| VN-ITC-002 | `internet-cafe` | Internet Café / Business Centre | 3 | M10 | organization | — | — |
| VN-CST-009 | `land-surveyor` | Land Surveyor / Registry Agent | 3 | M10 | individual | — | SURCON license required |
| VN-FIN-004 | `mobile-money-agent` | Mobile Money / POS Agent | 3 | M9 | individual | slug 'mobile-money' corrected→'mobile-money-agent' (0037a) | CBN agent banking |
| VN-PRO-008 | `pr-firm` | Public Relations Firm | 3 | M11 | organization | — | CAC required |
| VN-CIV-007 | `professional-association` | Professional Association (NBA/NMA/ICAN) | 3 | M9 | organization | — | — |
| VN-CIV-008 | `sports-club` | Sports Club / Amateur League | 3 | M10 | organization | — | — |
| VN-SVC-005 | `startup` | Startup / Early-Stage Company | 3 | M9 | organization | — | — |
| VN-CRE-005 | `talent-agency` | Talent Agency / Model Agency | 3 | M10 | organization | — | CAC required |
| VN-PRO-004 | `tax-consultant` | Tax Consultant / Revenue Agent | 3 | M10 | individual | — | — |
| VN-EDU-004 | `tutoring` | Tutoring / Lesson Teacher | 3 | M9 | individual | — | — |

  ---

  ## Section D — Deprecated Verticals Exception Section (3 Entries)

  These entries exist in the CSV with `status = deprecated`. They are **not active niches**.
  Do not reference deprecated slugs in new code, seeds, migrations, or governance docs.
  All traffic must route to the canonical replacement via the synonym record.

  | VN-ID | Deprecated Slug | Canonical Replacement | Canonical VN-ID | Synonym Record | P (was) | Milestone | Deprecation Reason |
  |---|---|---|---|---|---|---|---|
  | VN-DEP-001 | `gym-fitness` | `gym` | VN-HLT-004 | `vsyn_gym_fitness_gym` | 3 | M10 | Duplicate of gym — same physical fitness centre entity. gym is P2/health; gym-fitness was P3/health. |
| VN-DEP-002 | `petrol-station` | `fuel-station` | VN-NRG-001 | `vsyn_petrol_station_fuel_station` | 3 | M11 | Duplicate of fuel-station — petrol-station colloquial; fuel-station is DPR/NMDPRA regulatory term. |
| VN-DEP-003 | `nurtw` | `road-transport-union` | VN-TRP-005 | `vsyn_nurtw_road_transport_union` | 2 | M8c | Duplicate of road-transport-union — nurtw was colloquial; road-transport-union inherited P2 priority via OD-3. |

  **Rules:**
  1. No new code may accept or emit a deprecated slug.
  2. The `vertical_synonyms` table handles discovery-layer routing from deprecated → canonical.
  3. Package directories for deprecated slugs were corrected in migration `0037a`.
  4. Deprecated slugs are excluded from the 157 active count. Total CSV rows = 157 active + 3 deprecated = 160.

  ---

  ## Section E — Downstream Update Manifest

  All files and systems that must stay in sync with this master map.
  **✅ = already updated to this mapping. ⬜ = pending.**

  ### Governance Documents (on `staging` at commit `8a559505`)

  | Status | File | Purpose |
  |---|---|---|
  | ✅ | `docs/governance/niche-master-table.md` | All 160 rows with VN-IDs, family/role columns |
  | ✅ | `docs/governance/canonical-niche-registry.md` | 157 active niches, discovery tags, regulatory gates |
  | ✅ | `docs/governance/niche-alias-deprecation-registry.md` | 3 deprecated + 5 pkg aliases + 5 migration-0037a corrections |
  | ✅ | `docs/governance/niche-family-variant-register.md` | 39 family definitions, differentiators, implementation order |
  | ✅ | `docs/governance/niche-downstream-update-list.md` | Downstream integration points and push checklist |
  | ✅ | `docs/governance/verticals-master-plan.md` | P2 corrected 62→63, P3 corrected 78→77 |
  | ✅ | `docs/reports/vertical-taxonomy-reconciliation-closure-addendum-2026-04-25.md` | Counts corrected + road-transport-union P3→P2 note |
  | ✅ | `docs/governance/vertical-niche-master-map.md` | **This document** |

  ### Seed Data

  | Status | File | Notes |
  |---|---|---|
  | ✅ | `infra/db/seeds/0004_verticals-master.csv` | Canonical source — locked at commit `68eae9a3`. DO NOT EDIT after taxonomy closure. |
  | ⬜ | `infra/db/seeds/0005_niche_identifiers.csv` | To generate: slug → VN-ID mapping from Section A |
  | ⬜ | `infra/db/seeds/0006_niche_families.csv` | To generate: NF-code → anchor, members, name from Section B |

  ### Code Package Directories (5 aliases corrected in migration `0037a`)

  | Status | Canonical Package Path | Old (incorrect) Alias |
  |---|---|---|
  | ✅ | `packages/verticals-photography/` | ~~photography-studio~~ |
  | ✅ | `packages/verticals-mass-transit/` | ~~transit~~ |
  | ✅ | `packages/verticals-newspaper-distribution/` | ~~newspaper-dist~~ |
  | ✅ | `packages/verticals-palm-oil-trader/` | ~~palm-oil~~ |
  | ✅ | `packages/verticals-polling-unit-rep/` | ~~polling-unit~~ |
  | ⬜ | All 157 active package directories | Verify each uses canonical slug from Section A |

  ### Runtime Application Tables

  | Status | Table | Action Required |
  |---|---|---|
  | ✅ | `verticals` | CSV seeded at commit `68eae9a3`; 160 rows (157 active + 3 deprecated) |
  | ⬜ | `vertical_niches` | Populate VN-ID column from Section A of this document |
  | ⬜ | `niche_families` | Insert 39 rows from Section B (NF-code, name, anchor slug) |
  | ✅ | `vertical_synonyms` | 3 deprecated synonym records seeded (`vsyn_*` IDs) |
  | ⬜ | `vertical_package_aliases` | 5 pkg alias records from niche-alias-deprecation-registry.md |
  | ⬜ | `vertical_discovery_tags` | Populate from canonical-niche-registry.md per-niche tags |

  ### AI / Recommendation Configuration

  | Status | File | Action |
  |---|---|---|
  | ✅ | `apps/ai-config/primary_pillars.json` | `it-support` primary_pillars corrected (0037a) |
  | ✅ | `apps/ai-config/vertical_aliases.json` | 5 aliases corrected (0037a) |
  | ⬜ | `apps/ai-config/niche_families.json` | Create from Section B — NF-code → anchor + variants |
  | ⬜ | `apps/ai-config/niche_weights.json` | Anchor = 1.0, variant = 0.85, standalone = 1.0 discovery weights |

  ---

  ## Section F — System-Wide Disambiguation Rules

  These rules must be applied by every agent, module, and downstream consumer.

  **Rule 1 — "Niche" and "vertical" are the same entity.**
  Every vertical IS a niche. "Niche" describes the identity dimension (discovery, tagging, AI recommendation). "Vertical" describes the implementation dimension (CSV row, package, FSM). There is no separate niche table with different entries.

  **Rule 2 — "Standalone" means deliberately family-free.**
  A standalone niche has its own self-contained package. It is not unclassified or ungrouped — it has no natural variant siblings that would share a package baseline.

  **Rule 3 — "Family" means shared package baseline.**
  A niche family shares one package codebase. The anchor's feature set is the baseline. Each variant adds or overrides only what differs for that niche. Variants are built after the anchor is stable.

  **Rule 4 — Anchor ≠ "most important."**
  The anchor is the first-built member of a family, chosen for its simplicity and Nigeria-fit. Other family members may have higher priority tiers. Build order: anchor first, then variants by priority.

  **Rule 5 — Deprecated slugs do not count as active.**
  The 157 active count excludes all 3 deprecated entries. Any system reporting 158 or more active verticals is reading stale data. Valid counts: 157 active + 3 deprecated = 160 total CSV rows.

  **Rule 6 — The old 46-item registry is fully superseded.**
  The pre-taxonomy-closure 46-item niche registry must not be referenced. The 157-item list in this document and in `canonical-niche-registry.md` is the only valid registry.

  **Rule 7 — Package alias ≠ deprecated vertical.**
  A package alias (e.g. `transit` → `mass-transit`) is a code-path correction: the CSV slug was always canonical; only the package directory name was wrong. A deprecated vertical is a full entity retirement: the CSV row is retired and a canonical replacement vertical inherits all new work.

  **Rule 8 — VN-IDs are stable and must not be reassigned.**
  Once a VN-ID is assigned to a slug, it is permanent. If a vertical is deprecated, its VN-DEP-NNN ID is permanent. If a new active vertical is added, it receives the next available VN-[CATEGORY]-NNN. IDs are never recycled.

  **Rule 9 — P2=63, P3=77 are the only valid pillar counts.**
  Any document showing P2=62 or P3=78 has a stale count. The root cause was road-transport-union being promoted from P3 to P2 (OD-3), which was not reflected in some governance documents. All documents have been corrected as of commit `8a559505`.

  **Rule 10 — This document is authoritative. Conflicts resolve in its favour.**
  If any other document, registry, or config conflicts with the slug, VN-ID, family, role, or count shown in this document, this document wins. File a correction in the governance update log and update the conflicting source.

  ---

  *End of Canonical Vertical-to-Niche Master Map*
  *CSV base locked at commit `68eae9a3`. Governance docs at commit `8a559505`. This map produced 2026-04-25.*
  