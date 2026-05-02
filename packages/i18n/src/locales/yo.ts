/**
 * Yoruba (yo) — Southwest Nigeria (~45M speakers in Nigeria).
 */
import type { I18nLocale } from './en.js';

export const yo: Partial<I18nLocale> = {
  title_home: 'WebWaka — A Kọ Fún Áfríkà',
  title_search: 'Ṣèwádìí Òwò',
  title_directory: 'Àtọkà Òwò',
  title_marketplace: 'Ọjà Àpẹẹrẹ',
  title_profile: 'Àlàyé Òwò',
  title_login: 'Wọlé',
  title_register: 'Ṣẹ̀dá Àkáǹtì',
  title_dashboard: 'Pánẹ̀lì Iṣẹ',
  title_settings: 'Ètò',

  nav_home: 'Ilé',
  nav_directory: 'Àtọkà',
  nav_marketplace: 'Ọjà',
  nav_about: 'Nípa Wa',
  nav_contact: 'Kan Sí Wa',
  nav_login: 'Wọlé',
  nav_register: 'Bẹrẹ',

  action_search: 'Wádìí',
  action_install: 'Fún Sínú',
  action_purchase: 'Rà',
  action_submit: 'Fi Sílẹ̀',
  action_cancel: 'Fagile',
  action_confirm: 'Jẹrìísí',
  action_delete: 'Paarẹ',
  action_edit: 'Ṣàtúnṣe',
  action_view: 'Wo',
  action_back: 'Padà',
  action_next: 'Tẹ̀síwájú',

  status_loading: 'Ń gbéru…',
  status_saving: 'Ń tọ́jú…',
  status_success: 'Ó ṣe!',
  status_error: 'Ohun kan ṣẹlẹ̀. Jọwọ gbìyànjú lẹ̀kan sí i.',
  status_not_found: 'A kò rí.',
  status_empty: 'Kò sí èsì tí a rí.',
  status_installed: 'A ti fi sínú',
  status_free: 'Ọ̀fẹ́',
  status_paid: 'A ti san',

  search_placeholder: 'Wádìí òwò, iṣẹ́, tàbí ẹ̀ka…',
  search_no_results: 'A kò rí òwò fún "{query}".',

  auth_email: 'Àdírẹ́sì iméèlì',
  auth_password: 'Ọrọ̀ àṣírí',
  auth_forgot_password: 'Gbàgbé ọrọ̀ àṣírí?',

  error_required: 'Àpápọ̀ yii nílò.',
  error_invalid_email: 'Jọwọ tẹ àdírẹ́sì iméèlì tó tọ.',
  error_network: 'Àṣìṣe nẹ́tì. Jọwọ ṣàyẹ̀wò àsopọ̀ rẹ.',
  error_unauthorized: 'O kò ní àṣẹ láti ṣe ìgbésẹ̀ yii.',

  footer_tagline: 'A kọ fún Áfríkà. WebWaka ṣe aláàánú.',
  footer_privacy: 'Ìlànà Àṣírí',
  footer_terms: 'Àwọn Ìlànà Ìlò',

  // Notification email — N-041 Phase 3 (partial Yoruba translations)
  notif_legal_footer_ndpr: 'A rán ìfítọ̀ntọ̀ yìí gẹ́gẹ́ bí ìtẹ̀lé Òfin Ìdáàbòbò Dátà ti Nàìjíríà (NDPR) 2019.',
  notif_legal_footer_rights: '© {year} {company_name}. Gbogbo ẹ̀tọ́ ni a pa mọ́.',
  notif_unsubscribe_text: 'O ń gba èyí nítorí pé o ní àkáǹtì pẹ̀lú {tenant_name}.',
  notif_unsubscribe_action: 'Yọ kúrò',
  notif_unsubscribe_confirmed_title: 'A ti yọ ọ kúrò',
  notif_unsubscribe_confirmed_body: 'Ìwọ kò ní tún gba ìwífún {channel} lọ́wọ́ {tenant_name}.',
  notif_unsubscribe_invalid_link: 'Atọ̀nà yiyọ kúrò yii kò wulo tabi ti pari.',
  notif_powered_by: 'Agbára WebWaka',
  notif_marketing_address_label: 'Àdírẹ́sì ifiweranṣẹ:',
  notif_too_many_emails: 'Ṣe o ń gba ọ̀pọ̀lọpọ̀ ìmẹ́ẹ̀lì? O lè ṣàkóso àwọn àṣàyàn ìwífún ní ètò àkáǹtì rẹ.',

  // API Error messages (L-12)
  api_err_bad_request: 'Ibeere ko to. Jowo sayewo awon ohun ti o fi sii.',
  api_err_unauthorized: 'Ko jero re. Jowo wole ki o si tun gbiyanju.',
  api_err_forbidden: 'Wole ko. O ko ni igba lati se eyi.',
  api_err_not_found: 'A ko ri ohun ti a wa.',
  api_err_conflict: 'Ohun ini yii ti wa tele.',
  api_err_validation_failed: 'Idanwo kunfa. Jowo sayewo awon ohun ti o fi sii.',
  api_err_rate_limit_exceeded: 'Ibeere pupo ju. Jowo duro fun iseru die.',
  api_err_payload_too_large: 'Ibeere tobi ju. Jowo dinkun iwon naa.',
  api_err_internal_error: 'Asise selele. Jowo tun gbiyanju leyin naa.',
  api_err_service_unavailable: 'Isee ko wa fun igba die. Jowo tun gbiyanju laipe.',
  api_err_email_required: 'A nilo imeeli ati owo asiri.',
  api_err_invalid_credentials: 'Imeeli tabi owo asiri ko to.',
  api_err_account_locked: 'Akosile ti di ti fun igba die.',
  api_err_email_exists: 'Akosile pelu imeeli yii ti wa.',
  api_err_business_name_short: 'Oruko isee gbodo ni o kere ju awon ede 2.',
  api_err_invalid_email: 'Jowo te adireeesi imeeli to to.',
};