/**
 * apps/notificator — CF Queue consumer.
 *
 * N-012 (Phase 1): Full queue consumer implementation.
 * This file is the Phase 0 skeleton — it receives queue messages and logs them.
 * The full dispatch pipeline (NotificationService, channel routing, delivery
 * tracking) is wired in Phase 1.
 *
 * Queue message shape (from apps/api NotificationService.raise()):
 *  {
 *    type: 'notification_event',
 *    eventId: string,
 *    eventKey: string,
 *    tenantId: string,
 *    correlationId?: string,
 *    source: NotificationEventSource,
 *  }
 *
 * Or for digest sweeps (N-012a, OQ-007):
 *  {
 *    type: 'digest_batch',
 *    batchId: string,
 *    tenantId: string,
 *  }
 *
 * Dead-letter handling (G10): After max_retries=5, CF Queues moves the message
 * to a dead-letter state. The consumer marks the delivery as 'dead_lettered'
 * and writes to notification_audit_log. Silent discard is FORBIDDEN.
 */

import type { Env } from './env.js';
import { getSandboxConfig } from './sandbox.js';

export interface NotificationQueueMessage {
  type: 'notification_event' | 'digest_batch';
  eventId?: string;
  eventKey?: string;
  tenantId: string;
  correlationId?: string;
  source?: string;
  batchId?: string;
}

/**
 * Process a batch of queue messages.
 * Called by the Worker queue() handler in src/index.ts.
 *
 * Phase 0 (N-008): Skeleton — logs messages, acknowledges them.
 * Phase 1 (N-012): Full consumer logic wired here.
 */
export async function processQueueBatch(
  batch: MessageBatch<NotificationQueueMessage>,
  env: Env,
): Promise<void> {
  const sandboxConfig = getSandboxConfig(env);

  console.log(
    `[notificator:consumer] batch received — size=${batch.messages.length} ` +
    `sandbox=${sandboxConfig.enabled} pipeline=${env.NOTIFICATION_PIPELINE_ENABLED}`,
  );

  if (env.NOTIFICATION_PIPELINE_ENABLED !== '1') {
    // Pipeline disabled (N-009 kill-switch): acknowledge all messages without processing.
    // This prevents queue buildup when the pipeline is not yet ready.
    console.log('[notificator:consumer] NOTIFICATION_PIPELINE_ENABLED=0 — messages acknowledged without processing');
    batch.ackAll();
    return;
  }

  // Phase 1 (N-012): Route each message to the appropriate handler.
  // TODO Phase 1: import NotificationService and wire dispatch pipeline.
  for (const msg of batch.messages) {
    try {
      const payload = msg.body;
      console.log(
        `[notificator:consumer] processing message — type=${payload.type} ` +
        `tenantId=${payload.tenantId} eventKey=${payload.eventKey ?? 'digest'}`,
      );
      // Phase 1: await NotificationService.processEvent(payload, env, sandboxConfig);
      msg.ack();
    } catch (err) {
      console.error('[notificator:consumer] message processing failed:', err);
      // Retry: do not ack — CF Queues will retry up to max_retries=5 times.
      // After max retries, the delivery is moved to dead_lettered state (G10).
      msg.retry();
    }
  }
}
