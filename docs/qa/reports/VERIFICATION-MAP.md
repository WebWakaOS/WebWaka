# Verification Map — WebWaka Notification Engine QA
## Spec Requirement → Code Location → Test Coverage
**Date:** 2026-04-20  
**Authority:** docs/qa/QA-MASTER-PROMPT.md

---

## Guardrail Verification Map

| Guardrail | Requirement | Code Location | Test File | Status |
|---|---|---|---|---|
| G1 | tenant_id in every D1 query | notification-service.ts, consumer.ts, all services | penetration.test.ts, isolation.test.ts | VERIFIED |
| G2 | No direct EmailService from business routes | packages/notifications/src/ | ESLint rule; N/A (no violations found) | VERIFIED |
| G3 | No hardcoded FROM address; fallback to platform sender | channel-provider-resolver.ts, delivery-service.ts | notification-service.test.ts | VERIFIED |
| G4 | Brand context via @webwaka/white-label-theming | template-renderer.ts | template-renderer.test.ts | VERIFIED |
| G5 | Transaction OTPs → SMS only | packages/otp/src/channel-router.ts | cbn-compliance.test.ts | VERIFIED |
| G6 | No raw OTP values in DB/logs/responses | packages/otp/src/otp-generator.ts | otp.test.ts | VERIFIED |
| G7 | Idempotency key before every dispatch; UNIQUE constraint | notification-service.ts:computeIdempotencyKey(), 0258 migration | notification-service.test.ts, e2e-pipeline.test.ts | VERIFIED |
| G8 | Consent gate for marketing notifications | rule-engine.ts:evaluateRule() | rule-engine.test.ts | VERIFIED |
| G9 | Audit every send attempt | audit-service.ts, consumer.ts:writeFailureAuditLog() | e2e-pipeline.test.ts | VERIFIED |
| G10 | Dead-letter, never discard | consumer.ts:msg.retry(), delivery status='dead_lettered' | consumer.test.ts | VERIFIED |
| G11 | Quiet hours timezone-aware, deferred not suppressed | quiet-hours.ts | quiet-hours.test.ts | VERIFIED |
| G12 | Critical severity bypasses quiet hours; digest tenant isolation | notification-service.ts, digest-engine.ts | digest-engine.test.ts, penetration.test.ts | VERIFIED |
| G13 | Provider abstraction complete | INotificationChannel interface, types.ts | notification-service.test.ts | VERIFIED |
| G14 | Template variables schema-validated | template-renderer.ts | template-renderer.test.ts | VERIFIED |
| G15 | No PII in logs | @webwaka/logging PII masking | ndpr-compliance.test.ts | VERIFIED |
| G16 | Provider credentials in KV only (ADL-002) | credential-store.ts, channel-provider-resolver.ts | check-adl-002.ts governance script | VERIFIED |
| G17 | WhatsApp: meta_approved gate before dispatch | MetaWhatsAppChannel, Dialog360WhatsAppChannel | notification-service.test.ts | VERIFIED |
| G18 | Locale via @webwaka/i18n only | template-renderer.ts | template-renderer.test.ts | VERIFIED |
| G19 | Channel dispatch respects entitlement tier | delivery-service.ts (entitlement check) | notification-service.test.ts | VERIFIED |
| G20 | Suppression list checked before all external dispatches | suppression-service.ts:checkSuppression() | suppression-service.test.ts, e2e-pipeline.test.ts | VERIFIED |
| G21 | USSD-origin → SMS immediate, no push | preference-service.ts + notification_event.source | ndpr-compliance.test.ts | VERIFIED — **was broken by DEF-001** |
| G22 | Low-data mode channel restrictions | preference-service.ts, FCM channel | preference-service.test.ts | VERIFIED |
| G23 | NDPR erasure propagation | erasure-service.ts:propagateErasure() | erasure-service.test.ts, ndpr-compliance.test.ts | VERIFIED |
| G24 | Sandbox mode enforcement | sandbox.ts:assertSandboxConsistency() | sandbox.test.ts | VERIFIED |
| G25 | Webhook event types gated by plan | webhook_event_types migration, API layer | Not directly tested — see UNRESOLVED-ISSUES.md | PARTIAL |

---

## Section 13 OQ Decision Verification Map

