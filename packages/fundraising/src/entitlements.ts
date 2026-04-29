/**
 * @webwaka/fundraising — Entitlement guards.
 *
 * Follows the established @webwaka/community entitlements pattern.
 */

export interface FundraisingEntitlements {
  maxActiveCampaigns: number;
  payoutsEnabled: boolean;
  pledgesEnabled: boolean;
  rewardsEnabled: boolean;
  complianceReportingEnabled: boolean;
  donorWallEnabled: boolean;
  publicCampaignPageEnabled: boolean;
  aiAssistEnabled: boolean;
}

export const FREE_FUNDRAISING_ENTITLEMENTS: FundraisingEntitlements = {
  maxActiveCampaigns: 0,
  payoutsEnabled: false,
  pledgesEnabled: false,
  rewardsEnabled: false,
  complianceReportingEnabled: false,
  donorWallEnabled: false,
  publicCampaignPageEnabled: false,
  aiAssistEnabled: false,
};

export const STARTER_FUNDRAISING_ENTITLEMENTS: FundraisingEntitlements = {
  maxActiveCampaigns: 1,
  payoutsEnabled: false,
  pledgesEnabled: false,
  rewardsEnabled: false,
  complianceReportingEnabled: false,
  donorWallEnabled: true,
  publicCampaignPageEnabled: true,
  aiAssistEnabled: false,
};

export const GROWTH_FUNDRAISING_ENTITLEMENTS: FundraisingEntitlements = {
  maxActiveCampaigns: 3,
  payoutsEnabled: true,
  pledgesEnabled: true,
  rewardsEnabled: false,
  complianceReportingEnabled: true,
  donorWallEnabled: true,
  publicCampaignPageEnabled: true,
  aiAssistEnabled: false,
};

export const PRO_FUNDRAISING_ENTITLEMENTS: FundraisingEntitlements = {
  maxActiveCampaigns: 10,
  payoutsEnabled: true,
  pledgesEnabled: true,
  rewardsEnabled: true,
  complianceReportingEnabled: true,
  donorWallEnabled: true,
  publicCampaignPageEnabled: true,
  aiAssistEnabled: true,
};

export const ENTERPRISE_FUNDRAISING_ENTITLEMENTS: FundraisingEntitlements = {
  maxActiveCampaigns: -1,
  payoutsEnabled: true,
  pledgesEnabled: true,
  rewardsEnabled: true,
  complianceReportingEnabled: true,
  donorWallEnabled: true,
  publicCampaignPageEnabled: true,
  aiAssistEnabled: true,
};

export const PARTNER_FUNDRAISING_ENTITLEMENTS: FundraisingEntitlements = {
  ...ENTERPRISE_FUNDRAISING_ENTITLEMENTS,
};

export const SUB_PARTNER_FUNDRAISING_ENTITLEMENTS: FundraisingEntitlements = {
  ...ENTERPRISE_FUNDRAISING_ENTITLEMENTS,
};

export function assertCampaignCreationAllowed(
  currentActiveCampaigns: number,
  ents: FundraisingEntitlements,
): void {
  if (ents.maxActiveCampaigns === 0) {
    throw new Error('ENTITLEMENT_DENIED: Fundraising campaigns require Starter plan or above');
  }
  if (ents.maxActiveCampaigns !== -1 && currentActiveCampaigns >= ents.maxActiveCampaigns) {
    throw new Error(
      `ENTITLEMENT_DENIED: Maximum of ${ents.maxActiveCampaigns} active campaign(s) on your plan`,
    );
  }
}

export function assertPayoutsEnabled(ents: FundraisingEntitlements): void {
  if (!ents.payoutsEnabled) {
    throw new Error('ENTITLEMENT_DENIED: Payout requests require Growth plan or above');
  }
}

export function assertPledgesEnabled(ents: FundraisingEntitlements): void {
  if (!ents.pledgesEnabled) {
    throw new Error('ENTITLEMENT_DENIED: Recurring pledges require Growth plan or above');
  }
}

export function assertRewardsEnabled(ents: FundraisingEntitlements): void {
  if (!ents.rewardsEnabled) {
    throw new Error('ENTITLEMENT_DENIED: Donor rewards require Pro plan or above');
  }
}
