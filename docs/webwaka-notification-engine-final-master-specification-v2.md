# WebWaka Notification Engine — Final Master Specification v2

**Version:** 2.1 (Section 13 Resolved + QA Corrections — Canonical Implementation-Ready)
**Date:** 2026-04-20
**Status:** CANONICAL IMPLEMENTATION-READY — All 13 architectural decisions resolved and propagated. Four QA-identified defects corrected (see `docs/webwaka-notification-engine-v2-fix-report.md`).
**Source Documents:**
— Document A: `docs/notification-engine-review.md` (original review — superseded)
— Document B: `docs/notification-engine-audit.md` (independent QA audit — superseded)
— Document C: `docs/webwaka-notification-engine-final-master-specification.md` (v1.0 — superseded)
— Document D: `docs/webwaka-notification-engine-section13-resolution.md` (Section 13 Resolution Pack — fully merged)
**Authority:** This v2 document supersedes all four source documents for all implementation purposes.

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
13. [Resolved Platform Decisions](#13-resolved-platform-decisions)
14. [Execution Backlog](#14-execution-backlog)
15. [Implementation Readiness Gate](#15-implementation-readiness-gate)

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
- A 16-entity domain model with security, retention, and compliance requirements
- A tenant-branded, locale-aware, versioned template system using existing `@webwaka/i18n`
- A phased 9-phase implementation roadmap with **~180 engineering days** estimated (revised from 165 after Section 13 resolution)
- 25 enforceable guardrails (20 original + 5 from Section 13 resolutions)
- **All 13 architectural decisions fully resolved** (see Section 13)
- A clean, de-duplicated, dependency-tracked backlog with unique IDs

### What Was Corrected From the Original Review

Five categories of verifiable defects in the original review were corrected in v1.0:

1. `apps/projections` and `apps/tenant-public` (two deployed production Workers) and six packages were not inspected — now added.
2. The entire partner ecosystem, bank-transfer FSM, transport FSM, B2B marketplace, and airtime routes had zero notification events — all added.
3. `channel_provider` stored provider API keys in D1 plaintext — corrected to follow ADL-002 (KV-encrypted credentials).
4. The template locale system was being reinvented from scratch — corrected to use the existing `@webwaka/i18n` package (P1 invariant).
5. A required "Open Questions and Decisions Needed" deliverable was missing — added and now fully resolved in this v2.
6. Backlog had duplicate task ID N-040 — corrected.

### What Changed in v2.0 (Section 13 Resolution Merge)

Thirteen architectural and operational decisions that were unresolved in v1.0 have been decided, justified, and propagated throughout this document. The key decisions are summarised in Section 13. Changes to architecture, domain model, roadmap, backlog, and guardrails are integrated throughout each affected section.

### What Changed in v2.1 (QA Correction Pass)

Four defects identified by the strict QA verification audit were corrected:

1. **G12 — digest engine tenant isolation clause added.** The resolution pack mandated an addition to G12 requiring per-batch tenant isolation in `processDigestBatch()`. This clause was missing from v2.0. Now present in G12.
2. **OQ-013 Section 13 body — enterprise cap corrected; business tier added.** v2.0 stated "max 250 subscriptions" for enterprise (incorrect) and omitted the business-tier cap entirely. Corrected to: standard max 25; business max 100; enterprise unlimited — consistent with G25 and the resolution pack.
3. **Section 15 phase gate — OQ-008 moved to correct phase.** v2.0 placed the OQ-008 gate under "Before Phase 5 Begins." N-091a is a Phase 6 task. Gate moved to "Before Phase 6 Begins."
4. **N-012a — reconciliation note added; downstream N-008 reference corrected.** The resolution pack defined N-012a as the Worker skeleton scaffold (which v2.0 merged into the updated N-008). v2.0 silently repurposed N-012a for the CRON digest handler. A reconciliation note is now embedded in the N-012a backlog entry, and the OQ-001 rationale text that incorrectly cited N-012a as the 2d scaffold cost has been corrected to cite N-008.

---

## 2. SOURCE DOCUMENT RECONCILIATION

### What Document A (Review) Got Right — Preserved

| Area | Judgement |
|---|---|
| EmailService, OTP, WebhookDispatcher findings | Accurate, code-grounded, fully preserved |
| @webwaka/events gap analysis | Correct. In-memory subscriber, no notification consumers, no Queues — preserved |
| 9-layer reference architecture | Fundamentally sound, preserved with additions |
| 13-entity domain model | Correct foundation, expanded in this spec |
| G1–G15 guardrails | Specific and enforceable, preserved and extended to G25 |
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
| HITL events partially in projections | Events aligned; HITL migration resolved in Section 13 OQ-002 |
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
| No "Open Questions" deliverable | Added and fully resolved in Section 13 |
| Duplicate backlog ID N-040 | Renumbered; backlog fully de-duplicated |
| No data retention policy | Added to domain model, guardrails, and backlog |
| USSD notification path undefined | Resolved: SMS immediately; in-app queued; never interrupt session |

### What Section 13 Resolution Pack Resolved and Merged (v2.0)

| Decision | Resolution Summary |
|---|---|
| OQ-001 Queue Consumer Location | New `apps/notificator` dedicated Worker |
| OQ-002 HITL Escalation Ownership | Kill-switch bridge (`HITL_LEGACY_NOTIFICATIONS_ENABLED`); retire legacy in Phase 9 |
| OQ-003 WhatsApp Template Approval | Platform-operated WABA; operator submits; `notification_wa_approval_log` added |
| OQ-004 Sender Domain Verification | Platform sender fallback during verification; status in brand-runtime |
| OQ-005 Brand Hierarchy | Walk to platform default; `brand_independence_mode` flag on sub-partners |
| OQ-006 Retention and NDPR Erasure | TTLs confirmed; audit log PII zeroed, not deleted |
| OQ-007 Digest Timing | Queue-continued global CRON sweep |
| OQ-008 Partner Admin Surface | Shared inbox schema; `category='partner'`; surfaced in apps/partner-admin |
| OQ-009 USSD Handling | SMS immediately; in-app queued; no USSD session interruption |
| OQ-010 Real-Time Inbox Push | Short-poll 30s default; SSE as future upgrade path |
| OQ-011 Low-Data Mode | Push suspended; in-app text-only; email unaffected; SMS for critical |
| OQ-012 Sandbox Mode | Strict redirect to `NOTIFICATION_SANDBOX_*` env addresses |
| OQ-013 Webhook Expansion | 30-event curated starter; enterprise full catalog; 25-subscription standard cap |

### What Remains Open

All 13 architectural decisions have been resolved in this v2. No items remain open. Implementation may proceed as soon as Phase 0 blocking gates (Section 15) are met.

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
| `apps/projections` | Full | **[AUDIT ADDITION]** Event projection Worker; CRON for search rebuild, HITL expiry sweep, L3 escalation; uses `@webwaka/events`; critical notification-adjacent Worker |
| `apps/tenant-public` | Full | **[AUDIT ADDITION]** Tenant white-label public pages Worker; owns the unsubscribe landing page path |

### Packages Inspected

| Package | Review Depth | Notes |
|---|---|---|
| `packages/events` | Full | Domain event bus, publisher, in-memory subscriber, projections |
| `packages/otp` | Full | Multi-channel OTP with waterfall and rate limiting |
| `packages/logging` | Full | Structured JSON logger with PII masking |
| `packages/auth` | Full | JWT issuing and verification |
| `packages/entitlements` | Full | CBN KYC tiers, plan-based feature gating |
| `packages/payments` | Full | Paystack integration, subscription sync |
| `packages/offline-sync` | Full | Dexie.js PWA offline sync + service worker |
| `packages/white-label-theming` | Full | Tenant theme tokens, CSS vars, KV caching |
| `packages/superagent` | Full | AI consent, usage metering, credit burn, NDPR |
| `packages/negotiation` | Full | Negotiation session lifecycle |
| `packages/types` | Full | Shared TypeScript types |
| `packages/i18n` | Full | **[AUDIT ADDITION]** Production i18n with 6 locales: en, ha, yo, ig, pcm, fr. Must be used by the notification template locale system. |
| All 160+ vertical packages | Pattern-sampled | Structure and event emission patterns sampled. Fully read: `verticals-pos-business`, `verticals-school`, `verticals-hospital`, `verticals-restaurant`, `verticals-farm`. |

### Infra and Docs Inspected

- All 253 D1 migration files (scanned for notification-relevant schema — none found)
- `apps/api/wrangler.toml` — confirmed **zero** `[[queues.producers]]` or `[[queues.consumers]]` bindings
- `infra/cloudflare/`, GitHub Actions workflows
- `docs/governance/platform-invariants.md` — P1-P8, T1-T10
- `docs/governance/security-baseline.md` — ADL-002 (encrypted secrets in KV, not D1)
- `scripts/governance-checks/` — 10+ CI governance scripts

### Confidence Levels

**HIGH:** All existing notification primitives. All missing infrastructure. All silent workflow gaps. Database schema.

**MEDIUM:** Exact vertical domain event semantics (sampled). Cloudflare Queues account-level limits for this deployment.

**KNOWN BLIND SPOTS:** Live provider credentials and configured rate limits. Real-world traffic volumes affecting throttling.

---

## 4. CURRENT-STATE FINDINGS

### 4.1 What Exists Today

#### A. Email Delivery — `apps/api/src/lib/email-service.ts`

A single `EmailService` class wraps the Resend REST API directly. Supports 6 hardcoded templates:

| Template | Trigger |
|---|---|
| `welcome` | New user registration |
| `template-purchase-receipt` | Paid template purchase verified |
| `workspace-invite` | Admin invites member |
| `payment-confirmation` | Paystack payment verified |
| `password-reset` | Forgot-password flow |
| `email-verification` | Email address verification |

**Critical facts:** FROM hardcoded `noreply@webwaka.com`. No tenant branding. No delivery tracking. No retry at notification layer. No idempotency key. No audit log. No preference check.

#### B. OTP Delivery — `packages/otp/`

Multi-channel OTP: SMS (Termii) → WhatsApp (Meta Cloud v18 / 360dialog) → Telegram Bot. R8 enforced: transaction OTPs route only to SMS. Raw OTP never stored — SHA-256 hashed only.

#### C. Webhook System — `apps/api/src/lib/webhook-dispatcher.ts`

HMAC-SHA256 signed outbound webhooks. 4 registered event types. **Critical:** retry is inline and blocking — explicitly flagged in code comment as "should be Cloudflare Queues but not yet implemented." No Queues backing. No health dashboard. No dead-letter inspection.

#### D. Domain Event Bus — `packages/events/`

In-process domain event bus with D1-persisted event log. 16 event types. Zero notification handlers wired. In-memory subscriber cleared on cold start. No CF Queues consumer.

#### E. `apps/projections` — Notification-Adjacent Worker

Deployed Cloudflare Worker with D1 binding, CRON triggers, `@webwaka/events` import. Runs: search index rebuild (15min), HITL expiry sweep + L3 escalation (4hr), daily analytics snapshot. This is the only deployed Worker that currently does anything resembling notification dispatch (HITL L3 escalation). The new `apps/notificator` Worker takes ownership of queue-based notification dispatch (OQ-001 resolved — see Section 13).

#### F. Monitoring Alert — `apps/api/src/middleware/monitoring.ts`

Error rate threshold fires to `ALERT_WEBHOOK_URL`. In-memory counters. No Slack/Teams formatting.

#### G. White-Label Theming — `packages/white-label-theming`

Brand tokens (color, logo, domain) stored per workspace. Never applied to email templates.

#### H. i18n Package — `packages/i18n`

6 language files: en, ha, yo, ig, pcm, fr. `detectLocale(request)` resolves locale. **Must be used** as the canonical locale resolution mechanism for notification templates.

### 4.2 What Partially Exists

| Capability | State |
|---|---|
| Email delivery | Exists; no tenant branding, no tracking, no preferences, no versioned templates |
| OTP delivery | Good; no per-tenant customization |
| Webhook outbound | Works; inline-blocking retry, only 4 event types, no Queues backing |
| Domain event bus | Schema and publisher exist; in-memory subscriber; zero notification handlers |
| Brand/theme system | Token system exists; never applied to outbound comms |
| HITL escalation | In `apps/projections` CRON; not unified with notification pipeline |

### 4.3 Silent Workflow Gaps

| Route / System | Zero-notification transitions |
|---|---|
| `billing.ts` | Plan change, cancel, grace period, suspension |
| `payments.ts` | Payment failure |
| `onboarding.ts` | Step completion, checklist completion |
| `support.ts` | Ticket creation, status changes, resolution |
| `negotiation.ts` | Session creation, offers, acceptance, rejection, expiry |
| `bank-transfer.ts` | Order created, proof submitted, confirmed, rejected, expired, dispute |
| `b2b-marketplace.ts` | RFQ submitted, RFQ responded, order confirmed |
| `airtime.ts` | Top-up completed, top-up failed |
| `transport.ts` | Motor park FSM change, rideshare FSM change, route licensed |
| `partners.ts` | Partner registered, status changed, entitlement granted, sub-partner created |
| All 160+ verticals | Every order, appointment, payment, delivery, stock event |

---

## 5. CANONICAL NOTIFICATION EVENT CATALOG

**Naming convention (mandatory):** `{domain}.{aggregate}.{action}` — lowercase, dot-separated.

**Legend:** Channels: `E`=Email `S`=SMS `W`=WhatsApp `T`=Telegram `P`=Push `I`=In-App `K`=Webhook | RT = Real-time; Digest = can be batched | Status: `EXISTS` / `PARTIAL` / `MISSING`

---

### Domain: auth.identity

| Event Key | Trigger | Actor Type | Audience | Channels | Severity | RT/Digest | Compliance | Status |
|---|---|---|---|---|---|---|---|---|
| `auth.user.registered` | POST /auth/register | system | user | E, I | info | RT | NDPR | PARTIAL |
| `auth.user.email_verification_sent` | POST /auth/send-verification | user | user | E | info | RT | NDPR | PARTIAL |
| `auth.user.email_verified` | GET /auth/verify-email | user | user | E, I | info | RT | NDPR | MISSING |
| `auth.user.password_reset_requested` | POST /auth/forgot-password | user | user | E | high | RT | NDPR, Sec | PARTIAL |
| `auth.user.password_reset_completed` | POST /auth/reset-password | user | user | E, I | high | RT | NDPR, Sec | MISSING |
| `auth.user.password_changed` | POST /auth/change-password | user | user | E, I | high | RT | Security | MISSING |
| `auth.user.login_success` | POST /auth/login | user | user | I | info | Digest | Security | MISSING |
| `auth.user.login_failed` | POST /auth/login | unknown | workspace_admins | I | warn | Digest | Security | MISSING |
| `auth.user.account_locked` | OTP lock / auth system | system | user, admin | E, S, I | critical | RT | Security | MISSING |
| `auth.user.profile_updated` | PATCH /auth/profile | user | user | I | info | Digest | NDPR | MISSING |
| `auth.user.data_erased` | DELETE /auth/me | user | user, super_admin | E, I | high | RT | NDPR Art.3.1(9) | MISSING |
| `auth.session.revoked` | DELETE /auth/sessions/:id | user | user | I | warn | RT | Security | MISSING |
| `auth.session.all_revoked` | DELETE /auth/sessions | user | user | E, I | warn | RT | Security | MISSING |
| `auth.api_key.created` | POST /auth/api-keys | user | user | I | info | RT | Security | MISSING |
| `auth.api_key.revoked` | DELETE /auth/api-keys/:id | user | user | E, I | warn | RT | Security | MISSING |

---

### Domain: workspace.membership

| Event Key | Trigger | Audience | Channels | Severity | RT/Digest | Status |
|---|---|---|---|---|---|---|
| `workspace.workspace.created` | POST /auth/register | user, super_admin | E, I | info | RT | PARTIAL |
| `workspace.invite.sent` | POST /auth/invite | invitee | E | info | RT | PARTIAL |
| `workspace.invite.accepted` | POST /auth/accept-invite | admin | E, I | info | RT | MISSING |
| `workspace.invite.expired` | Cron / system | admin | I | warn | Digest | MISSING |
| `workspace.member.added` | webhook event | new_member, admin | E, I, K | info | RT | PARTIAL |
| `workspace.member.removed` | admin action | removed_user | E, I | warn | RT | MISSING |
| `workspace.member.role_changed` | admin action | affected_user | I | info | RT | MISSING |
| `workspace.workspace.activated` | payment verified | admin | E, I | info | RT | PARTIAL |
| `workspace.workspace.suspended` | billing enforcement | admin | E, S, I | critical | RT | MISSING |
| `workspace.workspace.deprovisioned` | admin action | admin | E, I | critical | RT | MISSING |

---

### Domain: billing.subscription

| Event Key | Trigger | Audience | Channels | Severity | RT/Digest | Status |
|---|---|---|---|---|---|---|
| `billing.payment.initialized` | POST /workspaces/:id/upgrade | user | I | info | RT | PARTIAL |
| `billing.payment.completed` | POST /payments/verify | user | E, I, K | high | RT | PARTIAL |
| `billing.payment.failed` | POST /payments/verify | user | E, S, I | critical | RT | PARTIAL |
| `billing.subscription.plan_changed` | POST /billing/change-plan | admin | E, I | info | RT | MISSING |
| `billing.subscription.cancelled` | POST /billing/cancel | admin | E, I | warn | RT | MISSING |
| `billing.subscription.cancel_reverted` | POST /billing/revert-cancel | admin | E, I | info | RT | MISSING |
| `billing.subscription.entering_grace` | /billing/enforce cron | admin | E, S, I | critical | RT | MISSING |
| `billing.subscription.suspended` | /billing/enforce cron | admin | E, S, I | critical | RT | MISSING |
| `billing.subscription.reactivated` | POST /billing/reactivate | admin | E, I | info | RT | MISSING |
| `billing.subscription.expiring_soon` | Scheduled job | admin | E, I | warn | RT | MISSING |
| `billing.quota.approaching_limit` | Usage check | admin | E, I | warn | Digest | MISSING |
| `billing.quota.limit_reached` | Usage check | admin, user | E, S, I | critical | RT | MISSING |

---

### Domain: kyc.identity

| Event Key | Trigger | Audience | Channels | Severity | RT/Digest | Compliance | Status |
|---|---|---|---|---|---|---|---|
| `kyc.user.otp_sent` | POST /identity/otp | user | S, W, T | info | RT | NDPR, CBN | PARTIAL |
| `kyc.user.otp_verified` | POST /identity/verify-otp | user | I | info | RT | CBN | MISSING |
| `kyc.user.tier_upgraded` | KYC result | user | E, I | info | RT | CBN NRBVR | MISSING |
| `kyc.user.bvn_verified` | Prembly webhook | user | E, I | info | RT | CBN, NDPR | MISSING |
| `kyc.user.nin_verified` | Prembly webhook | user | E, I | info | RT | CBN, NDPR | MISSING |
| `kyc.user.limit_blocked` | Transaction attempt | user | I, S | warn | RT | CBN | MISSING |

---

### Domain: partner.ecosystem

| Event Key | Trigger | Audience | Channels | Severity | RT/Digest | Status |
|---|---|---|---|---|---|---|
| `partner.partner.registered` | POST /partners | super_admin | E, I | info | RT | MISSING |
| `partner.partner.status_changed` | PATCH /partners/:id/status | partner_admin | E, I | high | RT | MISSING |
| `partner.entitlement.granted` | POST /partners/:id/entitlements | partner_admin | E, I | info | RT | MISSING |
| `partner.sub_partner.created` | POST /partners/:id/sub-partners | partner_admin | E, I | info | RT | MISSING |
| `partner.sub_partner.status_changed` | PATCH sub-partner status | partner_admin | E, I | high | RT | MISSING |
| `partner.credit.allocated` | Credit allocation | partner_admin | E, I | info | RT | MISSING |

Partner events use `audience_type = 'partner_admins'`, `category = 'partner'` in inbox items, and surface in `apps/partner-admin` via the shared inbox API (OQ-008 resolved).

---

### Domain: bank_transfer.payment

| Event Key | Trigger | Audience | Channels | Severity | RT/Digest | Status |
|---|---|---|---|---|---|---|
| `bank_transfer.order.created` | POST /bank-transfer | buyer, seller | E, S, I | info | RT | MISSING |
| `bank_transfer.proof.submitted` | POST /bank-transfer/:id/proof | seller | E, S, I | high | RT | MISSING |
| `bank_transfer.order.confirmed` | POST /bank-transfer/:id/confirm | buyer | E, S, I | high | RT | MISSING |
| `bank_transfer.order.rejected` | POST /bank-transfer/:id/reject | buyer | E, S, I | high | RT | MISSING |
| `bank_transfer.order.expired` | Scheduled expiry | buyer, seller | E, S, I | high | RT | MISSING |
| `bank_transfer.dispute.raised` | POST /bank-transfer/:id/dispute | buyer, seller, admin | E, I | high | RT | MISSING |
| `bank_transfer.dispute.resolved` | Dispute resolution | buyer, seller | E, I | high | RT | MISSING |

---

### Domain: b2b.marketplace

| Event Key | Trigger | Audience | Channels | Severity | Status |
|---|---|---|---|---|---|
| `b2b.rfq.submitted` | B2B RFQ route | supplier | E, I | info | MISSING |
| `b2b.rfq.responded` | B2B RFQ route | buyer | E, I | info | MISSING |
| `b2b.order.confirmed` | B2B order route | buyer, supplier | E, I, K | high | MISSING |

---

### Domain: airtime

| Event Key | Trigger | Audience | Channels | Severity | Status |
|---|---|---|---|---|---|
| `airtime.topup.completed` | POST /airtime (success) | user | I, S | info | MISSING |
| `airtime.topup.failed` | POST /airtime (failure) | user | I, S | warn | MISSING |

---

### Domain: transport.vertical

| Event Key | Trigger | Audience | Channels | Severity | Status |
|---|---|---|---|---|---|
| `transport.motorpark.status_changed` | POST /transport/motor-park/:id/transition | operator | E, I | info | MISSING |
| `transport.rideshare.status_changed` | POST /transport/rideshare/:id/transition | driver | I | info | MISSING |
| `transport.route.licensed` | POST /transport/routes/:id/license | operator | E, I | info | MISSING |

---

### Domain: claim.profile

| Event Key | Trigger | Audience | Channels | Severity | Status |
|---|---|---|---|---|---|
| `claim.claim.intent_captured` | Claim route | user, admin | I | info | PARTIAL |
| `claim.claim.advanced` | Claim route | user | E, I | info | PARTIAL |
| `claim.claim.approved` | Claim route | user | E, I | high | PARTIAL |
| `claim.claim.rejected` | Claim route | user | E, I | high | PARTIAL |
| `claim.claim.evidence_requested` | Admin action | user | E, I | warn | MISSING |
| `claim.document.uploaded` | Claim route | admin | I | info | MISSING |
| `claim.claim.counter_claimed` | Claim route | claimant, admin | E, I | high | MISSING |

---

### Domain: negotiation

| Event Key | Trigger | Audience | Channels | Severity | Status |
|---|---|---|---|---|---|
| `negotiation.session.created` | Negotiation route | counterparty | I, S | info | MISSING |
| `negotiation.session.offer_updated` | Negotiation route | counterparty | I, S | info | MISSING |
| `negotiation.session.accepted` | Negotiation route | both_parties | E, I, S | high | MISSING |
| `negotiation.session.rejected` | Negotiation route | initiator | I, S | warn | MISSING |
| `negotiation.session.expired` | Cron job | both_parties | I, S | warn | MISSING |
| `negotiation.session.cancelled` | Admin/cron | both_parties | I, S | warn | MISSING |
| `negotiation.payment.timeout` | Cron job | initiator | E, S, I | high | MISSING |

---

### Domain: support

| Event Key | Trigger | Audience | Channels | Severity | Status |
|---|---|---|---|---|---|
| `support.ticket.created` | POST /support/tickets | admin, super_admin | E, I | info | MISSING |
| `support.ticket.status_changed` | PATCH /support/tickets/:id | ticket_creator | E, I | info | MISSING |
| `support.ticket.assigned` | PATCH /support/tickets/:id | assignee | E, I | info | MISSING |
| `support.ticket.resolved` | PATCH /support/tickets/:id | ticket_creator | E, I | info | MISSING |
| `support.ticket.comment_added` | Support route | other_parties | I | info | MISSING |

---

### Domain: templates.marketplace

| Event Key | Trigger | Audience | Channels | Severity | Status |
|---|---|---|---|---|---|
| `template.template.published` | POST /templates (super_admin) | all_tenants | I | info | MISSING |
| `template.template.installed` | POST /templates/:slug/install | admin | I, K | info | PARTIAL |
| `template.template.purchased` | POST /templates/:slug/purchase/verify | user | E, K | info | PARTIAL |
| `template.template.install_rolled_back` | DELETE /templates/:slug/install | admin | I | warn | MISSING |
| `template.template.update_available` | Version check | installing_tenants | I | info | MISSING |

---

### Domain: ai.superagent

| Event Key | Trigger | Audience | Channels | Severity | Status |
|---|---|---|---|---|---|
| `ai.consent.granted` | POST /superagent/consent | user | I | info | MISSING |
| `ai.consent.revoked` | DELETE /superagent/consent | user | E, I | info | MISSING |
| `ai.credit.exhausted` | Credit burn fails | user, admin | E, I | critical | MISSING |
| `ai.credit.low` | Usage threshold | admin | E, I | warn | MISSING |
| `ai.request.hitl_escalated` | HITL service | admin | E, I | high | MISSING |
| `ai.hitl.request_expired` | `apps/notificator` CRON (migrated from projections — OQ-002) | admin | E, I | high | PARTIAL |
| `ai.hitl.escalated_to_l3` | `apps/notificator` CRON (migrated from projections — OQ-002) | super_admin | E, I | critical | PARTIAL |
| `ai.provider.failover` | resolveAdapter | super_admin | I | warn | MISSING |
| `ai.recommendation.generated` | SuperAgent chat | user | I | info | MISSING |

---

### Domain: onboarding

| Event Key | Trigger | Audience | Channels | Severity | Status |
|---|---|---|---|---|---|
| `onboarding.step.completed` | PUT /onboarding/:id/:step | admin | I | info | MISSING |
| `onboarding.checklist.completed` | Last step | admin | E, I | info | MISSING |
| `onboarding.step.stalled` | Scheduled job | admin | E, I | warn | MISSING |

---

### Domain: pos.finance

| Event Key | Trigger | Audience | Channels | Severity | Status |
|---|---|---|---|---|---|
| `pos.transaction.completed` | POS routes | user | I, S | info | MISSING |
| `pos.transaction.failed` | POS routes | user | I, S | warn | MISSING |
| `pos.float.low` | Float ledger check | manager | I, S | warn | MISSING |
| `pos.reconciliation.ready` | Reconciliation route | manager | E, I | info | MISSING |

---

### Domain: social.engagement

| Event Key | Trigger | Audience | Channels | Severity | RT/Digest | Status |
|---|---|---|---|---|---|---|
| `social.post.liked` | Social routes | post_author | I | info | Digest | MISSING |
| `social.post.commented` | Social routes | post_author | I | info | Digest | MISSING |
| `social.profile.followed` | Social routes | target_user | I | info | Digest | MISSING |
| `social.community.member_joined` | Community routes | community_admin | I | info | Digest | MISSING |
| `social.community.post_created` | Community routes | members | I | info | Digest | MISSING |

---

### Domain: vertical.canonical *(applies to all 160+ vertical packages)*

| Event Key | Trigger | Audience | Channels | Severity | RT/Digest |
|---|---|---|---|---|---|
| `vertical.order.created` | Order route | merchant, customer | E, S, I | info | RT |
| `vertical.order.status_changed` | Order route | customer | E, S, I | info | RT |
| `vertical.appointment.booked` | Appointment route | provider, customer | E, S, I | info | RT |
| `vertical.appointment.reminder` | Scheduled job | customer | S, W, I | info | RT |
| `vertical.payment.received` | POS / payment route | merchant | E, I | info | RT |
| `vertical.stock.low` | Inventory check | merchant | E, I | warn | Digest |
| `vertical.delivery.dispatched` | Logistics route | customer | S, W, I | info | RT |
| `vertical.delivery.arrived` | Logistics route | customer | S, W, I | info | RT |

---

### Domain: system.infrastructure

| Event Key | Trigger | Audience | Channels | Severity | Status |
|---|---|---|---|---|---|
| `system.error_rate.spike` | monitoring middleware | super_admin | K (Slack/Teams) | critical | PARTIAL |
| `system.latency.degraded` | monitoring middleware | super_admin | I | warn | MISSING |
| `system.provider.down` | Health check | super_admin | E, K | critical | MISSING |
| `system.migration.applied` | CI/CD | super_admin | I | info | MISSING |

---

### Domain: governance.compliance

| Event Key | Trigger | Audience | Channels | Severity | Status |
|---|---|---|---|---|---|
| `governance.audit.exported` | Admin action | super_admin | E, I | info | MISSING |
| `governance.data_breach.suspected` | Security system | super_admin, legal | E, K | critical | MISSING |
| `governance.consent.updated` | User action | user, admin | E, I | info | MISSING |
| `governance.retention.expiring` | Scheduled job | admin | I | warn | MISSING |

---

**Total canonical events: ~110** across 15 domains.

---

## 6. MISSING ELEMENTS LIST

### 6.1 Architecture Gaps

| Gap | Severity | Status in v2 |
|---|---|---|
| Reliable event capture (transactional outbox) | Critical | To implement (Phase 1) |
| Durable event transport (CF Queues not provisioned) | Critical | N-007 Phase 0 |
| Notification rule engine | Critical | N-021 Phase 2 |
| Preference resolution pipeline | Critical | N-060 Phase 5 |
| Tenant/brand context in delivery | Critical | N-031 Phase 3 |
| CF Queues consumer Worker | Critical | **Resolved OQ-001: `apps/notificator`** |
| Application-level DLQ | High | Layer 9 / N-010 |
| Real-time push technology | High | **Resolved OQ-010: short-poll 30s** |
| Idempotency at notification level | High | N-023 Phase 2 |
| Notification inbox persistence | High | N-024 Phase 2 |
| Digest/batching engine | High | **Resolved OQ-007: Queue-continued CRON** |
| Quiet hours / timezone-aware DND | High | N-062 Phase 5 |
| Multi-level brand context | High | **Resolved OQ-005: walk with `brand_independence_mode`** |
| USSD notification strategy | Medium | **Resolved OQ-009: SMS immediately** |
| WhatsApp template approval process | Medium | **Resolved OQ-003: platform-operated WABA** |
| Sender domain verification UX | Medium | **Resolved OQ-004: platform fallback during verification** |
| Partner admin notification surface | Medium | **Resolved OQ-008: shared inbox + category filter** |
| Webhook expansion scope | Medium | **Resolved OQ-013: 30-event starter set** |
| Low-data mode handling | Medium | **Resolved OQ-011: tiered restrictions** |
| Sandbox/test mode | Medium | **Resolved OQ-012: NOTIFICATION_SANDBOX_MODE redirect** |
| Data retention and erasure | Medium | **Resolved OQ-006: TTLs confirmed + zero-out** |

### 6.2 Product/Feature Gaps

| Gap | Description |
|---|---|
| In-app notification center | No inbox table, no UI, no read/unread/archived state |
| Notification preferences UI | No way for users to manage channel preferences |
| Template editor | No tenant-customizable templates |
| Delivery status tracking | Open, click, bounce, unsubscribe not tracked |
| Push notifications | No web push; no mobile push |
| Digest emails | No daily/weekly digest capability |
| 160+ vertical business events | All produce zero notifications |
| Partner ecosystem notifications | Zero notification wiring |
| Bank-transfer FSM notifications | High-value FSM fully silent |

### 6.3 Data Model Gaps

No schema exists in any of the 253 migration files for the following (confirmed):

- `notification_event`, `notification_rule`, `notification_preference`, `notification_template`
- `notification_delivery`, `notification_inbox_item`
- `notification_digest_batch`, `notification_digest_batch_item`
- `notification_audit_log`, `notification_subscription`
- `notification_suppression_list`, `escalation_policy`, `channel_provider`, `push_token`
- `notification_wa_approval_log` *(new in v2 — OQ-003)*
- `webhook_event_types` *(new in v2 — OQ-013)*

### 6.4 Governance and Compliance Gaps

| Gap | Status |
|---|---|
| Consent gating for marketing | To implement (Phase 5) |
| Email unsubscribe handling | N-039 Phase 3 |
| Data retention policy | **Resolved OQ-006: TTLs defined** |
| Provider credential exposure | Corrected in v1: ADL-002 pattern |
| NDPR erasure propagation | **Resolved OQ-006: zero-out approach** |

### 6.5 Infrastructure Gaps

| Gap | Status |
|---|---|
| CF Queues not provisioned | N-007 Phase 0 |
| No consumer Worker | **Resolved OQ-001: `apps/notificator`** |
| `apps/projections` HITL escalation not unified | **Resolved OQ-002: kill-switch bridge; retire Phase 9** |
| D1 write throughput limits | Monitor under load test (N-122) |

---

## 7. CANONICAL DOMAIN MODEL

### Entities Overview

| Entity | Purpose | T3 Scoped |
|---|---|---|
| `notification_event` | Normalized trigger record | Yes |
| `notification_rule` | Event-to-audience-to-channel routing | Nullable (platform default) |
| `notification_preference` | Scoped preference overrides | Yes |
| `notification_template` | Versioned multi-channel templates | Nullable (platform default) |
| `notification_delivery` | Full delivery lifecycle | Yes |
| `notification_inbox_item` | In-app notification center | Yes |
| `notification_digest_batch` | Digest grouping metadata | Yes |
| `notification_digest_batch_item` | Digest event join table | Yes |
| `notification_audit_log` | Immutable send audit trail (7-year retention) | Yes |
| `notification_subscription` | User-controlled topic opt-ins | Yes |
| `notification_suppression_list` | Bounce/unsubscribe suppression | Nullable (platform global) |
| `escalation_policy` | SLA-driven escalation rules | Nullable (platform default) |
| `channel_provider` | Provider config + credential reference | Nullable (platform default) |
| `push_token` | Web/mobile push token registry | Yes |
| `notification_wa_approval_log` | WhatsApp template submission tracking *(v2 — OQ-003)* | No (platform-level) |
| `webhook_event_types` | Registry of available webhook events with plan tier *(v2 — OQ-013)* | No (platform-level) |

---

### `notification_event`

```sql
id                  TEXT PRIMARY KEY          -- notif_evt_<uuid>
event_key           TEXT NOT NULL             -- e.g. 'auth.user.registered'
domain              TEXT NOT NULL             -- e.g. 'auth', 'billing'
aggregate_type      TEXT NOT NULL             -- e.g. 'user', 'workspace'
aggregate_id        TEXT NOT NULL
tenant_id           TEXT NOT NULL             -- T3: always required
actor_type          TEXT NOT NULL             -- 'user'|'system'|'admin'|'unknown'
actor_id            TEXT
subject_type        TEXT
subject_id          TEXT
payload             TEXT NOT NULL             -- JSON: event-specific context variables
correlation_id      TEXT
source              TEXT NOT NULL DEFAULT 'api'  -- [v2 OQ-009] 'api'|'ussd_gateway'|'cron'|'queue_consumer'
severity            TEXT NOT NULL DEFAULT 'info'
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
processed_at        INTEGER
```

Indexes: `(tenant_id, event_key)`, `(aggregate_type, aggregate_id)`, `(created_at)`, `(source)`

---

### `notification_rule`

```sql
id                  TEXT PRIMARY KEY          -- rule_<uuid>
tenant_id           TEXT
event_key           TEXT NOT NULL
rule_name           TEXT NOT NULL
enabled             INTEGER NOT NULL DEFAULT 1
audience_type       TEXT NOT NULL             -- 'actor'|'subject'|'workspace_admins'|'tenant_admins'|'all_members'|'super_admins'|'partner_admins'|'custom'
audience_filter     TEXT
channels            TEXT NOT NULL             -- JSON array: ['email','sms','push','in_app']
channel_fallback    TEXT
template_family     TEXT NOT NULL
priority            TEXT NOT NULL DEFAULT 'normal'
digest_eligible     INTEGER NOT NULL DEFAULT 0
min_severity        TEXT NOT NULL DEFAULT 'info'
feature_flag        TEXT
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

---

### `notification_preference`

```sql
id                  TEXT PRIMARY KEY          -- pref_<uuid>
scope_type          TEXT NOT NULL             -- 'platform'|'tenant'|'role'|'user'
scope_id            TEXT NOT NULL
tenant_id           TEXT NOT NULL
event_key           TEXT NOT NULL             -- '*' for all-events catch-all
channel             TEXT NOT NULL
enabled             INTEGER NOT NULL DEFAULT 1
quiet_hours_start   INTEGER
quiet_hours_end     INTEGER
timezone            TEXT DEFAULT 'Africa/Lagos'
digest_window       TEXT                      -- 'none'|'hourly'|'daily'|'weekly'
low_data_mode       INTEGER NOT NULL DEFAULT 0  -- [v2 OQ-011] 1 = low-data restrictions apply
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

**Inheritance chain:** platform → tenant → role → user. More specific scope wins. KV-cached (5-min TTL; key prefix: `{tenant_id}:pref:`).

---

### `notification_template`

```sql
id                    TEXT PRIMARY KEY          -- tpl_notif_<uuid>
tenant_id             TEXT
template_family       TEXT NOT NULL
channel               TEXT NOT NULL
locale                TEXT NOT NULL DEFAULT 'en'
version               INTEGER NOT NULL DEFAULT 1
status                TEXT NOT NULL DEFAULT 'draft'
whatsapp_approval_status  TEXT DEFAULT 'not_required'
  -- 'not_required'|'pending_meta_approval'|'meta_approved'|'meta_rejected'
meta_template_name    TEXT                      -- [v2 OQ-003] Meta's internal template name
meta_template_id      TEXT                      -- [v2 OQ-003] Meta's template ID
meta_rejection_reason TEXT                      -- [v2 OQ-003] Populated on meta_rejected
subject_template      TEXT
body_template         TEXT NOT NULL
preheader_template    TEXT
cta_label             TEXT
cta_url_template      TEXT
variables_schema      TEXT NOT NULL
created_by            TEXT
published_at          INTEGER
created_at            INTEGER NOT NULL DEFAULT (unixepoch())
updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
```

**Locale values** must match `SupportedLocale` from `@webwaka/i18n`: `'en'|'ha'|'yo'|'ig'|'pcm'|'fr'`

---

### `notification_delivery`

```sql
id                    TEXT PRIMARY KEY          -- delivery_<uuid>
notification_event_id TEXT NOT NULL
tenant_id             TEXT NOT NULL
recipient_id          TEXT NOT NULL
recipient_type        TEXT NOT NULL
channel               TEXT NOT NULL
provider              TEXT NOT NULL
template_id           TEXT NOT NULL
status                TEXT NOT NULL DEFAULT 'queued'
  -- 'queued'|'rendering'|'dispatched'|'delivered'|'opened'|'clicked'|'failed'|'suppressed'|'dead_lettered'
provider_message_id   TEXT
attempts              INTEGER NOT NULL DEFAULT 0
last_error            TEXT
source                TEXT NOT NULL DEFAULT 'api'  -- [v2 OQ-009] mirrors notification_event.source
sender_fallback_used  INTEGER NOT NULL DEFAULT 0   -- [v2 OQ-004] 1 = platform sender used (domain unverified)
sandbox_redirect      INTEGER NOT NULL DEFAULT 0   -- [v2 OQ-012] 1 = redirected to sandbox address
sandbox_original_recipient_hash TEXT              -- [v2 OQ-012] SHA-256 of original address (audit only)
created_at            INTEGER NOT NULL DEFAULT (unixepoch())
queued_at             INTEGER NOT NULL DEFAULT (unixepoch())
dispatched_at         INTEGER
delivered_at          INTEGER
opened_at             INTEGER
clicked_at            INTEGER
failed_at             INTEGER
idempotency_key       TEXT UNIQUE
correlation_id        TEXT
```

---

### `notification_inbox_item`

```sql
id                    TEXT PRIMARY KEY          -- inbox_<uuid>
tenant_id             TEXT NOT NULL
user_id               TEXT NOT NULL
notification_event_id TEXT NOT NULL
delivery_id           TEXT NOT NULL             -- FK to notification_delivery
title                 TEXT NOT NULL
body                  TEXT NOT NULL
cta_url               TEXT
icon_type             TEXT DEFAULT 'info'
category              TEXT                      -- 'billing'|'auth'|'workspace'|'partner'|'vertical'|etc.
text_only_mode        INTEGER NOT NULL DEFAULT 0  -- [v2 OQ-011] 1 = render without images in low-data mode
read_at               INTEGER
archived_at           INTEGER
pinned_at             INTEGER
dismissed_at          INTEGER
snoozed_until         INTEGER
created_at            INTEGER NOT NULL DEFAULT (unixepoch())
expires_at            INTEGER
```

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

### `notification_digest_batch_item`

```sql
batch_id            TEXT NOT NULL             -- FK to notification_digest_batch
event_id            TEXT NOT NULL             -- FK to notification_event
tenant_id           TEXT NOT NULL
added_at            INTEGER NOT NULL DEFAULT (unixepoch())
PRIMARY KEY (batch_id, event_id)
```

---

### `notification_audit_log`

```sql
id                    TEXT PRIMARY KEY          -- naudlog_<uuid>
tenant_id             TEXT NOT NULL
event_type            TEXT NOT NULL             -- 'notification.sent'|'notification.failed'|'preference.changed'|'unsubscribe'
actor_id              TEXT                      -- [OQ-006] zeroed to 'ERASED' on NDPR erasure; row never deleted
recipient_id          TEXT                      -- [OQ-006] zeroed to 'ERASED' on NDPR erasure; row never deleted
channel               TEXT
notification_event_id TEXT
delivery_id           TEXT
metadata              TEXT
created_at            INTEGER NOT NULL DEFAULT (unixepoch())
```

**Retention: 7 years.** On NDPR erasure: `actor_id` and `recipient_id` set to `'ERASED'` — rows are never deleted. This preserves accountability (event occurred) while removing identity (G23).

---

### `notification_subscription`

```sql
id                    TEXT PRIMARY KEY          -- nsub_<uuid>
tenant_id             TEXT NOT NULL
user_id               TEXT NOT NULL
topic                 TEXT NOT NULL
channel               TEXT NOT NULL
subscribed            INTEGER NOT NULL DEFAULT 1
consent_captured_at   INTEGER
consent_ip_hash       TEXT
unsubscribed_at       INTEGER
unsubscribe_reason    TEXT
```

---

### `notification_suppression_list`

```sql
id                  TEXT PRIMARY KEY          -- supr_<uuid>
tenant_id           TEXT
channel             TEXT NOT NULL
address_hash        TEXT NOT NULL             -- SHA-256(PLATFORM_SALT + normalized_address)
reason              TEXT NOT NULL             -- 'bounced'|'unsubscribed'|'complaint'|'admin_block'
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
UNIQUE (tenant_id, channel, address_hash)
```

Raw addresses are never stored. Suppression persists past account deletion (indefinite retention).

---

### `escalation_policy`

```sql
id                  TEXT PRIMARY KEY          -- esc_<uuid>
tenant_id           TEXT
event_key           TEXT NOT NULL
rule_name           TEXT NOT NULL
sla_seconds         INTEGER NOT NULL
escalate_to_type    TEXT NOT NULL
escalate_to_id      TEXT NOT NULL
escalation_channel  TEXT NOT NULL
enabled             INTEGER NOT NULL DEFAULT 1
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

---

### `channel_provider` *(ADL-002 compliant)*

```sql
id                       TEXT PRIMARY KEY          -- cprov_<uuid>
tenant_id                TEXT
channel                  TEXT NOT NULL
provider_name            TEXT NOT NULL
enabled                  INTEGER NOT NULL DEFAULT 1
priority                 INTEGER NOT NULL DEFAULT 1
config                   TEXT NOT NULL             -- JSON: NON-SECRET config only
credentials_kv_key       TEXT                      -- KV key for AES-256-GCM encrypted credentials
sender_domain_name       TEXT                      -- [v2 OQ-004] e.g. 'theircompany.com'
sender_domain_verified   INTEGER DEFAULT 0
sender_domain_verified_at INTEGER
sender_verification_dns_records TEXT              -- [v2 OQ-004] JSON: {type, name, value}[]
sender_fallback_in_use   INTEGER DEFAULT 0         -- [v2 OQ-004] 1 = actively using platform fallback
created_at               INTEGER NOT NULL DEFAULT (unixepoch())
```

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

### `notification_wa_approval_log` *(v2 — OQ-003)*

```sql
id                  TEXT PRIMARY KEY          -- walog_<uuid>
template_id         TEXT NOT NULL             -- FK to notification_template
submitted_at        INTEGER NOT NULL DEFAULT (unixepoch())
submitted_by        TEXT NOT NULL             -- super_admin user_id
status              TEXT NOT NULL             -- 'submitted'|'approved'|'rejected'
resolved_at         INTEGER
rejection_reason    TEXT
meta_template_id    TEXT
meta_template_name  TEXT
```

---

### `webhook_event_types` *(v2 — OQ-013)*

```sql
event_key           TEXT PRIMARY KEY
description         TEXT NOT NULL
payload_schema      TEXT NOT NULL             -- JSON Schema of payload fields
plan_tier           TEXT NOT NULL DEFAULT 'standard'  -- 'standard'|'business'|'enterprise'
enabled             INTEGER NOT NULL DEFAULT 1
added_at            INTEGER NOT NULL DEFAULT (unixepoch())
```

Seeded with 30-event curated starter set as `plan_tier='standard'`. Remaining events as `plan_tier='enterprise'`.

---

### Data Retention Policy

| Table | Retention | NDPR Treatment |
|---|---|---|
| `notification_delivery` | 90 days | Hard-delete on user erasure |
| `notification_inbox_item` | 365 days | Hard-delete on user erasure |
| `notification_audit_log` | 7 years | Zero `actor_id` / `recipient_id` to `'ERASED'` — never delete row |
| `notification_event` | 90 days | Anonymize `actor_id` on user erasure |
| `notification_preference` | Lifetime of account | Hard-delete on user erasure |
| `notification_subscription` | Lifetime of account | Hard-delete on user erasure; preserve unsubscribed state in suppression_list |
| `notification_suppression_list` | Indefinite | Cannot delete; addresses are hashed at insert time |
| `notification_digest_batch` + items | 90 days | Cascade delete with delivery |
| `notification_wa_approval_log` | 7 years | Platform record; no PII to erase |
| `webhook_event_types` | Permanent (platform config) | No PII |

---

## 8. REFERENCE ARCHITECTURE

### 8.0 Infrastructure Prerequisites *(must complete before Phase 1)*

1. **Provision Cloudflare Queues.** Create `webwaka-notification-queue-staging` and `webwaka-notification-queue-production`.

2. **Add producer bindings to `apps/api/wrangler.toml`:**
```toml
[[env.staging.queues.producers]]
binding = "NOTIFICATION_QUEUE"
queue = "webwaka-notification-queue-staging"

[[env.production.queues.producers]]
binding = "NOTIFICATION_QUEUE"
queue = "webwaka-notification-queue-production"
```

3. **Create `apps/notificator` Worker** (OQ-001 resolved). Add consumer bindings:
```toml
[[env.staging.queues.consumers]]
queue = "webwaka-notification-queue-staging"
max_batch_size = 100
max_batch_timeout = 5
max_retries = 5

[[env.staging.d1_databases]]
binding = "DB"
database_name = "webwaka-os-staging"
database_id = "<same as apps/api staging D1 id>"

[[env.staging.kv_namespaces]]
binding = "NOTIFICATION_KV"
id = "<notification KV namespace id>"

[env.staging.vars]
NOTIFICATION_PIPELINE_ENABLED = "1"
NOTIFICATION_SANDBOX_MODE = "true"
HITL_LEGACY_NOTIFICATIONS_ENABLED = "1"
```

4. **Production notificator vars:**
```toml
[env.production.vars]
NOTIFICATION_PIPELINE_ENABLED = "1"
NOTIFICATION_SANDBOX_MODE = "false"
HITL_LEGACY_NOTIFICATIONS_ENABLED = "1"
```

5. **CRON triggers in `apps/notificator/wrangler.toml`** (for digest sweep — OQ-007):
```toml
[triggers]
crons = [
  "0 23 * * *",    # 00:00 WAT daily digest sweep
  "0 23 * * 0",    # 00:00 WAT Monday weekly digest sweep
  "0 * * * *"      # top of each hour, hourly digest sweep
]
```

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
│  record → outbox pattern. notification_event.source tagged at origin:       │
│  'api' | 'ussd_gateway' | 'cron' | 'queue_consumer'                        │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 2: EVENT TRANSPORT                                                    │
│                                                                             │
│  apps/api (producer) → NOTIFICATION_QUEUE (Cloudflare Queue)                │
│  apps/notificator (dedicated consumer Worker) processes up to 100           │
│  messages/batch; 5-second batch timeout; 5 max retries                      │
│                                                                             │
│  NOTE: CF Queues has NO native DLQ. On maxRetries exceeded, the consumer    │
│  writes notification_delivery status='dead_lettered' in D1.                 │
│  CF Queue message delay is used for quiet-hours deferred sends.             │
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
│  → 'partner_admins' resolved via partner hierarchy                         │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 4: PREFERENCE RESOLUTION                                              │
│                                                                             │
│  For each (recipient, channel):                                             │
│  → Load preference inheritance: platform → tenant → role → user override   │
│  → KV cache hot path (5-min TTL; key prefix: {tenant_id}:pref:)            │
│  → USSD-origin check [OQ-009]: if source='ussd_gateway':                   │
│       SMS dispatched immediately (bypass quiet hours for SMS only)          │
│       Push suppressed; in-app follows standard quiet hours                 │
│  → Low-data mode check [OQ-011]: if low_data_mode=1:                       │
│       Push suspended; in-app text_only_mode=1; SMS for critical only       │
│       Poll interval extended to 120s in workspace-app                      │
│  → Apply quiet hours (Africa/Lagos default; timezone-aware)                │
│       Blocked: write to NOTIFICATION_QUEUE with delay until quiet end      │
│       Critical severity: bypass quiet hours                                │
│  → Apply digest window: group or send immediately                          │
│  → Apply consent gate: marketing topic requires subscribed=1               │
│  → Apply suppression check: hash address; lookup suppression list          │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 5: BRAND AND LOCALE CONTEXT RESOLUTION                                │
│                                                                             │
│  Brand Context [OQ-005]                                                     │
│  → Load TenantTheme from @webwaka/white-label-theming (KV-cached)           │
│  → Multi-level hierarchy walk using resolveBrandContext(workspaceId):       │
│       Workspace theme → Sub-Partner theme (if applicable) →                │
│       [skip Parent Partner if brand_independence_mode=1 on Sub-Partner]     │
│       → Parent Partner theme → Platform default                            │
│  → Extract: primaryColor, logo, displayName, customDomain, senderIdentity  │
│  → Check plan-tier attribution rule (white-label-policy.md)                │
│                                                                             │
│  Locale Context (uses @webwaka/i18n — mandatory)                           │
│  → Call detectLocale(request) from @webwaka/i18n                           │
│  → Map to SupportedLocale: 'en'|'ha'|'yo'|'ig'|'pcm'|'fr'                 │
│  → Select template variant by (template_family, channel, locale)           │
│  → Fallback chain handled by @webwaka/i18n built-in                        │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 6: TEMPLATE RESOLUTION AND RENDERING                                  │
│                                                                             │
│  Template Resolution: tenant override → platform default → hardcoded string │
│  Variable Binding: event payload + recipient profile + brand context        │
│  → Validate against variables_schema (fail loudly on missing variables)    │
│  → HTML-escape all user-supplied strings; validate URLs against HTTPS list │
│  WhatsApp gate: whatsapp_approval_status MUST = 'meta_approved' (G17)      │
│  → Any other status: fallback to SMS; delivery reason = 'wa_not_approved'  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 7: DISPATCH                                                           │
│                                                                             │
│  Sandbox check [OQ-012]: if NOTIFICATION_SANDBOX_MODE='true':               │
│  → Redirect ALL deliveries to NOTIFICATION_SANDBOX_EMAIL/PHONE/PUSH_TOKEN  │
│  → Record sandbox_redirect=1, sandbox_original_recipient_hash in delivery  │
│  → NEVER dispatch to real addresses                                        │
│                                                                             │
│  Sender domain check [OQ-004]: if sender_domain_verified=0:                 │
│  → Use platform FROM address with tenant display name in subject prefix    │
│  → Record sender_fallback_used=1 in notification_delivery                  │
│                                                                             │
│  For each (recipient, channel, rendered_content):                           │
│  → Check idempotency_key UNIQUE constraint                                 │
│  → Check notification_suppression_list (hashed address)                   │
│  → Check entitlement tier (G19)                                            │
│  → Dispatch via INotificationChannel                                       │
│  → Update delivery status; record provider_message_id                     │
│                                                                             │
│  Kill-Switch: if NOTIFICATION_PIPELINE_ENABLED='0' → legacy EmailService   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 8: INBOX AND STATE                                                    │
│                                                                             │
│  → Write notification_inbox_item (in-app channel); include delivery_id FK  │
│  → If low_data_mode=1: set text_only_mode=1 on inbox item                  │
│  → If category='partner': item queryable via ?category=partner in          │
│     apps/partner-admin (OQ-008)                                             │
│  → Offline PWA sync: Dexie.js via @webwaka/offline-sync                    │
│  → Real-time push: short-poll every 30s [OQ-010 resolved]                  │
│       GET /notifications/inbox/unread-count (KV-cached; 10s TTL)           │
│       Cache key: {tenant_id}:inbox:unread:{user_id}                        │
│       SSE upgrade path: documented in architecture ADR (future)            │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│  LAYER 9: RETRY, DIGEST, DEAD-LETTER, AUDIT                                  │
│                                                                             │
│  Digest Sweep [OQ-007 — Queue-continued global CRON]:                       │
│  → CRON fires at window close time (WAT) in apps/notificator               │
│  → Queries notification_digest_batch WHERE status='pending' LIMIT 100      │
│  → Enqueues each batch as a Queue message (type='digest.process')          │
│  → Consumer processes each batch independently (100ms per batch, T3 safe) │
│                                                                             │
│  Retry: CF Queue auto-retries up to 5 times with backoff                   │
│  Dead-Letter: after max attempts → status='dead_lettered'; audit log;      │
│  alert super_admin via system.provider.down event                          │
│  Admin tooling: inspect, replay, dismiss                                   │
│                                                                             │
│  Audit: Write notification_audit_log for every send attempt (success/fail) │
│  and every preference change. Structured logs via @webwaka/logging.        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Architecture Decisions

| Decision | Rationale |
|---|---|
| CF Queues for durable dispatch | Outbox + Queues = reliable event transport. CF Workers native. |
| D1 as notification store | Consistent with platform-wide persistence. Tenant-scoped. D1 global replication suits Africa-first latency. |
| KV for preference hot-path | Preference reads on every notification. 5-min TTL. Tenant-prefixed for T3. |
| `apps/notificator` as Queue consumer | Dedicated Worker — separate CPU budget, deployment, and scaling from `apps/projections` (OQ-001). |
| Application-level DLQ | CF Queues has no native DLQ. `status='dead_lettered'` in D1 + admin tooling. |
| `@webwaka/i18n` for locale | Existing production package with 6 locales. P1 violation to reinvent. |
| Brand walk with `brand_independence_mode` | Sub-Partner flag allows skipping parent Partner brand while still reaching Platform Default (OQ-005). |
| `NOTIFICATION_PIPELINE_ENABLED` kill-switch | Required for safe Phase 6 migration. Fallback to direct EmailService. |
| `HITL_LEGACY_NOTIFICATIONS_ENABLED` kill-switch | Prevents double-notification during HITL escalation migration (OQ-002). |
| Quiet-hours via Queue delay | CF Queue message delay holds notification until after quiet window (G11). |
| Short-poll 30s for real-time inbox | Most resilient for Nigeria-first PWA with intermittent 2G/3G/4G connectivity (OQ-010). |
| Queue-continued digest CRON | Global CRON enqueues per-batch messages; worker processes independently. Respects 100ms CPU limit (OQ-007). |
| `NOTIFICATION_SANDBOX_MODE` redirect | All non-production deliveries redirect to configured test addresses. Never real users (OQ-012). |
| Platform sender fallback | During email domain verification, platform FROM used with tenant display name prefix (OQ-004). |
| Shared inbox `category` filter | Partner-admin events surface in `apps/partner-admin` via `?category=partner` without duplicate schema (OQ-008). |
| 30-event webhook starter + enterprise | Curated scope matches operational risk tolerance. Enterprise plan unlocks full catalog (OQ-013). |
| SMS immediately for USSD-origin events | Standard Nigerian mobile banking pattern. Never interrupt USSD session flow (OQ-009). |
| Platform-operated WABA | Removes Meta business verification barrier from Nigerian SMBs. Templates submitted once by platform ops (OQ-003). |

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

### Brand Context Resolution *(updated — OQ-005)*

```typescript
// packages/white-label-theming/src/resolveBrandContext.ts
async function resolveBrandContext(workspaceId: string, db: D1Database): Promise<TenantTheme> {
  const workspace = await getWorkspace(workspaceId, db);
  if (workspace.tenantTheme) return workspace.tenantTheme;

  if (workspace.subPartnerId) {
    const subPartner = await getSubPartner(workspace.subPartnerId, db);
    if (subPartner.tenantTheme) return subPartner.tenantTheme;

    if (!subPartner.brandIndependenceMode) {
      // Walk to parent partner only if brand_independence_mode=0
      const parentPartner = await getPartner(subPartner.partnerId, db);
      if (parentPartner.tenantTheme) return parentPartner.tenantTheme;
    }
    // brand_independence_mode=1: skip parent; fall through to platform default
  }

  return getPlatformDefaultTheme();
}
```

`brand_independence_mode` is a boolean column on the sub-partners entity. Default `0`. Settable only by super_admin.

### Locale Handling — MUST use `@webwaka/i18n`

```typescript
import { createI18n, detectLocale, type SupportedLocale } from '@webwaka/i18n';

const locale = (userLocale as SupportedLocale) || detectLocale(request);
const t = createI18n(locale);

const template = await findTemplate(templateFamily, channel, locale)
  ?? await findTemplate(templateFamily, channel, 'en');
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

### Partials Library

- `{{> cta_button label=cta_label url=cta_url}}` — branded CTA
- `{{> data_table rows=rows}}` — transaction data table
- `{{> alert_box type=type}}` — info/warn/error callout
- `{{> legal_footer locale=locale}}` — NDPR/regulatory footer via i18n keys
- `{{> otp_display code=otp_code}}` — OTP display (pre-formatted string; raw OTP never passed)

### Sender Domain Verification Fallback *(OQ-004)*

While `channel_provider.sender_domain_verified = 0` for a tenant's custom email domain:
- **FROM address:** `WebWaka Notifications <noreply@webwaka.com>` (platform sender)
- **Reply-To:** `support@{tenant.customDomain}` (if configured)
- **Subject prefix:** `[{tenant.displayName}]`
- `notification_delivery.sender_fallback_used = 1` recorded
- Brand-runtime settings page shows yellow verification banner with DNS records
- Auto-polling CRON in `apps/notificator` checks Resend domain API every 6 hours and auto-updates `sender_domain_verified` when confirmed

### WhatsApp Template Approval Workflow *(OQ-003 — Platform-Operated WABA)*

WebWaka maintains one verified WABA per primary locale region. Platform operators submit all templates to Meta on behalf of all tenants.

**Workflow:**
1. Super-admin creates template (`status='draft'`, `whatsapp_approval_status='pending_meta_approval'`)
2. Super-admin records submission in `notification_wa_approval_log`
3. Platform operator copies template body to Meta Business Manager → submits
4. On Meta approval: super-admin calls `PATCH /notifications/templates/:id/whatsapp-status` with `{ status: 'meta_approved', meta_template_name, meta_template_id }`
5. On Meta rejection: `whatsapp_approval_status='meta_rejected'`; rejection reason recorded; super_admin alerted via `system.provider.down` event
6. Rejected templates automatically fall back to SMS for that event type (G17)

**Enterprise upgrade path:** Partner-operated WABA registration is documented in the runbook as a future enterprise option. No schema change is required — the `channel_provider` table already supports per-tenant overrides via `credentials_kv_key`.

### Template Versioning Workflow

```
Draft → Pending Review → Active → Deprecated
```

### Template Taxonomy *(abridged — full list in Section 5)*

All template families covered in Section 5 event catalog. Partner events use `partner.*` family. HITL events use `ai.hitl*` family. System alerts use `system.alert` family.

---

## 10. REPO-BY-REPO IMPLEMENTATION IMPACT

### New Package: `packages/notifications`

Central notification infrastructure package.

**Services:** `NotificationService`, `TemplateRenderer`, `ChannelDispatcher`, `InboxService`, `PreferenceService`, `DigestEngine`, `DeadLetterService`, `SuppressionService`

**Key interfaces:** `INotificationChannel`, `ITemplateRenderer`, `IPreferenceStore`, `NotificationPipelineKillSwitch`

**Dependencies:** `@webwaka/logging` → `@webwaka/types` → `@webwaka/events` → `@webwaka/white-label-theming` → `@webwaka/i18n` → `packages/notifications`

---

### New Worker: `apps/notificator` *(OQ-001 resolved)*

**Must be created.** Dedicated Cloudflare Worker owning all notification Queue consumption and digest CRON sweeps.

```
apps/notificator/
  wrangler.toml     -- CF Queue consumer, CRON triggers, D1, KV, env vars
  src/
    index.ts        -- queue() handler + scheduled() handler
    consumer.ts     -- NotificationService batch processor
    digest.ts       -- digestSweepCron() + processDigestBatch()
    sandbox.ts      -- resolveSandboxRecipient()
    env.ts          -- Env type: DB, NOTIFICATION_KV, NOTIFICATION_QUEUE, env vars
  package.json      -- depends on packages/notifications
```

**`src/index.ts` structure:**
```typescript
export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    await digestSweepCron(env, event.cron);
  },
  async queue(batch: MessageBatch<QueueMessage>, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      if (msg.body.type === 'digest.process') {
        await processDigestBatch(env, msg.body.batch_id, msg.body.tenant_id);
      } else {
        await processNotificationMessage(env, msg.body);
      }
      msg.ack();
    }
  }
}
```

**Env vars (staging):** `NOTIFICATION_PIPELINE_ENABLED=1`, `NOTIFICATION_SANDBOX_MODE=true`, `HITL_LEGACY_NOTIFICATIONS_ENABLED=1`, `NOTIFICATION_SANDBOX_EMAIL`, `NOTIFICATION_SANDBOX_PHONE`, `NOTIFICATION_SANDBOX_PUSH_TOKEN`

**Env vars (production):** `NOTIFICATION_PIPELINE_ENABLED=1`, `NOTIFICATION_SANDBOX_MODE=false`, `HITL_LEGACY_NOTIFICATIONS_ENABLED=1` (→ `0` after Phase 6 validation)

---

### `apps/api`

**Routes to change:**
1. `lib/email-service.ts` — Refactor to notification pipeline channel implementation.
2. `routes/auth-routes.ts` — Replace all inline `new EmailService()` calls with `notificationService.raise(...)`.
3. `routes/billing.ts` — Add events for all plan change, cancel, grace, suspend transitions.
4. `routes/payments.ts` — Add `billing.payment.completed` and `billing.payment.failed`.
5. `routes/onboarding.ts` — Add `onboarding.step.completed`.
6. `routes/support.ts` — Add events on ticket creation and status changes.
7. `routes/superagent.ts` — Add AI credit, consent, and HITL events.
8. `routes/negotiation.ts` — Wire all session lifecycle events.
9. `routes/partners.ts` — Wire all 6 partner ecosystem events.
10. `routes/bank-transfer.ts` — Wire all 7 bank-transfer FSM events.
11. `routes/b2b-marketplace.ts` — Wire B2B RFQ and order events.
12. `routes/airtime.ts` — Wire airtime events.
13. `routes/transport.ts` — Wire transport FSM events.
14. `lib/webhook-dispatcher.ts` — **Migrate retry to CF Queues (N-131 — prerequisite to webhook expansion).**

**Routes to add:**
- `GET /notifications/preferences`, `PATCH /notifications/preferences`
- `GET /notifications/inbox`, `PATCH /notifications/inbox/:id`, `DELETE /notifications/inbox/:id`
- `GET /notifications/inbox/unread-count` *(OQ-010 — KV-cached, 10s TTL)*
- `GET /notifications/templates`, `POST /notifications/templates`, `PATCH /notifications/templates/:id`
- `POST /notifications/templates/:id/preview`, `POST /notifications/templates/:id/test-send`
- `PATCH /notifications/templates/:id/whatsapp-status` *(OQ-003)*
- `GET /notifications/deliveries`, `POST /notifications/dead-letter/:id/replay`
- `GET /notifications/subscriptions`, `PATCH /notifications/subscriptions/:topic`
- `GET /notifications/suppression`, `POST /notifications/suppression`
- `POST /notifications/providers/email/verify-domain` *(OQ-004)*
- `GET /notifications/providers/email/verify-domain/status` *(OQ-004)*
- `GET /webhooks/events`, `POST /webhooks/subscriptions` *(OQ-013 — plan tier gated)*

---

### `apps/projections` *(HITL migration — OQ-002)*

**Phase 6 change (N-100a):** Add `HITL_LEGACY_NOTIFICATIONS_ENABLED` env var guard.

```typescript
// apps/projections/src/index.ts
const sendHitlNotifications = env.HITL_LEGACY_NOTIFICATIONS_ENABLED !== '0';
if (sendHitlNotifications) {
  // existing legacy dispatch — active until pipeline validated
} else {
  // emit via publishEvent() → apps/notificator handles dispatch
  await publishEvent(env.DB, 'ai.hitl.request_expired', { ... });
}
```

**Phase 9 change (N-100b):** Delete legacy dispatch code after 48-hour production observation with zero double-notifications. The HITL expiry sweep (D1 status writes) stays permanently in `apps/projections` — only notification dispatch moves.

**Wrangler.toml:**
```toml
[env.staging.vars]
HITL_LEGACY_NOTIFICATIONS_ENABLED = "1"   # set to "0" when pipeline live on staging
```

---

### `apps/tenant-public`

**What must be added:**
- Unsubscribe landing page: `GET /unsubscribe?token=...`
  - Validates HMAC-signed unsubscribe token
  - Calls `SuppressionService.addToSuppression(channel, address)`
  - Renders tenant-branded confirmation page via `@webwaka/white-label-theming`
- This page belongs here, not in `apps/brand-runtime`, because end-users click unsubscribe links from emails.

---

### `apps/partner-admin` *(OQ-008 resolved)*

**What must be added:**
- Notification bell UI component in header
- Notification drawer calling `GET /notifications/inbox?category=partner`
- `PATCH /notifications/inbox/:id` for read/archive
- No new API routes — uses shared inbox API with `category=partner` filter

---

### `apps/brand-runtime` *(OQ-004)*

**What must be added:**
- Sender domain verification status banner in settings page
- Display DNS records for tenant to add to their registrar
- Auto-refresh: calls `GET /notifications/providers/email/verify-domain/status`
- Notification preference management (within tenant settings)
- Tenant delivery log view

---

### `apps/workspace-app`

- In-app notification center UI: bell icon, notification drawer
- Short-poll hook (`useNotificationPoll`) — 30s interval (OQ-010), extended to 120s when `low_data_mode=1`
- Low-data mode toggle in preferences settings page (OQ-011)
- Notification inbox: unread/read/archived tabs
- Text-only rendering when `text_only_mode=1` on inbox item (OQ-011)
- Notification preference settings page
- Offline notification queue via `@webwaka/offline-sync` Dexie.js store

---

### `apps/ussd-gateway` *(OQ-009)*

**What must be changed:**
- All `publishEvent()` calls must include `source: 'ussd_gateway'`
- This tags events so the preference resolver (Layer 4) applies USSD delivery rules

---

### `apps/platform-admin`

- Platform-level notification template management UI (CRUD, preview, test-send)
- WhatsApp template approval tracker UI (shows `notification_wa_approval_log` — OQ-003)
- `PATCH /notifications/templates/:id/whatsapp-status` UI form
- Cross-tenant delivery log viewer
- Dead-letter queue inspector with replay and dismiss
- Channel provider health dashboard

---

### `packages/events`

- Expand `EventType` catalog from 16 to 100+ types with typed payloads
- Add `correlation_id` to `DomainEvent` shape and `publishEvent()` signature
- Add `source` field to `DomainEvent`: `'api'|'ussd_gateway'|'cron'|'queue_consumer'`
- Add queue publisher alongside D1 write (outbox pattern)

---

### `packages/white-label-theming`

- Add to `TenantTheme`: `senderEmailAddress`, `senderDisplayName`, `tenantSupportEmail`, `tenantAddress`, `requiresWebwakaAttribution`
- Implement `resolveBrandContext(workspaceId, db)` with `brand_independence_mode` check
- Add `brand_independence_mode` to sub-partner entity schema
- KV cache key: `brand:context:{workspaceId}` (5-min TTL)

---

### `packages/i18n`

- Add notification-specific i18n keys to all 6 locale files:
  - Legal footer strings (en, ha, yo, ig, pcm, fr)
  - Unsubscribe confirmation strings
  - Common notification boilerplate per channel per locale
  - NDPR compliance footer text per locale

---

### `infra/db/migrations`

New migrations (numbered from 0254):

```
0254_notification_events.sql
0255_notification_rules.sql
0256_notification_preferences.sql            -- includes low_data_mode column
0257_notification_templates.sql              -- includes meta_template_name/id/rejection_reason
0258_notification_deliveries.sql             -- includes source, sender_fallback_used, sandbox_* columns
0259_notification_inbox_items.sql            -- includes text_only_mode column
0260_notification_digest_batches.sql
0261_notification_digest_batch_items.sql
0262_notification_audit_log.sql
0263_notification_subscriptions.sql
0264_notification_suppression_list.sql
0265_escalation_policies.sql
0266_channel_providers.sql                   -- includes sender_domain_name, verification columns
0267_push_tokens.sql
0268_seed_platform_notification_templates.sql
0269_seed_notification_rules.sql
0270_seed_channel_providers.sql
0271_notification_wa_approval_log.sql        -- v2 OQ-003
0272_webhook_event_types.sql                 -- v2 OQ-013
0273_sub_partners_brand_independence.sql     -- v2 OQ-005: brand_independence_mode column
```

All migrations must have corresponding rollback scripts (CI-003 governance rule).

---

## 11. PHASED IMPLEMENTATION ROADMAP

### Phase 0 — Contracts, Standards, and Infrastructure Setup (Week 1-2)

**Objectives:** Establish naming standards, event schema registry, shared contracts, and provision required infrastructure.

**Critical infrastructure tasks (must complete before Phase 1):**
- Provision Cloudflare Queues staging + production
- Add queue producer bindings to `apps/api/wrangler.toml`
- Scaffold `apps/notificator` Worker (OQ-001 resolved — no longer a decision point)
- Add queue consumer bindings to `apps/notificator/wrangler.toml`

**Repos:** `packages/events`, `packages/types`, `apps/api`, `apps/notificator`, `docs/`

**Tasks:**

| ID | Task | Repo | Est | Priority |
|---|---|---|---|---|
| N-001 | Define 100+ canonical event keys in `event-types.ts` | packages/events | 3d | P0 |
| N-002 | Write D1 schema SQL for all 16 notification tables (migrations 0254-0273) | infra/migrations | 2d | P0 |
| N-003 | Define TypeScript interfaces: INotificationChannel, ITemplateRenderer, IPreferenceStore, KillSwitch | packages/notifications | 1d | P0 |
| N-004 | Create `packages/notifications` skeleton (package.json, tsconfig, index.ts) | packages/notifications | 0.5d | P0 |
| N-005 | Document template variable schema convention and escaping rules | docs | 1d | P0 |
| N-006 | Define preference inheritance model spec (incl. low_data_mode, USSD rules) | docs | 2d | P0 |
| N-007 | Provision CF Queues; add producer bindings to apps/api/wrangler.toml | apps/api | 1d | P0 |
| N-008 | Scaffold `apps/notificator` Worker (wrangler.toml staging+production, env.ts, index.ts) | apps/notificator | 2d | P0 |
| N-009 | Document HITL escalation kill-switch pattern; add HITL_LEGACY_NOTIFICATIONS_ENABLED to apps/projections wrangler.toml | apps/projections, docs | 0.5d | P0 |

**Exit criteria:** All contracts defined. Schema SQL reviewed. Package skeleton compiles. CF Queues provisioned. `apps/notificator` scaffolded and receiving test messages.

---

### Phase 1 — Core Event Infrastructure (Week 3-4)

**Objectives:** Expand domain event bus. Wire outbox pattern. Migrate to Cloudflare Queues for durable transport.

**Repos:** `packages/events`, `apps/api`, `apps/notificator`, `infra`

**Prerequisites:** Phase 0 complete.

| ID | Task | Repo | Est | Priority | Depends On |
|---|---|---|---|---|---|
| N-010 | Expand @webwaka/events EventType catalog to 100+ types | packages/events | 3d | P0 | N-001 |
| N-011 | Add correlation_id to DomainEvent and publishEvent() | packages/events | 0.5d | P0 | N-010 |
| N-012 | Implement CF Queues consumer in `apps/notificator` | apps/notificator | 3d | P0 | N-007, N-008 |
| N-012a | Add CRON digest sweep handler to apps/notificator (wrangler.toml triggers + digestSweepCron) | apps/notificator | 1d | P0 | N-012 |
| N-013 | Wire outbox pattern: publishEvent() writes to event_log first within D1 transaction | packages/events | 2d | P0 | N-011, N-012 |
| N-014 | Run and validate migrations 0254-0273 on staging | infra | 1d | P0 | N-002 |
| N-015 | Write seed data for platform notification_rules and notification_templates | infra | 2d | P0 | N-014 |
| N-060a | Add `source` field to notification_event and DomainEvent type | packages/events | 0.5d | P0 | N-011 |

**Exit criteria:** 100+ event types defined. `apps/notificator` receiving events. `event_log` persisting with `correlation_id` and `source`. Migrations validated on staging.

---

### Phase 2 — Core Notification Service and Data Model (Week 5-6)

**Objectives:** Implement `NotificationService` with rule engine, audience resolution, and delivery persistence.

**Repos:** `packages/notifications`, `apps/api`

**Prerequisites:** Phase 1 complete.

| ID | Task | Repo | Est | Priority | Depends On |
|---|---|---|---|---|---|
| N-020 | Implement NotificationService.raise() with NOTIFICATION_PIPELINE_ENABLED kill-switch gate | packages/notifications | 3d | P0 | N-003, N-013 |
| N-021 | Implement rule engine (load rules, evaluate, select channels and template) | packages/notifications | 3d | P0 | N-020 |
| N-022 | Implement audience resolution for all audience_type values (incl. partner_admins) | packages/notifications | 2d | P0 | N-021 |
| N-023 | Implement notification_delivery persistence with idempotency key | packages/notifications | 1d | P0 | N-014, N-021 |
| N-024 | Implement in-app channel: write to notification_inbox_item with delivery_id FK | packages/notifications | 1d | P0 | N-023 |
| N-025 | Wire EmailService as Resend channel behind INotificationChannel | packages/notifications | 2d | P0 | N-003, N-020 |
| N-026 | Replace inline EmailService calls in auth-routes.ts | apps/api | 1d | P0 | N-025 |
| N-027 | Implement notification_audit_log writes (all send attempts) | packages/notifications | 1d | P0 | N-023 |
| N-028 | Write multi-tenant isolation tests (cross-tenant delivery must not occur) | packages/notifications | 1d | P0 | N-024 |
| N-029 | Implement SuppressionService with address hash lookup | packages/notifications | 1d | P0 | N-014 |

**Exit criteria:** `auth.user.registered` flows through full pipeline. In-app inbox item created. Email delivered. Audit log written. No cross-tenant leakage. Suppression checked.

---

### Phase 3 — Template Engine and Branding (Week 7-8)

**Objectives:** Replace hardcoded HTML strings with versioned template system. Apply tenant branding. Integrate `@webwaka/i18n`.

**Repos:** `packages/notifications`, `packages/white-label-theming`, `packages/i18n`, `apps/api`

**Prerequisites:** Phase 2 complete. WABA registration begun as external prerequisite (begin at Phase 0).

| ID | Task | Repo | Est | Priority | Depends On |
|---|---|---|---|---|---|
| N-030 | Implement TemplateRenderer using @webwaka/i18n for locale resolution | packages/notifications | 3d | P0 | N-003 |
| N-031 | Build email wrapper with multi-level brand context injection (via resolveBrandContext) | packages/notifications | 2d | P0 | N-030 |
| N-032 | Add partials library (cta_button, data_table, alert_box, legal_footer) | packages/notifications | 2d | P0 | N-031 |
| N-033 | Add senderEmailAddress, senderDisplayName, requiresAttribution to TenantTheme | packages/white-label-theming | 0.5d | P0 | — |
| N-033a | Add brand_independence_mode to sub-partners table and resolveBrandContext resolver | packages/white-label-theming + infra | 0.5d | P0 | N-031 |
| N-034 | Implement tenant template override resolution | packages/notifications | 1d | P0 | N-030 |
| N-035 | Implement template versioning (draft → active → deprecated) | packages/notifications | 1d | P1 | N-034 |
| N-036 | Add preview endpoint (POST /notifications/templates/:id/preview) | apps/api | 1d | P1 | N-035 |
| N-037 | Add test-send endpoint (POST /notifications/templates/:id/test-send) | apps/api | 1d | P1 | N-035 |
| N-038 | Auto-generate plain-text from HTML for all email templates | packages/notifications | 1d | P1 | N-031 |
| N-039 | Add List-Unsubscribe header; implement unsubscribe token signing | packages/notifications | 1d | P0 | — |
| N-040 | Migrate 6 existing email templates into notification_template table | infra | 1d | P0 | N-015, N-030 |
| N-041 | Add notification i18n keys to packages/i18n locale files (all 6 locales) | packages/i18n | 2d | P0 | N-001 |

**Exit criteria:** All 6 email templates rendered via template engine with tenant branding. Test-send works. Preview works. Locale fallback works. `@webwaka/i18n` used throughout. `resolveBrandContext()` respects `brand_independence_mode`.

---

### Phase 4 — Channel Providers and Delivery Tracking (Week 9-10)

**Objectives:** Full channel provider abstraction. Delivery tracking. Wire all channels.

**Repos:** `packages/notifications`, `packages/otp`, `apps/api`, `apps/notificator`

**Prerequisites:** Phase 3 complete. WABA registered and first templates submitted to Meta.

| ID | Task | Repo | Est | Priority | Depends On |
|---|---|---|---|---|---|
| N-042 | Implement INotificationChannel for Resend (email) with sender_fallback logic | packages/notifications | 1d | P0 | N-025, N-054 |
| N-043 | Implement INotificationChannel for Termii (SMS) | packages/notifications | 1d | P0 | N-054 |
| N-044 | Implement INotificationChannel for Meta WhatsApp (meta_approved gate; platform WABA) | packages/notifications | 1d | P0 | N-054 |
| N-045 | Implement INotificationChannel for 360dialog WhatsApp | packages/notifications | 0.5d | P0 | N-054 |
| N-046 | Implement INotificationChannel for Telegram | packages/notifications | 0.5d | P0 | N-054 |
| N-047 | Implement web push channel (FCM + service worker) | packages/notifications | 3d | P1 | N-054 |
| N-048 | Implement Slack webhook channel for system alerts | packages/notifications | 1d | P1 | — |
| N-049 | Implement Teams webhook channel | packages/notifications | 1d | P2 | — |
| N-050 | Implement fallback channel chain logic | packages/notifications | 1d | P0 | N-042-N-046 |
| N-051 | Implement delivery status tracking (dispatched → delivered/failed) | packages/notifications | 1d | P0 | N-023 |
| N-052 | Implement Resend bounce webhook handler → update suppression list | apps/api | 1d | P1 | N-029, N-042 |
| N-053 | Add per-tenant channel_provider overrides (tenant custom Resend domain + fallback logic) | packages/notifications | 2d | P1 | N-054 |
| N-053a | Add sender domain verification status UI to apps/brand-runtime | apps/brand-runtime | 1d | P1 | N-053 |
| N-053b | Add CRON for Resend domain verification auto-polling (every 6hrs in apps/notificator) | apps/notificator | 0.5d | P1 | N-053 |
| N-054 | Store provider credentials via ADL-002 (AES-256-GCM in KV via credentials_kv_key) | packages/notifications | 2d | P0 | — |
| N-055 | Migrate monitoring ALERT_WEBHOOK_URL to NotificationService Slack channel | apps/api | 1d | P1 | N-048 |
| N-131 | Migrate webhook dispatcher inline retry to CF Queues (prerequisite to webhook expansion) | apps/api | 3d | P0 | N-012 |
| N-132 | Implement webhook_event_types registry; seed 30-event starter set | infra, apps/api | 1d | P1 | N-131 |

**Exit criteria:** All channels wired. Provider credentials in KV (not D1). Delivery status tracked end-to-end. Bounce handling updates suppression list. Sender domain fallback confirmed. Webhook dispatcher using Queues.

---

### Phase 5 — Preferences, Inbox, and Digest Engine (Week 11-13)

**Objectives:** Full preference model, in-app notification center, digest batching.

**Repos:** `packages/notifications`, `apps/workspace-app`, `apps/brand-runtime`, `apps/notificator`

**Prerequisites:** Phase 4 complete.

| ID | Task | Repo | Est | Priority | Depends On |
|---|---|---|---|---|---|
| N-060 | Implement PreferenceService with 4-level inheritance + USSD-origin + low_data_mode checks | packages/notifications | 3d | P0 | N-003 |
| N-061 | Add KV cache for preference reads with tenant-prefixed keys | packages/notifications | 1d | P0 | N-060 |
| N-062 | Implement quiet hours (timezone-aware; Africa/Lagos default; deferred via Queue delay) | packages/notifications | 2d | P0 | N-060, N-012 |
| N-063 | Implement digest window management (CRON sweep enqueues per-batch Queue messages) | packages/notifications, apps/notificator | 3d | P1 | N-060 |
| N-064 | Implement DigestEngine: processDigestBatch() using notification_digest_batch_item join table | packages/notifications | 3d | P1 | N-063 |
| N-065 | Build inbox API (GET paginated + unread-count, PATCH state, DELETE) | apps/api | 2d | P0 | N-024 |
| N-066 | Build preference management API | apps/api | 1d | P0 | N-060 |
| N-067 | Build short-poll inbox: GET /notifications/inbox/unread-count (KV-cached 10s TTL) | apps/api | 1d | P1 | N-065 |
| N-067a | Document SSE upgrade path for real-time inbox in architecture ADR | docs | 0.5d | P2 | N-067 |
| N-068 | Add Dexie.js offline notification store to @webwaka/offline-sync | packages/offline-sync | 2d | P1 | N-024 |
| N-069 | Build notification bell + drawer in apps/workspace-app (with useNotificationPoll hook) | apps/workspace-app | 3d | P0 | N-065 |
| N-070 | Build preference settings page in apps/workspace-app (incl. low-data mode toggle) | apps/workspace-app | 2d | P1 | N-066 |
| N-071 | Add unsubscribe landing page to apps/tenant-public | apps/tenant-public | 1d | P0 | N-039, N-029 |

**Exit criteria:** Preferences work across all 4 scopes. Low-data mode suppresses push and enables text-only in-app. USSD-origin events get immediate SMS. Inbox functions. Digest batches via Queue-continued sweep. Short-poll bell updates within 30 seconds.

---

### Phase 6 — Route and Vertical Wiring (Week 14-18)

**Objectives:** Wire notification events across all existing routes and 160+ vertical packages. Complete migration from direct EmailService calls. Activate HITL pipeline migration.

**Prerequisite:** Phases 1-5 complete. `NOTIFICATION_PIPELINE_ENABLED` kill-switch in place. `NOTIFICATION_SANDBOX_MODE=true` on staging before this phase begins.

| ID | Task | Repo | Est | Priority | Depends On |
|---|---|---|---|---|---|
| N-080 | Wire all auth lifecycle events (15 events) | apps/api | 2d | P0 | N-026, N-020 |
| N-081 | Wire all workspace events (11 events) | apps/api | 1d | P0 | N-020 |
| N-082 | Wire all billing lifecycle events (12 events) | apps/api | 2d | P0 | N-020 |
| N-083 | Wire all KYC/identity events (6 events) | apps/api | 1d | P0 | N-020 |
| N-084 | Wire all claim events (7 events) | apps/api | 1d | P0 | N-020 |
| N-085 | Wire all negotiation events (7 events) + expiry job | apps/api | 1d | P0 | N-020 |
| N-086 | Wire all support ticket events (5 events) | apps/api | 1d | P0 | N-020 |
| N-087 | Wire all AI/superagent events (9 events) | apps/api | 1d | P0 | N-020 |
| N-088 | Wire all onboarding events (3 events) | apps/api | 1d | P0 | N-020 |
| N-089 | Wire all POS/finance events (4 events) | apps/api | 1d | P1 | N-020 |
| N-090 | Wire all social/community events (5 events) | apps/api | 1d | P1 | N-020 |
| N-091 | Wire all 6 partner ecosystem events in routes/partners.ts (category='partner') | apps/api | 1d | P0 | N-020 |
| N-091a | Add notification bell UI to apps/partner-admin (shared inbox API, category=partner) | apps/partner-admin | 1d | P1 | N-091 |
| N-092 | Wire all 7 bank-transfer FSM events in routes/bank-transfer.ts | apps/api | 1d | P0 | N-020 |
| N-093 | Wire B2B marketplace events | apps/api | 0.5d | P1 | N-020 |
| N-094 | Wire airtime events | apps/api | 0.5d | P1 | N-020 |
| N-095 | Wire transport FSM events | apps/api | 0.5d | P1 | N-020 |
| N-096 | Create @webwaka/vertical-events with 8 canonical vertical events | packages | 2d | P1 | N-010 |
| N-097 | Wire canonical vertical events in all 160+ vertical packages (scripted) | packages/verticals-* | 3d | P1 | N-096 |
| N-098 | Update negotiation-expiry job → emit negotiation.session.expired | apps/api | 0.5d | P0 | N-085 |
| N-099 | Add onboarding stalled job | apps/api | 1d | P1 | N-088 |
| N-100a | Activate HITL kill-switch: set HITL_LEGACY_NOTIFICATIONS_ENABLED=0 on staging; validate zero double-notifications | apps/projections | 0.5d | P0 | N-087 |
| N-133 | Add tier-gated webhook subscription API (POST/DELETE with entitlement check, subscription cap) | apps/api | 1d | P1 | N-132 |

**Rollback strategy:** `NOTIFICATION_PIPELINE_ENABLED=0` reverts to legacy EmailService. Set `HITL_LEGACY_NOTIFICATIONS_ENABLED=1` to restore projections CRON dispatch. Confirm no duplicate sends during migration by monitoring audit log.

**Exit criteria:** Zero direct `EmailService` calls in route handlers. All business events produce notifications. No duplicate sends. `HITL_LEGACY_NOTIFICATIONS_ENABLED=0` confirmed on staging with 48-hour clean observation.

---

### Phase 7 — Admin Tooling and Observability (Week 19-21)

| ID | Task | Repo | Est | Priority | Depends On |
|---|---|---|---|---|---|
| N-105 | Build platform admin notification template management UI | apps/platform-admin | 4d | P1 | N-035 |
| N-106 | Build cross-tenant delivery log viewer | apps/platform-admin | 2d | P1 | N-051 |
| N-107 | Build dead-letter queue inspector with replay and dismiss | apps/platform-admin | 2d | P1 | N-027 |
| N-108 | Build channel provider health dashboard | apps/platform-admin | 2d | P1 | N-051 |
| N-109 | Build notification rule editor for super_admin | apps/platform-admin | 3d | P2 | N-021 |
| N-110 | Implement delivery anomaly alerts (bounce rate >5% → system.provider.down) | packages/notifications | 1d | P1 | N-051 |
| N-111 | Implement NOTIFICATION_SANDBOX_MODE redirect model; configure test addresses in staging secrets | apps/notificator | 1d | P0 | N-012 |
| N-112 | Add tenant delivery log to apps/brand-runtime | apps/brand-runtime | 2d | P2 | N-051 |
| N-113 | Add CF Logpush integration for notification event logs | infra | 1d | P1 | — |
| N-114 | Implement notification metrics dashboard | apps/platform-admin | 3d | P1 | N-051 |
| N-118 | Implement WhatsApp template approval tracking UI in platform-admin (notification_wa_approval_log) | apps/platform-admin | 2d | P1 | N-044 |

**Note on N-111:** `NOTIFICATION_SANDBOX_MODE=true` MUST be deployed to staging before Phase 6 vertical wiring begins, to prevent real-user delivery during wiring tests. N-111 is formally in Phase 7 but must be executed as part of Phase 6 readiness.

**Exit criteria:** Super-admin can inspect, replay, and manage all deliveries. Metrics visible. Alerts working. Sandbox mode enforced. WhatsApp approval tracker operational.

---

### Phase 8 — Data Retention and Compliance Hardening (Week 22)

| ID | Task | Repo | Est | Priority | Depends On |
|---|---|---|---|---|---|
| N-115 | Implement daily retention CRON in apps/notificator: delete delivery logs >90d, inbox >365d | apps/notificator | 2d | P0 | N-014 |
| N-116 | Implement NDPR erasure propagation: zero-out audit log PII; hard-delete all other notification tables | packages/notifications | 2d | P0 | N-027 |
| N-117 | Implement attribution enforcement in email templates per plan tier | packages/notifications | 1d | P0 | N-031, N-033 |

**Exit criteria:** All notification tables have automated retention enforcement. Erasure zeroes `actor_id`/`recipient_id` in audit log. Hard-delete confirmed for all other tables. Attribution rule enforced.

---

### Phase 9 — QA Hardening and Production Rollout (Week 23-27)

| ID | Task | Repo | Est | Priority | Depends On |
|---|---|---|---|---|---|
| N-120 | Full E2E Playwright test suite for all notification flows | all | 5d | P0 | N-097 |
| N-121 | Multi-tenant isolation penetration test | all | 2d | P0 | N-028 |
| N-122 | Load test: 10,000 notifications/hour across 100 tenants on staging | staging | 1d | P1 | N-122 |
| N-123 | NDPR compliance audit (consent gating, unsubscribe, erasure propagation) | all | 2d | P0 | N-116 |
| N-124 | CBN compliance audit (OTP channels — R8 preservation) | packages/otp | 1d | P0 | — |
| N-125 | Template XSS security review | packages/notifications | 1d | P0 | N-030 |
| N-126 | Email accessibility audit (WCAG 2.1 AA, plain-text) | packages/notifications | 1d | P1 | N-038 |
| N-127 | ADL-002 audit: confirm zero provider API keys in D1 | all | 1d | P0 | N-054 |
| N-128 | Production rollout via feature flag per tenant (observe 2 weeks) | all | 2d | P0 | N-120-N-127 |
| N-129 | 30-day production monitoring | monitoring | — | P0 | N-128 |
| N-130 | Write operations runbooks (provider failover, dead-letter sweep, digest rerun) | docs | 2d | P1 | N-107 |
| N-100b | Delete legacy HITL dispatch code from apps/projections (after 48hr clean production observation) | apps/projections | 0.5d | P1 | N-100a + 48hr prod |

**Exit criteria:** All tests pass. NDPR/CBN compliance verified. Load test passes at 2x expected volume. Zero credentials in D1. Production rollout complete with monitoring active. Legacy HITL dispatch code deleted.

---

**Total estimated effort: ~180 engineering days** (33 weeks at 1 engineer, ~11 weeks with a 3-person team)

*Revised from 165 days in v1.0. The 15-day increase reflects new backlog items N-012a, N-033a, N-053a, N-053b, N-060a, N-067a, N-091a, N-100a, N-100b, N-131, N-132, N-133, and N-111 scoping from Section 13 resolutions.*

**Recommended resourcing:**
- 1 Platform Architect (architecture, contracts, governance, Phase 0)
- 1 Backend Engineer (notification service, event bus, channel providers, Phases 1-4)
- 1 Full-Stack Engineer (admin UI, workspace-app inbox, preference pages, Phases 5-7)
- 1 QA Engineer (Phase 9, cross-phase testing)

**Critical path:** N-007 → N-008 → N-001/N-002/N-003 → N-012 → N-020/N-021 → N-026 → N-039/N-054 → N-080/N-082/N-091/N-092 → N-111 → N-120/N-123

---

## 12. BEST-PRACTICE GUARDRAILS

These are non-negotiable rules enforced via code, tests, or review gates.

### G1 — Tenant Isolation is Absolute
Every `notification_event`, `notification_delivery`, `notification_inbox_item`, `notification_preference`, and `notification_template` query MUST include `tenant_id` in the WHERE clause. KV cache keys MUST be prefixed `{tenant_id}:`. No cross-tenant reads from any notification API. Enforced by: cross-tenant isolation test suite and governance check script.

### G2 — No Direct Email Sends from Business Routes
After Phase 2, `new EmailService(key).sendTransactional(...)` is forbidden in route handlers. All email delivery must flow through `NotificationService.raise()`. Enforced by: ESLint custom rule banning direct `EmailService` instantiation outside `packages/notifications`.

### G3 — No Hardcoded FROM Address
`WebWaka <noreply@webwaka.com>` must not appear in code after Phase 3. FROM address must be loaded from `channel_provider.config`, defaulting to platform sender if no tenant override exists. If a tenant's custom sender domain has `sender_domain_verified=0`, the platform FROM address must be used as fallback and `sender_fallback_used=1` recorded in `notification_delivery`.

### G4 — Brand Context Always Applied *(updated v2 — OQ-005)*
All email templates must render through `@webwaka/white-label-theming` brand context using `resolveBrandContext(workspaceId)`. If the workspace belongs to a Sub-Partner with `brand_independence_mode=1`, the Parent Partner theme is skipped and resolution falls through directly to Platform Default. The `brand_independence_mode` flag may only be set by super_admin. No email renders without loading `TenantTheme` first.

### G5 — Transaction OTPs Must Use SMS
`purpose === 'transaction'` must route only to `channel === 'sms'`. WhatsApp/Telegram must remain blocked for transaction OTPs (CBN R8). This rule is preserved in `@webwaka/otp` and must not be overridden by `NotificationService`.

### G6 — No Raw OTP Values Persisted or Passed to Templates
OTP values must never appear in any DB column, log line, or response body. Only SHA-256 hashes with the platform salt. Notification templates receive pre-formatted display strings — never raw codes.

### G7 — Idempotency Required for All Sends
Every notification delivery must generate an idempotency key before dispatch. Duplicate events must not produce duplicate deliveries. `notification_delivery.idempotency_key` UNIQUE constraint enforces this at the DB level.

### G8 — Consent Gates for Marketing
Any notification with a `topic` in `notification_subscription` must check `subscribed=1` before dispatch. Transactional notifications (auth, billing, security) bypass consent checks per NDPR Article 2(1)(b). The distinction must be explicit in `notification_rule`.

### G9 — Audit Every Send
`notification_audit_log` must be written for every send attempt (success or failure). Preference changes must also be audited. This log is required for NDPR accountability.

### G10 — Dead-Letter, Never Discard
After max retry attempts, notifications must enter `dead_lettered` state (not deleted). Operations must be able to replay, inspect, or dismiss. Silent discard on failure is forbidden.

### G11 — Quiet Hours Must Be Timezone-Aware and Deferred Not Suppressed
`Africa/Lagos` (WAT, UTC+1) is the default timezone. A notification blocked by quiet hours must be scheduled for delivery via CF Queue message delay — not suppressed. `severity='critical'` bypasses quiet hours (G12).

### G12 — Critical Notifications Bypass Quiet Hours and Digest
`severity='critical'` notifications (account locked, data breach, payment critical failure, workspace suspended) bypass quiet hours and digest windows. Delivered immediately on all configured channels. Additionally, the digest engine must never process a batch belonging to tenant A while processing a message for tenant B: each Queue message dispatched by the CRON sweep must contain `tenant_id`, and all DB queries within `processDigestBatch()` must include `AND tenant_id = :tenantId`. Cross-tenant batch processing is a T3 isolation violation (G1).

### G13 — Provider Abstraction Must Be Complete
No channel-specific provider implementation code may appear in business logic, route handlers, or rule evaluation. All provider specifics must be behind `INotificationChannel`.

### G14 — Template Variables Must Be Schema-Validated
Before rendering, all variables must be validated against `notification_template.variables_schema`. Missing required variables must fail loudly.

### G15 — No PII in Logs
`@webwaka/logging` PII masking must be applied to all notification log lines. Audit logs store recipient IDs, not email addresses or phone numbers.

### G16 — Provider Credentials in KV Only, Never in D1 *(ADL-002)*
Provider API keys MUST NEVER be stored in the `channel_provider.config` D1 column. They must be stored AES-256-GCM encrypted in KV, referenced by `channel_provider.credentials_kv_key`. Enforced by: governance check script `check-provider-credentials.ts`.

### G17 — WhatsApp Templates Must Be Meta-Approved Before Dispatch *(updated v2 — OQ-003)*
Before dispatching any WhatsApp delivery, check `notification_template.whatsapp_approval_status`. Only `'meta_approved'` permits dispatch. Templates in `pending_meta_approval` or `meta_rejected` state must trigger an automatic fallback to SMS and mark delivery with `last_error='wa_template_not_approved'`. When a template is `meta_rejected`, super_admin must be alerted via a `system.provider.down` event with `provider='meta_whatsapp'` and the rejection reason. The `notification_wa_approval_log` must record all submission and resolution events.

### G18 — Locale Resolution Must Use `@webwaka/i18n`
Template locale resolution must use `createI18n(locale)` and `detectLocale(request)` from `@webwaka/i18n`. No parallel locale resolution system may be introduced.

### G19 — Channel Dispatch Respects Entitlement Tier
Before dispatching via any channel, check that the workspace's active entitlement grants access to that channel. Tenants below the minimum tier for a channel receive in-app only. Push and SMS channels may be restricted by plan.

### G20 — Suppression List Checked Before All External Dispatches
Before dispatching to email, SMS, or WhatsApp, the normalized address hash must be checked against `notification_suppression_list`. A hit must mark the delivery `status='suppressed'` and write to audit log.

### G21 — USSD-Origin Notifications Use SMS Immediately *(v2 — OQ-009)*
Notifications where `notification_event.source='ussd_gateway'` must bypass quiet hours for the SMS channel. SMS receipts for USSD-triggered payment events are always dispatched immediately. Push notifications must not be dispatched for USSD-origin events. In-app channel follows standard quiet hours.

### G22 — Low-Data Mode Channel Restrictions *(v2 — OQ-011)*
When `notification_preference.low_data_mode=1` at user scope: push notifications must not be dispatched; in-app notifications must be delivered as text-only (`text_only_mode=1`); email channel is unaffected (server-side); SMS is permitted only for `severity='critical'` events; polling interval in workspace-app must be extended to 120 seconds. This preference is user-controlled and must not be overridden by platform rules.

### G23 — NDPR Erasure Propagation to Notification Tables *(v2 — OQ-006)*
NDPR erasure requests must propagate to all notification tables within 24 hours. `notification_audit_log`: set `actor_id='ERASED'` and `recipient_id='ERASED'` — never delete audit log rows. All other notification tables: hard-delete rows where `user_id` or `recipient_id` matches the erased user. Suppression list entries must not be deleted (suppression must persist past account deletion).

### G24 — Sandbox Mode Enforcement in Non-Production *(v2 — OQ-012)*
`NOTIFICATION_SANDBOX_MODE='true'` must be set in all non-production Workers environments. Production Workers must always have `NOTIFICATION_SANDBOX_MODE='false'`. A CI/CD governance check must assert this before every production deployment. Any delivery dispatched when sandbox mode is enabled must be redirected to configured sandbox test addresses; the original intended recipient must never receive the notification.

### G25 — Webhook Event Types Gated by Subscription Plan *(v2 — OQ-013)*
Webhook subscriptions must be validated against the `webhook_event_types` registry. Events with `plan_tier='enterprise'` may only be subscribed by tenants with enterprise plan entitlement. Standard-tier tenants: max 25 active webhook subscriptions. Business-tier: max 100. Enterprise: unlimited. These limits are enforced at the API layer before writing to `webhook_subscriptions`.

---

## 13. RESOLVED PLATFORM DECISIONS

All 13 architectural and operational decisions that were unresolved in v1.0 have been decided. This section is the canonical record of those decisions. Implementation may proceed without further architectural uncertainty.

### Decision Matrix

| ID | Title | Decision | Owner | Implemented In |
|---|---|---|---|---|
| OQ-001 | Queue Consumer Worker Location | New dedicated `apps/notificator` Worker | Platform Architect | N-008, N-012 (Phase 0-1) |
| OQ-002 | HITL Escalation Ownership | Kill-switch bridge; retire legacy in Phase 9 | Backend Engineer | N-100a (Phase 6), N-100b (Phase 9) |
| OQ-003 | WhatsApp Template Approval | Platform-operated WABA; operator submits | Platform Ops | N-118 (Phase 7) |
| OQ-004 | Sender Domain Verification | Platform fallback during verification; status in brand-runtime | Backend + Full-Stack | N-053, N-053a, N-053b (Phase 4) |
| OQ-005 | Brand Hierarchy | Walk to default; `brand_independence_mode` opt-in | Platform Architect | N-033a, N-031 (Phase 3) |
| OQ-006 | Data Retention and NDPR Erasure | TTLs confirmed; audit PII zeroed not deleted | Platform Architect | N-115, N-116 (Phase 8) |
| OQ-007 | Digest Engine Timing | Queue-continued global CRON sweep | Backend Engineer | N-063, N-064, N-012a (Phase 1/5) |
| OQ-008 | Partner Admin Notification Surface | Shared inbox; `category='partner'` in partner-admin | Full-Stack Engineer | N-091a (Phase 6) |
| OQ-009 | USSD Notification Handling | SMS immediately; in-app queued; no USSD interruption | Backend Engineer | N-060, N-060a (Phase 1/5) |
| OQ-010 | Real-Time Inbox Push Technology | Short-poll 30s; SSE as future upgrade path | Full-Stack Engineer | N-067, N-067a (Phase 5) |
| OQ-011 | Low-Data Mode Behaviour | Push suspended; in-app text-only; email unaffected; SMS for critical | Backend + Full-Stack | N-060, N-069, N-070 (Phase 5) |
| OQ-012 | Sandbox Mode Strictness | `NOTIFICATION_SANDBOX_MODE` redirect to test addresses | Backend Engineer | N-111 (Phase 7, execute before Phase 6) |
| OQ-013 | Webhook Event Expansion Scope | 30-event starter; enterprise full catalog; 25 cap standard | Platform Architect | N-131, N-132, N-133 (Phase 4/6) |

---

### OQ-001 — Queue Consumer Worker Location

**Decision:** New dedicated `apps/notificator` Cloudflare Worker owns all CF Queue consumption and digest CRON sweeps.

**Rationale:** `apps/projections` already handles search rebuilds, analytics snapshots, and HITL CRON. Adding notification dispatch creates CPU budget competition, coupled deployment risk, and mixed SLA concerns. A dedicated Worker gives independent scaling, deployment isolation, and a clean audit surface. The ~2d additional setup cost (N-008 Worker scaffold) is justified by operational safety at scale.

---

### OQ-002 — HITL Escalation Ownership

**Decision:** Migrate to notification pipeline using a `HITL_LEGACY_NOTIFICATIONS_ENABLED` kill-switch bridge. Old direct dispatch code deleted in Phase 9 after 48-hour clean production observation.

**Rationale:** The HITL expiry sweep (D1 status writes) stays in `apps/projections` permanently — it is a data lifecycle responsibility. Only notification dispatch moves to `apps/notificator`. The kill-switch eliminates the double-notification risk that would exist if both paths were active simultaneously without coordination.

---

### OQ-003 — WhatsApp Template Approval Workflow

**Decision:** Platform-operated WhatsApp Business Account. WebWaka platform operators submit all templates to Meta on behalf of all tenants. Submission and approval tracked in `notification_wa_approval_log`. Enterprise partner-operated WABA is a documented future option requiring no schema change.

**Rationale:** Nigerian SMBs cannot reliably complete Meta's business verification process. A platform-operated model enables WhatsApp notifications for all tenants on day one. Tenant branding is expressed through display-name variable injection within Meta-approved template body fields.

---

### OQ-004 — Tenant Sender Domain Verification UX

**Decision:** Fall back to platform sender (`noreply@webwaka.com`) with tenant display name in subject prefix while domain verification is pending. Verification status surfaced in brand-runtime settings. Auto-polling CRON confirms DNS propagation every 6 hours. `sender_fallback_used=1` recorded in delivery log.

**Rationale:** DNS changes at Nigerian domain registrars can take days. Blocking all email during this window breaks business-critical communications. The fallback model ensures continuity while the tenant completes verification.

---

### OQ-005 — Partner/Sub-Partner Brand Hierarchy Resolution

**Decision:** Always walk Sub-Partner → Parent Partner → Platform Default. Sub-Partners can set `brand_independence_mode=1` (super_admin only) to skip the parent Partner and fall directly to Platform Default.

**Rationale:** The default walk (without independence mode) serves 90%+ of cases. The `brand_independence_mode` flag handles competitive brand scenarios without introducing bidirectional blocking complexity. The flag is super_admin-controlled to maintain governance over brand policy.

---

### OQ-006 — Notification Data Retention and NDPR Erasure

**Decision:** Confirmed TTLs: delivery logs 90 days, inbox 365 days, audit logs 7 years, suppression list indefinite. On NDPR erasure: `notification_audit_log` rows have `actor_id` and `recipient_id` zeroed to `'ERASED'` — rows are never deleted. All other notification tables have the user's rows hard-deleted.

**Rationale:** The audit log must prove compliance events occurred (e.g., "a notification was sent on this date") without retaining identity. Zero-out achieves this. Hard-deleting audit rows would eliminate accountability. The 7-year retention aligns with CBN financial record requirements.

---

### OQ-007 — Digest Engine Timing Model

**Decision:** Queue-continued global CRON sweep. CRON fires at window close time in `apps/notificator`, queries up to 100 pending digest batches, enqueues each as a separate Queue message, and returns within 10ms. The Queue consumer processes each batch independently — one batch per message, one 100ms CPU budget.

**Rationale:** A single CRON invocation iterating thousands of tenant batches hits the 100ms CF Workers CPU limit. The Queue-continuation pattern is unbounded — it scales to any number of tenants with no CPU risk and provides T3-safe per-batch isolation.

---

### OQ-008 — Partner Admin Notification Surface

**Decision:** Shared `notification_inbox_item` schema with `category='partner'`. `apps/partner-admin` calls `GET /notifications/inbox?category=partner` to display a partner-specific notification drawer. No separate table, no separate API routes.

**Rationale:** Partner admin users are users with `user_id` and `tenant_id`. The inbox API already supports category filtering. The shared schema eliminates infrastructure duplication while delivering full notification capability to the partner-admin surface.

---

### OQ-009 — USSD Notification Handling

**Decision:** For USSD-originated events (`source='ussd_gateway'`): SMS dispatched immediately (parallel to USSD session confirmation screen); in-app notification queued for next PWA open. Push notifications not dispatched. USSD session is never interrupted.

**Rationale:** This matches the established pattern for all Nigerian mobile financial services — every bank USSD transfer confirms via USSD menu AND sends a parallel SMS receipt. It is the behaviour Nigerian users expect. Option to queue after session would require USSD session state tracking infrastructure that does not exist. In-app only leaves users with no receipt until they open the PWA.

---

### OQ-010 — Real-Time Inbox Push Technology

**Decision:** Short-poll at 30-second intervals as the v1 default. KV-cached unread-count endpoint. SSE upgrade path documented in ADR (not implemented by default).

**Rationale:** Nigeria-first means intermittent mobile connectivity, tower handoffs, and variable data quality. WebSocket connections (Durable Objects) drop silently on handoffs. SSE reconnects but burns battery. A 30-second HTTP GET poll works on 2G, through corporate firewalls, and after PWA service worker recovery. Maximum staleness of 30 seconds is acceptable for digest events; critical events arrive via SMS/email immediately.

---

### OQ-011 — Low-Data Mode Notification Behaviour

**Decision:** When `low_data_mode=1`: push notifications suspended; in-app notifications delivered text-only (`text_only_mode=1`; no image fetch); email unaffected (server-side, no client data cost); SMS permitted only for `severity='critical'`; polling interval extended to 120 seconds.

**Rationale:** Nigerian users on metered connections pay for every background data transfer. Push notification payloads and image asset fetches have real cost implications. The tiered approach protects data budget while preserving critical notification delivery. User controls this preference explicitly — the platform cannot override it.

---

### OQ-012 — Sandbox Mode Strictness

**Decision:** All notification deliveries in environments where `NOTIFICATION_SANDBOX_MODE='true'` are redirected to configured test addresses: `NOTIFICATION_SANDBOX_EMAIL`, `NOTIFICATION_SANDBOX_PHONE`, `NOTIFICATION_SANDBOX_PUSH_TOKEN`. Original intended recipient stored as SHA-256 hash in `sandbox_original_recipient_hash` for test assertion. Platform Architect configures test addresses in Cloudflare Workers secrets. Production always has `NOTIFICATION_SANDBOX_MODE='false'`.

**Rationale:** Phase 6 wires 160+ vertical routes simultaneously. Without sandbox enforcement, every test event would reach real users. The redirect model allows full provider integration validation (real Resend/Termii API calls) and template rendering inspection (view in test inbox) without real-user impact.

---

### OQ-013 — Webhook Event Expansion Scope

**Decision:** 30-event curated starter set available to standard-tier tenants (max 25 active subscriptions per workspace). Business-tier tenants receive the 30-event starter set with a higher cap (max 100 active subscriptions). Full 100+ event catalog available to enterprise-tier tenants (unlimited active subscriptions). Inline webhook retry must be migrated to CF Queues (N-131) before any expansion beyond current 4 events. New `webhook_event_types` registry table tracks availability and plan tier.

**Rationale:** Expanding to 100+ webhook event types with untested payloads and an inline-blocking retry mechanism creates cascading API latency risk. The curated 30-event starter set covers the highest-value integration scenarios. The plan-tier gate creates an enterprise upsell path. The Queues migration is a prerequisite — it de-couples webhook delivery reliability from API response latency.

---

## 14. EXECUTION BACKLOG

De-duplicated, unique IDs, prioritized. Grouped by phase/epic.

### Epic: Phase 0 — Infrastructure and Standards

| ID | Task | Repo | Est | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-001 | Define 100+ canonical event keys in event-types.ts | packages/events | 3d | P0 | — | Low |
| N-002 | Write D1 schema SQL for all 16 notification tables (migrations 0254-0273) | infra/migrations | 2d | P0 | — | Low |
| N-003 | Define TypeScript interfaces: INotificationChannel, ITemplateRenderer, IPreferenceStore, KillSwitch | packages/notifications | 1d | P0 | — | Low |
| N-004 | Create packages/notifications skeleton | packages/notifications | 0.5d | P0 | — | Low |
| N-005 | Document template variable schema and escaping rules | docs | 1d | P0 | — | Low |
| N-006 | Define preference inheritance model spec (incl. low_data_mode, USSD rules) | docs | 2d | P0 | — | Low |
| N-007 | Provision CF Queues; add producer bindings to apps/api/wrangler.toml | apps/api | 1d | P0 | — | High |
| N-008 | Scaffold apps/notificator Worker (wrangler.toml staging+production, env.ts, index.ts) | apps/notificator | 2d | P0 | N-007 | High |
| N-009 | Add HITL_LEGACY_NOTIFICATIONS_ENABLED to apps/projections wrangler.toml; document OQ-002 kill-switch pattern | apps/projections, docs | 0.5d | P0 | — | Medium |

### Epic: Phase 1 — Core Event Infrastructure

| ID | Task | Repo | Est | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-010 | Expand @webwaka/events EventType catalog to 100+ types | packages/events | 3d | P0 | N-001 | Low |
| N-011 | Add correlation_id to DomainEvent and publishEvent() | packages/events | 0.5d | P0 | N-010 | Low |
| N-012 | Implement CF Queues consumer in apps/notificator | apps/notificator | 3d | P0 | N-007, N-008 | High |
| N-012a | Add CRON digest sweep handler to apps/notificator (wrangler.toml CRON triggers + `digestSweepCron()` function). **Reconciliation note:** The resolution pack's Section 6 defined N-012a as the Worker skeleton scaffold and also updated N-008 with identical content. v2 merges both into the updated N-008; N-012a here covers the CRON handler that had no separate ID in the resolution pack. | apps/notificator | 1d | P0 | N-012 | Medium |
| N-013 | Wire outbox pattern: publishEvent() within D1 transaction | packages/events | 2d | P0 | N-011, N-012 | Medium |
| N-014 | Run and validate migrations 0254-0273 on staging | infra | 1d | P0 | N-002 | Medium |
| N-015 | Write seed data for platform notification_rules and notification_templates | infra | 2d | P0 | N-014 | Low |
| N-060a | Add `source` field to notification_event and DomainEvent type | packages/events | 0.5d | P0 | N-011 | Low |

### Epic: Phase 2 — Core Notification Service

| ID | Task | Repo | Est | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-020 | Implement NotificationService.raise() with kill-switch gate | packages/notifications | 3d | P0 | N-003, N-013 | Medium |
| N-021 | Implement rule engine (load rules, evaluate, select channels and template) | packages/notifications | 3d | P0 | N-020 | Medium |
| N-022 | Implement audience resolution for all audience_type values (incl. partner_admins) | packages/notifications | 2d | P0 | N-021 | Medium |
| N-023 | Implement notification_delivery persistence with idempotency | packages/notifications | 1d | P0 | N-014, N-021 | Low |
| N-024 | Implement in-app channel: write to notification_inbox_item with delivery_id FK | packages/notifications | 1d | P0 | N-023 | Low |
| N-025 | Wire EmailService as Resend channel behind INotificationChannel | packages/notifications | 2d | P0 | N-003, N-020 | Low |
| N-026 | Replace inline EmailService calls in auth-routes.ts | apps/api | 1d | P0 | N-025 | Low |
| N-027 | Implement notification_audit_log writes | packages/notifications | 1d | P0 | N-023 | Low |
| N-028 | Write multi-tenant isolation tests (cross-tenant delivery must not occur) | packages/notifications | 1d | P0 | N-024 | Low |
| N-029 | Implement SuppressionService with address hash lookup | packages/notifications | 1d | P0 | N-014 | Low |

### Epic: Phase 3 — Template Engine and Branding

| ID | Task | Repo | Est | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-030 | Implement TemplateRenderer using @webwaka/i18n for locale resolution | packages/notifications | 3d | P0 | N-003 | Medium |
| N-031 | Build email wrapper with multi-level brand context injection via resolveBrandContext | packages/notifications | 2d | P0 | N-030 | Medium |
| N-032 | Add partials library (cta_button, data_table, alert_box, legal_footer) | packages/notifications | 2d | P0 | N-031 | Low |
| N-033 | Add senderEmailAddress, senderDisplayName, requiresAttribution to TenantTheme | packages/white-label-theming | 0.5d | P0 | — | Low |
| N-033a | Add brand_independence_mode to sub-partners table; implement resolveBrandContext with flag | packages/white-label-theming, infra | 0.5d | P0 | N-031 | Low |
| N-034 | Implement tenant template override resolution | packages/notifications | 1d | P0 | N-030 | Low |
| N-035 | Implement template versioning (draft → active → deprecated) | packages/notifications | 1d | P1 | N-034 | Low |
| N-036 | Add preview endpoint | apps/api | 1d | P1 | N-035 | Low |
| N-037 | Add test-send endpoint | apps/api | 1d | P1 | N-035 | Low |
| N-038 | Auto-generate plain-text from HTML email templates | packages/notifications | 1d | P1 | N-031 | Low |
| N-039 | Add List-Unsubscribe header; implement unsubscribe token signing | packages/notifications | 1d | P0 | — | Low |
| N-040 | Migrate 6 existing email templates into notification_template table | infra | 1d | P0 | N-015, N-030 | Low |
| N-041 | Add notification i18n keys to packages/i18n locale files (all 6 locales) | packages/i18n | 2d | P0 | N-001 | Medium |

### Epic: Phase 4 — Channel Providers and Delivery Tracking

| ID | Task | Repo | Est | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-042 | Implement INotificationChannel for Resend (email) with sender_fallback logic | packages/notifications | 1d | P0 | N-025, N-054 | Low |
| N-043 | Implement INotificationChannel for Termii (SMS) | packages/notifications | 1d | P0 | N-054 | Low |
| N-044 | Implement INotificationChannel for Meta WhatsApp (meta_approved gate; platform WABA) | packages/notifications | 1d | P0 | N-054 | Medium |
| N-045 | Implement INotificationChannel for 360dialog WhatsApp | packages/notifications | 0.5d | P0 | N-054 | Low |
| N-046 | Implement INotificationChannel for Telegram | packages/notifications | 0.5d | P0 | N-054 | Low |
| N-047 | Implement web push channel (FCM + service worker) | packages/notifications | 3d | P1 | N-054 | High |
| N-048 | Implement Slack webhook channel | packages/notifications | 1d | P1 | — | Low |
| N-049 | Implement Teams webhook channel | packages/notifications | 1d | P2 | — | Low |
| N-050 | Implement fallback channel chain logic | packages/notifications | 1d | P0 | N-042-N-046 | Low |
| N-051 | Implement delivery status tracking | packages/notifications | 1d | P0 | N-023 | Low |
| N-052 | Implement Resend bounce webhook handler → update suppression list | apps/api | 1d | P1 | N-029, N-042 | Medium |
| N-053 | Add per-tenant channel_provider overrides + domain verification fallback logic | packages/notifications | 2d | P1 | N-054 | Medium |
| N-053a | Add sender domain verification status UI to apps/brand-runtime | apps/brand-runtime | 1d | P1 | N-053 | Low |
| N-053b | Add CRON for Resend domain verification auto-polling (every 6hrs in apps/notificator) | apps/notificator | 0.5d | P1 | N-053 | Low |
| N-054 | Store provider credentials via ADL-002 (AES-256-GCM in KV via credentials_kv_key) | packages/notifications | 2d | P0 | — | High |
| N-055 | Migrate monitoring ALERT_WEBHOOK_URL to NotificationService Slack channel | apps/api | 1d | P1 | N-048 | Low |
| N-131 | Migrate webhook dispatcher inline retry to CF Queues | apps/api | 3d | P0 | N-012 | High |
| N-132 | Implement webhook_event_types registry; seed 30-event starter set as plan_tier='standard' | infra, apps/api | 1d | P1 | N-131 | Low |

### Epic: Phase 5 — Preferences, Inbox, Digest Engine

| ID | Task | Repo | Est | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-060 | Implement PreferenceService with 4-level inheritance + USSD-origin + low_data_mode checks | packages/notifications | 3d | P0 | N-003 | Medium |
| N-061 | Add KV cache for preference reads with tenant-prefixed keys | packages/notifications | 1d | P0 | N-060 | Low |
| N-062 | Implement quiet hours (timezone-aware; Africa/Lagos default; deferred via Queue delay) | packages/notifications | 2d | P0 | N-060, N-012 | Medium |
| N-063 | Implement digest window management with CRON sweep enqueueing per-batch Queue messages | packages/notifications, apps/notificator | 3d | P1 | N-060, N-012a | Medium |
| N-064 | Implement DigestEngine: processDigestBatch() using notification_digest_batch_item join table | packages/notifications | 3d | P1 | N-063 | Medium |
| N-065 | Build inbox API (GET paginated, PATCH state, DELETE) | apps/api | 2d | P0 | N-024 | Low |
| N-066 | Build preference management API | apps/api | 1d | P0 | N-060 | Low |
| N-067 | Build GET /notifications/inbox/unread-count endpoint (KV-cached 10s TTL) | apps/api | 1d | P1 | N-065 | Low |
| N-067a | Document SSE upgrade path for real-time inbox in architecture ADR | docs | 0.5d | P2 | N-067 | Low |
| N-068 | Add Dexie.js offline notification store to @webwaka/offline-sync | packages/offline-sync | 2d | P1 | N-024 | Low |
| N-069 | Build notification bell + drawer in apps/workspace-app (useNotificationPoll hook; 30s/120s interval) | apps/workspace-app | 3d | P0 | N-065 | Low |
| N-070 | Build preference settings page (incl. low-data mode toggle) | apps/workspace-app | 2d | P1 | N-066 | Low |
| N-071 | Add unsubscribe landing page to apps/tenant-public | apps/tenant-public | 1d | P0 | N-039, N-029 | Low |

### Epic: Phase 6 — Route and Vertical Wiring

| ID | Task | Repo | Est | Priority | Depends On | Risk |
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
| N-091 | Wire all 6 partner ecosystem events in routes/partners.ts (category='partner') | apps/api | 1d | P0 | N-020 | Low |
| N-091a | Add notification bell UI to apps/partner-admin (shared inbox API; category=partner filter) | apps/partner-admin | 1d | P1 | N-091 | Low |
| N-092 | Wire all 7 bank-transfer FSM events in routes/bank-transfer.ts | apps/api | 1d | P0 | N-020 | Low |
| N-093 | Wire B2B marketplace events | apps/api | 0.5d | P1 | N-020 | Low |
| N-094 | Wire airtime events | apps/api | 0.5d | P1 | N-020 | Low |
| N-095 | Wire transport FSM events | apps/api | 0.5d | P1 | N-020 | Low |
| N-096 | Create @webwaka/vertical-events package with 8 canonical vertical events | packages | 2d | P1 | N-010 | Low |
| N-097 | Wire canonical vertical events in all 160+ vertical packages (scripted) | packages/verticals-* | 3d | P1 | N-096 | Medium |
| N-098 | Update negotiation-expiry job → emit negotiation.session.expired | apps/api | 0.5d | P0 | N-085 | Low |
| N-099 | Add onboarding stalled job | apps/api | 1d | P1 | N-088 | Low |
| N-100a | Activate HITL kill-switch: set HITL_LEGACY_NOTIFICATIONS_ENABLED=0 on staging; validate 48h zero double-notifications | apps/projections | 0.5d | P0 | N-087 | High |
| N-133 | Add tier-gated webhook subscription API (POST/DELETE with entitlement check, subscription cap enforcement) | apps/api | 1d | P1 | N-132 | Low |

### Epic: Phase 7 — Admin Tooling and Observability

| ID | Task | Repo | Est | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-105 | Build platform admin notification template management UI | apps/platform-admin | 4d | P1 | N-035 | Low |
| N-106 | Build cross-tenant delivery log viewer | apps/platform-admin | 2d | P1 | N-051 | Low |
| N-107 | Build dead-letter queue inspector with replay and dismiss | apps/platform-admin | 2d | P1 | N-027 | Low |
| N-108 | Build channel provider health dashboard | apps/platform-admin | 2d | P1 | N-051 | Low |
| N-109 | Build notification rule editor for super_admin | apps/platform-admin | 3d | P2 | N-021 | Low |
| N-110 | Implement delivery anomaly alerts (bounce rate >5% → system.provider.down) | packages/notifications | 1d | P1 | N-051 | Low |
| N-111 | Implement NOTIFICATION_SANDBOX_MODE redirect in apps/notificator; configure test addresses in staging secrets | apps/notificator | 1d | P0 | N-012 | Low |
| N-112 | Add tenant notification delivery log to apps/brand-runtime | apps/brand-runtime | 2d | P2 | N-051 | Low |
| N-113 | Add CF Logpush integration for notification event logs | infra | 1d | P1 | — | Low |
| N-114 | Implement notification metrics dashboard | apps/platform-admin | 3d | P1 | N-051 | Low |
| N-118 | Implement WhatsApp template approval tracker UI in platform-admin (notification_wa_approval_log) | apps/platform-admin | 2d | P1 | N-044 | High |

### Epic: Phase 8 — Compliance Hardening

| ID | Task | Repo | Est | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-115 | Implement daily retention CRON in apps/notificator: delivery logs >90d, inbox >365d | apps/notificator | 2d | P0 | N-014 | Medium |
| N-116 | Implement NDPR erasure propagation: zero-out audit log PII; hard-delete all other tables | packages/notifications | 2d | P0 | N-027 | Medium |
| N-117 | Implement attribution enforcement in email templates per plan tier | packages/notifications | 1d | P0 | N-031, N-033 | Low |

### Epic: Phase 9 — QA Hardening and Production Rollout

| ID | Task | Repo | Est | Priority | Depends On | Risk |
|---|---|---|---|---|---|---|
| N-120 | Full E2E Playwright test suite for all notification flows | all | 5d | P0 | N-097 | Low |
| N-121 | Multi-tenant isolation penetration test | all | 2d | P0 | N-028 | Low |
| N-122 | Load test: 10,000 notifications/hour across 100 tenants on staging | staging | 1d | P1 | — | Medium |
| N-123 | NDPR compliance audit | all | 2d | P0 | N-116 | Low |
| N-124 | CBN compliance audit (OTP channels) | packages/otp | 1d | P0 | — | Low |
| N-125 | Template XSS security review | packages/notifications | 1d | P0 | N-030 | Low |
| N-126 | Email accessibility audit (WCAG 2.1 AA) | packages/notifications | 1d | P1 | N-038 | Low |
| N-127 | ADL-002 audit: confirm zero provider API keys in D1 | all | 1d | P0 | N-054 | Low |
| N-128 | Production rollout via feature flag per tenant (observe 2 weeks) | all | 2d | P0 | N-120-N-127 | Low |
| N-129 | 30-day production monitoring | monitoring | — | P0 | N-128 | Low |
| N-130 | Write operations runbooks (provider failover, dead-letter sweep, digest rerun) | docs | 2d | P1 | N-107 | Low |
| N-100b | Delete legacy HITL dispatch code from apps/projections (after 48hr clean production observation) | apps/projections | 0.5d | P1 | N-100a, 48hr prod | Low |

---

## 15. IMPLEMENTATION READINESS GATE

All 13 architectural decisions have been resolved. No items remain open. The following gates must be confirmed before each phase begins.

### Before Phase 0 Can Begin — All Confirmed

| Gate | Status |
|---|---|
| OQ-001 resolved | ✅ `apps/notificator` new dedicated Worker |
| OQ-002 documented | ✅ `HITL_LEGACY_NOTIFICATIONS_ENABLED` kill-switch pattern; N-009 |
| CF Queues provisioning plan | ✅ N-007 in Phase 0 |
| `apps/notificator` scaffolding plan | ✅ N-008 in Phase 0 |
| ADL-002 guidance confirmed | ✅ AES-256-GCM + KV is the approved pattern (G16) |
| No N-040 duplicate | ✅ Confirmed resolved: Phase 3 = N-040 "Migrate templates"; Phase 4 starts N-042 |

### Before Phase 1 Begins

| Gate | Status |
|---|---|
| CF Queues provisioned in CF account (staging + production) | Required: N-007 |
| Producer bindings added to apps/api/wrangler.toml | Required: N-007 |
| Consumer bindings added to apps/notificator/wrangler.toml | Required: N-008 |
| `NOTIFICATION_QUEUE` binding in apps/notificator Env type | Required: N-008 |
| CRON triggers added to apps/notificator/wrangler.toml | Required: N-012a |

### Before Phase 3 Begins

| Gate | Status |
|---|---|
| OQ-003 WhatsApp approval process | ✅ Platform-operated WABA. **Begin WABA application at Phase 0 (external)** |
| OQ-004 Sender domain verification | ✅ N-053, N-053a, N-053b in Phase 4 |
| OQ-005 Brand hierarchy | ✅ N-033a; `brand_independence_mode` flag; walk to platform default |
| OQ-011 Low-data mode | ✅ N-006, N-060 — preference resolver checks `low_data_mode` |

### Before Phase 5 Begins

| Gate | Status |
|---|---|
| OQ-007 Digest timing model | ✅ Queue-continued CRON sweep; N-063/N-064/N-012a |
| OQ-010 Real-time inbox push | ✅ Short-poll 30s; GET /notifications/inbox/unread-count; N-067 |
| OQ-009 USSD notification handling | ✅ G21 added; `source` field in place; N-060 |

### Before Phase 6 Begins

| Gate | Status |
|---|---|
| OQ-008 Partner admin inbox surface | ✅ Shared schema + `category='partner'`; N-091a (Phase 6 task — gate confirmed at Phase 6 entry) |
| OQ-002 kill-switch deployed to staging | Required: N-009 (config) + N-100a (validation) |
| NOTIFICATION_PIPELINE_ENABLED kill-switch implemented and tested | Required: N-020 |
| `NOTIFICATION_SANDBOX_MODE=true` deployed on staging | **Must be live before Phase 6 vertical wiring** — execute N-111 early |
| Duplicate-send audit tooling confirmed working | Audit log query: `COUNT(*) = 1` per event_id |

### Before Phase 8 Begins

| Gate | Status |
|---|---|
| OQ-006 retention TTLs legally approved | Required: sign-off documented in ADR |
| NDPR erasure propagation approach agreed | ✅ Zero-out audit log PII; hard-delete other tables (G23) |

### Before Phase 9 Begins

| Gate | Status |
|---|---|
| OQ-012 sandbox mode CI check | Required: CI governance check asserts `NOTIFICATION_SANDBOX_MODE='false'` in production wrangler.toml |
| OQ-013 webhook expansion | Required: N-131 Queue migration complete; N-132 registry seeded; N-133 API live |

### Definition of Implementation-Ready

A phase is implementation-ready when:
1. All blocking gates for that phase are confirmed
2. Exit criteria for the previous phase are confirmed passing
3. The relevant backlog tasks are assigned to an engineer
4. The `NOTIFICATION_PIPELINE_ENABLED` kill-switch is in place for any phase that touches live email delivery

---

*This document is the single authoritative source of truth for the WebWaka notification engine. Version 2.0 supersedes: `docs/notification-engine-review.md`, `docs/notification-engine-audit.md`, `docs/webwaka-notification-engine-final-master-specification.md` (v1.0), and `docs/webwaka-notification-engine-section13-resolution.md`. All backlog task IDs, entity names, event key names, guardrail numbers, and phase numbers in this document are canonical.*
