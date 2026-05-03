# Artifact 07 — Implementation Readiness Checklist
## WebWaka OS: Phase 0 → Phase 1 Transition Readiness Assessment

**Status:** AUTHORITATIVE — Phase 0 Deep Discovery output  
**Date:** 2026-05-02  
**Purpose:** Confirm what is ready to build, what is blocked, and what must be decided before Phase 1 execution begins.  
**Format:** Each item is ✅ READY, ⚠️ CONDITIONAL, ❌ BLOCKED, or 🔲 DECISION REQUIRED.

---

## SECTION 1 — Platform Foundation Readiness

### 1.1 Core Infrastructure

| Item | Status | Notes |
|---|---|---|
| Cloudflare Workers runtime | ✅ READY | All 15 apps deployed on CF Workers |
| D1 database (staging) | ✅ READY | `52719457-5d5b-4f36-9a13-c90195ec78d2` — live with 461 migrations applied |
| D1 database (production) | ✅ READY | `de1d0935-31ed-4a33-a0fd-0122d7a4fe43` — live |
| KV namespaces | ✅ READY | RATE_LIMIT_KV, GEOGRAPHY_CACHE, KV, WALLET_KV — all provisioned |
| NOTIFICATION_KV | ❌ BLOCKED | Not provisioned — UI-002. Must create before notification engine works. |
| R2 buckets | ✅ READY | ASSETS + DSAR_BUCKET — both staging and production |
| Hono framework | ✅ READY | Consistent across all Workers |
| pnpm monorepo | ✅ READY | pnpm 9, Node 20, workspace orchestration working |
| GitHub Actions CI/CD | ✅ READY | All workflows configured and operational |
| TypeScript compilation | ✅ READY | 0 errors across all packages and apps |
| ESLint (non-api packages) | ✅ READY | 0 errors, warnings only |
| ESLint (apps/api) | ❌ BLOCKED | 3 categories of errors: no-unnecessary-type-assertion, no-unsafe-argument, no-empty |
| Test suite | ✅ READY | 2,811 tests passing across all packages |
| Staging deployment | ✅ READY | Live and verified. Auth flows confirmed. |
| Production deployment | ⚠️ CONDITIONAL | Awaiting: (1) lint clean, (2) DNS cutover decision, (3) CF token rotation |

### 1.2 Security Infrastructure

| Item | Status | Notes |
|---|---|---|
| JWT authentication | ✅ READY | PBKDF2 600k, opaque refresh tokens, single-use rotation |
| Tenant isolation (T3) | ✅ READY | All sprint-4 gaps patched (BUG-001, contact_channels) |
| Role-based access control | ✅ READY | `requireRole()` middleware operational |
| Entitlement middleware | ✅ READY | `requireEntitlement()` on all feature routes |
| Rate limiting | ✅ READY | RATE_LIMIT_KV-backed, fail-open on KV error (chaos-tested) |
| CORS restriction | ✅ READY | ALLOWED_ORIGINS enforced (not wildcard) |
| Input validation (Zod) | ✅ READY | All route handlers use Zod schemas |
| PII protection | ✅ READY | SHA-256 hash for BVN/NIN, AES-GCM for DMs, P13 enforced |
| NDPR consent gates | ✅ READY | `aiConsentGate` middleware + `grantAiConsent()` |
| Webhook HMAC signing | ✅ READY | `@webwaka/webhooks` with PRICE_LOCK_SECRET and INTER_SERVICE_SECRET |
| **CF API token rotation** | ❌ BLOCKED | **URGENT: Token exposed in public commit. Must rotate immediately.** |
| SMOKE_API_KEY | ❌ BLOCKED | Not provisioned — smoke tests disabled |
| Secret rotation (90-day cycle) | ⚠️ CONDITIONAL | Most secrets last rotated 2026-04-01; next due 2026-07-01 (not urgent yet) |
| Dependabot vulnerabilities | ⚠️ CONDITIONAL | 3 moderate — needs patching before GA |

### 1.3 Compliance Infrastructure

| Item | Status | Notes |
|---|---|---|
| NDPR consent records | ✅ READY | `ndpr_consent_records` table, full audit trail |
| NDPR erasure service | ✅ READY | DSAR request processing, R2 export, 7-day compliance window |
| NDPR processing register | ✅ READY | `@webwaka/superagent` NdprRegister |
| CBN KYC tier system | ✅ READY | T0–T3 with daily limits and balance caps |
| INEC campaign cap | ✅ READY | Policy engine `evaluateFinancialCap()` + ₦50M default |
| CAC/FRSC verification | ✅ READY | Prembly API integration |
| NITDA self-assessment | ✅ READY | `docs/qa/nitda-self-assessment.md` |
| External NDPR audit | ❌ NOT YET | Required before GA |
| CBN sandbox submission | ❌ NOT YET | Required before payment processing live |

