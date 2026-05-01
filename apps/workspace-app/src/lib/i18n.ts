/**
 * Lightweight i18n for workspace-app.
 * Supports en-NG (English) and pcm (Nigerian Pidgin).
 * Uses CSS data-attribute for persistence and zero React deps at module level.
 *
 * Usage:
 *   import { t, useI18n } from '@/lib/i18n';
 *   const label = t('nav.home'); // 'Home' or 'Home' (pcm same for this key)
 *
 *   // In a component:
 *   const { locale, setLocale } = useI18n();
 */
import { useState, useEffect } from 'react';

export type Locale = 'en' | 'pcm';

const LOCALE_KEY = 'ww_locale';

// Workspace-app specific strings (subset of full platform locale)
const STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    'nav.dashboard':  'Dashboard',
    'nav.ai':         'AI Assistant',
    'nav.pos':        'Point of Sale',
    'nav.offerings':  'Offerings',
    'nav.vertical':   'My Vertical',
    'nav.wakapage':   'WakaPage',
    'nav.billing':    'Billing',
    'nav.settings':   'Settings',
    'nav.platform':   'Platform Admin',
    'nav.partner':    'Partner Portal',
    'greeting.morning':   'Good morning',
    'greeting.afternoon': 'Good afternoon',
    'greeting.evening':   'Good evening',
    'dashboard.revenue_today':  'Revenue today',
    'dashboard.orders_today':   'Orders today',
    'dashboard.active_offerings': 'Active offerings',
    'dashboard.plan':           'Plan',
    'dashboard.new_sale':       'New sale',
    'dashboard.add_offering':   'Add offering',
    'dashboard.vertical_view':  'Vertical view',
    'dashboard.ai_advisory':    'AI Advisory',
    'dashboard.recent_sales':   'Recent sales',
    'dashboard.quick_actions':  'Quick actions',
    'pos.search_placeholder':   'Search products…',
    'pos.empty_cart':           'Tap a product to add it',
    'pos.confirm_sale':         'Confirm sale',
    'pos.payment_method':       'Payment method',
    'billing.current_plan':     'Current plan',
    'billing.upgrade':          'Upgrade plan',
    'settings.title':           'Settings',
    'settings.profile':         'Profile',
    'settings.notifications':   'Notifications',
    'settings.security':        'Security',
    'settings.appearance':      'Appearance',
    'common.save':              'Save changes',
    'common.cancel':            'Cancel',
    'common.loading':           'Loading…',
    'common.error':             'Something went wrong.',
  },
  pcm: {
    'nav.dashboard':  'Home',
    'nav.ai':         'AI Helper',
    'nav.pos':        'Sell Tings',
    'nav.offerings':  'My Products',
    'nav.vertical':   'My Business',
    'nav.wakapage':   'My Page',
    'nav.billing':    'Pay Bill',
    'nav.settings':   'Settings',
    'nav.platform':   'Admin Area',
    'nav.partner':    'Partner Zone',
    'greeting.morning':   'E don morning',
    'greeting.afternoon': 'Good afternoon',
    'greeting.evening':   'E don evening',
    'dashboard.revenue_today':  'Money wey enter today',
    'dashboard.orders_today':   'Orders today',
    'dashboard.active_offerings': 'Tings wey dey sell',
    'dashboard.plan':           'Your Plan',
    'dashboard.new_sale':       'New Sale',
    'dashboard.add_offering':   'Add Product',
    'dashboard.vertical_view':  'My Business Profile',
    'dashboard.ai_advisory':    'Ask AI',
    'dashboard.recent_sales':   'Recent Sales',
    'dashboard.quick_actions':  'Quick Links',
    'pos.search_placeholder':   'Search your products…',
    'pos.empty_cart':           'Tap product to add am',
    'pos.confirm_sale':         'Confirm Sale',
    'pos.payment_method':       'How dem go pay',
    'billing.current_plan':     'Your Plan',
    'billing.upgrade':          'Upgrade your plan',
    'settings.title':           'Settings',
    'settings.profile':         'Your Profile',
    'settings.notifications':   'Notifications',
    'settings.security':        'Security',
    'settings.appearance':      'How e Look',
    'common.save':              'Save',
    'common.cancel':            'Cancel',
    'common.loading':           'Loading…',
    'common.error':             'Wahala dey o.',
  },
};

function getStoredLocale(): Locale {
  try {
    const val = localStorage.getItem(LOCALE_KEY);
    if (val === 'en' || val === 'pcm') return val;
  } catch {/* ignore */}
  return 'en';
}

function setStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.setAttribute('lang', locale === 'pcm' ? 'pcm' : 'en-NG');
  } catch {/* ignore */}
}

// Module-level current locale (updated by hook)
let _current: Locale = getStoredLocale();

/** Translate a key to the current locale. Falls back to English if missing. */
export function t(key: string, params?: Record<string, string | number>): string {
  let str = STRINGS[_current]?.[key] ?? STRINGS['en']?.[key] ?? key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{\\{${k}\\}}`, 'g'), String(v));
    });
  }
  return str;
}

export function getCurrentLocale(): Locale {
  return _current;
}

/** React hook — returns locale state and setter. Triggers re-render on change. */
export function useI18n() {
  const [locale, setLocaleState] = useState<Locale>(_current);

  useEffect(() => {
    // Set HTML lang attribute on mount
    document.documentElement.setAttribute('lang', locale === 'pcm' ? 'pcm' : 'en-NG');
  }, [locale]);

  const setLocale = (l: Locale) => {
    _current = l;
    setLocaleState(l);
    setStoredLocale(l);
  };

  return { locale, setLocale };
}
