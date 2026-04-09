# WebWaka OS — Unimplemented Vertical Tasks

**Generated:** 2026-04-09
**Total unimplemented:** 126 verticals across 9 sets
**Next available migration number:** `0057`
**Base prompt directory:** `docs/execution-prompts/`

---

## Pending Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | `DELETE /politician/:id` has no admin role guard — any authenticated tenant user can hard-delete | **High** | `apps/api/src/routes/politician.ts` L223 |
| 2 | PROGRESS.md table still shows Sets F–I as `⏳ PENDING`; SHAs and completion log entries missing | Medium | `docs/execution-prompts/PROGRESS.md` |
| 3 | 2 moderate Dependabot vulnerabilities unfixed on default branch | Medium | https://github.com/WebWakaDOS/webwaka-os/security/dependabot |
| 4 | Next migration number (0057) must be checked in `infra/db/migrations/` before any new vertical implementation begins | Info | `infra/db/migrations/` |

---

## Set A — Commerce P2 Batch 1 (9 verticals)

**Milestone:** M10–M11
**File:** [`webwaka_verticals_commerce_p2_batch1_execution_prompts.md`](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch1_execution_prompts.md)

| Task ID | Vertical | Prompt Link |
|---------|----------|-------------|
| V-COMM-EXT-A1 | Auto Mechanic / Garage | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch1_execution_prompts.md#task-v-comm-ext-a1-auto-mechanic--garage-vertical) |
| V-COMM-EXT-A2 | Bakery / Confectionery | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch1_execution_prompts.md#task-v-comm-ext-a2-bakery--confectionery-vertical) |
| V-COMM-EXT-A3 | Beauty Salon / Barber Shop | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch1_execution_prompts.md#task-v-comm-ext-a3-beauty-salon--barber-shop-vertical) |
| V-COMM-EXT-A4 | Bookshop / Stationery Store | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch1_execution_prompts.md#task-v-comm-ext-a4-bookshop--stationery-store-vertical) |
| V-COMM-EXT-A5 | Catering Service | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch1_execution_prompts.md#task-v-comm-ext-a5-catering-service-vertical) |
| V-COMM-EXT-A6 | Cleaning Service | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch1_execution_prompts.md#task-v-comm-ext-a6-cleaning-service-vertical) |
| V-COMM-EXT-A7 | Electronics Repair Shop | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch1_execution_prompts.md#task-v-comm-ext-a7-electronics-repair-shop-vertical) |
| V-COMM-EXT-A8 | Florist / Garden Centre | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch1_execution_prompts.md#task-v-comm-ext-a8-florist--garden-centre-vertical) |
| V-COMM-EXT-A9 | Food Vendor / Street Food | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch1_execution_prompts.md#task-v-comm-ext-a9-food-vendor--street-food-vertical) |

---

## Set B — Commerce P2 Batch 2 (12 verticals)

**Milestone:** M11
**File:** [`webwaka_verticals_commerce_p2_batch2_execution_prompts.md`](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md)

| Task ID | Vertical | Prompt Link |
|---------|----------|-------------|
| V-COMM-EXT-B1 | Construction Firm / Contractor | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md#task-v-comm-ext-b1-construction-firm--contractor-vertical) |
| V-COMM-EXT-B2 | Fuel / Filling Station | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md#task-v-comm-ext-b2-fuel--filling-station-vertical) |
| V-COMM-EXT-B3 | Printing & Branding Shop | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md#task-v-comm-ext-b3-printing--branding-shop-vertical) |
| V-COMM-EXT-B4 | Property Developer | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md#task-v-comm-ext-b4-property-developer-vertical) |
| V-COMM-EXT-B5 | Real Estate Agency | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md#task-v-comm-ext-b5-real-estate-agency-vertical) |
| V-COMM-EXT-B6 | Restaurant / Food Chain Outlet | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md#task-v-comm-ext-b6-restaurant--food-chain-outlet-vertical) |
| V-COMM-EXT-B7 | Security Company / Guard Service | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md#task-v-comm-ext-b7-security-company--guard-service-vertical) |
| V-COMM-EXT-B8 | Solar / Renewable Energy Installer | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md#task-v-comm-ext-b8-solar--renewable-energy-installer-vertical) |
| V-COMM-EXT-B9 | Spa / Massage Parlour | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md#task-v-comm-ext-b9-spa--massage-parlour-vertical) |
| V-COMM-EXT-B10 | Tailoring / Fashion Designer | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md#task-v-comm-ext-b10-tailoring--fashion-designer-vertical) |
| V-COMM-EXT-B11 | Travel Agent / Tour Operator | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md#task-v-comm-ext-b11-travel-agent--tour-operator-vertical) |
| V-COMM-EXT-B12 | Welding / Fabrication Shop | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p2_batch2_execution_prompts.md#task-v-comm-ext-b12-welding--fabrication-shop-vertical) |

