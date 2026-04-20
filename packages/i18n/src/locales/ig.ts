/**
 * Igbo (ig) — Southeast Nigeria (~30M speakers in Nigeria).
 */
import type { I18nLocale } from './en.js';

export const ig: Partial<I18nLocale> = {
  title_home: 'WebWaka — Ewubere Maka Afrịka',
  title_search: 'Chọọ Azụmahịa',
  title_directory: 'Ndekọ Azụmahịa',
  title_marketplace: 'Ahịa Ụdị',
  title_profile: 'Ozi Azụmahịa',
  title_login: 'Banye',
  title_register: 'Mepụta Akaụntụ',
  title_dashboard: 'Nchịkọta Ọrụ',
  title_settings: 'Ntọala',

  nav_home: 'Ụlọ',
  nav_directory: 'Ndekọ',
  nav_marketplace: 'Ahịa',
  nav_about: 'Maka Anyị',
  nav_contact: 'Kpọtụrụ Anyị',
  nav_login: 'Banye',
  nav_register: 'Bido',

  action_search: 'Chọọ',
  action_install: 'Wụnye',
  action_purchase: 'Zụọ',
  action_submit: 'Zipu',
  action_cancel: 'Kagbuo',
  action_confirm: 'Nwee Ntụkwasị Obi',
  action_delete: 'Hichapụ',
  action_edit: 'Dezie',
  action_view: 'Lee',
  action_back: 'Laghachi',
  action_next: 'Gaa N\'ihu',

  status_loading: 'Na-ebugo…',
  status_saving: 'Na-echekwa…',
  status_success: 'Emechara!',
  status_error: 'Ihe mere. Biko nwaa ọzọ.',
  status_not_found: 'Achọtaghị.',
  status_empty: 'Achọtaghị ihe ọ bụla.',
  status_installed: 'Ewunyelara',
  status_free: 'Efu',
  status_paid: 'Akwụọla',

  search_placeholder: 'Chọọ azụmahịa, ọrụ, ma ọ bụ ụdị…',
  search_no_results: 'Achọtaghị azụmahịa maka "{query}".',

  auth_email: 'Adreesị email',
  auth_password: 'Okwuntughe',
  auth_forgot_password: 'Chefuo okwuntughe?',

  error_required: 'Oghere a dị mkpa.',
  error_invalid_email: 'Biko tinye adreesị email ziri ezi.',
  error_network: 'Njehie netwọk. Biko lelee njikọ gị.',
  error_unauthorized: 'Enweghị ikike ịme ihe a.',

  footer_tagline: 'Ewubere maka Afrịka. WebWaka na-eme ihe.',
  footer_privacy: 'Iwu Nzuzo',
  footer_terms: 'Usoro Ojiji',

  // Notification email — N-041 Phase 3 (partial Igbo translations)
  notif_legal_footer_ndpr: 'Ezigara ozi a na-eso Iwu Nchedo Data nke Nigeria (NDPR) 2019.',
  notif_legal_footer_rights: '© {year} {company_name}. Nduzi niile echekwara.',
  notif_unsubscribe_text: 'Ị na-anata nke a n\'ihi na ị nwere akaụntụ na {tenant_name}.',
  notif_unsubscribe_action: 'Kpochie Ndekọ',
  notif_unsubscribe_confirmed_title: 'Akpochiri ndekọ gị',
  notif_unsubscribe_confirmed_body: 'Ọ gaghị abịakwasị gị ọkwa {channel} si {tenant_name}.',
  notif_unsubscribe_invalid_link: 'Njikọ nkwụsị ndebanye aha a adịghị mma ma ọ bụ agwụọla.',
  notif_powered_by: 'WebWaka na-akwado',
  notif_marketing_address_label: 'Adreesị ozi:',
  notif_too_many_emails: 'Ị na-anata ọtụtụ email? Ị nwere ike ijikwa ọchọchọ ọkwa gị na ntọala akaụntụ gị.',
};
