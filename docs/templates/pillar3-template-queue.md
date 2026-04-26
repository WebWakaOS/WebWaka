# Pillar 3 Template Queue

**Document type:** Agent work queue — single source of truth for what to build next  
**Status:** ACTIVE — updated by agents after every completed niche  
**Date last updated:** 2026-04-26  
**Authority:** `docs/reports/pillar3-niche-identity-system-2026-04-26.md`

> **One agent, one niche at a time.**  
> Before claiming a niche, read this queue. Take the CURRENT niche at the top.  
> After completing a niche, advance CURRENT to the next niche in the list.  
> Never skip ahead — the queue order is the build priority order.

---

## ⟶ CURRENT (Build This Next)

```
Niche ID:      P3-mosque-mosque-community-platform
Vertical:      mosque
Niche Name:    Mosque / Islamic Centre Community Platform
Category:      civic
NF Priority:   critical
Status:        READY_FOR_RESEARCH
Owner:         —
Family:        NF-CIV-REL variant (church is P2-shipped anchor)
Blocker:       none
Registry path: docs/templates/pillar3-niche-registry.json
```

---

## Queue (Ordered Build Sequence)

### Batch S — SHIPPED (via Pillar 2 Sprint)

These 7 niches are already LIVE in production. Listed here for completeness.

| Priority | Niche ID | Status | Notes |
|----------|----------|--------|-------|
| S1 | `P3-tax-consultant-tax-consultant-site` | SHIPPED ✅ | P2 template: tax-consultant-financial-services |
| S2 | `P3-tutoring-tutoring-site` | SHIPPED ✅ | P2 template: tutoring-private-lessons |
| S3 | `P3-creche-creche-daycare-site` | SHIPPED ✅ | P2 template: creche-early-childhood |
| S4 | `P3-mobile-money-agent-mobile-money-agent-site` | SHIPPED ✅ | P2 template: mobile-money-agent-fintech |
| S5 | `P3-bureau-de-change-bdc-fx-dealer` | SHIPPED ✅ | P2 template: bureau-de-change-fx-dealer |
| S6 | `P3-hire-purchase-hire-purchase-finance` | SHIPPED ✅ | P2 template: hire-purchase-asset-finance |
| S7 | `P3-community-hall-community-hall-booking` | SHIPPED ✅ | P2 template: community-hall-civic-space |

---

### Batch 1 — Critical Nigeria-First Civic Anchors

High-community-density niches. Nigeria-first priority = critical. All unblocked.

| Priority | Niche ID | Status | Notes |
|----------|----------|--------|-------|
| 1 | `P3-mosque-mosque-community-platform` | **CURRENT** ← | NF-CIV-REL variant; church P2-anchored |
| 2 | `P3-hair-salon-hair-salon-site` | READY_FOR_RESEARCH | NF-COM-BEA standalone; critical density |
| 3 | `P3-poultry-farm-poultry-farm-site` | READY_FOR_RESEARCH | NF-AGR-LIV anchor; critical food security |
| 4 | `P3-market-association-market-assoc-portal` | READY_FOR_RESEARCH | NF-CIV-TRD standalone; Alaba/Ladipo anchors |
| 5 | `P3-water-vendor-water-vendor-site` | READY_FOR_RESEARCH | NAFDAC critical; widespread demand |
| 6 | `P3-phone-repair-shop-phone-repair-shop` | READY_FOR_RESEARCH | NF-COM-DIG standalone; Computer Village |
| 7 | `P3-palm-oil-trader-palm-oil-trader-site` | READY_FOR_RESEARCH | NF-AGR-COM anchor; Edo/Delta primary |
| 8 | `P3-okada-keke-okada-keke-coop` | READY_FOR_RESEARCH | NF-TRP-MIC standalone; millions of riders |
| 9 | `P3-tailoring-fashion-tailoring-atelier` | READY_FOR_RESEARCH | NF-COM-FSH standalone; Aso-Ebi market |
| 10 | `P3-used-car-dealer-used-car-dealer-site` | READY_FOR_RESEARCH | NF-COM-AUT anchor; Ladipo/Berger market |

---

### Batch 2 — High Nigeria-First Standalone Commerce

High-volume Nigerian SME types. All unblocked. `nigeriaFirstPriority=high`.

| Priority | Niche ID | Status | Notes |
|----------|----------|--------|-------|
| 11 | `P3-building-materials-building-materials-supplier` | READY_FOR_RESEARCH | NF-COM-CON anchor; housing deficit demand |
| 12 | `P3-electrical-fittings-electrical-fittings-dealer` | READY_FOR_RESEARCH | Inverter/solar boom |
| 13 | `P3-cassava-miller-cassava-miller-site` | READY_FOR_RESEARCH | NF-AGR-PRO anchor; garri production |
| 14 | `P3-generator-dealer-generator-dealer-service` | READY_FOR_RESEARCH | NEPA failure; church/estate market |
| 15 | `P3-fish-market-fish-market-site` | READY_FOR_RESEARCH | NF-AGR-MKT; Apongbon/Onitsha |
| 16 | `P3-wedding-planner-wedding-planner-site` | READY_FOR_RESEARCH | NF-PRO-EVT anchor; multi-day weddings |
| 17 | `P3-private-school-private-school-site` | READY_FOR_RESEARCH | NF-EDU-PRV anchor; SUBEB/WAEC |
| 18 | `P3-community-health-community-health-site` | READY_FOR_RESEARCH | NF-HLT-PHC; NPHCDA/BHCPF |
| 19 | `P3-professional-association-prof-assoc-portal` | READY_FOR_RESEARCH | NBA/NMA/ICAN anchors; critical trust |
| 20 | `P3-campaign-office-campaign-office-ops` | READY_FOR_RESEARCH | INEC compliance critical |

