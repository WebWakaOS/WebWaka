-- Rollback 0471: Remove seeded plan catalog data
DELETE FROM package_entitlement_bindings WHERE package_id IN ('pkg_free','pkg_starter','pkg_growth','pkg_pro','pkg_enterprise','pkg_partner','pkg_sub_partner');
DELETE FROM package_pricing WHERE package_id IN ('pkg_free','pkg_starter','pkg_growth','pkg_pro','pkg_enterprise','pkg_partner','pkg_sub_partner');
DELETE FROM subscription_packages WHERE id IN ('pkg_free','pkg_starter','pkg_growth','pkg_pro','pkg_enterprise','pkg_partner','pkg_sub_partner');
