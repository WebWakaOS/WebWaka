# WebWaka OS — Master Implementation Plan

**Created:** 2026-04-13  
**Source backlog:** `docs/ops/implementation-backlog.md` (51 items, verified against live codebase)  
**Scope:** All code implementation tasks. Human-only actions are tracked separately in `docs/ops/human-action-items.md`.  
**Current state:** 558 tests passing (444 API + 45 community + 27 brand-runtime + 42 public-discovery), 124 vertical routes live, 452 migrations applied.

---

## Reading This Document

Each phase is a **self-contained work package** that can be executed in a single agent session. Phases are ordered by dependency — later phases build on earlier ones. Items within a phase that have no dependencies on each other are marked **[parallel]** and can run simultaneously.

Every work item shows:
- **Backlog ref** — the ID in `implementation-backlog.md`
- **Files** — the exact files to create or modify
- **Approach** — the precise technical steps (not vague descriptions)
- **Acceptance** — the specific tests or behaviours that confirm it is done
- **Est** — realistic hours for a single focused agent session

---

## Phase Overview

| Phase | Name | Backlog Items | Est Hours | Can Start |
|---|---|---|---|---|
| P1 | Critical Infrastructure Fixes | CRIT-001, CRIT-002, CRIT-003 | 4h | Immediately |
| P2 | Foundation: Codegen + LGA Seeds + Index Refactor | MED-001, MED-002, HIGH-001, HIGH-002 | 10h | After P1 |
| P3 | Test Coverage Sprint | HIGH-003, HIGH-004, HIGH-005, HIGH-006, MED-009, MED-010 | 16h | After P2 |
| P4 | Platform Production Quality | HIGH-007, HIGH-008, HIGH-009 | 24h | After P2 |
| P5 | Partner Platform Phase 3 | HIGH-010 | 10h | After P2 |
| P6 | Admin Platform Features | MED-011, MED-012, MED-013, MED-014, MED-015 | 12h | After P2 |
| P7 | Architecture Hardening | MED-003, MED-004, MED-005, MED-006, MED-007, MED-016 | 10h | After P2 |
| P8 | Verticals Wave 1 — Commerce P2 + Health (Sets A, B, F) | FEAT-001 partial | 28h | After P2 |
| P9 | Verticals Wave 2 — Transport + Civic + Education (Sets D, E, G) | FEAT-001 partial | 30h | After P8 |
| P10 | Verticals Wave 3 — Professional + Creator + Financial (Sets H, I) | FEAT-001 partial | 24h | After P9 |
| P11 | Verticals Wave 4 — Commerce P3 Tail + Set J (Sets C, J) | FEAT-001 partial | 36h | After P10 |
| P12 | React PWA Frontend | FEAT-002 | 80h+ | After P4 |
| P13 | Vertical Route Tests Phase 2 (all P1 verticals) | HIGH-006 Phase 2 | 20h | After P8 |
| P14 | Load Testing + UX Polish + Performance | MED-008, UX-01–14, PERF items | 40h | After P12 |
| P15 | Seed CSV Dedup + Final Governance Audit | FEAT-003 | 2h | Any time |

---

## Phase 1 — Critical Infrastructure Fixes

**When:** Immediately — these are security and production-blocking issues  
**Est:** ~4 hours  
**All items are independent — run them together [parallel]**

---

### P1-A: ENT-003 — Branding Entitlement Gate in `brand-runtime`
**Backlog:** CRIT-001  
**Est:** 1.5h

**Files to modify:**
- `apps/brand-runtime/src/index.ts`

**Approach:**

1. Read `apps/brand-runtime/src/index.ts` to understand the current tenant-resolution flow
2. Read `packages/entitlements/src/index.ts` to find the correct entitlement check function and the branding rights constant
3. After the tenant resolution step (just before rendering any page), insert:
   ```typescript
   import { hasEntitlement, PlatformLayer } from '@webwaka/entitlements';
   // ... inside the request handler, after tenant resolved:
   const hasBrandingRights = await hasEntitlement(tenant.plan, PlatformLayer.Branding);
   if (!hasBrandingRights && !path.startsWith('/health')) {
     return new Response(renderUpgradePage(tenant), {
       status: 403,
       headers: { 'Content-Type': 'text/html' }
     });
   }
   ```
4. Implement `renderUpgradePage(tenant)` — a minimal branded HTML page with the tenant name, the message "This feature requires a Brand or Full Platform plan", and a link to the upgrade URL
5. Ensure `/health` is always excluded from the entitlement check
6. Update `apps/brand-runtime/src/brand-runtime.test.ts` to add:
   - Test: `starter` plan tenant gets 403 with upgrade message
   - Test: `brand` plan tenant gets 200 branded page
   - Test: `/health` returns 200 regardless of plan

**Acceptance:**
- [ ] `starter` plan tenant → 403 with upgrade HTML (not a branded page)
- [ ] `brand`/`full_platform` plan tenant → 200 branded page as before
- [ ] `/health` → 200 always
- [ ] All 27 brand-runtime tests pass (+ 3 new ones)

---

### P1-B: CRIT-002 — Wire Secret Rotation Check into CI
**Backlog:** CRIT-002  
**Est:** 1h

**Files to modify:**
- `.github/workflows/ci.yml`
- `scripts/verify-secrets.ts` (may need enhancement)

**Approach:**

1. Read `scripts/verify-secrets.ts` to understand its current form
2. Read `infra/cloudflare/secrets-rotation-log.md` to understand the data format
3. If `verify-secrets.ts` doesn't already parse rotation dates and check age, extend it:
   - Parse each row of the rotation log (secret name, last rotated date)
   - Calculate age in days
   - `console.warn` on any secret > 60 days
   - Exit with code 1 on any secret > 80 days
4. Add a step to the `governance` CI job in `.github/workflows/ci.yml` (after the existing 11 governance checks):
   ```yaml
   - name: Check secret rotation schedule (SEC-008)
     run: npx tsx scripts/verify-secrets.ts
   ```

**Acceptance:**
- [ ] `npx tsx scripts/verify-secrets.ts` runs without error on a freshly rotated secret
- [ ] CI `governance` job includes the new step
- [ ] The script correctly exits 1 when a test secret is artificially aged past 80 days

---

### P1-C: CRIT-003 — Bind R2 Buckets in `wrangler.toml`
**Backlog:** CRIT-003  
**Est:** 1.5h

**Files to modify:**
- `apps/api/wrangler.toml`
- `apps/brand-runtime/wrangler.toml`
- `infra/cloudflare/environments.md`

**Approach:**

1. Read `apps/api/wrangler.toml` — find the `[env.staging]` and `[env.production]` blocks
2. Add the R2 binding under each environment:
   ```toml
   [[env.staging.r2_buckets]]
   binding = "ASSETS"
   bucket_name = "assets-staging"

   [[env.production.r2_buckets]]
   binding = "ASSETS"
   bucket_name = "assets-production"
   ```
3. Read `apps/brand-runtime/wrangler.toml` — apply the same R2 binding pattern (brand-runtime needs R2 for logo and brand asset uploads)
4. Update `apps/api/src/index.ts` Env type (or `apps/api/src/types/env.ts`) to add `ASSETS: R2Bucket` to the environment interface
5. Update `apps/brand-runtime/src/index.ts` Env type similarly
6. Update `infra/cloudflare/environments.md` with a R2 bindings section documenting bucket names per environment

**Acceptance:**
- [ ] `wrangler deploy --env staging --dry-run` reports no binding errors
- [ ] TypeScript compiler accepts `env.ASSETS.put(...)` in the worker code
- [ ] All existing API and brand-runtime tests still pass

---

## Phase 2 — Foundation: Codegen + LGA Seeds + Index Refactor