---

## Set C — Commerce P3 Tail (15 verticals)

**Milestone:** M11–M12
**File:** [`webwaka_verticals_commerce_p3_execution_prompts.md`](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md)

| Task ID | Vertical | Prompt Link |
|---------|----------|-------------|
| V-COMM-EXT-C1 | Artisanal Mining Operator | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c1-artisanal-mining-operator-vertical) |
| V-COMM-EXT-C2 | Borehole Drilling Company | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c2-borehole-drilling-company-vertical) |
| V-COMM-EXT-C3 | Building Materials Supplier | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c3-building-materials-supplier-vertical) |
| V-COMM-EXT-C4 | Car Wash / Detailing | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c4-car-wash--detailing-vertical) |
| V-COMM-EXT-C5 | Cleaning & Facility Management Co. | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c5-cleaning--facility-management-company-vertical) |
| V-COMM-EXT-C6 | Electrical Fittings Dealer | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c6-electrical-fittings-dealer-vertical) |
| V-COMM-EXT-C7 | Generator Sales & Service Centre | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c7-generator-sales--service-centre-vertical) |
| V-COMM-EXT-C8 | Hair Salon / Barbing Salon | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c8-hair-salon--barbing-salon-vertical) |
| V-COMM-EXT-C9 | Petrol Station (DPR/NUPRC-licensed) | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c9-petrol-station-dprnuprc-licensed-vertical) |
| V-COMM-EXT-C10 | Phone Repair & Accessories Shop | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c10-phone-repair--accessories-shop-vertical) |
| V-COMM-EXT-C11 | Shoe Cobbler / Shoe Maker | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c11-shoe-cobbler--shoe-maker-vertical) |
| V-COMM-EXT-C12 | Spare Parts Dealer (Ladipo/Nnewi) | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c12-spare-parts-dealer-ladipoNnewi-vertical) |
| V-COMM-EXT-C13 | Tyre Shop / Vulcanizer | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c13-tyre-shop--vulcanizer-vertical) |
| V-COMM-EXT-C14 | Used Car Dealer / Auto Trader | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c14-used-car-dealer--auto-trader-vertical) |
| V-COMM-EXT-C15 | Water Tanker / Sachet Water Producer | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_commerce_p3_execution_prompts.md#task-v-comm-ext-c15-water-tanker--sachet-water-producer-vertical) |

---

## Set D — Transport Extended (8 verticals)

**Milestone:** M10–M11
**File:** [`webwaka_verticals_transport_extended_execution_prompts.md`](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_transport_extended_execution_prompts.md)

