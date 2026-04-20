# WebWaka Notification Engine — Independent QA Audit

**Auditor:** Independent QA / Principal Architect Reviewer  
**Date:** 2026-04-20  
**Subject:** Independent audit of `docs/notification-engine-review.md`  
**Method:** Code-first independent reconstruction, then compare-and-contrast  
**Gate Status:** ⚠️ PASS WITH MANDATORY CORRECTIONS BEFORE IMPLEMENTATION

---

## 1. EXECUTIVE VERDICT

**Pass with Mandatory Corrections**

The first agent's output represents a genuine code-first effort: findings are grounded in real source files, critical gaps are correctly identified, the core architecture is sound and CF-native, and the domain model covers the most important entities. However, the document has five categories of verifiable defects that must be corrected before any engineering team can safely begin implementation:

1. **Review incompleteness.** Two deployed production apps (`apps/projections`, `apps/tenant-public`) and six packages (`packages/i18n`, `packages/offerings`, `packages/workspaces`, `packages/contact`, `packages/frontend`, `packages/shared-config`) were not inspected. The projections app is critical — it already processes events, handles HITL escalation, and is the most natural home for the notification Queue consumer.

2. **Critical omissions in the event catalog.** The entire partner ecosystem (M11, live, 72 tests passing) has zero notification events. The bank-transfer FSM (8 states, dispute workflow), transport vertical FSM, B2B marketplace, and airtime routes all produce business-critical state changes with no events catalogued.

3. **A required deliverable is missing.** The audit specification calls for an explicit "Open Questions and Decisions Needed" deliverable. It does not exist.