**When:** After Phase 1  
**Est:** ~10 hours  
**P2-A and P2-B are independent [parallel]; P2-C and P2-D are independent [parallel]**

---

### P2-A: MED-002 — Vertical Code Generation CLI
**Backlog:** MED-002 (ARC-08)  
**Est:** 3h  
**Why do this now:** Every one of the 154 vertical implementations in Phases 8–11 uses this tool. Building it first makes Phases 8–11 dramatically faster and more consistent.

**Files to create:**
- `scripts/codegen/vertical.ts`
- `scripts/codegen/templates/migration.sql.tpl`
- `scripts/codegen/templates/route.ts.tpl`
- `scripts/codegen/templates/test.ts.tpl`

**Approach:**

1. Create `scripts/codegen/vertical.ts` as a CLI using `parseArgs` from Node.js (`util.parseArgs`):
   - Args: `--slug <slug>`, `--category <commerce|health|education|transport|civic|professional|financial|creator>`, `--fsm-states <comma-separated>`, `--kyc-tier <0|1|2|3>` (default 1), `--negotiation <true|false>` (default false)
   - Reads next available migration number from `infra/db/migrations/` (finds max number, increments)
   - Writes 3 files: migration SQL, route TS, test TS — all in the correct locations

2. Migration template (`migration.sql.tpl`):
   ```sql
   -- {{slug}} vertical profile table
   -- Platform invariant T3: all rows include tenant_id
   CREATE TABLE IF NOT EXISTS {{slug_snake}}_profiles (
     id          TEXT PRIMARY KEY,
     workspace_id TEXT NOT NULL,
     tenant_id   TEXT NOT NULL,
     -- vertical-specific columns to be added manually
     fsm_state   TEXT NOT NULL DEFAULT '{{first_fsm_state}}',
     created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
     updated_at  INTEGER NOT NULL DEFAULT (unixepoch()),
     FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
     FOREIGN KEY (tenant_id) REFERENCES tenants(id)
   );
   CREATE INDEX IF NOT EXISTS idx_{{slug_snake}}_profiles_workspace
     ON {{slug_snake}}_profiles(workspace_id, tenant_id);
   ```
   Rollback template: `DROP TABLE IF EXISTS {{slug_snake}}_profiles;`

3. Route template (`route.ts.tpl`):
   ```typescript
   // {{display_name}} vertical route
   // Governance: T3 (tenant isolation), T4 (Cloudflare edge), P9 (integer kobo)
   // Pillar: {{pillar}}
   import { Hono } from 'hono';
   import { requireAuth } from '../middleware/auth.js';
   import { requireEntitlement } from '../middleware/entitlement.js';
   import { PlatformLayer } from '@webwaka/entitlements';
   
   const router = new Hono();
   router.use('*', requireAuth);
   // TODO: add requireEntitlement(PlatformLayer.{{layer}}) if commerce/paid feature
   
   // GET /{{slug}} — list profiles for caller's workspace
   router.get('/', async (c) => {
     const { tenant_id, workspace_id } = c.get('jwtPayload');
     const rows = await c.env.DB.prepare(
       `SELECT * FROM {{slug_snake}}_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC LIMIT 50`
     ).bind(workspace_id, tenant_id).all();
     return c.json({ data: rows.results });
   });
   
   // POST /{{slug}} — create profile
   router.post('/', async (c) => {
     const body = await c.req.json();
     const { tenant_id, workspace_id } = c.get('jwtPayload');
     const id = `{{slug_prefix}}_${crypto.randomUUID()}`;
     await c.env.DB.prepare(
       `INSERT INTO {{slug_snake}}_profiles (id, workspace_id, tenant_id, fsm_state)
        VALUES (?, ?, ?, '{{first_fsm_state}}')`
     ).bind(id, workspace_id, tenant_id).run();
     return c.json({ id }, 201);
   });
   
   export default router;
   ```

4. Test template (`test.ts.tpl`):
   ```typescript
   // {{display_name}} vertical route tests
   // Invariants under test: T3, T4, P9
   import { describe, it, expect, beforeAll } from 'vitest';
   // ... standard test harness matching existing vertical test patterns
   ```

5. The CLI validates inputs, resolves the next migration number, fills the templates via simple string replacement, and writes the 3 files. It prints the file paths on success.

**Acceptance:**
- [ ] `npx tsx scripts/codegen/vertical.ts --slug laundry-shop --category commerce --fsm-states pending,active,suspended` generates 3 valid files
- [ ] Generated migration number is one higher than the current highest in `infra/db/migrations/`
- [ ] Generated route file compiles with `tsc --noEmit`
- [ ] Generated test file runs with zero failures (it starts with basic structure + 1 placeholder passing test)

---

### P2-B: HIGH-001 — Resolve `superagent` Package Gap (ADL-012)
**Backlog:** HIGH-001  
**Est:** 1h  
**Decision:** Use Option B (document-only fix — avoid creating a new package that would require all 124 vertical packages to update their imports)

**Files to create/modify:**
- `docs/architecture/decisions/0017-ai-package-naming.md`
- `docs/governance/ai-architecture-decision-log.md`
- All governance docs that reference `superagent` → update to `superagent`

**Approach:**

1. Audit all docs for `superagent` references:
   ```bash
   grep -rn "superagent" docs/
   ```
2. For each doc, replace `packages/superagent` → `packages/superagent` and `@webwaka/superagent` → `@webwaka/superagent`
3. Create `docs/architecture/decisions/0017-ai-package-naming.md`:
   - Records the decision: `packages/superagent` is the canonical verticals AI entry point
   - `packages/superagent` was a planning-stage alias; no code should be created under that name
   - All verticals import from `@webwaka/superagent`
4. Update `docs/governance/ai-architecture-decision-log.md` ADL-001 entry to reference `packages/superagent`

**Acceptance:**
- [ ] `grep -rn "superagent" docs/` returns zero results
- [ ] ADL-012/ADR-0017 is filed and committed
- [ ] No code change needed — all existing imports already use `@webwaka/superagent`

---

### P2-C: HIGH-002 — Nigeria LGA + Ward Seed Data
**Backlog:** HIGH-002  
**Est:** 4h

**Files to create:**
- `infra/db/seeds/0005_lgas.sql`
- `infra/db/seeds/0006_wards_lagos_fct_kano_rivers.sql`
- `scripts/seed-geography.ts` (helper to validate seeds)

**Approach:**

1. Read `packages/geography/src/data/` to understand the existing state data format (zone_id, state_id, parent references)
2. Read `infra/db/migrations/` for the `geography_places` table schema (find the migration that created it — look for `CREATE TABLE geography_places`)
3. Build `infra/db/seeds/0005_lgas.sql` — INSERT statements for all 774 Nigerian LGAs:
   - Each row: `(id, parent_id, name, code, level, country_code)`
   - `parent_id` references the correct state row from seed `0003_states.sql`
   - `level` = `'lga'`
   - IDs: `geo_lga_<state_abbr>_<lga_slug>` e.g. `geo_lga_lag_ikeja`
   - Use the official list: 36 states × average 21 LGAs + FCT 6 area councils = 774 total
4. Build `infra/db/seeds/0006_wards_lagos_fct_kano_rivers.sql`:
   - Lagos State: 245 wards across 20 LGAs
   - FCT: 62 wards across 6 area councils
   - Kano State: 484 wards across 44 LGAs
   - Rivers State: 319 wards across 23 LGAs
   - `level` = `'ward'`, `parent_id` references LGA rows from seed 0005
5. Create `scripts/seed-geography.ts` that validates:
   - Every LGA parent_id exists in the states table
   - Every ward parent_id exists in the LGAs table
   - No duplicate codes at the same level
   - Count check: exactly 774 LGAs

