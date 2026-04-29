/**
 * @webwaka/analytics — Event tracker
 *
 * Phase 2: trackEvent() — non-blocking fire-and-forget insert into analytics_events.
 * assertNoPii() redacts forbidden fields before insert (P13).
 *
 * Design: trackEvent is fire-and-forget — failures are logged but never thrown.
 * This preserves the invariant that analytics must never block the caller's business logic.
 */

import type { TrackEventInput } from './types.js';
import { PII_FIELD_BLOCKLIST } from './types.js';

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>;
    };
  };
}

function generateId(): string {
  return `ae_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

/**
 * @P13 Remove any PII fields from properties before they reach the DB.
 */
export function assertNoPii(properties: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(properties)) {
    const lk = k.toLowerCase();
    const blocked = (PII_FIELD_BLOCKLIST as readonly string[]).some(
      (f) => lk === f || lk.endsWith(`_${f}`) || lk.startsWith(`${f}_`),
    );
    if (!blocked) {
      clean[k] = v;
    }
  }
  return clean;
}

/**
 * Fire-and-forget analytics event write.
 * Never throws — failures are logged to console.error only.
 */
export async function trackEvent(db: D1Like, input: TrackEventInput): Promise<void> {
  try {
    const safeProps = input.properties ? assertNoPii(input.properties) : null;
    const propertiesJson = safeProps && Object.keys(safeProps).length > 0
      ? JSON.stringify(safeProps)
      : null;

    await db
      .prepare(
        `INSERT INTO analytics_events
           (id, tenant_id, workspace_id, event_key, entity_type, entity_id, actor_id, properties_json, occurred_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
      )
      .bind(
        generateId(),
        input.tenantId,
        input.workspaceId,
        input.eventKey,
        input.entityType,
        input.entityId,
        input.actorId ?? null,
        propertiesJson,
        Math.floor(Date.now() / 1000),
      )
      .run();
  } catch (err) {
    console.error('[analytics:trackEvent] non-blocking failure:', err);
  }
}
