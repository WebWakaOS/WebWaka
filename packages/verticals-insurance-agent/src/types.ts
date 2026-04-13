export type InsuranceAgentFSMState = 'seeded' | 'claimed' | 'naicom_verified' | 'active';

export interface InsuranceAgentProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  displayName: string;
  status: InsuranceAgentFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateInsuranceAgentInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  displayName: string;
}

export interface UpdateInsuranceAgentInput {
  displayName?: string | undefined;
  status?: InsuranceAgentFSMState | undefined;
}

export const VALID_INSURANCE_AGENT_TRANSITIONS: Array<[InsuranceAgentFSMState, InsuranceAgentFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed', 'naicom_verified'],
  ['naicom_verified', 'active'],
];

export function isValidInsuranceAgentTransition(
  from: InsuranceAgentFSMState,
  to: InsuranceAgentFSMState,
): boolean {
  return VALID_INSURANCE_AGENT_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