**LGA reference data approach:**
Use the official INEC LGA list as the source. Each of Nigeria's 36 states + FCT has a known count. The SQL should be generated programmatically inside the script, producing valid INSERT statements.

**Acceptance:**
- [ ] `SELECT count(*) FROM geography_places WHERE level = 'lga'` = 774 (after seed applied locally)
- [ ] `scripts/seed-geography.ts` passes all integrity checks
- [ ] `check-geography-integrity.ts` governance script passes on CI
- [ ] `/discover?lga=ikeja` resolves to the Ikeja LGA in Lagos

---

### P2-D: MED-001 — Split `apps/api/src/index.ts` (ARC-07)
**Backlog:** MED-001  
**Est:** 2h

**Files to create/modify:**
- `apps/api/src/router.ts` (new — all route mounts)
- `apps/api/src/middleware/index.ts` (new — all middleware setup)
- `apps/api/src/index.ts` (reduce to < 100 lines — import and wire only)

**Approach:**

1. Read the full `apps/api/src/index.ts` (758 lines)
2. Extract all `app.use(middleware)` calls into `apps/api/src/middleware/index.ts` — export a `registerMiddleware(app: Hono)` function
3. Extract all `app.route('/path', router)` calls into `apps/api/src/router.ts` — export a `registerRoutes(app: Hono)` function
4. The new `index.ts`:
   ```typescript
   import { Hono } from 'hono';
   import { registerMiddleware } from './middleware/index.js';
   import { registerRoutes } from './router.js';
   export type { Env } from './types/env.js';
   
   const app = new Hono<{ Bindings: Env }>();
   registerMiddleware(app);
   registerRoutes(app);
   export default app;
   ```
5. Run `npx vitest run` — all 444 tests must pass unchanged

**Acceptance:**
- [ ] `wc -l apps/api/src/index.ts` ≤ 100 lines
- [ ] All 444 API tests pass with zero changes to test files

---

## Phase 3 — Test Coverage Sprint

**When:** After Phase 2  
**Est:** ~16 hours  
**All items are independent [parallel]**

---

### P3-A: HIGH-003 — Identity Route Tests
**Backlog:** HIGH-003 (QA-02)  
**Est:** 3h

**File to create:** `apps/api/src/routes/identity.test.ts`

**Approach:**

1. Read `apps/api/src/routes/identity.ts` in full — map all routes, inputs, and side effects
2. Build the test file following the exact patterns of `apps/api/src/routes/claim.test.ts` (closest existing test to a security-critical route)
3. Test cases (minimum 20):

   **BVN submission:**
   - POST `/identity/bvn` with valid BVN 11-digit number → 200, creates KYC record
   - POST `/identity/bvn` with invalid format (10 digits) → 422
   - POST `/identity/bvn` when already KYC-verified → 409 conflict
   - POST `/identity/bvn` without auth → 401
   - T3: POST `/identity/bvn` with token from tenant A, cannot read tenant B's KYC record

   **NIN/FRSC:**
   - POST `/identity/nin` valid → 200
   - POST `/identity/nin` duplicate → 409
   - POST `/identity/frsc` valid → 200

   **KYC tier progression:**
   - Submitting BVN bumps tier from 0 → 1
   - Submitting NIN bumps tier from 1 → 2
   - Tier cannot go backwards

   **Rate limiting:**
   - 6th identical BVN submission within 1 hour → 429

   **Prembly mock:** Create a `__mocks__/prembly.ts` that always returns success without calling the live API. All tests must use this mock.

**Acceptance:**
- [ ] ≥ 20 test cases
- [ ] Zero live external API calls (all mocked)
- [ ] All T3 isolation tests pass
- [ ] Total API test count increases by 20+ (no regressions)

---

### P3-B: HIGH-004 — Negotiation Route Tests
**Backlog:** HIGH-004 (QA-03)  
**Est:** 4h  
**Note:** `negotiation.ts` is 23 KB. Read it fully before writing tests.

**File to create:** `apps/api/src/routes/negotiation.test.ts`

**Approach:**

1. Read `apps/api/src/routes/negotiation.ts` completely — map every route, FSM state, and P9 check
2. Build tests following `apps/api/src/routes/payments.test.ts` pattern (financial-critical precedent)
3. Test cases (minimum 30):

   **Session lifecycle:**
   - POST `/negotiate/sessions` creates session → 201
   - GET `/negotiate/sessions/:id` returns session state
   - Session expires after TTL (mock CRON trigger)

   **Offer flow (P9 — kobo only):**
   - POST `/negotiate/sessions/:id/offer` with kobo integer → 200
   - POST `/negotiate/sessions/:id/offer` with float (e.g. `1500.50`) → 422, "Amounts must be integer kobo"
   - POST `/negotiate/sessions/:id/offer` with zero → 422
   - POST `/negotiate/sessions/:id/offer` with negative → 422

   **Counter-offer and auto-accept:**
   - Counter-offer below auto-accept threshold → session auto-closes → 200 with `status: accepted`
   - Counter-offer above threshold → session remains open
   - Max rounds enforcement → 7th round → 422 "Max rounds exceeded"

   **Disabled verticals (12 blocked verticals):**
   - POST `/negotiate/sessions` with vertical `pharmacy-chain` → 403 "Negotiation disabled for this vertical"
   - Test at least 3 of the 12 blocked slugs: `pharmacy-chain`, `food-vendor`, `bakery`

   **T3 isolation:**
   - Tenant A cannot see or modify Tenant B's negotiation session

   **Entitlement:**
   - `starter` plan cannot create negotiation session → 403

**Acceptance:**
- [ ] ≥ 30 test cases
- [ ] Float offer amounts correctly rejected (P9 invariant enforced)
- [ ] Disabled verticals gate tested
- [ ] All 444 existing tests continue passing

---

### P3-C: HIGH-005 — Entity Route Tests
**Backlog:** HIGH-005 (QA-06)  
**Est:** 2.5h

**File to create:** `apps/api/src/routes/entities.test.ts`

**Approach:**

1. Read `apps/api/src/routes/entities.ts` — map all 7 entity types and their CRUD operations
2. Test cases (minimum 20):
   - Create each entity type (Individual, Organization, Place, Product, Service, Event, Team) → 201
   - GET list with pagination → 200, respects `limit` and `cursor`
   - GET single → 200
   - PUT update → 200 with updated fields
   - T3: Tenant A cannot read Tenant B's entities
   - ID type enforcement: `ind_` prefix for Individual, `org_` for Organization, etc.
   - Missing required field → 422 with field name in error

**Acceptance:**
- [ ] ≥ 20 test cases covering all 7 entity types
- [ ] T3 isolation confirmed
- [ ] All 444 existing tests pass

---

### P3-D: HIGH-006 Phase 1 — Top 5 Vertical Route Tests
**Backlog:** HIGH-006  
**Est:** 4h (5 test files × ~0.8h each)

**Files to create:**
- `apps/api/src/routes/verticals/pos-business.test.ts`
- `apps/api/src/routes/verticals/politician.test.ts`
- `apps/api/src/routes/verticals/church.test.ts`
- `apps/api/src/routes/verticals/clinic.test.ts`
- `apps/api/src/routes/verticals/school.test.ts`

**Approach for each vertical test file:**

1. Read the corresponding route file completely
2. Each test file covers (minimum 10 tests):
   - `GET /` returns profile list for authenticated workspace
   - `POST /` creates profile → 201 with correct ID prefix
   - FSM: valid state transition → 200
   - FSM: invalid state transition → 422
   - Entitlement guard: wrong plan → 403
   - T3: cross-tenant access → 403 or 404
   - P9: any monetary amounts validated as integer kobo (if applicable)
   - `GET /` without auth → 401

