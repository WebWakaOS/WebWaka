/**
 * InAppChannel unit tests (N-024, G22, Phase 2).
 */

import { describe, it, expect } from 'vitest';
import { InAppChannel } from './in-app-channel.js';
import type { DispatchContext, RenderedTemplate } from '../types.js';
import type { D1LikeFull } from '../db-types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface CapturedInsert {
  query: string;
  bindings: unknown[];
}

function makeDb(captured: CapturedInsert[]): D1LikeFull {
  return {
    prepare: (query: string) => ({
      bind: (...bindings: unknown[]) => ({
        run: async () => {
          captured.push({ query, bindings });
          return { success: true };
        },
        first: async () => null,
        all: async <T>() => ({ results: [] as unknown as T[] }),
      }),
    }),
  };
}

function makeCtx(overrides: Partial<DispatchContext> = {}): DispatchContext {
  const template: RenderedTemplate = {
    subject: 'Test Title',
    body: 'Test body text',
    locale: 'en',
    templateId: 'auth.welcome',
    templateVersion: 1,
  };

  return {
    deliveryId: 'delivery_test001',
    tenantId: 'tenant_001',
    recipientId: 'usr_001',
    recipientType: 'user',
    channel: 'in_app',
    template,
    idempotencyKey: 'idem_abc123',
    source: 'api',
    severity: 'info',
    sandboxMode: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InAppChannel', () => {
  it('has channel = in_app and providerName = internal', () => {
    const db = makeDb([]);
    const ch = new InAppChannel(db);
    expect(ch.channel).toBe('in_app');
    expect(ch.providerName).toBe('internal');
  });

  it('is always entitled', () => {
    const db = makeDb([]);
    const ch = new InAppChannel(db);
    expect(ch.isEntitled('free')).toBe(true);
    expect(ch.isEntitled('enterprise')).toBe(true);
  });

  it('writes a notification_inbox_item row on dispatch', async () => {
    const captured: CapturedInsert[] = [];
    const db = makeDb(captured);
    const ch = new InAppChannel(db);
    const ctx = makeCtx();

    const result = await ch.dispatch(ctx);

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toMatch(/^inbox_/);
    expect(captured).toHaveLength(1);
    expect(captured[0]!.query).toContain('INSERT INTO notification_inbox_item');
  });

  it('writes tenant_id (G1) and user_id in the INSERT', async () => {
    const captured: CapturedInsert[] = [];
    const db = makeDb(captured);
    const ch = new InAppChannel(db);
    const ctx = makeCtx({ tenantId: 'tenant_xyz', recipientId: 'usr_xyz' });

    await ch.dispatch(ctx);

    const bindings = captured[0]!.bindings;
    // id, tenant_id, user_id, notification_event_id, title, body, cta_url, severity
    expect(bindings[1]).toBe('tenant_xyz');   // tenant_id (G1)
    expect(bindings[2]).toBe('usr_xyz');      // user_id
  });

  it('uses template.subject as title and template.body as body', async () => {
    const captured: CapturedInsert[] = [];
    const db = makeDb(captured);
    const ch = new InAppChannel(db);
    const ctx = makeCtx();
    ctx.template.subject = 'My Title';
    ctx.template.body = 'My Body';

    await ch.dispatch(ctx);

    const bindings = captured[0]!.bindings;
    expect(bindings[4]).toBe('My Title');  // title
    expect(bindings[5]).toBe('My Body');   // body
  });

  it('stores severity from ctx', async () => {
    const captured: CapturedInsert[] = [];
    const db = makeDb(captured);
    const ch = new InAppChannel(db);
    const ctx = makeCtx({ severity: 'critical' });

    await ch.dispatch(ctx);

    const bindings = captured[0]!.bindings;
    // severity is the 8th positional bind
    expect(bindings[7]).toBe('critical');
  });

  it('returns failure when D1 write throws', async () => {
    const db: D1LikeFull = {
      prepare: () => ({
        bind: () => ({
          run: async () => { throw new Error('D1 write error'); },
          first: async () => null,
          all: async <T>() => ({ results: [] as unknown as T[] }),
        }),
      }),
    };
    const ch = new InAppChannel(db);
    const result = await ch.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('D1 write error');
  });
});
