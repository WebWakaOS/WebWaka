/**
 * WebhookDispatcher — PROD-04 (N-131 Phase 4: CF Queues migration)
 *
 * HMAC-SHA256 signed webhook delivery with CF Queue-backed retry.
 *
 * Phase 4 (N-131): Migrated from inline setTimeout retry to CF Queues.
 * The dispatcher now:
 *   1. Creates the webhook_deliveries row (status='pending')
 *   2. Attempts first delivery synchronously (fast-path for the common case)
 *   3. On failure: enqueues { type:'webhook_delivery', deliveryId, ... } to
 *      NOTIFICATION_QUEUE for durable retry (max_retries=5 handled by CF)
 *   4. On success: marks delivery 'delivered' immediately
 *
 * CF Queue consumer (apps/notificator consumer.ts) handles 'webhook_delivery'
 * messages with a single delivery attempt per message. CF Queue exponential
 * backoff handles the retry schedule.
 *
 * This removes the problematic setTimeout-based inline retry which:
 *   - Blocked the request context for up to 2 minutes
 *   - Was not persistent (lost if Worker process died)
 *   - Violated CF Worker CPU time limits for paid plans
 *
 * Registered events (N-132 expands to 30):
 *   template.installed        — POST /templates/:slug/install
 *   template.purchased        — POST /templates/:slug/purchase/verify
 *   workspace.member_added    — POST /workspaces/:id/members
 *   payment.completed         — Paystack payment verification
 */

export type WebhookEventType =
  | 'template.installed'
  | 'template.purchased'
  | 'workspace.member_added'
  | 'payment.completed';

export interface WebhookSubscriptionRow {
  id: string;
  workspace_id: string;
  tenant_id: string;
  url: string;
  events: string;  // JSON array string
  secret: string;
  active: number;
}

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      all<T>(): Promise<{ results: T[] }>;
      first<T>(): Promise<T | null>;
    };
  };
}

interface QueueLike {
  send(message: WebhookRetryMessage): Promise<void>;
}

export interface WebhookRetryMessage {
  type: 'webhook_delivery';
  deliveryId: string;
  subscriptionId: string;
  tenantId: string;
  url: string;
  payloadStr: string;
  secret: string;
  attempt: number;
}

/**
 * Sign the payload with HMAC-SHA256.
 * Signature format: sha256=<hex>
 * Header: X-WebWaka-Signature
 */
async function sign(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256=${hex}`;
}

/**
 * Attempt a single delivery to a webhook URL.
 */
export async function attemptDelivery(
  url: string,
  payloadStr: string,
  signature: string,
  deliveryId: string,
): Promise<{ ok: boolean; status: number | null; error: string | null }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WebWaka-Signature': signature,
        'X-WebWaka-Delivery-Id': deliveryId,
        'X-WebWaka-Timestamp': String(Date.now()),
        'User-Agent': 'WebWaka-Webhooks/1.0',
      },
      body: payloadStr,
    });
    if (res.ok) {
      return { ok: true, status: res.status, error: null };
    }
    return { ok: false, status: res.status, error: `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, status: null, error: e instanceof Error ? e.message : 'network error' };
  }
}

export class WebhookDispatcher {
  constructor(
    private readonly db: D1Like,
    private readonly tenantId: string,
    /**
     * N-131: CF Queue for durable retry.
     * If undefined (test / legacy mode), retries are skipped and failure is final.
     * Production always provides this binding.
     */
    private readonly queue?: QueueLike,
  ) {}

  /**
   * Dispatch an event to all active subscriptions for this tenant
   * that subscribe to the given event type.
   *
   * N-131 Phase 4:
   *   - Creates delivery record
   *   - Attempts one synchronous delivery
   *   - On failure: enqueues to CF Queue for durable retry (no setTimeout)
   */
  async dispatch(
    eventType: WebhookEventType,
    eventData: Record<string, unknown>,
  ): Promise<void> {
    const { results: subscriptions } = await this.db
      .prepare(
        `SELECT id, workspace_id, tenant_id, url, events, secret, active
           FROM webhook_subscriptions
          WHERE tenant_id = ? AND active = 1`,
      )
      .bind(this.tenantId)
      .all<WebhookSubscriptionRow>();

    const matching = subscriptions.filter((sub) => {
      try {
        const events = JSON.parse(sub.events) as string[];
        return events.includes(eventType) || events.includes('*');
      } catch {
        return false;
      }
    });

    await Promise.allSettled(
      matching.map((sub) => this.deliverToSubscription(sub, eventType, eventData)),
    );
  }

