# WebWaka OS — Phase 1: External Research Synthesis

**Date:** 2026-05-03  
**Scope:** Cloudflare Email Service, multi-identifier auth, provider registry patterns, OpenRouter multi-key pooling

---

## 1. Cloudflare Email Service

### Status (2026)
- **Public beta launched: April 16, 2026**
- Available on Workers Paid plans
- Native Workers binding (no API key needed)
- Auto-configures SPF, DKIM, DMARC via DNS
- Supports HTML, plain text, attachments, inline images, custom headers
- Usage-based pricing
- Observability: bounce tracking, delivery status per message

### Workers Binding
```toml
# wrangler.toml
[[email]]
binding = "SEND_EMAIL"
domain = "webwaka.com"  # Must be verified in CF Email Service
```

### Usage in Worker
```typescript
await env.SEND_EMAIL.send({
  from: "noreply@webwaka.com",
  to: "user@example.com",
  subject: "Hello",
  html: "<p>Test email</p>"
});
```

### Key Constraint
- **Requires verified sending domain** in Cloudflare Email Service dashboard
- `webwaka.com` must be configured as a verified sender
- DNS records (SPF, DKIM, DMARC) must be provisioned through CF

### Decision for WebWaka
- Use `SEND_EMAIL` as the binding name (consistent, descriptive)
- Fall back to Resend if `SEND_EMAIL` binding is absent (gradual rollout safety)
- Maintain FROM address as `noreply@webwaka.com` (consistent with current)
- Keep Resend as registered fallback in provider registry

---

## 2. Multi-Identifier Authentication (Nigeria-first)

### Best Practices (2025-2026)

1. **Hybrid identity model**: store both email and phone as first-class identifier fields
2. **Phone OTP login**: SMS OTP via Termii (already integrated) for passwordless auth
3. **E.164 normalization**: normalize all phone numbers to `+234XXXXXXXXXX` format on write
4. **Anti-SIM swap protection**:
   - Velocity limits: max 3 OTP requests per 15 minutes per phone
   - OTP lockout: 5 failed attempts → 15-minute lock
   - Never rely on SMS OTP alone for high-value actions (align with existing TOTP for super_admin)
5. **NDPR compliance**: record consent when collecting phone for authentication
6. **Uniqueness**: UNIQUE(phone_e164, tenant_id) index — same phone can exist across tenants
7. **Discovery by admin**: allow admin to search users by phone number

### Nigeria-specific phone considerations
- MTN, Airtel, Glo, 9mobile are the major carriers
- SMS delivery can be unreliable; Termii covers major routes
- Mobile-first: users more likely to use phone than email for initial signup
- Many users in commerce verticals may not have work email addresses

### Approach for WebWaka

**Registration paths:**
1. Email path (current): email + password + businessName
2. Phone path (new): phone + OTP + businessName (no password required for phone-first)
3. Both (future): phone + email + password for maximum recovery options

**Login paths:**
1. Email path (current): email + password
2. Phone path (new): phone + OTP (passwordless)
3. Future: magic link via email

**Recovery paths:**
1. Email recovery (current): password reset link
2. Phone recovery (new): OTP verification to set new password

---

## 3. Provider Registry Design Pattern (Multi-tenant SaaS)

### Pattern Selection for Cloudflare Workers + D1

Given constraints:
- D1 = SQLite at edge (no RLS, but tenant_id in WHERE enforced by code — T3 invariant)
- Secrets cannot be stored plaintext in D1
- KV for hot-path lookups (avoid D1 latency on every request)
- ENCRYPTION_SECRET (AES-256-GCM) already exists in env

### Recommended Design

**D1 Tables:**
```sql
-- Provider metadata (no secrets)
CREATE TABLE provider_registry (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,           -- 'ai', 'email', 'sms', 'payment', 'identity'
  provider_name TEXT NOT NULL,      -- 'cloudflare_email', 'resend', 'openrouter', etc.
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',  -- 'active','inactive','testing','failover','deprecated'
  scope TEXT NOT NULL DEFAULT 'platform',   -- 'platform','partner','tenant'
  scope_id TEXT,                    -- NULL for platform; partner_id or tenant_id for scoped
  priority INTEGER NOT NULL DEFAULT 100,    -- lower = higher priority
  routing_policy TEXT DEFAULT 'primary',    -- 'primary','failover','round_robin'
  capabilities TEXT,                -- JSON array e.g. ["email_transactional"]
  config_json TEXT,                 -- JSON: non-secret config (baseUrl, model defaults)
  credentials_encrypted TEXT,       -- AES-256-GCM encrypted JSON of API keys
  credentials_iv TEXT,              -- IV for AES-GCM
  health_status TEXT DEFAULT 'unknown',
  last_health_check_at INTEGER,
  created_by TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Multi-key support (especially for OpenRouter)
CREATE TABLE ai_provider_keys (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES provider_registry(id),
  key_label TEXT NOT NULL,          -- 'key-1', 'key-2', etc.
  key_encrypted TEXT NOT NULL,      -- AES-256-GCM encrypted API key
  key_iv TEXT NOT NULL,             -- IV for AES-GCM
  status TEXT NOT NULL DEFAULT 'active',  -- 'active','rate_limited','invalid','disabled'
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  last_used_at INTEGER,
  rate_limited_until INTEGER,       -- epoch timestamp, NULL if not rate-limited
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Append-only audit log
CREATE TABLE provider_audit_log (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  action TEXT NOT NULL,             -- 'created','updated','activated','deactivated','credential_rotated'
  actor_id TEXT,
  actor_role TEXT,
  scope_id TEXT,                    -- tenant_id if scoped action
  changes_json TEXT,                -- what changed (NEVER include secret values)
  ip_hash TEXT,                     -- SHA-256(IP) for traceability
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

**KV Cache Pattern:**
```
Key: provider:active:{category}:{scope}:{scope_id}
Value: JSON { id, provider_name, config_json, credentials_encrypted, credentials_iv }
TTL: 300s (5 minutes) — stale-OK for provider selection
```

**Resolution Chain:**
```
resolveProvider(category, tenantId, partnerId) →
  1. Check: platform.provider_registry WHERE category=? AND scope='tenant' AND scope_id=tenantId AND status='active'
  2. Check: platform.provider_registry WHERE category=? AND scope='partner' AND scope_id=partnerId AND status='active'
  3. Check: platform.provider_registry WHERE category=? AND scope='platform' AND status='active'
  4. Emergency fallback: env var (if category supported)
