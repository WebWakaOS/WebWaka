# Runbook: Production Rollout — WebWaka Notification Engine v2.1

**Version:** 1.0 | **Phase:** 9 (N-128) | **Owner:** Platform Engineering

---

## Purpose

This runbook documents the procedure for rolling out the WebWaka OS Notification Engine
(Phase 9 / v2.1) to production. The rollout uses feature flags for progressive enablement
and can be fully reversed at any point during the 30-day observation period.

---

## Pre-Rollout Gates (Must All Pass)

| Gate | Verification | Owner |
|------|-------------|-------|
| All Phase 9 tests pass (3,000+ tests) | `pnpm -r test` exits 0 | QA |
| TypeScript: zero errors | `pnpm -r typecheck` exits 0 | Engineering |
| ADL-002 audit passes | `npx tsx scripts/governance-checks/check-adl-002.ts` exits 0 | Security |
| Load test: 10,000 notifs/hr ×100 tenants at <500ms P99 | k6 load test on staging | QA |
| Sandbox CI gate: `NOTIFICATION_SANDBOX_MODE=false` in production | OQ-012 check | DevOps |
| NDPR compliance: consent gating + erasure tested | N-123 suite green | Compliance |
| CBN R8 compliance: OTP SMS-only for transactions | N-124 suite green | Compliance |
| DR drill: failover + dead-letter sweep runbooks tested | Staging drill | Ops |

---

## Rollout Phases

### Phase 0 — Staging Validation (Day 1-3)

```bash
# Deploy notificator to staging
wrangler deploy --env staging --config apps/notificator/wrangler.toml

# Deploy projections to staging (N-100b: HITL legacy removed)
wrangler deploy --env staging --config apps/projections/wrangler.toml

# Deploy API to staging
wrangler deploy --env staging --config apps/api/wrangler.toml
```

Enable the notification pipeline in staging:

```bash
# Enable pipeline (if not already enabled)
wrangler secret put NOTIFICATION_PIPELINE_ENABLED --env staging
# Enter: 1
```

Validate staging behaviour:
- Send 100 test events via smoke test suite
- Confirm `notification_delivery.status = 'dispatched'` for all
- Confirm `NOTIFICATION_SANDBOX_MODE = 'true'` is respected (no real emails sent)
- Run governance checks: `npx tsx scripts/governance-checks/check-adl-002.ts`

---

### Phase 1 — Production Canary: 5% of Tenants (Day 4-7)

Enable the notification pipeline for a small cohort of early-adopter tenants:

```bash
# Set pipeline enabled (global)
wrangler secret put NOTIFICATION_PIPELINE_ENABLED --env production
# Enter: 1

# Confirm SANDBOX is OFF in production
grep "NOTIFICATION_SANDBOX_MODE" apps/notificator/wrangler.toml
# Expected: NOTIFICATION_SANDBOX_MODE = "false" (under [env.production.vars])
```

Enable for canary tenants via D1 feature flag:

```sql
-- Enable notification pipeline for canary tenants
UPDATE workspace
SET notification_pipeline_enabled = 1
WHERE id IN (
  'ws_canary_001', 'ws_canary_002', 'ws_canary_003',
  'ws_canary_004', 'ws_canary_005'
);
```

**Monitor for 48 hours:**
- Zero double-notifications (compare delivery count vs legacy count)
- Email/SMS delivery success rate > 99%
- No NDPR violations (suppression respected)
- No cross-tenant data leakage in audit logs

---

### Phase 2 — Production Expansion: 25% of Tenants (Day 8-14)

```sql
-- Expand to 25% of active tenants (e.g., by tenant_id hash)
UPDATE workspace
SET notification_pipeline_enabled = 1
WHERE MOD(CAST(SUBSTR(id, -4) AS INTEGER), 4) = 0
  AND status = 'active';
```

**Monitor for 7 days:**
- Delivery rate across all channels
- Provider error rates per channel (target < 2%)
- P99 dispatch latency (target < 2 seconds)
- Daily digest flush rate (target > 99.5% of batches flushed on time)
- Dead-letter queue volume (target < 0.1% of total deliveries)

---

### Phase 3 — Full Production Rollout (Day 15-21)

```sql
-- Enable for all tenants
UPDATE workspace SET notification_pipeline_enabled = 1 WHERE status = 'active';
```

```bash
# Remove old NOTIFICATION_PIPELINE_ENABLED secret (now universal)
# Keep in place as a global kill-switch for emergencies
```

**Monitor for 14 days** (N-129 30-day monitoring period starts here).

---

### Phase 4 — Legacy Cleanup (Day 22-30)

After 14 days of stable full-rollout:

1. Remove legacy EmailService instantiations from auth-routes.ts and workspaces.ts
2. Delete `NOTIFICATION_PIPELINE_ENABLED` kill-switch from Env types
3. Archive this runbook to `docs/ops/archive/`

---

## Rollback Procedure

### Immediate rollback (any phase)

```bash
# Disable pipeline (reverts to legacy EmailService path)
wrangler secret put NOTIFICATION_PIPELINE_ENABLED --env production
# Enter: 0
```

### Full CRON rollback (if projections CRON is misbehaving)

```bash
# Disable projections cron temporarily
wrangler triggers delete --env production --config apps/projections/wrangler.toml
```

### Tenant-level rollback

```sql
UPDATE workspace
SET notification_pipeline_enabled = 0
WHERE id IN ('<TENANT_ID_LIST>');
```

---

## Contacts

| Role | Contact |
|------|---------|
| Release manager | Platform Engineering lead |
| QA sign-off | QA lead |
| Compliance | Compliance Officer |
| On-call escalation | #platform-incidents Slack |
| Monitoring dashboards | Cloudflare Workers Analytics |

---

## Success Criteria (30-Day Observation)

- [ ] Zero NDPR breach incidents
- [ ] Zero CBN R8 violations (transaction OTPs via SMS confirmed)
- [ ] Delivery success rate ≥ 99.5% across all channels
- [ ] P99 end-to-end latency ≤ 3 seconds (event publish → channel dispatch)
- [ ] Zero cross-tenant data leakage incidents
- [ ] Zero double-notification incidents
- [ ] Dead-letter queue volume < 0.1% of total deliveries
- [ ] All governance checks green (`check-adl-002`, `check-tenant-isolation`, OQ-012)
