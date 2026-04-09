/**
 * @webwaka/auth — JWT validation, workspace-scoped auth, role guards,
 * entitlement-aware access control, and AI auth hooks.
 *
 * (TDR-0008, security-baseline.md)
 *
 * Design: Identity + Tenant context are BOTH required. Neither alone is sufficient.
 * SA-1.8: Added ai-hooks (NDPR consent, USSD guard, AIRoutingContext builder).
 */

export * from './jwt.js';
export * from './roles.js';
export * from './entitlements.js';
export * from './middleware.js';
export * from './guards.js';
export * from './ai-hooks.js';
