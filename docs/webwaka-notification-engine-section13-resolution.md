# WebWaka Notification Engine — Section 13 Resolution Pack

**Prepared:** 2026-04-20  
**Authority:** This document resolves all 13 open questions from Section 13 of `docs/webwaka-notification-engine-final-master-specification.md`  
**Status:** AUTHORITATIVE — Ready for direct insertion into master specification as replacement for Section 13  
**Scope:** All 13 OQ decisions resolved with concrete defaults, implementation impact, and acceptance criteria

---

## 1. EXECUTIVE SUMMARY

Section 13 of the final master specification identified 13 genuine unresolved architectural and operational decisions. Left open, these decisions create drift risk across at least 7 repositories, 4 Worker processes, 2 new packages, and the platform's compliance posture under NDPR and CBN regulations.

This document resolves all 13. Every decision has a concrete recommended default, an explicit rationale grounded in WebWaka's Cloudflare-native, Nigeria-first, multi-tenant architecture, and specific implementation consequences for the roadmap, backlog, and guardrails.

**Summary of decisions made:**

| OQ | Title | Decision |
|---|---|---|
| OQ-001 | Queue Consumer Worker Location | New dedicated `apps/notificator` Worker |
| OQ-002 | HITL Escalation Ownership | Migrate to notification pipeline; kill old CRON path in Phase 6 |
| OQ-003 | WhatsApp Template Approval | Platform-operated Business Account; operator submits on behalf of tenants |
| OQ-004 | Tenant Sender Domain Verification | Fall back to platform sender with tenant display name during verification; surface status in brand-runtime |
| OQ-005 | Partner/Sub-Partner Brand Hierarchy | Always walk to platform default; opt-in "brand independence" flag per Sub-Partner |
| OQ-006 | Notification Data Retention and NDPR Erasure | TTLs confirmed; zero out PII fields in audit log (never delete rows) |
| OQ-007 | Digest Engine Timing Model | Queue-continued global CRON sweep; continuation via Queue delay |
| OQ-008 | Partner Admin Notification Surface | Shared inbox API; partner events surface in partner-admin app via existing schema |
| OQ-009 | USSD Notification Handling | SMS immediately (outside session); in-app queued; never interrupt USSD session flow |
| OQ-010 | Real-Time Inbox Push Technology | Short-poll at 30s interval as default; SSE upgrade path documented |
| OQ-011 | Low-Data Mode Notification Behaviour | Push suspended; in-app text-only; SMS for critical; email deferred |
| OQ-012 | Sandbox Mode Strictness | Redirect all deliveries to env-configured test addresses; enforced by `NOTIFICATION_SANDBOX_MODE` |
| OQ-013 | Webhook Event Expansion Scope | 30-event curated starter set; full catalog on enterprise plan; 25 subscriptions per tenant standard limit |

None of these decisions are experimental. Each is grounded in CF Workers operational constraints, WebWaka's actual repo topology, Nigeria-first connectivity realities, and NDPR/CBN compliance requirements.

---

## 2. RESOLUTION PRINCIPLES

The following principles were applied consistently across all 13 decisions:

**P-R1 — Concrete over hedged.** Every decision has a single recommended option. "It depends" without a default is not acceptable.

**P-R2 — Cloudflare operational reality first.** Decisions respect CF Workers CPU time limits (100ms per invocation), stateless Worker constraints, CF Queue batching behavior (max 100 messages, 5s batch timeout, 5 retries), and the absence of a native CF Queues DLQ.

**P-R3 — Nigeria-first connectivity.** Intermittent mobile data, USSD as a primary channel for millions of users, and low-bandwidth conditions on the Lagos–Abuja corridor and beyond are treated as primary constraints, not edge cases.

**P-R4 — Multi-tenant isolation non-negotiable.** Every decision that touches data, preferences, or delivery must maintain T3 tenant isolation. No shared-state approach is acceptable.

**P-R5 — Build once, evolve clearly.** Where a staged answer is needed (simpler default now, richer option later), the default is chosen to not require a redesign when the evolution is adopted.

**P-R6 — Compliance before convenience.** NDPR data subject rights, CBN R8 OTP channel restrictions, and CAN-SPAM suppression obligations take precedence over feature richness or implementation simplicity.

**P-R7 — Operational safety via kill-switches.** Every decision that touches live delivery introduces or maintains a kill-switch or staged rollout path to prevent double-notification and silent failures during migration.

---

## 3. DECISION MATRIX OVERVIEW

| ID | Title | Recommended Decision | Owner | Deadline / Phase Gate | Spec Sections Affected |
|---|---|---|---|---|---|
| OQ-001 | Queue Consumer Worker Location | New `apps/notificator` Worker | Platform Architect | Phase 0 start | §8, §10, §11 Phase 0-1, §14 N-007/N-008/N-012 |
| OQ-002 | HITL Escalation Ownership | Migrate to pipeline; retire CRON path in Phase 6 | Backend Engineer | Phase 0 (plan), Phase 6 (execute N-100) | §8, §10 apps/projections, §11 Phase 6, §14 N-009/N-100 |
| OQ-003 | WhatsApp Template Approval | Platform-operated WA Business Account; operator submits | Platform Ops Lead | Phase 3 start (before N-044) | §9, §10, §11 Phase 3/4/8, §12 G17, §14 N-118 |
| OQ-004 | Tenant Sender Domain Verification | Fall back to platform sender; surface status in brand-runtime | Backend Engineer | Phase 4 (N-053) | §7 channel_provider, §10 apps/brand-runtime, §11 Phase 4 |
| OQ-005 | Brand Hierarchy Resolution | Walk to platform default; opt-in independence flag | Platform Architect | Phase 3 start (before N-031) | §8 Layer 5, §9, §10 packages/white-label-theming |
| OQ-006 | Data Retention and NDPR Erasure | Zero out PII fields; confirmed TTLs | Platform Architect + Legal | Phase 8 (N-115/N-116) | §7 retention table, §11 Phase 8, §14 N-115/N-116 |
| OQ-007 | Digest Engine Timing Model | Queue-continued global CRON sweep | Backend Engineer | Phase 5 (N-063/N-064) | §8 Layer 9, §10 packages/notifications, §14 N-063/N-064 |
| OQ-008 | Partner Admin Notification Surface | Shared inbox API; surface in partner-admin via existing schema | Full-Stack Engineer | Phase 6 (N-091) | §5 partner catalog, §10 apps/partner-admin, §14 N-091 |
| OQ-009 | USSD Notification Handling | SMS immediately; in-app queued; never interrupt USSD session | Backend Engineer | Phase 5 (preference resolver) | §8 Layer 4, §10 apps/ussd-gateway, §12 new G21 |
| OQ-010 | Real-Time Inbox Push Technology | Short-poll 30s; SSE upgrade path documented | Full-Stack Engineer | Phase 5 (N-067) | §8 Layer 8, §10 apps/workspace-app, §14 N-067 |
| OQ-011 | Low-Data Mode Notification Behaviour | Push suspended; in-app text-only; email deferred; SMS for critical | Backend Engineer | Phase 3 start (preference resolver) | §8 Layer 4, §12 new G22, §14 N-060 |
| OQ-012 | Sandbox Mode Strictness | Redirect to `NOTIFICATION_SANDBOX_*` env vars; enforced by `NOTIFICATION_SANDBOX_MODE` | Backend Engineer | Phase 7 (N-111) | §10 packages/notifications, §11 Phase 7, §14 N-111 |
| OQ-013 | Webhook Event Expansion Scope | 30-event curated starter; full catalog on enterprise; 25 subscription cap on standard | Platform Architect | Phase 6 (N-097) | §4 event catalog, §10 apps/api webhook-dispatcher, §14 new N-131 |

---

## 4. DETAILED DECISION RESOLUTIONS

---

### OQ-001 — Queue Consumer Worker Location

**Question**  
Does the Cloudflare Queue consumer for the notification dispatch pipeline live inside `apps/projections` (co-located with existing CRON and HITL logic) or in a new dedicated `apps/notificator` Worker?

**Why This Matters**  
This is the highest-impact Phase 0 decision. It determines which wrangler.toml receives the `[[queues.consumers]]` binding, which process owns the 100-message-per-batch event loop, which Worker needs the D1 database binding, and which CI/CD pipeline owns notification deployment. Getting this wrong means two months of Phase 1/2 work targeting the wrong runtime, with a painful migration to disentangle.

**Current Context From Master Spec**  
Section 8.0 specifies that CF Queues must be provisioned before Phase 1. The consumer binding must be added to one Worker. `apps/projections` already has a D1 binding, imports `@webwaka/events`, and runs HITL escalation CRON. The spec defers the ownership decision to OQ-001.

**Options Considered**

*Option A — Use `apps/projections` as the Queue consumer*  
Co-locate notification processing with the existing event-processing Worker. No new Worker to deploy or maintain. D1 binding already present. `@webwaka/events` already imported.

*Option B — Create a new `apps/notificator` dedicated Worker*  
Single-responsibility Worker: its only job is consuming notification events from the Queue, running the rule engine, resolving preferences and templates, and dispatching. Completely independent from projection rebuilds, search indexing, and HITL CRON logic.

*Option C — Split-consumer model: projections owns CRON, notificator owns Queue*  
HITL CRON stays in projections. Queue consumer lives in notificator. Clean separation from day 1.

**Comparative Analysis**

| Criterion | Option A (projections) | Option B (notificator) | Option C (split) |
|---|---|---|---|
| Single responsibility | ✗ projections does 5 jobs | ✓ | ✓ |
| Deployment isolation | ✗ notification deploy = projections deploy | ✓ independent | ✓ |
| CF Workers CPU isolation | ✗ CRON + Queue compete for same Worker budget | ✓ separate budget | ✓ |
| Scaling independence | ✗ projections scales with notification load | ✓ | ✓ |
| Setup complexity | Low | Medium | Low (same as B + projections stays) |
| D1 binding | Already exists | New binding needed | Both need bindings |
| Risk of OQ-002 entanglement | High — HITL and notification in same Worker | None | Eliminated |
| NDPR audit surface | Harder to audit one Worker doing everything | Clean, auditable | Clean |

**Recommended Decision**  
**Option B — Create a new `apps/notificator` dedicated Cloudflare Worker.**

Option C is equivalent to Option B plus the clean handling of OQ-002 (see below). Since we are resolving both OQ-001 and OQ-002 together, Option B is the right structure: a new `apps/notificator` Worker owns the CF Queue consumer, and `apps/projections` retains its own CRON responsibilities.

**Why This Is Best For WebWaka**  
WebWaka's notification engine will eventually process thousands of events per minute across hundreds of tenants and 160+ verticals. A Worker that also rebuilds search indexes, runs analytics snapshots, and sweeps HITL expiry timers will saturate its 100ms CPU budget. More critically, a bounce spike or provider outage that slows notification processing would delay search projection rebuilds — two entirely different user-facing SLAs coupled together. A dedicated Worker allows:
- Independent deployment: notification engine changes do not require redeploying projection logic
- Independent scaling: CF Workers automatically scales per Worker — notification throughput does not affect projection throughput
- Independent rollback: `NOTIFICATION_PIPELINE_ENABLED=0` on notificator does not affect projections
- Clean security audit surface: all notification-related credentials, environment bindings, and KV namespaces are scoped to one Worker

**Required Architecture / Data / API / UI Changes**

```
apps/notificator/
  wrangler.toml             -- CF Queue consumer, D1 binding, KV binding, env vars
  src/index.ts              -- Queue consumer handler + message routing
  src/consumer.ts           -- NotificationService batch processor
  src/env.ts                -- Env type with NOTIFICATION_QUEUE, DB, NOTIFICATION_KV
  package.json              -- depends on packages/notifications
```

`wrangler.toml` (notificator, staging):
```toml
name = "webwaka-notificator-staging"
main = "src/index.ts"
compatibility_date = "2024-01-01"

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
```

**Repos / Workers / Packages Affected**
- `apps/notificator` — new Worker (create in this task)
- `apps/api/wrangler.toml` — add queue producer binding
- `packages/notifications` — core dependency of notificator
- `infra/cloudflare/` — new Worker registration
- `.github/workflows/` — new deploy-notificator.yml

**Roadmap / Backlog Changes Needed**
- N-008: Updated from "document decision" to "scaffold apps/notificator Worker skeleton" (0.5d → 2d)
- N-012: Updated — CF Queue consumer implemented in `apps/notificator`, not `apps/projections`
- New N-012a: Create apps/notificator wrangler.toml with staging + production environments (1d)

