/**
 * i18nErrorResponse — locale-aware API error responses (L-12)
 *
 * Wraps the existing errorResponse() function with locale detection so that
 * API error messages are returned in the user's preferred language.
 *
 * Supported locales: en, ha (Hausa), yo (Yoruba), ig (Igbo), pcm (Naija Pidgin), fr
 * Locale detection order: ?lang= > Accept-Language header > default en
 *
 * Usage in Hono handlers:
 *   import { i18nError } from '@webwaka/shared-config';
 *   const locale = c.get('locale') ?? 'en';
 *   return c.json(i18nError('unauthorized', locale), 401);
 *
 * Usage without Hono context:
 *   const locale = detectLocale(request);
 *   return i18nError('not_found', locale);
 */

import { ErrorCode, ErrorCodeValue, errorResponse } from './error-response.js';
import type { ApiErrorResponse } from './error-response.js';

// Map ErrorCode values to i18n keys — lazily evaluated to avoid SSR circular
// module initialisation issues when this file is re-exported via a barrel that
// also exports error-response.ts (Vite 8 + Vitest 1.x interop).
let _ERROR_CODE_TO_I18N_KEY: Record<string, string> | undefined;
function getErrorCodeMap(): Record<string, string> {
  if (!_ERROR_CODE_TO_I18N_KEY) {
    _ERROR_CODE_TO_I18N_KEY = {
      [ErrorCode.BadRequest]: 'api_err_bad_request',
      [ErrorCode.Unauthorized]: 'api_err_unauthorized',
      [ErrorCode.Forbidden]: 'api_err_forbidden',
      [ErrorCode.NotFound]: 'api_err_not_found',
      [ErrorCode.Conflict]: 'api_err_conflict',
      [ErrorCode.ValidationFailed]: 'api_err_validation_failed',
      [ErrorCode.RateLimitExceeded]: 'api_err_rate_limit_exceeded',
      [ErrorCode.PayloadTooLarge]: 'api_err_payload_too_large',
      [ErrorCode.InternalError]: 'api_err_internal_error',
      [ErrorCode.ServiceUnavailable]: 'api_err_service_unavailable',
    };
  }
  return _ERROR_CODE_TO_I18N_KEY;
}

// Inline minimal translations for API error keys
// (avoids a circular dep on @webwaka/i18n at this package level)
type ApiErrorKey =
  | 'api_err_bad_request'
  | 'api_err_unauthorized'
  | 'api_err_forbidden'
  | 'api_err_not_found'
  | 'api_err_conflict'
  | 'api_err_validation_failed'
  | 'api_err_rate_limit_exceeded'
  | 'api_err_payload_too_large'
  | 'api_err_internal_error'
  | 'api_err_service_unavailable';

export type SupportedApiLocale = 'en' | 'ha' | 'yo' | 'ig' | 'pcm' | 'fr';

const API_ERROR_MESSAGES: Record<SupportedApiLocale, Record<ApiErrorKey, string>> = {
  en: {
    api_err_bad_request: 'Bad request. Please check your input.',
    api_err_unauthorized: 'You are not authorised. Please sign in and try again.',
    api_err_forbidden: 'Access denied. You do not have permission to do this.',
    api_err_not_found: 'The requested resource was not found.',
    api_err_conflict: 'This resource already exists.',
    api_err_validation_failed: 'Validation failed. Please check your input and try again.',
    api_err_rate_limit_exceeded: 'Too many requests. Please wait a moment and try again.',
    api_err_payload_too_large: 'Request is too large. Please reduce the size and try again.',
    api_err_internal_error: 'An unexpected error occurred. Please try again later.',
    api_err_service_unavailable: 'Service temporarily unavailable. Please try again shortly.',
  },
  ha: {
    api_err_bad_request: 'Bukatar da ba ta dace ba. Da fatan za a duba shigarwar ku.',
    api_err_unauthorized: 'Ba a ba ku izini ba. Da fatan za a shiga kuma ku sake gwadawa.',
    api_err_forbidden: 'An hana shiga. Ba ku da izinin yin wannan.',
    api_err_not_found: 'Ba a sami albarkatun da aka nema ba.',
    api_err_conflict: 'Wannan albarkatun yana wanzu tuni.',
    api_err_validation_failed: 'Tabbatarwa ta kasa. Da fatan za a bincika shigarwar ku.',
    api_err_rate_limit_exceeded: 'Bukatoci da yawa. Da fatan za a jira kadan sannan ku sake gwadawa.',
    api_err_payload_too_large: 'Bukatar ta yi girma. Da fatan za a rage girman.',
    api_err_internal_error: 'An sami kuskure. Da fatan za a sake gwadawa daga baya.',
    api_err_service_unavailable: 'Sabis ba ya aiki na dan lokaci. Sake gwadawa.',
  },
  yo: {
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
  },
  ig: {
    api_err_bad_request: 'Ariao ojoo. Biko lelee ihe i tinye.',
    api_err_unauthorized: 'A anaghị ikwe gi. Biko banye wee nwaa ozoo.',
    api_err_forbidden: 'Enweghị ikike. I enweghị ike ime nke a.',
    api_err_not_found: 'Achọtaghị ihe a choroo.',
    api_err_conflict: 'Ihe a adịlarị.',
    api_err_validation_failed: 'Nnwale ojoo. Biko lelee ihe i tinye.',
    api_err_rate_limit_exceeded: 'Ariao ọtụtụ ọnụ. Biko chere obere oge.',
    api_err_payload_too_large: 'Ariao ka ukwuu. Biko belata ogo ya.',
    api_err_internal_error: 'Mperi emeela. Biko nwaa ozoo.',
    api_err_service_unavailable: 'Oru anaghị arụ oru ugbu a. Biko nwaa ozoo.',
  },
  pcm: {
    api_err_bad_request: 'Dis request no good. Abeg check wetin you enter.',
    api_err_unauthorized: 'You no get permission. Abeg login come try again.',
    api_err_forbidden: 'You no fit do dis one.',
    api_err_not_found: 'We no fit find wetin you dey look for.',
    api_err_conflict: 'Dis thing don already dey.',
    api_err_validation_failed: 'Something no correct. Abeg check your input.',
    api_err_rate_limit_exceeded: 'Too many requests. Abeg wait small come try again.',
    api_err_payload_too_large: 'Your request too big. Abeg reduce am.',
    api_err_internal_error: 'Something just happen. Abeg try again later.',
    api_err_service_unavailable: 'Service no dey work now. Try again soon.',
  },
  fr: {
    api_err_bad_request: 'Requete incorrecte. Veuillez verifier vos donnees.',
    api_err_unauthorized: "Non autorise. Veuillez vous connecter et reessayer.",
    api_err_forbidden: "Acces refuse. Vous n'avez pas la permission.",
    api_err_not_found: 'La ressource demandee est introuvable.',
    api_err_conflict: 'Cette ressource existe deja.',
    api_err_validation_failed: 'Validation echouee. Veuillez corriger vos donnees.',
    api_err_rate_limit_exceeded: 'Trop de requetes. Veuillez patienter et reessayer.',
    api_err_payload_too_large: 'Requete trop volumineuse. Veuillez reduire la taille.',
    api_err_internal_error: "Une erreur inattendue s'est produite. Reessayez plus tard.",
    api_err_service_unavailable: 'Service temporairement indisponible. Reessayez bientot.',
  },
};

