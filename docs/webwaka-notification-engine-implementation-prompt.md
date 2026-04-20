# WebWaka Notification Engine — Master Implementation Prompt

**Document:** `docs/webwaka-notification-engine-implementation-prompt.md`
**Purpose:** Master prompt for the agent that will execute the WebWaka Notification Engine implementation, phase by phase.
**Canonical spec:** `docs/webwaka-notification-engine-final-master-specification-v2.md` (v2.1)
**Resolution pack:** `docs/webwaka-notification-engine-section13-resolution.md`

---

You are a senior platform engineer being handed a fully-specified, implementation-ready feature workstream for WebWaka OS. Your job is to implement the **WebWaka Notification Engine** — completely, correctly, and thoroughly — phase by phase, with no shortcuts, no skipped steps, and no deferred fixes.

---

## MANDATORY ORIENTATION — DO THIS FIRST, BEFORE ANYTHING ELSE

Before writing a single line of code, you must fully orient yourself to the platform. This is not optional and must not be abbreviated. Work through every item below in order.

### Step 1 — Read the canonical specification and all supporting documents

Read all of these documents in full before proceeding:

1. `docs/webwaka-notification-engine-final-master-specification-v2.md` — the canonical v2.1 specification. This is the single authoritative source of truth for all implementation decisions. Every section matters: domain model, reference architecture, template system, repo impact, roadmap, guardrails, resolved decisions, backlog, and readiness gates.
2. `docs/webwaka-notification-engine-section13-resolution.md` — the Section 13 resolution pack. This document resolved all 13 open architectural questions. If the v2.1 spec and this document appear to differ on any point, treat the v2.1 spec as authoritative (it supersedes and incorporates the resolution pack).
3. `docs/webwaka-notification-engine-v2-merge-report.md` — the merge report documenting what changed between v1.0 and v2.0.
4. `docs/webwaka-notification-engine-v2-fix-report.md` — the QA correction report documenting the 4 defects fixed in the v2.1 pass.
5. `replit.md` — the platform overview and current-state summary.
6. `docs/ops/implementation-plan.md` — the existing platform-wide phased implementation plan; understand where the notification engine fits.

Do not skim these. Read them completely. The spec is 2,300+ lines and every section has implementation consequences.

### Step 2 — Conduct a deep platform review

After reading the specification documents, conduct a thorough review of the existing codebase. You must understand what already exists before building anything new. Specifically:

- Walk the full monorepo structure. Understand every `apps/*` Worker, every `packages/*` library, and the `infra/` directory.
- Read `apps/api` fully: all route files, all existing services (`email-service.ts`, `webhook-dispatcher.ts`), all middleware, all existing auth, billing, partner, bank-transfer, AI, and USSD routes. These are where notification events will be wired.
- Read `apps/projections`: understand the HITL CRON sweep, the existing dispatch logic, and where the `HITL_LEGACY_NOTIFICATIONS_ENABLED` kill-switch must be inserted.
- Read `apps/ussd-gateway`: understand how events are published and where `source: 'ussd_gateway'` must be added.
- Read `packages/events`: understand `DomainEvent`, `publishEvent()`, `EventType`, and how events propagate. This package is extended significantly in Phase 1.
- Read `packages/white-label-theming`: understand `TenantTheme`, the brand resolution chain, and where `brand_independence_mode` must be added.
- Read `packages/i18n`: understand `createI18n()`, `detectLocale()`, and `SupportedLocale`. All template locale resolution must use this package — no parallel system may be built.
- Read `packages/otp`: understand the existing OTP flow and CBN R8 compliance requirements (G5 — transaction OTPs must use SMS only).
- Read `infra/db/migrations/`: find the highest-numbered migration file (currently `0253_*`). All new notification migrations begin at `0254_*` and run through `0273_*`.
- Read `apps/workspace-app`, `apps/partner-admin`, `apps/brand-runtime`, `apps/tenant-public`, `apps/platform-admin`: understand their current structure and where notification UI components must be added.
- Read all existing tests to understand testing patterns, test naming conventions, and what the current test suite covers.

You must not begin implementation until you can answer these questions from memory: What is the current email delivery path? Where does `new EmailService()` appear? What does `apps/projections` dispatch and how? What does the existing webhook dispatcher do and what is its retry mechanism? How many migration files exist and what is the next available number?