**Guardrails / Compliance Implications**  
No guardrail change needed. G1 (tenant isolation) applies to notificator with the same force as all other Workers.

**Testing Requirements**  
- Unit: `apps/notificator/src/consumer.test.ts` — processes batch of 100 messages without cross-tenant leakage
- Integration: End-to-end — `apps/api` publishes a notification event to staging Queue; `apps/notificator` receives and dispatches
- Load: Queue consumer processes 1,000 messages/minute without DLQ spillage

**Rollback / Fallback Plan**  
`NOTIFICATION_PIPELINE_ENABLED=0` on notificator stops consumption (messages stay in Queue up to 7 days). During that window, fall back to direct EmailService. If notificator is permanently abandoned, consumer binding can be moved to projections with no Queue message loss.

**Decision Owner:** Platform Architect  
**Decision Deadline:** Phase 0, Day 1 — before any other Phase 0 task starts  
**Acceptance Criteria:**
- `apps/notificator/` directory created with working `wrangler.toml`
- Staging Queue consumer receiving test messages
- `apps/api` producer binding confirmed working
- CI/CD pipeline for notificator created and running green

---

### OQ-002 — HITL Escalation Ownership After Notification Pipeline

**Question**  
`apps/projections` currently runs HITL expiry sweep and L3 escalation notifications via a CRON every 4 hours. Should this be migrated to the new notification pipeline (`ai.hitl.request_expired` and `ai.hitl.escalated_to_l3` events via `NotificationService`) or preserved as a parallel path?

**Why This Matters**  
Both paths active simultaneously means every HITL expiry produces two notification sends — one from projections CRON, one from the notification pipeline — with no idempotency mechanism between them. This is not a theoretical risk; it is a guaranteed double-notification for every HITL escalation during and after Phase 6 unless the migration is deliberate.

**Current Context From Master Spec**  
`apps/projections` CRON fires every 4 hours. It has its own dispatch logic independent of `@webwaka/otp` and `EmailService`. Phase 6 backlog item N-100 is "Migrate apps/projections HITL escalation to unified pipeline (per OQ-002 decision)." The risk of double-notification is explicitly flagged in the spec.

**Options Considered**

*Option A — Migrate completely to notification pipeline; retire projections CRON path*  
`apps/projections` CRON emits `ai.hitl.request_expired` and `ai.hitl.escalated_to_l3` events via `NotificationService.raise()`. The `apps/notificator` Queue consumer handles dispatch. The old direct dispatch code in projections is deleted.

*Option B — Preserve projections CRON path; leave notification pipeline events as duplicates*  
Keep both paths. Accept that HITL escalations will send two notifications until projections is manually decommissioned.

*Option C — Projections CRON stays but is muted via kill-switch; notification pipeline handles dispatch*  
Add a `HITL_LEGACY_NOTIFICATIONS_ENABLED` env var to projections. Set it to `0` when the notification pipeline is live. Projections continues to sweep expiry timers but does not send notifications directly.

**Comparative Analysis**

| Criterion | Option A (clean migration) | Option B (both active) | Option C (muted legacy) |
|---|---|---|---|
| Double-notification risk | None after migration | Guaranteed | None if muted correctly |
| Implementation complexity | Medium (must migrate carefully) | None | Low |
| Operational clarity | High | Low | Medium |
| Long-term codebase health | Best — one path | Poor — dead code | Medium — legacy code persists |
| Audit trail integrity | Clean | Polluted with duplicates | Clean |
| Rollback capability | Kill notificator → re-enable projections path | Always on | Re-enable projections CRON |

**Recommended Decision**  
**Option C as Phase 6 migration bridge, resolving fully to Option A by Phase 9.**

Concretely:
1. In Phase 6 (N-100), add `HITL_LEGACY_NOTIFICATIONS_ENABLED=1` env var to `apps/projections`. The existing CRON continues sending for now.
2. When `ai.hitl.request_expired` and `ai.hitl.escalated_to_l3` events are wired and tested in `NotificationService`, set `HITL_LEGACY_NOTIFICATIONS_ENABLED=0` in `apps/projections` staging.
3. Observe staging for 48 hours — confirm HITL escalations arrive via the pipeline with no duplicates.
4. Deploy `HITL_LEGACY_NOTIFICATIONS_ENABLED=0` to production.
5. In Phase 9, delete the direct dispatch code from `apps/projections`. The CRON sweep must remain (it performs expiry writes to D1 — that logic should not be moved).

**Why This Is Best For WebWaka**  
The CRON in `apps/projections` does two things: (1) scans for expired HITL requests and updates their status in D1, and (2) sends notifications to admins. Only (2) belongs in the notification pipeline. (1) stays in projections permanently — it is a data lifecycle responsibility, not a notification responsibility. This means the migration is a scalpel cut: remove the notification send from projections, not the expiry sweep. Option C bridges this cleanly.

**Required Architecture / Data / API / UI Changes**

In `apps/projections/src/index.ts`:
```typescript
const sendHitlNotifications = env.HITL_LEGACY_NOTIFICATIONS_ENABLED !== '0';
if (sendHitlNotifications) {
  // existing legacy dispatch
} else {
  // emit ai.hitl.request_expired via publishEvent() — notificator handles dispatch
  await publishEvent(env.DB, 'ai.hitl.request_expired', { ... });
}
```

In `apps/projections/wrangler.toml`:
```toml
[env.staging.vars]
HITL_LEGACY_NOTIFICATIONS_ENABLED = "1"  # set to "0" when pipeline is live
```

**Repos / Workers / Packages Affected**
- `apps/projections` — add env var guard, then delete direct dispatch code in Phase 9
- `packages/notifications` — add HITL event types and templates
- `apps/notificator` — receives `ai.hitl.*` Queue messages
- `apps/api/wrangler.toml` / `apps/projections/wrangler.toml` — env var additions

**Roadmap / Backlog Changes Needed**
- N-009: Updated — document kill-switch approach; specify `HITL_LEGACY_NOTIFICATIONS_ENABLED` pattern
- N-100: Split into N-100a (add kill-switch to projections, Phase 6) and N-100b (delete legacy dispatch code, Phase 9, after production validation)

**Guardrails / Compliance Implications**  
During migration window, the audit log must show exactly one notification per HITL event. Add migration validation step: query `notification_audit_log` for HITL event IDs; assert `COUNT(*) = 1` per event.

**Testing Requirements**  
- Staging: trigger a HITL expiry with `HITL_LEGACY_NOTIFICATIONS_ENABLED=0`; confirm one notification arrives via pipeline, zero from projections
- Audit log assertion: `SELECT COUNT(*) FROM notification_audit_log WHERE notification_event_id = :hitl_event_id` must return 1

**Rollback / Fallback Plan**  
Set `HITL_LEGACY_NOTIFICATIONS_ENABLED=1` in projections. This immediately restores old behaviour. Set `NOTIFICATION_PIPELINE_ENABLED=0` on notificator to prevent pipeline from also dispatching.

**Decision Owner:** Backend Engineer (projections side), Platform Architect (pipeline side)  
**Decision Deadline:** N-009 (Phase 0 doc), N-100a execution (Phase 6)  
**Acceptance Criteria:**
- `HITL_LEGACY_NOTIFICATIONS_ENABLED` env var present in projections wrangler.toml
- Zero double-notifications observed in staging after setting flag to `0`
- N-100b ticket created for Phase 9 deletion of legacy code

---

### OQ-003 — WhatsApp Template Approval Workflow

**Question**  
What is the operational workflow for submitting and tracking Meta WhatsApp Business template pre-approval? Do platform operators submit on behalf of all tenants, or do tenants submit their own templates via their own Meta Business Manager accounts?

**Why This Matters**  
WhatsApp Business API requires all message templates to be pre-approved by Meta before they can be sent to users. A template without `meta_approved` status must not be dispatched (G17). Without a clear operational process, templates will be stuck in `pending_meta_approval` indefinitely, WhatsApp channel sends will dead-letter, and users will receive no notification at all for WhatsApp-preferred events.

**Current Context From Master Spec**  
G17 states: dispatching requires `whatsapp_approval_status = 'meta_approved'`. `notification_template` has `whatsapp_approval_status` field with states: `not_required`, `pending_meta_approval`, `meta_approved`, `meta_rejected`. The spec requires a WhatsApp template submission and approval tracking workflow (N-118).

**Options Considered**

*Option A — Platform-operated WhatsApp Business Account (WABA); platform operator submits all templates*  
WebWaka holds a single verified WABA (or one per partner). Super-admin operators submit platform-default templates to Meta. Tenants cannot customize WhatsApp templates; they use the platform-default approved templates for their locale. Tenant branding is limited to what Meta templates permit (e.g., tenant display name as a variable).

*Option B — Per-tenant WABA; each tenant registers their own WhatsApp Business Account*  
Each tenant obtains their own WABA, submits their own templates, and connects their phone number to the platform. Maximum branding flexibility. Requires tenants to navigate Meta's verification process independently.

*Option C — Partner-operated WABA model; partners hold accounts, sub-partners and tenants share*  
Platform holds default WABA. Partners can optionally register their own WABA. Sub-partners and tenants under a partner use the partner's WABA (or platform's if partner has none).

**Comparative Analysis**

| Criterion | Option A (platform WABA) | Option B (per-tenant WABA) | Option C (partner WABA) |
|---|---|---|---|
| Setup complexity | Low — one WABA to manage | Very high — every tenant does KYC with Meta | Medium |
| Time-to-first-send | Fast — platform templates pre-approved once | Weeks per tenant (Meta verification takes 7-21 days) | Medium |
| Tenant branding depth | Limited (display name variable only) | Full Meta template control | Medium |
| Operational overhead | Low for platform team | Extremely high | Medium |
| Nigeria-first suitability | High — most Nigerian SMBs cannot navigate Meta's business verification process | Low | Medium |
| Multi-tenant isolation | Template content only (not sender ID) | Full sender isolation | Partial |
| Tier-appropriate complexity | Good — Phase 1 simplicity, enterprise option later | Enterprise-only from day 1 | Good |

**Recommended Decision**  
**Option A as the standard tier default, with Option C as a future enterprise-tier upgrade path.**

For Phase 4 launch: WebWaka maintains one verified WABA per primary locale region (Nigeria, West Africa). The platform submits the 25 highest-priority notification templates to Meta on behalf of all tenants. These are the platform-default templates. Tenants send WhatsApp messages from the WebWaka sender number with their display name in the template body via Handlebars variable injection.

For enterprise-tier tenants (future): Partner WABA registration will be documented as an enterprise option. The platform architecture (Option C) already supports it via `channel_provider` per-tenant overrides — no schema change is needed. The operational process for Option C is documented in the runbook but not implemented until demand exists.

**Why This Is Best For WebWaka**  
The platform's core thesis is "build once, use infinitely." A per-tenant WABA model requires each tenant to pass Meta's business verification (a notoriously slow, inconsistent, and geography-dependent process). Nigerian SMBs — the primary user segment — frequently fail or abandon Meta's verification. A platform-operated WABA removes this barrier entirely. Tenants get working WhatsApp notifications on day one. Branding is through display-name variable injection, which is sufficient for transaction confirmations, OTPs, and critical alerts.

**Required Architecture / Data / API / UI Changes**

`notification_template` workflow (already supported by schema):
1. Super-admin creates platform WhatsApp template (`status='draft'`, `whatsapp_approval_status='pending_meta_approval'`)
2. Platform operator copies template body to Meta Business Manager → submits for review
3. On Meta approval: super-admin sets `whatsapp_approval_status='meta_approved'` via `PATCH /notifications/templates/:id`
4. On Meta rejection: sets `meta_rejected`; template family falls back to SMS (per G17)

New endpoint needed:
```
PATCH /notifications/templates/:id/whatsapp-status
Body: { status: 'meta_approved' | 'meta_rejected', meta_template_name: string, meta_template_id: string }
```

New `notification_template` columns:
```sql
meta_template_name  TEXT    -- Meta's internal template name (e.g. 'payment_confirmation_en')
meta_template_id    TEXT    -- Meta's template ID for direct API calls
meta_rejection_reason TEXT  -- populated when meta_rejected
```

Tracking table for audit:
```sql
-- notification_wa_approval_log (new table in migration 0271)
id                TEXT PRIMARY KEY
template_id       TEXT NOT NULL
submitted_at      INTEGER NOT NULL DEFAULT (unixepoch())
submitted_by      TEXT NOT NULL   -- super_admin user_id
status            TEXT NOT NULL   -- 'submitted'|'approved'|'rejected'
resolved_at       INTEGER
rejection_reason  TEXT
meta_template_id  TEXT
```

