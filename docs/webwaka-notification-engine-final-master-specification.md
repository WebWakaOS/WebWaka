# WebWaka Notification Engine — Final Master Specification

**Version:** 1.0 (Merged & Corrected)  
**Date:** 2026-04-20  
**Status:** IMPLEMENTATION-READY — All mandatory audit corrections incorporated  
**Source Documents:**  
— Document A: `docs/notification-engine-review.md` (original review)  
— Document B: `docs/notification-engine-audit.md` (independent QA audit)  
**Authority:** This document supersedes both source documents for all implementation purposes.

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Source Document Reconciliation](#2-source-document-reconciliation)
3. [Platform Review Method](#3-platform-review-method)
4. [Current-State Findings](#4-current-state-findings)
5. [Canonical Notification Event Catalog](#5-canonical-notification-event-catalog)
6. [Missing Elements List](#6-missing-elements-list)
7. [Canonical Domain Model](#7-canonical-domain-model)
8. [Reference Architecture](#8-reference-architecture)
9. [Template System Design](#9-template-system-design)
10. [Repo-by-Repo Implementation Impact](#10-repo-by-repo-implementation-impact)
11. [Phased Implementation Roadmap](#11-phased-implementation-roadmap)
12. [Best-Practice Guardrails](#12-best-practice-guardrails)
13. [Open Questions and Decisions Needed](#13-open-questions-and-decisions-needed)
14. [Execution Backlog](#14-execution-backlog)
15. [Final Approval Criteria](#15-final-approval-criteria)

---

## 1. EXECUTIVE SUMMARY

### Vision

WebWaka is a multi-tenant, white-label, multi-vertical SaaS platform operating system built for Africa, Nigeria-first. Today, it has excellent per-channel notification primitives (email via Resend, OTP via Termii/Meta/Telegram) but zero unified notification infrastructure: no pipeline, no preferences, no inbox, no templates, no tenant branding on outbound comms, and no systematic event-to-notification wiring across any of its 160+ vertical modules.

This specification defines the WebWaka Notification Engine: a Cloudflare-native, event-driven, multi-tenant notification system that covers every delivery channel, every business domain, every white-label surface, and every compliance requirement the platform operates under.

### Why WebWaka Needs This Now

- **160+ vertical packages produce zero business notifications.** No order confirmations, appointment reminders, payment receipts, or service alerts.
- **Billing and subscription lifecycle events are silent.** Plan changes, grace periods, suspensions, and quota breaches send no alerts.
- **Partner ecosystem notifications are absent.** M11 (partner/sub-partner system) is live with 72 passing tests and fires no notifications.
- **All emails are WebWaka-branded.** No tenant name, logo, color, or domain is applied to any outbound email — a fundamental white-label failure.
- **The event bus has no notification subscribers.** `@webwaka/events` publishes to D1 but no consumer subscribes for notification purposes.
- **The bank-transfer FSM processes ₦ flows silently.** Proof submissions, confirmations, rejections, and disputes produce no user notifications.

### What This Specification Covers

This document specifies:
- A unified 9-layer notification pipeline on Cloudflare Workers, D1, KV, and Queues
- A 100+ event catalog covering all 15 business domains
- A 15-entity domain model with security, retention, and compliance requirements
- A tenant-branded, locale-aware, versioned template system using existing `@webwaka/i18n`
- A phased 9-phase implementation roadmap with 165 engineering days estimated
- 20 enforceable guardrails
- 13 unresolved platform decisions that must be answered before implementation
- A clean, de-duplicated, dependency-tracked backlog with unique IDs

### What Was Corrected From the Original Review

Five categories of verifiable defects in the original review were corrected:

1. `apps/projections` and `apps/tenant-public` (two deployed production Workers) and six packages were not inspected — now added.
2. The entire partner ecosystem, bank-transfer FSM, transport FSM, B2B marketplace, and airtime routes had zero notification events — all added.
3. `channel_provider` stored provider API keys in D1 plaintext — corrected to follow ADL-002 (KV-encrypted credentials).
4. The template locale system was being reinvented from scratch — corrected to use the existing `@webwaka/i18n` package (P1 invariant).
5. A required "Open Questions and Decisions Needed" deliverable was missing — added as Section 13.
6. Backlog had duplicate task ID N-040 — corrected.

---

## 2. SOURCE DOCUMENT RECONCILIATION

### What Document A (Review) Got Right — Preserved

| Area | Judgement |
|---|---|
| EmailService, OTP, WebhookDispatcher findings | Accurate, code-grounded, fully preserved |
| @webwaka/events gap analysis | Correct. In-memory subscriber, no notification consumers, no Queues — preserved |
| 9-layer reference architecture | Fundamentally sound, preserved with additions |
| 13-entity domain model | Correct foundation, expanded in this spec |
| G1–G15 guardrails | Specific and enforceable, preserved and extended to G20 |
| Phase 0 (contracts-first) instinct | Correct — preserved and expanded |
| NDPR/CBN compliance requirements | Accurately captured, preserved |
| Nigeria-first operational requirements | WAT defaults, Termii primary, OTP waterfall — preserved |

### What Document B (Audit) Corrected — Incorporated

| Finding | Correction Applied |
|---|---|
| `apps/projections` missed | Added to review scope, current-state findings, repo impact, roadmap |
| `apps/tenant-public` missed | Added to scope and repo impact (unsubscribe landing page owner) |
| `packages/i18n` missed | Added to scope; template locale system redesigned to use it |
| Partner ecosystem events absent | 6 partner events added to catalog |
| Bank-transfer FSM events absent | 7 bank-transfer events added to catalog |
| Transport FSM, B2B marketplace, airtime silent | Events added to catalog |
| Auth API key events missing | 2 events added |
| HITL events partially in projections | Events aligned; overlap decision added to Open Questions |
| Event key naming inconsistencies | All event keys normalized to `{domain}.{aggregate}.{action}` |
| `auth.user.login_failed` actor wrong | Fixed to `actor_type=unknown` |
| `channel_provider` stores secrets in D1 | Schema redesigned: `config` for non-secrets, `credentials_kv_key` for secrets (ADL-002) |
| No `notification_suppression_list` | Added as required entity |
| `notification_digest_batch.event_ids` JSON array | Replaced with `notification_digest_batch_item` join table |
| `notification_inbox_item` missing `delivery_id` FK | Added |
| `notification_delivery` missing `created_at` | Added |
| `notification_template` missing `whatsapp_approval_status` | Added |
| Multi-level brand hierarchy not addressed | Added to architecture and template system |
| CF Queues not provisioned in wrangler.toml | Added as prerequisite in Phase 0 |
| No "Open Questions" deliverable | Added as Section 13 |
| Duplicate backlog ID N-040 | Renumbered; backlog fully de-duplicated |
| No data retention policy | Added to domain model, guardrails, and backlog |
| USSD notification path undefined | Added to Open Questions and architecture notes |

### What Was Removed or Merged

- Duplicate descriptions of the same gap appearing in both source documents — collapsed to one canonical statement
- Source document preamble and meta-discussion — replaced by this section
- Per-deliverable audit commentary format — merged into the corrected specification text
- Audit's "What is good / What is weak" per-section format — absorbed into the final spec

### What Remains Open

See Section 13 for 13 unresolved architectural and operational decisions. None of these block Phase 0 or Phase 1 except OQ-001 (consumer Worker ownership) and OQ-002 (HITL escalation ownership), which must be resolved before Phase 1 begins.

---

## 3. PLATFORM REVIEW METHOD

### Review Approach

This specification was built using DEEP CODE-FIRST methodology across the entire WebWaka multi-repo platform. All conclusions are grounded in actual source files. Where docs existed, they were cross-referenced against code; code was authoritative.

### Applications Inspected

| App | Review Depth | Notes |
|---|---|---|
| `apps/api` | Full | All routes, middleware, lib, jobs, contracts, env bindings, wrangler.toml |
| `apps/platform-admin` | Full | Super-admin local dev shim |
| `apps/admin-dashboard` | Full | Admin dashboard frontend |
| `apps/ussd-gateway` | Full | USSD + Telegram Bot Worker |
| `apps/brand-runtime` | Full | Tenant white-label storefront |
| `apps/public-discovery` | Full | Public marketplace/directory |
| `apps/partner-admin` | Full | Partner admin portal |
| `apps/workspace-app` | Full | Tenant workspace PWA |
| `apps/projections` | Full | **[AUDIT ADDITION]** Event projection Worker; runs CRON for search rebuild, HITL expiry sweep, L3 escalation; uses `@webwaka/events`; critical notification-adjacent Worker |
| `apps/tenant-public` | Full | **[AUDIT ADDITION]** Tenant white-label public pages Worker; serves public-facing tenant surfaces; owns the unsubscribe landing page path |

### Packages Inspected

| Package | Review Depth | Notes |
|---|---|---|
| `packages/events` | Full | Domain event bus, publisher, in-memory subscriber, projections |
| `packages/otp` | Full | Multi-channel OTP with waterfall and rate limiting |
| `packages/logging` | Full | Structured JSON logger with PII masking |
| `packages/auth` | Full | JWT issuing and verification |
| `packages/auth-tenancy` | Full | Auth tenancy stubs |
| `packages/entitlements` | Full | CBN KYC tiers, plan-based feature gating |
| `packages/payments` | Full | Paystack integration, subscription sync |
| `packages/offline-sync` | Full | Dexie.js PWA offline sync + service worker |
| `packages/white-label-theming` | Full | Tenant theme tokens, CSS vars, KV caching |
| `packages/superagent` | Full | AI consent, usage metering, credit burn, NDPR |
| `packages/negotiation` | Full | Negotiation session lifecycle |
| `packages/types` | Full | Shared TypeScript types |
| `packages/core`, `packages/entities`, `packages/geography` | Full | Core domain |
| `packages/social`, `packages/community` | Full | Social features |
| `packages/search-indexing`, `packages/relationships`, `packages/profiles` | Full | Search and relationships |
| `packages/i18n` | Full | **[AUDIT ADDITION]** Production i18n with 6 locales: en, ha (Hausa), yo (Yorùbá), ig (Igbo), pcm (Pidgin), fr. Typed locale keys with fallback to English. This package MUST be used by the notification template locale system. |
| `packages/offerings` | Full | **[AUDIT ADDITION]** Cross-pillar offering data access layer |
| `packages/workspaces` | Sampled | **[AUDIT ADDITION]** Workspace management package |
| `packages/contact` | Sampled | **[AUDIT ADDITION]** Contact management package |
| `packages/frontend` | Sampled | **[AUDIT ADDITION]** Frontend shared utilities |
| `packages/shared-config` | Full | **[AUDIT ADDITION]** Shared CORS config and environment utilities |
| All 160+ vertical packages | Pattern-sampled | Structure and event emission patterns sampled; not exhaustively read line-by-line. Verticals fully read: `verticals-pos-business`, `verticals-school`, `verticals-hospital`, `verticals-restaurant`, `verticals-farm`. All others: structural sampling only. |
| `packages/pos`, `packages/claims`, `packages/identity`, `packages/ai-abstraction`, `packages/ai-adapters` | Full | Domain-specific packages |

### Infra and Docs Inspected

- All 253 D1 migration files (scanned for notification-relevant schema — none found)
- `apps/api/wrangler.toml` — confirmed **zero** `[[queues.producers]]` or `[[queues.consumers]]` bindings
- `infra/cloudflare/`, `infra/scripts/`, GitHub Actions workflows
- `docs/governance/platform-invariants.md` — P1-P8, T1-T10
- `docs/governance/security-baseline.md` — ADL-002 (encrypted secrets in KV, not D1)
- `docs/governance/entitlement-model.md`
- `scripts/governance-checks/` — 10+ CI governance scripts including `check-tenant-isolation.ts`, `check-ai-direct-calls.ts`

### Confidence Levels

**HIGH:** All existing notification primitives (email, OTP, webhooks, event bus). All missing infrastructure (zero inbox, preferences, template engine, delivery tracking). All silent workflow gaps. Database schema (all 253 migrations).

**MEDIUM:** Exact vertical domain event semantics (sampled, not exhaustively read). Cloudflare Queues account-level limits for this specific tenant's deployment.

**KNOWN BLIND SPOTS:** Live provider credentials and configured rate limits. Real-world traffic volumes affecting throttling thresholds.

---

## 4. CURRENT-STATE FINDINGS

### 4.1 What Exists Today

#### A. Email Delivery — `apps/api/src/lib/email-service.ts`

A single `EmailService` class wraps the Resend REST API directly (no SDK — CF Workers compatible). Supports 6 hardcoded templates:

| Template | Trigger |
|---|---|
| `welcome` | New user registration |
| `template-purchase-receipt` | Paid template purchase verified |
| `workspace-invite` | Admin invites member to workspace |
| `payment-confirmation` | Paystack payment verified |
| `password-reset` | Forgot-password flow |
| `email-verification` | Email address verification |

**Critical facts confirmed from code:**
- FROM address hardcoded: `WebWaka <noreply@webwaka.com>` — never tenant-branded
- All HTML rendered as inline TypeScript strings — no template engine
- No tenant name, logo, color, or domain in any email
- No delivery tracking, open/click tracking, or bounce handling
- No retry at the notification layer (Resend handles its own internal delivery retries)
- No dead-letter handling
- No idempotency key — duplicate sends possible on retry
- Silent skip in dev when `RESEND_API_KEY` not set (returns `dev-skipped`)
- No audit log written after send
- No preference check before send

#### B. OTP Delivery — `packages/otp/`

Multi-channel OTP with waterfall: SMS (Termii) → WhatsApp (Meta Cloud v18 / 360dialog) → Telegram Bot.

**Key facts confirmed:**
- 6-digit cryptographically secure OTP (rejection-sampling for uniform distribution)
- SHA-256 hashed (PLATFORM_SALT + OTP); raw OTP never stored in any DB or log
- Channel rate limiting via KV: SMS/WhatsApp 5/hr, Telegram/Email 3/hr
- Lock after failed attempts: 30 min (non-transaction), 60 min (transaction)
- R8 enforced: transaction OTPs must use SMS; WhatsApp/Telegram blocked for `purpose === 'transaction'`
- Nigerian carrier detection: MTN, Airtel, Glo, 9mobile
- `otp_log` table (migration 0015): hash only, with replay-attack prevention index

**What OTP does NOT do:** No voice fallback. No in-app fallback. No per-tenant branding. No per-tenant channel preferences. No delivery confirmation beyond provider API response.

#### C. Webhook System — `apps/api/src/lib/webhook-dispatcher.ts`

HMAC-SHA256 signed outbound webhooks to tenant-registered endpoints. 4 registered event types: `template.installed`, `template.purchased`, `workspace.member_added`, `payment.completed`.

**Key facts confirmed:**
- `webhook_subscriptions` (migration 0217), `webhook_deliveries` (migration 0218)
- Retry: 3 attempts, exponential backoff (5s, 25s, 125s)
- **Critical:** Retry is inline and blocking in the request handler. Code comment explicitly flags this as "should be Cloudflare Queues but not yet implemented"
- HMAC signing header: `X-WebWaka-Signature: sha256=<hex>`
- Wildcard `*` subscription supported

**What webhook system does NOT do:** No Queues backing. Only 4 event types out of 100+ needed. No health dashboard. No dead-letter inspection. No replay capability.

#### D. Domain Event Bus — `packages/events/`

In-process domain event bus with D1-persisted event log. 16 event types defined. Publisher appends to `event_log` D1 table. Subscriber is an in-memory `Map` cleared on Worker restart.

**Critical gaps:** Zero notification handlers wired. In-memory subscriber is lost on every cold start. No durable Queues consumer yet. No notification events in catalog for claim, payment, or workspace events.

#### E. `apps/projections` — Notification-Adjacent Worker *(AUDIT ADDITION)*

**[Critical current-state finding not in original review]**

`apps/projections` is a deployed Cloudflare Worker with its own wrangler.toml, D1 binding, CRON triggers, and `@webwaka/events` import. It currently:
- Runs an incremental search index rebuild every 15 minutes
- Runs HITL expiry sweep + L3 escalation notification every 4 hours
- Runs daily analytics snapshot
- Exposes `POST /rebuild/search` and `POST /rebuild/analytics` via inter-service auth (`X-Inter-Service-Secret`)

**Implication for notification architecture:** `apps/projections` is the only deployed Worker that currently does anything resembling notification dispatch (HITL L3 escalation). It is the most natural home for a Cloudflare Queue consumer for the notification pipeline. See Open Question OQ-001.

#### F. Monitoring Alert — `apps/api/src/middleware/monitoring.ts`

Error rate threshold (50 errors/min) fires a generic JSON payload to `ALERT_WEBHOOK_URL`. In-memory counters (not durable). Latency threshold (5000ms) logs to console only — no alert. No Slack/Teams formatting.

#### G. Audit Logging — `apps/api/src/middleware/audit-log.ts`

HTTP-level audit trail per authenticated request. Does NOT cover email send attempts, OTP delivery outcomes, notification preference changes, or business event notifications.

#### H. White-Label Theming — `packages/white-label-theming`

Tenant brand tokens (primary color, logo, favicon, font, border radius, custom domain) stored per workspace. CSS var generation. KV cache (300s TTL). **This brand profile is NEVER applied to email templates.** All emails use hardcoded WebWaka branding.

#### I. i18n Package — `packages/i18n` *(AUDIT ADDITION)*

Production-deployed i18n package with typed locale keys and 6 language files: English, Hausa, Yorùbá, Igbo, Nigerian Pidgin, and French. `detectLocale(request)` resolves locale from `?lang=` param → `Accept-Language` header → `'en'` fallback. **This package must be used as the canonical locale resolution mechanism for notification templates.** Inventing a parallel locale system violates P1 (Build Once Use Infinitely).

### 4.2 What Partially Exists

| Capability | State |
|---|---|
| Email delivery | Exists; no tenant branding, no tracking, no preferences, no versioned templates |
| OTP delivery | Good; no per-tenant customization, no voice fallback |
| Webhook outbound | Works; inline-blocking retry, only 4 event types, no Queues backing |
| Domain event bus | Schema and publisher exist; in-memory subscriber lost on restart; zero notification handlers |
| Monitoring alert | Single webhook; not Slack-formatted; in-memory only |
| Audit logging | HTTP level only; no notification-specific trail |
| Brand/theme system | Token system exists; never applied to outbound communications |
| HITL escalation | Partially exists in `apps/projections` CRON; not unified with any notification pipeline |

### 4.3 Silent Workflow Gaps

The following live routes and FSMs perform zero notification sends at any state transition. All are confirmed by code inspection:

| Route / System | Zero-notification transitions |
|---|---|
| `billing.ts` | Plan change, cancel, revert-cancel, grace period entry, suspension |
| `payments.ts` | Payment failure |
| `onboarding.ts` | Step completion, checklist completion |
| `support.ts` | Ticket creation, status change, assignment, resolution, comment |
| `negotiation.ts` + expiry job | Session creation, offers, acceptance, rejection, expiry |
| `bank-transfer.ts` *(AUDIT ADDITION)* | Order created, proof submitted, confirmed, rejected, expired, dispute raised, dispute resolved |
| `b2b-marketplace.ts` *(AUDIT ADDITION)* | RFQ submitted, RFQ responded, order confirmed |
| `airtime.ts` *(AUDIT ADDITION)* | Top-up completed, top-up failed |
| `transport.ts` *(AUDIT ADDITION)* | Motor park FSM change, rideshare FSM change, route licensed |
| `partners.ts` *(AUDIT ADDITION)* | Partner registered, status changed, entitlement granted, sub-partner created |
| `fx-rates.ts` | Significant rate update |
| All 160+ verticals | Every order, appointment, payment, delivery, stock event |

---

## 5. CANONICAL NOTIFICATION EVENT CATALOG

**Naming convention (mandatory):** `{domain}.{aggregate}.{action}` — all lowercase, dot-separated, no underscores except within action words. Example: `auth.user.registered`, `billing.subscription.suspended`.

**Legend:**
- Channels: `E`=Email `S`=SMS `W`=WhatsApp `T`=Telegram `P`=Push `I`=In-App `K`=Webhook
- RT = Real-time (immediate); Digest = can be batched
- Status: `EXISTS` (code emits), `PARTIAL` (partial implementation), `MISSING` (zero implementation)

---

### Domain: auth.identity

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `auth.user.registered` | POST /auth/register | system | user | user | E, I | info | RT | NDPR | auth.welcome | PARTIAL |
| `auth.user.email_verification_sent` | POST /auth/send-verification | user | user | user | E | info | RT | NDPR | auth.verify_email | PARTIAL |
| `auth.user.email_verified` | GET /auth/verify-email | user | user | user | E, I | info | RT | NDPR | auth.email_verified | MISSING |
| `auth.user.password_reset_requested` | POST /auth/forgot-password | user | user | user | E | high | RT | NDPR, Sec | auth.password_reset | PARTIAL |
| `auth.user.password_reset_completed` | POST /auth/reset-password | user | user | user | E, I | high | RT | NDPR, Sec | auth.password_changed | MISSING |
| `auth.user.password_changed` | POST /auth/change-password | user | user | user | E, I | high | RT | Security | auth.password_changed | MISSING |
| `auth.user.login_success` | POST /auth/login | user | user | user | I | info | Digest | Security | auth.login | MISSING |
| `auth.user.login_failed` | POST /auth/login | unknown | account | workspace_admins | I | warn | Digest | Security | auth.security_alert | MISSING |
| `auth.user.account_locked` | OTP lock / auth system | system | user | user, admin | E, S, I | critical | RT | Security | auth.account_locked | MISSING |
| `auth.user.profile_updated` | PATCH /auth/profile | user | user | user | I | info | Digest | NDPR | auth.profile_update | MISSING |
| `auth.user.data_erased` | DELETE /auth/me | user | user | user, super_admin | E, I | high | RT | NDPR Art.3.1(9) | auth.data_erasure | MISSING |
| `auth.session.revoked` | DELETE /auth/sessions/:id | user | session | user | I | warn | RT | Security | auth.session_revoked | MISSING |
| `auth.session.all_revoked` | DELETE /auth/sessions | user | user | user | E, I | warn | RT | Security | auth.session_revoked | MISSING |
| `auth.api_key.created` | POST /auth/api-keys *(AUDIT ADDITION)* | user | api_key | user | I | info | RT | Security | auth.api_key | MISSING |
| `auth.api_key.revoked` | DELETE /auth/api-keys/:id *(AUDIT ADDITION)* | user | api_key | user | E, I | warn | RT | Security | auth.api_key | MISSING |

---

### Domain: workspace.membership

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `workspace.workspace.created` | POST /auth/register | user | workspace | user, super_admin | E, I | info | RT | — | workspace.created | PARTIAL |
| `workspace.invite.sent` | POST /auth/invite | admin | user | invitee | E | info | RT | — | workspace.invite | PARTIAL |
| `workspace.invite.accepted` | POST /auth/accept-invite | user | workspace | admin | E, I | info | RT | — | workspace.member_joined | MISSING |
| `workspace.invite.expired` | Cron / system | system | invite | admin | I | warn | Digest | — | workspace.invite_expired | MISSING |
| `workspace.member.added` | webhook event | admin | user | new_member, admin | E, I, K | info | RT | — | workspace.member_joined | PARTIAL |
| `workspace.member.removed` | admin action | admin | user | removed_user | E, I | warn | RT | — | workspace.member_removed | MISSING |
| `workspace.member.role_changed` | admin action | admin | user | affected_user | I | info | RT | — | workspace.role_changed | MISSING |
| `workspace.branding.updated` | admin action | admin | workspace | admin | I | info | Digest | — | workspace.branding | MISSING |
| `workspace.workspace.activated` | payment verified | system | workspace | admin | E, I | info | RT | — | workspace.activated | PARTIAL |
| `workspace.workspace.suspended` | billing enforcement | system | workspace | admin | E, S, I | critical | RT | — | workspace.suspended | MISSING |
| `workspace.workspace.deprovisioned` | admin action | admin | workspace | admin | E, I | critical | RT | NDPR | workspace.deprovisioned | MISSING |

---

### Domain: billing.subscription

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `billing.payment.initialized` | POST /workspaces/:id/upgrade | user | payment | user | I | info | RT | — | billing.payment_started | PARTIAL |
| `billing.payment.completed` | POST /payments/verify | system | payment | user | E, I, K | high | RT | Tax | billing.payment_confirmed | PARTIAL |
| `billing.payment.failed` | POST /payments/verify | system | payment | user | E, S, I | critical | RT | Tax | billing.payment_failed | PARTIAL |
| `billing.subscription.plan_changed` | POST /billing/change-plan | admin | subscription | admin | E, I | info | RT | — | billing.plan_changed | MISSING |
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

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `kyc.user.otp_sent` | POST /identity/otp | system | user | user | S, W, T | info | RT | NDPR, CBN | otp.delivery | PARTIAL |
| `kyc.user.otp_verified` | POST /identity/verify-otp | user | user | user | I | info | RT | CBN | kyc.verified | MISSING |
| `kyc.user.tier_upgraded` | KYC verification result | system | user | user | E, I | info | RT | CBN NRBVR | kyc.tier_change | MISSING |
| `kyc.user.bvn_verified` | Prembly webhook → inbound | system | user | user | E, I | info | RT | CBN, NDPR | kyc.bvn_verified | MISSING |
| `kyc.user.nin_verified` | Prembly webhook → inbound | system | user | user | E, I | info | RT | CBN, NDPR | kyc.nin_verified | MISSING |
| `kyc.user.limit_blocked` | Transaction attempt | system | user | user | I, S | warn | RT | CBN | kyc.limit_blocked | MISSING |

---

### Domain: partner.ecosystem *(AUDIT ADDITION — M11 fully live)*

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `partner.partner.registered` | POST /partners | super_admin | partner | super_admin | E, I | info | RT | — | partner.registered | MISSING |
| `partner.partner.status_changed` | PATCH /partners/:id/status | super_admin | partner | partner_admin | E, I | high | RT | — | partner.status | MISSING |
| `partner.entitlement.granted` | POST /partners/:id/entitlements | super_admin | partner | partner_admin | E, I | info | RT | — | partner.entitlement | MISSING |
| `partner.sub_partner.created` | POST /partners/:id/sub-partners | super_admin | sub_partner | partner_admin | E, I | info | RT | — | partner.sub_partner | MISSING |
| `partner.sub_partner.status_changed` | PATCH /partners/:id/sub-partners/:subId/status | super_admin | sub_partner | partner_admin | E, I | high | RT | — | partner.sub_partner | MISSING |
| `partner.credit.allocated` | Credit allocation | super_admin | credit_bundle | partner_admin | E, I | info | RT | — | partner.credit | MISSING |

---

### Domain: bank_transfer.payment *(AUDIT ADDITION — financial-critical FSM)*

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `bank_transfer.order.created` | POST /bank-transfer | user | order | buyer, seller | E, S, I | info | RT | Tax | bank_transfer.order | MISSING |
| `bank_transfer.proof.submitted` | POST /bank-transfer/:id/proof | user | order | seller | E, S, I | high | RT | Tax | bank_transfer.proof | MISSING |
| `bank_transfer.order.confirmed` | POST /bank-transfer/:id/confirm | admin/seller | order | buyer | E, S, I | high | RT | Tax | bank_transfer.confirmed | MISSING |
| `bank_transfer.order.rejected` | POST /bank-transfer/:id/reject | admin/seller | order | buyer | E, S, I | high | RT | Tax | bank_transfer.rejected | MISSING |
| `bank_transfer.order.expired` | Scheduled expiry | system | order | buyer, seller | E, S, I | high | RT | Tax | bank_transfer.expired | MISSING |
| `bank_transfer.dispute.raised` | POST /bank-transfer/:id/dispute | user | dispute | buyer, seller, admin | E, I | high | RT | Tax, Legal | bank_transfer.dispute | MISSING |
| `bank_transfer.dispute.resolved` | Dispute resolution | admin | dispute | buyer, seller | E, I | high | RT | Tax, Legal | bank_transfer.dispute_resolved | MISSING |

---

### Domain: b2b.marketplace *(AUDIT ADDITION)*

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `b2b.rfq.submitted` | B2B RFQ route | user | rfq | supplier | E, I | info | RT | Tax | b2b.rfq | MISSING |
| `b2b.rfq.responded` | B2B RFQ route | user | rfq | buyer | E, I | info | RT | Tax | b2b.rfq_response | MISSING |
| `b2b.order.confirmed` | B2B order route | user | order | buyer, supplier | E, I, K | high | RT | Tax | b2b.order | MISSING |

---

### Domain: airtime *(AUDIT ADDITION)*

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `airtime.topup.completed` | POST /airtime (success) | system | topup | user | I, S | info | RT | — | airtime.receipt | MISSING |
| `airtime.topup.failed` | POST /airtime (failure) | system | topup | user | I, S | warn | RT | — | airtime.failed | MISSING |

---

### Domain: transport.vertical *(AUDIT ADDITION)*

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `transport.motorpark.status_changed` | POST /transport/motor-park/:id/transition | admin | motorpark | operator | E, I | info | RT | — | transport.status | MISSING |
| `transport.rideshare.status_changed` | POST /transport/rideshare/:id/transition | admin | rideshare | driver | I | info | RT | — | transport.status | MISSING |
| `transport.route.licensed` | POST /transport/routes/:id/license | admin | route | operator | E, I | info | RT | — | transport.licensed | MISSING |

---

### Domain: fx.rates *(AUDIT ADDITION)*

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `fx.rate.significant_change` | Rate monitoring | system | fx_rate | subscribed_tenants | I | warn | Digest | CBN | fx.alert | MISSING |

---

### Domain: claim.profile

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `claim.claim.intent_captured` | Claim route | user | claim | user, admin | I | info | RT | — | claim.intent | PARTIAL |
| `claim.claim.advanced` | Claim route | admin | claim | user | E, I | info | RT | — | claim.advanced | PARTIAL |
| `claim.claim.approved` | Claim route | admin | claim | user | E, I | high | RT | — | claim.approved | PARTIAL |
| `claim.claim.rejected` | Claim route | admin | claim | user | E, I | high | RT | — | claim.rejected | PARTIAL |
| `claim.claim.evidence_requested` | Admin action | admin | user | user | E, I | warn | RT | — | claim.evidence_request | MISSING |
| `claim.document.uploaded` | Claim route *(AUDIT ADDITION)* | user | document | admin | I | info | RT | — | claim.document | MISSING |
| `claim.claim.counter_claimed` | Claim route *(AUDIT ADDITION)* | user | claim | claimant, admin | E, I | high | RT | — | claim.counter | MISSING |

---

### Domain: negotiation

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `negotiation.session.created` | Negotiation route | user | session | counterparty | I, S | info | RT | — | negotiation.created | MISSING |
| `negotiation.session.offer_updated` | Negotiation route | user | session | counterparty | I, S | info | RT | — | negotiation.offer | MISSING |
| `negotiation.session.accepted` | Negotiation route | user | session | both_parties | E, I, S | high | RT | — | negotiation.accepted | MISSING |
| `negotiation.session.rejected` | Negotiation route | user | session | initiator | I, S | warn | RT | — | negotiation.rejected | MISSING |
| `negotiation.session.expired` | Cron job | system | session | both_parties | I, S | warn | RT | — | negotiation.expired | MISSING |
| `negotiation.session.cancelled` | Admin/cron | system | session | both_parties | I, S | warn | RT | — | negotiation.cancelled | MISSING |
| `negotiation.payment.timeout` | Cron job | system | session | initiator | E, S, I | high | RT | — | negotiation.payment_timeout | MISSING |

---

### Domain: support

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `support.ticket.created` | POST /support/tickets | user | ticket | admin, super_admin | E, I | info | RT | — | support.ticket_created | MISSING |
| `support.ticket.status_changed` | PATCH /support/tickets/:id | admin | ticket | ticket_creator | E, I | info | RT | — | support.status_update | MISSING |
| `support.ticket.assigned` | PATCH /support/tickets/:id | admin | ticket | assignee | E, I | info | RT | — | support.assigned | MISSING |
| `support.ticket.resolved` | PATCH /support/tickets/:id | admin | ticket | ticket_creator | E, I | info | RT | — | support.resolved | MISSING |
| `support.ticket.comment_added` | Support route | user/admin | comment | other_parties | I | info | Digest | — | support.comment | MISSING |

---

### Domain: templates.marketplace

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `template.template.published` | POST /templates (super_admin) | super_admin | template | all_tenants | I | info | Digest | — | marketplace.published | MISSING |
| `template.template.installed` | POST /templates/:slug/install | user | install | admin, K | I, K | info | RT | — | marketplace.installed | PARTIAL |
| `template.template.purchased` | POST /templates/:slug/purchase/verify | user | purchase | user, K | E, K | info | RT | Tax | marketplace.purchased | PARTIAL |
| `template.template.install_rolled_back` | DELETE /templates/:slug/install | admin | install | admin | I | warn | RT | — | marketplace.rollback | MISSING |
| `template.template.update_available` | Version check | system | template | installing_tenants | I | info | Digest | — | marketplace.update | MISSING |

---

### Domain: ai.superagent

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `ai.consent.granted` | POST /superagent/consent | user | consent | user | I | info | RT | NDPR P10 | ai.consent | MISSING |
| `ai.consent.revoked` | DELETE /superagent/consent | user | consent | user | E, I | info | RT | NDPR P10 | ai.consent_revoked | MISSING |
| `ai.credit.exhausted` | Credit burn fails | system | wallet | user, admin | E, I | critical | RT | — | ai.credit_exhausted | MISSING |
| `ai.credit.low` | Usage threshold check | system | wallet | admin | E, I | warn | RT | — | ai.credit_low | MISSING |
| `ai.request.hitl_escalated` | HITL service | system | request | admin | E, I | high | RT | — | ai.hitl | MISSING (partial: projections CRON) |
| `ai.hitl.request_expired` | apps/projections CRON *(AUDIT ADDITION)* | system | request | admin | E, I | high | RT | — | ai.hitl_expired | PARTIAL (exists in projections, not unified) |
| `ai.hitl.escalated_to_l3` | apps/projections CRON *(AUDIT ADDITION)* | system | request | super_admin | E, I | critical | RT | — | ai.l3_escalation | PARTIAL (exists in projections, not unified) |
| `ai.provider.failover` | resolveAdapter | system | provider | super_admin | I | warn | RT | — | ai.provider_alert | MISSING |
| `ai.recommendation.generated` | SuperAgent chat | system | recommendation | user | I | info | Digest | NDPR | ai.recommendation | MISSING |

---

### Domain: onboarding

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `onboarding.step.completed` | PUT /onboarding/:id/:step | user | workspace | admin | I | info | Digest | — | onboarding.progress | MISSING |
| `onboarding.checklist.completed` | Last step | user | workspace | admin | E, I | info | RT | — | onboarding.complete | MISSING |
| `onboarding.step.stalled` | Scheduled job | system | workspace | admin | E, I | warn | Digest | — | onboarding.nudge | MISSING |

---

### Domain: pos.finance

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `pos.transaction.completed` | POS routes | user | transaction | user | I, S | info | RT | Tax | pos.receipt | MISSING |
| `pos.transaction.failed` | POS routes | system | transaction | user | I, S | warn | RT | — | pos.failed | MISSING |
| `pos.float.low` | Float ledger check | system | float | manager | I, S | warn | RT | — | pos.float_alert | MISSING |
| `pos.reconciliation.ready` | Reconciliation route | system | batch | manager | E, I | info | Digest | Tax | pos.reconciliation | MISSING |

---

### Domain: social.engagement

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `social.post.liked` | Social routes | user | post | post_author | I | info | Digest | — | social.engagement | MISSING |
| `social.post.commented` | Social routes | user | comment | post_author | I | info | Digest | — | social.engagement | MISSING |
| `social.profile.followed` | Social routes | user | profile | target_user | I | info | Digest | — | social.follow | MISSING |
| `social.community.member_joined` | Community routes | user | community | community_admin | I | info | Digest | — | community.member | MISSING |
| `social.community.post_created` | Community routes | user | post | members | I | info | Digest | — | community.post | MISSING |

---

### Domain: vertical.canonical *(applies to all 160+ vertical packages)*

These 8 canonical events apply to all verticals. Each vertical package should emit these where applicable.

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Template Family |
|---|---|---|---|---|---|---|---|---|
| `vertical.order.created` | Order route | user | order | merchant, customer | E, S, I | info | RT | vertical.order |
| `vertical.order.status_changed` | Order route | system | order | customer | E, S, I | info | RT | vertical.order_status |
| `vertical.appointment.booked` | Appointment route | user | appointment | provider, customer | E, S, I | info | RT | vertical.appointment |
| `vertical.appointment.reminder` | Scheduled job | system | appointment | customer | S, W, I | info | RT | vertical.reminder |
| `vertical.payment.received` | POS / payment route | user | payment | merchant | E, I | info | RT | vertical.payment |
| `vertical.stock.low` | Inventory check | system | product | merchant | E, I | warn | Digest | vertical.stock |
| `vertical.delivery.dispatched` | Logistics route | user | delivery | customer | S, W, I | info | RT | vertical.delivery |
| `vertical.delivery.arrived` | Logistics route | system | delivery | customer | S, W, I | info | RT | vertical.delivery |

---

### Domain: system.infrastructure

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `system.error_rate.spike` | monitoring middleware | system | api | super_admin | K (Slack/Teams) | critical | RT | — | system.alert | PARTIAL |
| `system.latency.degraded` | monitoring middleware | system | api | super_admin | I | warn | RT | — | system.alert | MISSING |
| `system.migration.applied` | CI/CD | system | database | super_admin | I | info | Digest | — | system.infra | MISSING |
| `system.provider.down` | Health check | system | provider | super_admin | E, K | critical | RT | — | system.provider_alert | MISSING |

---

### Domain: governance.compliance

| Event Key | Trigger | Actor Type | Subject | Audience | Channels | Severity | RT/Digest | Compliance | Template Family | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `governance.audit.exported` | Admin action | admin | audit_log | super_admin | E, I | info | RT | NDPR | governance.audit | MISSING |
| `governance.data_breach.suspected` | Security system | system | users | super_admin, legal | E, K | critical | RT | NDPR Art.2.6 | governance.breach | MISSING |
| `governance.consent.updated` | User action | user | consent | user, admin | E, I | info | RT | NDPR | governance.consent | MISSING |
| `governance.retention.expiring` | Scheduled job | system | data | admin | I | warn | Digest | NDPR | governance.retention | MISSING |

---

**Total canonical events: ~110** across 15 domains.

---

## 6. MISSING ELEMENTS LIST

### 6.1 Architecture Gaps

| Gap | Severity | Audit Status |
|---|---|---|
| Reliable event capture (transactional outbox) | Critical | Confirmed missing |
| Durable event transport (CF Queues not provisioned) | Critical | **[AUDIT ADDITION]** Confirmed: wrangler.toml has zero queue bindings |
| Notification rule engine | Critical | Confirmed missing |
| Preference resolution pipeline | Critical | Confirmed missing |
| Tenant/brand context in delivery | Critical | Confirmed missing |
| CF Queues consumer Worker not decided | Critical | **[AUDIT ADDITION]** See OQ-001 |
| Dead-letter queue (app-level; CF Queues has no native DLQ) | High | **[AUDIT ADDITION]** CF Queues constraint — requires application-level implementation |
| Real-time push requires Durable Objects or polling | High | **[AUDIT ADDITION]** Stateless Workers cannot hold long-lived connections without DO |
| Idempotency at notification level | High | Confirmed missing |
| Notification inbox persistence | High | Confirmed missing |
| Digest/batching engine | High | Confirmed missing |
| Fallback channel ordering (non-OTP) | Medium | Confirmed missing |
| Quiet hours / timezone-aware DND | High | Nigeria-first platform; Africa/Lagos is default; deferred send requires CRON sweep or Queue delay |
| Notification scheduling (deferred delivery) | Medium | Confirmed missing |
| Multi-level brand context (Platform → Partner → Sub-Partner → Tenant) | High | **[AUDIT ADDITION]** Only Platform → Tenant is modelled |
| `@webwaka/i18n` not connected to template system | High | **[AUDIT ADDITION]** Exists with 6 production locales; must be used (P1 violation otherwise) |
| USSD notification queuing strategy | Medium | **[AUDIT ADDITION]** See OQ-009 |
| Escalation policy engine | Medium | Confirmed missing |

### 6.2 Product/Feature Gaps

| Gap | Description |
|---|---|
| In-app notification center | No `notification_inbox` table, no UI, no read/unread/archived state |
| Notification preferences UI | No way for users or tenants to manage channel preferences |
| Template editor (tenant-facing) | No tenant-customizable notification templates |
| Delivery status tracking | Open, click, bounce, unsubscribe not tracked |
| Push notifications | No web push; no mobile push |
| Digest emails | No daily/weekly digest capability |
| 160+ vertical business events | All produce zero notifications |
| Partner ecosystem notifications | M11 live; zero notification wiring |
| Bank-transfer payment notifications | High-value FSM fully silent |
| Marketing campaign capability | No campaign or batch-send capability |
| Sandbox/test mode delivery | Staging could send to real users without a sandbox mode |
| WhatsApp template pre-approval workflow | Meta requires pre-approved templates; no submission/tracking workflow exists |
| Sender domain verification UX | Resend requires DNS verification per custom domain; no tracking or fallback |

### 6.3 Data Model Gaps

No schema exists in any of the 253 migration files for the following (confirmed):

- `notification_event` — normalized trigger record
- `notification_rule` — routing policy
- `notification_preference` — scoped preferences (platform/tenant/role/user)
- `notification_template` — versioned, multi-channel templates
- `notification_delivery` — delivery lifecycle tracking
- `notification_inbox_item` — per-user in-app notification store
- `notification_digest_batch` + `notification_digest_batch_item` — digest grouping
- `notification_audit_log` — immutable send audit trail
- `notification_subscription` — user-controlled topic opt-ins
- `notification_suppression_list` — bounce/unsubscribe suppression *(AUDIT ADDITION)*
- `escalation_policy` — SLA-driven escalation rules
- `channel_provider` — abstracted provider config (with secure credential reference)
- `push_token` — web/mobile push token registry

### 6.4 Governance and Compliance Gaps

| Gap | Description |
|---|---|
| Consent gating for marketing | No transactional-vs-marketing distinction; NDPR requires explicit consent for marketing |
| Email unsubscribe handling | No `List-Unsubscribe` header; no unsubscribe endpoint; no suppression list |
| Data retention policy | **[AUDIT ADDITION]** 13 notification tables will grow indefinitely; no TTL, archival, or NDPR deletion cascade |
| Notification audit trail | No record of who was notified of what, when, and via which channel |
| Preference change audit | No record of preference changes (required for NDPR accountability) |
| Suppression list management | No global or tenant-level suppression for bounced/unsubscribed addresses |
| NDPR data subject access for notifications | Cannot answer "what notifications did we send this user?" |
| Template accessibility | No `aria` labels, no plain-text version alongside HTML |
| Attribution enforcement | white-label-policy.md defines WebWaka attribution rules per plan tier; templates have no enforcement mechanism |
| Provider credential exposure | **[AUDIT ADDITION / SECURITY CRITICAL]** Original design stored credentials in D1 plaintext; corrected in this spec |

### 6.5 Observability and Operations Gaps

| Gap | Description |
|---|---|
| Delivery metrics | No send volume, delivery rate, bounce rate, open rate metrics |
| Provider health dashboard | No per-channel provider health monitoring |
| Dead-letter inspection tooling | No tooling to inspect, replay, or dismiss failed notifications |
| Notification trace IDs | No `correlation_id` linking business transaction → notification → delivery |
| Alert fatigue controls | No deduplication, no per-recipient cooldown |
| Template preview | No way to preview rendered templates before sending |
| Sandbox/test mode | No mechanism to isolate staging sends from real addresses |

### 6.6 Infrastructure Gaps *(AUDIT ADDITION)*

| Gap | Severity |
|---|---|
| CF Queues not provisioned in `apps/api/wrangler.toml` | Critical — blocks all durable transport work |
| No consumer Worker defined for Queue | Critical — see OQ-001 |
| `apps/projections` HITL escalation path not unified | High — see OQ-002 |
| D1 write throughput limits under notification load | Medium — D1 ~50 writes/sec; high-volume vertical events may saturate |

---

## 7. CANONICAL DOMAIN MODEL

### Entities Overview

| Entity | Purpose | T3 Scoped |
|---|---|---|
| `notification_event` | Normalized trigger record | Yes |
| `notification_rule` | Event-to-audience-to-channel routing | Nullable (platform default) |
| `notification_preference` | Scoped preference overrides | Yes (role/user scope) |
| `notification_template` | Versioned multi-channel templates | Nullable (platform default) |
| `notification_delivery` | Full delivery lifecycle | Yes |
| `notification_inbox_item` | In-app notification center | Yes |
| `notification_digest_batch` | Digest grouping metadata | Yes |
| `notification_digest_batch_item` | Digest event join table *(AUDIT ADDITION)* | Yes |
| `notification_audit_log` | Immutable send audit trail | Yes |
| `notification_subscription` | User-controlled topic opt-ins | Yes |
| `notification_suppression_list` | Bounce/unsubscribe suppression *(AUDIT ADDITION)* | Nullable (platform global) |
| `escalation_policy` | SLA-driven escalation rules | Nullable (platform default) |
| `channel_provider` | Provider config + credential reference *(SECURITY CORRECTED)* | Nullable (platform default) |
| `push_token` | Web/mobile push token registry | Yes |

---

### `notification_event`

```sql
id                  TEXT PRIMARY KEY          -- notif_evt_<uuid>
event_key           TEXT NOT NULL             -- e.g. 'auth.user.registered' (domain.aggregate.action)
domain              TEXT NOT NULL             -- e.g. 'auth', 'billing', 'bank_transfer'
aggregate_type      TEXT NOT NULL             -- e.g. 'user', 'workspace', 'subscription'
aggregate_id        TEXT NOT NULL             -- affected entity ID
tenant_id           TEXT NOT NULL             -- T3: always required
actor_type          TEXT NOT NULL             -- 'user'|'system'|'admin'|'unknown'
actor_id            TEXT                      -- nullable for system-sourced events
subject_type        TEXT                      -- what the notification is about
subject_id          TEXT                      -- subject entity ID
payload             TEXT NOT NULL             -- JSON: event-specific context variables
correlation_id      TEXT                      -- links to originating business transaction
severity            TEXT NOT NULL DEFAULT 'info'  -- 'info'|'warn'|'high'|'critical'
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
processed_at        INTEGER                   -- when rule engine processed it
```

Indexes: `(tenant_id, event_key)`, `(aggregate_type, aggregate_id)`, `(created_at)`, `(processed_at)`

---

### `notification_rule`

```sql
id                  TEXT PRIMARY KEY          -- rule_<uuid>
tenant_id           TEXT                      -- NULL = platform default; tenant override takes precedence
event_key           TEXT NOT NULL
rule_name           TEXT NOT NULL
enabled             INTEGER NOT NULL DEFAULT 1
audience_type       TEXT NOT NULL             -- 'actor'|'subject'|'workspace_admins'|'tenant_admins'|'all_members'|'super_admins'|'partner_admins'|'custom'
audience_filter     TEXT                      -- JSON: additional filter conditions
channels            TEXT NOT NULL             -- JSON array: ['email','sms','push','in_app']
channel_fallback    TEXT                      -- JSON ordered fallback chain
template_family     TEXT NOT NULL
priority            TEXT NOT NULL DEFAULT 'normal'  -- 'low'|'normal'|'high'|'critical'
digest_eligible     INTEGER NOT NULL DEFAULT 0
min_severity        TEXT NOT NULL DEFAULT 'info'
feature_flag        TEXT                      -- gate on platform feature flag
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

Indexes: `(tenant_id, event_key, enabled)`, `(tenant_id)`

---

### `notification_preference`

```sql
id                  TEXT PRIMARY KEY          -- pref_<uuid>
scope_type          TEXT NOT NULL             -- 'platform'|'tenant'|'role'|'user'
scope_id            TEXT NOT NULL             -- platform_id|tenant_id|role_name|user_id
tenant_id           TEXT NOT NULL             -- T3: required for role/user scopes; 'platform' for platform scope
event_key           TEXT NOT NULL             -- '*' for all-events catch-all
channel             TEXT NOT NULL             -- 'email'|'sms'|'push'|'in_app'|'*'
enabled             INTEGER NOT NULL DEFAULT 1
quiet_hours_start   INTEGER                   -- 0-23 local hour
quiet_hours_end     INTEGER                   -- 0-23 local hour
timezone            TEXT DEFAULT 'Africa/Lagos'
digest_window       TEXT                      -- 'none'|'hourly'|'daily'|'weekly'
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

**Inheritance chain:** platform → tenant → role → user. More specific scope wins. KV-cached at hot path (5-min TTL; key MUST be prefixed `{tenant_id}:pref:` to enforce T3).

Indexes: `(scope_type, scope_id, event_key, channel)`, `(tenant_id, scope_type)`

---

### `notification_template`

```sql
id                    TEXT PRIMARY KEY          -- tpl_notif_<uuid>
tenant_id             TEXT                      -- NULL = platform default; tenant_id = tenant override
template_family       TEXT NOT NULL
channel               TEXT NOT NULL             -- 'email'|'sms'|'whatsapp'|'telegram'|'push'|'in_app'
locale                TEXT NOT NULL DEFAULT 'en'  -- MUST match SupportedLocale in @webwaka/i18n
version               INTEGER NOT NULL DEFAULT 1
status                TEXT NOT NULL DEFAULT 'draft'  -- 'draft'|'active'|'deprecated'
whatsapp_approval_status  TEXT DEFAULT 'not_required'
  -- 'not_required'|'pending_meta_approval'|'meta_approved'|'meta_rejected'  [AUDIT ADDITION]
subject_template      TEXT                      -- email/push subject (Handlebars variables)
body_template         TEXT NOT NULL
preheader_template    TEXT                      -- email only
cta_label             TEXT
cta_url_template      TEXT
variables_schema      TEXT NOT NULL             -- JSON Schema for required variables
created_by            TEXT
published_at          INTEGER
created_at            INTEGER NOT NULL DEFAULT (unixepoch())
updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
```

**Locale values** must match `SupportedLocale` from `@webwaka/i18n`: `'en'|'ha'|'yo'|'ig'|'pcm'|'fr'`  
**WhatsApp constraint:** dispatching a WhatsApp channel template requires `whatsapp_approval_status = 'meta_approved'`

Indexes: `(tenant_id, template_family, channel, locale, status)`, UNIQUE `(tenant_id, template_family, channel, locale, version)`

---

### `notification_delivery`

```sql
id                    TEXT PRIMARY KEY          -- delivery_<uuid>
notification_event_id TEXT NOT NULL
tenant_id             TEXT NOT NULL             -- T3
recipient_id          TEXT NOT NULL             -- user_id
recipient_type        TEXT NOT NULL             -- 'user'|'admin'|'system'
channel               TEXT NOT NULL
provider              TEXT NOT NULL             -- 'resend'|'termii'|'meta_wa'|'360dialog'|'telegram'|'fcm'|'apns'|'internal'
template_id           TEXT NOT NULL
status                TEXT NOT NULL DEFAULT 'queued'
  -- 'queued'|'rendering'|'dispatched'|'delivered'|'opened'|'clicked'|'failed'|'suppressed'|'dead_lettered'
provider_message_id   TEXT
attempts              INTEGER NOT NULL DEFAULT 0
last_error            TEXT
created_at            INTEGER NOT NULL DEFAULT (unixepoch())   -- [AUDIT ADDITION]
queued_at             INTEGER NOT NULL DEFAULT (unixepoch())
dispatched_at         INTEGER
delivered_at          INTEGER
opened_at             INTEGER
clicked_at            INTEGER
failed_at             INTEGER
idempotency_key       TEXT UNIQUE
correlation_id        TEXT
```

Indexes: `(tenant_id, recipient_id, channel)`, `(tenant_id, status)`, `(idempotency_key)`, `(notification_event_id)`, `(created_at)`

---

### `notification_inbox_item`

```sql
id                    TEXT PRIMARY KEY          -- inbox_<uuid>
tenant_id             TEXT NOT NULL             -- T3
user_id               TEXT NOT NULL
notification_event_id TEXT NOT NULL
delivery_id           TEXT NOT NULL             -- [AUDIT ADDITION] FK to notification_delivery for traceability
title                 TEXT NOT NULL
body                  TEXT NOT NULL
cta_url               TEXT
icon_type             TEXT DEFAULT 'info'       -- 'info'|'warn'|'success'|'error'
category              TEXT                      -- 'billing'|'auth'|'workspace'|'partner'|'vertical'|etc.
read_at               INTEGER
archived_at           INTEGER
pinned_at             INTEGER
dismissed_at          INTEGER
snoozed_until         INTEGER
created_at            INTEGER NOT NULL DEFAULT (unixepoch())
expires_at            INTEGER
```

Indexes: `(tenant_id, user_id, read_at)`, `(tenant_id, user_id, created_at DESC)`, `(tenant_id, user_id, archived_at)`

---

### `notification_digest_batch`

```sql
id                  TEXT PRIMARY KEY          -- digest_<uuid>
tenant_id           TEXT NOT NULL
recipient_id        TEXT NOT NULL
channel             TEXT NOT NULL
digest_window       TEXT NOT NULL             -- 'hourly'|'daily'|'weekly'
window_start        INTEGER NOT NULL
window_end          INTEGER NOT NULL
status              TEXT NOT NULL DEFAULT 'pending'  -- 'pending'|'sent'|'failed'
sent_at             INTEGER
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

### `notification_digest_batch_item` *(AUDIT ADDITION — replaces JSON array)*

```sql
batch_id            TEXT NOT NULL             -- FK to notification_digest_batch
event_id            TEXT NOT NULL             -- FK to notification_event
tenant_id           TEXT NOT NULL             -- T3
added_at            INTEGER NOT NULL DEFAULT (unixepoch())
PRIMARY KEY (batch_id, event_id)
```

**Rationale:** The original design used `event_ids TEXT -- JSON array`. For social-notification digests, a single batch could accumulate hundreds of event IDs. Storing a JSON array of hundreds of UUIDs in a single D1 TEXT field is a query anti-pattern and a footgun. The join table allows indexed queries without JSON parsing.

---

### `notification_audit_log`

```sql
id                    TEXT PRIMARY KEY          -- naudlog_<uuid>  [CORRECTED: original had Cyrillic typo]
tenant_id             TEXT NOT NULL
event_type            TEXT NOT NULL             -- 'notification.sent'|'notification.failed'|'preference.changed'|'unsubscribe'
actor_id              TEXT
recipient_id          TEXT
channel               TEXT
notification_event_id TEXT
delivery_id           TEXT
metadata              TEXT                      -- JSON: additional context
created_at            INTEGER NOT NULL DEFAULT (unixepoch())
```

**Retention:** 7 years (NDPR accountability requirement). Must be included in NDPR data subject access exports. Must be cascaded on user data erasure request (`actor_id` and `recipient_id` columns must be zeroed out, not deleted). See OQ-006.

---

### `notification_subscription`

```sql
id                    TEXT PRIMARY KEY          -- nsub_<uuid>
tenant_id             TEXT NOT NULL
user_id               TEXT NOT NULL
topic                 TEXT NOT NULL             -- e.g. 'product_updates'|'weekly_digest'|'security_alerts'
channel               TEXT NOT NULL
subscribed            INTEGER NOT NULL DEFAULT 1
consent_captured_at   INTEGER
consent_ip_hash       TEXT
unsubscribed_at       INTEGER
unsubscribe_reason    TEXT
```

---

### `notification_suppression_list` *(AUDIT ADDITION — mandatory)*

```sql
id                  TEXT PRIMARY KEY          -- supr_<uuid>
tenant_id           TEXT                      -- NULL = global platform suppression
channel             TEXT NOT NULL             -- 'email'|'sms'|'whatsapp'
address_hash        TEXT NOT NULL             -- SHA-256(PLATFORM_SALT + normalized_address)
reason              TEXT NOT NULL             -- 'bounced'|'unsubscribed'|'complaint'|'admin_block'
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
UNIQUE (tenant_id, channel, address_hash)
```

**Security:** Raw addresses are never stored. Hash with platform salt before insert and before lookup. Before any email/SMS/WhatsApp dispatch, the address hash must be checked against this table. Sending to a suppressed address violates CAN-SPAM, NDPR, and risks provider account suspension.

---

### `escalation_policy`

```sql
id                  TEXT PRIMARY KEY          -- esc_<uuid>
tenant_id           TEXT
event_key           TEXT NOT NULL
rule_name           TEXT NOT NULL
sla_seconds         INTEGER NOT NULL
escalate_to_type    TEXT NOT NULL             -- 'role'|'user'|'webhook'
escalate_to_id      TEXT NOT NULL
escalation_channel  TEXT NOT NULL
enabled             INTEGER NOT NULL DEFAULT 1
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

---

### `channel_provider` *(SECURITY CORRECTED — ADL-002 compliance)*

```sql
id                  TEXT PRIMARY KEY          -- cprov_<uuid>
tenant_id           TEXT                      -- NULL = platform default
channel             TEXT NOT NULL             -- 'email'|'sms'|'whatsapp'|'push'|'telegram'|'slack'|'webhook'
provider_name       TEXT NOT NULL             -- 'resend'|'termii'|'meta_wa'|'360dialog'|'telegram'|'fcm'
enabled             INTEGER NOT NULL DEFAULT 1
priority            INTEGER NOT NULL DEFAULT 1   -- lower = higher priority (fallback chain)
config              TEXT NOT NULL             -- JSON: NON-SECRET config only (sender IDs, domain names, from addresses)
credentials_kv_key  TEXT                      -- [AUDIT ADDITION / SECURITY] KV key for AES-256-GCM encrypted credentials (ADL-002)
sender_domain_verified  INTEGER DEFAULT 0     -- [AUDIT ADDITION] 1 = DNS verified with provider
sender_domain_verified_at INTEGER
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

**ADL-002 mandate:** Provider API keys (RESEND_API_KEY, TERMII_API_KEY, META_WA_TOKEN, etc.) MUST NOT be stored in the `config` JSON column. They must be stored encrypted (AES-256-GCM) in KV. The `credentials_kv_key` column holds the KV key name under which the encrypted credential bundle is stored. This follows the same pattern as other sensitive secrets on this platform. The `config` column may only hold non-secret configuration: sender email domains, sender display names, alphanumeric SMS sender IDs, WhatsApp phone numbers, and equivalent public identifiers.

---

### `push_token`

```sql
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

### Data Retention Policy *(AUDIT ADDITION)*

| Table | Retention | NDPR Treatment |
|---|---|---|
| `notification_delivery` | 90 days active; archive 1 year | Anonymize `recipient_id` on user erasure |
| `notification_inbox_item` | 365 days or until dismissed | Hard-delete on user erasure |
| `notification_audit_log` | 7 years (NDPR accountability) | Zero `actor_id` / `recipient_id` on erasure (do not delete row) |
| `notification_event` | 90 days | Anonymize `actor_id` on user erasure |
| `notification_preference` | Lifetime of account | Hard-delete on user erasure |
| `notification_subscription` | Lifetime of account | Hard-delete on user erasure; preserve unsubscribed state in suppression_list |
| `notification_suppression_list` | Indefinite (suppression must persist past account deletion) | Cannot delete; zeroing addresses is handled by hashing at insert time |
| `notification_digest_batch` + items | 90 days | Cascade delete with delivery |

---

## 8. REFERENCE ARCHITECTURE

### 8.0 Infrastructure Prerequisites *(AUDIT ADDITION — must complete before Phase 1)*

Before any notification pipeline code is written:

1. **Provision Cloudflare Queues in CF account.** Create `webwaka-notification-queue-staging` and `webwaka-notification-queue-production` in the CF dashboard.

2. **Add producer bindings to `apps/api/wrangler.toml`:**
```toml
[[env.staging.queues.producers]]
binding = "NOTIFICATION_QUEUE"
queue = "webwaka-notification-queue-staging"

[[env.production.queues.producers]]
binding = "NOTIFICATION_QUEUE"
queue = "webwaka-notification-queue-production"
```

3. **Add consumer bindings to the consumer Worker's wrangler.toml** (see OQ-001 for which Worker this is — `apps/projections` or new `apps/notificator`):
```toml
[[env.staging.queues.consumers]]
queue = "webwaka-notification-queue-staging"
max_batch_size = 100
max_batch_timeout = 5
max_retries = 5
dead_letter_queue = ""  # No native CF DLQ — application-level DLQ required (see below)
```

4. **Add `NOTIFICATION_QUEUE` to Env type** in the consumer Worker's `env.ts`.

5. **Decide consumer Worker ownership.** See OQ-001. This decision must be made before queue binding work starts.

---

### 8.1 Full Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: DOMAIN EVENT CAPTURE                                              │
│                                                                             │
│  Domain Action (auth register, payment verified, transfer confirmed, etc.)  │
│      │                                                                      │
│      ▼                                                                      │
│  publishEvent() writes to event_log (D1) in same transaction as business   │
│  record → outbox pattern: event persisted before any notification logic     │
│  [Cloudflare D1 atomic write: business record + event_log in same batch]   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 2: EVENT TRANSPORT                                                    │
│                                                                             │
│  apps/api (producer) → NOTIFICATION_QUEUE (Cloudflare Queue)                │
│  Consumer Worker (apps/projections or new apps/notificator) → processes     │
│  up to 100 messages/batch; 5-second batch timeout; 5 max retries            │
│                                                                             │
│  NOTE: CF Queues has NO native DLQ. On maxRetries exceeded, the consumer    │
│  Worker must write to notification_delivery status='dead_lettered' in D1.   │
│  CF Queues message delay is used for quiet-hours deferred sends.            │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 3: RULE AND POLICY EVALUATION                                         │
│                                                                             │
│  NotificationService loads matching notification_rule(s) for event_key      │
│  → Evaluates: enabled, feature_flag, min_severity                          │
│  → Selects: channels, template_family, channel_fallback                    │
│  → Evaluates: digest_eligible                                               │
│                                                                             │
│  Audience Resolution                                                        │
│  → Resolves audience_type to actual user_id list                           │
│  → All audience queries include tenant_id (T3 enforcement)                 │
│  → Partner admins resolved via partner hierarchy if audience_type =         │
│     'partner_admins'                                                        │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 4: PREFERENCE RESOLUTION                                              │
│                                                                             │
│  For each (recipient, channel):                                             │
│  → Load preference inheritance: platform → tenant → role → user override   │
│  → KV cache hot path (5-min TTL; key prefix: {tenant_id}:pref:)            │
│  → Apply quiet hours (timezone-aware; Africa/Lagos default)                │
│     → Blocked: write to NOTIFICATION_QUEUE with delay until quiet end      │
│     → Critical severity: bypass quiet hours                                │
│  → Apply digest window: group or send immediately                          │
│  → Apply consent gate: marketing topic requires subscribed = 1              │
│  → Apply suppression check: hash address; lookup notification_suppression_list│
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 5: BRAND AND LOCALE CONTEXT RESOLUTION                                │
│                                                                             │
│  Brand Context                                                              │
│  → Load TenantTheme from @webwaka/white-label-theming (KV-cached)           │
│  → Multi-level hierarchy (AUDIT ADDITION):                                 │
│     Sub-Partner workspace: Sub-Partner theme → Parent Partner theme →      │
│     Platform default. Walk hierarchy until a theme is found.               │
│  → Extract: primaryColor, logo, displayName, customDomain, senderIdentity  │
│  → Check plan-tier attribution rule from white-label-policy.md              │
│     → Apply WebWaka attribution in footer if plan requires it              │
│                                                                             │
│  Locale Context (AUDIT ADDITION — uses @webwaka/i18n)                      │
│  → Call detectLocale(request) from @webwaka/i18n                           │
│  → Map to SupportedLocale: 'en'|'ha'|'yo'|'ig'|'pcm'|'fr'                 │
│  → Select template variant by (template_family, channel, locale)           │
│  → Fallback chain: user_locale → 'en' (handled by @webwaka/i18n)           │
│  → DO NOT invent a parallel locale system                                  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 6: TEMPLATE RESOLUTION AND RENDERING                                  │
│                                                                             │
│  Template Resolution (inheritance):                                         │
│  tenant override (same family+channel+locale) → platform default →         │
│  hardcoded fallback string                                                  │
│                                                                             │
│  Variable Binding                                                           │
│  → Merge: event payload + recipient profile + tenant brand context         │
│  → Validate against variables_schema (JSON Schema); fail loudly on missing │
│  → HTML-escape all user-supplied strings                                   │
│  → Validate all URLs against HTTPS allowlist (no javascript: scheme)       │
│                                                                             │
│  Rendering                                                                  │
│  → Email: HTML with tenant CSS vars + logo; auto-generate plain-text       │
│  → SMS: plain-text only; 160 char limit enforced; URL shortening if needed │
│  → WhatsApp: Meta pre-approved template REQUIRED (check whatsapp_approval_status)|
│  → Push: title (50 chars) + body (200 chars) + icon                        │
│  → In-App: HTML subset; no script; no external resources                   │
│  → Rendered HTML cached in KV (30s TTL; keyed by template_id + var_hash)  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 7: DISPATCH                                                           │
│                                                                             │
│  For each (recipient, channel, rendered_content):                           │
│  → Check idempotency_key UNIQUE constraint before dispatch                 │
│  → Write notification_delivery (status: queued) to D1                     │
│  → Check notification_suppression_list (hashed address)                   │
│  → Dispatch via channel provider behind INotificationChannel               │
│  → Update delivery status: dispatched → delivered or failed                │
│  → Record provider_message_id                                              │
│                                                                             │
│  Fallback Channel                                                           │
│  → On provider failure: try next channel in channel_fallback chain         │
│  → Check entitlement tier before dispatch (G19)                            │
│                                                                             │
│  Kill-Switch (AUDIT ADDITION)                                               │
│  → If NOTIFICATION_PIPELINE_ENABLED env var = '0', route directly to       │
│     legacy EmailService (Phase 6 migration rollback path)                  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 8: INBOX AND STATE                                                    │
│                                                                             │
│  → Write notification_inbox_item for in-app channel                        │
│  → Include delivery_id FK for traceability                                 │
│  → Offline PWA sync: Dexie.js-backed offline queue via @webwaka/offline-sync│
│  → State: unread → read → archived / pinned / snoozed                     │
│  → Real-time push: Durable Objects or SSE polling endpoint                 │
│     (plain CF Workers cannot hold long-lived connections — see OQ-010)     │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 9: RETRY, DEAD-LETTER, AUDIT                                          │
│                                                                             │
│  Retry                                                                      │
│  → CF Queue auto-retries up to 5 times with backoff                        │
│  → Per-channel rate limiting before each attempt                           │
│                                                                             │
│  Application-Level Dead-Letter (CF Queues has no native DLQ)               │
│  → After max attempts: mark delivery status='dead_lettered' in D1          │
│  → Write notification_audit_log entry                                       │
│  → Alert super_admin via system.provider.down event                       │
│  → Admin tooling: inspect, replay, dismiss                                 │
│                                                                             │
│  Audit                                                                      │
│  → Write notification_audit_log for every send attempt (success or fail)   │
│  → Write for every preference change                                       │
│  → Structured logs via @webwaka/logging (JSON, CF Logpush)                 │
│  → Metrics: send_volume, delivery_rate, bounce_rate per tenant/channel     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Architecture Decisions

| Decision | Rationale |
|---|---|
| CF Queues for durable dispatch | Code already plans for this. Outbox + Queues = reliable event transport. CF Workers native — no external broker. |
| D1 as notification store | Consistent with platform-wide persistence choice. Tenant-scoped queries. D1 global replication fits Africa-first latency. |
| KV for preference hot-path | Preference reads happen on every notification. 5-min TTL. Must be tenant-prefixed for T3 compliance. |
| Consumer Worker = apps/projections or new Worker | See OQ-001. Not resolved here. Must be decided in Phase 0. |
| Application-level DLQ | CF Queues has no native DLQ. Status='dead_lettered' in D1 + admin tooling. |
| `@webwaka/i18n` for locale | Existing production package with 6 locales. P1 violation to reinvent. |
| Multi-level brand walk | Platform → Partner → Sub-Partner → Tenant. Walk up hierarchy until theme found. |
| NOTIFICATION_PIPELINE_ENABLED kill-switch | Required for safe Phase 6 migration. Fallback to direct EmailService. |
| Quiet-hours deferred via Queue delay | CF Queue message delay holds notification until after quiet window. Fallback: CRON sweep of deferred deliveries. |
| Handlebars-style variable substitution | Auditable, no arbitrary code execution, safe for tenant-edited templates. |
| Priority queue lanes | Critical notifications (billing/security/data breach) bypass digest and quiet hours. |

---

## 9. TEMPLATE SYSTEM DESIGN

### Template Hierarchy

```
Platform Default Template
    │
    └── Tenant Override Template (same family + channel + locale)
            │
            └── Rendered Output
                    │
                    └── Tenant Brand Context Applied (colors, logo, sender identity)
```

For sub-partner workspaces, brand context resolution walks:
```
Sub-Partner TenantTheme → Parent Partner TenantTheme → Platform Default
```

### Naming Convention

`{domain}.{aggregate_context}` — e.g. `auth.welcome`, `billing.payment_confirmed`, `bank_transfer.proof`, `partner.status`

### Template Taxonomy

| Family | Channels | Notes |
|---|---|---|
| `auth.welcome` | E, I | Registration welcome |
| `auth.verify_email` | E | Email verification link |
| `auth.email_verified` | I | Confirmation |
| `auth.password_reset` | E | Reset link |
| `auth.password_changed` | E, I | Confirmation |
| `auth.account_locked` | E, S, I | Security alert — critical bypass |
| `auth.login_alert` | E, I | New device/location |
| `auth.data_erasure` | E, I | NDPR Right to Erasure |
| `auth.api_key` | I | API key created/revoked |
| `workspace.invite` | E | Member invitation |
| `workspace.member_joined` | E, I | Confirmation |
| `workspace.member_removed` | E, I | Removal |
| `workspace.role_changed` | I | Role update |
| `workspace.suspended` | E, S, I | Critical |
| `workspace.activated` | E, I | Activation |
| `billing.payment_confirmed` | E, I | Receipt |
| `billing.payment_failed` | E, S, I | Failure |
| `billing.plan_changed` | E, I | Upgrade/downgrade |
| `billing.subscription_cancelled` | E, I | Cancellation |
| `billing.grace_period` | E, S, I | Grace entry |
| `billing.suspended` | E, S, I | Suspension |
| `billing.expiry_warning` | E, I | Upcoming expiry |
| `billing.quota_warning` | E, I | Approaching limit |
| `billing.quota_reached` | E, S, I | Limit reached |
| `kyc.tier_change` | E, I | KYC tier promotion |
| `kyc.bvn_verified` | I | BVN verification |
| `kyc.nin_verified` | I | NIN verification |
| `kyc.limit_blocked` | I, S | Transaction blocked |
| `partner.registered` | E, I | Partner registration |
| `partner.status` | E, I | Status change |
| `partner.entitlement` | E, I | Entitlement grant |
| `partner.sub_partner` | E, I | Sub-partner created/changed |
| `partner.credit` | E, I | Credit allocation |
| `bank_transfer.order` | E, S, I | Order created |
| `bank_transfer.proof` | E, S, I | Proof submitted |
| `bank_transfer.confirmed` | E, S, I | Confirmed |
| `bank_transfer.rejected` | E, S, I | Rejected |
| `bank_transfer.expired` | E, S, I | Expired |
| `bank_transfer.dispute` | E, I | Dispute raised |
| `bank_transfer.dispute_resolved` | E, I | Dispute resolved |
| `b2b.rfq` | E, I | RFQ submitted |
| `b2b.rfq_response` | E, I | RFQ response |
| `b2b.order` | E, I, K | Order confirmed |
| `airtime.receipt` | I, S | Top-up success |
| `airtime.failed` | I, S | Top-up failure |
| `transport.status` | E, I | FSM state change |
| `transport.licensed` | E, I | Route licensed |
| `claim.intent` | I | Claim intent |
| `claim.advanced` | E, I | Claim advanced |
| `claim.approved` | E, I | Approved |
| `claim.rejected` | E, I | Rejected |
| `negotiation.created` | I, S | New session |
| `negotiation.offer` | I, S | Offer updated |
| `negotiation.accepted` | E, I, S | Accepted |
| `negotiation.expired` | I, S | Expired |
| `support.ticket_created` | E, I | Created |
| `support.status_update` | E, I | Status changed |
| `support.resolved` | E, I | Resolved |
| `marketplace.installed` | I | Template installed |
| `marketplace.purchased` | E | Purchase receipt |
| `onboarding.progress` | I | Step completed |
| `onboarding.complete` | E, I | Checklist complete |
| `onboarding.nudge` | E, I | Nudge |
| `ai.consent` | I | Consent granted |
| `ai.consent_revoked` | E, I | Consent revoked |
| `ai.credit_exhausted` | E, S, I | Exhausted |
| `ai.credit_low` | E, I | Low threshold |
| `ai.hitl` | E, I | HITL escalation |
| `ai.hitl_expired` | E, I | HITL expired |
| `ai.l3_escalation` | E, I | L3 escalation |
| `pos.receipt` | I, S | POS receipt |
| `pos.float_alert` | I, S | Float low |
| `pos.reconciliation` | E, I | Reconciliation ready |
| `system.alert` | K (Slack/Teams) | Infrastructure alert |
| `governance.audit` | E | Audit export |
| `governance.breach` | E, K | Data breach |
| `vertical.*` | E, S, I | Canonical vertical events |

### Locale Handling — MUST use `@webwaka/i18n`

**Mandatory:** The template locale system MUST use the existing `@webwaka/i18n` package. Do not invent a parallel locale resolution mechanism.

```typescript
import { createI18n, detectLocale, type SupportedLocale } from '@webwaka/i18n';

// Template locale resolution:
// 1. Detect locale from user preference or request context
// 2. Attempt to find template with exact locale match
// 3. Fall back to 'en' via @webwaka/i18n's built-in fallback
const locale = (userLocale as SupportedLocale) || detectLocale(request);
const t = createI18n(locale);

// Template family lookup:
const template = await findTemplate(templateFamily, channel, locale) 
  ?? await findTemplate(templateFamily, channel, 'en');

// i18n string keys for notification-specific strings must be added 
// to all locale files in packages/i18n/src/locales/
```

### Email Template Architecture

```html
<email-wrapper>
  <header>
    <img src="{{tenant.logoUrl || platform.logoUrl}}" />
    <span>{{tenant.displayName}}</span>
  </header>
  <body style="--primary: {{tenant.primaryColor}}; --font: {{tenant.fontFamily}}">
    {{> content_block}}
  </body>
  <footer>
    {{> legal_footer locale=locale}}
    {{#if requiresAttribution}}
      <p>Powered by <a href="https://webwaka.com">WebWaka</a></p>
    {{/if}}
    <a href="{{unsubscribe_url}}">Unsubscribe</a>
    {{#if is_marketing}}<p>{{tenant.address}}</p>{{/if}}
  </footer>
</email-wrapper>
```

Attribution rule: `requiresAttribution` is true if the tenant's subscription plan is below the attribution-exemption threshold defined in `white-label-policy.md`.

**Partials library:**
- `{{> cta_button label=cta_label url=cta_url}}` — branded CTA button
- `{{> data_table rows=rows}}` — transaction data table
- `{{> alert_box type=type}}` — info/warn/error callout
- `{{> legal_footer locale=locale}}` — NDPR/regulatory footer using i18n keys
- `{{> otp_display code=otp_code}}` — OTP display block (receives pre-formatted string — raw OTP never passed)

### Variable Safety

| Category | Variables | Escaping |
|---|---|---|
| Tenant context | `tenant.displayName`, `tenant.primaryColor`, `tenant.logoUrl` | CSS/HTML escape |
| Recipient | `recipient.name`, `recipient.firstName` | HTML escape |
| Event payload | `event.*` keys per template family | HTML escape |
| Action URLs | `cta_url`, `unsubscribe_url` | URL encode + HTTPS allowlist validation |
| Platform | `platform.name`, `platform.supportEmail` | Static |

**Rules:** All substitutions HTML-escaped. URLs validated against HTTPS allowlist (no `javascript:`). No raw HTML from tenant variables. Tenant template body sandboxed — no `<script>`, no external resource loading. Platform reviews tenant custom templates before activation.

### WhatsApp Template Approval *(AUDIT ADDITION)*

All WhatsApp channel templates require Meta pre-approval before dispatch:

1. Template created in `notification_template` with `channel='whatsapp'`, `status='draft'`, `whatsapp_approval_status='pending_meta_approval'`
2. Platform operator submits template to Meta Business Manager
3. On approval: `whatsapp_approval_status='meta_approved'`
4. On rejection: `whatsapp_approval_status='meta_rejected'`; fallback template family used for SMS
5. Dispatch MUST check `whatsapp_approval_status = 'meta_approved'` before sending — a hard gate, not advisory

### Template Versioning Workflow

```
Draft → Pending Review → Active → Deprecated
```

1. Author creates (status: `draft`)
2. Platform super_admin or tenant admin reviews
3. Approved → `status='active'`, `published_at` set
4. Test-send available from `draft` and `active`
5. New version creates new row (version N+1 in draft)
6. Previous version marked `deprecated` on new activation
7. Rollback: re-activate previous, deprecate current

### Storage and Caching

- Template body stored in D1 `notification_template`
- Binary assets (logo, favicon) in Cloudflare R2 (existing pattern)
- Rendered HTML cached in KV (30s TTL; key: `tpl:{template_id}:{variable_hash}`)
- Plain-text version auto-generated for all email templates at publish time

---

## 10. REPO-BY-REPO IMPLEMENTATION IMPACT

### New Package: `packages/notifications`

**Must be created.** Central notification infrastructure package. All applications depend on this.

**Services to implement:**
- `NotificationService` — event intake, rule evaluation, audience resolution, preference resolution, brand/locale resolution, template resolution, dispatch
- `TemplateRenderer` — Handlebars-style substitution, HTML sanitization, channel-specific rendering, `@webwaka/i18n` integration
- `ChannelDispatcher` — abstract provider interface + per-channel implementations
- `InboxService` — `notification_inbox_item` CRUD with delivery_id FK
- `PreferenceService` — inheritance-chain resolution with KV caching
- `DigestEngine` — batch grouping, window management, digest dispatch
- `DeadLetterService` — inspection and replay tooling
- `SuppressionService` — address hash lookup and management
- All D1 schema types for notification domain
- Shared event type constants extending `@webwaka/events`

**Interfaces (contracts to establish in Phase 0):**
- `INotificationChannel` — abstract channel interface
- `ITemplateRenderer` — rendering interface
- `IPreferenceStore` — preference read/write interface
- `NotificationEvent` — normalized event shape
- `NotificationDeliveryStatus` — delivery status type
- `NotificationPipelineKillSwitch` — `NOTIFICATION_PIPELINE_ENABLED` env check

**Dependencies (in order):** `@webwaka/logging` → `@webwaka/types` → `@webwaka/events` → `@webwaka/white-label-theming` → `@webwaka/i18n` → `packages/notifications`

---

### `apps/api`

**Routes to change:**
1. `lib/email-service.ts` — Refactor to notification pipeline channel implementation. Direct calls replaced by `NotificationService.raise(event)`.
2. `routes/auth-routes.ts` — Remove all inline `new EmailService()` calls. Replace with `notificationService.raise('auth.user.registered', {...})` etc.
3. `routes/billing.ts` — Add `notificationService.raise()` for all plan change, cancel, reactivate, grace, suspend transitions.
4. `routes/payments.ts` — Add `notificationService.raise('billing.payment.completed')` and `billing.payment.failed`.
5. `routes/onboarding.ts` — Add `notificationService.raise('onboarding.step.completed')` on step completion.
6. `routes/support.ts` — Add notifications on ticket creation and all status changes.
7. `routes/superagent.ts` — Add notifications on AI credit exhaustion, consent changes, HITL escalation.
8. `routes/negotiation.ts` — Wire notification events for all session lifecycle events.
9. `routes/partners.ts` — **[AUDIT ADDITION]** Wire all 6 partner ecosystem notification events.
10. `routes/bank-transfer.ts` — **[AUDIT ADDITION]** Wire all 7 bank-transfer FSM notification events.
11. `routes/b2b-marketplace.ts` — **[AUDIT ADDITION]** Wire B2B RFQ and order events.
12. `routes/airtime.ts` — **[AUDIT ADDITION]** Wire airtime completion and failure events.
13. `routes/transport.ts` — **[AUDIT ADDITION]** Wire transport FSM state change events.
14. `jobs/negotiation-expiry.ts` — Add `notificationService.raise('negotiation.session.expired')`.
15. `middleware/monitoring.ts` — Route `ALERT_WEBHOOK_URL` through `NotificationService` for formatted Slack/Teams alerts.
16. `lib/webhook-dispatcher.ts` — Migrate retry to Cloudflare Queues consumer. Expand registered event types to full catalog.

**Routes to add:**
- `GET /notifications/preferences` — current user preferences
- `PATCH /notifications/preferences` — update channel/event preferences
- `GET /notifications/inbox` — paginated inbox (unread/read/archived/pinned)
- `PATCH /notifications/inbox/:id` — read, archive, pin, dismiss, snooze
- `DELETE /notifications/inbox/:id` — hard delete
- `GET /notifications/templates` — admin: list notification templates
- `POST /notifications/templates` — admin: create template
- `PATCH /notifications/templates/:id` — admin: update template
- `POST /notifications/templates/:id/preview` — render preview
- `POST /notifications/templates/:id/test-send` — test delivery
- `GET /notifications/deliveries` — admin: delivery log with filter
- `POST /notifications/dead-letter/:id/replay` — admin: replay dead-lettered delivery
- `GET /notifications/subscriptions` — user topic subscriptions
- `PATCH /notifications/subscriptions/:topic` — subscribe/unsubscribe
- `GET /notifications/suppression` — admin: view suppression list
- `POST /notifications/suppression` — admin: add to suppression

**NOTIFICATION_PIPELINE_ENABLED kill-switch:**
Add env var `NOTIFICATION_PIPELINE_ENABLED` (default `'1'`). When `'0'`, `NotificationService.raise()` falls back to direct `EmailService` call. This is the Phase 6 rollback mechanism.

---

### `apps/projections` *(AUDIT ADDITION — critical impact)*

**Decision point (OQ-001):** Does the CF Queue consumer live here or in a new Worker?

**If Queue consumer lives here (recommended):**
- Add `NOTIFICATION_QUEUE` consumer binding to `wrangler.toml`
- Add Queue consumer handler in `src/index.ts`
- Call `NotificationService` from the consumer handler
- The HITL escalation CRON must be migrated to the new notification pipeline (OQ-002)

**Regardless:**
- HITL escalation cron in `apps/projections` must be explicitly handled: either migrated to new pipeline or preserved as a separate path with documentation. See OQ-002.
- If `apps/projections` is NOT the consumer, a new `apps/notificator` Worker must be created with its own wrangler.toml, D1 binding, and Queue consumer configuration.

---

### `apps/tenant-public` *(AUDIT ADDITION)*

**What must be added:**
- Unsubscribe landing page: `GET /unsubscribe?token=...`
  - Validates HMAC-signed unsubscribe token
  - Calls `SuppressionService.addToSuppression(channel, address)`
  - Renders tenant-branded confirmation page using `@webwaka/white-label-theming`
- This page belongs here, NOT in `apps/brand-runtime`, because end-users click unsubscribe links from emails and arrive at the public-facing tenant site, not the tenant admin surface.

---

### `packages/events`

- Expand `EventType` catalog from 16 to 100+ types with typed payloads
- Add `correlation_id` to `DomainEvent` shape and `publishEvent()` signature
- Add queue publisher alongside D1 write (outbox pattern)
- Add all partner, bank-transfer, B2B, airtime, transport event types

---

### `packages/otp`

- No breaking changes required
- Add `correlation_id` parameter to OTP send functions for trace linkage
- Ensure OTP templates receive pre-formatted display strings — never raw codes (G6)

---

### `packages/white-label-theming`

- Add fields to `TenantTheme`: `senderEmailAddress`, `senderDisplayName`, `tenantSupportEmail`, `tenantAddress`, `requiresWebwakaAttribution`
- Add multi-level brand hierarchy resolver: given workspace ID, walk Partner → Sub-Partner chain
- Add `partnerParentId` to the theme lookup chain

---

### `packages/i18n` *(AUDIT ADDITION)*

- Add notification-specific i18n keys to all locale files:
  - Legal footer strings per locale (en, ha, yo, ig, pcm, fr)
  - Unsubscribe confirmation strings
  - Common notification boilerplate (per channel, per locale)
  - NDPR compliance footer text (per locale)

---

### `apps/workspace-app`

- In-app notification center UI: bell icon, notification drawer
- Notification inbox: unread/read/archived tabs
- Notification preference settings page
- Real-time push: SSE endpoint or polling (Durable Objects required for true WebSocket — see OQ-010)
- Offline notification queue via `@webwaka/offline-sync` Dexie.js store

---

### `apps/platform-admin`

- Platform-level notification template management UI (CRUD, preview, test-send)
- Cross-tenant delivery log viewer
- Dead-letter queue inspector with replay and dismiss
- Channel provider health dashboard
- System alert configuration

---

### `apps/brand-runtime`

- Tenant notification preference management (within tenant settings, not the unsubscribe page)
- Tenant notification template editor
- Tenant delivery log (within settings)
- Note: unsubscribe landing page is in `apps/tenant-public`, not here.

---

### `infra/db/migrations`

New migrations required (numbered from 0254+):

```
0254_notification_events.sql
0255_notification_rules.sql
0256_notification_preferences.sql
0257_notification_templates.sql
0258_notification_deliveries.sql
0259_notification_inbox_items.sql
0260_notification_digest_batches.sql
0261_notification_digest_batch_items.sql         -- AUDIT ADDITION
0262_notification_audit_log.sql
0263_notification_subscriptions.sql
0264_notification_suppression_list.sql           -- AUDIT ADDITION
0265_escalation_policies.sql
0266_channel_providers.sql                       -- SECURITY CORRECTED: credentials_kv_key
0267_push_tokens.sql
0268_seed_platform_notification_templates.sql    -- 50+ platform defaults
0269_seed_notification_rules.sql
0270_seed_channel_providers.sql
```

---

## 11. PHASED IMPLEMENTATION ROADMAP

### Phase 0 — Contracts, Standards, and Infrastructure Setup (Week 1-2)

**Objectives:** Establish naming standards, event schema registry, shared contracts, and provision required infrastructure before any implementation code is written.

**Critical infrastructure tasks (must complete before Phase 1):**
- Provision Cloudflare Queues in CF account (staging + production)
- Add queue producer bindings to `apps/api/wrangler.toml`
- Decide and document consumer Worker location (OQ-001)
- Add queue consumer bindings to consumer Worker wrangler.toml

**Repos:** `packages/events`, `packages/types`, `apps/api/wrangler.toml`, consumer Worker `wrangler.toml`, `docs/`

**Tasks:**
- N-001: Define 100+ canonical event keys, document in `event-types.ts`
- N-002: Write D1 schema SQL for all 15 new notification tables (including corrected entities)
- N-003: Define TypeScript interfaces: `INotificationChannel`, `ITemplateRenderer`, `IPreferenceStore`, `NotificationPipelineKillSwitch`
- N-004: Create `packages/notifications` skeleton
- N-005: Document template variable schema convention and escaping rules
- N-006: Define preference inheritance model spec (2d — not 0.5d as originally estimated)
- N-007: **[AUDIT ADDITION]** Provision CF Queues in CF account; add producer bindings to wrangler.toml
- N-008: **[AUDIT ADDITION]** Document and commit consumer Worker ownership decision (OQ-001)
- N-009: **[AUDIT ADDITION]** Document HITL escalation migration decision (OQ-002)

**Exit criteria:** All contracts defined in TypeScript. Schema SQL reviewed. Package skeleton compiles. CF Queues provisioned. Consumer Worker ownership decided.

---

### Phase 1 — Core Event Infrastructure (Week 3-4)

**Objectives:** Expand domain event bus to cover all identified events. Wire outbox pattern. Migrate to Cloudflare Queues for durable transport.

**Repos:** `packages/events`, `apps/api`, `infra`

**Prerequisites:** Phase 0 complete. CF Queues provisioned.

**Tasks:**
- N-010: Expand `@webwaka/events` EventType catalog to 100+ types
- N-011: Add `correlation_id` to `DomainEvent` and `publishEvent()`
- N-012: Implement CF Queues consumer in designated Worker (per OQ-001 decision)
- N-013: Wire outbox pattern: `publishEvent()` writes to `event_log` first; Queue consumer reads
- N-014: Run and validate migrations 0254-0270 on staging
- N-015: Write seed data for platform `notification_rules` and `notification_templates`

**Exit criteria:** 100+ event types defined. Queue consumer receiving events. `event_log` persisting with `correlation_id`. Migrations validated on staging.

---

### Phase 2 — Core Notification Service and Data Model (Week 5-6)

**Objectives:** Implement `NotificationService` with rule engine, audience resolution, and basic delivery persistence.

**Repos:** `packages/notifications`, `apps/api`

**Prerequisites:** Phase 1 complete.

**Tasks:**
- N-020: Implement `NotificationService.raise(eventKey, payload, tenantId)` with kill-switch gate
- N-021: Implement rule engine (load rules, evaluate, select channels and template)
- N-022: Implement audience resolution for all `audience_type` values (including `partner_admins`)
- N-023: Implement `notification_delivery` persistence with idempotency key
- N-024: Implement in-app channel: write to `notification_inbox_item` with `delivery_id` FK
- N-025: Wire `EmailService` as Resend channel implementation behind `INotificationChannel`
- N-026: Replace inline `EmailService` calls in `auth-routes.ts`
- N-027: Implement `notification_audit_log` writes
- N-028: Write multi-tenant isolation tests (cross-tenant delivery must not occur)
- N-029: Implement `SuppressionService` with address hash lookup

**Phase transition note:** Email sent during Phase 2 still uses existing hardcoded templates — tenant branding not yet applied. This is intentional and expected until Phase 3.

**Exit criteria:** `auth.user.registered` flows through full pipeline. In-app inbox item created. Email delivered. Audit log written. No cross-tenant leakage. Suppression list checked before dispatch.

---

### Phase 3 — Template Engine and Branding (Week 7-8)

**Objectives:** Replace hardcoded HTML strings with versioned template system. Apply tenant branding. Integrate `@webwaka/i18n`.

**Repos:** `packages/notifications`, `packages/white-label-theming`, `packages/i18n`, `apps/api`

**Prerequisites:** Phase 2 complete.

**Tasks:**
- N-030: Implement `TemplateRenderer` using `@webwaka/i18n` for locale resolution
- N-031: Build email wrapper with multi-level brand context injection (Platform → Partner → Sub-Partner → Tenant)
- N-032: Add partials library (`cta_button`, `data_table`, `alert_box`, `legal_footer`)
- N-033: Add `senderEmailAddress`, `senderDisplayName`, `requiresWebwakaAttribution` to `TenantTheme`
- N-034: Implement tenant template override resolution
- N-035: Implement template versioning (`draft` → `active` → `deprecated`)
- N-036: Add preview endpoint (`POST /notifications/templates/:id/preview`)
- N-037: Add test-send endpoint (`POST /notifications/templates/:id/test-send`)
- N-038: Auto-generate plain-text versions of all HTML email templates
- N-039: Add `List-Unsubscribe` header to all email sends; implement unsubscribe token signing
- N-040: Migrate 6 existing email templates into `notification_template` table as platform defaults
- N-041: Add notification-specific i18n keys to `packages/i18n` locale files (en, ha, yo, ig, pcm, fr)

**Exit criteria:** All 6 email templates rendered via template engine with tenant branding. Test-send works. Preview works. Locale fallback works. `@webwaka/i18n` used throughout.

---

### Phase 4 — Channel Providers and Delivery Tracking (Week 9-10)

**Objectives:** Full channel provider abstraction. Delivery tracking. Wire all channels.

**Repos:** `packages/notifications`, `packages/otp`, `apps/api`

**Prerequisites:** Phase 3 complete.

**Tasks:**
- N-042: Implement `INotificationChannel` for Resend (email)
- N-043: Implement `INotificationChannel` for Termii (SMS)
- N-044: Implement `INotificationChannel` for Meta WhatsApp (with `meta_approved` gate)
- N-045: Implement `INotificationChannel` for 360dialog WhatsApp
- N-046: Implement `INotificationChannel` for Telegram
- N-047: Implement web push channel (FCM + service worker)
- N-048: Implement Slack webhook channel for system alerts
- N-049: Implement Teams webhook channel for system alerts
- N-050: Implement fallback channel chain logic
- N-051: Implement delivery status tracking (dispatched → delivered/failed)
- N-052: Implement Resend bounce webhook handler → update suppression list
- N-053: Add per-tenant `channel_provider` overrides (tenant supplies own Resend domain)
- N-054: Store provider credentials using ADL-002 pattern (AES-256-GCM in KV via `credentials_kv_key`)
- N-055: Migrate `monitoring.ts` `ALERT_WEBHOOK_URL` to `system.error_rate.spike` event → Slack channel

**Exit criteria:** All channels wired behind `INotificationChannel`. Provider credentials stored via ADL-002 (KV, not D1 plaintext). Delivery status tracked end-to-end. Bounce handling updates suppression list.

---

### Phase 5 — Preferences, Inbox, and Digest Engine (Week 11-13)

**Objectives:** Full preference model, in-app notification center, digest batching.

**Repos:** `packages/notifications`, `apps/workspace-app`, `apps/brand-runtime`

**Prerequisites:** Phase 4 complete.

**Tasks:**
- N-060: Implement `PreferenceService` with 4-level inheritance chain
- N-061: Add KV cache for preference reads (5-min TTL; `{tenant_id}:pref:` key prefix)
- N-062: Implement quiet hours (timezone-aware; Africa/Lagos default; deferred via Queue delay)
- N-063: Implement digest window management (`hourly`, `daily`, `weekly`)
- N-064: Implement `DigestEngine` using `notification_digest_batch` + `notification_digest_batch_item` join table
- N-065: Build inbox API (GET paginated, PATCH state, DELETE)
- N-066: Build preference management API
- N-067: Build real-time notification push (SSE or Durable Objects; see OQ-010)
- N-068: Add Dexie.js offline notification store to `@webwaka/offline-sync`
- N-069: Build notification bell + drawer in `apps/workspace-app`
- N-070: Build preference settings page in `apps/workspace-app`
- N-071: Add unsubscribe landing page to `apps/tenant-public` (NOT `apps/brand-runtime`)

**Exit criteria:** Preferences work across all 4 scopes. Inbox functions. Digest batches correctly. Quiet hours deferred, not suppressed. Offline PWA sync works.

---

### Phase 6 — Route and Vertical Wiring (Week 14-18)

**Objectives:** Wire notification events across all existing routes and all 160+ vertical packages. Complete migration from direct EmailService calls.

**Prerequisite:** Phases 1-5 complete. NOTIFICATION_PIPELINE_ENABLED kill-switch in place before starting.

**Tasks:**
- N-080: Wire all auth lifecycle events (15 events including API key events)
- N-081: Wire all workspace events (11 events)
- N-082: Wire all billing lifecycle events (12 events)
- N-083: Wire all KYC/identity events (6 events)
- N-084: Wire all claim events (7 events including document upload and counter-claim)
- N-085: Wire all negotiation events (7 events)
- N-086: Wire all support ticket events (5 events)
- N-087: Wire all AI/superagent events (9 events including HITL expiry and L3 escalation)
- N-088: Wire all onboarding events (3 events)
- N-089: Wire all POS/finance events (4 events)
- N-090: Wire all social/community events (5 events)
- N-091: **[AUDIT ADDITION]** Wire all 6 partner ecosystem events in `routes/partners.ts`
- N-092: **[AUDIT ADDITION]** Wire all 7 bank-transfer FSM events in `routes/bank-transfer.ts`
- N-093: **[AUDIT ADDITION]** Wire B2B marketplace events in `routes/b2b-marketplace.ts`
- N-094: **[AUDIT ADDITION]** Wire airtime events in `routes/airtime.ts`
- N-095: **[AUDIT ADDITION]** Wire transport FSM events in `routes/transport.ts`
- N-096: Create `@webwaka/vertical-events` package with 8 canonical vertical events
- N-097: Wire canonical vertical events in all 160+ vertical packages (scripted migration)
- N-098: Update `jobs/negotiation-expiry.ts` to emit `negotiation.session.expired`
- N-099: Add onboarding stalled job to emit `onboarding.step.stalled`
- N-100: **[AUDIT ADDITION]** Migrate `apps/projections` HITL escalation to unified pipeline (per OQ-002 decision)

**Rollback strategy:** `NOTIFICATION_PIPELINE_ENABLED=0` reverts to legacy EmailService for all routes. Test each route before removing kill-switch protection. Confirm no duplicate sends during migration window by monitoring audit log.

**Exit criteria:** Zero direct `EmailService` calls in route handlers. All identified business events produce appropriate notifications. No duplicate sends confirmed in audit log.

---

### Phase 7 — Admin Tooling and Observability (Week 19-21)

**Tasks:**
- N-105: Build platform admin notification template management UI
- N-106: Build cross-tenant delivery log viewer
- N-107: Build dead-letter queue inspector with replay and dismiss
- N-108: Build channel provider health dashboard
- N-109: Build notification rule editor for super_admin
- N-110: Implement delivery anomaly alerts (bounce rate > 5% → `system.provider.down` event)
- N-111: Implement sandbox/test mode for staging environment
- N-112: Add tenant notification delivery log to `apps/brand-runtime`
- N-113: Add CF Logpush integration for notification event logs
- N-114: Implement notification metrics dashboard (send_volume, delivery_rate, bounce_rate, open_rate)

**Exit criteria:** Super-admin can inspect, replay, and manage all notification deliveries. Metrics visible. Alerts working. Sandbox mode enforced on staging.

---

### Phase 8 — Data Retention and Compliance Hardening (Week 22)

**Tasks:**
- N-115: **[AUDIT ADDITION]** Implement data retention policy: D1 TTL sweeps per table retention rules
- N-116: **[AUDIT ADDITION]** Implement NDPR data subject erasure propagation to notification tables
- N-117: Implement attribution enforcement in email templates per plan-tier
- N-118: Implement WhatsApp template submission and approval tracking workflow

**Exit criteria:** All notification tables have automated retention enforcement. Erasure propagation tested. Attribution rule enforced. WhatsApp template approval workflow documented and tracked.

---

### Phase 9 — QA Hardening and Production Rollout (Week 23-27)

**Tasks:**
- N-120: Full E2E Playwright test suite for all notification flows
- N-121: Multi-tenant isolation penetration test (no cross-tenant bleed)
- N-122: Load test: 10,000 notifications/hour across 100 tenants on staging
- N-123: NDPR compliance audit (consent gating, unsubscribe, data erasure propagation)
- N-124: CBN compliance audit (transaction OTP channels — R8 preservation)
- N-125: Template XSS security review (all rendering paths)
- N-126: Email accessibility audit (WCAG 2.1 AA, aria labels, alt text, plain-text)
- N-127: ADL-002 audit: confirm zero provider API keys in D1 (all credentials in KV)
- N-128: Production rollout via feature flag per tenant (observe 2 weeks before full enablement)
- N-129: Monitor error rates, bounce rates, delivery rates for 30 days post-rollout
- N-130: Write operations runbooks (provider failover, dead-letter sweep, digest rerun)

**Exit criteria:** All tests pass. NDPR/CBN compliance verified. Load test passes at 2x expected volume. Zero credentials in D1 confirmed. Production rollout complete with monitoring active.

---

**Total estimated effort:** ~165 engineering days (33 weeks at 1 engineer, ~11 weeks with a 3-person team)

**Recommended resourcing:**
- 1 Platform Architect (owns architecture, contracts, governance, Phase 0)
- 1 Backend Engineer (notification service, event bus, channel providers, Phases 1-4)
- 1 Full-Stack Engineer (admin UI, workspace-app inbox, preference pages, Phases 5-7)
- 1 QA Engineer (Phase 9, ongoing cross-phase testing)

**Critical path:** N-007 → N-008 → N-001/N-002/N-003 → N-012 → N-020/N-021 → N-026 → N-039/N-054 → N-080/N-082/N-091/N-092 → N-120/N-123

---

## 12. BEST-PRACTICE GUARDRAILS

These are non-negotiable rules enforced via code, tests, or review gates.

### G1 — Tenant Isolation is Absolute
Every `notification_event`, `notification_delivery`, `notification_inbox_item`, `notification_preference`, and `notification_template` query MUST include `tenant_id` in the WHERE clause. KV cache keys MUST be prefixed `{tenant_id}:`. No cross-tenant reads from any notification API. Enforced by: specific cross-tenant isolation test suite. Verified by: governance check script.

### G2 — No Direct Email Sends from Business Routes
After Phase 2, `new EmailService(key).sendTransactional(...)` is forbidden in route handlers. All email delivery must flow through `NotificationService.raise()`. Enforced by: ESLint custom rule banning direct `EmailService` instantiation outside `packages/notifications`.

### G3 — No Hardcoded FROM Address
`WebWaka <noreply@webwaka.com>` must not appear in code after Phase 3. FROM address must be loaded from `channel_provider.config`, defaulting to platform sender if no tenant override exists.

### G4 — Brand Context Always Applied
All email templates must render through `@webwaka/white-label-theming` brand context. Multi-level brand walk (Platform → Partner → Sub-Partner → Tenant) must be performed. No email renders without loading `TenantTheme` first.

### G5 — Transaction OTPs Must Use SMS
`purpose === 'transaction'` must route only to `channel === 'sms'`. This rule exists in `@webwaka/otp` and must be preserved. WhatsApp/Telegram must remain blocked for transaction OTPs (CBN R8).

### G6 — No Raw OTP Values Persisted or Passed to Templates
OTP values must never appear in any DB column, log line, or response body. Only SHA-256 hashes with the platform salt. Notification templates that display OTPs must receive pre-formatted display strings — never raw codes.

### G7 — Idempotency Required for All Sends
Every notification delivery must generate an idempotency key before dispatch. Duplicate events must not produce duplicate deliveries. The `notification_delivery.idempotency_key` UNIQUE constraint enforces this at the DB level.

### G8 — Consent Gates for Marketing
Any notification with `topic` in `notification_subscription` must check `subscribed = 1` before dispatch. Transactional notifications (auth, billing, security) bypass consent checks per NDPR Article 2(1)(b). The transactional vs marketing distinction must be explicit in `notification_rule`.

### G9 — Audit Every Send
`notification_audit_log` must be written for every send attempt (success or failure). Preference changes must also be audited. This log is required for NDPR accountability and must be queryable for data subject access requests.

### G10 — Dead-Letter, Never Discard
After max retry attempts, notifications must enter `dead_lettered` state (not deleted). Operations must be able to replay, inspect, or dismiss. Silent discard on failure is forbidden.

### G11 — Quiet Hours Must Be Timezone-Aware and Deferred Not Suppressed
`Africa/Lagos` (WAT, UTC+1) is the default timezone. Quiet hours evaluation must convert the current UTC time to the recipient's configured timezone. A notification blocked by quiet hours must be scheduled for delivery via CF Queue message delay or CRON sweep — not suppressed.

### G12 — Critical Notifications Bypass Quiet Hours and Digest
`severity = 'critical'` notifications (account locked, data breach, payment critical failure, workspace suspended) bypass quiet hours and digest windows. Delivered immediately on all configured channels.

### G13 — Provider Abstraction Must Be Complete
No channel-specific provider implementation code (Resend, Termii, Meta WA, etc.) may appear in business logic, route handlers, or rule evaluation. All provider specifics must be behind `INotificationChannel`. Swapping a provider must require changes only in `packages/notifications/channels/`.

### G14 — Template Variables Must Be Schema-Validated
Before rendering, all variables must be validated against `notification_template.variables_schema`. Missing required variables must fail loudly — not silently render empty strings.

### G15 — No PII in Logs
`@webwaka/logging` PII masking must be applied to all notification log lines. Audit logs store recipient IDs, not email addresses or phone numbers. Delivery logs store provider message IDs, not content.

### G16 — Provider Credentials in KV Only, Never in D1 *(AUDIT ADDITION — ADL-002)*
Provider API keys (RESEND_API_KEY, TERMII_API_KEY, META_WA_TOKEN, etc.) must NEVER be stored in the `channel_provider.config` D1 column. They must be stored AES-256-GCM encrypted in KV, referenced by `channel_provider.credentials_kv_key`. Any code that reads provider credentials must go through the KV decrypt path. Enforced by: governance check script `check-provider-credentials.ts`.

### G17 — WhatsApp Templates Must Be Meta-Approved Before Dispatch *(AUDIT ADDITION)*
Before dispatching any WhatsApp channel delivery, check `notification_template.whatsapp_approval_status`. Only `'meta_approved'` permits dispatch. Any other status (including `'pending_meta_approval'`) must trigger a fallback to SMS channel if available, or dead-letter the delivery with reason `'wa_template_not_approved'`.

### G18 — Locale Resolution Must Use `@webwaka/i18n` *(AUDIT ADDITION)*
Template locale resolution must use `createI18n(locale)` and `detectLocale(request)` from `@webwaka/i18n`. New notification-specific string keys must be added to the i18n locale files. No parallel locale resolution system may be introduced.

### G19 — Channel Dispatch Respects Entitlement Tier *(AUDIT ADDITION)*
Some channels (push, SMS) may be restricted to specific subscription plan tiers per `@webwaka/entitlements`. Before dispatching via any channel, check that the workspace's active entitlement grants access to that channel. Tenants below the minimum tier for a channel receive in-app only.

### G20 — Suppression List Checked Before All External Dispatches *(AUDIT ADDITION)*
Before dispatching to email, SMS, or WhatsApp, the normalized address hash must be checked against `notification_suppression_list`. A hit must mark the delivery `status='suppressed'` and write to audit log. Sending to a suppressed address violates CAN-SPAM, NDPR, and risks provider account suspension.

---

## 13. OPEN QUESTIONS AND DECISIONS NEEDED

These are genuine unresolved decisions that block or affect implementation. Each must be decided before the relevant phase begins.

**Decisions needed before Phase 1:**

### OQ-001 — Queue Consumer Worker Location
**Question:** Does the CF Queue consumer for notification dispatch live in `apps/projections` (co-located with existing event processing and HITL cron) or in a new dedicated `apps/notificator` Worker?

**Arguments for `apps/projections`:**
- Already has D1 binding to same database
- Already imports `@webwaka/events`
- Already handles event-driven processing
- Fewer Workers to manage and deploy

**Arguments for new `apps/notificator`:**
- Single responsibility principle
- Projections and notifications have different scaling characteristics
- Cleaner separation in case of independent rollouts or scaling

**Decision needed by:** Start of Phase 1 (before wrangler.toml binding work begins)  
**Owner:** Platform Architect

---

### OQ-002 — HITL Escalation Ownership After Notification Pipeline
**Question:** The `apps/projections` Worker currently runs HITL expiry sweep and L3 escalation CRON every 4 hours. Should this be migrated to the new notification pipeline (`ai.hitl.request_expired` and `ai.hitl.escalated_to_l3` events via `NotificationService`) or preserved as a separate path?

**Decision needed by:** Phase 6 (before N-100 starts)  
**Risk of not deciding:** Double-notification if both paths are active during migration.

---

**Decisions needed before Phase 3:**

### OQ-003 — WhatsApp Template Approval Workflow
**Question:** What is the operational workflow for submitting and tracking Meta WhatsApp template pre-approval? Who is responsible — platform operators submitting on behalf of all tenants, or tenants submitting their own templates via the Meta Business Manager?

**Implication:** Affects `apps/platform-admin` UI requirements and `channel_provider` configuration.

---

### OQ-004 — Tenant Sender Domain Verification UX
**Question:** When a tenant configures a custom `senderEmailAddress` (e.g., `notifications@theircompany.com`), what is the Resend DNS verification flow? Who initiates it? Where is verification status displayed? What happens to email delivery during the pending-verification window — fall back to platform sender with tenant display name, or hold sends?

**Implication:** Affects `channel_provider.sender_domain_verified` field usage and Phase 4 implementation.

---

**Decisions needed before Phase 5:**

### OQ-005 — Partner/Sub-Partner Brand Hierarchy Resolution
**Question:** For Sub-Partner workspaces, brand context resolution walks: Sub-Partner TenantTheme → Parent Partner TenantTheme → Platform Default. Is this the agreed hierarchy, and does it always walk all the way to Platform Default, or can a Sub-Partner declare that no brand inheritance is allowed from the parent?

**Implication:** Affects `packages/white-label-theming` brand resolver implementation.

---

**Decisions needed before Phase 8:**

### OQ-006 — Notification Data Retention and NDPR Erasure
**Question:** The proposed retention policy is: delivery logs 90 days, inbox 365 days, audit logs 7 years. Does the legal/compliance team approve these TTLs? For audit log erasure: should `actor_id` and `recipient_id` be zeroed out (preserving the event record for accountability) or should the row be deleted?

**Implication:** Affects migration 0262 schema (add `deleted_at` vs hard delete), CRON sweep implementation in Phase 8.

---

### OQ-007 — Digest Engine Timing Model
**Question:** Is the digest window CRON global (one CRON sweep processes all pending digests for all tenants at the window close time) or per-tenant (each tenant's digest window is managed independently)? CF Workers has a 100ms CPU time limit per invocation — a global sweep across thousands of tenants in a single invocation will hit this limit.

**Implication:** Affects `DigestEngine` architecture and CRON configuration. A per-batch approach with Queue-based continuation may be required.

---

**Decisions needed before Phase 6:**

### OQ-008 — Partner Admin Notification Surface
**Question:** Do partner admins need a dedicated notification inbox separate from the workspace admin inbox? The `apps/partner-admin` app currently has no notification surface. Should `partner.partner.registered` and `partner.partner.status_changed` events create inbox items for partner admins in their own app surface, or in the workspace surface?

---

### OQ-009 — USSD Notification Queuing Behavior
**Question:** For business events triggered via the USSD gateway (e.g., a POS payment completing during a USSD session), how should notifications be handled? Options:
- (a) Queue the notification for delivery after session ends
- (b) Send SMS immediately (USSD users can receive SMS between sessions)
- (c) Deliver in-app only; no USSD-session interruption

**Implication:** Affects how the notification preference resolver handles `platform='ussd'` context.

---

**Decisions needed before Phase 5:**

### OQ-010 — Real-Time Inbox Push Technology
**Question:** In-app real-time notification push requires either (a) Cloudflare Durable Objects for WebSocket state management, (b) Server-Sent Events via polling (`EventSource` with polling endpoint), or (c) short-poll at a reasonable interval (e.g., every 30 seconds).

CF Workers cannot maintain long-lived connections without Durable Objects. The choice affects both infra cost and inbox UX responsiveness. For a Nigeria-first PWA-first platform with intermittent connectivity, polling may be more resilient than WebSocket.

---

**Decisions needed before Phase 3:**

### OQ-011 — Low-Data Mode and Notification Suppression
**Question:** `apps/api/src/routes/low-data.ts` exists for users on metered/low-bandwidth connections. Should in-app notifications be suppressed, compressed, or deferred in low-data mode? Should push notifications (which consume data silently) be suspended when a user is in low-data mode?

**Implication:** Affects preference resolution layer (additional check for `low_data_mode` user preference).

---

**Decisions needed before Phase 9:**

### OQ-012 — Sandbox Mode Strictness
**Question:** In staging/test environments, should all notification deliveries be silently dropped, redirected to a configured test address, or delivered normally? The recommended default is "redirect all to test addresses." Who configures the test address per environment?

---

### OQ-013 — Webhook Event Expansion Scope
**Question:** The current webhook system has 4 event types. With 100+ notification events now catalogued, should all notification events be exposed as webhook subscription options, or only a curated subset? What is the maximum number of event types a tenant can subscribe to?

---

## 14. EXECUTION BACKLOG

De-duplicated, unique IDs, prioritized, with dependencies noted. Grouped by phase/epic.

### Epic: Phase 0 — Infrastructure and Standards

| ID | Task | Repo | Estimate | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-001 | Define 100+ canonical event keys in `event-types.ts` | packages/events | 3d | P0 | — | Low |
| N-002 | Write D1 schema SQL for all 15 notification tables (corrected entities) | infra/migrations | 2d | P0 | — | Low |
| N-003 | Define TypeScript interfaces: INotificationChannel, ITemplateRenderer, IPreferenceStore, KillSwitch | packages/notifications | 1d | P0 | — | Low |
| N-004 | Create packages/notifications skeleton (package.json, tsconfig, index.ts) | packages/notifications | 0.5d | P0 | — | Low |
| N-005 | Document template variable schema convention and escaping rules | docs | 1d | P0 | — | Low |
| N-006 | Define preference inheritance model spec | docs | 2d | P0 | — | Low |
| N-007 | **Provision CF Queues in CF account; add producer bindings to wrangler.toml** | apps/api | 1d | P0 | OQ-001 resolved | High |
| N-008 | **Document and commit consumer Worker ownership decision (OQ-001)** | docs | 0.5d | P0 | — | High |
| N-009 | **Document HITL escalation migration decision (OQ-002)** | docs | 0.5d | P0 | — | Medium |

### Epic: Phase 1 — Core Event Infrastructure

| ID | Task | Repo | Estimate | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-010 | Expand @webwaka/events EventType catalog to 100+ types | packages/events | 3d | P0 | N-001 | Low |
| N-011 | Add correlation_id to DomainEvent and publishEvent() | packages/events | 0.5d | P0 | N-010 | Low |
| N-012 | Implement CF Queues consumer in designated Worker | apps/projections or apps/notificator | 3d | P0 | N-007, N-008 | High |
| N-013 | Wire outbox pattern: publishEvent() within D1 transaction | packages/events | 2d | P0 | N-011, N-012 | Medium |
| N-014 | Run and validate migrations 0254-0270 on staging | infra | 1d | P0 | N-002 | Medium |
| N-015 | Write seed data for platform notification_rules and notification_templates | infra | 2d | P0 | N-014 | Low |

### Epic: Phase 2 — Core Notification Service

| ID | Task | Repo | Estimate | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-020 | Implement NotificationService.raise() with kill-switch gate | packages/notifications | 3d | P0 | N-003, N-013 | Medium |
| N-021 | Implement rule engine (load rules, evaluate, select channels and template) | packages/notifications | 3d | P0 | N-020 | Medium |
| N-022 | Implement audience resolution for all audience_type values | packages/notifications | 2d | P0 | N-021 | Medium |
| N-023 | Implement notification_delivery persistence with idempotency | packages/notifications | 1d | P0 | N-014, N-021 | Low |
| N-024 | Implement in-app channel: write to notification_inbox_item with delivery_id FK | packages/notifications | 1d | P0 | N-023 | Low |
| N-025 | Wire EmailService as Resend channel behind INotificationChannel | packages/notifications | 2d | P0 | N-003, N-020 | Low |
| N-026 | Replace inline EmailService calls in auth-routes.ts | apps/api | 1d | P0 | N-025 | Low |
| N-027 | Implement notification_audit_log writes | packages/notifications | 1d | P0 | N-023 | Low |
| N-028 | Write multi-tenant isolation tests | packages/notifications | 1d | P0 | N-024 | Low |
| N-029 | Implement SuppressionService with address hash lookup | packages/notifications | 1d | P0 | N-014 | Low |

### Epic: Phase 3 — Template Engine and Branding

| ID | Task | Repo | Estimate | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-030 | Implement TemplateRenderer with @webwaka/i18n locale resolution | packages/notifications | 3d | P0 | N-003 | Medium |
| N-031 | Build email wrapper with multi-level brand context injection | packages/notifications | 2d | P0 | N-030 | Medium |
| N-032 | Add partials library (cta_button, data_table, alert_box, legal_footer) | packages/notifications | 2d | P0 | N-031 | Low |
| N-033 | Add sender fields and requiresAttribution to TenantTheme | packages/white-label-theming | 0.5d | P0 | — | Low |
| N-034 | Implement tenant template override resolution | packages/notifications | 1d | P0 | N-030 | Low |
| N-035 | Implement template versioning (draft → active → deprecated) | packages/notifications | 1d | P1 | N-034 | Low |
| N-036 | Add preview endpoint | apps/api | 1d | P1 | N-035 | Low |
| N-037 | Add test-send endpoint | apps/api | 1d | P1 | N-035 | Low |
| N-038 | Auto-generate plain-text from HTML for all email templates | packages/notifications | 1d | P1 | N-031 | Low |
| N-039 | Add List-Unsubscribe header; implement unsubscribe token signing | packages/notifications | 1d | P0 | — | Low |
| N-040 | Migrate 6 existing email templates into notification_template table | infra | 1d | P0 | N-015, N-030 | Low |
| N-041 | Add notification i18n keys to packages/i18n locale files (all 6 locales) | packages/i18n | 2d | P0 | N-001 | Medium |

### Epic: Phase 4 — Channel Providers

| ID | Task | Repo | Estimate | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-042 | Implement INotificationChannel for Resend (email) | packages/notifications | 1d | P0 | N-025, N-054 | Low |
| N-043 | Implement INotificationChannel for Termii (SMS) | packages/notifications | 1d | P0 | N-054 | Low |
| N-044 | Implement INotificationChannel for Meta WhatsApp (meta_approved gate) | packages/notifications | 1d | P0 | N-054 | Medium |
| N-045 | Implement INotificationChannel for 360dialog WhatsApp | packages/notifications | 0.5d | P0 | N-054 | Low |
| N-046 | Implement INotificationChannel for Telegram | packages/notifications | 0.5d | P0 | N-054 | Low |
| N-047 | Implement web push channel (FCM + service worker) | packages/notifications | 3d | P1 | N-054 | High |
| N-048 | Implement Slack webhook channel | packages/notifications | 1d | P1 | — | Low |
| N-049 | Implement Teams webhook channel | packages/notifications | 1d | P2 | — | Low |
| N-050 | Implement fallback channel chain logic | packages/notifications | 1d | P0 | N-042-N-046 | Low |
| N-051 | Implement delivery status tracking | packages/notifications | 1d | P0 | N-023 | Low |
| N-052 | Implement Resend bounce webhook handler → update suppression list | apps/api | 1d | P1 | N-029, N-042 | Medium |
| N-053 | Add per-tenant channel_provider overrides | packages/notifications | 2d | P1 | N-054 | Medium |
| N-054 | Store provider credentials via ADL-002 (AES-256-GCM in KV via credentials_kv_key) | packages/notifications | 2d | P0 | — | High |
| N-055 | Migrate monitoring ALERT_WEBHOOK_URL to Slack notification channel | apps/api | 1d | P1 | N-048 | Low |

### Epic: Phase 5 — Preferences, Inbox, Digest

| ID | Task | Repo | Estimate | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-060 | Implement PreferenceService with 4-level inheritance chain | packages/notifications | 3d | P0 | N-003 | Medium |
| N-061 | Add KV cache for preference reads with tenant-prefixed keys | packages/notifications | 1d | P0 | N-060 | Low |
| N-062 | Implement quiet hours (timezone-aware; deferred via Queue delay) | packages/notifications | 2d | P0 | N-060, N-012 | Medium |
| N-063 | Implement digest window management | packages/notifications | 3d | P1 | N-060, OQ-007 | Medium |
| N-064 | Implement DigestEngine using digest_batch + digest_batch_item join table | packages/notifications | 3d | P1 | N-063 | Medium |
| N-065 | Build inbox API (GET paginated, PATCH state, DELETE) | apps/api | 2d | P0 | N-024 | Low |
| N-066 | Build preference management API | apps/api | 1d | P0 | N-060 | Low |
| N-067 | Build real-time push endpoint (per OQ-010 decision) | apps/api | 2d | P1 | OQ-010 | High |
| N-068 | Add Dexie.js offline notification store to @webwaka/offline-sync | packages/offline-sync | 2d | P1 | N-024 | Low |
| N-069 | Build notification bell + drawer in apps/workspace-app | apps/workspace-app | 3d | P0 | N-065 | Low |
| N-070 | Build preference settings page in apps/workspace-app | apps/workspace-app | 2d | P1 | N-066 | Low |
| N-071 | Add unsubscribe landing page to apps/tenant-public | apps/tenant-public | 1d | P0 | N-039, N-029 | Low |

### Epic: Phase 6 — Route and Vertical Wiring

| ID | Task | Repo | Estimate | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-080 | Wire all auth lifecycle events (15 events) | apps/api | 2d | P0 | N-026, N-020 | Low |
| N-081 | Wire all workspace events (11 events) | apps/api | 1d | P0 | N-020 | Low |
| N-082 | Wire all billing lifecycle events (12 events) | apps/api | 2d | P0 | N-020 | Low |
| N-083 | Wire all KYC/identity events (6 events) | apps/api | 1d | P0 | N-020 | Low |
| N-084 | Wire all claim events (7 events) | apps/api | 1d | P0 | N-020 | Low |
| N-085 | Wire all negotiation events (7 events) + expiry job | apps/api | 1d | P0 | N-020 | Low |
| N-086 | Wire all support ticket events (5 events) | apps/api | 1d | P0 | N-020 | Low |
| N-087 | Wire all AI/superagent events (9 events) | apps/api | 1d | P0 | N-020 | Low |
| N-088 | Wire all onboarding events (3 events) | apps/api | 1d | P0 | N-020 | Low |
| N-089 | Wire all POS/finance events (4 events) | apps/api | 1d | P1 | N-020 | Low |
| N-090 | Wire all social/community events (5 events) | apps/api | 1d | P1 | N-020 | Low |
| N-091 | Wire all 6 partner ecosystem events (partners.ts) | apps/api | 1d | P0 | N-020 | Low |
| N-092 | Wire all 7 bank-transfer FSM events (bank-transfer.ts) | apps/api | 1d | P0 | N-020 | Low |
| N-093 | Wire B2B marketplace events (b2b-marketplace.ts) | apps/api | 0.5d | P1 | N-020 | Low |
| N-094 | Wire airtime events (airtime.ts) | apps/api | 0.5d | P1 | N-020 | Low |
| N-095 | Wire transport FSM events (transport.ts) | apps/api | 0.5d | P1 | N-020 | Low |
| N-096 | Create @webwaka/vertical-events package with 8 canonical events | packages | 2d | P1 | N-010 | Low |
| N-097 | Wire canonical vertical events in all 160+ vertical packages (scripted) | packages/verticals-* | 3d | P1 | N-096 | Medium |
| N-098 | Update negotiation-expiry job → emit negotiation.session.expired | apps/api | 0.5d | P0 | N-085 | Low |
| N-099 | Add onboarding stalled job | apps/api | 1d | P1 | N-088 | Low |
| N-100 | Migrate apps/projections HITL escalation to unified pipeline | apps/projections | 2d | P0 | N-087, OQ-002 | High |

### Epic: Phase 7 — Admin Tooling and Observability

| ID | Task | Repo | Estimate | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-105 | Build platform admin notification template management UI | apps/platform-admin | 4d | P1 | N-035 | Low |
| N-106 | Build cross-tenant delivery log viewer | apps/platform-admin | 2d | P1 | N-051 | Low |
| N-107 | Build dead-letter queue inspector with replay | apps/platform-admin | 2d | P1 | N-010, N-027 | Low |
| N-108 | Build channel provider health dashboard | apps/platform-admin | 2d | P1 | N-051 | Low |
| N-109 | Build notification rule editor for super_admin | apps/platform-admin | 3d | P2 | N-021 | Low |
| N-110 | Implement delivery anomaly alerts | packages/notifications | 1d | P1 | N-051 | Low |
| N-111 | Implement sandbox/test mode for staging | packages/notifications | 1d | P0 | — | Low |
| N-112 | Add tenant notification delivery log to apps/brand-runtime | apps/brand-runtime | 2d | P2 | N-051 | Low |
| N-113 | Add CF Logpush for notification event logs | infra | 1d | P1 | — | Low |
| N-114 | Implement notification metrics dashboard | apps/platform-admin | 3d | P1 | N-051 | Low |

### Epic: Phase 8 — Compliance Hardening

| ID | Task | Repo | Estimate | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-115 | Implement data retention CRON sweeps per table TTL policy | apps/api or apps/projections | 2d | P0 | N-014, OQ-006 | Medium |
| N-116 | Implement NDPR erasure propagation to notification tables | packages/notifications | 2d | P0 | N-027 | Medium |
| N-117 | Implement attribution enforcement in email templates | packages/notifications | 1d | P0 | N-031, N-033 | Low |
| N-118 | Implement WhatsApp template approval tracking workflow | apps/platform-admin | 2d | P1 | N-044, OQ-003 | High |

### Epic: Phase 9 — QA Hardening and Rollout

| ID | Task | Repo | Estimate | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-120 | Full E2E Playwright test suite | all | 5d | P0 | N-097 | Low |
| N-121 | Multi-tenant isolation penetration test | all | 2d | P0 | N-028 | Low |
| N-122 | Load test: 10,000 notifications/hour | staging | 1d | P1 | N-122 | Medium |
| N-123 | NDPR compliance audit | all | 2d | P0 | N-116 | Low |
| N-124 | CBN compliance audit (OTP channels) | packages/otp | 1d | P0 | — | Low |
| N-125 | Template XSS security review | packages/notifications | 1d | P0 | N-030 | Low |
| N-126 | Email accessibility audit (WCAG 2.1 AA) | packages/notifications | 1d | P1 | N-038 | Low |
| N-127 | ADL-002 audit: confirm zero provider API keys in D1 | all | 1d | P0 | N-054 | Low |
| N-128 | Production rollout via feature flag per tenant | all | 2d | P0 | N-120-N-127 | Low |
| N-129 | 30-day production monitoring | monitoring | — | P0 | N-128 | Low |
| N-130 | Write operations runbooks | docs | 2d | P1 | N-107 | Low |

---

## 15. FINAL APPROVAL CRITERIA

The following checklist defines "implementation-ready." All blocking items must be resolved before any Phase 0 engineering work begins. Non-blocking items must be resolved before the phase they affect.

### Blocking — Must resolve before Phase 0 starts

- [ ] **OQ-001 resolved and documented:** Consumer Worker location decided (apps/projections or new apps/notificator)
- [ ] **N-007 unblocked:** CF Queues can be provisioned (CF account access confirmed, billing plan supports Queues)
- [ ] **OQ-002 resolved:** HITL escalation migration decision documented to prevent double-notification
- [ ] **ADL-002 guidance confirmed:** Platform security team confirms AES-256-GCM + KV as the only approved pattern for provider credentials
- [ ] **No N-040 duplicate:** Confirmed resolved in this document (Phase 3 = N-040 "Migrate templates"; Phase 4 starts at N-042)

### Blocking — Must resolve before Phase 1 starts

- [ ] CF Queues provisioned in CF account (staging + production)
- [ ] Producer bindings added to `apps/api/wrangler.toml` for staging and production
- [ ] Consumer bindings added to consumer Worker `wrangler.toml`
- [ ] `NOTIFICATION_QUEUE` binding added to consumer Worker `Env` type

### High — Must resolve before Phase 3 starts

- [ ] OQ-003 resolved: WhatsApp template approval workflow decided
- [ ] OQ-004 resolved: Tenant sender domain verification UX decided
- [ ] OQ-011 resolved: Low-data mode notification behavior decided
- [ ] `packages/i18n` team confirms they can accept notification-specific key additions (N-041)

### High — Must resolve before Phase 5 starts

- [ ] OQ-005 resolved: Partner/sub-partner brand hierarchy confirmed
- [ ] OQ-007 resolved: Digest engine timing model (global sweep vs per-tenant)
- [ ] OQ-010 resolved: Real-time push technology (Durable Objects vs polling)
- [ ] Unsubscribe landing page ownership confirmed in apps/tenant-public

### Medium — Must resolve before Phase 6 starts

- [ ] OQ-002 decision implemented: HITL escalation path in apps/projections handled
- [ ] NOTIFICATION_PIPELINE_ENABLED kill-switch implemented and tested
- [ ] Duplicate-send audit tooling confirmed working before migration begins

### Medium — Must resolve before Phase 8 starts

- [ ] OQ-006 resolved: Data retention TTLs and erasure approach legally approved
- [ ] OQ-008 resolved: Partner admin notification surface defined
- [ ] Attribution enforcement rules from white-label-policy.md confirmed with product team

### Definition of Implementation-Ready

A phase is implementation-ready when:
1. All blocking items for that phase are resolved
2. Exit criteria for the previous phase are confirmed passing
3. The relevant backlog tasks have been assigned to an engineer
4. The NOTIFICATION_PIPELINE_ENABLED kill-switch is in place for any phase that touches live email delivery

---

*This document is the single authoritative source of truth for the WebWaka notification engine implementation. It supersedes `docs/notification-engine-review.md` and `docs/notification-engine-audit.md` for all implementation purposes. All backlog task IDs, entity names, event key names, guardrail numbers, and phase numbers in this document are canonical.*