---

## SECTION 2 — Module Readiness

### 2.1 Pillar 1 — Operations Modules

| Module | Package | Tests | API Routes | Status |
|---|---|---|---|---|
| POS Float Ledger | `@webwaka/pos` | ✅ | ✅ `/pos/*` | ✅ READY |
| Agent Network | `@webwaka/pos` | ✅ | ✅ `/pos/*` | ✅ READY |
| POS Terminals | `@webwaka/pos` | ✅ | ✅ | ✅ READY |
| Airtime/USSD | `apps/ussd-gateway` | ✅ | ✅ `/airtime/*` | ✅ READY |
| HL Wallet | `@webwaka/hl-wallet` | ✅ | ✅ `/wallet/*` | ✅ READY |
| B2B Marketplace | — | ✅ | ✅ `/b2b-marketplace/*` | ✅ READY |
| Negotiable Pricing | `@webwaka/negotiation` | ✅ | ✅ `/negotiation/*` | ✅ READY |
| Groups (Universal) | `@webwaka/groups` | ✅ 24 | ✅ `/groups/*` | ⚠️ RENAME DEBT |
| Support Groups | `@webwaka/support-groups` | ✅ 24 | ✅ `/support-groups/*` | ⚠️ DEPRECATED ALIAS |
| Fundraising | `@webwaka/fundraising` | ✅ 24 | ✅ `/fundraising/*` | ⚠️ INEC NAME DEBT |
| Dues Collection | `@webwaka/fundraising` | ✅ 12 | ✅ `/dues/*` | ✅ READY |
| Mutual Aid | `@webwaka/fundraising` | ✅ 12 | ✅ `/mutual-aid/*` | ✅ READY |
| Cases | `@webwaka/cases` | ✅ | ✅ `/cases/*` | ✅ READY |
| Workflows | `@webwaka/workflows` | ✅ 12 | ✅ `/workflows/*` | ✅ READY |
| Community Spaces | `@webwaka/community` | ✅ 45 | ✅ `/community/*` | ✅ READY |
| Social Graph | `@webwaka/social` | ✅ | ✅ `/social/*` | ✅ READY |
| Analytics | `@webwaka/analytics` | ✅ | ✅ `/analytics/*` | ✅ READY |

### 2.2 Pillar 2 — Branding Modules

| Module | App/Package | Status | Notes |
|---|---|---|---|
| Brand-runtime Worker | `apps/brand-runtime` | ✅ READY | Serves branded websites per tenant |
| Template resolver (bridge) | `template-resolver.ts` | ✅ READY | `resolveTemplate()` called on every page render |
| BUILT_IN_TEMPLATES Map | `template-resolver.ts` | ✅ READY | 154+ niche templates registered |
| White-label theming | `@webwaka/white-label-theming` | ✅ READY | CSS token injection, depth caps |
| WakaPage block builder | `@webwaka/wakapage-blocks` | ✅ READY | Block type definitions |
| WakaPage API routes | `apps/api/src/routes/wakapage.ts` | ✅ READY | Block management endpoints |
| Branding entitlement | `branding-entitlement.ts` | ✅ READY | Plan gates for Pillar 2 |
| Brand settings | `apps/api/src/routes/brand-settings.ts` | ✅ READY | Tenant brand config |
| Template marketplace | `apps/api/src/routes/templates.ts` | ✅ READY | 12 template catalog routes |

### 2.3 Pillar 3 — Discovery Modules

| Module | App/Package | Status | Notes |
|---|---|---|---|
| Public discovery Worker | `apps/public-discovery` | ✅ READY | Geography-powered search, FTS5 |
| Tenant public page | `apps/tenant-public` | ✅ READY | Per-tenant discovery page |
| Discovery SPA | `apps/discovery-spa` | ✅ READY | React frontend |
| Search indexing | `@webwaka/search-indexing` | ✅ READY | FTS5 index builder |
| Claims FSM | `@webwaka/claims` | ✅ READY | 8-state FSM, 36 tests |
| Seeding control plane | S00–S05 migrations | ✅ READY | Provenance + dedupe infrastructure |
| Nigeria geography | `@webwaka/geography` | ✅ READY | 774 LGAs, 8,809 wards seeded |

### 2.4 Cross-Cutting — AI / SuperAgent

