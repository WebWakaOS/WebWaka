/**
 * @webwaka/groups-faith — Faith community group extension types
 *
 * Phase 2: denomination, service days, tithe bridge integration flag.
 *
 * Platform Invariants:
 *   T3 — tenant_id on all records
 *   P4 — faith fields in group_faith_extensions; core groups table UNTOUCHED
 */

export type FaithTradition = 'christianity' | 'islam' | 'traditional' | 'other';
export type ServiceDay = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface GroupFaithExtension {
  groupId: string;
  tenantId: string;
  workspaceId: string;
  faithTradition: FaithTradition;
  denomination: string | null;
  titheBridgeEnabled: boolean;
  serviceDay: ServiceDay | null;
  congregationSize: number | null;
  stateCode: string | null;
  lgaCode: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface UpsertFaithExtensionInput {
  groupId: string;
  tenantId: string;
  workspaceId: string;
  faithTradition: FaithTradition;
  denomination?: string;
  titheBridgeEnabled?: boolean;
  serviceDay?: ServiceDay;
  congregationSize?: number;
  stateCode?: string;
  lgaCode?: string;
}
