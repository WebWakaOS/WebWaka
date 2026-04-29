/**
 * @webwaka/groups — Domain types
 *
 * Phase 0 rename: @webwaka/support-groups → @webwaka/groups
 * All SupportGroup* types renamed to Group* per PRD Phase 0.
 *
 * Platform Invariants:
 *   T3  — tenant_id on all records
 *   T4  — monetary values in integer kobo (assets only)
 *   P9  — integer kobo; no floats
 *   P13 — voter_ref is in groups-electoral package; member PII never forwarded to AI
 *   P4  — electoral-specific fields are in group_electoral_extensions, not this core table
 *
 * Nigeria-first hierarchy:
 *   national → state → lga → ward → polling_unit
 *   Non-political groups use hierarchy_level = null.
 */

export type GroupCategory =
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
export type BroadcastAudience = 'all' | 'executive' | 'volunteers' | 'members_only' | 'coordinators';
export type BroadcastStatus = 'queued' | 'sending' | 'sent' | 'failed';

export type GroupEventType =
  | 'general'
  | 'rally'
  | 'townhall'
  | 'workshop'
  | 'training'
  | 'mobilization'
  | 'press_conference'
  | 'fundraiser'
  | 'service'
  | 'outreach'
  | 'worship'
  | 'meeting';

export type GroupEventStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

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
// Core entity — DB table: groups
// NOTE: electoral extension fields (politician_id, campaign_office_id) are in
//       group_electoral_extensions (P4 compliance — no vertical-specific columns
//       in the generic core table).
// ---------------------------------------------------------------------------

export interface Group {
  id: string;
  workspaceId: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  category: GroupCategory;
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
  logoUrl: string | null;
  coverUrl: string | null;
  constitutionUrl: string | null;
  websiteUrl: string | null;
  ndprConsentRequired: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateGroupInput {
  workspaceId: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  category?: GroupCategory;
  hierarchyLevel?: HierarchyLevel;
  parentGroupId?: string;
  placeId?: string;
  stateCode?: string;
  lgaCode?: string;
  wardCode?: string;
  pollingUnitCode?: string;
  visibility?: GroupVisibility;
  joinPolicy?: GroupJoinPolicy;
  logoUrl?: string;
  coverUrl?: string;
  constitutionUrl?: string;
  websiteUrl?: string;
  ndprConsentRequired?: boolean;
}

// ---------------------------------------------------------------------------
// Members — DB table: group_members
// ---------------------------------------------------------------------------

export interface GroupMember {
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
// Executive roles — DB table: group_executive_roles
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
// Meetings — DB table: group_meetings
// ---------------------------------------------------------------------------

export interface GroupMeeting {
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
// Resolutions — DB table: group_resolutions
// ---------------------------------------------------------------------------

export interface GroupResolution {
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
// Committees — DB table: group_committees
// ---------------------------------------------------------------------------

export interface GroupCommittee {
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
// Broadcasts — DB table: group_broadcasts
// ---------------------------------------------------------------------------

export interface GroupBroadcast {
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
// Events — DB table: group_events
// ---------------------------------------------------------------------------

export interface GroupEvent {
  id: string;
  groupId: string;
  workspaceId: string;
  tenantId: string;
  title: string;
  description: string | null;
  eventType: GroupEventType;
  venue: string | null;
  placeId: string | null;
  stateCode: string | null;
  lgaCode: string | null;
  wardCode: string | null;
  startsAt: number;
  endsAt: number | null;
  expectedCount: number | null;
  actualCount: number | null;
  status: GroupEventStatus;
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
  eventType?: GroupEventType;
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
// Petitions — DB table: group_petitions
// ---------------------------------------------------------------------------

export interface GroupPetition {
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
// Assets — DB table: group_assets
// ---------------------------------------------------------------------------

export interface GroupAsset {
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
// Analytics — DB table: group_analytics
// ---------------------------------------------------------------------------

export interface GroupAnalytics {
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

export interface GroupPublicProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: GroupCategory;
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
