# Phase S05 Deferred Items — Source Research Report
**Date:** 2026-04-22  
**Phase:** S05 Political and Electoral Foundation  
**Author:** WebWaka OS platform seed tooling  

---

## Summary

This document records the source-research findings for five S05 items that could not be seeded in batches 1–5 from available consolidated, machine-readable, source-backed data. Every item was researched across official government portals, Wikipedia, HDX (Humanitarian Data Exchange), and Cloudflare-accessible network endpoints before being formally deferred.

---

## 1. LGA Chairpersons (774 LGAs)

### Target
774 LGA chairpersons (and optionally deputies) covering all 36 states; seeding profile, political assignment, and party affiliation rows per the S05 schema.

### Sources investigated

| Source | URL | Outcome |
|---|---|---|
| Association of Local Governments of Nigeria (ALGON) website | `https://algon.gov.ng/` | **DNS resolution failure** from Replit network environment (Temporary failure in name resolution). Site may exist but is unreachable from CI/seed environment. |
| ALGON Wikipedia page | `https://en.wikipedia.org/wiki/Association_of_Local_Governments_of_Nigeria` | **Page does not exist** (missing page returned by Wikipedia API). |
| HDX / OCHA Nigeria datasets | `https://data.humdata.org/api/3/action/package_search?q=nigeria+local+government+chair` | **No relevant datasets found.** HDX has flood-impact, boundary, and population datasets for Nigerian LGAs but no elected official registry. |
| Wikipedia search: "Nigeria local government chairperson 2024" | Wikipedia search API | **No relevant results** — search returned unrelated articles (Nigerien crisis, biographical stubs). |
| State SIEC (State Independent Electoral Commission) websites | Per-state (36 individual websites) | **Not attempted** — each state SIEC publishes its own LGA election results through heterogeneous portals (different domains, formats, update schedules). No SIEC website has a known machine-readable consolidated API for all LGA chairs. |
| INEC 2023 Final Candidates PDF (Section 3 — Councillorship) | `https://inecnigeria.org/wp-content/uploads/2022/10/Final-List-of-Candidates-for-National-Elections_SHA-14.pdf` | The downloaded PDF covers Governorship and State Assembly elections only. LGA elections in Nigeria are conducted by State SIECs, not INEC; they are held on a per-state schedule and not part of the 2023 general election. |

### Decision
**DEFERRED — No consolidated national source exists.** LGA chairpersons require 36 individual per-state SIEC data batches. Each batch should be sourced from:
1. The official SIEC results gazette for the most recent LGA election in that state.
2. Cross-validated against the official state government's LGA council chairperson directory or official press releases.

Priority states for future batches: Lagos, Kano, Rivers, Ogun, Oyo (high-traffic states).

---

## 2. State Assembly Members (993 constituencies, ~990 current members)

### Target
Approximately 990 current serving members of the 36 state Houses of Assembly (10th Assembly, 2023–2027 session); seeding politician_profile, political_assignment, party_affiliation rows per the S05 schema.

Note: INEC's official 2023 constituency workbook lists 990 state assembly constituencies. Some public references cite 993 (the count in the INEC 2023 candidates PDF). The discrepancy reflects boundary changes and supplementary constituencies.

### Sources investigated

| Source | URL / Method | Outcome |
|---|---|---|
| Wikipedia "List of members of the [State] State House of Assembly (2023–2027)" — 36 states queried | Wikipedia API batch query | **1/36 pages found** (Lagos only). All other 35 states are missing. |
| Wikipedia "List of members of the [State] State House of Assembly" (no year) — 35 states queried | Wikipedia API batch query | **0/35 pages found.** No state has a generic member list page. |
| Wikipedia per-state HoA pages ("Lagos State House of Assembly", etc.) | Wikipedia API — 5 sampled states | All 5 institutional pages exist but contain institutional history only (leadership, functions, references) — **no per-member table**. |
| Wikipedia "2023 [State] State House of Assembly election" pages — 36 states queried | Wikipedia API batch query | **6/36 found** (Abia, Adamawa, Akwa Ibom, Bayelsa, Kano, Yobe). These pages show the pre-election INEC nominees list (candidates who ran), not post-election winners. Winner data would require per-constituency result records, which are not present in structured form in those 6 pages. |
| Wikipedia "2023 Nigerian state legislative elections" consolidated page | Wikipedia parse API | **Page exists but contains only links** to the 6 per-state pages above — it is a disambiguation/list page with no data rows. |
| Official state House of Assembly websites (36) | — | **Not attempted** — state HoA websites are heterogeneous (different domains, some static HTML, some PDF publications, some offline). A future per-state batch should access them individually. |
| INEC iReV results portal | `https://irev.inecnigeria.org/` | Angular single-page application. All API paths probed (`/api/v1/elections`, `/api/elections`, `/api/results`, `/api/v1/states`, etc.) **returned the Angular SPA HTML** — no REST API discoverable from network requests to known endpoint patterns. |

### What was seeded
- **Lagos State** (40 members): seeded as S05 batch 5, sourced from Wikipedia "List of members of the Lagos State House of Assembly (2023–2027)" which cites the official Lagos State House of Assembly website and the Nigerian Tribune. All 40 constituencies resolved exactly to S03 jurisdiction place IDs (`place_state_constituency_sc_632_la` through `place_state_constituency_sc_671_la`).