/**
 * Returns a localised error message for an ErrorCode.
 * Falls back to English if the locale or key is not found.
 */
export function getLocalizedErrorMessage(
  code: ErrorCodeValue,
  locale: SupportedApiLocale = 'en',
): string {
  const i18nKey = getErrorCodeMap()[code] as ApiErrorKey | undefined;
  if (!i18nKey) {
    return API_ERROR_MESSAGES.en.api_err_internal_error;
  }
  const messages = API_ERROR_MESSAGES[locale] ?? API_ERROR_MESSAGES.en;
  return messages[i18nKey] ?? API_ERROR_MESSAGES.en[i18nKey];
}

/**
 * Creates a localised API error response.
 * When an explicit `message` is supplied, it is used as-is (English-language
 * context-specific detail). The localised message is placed in `message` only
 * when no override is supplied.
 *
 * @param code    - ErrorCode enum value
 * @param locale  - SupportedApiLocale (from Accept-Language / ?lang= detection)
 * @param message - Optional override message (uses i18n if omitted)
 * @param details - Optional validation details
 * @param requestId - Optional correlation ID
 */
export function i18nErrorResponse(
  code: ErrorCodeValue,
  locale: SupportedApiLocale,
  message?: string,
  details?: unknown,
  requestId?: string,
): ApiErrorResponse {
  const localizedMessage = message ?? getLocalizedErrorMessage(code, locale);
  return errorResponse(code, localizedMessage, details, requestId);
}

/**
 * Detect the best API locale from a Hono context or raw Request.
 * Supports ?lang= query param and Accept-Language header.
 *
 * Returns a SupportedApiLocale, defaulting to 'en'.
 */
export function detectApiLocale(
  input: { headers: { get(name: string): string | null }; url?: string } | null,
  searchParams?: URLSearchParams,
): SupportedApiLocale {
  const SUPPORTED: SupportedApiLocale[] = ['en', 'ha', 'yo', 'ig', 'pcm', 'fr'];

  function isSupported(lang: string): lang is SupportedApiLocale {
    return (SUPPORTED as string[]).includes(lang.toLowerCase());
  }

  if (!input) return 'en';

  // 1. ?lang= query param
  let sp: URLSearchParams | null = searchParams ?? null;
  if (!sp && input.url) {
    try { sp = new URL(input.url).searchParams; } catch { /* ignore */ }
  }
  if (sp) {
    const lang = sp.get('lang');
    if (lang && isSupported(lang)) return lang;
  }

  // 2. Accept-Language header
  const acceptLang = input.headers.get('Accept-Language') ?? '';
  if (acceptLang) {
    const tags = acceptLang
      .split(',')
      .map((p) => {
        const [lang, q] = p.trim().split(';q=');
        return { lang: (lang ?? '').trim().toLowerCase(), q: parseFloat(q ?? '1') || 1 };
      })
      .sort((a, b) => b.q - a.q)
      .map((x) => x.lang);

    for (const tag of tags) {
      if (isSupported(tag)) return tag;
      const prefix = tag.split('-')[0] ?? '';
      if (prefix && isSupported(prefix)) return prefix;
    }
  }

  return 'en';
}
