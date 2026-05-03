# WebWaka OS — Risk Register

**Date:** 2026-05-03  
**Branch:** `staging`  
**Status:** Authoritative for Master Refactor program

---

## Risk Classification

| Severity | Meaning |
|----------|---------|
| 🔴 CRITICAL | Blocks launch or causes data loss / security breach |
| 🟠 HIGH | Significant platform quality or reliability risk |
| 🟡 MEDIUM | Functional gap or technical debt |
| 🟢 LOW | Minor quality or documentation issue |

---

## Active Risks

### R-001 — POS Entitlement Gates Missing
**Severity:** 🔴 CRITICAL  
**Track:** T1 Architecture / T2 Control Plane  
**Description:** 20+ POS routes in `apps/api/src/routes/pos.ts` and `pos-business.ts` lack `requireLayerAccess` entitlement checks. JWT auth is present but subscription-tier gate is missing. Free-plan tenants can access paid Pillar 1 POS functionality without a commerce subscription.  
**Evidence:** Forensics report 2026-04-25 §2.1 route coverage table — all POS routes show `❌ MISSING` in Entitlement Gate column.  
**Mitigation:** Apply `workspaceEntitlementContext` + `requireEntitlement('pos')` to all POS route handlers.  
**Owner:** Engineering  
**Wave:** Wave 1 (Foundations)

---

### R-002 — auth-tenancy Package is a Dead Stub
**Severity:** 🔴 CRITICAL  
**Track:** T1 Architecture  
**Description:** `packages/auth-tenancy/src/` contains only `.gitkeep` and `export {}`. The package is listed in ARCHITECTURE.md as the canonical tenant resolution package and is presumably depended upon by other packages, but does nothing.  
**Evidence:** `find packages/auth-tenancy/src -type f` → only `.gitkeep`  
**Risk:** Any package that imports from `@webwaka/auth-tenancy` gets an empty export. Bugs may be silently swallowed.  
**Mitigation:** Decision required: (A) Implement tenancy primitives here, (B) Delete stub and redirect imports to `@webwaka/auth`. Must audit all import sites.  
**Owner:** Architecture  
**Wave:** Wave 1 (Foundations)

---

### R-003 — No Real Admin UI for Super-Admin Operations
**Severity:** 🔴 CRITICAL  
**Track:** T4 Frontend  
**Description:** `apps/platform-admin` is a Node.js dev shim serving vanilla HTML files (`index.html`, `control-plane.html`, `wallet.html`). This is explicitly documented as "local dev only" and "NOT deployed to production." The `apps/admin-dashboard` has only two React components and a shell index.ts.  
**Impact:** Platform operators cannot manage plans, tenants, partners, flags, or entitlements through any real UI. All admin operations require direct D1 SQL or API calls with JWT.  
**Mitigation:** Wave 2 — rebuild platform-admin as proper React SPA consuming existing control-plane APIs.  
**Owner:** Engineering (Frontend)  
**Wave:** Wave 2 (Frontend MVP)

---

### R-004 — Production Never Deployed
**Severity:** 🟠 HIGH  
**Track:** T8 Market Readiness  
**Description:** Production D1 (`webwaka-production`) has no migrations applied. `api.webwaka.com` does not point to a CF Worker. The 16 ops gate items (G1–G9) in `WAVE4_CHECKLIST.md` are all pending.  
**Impact:** Platform cannot be used by real users until this is complete.  
**Mitigation:** Execute WAVE4_CHECKLIST.md ops gates after Wave 1+2 code work is complete.  
**Owner:** Founder + Engineering  
**Wave:** Wave 5 (Launch Readiness)

---

### R-005 — Cloudflare CRON Limit at Capacity
**Severity:** 🟠 HIGH  
**Track:** T7 Hardening  
**Description:** CF Workers has a 5-cron-trigger limit per account. Currently at capacity. No new cron workers can be added without removing an existing one.  
**Impact:** Future scheduled jobs (analytics refresh, data quality sweeps, etc.) cannot be added as separate CRON workers.  
**Mitigation:** Route additional scheduled jobs through existing scheduler worker or negotiate CF limit increase. Document before any new scheduled feature design.  
**Owner:** Engineering  
**Wave:** Wave 1 (note only)

---

### R-006 — D1 Primary Location in WNAM (High Latency for Nigeria)
**Severity:** 🟠 HIGH  
**Track:** T8 Market Readiness  
**Description:** D1 `primary_location = "wnam"` means all D1 writes route to Western North America. For Nigeria-based users, read/write latency is non-trivial (200–400ms RTT).  
**ADR reference:** ADR-0044 — deferred until CF D1 supports African read replicas  
**Mitigation:** Pre-positioned (`read_replication = { mode = 'auto' }`). Monitor CF announcements for African D1 regions. Offset with aggressive KV caching for read-heavy paths.  
**Owner:** Architecture  
**Wave:** Long-term / CF platform dependency

---

