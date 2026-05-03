-- Rollback 0464: Dynamic Subscription Catalog
DROP TABLE IF EXISTS package_version_history;
DROP TABLE IF EXISTS package_targeting_rules;
DROP TABLE IF EXISTS package_pricing;
DROP TABLE IF EXISTS billing_intervals;
DROP TABLE IF EXISTS subscription_packages;
