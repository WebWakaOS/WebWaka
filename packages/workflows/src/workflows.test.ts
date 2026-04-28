/**
 * @webwaka/workflows — Workflow Engine tests (Phase 2, T003)
 * 12 tests covering: startWorkflow, advanceWorkflow (approve + reject), listWorkflowInstances.
 */

import { describe, it, expect } from 'vitest';
import {
  getWorkflowDefinition,
  listWorkflowDefinitions,
  startWorkflow,
  advanceWorkflow,
  getWorkflowInstance,
  listWorkflowInstances,
} from './engine.js';

// ── In-memory mock DB ──────────────────────────────────────────────────────

type Row = Record<string, unknown>;

const DEFINITIONS: Row[] = [
  {
    id: 'wfd_payout_approval_v1', key: 'payout-approval', name: 'Payout Approval',
    description: 'Two-step payout approval', version: 1, is_active: 1,
    created_at: 1000, updated_at: 1000,
  },
  {
    id: 'wfd_case_resolution_v1', key: 'case-resolution', name: 'Case Resolution',
    description: 'Case lifecycle', version: 1, is_active: 1,
    created_at: 1000, updated_at: 1000,
  },
];

const STEPS: Row[] = [
  { id: 'wfs_pa_submit',  workflow_id: 'wfd_payout_approval_v1', step_key: 'submit',   name: 'Submit Request',    step_order: 1, step_type: 'automated',    required_role: null,    on_approve_next: 'review',    on_reject_next: null,      is_terminal: 0, config_json: null, created_at: 1000 },
  { id: 'wfs_pa_review',  workflow_id: 'wfd_payout_approval_v1', step_key: 'review',   name: 'HITL Review',      step_order: 2, step_type: 'human_review', required_role: 'admin', on_approve_next: 'execute',   on_reject_next: 'rejected', is_terminal: 0, config_json: null, created_at: 1000 },
  { id: 'wfs_pa_execute', workflow_id: 'wfd_payout_approval_v1', step_key: 'execute',  name: 'Execute Transfer', step_order: 3, step_type: 'automated',    required_role: null,    on_approve_next: null,        on_reject_next: null,       is_terminal: 1, config_json: null, created_at: 1000 },
  { id: 'wfs_pa_reject',  workflow_id: 'wfd_payout_approval_v1', step_key: 'rejected', name: 'Rejected',         step_order: 4, step_type: 'notification', required_role: null,    on_approve_next: null,        on_reject_next: null,       is_terminal: 1, config_json: null, created_at: 1000 },
];

