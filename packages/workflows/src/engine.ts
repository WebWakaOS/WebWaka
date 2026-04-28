/**
 * @webwaka/workflows — Workflow Engine
 *
 * Phase 2: startWorkflow, advanceWorkflow, getWorkflowInstance, listWorkflowInstances
 *
 * Platform Invariants:
 *   T3  — tenant_id on every instance query
 *   Audit: every step transition recorded in workflow_instance_steps
 */

import type {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowInstance,
  WorkflowInstanceStep,
  StartWorkflowInput,
  AdvanceWorkflowInput,
} from './types.js';

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

// ---------------------------------------------------------------------------
// Row maps
// ---------------------------------------------------------------------------

interface WorkflowDefinitionRow {
  id: string; key: string; name: string; description: string | null;
  version: number; is_active: number; created_at: number; updated_at: number;
}

interface WorkflowStepRow {
  id: string; workflow_id: string; step_key: string; name: string;
  step_order: number; step_type: string; required_role: string | null;
  on_approve_next: string | null; on_reject_next: string | null;
  is_terminal: number; config_json: string | null; created_at: number;
}

interface WorkflowInstanceRow {
  id: string; tenant_id: string; workspace_id: string;
  workflow_id: string; workflow_key: string; entity_type: string; entity_id: string;
  current_step_key: string; status: string; initiated_by: string;
  payload_json: string | null; completed_at: number | null; rejected_at: number | null;
  created_at: number; updated_at: number;
}

