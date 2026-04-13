export type CommunityRadioFSMState = 'seeded' | 'claimed' | 'nbc_licensed' | 'active';

export interface CommunityRadioProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  displayName: string;
  status: CommunityRadioFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCommunityRadioInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  displayName: string;
}

export interface UpdateCommunityRadioInput {
  displayName?: string | undefined;
  status?: CommunityRadioFSMState | undefined;
}

export const VALID_COMMUNITY_RADIO_TRANSITIONS: Array<[CommunityRadioFSMState, CommunityRadioFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed', 'nbc_licensed'],
  ['nbc_licensed', 'active'],
];

export function isValidCommunityRadioTransition(
  from: CommunityRadioFSMState,
  to: CommunityRadioFSMState,
): boolean {
  return VALID_COMMUNITY_RADIO_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
