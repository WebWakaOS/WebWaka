# WebWaka OS — 1.0.0 Stable Foundation + Template Architecture Plan

**Date:** 2026-04-11  
**Author:** Replit Agent (exhaustive codebase audit + SaaS research)  
**Status:** DRAFT — PENDING FOUNDER REVIEW  
**Repo:** https://github.com/WebWakaOS/WebWaka (staging branch)

---

## SECTION 1 — CURRENT STATE (Evidence-Based)

### 1.1 Platform Health Score: **8.5 / 10**

| Dimension | Score | Evidence |
|---|---|---|
| Architecture | 9/10 | 176 packages, strict monorepo, Cloudflare-first, 0 type errors |
| Security | 9/10 | 10/10 security baseline sections compliant; JWT + tenant isolation + rate limit + audit log all live |
| Governance | 9/10 | 16/18 invariants enforced (89%); 10 CI governance checks passing |
| Completeness | 8/10 | 143 verticals, 206 D1 migrations, 124+ route files, 9 apps deployed |
| Test Coverage | 7/10 | 279 API tests, 68 superagent tests, 36 FSM tests — but smoke tests skipped in CI |
| Monitoring | 6/10 | Audit log in D1; no error tracking (Sentry/Honeycomb), no uptime monitoring configured |
| Frontend | 6/10 | Platform Admin is a static landing page; admin-dashboard and partner-admin are stubs |
| Template Infra | 0/10 | No template registry, marketplace, validator, or blueprint format yet |

---

### 1.2 Strengths (Evidence-Cited)

**S1 — Governance-First Architecture**  
16/18 platform invariants enforced via CI (10 automated governance checks). Every violation is a CI failure. Source: `scripts/governance-checks/`, `docs/governance/compliance-dashboard.md`.

**S2 — Industrial-Scale Vertical Coverage**  
143 verticals across 14 categories (commerce, health, transport, civic, financial, etc.), each with FSM state machine, entitlements matrix, KYC tier enforcement, and sector-specific routes. Source: `packages/verticals-*/`, `apps/api/src/routes/verticals/`.

**S3 — Strong Security Posture**  
JWT auth with MissingTenantContextError; rate limiting via CF KV (CF-Connecting-IP, not forgeable); Zod input validation on all handlers; parameterized SQL only; audit logging on all destructive + financial routes; NDPR consent gate on AI routes. Source: `apps/api/src/middleware/`, `docs/governance/security-baseline.md`.

**S4 — Production-Grade Database Architecture**  
206 D1 SQL migrations — every single one has a paired rollback script (419 files total). Proper indexes, constraints, and foreign keys documented. Source: `infra/db/migrations/`.

**S5 — Robust Offline + USSD Capability**  
Background Sync + IndexedDB queue in service workers; `packages/offline-sync/` for queue management; dedicated USSD gateway app with Africa's Talking integration; USSD-exclusion middleware on AI routes. Source: `apps/ussd-gateway/`, `apps/*/public/sw.js`.

**S6 — Fully Wired CI/CD**  
5 GitHub Actions workflows (CI, deploy-staging, deploy-production, check-core-version, governance-check). CodeQL active. Last production run: 2026-04-10 23:17 UTC — all 7 jobs passed. Source: `docs/HANDOVER.md`.

**S7 — Claims FSM (T7 Invariant)**  
8-state FSM with typed transition guards and 36 tests. Seeded entities → claimed → verified → managed lifecycle enforced end-to-end. Source: `packages/claims/src/state-machine.ts`.

**S8 — Vendor-Neutral AI (P7 + P8)**  
Provider abstraction layer in `packages/ai-abstraction/` + `packages/ai-adapters/`. BYOK (Bring Your Own Key) with AES-256-GCM key encryption. L1/L2/L3 autonomy tiers per vertical — law firms and tax consultants at L3 HITL (human-in-the-loop). CI blocks any direct AI SDK imports. Source: `packages/superagent/`, CI: `check-ai-direct-calls.ts`.

---

### 1.3 Critical Gaps (Evidence-Cited)

**G1 — No Template Infrastructure [BLOCKING for template marketplace]**  
There is no template registry DB table, no blueprint format, no validator, no marketplace API, no installer. `docs/templates/` has a research template and a vertical-brief template as Markdown files — these are planning artifacts, not runtime infrastructure. Resolution: Section 3 of this plan.

**G2 — Smoke Tests Skipped in CI [HIGH]**  
CI deploy pipeline comment: `# Smoke tests — skipped until Milestone 3 implements test suite`. Post-production remediation plan (DEPLOY-004 etc.) targeted this but status in current codebase is unverified in Replit environment. Source: `docs/production-remediation-plan-2026-04-10.md`, CI workflow files.

