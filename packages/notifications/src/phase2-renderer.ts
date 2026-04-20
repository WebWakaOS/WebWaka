/**
 * @webwaka/notifications — Phase 2 template renderer.
 *
 * Maps template_family + channel + event payload → { subject, html, title, body }.
 *
 * Phase 2 ONLY: This renderer hard-codes a minimal set of templates to bridge
 * the gap before Phase 3 (N-030–N-039) builds the full ITemplateRenderer with
 * tenant-override, locale selection (G18), and variable schema validation (G14).
 *
 * Template families handled (matching seeded platform rules in 0269 + 0274):
 *   auth.welcome           — user registered (email: welcome HTML; in_app: welcome msg)
 *   auth.password_reset    — password reset link
 *   auth.account_locked    — account locked security alert
 *   auth.workspace_invite  — workspace invitation
 *   auth.email_verification — email verification link
 *
 * G14 is partially enforced: required variables return a fallback if missing
 * (prefer graceful degradation over hard failure in Phase 2; Phase 3 adds strict schema).
 *
 * In Phase 3, this file is replaced by the full ITemplateRenderer implementation.
 */

import type { RenderedTemplate } from './types.js';

const PLATFORM_FROM = 'WebWaka <noreply@webwaka.com>';

// ---------------------------------------------------------------------------
// Phase2RenderedOutput
// ---------------------------------------------------------------------------

export interface Phase2RenderedOutput {
  subject: string;
  html: string;
  inAppTitle: string;
  inAppBody: string;
  fromAddress: string;
}

// ---------------------------------------------------------------------------
// renderForEmail — HTML email per template family
// ---------------------------------------------------------------------------

