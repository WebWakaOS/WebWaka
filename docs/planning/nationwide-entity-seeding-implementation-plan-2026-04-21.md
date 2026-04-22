# WebWaka OS — Nationwide Entity Seeding Implementation Plan

**Date:** 2026-04-21  
**Purpose:** Phase-by-phase execution plan for 100% nationwide seeded data, with rigorous research, extraction, reconciliation, deduplication, enrichment, dependency-aware implementation, and recurring enhancement loops.  
**Primary inputs reviewed:** platform migrations, vertical registry, seed files, seed inventory reports, governance invariants, implementation roadmap, event/search projection code, and current Replit project memory.  
**Canonical inventory companion:** `docs/reports/webwaka-entity-seeding-nationwide-inventory-2026-04-21.md`  

---

## 1. Definition of “100% Seeded Data”

For WebWaka OS, “100% seeded” does **not** mean dumping every possible name into the database. It means:

1. Every authoritative public or obtainable source for a target dataset has been identified, dated, downloaded or captured, and preserved in a research pack.
2. Every extracted row has source provenance, source timestamp, extraction method, confidence level, and reconciliation notes.
3. Duplicates, stale records, renamed entities, moved entities, closed entities, and conflicting source claims are resolved before production insertion.
4. Every root entity is seeded in dependency order:
   - `places`
   - `jurisdictions`
   - `verticals`
   - `individuals`, `organizations`, or facility `places`
   - global `profiles`
   - vertical-specific `*_profiles`
   - relationship, political, workspace, and search-index records where applicable
5. Every seeded profile is rich enough for discovery, claim conversion, verification, and later workspace activation.
6. Every seed batch is repeatable, idempotent, reversible where safe, and refreshable when official sources change.
7. Every phase has acceptance checks that future agents can run without needing the original planner.

The goal is nationwide completeness with explicit confidence levels:

| Confidence | Meaning | Production behavior |
|---|---|---|
| Official verified | Regulator, ministry, commission, licensed register, or official bulk data | Seed as verified source data; claim state still starts as `seeded` unless product rules say otherwise |
| Official but stale | Official source exists but publication date is old or superseded in news/regulatory notices | Seed only after cross-check and mark stale-source risk |
| Public high-confidence | OSM, Google Places, reputable directories, association sites, official websites | Seed as discoverable but unverified |
| Field/partner collected | Partner agents, LGA outreach, direct association submissions | Seed only with collector metadata and review state |
| Market-estimate placeholder | Statistical density assumption without named entity evidence | Do not seed as real entity; use only to prioritize field collection |

---

## 2. Codebase Reality Map

The current platform already has the core discovery and vertical architecture, but large-scale data seeding must respect its constraints.

### 2.1 Core tables and dependencies

| Layer | Table / artifact | File | Role in seeding |
|---|---|---|---|
| Geography | `places` | `apps/api/migrations/0001_init_places.sql` | Shared country, zone, state, LGA, ward, and facility place hierarchy; `primary_place_id` depends on this |
| Root entities | `individuals`, `organizations` | `apps/api/migrations/0002_init_entities.sql` | Root subjects for people and organizations; both currently require `tenant_id` |
| Workspaces | `workspaces`, `memberships` | `apps/api/migrations/0003_init_workspaces_memberships.sql` | Required by many vertical profile tables through `workspace_id` |
| Profiles | `profiles` | `apps/api/migrations/0005_init_profiles.sql` | Claim-first discovery surface; subject can be individual, organization, or place |
| Political geography | `jurisdictions`, `terms`, `political_assignments`, `party_affiliations`, `candidate_records` | `apps/api/migrations/0006_init_political.sql` | Required for politicians, ward reps, constituencies, parties, candidates, and polling-unit context |
| Search | `search_entries`, `search_fts` | `apps/api/migrations/0008_init_search_index.sql` | Discovery search projection |
| Claim workflow | `claim_requests` and profile state transitions | `apps/api/migrations/0010_claim_workflow.sql` and routes | Converts `seeded` profiles into owned tenant workspaces |
| Vertical registry | `verticals` | `apps/api/migrations/0036_verticals_table.sql`; source CSV `infra/db/seeds/0004_verticals-master.csv` | Registry for 159 current vertical rows across 13 categories |
| Workspace vertical state | `workspace_verticals` | `apps/api/migrations/0047_workspace_verticals.sql` | Per-workspace activation state for a vertical |
| Vertical profile tables | many `*_profiles` | `apps/api/migrations/0048` onward | Sector-specific data, most requiring `workspace_id` and `tenant_id` |

### 2.2 Current seed source files

| File | Current status | Required action |
|---|---|---|
| `infra/db/seed/nigeria_country.sql` | Exists | Verify applied before dependent phases |
| `infra/db/seed/nigeria_zones.sql` | Exists | Verify 6 zones and ancestry |
| `infra/db/seed/nigeria_states.sql` | Exists | Verify 37 states/FCT and ancestry |
| `infra/db/seed/0002_lgas.sql` | Exists | Verify 774 LGAs and parent state links |
| `infra/db/seed/0003_wards.sql` | Exists with 8,810 local rows | Reconcile against INEC official 8,809 wards/RAs before production use |
| `infra/db/seeds/0004_verticals-master.csv` | Exists with 159 current rows | Convert to idempotent SQL and reconcile “160” documentation references |

### 2.3 Current vertical registry shape

| Category | Total | P1 | P2 | P3 | Individual | Organization | Place |
|---|---:|---:|---:|---:|---:|---:|---:|
| agricultural | 12 | 0 | 3 | 9 | 1 | 8 | 3 |
| civic | 13 | 3 | 1 | 9 | 0 | 13 | 0 |
| commerce | 54 | 2 | 27 | 25 | 8 | 44 | 2 |
| creator | 8 | 1 | 3 | 4 | 4 | 4 | 0 |
| education | 8 | 1 | 2 | 5 | 1 | 7 | 0 |
| financial | 6 | 0 | 2 | 4 | 3 | 3 | 0 |
| health | 11 | 1 | 7 | 3 | 0 | 11 | 0 |
| institutional | 1 | 0 | 0 | 1 | 0 | 1 | 0 |
| media | 3 | 0 | 1 | 2 | 0 | 3 | 0 |
| place | 8 | 2 | 4 | 2 | 0 | 1 | 7 |
| politics | 7 | 2 | 1 | 4 | 3 | 2 | 2 |
| professional | 13 | 1 | 6 | 6 | 8 | 5 | 0 |
| transport | 15 | 4 | 5 | 6 | 1 | 12 | 2 |

Priority 1 slugs are:

`politician`, `political-party`, `motor-park`, `mass-transit`, `rideshare`, `haulage`, `church`, `ngo`, `cooperative`, `pos-business`, `market`, `professional`, `school`, `clinic`, `creator`, `sole-trader`, `tech-hub`.

### 2.4 Critical architectural implications

