# WebWaka OS — Staged-Wave Implementation Plan

**Date:** 2026-05-03  
**Authority:** Derived from Phase 0 current-state assessment + Phase 1 research synthesis + Master Program  
**Branch:** `staging`  
**Status:** EXECUTION BASELINE — all agents must follow this plan

---

## Wave Structure Overview

| Wave | Name | Tracks | Duration | Exit Gate |
|------|------|--------|----------|-----------|
| Wave 1 | Foundations | T1, T7 | 1 session | CI green + entitlement gates + clean arch | 
| Wave 2 | Frontend MVP | T4, T2 (UI) | 2 sessions | Admin UI functional + workspace-app polished |
| Wave 3 | Vertical Consolidation | T5, T1 (cleanup) | 2 sessions | Engine adoption + package count reduced |
| Wave 4 | AI + Analytics + Market | T3, T6, T8 | 2 sessions | AI expanded + analytics live + WhatsApp + i18n |
| Wave 5 | Production Launch | T8, T7 | 1 session | All ops gates satisfied + production live |

---

## WAVE 1 — Foundations Unblockers

### Objective
Fix all critical structural issues before any frontend rebuild or feature work. Establish a clean, governable codebase foundation.

### Scope

#### 1.1 Resolve `@webwaka/auth-tenancy` Stub
**Files:** `packages/auth-tenancy/src/`  
**Decision:** Audit all import sites. If no external imports exist, delete the package entirely and remove from `pnpm-workspace.yaml`. If imports exist, implement minimal tenancy primitives (tenant context type, tenant isolation assertion helper).  
**Migration:** Update any referencing packages to import from `@webwaka/auth` instead.  
**Test:** TypeScript compilation clean after change.

#### 1.2 POS Entitlement Gates
**Files:** `apps/api/src/routes/pos.ts`, `apps/api/src/routes/pos-business.ts`  
**Change:** Apply `workspaceEntitlementContext` middleware + `requireEntitlement('pos')` (or equivalent layer check) to all 20+ POS route handlers.  
**Reference:** `apps/api/src/middleware/workspace-entitlement-context.ts` and `apps/api/src/middleware/entitlement.ts`  
**Test:** Add test that a free-plan tenant attempting a POS operation receives 403 or the appropriate entitlement error.  
**Risk:** Existing POS tests may pass a workspace without the correct `active_layers`. Update test seed data.

#### 1.3 Remove Dead Packages and Apps
- Remove `apps/tenant-public` (legacy stub superseded by brand-runtime)
- Remove or archive `packages/support-groups` (renamed to `packages/groups`)
- Update any imports/references
- Update `pnpm-workspace.yaml` to remove deleted workspace entries

#### 1.4 Clean Migration Directory
- Remove `.bak` files from `apps/api/migrations/`: `0306_*.bak`, `0307_*.bak`, `0308_*.bak`, `0309_*.bak`
- Move them to `infra/db/migrations/bak/` for historical reference
- Update governance check `check-no-rollback-in-forward-dir.ts` to also reject `.bak` files

#### 1.5 ESLint Cleanup
- Reduce warnings from 238 to < 50 in `apps/api`
- Focus on explicit `@typescript-eslint/explicit-function-return-type` on vertical route handlers
- Add `// eslint-disable-next-line` with justification comments where appropriate

#### 1.6 SMOKE_API_KEY Provision
- Generate service-account API key for staging
- Add as `SMOKE_API_KEY` GitHub Actions secret
- Verify k6 smoke test now passes authenticated endpoints

#### 1.7 Architecture.md Update
- Add new apps (discovery-spa, partner-admin-spa, marketing-site) to the monorepo layout
- Clarify dual surfaces (public-discovery vs discovery-spa, partner-admin vs partner-admin-spa) with migration intent

### Schema Changes (Wave 1)
None required.

### API Changes (Wave 1)
- POS routes: no new routes; add middleware to existing routes
- Entitlement error response: standardized 403 JSON `{ error: 'entitlement_required', layer: 'pos' }`

### Test Requirements
- Add `TC-ENTL-001` through `TC-ENTL-005`: POS free-plan rejection tests
- Update test seed to include a workspace with `active_layers` including `pos`

### Deployment Order
1. Make all changes on `staging` branch
2. Run `pnpm typecheck` + `pnpm test` + `pnpm lint` locally
3. Push → CI green → staging deploy
4. Run POS entitlement rejection test manually against staging
5. Push final `chore(wave1): foundations unblockers` commit