**G3 — Frontend Dashboards Are Stubs [HIGH]**  
`apps/admin-dashboard/src/index.ts` is a Hono worker with placeholder routes. `apps/partner-admin/` and `apps/tenant-public/` are similarly incomplete. `apps/platform-admin/` is a static landing page (Milestone 1 shim). Full React-based admin UIs are not yet built. Source: `apps/admin-dashboard/src/index.ts`.

**G4 — P3 Africa-First Not Implemented [MEDIUM]**  
Invariant P3 is documented with an expansion architecture (country_id abstraction, multi-currency, payment provider interface) but the implementation is Nigeria-only (NGN kobo, Paystack, Nigerian geography). Multi-country expansion requires a significant refactor of `packages/geography/`, `packages/payments/`, and all KYC/regulatory modules. Source: `docs/governance/compliance-dashboard.md` (P3 row).

**G5 — No Monitoring / Error Tracking [MEDIUM]**  
The audit log writes to D1 (append-only), but there is no integration with Sentry, Honeycomb, or Cloudflare Analytics for real-time error tracking, latency percentiles, or alert thresholds. Source: absence in all apps.

**G6 — T8 Step-by-Step Commits Is Process-Only [LOW]**  
Platform Invariant T8 requires small, coherent commits. Current workflow uses batched agent commits with audit trails in governance docs. This is a process discipline gap, not a code gap. Source: `docs/governance/compliance-dashboard.md` (T8 row).

**G7 — No Published API Documentation [MEDIUM]**  
124+ routes across 9 apps are documented in route-map comments at the top of `index.ts` files but there is no published OpenAPI/Swagger spec, no developer portal, and no external-facing API reference. Source: `apps/api/src/index.ts` (comments only).

---

### 1.4 Blockers (Must Fix First)

| ID | Blocker | Impact | Fix |
|---|---|---|---|
| BLK-001 | Smoke tests skipped in CI | Production regressions may go undetected | Wire `tests/smoke/` into deploy-staging.yml |
| BLK-002 | Admin dashboard is a stub | Platform operators cannot manage the platform | Build React admin UI (Sprint 2) |
| BLK-003 | No template registry table | Template marketplace cannot launch | Add D1 migration 0206+, registry API (Sprint 1) |
| BLK-004 | No API documentation | External developers cannot integrate | Generate OpenAPI spec from Hono routes (Sprint 3) |

---

## SECTION 2 — 1.0.0 STABILIZATION ROADMAP

> Total effort: **10 working days** across 3 sprints.  
> Platform is at v1.0.0 tag but stabilization work targets a hardened **v1.0.1** patch release.

---

### Sprint 1: Critical Fixes (3 days)

#### Task 1.1 — Wire Smoke Tests into CI

**Files:**  
- `.github/workflows/deploy-staging.yml`  
- `tests/smoke/package.json`  
- `tests/smoke/health.test.ts`

**Work:**  
1. Add `SMOKE_API_KEY` secret to GitHub repo and CF Workers.  
2. Add `/version` endpoint to `apps/api/src/routes/health.ts` returning `{ version: "1.0.0", env: "staging" }`.  
3. Uncomment and wire smoke test step in `deploy-staging.yml`: `pnpm --filter @webwaka/smoke-tests run test`.  
4. Smoke suite must cover: `/health`, `/geography/places/1`, `/discovery/search?q=test`, `/claim/status/:id`, `/public/:tenantSlug`.

**Acceptance Criteria:**  
- `wrangler deploy --env staging` → smoke tests run → green CI badge.  
- Failed smoke test blocks production deploy gate.

**Tests:** All existing smoke test files must pass with real staging API.

---

#### Task 1.2 — Template Registry: D1 Migrations

**Files:**  
- `infra/db/migrations/0206_create_template_registry.sql`  
- `infra/db/migrations/0206_create_template_registry.rollback.sql`  
- `infra/db/migrations/0207_create_template_installations.sql`  
- `infra/db/migrations/0207_create_template_installations.rollback.sql`

**Schema:**

```sql
-- 0206: Template registry
CREATE TABLE IF NOT EXISTS template_registry (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK(template_type IN ('dashboard','website','vertical-blueprint','workflow','email','module')),
  version TEXT NOT NULL,                       -- semver: "1.0.0"
  platform_compat TEXT NOT NULL,               -- semver range: "^1.0.0"
  compatible_verticals TEXT NOT NULL DEFAULT '[]', -- JSON array of vertical slugs, [] = all
  manifest_json TEXT NOT NULL,                 -- full manifest blob
  author_tenant_id TEXT,                       -- NULL = platform-native template
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','pending_review','approved','deprecated')),
  is_free INTEGER NOT NULL DEFAULT 1,
  price_kobo INTEGER NOT NULL DEFAULT 0,
  install_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_template_registry_type ON template_registry(template_type);
CREATE INDEX idx_template_registry_status ON template_registry(status);

-- 0207: Template installations per tenant
CREATE TABLE IF NOT EXISTS template_installations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  template_id TEXT NOT NULL REFERENCES template_registry(id),
  template_version TEXT NOT NULL,
  installed_at INTEGER NOT NULL,
  installed_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','rolled_back','failed')),
  config_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE(tenant_id, template_id)
);
CREATE INDEX idx_template_installations_tenant ON template_installations(tenant_id);
```

