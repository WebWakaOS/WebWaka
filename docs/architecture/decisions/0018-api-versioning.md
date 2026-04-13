# ADR-0018: API Versioning Strategy

**Status:** ACTIVE
**Approval owner:** Platform team
**Author:** Platform team
**Date:** 2026-04-13
**Supersedes:** —
**Superseded by:** —

---

## Context

WebWaka OS is a multi-tenant, multi-vertical SaaS platform serving 145+ business verticals. The API is consumed by:

1. First-party apps (partner-admin, admin-dashboard, brand-runtime, tenant-public)
2. Third-party tenant apps via tenant API keys
3. Partner integrations (CRMs, ERPs, POS systems)
4. Mobile clients (Expo/React Native) with delayed update cycles

As the platform evolves, breaking changes to the API (field renames, endpoint removal, auth scheme changes) must not break existing consumers. A clear versioning strategy is required before the platform reaches General Availability.

---

## Decision

Adopt **URL path versioning** with a `/v{N}/` prefix as the top-level segment of all API routes.

### Version Routing Pattern

```
/v1/auth/login
/v1/tenants/:id/workspaces
/v1/billing/status
/v2/auth/login       ← future: new auth scheme
```

### Implementation Plan

1. **Current state (pre-GA, v0):** All routes are unversioned (`/auth/login`, `/billing/status`, etc.). This is the implicit `v0` and is allowed during the build phase.
2. **GA milestone:** All routes MUST be prefixed with `/v1/`. A shim at the router level will forward unversioned requests to `/v1/` during a 6-month deprecation window.
3. **Breaking change policy:** A breaking change requires a new major version (`v2`). Non-breaking additions (new fields, new endpoints) do NOT require a new version.
4. **Deprecation:** Deprecated versions MUST be signalled via `Sunset` and `Deprecation` HTTP response headers per RFC 8594.

### Breaking Change Definition

The following constitute breaking changes requiring a new API version:
- Removing or renaming a response field
- Changing a field's type
- Removing an endpoint
- Adding a required request field
- Changing authentication requirements for an existing endpoint
- Changing error response shapes

The following are NOT breaking:
- Adding new optional response fields
- Adding new endpoints
- Adding optional request parameters
- Relaxing validation rules

### OpenAPI Specification

Each version MUST have a corresponding OpenAPI 3.1 spec file:
- `docs/openapi/v1.yaml` — v1 spec (source of truth)
- `apps/api/src/routes/openapi.ts` — serves the spec + Swagger UI at `/docs`

The OpenAPI spec MUST be linted in CI using the `openapi-lint` job before merge to main/staging.

---

## Consequences

### Positive
- Clear contract between API producer and consumers
- Enables independent rollout of breaking changes
- Aligns with REST industry standards
- OpenAPI spec + CI lint prevents spec drift

### Negative
- Increases router complexity (version shim)
- Third-party consumers must update base URLs on major version bumps
- Maintaining multiple API versions in parallel increases test surface

### Mitigations
- Centralized version shim in `registerRoutes()` — not per-route
- Semantic versioning documentation published in CONTRIBUTING.md
- Automated deprecation header injection via middleware

---

## Alternatives Considered

| Option | Rejected because |
|--------|-----------------|
| Header versioning (`Accept: application/vnd.webwaka.v1+json`) | Harder to use in curl/Postman; less visible in logs and dashboards |
| Query parameter (`?version=1`) | Not idiomatic; breaks HTTP caching semantics |
| No versioning (implicit breakage) | Violates our promise to third-party tenant integrations |
| Date-based versioning (Stripe model) | Over-complex for current team size; revisit at GA+1yr |

---

## Related ADRs

- ADR-0015: Hono as API framework — versioning is implemented via Hono router
- ADR-0013: D1 as primary database — schema migrations are independent of API versions

---

## Review checklist

- [x] All existing routes tagged as `v0` (implicit) in OpenAPI spec
- [ ] `/v1/` prefix shim added to `registerRoutes()` at GA milestone
- [ ] `Sunset` header middleware implemented for deprecated routes
- [ ] `docs/openapi/v1.yaml` spec file created and CI lint passing