**Additional vertical-specific tests:**
- **pos-business:** POS transaction POST with float amount → 422 (P9)
- **politician:** `DELETE /:id` without `admin` role → 403 (known fix from Bug 5 previous session)
- **clinic:** KYC tier 2 required for medical record creation → 403 if tier < 2
- **school:** Enrollment FSM: `enrolled` → `graduated` is valid; `enrolled` → `pending` is not

**Acceptance:**
- [ ] 5 test files, each ≥ 10 tests
- [ ] All 444 existing tests still pass
- [ ] Test count increases by ≥ 50

---

### P3-E: MED-010 — Template Lifecycle Tests
**Backlog:** MED-010 (QA-10)  
**Est:** 1.5h

**File to create:** `apps/api/src/routes/templates.test.ts`

**Approach:**

1. Read `apps/api/src/routes/templates.ts` — map all install/rollback/publish/list routes
2. Test cases:
   - GET `/templates` → 200 with list
   - POST `/templates/:slug/install` valid → 201
   - POST `/templates/:slug/install` invalid slug → 404
   - POST `/templates/:slug/rollback` by workspace owner → 200
   - POST `/templates/:slug/publish` by `super_admin` → 200
   - POST `/templates/:slug/publish` by regular user → 403
   - T3: installing template doesn't affect another tenant's workspace

**Acceptance:**
- [ ] ≥ 12 test cases
- [ ] `super_admin`-only publish gate tested

---

### P3-F: MED-009 — External API Contract Tests
**Backlog:** MED-009 (QA-09)  
**Est:** 1h

**Files to create:**
- `tests/contracts/paystack.contract.test.ts`
- `tests/contracts/prembly.contract.test.ts`
- `tests/contracts/termii.contract.test.ts`

**Approach:**

Use recorded HTTP fixtures (not live calls). For each provider:
1. Record the expected request/response shape as JSON fixtures in `tests/contracts/fixtures/`
2. Test that the adapter sends the correct request shape and handles success/failure responses correctly
3. Paystack: charge initiation, verify transaction, list banks
4. Prembly: BVN lookup (success, not found, service error)
5. Termii: send OTP (success, invalid number, quota exceeded)

**Acceptance:**
- [ ] 3 contract test files, each with ≥ 5 assertions
- [ ] No live API calls — all fixtures

---

## Phase 4 — Platform Production Quality (3-in-1 Pillars)

**When:** After Phase 2  
**Est:** ~24 hours  
**P4-A and P4-B are independent [parallel]; P4-C depends on both P4-A and P4-B**

---

### P4-A: HIGH-007 — `brand-runtime` Production Quality
**Backlog:** HIGH-007 (P3IN1-001)  
**Est:** 10h

**Files to create/modify:**
- `apps/brand-runtime/src/templates/` — multiple new template files
- `apps/brand-runtime/src/routes/` — new route handlers
- `apps/brand-runtime/public/manifest.json`
- `apps/brand-runtime/public/sw.js`
- `apps/brand-runtime/public/offline.html`

**Approach:**

**Step 1 — Full Page Set (3h):**
1. Audit existing `apps/brand-runtime/src/templates/` — understand current base.ts and home.ts
2. Create templates: `about.ts`, `services.ts`, `contact.ts`, `blog-list.ts`, `blog-post.ts`
3. Each template: uses `packages/design-system/` CSS classes, `renderAttribution()`, mobile-first viewport meta
4. Add routes in `apps/brand-runtime/src/index.ts`: `GET /about`, `GET /services`, `GET /contact`, `GET /blog`, `GET /blog/:slug`

**Step 2 — E-commerce Flow (3h):**
1. `GET /shop` — product listing from `packages/offerings/`; tenant's products only
2. `GET /shop/:productId` — product detail page
3. `GET /cart` — cart page (cart state in KV, keyed by `{tenant_id}:{session_id}`)
4. `POST /cart/add` — add to cart
5. `POST /checkout` — Paystack payment initialization (redirect to Paystack hosted page)
6. `GET /checkout/callback` — Paystack callback handler → verify payment → create order

**Step 3 — PWA (1h):**
1. `apps/brand-runtime/public/manifest.json` — tenant name via query param (static file + dynamic via `/manifest.webmanifest` route)
2. `apps/brand-runtime/public/sw.js` — service worker caching shell pages
3. `apps/brand-runtime/public/offline.html` — offline fallback

**Step 4 — SEO + Open Graph (1h):**
1. Update `base.ts` template to include `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, `<link rel="canonical">` on every page
2. `GET /sitemap.xml` — generates sitemap from tenant's profile + offerings

**Step 5 — Tests (2h):**
1. Update `apps/brand-runtime/src/brand-runtime.test.ts` to cover new routes
2. Add: `/shop` returns product list, `/blog` returns post list, `/sitemap.xml` is valid XML, PWA manifest loads, entitlement gate (from P1-A) is covered

**Acceptance:**
- [ ] All 5 page routes return correct HTML (verified by tests)
- [ ] E-commerce: product → cart → checkout initializes Paystack correctly
- [ ] `manifest.json` and `sw.js` are served
- [ ] Open Graph tags present on all pages
- [ ] All 27 existing brand-runtime tests pass + new tests added

---

### P4-B: HIGH-008 — `public-discovery` Production Quality
**Backlog:** HIGH-008 (P3IN1-002)  
**Est:** 8h

**Files to modify:**
- `apps/public-discovery/src/index.ts`
- `apps/public-discovery/src/templates/` (multiple)
- `apps/public-discovery/src/routes/` (multiple)

**Approach:**

**Step 1 — Rich Directory Homepage (2h):**
1. Read existing `apps/public-discovery/src/` templates and routes
2. Replace placeholder homepage with:
   - Category browse grid (all major sectors from `packages/verticals/`)
   - Geography shortcuts for top 10 states
   - Featured listings (top 20 claimed entities sorted by rating)
   - Search box → links to `/search?q=...`

**Step 2 — Full-Text Search (2h):**
1. `GET /search?q=&sector=&state=&lga=&page=` — FTS5 query against D1 (entities + offerings)
2. Results page with filter sidebar (sector, state, rating range)
3. Pagination with cursor

**Step 3 — Geography-Aware URLs (1.5h):**
1. Route: `GET /:state_slug/:sector_slug` → e.g. `/lagos/restaurant` → shows all restaurants in Lagos
2. Route: `GET /:state_slug/:lga_slug/:sector_slug` → e.g. `/lagos/ikeja/restaurant`
3. For all 37 states — the routes use geography data from seed files (P2-C must be done first)
4. SEO: each geography+sector URL has a unique `<title>` and `<meta description>`

**Step 4 — Entity Profile Pages (1h):**
1. `GET /e/:entity_id` — full entity profile: name, sector, location, offerings, ratings, claim CTA
2. Include: `<a href="{entity.brand_url}">Visit Website</a>` (links to brand-runtime)
3. Include: `<a href="{entity.api_url}/order">Order Now</a>` (links to Pillar 1 API)
4. Schema.org JSON-LD structured data for local business

**Step 5 — Sitemap (0.5h):**
1. `GET /sitemap.xml` — all entity profile URLs + geography URLs
2. `GET /sitemap-index.xml` — paginated sitemaps for large datasets

**Step 6 — Tests (1h):**
1. Update `apps/public-discovery/` tests to cover new routes
2. Add: geography URL resolution, search returns results, sitemap is valid XML, entity profile has structured data

**Acceptance:**
- [ ] `/search?q=plumber&state=lagos` returns relevant results
- [ ] `/lagos/clinic` shows all clinics in Lagos
- [ ] Entity profile page has JSON-LD structured data
- [ ] Sitemap is valid XML with correct URLs
- [ ] All 42 existing tests pass + new tests added

---

### P4-C: HIGH-009 — Cross-Pillar Data Flow
**Backlog:** HIGH-009 (P3IN1-003)  
**Depends on:** P4-A, P4-B (brand-runtime and public-discovery must have their offering/listing endpoints)  
**Est:** 6h

**Files to modify:**
- `packages/offerings/src/index.ts` (add sync trigger)
- `packages/search-indexing/src/index.ts` (add upsert on offering change)
- `apps/api/src/routes/offerings.ts` (trigger sync on create/update)
- `apps/brand-runtime/src/templates/services.ts` (read from offerings package — verify it is doing this, not duplicating data)
- `apps/public-discovery/src/routes/` (read from search index — verify this is the correct source)

**Approach:**

**Step 1 — Pillar 1 → Search Index Sync (2h):**
1. Read `packages/search-indexing/src/index.ts` — find the `upsert` function
2. In `apps/api/src/routes/offerings.ts`, after every `POST /offerings` (create) and `PATCH /offerings/:id` (update), call `searchIndexing.upsert(offering)` — this writes to the D1 FTS5 search index that Pillar 3 reads
3. On `DELETE /offerings/:id`, call `searchIndexing.remove(offering.id)`

**Step 2 — Pillar 2 reads from Offerings (1h):**
1. Confirm `apps/brand-runtime/src/templates/services.ts` queries `packages/offerings/` (not its own table)
2. If it has its own table, replace the query to read from `offerings` table with `workspace_id = ?` AND `tenant_id = ?`
3. This ensures brand-runtime (Pillar 2) and the API (Pillar 1) share the same offering data

**Step 3 — Pillar 3 entity profiles link to Pillars 1 & 2 (1h):**
1. When `public-discovery` renders an entity profile, include:
   - `brand_site_url`: if the tenant has branding rights, their custom subdomain (from `tenant.brand_domain`)
   - `order_url`: the API endpoint for placing orders (`https://api.webwaka.com/{vertical}/{entity_id}/order`)
