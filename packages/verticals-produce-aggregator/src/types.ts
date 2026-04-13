export type ProduceAggregatorFSMState = 'seeded' | 'claimed' | 'active';

export interface ProduceAggregatorProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  displayName: string;
  status: ProduceAggregatorFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProduceAggregatorInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  displayName: string;
}

export interface UpdateProduceAggregatorInput {
  displayName?: string | undefined;
  status?: ProduceAggregatorFSMState | undefined;
}

export const VALID_PRODUCE_AGGREGATOR_TRANSITIONS: Array<[ProduceAggregatorFSMState, ProduceAggregatorFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed', 'active'],
];

export function isValidProduceAggregatorTransition(
  from: ProduceAggregatorFSMState,
  to: ProduceAggregatorFSMState,
): boolean {
  return VALID_PRODUCE_AGGREGATOR_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
