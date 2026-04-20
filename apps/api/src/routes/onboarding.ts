/**
 * Tenant Onboarding Checklist API — Sprint 7 / PROD-01
 *
 * Routes:
 *   GET  /onboarding/:workspaceId        — get onboarding checklist status
 *   PUT  /onboarding/:workspaceId/:step  — mark step complete
 *   GET  /onboarding/:workspaceId/summary — summary with completion %
 *
 * Platform Invariants:
 *   T3 — tenant_id on all queries
 *   All routes require auth
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { publishEvent } from '../lib/publish-event.js';
import { OnboardingEventType } from '@webwaka/events';

type Auth = { userId: string; tenantId: string; role?: string };

const ONBOARDING_STEPS = [
  'profile_setup',
  'vertical_activation',
  'template_installed',
  'payment_configured',
  'team_invited',
  'branding_configured',
] as const;

type OnboardingStep = typeof ONBOARDING_STEPS[number];

const STEP_DESCRIPTIONS: Record<OnboardingStep, { title: string; description: string; order: number }> = {
  profile_setup: {
    title: 'Set Up Your Profile',
    description: 'Complete your business profile with name, contact information, and location.',
    order: 1,
  },
  vertical_activation: {
    title: 'Activate Your Industry',
    description: 'Choose and activate the industry vertical that matches your business.',
    order: 2,
  },
  template_installed: {
    title: 'Install a Template',
    description: 'Browse the marketplace and install a template to get started quickly.',
    order: 3,
  },
  payment_configured: {
    title: 'Set Up Payments',
    description: 'Configure your subscription plan and payment method.',
    order: 4,
  },
  team_invited: {
    title: 'Invite Your Team',
    description: 'Add team members to your workspace to start collaborating.',
    order: 5,
  },
  branding_configured: {
    title: 'Customise Your Brand',
    description: 'Upload your logo and set your brand colours for a professional look.',
    order: 6,
  },
};

function generateId(): string {
  return `obp_${crypto.randomUUID().replace(/-/g, '')}`;
}

const onboardingRoutes = new Hono<{ Bindings: Env }>();

onboardingRoutes.get('/:workspaceId', async (c) => {
  const auth = c.get('auth') as Auth;
  const workspaceId = c.req.param('workspaceId');
  const db = c.env.DB;

  const workspace = await db.prepare(
    'SELECT id FROM workspaces WHERE id = ? AND tenant_id = ?'
  ).bind(workspaceId, auth.tenantId).first<{ id: string }>();

  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  const existing = await db.prepare(
    'SELECT step_key, completed, completed_at, completed_by, metadata FROM onboarding_progress WHERE workspace_id = ? AND tenant_id = ?'
  ).bind(workspaceId, auth.tenantId).all<{
    step_key: string;
    completed: number;
    completed_at: number | null;
    completed_by: string | null;
    metadata: string;
  }>();

  const completedMap = new Map<string, { completed: boolean; completed_at: number | null; completed_by: string | null; metadata: Record<string, unknown> }>();
  for (const row of existing.results ?? []) {
    let parsedMetadata: Record<string, unknown> = {};
    try {
      parsedMetadata = JSON.parse(row.metadata ?? '{}');
    } catch {
      parsedMetadata = {};
    }
    completedMap.set(row.step_key, {
      completed: row.completed === 1,
      completed_at: row.completed_at,
      completed_by: row.completed_by,
      metadata: parsedMetadata,
    });
  }

  const steps = ONBOARDING_STEPS.map((key) => {
    const desc = STEP_DESCRIPTIONS[key];
    const progress = completedMap.get(key);
    return {
      key,
      title: desc.title,
      description: desc.description,
      order: desc.order,
      completed: progress?.completed ?? false,
      completed_at: progress?.completed_at ?? null,
      completed_by: progress?.completed_by ?? null,
      metadata: progress?.metadata ?? {},
    };
  });

  const completedCount = steps.filter((s) => s.completed).length;

  return c.json({
    workspaceId,
    tenantId: auth.tenantId,
    steps,
    progress: {
      completed: completedCount,
      total: ONBOARDING_STEPS.length,
      percentage: Math.round((completedCount / ONBOARDING_STEPS.length) * 100),
      isComplete: completedCount === ONBOARDING_STEPS.length,
    },
  });
});

onboardingRoutes.get('/:workspaceId/summary', async (c) => {
  const auth = c.get('auth') as Auth;
  const workspaceId = c.req.param('workspaceId');
  const db = c.env.DB;

  const workspace = await db.prepare(
    'SELECT id FROM workspaces WHERE id = ? AND tenant_id = ?'
  ).bind(workspaceId, auth.tenantId).first<{ id: string }>();

  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  const countResult = await db.prepare(
    'SELECT COUNT(*) AS cnt FROM onboarding_progress WHERE workspace_id = ? AND tenant_id = ? AND completed = 1'
  ).bind(workspaceId, auth.tenantId).first<{ cnt: number }>();

  const completedCount = countResult?.cnt ?? 0;

  return c.json({
    workspaceId,
    completed: completedCount,
    total: ONBOARDING_STEPS.length,
    percentage: Math.round((completedCount / ONBOARDING_STEPS.length) * 100),
    isComplete: completedCount === ONBOARDING_STEPS.length,
  });
});

onboardingRoutes.put('/:workspaceId/:step', async (c) => {
  const auth = c.get('auth') as Auth;
  const workspaceId = c.req.param('workspaceId');
  const step = c.req.param('step') as OnboardingStep;
  const db = c.env.DB;

  if (!ONBOARDING_STEPS.includes(step)) {
    return c.json({
      error: `Invalid step. Must be one of: ${ONBOARDING_STEPS.join(', ')}`,
    }, 400);
  }

  const workspace = await db.prepare(
    'SELECT id FROM workspaces WHERE id = ? AND tenant_id = ?'
  ).bind(workspaceId, auth.tenantId).first<{ id: string }>();

  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  let body: { metadata?: Record<string, unknown> } = {};
  try {
    body = await c.req.json<typeof body>();
  } catch {
    body = {};
  }

  const now = Math.floor(Date.now() / 1000);
  const metadataJson = JSON.stringify(body.metadata ?? {});

  const existing = await db.prepare(
    'SELECT id, completed FROM onboarding_progress WHERE workspace_id = ? AND step_key = ? AND tenant_id = ?'
  ).bind(workspaceId, step, auth.tenantId).first<{ id: string; completed: number }>();

  if (existing && existing.completed === 1) {
    return c.json({
      workspaceId,
      step,
      completed: true,
      alreadyCompleted: true,
      message: 'Step was already completed',
    });
  }

  if (existing) {
    await db.prepare(
      'UPDATE onboarding_progress SET completed = 1, completed_at = ?, completed_by = ?, metadata = ?, updated_at = ? WHERE id = ? AND tenant_id = ?'
    ).bind(now, auth.userId, metadataJson, now, existing.id, auth.tenantId).run();
  } else {
    const id = generateId();
    await db.prepare(
      `INSERT INTO onboarding_progress (id, tenant_id, workspace_id, step_key, completed, completed_at, completed_by, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`
    ).bind(id, auth.tenantId, workspaceId, step, now, auth.userId, metadataJson, now, now).run();
  }

  const countResult = await db.prepare(
    'SELECT COUNT(*) AS cnt FROM onboarding_progress WHERE workspace_id = ? AND tenant_id = ? AND completed = 1'
  ).bind(workspaceId, auth.tenantId).first<{ cnt: number }>();

  const completedCount = countResult?.cnt ?? 0;

  const isComplete = completedCount === ONBOARDING_STEPS.length;

  // N-088: onboarding.started when first step is completed; onboarding.completed when all done
  if (completedCount === 1) {
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: OnboardingEventType.OnboardingStarted,
      tenantId: auth.tenantId,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId,
      payload: { workspace_id: workspaceId, first_step: step },
      source: 'api',
      severity: 'info',
    });
  }
  if (isComplete) {
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: OnboardingEventType.OnboardingCompleted,
      tenantId: auth.tenantId,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId,
      payload: { workspace_id: workspaceId },
      source: 'api',
      severity: 'info',
    });
  }

  return c.json({
    workspaceId,
    step,
    completed: true,
    progress: {
      completed: completedCount,
      total: ONBOARDING_STEPS.length,
      percentage: Math.round((completedCount / ONBOARDING_STEPS.length) * 100),
      isComplete,
    },
  });
});

export { onboardingRoutes };