2. Read from the `tenants` + `workspaces` tables for these URLs

**Step 4 — Integration tests (2h):**
1. Create `tests/integration/cross-pillar.test.ts`:
   - Create offering via API (Pillar 1) → query search index → confirm offering appears
   - Query brand-runtime `/shop` for same workspace → confirm offering appears (same source)
   - Query public-discovery entity profile → confirm offering count matches

**Acceptance:**
- [ ] Creating an offering via the API immediately makes it findable in `/search?q=<offering name>`
- [ ] Brand-runtime `/shop` shows the same offerings as the API `/offerings` list
- [ ] Public-discovery entity profile links to brand site and order endpoint
- [ ] Cross-pillar integration test passes

---

## Phase 5 — Partner Platform Phase 3

**When:** After Phase 2  
**Est:** ~10 hours

---

### P5: HIGH-010 — Partner Model Phase 3

**Backlog:** HIGH-010  
**Files to create/modify:**
- `apps/api/src/routes/partners.ts` (extend with Phase 3 routes)
- `apps/api/src/routes/partners.test.ts` (extend)
- `apps/brand-runtime/src/index.ts` (white-label depth enforcement)
- `apps/partner-admin/src/` (wire to real API)

**Approach:**

**Step 1 — WakaCU Credit Pool Routes (2h):**
1. Read `infra/db/migrations/0043_wc_wallets_transactions.sql` — understand the wallet schema
2. Read `apps/api/src/routes/partners.ts` — find where to extend
3. Add routes:
   - `GET /partners/:id/credits` — return partner's WakaCU pool balance (sum of all allocations minus used credits)
   - `POST /partners/:id/credits/allocate` — allocate credits from partner pool to a sub-tenant workspace (validates partner has enough balance, inserts allocation row, returns new balance)
   - `GET /partners/:id/credits/history` — paginated allocation history

**Step 2 — Revenue Share Calculation (2h):**
1. Migration: `0222_partner_revenue_share.sql` — `partner_settlements` table tracking revenue share amounts
2. Add route `POST /partners/:id/settlements/calculate` — calculates revenue share based on `partner_revenue_share_bps` from partner plan (basis points, P9: integer)
3. Add route `GET /partners/:id/settlements` — list settlements

**Step 3 — White-Label Depth Enforcement (2h):**
1. Read `apps/brand-runtime/src/index.ts`
2. After tenant resolution, also resolve the tenant's partner (if any) and check `partner.max_branding_depth` from D1
3. If tenant's requested branding depth exceeds partner's allowed depth → cap it silently (log a warning)
4. Add test: a Tier-1 partner cannot grant its sub-tenant deeper white-labelling than allowed

**Step 4 — Partner Admin Dashboard (2h):**
1. Read `apps/partner-admin/src/` — understand current stub structure
2. Wire the following views to real API calls:
   - Dashboard overview: `GET /partners/:id/credits` → show pool balance
   - Allocations: `POST /partners/:id/credits/allocate` → form to allocate credits
   - Sub-tenants list: `GET /partners/:id/sub-tenants`
   - Settlements: `GET /partners/:id/settlements`
3. All API calls use the JWT from the partner admin login

**Step 5 — Tests (2h):**
1. Extend `apps/api/src/routes/partners.test.ts` with:
   - Credit pool GET returns correct balance
   - Allocation with sufficient balance → 201
   - Allocation exceeding pool balance → 422
   - Revenue share calculation produces integer basis points only (P9)
   - White-label depth enforcement tested

**Acceptance:**
- [ ] Partners can GET their credit pool balance
- [ ] POST allocation correctly deducts from pool
- [ ] Overspend prevented with 422 error
- [ ] Revenue share uses integer basis points only (P9 invariant)
- [ ] White-label depth cap enforced

---

## Phase 6 — Admin Platform Features

**When:** After Phase 2  
**Est:** ~12 hours  
**All items are independent [parallel]**

---

### P6-A: MED-011 — Admin Analytics Dashboard
**Backlog:** MED-011 (PROD-03)  
**Est:** 3h

**Files to create/modify:**
- `apps/api/src/routes/analytics.ts` (new)
- `apps/admin-dashboard/src/` (wire to real data)
- `infra/db/migrations/0223_analytics_views.sql` (optional: create views for performance)

**Approach:**

1. Create `apps/api/src/routes/analytics.ts` with:
   - `GET /platform/analytics/summary` (super_admin only): total tenants, active workspaces, total transactions (last 30 days), total revenue in kobo, top 10 verticals by workspace count
   - `GET /platform/analytics/tenants` (super_admin only): paginated tenant list with workspace count, subscription plan, status
   - `GET /platform/analytics/verticals` (super_admin only): vertical usage heatmap (count of workspaces per vertical)
2. Mount route in `apps/api/src/router.ts` (after P2-D)
3. Update `apps/admin-dashboard/src/` Overview page to call `GET /platform/analytics/summary` and render real numbers

**Acceptance:**
- [ ] `GET /platform/analytics/summary` returns correct counts
- [ ] Admin dashboard Overview shows real data instead of "0" placeholders

---

### P6-B: MED-012 — Template Ratings
**Backlog:** MED-012 (PROD-08)  
**Est:** 2h

**Files to create/modify:**
- `infra/db/migrations/0224_template_ratings.sql`
- `apps/api/src/routes/templates.ts` (extend)

**Approach:**

1. Migration:
   ```sql
   CREATE TABLE IF NOT EXISTS template_ratings (
     id           TEXT PRIMARY KEY,
     template_slug TEXT NOT NULL,
     workspace_id  TEXT NOT NULL,
     tenant_id     TEXT NOT NULL,
     rating        INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
     review_text   TEXT,
     created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
     UNIQUE(template_slug, workspace_id)  -- one rating per workspace per template
   );
   ```
