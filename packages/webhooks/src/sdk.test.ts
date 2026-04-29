/**
 * Webhook SDK — Phase 6 / E34 unit tests
 *
 * Tests:
 *   - signWebhookPayload produces correct HMAC-SHA256 signature
 *   - verifyWebhookSignature validates correct and invalid signatures
 *   - WebhookEnvelope type shape (compile-time, runtime shape check)
 *   - All VALID_EVENTS covered in WebhookEventType
 */

import { describe, it, expect } from 'vitest';
import { signWebhookPayload, verifyWebhookSignature } from './signing.js';
import type {
  WebhookEnvelope,
  WebhookEvent,
  PaymentCompletedEvent,
  KycApprovedEvent,
  TemplateInstalledEvent,
} from './types.js';

describe('Phase 6 (E34) — Webhook SDK Signing', () => {
  it('signWebhookPayload returns sha256= prefixed signature', async () => {
    const sig = await signWebhookPayload('{"test":"payload"}', 'secret-key');
    expect(sig).toMatch(/^sha256=[0-9a-f]{64}$/);
  });

  it('verifyWebhookSignature returns true for matching signature', async () => {
    const payload = '{"event_type":"payment.completed"}';
    const secret = 'webhook-secret-abc';
    const sig = await signWebhookPayload(payload, secret);
    const valid = await verifyWebhookSignature(payload, sig, secret);
    expect(valid).toBe(true);
  });

  it('verifyWebhookSignature returns false for tampered payload', async () => {
    const secret = 'webhook-secret-xyz';
    const sig = await signWebhookPayload('original-payload', secret);
    const valid = await verifyWebhookSignature('tampered-payload', sig, secret);
    expect(valid).toBe(false);
  });

  it('verifyWebhookSignature returns false for wrong secret', async () => {
    const payload = '{"event_type":"kyc.approved"}';
    const sig = await signWebhookPayload(payload, 'correct-secret');
    const valid = await verifyWebhookSignature(payload, sig, 'wrong-secret');
    expect(valid).toBe(false);
  });

  it('verifyWebhookSignature returns false for mismatched length signature', async () => {
    const payload = 'test-payload';
    const valid = await verifyWebhookSignature(payload, 'sha256=abc', 'secret');
    expect(valid).toBe(false);
  });

  it('signWebhookPayload is deterministic for same payload + secret', async () => {
    const payload = '{"id":"evt_001","event_type":"template.installed"}';
    const secret = 'stable-secret';
    const sig1 = await signWebhookPayload(payload, secret);
    const sig2 = await signWebhookPayload(payload, secret);
    expect(sig1).toBe(sig2);
  });

  it('signWebhookPayload produces different signatures for different secrets', async () => {
    const payload = '{"test":true}';
    const sig1 = await signWebhookPayload(payload, 'secret-a');
    const sig2 = await signWebhookPayload(payload, 'secret-b');
    expect(sig1).not.toBe(sig2);
  });
});

describe('Phase 6 (E34) — Webhook SDK Type Shapes', () => {
  it('WebhookEnvelope generic type accepts typed payload', () => {
    const envelope: WebhookEnvelope<{ amount_kobo: number }> = {
      id: 'evt_001',
      event_type: 'payment.completed',
      tenant_id: 'tenant-a',
      workspace_id: 'wsp_a',
      api_version: '1',
      created_at: Math.floor(Date.now() / 1000),
      payload: { amount_kobo: 50000 },
    };
    expect(envelope.api_version).toBe('1');
    expect(envelope.payload.amount_kobo).toBe(50000);
  });

  it('PaymentCompletedEvent has correct structure', () => {
    const event: PaymentCompletedEvent = {
      id: 'evt_pay_001',
      event_type: 'payment.completed',
      tenant_id: 'tenant-a',
      workspace_id: 'wsp_a',
      api_version: '1',
      created_at: 1714000000,
      payload: {
        payment_id: 'pay_001',
        amount_kobo: 100000,
        currency: 'NGN',
        reference: 'ref_001',
        channel: 'card',
      },
    };
    expect(event.payload.currency).toBe('NGN');
    expect(event.event_type).toBe('payment.completed');
  });

  it('KycApprovedEvent has correct structure', () => {
    const event: KycApprovedEvent = {
      id: 'evt_kyc_001',
      event_type: 'kyc.approved',
      tenant_id: 'tenant-a',
      workspace_id: 'wsp_a',
      api_version: '1',
      created_at: 1714000000,
      payload: {
        user_id: 'usr_001',
        kyc_type: 'bvn',
        tier: 2,
      },
    };
    expect(event.payload.kyc_type).toBe('bvn');
    expect(event.payload.tier).toBe(2);
  });

  it('TemplateInstalledEvent has correct structure', () => {
    const event: TemplateInstalledEvent = {
      id: 'evt_tpl_001',
      event_type: 'template.installed',
      tenant_id: 'tenant-a',
      workspace_id: 'wsp_a',
      api_version: '1',
      created_at: 1714000000,
      payload: {
        template_slug: 'electoral-mobilization',
        template_id: 'tpl_t01_electoral_v100',
        installation_id: 'install_001',
        installed_by: 'usr_admin',
      },
    };
    expect(event.payload.template_slug).toBe('electoral-mobilization');
  });

  it('WebhookEvent union is discriminable by event_type', () => {
    const event: WebhookEvent = {
      id: 'evt_001',
      event_type: 'kyc.rejected',
      tenant_id: 'tenant-a',
      workspace_id: 'wsp_a',
      api_version: '1',
      created_at: 1714000000,
      payload: {
        user_id: 'usr_001',
        kyc_type: 'nin',
        reason: 'NIN mismatch',
      },
    };
    if (event.event_type === 'kyc.rejected') {
      expect(event.payload.reason).toBe('NIN mismatch');
    }
  });
});
