/**
 * @webwaka/groups — Unit tests
 *
 * Phase 0 rename from support-groups.test.ts.
 * 24 tests covering entitlements, repository functions, and invariant boundaries.
 *
 * All DB operations use a mock D1 — no live DB needed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  GroupEntitlements,
  FREE_GROUP_ENTITLEMENTS,
  STARTER_GROUP_ENTITLEMENTS,
  GROWTH_GROUP_ENTITLEMENTS,
  PRO_GROUP_ENTITLEMENTS,
  ENTERPRISE_GROUP_ENTITLEMENTS,
  assertMaxGroups,
  assertBroadcastEnabled,
  assertBroadcastChannel,
  assertGotvEnabled,
  assertHierarchyEnabled,
  assertAnalyticsEnabled,
} from './entitlements.js';

import {
  createGroup,
  joinGroup,
  createMeeting,
  createBroadcast,
  createGroupEvent,
  createPetition,
  signPetition,
  getGroupAnalytics,
  D1Like,
} from './repository.js';

// ---------------------------------------------------------------------------
// Mock D1
// ---------------------------------------------------------------------------

function makeMockDb(overrides: Partial<{
  run: () => Promise<{ success: boolean }>;
  first: <T>() => Promise<T | null>;
  all: <T>() => Promise<{ results: T[] }>;
}> = {}): D1Like {
  const bound = {
    run: overrides.run ?? (async () => ({ success: true })),
    first: overrides.first ?? (async () => null),
    all: overrides.all ?? (async () => ({ results: [] })),
  };
  return {
    prepare: () => ({
      bind: () => bound,
      first: bound.first as <T>() => Promise<T | null>,
      all: bound.all as <T>() => Promise<{ results: T[] }>,
    }),
  } as unknown as D1Like;
}

// ---------------------------------------------------------------------------
// Entitlement tests (15)
// ---------------------------------------------------------------------------

describe('GroupEntitlements — plan constants', () => {
  it('FREE plan: maxGroups=1, no broadcasts, no GOTV', () => {
    expect(FREE_GROUP_ENTITLEMENTS.maxGroups).toBe(1);
    expect(FREE_GROUP_ENTITLEMENTS.broadcastEnabled).toBe(false);
    expect(FREE_GROUP_ENTITLEMENTS.gotvEnabled).toBe(false);
    expect(FREE_GROUP_ENTITLEMENTS.aiAssistEnabled).toBe(false);
  });

  it('STARTER plan: can broadcast via in_app and sms', () => {
    expect(STARTER_GROUP_ENTITLEMENTS.broadcastEnabled).toBe(true);
    expect(STARTER_GROUP_ENTITLEMENTS.broadcastChannels).toContain('in_app');
    expect(STARTER_GROUP_ENTITLEMENTS.broadcastChannels).toContain('sms');
    expect(STARTER_GROUP_ENTITLEMENTS.broadcastChannels).not.toContain('whatsapp');
  });

  it('GROWTH plan: hierarchy enabled, analytics enabled', () => {
    expect(GROWTH_GROUP_ENTITLEMENTS.hierarchyEnabled).toBe(true);
    expect(GROWTH_GROUP_ENTITLEMENTS.analyticsEnabled).toBe(true);
    expect(GROWTH_GROUP_ENTITLEMENTS.committeeEnabled).toBe(true);
  });

  it('PRO plan: AI assist enabled', () => {
    expect(PRO_GROUP_ENTITLEMENTS.aiAssistEnabled).toBe(true);
    expect(PRO_GROUP_ENTITLEMENTS.broadcastChannels).toContain('whatsapp');
  });

  it('ENTERPRISE plan: unlimited groups', () => {
    expect(ENTERPRISE_GROUP_ENTITLEMENTS.maxGroups).toBe(-1);
    expect(ENTERPRISE_GROUP_ENTITLEMENTS.broadcastChannels).toContain('ussd_push');
  });
});

describe('GroupEntitlements — assertion guards', () => {
  it('assertMaxGroups throws for FREE at group count 1', () => {
    expect(() => assertMaxGroups(1, FREE_GROUP_ENTITLEMENTS)).toThrow('ENTITLEMENT_DENIED');
  });

  it('assertMaxGroups does not throw for FREE at count 0', () => {
    expect(() => assertMaxGroups(0, FREE_GROUP_ENTITLEMENTS)).not.toThrow();
  });

  it('assertBroadcastEnabled throws for FREE plan', () => {
    expect(() => assertBroadcastEnabled(FREE_GROUP_ENTITLEMENTS)).toThrow('ENTITLEMENT_DENIED');
  });

  it('assertBroadcastEnabled does not throw for STARTER plan', () => {
    expect(() => assertBroadcastEnabled(STARTER_GROUP_ENTITLEMENTS)).not.toThrow();
  });

  it('assertBroadcastChannel throws for whatsapp on STARTER plan', () => {
    expect(() => assertBroadcastChannel('whatsapp', STARTER_GROUP_ENTITLEMENTS)).toThrow('ENTITLEMENT_DENIED');
  });

  it('assertBroadcastChannel does not throw for whatsapp on PRO plan', () => {
    expect(() => assertBroadcastChannel('whatsapp', PRO_GROUP_ENTITLEMENTS)).not.toThrow();
  });

  it('assertGotvEnabled throws for FREE plan', () => {
    expect(() => assertGotvEnabled(FREE_GROUP_ENTITLEMENTS)).toThrow('ENTITLEMENT_DENIED');
  });

  it('assertHierarchyEnabled throws for STARTER plan', () => {
    expect(() => assertHierarchyEnabled(STARTER_GROUP_ENTITLEMENTS)).toThrow('ENTITLEMENT_DENIED');
  });

  it('assertAnalyticsEnabled throws for STARTER plan', () => {
    expect(() => assertAnalyticsEnabled(STARTER_GROUP_ENTITLEMENTS)).toThrow('ENTITLEMENT_DENIED');
  });

  it('assertAnalyticsEnabled does not throw for GROWTH plan', () => {
    expect(() => assertAnalyticsEnabled(GROWTH_GROUP_ENTITLEMENTS)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Repository tests (9)
// ---------------------------------------------------------------------------

describe('Repository — group CRUD', () => {
  it('createGroup inserts a group and returns it', async () => {
    const fakeGroup = {
      id: 'grp_abc', workspace_id: 'ws1', tenant_id: 'tn1',
      name: 'Test Group', slug: 'test-group', description: null,
      category: 'civic', hierarchy_level: null, parent_group_id: null,
      place_id: null, state_code: 'LA', lga_code: null, ward_code: null,
      polling_unit_code: null, member_count: 0, volunteer_count: 0,
      visibility: 'public', join_policy: 'open', status: 'active',
      logo_url: null, cover_url: null, constitution_url: null, website_url: null,
      ndpr_consent_required: 0, created_at: 1000, updated_at: 1000,
    };
    const db = makeMockDb({ first: async () => fakeGroup as any });
    const result = await createGroup(db, {
      workspaceId: 'ws1', tenantId: 'tn1', name: 'Test Group', slug: 'test-group',
    });
    expect(result.id).toBe('grp_abc');
    expect(result.category).toBe('civic');
    expect(result.tenantId).toBe('tn1');
  });

  it('joinGroup adds a member and increments group member count', async () => {
    const fakeMember = {
      id: 'gmbr_xyz', group_id: 'grp_abc', workspace_id: 'ws1', tenant_id: 'tn1',
      user_id: 'usr_001', role: 'member', status: 'active',
      ward_code: null, polling_unit_code: null,
      joined_at: 1000, approved_by: null, approved_at: null, ndpr_consented: 1,
    };
    const db = makeMockDb({ first: async () => fakeMember as any });
    const result = await joinGroup(db, {
      groupId: 'grp_abc', workspaceId: 'ws1', tenantId: 'tn1',
      userId: 'usr_001', ndprConsented: true,
    });
    expect(result.id).toBe('gmbr_xyz');
    expect(result.status).toBe('active');
    expect(result.ndprConsented).toBe(true);
  });

  it('createMeeting returns a meeting row', async () => {
    const fakeMeeting = {
      id: 'gmt_001', group_id: 'grp_abc', workspace_id: 'ws1', tenant_id: 'tn1',
      title: 'Ward Meeting', agenda: null, meeting_type: 'general',
      venue: null, place_id: null, starts_at: 2000, ends_at: null,
      is_virtual: 0, join_url: null, status: 'scheduled',
      minutes_url: null, quorum_met: null, attendance: 0,
      created_by: 'usr_001', created_at: 1000,
    };
    const db = makeMockDb({ first: async () => fakeMeeting as any });
    const result = await createMeeting(db, {
      groupId: 'grp_abc', workspaceId: 'ws1', tenantId: 'tn1',
      title: 'Ward Meeting', startsAt: 2000, createdBy: 'usr_001',
    });
    expect(result.id).toBe('gmt_001');
    expect(result.status).toBe('scheduled');
    expect(result.meetingType).toBe('general');
  });

  it('createBroadcast returns a broadcast with queued status', async () => {
    const db = makeMockDb();
    const result = await createBroadcast(db, {
      groupId: 'grp_abc', workspaceId: 'ws1', tenantId: 'tn1',
      senderId: 'usr_001', title: 'Rally Tonight', body: 'Join us at the square.',
      channel: 'sms', audience: 'all',
    });
    expect(result.status).toBe('queued');
    expect(result.channel).toBe('sms');
    expect(result.sentCount).toBe(0);
  });

  it('createGroupEvent returns a scheduled event', async () => {
    const db = makeMockDb();
    const result = await createGroupEvent(db, {
      groupId: 'grp_abc', workspaceId: 'ws1', tenantId: 'tn1',
      title: 'Voter Education Rally', startsAt: 5000, createdBy: 'usr_001',
      eventType: 'rally', isPublic: true,
    });
    expect(result.status).toBe('scheduled');
    expect(result.eventType).toBe('rally');
    expect(result.isPublic).toBe(true);
  });

  it('createPetition returns an open petition', async () => {
    const db = makeMockDb();
    const result = await createPetition(db, {
      groupId: 'grp_abc', workspaceId: 'ws1', tenantId: 'tn1',
      title: 'Fix Our Roads', body: 'We demand road repairs.',
      createdBy: 'usr_001',
    });
    expect(result.status).toBe('open');
    expect(result.signatureCount).toBe(0);
    expect(result.closedAt).toBeNull();
  });

  it('signPetition does not throw with mock DB', async () => {
    const db = makeMockDb();
    await expect(
      signPetition(db, 'gpt_001', 'grp_abc', 'ws1', 'tn1', 'usr_002'),
    ).resolves.not.toThrow();
  });

  it('getGroupAnalytics returns null when no row exists', async () => {
    const db = makeMockDb({ first: async () => null });
    const result = await getGroupAnalytics(db, 'grp_abc', 'tn1', '2025-04-01');
    expect(result).toBeNull();
  });

  it('Group type has no politician_id — electoral fields are in extension table (P4)', () => {
    // This is a type-level architecture test.
    // Group interface MUST NOT have politician_id — that belongs in group_electoral_extensions.
    // Verified by TypeScript compilation: if this imports without error, the interface is clean.
    type HasPoliticianId = 'politician_id' extends keyof import('./types.js').Group ? true : false;
    const check: HasPoliticianId = false as HasPoliticianId;
    expect(check).toBe(false);
  });
});