1. `profiles.primary_place_id` references `places`, so geography must be complete before profile seeding.
2. `politician_profiles.jurisdiction_id` and political assignment records require `jurisdictions`, so political seeding must wait for place and jurisdiction completion.
3. Most vertical profile tables require `workspace_id` and `tenant_id`; because pre-claim seeded records are not yet owned by real tenants, a platform seed tenant/workspace strategy is required before mass insertion.
4. Existing vertical profile schemas are uneven. Some have rich fields; many only include minimal FSM fields. A provenance/enrichment sidecar is required so rich source data is not lost when table schemas are sparse.
5. `search_entries` has `keywords` and `ancestry_path` as required fields, while the current event projection only inserts a subset. Seeding must include a direct search rebuild script or improve the projection before large profile publication.
6. Several verticals are synonyms or overlapping universes. Examples include fuel station vs petrol station, NURTW vs road transport union, gym vs gym-fitness, laundry vs laundry-service, tailor vs tailoring-fashion. These must be resolved before extraction to prevent duplicate profiles.

---

## 3. Universal Seeding Contract for Every Phase

Every phase must follow this contract before any data reaches production.

### 3.1 Research pack

Each phase must produce a dated research pack containing:

- Source inventory table with owner, URL, access method, publication date, license/terms, and retrieval date.
- Official source priority order.
- Secondary source priority order.
- Known source conflicts.
- Regulatory definitions and field meanings.
- Coverage estimate by state, LGA, and where possible ward.
- Data freshness assessment.
- Source screenshots or exported files where live portals can change.

### 3.2 Extraction pack

Each phase must produce:

- Raw source files, unchanged.
- Normalized CSV/JSONL extracts.
- Extraction scripts.
- Source hash for every raw file.
- Schema mapping from source fields to WebWaka fields.
- Failed extraction report.
- Rows requiring manual review.

### 3.3 Reconciliation and dedupe pack

Every entity must pass a dedupe and reconciliation pipeline using phase-appropriate keys:

| Entity type | Strong dedupe keys | Secondary dedupe keys |
|---|---|---|
| Place/facility | official facility ID, polling-unit code, license number, coordinates within tolerance | normalized name, address, ward/LGA, operator |
| Organization | CAC/IT number, regulator license, official registry ID | normalized name, phone, website, address, directors/contacts where public |
| Individual | official candidate ID, professional license, office assignment, NIN only if legally available and never exposed | normalized name, date of birth if public, jurisdiction, party, role, source image |
| Association/group | registration number, umbrella body ID | normalized name, state/LGA, leadership, meeting location |

No phase may rely on a single fuzzy name match when a regulator ID, facility ID, polling-unit code, or license number exists.

### 3.4 Enrichment standard

For every seeded entity, agents must collect as much of the following as legally and publicly available:

- Canonical name and known aliases.
- Entity type and vertical slug.
- Full address, state, LGA, ward, and coordinates.
- Phone, email, website, social links, and public contact channels.
- Registration or license numbers.
- Regulator, association, or parent-body affiliation.
- Operating status and source date.
- Opening hours or service availability where relevant.
- Founder/leader/contact person where public and safe.
- Sector-specific fields required by the vertical profile table.
- Source URLs and confidence scores.
- Last reviewed timestamp.

If the current vertical table does not have a field for a rich attribute, store it in the phase provenance/enrichment sidecar until a schema enhancement is approved.

### 3.5 Implementation pattern

Each dataset must load in this order:

1. Validate prerequisite phases.
2. Insert or update platform seed tenant/workspace records where needed.
3. Insert facility `places` when the entity is a physical location or when a facility place is required for discovery.
4. Insert root `individuals` or `organizations` where applicable.
5. Insert `profiles` with:
   - `claim_state = 'seeded'`
   - `verification_state = 'unverified'` unless official verification has a supported state
   - `publication_state = 'published'` only after QA approval
   - `primary_place_id` resolved to the most specific valid place
6. Insert vertical-specific `*_profiles`.
7. Insert relationship, jurisdiction, political, workspace vertical, and source metadata records.
8. Rebuild `search_entries` and `search_fts`.
9. Run acceptance queries and produce a phase completion report.

---

## 4. Agent Call-Up Format

When a future phase is called up, use this exact format:

```text
Execute Phase Sxx: [phase name]
Primary objective:
Required source research:
Required target tables:
Required verticals:
Dependencies to verify:
Expected output:
Acceptance checks:
```

Each executing agent group should include these roles:

| Role | Responsibility |
|---|---|
| Research agent | Finds official and secondary sources; prepares source ranking and freshness assessment |
| Extraction agent | Downloads, scrapes, parses, and normalizes raw data |
| Reconciliation agent | Deduplicates, resolves conflicts, maps records to geography, assigns confidence |
| Schema/seed agent | Writes idempotent migrations/scripts and maps rows into root/profile/vertical tables |
| QA agent | Runs acceptance queries, count checks, source coverage checks, and duplicate checks |
| Documentation agent | Updates the phase report, source manifest, runbook, and known gaps |

No agent should start insertion until the research, extraction, and reconciliation packs are complete.

---

## 5. Master Dependency Graph

```text
S00 control plane and provenance
  → S01 geography reconciliation
    → S02 vertical registry and synonym map
      → S03 jurisdiction and administrative boundaries
        → S04 seed tenant/workspace and ingestion tooling
          → S05 political and electoral foundation
          → S06 education and health official registries
          → S07 regulated commercial and financial registries
          → S08 transport and mobility registries
          → S09 markets, commerce, POS, hospitality, and informal economy
          → S10 civic, faith, NGO, cooperative, and community bodies
          → S11 agriculture, food systems, and supply-chain entities
          → S12 professional, creator, media, and knowledge-economy entities
          → S13 long-tail vertical completion and every-LGA floor fill
            → S14 search, claim readiness, publication, monitoring, and refresh loops
```

S05 through S12 can run in parallel only after S00 through S04 are complete. S13 depends on the coverage reports from S05 through S12. S14 is finalization and continuous refresh.

---

## 6. Phase S00 — Seeding Control Plane and Provenance Foundation

**Objective:** Build the metadata and operational foundation that makes national seeding auditable, repeatable, and refreshable.

**Blocked by:** none  
**Blocks:** every other phase

### Scope

- Define platform seed tenant and platform seed workspace strategy.
- Add or designate tables for seed runs, source manifests, raw extract manifests, dedupe decisions, entity source links, confidence scores, and refresh history.
- Define canonical ID strategy for seeded rows.
- Define source confidence taxonomy.
- Define data-retention and NDPR rules for public-person data.
- Define rollback and correction process.

### Required codebase decisions

1. Because `individuals` and `organizations` require `tenant_id`, create a stable platform seed tenant such as `tenant_platform_seed` and one or more seed workspaces such as `workspace_platform_seed_discovery`.
2. Because vertical profile tables require `workspace_id`, every seeded vertical profile must use the platform seed workspace until claimed.
3. Because rich source metadata does not fit uniformly into existing vertical tables, add sidecar tables before large ingestion.
4. Because seeded data will be refreshed repeatedly, every seed script must be idempotent and key off canonical source identity.

### Recommended metadata tables