2. Add routes to `templates.ts`:
   - `POST /templates/:slug/rate` — body `{ rating: 1-5, review_text?: string }`; upsert rating; return new average
   - `GET /templates/:slug/ratings` — list ratings with pagination
3. Update `GET /templates/:slug` to include `avg_rating`, `rating_count` in response

**Acceptance:**
- [ ] POST rate creates/updates a rating
- [ ] Rating validation: integer 1–5, rejects 0 or 6
- [ ] GET template includes avg_rating in response

---

### P6-C: MED-013 — Support Ticket System
**Backlog:** MED-013 (PROD-10)  
**Est:** 3h

**Files to create:**
- `infra/db/migrations/0225_support_tickets.sql`
- `apps/api/src/routes/support.ts`

**Approach:**

1. Migration:
   ```sql
   CREATE TABLE IF NOT EXISTS support_tickets (
     id           TEXT PRIMARY KEY,
     workspace_id  TEXT NOT NULL,
     tenant_id     TEXT NOT NULL,
     subject       TEXT NOT NULL,
     body          TEXT NOT NULL,
     status        TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved','closed')),
     priority      TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('low','normal','high','urgent')),
     assignee_id   TEXT,
     created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
     updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
   );
   CREATE INDEX idx_support_tickets_tenant ON support_tickets(tenant_id, status);
   ```
2. Create `apps/api/src/routes/support.ts`:
   - `POST /support/tickets` — create ticket (auth required, T3: tenant_id from JWT)
   - `GET /support/tickets` — list caller's tickets (T3 scoped)
   - `GET /support/tickets/:id` — single ticket (T3 guard)
   - `PATCH /support/tickets/:id` — update status/assignee (admin or super_admin only)
   - `GET /platform/support/tickets` — super_admin only: all tickets across tenants

**Acceptance:**
- [ ] T3: tenants only see their own tickets
- [ ] `GET /platform/support/tickets` requires `super_admin` role → 403 otherwise
- [ ] Status transitions enforced (cannot set `closed` → `open`)

---

### P6-D: MED-014 — Multi-Currency Runtime Stub
**Backlog:** MED-014 (PROD-06)  
**Est:** 2h

**Files to modify:**
- `infra/db/migrations/0226_currency_fields.sql`
- `packages/payments/src/index.ts`

**Approach:**

1. Migration: Add `currency_code TEXT NOT NULL DEFAULT 'NGN'` to `subscriptions`, `transactions`, `billing_history` tables
2. In `packages/payments/src/index.ts`:
   - Add a `validateCurrency(amount: number, currency: string)` function: checks `currency === 'NGN'` (for now), validates `amount` is a positive integer, returns error if `currency !== 'NGN'` with message "Multi-currency not yet enabled for this workspace — contact support"
3. Call `validateCurrency` in all payment processing paths
4. Document in `docs/governance/` that this is a forward-compatibility stub — Nigerian operations always use NGN/kobo

**Acceptance:**
- [ ] NGN transactions proceed normally
- [ ] Non-NGN currency attempt returns clear error (not a silent NGN assumption)
- [ ] `currency_code` column exists in transactions table

---

### P6-E: MED-015 — Subscription Management UI
**Backlog:** MED-015 (MON-05)  
**Est:** 2h

**Files to modify:**
- `apps/admin-dashboard/src/` (Billing view)

**Approach:**

1. Read `apps/admin-dashboard/src/` to find the Billing section
2. Replace placeholder UI with real API calls:
   - On load: `GET /billing/status` → display plan name, status (`active`/`past_due`/`suspended`), next billing date
   - If status is `suspended`: show "Reactivate" button → `POST /billing/reactivate`
   - If status is `past_due`: show "Grace period expires" countdown
3. Show usage metrics from the subscription (seats used, workspace count vs. plan limit)

**Acceptance:**
- [ ] Billing page shows real subscription status from the API
- [ ] Reactivate button works for suspended subscriptions

---

## Phase 7 — Architecture Hardening

**When:** After Phase 2  
**Est:** ~10 hours  
**All items are independent [parallel]**

---

### P7-A: MED-003 + MED-016 — Developer Documentation
**Backlog:** MED-003 (ARC-09), MED-016 (DEV-07)  
**Est:** 1.5h

**Files to modify:**
- `CONTRIBUTING.md`

**Approach:**

Add two new sections to `CONTRIBUTING.md`:

**Section: Local D1 Development**
```markdown
## Local D1 Development

Run the API worker locally against a local D1 instance:
```bash
cd apps/api
wrangler dev --local --persist-to .wrangler/state
```

Apply migrations to the local DB:
```bash
wrangler d1 execute webwaka-os-staging --local --file=infra/db/migrations/<file>.sql
```

Seed the local DB:
```bash
wrangler d1 execute webwaka-os-staging --local --file=infra/db/seeds/0001_zones.sql
# Repeat for 0002 through 0006
```

Reset the local DB:
```bash
rm -rf apps/api/.wrangler/state/d1
```
```

**Section: Local Development Quickstart**
- Step-by-step from `git clone` to first successful `curl http://localhost:8787/health`
- How to run each test suite locally
- How to debug Worker errors (`wrangler tail`)

---

### P7-B: MED-004 — API Versioning ADR
**Backlog:** MED-004 (ARC-10)  
**Est:** 1h

**File to create:** `docs/architecture/decisions/0017-api-versioning.md`

**Decision:** Header versioning using `X-API-Version` (preferred over URL versioning for a Cloudflare Workers API to avoid breaking existing integrations). The current API is `v1`. Routes do not need a prefix change — the version is declared in the Accept header.

**ADR content:**
- Context: all routes currently at root, no versioning contract
- Decision: `Accept: application/vnd.webwaka.v1+json` header on all API calls; clients without this header receive `v1` by default
- Consequences: breaking changes ship as `v2`, with a migration guide and a 6-month deprecation window
- Status: ACCEPTED

---

### P7-C: MED-005 — OpenAPI Lint in CI
**Backlog:** MED-005 (ARC-13)  
**Est:** 0.5h

**Files to modify:** `.github/workflows/ci.yml`

**Approach:**

1. Add to the `governance` job (or a new `api-spec` job):
   ```yaml
   - name: Lint OpenAPI spec
     run: |
       npx @redocly/cli lint apps/api/src/routes/openapi.json --format=github-actions
   ```
2. Ensure `openapi.json` (or the route that generates it) is accessible as a static file during CI — if not, generate it: `npx tsx apps/api/src/scripts/generate-openapi.ts > /tmp/openapi.json` then lint `/tmp/openapi.json`

---

### P7-D: MED-006 — Circuit Breaker for External APIs
**Backlog:** MED-006 (ARC-15)  
**Est:** 3h

**Files to create/modify:**
- `packages/core/src/circuit-breaker.ts` (new)
- `packages/ai-adapters/src/index.ts` (wrap all calls)
- `packages/contact/src/otp.ts` (wrap Termii calls)

**Approach:**

1. Create `packages/core/src/circuit-breaker.ts`:
   ```typescript
   // State machine: CLOSED → OPEN (after N failures) → HALF_OPEN (after timeout) → CLOSED
   // State stored in KV with TTL
   export class CircuitBreaker {
     constructor(
       private kv: KVNamespace,
       private service: string,
       private opts: { failureThreshold: number; recoveryTimeoutMs: number }
     ) {}
     
     async call<T>(fn: () => Promise<T>): Promise<T> {
       const state = await this.kv.get(`cb:${this.service}`) ?? 'CLOSED';
       if (state === 'OPEN') throw new Error(`${this.service} circuit breaker OPEN`);
       try {
         const result = await fn();
         await this.onSuccess();
         return result;
       } catch (err) {
         await this.onFailure();
         throw err;
       }
     }
     // onSuccess, onFailure, getState methods
   }
   ```

