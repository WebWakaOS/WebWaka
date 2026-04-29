/**
 * @webwaka/workflows — Public API
 *
 * Phase 2: Workflow Engine MVP
 * Exported via "." entry in package.json.
 */

export type {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowInstance,
  WorkflowInstanceStep,
  StartWorkflowInput,
  AdvanceWorkflowInput,
  StepDecision,
  StepType,
  WorkflowInstanceStatus,
} from './types.js';

export {
  getWorkflowDefinition,
  listWorkflowDefinitions,
  getWorkflowSteps,
  startWorkflow,
  advanceWorkflow,
  getWorkflowInstance,
  listWorkflowInstances,
  getInstanceSteps,
} from './engine.js';

export type { D1Like } from './engine.js';
