# WebWaka OS — QA Execution Plan

**Version:** 1.0  
**Date:** 2026-04-23  
**Source document:** `WebWaka_OS_QA_Test_Matrix.md` v1.0 (frozen)  
**Baseline:** `WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN`  
**Status:** Approved for QA team execution

> **Rule:** This plan operationalizes the frozen QA matrix. It does not redefine scope, does not alter TC IDs or expected results, and does not change the frozen inventory. All TC references below link back to Section C of the matrix. Any gap found during execution is a bug against the frozen baseline — raise it as a defect, not a matrix change.

---

## Section 1 — Plan Overview

### 1.1 Purpose

The QA matrix defines *what* to test. This plan defines:

- **When** each test runs (cycle sequencing)
- **Who** executes each area (ownership model)
- **Where** each test runs (environment assignment)
- **How** tests are organised into repeatable cycles
- **What** constitutes pass/fail (release gates)
- **Which** tests are automation candidates vs manual-only
- **How** defects are triaged once found

### 1.2 Documents consumed (not modified)

| Document | Role in this plan |
|---|---|
| `WebWaka_OS_QA_Test_Matrix.md` v1.0 | Source of truth for all TC IDs, requirements, expected results, and test data seeds |
| `WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN` | Original frozen baseline; referenced for evidence on any disputed expected result |

### 1.3 What this plan does not do

- It does not create new test cases. Any new TC need goes back to the matrix owner first.
- It does not alter expected results. A failing test is a defect, not a matrix correction.
- It does not open new inventory scope. D11 (USDT precision) and partner-admin AI Integration remain deferred per the matrix's Section D.

### 1.4 Two deferred items (carried forward from matrix Section D, non-blocking)

| Item | Status | Action |
|---|---|---|
| D11 — USDT precision | Governance-blocked (founder decision pending) | Exclude from all cycles. Create a placeholder CYCLE-00 ticket. When founder decision is received, matrix owner writes TC; this plan adds TC to CYCLE-04 (compliance) and CYCLE-09 (regression). |
| partner-admin AI Integration | Verified-not-implemented (M12) | Exclude from all cycles. No code exists. When M12 ships, matrix owner writes TC; add to CYCLE-06 scope. |

---

## Section 2 — Test Environments

### 2.1 Required Environments

| Env ID | Name | Purpose | Cloudflare binding | Payment mode | Notification mode | Who provisions |
|---|---|---|---|---|---|---|
| ENV-01 | `staging` | Primary QA environment. All CYCLE-01 through CYCLE-08 run here first. | D1 staging databases; KV staging namespace; Queue staging binding | Paystack **test mode** (`sk_test_*`) | `NOTIFICATION_SANDBOX_MODE=true` (G24) | Platform/DevOps team |
| ENV-02 | `ussd-staging` | USSD gateway integration. Africa's Talking (AT) sandbox. | Same D1 as ENV-01; `USSD_SESSION_KV` staging namespace | N/A | N/A | Platform/DevOps team |
| ENV-03 | `local-d1` | Individual developer environment for component-level testing against local D1 replica | `wrangler d1 execute --local` | Paystack test mode | Sandbox always | Individual QA engineer |
| ENV-04 | `ci` | Automated test pipeline. Runs on every PR. CYCLE-01 (smoke) mandatory. | Ephemeral D1 per pipeline run | Paystack test mode | Sandbox always | CI/CD (GitHub Actions, ADR-0012) |
| ENV-05 | `uat` | User acceptance testing. Partner onboarding demos. Not for regression runs. | D1 UAT databases | Paystack test mode | Partial sandbox | Project lead |

### 2.2 Environment Constraints

| Constraint | Detail |
|---|---|
| `NOTIFICATION_SANDBOX_MODE=true` **must** be set in all non-production environments | Required by G24; verified by TC-N014 |
| `TENANT_ID` in ussd-gateway wrangler.toml **must** point to TNT-001 for USSD tests | T10 invariant — per-tenant USSD Workers |
| `WALLET_KV` staging binding must have `platform:payment:bank_account` seeded with test account before payment tests | Required for TC-PA004 |
| Paystack test keys must be rotated out of any ENV-04 CI logs | P6 — no PII/credentials in logs |
| `X-Inter-Service-Secret` must be seeded as Cloudflare secret in ENV-01 before any projections rebuild tests | SEC-009; required for TC-PROJ001 |

### 2.3 Environment Readiness Checklist (run before each cycle begins)

- [ ] D1 migrations applied: `wrangler d1 migrations apply --env staging` (all 383 migrations)
- [ ] Seed data applied (see Section 4)
- [ ] `NOTIFICATION_SANDBOX_MODE=true` confirmed in wrangler.toml [env.staging]
- [ ] Paystack test webhook URL points to staging API Worker
- [ ] Africa's Talking sandbox credentials present in ussd-gateway env (ENV-02)
- [ ] `X-Inter-Service-Secret` set as Cloudflare secret
- [ ] KV namespaces for rate limiting flushed (`wrangler kv:key delete --all`)
- [ ] At least one test admin-dashboard session active and template TMPL-001 seeded in registry

---

## Section 3 — Seed Data Setup

### 3.1 Seed Script Specification

The following seed data must be present in ENV-01 staging before any test cycle runs. These data IDs map directly to matrix Section F.

**Phase 1 — Users** (matrix §F.1)

Apply via `POST /auth/register` for each user or direct D1 INSERT. All passwords must be bcrypt-hashed (never plaintext in seed scripts — P6).

| Seed ID | Email | Phone | Role assignment | KYC tier | Plan | Dependencies |
|---|---|---|---|---|---|---|
| USR-001 | super@test.webwaka.io | +2348000000001 | super_admin (require-role.ts) | T3 | enterprise | Must exist before any platform-admin tests |
| USR-002 | owner@tenant-a.test | +2348000000002 | tenant owner of TNT-001 | T2 | starter | Must exist before offering, POS, wallet tests |
| USR-003 | admin@tenant-a.test | +2348000000003 | admin under TNT-001 | T1 | starter | Depends on TNT-001 |
| USR-004 | cashier@tenant-a.test | +2348000000004 | cashier under TNT-001 | T0 | starter | Depends on TNT-001 |
| USR-005 | owner@tenant-b.test | +2348000000005 | tenant owner of TNT-002 | T2 | free | Must exist before free-tier limit tests |
| USR-006 | partner@test.webwaka.io | +2348000000006 | partner (PTN-001) | T3 | enterprise | Must exist before partner-admin tests |
| USR-007 | subpartner@test.webwaka.io | +2348000000007 | sub-partner under PTN-001 | T2 | starter | Depends on PTN-001 |
| USR-008 | (no email) | (none) | public | none | none | No seed needed; represents anonymous requests |
| USR-009 | (USSD) | +2348000000009 | USSD session user | T1 | none | Register via auth before USSD tests |
| USR-010 | buyer@tenant-a.test | +2348000000010 | buyer under TNT-001 | T2 | growth | Depends on TNT-001 upgraded to growth |
| USR-011 | seller@tenant-c.test | +2348000000011 | seller under TNT-003 | T2 | growth | Depends on TNT-003 |
| USR-012 | lawfirm@tenant-d.test | +2348000000012 | tenant owner of TNT-004 | T3 | growth | Depends on TNT-004; needs law-firm vertical |
| USR-013 | pollingunit@tenant-e.test | +2348000000013 | admin under TNT-005 | T3 | enterprise | Depends on TNT-005; polling-unit vertical |

**Phase 2 — Tenants and workspaces** (matrix §F.2)

| Seed ID | Slug | Plan | Custom domain | Vertical activated | Notes |
|---|---|---|---|---|---|
| TNT-001 | tenant-a | starter | — | bakery, hair-salon | Main test tenant |
| TNT-002 | tenant-b | free | — | hair-salon | Free plan tests; offering/invite/place limit |
| TNT-003 | tenant-c | growth | shop.tenant-c.test | restaurant | Brand-runtime + shop + custom domain tests |
| TNT-004 | tenant-d | growth | — | law-firm | L3 HITL tests |
| TNT-005 | tenant-e | enterprise | — | polling-unit, government-agency | Voter PII + government KYC compliance |
| TNT-006 | tenant-f | starter | — | church, cooperative | Civic vertical tests |
| TNT-007 | tenant-g | growth | — | hire-purchase | hire-purchase FSM + CBN KYC tests |

**Phase 3 — Partners** (matrix §F.3)

| Seed ID | Record | WakaCU balance | White-label depth |
|---|---|---|---|
| PTN-001 | TestPartner Africa | 500,000 | 2 |
| PTN-002 | SubTestPartner (child of PTN-001) | 0 | 1 |

**Phase 4 — Financial state** (matrix §F.4 / F.8)