| Module | Package | Status | Notes |
|---|---|---|---|
| AI abstraction layer | `@webwaka/ai-abstraction` | ✅ READY | ADL-001 compliant |
| AI adapters | `@webwaka/ai-adapters` | ✅ READY | OpenAI, Anthropic, Google |
| SuperAgent orchestration | `@webwaka/superagent` | ✅ READY | Full SA-1.4 through SA-4.5 |
| BYOK key service | `KeyService` | ✅ READY | 5-level key resolution |
| WakaCU credits | `WalletService` + `CreditBurnEngine` | ✅ READY | Pool→workspace→BYOK waterfall |
| HITL queue | `HitlService` | ✅ READY | Submit, review, expire |
| Spend controls | `SpendControls` | ✅ READY | Per-user/team budget gates |
| Compliance filter | `ComplianceFilter` | ✅ READY | Sensitive sector content filtering |
| NDPR register | `NdprRegister` | ✅ READY | Article 30 processing register |
| Vertical AI configs | `VERTICAL_AI_CONFIGS` | ✅ READY | 159 per-vertical declarations |
| AI governance check | `check-adl-002.ts` (CI) | ✅ READY | Zero credentials in D1 verified |
| Agent loop / stream | `agent-loop.ts` | ✅ READY | Multi-turn AI sessions |

### 2.5 Infrastructure Modules

| Module | Package | Status |
|---|---|---|
| Notifications (engine) | `@webwaka/notifications` | ✅ READY (635 tests) — staging activation blocked by UI-001/002/003 |
| Notificator Worker | `apps/notificator` | ⚠️ CONDITIONAL — staging blockers UI-001/002/003 |
| OTP | `@webwaka/otp` | ✅ READY (68 tests) |
| Offline sync | `@webwaka/offline-sync` | ✅ READY (all M13 gate criteria pass) |
| Policy engine | `@webwaka/policy-engine` | ✅ READY (v0.3.0, 8 evaluators) |
| Ledger | `@webwaka/ledger` | ✅ READY (atomic CTE, kobo-only) |
| Payments | `@webwaka/payments` | ✅ READY (Paystack integration) |
| Identity | `@webwaka/identity` | ✅ READY (BVN/NIN/CAC/FRSC via Prembly) |
| i18n | `@webwaka/i18n` | ⚠️ CONDITIONAL — en 100%, ha/ig/yo/pcm 35% (PRD UX-15 requires 90% before GA) |
| Control plane | `@webwaka/control-plane` | ✅ READY (5 layers, audit service) |
| Partner model | Phases 1+2 ✅ | Phase 3+4 NOT STARTED |
| Log drain | `apps/log-tail` | ✅ READY (Axiom integration) |
| Chaos tests | `apps/api/src/chaos/` | ✅ READY (Phase 1 implemented) |

---

## SECTION 3 — Decision Register (Items Requiring Founder Input)

### DECISION-001 — Production DNS Cutover Timing
**Question:** When should `api.webwaka.com` be pointed to the production Worker?  
**Blocking:** Final production deployment  
**Options:**
- A: After Phase 1 refactor is complete (recommended — avoids naming debt going live)
- B: Immediately after CF token rotation and lint fix (faster)
**Recommendation:** Option A — do not cut DNS to production until naming debt and notification engine staging blockers are resolved.

### DECISION-002 — support-groups Rename Strategy
**Question:** How aggressively should the support-groups → groups rename be executed?  
**Context:** Phase-0-reset created `@webwaka/groups` as canonical and migrations 0432-0437 rename tables. The original 15-table schema (0425) still uses `support_group_*` naming.  
**Options:**
- A: Write a new forward migration renaming all `support_group_*` tables to `group_*` (breaking change to any existing data)
- B: Leave original tables with `support_group_*` names, expose all new features through `@webwaka/groups` which maps to renamed tables
- C: Accept the old naming as-is for internal tables (hidden from API consumers by route renaming)
**Recommendation:** Option A — it's pre-launch, no external consumers. Complete the rename now while it's free.

### DECISION-003 — Vertical Engine Migration Strategy
**Question:** Should the dual-path routing (legacy + engine) be resolved in Phase 1?  
**Context:** `register-vertical-engine-routes.ts` exists but the feature flag is a no-op. 166 engine-registered verticals vs 159 canonical CSV.  
**Options:**
- A: Fix feature flag, run parity testing, gradually migrate legacy routes to engine (Phase 1)
- B: Keep dual-path until Phase 2; remove the dead flag middleware now as a cleanup
- C: Deprecate the engine path entirely if it adds no value (unlikely — vertical engine is strategically important)
**Recommendation:** Option B — clean up the dead flag middleware in Phase 1, but full engine migration is Phase 2 work.

### DECISION-004 — E2EE Direct Messages (ADR-0043)
**Question:** Should E2EE DMs be implemented as a Phase 3 or Phase 5 feature?  
**Context:** Current server-side AES-GCM encryption (P14) is appropriate for compliance/moderation. E2EE would remove moderation capability.  
**Options:**
- A: Implement E2EE in Phase 3 (signal-style protocol, breaks content moderation)
- B: Defer E2EE to Phase 5 or later; maintain server-side encryption with moderation capability
- C: Offer E2EE as an opt-in feature tier where tenants explicitly waive moderation
**Recommendation:** Option B or C — current encryption is appropriate for Nigerian regulatory environment where moderation capability may be legally required.

