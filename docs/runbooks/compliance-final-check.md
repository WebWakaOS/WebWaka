# Runbook: Compliance Final Check

**Release Gate:** G8 (Compliance & Data Governance)
**Last reviewed:** 2026-05-02
**Regulation:** NDPR (Nigeria Data Protection Regulation, 2019)

---

## Overview

This runbook verifies that all NDPR compliance controls are active and functioning
on the production environment before go-live. All items must pass and be signed off
in `docs/release/release-gate.md` (section G8).

---

## G8-1 — NDPR Consent Middleware Active

### Verify via Integration Test

```bash
# From the API repo root
pnpm --filter @webwaka/api test --grep "ndpr" --reporter verbose
# All NDPR-tagged tests must pass
```

### Manual Verification

```bash
# Attempt an API call without consent header — must receive 451 (Unavailable for Legal Reasons)
curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://api.webwaka.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","full_name":"Test"}'
# Expected: 200 (first call sets consent cookie) OR 200 (consent pre-agreed in body)
# If consent middleware is mis-configured, all registration flows will fail.

# Verify consent record is created after registration
# (check via admin API or D1 direct query in staging)
wrangler d1 execute webwaka-production --remote \
  --command "SELECT COUNT(*) FROM consent_records WHERE created_at > datetime('now', '-1 minute');"
```

### Checklist

- [ ] `check-ndpr-before-ai.ts` governance script exits 0
- [ ] NDPR consent middleware imported in `register-public-routes.ts`
- [ ] Integration test `tests/integration/ndpr.test.ts` passes on production-like env

---

## G8-2 — DSAR Export Flow

Data Subject Access Request (DSAR) export must work end-to-end.

### Test Procedure

```bash
# 1. Create a DSAR request via support API
curl -s -X POST https://api.webwaka.com/support/dsar \
  -H "Authorization: Bearer $TEST_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"request_type":"export","reason":"Testing DSAR flow"}'
# → {"id":"dsar_xxx","status":"pending"}

# 2. Trigger processor (or wait for scheduler — runs every 4h)
# In staging, trigger manually:
wrangler d1 execute webwaka-production --remote \
  --command "UPDATE scheduled_jobs SET next_run_at=0 WHERE name='dsar-export-processor';"

# 3. Verify R2 export bucket contains the file
wrangler r2 object list webwaka-dsar-exports --prefix "exports/"
# → Should show a new file: exports/<dsar_id>.json.gz

# 4. Verify DSAR status updated
curl -s https://api.webwaka.com/support/dsar/dsar_xxx \
  -H "Authorization: Bearer $TEST_USER_TOKEN" | jq .status
# → "completed"
```

### Checklist

- [ ] DSAR processor scheduler job active (`dsar-export-processor` in `scheduled_jobs`)
- [ ] R2 bucket `webwaka-dsar-exports` exists and `DSAR_BUCKET` binding is set
- [ ] Export file generated within 4 hours of DSAR request
- [ ] Export contains all user data fields (profile, transactions, messages, preferences)
- [ ] Export is gzip-compressed and AES-256 encrypted at rest (R2 default)

---

## G8-3 — Data Retention Sweep Active

```bash
# Verify scheduler job is enabled
wrangler d1 execute webwaka-production --remote \
  --command "SELECT name, enabled, last_run_at, last_status FROM scheduled_jobs
             WHERE name IN ('ndpr-retention-sweep','pii-data-retention');"
# Both should show enabled=1 and last_status='ok' (after first run)

# Check retention log for recent activity
wrangler d1 execute webwaka-production --remote \
  --command "SELECT * FROM data_retention_log ORDER BY created_at DESC LIMIT 5;"
```

### Checklist

- [ ] `ndpr-retention-sweep` job: enabled=1, last_status='ok'
- [ ] `pii-data-retention` job: enabled=1, last_status='ok'
- [ ] `data_retention_log` table exists and has entries from last 7 days (or is empty if no retention events)
- [ ] `check-ndpr-before-ai.ts` governance check passes

---

## G8-4 — KYC Tier Transaction Limits

Verify that wallet tier limits match CBN Circular on e-money and the NDPR
guidelines on purpose limitation for payment data.

```bash
# Check tier config via admin API
curl -s https://api.webwaka.com/platform-admin/settings/kyc-tiers \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

Expected tier limits (CBN guidelines):

| Tier | Daily Limit | Monthly Limit | Balance Cap |
|------|------------|---------------|-------------|
| 0 (unverified) | ₦20,000 | ₦100,000 | ₦50,000 |
| 1 (phone verified) | ₦50,000 | ₦300,000 | ₦100,000 |
| 2 (BVN verified) | ₦200,000 | ₦1,000,000 | ₦500,000 |
| 3 (full KYC) | ₦5,000,000 | ₦20,000,000 | ₦10,000,000 |

### Checklist

- [ ] Tier 0–3 limits match CBN circular values in production settings
- [ ] `check-monetary-integrity.ts` governance script exits 0
- [ ] Wallet integration test `hl-wallet.test.idempotency.ts` passes

---

## G8-5 — Privacy Policy & Terms of Service

Before go-live, the following legal pages must be live at `webwaka.com/legal`:

- [ ] Privacy Policy (NDPR-compliant, dated 2026 or later)
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] Data Processing Agreement (for B2B/enterprise tenants)

```bash
# Verify pages are accessible
curl -sf https://webwaka.com/legal/privacy-policy -o /dev/null && echo "OK"
curl -sf https://webwaka.com/legal/terms-of-service -o /dev/null && echo "OK"
```

---

## Sign-Off

After all steps complete, update the release gate:

```
docs/release/release-gate.md
  G8-1 ✅ [Name] [Date]  — NDPR consent middleware verified
  G8-2 ✅ [Name] [Date]  — DSAR export tested end-to-end
  G8-3 ✅ [Name] [Date]  — Retention sweeps confirmed active
  G8-4 ✅ [Name] [Date]  — KYC tier limits verified
  G8-5 ✅ [Name] [Date]  — Legal pages published
```

---

*Runbook owner: Engineering / RM*
*Required for NDPR Article 2.6 — Data Controller due diligence before processing launch*