2. Wrap all Paystack, Prembly, Termii, WhatsApp calls with `CircuitBreaker.call()`
3. Pass the KV binding through the adapters (they already receive `env`)

**Acceptance:**
- [ ] Unit tests for circuit breaker state transitions in `packages/core/src/circuit-breaker.test.ts`
- [ ] After 5 consecutive Paystack failures, subsequent calls immediately throw without hitting the API

---

### P7-E: MED-007 — KV Graceful Degradation
**Backlog:** MED-007 (ARC-17)  
**Est:** 2h

**Files to modify:** All route files that read from KV (search using `grep -rn "\.get\(" apps/api/src/routes/`)

**Approach:**

1. Find all `await env.KV.get(...)` calls in route files
2. Wrap each in a utility function:
   ```typescript
   // packages/core/src/kv-safe.ts
   export async function kvGet<T>(kv: KVNamespace, key: string, fallback: T): Promise<T> {
     try {
       const val = await kv.get(key, { type: 'json' });
       return val ?? fallback;
     } catch (err) {
       console.error(`KV read failed for key ${key}:`, err);
       return fallback;
     }
   }
   ```
3. Replace all bare `env.KV.get(...)` with `kvGet(env.KV, key, null)`
4. Fallback behaviour: if KV returns null/error, fall through to D1 query

**Acceptance:**
- [ ] No KV read can cause an unhandled 500 — all fall through to D1 or return a safe default
- [ ] All 444 API tests still pass

---

## Phase 8 — Verticals Wave 1: Commerce P2 + Health (Sets A, B, F)

**When:** After Phase 2 (codegen tool must exist)  
**Est:** ~28 hours (21 verticals)  
**All 21 verticals are independent [parallel once migration numbers are assigned]**

**Sets in this wave:**
- Set A: 9 Commerce P2 Batch 1 verticals
- Set B: 12 Commerce P2 Batch 2 verticals
- Set F: 6 Health Extended verticals

**Vertical list and assigned migration ranges:**

| Set | Vertical Slug | Migration# | Task ID |
|---|---|---|---|
| A | auto-mechanic | 0222 | V-COMM-EXT-A1 |
| A | bakery | 0223 | V-COMM-EXT-A2 |
| A | beauty-salon | 0224 | V-COMM-EXT-A3 |
| A | bookshop | 0225 | V-COMM-EXT-A4 |
| A | catering | 0226 | V-COMM-EXT-A5 |
| A | cleaning-service | 0227 | V-COMM-EXT-A6 |
| A | electronics-repair | 0228 | V-COMM-EXT-A7 |
| A | florist | 0229 | V-COMM-EXT-A8 |
| A | food-vendor | 0230 | V-COMM-EXT-A9 |
| B | construction | 0231 | V-COMM-EXT-B1 |
| B | fuel-station | 0232 | V-COMM-EXT-B2 |
| B | print-shop | 0233 | V-COMM-EXT-B3 |
| B | property-developer | 0234 | V-COMM-EXT-B4 |
| B | real-estate-agency | 0235 | V-COMM-EXT-B5 |
| B | restaurant-chain | 0236 | V-COMM-EXT-B6 |
| B | security-company | 0237 | V-COMM-EXT-B7 |
| B | solar-installer | 0238 | V-COMM-EXT-B8 |
| B | spa | 0239 | V-COMM-EXT-B9 |
| B | tailoring-fashion | 0240 | V-COMM-EXT-B10 |
| B | travel-agent | 0241 | V-COMM-EXT-B11 |
| B | welding-fabrication | 0242 | V-COMM-EXT-B12 |
| F | dental-clinic | 0243 | V-HLT-EXT-1 |
| F | sports-academy | 0244 | V-HLT-EXT-2 |
| F | vet-clinic | 0245 | V-HLT-EXT-3 |
| F | community-health | 0246 | V-HLT-EXT-4 |
| F | elderly-care | 0247 | V-HLT-EXT-5 |
| F | rehab-centre | 0248 | V-HLT-EXT-6 |

**Note on migration numbering:** The UNIMPLEMENTED_TASKS.md says next available is `0057`, but we audited and the last migration is `0221`. The actual next available is `0222`. **Before implementing any vertical, always run `ls infra/db/migrations/ | sort | tail -3` to confirm the current highest number.**

**Approach for each vertical:**

1. Read the vertical's execution prompt from its set file (e.g., `docs/execution-prompts/webwaka_verticals_commerce_p2_batch1_execution_prompts.md` for Set A)
2. Run codegen tool (from P2-A): `npx tsx scripts/codegen/vertical.ts --slug <slug> --category <category> --fsm-states <states>`
3. Open the generated migration file — add vertical-specific columns from the execution prompt (e.g., `nnpc_license_number` for fuel-station, `cac_registration` for construction)
4. Open the generated route file — implement the specific routes described in the execution prompt, applying:
   - T3: all queries include `AND tenant_id = ?`
   - T4: no `Buffer`, `process.*`, or Node.js APIs
   - P9: all monetary amounts are integer kobo; reject floats
   - FSM state machine from the execution prompt
   - KYC tier guard (from execution prompt)
   - Entitlement check (commerce verticals need `PlatformLayer.Commerce`)
5. Update the generated test file with ≥ 8 vertical-specific tests
6. Mount the router in `apps/api/src/router.ts`

**Acceptance per vertical:**
- [ ] Migration runs without error (both `apply` and `rollback`)
- [ ] Route file compiles with `tsc --noEmit`
- [ ] ≥ 8 tests pass for each vertical
- [ ] T3 isolation test passes
- [ ] P9 float rejection test passes (for commerce verticals with prices)

---

## Phase 9 — Verticals Wave 2: Transport + Civic + Education (Sets D, E, G)

**When:** After Phase 8  
**Est:** ~30 hours (31 verticals)

| Set | Count | Verticals |
|---|---|---|
| D | 8 | clearing-agent, courier, dispatch-rider, airport-shuttle, cargo-truck, container-depot, ferry, road-transport-union |
| E | 10 | mosque, youth-organization, womens-association, waste-management, book-club, professional-association, sports-club, campaign-office, constituency-office, polling-unit-rep |
| G | 13 | driving-school, training-institute, vocational-college, agro-input, artisanal-mining, cassava-miller, cocoa-exporter, fish-market, food-processing, produce-aggregator (check if already exists), vegetable-garden, water-treatment, cold-room |

**Same per-vertical approach as Phase 8. Migration numbers continue from 0249 upward.**

---

## Phase 10 — Verticals Wave 3: Professional + Creator + Financial (Sets H, I)

**When:** After Phase 9  
**Est:** ~24 hours (24 verticals)

| Set | Count | Verticals |
|---|---|---|
| H | 11 | accounting-firm, advertising-agency, event-planner, funeral-home, insurance-agent-extended, law-firm, music-studio, recording-label, talent-agency, tax-consultant, wedding-planner |
| I | 13 | bureau-de-change, community-radio-extended, hire-purchase, internet-cafe-extended, mobile-money-agent, newspaper-dist, ngo-extended, oil-gas-services, savings-group-extended, sole-trader-extended, airtime-reseller, generator-dealer, tech-hub-extended |

**Note:** Some slugs in Sets H and I overlap with or extend existing P1 verticals (e.g., `insurance-agent` already exists). For those, implement the **extended** version with additional fields from the prompt, and don't create a new slug — update the existing route file.