### R-007 — Dual Public Discovery Surfaces
**Severity:** 🟡 MEDIUM  
**Track:** T4 Frontend / T1 Architecture  
**Description:** Both `apps/public-discovery` (SSR Hono Worker) and `apps/discovery-spa` (Vite SPA) exist. Unclear which is canonical for production. Users may hit different surfaces depending on routing.  
**Mitigation:** Designate `discovery-spa` as canonical (better mobile UX, PWA-capable). Keep `public-discovery` as SEO/SSR fallback if needed. Define migration path.  
**Owner:** Architecture + Frontend  
**Wave:** Wave 2/3

---

### R-008 — Dual Partner Admin Surfaces
**Severity:** 🟡 MEDIUM  
**Track:** T4 Frontend  
**Description:** Both `apps/partner-admin` (old Hono Worker) and `apps/partner-admin-spa` (Vite SPA) exist. Hono Worker may be deployed; SPA may also be deployed.  
**Mitigation:** Define partner-admin-spa as canonical. Retire old Hono worker once SPA covers all features.  
**Owner:** Frontend  
**Wave:** Wave 2

---

### R-009 — Vertical Package Explosion (175 packages)
**Severity:** 🟡 MEDIUM  
**Track:** T5 Vertical Engine  
**Description:** 175 individual `@webwaka/verticals-*` packages with mostly duplicated structure create enormous maintenance overhead. Each new vertical requires a new package, tests, routes, and migration.  
**Mitigation:** Vertical-engine provides configuration-driven alternative. Migration in progress (parity tests passing). Phase to absorb verticals over Waves 3–4.  
**Owner:** Architecture  
**Wave:** Wave 3

---

### R-010 — design-system Package is a Stub
**Severity:** 🟡 MEDIUM  
**Track:** T4 Frontend  
**Description:** `packages/design-system` contains only `.gitkeep`. The `--ww-*` CSS variables used in workspace-app are informal and not formally centralized.  
**Impact:** Inconsistent design across frontend apps. No shared token system.  
**Mitigation:** Extract `--ww-*` tokens from workspace-app into design-system package. Create shared components for buttons, inputs, cards, etc.  
**Owner:** Frontend  
**Wave:** Wave 2

---

### R-011 — ESLint 238 Warnings (api package)
**Severity:** 🟢 LOW  
**Track:** T7 Hardening  
**Description:** 238 ESLint warnings in `apps/api` mask potential real issues. Primarily `explicit-function-return-type` and `no-console` on vertical route files.  
**Mitigation:** Batch-fix return types via codemod; gate `no-console` with a logger wrapper. Target: < 20 warnings.  
**Owner:** Engineering  
**Wave:** Wave 1 (as capacity allows)

---

### R-012 — SMOKE_API_KEY Not Provisioned
**Severity:** 🟢 LOW  
**Track:** T7 Hardening  
**Description:** k6 smoke test cannot authenticate against staging. `continue-on-error: true` prevents CI gate failure but means authenticated smoke coverage is absent.  
**Mitigation:** Generate a service-account API key for staging; add as `SMOKE_API_KEY` GitHub secret.  
**Owner:** Engineering (5-minute ops task)  
**Wave:** Wave 1

---

### R-013 — .bak Migration Files in Forward Directory
**Severity:** 🟢 LOW  
**Track:** T7 Hardening  
**Description:** Files `0306_*.sql.bak`, `0307_*.sql.bak`, `0308_*.sql.bak`, `0309_*.sql.bak` exist in `apps/api/migrations/`. Governance check `check-no-rollback-in-forward-dir.ts` only catches `.rollback.sql` patterns, not `.bak` patterns.  
**Mitigation:** Move to `infra/db/migrations/bak/` or delete. Update governance check to also reject `.bak` files.  
**Owner:** Engineering  
**Wave:** Wave 1 (housekeeping)

---

## Risk Summary Matrix

| ID | Severity | Track | Wave | Owner |
|----|----------|-------|------|-------|
| R-001 POS entitlement gaps | 🔴 CRITICAL | T1/T2 | W1 | Engineering |
| R-002 auth-tenancy stub | 🔴 CRITICAL | T1 | W1 | Architecture |
| R-003 No real admin UI | 🔴 CRITICAL | T4 | W2 | Engineering |
| R-004 Production not deployed | 🟠 HIGH | T8 | W5 | Founder+Eng |
| R-005 CRON limit | 🟠 HIGH | T7 | W1 (note) | Engineering |
| R-006 D1 WNAM latency | 🟠 HIGH | T8 | Long-term | Architecture |
| R-007 Dual discovery surfaces | 🟡 MEDIUM | T4/T1 | W2/W3 | Architecture |
| R-008 Dual partner-admin | 🟡 MEDIUM | T4 | W2 | Frontend |
| R-009 Vertical explosion | 🟡 MEDIUM | T5 | W3 | Architecture |
| R-010 Design-system stub | 🟡 MEDIUM | T4 | W2 | Frontend |
| R-011 238 ESLint warnings | 🟢 LOW | T7 | W1 | Engineering |
| R-012 SMOKE_API_KEY missing | 🟢 LOW | T7 | W1 | Engineering |
| R-013 .bak migration files | 🟢 LOW | T7 | W1 | Engineering |
