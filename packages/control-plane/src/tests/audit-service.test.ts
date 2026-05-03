import { describe, it, expect, beforeEach } from 'vitest';
import { AuditService } from '../audit-service.js';
import { StubD1 } from './stub-db.js';
import type { ActorContext } from '../types.js';

const ACTOR: ActorContext = {
  actorId: 'user_001',
  actorRole: 'super_admin',
  actorLevel: 'super_admin',
  tenantId: 'tenant_a',
  requestId: 'req_001',
};

describe('AuditService', () => {
  let db: StubD1;
  let svc: AuditService;

  beforeEach(() => {
    db = new StubD1();
    svc = new AuditService(db as never);
  });

  it('log() inserts a record into governance_audit_log', async () => {
    await svc.log(ACTOR, {
      action: 'package.create',
      resourceType: 'subscription_package',
      resourceId: 'pkg_001',
    });
    expect(db.t['governance_audit_log']).toHaveLength(1);
    const row = db.t['governance_audit_log'][0]!;
    expect(row['actor_id']).toBe('user_001');
    expect(row['actor_role']).toBe('super_admin');
    expect(row['actor_level']).toBe('super_admin');
    expect(row['action']).toBe('package.create');
    expect(row['resource_type']).toBe('subscription_package');
    expect(row['resource_id']).toBe('pkg_001');
    expect(row['tenant_id']).toBe('tenant_a');
    expect(row['status']).toBe('success');
  });

  it('log() stores before and after JSON as strings', async () => {
    const before = { name: 'old' };
    const after = { name: 'new' };
    await svc.log(ACTOR, {
      action: 'package.update',
      resourceType: 'subscription_package',
      resourceId: 'pkg_002',
      beforeJson: before,
      afterJson: after,
    });
    const row = db.t['governance_audit_log'][0]!;
    expect(row['before_json']).toBe(JSON.stringify(before));
    expect(row['after_json']).toBe(JSON.stringify(after));
  });

  it('log() records failure status and reason', async () => {
    await svc.log(ACTOR, {
      action: 'delegation.denied',
      resourceType: 'delegation_policy',
      status: 'failure',
      failureReason: 'insufficient privilege',
    });
    const row = db.t['governance_audit_log'][0]!;
    expect(row['status']).toBe('failure');
    expect(row['failure_reason']).toBe('insufficient privilege');
  });

  it('log() records null before_json and after_json when not provided', async () => {
    await svc.log(ACTOR, {
      action: 'role.create',
      resourceType: 'custom_role',
    });
    const row = db.t['governance_audit_log'][0]!;
    expect(row['before_json']).toBeNull();
    expect(row['after_json']).toBeNull();
  });

  it('query() returns all records when no filters applied', async () => {
    await svc.log(ACTOR, { action: 'a', resourceType: 'r' });
    await svc.log(ACTOR, { action: 'b', resourceType: 'r' });
    const result = await svc.query({ limit: 50, offset: 0 });
    expect(result.results).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('query() filters by tenantId', async () => {
    await svc.log(ACTOR, { action: 'x', resourceType: 'r' });
    const other: ActorContext = { ...ACTOR, tenantId: 'tenant_b' };
    await svc.log(other, { action: 'y', resourceType: 'r' });

    const result = await svc.query({ tenantId: 'tenant_a', limit: 50, offset: 0 });
    expect(result.results).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('query() filters by action', async () => {
    await svc.log(ACTOR, { action: 'package.create', resourceType: 'r' });
    await svc.log(ACTOR, { action: 'package.update', resourceType: 'r' });
    const result = await svc.query({ action: 'package.create', limit: 50, offset: 0 });
    expect(result.results).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('query() filters by actorId', async () => {
    await svc.log(ACTOR, { action: 'a', resourceType: 'r' });
    const other: ActorContext = { ...ACTOR, actorId: 'user_002' };
    await svc.log(other, { action: 'b', resourceType: 'r' });

    const result = await svc.query({ actorId: 'user_002', limit: 50, offset: 0 });
    expect(result.results).toHaveLength(1);
  });

  it('query() filters by resourceType', async () => {
    await svc.log(ACTOR, { action: 'a', resourceType: 'subscription_package' });
    await svc.log(ACTOR, { action: 'b', resourceType: 'custom_role' });
    const result = await svc.query({ resourceType: 'custom_role', limit: 50, offset: 0 });
    expect(result.results).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('query() respects limit', async () => {
    for (let i = 0; i < 5; i++) {
      await svc.log(ACTOR, { action: `action_${i}`, resourceType: 'r' });
    }
    const result = await svc.query({ limit: 3, offset: 0 });
    expect(result.results).toHaveLength(3);
    expect(result.total).toBe(5);
  });

  it('query() respects offset', async () => {
    for (let i = 0; i < 4; i++) {
      await svc.log(ACTOR, { action: `action_${i}`, resourceType: 'r' });
    }
    const result = await svc.query({ limit: 50, offset: 3 });
    expect(result.results).toHaveLength(1);
  });
});