| Table | Purpose |
|---|---|
| `seed_runs` | One row per phase/batch execution |
| `seed_sources` | Source registry with owner, URL, publication date, retrieval date, license, source hash |
| `seed_raw_artifacts` | Raw files and extracted file manifests |
| `seed_entity_sources` | Many-to-many mapping from WebWaka entity/profile to source rows |
| `seed_dedupe_decisions` | Human/machine dedupe decisions and reasons |
| `seed_enrichment` | JSON sidecar for rich attributes not yet represented in vertical tables |
| `seed_coverage_snapshots` | Counts by state, LGA, ward, vertical, and confidence |

### Research requirements

- Review all current governance documents for tenant isolation, claim-first lifecycle, NDPR, and political/medical/legal sensitivity.
- Review all current profile table schemas and identify missing columns for rich seed data.
- Review data licensing constraints for OSM, Google Places, official registries, and government portals.

### Acceptance checks

- A seed tenant and seed workspace strategy is documented and implemented.
- Every future seed row can reference a source, run, confidence score, and dedupe decision.
- A standard source manifest template exists.
- A standard phase completion report template exists.
- A rollback/correction policy exists for bad seed batches.

---

## 7. Phase S01 — Geography Foundation and Ward Reconciliation

**Objective:** Establish canonical Nigerian geography as the immutable discovery hierarchy.

**Blocked by:** S00  
**Blocks:** all profile and jurisdiction seeding

### Target data

| Dataset | Target |
|---|---:|
| Nigeria root | 1 |
| Geopolitical zones | 6 |
| States/FCT | 37 |
| LGAs | 774 |
| Wards / registration areas | 8,809 official INEC target; local file currently has 8,810 |

### Source research

- INEC ward/registration-area data.
- INEC polling-unit locator and delimitation references.
- NBS/NIMC LGA/state roster.
- Official state/LGA references for spelling variants.
- Existing `infra/db/seed` SQL files.

### Implementation order

1. Verify country, zone, state, and LGA seeds.
2. Audit `infra/db/seed/0003_wards.sql` against official INEC ward/RA list.
3. Identify the one-row discrepancy: duplicate, renamed ward, non-INEC local administrative ward, or generation artifact.
4. Decide whether to correct to 8,809 or document an accepted source variance.
5. Apply geography seeds in dependency order.
6. Verify every `ancestry_path` is valid and every non-root node has a valid parent.

### Enrichment

- Store alternate spellings and source aliases in seed enrichment metadata.
- Preserve source ward codes where available.
- Map each ward to LGA, state, zone, and country.

### Acceptance checks

- Country count = 1.
- Zone count = 6.
- State/FCT count = 37.
- LGA count = 774.
- Ward count equals the accepted canonical number.
- No orphan `places.parent_id`.
- No invalid `ancestry_path`.
- Every LGA has at least one ward unless the accepted official source says otherwise.

---

## 8. Phase S02 — Vertical Registry, Synonym Map, and Seedability Matrix

**Objective:** Load and reconcile the vertical registry before any vertical profile data is seeded.

**Blocked by:** S00  
**Blocks:** all vertical-specific profile seeding

### Target data

- `infra/db/seeds/0004_verticals-master.csv`
- `verticals` table
- `workspace_verticals` dependency model
- Vertical synonym and duplicate-resolution map

### Source research

- Current CSV registry.
- Vertical package directories.
- Vertical migration files.
- Existing execution prompts for vertical batches.
- Product docs defining priority P1/P2/P3 and milestones M8b–M12.

### Implementation order

1. Reconcile documentation references to 160 verticals against the current CSV count of 159 rows.
2. Convert the CSV to idempotent SQL inserts.
3. Load `verticals`.
4. Create a synonym map before seeding overlapping verticals.
5. Mark verticals whose profile table exists, partially exists, or is missing.
6. Mark verticals whose table schema is too sparse for rich seeded data and requires sidecar enrichment.

### Known synonym/overlap checks

- `fuel-station` and `petrol-station`
- `nurtw` and `road-transport-union`
- `laundry` and `laundry-service`
- `gym` and `gym-fitness`
- `tailor` and `tailoring-fashion`
- `church`, branch churches, and denominational headquarters
- `school`, `govt-school`, `private-school`, tertiary institutions, and vocational/training institutes
- `clinic`, hospitals, PHC/community-health, pharmacy, dental, optical, and vet clinic

### Acceptance checks

- `verticals` row count matches the accepted registry count.
- Every vertical has unique `id` and `slug`.
- Every vertical maps to a valid `entity_type`.
- Every planned seeded vertical has a target root table and target profile table.
- Every duplicate/synonym vertical has a canonical seeding decision.

---

## 9. Phase S03 — Jurisdictions and Administrative Boundaries

**Objective:** Build the jurisdiction layer required for political, electoral, civic, and administrative data.

**Blocked by:** S01  
**Blocks:** political profiles, ward reps, constituency offices, polling units, government offices

### Target data

- Ward jurisdictions.
- LGA jurisdictions.
- State/FCT jurisdictions.
- Senatorial districts.
- Federal constituencies.
- State constituencies.
- National/federal jurisdiction records.

### Source research

- INEC constituency maps.
- National Assembly constituency records.
- State Assembly constituency lists.
- State electoral commission records where available.
- ALGON and state government LGA records.

### Implementation order

1. Seed jurisdiction records for country, state, LGA, and ward places.
2. Build constituency place/jurisdiction representation where no existing place exists.
3. Seed senatorial districts.
4. Seed federal constituencies.
5. Seed state constituencies.
6. Link each jurisdiction to source provenance.

### Acceptance checks

- Every ward has one ward jurisdiction.
- Every LGA has one LGA jurisdiction.
- Every state/FCT has one state jurisdiction.
- 109 senatorial jurisdictions exist.
- 360 federal constituency jurisdictions exist.
- State constituency count matches the accepted current assembly count after research.
- No political profile phase can start until this phase passes.

### Implementation status — 2026-04-21

S03 has been implemented in `infra/db/migrations/0303_jurisdiction_seed.sql`, mirrored to `apps/api/migrations/0303_jurisdiction_seed.sql`, with standalone seed `infra/db/seed/0005_jurisdictions.sql`. Validation confirmed 11,080 jurisdictions and 11,080 jurisdiction provenance links.

The official INEC constituency workbook retrieved during S03 contains 990 state constituency code rows. Public 2023 references to 993 State Houses of Assembly seats remain documented as a source variance in `docs/reports/phase-s03-jurisdiction-source-manifest-2026-04-21.md`; no unsupported extra rows were fabricated.

---

## 10. Phase S04 — Ingestion Tooling, Seed Tenant, and Search Rebuild Readiness

**Objective:** Make the database ready for safe high-volume insertion and discovery publication.

**Blocked by:** S00, S01, S02  
**Blocks:** all entity batches

### Scope

- Platform seed tenant/workspace.
- Idempotent bulk upsert scripts.
- Source-to-WebWaka ID generator.
- LGA/ward geocoder and place resolver.
- Duplicate detector.
- Search-entry builder.
- Batch QA query library.

### Implementation requirements