### Step 3 — Read and internalise all 25 guardrails

Section 12 of the v2.1 specification defines 25 guardrails (G1–G25). These are non-negotiable. Before implementation begins, you must be able to state the content of every guardrail from memory. Every piece of code you write must be checked against all 25 guardrails. If any guardrail is violated in your implementation, it is a blocking defect.

Pay special attention to:

- **G1** — Tenant isolation is absolute. Every query must include `tenant_id` in the WHERE clause. Every KV cache key must be prefixed `{tenant_id}:`.
- **G2** — No direct `EmailService` instantiation in route handlers after Phase 2.
- **G3** — No hardcoded FROM address after Phase 3.
- **G12** — Critical notifications bypass quiet hours AND the digest engine must never cross tenant boundaries within `processDigestBatch()`.
- **G16** — Provider credentials in KV only, never in D1 (ADL-002).
- **G17** — WhatsApp templates must be `meta_approved` before dispatch; fallback to SMS if not.
- **G21** — USSD-origin events (`source='ussd_gateway'`) must bypass quiet hours for SMS only; no push.
- **G22** — Low-data mode: push suspended; in-app text-only; SMS for critical only; poll extended to 120s.
- **G23** — NDPR erasure: audit log rows zeroed (`'ERASED'`), never deleted; all other tables hard-delete.
- **G24** — `NOTIFICATION_SANDBOX_MODE=true` in all non-production environments; CI check enforces this.
- **G25** — Webhook subscriptions gated by plan tier: standard max 25, business max 100, enterprise unlimited.

---

## IMPLEMENTATION PROTOCOL — FOLLOW THIS FOR EVERY PHASE

You must follow this exact protocol for every phase, without exception.

### Phase Protocol

**1. FULL-PLATFORM RE-REVIEW** (mandatory before every phase, even if you just completed the previous phase)

Before beginning each phase, re-read:
- The section(s) of the v2.1 spec that cover the current phase's scope
- Every repo and file that the current phase will touch
- The backlog items for the current phase (Section 14 of the spec)
- The exit criteria and readiness gates for the current phase (Sections 11 and 15 of the spec)
- The guardrails that are most relevant to the current phase

Never assume your memory of the codebase is current. The platform is large. Re-read the actual files.

**2. PHASE PLAN** (written before implementation begins)

Produce a written implementation plan for the phase before writing code. The plan must include:
- Every backlog task in the phase (by ID: N-XXX), with the exact scope of work each task requires
- Every file that will be created or modified, with a description of the change
- Every migration file that will be added, with the full schema change
- Every test that will be written, with the assertion logic described
- The order in which tasks will be executed, with dependency sequencing
- All guardrails that apply to this phase's work
- All edge cases that must be handled (multi-tenant isolation, error states, fallback chains, quiet hours, sandbox mode, etc.)
- The exact exit criteria that will confirm the phase is complete

Do not begin implementation until the plan is complete and internally consistent.

**3. IMPLEMENTATION** (task by task, in dependency order)

Implement the phase one task at a time in the order specified in your plan. For each task:
- Write the implementation code
- Write the tests for that task immediately — do not defer testing to the end of the phase
- Verify the task compiles and its tests pass before moving to the next task
- Check the implementation against every applicable guardrail before moving on

Never implement multiple tasks simultaneously if they have dependencies. Never implement a task and defer its tests to a later point.

**4. PHASE VERIFICATION** (mandatory after implementation is complete)

After all tasks in the phase are implemented:
- Run the full existing test suite. Every previously-passing test must still pass. A regression introduced by your phase is a blocking defect.
- Run all new tests introduced in this phase. Every new test must pass.
- Run all TypeScript type checks. Zero TypeScript errors are permitted.
- Run all governance and lint checks (ESLint, any custom governance scripts in the repo).
- Manually trace the critical path introduced in this phase end-to-end. For example, in Phase 2, trace a single notification event from `publishEvent()` → Queue enqueue → Queue consumer → rule evaluation → delivery persistence → audit log write. Verify at each step that the data is correct, the tenant isolation is enforced, and the guardrails are satisfied.
- Cross-check every item in the phase's exit criteria list (Section 11 of the spec). If any criterion is not met, it is a blocking defect.

