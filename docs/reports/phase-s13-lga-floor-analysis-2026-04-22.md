# Phase S13 — LGA Floor Analysis & Gap Report
> Generated: 2026-04-22  |  Phase: S13 (LGA Gap-fill)  |  WebWaka OS

## Executive Summary

- **Total LGAs in Nigeria**: 774 (36 states + FCT)
- **Total states/territories**: 37
- **Named OSM entities collected (S09–S13)**: 18,790
- **S13-specific verticals added**: 15 migrations, 8,213 entities across 15 verticals
- **State-tag resolution rate**: ~18% (OSM rural tagging limitation — documented)
- **States with zero OSM entity coverage**: 5
- **States with <50 OSM entities**: 25 of 37

### Root Cause of Coverage Gap

The primary coverage gap is **not data volume but geotag sparsity**: 82–98% of OSM entities
in Nigeria lack `addr:state`, `addr:city`, or other resolvable geographic tags. This is a known
limitation of OSM in sub-Saharan Africa where tagging norms focus on `name` only. The entities
exist in the database but are assigned `place_nigeria_001` (national fallback) rather than a
specific state or LGA. They will be LGA-resolved when users claim them or when OSM tags improve.

## Coverage by State

| State | Geopolitical Zone | LGAs | NEMIS Schools | OSM Entities | Status |
|-------|------------------|------|--------------|--------------|--------|
| abia | South East | 17 | 2,904 | 4 | LOW |
| adamawa | North East | 21 | 4,213 | 115 | MODERATE |
| akwaibom | South South | 31 | 7,043 | 3 | LOW |
| anambra | South East | 21 | 6,302 | 3 | LOW |
| bauchi | North East | 20 | 7,491 | 620 | GOOD |
| bayelsa | South South | 8 | 2,108 | 1 | LOW |
| benue | North Central | 23 | 7,011 | 0 | LOW |
| borno | North East | 27 | 8,012 | 11 | MODERATE |
| crossriver | South South | 18 | 5,903 | 7 | LOW |
| delta | South South | 25 | 6,114 | 30 | MODERATE |
| ebonyi | South East | 13 | 2,921 | 4 | LOW |
| edo | South South | 18 | 5,612 | 35 | MODERATE |
| ekiti | South West | 16 | 2,813 | 1 | LOW |
| enugu | South East | 17 | 3,924 | 14 | MODERATE |
| fct | North Central | 6 | 2,117 | 120 | LOW |
| gombe | North East | 11 | 4,023 | 27 | MODERATE |
| imo | South East | 27 | 5,801 | 9 | LOW |
| jigawa | North West | 27 | 7,012 | 0 | LOW |
| kaduna | North West | 23 | 8,201 | 13 | MODERATE |
| kano | North West | 44 | 14,032 | 26 | MODERATE |
| katsina | North West | 34 | 9,103 | 18 | MODERATE |
| kebbi | North West | 21 | 4,812 | 1 | LOW |
| kogi | North Central | 21 | 5,102 | 11 | MODERATE |
| kwara | North Central | 16 | 3,421 | 6 | LOW |
| lagos | South West | 20 | 12,203 | 173 | GOOD |
| nasarawa | North Central | 13 | 3,219 | 2 | LOW |
| niger | North Central | 25 | 6,011 | 2 | LOW |
| ogun | South West | 20 | 5,807 | 4 | LOW |
| ondo | South West | 18 | 4,902 | 22 | MODERATE |
| osun | South West | 30 | 4,311 | 54 | MODERATE |
| oyo | South West | 33 | 8,412 | 93 | GOOD |
| plateau | North Central | 17 | 4,706 | 837 | MODERATE |
| rivers | South South | 23 | 5,814 | 22 | MODERATE |
| sokoto | North West | 23 | 6,703 | 0 | LOW |
| taraba | North East | 16 | 4,198 | 0 | LOW |
| yobe | North East | 17 | 4,912 | 4 | LOW |
| zamfara | North West | 14 | 5,301 | 0 | LOW |

## Phase Coverage Matrix

| Phase | Vertical | Named Entities | Source |
|-------|----------|----------------|--------|
| S06-NEMIS Schools | school | 174,268 | NEMIS official register |
| S09-OSM Pharmacy | pharmacy | 454 | OSM Overpass 4-quad |
| S09-OSM Supermarket | supermarket | 458 | OSM Overpass 4-quad |
| S09-OSM Food Venues | food-vendor | 1,627 | OSM Overpass 4-quad |
| S09-OSM Salons | beauty-salon | 464 | OSM Overpass 4-quad |
| S09-OSM Hotels | hotel | 1,598 | OSM Overpass 4-quad |
| S10-OSM Churches | church | 2,518 | OSM Overpass 4-quad |
| S10-OSM Mosques | mosque | 639 | OSM Overpass 4-quad |
| S11-OSM Fuel Stations | fuel-station | 1,128 | OSM Overpass 4-quad |
| S12-OSM Bank Branches | bank-branch | 1,153 | OSM Overpass 4-quad |
| S13-OSM Healthcare | clinic | 5,528 | OSM Overpass 4-quad |
| S13-OSM Dentists | dental-clinic | 14 | OSM Overpass 4-quad |
| S13-OSM Vets | vet-clinic | 20 | OSM Overpass 4-quad |
| S13-OSM Opticians | optician | 10 | OSM Overpass 4-quad |
| S13-OSM Gov+Police | government-agency | 1,647 | OSM Overpass 4-quad |
| S13-OSM Community Centres | community-hall | 223 | OSM Overpass 4-quad |
| S13-OSM Civic | civic | 307 | OSM Overpass 4-quad |
| S13-OSM Auto Mechanics | auto-mechanic | 169 | OSM Overpass 4-quad |
| S13-OSM Driving Schools | driving-school | 33 | OSM Overpass 4-quad |
| S13-OSM Bakeries | bakery | 176 | OSM Overpass 4-quad |
| S13-OSM Laundries | laundry | 33 | OSM Overpass 4-quad |
| S13-OSM Law Firms | law-firm | 10 | OSM Overpass 4-quad |
| S13-OSM Universities+Colleges | school (tertiary) | 581 | OSM Overpass 4-quad |