**Acceptance Criteria:**  
- `wrangler d1 migrations apply webwaka-d1-staging` exits 0.  
- Rollback scripts verified: apply → rollback → apply again succeeds.

---

#### Task 1.3 — Template Registry API

**Files:**  
- `apps/api/src/routes/templates.ts` (new)  
- `apps/api/src/index.ts` (mount route)

**Routes:**

```
GET  /templates                     — list approved templates (no auth, paginated)
GET  /templates/:slug               — get template manifest (no auth)
POST /templates                     — publish template (auth + super_admin)
POST /templates/:slug/install       — install template to tenant (auth + tenant admin)
GET  /templates/installed           — list tenant's installed templates (auth)
DELETE /templates/:slug/install     — rollback template install (auth + tenant admin)
```

**Acceptance Criteria:**  
- `GET /templates` returns paginated list with filter by `type` and `vertical`.  
- `POST /templates/:slug/install` validates platform compat semver range before installing.  
- All routes have Zod input validation.  
- `tenant_id` scoped on install/list endpoints (T3).

---

#### Task 1.4 — Template Compatibility Validator

**Files:**  
- `packages/verticals/src/template-validator.ts` (new)

**Logic:**  
```typescript
export function validateTemplateManifest(manifest: unknown): ValidationResult
export function checkPlatformCompatibility(manifestPlatformCompat: string, platformVersion: string): boolean
export function checkVerticalCompatibility(manifestVerticals: string[], targetVertical: string): boolean
```

- Uses Zod to validate manifest structure.  
- Uses `semver` to evaluate `platform_compat` range against current platform version.  
- Returns typed `ValidationResult` with `valid: boolean`, `errors: string[]`.

**Tests:** `packages/verticals/src/template-validator.test.ts` — 15+ cases covering valid manifests, version mismatches, missing required fields.

---

### Sprint 2: Production Hardening (5 days)

#### Task 2.1 — Error Tracking Integration

**Files:**  
- `packages/logging/src/error-tracker.ts`  
- `apps/api/src/index.ts` (global error handler)

**Work:**  
1. Add Cloudflare Workers-compatible error reporting (use Cloudflare's native `console.error` + structured logs to Cloudflare Logpush, or integrate Sentry's `@sentry/cloudflare` package).  
2. Global `onError` handler in Hono: captures unhandled errors, logs structured JSON `{ level, error, route, tenantId, timestamp }` to `console.error` (picked up by Cloudflare Logpush).  
3. Add `LOGPUSH_ENDPOINT` to `wrangler.toml` vars section.  
4. Document alert thresholds in `docs/governance/incident-response.md` (P99 > 500ms = alert, error rate > 1% = page).

**Acceptance Criteria:**  
- All unhandled errors in production appear as structured logs in Cloudflare dashboard.  
- No PII in log output (tenant_id OK, user data NOT OK).

---

#### Task 2.2 — Admin Dashboard React Shell

**Files:**  
- `apps/admin-dashboard/src/index.ts` (Hono shell — already exists)  
- `apps/admin-dashboard/public/` (new — React SPA via Vite build artifact)  
- `apps/admin-dashboard/vite.config.ts` (new)

**Work:**  
Build a React + Vite SPA for the tenant admin dashboard. This is the Pillar 1 operator UI.

**Required Views (Milestone 1 of admin UI):**

| View | Route | Description |
|---|---|---|
| Overview | `/` | KPIs: active members, revenue this month, offline sync queue depth |
| Verticals | `/verticals` | List of enabled verticals, their FSM state, KYC requirements |
| Members | `/members` | Member list with role, KYC tier, last active |
| Claims | `/claims` | Pending claims queue, advance/reject actions |
| Entitlements | `/entitlements` | Current plan, feature gates, upgrade CTA |
| Templates | `/templates` | Installed templates, marketplace browse |

**Design Constraints:**  
- 360px mobile-first (P4).  
- PWA manifest + service worker (P5).  
- Offline-capable overview (cached KPI snapshot via `packages/offline-sync/`) (P6).  
- All API calls use `Authorization: Bearer <jwt>` header.

