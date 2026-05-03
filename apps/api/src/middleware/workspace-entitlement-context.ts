/**
 * Shared workspace entitlement context builder.
 *
 * Implements the DB-first entitlement resolution path (T006 wire-up):
 *
 *   1. Query workspace row → subscription_status, subscription_plan, active_layers
 *   2. Call EntitlementEngine.resolveForWorkspace() for DB-managed values
 *   3. Map DB codes (snake_case) → Partial<PlanConfig> (camelCase)
 *   4. Merge DB-resolved layer_* codes into ctx.activeLayers (so requireLayerAccess
 *      also sees the DB-managed layer grants)
 *   5. Fall back to PLAN_CONFIGS if the control-plane tables have no data yet
 *      (pre-migration or plan not yet seeded) — zero disruption on rollout
 *
 * Resolution priority (per-field):
 *   workspace_entitlement_overrides > package_entitlement_bindings > PLAN_CONFIGS
 *
 * The returned resolvedEntitlements is typed as the @webwaka/entitlements
 * ResolvedEntitlements (Partial<PlanConfig>) — ready to be passed directly to
 * any evaluate* or require* function as the optional third argument.
 */

import type { Env } from '../env.js';
import type { Context } from 'hono';
import { PlatformLayer, SubscriptionStatus } from '@webwaka/types';
import type { SubscriptionPlan, EntitlementContext } from '@webwaka/types';
import type { ResolvedEntitlements } from '@webwaka/entitlements';
import { EntitlementEngine } from '@webwaka/control-plane';
import { AuditService } from '@webwaka/control-plane';

// ─── DB row from workspaces table ────────────────────────────────────────────

interface WorkspaceRow {
  id: string;
  subscription_status: string;
  subscription_plan: string;
  active_layers: string;
}

// ─── Returned from buildWorkspaceContext ─────────────────────────────────────

export interface WorkspaceEntitlementContext {
  /** The raw workspace DB row. */
  workspaceId: string;
  /** Fully constructed EntitlementContext ready for guards/evaluate functions. */
  entitlementCtx: EntitlementContext;
  /**
   * DB-resolved entitlements as Partial<PlanConfig>.
   * Pass this as the optional `resolvedEntitlements` parameter to any
   * evaluate* / require* function to apply DB overrides over PLAN_CONFIGS.
   *
   * Will be an empty object `{}` when:
   *   - control-plane tables don't exist yet (pre-migration)
   *   - plan slug has no matching active package in subscription_packages
   * In that case the evaluate/guard functions fall back to PLAN_CONFIGS.
   */
  resolvedEntitlements: ResolvedEntitlements;
}

// ─── Layer code → PlatformLayer enum mapping ─────────────────────────────────
// Matches the seeded entitlement codes in migration 0465.

const LAYER_CODE_MAP: Record<string, PlatformLayer> = {
  layer_discovery:    PlatformLayer.Discovery,
  layer_operational:  PlatformLayer.Operational,
  layer_commerce:     PlatformLayer.Commerce,
  layer_civic:        PlatformLayer.Civic,
  layer_ai:           PlatformLayer.AI,
  layer_transport:    PlatformLayer.Transport,
  layer_professional: PlatformLayer.Professional,
  layer_creator:      PlatformLayer.Creator,
  layer_political:    PlatformLayer.Political,
  layer_institutional: PlatformLayer.Institutional,
  layer_whitelabel:   PlatformLayer.WhiteLabel,
};

// ─── DB code → PlanConfig key mapping ────────────────────────────────────────
// Maps snake_case entitlement codes (from entitlement_definitions) to
// the camelCase PlanConfig keys consumed by ResolvedEntitlements.

type PlanConfigNumericField = 'maxUsers' | 'maxPlaces' | 'maxOfferings' | 'whiteLabelDepth';
type PlanConfigBooleanField =
  | 'brandingRights'
  | 'delegationRights'
  | 'aiRights'
  | 'sensitiveSectorRights'
  | 'wakaPagePublicPage'
  | 'wakaPageAnalytics'
  | 'groupsEnabled'
  | 'valueMovementEnabled';

const NUMERIC_CODE_MAP: Record<string, PlanConfigNumericField> = {
  max_users:         'maxUsers',
  max_places:        'maxPlaces',
  max_offerings:     'maxOfferings',
  whitelabel_depth:  'whiteLabelDepth',
};

const BOOLEAN_CODE_MAP: Record<string, PlanConfigBooleanField> = {
  branding_rights:         'brandingRights',
  delegation_rights:       'delegationRights',
  ai_rights:               'aiRights',
  sensitive_sector_rights: 'sensitiveSectorRights',
  wakapage_public_page:    'wakaPagePublicPage',
  wakapage_analytics:      'wakaPageAnalytics',
  groups_enabled:          'groupsEnabled',
  value_movement_enabled:  'valueMovementEnabled',
};

// ─── Main builder ─────────────────────────────────────────────────────────────

/**
 * Build the full workspace entitlement context for a request.
 *
 * @param c - Hono context with DB binding.
 * @param workspaceId - The workspace to resolve for (from auth or path param).
 * @param tenantId - The owning tenant (for cross-tenant isolation).
 * @returns WorkspaceEntitlementContext, or null if the workspace is not found.
 */