1. Create stable IDs from source identity, not random UUIDs, for repeatable seeding.
2. Resolve every profile to the most specific valid `primary_place_id`.
3. Build keywords from canonical name, aliases, vertical, LGA, state, registration numbers where safe, and service categories.
4. Populate `search_entries.keywords` and `search_entries.ancestry_path`.
5. Rebuild FTS after each approved batch.
6. Store all raw source metadata in sidecar tables.

### Acceptance checks

- Running the same seed batch twice does not duplicate entities.
- A bad batch can be isolated by `seed_run_id`.
- Search rows can be generated for seeded profiles.
- Every inserted root entity has a source link.
- Every inserted profile has a valid `primary_place_id`.

### S04 Implementation Status — Completed 2026-04-21

S04 has been implemented in `infra/db/migrations/0304_ingestion_tooling_seed.sql`, mirrored to `apps/api/migrations/0304_ingestion_tooling_seed.sql`, with reusable TypeScript tooling at `infra/db/seed/scripts/nationwide_ingestion_tooling.ts`.

The implementation adds `seed_ingestion_records`, `seed_identity_map`, `seed_place_resolutions`, `seed_search_rebuild_jobs`, and `seed_qa_query_library`, plus S04 seed-run/source/artifact provenance and a source link for `org_platform_seed`.

Validation confirmed deterministic ID generation, most-specific place resolution, duplicate candidate grouping, search-entry generation, FTS rebuild readiness, idempotent migration reruns, source-run isolation by `seed_run_id`, and 8 reusable QA checks for downstream batches.

S04 reports are available at `docs/reports/phase-s04-ingestion-tooling-completion-report-2026-04-21.md` and `docs/reports/phase-s04-ingestion-tooling-source-manifest-2026-04-21.md`.

---

## 11. Phase S05 — Political and Electoral Foundation

**Objective:** Seed the civic/political graph that drives high-value public discovery and constituency accountability.

**Blocked by:** S01, S02, S03, S04  
**Can run parallel with:** S06–S12 after dependencies

### Target datasets

| Dataset | Current canonical target |
|---|---:|
| Current INEC political parties | 21 |
| 2023 election parties | 18 |
| Polling units | 176,846 |
| Current elected officials | about 11,891 |
| Ward reps / councillors | 8,809 target where source exists |
| Senators | 109 |
| House of Representatives | 360 |
| Governors/deputies | 72 |
| LGA chairmen/deputies | 1,548 |
| Constituency offices | about 1,460 |
| 2023 candidates/contestants | 15,331 |

### Vertical targets

- `politician_profiles`
- `political_party_profiles`
- `ward_rep_profiles`
- `constituency_office_profiles`
- `campaign_office_profiles`
- `polling_unit_profiles`
- `government_agency_profiles` for LGA/state/federal offices where relevant

### Source research

- INEC current party register.
- INEC 2023 candidate list and election result records.
- INEC polling-unit register and locator.
- National Assembly member directory.
- State assembly official directories.
- State electoral commission and LGA election records.
- Official government websites for governors, deputies, commissioners, and LGA chairpersons.
- Party websites and national/state chapter directories.

### Reconciliation rules

- Party names and acronyms must reconcile to current INEC register.
- Individuals with multiple offices or historical records must have separate term/assignment records, not duplicate root individuals.
- Polling units must dedupe by official PU code first.
- Ward reps must not be guessed from ward existence; only seed named officials when source-backed.
- Constituency offices must link to an elected office, jurisdiction, and physical place where available.

### Implementation order

1. Political party organizations and profiles.
2. Terms and election cycles.
3. Polling-unit facility places and polling-unit profiles.
4. Current officeholder individuals.
5. Political profiles for current officeholders.
6. Political assignments and party affiliations.
7. Candidate records for 2023 and later historical cycles.
8. Constituency offices and campaign offices.
9. Search rebuild and political coverage report.

### Acceptance checks

- 21 current parties are seeded with source links.
- 176,846 polling units are seeded or every missing unit is explained.
- Every politician profile has a jurisdiction.
- Every political assignment has a term.
- No duplicate politician exists for the same person/office/jurisdiction/term.
- Every political profile is searchable by name, office, LGA/state, and party where applicable.

### S05 Implementation Status — In Progress 2026-04-21

S05 batch 1 has been implemented in `infra/db/migrations/0305_political_foundation_seed.sql`, mirrored to `apps/api/migrations/0305_political_foundation_seed.sql`, with standalone seed `infra/db/seed/0006_political_parties.sql`.

The batch seeds the 21 current official INEC political parties as source-backed `organizations`, `profiles`, `political_party_profiles`, and `search_entries`; adds S04 `seed_ingestion_records`, `seed_identity_map`, `seed_place_resolutions`, `seed_enrichment`, and `seed_entity_sources` rows; creates `seed_election_cycles`; and records election-cycle and term scaffolds for later S05 assignment/candidate batches.

Validation confirmed 21 party organizations, 21 discovery profiles, 21 political-party vertical profiles, 21 search entries, 21 organization source links, 21 identity-map rows, 21 ingestion sidecar rows, 21 country-level place resolutions, 2 election-cycle locator rows, 4 term scaffold rows, FTS search visibility for APC, no invalid party `primary_place_id` references, and idempotent reruns.

S05 batch 2 has been implemented in `infra/db/migrations/0306_political_polling_units_seed.sql`, mirrored to `apps/api/migrations/0306_political_polling_units_seed.sql`, with standalone seed `infra/db/seed/0007_polling_units.sql`. It seeds all 176,846 official INEC CVR polling units as source-backed polling-unit facility places, discovery profiles, `polling_unit_profiles`, search entries, S04 sidecars, source identity maps, place resolutions, and provenance links.

Polling-unit reconciliation confirmed 176,846 unique source records, 176,846 unique official composite polling-unit codes, 0 duplicate codes, all 774 LGAs resolved to canonical S01 places, 8,603 of 8,810 INEC registration areas matched directly to canonical wards, and 207 registration-area rows covering 4,313 polling units resolved by documented LGA fallback with 0 state-only fallbacks.

S05 batch 3 has been implemented in `infra/db/migrations/0311_political_senators_reps_seed.sql`, mirrored to `apps/api/migrations/0311_political_senators_reps_seed.sql`, with standalone seed `infra/db/seed/0012_political_senators_reps.sql`. The batch fetches the official National Assembly legislators API (`https://nass.gov.ng/mps/get_legislators/?chamber=1|2`), normalizes 319 published rows, resolves them against S05 batch 1 parties and `0303_jurisdiction_seed.sql` senatorial-district / federal-constituency places using a strict uniqueness-gated fuzzy matcher, and seeds 318 NASS-published legislators (74/74 senators, 244/245 representatives) as `individuals` + `profiles` + `politician_profiles` + `political_assignments` (term `term_ng_10th_national_assembly_2023_2027`) + `party_affiliations`, with full S04 provenance sidecars and search rows. The remaining gap of 35 senators and 115 representatives is an upstream NASS-API publication gap and is *not fabricated*; it is documented for follow-on batches against `senate.gov.ng` and the 2023 INEC final-list-of-candidates PDF. One representative row (`Katsina | Katsina North Central`) was deferred for source ambiguity.

