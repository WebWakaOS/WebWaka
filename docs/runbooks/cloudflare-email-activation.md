# Cloudflare Email Service — Activation Runbook

**Status:** Ready to activate (domain verification required first)  
**Seeded provider ID:** `pvd_cloudflare_email_01`  
**Current state:** `inactive` (Resend is the active email provider)

---

## Why Cloudflare Email?

Cloudflare Email Service is the **zero-cost default** transactional email path for WebWaka:
- No per-email billing from Resend
- Integrated into the Cloudflare Worker runtime (no external HTTP call)
- Resend remains configured as automatic fallback if CF Email fails

The `EmailProviderRouter` always puts CF Email first when the `SEND_EMAIL` binding is present.

---

## Prerequisites

1. **Verify webwaka.com in CF Email Service dashboard**
   - Go to: Cloudflare Dashboard → Email → Email Routing
   - Add and verify `webwaka.com` as a sending domain
   - Ensure `noreply@webwaka.com` is configured as a sender address

2. **Confirm SEND_EMAIL binding is present in wrangler.toml**
   Already configured in `apps/api/wrangler.toml`:
   ```toml
   [[env.staging.email]]
   binding = "SEND_EMAIL"
   domain = "webwaka.com"

   [[env.production.email]]
   binding = "SEND_EMAIL"
   domain = "webwaka.com"
   ```
   This is already deployed. Once the domain is verified, the binding activates.

---

## Activation Steps

### Step 1: Verify domain in Cloudflare dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → `webwaka.com` zone → **Email** → **Email Routing**
2. Click **Enable Email Routing** if not already enabled
3. Add `noreply@webwaka.com` as a sending address and follow the DNS verification steps

### Step 2: Activate the provider via API

Once domain is verified, call the activation endpoint as super_admin:

```bash
# Get a super_admin JWT first (login to platform.webwaka.com)
TOKEN="<your_super_admin_jwt>"

# Activate CF Email on PRODUCTION
curl -X POST https://api.webwaka.com/admin/providers/cloudflare-email/activate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: https://platform.webwaka.com"

# Activate CF Email on STAGING
curl -X POST https://api-staging.webwaka.com/admin/providers/cloudflare-email/activate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: https://platform.webwaka.com"
```

**Expected response:**
```json
{
  "message": "Cloudflare Email Service activated as primary email provider.",
  "provider": { "id": "pvd_cloudflare_email_01", "status": "active", ... },
  "note": "Ensure SEND_EMAIL binding is configured in wrangler.toml..."
}
```

### Step 3: Verify email sending

```bash
# Trigger a password reset to test the email path
curl -X POST https://api.webwaka.com/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "Origin: https://app.webwaka.com" \
  -d '{"email": "admin@webwaka.com"}'
```

Check the CF Dashboard → Email → Logs for the sent email.

---

## Rollback (if CF Email has issues)

Reactivate Resend as primary:

```bash
curl -X POST https://api.webwaka.com/admin/providers/pvd_resend_01/activate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: https://platform.webwaka.com"
```

---

## Runtime Behavior

The `getEmailService()` factory in `apps/api/src/lib/provider-service-factory.ts` resolves the email provider at runtime:

1. Queries `provider_registry` table for the active `email` provider (scoped: tenant → partner → platform)
2. If `cloudflare_email` is active → uses `SEND_EMAIL` binding (zero external HTTP call)
3. If `resend` is active → uses stored API key from registry credentials or `RESEND_API_KEY` env var
4. If registry unavailable → falls back to `RESEND_API_KEY` env var + `SEND_EMAIL` binding directly

**KV cache:** Provider resolution is cached for 5 minutes to avoid D1 queries on every email send.

---

## Affected Email Flows

| Flow | Route | Template |
|------|-------|----------|
| Password Reset | `POST /auth/forgot-password` | `password-reset` |
| Email Verification | `POST /auth/register` | `email-verification` |
| Workspace Invite | `POST /auth/invite` | `workspace-invite` |
| Workspace Member Invite | `POST /workspaces/:id/members` | `workspace-invite` |
| Payment Confirmation | payment webhook | `payment-confirmation` |
| Welcome Email | workspace creation | `welcome` |
