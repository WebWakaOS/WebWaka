/**
 * Nigerian Pidgin (pcm) — Lingua franca across Nigeria (~120M speakers/users).
 * Also known as Naija or Nigerian Creole English.
 */
import type { I18nLocale } from './en.js';

export const pcm: Partial<I18nLocale> = {
  title_home: 'WebWaka — We Build Am for Africa',
  title_search: 'Find Business',
  title_directory: 'Business Directory',
  title_marketplace: 'Template Market',
  title_profile: 'Business Profile',
  title_login: 'Sign In',
  title_register: 'Create Account',
  title_dashboard: 'Dashboard',
  title_settings: 'Settings',

  nav_home: 'Home',
  nav_directory: 'Directory',
  nav_marketplace: 'Market',
  nav_about: 'About Us',
  nav_contact: 'Contact Us',
  nav_login: 'Sign In',
  nav_register: 'Start Now',

  action_search: 'Find Am',
  action_install: 'Install Am',
  action_purchase: 'Buy Am',
  action_submit: 'Send Am',
  action_cancel: 'Forget It',
  action_confirm: 'Confirm Am',
  action_delete: 'Delete Am',
  action_edit: 'Change Am',
  action_view: 'See Am',
  action_back: 'Go Back',
  action_next: 'Move Forward',

  status_loading: 'Loading…',
  status_saving: 'E dey save…',
  status_success: 'E don do!',
  status_error: 'Something happen. Abeg try again.',
  status_not_found: 'We no find am.',
  status_empty: 'Nothing dey here.',
  status_installed: 'Don Install',
  status_free: 'Free',
  status_paid: 'Paid',

  search_placeholder: 'Search for business, service or category…',
  search_no_results: 'We no find any business for "{query}".',

  auth_email: 'Email address',
  auth_password: 'Password',
  auth_forgot_password: 'You forget your password?',

  error_required: 'E get to fill this field.',
  error_invalid_email: 'Abeg put correct email address.',
  error_network: 'Network wahala. Abeg check your connection.',
  error_unauthorized: 'You no get permission to do this thing.',

  footer_tagline: 'We build am for Africa. WebWaka power am.',
  footer_privacy: 'Privacy Policy',
  footer_terms: 'Terms of Service',

  // Notification email — N-041 Phase 3 (Naija Pidgin translations)
  notif_legal_footer_ndpr: 'We send dis message according to Nigeria Data Protection Regulation (NDPR) 2019.',
  notif_legal_footer_rights: '© {year} {company_name}. All rights reserved.',
  notif_unsubscribe_text: 'You dey receive dis because you get account with {tenant_name}.',
  notif_unsubscribe_action: 'Unsubscribe',
  notif_unsubscribe_confirmed_title: 'You don unsubscribe',
  notif_unsubscribe_confirmed_body: 'You no go receive {channel} notification from {tenant_name} again.',
  notif_unsubscribe_invalid_link: 'Dis unsubscribe link no valid or don expire.',
  notif_powered_by: 'WebWaka power am',
  notif_marketing_address_label: 'Mailing address:',
  notif_too_many_emails: 'Too many emails dey bother you? You fit manage your notification settings for your account.',
};
