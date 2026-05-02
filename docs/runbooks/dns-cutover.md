# Runbook: DNS Cutover — Staging → Production

**Release Gate:** G5 (Infrastructure & DNS)
**Last reviewed:** 2026-05-02

---

## Overview

This runbook guides the cutover of `api.webwaka.com` and `workspace.webwaka.com`
from the staging worker route to the production worker route. It also covers
SSL/TLS validation and Cloudflare WAF activation.

**Estimated time:** 20–30 minutes (DNS propagation may add 5–15 min)
**Required access:** Cloudflare dashboard (zone admin) + GitHub secrets admin

---

## Pre-Conditions

Before starting the cutover, verify all of the following:

- [ ] Production worker deployed and healthy: `wrangler whoami` + `wrangler deployments list` show production worker
- [ ] `GET https://api-staging.webwaka.com/health` → 200 (staging smoke still passing)
- [ ] All migration 0001–0463 applied to `webwaka-production` D1
- [ ] All GitHub secrets set (G3 gate items)
- [ ] Rollback version tag recorded: `PREVIOUS_WORKER_VERSION=<tag>`

---

## Step 1 — Verify Production Worker Route

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages
2. Confirm worker `webwaka-api-production` is deployed and marked **Active**
3. Note the `workers.dev` subdomain URL (e.g. `webwaka-api-production.workers.dev`)
4. Run a quick health check against the workers.dev URL:
   ```bash
   curl -s https://webwaka-api-production.workers.dev/health | jq .
   # Expected: {"status":"ok"}
   ```

---

## Step 2 — Update DNS Records

In Cloudflare DNS (zone: `webwaka.com`):

### api.webwaka.com

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `api` | `webwaka-api-production.workers.dev` | ✅ Proxied |

> ⚠️ Confirm the existing record points to staging (e.g. `webwaka-api-staging.workers.dev`)
> before updating it. Screenshot the old value for rollback reference.

```bash
# Verify current DNS before change
dig +short api.webwaka.com CNAME
```

### workspace.webwaka.com

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `workspace` | `webwaka-workspace-production.workers.dev` | ✅ Proxied |

---

## Step 3 — SSL/TLS Verification

1. Cloudflare Dashboard → SSL/TLS → Overview
2. Confirm encryption mode: **Full (Strict)**
3. Confirm "Always Use HTTPS" is **On** (SSL/TLS → Edge Certificates)
4. Confirm HSTS is configured:
   - Max age: ≥ 6 months (15768000 seconds)
   - Include Subdomains: ✅
5. Verify from terminal:
   ```bash
   curl -sI https://api.webwaka.com/health | grep -i "strict-transport"
   # Expected: strict-transport-security: max-age=15768000; includeSubDomains
   ```

---

## Step 4 — Cloudflare WAF

1. Cloudflare Dashboard → Security → WAF
2. Confirm **Managed Rules** are enabled for zone `webwaka.com`
3. Confirm custom rate-limiting rules are active:
   - `POST /auth/*` — 20 requests/minute per IP → block
   - `POST /payments/*` — 10 requests/minute per IP → block
4. Confirm Bot Fight Mode is **On** (Security → Bots)

---

## Step 5 — Post-Cutover Health Check

```bash
# 1. Health
curl -sf https://api.webwaka.com/health | jq .
# → {"status":"ok"}

# 2. Deep health (checks D1 + KV)
curl -sf https://api.webwaka.com/health/deep | jq .
# → {"status":"ok","checks":{...}}

# 3. TLS certificate issuer
echo | openssl s_client -connect api.webwaka.com:443 2>/dev/null | openssl x509 -noout -issuer
# → issuer=C=US, O=Cloudflare, Inc., CN=Cloudflare Inc ECC CA-3

# 4. Full smoke test
SMOKE_BASE_URL=https://api.webwaka.com \
SMOKE_API_KEY=<super_admin_key> \
node scripts/smoke-production.mjs
```

All checks must pass before signing off G5 in `docs/release/release-gate.md`.

---

## Rollback Procedure

If any post-cutover check fails:

```bash
# 1. Revert DNS — update CNAME back to staging worker
#    api.webwaka.com → webwaka-api-staging.workers.dev

# 2. Verify staging is healthy again
curl -sf https://api.webwaka.com/health | jq .

# 3. Open incident — log in docs/runbooks/incident-log.md
# 4. Page on-call engineer
# 5. Trigger rollback workflow if worker issue
gh workflow run rollback-worker.yml --ref main \
  -f version=<PREVIOUS_WORKER_VERSION>
```

See `docs/runbooks/rollback-procedure.md` for full rollback steps.

---

## Sign-Off

After all steps complete and smoke test passes, update the release gate:

```
docs/release/release-gate.md
  G5-1 ✅ [Name] [Date]
  G5-2 ✅ [Name] [Date]
  G5-3 ✅ [Name] [Date]
  G5-4 ✅ [Name] [Date]
  G5-5 ✅ [Name] [Date]
```

---

*Runbook owner: Engineering / Founder*
*Review cadence: before each production deploy*
