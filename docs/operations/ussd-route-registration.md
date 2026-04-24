# INF-009: Canonical USSD Route Registration

**Status:** Documented  
**Last verified:** 2026-04-24  
**Branch context:** `staging`

---

## Overview

The WebWaka OS USSD gateway is implemented as a dedicated Cloudflare Worker (`apps/ussd-gateway/`). This document records the canonical USSD route registration, session lifecycle, and integration pattern so that future maintainers can extend or debug USSD flows without re-reading the full codebase.

---

## Canonical Entry Point

| Property | Value |
|---|---|
| Worker name | `webwaka-ussd` |
| Wrangler config | `apps/ussd-gateway/wrangler.toml` |
| Main entry | `apps/ussd-gateway/src/index.ts` |
| HTTP verb | `POST` |
| Path | `/ussd` |
| Content-Type | `application/x-www-form-urlencoded` (Africa's Talking format) |

---

## Request Parameters (Africa's Talking standard)

| Field | Description |
|---|---|
| `sessionId` | Unique session identifier provided by the telco |
| `serviceCode` | USSD short code (e.g. `*384*123#`) |
| `phoneNumber` | Caller MSISDN in E.164 format (e.g. `+2348012345678`) |
| `text` | All user inputs concatenated with `*` (e.g. `1*2*100`) |

---

## Session Lifecycle

```
1. CON response → session stays open (user must input next step)
2. END response → session terminates (final message shown, session closed)
```

- Session state is stored in `RATE_LIMIT_KV` under key `ussd:sess:{sessionId}`.
- Session TTL: `USSD_SESSION_TTL_SECONDS` (exported from `packages/payments/src/session.ts`).
- Rate limiting: max 30 USSD requests per phone number per hour, keyed as `ussd:rl:{phoneNumber}:{hourBucket}`.
- On rate limit exceeded (BUG-054): gateway returns `END` with a user-facing advisory message rather than a raw 429.

---

## Menu Tree Registration

Menus are registered as Hono route handlers in `apps/ussd-gateway/src/ussd-handler.ts`. The `text` field is split on `*` to derive the current menu depth and selection path.

```
text = ""         → Root menu
text = "1"        → Level 1: selection 1
text = "1*2"      → Level 2: within selection 1, chose 2
text = "1*2*500"  → Level 3: amount entry (e.g. transfer ₦5.00)
```

---

## Adding a New USSD Menu Item

1. Open `apps/ussd-gateway/src/ussd-handler.ts`.
2. Add a new branch in the `handleUSSD(text, phoneNumber, sessionId)` function.
3. Return `CON <message>` to keep the session open, or `END <message>` to close it.
4. Write a corresponding test in `tests/e2e/ussd/`.
5. Update this document.

---

## Related Invariants

- **R5 (BUG-054):** Rate-limit exceeded → `END Your session limit has been reached. Please try again in an hour.`
- **ARC-17:** KV outage → fail open (rate limit count defaults to 0).
- **T3:** Session state is tenant-scoped where applicable; public USSD flows (e.g. directory lookup) are cross-tenant by design.

---

## Worker Bindings

| Binding | Type | Purpose |
|---|---|---|
| `DB` | D1 | Business data queries (directory lookup, wallet balance) |
| `RATE_LIMIT_KV` | KV | Session state + per-number rate limiting |