function mapDefinition(r: WorkflowDefinitionRow): WorkflowDefinition {
  return {
    id: r.id, key: r.key, name: r.name, description: r.description,
    version: r.version, isActive: r.is_active === 1,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapStep(r: WorkflowStepRow): WorkflowStep {
  return {
    id: r.id, workflowId: r.workflow_id, stepKey: r.step_key, name: r.name,
    stepOrder: r.step_order, stepType: r.step_type as WorkflowStep['stepType'],
    requiredRole: r.required_role, onApproveNext: r.on_approve_next,
    onRejectNext: r.on_reject_next, isTerminal: r.is_terminal === 1,
    configJson: r.config_json, createdAt: r.created_at,
  };
}

function mapInstance(r: WorkflowInstanceRow): WorkflowInstance {
  return {
    id: r.id, tenantId: r.tenant_id, workspaceId: r.workspace_id,
    workflowId: r.workflow_id, workflowKey: r.workflow_key,
    entityType: r.entity_type, entityId: r.entity_id,
    currentStepKey: r.current_step_key,
    status: r.status as WorkflowInstance['status'],
    initiatedBy: r.initiated_by, payloadJson: r.payload_json,
    completedAt: r.completed_at, rejectedAt: r.rejected_at,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getWorkflowDefinition(
  db: D1Like,
  key: string,
): Promise<WorkflowDefinition | null> {
  const row = await db
    .prepare('SELECT * FROM workflow_definitions WHERE key = ? AND is_active = 1')
    .bind(key)
    .first<WorkflowDefinitionRow>();
  return row ? mapDefinition(row) : null;
}

export async function listWorkflowDefinitions(db: D1Like): Promise<WorkflowDefinition[]> {
  const { results } = await db
    .prepare('SELECT * FROM workflow_definitions WHERE is_active = 1 ORDER BY name ASC')
    .all<WorkflowDefinitionRow>();
  return results.map(mapDefinition);
}

export async function getWorkflowSteps(
  db: D1Like,
  workflowId: string,
): Promise<WorkflowStep[]> {
  const { results } = await db
    .prepare('SELECT * FROM workflow_steps WHERE workflow_id = ? ORDER BY step_order ASC')
    .bind(workflowId)
    .all<WorkflowStepRow>();
  return results.map(mapStep);
}

export async function startWorkflow(
  db: D1Like,
  input: StartWorkflowInput,
): Promise<WorkflowInstance> {
  const defn = await db
    .prepare('SELECT * FROM workflow_definitions WHERE key = ? AND is_active = 1')
    .bind(input.workflowKey)
    .first<WorkflowDefinitionRow>();
  if (!defn) throw new Error(`WORKFLOW_NOT_FOUND: no active workflow for key '${input.workflowKey}'`);

  const firstStep = await db
    .prepare('SELECT * FROM workflow_steps WHERE workflow_id = ? ORDER BY step_order ASC LIMIT 1')
    .bind(defn.id)
    .first<WorkflowStepRow>();
  if (!firstStep) throw new Error(`WORKFLOW_NO_STEPS: workflow '${input.workflowKey}' has no steps`);

  const instanceId = generateId('wf_inst');
  const ts = now();
  const payloadJson = input.payload ? JSON.stringify(input.payload) : null;

  await db
    .prepare(
      `INSERT INTO workflow_instances
         (id, tenant_id, workspace_id, workflow_id, workflow_key, entity_type, entity_id,
          current_step_key, status, initiated_by, payload_json, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      instanceId, input.tenantId, input.workspaceId, defn.id, input.workflowKey,
      input.entityType, input.entityId, firstStep.step_key, 'active',
      input.initiatedBy, payloadJson, ts, ts,
    )
    .run();

  await recordStepTransition(db, instanceId, input.tenantId, firstStep, input.initiatedBy, null, null, ts);

  const row = await db
    .prepare('SELECT * FROM workflow_instances WHERE id = ? AND tenant_id = ?')
    .bind(instanceId, input.tenantId)
    .first<WorkflowInstanceRow>();
  if (!row) throw new Error('workflow instance creation failed');
  return mapInstance(row);
}

export async function advanceWorkflow(
  db: D1Like,
  input: AdvanceWorkflowInput,
): Promise<WorkflowInstance> {
  const instance = await db
    .prepare('SELECT * FROM workflow_instances WHERE id = ? AND tenant_id = ?')
    .bind(input.instanceId, input.tenantId)
    .first<WorkflowInstanceRow>();
  if (!instance) throw new Error('NOT_FOUND: workflow instance not found');
  if (instance.status !== 'active') {
    throw new Error(`INVALID_STATE: instance is ${instance.status}, cannot advance`);
  }

  const currentStep = await db
    .prepare('SELECT * FROM workflow_steps WHERE workflow_id = ? AND step_key = ?')
    .bind(instance.workflow_id, instance.current_step_key)
    .first<WorkflowStepRow>();
  if (!currentStep) throw new Error('STEP_NOT_FOUND: current step not found in definition');

  await recordStepTransition(
    db, input.instanceId, input.tenantId, currentStep,
    input.actorId, input.decision, input.note ?? null, now(),
  );

  const ts = now();
  let newStatus: string = 'active';
  let nextStepKey: string = instance.current_step_key;
  let completedAt: number | null = null;
  let rejectedAt: number | null = null;

  if (input.decision === 'approve' || input.decision === 'complete') {
    if (currentStep.is_terminal === 1) {
      newStatus = 'completed';
      nextStepKey = currentStep.step_key;
      completedAt = ts;
    } else if (currentStep.on_approve_next) {
      nextStepKey = currentStep.on_approve_next;
      const nextStep = await db
        .prepare('SELECT * FROM workflow_steps WHERE workflow_id = ? AND step_key = ?')
        .bind(instance.workflow_id, currentStep.on_approve_next)
        .first<WorkflowStepRow>();
      if (nextStep?.is_terminal === 1) {
        newStatus = 'completed';
        completedAt = ts;
      }
    }
  } else if (input.decision === 'reject') {
    if (currentStep.on_reject_next) {
      nextStepKey = currentStep.on_reject_next;
      const rejectStep = await db
        .prepare('SELECT * FROM workflow_steps WHERE workflow_id = ? AND step_key = ?')
        .bind(instance.workflow_id, currentStep.on_reject_next)
        .first<WorkflowStepRow>();
      if (rejectStep?.is_terminal === 1) {
        newStatus = 'rejected';
        rejectedAt = ts;
      }
    } else {
      newStatus = 'rejected';
      rejectedAt = ts;
    }
  }

  await db
    .prepare(
      `UPDATE workflow_instances
       SET current_step_key = ?, status = ?, completed_at = ?, rejected_at = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(nextStepKey, newStatus, completedAt, rejectedAt, ts, input.instanceId, input.tenantId)
    .run();

  const row = await db
    .prepare('SELECT * FROM workflow_instances WHERE id = ? AND tenant_id = ?')
    .bind(input.instanceId, input.tenantId)
    .first<WorkflowInstanceRow>();
  if (!row) throw new Error('advance update failed');
  return mapInstance(row);
}

export async function getWorkflowInstance(
  db: D1Like,
  instanceId: string,
  tenantId: string,
): Promise<WorkflowInstance | null> {
  const row = await db
    .prepare('SELECT * FROM workflow_instances WHERE id = ? AND tenant_id = ?')
    .bind(instanceId, tenantId)
    .first<WorkflowInstanceRow>();
  return row ? mapInstance(row) : null;
}

export async function listWorkflowInstances(
  db: D1Like,
  tenantId: string,
  workflowKey?: string,
  limit = 50,
): Promise<WorkflowInstance[]> {
  let sql = 'SELECT * FROM workflow_instances WHERE tenant_id = ?';
  const params: unknown[] = [tenantId];
  if (workflowKey) { sql += ' AND workflow_key = ?'; params.push(workflowKey); }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);
  const { results } = await db.prepare(sql).bind(...params).all<WorkflowInstanceRow>();
  return results.map(mapInstance);
}

export async function getInstanceSteps(
  db: D1Like,
  instanceId: string,
  tenantId: string,
): Promise<WorkflowInstanceStep[]> {
  const { results } = await db
    .prepare(
      'SELECT * FROM workflow_instance_steps WHERE instance_id = ? AND tenant_id = ? ORDER BY completed_at ASC',
    )
    .bind(instanceId, tenantId)
    .all<{
      id: string; instance_id: string; tenant_id: string; step_key: string; step_name: string;
      actor_id: string | null; decision: string | null; note: string | null; completed_at: number;
    }>();
  return results.map((r) => ({
    id: r.id, instanceId: r.instance_id, tenantId: r.tenant_id,
    stepKey: r.step_key, stepName: r.step_name, actorId: r.actor_id,
    decision: r.decision as WorkflowInstanceStep['decision'], note: r.note, completedAt: r.completed_at,
  }));
}

async function recordStepTransition(
  db: D1Like,
  instanceId: string,
  tenantId: string,
  step: WorkflowStepRow,
  actorId: string | null,
  decision: string | null,
  note: string | null,
  ts: number,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO workflow_instance_steps (id, instance_id, tenant_id, step_key, step_name, actor_id, decision, note, completed_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
    )
    .bind(generateId('wf_step'), instanceId, tenantId, step.step_key, step.name, actorId, decision, note, ts)
    .run();
}
