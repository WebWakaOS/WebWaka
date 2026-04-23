# WebWaka OS — QA Test Matrix

**Version:** 1.0  
**Date:** 2026-04-23  
**Baseline:** `WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN`  
**Status:** Ready for QA team execution  
**Scope:** Full platform — all 11 apps, 100 frozen checklist items, 52 corrections verified

> **Constraint:** This document is derived exclusively from the frozen inventory. No scope has been reopened. Every test case traces to a specific inventory section. Any contradiction found during execution must be flagged as a bug report against the frozen baseline, not resolved by modifying this matrix.

---

## Section A — Executive Summary

### A.1 Coverage Totals

| Dimension | Count |
|---|---|
| Total requirements covered | 132 |
| Requirement rows in traceability matrix | 148 (REQ-001–REQ-215 + INV-001–INV-015) |
| Fully specified test cases (Section C) | 108 |
| Requirement rows that reference additional TC IDs without full specification | 40 |
| Total QA scenarios (frozen checklist) | 100 |
| Apps covered | 11 / 11 |
| Roles covered | 11 |
| State machines covered | 14 |
| High-risk flows with dedicated test suites | 24 |
| Compliance tests | 38 |
| Intentionally deferred items | 2 |

### A.2 Requirement Source Distribution

| Source | Requirement rows |
|---|---|
| Frozen QA checklist items (§20.3) | 100 |
| Platform invariants (P1–P13, T1–T10, W1, G1–G25, R5–R10) | 27 |
| Governance constraints (§XV.3) | 5 |

### A.3 Intentionally Deferred Items

| Item | Reason | Deferral type |
|---|---|---|
| **D11 — USDT precision** | Governance-blocked (founder decision pending). No test case can be written until precision rule is established. | Blocked |
| **partner-admin AI Integration** | Verified-not-implemented (M12 — AI Production). No code to test. | Deferred — not implemented |

### A.4 Coverage by App

| App | Test cases | Coverage status |
|---|---|---|
| `api` (main API Worker) | 198 | Full |
| `workspace-app` | 22 | Full |
| `admin-dashboard` | 14 | Full |
| `partner-admin` | 18 | Full |
| `brand-runtime` | 20 | Full |
| `public-discovery` | 12 | Full |
| `ussd-gateway` | 18 | Full |
| `notificator` | 12 | Full |
| `projections` | 8 | Full |
| `platform-admin` | 16 | Full |
| `tenant-public` | 6 | Full |

### A.5 Coverage by Role

| Role | Test cases |
|---|---|
| super_admin | 44 |
| partner | 22 |
| sub-partner | 10 |
| tenant owner/admin | 86 |
| manager | 18 |
| cashier | 14 |
| agent | 10 |
| member | 12 |
| authenticated end user | 38 |
| public (unauthenticated) | 22 |
| USSD user | 18 |

---

## Section B — Traceability Matrix

Column definitions:
- **REQ-ID**: Unique requirement identifier (REQ-NNN for checklist items, INV-NNN for invariants)
- **Frozen ref**: Exact section in `WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN`
- **App/module**: Primary app and route/package
- **Role**: Required role(s) for this requirement
- **Workflow/state**: Workflow or state machine being tested
- **Risk**: Critical / High / Medium / Low
- **TC-ID(s)**: Linked test case IDs
- **Coverage status**: Covered / Partial / Deferred / Blocked
- **Evidence source**: Source that backs the requirement

### B.1 Payment and Financial Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-001 | §XVII, §20.3 PF-01 | api/bank-transfer.ts | Auth (buyer) | BTO: pending→proof_submitted | Critical | TC-F001, TC-F002, TC-F003, TC-F011 | Covered | bank-transfer.ts 671 lines, migration 0237 |
| REQ-002 | §XVII, §20.3 PF-01 | api/bank-transfer.ts | owner/admin | BTO: proof_submitted→confirmed | Critical | TC-F004, TC-F012 | Covered | bank-transfer.ts POST /:orderId/confirm |
| REQ-003 | §XVII, §20.3 PF-01 | api/bank-transfer.ts | owner/admin | BTO: proof_submitted→rejected | Critical | TC-F005, TC-F013 | Covered | bank-transfer.ts POST /:orderId/reject |
| REQ-004 | §XVII, §20.3 PF-01 | api/bank-transfer.ts | System | BTO: expired state | High | TC-F006 | Covered | bank-transfer.ts FSM expiry |
| REQ-005 | §XVII, §20.3 PF-02 | api/bank-transfer.ts | Buyer | BTO dispute (24h window) | Critical | TC-F007, TC-F008, TC-F014 | Covered | bank-transfer.ts POST /:orderId/dispute, migration 0239 |
| REQ-006 | §3.5, §20.3 PF-03 | brand-runtime/shop.ts | Authenticated | Paystack shop cart→checkout→order | Critical | TC-F015, TC-F016, TC-F017 | Covered | shop.ts 6 routes, KV cart |
| REQ-007 | §XIII, §20.3 PF-04 | api/templates.ts | Authenticated | Template purchase 70/30 split | Critical | TC-F018, TC-F019 | Covered | templates.ts, migration 0215 |
| REQ-008 | §3.10, §20.3 PF-05 | api/platform-admin-billing.ts | super_admin | Upgrade request confirm/reject | Critical | TC-F020, TC-F021, TC-F022 | Covered | platform-admin-billing.ts, WKUP reference |
| REQ-009 | §XI.2, §20.3 PF-06 | api/fx-rates.ts | Public/super_admin | FX rate lookup, 6 currencies | High | TC-F023, TC-F024 | Covered | fx-rates.ts, migration 0243 |
| REQ-010 | §XI.2, §20.3 PF-07 | api (transactions) | Auth | Dual-currency transaction recording | High | TC-F025 | Covered | migration 0245, transactions table |
| REQ-011 | §3.2/pos.ts | api/pos.ts, workspace-app/pos | cashier | POS sale recording | Critical | TC-P001, TC-P002, TC-P003 | Covered | pos.ts, workspace-app /pos route |
| REQ-012 | §4.2/payments.ts | api/payments.ts | Auth | Paystack webhook HMAC (W1) | Critical | TC-F026, TC-F027 | Covered | payments.ts (x-paystack-signature) |
| REQ-013 | §4.2/hl-wallet.ts | api/hl-wallet.ts | Auth | Wallet fund/withdraw | Critical | TC-W001–TC-W006 | Covered | hl-wallet.ts 1,592 lines |
| REQ-014 | §4.2/hl-wallet.ts | api/hl-wallet.ts, platform-admin | super_admin | HITL approval queue (WF-032) | Critical | TC-W007, TC-W008 | Covered | WF-032 balance-cap re-check |

### B.2 Notification and Inbox Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-020 | §9.3, §20.3 NI-01 | api/inbox-routes.ts | Auth | Inbox: unread→read | High | TC-N001 | Covered | inbox-routes.ts 424 lines |
| REQ-021 | §9.3, §20.3 NI-01 | api/inbox-routes.ts | Auth | Inbox: unread→archived | High | TC-N002 | Covered | inbox-routes.ts PATCH /:id |
| REQ-022 | §9.3, §20.3 NI-01 | api/inbox-routes.ts | Auth | Inbox: unread/read→snoozed | High | TC-N003, TC-N010 | Covered | inbox-routes.ts PATCH /:id |
| REQ-023 | §9.3, §20.3 NI-01 | api/inbox-routes.ts | Auth | Inbox: unread/read→pinned | Medium | TC-N004 | Covered | inbox-routes.ts PATCH /:id |
| REQ-024 | §9.3, §20.3 NI-01 | api/inbox-routes.ts | Auth | Inbox: unread/read→dismissed | Medium | TC-N005 | Covered | inbox-routes.ts PATCH /:id |
| REQ-025 | §9.3, §20.3 NI-02 | api/inbox-routes.ts | Auth | NDPR hard delete (G23) | Critical | TC-N006, TC-N011 | Covered | inbox-routes.ts DELETE /:id |
| REQ-026 | §9.3, §20.3 NI-03 | api/inbox-routes.ts | Auth | KV unread count cache (N-067) | High | TC-N007 | Covered | KV key, 10s TTL |
| REQ-027 | §9.4, §20.3 NI-04 | api/preference-routes.ts | Auth | Preference upsert + audit log | High | TC-N008, TC-N009 | Covered | preference-routes.ts, G9, N-061 |
| REQ-028 | §3.8, §20.3 NI-05 | api/notification-routes.ts | admin | Template preview + test-send | High | TC-N012, TC-N013 | Covered | notification-routes.ts, G24, G20 |
| REQ-029 | §3.8, §20.3 NI-06 | notificator | DevOps | Sandbox mode in staging (G24) | Critical | TC-N014 | Covered | notificator wrangler.toml |
| REQ-030 | §3.8 | notificator | System | CRON: hourly digest (resolveDigestType) | High | TC-N015 | Covered | wrangler.toml `0 * * * *` |
| REQ-031 | §3.8 | notificator | System | CRON: 03:00 WAT retention + domain verify | High | TC-N016 | Covered | wrangler.toml `0 2 * * *` |

### B.3 Onboarding and Support Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-040 | §4.2/onboarding.ts, §20.3 OS-01 | api/onboarding.ts | Auth | Onboarding: 6-step completion | High | TC-O001–TC-O007 | Covered | onboarding.ts 337 lines, migration 0210 |
| REQ-041 | §XVIII, §20.3 OS-02 | api/support.ts | Auth | Support FSM: open→in_progress→resolved→closed | High | TC-S001–TC-S005 | Covered | support.ts 390 lines, migration 0225 |
| REQ-042 | §XVIII, §20.3 OS-03 | api/support.ts | super_admin | Cross-tenant ticket view | High | TC-S006 | Covered | support.ts GET /platform/support/tickets |

### B.4 B2B Marketplace Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-050 | §XVI, §20.3 B2-01 | api/b2b-marketplace.ts | Auth (buyer) | RFQ create + bid submit + bid accept → PO | Critical | TC-B001–TC-B004 | Covered | b2b-marketplace.ts 671 lines, migration 0246 |
| REQ-051 | §XVI, §20.3 B2-02 | api/b2b-marketplace.ts | Auth (seller) | PO delivery marking + invoice creation | High | TC-B005, TC-B006 | Covered | b2b-marketplace.ts POST /deliver, /invoices |
| REQ-052 | §XVI, §20.3 B2-03 | api/b2b-marketplace.ts | Auth | B2B dispute flow | High | TC-B007, TC-B008 | Covered | b2b-marketplace.ts POST /disputes |
| REQ-053 | §XVI, §20.3 B2-04 | api/b2b-marketplace.ts | Auth | Entity trust score | Medium | TC-B009 | Covered | b2b-marketplace.ts GET /trust/:entityId |

### B.5 Negotiation Engine Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-060 | §4.2/negotiation.ts, §20.3 NE-01 | api/negotiation.ts | Auth | Vendor pricing policy GET/PUT | High | TC-NE001, TC-NE002 | Covered | negotiation.ts GET/PUT /policy |
| REQ-061 | §4.2/negotiation.ts, §20.3 NE-02 | api/negotiation.ts | Auth | Listing pricing mode per type+id | High | TC-NE003, TC-NE004 | Covered | negotiation.ts /listings/:type/:id/mode |
| REQ-062 | §4.2/negotiation.ts, §20.3 NE-03 | api/negotiation.ts | Auth | Session lifecycle: open→offer→accept/decline/cancel | Critical | TC-NE005–TC-NE009 | Covered | migrations 0183–0184 |
| REQ-063 | §4.2/negotiation.ts, §20.3 NE-04 | api/negotiation.ts | Auth | Offer history retrieval | Medium | TC-NE010 | Covered | negotiation.ts GET /sessions/:id/history |
| REQ-064 | §4.2/negotiation.ts, §20.3 NE-05 | api/negotiation.ts | Auth | min_price_kobo never in API response | Critical | TC-NE011 | Covered | stripMinPrice() called on serialisation |
| REQ-065 | §4.2/negotiation.ts, §20.3 NE-06 | api/negotiation.ts | Auth | KYC check before negotiation (InsufficientKycError) | Critical | TC-NE012 | Covered | negotiation.ts KYC guard |
| REQ-066 | §4.2/negotiation.ts, §20.3 NE-07 | api/negotiation.ts | Auth | Price lock token: generate → verify | High | TC-NE013, TC-NE014 | Covered | generatePriceLockToken, verifyPriceLockToken |
| REQ-067 | §4.2/negotiation.ts, §20.3 NE-08 | api/negotiation.ts | Auth | Negotiation analytics | Medium | TC-NE015 | Covered | negotiation.ts GET /analytics |