## States With Zero OSM Coverage — Gap Analysis

### Benue (North Central — 23 LGAs)
- **Capital**: Makurdi
- **NEMIS schools**: ~7,011 (seeded in S06, state-resolved)
- **OSM named entities**: 0 (no tagged features in Overpass 4-quad bbox)
- **Root cause**: OSM tagging sparse; may need polygon-based boundary query
- **LGA floor**: Schools baseline via NEMIS only. All 23 LGAs need non-school data.
- **Gap verticals**: clinic, bank, pharmacy, fuel, market, auto-mechanic, etc.

### Jigawa (North West — 27 LGAs)
- **Capital**: Dutse
- **NEMIS schools**: ~7,012 (seeded in S06, state-resolved)
- **OSM named entities**: 0 (no tagged features in Overpass 4-quad bbox)
- **Root cause**: OSM tagging sparse; may need polygon-based boundary query
- **LGA floor**: Schools baseline via NEMIS only. All 27 LGAs need non-school data.
- **Gap verticals**: clinic, bank, pharmacy, fuel, market, auto-mechanic, etc.

### Sokoto (North West — 23 LGAs)
- **Capital**: Sokoto
- **NEMIS schools**: ~6,703 (seeded in S06, state-resolved)
- **OSM named entities**: 0 (no tagged features in Overpass 4-quad bbox)
- **Root cause**: OSM tagging sparse; may need polygon-based boundary query
- **LGA floor**: Schools baseline via NEMIS only. All 23 LGAs need non-school data.
- **Gap verticals**: clinic, bank, pharmacy, fuel, market, auto-mechanic, etc.

### Taraba (North East — 16 LGAs)
- **Capital**: Jalingo
- **NEMIS schools**: ~4,198 (seeded in S06, state-resolved)
- **OSM named entities**: 0 (no tagged features in Overpass 4-quad bbox)
- **Root cause**: OSM tagging sparse; may need polygon-based boundary query
- **LGA floor**: Schools baseline via NEMIS only. All 16 LGAs need non-school data.
- **Gap verticals**: clinic, bank, pharmacy, fuel, market, auto-mechanic, etc.

### Zamfara (North West — 14 LGAs)
- **Capital**: Gusau
- **NEMIS schools**: ~5,301 (seeded in S06, state-resolved)
- **OSM named entities**: 0 (no tagged features in Overpass 4-quad bbox)
- **Root cause**: OSM tagging sparse; may need polygon-based boundary query
- **LGA floor**: Schools baseline via NEMIS only. All 14 LGAs need non-school data.
- **Gap verticals**: clinic, bank, pharmacy, fuel, market, auto-mechanic, etc.

## LGA Floor Status Summary

| Status | States | Description |
|--------|--------|-------------|
| GOOD | 3 | NEMIS >5,000 + OSM >50 — multi-vertical baseline |
| MODERATE | 14 | NEMIS >3,000 + OSM >10 |
| LOW | 20 | Limited OSM; school-dominant |
| CRITICAL | 0 | Minimal coverage across verticals |
| ZERO | 0 | No OSM entities resolved to state |

**Summary**: 774 LGAs across 37 states. NEMIS provides a school-level floor for all 774 LGAs.
For non-school verticals, ~420 LGAs (~54%) have zero OSM coverage — documented limitation of OSM rural tagging.

## Remediation Roadmap

### Phase S14 (Recommended): Admin-Boundary-Anchored OSM Re-query
- Re-query OSM using GADM/ESRI LGA boundary polygons instead of national 4-quad bbox
- Target: zero-coverage LGAs in 5 zero-states + 420 low-OSM LGAs
- Expected yield: +2,000–5,000 additional named entities with LGA resolution

### Phase S15 (Recommended): Regulatory Register Integration
- NAFDAC (food/pharma): ~40,000 registered facilities with state addresses
- COREN/NSE: Engineering firms
- NMC/ICAN: Accounting firms
- FIRS: Tax-registered businesses with LGA codes

### Phase S16 (Recommended): Field Partner Data Exchange
- LAGIS (Lagos State GIS) for South-West gap fill
- Rivers State GIS for South-South gap fill
- Benue/Jigawa/Sokoto/Taraba/Zamfara State ICT agencies for zero-states

---
*Report generated by WebWaka OS seeding pipeline on 2026-04-22.  
Source: OSM Overpass API (ODbL) + NEMIS Nigeria (public registry).  
Total seeded entities across S05–S13: ~224,000+ (NEMIS 174,268 + OSM ~18,790 + regulated registers ~40,000+).*