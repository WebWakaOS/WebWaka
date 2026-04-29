/**
 * @webwaka/workflows — Workflow Engine types
 *
 * Phase 2: WorkflowDefinition, WorkflowStep, WorkflowInstance, WorkflowInstanceStep
 *
 * Platform Invariants:
 *   T3  — tenant_id on all WorkflowInstance records
 *   Platform note: workflow_definitions and workflow_steps are platform-level
 *                  (no tenant_id required — shared by all tenants)
 */

export type StepType = 'human_review' | 'automated' | 'notification' | 'condition';
export type WorkflowInstanceStatus = 'active' | 'completed' | 'rejected' | 'cancelled';
export type StepDecision = 'approve' | 'reject' | 'complete' | 'skip';

// ---------------------------------------------------------------------------
// Workflow Definition (platform-level, no tenant_id)
// DB table: workflow_definitions
// ---------------------------------------------------------------------------

export interface WorkflowDefinition {
  id: string;
  key: string;
  name: string;
  description: string | null;
  version: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Workflow Step (platform-level)
// DB table: workflow_steps
// ---------------------------------------------------------------------------

export interface WorkflowStep {
  id: string;
  workflowId: string;
  stepKey: string;
  name: string;
  stepOrder: number;
  stepType: StepType;
  requiredRole: string | null;
  onApproveNext: string | null;
  onRejectNext: string | null;
  isTerminal: boolean;
  configJson: string | null;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Workflow Instance (tenant-scoped)
// DB table: workflow_instances
// ---------------------------------------------------------------------------

export interface WorkflowInstance {
  id: string;
  tenantId: string;
  workspaceId: string;
  workflowId: string;
  workflowKey: string;
  entityType: string;
  entityId: string;
  currentStepKey: string;
  status: WorkflowInstanceStatus;
  initiatedBy: string;
  payloadJson: string | null;
  completedAt: number | null;
  rejectedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface StartWorkflowInput {
  tenantId: string;
  workspaceId: string;
  workflowKey: string;
  entityType: string;
  entityId: string;
  initiatedBy: string;
  payload?: Record<string, unknown>;
}

export interface AdvanceWorkflowInput {
  tenantId: string;
  instanceId: string;
  actorId: string;
  decision: StepDecision;
  note?: string;
}

// ---------------------------------------------------------------------------
// Workflow Instance Step (audit trail)
// DB table: workflow_instance_steps
// ---------------------------------------------------------------------------

export interface WorkflowInstanceStep {
  id: string;
  instanceId: string;
  tenantId: string;
  stepKey: string;
  stepName: string;
  actorId: string | null;
  decision: StepDecision | null;
  note: string | null;
  completedAt: number;
}