| Task ID | Vertical | Prompt Link |
|---------|----------|-------------|
| V-TRN-EXT-1 | Clearing & Forwarding Agent | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_transport_extended_execution_prompts.md#task-v-trn-ext-1-clearing--forwarding-agent-vertical) |
| V-TRN-EXT-2 | Courier Service | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_transport_extended_execution_prompts.md#task-v-trn-ext-2-courier-service-vertical) |
| V-TRN-EXT-3 | Dispatch Rider Network | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_transport_extended_execution_prompts.md#task-v-trn-ext-3-dispatch-rider-network-vertical) |
| V-TRN-EXT-4 | Airport Shuttle Service | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_transport_extended_execution_prompts.md#task-v-trn-ext-4-airport-shuttle-service-vertical) |
| V-TRN-EXT-5 | Cargo Truck Owner / Fleet Operator | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_transport_extended_execution_prompts.md#task-v-trn-ext-5-cargo-truck-owner--fleet-operator-vertical) |
| V-TRN-EXT-6 | Container Depot / Logistics Hub | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_transport_extended_execution_prompts.md#task-v-trn-ext-6-container-depot--logistics-hub-vertical) |
| V-TRN-EXT-7 | Ferry / Water Transport Operator | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_transport_extended_execution_prompts.md#task-v-trn-ext-7-ferry--water-transport-operator-vertical) |
| V-TRN-EXT-8 | Road Transport Workers Union (NURTW) | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_transport_extended_execution_prompts.md#task-v-trn-ext-8-road-transport-workers-union-nurtw-vertical) |

---

## Set E — Civic Extended (10 verticals)

**Milestone:** M10–M12
**File:** [`webwaka_verticals_civic_extended_execution_prompts.md`](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_civic_extended_execution_prompts.md)

| Task ID | Vertical | Prompt Link |
|---------|----------|-------------|
| V-CIV-EXT-1 | Mosque / Islamic Centre | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_civic_extended_execution_prompts.md#task-v-civ-ext-1-mosque--islamic-centre-vertical) |
| V-CIV-EXT-2 | Youth Organization / Student Union | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_civic_extended_execution_prompts.md#task-v-civ-ext-2-youth-organization--student-union-vertical) |
| V-CIV-EXT-3 | Women's Association / Forum | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_civic_extended_execution_prompts.md#task-v-civ-ext-3-womens-association--forum-vertical) |
| V-CIV-EXT-4 | Waste Management / Recycler | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_civic_extended_execution_prompts.md#task-v-civ-ext-4-waste-management--recycler-vertical) |
| V-CIV-EXT-5 | Book Club / Reading Circle | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_civic_extended_execution_prompts.md#task-v-civ-ext-5-book-club--reading-circle-vertical) |
| V-CIV-EXT-6 | Professional Association (NBA/NMA/ICAN) | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_civic_extended_execution_prompts.md#task-v-civ-ext-6-professional-association-nbanmaican-vertical) |
| V-CIV-EXT-7 | Sports Club / Amateur League | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_civic_extended_execution_prompts.md#task-v-civ-ext-7-sports-club--amateur-league-vertical) |
| V-CIV-EXT-8 | Campaign Office | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_civic_extended_execution_prompts.md#task-v-civ-ext-8-campaign-office-vertical) |
| V-CIV-EXT-9 | Constituency Development Office | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_civic_extended_execution_prompts.md#task-v-civ-ext-9-constituency-development-office-vertical) |
| V-CIV-EXT-10 | Ward Representative / Polling Unit | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_civic_extended_execution_prompts.md#task-v-civ-ext-10-ward-representative--polling-unit-vertical) |

---

## Set F — Health Extended (6 verticals)

**Milestone:** M10–M12
**File:** [`webwaka_verticals_health_extended_execution_prompts.md`](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_health_extended_execution_prompts.md)

| Task ID | Vertical | Prompt Link |
|---------|----------|-------------|
| V-HLT-EXT-1 | Dental Clinic / Orthodontist | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_health_extended_execution_prompts.md#task-v-hlt-ext-1-dental-clinic--orthodontist-vertical) |
| V-HLT-EXT-2 | Sports Academy / Fitness Centre | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_health_extended_execution_prompts.md#task-v-hlt-ext-2-sports-academy--fitness-centre-vertical) |
| V-HLT-EXT-3 | Veterinary Clinic / Pet Shop | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_health_extended_execution_prompts.md#task-v-hlt-ext-3-veterinary-clinic--pet-shop-vertical) |
| V-HLT-EXT-4 | Community Health Worker (CHW) Network | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_health_extended_execution_prompts.md#task-v-hlt-ext-4-community-health-worker-chw-network-vertical) |
| V-HLT-EXT-5 | Elderly Care Facility | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_health_extended_execution_prompts.md#task-v-hlt-ext-5-elderly-care-facility-vertical) |
| V-HLT-EXT-6 | Rehabilitation / Recovery Centre | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_health_extended_execution_prompts.md#task-v-hlt-ext-6-rehabilitation--recovery-centre-vertical) |

