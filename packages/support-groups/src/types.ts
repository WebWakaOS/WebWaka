/**
 * @webwaka/support-groups — Domain types
 *
 * Platform Invariants:
 *   T3  — tenant_id on all records
 *   T4  — monetary values in integer kobo (assets only)
 *   P9  — integer kobo; no floats
 *   P13 — voter_ref and member PII never forwarded to AI
 *
 * Nigeria-first hierarchy:
 *   national → state → lga → ward → polling_unit
 *   Non-political groups use hierarchy_level = null.
 */

export type SupportGroupType =
  | 'general'
  | 'election'
  | 'political'
  | 'civic'
  | 'professional'
  | 'church'
  | 'ngo'
  | 'community';

export type HierarchyLevel =
  | 'national'
  | 'state'
  | 'lga'
  | 'ward'
  | 'polling_unit';

export type GroupVisibility = 'public' | 'private' | 'invite_only';
export type GroupJoinPolicy = 'open' | 'approval' | 'invite_only';
export type GroupStatus = 'active' | 'suspended' | 'archived';

export type MemberRole =
  | 'chair'
  | 'secretary'
  | 'treasurer'
  | 'executive'
  | 'coordinator'
  | 'mobilizer'
  | 'member'
  | 'volunteer';

export type MemberStatus = 'pending' | 'active' | 'suspended' | 'expelled';

export type MeetingType =
  | 'general'
  | 'executive'
  | 'emergency'
  | 'agm'
  | 'rally'
  | 'townhall'
  | 'training'
  | 'mobilization';

export type MeetingStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export type BroadcastChannel = 'in_app' | 'sms' | 'whatsapp' | 'email' | 'ussd_push';
export type BroadcastAudience = 'all' | 'executive' | 'volunteers' | 'members_only' | 'ward_coordinators';
export type BroadcastStatus = 'queued' | 'sending' | 'sent' | 'failed';

export type EventType =
  | 'rally'
  | 'townhall'
  | 'workshop'
  | 'training'
  | 'mobilization'
  | 'press_conference'
  | 'fundraiser';

export type EventStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export type PetitionStatus = 'open' | 'closed' | 'submitted' | 'resolved';

export type AssetType = 'material' | 'vehicle' | 'equipment' | 'uniform' | 'branded_item' | 'funds';
export type AssetStatus = 'available' | 'in_use' | 'depleted' | 'lost' | 'returned';

export type ResolutionStatus = 'passed' | 'failed' | 'tabled' | 'withdrawn';
export type VoteMethod = 'voice_vote' | 'show_of_hands' | 'ballot' | 'consensus';

export type ExecutiveRoleTitle =
  | 'chairman'
  | 'secretary_general'
  | 'financial_secretary'
  | 'pro'
  | 'women_leader'
  | 'youth_leader'
  | 'coordinator'
  | 'patron';

export type CommitteeType =
  | 'standing'
  | 'ad_hoc'
  | 'special'
  | 'disciplinary'
  | 'finance'
  | 'welfare'
  | 'publicity';

// ---------------------------------------------------------------------------
// Core entity
// ---------------------------------------------------------------------------

