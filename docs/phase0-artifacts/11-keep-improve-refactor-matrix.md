# WebWaka OS — Keep / Improve / Refactor / Re-architect / Deprecate / Remove Matrix

**Date:** 2026-05-03  
**Branch:** `staging`  
**Scope:** All 13 apps, 212 packages, CI/CD, infrastructure, governance docs

---

## Decision Legend

| Decision | Meaning |
|----------|---------|
| **KEEP** | Strong foundation — retain as-is |
| **IMPROVE** | Working but needs polish or extension |
| **REFACTOR** | Restructure internals without behavior change |
| **RE-ARCH** | Fundamental architecture change needed |
| **DEPRECATE** | Planned for removal; continue until replacement ready |
| **REMOVE** | Can be deleted now or after small cleanup |

---

## Apps

| App | Decision | Rationale | Wave |
|-----|----------|-----------|------|
| `apps/api` | **KEEP + IMPROVE** | Mature, well-tested, 96K lines. Add POS entitlement gates, reduce ESLint warnings | W1 |
| `apps/workspace-app` | **IMPROVE** | Functional but needs design system, i18n, accessibility, mobile polish | W2 |
| `apps/brand-runtime` | **KEEP** | Core Pillar 2 — well-implemented per Pillar 2 audit | — |
| `apps/public-discovery` | **DEPRECATE** | SSR Worker superseded by discovery-spa for UX; keep for SEO if needed | W3 |
| `apps/discovery-spa` | **IMPROVE** | New SPA is canonical; needs offline, maps, advanced filtering | W2 |
| `apps/ussd-gateway` | **KEEP** | Strategic Nigeria-first asset; fully working | — |
| `apps/notificator` | **KEEP + IMPROVE** | DLQ implemented; add management UI, retry visibility | W4 |
| `apps/projections` | **KEEP** | Working CRON worker; minimal change needed | — |
| `apps/schedulers` | **KEEP** | Working CRON worker; add new jobs through here | — |
| `apps/log-tail` | **KEEP** | Structured log drain; working | — |
| `apps/platform-admin` | **RE-ARCH** | Dev shim only — must become a proper React SPA for prod ops | W2 |
| `apps/admin-dashboard` | **RE-ARCH** | Shell only — merge with platform-admin rebuild into unified admin SPA | W2 |
| `apps/partner-admin` | **DEPRECATE** | Old Hono Worker superseded by partner-admin-spa | W2 |
| `apps/partner-admin-spa` | **IMPROVE** | New canonical partner admin — polish UX, add analytics | W2 |
| `apps/marketing-site` | **IMPROVE** | Public marketing — needs SEO, content, performance | W4 |
| `apps/tenant-public` | **REMOVE** | Legacy stub — superseded by brand-runtime (Pillar 2) | W1 |

---

## Key Packages