| Seed ID | Type | State | User | Amount (kobo) | Reference |
|---|---|---|---|---|---|
| WLT-001 | hl_wallet | balance: 1,000,000 | USR-002 | — | — |
| WLT-002 | hl_wallet | balance: 50,000 | USR-005 | — | — |
| WLT-003 | hl_wallet | balance: 200,000 | USR-009 | — | — |
| BTO-001 | bank_transfer_order | pending | USR-002 | 1,000,000 | WKA-20260423-T0001 |
| BTO-002 | bank_transfer_order | proof_submitted | USR-002 | 500,000 | WKA-20260423-T0002 |
| BTO-003 | bank_transfer_order | confirmed (< 24h) | USR-002 | 250,000 | WKA-20260423-T0003 |
| BTO-004 | bank_transfer_order | confirmed (> 24h) | USR-002 | 100,000 | WKA-20260423-T0004 |

> **BTO-004 note:** Seed confirmed_at timestamp as `NOW() - 25 hours` to ensure dispute window is closed.

**Phase 5 — Offerings, products, and templates** (matrix §F.5 / F.6)

| Seed ID | Type | Workspace | Name | Price (kobo) | Status |
|---|---|---|---|---|---|
| OFF-001 | offering | TNT-001 | Chin Chin | 50,000 | active |
| OFF-002 | offering | TNT-001 | Puff Puff | 30,000 | active |
| OFF-003 | offering | TNT-001 | Draft Item | 100,000 | inactive |
| PROD-001 | offering | TNT-003 | Jollof Rice | 150,000 | active |
| PROD-002 | offering | TNT-003 | Suya Combo | 200,000 | active |
| TPL-001 | template_registry | — | Bakery Pro Template | 5,000,000 | published |
| RFQ-001 | b2b_rfq | TNT-001 (buyer) | flour supply | — | open |
| BID-001 | b2b_bid | RFQ-001 | — | 2,500,000 | pending |
| PO-001 | purchase_order | RFQ-001 / BID-001 | — | 2,500,000 | pending delivery |

**Phase 6 — Notifications** (matrix §F.7)

| Seed ID | Type | State | User | Notes |
|---|---|---|---|---|
| NTF-001 | notification_inbox | unread | USR-002 | State transition tests |
| NTF-002 | notification_inbox | unread | USR-002 | NDPR delete test |
| NTF-003 | notification_inbox | pinned | USR-002 | Dismiss-from-pinned test |
| PREF-001 | notification_preferences | default | USR-002 | Preference update tests |
| TMPL-001 | notification template | active | (platform) | Template preview + test-send |

**Phase 7 — FX rates** (matrix §F.12)

Seed via `PATCH /fx-rates` (super_admin, USR-001) or direct D1 INSERT:

| Base | Quote | Stored value (rate × 1,000,000) |
|---|---|---|
| NGN | USD | 1,500,000,000 |
| NGN | GHS | 85,000,000 |
| NGN | KES | 11,000,000 |
| NGN | ZAR | 82,000,000 |
| NGN | CFA | 2,000,000 |

**Phase 8 — USSD sessions** (matrix §F.11)

| Seed ID | Phone | State | Notes |
|---|---|---|---|
| USSD-001 | +2348000000009 | main_menu | Normal active session; set TTL to 120s to allow test navigation |
| USSD-002 | +2348000000020 | (not created) | Create 30 USSD sessions during rate-limit test to trigger R5 |
| USSD-003 | +2348000000021 | (expired) | Seed with TTL already elapsed; test that system rejects continuation |

### 3.2 Seed Reset Procedure

After destructive tests (delete tests, FSM terminal state tests), the following must be re-seeded:

| Trigger | Re-seed items |
|---|---|
| After TC-N006 (NDPR delete NTF-002) | Re-insert NTF-002 before next NDPR test run |
| After TC-S001 (closes support ticket to 'closed') | Re-create support ticket in 'open' state |
| After TC-F007/TC-F008 (dispute flow on BTO-003/BTO-004) | Re-confirm BTO-003/BTO-004 to correct state |
| After TC-US010 (30 USSD rate-limit requests exhaust USSD-002 phone) | Flush RATE_LIMIT_KV for +2348000000020 |
| After TC-ID002 (identity rate-limit exhausts 2/hr) | Flush identityRateLimit KV for USR-002 |
| After TC-MON001–TC-MON006 (free tier limits hit) | Reset offering/invite/place counts for TNT-002 |

---

## Section 4 — Test Cycle Plan

Nine named cycles. Cycle order is fixed: each cycle must achieve its gate (see Section 6) before the next begins. Within each cycle, smoke TCs run first, then functional, then negative, then compliance/permission.

### CYCLE-01 — Smoke

**Purpose:** Confirm the staging environment is alive and the most critical happy paths return non-500 responses. Must run on every deployment (CI and manual staging push). If any CYCLE-01 test fails, all subsequent cycles are blocked until resolved.

**Duration target:** ≤ 30 minutes  
**Execution:** Automated (CI) + manual verification on first deploy of a day  
**Owner:** QA lead + DevOps  
**Environment:** ENV-01 (staging), ENV-04 (CI)

| TC-ID | Title | Why in smoke |
|---|---|---|
| TC-AUTH001 | User registration | Confirms API Worker reachable and D1 writable |
| TC-AUTH002 | Login returns JWT | Confirms auth middleware and JWT signing live |
| TC-WS001 | Dashboard renders correct stats | Confirms workspace-app reachable and connected to API |
| TC-BR001 | Shop product listing resolves for tenant | Confirms brand-runtime reachable and host resolution working |
| TC-PD001 | Discovery search returns results | Confirms public-discovery Worker live |
| TC-PA001 | Platform analytics summary (super_admin) | Confirms platform-admin API live |
| TC-US001 | USSD main menu renders 5 branches | Confirms ussd-gateway reachable |
| TC-N001 | Inbox state: unread → read | Confirms notification inbox D1 write live |
| TC-F001 | Bank transfer order creation | Confirms bank-transfer.ts route live |
| TC-NE001 | Vendor pricing policy GET | Confirms negotiation.ts live |
| TC-O001 | Onboarding checklist GET | Confirms onboarding.ts live |
| TC-B001 | B2B RFQ create | Confirms b2b-marketplace.ts live |
| TC-P001 | POS sale recording | Confirms pos.ts live and kobo enforcement |
| TC-WH001 | Webhook tier limit check | Confirms webhooks.ts and tier gate live |
| TC-PROJ001 | Rebuild endpoint requires X-Inter-Service-Secret | Confirms projections route security live |

**CYCLE-01 gate:** All 15 TCs pass. Zero failures permitted.

---

### CYCLE-02 — Critical Path

**Purpose:** All Tier 1 flows from matrix Section E. Financial integrity, tenant isolation, compliance-critical invariants. This cycle constitutes the minimum bar for any code change that touches payment flows, auth, or compliance middleware.

**Duration target:** 2–3 hours (manual execution)  
**Execution:** Manual (first run); automation-eligible for regression (see Section 7)  
**Owner:** Senior QA engineer + security reviewer  
**Environment:** ENV-01 (staging)

**Sub-cycle 2A — Tenant isolation and JWT security (run first within CYCLE-02)**

| TC-ID | Title | Matrix priority | Release gate impact |
|---|---|---|---|
| TC-INV002 | T3: tenant_id from JWT only, never body | P0 | Blocker |
| TC-INV003 | T3: cross-tenant data isolation | P0 | Blocker |
| TC-INV009 | T4: non-super_admin blocked from cross-tenant analytics | P0 | Blocker |
| TC-AUTH003 | Expired JWT returns 401 | P0 | Blocker |
| TC-AUTH004 | Tampered JWT returns 401 | P0 | Blocker |
| TC-CSRF001 | POST without CSRF token returns 403 | P0 | Blocker |

**Sub-cycle 2B — Payment integrity**

| TC-ID | Title | Matrix priority | Release gate impact |
|---|---|---|---|
| TC-INV005 | Paystack HMAC: tampered webhook rejected | P0 | Blocker |
| TC-BR004 | Shop checkout: invalid HMAC rejects callback | P0 | Blocker |
| TC-F001 | Bank transfer: creation and reference format | P0 | Blocker |
| TC-F004 | Bank transfer: confirm → wallet updated | P0 | Blocker |
| TC-F007 | Bank transfer: dispute within 24h | P1 | Blocker |
| TC-F008 | Bank transfer: dispute rejected after 24h | P1 | Blocker |
| TC-F020 | Platform upgrade: confirm (6 steps, idempotent) | P0 | Blocker |
| TC-F021 | Platform upgrade: reject with reason | P1 | Blocker |
| TC-F022 | Upgrade reference format WKUP validation | P2 | Required |
| TC-W007 | HITL queue: funding request visible | P0 | Blocker |
| TC-W008 | WF-032: balance-cap re-check before HITL approval | P0 | Blocker |
| TC-P003 | P9: fractional kobo amount rejected | P0 | Blocker |

**Sub-cycle 2C — Compliance-critical invariants**

