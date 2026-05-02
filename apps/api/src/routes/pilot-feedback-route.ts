/**
 * Workspace-facing pilot feedback endpoint — Wave 4 / Milestone 11
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ROUTES (auth required; any authenticated workspace user)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   POST /workspace/feedback
 *     — Submit NPS score, bug report, feature request, or general feedback.
 *       Body: { feedback_type, nps_score?, message?, context_route? }
 *
 * Trigger conditions for the in-app feedback widget:
 *   1. After first_txn_at is set on the pilot operator record.
 *   2. Every 30 days for operators with status = 'active'.
 *
 * The route is safe to call for non-pilot tenants — it will still record
 * the feedback against the tenant/workspace/user triplet.
 *
 * T3 (tenant isolation): tenant_id and workspace_id are read from the JWT
 * auth context, never from the request body.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import { PilotFeedbackService, PilotOperatorService, PilotFlagService } from '@webwaka/pilot';
import type { PilotFeedbackType } from '@webwaka/pilot';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

const VALID_TYPES: PilotFeedbackType[] = ['nps', 'bug', 'feature_request', 'general'];

export function pilotFeedbackRoute() {
  const app = new Hono<AppEnv>();

  app.post('/', async (c) => {
    const auth = c.get('auth');
    const body = await c.req.json<{
      feedback_type: PilotFeedbackType;
      nps_score?: number;
      message?: string;
      context_route?: string;
    }>();

    // Validate feedback_type
    if (!body.feedback_type || !VALID_TYPES.includes(body.feedback_type)) {
      return c.json({
        error: `feedback_type must be one of: ${VALID_TYPES.join(', ')}`,
        code: 'INVALID_INPUT',
      }, 422);
    }

    // Validate NPS score range
    if (
      body.feedback_type === 'nps' &&
      body.nps_score !== undefined &&
      (body.nps_score < 0 || body.nps_score > 10 || !Number.isInteger(body.nps_score))
    ) {
      return c.json({
        error: 'nps_score must be an integer between 0 and 10',
        code: 'INVALID_INPUT',
      }, 422);
    }

    const feedbackSvc = new PilotFeedbackService(c.env.DB);

    const feedback = await feedbackSvc.submit({
      tenant_id:    auth.tenantId,
      workspace_id: auth.workspaceId ?? auth.tenantId,
      user_id:      auth.userId,
      feedback_type: body.feedback_type,
      nps_score:    body.nps_score,
      message:      body.message,
      context_route: body.context_route,
    });

    // Side-effect: if this is the first NPS response from an active pilot
    // operator, mark their first_txn_at if it hasn't been set yet.
    // (Non-blocking — failure doesn't fail the request.)
    if (body.feedback_type === 'nps') {
      try {
        const operatorSvc = new PilotOperatorService(c.env.DB);
        await operatorSvc.markFirstTransaction(auth.tenantId);
      } catch {
        // best-effort; swallow silently
      }
    }

    return c.json({ ok: true, feedback_id: feedback.id }, 201);
  });

  // ─── GET /workspace/pilot-flags/:flagName ─────────────────────────────────
  // FE-PILOT-01: Frontend flag check — returns { enabled: boolean }
  // Reads feature flag from KV (feature_flag:<tenantId>:<flagName>).
  // Falls back to pilot_feature_flags table if KV miss.
  app.get('/flags/:flagName', async (c) => {
    const auth = c.get('auth');
    const flagName = c.req.param('flagName');

    if (!flagName || !/^[a-z0-9_]{1,64}$/.test(flagName)) {
      return c.json({ enabled: false });
    }

    try {
      // 1. Try KV first (fast path)
      const kvKey = `feature_flag:${auth.tenantId}:${flagName}`;
      const kvVal = await (c.env as Record<string, unknown> & { FEATURE_FLAGS?: KVNamespace }).FEATURE_FLAGS?.get(kvKey);
      if (kvVal !== null && kvVal !== undefined) {
        return c.json({ enabled: kvVal === '1' });
      }

      // 2. Fall back to D1 pilot_feature_flags table
      const flagSvc = new PilotFlagService(c.env.DB);
      const flag = await flagSvc.getFlag(auth.tenantId, flagName).catch(() => null);
      return c.json({ enabled: flag?.enabled === true });
    } catch {
      return c.json({ enabled: false });
    }
  });

  return app;
}