| Package | Decision | Rationale | Wave |
|---------|----------|-----------|------|
| `@webwaka/auth` | **KEEP** | JWT, PBKDF2, role hierarchy — stable | — |
| `@webwaka/auth-tenancy` | **REFACTOR** | Stub — implement tenancy primitives OR delete and redirect imports to auth | W1 |
| `@webwaka/entitlements` | **KEEP + IMPROVE** | Has DB-first path; preserve PLAN_CONFIGS fallback | — |
| `@webwaka/control-plane` | **KEEP** | Complete implementation — flag caching, audit service, delegation guard | — |
| `@webwaka/ai-abstraction` | **KEEP** | Vendor-neutral AI routing; circuit breaker, retry — good pattern | — |
| `@webwaka/ai-adapters` | **KEEP** | Fetch-only adapters (P7 invariant) | — |
| `@webwaka/superagent` | **IMPROVE** | Add streaming improvement, more tools, provider routing enhancements | W4 |
| `@webwaka/vertical-engine` | **IMPROVE** | Expand adoption; add more vertical types to engine | W3 |
| `@webwaka/verticals` (175) | **REFACTOR → CONSOLIDATE** | Gradually migrate to vertical-engine; remove packages as parity proven | W3+ |
| `@webwaka/design-system` | **RE-ARCH** | Currently stub — implement token system + shared components | W2 |
| `@webwaka/notifications` | **KEEP** | Mature notification engine with templates, rules, channels | — |
| `@webwaka/offline-sync` | **KEEP** | Dexie.js + conflict resolution — 66 tests | — |
| `@webwaka/claims` | **KEEP** | 8-state FSM — stable | — |
| `@webwaka/payments` | **KEEP + IMPROVE** | Paystack integration solid; add Nigeria-specific payment methods expansion | W4 |
| `@webwaka/hl-wallet` | **IMPROVE** | Feature-flagged wallet; add management UI | W4 |
| `@webwaka/i18n` | **IMPROVE** | English complete; add Yoruba, Igbo, Hausa, Pidgin | W4 |
| `@webwaka/policy-engine` | **IMPROVE** | New package — integrate into route enforcement | W3 |
| `@webwaka/support-groups` | **REMOVE** | Renamed to groups — old package still exists | W1 |
| `@webwaka/white-label-theming` | **KEEP** | Depth-cap enforced, CSS var generation | — |
| `@webwaka/social` | **KEEP** | DM encryption, feed, moderation | — |
| `@webwaka/community` | **KEEP** | Spaces, channels, courses, events, moderation | — |
| `@webwaka/groups` | **KEEP + IMPROVE** | Electoral extensions, dues, mutual aid, polls | — |
| `@webwaka/analytics` | **IMPROVE** | Basic aggregation; add workspace-level dashboards | W4 |
| `@webwaka/pilot` | **KEEP** | Rollout gates + FlagService bridge | — |
| `@webwaka/wakapage-blocks` | **KEEP** | WakaPage block types | — |
| `@webwaka/webhooks` | **KEEP** | Webhook subscriptions + delivery | — |

---

## CI/CD and Infrastructure

| Component | Decision | Rationale | Wave |
|-----------|----------|-----------|------|
| GitHub Actions workflows (17) | **KEEP** | Comprehensive CI; all passing | — |
| CI governance checks (15) | **KEEP + IMPROVE** | Add check for .bak in migrations | W1 |
| k6 load tests | **IMPROVE** | Provision SMOKE_API_KEY to unlock authenticated checks | W1 |
| Visual regression baseline | **KEEP** | Workflow exists; run in staging environment | W2 |
| CRON trigger budget | **NOTE** | At 5/5 capacity — no new standalone CRON workers | W1 |
| Cloudflare D1 staging | **KEEP** | Live + seeded | — |
| Cloudflare D1 production | **ACTION REQUIRED** | Not yet migrated — ops gate G4 | W5 |
| `infra/db/migrations/` (mirror) | **KEEP** | Duplicate of `apps/api/migrations/` for reference | — |
| `scripts/governance-checks/` | **IMPROVE** | Add `.bak` migration check; improve coverage | W1 |

---

## Documentation and Governance

| Document | Decision | Notes |
|----------|----------|-------|
| `docs/governance/core-principles.md` | **KEEP** | Canonical — founder-approved |
| `docs/governance/vision-and-mission.md` | **KEEP** | Canonical |
| `ARCHITECTURE.md` | **IMPROVE** | Update for new apps (discovery-spa, partner-admin-spa) |
| `docs/architecture/decisions/` (ADRs) | **KEEP** | Well-structured decision records |
| `WebWaka_OS_Corrected_Master_Inventory_v2.md` | **SUPERSEDE** | Replaced by Phase 0 artifacts |
| `WebWaka_Comprehensive_Master_Report.md` | **SUPERSEDE** | Too verbose, has contradictions |
| Multiple contradicting audit reports | **ARCHIVE** | Move to `docs/archive/` with note they are superseded |
| `PRODUCTION_READINESS_BACKLOG.md` | **KEEP** | All items resolved; keep as evidence |
| `WAVE4_CHECKLIST.md` | **KEEP** | Active ops gate checklist for Wave 5 |
| `IMPLEMENTATION_REGISTER.md` | **UPDATE** | Extend with new wave registers |
| `docs/ops/RUNBOOK.md` | **KEEP** | Canonical runbook — consolidated |

---

## Summary Counts

| Decision | Count |
|----------|-------|
| KEEP | 42 |
| IMPROVE | 24 |
| REFACTOR | 3 |
| RE-ARCH | 3 |
| DEPRECATE | 3 |
| REMOVE | 3 |
