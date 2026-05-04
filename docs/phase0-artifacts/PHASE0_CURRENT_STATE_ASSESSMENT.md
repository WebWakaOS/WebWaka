# WebWaka OS — Phase 0: Current-State Assessment

**Date:** 2026-05-03  
**Agent:** Emergent E2 Implementation Agent  
**Branch reviewed:** `staging`  
**Repo:** https://github.com/WebWakaOS/WebWaka  

---

## 1. Platform Overview

WebWaka OS is a **multi-tenant, multi-vertical, white-label SaaS platform** for Africa (Nigeria-first).  
Runtime: **Cloudflare Workers** (TypeScript, Hono framework)  
Database: **Cloudflare D1** (SQLite at edge)  
Cache/State: **Cloudflare KV**  
Storage: **Cloudflare R2**  
Monorepo: **pnpm workspaces** with 200+ packages  
Frontend: **React + Vite PWA** (multiple SPAs per admin level)  
Test runner: **Vitest**  

### Platform Role Hierarchy

```
super_admin → admin → manager → cashier → agent → member
```

### Applications

| App | Purpose | Status |
|-----|---------|--------|
| apps/api | Cloudflare Workers API (Hono) | Active |
| apps/workspace-app | Operator/Cashier PWA | Active |
| apps/platform-admin | Super Admin dashboard (React SPA) | Active (rebuilding Wave 2) |
| apps/partner-admin-spa | Partner management SPA | Active |
| apps/admin-dashboard | Analytics Worker | Active (merging to platform-admin) |
| apps/discovery-spa | Public discovery SPA | Active |
| apps/brand-runtime | Tenant-branded website runtime | Active |
| apps/notificator | Notification queue consumer | Active |
| apps/ussd-gateway | USSD micro-transactions | Active |
| apps/schedulers | CRON jobs worker | Active |
| apps/marketing-site | Public marketing site | Active |

---

## 2. Current Email System

### What exists

**Primary class:** `apps/api/src/lib/email-service.ts`  
**Provider:** Resend (REST API, no Node.js SDK — CF Workers compatible)  
**Credential:** `RESEND_API_KEY` (CF Worker Secret)  
**FROM address:** `WebWaka <noreply@webwaka.com>`  

### Email Templates (hardcoded HTML in EmailService)

| Template Key | Triggered By |
|---|---|
| welcome | User registration |
| workspace-invite | Admin invites team member |
| payment-confirmation | Paystack payment verified |
| password-reset | Forgot password request |
| email-verification | Email verification on signup |
| template-purchase-receipt | Template marketplace purchase |

### Email Routing Architecture

```
[auth-routes.ts / billing.ts / etc.]
         |
         ├── NOTIFICATION_PIPELINE_ENABLED === '1'
         │       └── publishEvent() → NOTIFICATION_QUEUE → apps/notificator → EmailService
         │
         └── NOTIFICATION_PIPELINE_ENABLED !== '1' (DEFAULT)
                 └── EmailService.sendTransactional() → Resend REST API
```

### Gaps Identified

1. **No Cloudflare Email Service binding** — not configured in any wrangler.toml
2. **Single-provider lock** — no fallback if Resend is down
3. **No provider-level abstraction** — EmailService is tightly coupled to Resend
4. **No admin UI** for email provider management
5. **notificator consumer** also needs updating when email provider changes

---

## 3. Current Identity / Auth System

### Database Schema (users table)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,                  -- stored, NOT used for login
  password_hash TEXT,          -- PBKDF2 SHA-256, 600k iterations
  full_name TEXT,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  role TEXT NOT NULL,
  email_verified_at INTEGER,   -- NULL = unverified
  totp_secret TEXT,            -- super_admin 2FA only
  totp_enabled INTEGER,        -- 0/1 boolean
  totp_enrolled_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Current Auth Routes

