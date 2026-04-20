-- Rollback: 0266_channel_providers
DROP INDEX IF EXISTS idx_ch_prov_domain_unverified;
DROP INDEX IF EXISTS idx_ch_prov_platform_defaults;
DROP INDEX IF EXISTS idx_ch_prov_tenant_channel;
DROP TABLE IF EXISTS channel_provider;
