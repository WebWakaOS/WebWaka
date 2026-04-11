# WebWaka OS — Incident Response Runbook

**Last updated:** 2026-04-11  
**Owner:** Platform Engineering Team  
**Contact:** security@webwaka.com

---

## Severity Levels

| Level | Definition | Response Time | Examples |
|-------|-----------|---------------|----------|
| **SEV-1 Critical** | Production down or data breach | Immediate (< 15 min) | Cross-tenant data leak, all APIs returning 500, DB corruption |
| **SEV-2 High** | Significant degradation, security concern | < 1 hour | Single app down, auth failures, payment processing broken |
| **SEV-3 Medium** | Partial degradation, non-critical feature broken | < 4 hours | One vertical failing, search degraded, USSD timeout |
| **SEV-4 Low** | Minor issue, workaround available | Next business day | UI glitch, non-critical log noise, stale cache |

---

## Escalation Matrix

| Action | Primary | Secondary | Authority |
|--------|---------|-----------|-----------|
| Detect incident | Monitoring / Cloudflare alerts | Smoke test failures | Automated |
| Initial triage | On-call engineer | Platform team | Engineer |
| Rollback code | On-call engineer | Founder notification | Engineer executes, Founder notified |
| Rollback DB migration | Platform team | Founder approval | Founder approves |
| Rotate secrets | On-call engineer | Security officer | Immediate action |
| Notify affected tenants | Founder | Customer success | Founder approves messaging |
| Post-incident review | Platform team lead | All stakeholders | Required for SEV-1/SEV-2 |

---

## Incident Response Procedures

### Phase 1: Detection

1. **Automated detection:**
   - Cloudflare Worker analytics (error rate spike)
   - Smoke test failures in `tests/smoke/`
   - D1 audit log anomalies
   - GitHub Actions CI failures on staging

2. **Manual detection:**
   - User/tenant reports
   - Internal testing
   - Security audit findings

### Phase 2: Triage

1. Assign severity level (SEV-1 through SEV-4)
2. Identify affected scope:
   - Which app(s): api, brand-runtime, public-discovery, ussd-gateway?
   - Which tenant(s): single tenant or platform-wide?
   - Which data: is tenant data at risk?
3. Document initial findings in incident log

### Phase 3: Containment

**For cross-tenant data exposure (SEV-1):**
1. Immediately isolate affected tenant(s) by disabling their access
2. Report to `security@webwaka.com`
3. Audit the `audit_logs` D1 table for the affected time window
4. Preserve all logs before any remediation

**For secret exposure:**
1. Rotate compromised secret immediately using `wrangler secret put`
2. Follow the rotation checklist in `infra/cloudflare/secrets-rotation-log.md`
3. Audit access logs for unauthorized usage
4. Notify Founder immediately

**For service outage:**
1. Check Cloudflare Workers dashboard for error rates
2. Check D1 database connectivity
3. Verify KV namespace availability

### Phase 4: Resolution

**Code rollback:**
```bash
git revert -m 1 <merge-sha>
git push origin main
```
CI will automatically redeploy the previous version.

**Database rollback:**
```bash
npx wrangler d1 execute <db-name> --env <env> --remote \
  --file infra/db/migrations/<NNNN>_description.rollback.sql
```
Every migration has a corresponding `.rollback.sql` script.

**Secret rotation:**
```bash
openssl rand -hex 32  # Generate new secret
npx wrangler secret put <SECRET_NAME> --env staging --config apps/api/wrangler.toml
npx wrangler secret put <SECRET_NAME> --env production --config apps/api/wrangler.toml
```

### Phase 5: Verification

1. Run smoke tests against affected environment:
   ```bash
   SMOKE_API_KEY=<key> BASE_URL=<url> npx tsx tests/smoke/api-health.smoke.ts
   ```
2. Verify health endpoints return `{"status":"ok"}`
3. Check audit logs for normal operation resumption
4. Monitor error rates for 30 minutes post-fix

### Phase 6: Post-Incident Review (Required for SEV-1 and SEV-2)

1. **Timeline:** Document when the incident started, was detected, triaged, contained, and resolved
2. **Root cause:** Identify the technical root cause
3. **Impact:** Quantify affected tenants, data, and duration
4. **Action items:** Preventive measures to avoid recurrence
5. **Review meeting:** Within 48 hours of resolution
6. **Documentation:** Write post-incident report in `docs/reports/`

---

## Communication Templates

### Internal (SEV-1/SEV-2)

```
INCIDENT: [Brief description]
SEVERITY: SEV-[1/2]
STATUS: [Investigating | Identified | Monitoring | Resolved]
IMPACT: [Affected apps/tenants]
NEXT UPDATE: [Time]
```

### Tenant Notification (if data affected)

```
We identified an issue affecting [description].
The issue has been [contained/resolved].
No action is required on your part.
We are conducting a full review to prevent recurrence.
```

---

## Quick Reference

| Situation | Action | Reference |
|-----------|--------|-----------|
| Production 500 errors | Check Cloudflare dashboard → rollback if needed | Release governance rollback policy |
| Cross-tenant data leak | Isolate tenant → report to security@webwaka.com | Security baseline §10 |
| Secret compromised | Rotate immediately → audit logs | `infra/cloudflare/secrets-rotation-log.md` |
| Failed deployment | CI will block; check workflow logs | `.github/workflows/deploy-staging.yml` |
| Database issue | Check D1 dashboard → rollback migration if needed | Operator runbook DEPLOY-005 |
| Rate limit false positive | Adjust `RATE_LIMIT_KV` TTL | `apps/api/src/middleware/rate-limit.ts` |

---

*This document consolidates incident response procedures from:*
- *`docs/governance/security-baseline.md` (§10)*
- *`docs/governance/release-governance.md` (Rollback Policy)*
- *`docs/operator-runbook.md` (Operational procedures)*
- *`infra/cloudflare/secrets-rotation-log.md` (Secret rotation)*