**Same per-vertical approach as Phase 8.**

---

## Phase 11 — Verticals Wave 4: Commerce P3 Tail + Set J (Sets C, J)

**When:** After Phase 10  
**Est:** ~36 hours (43 verticals — the largest set)

| Set | Count | Verticals |
|---|---|---|
| C | 15 | artisanal-mining, borehole-driller, building-materials, car-wash, cleaning-company, electrical-fittings, generator-dealer, hair-salon, petrol-station, phone-repair-shop, shoemaker, spare-parts, tyre-shop, used-car-dealer, water-vendor |
| J | 28 | furniture-maker, gas-distributor, generator-repair, handyman, hotel, it-support, laundry, logistics-delivery, optician, pharmacy-chain, tailor, printing-press, laundry-service, iron-steel, land-surveyor, market-association, ministry-mission, motivational-speaker, motorcycle-accessories, nursery-school, oil-gas-services, okada-keke, orphanage, paints-distributor, plumbing-supplies, govt-school, gym-fitness, internet-cafe |

**Set J requires special attention:**
- `orphanage`: absolute P13 — children's data. Requires additional consent gates and FMWASD compliance notes
- `pharmacy-chain`: negotiation disabled (enforce in route)
- `hotel`: booking flow (appointment-style FSM)
- `govt-school`: SUBEB/UBEC compliance fields

---

## Phase 12 — React PWA Frontend

**When:** After Phase 4 (brand-runtime and public-discovery APIs must be stable)  
**Est:** 80h+ (this is the largest single phase)  
**Backlog:** FEAT-002

This phase covers the tenant-facing React workspace application. It does not replace brand-runtime (which is SSR for public-facing branded sites) — it is the private workspace dashboard.

**Subphases:**

### P12-A — Auth Flows (10h)
- Login, registration, password reset, MFA (TOTP)
- JWT refresh token flow
- Protected route wrapper

### P12-B — Workspace Dashboard Shell (8h)
- Sidebar navigation with vertical-aware menu
- Notification panel
- User profile + settings

### P12-C — POS Module (10h)
- Product/service listing (from offerings API)
- Cart and checkout (Paystack integration)
- Order history

### P12-D — Offerings Management (8h)
- Create/edit/delete offerings (products, services, events)
- Pricing in naira (UI in naira, stored in kobo — conversion layer in the UI only)
- Image upload to R2

### P12-E — Vertical-Specific Views (12h)
- Each P1 vertical gets its own dashboard section
- Driven by `vertical_slug` on the workspace

### P12-F — PWA Compliance (6h)
- Service worker, manifest, offline fallback
- Push notifications (Web Push API for new orders)

### P12-G — Mobile First (8h)
- All views at 360px base viewport
- Bottom navigation for mobile
- Touch targets ≥ 44px

### P12-H — E2E Tests (8h)
- Login → create offering → checkout flow (Playwright or Puppeteer)
- Mobile viewport smoke test

---

## Phase 13 — Vertical Route Tests Phase 2 (All P1 Verticals)

**When:** After Phase 8  
**Est:** ~20 hours  
**Backlog:** HIGH-006 Phase 2

For all 34 P1 verticals not covered in P3-D, create test files following the same pattern. Each file: ≥ 10 tests, T3 isolation, P9 monetary, FSM transitions.

**34 P1 verticals:** restaurant, pos-business (extended), supermarket, fashion-brand, wholesale-market, politician (extended), political-party, church (extended), ngo, cooperative, lga-office, motor-park, mass-transit, rideshare, haulage, clinic (extended), pharmacy, gym, school (extended), vocational-center, tutoring, creator, sole-trader, professional, savings-group, insurance-agent, community-radio, startup, farm, poultry-farm, produce-aggregator, market, warehouse, tech-hub.

---

## Phase 14 — Load Testing + UX Polish + Performance

**When:** After Phase 12  
**Est:** ~40 hours  
**Items are independent [parallel]**

### P14-A: MED-008 — Load Testing (8h)
Set up k6 test suite with baseline scenarios. Store results in `docs/qa/load-baseline-2026.md`.

### P14-B: UX Items (16h)
UX-01 (ARIA), UX-05 (form validation UI), UX-06 (dark mode), UX-07 (responsive nav), UX-08 (USSD depth), UX-09 (error recovery), UX-10 (confirmation dialogs), UX-12 (breadcrumbs), UX-13 (toast notifications), UX-14 (discovery cards)

### P14-C: Performance Items (10h)
PERF-05 (FTS5 for templates), PERF-07 (static asset generation), PERF-09 (lazy vertical loading), PERF-10 (ETag support), PERF-11 (D1 batch optimization)

### P14-D: Architecture (6h)
ARC-14 (dependency injection), ARC-16 (event replay docs), ARC-18 (service worker cache versioning), QA-12 (visual regression tests)

---

## Phase 15 — Seed CSV Dedup + Final Governance Audit

**When:** Any time (independent)  
**Est:** ~2 hours  
**Backlog:** FEAT-003

1. Run duplicate check: `awk -F',' '{print $2}' infra/db/seeds/0004_verticals-master.csv | sort | uniq -d`
2. Fix any duplicate slugs (the `driving-school` known issue)
3. Verify `UNIQUE` constraint on `verticals.slug` in D1 schema
4. Run `scripts/seed-geography.ts` integrity check
5. Final governance audit: run all 10 governance CI scripts manually and verify clean

---

## Total Summary

| Phase | Items | Est Hours | Parallel? |
|---|---|---|---|
| P1 Critical Fixes | 3 | 4h | Yes |
| P2 Foundation | 4 | 10h | Partially |
| P3 Test Coverage | 6 | 16h | Yes |
| P4 Production Quality | 3 | 24h | Partially |
| P5 Partner Phase 3 | 1 | 10h | After P2 |
| P6 Admin Features | 5 | 12h | Yes |
| P7 Architecture Hardening | 5 | 10h | Yes |
| P8 Verticals Wave 1 | 27 | 28h | Yes |
| P9 Verticals Wave 2 | 31 | 30h | Yes |
| P10 Verticals Wave 3 | 24 | 24h | Yes |
| P11 Verticals Wave 4 | 43 | 36h | Yes |
| P12 React PWA | 8 subphases | 80h+ | Partially |
| P13 Vertical Tests Phase 2 | 34 | 20h | Yes |
| P14 Load Test + UX + Perf | 20+ | 40h | Yes |
| P15 Dedup + Audit | 2 | 2h | Yes |
| **TOTAL** | **~220** | **~346h** | — |

---

## Recommended Execution Order

```
P1 (now) → P2 (parallel A+B, parallel C+D)
         → P3 (all parallel, after P2)
         → P4 (parallel A+B, then C after both)
         → P5 (parallel with P3)
         → P6 (all parallel, after P2)
         → P7 (all parallel, after P2)
         → P8 (after P2, all verticals parallel)
         → P9 (after P8)
         → P10 (after P9)
         → P11 (after P10)
         → P13 (after P8, parallel with P9)
         → P12 (after P4, largest phase)
         → P14 (after P12)
         → P15 (any time)
```

**Human actions that must happen in parallel with P1:**
- Rotate the Cloudflare API token (TOKEN-ROTATE in `human-action-items.md`)
- Set third-party secrets (EXT-SECRETS)
- Seed super admin (SUPER-ADMIN)

Without the third-party secrets, any tests or routes touching Paystack/Prembly/Termii will use mocks. This is acceptable for development but required before staging smoke tests.

---

*Plan prepared: 2026-04-13*  
*Based on backlog: `docs/ops/implementation-backlog.md`*  
*Test baseline: 558 passing (will grow with each phase)*
