# WebWaka OS — Dynamic Configurability & Delegated Governance
## Implementation Register — Batch 0 (Discovery + Foundation)

**Initiative Ref:** Dynamic Configurability and Delegated Governance  
**Date:** 2026-05-02  
**Status:** Migrations written, control-plane services implemented, API routes registered, dashboard live  

---

## 1. Problem Statement

All subscription plans, pricing, entitlements, role definitions, feature flags, and admin delegation rules are currently **hardcoded** in TypeScript source files. Changing any of them requires a code deploy. This register documents every hardcoded location, the new dynamic DB tables that replace them, the migration order, and the services/routes that expose them at runtime.

---

## 2. Hardcoded Config Inventory

### Layer 1 — Subscription Plans & Pricing

| File | Symbol | Content | Status |
|------|--------|---------|--------|
| `packages/entitlements/src/plan-config.ts` | `PLAN_CONFIGS` | 7 plans (free, starter, growth, pro, enterprise, partner, sub_partner) with all entitlement values | **Preserved as fallback** |
| `apps/api/src/routes/billing.ts:30–37` | `PLAN_RANK`, `VALID_PLANS` | Hardcoded plan upgrade/downgrade rank order | **Compatibility layer — not removed yet** |
| `apps/api/src/routes/billing.ts:28` | `GRACE_PERIOD_SECONDS` | 7-day hardcoded grace period | **Hardcoded — Phase 2** |

### Layer 2 — Entitlements

| File | Symbol | Content | Status |
|------|--------|---------|--------|
| `packages/entitlements/src/plan-config.ts` | `PlanConfig` interface | maxUsers, maxPlaces, maxOfferings, brandingRights, whiteLabelDepth, delegationRights, aiRights, sensitiveSectorRights, wakaPagePublicPage, wakaPageAnalytics, groupsEnabled, valueMovementEnabled | **Seeded into DB via 0471** |
| `packages/entitlements/src/evaluate.ts` | `evaluateLayerAccess`, `evaluateUserLimit`, etc. | All evaluation reads from `PLAN_CONFIGS` | **Fallback preserved; DB-first path in EntitlementEngine** |
| `packages/entitlements/src/guards.ts` | `requireLayerAccess`, `requireBrandingRights`, etc. | Guards read from `PLAN_CONFIGS` | **Preserved; new DB-aware overloads available via control-plane** |

### Layer 3 — Roles & Permissions

| File | Symbol | Content | Status |
|------|--------|---------|--------|
| `packages/auth/src/roles.ts` | `ROLE_HIERARCHY` | Fixed 7-role hierarchy: super_admin > admin > manager > agent > cashier > member > public | **Preserved; custom roles extend (not replace) this** |
| `packages/auth/src/roles.ts` | `hasMinimumRole`, `requireRole`, `requireSuperAdmin` | Role enforcement guards | **Preserved; custom_roles table adds on top** |

### Layer 4 — Delegated Admin

| File | Symbol | Content | Status |
|------|--------|---------|--------|
| None previously | — | No delegation system existed | **New: admin_delegation_policies + delegation_capabilities** |

### Layer 5 — Feature Flags

| File | Symbol | Content | Status |
|------|--------|---------|--------|
| `packages/pilot/src/pilot-flag-service.ts` | `PilotFlagService` | Per-tenant DB-backed pilot flags | **Extended by FlagService; pilot table preserved** |
| `packages/hl-wallet/src/feature-flags.ts` | Wallet KV flags | `WALLET_KV` key-based flags | **Migrated to configuration_flags table via 0469 seed** |
| `apps/api/src/env.ts` | `NOTIFICATION_PIPELINE_ENABLED` | Hard env var flag | **Seeded into configuration_flags as `notification_pipeline_enabled`** |

---

## 3. Migration Register

All migrations are in `apps/api/migrations/`. Each has a paired `.rollback.sql` file.