S05 batch 4 has been implemented in `infra/db/migrations/0312_political_governors_seed.sql`, mirrored to `apps/api/migrations/0312_political_governors_seed.sql`, with standalone seed `infra/db/seed/0013_political_governors.sql` (all three byte-identical, SHA-256 `d807865d2298b1459a20bcbb4ee8f9102adeedb382ff6526f351d713ecffcca9`). The batch parses the canonical Wikipedia state-governor table (`https://en.wikipedia.org/wiki/List_of_current_state_governors_in_Nigeria`) for all 36 states' governor, deputy governor, party, took-office year, and term-end year, cross-validates every governor name against the official Nigeria Governors' Forum public listing (`https://nggovernorsforum.org/index.php/the-ngf/governors`) — 23 exact and 13 honorific-only matches, 0 divergences — and seeds 72 individuals (36 governors at `verification_state=source_verified`, 36 deputy governors at `editorial_verified`) as `individuals` + `profiles` + `politician_profiles` + `political_assignments` + `party_affiliations`, with `seed_entity_sources` rows from both NGF (governors only, `official_verified`) and Wikipedia (both offices, `editorial_verified`). Eight off-cycle states (Anambra, Bayelsa, Edo, Ekiti, Imo, Kogi, Ondo, Osun) each receive their own term row in this migration; the 28 on-cycle states reuse `term_ng_state_executive_general_2023_2027` from S05 batch 1. Party affiliation distribution: APC=62, PDP=4, LP=2, APGA=2, Accord=2 (per individual). The migration is idempotent (`INSERT OR IGNORE`, deterministic SHA-256 stable IDs); a stub-schema sqlite3 harness confirmed second-apply produces identical row counts.

S05 batch 5 has been implemented in `infra/db/migrations/0313_political_lagos_assembly_seed.sql`, mirrored to `apps/api/migrations/0313_political_lagos_assembly_seed.sql`, with standalone seed `infra/db/seed/0014_political_lagos_assembly.sql` (all three byte-identical, SHA-256 `1737576853a246059eeddb63615c4e3642cf8062a05a90a6c4c810302eadaff3`). The batch parses the Wikipedia "List of members of the Lagos State House of Assembly (2023–2027)" (cross-validated against the official Lagos State House of Assembly website) for all 40 Lagos constituencies and seeds 40 individuals as `individuals` + `profiles` + `politician_profiles` + `political_assignments` (term `term_ng_lagos_state_assembly_10th_2023_2027`) + `party_affiliations` (APC=38, LP=2), with full S04 provenance sidecars and search rows. All 40 constituencies resolved to S03 place IDs. Idempotency validated in stub-schema sqlite3 harness (17/17 checks pass). Source artifact: `s05_lagos_assembly_normalized_20260422.json` (SHA-256 `88c424ed10fdaf698154bfd5e60ff6afeb06eab06bc5fcaa2b83e062ad4956b0`). This is the only state-assembly Wikipedia page found across all 36 states; the remaining 35 states' assembly members require per-state official directory batches.

S05 batch 6 is complete. The official INEC "Final List of Candidates for State Elections" PDF (14.4 MB, 894 pages, SHA-256 `2450eb0df41d1b923ca296f4aa78c2adbaccf41e87f0f88277313504beccd8ca`) was extracted (v5 extractor, 98.5% accuracy) and SQL migrations generated in two parts: `0314_political_inec_hoa_candidates_seed.sql` (SHA-256 `0b57bb9c4f3f13b69e21d1dcd892785ed3b48b386183a7e7c95871b16ce5cea7`) and `0314b_political_inec_hoa_candidates_seed.sql` (SHA-256 `cd5afe68731135cf5002d4326a2943c566ede2405099af66ae504ae261dfc074`). Combined: 8,825 individuals, 8,825 profiles, 8,825 politician_profiles, 8,825 party_affiliations, 8,489 candidate_records, 8,825 seed sidecars. 145 garbled extraction rows discarded. 337 candidates have no jurisdiction match (individual still seeded). Both migrations pass stub-SQLite validation and double-apply idempotency. Mirrored to `apps/api/migrations/` (byte-identical).

Outstanding S05 items: (1) migrations 0307–0314b are NOT yet applied to remote Cloudflare D1 — pending `CLOUDFLARE_API_TOKEN`; (2) LGA chairs (774 LGAs) — no consolidated national source, requires 36 per-state SIEC batches; (3) state assembly members for 35 non-Lagos states — requires per-state official directory batches; (4) constituency and ward-rep offices — no machine-readable consolidated source. Ward representatives and campaign offices are deferred indefinitely. Full deferred-items research is at `docs/reports/phase-s05-deferred-items-source-research-2026-04-22.md`.

D1 remote deploy: migrations 0307–0313 are generated and validated but NOT yet applied to remote Cloudflare D1. Requires `CLOUDFLARE_API_TOKEN` env var. Commands: `CLOUDFLARE_API_TOKEN=<token> npx wrangler d1 migrations apply DB --env staging --remote` then repeat for `production` once staging is validated.

S05 reports are available at `docs/reports/phase-s05-political-foundation-progress-report-2026-04-21.md`, `docs/reports/phase-s05-political-foundation-source-manifest-2026-04-21.md`, `docs/reports/phase-s05-political-foundation-polling-units-report-2026-04-21.md`, `docs/reports/phase-s05-political-foundation-senators-reps-report-2026-04-21.md`, `docs/reports/phase-s05-political-foundation-governors-report-2026-04-21.md`, `docs/reports/phase-s05-deferred-items-source-research-2026-04-22.md`, and `docs/reports/phase-s05-political-foundation-coverage-report-2026-04-22.md`.

---

## 12. Phase S06 — Education and Health Official Registries

**Objective:** Seed high-trust public-service discovery categories with authoritative official data before commercial long-tail data.

**Blocked by:** S01, S02, S04

### Target datasets

| Dataset | Canonical target / source baseline |
|---|---:|
| Public UBE schools | 79,775 |
| Private UBE schools | 91,252 |
| Total UBEC UBE schools | 171,027 |
| Hospitals/clinics from Nigeria HFR | about 38,815 |
| PHC/community health networks | reconcile separately from HFR |
| Pharmacies | PCN/NHIA source-dependent |
| Professional health workers | MDCN/NMCN/PCN source-dependent |

### Vertical targets

- `school_profiles`
- government school and private school verticals where tables exist or are added
- `clinic_profiles`
- `community_health_profiles`
- `pharmacy_chain_profiles`
- `professional_profiles` for doctors, pharmacists, nurses, and related licensed professionals
- specialist clinic verticals such as dental, optician, vet clinic where separate tables exist

### Source research

- UBEC National Personnel Audit and school directory.
- Federal Ministry of Education/NEMIS.
- State SUBEB and Ministry of Education lists.
- NUC, NBTE, NCCE for tertiary institutions.
- Nigeria Health Facility Registry.
- NHIA/NHIS accredited facilities.
- NPHCDA PHC list.
- MDCN, PCN, NMCN, MLSCN and other professional registers.

