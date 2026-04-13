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

  // Navigation
  nav_home: 'Home',
  nav_directory: 'Directory',
  nav_marketplace: 'Marketplace',
  nav_about: 'About',
  nav_contact: 'Contact',
  nav_login: 'Sign In',
  nav_register: 'Get Started',

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

  // Errors
  error_required: 'This field is required.',
  error_invalid_email: 'Please enter a valid email address.',
  error_network: 'Network error. Please check your connection.',
  error_unauthorized: 'You are not authorised to perform this action.',
  error_forbidden: 'Access denied.',

  // Footer
  footer_tagline: 'Built for Africa. Powered by WebWaka.',
  footer_privacy: 'Privacy Policy',
  footer_terms: 'Terms of Service',
  footer_contact: 'Contact Us',
} as const;

export type I18nKeys = keyof typeof en;
/**
 * I18nLocale maps every key to string — NOT to the literal English string.
 * Using Record<I18nKeys, string> allows translated locales to assign any string value
 * without TypeScript complaining that "Gida" is not assignable to "Home".
 */
export type I18nLocale = Record<I18nKeys, string>;