| Route | Method | Description |
|-------|--------|-------------|
| /auth/login | POST | **email + password only** |
| /auth/register | POST | email + password + businessName (phone optional) |
| /auth/refresh | POST | Opaque refresh token rotation |
| /auth/me | GET | Get user profile |
| /auth/profile | PATCH | Update phone / fullName |
| /auth/forgot-password | POST | Reset via email link |
| /auth/reset-password | POST | Consume KV reset token |
| /auth/change-password | POST | Change password (auth required) |
| /auth/logout | POST | Token blacklist + session cleanup |
| /auth/send-verification | POST | Send email verification |
| /auth/verify-email | GET | Consume email verification token |
| /auth/invite | POST | Invite member by email |
| /auth/accept-invite | POST | Accept invitation |
| /auth/sessions | GET/DELETE | Session management |
| /auth/totp/enrol | POST | Super admin 2FA setup |
| /auth/totp/verify | POST | Confirm TOTP code |
| /auth/totp/disable | POST | Disable TOTP |

### Nigerian Phone Validation

The code already has a Nigerian phone regex:
```typescript
const PHONE_RE = /^(\+234|0)[789]\d{9}$/;
```
Used in `PATCH /auth/profile` for validation, but phone is **not used for authentication**.

### Gaps Identified

1. **Email-only login** — phone cannot be used to authenticate
2. **No phone-first registration** — email is mandatory
3. **No OTP-based login** — passwordless phone login not possible
4. **Invitation is email-only** — no phone invite support
5. **No `phone_verified_at`** — phone stored but verification status not tracked
6. **No identity_type field** — no indication of how the user was created
7. **Phone not normalized to E.164** on all write paths

---

## 4. Current Provider / Credentials System

### All Providers are CF Worker Secrets (env vars only)

```typescript
// apps/api/src/env.ts — all provider keys
RESEND_API_KEY?: string;        // Email
PAYSTACK_SECRET_KEY?: string;   // Payments
PREMBLY_API_KEY: string;        // Identity verification
TERMII_API_KEY: string;         // SMS OTP
WHATSAPP_ACCESS_TOKEN: string;  // WhatsApp OTP
WHATSAPP_PHONE_NUMBER_ID: string;
DIALOG360_API_KEY?: string;     // 360dialog WhatsApp
TELEGRAM_BOT_TOKEN: string;     // Telegram OTP
ENCRYPTION_SECRET?: string;     // AES-GCM master key for BYOK
```

### AI Provider Configuration (hardcoded)

```typescript
// packages/ai-abstraction/src/router.ts — HARDCODED
export const PLATFORM_AGGREGATORS: readonly AggregatorConfig[] = [
  { provider: 'groq', apiKeyEnvVar: 'GROQ_API_KEY', ... },
  { provider: 'openrouter', apiKeyEnvVar: 'OPENROUTER_API_KEY', ... }, // SINGLE KEY
  { provider: 'together', apiKeyEnvVar: 'TOGETHER_API_KEY', ... },
  { provider: 'deepinfra', apiKeyEnvVar: 'DEEPINFRA_API_KEY', ... },
];
```

### AI Key Resolution (5-Level Chain)

```
Level 1: User BYOK (KV, encrypted, personal key)
Level 2: Workspace BYOK (KV, encrypted, tenant key)
Level 3: Platform aggregator (env var, single key per provider)
Level 4: Same as Level 3 (falls through aggregator list)
Level 5: Groq fallback (smallest free model)
```

### Existing Resilience Infrastructure

- Circuit breaker: `packages/ai-abstraction/src/circuit-breaker.ts` ✅
- Retry with backoff: `packages/ai-abstraction/src/retry.ts` ✅
- ENCRYPTION_SECRET for AES-GCM: exists in env.ts ✅

### Gaps Identified