Use specialist verification agents and QA agents wherever available to help with multi-tenant isolation checks, security checks, and compliance verification.

**5. FIX** (if any defect is found during verification)

If any defect is found:
- Document the defect precisely (what is wrong, where, what it should be)
- Fix it
- Re-run all relevant tests
- Re-verify the exit criteria affected by the defect
- Only declare the phase complete when all tests pass and all exit criteria are met

Never move to the next phase while any defect from the current phase remains unresolved. There is no "we'll fix it later." Fix it now.

**6. PHASE SIGN-OFF** (produce a written confirmation before advancing)

Before beginning the next phase, produce a written phase sign-off that states:
- Every backlog task in this phase: completed ✅ or not completed ❌ (must be all ✅)
- Every exit criterion: satisfied ✅ or not satisfied ❌ (must be all ✅)
- Test suite results: N tests passing, 0 failing, 0 TypeScript errors
- Any deferred items: there must be none; if there are, fix them before advancing
- The readiness gate checks for the next phase (from Section 15 of the spec): confirmed or blocked

---

## PHASE SEQUENCE — STRICTLY IN ORDER, NO SKIPPING, NO COLLAPSING

The 9 phases must be executed in exact order. Do not begin Phase N+1 until Phase N is signed off. Do not collapse two phases into one. Do not treat a phase as "mostly done" — it is either completely done or not done.

### Phase 0 — Contracts, Standards, and Infrastructure Setup

Backlog tasks: N-001 through N-009.

This phase establishes the foundation everything else rests on. It must be complete before a single line of Phase 1 implementation is written.

Critical actions:
- Define the full 100+ event key catalog in `packages/events/src/event-types.ts`. These keys are referenced across the entire engine and must be correct before any other phase proceeds.
- Write all D1 schema SQL for all 16 notification tables, migrations `0254_*` through `0273_*`. Every schema decision in Section 7 of the spec must be reflected exactly, including all v2-specific columns (`source`, `low_data_mode`, `text_only_mode`, `sandbox_redirect`, `sender_domain_name`, `brand_independence_mode`, `meta_template_name`, `meta_template_id`, etc.). Include rollback scripts for every migration (CI-003 governance rule).
- Define all TypeScript interfaces: `INotificationChannel`, `ITemplateRenderer`, `IPreferenceStore`, `NotificationPipelineKillSwitch`.
- Scaffold `packages/notifications` as a compilable skeleton.
- Provision CF Queues and add producer bindings to `apps/api/wrangler.toml`.
- Scaffold `apps/notificator` Worker: `wrangler.toml` (staging + production environments, CRON triggers, D1 binding, KV binding, Queue consumer binding, all env vars), `src/index.ts` (queue handler + scheduled handler), `src/env.ts`, `package.json`. This Worker must compile and deploy to staging before Phase 1 begins.
- Add `HITL_LEGACY_NOTIFICATIONS_ENABLED` env var to `apps/projections/wrangler.toml` and document the kill-switch pattern (N-009).

Exit criteria: All contracts defined. Schema SQL reviewed and correct. `packages/notifications` skeleton compiles. `apps/notificator` scaffolded, compiles, and receives a test queue message on staging. CF Queues provisioned. All 16 entity schemas match Section 7 exactly.

---

### Phase 1 — Core Event Infrastructure

Backlog tasks: N-010, N-011, N-012, N-012a, N-013, N-014, N-015, N-060a.

Critical actions:
- Expand `@webwaka/events` EventType catalog to 100+ types with fully typed payloads.
- Add `correlation_id` and `source` fields to `DomainEvent` and `publishEvent()`. The `source` field is `'api' | 'ussd_gateway' | 'cron' | 'queue_consumer'` — this is required for USSD delivery logic (G21).
- Implement the CF Queues consumer in `apps/notificator`: `queue()` handler that processes notification messages and digest batch messages. The `scheduled()` handler for CRON digest sweeps (N-012a) must also be implemented here.
- Wire the outbox pattern: `publishEvent()` must write to `event_log` within the same D1 transaction as the business record.
- Run and validate all migrations `0254_*` through `0273_*` on staging. Verify the schema matches Section 7 exactly for every table and column.
- Write seed data for platform `notification_rules` and `notification_templates`.

