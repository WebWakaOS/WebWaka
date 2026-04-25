# Canonical Vertical Master Register

**Date:** 2026-04-25
**Status:** Authoritative
**Version:** 1.0 — Post-Reconciliation
**Authority:** Produced as output of the STOP-AND-RECONCILE vertical taxonomy audit
**Companion:** `docs/reports/vertical-taxonomy-reconciliation-report-2026-04-25.md`

This is the single authoritative reference document for the WebWaka OS vertical universe. It derives entirely from `infra/db/seeds/0004_verticals-master.csv` and documents known package alias divergences and open merge decisions.

---

## Register Metadata

| Attribute | Value |
|---|---|
| Total canonical verticals (active) | **159** |
| Source | `infra/db/seeds/0004_verticals-master.csv` |
| All current status | `planned` |
| Priority 1 (P1-Original) | 17 |
| Priority 2 (Top100 High-Fit) | 62 |
| Priority 3 (Top100 Medium-Fit) | 80 |
| Categories | 14 |
| Open merge decisions | 3 (gym+gym-fitness, petrol-station+fuel-station, road-transport-union+nurtw) |
| Post-CSV vertical in DB | 1 (`bank-branch` — needs CSV addition) |
| Package alias mismatches | 5 (marked with `⚠️ pkg alias` below) |

---

## Column Key

| Column | Meaning |
|---|---|
| Slug | Canonical runtime slug — the authoritative identifier |
| Display Name | Human-readable name |
| Category | One of 14 standard categories |
| P | Priority: 1=P1-Original, 2=Top100 High-Fit, 3=Top100 Medium |
| Type | Entity type: I=Individual, O=Organization, Pl=Place, Of=Offering |
| Flags | Alias or merge notes |

**Flags:**
- `⚠️ pkg alias` — Package directory name diverges from CSV slug; alias documented in synonym map
- `🔀 MERGE` — Open merge decision: this slug is flagged as MERGE_REQUIRED with another entry
- `🔀 into` — This slug is the canonical destination of a pending merge
- `📌 P1` — Priority 1 original vertical

---

## Politics (7 canonical verticals)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `politician` | Individual Politician | politics | 1 | I | 📌 P1 |
| `political-party` | Political Party | politics | 1 | O | 📌 P1 |
| `ward-rep` | Ward Representative | politics | 2 | I | |
| `campaign-office` | Political Campaign Office | politics | 3 | O | |
| `lga-office` | Local Government Council / Ward Office | politics | 3 | Pl | |
| `constituency-office` | Constituency Development Office | politics | 3 | Pl | |
| `polling-unit-rep` | Polling Unit Representative | politics | 3 | I | ⚠️ pkg alias (`verticals-polling-unit`) |

---

## Transport (15 canonical verticals)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `motor-park` | Motor Park / Bus Terminal | transport | 1 | Pl | 📌 P1 |
| `mass-transit` | City Bus / Mass Transit Operator | transport | 1 | O | 📌 P1 · ⚠️ pkg alias (`verticals-transit`) |
| `rideshare` | Carpooling / Ride-Hailing | transport | 1 | O | 📌 P1 |
| `haulage` | Haulage / Logistics Operator | transport | 1 | O | 📌 P1 |
| `logistics-delivery` | Logistics & Delivery (Last-Mile) | transport | 2 | O | |
| `dispatch-rider` | Dispatch Rider Network | transport | 2 | O | |
| `courier` | Courier Service | transport | 2 | O | |
| `clearing-agent` | Clearing & Forwarding Agent | transport | 2 | O | |
| `road-transport-union` | Road Transport Workers Union (NURTW) | transport | 3 | O | 🔀 into (canonical; `nurtw` merges here) |
| `nurtw` | NURTW (Road Transport Workers Union) | transport | 2 | O | 🔀 MERGE → `road-transport-union` |
| `okada-keke` | Okada / Keke Rider Co-op | transport | 3 | O | |
| `ferry` | Ferry / Water Transport Operator | transport | 3 | O | |
| `airport-shuttle` | Airport Shuttle Service | transport | 3 | O | |
| `container-depot` | Container Depot / Logistics Hub | transport | 3 | Pl | |
| `cargo-truck` | Cargo Truck Owner / Fleet Operator | transport | 3 | I | |

---

