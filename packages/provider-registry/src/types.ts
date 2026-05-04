/**
 * Provider Registry — Types
 */

export type ProviderCategory =
  | 'ai'
  | 'email'
  | 'sms'
  | 'payment'
  | 'identity'
  | 'storage';

export type ProviderStatus =
  | 'active'
  | 'inactive'
  | 'testing'
  | 'failover'
  | 'deprecated';

export type ProviderScope = 'platform' | 'partner' | 'tenant';
export type RoutingPolicy = 'primary' | 'failover' | 'round_robin';

export interface ProviderRow {
  id: string;
  category: ProviderCategory;
  provider_name: string;
  display_name: string;
  status: ProviderStatus;
  scope: ProviderScope;
  scope_id: string | null;
  priority: number;
  routing_policy: RoutingPolicy;
  capabilities: string | null;
  config_json: string | null;
  credentials_encrypted: string | null;
  credentials_iv: string | null;
  health_status: 'healthy' | 'degraded' | 'down' | 'unknown';
  last_health_check_at: number | null;
  created_by: string | null;
  created_at: number;
  updated_at: number;
}

export interface AIProviderKeyRow {
  id: string;
  provider_id: string;
  key_label: string;
  key_encrypted: string;
  key_iv: string;
  status: 'active' | 'rate_limited' | 'invalid' | 'disabled';
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  last_used_at: number | null;
  rate_limited_until: number | null;
  created_at: number;
  updated_at: number;
}

export interface ProviderAuditRow {
  id: string;
  provider_id: string;
  action: ProviderAuditAction;
  actor_id: string | null;
  actor_role: string | null;
  scope_id: string | null;
  changes_json: string | null;
  ip_hash: string | null;
  created_at: number;
}

export type ProviderAuditAction =
  | 'created'
  | 'updated'
  | 'activated'
  | 'deactivated'
  | 'credential_rotated'
  | 'tested'
  | 'deleted'
  | 'key_added'
  | 'key_removed'
  | 'key_rate_limited';

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
  config: Record<string, unknown> | null;
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
  config: Record<string, unknown> | null;
  credentials: Record<string, string>;
  scope: ProviderScope;
  scope_id: string | null;
}

export interface ProviderInput {
  category: ProviderCategory;
  provider_name: string;
  display_name: string;
  status?: ProviderStatus;
  scope?: ProviderScope;
  scope_id?: string | null;
  priority?: number;
  routing_policy?: RoutingPolicy;
  capabilities?: string[];
  config?: Record<string, unknown>;
  credentials?: Record<string, string>;
}

export interface ProviderResolutionContext {
  tenantId?: string;
  partnerId?: string;
}

export interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      all<T = unknown>(): Promise<{ results: T[] }>;
      run(): Promise<{ success: boolean }>;
    };
  };
  batch(statements: unknown[]): Promise<unknown[]>;
}