function makeMockDb() {
  const instances: Row[] = [];
  const instanceSteps: Row[] = [];

  return {
    prepare(sql: string) {
      const lsql = sql.trim().toLowerCase();

      return {
        bind(...args: unknown[]) {
          return {
            async run() {
              if (lsql.startsWith('insert into workflow_instances')) {
                const r: Row = {
                  id: args[0], tenant_id: args[1], workspace_id: args[2],
                  workflow_id: args[3], workflow_key: args[4], entity_type: args[5],
                  entity_id: args[6], current_step_key: args[7], status: args[8],
                  initiated_by: args[9], payload_json: args[10],
                  completed_at: null, rejected_at: null,
                  created_at: args[11], updated_at: args[12],
                };
                instances.push(r);
              } else if (lsql.startsWith('insert into workflow_instance_steps')) {
                const r: Row = {
                  id: args[0], instance_id: args[1], tenant_id: args[2],
                  step_key: args[3], step_name: args[4], actor_id: args[5],
                  decision: args[6], note: args[7], completed_at: args[8],
                };
                instanceSteps.push(r);
              } else if (lsql.startsWith('update workflow_instances')) {
                const [nextStepKey, newStatus, completedAt, rejectedAt, updatedAt, instId, tenantId] = args as [string, string, number | null, number | null, number, string, string];
                const r = instances.find(i => i.id === instId && i.tenant_id === tenantId);
                if (r) {
                  r.current_step_key = nextStepKey;
                  r.status = newStatus;
                  if (completedAt !== null) r.completed_at = completedAt;
                  if (rejectedAt !== null) r.rejected_at = rejectedAt;
                  r.updated_at = updatedAt;
                }
              }
              return { success: true };
            },

            async first<T>(): Promise<T | null> {
              if (lsql.includes('from workflow_definitions where key')) {
                const key = args[0] as string;
                return (DEFINITIONS.find(d => d.key === key && d.is_active === 1) ?? null) as T | null;
              }
              if (lsql.includes('from workflow_definitions')) {
                return (DEFINITIONS[0] ?? null) as T | null;
              }
              if (lsql.includes('from workflow_steps') && lsql.includes('limit 1')) {
                const wfId = args[0] as string;
                const steps = STEPS.filter(s => s.workflow_id === wfId);
                steps.sort((a, b) => (a.step_order as number) - (b.step_order as number));
                return (steps[0] ?? null) as T | null;
              }
              if (lsql.includes('from workflow_steps') && lsql.includes('step_key')) {
                const [wfId, stepKey] = args as [string, string];
                return (STEPS.find(s => s.workflow_id === wfId && s.step_key === stepKey) ?? null) as T | null;
              }
              if (lsql.includes('from workflow_instances where id')) {
                const [id, tenantId] = args as [string, string];
                return (instances.find(i => i.id === id && i.tenant_id === tenantId) ?? null) as T | null;
              }
              return null as T | null;
            },

            async all<T>(): Promise<{ results: T[] }> {
              if (lsql.includes('from workflow_definitions')) {
                return { results: DEFINITIONS.filter(d => d.is_active === 1) as T[] };
              }
              if (lsql.includes('from workflow_steps')) {
                const wfId = args[0] as string;
                const results = STEPS.filter(s => s.workflow_id === wfId);
                results.sort((a, b) => (a.step_order as number) - (b.step_order as number));
                return { results: results as T[] };
              }
              if (lsql.includes('from workflow_instances')) {
                const tenantId = args[0] as string;
                const workflowKey = args.length > 2 ? args[1] as string : undefined;
                let results = instances.filter(i => i.tenant_id === tenantId);
                if (workflowKey) results = results.filter(i => i.workflow_key === workflowKey);
                return { results: results as T[] };
              }
              return { results: [] };
            },
          };
        },
        async first<T>(): Promise<T | null> { return null as T | null; },
        all<T>() {
          const lsql = sql.trim().toLowerCase();
          if (lsql.includes('from workflow_definitions')) {
            return Promise.resolve({ results: DEFINITIONS.filter(d => d.is_active === 1) as T[] });
          }
          return Promise.resolve({ results: [] as T[] });
        },
      };
    },
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

const TENANT = 'ten_wf';
const WS = 'ws_wf';

describe('@webwaka/workflows — Workflow Engine', () => {

  describe('getWorkflowDefinition', () => {
    it('WF01 — returns active payout-approval definition', async () => {
      const db = makeMockDb();
      const defn = await getWorkflowDefinition(db as any, 'payout-approval');
      expect(defn).not.toBeNull();
      expect(defn?.key).toBe('payout-approval');
      expect(defn?.isActive).toBe(true);
    });

    it('WF02 — returns null for unknown workflow key', async () => {
      const db = makeMockDb();
      const defn = await getWorkflowDefinition(db as any, 'nonexistent-workflow');
      expect(defn).toBeNull();
    });

    it('WF03 — listWorkflowDefinitions returns both seeded workflows', async () => {
      const db = makeMockDb();
      const list = await listWorkflowDefinitions(db as any);
      expect(list.length).toBeGreaterThanOrEqual(2);
      const keys = list.map(d => d.key);
      expect(keys).toContain('payout-approval');
      expect(keys).toContain('case-resolution');
    });
  });

  describe('startWorkflow', () => {
    it('WF04 — starts payout-approval workflow and returns active instance', async () => {
      const db = makeMockDb();
      const instance = await startWorkflow(db as any, {
        tenantId: TENANT, workspaceId: WS, workflowKey: 'payout-approval',
        entityType: 'payout_request', entityId: 'pr_001', initiatedBy: 'user_admin',
        payload: { amountKobo: 500_000 },
      });
      expect(instance.status).toBe('active');
      expect(instance.workflowKey).toBe('payout-approval');
      expect(instance.currentStepKey).toBe('submit');
      expect(instance.tenantId).toBe(TENANT);
    });

    it('WF05 — throws for unknown workflow key', async () => {
      const db = makeMockDb();
      await expect(startWorkflow(db as any, {
        tenantId: TENANT, workspaceId: WS, workflowKey: 'ghost-workflow',
        entityType: 'payout_request', entityId: 'pr_002', initiatedBy: 'user',
      })).rejects.toThrow('WORKFLOW_NOT_FOUND');
    });
  });

  describe('advanceWorkflow', () => {
    it('WF06 — advances submit → review on approve decision', async () => {
      const db = makeMockDb();
      const instance = await startWorkflow(db as any, {
        tenantId: TENANT, workspaceId: WS, workflowKey: 'payout-approval',
        entityType: 'payout_request', entityId: 'pr_003', initiatedBy: 'user',
      });
      const advanced = await advanceWorkflow(db as any, {
        tenantId: TENANT, instanceId: instance.id, actorId: 'admin', decision: 'approve',
      });
      expect(advanced.currentStepKey).toBe('review');
      expect(advanced.status).toBe('active');
    });

    it('WF07 — advances review → execute (completed) on approve', async () => {
      const db = makeMockDb();
      const instance = await startWorkflow(db as any, {
        tenantId: TENANT, workspaceId: WS, workflowKey: 'payout-approval',
        entityType: 'payout_request', entityId: 'pr_004', initiatedBy: 'user',
      });
      await advanceWorkflow(db as any, {
        tenantId: TENANT, instanceId: instance.id, actorId: 'admin', decision: 'approve',
      });
      const completed = await advanceWorkflow(db as any, {
        tenantId: TENANT, instanceId: instance.id, actorId: 'system', decision: 'approve',
      });
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).not.toBeNull();
    });

    it('WF08 — advances review → rejected on reject decision', async () => {
      const db = makeMockDb();
      const instance = await startWorkflow(db as any, {
        tenantId: TENANT, workspaceId: WS, workflowKey: 'payout-approval',
        entityType: 'payout_request', entityId: 'pr_005', initiatedBy: 'user',
      });
      await advanceWorkflow(db as any, {
        tenantId: TENANT, instanceId: instance.id, actorId: 'admin', decision: 'approve',
      });
      const rejected = await advanceWorkflow(db as any, {
        tenantId: TENANT, instanceId: instance.id, actorId: 'reviewer', decision: 'reject',
        note: 'Insufficient documentation',
      });
      expect(rejected.status).toBe('rejected');
      expect(rejected.rejectedAt).not.toBeNull();
    });

    it('WF09 — throws when advancing a completed instance', async () => {
      const db = makeMockDb();
      const instance = await startWorkflow(db as any, {
        tenantId: TENANT, workspaceId: WS, workflowKey: 'payout-approval',
        entityType: 'payout_request', entityId: 'pr_006', initiatedBy: 'user',
      });
      await advanceWorkflow(db as any, {
        tenantId: TENANT, instanceId: instance.id, actorId: 'admin', decision: 'approve',
      });
      await advanceWorkflow(db as any, {
        tenantId: TENANT, instanceId: instance.id, actorId: 'system', decision: 'approve',
      });
      await expect(advanceWorkflow(db as any, {
        tenantId: TENANT, instanceId: instance.id, actorId: 'admin', decision: 'approve',
      })).rejects.toThrow('INVALID_STATE');
    });
  });

  describe('listWorkflowInstances', () => {
    it('WF10 — lists instances for tenant', async () => {
      const db = makeMockDb();
      await startWorkflow(db as any, {
        tenantId: TENANT, workspaceId: WS, workflowKey: 'payout-approval',
        entityType: 'payout_request', entityId: 'pr_list1', initiatedBy: 'user',
      });
      await startWorkflow(db as any, {
        tenantId: TENANT, workspaceId: WS, workflowKey: 'payout-approval',
        entityType: 'payout_request', entityId: 'pr_list2', initiatedBy: 'user',
      });
      const list = await listWorkflowInstances(db as any, TENANT);
      expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it('WF11 — filters by workflowKey', async () => {
      const db = makeMockDb();
      await startWorkflow(db as any, {
        tenantId: TENANT, workspaceId: WS, workflowKey: 'payout-approval',
        entityType: 'payout_request', entityId: 'pr_filter', initiatedBy: 'user',
      });
      const list = await listWorkflowInstances(db as any, TENANT, 'payout-approval');
      expect(list.every(i => i.workflowKey === 'payout-approval')).toBe(true);
    });

    it('WF12 — getWorkflowInstance returns null for wrong tenant (T3)', async () => {
      const db = makeMockDb();
      const instance = await startWorkflow(db as any, {
        tenantId: TENANT, workspaceId: WS, workflowKey: 'payout-approval',
        entityType: 'payout_request', entityId: 'pr_t3', initiatedBy: 'user',
      });
      const result = await getWorkflowInstance(db as any, instance.id, 'ten_other');
      expect(result).toBeNull();
    });
  });

});
