# Test Matrix — WebWaka Notification Engine QA
**Date:** 2026-04-20  
**Authority:** docs/qa/QA-MASTER-PROMPT.md

---

## Test Suite Summary

| Package / App | Test Files | Tests | Result | Duration |
|---|---|---|---|---|
| `packages/notifications` | 34 | 510 | ✅ ALL PASS | 8.61s |
| `packages/otp` | 3 | 68 | ✅ ALL PASS | 848ms |
| `apps/notificator` | 3 | 57 | ✅ ALL PASS | 1.49s |
| **TOTAL** | **40** | **635** | **✅ ALL PASS** | — |

---

## Feature × Test Type Matrix

| Feature | Unit | Integration | E2E | Isolation | Negative | Edge | Compliance | Files |
|---|---|---|---|---|---|---|---|---|
| Notification event processing | ✅ | ✅ | ✅ | — | ✅ | — | — | notification-service.test.ts, consumer.test.ts |
| Rule engine (load, evaluate) | ✅ | — | ✅ | — | ✅ | — | — | rule-engine.test.ts |
| Audience resolution | ✅ | — | ✅ | ✅ | ✅ | — | — | audience-resolver.test.ts |
| Idempotency gate (G7) | ✅ | — | ✅ | — | ✅ | — | — | notification-service.test.ts, e2e-pipeline.test.ts |
| Preference service (G21, G22) | ✅ | — | ✅ | — | ✅ | ✅ | — | preference-service.test.ts |
| Quiet hours (G11, G12) | ✅ | — | — | — | ✅ | ✅ | — | quiet-hours.test.ts |
| Digest engine (G12 isolation) | ✅ | ✅ | — | ✅ | ✅ | — | — | digest-engine.test.ts, digest-service.test.ts |
| Digest sweep CRON (G1, G12) | ✅ | — | — | ✅ | ✅ | — | — | digest.test.ts (notificator) |
| Suppression service (G20) | ✅ | — | ✅ | — | ✅ | — | — | suppression-service.test.ts |
| Template rendering (G14) | ✅ | — | ✅ | — | ✅ | — | — | template-renderer.test.ts |
| Email wrapper / XSS (G14) | ✅ | — | — | — | — | ✅ | — | email-wrapper.test.ts, xss-security.test.ts |
| Email accessibility (G18) | ✅ | — | — | — | — | — | ✅ | accessibility.test.ts |
| Resend email channel | ✅ | — | — | — | ✅ | — | — | resend-channel.test.ts |
| Termii SMS channel | ✅ | — | — | — | ✅ | — | — | channels/termii-sms-channel.test.ts |
| Meta WhatsApp channel (G17) | ✅ | — | — | — | ✅ | — | — | meta-whatsapp-channel.test.ts |
| 360dialog WhatsApp channel (G17) | ✅ | — | — | — | ✅ | — | — | otp-360dialog.test.ts |
| Telegram channel | ✅ | — | — | — | ✅ | — | — | telegram-channel.test.ts |
| FCM push channel (G22) | ✅ | — | — | — | ✅ | — | — | channels/fcm-push-channel.test.ts |
| Slack webhook channel | ✅ | — | — | — | ✅ | — | — | slack-webhook-channel.test.ts |
| Teams webhook channel | ✅ | — | — | — | ✅ | — | — | teams-webhook-channel.test.ts |
| In-app channel (G22) | ✅ | — | — | — | ✅ | — | — | in-app-channel.test.ts |
| Unsubscribe / suppression (G8) | ✅ | — | — | — | ✅ | — | — | unsubscribe.test.ts |
| NDPR erasure (G23) | ✅ | — | — | — | ✅ | — | ✅ | erasure-service.test.ts, ndpr-compliance.test.ts |
| CBN R8 OTP channel routing | ✅ | — | — | — | ✅ | — | ✅ | cbn-compliance.test.ts |
| OTP generation | ✅ | — | — | — | ✅ | — | — | otp.test.ts |
| ADL-002 credentials in KV | — | — | — | — | — | — | ✅ | check-adl-002.ts (governance script) |
| Multi-tenant isolation (G1) | ✅ | — | — | ✅ | — | ✅ | — | penetration.test.ts, isolation.test.ts |
| Delivery FSM | ✅ | — | — | — | ✅ | — | — | delivery-service-fsm.test.ts |
| Credential store (G16, ADL-002) | ✅ | — | — | — | ✅ | — | ✅ | credential-store.test.ts |
| Channel provider resolver (G3, G4) | ✅ | — | — | — | ✅ | — | — | channel-provider-resolver.test.ts |
| Fallback chain (G3, G13) | ✅ | — | — | — | ✅ | ✅ | — | fallback-chain.test.ts |
| Attribution / analytics | ✅ | — | — | — | — | — | — | attribution.test.ts |
| Bounce anomaly alerts | ✅ | — | — | — | ✅ | — | — | anomaly-alerts.test.ts |
| Sandbox enforcement (G24) | ✅ | — | — | — | ✅ | — | — | sandbox.test.ts (notificator) |
| Queue consumer batch (G9, G10) | ✅ | ✅ | — | ✅ | ✅ | — | — | consumer.test.ts |
| E2E full pipeline | — | — | ✅ | — | — | — | — | e2e-pipeline.test.ts |

---

## Coverage Gaps (for UNRESOLVED-ISSUES)

| Gap | Area | Risk | Priority |
|---|---|---|---|
| G25 webhook plan-tier enforcement | webhook_event_types API layer | MEDIUM | P2 |
| SSE upgrade path (OQ-010 Phase 8) | workspace-app | LOW (future phase) | P3 |
| Low-data mode polling interval (G22) | workspace-app | LOW (frontend) | P3 |
| Load test automation in CI | infra/k6 | LOW | P2 |
| USSD session interrupt guard (G21 second half) | apps/ussd-gateway | MEDIUM | P2 |

---

## Governance Check Results

| Check | Script | Result |
|---|---|---|
| ADL-002: no credentials in D1 | check-adl-002.ts | ✅ PASS — exits 0 |
| Tenant isolation | check-tenant-isolation.ts | (run separately in CI) |
| API versioning | check-api-versioning.ts | (run separately in CI) |
| NDPR before AI | check-ndpr-before-ai.ts | (run separately in CI) |
| Rollback scripts | check-rollback-scripts.ts | (run separately in CI) |
