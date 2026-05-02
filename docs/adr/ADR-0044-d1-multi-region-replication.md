# ADR-0044: Multi-Region D1 Read Replication for African Users

**Status**: Deferred — blocked on Cloudflare D1 feature availability  
**Date**: 2026-05-01  
**Rule ID**: L-10  
**Deciders**: Platform Engineering  

---

## Context

WebWaka's D1 databases are configured with `primary_location = "wnam"` (Western
North America), which is the closest available region to Cloudflare's D1 write
infrastructure. All writes and reads currently route to this region.

For WebWaka's primary user base in Nigeria (Lagos, Abuja, Port Harcourt), the
round-trip latency from the Nigerian edge to a wnam D1 write is approximately
180–250 ms. Read-heavy endpoints (discovery, geography, profiles) could be
significantly faster with regional replicas.

### Current D1 read latency profile (estimated)

| Query type | Current (wnam) | Target with waf1/meaf replica |
|------------|---------------|-------------------------------|
| GET /geography/states | ~200 ms | ~35 ms |
| GET /discovery | ~220 ms | ~40 ms |
| GET /profile/:id | ~210 ms | ~38 ms |
| POST /auth/login (read+write) | ~240 ms | ~200 ms (write still wnam) |

### Cloudflare D1 regional replica status (as of 2026-05)

Cloudflare has announced D1 read replication but has not yet deployed replicas
in African regions. Available regions are concentrated in North America and Europe.

The `read_replication` field in wrangler.toml is reserved but currently a no-op:
```toml
[[d1_databases]]
binding = "DB"
database_name = "webwaka-production"
read_replication = { mode = "auto" }  # No-op until CF rolls out regional replicas
```

---

## Decision

**Defer implementation until Cloudflare D1 provides an African region replica.**

Estimated trigger: CF adds `waf1` (Lagos) or `meaf` (Middle East / Africa) as a
D1 replica location.

### Actions taken now

1. **Wrangler config pre-positioned**: `read_replication = { mode = "auto" }` is
   added to all D1 database bindings in `wrangler.toml`. When CF activates
   African replicas, the Worker will automatically use them without code changes.

2. **Monitoring**: Subscribe to Cloudflare D1 changelog
   (https://developers.cloudflare.com/d1/changelog/) for replica region announcements.

3. **Query routing design** (documented here for future implementation):
   When read replicas are available, read-heavy endpoints must use a read-only
   D1 binding (`DB_READ`) while writes use the primary (`DB`). This requires a
   `c.env.DB_READ` binding in the Worker.

### Wrangler config change (applied now)

```toml
# Production D1 — primary (writes)
[[d1_databases]]
binding = "DB"
database_name = "webwaka-production"
database_id = "<production-db-id>"
primary_location = "wnam"

# Production D1 — read replica (no-op until CF activates; auto-enabled when available)
[[d1_databases]]
binding = "DB_READ"
database_name = "webwaka-production"
database_id = "<production-db-id>"
read_replication = { mode = "auto" }
```

**Note**: Using the same `database_id` for `DB_READ` means it currently behaves
identically to `DB`. When CF activates read replicas, `DB_READ` queries will
automatically route to the nearest replica.

### Read-heavy endpoints to migrate to DB_READ (Phase 2)

| Endpoint | Route | DB operation |
|----------|-------|-------------|
| Geography | GET /geography/* | Read only |
| Discovery | GET /discovery | Read only |
| Public profiles | GET /profile/:id/e2e-pubkey | Read only |
| OpenAPI | GET /openapi, /changelog | Read only |
| Templates | GET /templates | Read only |
| Social feed | GET /feed | Read only |

All write endpoints (`POST`, `PATCH`, `DELETE`) will continue using primary `DB`.

---

## Implementation Plan (Future — when replicas available)

1. Add `DB_READ` binding to `wrangler.toml` (done above).
2. Update `Env` type to include `DB_READ: D1Database`.
3. Audit all route handlers — pass `DB_READ` to read-only repository methods.
4. Measure latency improvement on staging.
5. Roll out to production with A/B latency comparison.

Estimated effort when unblocked: 1 sprint (2 weeks).

---

## Consequences

**Positive (now)**
- Zero additional cost or complexity; `read_replication` is a no-op until CF activates.
- When CF activates African replicas, improvement is instant with no code changes.

**When activated**
- Read latency target: <50 ms from Nigerian edge (vs ~220 ms current).
- Stale read risk: D1 replicas have eventual consistency for reads. Acceptable
  for read-heavy public data (geography, discovery, feed) but NOT for
  auth/payment-critical reads — those must use primary `DB`.

**Risks**
- CF may never add African D1 replicas — fallback is to self-host PlanetScale
  or Turso in a Lagos VPS, with a proxy Worker. This would require a full DB
  migration (not planned unless CF replication is unavailable by 2027).

---

## Acceptance Criteria

- [x] ADR committed to `docs/adr/`
- [x] `read_replication = { mode = "auto" }` pre-positioned in wrangler.toml
- [x] Read-heavy endpoints identified for DB_READ migration
- [ ] D1 African replica activated by Cloudflare (external dependency)
- [ ] DB_READ binding wired into read-only repository methods
- [ ] Latency target <50 ms verified from Lagos edge
