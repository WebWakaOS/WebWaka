# Artifact 02 — Architecture and Dependency Map
## WebWaka OS: Complete Structural Dependency Graph

**Status:** AUTHORITATIVE — Phase 0 Deep Discovery output  
**Date:** 2026-05-02  
**Method:** Direct file reads of all package.json, index.ts, router.ts, wrangler.toml files

---

## 1. Layered Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE EDGE                                      │
├────────────────┬────────────────┬──────────────────────┬────────────────────┤
│   PILLAR 1     │   PILLAR 2     │     PILLAR 3          │   CROSS-CUTTING    │
│  Operations    │   Branding     │ Listing/Marketplace   │   AI / SuperAgent  │
│                │                │                       │                    │
│  apps/api      │ apps/brand-    │  apps/public-         │ @webwaka/          │
│  apps/ussd-    │ runtime        │  discovery            │  superagent        │
│  gateway       │ (WakaPage      │  apps/tenant-public   │ @webwaka/          │
│  apps/work-    │  block builder)│  apps/discovery-spa   │  ai-abstraction    │
│  space-app     │                │                       │ @webwaka/          │
│                │                │                       │  ai-adapters       │
├────────────────┴────────────────┴──────────────────────┴────────────────────┤
│                    PLATFORM SERVICES LAYER                                  │
│  apps/notificator  |  apps/schedulers  |  apps/projections  |  apps/log-tail │
├──────────────────────────────────────────────────────────────────────────────┤
│                    ADMIN + PARTNER LAYER                                    │
│  apps/admin-dashboard | apps/platform-admin | apps/partner-admin           │
│  apps/partner-admin-spa | apps/marketing-site                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                    SHARED PACKAGE LAYER (53 functional packages)            │
│                                                                              │
│  CORE PLATFORM        │  DOMAIN MODULES        │  INFRASTRUCTURE            │
│  @webwaka/auth        │  @webwaka/groups        │  @webwaka/i18n             │
│  @webwaka/entities    │  @webwaka/fundraising   │  @webwaka/offline-sync     │
│  @webwaka/entitlements│  @webwaka/cases         │  @webwaka/notifications    │
│  @webwaka/control-    │  @webwaka/workflows     │  @webwaka/webhooks         │
│  plane                │  @webwaka/community     │  @webwaka/logging          │
│  @webwaka/types       │  @webwaka/social        │  @webwaka/analytics        │
│  @webwaka/policy-     │  @webwaka/claims        │  @webwaka/search-indexing  │
│  engine               │  @webwaka/negotiation   │  @webwaka/design-system    │
│  @webwaka/geography   │  @webwaka/offerings     │  @webwaka/white-label-     │
│  @webwaka/identity    │  @webwaka/profiles      │  theming                   │
│  @webwaka/payments    │  @webwaka/workspaces    │                            │
│  @webwaka/pos         │  @webwaka/contact       │                            │
│  @webwaka/hl-wallet   │  @webwaka/relationships │                            │
│  @webwaka/ledger      │                         │                            │
│  @webwaka/otp         │                         │                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                    VERTICAL PACKAGE LAYER (159 verticals)                   │
│  packages/verticals-politician | packages/verticals-church | ...            │
│  (Each inherits from @webwaka/vertical-engine + shared packages above)       │
├──────────────────────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                                │
│  D1 (SQLite) — 461 migrations  |  KV (5 namespaces)  |  R2 (2 buckets)     │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. apps/api — Dependency Map

