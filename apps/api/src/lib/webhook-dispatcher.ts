/**
 * WebhookDispatcher — PROD-04
 *
 * HMAC-SHA256 signed webhook delivery with automatic retry.
 * Retry policy: max 3 attempts with exponential backoff (5s, 25s, 125s).
 * Failures are logged to webhook_deliveries table.
 *
 * Usage:
 *   const dispatcher = new WebhookDispatcher(db, tenantId);
 *   await dispatcher.dispatch('template.installed', { template_slug: 'my-tpl', ... });
 *
 * Registered events:
 *   template.installed        — fired on POST /templates/:slug/install success
 *   template.purchased        — fired on POST /templates/:slug/purchase/verify success
 *   workspace.member_added    — fired on POST /workspaces/:id/members success
 *   payment.completed         — fired on Paystack payment verification success
 */

const MAX_ATTEMPTS = 3;
const BACKOFF_DELAYS_MS = [5_000, 25_000, 125_000];  // 5s, 25s, ~2m

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
 * Returns { ok: boolean; status: number | null; error: string | null }
 */
async function attemptDelivery(
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
  ) {}

  /**
   * Dispatch an event to all active subscriptions for this tenant
   * that are subscribed to the given event type.
   *
   * Delivery is best-effort: errors are logged but not re-thrown.
   * For production, this should be called from a Cloudflare Queues consumer
   * or a durable execution context. In the current implementation, dispatch
   * is synchronous from the request handler (acceptable for low-volume events).
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

    // Filter to subscriptions that include this event type
    const matching = subscriptions.filter((sub) => {
      try {
        const events = JSON.parse(sub.events) as string[];
        return events.includes(eventType) || events.includes('*');
      } catch {
        return false;
      }
    });

    // Dispatch to each matching subscription
    await Promise.allSettled(matching.map((sub) => this.deliverToSubscription(sub, eventType, eventData)));
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

    // Create delivery record
    const now = Math.floor(Date.now() / 1000);
    await this.db
      .prepare(
        `INSERT INTO webhook_deliveries
           (id, subscription_id, tenant_id, event_type, payload, status, attempts, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
      )
      .bind(deliveryId, sub.id, this.tenantId, eventType, payloadStr, now, now)
      .run();

    // Attempt delivery with retry
    let lastError: string | null = null;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        // Backoff: wait before retrying (best-effort — in a request context this blocks the response)
        // In production this should be a Cloudflare Queue retry; here we do it inline
        await new Promise((r) => setTimeout(r, BACKOFF_DELAYS_MS[attempt - 1] ?? 5_000));
      }

      const result = await attemptDelivery(sub.url, payloadStr, signature, deliveryId);
      lastError = result.error;

      if (result.ok) {
        const deliveredAt = Math.floor(Date.now() / 1000);
        await this.db
          .prepare(
            `UPDATE webhook_deliveries
                SET status = 'delivered', attempts = ?, delivered_at = ?, updated_at = ?
              WHERE id = ?`,
          )
          .bind(attempt + 1, deliveredAt, deliveredAt, deliveryId)
          .run();
        return;
      }

      // Update attempt count after each failure
      await this.db
        .prepare(
          `UPDATE webhook_deliveries
              SET attempts = ?, last_error = ?, updated_at = ?
            WHERE id = ?`,
        )
        .bind(attempt + 1, result.error, Math.floor(Date.now() / 1000), deliveryId)
        .run();
    }

    // All attempts exhausted — mark as failed
    await this.db
      .prepare(
        `UPDATE webhook_deliveries
            SET status = 'failed', last_error = ?, updated_at = ?
          WHERE id = ?`,
      )
      .bind(lastError, Math.floor(Date.now() / 1000), deliveryId)
      .run();
  }
}
