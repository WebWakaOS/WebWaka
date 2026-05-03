# WebWaka OS — Master Refactor and Strategic Enhancement Program

**Date:** 2026-05-03  
**Authority:** Supersedes all prior planning documents for this initiative  
**Branch:** `staging`  
**Author:** Emergent Agent (Phase 0 discovery + Phase 1 research)  
**Status:** APPROVED — execution baseline

---

## Mission Statement

Conduct a full strategic platform modernization of WebWaka OS to make it the best possible platform for Nigeria-first / Africa-ready digital operations, governance, and discovery — implementing all changes now, while pre-launch, with zero user risk.

**Thoroughness is far more important than speed.**

---

## Non-Negotiable Principles

All work in this program must respect:
- Build Once Use Infinitely
- Mobile First + PWA First + Offline First
- Nigeria First → Africa First
- Vendor Neutral AI
- Governance first
- Runtime configurability over hardcoding
- Least privilege
- Full auditability
- Staging-first deployment
- No assumptions — No shortcuts — No drift

---

## Track Map

| Track | Name | Priority | Wave(s) |
|-------|------|----------|---------|
| T1 | Platform Architecture Simplification | 🔴 Critical | W1 |
| T2 | Dynamic Control Plane Completion | 🟠 High | W1, W3 |
| T3 | AI-Native Operating Layer | 🟡 Medium | W4 |
| T4 | Frontend and Experience Unification | 🔴 Critical | W2 |
| T5 | Vertical Engine + Template Extensibility | 🟠 High | W3 |
| T6 | Data, Analytics, Reporting, Search, Exports | 🟡 Medium | W4 |
| T7 | Governance, Security, Observability, Hardening | 🟠 High | W1, W4 |
| T8 | Contextual Market Readiness | 🟡 Medium | W4, W5 |

---

## TRACK 1 — Platform Architecture Simplification

### Rationale
The API backend is mature but has structural debt: an auth-tenancy stub, POS routes without entitlement gates, ESLint noise, .bak migration files, and legacy tenant-public app. These must be resolved before refactors in other tracks.

### Current State
- `packages/auth-tenancy`: dead stub (`export {}`)
- 20+ POS routes missing entitlement gates
- `apps/tenant-public`: legacy stub superseded by brand-runtime
- 238 ESLint warnings in `apps/api`
- `.bak` files in forward migration directory
- `packages/support-groups` still exists alongside `packages/groups`

### Target State
- Auth-tenancy stub resolved (implement or delete + redirect)
- All POS routes properly entitlement-gated
- Clean ESLint (< 20 warnings)
- No dead legacy apps
- Clean migration directories
- Domain boundaries tightly enforced

### Sub-Initiatives

| ID | Initiative | Impact | Effort |
|----|------------|--------|--------|
| T1-1 | Audit and resolve `@webwaka/auth-tenancy` stub | HIGH | LOW |
| T1-2 | Add `requireLayerAccess` to all POS routes | HIGH | MEDIUM |
| T1-3 | Remove `apps/tenant-public` (deprecated) | MEDIUM | LOW |
| T1-4 | Clean `packages/support-groups` (rename complete) | LOW | LOW |
| T1-5 | Remove/move `.bak` migration files | LOW | LOW |
| T1-6 | Reduce ESLint warnings < 20 in `apps/api` | MEDIUM | MEDIUM |
| T1-7 | Add `.bak` pattern to governance check for migrations | LOW | LOW |
| T1-8 | Review and tighten route group boundaries | MEDIUM | MEDIUM |

### Dependencies
- T1-1 must be resolved before T4 (frontend rebuild may touch tenancy patterns)
- T1-2 requires understanding of control-plane entitlement resolution (T2)

### Risks
- T1-1 (auth-tenancy): If other packages import from this stub, removing it causes compile errors. Must audit all import sites first.
- T1-2 (POS gates): Changes may break test expectations. All POS tests must be re-run.

---

## TRACK 2 — Dynamic Control Plane Completion

### Rationale
The control plane backend is complete and strong (migrations 0464–0472, `packages/control-plane`). However, the admin UI to manage it is a vanilla HTML file, and several integrations are missing (Paystack sync, partner-scoped views).

