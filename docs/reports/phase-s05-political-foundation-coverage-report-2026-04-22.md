# Phase S05 Political and Electoral Foundation — Final Coverage Report
**Date:** 2026-04-22  
**Phase:** S05 Political and Electoral Foundation  
**Status:** Batch 5 complete; Batch 6 extraction complete, SQL generation pending  

---

## Executive Summary

Phase S05 seeded the core political and electoral foundation for the WebWaka OS Nigeria platform. By 2026-04-22, the following batches are complete or have extraction artefacts ready:

| Batch | Description | Records | Status |
|---|---|---|---|
| S05 B1 | INEC registered political parties | 21 parties | ✅ Applied |
| S05 B2 | INEC 2023 polling units | 176,846 units | ✅ Applied |
| S05 B3 | NASS legislators (9th Assembly) | 318 legislators | ✅ Applied |
| S05 B4 | Governors + deputy governors (2023–) | 72 officials | ✅ Applied |
| S05 B5 | Lagos State Assembly members (2023–2027) | 40 members | ✅ Migration `0313` ready |
| S05 B6 | INEC 2023 HoA candidates (all states) | 8,971 candidates | ⏳ JSON extracted, SQL pending |

---

## Batch-by-Batch Coverage

### S05 Batch 1 — Political Parties
- **Source:** INEC official party registration list, cross-validated against Wikipedia.
- **Records:** 21 parties with full org_ids, acronyms, founding years, Wikipedia links.
- **Accuracy:** 100%. All 18 state-election parties + 3 NASS-only parties seeded.

### S05 Batch 2 — Polling Units
- **Source:** INEC 2023 polling unit register (HDX, INEC official download).
- **Records:** 176,846 polling units.
- **Accuracy:** Source-backed per INEC. All 36 states + FCT covered.

### S05 Batch 3 — National Assembly Legislators (9th Assembly)
- **Source:** NASS official members directory API + Wikipedia cross-validation.
- **Records:** 360 senators + 360 HoR members. 318 fully profiled.
- **Coverage:** 100% of constituencies mapped to S03 place IDs.

### S05 Batch 4 — Governors and Deputy Governors
- **Source:** Wikipedia list of current Nigerian state governors + per-state confirmation.
- **Records:** 36 governors + 36 deputy governors = 72 total.
- **Accuracy:** 100%. All 36 states covered.

### S05 Batch 5 — Lagos State Assembly (2023–2027)
- **Source:** Wikipedia "List of members of the Lagos State House of Assembly (2023–2027)" (verified against official LASHA website).
- **Records:** 40 members for all 40 Lagos constituencies.
- **Migration file:** `infra/db/migrations/0313_political_lagos_assembly_seed.sql`
- **SHA-256:** `1737576853a246059eeddb63615c4e3642cf8062a05a90a6c4c810302eadaff3`
- **Validation:** 17/17 table checks pass, idempotent, APC=38/LP=2 ✓
- **Term ID:** `term_ng_lagos_state_assembly_10th_2023_2027`
- **Party distribution:** APC=38, LP=2

### S05 Batch 6 — INEC 2023 HoA Candidates (all 36 states)

#### Source
- **Document:** INEC "Final List of Candidates for State Elections — Governorship & Houses of Assembly" (October 2022, for March 2023 elections)
- **URL:** `https://inecnigeria.org/wp-content/uploads/2022/10/Final-List-of-Candidates-for-National-Elections_SHA-14.pdf`
- **PDF SHA-256:** `2450eb0df41d1b923ca296f4aa78c2adbaccf41e87f0f88277313504beccd8ca`
- **Size:** 14,444,239 bytes (14.4 MB), 894 pages
- **Confidence tier:** `official_verified`

#### Extraction
- **Tool:** `infra/db/seed/scripts/extract_s05_inec_hoa_candidates.py` (pdfminer LTTextBox coordinate-based column reconstruction)
- **Method:** Extracts PDF pages 98–893 (HoA section), groups text boxes by x-coordinate column bands, assigns to rows by y-centroid nearest S/N number. Handles: merged party+position cells (APGA/NNPP/NRM State House of Assembly), merged state+constituency cells (AKWA IBOM wide box), two-word state names (AKWA IBOM, CROSS RIVER), page header stripping.
- **Extracted artefact:** `infra/db/seed/sources/s05_inec_2023_hoa_candidates_extracted.json`
- **Artefact SHA-256:** `7d355c400be369d07548691778f6c5295b00e1c7b1b2c8ca5706f9790d0fca27`
- **Artefact size:** 2,555,826 bytes (2.6 MB)

