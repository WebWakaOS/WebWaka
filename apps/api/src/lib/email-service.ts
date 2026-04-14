/**
 * EmailService — PROD-05
 *
 * Transactional email delivery via Resend (https://resend.com).
 * Uses the Resend REST API directly (no Node.js SDK — CF Workers compatible).
 *
 * Templates:
 *   welcome               — new workspace member signup
 *   template-purchase-receipt — paid template purchase confirmation
 *   workspace-invite      — invite someone to join a workspace
 *   payment-confirmation  — Paystack payment verified
 *   password-reset        — forgot-password reset link (P19-A)
 *
 * P13 invariant: no PII is logged — only email address (required for delivery).
 * NDPR: email delivery is a service communication, not marketing — consent not required
 * for transactional messages per NDPR Article 2(1)(b).
 */

export type EmailTemplate =
  | 'welcome'
  | 'template-purchase-receipt'
  | 'workspace-invite'
  | 'payment-confirmation'
  | 'password-reset';

export interface WelcomeData {
  name: string;
  workspace_name: string;
  login_url: string;
}

export interface TemplatePurchaseReceiptData {
  buyer_name: string;
  template_name: string;
  amount_kobo: number;
  transaction_ref: string;
  purchase_date: string;
}

export interface WorkspaceInviteData {
  inviter_name: string;
  workspace_name: string;
  invite_url: string;
  expires_in_hours?: number;
}

export interface PaymentConfirmationData {
  payer_name: string;
  amount_kobo: number;
  transaction_ref: string;
  plan_name?: string;
  payment_date: string;
}

export interface PasswordResetData {
  name: string;
  reset_url: string;
  expires_in_hours: number;
}

export type TemplateData<T extends EmailTemplate> =
  T extends 'welcome' ? WelcomeData :
  T extends 'template-purchase-receipt' ? TemplatePurchaseReceiptData :
  T extends 'workspace-invite' ? WorkspaceInviteData :
  T extends 'payment-confirmation' ? PaymentConfirmationData :
  T extends 'password-reset' ? PasswordResetData :
  never;

const FROM_ADDRESS = 'WebWaka <noreply@webwaka.com>';

// ---------------------------------------------------------------------------
// Template renderers (plain HTML — no template engine required)
// ---------------------------------------------------------------------------

