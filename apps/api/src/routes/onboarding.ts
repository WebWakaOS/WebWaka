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
      correlationId: c.get('requestId') ?? undefined,
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
      correlationId: c.get('requestId') ?? undefined,
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

// ---------------------------------------------------------------------------
// POST /onboarding/:workspaceId/mark-stalled — Mark onboarding as stalled (N-088/T9)
// onboarding.stalled event — for admin use when a workspace is stuck mid-onboarding.
// ---------------------------------------------------------------------------

onboardingRoutes.post('/:workspaceId/mark-stalled', async (c) => {
  const auth = c.get('auth') as Auth;
  const workspaceId = c.req.param('workspaceId');
  const db = c.env.DB;

  if ((auth.role as string) !== 'admin' && (auth.role as string) !== 'super_admin') {
    return c.json({ error: 'Admin role required' }, 403);
  }

  const workspace = await db.prepare(
    'SELECT id FROM workspaces WHERE id = ? AND tenant_id = ?'
  ).bind(workspaceId, auth.tenantId).first<{ id: string }>();

  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  let body: { reason?: string; stalledStep?: string } = {};
  try {
    body = await c.req.json<typeof body>();
  } catch {
    body = {};
  }

  const countResult = await db.prepare(
    'SELECT COUNT(*) AS cnt FROM onboarding_progress WHERE workspace_id = ? AND tenant_id = ? AND completed = 1'
  ).bind(workspaceId, auth.tenantId).first<{ cnt: number }>();

  const completedCount = countResult?.cnt ?? 0;

  // N-088/T9: onboarding.stalled event — workspace is stuck mid-onboarding
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: OnboardingEventType.OnboardingStalled,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId,
    payload: {
      workspace_id: workspaceId,
      steps_completed: completedCount,
      total_steps: ONBOARDING_STEPS.length,
      stalled_step: body.stalledStep ?? null,
      reason: body.reason ?? null,
      marked_by: auth.userId,
    },
    source: 'api',
    severity: 'warning',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({
    workspaceId,
    stalled: true,
    stepsCompleted: completedCount,
    totalSteps: ONBOARDING_STEPS.length,
  });
});

// ---------------------------------------------------------------------------
// POST /onboarding/:workspaceId/template — E27: Template selection during onboarding
// Phase 4 — Template System Rollout (M14 gate: workspace onboarding includes template selection)
//
// Accepts a template_slug, installs the template for the tenant, and marks
// the `template_installed` onboarding step as complete in a single atomic flow.
//
// Platform Invariants:
//   T3 — tenant_id on all DB queries
//   TR-T-05 — default_policies seeded into policy_rules on install
//   TR-T-02 — vocabulary stored in KV for fast resolution
// ---------------------------------------------------------------------------

