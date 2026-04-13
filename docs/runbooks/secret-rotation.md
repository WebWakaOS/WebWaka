# Secret Rotation Procedures — WebWaka OS

**Last updated:** 2026-04-12
**Owner:** Platform Engineering
**Rotation cycle:** Every 90 days or immediately on suspected exposure

---

## Secret Inventory

| Secret | Environments | Rotation Method | Last Rotated | Next Due |
|---|---|---|---|---|
| `JWT_SECRET` | staging, production | Generate + redeploy | 2026-04-07 | 2026-07-07 |
| `INTER_SERVICE_SECRET` | staging, production | Generate + redeploy | 2026-04-07 | 2026-07-07 |
| `PAYSTACK_SECRET_KEY` | staging, production | Paystack Dashboard → regenerate | 2026-04-07 | 2026-07-07 |
| `PREMBLY_API_KEY` | staging, production | Prembly Dashboard → regenerate | 2026-04-07 | 2026-07-07 |
| `TERMII_API_KEY` | staging, production | Termii Dashboard → regenerate | 2026-04-07 | 2026-07-07 |
| `WHATSAPP_ACCESS_TOKEN` | staging, production | Meta Business → regenerate | 2026-04-07 | 2026-07-07 |
| `TELEGRAM_BOT_TOKEN` | staging, production | BotFather → /revoke + /newtoken | 2026-04-07 | 2026-07-07 |
| `LOG_PII_SALT` | staging, production | Generate new + re-hash stored PII | 2026-04-07 | 2026-07-07 |
| `DM_MASTER_KEY` | staging, production | Generate new + re-encrypt DMs | 2026-04-07 | 2026-07-07 |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions | CF Dashboard → regenerate | 2026-04-07 | 2026-07-07 |
| `PRICE_LOCK_SECRET` | staging, production | Generate new (old tokens expire) | 2026-04-07 | 2026-07-07 |

---

## Rotation Procedures

### 1. JWT_SECRET

**Impact:** All active JWT tokens become invalid. Users must re-authenticate.

```bash
NEW_SECRET=$(openssl rand -base64 32)

echo "$NEW_SECRET" | npx wrangler secret put JWT_SECRET \
  --env staging --config apps/api/wrangler.toml

echo "$NEW_SECRET" | npx wrangler secret put JWT_SECRET \
  --env production --config apps/api/wrangler.toml
```

**Post-rotation:** Update `infra/github-actions/secrets-inventory.md` with new rotation date. Update the corresponding GitHub Actions secret if used in CI.

### 2. INTER_SERVICE_SECRET

**Impact:** Inter-service calls fail until all services use the new secret.

```bash
NEW_SECRET=$(openssl rand -base64 32)

echo "$NEW_SECRET" | npx wrangler secret put INTER_SERVICE_SECRET \
  --env staging --config apps/api/wrangler.toml

echo "$NEW_SECRET" | npx wrangler secret put INTER_SERVICE_SECRET \
  --env production --config apps/api/wrangler.toml
```

**Post-rotation:** Rotate in all consuming services simultaneously to avoid downtime.

### 3. PAYSTACK_SECRET_KEY

1. Log in to Paystack Dashboard (dashboard.paystack.com)
2. Go to **Settings → API Keys & Webhooks**
3. Regenerate the secret key
4. Update the Worker secret:

```bash
echo "<new-key>" | npx wrangler secret put PAYSTACK_SECRET_KEY \
  --env production --config apps/api/wrangler.toml
```

5. Verify a test transaction completes

### 4. CLOUDFLARE_API_TOKEN (GitHub Actions)

1. Go to Cloudflare Dashboard → **My Profile → API Tokens**
2. Create a new token with the same permissions (Workers, D1, KV, R2)
3. Update in GitHub → **Settings → Secrets and variables → Actions**
4. Delete the old token in Cloudflare

### 5. LOG_PII_SALT (High Impact)

**Warning:** Changing this salt means previously hashed PII (BVN, NIN, phone) will not match new hashes. This requires re-hashing all stored PII records.

1. Generate new salt: `openssl rand -hex 32`
2. Run a migration script to re-hash all PII in the `identity_verifications` table
3. Deploy the new salt to Workers
4. Verify identity lookups still function correctly

### 6. DM_MASTER_KEY (High Impact)

**Warning:** Changing this key requires re-encrypting all stored DMs.

1. Generate new key: `openssl rand -base64 32`
2. Run a re-encryption migration (decrypt with old key, encrypt with new)
3. Deploy the new key to Workers
4. Verify DM read/write operations

---

## Emergency Rotation (Suspected Exposure)

If a secret is suspected to be compromised:

1. **Immediately** rotate the affected secret using the procedure above
2. Rotate in **production first**, then staging
3. Check audit logs for unauthorized access
4. Notify the security team
5. Document the incident

---

## Automation Roadmap

| Phase | Target | Status |
|---|---|---|
| Phase 1 | Document all rotation procedures | Done |
| Phase 2 | GitHub Actions workflow for automated rotation | Planned |
| Phase 3 | Rotation reminders via scheduled workflow | Planned |
| Phase 4 | Automated rotation with zero-downtime key overlap | Future |
