/**
 * @webwaka/control-plane
 *
 * Dynamic Configurability and Delegated Governance control plane for WebWaka OS.
 *
 * Exports all 5 dynamic control layer services:
 *   Layer 1 — PlanCatalogService  (dynamic subscription catalog)
 *   Layer 2 — EntitlementEngine   (runtime entitlement definitions + resolution)
 *   Layer 3 — PermissionResolver  (custom roles + groups + user overrides)
 *   Layer 4 — DelegationGuard     (hierarchical admin delegation + ceilings)
 *   Layer 5 — FlagService         (platform-wide runtime configuration flags)
 *   Cross   — AuditService        (append-only governance audit log)
 */

export type { D1Like, KVLike, ActorContext, AdminLevel, PaginatedResult, PaginationOptions } from './types.js';
export type {
  SubscriptionPackage, BillingInterval, PackagePricing,
  PackageStatus, TargetAudience,
  EntitlementDefinition, PackageEntitlementBinding, ResolvedEntitlements,
  PermissionDefinition, CustomRole, ResolvedPermissions,
  DelegationPolicy,
  ConfigurationFlag, FlagResolutionContext,
} from './types.js';

export { AuditService } from './audit-service.js';
export type { AuditEntry } from './audit-service.js';

export { PlanCatalogService } from './plan-catalog-service.js';
export type { CreatePackageInput, UpdatePackageInput, SetPricingInput } from './plan-catalog-service.js';

export { EntitlementEngine } from './entitlement-engine.js';
export { PermissionResolver } from './permission-resolver.js';
export { FlagService } from './flag-service.js';
export { DelegationGuard, DelegationError } from './delegation-guard.js';

import type { D1Like, KVLike } from './types.js';
import { AuditService } from './audit-service.js';
import { PlanCatalogService } from './plan-catalog-service.js';
import { EntitlementEngine } from './entitlement-engine.js';
import { PermissionResolver } from './permission-resolver.js';
import { FlagService } from './flag-service.js';
import { DelegationGuard } from './delegation-guard.js';

export interface ControlPlane {
  audit: AuditService;
  plans: PlanCatalogService;
  entitlements: EntitlementEngine;
  permissions: PermissionResolver;
  flags: FlagService;
  delegation: DelegationGuard;
}

/**
 * Factory: create all control-plane services from a D1 binding.
 * Pass an optional KV namespace to enable FlagService caching.
 *
 * Usage in a Hono handler:
 *   const cp = createControlPlane(c.env.DB, c.env.KV);
 *   const resolved = await cp.flags.resolve('my_flag', ctx);
 */
export function createControlPlane(db: D1Like, kv?: KVLike): ControlPlane {
  const audit = new AuditService(db);
  return {
    audit,
    plans: new PlanCatalogService(db, audit),
    entitlements: new EntitlementEngine(db, audit),
    permissions: new PermissionResolver(db, audit),
    flags: new FlagService(db, audit, kv),
    delegation: new DelegationGuard(db, audit),
  };
}