**Repos / Workers / Packages Affected**
- `apps/platform-admin` — WhatsApp template approval tracker UI (N-118)
- `apps/api` — new `/notifications/templates/:id/whatsapp-status` route
- `packages/notifications` — meta_approved gate in WhatsApp channel (N-044)
- `infra/migrations` — migration 0271 for `notification_wa_approval_log`

**Roadmap / Backlog Changes Needed**
- N-118 (Phase 8): Scoped to platform-operated WABA model; add `notification_wa_approval_log` migration; add platform-admin tracker UI
- New N-118a: Document per-partner WABA as enterprise upgrade path in runbooks

**Guardrails / Compliance Implications**  
G17 unchanged and fully binding. Add to G17: "Templates in `meta_rejected` state must alert super_admin via `system.provider.down` event with `provider='meta_whatsapp'` and `reason=meta_rejection_reason`."

**Testing Requirements**  
- Unit: WhatsApp channel dispatch checks `whatsapp_approval_status` before API call
- Integration: Template with `pending_meta_approval` status falls back to SMS; delivery `status='suppressed'` with `last_error='wa_template_not_approved'`
- E2E: Approval workflow UI in platform-admin correctly updates status; subsequent dispatch succeeds

**Rollback / Fallback Plan**  
G17 guarantees WhatsApp is never attempted without approval. Fallback to SMS is automatic. No delivery is lost — only channel changes.

**Decision Owner:** Platform Operations Lead (WABA registration); Backend Engineer (N-044/N-118 implementation)  
**Decision Deadline:** Before Phase 4 N-044 starts (WABA registration requires lead time — begin WABA application at Phase 0)  
**Acceptance Criteria:**
- WebWaka WABA verified and connected to 360dialog or Meta Cloud API
- At least 10 platform-default templates submitted and `meta_approved`
- WhatsApp channel fallback to SMS confirmed working in staging
- `notification_wa_approval_log` migration applied

---

### OQ-004 — Tenant Sender Domain Verification UX

**Question**  
When a tenant configures a custom sender email address (e.g., `notifications@theircompany.com`), what is the Resend DNS verification flow? Who initiates it? Where is verification status shown? What happens to email delivery during the pending-verification window?

**Why This Matters**  
An unverified domain cannot send email via Resend without being routed through Resend's shared sending infrastructure with reduced deliverability. If a tenant configures a custom sender but the domain is not verified, every email sent from that domain risks spam classification or delivery failure. Without a clear fallback, tenants who have configured custom senders might receive no email at all.

**Current Context From Master Spec**  
`channel_provider` has `sender_domain_verified INTEGER DEFAULT 0` and `sender_domain_verified_at`. Section 10 notes that tenants supply their own Resend domain. Section 9 adds `senderEmailAddress` to `TenantTheme`.

**Options Considered**

*Option A — Fall back to platform sender with tenant display name during verification window*  
While `sender_domain_verified = 0`, all emails sent for this tenant use `WebWaka <noreply@webwaka.com>` as the FROM address but render the tenant's display name in the subject prefix and email body. Example: FROM is `noreply@webwaka.com`, subject starts with `[Acme Corp]`. The tenant sees this in the status UI and is nudged to complete DNS verification.

*Option B — Hold all email sends until domain is verified*  
No emails dispatched while `sender_domain_verified = 0`. Emails queue in a `pending_domain_verification` state. Tenants cannot send email notifications until they complete DNS setup.

*Option C — Use Resend's shared sending pool for unverified domains*  
Route unverified tenant email through Resend's shared pool (Resend allows this for transactional emails). Domain appears as `on-behalf-of@resend.dev`. Lower deliverability, and some email clients display warnings.

**Comparative Analysis**

| Criterion | Option A (fallback to platform sender) | Option B (hold sends) | Option C (Resend shared pool) |
|---|---|---|---|
| Delivery continuity | Full | None during verification | Partial (reduced deliverability) |
| Tenant experience | Good — emails still arrive; nudge to verify | Poor — silent failure | Poor — shared pool looks untrustworthy |
| Security | Good — platform sender is verified | N/A | Resend's shared reputation at risk |
| Implementation complexity | Low | Medium (queue management) | Low |
| White-label quality | Partial — FROM address exposes WebWaka | N/A | Poor — Resend-branded |
| Nigeria SMB suitability | Best — DNS changes can take days with Nigerian DNS registrars | Worst — business-critical emails blocked | Acceptable but not ideal |

**Recommended Decision**  
**Option A — Fall back to platform sender with tenant display name; surface verification status prominently.**

Specifically:
- While `sender_domain_verified = 0`: FROM = `WebWaka Notifications <noreply@webwaka.com>`, Reply-To = `support@{tenant.customDomain}` (if configured), subject prefix = `[{tenant.displayName}]`
- `notification_delivery` records `sender_fallback_used = 1` for audit
- Brand-runtime settings page shows a yellow banner: "Custom sender domain verification pending. Emails are being sent from WebWaka until DNS setup is complete. [Verify now →]"
- Every 24 hours, the platform pings the Resend domain verification API and auto-updates `sender_domain_verified` when DNS records propagate
- On verification: next email uses the tenant's custom sender address automatically

**Required Architecture / Data / API / UI Changes**

`channel_provider` schema additions:
```sql
sender_domain_name     TEXT    -- e.g. 'theircompany.com'
sender_verification_dns_records  TEXT  -- JSON: {type, name, value}[] from Resend domain API
sender_fallback_in_use  INTEGER DEFAULT 0  -- 1 = actively using platform fallback
```

`notification_delivery` schema addition:
```sql
sender_fallback_used   INTEGER DEFAULT 0   -- 1 = platform sender was used due to unverified domain
```

New CRON in `apps/notificator` (or `apps/projections`) — every 6 hours:
```typescript
// poll Resend /domains/:id for verification status
// update channel_provider.sender_domain_verified and sender_domain_verified_at on confirmation
```

New route in `apps/api`:
```
POST /notifications/providers/email/verify-domain
  -- calls Resend domain creation API, stores DNS records in channel_provider
  -- returns DNS records for tenant to add to their registrar

GET /notifications/providers/email/verify-domain/status
  -- returns current verification status and pending DNS records
```

Brand-runtime settings UI: verification banner + DNS record display.

**Repos / Workers / Packages Affected**
- `apps/api` — new verification route and verification polling CRON
- `apps/brand-runtime` — settings page verification status banner
- `packages/notifications` — fallback sender selection logic in EmailChannel
- `infra/migrations` — schema columns added to `channel_providers` and `notification_deliveries`

**Roadmap / Backlog Changes Needed**
- N-053 (Phase 4): Scope updated to include fallback logic and verification polling CRON
- New N-053a: Add domain verification status UI to apps/brand-runtime (1d, Phase 4)
- New N-053b: Add CRON for Resend domain verification polling (0.5d, Phase 4)

**Guardrails / Compliance Implications**  
Add to G3: "While a tenant's sender domain is pending verification, the platform FROM address must be used as the fallback. The `sender_fallback_used` field on `notification_delivery` must be `1`. This must be visible in the delivery log."

**Testing Requirements**  
- Unit: Email channel selects platform sender when `sender_domain_verified = 0`
- Integration: Configure unverified custom domain; confirm email arrives with platform FROM and `[TenantName]` subject prefix
- E2E: Brand-runtime settings page shows pending verification UI with correct DNS records

**Rollback / Fallback Plan**  
If custom domain verification fails permanently, tenant can remove their custom sender in brand-runtime settings. This resets `sender_domain_verified = 0` and uses platform sender indefinitely.

**Decision Owner:** Backend Engineer (API + CRON), Full-Stack Engineer (brand-runtime UI)  
**Decision Deadline:** Phase 4 (N-053)  
**Acceptance Criteria:**
- Custom domain emails fall back to platform sender without delivery failure
- `sender_fallback_used = 1` recorded in delivery log
- Brand-runtime shows DNS records and verification status
- Auto-verification CRON updates status within 6 hours of DNS propagation

---

### OQ-005 — Partner/Sub-Partner Brand Hierarchy Resolution

**Question**  
For Sub-Partner workspace email delivery, brand context resolution walks Sub-Partner TenantTheme → Parent Partner TenantTheme → Platform Default. Is this the agreed traversal? Can a Sub-Partner declare that brand inheritance from the parent is not permitted?

**Why This Matters**  
The platform has a 4-level hierarchy: Platform → Partner → Sub-Partner → Tenant. Each level may define branding. If a Sub-Partner has not configured their own theme, the platform needs a deterministic rule for which parent's brand to use. Additionally, some partners may operate brands that compete with each other — in which case a Partner might not want their brand leaking into a Sub-Partner's notifications (or vice versa).

**Current Context From Master Spec**  
Section 8 Layer 5 defines: "Sub-Partner TenantTheme → Parent Partner TenantTheme → Platform Default." Section 9 states the same hierarchy for email template rendering. The `channel_provider` entity is nullable at partner level. The spec does not address whether this traversal can be blocked.

**Options Considered**

*Option A — Always walk the full hierarchy to Platform Default; no inheritance blocking*  
Simple, deterministic, and always produces a result. Every workspace gets a theme, even if it is just the platform default. No per-level override complexity.

*Option B — Walk hierarchy; allow Sub-Partner to declare `brand_inheritance_blocked = 1`*  
Sub-Partner entities can declare they do not inherit branding from their parent Partner. If blocked, the traversal jumps from Sub-Partner → Platform Default (skipping Parent Partner). This supports competitive or independent brand situations.

*Option C — Walk hierarchy; allow any level to declare `brand_inheritance_policy = 'stop_here'`*  
Any level can declare that downward-inheritance stops at them. A Partner can say "sub-partners must not inherit from me." Most flexible but most complex to implement and reason about.

**Comparative Analysis**

| Criterion | Option A (always walk) | Option B (Sub-Partner blocks) | Option C (any level blocks) |
|---|---|---|---|
| Implementation complexity | Low | Low-medium | High |
| Predictability | Maximum | High | Low |
| Use case coverage | 90% of cases | 98% of cases | 100% of cases |
| White-label-policy.md alignment | Simple | Aligned | Over-engineered for current scale |
| Debugging effort | Trivial | Low | Medium-high |
| Risk of misconfiguration | None | Low | Medium |

**Recommended Decision**  
**Option B — Walk to Platform Default as the standard behaviour; allow Sub-Partners to set `brand_independence_mode = 1` to skip Parent Partner and go directly to Platform Default.**

The traversal function:
```typescript
async function resolveBrandContext(workspaceId: string): Promise<TenantTheme> {
  const workspace = await getWorkspace(workspaceId);
  // Try workspace-level theme
  if (workspace.tenantTheme) return workspace.tenantTheme;
  
  if (workspace.subPartnerId) {
    const subPartner = await getSubPartner(workspace.subPartnerId);
    if (subPartner.brandIndependenceMode) {
      // Skip parent; go directly to platform default
      return getPlatformDefaultTheme();
    }
    if (subPartner.tenantTheme) return subPartner.tenantTheme;
    
    const parentPartner = await getPartner(subPartner.partnerId);
    if (parentPartner.tenantTheme) return parentPartner.tenantTheme;
  }
  
  return getPlatformDefaultTheme();
}
```

`brand_independence_mode` is a boolean field added to the Sub-Partner entity. Default `0`. Can only be set by super_admin, not by the sub-partner itself (prevents brand policy bypass).

**Why This Is Best For WebWaka**  
The "always walk" default serves 90% of cases (most sub-partners inherit from their parent partner). The `brand_independence_mode` flag handles the competitive brand scenario without introducing the complexity of bidirectional inheritance blocking (Option C). The flag is super_admin-controlled, preserving governance over brand policy.

**Required Architecture / Data / API / UI Changes**

Schema addition to sub-partners table:
```sql
brand_independence_mode  INTEGER NOT NULL DEFAULT 0
  -- 1 = skip parent partner brand; fall through to platform default
```

New super_admin-only route:
```
PATCH /partners/:id/sub-partners/:subId/brand-policy
Body: { brand_independence_mode: boolean }
```

`packages/white-label-theming`:
- `resolveBrandContext(workspaceId, db)` function updated to check `brand_independence_mode`
- KV cache key: `brand:context:{workspaceId}` (5-min TTL; invalidated when sub-partner brand policy changes)

