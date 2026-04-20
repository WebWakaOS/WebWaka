# Defect Log — WebWaka Notification Engine QA
**Date:** 2026-04-20  
**QA Phase:** Post Phase 9  
**Authority:** docs/qa/QA-MASTER-PROMPT.md

---

## Active Defects

### DEF-001 — CRITICAL: USSD Gateway Queue Name Mismatch

| Field | Value |
|---|---|
| **ID** | DEF-001 |
| **Severity** | CRITICAL (P0) |
| **Area** | Infrastructure — Cloudflare Queues |
| **Guardrail** | G21 (OQ-009) — USSD-origin SMS immediate |
| **Spec Reference** | Section 13 OQ-009; notification_event.source='ussd_gateway' |
| **Discovered** | 2026-04-20 QA Step 0 |
| **Status** | FIXED |

**Description:**  
`apps/ussd-gateway/wrangler.toml` publishes notification events to a different queue than `apps/notificator` consumes from.

| Environment | USSD Gateway publishes to | Notificator consumes from |
|---|---|---|
| dev | `webwaka-notification-pipeline` | `webwaka-notification-queue` (consumer binding) |
| staging | `webwaka-notification-pipeline-staging` | `webwaka-notification-queue-staging` |
| production | `webwaka-notification-pipeline` | `webwaka-notification-queue-production` |
| api (producer) staging | `webwaka-notification-queue-staging` | ← correct reference |
| api (producer) production | `webwaka-notification-queue-production` | ← correct reference |

**Impact:**  
All USSD-originated notification events (payment confirmations, session events, balance alerts) are published to a queue that no Worker consumes. These events are silently lost after 7 days (CF Queue retention). G21 (USSD-origin SMS immediate) is completely non-functional. G9 (audit every send) is violated for USSD events.

**Root Cause:**  
`apps/ussd-gateway/wrangler.toml` was written using `webwaka-notification-pipeline` (the name from an earlier architecture draft). When the queue was finalized as `webwaka-notification-queue-{env}` in `apps/api` and `apps/notificator`, the USSD gateway was not updated.

**Fix:**  
Updated `apps/ussd-gateway/wrangler.toml`:
- dev: `webwaka-notification-pipeline` → `webwaka-notification-queue`
- staging: `webwaka-notification-pipeline-staging` → `webwaka-notification-queue-staging`
- production: `webwaka-notification-pipeline` → `webwaka-notification-queue-production`

**Test Verification:**  
- Queue name alignment verified in wrangler.toml  
- G21 path: USSD event with source='ussd_gateway' reaches notificator consumer
- ADL-002 governance check: exits 0 post-fix

---

### DEF-002 — MEDIUM: HITL_LEGACY_NOTIFICATIONS_ENABLED Orphaned in Notificator

| Field | Value |
|---|---|
| **ID** | DEF-002 |
| **Severity** | MEDIUM (P1) |
| **Area** | Configuration — apps/notificator |
| **Guardrail** | N-100b (OQ-002 Phase 6 cleanup) |
| **Spec Reference** | Section 13 OQ-002; N-100b backlog item |
| **Discovered** | 2026-04-20 QA Step 0 |
| **Status** | FIXED |

**Description:**  
N-100b completed cleanup of `HITL_LEGACY_NOTIFICATIONS_ENABLED` from `apps/projections`. However, the same variable was left orphaned in `apps/notificator`:

- `apps/notificator/wrangler.toml`: declares `HITL_LEGACY_NOTIFICATIONS_ENABLED = "1"` in dev, staging, and production `[vars]` sections  
- `apps/notificator/src/env.ts`: declares the field in the `Env` interface  
- `apps/notificator/src/index.ts`: exposes the field in the `/health` endpoint response

**Impact:**  
Not a functional defect — notificator never branches on this variable. However:  
1. The health endpoint `/health` returns a `hitlLegacy` field that signals the legacy path is active, which is misleading (the legacy path was retired in Phase 6/N-100b)  
2. Dead configuration in wrangler.toml increases future maintenance risk  
3. Ops dashboards or monitoring that inspect the `/health` response may incorrectly flag the system as using the legacy HITL path  
4. N-100b completion is inaccurate as the cleanup was partial

**Root Cause:**  
N-100b task scope targeted `apps/projections` specifically. The notificator was scaffolded with HITL_LEGACY_NOTIFICATIONS_ENABLED in env.ts as a monitoring field, but the cleanup task did not extend to the notificator Worker.

**Fix:**  
Removed `HITL_LEGACY_NOTIFICATIONS_ENABLED` from:
- `apps/notificator/wrangler.toml` (dev, staging, production `[vars]` sections)
- `apps/notificator/src/env.ts` (`Env` interface)
- `apps/notificator/src/index.ts` (`/health` endpoint response object)

**Test Verification:**  
- TypeScript typecheck: 0 errors after removal (field was optional in no critical path)
- Health endpoint no longer returns `hitlLegacy` field
- Consumer and digest still function (neither referenced this field)

---

### DEF-003 — HIGH: Staging D1 Database ID Split Across Workers

