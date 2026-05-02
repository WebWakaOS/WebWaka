-- Migration 0471: Seed Dynamic Plan Catalog from Hardcoded PLAN_CONFIGS
-- Translates packages/entitlements/src/plan-config.ts into runtime DB records.
-- This preserves all existing operational behavior while enabling runtime management.

-- ─── Seed subscription_packages ────────────────────────────────────────────
INSERT OR IGNORE INTO subscription_packages (id, slug, name, description, status, is_public, sort_order, target_audience, version, is_default, created_by) VALUES
  ('pkg_free',        'free',        'Free',        'Basic discovery. No branding, 3 users, 1 place, 5 offerings.',       'active', 1, 10, 'tenant',      1, 1, 'system'),
  ('pkg_starter',     'starter',     'Starter',     'Civic access + groups. 10 users, 3 places, 25 offerings.',          'active', 1, 20, 'tenant',      1, 0, 'system'),
  ('pkg_growth',      'growth',      'Growth',      'Commerce + AI. 50 users, 10 places, 100 offerings.',                'active', 1, 30, 'tenant',      1, 0, 'system'),
  ('pkg_pro',         'pro',         'Pro',         'Professional + Creator layers. 200 users, 50 places, unlimited.',    'active', 1, 40, 'tenant',      1, 0, 'system'),
  ('pkg_enterprise',  'enterprise',  'Enterprise',  'All layers + sensitive sectors. Unlimited everything.',             'active', 1, 50, 'tenant',      1, 0, 'system'),
  ('pkg_partner',     'partner',     'Partner',     'Full white-label partner. Unlimited + delegation rights.',          'active', 0, 60, 'partner',     1, 0, 'system'),
  ('pkg_sub_partner', 'sub_partner', 'Sub-Partner', 'Sub-partner with WhiteLabel layer. 100 places.',                   'active', 0, 70, 'sub_partner', 1, 0, 'system');

-- ─── Package pricing (monthly — current default) ─────────────────────────
-- Pricing in Kobo (₦ × 100). Update these via dashboard — they are INITIAL seeds only.
INSERT OR IGNORE INTO package_pricing (id, package_id, billing_interval_id, price_kobo, currency, is_active) VALUES
  ('pp_free_monthly',       'pkg_free',        'bi_monthly',  0,          'NGN', 1),
  ('pp_starter_monthly',    'pkg_starter',     'bi_monthly',  500000,     'NGN', 1),  -- ₦5,000/mo
  ('pp_growth_monthly',     'pkg_growth',      'bi_monthly',  1500000,    'NGN', 1),  -- ₦15,000/mo
  ('pp_pro_monthly',        'pkg_pro',         'bi_monthly',  5000000,    'NGN', 1),  -- ₦50,000/mo
  ('pp_enterprise_monthly', 'pkg_enterprise',  'bi_monthly',  20000000,   'NGN', 1),  -- ₦200,000/mo
  ('pp_partner_monthly',    'pkg_partner',     'bi_monthly',  50000000,   'NGN', 1),  -- ₦500,000/mo
  ('pp_starter_trial',      'pkg_starter',     'bi_trial',    0,          'NGN', 1),
  ('pp_growth_trial',       'pkg_growth',      'bi_trial',    0,          'NGN', 1);

-- ─── Package entitlement bindings — free ─────────────────────────────────
INSERT OR IGNORE INTO package_entitlement_bindings (id, package_id, entitlement_id, value) VALUES
  ('peb_free_users',      'pkg_free', 'ent_max_users',         '3'),
  ('peb_free_places',     'pkg_free', 'ent_max_places',        '1'),
  ('peb_free_offerings',  'pkg_free', 'ent_max_offerings',     '5'),
  ('peb_free_branding',   'pkg_free', 'ent_branding_rights',   'false'),
  ('peb_free_wl',         'pkg_free', 'ent_whitelabel_depth',  '0'),
  ('peb_free_deleg',      'pkg_free', 'ent_delegation_rights', 'false'),
  ('peb_free_ai',         'pkg_free', 'ent_ai_rights',         'false'),
  ('peb_free_sensitive',  'pkg_free', 'ent_sensitive_sector',  'false'),
  ('peb_free_wakapage',   'pkg_free', 'ent_wakapage_public',   'false'),
  ('peb_free_waka_anal',  'pkg_free', 'ent_wakapage_analytics','false'),
  ('peb_free_groups',     'pkg_free', 'ent_groups_enabled',    'false'),
  ('peb_free_value_mov',  'pkg_free', 'ent_value_movement',    'false'),
  ('peb_free_l_disc',     'pkg_free', 'ent_layer_discovery',   'true'),
  ('peb_free_ai_cu',      'pkg_free', 'ent_ai_waku_cu_quota',  '500');