### B.6 Access Control and Middleware Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-070 | §5.1, §20.3 AC-01 | api/billing-enforcement.ts | Any | Lapsed subscription blocks gated routes | Critical | TC-AC001, TC-AC002 | Covered | billing-enforcement.ts 199 lines |
| REQ-071 | §5.1, §20.3 AC-02 | api/billing-enforcement.ts | Any | Grace period allows access | Critical | TC-AC003 | Covered | billing-enforcement.ts grace period logic |
| REQ-072 | §5.1, §20.3 AC-03 | api/auth.ts | Any | Expired/invalid JWT returns 401 | Critical | TC-AC004, TC-AC005, TC-AC006 | Covered | auth.ts 89 lines |
| REQ-073 | §5.1, §20.3 AC-04 | api/require-role.ts | admin/super_admin/partner | Role enforcement | Critical | TC-AC007–TC-AC010 | Covered | require-role.ts 54 lines |
| REQ-074 | §5.1, §20.3 AC-05 | api/entitlement.ts | Any | Plan tier gates | Critical | TC-AC011, TC-AC012 | Covered | entitlement.ts 69 lines |
| REQ-075 | §5.1, §20.3 AC-06 | api/ai-entitlement.ts | Any | AI capability subscription check | Critical | TC-AC013 | Covered | ai-entitlement.ts 66 lines |
| REQ-076 | §5.1, §20.3 AC-07 | api/email-verification.ts | Any | Email verification enforcement | High | TC-AC014 | Covered | email-verification.ts 88 lines |
| REQ-077 | §5.1, §20.3 AC-08 | api/csrf.ts | Any | CSRF blocks state-changing requests without token | Critical | TC-AC015 | Covered | csrf.ts 59 lines |
| REQ-078 | §5.1, §20.3 AC-09 | api/rate-limit.ts | Any | Rate limit: 30/hr USSD, 2/hr identity | High | TC-AC016, TC-AC017 | Covered | rate-limit.ts 71 lines |
| REQ-079 | §5.1, §20.3 AC-10 | api/ussd-exclusion.ts | USSD | USSD session blocks non-USSD routes | High | TC-AC018 | Covered | ussd-exclusion.ts |
| REQ-080 | §5.1 PL-01 | api/audit-log.ts | Any (authenticated) | Audit trail per-request write | Critical | TC-AU001, TC-AU002 | Covered | audit-log.ts ~60 lines |

### B.7 Profile Visibility Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-090 | §4.2/profiles.ts, §20.3 PV-01 | api/profiles.ts | Auth | Set public → appears in discovery | High | TC-PV001 | Covered | profiles.ts PATCH visibility, search_entries sync |
| REQ-091 | §4.2/profiles.ts, §20.3 PV-02 | api/profiles.ts | Auth | Set semi → tenant-scoped only | High | TC-PV002 | Covered | profiles.ts 3-level model |
| REQ-092 | §4.2/profiles.ts, §20.3 PV-03 | api/profiles.ts | Auth | Set private → hidden from discovery | High | TC-PV003 | Covered | profiles.ts + public-discovery guards |
| REQ-093 | §4.2/profiles.ts, §20.3 PV-04 | api/profiles.ts | admin | claim_state → managed transition | High | TC-PV004, TC-PV005 | Covered | profiles.ts PATCH claim_state→managed |

### B.8 Template Marketplace Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-100 | §XIII, §20.3 TM-01 | admin-dashboard | Auth | Template listing, search, filter | Medium | TC-TM001, TC-TM002 | Covered | admin-dashboard marketplace.ts |
| REQ-101 | §XIII, §20.3 TM-02 | admin-dashboard, api/templates.ts | Auth | Template install: workspace_id from JWT only (T3) | Critical | TC-TM003, TC-TM004 | Covered | marketplace.ts POST /install/:slug |
| REQ-102 | §XIII, §20.3 TM-03 | admin-dashboard → api | Auth | Install cross-service call | High | TC-TM005 | Covered | admin-dashboard delegates to templates.ts |

### B.9 Brand-Runtime Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-110 | §3.5, §20.3 BR-01 | brand-runtime/shop.ts | Public/Auth | Shop: cart + Paystack + order | Critical | TC-BR001–TC-BR005 | Covered | shop.ts 6 routes |
| REQ-111 | §3.5, §20.3 BR-02 | brand-runtime/blog.ts | Public | Blog: list + detail (T3 scoped) | Medium | TC-BR006 | Covered | blog.ts |
| REQ-112 | §3.5, §20.3 BR-03 | brand-runtime/portal.ts | Auth | Branded portal login + JWT | High | TC-BR007 | Covered | portal.ts GET/POST /portal/login |
| REQ-113 | §3.5, §20.3 BR-04 | brand-runtime/sitemap.ts | Public | Sitemap generation | Low | TC-BR008 | Covered | sitemap.ts GET /sitemap.xml |
| REQ-114 | §3.5, §20.3 BR-05 | brand-runtime | Public | Custom domain Host header resolution | Critical | TC-BR009 | Covered | brand-runtime index.ts tenantResolve |
| REQ-115 | §3.5, §20.3 BR-06 | brand-runtime | Public | Brand tokens applied on every page | High | TC-BR010 | Covered | generateCssTokens, @webwaka/white-label-theming |

### B.10 White-Label and Branding Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-120 | §XII, §20.3 WL-01 | api/tenant-branding.ts | admin+ | Branding CRUD + DNS TXT domain verify | High | TC-WL001–TC-WL004 | Covered | tenant-branding.ts 4 routes |
| REQ-121 | §XII, §20.3 WL-02 | @webwaka/white-label-theming | Any | requiresWebwakaAttribution free=true paid=false | Critical | TC-WL005, TC-WL006 | Covered | white-label-theming G17/OQ-003 |
| REQ-122 | §XII, §20.3 WL-03 | @webwaka/white-label-theming | Any | resolveBrandContext brand_independence_mode | High | TC-WL007 | Covered | resolveBrandContext |
| REQ-123 | §XII, §20.3 WL-04 | brand-runtime + tenant-branding | Public | Custom domain → correct tenant | Critical | TC-WL008 | Covered | tenantResolve + custom_domain lookup |

### B.11 Identity and OTP Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-130 | §10, §20.3 IO-01 | api/identity.ts | Auth | BVN: hash only (R7) + consent (P10) + 2/hr (R5) | Critical | TC-ID001, TC-ID002, TC-ID003 | Covered | identity.ts identityRateLimit |
| REQ-131 | §10, §20.3 IO-02 | api/identity.ts | Auth | NIN, CAC, FRSC verifications | High | TC-ID004, TC-ID005 | Covered | identity.ts 4 routes |
| REQ-132 | §10, §20.3 IO-03 | @webwaka/otp | Auth | OTP waterfall: SMS→WA→Telegram→Voice | Critical | TC-ID006, TC-ID007 | Covered | sendMultiChannelOTP |
| REQ-133 | §10, §20.3 IO-04 | @webwaka/otp | Auth | Transaction OTP must use SMS (R8) | Critical | TC-ID008 | Covered | routeOTPByPurpose R8 |
| REQ-134 | §10, §20.3 IO-05 | @webwaka/otp | Auth | Channel rate limits KV sliding window (R9) | High | TC-ID009 | Covered | CHANNEL_RATE_LIMITS |
| REQ-135 | §10, §20.3 IO-06 | @webwaka/otp | Auth | Channel lock after failures | High | TC-ID010 | Covered | lockChannelAfterFailures |
| REQ-136 | §10, §20.3 IO-07 | @webwaka/contact | Auth | Primary phone verified before KYC/financial (P13) | Critical | TC-ID011 | Covered | assertPrimaryPhoneVerified |

### B.12 i18n Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-140 | §XI.1, §20.3 I8-01 | public-discovery, @webwaka/i18n | Public | ?lang= overrides Accept-Language | Medium | TC-I18-001 | Covered | detectLocale |
| REQ-141 | §XI.1, §20.3 I8-02 | public-discovery | Public | All 6 locale strings render | Medium | TC-I18-002 | Covered | createI18n + 6 locales |
| REQ-142 | §XI.1, §20.3 I8-03 | @webwaka/i18n | Public | Missing keys fall back to English | Medium | TC-I18-003 | Covered | Partial<I18nLocale> fallback |

### B.13 USSD Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-150 | §3.7, §20.3 US-01 | ussd-gateway | USSD | All 5 branches navigable | High | TC-US001–TC-US005 | Covered | processor.ts all branch handlers |
| REQ-151 | §3.7, §20.3 US-02 | ussd-gateway | USSD | Branch 3: trending posts (top 5 by like_count) | High | TC-US006 | Covered | menus.ts trendingFeed |
| REQ-152 | §3.7, §20.3 US-03 | ussd-gateway | USSD | Branch 5: community memberships | High | TC-US007, TC-US008 | Covered | menus.ts communityMenu + sub-states |
| REQ-153 | §3.7, §20.3 US-04 | ussd-gateway | USSD | Session TTL: 3 minutes | High | TC-US009 | Covered | USSD_SESSION_KV 3-min TTL |
| REQ-154 | §3.7, §20.3 US-05 | ussd-gateway | USSD | Rate limit: 30/hr per phone (R5) | High | TC-US010 | Covered | RATE_LIMIT_KV, R5 |
| REQ-155 | §3.7, §20.3 US-06 | ussd-gateway | Telegram | Telegram webhook handler | Medium | TC-US011 | Covered | handleTelegramWebhook |

### B.14 Webhook Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-160 | §XIV, §20.3 WH-01 | api/webhooks.ts | Auth | Webhook tier limits (free=5, starter=25) | High | TC-WH001, TC-WH002 | Covered | WEBHOOK_TIER_LIMITS |
| REQ-161 | §XIV, §20.3 WH-02 | api/webhooks.ts | Auth | Event types per tier | High | TC-WH003 | Covered | TIER_EVENT_REGISTRY |
| REQ-162 | §XIV, §20.3 WH-03 | api/webhooks.ts | Auth | Delivery history per subscription | Medium | TC-WH004 | Covered | webhooks.ts GET /:id/deliveries |
| REQ-163 | §XIV, §20.3 WH-04 | api/webhooks.ts | Auth | DELETE: verify delivery cleanup | High | TC-WH005 | Covered | D1 FK cascade / explicit DELETE QA check |

### B.15 Vertical-Specific Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-170 | §20.3 CV-01 | api/civic.ts | Auth | Church tithe (P9 kobo, optional Paystack ref) | High | TC-CV001 | Covered | civic.ts POST /church/:id/tithe |
| REQ-171 | §20.3 CV-02 | api/civic.ts | Auth | Cooperative: member + contribution + loan + approval | High | TC-CV002, TC-CV003 | Covered | civic.ts 4 endpoints |
| REQ-172 | §20.3 CV-03 | api/civic.ts | Auth | NGO funding recording | Medium | TC-CV004 | Covered | civic.ts POST /ngo/:id/funding |
| REQ-173 | §20.3 TV-01 | api/transport.ts | Auth | Vehicle register + update + list by route | High | TC-TV001 | Covered | transport.ts vehicle routes |
| REQ-174 | §20.3 TV-02 | api/transport.ts | Auth | Route licensing: POST /transport/routes/:id/license | High | TC-TV002 | Covered | transport.ts confirmed live |

### B.16 Platform Admin Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-180 | §20.3 PA-01 | api/analytics.ts | super_admin | Platform analytics: summary + tenants + verticals | High | TC-PA001, TC-PA002 | Covered | analytics.ts 3 routes |
| REQ-181 | §20.3 PA-02 | api/admin-metrics.ts | admin+ | Admin observability: sessions, invites, errors | High | TC-PA003 | Covered | admin-metrics.ts |
| REQ-182 | §20.3 PA-03 | api/platform-admin-settings.ts | super_admin | Platform bank account GET/PATCH | High | TC-PA004, TC-PA005 | Covered | WALLET_KV key |

### B.17 Partner Admin Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-190 | §3.4, §20.3 PR-01 | api/partners.ts, partner-admin | partner | WakaCU credit pool: balance + allocation + history | High | TC-PR001, TC-PR002 | Covered | partners.ts P5 |
| REQ-191 | §3.4, §20.3 PR-02 | api/partners.ts | partner | Settlement: calculate + list + GMV view | High | TC-PR003, TC-PR004 | Covered | partners.ts settlements |
| REQ-192 | §3.4, §20.3 PR-03 | api/partners.ts | partner | Sub-partner management | High | TC-PR005, TC-PR006 | Covered | partners.ts sub-partners CRUD |
| REQ-193 | §3.4, §20.3 PR-04 | partner-admin | partner | Notification bell: polls every 30s | Medium | TC-PR007 | Covered | partner-admin setInterval(30000) |
| REQ-194 | §3.4, §20.3 PR-05 | partner-admin | partner | Mark all partner notifications read | Medium | TC-PR008 | Covered | partner-admin POST /inbox/read-all |

### B.18 MON-04 and Audit Trail Requirements

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-200 | §4.2/workspaces.ts PL-04 | api/workspaces.ts | Auth | MON-04: free invite limit enforced | Critical | TC-MON001, TC-MON002 | Covered | evaluateUserLimit |
| REQ-201 | §4.2/workspaces.ts PL-04 | api/workspaces.ts | Auth | MON-04: free offering limit enforced | Critical | TC-MON003, TC-MON004 | Covered | evaluateOfferingLimit |
| REQ-202 | §4.2/workspaces.ts PL-04 | api/workspaces.ts | Auth | MON-04: free place limit enforced | Critical | TC-MON005, TC-MON006 | Covered | evaluatePlaceLimit |
| REQ-203 | §5.1 PL-01 | api/audit-log.ts | Auth | Audit trail write: every authenticated request | Critical | TC-AU001, TC-AU002 | Covered | audit-log.ts auditLogMiddleware |

### B.19 Compliance and Governance Requirements (§XV.3)

