/**
 * Workspace Verticals routes — M8a / M8b
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WORKSPACE OWNER ROUTES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   POST /workspaces/:id/verticals/:slug/activate
 *     — Activate a vertical for a workspace.
 *       If ALL requirements are already met (KYC tier + every required
 *       verification flag), the vertical advances directly to 'active'.
 *       If any required verifications are missing, returns 422 with the
 *       precise list so the workspace owner knows what to complete.
 *
 *   GET  /workspaces/:id/verticals
 *     — List all verticals for this workspace (any state).
 *
 *   GET  /workspaces/:id/verticals/:slug
 *     — Detailed state, requirements, and next steps for one vertical.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTO-ACTIVATION LOGIC  (M8b)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   The BASE_VERTICAL_FSM defines two key states:
 *     claimed  — workspace has registered interest; some verifications pending.
 *     active   — ALL requirements confirmed; entity is publicly live.
 *
 *   When POST .../activate is called and `checkActivationRequirements` returns
 *   an empty unmet list (all flags already verified on the workspace), the
 *   vertical is immediately set to 'active' — no separate platform-admin step
 *   is required. The 'claimed' intermediate state remains available for cases
 *   where the platform team first sets kyc/verification flags externally before
 *   the workspace owner attempts activation, or for future M8c document-upload
 *   flows.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Platform Invariants:
 *   T3 — tenant_id scoping on all D1 queries
 *   T5 — entitlement checks gate vertical activation
 *   P2 — FSM engine from @webwaka/verticals
 *
 * Milestone: M8a (infrastructure), M8b (auto-activation + detail endpoint)
 */

import { Hono } from 'hono';
import {
  getVerticalBySlug,
  extractEntitlements,
  checkActivationRequirements,
  BASE_VERTICAL_FSM,
} from '@webwaka/verticals';
import type { VerticalActivationContext } from '@webwaka/verticals';
import type { Env } from '../env.js';

// ---------------------------------------------------------------------------
// D1Like
// ---------------------------------------------------------------------------

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean; changes?: number }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WorkspaceRow {
  id: string;
  owner_id: string;
  kyc_tier: number;
  frsc_verified: 0 | 1;
  cac_verified: 0 | 1;
  it_verified: 0 | 1;
}