function renderForEmail(
  templateFamily: string,
  variables: Record<string, unknown>,
): { subject: string; html: string } {
  const s = (key: string, fallback = '') =>
    typeof variables[key] === 'string' ? (variables[key] as string) : fallback;
  const n = (key: string, fallback = 0) =>
    typeof variables[key] === 'number' ? (variables[key] as number) : fallback;

  switch (templateFamily) {
    case 'auth.welcome': {
      const name = s('name', 'there');
      const workspaceName = s('workspace_name', 'your workspace');
      const loginUrl = s('login_url', '#');
      return {
        subject: `Welcome to ${workspaceName} on WebWaka`,
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2 style="color:#006400">Welcome to WebWaka, ${name}!</h2>
  <p>Your workspace <strong>${workspaceName}</strong> is ready.</p>
  <p><a href="${loginUrl}" style="background:#006400;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none">Log in to your workspace</a></p>
  <p style="color:#6b7280;font-size:0.875rem">WebWaka — Built for Africa</p>
</div>`.trim(),
      };
    }

    case 'auth.password_reset': {
      const name = s('name', 'there');
      const resetUrl = s('reset_url', '#');
      const expiresHours = n('expires_in_hours', 1);
      return {
        subject: 'Reset your WebWaka password',
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2 style="color:#006400">Reset your password</h2>
  <p>Hi ${name},</p>
  <p>We received a request to reset the password for your WebWaka account.</p>
  <p style="margin:28px 0">
    <a href="${resetUrl}" style="background:#0F4C81;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">Reset my password</a>
  </p>
  <p style="color:#6b7280;font-size:0.875rem">
    This link expires in <strong>${expiresHours} hour${expiresHours !== 1 ? 's' : ''}</strong>.
    If you did not request a password reset, you can safely ignore this email.
  </p>
  <p style="color:#6b7280;font-size:0.875rem">WebWaka — Built for Africa</p>
</div>`.trim(),
      };
    }

    case 'auth.account_locked': {
      const name = s('name', 'there');
      const supportUrl = s('support_url', 'https://webwaka.com/support');
      return {
        subject: 'Your WebWaka account has been locked',
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2 style="color:#dc2626">Account Locked</h2>
  <p>Hi ${name},</p>
  <p>Your WebWaka account has been locked due to multiple failed login attempts.</p>
  <p>If this was you, please <a href="${supportUrl}">contact support</a> to unlock your account.</p>
  <p>If you did not attempt to log in, please change your password immediately.</p>
  <p style="color:#6b7280;font-size:0.875rem">WebWaka — Built for Africa</p>
</div>`.trim(),
      };
    }

    case 'auth.workspace_invite': {
      const inviterName = s('inviter_name', 'Someone');
      const workspaceName = s('workspace_name', 'a workspace');
      const inviteUrl = s('invite_url', '#');
      const expiresHours = n('expires_in_hours', 24);
      return {
        subject: `${inviterName} invited you to ${workspaceName} on WebWaka`,
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2 style="color:#006400">You're invited!</h2>
  <p><strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> on WebWaka.</p>
  ${expiresHours ? `<p>This invitation expires in ${expiresHours} hours.</p>` : ''}
  <p><a href="${inviteUrl}" style="background:#006400;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none">Accept Invitation</a></p>
  <p style="color:#6b7280;font-size:0.875rem">WebWaka — Built for Africa</p>
</div>`.trim(),
      };
    }

    case 'auth.email_verification': {
      const name = s('name', 'there');
      const verifyUrl = s('verify_url', '#');
      const expiresHours = n('expires_in_hours', 24);
      return {
        subject: 'Verify your WebWaka email address',
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2 style="color:#0F4C81">Verify your email address</h2>
  <p>Hi ${name},</p>
  <p>Please verify your email address to complete your WebWaka account setup.</p>
  <p style="margin:28px 0">
    <a href="${verifyUrl}" style="background:#0F4C81;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">Verify my email</a>
  </p>
  <p style="color:#6b7280;font-size:0.875rem">
    This link expires in <strong>${expiresHours} hour${expiresHours !== 1 ? 's' : ''}</strong>.
    If you did not sign up for WebWaka, you can safely ignore this email.
  </p>
  <p style="color:#6b7280;font-size:0.875rem">WebWaka — Built for Africa</p>
</div>`.trim(),
      };
    }

    default:
      // Fallback: generic notification (Phase 3 will cover all families)
      return {
        subject: 'A notification from WebWaka',
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><p>You have a new notification from WebWaka.</p></div>`,
      };
  }
}

// ---------------------------------------------------------------------------
// renderForInApp — title + body text
// ---------------------------------------------------------------------------

function renderForInApp(
  templateFamily: string,
  variables: Record<string, unknown>,
): { title: string; body: string } {
  const s = (key: string, fallback = '') =>
    typeof variables[key] === 'string' ? (variables[key] as string) : fallback;

  switch (templateFamily) {
    case 'auth.welcome':
      return {
        title: 'Welcome to WebWaka!',
        body: `Your workspace ${s('workspace_name', '')} is ready. Start exploring.`.trim(),
      };
    case 'auth.password_reset':
      return {
        title: 'Password reset requested',
        body: 'A password reset link has been sent to your email.',
      };
    case 'auth.account_locked':
      return {
        title: 'Account locked',
        body: 'Your account was locked due to multiple failed login attempts. Contact support.',
      };
    case 'auth.workspace_invite':
      return {
        title: 'Workspace invitation',
        body: `You have been invited to join ${s('workspace_name', 'a workspace')} on WebWaka.`,
      };
    case 'auth.email_verification':
      return {
        title: 'Verify your email',
        body: 'Please check your email to verify your WebWaka account.',
      };
    default:
      return {
        title: 'New notification',
        body: 'You have a new notification from WebWaka.',
      };
  }
}

// ---------------------------------------------------------------------------
// renderPhase2 — main entry point
// ---------------------------------------------------------------------------

/**
 * Render a notification for Phase 2 channels (email + in_app).
 *
 * Returns a Phase2RenderedOutput with:
 *   - subject + html  (for email channel)
 *   - inAppTitle + inAppBody  (for in_app channel)
 *
 * @param templateFamily - e.g. 'auth.welcome', 'auth.password_reset'
 * @param variables      - event payload variables passed from NotificationService
 * @returns              - Phase2RenderedOutput with all channel renderings
 */
export function renderPhase2(
  templateFamily: string,
  variables: Record<string, unknown>,
): Phase2RenderedOutput {
  const email = renderForEmail(templateFamily, variables);
  const inApp = renderForInApp(templateFamily, variables);

  return {
    subject: email.subject,
    html: email.html,
    inAppTitle: inApp.title,
    inAppBody: inApp.body,
    fromAddress: PLATFORM_FROM,
  };
}

// ---------------------------------------------------------------------------
// buildRenderedTemplate — construct RenderedTemplate for a channel
// ---------------------------------------------------------------------------

/**
 * Build a RenderedTemplate from Phase2RenderedOutput for a specific channel.
 * Used by NotificationService when populating DispatchContext.template.
 */
export function buildRenderedTemplate(
  output: Phase2RenderedOutput,
  channel: string,
  templateFamily: string,
): RenderedTemplate {
  if (channel === 'in_app') {
    return {
      subject: output.inAppTitle,
      body: output.inAppBody,
      locale: 'en',
      templateId: templateFamily,
      templateVersion: 1,
    };
  }
  // email (and future channels)
  return {
    subject: output.subject,
    body: output.html,
    locale: 'en',
    templateId: templateFamily,
    templateVersion: 1,
  };
}
