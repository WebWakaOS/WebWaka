/**
 * @webwaka/notifications — Firebase Cloud Messaging (FCM) push channel (N-047, Phase 4).
 *
 * Implements INotificationChannel for the 'push' channel via FCM v1 API.
 *
 * API: POST https://fcm.googleapis.com/v1/projects/{project_id}/messages:send
 * Docs: https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages/send
 *
 * Auth: FCM v1 requires an OAuth 2.0 access token. In Phase 4 we use a pre-generated
 * service account access token stored encrypted in KV. Phase 7 (N-107) upgrades this
 * to automatic service account key rotation.
 *
 * Credentials (G16 ADL-002):
 *   { access_token: string, project_id: string }
 *
 * Channel address convention:
 *   ctx.channelAddress = FCM registration token (push_token table row).
 *
 * Provider-specific metadata:
 *   { project_id: string, api_version: 'v1' }
 *
 * Guardrails:
 *   G22 (OQ-011) — low_data_mode: Phase 5 wires this; Phase 4 dispatches normally
 *   G16 (ADL-002) — credentials from KV only
 *   G24 (OQ-012) — sandbox redirect: skip actual API call (never push to real device)
 *   G1  — tenantId in resolveChannelProvider() query
 */

import type { INotificationChannel, DispatchContext, DispatchResult } from '../types.js';
import type { D1LikeFull } from '../db-types.js';
import { resolveChannelProvider } from '../channel-provider-resolver.js';
import { loadCredentials } from '../credential-store.js';
import type { KVLike } from '../credential-store.js';

// ---------------------------------------------------------------------------
// FcmPushChannelOptions
// ---------------------------------------------------------------------------

export interface FcmPushChannelOptions {
  /** Platform-level FCM access token (fallback — for dev/testing only). */
  platformAccessToken?: string;
  /** Platform-level FCM project ID (fallback). */
  platformProjectId?: string;
  /** D1 database binding. */
  db?: D1LikeFull;
  /** KV namespace for credentials (G16 ADL-002). */
  kv?: KVLike;
  /** AES-256-GCM master key (base64). */
  masterKey?: string;
}

// ---------------------------------------------------------------------------
// FcmPushChannel
// ---------------------------------------------------------------------------

export class FcmPushChannel implements INotificationChannel {
  readonly channel = 'push' as const;
  readonly providerName = 'fcm';

  private readonly platformAccessToken: string | undefined;
  private readonly platformProjectId: string | undefined;
  private readonly db: D1LikeFull | undefined;
  private readonly kv: KVLike | undefined;
  private readonly masterKey: string | undefined;

  constructor(options: FcmPushChannelOptions = {}) {
    this.platformAccessToken = options.platformAccessToken;
    this.platformProjectId = options.platformProjectId;
    this.db = options.db;
    this.kv = options.kv;
    this.masterKey = options.masterKey;
  }

  async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
    // G24: sandbox redirect — never push to real device tokens in non-production
    if (ctx.sandboxMode) {
      console.log(
        `[fcm-push] sandbox mode — skipping push dispatch deliveryId=${ctx.deliveryId}`,
      );
      return {
        success: true,
        providerMessageId: 'sandbox-skipped',
        sandboxRedirect: true,
      };
    }

    const pushToken = ctx.channelAddress;
    if (!pushToken) {
      return {
        success: false,
        lastError: 'No push token available (channelAddress missing)',
      };
    }

    const { accessToken, projectId } = await this.resolveConfig(ctx.tenantId);

    if (!accessToken || !projectId) {
      console.log(
        `[fcm-push] no credentials configured — skipped (dev mode) deliveryId=${ctx.deliveryId}`,
      );
      return { success: true, providerMessageId: 'dev-skipped' };
    }

    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const title = ctx.template.subject ?? 'Notification';
    const body = (ctx.template.bodyPlainText ?? ctx.template.body)
      .replace(/<[^>]+>/g, '')
      .trim()
      .slice(0, 500);

    const messagePayload = {
      message: {
        token: pushToken,
        notification: { title, body },
        data: {
          delivery_id: ctx.deliveryId,
          tenant_id: ctx.tenantId,
          ...(ctx.template.ctaUrl ? { cta_url: ctx.template.ctaUrl } : {}),
        },
      },
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });

      const responseText = await res.text();
      let responseJson: { name?: string; error?: { message: string; code: number } } = {};
      try {
        responseJson = JSON.parse(responseText) as typeof responseJson;
      } catch {
        // Non-JSON
      }

      if (res.ok && responseJson.name) {
        // FCM v1 returns message name in format: projects/{project}/messages/{message_id}
        const parts = responseJson.name.split('/');
        const messageId = parts[parts.length - 1] ?? responseJson.name;
        return {
          success: true,
          providerMessageId: messageId,
        };
      }

      const errMsg = responseJson.error?.message ?? responseText.slice(0, 500);
      return {
        success: false,
        lastError: `FCM API error ${res.status}: ${errMsg}`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'network error';
      return {
        success: false,
        lastError: `FCM fetch failed: ${msg}`,
      };
    }
  }

  /**
   * Push notifications available on business plan and above.
   * G22: Phase 5 will add low_data_mode restriction (push suspended in low-data mode).
   */
  isEntitled(workspacePlan: string): boolean {
    return workspacePlan === 'business' || workspacePlan === 'enterprise';
  }

  private async resolveConfig(tenantId: string): Promise<{
    accessToken: string | undefined;
    projectId: string | undefined;
  }> {
    const defaults = {
      accessToken: this.platformAccessToken,
      projectId: this.platformProjectId,
    };

    if (!this.db) {
      return defaults;
    }

    let provider = null;
    try {
      provider = await resolveChannelProvider(this.db, tenantId, 'push');
    } catch {
      return defaults;
    }

    if (!provider) {
      return defaults;
    }

    const meta = provider.metadata ?? {};
    const projectId = typeof meta['project_id'] === 'string'
      ? meta['project_id']
      : this.platformProjectId;

    if (provider.credentialsKvKey && this.kv && this.masterKey) {
      try {
        const creds = await loadCredentials(this.kv, this.masterKey, provider.credentialsKvKey);
        if (creds?.['access_token']) {
          return { accessToken: creds['access_token'], projectId };
        }
      } catch (err) {
        console.warn(
          `[fcm-push] loadCredentials failed — tenant=${tenantId} ` +
          `err=${err instanceof Error ? err.message : String(err)} ` +
          `— falling back to platform token`,
        );
      }
    }

    return { accessToken: this.platformAccessToken, projectId };
  }
}