### Current State
- Backend: ✅ Complete (7 services, 20 tables, 17 API routes, KV caching)
- Admin UI: 🔴 Vanilla HTML page (`apps/platform-admin/public/control-plane.html`)
- Paystack sync: Not wired — plan pricing changes don't sync to Paystack plan codes
- Partner-scoped control plane: Not implemented (partners can't see their slice of flags)

### Target State
- React admin UI exposes all control-plane APIs (plans, entitlements, roles, groups, flags, delegation, audit)
- Paystack plan code sync on package pricing changes
- Partner admin: scoped view of flags/groups/credits for their tenant tier
- Per-workspace entitlement override UI

### Sub-Initiatives

| ID | Initiative | Impact | Effort |
|----|------------|--------|--------|
| T2-1 | Build React control-plane admin UI (in platform-admin rebuild) | HIGH | HIGH |
| T2-2 | Wire Paystack plan code sync on pricing update | HIGH | MEDIUM |
| T2-3 | Partner-scoped control plane view in partner-admin-spa | MEDIUM | MEDIUM |
| T2-4 | Workspace entitlement override UI in workspace-app billing page | MEDIUM | LOW |

### Dependencies
- T2-1 depends on T4 (platform-admin React rebuild)
- T2-3 depends on T4 (partner-admin-spa improvement)

---

## TRACK 3 — AI-Native Operating Layer

### Rationale
SuperAgent is functionally complete but the frontend AI experience is basic, provider routing could be more intelligent, and the tool registry can be expanded with more Nigeria-specific tools.

### Current State
- Agent loop: ✅ Complete (multi-turn, streaming, background jobs)
- Tool registry: 13 tools (booking, invoice, customer-lookup, inventory, analytics, etc.)
- HITL: ✅ Complete (regulated verticals held for human review)
- Compliance filter: ✅ Complete (NDPR + CBN + sector rules)
- Frontend: Basic chat UI in workspace-app `/ai` page
- Provider routing: Circuit breaker + retry — no intelligent failover with cost optimization

### Target State
- Expanded tool registry (USSD-triggered AI, business registry lookup, report generation)
- Streaming UI improvement (token-by-token display, cancel button)
- HITL review UI improvement (batch approval, compliance evidence view)
- Provider routing: Cost-based routing (cheaper provider for simple tasks)
- AI spend visibility: Per-workspace credit dashboard
- AI observability: Per-model latency and error tracking
- Inline AI surfaces: AI suggestions embedded in POS, inventory, analytics pages

### Sub-Initiatives

| ID | Initiative | Impact | Effort |
|----|------------|--------|--------|
| T3-1 | Expand tool registry (5+ new tools) | HIGH | MEDIUM |
| T3-2 | Improve streaming UI in workspace-app | MEDIUM | LOW |
| T3-3 | HITL review UI improvement | HIGH | MEDIUM |
| T3-4 | AI spend dashboard in workspace-app | HIGH | MEDIUM |
| T3-5 | Cost-based provider routing in ai-abstraction | MEDIUM | MEDIUM |
| T3-6 | Inline AI in POS and inventory pages | MEDIUM | MEDIUM |

---

## TRACK 4 — Frontend and Experience Unification

### Rationale
The backend is strong but the admin UI is a shell. Platform operators have no real interface to manage the platform. The frontend apps are fragmented and inconsistent. This is the most critical UI gap.

### Current State
- `apps/workspace-app`: ✅ Functional (React/Vite, 34+ pages, offline-first, PWA)
- `apps/admin-dashboard`: 🔴 Shell (2 components, Hono Worker — no real admin UI)
- `apps/platform-admin`: 🔴 Dev shim (vanilla HTML + Node.js server — dev-only)
- `apps/partner-admin-spa`: ⚠️ Minimal (8 pages, basic UX)
- `apps/discovery-spa`: ⚠️ Basic (6 pages, no offline support, no maps)
- `apps/marketing-site`: ⚠️ Skeleton
- `packages/design-system`: 🔴 Empty stub

### Target State
- **Unified Admin Application** (React/Vite SPA, Cloudflare Pages): Merges platform-admin and admin-dashboard into one production-grade app with:
  - Control plane UI (plans, entitlements, roles, flags, delegation, audit)
  - Tenant/workspace management
  - Partner management
  - Analytics dashboards (AI usage, error rates, platform health)
  - Pilot management
  - Super-admin operations
- **workspace-app**: Mobile-first redesign, design system integration, full i18n
- **discovery-spa**: Offline support, map integration, advanced filtering, PWA
- **partner-admin-spa**: Complete analytics, sub-partner management, credits dashboard
- **design-system package**: Published tokens + shared components (Button, Input, Card, Table, Badge, Modal)

### Sub-Initiatives

| ID | Initiative | Impact | Effort |
|----|------------|--------|--------|
| T4-1 | Design system tokens extraction and package | HIGH | MEDIUM |
| T4-2 | Rebuild platform-admin as React SPA (admin app) | CRITICAL | HIGH |
| T4-3 | Merge admin-dashboard into unified admin app | HIGH | MEDIUM |
| T4-4 | workspace-app mobile-first polish | HIGH | MEDIUM |
| T4-5 | workspace-app i18n completion (en + yo + ig + ha) | MEDIUM | HIGH |
| T4-6 | discovery-spa offline support + maps | MEDIUM | MEDIUM |
| T4-7 | partner-admin-spa completion (analytics, sub-partners) | MEDIUM | MEDIUM |
| T4-8 | marketing-site completion | LOW | MEDIUM |
| T4-9 | Role-aware navigation in all apps | HIGH | LOW |
| T4-10 | Accessibility audit + fixes (WCAG AA baseline) | MEDIUM | MEDIUM |

### Dependencies
- T4-1 (design system) must be done before T4-4, T4-6, T4-7
- T4-2 (admin app rebuild) depends on T1-1 (auth-tenancy), T2-1 (control plane APIs stable)

---

## TRACK 5 — Vertical Engine + Template/Module Extensibility

### Rationale
175 individual vertical packages create unsustainable maintenance overhead. The vertical-engine provides a configuration-driven alternative. Migration must be systematic.

### Current State
- `packages/vertical-engine`: ✅ Implemented (CRUD, FSM, route generator, parity framework)
- 175 `@webwaka/verticals-*` packages: Mostly schema + repository per vertical
- Parity Phase 1: Complete and documented
- `register-vertical-engine-routes.ts`: New route group for engine-driven verticals
- Template registry: ✅ Implemented (registry, versions, installations, overrides, audit)

### Target State
- All new verticals use vertical-engine (no new individual packages)
- Existing high-traffic verticals migrated to engine in batches (with parity proof)
- Template marketplace: Browse, purchase, install, upgrade templates
- Vertical AI config: Per-vertical AI capability matrix in DB (not hardcoded)
- Template ratings and reviews

### Sub-Initiatives

| ID | Initiative | Impact | Effort |
|----|------------|--------|--------|
| T5-1 | Establish engine-first policy (no new vertical packages) | HIGH | LOW |
| T5-2 | Batch migrate top-20 verticals to engine | HIGH | HIGH |
| T5-3 | Template marketplace UI in workspace-app | MEDIUM | MEDIUM |
| T5-4 | Vertical AI config in DB via vertical-engine | MEDIUM | MEDIUM |
| T5-5 | Template ratings/reviews | LOW | LOW |

---

## TRACK 6 — Data, Analytics, Reporting, Search, and Exports

### Rationale
Basic analytics exist but are not surfaced effectively. Workspace admins need revenue reports, customer analytics, and inventory insights. Platform admins need adoption metrics.

### Current State
- `packages/analytics`: Basic aggregation
- `apps/workspace-app/src/pages/Analytics.tsx`: Exists but basic
- `apps/api/src/routes/workspace-analytics.ts`: Backend analytics routes
- Projections worker: Runs analytics rebuilds
- Search: FTS5 in D1 (`search_entries` table, geography facets)

### Target State
- Workspace analytics: Revenue by period, by product, by customer, by payment method
- Platform analytics: Tenant adoption, vertical distribution, AI usage, revenue projections
- CSV/PDF export for key reports
- Search improvements: Relevance scoring, autocomplete, faceted filtering
- Real-time dashboards (polling-based, not WebSockets — CF Workers don't support WS)

### Sub-Initiatives

| ID | Initiative | Impact | Effort |
|----|------------|--------|--------|
| T6-1 | Workspace analytics dashboard improvement | HIGH | MEDIUM |
| T6-2 | CSV export for sales/inventory/customers | HIGH | LOW |
| T6-3 | Platform admin analytics (adoption, revenue) | HIGH | MEDIUM |
| T6-4 | Search relevance and autocomplete | MEDIUM | MEDIUM |
| T6-5 | PDF report generation | MEDIUM | HIGH |

---

## TRACK 7 — Governance, Security, Observability, Deployment Hardening

### Rationale
Governance is already strong. Key remaining gaps: log-tail not wired to external sink, SMOKE_API_KEY missing, .bak files, ESLint warnings, and production never deployed.

### Current State
- 15 CI governance checks: ✅ Passing
- Structured logging: ✅ With correlation IDs
- Log-tail worker: ✅ Implemented (not wired to external sink yet)
- Canary deployments: ✅ Workflow exists
- Rollback: ✅ Worker + migration rollback workflows exist
- Production secrets: Not provisioned

### Target State
- Log-tail wired to Axiom (or Logtail) for persistent log storage
- SMOKE_API_KEY provisioned
- ESLint < 20 warnings
- .bak files removed
- All 16 production ops gates satisfied
- Monitoring alerts: DLQ, AI credit exhaustion, auth failure spikes, billing anomalies

### Sub-Initiatives

| ID | Initiative | Impact | Effort |
|----|------------|--------|--------|
| T7-1 | Wire log-tail to Axiom | HIGH | LOW |
| T7-2 | Provision SMOKE_API_KEY GitHub secret | MEDIUM | LOW (ops) |
| T7-3 | Remove .bak migration files + update governance check | LOW | LOW |
| T7-4 | Reduce ESLint warnings to < 20 | MEDIUM | MEDIUM |
| T7-5 | Add monitoring alerts (DLQ, credit, auth, billing) | HIGH | MEDIUM |
| T7-6 | Production secrets provisioning (ops gate G3) | CRITICAL | LOW (ops) |
| T7-7 | Production DNS cutover runbook execution | CRITICAL | LOW (ops) |

---

## TRACK 8 — Contextual Market Readiness

### Rationale
The platform is Nigeria-first by design but several market readiness items remain: WhatsApp notifications, i18n, low-bandwidth mode, pilot cohort execution, and production launch.

### Current State
- USSD gateway: ✅ Functional
- Offline-first PWA: ✅ Implemented
- WhatsApp: Tables exist, templates management UI exists, but WhatsApp template approval pending
- i18n: English only (other languages planned)
- Pilot cohort: Code complete; ops gate pending
- Production: Not deployed

### Target State
- WhatsApp notifications live (transactional: sale confirmation, stock alert, OTP)
- i18n: Yoruba, Igbo, Hausa greetings + key UI strings
- Low-bandwidth mode toggle in workspace-app settings
- Pilot cohort 1 (2–5 operators) live and providing feedback
- Production deployed with all ops gates satisfied
- Public launch readiness: marketing site + press kit + support email

### Sub-Initiatives

| ID | Initiative | Impact | Effort |
|----|------------|--------|--------|
| T8-1 | WhatsApp transactional notifications (sale + stock + OTP) | HIGH | MEDIUM |
| T8-2 | i18n: Yoruba greetings + key UI strings | MEDIUM | LOW |
| T8-3 | Low-bandwidth mode UI toggle | MEDIUM | LOW |
| T8-4 | Pilot cohort ops execution (pilot-kv-warmup + monitoring) | HIGH | LOW (ops) |
| T8-5 | Production deployment (WAVE4_CHECKLIST G1–G9) | CRITICAL | HIGH (ops) |
| T8-6 | Marketing site content and launch materials | MEDIUM | MEDIUM |

---

## Track Dependencies Graph

```
T1 (Architecture)  ──┬──> T2 (Control Plane)  ──> T4 (Frontend)  ──> T5 (Verticals)
                       └──> T7 (Hardening)  ──┬──> T8 (Launch)
                                              ├──> T6 (Analytics)
                                              └──> T3 (AI)
```

---

## Staging-First Deployment Contract

For every implementation batch in this program:
1. Code changes committed to `staging` branch
2. GitHub CI must pass (typecheck + test + lint + governance + smoke)
3. Cloudflare staging deployment must succeed
4. Staging API smoke verified green
5. Only then: merge to `main` + deploy production
6. Production smoke verified green

No exceptions to this sequence.

---

## Governance Checkpoints

Before any wave is declared complete:
- [ ] All CI checks pass on staging branch
- [ ] All new code has tests (unit + integration where applicable)
- [ ] All T3 / P9 / G23 / G24 / P6 / P7 invariants verified in new code
- [ ] New API routes have OpenAPI spec entries
- [ ] ESLint: no new errors introduced
- [ ] Migration rollback scripts present for all new migrations
- [ ] All breaking changes documented in CHANGELOG.md
- [ ] `IMPLEMENTATION_REGISTER.md` updated for new wave

*End of Master Program*