```
apps/api
  ├── @webwaka/auth              (JWT validation, RBAC, PBKDF2)
  ├── @webwaka/types             (PlatformLayer enum, shared DTOs)
  ├── @webwaka/entities          (root entity CRUD)
  ├── @webwaka/entitlements      (plan gates, layer access)
  ├── @webwaka/control-plane     (dynamic configurability)
  ├── @webwaka/community         (community spaces, channels, courses)
  ├── @webwaka/groups            (universal groups - Phase 0 reset)
  ├── @webwaka/groups-electoral  (GOTV electoral extension)
  ├── @webwaka/fundraising       (campaigns, contributions, payout)
  ├── @webwaka/support-groups    (election support groups - pre-generalization)
  ├── @webwaka/cases             (case lifecycle)
  ├── @webwaka/workflows         (payout-approval, case-resolution)
  ├── @webwaka/ledger            (double-entry atomic ledger)
  ├── @webwaka/payments          (Paystack integration)
  ├── @webwaka/pos               (float ledger, agents, terminals)
  ├── @webwaka/hl-wallet         (HandyLife wallet, MLA, CBN tiers)
  ├── @webwaka/negotiation       (negotiable pricing FSM)
  ├── @webwaka/notifications     (event routing, templates, dispatch)
  ├── @webwaka/search-indexing   (FTS5 search index builder)
  ├── @webwaka/geography         (Nigeria hierarchy)
  ├── @webwaka/identity          (BVN/NIN/CAC/FRSC via Prembly)
  ├── @webwaka/otp               (multi-channel OTP)
  ├── @webwaka/claims            (8-state claim FSM)
  ├── @webwaka/superagent        (AI orchestration, BYOK, HITL)
  ├── @webwaka/ai-abstraction    (provider abstraction layer)
  ├── @webwaka/policy-engine     (8-domain rule evaluator)
  ├── @webwaka/vertical-engine   (166-vertical registry + generators)
  ├── @webwaka/social            (social graph)
  ├── @webwaka/webhooks          (HMAC-signed event dispatch)
  ├── @webwaka/analytics         (workspace + platform analytics)
  ├── @webwaka/wakapage-blocks   (WakaPage block types)
  ├── @webwaka/pilot             (pilot program management)
  ├── @webwaka/i18n              (locale detection + translations)
  ├── @webwaka/logging           (structured JSON logging)
  └── [159 verticals-*]         (per-vertical packages, each thin wrappers)
```

### apps/api Internal Structure

```
apps/api/src/
  index.ts                    — Hono app entry, middleware registration, Worker export
  router.ts                   — Route group registration (10 groups)
  env.ts                      — All CF Worker binding declarations (Env interface)
  middleware/
    auth.ts                   — JWT auth middleware
    audit-log.ts              — Request audit logging
    entitlement.ts            — Plan layer entitlement gate
    rate-limit.ts             — KV-backed rate limiter (fail-open on KV error)
    tenant.ts                 — Tenant resolution middleware
    locale.ts                 — i18n locale detection
    error-log.ts              — Structured error logging
    csrf.ts                   — CSRF / M2M secret validation
  route-groups/
    register-public-routes.ts
    register-auth-routes.ts
    register-workspace-routes.ts
    register-financial-routes.ts
    register-vertical-routes.ts
    register-vertical-engine-routes.ts
    register-social-routes.ts
    register-ai-routes.ts
    register-admin-routes.ts
    register-notification-routes.ts
    register-platform-feature-routes.ts
  routes/                     — 60+ individual route files
  lib/
    email-service.ts          — Legacy Resend email (pre-notification-engine)
    publish-event.ts          — Event publisher → NOTIFICATION_QUEUE
    webhook-dispatcher.ts     — HMAC-signed webhook delivery
    search-index.ts           — FTS5 search index management
    monitoring.ts             — Error rate monitoring + ALERT_WEBHOOK_URL
    traffic-shift.ts          — Blue-green traffic shifting
  chaos/
    chaos.test.ts             — Phase 1 chaos tests (KV failure, D1 timeout, R2 failure)
```

---

## 3. apps/brand-runtime — Dependency Map

```
apps/brand-runtime
  ├── @webwaka/auth              (tenant authentication)
  ├── @webwaka/entitlements      (branding rights gate)
  ├── @webwaka/white-label-theming (CSS token injection, depth caps)
  ├── @webwaka/types             (shared DTOs)
  └── D1 (direct)               (template_installations, template_registry)

Internal structure:
  src/
    index.ts                   — Hono Worker entry
    routes/
      branded-page.ts          — Main branded page renderer (calls resolveTemplate() on every render)
    lib/
      template-resolver.ts     — BUILT_IN_TEMPLATES Map + resolveTemplate() function
    templates/
      base.ts                  — Base HTML layout
      branded-home.ts, about.ts, services.ts, contact.ts, blog-list.ts, blog-post.ts
      niches/                  — 207 niche-specific template directories
        politician/, church/, restaurant/, ... (all 150+ niches)
    middleware/
      branding-entitlement.ts  — Pillar 2 entitlement gate
```

