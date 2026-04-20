// Onboarding Stalled CRON Job — N-099
// Scheduled trigger: every hour (cron pattern: 0 * * * *)
// Configured in wrangler.toml [[triggers]]
//
// Sweeps all workspaces that started onboarding more than 24 hours ago
// but have not yet completed all steps. Fires onboarding.stalled events
// for each affected workspace, rate-limited to once per 24h per workspace.
// Idempotent: re-running has no adverse effect.

import type { Env } from '../env.js';
import { publishEvent } from '../lib/publish-event.js';
import { OnboardingEventType } from '@webwaka/events';

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface StalledWorkspace {
  workspace_id: string;
  tenant_id: string;
  completed_count: number;
  first_step_at: number;
}

const TOTAL_STEPS = 6;
const STALL_THRESHOLD_SECS = 24 * 3600; // 24 hours
const NOTIFY_COOLDOWN_SECS = 24 * 3600; // re-notify at most once per 24h

export async function runOnboardingStalled(env: Env): Promise<void> {
  const db = env.DB as unknown as D1Like;
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - STALL_THRESHOLD_SECS;

  let stalledWorkspaces: StalledWorkspace[];
  try {
    const result = await db.prepare(
      `SELECT workspace_id, tenant_id,
              COUNT(*) AS completed_count,
              MIN(created_at) AS first_step_at
         FROM onboarding_progress
        WHERE completed = 1
        GROUP BY workspace_id, tenant_id
       HAVING completed_count < ? AND first_step_at < ?`,
    ).bind(TOTAL_STEPS, cutoff).all<StalledWorkspace>();
    stalledWorkspaces = result.results ?? [];
  } catch (err) {
    console.error('[onboarding-stalled] DB sweep failed (non-fatal):', err);
    return;
  }

  console.log(`[onboarding-stalled] Found ${stalledWorkspaces.length} stalled workspaces`);

  for (const ws of stalledWorkspaces) {
    try {
      const lastNotified = now - NOTIFY_COOLDOWN_SECS;
      const eventId = `onb_stalled_${ws.workspace_id}_${String(Math.floor(now / NOTIFY_COOLDOWN_SECS))}`;
      // Stable eventId per 24h window → idempotent dedup in publishEvent
      void publishEvent(env, {
        eventId,
        eventKey: OnboardingEventType.OnboardingStalled,
        tenantId: ws.tenant_id,
        actorId: 'system',
        actorType: 'system',
        workspaceId: ws.workspace_id,
        payload: {
          workspace_id: ws.workspace_id,
          completed_steps: ws.completed_count,
          total_steps: TOTAL_STEPS,
          stalled_since: ws.first_step_at,
          last_notified_cutoff: lastNotified,
        },
        source: 'api',
        severity: 'warning',
      });
    } catch (err) {
      console.error(`[onboarding-stalled] Failed for workspace ${ws.workspace_id}:`, err);
    }
  }
}
