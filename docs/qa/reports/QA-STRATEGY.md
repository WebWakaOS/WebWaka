# WebWaka Notification Engine — QA Strategy
## Scope: Phase 0–9 Complete (N-001 through N-130, N-100b)
**Date:** 2026-04-20  
**Authority:** docs/qa/QA-MASTER-PROMPT.md  
**Status:** ACTIVE

---

## 1. Objectives

Verify that the WebWaka Notification Engine (Phase 0–9) is correct, secure, compliant, and ready for unrestricted production rollout. No area, repo, role, or compliance dimension is excluded.

---

## 2. Scope

| Dimension | In Scope |
|---|---|
| Repositories | All 11 apps + all notification/otp packages |
| Compliance | NDPR G23, CBN R8/R14, ADL-002, CAN-SPAM suppression |
| Architecture | 9 wrangler.toml files, 2 queue names, 7 D1 bindings, KV, R2 |
| Notification guardrails | G1 through G25 |
| Section 13 decisions | OQ-001 through OQ-013 |
| Test types | Unit, integration, E2E, regression, isolation, negative, edge, sandbox, load |
| Roles | super_admin, tenant_admin, workspace_admin, partner_admin, end_user |

---

## 3. Methodology

### Step 0 — Documentation Audit (COMPLETE)
Read all specification documents, ADRs, runbooks, wrangler configs, migrations, and source files.

### Step 1 — QA Strategy (THIS DOCUMENT)
Define approach, scope, risk areas, and output document plan.

### Step 2 — Platform-Wide Architecture Verification
Verify wrangler.toml consistency, D1 IDs, queue names, env var kill-switches, migration coverage.

### Step 3 — Notification Engine Correctness
Verify every sub-system: event production, queue flow, rules, audience, preferences, brand/locale, templates, dispatch, delivery FSM, inbox, digest, audit, NDPR, Section 13 decisions.

### Step 4 — E2E Scenario Testing
Run all user-role × notification-scenario flows. Verify cross-tenant isolation.

### Step 5 — QA Depth Coverage
Gap-check unit, integration, E2E, regression, isolation, negative/edge, sandbox, load, accessibility, observability, audit, schema, mobile, offline.

### Step 6 — Fix-and-Verify Loop
For every defect: Discover → Document → Plan → Fix → Retest → Typecheck → Update docs → Mark complete. No batch fixes.

### Step 7 — Specialist Review
Code review sub-agent for NDPR/CBN compliance and G1-G25 guardrail implementations.

### Step 8 — Output Documents
All 9 QA output documents in docs/qa/reports/.

---

## 4. Risk Areas (Priority Order)

| Risk | Area | Guardrail | Priority |
|---|---|---|---|
| Queue name mismatch — USSD events lost | USSD Gateway → Notificator | G21 OQ-009 | P0 CRITICAL |
| Staging D1 ID split — cross-service isolation | 9 wrangler configs | G1 | P0 CRITICAL |
| HITL_LEGACY orphaned config in notificator | N-100b cleanup | OQ-002 | P1 |
| NOTIFICATION_PIPELINE_ENABLED="0" in prod config | Kill-switch | N-009 | P1 |
| KV placeholder IDs in notificator | NOTIFICATION_KV binding | G16 ADL-002 | P1 |
| NOTIFICATION_SANDBOX_MODE in dev root config | G24 | OQ-012 | P2 |
| Sandbox suppress-not-redirect case (no address for channel) | sandbox.ts | G24 | P2 |
| audit_log event_type CHECK — 'notification.bounced' absent | Migration | G9 | P2 |
| webhook_deliveries status field mismatch | N-131 | G10 | P2 |

---

## 5. Test Coverage Requirements

| Type | Packages/Areas | Minimum |
|---|---|---|
| Unit | packages/notifications, packages/otp | All functions, happy+error paths |
| Integration | apps/notificator consumer, digest, sandbox | Queue batch processing |
| E2E | Full pipeline: api → queue → notificator → delivery | Per channel, per role |
| Isolation | Cross-tenant query guard | Adversarial tenant injection |
| Negative | Missing tenantId, invalid eventKey, bad template vars | All G1/G7/G14 paths |
| Edge | Critical severity bypass quiet hours, low_data_mode, suppression | G11/G12/G20/G22 |
| Regression | All existing 510 notifications + 68 OTP tests | 0 regressions after fixes |
| Compliance | NDPR erasure, CBN OTP channels, ADL-002 creds | Automated checks |

---

## 6. Output Documents

| Document | Purpose |
|---|---|
| QA-STRATEGY.md (THIS) | Approach, scope, risk |
| VERIFICATION-MAP.md | Spec requirement → code location → test |
| TEST-MATRIX.md | Test type × feature × result |
| DEFECT-LOG.md | All discovered defects with severity/status |
| FIX-LOG.md | Every fix with file, change, test reference |
| VERIFICATION-LOG.md | Per-area verification runs and results |
| REGRESSION-SUMMARY.md | Test suite results before/after fixes |
| RELEASE-READINESS.md | Final go/no-go with all gates |
| UNRESOLVED-ISSUES.md | Known issues requiring operational input |

---

## 7. Exit Criteria

- [ ] All confirmed defects resolved or documented as operational blockers
- [ ] pnpm -r typecheck: 0 errors
- [ ] pnpm test: all suites pass (510 notifications + 68 OTP + consumer + sandbox + digest tests)
- [ ] npx tsx scripts/governance-checks/check-adl-002.ts: exits 0
- [ ] All 25 guardrails (G1–G25) verified in code
- [ ] All 13 OQ decisions (OQ-001–OQ-013) verified in implementation
- [ ] No raw API keys in any D1 column (ADL-002)
- [ ] NOTIFICATION_SANDBOX_MODE='true' in staging, 'false' in production
- [ ] USSD gateway queue names match notificator consumer queue names
- [ ] Staging D1 inconsistency documented and tracked