-- ─── starter ─────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO package_entitlement_bindings (id, package_id, entitlement_id, value) VALUES
  ('peb_st_users',     'pkg_starter', 'ent_max_users',         '10'),
  ('peb_st_places',    'pkg_starter', 'ent_max_places',        '3'),
  ('peb_st_offerings', 'pkg_starter', 'ent_max_offerings',     '25'),
  ('peb_st_branding',  'pkg_starter', 'ent_branding_rights',   'true'),
  ('peb_st_wl',        'pkg_starter', 'ent_whitelabel_depth',  '0'),
  ('peb_st_deleg',     'pkg_starter', 'ent_delegation_rights', 'false'),
  ('peb_st_ai',        'pkg_starter', 'ent_ai_rights',         'false'),
  ('peb_st_sensitive', 'pkg_starter', 'ent_sensitive_sector',  'false'),
  ('peb_st_wakapage',  'pkg_starter', 'ent_wakapage_public',   'true'),
  ('peb_st_waka_anal', 'pkg_starter', 'ent_wakapage_analytics','false'),
  ('peb_st_groups',    'pkg_starter', 'ent_groups_enabled',    'true'),
  ('peb_st_value_mov', 'pkg_starter', 'ent_value_movement',    'true'),
  ('peb_st_l_disc',    'pkg_starter', 'ent_layer_discovery',   'true'),
  ('peb_st_l_ops',     'pkg_starter', 'ent_layer_operational', 'true'),
  ('peb_st_l_civic',   'pkg_starter', 'ent_layer_civic',       'true'),
  ('peb_st_ai_cu',     'pkg_starter', 'ent_ai_waku_cu_quota',  '5000');

-- ─── growth ──────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO package_entitlement_bindings (id, package_id, entitlement_id, value) VALUES
  ('peb_gr_users',     'pkg_growth', 'ent_max_users',         '50'),
  ('peb_gr_places',    'pkg_growth', 'ent_max_places',        '10'),
  ('peb_gr_offerings', 'pkg_growth', 'ent_max_offerings',     '100'),
  ('peb_gr_branding',  'pkg_growth', 'ent_branding_rights',   'true'),
  ('peb_gr_wl',        'pkg_growth', 'ent_whitelabel_depth',  '0'),
  ('peb_gr_deleg',     'pkg_growth', 'ent_delegation_rights', 'false'),
  ('peb_gr_ai',        'pkg_growth', 'ent_ai_rights',         'true'),
  ('peb_gr_sensitive', 'pkg_growth', 'ent_sensitive_sector',  'false'),
  ('peb_gr_wakapage',  'pkg_growth', 'ent_wakapage_public',   'true'),
  ('peb_gr_waka_anal', 'pkg_growth', 'ent_wakapage_analytics','true'),
  ('peb_gr_groups',    'pkg_growth', 'ent_groups_enabled',    'true'),
  ('peb_gr_value_mov', 'pkg_growth', 'ent_value_movement',    'true'),
  ('peb_gr_l_disc',    'pkg_growth', 'ent_layer_discovery',   'true'),
  ('peb_gr_l_ops',     'pkg_growth', 'ent_layer_operational', 'true'),
  ('peb_gr_l_commerce','pkg_growth', 'ent_layer_commerce',    'true'),
  ('peb_gr_l_civic',   'pkg_growth', 'ent_layer_civic',       'true'),
  ('peb_gr_l_ai',      'pkg_growth', 'ent_layer_ai',          'true'),
  ('peb_gr_ai_cu',     'pkg_growth', 'ent_ai_waku_cu_quota',  '50000');

