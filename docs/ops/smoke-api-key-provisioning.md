# SMOKE_API_KEY Provisioning Guide

## What it is

`SMOKE_API_KEY` is a **JWT Bearer token** issued by the staging API for a
pre-seeded smoke/service account. Smoke tests send it as:

```
x-api-key: <jwt>
Authorization: Bearer <jwt>
```

The API validates it via `resolveAuthContext` (packages/auth/src/middleware.ts)
which verifies the JWT against `JWT_SECRET`.

## Prerequisites

- Staging API worker deployed and reachable at `https://api-staging.webwaka.com`
- Staging D1 database migrated and seeded (`pnpm seed:all`)

## Steps to generate

### Option A — Admin dashboard (preferred)

1. Log in to `https://admin-staging.webwaka.com` as `super_admin`
2. Navigate to **Settings → Service Accounts**
3. Create a service account named `smoke-runner` with role `admin`
4. Copy the generated JWT

### Option B — Direct API call against staging

```bash
# 1. Register smoke account (once)
curl -s -X POST https://api-staging.webwaka.com/auth/register \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Intent: m2m" \
  -H "x-tenant-id: $SMOKE_TENANT_ID" \
  -d '{
    "email": "smoke-runner@internal.webwaka.com",
    "password": "'"$(openssl rand -hex 32)"'",
    "full_name": "Smoke Runner",
    "role": "admin"
  }'

# 2. Login to get JWT
JWT=$(curl -s -X POST https://api-staging.webwaka.com/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Intent: m2m" \
  -H "x-tenant-id: $SMOKE_TENANT_ID" \
  -d '{
    "email": "smoke-runner@internal.webwaka.com",
    "password": "<password-from-step-1>"
  }' | jq -r '.token')

echo "SMOKE_API_KEY=$JWT"
```

### Option C — Direct D1 seed (emergency only)

```bash
# Generate JWT directly using wrangler and JWT_SECRET
cd apps/api
SMOKE_JWT=$(npx wrangler d1 execute webwaka-staging --command \
  "SELECT * FROM users WHERE email='smoke-runner@internal.webwaka.com'" \
  --env staging --json)
```

## Set the GitHub Secret

Once you have the JWT:

```
1. Go to https://github.com/WebWakaOS/WebWaka/settings/secrets/actions
2. Click "New repository secret"
3. Name: SMOKE_API_KEY
4. Value: <the JWT from above>
5. Click "Add secret"
```

Also set these GitHub Variables (not secrets) if not already set:
- `STAGING_BASE_URL` = `https://api-staging.webwaka.com`
- `SMOKE_TENANT_ID` = the tenant ID used during seeding
- `SMOKE_WORKSPACE_ID` = the workspace ID used during seeding

## Notes

- The token expires per JWT_EXPIRY setting. Rotate periodically.
- `continue-on-error: true` is set on smoke steps — CI will not block on missing key.
- Once set, remove `continue-on-error: true` from `smoke-test-staging` in `.github/workflows/deploy-staging.yml` to make smoke a hard gate.
