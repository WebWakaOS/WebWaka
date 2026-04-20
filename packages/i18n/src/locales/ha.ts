/**
 * Hausa (ha) — Northern Nigeria primary language (~80M speakers in Nigeria).
 * Romanised script (not Ajami).
 */
import type { I18nLocale } from './en.js';

export const ha: Partial<I18nLocale> = {
  title_home: 'WebWaka — An Gina Don Afirka',
  title_search: 'Nemi Kasuwanci',
  title_directory: 'Jagoran Kasuwanci',
  title_marketplace: 'Kasuwar Samfuri',
  title_profile: 'Bayanan Kasuwanci',
  title_login: 'Shiga',
  title_register: 'Ƙirƙira Asusun',
  title_dashboard: 'Allon Aiki',
  title_settings: 'Saituna',

  nav_home: 'Gida',
  nav_directory: 'Jagora',
  nav_marketplace: 'Kasuwa',
  nav_about: 'Game da mu',
  nav_contact: 'Tuntuɓe mu',
  nav_login: 'Shiga',
  nav_register: 'Fara',

  action_search: 'Nema',
  action_install: 'Girka',
  action_purchase: 'Saya',
  action_submit: 'Aika',
  action_cancel: 'Soke',
  action_confirm: 'Tabbatar',
  action_delete: 'Share',
  action_edit: 'Gyara',
  action_view: 'Duba',
  action_back: 'Koma',
  action_next: 'Gaba',

  status_loading: 'Ana loda…',
  status_saving: 'Ana ajiyewa…',
  status_success: 'An yi!',
  status_error: 'An sami kuskure. Da fatan za a sake gwadawa.',
  status_not_found: 'Ba a sami ba.',
  status_empty: 'Babu sakamakon da aka samu.',
  status_installed: 'An girka',
  status_free: 'Kyauta',
  status_paid: 'An biya',

  search_placeholder: 'Nemi kasuwanci, ayyuka, ko rukunoni…',
  search_no_results: 'Ba a sami kasuwanci ga "{query}".',

  auth_email: 'Adireshi na imel',
  auth_password: 'Kalmar sirri',
  auth_forgot_password: 'Manta kalmar sirri?',

  error_required: 'Ana buƙatar wannan filin.',
  error_invalid_email: 'Da fatan za a shigar da adireshi na imel ingantacce.',
  error_network: 'Kuskuren hanyar sadarwa. Da fatan za a binciki haɗin ku.',
  error_unauthorized: 'Ba ku da izini don yin wannan aiki.',

  footer_tagline: 'An gina don Afirka. WebWaka ya ƙarfafa.',
  footer_privacy: 'Manufar Sirri',
  footer_terms: 'Sharuɗɗan Amfani',

  // Notification email — N-041 Phase 3 (partial Hausa translations)
  notif_legal_footer_ndpr: 'An aika wannan saƙon ne bisa daidaiton Dokar Kare Bayanai ta Najeriya (NDPR) 2019.',
  notif_legal_footer_rights: '© {year} {company_name}. Haƙƙoƙin duk an kiyaye.',
  notif_unsubscribe_text: 'Kuna karɓar wannan saboda kuna da asusun tare da {tenant_name}.',
  notif_unsubscribe_action: 'Soke Rajista',
  notif_unsubscribe_confirmed_title: 'An soke rajistar ku',
  notif_unsubscribe_confirmed_body: 'Ba za ku ƙara karɓar sanarwa na {channel} daga {tenant_name} ba.',
  notif_unsubscribe_invalid_link: 'Wannan haɗin soke rajista bai dace ba ko kuma ya ƙare.',
  notif_powered_by: 'Ƙarfin WebWaka',
  notif_marketing_address_label: 'Adireshi ta wasika:',
  notif_too_many_emails: 'Kuna karɓar imeloli da yawa? Zaku iya sarrafa zaɓuɓɓukan sanarwa a cikin saitunan asusunka.',
};