-- ─── pro ─────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO package_entitlement_bindings (id, package_id, entitlement_id, value) VALUES
  ('peb_pr_users',     'pkg_pro', 'ent_max_users',         '200'),
  ('peb_pr_places',    'pkg_pro', 'ent_max_places',        '50'),
  ('peb_pr_offerings', 'pkg_pro', 'ent_max_offerings',     '-1'),
  ('peb_pr_branding',  'pkg_pro', 'ent_branding_rights',   'true'),
  ('peb_pr_wl',        'pkg_pro', 'ent_whitelabel_depth',  '1'),
  ('peb_pr_deleg',     'pkg_pro', 'ent_delegation_rights', 'false'),
  ('peb_pr_ai',        'pkg_pro', 'ent_ai_rights',         'true'),
  ('peb_pr_sensitive', 'pkg_pro', 'ent_sensitive_sector',  'false'),
  ('peb_pr_wakapage',  'pkg_pro', 'ent_wakapage_public',   'true'),
  ('peb_pr_waka_anal', 'pkg_pro', 'ent_wakapage_analytics','true'),
  ('peb_pr_groups',    'pkg_pro', 'ent_groups_enabled',    'true'),
  ('peb_pr_value_mov', 'pkg_pro', 'ent_value_movement',    'true'),
  ('peb_pr_l_disc',    'pkg_pro', 'ent_layer_discovery',   'true'),
  ('peb_pr_l_ops',     'pkg_pro', 'ent_layer_operational', 'true'),
  ('peb_pr_l_commerce','pkg_pro', 'ent_layer_commerce',    'true'),
  ('peb_pr_l_transport','pkg_pro','ent_layer_transport',   'true'),
  ('peb_pr_l_civic',   'pkg_pro', 'ent_layer_civic',       'true'),
  ('peb_pr_l_prof',    'pkg_pro', 'ent_layer_professional','true'),
  ('peb_pr_l_creator', 'pkg_pro', 'ent_layer_creator',     'true'),
  ('peb_pr_l_ai',      'pkg_pro', 'ent_layer_ai',          'true'),
  ('peb_pr_ai_cu',     'pkg_pro', 'ent_ai_waku_cu_quota',  '250000');

-- ─── enterprise ──────────────────────────────────────────────────────────
INSERT OR IGNORE INTO package_entitlement_bindings (id, package_id, entitlement_id, value) VALUES
  ('peb_en_users',     'pkg_enterprise', 'ent_max_users',          '-1'),
  ('peb_en_places',    'pkg_enterprise', 'ent_max_places',         '-1'),
  ('peb_en_offerings', 'pkg_enterprise', 'ent_max_offerings',      '-1'),
  ('peb_en_branding',  'pkg_enterprise', 'ent_branding_rights',    'true'),
  ('peb_en_wl',        'pkg_enterprise', 'ent_whitelabel_depth',   '2'),
  ('peb_en_deleg',     'pkg_enterprise', 'ent_delegation_rights',  'true'),
  ('peb_en_ai',        'pkg_enterprise', 'ent_ai_rights',          'true'),
  ('peb_en_sensitive', 'pkg_enterprise', 'ent_sensitive_sector',   'true'),
  ('peb_en_wakapage',  'pkg_enterprise', 'ent_wakapage_public',    'true'),
  ('peb_en_waka_anal', 'pkg_enterprise', 'ent_wakapage_analytics', 'true'),
  ('peb_en_groups',    'pkg_enterprise', 'ent_groups_enabled',     'true'),
  ('peb_en_value_mov', 'pkg_enterprise', 'ent_value_movement',     'true'),
  ('peb_en_l_disc',    'pkg_enterprise', 'ent_layer_discovery',    'true'),
  ('peb_en_l_ops',     'pkg_enterprise', 'ent_layer_operational',  'true'),
  ('peb_en_l_commerce','pkg_enterprise', 'ent_layer_commerce',     'true'),
  ('peb_en_l_transport','pkg_enterprise','ent_layer_transport',    'true'),
  ('peb_en_l_civic',   'pkg_enterprise', 'ent_layer_civic',        'true'),
  ('peb_en_l_prof',    'pkg_enterprise', 'ent_layer_professional', 'true'),
  ('peb_en_l_creator', 'pkg_enterprise', 'ent_layer_creator',      'true'),
  ('peb_en_l_ai',      'pkg_enterprise', 'ent_layer_ai',           'true'),
  ('peb_en_l_political','pkg_enterprise','ent_layer_political',    'true'),
  ('peb_en_l_instit',  'pkg_enterprise', 'ent_layer_institutional','true'),
  ('peb_en_l_wl',      'pkg_enterprise', 'ent_layer_whitelabel',   'true'),
  ('peb_en_ai_cu',     'pkg_enterprise', 'ent_ai_waku_cu_quota',   '0');