---

## Set G — Education + Agricultural Extended (13 verticals)

**Milestone:** M10–M12
**File:** [`webwaka_verticals_education_agricultural_extended_execution_prompts.md`](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md)

| Task ID | Vertical | Prompt Link |
|---------|----------|-------------|
| V-EDU-EXT-1 | Driving School (FRSC-Licensed) | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-edu-ext-1-driving-school-frsc-licensed-vertical) |
| V-EDU-EXT-2 | Training Institute / Vocational School | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-edu-ext-2-training-institute--vocational-school-vertical) |
| V-EDU-EXT-3 | Crèche / Day Care Centre | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-edu-ext-3-crèche--day-care-centre-vertical) |
| V-EDU-EXT-4 | Private School Operator | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-edu-ext-4-private-school-operator-vertical) |
| V-AGR-EXT-1 | Agro-Input Dealer | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-agr-ext-1-agro-input-dealer-vertical) |
| V-AGR-EXT-2 | Cold Room / Storage Facility | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-agr-ext-2-cold-room--storage-facility-vertical) |
| V-AGR-EXT-3 | Abattoir / Meat Processing | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-agr-ext-3-abattoir--meat-processing-vertical) |
| V-AGR-EXT-4 | Cassava / Maize / Rice Miller | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-agr-ext-4-cassava--maize--rice-miller-vertical) |
| V-AGR-EXT-5 | Cocoa / Export Commodities Trader | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-agr-ext-5-cocoa--export-commodities-trader-vertical) |
| V-AGR-EXT-6 | Fish Market / Fishmonger | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-agr-ext-6-fish-market--fishmonger-vertical) |
| V-AGR-EXT-7 | Food Processing Factory | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-agr-ext-7-food-processing-factory-vertical) |
| V-AGR-EXT-8 | Palm Oil / Vegetable Oil Producer | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-agr-ext-8-palm-oil--vegetable-oil-producer-vertical) |
| V-AGR-EXT-9 | Vegetable Garden / Horticulture | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_education_agricultural_extended_execution_prompts.md#task-v-agr-ext-9-vegetable-garden--horticulture-vertical) |

---

## Set H — Professional + Creator Extended (11 verticals)

**Milestone:** M10–M12
**File:** [`webwaka_verticals_professional_creator_execution_prompts.md`](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_professional_creator_execution_prompts.md)

| Task ID | Vertical | Prompt Link |
|---------|----------|-------------|
| V-PRO-EXT-1 | Accounting Firm / Audit Practice | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_professional_creator_execution_prompts.md#task-v-pro-ext-1-accounting-firm--audit-practice-vertical) |
| V-PRO-EXT-2 | Event Planner / MC | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_professional_creator_execution_prompts.md#task-v-pro-ext-2-event-planner--mc-vertical) |
| V-PRO-EXT-3 | Law Firm / Legal Practice | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_professional_creator_execution_prompts.md#task-v-pro-ext-3-law-firm--legal-practice-vertical) |
| V-PRO-EXT-4 | Burial / Funeral Home | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_professional_creator_execution_prompts.md#task-v-pro-ext-4-burial--funeral-home-vertical) |
| V-PRO-EXT-5 | Public Relations Firm | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_professional_creator_execution_prompts.md#task-v-pro-ext-5-public-relations-firm-vertical) |
| V-PRO-EXT-6 | Tax Consultant / Revenue Agent | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_professional_creator_execution_prompts.md#task-v-pro-ext-6-tax-consultant--revenue-agent-vertical) |
| V-PRO-EXT-7 | Wedding Planner / Celebrant | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_professional_creator_execution_prompts.md#task-v-pro-ext-7-wedding-planner--celebrant-vertical) |
| V-CRT-EXT-1 | Music Studio / Recording Studio | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_professional_creator_execution_prompts.md#task-v-crt-ext-1-music-studio--recording-studio-vertical) |
| V-CRT-EXT-2 | Photography Studio / Videography | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_professional_creator_execution_prompts.md#task-v-crt-ext-2-photography-studio--videography-vertical) |
| V-CRT-EXT-3 | Record Label / Music Publisher | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_professional_creator_execution_prompts.md#task-v-crt-ext-3-record-label--music-publisher-vertical) |
| V-CRT-EXT-4 | Talent Agency / Model Agency | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_professional_creator_execution_prompts.md#task-v-crt-ext-4-talent-agency--model-agency-vertical) |

