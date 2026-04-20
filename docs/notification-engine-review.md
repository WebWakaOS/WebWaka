# WebWaka OS — Platform-Wide Notification Engine Review & Implementation Plan

**Prepared:** 2026-04-20  
**Review Mode:** DEEP CODE-FIRST  
**Status:** Authoritative. All conclusions grounded in inspected source files.

---

## TABLE OF CONTENTS

1. [Deliverable 1 — Platform Review Method](#deliverable-1--platform-review-method)
2. [Deliverable 2 — Current-State Findings](#deliverable-2--current-state-findings)
3. [Deliverable 3 — Canonical Notification Event Catalog](#deliverable-3--canonical-notification-event-catalog)
4. [Deliverable 4 — Missing Elements List](#deliverable-4--missing-elements-list)
5. [Deliverable 5 — Canonical Domain Model](#deliverable-5--canonical-domain-model)
6. [Deliverable 6 — Reference Architecture](#deliverable-6--reference-architecture)
7. [Deliverable 7 — Template System Design](#deliverable-7--template-system-design)
8. [Deliverable 8 — Repo-by-Repo Implementation Impact](#deliverable-8--repo-by-repo-implementation-impact)
9. [Deliverable 9 — Phased Implementation Roadmap](#deliverable-9--phased-implementation-roadmap)
10. [Deliverable 10 — Best-Practice Guardrails](#deliverable-10--best-practice-guardrails)
11. [Deliverable 11 — Actionable Backlog](#deliverable-11--actionable-backlog)

---

## DELIVERABLE 1 — PLATFORM REVIEW METHOD

### Review Approach

This review was conducted in full DEEP CODE-FIRST mode across the entire WebWaka monorepo. Every conclusion is grounded in actual source files, not documentation assumptions. Where docs existed, they were cross-referenced against code. Where code contradicted docs, code was authoritative.

### Repos and Packages Inspected

**Apps inspected:**
- `apps/api` — Central Hono API Worker (all routes, middleware, lib, jobs, contracts)
- `apps/platform-admin` — Super-admin local dev shim
- `apps/admin-dashboard` — Admin dashboard frontend
- `apps/ussd-gateway` — USSD + Telegram Bot Worker
- `apps/brand-runtime` — Tenant white-label storefront
- `apps/public-discovery` — Public marketplace/directory
- `apps/partner-admin` — Partner admin portal
- `apps/workspace-app` — Tenant workspace PWA

**Packages inspected (full source read):**
- `packages/events` — Domain event bus (publisher, subscriber, projections)
- `packages/otp` — Multi-channel OTP delivery (Termii SMS, Meta WhatsApp, 360dialog, Telegram)
- `packages/logging` — Structured JSON logger with PII masking
- `packages/auth` — JWT issuing, verification, auth context
- `packages/auth-tenancy` — Auth tenancy stubs (empty index)
- `packages/entitlements` — CBN KYC tiers, plan-based feature gating
- `packages/payments` — Paystack integration, subscription sync
- `packages/offline-sync` — Dexie.js PWA offline sync + service worker
- `packages/white-label-theming` — Tenant theme tokens, CSS vars, brand config validation
- `packages/superagent` — AI consent, usage metering, credit burn, NDPR
- `packages/negotiation` — Negotiation session lifecycle
- `packages/types` — Shared TypeScript types
- `packages/core`, `packages/entities`, `packages/geography`, `packages/social`, `packages/community`
- `packages/search-indexing`, `packages/relationships`, `packages/profiles`
- All 160+ vertical packages (structure and pattern sampling)

**API routes inspected (full source read):**
`auth-routes`, `billing`, `payments`, `onboarding`, `support`, `analytics`, `superagent`, `templates`, `identity`, `entities`, `claim`, `social`, `community`, `partners`, `negotiation`, `pos`, `sync`, `airtime`, `bank-transfer`, `commerce`, `civic`, `transport`, `discovery`, `geography`, `health`, and all vertical routes

**Middleware inspected:** `audit-log`, `monitoring`, `error-log`, `billing-enforcement`, `auth`, `rate-limit`, `require-role`, `ai-entitlement`, `email-verification`, `entitlement`

**Lib inspected:** `email-service.ts`, `webhook-dispatcher.ts`, `search-index.ts`

**Infrastructure inspected:** 253 D1 migration files (all reviewed for notification-relevant schema), `infra/cloudflare/`, `infra/scripts/`, GitHub Actions workflows

**Docs inspected:** `docs/HANDOVER.md`, `docs/governance/` (all 30+ files), `docs/milestones/`, `docs/plans/`, `docs/governance/platform-invariants.md`, `docs/governance/security-baseline.md`, `docs/governance/entitlement-model.md`

### Confidence Level

**HIGH** across:
- All existing notification assets (email, OTP, webhooks, event bus)
- All missing infrastructure (no notification inbox, no preferences model, no template engine)
- All silent workflow gaps (160+ verticals with zero notification integration)
- Database schema (all 253 migrations reviewed)

**MEDIUM** across:
- Push notification infrastructure (no push package found — absence confirmed, but USSD gateway has partial Telegram wiring)
- Exact vertical domain event semantics (sampled, not exhaustively read line-by-line for all 160+)

**BLIND SPOTS:**
- Exact Cloudflare Queues wiring in production wrangler.toml (not locally available)
- Live provider credentials and their configured limits
- Real-world traffic volumes affecting throttling thresholds

---

## DELIVERABLE 2 — CURRENT-STATE FINDINGS

### 2.1 What Exists Today

#### A. Email Delivery (Resend REST API)
**File:** `apps/api/src/lib/email-service.ts`

A single `EmailService` class wraps the Resend REST API directly (no SDK — Cloudflare Workers compatible). It supports 6 hardcoded templates:

| Template | Trigger |
|---|---|
| `welcome` | New user registration |
| `template-purchase-receipt` | Paid template purchase verified |
| `workspace-invite` | Admin invites member to workspace |
| `payment-confirmation` | Paystack payment verified |
| `password-reset` | Forgot-password flow |
| `email-verification` | Email address verification |

**Critical facts from code:**
- FROM address is hardcoded: `WebWaka <noreply@webwaka.com>` — never tenant-branded
- All HTML is rendered in inline TypeScript functions — no template engine
- No tenant name, logo, color, or domain in any email
- No delivery tracking, no open/click tracking, no bounce handling
- No retry (single attempt; Resend handles its own delivery retries internally)
- No dead-letter handling
- No idempotency key
- Silent skip in dev when `RESEND_API_KEY` not set (returns `dev-skipped`)
- No audit log written after email send
- No preference check before send

#### B. OTP Delivery (@webwaka/otp)
**Package:** `packages/otp/`

Multi-channel OTP with waterfall: SMS (Termii) → WhatsApp (Meta Cloud v18 / 360dialog) → Telegram Bot

**Key facts from code:**
- 6-digit cryptographically secure OTP (rejection-sampling for bias prevention)
- SHA-256 hashed, salt + otp; raw OTP never stored
- Channel rate limiting via KV: SMS/WhatsApp 5/hr, Telegram/Email 3/hr
- Lock after failed attempts (30-min for non-transaction, 60-min for transaction)
- R8: Transaction OTPs must use SMS. WhatsApp/Telegram blocked for `purpose === 'transaction'`
- Nigerian phone validator with carrier detection (MTN, Airtel, Glo, 9mobile)
- `otp_log` table (D1 migration 0015): hash only, with replay-attack prevention index
- Provider selection: WHATSAPP_PROVIDER env var routes to Meta or 360dialog
- Telegram OTP also supported for non-transaction purposes

**What OTP does NOT do:**
- No voice fallback
- No in-app notification fallback
- No per-tenant OTP branding (messages use generic WebWaka text)
- No per-tenant channel preferences
- No delivery confirmation tracked beyond provider API response

#### C. Webhook System (Outbound)
**File:** `apps/api/src/lib/webhook-dispatcher.ts`

HMAC-SHA256 signed outbound webhooks to tenant-registered endpoints.

**4 registered event types:**
- `template.installed`
- `template.purchased`
- `workspace.member_added`
- `payment.completed`

**Key facts from code:**
- `webhook_subscriptions` table (migration 0217): workspace + tenant scoped, JSON events array
- `webhook_deliveries` table (migration 0218): status, attempts, last_error, delivered_at
- Retry: 3 attempts, exponential backoff (5s, 25s, 125s)
- **Critical issue:** Retry is inline and blocking in the request handler. Production note in code says this should be Cloudflare Queues but is not yet implemented
- Signing header: `X-WebWaka-Signature: sha256=<hex>`
- Wildcard subscription via `*` event type supported
- Delivery ID: UUID stored in `X-WebWaka-Delivery-Id` header

**What webhook system does NOT do:**
- No Cloudflare Queues backing (inline retry blocks responses)
- Only 4 event types — 160+ vertical business events not wired
- No webhook health dashboard
- No dead-letter inspection
- No replay/reprocess capability
- No webhook subscription validation (no URL ping check)
- Only outbound — no inbound webhook normalization pipeline

#### D. Domain Event Bus (@webwaka/events)
**Package:** `packages/events/`

In-process domain event bus with D1-persisted event log.

**16 event types defined:**
`entity.created`, `entity.updated`, `claim.intent_captured`, `claim.advanced`, `claim.approved`, `claim.rejected`, `payment.initialized`, `payment.success`, `payment.failed`, `workspace.activated`, `workspace.invite_sent`, `search.indexed`, `search.deindexed`, `profile.viewed`

**Key facts from code:**
- Publisher: appends to `event_log` D1 table with optimistic versioning
- Subscriber: in-memory registry (Map), cleared on Worker restart/cold start
- Fan-out supported (multiple handlers per event type)
- Handler errors caught and logged — dispatch never aborts
- `event_log` table (migration 0012): aggregate, aggregate_id, event_type, tenant_id, payload, version, created_at

**Critical gaps:**
- **Zero notification handlers wired to any event type** — the event bus exists but nothing subscribes for notification purposes
- In-memory subscriber registry lost on every Worker restart (Cloudflare Workers are stateless)
- No durable Cloudflare Queues consumer yet (noted as M7+ in code comments)
- No notification events in the catalog (claim, payment, workspace events exist but don't produce notifications)

#### E. Monitoring Alert (Single Webhook)
**File:** `apps/api/src/middleware/monitoring.ts`

- Error rate threshold: 50 errors/minute → fires to `ALERT_WEBHOOK_URL`
- In-memory counters (lost on Worker restart — not durable)
- Latency threshold: 5000ms → console.warn only, no alert
- Alert cooldown: 60s
- Single generic JSON payload — not formatted for Slack/Teams/PagerDuty

#### F. Audit Logging
**File:** `apps/api/src/middleware/audit-log.ts`  
**Migration:** `0193_sec004_audit_logs.sql`

HTTP-level audit log written after every authenticated request. Fields: tenant_id, user_id, action, method, path, resource_type, resource_id, ip_masked, status_code, duration_ms. KV fallback on D1 failure.

**What audit logging does NOT cover:**
- Email send attempts and outcomes
- OTP send attempts and outcomes
- Notification preference changes
- Webhook delivery outcomes (tracked separately in webhook_deliveries)
- Business-event-driven notifications

#### G. Template Registry (Business Templates — Not Notification Templates)
**Migrations:** 0206, 0207, 0211, 0215, 0224, 0226a, 0227

This is the WebWaka marketplace template registry for business workflow templates — not a notification template system. These are separate concerns. The notification template system does not exist.

#### H. White-Label Theming (@webwaka/white-label-theming)
Brand tokens (colors, logo, favicon, font, border radius, custom domain) stored per workspace. CSS var generation. KV caching (300s TTL).

**Critical gap:** This brand profile is NEVER applied to email templates. All emails use hardcoded `WebWaka` branding regardless of tenant theme.

---

### 2.2 What Partially Exists

| Capability | State |
|---|---|
| Email delivery | Exists but no tenant branding, no tracking, no preferences, no template versioning |
| OTP delivery | Good multi-channel implementation but no per-tenant customization, no voice fallback |
| Webhook outbound | Works but inline-blocking retry, only 4 event types, no Queues backing |
| Domain event bus | Schema and publisher exist; in-memory subscriber lost on restart; zero notification handlers |
| Monitoring alert | Single webhook alert; no Slack/Teams formatting; in-memory state only |
| Audit logging | HTTP level only; no notification-specific audit trail |
| Brand/theme system | Token system exists; NOT applied to outbound communications |

### 2.3 What Is Duplicated or Inconsistent

1. **Email send logic is duplicated across route files.** `auth-routes.ts` calls `new EmailService(c.env.RESEND_API_KEY)` inline on multiple endpoints (forgot-password, send-verification, invite). If this pattern continues into billing and other routes, there will be multiple independent instantiation points with no shared policy.

2. **FROM address is hardcoded in two places:** `EmailService` constant and the OTP templates — no central sender configuration.

3. **No shared event contract for auth lifecycle events.** Auth routes (`auth-routes.ts`) do not call `publishEvent()` from `@webwaka/events` for user registration, password reset, email verification, or session events. The event bus and auth are completely disconnected.

4. **OTP delivery and email delivery are separate codepaths** with separate rate-limiting, separate logging, separate retry, and no unified notification pipeline. Both are direct-call implementations — not event-driven.

5. **Support ticket creation sends no notifications** (code confirmed). The FSM transitions (status changes) also send no notifications. These are independent direct-to-DB operations.

6. **Negotiation expiry job** writes audit entries but sends no notifications to affected parties.

### 2.4 What Is Absent

**Completely absent — zero code exists:**
- Notification inbox (in-app notification center)
- Notification preferences model (any scope: global, tenant, role, user, channel)
- Notification event catalog table (separate from domain event_log)
- Notification rule engine (audience resolution, policy evaluation)
- Notification template system (multi-channel, tenant-aware)
- Notification delivery table (not the same as webhook_deliveries)
- Notification digest/batching engine
- Push notification infrastructure (web push or mobile push)
- Slack/Teams notification channels
- Dead-letter queue inspection tooling
- Notification replay/reprocessing
- Escalation policies
- Quiet hours / do-not-disturb
- Notification scheduling
- Consent management for marketing vs transactional
- Notification correlation with business transactions
- Notification analytics
- Admin UI for notifications
- Per-tenant sender identity / per-tenant email provider credentials
- Template versioning for notification templates
- Template preview and test-send capability

---

## DELIVERABLE 3 — CANONICAL NOTIFICATION EVENT CATALOG

This catalog defines the normalized master set of notification events for the WebWaka platform. Status column: `EXISTS` (code emits this), `PARTIAL` (partially implemented), `MISSING` (not implemented at all).

Legend for Default Channels: E=Email, S=SMS, W=WhatsApp, T=Telegram, P=Push, I=In-App, K=Webhook

---

### Domain: auth.identity

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `auth.user.registered` | POST /auth/register | system | user | user | E, I | info | RT | NDPR | auth.welcome | PARTIAL (email exists, no event emitted) |
| `auth.user.email_verification_sent` | POST /auth/send-verification | user | user | user | E | info | RT | NDPR | auth.verify_email | PARTIAL (email exists, no event, no audit) |
| `auth.user.email_verified` | GET /auth/verify-email | user | user | user | E, I | info | RT | NDPR | auth.email_verified | MISSING |
| `auth.user.password_reset_requested` | POST /auth/forgot-password | user | user | user | E | high | RT | NDPR, Security | auth.password_reset | PARTIAL (email exists, no event) |
| `auth.user.password_reset_completed` | POST /auth/reset-password | user | user | user | E, I | high | RT | NDPR, Security | auth.password_changed | MISSING |
| `auth.user.password_changed` | POST /auth/change-password | user | user | user | E, I | high | RT | Security | auth.password_changed | MISSING |
| `auth.user.login_success` | POST /auth/login | user | user | user | I | info | Digest | Security | auth.login | MISSING |
| `auth.user.login_failed` | POST /auth/login | system | user | admin | I | warn | Digest | Security | auth.security_alert | MISSING |
| `auth.user.account_locked` | OTP lock / auth system | system | user | user, admin | E, S, I | critical | RT | Security | auth.account_locked | MISSING |
| `auth.user.profile_updated` | PATCH /auth/profile | user | user | user | I | info | Digest | NDPR | auth.profile_update | MISSING |
| `auth.user.data_erased` | DELETE /auth/me | user | user | user, admin | E, I | high | RT | NDPR Art.3.1(9) | auth.data_erasure | MISSING |
| `auth.session.revoked` | DELETE /auth/sessions | user | session | user | I | warn | RT | Security | auth.session_revoked | MISSING |
| `auth.session.all_revoked` | DELETE /auth/sessions | user | user | user | E, I | warn | RT | Security | auth.session_revoked | MISSING |

---

### Domain: workspace.membership

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `workspace.created` | POST /auth/register | user | workspace | user, super_admin | E, I | info | RT | — | workspace.created | PARTIAL (email exists via welcome, no event) |
| `workspace.invite_sent` | POST /auth/invite | admin | user | invitee | E | info | RT | — | workspace.invite | PARTIAL (email exists, event type catalogued but not fired) |
| `workspace.invite_accepted` | POST /auth/accept-invite | user | workspace | admin | E, I | info | RT | — | workspace.member_joined | MISSING |
| `workspace.invite_expired` | Cron / system | system | invite | admin | I | warn | Digest | — | workspace.invite_expired | MISSING |
| `workspace.member_added` | webhook event fired | admin | user | new_member, admin | E, I, K | info | RT | — | workspace.member_joined | PARTIAL (webhook fires, no email to new_member) |
| `workspace.member_removed` | admin action | admin | user | removed_user | E, I | warn | RT | — | workspace.member_removed | MISSING |
| `workspace.member_role_changed` | admin action | admin | user | affected_user | E, I | info | RT | — | workspace.role_changed | MISSING |
| `workspace.branding_updated` | admin action | admin | workspace | admin | I | info | Digest | — | workspace.branding | MISSING |
| `workspace.activated` | payment verified | system | workspace | admin | E, I | info | RT | — | workspace.activated | PARTIAL (event catalogued, no notification handler) |
| `workspace.suspended` | billing enforcement | system | workspace | admin | E, S, I | critical | RT | — | workspace.suspended | MISSING |
| `workspace.deprovisioned` | admin action | admin | workspace | admin | E, I | critical | RT | NDPR | workspace.deprovisioned | MISSING |

---

### Domain: billing.subscription

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `billing.payment.initialized` | POST /workspaces/:id/upgrade | user | payment | user | I | info | RT | — | billing.payment_started | PARTIAL (event catalogued, no notification) |
| `billing.payment.completed` | POST /payments/verify | system/Paystack | payment | user | E, I, K | high | RT | Tax | billing.payment_confirmed | PARTIAL (email exists, webhook fires, no in-app) |
| `billing.payment.failed` | POST /payments/verify | system/Paystack | payment | user | E, S, I | critical | RT | Tax | billing.payment_failed | PARTIAL (DB recorded, no notification) |
| `billing.subscription.plan_changed` | POST /billing/change-plan | admin | subscription | admin | E, I | info | RT | — | billing.plan_changed | MISSING (history recorded, no notification) |
| `billing.subscription.cancelled` | POST /billing/cancel | admin | subscription | admin | E, I | warn | RT | — | billing.subscription_cancelled | MISSING |
| `billing.subscription.cancel_reverted` | POST /billing/revert-cancel | admin | subscription | admin | E, I | info | RT | — | billing.cancel_reverted | MISSING |
| `billing.subscription.entering_grace` | /billing/enforce cron | system | subscription | admin | E, S, I | critical | RT | — | billing.grace_period | MISSING |
| `billing.subscription.suspended` | /billing/enforce cron | system | subscription | admin | E, S, I | critical | RT | — | billing.suspended | MISSING |
| `billing.subscription.reactivated` | POST /billing/reactivate | admin | subscription | admin | E, I | info | RT | — | billing.reactivated | MISSING |
| `billing.subscription.expiring_soon` | Scheduled job | system | subscription | admin | E, I | warn | RT | — | billing.expiry_warning | MISSING |
| `billing.quota.approaching_limit` | Usage check | system | quota | admin | E, I | warn | Digest | — | billing.quota_warning | MISSING |
| `billing.quota.limit_reached` | Usage check | system | quota | admin, user | E, S, I | critical | RT | — | billing.quota_reached | MISSING |

---

### Domain: kyc.identity

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `kyc.otp.sent` | POST /identity/otp | system | user | user | S, W, T | info | RT | NDPR, CBN | otp.delivery | PARTIAL (sent, not unified) |
| `kyc.otp.verified` | POST /identity/verify-otp | user | user | user | I | info | RT | CBN | kyc.verified | MISSING |
| `kyc.tier.upgraded` | KYC verification | system | user | user | E, I | info | RT | CBN NRBVR | kyc.tier_change | MISSING |
| `kyc.bvn.verified` | Prembly verification | system | user | user | E, I | info | RT | CBN, NDPR | kyc.bvn_verified | MISSING |
| `kyc.nin.verified` | Prembly verification | system | user | user | E, I | info | RT | CBN, NDPR | kyc.nin_verified | MISSING |
| `kyc.limit.blocked` | Transaction attempt | system | user | user | I, S | warn | RT | CBN | kyc.limit_blocked | MISSING |

---

### Domain: claim.profile

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `claim.intent_captured` | Claim route | user | claim | user, admin | I | info | RT | — | claim.intent | PARTIAL (event exists, no notification handler) |
| `claim.advanced` | Claim route | admin | claim | user | E, I | info | RT | — | claim.advanced | PARTIAL (event exists, no notification handler) |
| `claim.approved` | Claim route | admin | claim | user | E, I | high | RT | — | claim.approved | PARTIAL (event exists, no notification handler) |
| `claim.rejected` | Claim route | admin | claim | user | E, I | high | RT | — | claim.rejected | PARTIAL (event exists, no notification handler) |
| `claim.evidence_requested` | Admin | admin | user | user | E, I | warn | RT | — | claim.evidence_request | MISSING |

---

### Domain: negotiation

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `negotiation.session.created` | Negotiation route | user | session | counterparty | I, S | info | RT | — | negotiation.created | MISSING |
| `negotiation.session.offer_updated` | Negotiation route | user | session | counterparty | I, S | info | RT | — | negotiation.offer | MISSING |
| `negotiation.session.accepted` | Negotiation route | user | session | both_parties | E, I, S | high | RT | — | negotiation.accepted | MISSING |
| `negotiation.session.rejected` | Negotiation route | user | session | initiator | I, S | warn | RT | — | negotiation.rejected | MISSING |
| `negotiation.session.expired` | Cron job | system | session | both_parties | I, S | warn | RT | — | negotiation.expired | MISSING (cron writes audit only) |
| `negotiation.session.cancelled` | Cron/admin | system | session | both_parties | I, S | warn | RT | — | negotiation.cancelled | MISSING |
| `negotiation.payment.timeout` | Cron job | system | session | initiator | E, S, I | high | RT | — | negotiation.payment_timeout | MISSING |

---

### Domain: support

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `support.ticket.created` | POST /support/tickets | user | ticket | admin, super_admin | E, I | info | RT | — | support.ticket_created | MISSING |
| `support.ticket.status_changed` | PATCH /support/tickets/:id | admin | ticket | ticket_creator | E, I | info | RT | — | support.status_update | MISSING |
| `support.ticket.assigned` | PATCH /support/tickets/:id | admin | ticket | assignee | E, I | info | RT | — | support.assigned | MISSING |
| `support.ticket.resolved` | PATCH /support/tickets/:id | admin | ticket | ticket_creator | E, I | info | RT | — | support.resolved | MISSING |
| `support.ticket.comment_added` | Support route | user/admin | comment | other_parties | I | info | Digest | — | support.comment | MISSING |

---

### Domain: templates.marketplace

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `template.published` | POST /templates (super_admin) | super_admin | template | all_tenants | I | info | Digest | — | marketplace.published | MISSING |
| `template.installed` | POST /templates/:slug/install | user | install | admin, K | I, K | info | RT | — | marketplace.installed | PARTIAL (webhook fires, no in-app) |
| `template.purchased` | POST /templates/:slug/purchase/verify | user | purchase | user, K | E, K | info | RT | Tax | marketplace.purchased | PARTIAL (receipt email, webhook fires) |
| `template.install_rolled_back` | DELETE /templates/:slug/install | admin | install | admin | I | warn | RT | — | marketplace.rollback | MISSING |
| `template.update_available` | Version check | system | template | installing_tenants | I | info | Digest | — | marketplace.update | MISSING |

---

### Domain: ai.superagent

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `ai.consent.granted` | POST /superagent/consent | user | consent | user | I | info | RT | NDPR P10 | ai.consent | MISSING |
| `ai.consent.revoked` | DELETE /superagent/consent | user | consent | user | E, I | info | RT | NDPR P10 | ai.consent_revoked | MISSING |
| `ai.credit.exhausted` | POST /superagent/chat (burn fails) | system | wallet | user, admin | E, I | critical | RT | — | ai.credit_exhausted | MISSING |
| `ai.credit.low` | Usage threshold | system | wallet | admin | E, I | warn | RT | — | ai.credit_low | MISSING |
| `ai.request.hitl_escalated` | HITL service | system | request | admin | E, I | high | RT | — | ai.hitl | MISSING |
| `ai.recommendation.generated` | SuperAgent chat | system | recommendation | user | I | info | Digest | NDPR | ai.recommendation | MISSING |
| `ai.provider.failover` | resolveAdapter | system | provider | super_admin | I | warn | RT | — | ai.provider_alert | MISSING |

---

### Domain: onboarding

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `onboarding.step.completed` | PUT /onboarding/:id/:step | user | workspace | admin | I | info | Digest | — | onboarding.progress | MISSING |
| `onboarding.checklist.completed` | Last step completed | user | workspace | admin | E, I | info | RT | — | onboarding.complete | MISSING |
| `onboarding.step.stalled` | Scheduled job | system | workspace | admin | E, I | warn | Digest | — | onboarding.nudge | MISSING |

---

### Domain: system.infrastructure

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `system.error_rate.spike` | monitoring middleware | system | api | super_admin | K (ALERT_WEBHOOK_URL) | critical | RT | — | system.alert | PARTIAL (webhook fires, generic payload) |
| `system.latency.degraded` | monitoring middleware | system | api | super_admin | I | warn | RT | — | system.alert | MISSING (console.warn only) |
| `system.migration.applied` | CI/CD | system | database | super_admin | I | info | Digest | — | system.infra | MISSING |
| `system.provider.down` | Health check | system | provider | super_admin | E, K | critical | RT | — | system.provider_alert | MISSING |

---

### Domain: vertical.commerce (representative — applies to all 160+ verticals)

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `vertical.order.created` | Order route | user | order | merchant, customer | E, S, I | info | RT | — | vertical.order | MISSING (all verticals) |
| `vertical.order.status_changed` | Order route | system | order | customer | E, S, I | info | RT | — | vertical.order_status | MISSING (all verticals) |
| `vertical.appointment.booked` | Appointment route | user | appointment | provider, customer | E, S, I | info | RT | — | vertical.appointment | MISSING (all verticals) |
| `vertical.appointment.reminder` | Scheduled job | system | appointment | customer | S, W, I | info | RT | — | vertical.reminder | MISSING (all verticals) |
| `vertical.payment.received` | POS / payment route | user | payment | merchant | E, I | info | RT | Tax | vertical.payment | MISSING (all verticals) |
| `vertical.stock.low` | Inventory check | system | product | merchant | E, I | warn | Digest | — | vertical.stock | MISSING (all verticals) |
| `vertical.delivery.dispatched` | Logistics route | user | delivery | customer | S, W, I | info | RT | — | vertical.delivery | MISSING (all verticals) |
| `vertical.delivery.arrived` | Logistics route | system | delivery | customer | S, W, I | info | RT | — | vertical.delivery | MISSING (all verticals) |

---

### Domain: pos.finance

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `pos.transaction.completed` | POS routes | user | transaction | user | I, S | info | RT | Tax | pos.receipt | MISSING |
| `pos.float.low` | Float ledger check | system | float | manager | I, S | warn | RT | — | pos.float_alert | MISSING |
| `pos.reconciliation.ready` | Reconciliation route | system | batch | manager | E, I | info | Digest | Tax | pos.reconciliation | MISSING |
| `pos.transaction.failed` | POS routes | system | transaction | user | I, S | warn | RT | — | pos.failed | MISSING |

---

### Domain: social.community

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `social.post.liked` | Social routes | user | post | post_author | I | info | Digest | — | social.engagement | MISSING |
| `social.post.commented` | Social routes | user | comment | post_author | I | info | Digest | — | social.engagement | MISSING |
| `social.profile.followed` | Social routes | user | profile | target_user | I | info | Digest | — | social.follow | MISSING |
| `community.member.joined` | Community routes | user | community | community_admin | I | info | Digest | — | community.member | MISSING |
| `community.post.created` | Community routes | user | post | members | I | info | Digest | — | community.post | MISSING |

---

### Domain: governance.compliance

| Event Key | Trigger Source | Actor | Subject | Audience | Default Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `governance.audit.exported` | Admin action | admin | audit_log | super_admin | E, I | info | RT | NDPR | governance.audit | MISSING |
| `governance.data_breach.suspected` | Security system | system | users | super_admin, legal | E, K | critical | RT | NDPR Art.2.6 | governance.breach | MISSING |
| `governance.consent.updated` | User action | user | consent | user, admin | E, I | info | RT | NDPR | governance.consent | MISSING |
| `governance.retention.expiring` | Scheduled job | system | data | admin | I | warn | Digest | NDPR | governance.retention | MISSING |

---

## DELIVERABLE 4 — MISSING ELEMENTS LIST

### 4.1 Architecture Layer Gaps

| Missing Layer | Description | Severity |
|---|---|---|
| Reliable event capture (Outbox pattern) | No transactional outbox. Domain events published after D1 writes but before commit acknowledgement could be lost on failure. Dual-write risk is present for payment and claim flows. | Critical |
| Durable event transport | `@webwaka/events` subscriber is in-memory only. Cloudflare Queues are mentioned in code comments as future work but not implemented. No durable pub/sub. | Critical |
| Notification rule engine | No policy/rule evaluation layer. No audience resolution. No conditional routing logic. | Critical |
| Preference resolution pipeline | Zero preference model. No way for users, roles, tenants, or platform to configure which channels deliver which events. | Critical |
| Tenant + brand context in delivery | Email sender FROM address is hardcoded. Brand tokens exist in `@webwaka/white-label-theming` but are never applied to outbound communications. | Critical |
| Dead-letter queue | No dead-letter for failed email, OTP, or webhook deliveries. | High |
| Idempotency at notification level | OTP has KV-based throttle. Emails have no idempotency key — duplicate sends possible on retry. | High |
| Notification inbox persistence | No `notification_inbox` D1 table or service. No in-app notification center. | High |
| Digest/batching engine | No batching, window management, or digest grouping of any kind. | High |
| Escalation policy engine | No escalation, no SLA timers, no supervisor escalation. | Medium |
| Fallback channel ordering | OTP has fallback waterfall. Email has none. No unified fallback policy across channels. | Medium |
| Quiet hours / DND | No timezone-aware do-not-disturb. Africa-first platform without quiet hours is a compliance risk and UX failure. | Medium |
| Notification scheduling | No deferred delivery, no time-windowed sends. | Medium |

### 4.2 Product/Feature Gaps

| Missing Feature | Description |
|---|---|
| In-app notification center | No notification_inbox table, no UI surface, no read/unread/archived state |
| Notification preferences UI | No way for users or tenants to manage channel preferences |
| Template editor | No tenant-facing template customization |
| Delivery status tracking | Open, click, bounce, unsubscribe not tracked |
| Notification history / search | No queryable notification log per user |
| Push notifications | No web push (service worker support exists in PWA) and no mobile push |
| Digest emails | No daily/weekly digest capability |
| Vertical business event notifications | 160+ verticals produce zero notifications |
| Billing lifecycle notifications | Plan changes, cancellations, grace periods fire no alerts |
| Support ticket notifications | Ticket creation, status changes trigger no notifications |
| Onboarding nudges | Stalled onboarding steps trigger no reminders |
| Negotiation notifications | Session creation, offers, expiry produce no notifications to parties |
| AI system alerts | Credit exhaustion, HITL escalation, provider failover are silent |
| Marketing/engagement notifications | No campaign capability whatsoever |

### 4.3 Data Model Gaps

The following tables have zero schema in any of the 253 migration files:

- `notification_events` — normalized event record
- `notification_inbox` — per-user in-app notifications
- `notification_preferences` — scoped preference store
- `notification_templates` — versioned, multi-channel, tenant-overridable templates
- `notification_deliveries` — delivery lifecycle tracking (queued → sent → delivered → failed)
- `notification_rules` — event→audience→channel routing rules
- `notification_digest_batches` — batch grouping for digest sends
- `notification_audit_log` — send audit trail (separate from HTTP audit log)
- `notification_subscriptions` — user-controlled topic subscriptions
- `escalation_policies` — escalation rules and SLA timers
- `channel_providers` — abstracted provider configuration per channel
- `provider_credentials` — per-tenant provider overrides
- `push_tokens` — web/mobile push token registry

### 4.4 Governance and Compliance Gaps

| Gap | Description |
|---|---|
| Consent gating for marketing | No distinction between transactional and marketing messages. NDPR requires explicit consent for marketing. |
| Email unsubscribe handling | No List-Unsubscribe header, no unsubscribe endpoint, no suppression list |
| Data residency for notifications | Notification content may contain personal data — no retention/deletion policy |
| Audit trail for notification sends | No record of who was notified of what, when, and via which channel |
| Audit trail for preference changes | No record of preference changes (required for NDPR accountability) |
| Suppression list management | No global or tenant-level suppression list for bounced/unsubscribed addresses |
| NDPR data subject access for notifications | Cannot currently answer "what notifications did we send this user?" |
| Template accessibility | Email templates have no aria labels, no plain-text version alongside HTML |

### 4.5 Observability and Operations Gaps

| Gap | Description |
|---|---|
| Delivery metrics | No metrics on send volume, delivery rate, bounce rate, open rate |
| Provider health monitoring | No per-channel provider health dashboard |
| Dead-letter inspection | No tooling to inspect or replay failed notifications |
| Notification trace IDs | No correlation_id linking business transaction → notification → delivery |
| Alert fatigue controls | No notification deduplication, no cooldown per recipient |
| Test/sandbox mode | No sandbox mode for notification delivery in staging environments |
| Template preview | No way to preview rendered templates before sending |
| A/B testing | No variant testing capability |

### 4.6 Testing Gaps

| Gap | Description |
|---|---|
| Email delivery tests | `email-service.test.ts` has some coverage but no template rendering tests |
| End-to-end notification tests | No Playwright tests covering any notification flow |
| Preference model tests | Cannot test — model doesn't exist |
| Inbox state tests | Cannot test — inbox doesn't exist |
| Multi-tenant isolation tests | No test verifying cross-tenant notification isolation |
| Digest generation tests | Cannot test — digest engine doesn't exist |

---

## DELIVERABLE 5 — CANONICAL DOMAIN MODEL

### Core Entities

---

#### `notification_event`
**Purpose:** Normalized record of a business event that may trigger notifications. Bridges domain events and notification processing.

```
id                  TEXT PRIMARY KEY          -- notif_evt_<uuid>
event_key           TEXT NOT NULL             -- e.g. 'auth.user.registered'
domain              TEXT NOT NULL             -- e.g. 'auth', 'billing', 'vertical'
aggregate_type      TEXT NOT NULL             -- e.g. 'user', 'workspace', 'subscription'
aggregate_id        TEXT NOT NULL             -- the affected entity ID
tenant_id           TEXT NOT NULL             -- T3: always present
actor_type          TEXT NOT NULL             -- 'user' | 'system' | 'admin'
actor_id            TEXT                      -- nullable for system-sourced events
subject_type        TEXT                      -- what the notification is about
subject_id          TEXT                      -- subject entity ID
payload             TEXT NOT NULL             -- JSON: event-specific context variables
correlation_id      TEXT                      -- links to originating business transaction
severity            TEXT NOT NULL DEFAULT 'info' -- 'info'|'warn'|'high'|'critical'
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
processed_at        INTEGER                   -- when rule engine processed it
```

**Tenant scoping:** tenant_id required on all queries.  
**Indexes:** (tenant_id, event_key), (aggregate_type, aggregate_id), (created_at), (processed_at)

---

#### `notification_rule`
**Purpose:** Defines the routing logic from an event type to an audience, channel set, and template.

```
id                  TEXT PRIMARY KEY          -- rule_<uuid>
tenant_id           TEXT                      -- NULL = platform default; otherwise tenant override
event_key           TEXT NOT NULL             -- which event this rule applies to
rule_name           TEXT NOT NULL
enabled             INTEGER NOT NULL DEFAULT 1
audience_type       TEXT NOT NULL             -- 'actor'|'subject'|'workspace_admins'|'tenant_admins'|'all_members'|'super_admins'|'custom'
audience_filter     TEXT                      -- JSON: additional filter conditions
channels            TEXT NOT NULL             -- JSON array: ['email','sms','push','in_app']
channel_fallback     TEXT                     -- JSON ordered array of fallback channels
template_family     TEXT NOT NULL             -- e.g. 'auth.welcome'
priority            TEXT NOT NULL DEFAULT 'normal' -- 'low'|'normal'|'high'|'critical'
digest_eligible     INTEGER NOT NULL DEFAULT 0 -- can this be batched into a digest?
min_severity        TEXT NOT NULL DEFAULT 'info'
feature_flag        TEXT                      -- gate on platform feature flag
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

**Tenant scoping:** NULL tenant_id = platform default (inherited by all tenants); tenant-specific rules take precedence.  
**Indexes:** (tenant_id, event_key, enabled), (tenant_id)

---

#### `notification_preference`
**Purpose:** Per-scope (platform → tenant → role → user) preference overrides.

```
id                  TEXT PRIMARY KEY          -- pref_<uuid>
scope_type          TEXT NOT NULL             -- 'platform'|'tenant'|'role'|'user'
scope_id            TEXT NOT NULL             -- platform_id|tenant_id|role_name|user_id
tenant_id           TEXT NOT NULL             -- T3: always present for role/user scopes
event_key           TEXT NOT NULL             -- '*' for all-events catch-all
channel             TEXT NOT NULL             -- 'email'|'sms'|'push'|'in_app'|'*'
enabled             INTEGER NOT NULL DEFAULT 1
quiet_hours_start   INTEGER                   -- 0-23 (local hour)
quiet_hours_end     INTEGER                   -- 0-23
timezone            TEXT DEFAULT 'Africa/Lagos'
digest_window       TEXT                      -- 'none'|'hourly'|'daily'|'weekly'
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

**Inheritance:** platform → tenant → role → user. More specific scope wins.  
**Tenant scoping:** tenant_id required for role/user scopes.  
**Indexes:** (scope_type, scope_id, event_key, channel), (tenant_id, scope_type)

---

#### `notification_template`
**Purpose:** Versioned, multi-channel, tenant-overridable notification template.

```
id                  TEXT PRIMARY KEY          -- tpl_notif_<uuid>
tenant_id           TEXT                      -- NULL = platform default; tenant_id = override
template_family     TEXT NOT NULL             -- e.g. 'auth.welcome'
channel             TEXT NOT NULL             -- 'email'|'sms'|'whatsapp'|'push'|'in_app'
locale              TEXT NOT NULL DEFAULT 'en-NG'
version             INTEGER NOT NULL DEFAULT 1
status              TEXT NOT NULL DEFAULT 'draft' -- 'draft'|'active'|'deprecated'
subject_template    TEXT                      -- email/push: handlebars-style subject
body_template       TEXT NOT NULL             -- channel-appropriate body
preheader_template  TEXT                      -- email only
cta_label           TEXT                      -- call-to-action button label
cta_url_template    TEXT                      -- deep link or action URL
variables_schema    TEXT NOT NULL             -- JSON schema for required variables
created_by          TEXT                      -- user_id who created/approved
published_at        INTEGER                   -- when made active
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

**Inheritance:** tenant template takes precedence over platform template for same family+channel+locale.  
**Indexes:** (tenant_id, template_family, channel, locale, status), UNIQUE(tenant_id, template_family, channel, locale, version)

---

#### `notification_delivery`
**Purpose:** Tracks the full lifecycle of every notification delivery attempt.

```
id                  TEXT PRIMARY KEY          -- delivery_<uuid>
notification_event_id TEXT NOT NULL           -- FK to notification_event
tenant_id           TEXT NOT NULL             -- T3
recipient_id        TEXT NOT NULL             -- user_id
recipient_type      TEXT NOT NULL             -- 'user'|'admin'|'system'
channel             TEXT NOT NULL
provider            TEXT NOT NULL             -- 'resend'|'termii'|'meta_wa'|'360dialog'|'telegram'|'fcm'|'apns'|'internal'
template_id         TEXT NOT NULL
status              TEXT NOT NULL DEFAULT 'queued'
  -- 'queued'|'rendering'|'dispatched'|'delivered'|'opened'|'clicked'|'failed'|'suppressed'|'dead_lettered'
provider_message_id TEXT                      -- provider's returned message ID
attempts            INTEGER NOT NULL DEFAULT 0
last_error          TEXT
queued_at           INTEGER NOT NULL DEFAULT (unixepoch())
dispatched_at       INTEGER
delivered_at        INTEGER
opened_at           INTEGER
clicked_at          INTEGER
failed_at           INTEGER
idempotency_key     TEXT UNIQUE               -- prevents duplicate sends
correlation_id      TEXT                      -- trace to originating transaction
```

**Indexes:** (tenant_id, recipient_id, channel), (tenant_id, status), (idempotency_key), (notification_event_id), (created_at)

---

#### `notification_inbox_item`
**Purpose:** In-app notification center items per user.

```
id                  TEXT PRIMARY KEY          -- inbox_<uuid>
tenant_id           TEXT NOT NULL             -- T3
user_id             TEXT NOT NULL
notification_event_id TEXT NOT NULL
title               TEXT NOT NULL
body                TEXT NOT NULL
cta_url             TEXT
icon_type           TEXT DEFAULT 'info'       -- 'info'|'warn'|'success'|'error'
category            TEXT                      -- e.g. 'billing','auth','workspace','vertical'
read_at             INTEGER
archived_at         INTEGER
pinned_at           INTEGER
dismissed_at        INTEGER
snoozed_until       INTEGER
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
expires_at          INTEGER
```

**Indexes:** (tenant_id, user_id, read_at), (tenant_id, user_id, created_at DESC), (tenant_id, user_id, archived_at)

---

#### `notification_digest_batch`
**Purpose:** Groups multiple notification events for digest delivery.

```
id                  TEXT PRIMARY KEY          -- digest_<uuid>
tenant_id           TEXT NOT NULL
recipient_id        TEXT NOT NULL
channel             TEXT NOT NULL
digest_window       TEXT NOT NULL             -- 'hourly'|'daily'|'weekly'
window_start        INTEGER NOT NULL
window_end          INTEGER NOT NULL
event_ids           TEXT NOT NULL             -- JSON array of notification_event ids
status              TEXT NOT NULL DEFAULT 'pending' -- 'pending'|'sent'|'failed'
sent_at             INTEGER
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

---

#### `notification_audit_log`
**Purpose:** Immutable audit trail of all notification sends and preference changes.

```
id                  TEXT PRIMARY KEY          -- naudит_<uuid>
tenant_id           TEXT NOT NULL
event_type          TEXT NOT NULL             -- 'notification.sent'|'notification.failed'|'preference.changed'|'unsubscribe'
actor_id            TEXT                      -- user_id or 'system'
recipient_id        TEXT
channel             TEXT
notification_event_id TEXT
delivery_id         TEXT
metadata            TEXT                      -- JSON: additional context
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

---

#### `push_token`
**Purpose:** Manages web/mobile push token lifecycle.

```
id                  TEXT PRIMARY KEY          -- ptok_<uuid>
tenant_id           TEXT NOT NULL
user_id             TEXT NOT NULL
platform            TEXT NOT NULL             -- 'web'|'ios'|'android'
token               TEXT NOT NULL
provider            TEXT NOT NULL             -- 'fcm'|'apns'|'web_push'
device_id           TEXT
active              INTEGER NOT NULL DEFAULT 1
registered_at       INTEGER NOT NULL DEFAULT (unixepoch())
last_used_at        INTEGER
invalidated_at      INTEGER
invalidation_reason TEXT
```

---

#### `notification_subscription`
**Purpose:** User-controlled topic subscription management (marketing opt-ins).

```
id                  TEXT PRIMARY KEY          -- nsub_<uuid>
tenant_id           TEXT NOT NULL
user_id             TEXT NOT NULL
topic               TEXT NOT NULL             -- e.g. 'product_updates'|'weekly_digest'|'security_alerts'
channel             TEXT NOT NULL
subscribed          INTEGER NOT NULL DEFAULT 1
consent_captured_at INTEGER
consent_ip_hash     TEXT
unsubscribed_at     INTEGER
unsubscribe_reason  TEXT
```

---

#### `escalation_policy`
**Purpose:** Defines escalation rules when a notification goes unacknowledged.

```
id                  TEXT PRIMARY KEY          -- esc_<uuid>
tenant_id           TEXT
event_key           TEXT NOT NULL
rule_name           TEXT NOT NULL
sla_seconds         INTEGER NOT NULL          -- time before escalation triggers
escalate_to_type    TEXT NOT NULL             -- 'role'|'user'|'webhook'
escalate_to_id      TEXT NOT NULL
escalation_channel  TEXT NOT NULL
enabled             INTEGER NOT NULL DEFAULT 1
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

---

#### `channel_provider`
**Purpose:** Abstract channel → provider configuration.

```
id                  TEXT PRIMARY KEY          -- cprov_<uuid>
tenant_id           TEXT                      -- NULL = platform default
channel             TEXT NOT NULL             -- 'email'|'sms'|'whatsapp'|'push'|'slack'|'webhook'
provider_name       TEXT NOT NULL             -- 'resend'|'termii'|'meta_wa'|'360dialog'|'telegram'|'fcm'
enabled             INTEGER NOT NULL DEFAULT 1
priority            INTEGER NOT NULL DEFAULT 1  -- lower = higher priority (for fallback)
config              TEXT NOT NULL             -- JSON: provider-specific non-secret config
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

---

## DELIVERABLE 6 — REFERENCE ARCHITECTURE

### Full Recommended Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DOMAIN LAYER                                                               │
│                                                                             │
│  Domain Action (auth register, payment verified, ticket updated, etc.)      │
│      │                                                                      │
│      ▼                                                                      │
│  Domain Event Published to event_log (D1) via @webwaka/events               │
│  [Outbox Pattern: event written in same D1 transaction as business record]  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  EVENT TRANSPORT LAYER                                                       │
│                                                                             │
│  Cloudflare Queues Consumer (durable; survives Worker restart)              │
│  [Current: in-memory subscribe() — MUST migrate to Queues for production]   │
│                                                                             │
│  Notification Event Normalizer                                              │
│  → Maps domain event payload to notification_event record                  │
│  → Assigns severity, correlation_id, actor, subject, aggregate             │
│  → Writes notification_event to D1                                         │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  RULE EVALUATION LAYER                                                       │
│                                                                             │
│  Rule Engine: loads matching notification_rule(s) for event_key             │
│  → Evaluates enabled, feature_flag, min_severity                           │
│  → Selects channels, template_family                                       │
│  → Evaluates digest_eligible                                                │
│                                                                             │
│  Audience Resolution                                                        │
│  → Resolves audience_type to actual user_id list                           │
│  → Respects tenant scoping (T3)                                            │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  PREFERENCE RESOLUTION LAYER                                                 │
│                                                                             │
│  For each (recipient, channel):                                             │
│  → Load preference inheritance chain:                                      │
│     platform_default → tenant_default → role_default → user_override       │
│  → Apply quiet hours (timezone-aware: Africa/Lagos default)                │
│  → Apply digest window (group or send immediately)                         │
│  → Apply consent gate (marketing vs transactional)                         │
│  → Apply suppression check (bounce/unsubscribe list)                       │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  CONTEXT RESOLUTION LAYER                                                    │
│                                                                             │
│  Tenant Brand Context                                                       │
│  → Load TenantTheme from @webwaka/white-label-theming (KV-cached)          │
│  → primaryColor, logo, displayName, customDomain, senderIdentity           │
│                                                                             │
│  Locale Context                                                             │
│  → Resolve user locale (default: en-NG)                                    │
│  → Select template variant: (template_family, channel, locale)             │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  TEMPLATE RESOLUTION & RENDERING LAYER                                       │
│                                                                             │
│  Template Resolution (inheritance order):                                   │
│  → tenant override → platform default → hardcoded fallback                 │
│                                                                             │
│  Variable Binding                                                           │
│  → Merge event payload + recipient profile + tenant brand context          │
│  → Validate against variables_schema                                       │
│  → Escape/sanitize all user-supplied strings                               │
│                                                                             │
│  Rendering                                                                  │
│  → Channel-appropriate output (HTML email, SMS plain-text, push payload)  │
│  → Apply tenant CSS vars/logo to email wrapper                             │
│  → Inject legal footer / unsubscribe link (email only)                    │
│  → Inject compliance footer if applicable                                  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  DISPATCH LAYER                                                              │
│                                                                             │
│  For each (recipient, channel, rendered_content):                           │
│  → Check idempotency_key (prevent duplicate sends)                         │
│  → Write notification_delivery (status: queued) to D1                     │
│  → Send via channel provider (Resend, Termii, Meta WA, FCM, Telegram)     │
│  → Update delivery status (dispatched → delivered or failed)               │
│  → Record provider_message_id                                              │
│                                                                             │
│  Fallback Channel                                                           │
│  → On provider failure: try next channel in fallback chain                 │
│  → Channel-level rate limiting before dispatch                             │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  INBOX & STATE LAYER                                                         │
│                                                                             │
│  → Write notification_inbox_item for in-app channel                        │
│  → Offline sync compatibility: Dexie.js-backed offline queue               │
│  → State transitions: unread → read → archived / pinned / snoozed          │
│  → WebSocket / SSE push to connected browser sessions (if available)       │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  RETRY / DEAD-LETTER LAYER                                                   │
│                                                                             │
│  → On delivery failure: exponential backoff (Cloudflare Queues delay)      │
│  → Max attempts: 5 (configurable per channel)                              │
│  → After max attempts: mark dead_lettered, write to dead_letter_queue      │
│  → Fallback channel attempt before dead-lettering                          │
│  → Admin tooling: dead-letter inspection, replay, dismiss                  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  AUDIT & OBSERVABILITY LAYER                                                 │
│                                                                             │
│  → Write notification_audit_log entry for every send and preference change │
│  → Structured logs via @webwaka/logging (JSON, Cloudflare Logpush)         │
│  → Metrics: send_volume, delivery_rate, bounce_rate, open_rate             │
│  → Trace correlation: notification → business transaction → delivery       │
│  → Alert on delivery anomalies (bounce rate spike, provider down)          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture Decisions for WebWaka

| Decision | Rationale |
|---|---|
| Cloudflare Queues for durable dispatch | Existing code comments already plan for this. D1 event_log + Queues = reliable outbox. CF Workers native. No external infrastructure. |
| D1 as notification store | Consistent with existing platform choice. Tenant-scoped queries via tenant_id. D1 global replication fits Africa-first latency requirements. |
| KV for preference caching | Hot path cache (preference reads happen on every notification). 5-minute TTL. Fallback to D1 on miss. |
| Resend as primary email provider | Already implemented. No change. Add tenant-specific "from" domains via Resend domain verification. |
| Termii as primary SMS | Already implemented. No change. |
| @webwaka/white-label-theming integration | Brand tokens exist but not applied to comms. Apply existing TenantTheme to email wrapper. |
| Handlebars-style variable substitution | Simple, auditable, no arbitrary code execution. Safe for tenant-edited templates. |
| Priority queue lanes | Critical (billing/security) notifications bypass digest and quiet hours. |

---

## DELIVERABLE 7 — TEMPLATE SYSTEM DESIGN

### Template Hierarchy

```
Platform Default Template
    │
    └── Tenant Override Template (same family + channel + locale)
            │
            └── Rendered Output (with tenant brand context injected)
```

### Template Taxonomy (Naming Convention)

`{domain}.{event_type}.{optional_variant}`

| Family | Channels | Notes |
|---|---|---|
| `auth.welcome` | email, in_app | Registration welcome |
| `auth.verify_email` | email | Email verification |
| `auth.email_verified` | in_app | Confirmation |
| `auth.password_reset` | email | Password reset link |
| `auth.password_changed` | email, in_app | Confirmation |
| `auth.account_locked` | email, sms, in_app | Security alert |
| `auth.login_alert` | email, in_app | New device/location login |
| `auth.data_erasure` | email, in_app | NDPR Right to Erasure |
| `workspace.invite` | email | Member invitation |
| `workspace.member_joined` | email, in_app | New member confirmation |
| `workspace.member_removed` | email, in_app | Removal notification |
| `workspace.role_changed` | in_app | Role update |
| `workspace.suspended` | email, sms, in_app | Critical: workspace suspended |
| `workspace.activated` | email, in_app | Workspace activation |
| `billing.payment_confirmed` | email, in_app | Payment receipt |
| `billing.payment_failed` | email, sms, in_app | Payment failure |
| `billing.plan_changed` | email, in_app | Plan upgrade/downgrade |
| `billing.subscription_cancelled` | email, in_app | Cancellation |
| `billing.grace_period` | email, sms, in_app | Entering grace period |
| `billing.suspended` | email, sms, in_app | Subscription suspended |
| `billing.expiry_warning` | email, in_app | X days until expiry |
| `billing.quota_warning` | email, in_app | Approaching limit |
| `billing.quota_reached` | email, sms, in_app | Limit reached |
| `kyc.tier_upgraded` | email, in_app | KYC tier promotion |
| `kyc.bvn_verified` | in_app | BVN verification success |
| `kyc.nin_verified` | in_app | NIN verification success |
| `kyc.limit_blocked` | in_app, sms | Transaction blocked |
| `claim.intent` | in_app | Claim intent submitted |
| `claim.advanced` | email, in_app | Claim stage advanced |
| `claim.approved` | email, in_app | Claim approved |
| `claim.rejected` | email, in_app | Claim rejected |
| `negotiation.created` | in_app, sms | New negotiation |
| `negotiation.offer` | in_app, sms | Offer updated |
| `negotiation.accepted` | email, in_app, sms | Negotiation accepted |
| `negotiation.expired` | in_app, sms | Negotiation expired |
| `support.ticket_created` | email, in_app | Ticket created (admin) |
| `support.status_update` | email, in_app | Status change (creator) |
| `support.resolved` | email, in_app | Ticket resolved |
| `marketplace.installed` | in_app | Template installed |
| `marketplace.purchased` | email | Purchase receipt |
| `marketplace.update` | in_app | Update available |
| `onboarding.progress` | in_app | Step completed |
| `onboarding.complete` | email, in_app | Checklist complete |
| `onboarding.nudge` | email, in_app | Stalled step reminder |
| `ai.consent` | in_app | AI consent granted |
| `ai.consent_revoked` | email, in_app | AI consent revoked |
| `ai.credit_exhausted` | email, sms, in_app | WakaCU credit exhausted |
| `ai.credit_low` | email, in_app | WakaCU low threshold |
| `ai.hitl` | email, in_app | Human-in-loop escalation |
| `pos.receipt` | in_app, sms | POS transaction receipt |
| `pos.float_alert` | in_app, sms | Float low warning |
| `pos.reconciliation` | email, in_app | Reconciliation ready |
| `system.alert` | webhook (slack, teams) | Infrastructure alert |
| `governance.audit` | email | Audit export ready |
| `governance.breach` | email, webhook | Data breach alert |
| `vertical.*` | email, sms, in_app | Vertical-specific events |

### Channel-Specific Content Constraints

| Channel | Max Length | Rich Content | Link Tracking | Sender Identity |
|---|---|---|---|---|
| Email | Unlimited | Full HTML | Open + Click | Tenant-branded FROM/domain |
| SMS | 160 chars (1 segment) | Plain text only | Shortened URL | Sender ID (alphanumeric) |
| WhatsApp | 1024 chars | Template-only (Meta approval) | None | WhatsApp Business Number |
| Telegram | 4096 chars | Markdown | None | Bot username |
| Push (Web/Mobile) | Title: 50, Body: 200 | Icon, image | Click-through | App identity |
| In-App | Title: 100, Body: 500 | HTML subset | Internal deep link | Platform |

### Email Template Architecture

**Base layout (email wrapper):**
```html
<email-wrapper>
  <header>
    <img src="{{tenant.logoUrl or platform.logoUrl}}" />
    <span>{{tenant.displayName}}</span>
  </header>
  <body style="--primary: {{tenant.primaryColor}}; --font: {{tenant.fontFamily}}">
    {{> content_block}}
  </body>
  <footer>
    {{> legal_footer locale=locale}}
    <a href="{{unsubscribe_url}}">Unsubscribe</a>
    {{#if is_marketing}}<p>{{tenant.address}}</p>{{/if}}
  </footer>
</email-wrapper>
```

**Partials library:**
- `{{> cta_button label=cta_label url=cta_url}}` — branded CTA button
- `{{> data_table rows=rows}}` — transaction data table
- `{{> alert_box type=type}}` — info/warn/error alert callout
- `{{> legal_footer locale=locale}}` — NDPR/regulatory footer text
- `{{> otp_display code=otp_code}}` — OTP display block

### Variable Schema (Safe)

All template variables must be declared in `variables_schema` (JSON Schema format). Variables are categorized:

| Category | Variables | Escaping |
|---|---|---|
| Tenant context | `tenant.displayName`, `tenant.primaryColor`, `tenant.logoUrl`, `tenant.customDomain` | CSS/HTML escape |
| Recipient | `recipient.name`, `recipient.firstName` | HTML escape |
| Event payload | `event.*` keys defined per template family | HTML escape |
| Action URLs | `cta_url`, `unsubscribe_url`, `deep_link` | URL encode + validate HTTPS |
| Platform | `platform.name`, `platform.supportEmail` | Static |

**Sanitization rules:**
- All string substitutions HTML-escaped by default
- URLs validated against allowlist pattern (must be HTTPS, no javascript:)
- No raw HTML injection from tenant-supplied variables
- Tenant template body sandboxed: no `<script>`, no external resource loading
- Platform reviews any tenant custom templates before activation

### Template Versioning and Publishing Workflow

```
Draft → Pending Review → Active → Deprecated
```

1. Author creates template (status: `draft`)
2. Platform super_admin or tenant admin reviews
3. Approved → status: `active`, `published_at` set
4. Test send available in `draft` and `active` status
5. New version creates new row (version N+1 in draft)
6. Previous version marked `deprecated` on new version activation
7. Rollback: re-activate previous version, deprecate current

### Storage Approach

- Template body stored in D1 `notification_templates` table
- Binary assets (logo, favicon) stored in Cloudflare R2 (existing pattern)
- Rendered HTML cached in KV (30s TTL, keyed by template_id + variable_hash)
- Plain-text version generated automatically from HTML for all email templates

---

## DELIVERABLE 8 — REPO-BY-REPO IMPLEMENTATION IMPACT

### 8.1 `packages/notifications` (NEW — create this package)

**Must be created. Central notification infrastructure package.**

**What to add:**
- `NotificationService` class: event intake, rule evaluation, audience resolution, preference resolution, template resolution, dispatch
- `TemplateRenderer`: handlebars-style variable substitution, HTML sanitization, channel-specific rendering
- `ChannelDispatcher`: abstract provider interface + per-channel implementations
- `InboxService`: notification_inbox_item CRUD
- `PreferenceService`: inheritance-chain resolution with KV caching
- `DigestEngine`: batching, window management, digest send scheduling
- `DeadLetterService`: inspection and replay tooling
- All D1 schema types for notification domain
- Shared event type constants extending @webwaka/events

**What must be introduced (contracts):**
- `INotificationChannel` — abstract channel interface
- `ITemplateRenderer` — rendering interface
- `IPreferenceStore` — preference read/write interface
- `NotificationEvent` type — normalized event shape
- `NotificationDeliveryStatus` type

**Dependency order:** BEFORE all app integrations. Depends on: `@webwaka/logging`, `@webwaka/events`, `@webwaka/white-label-theming`, `@webwaka/types`

---

### 8.2 `apps/api`

**What must be changed:**

1. **`lib/email-service.ts`** — Refactor from direct-send to notification pipeline intake. EmailService should become an internal channel implementation behind the channel abstraction. Direct calls in routes should be replaced with `NotificationService.raise(event)`.

2. **`routes/auth-routes.ts`** — Remove inline `new EmailService().sendTransactional()` calls. Replace with `notificationService.raise('auth.user.registered', {...})` etc. Auth lifecycle events must be published to `@webwaka/events`.

3. **`routes/billing.ts`** — Add `notificationService.raise()` calls for every plan change, cancel, reactivate, grace, suspend transition.

4. **`routes/payments.ts`** — Add `notificationService.raise('billing.payment.completed')` and `notificationService.raise('billing.payment.failed')`.

5. **`routes/onboarding.ts`** — Add `notificationService.raise('onboarding.step.completed')` on step completion.

6. **`routes/support.ts`** — Add notifications on ticket creation and status changes.

7. **`routes/superagent.ts`** — Add notifications on AI credit exhaustion, consent changes.

8. **`routes/negotiation.ts`** — Wire notification events for session lifecycle.

9. **`jobs/negotiation-expiry.ts`** — Add `notificationService.raise('negotiation.session.expired')` for affected parties.

10. **`middleware/monitoring.ts`** — Upgrade `ALERT_WEBHOOK_URL` to route through `NotificationService` for Slack/Teams formatted alerts. Add latency degradation alerting.

11. **`lib/webhook-dispatcher.ts`** — Migrate retry to Cloudflare Queues consumer. Expand registered event types.

**What must be added:**
- `/notifications/preferences` routes (GET, PATCH per channel/event)
- `/notifications/inbox` routes (GET list, PATCH read/archive)
- `/notifications/templates` routes (admin: CRUD notification templates)
- `/notifications/deliveries` routes (admin: delivery log)
- `/platform/notifications/dead-letters` (super_admin: dead-letter inspection)

**Migration concerns:**
- All 6 existing email templates must be migrated to `notification_templates` table as platform defaults
- FROM address must become configurable via `channel_providers`
- Existing `webhook_deliveries` tracking can be unified with `notification_deliveries`

**Test requirements:**
- Unit tests for NotificationService raise → rule evaluation → audience resolution
- Integration tests for email pipeline (mock Resend)
- Multi-tenant isolation tests (ensure notifications never cross tenant boundaries)
- Preference inheritance chain tests

---

### 8.3 `packages/events` (@webwaka/events)

**What must be changed:**

1. **Event type catalog** — Expand from 16 to 80+ event types covering all domains identified in Deliverable 3.

2. **Subscriber registry** — Current in-memory Map must be backed by Cloudflare Queues. The `subscribe()` function should register a Queues consumer, not an in-memory callback.

3. **Publisher** — Add correlation_id parameter. Ensure every `publishEvent()` call happens within the same D1 transaction as its originating domain write (outbox pattern).

**What must be added:**
- `NotificationEventTypes` constants (separate from raw domain events)
- Typed event payloads for all 80+ event types
- Queue binding type (for CF Queues integration)

**Dependency order:** Must complete before app integrations.

---

### 8.4 `packages/otp` (@webwaka/otp)

**What must be changed:**

1. OTP message text in Termii, Meta WhatsApp, and Telegram templates must reference `tenantDisplayName` from context, not hardcoded "WebWaka".

2. `sendMultiChannelOTP()` should accept an optional `tenantContext` parameter with brand info.

3. Add `voice` channel as future fallback stub (marked unimplemented but referenced in architecture).

**What must be added:**
- Per-tenant OTP template override capability
- `otp.sent` and `otp.verified` events published to `@webwaka/events`

---

### 8.5 `packages/white-label-theming` (@webwaka/white-label-theming)

**What must be added:**
- `senderEmailAddress` field in `TenantTheme` (for tenant-branded FROM address)
- `senderDisplayName` field
- Export `getTenantSenderIdentity(tenantId, kv, db)` utility for use by email channel provider
- `tenantSupportEmail` field (for use in email footers)
- `tenantAddress` field (for CAN-SPAM/marketing email compliance footer)

---

### 8.6 All 160+ Vertical Packages (`packages/verticals-*`)

**Pattern:** Every vertical package that has business lifecycle operations must emit the corresponding `vertical.*` domain events.

**What must be added per vertical:**
- `vertical.order.created`, `vertical.order.status_changed` for commerce verticals
- `vertical.appointment.booked`, `vertical.appointment.reminder` for service verticals
- `vertical.payment.received` for all payment-accepting verticals
- `vertical.stock.low` for inventory-tracking verticals
- `vertical.delivery.dispatched`, `vertical.delivery.arrived` for logistics verticals

**Approach:** Create a `@webwaka/vertical-events` shared package that defines the canonical `vertical.*` event types and typed payloads. Each vertical package imports this and emits appropriate events.

**Dependency order:** After `packages/notifications` and expanded `packages/events` are complete.

---

### 8.7 `apps/workspace-app`

**What must be added:**
- In-app notification center UI component (bell icon, notification drawer)
- Notification inbox list (unread/read/archived tabs)
- Notification preference settings page (per channel, per event category)
- Real-time notification push (SSE or polling endpoint)
- Offline notification queue (via `@webwaka/offline-sync` Dexie.js store)
- Service worker update for background push receipt

---

### 8.8 `apps/platform-admin`

**What must be added:**
- Platform-level notification template management UI
- Cross-tenant notification delivery log
- Dead-letter queue inspection and replay UI
- Channel provider health dashboard
- System alert configuration

---

### 8.9 `apps/brand-runtime`

**What must be added:**
- Tenant notification preference management routes (surface in tenant settings)
- Tenant-specific notification template editor
- Unsubscribe landing page (`/unsubscribe?token=...`)

---

### 8.10 `infra/db/migrations`

**New migrations required (numbered from 0254+):**

```
0254_notification_events.sql
0255_notification_rules.sql
0256_notification_preferences.sql
0257_notification_templates.sql
0258_notification_deliveries.sql
0259_notification_inbox_items.sql
0260_notification_digest_batches.sql
0261_notification_audit_log.sql
0262_notification_subscriptions.sql
0263_escalation_policies.sql
0264_channel_providers.sql
0265_push_tokens.sql
0266_seed_platform_notification_templates.sql   -- inserts 40+ platform default templates
0267_seed_notification_rules.sql               -- inserts default routing rules
0268_seed_channel_providers.sql               -- inserts platform channel providers
```

---

## DELIVERABLE 9 — PHASED IMPLEMENTATION ROADMAP

### Phase 0 — Audit and Standards (Week 1-2)

**Objectives:** Establish naming standards, event schema registry, and shared contracts before writing any new code.

**Repos involved:** `packages/events`, `packages/types`, docs

**Prerequisites:** None

**Implementation tasks:**
- Define canonical event key naming convention: `{domain}.{aggregate}.{action}` (this document)
- Define `notification_event` normalized shape
- Define channel abstraction interface `INotificationChannel`
- Define template variable schema convention
- Agree on preference inheritance model
- Define D1 schema for all 13 new tables
- Create `packages/notifications` package skeleton with no implementation

**Migration tasks:** None yet

**Tests:** Schema validation tests for event key format

**Exit criteria:** All contracts and interfaces defined in TypeScript. Schema SQL files written and reviewed. Package skeleton compiles.

---

### Phase 1 — Core Event Infrastructure (Week 3-4)

**Objectives:** Expand domain event bus to cover all identified event types. Wire outbox pattern. Migrate to Cloudflare Queues for durable transport.

**Repos involved:** `packages/events`, `apps/api`, `infra`

**Prerequisites:** Phase 0 complete

**Implementation tasks:**
- Expand `EventType` catalog from 16 to 80+ types with typed payloads
- Add `correlation_id` to `DomainEvent` shape and `publishEvent()` signature
- Implement Cloudflare Queues consumer as durable replacement for in-memory `subscribe()`
- Wire outbox: `publishEvent()` writes to `event_log` first; Queue consumer reads and dispatches
- Run D1 migrations 0254–0265 (all new tables)
- Write platform seed data (migration 0266–0268)

**Migration tasks:** No existing data to migrate in this phase

**Tests:** 
- Verify in-memory subscriber removed
- Queue consumer durability test (Worker restart does not lose events)
- Optimistic versioning under concurrent writes

**Risks:** Cloudflare Queues latency characteristics under high load for African traffic patterns

**Exit criteria:** All 80+ event types defined. Queue consumer receiving events. event_log persisting correctly with correlation_id.

---

### Phase 2 — Core Notification Service + Data Model (Week 5-6)

**Objectives:** Implement `NotificationService` with rule engine, audience resolution, and basic delivery persistence.

**Repos involved:** `packages/notifications`, `apps/api`

**Prerequisites:** Phase 1 complete

**Implementation tasks:**
- Implement `NotificationService.raise(eventKey, payload, tenantId)` entry point
- Implement rule loading from `notification_rules` table with platform/tenant fallback
- Implement audience resolution for all `audience_type` values
- Implement `notification_delivery` write with idempotency key check
- Implement basic in-app delivery (write to `notification_inbox_item`)
- Wire existing `EmailService` as first channel implementation behind channel abstraction
- Replace inline `new EmailService()` calls in `auth-routes.ts` with `notificationService.raise()`
- Implement `notification_audit_log` writes on every send

**Migration tasks:**
- Migrate 6 existing email template bodies to `notification_templates` table as platform defaults (migration 0266)
- Existing FROM address becomes default platform channel_provider config

**Tests:**
- NotificationService.raise → rule matches → audience resolved → delivery written
- Multi-tenant isolation: event in tenant A must not produce delivery for tenant B
- Idempotency: duplicate event does not produce duplicate delivery

**Risks:** Rule evaluation performance at high event volume; D1 read limits

**Exit criteria:** `auth.user.registered` event flows through full pipeline. In-app inbox item created. Email delivered. Audit log written. No cross-tenant leakage.

---

### Phase 3 — Template Engine + Branding Inheritance (Week 7-8)

**Objectives:** Replace hardcoded HTML strings with versioned template system. Apply tenant branding to all outbound communications.

**Repos involved:** `packages/notifications`, `packages/white-label-theming`, `apps/api`

**Prerequisites:** Phase 2 complete

**Implementation tasks:**
- Implement `TemplateRenderer` with Handlebars-style variable substitution
- Implement partials library (cta_button, data_table, alert_box, legal_footer)
- Implement tenant brand context injection into email wrapper
- Add `senderEmailAddress`, `senderDisplayName`, `tenantSupportEmail`, `tenantAddress` to `TenantTheme`
- Load tenant override template when available; fall back to platform default
- Implement template versioning and status transitions (draft → active → deprecated)
- Implement template preview endpoint: `POST /notifications/templates/:id/preview`
- Implement test-send endpoint: `POST /notifications/templates/:id/test-send`
- Generate plain-text version of all HTML templates automatically
- Add `List-Unsubscribe` header to all email sends
- Add unsubscribe endpoint: `GET /unsubscribe?token=...`

**Migration tasks:**
- Update `channel_providers` with Resend config
- Update `notification_templates` with rendered versions of all existing 6 templates

**Tests:**
- Template rendering with all variable types
- Tenant brand override correctly replaces platform default
- Locale fallback: missing en-NG template → en fallback
- Unsubscribe token generation and consumption
- Sanitization: user-supplied string does not execute as HTML or JavaScript

**Risks:** Tenant template editing could introduce XSS if sanitization is incomplete

**Exit criteria:** All 6 email templates rendered via template engine with tenant branding applied. Test-send works. Preview works. Unsubscribe link functional.

---

### Phase 4 — Channel Providers + Delivery Tracking (Week 9-10)

**Objectives:** Implement full channel provider abstraction. Add delivery tracking. Wire SMS, WhatsApp, Telegram, and push as notification channels.

**Repos involved:** `packages/notifications`, `packages/otp`, `apps/api`

**Prerequisites:** Phase 3 complete

**Implementation tasks:**
- Implement `INotificationChannel` for: Resend (email), Termii (SMS), Meta WA, 360dialog (WA), Telegram
- Implement web push channel: service worker subscription, FCM provider
- Implement fallback channel ordering from `notification_rules.channel_fallback`
- Implement delivery status tracking: dispatched → delivered/failed
- Implement bounce/unsubscribe webhook handlers from Resend
- Add per-channel rate limiting at notification level (separate from OTP rate limits)
- Add per-tenant `channel_providers` overrides (tenant can supply own Resend domain)
- Implement Slack and Teams webhook channel for system/admin alerts

**Migration tasks:**
- `monitoring.ts` ALERT_WEBHOOK_URL replaced with `system.error_rate.spike` event → Slack channel

**Tests:**
- Each channel provider successfully dispatches (mock provider responses)
- Fallback channel activated on primary failure
- Bounce webhook updates delivery status correctly
- Per-tenant provider override routes to correct credentials

**Risks:** Termii API changes; Meta WA template approval delays

**Exit criteria:** All 5 existing channels (Email, SMS, WhatsApp, Telegram, In-App) wired. Delivery status tracked end-to-end. Bounce handling working.

---

### Phase 5 — Preferences + Inbox + Digest Engine (Week 11-13)

**Objectives:** Implement full preference model, in-app notification center, and digest batching.

**Repos involved:** `packages/notifications`, `apps/workspace-app`, `apps/brand-runtime`

**Prerequisites:** Phase 4 complete

**Implementation tasks:**
- Implement `PreferenceService` with inheritance chain: platform → tenant → role → user
- Implement KV cache for hot-path preference reads (5min TTL)
- Implement quiet hours evaluation (timezone-aware, Africa/Lagos default)
- Implement digest window management (`hourly`, `daily`, `weekly`)
- Implement `DigestEngine`: group events into `notification_digest_batches`, render digest template, send on window close
- Implement in-app notification center API:
  - `GET /notifications/inbox` (paginated, unread/read/archived/pinned)
  - `PATCH /notifications/inbox/:id` (read, archive, pin, dismiss, snooze)
  - `DELETE /notifications/inbox/:id` (hard delete)
- Implement preference management API:
  - `GET /notifications/preferences` (current user)
  - `PATCH /notifications/preferences` (update channel/event preferences)
- Implement real-time notification push (SSE endpoint or polling)
- Implement offline-sync compatibility for inbox (Dexie.js store)
- Add notification bell/drawer to `apps/workspace-app`
- Add preference settings page to `apps/workspace-app`
- Add unsubscribe landing page to `apps/brand-runtime`

**Tests:**
- Preference inheritance: user override beats role default beats tenant default beats platform
- Quiet hours: notification scheduled, not suppressed, delivered after window
- Digest: 3 events in window → single digest email with all 3 summarized
- Inbox state machine: unread → read → archived transitions
- SSE: inbox item appears in real-time without page refresh

**Exit criteria:** Users can manage preferences. In-app inbox works. Digest sends correctly batched. Quiet hours respected.

---

### Phase 6 — Repo Integration and Vertical Event Adoption (Week 14-18)

**Objectives:** Wire notification events across all existing routes and all 160+ vertical packages.

**Repos involved:** All apps, all vertical packages

**Prerequisites:** Phases 1-5 complete

**Implementation tasks:**
- Replace all direct `EmailService` calls with `notificationService.raise()` across all routes
- Wire auth events: registered, email_verified, password_reset_requested/completed, password_changed, login_success, login_failed, account_locked, data_erased
- Wire workspace events: member_added, member_removed, role_changed, suspended, deprovisioned
- Wire billing events: all 12 billing event types
- Wire KYC events: otp_sent, otp_verified, tier_upgraded, bvn_verified, nin_verified
- Wire claim events: all 5 claim event types (handlers already in event bus, add notification dispatch)
- Wire negotiation events: all 7 negotiation event types (expiry job update)
- Wire support events: all 5 support event types
- Wire AI events: consent, credit_exhausted, credit_low, hitl_escalated
- Wire onboarding events: step_completed, checklist_completed, step_stalled (new scheduled job)
- Create `@webwaka/vertical-events` package with canonical vertical event types
- Wire 8 canonical vertical events in all applicable vertical packages

**Migration tasks:**
- For each route that currently calls EmailService directly: audit all call sites, replace, test

**Tests:** Per-route integration tests verifying events raised → notifications delivered

**Exit criteria:** Zero direct EmailService calls in route handlers. All identified business events produce appropriate notifications.

---

### Phase 7 — Admin Tooling + Observability + Replay (Week 19-21)

**Objectives:** Full operational visibility, dead-letter management, and admin tooling.

**Repos involved:** `apps/platform-admin`, `apps/api`

**Prerequisites:** Phase 6 complete

**Implementation tasks:**
- Build platform admin notification template management UI (CRUD, preview, test-send)
- Build cross-tenant delivery log viewer with filter/search
- Build dead-letter queue inspector with replay and dismiss actions
- Build channel provider health dashboard (delivery rates, bounce rates per provider)
- Build notification rule editor for super_admin
- Implement structured notification metrics (send_volume, delivery_rate, bounce_rate, open_rate by tenant/channel/template)
- Add Cloudflare Logpush integration for notification event logs
- Implement alert on delivery anomalies (bounce rate > 5% → alert to super_admin)
- Implement sandbox/test mode delivery (staging environment: deliver to test addresses only)
- Build tenant-facing notification delivery log (within brand-runtime settings)

**Tests:**
- Dead-letter replay delivers successfully on second attempt
- Metrics aggregation is correct
- Sandbox mode does not deliver to real addresses

**Exit criteria:** Super-admin can inspect, replay, and manage all notification deliveries. Metrics visible. Alerts working.

---

### Phase 8 — QA Hardening + Rollout (Week 22-24)

**Objectives:** Full test coverage, security review, compliance validation, and production rollout.

**Repos involved:** All

**Prerequisites:** Phase 7 complete

**Tasks:**
- Full E2E Playwright test suite for all notification flows
- Multi-tenant isolation penetration test (verify no cross-tenant notification bleed)
- Load test: simulate 10,000 notifications/hour across 100 tenants on staging
- NDPR audit: verify consent gating for marketing, unsubscribe handling, data erasure propagation
- CBN compliance audit: verify transaction OTP channel enforcement (R8)
- Template security audit: XSS review of all rendering paths
- Accessibility audit: email templates (aria labels, alt text, plain-text)
- Production rollout plan: feature flag per tenant, observe for 2 weeks before full enablement
- Monitor error rates, bounce rates, delivery rates on production for 30 days
- Document all runbook procedures (provider failover, dead-letter sweep, digest rerun)

**Exit criteria:** All tests pass. NDPR/CBN compliance verified. Load test passes at 2x expected volume. Production rollout complete with monitoring active.

---

## DELIVERABLE 10 — BEST-PRACTICE GUARDRAILS

These are non-negotiable rules for the WebWaka notification system. They must be enforced via code, tests, or review gates.

### G1 — Tenant Isolation is Absolute
Every notification_event, notification_delivery, notification_inbox_item, notification_preference, and notification_template query MUST include `tenant_id` in the WHERE clause. No cross-tenant reads are permitted from any notification API. This must be tested with a specific cross-tenant isolation test suite.

### G2 — No Direct Email Sends from Business Routes
After Phase 2, the pattern `new EmailService(key).sendTransactional(...)` is forbidden in route handlers. All email delivery must flow through `NotificationService.raise()`. Enforce via ESLint custom rule that bans direct `EmailService` instantiation outside `packages/notifications`.

### G3 — No Hardcoded FROM Address
`WebWaka <noreply@webwaka.com>` must not appear in code after Phase 3. FROM address must be loaded from `channel_providers` configuration, defaulting to platform sender if no tenant override exists.

### G4 — Brand Context Always Applied
Email templates must render through the `@webwaka/white-label-theming` brand context. No email renders without loading `TenantTheme` first. Test: a newly created tenant's emails must already use their brand colors.

### G5 — Transaction OTPs Must Use SMS (R8)
`purpose === 'transaction'` must route only to `channel === 'sms'`. This rule already exists in `@webwaka/otp` and must be preserved. WhatsApp/Telegram must remain blocked for transaction OTPs.

### G6 — No Raw OTP Values Persisted
OTP values must never appear in any database column, log line, or response body. Only SHA-256 hashes with the platform salt. This rule already exists and must be extended to cover notification templates (OTP display templates must receive pre-formatted strings, not raw codes).

### G7 — Idempotency Required for All Sends
Every notification delivery must generate an idempotency key before dispatch. Duplicate events (from retry or replay) must not produce duplicate deliveries. The `notification_deliveries.idempotency_key` UNIQUE constraint enforces this at the DB level.

### G8 — Consent Gates for Marketing
Any notification with `topic` in `notification_subscriptions` must check `subscribed = 1` before dispatch. Transactional notifications (auth, billing, security) bypass consent checks per NDPR Article 2(1)(b). The distinction between transactional and marketing must be explicit in `notification_rules`.

### G9 — Audit Every Send
`notification_audit_log` must be written for every send attempt, whether successful or failed. Preference changes must also be audited. This audit log is required for NDPR accountability and must be queryable for data subject access requests.

### G10 — Dead-Letter, Never Discard
After max retry attempts, notifications must be written to dead-letter state (not deleted). Operations team must be alerted and must be able to replay, inspect, or dismiss dead-lettered notifications. Silent discard on failure is forbidden.

### G11 — Quiet Hours Must Be Tenant-Timezone-Aware
`Africa/Lagos` (WAT, UTC+1) is the default timezone. Quiet hours evaluation must convert the current UTC time to the recipient's configured timezone before applying the window. A notification blocked by quiet hours must be scheduled for delivery after the quiet window closes — not suppressed.

### G12 — Critical Notifications Bypass Quiet Hours
Notifications with `severity = 'critical'` (account locked, data breach, payment critical failure, workspace suspended) bypass quiet hours and digest windows. They deliver immediately on all configured channels.

### G13 — Provider Abstraction Must be Complete
No channel-specific provider implementation code (Resend, Termii, etc.) must appear in business logic, route handlers, or rule evaluation. All provider specifics are behind `INotificationChannel`. Swapping a provider must require changes only in `packages/notifications/channels/`.

### G14 — Template Variables Must be Schema-Validated
Before rendering, all variables must be validated against `notification_templates.variables_schema`. Missing required variables must fail loudly (not silently render empty strings). This prevents silent template failures at scale.

### G15 — No PII in Logs
The existing `@webwaka/logging` PII masking must be applied to all notification log lines. Notification audit logs store recipient IDs, not email addresses or phone numbers. Delivery logs store provider message IDs, not content.

---

## DELIVERABLE 11 — ACTIONABLE BACKLOG

### Phase 0 — Audit and Standards

| ID | Task | Estimate | Priority |
|---|---|---|---|
| N-001 | Define 80+ canonical event keys and document in event-types.ts | 3d | P0 |
| N-002 | Write D1 schema SQL for all 13 new notification tables | 2d | P0 |
| N-003 | Define TypeScript contracts for INotificationChannel, ITemplateRenderer, IPreferenceStore | 1d | P0 |
| N-004 | Create packages/notifications skeleton (package.json, tsconfig, index.ts) | 0.5d | P0 |
| N-005 | Document template variable schema convention and escaping rules | 1d | P0 |
| N-006 | Define preference inheritance model spec | 0.5d | P0 |

### Phase 1 — Core Event Infrastructure

| ID | Task | Estimate | Priority |
|---|---|---|---|
| N-010 | Expand @webwaka/events EventType catalog to 80+ types | 3d | P0 |
| N-011 | Add correlation_id to DomainEvent and publishEvent() | 0.5d | P0 |
| N-012 | Implement Cloudflare Queues consumer replacing in-memory subscriber | 3d | P0 |
| N-013 | Wire outbox pattern: publishEvent within D1 transaction | 2d | P0 |
| N-014 | Run and validate migrations 0254-0268 on staging | 1d | P0 |
| N-015 | Write seed data for platform notification_rules and notification_templates | 2d | P0 |

### Phase 2 — Core Notification Service

| ID | Task | Estimate | Priority |
|---|---|---|---|
| N-020 | Implement NotificationService.raise() entry point | 3d | P0 |
| N-021 | Implement rule engine: load rules, evaluate, select channels and template | 3d | P0 |
| N-022 | Implement audience resolution for all audience_type values | 2d | P0 |
| N-023 | Implement notification_delivery persistence with idempotency | 1d | P0 |
| N-024 | Implement in-app channel: write to notification_inbox_item | 1d | P0 |
| N-025 | Wire EmailService as Resend channel implementation behind INotificationChannel | 2d | P0 |
| N-026 | Replace inline EmailService calls in auth-routes.ts | 1d | P0 |
| N-027 | Implement notification_audit_log writes | 1d | P0 |
| N-028 | Write multi-tenant isolation tests | 1d | P0 |

### Phase 3 — Template Engine and Branding

| ID | Task | Estimate | Priority |
|---|---|---|---|
| N-030 | Implement Handlebars-style TemplateRenderer with variable substitution | 3d | P0 |
| N-031 | Build email wrapper with TenantTheme brand injection | 2d | P0 |
| N-032 | Add partials library (cta_button, data_table, alert_box, legal_footer) | 2d | P0 |
| N-033 | Add senderEmailAddress and other fields to TenantTheme | 0.5d | P0 |
| N-034 | Implement tenant template override resolution | 1d | P0 |
| N-035 | Implement template versioning (draft → active → deprecated) | 1d | P1 |
| N-036 | Add preview endpoint (POST /notifications/templates/:id/preview) | 1d | P1 |
| N-037 | Add test-send endpoint (POST /notifications/templates/:id/test-send) | 1d | P1 |
| N-038 | Auto-generate plain-text from HTML for all email templates | 1d | P1 |
| N-039 | Add List-Unsubscribe header and unsubscribe endpoint | 1d | P0 |
| N-040 | Migrate 6 existing email templates into notification_templates table | 1d | P0 |

### Phase 4 — Channel Providers

| ID | Task | Estimate | Priority |
|---|---|---|---|
| N-040 | Implement Termii SMS channel behind INotificationChannel | 1d | P0 |
| N-041 | Implement Meta WhatsApp channel | 1d | P0 |
| N-042 | Implement 360dialog WhatsApp channel | 0.5d | P0 |
| N-043 | Implement Telegram channel | 0.5d | P0 |
| N-044 | Implement web push channel (FCM + service worker integration) | 3d | P1 |
| N-045 | Implement Slack webhook channel for system alerts | 1d | P1 |
| N-046 | Implement Teams webhook channel for system alerts | 1d | P2 |
| N-047 | Implement fallback channel chain logic | 1d | P0 |
| N-048 | Implement delivery status tracking (dispatched → delivered/failed) | 1d | P0 |
| N-049 | Implement Resend bounce webhook handler | 1d | P1 |
| N-050 | Migrate monitoring ALERT_WEBHOOK_URL to Slack notification channel | 1d | P1 |
| N-051 | Add per-tenant channel_providers override support | 2d | P1 |

### Phase 5 — Preferences, Inbox, Digest

| ID | Task | Estimate | Priority |
|---|---|---|---|
| N-060 | Implement PreferenceService with 4-level inheritance chain | 3d | P0 |
| N-061 | Add KV cache for preference reads | 1d | P0 |
| N-062 | Implement quiet hours (timezone-aware WAT default) | 2d | P0 |
| N-063 | Implement digest window management and batching | 3d | P1 |
| N-064 | Implement DigestEngine: group, render, send | 3d | P1 |
| N-065 | Build inbox API (GET, PATCH, DELETE) | 2d | P0 |
| N-066 | Build preference management API | 1d | P0 |
| N-067 | Build SSE real-time push endpoint for inbox | 2d | P1 |
| N-068 | Add Dexie.js offline notification store to @webwaka/offline-sync | 2d | P1 |
| N-069 | Build notification bell + drawer in apps/workspace-app | 3d | P0 |
| N-070 | Build preference settings page in apps/workspace-app | 2d | P1 |
| N-071 | Build unsubscribe landing page in apps/brand-runtime | 1d | P0 |

### Phase 6 — Route and Vertical Wiring

| ID | Task | Estimate | Priority |
|---|---|---|---|
| N-080 | Wire all auth lifecycle events (12 events) | 2d | P0 |
| N-081 | Wire all workspace events (8 events) | 1d | P0 |
| N-082 | Wire all billing lifecycle events (12 events) | 2d | P0 |
| N-083 | Wire all KYC/identity events (6 events) | 1d | P0 |
| N-084 | Wire all claim events (5 events) | 1d | P0 |
| N-085 | Wire all negotiation events (7 events) | 1d | P0 |
| N-086 | Wire all support ticket events (5 events) | 1d | P0 |
| N-087 | Wire all AI/superagent events (6 events) | 1d | P0 |
| N-088 | Wire all onboarding events (3 events) | 1d | P0 |
| N-089 | Wire all POS/finance events (4 events) | 1d | P1 |
| N-090 | Wire all social/community events (5 events) | 1d | P1 |
| N-091 | Create @webwaka/vertical-events package with 8 canonical vertical events | 2d | P1 |
| N-092 | Wire vertical events in all 160+ vertical packages (scripted, not manual) | 3d | P1 |
| N-093 | Update negotiation-expiry job to emit negotiation.session.expired | 0.5d | P0 |
| N-094 | Add onboarding stalled job to emit onboarding.step.stalled | 1d | P1 |

### Phase 7 — Admin Tooling

| ID | Task | Estimate | Priority |
|---|---|---|---|
| N-100 | Build platform admin notification template management UI | 4d | P1 |
| N-101 | Build cross-tenant delivery log viewer | 2d | P1 |
| N-102 | Build dead-letter queue inspector with replay | 2d | P1 |
| N-103 | Build channel provider health dashboard | 2d | P1 |
| N-104 | Build notification rule editor (super_admin) | 3d | P2 |
| N-105 | Implement delivery anomaly alerts (bounce rate spike) | 1d | P1 |
| N-106 | Implement sandbox/test mode for staging | 1d | P0 |
| N-107 | Add tenant notification delivery log to brand-runtime settings | 2d | P2 |

### Phase 8 — QA and Rollout

| ID | Task | Estimate | Priority |
|---|---|---|---|
| N-110 | Full E2E Playwright test suite for notification flows | 5d | P0 |
| N-111 | Multi-tenant isolation penetration test | 2d | P0 |
| N-112 | Load test: 10,000 notifications/hour on staging | 1d | P1 |
| N-113 | NDPR compliance audit (consent, unsubscribe, data erasure) | 2d | P0 |
| N-114 | CBN compliance audit (transaction OTP channels) | 1d | P0 |
| N-115 | Template XSS security review | 1d | P0 |
| N-116 | Email accessibility audit (WCAG 2.1 AA) | 1d | P1 |
| N-117 | Production rollout via feature flag per tenant | 2d | P0 |
| N-118 | Write operations runbooks (provider failover, dead-letter sweep) | 2d | P1 |

---

**Total estimated effort:** ~150 engineering days (30 weeks at 1 engineer, or ~10 weeks with a 3-person team)

**Recommended resourcing:** 
- 1 Platform Architect (owns architecture, contracts, governance)
- 1 Backend Engineer (notification service, event bus, channel providers)
- 1 Full-Stack Engineer (admin UI, workspace-app inbox, preference pages)
- 1 QA Engineer (Phase 8, ongoing)

**Critical path:** N-001 → N-010/N-012 → N-020/N-021 → N-026 → N-039 → N-080/N-082 → N-110/N-113

---

*This document is the authoritative specification for the WebWaka notification engine. All implementation work against this backlog should reference the deliverable section and specific task ID.*