4. **Security design flaw.** The `channel_provider` entity stores provider configuration (including API credentials) in a plain D1 `config` TEXT field. This directly contradicts ADL-002 (the platform's binding decision that sensitive keys must be stored AES-256-GCM encrypted in KV). This flaw, if implemented as written, would create a credential exposure vector.

5. **Backlog has a duplicate task ID (N-040) and is missing coverage for multiple systems.** N-040 appears in both Phase 3 and Phase 4 with different content.

None of these defects invalidate the overall approach. All are correctable. The document must be revised before implementation agents are given the go signal.

---

## 2. OVERALL STRENGTHS

- **Genuinely code-first.** Claims trace to actual file paths, method names, and migration numbers. No made-up assertions.
- **EmailService, WebhookDispatcher, @webwaka/events, and @webwaka/otp findings are accurate and complete.** The diagnosis of in-memory subscriber, inline-blocking webhook retry, hardcoded FROM address, and zero notification handlers is confirmed by direct source inspection.
- **Domain model is solid.** 13 tables cover the essential notification lifecycle: events, rules, preferences, templates, deliveries, inbox, digest, audit, push tokens, subscriptions, escalation, and channel providers.
- **Nine-layer reference architecture is correct.** The pipeline (outbox → queues → rule engine → preference resolution → brand context → template render → dispatch → retry/DLQ → audit) is the right design for a CF Workers platform.
- **Guardrails G1–G15 are specific and enforceable.** G2 (no direct email sends), G5 (transaction OTPs via SMS only), G7 (idempotency), G8 (consent gating), G11 (quiet hours with timezone scheduling) are all actionable.
- **Cloudflare-first architecture.** Correctly uses D1 for persistence, KV for hot-path caching, Cloudflare Queues for durable transport, and R2 for assets. No Node.js or external broker.
- **Multi-tenant isolation is front and center.** T3 enforcement is explicitly stated in entity schemas, guardrail G1, and architecture layer descriptions.
- **Phase 0 (contracts and standards first) is the right instinct.** Establishing INotificationChannel, ITemplateRenderer, and IPreferenceStore before writing implementations is correct discipline.
- **Nigeria-first considerations are present.** WAT timezone defaults, Termii SMS as primary, OTP carrier detection, NDPR compliance gates, CBN KYC tier enforcement — all correctly preserved.

---

## 3. MAJOR GAPS

- **`apps/projections` not inspected.** This Cloudflare Worker already runs a CRON that processes events, rebuilds search projections, handles HITL expiry sweeps, and fires L3 escalation notifications. It has a `DB` binding to the same D1 database. It is the only currently deployed Worker that comes close to a notification processor, and it was completely missed.

- **No Cloudflare Queues in wrangler.toml.** The architecture's central recommendation is "Cloudflare Queues for durable dispatch." The actual `apps/api/wrangler.toml` has zero `[[queues.producers]]` or `[[queues.consumers]]` bindings. This is not a documentation gap — Queues require explicit provisioning, CF account creation, and wrangler binding before any code can use them. This infrastructure task is absent from both the architecture and the backlog.

- **Partner ecosystem events entirely absent from catalog.** The partner and sub-partner system (M11) is fully live with 72 passing tests. It has partner registration, status FSM, delegation rights, entitlement grants, sub-partner creation, and audit logging — none of which appear in the event catalog.

- **Bank-transfer FSM not catalogued.** `bank-transfer.ts` implements a complete payment FSM: pending → proof_submitted → confirmed | rejected | expired, plus a dispute workflow. These are high-value financial state changes requiring notifications. Zero events catalogued.

- **`packages/i18n` entirely ignored.** The platform has a deployed, tested i18n package with 6 locales (en, ha, yo, ig, pcm, fr) and typed locale keys. Deliverable 7 invents its own locale resolution system from scratch instead of using this existing infrastructure. This is a direct violation of Platform Invariant P1 (Build Once Use Infinitely).

- **`channel_provider` entity stores credentials in D1 plaintext.** ADL-002 is a binding architectural decision that all sensitive keys must be encrypted with AES-256-GCM and stored in KV, not in D1. The proposed schema puts `config TEXT` — which in practice will contain API keys — directly in D1.

- **Multi-level white-label brand hierarchy not addressed.** The platform has a 4-level partner hierarchy (Platform → Partner → Sub-Partner → Downstream Entity). Notifications from a Sub-Partner workspace must use Sub-Partner branding, not the parent Partner's or WebWaka's. The template system only models platform → tenant, missing two inheritance levels.

- **"Open Questions and Decisions Needed" deliverable is missing.** The audit specification explicitly requires this as a deliverable. It does not exist.

- **Data retention policy entirely absent.** The 13 new notification tables will grow indefinitely. No retention policy, no archival strategy, no TTL, no NDPR-driven deletion cascade. This is an operational and regulatory gap.

- **USSD notification path not addressed.** The USSD gateway is a production-deployed Worker. Users on USSD sessions cannot receive push, email, or WhatsApp in-session. What happens to notifications triggered by USSD actions (e.g., a payment transfer completing during a USSD session)? The architecture has no answer.

---

## 4. DELIVERABLE-BY-DELIVERABLE REVIEW

---

### DELIVERABLE 1 — Platform Review Method

**What is good:**
- Correctly identifies 8 apps, 15+ packages, all 253 migrations, all route files, all middleware
- Confidence levels and blind spots are honestly stated
- Cross-referencing code against docs with code as authority is correct

**What is weak:**
- The claim "all 160+ vertical packages (structure and pattern sampling)" is insufficiently auditable. "Pattern sampling" is not code-first review — it is inference. The document should state which verticals were read in full vs sampled.

**What is missing:**
- `apps/projections` is a deployed Worker with its own cron, D1 binding, event processing, and HITL escalation logic. It was not inspected. This is a significant omission.
- `apps/tenant-public` is a deployed Worker serving white-label tenant public pages. Not inspected.
- `packages/i18n` — production locale package with 6 languages, 6 locale files, typed keys. Not inspected.
- `packages/offerings` — cross-pillar data access layer. Not inspected.
- `packages/workspaces`, `packages/contact`, `packages/frontend`, `packages/shared-config` — not listed.
- `scripts/governance-checks/` — 10+ governance CI scripts including `check-tenant-isolation.ts` and `check-ai-direct-calls.ts`. Not mentioned.

**What should be corrected:**
- Add all missing apps and packages to the reviewed list
- Read `apps/projections` fully — it is the most important missed surface for notification architecture
- Acknowledge that vertical package sampling was used and list which ones were fully read

---

### DELIVERABLE 2 — Current-State Findings

**What is good:**
- Findings for EmailService, OTP, WebhookDispatcher, @webwaka/events, and audit logging are accurate, specific, and cross-referenced with file paths and migration numbers
- The "What Is Duplicated" section is accurate and useful
- The "What Is Absent" list is correct and comprehensive for what was inspected

**What is weak:**
- The finding that the platform has "8 apps" is incomplete — `apps/projections` and `apps/tenant-public` exist as separate deployed Workers. This understates the review surface.
- The description of the monitoring alert as a "Single Webhook" is accurate but doesn't mention that `apps/projections` already runs scheduled HITL escalation logic (CRON every 4 hours) — which is functionally an existing notification-adjacent system.

**What is missing:**
- `apps/projections` processes events via CRON, handles HITL expiry, and is already wired to `@webwaka/events`. This makes it the current nearest-to-notification system and a critical current-state finding.
- The bank-transfer FSM in `apps/api/src/routes/bank-transfer.ts` has a full payment proof and dispute workflow — this sends zero notifications at any state transition.
- The B2B marketplace route (`b2b-marketplace.ts`) exists and contains business flows with no notifications.
- The transport vertical FSM has motor park, transit, and rideshare state machines — all producing zero notifications.
- The airtime top-up route has no notification on completion.
- `packages/i18n` already provides locale resolution and translation keys. Its existence changes the design of the template locale system.

**What should be corrected:**
- Add `apps/projections` to current-state findings as an existing partially-notification-relevant system
- Add bank-transfer FSM, B2B marketplace, transport FSM, and airtime to "silent workflows" list
- State explicitly that `packages/i18n` exists and should be used by the notification template locale system

---

### DELIVERABLE 3 — Canonical Notification Event Catalog

**What is good:**
- 80+ events across 13 domains is a genuine improvement over the empty state
- Each event has actor, subject, audience, channels, severity, RT/Digest, compliance, and template family — all necessary columns
- Status column (EXISTS/PARTIAL/MISSING) is correctly used and the assessments are accurate
- Governance-compliance domain is a good addition most implementations miss

**What is weak:**
- The `vertical.commerce` section presents only 8 generic events as representative of 160+ verticals. This is underspecified. A single-row catch-all for 160 verticals will not give implementation agents what they need.
- Event naming is inconsistent. The document uses `auth.user.registered` (correct: domain.aggregate.action) but then uses `kyc.otp.sent` (incorrect: kyc.channel.action — the aggregate should be `user`, not `otp`). Similarly `claim.intent_captured` mixes conventions.
- Some events have confused actor/subject definitions. `auth.user.login_failed` lists actor as `system` and subject as `user` — but login_failed is actor=`user` (attempted) or actor=`unknown`, subject=`account`. The system doesn't fail the login; the actor's attempt fails.
- The `social.community` domain uses both `social.*` and `community.*` namespace prefixes inconsistently.

**What is missing:**

**Partner ecosystem (M11 — live):**
- `partner.registered` — partner registered by super_admin
- `partner.status.changed` — partner activated/suspended/deactivated
- `partner.entitlement.granted` — entitlement dimension/value set
- `partner.sub_partner.created` — sub-partner created under parent
- `partner.sub_partner.status.changed` — sub-partner status change
- `partner.credit.allocated` — WakaCU wholesale credit allocated to tenant

**Bank-transfer FSM (live route, financial-critical):**
- `bank_transfer.order.created` — buyer creates transfer order
- `bank_transfer.proof.submitted` — buyer uploads payment proof
- `bank_transfer.order.confirmed` — seller confirms receipt
- `bank_transfer.order.rejected` — seller rejects proof
- `bank_transfer.order.expired` — order expires without confirmation
- `bank_transfer.dispute.raised` — buyer raises dispute
- `bank_transfer.dispute.resolved` — dispute resolved

**B2B marketplace:**
- `b2b.rfq.submitted` — request for quote submitted
- `b2b.rfq.responded` — RFQ response received
- `b2b.order.confirmed` — B2B order confirmed

**Airtime:**
- `airtime.topup.completed` — airtime purchase successful
- `airtime.topup.failed` — airtime purchase failed

**Transport FSM:**
- `transport.motorpark.status.changed` — motor park FSM state change
- `transport.rideshare.status.changed` — rideshare driver FSM change
- `transport.route.licensed` — route licensed

**FX:**
- `fx.rate.updated` — significant FX rate change

**HITL (already partially in apps/projections):**
- `ai.hitl.request.expired` — HITL request expired without response (already has cron)
- `ai.hitl.escalated.to_l3` — L3 escalation triggered

**Missing from auth domain:**
- `auth.api_key.created` — API key generated
- `auth.api_key.revoked` — API key revoked

**Missing from claim domain:**
- `claim.document.uploaded` — supporting document uploaded
- `claim.counter_claimed` — entity is counter-claimed

**What should be corrected:**
- Fix event key naming convention to be consistent: `{domain}.{aggregate}.{action}` throughout
- Add all 20+ missing events identified above
- Expand the vertical event section from 8 generic events to domain-grouped events covering commerce, services, food, logistics, health, education, financial, transport, and civic verticals
- Fix actor/subject definitions for failed-state events

---

### DELIVERABLE 4 — Missing Elements List

**What is good:**
- All 13 architectural gaps are real and correctly prioritized
- Governance/compliance section correctly identifies consent gating, suppression lists, and NDPR data subject access as gaps
- Testing gaps section is specific and useful

**What is weak:**
- Several items in the architecture gap list are marked "Medium" when they should be "Critical" for a Nigeria-first PWA-first platform. "Quiet hours / DND" is Medium — but for a mobile-first, always-on platform with low-income users on metered data plans, SMS sent at 2am is not a UX failure; it is a user attrition failure and potential regulatory exposure.
- The "Fallback channel ordering" gap is correctly identified but undersells the risk. The OTP waterfall works for OTP. For non-OTP notifications, there is no fallback at all.

**What is missing:**
- **No Cloudflare Queues provisioning gap.** The wrangler.toml has zero queue bindings. This is an infrastructure gap that must be the first task in Phase 1 before any code can be written.
- **No mention of the `apps/projections` overlap.** The existing HITL escalation cron in `apps/projections` is a partially-existing notification path that must be either absorbed into the new system or explicitly decoupled.
- **No data retention policy gap.** The 13 new tables have no TTL or retention strategy. Notification delivery logs containing recipient IDs, delivery timestamps, and content summaries are personal data under NDPR.
- **No WhatsApp template pre-approval gap.** Meta requires all business-initiated WhatsApp messages to use pre-approved templates. The gap is not just "implement channel" — it includes a template submission, approval tracking, and fallback workflow when a template hasn't been approved.
- **No i18n integration gap.** The platform has a production i18n package with Hausa, Yoruba, Igbo, and Pidgin support. The notification template system re-invents locale resolution from scratch — this is an architecture gap and a P1 violation.
- **No USSD notification path gap.** USSD sessions are stateful and synchronous. Notifications generated during a USSD session cannot be delivered via email/push to the USSD caller in-session.

**What should be corrected:**
- Add Cloudflare Queues provisioning as a Critical infrastructure gap with a specific wrangler.toml change requirement
- Add data retention policy as a High governance gap
- Add WhatsApp template pre-approval workflow as a High operational gap
- Add i18n integration gap as a High architecture violation (P1)
- Add USSD notification path as a Medium architecture decision
- Upgrade "Quiet hours" severity from Medium to High

---

### DELIVERABLE 5 — CANONICAL DOMAIN MODEL

**What is good:**
- All 13 entities are necessary and well-defined
- `notification_delivery` status lifecycle (queued → rendering → dispatched → delivered → opened → clicked → failed → suppressed → dead_lettered) is excellent and complete
- `notification_preference` four-level inheritance (platform → tenant → role → user) is correct
- `notification_inbox_item` state machine (read_at, archived_at, pinned_at, dismissed_at, snoozed_until) is thorough
- Tenant scoping (T3) is correctly enforced on every entity
- `notification_audit_log` as a separate immutable table is the right design

**What is weak:**
- `notification_delivery` is missing a `created_at` column. `queued_at` is present but `created_at` is missing as an explicit field for timeline queries.
- `notification_inbox_item` does not have a `delivery_id` foreign key. You cannot trace an inbox item back to its delivery record without scanning the `notification_delivery` table by `notification_event_id + user_id` — expensive and fragile.

**What is missing:**

**`notification_suppression_list` — Absent but needed:**
A table for globally suppressed addresses (bounced, unsubscribed, complaint). This was called out as a governance gap in 4.4 but was not added to the domain model. A suppression check cannot happen without a suppression table.

```
id                  TEXT PRIMARY KEY
tenant_id           TEXT            -- NULL = global platform suppression
channel             TEXT NOT NULL   -- 'email'|'sms'|'whatsapp'
address             TEXT NOT NULL   -- hashed: SHA-256(PLATFORM_SALT + address)
reason              TEXT NOT NULL   -- 'bounced'|'unsubscribed'|'complaint'|'admin_block'
created_at          INTEGER NOT NULL DEFAULT (unixepoch())
```

**`channel_provider` credential security flaw:**
The `config TEXT` field will contain provider API keys in practice. ADL-002 mandates AES-256-GCM encryption for sensitive keys in KV, not plaintext in D1. The entity must be redesigned:

```
-- Correct design:
config              TEXT             -- JSON: non-secret config (domain names, sender IDs, etc.)
credentials_kv_key  TEXT             -- KV key under which encrypted credentials are stored
                                     -- Follows ADL-002 pattern: key in KV, metadata in D1
```

**`notification_digest_batch.event_ids` scaling problem:**
`event_ids TEXT NOT NULL -- JSON array of notification_event ids` will fail for social-notification digests where hundreds of events accumulate in a window. A JSON array of 500 UUIDs in a single D1 TEXT field is both a query anti-pattern and an implementation footgun. A join table is required:

```
-- Required addition:
CREATE TABLE notification_digest_batch_item (
  batch_id        TEXT NOT NULL,  -- FK to notification_digest_batch
  event_id        TEXT NOT NULL,  -- FK to notification_event
  tenant_id       TEXT NOT NULL,  -- T3
  added_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (batch_id, event_id)
);
```

**`notification_audit_log` ID typo:**
The SQL uses `-- naudит_<uuid>` — the word "audit" is partially Cyrillic (и = Cyrillic lowercase i, not Latin i). This is a cosmetic issue but must not be copied into production migration files.

**What should be corrected:**
- Add `created_at` to `notification_delivery`
- Add `delivery_id` FK to `notification_inbox_item`
- Add `notification_suppression_list` as a new entity with hashed address
- Fix `channel_provider` to separate non-secret config from `credentials_kv_key` (ADL-002 compliance)
- Replace `notification_digest_batch.event_ids JSON array` with join table `notification_digest_batch_item`
- Fix ID prefix typo in `notification_audit_log`

---

### DELIVERABLE 6 — REFERENCE ARCHITECTURE

**What is good:**
- The 9-layer pipeline is the correct design for a CF Workers notification system
- Outbox pattern is called out explicitly and correctly
- Preference resolution correctly sequences: quiet hours → digest window → consent gate → suppression check
- Context resolution layer (brand context + locale) is correctly placed before template render
- Dead-letter is correctly identified as state (not deletion)

**What is weak:**
- The architecture shows "Cloudflare Queues Consumer" as a layer but does not mention that Cloudflare Queues has specific constraints: max 100 message batch size, 12-hour message timeout, and — critically — no native dead-letter queue. The DLQ must be implemented at the application layer, not assumed to be a CF Queues feature.
- The architecture says "WebSocket / SSE push to connected browser sessions" but Cloudflare Workers do not support long-lived connections natively. Durable Objects would be needed for WebSocket state, or Cloudflare Realtime. This should be explicitly noted as requiring Durable Objects or a polling fallback.

**What is missing:**
- **`apps/projections` is the natural Queue consumer.** It already has a CRON worker, processes events, and has `@webwaka/events` imported. The architecture should explicitly state that the Cloudflare Queue consumer should be implemented inside `apps/projections` rather than in `apps/api`. Adding Queue consumers to `apps/api` would mix HTTP request handling with async event processing in one Worker — an anti-pattern on CF Workers.
- **No separation between notification-generating Workers and the notification-consuming Worker.** The architecture diagram shows a single pipeline but doesn't map the layers to actual Workers. In the WebWaka multi-Worker deployment, this matters: `apps/api` publishes events; `apps/projections` (or a new `apps/notificator`) consumes them from Queues.
- **Multi-level brand context for Partner → Sub-Partner hierarchy not addressed.** TenantTheme is workspace-scoped. Sub-Partner workspaces inherit brand from their parent partner when the tenant doesn't override. The `@webwaka/white-label-theming` resolver needs to walk this chain.
- **No Cloudflare Queues infrastructure provisioning steps.** The architecture implies Queues exist, but wrangler.toml has zero queue bindings. The pipeline cannot start without queue provisioning.

**What should be corrected:**
- Add explicit note that CF Queues has no native DLQ — application-level DLQ required
- Add explicit note that long-lived SSE requires Durable Objects or polling fallback
- Specify which Worker owns the Queue consumer (`apps/projections` or a new `apps/notificator`)
- Add Queues provisioning as a prerequisite step in the architecture section
- Add multi-level brand resolution for the partner hierarchy

---

### DELIVERABLE 7 — TEMPLATE SYSTEM DESIGN

**What is good:**
- Template hierarchy (platform default → tenant override → rendered output) is correct
- Channel-specific content constraints table (SMS 160 chars, WhatsApp template-only, etc.) is accurate
- Variable schema (safe) approach with declared schema and escaping rules is correct
- Sanitization rules (no raw HTML injection, no script, no external resources) are appropriate
- Versioning workflow (draft → pending_review → active → deprecated) is correct and the rollback provision is important

**What is weak:**
- The template taxonomy uses `{domain}.{event_type}.{optional_variant}` but the examples don't follow this consistently. `auth.login_alert` would be `auth.user.login_alert` by the stated convention. The naming in the taxonomy table and the event catalog don't always match: e.g., `ai.hitl` in template table vs `ai.request.hitl_escalated` in event catalog.
- The WhatsApp constraint table says "Template-only (Meta approval)" but does not address what happens when a template has not yet been approved by Meta. No fallback, no pending-approval status in the template model, no workflow for submission.

**What is missing:**
- **`@webwaka/i18n` integration is completely absent.** The platform has a production-quality i18n package with typed locale keys in English, Hausa, Yoruba, Igbo, Pidgin, and French. Deliverable 7 invents `locale` as a column with `DEFAULT 'en-NG'` and implies locale fallback as a new system to build. This violates P1 (Build Once Use Infinitely). The template locale system must use `@webwaka/i18n` for string keys and fallback logic.
- **WhatsApp Business template approval workflow is unaddressed.** Meta pre-approves WhatsApp notification templates. There needs to be a `whatsapp_approval_status` field on `notification_template` for WhatsApp channel templates: `pending_meta_approval | meta_approved | meta_rejected`. Without this, the channel cannot be used for tenant-initiated messages.
- **Per-tenant sender domain verification is not addressed.** Resend requires DNS verification to send from a custom domain (e.g., `notifications@tenantname.com`). The design adds `senderEmailAddress` to `TenantTheme` but doesn't address the Resend domain verification flow, status tracking, or fallback to the platform sender when verification is pending.
- **Partner-level template attribution.** `white-label-policy.md` states "WebWaka attribution rules are defined per plan tier and may not be removed below the minimum required attribution level." Platform-default templates must include conditional attribution: if the tenant's plan requires attribution, the template footer must include it. This is a compliance requirement, not a nice-to-have.
- **Template size limits are not enforced.** Email HTML can grow unboundedly. The design should specify a max template body size (e.g., 100KB HTML) enforced at save time.

**What should be corrected:**
- Mandate use of `@webwaka/i18n` for all locale key resolution — do not invent a parallel locale system
- Add `whatsapp_approval_status` field to `notification_template` for WhatsApp channel
- Add sender domain verification status tracking to `channel_provider`
- Add attribution enforcement to template partials (`legal_footer` partial must read plan-tier attribution requirement)
- Align template family names with event catalog event keys

---

### DELIVERABLE 8 — REPO-BY-REPO IMPLEMENTATION IMPACT

**What is good:**
- All 10 sections (new notifications package, api, events, otp, white-label-theming, verticals, workspace-app, platform-admin, brand-runtime, migrations) are correct and contain actionable guidance
- The `packages/notifications` design is thorough with correct service and interface decomposition
- Dependency ordering is correct: notifications package before app integrations
- Migration list (0254–0268) is complete and sequenced appropriately

**What is weak:**
- Section 8.2 on `apps/api` tells implementors to "Add `notificationService.raise()` calls for every plan change, cancel, reactivate, grace, suspend transition" but doesn't call out specific method names or billing enforcement entry points. The billing enforcement is run by `POST /billing/enforce` — a scheduled and admin-triggered route, not just a user-facing route. This needs to be explicitly called out.
- The "gradual migration from legacy notification paths" strategy is thin. Deliverable 8 says "Replace all direct EmailService calls" but doesn't address the risk window where some routes use the new system and others still use direct EmailService — which would produce inconsistent branding and duplicate sends during the migration.

**What is missing:**
- **`apps/projections` is not addressed.** This is the most significant omission in this deliverable. The projections app already:
  - Processes events from `event_log` via the `@webwaka/events` package
  - Has its own CRON triggers (every 15 min, every 4 hours, daily)
  - Has HITL escalation notification logic in its scheduled handler
  - Has `INTER_SERVICE_SECRET` for authenticated inter-service calls
  
  The new notification Queue consumer should be deployed in `apps/projections` or a new dedicated Worker, not bolted onto `apps/api`. This architectural decision must be made explicit. The existing HITL escalation in `apps/projections` must either be migrated to the new notification pipeline or explicitly preserved as a separate path — both options have implications.

- **`apps/tenant-public` is not addressed.** This Worker serves white-label tenant public pages. It has notification implications: unsubscribe landing pages must be served by this app, not by `apps/brand-runtime` (which is the tenant management surface), since unsubscribes come from email links clicked by end-users on the public-facing site.

- **`packages/i18n` is not in the impact list.** Since the template system must use it, it is an impacted package that needs notification-specific translation keys added.

- **`packages/partner` / partner notification events.** The partner system in `apps/api/src/routes/partners.ts` has no notification hooks. It must be added to the repo-by-repo impact.

- **`apps/admin-dashboard`** — the first agent mentions it was inspected but does not address it in Deliverable 8. The admin dashboard presumably needs notification management surfaces too.

**What should be corrected:**
- Add `apps/projections` section with explicit decision: is it the Queue consumer home, or does a new Worker get created?
- Add `apps/tenant-public` section — owns the unsubscribe landing page
- Add `packages/i18n` to impacted packages — add notification-specific keys
- Add `apps/api/routes/partners.ts` to the change list
- Add a "migration concurrency strategy" note — how to handle the window where both old and new paths coexist

---

### DELIVERABLE 9 — PHASED IMPLEMENTATION ROADMAP

**What is good:**
- Phase 0 (contracts first) is correctly sequenced
- Each phase has objectives, repos, prerequisites, implementation tasks, migration tasks, tests, and exit criteria — a complete phase definition
- Phase 8 (QA hardening) as a named, dedicated phase is the right discipline
- The 150 engineering days estimate is credible given the scope

**What is weak:**
- Phase 1 begins with "Implement Cloudflare Queues consumer" but the wrangler.toml has zero Queue bindings. Before any code is written, Cloudflare Queues must be created in the CF account and provisioned in wrangler.toml for both staging and production. This infrastructure step is absent from Phase 0 and Phase 1.
- Phase 2 exit criteria require "Email delivered. Audit log written" — but Phase 2 is supposed to precede Phase 3 (template engine). If Phase 2 sends email before the template engine exists, it sends the old hardcoded HTML. The exit criteria imply using old templates during Phase 2, which means tenant branding is still absent during Phase 2 delivery. This should be stated explicitly to avoid confusion.
- Phase 6 estimates "5 weeks" for wiring all 160+ vertical packages, but the backlog assigns this as 3 days. This inconsistency must be resolved.

**What is missing:**
- **Phase 0 must include Cloudflare Queues provisioning** as a prerequisite infrastructure step: create Queue binding in CF account, add `[[queues.producers]]` to `apps/api/wrangler.toml`, add `[[queues.consumers]]` to the consumer Worker's wrangler.toml.
- **No rollback/feature-flag strategy.** Phase 8 mentions "feature flag per tenant" for production rollout, but Phase 6 replaces all direct EmailService calls. The rollback path if the new pipeline breaks is undefined. A kill switch at the `NotificationService.raise()` level (e.g., `NOTIFICATION_PIPELINE_ENABLED` env var that falls back to direct EmailService) is essential.
- **No mention of the `apps/projections` vs new Worker architectural decision.** This decision must be made in Phase 0, before any code is written. It affects wrangler.toml structure, CI/CD pipelines, and Worker-to-Worker Queues wiring.
- **HITL de-duplication not addressed.** `apps/projections` already has HITL expiry notification logic. Phase 6 (vertical wiring) should explicitly address whether to migrate `apps/projections` HITL notifications to the new pipeline.

**What should be corrected:**
- Add Queue provisioning as Phase 0 Task N-007
- Add "consumer Worker architectural decision" as Phase 0 Task N-008
- Add rollback/kill switch to Phase 6 tasks
- Fix the 5-week vs 3-day discrepancy for Phase 6 vertical wiring
- Explicitly address HITL migration in Phase 6

---

### DELIVERABLE 10 — BEST-PRACTICE GUARDRAILS

**What is good:**
- G1 through G15 are specific, justified, and most are enforceable via code or lint
- G2 (ESLint rule banning direct EmailService) is a concrete, implementable enforcement mechanism
- G5 (transaction OTPs via SMS only) and G6 (no raw OTPs stored) correctly preserve existing security properties
- G8 (consent gating with clear transactional vs marketing distinction) is correct and NDPR-aligned
- G12 (critical notifications bypass quiet hours) is an important override rule

**What is weak:**
- G11 says "A notification blocked by quiet hours must be scheduled for delivery after the quiet window closes — not suppressed." This is correct but conflicts with CF Workers' stateless model. How is the deferred send triggered? This requires either a scheduled cron sweep of "ready_to_send" deliveries or Cloudflare Queue message delay. The mechanism must be specified.
- G15 says "Delivery logs store provider message IDs, not content." This is correct, but the `notification_delivery` table has no explicit `content` or `body` column to store — so this guardrail is actually already enforced by the schema. It should be restated as: "notification_delivery must never gain a `body` or `content` column."

**What is missing:**
- **G16 — Credential Isolation for Providers (ADL-002).** Provider API keys for `channel_provider` must be stored encrypted in KV via AES-256-GCM with a reference key in D1 — following the existing ADL-002 pattern. No direct API key values may be stored in D1 `config` JSON. This is an architecture-critical rule not covered by any of G1–G15.
- **G17 — WhatsApp Templates Must Be Pre-Approved Before Dispatch.** Before any WhatsApp notification is dispatched, the template's `whatsapp_approval_status` must be `meta_approved`. Attempting to send with a non-approved template will result in a Meta API rejection that does not fail gracefully and cannot be retried.
- **G18 — Locale Resolution Must Use @webwaka/i18n.** Template locale resolution must use the existing `@webwaka/i18n` package (`createI18n(locale)`) rather than inventing a parallel locale resolution system. New notification-specific string keys must be added to the i18n locale files.
- **G19 — Notifications Must Respect Entitlement Tier.** Some notification channels (push, SMS) may be restricted to specific subscription plans per `@webwaka/entitlements`. Channel dispatch must check entitlement before send, not just preference.
- **G20 — Suppression List Must Be Checked Before All External Channel Dispatches.** Before dispatching to email, SMS, or WhatsApp, the normalized address hash must be checked against `notification_suppression_list`. Sending to a suppressed address violates CAN-SPAM, NDPR, and could result in provider account suspension.

**What should be corrected:**
- Add G16–G20 as above
- Add implementation mechanism to G11 (deferred send via CRON sweep or Queue delay)
- Restate G15 more precisely

---

### MISSING DELIVERABLE — Open Questions and Decisions Needed

**The audit specification explicitly requires this deliverable. It does not exist in the first agent's output.**

The following are legitimate unresolved decisions that must be answered before implementation begins:

1. **Queue Consumer Worker architecture**: Should the notification Queue consumer live in the existing `apps/projections` Worker (co-located with existing event processing) or in a new dedicated `apps/notificator` Worker? This affects wrangler.toml, CI/CD, and Worker count.

2. **HITL escalation ownership**: `apps/projections` already runs an HITL escalation CRON. Should this be migrated into the new notification pipeline or left as a separate path?

3. **WhatsApp template approval workflow**: What is the submission and tracking flow for Meta WhatsApp template pre-approval? Who is responsible — platform operators or tenants?

4. **Tenant email domain verification**: When a tenant configures a custom `senderEmailAddress`, what is the Resend domain verification UX flow, and what happens to emails during the pending-verification window?

5. **Multi-level brand hierarchy**: For Sub-Partner workspaces (Level 2), should the notification brand context walk: Sub-Partner branding → Parent Partner branding → Platform default? Or should each tenant be self-contained?

6. **Notification data retention**: What is the retention policy for `notification_delivery`, `notification_inbox_item`, and `notification_audit_log` records? How does NDPR Right to Erasure apply to notification history?

7. **Digest engine timing**: Is the digest window cron global (runs once per window type across all tenants) or per-tenant (triggered individually)? CF Workers has 100ms CPU time limit per invocation — a global sweep across thousands of tenants would require careful batching.

8. **Partner notification surfaces**: Do partner admins need their own notification channel (a `partner-admin` inbox) separate from the workspace admin inbox?

9. **USSD notification queuing**: For notifications triggered by USSD actions, how are they held and when are they delivered? After the USSD session ends? Via SMS immediately?

10. **Low-data mode compatibility**: `apps/api/src/routes/low-data.ts` exists for users on metered/low-bandwidth connections. Should in-app notifications be suppressed or compressed in low-data mode?

**What should be corrected:**
- Add this deliverable to the document as Deliverable 12 (shifting the current backlog to Deliverable 13 or renaming the existing Deliverable 11)

---

### DELIVERABLE 11 — ACTIONABLE BACKLOG

**What is good:**
- Tasks are broken into phases
- Estimates are credible and not grossly underestimated
- Priority levels (P0/P1/P2) are correctly applied
- Most P0 tasks are genuinely foundational

**What is weak:**
- N-040 appears TWICE: in Phase 3 ("Migrate 6 existing email templates into notification_templates table") and in Phase 4 ("Implement Termii SMS channel"). This is a critical duplicate ID bug — implementation agents will reference N-040 and receive conflicting task definitions.
- N-006 ("Define preference inheritance model spec") is estimated at 0.5 days. Given that preference inheritance must cover 4 scopes, per-channel, per-event-key, wildcard matching, and cache invalidation, 0.5 days is too thin. This is a design decision with downstream implications for every channel.
- No task dependencies are explicit within the backlog. N-020 depends on N-014 which depends on N-012 — but the table format gives no way to trace these.

**What is missing:**
- **N-007: Provision Cloudflare Queues in wrangler.toml.** This must happen before N-012. No code can use CF Queues without the binding.
- **N-008: Architectural decision — Queue consumer Worker.** Decide and document whether `apps/projections` or a new Worker owns the consumer.
- **N-009: Create HITL migration plan** — decide if `apps/projections` HITL escalation cron migrates to new pipeline.
- **N-040 must be renumbered** — the duplicate must be given a unique ID (e.g., N-040b or N-056).
- **No task for `notification_suppression_list`** — the entity is missing from the domain model and there's no backlog task to build or query it.
- **No task for i18n integration** — no task to add notification-specific keys to `packages/i18n` locale files.
- **No task for WhatsApp template submission workflow.**
- **No task for partner event notification wiring** (M11 partner routes).
- **No task for bank-transfer notification wiring** (high-value financial FSM).
- **No task for `notification_digest_batch_item` join table** — the JSON array design flaw has no corresponding correction task.
- **No task for data retention policy** — define TTLs, archival, and NDPR deletion propagation.
- **No task for USSD notification queuing decision.**
- **No task for rollback/kill-switch capability** during Phase 6 migration.
- **No task for `apps/tenant-public` unsubscribe page** — currently assigned to `apps/brand-runtime`, which is wrong.

**What should be corrected:**
- Renumber N-040 (Phase 4) to a unique ID
- Add N-007 (Queue provisioning), N-008 (consumer Worker decision), N-009 (HITL migration plan)
- Add explicit dependency tracking per task
- Add all missing tasks listed above
- Revise N-006 estimate to 2d

---

## 5. RISK ASSESSMENT

### Architecture Risks

| Risk | Description | Severity |
|---|---|---|
| CF Queues not provisioned | wrangler.toml has no queue bindings. Phase 1 cannot start. | Critical |
| D1 write throughput limit | D1 supports ~50 writes/second. High-volume vertical events across many tenants could saturate this limit during notification delivery writes. | High |
| CF Workers WebSocket / SSE | Real-time inbox push requires Durable Objects or polling. Long-lived connections are not supported in stateless Workers. | High |
| No native DLQ in CF Queues | CF Queues has no built-in dead-letter queue. Application-level DLQ adds complexity not fully costed in the roadmap. | Medium |
| HITL overlap with apps/projections | HITL escalation already runs in a deployed Worker. New notification pipeline may double-notify. | Medium |

### Multi-Tenant Risks

| Risk | Description | Severity |
|---|---|---|
| Partner hierarchy brand resolution | Sub-Partner workspaces need 3-level brand context resolution, not 2-level. Missing from architecture. | High |
| Preference KV cache key collision | If `notification_preference` KV cache keys are not prefixed with `tenant:{tenant_id}:` per T3 invariant, cross-tenant cache reads are possible. | Critical |
| Audience resolution for cross-workspace events | `workspace_admins` audience type on a platform-level event could resolve incorrectly if tenant_id is not threaded through the full resolution chain. | High |

### White-Label Risks

| Risk | Description | Severity |
|---|---|---|
| Attribution rule not enforced | white-label-policy.md requires WebWaka attribution on plans below the attribution exemption tier. Email templates have no attribution enforcement mechanism. | High |
| Per-tenant sender domain pending-verification | During Resend DNS verification, emails sent from an unverified domain may be rejected or sent from the platform default with no warning to the tenant. | Medium |
| WhatsApp template not approved | Sending an unapproved template to Meta results in a hard API rejection that looks like a delivery failure, not a template configuration error. | High |

### Operational Risks

| Risk | Description | Severity |
|---|---|---|
| No data retention policy | notification_delivery, notification_inbox_item, and notification_audit_log grow indefinitely with no purge mechanism. | High |
| Digest cron scaling | A global digest sweep across thousands of tenants in a single CF Worker invocation will hit CPU time limits. | Medium |
| Silent test environment sends | Without a sandbox mode enforced from Phase 0, Phase 2 testing could send real emails to real users. | High |

### Migration Risks

| Risk | Description | Severity |
|---|---|---|
| No kill switch for pipeline migration | Phase 6 replaces all EmailService calls. If the new pipeline fails in production, there is no rollback path. | Critical |
| Concurrent email sends during migration | Routes partially migrated to NotificationService + legacy EmailService routes can produce duplicate sends. | High |
| Backlog duplicate N-040 | Two tasks share the same ID. Implementation agents will be confused or skip one. | Medium |

### QA Risks

| Risk | Description | Severity |
|---|---|---|
| No load test for digest engine | The digest engine timing and D1 batch write behavior under load is not tested. | Medium |
| WhatsApp template approval is manual | Meta approval process is external and cannot be tested in CI. No test strategy defined. | Medium |
| i18n locale coverage | If notification templates use parallel locale resolution, locale-specific rendering bugs in Hausa/Yoruba/Igbo/Pidgin won't be caught by English-only tests. | Medium |

---

## 6. CORRECTIVE ACTIONS (PRIORITIZED)

The following corrections must be made to the deliverables document before implementation begins. Ordered by severity.

### BLOCKING — Must fix before any implementation starts

**CA-001: Add `apps/projections` to Deliverable 1 and 8**
Read `apps/projections/src/index.ts` fully. Add it to the reviewed apps list. Add it to Deliverable 8 with an explicit architectural decision: does the notification Queue consumer live in `apps/projections` or in a new Worker?

**CA-002: Fix `channel_provider` credential design (ADL-002)**
Remove `config TEXT` as the storage for provider credentials. Add `credentials_kv_key TEXT` following the ADL-002 pattern: encrypted API keys in KV, reference key in D1. Update the schema in Deliverable 5, the architecture in Deliverable 6, and add a guardrail G16.

**CA-003: Add Cloudflare Queues provisioning task to backlog and Phase 1**
Add N-007: "Provision CF Queues in apps/api wrangler.toml and consumer Worker wrangler.toml (staging + production)." This is the first action in Phase 1 and blocks all durable transport work.

**CA-004: Renumber duplicate N-040**
Phase 4 N-040 ("Implement Termii SMS channel") must be renumbered to a unique ID to avoid implementation confusion.

**CA-005: Add missing "Open Questions and Decisions Needed" deliverable**
Add as Deliverable 12. Include the 10 unresolved decisions identified in this audit. Specifically flag: Queue consumer Worker decision, HITL migration decision, WhatsApp approval workflow, data retention policy, and multi-level brand hierarchy.

### HIGH — Must fix before Phase 2 begins

**CA-006: Add `notification_suppression_list` entity to domain model**
Add hashed address suppression list table to Deliverable 5. Add check in reference architecture preference resolution layer. Add backlog task.

**CA-007: Add `notification_digest_batch_item` join table**
Replace `event_ids TEXT` in `notification_digest_batch` with a proper join table. Add corresponding backlog task.

**CA-008: Add `delivery_id` FK to `notification_inbox_item`**
Add `delivery_id TEXT` column referencing `notification_delivery` for traceability.

**CA-009: Add `created_at` to `notification_delivery`**
Add explicit `created_at` column (separate from `queued_at`).

**CA-010: Add partner ecosystem events to Deliverable 3**
Add all 6 partner-related notification events covering partner registration, status changes, entitlement grants, sub-partner creation, and credit allocation.

**CA-011: Add bank-transfer FSM events to Deliverable 3**
Add all 7 bank-transfer events. These are financial-critical state changes that legally require customer notification.

**CA-012: Add WhatsApp approval status to `notification_template`**
Add `whatsapp_approval_status TEXT CHECK (whatsapp_approval_status IN ('not_required','pending_meta_approval','meta_approved','meta_rejected'))` to `notification_template`. Add guardrail G17.

**CA-013: Add data retention policy as a missing gap and a backlog task**
Add data retention policy gap to Deliverable 4. Add backlog task specifying TTLs per table (e.g., delivery logs: 90 days; inbox items: 365 days; audit logs: 7 years for NDPR). Add deletion cascade from `notification_audit_log` on user data erasure.

**CA-014: Add rollback/kill-switch task to Phase 6**
Add an environment variable `NOTIFICATION_PIPELINE_ENABLED` that gates `NotificationService.raise()` with fallback to direct EmailService. This is the rollback mechanism for Phase 6 migration.

**CA-015: Mandate `@webwaka/i18n` for template locale resolution**
Replace the invented locale system in Deliverable 7 with a directive to use `@webwaka/i18n`. Add notification-specific locale keys to i18n package. Add guardrail G18.

### MEDIUM — Should fix before final approval

**CA-016: Add airtime, B2B marketplace, and transport FSM events to catalog**
Add ~12 events covering airtime top-up, B2B RFQ, and transport FSM state changes.

**CA-017: Fix event key naming inconsistencies**
Standardize all event keys to `{domain}.{aggregate}.{action}` — fix `kyc.otp.sent` → `kyc.user.otp_sent`, fix social/community namespace collision.

**CA-018: Add G16–G20 guardrails**
Add: credential isolation (ADL-002), WhatsApp pre-approval, i18n mandate, entitlement tier check for channels, suppression list check before external dispatch.

**CA-019: Add `apps/tenant-public` unsubscribe page to Deliverable 8**
The unsubscribe landing page (`/unsubscribe?token=...`) should be served by `apps/tenant-public`, not `apps/brand-runtime`. Correct the routing in Deliverable 8.

**CA-020: Add USSD notification path decision to Open Questions**
Document the behavior for notifications triggered by USSD actions and add to the decisions deliverable.

---

## 7. ACCEPTANCE DECISION

**The deliverables are NOT ready for implementation as written.**

The document clears the bar for thoroughness, code-grounding, and overall architectural soundness. It does not clear the bar for safety-to-implement, which requires:

**Blocking issues (must be resolved before any Phase 0 work begins):**
1. CA-001: `apps/projections` architectural decision (consumer Worker)
2. CA-002: `channel_provider` credential security flaw (ADL-002 violation)
3. CA-003: CF Queues provisioning task
4. CA-004: Duplicate N-040 backlog ID
5. CA-005: Missing "Open Questions" deliverable

**Conditional approval after blocking issues resolved:**
Once CA-001 through CA-005 are resolved, implementation may begin on Phase 0 and Phase 1 while CA-006 through CA-015 are addressed in parallel. CA-016 through CA-020 may be addressed during Phase 2.

**What this means practically:**
The first agent should update `docs/notification-engine-review.md` with all corrections identified in Section 6 before any implementation task agent is created. The revised document should then be re-reviewed against CA-001 through CA-005 only to confirm blocking issues are resolved.

The architecture, domain model, guardrails, and phased approach are all fundamentally correct and implementable. The corrections required are additions and fixes — not redesigns.

---

*This audit was conducted via independent code reconstruction and comparison against `docs/notification-engine-review.md`. All findings are grounded in the actual source tree. No claims are inferred.*