---

### Batch 3 — High Nigeria-First Civic and Professional

| Priority | Niche ID | Status | Notes |
|----------|----------|--------|-------|
| 21 | `P3-lga-office-lga-council-portal` | READY_FOR_RESEARCH | ALGON/LGA transparency |
| 22 | `P3-mosque-community-radio-community-radio-site` | READY_FOR_RESEARCH | NBC licence; community voice |
| 23 | `P3-airtime-reseller-airtime-vtu-reseller` | READY_FOR_RESEARCH | NF-FIN-TEL; VTU bot context |
| 24 | `P3-land-surveyor-land-surveyor-site` | READY_FOR_RESEARCH | SURCON licence; C-of-O critical |
| 25 | `P3-womens-association-womens-assoc-portal` | READY_FOR_RESEARCH | NF-CIV-GEN; WIMBIZ/market women |
| 26 | `P3-youth-organization-youth-org-portal` | READY_FOR_RESEARCH | NANS/NYSC; campus unions |
| 27 | `P3-ministry-mission-ministry-mission-platform` | READY_FOR_RESEARCH | NF-CIV-REL variant; mission outreach |
| 28 | `P3-abattoir-abattoir-meat-processing` | READY_FOR_RESEARCH | Halal cert; Bodija/Oko-Oba |
| 29 | `P3-ferry-ferry-water-transport` | READY_FOR_RESEARCH | NIWA/Lagos Lagoon |
| 30 | `P3-borehole-driller-borehole-drilling` | READY_FOR_RESEARCH | COREN cert; estate developer market |

---

### Batch 4 — Medium-Priority Standalone Niches

| Priority | Niche ID | Status | Notes |
|----------|----------|--------|-------|
| 31 | `P3-printing-press-printing-press-studio` | READY_FOR_RESEARCH | Campaign/church print market |
| 32 | `P3-startup-startup-site` | READY_FOR_RESEARCH | Lagos tech ecosystem |
| 33 | `P3-recording-label-record-label-site` | READY_FOR_RESEARCH | COSON/Afrobeats |
| 34 | `P3-talent-agency-talent-agency-site` | READY_FOR_RESEARCH | APCON/Lagos Fashion Week |
| 35 | `P3-podcast-studio-podcast-studio-site` | READY_FOR_RESEARCH | Boomplay/Spotify Africa |
| 36 | `P3-motivational-speaker-motivational-speaker-site` | READY_FOR_RESEARCH | CIPM/NITAD |
| 37 | `P3-govt-school-govt-school-portal` | READY_FOR_RESEARCH | SUBEB/SBMC community |
| 38 | `P3-community-health-community-health-site` | READY_FOR_RESEARCH | NPHCDA/BHCPF |
| 39 | `P3-rehab-centre-rehab-centre-site` | READY_FOR_RESEARCH | NDLEA licence |
| 40 | `P3-elderly-care-elderly-care-facility` | READY_FOR_RESEARCH | FMOH; emerging sector |

---

### Batch 5 — Commerce Variants (Anchor First Required)

These niches have an anchor (used-car-dealer, building-materials, or electrical-fittings)
that must reach IMPLEMENTED before the variant can begin.

| Priority | Niche ID | Status | Anchor Dependency |
|----------|----------|--------|------------------|
| 41 | `P3-spare-parts-spare-parts-dealer` | READY_FOR_RESEARCH | Anchor: used-car-dealer |
| 42 | `P3-tyre-shop-tyre-shop-service` | READY_FOR_RESEARCH | Anchor: used-car-dealer |
| 43 | `P3-car-wash-car-wash-detailing` | READY_FOR_RESEARCH | Anchor: used-car-dealer |
| 44 | `P3-motorcycle-accessories-moto-accessories-shop` | READY_FOR_RESEARCH | Anchor: used-car-dealer |
| 45 | `P3-iron-steel-iron-steel-merchant` | READY_FOR_RESEARCH | Anchor: building-materials |
| 46 | `P3-paints-distributor-paints-distributor-site` | READY_FOR_RESEARCH | Anchor: electrical-fittings |
| 47 | `P3-plumbing-supplies-plumbing-supplies-dealer` | READY_FOR_RESEARCH | Anchor: electrical-fittings |

---

### Batch 6 — Agricultural, Extractives, and Niche Commerce