**Acceptance Criteria:**  
- `wrangler deploy --env staging --config apps/admin-dashboard/wrangler.toml` succeeds.  
- All 6 views render without console errors.  
- Lighthouse PWA score ≥ 90.

---

#### Task 2.3 — OpenAPI Specification

**Files:**  
- `docs/api/openapi.yaml` (new — auto-generated + hand-curated)  
- `apps/api/src/routes/openapi.ts` (new — serve spec at `/openapi.json`)

**Work:**  
1. Use `hono-openapi` or `zod-openapi` to generate an OpenAPI 3.1 spec from existing Zod schemas and route definitions.  
2. Mount `GET /openapi.json` returning the spec (no auth).  
3. Mount `GET /docs` serving Scalar or Redoc UI.  
4. Commit generated `docs/api/openapi.yaml` to repo — kept in sync via CI step.

**Acceptance Criteria:**  
- `/openapi.json` returns valid OAS 3.1 document.  
- All 50+ documented routes appear with request/response schemas.  
- CI step validates spec on every push: `npx @redocly/cli lint docs/api/openapi.yaml`.

---

#### Task 2.4 — Partner Admin React Shell

**Files:**  
- `apps/partner-admin/src/` (expand existing stub)

**Work:**  
Partner-facing UI for managing branded tenant instances. Mirrors admin-dashboard architecture.

**Required Views:**

| View | Route | Description |
|---|---|---|
| Tenants | `/tenants` | List of managed tenants, status, plan |
| Branding | `/branding/:tenantId` | White-label theme editor (colors, logo, fonts) |
| Templates | `/templates` | Deploy templates to managed tenants |
| Analytics | `/analytics` | Cross-tenant rollup (geography-driven per T6) |

---

#### Task 2.5 — Monitoring Dashboard

**Files:**  
- `docs/governance/monitoring-runbook.md` (new)

**Work:**  
1. Enable Cloudflare Workers Analytics in dashboard for all 4 Workers apps.  
2. Configure Cloudflare Logpush to send structured logs to a log aggregator (e.g., Cloudflare R2 → query with Cloudflare Analytics Engine, or external service).  
3. Define and document alert thresholds:  
   - Error rate > 1% over 5min → PagerDuty/email  
   - P99 latency > 2s over 5min → Slack  
   - D1 query timeout rate > 0.1% → PagerDuty  
4. Document runbook steps for each alert type.

---

### Sprint 3: Docs + Governance (2 days)

#### Task 3.1 — Template Developer Guide

**Files:**  
- `docs/templates/template-spec.md` (new)  
- `docs/templates/validation.md` (new)  
- `docs/templates/publishing.md` (new)  
- `docs/templates/implementer-guide.md` (new)  
- `docs/templates/platform-admin-guide.md` (new)

**Content:**  
See Section 5 (Execution Docs + Guides) of this plan for full content specifications.

---

#### Task 3.2 — Africa-First Expansion Architecture (P3)

**Files:**  
- `docs/governance/africa-first-expansion.md` (new — detailed design doc)  
- `packages/geography/src/country.ts` (new interface stub)  
- `packages/payments/src/provider-interface.ts` (new interface stub)

**Work:**  
P3 is currently documented but not implemented. This task:  
1. Writes the formal expansion architecture TDR (country_id column strategy, payment provider interface, multi-currency layer, regulatory abstraction).  
2. Adds `CountryConfig` interface to `packages/geography/` — all Nigeria-specific code wraps this interface.  
3. Adds `PaymentProvider` interface to `packages/payments/` — Paystack implements it.  
4. Does NOT implement multi-country support (that is post-1.x) — only makes the architecture explicit and the interfaces concrete.

**Acceptance Criteria:**  
- P3 compliance-dashboard row moves from ⚠️ DOCUMENTED to ✅ ARCHITECTURE COMPLETE.  
- TypeScript interfaces defined and exported (compile-clean).  
- TDR approved by Founder.

---

#### Task 3.3 — 1.0.1 Release Notes + Governance Update

**Files:**  
- `RELEASES.md` (update v1.0.1 section)  
- `docs/governance/milestone-tracker.md` (update)  
- `docs/governance/compliance-dashboard.md` (update post-sprint scores)

---

## SECTION 3 — TEMPLATE ARCHITECTURE DESIGN

### 3.1 Core Principles

Informed by analysis of: Shopify Apps (manifest + capability declarations), Salesforce AppExchange (security review + compatibility matrix), Webflow Templates (configurable zones), WordPress Plugins (hook/filter + lifecycle), VS Code Extensions (contribution points + activation events), Strapi plugins (admin panel injection), Vercel Templates (env var contract).

**Design Decisions:**