**Repos / Workers / Packages Affected**
- `packages/white-label-theming` — `resolveBrandContext()` function
- `apps/api` — new brand policy route
- `apps/platform-admin` — super_admin sub-partner brand policy UI

**Roadmap / Backlog Changes Needed**
- N-031 (Phase 3): Implement `resolveBrandContext()` using this hierarchy + `brand_independence_mode`
- New N-033a: Add `brand_independence_mode` to sub-partners table (0.5d, Phase 3)

**Guardrails / Compliance Implications**  
Update G4: "Multi-level brand walk uses `resolveBrandContext(workspaceId)` from `@webwaka/white-label-theming`. If `brand_independence_mode = 1` on the Sub-Partner entity, the parent Partner theme is skipped."

**Testing Requirements**  
- Unit: `resolveBrandContext()` with all 5 scenarios: (workspace has theme), (sub-partner has theme), (sub-partner `brand_independence_mode=1`), (parent partner has theme), (platform default fallback)
- Integration: Email to tenant workspace of sub-partner with `brand_independence_mode=1` renders platform theme, not parent partner theme

**Rollback / Fallback Plan**  
`brand_independence_mode` defaults to `0`. Setting it back to `0` immediately restores full hierarchy traversal.

**Decision Owner:** Platform Architect  
**Decision Deadline:** Phase 3 start (before N-031)  
**Acceptance Criteria:**
- `brand_independence_mode` field in sub-partners migration
- `resolveBrandContext()` function has 100% test coverage for all 5 traversal paths
- Super_admin UI can toggle brand independence mode

---

### OQ-006 — Notification Data Retention and NDPR Erasure

**Question**  
Are the proposed retention TTLs (delivery logs 90 days, inbox 365 days, audit logs 7 years) legally approved? For audit log erasure under NDPR Art. 3.1(9): should `actor_id` and `recipient_id` be zeroed out or should the row be deleted entirely?

**Why This Matters**  
NDPR grants data subjects the right to erasure. If a user requests deletion and the platform cannot honour it because audit log rows are undeletable, the platform is in breach. Conversely, if audit log rows are deleted entirely, the platform loses its accountability trail — potentially exposing it to regulatory risk for different reasons (inability to demonstrate it notified users of compliance-relevant events). This is a genuine tension that must be resolved explicitly.

**Current Context From Master Spec**  
Section 7 retention table proposes specific TTLs. Section 12 N-115 and N-116 implement retention sweeps and erasure propagation. The spec defers the specific erasure approach for audit logs to legal approval.

**Options Considered**

*Option A — Zero out PII fields; preserve row structure*  
On erasure request: set `actor_id = 'ERASED'`, `recipient_id = 'ERASED'` in `notification_audit_log`. The event occurred, the channel was used, the time is known — but the identity is removed. The audit trail proves compliance events happened without revealing who.

*Option B — Hard delete rows from audit log on erasure request*  
When a user requests data erasure, delete all `notification_audit_log` rows where `recipient_id = :userId`. Maximum privacy, zero retention of user-linked data.

*Option C — Pseudonymise with replacement hash*  
Replace `recipient_id` with `SHA-256(ERASURE_SALT + original_id)`. This preserves referential structure (you can count how many notifications were sent to a now-erased identity) without revealing who it was.

**Comparative Analysis**

| Criterion | Option A (zero out) | Option B (hard delete) | Option C (pseudonymise) |
|---|---|---|---|
| NDPR Art.3.1(9) compliance | ✓ identity removed | ✓ maximum | ✓ |
| Accountability trail preservation | ✓ event record intact | ✗ event record lost | ✓ |
| Regulatory audit capability | ✓ can prove "we notified someone" | ✗ cannot prove notification occurred | ✓ |
| Implementation simplicity | High | Medium | Low |
| Re-identification risk | None (just the string 'ERASED') | None (row deleted) | Very low |
| Nigeria DPC guidance alignment | Yes | Yes | Yes |

**Recommended Decision**  
**Option A — Zero out `actor_id` and `recipient_id` in `notification_audit_log` on NDPR erasure request. Confirmed TTLs: delivery logs 90 days, inbox 365 days, audit logs 7 years.**

This is the standard approach used by GDPR-compliant financial institutions in Europe and adopted by fintech companies operating in regulated African markets. The audit log must prove that a compliance event occurred (e.g., "a password reset notification was sent on 2026-03-15 via email") without retaining the identity of who received it. Zeroing out fields achieves this.

**TTL Rationale:**
- **Delivery logs (90 days):** Sufficient for provider dispute resolution, bounce investigation, and short-term analytics. Aligns with typical email provider log retention windows.
- **Inbox items (365 days):** Users in Africa often access historical notifications after months. One year of inbox history is reasonable. Can be configured per-tenant (enterprise tenants may want longer).
- **Audit logs (7 years):** CBN record retention requirements for financial institutions typically mandate 5-7 years. Using 7 years provides headroom.
- **Suppression list:** Indefinite — suppression must outlast account deletion to prevent re-adding removed addresses.

**Implementation for CRON sweeps:**

```typescript
// apps/projections CRON (or apps/notificator CRON) — daily at 01:00 WAT
async function runRetentionSweep(db: D1Database) {
  const now = Math.floor(Date.now() / 1000);
  
  // delivery logs: delete rows older than 90 days
  await db.prepare(`DELETE FROM notification_deliveries WHERE created_at < ?`)
    .bind(now - 90 * 86400).run();
  
  // inbox items: delete rows older than 365 days
  await db.prepare(`DELETE FROM notification_inbox_items WHERE created_at < ?`)
    .bind(now - 365 * 86400).run();
  
  // audit log: rows are never deleted; only PII is zeroed on explicit erasure request
}
```

Erasure propagation in `NotificationService`:
```typescript
async function handleErasureRequest(userId: string, tenantId: string, db: D1Database) {
  // Zero out PII in audit log
  await db.prepare(`
    UPDATE notification_audit_log 
    SET actor_id = 'ERASED', recipient_id = 'ERASED' 
    WHERE (actor_id = ? OR recipient_id = ?) AND tenant_id = ?
  `).bind(userId, userId, tenantId).run();
  
  // Hard delete personal data from other tables
  await db.prepare(`DELETE FROM notification_inbox_items WHERE user_id = ? AND tenant_id = ?`)
    .bind(userId, tenantId).run();
  await db.prepare(`DELETE FROM notification_preferences WHERE scope_id = ? AND tenant_id = ?`)
    .bind(userId, tenantId).run();
  // ... and so on for push_tokens, notification_subscriptions
}
```

**Repos / Workers / Packages Affected**
- `packages/notifications` — erasure propagation logic
- `apps/projections` or `apps/notificator` — retention CRON sweep
- `infra/migrations` — no schema changes needed (zeroing is a data operation, not a schema change)
- `apps/api` — connect to existing NDPR erasure flow (DELETE /auth/me)

**Roadmap / Backlog Changes Needed**
- N-115 (Phase 8): Scope updated to include specific sweep queries and CRON location (apps/notificator preferred)
- N-116 (Phase 8): Scope updated with specific erasure logic (zero-out approach)

**Guardrails / Compliance Implications**  
Add new G23: "NDPR erasure requests must propagate to all notification tables within 24 hours of the erasure event. `notification_audit_log` rows must have `actor_id` and `recipient_id` zeroed to 'ERASED' — not deleted. All other notification tables must have the user's rows hard-deleted."

**Testing Requirements**  
- Unit: Erasure propagation zeroes `actor_id` and `recipient_id` in audit log; hard-deletes from inbox, preferences, subscriptions, push_tokens
- Integration: POST /auth/me (DELETE) triggers full erasure propagation; subsequent audit log query returns 0 rows with the original user_id
- Compliance: NDPR data subject access request after erasure returns empty notification history

**Rollback / Fallback Plan**  
Retention sweep is additive — it only deletes old data. Rolling back the sweep CRON does not restore already-swept rows but stops further deletions. Erasure is irreversible by design (NDPR intent).

**Decision Owner:** Platform Architect + Legal/Compliance team sign-off required  
**Decision Deadline:** Phase 8 (N-115/N-116) — but schema must be designed for zeroing from Phase 0  
**Acceptance Criteria:**
- NDPR erasure test: zero rows with original userId in notification tables after erasure
- Audit log: rows exist post-erasure with `recipient_id = 'ERASED'`
- Retention sweep runs daily and deletes rows older than TTL thresholds
- Legal team sign-off on TTL values documented in ADR

---

### OQ-007 — Digest Engine Timing Model

**Question**  
Is the digest CRON global (one sweep processes all pending digests for all tenants at window close) or per-tenant? CF Workers has a 100ms CPU time limit — a global sweep across thousands of tenants will fail.

**Why This Matters**  
The digest engine batches multiple notification events into single digest emails or notifications. If the timing model is wrong, digests either never send (CPU timeout), send to the wrong tenant (isolation breach), or pile up silently in dead-letter state.

**Current Context From Master Spec**  
Section 8 Layer 9 mentions CRON sweep. N-063 and N-064 implement the digest engine. The spec acknowledges the 100ms CPU limit is a constraint.

**Options Considered**

*Option A — Single global CRON; process all batches in one invocation*  
One CRON fires at (e.g.) 07:00 WAT for daily digests. Iterates all `notification_digest_batch` rows with `status='pending'` and `window_end < now`. For each: renders digest, dispatches, updates status. Fails above ~50 tenants due to 100ms CPU wall.

*Option B — Global CRON as batch cursor; Queue-continuation for each batch*  
CRON fires at window close time. Queries the first page of pending batches (up to 100). Enqueues each batch as a separate message on the notification Queue. CRON returns immediately (well within 100ms). `apps/notificator` Queue consumer processes each batch message independently (100ms per message, isolated per batch). Effectively unbounded tenant count.

*Option C — Per-tenant scheduled digest via Queue delay messages*  
When a digest batch is created (first event added to a batch), immediately enqueue a Queue message with a delay equal to the window duration. When the delayed message fires, process that batch. No CRON needed.

**Comparative Analysis**

| Criterion | Option A (global CRON) | Option B (CRON + Queue continuation) | Option C (delay message) |
|---|---|---|---|
| CF Workers CPU compliance | ✗ fails at scale | ✓ | ✓ |
| Precision of window timing | ± CRON interval | ± CRON interval | ± CF Queue delay accuracy (~1 min) |
| Operational simplicity | Simple | Medium | Medium |
| Multi-tenant isolation | Same invocation per tenant | Isolated Queue messages | Isolated Queue messages |
| Queue cost | None | Low | Moderate (one message per digest batch created) |
| Works at 10,000+ tenants | ✗ | ✓ | ✓ |
| Handles daily + weekly + hourly digests | Requires 3 CRONs | Requires 3 CRONs or one CRON with multiple window checks | Queue messages per window type |

**Recommended Decision**  
**Option B — Queue-continued global CRON sweep.**

Concretely:
1. CRON fires at configured intervals: `00:00 WAT` (daily digest close), `Mon 00:00 WAT` (weekly digest close), top of each hour (hourly digest close).
2. CRON queries `notification_digest_batch WHERE status='pending' AND window_end < unixepoch() LIMIT 100`.
3. For each row: enqueue a message `{ type: 'digest.process', batch_id: row.id, tenant_id: row.tenant_id }` to the notification Queue.
4. CRON returns in < 10ms.
5. `apps/notificator` Queue consumer receives each message independently, renders the digest for that batch, dispatches, updates `status='sent'`.

If there are more than 100 pending batches at sweep time (unlikely except after an outage), the CRON will process the next 100 on its next run. For daily digests this means a maximum 24-hour delay on overflow batches — acceptable for digest (not real-time).

**Required Architecture / Data / API / UI Changes**

`apps/notificator/wrangler.toml`:
```toml
[triggers]
crons = [
  "0 23 * * *",    # 00:00 WAT (UTC+1) daily digest sweep
  "0 23 * * 0",    # 00:00 WAT Monday weekly digest sweep
  "0 * * * *"      # top of each hour, hourly digest sweep
]
```

`apps/notificator/src/index.ts`:
```typescript
export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    await digestSweepCron(env, event.cron);
  },
  async queue(batch: MessageBatch<QueueMessage>, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      if (msg.body.type === 'digest.process') {
        await processDigestBatch(env, msg.body.batch_id, msg.body.tenant_id);
        msg.ack();
      } else {
        await processNotificationMessage(env, msg.body);
        msg.ack();
      }
    }
  }
}
```