### Reconciliation rules

- UBEC basic schools must not be double-counted with tertiary institutions.
- HFR hospital/clinic records must not be double-counted as PHC/community-health networks unless source identity confirms separate entities.
- School name duplicates in the same LGA require address/ownership/source-ID review.
- Facilities with official HFR IDs or education codes use those IDs as primary dedupe keys.

### Implementation order

1. Education source research and extraction.
2. Education dedupe by official ID, ownership, name, address, and place.
3. School organization roots.
4. School profiles and vertical profiles.
5. Health source research and extraction.
6. HFR/NHIA/NPHCDA reconciliation.
7. Clinic/health organization roots.
8. Clinic/community-health/pharmacy/professional profiles.
9. Search rebuild and coverage report.

### Acceptance checks

- Education counts match source extracts and every variance is documented.
- Every school resolves to state and LGA; ward resolution is required where possible.
- Every HFR facility has source ID, facility type, ownership, state, LGA, and status where available.
- No school or health facility is seeded from market estimate alone.

### Current implementation status — 2026-04-21

S06 education batch 1 is complete for the official NEMIS Schools Directory. The batch extracted 174,401 official NEMIS CSV rows, deduped them to 174,398 canonical schools by official NEMIS school code, and seeded 174,268 schools that resolved to the canonical state/LGA geography. The seed writes school organizations, discovery profiles, `school_profiles`, `private_school_profiles` for private schools, search entries, and S00/S04 provenance sidecars through migration `0307_education_nemis_schools_seed.sql` and standalone seed `infra/db/seed/0008_nemis_schools.sql`.

UBEC 2022 National Personnel Audit aggregate counts are recorded only as a benchmark because the available public UBEC source did not expose row-level records. The 130 unresolved NEMIS canonical school rows are intentionally not seeded: Osun `Ilesha` cannot be safely split between canonical Ilesa East and Ilesa West without an additional official key, while Imo `Onuimo` and Jigawa `Basirka` require a canonical source reconciliation before insertion.

S06 remains in progress. Education/NEMIS, education/MLSCN training institutions, scoped NHIA health-care-provider, and scoped NPHCDA primary-health-care facility batches are complete. HFR master health facilities, PCN pharmacies, MDCN/NMCN/MLSCN professionals/facilities beyond the scoped training batch, and final health coverage reconciliation remain pending row-level official sources.

Health source research continued on 2026-04-21. Direct HFR/NCDC access remained unavailable from the Replit environment: `www.hfr.health.gov.ng` public download/list pages timed out, `hfr.health.gov.ng` has a hostname certificate mismatch and returned current FMoH WordPress 404 pages when bypassed, and NCDC Data Portal CKAN/API paths timed out or returned gateway failures. A 46,146-row HDX/eHealth Africa health-facilities CSV was extracted and reconciled as a candidate artifact only: 45,652 rows resolved to canonical LGAs and 494 remained unresolved. It is explicitly marked `candidate_not_seeded` because its metadata source is eHealth Africa/Africa Open Data rather than direct HFR/FMoH publication.

Additional official regulator research found NHIA's public Participating Health Care Providers table at `https://www.nhia.gov.ng/hcps/`. Migration `0308_health_nhia_hcp_seed.sql` (mirrored in `apps/api/migrations/` and `infra/db/seed/0009_nhia_hcp.sql`) seeds 6,539 NHIA-accredited provider organizations/profiles from 6,540 official rows after merging one exact duplicate. Because NHIA provides provider code, name, address, and facility tier but no LGA/ward coordinates, place resolution is state-only from the NHIA provider-code prefix. Validation confirmed 6,539 organizations, profiles, clinic profiles, search entries, and FTS rows, with 0 invalid place refs, 0 duplicate profile subjects, and 0 profiles missing search.

NPHCDA PHC dashboard reverse-engineering found the public API endpoint `https://api.nphcda.gov.ng/indicators/e70967b3-10d8-416e-9c21-7f7278375ce9/?geo_json=false&country=09a25923-91c2-4412-87a1-310edfd878b9`. Migration `0309_health_nphcda_phc_seed.sql` (mirrored in `apps/api/migrations/` and `infra/db/seed/0010_nphcda_phc.sql`) seeds 26,711 official NPHCDA PHC facility organizations/profiles with enrichment sidecars for source ward id, coordinates, and photo URL. Validation confirmed 26,711 organizations, profiles, clinic profiles, search entries, provenance rows, enrichment rows, place resolutions, and FTS rows, with 0 rejected rows, 0 invalid place refs, 0 duplicate profile subjects, and 0 profiles missing search. Place resolution reached canonical ward for 21,240 facilities and canonical LGA for 5,471 facilities.

MLSCN public site API research found `https://admin.mlscn.gov.ng/api/v1` endpoints for approved MLS training universities, approved MLA/T training institutions, and MLS internship institutions. Migration `0310_education_mlscn_training_institutions_seed.sql` (mirrored in `apps/api/migrations/` and `infra/db/seed/0011_mlscn_training_institutions.sql`) seeds 30 official MLSCN approved training institutions as school organizations/profiles with state-level place resolution. Fifteen MLS internship health-facility training-site rows were captured but deferred to avoid unsafe overlap with HFR/NHIA/NPHCDA facility sources. Validation confirmed 30 organizations, profiles, school profiles, search entries, provenance rows, enrichment rows, place resolutions, and FTS rows, with 0 invalid place refs, 0 duplicate profile subjects, and 0 profiles missing search.

S06 reports are available at `docs/reports/phase-s06-education-nemis-schools-report-2026-04-21.md`, `docs/reports/phase-s06-education-health-source-manifest-2026-04-21.md`, and `docs/reports/phase-s06-health-source-research-report-2026-04-21.md`.

---

## 13. Phase S07 — Regulated Commercial and Financial Registries

**Objective:** Seed regulated businesses whose official licenses create strong dedupe keys and high trust.

**Blocked by:** S01, S02, S04

### Target verticals

- `fuel_station_profiles` and `petrol_station_profiles`
- `gas_distributor_profiles`
- `bdc_profiles`
- `insurance_agent_profiles`
- `courier_profiles`
- `security_company_profiles`
- `oil_gas_service_profiles`
- `pharmacy_chain_profiles`
- `driving_school_profiles`
- `clearing_agent_profiles`
- licensed financial and professional intermediaries

### Source research

- NMDPRA downstream retail outlets and LPG/gas license sources.
- CBN current BDC license list.
- SANEF/CBN agent and terminal ecosystem data, distinguishing terminals from unique agents.
- NAICOM insurance agent/broker register.
- NIPOST courier operator register.
- NSCDC licensed private security companies.
- FRSC driving school/fleet/operator sources.
- NCDMB/NUPRC/NMDPRA oil and gas service registries.
- PCN pharmacy registers.

### Reconciliation rules