**Critical bridge:** `template-resolver.ts` `BUILT_IN_TEMPLATES` Map is the live connection between marketplace template installations and actual rendered HTML. Adding a new niche template = add a `WebsiteTemplateContract` to this Map.

---

## 4. Notification Engine — Dependency Flow

```
Event emitters (apps/api routes)
  └── publishEvent() in lib/publish-event.ts
      └── NOTIFICATION_QUEUE (CF Queue binding)
          └── apps/notificator (Queue consumer Worker)
              ├── @webwaka/notifications
              │   ├── EventRouter         — matches event → routing rules
              │   ├── RuleEvaluator       — evaluates condition/config
              │   ├── TemplateRenderer    — hydrates templates with context
              │   └── ChannelDispatcher   — dispatches to 7 channels:
              │       ├── EmailChannel    (Resend API)
              │       ├── SmsChannel      (Termii)
              │       ├── WhatsAppChannel (Meta/360dialog)
              │       ├── TelegramChannel (Bot API)
              │       ├── PushChannel     (FCM)
              │       ├── InAppChannel    (D1 inbox)
              │       └── SlackWebhookChannel (system alerts)
              └── apps/schedulers (digest CRON + quiet-hours sweep)

NOTIFICATION_KV (not yet provisioned — UI-002 blocker)
  └── Provider credentials storage (ADL-002)
```

---

## 5. SuperAgent / AI — Dependency Flow

```
API route handlers
  └── @webwaka/superagent
      ├── aiConsentGate middleware  — P10/P12 NDPR consent + AI rights check
      ├── KeyService                — BYOK key resolution (5-level hierarchy)
      │   └── D1 (key metadata) + KV (encrypted key blob, ADL-002)
      ├── CreditBurnEngine          — WakaCU credit accounting (pool→wallet→BYOK)
      │   └── D1 (ai_credit_wallets, ai_credit_transactions)
      ├── VERTICAL_AI_CONFIGS       — 159 per-vertical capability declarations
      ├── HitlService               — HITL queue (submit, review, expire)
      │   └── D1 (ai_hitl_queue)
      ├── SpendControls             — Per-user/team WakaCU budget gates
      ├── ComplianceFilter          — Sensitive sector content filter
      └── NdprRegister              — NDPR Article 30 processing register

      └── @webwaka/ai-abstraction   — Provider abstraction layer (ADL-001)
          └── @webwaka/ai-adapters  — OpenAI / Anthropic / Google adapters
```

---

## 6. Control Plane — 5-Layer Architecture

```
@webwaka/control-plane
  Layer 1: PlanCatalogService      — Dynamic subscription catalog (D1: subscription_packages)
  Layer 2: EntitlementEngine       — Runtime entitlement definitions (D1: entitlement_definitions)
           └── resolveForWorkspace() — DB values take precedence over PLAN_CONFIGS (T006 bridge)
  Layer 3: PermissionResolver      — Custom roles + user overrides (D1: custom_roles)
  Layer 4: DelegationGuard         — Hierarchical admin delegation (D1: delegation_policies)
  Layer 5: FlagService             — Platform-wide feature flags (D1: configuration_flags)
  Cross:   AuditService            — Append-only governance audit log (D1: control_plane_audit)
```

---

## 7. Vertical Engine — Architecture

