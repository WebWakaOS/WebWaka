/**
 * @webwaka/control-plane — Shared types for all 5 dynamic control layers.
 */

// ─── D1-like interface (Cloudflare Workers compatible) ───────────────────────

export interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ meta?: { changes?: number; last_row_id?: number } }>;
      first<T = unknown>(): Promise<T | null>;
      all<T = unknown>(): Promise<{ results: T[] }>;
    };
  };
}

// ─── KV-like interface (Cloudflare KVNamespace compatible) ───────────────────

export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  results: T[];
  total?: number;
  limit: number;
  offset: number;
}

// ─── Actor context (who is making a change) ──────────────────────────────────

export type AdminLevel = 'super_admin' | 'platform_admin' | 'partner_admin' | 'tenant_admin' | 'workspace_admin' | 'system';

export interface ActorContext {
  actorId: string;
  actorRole: string;
  actorLevel: AdminLevel;
  tenantId?: string;
  partnerId?: string;
  workspaceId?: string;
  requestId?: string;
  ipAddress?: string;
}

// ─── Layer 1: Subscription Packages ─────────────────────────────────────────

export type PackageStatus = 'active' | 'inactive' | 'archived' | 'draft';
export type TargetAudience = 'tenant' | 'partner' | 'sub_partner' | 'all';

export interface SubscriptionPackage {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: PackageStatus;
  is_public: number;
  sort_order: number;
  partner_id?: string;
  target_audience: TargetAudience;
  superseded_by?: string;
  version: number;
  is_default: number;
  metadata: string;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface BillingInterval {
  id: string;
  code: string;
  label: string;
  description?: string;
  interval_days?: number;
  is_recurring: number;
  is_trial: number;
  trial_days?: number;
  sort_order: number;
}

export interface PackagePricing {
  id: string;
  package_id: string;
  billing_interval_id: string;
  price_kobo: number;
  currency: string;
  effective_from: number;
  effective_until?: number;
  trial_days_override?: number;
  is_active: number;
  paystack_plan_code?: string;
  metadata: string;
}

// ─── Layer 2: Entitlements ───────────────────────────────────────────────────

export type EntitlementValueType = 'boolean' | 'integer' | 'float' | 'string' | 'json';
export type EntitlementCategory = 'feature' | 'limit' | 'quota' | 'right' | 'layer' | 'flag';

export interface EntitlementDefinition {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: EntitlementCategory;
  value_type: EntitlementValueType;
  default_value: string;
  unit?: string;
  is_active: number;
  sort_order: number;
}

export interface PackageEntitlementBinding {
  id: string;
  package_id: string;
  entitlement_id: string;
  value: string;
  billing_interval_id?: string;
  notes?: string;
}

export interface ResolvedEntitlements {
  [code: string]: string | number | boolean;
}

// ─── Layer 3: Roles & Permissions ────────────────────────────────────────────

export type PermissionScope = 'platform' | 'partner' | 'tenant' | 'workspace' | 'self';

export interface PermissionDefinition {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  scope: PermissionScope;
  is_sensitive: number;
  is_active: number;
}

export interface CustomRole {
  id: string;
  tenant_id?: string;
  partner_id?: string;
  code: string;
  name: string;
  description?: string;
  base_role: string;
  max_grantable_role: string;
  is_active: number;
  is_system: number;
  metadata: string;
  created_by: string;
}

export interface ResolvedPermissions {
  granted: Set<string>;
  denied: Set<string>;
  hasPermission(code: string): boolean;
}

// ─── Layer 4: Delegation ─────────────────────────────────────────────────────

export interface DelegationPolicy {
  id: string;
  grantor_level: string;
  grantor_id?: string;
  grantee_level: string;
  grantee_id?: string;
  capability: string;
  ceiling_json: string;
  effect: 'allow' | 'deny';
  requires_approval: number;
  approver_level?: string;
  is_active: number;
}

// ─── Layer 5: Feature Flags ──────────────────────────────────────────────────

export type FlagCategory = 'feature' | 'beta' | 'kill_switch' | 'ui' | 'behavior' | 'rollout' | 'emergency';
export type FlagScope = 'environment' | 'plan' | 'partner' | 'tenant' | 'workspace';

export interface ConfigurationFlag {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: FlagCategory;
  value_type: string;
  default_value: string;
  min_scope: string;
  inheritable: number;
  is_kill_switch: number;
  rollout_pct: number;
  is_active: number;
  notes?: string;
  created_by?: string;
  created_at?: number;
  updated_at?: number;
}

export interface FlagResolutionContext {
  tenantId?: string;
  partnerId?: string;
  workspaceId?: string;
  planSlug?: string;
  environment?: string;
}