```

### Credential Encryption (AES-256-GCM)
```typescript
// Using ENCRYPTION_SECRET from env (already exists)
async function encryptCredentials(credentials: Record<string, string>, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret).slice(0, 32),
    { name: 'AES-GCM' }, false, ['encrypt']
  );
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key,
    new TextEncoder().encode(JSON.stringify(credentials))
  );
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
}
```

### Scope Model Decision

| Category | Platform-only | Partner-configurable | Tenant-configurable |
|----------|:---:|:---:|:---:|
| AI providers | ✅ (platform BYOK) | ✅ (partner override) | ✅ (BYOK for workspace) |
| Transactional email | ✅ | ❌ (too operationally sensitive) | ❌ |
| SMS/OTP | ✅ | ❌ | ❌ |
| Payment gateway | ✅ | ✅ (partner Paystack config) | ❌ |
| Identity verification | ✅ | ❌ | ❌ |

---

## 4. OpenRouter Multi-Key Pooling

### Pattern (Cloudflare Workers compatible, no npm)

```typescript
// D1-backed key pool with KV for runtime rate-limit state

async function selectOpenRouterKey(pool: AIProviderKey[], kvNamespace: KVNamespace): Promise<AIProviderKey | null> {
  // Filter out keys that are currently rate-limited
  const now = Math.floor(Date.now() / 1000);
  const available = pool.filter(k => !k.rate_limited_until || k.rate_limited_until < now);
  
  if (available.length === 0) return null;
  
  // Least-recently-used selection (deterministic + balanced)
  const sorted = available.sort((a, b) => (a.last_used_at ?? 0) - (b.last_used_at ?? 0));
  return sorted[0];
}

async function handleRateLimit(key: AIProviderKey, db: D1Database): Promise<void> {
  const rateLimitUntil = Math.floor(Date.now() / 1000) + 60; // 1 minute
  await db.prepare(
    'UPDATE ai_provider_keys SET status="rate_limited", rate_limited_until=?, failed_requests=failed_requests+1 WHERE id=?'
  ).bind(rateLimitUntil, key.id).run();
}
```

### Integration with Existing Router

The existing `resolveAdapter` function uses `envVars[agg.apiKeyEnvVar]` to get keys.  
The new approach: when category is 'ai' and provider is 'openrouter':
1. Look up active OpenRouter provider from provider_registry
2. Get pool of `ai_provider_keys` for that provider
3. Select key using round-robin / least-used
4. Inject key into adapter config
5. On 429: mark key as rate-limited in D1, retry with next key

### Free Models Allowlist

Formalize the current implicit free-model behavior:
```typescript
export const FREE_MODEL_ALLOWLIST = {
  openrouter: [
    'meta-llama/llama-3.1-8b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'google/gemma-2-9b-it:free',
    'mistralai/mistral-7b-instruct:free',
  ],
  groq: [
    'llama-3.1-8b-instant',  // Free tier on Groq
    'llama-3.2-3b-preview',
    'gemma2-9b-it',
  ],
};
```

Config managed via KV (`ai:free_models_policy:{provider}`) so it can be updated without deploy.

---

## 5. Summary: Research-to-Design Mapping

| Research Finding | Design Decision |
|---|---|
| CF Email public beta, Workers native binding | Add [[email]] binding to wrangler.toml; implement CloudflareEmailProvider adapter |
| CF Email needs verified domain | webwaka.com must be verified in CF Email Service before deploy |
| Phone-first Nigeria auth | Add phone OTP login via Termii (already integrated); add phone_verified_at column |
| E.164 normalization required | Normalize on write (+234XXXXXXXXXX); update PHONE_RE validation |
| OTP velocity limits critical | KV-based rate limiting: 3 requests/15min per phone |
| D1 + AES-GCM for provider registry | Use existing ENCRYPTION_SECRET; store credentials_encrypted + credentials_iv in D1 |
| KV for hot-path lookups | Cache active provider per category/scope with 5-min TTL |
| OpenRouter multi-key round-robin | ai_provider_keys table + least-recently-used selection + D1 rate-limit tracking |
| Free model governance | FREE_MODEL_ALLOWLIST constant + KV for runtime overrides |
| Scope: platform/partner/tenant | AI: all 3; Email/SMS: platform only; Payments: platform+partner |

---

*Research synthesis complete.*
