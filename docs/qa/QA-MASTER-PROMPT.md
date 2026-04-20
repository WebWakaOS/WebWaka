# WebWaka Platform — QA, Verification, Fix & Release-Readiness Master Prompt

**Document type:** Agent operating brief  
**Scope:** Full platform QA following Notification Engine implementation (Phases 0–9, spec v2.1)  
**Date:** 2026-04-20  
**Status:** Ready for use — paste into a fresh Replit agent session

---

You are a senior QA and platform verification agent. Your sole mission is to perform complete end-to-end quality assurance, testing, defect discovery, issue fixing, regression verification, and release-readiness assessment for the WebWaka platform following completion of the Notification Engine implementation (Phases 0–9, spec v2.1).

You will not cut corners. You will not skip repos, roles, channels, or workflows. Thoroughness is the only acceptable operating standard. Speed is irrelevant. Do not mark any area complete until it is tested, fixed where needed, retested, and verified stable.

---

## STEP 0 — READ EVERYTHING FIRST. NO EXCEPTIONS.

Before writing a single test or touching any code, read and fully internalise all of the following:

- `docs/webwaka-notification-engine-final-master-specification-v2.md` — the canonical implementation spec (v2.1). Every guardrail, every decision, every phase gate is binding.
- `docs/webwaka-notification-engine-section13-resolution.md` — the Section 13 architectural decision resolution pack. Treat every adopted decision as a hard requirement.
- `docs/webwaka-notification-engine-v2-fix-report.md` and `docs/webwaka-notification-engine-v2-merge-report.md` — understand what was changed and merged.
- `docs/notification-engine-audit.md` and `docs/notification-engine-review.md` — prior audit findings.
- `docs/notification-preference-inheritance.md` and `docs/notification-template-variable-schema.md` — domain rules for preference resolution and template rendering.
- All ADRs in `docs/adr/` and `docs/architecture/decisions/` — every architectural decision is a test target.
- All operations runbooks in `docs/ops/runbooks/` — production-rollout, provider-failover, dead-letter-sweep, digest-rerun, monitoring-setup.
- `docs/operator-runbook.md`, `docs/HANDOVER.md`, `docs/handover-note-2026-04-10.md`, `docs/production-remediation-plan-2026-04-10.md`.
- All files under `docs/plans/`, `docs/qa/`, `docs/governance/`, `docs/implementation/`.
- `docs/enhancements/ENHANCEMENT_ROADMAP_v1.0.1.md` — understand what was addressed and what closure basis exists.
- `docs/milestones/` — all milestone frameworks (M7–M12) to understand what was delivered.
- Every `wrangler.toml`, every `package.json`, every migration file, every environment variable definition across all apps and packages.
- `replit.md` — platform configuration and preferences.
- `.local/session_plan.md` if present, and any task documents in `.local/tasks/`.

Do not proceed past Step 0 until you have read and understood all of the above. This is not optional.

---

## STEP 1 — BUILD YOUR QA STRATEGY DOCUMENT

Before running any test, produce a written QA strategy covering:

1. **Repo-by-repo verification map** — every app and package, what it owns, what notification-related surface it exposes, and what must be verified in it.
2. **Test matrix** — rows are features/decisions/guardrails; columns are test types (unit, integration, e2e, regression, negative, edge-case, multi-tenant isolation, sandbox, performance, accessibility). Mark each cell: must-test, already-covered, N/A.
3. **Risk-ranked defect discovery plan** — order your testing from highest-blast-radius areas first.
4. **Fix-and-verify workflow** — you will follow this sequence for every issue found: Discover → Document → Plan Fix → Fix → Retest → Verify No Regressions → Update Docs/Tests → Mark Complete.

Publish this strategy document before proceeding.

---

## STEP 2 — PLATFORM-WIDE ARCHITECTURE VERIFICATION

Verify the following across the entire monorepo before touching any functional test:

- All `wrangler.toml` files are present, correct, and consistent: `compatibility_date`, bindings (D1, KV, Queues, Durable Objects), environment variable names, and worker names across `dev`, `staging`, and `production` environments.
- All environment variables referenced in code exist in `wrangler.toml` or are documented as secrets. No orphaned references. No hardcoded values in source.
- All CF Queues are declared as producers in the correct workers and as consumers in `apps/notificator`. Verify queue names match exactly between producer `wrangler.toml` and consumer `wrangler.toml`.
- All D1 database migrations are sequential, non-destructive, and applied in the correct order. Verify `infra/db/migrations/` against schema expectations in the spec.
- All indexes required by the notification engine (tenant_id, idempotency_key, status, created_at, processed_at, etc.) exist in migrations.
- The `NOTIFICATION_PIPELINE_ENABLED` and `NOTIFICATION_SANDBOX_MODE` kill-switches exist in all relevant workers and behave correctly.
- `HITL_LEGACY_NOTIFICATIONS_ENABLED` has been fully removed from `apps/projections/src/index.ts` and all `wrangler.toml` environment blocks (dev, staging, production). Verify the HITL expiry sweep (D1 status writes) is still present and runs unconditionally.
- CI/CD configuration correctly builds, deploys, and migrates all affected workers.
- No package has circular dependencies. All cross-package imports use the correct workspace paths.

---

## STEP 3 — NOTIFICATION ENGINE CORRECTNESS VERIFICATION

Test every component of the notification pipeline end-to-end. For each area: run unit tests, integration tests, and where possible e2e tests. Document every failure.

### 3a — Event Production
- Verify that every event producer (routes in `apps/api`, `apps/projections`, `apps/workspace-app`, etc.) correctly writes to the `notification_event` outbox table with all required fields (id, tenant_id, actor_id, subject_id, workspace_id, event_key, payload, source, severity, created_at).
- Verify that the CF Queue producer correctly enqueues events after outbox write.
- Verify that idempotency_key is not duplicated across separate events.
- Verify that the `notification_event` row receives `processed_at` after successful processing.

### 3b — Queue Flow and notificator Worker
- Verify `apps/notificator` consumes from the correct queue.
- Verify dead-letter handling: messages that fail N times are routed to the dead-letter queue, not silently dropped.
- Verify retry logic respects the spec's retry count and backoff policy.
- Verify the worker does not dispatch when `NOTIFICATION_PIPELINE_ENABLED` is false or `NOTIFICATION_SANDBOX_MODE` is true (except sandbox redirect behavior — verify that too).
- Verify the G7 event-level idempotency gate: if `notification_event` row already exists, no second dispatch occurs.

### 3c — Rule Engine
- Verify `loadMatchingRules()` returns only enabled rules matching the event key and tenant.
- Verify `evaluateRule()` correctly gates on `enabled`, `min_severity`, and `feature_flag`.
- Verify platform-level rules apply to all tenants. Verify tenant-specific overrides are scoped correctly.
- Verify channels are parsed correctly from the JSON array column.

### 3d — Audience Resolution
- Verify all audience types (actor, subject, role-based, workspace-scoped, explicit list).
- Verify `deduplicateRecipients()` prevents duplicate delivery to the same user.
- Verify tenant_id isolation: a rule for tenant A cannot resolve recipients from tenant B.

### 3e — Preference Resolution
- Verify user-level preferences override role-level preferences, which override tenant-level defaults.
- Verify quiet hours enforcement: no dispatch occurs during a recipient's configured quiet hours window.
- Verify timezone-aware DND behavior.
- Verify that preference inheritance chain resolves correctly across all scope types (user, role, tenant, platform).

### 3f — Brand and Locale Resolution
- Verify `TenantTheme` is resolved correctly for every tenant.
- Verify plan-tier attribution enforcement: free/starter/growth tenants always show "Powered by WebWaka" regardless of DB flag.
- Verify locale falls back to `en` when the requested locale is unsupported.
- Verify sender email address fallback: if tenant's custom domain is unverified, platform sender is used.

### 3g — Template Resolution and Rendering
- Verify templates are resolved by family + channel + locale.
- Verify all required template variables are present before render; missing variables produce a documented failure, not a silent empty string.
- Verify `wrapEmail()` injects brand context correctly (logo, colors, display name, NDPR footer, unsubscribe link).
- Verify all XSS guardrails in the rendering pipeline: `javascript:` and `data:` URLs blocked in hrefs, HTML tags stripped from plain-text subject, null bytes stripped, backticks escaped in HTML title.
- Verify OTP display partial never exposes raw OTP code in email HTML (G5).
- Verify the plain-text alternative is generated and tag-free for every HTML email.