interface WorkspaceVerticalRow {
  id: string;
  workspace_id: string;
  tenant_id: string;
  vertical_slug: string;
  state: string;
  activated_at: number | null;
  suspended_at: number | null;
  created_at: number;
  updated_at: number;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const workspaceVerticalsRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// POST /workspaces/:id/verticals/:slug/activate
//
// Two possible outcomes on success:
//   state=active  — all requirements met; vertical goes live immediately
//   (No more state=claimed on success — if any requirement is unmet, 422)
// ---------------------------------------------------------------------------

workspaceVerticalsRoutes.post('/:id/verticals/:slug/activate', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const workspaceId = c.req.param('id');
  const slug = c.req.param('slug');
  const db = c.env.DB as unknown as D1Like;

  // 1. Verify the workspace belongs to this tenant (T3)
  const workspace = await db
    .prepare(
      `SELECT id, owner_id, kyc_tier, frsc_verified, cac_verified, it_verified
         FROM workspaces
        WHERE id = ? AND tenant_id = ?`,
    )
    .bind(workspaceId, auth.tenantId)
    .first<WorkspaceRow>();

  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  if (workspace.owner_id !== auth.userId) {
    return c.json({ error: 'Only the workspace owner can activate verticals' }, 403);
  }

  // 2. Verify vertical exists in the registry
  const verticalResult = await getVerticalBySlug(db, slug);
  if (!verticalResult.found) {
    return c.json({ error: `Vertical '${slug}' not found` }, 404);
  }
  const vertical = verticalResult.vertical!;

  // 3. Build activation context from workspace verification flags
  const entitlements = extractEntitlements(vertical);
  const activationCtx: VerticalActivationContext = {
    workspaceId,
    tenantId: auth.tenantId,
    userId: auth.userId,
    kycTier: (Math.min(3, workspace.kyc_tier ?? 0)) as 0 | 1 | 2 | 3,
    frscVerified: workspace.frsc_verified === 1,
    cacVerified: workspace.cac_verified === 1,
    itVerified: workspace.it_verified === 1,
  };

  // 4. Check ALL entitlement requirements — if any fail, return structured 422
  const unmet = checkActivationRequirements(entitlements, activationCtx);
  if (unmet.length > 0) {
    return c.json(
      {
        error:                 'ENTITLEMENT_REQUIREMENTS_UNMET',
        vertical:              slug,
        vertical_display_name: vertical.display_name,
        unmet_requirements:    unmet,
        hint:                  'Complete the listed requirements, then re-attempt activation.',
        requirements: {
          required_kyc_tier: entitlements.required_kyc_tier,
          requires_frsc:     entitlements.requires_frsc,
          requires_cac:      entitlements.requires_cac,
          requires_it:       entitlements.requires_it,
        },
        workspace_current: {
          kyc_tier:      workspace.kyc_tier,
          frsc_verified: workspace.frsc_verified === 1,
          cac_verified:  workspace.cac_verified === 1,
          it_verified:   workspace.it_verified === 1,
        },
      },
      422,
    );
  }

  // 5. Check if already activated (any state)
  const existing = await db
    .prepare(
      `SELECT id, state FROM workspace_verticals
        WHERE workspace_id = ? AND tenant_id = ? AND vertical_slug = ?`,
    )
    .bind(workspaceId, auth.tenantId, slug)
    .first<{ id: string; state: string }>();

  if (existing) {
    return c.json(
      {
        error:         'VERTICAL_ALREADY_ACTIVATED',
        vertical:      slug,
        current_state: existing.state,
        hint:
          existing.state === 'suspended'
            ? 'Contact the platform team to reinstate this vertical.'
            : existing.state === 'deprecated'
              ? 'This vertical has been permanently removed. Contact support.'
              : `Vertical is already in '${existing.state}' state.`,
      },
      409,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. AUTO-ACTIVATION (M8b)
  //
  // checkActivationRequirements passed (empty unmet list), meaning every
  // required verification flag on this workspace is already confirmed.
  // Advance directly to 'active' state — no separate admin step needed.
  //
  // The 'claimed' intermediate state is reserved for:
  //   a) Future M8c document-upload flows where files need admin review
  //   b) Platform-admin-initiated entries where they set state manually
  // ─────────────────────────────────────────────────────────────────────────

  const id  = crypto.randomUUID().replace(/-/g, '');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO workspace_verticals
         (id, workspace_id, tenant_id, vertical_slug, state, activated_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`,
    )
    .bind(id, workspaceId, auth.tenantId, slug, now, now, now)
    .run();

  return c.json(
    {
      id,
      workspace_id:   workspaceId,
      vertical:       slug,
      display_name:   vertical.display_name,
      category:       vertical.category,
      entity_type:    vertical.entity_type,
      state:          'active',
      activated_at:   now,
      auto_activated: true,
      message:        `Vertical '${vertical.display_name}' is now active for your workspace.`,
    },
    201,
  );
});

// ---------------------------------------------------------------------------
// GET /workspaces/:id/verticals
//
// List all verticals for this workspace (any state).
// For 'claimed' rows, includes `unmet_for_active` so the workspace owner
// knows precisely what is needed to advance to full activation.
// ---------------------------------------------------------------------------

workspaceVerticalsRoutes.get('/:id/verticals', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const workspaceId = c.req.param('id');
  const db = c.env.DB as unknown as D1Like;

  const workspace = await db
    .prepare(
      `SELECT id, kyc_tier, frsc_verified, cac_verified, it_verified
         FROM workspaces WHERE id = ? AND tenant_id = ?`,
    )
    .bind(workspaceId, auth.tenantId)
    .first<Omit<WorkspaceRow, 'owner_id'>>();

  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  const { results } = await db
    .prepare(
      `SELECT wv.id, wv.vertical_slug, wv.state, wv.activated_at, wv.suspended_at,
              wv.created_at, wv.updated_at,
              v.display_name, v.category, v.priority,
              v.required_kyc_tier, v.requires_frsc, v.requires_cac, v.requires_it
         FROM workspace_verticals wv
         JOIN verticals v ON v.slug = wv.vertical_slug
        WHERE wv.workspace_id = ? AND wv.tenant_id = ?
        ORDER BY wv.state ASC, wv.created_at DESC`,
    )
    .bind(workspaceId, auth.tenantId)
    .all<
      WorkspaceVerticalRow & {
        display_name: string;
        category: string;
        priority: number;
        required_kyc_tier: number;
        requires_frsc: 0 | 1;
        requires_cac: 0 | 1;
        requires_it: 0 | 1;
      }
    >();

  const ctxBase = {
    workspaceId,
    tenantId: auth.tenantId,
    userId: '',
    kycTier: (Math.min(3, workspace.kyc_tier ?? 0)) as 0 | 1 | 2 | 3,
    frscVerified: workspace.frsc_verified === 1,
    cacVerified: workspace.cac_verified === 1,
    itVerified: workspace.it_verified === 1,
  };

  const verticals = results.map((row) => {
    const out: Record<string, unknown> = {
      id:           row.id,
      slug:         row.vertical_slug,
      display_name: row.display_name,
      category:     row.category,
      priority:     row.priority,
      state:        row.state,
      activated_at: row.activated_at,
      suspended_at: row.suspended_at,
      created_at:   row.created_at,
    };

    // For 'claimed' verticals, surface what is still needed for full activation
    if (row.state === 'claimed') {
      const ents = {
        slug:               row.vertical_slug,
        required_kyc_tier:  row.required_kyc_tier as 0 | 1 | 2 | 3,
        requires_frsc:      row.requires_frsc === 1,
        requires_cac:       row.requires_cac === 1,
        requires_it:        row.requires_it === 1,
        requires_community: false,
        requires_social:    false,
      };
      out['unmet_for_active'] = checkActivationRequirements(ents, ctxBase);
      out['next_step'] = 'Platform team is reviewing your verification documents.';
    }

    return out;
  });

  const byState = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.state] = (acc[r.state] ?? 0) + 1;
    return acc;
  }, {});

  return c.json({
    verticals,
    count:   results.length,
    summary: byState,
  });
});

// ---------------------------------------------------------------------------
// GET /workspaces/:id/verticals/:slug
//
// Full detail: current state, requirements met/unmet, FSM transitions.
// ---------------------------------------------------------------------------

workspaceVerticalsRoutes.get('/:id/verticals/:slug', async (c) => {
  const auth = c.get('auth') as { tenantId: string; userId: string };
  const workspaceId = c.req.param('id');
  const slug = c.req.param('slug');
  const db = c.env.DB as unknown as D1Like;

  const workspace = await db
    .prepare(
      `SELECT id, owner_id, kyc_tier, frsc_verified, cac_verified, it_verified
         FROM workspaces WHERE id = ? AND tenant_id = ?`,
    )
    .bind(workspaceId, auth.tenantId)
    .first<WorkspaceRow>();

  if (!workspace) return c.json({ error: 'Workspace not found' }, 404);

  const verticalResult = await getVerticalBySlug(db, slug);
  if (!verticalResult.found) return c.json({ error: `Vertical '${slug}' not found` }, 404);
  const vertical = verticalResult.vertical!;

  const row = await db
    .prepare(
      `SELECT * FROM workspace_verticals
        WHERE workspace_id = ? AND tenant_id = ? AND vertical_slug = ?`,
    )
    .bind(workspaceId, auth.tenantId, slug)
    .first<WorkspaceVerticalRow>();

  const entitlements = extractEntitlements(vertical);
  const activationCtx: VerticalActivationContext = {
    workspaceId,
    tenantId: auth.tenantId,
    userId: auth.userId,
    kycTier: (Math.min(3, workspace.kyc_tier ?? 0)) as 0 | 1 | 2 | 3,
    frscVerified: workspace.frsc_verified === 1,
    cacVerified: workspace.cac_verified === 1,
    itVerified: workspace.it_verified === 1,
  };

  const unmet = checkActivationRequirements(entitlements, activationCtx);

  const availableTransitions = row
    ? BASE_VERTICAL_FSM.transitions
        .filter((t) => t.from === row.state)
        .map((t) => ({ to: t.to, description: t.description, guard: t.guard }))
    : [];

  return c.json({
    vertical: {
      slug:         vertical.slug,
      display_name: vertical.display_name,
      category:     vertical.category,
      priority:     vertical.priority,
      entity_type:  vertical.entity_type,
    },
    workspace_vertical:     row ?? null,
    current_state:          row?.state ?? 'not_activated',
    is_active:              row?.state === 'active',
    can_activate:           !row && unmet.length === 0,
    unmet_requirements:     unmet,
    entitlements: {
      required_kyc_tier: entitlements.required_kyc_tier,
      requires_frsc:     entitlements.requires_frsc,
      requires_cac:      entitlements.requires_cac,
      requires_it:       entitlements.requires_it,
    },
    workspace_verification: {
      kyc_tier:      workspace.kyc_tier,
      frsc_verified: workspace.frsc_verified === 1,
      cac_verified:  workspace.cac_verified === 1,
      it_verified:   workspace.it_verified === 1,
    },
    available_transitions: availableTransitions,
  });
});
