# ADR-0013: Cloudflare D1 as Primary Database

**Status:** ACTIVE
**Approval owner:** Platform team
**Author:** Platform team
**Date:** 2026-04-13
**Supersedes:** —
**Superseded by:** —

---

## Context

WebWaka OS runs on Cloudflare Workers at the edge. The platform requires a relational database that:
- Co-locates with compute (low latency at the edge)
- Supports SQL (complex joins, T3 tenant isolation, T4 integer arithmetic)
- Scales globally without operational overhead
- Works with the Cloudflare Workers runtime (no TCP sockets, no persistent connections)
- Supports D1 migrations for schema evolution

Traditional databases (PostgreSQL, MySQL, MongoDB) require a TCP connection from Workers via Hyperdrive or a service binding — adding latency and operational complexity. For a Nigeria-first product, minimising round-trip latency at the edge is critical.

---

## Decision

Use **Cloudflare D1** (SQLite-compatible, globally replicated) as the primary database for all persistent data.

D1 is accessed directly from Workers via the `DB` binding — no TCP, no connection pool, no ORM. All queries are raw SQL using D1's `prepare().bind().all/first/run()` API.

---

## Alternatives Rejected

| Alternative | Reason Rejected |
|-------------|----------------|
| **Neon (Postgres serverless)** | TCP connection required via Hyperdrive; 50–150 ms added latency from Nigerian PoPs. Adds cost. |
| **PlanetScale (MySQL)** | Same TCP latency issue. MySQL dialect diverges from platform SQL patterns. |
| **MongoDB Atlas** | No native edge support. Workers can't open a persistent Mongo connection. Document model loses relational expressiveness needed for T3 isolation. |
| **Cloudflare KV only** | KV is key-value only; no SQL, no joins, no transactions. Cannot enforce T3, T4, or any relational invariant. |
| **Durable Objects + SQLite** | Good for per-entity state; not suitable as a shared relational database across tenants. |

---

## Consequences

- **Positive:** Zero added latency — D1 reads from nearest replica. No connection pool management. Migrations are version-controlled SQL files in `apps/api/migrations/`.
- **Positive:** Full SQL (SQLite dialect) — JOINs, indexes, CHECK constraints, UNIQUE constraints for T3/T4 enforcement.
- **Positive:** `wrangler d1 migrations apply` is the sole migration tool — consistent across dev, staging, production.
- **Negative:** D1 uses SQLite dialect — some PostgreSQL syntax (e.g., `RETURNING` in older versions, `ILIKE`) unavailable. All queries must be SQLite-compatible.
- **Negative:** D1 write throughput is lower than dedicated Postgres at very high volume. For WebWaka at current scale (Nigeria-first, ≤ 500k tenants), D1 is more than sufficient.
- **Negative:** No stored procedures, no triggers, no row-level security — all invariants enforced in application code.

---

## Platform Invariants Directly Affected

- **T3 (Tenant Isolation):** `tenant_id` on all tables; every query includes `WHERE tenant_id = ?`.
- **T4 (Money as Integer Kobo — P9):** `price_kobo INTEGER` columns enforced by CHECK constraints.
- **P10 (NDPR consent):** `consent_records` table in D1 gates all personal data collection.

---

## References

- `docs/architecture/decisions/0002-cloudflare-primary-hosting.md` — WHY Cloudflare
- `docs/architecture/decisions/0007-cloudflare-d1-environment-model.md` — D1 environment model (dev/staging/production database IDs)
- `apps/api/migrations/` — all D1 migrations
