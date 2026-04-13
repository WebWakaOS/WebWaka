# ADR-0014: JWT Authentication and Multi-Tenancy Strategy

**Status:** ACTIVE
**Approval owner:** Platform team
**Author:** Platform team
**Date:** 2026-04-13
**Supersedes:** —
**Superseded by:** —

---

## Context

WebWaka OS serves 145+ business verticals across a multi-tenant, multi-role SaaS platform. Authentication and authorisation must:
- Work stateless on Cloudflare Workers (no server-side sessions, no Redis)
- Carry tenant context (`tenant_id`, `workspace_id`, `role`) without a database lookup on every request
- Support the T3 platform invariant (tenant isolation on all data access)
- Support multiple roles: `super_admin`, `admin`, `member`, `viewer`, `partner`, `sub_partner`
- Be revocable via short token lifetimes + refresh flow
- Never trust client-supplied tenant context (no `x-workspace-id` header trust)

---

## Decision

Use **short-lived JWT tokens** (15-minute access + 7-day refresh) issued by the API's `/auth/login` route. JWTs are signed with `HS256` using `JWT_SECRET` (Cloudflare Workers Secret). All JWT claims are verified by the `resolveAuthContext()` middleware in `packages/auth/`.

The JWT payload includes:
```
{
  sub: UserId,          // user.id
  tenant_id: TenantId,  // tenant the user belongs to
  workspace_id: WorkspaceId,  // workspace context (can change per request context)
  role: Role,           // 'super_admin' | 'admin' | 'member' | ...
  iat, exp
}
```

All protected routes call `resolveAuthContext()` first; the `AuthContext` object is stored in Hono's context variables for downstream use. No route may trust client-supplied tenant_id — only the JWT payload.

---

## Alternatives Rejected

| Alternative | Reason Rejected |
|-------------|----------------|
| **Session cookies + server-side store** | Requires Redis/KV session store and sticky routing — incompatible with stateless Cloudflare Workers at the edge. |
| **OAuth 2.0 (third-party IdP)** | Adds external dependency (Auth0, Clerk, etc.) and round-trip to auth server. Unnecessary complexity for a first-party platform. BYOID via OAuth can be added as an extension later. |
| **x-workspace-id header trust** | CRITICAL SECURITY FLAW. Client can forge any workspace_id. Removed in SEC-001 (2026-04-11). |
| **Opaque tokens + introspection** | Would require a database lookup on every request — too slow for edge Workers. |
| **RS256 (asymmetric)** | Adds key pair management overhead. HS256 with a strong secret stored in CF Workers Secrets is sufficient for a single-platform issuer. |

---

## Consequences

- **Positive:** Fully stateless — no database hit for auth on every request. JWT verification is pure crypto in memory.
- **Positive:** T3 is automatically enforced — `tenant_id` from JWT is used in all queries; client cannot manipulate it.
- **Positive:** Role-based access control is zero-database: `requireRole('admin')` middleware inspects JWT claim.
- **Negative:** JWTs are not revocable before expiry without a denylist (KV). Current implementation uses short 15-minute access tokens to limit the revocation window.
- **Negative:** Workspace context switching requires re-issuance of a new JWT (if user belongs to multiple workspaces). Currently handled by re-login.

---

## Multi-Tenancy Scoping Pattern

Every database query in the platform follows this pattern:
```typescript
await db.prepare(
  'SELECT * FROM table WHERE id = ? AND tenant_id = ?'
).bind(id, auth.tenantId).first();
```

The `auth.tenantId` comes exclusively from `resolveAuthContext(c)`. No other source is trusted. Violation of this pattern is a T3 invariant breach.

---

## References

- `packages/auth/src/index.ts` — `resolveAuthContext()` and `requireRole()` implementations
- `packages/types/src/auth.ts` — `AuthContext`, `JwtPayload` types
- `docs/architecture/decisions/0008-auth-tenancy-strategy.md` — earlier ADR (M6 milestone)
- SEC-001 migration note: x-workspace-id header trust removed 2026-04-11