**Repos / Workers / Packages Affected**
- `apps/notificator` — CRON handler + Queue consumer digest processing
- `packages/notifications` — `DigestEngine.renderAndSend(batchId, db, channels)` function
- `infra/cloudflare/` — CRON schedule registration

**Roadmap / Backlog Changes Needed**
- N-063 (Phase 5): Add CRON configuration to notificator wrangler.toml; implement digestSweepCron function
- N-064 (Phase 5): DigestEngine reads from `notification_digest_batch_item` join table; enqueues per-batch Queue messages

**Guardrails / Compliance Implications**  
Add to G12: "Digest engine must never process a batch belonging to tenant A while processing a message for tenant B. Each Queue message contains `tenant_id` and all DB queries within `processDigestBatch` must include `AND tenant_id = :tenantId`."

**Testing Requirements**  
- Unit: `digestSweepCron()` queries correct pending batches; enqueues correct Queue messages
- Unit: `processDigestBatch()` renders digest for correct tenant; does not access other tenants' data
- Load: 10,000 pending digest batches — CRON enqueues first 100; Queue consumer processes all 100 within 60 seconds

**Rollback / Fallback Plan**  
Disable CRON in wrangler.toml (remove trigger). Pending digest batches remain in `notification_digest_batch` with `status='pending'`. No data lost. Re-enable CRON to resume processing.

**Decision Owner:** Backend Engineer  
**Decision Deadline:** Phase 5 (before N-063 starts)  
**Acceptance Criteria:**
- CRON fires at correct WAT times in staging
- 500 pending batches processed by Queue consumer in < 2 minutes
- Each batch produces exactly one digest dispatch
- Tenant isolation verified: no cross-tenant batch data accessed

---

### OQ-008 — Partner Admin Notification Surface

**Question**  
Do partner admins need a dedicated notification inbox in `apps/partner-admin`, separate from the workspace-admin inbox? Should `partner.partner.registered` and `partner.partner.status_changed` events create inbox items in `apps/partner-admin` or in the workspace surface?

**Why This Matters**  
Partner admins use a different surface (`apps/partner-admin`) from workspace admins (`apps/workspace-app`). If partner-tier events create inbox items only in the workspace inbox, partner admins who use the partner-admin app primarily will miss these notifications. If a separate inbox schema is built, it duplicates infrastructure unnecessarily.

**Current Context From Master Spec**  
`notification_inbox_item` table has `tenant_id` and `user_id`. The schema does not distinguish between workspace-admin and partner-admin user contexts. Section 5 defines 6 partner ecosystem events.

**Options Considered**

*Option A — Shared inbox schema; surface partner events in apps/partner-admin via the same inbox API*  
`notification_inbox_item` stores inbox items with `category = 'partner'` for partner-tier events. `apps/partner-admin` connects to the same inbox API (`GET /notifications/inbox?category=partner`) and renders a notification bell using the same endpoint as workspace-app. No separate schema.

*Option B — Separate partner notification inbox table*  
Create `partner_notification_inbox` table. Partner events write here. `apps/partner-admin` reads from this separate table via a new API.

*Option C — Partner events deliver only via email; no in-app inbox in partner-admin*  
Partner-tier events send email to the partner admin's registered email address. No in-app inbox in `apps/partner-admin`.

**Comparative Analysis**

| Criterion | Option A (shared schema + category filter) | Option B (separate table) | Option C (email only) |
|---|---|---|---|
| Implementation complexity | Low — one schema, one API | High — duplicate infrastructure | Very low |
| Notification surface completeness | Full (in-app + email + SMS) | Full | Partial (email only) |
| Schema duplication | None | Significant | None |
| Inbox API reuse | ✓ same endpoint | ✗ new endpoint | N/A |
| Partner admin UX | Same quality as workspace-admin | Same | Degraded |
| Multi-tenant isolation | Same T3 rules apply | Same | Email isolation only |

**Recommended Decision**  
**Option A — Shared inbox schema with `category = 'partner'`; surface in `apps/partner-admin` via the shared inbox API.**

Partner admin users are still users with `user_id` and `tenant_id`. The inbox API already supports filtering by category. The `apps/partner-admin` frontend simply calls `GET /notifications/inbox?category=partner` to render partner-specific notifications, and `GET /notifications/inbox` for all notifications. No new tables, no new API routes, no new schema.

Partner admin inbox items use these categories:
- `partner.registered` → `category='partner'`
- `partner.status` → `category='partner'`
- `partner.entitlement` → `category='partner'`
- `partner.sub_partner` → `category='partner'`
- `partner.credit` → `category='partner'`

**Required Architecture / Data / API / UI Changes**

`apps/partner-admin` changes:
- Add notification bell component (reuse from workspace-app component library if shared)
- Call `GET /notifications/inbox?category=partner` for the notification drawer
- Call `PATCH /notifications/inbox/:id` for read/archive

No schema changes. No new API routes. The `category` column already exists on `notification_inbox_item`.

`notification_rule` seed data for partner events must set `audience_type = 'partner_admins'` and include `in_app` channel. The rule engine's audience resolver for `partner_admins` resolves to the `user_id`s of all users with `role = 'partner_admin'` within the partner workspace.

**Repos / Workers / Packages Affected**
- `apps/partner-admin` — add notification bell UI (1d, Phase 6)
- `packages/notifications` — `audience_type = 'partner_admins'` resolver already planned in N-022

**Roadmap / Backlog Changes Needed**
- N-091 (Phase 6): Add note that partner events must include `in_app` channel and `category='partner'`
- New N-091a: Add notification bell to apps/partner-admin (1d, Phase 6)

**Guardrails / Compliance Implications**  
G1 (tenant isolation) applies — partner admin inbox queries must include `AND tenant_id = :tenantId`. Partner admins should not see inbox items belonging to sub-partner tenants.

**Testing Requirements**  
- Unit: `audience_type = 'partner_admins'` resolves to correct user_id list
- Integration: `partner.partner.registered` event creates inbox item for all partner_admin users; workspace_admin users do not see it

**Rollback / Fallback Plan**  
Partner-tier events always deliver email as primary channel. If the in-app inbox has issues, email delivery continues independently.

**Decision Owner:** Full-Stack Engineer  
**Decision Deadline:** Phase 6 (N-091)  
**Acceptance Criteria:**
- Partner admin inbox shows partner-category notifications
- Workspace-admin inbox does not show partner-only notifications
- Notification bell visible in apps/partner-admin UI

---

### OQ-009 — USSD Notification Queuing Behavior

**Question**  
For business events triggered via the USSD gateway during an active session (e.g., a POS payment completing), how should notifications be handled: (a) queue for after session, (b) send SMS immediately, or (c) deliver in-app only?

**Why This Matters**  
USSD sessions in Nigeria operate in real-time on the SS7 network. The session is an active dialog — the user is waiting at a menu screen. Sending an SMS during a USSD session is technically possible (SMS and USSD use different channels at the network layer) but could confuse the user if the SMS arrives before the USSD menu confirms the action. Interrupting the USSD flow with unnecessary notifications causes session abandonment — a critical UX failure for Nigeria-first payments.

**Current Context From Master Spec**  
`apps/ussd-gateway` is a deployed Worker. Section 4 identifies USSD as a production-deployed channel. OQ-009 lists three options.

**Options Considered**

*Option A — Queue notification; deliver after USSD session ends*  
Notification waits in Queue until a USSD session-end signal or a timeout (e.g., 90 seconds after the triggering event). Guaranteed not to interrupt the USSD flow. Requires USSD session tracking.

*Option B — Send SMS immediately; the USSD session receives its standard confirmation screen*  
SMS and USSD operate on different channels at the network layer. A Nigerian user can receive an SMS while in a USSD session without the session being disrupted. The USSD menu confirms the transaction. The SMS provides a receipt. Both are expected behaviour for Nigerian mobile banking (USSD bank transfers already send confirmation SMS alongside USSD completion screens).

*Option C — In-app notification only; no SMS during USSD session*  
Write to `notification_inbox_item` only. The user sees the notification next time they open the PWA. No SMS, no USSD interruption.

**Comparative Analysis**

| Criterion | Option A (queue after session) | Option B (SMS immediately) | Option C (in-app only) |
|---|---|---|---|
| User experience | Good — clean USSD flow | Best — matches Nigerian mobile banking norms | Poor — user has no receipt until they open app |
| Implementation complexity | High — USSD session tracking required | Low — standard SMS dispatch | Low |
| Real-world precedent (Nigeria) | None | Standard practice (GTBank, Kuda, OPay all do this) | None |
| Delivery assurance | Delayed | Immediate | Deferred |
| Works with offline PWA | N/A | Yes | Only when online |
| Quiet hours compatibility | N/A | Critical sends bypass; receipts bypass | Follows quiet hours |

**Recommended Decision**  
**Option B — Send SMS immediately, parallel to USSD session confirmation.**

This matches the established pattern for all Nigerian mobile financial services (USSD-initiated bank transfers, airtime top-ups, POS payments — all confirm via USSD menu AND send a parallel SMS receipt). Nigerian users expect this behaviour. Option A requires USSD session state tracking infrastructure that does not exist. Option C leaves users with no receipt until they open a PWA they may not have on their current phone.

**Implementation rules for USSD-originated events:**

In the preference resolver (Layer 4), add USSD-origin context check:
```typescript
if (event.source === 'ussd_gateway') {
  // For USSD-originated events:
  // 1. Always allow SMS dispatch (bypass quiet hours for receipts)
  // 2. Queue in-app notification for when PWA is next opened (with standard quiet hours)
  // 3. Skip push notification (user is on USSD, PWA is not active)
  return {
    channels: ['sms', 'in_app'],
    bypassQuietHours: ['sms'],  // SMS always immediate for USSD receipts
    deferredChannels: ['in_app']  // in-app follows normal quiet hours
  };
}
```

`notification_event` payload should include `source: 'ussd_gateway'` when events originate from `apps/ussd-gateway`.

**Required Architecture / Data / API / UI Changes**

Add `source` field to `notification_event`:
```sql
source  TEXT DEFAULT 'api'  -- 'api'|'ussd_gateway'|'cron'|'queue_consumer'
```

Preference resolver updated to check `source = 'ussd_gateway'` and apply USSD delivery rules.

**Repos / Workers / Packages Affected**
- `apps/ussd-gateway` — add `source: 'ussd_gateway'` to publishEvent() calls
- `packages/notifications` — preference resolver USSD-origin handling
- `packages/events` — `source` field on DomainEvent type

**Roadmap / Backlog Changes Needed**
- N-060 (Phase 5): PreferenceService must handle USSD-origin context
- New N-060a: Add `source` field to `notification_event` and `DomainEvent` type (0.5d, Phase 1)

**Guardrails / Compliance Implications**  
Add new G21: "Notifications originating from `apps/ussd-gateway` (identified by `source='ussd_gateway'`) must bypass quiet hours for the SMS channel only. Push and in-app channels follow standard quiet hours. SMS receipts for USSD-triggered payment events are always immediate."

**Testing Requirements**  
- Unit: Preference resolver returns `{ channels: ['sms', 'in_app'], bypassQuietHours: ['sms'] }` for USSD-origin events
- Integration: POS payment via USSD gateway produces SMS delivery and in-app inbox item; no push notification

**Rollback / Fallback Plan**  
If SMS over-delivery becomes a problem (e.g., provider throttle), add `ussd_sms_enabled` env var to notificator (`default 1`). Set to `0` to fall back to in-app only. This is not a pipeline kill-switch — just a delivery policy gate.

**Decision Owner:** Backend Engineer  
**Decision Deadline:** Phase 5 (preference resolver, N-060)  
**Acceptance Criteria:**
- USSD-originated POS payment produces SMS receipt within 10 seconds of event
- In-app notification appears in inbox when user next opens workspace-app
- No push notification generated for USSD-origin events
- G21 documented and governance check updated

---

### OQ-010 — Real-Time Inbox Push Technology

**Question**  
Should real-time in-app notification delivery use (a) Cloudflare Durable Objects for WebSocket state, (b) Server-Sent Events (SSE), or (c) short-polling at a set interval?

**Why This Matters**  
CF Workers are stateless — they cannot maintain a long-lived connection to a specific user. Without the right architecture, the "real-time" notification bell rings only when the user manually refreshes. For a mobile-first PWA used in markets with intermittent connectivity, the choice between these technologies has real consequences for reliability, cost, and complexity.

