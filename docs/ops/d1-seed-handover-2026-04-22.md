# D1 Seed Handover — 2026-04-22

**Status:** Both staging and production D1 databases are at the 500 MB Cloudflare D1 free-tier
capacity limit. No further writes are possible until storage is expanded.  
**For the returning agent:** This document contains everything needed to resume seeding
the moment the D1 storage limit is lifted.

---

## 1. Database IDs

| Environment | D1 Name | Database ID |
|---|---|---|
| Staging | `webwaka-staging` | `52719457-5d5b-4f36-9a13-c90195ec78d2` |
| Production | `webwaka-production` | `72fa5ec8-52c2-4f41-b486-957d7b00c76f` |

Cloudflare account: `98174497603b3edc1ca0159402956161`  
Wrangler config: `apps/api/wrangler.toml`

---

## 2. Current Seed Apply Status

All `.bak` seed files that exist in `apps/api/migrations/` have been applied to both
staging and production. Production verified counts as of 2026-04-22:

| Seed file | Description | Staging | Production |
|---|---|---|---|
| `0306_political_polling_units_seed.sql.bak` | 176,846 INEC polling units | ✅ Applied | ✅ Applied |
| `0307_education_nemis_schools_seed.sql.bak` | 174,268 NEMIS schools | ✅ Applied | ✅ Applied |
| `0308_health_nhia_hcp_seed.sql.bak` | 6,539 NHIA HCP facilities | ✅ Applied | ✅ Applied |
| `0309_health_nphcda_phc_seed.sql.bak` | 26,711 NPHCDA PHC facilities | ✅ Applied | ✅ Applied |

Production entity counts after all 4 .bak files applied:
```
organizations (s06_school_*):  174,268
profiles (s06_school_*):       174,268
school_profiles:               167,820
private_school_profiles:        86,729
seed_ingestion_records (0307): 167,790
seed_entity_sources (0307):    174,268
search_entries (0307):         167,790
seed_raw_artifacts (nemis):          7
```

---

## 3. What Was Deferred Due to DB Full

Both databases hit the limit near the very end of 0307. Two things could not complete:

| Deferred item | Why deferred | Impact |
|---|---|---|
| `seed_search_rebuild_jobs` row for 0307 | 1-row INSERT — DB full | Bookkeeping only; no entity data lost |
| `DELETE FROM search_fts` + FTS rebuild | DB full + `SQLITE_CORRUPT_VTAB` on fragmented FTS | FTS index may be stale; re-run after upgrade |
| `seed_search_rebuild_jobs` for production 0307 | Same | Same |

To apply these after upgrade:
```bash
# Both staging and production — run after confirming DB has space:
npx wrangler d1 execute webwaka-staging --remote --command "INSERT OR IGNORE INTO seed_search_rebuild_jobs (id, seed_run_id, batch_name, status, entity_type, entity_count, search_entries_count, queued_at, started_at, completed_at, fts_rebuilt_at, notes, created_at, updated_at) VALUES ('seed_search_rebuild_s06_nemis_schools_20260421', 'seed_run_s06_nemis_schools_20260421', 'nemis-school-search-rebuild', 'completed', 'organization', 174268, 174268, unixepoch(), unixepoch(), unixepoch(), unixepoch(), 'NEMIS school search entries inserted; search_fts rebuilt at end of migration.', unixepoch(), unixepoch());"

npx wrangler d1 execute webwaka-production --remote --command "INSERT OR IGNORE INTO seed_search_rebuild_jobs (id, seed_run_id, batch_name, status, entity_type, entity_count, search_entries_count, queued_at, started_at, completed_at, fts_rebuilt_at, notes, created_at, updated_at) VALUES ('seed_search_rebuild_s06_nemis_schools_20260421', 'seed_run_s06_nemis_schools_20260421', 'nemis-school-search-rebuild', 'completed', 'organization', 174268, 174268, unixepoch(), unixepoch(), unixepoch(), unixepoch(), 'NEMIS school search entries inserted; search_fts rebuilt at end of migration.', unixepoch(), unixepoch());"
```

---

## 4. 0307 Apply Lessons — Critical Bugs Fixed

These bugs were discovered and fixed during the 0307 apply. Any future agent re-generating
or re-applying 0307 from the source `.bak` file must re-apply all three fixes.

### Bug 1: Corrupt continuation lines pass-through

**Source:** `apps/api/migrations/0307_education_nemis_schools_seed.sql.bak` (625 MB)  
**Pattern:** School names containing apostrophes (e.g. `ST. VINCENT'S PRIMARY SCHOOL`,
`PRESBYTERIAN NURSERY SCHOOL IGBOIMA BANA`) cause the SQL string to terminate early,
splitting a single INSERT row into two physical lines:
- Line N: the row with wrong column count (caught by column-count check, dropped)
- Line N+1: the garbled continuation (e.g. `NURSERYSCHOOLIGBOIMABANA''primary'NULL...`)