Exit criteria: 100+ event types defined. `apps/notificator` receiving events from the Queue. `event_log` persisting with `correlation_id` and `source`. All 19 migration files validated on staging D1.

---

### Phase 2 — Core Notification Service and Data Model

Backlog tasks: N-020 through N-029.

Critical actions:
- Implement `NotificationService.raise()` with the `NOTIFICATION_PIPELINE_ENABLED` kill-switch gate.
- Implement the rule engine (load rules, evaluate enabled/feature_flag/min_severity, select channels and template family, evaluate digest eligibility).
- Implement audience resolution for all `audience_type` values including `partner_admins`.
- Implement `notification_delivery` persistence with idempotency key (G7). The `idempotency_key UNIQUE` constraint must be enforced at the DB level.
- Implement in-app channel: write to `notification_inbox_item` with `delivery_id` FK.
- Wire `EmailService` as a Resend channel implementation behind `INotificationChannel`. Replace all inline `new EmailService()` calls in `apps/api/src/routes/auth-routes.ts` with `notificationService.raise(...)`.
- Implement `notification_audit_log` writes for every send attempt and preference change (G9).
- Write multi-tenant isolation tests that prove cross-tenant delivery cannot occur (G1).
- Implement `SuppressionService` with address hash lookup (G20).

Exit criteria: `auth.user.registered` flows through full pipeline. In-app inbox item created. Email delivered via Resend. Audit log written. No cross-tenant leakage demonstrated by isolation test suite. Suppression checked on all external dispatches.

---

### Phase 3 — Template Engine and Branding

Backlog tasks: N-030 through N-041, N-033a.

Critical actions:
- Implement `TemplateRenderer` using `@webwaka/i18n` exclusively for locale resolution. No parallel locale system (G18). All template rendering must go through `createI18n(locale)` and `detectLocale(request)`.
- Build the email wrapper with multi-level brand context injection via `resolveBrandContext(workspaceId, db)`.
- Implement `resolveBrandContext()` with `brand_independence_mode` check (OQ-005, G4, N-033a): if the Sub-Partner has `brand_independence_mode=1`, skip the parent Partner and fall through directly to Platform Default.
- Add `brand_independence_mode` column to the sub-partners entity via migration `0273_*` and implement it in `packages/white-label-theming`.
- Implement partials library: `cta_button`, `data_table`, `alert_box`, `legal_footer`, `otp_display`.
- Implement sender domain verification fallback (OQ-004): while `sender_domain_verified=0`, use the platform FROM address with tenant display name in subject prefix; record `sender_fallback_used=1` in delivery. The FROM address must never be hardcoded after this phase (G3).
- Implement WhatsApp template approval workflow (OQ-003): `whatsapp_approval_status` gate in template resolution; automatic SMS fallback for non-`meta_approved` templates; super_admin alert via `system.provider.down` event on rejection. Record all submissions in `notification_wa_approval_log`.
- Add `meta_template_name`, `meta_template_id`, `meta_rejection_reason` to `notification_template`.
- Migrate all 6 existing email templates into the `notification_template` table.
- Add notification i18n keys to all 6 locale files in `packages/i18n`.

Exit criteria: All 6 email templates rendered via template engine with tenant branding. Test-send works. Preview endpoint works. Locale fallback works. `@webwaka/i18n` used throughout — no parallel locale resolution exists. `resolveBrandContext()` correctly respects `brand_independence_mode`. WhatsApp fallback to SMS confirmed in tests.

---

### Phase 4 — Channel Providers and Delivery Tracking

Backlog tasks: N-042 through N-055, N-131, N-132.

Critical actions:
- Implement `INotificationChannel` for every channel: Resend (email with sender_fallback logic), Termii (SMS), Meta WhatsApp (meta_approved gate with platform WABA), 360dialog WhatsApp, Telegram, web push (FCM), Slack webhook, Teams webhook.
- Implement fallback channel chain logic.
- Implement delivery status tracking end-to-end: `queued → rendering → dispatched → delivered/failed`.
- Implement Resend bounce webhook handler: update `notification_suppression_list` with hashed address.
- Add per-tenant `channel_provider` overrides with domain verification and fallback logic (N-053). Add sender domain verification UI to `apps/brand-runtime` (N-053a). Add CRON for auto-polling Resend domain verification every 6 hours in `apps/notificator` (N-053b).
- Store all provider credentials via ADL-002: AES-256-GCM encrypted in KV, referenced by `credentials_kv_key`. Zero provider API keys in D1 (G16).
- **Migrate webhook dispatcher inline retry to CF Queues (N-131)** — this is a prerequisite to webhook expansion and must be complete before Phase 6.
- Implement `webhook_event_types` registry table, seeded with the 30-event starter set at `plan_tier='standard'` and remaining events at `plan_tier='enterprise'` (N-132).