onboardingRoutes.post('/:workspaceId/template', async (c) => {
  const auth = c.get('auth') as Auth;
  const workspaceId = c.req.param('workspaceId');
  const db = c.env.DB;

  const workspace = await db.prepare(
    'SELECT id FROM workspaces WHERE id = ? AND tenant_id = ?',
  ).bind(workspaceId, auth.tenantId).first<{ id: string }>();

  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  let body: { template_slug?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch { body = {}; }

  const templateSlug = body.template_slug;
  if (!templateSlug || typeof templateSlug !== 'string' || !/^[a-z0-9-]+$/.test(templateSlug)) {
    return c.json({ error: 'template_slug is required and must be a kebab-case string' }, 422);
  }

  const template = await db.prepare(
    `SELECT id, slug, display_name, description, version, default_policies, vocabulary
     FROM template_registry WHERE slug = ? AND status = 'approved'`,
  ).bind(templateSlug).first<{
    id: string;
    slug: string;
    display_name: string;
    description: string;
    version: string;
    default_policies: string;
    vocabulary: string;
  }>();

  if (!template) {
    return c.json({ error: `Template '${templateSlug}' not found or not approved` }, 404);
  }

  const existingInstall = await db.prepare(
    `SELECT id, status FROM template_installations WHERE tenant_id = ? AND template_id = ?`,
  ).bind(auth.tenantId, template.id).first<{ id: string; status: string }>();

  const now = Math.floor(Date.now() / 1000);
  let installId: string;
  let reinstalled = false;

  if (existingInstall && existingInstall.status === 'active') {
    installId = existingInstall.id;
    reinstalled = true;
  } else if (existingInstall) {
    installId = existingInstall.id;
    reinstalled = true;
    await db.prepare(
      `UPDATE template_installations SET status = 'active', template_version = ?, installed_at = ?, installed_by = ?
       WHERE id = ? AND tenant_id = ?`,
    ).bind(template.version, now, auth.userId, existingInstall.id, auth.tenantId).run();
    await db.prepare(
      `UPDATE template_registry SET install_count = install_count + 1, updated_at = ? WHERE id = ?`,
    ).bind(now, template.id).run();
  } else {
    installId = `inst_${crypto.randomUUID().replace(/-/g, '')}`;
    await db.batch([
      db.prepare(
        `INSERT INTO template_installations
           (id, tenant_id, template_id, template_version, installed_at, installed_by, status, config_json)
         VALUES (?, ?, ?, ?, ?, ?, 'active', '{}')`,
      ).bind(installId, auth.tenantId, template.id, template.version, now, auth.userId),
      db.prepare(
        `UPDATE template_registry SET install_count = install_count + 1, updated_at = ? WHERE id = ?`,
      ).bind(now, template.id),
    ]);
  }

  // TR-T-05: seed default_policies into policy_rules with tenant_id
  const policiesJson = template.default_policies ?? '[]';
  let policies: Array<{
    rule_key?: string; category?: string; scope?: string;
    title?: string; description?: string; condition_json?: string;
    decision?: string; hitl_level?: number | null;
  }> = [];
  try { policies = JSON.parse(policiesJson); } catch { policies = []; }
  for (const policy of policies) {
    if (!policy.rule_key || !policy.category || !policy.title) continue;
    try {
      const existingPolicy = await db.prepare(
        `SELECT id FROM policy_rules WHERE tenant_id = ? AND rule_key = ? AND scope = 'tenant'`,
      ).bind(auth.tenantId, policy.rule_key).first<{ id: string }>();
      if (!existingPolicy) {
        const policyId = `polr_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
        await db.prepare(`
          INSERT INTO policy_rules
            (id, tenant_id, workspace_id, rule_key, version, category, scope, status,
             title, description, condition_json, decision, hitl_level,
             effective_from, effective_to, created_by, created_at, updated_at)
          VALUES (?, ?, NULL, ?, 1, ?, ?, 'published', ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)
        `).bind(
          policyId, auth.tenantId,
          policy.rule_key, policy.category, policy.scope ?? 'tenant',
          policy.title, policy.description ?? '',
          policy.condition_json ?? '{}', policy.decision ?? 'DENY',
          policy.hitl_level ?? null,
          now, auth.tenantId, now, now,
        ).run();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('no such table')) {
        console.warn('[onboarding] policy seed failed (non-fatal):', policy.rule_key, err);
      }
    }
  }

  // TR-T-02: store vocabulary in KV for fast resolution at UI layer
  const vocabJson = template.vocabulary ?? '{}';
  const kv = c.env.KV;
  if (kv && vocabJson !== '{}') {
    try {
      await kv.put(`vocab:${auth.tenantId}:${templateSlug}`, vocabJson, { expirationTtl: 60 * 60 * 24 * 365 });
    } catch { /* non-fatal */ }
  }

  // Mark template_installed onboarding step as complete
  const stepKey = 'template_installed';
  const stepMetadata = JSON.stringify({ template_slug: templateSlug, installation_id: installId });
  const existingStep = await db.prepare(
    'SELECT id, completed FROM onboarding_progress WHERE workspace_id = ? AND step_key = ? AND tenant_id = ?',
  ).bind(workspaceId, stepKey, auth.tenantId).first<{ id: string; completed: number }>();

  if (existingStep) {
    if (existingStep.completed !== 1) {
      await db.prepare(
        'UPDATE onboarding_progress SET completed = 1, completed_at = ?, completed_by = ?, metadata = ?, updated_at = ? WHERE id = ? AND tenant_id = ?',
      ).bind(now, auth.userId, stepMetadata, now, existingStep.id, auth.tenantId).run();
    }
  } else {
    const stepId = generateId();
    await db.prepare(
      `INSERT INTO onboarding_progress (id, tenant_id, workspace_id, step_key, completed, completed_at, completed_by, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
    ).bind(stepId, auth.tenantId, workspaceId, stepKey, now, auth.userId, stepMetadata, now, now).run();
  }

  return c.json({
    template_installed: true,
    reinstalled,
    installation_id: installId,
    template_slug: templateSlug,
    template_name: template.display_name,
    template_version: template.version,
    onboarding_step: 'template_installed',
    onboarding_step_completed: true,
  }, 201);
});

export { onboardingRoutes };