1. **No provider registry in D1** — providers cannot be managed at runtime
2. **Single OpenRouter key** — no multi-key pooling, single point of rate limiting
3. **Hardcoded aggregator list** — changing providers requires code deploy
4. **No platform-admin UI** for provider management
5. **No activation/deactivation** at runtime
6. **No audit logging** for credential changes
7. **No per-tenant or per-partner provider overrides**
8. **No provider health dashboard** 
9. **No "test connection" capability** from admin UI

---

## 5. Current Admin Surfaces

| Surface | Tech | Provider Mgmt? |
|---------|------|----------------|
| apps/platform-admin | React SPA | ❌ None |
| apps/partner-admin-spa | React SPA | ❌ None |
| apps/workspace-app | React PWA | ❌ None |
| apps/admin-dashboard | CF Worker | ❌ None (analytics only) |

---

## 6. Summary of Gaps vs Requirements

### GOAL A — Provider Registry + Credentials Control Plane

| Required | Current Status | Gap |
|----------|---------------|-----|
| Providers stored as managed platform records | ❌ Env vars only | Must implement |
| Category-aware provider definitions | ❌ Partial (AI only, hardcoded) | Must implement |
| Secure credential storage | ⚠️ Env vars (CF Secrets, not DB) | Must extend |
| Multiple providers per category | ❌ Single env var per provider | Must implement |
| One-active / multi-active modes | ❌ No concept exists | Must implement |
| Provider states (active/inactive/testing/etc) | ❌ None | Must implement |
| Provider priority / routing rules | ❌ Hardcoded priority | Must implement |
| Health/failure status tracking | ⚠️ Circuit breaker exists (AI only) | Must extend |
| Audit logging | ❌ None for providers | Must implement |
| Role/scope controls | ❌ No provider-specific controls | Must implement |

### GOAL B — AI Provider Pooling (OpenRouter Multi-Key)

| Required | Current Status | Gap |
|----------|---------------|-----|
| Multiple BYOK OpenRouter keys | ❌ Single key per provider | Must implement |
| Simultaneous active keys | ❌ Only one active | Must implement |
| Load sharing across keys | ❌ Not possible | Must implement |
| Failover on 429 | ⚠️ Retry exists, not key-level failover | Must extend |
| Free-model-first policy | ⚠️ Partially (defaults to free models) | Must formalize |
| Allowed model governance | ❌ Scattered defaults | Must centralize |

### GOAL C — Cloudflare Email as Default

| Required | Current Status | Gap |
|----------|---------------|-----|
| CF Email as default transactional provider | ❌ Resend is default | Must implement |
| Multiple email providers supported | ❌ Single Resend provider | Must implement |
| Fallback providers available | ❌ No fallback | Must implement |
| Existing email flows preserved | ✅ Works with Resend | Must migrate safely |

### GOAL D — Multi-Identifier Identity

| Required | Current Status | Gap |
|----------|---------------|-----|
| Email as login identifier | ✅ Works | Keep |
| Phone as login identifier | ❌ Not possible | Must implement |
| Phone-first onboarding | ❌ Email mandatory | Must implement |
| Phone OTP login | ❌ Not implemented | Must implement |
| Phone verification tracking | ❌ No phone_verified_at | Must add column |
| Phone number normalization | ⚠️ Partial regex, no E.164 | Must standardize |
| Account recovery via phone | ❌ Email only | Must implement |
| OTP velocity limits | ❌ None for phone OTP | Must implement |

---

## 7. Files Most Affected by Changes

```
apps/api/src/routes/auth-routes.ts      — identity model changes
apps/api/src/lib/email-service.ts       — Cloudflare Email adapter
apps/api/src/env.ts                     — new bindings
apps/api/wrangler.toml                  — [[email]] binding
apps/api/src/routes/admin/providers.ts  — NEW: provider admin routes
packages/ai-abstraction/src/router.ts   — multi-key pool integration
packages/provider-registry/             — NEW package
infra/db/migrations/                    — new SQL migrations
apps/platform-admin/src/               — new provider management UI
```

---

*Assessment complete. No implementation code written during this review phase.*
