# WebWaka OS — Deep Code Review Findings
**Date:** 2026-04-19  
**Reviewer:** Principal Engineer (AI-assisted full-codebase sweep)  
**Scope:** `apps/api`, `apps/projections`, `apps/workspace-app`, `workers/`, `infra/db/`, `.github/workflows/`  
**Methodology:** Multi-pass review — auth paths, tenant isolation, middleware stack, migration correctness, CRON wiring, entitlement enforcement, OpenAPI coverage

---

## Executive Summary

**Security posture: SOLID — no P0/P1 vulnerabilities found.**

The platform's foundational security architecture (tenant isolation, auth, token revocation, rate limiting, audit logging) is correctly implemented throughout. Three actionable findings follow, all P2/P3. One requires owner confirmation (entitlement scope decision); two are documented for future sprints.

---

## Finding 1 — P2: `requireRole` missing at router level for super_admin routes

**Status:** ✅ FIXED (commit `181ae31d`)

### Description
`/partners/*` and `/platform/analytics/*` applied `authMiddleware` (validates JWT, sets `ctx.var.user`) but relied exclusively on per-handler super_admin role checks inside each route handler. This is a maintenance risk: any new handler added to these route groups could be written without the check, silently serving authenticated non-super_admin users.

### Impact
- No privilege escalation possible from outside the platform (JWT must be valid, user must be authenticated)
- Risk is internal developer error creating a handler without the guard — not an active exploit

### Fix Applied
Created `apps/api/src/middleware/require-role.ts`:
```typescript
export function requireRole(requiredRole: UserRole): MiddlewareHandler<HonoEnv> {
  return async (ctx, next) => {
    const user = ctx.var.user;
    if (!user) return ctx.json({ error: 'Unauthorized' }, 401);
    if (!hasRole(user.role, requiredRole)) return ctx.json({ error: 'Forbidden' }, 403);
    return next();
  };
}
```

Applied in `apps/api/src/router.ts`:
```typescript
app.use('/partners/*', authMiddleware);
app.use('/partners/*', requireRole('super_admin'));   // ← NEW defense-in-depth layer
app.use('/partners/*', auditLogMiddleware);

app.use('/platform/analytics/*', authMiddleware);
app.use('/platform/analytics/*', requireRole('super_admin'));  // ← NEW defense-in-depth layer
```

Per-handler role checks remain as a second layer. All 2463 tests pass.

---

## Finding 2 — P2: Commerce P2/P3/Extended vertical routes missing `requireEntitlement`

**Status:** ⚠️ FLAGGED FOR OWNER — requires business decision

### Description
The full vertical route surface breaks into two groups:

**Group A — Entitlement-enforced (correct):**
| Routes | Entitlement enforced |
|--------|---------------------|
| `/verticals/politician/*` | `requireEntitlement(PlatformLayer.Politician)` |
| `/verticals/pos-business/*` | `requireEntitlement(PlatformLayer.POSBusiness)` |
| `/verticals/transport/*` | `requireEntitlement(PlatformLayer.Transport)` |
| `/verticals/civic/*` | `requireEntitlement(PlatformLayer.Civic)` |
| `/verticals/superagent/*` | `requireEntitlement(PlatformLayer.SuperAgent)` |
| Commerce P1 core routes | `requireEntitlement(PlatformLayer.Commerce)` |

**Group B — Auth-only, no entitlement check (~60+ verticals):**
| Vertical batch | Example routes |
|----------------|---------------|
| Commerce P2 (Set D) | `/api/v1/auto-mechanic/*`, `/api/v1/bakery/*`, `/api/v1/car-wash/*` |
| Commerce P3 (Set H) | `/api/v1/ngo/*`, `/api/v1/mosque/*`, `/api/v1/artisanal-mining/*` |
| Commerce P3 (Set I) | `/api/v1/funeral-home/*`, `/api/v1/dry-cleaning/*`, `/api/v1/photo-studio/*` |
| Extended | `/api/v1/fishing/*`, `/api/v1/livestock-farming/*` |

### Root Cause
These were implemented in Phases 9–10 as rapid expansion batches. The `requireEntitlement` middleware existed but was not uniformly applied to the extended batch.

### Impact
- **T3 tenant isolation is intact**: all repository SQL uses `WHERE tenant_id = ?` — cross-tenant data leakage impossible
- **Auth is intact**: all routes require valid JWT
- **Revenue model gap**: tenants without a Commerce subscription can access Commerce P2/P3 verticals
- **This may be intentional**: if the business model allows free-tier access to vertical management tools

### Action Required from Owner
Please confirm the intended access model:
1. **Option A (gate all commerce verticals):** Apply `requireEntitlement(PlatformLayer.Commerce)` to all Group B routes. Breaks free-tier users who currently use them. Run in a `breaking-change/` branch.
2. **Option B (free-tier access to basic verticals):** Document that Group B verticals are intentionally ungated. Update `docs/governance/entitlement-model.md` to reflect this.
3. **Option C (hybrid):** Gate premium features (analytics, AI advisory) within each vertical but leave basic CRUD ungated.

---

