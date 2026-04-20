/**
 * apps/notificator — WebWaka Notification Engine Worker.
 *
 * Dedicated Cloudflare Worker for the notification pipeline.
 * OQ-001 resolution: This Worker owns all CF Queue consumption and digest CRON sweeps.
 *
 * N-008 (Phase 0): Initial scaffold.
 * N-012 (Phase 1): Queue consumer wired.
 * N-012a (Phase 1): CRON digest sweep wired.
 *
 * Handlers:
 *   queue()     — CF Queue consumer (processes notification_event and digest_batch messages)
 *   scheduled() — CRON triggers (digest sweeps, retention, domain verification)
 *   fetch()     — Health endpoint only (liveness probe for monitoring)
 *
 * Routes:
 *   GET /health  — liveness probe
 *
 * G24 (OQ-012): NOTIFICATION_SANDBOX_MODE='true' in staging/development.
 *   Any delivery in non-production is redirected to sandbox test addresses.
 *   CI/CD governance check asserts 'false' on production deploy.
 */

import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import type { Env } from './env.js';
import { assertSandboxConsistency } from './sandbox.js';
import { processQueueBatch, type NotificationQueueMessage } from './consumer.js';
import { resolveDigestType, runDigestSweep, runRetentionSweep, runDomainVerificationPoll } from './digest.js';

const app = new Hono<{ Bindings: Env }>();

app.use('*', secureHeaders());

// ---------------------------------------------------------------------------
// Health — liveness probe
// ---------------------------------------------------------------------------

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    app: 'notificator',
    pipeline: c.env.NOTIFICATION_PIPELINE_ENABLED,
    sandbox: c.env.NOTIFICATION_SANDBOX_MODE,
    hitlLegacy: c.env.HITL_LEGACY_NOTIFICATIONS_ENABLED,
  }),
);

// ---------------------------------------------------------------------------
// Queue consumer handler — N-012 (Phase 1)
// ---------------------------------------------------------------------------

async function queue(
  batch: MessageBatch<NotificationQueueMessage>,
  env: Env,
): Promise<void> {
  assertSandboxConsistency(env);
  await processQueueBatch(batch, env);
}

// ---------------------------------------------------------------------------
// Scheduled CRON handler — N-012a, N-053b, N-115
// ---------------------------------------------------------------------------

async function scheduled(
  event: { cron: string; scheduledTime: number },
  env: Env,
): Promise<void> {
  assertSandboxConsistency(env);

  const cron = event.cron;
  console.log(`[notificator:cron] triggered — cron="${cron}" environment="${env.ENVIRONMENT}"`);

  // Digest sweeps (N-012a — OQ-007)
  const digestType = resolveDigestType(cron);
  if (digestType !== null) {
    await runDigestSweep(digestType, env);
  }

  // Daily retention sweep (N-115, Phase 8) — runs at 03:00 WAT (02:00 UTC)
  if (cron === '0 2 * * *') {
    await runRetentionSweep(env);
  }

  // Domain verification poll (N-053b, Phase 4) — every 6 hours
  if (cron === '0 */6 * * *') {
    await runDomainVerificationPoll(env);
  }
}

// ---------------------------------------------------------------------------
// Default export — Cloudflare Workers dual export: fetch + queue + scheduled
// ---------------------------------------------------------------------------

export default { fetch: app.fetch, queue, scheduled };
