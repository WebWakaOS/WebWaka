/**
 * Email Provider Abstraction — BATCH 4
 * Cloudflare Email Service as default; Resend as automatic fallback.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface EmailSendResult {
  ok: boolean;
  id?: string;
  provider: 'cloudflare' | 'resend' | 'none';
  error?: string;
}

export interface IEmailProvider {
  readonly name: 'cloudflare' | 'resend';
  isAvailable(): boolean;
  send(message: EmailMessage): Promise<EmailSendResult>;
}

const DEFAULT_FROM = 'WebWaka <noreply@webwaka.com>';

export class CloudflareEmailProvider implements IEmailProvider {
  readonly name = 'cloudflare' as const;
  constructor(
    private readonly binding: {
      send(msg: { from: string; to: string | string[]; subject: string; html: string; replyTo?: string }): Promise<void>;
    } | undefined,
  ) {}
  isAvailable(): boolean { return !!this.binding; }
  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.binding) return { ok: false, provider: 'cloudflare', error: 'CF Email binding not configured' };
    try {
      await this.binding.send({
        from: message.from ?? DEFAULT_FROM,
        to: message.to,
        subject: message.subject,
        html: message.html,
        ...(message.replyTo ? { replyTo: message.replyTo } : {}),
      });
      return { ok: true, provider: 'cloudflare', id: `cf_${Date.now()}` };
    } catch (e) {
      return { ok: false, provider: 'cloudflare', error: e instanceof Error ? e.message : 'CF Email send failed' };
    }
  }
}

export class ResendEmailProvider implements IEmailProvider {
  readonly name = 'resend' as const;
  constructor(private readonly apiKey: string | undefined) {}
  isAvailable(): boolean { return !!this.apiKey; }
  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.apiKey) return { ok: false, provider: 'resend', error: 'RESEND_API_KEY not configured' };
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: message.from ?? DEFAULT_FROM,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        }),
      });
      if (res.ok) {
        const json = await res.json() as { id?: string };
        return { ok: true, provider: 'resend', id: json.id };
      }
      return { ok: false, provider: 'resend', error: `Resend API ${res.status}: ${await res.text()}` };
    } catch (e) {
      return { ok: false, provider: 'resend', error: e instanceof Error ? e.message : 'Resend network error' };
    }
  }
}

export class EmailProviderRouter {
  private readonly providers: IEmailProvider[];
  constructor(cfEmailBinding: CloudflareEmailProvider['binding'], resendApiKey: string | undefined) {
    this.providers = [
      new CloudflareEmailProvider(cfEmailBinding),
      new ResendEmailProvider(resendApiKey),
    ].filter(p => p.isAvailable());
  }
  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (this.providers.length === 0) {
      return { ok: false, provider: 'none', error: 'No email provider configured' };
    }
    for (const provider of this.providers) {
      const result = await provider.send(message);
      if (result.ok) return result;
      console.warn(JSON.stringify({
        level: 'warn', event: 'email_provider_failed',
        provider: provider.name, error: result.error,
      }));
    }
    return { ok: false, provider: 'none', error: 'All email providers failed' };
  }
  get primaryProvider(): 'cloudflare' | 'resend' | 'none' { return this.providers[0]?.name ?? 'none'; }
  get availableCount(): number { return this.providers.length; }
}