| TC-ID | Title | Matrix priority | Release gate impact |
|---|---|---|---|
| TC-ID001 | BVN: consent required, hash only (R7, P10) | P0 | Blocker |
| TC-ID002 | BVN rate limit: max 2/hr (R5) | P1 | Blocker |
| TC-ID008 | Transaction OTP must use SMS, not Telegram (R8) | P0 | Blocker |
| TC-ID011 | Financial op blocked without verified primary phone (P13) | P0 | Blocker |
| TC-N006 | NDPR hard delete (G23) | P0 | Blocker |
| TC-AU001 | Audit log: every authenticated request produces row | P0 | Blocker |
| TC-AU002 | Audit log: IP masking (last octet zeroed) | P0 | Blocker |
| TC-N014 | Staging: NOTIFICATION_SANDBOX_MODE confirmed | P0 | Blocker |

**Sub-cycle 2D — L3 HITL regulatory constraints**

| TC-ID | Title | Matrix priority | Release gate impact |
|---|---|---|---|
| TC-HR001 | law-firm: AI output held in HITL queue | P0 | Blocker |
| TC-HR003 | tax-consultant: TIN never in AI payload | P0 | Blocker |
| TC-HR005 | polling-unit: NO voter PII in storage/payloads | P0 | Blocker |
| TC-AI003 | HITL handoff: task held, not delivered immediately | P0 | Blocker |
| TC-AI001 | SuperAgent: consent + KYC required | P0 | Blocker |
| TC-NE011 | min_price_kobo absent from all API responses | P0 | Blocker |

**Sub-cycle 2E — MON-04 monetisation limits**

| TC-ID | Title | Matrix priority | Release gate impact |
|---|---|---|---|
| TC-MON001 | Free tier invite limit enforced | P0 | Blocker |
| TC-MON002 | Paid tier invite limit not enforced | P2 | Required |
| TC-MON003 | Free tier offering limit enforced | P0 | Blocker |
| TC-MON005 | Free tier place limit enforced | P0 | Blocker |

**CYCLE-02 gate:** All P0 TCs pass. Maximum 0 P0 failures permitted. P1 failures: ≤ 0 (any P1 failure in CYCLE-02 blocks CYCLE-03). See Section 6 for release gates.

---

### CYCLE-03 — Role and Permission

**Purpose:** Verify the 5-layer access control stack (auth, require-role, entitlement, ai-entitlement, billing-enforcement) independently and in combination. Every role combination that the matrix defines must be exercised.

**Duration target:** 2 hours (partially automatable)  
**Execution:** Manual + automation candidate  
**Owner:** QA engineer + security reviewer  
**Environment:** ENV-01 (staging)

| TC-ID | Title | Roles tested | Priority |
|---|---|---|---|
| TC-AC001 | Lapsed subscription blocks gated routes | Any (lapsed) | P0 |
| TC-AC002 | Active subscription allows gated routes | Any (active) | P1 |
| TC-AC003 | Grace period allows access | Any (grace) | P1 |
| TC-AC004 | Expired JWT → 401 | Any | P0 |
| TC-AC005 | Missing JWT → 401 | Any | P0 |
| TC-AC006 | Malformed JWT → 401 | Any | P0 |
| TC-AC007 | super_admin can access super_admin routes | super_admin | P0 |
| TC-AC008 | Admin cannot access super_admin routes | admin | P0 |
| TC-AC009 | Partner can access partner routes | partner | P0 |
| TC-AC010 | Tenant user cannot access partner routes | owner | P0 |
| TC-AC011 | Free plan blocks growth-tier feature | free tenant | P0 |
| TC-AC012 | Growth plan allows growth-tier feature | growth tenant | P1 |
| TC-AC013 | AI entitlement: AI route blocked without AI plan | no AI plan | P0 |
| TC-AC014 | Email unverified blocks sensitive action | unverified | P1 |
| TC-AC015 | CSRF: POST without token → 403 | any | P0 |
| TC-AC016 | Rate limit: identity 2/hr enforced | authenticated | P1 |
| TC-AC017 | Rate limit: general rate limit enforced | authenticated | P1 |
| TC-AC018 | USSD session blocks non-USSD routes | USSD user | P1 |
| TC-PA001 | Platform analytics: only super_admin sees cross-tenant | super_admin vs admin | P0 |
| TC-S006 | Super admin cross-tenant ticket view | super_admin vs admin | P1 |
| TC-INV013 | T4: non-super_admin cross-tenant blocked | admin | P0 |
| TC-PR001 | Partner: credit pool access | partner | P1 |
| TC-PR005 | Partner: sub-partner creation | partner | P2 |
| TC-PV004 | Admin: claim_state → managed transition | admin | P2 |
| TC-AI004 | AI entitlement: blocked without AI subscription | no AI plan | P0 |

**CYCLE-03 gate:** All P0 permission tests pass. Any role bypass constitutes an S0 defect (see Section 8) and blocks all further cycles.

---

### CYCLE-04 — Compliance

**Purpose:** Every compliance, regulatory, and data-protection test in the matrix. These tests validate legal obligations (NDPR, CBN, INEC, FIRS, NBA), platform invariants (P6, P9, P10, P12, P13, R7, R8, G23, G24), and governance constraints (§XV.3).

**Duration target:** 3 hours  
**Execution:** Manual (compliance tests must be manually witnessed for audit trail)  
**Owner:** Compliance QA lead. Outputs signed off before any production deploy.  
**Environment:** ENV-01 (staging). A compliance test run must be logged with tester name, date, and environment snapshot.

| TC-ID | Title | Regulatory anchor | Priority |
|---|---|---|---|
| TC-ID001 | BVN hash-only + consent (R7, P10) | CBN | P0 |
| TC-ID002 | Identity rate limit 2/hr (R5) | CBN | P1 |
| TC-ID003 | BVN same-hash deduplication | CBN / R7 | P1 |
| TC-ID004 | NIN verification: hash only stored | CBN / R7 | P0 |
| TC-ID008 | Transaction OTP: SMS mandatory (R8) | CBN | P0 |
| TC-ID009 | OTP channel rate limits (R9) | CBN | P1 |
| TC-ID010 | Channel lock after failures | CBN / R9 | P1 |
| TC-ID011 | Primary phone verified before financial ops (P13) | CBN | P0 |
| TC-N006 | NDPR hard delete (G23) | NDPR | P0 |
| TC-N011 | NDPR: confirm no soft-delete fallback | NDPR | P0 |
| TC-AU001 | Audit log: per-request row | Platform governance | P0 |
| TC-AU002 | Audit log: IP masking | NDPR / P6 | P0 |
| TC-INV004 | BVN/NIN: raw value never in logs or DB | R7 / P6 | P0 |
| TC-INV006 | Staging sandbox always enforced (G24) | G24 | P0 |
| TC-INV007 | Tenant slug immutable (T8) | Platform | P1 |
| TC-N014 | NOTIFICATION_SANDBOX_MODE=true in staging | G24 | P0 |
| TC-HR001 | law-firm: L3 HITL for all AI output | NBA | P0 |
| TC-HR002 | law-firm: matter_ref_id opaque in AI payloads | NBA | P0 |
| TC-HR003 | tax-consultant: TIN never in AI payloads | FIRS | P0 |
| TC-HR004 | government-agency: Tier 3 KYC mandatory | BPP | P0 |
| TC-HR005 | polling-unit: NO voter PII (name, phone, NIN) | INEC | P0 |
| TC-HR006 | funeral-home: case_ref_id opaque | Platform | P0 |
| TC-HR007 | creche: all AI output under L3 HITL | Platform | P0 |
| TC-SLUG001 | Corrected slug names enforced | Platform integrity | P2 |
| TC-TM003 | Template install: workspace_id from JWT only (T3) | T3 invariant | P0 |
| TC-INV002 | T3: tenant_id never from request body | T3 invariant | P0 |
| TC-INV003 | Cross-tenant data isolation | T3 invariant | P0 |
| TC-NE011 | min_price_kobo absent from all responses | Business confidentiality | P0 |
| TC-WL005 | Free plan: requiresWebwakaAttribution = true | OQ-003 / G17 | P1 |
| TC-WL006 | Paid plan: requiresWebwakaAttribution = false | OQ-003 / G17 | P1 |

**CYCLE-04 gate:** All P0 compliance tests pass. Zero tolerance. Any P0 failure blocks production deployment regardless of other cycle results. P1 failures: ≤ 0 for production; ≤ 2 for tenant rollout (with explicit exception log).

---

### CYCLE-05 — Payments and Wallet

**Purpose:** Full end-to-end coverage of all payment flows: bank transfer FSM, Paystack shop checkout, template purchase, platform upgrade billing, FX rates, wallet lifecycle, and HITL approval.

**Duration target:** 3–4 hours  
**Execution:** Manual (payment flows require Paystack test sandbox interaction); partial automation eligible  
**Owner:** Senior QA engineer (payments domain)  
**Environment:** ENV-01 (staging) with Paystack test mode

**5A — Bank transfer lifecycle**