| Decision | Rationale |
|---|---|
| Manifest-driven (not code injection) | Security: templates declare what they need; platform grants access — no arbitrary code execution in tenant context |
| Semver compatibility range | Prevents template breakage on platform upgrades; aligns with VS Code/npm approach |
| Template types are additive, not replacement | Templates extend platform defaults, never replace core FSM/entitlement logic |
| P1 Compliance: templates compose from shared packages | A dashboard template uses `@webwaka/design-system`; it cannot reimplement UI primitives |
| Installer transaction: apply + rollback atomically | If install fails at any step, rollback is guaranteed — DB migration pattern applied to templates |
| Marketplace review gate | All community templates require super_admin approval before `status = 'approved'` |

---

### 3.2 Template Manifest Format (v1.0)

Every template is described by a `manifest.json` at its root. This is the authoritative contract.

```jsonc
{
  "id": "webwaka-restaurant-dashboard-v1",
  "slug": "restaurant-dashboard",
  "display_name": "Restaurant Operations Dashboard",
  "description": "Full POS, menu management, table booking, and daily summary for restaurant operators.",
  "template_type": "dashboard",             // dashboard | website | vertical-blueprint | workflow | email | module
  "version": "1.0.0",                       // semver
  "platform_compat": "^1.0.0",             // semver range — templates are tested against this platform range
  "compatible_verticals": ["restaurant", "restaurant-chain", "catering"],  // [] = all verticals
  "author": {
    "name": "WebWaka Platform Team",
    "tenant_id": null,                      // null = platform-native
    "contact": "platform@webwaka.com"
  },
  "permissions": [
    "read:workspace",
    "read:members",
    "read:offerings",
    "write:offerings",
    "read:analytics"
  ],
  "entrypoints": {
    "dashboard": "dashboard.html",          // for dashboard templates
    "public_site": null,                    // for website templates
    "api_extension": null                   // for module templates
  },
  "config_schema": {                        // JSON Schema for tenant-configurable options
    "type": "object",
    "properties": {
      "primary_color": { "type": "string", "default": "#00c851" },
      "show_table_booking": { "type": "boolean", "default": true }
    }
  },
  "events": [                               // platform events this template subscribes to
    "pos.sale.created",
    "offering.updated"
  ],
  "dependencies": {                         // other templates or modules required
    "templates": [],
    "platform_packages": ["@webwaka/pos", "@webwaka/offerings"]
  },
  "pricing": {
    "model": "free",                        // free | one_time | subscription
    "price_kobo": 0                         // T4: integer kobo only
  }
}
```

---

### 3.3 Template Types

| Type | Purpose | Installer Action |
|---|---|---|
| `dashboard` | Replaces or extends the tenant admin UI view | Registers view in dashboard nav, injects HTML/JS bundle |
| `website` | Full public-facing tenant website theme | Replaces `brand-runtime` theme tokens + layout |
| `vertical-blueprint` | Complete vertical setup: schema delta + routes + dashboard + public site | Runs D1 migration delta, mounts routes, installs dashboard + website templates |
| `workflow` | Automation: trigger → condition → action (e.g. "on new booking, send WhatsApp") | Registers workflow in event bus |
| `email` | Transactional email layout (appointment confirm, invoice, etc.) | Registers template slug in email renderer |
| `module` | Feature add-on (e.g. loyalty points, referral engine, NDPR consent UI) | Mounts API extension routes + dashboard widget |

---

### 3.4 Vertical Blueprint Format (v1.0)

A vertical blueprint is a template of type `vertical-blueprint`. It fully encapsulates everything needed to deploy a new vertical sector from scratch.

```
webwaka-vertical-blueprint-nursery-school/
├── manifest.json                  ← blueprint manifest (template_type: "vertical-blueprint")
├── blueprint.json                 ← vertical definition (slug, category, FSM, entitlements, KYC tier)
├── migrations/
│   ├── 0001_create_core_tables.sql
│   └── 0001_create_core_tables.rollback.sql
├── templates/
│   ├── dashboard/
│   │   ├── manifest.json          ← embedded dashboard template manifest
│   │   └── dashboard.html
│   ├── public-site/
│   │   ├── manifest.json          ← embedded website template manifest
│   │   └── index.html
│   └── emails/
│       ├── enrollment-confirm.html
│       └── fee-reminder.html
├── routes/
│   └── nursery-school.ts          ← Hono route file (follows vertical route pattern)
└── tests/
    └── nursery-school.test.ts
```

**`blueprint.json` structure:**