| OQ | Decision | Implementation Location | Verified |
|---|---|---|---|
| OQ-001 | New apps/notificator dedicated Worker | apps/notificator/ exists and is the queue consumer | ✓ |
| OQ-002 | HITL migrated; legacy path killed in Phase 6 | apps/projections: HITL_LEGACY removed (N-100b). notificator: DEF-002 orphan cleaned | ✓ (post-fix) |
| OQ-003 | WhatsApp: platform-operated account; meta_approved gate | G17 enforced in MetaWhatsAppChannel; wa_approval_log migration 0271 | ✓ |
| OQ-004 | Sender domain fallback to platform sender | delivery-service.ts:sender_fallback_used flag; G3 | ✓ |
| OQ-005 | Brand hierarchy: walk to platform default; independence flag | white-label-theming package; brand_independence_mode migration 0273 | ✓ |
| OQ-006 | NDPR erasure: zero audit log, hard-delete others, preserve suppression | erasure-service.ts; ADR retention-ttl.md | ✓ |
| OQ-007 | Digest: queue-continued global CRON sweep | digest.ts:sweepPendingBatches(); CRON triggers in notificator wrangler | ✓ |
| OQ-008 | Partner admin: shared inbox API via category filter | migration 0278: category column; idx_notif_inbox_category | ✓ |
| OQ-009 | USSD: SMS immediate; in-app queued; no push; no interrupt | notification_event.source='ussd_gateway'; G21 in preference-service.ts. **DEF-001 fixed** | ✓ (post-fix) |
| OQ-010 | Short-poll 30s; SSE upgrade documented | ADR realtime-sse-upgrade-path.md; N-067 | ✓ |
| OQ-011 | Low-data mode: push suspended; text-only; SMS critical; email deferred | G22; preference-service.ts:low_data_mode | ✓ |
| OQ-012 | Sandbox: redirect to env vars; G24 enforced; CI check | sandbox.ts; assertSandboxConsistency; NOTIFICATION_SANDBOX_MODE in all non-prod wranglers | ✓ |
| OQ-013 | 30-event webhook catalog; tier gating; 25-sub limit | 0272+0277 migrations; G25 | PARTIAL — G25 test coverage gap |

---

## Migration Coverage Map

| Migration | Table | Status | Notes |
|---|---|---|---|
| 0254 | notification_event | VERIFIED | source CHECK includes 'ussd_gateway' ✓ |
| 0255 | notification_rules | VERIFIED | — |
| 0256 | notification_preferences | VERIFIED | — |
| 0257 | notification_templates | VERIFIED | — |
| 0258 | notification_delivery | VERIFIED | idempotency_key UNIQUE ✓, G7 confirmed |
| 0259 | notification_inbox_item | VERIFIED | Phase 0 base |
| 0260 | notification_digest_batch | VERIFIED | — |
| 0261 | notification_digest_batch_item | VERIFIED | — |
| 0262 | notification_audit_log | VERIFIED | G23: actor_id/recipient_id NOT deleted |
| 0263 | notification_subscriptions | VERIFIED | — |
| 0264 | notification_suppression_list | VERIFIED | G23: address_hash only, no raw PII |
| 0268 | seed platform templates | VERIFIED | — |
| 0269 | seed notification rules | VERIFIED | — |
| 0270 | seed channel_providers | VERIFIED | — |
| 0271 | notification_wa_approval_log | VERIFIED | G17 OQ-003 ✓ |
| 0272 | webhook_event_types | VERIFIED | OQ-013 ✓ |
| 0273 | sub_partners_brand_independence | VERIFIED | OQ-005 ✓ |
| 0274 | seed phase2 rules | VERIFIED | — |
| 0275 | tenant_branding_notification_columns | VERIFIED | OQ-004 ✓ |
| 0276 | seed phase3 email templates | VERIFIED | — |
| 0277 | webhook_event_type_plan_tier | VERIFIED | G25 OQ-013 ✓ |
| 0278 | notification_inbox_item phase5 | VERIFIED | OQ-008 category column; delivery_id FK ✓ |

---

## Wrangler Configuration Verification Map

| Worker | NOTIFICATION_PIPELINE_ENABLED | NOTIFICATION_SANDBOX_MODE (staging) | Queue binding | D1 ID (staging) | Status |
|---|---|---|---|---|---|
| apps/notificator | "0" all envs (kill-switch off — expected) | "true" ✓ | Consumer: webwaka-notification-queue-staging ✓ | 52719457 ← DEF-003 |
| apps/api | — (not applicable — producer only) | — | Producer: webwaka-notification-queue-staging ✓ | 52719457 ← DEF-003 |
| apps/ussd-gateway | — | — | Producer: **was** webwaka-notification-pipeline-staging (**DEF-001 FIXED** → webwaka-notification-queue-staging) | 7c264f00 |
| apps/projections | — (no notification binding) | — | No queue binding | 7c264f00 |
| apps/brand-runtime | — | — | No queue binding | 7c264f00 |
| apps/partner-admin | — | — | No queue binding | 7c264f00 |
| apps/admin-dashboard | — | — | No queue binding | 7c264f00 |
| apps/public-discovery | — | — | No queue binding | 7c264f00 |
| apps/tenant-public | — | — | No queue binding | — |