The column-count filter (v4) correctly dropped Line N but passed Line N+1 through as
a "header line". This garbled text then appeared inside the next INSERT block's VALUES,
causing a SQL syntax error.

**Fix (v5):** Also drop continuation lines that are inside an INSERT block, don't start
with `(`, don't start with `INSERT`/`VALUES`, and are not blank. These are orphaned
continuation fragments from corrupt rows.

**Script:** `/tmp/fix_0307_v5.py` — regenerate from
`apps/api/migrations/0307_education_nemis_schools_seed.sql.bak` to produce a clean SQL file.

**Result:** 4,438 bad rows dropped (column-count filter), 3,725 orphan continuation lines
dropped. 1,635,707 rows kept across all tables.

### Bug 2: `seed_raw_artifacts.seed_run_id = NULL`

**Pattern:** The 0307 source migration has `NULL` as the `seed_run_id` value for all 7
`seed_raw_artifacts` rows. The actual schema enforces `seed_run_id TEXT NOT NULL`.
`INSERT OR IGNORE` silently skipped all 7 rows. Since `seed_ingestion_records` has a FK
on `artifact_id → seed_raw_artifacts(id)`, the entire 167,790-row ingestion-records INSERT
then failed with `FOREIGN KEY constraint failed`.

**Fix:** Before applying `chunk_03_seed_raw_artifacts.sql`, replace `NULL` with the actual
seed run ID `'seed_run_s06_nemis_schools_20260421'` for all 7 artifact rows.

```python
# Replacement pattern (7 occurrences):
content = content.replace(
    "'seed_artifact_s06_<ID>', NULL, 'seed_source_nemis_school_directory_20260421'",
    "'seed_artifact_s06_<ID>', 'seed_run_s06_nemis_schools_20260421', 'seed_source_nemis_school_directory_20260421'"
)
```

All 7 artifact IDs:
- `seed_artifact_s06_16f140ed5d57a0cc248e9e27`
- `seed_artifact_s06_fb11f8e3f35484d58f717e28`
- `seed_artifact_s06_0cb4a546a908b2c0e2619196`
- `seed_artifact_s06_364b86285501ba1fe1c5e02b`
- `seed_artifact_s06_a201a2a328d86e9ec17f9acd`
- `seed_artifact_s06_c09dcd6a05fb699d7db7c143`
- `seed_artifact_s06_9761f086282a906d58ad3cfc`

### Bug 3: D1 `SQLITE_CORRUPT_VTAB` on `search_fts`

**Pattern:** After many large batch INSERTs, the `search_fts` FTS5 virtual table becomes
fragmented. A `DELETE FROM search_fts` or `INSERT INTO search_fts(search_fts) VALUES('rebuild')`
command returns `SQLITE_CORRUPT (extended: SQLITE_CORRUPT_VTAB)`.

**Fix:** Wait 30 seconds after heavy writes, then retry the FTS rebuild. If the error
persists, the FTS table may need to be dropped and re-created from `search_entries`.

---

## 5. General D1 Constraints Discovered

| Constraint | Impact | Workaround |
|---|---|---|
| `BEGIN TRANSACTION`/`COMMIT` rejected by D1 | All 0307 original SQL uses explicit transactions | Strip BEGIN/COMMIT before apply |
| `--command` flag hits 500 MB `/query` API limit | Any statement > ~100 KB fails on `/query` endpoint | Use `--file` flag (streaming import, bypasses size limit) |
| CPU time limit ~40–60 seconds per statement | Single INSERTs with 10K+ rows may time out | Split into table-boundary chunks < 5K rows or < 10 MB each |
| D1 `D1_RESET_DO` error | Transient; seen on chunk_06 school_profiles first apply | Wait 15–30 seconds and retry |
| D1 free tier 500 MB hard limit | Both DBs are now full | Requires Cloudflare D1 paid plan or larger quota |

---

## 6. Step-by-Step: Resume After D1 Storage Upgrade

### Step 1 — Verify space is available
```bash
# Should succeed without DB-size error:
npx wrangler d1 execute webwaka-staging --remote --command "SELECT 1;"
npx wrangler d1 execute webwaka-production --remote --command "SELECT 1;"
```

### Step 2 — Apply deferred bookkeeping rows (see Section 3 above)
Run both INSERT OR IGNORE commands for `seed_search_rebuild_jobs`.