| Priority | Niche ID | Status | Notes |
|----------|----------|--------|-------|
| 48 | `P3-food-processing-food-processing-factory` | READY_FOR_RESEARCH | NAFDAC mandatory |
| 49 | `P3-produce-aggregator-produce-aggregator-site` | READY_FOR_RESEARCH | AFEX/NIRSAL |
| 50 | `P3-cocoa-exporter-cocoa-export-trader` | READY_FOR_RESEARCH | NCDC/CAN compliance |
| 51 | `P3-vegetable-garden-urban-veg-garden` | READY_FOR_RESEARCH | CSA subscription; hotel supply |
| 52 | `P3-oil-gas-services-oil-gas-service-provider` | READY_FOR_RESEARCH | NUPRC/NOGIC |
| 53 | `P3-artisanal-mining-artisanal-mining-ops` | READY_FOR_RESEARCH | MSMD licence; Zamfara gold |
| 54 | `P3-airport-shuttle-airport-shuttle-booking` | READY_FOR_RESEARCH | MMIA/NAIA context |
| 55 | `P3-container-depot-container-depot-hub` | READY_FOR_RESEARCH | Apapa/Tin Can ICD |
| 56 | `P3-cargo-truck-cargo-fleet-ops` | READY_FOR_RESEARCH | ECOWAS corridor haulage |
| 57 | `P3-funeral-home-funeral-home-site` | READY_FOR_RESEARCH | Janazah/repatriation |

---

### Batch 7 — Remaining and Lower-Priority Niches

| Priority | Niche ID | Status | Notes |
|----------|----------|--------|-------|
| 58 | `P3-pr-firm-pr-firm-site` | READY_FOR_RESEARCH | NIPR accreditation |
| 59 | `P3-shoemaker-shoemaker-atelier` | READY_FOR_RESEARCH | Aba shoe-making |
| 60 | `P3-newspaper-distribution-newspaper-dist-agency` | READY_FOR_RESEARCH | Declining print context |
| 61 | `P3-laundry-service-laundry-service-site` | READY_FOR_RESEARCH | Hotel B2B; Lekki/VI |
| 62 | `P3-cleaning-company-cleaning-facility-mgmt` | READY_FOR_RESEARCH | Hospital/corporate B2B |
| 63 | `P3-internet-cafe-internet-cafe-business-centre` | READY_FOR_RESEARCH | JAMB/WAEC reg services |
| 64 | `P3-orphanage-orphanage-welfare-portal` | READY_FOR_RESEARCH | Donor/CSR focus |
| 65 | `P3-sports-club-sports-club-portal` | READY_FOR_RESEARCH | Liga Lasgidi context |
| 66 | `P3-book-club-book-club-platform` | READY_FOR_RESEARCH | She Reads Africa |
| 67 | `P3-polling-unit-rep-polling-unit-rep-site` | READY_FOR_RESEARCH | BVAS transparency |
| 68 | `P3-constituency-office-constituency-dev-portal` | READY_FOR_RESEARCH | CDF transparency |
| 69 | `P3-government-agency-govt-agency-portal` | READY_FOR_RESEARCH | NITDA e-government |
| 70 | `P3-events-centre-events-centre-rental` | READY_FOR_RESEARCH | Eko Hotels context |

---

### Additional Niches (Education and Health Variants)

| Priority | Niche ID | Status | Anchor Dependency |
|----------|----------|--------|------------------|
| 71 | `P3-nursery-school-nursery-school-site` | READY_FOR_RESEARCH | Anchor: private-school |
| 72 | `P3-community-radio-community-radio-site` | READY_FOR_RESEARCH | Standalone |

---

## Completed Niches (Full)

| Completed Date | Niche ID | Niche Name | Template Slug |
|----------------|----------|-----------|---------------|
| 2026-04-25 | `P3-tax-consultant-tax-consultant-site` | Tax Consultant / Revenue Agent Site | `tax-consultant-financial-services` |
| 2026-04-25 | `P3-tutoring-tutoring-site` | Tutoring / Lesson Teacher Site | `tutoring-private-lessons` |
| 2026-04-25 | `P3-creche-creche-daycare-site` | Crèche / Day Care Centre Site | `creche-early-childhood` |
| 2026-04-25 | `P3-mobile-money-agent-mobile-money-agent-site` | Mobile Money / POS Agent Service Site | `mobile-money-agent-fintech` |
| 2026-04-25 | `P3-bureau-de-change-bdc-fx-dealer` | Bureau de Change / FX Dealer Site | `bureau-de-change-fx-dealer` |
| 2026-04-25 | `P3-hire-purchase-hire-purchase-finance` | Hire Purchase / Asset Finance Site | `hire-purchase-asset-finance` |
| 2026-04-25 | `P3-community-hall-community-hall-booking` | Community Hall / Town Hall Booking Site | `community-hall-civic-space` |

---

*Last updated: 2026-04-26 — System initialised. 70 niches READY_FOR_RESEARCH. CURRENT = mosque.*