Exit criteria: All channels wired and tested. Provider credentials confirmed to be in KV (zero in D1 — verifiable by the ADL-002 governance check script). Delivery status tracked end-to-end. Bounce handling updates suppression list. Sender domain fallback confirmed by test. Webhook dispatcher using Queues.

---

### Phase 5 — Preferences, Inbox, and Digest Engine

Backlog tasks: N-060 through N-071, N-067a.

Critical actions:
- Implement `PreferenceService` with full 4-level inheritance (platform → tenant → role → user). KV-cache preference reads with tenant-prefixed keys (5-min TTL; key prefix: `{tenant_id}:pref:`).
- Implement USSD-origin check in the preference resolver (OQ-009, G21): if `source='ussd_gateway'`, SMS dispatched immediately (bypass quiet hours for SMS only); push suppressed; in-app follows standard quiet hours.
- Implement low-data mode check (OQ-011, G22): if `low_data_mode=1`, push suspended; in-app items get `text_only_mode=1`; SMS only for `severity='critical'`; poll interval instruction set to 120s.
- Implement quiet hours (timezone-aware; Africa/Lagos default; deferred via CF Queue message delay — not suppressed). `severity='critical'` bypasses (G11, G12).
- Implement digest window management: global CRON enqueues per-batch Queue messages; `processDigestBatch()` processes each batch independently with full tenant isolation enforced — every query in `processDigestBatch()` must include `AND tenant_id = :tenantId` (G12).
- Build inbox API: paginated `GET /notifications/inbox`, `PATCH` state (read/archive/snooze/pin/dismiss), `DELETE`.
- Build `GET /notifications/inbox/unread-count` endpoint: KV-cached per user (10s TTL; cache key: `{tenant_id}:inbox:unread:{user_id}`). This is the short-poll target (OQ-010).
- Build notification bell and drawer in `apps/workspace-app` with `useNotificationPoll` hook: 30s interval normally, 120s when `low_data_mode=1`. Text-only rendering when `text_only_mode=1` on inbox item.
- Build low-data mode toggle in `apps/workspace-app` preference settings page.
- Add unsubscribe landing page to `apps/tenant-public`: validates HMAC-signed unsubscribe token, calls `SuppressionService`, renders tenant-branded confirmation.
- Document SSE upgrade path in architecture ADR (N-067a).

Exit criteria: Preferences work across all 4 scopes. Low-data mode suppresses push and enables text-only in-app — verified by test. USSD-origin events get immediate SMS — verified by test. Inbox functions: create, read, archive, unread count. Digest batches process via Queue-continued CRON sweep. Short-poll bell badge updates within 30 seconds of notification event. KV cache confirmed working on unread-count endpoint.

---

### Phase 6 — Route and Vertical Wiring

Backlog tasks: N-080 through N-100a, N-133, N-091a.

**This is the largest and highest-risk phase. Read the entire codebase again before beginning.**

Critical pre-conditions — all must be confirmed before Phase 6 begins (Section 15 of spec):
- `NOTIFICATION_SANDBOX_MODE=true` deployed to staging (execute N-111 early, even though it is formally Phase 7)
- `NOTIFICATION_PIPELINE_ENABLED` kill-switch implemented and tested
- Duplicate-send audit tooling confirmed working (audit log query: `COUNT(*) = 1` per event_id)
- Webhook dispatcher Queue migration (N-131) complete
- OQ-008 gate confirmed: shared inbox schema ready