**Current Context From Master Spec**  
Section 8 Layer 8 notes: "Real-time push: Durable Objects or SSE polling endpoint. CF Workers cannot hold long-lived connections without DO." Section 12 N-067 is "Build real-time notification push (SSE or Durable Objects; see OQ-010)."

**Options Considered**

*Option A — Cloudflare Durable Objects (DO) for WebSocket*  
Each user has a Durable Object instance. The workspace-app opens a WebSocket to the user's DO. When a notification is dispatched for that user, `apps/notificator` calls the DO's HTTP alarm or websocket. Maximum real-time precision (~100ms latency).

*Option B — Server-Sent Events (SSE) via long-held Worker response*  
The workspace-app opens an EventSource. The Worker holds the response open and flushes SSE events. CF Workers support streaming responses but with limitations: connections are terminated after the Worker's response timeout. Some CF plan tiers limit streaming duration.

*Option C — Short-poll every 30 seconds*  
`apps/workspace-app` calls `GET /notifications/inbox/unread-count` (or `/notifications/inbox?status=unread&limit=5`) every 30 seconds. Bell badge updates. Extremely simple, extremely reliable on intermittent connections. Maximum staleness: 30 seconds.

**Comparative Analysis**

| Criterion | Option A (Durable Objects) | Option B (SSE) | Option C (short-poll 30s) |
|---|---|---|---|
| Real-time latency | ~100ms | 1-5s | 0-30s |
| Implementation complexity | Very high | Medium | Low |
| CF Workers compatibility | ✓ (requires DO plan) | Partial (response timeout) | ✓ all plans |
| Nigeria connectivity suitability | Poor (WebSocket drops on 2G/3G) | Medium (SSE reconnects automatically) | Best (each poll is a short request) |
| Cost | DO charges per request + storage | Standard Worker charges | Standard Worker charges |
| Battery drain (mobile) | High (persistent connection) | Medium | Low (30s interval) |
| Offline resilience | WebSocket drops silently | SSE reconnects | Poll succeeds when online |
| Upgrade path | None (complex) | To DO | To SSE, then DO |

**Recommended Decision**  
**Option C — Short-poll at 30-second intervals as the v1 default. SSE is the documented upgrade path for Phase 2.**

**Why This Is Best For WebWaka**  
This is a Nigeria-first, mobile-first, PWA-first platform. The primary user device is a mid-range Android phone on MTN or Airtel 4G LTE with frequent handoffs between towers, dead zones on the Lagos-Ibadan Expressway, and indoor coverage gaps in Abuja markets. A WebSocket connection (Option A) drops silently on every handoff and requires reconnection logic that users will experience as "notifications not working." SSE (Option B) reconnects automatically but still requires a persistent TCP connection that burns battery and does not survive network changes well.

A 30-second short-poll is a known HTTP GET. It works on 2G, 3G, and 4G. It works through corporate firewalls. It works on hotel and café Wi-Fi with aggressive proxy timeouts. If the request fails, the PWA service worker simply tries again in 30 seconds. The user experience is: "the bell updates when you have connectivity." This is correct for this market.

30 seconds is also acceptable notification latency for digest-eligible events (social, marketplace) and appropriate for transactional events (where SMS/email/WhatsApp deliver much faster). Critical events (billing suspension, data breach) are pushed via SMS and email; the 30-second in-app delay is irrelevant.

**Implementation:**

```typescript
// apps/workspace-app/src/hooks/useNotificationPoll.ts
export function useNotificationPoll() {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await api.get('/notifications/inbox/unread-count');
        setUnreadCount(res.data.count);
      } catch {} // silent failure — poll again in 30s
    };
    
    poll(); // immediate on mount
    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  }, []);
  
  return unreadCount;
}
```

New lightweight API endpoint:
```
GET /notifications/inbox/unread-count
Response: { count: number, latest_id: string | null }
```

This endpoint is KV-cached per user (10s TTL) to prevent D1 read load from many simultaneous PWA sessions. Cache key: `{tenant_id}:inbox:unread:{user_id}`.

**Upgrade Path to SSE (Phase 2, future):**  
When DO plan is activated or SSE is validated on CF Workers, add `GET /notifications/inbox/stream` SSE endpoint. The workspace-app uses SSE if `EventSource` is supported and falls back to polling. Zero client-side architecture change is needed.

**Repos / Workers / Packages Affected**
- `apps/workspace-app` — `useNotificationPoll` hook, notification bell component
- `apps/api` — new `GET /notifications/inbox/unread-count` endpoint (KV-cached)
- `packages/notifications` — unread count query

**Roadmap / Backlog Changes Needed**
- N-067 (Phase 5): Scoped to short-poll implementation; SSE upgrade documented as future backlog item
- New N-067a: SSE upgrade path documented in notification architecture ADR

**Guardrails / Compliance Implications**  
No guardrail change needed. The KV cache key for unread counts must be prefixed `{tenant_id}:inbox:unread:` (T3, G1).

**Testing Requirements**  
- Unit: `GET /notifications/inbox/unread-count` returns correct count after new inbox item created
- Integration: workspace-app bell badge updates within 30 seconds of notification event
- Performance: unread-count endpoint responds in < 50ms with KV cache; < 200ms on D1 miss

**Rollback / Fallback Plan**  
Short-poll can be disabled by setting `NOTIFICATION_POLL_INTERVAL_MS=0` in workspace-app env. Bell badge simply shows static state. No delivery impact.

**Decision Owner:** Full-Stack Engineer  
**Decision Deadline:** Phase 5 (N-067)  
**Acceptance Criteria:**
- Bell badge updates within 30 seconds of any notification event
- Poll works correctly on simulated 2G throttle in Chrome DevTools
- KV cache confirmed working (no D1 read on every poll request)
- SSE upgrade path documented in ADR

---

### OQ-011 — Low-Data Mode and Notification Suppression

**Question**  
`apps/api/src/routes/low-data.ts` exists for users on metered/low-bandwidth connections. Should in-app notifications be suppressed, compressed, or deferred in low-data mode? Should push notifications be suspended when a user is in low-data mode?

**Why This Matters**  
Nigeria has high mobile data costs relative to income. Many users of the WebWaka platform will be on metered connections where every background data request has a real cost. A PWA that silently sends push notification payloads, polling requests, and asset downloads without the user's awareness violates the platform's Nigeria-first social contract and will cause churn.

**Current Context From Master Spec**  
`low-data.ts` route exists. Section 8 Layer 4 mentions "additional check for `low_data_mode` user preference" as an implication of this decision.

**Options Considered**

*Option A — In low-data mode: suspend push; use text-only in-app; SMS for critical; defer email*  
- Push notifications (FCM/APNs): completely suspended — not queued, not sent until mode exits
- In-app notifications: text only (no images, no icons beyond emoji, no external resource loading)
- SMS: sent normally for all `severity='critical'` notifications (SMS is data-free for recipient)
- Email: deferred to next time user opens email client (no delivery change — email is server-side)
- Polling interval: extended from 30s to 120s while in low-data mode

*Option B — Low-data mode suppresses all non-critical notifications entirely*  
Only `severity='critical'` notifications of any channel are dispatched. All others are dropped.

*Option C — Low-data mode affects only push; all other channels unaffected*  
Only push notifications (FCM payload delivery) are suppressed. SMS, email, in-app continue normally.

**Comparative Analysis**

| Criterion | Option A (tiered) | Option B (suppress non-critical) | Option C (push only) |
|---|---|---|---|
| User agency | High — user chose low-data mode | High — user is protected | Partial |
| Coverage of high-data channels | Complete | Complete | Incomplete (email + in-app still load assets) |
| SMS for critical events | ✓ | ✓ | ✓ |
| Battery + data impact | Minimal | Minimal | Reduced but not minimal |
| Implementation complexity | Medium | Low | Low |
| Nigeria-first suitability | Best | Good | Acceptable |

**Recommended Decision**  
**Option A — Tiered low-data mode: suspend push, text-only in-app, SMS for critical, extended poll interval.**

**Implementation:**

`notification_preference` table should support `low_data_mode INTEGER DEFAULT 0` at the `user` scope level. This preference is set via the workspace-app settings page.

The preference resolver (Layer 4) checks `low_data_mode`:
```typescript
if (userPreference.low_data_mode === 1) {
  return {
    channels: channels.filter(ch => ch !== 'push'),  // remove push
    inAppImageEnabled: false,                          // text-only in-app
    emailDeferred: false,                              // email is server-side, no client cost
    smsAllowed: event.severity === 'critical',         // SMS only for critical
    pollIntervalMs: 120_000                            // 2-min poll in workspace-app
  };
}
```

In-app items created in low-data mode: set `icon_type='text_only'` (new flag). Workspace-app renders text-only notifications when this flag is set — no icon fetch, no image load.

`low-data.ts` route integration: when `GET /low-data/status` returns `{ enabled: true }`, workspace-app automatically sets low-data preference for the session.

**Required Architecture / Data / API / UI Changes**

`notification_preference` addition:
```sql
low_data_mode  INTEGER NOT NULL DEFAULT 0
```

`notification_inbox_item` addition:
```sql
text_only_mode  INTEGER NOT NULL DEFAULT 0  -- 1 = render without images in low-data mode
```

Workspace-app preference settings: "Low-data mode" toggle that calls `PATCH /notifications/preferences` to set `low_data_mode=1`.

**Repos / Workers / Packages Affected**
- `packages/notifications` — preference resolver low_data_mode check
- `apps/workspace-app` — low-data mode toggle in settings; extended poll interval; text-only rendering
- `apps/api` — `low-data.ts` route integration with preference

**Roadmap / Backlog Changes Needed**
- N-060 (Phase 5): PreferenceService must check `low_data_mode` and apply channel restrictions
- N-069 (Phase 5): Notification bell + drawer must render text-only in low-data mode
- N-070 (Phase 5): Preference settings page must include low-data mode toggle

**Guardrails / Compliance Implications**  
Add new G22: "When `low_data_mode = 1` is set in user preferences: push notifications must not be dispatched; in-app notifications must be delivered as text-only (no images, no external resources); SMS is permitted only for `severity='critical'` events; polling interval must be extended to 120 seconds. This preference is user-controlled and must not be overridden by platform rules."

**Testing Requirements**  
- Unit: preference resolver returns push-excluded channel list when `low_data_mode = 1`
- Integration: user with low_data_mode=1 does not receive push notification; receives SMS for critical event
- E2E: low-data mode toggle in settings page correctly updates preference and changes notification behaviour

**Rollback / Fallback Plan**  
`low_data_mode = 0` restores normal behaviour immediately. User controls this directly.

**Decision Owner:** Backend Engineer (resolver), Full-Stack Engineer (workspace-app UI)  
**Decision Deadline:** Phase 3 start (before preference resolver design is locked)  
**Acceptance Criteria:**
- Low-data mode preference stored per user
- Push channel absent from delivery for low-data users
- Text-only in-app items render without image fetch
- SMS delivered for critical events regardless of low-data mode

---

### OQ-012 — Sandbox Mode Strictness

**Question**  
In staging and test environments, should notification deliveries be silently dropped, redirected to configured test addresses, or delivered normally? Who configures the test address?

**Why This Matters**  
A staging environment that delivers real emails, SMS, and WhatsApp messages to real end-users is a compliance and UX disaster. During Phase 6 vertical wiring (160+ vertical routes all emitting events), thousands of test notifications could reach real users. Conversely, a staging environment that silently drops all notifications makes it impossible to validate delivery, template rendering, and provider integration.

**Current Context From Master Spec**  
N-111 (Phase 7): "Implement sandbox/test mode for staging environment." OQ-012 is "Who configures the test address per environment?"

**Options Considered**

*Option A — Redirect all deliveries to env-configured test addresses; log original intended recipient*  
All notification deliveries in environments where `NOTIFICATION_SANDBOX_MODE=true` are redirected to a configured test sink. Email → `NOTIFICATION_SANDBOX_EMAIL`. SMS/WhatsApp → `NOTIFICATION_SANDBOX_PHONE`. Push → `NOTIFICATION_SANDBOX_PUSH_TOKEN`. The original intended recipient is preserved in `notification_delivery.recipient_id` for assertion.

*Option B — Silent drop all deliveries in non-production*  
No notifications dispatched. `notification_delivery.status = 'sandbox_suppressed'`. Delivery objects written to D1 for inspection but no provider API calls made.

*Option C — Deliver normally to test tenant user addresses only*  
In staging, all test users have sandbox-specific email addresses and phone numbers in their profile. Notifications are dispatched normally — they just happen to go to test inboxes.