export interface SupportGroup {
  id: string;
  workspaceId: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  groupType: SupportGroupType;
  hierarchyLevel: HierarchyLevel | null;
  parentGroupId: string | null;
  placeId: string | null;
  stateCode: string | null;
  lgaCode: string | null;
  wardCode: string | null;
  pollingUnitCode: string | null;
  memberCount: number;
  volunteerCount: number;
  visibility: GroupVisibility;
  joinPolicy: GroupJoinPolicy;
  status: GroupStatus;
  politicianId: string | null;
  campaignOfficeId: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  constitutionUrl: string | null;
  websiteUrl: string | null;
  ndprConsentRequired: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSupportGroupInput {
  workspaceId: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  groupType?: SupportGroupType;
  hierarchyLevel?: HierarchyLevel;
  parentGroupId?: string;
  placeId?: string;
  stateCode?: string;
  lgaCode?: string;
  wardCode?: string;
  pollingUnitCode?: string;
  visibility?: GroupVisibility;
  joinPolicy?: GroupJoinPolicy;
  politicianId?: string;
  campaignOfficeId?: string;
  logoUrl?: string;
  coverUrl?: string;
  constitutionUrl?: string;
  websiteUrl?: string;
  ndprConsentRequired?: boolean;
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export interface SupportGroupMember {
  id: string;
  groupId: string;
  workspaceId: string;
  tenantId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  wardCode: string | null;
  pollingUnitCode: string | null;
  joinedAt: number;
  approvedBy: string | null;
  approvedAt: number | null;
  ndprConsented: boolean;
}

export interface JoinGroupInput {
  groupId: string;
  workspaceId: string;
  tenantId: string;
  userId: string;
  role?: MemberRole;
  wardCode?: string;
  pollingUnitCode?: string;
  ndprConsented: boolean;
}

// ---------------------------------------------------------------------------
// Executive roles
// ---------------------------------------------------------------------------

export interface ExecutiveRole {
  id: string;
  groupId: string;
  workspaceId: string;
  tenantId: string;
  memberId: string;
  roleTitle: ExecutiveRoleTitle;
  startAt: number;
  endAt: number | null;
  appointedBy: string;
}

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

export interface SupportGroupMeeting {
  id: string;
  groupId: string;
  workspaceId: string;
  tenantId: string;
  title: string;
  agenda: string | null;
  meetingType: MeetingType;
  venue: string | null;
  placeId: string | null;
  startsAt: number;
  endsAt: number | null;
  isVirtual: boolean;
  joinUrl: string | null;
  status: MeetingStatus;
  minutesUrl: string | null;
  quorumMet: boolean | null;
  attendance: number;
  createdBy: string;
  createdAt: number;
}

export interface CreateMeetingInput {
  groupId: string;
  workspaceId: string;
  tenantId: string;
  title: string;
  agenda?: string;
  meetingType?: MeetingType;
  venue?: string;
  placeId?: string;
  startsAt: number;
  endsAt?: number;
  isVirtual?: boolean;
  joinUrl?: string;
  createdBy: string;
}

// ---------------------------------------------------------------------------
// Resolutions
// ---------------------------------------------------------------------------

export interface SupportGroupResolution {
  id: string;
  groupId: string;
  meetingId: string | null;
  workspaceId: string;
  tenantId: string;
  title: string;
  body: string;
  resolutionRef: string | null;
  status: ResolutionStatus;
  passedBy: VoteMethod;
  recordedAt: number;
  recordedBy: string;
}

// ---------------------------------------------------------------------------
// Committees
// ---------------------------------------------------------------------------

export interface SupportGroupCommittee {
  id: string;
  groupId: string;
  workspaceId: string;
  tenantId: string;
  name: string;
  mandate: string | null;
  committeeType: CommitteeType;
  chairMemberId: string | null;
  status: string;
  formedAt: number;
  dissolvedAt: number | null;
}

// ---------------------------------------------------------------------------
// Broadcasts
// ---------------------------------------------------------------------------

export interface SupportGroupBroadcast {
  id: string;
  groupId: string;
  workspaceId: string;
  tenantId: string;
  senderId: string;
  title: string;
  body: string;
  channel: BroadcastChannel;
  audience: BroadcastAudience;
  status: BroadcastStatus;
  sentCount: number;
  failedCount: number;
  scheduledAt: number | null;
  sentAt: number | null;
  createdAt: number;
}

export interface CreateBroadcastInput {
  groupId: string;
  workspaceId: string;
  tenantId: string;
  senderId: string;
  title: string;
  body: string;
  channel?: BroadcastChannel;
  audience?: BroadcastAudience;
  scheduledAt?: number;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export interface SupportGroupEvent {
  id: string;
  groupId: string;
  workspaceId: string;
  tenantId: string;
  title: string;
  description: string | null;
  eventType: EventType;
  venue: string | null;
  placeId: string | null;
  stateCode: string | null;
  lgaCode: string | null;
  wardCode: string | null;
  startsAt: number;
  endsAt: number | null;
  expectedCount: number | null;
  actualCount: number | null;
  status: EventStatus;
  isPublic: boolean;
  rsvpCount: number;
  createdBy: string;
  createdAt: number;
}

export interface CreateEventInput {
  groupId: string;
  workspaceId: string;
  tenantId: string;
  title: string;
  description?: string;
  eventType?: EventType;
  venue?: string;
  placeId?: string;
  stateCode?: string;
  lgaCode?: string;
  wardCode?: string;
  startsAt: number;
  endsAt?: number;
  expectedCount?: number;
  isPublic?: boolean;
  createdBy: string;
}

// ---------------------------------------------------------------------------
// GOTV
// ---------------------------------------------------------------------------

export interface GotvRecord {
  id: string;
  groupId: string;
  workspaceId: string;
  tenantId: string;
  voterRef: string;
  pollingUnitCode: string;
  stateCode: string | null;
  lgaCode: string | null;
  wardCode: string | null;
  coordinatorMemberId: string;
  accredited: boolean;
  voted: boolean;
  mobilizedAt: number;
  voteConfirmedAt: number | null;
}

// ---------------------------------------------------------------------------
// Petitions
// ---------------------------------------------------------------------------

export interface SupportGroupPetition {
  id: string;
  groupId: string;
  workspaceId: string;
  tenantId: string;
  title: string;
  body: string;
  target: string | null;
  signatureCount: number;
  status: PetitionStatus;
  createdBy: string;
  createdAt: number;
  closedAt: number | null;
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export interface SupportGroupAsset {
  id: string;
  groupId: string;
  workspaceId: string;
  tenantId: string;
  assetName: string;
  assetType: AssetType;
  quantity: number;
  quantityUnit: string;
  custodianMemberId: string | null;
  status: AssetStatus;
  valueKobo: number;
  notes: string | null;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface SupportGroupAnalytics {
  groupId: string;
  periodDate: string;
  newMembers: number;
  activeMembers: number;
  broadcastsSent: number;
  eventsHeld: number;
  gotvMobilized: number;
  gotvVoted: number;
  signaturesCollected: number;
  computedAt: number;
}

// ---------------------------------------------------------------------------
// Public profile (for brand/discovery surfaces)
// ---------------------------------------------------------------------------

export interface SupportGroupPublicProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  groupType: SupportGroupType;
  hierarchyLevel: HierarchyLevel | null;
  memberCount: number;
  volunteerCount: number;
  logoUrl: string | null;
  coverUrl: string | null;
  websiteUrl: string | null;
  visibility: GroupVisibility;
  joinPolicy: GroupJoinPolicy;
  stateCode: string | null;
  lgaCode: string | null;
  wardCode: string | null;
  createdAt: number;
}