Critical actions:
- Wire all 100+ notification events across all route files: auth (15 events), workspace (11), billing (12), KYC (6), claims (7), negotiation (7), support (5), AI/superagent (9), onboarding (3), POS/finance (4), social (5), partner ecosystem (6 — must use `category='partner'` in inbox items), bank-transfer FSM (7), B2B marketplace, airtime, transport FSM.
- Wire canonical vertical events in all 160+ vertical packages (via `@webwaka/vertical-events`).
- Add `source: 'ussd_gateway'` to all `publishEvent()` calls in `apps/ussd-gateway`.
- Add notification bell UI to `apps/partner-admin` using shared inbox API with `?category=partner` filter (N-091a, OQ-008).
- Add tier-gated webhook subscription API: `POST /webhooks/subscriptions` with entitlement check and subscription cap enforcement; `DELETE /webhooks/subscriptions/:id`; `GET /webhooks/events` filtered to tenant plan tier (N-133, G25).
- Activate the HITL kill-switch: add the `HITL_LEGACY_NOTIFICATIONS_ENABLED` guard in `apps/projections` (N-100a). Set to `0` on staging. Validate zero double-notifications in 48 hours of observation.
- Replace all remaining direct `EmailService` instantiations in route handlers (G2 enforcement).

Rollback plan: `NOTIFICATION_PIPELINE_ENABLED=0` reverts to legacy EmailService. `HITL_LEGACY_NOTIFICATIONS_ENABLED=1` restores projections CRON dispatch. Always be able to roll back.

Exit criteria: Zero direct `EmailService` calls in route handlers. All business events produce notifications through the pipeline. No duplicate sends. `HITL_LEGACY_NOTIFICATIONS_ENABLED=0` confirmed on staging with clean 48-hour observation. Partner-admin bell UI functional. Webhook subscription tier enforcement verified.

---

### Phase 7 — Admin Tooling and Observability

Backlog tasks: N-105 through N-114, N-118, N-111 (formally in this phase; executed early in Phase 6 readiness).

Critical actions:
- Build platform-admin notification template management UI (CRUD, preview, test-send).
- Build WhatsApp template approval tracker UI in `apps/platform-admin` (shows `notification_wa_approval_log`, approve/reject workflow, `PATCH /notifications/templates/:id/whatsapp-status`).
- Build cross-tenant delivery log viewer in `apps/platform-admin`.
- Build dead-letter queue inspector with replay and dismiss capabilities.
- Build channel provider health dashboard.
- Build notification rule editor for super_admin.
- Implement delivery anomaly alerts (bounce rate >5% → `system.provider.down` event).
- Fully implement `NOTIFICATION_SANDBOX_MODE` redirect in `apps/notificator/src/sandbox.ts` (`resolveSandboxRecipient()`). Confirm `sandbox_redirect=1` and `sandbox_original_recipient_hash` written on all staging deliveries. Confirm zero real-user deliveries in staging.
- Add CF Logpush integration for notification event logs.
- Add tenant notification delivery log to `apps/brand-runtime`.

Exit criteria: All admin tooling operational. WhatsApp approval tracker functional. Dead-letter inspector can replay and dismiss. Sandbox mode enforced: 1,000 test notifications produce zero real-user emails or SMSs. CI/CD governance check confirms production `NOTIFICATION_SANDBOX_MODE='false'`.

---

### Phase 8 — Data Retention and Compliance Hardening

Backlog tasks: N-115, N-116, N-117.

Critical actions:
- Implement daily retention CRON in `apps/notificator`: hard-delete `notification_delivery` rows older than 90 days; hard-delete `notification_inbox_item` rows older than 365 days.
- Implement NDPR erasure propagation (G23): when the platform's `DELETE /auth/me` erasure flow fires, it must propagate to all notification tables within 24 hours. `notification_audit_log` rows: zero `actor_id` and `recipient_id` to `'ERASED'` — never delete audit rows. All other notification tables: hard-delete the user's rows. Suppression list entries must survive erasure (suppression must persist past account deletion).
- Implement attribution enforcement in email templates per plan tier.
- Obtain legal/compliance sign-off on TTL values (90d / 365d / 7yr) and document in ADR. This sign-off must be recorded before Phase 8 is declared complete (Section 15 readiness gate).

Exit criteria: All notification tables have automated retention enforcement. Erasure zeroes `actor_id`/`recipient_id` in audit log — confirmed by test (query returns 0 rows with original userId; audit log rows exist with `recipient_id='ERASED'`). Hard-delete confirmed for all other tables. Attribution rule enforced and tested.

---

### Phase 9 — QA Hardening and Production Rollout

