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

export const NIGERIA_CONFIG: CountryConfig = {
  code: 'NG',
  name: 'Nigeria',
  currency: {
    iso_code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    smallest_unit: 'kobo',
    smallest_unit_factor: 100,
  },
  geography: {
    levels: [
      { depth: 0, name: 'Country', plural: 'Countries', count: 1 },
      { depth: 1, name: 'Zone', plural: 'Zones', count: 6 },
      { depth: 2, name: 'State', plural: 'States', count: 37 },
      { depth: 3, name: 'LGA', plural: 'LGAs', count: 774 },
      { depth: 4, name: 'Ward', plural: 'Wards', count: 8809 },
    ],
    root_id: 'ng',
    total_nodes: 9627,
  },
  identity: {
    providers: [
      {
        type: 'bvn',
        name: 'Bank Verification Number',
        issuing_authority: 'NIBSS',
        rate_limit: { max_requests: 2, window_seconds: 3600, key_prefix: 'bvn' },
        required_fields: ['bvn_number', 'first_name', 'last_name', 'date_of_birth'],
        kyc_tier: 2,
      },
      {
        type: 'nin',
        name: 'National Identification Number',
        issuing_authority: 'NIMC',
        rate_limit: { max_requests: 2, window_seconds: 3600, key_prefix: 'nin' },
        required_fields: ['nin_number'],
        kyc_tier: 2,
      },
      {
        type: 'cac',
        name: 'Corporate Affairs Commission',
        issuing_authority: 'CAC',
        rate_limit: { max_requests: 10, window_seconds: 3600, key_prefix: 'cac' },
        required_fields: ['rc_number'],
        kyc_tier: 3,
      },
      {
        type: 'frsc',
        name: "Federal Road Safety Corps Driver's License",
        issuing_authority: 'FRSC',
        rate_limit: { max_requests: 5, window_seconds: 3600, key_prefix: 'frsc' },
        required_fields: ['license_number'],
        kyc_tier: 1,
      },
    ],
    data_protection_law: 'NDPR',
    consent_required: true,
    minor_age_threshold: 18,
  },
  payments: [
    {
      name: 'Paystack',
      type: 'card',
      provider_id: 'paystack',
      supported_currencies: ['NGN'],
      min_amount_smallest_unit: 10000,
      max_amount_smallest_unit: 1000000000,
      settlement_days: 1,
      webhook_path: '/payments/webhook/paystack',
    },
    {
      name: 'Paystack Bank Transfer',
      type: 'bank_transfer',
      provider_id: 'paystack_transfer',
      supported_currencies: ['NGN'],
      min_amount_smallest_unit: 10000,
      max_amount_smallest_unit: 5000000000,
      settlement_days: 0,
      webhook_path: '/payments/webhook/paystack',
    },
    {
      name: 'USSD Payment',
      type: 'ussd',
      provider_id: 'paystack_ussd',
      supported_currencies: ['NGN'],
      min_amount_smallest_unit: 10000,
      max_amount_smallest_unit: 500000000,
      settlement_days: 1,
      webhook_path: '/payments/webhook/paystack',
    },
  ],
  regulatory: {
    data_protection: {
      law_name: 'Nigeria Data Protection Regulation',
      law_code: 'NDPR',
      authority: 'Nigeria Data Protection Bureau',
      consent_required_for: ['identity_verification', 'pii_storage', 'marketing', 'analytics', 'third_party_sharing'],
      data_retention_max_days: 2555,
      cross_border_transfer_allowed: false,
      breach_notification_hours: 72,
    },
    financial: {
      authority: 'Central Bank of Nigeria',
      authority_code: 'CBN',
      daily_transaction_limit_smallest_unit: 3000000000,
      kyc_tiers: [
        { tier: 1, name: 'Basic', daily_limit_smallest_unit: 5000000, required_documents: ['phone'] },
        { tier: 2, name: 'Standard', daily_limit_smallest_unit: 50000000, required_documents: ['bvn', 'nin'] },
        { tier: 3, name: 'Enhanced', daily_limit_smallest_unit: 3000000000, required_documents: ['bvn', 'nin', 'cac', 'utility_bill'] },
      ],
    },
    telecom: {
      authority: 'Nigerian Communications Commission',
      authority_code: 'NCC',
      ussd_available: true,
      sms_sender_registration_required: true,
    },
  },
  localization: {
    default_language: 'en-NG',
    supported_languages: ['en-NG', 'yo', 'ha', 'ig', 'pcm'],
    date_format: 'DD/MM/YYYY',
    time_format: 'HH:mm',
    phone_prefix: '+234',
    phone_format: '+234XXXXXXXXXX',
  },
};
