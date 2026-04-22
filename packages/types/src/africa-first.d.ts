/**
 * P3 Africa-First Interfaces — WebWaka OS v1.0.1
 * Sprint 3, Task 3.2
 *
 * These interfaces define the platform's Africa-first extensibility layer.
 * Starting with Nigeria, each country gets a CountryConfig that drives
 * geography, identity, payments, regulatory compliance, and localization.
 *
 * Platform Invariants:
 *   T4  — All monetary amounts in smallest currency unit (kobo for NGN)
 *   T6  — Geography hierarchy driven by CountryConfig
 *   P10 — NDPR/data protection compliance per country
 *   R5  — Identity verification rate limits per provider
 */
export interface CountryConfig {
    code: string;
    name: string;
    currency: CurrencyConfig;
    geography: GeographyConfig;
    identity: IdentityConfig;
    payments: PaymentProviderConfig[];
    regulatory: RegulatoryConfig;
    localization: LocalizationConfig;
}
export interface CurrencyConfig {
    iso_code: string;
    symbol: string;
    name: string;
    smallest_unit: string;
    smallest_unit_factor: number;
}
export interface GeographyConfig {
    levels: GeographyLevelConfig[];
    root_id: string;
    total_nodes: number;
}
export interface GeographyLevelConfig {
    depth: number;
    name: string;
    plural: string;
    count: number;
}
export interface IdentityConfig {
    providers: IdentityProvider[];
    data_protection_law: string;
    consent_required: boolean;
    minor_age_threshold: number;
}
export interface IdentityProvider {
    type: string;
    name: string;
    issuing_authority: string;
    verification_endpoint?: string;
    rate_limit: RateLimit;
    required_fields: string[];
    kyc_tier: number;
}
export interface RateLimit {
    max_requests: number;
    window_seconds: number;
    key_prefix: string;
}
export interface PaymentProviderConfig {
    name: string;
    type: 'card' | 'bank_transfer' | 'ussd' | 'mobile_money' | 'pos';
    provider_id: string;
    supported_currencies: string[];
    min_amount_smallest_unit: number;
    max_amount_smallest_unit: number;
    settlement_days: number;
    webhook_path: string;
}
export interface RegulatoryConfig {
    data_protection: DataProtectionConfig;
    financial: FinancialRegulatoryConfig;
    telecom: TelecomRegulatoryConfig;
}
export interface DataProtectionConfig {
    law_name: string;
    law_code: string;
    authority: string;
    consent_required_for: string[];
    data_retention_max_days: number;
    cross_border_transfer_allowed: boolean;
    breach_notification_hours: number;
}
export interface FinancialRegulatoryConfig {
    authority: string;
    authority_code: string;
    daily_transaction_limit_smallest_unit: number;
    kyc_tiers: KycTierConfig[];
}
export interface KycTierConfig {
    tier: number;
    name: string;
    daily_limit_smallest_unit: number;
    required_documents: string[];
}
export interface TelecomRegulatoryConfig {
    authority: string;
    authority_code: string;
    ussd_available: boolean;
    sms_sender_registration_required: boolean;
}
export interface LocalizationConfig {
    default_language: string;
    supported_languages: string[];
    date_format: string;
    time_format: string;
    phone_prefix: string;
    phone_format: string;
}
export declare const NIGERIA_CONFIG: CountryConfig;
//# sourceMappingURL=africa-first.d.ts.map