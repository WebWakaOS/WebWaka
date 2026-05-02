# ADR-0047: Chaos Engineering Strategy

**Status**: Accepted — Phase 1 implemented  
**Date**: 2026-05-01  
**Rule ID**: L-11  
**Deciders**: Platform Engineering  

---

## Context

WebWaka has no systematic chaos testing. The following failure modes are
untested at the integration level:

1. **KV unavailability** — rate-limit middleware is designed to "fail open"
   (allow the request) when `RATE_LIMIT_KV.get()` throws. Confirmed in unit
   tests but never validated against a realistic Hono app integration.
2. **Queue saturation** — background queues (emails, notifications) have no
   backpressure test. Overflow behaviour is undocumented.
3. **D1 latency spikes** — timeout handling in route handlers is untested;
   if D1 `prepare().bind().first()` hangs, does the Worker respond with a
   503 or silently hang until the CPU limit is hit?
4. **R2 put failure** — DSAR export stores results in R2. If `put()` throws,
   the processor should retry and eventually mark the request as `failed`.

---

## Decision

**Implement a phased chaos test suite:**

### Phase 1 (this ADR — delivered now)
Integration-level chaos tests using mocked bindings that simulate:
- KV `get()` / `put()` throwing network errors
- D1 `first()` hanging for >30s (resolved to timeout via `AbortSignal`)
- R2 `put()` throwing — verify DSAR processor retries and marks `failed`

These run in the existing Vitest suite with fully mocked CF bindings.
Location: `apps/api/src/chaos/chaos.test.ts`

### Phase 2 (future — Cycle 05+)
- Miniflare-based integration tests with `RATE_LIMIT_KV` replaced by a
  fault-injecting proxy that drops N% of calls.
- Load test + fault injection using k6 with Xk6-chaos extension.
- `wrangler dev` + manual fault injection via KV dashboard overrides.

---

## Implementation — Phase 1 Scenarios

### Scenario 1: Rate-limit middleware fails open on KV error

```
RATE_LIMIT_KV.get() → throws Error("KV_UNAVAILABLE")
Expected: request is allowed through (fail-open), no 429, no 500
```

### Scenario 2: Rate-limit middleware fails open on KV timeout

```
RATE_LIMIT_KV.get() → hangs for 5000ms (never resolves)
Expected: with AbortSignal timeout of 2000ms → allowed through in ≤2000ms
Note: CF Workers enforce a 10ms I/O budget; real KV hangs are bounded.
      This test validates the code path, not real timing.
```

### Scenario 3: D1 query throws on /health endpoint

```
DB.prepare().bind().first() → throws Error("D1_CONNECTION_ERROR")
Expected: /health returns 200 with status: "degraded" (not 500)
```

### Scenario 4: DSAR R2 put failure triggers retry + permanent_failure

```
R2.put() → throws Error("R2_WRITE_FAILED") for all attempts
Expected: DsarProcessorService.processNextBatch() increments retry_count
          → after 3 failures, marks status='permanently_failed'
```

### Scenario 5: Queue consumer handles malformed message body

```
Queue message body: "not valid json"
Expected: consumer catches parse error, logs it, does NOT crash the Worker
```

---

## Acceptance Criteria

- [x] ADR committed to `docs/adr/`
- [x] Phase 1 chaos tests in `apps/api/src/chaos/chaos.test.ts`
- [x] Scenario 1: KV error → fail-open (no 429/500)
- [x] Scenario 2: KV timeout → fail-open with AbortSignal
- [x] Scenario 3: D1 error on /health → degraded (not 500)
- [x] Scenario 4: R2 put failure → DSAR retry + permanent_failure
- [x] Scenario 5: Malformed queue message → no Worker crash
- [ ] Phase 2: Miniflare + k6 chaos (Cycle 05)

---

## Consequences

**Positive**
- Confirms fail-open behaviour for rate limiting under KV outage.
- Documents expected degraded states for ops runbook.
- Provides regression protection for resilience code paths.

**Negative / Risks**
- Phase 1 tests use mocked bindings — real CF behaviour may differ slightly.
  Mitigation: Phase 2 uses Miniflare for closer-to-real testing.
- Chaos tests add ~50ms to the Vitest suite per scenario.