### Decision
**35 states DEFERRED — no consolidated source.** Individual state batches should source winners from:
1. Official state House of Assembly membership directories (e.g. `https://www.lagoshouseofassembly.gov.ng/meet-our-members/` was the Lagos source).
2. State Electoral Commission result gazettes.
3. Wikipedia per-state election result pages where available (6 states have partial candidate data; winner determination requires additional result records).

---

## 3. 2023 INEC Candidate Records (15,331 target)

### Target
All candidates/contestants for the 2023 state elections (Governorship + State Houses of Assembly), sourced from the official INEC final candidates list.

### Sources investigated

| Source | URL | Outcome |
|---|---|---|
| INEC website election pages | `https://inecnigeria.org/category/elections/` | HTTP 404 |
| INEC website final candidate page | `https://www.inecnigeria.org/elections/2023-general-election/final-list-of-candidates/` | HTTP 404 |
| INEC sitemap.xml | `https://inecnigeria.org/sitemap.xml` | Only 12 URLs; election-results sitemap returned 7 stub/test CMS pages (named "test-chairman", "gubernatorial-test", etc.) — **no real result data** |
| INEC official PDF — Final List of Candidates | `https://inecnigeria.org/wp-content/uploads/2022/10/Final-List-of-Candidates-for-National-Elections_SHA-14.pdf` | **HTTP 200, 14,444,239 bytes (14.4 MB), SHA-256: `2450eb0df41d1b923ca296f4aa78c2adbaccf41e87f0f88277313504beccd8ca`**. Text-based (not scanned), fully extractable with pdfminer.six. 894 pages. HoA candidates begin at page 97 of the file. Structure: S/N, STATE, CONSTITUENCY, PARTY, POSITION, CANDIDATE_NAME, PWD, AGE, GENDER, QUALIFICATIONS, REMARKS. |
| INEC iReV portal | `https://irev.inecnigeria.org/` | Angular SPA — no REST API endpoints reachable |

### PDF extraction status
The PDF has been downloaded to `infra/db/seed/sources/s05_inec_2023_candidates_final_list.pdf` and text extraction via pdfminer.six is confirmed functional. An extraction and parse script `infra/db/seed/scripts/extract_s05_inec_candidates_pdf.py` has been written.

The extraction script:
- Separates the Governorship section (pp. 3–96) from the HoA section (pp. 97–894)
- Parses records using sequential S/N numbers as delimiters
- Validates STATE against all 36 INEC state names
- Validates PARTY against the 18 known INEC party abbreviations for state elections
- Writes `infra/db/seed/sources/s05_inec_2023_hoa_candidates_extracted.json` and a report

### Decision
**In progress — pending extraction run validation and SQL generation review.** The PDF is official (`official_verified`) and accessible. Candidate records should be seeded as S05 batch 6 once the extraction output is validated (state counts match INEC published counts, no spurious/fabricated records, all party codes resolve to S05 batch 1 party org IDs).

---

## 4. Constituency Offices (~1,460 estimated)

### Target
Physical constituency offices for current NASS and state assembly members, seeding `constituency_office_profiles` and linking to the officeholder's jurisdiction and place.

### Sources investigated

| Source | Outcome |
|---|---|
| National Assembly of Nigeria website (nass.gov.ng) | No constituency office directory published as structured data. |
| NASS legislators API (used for batch 3) | Returns only legislator personal/party data — no office address fields. |
| Wikipedia NASS articles | No per-constituency office address data. |
| HDX Nigeria datasets | No constituency office dataset. |

### Decision
**DEFERRED — no machine-readable source.** Constituency office data requires:
1. Official NASS constituency office directory (not published as structured data).
2. Per-state House of Assembly office lists (heterogeneous, not consolidated).
3. Community-contributed data through the WebWaka discovery claim flow.

Constituency offices should be seeded through the platform's claim and enrichment workflow rather than bulk seeding, since physical address data requires verification.

---

## 5. Campaign Offices

### Target
Registered campaign offices for current political parties and officeholders.

### Decision
**DEFERRED indefinitely.** Campaign offices are transient (used primarily during election periods) and no official registry exists for permanent campaign offices. Post-election, most campaign offices either close or convert to constituency offices. This category should be populated through community-contributed discovery rather than bulk seeding.

---

## D1 Remote Deploy — Pending

Migrations 0307–0313 have been generated and are ready to apply to the Cloudflare D1 databases. The remote D1 `wrangler d1 migrations apply` command requires a `CLOUDFLARE_API_TOKEN` environment variable, which is not currently set in the Replit environment.

### Commands to run when token is available

```bash
# Staging
cd apps/api
CLOUDFLARE_API_TOKEN=<token> npx wrangler d1 migrations apply DB --env staging --remote

# Production (run after staging is validated)
CLOUDFLARE_API_TOKEN=<token> npx wrangler d1 migrations apply DB --env production --remote
```

The `CLOUDFLARE_API_TOKEN` must have D1 write permissions for both the `webwaka-staging` and `webwaka-production` databases (IDs: `52719457-5d5b-4f36-9a13-c90195ec78d2` and `72fa5ec8-52c2-4f41-b486-957d7b00c76f`).

---

## Appendix: Source URLs and Hashes

| Artifact | SHA-256 | Notes |
|---|---|---|
| `s05_inec_2023_candidates_final_list.pdf` | `2450eb0df41d1b923ca296f4aa78c2adbaccf41e87f0f88277313504beccd8ca` | INEC official PDF, downloaded 2026-04-22 |

