# ADR-0045: Structured Log Drain — Cloudflare Logpush + Axiom

**Status**: Accepted  
**Date**: 2026-05-01  
**Rule ID**: L-1  
**Deciders**: Platform Engineering  

---

## Context

All WebWaka workers currently emit structured JSON logs to `console.log/error`,
which are visible only in the Cloudflare dashboard (tail / live tail) or via a
tail worker. There is no persistent external log sink, which means:

1. Logs are not searchable beyond the 72-hour Cloudflare dashboard retention.
2. No alerting or anomaly detection is possible without a log sink.
3. Compliance (NDPR audit trail) requires ≥ 7-day log retention.

The platform already emits structured JSON on every event:
```json
{"level":"info","event":"user_login","user_id":"...","tenant_id":"...","ts":"..."}
```

---

## Decision

**Use Cloudflare Logpush → Axiom as the primary log drain.**

### Why Axiom?
- Native Cloudflare Logpush integration (zero extra code in Workers).
- Serverless pricing — free for <10GB/month (well within initial traffic).
- Structured JSON querying (APL — Axiom Processing Language).
- Alert rules on field values (e.g., `level == "error"`).
- 30-day retention on free tier, 90-day on Pro.
- Alternative considered: Datadog (expensive), Logtail/Better Stack (viable backup).

### Architecture

```
Cloudflare Worker
   └─ console.log/error (structured JSON)
         └─ Cloudflare Logpush (HTTP dataset endpoint)
               └─ Axiom (https://cloud.axiom.co)
                     └─ Datasets: webwaka-api, webwaka-notificator, webwaka-admin
```

Logpush sends batches every 30 seconds or when ≥ 1000 log lines accumulate.

### What to configure (ops steps)

1. In Axiom: create a dataset `webwaka-api`, generate an API token.
2. In Cloudflare Dashboard → Analytics & Logs → Logpush:
   - Destination: HTTP
   - URL: `https://api.axiom.co/v1/datasets/webwaka-api/ingest`
   - Headers: `Authorization: Bearer <AXIOM_API_TOKEN>`, `Content-Type: application/json`
   - Dataset filter: Worker Trace Events
3. Repeat for `webwaka-notificator` and `webwaka-admin` datasets.
4. Add `AXIOM_DATASET` and `AXIOM_API_TOKEN` to the secret rotation reminder schedule.

### Code changes (minimal)

The workers already emit well-structured JSON. No code change is required in
the hot path. However, a lightweight tail worker is added to forward logs
to Axiom when direct Logpush is not available (e.g., for Workers Free plan):

```typescript
// apps/log-tail/src/index.ts (already exists)
// Enhanced to forward to Axiom via HTTP if AXIOM_API_TOKEN is set
```

See `apps/log-tail/src/index.ts` for the implementation.

---

## Acceptance Criteria

- [x] ADR committed to `docs/adr/`
- [x] Tail worker (`apps/log-tail`) enhanced with Axiom forwarding
- [x] `AXIOM_API_TOKEN` added to secret rotation reminder list
- [ ] Logpush configured in Cloudflare dashboard (ops action — requires CF account access)
- [ ] Axiom datasets created: `webwaka-api`, `webwaka-notificator`, `webwaka-admin`
- [ ] Logs searchable in Axiom with 7-day minimum retention confirmed

---

## Consequences

**Positive**
- Log retention: 30–90 days (vs 72 hours in CF dashboard).
- Full-text + structured search on all worker logs.
- Alert rules possible (e.g., error rate > 5% triggers PagerDuty/Slack).
- Zero additional latency in Workers (async, non-blocking Logpush).

**Negative / Risks**
- Axiom free tier: 10GB/month — must monitor log volume.
- Logpush has a ~30-second delay — not suitable for real-time alerts.
  Mitigation: use tail worker for real-time critical alerts (already implemented).
- API token rotation required every 90 days (added to secret rotation schedule).