## Finding 3 — P3: OpenAPI spec covers ~10% of API surface area

**Status:** 📋 DOCUMENTED — backlog item for integrator experience sprint

### Description
`apps/api/src/routes/openapi.ts` is a static JSON spec that documents only the initial MVP routes. The spec comments claim "Auto-generated from route definitions" but this is not implemented — it is hand-maintained and severely out of date.

### Coverage Gap

| Area | In Spec | Total Routes | Gap |
|------|---------|--------------|-----|
| Health | 2/3 | `/health`, `/health/version`, `/health/ready` | `/health/ready` |
| Auth | 4/17 | login, verify, refresh, me | register, logout, sessions, invite, forgot/reset-password, erasure |
| Geography | 3/6 | place by id + children + ancestry | states, lgas, wards endpoints |
| Workspaces | 0/6 | — | entirely missing |
| Identity (BVN/NIN) | 0/8 | — | entirely missing |
| Community/Social | 0/12 | — | entirely missing |
| Airtime/Payments | 0/6 | — | entirely missing |
| Webhooks | 0/4 | — | entirely missing |
| POS float ledger | 2/6 | create terminal, balance | credit, debit, reverse, history |
| Admin/Platform | 0/8 | — | entirely missing |
| Verticals (all groups) | 0/60+ | — | entirely missing |

### Recommendation
Migrate to `@hono/zod-openapi` with schema inference so the spec auto-generates from route definitions. This is a non-trivial refactor (~1–2 week sprint) but eliminates permanent spec drift. Alternatively, use `hono/openapi` with hand-annotated routes as an intermediate step.

**This is not a security or functionality issue.** It affects external API integrators only.

---

## CRON / Worker Wiring Audit

**Status:** ✅ ALL GREEN — no issues found

### Workers Deployed

#### `apps/api` Worker
| Schedule | Handler | What it does |
|----------|---------|--------------|
| `*/15 * * * *` | `runNegotiationExpiry` | Expires stale negotiation sessions; cleans up abandoned accepted sessions >24h |

#### `apps/projections` Worker
| Schedule | Handler | What it does |
|----------|---------|--------------|
| `*/15 * * * *` | `rebuildSearchIndexFromEvents`, `HitlService.expireAllStale` | Incremental FTS5 search rebuild + HITL session expiry |
| `0 */4 * * *` | `rebuildSearchIndexFromEvents`, `HitlService.expireAllStale` | Same as above (4-hour catch-up sweep) |
| `0 2 * * *` | `computeAnalyticsSnapshots`, bank transfer auto-expiry | Daily: analytics aggregation + expire pending bank transfers >48h |

### Correctness
- All `cron` strings in `wrangler.toml` have matching `case` branches in the `scheduled` handler
- Both workers export `{ fetch, scheduled }` — correct ESM pattern for Cloudflare Workers
- Both `staging` and `production` environments in `wrangler.toml` have identical trigger configs
- Job progress is tracked in `projection_checkpoints` table (run count, last run, error state)
- All handlers wrapped in `try/catch` — failure in one job does not prevent others from running

---

## Auth & Tenant Isolation Audit

**Status:** ✅ SOLID — P0 concerns: NONE

### Findings

**JWT validation:**
- `authMiddleware` validates signature, expiry, JTI claim
- Token blacklist check (KV store) + session validity check (D1)
- All secrets rotatable — no hardcoded signing secrets in code

**Tenant isolation (T3 compliance):**
- Every repository method that returns data binds `tenant_id` as a SQL parameter
- No raw string interpolation of tenant IDs anywhere in the codebase
- No `SELECT *` without a `WHERE tenant_id = ?` clause in production code paths

**Rate limiting:**
- Login: 10 req/min per IP
- Register: 5 req/min per IP
- Password reset: 3 req/min per IP
- Invite: 10 req/min per tenant

**Sensitive route protections:**
- Bank transfer routes: require `emailVerified = true`
- B2B marketplace: require `emailVerified = true`
- USSD routes: explicitly excluded from AI advisory (compliance)
- Financial mutations: all pass through `auditLogMiddleware`

**Token revocation:**
- Access tokens: blacklisted in KV on logout/password-change
- Refresh tokens: invalidated in D1 sessions table
- All active sessions visible + deletable via `GET/DELETE /auth/sessions`

---

## Migration Correctness Audit

**Status:** ✅ ALL 256 MIGRATIONS GREEN on both staging and production

All P0 migration bugs discovered and fixed during this session. See `replit.md` for the full defect ledger (D-09 through D-12).

---

## Summary Table

| Finding | Severity | Status | Owner action needed? |
|---------|----------|--------|---------------------|
| requireRole missing at router level | P2 | ✅ Fixed (181ae31d) | No |
| Commerce P2/P3 entitlement gap | P2 | ⚠️ Flagged | Yes — choose Option A/B/C |
| OpenAPI spec 90% incomplete | P3 | 📋 Backlog | No (integrator experience sprint) |
| CRON wiring | — | ✅ All correct | No |
| Auth & tenant isolation | — | ✅ Solid | No |
| All migrations | — | ✅ 256/256 green | No |