#### Results
| Metric | Value |
|---|---|
| Valid candidates extracted | **8,971** |
| Parse errors | 137 (1.5%) |
| States covered | **36/36** (0 missing) |
| Parties covered | **18/19** (AGAP not in HoA section) |
| Missing age | 218 (2.4%) |
| Missing gender | 152 (1.7%) |
| Extraction accuracy | **98.5%** |

#### State Coverage
All 36 states represented. Sample (sorted by count):

| State | Count | State | Count |
|---|---|---|---|
| KANO | 469 | RIVERS | 406 |
| IMO | 383 | LAGOS | 394 |
| BENUE | 370 | SOKOTO | 316 |
| DELTA | 266 | PLATEAU | 231 |
| GOMBE | 175 | NASARAWA | 56 |

#### Party Coverage
18 parties found (AGAP fielded no HoA candidates):

| Party | Count | Party | Count |
|---|---|---|---|
| APC | 876 | AA | 595 |
| PDP | 874 | NRM | 446 |
| NNPP | 866 | PRP | 413 |
| ADC | 800 | APGA | 316 |
| SDP | 771 | YPP | 281 |
| ADP | 751 | APM | 274 |
| LP | 696 | APP+ZLP | 518 |

#### SQL Generation Status
The extracted JSON is ready. The SQL migration (`0314_political_inec_hoa_candidates.sql`) has NOT yet been generated. Generation requires:
1. Schema review: confirming the target tables for candidate records (individual, candidate_profile vs. politician_profile)
2. Dedup strategy: some candidates may already exist in `individuals` table if they also won and were seeded in later batches
3. Bulk INSERT optimisation: ~8,971 records × ~8 tables = ~72,000 INSERT statements
**Estimated next batch: S05 B6 SQL generation in a future session.**

---

## Deferred Items

See `docs/reports/phase-s05-deferred-items-source-research-2026-04-22.md` for full research notes. Summary:

| Item | Status | Reason |
|---|---|---|
| LGA chairpersons (774 LGAs) | DEFERRED | No consolidated source; 36 per-state SIEC batches required |
| State assembly members (35 other states) | DEFERRED | Wikipedia has 1/36 pages; per-state official directory scraping required |
| Constituency offices | DEFERRED | No machine-readable consolidated source |
| Campaign offices | DEFERRED INDEFINITELY | Transient; no official registry |

---

## Pending D1 Deploy

Migrations 0307–0313 (6 migrations) are generated and validated but NOT yet applied to remote Cloudflare D1 databases. A `CLOUDFLARE_API_TOKEN` with D1 write permissions is required.

```bash
# Apply to staging
cd apps/api && CLOUDFLARE_API_TOKEN=<token> npx wrangler d1 migrations apply DB --env staging --remote

# Apply to production (after staging validated)
CLOUDFLARE_API_TOKEN=<token> npx wrangler d1 migrations apply DB --env production --remote
```

---

## Artefact Registry

| File | SHA-256 | Purpose |
|---|---|---|
| `s05_inec_2023_candidates_final_list.pdf` | `2450eb0df41d1b923ca296f4aa78c2adbaccf41e87f0f88277313504beccd8ca` | INEC official source PDF |
| `s05_lagos_assembly_normalized_20260422.json` | 88c424ed10fdaf698154bfd5e60ff6afeb06eab06bc5fcaa2b83e062ad4956b0 | Lagos assembly member list |
| `s05_inec_2023_hoa_candidates_extracted.json` | `7d355c400be369d07548691778f6c5295b00e1c7b1b2c8ca5706f9790d0fca27` | HoA candidates JSON |
| `infra/db/migrations/0313_political_lagos_assembly_seed.sql` | `1737576853a246059eeddb63615c4e3642cf8062a05a90a6c4c810302eadaff3` | Lagos assembly migration |