  private async deliverToSubscription(
    sub: WebhookSubscriptionRow,
    eventType: WebhookEventType,
    eventData: Record<string, unknown>,
  ): Promise<void> {
    const deliveryId = crypto.randomUUID();
    const payload = {
      id: deliveryId,
      event: eventType,
      created_at: new Date().toISOString(),
      workspace_id: sub.workspace_id,
      data: eventData,
    };
    const payloadStr = JSON.stringify(payload);
    const signature = await sign(sub.secret, payloadStr);

    // Create delivery record (status='pending')
    const now = Math.floor(Date.now() / 1000);
    await this.db
      .prepare(
        `INSERT INTO webhook_deliveries
           (id, subscription_id, tenant_id, event_type, payload, status, attempts, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
      )
      .bind(deliveryId, sub.id, this.tenantId, eventType, payloadStr, now, now)
      .run();

    // N-131: Single synchronous attempt (fast-path for successful deliveries)
    const result = await attemptDelivery(sub.url, payloadStr, signature, deliveryId);

    if (result.ok) {
      const deliveredAt = Math.floor(Date.now() / 1000);
      // T3: include tenant_id in WHERE for defence-in-depth (deliveryId is a UUID
      // and already unique, but scoping by tenant prevents any cross-tenant update
      // if a deliveryId were ever reused or guessable in a future schema change).
      await this.db
        .prepare(
          `UPDATE webhook_deliveries
              SET status = 'delivered', attempts = 1, delivered_at = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ?`,
        )
        .bind(deliveredAt, deliveredAt, deliveryId, this.tenantId)
        .run();
      return;
    }

    // N-131: First attempt failed — update attempt count then enqueue for CF Queue retry
    await this.db
      .prepare(
        `UPDATE webhook_deliveries
            SET attempts = 1, last_error = ?, updated_at = ?
          WHERE id = ? AND tenant_id = ?`,
      )
      .bind(result.error, Math.floor(Date.now() / 1000), deliveryId, this.tenantId)
      .run();

    if (this.queue) {
      // Enqueue for durable CF Queue retry (max_retries=5 configured in wrangler.toml)
      // Each retry attempt is a new queue message; CF handles exponential backoff.
      const retryMessage: WebhookRetryMessage = {
        type: 'webhook_delivery',
        deliveryId,
        subscriptionId: sub.id,
        tenantId: this.tenantId,
        url: sub.url,
        payloadStr,
        secret: sub.secret,
        attempt: 1,
      };
      await this.queue.send(retryMessage).catch((err) => {
        console.error(
          `[webhook-dispatcher] failed to enqueue retry — deliveryId=${deliveryId} ` +
          `err=${err instanceof Error ? err.message : String(err)}`,
        );
      });
    } else {
      // No queue configured (test / legacy mode) — mark as failed
      console.warn(
        `[webhook-dispatcher] no queue configured for retry — ` +
        `deliveryId=${deliveryId} marking failed`,
      );
      await this.db
        .prepare(
          `UPDATE webhook_deliveries
              SET status = 'failed', updated_at = ?
            WHERE id = ?`,
        )
        .bind(Math.floor(Date.now() / 1000), deliveryId)
        .run();
    }
  }
}

// ---------------------------------------------------------------------------
// processWebhookDeliveryRetry — called by apps/notificator consumer (N-131)
// ---------------------------------------------------------------------------

/**
 * Process a webhook_delivery retry message from the CF Queue.
 *
 * Called by apps/notificator consumer when type='webhook_delivery'.
 * Makes one delivery attempt; on failure throws to allow CF Queue retry.
 *
 * @param db      - D1 database binding
 * @param message - WebhookRetryMessage from queue
 */
export async function processWebhookDeliveryRetry(
  db: D1Like,
  message: WebhookRetryMessage,
): Promise<void> {
  const { deliveryId, url, payloadStr, secret, attempt, tenantId } = message;

  const signature = await sign(secret, payloadStr);
  const result = await attemptDelivery(url, payloadStr, signature, deliveryId);

  const now = Math.floor(Date.now() / 1000);

  if (result.ok) {
    await db
      .prepare(
        `UPDATE webhook_deliveries
            SET status = 'delivered', attempts = ?, delivered_at = ?, updated_at = ?
          WHERE id = ? AND tenant_id = ?`,
      )
      .bind(attempt + 1, now, now, deliveryId, tenantId)
      .run();
    return;
  }

  // Update attempt count on failure — CF Queue will retry the message
  await db
    .prepare(
      `UPDATE webhook_deliveries
          SET attempts = ?, last_error = ?, updated_at = ?
        WHERE id = ? AND tenant_id = ?`,
    )
    .bind(attempt + 1, result.error, now, deliveryId, tenantId)
    .run();

  // Throw to signal CF Queue to retry (CF handles backoff based on max_retries)
  throw new Error(
    `[webhook-dispatcher] delivery failed — ` +
    `deliveryId=${deliveryId} attempt=${attempt + 1} error=${result.error ?? 'unknown'}`,
  );
}