| TC-ID | Title | Priority |
|---|---|---|
| TC-F001 | BTO creation: reference format, FSM initial state | P0 |
| TC-F002 | BTO: list orders for workspace | P2 |
| TC-F003 | BTO: get single order by ID | P2 |
| TC-F004 | BTO: confirm → wallet updated | P0 |
| TC-F005 | BTO: reject with reason | P1 |
| TC-F006 | BTO: expired state (system-driven) | P2 |
| TC-F007 | BTO: dispute within 24h | P1 |
| TC-F008 | BTO: dispute rejected after 24h window | P1 |
| TC-F011 | BTO: proof submission | P1 |
| TC-F012 | BTO: confirm transitions FSM correctly | P0 |
| TC-F013 | BTO: reject transitions FSM correctly | P1 |
| TC-F014 | BTO: dispute record created in bank_transfer_disputes | P1 |

**5B — Paystack and shop**

| TC-ID | Title | Priority |
|---|---|---|
| TC-BR002 | Shop cart: add item, state persists in KV | P1 |
| TC-BR003 | Paystack checkout: HMAC verified, order created | P0 |
| TC-BR004 | Paystack checkout: invalid HMAC rejected | P0 |
| TC-F015 | Brand-runtime shop: full checkout flow | P0 |
| TC-F016 | Paystack callback handling | P0 |
| TC-F017 | Order created on successful payment | P0 |
| TC-F026 | Paystack webhook HMAC on payments.ts | P0 |
| TC-F027 | Paystack webhook: payment verified updates state | P1 |
| TC-INV005 | HMAC tamper rejection | P0 |

**5C — Template purchase and revenue split**

| TC-ID | Title | Priority |
|---|---|---|
| TC-F018 | Template purchase via Paystack | P1 |
| TC-F019 | Template: revenue_splits row created | P1 |
| TC-TM004 | 70%/30% revenue split verified | P1 |
| TC-TM005 | Duplicate paystack_ref rejected (idempotency) | P1 |

**5D — Platform upgrade billing**

| TC-ID | Title | Priority |
|---|---|---|
| TC-F020 | Platform upgrade: 6-step confirm, idempotent | P0 |
| TC-F021 | Platform upgrade: reject with reason | P1 |
| TC-F022 | WKUP reference format validated | P2 |
| TC-PA004 | Platform bank account: GET/PATCH via WALLET_KV | P1 |
| TC-PA005 | Platform bank account: non-super_admin rejected | P1 |

**5E — FX rates and multi-currency**

| TC-ID | Title | Priority |
|---|---|---|
| TC-F023 | FX: all 6 currencies listed, integer × 1,000,000 | P2 |
| TC-F024 | FX: single pair lookup | P2 |
| TC-F025 | Dual-currency transaction: original_currency + fx_rate_used recorded | P2 |

**5F — Wallet lifecycle and HITL**

| TC-ID | Title | Priority |
|---|---|---|
| TC-W001 | Wallet fund: balance updated | P0 |
| TC-W002 | Wallet balance: correct after transactions | P1 |
| TC-W003 | Wallet withdraw: balance decremented | P1 |
| TC-W004 | Wallet withdraw: CBN daily limit enforced | P1 |
| TC-W005 | Wallet KYC tier gate: T0 blocked from withdraw | P1 |
| TC-W006 | WalletEventType event fired on all transitions | P2 |
| TC-W007 | HITL queue: large funding request appears in platform-admin | P0 |
| TC-W008 | WF-032: balance-cap re-check before HITL approval | P0 |

**CYCLE-05 gate:** All P0 payment tests pass. Any P0 failure is S0 severity. P1 failures ≤ 0 for production. P2 failures ≤ 2 with documented workarounds.

---

### CYCLE-06 — Marketplace and Negotiation

**Purpose:** B2B marketplace full lifecycle (RFQ → PO → Invoice → Dispute) and negotiation engine (pricing policy → session → offer → accept/decline).

**Duration target:** 2–3 hours  
**Execution:** Manual (requires two-actor flow: buyer + seller sessions simultaneously)  
**Owner:** QA engineer (marketplace domain)  
**Environment:** ENV-01 (staging); two browser sessions or two API clients

**6A — B2B marketplace**

| TC-ID | Title | Actors | Priority |
|---|---|---|---|
| TC-B001 | RFQ → bid → accept → PO lifecycle | USR-010 + USR-011 | P0 |
| TC-B002 | RFQ list (buyer and seller perspectives) | USR-010 / USR-011 | P2 |
| TC-B003 | Bid submission by seller | USR-011 | P1 |
| TC-B004 | Bid acceptance creates PO | USR-010 | P0 |
| TC-B005 | PO delivery marking | USR-011 | P1 |
| TC-B006 | Invoice creation for PO | USR-011 | P1 |
| TC-B007 | B2B dispute raised | USR-010 | P1 |
| TC-B008 | B2B dispute: both parties can view (T3 scoped) | USR-010 + USR-011 | P1 |
| TC-B009 | Entity trust score endpoint | USR-010 | P2 |

**6B — Negotiation engine**

| TC-ID | Title | Priority |
|---|---|---|
| TC-NE001 | Vendor pricing policy: GET | P2 |
| TC-NE002 | Vendor pricing policy: PUT | P1 |
| TC-NE003 | Listing pricing mode: set per type+id | P1 |
| TC-NE004 | Listing pricing mode: get + delete | P2 |
| TC-NE005 | Session lifecycle: open → offer → accept | P0 |
| TC-NE006 | Session lifecycle: open → offer → counteroffer → accept | P0 |
| TC-NE007 | Session lifecycle: decline | P1 |
| TC-NE008 | Session lifecycle: cancel | P1 |
| TC-NE009 | Session: offer history pagination | P2 |
| TC-NE010 | Session history audit log | P2 |
| TC-NE011 | min_price_kobo absent from all API responses | P0 |
| TC-NE012 | KYC gate: InsufficientKycError for unverified | P1 |
| TC-NE013 | Price lock token: generate on accept | P1 |
| TC-NE014 | Price lock token: verify integrity | P1 |
| TC-NE015 | Negotiation analytics endpoint | P3 |

**CYCLE-06 gate:** All P0 TCs pass. TC-NE011 (min_price_kobo exposure) is treated as S0 defect if it fails.

---

### CYCLE-07 — Offline and PWA

**Purpose:** Validate offline-first capabilities: PWA manifest and service worker presence, Dexie.js offline sync with server-wins conflict resolution (P11), and USSD full tree.

**Duration target:** 1.5 hours  
**Execution:** Manual (requires browser DevTools, network throttling, offline simulation)  
**Owner:** QA engineer (mobile/PWA domain)  
**Environment:** ENV-01 (staging) + ENV-02 (ussd-staging)

| TC-ID | Title | Priority |
|---|---|---|
| TC-OFL001 | workspace-app: PWA manifest and service worker | P2 |
| TC-OFL002 | Offline sync: server-wins conflict resolution (P11) | P2 |
| TC-OFL003 | partner-admin: PWA installable | P3 |
| TC-US001 | USSD main menu: 5 branches rendered | P1 |
| TC-US002 | USSD Branch 1 (Wallet): balance displayed | P1 |
| TC-US003 | USSD Branch 2 | P1 |
| TC-US004 | USSD Branch 4 | P1 |
| TC-US005 | USSD remaining branch | P1 |
| TC-US006 | USSD Branch 3 (Trending): top 5 by like_count | P2 |
| TC-US007 | USSD Branch 5 (Community): announcements sub-state | P2 |
| TC-US008 | USSD Branch 5 (Community): events + groups sub-states | P2 |
| TC-US009 | USSD session expiry after 3 minutes | P1 |
| TC-US010 | USSD rate limit: 30/hr (R5) | P1 |
| TC-US011 | Telegram webhook handler | P2 |

**CYCLE-07 gate:** TC-OFL002 (P11 offline sync) must pass — a server-loses scenario is an S1 data integrity defect. USSD rate limit (TC-US010) must pass. PWA manifest failures are S2.

---

### CYCLE-08 — Analytics

**Purpose:** All analytics and CRON-driven projection tests. Read-only flows; can run in parallel with other cycles after CYCLE-02 gate is cleared.

**Duration target:** 1 hour  
**Execution:** Manual + automation candidate  
**Owner:** QA engineer (analytics domain)  
**Environment:** ENV-01 (staging) with analytics_snapshots seeded

| TC-ID | Title | Priority |
|---|---|---|
| TC-WA001 | Workspace analytics: daily summary from snapshots | P2 |
| TC-WA002 | Workspace analytics: live fallback when no snapshot | P2 |
| TC-PA001 | Platform analytics: summary cross-tenant (super_admin only) | P1 |
| TC-PA002 | Platform analytics: vertical usage heatmap | P2 |
| TC-PA003 | Admin metrics: 5-field response | P2 |
| TC-PROJ001 | Projections rebuild: requires X-Inter-Service-Secret | P0 |
| TC-PROJ002 | Projections CRON: daily snapshot computed at 2am | P2 |
| TC-N015 | Notificator CRON: resolveDigestType at hour 23 | P2 |
| TC-N016 | Notificator CRON: 03:00 retention + domain verify | P2 |

**CYCLE-08 gate:** TC-PROJ001 (SEC-009) must pass (P0). All other tests are P2; up to 2 failures permitted with documented workarounds.

