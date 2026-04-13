# ADR-0015: Hono as the API Framework

**Status:** ACTIVE
**Approval owner:** Platform team
**Author:** Platform team
**Date:** 2026-04-13
**Supersedes:** —
**Superseded by:** —

---

## Context

WebWaka OS API runs on Cloudflare Workers. The framework must:
- Run on the Cloudflare Workers runtime (V8 isolates — no Node.js APIs except `nodejs_compat`)
- Be ultra-lightweight (Workers have a 10ms CPU budget on free plan)
- Support request routing, middleware, context variables, and typed bindings
- Support TypeScript strictly — all routes must be type-safe
- Have a `c.html()` response helper for SSR HTML routes (admin dashboard, public discovery)
- Support sub-routers (`app.route()`) for modular route organisation

The platform has ~50 route files and 400+ tests. The framework choice has a significant effect on maintainability.

---

## Decision

Use **Hono** (v4.x) as the HTTP framework for all Cloudflare Workers: `apps/api`, `apps/admin-dashboard`, `apps/public-discovery`, `apps/partner-admin`.

Hono is a Cloudflare-native, ultra-lightweight framework with TypeScript-first design, sub-router support, middleware chain, and built-in context variable typing.

---

## Alternatives Rejected

| Alternative | Reason Rejected |
|-------------|----------------|
| **Itty Router** | Minimal but lacks typed context variables, middleware chain, and `c.html()`. Would require significant boilerplate for auth context propagation. |
| **Workers SDK (raw fetch handler)** | No routing, no middleware, no context. Massive boilerplate for 50+ route files. |
| **Express (via `@hono/node-server`)** | Node.js-only. Would require Hyperdrive + Node compatibility. Not edge-native. Defeats the purpose of Cloudflare Workers. |
| **Fastify** | Node.js-only. Same issue as Express. |
| **Elysia** | Bun-only. Not compatible with Cloudflare Workers runtime. |

---

## Key Usage Patterns

**Typed bindings (Env → D1, KV, secrets):**
```typescript
const app = new Hono<{ Bindings: Env }>();
```

**Context variables (auth context propagation):**
```typescript
declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}
app.use('*', resolveAuthContextMiddleware);
```

**Sub-routers (modular route organisation):**
```typescript
app.route('/templates', templateRoutes);
app.route('/marketplace', marketplaceRouter);
```

**Important:** The app export must use `app.fetch.bind(app)` (not the Hono instance itself):
```typescript
export default { fetch: app.fetch.bind(app), scheduled: ... };
```
Tests must use `app.fetch(new Request(...), env)` — NOT `app.request()`.

---

## Consequences

- **Positive:** Extremely lightweight — 0-overhead routing in the Workers runtime.
- **Positive:** TypeScript-first — all context variables, bindings, and middleware are typed.
- **Positive:** `c.html()` enables SSR HTML rendering in admin-dashboard and public-discovery without a separate template engine.
- **Positive:** `app.route()` enables modular organisation of 50+ route files without performance penalty.
- **Negative:** Hono v4 has minor API differences from v3. All imports must use `hono/cors`, `hono/secure-headers` etc. (not `hono/middleware/cors`).
- **Negative:** `app.request()` in tests sends requests without the `Bindings` env — use `app.fetch(req, env)` instead.

---

## References

- `apps/api/src/index.ts` — root Hono app setup
- `apps/admin-dashboard/src/index.ts` — admin dashboard Hono app
- `apps/public-discovery/src/index.ts` — public discovery Hono app
- B1 bug fix: `app.fetch` not `app.request` in test helpers (2026-04-12)
