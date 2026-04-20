# Fix Log — WebWaka Notification Engine QA
**Date:** 2026-04-20  
**Authority:** docs/qa/QA-MASTER-PROMPT.md  
**Fix-and-Verify Protocol:** Discover → Document → Plan → Fix → Retest → Typecheck → Update docs → Mark complete

---

## FIX-001 — DEF-001: USSD Gateway Queue Name Mismatch

| Field | Value |
|---|---|
| **Fix ID** | FIX-001 |
| **Defect** | DEF-001 |
| **Severity** | CRITICAL |
| **Date** | 2026-04-20 |
| **Status** | COMPLETE |

### Files Changed

| File | Change |
|---|---|
| `apps/ussd-gateway/wrangler.toml` | dev queue: `webwaka-notification-pipeline` → `webwaka-notification-queue` |
| `apps/ussd-gateway/wrangler.toml` | staging queue: `webwaka-notification-pipeline-staging` → `webwaka-notification-queue-staging` |
| `apps/ussd-gateway/wrangler.toml` | production queue: `webwaka-notification-pipeline` → `webwaka-notification-queue-production` |

### Verification

- [x] Queue names now match `apps/notificator` consumer bindings (all 3 environments)
- [x] Queue names now match `apps/api` producer bindings (staging and production)
- [x] No TypeScript changes required — wrangler.toml only
- [x] ADL-002 governance check: exits 0 (unchanged)
- [x] All 635 tests pass (510 notifications + 68 OTP + 57 notificator worker)

### Notes
USSD gateway now correctly enqueues notification events to the same queue the notificator worker consumes. G21 (USSD-origin SMS immediate) is now operationally connected end-to-end.

---

## FIX-002 — DEF-002: HITL_LEGACY_NOTIFICATIONS_ENABLED Orphaned in Notificator

| Field | Value |
|---|---|
| **Fix ID** | FIX-002 |
| **Defect** | DEF-002 |
| **Severity** | MEDIUM |
| **Date** | 2026-04-20 |
| **Status** | COMPLETE |

### Files Changed

| File | Change |
|---|---|
| `apps/notificator/wrangler.toml` | Removed `HITL_LEGACY_NOTIFICATIONS_ENABLED = "1"` from `[vars]` (dev), `[env.staging.vars]`, and `[env.production.vars]` |
| `apps/notificator/src/env.ts` | Removed `HITL_LEGACY_NOTIFICATIONS_ENABLED: '0' \| '1'` field from `Env` interface |
| `apps/notificator/src/index.ts` | Removed `hitlLegacy: c.env.HITL_LEGACY_NOTIFICATIONS_ENABLED` from `/health` endpoint response |
| `apps/notificator/src/consumer.test.ts` | Removed `HITL_LEGACY_NOTIFICATIONS_ENABLED: '1' as const` from `makeTestEnv()` |
| `apps/notificator/src/sandbox.test.ts` | Removed `HITL_LEGACY_NOTIFICATIONS_ENABLED: '1'` from `makeEnv()` |
| `packages/notifications/src/types.ts` | Removed `hitlLegacyNotificationsEnabled` field from `KillSwitchConfig` interface; updated JSDoc comment |

### Verification

- [x] `cd apps/notificator && npx tsc --noEmit`: 0 errors
- [x] `cd packages/notifications && npx tsc --noEmit`: 0 errors
- [x] `cd apps/notificator && pnpm test`: 57 tests pass (consumer, sandbox, digest)
- [x] `cd packages/notifications && pnpm test`: 510 tests pass
- [x] `cd packages/otp && pnpm test`: 68 tests pass
- [x] No external callers of `KillSwitchConfig` used `hitlLegacyNotificationsEnabled`
- [x] `kill-switch.ts` implementation confirmed: only reads `notificationPipelineEnabled`
- [x] ADL-002 governance check: exits 0

### Notes
N-100b cleanup is now complete across all Workers. The health endpoint no longer misleadingly signals that the HITL legacy path is active. The `KillSwitchConfig` interface is cleaner and matches its actual usage.