---

### CYCLE-09 — Full Regression

**Purpose:** Execute all 108 matrix TCs in dependency order, without exception. Run before any production release, major version tag, or new partner onboarding. Includes all test cycles above in sequence.

**Duration target:** 1–2 days (manual) / 3–4 hours (with automation running CYCLE-01, -03, -08 in parallel)  
**Execution:** Mixed — automated for eligible tests; manual for compliance, payment, two-actor flows  
**Owner:** QA lead (coordinates all owners above)  
**Environment:** Fresh ENV-01 seed (re-apply all Phase 1–8 seeds from Section 3 before starting)

**CYCLE-09 execution order:**

```
CYCLE-01 (smoke) — all pass required
  ↓
CYCLE-02 (critical path) — all P0 pass required
  ↓
CYCLE-03 (role/permission) + CYCLE-08 (analytics) [can run in parallel after CYCLE-02 gate]
  ↓
CYCLE-04 (compliance) — all P0 pass required; compliance lead sign-off required
  ↓
CYCLE-05 (payments) + CYCLE-06 (marketplace) [can run in parallel after CYCLE-04 gate]
  ↓
CYCLE-07 (offline/PWA)
  ↓
CYCLE-09 gate review (Section 6)
```

---

## Section 5 — Execution Priority Map

This map converts matrix Section E's 5 tiers into a single ranked list, combining business risk, dependency order, compliance impact, financial impact, and user-facing criticality. Use this when time is constrained and a subset must be chosen.

| Rank | TC-ID(s) | Area | Business risk | Compliance impact | Financial impact | Dependency on |
|---|---|---|---|---|---|---|
| 1 | TC-INV002, TC-INV003 | T3 tenant isolation | Catastrophic (data breach) | Critical | None | CYCLE-01 |
| 2 | TC-AUTH003, TC-AUTH004 | JWT auth | Catastrophic (unauthorized access) | Critical | High | CYCLE-01 |
| 3 | TC-INV005, TC-BR004 | Paystack HMAC | None (payment fraud) | W1 | Catastrophic | CYCLE-01 |
| 4 | TC-ID001, TC-INV004 | BVN/NIN R7 compliance | None | Catastrophic (CBN) | None | Users seeded |
| 5 | TC-N006 | NDPR hard delete | None | Catastrophic (NDPR) | None | NTF-002 seeded |
| 6 | TC-AU001, TC-AU002 | Audit log | None | Catastrophic (platform audit) | None | CYCLE-01 |
| 7 | TC-HR001, TC-HR003, TC-HR005 | L3 HITL constraints | Regulatory shutdown risk | Catastrophic (NBA / FIRS / INEC) | None | TNT-004, TNT-005 seeded |
| 8 | TC-W007, TC-W008 | HITL wallet WF-032 | High | WF-032 | Catastrophic | WLT-001, USR-001 |
| 9 | TC-CSRF001 | CSRF | High (state-change forgery) | High | None | CYCLE-01 |
| 10 | TC-MON001, TC-MON003, TC-MON005 | MON-04 monetisation limits | High (revenue leakage) | None | High (plan upsell) | TNT-002 seeded |
| 11 | TC-F001, TC-F004, TC-F012 | Bank transfer FSM | High | None | Catastrophic | BTO-001, BTO-002 |
| 12 | TC-NE011 | min_price_kobo exposure | High (pricing leak) | None | High | Negotiation seed |
| 13 | TC-AC001, TC-AC007–AC010 | Middleware access control | High | High | High | CYCLE-01 |
| 14 | TC-AI001, TC-AI004 | AI entitlement + consent | High | High | Medium | AI plan config |
| 15 | TC-ID008, TC-ID011 | OTP routing R8, P13 | High | CBN | High | USR-002 KYC |
| 16 | TC-F020, TC-F021 | Platform upgrade billing | Medium | None | High | USR-001, BTO seeded |
| 17 | TC-TM003, TC-TM004 | Template install T3 + 70/30 | Medium | T3 | High | TPL-001 seeded |
| 18 | TC-B001–TC-B004 | B2B RFQ→PO | High | None | High | RFQ-001, BID-001 |
| 19 | TC-NE005, TC-NE006 | Negotiation sessions | High | None | High | Pricing policy seeded |
| 20 | TC-W001–TC-W006 | Wallet lifecycle | High | CBN | Catastrophic | WLT-001 |
| 21 | TC-N014 | Sandbox enforcement (G24) | None | Critical (G24) | None | Notificator config |
| 22 | TC-BR003 | Paystack shop checkout | High | W1 | Catastrophic | PROD-001, TNT-003 |
| 23 | TC-S001–TC-S005 | Support FSM | Medium | None | None | TNT-001 seeded |
| 24 | TC-O001–TC-O007 | Onboarding 6-step | Medium | None | None | TNT-001 seeded |
| 25 | TC-US009, TC-US010 | USSD TTL + rate limit | Medium | R5 | None | USSD-001–003 seeded |
| 26 | TC-AC016, TC-AC017 | Rate limiting | Medium | R5/R9 | None | KV clean state |
| 27 | TC-INV007 | Tenant slug immutable | Low | T8 | None | TNT-001 |
| 28 | TC-WH001, TC-WH002 | Webhook tier limits | Low | G25 | None | TNT-001 seeded |
| 29 | TC-PD004 | Private profile invisible | Medium | None | None | Visibility seeded |
| 30 | TC-OFL002 | Offline sync server-wins | Medium | P11 | None | Dexie + D1 setup |
| 31 | TC-WA001, TC-WA002 | Workspace analytics | Low | None | None | analytics_snapshots |
| 32 | TC-PROJ001 | Projections SEC-009 | Medium | SEC-009 | None | Secret seeded |
| 33 | TC-I18-001–003 | i18n locale detection | Low | None | None | public-discovery |
| 34 | TC-BR010 | Brand token CSS vars | Low | None | None | TNT-003 branding |
| 35 | TC-OFL001, TC-OFL003 | PWA manifest | Low | None | None | workspace-app |

---

## Section 6 — Release Gate Criteria

### 6.1 Feature Release Gate

Applies when a single feature or route change is deployed to staging or production.

| Gate condition | Pass threshold | Fail action |
|---|---|---|
| CYCLE-01 (smoke) | 100% — zero failures | Block deploy immediately |
| All CYCLE-02 P0 TCs that touch the changed area | 100% — zero failures | Block deploy |
| CYCLE-03 permission tests for the changed route's role | 100% | Block deploy |
| No new S0 or S1 defects introduced | Zero new S0/S1 | Block deploy |
| CYCLE-04 compliance TCs relevant to changed area | 100% | Block deploy |
| Open S2 defects | ≤ 3 with documented workarounds | Warn; proceed with approval |

### 6.2 Tenant Rollout Gate

Applies when onboarding a new tenant to a deployed environment (staging → UAT → production).

| Gate condition | Pass threshold | Fail action |
|---|---|---|
| CYCLE-01 (smoke) | 100% | Block rollout |
| TC-INV002, TC-INV003 (T3 isolation) | 100% | Block rollout — data leak risk |
| TC-MON001, TC-MON003, TC-MON005 (free tier limits) | 100% for free tenants | Block rollout |
| TC-WL005, TC-WL006 (attribution rules) | 100% | Block rollout — OQ-003 legal requirement |
| Tenant seed data confirmed | All F.2 rows for tenant present | Block rollout |
| TC-AUTH006 (session revocation works) | Pass | Block rollout |
| No open S0 defects | Zero | Block rollout |
| No open S1 defects in tenant-facing flows | Zero | Block rollout |
| CYCLE-04 compliance gate cleared | Yes | Block rollout |

### 6.3 Partner Rollout Gate

Applies when onboarding a new partner or sub-partner.

| Gate condition | Pass threshold | Fail action |
|---|---|---|
| TC-PR001–TC-PR008 (partner admin suite) | 100% | Block partner onboarding |
| TC-INV013 / TC-PA001 (T4 cross-tenant isolation confirmed) | 100% | Block — partner data leak risk |
| White-label depth configured correctly (TC-WL007) | 100% | Block |
| Partner seed data present (F.3) | PTN record + credit pool | Block |
| TC-AC009 (partner can access partner routes) | Pass | Block |
| TC-AC010 (tenant user cannot access partner routes) | Pass | Block |
| CYCLE-04 compliance gate cleared | Yes | Block |
| No open S0 or S1 defects in partner-admin | Zero | Block |

### 6.4 Payment-Related Change Gate

Applies to any code change touching: `bank-transfer.ts`, `payments.ts`, `hl-wallet.ts`, `platform-admin-billing.ts`, `templates.ts`, `brand-runtime/shop.ts`, or `billing-enforcement.ts`.