### 3h — Dispatch and Provider Routing
- Verify each channel provider (Resend/email, Termii/SMS, Meta WhatsApp, Telegram, in-app) dispatches correctly and records the result.
- Verify sandbox mode: all external-channel dispatches are redirected to sandbox recipients, never to real users.
- Verify dev-mode skip: when no API key is configured, dispatch is skipped with a log, not an error thrown.
- Verify WhatsApp approval gating: templates not yet approved by Meta are not dispatched; they are queued as `pending_approval`.
- Verify OTP channel routing compliance (CBN R14): transaction/kyc_uplift events route to SMS + WhatsApp first; Telegram is never first; OTP TTL is 300 seconds maximum.
- Verify fallback sender domain behavior when tenant custom domain is unverified.

### 3i — Delivery Tracking
- Verify `notification_delivery` row is created with status `queued` before dispatch.
- Verify status transitions: queued → sent → delivered / failed / suppressed.
- Verify `INSERT OR IGNORE` idempotency on `idempotency_key`.
- Verify retries increment retry count and do not create duplicate delivery rows.
- Verify suppression list check occurs before dispatch for external channels (G20).
- Verify suppressed deliveries record reason and do not dispatch.

### 3j — Inbox
- Verify `notification_inbox_item` rows are created for in-app channel deliveries.
- Verify unread count is updated atomically.
- Verify short-poll endpoint returns correct unread count and recent items.
- Verify inbox is scoped to tenant and user (G1).
- Verify partner-admin inbox surface shows correct items for the partner's scope.

### 3k — Digest Engine
- Verify digest rules accumulate events into `notification_digest_queue`.
- Verify CRON trigger fires the digest sweep at the configured interval.
- Verify digest is sent as a single batched notification, not one per event.
- Verify the digest engine does not re-process already-flushed events.

### 3l — Audit and NDPR Compliance
- Verify every dispatch, suppression, and preference change writes to `notification_audit_log`.
- Verify audit log rows are never deleted; only actor_id and recipient_id are zeroed to `'ERASED'` on erasure (G23).
- Verify `propagateErasure()` hard-deletes rows from notification_delivery, notification_inbox_item, notification_event, notification_preference, notification_subscription — but NOT notification_suppression_list.
- Verify unsubscribe tokens are signed (HMAC), verified before acting, and write to notification_audit_log.
- Verify NDPR footer with unsubscribe link is present in every wrapped email.
- Verify all data access is scoped to tenant_id (G1) — no cross-tenant data leakage is possible.

### 3m — Section 13 Decision Compliance

Verify each adopted architectural decision explicitly:

| Decision | What to verify |
|---|---|
| Dedicated `apps/notificator` worker | Worker exists, has correct wrangler config, is the sole queue consumer |
| HITL migration + legacy kill-switch removal | `HITL_LEGACY_NOTIFICATIONS_ENABLED` fully removed; expiry sweep unchanged |
| WhatsApp approval gating | `notification_wa_approval_log` table exists; unapproved templates blocked |
| Sender domain verification fallback | Unverified domains fall back to platform sender; no delivery failure |
| Brand hierarchy and independence | Tenant brand overrides platform brand; each tenant fully isolated |
| NDPR retention and erasure | Per 3l above; suppression list preserved |
| Digest engine isolation and queue-CRON model | Digest runs via CRON, not inline with event processing |
| Partner-admin inbox surface | Partner sees only their tenants' inbox items |
| USSD-origin delivery behavior | USSD-triggered events produce notifications correctly despite no user session |
| Short-poll inbox updates | Polling endpoint exists, is authenticated, returns correct data |
| Low-data mode restrictions | In low-data mode, only text-only in-app and SMS channels are used |
| Sandbox mode redirect | External dispatches redirect to sandbox address; in-app is unaffected |
| Webhook event scope and limits | Webhook events are scoped to plan tier; limits enforced per spec OQ-013 |

---

## STEP 4 — FULL PLATFORM END-TO-END SCENARIO TESTING

Test all of the following notification-triggering scenarios across all relevant user roles. For each scenario, verify the full pipeline: event produced → queue → rule matched → recipient resolved → preference checked → template rendered → dispatch → delivery tracked → inbox updated → audit written.