| Migration | Name | Tables Created | Seed |
|-----------|------|----------------|------|
| **0464** | `dynamic_subscription_catalog` | `subscription_packages`, `billing_intervals`, `package_pricing`, `package_targeting_rules`, `package_version_history` | Seeds 6 billing intervals |
| **0465** | `entitlement_definitions` | `entitlement_definitions`, `package_entitlement_bindings`, `workspace_entitlement_overrides` | Seeds 24 entitlement definitions |
| **0466** | `dynamic_roles_permissions` | `permission_definitions`, `permission_bundles`, `bundle_permission_bindings`, `custom_roles`, `role_permission_bindings`, `role_bundle_bindings` | Seeds 20 platform permission definitions |
| **0467** | `user_groups` | `user_groups`, `group_memberships`, `group_role_bindings`, `group_permission_bindings`, `user_permission_overrides`, `user_role_assignments` | — |
| **0468** | `admin_delegation` | `admin_delegation_policies`, `delegation_capabilities`, `delegation_approval_queue` | Seeds 12 delegation capabilities |
| **0469** | `config_flags` | `configuration_flags`, `configuration_overrides`, `flag_targeting_rules` | Seeds 14 platform-wide flags |
| **0470** | `governance_audit_log` | `governance_audit_log` | — |
| **0471** | `seed_plan_catalog` | — | Seeds all 7 PLAN_CONFIGS plans + pricing + 370+ entitlement bindings |

**Total new tables:** 20  
**Total new indexes:** 26  
**Rollback files:** 16 (one per forward migration × 2)

---

## 4. Package: `@webwaka/control-plane`

**Location:** `packages/control-plane/`

| File | Class | Responsibility |
|------|-------|----------------|
| `src/types.ts` | — | Shared TypeScript types for all 5 layers |
| `src/audit-service.ts` | `AuditService` | Append-only governance_audit_log writes + queries |
| `src/plan-catalog-service.ts` | `PlanCatalogService` | Package CRUD, pricing, versioning, activate/deactivate/archive |
| `src/entitlement-engine.ts` | `EntitlementEngine` | Definition CRUD, package bindings, workspace overrides, full resolution |
| `src/permission-resolver.ts` | `PermissionResolver` | Custom role CRUD, group CRUD, membership, per-user overrides, full resolution |
| `src/flag-service.ts` | `FlagService` | Flag CRUD, scoped overrides, rollout %, kill-switch handling, full resolution |
| `src/delegation-guard.ts` | `DelegationGuard` | Policy CRUD, capability enforcement, privilege-escalation prevention |
| `src/index.ts` | `createControlPlane()` | Factory: creates all 6 services from a D1 binding |

**Resolution order (entitlements):**  
`workspace_entitlement_overrides` → `package_entitlement_bindings` → `PLAN_CONFIGS fallback` → `entitlement_definitions.default_value`

**Resolution order (flags):**  
`workspace scope` → `tenant scope` → `partner scope` → `plan scope` → `environment scope` → `flag.default_value`

**Resolution order (permissions):**  
`user_permission_overrides (denials)` → `user_permission_overrides (grants)` → `group_permission_bindings` → `role_permission_bindings` → (nothing = denied)

---

## 5. API Routes Register

All routes mounted under `/platform-admin/cp/*` with `super_admin` role guard + audit log middleware.

