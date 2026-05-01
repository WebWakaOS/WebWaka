/**
 * Theme helpers — read CSS custom properties from the active theme.
 * Provides programmatic access to the CSS vars defined in global.css,
 * enabling inline-styled components to respond to dark/light mode.
 *
 * Usage:
 *   import { isDarkMode, themeVar } from '@/lib/theme';
 *   const bg = themeVar('--ww-surface');   // '#ffffff' or '#161b22' depending on theme
 */

/**
 * Returns true if the current theme is dark mode.
 */
export function isDarkMode(): boolean {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

/**
 * Read a computed CSS custom property value.
 * Falls back gracefully if called server-side.
 */
export function themeVar(name: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/**
 * Pre-defined semantic color getters that use CSS custom properties.
 * These stay correct when the theme changes.
 */
export const theme = {
  /** Main page background */
  bg:        () => themeVar('--ww-bg',        '#f8f9fa'),
  /** Card / surface background */
  surface:   () => themeVar('--ww-surface',   '#ffffff'),
  /** Slightly elevated surface */
  surface2:  () => themeVar('--ww-surface-2', '#f9fafb'),
  /** Border color */
  border:    () => themeVar('--ww-border',    '#e5e7eb'),
  /** Primary text color */
  text:      () => themeVar('--ww-text',      '#111827'),
  /** Muted/secondary text */
  textMuted: () => themeVar('--ww-text-muted','#6b7280'),
  /** Subtle/placeholder text */
  textSubtle:() => themeVar('--ww-text-subtle','#9ca3af'),
  /** Brand primary color */
  primary:   () => themeVar('--ww-primary',   '#0F4C81'),
};