```
@webwaka/vertical-engine
  src/
    registry.ts         — 166 vertical registrations (slug, config, FSM, entitlements, AI config)
    engine.ts           — VerticalEngine class (activate, deactivate, getState, transition)
    crud.ts             — Generic CRUD generator per vertical (list, get, create, update)
    fsm.ts              — Vertical FSM: seeded→claimed→verified→active→suspended→archived
    generators.ts       — Route generator: produces Hono router for any vertical slug
    index.ts            — Public API

Dual-path routing (apps/api):
  registerVerticalRoutes()        — Legacy hand-coded vertical routes
  registerVerticalEngineRoutes()  — Engine-generated routes (X-Use-Engine: 1 header)
```

---

## 8. Policy Engine — Evaluator Architecture

```
@webwaka/policy-engine (v0.3.0)
  evaluate(key, context) → PolicyDecision
    └── loadRule(key)              — KV cache (5min) → D1 fallback
        └── dispatchEvaluator()   — Routes to domain evaluator:
            ├── evaluateFinancialCap()    — INEC ₦50m cap, CBN daily limits
            ├── evaluateKycRequirement()  — KYC tier gates (T0–T3)
            ├── evaluateAiGovernance()    — P7/P12 AI gates, prohibited capabilities
            ├── evaluateModeration()      — Content moderation + HITL routing
            ├── evaluateDataRetention()   — NDPR retention + DSAR
            ├── evaluatePayoutGate()      — Payout approval thresholds
            ├── evaluateAccessControl()   — GOTV/broadcast access control (Phase 5)
            └── evaluateComplianceRegime() — Regulatory regime (Phase 5)
        └── writeAuditLog()        — Non-blocking (NDPR P10, PII redacted)
```

---

## 9. Partner Hierarchy — Implementation State

```
Level 0: Platform (WebWaka) — super_admin
  Level 1: Partner ← POST /partners (super_admin-gated)
    ├── Status FSM: pending → active → suspended → deactivated (terminal)
    ├── Entitlements: white_label_depth, delegation_rights, max_sub_partners
    └── Level 2: Sub-Partner ← POST /partners/:id/sub-partners
            (requires delegation_rights = '1' + count < max_sub_partners)
            └── Level 3: Downstream Entity Manager (future — Phase 3/4)

Tables: partners, sub_partners, partner_entitlements, partner_audit_log
Phase 1+2: ✅ DONE
Phase 3 (billing + revenue share): NOT STARTED
Phase 4 (analytics dashboard): NOT STARTED
```

---

## 10. Claim-First Growth — Data Flow

```
Seeding (offline batch process)
  └── infra/db/seeds/ + infra/db/migrations/0301-0365+
      └── D1: individuals/organizations/places (claim_state = 'seeded')
              └── D1: profiles (public discovery records)
                      └── search_entries (FTS5 + geography)

Discovery (Pillar 3)
  └── apps/public-discovery → GET /discover?q=&lga=&vertical=
      └── search_entries FTS5 query
          └── Profile page render (unclaimed state shown)
              └── "Claim this profile" CTA

Claim Flow (apps/api)
  └── POST /claim                          — create claim_request (PENDING)
      └── POST /claim/:id/submit           — submit supporting docs
          └── POST /claim/:id/approve      — super_admin approves
              └── claim_state = 'approved' → workspace created
                  └── Tenant takes over profile management

Claim FSM (packages/claims/src/state-machine.ts):
  seeded → unclaimed → pending → under_review → approved → rejected → expired → withdrawn
  36 tests, all passing
```

---

## 11. Offline-First / PWA Architecture

