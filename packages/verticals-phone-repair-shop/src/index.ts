/**
 * @webwaka/verticals-phone-repair-shop
 * M10 Commerce P3 — Task V-COMM-EXT-C10
 * Primary pillars: Ops, Branding, Marketplace
 */

export * from './types.js';
export { PhoneRepairShopRepository } from './phone-repair-shop.js';

export const VERTICAL_SLUG = 'phone-repair-shop' as const;
export const PRIMARY_PILLARS = ['ops', 'branding', 'marketplace'] as const;

export function registerPhoneRepairShopVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Phone Repair Shop',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'active'] as const,
    ai_capabilities: ['PARTS_DEMAND_FORECAST'] as const,
    ai_autonomy_level: 1 as const,
    milestone: 'M10' as const,
  };
}