Backlog tasks: N-120 through N-130, N-100b.

Critical actions:
- Full E2E Playwright test suite for all notification flows.
- Multi-tenant isolation penetration test: verify that no delivery, preference, template, or inbox item is accessible cross-tenant.
- Load test: 10,000 notifications/hour across 100 tenants on staging. All processed within acceptable time windows.
- NDPR compliance audit: consent gating, unsubscribe flow, erasure propagation — each verified end-to-end.
- CBN compliance audit: OTP channels confirm transaction OTPs use SMS only (G5, R8 preservation) — `@webwaka/otp` package.
- Template XSS security review: all user-supplied variables HTML-escaped before rendering. URLs validated against HTTPS allowlist.
- Email accessibility audit: WCAG 2.1 AA, plain-text auto-generation.
- ADL-002 audit: run governance check script to confirm zero provider API keys in D1.
- CI/CD governance check: confirm `NOTIFICATION_SANDBOX_MODE='false'` in production wrangler.toml.
- Production rollout via feature flag per tenant: observe for 2 weeks with active monitoring.
- 30-day production monitoring period.
- Write operations runbooks: provider failover, dead-letter sweep, digest rerun.
- Delete legacy HITL dispatch code from `apps/projections` (N-100b) after 48 hours of clean production observation with zero double-notifications.

Exit criteria: All tests pass. NDPR/CBN compliance verified. Load test passes at 2x expected volume. Zero credentials in D1. Production rollout complete with monitoring active. Operations runbooks written. Legacy HITL dispatch code deleted.

---

## NON-NEGOTIABLE RULES — THESE APPLY FOR THE ENTIRE IMPLEMENTATION

**Alignment:** Every implementation decision must be traceable to a specific section of `docs/webwaka-notification-engine-final-master-specification-v2.md` (v2.1). If you make a decision that is not covered by the spec, stop and re-read the spec before proceeding. If genuinely ambiguous, re-read the resolution pack.

**Thoroughness over speed:** Never take a shortcut to finish faster. Never stub a function and leave it for later. Never write a test that asserts `true === true`. Never mark a phase as done because it is "close enough." Each phase must be entirely complete before the next begins.

**No assumption without verification:** Do not assume a file has a certain structure — read it. Do not assume a test passes — run it. Do not assume a guardrail is satisfied — trace the code path.

**Multi-tenant isolation is sacrosanct:** Every database query that reads or writes notification data must include `AND tenant_id = ?`. Every KV key must be prefixed with `{tenant_id}:`. This is not a best practice — it is G1, and a violation is a production-severity defect.

**White-label correctness:** Every email sent must carry the correct tenant branding via `resolveBrandContext()`. The FROM address must never be hardcoded (G3). Brand context must be loaded before any template renders (G4).

**Compliance is not optional:** NDPR erasure (G23), consent gating (G8), suppression checking (G20), OTP channel compliance (G5), sandbox enforcement (G24), and webhook plan gating (G25) are legal and regulatory obligations, not feature work. They must be implemented to the letter.

**Tests are not optional:** Every task must have tests. Tests must be written in the same implementation step as the code, not afterward. The test suite must never regress.

**Use specialist agents:** For security reviews, multi-tenant isolation testing, compliance verification, template XSS checks, accessibility audits, and load testing, use the best available specialist QA, testing, and verification agents. Do not attempt to do deep security or compliance work without specialist review.

**Zero tolerance for deferred defects:** If you find a defect, fix it before advancing. Log it, fix it, verify the fix, then continue. There is no defect backlog during implementation — every defect found must be resolved in the phase where it is found.

---

## DOCUMENTS TO KEEP OPEN AND CURRENT THROUGHOUT IMPLEMENTATION

At every phase:
- `docs/webwaka-notification-engine-final-master-specification-v2.md` — primary source of truth
- `docs/webwaka-notification-engine-section13-resolution.md` — secondary source of truth for all 13 resolved decisions
- Section 12 of the spec (25 guardrails) — check every code change against these
- Section 14 of the spec (execution backlog) — track task completion
- Section 15 of the spec (readiness gates) — confirm phase gates before advancing

---

Begin with the mandatory orientation. Do not write code until the orientation is complete. Do not advance past any phase until it is signed off. Build this correctly, completely, and in full.
