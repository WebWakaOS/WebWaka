/**
 * Provider Registry — Resolution
 * Hierarchical provider resolution: tenant → partner → platform → env fallback
 */

import type { D1Like, ProviderCategory, ProviderResolutionContext, ProviderRow, ResolvedProvider } from './types.js';
import { decryptCredentials } from './crypto.js';

const KV_TTL_SECONDS = 300;

function kvCacheKey(category: ProviderCategory, scope: string, scopeId: string | null): string {
  return `provider:active:${category}:${scope}:${scopeId ?? 'null'}`;
}

export interface ResolutionOptions {
  kv?: KVNamespace;
  envFallback?: Record<string, string | undefined>;
}

export async function resolveProvider(
  db: D1Like,
  category: ProviderCategory,
  context: ProviderResolutionContext,
  encryptionSecret: string,
  opts?: ResolutionOptions,
): Promise<ResolvedProvider> {
  const { kv, envFallback } = opts ?? {};
  const scopesToTry: Array<{ scope: string; scopeId: string | null }> = [];
  if (context.tenantId) scopesToTry.push({ scope: 'tenant', scopeId: context.tenantId });
  if (context.partnerId) scopesToTry.push({ scope: 'partner', scopeId: context.partnerId });
  scopesToTry.push({ scope: 'platform', scopeId: null });

  for (const { scope, scopeId } of scopesToTry) {
    const cacheKey = kvCacheKey(category, scope, scopeId);
    if (kv) {
      const cached = await kv.get(cacheKey).catch(() => null);
      if (cached) {
        try {
          return await decryptRow(JSON.parse(cached) as ProviderRow, encryptionSecret);
        } catch { /* cache corrupt, fall through */ }
      }
    }
    let row: ProviderRow | null;
    if (scopeId === null) {
      row = await db.prepare(
        `SELECT * FROM provider_registry WHERE category = ? AND scope = ? AND scope_id IS NULL AND status = 'active' ORDER BY priority ASC LIMIT 1`,
      ).bind(category, scope).first<ProviderRow>();
    } else {
      row = await db.prepare(
        `SELECT * FROM provider_registry WHERE category = ? AND scope = ? AND scope_id = ? AND status = 'active' ORDER BY priority ASC LIMIT 1`,
      ).bind(category, scope, scopeId).first<ProviderRow>();
    }
    if (row) {
      if (kv) {
        await kv.put(cacheKey, JSON.stringify(row), { expirationTtl: KV_TTL_SECONDS }).catch(() => {});
      }
      return await decryptRow(row, encryptionSecret);
    }
  }

  if (envFallback) {
    const fallback = resolveEnvFallback(category, envFallback);
    if (fallback) return fallback;
  }

  throw new Error(`No active provider found for category '${category}'`);
}

async function decryptRow(row: ProviderRow, encryptionSecret: string): Promise<ResolvedProvider> {
  let credentials: Record<string, string> = {};
  if (row.credentials_encrypted && row.credentials_iv) {
    credentials = await decryptCredentials(row.credentials_encrypted, row.credentials_iv, encryptionSecret);
  }
  return {
    id: row.id, category: row.category, provider_name: row.provider_name,
    config: row.config_json ? JSON.parse(row.config_json) as Record<string, unknown> : null,
    credentials, scope: row.scope, scope_id: row.scope_id,
  };
}

const ENV_FALLBACKS: Partial<Record<ProviderCategory, Array<{ key: string; credentialField: string; providerName: string }>>> = {
  ai: [
    { key: 'GROQ_API_KEY', credentialField: 'api_key', providerName: 'groq' },
    { key: 'OPENROUTER_API_KEY', credentialField: 'api_key', providerName: 'openrouter' },
    { key: 'TOGETHER_API_KEY', credentialField: 'api_key', providerName: 'together' },
    { key: 'DEEPINFRA_API_KEY', credentialField: 'api_key', providerName: 'deepinfra' },
  ],
  email: [{ key: 'RESEND_API_KEY', credentialField: 'api_key', providerName: 'resend' }],
  sms: [{ key: 'TERMII_API_KEY', credentialField: 'api_key', providerName: 'termii' }],
  payment: [{ key: 'PAYSTACK_SECRET_KEY', credentialField: 'secret_key', providerName: 'paystack' }],
  identity: [{ key: 'PREMBLY_API_KEY', credentialField: 'api_key', providerName: 'prembly' }],
};

function resolveEnvFallback(category: ProviderCategory, envVars: Record<string, string | undefined>): ResolvedProvider | null {
  const fallbacks = ENV_FALLBACKS[category];
  if (!fallbacks) return null;
  for (const { key, credentialField, providerName } of fallbacks) {
    const value = envVars[key];
    if (value) {
      return {
        id: `env_fallback_${providerName}`, category, provider_name: providerName,
        config: null, credentials: { [credentialField]: value }, scope: 'platform', scope_id: null,
      };
    }
  }
  return null;
}

export async function invalidateProviderCache(
  kv: KVNamespace, category: ProviderCategory, scope: string, scopeId: string | null,
): Promise<void> {
  await kv.delete(kvCacheKey(category, scope, scopeId)).catch(() => {});
}