```jsonc
{
  "slug": "nursery-school",
  "display_name": "Nursery School",
  "category": "education",
  "entity_type": "organization",
  "priority": 2,
  "required_kyc_tier": 1,
  "requires_cac": true,
  "requires_frsc": false,
  "requires_it": false,
  "requires_community": false,
  "requires_social": false,
  "fsm_states": ["seeded", "claimed", "active", "suspended"],
  "fsm_transitions": [
    { "from": "seeded", "to": "claimed", "guard": "kyc_tier_1_complete" },
    { "from": "claimed", "to": "active", "guard": "cac_verified" },
    { "from": "active", "to": "suspended", "guard": "admin_action" }
  ],
  "ai_autonomy_level": 1,           // L1 = advisory only, no HITL gate
  "ussd_safe": true,
  "primary_pillars": [1, 2, 3]      // Ops + Brand + Marketplace
}
```

---

### 3.5 Template Installer Flow

```
POST /templates/:slug/install
          │
          ▼
  1. Fetch manifest from template_registry
          │
          ▼
  2. checkPlatformCompatibility(manifest.platform_compat, "1.0.1")
     → 422 if incompatible
          │
          ▼
  3. checkVerticalCompatibility(manifest.compatible_verticals, tenant.vertical)
     → 422 if not compatible
          │
          ▼
  4. validatePermissions(manifest.permissions, tenant.entitlements)
     → 403 if tenant plan doesn't support required permissions
          │
          ▼
  5. BEGIN D1 transaction
     → Apply migration deltas (if blueprint type)
     → Insert template_installations record
     → COMMIT
          │
          ▼
  6. Register in event bus (if workflow type)
          │
          ▼
  7. Return { installed: true, template_id, version, config_defaults }
```

**Rollback:** `DELETE /templates/:slug/install` runs reverse migration + sets `template_installations.status = 'rolled_back'`.

---

## SECTION 4 — FRAME REPOSITORIES (GitHub Template Repos)

Five GitHub template repositories to be created under the `WebWakaOS` organisation. Each is a starter kit that developers fork, customize, validate, and publish to the WebWaka template marketplace.

---

### Repo 1: `webwaka-dashboard-template`

A minimal, working dashboard template for the tenant admin UI.

```
webwaka-dashboard-template/
├── manifest.json                  ← template_type: "dashboard", version: "0.1.0"
├── README.md                      ← setup + customization guide
├── dashboard.html                 ← entry point (React SPA or HTMX)
├── src/
│   ├── App.tsx                    ← main component
│   ├── components/                ← KPI card, table, nav components
│   └── api/                       ← typed fetch wrappers for WebWaka API
├── permissions.json               ← required platform permissions
├── config-schema.json             ← tenant-configurable options
├── .github/
│   └── workflows/
│       └── validate.yml           ← runs waka-template-validator on push
└── package.json
```

**Target audience:** SaaS developers building tenant-specific admin views.

---

### Repo 2: `webwaka-website-template`

A full public-facing website theme for tenant brand runtime.

```
webwaka-website-template/
├── manifest.json                  ← template_type: "website"
├── index.html                     ← home page
├── pages/
│   ├── about.html
│   ├── services.html
│   ├── contact.html
│   └── [dynamic].html             ← parameterized page slots
├── tokens/
│   └── brand-tokens.css           ← CSS custom properties (uses @webwaka/white-label-theming)
├── sw.js                          ← offline-capable service worker (P5/P6)
├── manifest.web.json              ← PWA manifest
└── config-schema.json             ← color, font, logo configuration
```

---

### Repo 3: `webwaka-vertical-blueprint`

A complete vertical blueprint including DB schema, routes, dashboard, and public site.

```
webwaka-vertical-blueprint/
├── manifest.json                  ← template_type: "vertical-blueprint"
├── blueprint.json                 ← slug, FSM, entitlements, KYC, AI level
├── migrations/
│   ├── 0001_create_profiles.sql
│   └── 0001_create_profiles.rollback.sql
├── routes/
│   └── [slug].ts                  ← Hono route following vertical pattern
├── packages/
│   └── verticals-[slug]/          ← @webwaka/verticals-[slug] package stub
│       ├── package.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── repository.ts
│       │   └── fsm.ts
│       └── tsconfig.json
├── templates/
│   ├── dashboard/manifest.json
│   └── public-site/manifest.json
└── tests/
    └── [slug].test.ts
```

---

### Repo 4: `webwaka-module-template`

A feature module (API extension + optional dashboard widget).

```
webwaka-module-template/
├── manifest.json                  ← template_type: "module"
├── api/
│   └── routes.ts                  ← Hono sub-app, mounted at /api/v1/modules/:slug/*
├── widget/
│   └── widget.html                ← optional dashboard widget (iframe-sandboxed)
├── events.json                    ← platform events subscribed to and emitted
├── permissions.json               ← required platform permissions
└── package.json
```

---

### Repo 5: `webwaka-workflow-template`

An event-driven automation workflow.

