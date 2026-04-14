# ADR-0019: D1 Connection Lifecycle

**Status:** ACTIVE
**Author:** Platform team
**Date:** 2026-04-14
**Phase:** 17 / Sprint 14
**Supersedes:** —
**Superseded by:** —
**ID:** ARC-09

---

## Context

Cloudflare D1 (SQLite on the edge) is the primary database for WebWaka OS. Unlike traditional databases, D1 operates within the Cloudflare Workers request lifecycle — there is no persistent connection pool, no idle connections, and no TCP teardown cost. Understanding this lifecycle is essential for writing correct, performant route handlers.

---

## Decision

### 1. The D1 binding is request-scoped

Each Worker invocation receives a fresh `DB` binding via `c.env.DB`. There is no shared connection across requests. This means:

- **No connection pool management** is needed — D1 handles concurrency internally.
- **No explicit open/close** calls — the binding is valid for the lifetime of the Worker invocation.
- **Transactions are per-request** — multi-statement transactions cannot span invocations.

### 2. Use `DB.batch()` for multi-query operations

When a route handler needs results from multiple independent queries, use `DB.batch()` to send them in a single HTTP roundtrip to the D1 backend. This is the primary PERF-11 optimization.

```typescript
const [profileResult, relResult] = await c.env.DB.batch([
  c.env.DB.prepare('SELECT * FROM profiles WHERE id = ?').bind(id),
  c.env.DB.prepare('SELECT * FROM relationships WHERE subject_id = ?').bind(id),
]);
```

### 3. Prepared statements are not cached across requests

`DB.prepare(sql)` creates a new statement object on every call. There is no statement cache — the D1 backend compiles the query on each request. This is acceptable because:

- D1 internally caches query plans.
- Workers invocations are short-lived; the overhead is negligible.

### 4. Transactions via `DB.batch()` with `BEGIN`/`COMMIT`

For atomic multi-statement writes, use `DB.batch()` with explicit transaction statements:

```typescript
await c.env.DB.batch([
  c.env.DB.prepare('BEGIN'),
  c.env.DB.prepare('INSERT INTO orders ...').bind(...),
  c.env.DB.prepare('UPDATE inventory ...').bind(...),
  c.env.DB.prepare('COMMIT'),
]);
```

> **Note:** D1's batch() executes statements sequentially and atomically within the same SQLite database page. It is not equivalent to a distributed transaction.

### 5. Tenant isolation (T3) is enforced in every query

Every `SELECT`, `INSERT`, `UPDATE`, `DELETE` that touches tenant-scoped tables **must** include `tenant_id = ?` bound from the JWT, never from user input. This is enforced by governance check `scripts/governance-checks/check-tenant-isolation.ts`.

### 6. Error handling

D1 errors surface as thrown exceptions from `.run()`, `.first()`, and `.all()`. Route handlers should catch these and return appropriate HTTP status codes. D1 does not have connection timeouts — the Workers request timeout (typically 10–30 seconds) is the effective upper bound.

---

## Consequences

- **Positive:** No connection pool to manage; simplified operational model.
- **Positive:** `DB.batch()` reduces roundtrip latency for multi-query handlers.
- **Positive:** Tenant isolation enforced at query level (not connection level) — correct for multi-tenant SQLite.
- **Neutral:** No persistent connections means cold-start latency is ~1–5ms per D1 query (within Workers this is negligible).
- **Negative:** Long-running analytics queries block the Worker request. Mitigation: offload to Queues or use scheduled Workers.

---

## References

- [Cloudflare D1 documentation](https://developers.cloudflare.com/d1/)
- ADR-0013: D1 as Primary Database
- ADR-0007: Cloudflare D1 Environment Model
- PERF-11 in `docs/enhancements/ENHANCEMENT_ROADMAP_v1.0.1.md`