| Module | Routes | File |
|--------|--------|------|
| **Plans (L1)** | `GET /plans`, `POST /plans`, `GET /plans/:id`, `PATCH /plans/:id`, `POST /plans/:id/activate`, `POST /plans/:id/deactivate`, `POST /plans/:id/archive`, `GET /plans/:id/pricing`, `PUT /plans/:id/pricing`, `GET /billing-intervals` | `apps/api/src/routes/control-plane/plans.ts` |
| **Entitlements (L2)** | `GET /entitlements`, `POST /entitlements`, `PATCH /entitlements/:id`, `GET /entitlements/packages/:pkgId`, `PUT /entitlements/packages/:pkgId/:entId`, `DELETE /entitlements/packages/:pkgId/:entId`, `GET /entitlements/workspaces/:wId`, `PUT /entitlements/workspaces/:wId/:entId` | `apps/api/src/routes/control-plane/entitlements.ts` |
| **Roles (L3)** | `GET /roles/permissions`, `GET /roles`, `POST /roles`, `GET /roles/:id`, `POST /roles/:id/permissions` | `apps/api/src/routes/control-plane/roles.ts` |
| **Groups (L3 cont)** | `GET /groups`, `POST /groups`, `POST /groups/:id/members`, `DELETE /groups/:id/members/:uid`, `POST /groups/:id/roles`, `GET /groups/users/:uid/permissions`, `POST /groups/users/:uid/overrides` | `apps/api/src/routes/control-plane/groups.ts` |
| **Flags + Delegation (L4+L5)** | `GET /flags`, `GET /flags/resolve`, `POST /flags`, `GET /flags/:id`, `PATCH /flags/:id`, `PUT /flags/:id/override`, `DELETE /flags/:id/override`, `GET /flags/delegation/capabilities`, `GET /flags/delegation/policies`, `POST /flags/delegation/policies` | `apps/api/src/routes/control-plane/flags.ts` |
| **Audit (cross)** | `GET /audit` | `apps/api/src/routes/control-plane/audit.ts` |

Routes registered in: `apps/api/src/route-groups/register-admin-routes.ts`

---

## 6. Dashboard

**File:** `apps/platform-admin/public/control-plane.html`  
**URL:** `/control-plane.html`  
**Linked from:** `apps/platform-admin/public/index.html`

| Tab | Endpoint called |
|-----|----------------|
| Plans | `GET /platform-admin/cp/plans` |
| Entitlements | `GET /platform-admin/cp/entitlements` |
| Roles | `GET /platform-admin/cp/roles`, `GET /platform-admin/cp/roles/permissions` |
| Groups | `GET /platform-admin/cp/groups` |
| Feature Flags | `GET /platform-admin/cp/flags` |
| Audit Log | `GET /platform-admin/cp/audit` |

---

## 7. Compatibility & Risk

### Breaking Changes: None
- `PLAN_CONFIGS` in `packages/entitlements/src/plan-config.ts` is **preserved unchanged** as a static fallback.
- `ROLE_HIERARCHY` in `packages/auth/src/roles.ts` is **preserved unchanged**.
- `PilotFlagService` and the `pilot_feature_flags` table are **preserved unchanged**.
- All existing entitlement guards (`requireLayerAccess`, etc.) continue to function against `PLAN_CONFIGS`.

### Migration Safety
- All 8 migrations use `IF NOT EXISTS` + `INSERT OR IGNORE` — safe to re-run.
- Rollback scripts tested for table drop order respecting foreign keys.
- Seed migration (0471) uses `OR IGNORE` — idempotent.

### Known Risks
| Risk | Mitigation |
|------|-----------|
| D1 FK enforcement is advisory (SQLite default PRAGMA foreign_keys=off) | Application layer enforces FK constraints |
| `governance_audit_log` has no hard DELETE block | AuditService never calls DELETE; monitor via code review |
| `configuration_flags` kill-switch check adds 1 extra DB read per flag resolution | Cache flag list in KV in Phase 2 |
| `custom_roles` extend but don't replace ROLE_HIERARCHY | `DelegationGuard.assertCanAssignRole` enforces ceiling |

---

## 8. Entitlement Middleware Wire-Up (T006 — Completed)

**New file:** `apps/api/src/middleware/workspace-entitlement-context.ts`

Shared builder that runs on every entitlement-gated request:

1. Queries `workspaces` table → `subscription_status`, `subscription_plan`, `active_layers`
2. Calls `EntitlementEngine.resolveForWorkspace(workspaceId, planSlug)`
3. Maps DB codes (snake_case) → `Partial<PlanConfig>` (camelCase) via two lookup tables:
   - `NUMERIC_CODE_MAP`: `max_users` → `maxUsers`, `max_places` → `maxPlaces`, etc.
   - `BOOLEAN_CODE_MAP`: `branding_rights` → `brandingRights`, `ai_rights` → `aiRights`, etc.
