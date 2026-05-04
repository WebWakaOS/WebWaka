/**
 * Provider Registry — Service
 * CRUD operations for provider_registry + audit log.
 */

import type {
  D1Like, ProviderInput, ProviderRecord, ProviderRow,
  ProviderAuditAction, ProviderCategory, ProviderStatus,
} from './types.js';
import { encryptCredentials, sha256hex } from './crypto.js';

interface ActorContext {
  actorId: string | null;
  actorRole: string | null;
  ipAddress?: string | null;
  scopeId?: string | null;
}

function parseProviderRow(row: ProviderRow): ProviderRecord {
  return {
    id: row.id,
    category: row.category,
    provider_name: row.provider_name,
    display_name: row.display_name,
    status: row.status,
    scope: row.scope,
    scope_id: row.scope_id,
    priority: row.priority,
    routing_policy: row.routing_policy,
    capabilities: row.capabilities ? (JSON.parse(row.capabilities) as string[]) : null,
    config: row.config_json ? (JSON.parse(row.config_json) as Record<string, unknown>) : null,
    health_status: row.health_status,
    last_health_check_at: row.last_health_check_at,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function writeAuditLog(
  db: D1Like,
  providerId: string,
  action: ProviderAuditAction,
  actor: ActorContext,
  changes: Record<string, unknown> | null,
): Promise<void> {
  const ipHash = actor.ipAddress ? await sha256hex(actor.ipAddress) : null;
  await db.prepare(
    `INSERT INTO provider_audit_log (id, provider_id, action, actor_id, actor_role, scope_id, changes_json, ip_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
  ).bind(
    crypto.randomUUID(), providerId, action,
    actor.actorId, actor.actorRole, actor.scopeId ?? null,
    changes ? JSON.stringify(changes) : null, ipHash,
  ).run();
}

export async function createProvider(
  db: D1Like, input: ProviderInput, actor: ActorContext, encryptionSecret: string,
): Promise<ProviderRecord> {
  const id = `pvd_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  let credentialsEncrypted: string | null = null;
  let credentialsIv: string | null = null;
  if (input.credentials && Object.keys(input.credentials).length > 0) {
    const enc = await encryptCredentials(input.credentials, encryptionSecret);
    credentialsEncrypted = enc.encrypted;
    credentialsIv = enc.iv;
  }
  await db.prepare(
    `INSERT INTO provider_registry
       (id, category, provider_name, display_name, status, scope, scope_id,
        priority, routing_policy, capabilities, config_json,
        credentials_encrypted, credentials_iv, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
  ).bind(
    id, input.category, input.provider_name, input.display_name,
    input.status ?? 'inactive', input.scope ?? 'platform', input.scope_id ?? null,
    input.priority ?? 100, input.routing_policy ?? 'primary',
    input.capabilities ? JSON.stringify(input.capabilities) : null,
    input.config ? JSON.stringify(input.config) : null,
    credentialsEncrypted, credentialsIv, actor.actorId,
  ).run();
  await writeAuditLog(db, id, 'created', actor, { category: input.category, provider_name: input.provider_name });
  const row = await db.prepare('SELECT * FROM provider_registry WHERE id = ? LIMIT 1').bind(id).first<ProviderRow>();
  if (!row) throw new Error(`Failed to fetch created provider ${id}`);
  return parseProviderRow(row);
}

export async function updateProvider(
  db: D1Like,
  providerId: string,
  updates: Partial<Pick<ProviderInput, 'display_name' | 'priority' | 'routing_policy' | 'capabilities' | 'config' | 'status'>>,
  actor: ActorContext,
): Promise<ProviderRecord | null> {
  const parts: string[] = [];
  const bindings: unknown[] = [];
  if (updates.display_name !== undefined) { parts.push('display_name = ?'); bindings.push(updates.display_name); }
  if (updates.priority !== undefined) { parts.push('priority = ?'); bindings.push(updates.priority); }
  if (updates.routing_policy !== undefined) { parts.push('routing_policy = ?'); bindings.push(updates.routing_policy); }
  if (updates.capabilities !== undefined) { parts.push('capabilities = ?'); bindings.push(JSON.stringify(updates.capabilities)); }
  if (updates.config !== undefined) { parts.push('config_json = ?'); bindings.push(JSON.stringify(updates.config)); }
  if (updates.status !== undefined) { parts.push('status = ?'); bindings.push(updates.status); }
  if (parts.length === 0) return null;
  parts.push('updated_at = unixepoch()');
  bindings.push(providerId);
  await db.prepare(`UPDATE provider_registry SET ${parts.join(', ')} WHERE id = ?`).bind(...bindings).run();
  await writeAuditLog(db, providerId, 'updated', actor, updates as Record<string, unknown>);
  const row = await db.prepare('SELECT * FROM provider_registry WHERE id = ? LIMIT 1').bind(providerId).first<ProviderRow>();
  return row ? parseProviderRow(row) : null;
}

export async function rotateCredentials(
  db: D1Like, providerId: string, newCredentials: Record<string, string>,
  actor: ActorContext, encryptionSecret: string,
): Promise<void> {
  const enc = await encryptCredentials(newCredentials, encryptionSecret);
  await db.prepare(
    `UPDATE provider_registry SET credentials_encrypted = ?, credentials_iv = ?, updated_at = unixepoch() WHERE id = ?`,
  ).bind(enc.encrypted, enc.iv, providerId).run();
  await writeAuditLog(db, providerId, 'credential_rotated', actor, { credential_keys: Object.keys(newCredentials) });
}

export async function activateProvider(
  db: D1Like, providerId: string, actor: ActorContext,
): Promise<void> {
  const row = await db.prepare('SELECT category, scope, scope_id FROM provider_registry WHERE id = ? LIMIT 1')
    .bind(providerId).first<{ category: ProviderCategory; scope: string; scope_id: string | null }>();
  if (!row) throw new Error(`Provider ${providerId} not found`);
  const singleActiveCategories: ProviderCategory[] = ['email', 'sms', 'payment', 'identity'];
  if (singleActiveCategories.includes(row.category as ProviderCategory)) {
    await db.prepare(
      `UPDATE provider_registry SET status = 'inactive', updated_at = unixepoch()
       WHERE category = ? AND scope = ? AND scope_id IS ? AND status = 'active' AND id != ?`,
    ).bind(row.category, row.scope, row.scope_id, providerId).run();
  }
  await db.prepare(`UPDATE provider_registry SET status = 'active', updated_at = unixepoch() WHERE id = ?`).bind(providerId).run();
  await writeAuditLog(db, providerId, 'activated', actor, { category: row.category });
}

export async function deactivateProvider(
  db: D1Like, providerId: string, actor: ActorContext,
): Promise<void> {
  await db.prepare(`UPDATE provider_registry SET status = 'inactive', updated_at = unixepoch() WHERE id = ?`).bind(providerId).run();
  await writeAuditLog(db, providerId, 'deactivated', actor, {});
}

export async function listProviders(
  db: D1Like,
  filters?: { category?: ProviderCategory; scope?: string; scope_id?: string | null; status?: ProviderStatus },
): Promise<ProviderRecord[]> {
  const conditions: string[] = [];
  const bindings: unknown[] = [];
  if (filters?.category) { conditions.push('category = ?'); bindings.push(filters.category); }
  if (filters?.scope) { conditions.push('scope = ?'); bindings.push(filters.scope); }
  if (filters?.scope_id !== undefined) {
    if (filters.scope_id === null) { conditions.push('scope_id IS NULL'); }
    else { conditions.push('scope_id = ?'); bindings.push(filters.scope_id); }
  }
  if (filters?.status) { conditions.push('status = ?'); bindings.push(filters.status); }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await db.prepare(`SELECT * FROM provider_registry ${where} ORDER BY priority ASC, created_at ASC`).bind(...bindings).all<ProviderRow>();
  return result.results.map(parseProviderRow);
}

export async function getProvider(db: D1Like, providerId: string): Promise<ProviderRecord | null> {
  const row = await db.prepare('SELECT * FROM provider_registry WHERE id = ? LIMIT 1').bind(providerId).first<ProviderRow>();
  return row ? parseProviderRow(row) : null;
}

export async function getProviderAuditLog(db: D1Like, providerId: string, limit = 50) {
  const result = await db.prepare(
    `SELECT id, action, actor_id, actor_role, scope_id, changes_json, created_at
     FROM provider_audit_log WHERE provider_id = ? ORDER BY created_at DESC LIMIT ?`,
  ).bind(providerId, limit).all();
  return result.results;
}

export async function updateHealthStatus(
  db: D1Like, providerId: string, healthStatus: 'healthy' | 'degraded' | 'down' | 'unknown',
): Promise<void> {
  await db.prepare(
    `UPDATE provider_registry SET health_status = ?, last_health_check_at = unixepoch(), updated_at = unixepoch() WHERE id = ?`,
  ).bind(healthStatus, providerId).run();
}
