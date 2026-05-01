/**
 * Claim routes — convert discovery intent → verified tenant operations.
 *
 * POST /claim/intent    — convert discovery intent → claim_request (auth required)
 * POST /claim/advance   — advance claim_state (admin only)
 * POST /claim/verify    — submit verification evidence (tenant admin)
 * GET  /claim/status/:profileId — public claim status
 *
 * Platform Invariants:
 *   T3 — tenant_id on all scoped queries
 *   T5 — role guards on admin-only routes
 *   Auth required except /claim/status/:profileId (public)
 *
 * Milestone 5 — Claim-First Onboarding
 */

import { Hono } from 'hono';
import { ClaimLifecycleState, asId } from '@webwaka/types';
import type { ProfileId } from '@webwaka/types';
import { advanceClaimState as profileAdvanceClaimState } from '@webwaka/entities';
import {
  validateTransition,
  InvalidClaimTransitionError,
  emailVerificationToken,
  documentVerificationChecklist,
} from '@webwaka/claims';
import type { Env } from '../env.js';
import { publishEvent } from '../lib/publish-event.js';
import { ClaimEventType } from '@webwaka/events';

const claimRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Shared D1Like type
// ---------------------------------------------------------------------------

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean }>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}


function generateClaimId(): string {
  return `clm_${crypto.randomUUID().replace(/-/g, '')}`;
}

// ---------------------------------------------------------------------------
// BUG-P3-008 fix: timing-safe string comparison using HMAC.
// crypto.subtle.timingSafeEqual is not part of the Web Crypto API.
// Instead we HMAC both strings with the same ephemeral key — HMAC output is
// constant-length so a bitwise XOR comparison leaks no timing information
// about the input strings' content or common prefix.
// ---------------------------------------------------------------------------
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  // generateKey with symmetric HMAC always returns CryptoKey, not CryptoKeyPair.
  // The Web Crypto type union includes CryptoKeyPair for asymmetric algorithms;
  // the cast is safe and confirmed by the HMAC algorithm spec.
  const key = await crypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  ) as CryptoKey;
  const [aSig, bSig] = await Promise.all([
    crypto.subtle.sign('HMAC', key, enc.encode(a)),
    crypto.subtle.sign('HMAC', key, enc.encode(b)),
  ]);
  const aArr = new Uint8Array(aSig);
  const bArr = new Uint8Array(bSig);
  if (aArr.length !== bArr.length) return false;
  let diff = 0;
  for (let i = 0; i < aArr.length; i++) diff |= (aArr[i] ?? 0) ^ (bArr[i] ?? 0);
  return diff === 0;
}

// ---------------------------------------------------------------------------
// POST /claim/intent — Auth required
// Converts a discovery claim-intent record into a formal claim_request row.
// ---------------------------------------------------------------------------