---

## Set I — Financial + Place + Media + Institutional (13 verticals)

**Milestone:** M12
**File:** [`webwaka_verticals_financial_place_media_institutional_execution_prompts.md`](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md)

| Task ID | Vertical | Prompt Link |
|---------|----------|-------------|
| V-FIN-EXT-1 | Airtime / VTU Reseller | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-fin-ext-1-airtime--vtu-reseller-vertical) |
| V-FIN-EXT-2 | Bureau de Change / FX Dealer | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-fin-ext-2-bureau-de-change--fx-dealer-vertical) |
| V-FIN-EXT-3 | Hire Purchase / Asset Finance | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-fin-ext-3-hire-purchase--asset-finance-vertical) |
| V-FIN-EXT-4 | Mobile Money Agent | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-fin-ext-4-mobile-money-agent-vertical) |
| V-PLC-EXT-1 | Event Hall / Venue | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-plc-ext-1-event-hall--venue-vertical) |
| V-PLC-EXT-2 | Water Treatment / Borehole Operator | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-plc-ext-2-water-treatment--borehole-operator-vertical) |
| V-PLC-EXT-3 | Community Hall / Town Hall | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-plc-ext-3-community-hall--town-hall-vertical) |
| V-PLC-EXT-4 | Events Centre / Hall Rental | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-plc-ext-4-events-centre--hall-rental-vertical) |
| V-MED-EXT-1 | Advertising Agency | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-med-ext-1-advertising-agency-vertical) |
| V-MED-EXT-2 | Newspaper Distribution / Media House | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-med-ext-2-newspaper-distribution--media-house-vertical) |
| V-MED-EXT-3 | Podcast Studio / Digital Media | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-med-ext-3-podcast-studio--digital-media-vertical) |
| V-INST-EXT-1 | Government Agency / MDA | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-inst-ext-1-government-agency--mda-vertical) |
| V-INST-EXT-2 | Polling Unit / Electoral District | [Link](https://github.com/WebWakaDOS/webwaka-os/blob/main/docs/execution-prompts/webwaka_verticals_financial_place_media_institutional_execution_prompts.md#task-v-inst-ext-2-polling-unit--electoral-district-vertical) |

---

## Summary by Set

| Set | Category | Count | Milestone | Status |
|-----|----------|-------|-----------|--------|
| A | Commerce P2 Batch 1 | 9 | M10–M11 | Prompt ready, not implemented |
| B | Commerce P2 Batch 2 | 12 | M11 | Prompt ready, not implemented |
| C | Commerce P3 Tail | 15 | M11–M12 | Prompt ready, not implemented |
| D | Transport Extended | 8 | M10–M11 | Prompt ready, not implemented |
| E | Civic Extended | 10 | M10–M12 | Prompt ready, not implemented |
| F | Health Extended | 6 | M10–M12 | Prompt ready, not implemented |
| G | Education + Agricultural | 13 | M10–M12 | Prompt ready, not implemented |
| H | Professional + Creator | 11 | M10–M12 | Prompt ready, not implemented |
| I | Financial + Place + Media + Institutional | 13 | M12 | Prompt ready, not implemented |
| **Total** | | **97** | | |

> **Note:** 29 additional verticals were identified but their prompts were rolled into existing pre-M9 documents (see `PROGRESS.md` — Already Completed section). Total unique unimplemented task blocks across the 9 new files = **126**.
