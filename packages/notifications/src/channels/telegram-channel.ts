/**
 * @webwaka/notifications — Telegram Bot API channel (N-046, Phase 4).
 *
 * Implements INotificationChannel for the 'telegram' channel via Telegram Bot API.
 *
 * API: POST https://api.telegram.org/bot{token}/sendMessage
 * Docs: https://core.telegram.org/bots/api#sendmessage
 *
 * Channel address convention:
 *   ctx.channelAddress = Telegram chat_id (stored in user profile metadata).
 *   Can be a numeric chat ID (e.g. "123456789") or @channel_username.
 *
 * Credentials (G16 ADL-002):
 *   { bot_token: string }  — Telegram Bot API token
 *
 * Provider-specific metadata:
 *   { bot_username?: string }
 *
 * Guardrails:
 *   G16 (ADL-002) — bot token from KV only
 *   G24 (OQ-012) — sandbox redirect: log and skip actual send
 *   G1  — tenantId in resolveChannelProvider() query
 */

import type { INotificationChannel, DispatchContext, DispatchResult } from '../types.js';
import type { D1LikeFull } from '../db-types.js';
import { resolveChannelProvider } from '../channel-provider-resolver.js';
import { loadCredentials } from '../credential-store.js';
import type { KVLike } from '../credential-store.js';

// ---------------------------------------------------------------------------
// TelegramChannelOptions
// ---------------------------------------------------------------------------

export interface TelegramChannelOptions {
  /** Platform-level bot token from env (fallback). */
  platformBotToken?: string;
  /** D1 database binding. */
  db?: D1LikeFull;
  /** KV namespace for credentials (G16 ADL-002). */
  kv?: KVLike;
  /** AES-256-GCM master key (base64). */
  masterKey?: string;
}

// ---------------------------------------------------------------------------
// TelegramChannel
// ---------------------------------------------------------------------------

export class TelegramChannel implements INotificationChannel {
  readonly channel = 'telegram' as const;
  readonly providerName = 'telegram_bot';

  private readonly platformBotToken: string | undefined;
  private readonly db: D1LikeFull | undefined;
  private readonly kv: KVLike | undefined;
  private readonly masterKey: string | undefined;

  constructor(options: TelegramChannelOptions = {}) {
    this.platformBotToken = options.platformBotToken;
    this.db = options.db;
    this.kv = options.kv;
    this.masterKey = options.masterKey;
  }

  async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
    // G24: sandbox redirect
    if (ctx.sandboxMode) {
      console.log(
        `[telegram] sandbox mode — skipping dispatch deliveryId=${ctx.deliveryId}`,
      );
      return {
        success: true,
        providerMessageId: 'sandbox-skipped',
        sandboxRedirect: true,
      };
    }

    const chatId = ctx.channelAddress;
    if (!chatId) {
      return {
        success: false,
        lastError: 'No Telegram chat_id available (channelAddress missing)',
      };
    }

    const { botToken } = await this.resolveConfig(ctx.tenantId);

    if (!botToken) {
      console.log(
        `[telegram] no bot token configured — skipped (dev mode) deliveryId=${ctx.deliveryId}`,
      );
      return { success: true, providerMessageId: 'dev-skipped' };
    }

    const messageText = (ctx.template.bodyPlainText ?? ctx.template.body)
      .replace(/<[^>]+>/g, '')
      .trim()
      .slice(0, 4096);  // Telegram message limit

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // Build the message with optional subject as bold header
    let fullText = messageText;
    if (ctx.template.subject) {
      fullText = `*${ctx.template.subject}*\n\n${messageText}`;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: fullText,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      });

      const responseText = await res.text();
      let responseJson: { ok: boolean; result?: { message_id: number }; description?: string } = {
        ok: false,
      };
      try {
        responseJson = JSON.parse(responseText) as typeof responseJson;
      } catch {
        // Non-JSON response
      }

      if (res.ok && responseJson.ok && responseJson.result?.message_id !== undefined) {
        return {
          success: true,
          providerMessageId: String(responseJson.result.message_id),
        };
      }

      const errMsg = responseJson.description ?? responseText.slice(0, 500);
      return {
        success: false,
        lastError: `Telegram API error ${res.status}: ${errMsg}`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'network error';
      return {
        success: false,
        lastError: `Telegram fetch failed: ${msg}`,
      };
    }
  }

  /**
   * Telegram channel available on business plan and above.
   */
  isEntitled(workspacePlan: string): boolean {
    return workspacePlan === 'business' || workspacePlan === 'enterprise';
  }

  private async resolveConfig(tenantId: string): Promise<{
    botToken: string | undefined;
  }> {
    if (!this.db) {
      return { botToken: this.platformBotToken };
    }

    let provider = null;
    try {
      provider = await resolveChannelProvider(this.db, tenantId, 'telegram');
    } catch {
      return { botToken: this.platformBotToken };
    }

    if (!provider) {
      return { botToken: this.platformBotToken };
    }

    if (provider.credentialsKvKey && this.kv && this.masterKey) {
      try {
        const creds = await loadCredentials(this.kv, this.masterKey, provider.credentialsKvKey);
        if (creds?.['bot_token']) {
          return { botToken: creds['bot_token'] };
        }
      } catch (err) {
        console.warn(
          `[telegram] loadCredentials failed — tenant=${tenantId} ` +
          `err=${err instanceof Error ? err.message : String(err)} ` +
          `— falling back to platform bot token`,
        );
      }
    }

    return { botToken: this.platformBotToken };
  }
}