**Comparative Analysis**

| Criterion | Option A (redirect to test addresses) | Option B (silent drop) | Option C (test user addresses) |
|---|---|---|---|
| Provider integration validation | ✓ full provider call with real response | ✗ no provider call | ✓ |
| Template rendering validation | ✓ view in test inbox | ✓ inspect D1 | ✓ |
| Accidental real-user delivery | ✗ impossible | ✗ impossible | ✗ if controlled correctly |
| Operational simplicity | High | Highest | Medium |
| SMS cost in staging | One test number billed | Zero | One test number billed |
| Debugging experience | Best — see actual email/SMS | Poor | Good |

**Recommended Decision**  
**Option A — Redirect all deliveries to env-configured test sink addresses. `NOTIFICATION_SANDBOX_MODE` controls the mode. Platform Architect configures the test addresses in Cloudflare Workers environment secrets.**

Sandbox enforcement in `apps/notificator/src/consumer.ts`:
```typescript
function resolveSandboxRecipient(channel: string, originalAddress: string, env: Env): string {
  if (env.NOTIFICATION_SANDBOX_MODE !== 'true') return originalAddress;
  
  switch (channel) {
    case 'email':    return env.NOTIFICATION_SANDBOX_EMAIL;
    case 'sms':      return env.NOTIFICATION_SANDBOX_PHONE;
    case 'whatsapp': return env.NOTIFICATION_SANDBOX_PHONE;
    case 'push':     return env.NOTIFICATION_SANDBOX_PUSH_TOKEN;
    default:         return originalAddress;
  }
}
```

Sandbox redirects are logged: `notification_delivery.sandbox_redirect = 1`, `sandbox_original_recipient_hash = SHA256(originalAddress)` (never raw address).

**Configuration (Cloudflare Workers secrets / env vars):**
```
NOTIFICATION_SANDBOX_MODE      = "true"   (staging only; never production)
NOTIFICATION_SANDBOX_EMAIL     = "sandbox-notify@webwaka.com"
NOTIFICATION_SANDBOX_PHONE     = "+2348000000001"  (test Termii number)
NOTIFICATION_SANDBOX_PUSH_TOKEN = "<test FCM registration token>"
```

Who configures: Platform Architect sets these in the CF dashboard for the staging environment. They are never set in production. The `NOTIFICATION_SANDBOX_MODE` environment variable is the single gate.

**Required Architecture / Data / API / UI Changes**

`notification_delivery` schema additions:
```sql
sandbox_redirect            INTEGER DEFAULT 0
sandbox_original_recipient_hash  TEXT  -- SHA-256 of original address; for test assertion only
```

New `NOTIFICATION_SANDBOX_MODE` env var in `apps/notificator/wrangler.toml`:
```toml
[env.staging.vars]
NOTIFICATION_SANDBOX_MODE = "true"

[env.production.vars]
NOTIFICATION_SANDBOX_MODE = "false"
```

**Repos / Workers / Packages Affected**
- `apps/notificator` — `resolveSandboxRecipient()` in consumer pipeline
- `apps/api/wrangler.toml` — not affected (api is producer only)
- `infra/cloudflare/` — sandbox secrets in staging Worker secrets

**Roadmap / Backlog Changes Needed**
- N-111 (Phase 7): Scoped to Option A redirect implementation; test addresses configured in staging secrets

**Guardrails / Compliance Implications**  
Add new G24: "`NOTIFICATION_SANDBOX_MODE=true` must be set in all non-production environments. `NOTIFICATION_SANDBOX_MODE=false` must be verified in production deployment health check. A CI/CD check must assert that `NOTIFICATION_SANDBOX_MODE` is not `'true'` in production wrangler.toml."

**Testing Requirements**  
- Unit: `resolveSandboxRecipient()` redirects all channels to sandbox addresses when `NOTIFICATION_SANDBOX_MODE='true'`
- Unit: `resolveSandboxRecipient()` returns original address when `NOTIFICATION_SANDBOX_MODE='false'`
- Integration: staging notification event produces delivery to sandbox email/phone only
- CI check: assert `NOTIFICATION_SANDBOX_MODE != 'true'` in production wrangler.toml

**Rollback / Fallback Plan**  
Sandbox mode can be disabled per-environment by setting `NOTIFICATION_SANDBOX_MODE=false`. This immediately restores real delivery. In production this is always `false` and should never be changed.

**Decision Owner:** Platform Architect (configuration), Backend Engineer (implementation)  
**Decision Deadline:** Phase 7 (N-111) — must be in place before Phase 6 vertical wiring to avoid real-user delivery during wiring tests  
**Acceptance Criteria:**
- Staging sends 1,000 test notifications; zero real user emails or SMSs received
- Sandbox delivery visible in `notification_delivery` with `sandbox_redirect=1`
- CI/CD governance check confirms production `NOTIFICATION_SANDBOX_MODE='false'`

---

### OQ-013 — Webhook Event Expansion Scope

**Question**  
The current webhook system exposes 4 event types. With 100+ notification events catalogued, should all events be available as webhook subscriptions, or a curated subset? What is the maximum number of subscriptions per tenant?

**Why This Matters**  
Exposing 100+ event types as webhook subscriptions overnight creates operational risk: untested event payload schemas, fanout load on the webhook dispatcher at scale, and tenant subscription management complexity. But too few webhook events leaves the platform webhook API uncompetitive for integration partners.

**Current Context From Master Spec**  
`webhook_subscriptions` and `webhook_deliveries` tables exist. 4 event types currently registered. N-097 wires 160+ vertical events. The webhook dispatcher retry is inline-blocking — a known issue the spec calls out (see Section 4.1.C). Section 13 defers the expansion scope question.

**Options Considered**

*Option A — Expose all 100+ events immediately*  
All events in the catalog are available for webhook subscription from Phase 6 onwards.

*Option B — Expose a curated 30-event starter set; expand to full catalog via enterprise plan*  
Select the 30 highest-value events for standard-tier tenants. Enterprise plan unlocks the full catalog. Max 25 subscriptions on standard; unlimited on enterprise.

*Option C — Expose events matching existing 4-event pattern (payment, workspace, template events only); expand incrementally*  
Minimum viable webhook expansion — low risk, very conservative.

**Comparative Analysis**

| Criterion | Option A (all 100+) | Option B (30-event starter + enterprise) | Option C (4-event minimum) |
|---|---|---|---|
| Partner ecosystem readiness | ✓ | ✓ | ✗ |
| Operational risk | High (untested payloads at scale) | Low | Very low |
| Competitive positioning | Best | Good | Poor |
| Entitlement tier alignment | ✗ no tier distinction | ✓ | ✗ |
| Webhook dispatcher migration (Queue-backed) | Must complete before expanding | Can expand incrementally | Fine |
| Tenant subscription management complexity | High | Manageable | Low |
| Revenue opportunity | None | Enterprise upsell | None |

**Recommended Decision**  
**Option B — 30-event curated starter set on standard plan (max 25 subscriptions per tenant); full catalog on enterprise plan (max 250 subscriptions); enterprise as a future unlock, not immediate.**

**Prerequisite:** The webhook dispatcher MUST be migrated to Cloudflare Queues (move retry out of the inline request handler — see Section 4.1.C) before expanding beyond 4 event types. An inline-blocking retry on 30+ event types will degrade API response times and risk cascading failures.

**30-event starter set (curated for maximum integration value):**

| Domain | Events |
|---|---|
| auth.identity | `auth.user.registered`, `auth.user.email_verified`, `auth.user.account_locked` |
| workspace.membership | `workspace.workspace.activated`, `workspace.workspace.suspended`, `workspace.member.added`, `workspace.invite.sent` |
| billing.subscription | `billing.payment.completed`, `billing.payment.failed`, `billing.subscription.plan_changed`, `billing.subscription.suspended`, `billing.subscription.entering_grace` |
| kyc.identity | `kyc.user.tier_upgraded`, `kyc.user.bvn_verified` |
| bank_transfer | `bank_transfer.order.confirmed`, `bank_transfer.order.rejected`, `bank_transfer.dispute.raised`, `bank_transfer.dispute.resolved` |
| partner.ecosystem | `partner.partner.status_changed`, `partner.entitlement.granted`, `partner.credit.allocated` |
| claim.profile | `claim.claim.approved`, `claim.claim.rejected` |
| templates.marketplace | `template.template.installed`, `template.template.purchased` |
| ai.superagent | `ai.credit.exhausted`, `ai.request.hitl_escalated` |
| governance.compliance | `governance.data_breach.suspected` |
| vertical.canonical | `vertical.order.created`, `vertical.payment.received` |
| system | `system.provider.down` |

**Subscription caps:**
- Standard plan: max 25 active subscriptions per workspace
- Business plan: max 100 active subscriptions
- Enterprise plan: unlimited subscriptions + full 100+ event catalog access

**Implementation changes to `webhook_subscriptions`:**
```sql
-- Add plan-gate column to webhook event registry
ALTER TABLE webhook_subscriptions ADD COLUMN plan_tier_required TEXT DEFAULT 'standard';
-- standard | business | enterprise
```

Before allowing a new webhook subscription, check `@webwaka/entitlements` to confirm tenant has the required plan tier for the event type.

**Required Architecture / Data / API / UI Changes**

New `webhook_event_types` registry table (migration 0272):
```sql
CREATE TABLE webhook_event_types (
  event_key        TEXT PRIMARY KEY,
  description      TEXT NOT NULL,
  payload_schema   TEXT NOT NULL,  -- JSON Schema of payload fields
  plan_tier        TEXT NOT NULL DEFAULT 'standard',  -- 'standard'|'business'|'enterprise'
  enabled          INTEGER NOT NULL DEFAULT 1,
  added_at         INTEGER NOT NULL DEFAULT (unixepoch())
);
```

Seed this with the 30-event starter set as `plan_tier='standard'` and the remaining 70+ as `plan_tier='enterprise'`.

Webhook subscription API:
```
GET /webhooks/events — list all available event types (filtered to tenant's plan tier)
POST /webhooks/subscriptions — create subscription; validate against plan tier and cap
DELETE /webhooks/subscriptions/:id — remove subscription
```

Webhook dispatcher migration to Queues: this is a prerequisite. Add backlog item N-131 (see Section 6 below).

**Repos / Workers / Packages Affected**
- `apps/api` — `lib/webhook-dispatcher.ts` (migrate to Queue-backed retry)
- `apps/api` — webhook subscription routes (tier validation, subscription cap enforcement)
- `packages/notifications` — event emission must include webhook as a channel for subscribed tenants
- `infra/migrations` — migration 0272 for `webhook_event_types`

**Roadmap / Backlog Changes Needed**
- New N-131: Migrate webhook dispatcher inline retry to CF Queues (3d, Phase 4 — prerequisite to webhook expansion)
- New N-132: Implement `webhook_event_types` registry table and seed 30-event starter set (1d, Phase 4)
- New N-133: Add tier-gated webhook subscription API (POST/DELETE with entitlement check) (1d, Phase 6)
- N-097 (Phase 6): Vertical event wiring must include webhook as an optional channel where applicable

**Guardrails / Compliance Implications**  
Add to existing webhook guardrails: "Webhook event type access is gated by tenant plan tier. Standard tenants have access to the 30-event starter set. Enterprise tenants have access to all 100+ events. Subscription caps are enforced at the API layer before writing to `webhook_subscriptions`."

**Testing Requirements**  
- Unit: Webhook subscription rejected when tenant exceeds subscription cap
- Unit: Webhook subscription rejected when event type requires higher plan tier
- Integration: Standard-tier tenant subscribes to all 25 allowed events; subscription to event type 26 fails with 403
- E2E: webhook subscription receives correct payload when subscribed event fires

**Rollback / Fallback Plan**  
Existing 4-event webhook system continues operating independently until N-131 is complete. Expanding to 30 events requires N-131 Queue migration first. Rolling back webhook expansion is trivial — set `enabled=0` on newly added event types in the registry.

**Decision Owner:** Platform Architect  
**Decision Deadline:** Phase 4 (N-131 webhook dispatcher migration); Phase 6 (N-132/N-133 expansion)  
**Acceptance Criteria:**
- Webhook dispatcher no longer uses inline-blocking retry (N-131 complete)
- 30-event starter set registered in `webhook_event_types`
- Standard-tier subscription cap enforced (25 subscriptions)
- Enterprise-tier webhook events documented in API reference

---

## 5. REQUIRED MASTER SPEC UPDATES

