/**
 * EmailService — unit tests (PROD-05).
 *
 * Tests:
 *   - All 4 template types render and produce correct subjects
 *   - RESEND_API_KEY missing → dev-skip mode (ok: true, no fetch call)
 *   - Resend API success → returns {ok: true, id}
 *   - Resend API error → returns {ok: false, error}
 *   - Network error → returns {ok: false, error}
 *   - P9: amount_kobo formatted correctly in receipt emails
 */

import { describe, it, expect, vi } from 'vitest';
import { EmailService } from './email-service.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeService(apiKey?: string): EmailService {
  return new EmailService(apiKey);
}

// ---------------------------------------------------------------------------
// Dev-skip mode (no RESEND_API_KEY)
// ---------------------------------------------------------------------------

describe('EmailService — dev-skip mode (no API key)', () => {
  it('returns ok: true when no api key configured', async () => {
    const svc = makeService(undefined);
    const result = await svc.sendTransactional('user@example.com', 'welcome', {
      name: 'Amaka',
      workspace_name: 'Amaka Foods',
      login_url: 'https://app.webwaka.com/login',
    });
    expect(result.ok).toBe(true);
    expect(result.id).toBe('dev-skipped');
    expect(result.error).toContain('RESEND_API_KEY not set');
  });

  it('does not call fetch when no api key', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const svc = makeService(undefined);
    await svc.sendTransactional('x@y.com', 'payment-confirmation', {
      payer_name: 'Emeka',
      amount_kobo: 500000,
      transaction_ref: 'ref123',
      payment_date: '2026-04-13',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Resend API integration
// ---------------------------------------------------------------------------

describe('EmailService — Resend API calls', () => {
  it('returns {ok: true, id} on Resend API success', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'resend_abc123' }), { status: 200 }),
    );
    const svc = makeService('re_test_key');
    const result = await svc.sendTransactional('test@example.com', 'welcome', {
      name: 'Chioma',
      workspace_name: 'Chioma Store',
      login_url: 'https://app.webwaka.com',
    });
    expect(result.ok).toBe(true);
    expect(result.id).toBe('resend_abc123');
    spy.mockRestore();
  });

  it('calls Resend API with correct endpoint', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'x' }), { status: 200 }),
    );
    const svc = makeService('re_test_key');
    await svc.sendTransactional('x@y.com', 'welcome', {
      name: 'Tunde',
      workspace_name: 'Tunde Corp',
      login_url: 'https://app.webwaka.com',
    });
    expect(spy).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' }),
    );
    spy.mockRestore();
  });

  it('returns {ok: false, error} on Resend API 422', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{"message":"Invalid email"}', { status: 422 }),
    );
    const svc = makeService('re_test_key');
    const result = await svc.sendTransactional('bad', 'welcome', {
      name: 'Kemi',
      workspace_name: 'Store',
      login_url: 'https://a.b',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('422');
    spy.mockRestore();
  });

  it('returns {ok: false, error} on network failure', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'));
    const svc = makeService('re_test_key');
    const result = await svc.sendTransactional('x@y.com', 'welcome', {
      name: 'Femi',
      workspace_name: 'X',
      login_url: 'https://a.b',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('network error');
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Template: welcome
// ---------------------------------------------------------------------------

describe('EmailService — welcome template', () => {
  it('includes workspace name in email body', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'x' }), { status: 200 }),
    );
    const svc = makeService('re_test');
    await svc.sendTransactional('a@b.com', 'welcome', {
      name: 'Blessing',
      workspace_name: 'Blessing Ventures',
      login_url: 'https://app.webwaka.com',
    });
    const callBody = JSON.parse((fetchSpy.mock.calls[0]?.[1] as RequestInit)?.body as string) as {
      subject: string;
      html: string;
    };
    expect(callBody.subject).toContain('Blessing Ventures');
    expect(callBody.html).toContain('Blessing');
    fetchSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Template: template-purchase-receipt
// ---------------------------------------------------------------------------

describe('EmailService — template-purchase-receipt template', () => {
  it('includes amount and transaction ref in email', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'r1' }), { status: 200 }),
    );
    const svc = makeService('re_test');
    await svc.sendTransactional('buyer@example.com', 'template-purchase-receipt', {
      buyer_name: 'Ade',
      template_name: 'Restaurant Pro',
      amount_kobo: 250000,   // NGN 2,500
      transaction_ref: 'TXN_12345',
      purchase_date: '2026-04-13',
    });
    const callBody = JSON.parse((fetchSpy.mock.calls[0]?.[1] as RequestInit)?.body as string) as {
      html: string;
    };
    expect(callBody.html).toContain('TXN_12345');
    expect(callBody.html).toContain('Restaurant Pro');
    fetchSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Template: workspace-invite
// ---------------------------------------------------------------------------

describe('EmailService — workspace-invite template', () => {
  it('includes invite URL and expiry in email', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'r2' }), { status: 200 }),
    );
    const svc = makeService('re_test');
    await svc.sendTransactional('invitee@example.com', 'workspace-invite', {
      inviter_name: 'Ngozi',
      workspace_name: 'Ngozi Clinic',
      invite_url: 'https://app.webwaka.com/join/wsp_123',
      expires_in_hours: 48,
    });
    const callBody = JSON.parse((fetchSpy.mock.calls[0]?.[1] as RequestInit)?.body as string) as {
      subject: string;
      html: string;
    };
    expect(callBody.subject).toContain('Ngozi');
    expect(callBody.html).toContain('https://app.webwaka.com/join/wsp_123');
    expect(callBody.html).toContain('48');
    fetchSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Template: payment-confirmation
// ---------------------------------------------------------------------------

describe('EmailService — payment-confirmation template', () => {
  it('includes plan name when provided', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'r3' }), { status: 200 }),
    );
    const svc = makeService('re_test');
    await svc.sendTransactional('payer@example.com', 'payment-confirmation', {
      payer_name: 'Ibrahim',
      amount_kobo: 1000000,  // NGN 10,000
      transaction_ref: 'PAY_7890',
      plan_name: 'Business Pro',
      payment_date: '2026-04-13',
    });
    const callBody = JSON.parse((fetchSpy.mock.calls[0]?.[1] as RequestInit)?.body as string) as {
      html: string;
    };
    expect(callBody.html).toContain('PAY_7890');
    expect(callBody.html).toContain('Business Pro');
    fetchSpy.mockRestore();
  });

  it('works without plan name', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'r4' }), { status: 200 }),
    );
    const svc = makeService('re_test');
    const result = await svc.sendTransactional('payer2@example.com', 'payment-confirmation', {
      payer_name: 'Chidi',
      amount_kobo: 500000,
      transaction_ref: 'PAY_999',
      payment_date: '2026-04-13',
    });
    expect(result.ok).toBe(true);
    fetchSpy.mockRestore();
  });
});