| Field | Value |
|---|---|
| **ID** | DEF-003 |
| **Severity** | HIGH (P0) |
| **Area** | Infrastructure — D1 Database Configuration |
| **Guardrail** | G1 — cross-tenant data isolation; operational data consistency |
| **Spec Reference** | Section 8.0 — shared D1 across notification pipeline |
| **Discovered** | 2026-04-20 QA Step 0 |
| **Status** | OPEN — requires operational verification |

**Description:**  
In staging, Cloudflare Workers are split across two different D1 database instances:

| Workers | Staging D1 ID | Database Name |
|---|---|---|
| apps/api, apps/notificator | `52719457-5d5b-4f36-9a13-c90195ec78d2` | `webwaka-staging` |
| apps/projections, apps/brand-runtime, apps/partner-admin, apps/ussd-gateway, apps/admin-dashboard, apps/public-discovery | `7c264f00-c36d-4014-b2fe-c43e136e86f6` | `webwaka-os-staging` |

In **production**, all Workers use the same D1:
- `72fa5ec8-52c2-4f41-b486-957d7b00c76f` (`webwaka-os-production`)

**Impact:**  
- Notification deliveries written by notificator (to `52719457`) are invisible to brand-runtime, partner-admin, ussd-gateway, etc. (which read from `7c264f00`)
- Projections' HITL data in `7c264f00` is invisible to notificator reading from `52719457`  
- Any staging E2E test that spans notificator → partner-admin inbox would show no results
- Cross-Worker consistency is broken in staging; production is unaffected

**Root Cause:**  
Two hypotheses:  
1. `apps/api` was re-provisioned with a new D1 instance (`52719457`) at some point. When `apps/notificator` was scaffolded, it copied the api's ID. The other workers were never updated.  
2. OR: All workers were on `7c264f00` initially; the api was accidentally re-bound to a new instance.

**Resolution Required:**  
Operational team must confirm which staging D1 is the canonical database (the one with live migration data). All workers must be updated to use the same staging D1.

**Recommended Fix:**  
If `7c264f00` (`webwaka-os-staging`) is canonical (matches all other workers and the naming convention "webwaka-os-*"):  
- Update `apps/api/wrangler.toml` staging D1 to `7c264f00`  
- Update `apps/notificator/wrangler.toml` staging D1 to `7c264f00`

If `52719457` (`webwaka-staging`) is canonical:  
- Update all 7 other workers to `52719457`

**Blocking:** This defect blocks any staging environment E2E verification. Production is unaffected.

---

### DEF-004 — LOW: NOTIFICATION_PIPELINE_ENABLED="0" in Production Config Template

| Field | Value |
|---|---|
| **ID** | DEF-004 |
| **Severity** | LOW (P2) — informational |
| **Area** | Configuration — apps/notificator/wrangler.toml |
| **Guardrail** | N-009 kill-switch |
| **Spec Reference** | Section 11 Phase 1 exit criteria |
| **Discovered** | 2026-04-20 QA Step 0 |
| **Status** | DOCUMENTED — expected operational state |

**Description:**  
`apps/notificator/wrangler.toml` has `NOTIFICATION_PIPELINE_ENABLED = "0"` in all three environments (dev, staging, production). This is by design — the kill-switch starts off and is enabled explicitly via `wrangler secret put` or wrangler var update when the platform team is ready to activate the pipeline.

**Impact:**  
Current state: pipeline is not processing any queued events. This is intentional during Phase 9 validation. The pipeline will be enabled per the production rollout runbook.

**Note for Release:**  
Per `docs/ops/runbooks/production-rollout.md`, the release sequence requires: staging validation complete → enable in staging (`NOTIFICATION_PIPELINE_ENABLED = "1"`) → 48-hour observation → enable in production. This has not yet been executed.

---

### DEF-005 — LOW: NOTIFICATION_KV Placeholder IDs in Notificator

| Field | Value |
|---|---|
| **ID** | DEF-005 |
| **Severity** | LOW (P2) — operational, not code |
| **Area** | Configuration — apps/notificator/wrangler.toml |
| **Guardrail** | G16 (ADL-002) — credentials in KV only |
| **Spec Reference** | §8.0 NOTIFICATION_KV binding; OQ-001 resolution |
| **Discovered** | 2026-04-20 QA Step 0 |
| **Status** | DOCUMENTED — requires provisioning |

**Description:**  
`apps/notificator/wrangler.toml` has `id = "<NOTIFICATION_KV_STAGING_ID>"` and `id = "<NOTIFICATION_KV_PRODUCTION_ID>"` as placeholder strings in the `[[kv_namespaces]]` binding for `NOTIFICATION_KV`.

**Impact:**  
The notificator Worker cannot be deployed until these KV namespace IDs are provisioned and substituted. The OQ-001 resolution document includes the provisioning command: `wrangler kv namespace create NOTIFICATION_KV --env staging`.

**Required Action:**  
Provision KV namespaces and replace placeholder IDs before any production deploy.

---

## Closed Defects

| ID | Severity | Area | Description | Closed |
|---|---|---|---|---|
| DEF-001 | CRITICAL | Queue config | USSD gateway queue name mismatch | 2026-04-20 |
| DEF-002 | MEDIUM | Config cleanup | HITL_LEGACY_NOTIFICATIONS_ENABLED in notificator | 2026-04-20 |
