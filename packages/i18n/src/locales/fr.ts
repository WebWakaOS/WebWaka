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
};
