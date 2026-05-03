/**
 * @webwaka/pilot — shared types for pilot rollout infrastructure
 */

export type PilotOperatorStatus =
  | 'invited'
  | 'onboarding'
  | 'active'
  | 'churned'
  | 'graduated';

export type PilotFeedbackType = 'nps' | 'bug' | 'feature_request' | 'general';

export interface PilotOperator {
  id: string;
  tenant_id: string;
  workspace_id: string;
  vertical_slug: string;
  operator_name: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  lga?: string | null;
  state: string;
  cohort: string;
  status: PilotOperatorStatus;
  onboarded_at?: string | null;
  first_txn_at?: string | null;
  graduated_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PilotFeatureFlag {
  id: string;
  tenant_id: string;
  flag_name: string;
  enabled: number;   // 1 | 0 (SQLite boolean)
  expires_at?: string | null;
  reason?: string | null;
  granted_by?: string | null;
  created_at: string;
}

export interface PilotFeedback {
  id: string;
  tenant_id: string;
  workspace_id: string;
  user_id: string;
  feedback_type: PilotFeedbackType;
  nps_score?: number | null;
  message?: string | null;
  context_route?: string | null;
  submitted_at: string;
}

export interface CreatePilotOperatorInput {
  tenant_id: string;
  workspace_id: string;
  vertical_slug: string;
  operator_name: string;
  contact_phone?: string;
  contact_email?: string;
  lga?: string;
  state?: string;
  cohort?: string;
  notes?: string;
}

export interface EnrollPilotFlagInput {
  tenant_id: string;
  flag_name: string;
  enabled?: boolean;
  expires_at?: string;
  reason?: string;
  granted_by?: string;
}

export interface SubmitFeedbackInput {
  tenant_id: string;
  workspace_id: string;
  user_id: string;
  feedback_type: PilotFeedbackType;
  nps_score?: number;
  message?: string;
  context_route?: string;
}