- Fuel station and petrol station universes must be deduped before deciding whether one or two vertical profiles are created.
- BDC seeding must use the current post-relicensing list, not legacy 5,686-row assumptions.
- POS terminals are not unique human agents; terminal count must not inflate agent profiles.
- License number is the strongest key; name-only records require secondary confirmation.

### Implementation order

1. Regulator-by-regulator research packs.
2. License normalization and status classification.
3. Root organization or place insertion.
4. Profiles and vertical profiles.
5. License-source sidecar records.
6. Search rebuild.
7. Regulated-vertical confidence report.

### Acceptance checks

- Every regulated entity has regulator source and retrieval date.
- Every license number is unique within its regulator unless the regulator permits branches.
- Closed, suspended, revoked, or expired records are not presented as active.
- No legacy count is used without current source confirmation.

---

## 14. Phase S08 — Transport and Mobility Registries

**Objective:** Seed Nigeria’s transport/mobility backbone at national, state, LGA, route, park, and union levels.

**Blocked by:** S01, S02, S04

### Target verticals

- `motor_park_profiles`
- `road_transport_union_profiles`
- `nurtw_profiles`
- `okada_keke_profiles`
- `mass-transit`
- `rideshare`
- `haulage`
- `logistics-delivery`
- `dispatch-rider`
- `courier`
- route, fleet, park, and union-related profiles where implemented

### Source research

- NURTW national/state/LGA structures.
- State transport ministry park lists.
- FRSC road transport and fleet-related public records.
- OSM transport nodes and bus station tags.
- Google Places for named parks and terminals.
- State mass-transit operators.
- Union and cooperative registries.

### Reconciliation rules

- A motor park physical place is separate from a transport union organization.
- NURTW chapter and general road transport union profiles must be mapped carefully to avoid duplicates.
- Routes, parks, fleets, and operators are different entity classes.
- OSM/Google place duplicates require coordinate and normalized-name review.

### Acceptance checks

- Every LGA has transport coverage status: official, high-confidence public, field-needed, or no data.
- Major parks in Lagos, Kano, FCT, Rivers, Oyo, Kaduna, and other high-density states are seeded first.
- Every physical motor park has coordinates or a documented location resolution issue.
- Union chapters are not created unless backed by source or field collection.

---

## 15. Phase S09 — Markets, Commerce, POS, Hospitality, and Informal Economy

**Objective:** Seed the highest-density acquisition categories after official foundations are in place.

**Blocked by:** S01, S02, S04

### Target verticals

- markets and wholesale markets
- market associations
- POS businesses and mobile-money agents
- food vendors, restaurants, bukas, catering, bakeries
- hotels, guesthouses, shortlets
- supermarkets, bookshops, spare parts, building materials
- salons, spas, laundry, tailors, shoemakers
- auto mechanics, car washes, generator/electronics/phone repair
- construction, real estate, cleaning, security, solar, print shops
- sole traders and artisans

### Source research

- State commerce and market-board registers.
- CAC public search where accessible.
- NBS MSME reports for prioritization, not direct entity creation.
- OSM and Google Places.
- Local government market records.
- Trade association directories.
- Partner/field collection.
- Public websites and social media pages for named entities.

### Reconciliation rules

- Market-estimate rows must not become fake named entities.
- Every seeded business must have at least one named source or field collection record.
- Same business with multiple map listings must merge into one profile with aliases.
- Branches can be separate facility places but must link to parent organization when known.
- POS agent, POS business, mobile-money agent, and terminal must be modeled separately.

### Acceptance checks

- Every LGA meets or has a documented path toward the minimum discovery floor for top commerce categories.
- No anonymous placeholder entities are published as real businesses.
- High-density states have deeper coverage before long-tail expansion.
- Each entity has a source confidence score and dedupe signature.

---

## 16. Phase S10 — Civic, Faith, NGO, Cooperative, and Community Bodies

**Objective:** Seed civil society, faith institutions, cooperatives, and community organizations with strong source provenance.

**Blocked by:** S01, S02, S04

### Target verticals

- `church_profiles`
- `mosque_profiles`
- `ngo_profiles`
- `cooperative_profiles`
- youth organizations
- women’s associations
- professional associations
- community halls and town halls
- savings groups and thrift groups
- religious, cultural, and civic bodies

### Source research

- CAC Incorporated Trustees and association records.
- Denominational directories.
- Mosque and Islamic council directories.
- State cooperative registries.
- NGO directories and donor/sector lists.
- OSM/Google Places for physical locations.
- Local government community hall records.
- Direct association outreach.

### Reconciliation rules

- A national denomination, state chapter, local parish/branch, and physical worship location are distinct records.
- CAC IT number is a strong key but many branches will not have one; branch/source hierarchy must be preserved.
- Religious and civic entities require sensitive-data handling and no unsupported membership claims.
- Cooperative/savings group financial data must not be invented from estimates.

### Acceptance checks

- Every entity has a public or field source.
- Denomination/sector/cooperative type is normalized.
- Branches and parent organizations are linked where known.
- Sensitive fields are excluded unless publicly disclosed and necessary.

---

## 17. Phase S11 — Agriculture, Food Systems, and Supply Chain

**Objective:** Seed agricultural producers, input dealers, storage, processing, and food-system infrastructure.

**Blocked by:** S01, S02, S04

### Target verticals

- farms and poultry farms
- agro-input dealers
- warehouses and cold rooms
- fish markets and fisheries
- cassava millers, cocoa exporters, food processors
- abattoirs, water treatment, borehole drillers
- logistics and supply-chain places/operators

### Source research

- FMARD and state agriculture ministry data.
- NIRSAL and agriculture program registries.
- NAFDAC food processor/product sources.
- Commodity association directories.
- Warehouse receipt and cold-chain sources where public.
- OSM/Google Places.
- State market/agro-board records.

### Reconciliation rules

- Farm estimates by crop are not seedable entities unless named and sourced.
- Facility places such as warehouses/cold rooms must be separated from operator organizations.
- Product registrations do not automatically equal organization profiles without source mapping.
- Seasonal and commodity attributes go to enrichment sidecar if schema lacks columns.

### Acceptance checks

- Every seeded farm or agro-business is named and source-backed.
- Every facility resolves to state and LGA.
- Commodity/category fields are normalized.
- No statistical-only rows are published.

---

## 18. Phase S12 — Professional, Creator, Media, and Knowledge Economy

**Objective:** Seed people and organizations whose credibility depends on licenses, portfolios, official directories, and public presence.

**Blocked by:** S01, S02, S04

### Target verticals

- lawyers, doctors, accountants, engineers, architects, surveyors, pharmacists, nurses, opticians, dentists
- event planners, photographers, musicians, creators, fashion brands
- radio stations, newspapers, podcast studios, recording labels
- training institutes and vocational schools
- IT support and technology-service providers

### Source research

- NBA, MDCN, ICAN, COREN, ARCON, PCN, NMCN and other professional bodies.
- NBC radio and broadcast licenses.
- NPC/newspaper registration where applicable.
- NUC/NBTE/NCCE for education and training institutions.
- Public portfolios, official websites, creator platforms, and verified social links.
- CAC and association directories.