| Gate condition | Pass threshold | Fail action |
|---|---|---|
| TC-INV005 (Paystack HMAC tamper rejected) | Pass | Block — payment fraud risk |
| TC-BR004 (shop checkout HMAC rejected) | Pass | Block |
| TC-F001, TC-F004, TC-F012 (bank transfer FSM) | Pass | Block |
| TC-W007, TC-W008 (HITL + WF-032) | Pass | Block |
| TC-TM004 (70/30 revenue split) | Pass | Block |
| TC-P003 (fractional kobo rejected) | Pass | Block — P9 invariant |
| TC-F020 (upgrade billing idempotent) | Pass | Block |
| Full CYCLE-05 (payments) | 100% P0, ≤ 0 P1 failures | Block |
| P24 FX rate tests (TC-F023–TC-F025) | Pass | Warn if fail — non-blocking for NGN-only |

### 6.5 Compliance-Sensitive Change Gate

Applies to any code change touching: `identity.ts`, `audit-log.ts`, `inbox-routes.ts`, `preference-routes.ts`, `notification-routes.ts`, superagent.ts`, any L3 HITL vertical, `hl-wallet.ts` (KYC tiers), or any regulatory vertical (§XV.3).

| Gate condition | Pass threshold | Fail action |
|---|---|---|
| Full CYCLE-04 (compliance) | 100% P0 | Block |
| Compliance lead sign-off (human review of TC-HR001–TC-HR007) | Required | Block |
| TC-ID001, TC-INV004 (BVN hash-only) | Pass | Block |
| TC-N006, TC-N011 (NDPR hard delete, no soft-delete) | Pass | Block |
| TC-AU001, TC-AU002 (audit log + IP masking) | Pass | Block |
| TC-N014 (sandbox enforced in staging) | Pass | Block |
| Open S0 compliance defects | Zero | Block |
| Open S1 compliance defects | Zero | Block |

### 6.6 Major Platform Release Gate

Applies to: version tag, milestone completion (M9/M10/M11/M12), or infrastructure changes (Worker redeployment, D1 migration batch, KV namespace change).

| Gate condition | Pass threshold | Fail action |
|---|---|---|
| Full CYCLE-09 (complete regression) | See CYCLE-09 gate below | Block release |
| CYCLE-04 compliance sign-off by compliance lead | Required | Block release |
| CYCLE-05 payment sign-off | Required | Block release |
| Zero S0 defects open | Zero | Block release |
| Zero S1 defects open (or all triaged + documented + founder-approved exceptions) | Zero unexcepted | Block release |
| S2 defects | ≤ 5, all documented | Warn; release with approval |
| D11 deferred item | Confirmed non-blocking (no USDT code shipped) | Document and proceed |
| partner-admin AI deferred | Confirmed not-implemented | Document and proceed |
| Database migrations smoke-tested | All 383 migrations applied cleanly in ENV-01 | Block if any migration fails |

**CYCLE-09 gate (numerical thresholds):**

| Category | Threshold |
|---|---|
| P0 failures | 0 |
| P1 failures | 0 |
| P2 failures | ≤ 3 with documented workarounds |
| P3/P4 failures | ≤ 5 with documented workarounds |
| Compliance TCs (CYCLE-04) | 100% — no exceptions |
| Payment TCs (CYCLE-05 P0+P1) | 100% — no exceptions |
| Deferred items confirmed | D11 + partner AI both confirmed non-blocking |

---

## Section 7 — Manual vs Automation Split

### 7.1 Classification guide

| Classification | Meaning |
|---|---|
| **Manual-only** | Requires human judgment, regulatory witness, two-actor interaction, or DevTools inspection. Do not automate. |
| **Automation candidate** | Deterministic, repeatable, no human-in-the-loop required. Should be automated for regression value. |
| **High-value regression** | Critical path item with high failure risk on code changes. Prioritise for automation first. |
| **Exploratory** | Edge cases and exploratory sessions not captured in TCs. Schedule dedicated exploratory time, not automated. |

### 7.2 Classification by area

| Area | TCs | Classification | Rationale |
|---|---|---|---|
| **JWT and auth** | TC-AUTH001–TC-AUTH007, TC-AC004–TC-AC006 | High-value regression | Deterministic HTTP behaviour; fails loudly on auth middleware changes |
| **CSRF protection** | TC-CSRF001 | High-value regression | Single HTTP request; header presence check |
| **Tenant isolation (T3)** | TC-INV002, TC-INV003, TC-INV009 | High-value regression | Critical; must run on every PR touching route handlers |
| **Paystack HMAC (W1)** | TC-INV005, TC-BR004, TC-F026 | High-value regression | Deterministic HMAC computation; automate with Paystack test signatures |
| **Rate limiting** | TC-AC016, TC-AC017, TC-ID002, TC-US010 | Automation candidate | Requires KV flush before each run; automatable if KV reset is scripted |
| **Permission / role checks** | TC-AC007–TC-AC015, TC-AI004 | High-value regression | Role mismatch returns fixed HTTP status codes; easy to automate |
| **Notification inbox state transitions** | TC-N001–TC-N005 | Automation candidate | Simple PATCH + GET response checks |
| **NDPR hard delete (G23)** | TC-N006, TC-N011 | Manual-only | Requires compliance witness; regulatory test must be human-attested |
| **BVN/NIN R7 compliance** | TC-ID001, TC-INV004 | Manual-only | Compliance test requiring log inspection and DB inspection; must be human-attested |
| **L3 HITL constraints** | TC-HR001–TC-HR007 | Manual-only | Regulatory; requires tracing AI payload contents; must be attested by compliance lead |
| **Audit log correctness** | TC-AU001, TC-AU002 | Manual-only + automation candidate | IP masking requires human inspection; row creation is automatable |
| **Bank transfer FSM (basic)** | TC-F001, TC-F002, TC-F003 | Automation candidate | POST + GET; deterministic state transitions |
| **Bank transfer FSM (admin flows)** | TC-F004, TC-F005, TC-F012 | Automation candidate | Requires two-role setup (buyer + admin); automatable with multi-role test client |
| **Bank transfer dispute window** | TC-F007, TC-F008 | Automation candidate | Requires timestamp manipulation (seed BTO-004 with correct timestamp) |
| **Paystack shop checkout** | TC-BR003, TC-F015, TC-F016, TC-F017 | Manual-only | Requires Paystack hosted page interaction or webhook simulation; sandbox requires human verification |
| **Template purchase + revenue split** | TC-TM004, TC-TM005 | Automation candidate | Revenue split calculation; DB assertion |
| **Platform upgrade billing** | TC-F020, TC-F021, TC-F022 | Manual-only | 6-step confirm flow has side effects; human review of activation steps required |
| **Wallet fund/withdraw/HITL** | TC-W001–TC-W006 | Automation candidate | Balance deltas are deterministic |
| **WF-032 HITL balance-cap re-check** | TC-W007, TC-W008 | Manual-only | Requires platform-admin UI interaction + DB state manipulation; human attested |
| **B2B marketplace lifecycle** | TC-B001–TC-B009 | Automation candidate | Two-actor; automatable with dual API clients (buyer + seller tokens) |
| **Negotiation engine** | TC-NE001–TC-NE015 | Automation candidate | Except TC-NE011 (field-absence check) which is high-value regression |
| **min_price_kobo absence** | TC-NE011 | High-value regression | Field-absence check on JSON response; must run on every pricing-related PR |
| **MON-04 limits** | TC-MON001–TC-MON006 | Automation candidate | Requires counter-at-limit seed state; automatable if seed script resets counts |
| **Onboarding 6-step** | TC-O001–TC-O007 | Automation candidate | Step-mark API + summary % check; deterministic |
| **Support ticket FSM** | TC-S001–TC-S005 | Automation candidate | Status transition via PATCH; terminal state rejection automatable |
| **USSD menu tree** | TC-US001–TC-US008 | Automation candidate | Africa's Talking callback simulation; state machine is deterministic |
| **USSD rate limit + TTL** | TC-US009, TC-US010 | Automation candidate | KV flush required before test; automatable if KV reset is scripted |
| **Notification CRON digest timing** | TC-N015, TC-N016 | Manual-only | CRON invocation requires wrangler trigger or wait-for-schedule; not reliably automatable in CI |
| **i18n locale detection** | TC-I18-001–TC-I18-003 | Automation candidate | HTTP header + query param variations; response language inspection |
| **Analytics snapshots** | TC-WA001, TC-WA002, TC-PA001, TC-PA002 | Automation candidate | Read-only GET; response structure assertions |
| **Projections SEC-009** | TC-PROJ001 | High-value regression | Single header presence check; run on every projections PR |
| **PWA manifest + service worker** | TC-OFL001, TC-OFL003 | Automation candidate | HTML response inspection; Lighthouse CLI automatable |
| **Offline sync server-wins** | TC-OFL002 | Manual-only | Requires Dexie.js controlled offline simulation; human DevTools interaction |
| **Slug correctness** | TC-SLUG001 | Automation candidate | 4 GET requests; 404 vs 200 assertion |
| **Brand token CSS vars** | TC-BR010 | Automation candidate | HTML response inspection for `:root` block |
| **Custom domain Host header resolution** | TC-BR009 | Automation candidate | HTTP request with Host override; 404 vs 200 assertion |
| **FX rates** | TC-F023–TC-F025 | Automation candidate | GET + integer validation |
| **Tenant slug immutable (T8)** | TC-INV007 | Automation candidate | PATCH + verify unchanged |
| **Webhook tier limits** | TC-WH001–TC-WH005 | Automation candidate | Create webhooks until limit; 422 on next |
| **Profile visibility** | TC-PV001–TC-PV004 | Automation candidate | PATCH + public-discovery cross-check |
| **Partner admin flows** | TC-PR001–TC-PR008 | Manual-only (PR001–PR004) / Automation (PR005–PR008) | Settlement calculation requires manual financial verification; sub-partner CRUD is automatable |
| **White-label attribution** | TC-WL001–TC-WL008 | Automation candidate (WL001–WL004) / Manual (WL005–WL008) | Attribution rule requires brand-runtime page inspection; custom domain DNS requires human DNS setup |
| **Exploratory: 28 scaffold P1 verticals** | No TC | Exploratory | mosque, youth-org, womens-assoc, ministry, sole-trader, professional, school, clinic, tech-hub — scaffold only, no FSM depth to test deterministically |
| **Exploratory: offline conflict matrix** | No TC (beyond TC-OFL002) | Exploratory | Full Dexie.js conflict matrix (same field, related field) requires exploratory session |

### 7.3 Automation build priority order

Based on frequency of code change and risk:

1. TC-INV002, TC-INV003 (T3 isolation) — must be in CI on every PR
2. TC-AUTH003, TC-AUTH004, TC-CSRF001 (auth security)
3. TC-INV005 (Paystack HMAC)
4. TC-NE011 (min_price_kobo)
5. TC-PROJ001 (SEC-009)
6. TC-AC007–TC-AC015 (role permissions)
7. TC-MON001, TC-MON003, TC-MON005 (free tier limits)
8. TC-SLUG001 (slug correctness)
9. TC-N001–TC-N005, TC-N007 (inbox state transitions + KV cache)
10. TC-F001, TC-F004 (bank transfer FSM core)
11. TC-NE005, TC-NE006 (negotiation session lifecycle)
12. TC-B001–TC-B004 (B2B RFQ→PO)
13. TC-US001–TC-US010 (USSD full suite)
14. TC-O001–TC-O007 (onboarding)
15. TC-S001–TC-S005 (support FSM)

---

## Section 8 — Defect Triage Map

### 8.1 Severity Levels

| Severity | Code | Definition | Time to acknowledge | Time to resolve | Release impact |
|---|---|---|---|---|---|
| **Stop-everything** | S0 | Security breach, data leak, cross-tenant exposure, payment fraud vector, regulatory violation | Immediate (same session) | Before any further deployment | All deployments halted until resolved |
| **Critical** | S1 | Core flow broken, financial inconsistency, compliance failure, production blocker | 2 hours | Before production deploy; staging can continue with workaround | Blocks production deploy |
| **High** | S2 | Feature broken, FSM invalid transition not caught, rate limit not enforced, incorrect response | 4 hours | Before major release | Blocks major release; patches OK |
| **Medium** | S3 | Degraded experience, incorrect display, non-blocking validation gap, edge case | 1 business day | Within current sprint | Does not block release; tracked in sprint |
| **Low** | S4 | Cosmetic, minor UX issue, documentation mismatch | 3 business days | Next sprint | No release impact |

### 8.2 Severity Classification by Test Area

| Area | Default severity if test fails | Escalation trigger |
|---|---|---|
| T3 tenant isolation (TC-INV002, TC-INV003) | S0 | Any cross-tenant data visible |
| Paystack HMAC (TC-INV005, TC-BR004) | S0 | Any payment state change without HMAC |
| BVN/NIN raw storage (TC-ID001, TC-INV004) | S0 | Any raw BVN/NIN found in DB or logs |
| NDPR hard delete (TC-N006) | S0 | Soft-delete used instead of hard-delete |
| L3 HITL bypass (TC-HR001–TC-HR007) | S0 | AI output delivered without HITL for regulated vertical |
| Audit log not written (TC-AU001) | S1 | Entire request class missing from audit_log |
| IP masking failed (TC-AU002) | S1 | Full IP address found in audit_log |
| Wallet balance-cap re-check skipped (TC-W008) | S0 | HITL approval allowed above CBN cap |
| Paystack checkout shop fails (TC-BR003) | S1 | No order created after successful payment |
| min_price_kobo exposed in response (TC-NE011) | S1 | Seller floor price visible to buyer |
| MON-04 limit not enforced (TC-MON001, etc.) | S1 | Free tier exceeds plan entitlement without block |
| JWT expired not rejected (TC-AUTH003) | S0 | Expired token grants access |
| CSRF token missing not rejected (TC-CSRF001) | S0 | State-changing request succeeds without CSRF token |
| Notification sandbox bypassed in staging (TC-N014) | S1 | Real notification sent in staging |
| Role escalation succeeds (TC-AC007–TC-AC010) | S0 | Lower role accesses higher-role route |
| Subscription gate bypassed (TC-AC001, TC-AC011) | S1 | Lapsed plan accesses gated route |
| Rate limit not enforced (TC-ID002, TC-US010) | S2 | Identity/USSD requests exceed defined limit |
| Bank transfer FSM invalid transition (TC-S005, TC-F008) | S2 | Terminal state accepts further transitions |
| Analytics cross-tenant leak (TC-PA001) | S1 | Non-super_admin sees other tenant's data |
| PWA manifest missing (TC-OFL001) | S3 | No service worker; app not installable |
| i18n fallback missing (TC-I18-002) | S3 | Error instead of English fallback |
| Slug wrong (TC-SLUG001) | S2 | hair-salon responds to barber-shop path |
| USSD TTL not enforced (TC-US009) | S2 | Session continues past 3 minutes |
| HITL expiry sweep not running (TC-AI003) | S2 | HITL tasks never sweep to expired |

### 8.3 Tenant Isolation Risk Classification

Any defect that involves cross-tenant data exposure must be classified S0 regardless of the test that found it:

| Indicator | Auto-upgrade to S0 |
|---|---|
| Tenant A can read Tenant B's offerings, profiles, orders, wallet, support tickets | Yes |
| JWT tenant_id mismatch with resource tenant_id | Yes |
| API response contains rows from multiple tenants when only one should be returned | Yes |
| Audit log row records wrong tenant_id | Yes |
| Notification delivered to wrong tenant's inbox | Yes |

### 8.4 Payment Risk Classification

| Indicator | Severity | Action |
|---|---|---|
| Payment state change without HMAC validation | S0 | Halt; immediately report to payment team |
| Wallet balance inconsistency after transaction | S0 | Halt; freeze wallet for affected user |
| Bank transfer confirmed without proof submitted | S0 | Halt |
| Revenue split not written on template purchase | S1 | Block production deploy |
| Duplicate revenue_splits row for same paystack_ref | S1 | Block production deploy |
| Wallet HITL approval above CBN cap | S0 | Halt |
| FX rate stored as non-integer (P9 violation) | S1 | Block production deploy |

### 8.5 Compliance Risk Classification

| Indicator | Severity | Mandatory action |
|---|---|---|
| Raw BVN or NIN found in DB (R7 violated) | S0 | Halt; immediately involve DPO; notify CBN if in production |
| IP address not masked in audit_log (P6 violated) | S1 | Block production deploy; notify DPO |
| Hard delete not performed for NDPR request | S0 | Halt; immediately notify DPO |
| L3 HITL constraint bypassed for regulated vertical | S0 | Halt; block all AI tasks for that vertical immediately |
| Voter PII found in polling-unit storage | S0 | Halt; immediately notify INEC-compliance team |
| TIN found in AI payload for tax-consultant | S0 | Halt; notify FIRS-compliance team |

### 8.6 Defect Triage Workflow

```
Defect found during test execution
         ↓