```
@webwaka/offline-sync
  db.ts (Dexie v4)                — IndexedDB schema (8 cache tables):
    ├── groupMembersCache          (max 200 rows, 10 MB)
    ├── broadcastDraftsCache       (2 MB)
    ├── caseCache                  (5 MB)
    ├── eventCache                 (3 MB)
    ├── geographyCache             (5 MB)
    ├── policyCache                (1 MB)
    ├── imageVariantsCache         (5 MB)
    └── notificationInbox          (N-068)
  CacheBudgetManager              — LRU eviction, pressure detection
  SyncEngine                      — Background Sync API integration
  DraftAutosaveManager            — 5s autosave, restore on reconnect
  pii-clear.ts                    — Clears all 8 cache tables on logout (< 500ms)
  service-worker.ts               — 4 per-module Background Sync tags

Offline guarantees (M13 gate criteria all PASS):
  AC-OFF-01: Broadcast drafts survive offline → sync within 30s
  AC-OFF-02: Group member list + cases available offline
  AC-OFF-03: Group member list accessible < 2s from IndexedDB
  AC-OFF-04: GOTV scope offline (via groups-electoral)
  AC-OFF-05: Financial operations BLOCKED when offline
  AC-OFF-06: PII cleared from IndexedDB on logout < 500ms

Sync protocol:
  GET /sync/delta?module=&cursor=&last_synced_at=
  Response: { changes, deletes, server_time, has_more, next_cursor }
  POST /sync/apply — conflict resolution (server-wins by default, V2)
```

---

## 12. USSD Gateway Architecture

```
apps/ussd-gateway
  ├── Africa's Talking USSD handler
  ├── WhatsApp webhook handler (Meta Cloud API v18 or 360dialog)
  ├── Telegram webhook handler (Bot API + webhook secret validation)
  └── OTP delivery routing (@webwaka/otp)
      ├── SMS → Termii
      ├── WhatsApp → Meta/360dialog (WHATSAPP_PROVIDER flag)
      └── Telegram → Bot API

USSD menus: airtime, wallet balance, agent float, POS transactions
All USSD operations execute against apps/api via INTER_SERVICE_SECRET M2M auth
```

---

## 13. White-Label / Multi-Tenancy Architecture

```
Tenant Isolation (T3):
  Every D1 query: WHERE tenant_id = ?
  Every KV key: tenant:{tenant_id}:*
  Every R2 path: {tenant_id}/*

White-label depth (brands/whitelabel):
  @webwaka/white-label-theming
    applyDepthCap(depth):
      depth=1: Platform attribution required
      depth=2: Sub-brand with attribution
      depth=3: Full white-label (no WebWaka attribution)
  Enforced in apps/brand-runtime/src/routes/branded-page.ts

Subdomain routing:
  apps/brand-runtime: {tenant-slug}.webwaka.com or custom domain
  apps/public-discovery: discover.webwaka.com or partner discovery domain
  apps/tenant-public: per-tenant public page at discovery domain
```

---

## 14. Security Architecture

```
Authentication:
  PBKDF2 (SHA-256, 600k iterations — OWASP 2024 compliant)
  JWT (HS256, JWT_SECRET) — access tokens
  Opaque refresh tokens (SHA-256 hash stored in D1, single-use rotation)
  tenant_id resolved from user record (not request header)

Authorization:
  requireRole() middleware — super_admin, admin, manager, agent, cashier, member, public
  requireEntitlement() middleware — PlatformLayer enum gates
  T3 tenant isolation enforced at DB query level

Rate limiting:
  RATE_LIMIT_KV-backed sliding window
  Fail-open on KV error (chaos test confirmed)
  Login-specific rate limiter (SEC-03 fixed)

CSRF/M2M:
  X-CSRF-Intent: m2m OR X-Inter-Service-Secret: <INTER_SERVICE_SECRET>

Headers:
  X-Content-Type-Options, X-Frame-Options enforced
  ALLOWED_ORIGINS CORS restriction

Secrets:
  All in CF Worker Secrets (never in code)
  Rotation policy: 90 days or on exposure
  CLOUDFLARE_API_TOKEN: URGENT ROTATION NEEDED (public commit exposure)

PII protection:
  BVN/NIN: SHA-256(SALT + value) — never stored raw (T3/P13)
  DM content: AES-GCM encrypted at rest (DM_MASTER_KEY)
  voter_ref: opaque hashed in GOTV records (P13)
  NDPR consent gates: before every PII processing step
  DSAR: R2-isolated export bucket, pre-signed URL delivery

Compliance:
  NDPR: consent records, erasure-service, processing register (Article 30)
  CBN: KYC T0–T3, daily transaction limits, balance caps
  INEC: ₦50m campaign contribution cap (policy engine)
  NITDA: self-assessment documented
```