claimRoutes.post('/intent', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;

  let body: { profileId?: string; requesterName?: string; verificationMethod?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { profileId, requesterName, verificationMethod = 'email' } = body;

  if (!profileId || typeof profileId !== 'string') {
    return c.json({ error: 'profileId is required' }, 400);
  }
  if (!['email', 'phone', 'document'].includes(verificationMethod)) {
    return c.json({ error: 'verificationMethod must be email|phone|document' }, 400);
  }

  // Look up the profile
  const profile = await db
    .prepare('SELECT id, claim_state FROM profiles WHERE id = ?')
    .bind(profileId)
    .first<{ id: string; claim_state: string }>();

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  // Only allow claiming profiles in seeded or claimable state
  const claimableStates: string[] = [ClaimLifecycleState.Seeded, ClaimLifecycleState.Claimable];
  if (!claimableStates.includes(profile.claim_state)) {
    return c.json({ error: `Profile is not claimable (current state: ${profile.claim_state})` }, 409);
  }

  // SEC-003: Check for existing pending claim request scoped to tenant
  const existing = await db
    .prepare(
      `SELECT id FROM claim_requests WHERE profile_id = ? AND status = 'pending' AND (tenant_id = ? OR tenant_id IS NULL)`,
    )
    .bind(profileId, auth.tenantId)
    .first<{ id: string }>();

  if (existing) {
    return c.json({ error: 'A pending claim request already exists for this profile', claimRequestId: existing.id }, 409);
  }

  const claimId = generateClaimId();
  const expiresAt = Math.floor(Date.now() / 1000) + 30 * 24 * 3600; // 30 days

  // Generate verification token if email method
  let verificationData: string | null = null;
  if (verificationMethod === 'email') {
    const tokenData = emailVerificationToken(auth.userId);
    verificationData = JSON.stringify(tokenData);
  }

  // SEC-003: Include tenant_id on claim_requests INSERT (migration 0192)
  // M0380: Include workspace_id to link profile→workspace on approval
  await db
    .prepare(
      `INSERT INTO claim_requests
         (id, profile_id, requester_email, requester_name, status, verification_method, verification_data, expires_at, tenant_id, workspace_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(claimId, profileId, auth.userId, requesterName ?? null, verificationMethod, verificationData, expiresAt, auth.tenantId, auth.workspaceId ?? null)
    .run();

  // Advance profile state to claimable if still seeded
  if (profile.claim_state === ClaimLifecycleState.Seeded) {
    try {
      await profileAdvanceClaimState(db as Parameters<typeof profileAdvanceClaimState>[0], asId<ProfileId>(profileId), ClaimLifecycleState.Claimable);
    } catch {
      // Non-fatal — claim request is already recorded
    }
  }

  // N-084: claim.submitted event
  void publishEvent(c.env, {
    eventId: claimId,
    eventKey: ClaimEventType.ClaimSubmitted,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    payload: { claim_id: claimId, profile_id: profileId, verification_method: verificationMethod },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({ claimRequestId: claimId, status: 'pending', expiresAt }, 201);
});

// ---------------------------------------------------------------------------
// POST /claim/advance — Admin only
// Advance the claim_state for a profile (approve/reject).
// ---------------------------------------------------------------------------

claimRoutes.post('/advance', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;

  let body: { claimRequestId?: string; action?: string; rejectionReason?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { claimRequestId, action, rejectionReason } = body;

  if (!claimRequestId || !action) {
    return c.json({ error: 'claimRequestId and action are required' }, 400);
  }
  if (!['approve', 'reject'].includes(action)) {
    return c.json({ error: 'action must be approve|reject' }, 400);
  }

  // SEC-003: added tenant_id predicate to claim_requests query
  // M0380: select workspace_id to link profile on approval
  const claimRow = await db
    .prepare(
      `SELECT cr.id, cr.profile_id, cr.status, cr.workspace_id, p.claim_state
       FROM claim_requests cr
       JOIN profiles p ON p.id = cr.profile_id
       WHERE cr.id = ? AND (cr.tenant_id = ? OR cr.tenant_id IS NULL)`,
    )
    .bind(claimRequestId, auth.tenantId)
    .first<{ id: string; profile_id: string; status: string; workspace_id: string | null; claim_state: string }>();

  if (!claimRow) {
    return c.json({ error: 'Claim request not found' }, 404);
  }
  if (claimRow.status !== 'pending') {
    return c.json({ error: `Claim request is already ${claimRow.status}` }, 409);
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  const newProfileState = action === 'approve' ? ClaimLifecycleState.Verified : ClaimLifecycleState.Claimable;

  // Validate the state transition
  const currentProfileState = claimRow.claim_state;
  const pendingState = ClaimLifecycleState.ClaimPending;

  // Ensure profile is in claim_pending before approving
  if (action === 'approve' && currentProfileState !== pendingState) {
    // Advance to claim_pending first if in claimable
    if (currentProfileState === ClaimLifecycleState.Claimable) {
      try {
        await profileAdvanceClaimState(db as Parameters<typeof profileAdvanceClaimState>[0], asId<ProfileId>(claimRow.profile_id), ClaimLifecycleState.ClaimPending);
      } catch (err) {
        console.error('[claim] profileAdvanceClaimState to ClaimPending failed (non-blocking):', err instanceof Error ? err.message : err);
      }
    } else if (!validateTransition(currentProfileState, newProfileState)) {
      return c.json({ error: `Cannot transition profile from '${currentProfileState}' to '${newProfileState}'` }, 409);
    }
  }

  // Update claim_request status — SEC-003: added tenant_id predicate
  await db
    .prepare(
      `UPDATE claim_requests
       SET status = ?, approved_by = ?, rejection_reason = ?, updated_at = unixepoch()
       WHERE id = ? AND (tenant_id = ? OR tenant_id IS NULL)`,
    )
    .bind(newStatus, action === 'approve' ? auth.userId : null, rejectionReason ?? null, claimRequestId, auth.tenantId)
    .run();

  // Advance profile state
  try {
    await profileAdvanceClaimState(db as Parameters<typeof profileAdvanceClaimState>[0], asId<ProfileId>(claimRow.profile_id), newProfileState);
  } catch (err) {
    if (err instanceof InvalidClaimTransitionError) {
      // Profile may already be in target state — not fatal for claim_request update
    } else {
      throw err;
    }
  }

  // M0380: When approving, link profile to the workspace that submitted the claim.
  // This sets profiles.workspace_id so the workspace owner can later advance to 'managed'
  // via PATCH /profiles/:id/claim-state after upgrading to a paid plan.
  if (action === 'approve' && claimRow.workspace_id) {
    try {
      await db
        .prepare(
          `UPDATE profiles SET workspace_id = ?, updated_at = unixepoch()
           WHERE id = ? AND (workspace_id IS NULL OR workspace_id LIKE '%seed%')`,
        )
        .bind(claimRow.workspace_id, claimRow.profile_id)
        .run();
    } catch (err) {
      // Non-fatal: workspace link is best-effort; profile state is already advanced.
      console.error('[claim] workspace link on approval failed (non-blocking):', err instanceof Error ? err.message : err);
    }
  }

  // N-084: claim.approved or claim.rejected event
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: action === 'approve' ? ClaimEventType.ClaimApproved : ClaimEventType.ClaimRejected,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    payload: { claim_id: claimRequestId, profile_id: claimRow.profile_id, action, ...(rejectionReason ? { reason: rejectionReason } : {}) },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({ claimRequestId, status: newStatus, profileState: newProfileState });
});

// ---------------------------------------------------------------------------
// POST /claim/verify — Tenant admin submits verification evidence
// ---------------------------------------------------------------------------

claimRoutes.post('/verify', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;

  let body: { claimRequestId?: string; token?: string; method?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { claimRequestId, token, method } = body;

  if (!claimRequestId || !token) {
    return c.json({ error: 'claimRequestId and token are required' }, 400);
  }

  // SEC-003: added tenant_id predicate to claim_requests SELECT
  const claimRow = await db
    .prepare(
      `SELECT id, profile_id, status, verification_method, verification_data, expires_at
       FROM claim_requests WHERE id = ? AND (tenant_id = ? OR tenant_id IS NULL)`,
    )
    .bind(claimRequestId, auth.tenantId)
    .first<{
      id: string;
      profile_id: string;
      status: string;
      verification_method: string;
      verification_data: string | null;
      expires_at: number;
    }>();

  if (!claimRow) {
    return c.json({ error: 'Claim request not found' }, 404);
  }
  if (claimRow.status !== 'pending') {
    return c.json({ error: `Claim request is already ${claimRow.status}` }, 409);
  }

  const now = Math.floor(Date.now() / 1000);
  if (claimRow.expires_at && now > claimRow.expires_at) {
    // Auto-expire — SEC-003: added tenant_id predicate
    await db
      .prepare(`UPDATE claim_requests SET status = 'expired', updated_at = unixepoch() WHERE id = ? AND (tenant_id = ? OR tenant_id IS NULL)`)
      .bind(claimRequestId, auth.tenantId)
      .run();
    return c.json({ error: 'Claim request has expired' }, 410);
  }

  // Validate token
  let tokenValid = false;
  if (claimRow.verification_data) {
    try {
      const stored = JSON.parse(claimRow.verification_data) as { token?: string; otp?: string; expiresAt?: number };
      // BUG-P3-008 fix: use HMAC-based timing-safe comparison (see timingSafeEqual above).
      // Plain === comparison leaks timing information enabling token enumeration attacks.
      const storedToken = stored.token ?? stored.otp;
      if (storedToken !== undefined) {
        tokenValid = await timingSafeEqual(storedToken, token) && (!stored.expiresAt || now < stored.expiresAt);
      }
    } catch {
      tokenValid = false;
    }
  }

  if (!tokenValid) {
    return c.json({ error: 'Invalid or expired verification token' }, 422);
  }

  // Mark claim as pending review by advancing profile to claim_pending
  const profileRow = await db
    .prepare('SELECT claim_state FROM profiles WHERE id = ?')
    .bind(claimRow.profile_id)
    .first<{ claim_state: string }>();

  if (profileRow && profileRow.claim_state === ClaimLifecycleState.Claimable) {
    try {
      await profileAdvanceClaimState(db as Parameters<typeof profileAdvanceClaimState>[0], asId<ProfileId>(claimRow.profile_id), ClaimLifecycleState.ClaimPending);
    } catch (err) {
      console.error('[claim] profileAdvanceClaimState to ClaimPending failed (non-blocking):', err instanceof Error ? err.message : err);
    }
  }

  // Update verification data with verification timestamp
  const updatedData = JSON.stringify({
    ...(claimRow.verification_data ? JSON.parse(claimRow.verification_data) as object : {}),
    verifiedAt: new Date().toISOString(),
    method: method ?? claimRow.verification_method,
  });

  // SEC-003: added tenant_id predicate
  await db
    .prepare(`UPDATE claim_requests SET verification_data = ?, updated_at = unixepoch() WHERE id = ? AND (tenant_id = ? OR tenant_id IS NULL)`)
    .bind(updatedData, claimRequestId, auth.tenantId)
    .run();

  // N-084: claim.advanced event (evidence submitted → pending admin review)
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: ClaimEventType.ClaimAdvanced,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    payload: { claim_id: claimRequestId, profile_id: claimRow.profile_id, method: method ?? claimRow.verification_method },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({ claimRequestId, status: 'pending', message: 'Verification submitted — awaiting admin approval' });
});

// ---------------------------------------------------------------------------
// GET /claim/status/:profileId — Public
// Returns the current claim status for a profile without exposing tenant_id.
// ---------------------------------------------------------------------------

claimRoutes.get('/status/:profileId', async (c) => {
  const profileId = c.req.param('profileId');
  const db = c.env.DB as unknown as D1Like;

  const profile = await db
    .prepare('SELECT id, claim_state FROM profiles WHERE id = ?')
    .bind(profileId)
    .first<{ id: string; claim_state: string }>();

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  // SEC-003: If caller is authenticated, scope pending-claim lookup to their tenant.
  // If unauthenticated (public), only expose whether a pending claim exists (boolean),
  // without revealing claim details that could leak cross-tenant metadata.
  const auth = c.get('auth') as import('@webwaka/types').AuthContext | undefined;

  let pendingRequest: { id: string; status: string; verificationMethod: string; expiresAt: number } | null = null;

  if (auth?.tenantId) {
    const pendingClaim = await db
      .prepare(
        `SELECT id, status, verification_method, expires_at
         FROM claim_requests WHERE profile_id = ? AND status = 'pending' AND (tenant_id = ? OR tenant_id IS NULL)
         ORDER BY created_at DESC LIMIT 1`,
      )
      .bind(profileId, auth.tenantId)
      .first<{ id: string; status: string; verification_method: string; expires_at: number }>();

    if (pendingClaim) {
      pendingRequest = {
        id: pendingClaim.id,
        status: pendingClaim.status,
        verificationMethod: pendingClaim.verification_method,
        expiresAt: pendingClaim.expires_at,
      };
    }
  }

  return c.json({
    profileId: profile.id,
    claimState: profile.claim_state,
    pendingRequest,
    checklist: documentVerificationChecklist(),
  });
});

// ---------------------------------------------------------------------------
// POST /claim/escalate — Escalate a pending claim request (admin only)
// N-085/T5: claim.escalated event
// ---------------------------------------------------------------------------

claimRoutes.post('/escalate', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;

  let body: { claimRequestId?: string; reason?: string; escalateTo?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { claimRequestId, reason, escalateTo } = body;
  if (!claimRequestId) {
    return c.json({ error: 'claimRequestId is required' }, 400);
  }

  const claimRow = await db
    .prepare(
      `SELECT id, status, profile_id FROM claim_requests
       WHERE id = ? AND (tenant_id = ? OR tenant_id IS NULL)`,
    )
    .bind(claimRequestId, auth.tenantId)
    .first<{ id: string; status: string; profile_id: string }>();

  if (!claimRow) {
    return c.json({ error: 'Claim request not found' }, 404);
  }
  if (!['pending', 'under_review'].includes(claimRow.status)) {
    return c.json({ error: `Cannot escalate a claim in '${claimRow.status}' status` }, 409);
  }

  await db
    .prepare(
      `UPDATE claim_requests
       SET status = 'escalated', updated_at = unixepoch()
       WHERE id = ? AND (tenant_id = ? OR tenant_id IS NULL)`,
    )
    .bind(claimRequestId, auth.tenantId)
    .run();

  // N-085/T5: claim.escalated event
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: ClaimEventType.ClaimEscalated,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    payload: {
      claim_request_id: claimRequestId,
      profile_id: claimRow.profile_id,
      reason: reason ?? null,
      escalate_to: escalateTo ?? null,
    },
    source: 'api',
    severity: 'warning',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({ claimRequestId, status: 'escalated', escalated: true });
});

export { claimRoutes };