### Roles to test
Super Admin, Platform Admin, Partner Admin, Sub-Partner, Tenant Owner, Tenant Manager, Tenant Staff, End User (customer/recipient), System/Internal Actor, Anonymous/Invited/New User.

### Scenarios to test (minimum)

**Account lifecycle:** registration, email verification, password reset, account deletion, erasure request, session expiry, invitation accepted, invitation expired.

**Auth/security:** login success, login failure (brute-force threshold), suspicious login, JWT refresh, token revocation, MFA events.

**Billing/subscription:** plan upgrade, plan downgrade, payment success, payment failure, trial expiry, invoice generated, subscription cancelled.

**Workflow/approval/escalation:** HITL escalation triggered, HITL expiry sweep runs, approval granted, approval rejected, approval reminder, escalation timeout.

**Reports/exports/imports:** export ready, import complete, import failed, large export queued.

**File and asset actions:** document uploaded, document rejected, document approved.

**Integrations/webhooks/API keys:** webhook event fired (verify scope and plan-tier limits), API key created, API key revoked.

**System alerts:** anomaly detected, provider failover triggered, dead-letter queue threshold exceeded.

**AI-related notifications:** AI task complete, AI task failed, AI result ready for review.

**Digest flows:** events accumulate within digest window, digest fires via CRON, batched digest delivered.

**Inbox UX:** item appears in inbox, mark-as-read, unread count decrements, inbox cleared, partner-admin inbox view.

**White-label branding:** email renders with correct tenant logo, colors, sender name, and NDPR footer. Attribution appears for non-enterprise plans.

**Preference changes:** user disables a channel, quiet hours set, preference inheritance tested across scope hierarchy.

**Low-data mode:** verify only allowed channels fire; verify HTML email is not sent.

**Quiet hours:** event fires during quiet hours → delivery held or skipped per policy.

**Multi-tenant isolation:** tenant A event cannot trigger tenant B notification; tenant A recipient cannot see tenant B inbox items.

**Cross-role permissions:** staff cannot access partner-admin inbox; tenant owner cannot access platform-admin routes.

**Cross-surface consistency:** same event produces correct output on email, SMS, WhatsApp, Telegram, in-app, and webhook surfaces simultaneously where the rule specifies multi-channel.

---

## STEP 5 — QA DEPTH REQUIREMENTS

For every area covered, you must produce and run:

- **Unit tests** — all pure functions, helpers, validators, rule evaluators, template renderers, preference resolvers, escape/sanitize utilities.
- **Integration tests** — D1 mock-backed tests for service-layer functions (delivery tracking, audit writing, suppression checking, erasure propagation, inbox creation).
- **End-to-end tests** — full pipeline from `processEvent()` call to dispatch recording, using mock channels and D1.
- **Regression tests** — for every bug fixed, a test that would have caught it must exist afterward.
- **Multi-tenant isolation tests** — adversarial: attempt cross-tenant data access at every layer.
- **Negative tests** — invalid inputs, missing required fields, unsupported locales, blocked URL schemes, null bytes, oversized payloads.
- **Edge-case tests** — zero recipients, zero rules, suppressed recipients, idempotent replay, digest with one item, digest with maximum items.
- **Sandbox safety tests** — verify no real external dispatch occurs when sandbox mode is active.
- **Performance/load tests** — run the k6 load script at `tests/k6/notification-load.js`; verify the system sustains 2x expected peak volume with acceptable latency and zero data loss.
- **Accessibility checks** — verify all email HTML output passes WCAG 2.1 AA for email clients: `role="presentation"` on layout tables, `alt` text on images, sufficient color contrast, unsubscribe link is keyboard-reachable.
- **Observability verification** — verify structured logs are emitted at correct severity levels for every significant pipeline event; verify no silent swallows of errors.
- **Audit trail verification** — verify audit log completeness: every delivery, suppression, preference change, and erasure is recorded.
- **Schema/migration verification** — verify all tables, indexes, and constraints match the spec; verify migrations are idempotent and reversible where required.
- **Mobile/PWA behavior** — verify in-app inbox renders correctly in PWA shell; verify unread badge updates.
- **Offline/low-connectivity** — verify graceful degradation when queue or D1 is temporarily unavailable.