## Civic (13 canonical verticals)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `church` | Church / Faith Community | civic | 1 | O | 📌 P1 |
| `ngo` | NGO / Non-Profit Organization | civic | 1 | O | 📌 P1 |
| `cooperative` | Cooperative Society | civic | 1 | O | 📌 P1 |
| `waste-management` | Waste Management / Recycler | civic | 2 | O | |
| `mosque` | Mosque / Islamic Centre | civic | 3 | O | |
| `youth-organization` | Youth Organization / Student Union | civic | 3 | O | |
| `womens-association` | Women's Association / Forum | civic | 3 | O | |
| `professional-association` | Professional Association (NBA/NMA/ICAN) | civic | 3 | O | |
| `sports-club` | Sports Club / Amateur League | civic | 3 | O | |
| `book-club` | Book Club / Reading Circle | civic | 3 | O | |
| `orphanage` | Orphanage / Child Care NGO | civic | 3 | O | |
| `market-association` | Market Leaders / Traders Association | civic | 3 | O | |
| `ministry-mission` | Ministry / Apostolic Mission / Outreach | civic | 3 | O | |

---

## Commerce (54 canonical verticals)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `pos-business` | POS Business Management System | commerce | 1 | O | 📌 P1 |
| `sole-trader` | Sole Trader / Artisan | commerce | 1 | I | 📌 P1 |
| `restaurant` | Restaurant / Eatery / Buka | commerce | 2 | O | |
| `hotel` | Hotel / Guesthouse / Shortlet | commerce | 2 | O | |
| `supermarket` | Supermarket / Grocery Store | commerce | 2 | O | |
| `beauty-salon` | Beauty Salon / Barber Shop | commerce | 2 | O | |
| `laundry` | Laundry / Dry Cleaner | commerce | 2 | O | |
| `auto-mechanic` | Auto Mechanic / Garage | commerce | 2 | O | |
| `fuel-station` | Fuel Station / Filling Station | commerce | 2 | Pl | 🔀 into (canonical; `petrol-station` merges here) |
| `tailor` | Tailoring / Fashion Designer | commerce | 2 | I | |
| `security-company` | Security Company / Guard Service | commerce | 2 | O | |
| `construction` | Construction Firm / Contractor | commerce | 2 | O | |
| `real-estate-agency` | Real Estate Agency | commerce | 2 | O | |
| `property-developer` | Property Developer | commerce | 2 | O | |
| `cleaning-service` | Cleaning Service | commerce | 2 | O | |
| `print-shop` | Printing & Branding Shop | commerce | 2 | O | |
| `electronics-repair` | Electronics Repair Shop | commerce | 2 | O | |
| `food-vendor` | Food Vendor / Street Food | commerce | 2 | I | |
| `catering` | Catering Service | commerce | 2 | O | |
| `bakery` | Bakery / Confectionery | commerce | 2 | O | |
| `furniture-maker` | Furniture Maker / Wood Workshop | commerce | 2 | O | |
| `welding-fabrication` | Welding / Fabrication Shop | commerce | 2 | I | |
| `travel-agent` | Travel Agent / Tour Operator | commerce | 2 | O | |
| `spa` | Spa / Massage Parlour | commerce | 2 | O | |
| `florist` | Florist / Garden Centre | commerce | 2 | O | |
| `gas-distributor` | Gas / LPG Distributor | commerce | 2 | O | |
| `solar-installer` | Solar / Renewable Energy Installer | commerce | 2 | O | |
| `restaurant-chain` | Restaurant / Food Chain Outlet | commerce | 2 | O | |
| `bookshop` | Bookshop / Stationery Store | commerce | 2 | O | |
| `used-car-dealer` | Used Car Dealer / Auto Trader | commerce | 3 | O | |
| `spare-parts` | Spare Parts Dealer (Ladipo/Nnewi) | commerce | 3 | O | |
| `tyre-shop` | Tyre Shop / Vulcanizer | commerce | 3 | O | |
| `car-wash` | Car Wash / Detailing | commerce | 3 | O | |
| `building-materials` | Building Materials Supplier | commerce | 3 | O | |
| `iron-steel` | Iron & Steel / Roofing Merchant | commerce | 3 | O | |
| `electrical-fittings` | Electrical Fittings Dealer | commerce | 3 | O | |
| `artisanal-mining` | Artisanal Mining Operator | commerce | 3 | O | |
| `oil-gas-services` | Oil & Gas Service Provider | commerce | 3 | O | |
| `borehole-driller` | Borehole Drilling Company | commerce | 3 | O | |
| `paints-distributor` | Paints & Coatings Distributor | commerce | 3 | O | |
| `shoemaker` | Shoe Cobbler / Shoe Maker | commerce | 3 | I | |
| `motorcycle-accessories` | Motorcycle Accessories Shop | commerce | 3 | O | |
| `internet-cafe` | Internet Café / Business Centre | commerce | 3 | O | |
| `plumbing-supplies` | Plumbing Supplies Dealer | commerce | 3 | O | |
| `laundry-service` | Laundromat / Laundry Service | commerce | 3 | O | |
| `gym-fitness` | Gym / Fitness Centre | commerce | 3 | O | 🔀 MERGE → `gym` |
| `hair-salon` | Hair Salon / Barbing Salon | commerce | 3 | I | |
| `printing-press` | Printing Press / Design Studio | commerce | 3 | O | |
| `cleaning-company` | Cleaning & Facility Management Company | commerce | 3 | O | |
| `petrol-station` | Petrol Station / Filling Station | commerce | 3 | Pl | 🔀 MERGE → `fuel-station` |
| `generator-dealer` | Generator Sales & Service Centre | commerce | 3 | O | |
| `water-vendor` | Water Tanker / Sachet Water Producer | commerce | 3 | O | |
| `tailoring-fashion` | Tailor / Fashion Designer Atelier | commerce | 3 | I | |
| `phone-repair-shop` | Phone Repair & Accessories Shop | commerce | 3 | I | |

