# Multi-Region D1 Replication Plan (L-10)

## Current State

- D1 primary location: `wnam` (Western North America)
- User base: Primarily Nigeria (West Africa), expanding to Ghana, Kenya
- Read latency from Nigerian edge: ~150-250ms (cross-Atlantic)

## Target State

When Cloudflare D1 supports regional read replicas:
- Primary writes: `wnam` (or `weur` if available closer to Africa)
- Read replicas: `weur` (Western Europe, closer to Africa via submarine cables)
- Automatic region selection based on `CF-IPCountry` header

## Implementation Plan

### Phase 1: Optimize with Smart Caching (Now)

```toml
# wrangler.toml — already leveraging KV for hot reads
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"  # Globally replicated KV for reads
```

Use KV cache for frequently-read data:
- Geography tables (zones, states, LGAs) → cache in KV with 24h TTL
- FX rates → cache with 15min TTL
- Vertical registry → cache with 1h TTL

### Phase 2: D1 Read Replicas (When Available)

```toml
# Future wrangler.toml configuration
[[d1_databases]]
binding = "DB"
database_name = "webwaka-production"
database_id = "..."
primary_location = "weur"  # Closer to Africa
read_replication = { mode = "automatic" }  # CF-managed replicas
```

### Phase 3: Multi-Primary (Future)

For write-heavy workloads (POS transactions):
- Primary per region
- CRDT-based conflict resolution for eventual consistency
- Strong consistency for financial transactions (single primary)

## Latency Targets

| Operation | Current | Target (Phase 1) | Target (Phase 2) |
|-----------|---------|-------------------|-------------------|
| Geography read | 200ms | 50ms (KV cache) | 30ms (replica) |
| FX rates read | 180ms | 40ms (KV cache) | 25ms (replica) |
| Entity write | 300ms | 300ms (unchanged) | 200ms (weur primary) |
| POS transaction | 350ms | 350ms (unchanged) | 150ms (regional) |

## Monitoring

Track via `performance.now()` in db-perf.ts:
- D1 read latency P50/P95 by region
- D1 write latency P50/P95
- Cache hit ratio (KV) per data type