```
webwaka-workflow-template/
├── manifest.json                  ← template_type: "workflow"
├── workflow.json                  ← trigger → conditions → actions DSL
├── README.md                      ← use-case, setup, testing
└── tests/
    └── workflow.test.ts           ← unit tests for condition/action logic
```

**`workflow.json` format:**
```jsonc
{
  "slug": "new-booking-whatsapp-confirm",
  "trigger": { "event": "booking.created", "vertical": "restaurant" },
  "conditions": [
    { "field": "booking.status", "op": "eq", "value": "confirmed" }
  ],
  "actions": [
    {
      "type": "send_message",
      "channel": "whatsapp",
      "template": "booking-confirmation",
      "to": "{{booking.customer_phone}}"
    }
  ]
}
```

---

## SECTION 5 — EXECUTION DOCS + GUIDES

### 5.1 Template Spec (`docs/templates/template-spec.md`)

Full manifest JSON Schema with all fields documented, field types, validation rules, and examples for each `template_type`. Includes:
- Required vs optional fields per template type
- Permission constants reference table
- Event names catalogue (all platform events)
- Config schema JSON Schema constraints
- Versioning and semver compatibility rules

### 5.2 Validation Guide (`docs/templates/validation.md`)

How to validate a template before publishing:

```bash
# Install the CLI validator (npx, no global install needed)
npx @webwaka/template-validator validate ./my-template/

# Output:
# ✅ manifest.json — valid
# ✅ platform_compat "^1.0.0" — compatible with current platform 1.0.1
# ✅ permissions — all permissions valid
# ⚠️  config-schema.json — missing 'default' for field 'primary_color' (non-fatal)
# 
# Result: VALID (1 warning)
```

Covers: manifest schema validation, permission validation, semver compat check, blueprint migration lint (every migration must have a rollback), FSM reachability check.

### 5.3 Publishing Guide (`docs/templates/publishing.md`)

Step-by-step for community developers:

```
1. Fork the appropriate frame repo (Section 4)
2. Customize: update manifest.json, implement your template
3. Validate: npx @webwaka/template-validator validate ./
4. Test: npm test (unit) + install into a local staging tenant
5. Publish: POST /templates with manifest + bundle
6. Review: Platform super_admin reviews within 5 business days
7. Approved: template.status → 'approved' → visible in marketplace
```

### 5.4 Implementer Guide (`docs/templates/implementer-guide.md`)

For tenant admins installing templates:

```
1. Browse marketplace: GET /templates?type=dashboard&vertical=restaurant
2. Preview: GET /templates/:slug → read description, permissions, config options
3. Install: POST /templates/:slug/install with { config: { primary_color: "#ff6b35" } }
4. Verify: check /templates/installed → status === 'active'
5. Configure: PATCH /templates/:slug/config with updated config_json
6. Rollback if needed: DELETE /templates/:slug/install → atomic rollback
```

### 5.5 Platform Admin Guide (`docs/templates/platform-admin-guide.md`)

For WebWaka super_admins:

```
1. Review queue: GET /templates?status=pending_review
2. Inspect: check manifest, permissions requested, migration scripts
3. Security review: verify no raw SQL injection, permissions not over-requested
4. Approve/Reject: POST /templates/:slug/review { action: 'approve' | 'reject', reason: '...' }
5. Monitor: GET /templates/:slug/installs — install count, error rate
6. Deprecate: PATCH /templates/:slug { status: 'deprecated' }
```

---

## SECTION 6 — RELEASE TIMELINE

```
Week 1: Sprint 1 (Critical Fixes)
  Day 1-2: Tasks 1.1 (smoke tests) + 1.2 (D1 migrations 0206-0207)
  Day 3:   Tasks 1.3 (template registry API) + 1.4 (template validator)
  → Tag: v1.0.1-alpha

Week 2: Sprint 2 Part A (Production Hardening)
  Day 4-5: Tasks 2.1 (error tracking) + 2.3 (OpenAPI spec)
  Day 6-7: Task 2.2 (admin dashboard React shell — Phase 1)
  Day 8:   Task 2.4 (partner admin shell)

Week 3: Sprint 2 Part B + Sprint 3
  Day 9:   Task 2.5 (monitoring runbook)
  Day 10:  Sprint 3: Tasks 3.1 + 3.2 + 3.3 (docs + Africa-First interfaces + release notes)
  → Tag: v1.0.1 (stable)

Week 4: Frame Repos + Marketplace MVP
  Create 5 GitHub template repos (Section 4)
  Seed marketplace with 5 platform-native templates:
    - webwaka-restaurant-dashboard
    - webwaka-school-dashboard
    - webwaka-motor-park-dashboard
    - webwaka-retail-website
    - webwaka-school-website
  → First 5 approved templates live in marketplace

Week 5-6: First 10 Community Templates
  Recruit 3-5 developer partners
  Publish validated guides + CLI validator
  Target: 10 approved templates in marketplace
  → Template marketplace publicly announced
```