### Exit Criteria
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm test` exits 0 (2751+ tests pass)
- [ ] `pnpm lint` exits 0 (0 errors, < 50 warnings)
- [ ] All 15 governance checks pass
- [ ] Staging deploy: all 8 workers deployed successfully
- [ ] POS entitlement gate verified against staging
- [ ] `apps/tenant-public` removed from repo and `pnpm-workspace.yaml`
- [ ] `.bak` files removed from forward migrations directory

---

## WAVE 2 — Frontend MVP Rebuild

### Objective
Rebuild the platform admin UI as a real React SPA. Polish workspace-app and discovery-spa. Establish design system foundation.

### Scope

#### 2.1 Design System Package
**File:** `packages/design-system/src/`  
**Content:**
- Extract `--ww-*` CSS variables from `apps/workspace-app/src/global.css` into `design-system/src/tokens.css`
- Create shared component stubs: `Button`, `Input`, `Card`, `Badge`, `Modal`, `Spinner`, `Toast`, `Table`
- Create a `tokens.ts` TypeScript file for type-safe CSS variable references
- All frontend apps import tokens from `@webwaka/design-system`

#### 2.2 Unified Platform Admin SPA
**New App:** Rebuild `apps/platform-admin` as a proper React/Vite SPA (Cloudflare Pages)  
**Architecture:** Same pattern as `apps/workspace-app` (Vite, React Router, lazy loading, PWA)  
**Pages:**
- `/` → Platform Overview (worker health, API status, recent deployments)
- `/tenants` → Tenant/workspace management (list, detail, suspend, activate)
- `/plans` → Plan catalog management (control-plane T2: create, edit, price, activate)
- `/entitlements` → Entitlement definitions and package bindings
- `/roles` → Custom roles and permission bundles
- `/flags` → Feature flags (list, toggle, edit rollout %, kill-switch)
- `/partners` → Partner management (list, approve, suspend, audit)
- `/pilots` → Pilot operator dashboard (NPS chart, operator list, flag management)
- `/audit` → Governance audit log
- `/analytics` → Platform analytics (AI usage, error rates, adoption)
- `/migrations` → Migration status viewer

**Auth:** JWT with super_admin role check  
**API:** All existing `/platform-admin/cp/*` and `/admin/*` routes  
**Remove:** `apps/platform-admin/server.js` (dev shim) and `apps/platform-admin/public/*.html` (vanilla HTML)  
**Deploy:** Cloudflare Pages (`wrangler.toml` for platform-admin as Pages project)

#### 2.3 Admin Dashboard Merge
- Move `apps/admin-dashboard/src/components/AIUsageChart.tsx` and `ErrorRateChart.tsx` into the new platform admin SPA
- Delete `apps/admin-dashboard` as separate app
- Update `pnpm-workspace.yaml`

#### 2.4 workspace-app Mobile-First Polish
**Changes:**
- All pages: verify layout works at 360px width (Samsung Galaxy A series target)
- POS page: mobile-optimized numpad layout
- Sidebar: collapse to icon-only at < 768px
- Bottom nav: existing `BottomNav.tsx` — ensure active state is correct for all routes
- Loading states: replace any remaining spinners with skeleton shimmer patterns
- Touch targets: all buttons/links ≥ 44px height (already done in Dashboard.tsx, ensure consistent)

#### 2.5 discovery-spa Improvement
**Changes:**
- Add service worker for offline caching of search results
- Add geography filter panel (zone/state/lga/ward facets)
- Add vertical category filter
- Improve listing card design with more entity data
- Add "In Area" map placeholder (prepare for Leaflet.js map integration in Wave 4)

#### 2.6 partner-admin-spa Completion
**Changes:**
- Credits page: show WC balance, transaction history, allocation to sub-tenants
- Sub-partners page: list sub-partners with status + activity metrics
- Analytics page: tenants on-boarded, activity, revenue share

#### 2.7 Retire Old Partner-Admin Worker
- Once partner-admin-spa is complete and deployed, mark `apps/partner-admin` as deprecated
- Update wrangler.toml to not deploy the old worker
- Eventually remove in Wave 3

### Schema Changes (Wave 2)
None required (all admin APIs are already implemented).

### API Changes (Wave 2)
- Ensure all `/platform-admin/cp/*` routes are covered by OpenAPI spec
- Add any missing admin API endpoints needed by the new UI

### New Packages
- `packages/design-system`: Implement tokens + shared components

### Test Requirements
- New platform-admin SPA: Playwright visual regression baseline
- workspace-app: Mobile viewport tests (360px) in Playwright
- discovery-spa: Offline test (service worker cache)

### Deployment Order
1. Design system package first (T4-1)
2. Platform admin SPA (T4-2) — deploy to Cloudflare Pages
3. workspace-app + discovery-spa improvements
4. Verify all admin operations work through new UI
5. Retire admin-dashboard worker after new SPA verified

### Exit Criteria
- [ ] Platform admin SPA: login → plans → flags → audit all functional
- [ ] Control-plane operations (create plan, toggle flag, view audit) verified against staging
- [ ] workspace-app: all pages layout correct at 360px, 768px, 1280px viewports
- [ ] discovery-spa: search + filter + profile page functional
- [ ] partner-admin-spa: credits + sub-partners pages functional
- [ ] design-system tokens used in at least workspace-app and platform-admin
- [ ] CI green throughout Wave 2

---

## WAVE 3 — Vertical Consolidation

### Objective
Expand vertical-engine adoption. Establish engine-first policy for all future verticals. Reduce the 175-package explosion.

### Scope

#### 3.1 Engine-First Policy
- Add governance check: `check-no-new-vertical-packages.ts` — fails CI if a new `packages/verticals-*` directory appears without a corresponding vertical-engine config
- Document policy in `docs/governance/vertical-taxonomy-glossary.md`

#### 3.2 Batch Migration: Top-20 Verticals
Migrate the 20 highest-traffic verticals from individual packages to vertical-engine, using parity testing to verify equivalence. Priority order:
1. `verticals-pos-business` (most used)
2. `verticals-restaurant`
3. `verticals-clinic`
4. `verticals-pharmacy`
5. `verticals-hotel`
6. `verticals-private-school`
7. `verticals-fuel-station`
8. `verticals-farm`
9. `verticals-real-estate-agency`
10. `verticals-law-firm`
11-20: Next batch based on seeded data coverage

For each:
1. Add vertical config to `packages/vertical-engine/src/new-vertical.config.ts`
2. Run parity test to verify 100% behavioral match
3. Switch route registration from legacy to engine
4. Delete legacy package (after CI confirms no imports)
5. Remove from `pnpm-workspace.yaml`

#### 3.3 Template Marketplace UI
- Add template browsing to workspace-app `/vertical` page
- Show available templates for the workspace's vertical
- Install/upgrade/rollback template actions
- Template ratings display

#### 3.4 Vertical AI Config
- Move vertical AI capability matrix from `packages/superagent/src/vertical-ai-config.ts` (hardcoded) to `ai_vertical_configs` table (migration 0195)
- Admin UI to manage per-vertical AI settings

### Schema Changes (Wave 3)
- No new migrations required (vertical-engine uses existing `verticals` and `workspace_verticals` tables)
- Existing migration 0195 (`ai_vertical_configs`) enables vertical AI config in DB

### Test Requirements
- Parity tests must pass 100% for all migrated verticals before package deletion
- New engine-based vertical test coverage via `packages/vertical-engine/src/testing/parity.test.ts`

### Exit Criteria
- [ ] Top-20 verticals migrated to engine with parity tests passing
- [ ] At least 20 vertical packages removed (count reduced from 175 to ≤ 155)
- [ ] Governance check blocks new individual vertical package creation
- [ ] Template marketplace UI functional in workspace-app
- [ ] CI green throughout Wave 3

---

## WAVE 4 — AI + Analytics + Market Expansion

### Objective
Expand AI capabilities, improve analytics dashboards, add WhatsApp transactional notifications, and implement i18n for key languages.

### Scope

#### 4.1 AI Tool Registry Expansion
**New tools in `packages/superagent/src/tools/`:**
- `generate-report.ts`: Generate formatted sales/inventory/customer reports
- `lookup-business-registry.ts`: CAC registration lookup (future: FRSC, NCC)
- `suggest-pricing.ts`: AI-driven pricing suggestions based on market data
- `compose-whatsapp-message.ts`: Compose WhatsApp Business message for customer outreach
- `analyze-stock-trends.ts`: Inventory trend analysis with reorder suggestions

#### 4.2 Streaming UI Improvement
- workspace-app AI page: token-by-token display with cancel button
- Tool-use visualization: show which tool was called and its result
- HITL pending indicator: clear status when task is held for review

#### 4.3 AI Spend Dashboard
- Add `/workspace/ai-spend` page to workspace-app
- Show: current period usage, WC balance, per-capability breakdown, top AI tasks
- Top-up prompt when balance < 20% of period quota

#### 4.4 WhatsApp Transactional Notifications
- Activate WhatsApp channel in `packages/notifications`
- Three priority templates: sale confirmation, low-stock alert, OTP verification
- WhatsApp template approval workflow (WABA business account required from founder)
- Workspace settings page: WhatsApp notification opt-in

#### 4.5 i18n: Yoruba Greetings + Key UI Strings
- Add `yo` locale to `packages/i18n`
- Translate: greeting strings, onboarding welcome, navigation labels, common error messages
- Yoruba is spoken by ~40M Nigerians; even partial translation builds trust

#### 4.6 Analytics Dashboard Enhancement
- workspace-app `/analytics` page: add period selector (daily/weekly/monthly/custom)
- Revenue by product chart (top 10 products)
- Customer acquisition trend
- Payment method breakdown
- Export as CSV (T6-2: call a new `/analytics/export/csv` endpoint)

#### 4.7 Platform Analytics (Admin)
- Platform admin SPA `/analytics` page:
  - Active tenants per plan tier
  - Vertical type distribution
  - AI usage by workspace
  - Weekly new workspace registrations

#### 4.8 Search Improvements
- Add autocomplete endpoint: `GET /discover/autocomplete?q=`
- Relevance boosting: claimed entities rank higher than unclaimed
- Faceted search in discovery-spa: filter by vertical, state, LGA
- "Near me" placeholder: prepare geo-proximity search for map integration

### Schema Changes (Wave 4)
- New migration: `analytics_daily_snapshots` table for pre-aggregated workspace analytics
- New migration: `ai_tool_registry` table for discoverable tool definitions
- New migration: `notification_whatsapp_status` table for WhatsApp delivery tracking

### API Changes (Wave 4)
- `GET /analytics/workspace/:id/export/csv` — CSV export endpoint
- `GET /discover/autocomplete` — search autocomplete
- New SuperAgent tools registered in tool registry

### Test Requirements
- New AI tools: unit tests for each tool
- WhatsApp notifications: sandbox-mode test (no real messages)
- Analytics export: verify CSV structure and tenant isolation

### Exit Criteria
- [ ] 5+ new AI tools passing tests and available in workspace-app AI chat
- [ ] AI spend dashboard live in workspace-app
- [ ] WhatsApp notifications: sandbox delivery confirmed for sale + stock + OTP
- [ ] i18n: Yoruba greetings live in onboarding + dashboard
- [ ] Analytics: period selector + CSV export functional
- [ ] Platform analytics dashboard: 4 metric cards live
- [ ] Search autocomplete endpoint functional
- [ ] CI green throughout Wave 4

---

## WAVE 5 — Production Launch

### Objective
Satisfy all production ops gates. Deploy to production. Run pilot cohort. Launch.

### Pre-Wave Prerequisites
- Wave 1 exit criteria ✅
- Wave 2 exit criteria ✅
- Wave 3 exit criteria ✅ (at least top-10 verticals)
- Wave 4 exit criteria ✅ (at least WhatsApp + analytics)

### Scope (from WAVE4_CHECKLIST.md)

#### 5.1 Ops Gate G1 — Code Quality (Engineering)
- CI passes on staging branch (all checks green)
- TypeScript typecheck exits 0
- All governance checks pass

#### 5.2 Ops Gate G2 — Performance (Engineering)
- k6 load test: `k6 run tests/k6/superagent-chat.k6.js` — P95 < 3s
- k6 load test: `k6 run tests/k6/verticals-load.k6.js` — P95 < 500ms
- No D1 query > 200ms in staging logs (last 48h)

#### 5.3 Ops Gate G3 — Secrets (Founder action)
- 11 Cloudflare Worker secrets provisioned
- 13 GitHub Actions secrets provisioned
- `node scripts/verify-deploy-secrets.mjs` exits 0

#### 5.4 Ops Gate G4 — Database (Engineering)
- Migrations 0001–0543 applied to `webwaka-production` D1
- Checksums verified

#### 5.5 Ops Gate G5 — DNS/Infrastructure (Founder + Engineering)
- `api.webwaka.com` pointed to production worker
- `webwaka.com` pointed to marketing site
- SSL Full (Strict) + WAF enabled

#### 5.6 Ops Gate G6 — Smoke Tests (Engineering post-deploy)
- `node scripts/smoke-production.mjs` exits 0

#### 5.7 Ops Gate G7 — Rollback (Engineering pre-deploy)
- Worker rollback workflow tested on staging
- Migration rollback procedure documented and tested

#### 5.8 Ops Gate G8 — Compliance (Engineering + RM)
- All compliance checklist items in `docs/runbooks/compliance-final-check.md` verified
- COMPLIANCE_ATTESTATION_LOG.md signed for all 12 manual TC-IDs

#### 5.9 Ops Gate G9 — Pilot (Engineering)
- Migration 0463 applied to production D1
- `DRY_RUN=1 node scripts/pilot-kv-warmup.mjs` passes
- `node scripts/pilot-kv-warmup.mjs` live run executed
- Pilot cohort 1 operators notified and onboarded

#### 5.10 Production Deploy
- Trigger `deploy-production.yml` on `main` branch
- Verify all 8 workers deployed successfully
- Run post-deploy smoke: `node scripts/smoke-production.mjs`
- Monitor error rates for 24 hours post-deploy
- Sign off all 13 items in `docs/release/release-gate.md`

### Exit Criteria
- [ ] `docs/release/release-gate.md` all 13 items signed
- [ ] Production API health: `https://api.webwaka.com/health` → 200
- [ ] Production brand-runtime: `https://webwaka.com/health` → 200
- [ ] Pilot cohort 1 operators active with monitoring live
- [ ] COMPLIANCE_ATTESTATION_LOG.md signed
- [ ] No critical errors in production logs (first 24h)

---

## Implementation Sequence Diagram

```
Week 1: Wave 1 (Foundations)
  └ T1-1: auth-tenancy resolved
  └ T1-2: POS entitlement gates
  └ T1-3/4/5: cleanup (tenant-public, support-groups, .bak files)
  └ T1-6: ESLint cleanup
  └ T7-2: SMOKE_API_KEY provisioned
  └ Push + CI green

Week 2-3: Wave 2 (Frontend MVP)
  └ T4-1: design-system tokens
  └ T4-2: platform-admin React SPA (major build)
  └ T4-3: admin-dashboard merged
  └ T4-4: workspace-app mobile polish
  └ T4-5: discovery-spa improvement
  └ T4-6: partner-admin-spa completion
  └ T2-1: control-plane UI integrated into platform-admin
  └ Push + CI green + Cloudflare Pages deploy

Week 4-5: Wave 3 (Vertical Consolidation)
  └ T5-1: engine-first policy + governance check
  └ T5-2: top-20 vertical migration (batches of 5)
  └ T5-3: template marketplace UI
  └ Push + CI green

Week 6-7: Wave 4 (AI + Analytics + Market)
  └ T3-1: tool registry expansion
  └ T3-2/3: AI UI improvements
  └ T6-1/2: analytics dashboard + CSV export
  └ T8-1: WhatsApp notifications
  └ T8-2: Yoruba i18n strings
  └ T6-4: search autocomplete
  └ Push + CI green

Week 8: Wave 5 (Production Launch)
  └ All ops gates G1-G9
  └ Production deploy
  └ Pilot cohort activation
  └ Public launch
```

---

## Decision Log

| Date | Decision | Rationale | Authority |
|------|----------|-----------|-----------|
| 2026-05-03 | auth-tenancy: implement or delete (not leave as stub) | Stubs create silent failures | Phase 0 assessment |
| 2026-05-03 | POS entitlement gates are Wave 1 (not deferred) | Free-plan revenue leakage risk | Phase 0 risk register R-001 |
| 2026-05-03 | Platform-admin rebuilt as React SPA in Wave 2 | No real admin UI is unacceptable for launch | Phase 0 risk register R-003 |
| 2026-05-03 | Vertical-engine is the only future for new verticals | 175-package explosion unsustainable | Research synthesis D5 |
| 2026-05-03 | discovery-spa is canonical; public-discovery is SSR fallback | Better mobile UX, PWA-capable | Research synthesis D10 |
| 2026-05-03 | Control plane admin UI is Wave 2 (not deferred to launch) | Operators need to manage plans pre-launch | Program T2-T4 dependencies |

*End of Implementation Plan*