### Reconciliation rules

- Licensed professionals dedupe primarily by license/body reference.
- Creator profiles require public identity and channel evidence, not follower-count estimates.
- Media organizations require license/registration where applicable.
- Individual professional data must minimize personal data and avoid unsafe private identifiers.

### Acceptance checks

- Every licensed professional has license body provenance or is marked unverified.
- Creator/media profiles include public-source links.
- No private personal data is seeded without a lawful public source.
- Search keywords support profession, specialty, LGA/state, and public brand name.

---

## 19. Phase S13 — Long-Tail Vertical Completion and Every-LGA Discovery Floor

**Objective:** Fill remaining verticals and ensure every LGA has useful discovery coverage without fabricating entities.

**Blocked by:** S05–S12 coverage snapshots

### Scope

- All remaining P3 verticals.
- LGA gap-fill for the minimum viable seed floor.
- Ward-level gap-fill where official or field data exists.
- Vertical-specific schema enhancements discovered in earlier phases.

### Process

1. Generate coverage report by state, LGA, ward, category, vertical, source confidence, and last-reviewed date.
2. Identify LGAs below the minimum discovery floor.
3. Prioritize official and high-confidence public sources for those LGAs.
4. Use field collection only for named, verifiable entities.
5. Do not create synthetic business names to satisfy coverage counts.
6. Record gaps as field-collection tasks when data does not exist online.

### Acceptance checks

- Every LGA has a coverage status for each top category.
- Empty category/LGA combinations have documented research attempts.
- Every gap-fill entity has source provenance.
- Long-tail verticals have no unresolved duplicate conflicts with earlier phases.

---

## 20. Phase S14 — Search, Claim Readiness, Publication, Monitoring, and Refresh Loops

**Objective:** Make seeded data discoverable, claimable, monitorable, and continuously updatable.

**Blocked by:** each completed data phase

### Scope

- Search index rebuild.
- Claim-readiness checks.
- Public discovery QA.
- Refresh cadence per source.
- Correction workflow.
- Enhancement loop for newly available details.

### Implementation order

1. Rebuild `search_entries` and `search_fts` for all approved seeded profiles.
2. Verify every search entry has keywords, place, ancestry path, tenant, visibility, and display name.
3. Run duplicate checks across all phases.
4. Run LGA coverage dashboards.
5. Mark profiles as published only after QA.
6. Create refresh schedule:
   - election/political sources: every election cycle and quarterly for office changes
   - regulator/license sources: monthly or quarterly depending on publication cadence
   - maps/public directories: quarterly for high-density categories
   - field data: continuous correction workflow
7. Enable claim CTAs and claim workflow monitoring.
8. Produce public/data-quality release notes.

### Acceptance checks

- Search returns seeded profiles by vertical, name, state, LGA, and major aliases.
- No profile has missing `primary_place_id`.
- No search entry has empty keywords.
- Claims can be initiated from seeded profiles.
- Every profile has at least one source link.
- Refresh cadence is recorded for every source.

---

## 21. Phase Acceptance Report Template

Every phase must end with a report using this structure:

```markdown
# Phase Sxx Completion Report

## Objective

## Sources Researched
| Source | Owner | URL/access | Publication date | Retrieval date | Rows/raw files | Confidence |

## Extraction Outputs
| Artifact | Rows | Hash | Script | Notes |

## Reconciliation Summary
| Input rows | Canonical rows | Duplicates merged | Rejected rows | Manual review rows |

## Seed Outputs
| Table | Inserted | Updated | Skipped | Failed |

## Coverage
| State | LGAs covered | Wards covered | Entity count | Confidence mix |

## Known Gaps

## Acceptance Checks

## Next Refresh Date
```

---

## 22. Priority Ordering Summary

The correct national sequence is:

1. Control plane and provenance.
2. Geography.
3. Vertical registry and synonym decisions.
4. Jurisdictions.
5. Seed tenant/workspace and ingestion tooling.
6. Official/high-trust public registries:
   - political/electoral
   - education
   - health
   - regulated commercial/financial
7. High-density acquisition categories:
   - transport
   - markets
   - POS/mobile money
   - hospitality
   - food
   - informal commerce
8. Civic/community/religious/cooperative bodies.
9. Agriculture and supply chain.
10. Professional/creator/media.
11. Long-tail completion and LGA floor gap-fill.
12. Search, claim readiness, publication, and refresh loops.

This order must not be skipped. Later phases can be called up independently only after their dependencies pass acceptance checks.

---

## 23. Current Known Blockers Before Production Data Seeding

| Blocker | Impact | Required resolution |
|---|---|---|
| Ward count mismatch: local `0003_wards.sql` has 8,810 rows vs INEC official 8,809 | Political and polling-unit geography may attach to an invalid/duplicate ward | Complete S01 reconciliation |
| `verticals` CSV not yet applied as SQL seed | Vertical FK/reference workflows cannot rely on registry data | Complete S02 |
| Root `individuals` and `organizations` require `tenant_id` | Pre-claim seeded entities need a stable tenant strategy | Complete S00/S04 |
| Many vertical tables require `workspace_id` | Pre-claim vertical profiles need seed workspace strategy | Complete S00/S04 |
| No explicit source/provenance seed metadata tables found | Rich nationwide seeding would be hard to audit or refresh | Complete S00 |
| Search projection appears incomplete for required `keywords` and `ancestry_path` fields | Seeded entities may not appear correctly in discovery | Complete S04/S14 |
| Synonym verticals can double-count the same real-world entity | Inflated and confusing discovery results | Complete S02 synonym map |

---

## 24. Standing Rules for Future Agents

1. Do not seed from lists alone; seed real entities with source-backed details.
2. Do not treat counts as entities.
3. Do not publish placeholder/fake rows to satisfy LGA coverage.
4. Do not use outdated regulator counts when a current list exists.
5. Do not insert profile rows before the root subject exists.
6. Do not insert vertical profile rows before the global profile and seed workspace strategy are valid.
7. Do not create political records before jurisdictions are complete.
8. Do not seed source-conflicted records without a dedupe decision.
9. Do not discard rich source fields just because the current vertical table is sparse; use the enrichment sidecar.
10. Do not mark records verified unless the platform has a clear verification state and source evidence.
11. Do not skip search rebuild and coverage checks.
12. Do not leave a phase without a completion report and next refresh date.

---

## 25. Immediate Next Recommended Work

The next executable task should be **Phase S00**, because it unblocks rigorous nationwide work safely. The work should not begin with schools, clinics, politicians, or markets until S00–S04 have established the platform seed tenant/workspace, provenance sidecars, geography reconciliation, vertical registry, jurisdiction layer, and search rebuild process.

After S00–S04, the first data-heavy phases should be:

1. S05 political/electoral foundation because it depends most heavily on the ward/jurisdiction corrections and has strong official source keys.
2. S06 education and health because they provide nationwide public-service discovery with strong official registries.
3. S07 regulated commercial/financial registries because licenses provide high-confidence dedupe keys.
4. S08 and S09 for transport, markets, POS, hospitality, and informal commerce density.