---

## SECTION 7 — SUCCESS CRITERIA

```
v1.0.1 Stable Foundation
✅ Smoke tests wired to CI — all 5 suites passing on staging
✅ Template registry DB live (migrations 0206-0207 applied to staging + production)
✅ Template registry API with 6 routes — all tested with Zod validation
✅ Template validator package with 15+ test cases
✅ Error tracking live — structured logs in Cloudflare dashboard
✅ OpenAPI 3.1 spec at /openapi.json — all 50+ routes documented
✅ Admin dashboard React shell — 6 views, PWA score ≥ 90
✅ P3 Africa-First interfaces defined (CountryConfig, PaymentProvider)
✅ Compliance dashboard: 18/18 invariants ✅ (up from 16/18)

Template Marketplace
✅ Templates install in < 2 minutes (< 5 min SLA)
✅ New vertical deploys from blueprint in < 1 hour
✅ Marketplace has 10+ validated, approved templates
✅ Platform-native templates cover top 5 verticals by operator count
✅ Zero tenant data leaks from template installs (T3 enforced at installer layer)
✅ Every template install is fully rollback-safe
✅ Template validator CLI available: npx @webwaka/template-validator
✅ All 5 frame repos published under WebWakaOS GitHub org
✅ Developer guide, validation guide, publishing guide — all complete and reviewed
```

---

## SECTION 8 — RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Template code injection (malicious manifest) | Medium | Critical | Manifest-only (no arbitrary code execution); permission allowlist; super_admin review gate; CSP on all iframe embeds |
| Template version incompatibility breaking tenant | Medium | High | Semver compat check at install time; tested rollback path; blue/green install with dry-run flag |
| Blueprint migration conflicts with core migrations | Low | High | Blueprint migrations use a scoped namespace (0001_ prefix relative to blueprint, not global); applied inside a transaction |
| Admin dashboard performance on 2G/3G (Nigeria) | High | High | PWA + offline caching; skeleton loading; <50KB initial bundle; Cloudflare edge delivery |
| Africa-First expansion creating breaking changes | Low | Medium | Interface-only stub in Sprint 3; actual multi-country impl is post-1.x with dedicated TDR |
| Community template quality (security review bottleneck) | Medium | Medium | Automated validator catches 80% of issues; reviewer checklist; 5-day SLA with escalation path |

---

## APPENDIX A — FILE INVENTORY SUMMARY

```
Total files (excl. node_modules, .git): 2,738
Apps:        9 (api, platform-admin, admin-dashboard, partner-admin, 
                brand-runtime, public-discovery, ussd-gateway, tenant-public, projections)
Packages:    176 (143 verticals + 33 shared packages)
Migrations:  419 files = 206 SQL + 206 rollback + 7 seed files
Route files: 124+
Test files:  100+ (279 API tests + 68 superagent + 36 FSM + misc)
Docs:        60+ governance, architecture, planning, and runbook documents
```

## APPENDIX B — COMPLIANCE DASHBOARD (Post-Plan Target)

| ID | Invariant | Current | Target |
|---|---|---|---|
| P1 | Build Once Use Infinitely | ✅ | ✅ |
| P2 | Nigeria First | ✅ | ✅ |
| P3 | Africa First | ⚠️ DOCUMENTED | ✅ ARCHITECTURE COMPLETE |
| P4 | Mobile First | ✅ | ✅ |
| P5 | PWA First | ✅ | ✅ |
| P6 | Offline First | ✅ | ✅ |
| P7 | Vendor Neutral AI | ✅ | ✅ |
| P8 | BYOK Capable | ✅ | ✅ |
| T1 | Cloudflare-First Runtime | ✅ | ✅ |
| T2 | TypeScript-First | ✅ | ✅ |
| T3 | Tenant Isolation | ✅ | ✅ |
| T4 | Monetary Integrity | ✅ | ✅ |
| T5 | Subscription-Gated | ✅ | ✅ |
| T6 | Geography-Driven | ✅ | ✅ |
| T7 | Claim-First Growth | ✅ | ✅ |
| T8 | Step-by-Step Commits | ⚠️ PROCESS | ✅ (enforced via PR template + agent rules) |
| T9 | No Skipped Phases | ✅ | ✅ |
| T10 | Continuity-Friendly | ✅ | ✅ |

**Target: 18 / 18 invariants fully enforced (100%)**

---

*Plan prepared by exhaustive codebase audit + SaaS template architecture research.*  
*Requires Founder review and approval before Sprint 1 begins.*  
*All implementation follows Platform Invariant T8: step-by-step commits, CI-clean at every stage.*