function renderWelcome(data: WelcomeData): { subject: string; html: string } {
  return {
    subject: `Welcome to ${data.workspace_name} on WebWaka`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#006400">Welcome to WebWaka, ${data.name}!</h2>
        <p>Your workspace <strong>${data.workspace_name}</strong> is ready.</p>
        <p><a href="${data.login_url}" style="background:#006400;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none">Log in to your workspace</a></p>
        <p style="color:#6b7280;font-size:0.875rem">WebWaka — Built for Africa</p>
      </div>`,
  };
}

function renderPurchaseReceipt(data: TemplatePurchaseReceiptData): { subject: string; html: string } {
  const amountNGN = (data.amount_kobo / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
  return {
    subject: `Your WebWaka Template Purchase — ${data.template_name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#006400">Purchase Confirmed</h2>
        <p>Hi ${data.buyer_name}, your purchase was successful.</p>
        <table style="width:100%;border-collapse:collapse;margin:1rem 0">
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Template</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${data.template_name}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Amount</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${amountNGN}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Reference</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${data.transaction_ref}</td></tr>
          <tr><td style="padding:8px"><strong>Date</strong></td><td style="padding:8px">${data.purchase_date}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:0.875rem">WebWaka — Built for Africa</p>
      </div>`,
  };
}

function renderWorkspaceInvite(data: WorkspaceInviteData): { subject: string; html: string } {
  return {
    subject: `${data.inviter_name} invited you to ${data.workspace_name} on WebWaka`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#006400">You're invited!</h2>
        <p><strong>${data.inviter_name}</strong> has invited you to join <strong>${data.workspace_name}</strong> on WebWaka.</p>
        ${data.expires_in_hours ? `<p>This invitation expires in ${data.expires_in_hours} hours.</p>` : ''}
        <p><a href="${data.invite_url}" style="background:#006400;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none">Accept Invitation</a></p>
        <p style="color:#6b7280;font-size:0.875rem">WebWaka — Built for Africa</p>
      </div>`,
  };
}

function renderPaymentConfirmation(data: PaymentConfirmationData): { subject: string; html: string } {
  const amountNGN = (data.amount_kobo / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
  return {
    subject: `Payment Confirmed — ${amountNGN}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#006400">Payment Confirmed ✓</h2>
        <p>Hi ${data.payer_name}, your payment has been verified.</p>
        <table style="width:100%;border-collapse:collapse;margin:1rem 0">
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Amount</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${amountNGN}</td></tr>
          ${data.plan_name ? `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Plan</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${data.plan_name}</td></tr>` : ''}
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>Reference</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${data.transaction_ref}</td></tr>
          <tr><td style="padding:8px"><strong>Date</strong></td><td style="padding:8px">${data.payment_date}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:0.875rem">WebWaka — Built for Africa</p>
      </div>`,
  };
}

function renderPasswordReset(data: PasswordResetData): { subject: string; html: string } {
  return {
    subject: 'Reset your WebWaka password',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#006400">Reset your password</h2>
        <p>Hi ${data.name},</p>
        <p>We received a request to reset the password for your WebWaka account. Click the button below to set a new password.</p>
        <p style="margin:28px 0">
          <a href="${data.reset_url}"
             style="background:#0F4C81;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">
            Reset my password
          </a>
        </p>
        <p style="color:#6b7280;font-size:0.875rem">
          This link expires in <strong>${data.expires_in_hours} hour${data.expires_in_hours !== 1 ? 's' : ''}</strong>.
          If you did not request a password reset, you can safely ignore this email — your password will not change.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
        <p style="color:#9ca3af;font-size:0.75rem">
          If the button above does not work, copy and paste this URL into your browser:<br />
          <span style="word-break:break-all;color:#0F4C81">${data.reset_url}</span>
        </p>
        <p style="color:#6b7280;font-size:0.875rem">WebWaka — Built for Africa</p>
      </div>`,
  };
}

// ---------------------------------------------------------------------------
// Resend API client
// ---------------------------------------------------------------------------

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export class EmailService {
  constructor(private readonly apiKey: string | undefined) {}

  /**
   * Send a transactional email using the given template.
   * If RESEND_API_KEY is not configured, the email is silently skipped
   * (development mode) and a warning is returned.
   */
  async sendTransactional<T extends EmailTemplate>(
    to: string,
    template: T,
    data: TemplateData<T>,
  ): Promise<SendResult> {
    if (!this.apiKey) {
      return { ok: true, id: 'dev-skipped', error: 'RESEND_API_KEY not set — email skipped in dev' };
    }

    let rendered: { subject: string; html: string };

    switch (template) {
      case 'welcome':
        rendered = renderWelcome(data as WelcomeData);
        break;
      case 'template-purchase-receipt':
        rendered = renderPurchaseReceipt(data as TemplatePurchaseReceiptData);
        break;
      case 'workspace-invite':
        rendered = renderWorkspaceInvite(data as WorkspaceInviteData);
        break;
      case 'payment-confirmation':
        rendered = renderPaymentConfirmation(data as PaymentConfirmationData);
        break;
      case 'password-reset':
        rendered = renderPasswordReset(data as PasswordResetData);
        break;
      default:
        return { ok: false, error: `Unknown template: ${String(template)}` };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [to],
          subject: rendered.subject,
          html: rendered.html,
        }),
      });

      if (res.ok) {
        const json = await res.json() as { id?: string };
        return { ok: true, id: json.id };
      }

      const errBody = await res.text();
      return { ok: false, error: `Resend API error ${res.status}: ${errBody}` };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'network error' };
    }
  }
}
