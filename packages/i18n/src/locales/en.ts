/**
 * English (en) — default locale for WebWaka OS.
 * Nigeria-first: uses Nigerian spelling conventions.
 */
export const en = {
  // Page titles
  title_home: 'WebWaka — Built for Africa',
  title_search: 'Search Businesses',
  title_directory: 'Business Directory',
  title_marketplace: 'Template Marketplace',
  title_profile: 'Business Profile',
  title_login: 'Sign In',
  title_register: 'Create Account',
  title_dashboard: 'Dashboard',
  title_settings: 'Settings',
  title_analytics: 'Analytics',
  title_payments: 'Payments',
  title_bank_transfer: 'Bank Transfer',
  title_ai_assistant: 'AI Assistant',
  title_b2b_marketplace: 'B2B Marketplace',

  // Navigation
  nav_home: 'Home',
  nav_directory: 'Directory',
  nav_marketplace: 'Marketplace',
  nav_about: 'About',
  nav_contact: 'Contact',
  nav_login: 'Sign In',
  nav_register: 'Get Started',
  nav_analytics: 'Analytics',
  nav_payments: 'Payments',
  nav_b2b: 'B2B Market',

  // Common actions
  action_search: 'Search',
  action_install: 'Install',
  action_purchase: 'Purchase',
  action_submit: 'Submit',
  action_cancel: 'Cancel',
  action_confirm: 'Confirm',
  action_delete: 'Delete',
  action_edit: 'Edit',
  action_view: 'View',
  action_back: 'Back',
  action_next: 'Next',
  action_upload: 'Upload',
  action_download: 'Download',
  action_refresh: 'Refresh',
  action_approve: 'Approve',
  action_reject: 'Reject',
  action_send: 'Send',

  // Status / feedback
  status_loading: 'Loading…',
  status_saving: 'Saving…',
  status_success: 'Done!',
  status_error: 'Something went wrong. Please try again.',
  status_not_found: 'Not found.',
  status_empty: 'No results found.',
  status_installed: 'Installed',
  status_free: 'Free',
  status_paid: 'Paid',
  status_pending: 'Pending',
  status_confirmed: 'Confirmed',
  status_rejected: 'Rejected',
  status_expired: 'Expired',
  status_processing: 'Processing…',

  // Search
  search_placeholder: 'Search businesses, services, or categories…',
  search_results_count: '{count} results',
  search_no_results: 'No businesses found for "{query}".',

  // Directory
  directory_all_categories: 'All Categories',
  directory_nearby: 'Nearby',
  directory_verified: 'Verified',
  directory_open_now: 'Open Now',

  // Auth
  auth_email: 'Email address',
  auth_password: 'Password',
  auth_forgot_password: 'Forgot password?',
  auth_no_account: 'Don\'t have an account?',
  auth_have_account: 'Already have an account?',
  auth_verify_email: 'Please verify your email address to continue.',
  auth_email_sent: 'Verification email sent. Please check your inbox.',
  auth_email_verified: 'Email address verified.',
  auth_resend_verification: 'Resend verification email',

  // Email verification banner (P20 + P21)
  banner_verify_email_title: 'Verify your email address',
  banner_verify_email_body: 'Please verify your email to unlock all features. Check your inbox for the verification link.',
  banner_verify_email_action: 'Resend email',
  banner_verify_email_dismiss: 'Remind me later',

  // Billing / Subscription
  billing_plan: 'Plan',
  billing_usage: 'Usage',
  billing_upgrade: 'Upgrade',
  billing_current_plan: 'Current Plan',
  billing_plan_free: 'Free',
  billing_plan_growth: 'Growth',
  billing_plan_pro: 'Pro',
  billing_plan_enterprise: 'Enterprise',
  billing_renews_at: 'Renews on {date}',
  billing_ai_credits: 'AI Credits',
  billing_ai_credits_used: '{used} of {total} WakaCU used this month',
  billing_ai_credits_depleted: 'AI credits depleted. Upgrade or wait for next billing cycle.',

  // Bank Transfer (P21)
  bank_transfer_title: 'Bank Transfer Payment',
  bank_transfer_instructions: 'Transfer the amount below to the account details provided, then upload your proof of payment.',
  bank_transfer_amount: 'Amount to Transfer',
  bank_transfer_bank_name: 'Bank Name',
  bank_transfer_account_number: 'Account Number',
  bank_transfer_account_name: 'Account Name',
  bank_transfer_reference: 'Payment Reference',
  bank_transfer_upload_proof: 'Upload Proof of Payment',
  bank_transfer_proof_hint: 'Upload a screenshot or PDF of your payment receipt.',
  bank_transfer_submit_proof: 'Submit Proof',
  bank_transfer_awaiting_confirmation: 'Awaiting seller confirmation…',
  bank_transfer_confirmed: 'Payment confirmed.',
  bank_transfer_rejected: 'Payment could not be confirmed. Please contact the seller.',
  bank_transfer_expires_in: 'This payment link expires in {time}.',
  bank_transfer_expired: 'This payment link has expired. Please create a new order.',
  bank_transfer_dispute: 'Raise a Dispute',
  bank_transfer_dispute_reason: 'Reason for Dispute',
  bank_transfer_dispute_submitted: 'Your dispute has been submitted. We will review within 72 hours.',

  // AI / SuperAgent (P22)
  ai_assistant: 'AI Assistant',
  ai_consent_required: 'AI features require your consent for data processing.',
  ai_consent_grant: 'Enable AI Features',
  ai_consent_revoke: 'Disable AI Features',
  ai_hitl_pending: 'Your AI request is awaiting human review.',
  ai_hitl_approved: 'Your AI request has been approved.',
  ai_hitl_rejected: 'Your AI request was not approved.',
  ai_hitl_expired: 'Your AI review request expired without action.',
  ai_budget_warning: 'You have used {pct}% of your monthly AI credit budget.',
  ai_budget_depleted: 'Monthly AI budget reached. Upgrade for more credits.',
  ai_capability_unavailable: 'This AI feature is not available for your current plan.',
  ai_processing: 'AI is processing your request…',
  ai_result_ready: 'AI result is ready.',

  // Analytics (P23)
  analytics_title: 'Business Analytics',
  analytics_revenue: 'Total Revenue',
  analytics_orders: 'Total Orders',
  analytics_customers: 'Unique Customers',
  analytics_new_customers: 'New Customers',
  analytics_period_day: 'Today',
  analytics_period_week: 'This Week',
  analytics_period_month: 'This Month',
  analytics_payment_breakdown: 'Payment Breakdown',
  analytics_top_vertical: 'Top Vertical',
  analytics_no_data: 'No analytics data available yet.',
  analytics_refreshing: 'Refreshing data…',

  // Multi-currency (P24)
  currency_display: 'Display Currency',
  currency_ngn: 'Nigerian Naira (₦)',
  currency_ghs: 'Ghanaian Cedi (GH₵)',
  currency_kes: 'Kenyan Shilling (KSh)',
  currency_usd: 'US Dollar ($)',
  currency_zar: 'South African Rand (R)',
  currency_cfa: 'West African CFA Franc (CFA)',
  currency_usdt: 'Tether USDT',
  currency_rate_note: 'Displayed amounts are approximate conversions. Settlement in NGN.',

  // B2B Marketplace (P25)
  b2b_rfq_title: 'Request for Quotation',
  b2b_rfq_create: 'Create RFQ',
  b2b_rfq_category: 'Product Category',
  b2b_rfq_description: 'What do you need?',
  b2b_rfq_quantity: 'Quantity',
  b2b_rfq_target_price: 'Target Price (optional)',
  b2b_rfq_deadline: 'Delivery Deadline',
  b2b_rfq_submit: 'Submit RFQ',
  b2b_rfq_open: 'Open for Bids',
  b2b_rfq_awarded: 'Bid Accepted',
  b2b_rfq_closed: 'Closed',
  b2b_rfq_expired: 'RFQ Expired',
  b2b_bid_submit: 'Submit Bid',
  b2b_bid_amount: 'Your Bid Amount',
  b2b_bid_notes: 'Notes (optional)',
  b2b_bid_accept: 'Accept This Bid',
  b2b_bid_reject: 'Decline',
  b2b_po_title: 'Purchase Order',
  b2b_po_status: 'Order Status',
  b2b_invoice_title: 'Invoice',
  b2b_invoice_number: 'Invoice Number',
  b2b_invoice_due: 'Due Date',
  b2b_dispute_raise: 'Raise Dispute',
  b2b_trust_score: 'Trust Score',

  // Errors
  error_required: 'This field is required.',
  error_invalid_email: 'Please enter a valid email address.',
  error_network: 'Network error. Please check your connection.',
  error_unauthorized: 'You are not authorised to perform this action.',
  error_forbidden: 'Access denied.',
  error_validation: 'Please check the highlighted fields and try again.',
  error_payment_failed: 'Payment could not be processed. Please try again.',
  error_file_too_large: 'File is too large. Maximum size is {max}.',
  error_file_type: 'Invalid file type. Please upload {types}.',

  // Footer
  footer_tagline: 'Built for Africa. Powered by WebWaka.',
  footer_privacy: 'Privacy Policy',
  footer_terms: 'Terms of Service',
  footer_contact: 'Contact Us',

  // Settings tabs
  settings_tab_profile: 'Profile',
  settings_tab_workspace: 'Workspace',
  settings_tab_billing: 'Billing',
  settings_tab_ai: 'AI & Consent',
  settings_tab_payment: 'Payment Settings',
  settings_tab_notifications: 'Notifications',
  settings_tab_security: 'Security',
  settings_tab_currency: 'Currency',

  // Notification email — N-041 Phase 3
  // Legal footer (NDPR compliance)
  notif_legal_footer_ndpr: 'This communication is sent in compliance with the Nigeria Data Protection Regulation (NDPR) 2019.',
  notif_legal_footer_rights: '© {year} {company_name}. All rights reserved.',
  // Unsubscribe
  notif_unsubscribe_text: 'You are receiving this because you have an account with {tenant_name}.',
  notif_unsubscribe_action: 'Unsubscribe',
  notif_unsubscribe_confirmed_title: 'You have been unsubscribed',
  notif_unsubscribe_confirmed_body: 'You will no longer receive {channel} notifications from {tenant_name}.',
  notif_unsubscribe_invalid_link: 'This unsubscribe link is invalid or has expired.',
  // Attribution
  notif_powered_by: 'Powered by WebWaka',
  // Marketing
  notif_marketing_address_label: 'Mailing address:',
  notif_too_many_emails: 'Receiving too many emails? You can manage your notification preferences in your account settings.',
} as const;

export type I18nKeys = keyof typeof en;
/**
 * I18nLocale maps every key to string — NOT to the literal English string.
 * Using Record<I18nKeys, string> allows translated locales to assign any string value
 * without TypeScript complaining that "Gida" is not assignable to "Home".
 */
export type I18nLocale = Record<I18nKeys, string>;
