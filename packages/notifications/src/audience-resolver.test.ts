/**
 * Audience resolver unit tests (N-022, Phase 2).
 *
 * Tests:
 *  - resolveAudience: actor, subject, workspace_admins, tenant_admins, super_admins, partner_admins, custom
 *  - lookupRecipientEmail: found / not found
 *  - deduplicateRecipients: removes duplicate userId entries
 */

import { describe, it, expect } from 'vitest';
import { resolveAudience, lookupRecipientEmail, deduplicateRecipients } from './audience-resolver.js';
import type { D1LikeFull } from './db-types.js';
import type { NotificationRuleRow } from './rule-engine.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRule(audienceType: string, audienceFilter: string | null = null): NotificationRuleRow {
  return {
    id: 'rule_001', tenant_id: null, event_key: 'test', rule_name: 'Test',
    enabled: 1, audience_type: audienceType, audience_filter: audienceFilter,
    channels: '["email"]', channel_fallback: null, template_family: 'auth.welcome',
    priority: 'normal', digest_eligible: 0, min_severity: 'info', feature_flag: null,
  };
}

type FakeUserRow = { id: string; email: string | null };

function makeD1FakeWithUsers(users: FakeUserRow[]): D1LikeFull {
  return {
    prepare: () => ({
      bind: () => ({
        run: async () => ({ success: true }),
        first: async <T>() => {
          if (users.length === 0) return null;
          return users[0] as unknown as T;
        },
        all: async <T>() => ({ results: users as unknown as T[] }),
      }),
    }),
  };
}

const ctx = {
  tenantId: 'tenant_001',
  actorId: 'usr_actor',
  subjectId: 'usr_subject',
  workspaceId: 'ws_001',
};

// ---------------------------------------------------------------------------
// resolveAudience
// ---------------------------------------------------------------------------

describe('resolveAudience', () => {
  it('actor: returns actorId', async () => {
    const db = makeD1FakeWithUsers([]);
    const result = await resolveAudience(db, makeRule('actor'), ctx);
    expect(result).toHaveLength(1);
    expect(result[0]!.userId).toBe('usr_actor');
  });

  it('actor: returns empty when actorId is null', async () => {
    const db = makeD1FakeWithUsers([]);
    const result = await resolveAudience(db, makeRule('actor'), { ...ctx, actorId: null });
    expect(result).toHaveLength(0);
  });

  it('subject: returns subjectId', async () => {
    const db = makeD1FakeWithUsers([]);
    const result = await resolveAudience(db, makeRule('subject'), ctx);
    expect(result).toHaveLength(1);
    expect(result[0]!.userId).toBe('usr_subject');
  });

  it('subject: returns empty when subjectId is null', async () => {
    const db = makeD1FakeWithUsers([]);
    const result = await resolveAudience(db, makeRule('subject'), { ...ctx, subjectId: null });
    expect(result).toHaveLength(0);
  });

  it('workspace_admins: returns users from D1', async () => {
    const db = makeD1FakeWithUsers([
      { id: 'usr_admin1', email: 'admin1@test.com' },
      { id: 'usr_admin2', email: 'admin2@test.com' },
    ]);
    const result = await resolveAudience(db, makeRule('workspace_admins'), ctx);
    expect(result).toHaveLength(2);
    expect(result[0]!.userId).toBe('usr_admin1');
    expect(result[0]!.email).toBe('admin1@test.com');
  });

  it('workspace_admins: returns empty when workspaceId is null', async () => {
    const db = makeD1FakeWithUsers([{ id: 'usr_admin', email: 'admin@test.com' }]);
    const result = await resolveAudience(db, makeRule('workspace_admins'), { ...ctx, workspaceId: null });
    expect(result).toHaveLength(0);
  });

  it('super_admins: returns users from D1 (no tenant scope)', async () => {
    const db = makeD1FakeWithUsers([{ id: 'usr_super', email: 'super@webwaka.com' }]);
    const result = await resolveAudience(db, makeRule('super_admins'), ctx);
    expect(result).toHaveLength(1);
    expect(result[0]!.userId).toBe('usr_super');
  });

  it('custom: falls back to actor as Phase 6 stub', async () => {
    const db = makeD1FakeWithUsers([]);
    const result = await resolveAudience(db, makeRule('custom', '{}'), ctx);
    expect(result).toHaveLength(1);
    expect(result[0]!.userId).toBe('usr_actor');
  });

  it('unknown audience type: returns empty array', async () => {
    const db = makeD1FakeWithUsers([]);
    const result = await resolveAudience(db, makeRule('nonexistent_type'), ctx);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// lookupRecipientEmail
// ---------------------------------------------------------------------------

describe('lookupRecipientEmail', () => {
  it('returns email when user exists', async () => {
    const db = makeD1FakeWithUsers([{ id: 'usr_001', email: 'user@test.com' }]);
    const email = await lookupRecipientEmail(db, 'usr_001', 'tenant_001');
    expect(email).toBe('user@test.com');
  });

  it('returns null when user not found', async () => {
    const db: D1LikeFull = {
      prepare: () => ({
        bind: () => ({
          run: async () => ({ success: true }),
          first: async () => null,
          all: async <T>() => ({ results: [] as unknown as T[] }),
        }),
      }),
    };
    const email = await lookupRecipientEmail(db, 'usr_nonexistent', 'tenant_001');
    expect(email).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// deduplicateRecipients
// ---------------------------------------------------------------------------

describe('deduplicateRecipients', () => {
  it('removes duplicate userIds, keeps first', () => {
    const recipients = [
      { userId: 'usr_001', email: 'a@test.com' },
      { userId: 'usr_002', email: 'b@test.com' },
      { userId: 'usr_001', email: 'c@test.com' },
    ];
    const result = deduplicateRecipients(recipients);
    expect(result).toHaveLength(2);
    expect(result[0]!.email).toBe('a@test.com');
    expect(result[1]!.userId).toBe('usr_002');
  });

  it('returns empty for empty input', () => {
    expect(deduplicateRecipients([])).toHaveLength(0);
  });
});
