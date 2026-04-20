# Unresolved Issues — WebWaka Notification Engine QA
**Date:** 2026-04-20  
**Authority:** docs/qa/QA-MASTER-PROMPT.md

These issues could not be fully resolved during QA because they require operational access, external service interaction, or are deferred to a future phase. Each is tracked with a recommended resolution path.

---

## UI-001 — Staging D1 Database ID Split (DEF-003)

| Field | Value |
|---|---|
| **ID** | UI-001 |
| **Severity** | HIGH |
| **Blocker For** | Staging E2E cross-service testing |
| **Production Impact** | NONE (all workers use same production D1) |
| **Owner** | Platform Ops |

**Issue:**  
Staging D1 is split across two database instances:
- `apps/api` + `apps/notificator` use `52719457-5d5b-4f36-9a13-c90195ec78d2` (`webwaka-staging`)
- All 7 other workers use `7c264f00-c36d-4014-b2fe-c43e136e86f6` (`webwaka-os-staging`)
- In production, all workers correctly use `72fa5ec8-52c2-4f41-b486-957d7b00c76f`

**Resolution Required:**  
1. Determine which staging D1 contains the live migration data (run `wrangler d1 execute <id> --command "SELECT name FROM sqlite_master WHERE type='table' AND name='notification_event'"` on both IDs)
2. The database that has the notification tables is the canonical one
3. Update all workers to use the canonical staging D1 ID in `wrangler.toml`
4. If `7c264f00` is canonical: update `apps/api/wrangler.toml` (staging D1) and `apps/notificator/wrangler.toml` (staging D1)
5. If `52719457` is canonical: update the 7 other workers

**Risk if Unresolved:**  
Staging end-to-end tests that span API (writes notification events) → partner-admin (reads inbox) will show empty results. Production is unaffected.

---

## UI-002 — NOTIFICATION_KV Namespace IDs Not Provisioned (DEF-005)

| Field | Value |
|---|---|
| **ID** | UI-002 |
| **Severity** | HIGH for deployment |
| **Blocker For** | Any actual deployment of apps/notificator |
| **Production Impact** | BLOCKS deployment |
| **Owner** | Platform Ops |

**Issue:**  
`apps/notificator/wrangler.toml` contains placeholder KV namespace IDs:
- Staging: `id = "<NOTIFICATION_KV_STAGING_ID>"`
- Production: `id = "<NOTIFICATION_KV_PRODUCTION_ID>"`

**Resolution:**  
```bash
wrangler kv namespace create NOTIFICATION_KV --env staging
# → Copy returned ID to apps/notificator/wrangler.toml [env.staging.kv_namespaces]

wrangler kv namespace create NOTIFICATION_KV --env production  
# → Copy returned ID to apps/notificator/wrangler.toml [env.production.kv_namespaces]
```

These KV namespaces are required for:
- Preference cache reads (`{tenant_id}:pref:{user_id}:{channel}`)
- Unread-count cache (`{tenant_id}:inbox:unread:{user_id}`)
- AES-256-GCM encrypted provider credentials (G16 ADL-002)

---

## UI-003 — NOTIFICATION_PIPELINE_ENABLED="0" — Activation Not Yet Executed

| Field | Value |
|---|---|
| **ID** | UI-003 |
| **Severity** | MEDIUM (expected state) |
| **Blocker For** | Live notification delivery |
| **Production Impact** | Pipeline inactive until switched on |
| **Owner** | Platform Ops / Release Engineering |

**Issue:**  
`NOTIFICATION_PIPELINE_ENABLED = "0"` in all three environments. The pipeline is not yet processing queued events. This is by design for Phase 9 validation.

**Resolution:**  
Execute the production rollout runbook at `docs/ops/runbooks/production-rollout.md`:
1. Resolve UI-001 (staging D1) and UI-002 (KV namespaces) first
2. Set `NOTIFICATION_PIPELINE_ENABLED = "1"` in staging
3. Run staging validation (48-hour observation)
4. Enable in production per rollout sequence

---

## UI-004 — G25 Webhook Plan-Tier API Enforcement (Partial)

| Field | Value |
|---|---|
| **ID** | UI-004 |
| **Severity** | MEDIUM |
| **Blocker For** | G25 full compliance |
| **Production Impact** | Webhook subscription limits not enforced at API layer |
| **Owner** | Backend Engineering |

**Issue:**  
G25 requires that webhook subscription limits (standard: 25, business: 100, enterprise: unlimited) and event tier gating are enforced at the API layer before writing to `webhook_subscriptions`. The database schema is in place (`webhook_event_types.plan_tier` via migration 0277), but the API-layer enforcement code was not reviewed during this QA pass.

**Resolution:**  
- Audit `apps/api/src/` routes for `POST /webhooks/subscriptions` (or equivalent)
- Verify plan tier lookup + limit enforcement before INSERT
- Add dedicated G25 tests to `packages/notifications/src/` covering the 25/100/unlimited limits

---

## UI-005 — USSD Session Interrupt Guard (G21, Second Half)

| Field | Value |
|---|---|
| **ID** | UI-005 |
| **Severity** | LOW |
| **Blocker For** | Full G21 compliance |
| **Production Impact** | Possible in-session USSD interruption on edge cases |
| **Owner** | Backend Engineering |

**Issue:**  
G21 specifies: "Push notifications must not be dispatched for USSD-origin events. In-app channel follows standard quiet hours." The preference service and notification event source field enforce this. However, a specific guard ensuring no notification is dispatched *during an active USSD session* (i.e., while the session KV entry is live) has not been confirmed in code.

**Resolution:**  
- Review `apps/ussd-gateway/src/` for session state management
- Confirm that notification events emitted during a USSD session are tagged with a `ussd_session_id` or similar marker that the preference service can use to defer delivery until session end
- Add test case: emit notification during active session → verify delivery is deferred, not immediate

---

## UI-006 — apps/platform-admin Has No wrangler.toml

| Field | Value |
|---|---|
| **ID** | UI-006 |
| **Severity** | LOW |
| **Blocker For** | Nothing (informational) |
| **Production Impact** | None if it's a static site |
| **Owner** | Platform Architecture |

**Issue:**  
11 apps are listed in the repo but only 9 have `wrangler.toml` files. `apps/platform-admin` and `apps/workspace-app` have no wrangler configuration. This is likely intentional if these are static SPAs deployed separately.

**Resolution:**  
Confirm with platform architecture whether these apps are deployed as Cloudflare Pages, served from a CDN, or embedded in another Worker. Document the deployment mechanism in `infra/cloudflare/environments.md`.

---

## Summary

| ID | Severity | Area | Requires Ops | Requires Code | Deferred Phase |
|---|---|---|---|---|---|
| UI-001 | HIGH | D1 staging split | ✅ | Possible update | Now |
| UI-002 | HIGH | KV provisioning | ✅ | ✅ (IDs in toml) | Before deploy |
| UI-003 | MEDIUM | Pipeline activation | ✅ | — | Before rollout |
| UI-004 | MEDIUM | G25 API enforcement | — | ✅ | Phase 9 follow-up |
| UI-005 | LOW | G21 session guard | — | ✅ | Phase 9 follow-up |
| UI-006 | LOW | platform-admin wrangler | ✅ | — | Informational |
