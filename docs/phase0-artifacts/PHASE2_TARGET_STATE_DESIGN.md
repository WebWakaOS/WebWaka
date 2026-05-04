# WebWaka OS — Phase 2: Target-State Design

**Date:** 2026-05-03  
**Author:** Emergent E2 Implementation Agent

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROVIDER CONTROL PLANE                           │
│                                                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────────────┐  │
│  │  D1 Tables:  │  │  KV Cache:    │  │  Admin API Routes:      │  │
│  │  - provider_ │  │  active       │  │  /admin/providers/*     │  │
│  │    registry  │  │  provider     │  │  (CRUD + activate +     │  │
│  │  - ai_provid │  │  per category │  │  test + audit)          │  │
│  │    er_keys   │  │  5-min TTL    │  │                         │  │
│  │  - provider_ │  │               │  │                         │  │
│  │    audit_log │  │               │  │                         │  │
│  └──────────────┘  └───────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│              RESOLUTION HIERARCHY (per category)                    │
│                                                                     │
│  1. Tenant-scoped override (if exists + active)                    │
│  2. Partner-scoped override (if exists + active)                   │
│  3. Platform-level active provider                                  │
│  4. Emergency env-var fallback (migration safety)                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. New Database Migrations

### 0544_provider_registry.sql
```sql
CREATE TABLE IF NOT EXISTS provider_registry (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  scope TEXT NOT NULL DEFAULT 'platform',
  scope_id TEXT,
  priority INTEGER NOT NULL DEFAULT 100,
  routing_policy TEXT NOT NULL DEFAULT 'primary',
  capabilities TEXT,
  config_json TEXT,
  credentials_encrypted TEXT,
  credentials_iv TEXT,
  health_status TEXT DEFAULT 'unknown',
  last_health_check_at INTEGER,
  created_by TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_provider_registry_category_scope
  ON provider_registry (category, scope, scope_id, status);

CREATE INDEX IF NOT EXISTS idx_provider_registry_scope_id
  ON provider_registry (scope_id) WHERE scope_id IS NOT NULL;
```

### 0545_provider_audit_log.sql
```sql
CREATE TABLE IF NOT EXISTS provider_audit_log (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT,
  actor_role TEXT,
  scope_id TEXT,
  changes_json TEXT,
  ip_hash TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_provider_audit_log_provider_id
  ON provider_audit_log (provider_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_provider_audit_log_actor
  ON provider_audit_log (actor_id, created_at DESC);
```

### 0546_ai_provider_keys.sql
```sql
CREATE TABLE IF NOT EXISTS ai_provider_keys (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES provider_registry(id),
  key_label TEXT NOT NULL,
  key_encrypted TEXT NOT NULL,
  key_iv TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  last_used_at INTEGER,
  rate_limited_until INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ai_provider_keys_provider_id
  ON ai_provider_keys (provider_id, status);
```

### 0547_users_phone_identity.sql
```sql
-- Add phone_verified_at to track phone verification status
ALTER TABLE users ADD COLUMN phone_verified_at INTEGER;

-- Add identity_providers JSON array: ["email", "phone"]
ALTER TABLE users ADD COLUMN identity_providers TEXT DEFAULT '["email"]';

-- Add phone_e164 for normalized phone (E.164 format: +234XXXXXXXXXX)
ALTER TABLE users ADD COLUMN phone_e164 TEXT;

-- OTP storage for phone authentication
CREATE TABLE IF NOT EXISTS phone_otps (
  id TEXT PRIMARY KEY,
  phone_e164 TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  otp_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  verified_at INTEGER,
  attempt_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_phone_otps_phone_tenant
  ON phone_otps (phone_e164, tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_phone_otps_expires
  ON phone_otps (expires_at);
```

---

## 3. New Package: `packages/provider-registry/`

### Files

```
packages/provider-registry/
  src/
    types.ts          — Provider types, categories, statuses
    crypto.ts         — AES-256-GCM encrypt/decrypt (Web Crypto, CF Workers compatible)
    service.ts        — ProviderRegistryService (CRUD + activation + audit)
    resolution.ts     — resolveProvider() with hierarchy + KV cache
    key-pool.ts       — AIKeyPool for multi-key rotation
    index.ts          — Barrel export
  package.json
  tsconfig.json
```

### Key Interfaces

```typescript
// types.ts
export type ProviderCategory = 'ai' | 'email' | 'sms' | 'payment' | 'identity' | 'storage';
export type ProviderStatus = 'active' | 'inactive' | 'testing' | 'failover' | 'deprecated';
export type ProviderScope = 'platform' | 'partner' | 'tenant';
export type RoutingPolicy = 'primary' | 'failover' | 'round_robin';

export interface ProviderRecord {
  id: string;
  category: ProviderCategory;
  provider_name: string;
  display_name: string;
  status: ProviderStatus;
  scope: ProviderScope;
  scope_id: string | null;
  priority: number;
  routing_policy: RoutingPolicy;
  capabilities: string[] | null;
  config_json: Record<string, unknown> | null;
  credentials_encrypted: string | null;
  credentials_iv: string | null;
  health_status: 'healthy' | 'degraded' | 'down' | 'unknown';
  last_health_check_at: number | null;
  created_by: string | null;
  created_at: number;
  updated_at: number;
}

export interface ResolvedProvider {
  id: string;
  category: ProviderCategory;
  provider_name: string;
  config: Record<string, unknown>;
  credentials: Record<string, string>;  // Decrypted at use time
  scope: ProviderScope;
  scope_id: string | null;
}
```

---

## 4. Email Provider Abstraction

### New File: `apps/api/src/lib/email-provider.ts`

```typescript
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailSendResult {
  ok: boolean;
  id?: string;
  provider: 'cloudflare' | 'resend';
  error?: string;
}

export interface IEmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>;
  name: 'cloudflare' | 'resend';
  isAvailable(): boolean;
}

// CloudflareEmailProvider uses CF Email Service binding
export class CloudflareEmailProvider implements IEmailProvider {
  name = 'cloudflare' as const;
  constructor(private binding: { send(msg: EmailMessage): Promise<void> } | undefined) {}
  isAvailable(): boolean { return !!this.binding; }
  async send(msg: EmailMessage): Promise<EmailSendResult> { ... }
}

// ResendEmailProvider uses existing REST client
export class ResendEmailProvider implements IEmailProvider {
  name = 'resend' as const;
  constructor(private apiKey: string | undefined) {}
  isAvailable(): boolean { return !!this.apiKey; }
  async send(msg: EmailMessage): Promise<EmailSendResult> { ... }
}

// EmailProviderRouter: CF first if available, Resend fallback
export class EmailProviderRouter {
  private providers: IEmailProvider[];
  constructor(cloudflareBinding: any, resendApiKey: string | undefined) {
    this.providers = [
      new CloudflareEmailProvider(cloudflareBinding),
      new ResendEmailProvider(resendApiKey),
    ].filter(p => p.isAvailable());
  }
  async send(msg: EmailMessage): Promise<EmailSendResult> { ... }
}
```

### Updated env.ts bindings

```typescript
// Add to Env interface:
SEND_EMAIL?: { send(msg: { from: string; to: string; subject: string; html: string }): Promise<void> };
```

### Updated wrangler.toml

```toml
[[email]]
binding = "SEND_EMAIL"
domain = "webwaka.com"
```

---

## 5. Phone + Email Identity Model

### Login Flow (updated)

```
POST /auth/login
  body: { identifier: string; type: 'email'|'phone'; password?: string; otp?: string }
  
  if type === 'email':
    → existing email + password flow (unchanged)
  
  if type === 'phone':
    → if otp provided: verify OTP → issue JWT
    → if password provided: lookup by phone_e164, verify password → issue JWT
    → else: error
```

### New OTP Routes

```
POST /auth/otp/request
  body: { phone: string; purpose: 'login'|'register'|'verify' }
  1. Normalize phone to E.164
  2. Check velocity (KV: 3 requests / 15 min per phone+purpose)
  3. Generate 6-digit OTP
  4. SHA-256 hash + store in phone_otps table (TTL: 10 min)
  5. Send via Termii SMS
  6. Return: { expires_in: 600 }

POST /auth/otp/verify
  body: { phone: string; otp: string; purpose: 'login'|'register'|'verify'; businessName?: string }
  1. Normalize phone
  2. Lookup active OTP record
  3. Verify SHA-256 match + expiry + attempt_count < 5
  4. Mark as verified
  5a. If purpose='login': find user by phone_e164+tenant_id → issue JWT
  5b. If purpose='register': create tenant+workspace+user with phone identity → issue JWT
  5c. If purpose='verify': update phone_verified_at → return success
  6. Return: { token, user } or { verified: true }
```

### Phone Normalization

```typescript
function normalizePhoneToE164(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (/^\+234[789]\d{9}$/.test(cleaned)) return cleaned;
  if (/^0[789]\d{9}$/.test(cleaned)) return '+234' + cleaned.slice(1);
  return null;  // Invalid
}
```

---

## 6. AI Provider Pool Integration

### Updated resolveAdapter() (Level 3/4)

```typescript
// Before (current):
const key = envVars[agg.apiKeyEnvVar];

// After (new — for OpenRouter specifically):
if (agg.provider === 'openrouter' && db) {
  const pool = await getOpenRouterKeyPool(db, encryptionSecret);
  const key = await selectKeyFromPool(pool, kvNamespace);
  if (key) return { config: { ...agg, apiKey: key.decryptedKey }, level: 3, ... };
  // else fall through to next aggregator
}
// Env var fallback (backward compatibility):
const key = envVars[agg.apiKeyEnvVar];
```

### Key Pool Selection (Least Recently Used)

```
getOpenRouterKeyPool(db) →
  SELECT * FROM ai_provider_keys
  WHERE provider_id = (SELECT id FROM provider_registry WHERE provider_name='openrouter' AND status='active')
  AND status = 'active'
  AND (rate_limited_until IS NULL OR rate_limited_until < unixepoch())
  ORDER BY last_used_at ASC NULLS FIRST
```

---

## 7. Admin API Routes

```
GET    /admin/providers                    — list all providers (paginated)
POST   /admin/providers                    — create provider
GET    /admin/providers/:id               — get provider detail
PATCH  /admin/providers/:id               — update provider (non-credential fields)
POST   /admin/providers/:id/credentials   — update credentials (encrypted, audit logged)
POST   /admin/providers/:id/activate      — set status = 'active'
POST   /admin/providers/:id/deactivate    — set status = 'inactive'
POST   /admin/providers/:id/test          — test connectivity (safe, no secret exposure)
GET    /admin/providers/:id/audit         — get audit log for provider
GET    /admin/providers/:id/keys          — get AI key pool (OpenRouter only)
POST   /admin/providers/:id/keys          — add key to pool
DELETE /admin/providers/:id/keys/:keyId   — remove key from pool
```

All routes: `super_admin` role required.

---

## 8. Migration Safety Strategy

### Email Migration
1. `SEND_EMAIL` binding is optional in env.ts (`SEND_EMAIL?: ...`)
2. `EmailProviderRouter.isAvailable()` — CF Email only used when binding present
3. Resend remains active until CF Email binding is deployed and verified
4. No behavior change without explicit CF Email domain verification

### Provider Registry Migration
1. New tables do not replace existing env vars immediately
2. `resolveProvider()` falls back to env vars when registry has no active record
3. Platform seed migration populates initial registry rows matching existing config
4. Admin can activate registry-managed providers one at a time

### Identity Migration
1. New columns are nullable — no existing user breaks
2. `phone_e164` populated on next PATCH /auth/profile
3. Login still works with email/password (unchanged)
4. Phone OTP routes are additive, not replacing

---

## 9. Scope Summary by User Level

| Feature | super_admin | platform_admin | partner_admin | tenant_admin | member |
|---------|:-----------:|:--------------:|:-------------:|:------------:|:------:|
| View platform providers | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create/edit platform providers | ✅ | ❌ | ❌ | ❌ | ❌ |
| Activate/deactivate providers | ✅ | ❌ | ❌ | ❌ | ❌ |
| Rotate provider credentials | ✅ | ❌ | ❌ | ❌ | ❌ |
| View AI key pool | ✅ | ✅ | ❌ | ❌ | ❌ |
| Add/remove AI keys | ✅ | ❌ | ❌ | ❌ | ❌ |
| BYOK personal AI key | N/A | ✅ | ✅ | ✅ | ✅ |
| BYOK workspace AI key | N/A | ✅ | ✅ | ✅ | ❌ |
| Email provider management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Phone OTP login | ✅ | ✅ | ✅ | ✅ | ✅ |
| Phone-first registration | ✅ | ✅ | ✅ | ✅ | ✅ |

---

*Design complete. Implementation proceeds in batches per Phase 3 plan.*