Triage: Is it S0?
  YES → Halt cycle immediately
        Notify QA lead + engineering lead within 1 hour
        Freeze affected area in staging
        Root cause analysis before any further deployment
  NO  → Is it S1?
          YES → Flag as release blocker
                Assign to engineer same day
                CYCLE-09 gate will not pass until resolved
          NO  → Is it S2?
                  YES → Assign to current sprint
                        Document workaround if any
                        Does not block current cycle; blocks major release
                  NO  → Log as S3 or S4
                         Assign to next sprint or backlog
                         No release impact
```

### 8.7 Defect Report Required Fields

Every defect raised during QA execution must include:

| Field | Description |
|---|---|
| TC-ID | Exact test case ID from matrix (e.g. TC-F004) |
| Severity | S0–S4 per Section 8.1 |
| Environment | ENV-01 / ENV-02 / ENV-04 |
| Seed state | Which seed data was active (Phase 1–8 reference) |
| Steps to reproduce | Exact reproduction steps from the test case |
| Actual result | What happened |
| Expected result | What the matrix says should happen |
| Evidence | Screenshot, log file, DB query output, curl response |
| Matrix conflict | Whether the bug contradicts the frozen inventory (if so, flag — it may be a matrix error, not a code bug) |

---

## Section 9 — Coverage Sanity Check

This section confirms the QA matrix (and therefore this plan) covers all required dimensions.

### 9.1 All 11 Apps Covered

| App | Matrix section | Cycle(s) | Status |
|---|---|---|---|
| `api` (main API Worker) | C.1–C.16 | CYCLE-01 through CYCLE-06, CYCLE-08 | Covered |
| `workspace-app` | C.2, C.3 | CYCLE-03, CYCLE-07 | Covered |
| `admin-dashboard` | C.8 | CYCLE-06 | Covered |
| `partner-admin` | C.6 | CYCLE-03 (permissions), CYCLE-06 | Covered |
| `brand-runtime` | C.4 | CYCLE-01, CYCLE-05 | Covered |
| `public-discovery` | C.5 | CYCLE-01, CYCLE-08 | Covered |
| `ussd-gateway` | C.9 | CYCLE-07 | Covered |
| `notificator` | C.10 | CYCLE-08 | Covered |
| `projections` | C.14 | CYCLE-08 | Covered |
| `platform-admin` | C.7 | CYCLE-02, CYCLE-05 | Covered |
| `tenant-public` | C.4 (via brand-runtime) | CYCLE-01 | Covered (host resolution) |

### 9.2 All 11 Roles Covered

| Role | Matrix section | Cycle(s) that exercise it |
|---|---|---|
| super_admin | B.16, C.7 | CYCLE-02 (T4), CYCLE-03, CYCLE-05, CYCLE-08 |
| partner | B.17, C.6 | CYCLE-03, CYCLE-06 |
| sub-partner | B.17 | CYCLE-03 |
| tenant owner/admin | C.2, C.3, C.8, C.11, C.13 | CYCLE-02 through CYCLE-07 |
| manager | C.2 | CYCLE-03 (invite flow) |
| cashier | C.3 | CYCLE-05 (POS) |
| agent | B.15 | CYCLE-06 |
| member | C.9 | CYCLE-07 (USSD) |
| authenticated end user | C.1, C.11, C.12 | CYCLE-02, CYCLE-05 |
| public (unauthenticated) | C.4, C.5 | CYCLE-01, CYCLE-07 |
| USSD user | C.9 | CYCLE-07 |

### 9.3 All High-Risk Flows Covered

| High-risk flow | TC-IDs | Cycle |
|---|---|---|
| Tenant data isolation | TC-INV002, TC-INV003, TC-INV009 | CYCLE-02 |
| Payment HMAC | TC-INV005, TC-BR004, TC-F026 | CYCLE-02, CYCLE-05 |
| Wallet HITL + WF-032 | TC-W007, TC-W008 | CYCLE-05 |
| BVN/NIN hash-only | TC-ID001, TC-INV004 | CYCLE-04 |
| NDPR hard delete | TC-N006, TC-N011 | CYCLE-02, CYCLE-04 |
| L3 HITL constraints | TC-HR001–TC-HR007 | CYCLE-02, CYCLE-04 |
| Audit log | TC-AU001, TC-AU002 | CYCLE-02, CYCLE-04 |
| MON-04 monetisation limits | TC-MON001–TC-MON006 | CYCLE-02 |
| JWT security | TC-AUTH003, TC-AUTH004 | CYCLE-02 |
| CSRF protection | TC-CSRF001 | CYCLE-02 |

### 9.4 All Major FSMs Covered

| FSM | States covered | TC-IDs | Cycle |
|---|---|---|---|
| Bank transfer order (P21) | pending → proof_submitted → confirmed / rejected / expired | TC-F001–TC-F014 | CYCLE-05 |
| Bank transfer dispute | open → resolved / rejected (24h window) | TC-F007, TC-F008 | CYCLE-05 |
| Support ticket | open → in_progress → resolved → closed (terminal) | TC-S001–TC-S005 | CYCLE-03 |
| Template purchase | pending → paid → failed → refunded | TC-TM004, TC-TM005 | CYCLE-05 |
| Notification inbox | unread → read / archived / snoozed / pinned / dismissed | TC-N001–TC-N005 | CYCLE-03 |
| B2B RFQ | open → bid_submitted → bid_accepted → PO | TC-B001–TC-B004 | CYCLE-06 |
| Negotiation session | open → offered → countered → accepted / declined / cancelled | TC-NE005–TC-NE008 | CYCLE-06 |
| Workspace upgrade | pending → confirmed / rejected (WKUP) | TC-F020, TC-F021 | CYCLE-05 |
| Claims | claim → verify → approve / reject | TC-PV004, TC-PV005 | CYCLE-03 |
| KYC tiers | T0 → T1 → T2 → T3 | TC-ID001, TC-W005, TC-HR004 | CYCLE-04 |
| Hire-purchase | seeded → claimed → cbn_verified → active → suspended | TC-HR004 (related) | CYCLE-04 |
| Subscriptions | free → starter → growth → enterprise (upgrade/downgrade) | TC-AC002, TC-AC012 | CYCLE-03 |
| Onboarding | 6-step: step_N → step_N+1 → completed | TC-O001–TC-O007 | CYCLE-03 |
| USSD session | main_menu → branch → sub-state → terminal / expiry | TC-US001–TC-US009 | CYCLE-07 |

### 9.5 All Compliance Areas Covered

| Compliance area | Regulatory anchor | TC-IDs | Cycle |
|---|---|---|---|
| BVN/NIN storage (R7) | CBN | TC-ID001, TC-ID003, TC-ID004, TC-INV004 | CYCLE-04 |
| Consent before KYC (P10) | CBN | TC-ID001 | CYCLE-04 |
| Primary phone before financial ops (P13) | CBN | TC-ID011 | CYCLE-04 |
| SMS mandatory for transactions (R8) | CBN | TC-ID008 | CYCLE-04 |
| Identity rate limiting R5 (2/hr) | CBN | TC-ID002 | CYCLE-04 |
| NDPR hard delete (G23) | NDPR Nigeria | TC-N006, TC-N011 | CYCLE-04 |
| IP masking in audit log (P6) | NDPR Nigeria | TC-AU002 | CYCLE-04 |
| No PII in logs (P6) | NDPR Nigeria | TC-INV006 | CYCLE-04 |
| INEC: no voter PII | INEC | TC-HR005 | CYCLE-04 |
| NBA: law-firm L3 HITL | NBA | TC-HR001, TC-HR002 | CYCLE-04 |
| FIRS: TIN never in AI payload | FIRS | TC-HR003 | CYCLE-04 |
| BPP: government-agency T3 KYC | BPP | TC-HR004 | CYCLE-04 |
| Paystack HMAC (W1) | CBN / Paystack ToS | TC-INV005, TC-BR004, TC-F026 | CYCLE-02, CYCLE-05 |
| Notification sandbox (G24) | Platform governance | TC-N014 | CYCLE-04 |
| Webhook tier limits (G25) | Platform governance | TC-WH001, TC-WH002 | CYCLE-03 |
| Attribution rule free tier (G17/OQ-003) | Platform ToS | TC-WL005, TC-WL006 | CYCLE-04 |
| Kobo-only storage (P9) | CBN / Platform | TC-P003, TC-COM001, TC-F001 | CYCLE-02, CYCLE-05 |
| USSD rate limit 30/hr (R5) | CBN / Platform | TC-US010 | CYCLE-07 |

### 9.6 D11 Governance-Blocked Item Confirmed Non-Blocking

| Item | Status | Impact on QA plan |
|---|---|---|
| D11 — USDT precision | Governance-blocked — founder decision pending | Zero test cases exist for USDT in the matrix. No USDT code is shipped. No cycle is impacted. When founder decision arrives: (1) matrix owner adds TC to Section C; (2) this plan adds TC to CYCLE-04 (compliance) and CYCLE-09 (regression) without reopening any other scope. |

### 9.7 Partial Coverage Items (Inherited from Matrix Section D)

These are known gaps, not oversights:

| Item | Coverage level | Notes |
|---|---|---|
| 28 scaffold P1 verticals (mosque, school, clinic, etc.) | Scaffold only | No FSM depth. Covered by smoke (TC-US001 confirms routing). Exploratory session recommended. |
| Resend bounce webhook | Partial | Infrastructure dependency (Resend HMAC). TC infrastructure note in matrix. |
| Projections HITL expiry sweep (exact timing) | Conceptual (TC-AI003) | Manual CRON trigger needed. Covered in CYCLE-06 conceptually. |
| Offline sync full conflict matrix | TC-OFL002 covers server-wins | Exploratory session covers remaining conflict scenarios. |

---

*End of WebWaka OS QA Execution Plan v1.0*  
*Source: `WebWaka_OS_QA_Test_Matrix.md` v1.0 (frozen) | Date: 2026-04-23*  
*9 cycles | 6 release gates | 3 automation tiers | 5 severity levels | 11 apps confirmed | 11 roles confirmed | 14 FSMs confirmed | All compliance areas confirmed*  
*D11 confirmed non-blocking. partner-admin AI confirmed not-implemented and excluded.*
