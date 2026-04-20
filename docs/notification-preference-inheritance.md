# Notification Preference Inheritance Model

**Task N-006 (Phase 0)** — Canonical specification for the 4-level preference inheritance model, including low_data_mode (G22) and USSD-origin rules (G21).

---

## 1. Overview

User notification preferences are resolved through a 4-level inheritance chain:

```
platform → tenant → role → user
```

The most specific scope wins. Each level can override the parent. All resolution is KV-cached with a 5-minute TTL per `(tenant_id, user_id, channel)` combination (N-061).

---

## 2. Scope Definitions

| Scope | `scope_type` | `scope_id` | Who controls it | Description |
|---|---|---|---|---|
| Platform | `platform` | `'platform'` | super_admin only | Global defaults for all tenants |
| Tenant | `tenant` | `tenant_id` | tenant_admin | Tenant-wide defaults |
| Role | `role` | `role_name` | tenant_admin | Role-based overrides (e.g., all managers get email only) |
| User | `user` | `user_id` | user (self) | Personal preferences |

---

## 3. Inheritance Resolution Algorithm

```
function resolvePreference(tenantId, userId, userRole, channel, source):
  1. Load preference rows (in order, from most general to most specific):
     - WHERE scope_type='platform' AND event_key='*'
     - WHERE scope_type='tenant'   AND tenant_id=tenantId AND event_key='*'
     - WHERE scope_type='role'     AND scope_id=userRole  AND tenant_id=tenantId AND event_key='*'
     - WHERE scope_type='user'     AND scope_id=userId    AND tenant_id=tenantId AND event_key='*'
     (Repeat for event-specific event_key, which overrides the '*' catch-all)

  2. Merge: last-write wins (user scope overrides role, role overrides tenant, etc.)

  3. Apply USSD-origin override (G21 — OQ-009):
     IF source == 'ussd_gateway':
       - SMS channel: quiet_hours bypass = TRUE (deliver immediately)
       - Push channel: suppress = TRUE (do not dispatch push)
       - In-app channel: follow normal quiet hours

  4. Apply low_data_mode restrictions (G22 — OQ-011):
     IF user scope has low_data_mode = 1:
       - Push channel: enabled = FALSE (suppress)
       - In-app channel: text_only_mode = 1 (render without images)
       - Email channel: no change (server-side; no client data cost)
       - SMS channel: enabled only for severity='critical'
       - Polling interval hint: 120 seconds (sent to workspace-app as header)

  5. Return ResolvedPreference
```

---

## 4. Quiet Hours

Quiet hours block non-critical notifications during specified hours in the user's timezone.

- **Default timezone:** `Africa/Lagos` (WAT, UTC+1)
- **Configuration:** `quiet_hours_start` and `quiet_hours_end` (hour 0-23, inclusive)
- **Enforcement:** Notifications blocked by quiet hours are DEFERRED, not suppressed (G11).
  - The notification is re-enqueued as a CF Queue message with a delay equal to the time until quiet hours end.
  - The original event is preserved; a new delivery record is created for the deferred attempt.
- **Critical bypass:** `severity='critical'` notifications bypass quiet hours entirely (G12).
- **USSD bypass:** `source='ussd_gateway'` + `channel='sms'` bypasses quiet hours (G21).

---

## 5. Digest Windows

When `digest_window` is set to `'hourly'`, `'daily'`, or `'weekly'`, individual notifications are batched rather than dispatched immediately. The batch is sent at the end of the window.

| Window | Trigger | CRON in apps/notificator |
|---|---|---|
| `hourly` | Top of each hour | `0 * * * *` |
| `daily` | 00:00 WAT (23:00 UTC) | `0 23 * * *` |
| `weekly` | 00:00 WAT Monday | `0 23 * * 0` |

- `digest_window='none'` (default): immediate dispatch.
- `severity='critical'` events bypass digest windows (G12).
- Each batch is one `notification_digest_batch` row with multiple `notification_digest_batch_item` rows.
- The CRON sweep (OQ-007) queries `WHERE status='pending' AND window_end <= now LIMIT 100` and enqueues each batch as a separate Queue message (G12 T3 isolation: each message contains `tenant_id`).

---

## 6. Low-Data Mode (G22 — OQ-011)

Set at `user` scope only. Cannot be overridden by platform rules.

| Channel | Behaviour when `low_data_mode=1` |
|---|---|
| `push` | SUPPRESSED — do not dispatch |
| `in_app` | `text_only_mode=1` — render without image asset fetches |
| `email` | UNAFFECTED — server-side send; no client data cost |
| `sms` | PERMITTED for `severity='critical'` only |
| Polling interval | Hint sent to workspace-app: 120 seconds (instead of 30s) |

This preference is user-controlled. The `IPreferenceStore.update()` method MUST NOT accept `low_data_mode` updates from tenant_admin or platform scope — only from `user` scope.

---

## 7. USSD-Origin Handling (G21 — OQ-009)

When `notification_event.source='ussd_gateway'`:

| Channel | Behaviour |
|---|---|
| `sms` | Dispatch IMMEDIATELY. Bypass quiet hours. Bypass digest window. |
| `push` | SUPPRESSED — do not dispatch (Nigerian users on USSD are typically not on smartphones) |
| `in_app` | Write to inbox normally. Follow standard quiet hours. |
| `email` | Follow standard preference and quiet hours. |

This matches the behavior expected by Nigerian users for USSD-triggered payment events: every bank USSD transfer sends a parallel SMS receipt. The USSD session is never interrupted.

---

## 8. KV Caching (N-061)

Preference reads are cached in `NOTIFICATION_KV` with:
- **Key format:** `{tenant_id}:pref:{user_id}:{channel}`
- **TTL:** 5 minutes (300 seconds)
- **Invalidation:** On `IPreferenceStore.update()`, all affected cache keys are deleted.

Cache keys MUST be tenant-prefixed (G1 — tenant isolation absolute rule).

---

## 9. Default Preference Matrix

These are the platform-scope defaults seeded in migration 0269:

| Channel | `enabled` | `quiet_hours_start` | `quiet_hours_end` | `digest_window` |
|---|---|---|---|---|
| `email` | 1 | 22 | 7 | `none` |
| `sms` | 1 | 22 | 7 | `none` |
| `push` | 1 | 22 | 7 | `none` |
| `in_app` | 1 | — | — | `none` |
| `whatsapp` | 1 | 22 | 7 | `none` |

All defaults use timezone `Africa/Lagos`.

---

## 10. Preference Audit (G9)

Every preference change must be recorded in `notification_audit_log` with:
- `event_type = 'preference.changed'`
- `actor_id` = the user making the change
- `recipient_id` = the user whose preference is being changed
- `metadata` = `{ channel, scope_type, old_value, new_value }`

Preference audit rows are subject to G23 (NDPR erasure): `actor_id` and `recipient_id` are zeroed to `'ERASED'` on erasure request; the row is never deleted.

---

*This document is authoritative for N-006. See `packages/notifications/src/types.ts` for the `IPreferenceStore` TypeScript interface.*