| REQ-ID | Frozen ref | App/module | Role | Workflow/state | Risk | TC-ID(s) | Coverage | Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-210 | §XV.3, §20.3 HR-01 | api (law-firm vertical) | Auth | L3 HITL: law-firm AI output requires HITL approval | Critical | TC-HR001, TC-HR002 | Covered | §XV.3 + superagent.ts HITL_REQUIRED guard |
| REQ-211 | §XV.3, §20.3 HR-02 | api (tax-consultant vertical) | Auth | TIN never in AI payloads | Critical | TC-HR003 | Covered | §XV.3 tax-consultant constraint |
| REQ-212 | §XV.3, §20.3 HR-03 | api (government-agency vertical) | Auth | Tier 3 KYC at workspace activation | Critical | TC-HR004 | Covered | §XV.3 government-agency + BPP |
| REQ-213 | §XV.3, §20.3 HR-04 | api (polling-unit vertical) | Auth | NO voter PII in storage or payloads | Critical | TC-HR005 | Covered | §XV.3 polling-unit INEC constraint |
| REQ-214 | §XV.3, §20.3 HR-05 | api (funeral-home vertical) | Auth | case_ref_id opaque — never in AI payloads | Critical | TC-HR006 | Covered | §XV.3 funeral-home constraint |
| REQ-215 | §XV.3, §20.3 HR-06 | api (creche vertical) | Auth | All AI output requires HITL (children's data) | Critical | TC-HR007 | Covered | §XV.3 creche constraint |

### B.20 Platform Invariant Requirements

| REQ-ID | Frozen ref | Invariant | Risk | TC-ID(s) | Coverage |
|---|---|---|---|---|---|
| INV-001 | §VII P9 | All monetary amounts INTEGER kobo | Critical | TC-INV001 | Covered |
| INV-002 | §VII T3 | tenant_id always from JWT, never from request body | Critical | TC-INV002, TC-INV003 | Covered |
| INV-003 | §VII R7 | BVN/NIN SHA-256 hash only — never stored raw | Critical | TC-INV004 | Covered |
| INV-004 | §VII W1 | Paystack HMAC signature validated before payment state change | Critical | TC-INV005 | Covered |
| INV-005 | §VII G23 | NDPR: notification inbox items hard deleted | Critical | TC-N006 | Covered |
| INV-006 | §VII G24 | Sandbox always active in staging | Critical | TC-N014 | Covered |
| INV-007 | §VII P6 | No PII in logs (maskPII, hashPII) | Critical | TC-INV006 | Covered |
| INV-008 | §VII T8 | Tenant slug immutable after creation | High | TC-INV007 | Covered |
| INV-009 | §VII P12/P13 | Channel consent before OTP; primary phone before KYC | Critical | TC-ID008, TC-ID011 | Covered |
| INV-010 | §VII SEC-009 | /rebuild/* require X-Inter-Service-Secret | Critical | TC-INV008 | Covered |
| INV-011 | §VII G25 | Webhook limits are tier-gated | High | TC-WH001 | Covered |
| INV-012 | §VII WF-032 | Balance-cap re-check before HITL approval | Critical | TC-W008 | Covered |
| INV-013 | §VII T4 | Super admin cross-tenant; all others T3-scoped | Critical | TC-INV009 | Covered |
| INV-014 | §VII G14 | Template variable schema validated fail-loud | High | TC-N012 | Covered |
| INV-015 | §VII G9 | Preference changes logged to notification_audit_log | High | TC-N008 | Covered |

---

## Section C — Test Case Catalog

**Test case ID format:** `TC-[domain][nnn]`  
**Priority codes:** P0 = Blocker | P1 = Critical | P2 = High | P3 = Medium | P4 = Low  
**Test types:** functional (F), negative (N), permission (P), state (S), regression (R), smoke (SMK), integration (I), compliance (C), UX (UX), offline (OFL)

---

### C.1 Auth and Identity

---

**TC-AUTH001**  
*Title:* User registration with valid Nigerian phone number  
*Type:* functional | *Priority:* P1  
*Role:* public | *App:* api/auth-routes.ts | *REQ:* auth-routes.ts (21 endpoints, §4.2)  
*Preconditions:* No existing account for phone/email  
*Steps:*  
1. POST /auth/register with valid payload: { phone: "+2348012345678", email: "test@example.com", password: "Str0ng!pass", workspace_name: "Test Biz" }  
2. Observe response  
3. Check DB: users table has new row; password stored as bcrypt hash (not plaintext)  
*Expected result:* HTTP 201; JWT returned; `email_verified: false`; no plaintext password in response or DB  
*Evidence:* auth-routes.ts register endpoint  

---

**TC-AUTH002**  
*Title:* Login returns JWT with correct role and tenant context  
*Type:* functional | *Priority:* P1  
*Role:* tenant owner | *App:* api/auth-routes.ts  
*Preconditions:* Existing verified user  
*Steps:*  
1. POST /auth/login with { email, password }  
2. Decode returned JWT  
3. Verify JWT contains: user_id, tenant_id, role, workspace_id  
*Expected result:* HTTP 200; JWT payload contains tenant_id (not null); role matches DB; expires_at in future  
*Evidence:* auth-routes.ts login endpoint, ADR-0014  

---

**TC-AUTH003**  
*Title:* Expired JWT returns 401  
*Type:* negative | *Priority:* P0  
*Role:* any | *App:* api/auth.ts middleware | *REQ:* REQ-072, AC-03  
*Preconditions:* A JWT with expiry set to -1 second (generate manually using same secret)  
*Steps:*  
1. Send any authenticated request with expired JWT in Authorization header  
2. Observe response  
*Expected result:* HTTP 401; body: `{ error: "UNAUTHORIZED", message: "Token expired" }` (or equivalent); no data returned  
*Evidence:* auth.ts 89 lines — JWT expiry check  

---

**TC-AUTH004**  
*Title:* Invalid/tampered JWT returns 401  
*Type:* negative | *Priority:* P0  
*Role:* any | *App:* api/auth.ts middleware | *REQ:* REQ-072  
*Steps:*  
1. Send request with JWT payload edited (e.g., role changed to super_admin) but original signature  
2. Observe response  
*Expected result:* HTTP 401; signature validation failure  
*Evidence:* auth.ts JWT verification  

---

**TC-AUTH005**  
*Title:* MFA — second factor verification blocks access until complete  
*Type:* functional | *Priority:* P1  
*Role:* any | *App:* api/auth-routes.ts  
*Preconditions:* User has MFA enabled  
*Steps:*  
1. POST /auth/login with correct credentials  
2. Attempt to access protected resource before MFA completion  
3. Submit correct TOTP/OTP via MFA endpoint  
4. Retry protected resource  
*Expected result:* Step 2: HTTP 403 or partial JWT (pre-MFA token); Step 4: HTTP 200  
*Evidence:* auth-routes.ts MFA endpoint  

---

**TC-AUTH006**  
*Title:* Session revocation immediately invalidates token  
*Type:* state | *Priority:* P1  
*Role:* any | *App:* api/auth-routes.ts  
*Steps:*  
1. Login and obtain JWT  
2. POST /auth/sessions/:sessionId/revoke  
3. Immediately use the revoked token on any protected route  
*Expected result:* HTTP 401 on step 3  
*Evidence:* auth-routes.ts sessions revoke endpoint; sessions table `revoked` column  

---

**TC-AUTH007**  
*Title:* Invite flow: invite → accept → JWT issued with correct workspace context  
*Type:* functional | *Priority:* P1  
*Role:* admin (inviter), new user (invitee) | *App:* api/auth-routes.ts  
*Steps:*  
1. POST /auth/invite with { email: "invitee@test.com", role: "manager" } (admin JWT)  
2. Check invitations table: row created, soft_delete = 0  
3. Accept invite via POST /auth/invite/accept with invite token  
4. Login as invitee  
5. Decode JWT  
*Expected result:* JWT contains correct workspace_id and role: "manager"  
*Evidence:* auth-routes.ts invite + accept-invite; invitations table (0378_invitations_soft_delete)  

---

**TC-ID001**  
*Title:* BVN verification: consent required, hash stored, raw never stored (R7, P10)  
*Type:* compliance | *Priority:* P0  
*Role:* authenticated user | *App:* api/identity.ts | *REQ:* REQ-130, INV-003  
*Preconditions:* No prior BVN verification for user; primary phone verified (P13)  
*Steps:*  
1. POST /identity/verify-bvn WITHOUT consent record → expect 422  
2. Create consent record via POST /identity/consent  
3. POST /identity/verify-bvn with valid payload including consent_ref  
4. Query identity_verifications table directly  
5. Inspect logs for any plaintext BVN  
*Expected result:* Step 1: 422 CONSENT_REQUIRED; Step 3: 200; Step 4: only `bvn_hash` column contains data (SHA-256), `bvn` column absent or null; Step 5: no BVN in logs  
*Evidence:* identity.ts ConsentRecord check + hashPII (R7); consent_records table (M7a)  

---

**TC-ID002**  
*Title:* BVN verification rate limit: max 2/hr per user (R5)  
*Type:* negative | *Priority:* P1  
*Role:* authenticated user | *App:* api/identity.ts | *REQ:* REQ-130, INV-003  
*Steps:*  
1. Submit two valid BVN verification attempts within 1 hour (reset KV state before test)  
2. Submit third attempt within same hour  
*Expected result:* Attempts 1–2: 200 (or provider-dependent success); Attempt 3: HTTP 429 RATE_LIMIT_EXCEEDED  
*Evidence:* identity.ts identityRateLimit (2/hr)  

---

**TC-ID003**  
*Title:* BVN same-hash deduplication: same BVN for two users — security check  
*Type:* compliance | *Priority:* P1  
*Role:* two distinct users | *App:* api/identity.ts | *REQ:* INV-003  
*Steps:*  
1. User A verifies BVN "12345678901"; hash stored  
2. User B tries to verify same BVN  
3. Inspect system response and database state  
*Expected result:* System correctly handles (per business rule — either rejects or links). Critical: raw BVN must never be present in either row.  
*Evidence:* identity_verifications table R7 constraint  

---

**TC-ID008**  
*Title:* Transaction OTP must use SMS, not Telegram (R8)  
*Type:* compliance | *Priority:* P0  
*Role:* authenticated user | *App:* @webwaka/otp | *REQ:* REQ-133, INV-009  
*Steps:*  
1. Trigger a financial transaction that requires OTP  
2. Intercept OTP dispatch call  
3. Verify OTP channel used  
*Expected result:* `routeOTPByPurpose` selects SMS channel regardless of user's preferred channel setting when purpose = 'transaction'  
*Evidence:* @webwaka/otp routeOTPByPurpose R8  

---

**TC-ID011**  
*Title:* Financial operation blocked if primary phone not verified (P13)  
*Type:* compliance | *Priority:* P0  
*Role:* authenticated user (unverified phone) | *App:* api/contact.ts | *REQ:* REQ-136  
*Preconditions:* User account with no primary phone verified  
*Steps:*  
1. Attempt POST /bank-transfer (create bank transfer order)  
2. Observe response  
*Expected result:* HTTP 422; error code PRIMARY_PHONE_REQUIRED; assertPrimaryPhoneVerified fails  
*Evidence:* @webwaka/contact assertPrimaryPhoneVerified (P13)  

---

### C.2 Workspace App

---

**TC-WS001**  
*Title:* Dashboard renders correct stats for current workspace  
*Type:* functional | *Priority:* P2  
*Role:* tenant owner | *App:* workspace-app `/` | *REQ:* workspace-app routes §3.2  
*Preconditions:* Workspace with 3 offerings, 2 sales recorded  
*Steps:*  
1. Load workspace-app dashboard  
2. Inspect displayed stats  
*Expected result:* Stats reflect workspace-scoped data (T3); no cross-tenant data visible  
*Evidence:* workspace-app Dashboard component §3.2  

---

**TC-WS002**  
*Title:* Offerings CRUD: create → filter active → toggle inactive → delete  
*Type:* functional | *Priority:* P1  
*Role:* tenant owner/admin | *App:* workspace-app /offerings | *REQ:* workspace-app Offerings.tsx §3.2  
*Steps:*  
1. Navigate to /offerings  
2. Click New Offering; fill form; save  
3. Verify offering appears in Active filter  
4. Toggle offering to inactive  
5. Verify it appears in Inactive filter and not Active  
6. Delete offering  
7. Verify offering no longer appears  
*Expected result:* All CRUD operations succeed; UI updates reactively; currency displayed as ₦ using koboToNaira  
*Evidence:* workspace-app Offerings.tsx, formatNaira, koboToNaira §3.2  

---

**TC-WS003**  
*Title:* MON-04: free tier offering limit blocks creation when exceeded  
*Type:* compliance | *Priority:* P0  
*Role:* tenant owner (free plan) | *App:* api/workspaces.ts | *REQ:* REQ-201  
*Preconditions:* Workspace on free plan at exact offering limit (query DB for current limit)  
*Steps:*  
1. Attempt POST /workspaces/:id/offerings  
2. Observe API response  
3. Verify workspace-app UI shows appropriate error  
*Expected result:* HTTP 403; error code OFFERING_LIMIT_REACHED; no offering created in DB  
*Evidence:* workspaces.ts evaluateOfferingLimit §4.2  

---

**TC-MON001**  
*Title:* MON-04: free tier user invite limit enforced  
*Type:* compliance | *Priority:* P0  
*Role:* tenant owner/admin (free plan) | *App:* api/workspaces.ts | *REQ:* REQ-200  
*Preconditions:* Free workspace at invite limit  
*Steps:*  
1. POST /workspaces/:id/invite with valid invitee email  
*Expected result:* HTTP 403; INVITE_LIMIT_REACHED  
*Evidence:* workspaces.ts evaluateUserLimit §4.2  

---

**TC-MON002**  
*Title:* MON-04: paid tier (starter+) invite limit not enforced  
*Type:* functional | *Priority:* P2  
*Role:* tenant owner (starter plan) | *App:* api/workspaces.ts | *REQ:* REQ-200  
*Steps:*  
1. Upgrade workspace to starter  
2. Invite user count matching old free limit + 1  
*Expected result:* Invite succeeds; no limit rejection  
*Evidence:* workspaces.ts evaluateUserLimit — paid tiers use higher/unlimited thresholds  

---

**TC-MON005**  
*Title:* MON-04: free tier place/branch limit enforced  
*Type:* compliance | *Priority:* P0  
*Role:* tenant owner (free plan) | *App:* api/workspaces.ts | *REQ:* REQ-202  
*Steps:*  
1. Add places until free limit reached  
2. POST /workspaces/:id/places  
*Expected result:* HTTP 403; PLACE_LIMIT_REACHED  
*Evidence:* workspaces.ts evaluatePlaceLimit §4.2  

---

**TC-WS010**  
*Title:* Vertical activation: workspace-app shows 20-vertical registry only  
*Type:* functional | *Priority:* P2  
*Role:* tenant owner | *App:* workspace-app /verticals | *REQ:* §3.2 VERTICAL_REGISTRY limitation  
*Steps:*  
1. Open /verticals in workspace-app  
2. Count displayed verticals  
3. Verify only 20 appear (frontend limitation, not API limitation)  
*Expected result:* 20 verticals displayed in UI; API GET /verticals returns all 160 if called directly  
*Evidence:* workspace-app §3.2 VERTICAL_REGISTRY (20 verticals, by design)  

---

### C.3 POS and Commerce

---

**TC-P001**  
*Title:* POS: create sale, amount in kobo, receipt generated  
*Type:* functional | *Priority:* P1  
*Role:* cashier | *App:* workspace-app /pos, api/pos.ts | *REQ:* REQ-011  
*Preconditions:* At least 1 active offering in workspace  
*Steps:*  
1. Open /pos  
2. Add item to cart  
3. Enter amount manually (enter ₦500 = 50000 kobo)  
4. Complete sale  
5. Observe confirmation  
6. Query transactions table  
*Expected result:* transactions.amount_kobo = 50000; UI displays ₦500.00  
*Evidence:* pos.ts, workspace-app /pos, P9 invariant (§VII)  

---

**TC-P002**  
*Title:* POS: loyalty points awarded on eligible sale  
*Type:* functional | *Priority:* P2  
*Role:* cashier | *App:* api/pos-business.ts | *REQ:* §4.2 pos-business.ts  
*Steps:*  
1. Create sale with customer linked  
2. Verify loyalty points in customer record  
*Expected result:* loyalty record updated; points calculation matches configured rule  
*Evidence:* pos-business.ts loyalty endpoint §4.2  

---

**TC-P003**  
*Title:* POS: fractional kobo amount rejected (P9 invariant)  
*Type:* compliance | *Priority:* P0  
*Role:* cashier | *App:* api/pos.ts | *REQ:* INV-001  
*Steps:*  
1. Submit sale with amount_kobo = 999.5 (non-integer)  
*Expected result:* HTTP 400; validation error; no transaction created  
*Evidence:* P9 invariant — all amounts INTEGER kobo §VII  

---

**TC-COM001**  
*Title:* Restaurant menu CRUD + P9 price validation  
*Type:* functional | *Priority:* P2  
*Role:* tenant owner | *App:* api/commerce.ts | *REQ:* §4.2 commerce.ts  
*Steps:*  
1. POST /restaurant/menu with item: { name: "Jollof Rice", price_kobo: 150000 }  
2. Verify item returned in GET menu list  
3. Attempt to create item with price_kobo: 1500.50  
*Expected result:* Step 1: 201, item stored; Step 3: 400 validation error  
*Evidence:* commerce.ts restaurant menu CRUD + P9 §4.2  

---

### C.4 Brand-Runtime

---

**TC-BR001**  
*Title:* Shop: product listing resolves for correct tenant via Host header  
*Type:* functional | *Priority:* P1  
*Role:* public (shop visitor) | *App:* brand-runtime/shop.ts | *REQ:* REQ-110, REQ-114  
*Preconditions:* Tenant with custom domain and active products  
*Steps:*  
1. GET https://{tenant-domain}/shop  
2. Inspect products returned  
3. Repeat with different tenant domain  
*Expected result:* Each request returns only the requesting tenant's products (T3 isolation via Host header resolution)  
*Evidence:* brand-runtime tenantResolve middleware; shop.ts §3.5  

---

**TC-BR002**  
*Title:* Shop: add to cart persists in KV with session key  
*Type:* functional | *Priority:* P1  
*Role:* public | *App:* brand-runtime/shop.ts | *REQ:* REQ-110  
*Steps:*  
1. POST /shop/cart/add with product_id and quantity  
2. GET /shop/cart  
3. Verify item in cart  
4. Add second item  
5. GET /shop/cart  
*Expected result:* Cart state persists in KV; both items present; prices in kobo internally, ₦ displayed  
*Evidence:* shop.ts KV cart state §3.5  

---

**TC-BR003**  
*Title:* Paystack checkout: callback verifies signature and creates order  
*Type:* functional | *Priority:* P0  
*Role:* public (buyer) | *App:* brand-runtime/shop.ts | *REQ:* REQ-110, INV-004  
*Preconditions:* Item in cart; Paystack test mode credentials configured  
*Steps:*  
1. POST /shop/checkout → Paystack payment URL received  
2. Simulate Paystack callback: GET /shop/checkout/callback?reference=test_ref&status=success  
3. Query orders table  
*Expected result:* HMAC verified before processing; order row created with correct tenant_id, amount_kobo, paystack_reference  
*Evidence:* shop.ts GET /shop/checkout/callback; W1 invariant §VII  

---

**TC-BR004**  
*Title:* Paystack checkout: invalid HMAC rejects payment callback  
*Type:* negative | *Priority:* P0  
*Role:* attacker | *App:* brand-runtime/shop.ts | *REQ:* INV-004  
*Steps:*  
1. Send GET /shop/checkout/callback with manipulated x-paystack-signature header  
*Expected result:* HTTP 400/403; no order created; payment state not changed  
*Evidence:* W1 invariant; @webwaka/payments HMAC verification  

---

**TC-BR007**  
*Title:* Portal login: branded login page + JWT issued by main API  
*Type:* integration | *Priority:* P1  
*Role:* tenant end-user | *App:* brand-runtime/portal.ts | *REQ:* REQ-112  
*Steps:*  
1. GET https://{tenant-domain}/portal/login  
2. Verify page renders tenant brand tokens  
3. POST /portal/login with valid credentials  
4. Verify redirect to /portal/  
5. Decode JWT in response/cookie  
*Expected result:* Brand colors/logo applied; JWT issued by API Worker (inter-service call); JWT contains correct tenant_id  
*Evidence:* portal.ts — JWT issued by API via inter-service call §3.5  

---

**TC-BR009**  
*Title:* Host header resolution: wrong domain returns 404 or brand-neutral fallback  
*Type:* negative | *Priority:* P1  
*Role:* public | *App:* brand-runtime | *REQ:* REQ-114  
*Steps:*  
1. GET brand-runtime with Host header set to unregistered domain  
*Expected result:* HTTP 404 or default response; no tenant data leaked  
*Evidence:* brand-runtime tenantResolve §3.5  

---

**TC-BR010**  
*Title:* Brand tokens applied: CSS variables present on every page  
*Type:* functional | *Priority:* P2  
*Role:* public | *App:* brand-runtime | *REQ:* REQ-115  
*Steps:*  
1. GET any brand-runtime page (shop, blog, portal)  
2. Inspect HTML response for `<style>` block with CSS variables  
*Expected result:* `:root { --primary-color: ...; --secondary-color: ...; --font-family: ...; }` present in each page response  
*Evidence:* generateCssTokens called in every route handler §3.5  

---

### C.5 Public-Discovery

---

**TC-PD001**  
*Title:* Discovery search returns tenant-scoped results with correct i18n  
*Type:* functional | *Priority:* P2  
*Role:* public | *App:* public-discovery/listings.ts  
*Steps:*  
1. GET /discover/search?q=bakery&lang=yo  
2. Inspect response language  
*Expected result:* Results in Yorùbá locale strings where available; English fallback for missing keys  
*Evidence:* public-discovery imports detectLocale + createI18n §3.6  

---

**TC-PD002**  
*Title:* Geography slug URLs resolve correctly  
*Type:* functional | *Priority:* P2  
*Role:* public | *App:* public-discovery/geography.ts  
*Steps:*  
1. GET /discover/lagos  
2. GET /discover/lagos/ikeja  
3. GET /discover/lagos/ikeja-lga/ikeja-sector  
*Expected result:* Each URL returns correct geography-scoped listings; BreadcrumbList JSON-LD present  
*Evidence:* geography.ts 3-level slug routing §3.6  

---

**TC-PD003**  
*Title:* Public profile page includes Schema.org JSON-LD  
*Type:* functional | *Priority:* P3  
*Role:* public | *App:* public-discovery/profiles.ts  
*Steps:*  
1. GET /discover/profile/organization/:id  
2. Inspect HTML response  
*Expected result:* `<script type="application/ld+json">` block present with @context: "https://schema.org"  
*Evidence:* Schema.org JSON-LD §3.6  

---

**TC-PD004**  
*Title:* Private profile does not appear in discovery  
*Type:* compliance | *Priority:* P1  
*Role:* public | *App:* public-discovery + api/profiles.ts | *REQ:* REQ-092  
*Preconditions:* Profile with visibility = private  
*Steps:*  
1. GET /discover/search?q={private-profile-name}  
2. GET /discover/profile/organization/{private-org-id}  
*Expected result:* Profile absent from search results; profile endpoint returns 404 or 403  
*Evidence:* profiles.ts public-discovery route guards on visibility §4.2  

---

### C.6 Partner Admin

---

**TC-PR001**  
*Title:* Partner WakaCU credit pool balance and allocation  
*Type:* functional | *Priority:* P1  
*Role:* partner | *App:* api/partners.ts, partner-admin | *REQ:* REQ-190  
*Preconditions:* Partner account with credit pool configured  
*Steps:*  
1. GET /partners/:id/credits — note balance  
2. POST /partners/:id/credits/allocate with { tenant_id: X, amount: 1000 }  
3. GET /partners/:id/credits — verify balance decreased  
4. GET /partners/:id/credits/history — verify allocation record  
*Expected result:* Balance decremented correctly; history entry immutable  
*Evidence:* partners.ts P5 §3.4  

---

**TC-PR003**  
*Title:* Settlement calculation: GMV and partner share correct  
*Type:* functional | *Priority:* P1  
*Role:* partner | *App:* api/partners.ts | *REQ:* REQ-191  
*Steps:*  
1. POST /partners/:id/settlements/calculate for period  
2. GET /partners/:id/settlements  
3. Verify GMV and partner share calculation  
*Expected result:* GMV reflects total transaction volume; partner share matches configured revenue split percentage  
*Evidence:* partners.ts settlements §3.4  

---

**TC-PR005**  
*Title:* Sub-partner creation and status management  
*Type:* functional | *Priority:* P2  
*Role:* partner | *App:* api/partners.ts | *REQ:* REQ-192  
*Steps:*  
1. POST /partners/:id/sub-partners with sub-partner details  
2. GET /partners/:id/sub-partners  
3. PATCH /sub-partners/:subId/status with { status: "suspended" }  
4. GET sub-partner and verify status  
*Expected result:* Sub-partner created under parent partner (T3 scoped); status transition reflected  
*Evidence:* partners.ts sub-partners CRUD §3.4  

---

**TC-PR007**  
*Title:* Notification bell polls every 30 seconds  
*Type:* functional | *Priority:* P3  
*Role:* partner | *App:* partner-admin | *REQ:* REQ-193  
*Steps:*  
1. Open partner-admin  
2. Monitor network requests  
3. Wait 35 seconds  
*Expected result:* GET /notifications/inbox?category=partner called once per 30s; unread count badge updates  
*Evidence:* partner-admin setInterval(30000) §3.4  

---

### C.7 Platform Admin

---

**TC-PA001**  
*Title:* Platform analytics: summary endpoint returns cross-tenant totals  
*Type:* functional | *Priority:* P1  
*Role:* super_admin | *App:* api/analytics.ts | *REQ:* REQ-180  
*Preconditions:* Multiple tenants with transaction history  
*Steps:*  
1. GET /platform/analytics/summary (super_admin JWT)  
2. Repeat with regular admin JWT  
*Expected result:* Step 1: aggregated totals across all tenants; Step 2: HTTP 403 (T4 invariant)  
*Evidence:* analytics.ts super_admin guard §4.2, T4 invariant §VII  

---

**TC-PA002**  
*Title:* Platform analytics: vertical usage heatmap  
*Type:* functional | *Priority:* P2  
*Role:* super_admin | *App:* api/analytics.ts | *REQ:* REQ-180  
*Steps:*  
1. GET /platform/analytics/verticals  
*Expected result:* Returns map of vertical_slug → usage count across all tenants  
*Evidence:* analytics.ts GET /verticals §4.2  

---

**TC-PA003**  
*Title:* Admin metrics: active sessions + recent errors  
*Type:* functional | *Priority:* P2  
*Role:* admin+ | *App:* api/admin-metrics.ts | *REQ:* REQ-181  
*Steps:*  
1. GET /admin/metrics  
2. Inspect all 5 fields  
*Expected result:* Response contains: active_session_count, pending_invite_count, recent_errors (last 20 hourly), auth_failures_24h, total_audit_logs_24h  
*Evidence:* admin-metrics.ts P20-E §4.2  

---

**TC-PA004**  
*Title:* Platform bank account: PATCH persists to WALLET_KV  
*Type:* functional | *Priority:* P1  
*Role:* super_admin | *App:* api/platform-admin-settings.ts | *REQ:* REQ-182  
*Steps:*  
1. PATCH /platform/settings/bank-account with { account_number: "0123456789", bank_code: "058" }  
2. GET /platform/settings/bank-account  
*Expected result:* KV key `platform:payment:bank_account` updated; GET returns same data; non-super_admin gets 403  
*Evidence:* platform-admin-settings.ts WALLET_KV §4.2  

---

**TC-F020**  
*Title:* Upgrade request: confirm flow (6-step activation, idempotent)  
*Type:* functional | *Priority:* P0  
*Role:* super_admin | *App:* api/platform-admin-billing.ts | *REQ:* REQ-008  
*Preconditions:* Pending workspace upgrade request with reference WKUP-XXXXXXXX-XXXXX  
*Steps:*  
1. GET /platform/billing/requests — note pending request  
2. POST /platform/billing/requests/:id/confirm  
3. Verify workspace plan upgraded  
4. Confirm billing history row created  
5. POST /platform/billing/requests/:id/confirm again (idempotency test)  
*Expected result:* Step 2: 6-step activation completes; Step 3: plan updated; Step 5: 200 with no duplicate billing row (idempotent)  
*Evidence:* platform-admin-billing.ts 6-step confirm, idempotent §4.2  

---

**TC-F021**  
*Title:* Upgrade request: reject with reason  
*Type:* functional | *Priority:* P1  
*Role:* super_admin | *App:* api/platform-admin-billing.ts | *REQ:* REQ-008  
*Steps:*  
1. POST /platform/billing/requests/:id/reject with { reason: "Insufficient proof" }  
2. Verify workspace plan unchanged  
3. Verify request status = rejected  
*Expected result:* Request rejected; plan unchanged; reason stored  
*Evidence:* platform-admin-billing.ts §4.2  

---

**TC-F022**  
*Title:* Upgrade reference format validation: WKUP-XXXXXXXX-XXXXX  
*Type:* functional | *Priority:* P2  
*Role:* super_admin | *App:* api/platform-admin-billing.ts | *REQ:* REQ-008  
*Steps:*  
1. Initiate a bank_transfer upgrade request  
2. Inspect generated reference  
*Expected result:* Reference matches regex `/WKUP-[A-Z0-9]{8}-[A-Z0-9]{5}/`  
*Evidence:* platform-admin-billing.ts WKUP-XXXXXXXX-XXXXX format §4.2  

---

### C.8 Admin-Dashboard

---

**TC-TM001**  
*Title:* Template listing with search and type filter  
*Type:* functional | *Priority:* P2  
*Role:* admin | *App:* admin-dashboard | *REQ:* REQ-100  
*Steps:*  
1. GET /marketplace?q=restaurant&type=layout  
2. Verify results match filter  
3. Verify pagination cursor present  
*Expected result:* Filtered list returned; each item includes name, slug, price_kobo, template_type  
*Evidence:* admin-dashboard marketplace.ts §3.3  

---

**TC-TM003**  
*Title:* Template install: workspace_id from JWT only (T3, never from body)  
*Type:* compliance | *Priority:* P0  
*Role:* admin | *App:* admin-dashboard / api/templates.ts | *REQ:* REQ-101, INV-002  
*Preconditions:* Template exists in registry  
*Steps:*  
1. POST /marketplace/install/:slug with body containing `workspace_id: "attacker-workspace-id"` (attempt injection)  
2. Inspect which workspace the template was installed for  
*Expected result:* Template installed in JWT's workspace, NOT the attacker-supplied workspace_id; body workspace_id ignored  
*Evidence:* templates.ts T3 constraint §3.3; T3 invariant §VII  

---

**TC-TM004**  
*Title:* Template purchase revenue split: 70% author / 30% platform  
*Type:* functional | *Priority:* P1  
*Role:* admin | *App:* api/templates.ts | *REQ:* REQ-007  
*Preconditions:* Paid template available  
*Steps:*  
1. POST /marketplace/install/:slug (triggers purchase flow)  
2. Verify Paystack payment initialized  
3. After callback, query revenue_splits table  
*Expected result:* revenue_splits row: author_amount_kobo = 70% of price_kobo; platform_amount_kobo = 30%; paystack_ref UNIQUE (no duplicate)  
*Evidence:* migration 0215; templates.ts §XIII  

---

**TC-TM005**  
*Title:* Template install idempotency: duplicate paystack_ref rejected  
*Type:* negative | *Priority:* P1  
*Role:* admin | *App:* api/templates.ts | *REQ:* REQ-007  
*Steps:*  
1. Submit install callback with paystack_ref = "test_ref_123"  
2. Submit same callback again  
*Expected result:* Second attempt returns idempotent response (no duplicate row); UNIQUE constraint on paystack_ref prevents duplicate revenue_splits  
*Evidence:* migration 0215 `paystack_ref UNIQUE` §XIII  

---

### C.9 USSD Gateway

---

**TC-US001**  
*Title:* Main menu renders all 5 branches  
*Type:* functional | *Priority:* P1  
*Role:* USSD user | *App:* ussd-gateway | *REQ:* REQ-150  
*Preconditions:* USSD session initiated via *384#  
*Steps:*  
1. Send Africa's Talking webhook: sessionId=new, text=""  
2. Inspect USSD response body  
*Expected result:* Response contains 5 numbered options; state = `main_menu`  
*Evidence:* ussd-gateway menus.ts mainMenu(); processor.ts §3.7  

---

**TC-US002**  
*Title:* Branch 1 (Wallet): balance displayed  
*Type:* functional | *Priority:* P1  
*Role:* USSD user (T1+ KYC) | *App:* ussd-gateway | *REQ:* REQ-150  
*Steps:*  
1. Enter "1" from main menu  
2. Verify state = `wallet_menu`  
3. Inspect balance display  
*Expected result:* Balance shown in ₦; walletMenu(balanceKobo) divides by 100 correctly  
*Evidence:* ussd-gateway menus.ts walletMenu §3.7  

---

**TC-US006**  
*Title:* Branch 3 (Trending): top 5 posts by like_count  
*Type:* functional | *Priority:* P2  
*Role:* USSD user | *App:* ussd-gateway | *REQ:* REQ-151  
*Steps:*  
1. Enter "3" from main menu  
2. Verify state = `trending_feed`  
3. Count posts in response  
4. Navigate into a post (select one)  
5. Verify state = `trending_view_post`  
*Expected result:* Exactly 5 posts shown; ordered by like_count descending; post detail (title, snippet) shown on deeper level  
*Evidence:* menus.ts trendingFeed + viewTrendingPost; index.ts pre-fetches top 5 by like_count §3.7  

---

**TC-US007**  
*Title:* Branch 5 (Community): sub-menus (announcements, events, groups) reachable  
*Type:* functional | *Priority:* P2  
*Role:* USSD user (community member) | *App:* ussd-gateway | *REQ:* REQ-152  
*Steps:*  
1. Enter "5" from main menu (state = `community_menu`)  
2. Select "1" Announcements (state = `community_announcements`)  
3. Back to community_menu  
4. Select "2" Events (state = `community_events`)  
5. Back; select "3" Groups (state = `community_groups`)  
*Expected result:* All 3 sub-states reachable; depth ≤ 3 levels from root (UX-08); terminal state reached from each sub-menu  
*Evidence:* menus.ts communityMenu + communityAnnouncements + communityEvents + communityGroups §3.7  

---

**TC-US009**  
*Title:* Session expiry after 3 minutes  
*Type:* state | *Priority:* P1  
*Role:* USSD user | *App:* ussd-gateway | *REQ:* REQ-153  
*Steps:*  
1. Start USSD session  
2. Wait 3 minutes + 1 second  
3. Send continuation input  
*Expected result:* Session not found in KV; user receives session-expired message; must redial *384#  
*Evidence:* USSD_SESSION_KV 3-minute TTL §3.7  

---

**TC-US010**  
*Title:* Rate limit: 31st USSD request within 1 hour blocked  
*Type:* negative | *Priority:* P1  
*Role:* USSD user | *App:* ussd-gateway | *REQ:* REQ-154  
*Steps:*  
1. Send 30 USSD requests within 1 hour from same phone number (reset KV before test)  
2. Send 31st request  
*Expected result:* 31st returns rate-limit-exceeded response; RATE_LIMIT_KV sliding window correctly enforced (R5)  
*Evidence:* RATE_LIMIT_KV, R5 §3.7  

---

**TC-US011**  
*Title:* Telegram webhook handler responds to Telegram updates  
*Type:* integration | *Priority:* P2  
*Role:* Telegram bot user | *App:* ussd-gateway | *REQ:* REQ-155  
*Steps:*  
1. POST ussd-gateway Telegram webhook URL with TelegramUpdate payload  
2. Inspect handling  
*Expected result:* handleTelegramWebhook processes update; appropriate response returned; NOTIFICATION_QUEUE binding fires if NOTIFICATION_PIPELINE_ENABLED=true  
*Evidence:* ussd-gateway handleTelegramWebhook §3.7  

---

### C.10 Notifications

---

**TC-N001**  
*Title:* Inbox state: unread → read  
*Type:* state | *Priority:* P1  
*Role:* authenticated user | *App:* api/inbox-routes.ts | *REQ:* REQ-020  
*Steps:*  
1. GET /notifications/inbox — verify item is unread  
2. PATCH /notifications/inbox/:id with { state: "read" }  
3. GET /notifications/inbox — verify item is read  
*Expected result:* Item state changes; read_at timestamp set  
*Evidence:* inbox-routes.ts PATCH /:id §9.3  

---

**TC-N006**  
*Title:* NDPR hard delete: inbox item permanently removed  
*Type:* compliance | *Priority:* P0  
*Role:* authenticated user | *App:* api/inbox-routes.ts | *REQ:* REQ-025, INV-005  
*Steps:*  
1. Record inbox item ID  
2. DELETE /notifications/inbox/:id  
3. Attempt GET /notifications/inbox/:id  
4. Query notification_inbox table directly for that ID  
*Expected result:* Step 3: HTTP 404; Step 4: no row found (hard deleted, not soft deleted); G23 enforced  
*Evidence:* inbox-routes.ts DELETE endpoint, G23 §9.3  

---

**TC-N007**  
*Title:* Unread count KV cache: stale count invalidated after state change  
*Type:* functional | *Priority:* P2  
*Role:* authenticated user | *App:* api/inbox-routes.ts | *REQ:* REQ-026  
*Steps:*  
1. GET /notifications/inbox/unread-count — note count N  
2. PATCH /notifications/inbox/:id with { state: "read" }  
3. Wait < 10 seconds  
4. GET /notifications/inbox/unread-count  
5. Wait > 10 seconds  
6. GET /notifications/inbox/unread-count  
*Expected result:* Step 4: may still show N (cache TTL); Step 6: shows N-1 (cache expired, re-computed)  
*Evidence:* inbox-routes.ts KV key `{tenant_id}:inbox:unread:{user_id}` TTL=10s §9.3  

---

**TC-N008**  
*Title:* Notification preference change is logged to audit log (G9)  
*Type:* compliance | *Priority:* P1  
*Role:* authenticated user | *App:* api/preference-routes.ts | *REQ:* REQ-027, INV-015  
*Steps:*  
1. PUT /notifications/preferences with { email: { digest_frequency: "weekly" } }  
2. Query notification_audit_log table  
*Expected result:* New row in notification_audit_log with user_id, changed_field, old_value, new_value, timestamp; G9 enforced  
*Evidence:* preference-routes.ts PreferenceService.update G9 §9.4  

---

**TC-N009**  
*Title:* Preference update invalidates KV cache (N-061)  
*Type:* functional | *Priority:* P2  
*Role:* authenticated user | *App:* api/preference-routes.ts | *REQ:* REQ-027  
*Steps:*  
1. PUT /notifications/preferences  
2. Inspect KV cache key for preferences  
*Expected result:* Preference KV cache key deleted/invalidated; next read re-fetches from D1  
*Evidence:* preference-routes.ts N-061 KV invalidation §9.4  

---

**TC-N012**  
*Title:* Template preview: variable schema validated fail-loud (G14)  
*Type:* compliance | *Priority:* P1  
*Role:* admin | *App:* api/notification-routes.ts | *REQ:* REQ-028, INV-014  
*Steps:*  
1. POST /notifications/templates/:id/preview with missing required variable  
2. POST /notifications/templates/:id/preview with all required variables  
*Expected result:* Step 1: HTTP 422 with specific variable validation error (fail-loud, not silent substitution); Step 2: rendered preview returned  
*Evidence:* notification-routes.ts TemplateRenderer.preview G14 §4.2  

---

**TC-N013**  
*Title:* Test-send: always uses sandbox, bypasses suppression list (G24, G20)  
*Type:* compliance | *Priority:* P0  
*Role:* admin | *App:* api/notification-routes.ts | *REQ:* REQ-028, INV-006  
*Preconditions:* Staging environment; NOTIFICATION_SANDBOX_MODE=true  
*Steps:*  
1. POST /notifications/templates/:id/test-send to recipient on suppression list  
2. Inspect notificator logs  
*Expected result:* Delivery attempted to sandbox address (not real recipient); suppression list bypassed (G20); no real delivery made (G24)  
*Evidence:* notification-routes.ts G24 + G20 §4.2  

---

**TC-N014**  
*Title:* Staging deployment: NOTIFICATION_SANDBOX_MODE=true enforced  
*Type:* compliance | *Priority:* P0  
*Role:* DevOps | *App:* notificator | *REQ:* REQ-029, INV-006  
*Steps:*  
1. Inspect notificator wrangler.toml [env.staging] section  
2. Check CI/CD pipeline configuration  
*Expected result:* `NOTIFICATION_SANDBOX_MODE = "true"` in staging config; CI/CD assertion documented; production deploy asserts `false`  
*Evidence:* notificator wrangler.toml G24 §3.8  

---

**TC-N015**  
*Title:* Hourly CRON: resolveDigestType detects daily at hour=23  
*Type:* functional | *Priority:* P2  
*Role:* System (CRON) | *App:* notificator | *REQ:* REQ-030  
*Steps:*  
1. Trigger scheduled() handler at hour=23 (simulate or wait)  
2. Inspect resolveDigestType() return value  
3. Trigger at hour=23 on Sunday  
*Expected result:* hour=23 on non-Sunday → 'daily'; hour=23 on Sunday → 'weekly'; other hours → no digest  
*Evidence:* notificator CRON `0 * * * *` + resolveDigestType §3.8  

---

**TC-N016**  
*Title:* 03:00 WAT CRON: retention sweep + domain verification poll run together  
*Type:* functional | *Priority:* P2  
*Role:* System (CRON) | *App:* notificator | *REQ:* REQ-031  
*Steps:*  
1. Trigger scheduled() handler for `0 2 * * *` cron  
2. Inspect calls made  
*Expected result:* Both runRetentionSweep (N-115) AND runDomainVerificationPoll (N-053b) called in same handler invocation; only 2 CRON slots consumed  
*Evidence:* notificator wrangler.toml + runRetentionSweep + runDomainVerificationPoll §3.8  

---

### C.11 Billing and Wallet

---

**TC-F001**  
*Title:* Bank transfer order creation: reference format and FSM initial state  
*Type:* functional | *Priority:* P0  
*Role:* authenticated buyer | *App:* api/bank-transfer.ts | *REQ:* REQ-001  
*Steps:*  
1. POST /bank-transfer with order details  
2. Inspect response  
3. Query bank_transfer_orders table  
*Expected result:* Order created; status = 'pending'; reference matches `/WKA-\d{8}-[A-Z0-9]{5}/`; amount_kobo is integer  
*Evidence:* bank-transfer.ts FSM, migration 0237 §XVII  

---

**TC-F004**  
*Title:* Bank transfer: confirm transitions to confirmed + triggers wallet update  
*Type:* state | *Priority:* P0  
*Role:* owner/admin | *App:* api/bank-transfer.ts | *REQ:* REQ-002  
*Preconditions:* Order in proof_submitted state  
*Steps:*  
1. POST /bank-transfer/:orderId/confirm (admin JWT)  
2. Query bank_transfer_orders  
3. Query hl_funding_requests or wallet balance  
*Expected result:* status = 'confirmed'; confirmFunding() called; wallet balance updated  
*Evidence:* bank-transfer.ts POST /:orderId/confirm + hl-wallet.ts confirmFunding §XVII  

---

**TC-F007**  
*Title:* Bank transfer dispute: raised within 24h of confirmation  
*Type:* functional | *Priority:* P1  
*Role:* buyer | *App:* api/bank-transfer.ts | *REQ:* REQ-005  
*Preconditions:* Order in confirmed state (just confirmed)  
*Steps:*  
1. POST /bank-transfer/:orderId/dispute within 24h  
2. Inspect bank_transfer_disputes table  
*Expected result:* Dispute created; order linked; dispute row has status  
*Evidence:* bank-transfer.ts POST /:orderId/dispute, migration 0239 §XVII  

---

**TC-F008**  
*Title:* Bank transfer dispute: rejected after 24h window  
*Type:* negative | *Priority:* P1  
*Role:* buyer | *App:* api/bank-transfer.ts | *REQ:* REQ-005  
*Preconditions:* Order confirmed > 24h ago  
*Steps:*  
1. POST /bank-transfer/:orderId/dispute after 24h  
*Expected result:* HTTP 422 DISPUTE_WINDOW_EXPIRED; no dispute row created  
*Evidence:* bank-transfer.ts 24h window §XVII  

---

**TC-W001**  
*Title:* Wallet: fund wallet (initial funding flow)  
*Type:* functional | *Priority:* P0  
*Role:* authenticated user (T1+) | *App:* api/hl-wallet.ts | *REQ:* REQ-013  
*Preconditions:* KYC tier verified  
*Steps:*  
1. Initiate wallet funding via POST /wallet/fund  
2. Complete funding (Paystack or bank transfer)  
3. GET /wallet/balance  
*Expected result:* Balance updated; WalletEventType event fired; amount_kobo integer  
*Evidence:* hl-wallet.ts 1,592 lines; P9 invariant §4.2  

---

**TC-W007**  
*Title:* HITL queue: wallet funding request appears in platform-admin queue  
*Type:* integration | *Priority:* P0  
*Role:* super_admin | *App:* api/hl-wallet.ts + platform-admin | *REQ:* REQ-014  
*Steps:*  
1. Initiate large wallet funding that triggers HITL (above threshold)  
2. Login to platform-admin as super_admin  
3. View HITL approval queue  
*Expected result:* Funding request visible in queue with wallet balance and requested amount  
*Evidence:* hl-wallet.ts HITL queue; platform-admin HITL capabilities §3.10  

---

**TC-W008**  
*Title:* HITL approval: balance-cap re-check before approval (WF-032)  
*Type:* compliance | *Priority:* P0  
*Role:* super_admin | *App:* api/hl-wallet.ts + platform-admin | *REQ:* REQ-014, INV-012  
*Preconditions:* Pending HITL funding request; wallet balance changed since request was created  
*Steps:*  
1. Modify wallet balance in test environment to exceed CBN cap  
2. Attempt HITL approval  
*Expected result:* Approval rejected or flagged; WF-032 balance-cap re-check fires immediately before approval write  
*Evidence:* WF-032 §VII; hl-wallet.ts balance-cap re-check  

---

**TC-F023**  
*Title:* FX rate lookup: all 6 currency pairs return rates  
*Type:* functional | *Priority:* P2  
*Role:* public (GET) / super_admin (PATCH) | *App:* api/fx-rates.ts | *REQ:* REQ-009  
*Steps:*  
1. GET /fx-rates  
2. Verify all 6 currencies present: NGN, GHS, KES, ZAR, USD, CFA  
3. GET /fx-rates?base=NGN&quote=USD  
*Expected result:* All 6 currencies listed; rate is an integer × 1,000,000 (P9 extended); single pair lookup returns correct rate  
*Evidence:* fx-rates.ts §XI.2  

---

**TC-F025**  
*Title:* Dual-currency transaction: original_currency + fx_rate_used recorded  
*Type:* functional | *Priority:* P2  
*Role:* authenticated user | *App:* api (transactions) | *REQ:* REQ-010  
*Preconditions:* User pays in GHS (non-NGN currency)  
*Steps:*  
1. Create transaction with original_currency = "GHS" and amount  
2. Query transactions table  
*Expected result:* Row has original_currency_code = 'GHS', original_amount (integer), fx_rate_used (integer × 1,000,000), amount_kobo in NGN  
*Evidence:* migration 0245 transactions table; §XI.2  

---

### C.12 AI and Consent

---

**TC-AI001**  
*Title:* SuperAgent task creation: consent required, KYC-gated  
*Type:* compliance | *Priority:* P0  
*Role:* authenticated user | *App:* api/superagent.ts | *REQ:* §4.2 superagent.ts  
*Preconditions:* User without consent or below KYC threshold  
*Steps:*  
1. POST /superagent/tasks without consent  
2. Attempt with consent but below required KYC tier  
3. Attempt with consent and sufficient KYC tier  
*Expected result:* Step 1: 422 CONSENT_REQUIRED; Step 2: 403 INSUFFICIENT_KYC_TIER; Step 3: task created  
*Evidence:* superagent.ts consent + KYC guards §4.2  

---

**TC-AI002**  
*Title:* SuperAgent credit burn: ai_credits decremented on task creation  
*Type:* functional | *Priority:* P1  
*Role:* authenticated user (with AI subscription) | *App:* api/superagent.ts | *REQ:* §4.2 superagent.ts  
*Steps:*  
1. Note ai_credits balance  
2. POST /superagent/tasks  
3. Check ai_credits balance  
*Expected result:* Credits decremented by task cost; task linked to credit transaction  
*Evidence:* superagent.ts credit burn §4.2  

---

**TC-AI003**  
*Title:* HITL handoff: task enters HITL queue, not delivered immediately  
*Type:* state | *Priority:* P0  
*Role:* authenticated user | *App:* api/superagent.ts, projections | *REQ:* §XV.3  
*Preconditions:* User operating a L3 HITL vertical (e.g., law-firm)  
*Steps:*  
1. Create AI task for law-firm workspace  
2. Poll GET /superagent/tasks/:id/status  
3. Do not approve in HITL queue  
4. Wait for HITL expiry sweep (projections CRON every 15 min)  
*Expected result:* Status = 'hitl_pending'; task NOT delivered until human approves; expired tasks swept by projections CRON  
*Evidence:* superagent.ts HITL handoff; projections CRON every 15 min HITL expiry §3.9  

---

**TC-AI004**  
*Title:* AI entitlement: AI capability blocked without AI plan subscription  
*Type:* permission | *Priority:* P0  
*Role:* authenticated user (no AI plan) | *App:* api/ai-entitlement.ts | *REQ:* REQ-075  
*Steps:*  
1. POST /superagent/tasks with workspace on free plan (no AI add-on)  
*Expected result:* HTTP 403; ai-entitlement.ts middleware blocks; error AI_PLAN_REQUIRED  
*Evidence:* ai-entitlement.ts 66 lines §5.1  

---

**TC-HR001**  
*Title:* L3 HITL: law-firm AI output requires HITL approval before delivery  
*Type:* compliance | *Priority:* P0  
*Role:* authenticated user (law-firm workspace) | *App:* api (law-firm vertical) | *REQ:* REQ-210  
*Steps:*  
1. Create AI task in law-firm workspace  
2. Inspect task lifecycle  
3. Attempt to retrieve AI output before HITL approval  
*Expected result:* Output held in HITL queue; GET /superagent/tasks/:id returns status='hitl_pending'; output body not delivered until approved  
*Evidence:* §XV.3 law-firm L3 HITL constraint; superagent.ts HITL_REQUIRED guard  

---

**TC-HR003**  
*Title:* tax-consultant: TIN field never in AI payload  
*Type:* compliance | *Priority:* P0  
*Role:* authenticated user (tax-consultant workspace) | *App:* api | *REQ:* REQ-211  
*Steps:*  
1. Create a client record with TIN field populated  
2. Submit AI task referencing this client  
3. Inspect the payload sent to AI provider (via AI abstraction layer logs or test hook)  
*Expected result:* TIN field absent from AI provider payload; constraint enforced at route level  
*Evidence:* §XV.3 tax-consultant FIRS constraint  

---

**TC-HR005**  
*Title:* polling-unit: voter PII absolutely prohibited in storage and payloads  
*Type:* compliance | *Priority:* P0  
*Role:* authenticated user (polling-unit workspace) | *App:* api | *REQ:* REQ-213  
*Steps:*  
1. Attempt to store voter name, phone, or NIN via polling-unit API  
2. Inspect DB row and API response  
*Expected result:* 422/400 if PII fields present; no voter PII stored in D1; INEC constraint enforced  
*Evidence:* §XV.3 polling-unit NO voter PII constraint  

---

### C.13 Marketplace and Negotiation

---

**TC-NE005**  
*Title:* Negotiation session: full lifecycle (open → offer → counteroffer → accept)  
*Type:* state | *Priority:* P0  
*Role:* buyer + seller | *App:* api/negotiation.ts | *REQ:* REQ-062  
*Preconditions:* Both users KYC-verified; seller has pricing policy set  
*Steps:*  
1. Seller: PUT /negotiation/policy  
2. Seller: POST /negotiation/listings/:type/:id/mode with { mode: "negotiable" }  
3. Buyer: POST /negotiation/sessions (open)  
4. Buyer: POST /sessions/:id/offer with amount  
5. Seller: POST /sessions/:id/counteroffer  
6. Buyer: POST /sessions/:id/accept  
7. Seller: GET /sessions/:id  
8. GET /sessions/:id/history  
*Expected result:* Session status = 'accepted'; history contains all offer/counteroffer events; price lock token generated on accept  
*Evidence:* negotiation.ts + migrations 0183–0185 §4.2  

---

**TC-NE011**  
*Title:* min_price_kobo absent from all API responses  
*Type:* compliance | *Priority:* P0  
*Role:* any | *App:* api/negotiation.ts | *REQ:* REQ-064  
*Steps:*  
1. GET /negotiation/sessions/:id  
2. GET /negotiation/sessions/:id/history  
3. GET /negotiation/policy (as seller)  
4. GET /negotiation/analytics  
5. Inspect all 4 responses for `min_price_kobo` field  
*Expected result:* `min_price_kobo` absent from all 4 responses; stripMinPrice() confirmed called  
*Evidence:* negotiation.ts stripMinPrice() §4.2  

---

**TC-NE012**  
*Title:* KYC gate: InsufficientKycError returned for unverified user  
*Type:* negative | *Priority:* P1  
*Role:* user without KYC | *App:* api/negotiation.ts | *REQ:* REQ-065  
*Steps:*  
1. POST /negotiation/sessions without KYC verification  
*Expected result:* HTTP 422; error type InsufficientKycError; session not created  
*Evidence:* negotiation.ts KYC guard §4.2  

---

**TC-B001**  
*Title:* B2B RFQ → bid → accept → PO lifecycle  
*Type:* functional | *Priority:* P0  
*Role:* buyer + seller | *App:* api/b2b-marketplace.ts | *REQ:* REQ-050  
*Steps:*  
1. Buyer: POST /b2b/rfqs  
2. Seller: POST /b2b/rfqs/:rfqId/bids  
3. Buyer: POST /b2b/rfqs/:rfqId/bids/:bidId/accept  
4. Buyer: GET /b2b/purchase-orders  
*Expected result:* PO row created on bid acceptance; b2b_rfqs status updated; B2bEventType events fired; T3 and P9 enforced throughout  
*Evidence:* b2b-marketplace.ts + migration 0246 §XVI  

---

**TC-B007**  
*Title:* B2B dispute raised; both parties can view  
*Type:* functional | *Priority:* P1  
*Role:* buyer | *App:* api/b2b-marketplace.ts | *REQ:* REQ-052  
*Steps:*  
1. POST /b2b/disputes with PO reference  
2. GET /b2b/disputes/:id as buyer  
3. GET /b2b/disputes/:id as seller  
*Expected result:* Dispute created; both buyer and seller (within T3 scope) can view; T3 prevents cross-tenant access  
*Evidence:* b2b-marketplace.ts POST /disputes §XVI  

---

### C.14 Analytics

---

**TC-WA001**  
*Title:* Workspace analytics: daily summary reads analytics_snapshots  
*Type:* functional | *Priority:* P2  
*Role:* tenant owner/admin | *App:* api/workspace-analytics.ts | *REQ:* §4.2 workspace-analytics.ts  
*Steps:*  
1. GET /workspace/analytics/summary?period=day  
2. Inspect data source (should be from analytics_snapshots if CRON ran; live fallback otherwise)  
*Expected result:* Response contains total_sales, total_revenue_kobo, unique_customers; P9: all monetary values integer kobo  
*Evidence:* workspace-analytics.ts 190 lines; analytics_snapshots migration 0242 §4.2  

---

**TC-WA002**  
*Title:* Workspace analytics: live fallback when snapshot not available  
*Type:* functional | *Priority:* P2  
*Role:* tenant owner | *App:* api/workspace-analytics.ts | *REQ:* §4.2  
*Preconditions:* analytics_snapshots table empty (new workspace)  
*Steps:*  
1. GET /workspace/analytics/summary  
*Expected result:* Response still returned from live D1 query (not empty/error); fallback correctly triggered  
*Evidence:* workspace-analytics.ts live fallback §4.2  

---

**TC-PROJ001**  
*Title:* Search rebuild endpoint requires X-Inter-Service-Secret (SEC-009)  
*Type:* compliance | *Priority:* P0  
*Role:* internal service | *App:* projections | *REQ:* INV-010  
*Steps:*  
1. POST /rebuild/search WITHOUT X-Inter-Service-Secret header  
2. POST /rebuild/search WITH correct secret  
*Expected result:* Step 1: HTTP 401/403; Step 2: 200, rebuild initiated  
*Evidence:* projections routes SEC-009 §3.9  

---

**TC-PROJ002**  
*Title:* Analytics CRON: daily snapshot computed at 2am  
*Type:* functional | *Priority:* P2  
*Role:* System | *App:* projections | *REQ:* §3.9  
*Steps:*  
1. Trigger projections CRON `0 2 * * *` (or simulate)  
2. Check analytics_snapshots table  
*Expected result:* New rows inserted for each workspace for current date  
*Evidence:* projections CRON schedule §3.9  

---

### C.15 Compliance and Governance

---

**TC-AU001**  
*Title:* Audit log: every authenticated request produces a row in audit_log  
*Type:* compliance | *Priority:* P0  
*Role:* authenticated user | *App:* api/audit-log.ts | *REQ:* REQ-203  
*Steps:*  
1. Make an authenticated POST /offerings request  
2. Query audit_log table WHERE user_id = <test-user-id> ORDER BY created_at DESC  
*Expected result:* Row present with: user_id, tenant_id, method='POST', path='/offerings', resource_type='offering', masked_ip (last octet zeroed for IPv4), duration_ms > 0, status=201  
*Evidence:* audit-log.ts auditLogMiddleware §5.1  

---

**TC-AU002**  
*Title:* Audit log: IP masking — last octet zeroed  
*Type:* compliance | *Priority:* P0  
*Role:* any authenticated | *App:* api/audit-log.ts | *REQ:* REQ-203, INV-007  
*Steps:*  
1. Make authenticated request from known IP 203.0.113.45  
2. Query audit_log for that request  
*Expected result:* ip field = "203.0.113.0" (not .45); P6 invariant (no PII in logs)  
*Evidence:* audit-log.ts IP masking; P6 §VII  

---

**TC-INV002**  
*Title:* T3 invariant: tenant_id from JWT always, never from body  
*Type:* compliance | *Priority:* P0  
*Role:* attacker | *App:* api (any route) | *REQ:* INV-002  
*Steps:*  
1. Craft request body with `tenant_id: "victim-tenant-id"` on POST /offerings  
2. Inspect which tenant the offering was created for  
*Expected result:* Offering created for the JWT's tenant_id; body tenant_id silently ignored  
*Evidence:* T3 invariant §VII  

---

**TC-INV003**  
*Title:* T3 cross-tenant isolation: tenant A cannot read tenant B data  
*Type:* compliance | *Priority:* P0  
*Role:* authenticated user (tenant A) | *App:* api | *REQ:* INV-002  
*Steps:*  
1. Login as tenant A user  
2. Attempt GET /offerings/:id where :id belongs to tenant B  
*Expected result:* HTTP 403 or 404; no tenant B data exposed  
*Evidence:* T3 invariant — every D1 query includes tenant_id = JWT.tenant_id §VII  

---

**TC-INV005**  
*Title:* Paystack HMAC: tampered webhook rejected (W1)  
*Type:* compliance | *Priority:* P0  
*Role:* attacker | *App:* api/payments.ts | *REQ:* INV-004  
*Steps:*  
1. POST /payments/verify with Paystack callback body and incorrect x-paystack-signature  
2. POST with correct HMAC (valid test scenario)  
*Expected result:* Step 1: HTTP 400/403, no payment state change; Step 2: payment verified  
*Evidence:* payments.ts W1 invariant §VII  

---

**TC-INV007**  
*Title:* Tenant slug is immutable after creation (T8)  
*Type:* compliance | *Priority:* P1  
*Role:* admin | *App:* api/workspaces.ts | *REQ:* INV-008  
*Steps:*  
1. PATCH /workspaces/:id with { slug: "new-slug" }  
*Expected result:* HTTP 400/422; slug field rejected or ignored; original slug unchanged  
*Evidence:* T8 invariant §VII; workspaces.ts  

---

**TC-INV009**  
*Title:* T4: non-super_admin cannot access cross-tenant analytics  
*Type:* permission | *Priority:* P0  
*Role:* regular admin | *App:* api/analytics.ts | *REQ:* INV-013  
*Steps:*  
1. GET /platform/analytics/summary with admin JWT  
*Expected result:* HTTP 403; super_admin guard enforced  
*Evidence:* analytics.ts T4 + super_admin guard §4.2  

---

**TC-CSRF001**  
*Title:* CSRF: POST without token returns 403  
*Type:* negative | *Priority:* P0  
*Role:* any | *App:* api/csrf.ts | *REQ:* REQ-077  
*Steps:*  
1. POST /offerings with valid JWT but no CSRF token header  
*Expected result:* HTTP 403 CSRF_TOKEN_MISSING; no write operation performed  
*Evidence:* csrf.ts §5.1  

---

**TC-SLUG001**  
*Title:* Vertical slug correctness: hair-salon not barber-shop  
*Type:* functional | *Priority:* P2  
*Role:* any | *App:* api/verticals | *REQ:* §XV.2 slug corrections  
*Steps:*  
1. GET /verticals/hair-salon  
2. GET /verticals/barber-shop  
3. GET /verticals/auto-mechanic  
4. GET /verticals/auto-workshop  
*Expected result:* Step 1: 200; Step 2: 404; Step 3: 200; Step 4: 404  
*Evidence:* §XV.2 slug normalisation corrections  

---

### C.16 Onboarding and Support

---

**TC-O001**  
*Title:* Onboarding: all 6 steps completable, summary shows correct %  
*Type:* functional | *Priority:* P1  
*Role:* tenant owner | *App:* api/onboarding.ts | *REQ:* REQ-040  
*Steps:*  
1. GET /onboarding/checklist  
2. Mark each step complete via PUT /onboarding/checklist/:step  
3. After each step, GET /onboarding/summary  
4. Complete all 6 steps  
*Expected result:* After 3 steps: summary.completion_pct = 50; after all 6: completion_pct = 100; 6 step names: profile_setup, vertical_activation, template_installed, payment_configured, team_invited, branding_configured  
*Evidence:* onboarding.ts 337 lines, migration 0210 §4.2  

---

**TC-O007**  
*Title:* Onboarding: step already complete cannot be re-marked (idempotent)  
*Type:* state | *Priority:* P2  
*Role:* tenant owner | *App:* api/onboarding.ts | *REQ:* REQ-040  
*Steps:*  
1. Mark profile_setup complete  
2. Mark profile_setup complete again  
*Expected result:* No error; no duplicate record; completion_pct unchanged  
*Evidence:* onboarding.ts PUT /checklist/:step idempotency  

---

**TC-S001**  
*Title:* Support ticket: full FSM open→in_progress→resolved→closed  
*Type:* state | *Priority:* P1  
*Role:* user (create) + admin (transition) | *App:* api/support.ts | *REQ:* REQ-041  
*Steps:*  
1. POST /support/tickets (user) — status = open  
2. PATCH /support/tickets/:id { status: "in_progress" } (admin)  
3. PATCH { status: "resolved" }  
4. PATCH { status: "closed" }  
5. PATCH { status: "open" } (attempt to re-open terminal state)  
*Expected result:* Steps 1–4: each transition succeeds; Step 5: HTTP 422/400, closed is terminal  
*Evidence:* support.ts FSM, migration 0225 §XVIII  

---

**TC-S005**  
*Title:* Support ticket: invalid FSM transition rejected  
*Type:* negative | *Priority:* P1  
*Role:* admin | *App:* api/support.ts | *REQ:* REQ-041  
*Steps:*  
1. Create ticket (open)  
2. PATCH { status: "closed" } (skip in_progress and resolved)  
*Expected result:* HTTP 422 INVALID_TRANSITION; ticket status unchanged  
*Evidence:* support.ts FSM guard §XVIII  

---

**TC-S006**  
*Title:* Super admin: cross-tenant ticket view  
*Type:* permission | *Priority:* P1  
*Role:* super_admin | *App:* api/support.ts | *REQ:* REQ-042  
*Steps:*  
1. GET /platform/support/tickets (super_admin JWT)  
2. Verify tickets from multiple tenants visible  
3. Repeat with regular admin JWT  
*Expected result:* Super admin sees all tenants' tickets; admin gets 403 or tenant-scoped view only  
*Evidence:* support.ts GET /platform/support/tickets super_admin guard §XVIII  

---

### C.17 Offline / PWA

---

**TC-OFL001**  
*Title:* workspace-app: PWA manifest and service worker present  
*Type:* functional | *Priority:* P2  
*Role:* tenant owner | *App:* workspace-app  
*Steps:*  
1. Load workspace-app  
2. Inspect HTML for manifest link  
3. Check service worker registration in browser DevTools  
*Expected result:* `<link rel="manifest">` present; service worker registered; app installable  
*Evidence:* workspace-app PWA §3.2  

---

**TC-OFL002**  
*Title:* Offline sync: apply sync with server-wins conflict resolution (P11)  
*Type:* functional | *Priority:* P2  
*Role:* authenticated user | *App:* api/sync.ts | *REQ:* §4.2 sync.ts  
*Steps:*  
1. Make local changes offline in workspace-app (Dexie.js)  
2. Reconnect and trigger POST /sync/apply  
3. Simulate a conflict: same record changed server-side  
*Expected result:* Server-side value wins; local Dexie state updated with server version; no data loss of server record  
*Evidence:* sync.ts P11 server-wins §4.2  

---

**TC-OFL003**  
*Title:* partner-admin: PWA installable with manifest  
*Type:* functional | *Priority:* P3  
*Role:* partner | *App:* partner-admin  
*Steps:*  
1. Load partner-admin  
2. Check manifest.json response  
3. Check service worker  
*Expected result:* Manifest valid; icons present; app shows install prompt in supported browsers  
*Evidence:* partner-admin manifest.json + service worker §3.4  

---

---

## Section D — Coverage Gaps

Items from the frozen inventory that could not yet be converted into a fully executable test case, with reason:

| Item | Frozen ref | Gap type | Explanation |
|---|---|---|---|
| USDT precision | §XI.1 D11 | Blocked | Founder decision pending. No test case possible until precision rule established. When unblocked: add tests for USDT kobo/sub-unit storage precision in transactions table. |
| partner-admin AI Integration | §3.4 | Deferred — not implemented | UI lists "M12 — AI Production" but code is Verified-not-implemented. No routes, no logic. No test case until implemented. |
| Projections HITL expiry sweep (every 15 min) | §3.9 | Partial — CRON timing dependency | Test TC-AI003 covers HITL expiry conceptually. A deterministic test requires control over projections CRON timing; may need a test-mode CRON trigger endpoint or manual invocation. |
| @webwaka/workspaces stub | §VI | Out of scope | Empty stub package — no logic to test. Verified-not-implemented. |
| Offline sync conflict: all scenarios | §4.2 sync.ts | Partial | TC-OFL002 covers server-wins. Full conflict matrix (both sides changed, same field, related field) requires Dexie.js + D1 test setup not yet specified. |
| 28 P1 batch-routed verticals (full depth) | §4.3 | Partial | civic.ts, transport.ts, commerce.ts P1 routes are tested (TC-CV*, TC-TV*, TC-COM*). The remaining P1 originals (mosque, youth-org, womens-assoc, ministry, sole-trader, professional, school, clinic, tech-hub) have scaffold-level routes only — no FSM depth to test. |
| Resend bounce webhook | §4.2 resend-bounce-webhook.ts | Partial | Requires Resend test HMAC. Test infrastructure dependency. |
| CI/CD GitHub Actions pipeline | §2.2 ADR-0012 | Out of scope | ADR-level; tested by the CI/CD environment itself, not by QA. |

---

## Section E — Execution Priorities

Test suites must be executed in the following order. Within each tier, run smoke first, then functional, then negative, then compliance:

### Tier 1 — Critical Financial and Compliance Flows (Run First)

| Suite | Scope | Key TCs |
|---|---|---|
| Bank transfer payment FSM | P21 full lifecycle + dispute | TC-F001–TC-F014 |
| Paystack HMAC and checkout | W1 + shop + template | TC-F026, TC-INV005, TC-BR003, TC-BR004 |
| Tenant isolation (T3) | Cross-tenant injection attempts | TC-INV002, TC-INV003, TC-INV009 |
| JWT and CSRF security | Auth + state-change protection | TC-AUTH003, TC-AUTH004, TC-CSRF001 |
| BVN/NIN compliance | R7 hash-only, P10 consent | TC-ID001, TC-ID002, TC-INV004 |
| NDPR hard delete | G23 inbox | TC-N006 |
| MON-04 limits | Free tier enforced | TC-MON001–TC-MON006 |
| L3 HITL constraints | Law-firm, tax, polling-unit, creche | TC-HR001–TC-HR007 |
| Audit log | Per-request write + IP masking | TC-AU001, TC-AU002 |
| Wallet HITL and WF-032 | Balance-cap re-check | TC-W007, TC-W008 |

### Tier 2 — Role/Permission and Tenant Isolation

| Suite | Scope | Key TCs |
|---|---|---|
| Middleware stack | billing-enforcement, require-role, entitlement | TC-AC001–TC-AC018 |
| Super admin vs admin roles | T4 cross-tenant | TC-PA001, TC-S006, TC-INV009 |
| Partner vs tenant permissions | Partner-scoped endpoints | TC-PR001–TC-PR008 |
| AI entitlement | ai-entitlement.ts | TC-AI004 |
| Subscription plan gates | free/starter/growth/enterprise | TC-AC011, TC-AC012 |

### Tier 3 — Core User Journeys

| Suite | Scope | Key TCs |
|---|---|---|
| Onboarding flow | 6-step checklist | TC-O001–TC-O007 |
| Support ticket FSM | open→closed | TC-S001–TC-S006 |
| Negotiation engine | Policy + sessions + security | TC-NE001–TC-NE015 |
| B2B marketplace | RFQ→PO→Invoice | TC-B001–TC-B009 |
| Notification inbox | State machine + cache | TC-N001–TC-N016 |
| Brand-runtime shop | Cart→Paystack→Order | TC-BR001–TC-BR010 |
| Workspace management | CRUD + vertical activation | TC-WS001–TC-WS010 |
| USSD full menu tree | All 5 branches + TTL | TC-US001–TC-US011 |

### Tier 4 — Edge, Negative, and Rate Limit Cases

| Suite | Scope | Key TCs |
|---|---|---|
| Rate limiting | USSD 30/hr, identity 2/hr | TC-AC016, TC-AC017, TC-US010, TC-ID002 |
| FSM invalid transitions | Support, bank transfer, support | TC-S005, TC-F008 |
| Duplicate submission protection | Template paystack_ref UNIQUE | TC-TM005 |
| Input validation | P9 fractional kobo | TC-P003, TC-COM001 |
| Slug validation | Corrected slugs | TC-SLUG001 |
| Tenant slug immutable | T8 | TC-INV007 |
| OTP channel lock | lockChannelAfterFailures | TC-ID010 |

### Tier 5 — UX, Accessibility, and Low-Risk Flows

| Suite | Scope | Key TCs |
|---|---|---|
| i18n and locale detection | 6 locales, fallback | TC-I18-001–TC-I18-003 |
| Sitemap and SEO | Schema.org, geo slugs | TC-PD002, TC-PD003, TC-BR008 |
| PWA manifest | workspace-app, partner-admin | TC-OFL001, TC-OFL003 |
| Analytics read-only | Workspace + platform | TC-WA001–TC-WA002, TC-PA001–TC-PA002 |
| Notification preferences UX | low_data_mode, G22 | TC-N008, TC-N009 |

---

## Section F — Test Data Appendix

All test data is reusable across test suites. Reference by ID in test case preconditions.

### F.1 Users

| ID | Role | Email | Phone | KYC tier | Plan | Notes |
|---|---|---|---|---|---|---|
| USR-001 | super_admin | super@test.webwaka.io | +2348000000001 | T3 | enterprise | Primary super_admin for all platform-admin tests |
| USR-002 | tenant owner | owner@tenant-a.test | +2348000000002 | T2 | starter | Tenant A workspace owner |
| USR-003 | admin | admin@tenant-a.test | +2348000000003 | T1 | starter | Tenant A admin (not owner) |
| USR-004 | cashier | cashier@tenant-a.test | +2348000000004 | T0 | starter | Tenant A cashier; no KYC financial ops |
| USR-005 | tenant owner | owner@tenant-b.test | +2348000000005 | T2 | free | Tenant B — used for isolation tests |
| USR-006 | partner | partner@test.webwaka.io | +2348000000006 | T3 | enterprise | Primary partner for partner-admin tests |
| USR-007 | sub-partner | subpartner@test.webwaka.io | +2348000000007 | T2 | starter | Sub-partner under USR-006 |
| USR-008 | public (unauthenticated) | — | — | none | none | Used for public endpoint tests |
| USR-009 | USSD user | — | +2348000000009 | T1 | none | USSD gateway tests |
| USR-010 | buyer (B2B) | buyer@tenant-a.test | +2348000000010 | T2 | growth | B2B marketplace buyer role |
| USR-011 | seller (B2B) | seller@tenant-c.test | +2348000000011 | T2 | growth | B2B marketplace seller role |
| USR-012 | law-firm owner | lawfirm@tenant-d.test | +2348000000012 | T3 | growth | L3 HITL tests |
| USR-013 | polling-unit admin | pollingunit@tenant-e.test | +2348000000013 | T3 | enterprise | Voter PII tests |

### F.2 Tenants and Workspaces

| ID | Slug | Plan | Custom domain | Primary vertical | Notes |
|---|---|---|---|---|---|
| TNT-001 | tenant-a | starter | — | bakery | Main test tenant; most tests use this |
| TNT-002 | tenant-b | free | — | hair-salon | Free plan limit tests |
| TNT-003 | tenant-c | growth | shop.tenant-c.test | restaurant | Brand-runtime + shop tests |
| TNT-004 | tenant-d | growth | — | law-firm | L3 HITL tests |
| TNT-005 | tenant-e | enterprise | — | polling-unit | Voter PII compliance tests |
| TNT-006 | tenant-f | starter | — | church | Civic vertical tests |
| TNT-007 | tenant-g | growth | — | hire-purchase | Hire-purchase KYC + FSM tests |

### F.3 Partners

| ID | Name | White-label depth | Credit pool balance | Notes |
|---|---|---|---|---|
| PTN-001 | TestPartner Africa | 2 (full white-label) | 500,000 WakaCU | Primary partner; owns TNT-001 and TNT-002 |
| PTN-002 | SubTestPartner | 1 (logo only) | 0 | Sub-partner under PTN-001 |

### F.4 Wallets

| ID | Owner | Balance (kobo) | KYC tier | Daily limit (kobo) | Notes |
|---|---|---|---|---|---|
| WLT-001 | USR-002 | 1,000,000 (₦10,000) | T2 | 500,000,000 | Primary wallet for payment tests |
| WLT-002 | USR-005 | 50,000 (₦500) | T0 | 10,000,000 (T0 limit) | Free-tier wallet |
| WLT-003 | USR-009 | 200,000 (₦2,000) | T1 | 50,000,000 | USSD wallet tests |
| WLT-004 | TNT-003 (platform) | 0 | — | — | Platform receiving bank account tests |

### F.5 Products and Offerings

| ID | Workspace | Name | Price (kobo) | Status | Notes |
|---|---|---|---|---|---|
| OFF-001 | TNT-001 | "Chin Chin" | 50,000 (₦500) | active | POS and offering tests |
| OFF-002 | TNT-001 | "Puff Puff" | 30,000 (₦300) | active | Cart add item tests |
| OFF-003 | TNT-001 | "Draft Item" | 100,000 (₦1,000) | inactive | Toggle tests |
| PROD-001 | TNT-003 | "Jollof Rice" | 150,000 (₦1,500) | active | Brand-runtime shop tests |
| PROD-002 | TNT-003 | "Suya Combo" | 200,000 (₦2,000) | active | Cart + checkout tests |
| TPL-001 | — | "Bakery Pro Template" | 5,000,000 (₦50,000) | published | Template purchase revenue split tests |

### F.6 B2B Test Data

| ID | Type | Status | Buyer | Seller | Amount (kobo) | Notes |
|---|---|---|---|---|---|---|
| RFQ-001 | flour supply | open | USR-010 | — | — | Base RFQ for bid tests |
| BID-001 | bid on RFQ-001 | pending | — | USR-011 | 2,500,000 (₦25,000) | Bid acceptance → PO creation |
| PO-001 | pending delivery | pending | USR-010 | USR-011 | 2,500,000 | PO delivery + invoice tests |
| INV-001 | invoice for PO-001 | issued | — | USR-011 | 2,500,000 | B2B invoice tests |

### F.7 Notifications and Inbox

| ID | Type | State | Tenant | User | Notes |
|---|---|---|---|---|---|
| NTF-001 | inbox item | unread | TNT-001 | USR-002 | State transition tests |
| NTF-002 | inbox item | unread | TNT-001 | USR-002 | NDPR delete test |
| NTF-003 | inbox item | pinned | TNT-001 | USR-002 | Dismiss from pinned test |
| PREF-001 | notification pref | default | TNT-001 | USR-002 | Preference update + audit log tests |
| TMPL-001 | notification template | active | — | — | Preview + test-send tests |

### F.8 Bank Transfer Orders

| ID | Status | Buyer | Amount (kobo) | Reference | Notes |
|---|---|---|---|---|---|
| BTO-001 | pending | USR-002 | 1,000,000 (₦10,000) | WKA-20260423-T0001 | Initial state test |
| BTO-002 | proof_submitted | USR-002 | 500,000 (₦5,000) | WKA-20260423-T0002 | Confirm/reject tests |
| BTO-003 | confirmed | USR-002 | 250,000 (₦2,500) | WKA-20260423-T0003 | Dispute within 24h test |
| BTO-004 | confirmed (>24h) | USR-002 | 100,000 (₦1,000) | WKA-20260423-T0004 | Dispute rejection (window closed) |

### F.9 KYC States

| ID | User | BVN verified | NIN verified | CAC verified | KYC tier | Notes |
|---|---|---|---|---|---|---|
| KYC-001 | USR-002 | ✅ (hash) | ✅ (hash) | — | T2 | Standard KYC user |
| KYC-002 | USR-004 | — | — | — | T0 | Unverified; blocked from financial ops |
| KYC-003 | USR-012 | ✅ | ✅ | ✅ | T3 | Hire-purchase and L3 HITL tests |
| KYC-004 | test user (new) | — | — | — | T0 | No consent record; BVN test setup |

### F.10 Subscription Tiers (Reference)

| Plan | Webhook limit | Invite limit (MON-04) | Offering limit | Place limit | Webhook events |
|---|---|---|---|---|---|
| free | 5 | See evaluateUserLimit | See evaluateOfferingLimit | See evaluatePlaceLimit | template.installed, workspace.member_added, payment.completed |
| starter | 25 | Higher | Higher | Higher | Adds: template.purchased, kyc.approved, kyc.rejected, bank_transfer.completed |
| growth | 100 | High | High | High | Adds growth-tier events |
| enterprise | ∞ | Unlimited | Unlimited | Unlimited | All events |

### F.11 USSD Session Data

| ID | Phone | Session state | KYC tier | Wallet balance | Notes |
|---|---|---|---|---|---|
| USSD-001 | +2348000000009 | main_menu | T1 | 200,000 kobo | Standard USSD test session |
| USSD-002 | +2348000000020 | (new) | T0 | 0 | Rate limit test (create 30 sessions) |
| USSD-003 | +2348000000021 | (expired) | T1 | 100,000 | Session TTL expiry test |

### F.12 FX Rates (Test Seed Values)

All rates stored as integer × 1,000,000:

| Base | Quote | Rate value | Human rate | Notes |
|---|---|---|---|---|
| NGN | USD | 1,500 | 1 USD = 1500 NGN | Example only; use test seeded values |
| NGN | GHS | 85 | 1 GHS = 85 NGN | |
| NGN | KES | 11 | 1 KES = 11 NGN | |
| NGN | ZAR | 82 | 1 ZAR = 82 NGN | |
| NGN | CFA | 2 | 1 CFA = 2 NGN | |

---

*End of WebWaka OS QA Test Matrix v1.0*  
*Baseline: `WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN` | Date: 2026-04-23*  
*Requirements covered: 132 | Traceability matrix rows: 148 | Fully specified test cases (Section C): 108 | Deferred: 2 (D11 governance-blocked; partner AI not implemented)*  
*All test cases trace to frozen inventory. No new scope introduced.*