### DECISION-005 — Partner Phase 3+4 Priority
**Question:** Should partner billing (Phase 3) be prioritized in Phase 4 of the program, or deferred to post-GA?  
**Context:** No partners are currently monetized. Partner Phase 1+2 infrastructure is complete but unused for revenue.  
**Options:**
- A: Build partner billing in program Phase 4 (before GA)
- B: Defer to post-GA (simplify pre-GA scope)
**Recommendation:** Option A — without revenue share, the partner model has no commercial incentive for partners to join.

### DECISION-006 — Africa Expansion Country Order
**Question:** After Nigeria GA, which African country should be second?  
**Options:** Ghana (similar Anglophone market, Paystack supported), Kenya (mobile money culture, M-Pesa), South Africa (largest economy)  
**Recommendation:** Ghana — closest regulatory analogue to Nigeria, Paystack supported, English-language market, minimal infrastructure change.

---

## SECTION 4 — Phase 1 Sprint Readiness (Can Start Immediately)

The following tasks can begin in Phase 1 without any further decision or unblocked dependency:

| Task | Effort | Dependency |
|---|---|---|
| P1-001: Rotate CF API token | 1h | None — start now |
| P1-005: Fix apps/api ESLint errors | 2h | None |
| P1-007: Rotate all overdue secrets | 2h | After P1-001 |
| P1-010: Verify group rename migrations applied | 1h | None |
| P1-011: Deprecate @webwaka/support-groups | 2h | P1-010 |
| P1-012: Rename API route /support-groups → /groups | 2h | P1-011 |
| P1-020: Migrate INEC cap to policy engine | 2h | None |
| P1-030: Audit PlatformLayer enum | 1h | None |
| P1-050: Patch Dependabot vulnerabilities | 2h | None |

**Tasks requiring Ops action (can be parallelized):**
| Task | Effort | Dependency |
|---|---|---|
| P1-002: Provision NOTIFICATION_KV | 1h | None |
| P1-003: Align notificator D1 ID | 30m | None |
| P1-004: Activate NOTIFICATION_PIPELINE_ENABLED | 30m | P1-002, P1-003 |
| P1-006: Provision SMOKE_API_KEY | 1h | Staging API key |

---

## SECTION 5 — Summary Readiness Score

| Dimension | Score | Key Gap |
|---|---|---|
| Core infrastructure | 9/10 | NOTIFICATION_KV not provisioned |
| Security | 7/10 | CF token rotation URGENT; smoke key missing |
| Compliance | 8/10 | External audit not yet done |
| API routes | 8/10 | Lint errors; naming debt |
| Test coverage | 9/10 | 2,811 tests passing |
| Documentation | 10/10 | Extensive governance + ADRs + TDRs |
| Niche template system | 9/10 | 70 P3 niches awaiting templates |
| i18n | 4/10 | 35% Nigeria-native locale coverage |
| Partner model | 6/10 | Revenue model (Phase 3+4) not built |
| AI / SuperAgent | 9/10 | All modules operational |
| Offline / PWA | 9/10 | All M13 gates pass |
| Vertical coverage | 8/10 | P1+P2 complete; 70 P3 niches pending |
| Seeding density | 6/10 | Political foundation good; sector density low |
| **OVERALL** | **7.8/10** | **Pre-launch refactor (Phase 1) required before GA** |

---

## SECTION 6 — Implementation Agent Rules (For Any Agent Starting Phase 1)

Before touching any file in Phase 1, the executing agent MUST:

1. **Read this entire Artifact 07** (you are reading it now)
2. **Read Artifact 01** (`01-platform-truth-map.md`) — understand current state
3. **Read Artifact 03** (`03-invariants-and-constraints-register.md`) — never violate these
4. **Read Artifact 04** (`04-risk-and-debt-register.md`) — know what's broken
5. **Read `docs/governance/platform-invariants.md`** — the founding rules
6. **Read `docs/governance/agent-execution-rules.md`** — how agents must behave
7. **Verify the file exists before reading** — use `ls` before `cat`
8. **Never assume — verify** — claim state from file reads, not from memory
9. **P1 first** — security and naming debt before new features
10. **One migration at a time** — sequential numbering from current max (0461)
11. **Every migration needs a rollback** — no forward migration without `.rollback.sql`
12. **Test before commit** — `pnpm test` must pass before any push
13. **TypeScript must compile** — `pnpm typecheck` must pass
14. **No hardcoded INEC/CBN values** — use policy engine
15. **All money is kobo** — integers only, `assertIntegerKobo()` before writes
16. **All queries include tenant_id** — T3 is non-negotiable