### Step 3 — Rebuild FTS (both DBs)
```bash
npx wrangler d1 execute webwaka-staging --remote --command "INSERT INTO search_fts(search_fts) VALUES('rebuild');"
npx wrangler d1 execute webwaka-production --remote --command "INSERT INTO search_fts(search_fts) VALUES('rebuild');"
```

### Step 4 — Verify acceptance checks
```bash
# Run for both staging and production. Expected counts:
npx wrangler d1 execute webwaka-production --remote --command "
  SELECT
    (SELECT COUNT(*) FROM organizations WHERE id LIKE 'org_s06_school_%') as nemis_orgs,
    (SELECT COUNT(*) FROM school_profiles) as school_profs,
    (SELECT COUNT(*) FROM seed_ingestion_records WHERE seed_run_id='seed_run_s06_nemis_schools_20260421') as nemis_ingestion,
    (SELECT COUNT(*) FROM search_entries WHERE entity_id LIKE 'org_s06_school_%') as nemis_search,
    (SELECT COUNT(*) FROM seed_raw_artifacts WHERE source_id='seed_source_nemis_school_directory_20260421') as nemis_artifacts;"
# Expected: nemis_orgs=174268, school_profs≈167820, nemis_ingestion=167790, nemis_search≈167790, nemis_artifacts=7
```

### Step 5 — Apply next seed phases (S07 and beyond)

Future seed `.bak` and migration files should be generated per-phase and applied using
`wrangler d1 execute <db-name> --file=<path> --remote`. Do not use `--command` for large
files. Always split oversized files into table-boundary chunks first.

The `split_0307_clean.py` script in `/tmp/` (regenerate if not present) splits any cleaned
SQL into per-table chunk files. Adapt it for other seed files as needed.

---

## 7. Seeds Ready to Apply (Generated, Not Yet Applied)

As of 2026-04-22, the following future-phase SQL files have been generated and are waiting
for D1 space. See `docs/reports/` for source research reports.

| Phase | Migration file | Description | Status |
|---|---|---|---|
| S07 | TBD | CBN BDCs, NMDPRA fuel stations, PCN pharmacies | Research in progress — see Section 8 |
| S07 | TBD | NAICOM insurance agents, FRSC driving schools | Research in progress |
| S08 | TBD | NURTW motor parks, state transport parks | Pending source research |
| S09 | TBD | Markets, POS agents, commerce | Pending source research |

---

## 8. S07 Source Research Status (as of 2026-04-22)

Source probing performed during this session:

| Source | URL | Status |
|---|---|---|
| CBN BDC list | `https://www.cbn.gov.ng/supervision/inst-bdc.asp` | 404 — URL changed |
| NMDPRA retail outlets | `https://www.nmdpra.gov.ng` | Reachable; station finder is JS-rendered with internal API |
| PCN pharmacy register | `https://pcn.gov.ng/registrants/pharmacies` | 404 |

Active research continues in this session. Results will be added to
`docs/reports/phase-s07-regulated-commercial-source-manifest-2026-04-22.md`.

---

## 9. Tooling Files

All scripts referenced below should be regenerated from scratch if `/tmp/` is cleared
(Replit container restarts wipe `/tmp/`).

| Script | Purpose | Regeneration source |
|---|---|---|
| `/tmp/fix_0307_v5.py` | Clean 0307 source SQL (column-count + continuation-line filter) | Documented in full in Bug Fix 1 above |
| `/tmp/split_0307_clean.py` | Split cleaned SQL into table-boundary chunks | Commit `fa43f5a` — `split_0307_clean.py` in repo root or `/tmp/` |
| `/tmp/0307_d1safe_clean.sql` | Cleaned 0307 source (622.5 MB) | Re-run fix_0307_v5.py on `.bak` file |
| `/tmp/0307c_chunk_*.sql` | 15 table-boundary chunks | Re-run split_0307_clean.py on cleaned file |

---

## 10. Planning Document

Master implementation plan: `docs/planning/nationwide-entity-seeding-implementation-plan-2026-04-21.md`

The next phases after D1 upgrade (in priority order):
1. **S06 remaining** — PCN pharmacies, MDCN/NMCN registered practitioners
2. **S07** — CBN BDCs, NMDPRA fuel/gas stations, PCN pharmacies, NAICOM, NIPOST, FRSC
3. **S08** — NURTW motor parks, state transport parks, mass transit
4. **S09** — Markets, POS agents, informal commerce
5. **S10** — Civic, faith, NGO, cooperative
6. **S11** — Agriculture, food systems
7. **S12** — Professional, creator, media
8. **S13** — Long-tail vertical completion + every-LGA floor
9. **S14** — Search rebuild, claim readiness, publication, refresh loops