export async function buildWorkspaceContext(
  c: Context<{ Bindings: Env }>,
  workspaceId: string | undefined,
  tenantId: string,
): Promise<WorkspaceEntitlementContext | null> {

  // ── 1. Fetch workspace row ─────────────────────────────────────────────────
  const query = workspaceId
    ? `SELECT id, subscription_status, subscription_plan, active_layers
       FROM workspaces WHERE id = ? AND tenant_id = ? LIMIT 1`
    : `SELECT id, subscription_status, subscription_plan, active_layers
       FROM workspaces WHERE tenant_id = ? LIMIT 1`;

  const bindings = workspaceId ? [workspaceId, tenantId] : [tenantId];
  const ws = await c.env.DB.prepare(query).bind(...bindings).first<WorkspaceRow>();

  if (!ws) return null;

  // ── 2. Parse static active_layers from workspace column ───────────────────
  let staticLayers: PlatformLayer[];
  try {
    staticLayers = JSON.parse(ws.active_layers || '[]') as PlatformLayer[];
  } catch {
    staticLayers = [];
  }

  // ── 3. Call EntitlementEngine.resolveForWorkspace() ───────────────────────
  // Graceful fallback: if control-plane tables don't exist yet or the plan slug
  // has no matching active package, resolveForWorkspace() returns {} and we
  // fall through to PLAN_CONFIGS via the entitlements compatibility bridge.
  let rawResolved: Record<string, string | number | boolean> = {};
  try {
    const audit = new AuditService(c.env.DB);
    const engine = new EntitlementEngine(c.env.DB, audit);
    rawResolved = await engine.resolveForWorkspace(ws.id, ws.subscription_plan);
  } catch {
    // Control-plane tables not yet applied — continue with static fallback
    rawResolved = {};
  }

  // ── 4. Map DB codes → Partial<PlanConfig> ────────────────────────────────
  const resolved: ResolvedEntitlements = {};

  // Numeric fields (maxUsers, maxPlaces, maxOfferings, whiteLabelDepth)
  for (const [code, field] of Object.entries(NUMERIC_CODE_MAP)) {
    const val = rawResolved[code];
    if (typeof val === 'number') {
      (resolved as Record<string, unknown>)[field] = val;
    }
  }

  // Boolean fields (brandingRights, aiRights, etc.)
  for (const [code, field] of Object.entries(BOOLEAN_CODE_MAP)) {
    const val = rawResolved[code];
    if (typeof val === 'boolean') {
      (resolved as Record<string, unknown>)[field] = val;
    }
  }

  // ── 5. Build activeLayers: merge workspace column + DB layer grants ────────
  // DB layer entitlements define what the plan ALLOWS.
  // The workspace.active_layers column records what the workspace HAS ACTIVATED.
  // Union them: the workspace can only have layers it's been granted by its plan.
  // When DB has explicit layer flags, use them to build an authoritative grant set,
  // then intersect with the workspace's activated layers.
  const hasDbLayers = Object.keys(LAYER_CODE_MAP).some(code => code in rawResolved);

  let activeLayers: PlatformLayer[];

  if (hasDbLayers) {
    // DB knows which layers this plan grants — build the grant set from DB
    const dbGrantedLayers: PlatformLayer[] = [];
    for (const [code, layer] of Object.entries(LAYER_CODE_MAP)) {
      const val = rawResolved[code];
      // A layer is granted when DB says true (boolean) or '1' or 1
      if (val === true || val === 1) {
        dbGrantedLayers.push(layer);
      }
    }

    // Active layers = intersection of (what workspace has activated) ∩ (what DB grants)
    // PLUS: if workspace column is empty (not yet set), use DB grants directly
    activeLayers = staticLayers.length > 0
      ? staticLayers.filter(l => dbGrantedLayers.includes(l))
      : dbGrantedLayers;

    // Also set layers in resolved config (for evaluateLayerAccess which reads config.layers)
    resolved.layers = dbGrantedLayers;
  } else {
    // No DB layer data — use workspace column as-is (full PLAN_CONFIGS fallback path)
    activeLayers = staticLayers;
  }

  // ── 6. Assemble EntitlementContext ────────────────────────────────────────
  const entitlementCtx: EntitlementContext = {
    userId: '' as EntitlementContext['userId'],  // populated by auth middleware upstream — not needed for entitlement checks
    workspaceId: ws.id as EntitlementContext['workspaceId'],
    tenantId: tenantId as EntitlementContext['tenantId'],
    role: 'member' as EntitlementContext['role'], // role comes from auth, not needed here
    subscriptionPlan: ws.subscription_plan as SubscriptionPlan,
    subscriptionStatus: (ws.subscription_status ?? 'inactive') as typeof SubscriptionStatus[keyof typeof SubscriptionStatus],
    activeLayers: activeLayers as readonly PlatformLayer[],
  };

  return { workspaceId: ws.id, entitlementCtx, resolvedEntitlements: resolved };
}