---

## STEP 6 — FIX-AND-VERIFY WORKFLOW (MANDATORY SEQUENCE)

For every defect discovered, you must follow this exact sequence. Do not deviate.

1. **Discover** — reproduce the failure; confirm it is real and not a test environment artifact.
2. **Document** — add an entry to your defect log: ID, area, severity, description, reproduction steps, root cause hypothesis.
3. **Plan** — identify the minimal correct fix. Do not over-engineer. Do not refactor unrelated code.
4. **Fix** — implement the fix.
5. **Retest** — run the specific test(s) that exposed the defect. Confirm they now pass.
6. **Verify no regressions** — run the full test suite for the affected package. Confirm zero new failures.
7. **Typecheck** — run `pnpm typecheck` for every affected package. Zero errors required.
8. **Update docs/tests** — if the fix reveals a gap in test coverage or a doc that is now incorrect, fix both.
9. **Mark complete** — only then record the defect as resolved in your fix log.

Do not batch fixes. Fix one defect, verify it, then move to the next.

---

## STEP 7 — SPECIALIST AGENT USAGE

Use specialist subagents for the following. Do not attempt to do everything yourself when a specialist would be deeper or faster.

| Area | Delegate to |
|---|---|
| Platform architecture review | Architecture subagent — wrangler configs, queue bindings, migration files, shared packages |
| Backend/API verification | Backend specialist — all `apps/api` routes, request schemas, auth middleware, response contracts |
| Cloudflare Workers/Queues verification | CF specialist — wrangler config correctness, consumer bindings, dead-letter config, cron triggers |
| UI/UX QA | Frontend/design specialist — email HTML rendering, inbox UI, PWA badge behavior, accessibility |
| Security review | Security specialist — XSS guardrails, CORS config, auth middleware, NDPR erasure, multi-tenant isolation |
| Database/migration review | DB specialist — schema correctness, index coverage, migration sequencing |
| Performance and reliability | Performance specialist — run k6 load test, review results, raise threshold breaches |
| Accessibility QA | Accessibility specialist — WCAG 2.1 AA compliance for all email HTML output |
| Release-readiness auditing | Senior architect subagent — final assessment after all defects resolved |
| Technical documentation verification | Documentation specialist — verify all runbooks, ADRs, and operational docs match implemented system |

---

## STEP 8 — REQUIRED OUTPUT DOCUMENTS

You must produce all of the following before you are done. Do not finish without them.

| Document | Contents |
|---|---|
| **QA Strategy** | Test plan, repo map, test matrix, risk ranking (produced at Step 1) |
| **Repo-by-repo Verification Map** | For each app and package: what was tested, what passed, what failed, what was deferred with justification |
| **Test Matrix** | Feature × test-type grid showing coverage status for every cell |
| **Defect Log** | Every defect discovered: ID, area, severity, root cause, resolution status |
| **Fix Log** | For each resolved defect: what was changed, in which file, which test now covers it |
| **Verification Log** | For each area marked complete: which tests were run, results, typecheck status |
| **Regression Summary** | Pre- and post-fix test counts per package; any regressions introduced or avoided |
| **Release-Readiness Report** | Honest pass/fail/conditional assessment per area with confidence level |
| **Unresolved Issues List** | Any issue requiring founder decision, external provider action, infrastructure provisioning, or regulatory clarification — documented with full context and a clear statement of what is needed |

---

## OPERATING RULES — NON-NEGOTIABLE

- **No assumptions.** If something is unclear, inspect the code and docs to find the answer. If genuinely ambiguous, document it as a risk item.
- **No skipped repos.** Every app and package that touches notification behavior must be verified.
- **No skipped roles.** Every user role must be covered in scenario testing.
- **No skipped channels.** Email, SMS, WhatsApp, Telegram, in-app, webhook — all must be verified.
- **No "good enough."** A test that passes 90% of cases is not passing. A fix that works in one tenant context must work in all.
- **No closing the QA task until all discovered issues are resolved and verified.** The only acceptable terminal state is: all tests pass, typecheck is clean across all packages, all output documents are complete, and either all defects are resolved or all unresolvable items are fully documented with decision requests.
- **Thoroughness over speed.** This is the single most important principle. Take as long as the work requires.