The following changes must be made to `docs/webwaka-notification-engine-final-master-specification.md`:

### Section 7 — Domain Model

| Entity | Change |
|---|---|
| `channel_provider` | Add `sender_domain_name`, `sender_verification_dns_records`, `sender_fallback_in_use` |
| `notification_delivery` | Add `source TEXT DEFAULT 'api'`, `sender_fallback_used INTEGER DEFAULT 0`, `sandbox_redirect INTEGER DEFAULT 0`, `sandbox_original_recipient_hash TEXT` |
| `notification_inbox_item` | Add `text_only_mode INTEGER DEFAULT 0` |
| `notification_preference` | Add `low_data_mode INTEGER DEFAULT 0` |
| `notification_event` | Add `source TEXT DEFAULT 'api'` (`'api'|'ussd_gateway'|'cron'|'queue_consumer'`) |
| New: `notification_wa_approval_log` | Table tracking WhatsApp template submission history |
| New: `webhook_event_types` | Registry of available webhook event types with plan tier |
| Sub-partner entity | Add `brand_independence_mode INTEGER NOT NULL DEFAULT 0` |

### Section 8 — Reference Architecture

| Layer | Change |
|---|---|
| Layer 4 (Preference Resolution) | Add USSD-origin check; add low-data mode channel restriction |
| Layer 5 (Brand/Locale) | Update brand traversal to include `brand_independence_mode` check |
| Layer 7 (Dispatch) | Add sandbox redirect logic (`NOTIFICATION_SANDBOX_MODE` check before dispatch) |

### Section 9 — Template System

| Area | Change |
|---|---|
| WhatsApp approval section | Add `notification_wa_approval_log` table reference; add operator submission workflow |
| New `meta_template_name` and `meta_template_id` | Add to `notification_template` schema |

### Section 10 — Repo Impact

| Repo | Change |
|---|---|
| `apps/notificator` (new) | Add full section covering OQ-001 resolution: CRON triggers, Queue consumer, env vars |
| `apps/partner-admin` | Add notification bell UI (N-091a) |
| `apps/api` | Add sender domain verification routes |
| `apps/ussd-gateway` | Add `source: 'ussd_gateway'` in publishEvent calls |
| Sub-partner routes | Add `brand_independence_mode` field |

### Section 11 — Roadmap

| Phase | Change |
|---|---|
| Phase 0 | N-008 expanded: scaffold `apps/notificator` Worker (not just "document decision") |
| Phase 1 | N-012: "apps/notificator" is explicit consumer |
| Phase 3 | Add OQ-003 WABA registration as external prerequisite milestone |
| Phase 4 | Add N-131 (webhook dispatcher Queue migration) as prerequisite to webhook expansion |
| Phase 7 | N-111 scoped to Option A redirect model |

---

## 6. REQUIRED ROADMAP / BACKLOG ADJUSTMENTS

### New Backlog Items

| ID | Task | Repo | Estimate | Priority | Phase | Depends On |
|---|---|---|---|---|---|---|
| N-012a | Create apps/notificator Worker skeleton (wrangler.toml staging + production, env.ts, index.ts) | apps/notificator | 2d | P0 | Phase 0 | OQ-001 resolved |
| N-033a | Add `brand_independence_mode` to sub-partners table and brand resolver | packages/white-label-theming + infra | 0.5d | P0 | Phase 3 | N-031 |
| N-053a | Add sender domain verification status UI to apps/brand-runtime | apps/brand-runtime | 1d | P1 | Phase 4 | N-053 |
| N-053b | Add CRON for Resend domain verification auto-polling | apps/notificator | 0.5d | P1 | Phase 4 | N-053 |
| N-060a | Add `source` field to `notification_event` and `DomainEvent` type | packages/events | 0.5d | P0 | Phase 1 | N-011 |
| N-067a | Document SSE upgrade path for real-time inbox in architecture ADR | docs | 0.5d | P2 | Phase 5 | N-067 |
| N-091a | Add notification bell UI to apps/partner-admin | apps/partner-admin | 1d | P1 | Phase 6 | N-091 |
| N-100a | Add `HITL_LEGACY_NOTIFICATIONS_ENABLED` kill-switch to apps/projections | apps/projections | 0.5d | P0 | Phase 6 | N-087 |
| N-100b | Delete legacy HITL dispatch code from apps/projections (after production validation) | apps/projections | 0.5d | P1 | Phase 9 | N-100a + 48h prod observation |
| N-131 | Migrate webhook dispatcher inline retry to CF Queues (prerequisite to webhook expansion) | apps/api | 3d | P0 | Phase 4 | N-012 |
| N-132 | Implement `webhook_event_types` registry table; seed 30-event starter set | infra + apps/api | 1d | P1 | Phase 4 | N-131 |
| N-133 | Tier-gated webhook subscription API with entitlement check and subscription cap | apps/api | 1d | P1 | Phase 6 | N-132 |

### Updated Backlog Items

| ID | Original Scope | Updated Scope |
|---|---|---|
| N-008 | "Document and commit consumer Worker ownership decision" | "Scaffold apps/notificator Worker skeleton: wrangler.toml, env.ts, index.ts" |
| N-009 | "Document HITL escalation migration decision" | "Document OQ-002 decision; specify HITL_LEGACY_NOTIFICATIONS_ENABLED pattern" |
| N-012 | "Implement CF Queues consumer in apps/projections or apps/notificator" | "Implement CF Queues consumer in apps/notificator (OQ-001 resolved)" |
| N-053 | "Add per-tenant channel_provider overrides" | "Add per-tenant overrides + domain verification fallback logic + DNS record storage" |
| N-063 | "Implement digest window management" | "Implement digest window management; CRON added to apps/notificator wrangler.toml" |
| N-064 | "Implement DigestEngine" | "Implement DigestEngine with Queue-continuation sweep pattern" |
| N-067 | "Build real-time push (SSE or DO)" | "Build short-poll 30s inbox count endpoint; SSE upgrade path documented" |
| N-100 | "Migrate apps/projections HITL escalation to pipeline" | Split into N-100a (kill-switch, Phase 6) and N-100b (code deletion, Phase 9)" |
| N-111 | "Implement sandbox/test mode" | "Implement NOTIFICATION_SANDBOX_MODE redirect model; configure sandbox test addresses" |
| N-118 | "Implement WhatsApp template approval workflow" | "Platform-operated WABA model; add notification_wa_approval_log; platform-admin tracker UI" |

### Updated Effort Estimates

Additions from this resolution pack add approximately **15 engineering days** to the original 165-day estimate, bringing the revised total to **~180 engineering days**.

---

## 7. NEW OR UPDATED GUARDRAILS

The following guardrails must be added to Section 12 of the master specification:

### G21 — USSD-Origin Notifications Use SMS Immediately *(OQ-009)*
Notifications where `notification_event.source = 'ussd_gateway'` must bypass quiet hours for the SMS channel. SMS receipts for USSD-triggered payment events are always dispatched immediately. Push notifications must not be dispatched for USSD-origin events. In-app channel follows standard quiet hours and is written to inbox normally.

### G22 — Low-Data Mode Channel Restrictions *(OQ-011)*
When `notification_preference.low_data_mode = 1` is set at user scope: push notifications must not be dispatched; in-app notifications must be delivered as text-only (`text_only_mode = 1`); email channel is unaffected (server-side, no client data cost); SMS is permitted only for `severity = 'critical'` events. This preference is user-controlled and must not be overridden by any platform rule.

### G23 — NDPR Erasure Propagation to Notification Tables *(OQ-006)*
NDPR erasure requests must propagate to all notification tables within 24 hours. `notification_audit_log`: set `actor_id = 'ERASED'` and `recipient_id = 'ERASED'` — never delete audit log rows. All other notification tables: hard-delete rows where `user_id` or `recipient_id` matches the erased user within the tenant scope. Suppression list entries must not be deleted (suppression must persist past account deletion).

### G24 — Sandbox Mode in Non-Production Environments *(OQ-012)*
`NOTIFICATION_SANDBOX_MODE = 'true'` must be set in all non-production Workers environments (staging, preview, development). Production Workers must always have `NOTIFICATION_SANDBOX_MODE = 'false'`. A CI/CD governance check must assert this before every production deployment. Any delivery dispatched when `NOTIFICATION_SANDBOX_MODE = 'true'` must be redirected to configured sandbox test addresses; the original intended recipient must never receive the notification.

### G25 — Webhook Event Types Gated by Subscription Plan *(OQ-013)*
Webhook subscriptions must be validated against the `webhook_event_types` registry before creation. Events marked `plan_tier = 'enterprise'` may only be subscribed by tenants with enterprise plan entitlement. Standard-tier tenants are limited to 25 active webhook subscriptions. Business-tier tenants are limited to 100. Enterprise tenants are unlimited. These limits are enforced at the API layer before writing to `webhook_subscriptions`.

### Updated G4 — Brand Context Always Applied *(OQ-005)*
Add: "Brand context resolution uses `resolveBrandContext(workspaceId)` from `@webwaka/white-label-theming`. If the workspace belongs to a Sub-Partner with `brand_independence_mode = 1`, the Parent Partner theme is skipped and resolution falls through directly to Platform Default. The `brand_independence_mode` flag may only be set by super_admin."

### Updated G17 — WhatsApp Template Approval *(OQ-003)*
Add: "WhatsApp templates submitted for Meta approval must have their submission recorded in `notification_wa_approval_log`. If Meta rejects a template, super_admin must be alerted via a `system.provider.down` event with `provider='meta_whatsapp'` and the rejection reason populated. A fallback to SMS channel must activate automatically for rejected templates."

---

## 8. IMPLEMENTATION READINESS GATE

All 13 open questions are now resolved. The following updated readiness gate replaces the original Section 15 blocking list:

### Before Phase 0 Can Begin — All Resolved

| Check | Resolution |
|---|---|
| OQ-001 resolved | ✅ `apps/notificator` new Worker |
| CF Queues provisioning plan | ✅ N-007 in Phase 0; staging + production |
| OQ-002 documented | ✅ `HITL_LEGACY_NOTIFICATIONS_ENABLED` kill-switch; N-100a Phase 6 |
| `apps/notificator` scaffolded | ✅ N-012a in Phase 0 |

### Before Phase 3 Begins — All Resolved

| Check | Resolution |
|---|---|
| OQ-003 (WhatsApp approval process) | ✅ Platform-operated WABA; begin WABA registration at Phase 0 as external prerequisite |
| OQ-004 (sender domain verification) | ✅ N-053 + N-053a + N-053b in Phase 4; platform sender fallback during verification |
| OQ-005 (brand hierarchy) | ✅ N-033a; `brand_independence_mode` flag; always walk to Platform Default |
| OQ-011 (low-data mode) | ✅ N-060 updated; preference resolver checks `low_data_mode` |

### Before Phase 5 Begins — All Resolved

| Check | Resolution |
|---|---|
| OQ-007 (digest timing model) | ✅ Queue-continued CRON sweep; N-063/N-064 updated |
| OQ-010 (real-time inbox push) | ✅ Short-poll 30s; N-067 updated |
| OQ-009 (USSD notification handling) | ✅ G21 added; N-060a in Phase 1 |

### Before Phase 6 Begins — All Resolved

| Check | Resolution |
|---|---|
| OQ-008 (partner admin inbox surface) | ✅ Shared schema + `category='partner'`; N-091a added |
| OQ-002 kill-switch deployed | ✅ N-100a: `HITL_LEGACY_NOTIFICATIONS_ENABLED=0` in staging before N-100 wiring |
| Sandbox mode enforced | ✅ N-111 scope confirmed; must be live before Phase 6 vertical wiring begins |

### Before Phase 8 Begins — All Resolved

| Check | Resolution |
|---|---|
| OQ-006 (retention TTLs + erasure) | ✅ TTLs confirmed; zero-out approach approved; N-115/N-116 scoped |

### Before Phase 9 Begins — All Resolved

| Check | Resolution |
|---|---|
| OQ-012 (sandbox mode) | ✅ N-111 in Phase 7; CI governance check added |
| OQ-013 (webhook expansion) | ✅ N-131 in Phase 4; N-132/N-133 in Phase 6; 30-event starter set defined |

---

*This resolution document resolves all 13 open questions from Section 13 of the WebWaka Notification Engine Final Master Specification. It is authoritative and ready for insertion as a replacement for Section 13. All backlog additions, guardrail additions, and schema changes identified in this document must be reflected in the master specification before implementation begins.*
