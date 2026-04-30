/**
 * Internationalization Error Messages (L-12)
 *
 * Provides localized error messages for API responses based on
 * Accept-Language header. Supports: en, fr, yo, ha, ig, sw.
 *
 * Usage:
 *   import { getErrorMessage } from './i18n-errors.js';
 *   const msg = getErrorMessage('auth.unauthorized', lang);
 */

export type SupportedLanguage = 'en' | 'fr' | 'yo' | 'ha' | 'ig' | 'sw';

export const ERROR_MESSAGES: Record<string, Record<SupportedLanguage, string>> = {
  'auth.unauthorized': {
    en: 'Authentication required. Please log in.',
    fr: 'Authentification requise. Veuillez vous connecter.',
    yo: 'O nilo ìdánimọ̀. Jọwọ wọlé.',
    ha: 'Ana buƙatar tabbatarwa. Da fatan za a shiga.',
    ig: 'A chọrọ nkwenye. Biko banye.',
    sw: 'Uthibitisho unahitajika. Tafadhali ingia.',
  },
  'auth.forbidden': {
    en: 'You do not have permission to perform this action.',
    fr: 'Vous n\'avez pas la permission d\'effectuer cette action.',
    yo: 'O kò ní àṣẹ láti ṣe iṣẹ́ yìí.',
    ha: 'Ba ku da izinin aiwatar da wannan aikin.',
    ig: 'Ị nweghị ikike ịme ihe a.',
    sw: 'Huna ruhusa ya kufanya kitendo hiki.',
  },
  'rate_limit.exceeded': {
    en: 'Too many requests. Please wait before trying again.',
    fr: 'Trop de requêtes. Veuillez patienter avant de réessayer.',
    yo: 'Àwọn ìbéèrè pọ̀ jù. Jọwọ dúró kí o tó gbìyànjú lẹ́ẹ̀kan sí.',
    ha: 'Buƙatun da yawa. Da fatan za a jira kafin sake gwadawa.',
    ig: 'Arịrịọ dị ọtụtụ. Biko chere tupu ị nwaa ọzọ.',
    sw: 'Maombi mengi sana. Tafadhali subiri kabla ya kujaribu tena.',
  },
  'validation.required_field': {
    en: 'This field is required.',
    fr: 'Ce champ est obligatoire.',
    yo: 'Pápá yìí jẹ́ dandan.',
    ha: 'Ana buƙatar wannan filin.',
    ig: 'A chọrọ ubi a.',
    sw: 'Sehemu hii inahitajika.',
  },
  'entity.not_found': {
    en: 'The requested resource was not found.',
    fr: 'La ressource demandée est introuvable.',
    yo: 'Ohun tí a béèrè kò sí.',
    ha: 'Ba a sami albarkatun da aka buƙata ba.',
    ig: 'Ahụghị ihe a chọrọ.',
    sw: 'Rasilimali iliyoombwa haikupatikana.',
  },
  'payment.failed': {
    en: 'Payment processing failed. Please try again.',
    fr: 'Le traitement du paiement a échoué. Veuillez réessayer.',
    yo: 'Ìṣọ̀wọ́ owó kùnà. Jọwọ gbìyànjú lẹ́ẹ̀kan sí.',
    ha: 'Biyan kuɗi ya gaza. Da fatan za a sake gwadawa.',
    ig: 'Ịkwụ ụgwọ dara. Biko nwaa ọzọ.',
    sw: 'Usindikaji wa malipo umeshindwa. Tafadhali jaribu tena.',
  },
  'workspace.suspended': {
    en: 'Your workspace is suspended. Please renew your subscription.',
    fr: 'Votre espace de travail est suspendu. Veuillez renouveler votre abonnement.',
    yo: 'Àyè iṣẹ́ rẹ ti dáwọ́ dúró. Jọwọ tún ìforọwọ́sí rẹ ṣe.',
    ha: 'An dakatar da wurin aikin ku. Da fatan za a sabunta biyan kuɗin ku.',
    ig: 'Ekwentụghị ọrụ gị. Biko gbanwee ndenye aha gị.',
    sw: 'Nafasi yako ya kazi imesimamishwa. Tafadhali fanya upya usajili wako.',
  },
};

/**
 * Get a localized error message.
 *
 * @param key - Error message key (e.g., 'auth.unauthorized')
 * @param lang - Language code from Accept-Language header
 * @returns Localized message, falls back to English
 */
export function getErrorMessage(key: string, lang: string | undefined): string {
  const messages = ERROR_MESSAGES[key];
  if (!messages) return key;

  // Parse language code (e.g., 'en-GB' → 'en', 'yo-NG' → 'yo')
  const primary = (lang || 'en').split('-')[0]!.toLowerCase() as SupportedLanguage;

  return messages[primary] || messages.en;
}

/**
 * Parse Accept-Language header to extract preferred language.
 * Returns the first supported language, or 'en' as default.
 */
export function parseAcceptLanguage(header: string | undefined): SupportedLanguage {
  if (!header) return 'en';

  const supported: SupportedLanguage[] = ['en', 'fr', 'yo', 'ha', 'ig', 'sw'];

  // Parse quality values: "en-US,en;q=0.9,yo;q=0.8"
  const langs = header.split(',').map((part) => {
    const [lang, qPart] = part.trim().split(';');
    const q = qPart ? parseFloat(qPart.replace('q=', '')) : 1.0;
    const primary = lang!.split('-')[0]!.toLowerCase();
    return { lang: primary as SupportedLanguage, q };
  });

  // Sort by quality descending
  langs.sort((a, b) => b.q - a.q);

  // Return first supported language
  for (const { lang } of langs) {
    if (supported.includes(lang)) return lang;
  }

  return 'en';
}
