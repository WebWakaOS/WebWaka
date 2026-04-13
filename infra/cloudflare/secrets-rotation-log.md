# Secrets Rotation Log

**Policy:** Rotate all secrets every 90 days or immediately on suspected exposure.
**Reference:** docs/governance/security-baseline.md Section 1.

## Secret Inventory

| Secret Name | Location | Created | Last Rotated | Next Rotation | Rotation Procedure |
|---|---|---|---|---|---|
| `JWT_SECRET` | CF Worker Secret + GitHub Actions | 2026-04-01 | 2026-04-01 | 2026-07-01 | `wrangler secret put JWT_SECRET` on both staging and production workers. Update `JWT_SECRET_STAGING` / `JWT_SECRET_PRODUCTION` in GitHub Actions secrets. |
| `INTER_SERVICE_SECRET` | CF Worker Secret + GitHub Actions | 2026-04-01 | 2026-04-01 | 2026-07-01 | `wrangler secret put INTER_SERVICE_SECRET`. Update GitHub Actions secret. |
| `PAYSTACK_SECRET_KEY` | CF Worker Secret | 2026-04-01 | 2026-04-01 | 2026-07-01 | Regenerate in Paystack Dashboard → Settings → API Keys. `wrangler secret put PAYSTACK_SECRET_KEY`. |
| `PREMBLY_API_KEY` | CF Worker Secret | 2026-04-01 | 2026-04-01 | 2026-07-01 | Regenerate in Prembly Dashboard. `wrangler secret put PREMBLY_API_KEY`. |
| `TERMII_API_KEY` | CF Worker Secret | 2026-04-01 | 2026-04-01 | 2026-07-01 | Regenerate in Termii Dashboard. `wrangler secret put TERMII_API_KEY`. |
| `WHATSAPP_ACCESS_TOKEN` | CF Worker Secret | 2026-04-01 | 2026-04-01 | 2026-07-01 | Regenerate in Meta Business Manager → System Users. `wrangler secret put WHATSAPP_ACCESS_TOKEN`. |
| `TELEGRAM_BOT_TOKEN` | CF Worker Secret | 2026-04-01 | 2026-04-01 | 2026-07-01 | Regenerate via BotFather `/revoke`. `wrangler secret put TELEGRAM_BOT_TOKEN`. |
| `LOG_PII_SALT` | CF Worker Secret | 2026-04-01 | 2026-04-01 | 2026-07-01 | Generate new 32-byte hex. `wrangler secret put LOG_PII_SALT`. Note: rotating invalidates existing PII hashes. |
| `DM_MASTER_KEY` | CF Worker Secret | 2026-04-01 | 2026-04-01 | 2026-07-01 | Generate new AES-256-GCM key. `wrangler secret put DM_MASTER_KEY`. Note: requires DM re-encryption migration. |
| `PRICE_LOCK_SECRET` | CF Worker Secret | 2026-04-01 | 2026-04-01 | 2026-07-01 | Generate new 32-byte hex. `wrangler secret put PRICE_LOCK_SECRET`. Active price-lock tokens will invalidate. |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions Secret | 2026-04-01 | 2026-04-01 | 2026-07-01 | Regenerate in Cloudflare Dashboard → Profile → API Tokens. Update in GitHub repo Settings → Secrets. |
| `DIALOG360_API_KEY` | CF Worker Secret (optional) | 2026-04-01 | 2026-04-01 | 2026-07-01 | Regenerate in 360dialog Hub. `wrangler secret put DIALOG360_API_KEY`. |
| `TELEGRAM_WEBHOOK_SECRET` | CF Worker Secret | 2026-04-01 | 2026-04-01 | 2026-07-01 | Generate new random string. `wrangler secret put TELEGRAM_WEBHOOK_SECRET`. Update webhook via Telegram setWebhook API. |
| `AFRICAS_TALKING_USERNAME` | CF Worker Secret (ussd-gateway) | 2026-04-01 | 2026-04-01 | 2026-07-01 | Update username in Africa's Talking Dashboard. `wrangler secret put AFRICAS_TALKING_USERNAME`. |
| `AFRICAS_TALKING_API_KEY` | CF Worker Secret (ussd-gateway) | 2026-04-01 | 2026-04-01 | 2026-07-01 | Regenerate in Africa's Talking Dashboard → Settings → API Key. `wrangler secret put AFRICAS_TALKING_API_KEY`. |
| `WHATSAPP_PHONE_NUMBER_ID` | CF Worker Secret | 2026-04-01 | 2026-04-01 | 2026-07-01 | Update from Meta Business Manager → Phone Numbers. `wrangler secret put WHATSAPP_PHONE_NUMBER_ID`. |

## Rotation Checklist

1. Generate new secret value (use `openssl rand -hex 32` for symmetric keys)
2. Update in Cloudflare: `wrangler secret put <NAME> --env <staging|production>`
3. Update in GitHub Actions if applicable: repo Settings → Secrets and variables → Actions
4. Verify staging deployment works with new secret
5. Verify production deployment works with new secret
6. Update "Last Rotated" and "Next Rotation" dates in this log
7. Commit this file to repo

## Dependabot Triage Process

1. Dependabot alerts are triaged within 48 hours of creation
2. Critical/High severity: patch within 7 days
3. Medium severity: patch within 30 days
4. Low severity: patch in next scheduled maintenance window
5. All patches go through standard PR → staging → production flow