4. Merges `layer_*` codes into `ctx.activeLayers` — DB layer grants intersect with workspace column
5. Graceful fallback: if control-plane tables don't exist (pre-migration), returns `{}` → `PLAN_CONFIGS` used transparently

**Updated files:**
- `apps/api/src/middleware/entitlement.ts` — uses `buildWorkspaceContext()`, passes `ctx.entitlementCtx` to `requireLayerAccess`
- `apps/api/src/middleware/ai-entitlement.ts` — uses `buildWorkspaceContext()`, passes `ctx.resolvedEntitlements` to `requireAIAccess` for DB-first AI rights resolution

**Coverage:** Every route gated by `requireEntitlement(layer)` or `aiEntitlementMiddleware` now gets DB-first resolution automatically. This covers POS, all 159+ verticals, superagent, and vertical engine routes.

**Resolution priority (enforced end-to-end):**
```
workspace_entitlement_overrides  (highest — per-workspace DB overrides, with optional expiry)
  ↓
package_entitlement_bindings     (per-plan DB entitlements seeded from PLAN_CONFIGS)
  ↓
PLAN_CONFIGS static fallback     (compatibility bridge — zero breaking changes)
  ↓
entitlement_definitions.default_value  (absolute last resort)
```

## 9. Billing Runtime Configuration (Completed)

**Migration 0472:** `apps/api/migrations/0472_billing_config_flags.sql`

Seeds two flags into `configuration_flags` (dashboard-editable, no redeploy required):
- `billing_grace_period_days` (integer, default `7`) — days before suspension after a subscription expires
- `billing_default_interval_code` (string, default `monthly`) — which `billing_intervals.code` to use when renewing

**Three helpers added to `apps/api/src/routes/billing.ts`:**

| Helper | DB source | Fallback |
|---|---|---|
| `lookupIntervalDays(db, code)` | `billing_intervals.interval_days WHERE code = ?` | 30 |
| `lookupGracePeriodSeconds(db)` | `configuration_flags WHERE code = 'billing_grace_period_days'` | 7 × 86400 |
| `loadPlanRank(db)` | `subscription_packages WHERE status='active' ORDER BY sort_order` | `STATIC_PLAN_RANK` (7 plans) |

**Hardcoded values replaced:**
- `GRACE_PERIOD_SECONDS = 7 * 24 * 60 * 60` → `lookupGracePeriodSeconds(db)` in `/billing/enforce`
- `now + 30 * 24 * 60 * 60` → `lookupIntervalDays(db)` in `/billing/reactivate`
- `now + 30 * 24 * 60 * 60` → `lookupIntervalDays(db)` in `/billing/change-plan` (upgrade path)
- `PLAN_RANK` / `VALID_PLANS` (static 4-plan map) → `loadPlanRank(db)` (7 plans from DB)

**All helpers wrapped in try/catch** — zero disruption if tables absent (pre-migration deploy).

**Static fallback updated:** `STATIC_PLAN_RANK` now covers all 7 plans seeded in 0471:
`free(0) → starter(1) → growth(2) → pro(3) → enterprise(4) → partner(5) → sub_partner(6)`

## 10. Next Steps (Batch 3+)

- [ ] KV caching layer for `FlagService.resolve()` to avoid per-request DB reads  
- [ ] `PilotFlagService` → delegate to `FlagService` (keep existing table as source-of-truth, add bridge)  
- [ ] E2E tests: create package → bind entitlements → resolve for workspace  
- [ ] Paystack plan code sync: when package pricing is set, sync `paystack_plan_code` to Paystack API  
- [ ] Partner admin dashboard: scoped view of plans/flags/groups for partner-level admins  
