# ADR-0018: Comprehensive API Versioning Strategy

**Status**: Accepted  
**Date**: 2026-05-01  
**Rule ID**: L-5  
**Deciders**: Platform Engineering, Product  
**Supersedes**: Informal versioning convention used before v1.0.0  

---

## Context

WebWaka's API currently sets `X-API-Version: 1` on every response (enforced in
`router.ts`). There is no:
- Explicit URL path prefix for versioned routes (`/v1/`, `/v2/`)
- Deprecation announcement mechanism (`Sunset`, `Deprecation` headers)
- Client migration guide or breaking-change policy
- Automated enforcement that deprecated endpoints send `Sunset` headers

As the platform grows, breaking changes will be needed. Without a policy,
clients break silently, or changes are held back indefinitely.

---

## Decision

### 1. URL versioning strategy

**Current version (v1)**: All routes are served at their existing paths
(e.g., `/auth/login`, `/discovery`, `/workspaces`).  
`X-API-Version: 1` is set globally in the response.

**Future breaking changes**: Use the `/v2/` URL prefix for breaking changes.
Non-breaking additions (new fields, new optional parameters, new endpoints) are
always backward-compatible and do NOT require a new version.

```
Current:  POST /auth/login           →  X-API-Version: 1
Future:   POST /v2/auth/login        →  X-API-Version: 2
          POST /auth/login           →  still works, X-API-Version: 1 + Sunset header
```

This approach:
- Avoids breaking existing integrations on day-1 of v2
- Is discoverable (URL is self-documenting)
- Is easy to route in Cloudflare Workers (prefix match)

### 2. Deprecation policy

When a v1 endpoint is deprecated in favour of a v2 replacement:

1. **Announce 90 days before removal** — add `Sunset` and `Deprecation` headers.
2. **Serve both versions** for ≥90 days.
3. **Remove the v1 endpoint** only after the sunset date has passed.
4. **Log deprecation warnings** when a deprecated endpoint is called (structured log, not an error).

```
Deprecation: Sat, 01 Aug 2026 00:00:00 GMT
Sunset: Mon, 29 Sep 2026 00:00:00 GMT
Link: <https://api.webwaka.com/v2/auth/login>; rel="successor-version"
```

### 3. Breaking vs non-breaking changes

| Breaking (requires v2) | Non-breaking (v1 additive) |
|------------------------|---------------------------|
| Removing a field | Adding an optional field |
| Renaming a field | Adding a new endpoint |
| Changing field type | Adding optional query params |
| Changing HTTP method | New error codes (additive) |
| Changing auth scheme | Relaxing validation rules |
| Removing an endpoint | |

### 4. Version header semantics

- `X-API-Version` in the **response** indicates the version that handled the request.
- Clients MAY send `Accept-Version: 2` to opt into v2 handling before the URL prefix is enforced (future).
- The `GET /changelog` endpoint documents all versions and their status.

### 5. Versioning for internal service-to-service calls

`X-Inter-Service-Version` header (separate from the public API version) is used
for internal worker-to-worker calls. Internal APIs follow semver independently.

---

## Implementation

### Sunset header middleware

`apps/api/src/middleware/deprecation.ts` — a Hono middleware factory that
attaches `Deprecation` and `Sunset` headers to a route or route group:

```typescript
import { sunsetMiddleware } from '@/middleware/deprecation';

// Apply to a deprecated route group
app.use('/auth/v1-compat/*', sunsetMiddleware({
  sunsetDate: new Date('2026-09-29'),
  successorUrl: 'https://api.webwaka.com/v2/auth/',
}));
```

### `/v2/` router slot

`apps/api/src/routes/v2/index.ts` — placeholder that will receive breaking
change routes. Currently empty (v2 has no breaking changes yet).

### Changelog endpoint

`GET /changelog` (implemented, BUG-052) — machine-readable version history.
Updated to include `deprecations[]` array once any endpoint is deprecated.

---

## Consequences

**Positive**
- Clients get 90 days warning before breaking changes.
- `Sunset` / `Deprecation` headers are machine-readable — API gateways and SDKs
  can warn developers automatically.
- Consistent URL prefix policy removes ambiguity for future engineers.

**Negative / Risks**
- Two parallel versions of endpoints must be maintained during the 90-day window.
  Mitigated by keeping the v1 shim as a thin adapter calling v2 logic.
- No "major version" auto-detection by clients without `Accept-Version` support.

---

## Acceptance Criteria

- [x] ADR committed to `docs/adr/`
- [x] `apps/api/src/middleware/deprecation.ts` implemented
- [x] `/v2/` router slot created
- [x] `GET /changelog` includes `deprecations[]` field
- [x] `Sunset` header policy documented in this ADR
- [ ] First actual v2 endpoint (when a breaking change is needed — future)
