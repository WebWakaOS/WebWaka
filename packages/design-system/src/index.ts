/**
 * @webwaka/design-system — [Infra] Mobile-first responsive CSS foundation.
 *
 * Exports CSS custom properties, breakpoint tokens, and utility class generators
 * for all client-facing apps. No React dependency — CSS-only primitives.
 *
 * Platform Invariants:
 *   P4 — Mobile First (360px base viewport)
 *   P1 — Build Once (shared design tokens, not duplicated per app)
 *
 * Breakpoints:
 *   base   = 0–767px    (360px design target)
 *   tablet = 768–1023px
 *   desktop = 1024px+
 */

export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
} as const;

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const TYPOGRAPHY = {
  fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  lineHeight: {
    tight: '1.25',
    base: '1.5',
    relaxed: '1.75',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const COLORS = {
  text: '#111827',
  textMuted: '#6b7280',
  bg: '#ffffff',
  bgSurface: '#f9fafb',
  border: '#e5e7eb',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
} as const;

export function generateBaseCSS(): string {
  return `/* WebWaka Design System — Mobile-First Foundation (P4) */
/* Base: 360px viewport. Tablet: 768px. Desktop: 1024px. */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--ww-font, ${TYPOGRAPHY.fontFamily});
  font-size: ${TYPOGRAPHY.fontSize.base};
  line-height: ${TYPOGRAPHY.lineHeight.base};
  color: var(--ww-text, ${COLORS.text});
  background-color: var(--ww-bg, ${COLORS.bg});
  overflow-x: hidden;
  min-height: 100dvh;
}

img, video, svg {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: var(--ww-primary, #1a6b3a);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button, input, select, textarea {
  font: inherit;
  color: inherit;
}

/* --- Container --- */
.ww-container {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: ${SPACING.md};
}

@media (min-width: ${BREAKPOINTS.tablet}px) {
  .ww-container { padding-inline: ${SPACING.lg}; }
}

@media (min-width: ${BREAKPOINTS.desktop}px) {
  .ww-container { padding-inline: ${SPACING.xl}; }
}

/* --- Stack (vertical spacing) --- */
.ww-stack { display: flex; flex-direction: column; }
.ww-stack--xs  { gap: ${SPACING.xs}; }
.ww-stack--sm  { gap: ${SPACING.sm}; }
.ww-stack--md  { gap: ${SPACING.md}; }
.ww-stack--lg  { gap: ${SPACING.lg}; }
.ww-stack--xl  { gap: ${SPACING.xl}; }

/* --- Grid --- */
.ww-grid {
  display: grid;
  gap: ${SPACING.md};
  grid-template-columns: 1fr;
}

@media (min-width: ${BREAKPOINTS.tablet}px) {
  .ww-grid--2 { grid-template-columns: repeat(2, 1fr); }
  .ww-grid--3 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: ${BREAKPOINTS.desktop}px) {
  .ww-grid--3 { grid-template-columns: repeat(3, 1fr); }
  .ww-grid--4 { grid-template-columns: repeat(4, 1fr); }
}

/* --- Row (horizontal flex) --- */
.ww-row {
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.md};
  align-items: center;
}

.ww-row--between { justify-content: space-between; }
.ww-row--center  { justify-content: center; }

/* --- Typography --- */
.ww-h1 { font-size: ${TYPOGRAPHY.fontSize['2xl']}; font-weight: ${TYPOGRAPHY.fontWeight.bold}; line-height: ${TYPOGRAPHY.lineHeight.tight}; }
.ww-h2 { font-size: ${TYPOGRAPHY.fontSize.xl}; font-weight: ${TYPOGRAPHY.fontWeight.semibold}; line-height: ${TYPOGRAPHY.lineHeight.tight}; }
.ww-h3 { font-size: ${TYPOGRAPHY.fontSize.lg}; font-weight: ${TYPOGRAPHY.fontWeight.semibold}; line-height: ${TYPOGRAPHY.lineHeight.tight}; }
.ww-body { font-size: ${TYPOGRAPHY.fontSize.base}; line-height: ${TYPOGRAPHY.lineHeight.base}; }
.ww-small { font-size: ${TYPOGRAPHY.fontSize.sm}; color: var(--ww-text-muted, ${COLORS.textMuted}); }
.ww-caption { font-size: ${TYPOGRAPHY.fontSize.xs}; color: var(--ww-text-muted, ${COLORS.textMuted}); }

@media (min-width: ${BREAKPOINTS.tablet}px) {
  .ww-h1 { font-size: ${TYPOGRAPHY.fontSize['3xl']}; }
  .ww-h2 { font-size: ${TYPOGRAPHY.fontSize['2xl']}; }
  .ww-h3 { font-size: ${TYPOGRAPHY.fontSize.xl}; }
}

@media (min-width: ${BREAKPOINTS.desktop}px) {
  .ww-h1 { font-size: ${TYPOGRAPHY.fontSize['4xl']}; }
}

/* --- Card --- */
.ww-card {
  background: var(--ww-bg, ${COLORS.bg});
  border: 1px solid var(--ww-border, ${COLORS.border});
  border-radius: var(--ww-radius, 8px);
  padding: ${SPACING.md};
  overflow: hidden;
}

@media (min-width: ${BREAKPOINTS.tablet}px) {
  .ww-card { padding: ${SPACING.lg}; }
}

/* --- Button --- */
.ww-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING.sm};
  padding: ${SPACING.sm} ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  border-radius: var(--ww-radius, 8px);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  min-height: 44px;
  min-width: 44px;
}

.ww-btn--primary {
  background-color: var(--ww-primary, #1a6b3a);
  color: #ffffff;
  border-color: var(--ww-primary, #1a6b3a);
}

.ww-btn--primary:hover {
  opacity: 0.9;
}

.ww-btn--outline {
  background-color: transparent;
  color: var(--ww-primary, #1a6b3a);
  border-color: var(--ww-border, ${COLORS.border});
}

.ww-btn--outline:hover {
  background-color: var(--ww-bg-surface, ${COLORS.bgSurface});
}

/* --- Input --- */
.ww-input {
  display: block;
  width: 100%;
  padding: ${SPACING.sm} ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.base};
  border: 1px solid var(--ww-border, ${COLORS.border});
  border-radius: var(--ww-radius, 8px);
  background: var(--ww-bg, ${COLORS.bg});
  min-height: 44px;
}

.ww-input:focus {
  outline: 2px solid var(--ww-primary, #1a6b3a);
  outline-offset: -1px;
  border-color: var(--ww-primary, #1a6b3a);
}

/* --- Utility: visually hidden --- */
.ww-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* --- Spacing utilities --- */
.ww-mt-sm { margin-top: ${SPACING.sm}; }
.ww-mt-md { margin-top: ${SPACING.md}; }
.ww-mt-lg { margin-top: ${SPACING.lg}; }
.ww-mt-xl { margin-top: ${SPACING.xl}; }
.ww-mb-sm { margin-bottom: ${SPACING.sm}; }
.ww-mb-md { margin-bottom: ${SPACING.md}; }
.ww-mb-lg { margin-bottom: ${SPACING.lg}; }
.ww-p-sm  { padding: ${SPACING.sm}; }
.ww-p-md  { padding: ${SPACING.md}; }
.ww-p-lg  { padding: ${SPACING.lg}; }

/* --- Text alignment --- */
.ww-text-center { text-align: center; }
.ww-text-right  { text-align: right; }

/* --- Display utilities --- */
.ww-hidden-mobile { display: none; }
@media (min-width: ${BREAKPOINTS.tablet}px) {
  .ww-hidden-mobile { display: initial; }
  .ww-hidden-tablet { display: none; }
}
`;
}

// Wave 3 (B3-4): Vertical engine hook
export { useVerticalEngine } from './hooks/useVerticalEngine.js';
export type { VerticalProfile, UseVerticalEngineOptions, UseVerticalEngineResult } from './hooks/useVerticalEngine.js';
