# INF-010: Canonical Notification Package Reference

**Status:** Documented  
**Last verified:** 2026-04-24  
**Branch context:** `staging`

---

## Canonical Package Name

```
@webwaka/notifications
```

**Path:** `packages/notifications/`  
**Exports:** Hono-compatible notification routing, D1 adapter types (`D1LikeFull`), channel dispatchers (email, SMS, push, in-app).

---

## Usage Locations

| Consumer | Import pattern |
|---|---|
| `apps/api` | `import { ... } from '@webwaka/notifications'` |
| `apps/notificator` | `import { ... } from '@webwaka/notifications'` |
| `apps/api/src/routes/notification-routes.ts` | `import { D1LikeFull, ... } from '@webwaka/notifications'` |

---

## Why `as unknown as D1LikeFull` (BUG-045 context)

Cloudflare D1's `D1Database` type does not expose all methods that the notifications package's internal `D1LikeFull` interface requires (e.g. `.batch()` signature mismatch). The double cast:

```typescript
const db = c.env.DB as unknown as D1LikeFull;
```

is **intentional and correct** — not `as any`. It bridges the CF Worker type and the internal adapter interface. The cast is safe because `D1LikeFull` is a strict subset of `D1Database`'s runtime API. BUG-045 is resolved as "expected" — no code change required.

---

## Channel Dispatch Priority

Channels are attempted in priority order per the N-series invariants:

1. **Email** (N-001 through N-020) — Resend API
2. **SMS** (N-021 through N-030) — Africa's Talking
3. **Push** (N-031 through N-040) — FCM/APNs (planned M8)
4. **In-app** (N-041 through N-055) — D1 + KV cache

---

## KV Binding: `NOTIFICATION_KV`

Optional binding. Used to cache notification provider credentials (ADL-002). Declared in `apps/api/src/env.ts` as `NOTIFICATION_KV?: KVNamespace`. Shared with `apps/notificator`.

When absent, the notification system falls back to environment variables (`RESEND_API_KEY`, `AT_API_KEY`). ARC-17 applies: credential fetch failure must fail open (skip channel, log warning).

---

## Invariant References

| Invariant | Description |
|---|---|
| N-001 | Every transactional event must trigger a notification |
| N-048 | Notification provider credentials stored in KV (not env vars) for rotation without redeploy |
| ARC-17 | KV outage → fail open; notification channel skip + warn log |