-- ─── partner (same as enterprise + delegation) ───────────────────────────
INSERT OR IGNORE INTO package_entitlement_bindings (id, package_id, entitlement_id, value) VALUES
  ('peb_pa_users',     'pkg_partner', 'ent_max_users',          '-1'),
  ('peb_pa_places',    'pkg_partner', 'ent_max_places',         '-1'),
  ('peb_pa_offerings', 'pkg_partner', 'ent_max_offerings',      '-1'),
  ('peb_pa_branding',  'pkg_partner', 'ent_branding_rights',    'true'),
  ('peb_pa_wl',        'pkg_partner', 'ent_whitelabel_depth',   '2'),
  ('peb_pa_deleg',     'pkg_partner', 'ent_delegation_rights',  'true'),
  ('peb_pa_ai',        'pkg_partner', 'ent_ai_rights',          'true'),
  ('peb_pa_sensitive', 'pkg_partner', 'ent_sensitive_sector',   'true'),
  ('peb_pa_wakapage',  'pkg_partner', 'ent_wakapage_public',    'true'),
  ('peb_pa_waka_anal', 'pkg_partner', 'ent_wakapage_analytics', 'true'),
  ('peb_pa_groups',    'pkg_partner', 'ent_groups_enabled',     'true'),
  ('peb_pa_value_mov', 'pkg_partner', 'ent_value_movement',     'true'),
  ('peb_pa_l_disc',    'pkg_partner', 'ent_layer_discovery',    'true'),
  ('peb_pa_l_ops',     'pkg_partner', 'ent_layer_operational',  'true'),
  ('peb_pa_l_commerce','pkg_partner', 'ent_layer_commerce',     'true'),
  ('peb_pa_l_transport','pkg_partner','ent_layer_transport',    'true'),
  ('peb_pa_l_civic',   'pkg_partner', 'ent_layer_civic',        'true'),
  ('peb_pa_l_prof',    'pkg_partner', 'ent_layer_professional', 'true'),
  ('peb_pa_l_creator', 'pkg_partner', 'ent_layer_creator',      'true'),
  ('peb_pa_l_ai',      'pkg_partner', 'ent_layer_ai',           'true'),
  ('peb_pa_l_political','pkg_partner','ent_layer_political',    'true'),
  ('peb_pa_l_instit',  'pkg_partner', 'ent_layer_institutional','true'),
  ('peb_pa_l_wl',      'pkg_partner', 'ent_layer_whitelabel',   'true'),
  ('peb_pa_ai_cu',     'pkg_partner', 'ent_ai_waku_cu_quota',   '0');

-- ─── sub_partner ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO package_entitlement_bindings (id, package_id, entitlement_id, value) VALUES
  ('peb_sp_users',     'pkg_sub_partner', 'ent_max_users',          '-1'),
  ('peb_sp_places',    'pkg_sub_partner', 'ent_max_places',         '100'),
  ('peb_sp_offerings', 'pkg_sub_partner', 'ent_max_offerings',      '-1'),
  ('peb_sp_branding',  'pkg_sub_partner', 'ent_branding_rights',    'true'),
  ('peb_sp_wl',        'pkg_sub_partner', 'ent_whitelabel_depth',   '1'),
  ('peb_sp_deleg',     'pkg_sub_partner', 'ent_delegation_rights',  'false'),
  ('peb_sp_ai',        'pkg_sub_partner', 'ent_ai_rights',          'true'),
  ('peb_sp_sensitive', 'pkg_sub_partner', 'ent_sensitive_sector',   'false'),
  ('peb_sp_wakapage',  'pkg_sub_partner', 'ent_wakapage_public',    'true'),
  ('peb_sp_waka_anal', 'pkg_sub_partner', 'ent_wakapage_analytics', 'true'),
  ('peb_sp_groups',    'pkg_sub_partner', 'ent_groups_enabled',     'true'),
  ('peb_sp_value_mov', 'pkg_sub_partner', 'ent_value_movement',     'true'),
  ('peb_sp_l_disc',    'pkg_sub_partner', 'ent_layer_discovery',    'true'),
  ('peb_sp_l_ops',     'pkg_sub_partner', 'ent_layer_operational',  'true'),
  ('peb_sp_l_commerce','pkg_sub_partner', 'ent_layer_commerce',     'true'),
  ('peb_sp_l_civic',   'pkg_sub_partner', 'ent_layer_civic',        'true'),
  ('peb_sp_l_ai',      'pkg_sub_partner', 'ent_layer_ai',           'true'),
  ('peb_sp_l_wl',      'pkg_sub_partner', 'ent_layer_whitelabel',   'true'),
  ('peb_sp_ai_cu',     'pkg_sub_partner', 'ent_ai_waku_cu_quota',   '0');