---

## Health (11 canonical verticals)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `clinic` | Clinic / Healthcare Facility | health | 1 | O | 📌 P1 |
| `pharmacy` | Pharmacy / Drug Store | health | 2 | O | |
| `sports-academy` | Sports Academy / Fitness Centre | health | 2 | O | |
| `gym` | Gym / Wellness Centre | health | 2 | O | 🔀 into (canonical; `gym-fitness` merges here) |
| `optician` | Optician / Eye Clinic | health | 2 | O | |
| `dental-clinic` | Dental Clinic / Orthodontist | health | 2 | O | |
| `vet-clinic` | Veterinary Clinic / Pet Shop | health | 2 | O | |
| `pharmacy-chain` | Pharmacy Chain / Drugstore | health | 2 | O | |
| `community-health` | Community Health Worker (CHW) Network | health | 3 | O | |
| `rehab-centre` | Rehabilitation / Recovery Centre | health | 3 | O | |
| `elderly-care` | Elderly Care Facility | health | 3 | O | |

---

## Education (8 canonical verticals)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `school` | School / Educational Institution | education | 1 | O | 📌 P1 |
| `training-institute` | Training Institute / Vocational School | education | 2 | O | |
| `driving-school` | Driving School | education | 2 | O | |
| `private-school` | Private School Operator | education | 3 | O | |
| `tutoring` | Tutoring / Lesson Teacher | education | 3 | I | |
| `creche` | Crèche / Day Care Centre | education | 3 | O | |
| `nursery-school` | Nursery / Crèche / Early Childhood Centre | education | 3 | O | |
| `govt-school` | Government School Management | education | 3 | O | |

---

## Agricultural (12 canonical verticals)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `farm` | Farm / Agricultural Producer | agricultural | 2 | O | |
| `agro-input` | Agro-Input Dealer | agricultural | 2 | O | |
| `cold-room` | Cold Room / Storage Facility | agricultural | 2 | Pl | |
| `poultry-farm` | Poultry Farm / Aquaculture | agricultural | 3 | O | |
| `cassava-miller` | Cassava / Maize / Rice Miller | agricultural | 3 | O | |
| `fish-market` | Fish Market / Fishmonger | agricultural | 3 | Pl | |
| `abattoir` | Abattoir / Meat Processing | agricultural | 3 | Pl | |
| `produce-aggregator` | Produce Storage / Market Aggregator | agricultural | 3 | O | |
| `vegetable-garden` | Vegetable Garden / Horticulture | agricultural | 3 | I | |
| `palm-oil-trader` | Palm Oil Producer / Trader | agricultural | 3 | O | ⚠️ pkg alias (`verticals-palm-oil`) |
| `cocoa-exporter` | Cocoa / Export Commodities Trader | agricultural | 3 | O | |
| `food-processing` | Food Processing Factory | agricultural | 3 | O | |

---

## Professional (13 canonical verticals)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `professional` | Professional (Lawyer/Doctor/Accountant) | professional | 1 | I | 📌 P1 |
| `event-planner` | Event Planner / MC | professional | 2 | I | |
| `handyman` | Plumber / Electrician / Handyman | professional | 2 | I | |
| `generator-repair` | Generator Repair / HVAC Technician | professional | 2 | I | |
| `it-support` | IT Support / Computer Repair | professional | 2 | I | |
| `law-firm` | Law Firm / Legal Practice | professional | 2 | O | |
| `accounting-firm` | Accounting Firm / Audit Practice | professional | 2 | O | |
| `tax-consultant` | Tax Consultant / Revenue Agent | professional | 3 | I | |
| `land-surveyor` | Land Surveyor / Registry Agent | professional | 3 | I | |
| `wedding-planner` | Wedding Planner / Celebrant | professional | 3 | I | |
| `funeral-home` | Burial / Funeral Home | professional | 3 | O | |
| `pr-firm` | Public Relations Firm | professional | 3 | O | |
| `startup` | Startup / Early-Stage Company | professional | 3 | O | |

---

