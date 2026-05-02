/**
 * French (fr) — Stub locale for P24 West Africa expansion.
 * Covers Francophone West Africa: Senegal, Côte d'Ivoire, Mali, Cameroon, Benin, Togo, Niger, Guinea.
 *
 * STUB: Only partial translations provided for P24. Full translation to be
 * completed in P26 (Francophone West Africa expansion milestone).
 * Keys not translated here fall back to English via the i18n resolution chain.
 *
 * Priority keys: payment, bank transfer, and commerce flows needed for CFA currency support.
 */
import type { I18nLocale } from './en.js';

export const fr: Partial<I18nLocale> = {
  // Page titles
  title_home: 'WebWaka — Conçu pour l\'Afrique',
  title_search: 'Rechercher des Entreprises',
  title_directory: 'Annuaire des Entreprises',
  title_marketplace: 'Marché des Modèles',
  title_profile: 'Profil d\'Entreprise',
  title_login: 'Se Connecter',
  title_register: 'Créer un Compte',
  title_dashboard: 'Tableau de Bord',
  title_settings: 'Paramètres',
  title_analytics: 'Analytique',
  title_payments: 'Paiements',
  title_bank_transfer: 'Virement Bancaire',

  // Navigation
  nav_home: 'Accueil',
  nav_directory: 'Annuaire',
  nav_marketplace: 'Marché',
  nav_about: 'À propos',
  nav_contact: 'Contact',
  nav_login: 'Connexion',
  nav_register: 'Commencer',

  // Common actions
  action_search: 'Rechercher',
  action_install: 'Installer',
  action_purchase: 'Acheter',
  action_submit: 'Envoyer',
  action_cancel: 'Annuler',
  action_confirm: 'Confirmer',
  action_delete: 'Supprimer',
  action_edit: 'Modifier',
  action_view: 'Voir',
  action_back: 'Retour',
  action_next: 'Suivant',
  action_upload: 'Téléverser',
  action_download: 'Télécharger',
  action_approve: 'Approuver',
  action_reject: 'Rejeter',
  action_send: 'Envoyer',

  // Status
  status_loading: 'Chargement…',
  status_saving: 'Enregistrement…',
  status_success: 'Fait !',
  status_error: 'Quelque chose s\'est mal passé. Veuillez réessayer.',
  status_not_found: 'Introuvable.',
  status_empty: 'Aucun résultat.',
  status_installed: 'Installé',
  status_free: 'Gratuit',
  status_paid: 'Payant',
  status_pending: 'En attente',
  status_confirmed: 'Confirmé',
  status_rejected: 'Rejeté',
  status_expired: 'Expiré',
  status_processing: 'Traitement en cours…',

  // Bank Transfer (P21 — priority for CFA currency support)
  bank_transfer_title: 'Paiement par Virement Bancaire',
  bank_transfer_instructions: 'Transférez le montant indiqué sur le compte fourni, puis téléversez votre preuve de paiement.',
  bank_transfer_amount: 'Montant à Transférer',
  bank_transfer_bank_name: 'Nom de la Banque',
  bank_transfer_account_number: 'Numéro de Compte',
  bank_transfer_account_name: 'Nom du Compte',
  bank_transfer_reference: 'Référence de Paiement',
  bank_transfer_upload_proof: 'Téléverser la Preuve de Paiement',
  bank_transfer_submit_proof: 'Soumettre la Preuve',
  bank_transfer_awaiting_confirmation: 'En attente de confirmation du vendeur…',
  bank_transfer_confirmed: 'Paiement confirmé.',
  bank_transfer_expired: 'Ce lien de paiement a expiré. Veuillez créer une nouvelle commande.',

  // Auth
  auth_email: 'Adresse email',
  auth_password: 'Mot de passe',
  auth_forgot_password: 'Mot de passe oublié ?',
  auth_no_account: 'Pas encore de compte ?',
  auth_have_account: 'Vous avez déjà un compte ?',

  // Errors
  error_required: 'Ce champ est obligatoire.',
  error_invalid_email: 'Veuillez entrer une adresse email valide.',
  error_network: 'Erreur réseau. Vérifiez votre connexion.',
  error_unauthorized: 'Vous n\'êtes pas autorisé à effectuer cette action.',
  error_forbidden: 'Accès refusé.',

  // Multi-currency (P24 — CFA priority)
  currency_display: 'Devise d\'Affichage',
  currency_ngn: 'Naira Nigérian (₦)',
  currency_ghs: 'Cedi Ghanéen (GH₵)',
  currency_kes: 'Shilling Kényan (KSh)',
  currency_usd: 'Dollar Américain ($)',
  currency_zar: 'Rand Sud-Africain (R)',
  currency_cfa: 'Franc CFA Ouest-Africain (CFA)',
  currency_usdt: 'Tether USDT',
  currency_rate_note: 'Les montants affichés sont des conversions approximatives. Le règlement se fait en NGN.',

  // Footer
  footer_tagline: 'Conçu pour l\'Afrique. Propulsé par WebWaka.',
  footer_privacy: 'Politique de Confidentialité',
  footer_terms: 'Conditions d\'Utilisation',
  footer_contact: 'Contactez-nous',

  // Notification email — N-041 Phase 3 (French translations)
  notif_legal_footer_ndpr: 'Cette communication est envoyée conformément au Règlement nigérian sur la protection des données (NDPR) 2019.',
  notif_legal_footer_rights: '© {year} {company_name}. Tous droits réservés.',
  notif_unsubscribe_text: 'Vous recevez ceci parce que vous avez un compte chez {tenant_name}.',
  notif_unsubscribe_action: 'Se désabonner',
  notif_unsubscribe_confirmed_title: 'Vous avez été désabonné',
  notif_unsubscribe_confirmed_body: 'Vous ne recevrez plus les notifications {channel} de {tenant_name}.',
  notif_unsubscribe_invalid_link: 'Ce lien de désabonnement est invalide ou a expiré.',
  notif_powered_by: 'Propulsé par WebWaka',
  notif_marketing_address_label: 'Adresse postale :',
  notif_too_many_emails: 'Vous recevez trop d\'e-mails ? Vous pouvez gérer vos préférences de notification dans les paramètres de votre compte.',

  // API Error messages (L-12)
  api_err_bad_request: 'Requete incorrecte. Veuillez verifier vos donnees.',
  api_err_unauthorized: 'Non autorise. Veuillez vous connecter et reessayer.',
  api_err_forbidden: 'Acces refuse. Vous n\'avez pas la permission.',
  api_err_not_found: 'La ressource demandee est introuvable.',
  api_err_conflict: 'Cette ressource existe deja.',
  api_err_validation_failed: 'Validation echouee. Veuillez corriger vos donnees.',
  api_err_rate_limit_exceeded: 'Trop de requetes. Veuillez patienter et reessayer.',
  api_err_payload_too_large: 'Requete trop volumineuse. Veuillez reduire la taille.',
  api_err_internal_error: 'Une erreur inattendue s\'est produite. Reessayez plus tard.',
  api_err_service_unavailable: 'Service temporairement indisponible. Reessayez bientot.',
  api_err_email_required: 'L\'email et le mot de passe sont requis.',
  api_err_invalid_credentials: 'Email ou mot de passe incorrect.',
  api_err_account_locked: 'Compte temporairement verrouille. Reessayez plus tard.',
  api_err_email_exists: 'Un compte avec cet email existe deja.',
  api_err_business_name_short: 'Le nom de l\'entreprise doit comporter au moins 2 caracteres.',
  api_err_invalid_email: 'Veuillez entrer une adresse email valide.',
};