## Creator (8 canonical verticals)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `creator` | Creator / Influencer | creator | 1 | I | 📌 P1 |
| `photography` | Photography / Videography Studio | creator | 2 | I | ⚠️ pkg alias (`verticals-photography-studio`) |
| `music-studio` | Music Studio / Recording Artist | creator | 2 | I | |
| `fashion-brand` | Fashion Brand / Clothing Label | creator | 2 | O | |
| `talent-agency` | Talent Agency / Model Agency | creator | 3 | O | |
| `recording-label` | Record Label / Music Publisher | creator | 3 | O | |
| `podcast-studio` | Podcast Studio / Audio Platform | creator | 3 | O | |
| `motivational-speaker` | Motivational Speaker / Training Firm | creator | 3 | I | |

---

## Place (8 canonical verticals)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `market` | Market / Trading Hub | place | 1 | Pl | 📌 P1 |
| `tech-hub` | Tech Hub / Innovation Centre | place | 1 | Pl | 📌 P1 |
| `event-hall` | Event Hall / Venue | place | 2 | Pl | |
| `warehouse` | Warehouse Operator | place | 2 | Pl | |
| `wholesale-market` | Wholesale Market (Onitsha/Alaba/Ladipo) | place | 2 | Pl | |
| `water-treatment` | Water Treatment / Borehole Operator | place | 2 | O | |
| `community-hall` | Community Hall / Town Hall | place | 3 | Pl | |
| `events-centre` | Events Centre / Hall Rental | place | 3 | Pl | |

---

## Financial (6 canonical verticals)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `savings-group` | Thrift / Ajo / Esusu Group | financial | 2 | O | |
| `insurance-agent` | Insurance Agent / Broker | financial | 2 | I | |
| `airtime-reseller` | Airtime / VTU Reseller | financial | 3 | I | |
| `mobile-money-agent` | Mobile Money / POS Agent | financial | 3 | I | |
| `bureau-de-change` | Bureau de Change / FX Dealer | financial | 3 | O | |
| `hire-purchase` | Hire Purchase / Asset Finance | financial | 3 | O | |

---

## Media (3 canonical verticals)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `advertising-agency` | Advertising Agency | media | 2 | O | |
| `community-radio` | Community Radio / TV Station | media | 3 | O | |
| `newspaper-distribution` | Newspaper Distribution Agency | media | 3 | O | ⚠️ pkg alias (`verticals-newspaper-dist`) |

---

## Institutional (1 canonical vertical)

| Slug | Display Name | Category | P | Type | Flags |
|---|---|---|---|---|---|
| `government-agency` | Government Agency / Parastatal | institutional | 3 | O | |

---

## Count Verification

| Category | Count |
|---|---|
| politics | 7 |
| transport | 15 |
| civic | 13 |
| commerce | 54 |
| health | 11 |
| education | 8 |
| agricultural | 12 |
| professional | 13 |
| creator | 8 |
| place | 8 |
| financial | 6 |
| media | 3 |
| institutional | 1 |
| **TOTAL** | **159** ✓ |

---

## Post-CSV Verticals (In Database, Not Yet In CSV)

The following vertical(s) exist in the database via migration but are not yet in `0004_verticals-master.csv`. They must be added to the CSV in the next data governance update.

| Slug | Display Name | Category | Priority | Source Migration |
|---|---|---|---|---|
| `bank-branch` | Bank Branch / ATM Location | financial | 2 (suggested) | `0339_vertical_bank_branch.sql` |

---

## Merge Decision Summary

The following rows have open MERGE_REQUIRED decisions. Until executed, all three slugs remain in the CSV with `status='planned'`.

| Slug to Deprecate | Merge Into | Priority of Decision |
|---|---|---|
| `gym-fitness` | `gym` | MEDIUM |
| `petrol-station` | `fuel-station` | MEDIUM |
| `nurtw` | `road-transport-union` | MEDIUM |

After all merges: effective canonical count = **156** (+ 3 deprecated aliases in CSV with `status='deprecated'`)

---

## Governance Rules for This Register

1. **This document is a derived artifact.** The primary source is `infra/db/seeds/0004_verticals-master.csv`. If there is any discrepancy, the CSV takes precedence.
2. **Do not add a vertical to this register without first adding it to the CSV.**
3. **Every niche in the P2 registry must reference a slug from this register.** Niches with slugs not in this register are invalid.
4. **Package directory names must match canonical slugs.** If a package uses an alias name, it must be recorded in the `vertical_synonyms` table.
5. **The `social` category is reserved** in the TypeScript types (`VerticalCategory`) but no verticals currently use it.
6. **Merges must follow the process** in `docs/governance/vertical-duplicates-and-merge-decisions.md` before this document is updated.

---

*Last updated: 2026-04-25*
*Source: STOP-AND-RECONCILE vertical taxonomy audit*
*Derived from: `infra/db/seeds/0004_verticals-master.csv` (159 rows)*
